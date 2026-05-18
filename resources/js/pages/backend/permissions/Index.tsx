import React, { useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ServerDataTable, type DataTableColumn, type PaginatedResponse } from '@/components/datatable/server-data-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permission Management',
        href: '/backend/permissions',
    },
];

interface Permission {
    id: number;
    name: string;
    group: string | null;
    created_at?: string;
}

interface DatatableState {
    per_page_options?: number[];
    sortable_columns?: string[];
}

interface Props {
    permissions: PaginatedResponse<Permission>;
    groups: string[];
    filters?: {
        search?: string;
        group?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
        per_page?: number;
    };
    datatable?: DatatableState;
}

function buildQueryString(query: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }

        params.set(key, String(value));
    });

    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
}

export default function PermissionIndex({ permissions, groups, filters = {}, datatable }: Props) {
    const activeQuery = useMemo(() => ({
        search: filters.search ?? '',
        group: filters.group ?? '',
        sort_by: filters.sort_by ?? 'created_at',
        sort_dir: filters.sort_dir ?? 'desc',
        per_page: filters.per_page ?? permissions.per_page,
    }), [filters, permissions.per_page]);

    const activeQueryString = useMemo(() => buildQueryString(activeQuery), [activeQuery]);
    const canSort = (column: string) => datatable?.sortable_columns?.includes(column) ?? false;

    const columns: DataTableColumn<Permission>[] = [
        {
            key: 'name',
            label: 'Permission',
            sortable: canSort('name'),
            render: (permission) => <div className="font-medium">{permission.name}</div>,
        },
        {
            key: 'group',
            label: 'Group',
            sortable: canSort('group'),
            render: (permission) => permission.group || '-',
        },
        {
            key: 'created_at',
            label: 'Created At',
            sortable: canSort('created_at'),
            render: (permission) => (permission.created_at ? new Date(permission.created_at).toLocaleString() : '-'),
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '72px',
            minWidth: '72px',
            maxWidth: '72px',
            grow: 0,
            right: true,
            render: (permission) => (
                <div className="flex justify-end">
                    <div className="inline-flex overflow-hidden rounded-md border border-border bg-background">
                        <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-none border-r border-border"
                            aria-label="Edit permission"
                            title="Edit permission"
                        >
                            <Link href={`/backend/permissions/${permission.id}/edit${activeQueryString}`}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-none text-destructive hover:text-destructive"
                                    aria-label="Delete permission"
                                    title="Delete permission"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this permission?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Permission <strong>{permission.name}</strong> will be permanently deleted.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={() => {
                                        router.delete(`/backend/permissions/${permission.id}`, {
                                            preserveScroll: true,
                                        });
                                    }}
                                >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permission Management" />
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Permission Management</h1>
                    <p className="text-muted-foreground">Manage permissions with server-side filtering and pagination.</p>
                </div>

                <ServerDataTable<Permission>
                    endpoint="/backend/permissions"
                    data={permissions}
                    columns={columns}
                    filters={activeQuery}
                    perPageOptions={datatable?.per_page_options ?? [10, 25, 50, 100]}
                    searchPlaceholder="Search permission..."
                    emptyMessage="No permission data available."
                    exportEndpoint="/backend/permissions/export"
                    reloadOnly={['permissions', 'groups', 'filters', 'datatable']}
                    toolbarLeft={(
                        <Button asChild size="sm">
                            <Link href={`/backend/permissions/create${activeQueryString}`}>
                                <Plus className="h-4 w-4" />
                                Add Permission
                            </Link>
                        </Button>
                    )}
                    toolbarRight={(
                        <Select
                            value={activeQuery.group || '__ALL__'}
                            onValueChange={(value) => {
                                const group = value === '__ALL__' ? '' : value;
                                router.get('/backend/permissions', { ...activeQuery, group, page: 1 }, {
                                    only: ['permissions', 'groups', 'filters', 'datatable'],
                                    preserveState: true,
                                    preserveScroll: true,
                                    replace: true,
                                });
                            }}
                        >
                            <SelectTrigger className="h-9 w-[200px]">
                                <SelectValue placeholder="All groups" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__ALL__">All groups</SelectItem>
                                {groups.map((group) => (
                                    <SelectItem key={group} value={group}>
                                        {group}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
        </AppLayout>
    );
}
