import { type DataTableColumn, type PaginatedResponse, ServerDataTable } from '@/components/datatable/server-data-table';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { usePermissions } from '@/hooks/use-permissions';
import BackendLayout from '@/layouts/backend-layout';
import { type Role } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

interface RoleRow extends Role {
    permissions_count: number;
    created_at: string;
}

interface DatatableState {
    per_page_options?: number[];
    sortable_columns?: string[];
}

interface Props {
    roles: PaginatedResponse<RoleRow>;
    filters?: {
        search?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
        per_page?: number;
    };
    datatable?: DatatableState;
}

function buildQueryString(query: Record<string, string | number | undefined>): string {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        params.set(key, String(value));
    });
    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
}

export default function RoleIndex({ roles, filters = {}, datatable }: Props) {
    const { t } = useLanguage();
    const { can } = usePermissions();
    const { delete: destroy, processing } = useForm();

    const canCreate = can('roles-create');
    const canUpdate = can('roles-update');
    const canDelete = can('roles-delete');

    const activeQuery = useMemo(
        () => ({
            search: filters.search ?? '',
            sort_by: filters.sort_by ?? 'created_at',
            sort_dir: filters.sort_dir ?? 'desc',
            per_page: filters.per_page ?? roles.per_page,
        }),
        [filters, roles.per_page],
    );

    const activeQueryString = useMemo(() => buildQueryString(activeQuery), [activeQuery]);
    const canSort = (column: string) => datatable?.sortable_columns?.includes(column) ?? false;

    const columns: DataTableColumn<RoleRow>[] = [
        {
            key: 'name',
            label: t('columns.role'),
            sortable: canSort('name'),
            render: (role) => <div className="font-medium">{role.name}</div>,
        },
        {
            key: 'permissions_count',
            label: t('columns.permissions'),
            sortable: canSort('permissions_count'),
            render: (role) => <Badge variant="secondary">{role.permissions_count}</Badge>,
        },
        {
            key: 'created_at',
            label: t('columns.createdAt'),
            sortable: canSort('created_at'),
            render: (role) => new Date(role.created_at).toLocaleString('id-ID'),
        },
        ...(canUpdate || canDelete
            ? [
                  {
                      key: 'actions',
                      label: t('columns.actions'),
                      width: '72px',
                      minWidth: '72px',
                      maxWidth: '72px',
                      grow: 0,
                      right: true,
                      render: (role: RoleRow) => (
                          <div className="flex justify-end">
                              <div className="border-border bg-background inline-flex overflow-hidden rounded-md border">
                                  {canUpdate && (
                                      <Button
                                          size="icon"
                                          variant="ghost"
                                          className="border-border h-7 w-7 rounded-none border-r"
                                          aria-label={t('buttons.edit')}
                                          title={t('buttons.edit')}
                                      >
                                          <Link href={`/backend/roles/${role.id}/edit${activeQueryString}`}>
                                              <Pencil className="h-4 w-4" />
                                          </Link>
                                      </Button>
                                  )}

                                  {canDelete && (
                                      <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                              <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="text-destructive hover:text-destructive h-7 w-7 rounded-none"
                                                  aria-label={t('buttons.delete')}
                                                  title={t('buttons.delete')}
                                              >
                                                  <Trash2 className="h-4 w-4" />
                                              </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                              <AlertDialogHeader>
                                                  <AlertDialogTitle>{t('dialog.delete.title')}</AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                      {t('dialog.delete.description', { item: role.name })}
                                                  </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                  <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                                  <AlertDialogAction
                                                      onClick={() => destroy(`/backend/roles/${role.id}`, { preserveScroll: true })}
                                                      disabled={processing}
                                                  >
                                                      {t('buttons.delete')}
                                                  </AlertDialogAction>
                                              </AlertDialogFooter>
                                          </AlertDialogContent>
                                      </AlertDialog>
                                  )}
                              </div>
                          </div>
                      ),
                  } as DataTableColumn<RoleRow>,
              ]
            : []),
    ];

    return (
        <BackendLayout breadcrumbs={[{ title: t('pages.roles.title', { fallback: 'Role Management' }), href: '/backend/roles' }]}>
            <Head title={t('pages.roles.title', { fallback: 'Role Management' })} />

            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('pages.roles.title', { fallback: 'Role Management' })}</h1>
                    <p className="text-muted-foreground">
                        {t('pages.roles.description', { fallback: 'Manage user roles and assigned permissions.' })}
                    </p>
                </div>

                <ServerDataTable<RoleRow>
                    endpoint="/backend/roles"
                    data={roles}
                    columns={columns}
                    filters={activeQuery}
                    perPageOptions={datatable?.per_page_options ?? [10, 25, 50, 100]}
                    searchPlaceholder={t('pages.roles.search')}
                    emptyMessage={t('pages.roles.empty')}
                    reloadOnly={['roles', 'filters', 'datatable']}
                    toolbarLeft={
                        canCreate ? (
                            <Button size="sm">
                                <Link href={`/backend/roles/create${activeQueryString}`}>
                                    <Plus className="h-4 w-4" />
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />
            </div>
        </BackendLayout>
    );
}
