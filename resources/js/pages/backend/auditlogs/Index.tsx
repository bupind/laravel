import { ServerDataTable, type DataTableColumn, type PaginatedResponse } from '@/components/datatable/server-data-table';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Download, RefreshCw, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

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

interface Props {
    logs: PaginatedResponse<LogItem>;
    filters?: { search?: string; event?: string; sort_by?: string; sort_dir?: 'asc' | 'desc'; per_page?: number };
    datatable?: { per_page_options?: number[]; sortable_columns?: string[] };
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
    const s = params.toString();
    return s ? `?${s}` : '';
}

export default function AuditLogIndex({ logs, filters = {}, datatable, crud }: Props) {
    const { t } = useLanguage();

    const canExport = crud?.permissions?.export ?? false;
    const canDeleteAll = crud?.permissions?.delete_all ?? crud?.permissions?.delete ?? false;
    const routes = crud?.resource?.routes ?? {};
    const indexRoute = routes.index ?? '/backend/audit-logs';
    const exportRoute = routes.export ?? '/backend/audit-logs/export';
    const deleteAllRoute = routes.delete_all ?? '/backend/audit-logs/delete-all';

    const activeQuery = useMemo(
        () => ({
            search: filters.search ?? '',
            event: filters.event ?? '',
            sort_by: filters.sort_by ?? 'created_at',
            sort_dir: filters.sort_dir ?? 'desc',
            per_page: filters.per_page ?? logs.per_page,
        }),
        [filters, logs.per_page],
    );

    const activeQueryString = useMemo(() => buildQueryString(activeQuery), [activeQuery]);
    const canSort = (col: string) => datatable?.sortable_columns?.includes(col) ?? false;

    const applyFilter = (params: Record<string, string | number>) => {
        router.get(indexRoute, { ...activeQuery, ...params }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const columns: DataTableColumn<LogItem>[] = [
        {
            key: 'event',
            label: t('columns.event'),
            sortable: canSort('event'),
            render: (log) => (
                <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                        EVENT_COLORS[log.event ?? ''] ?? 'bg-gray-100 text-gray-600'
                    }`}
                >
                    {log.event ?? 'unknown'}
                </span>
            ),
        },
        {
            key: 'description',
            label: t('columns.description'),
            sortable: false,
            render: (log) => <span className="block max-w-[240px] truncate">{log.description}</span>,
        },
        {
            key: 'subject_type',
            label: t('columns.subject'),
            sortable: false,
            render: (log) => (
                <span className="text-muted-foreground">{log.subject_type ? `${log.subject_type.split('\\').pop()} #${log.subject_id}` : '-'}</span>
            ),
        },
        {
            key: 'causer',
            label: t('columns.user'),
            sortable: false,
            render: (log) =>
                log.causer ? (
                    <div>
                        <div className="font-medium">{log.causer.name}</div>
                        <div className="text-muted-foreground text-xs">{log.causer.email}</div>
                    </div>
                ) : (
                    <span className="text-muted-foreground">{t('labels.system')}</span>
                ),
        },
        {
            key: 'created_at',
            label: t('columns.time'),
            sortable: canSort('created_at'),
            render: (log) => <span className="text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString('id-ID')}</span>,
        },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: t('pages.auditLogs.title'), href: '/backend/audit-logs' }]}>
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
                                    {t('buttons.export')}
                                </a>
                            </Button>
                        )}

                        {canDeleteAll && logs.total > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-1.5 h-4 w-4" />
                                        {t('buttons.deleteAll')}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('pages.auditLogs.deleteAllTitle')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('pages.auditLogs.deleteAllDescription', { total: logs.total.toLocaleString() })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive/90"
                                            onClick={() =>
                                                router.delete(`${deleteAllRoute}${activeQueryString}`, {
                                                    preserveScroll: true,
                                                })
                                            }
                                        >
                                            {t('buttons.deleteAll')}
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

                <ServerDataTable<LogItem>
                    endpoint={indexRoute}
                    data={logs}
                    columns={columns}
                    keyField="id"
                    filters={activeQuery}
                    perPageOptions={datatable?.per_page_options ?? [10, 20, 50, 100]}
                    searchPlaceholder={t('pages.auditLogs.search')}
                    emptyMessage={t('pages.auditLogs.empty')}
                    reloadOnly={['logs', 'filters', 'datatable', 'crud']}
                    toolbarRight={
                        <Select
                            value={activeQuery.event || '__all__'}
                            onValueChange={(v) => applyFilter({ event: v === '__all__' ? '' : v, page: 1 })}
                        >
                            <SelectTrigger className="h-9 w-[150px]">
                                <SelectValue placeholder={t('labels.event')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">{t('labels.allEvents')}</SelectItem>
                                <SelectItem value="created">{t('labels.created')}</SelectItem>
                                <SelectItem value="updated">{t('labels.updated')}</SelectItem>
                                <SelectItem value="deleted">{t('labels.deleted')}</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                />
            </div>
        </AppLayout>
    );
}
