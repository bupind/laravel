import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Download, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Audit Logs', href: '/backend/audit-logs' }];

interface LogItem {
    id: string;
    description: string;
    event: string | null;
    subject_type: string | null;
    subject_id: string | number | null;
    causer: { id: string; name: string; email: string } | null;
    properties: Record<string, unknown>;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    logs: {
        data: LogItem[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        links: PaginationLink[];
    };
    filters?: { search?: string; event?: string; per_page?: number };
    datatable?: { per_page_options?: number[] };
    crud?: {
        permissions?: {
            view: boolean;
            create: boolean;
            update: boolean;
            delete: boolean;
            export: boolean;
            delete_all?: boolean;
        };
        resource?: {
            routes?: {
                index?: string;
                export?: string | null;
                delete_all?: string | null;
            };
        };
    };
}

const EVENT_COLORS: Record<string, string> = {
    created: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    deleted: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

function buildQueryString(query: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        params.set(key, String(value));
    });
    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
}

export default function AuditLogIndex({ logs, filters = {}, datatable, crud }: Props) {
    const { t } = useLanguage();
    const [search, setSearch] = useState(filters.search ?? '');
    const canExport = crud?.permissions?.export ?? false;
    const canDeleteAll = crud?.permissions?.delete_all ?? crud?.permissions?.delete ?? false;
    const routes = crud?.resource?.routes ?? {};
    const indexRoute = routes.index ?? '/backend/audit-logs';
    const exportRoute = routes.export ?? '/backend/audit-logs/export';
    const deleteAllRoute = routes.delete_all ?? '/backend/audit-logs/delete-all';
    const activeQuery = {
        search: filters.search ?? '',
        event: filters.event ?? '',
        per_page: filters.per_page ?? 20,
    };
    const activeQueryString = buildQueryString(activeQuery);
    const perPageOptions = datatable?.per_page_options ?? [10, 20, 50, 100];

    const applyFilter = (params: Record<string, string | number>) => {
        router.get(
            indexRoute,
            {
                ...activeQuery,
                ...params,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('pages.auditLogs.title')} />
            <div className="space-y-4 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('pages.auditLogs.title')}</h1>
                        <p className="text-muted-foreground text-sm">{t('pages.auditLogs.description', { total: logs.total.toLocaleString() })}</p>
                    </div>
                    <div className="flex gap-2">
                        {canExport && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={`${exportRoute}${activeQueryString}`}>
                                    <Download className="mr-1.5 h-4 w-4" />
                                    Export
                                </a>
                            </Button>
                        )}
                        {canDeleteAll && logs.total > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-1.5 h-4 w-4" />
                                        Delete All
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete all audit logs?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete {logs.total.toLocaleString()} audit log records.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive/90"
                                            onClick={() => router.delete(`${deleteAllRoute}${activeQueryString}`, { preserveScroll: true })}
                                        >
                                            Delete All
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => router.reload()}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilter({ search, page: 1 });
                        }}
                    >
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('pages.auditLogs.search')}
                            className="h-9 w-[260px]"
                        />
                        <Button type="submit" size="sm">
                            Search
                        </Button>
                    </form>
                    <Select value={filters.event || '__all__'} onValueChange={(v) => applyFilter({ event: v === '__all__' ? '' : v, page: 1 })}>
                        <SelectTrigger className="h-9 w-[150px]">
                            <SelectValue placeholder="Event" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All events</SelectItem>
                            <SelectItem value="created">Created</SelectItem>
                            <SelectItem value="updated">Updated</SelectItem>
                            <SelectItem value="deleted">Deleted</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={String(filters.per_page ?? 20)} onValueChange={(v) => applyFilter({ per_page: Number(v), page: 1 })}>
                        <SelectTrigger className="h-9 w-[110px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {perPageOptions.map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="border-border overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-border bg-muted/50 border-b">
                                <tr>
                                    <th className="text-muted-foreground px-4 py-3 text-left font-medium">{t('columns.event')}</th>
                                    <th className="text-muted-foreground px-4 py-3 text-left font-medium">{t('columns.description')}</th>
                                    <th className="text-muted-foreground px-4 py-3 text-left font-medium">{t('columns.subject')}</th>
                                    <th className="text-muted-foreground px-4 py-3 text-left font-medium">{t('columns.user')}</th>
                                    <th className="text-muted-foreground px-4 py-3 text-left font-medium">{t('columns.time')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-muted-foreground px-4 py-8 text-center">
                                            {t('pages.auditLogs.empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/30 transition">
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${EVENT_COLORS[log.event ?? ''] ?? 'bg-gray-100 text-gray-600'}`}
                                                >
                                                    {log.event ?? 'unknown'}
                                                </span>
                                            </td>
                                            <td className="max-w-[240px] truncate px-4 py-3">{log.description}</td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                {log.subject_type ? `${log.subject_type.split('\\').pop()} #${log.subject_id}` : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {log.causer ? (
                                                    <div>
                                                        <div className="font-medium">{log.causer.name}</div>
                                                        <div className="text-muted-foreground text-xs">{log.causer.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">System</span>
                                                )}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {logs.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => {
                                    if (link.url) router.visit(link.url, { preserveScroll: true });
                                }}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
