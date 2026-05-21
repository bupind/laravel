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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { PermissionFormFields, type PermissionModuleForm } from './Form';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Permission Management', href: '/backend/permissions' }];

interface PermissionChild {
    id: string;
    name: string;
    action: string;
    label: string;
    group: string | null;
    created_at?: string;
}

interface PermissionModule {
    key: string;
    module: string;
    module_label: string;
    group: string;
    children: PermissionChild[];
    created_at?: string;
}

interface CrudState {
    modal: boolean;
    mode: 'create' | 'edit' | null;
    open: boolean;
    permissions?: {
        view: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
        export: boolean;
    };
    resource?: {
        routes?: {
            index?: string;
            create?: string;
            export?: string | null;
        };
    };
}

interface FormState {
    permission?: PermissionModuleForm | null;
    groups?: string[];
    standardActions?: string[];
}

interface DatatableState {
    per_page_options?: number[];
    sortable_columns?: string[];
}

interface Props {
    permissions: PaginatedResponse<PermissionModule>;
    groups: string[];
    standardActions?: string[];
    filters?: {
        search?: string;
        group?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
        per_page?: number;
    };
    datatable?: DatatableState;
    crud?: CrudState;
    form?: FormState;
}

function buildQueryString(query: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        params.set(key, String(value));
    });
    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
}

export default function PermissionIndex({ permissions, groups, standardActions = [], filters = {}, datatable, crud, form }: Props) {
    const { t } = useLanguage();

    const canCreate = crud?.permissions?.create ?? false;
    const canUpdate = crud?.permissions?.update ?? false;
    const canDelete = crud?.permissions?.delete ?? false;
    const canExport = crud?.permissions?.export ?? false;
    const routes = crud?.resource?.routes ?? {};
    const indexRoute = routes.index ?? '/backend/permissions';
    const createRoute = routes.create ?? '/backend/permissions/create';
    const exportRoute = routes.export ?? '/backend/permissions/export';

    const activeQuery = useMemo(
        () => ({
            search: filters.search ?? '',
            group: filters.group ?? '',
            sort_by: filters.sort_by ?? 'module',
            sort_dir: filters.sort_dir ?? 'asc',
            per_page: filters.per_page ?? permissions.per_page,
        }),
        [filters, permissions.per_page],
    );

    const activeQueryString = useMemo(() => buildQueryString(activeQuery), [activeQuery]);
    const canSort = (column: string) => datatable?.sortable_columns?.includes(column) ?? false;
    const isModalOpen = Boolean(crud?.modal && crud?.open);
    const formGroups = form?.groups ?? groups;
    const formActions = form?.standardActions ?? standardActions;

    const closeModal = () => {
        router.get(indexRoute, activeQuery, { preserveScroll: true, replace: true });
    };

    const handleModalOpenChange = (open: boolean) => {
        if (!open) {
            closeModal();
        }
    };

    const columns: DataTableColumn<PermissionModule>[] = [
        {
            key: 'module',
            label: t('columns.module'),
            sortable: canSort('module'),
            render: (permission) => (
                <div className="space-y-1">
                    <div className="font-medium">{permission.module_label}</div>
                    <div className="text-muted-foreground text-xs">{permission.module}</div>
                </div>
            ),
        },
        {
            key: 'group',
            label: t('columns.group'),
            sortable: canSort('group'),
            render: (permission) => permission.group || '-',
        },
        {
            key: 'children',
            label: t('columns.permissions'),
            sortable: false,
            render: (permission) => (
                <div className="flex flex-wrap gap-1.5">
                    {permission.children.map((child) => (
                        <Badge key={child.id} variant="secondary" className="font-normal">
                            {child.label}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            key: 'created_at',
            label: t('columns.createdAt'),
            sortable: canSort('created_at'),
            render: (permission) => (permission.created_at ? new Date(permission.created_at).toLocaleString() : '-'),
        },
        ...(canUpdate || canDelete
            ? [
                  {
                      key: 'manage',
                      label: t('columns.actions'),
                      width: '72px',
                      minWidth: '72px',
                      maxWidth: '72px',
                      grow: 0,
                      right: true,
                      render: (permissionModule: PermissionModule) => (
                          <div className="flex justify-end">
                              <div className="border-border bg-background inline-flex overflow-hidden rounded-md border">
                                  {canUpdate && (
                                      <Button
                                          size="icon"
                                          variant="ghost"
                                          className="border-border h-7 w-7 rounded-none border-r"
                                          aria-label="Edit permission"
                                          title="Edit permission"
                                      >
                                          <Link href={`${indexRoute}/${encodeURIComponent(permissionModule.module)}/edit${activeQueryString}`}>
                                              <Pencil className="h-4 w-4" />
                                          </Link>
                                      </Button>
                                  )}
                                  {canDelete && (
                                      <AlertDialog>
                                          <AlertDialogTrigger>
                                              <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="text-destructive hover:text-destructive h-7 w-7 rounded-none"
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
                                                      Permission <strong>{permissionModule.module_label}</strong> will be permanently deleted.
                                                  </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                  <AlertDialogAction
                                                      className="bg-destructive hover:bg-destructive/90"
                                                      onClick={() => {
                                                          router.delete(
                                                              `/backend/permissions/modules/${encodeURIComponent(permissionModule.module)}`,
                                                              { preserveScroll: true },
                                                          );
                                                      }}
                                                  >
                                                      Delete
                                                  </AlertDialogAction>
                                              </AlertDialogFooter>
                                          </AlertDialogContent>
                                      </AlertDialog>
                                  )}
                              </div>
                          </div>
                      ),
                  } as DataTableColumn<PermissionModule>,
              ]
            : []),
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('pages.permissions.title')} />
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('pages.permissions.title')}</h1>
                    <p className="text-muted-foreground">{t('pages.permissions.description')}</p>
                </div>

                <ServerDataTable<PermissionModule>
                    endpoint={indexRoute}
                    data={permissions}
                    columns={columns}
                    keyField="key"
                    filters={activeQuery}
                    perPageOptions={datatable?.per_page_options ?? [10, 25, 50, 100]}
                    searchPlaceholder={t('pages.permissions.search')}
                    emptyMessage={t('pages.permissions.empty')}
                    exportEndpoint={canExport ? exportRoute : undefined}
                    reloadOnly={['permissions', 'groups', 'standardActions', 'filters', 'datatable', 'crud']}
                    toolbarLeft={
                        canCreate ? (
                            <Button size="sm">
                                <Link href={`${createRoute}${activeQueryString}`}>
                                    <Plus className="h-4 w-4" />
                                </Link>
                            </Button>
                        ) : undefined
                    }
                    toolbarRight={
                        <Select
                            value={activeQuery.group || '__ALL__'}
                            onValueChange={(value) => {
                                const group = value === '__ALL__' ? '' : value;
                                router.get(
                                    indexRoute,
                                    { ...activeQuery, group, page: 1 },
                                    {
                                        only: ['permissions', 'groups', 'standardActions', 'filters', 'datatable', 'crud'],
                                        preserveState: true,
                                        preserveScroll: true,
                                        replace: true,
                                    },
                                );
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
                    }
                />
            </div>

            <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{crud?.mode === 'edit' ? 'Update Permission' : 'Create Permission'}</DialogTitle>
                        <DialogDescription>Define module path, group, and privileges.</DialogDescription>
                    </DialogHeader>
                    <PermissionFormFields
                        permission={form?.permission ?? null}
                        groups={formGroups}
                        standardActions={formActions}
                        onCancel={closeModal}
                        onSuccess={closeModal}
                        shortcutOpen={isModalOpen}
                    />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
