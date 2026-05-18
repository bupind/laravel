import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ServerDataTable, type DataTableColumn, type PaginatedResponse } from '@/components/datatable/server-data-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role Management',
        href: '/backend/roles',
    },
];

interface Role {
    id: number;
    name: string;
    permissions_count: number;
    created_at: string;
}

interface DatatableState {
    per_page_options?: number[];
    sortable_columns?: string[];
}

interface Props {
    roles: PaginatedResponse<Role>;
    filters?: {
        search?: string;
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

export default function RoleIndex({ roles, filters = {}, datatable }: Props) {
    const { delete: destroy, processing } = useForm();

    const activeQuery = useMemo(() => ({
        search: filters.search ?? '',
        sort_by: filters.sort_by ?? 'created_at',
        sort_dir: filters.sort_dir ?? 'desc',
        per_page: filters.per_page ?? roles.per_page,
    }), [filters, roles.per_page]);

    const activeQueryString = useMemo(() => buildQueryString(activeQuery), [activeQuery]);
    const canSort = (column: string) => datatable?.sortable_columns?.includes(column) ?? false;

    const columns: DataTableColumn<Role>[] = [
        {
            key: 'name',
            label: 'Role',
            sortable: canSort('name'),
            render: (role) => <div className="font-medium">{role.name}</div>,
        },
        {
            key: 'permissions_count',
            label: 'Permissions',
            sortable: canSort('permissions_count'),
            render: (role) => <Badge variant="secondary">{role.permissions_count}</Badge>,
        },
        {
            key: 'created_at',
            label: 'Created At',
            sortable: canSort('created_at'),
            render: (role) => new Date(role.created_at).toLocaleString(),
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '72px',
            minWidth: '72px',
            maxWidth: '72px',
            grow: 0,
            right: true,
            render: (role) => (
                <div className="flex justify-end">
                    <div className="inline-flex overflow-hidden rounded-md border border-border bg-background">
                        <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-none border-r border-border"
                            aria-label="Edit role"
                            title="Edit role"
                        >
                            <Link href={`/backend/roles/${role.id}/edit${activeQueryString}`}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-none text-destructive hover:text-destructive"
                                    aria-label="Delete role"
                                    title="Delete role"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Role <strong>{role.name}</strong> will be permanently deleted.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => destroy(`/backend/roles/${role.id}`, { preserveScroll: true })}
                                        disabled={processing}
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
            <Head title="Role Management" />
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
                    <p className="text-muted-foreground">Manage roles with server-side pagination and search.</p>
                </div>

                <ServerDataTable<Role>
                    endpoint="/backend/roles"
                    data={roles}
                    columns={columns}
                    filters={activeQuery}
                    perPageOptions={datatable?.per_page_options ?? [10, 25, 50, 100]}
                    searchPlaceholder="Search role..."
                    emptyMessage="No role data available."
                    reloadOnly={['roles', 'filters', 'datatable']}
                    toolbarLeft={(
                        <Button asChild size="sm">
                            <Link href={`/backend/roles/create${activeQueryString}`}>
                                <Plus className="h-4 w-4" />
                                Add Role
                            </Link>
                        </Button>
                    )}
                />
            </div>
        </AppLayout>
    );
}
