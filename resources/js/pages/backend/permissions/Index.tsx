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
import BackendLayout from '@/layouts/backend-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { PermissionFormFields, type PermissionModuleForm } from './Form';

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
                <div className="flex flex-wrap gap-1">
                    {permission.children.map((child) => (
                        <Badge key={child.id} variant="secondary" className="font-normal rounded-sm">
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
                                          aria-label={t('buttons.edit')}
                                          title={t('buttons.edit')}
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
                                                      {t('dialog.delete.description', { item: permissionModule.module_label })}
                                                  </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                  <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                                  <AlertDialogAction
                                                      className="bg-destructive hover:bg-destructive/90"
                                                      onClick={() => {
                                                          router.delete(
                                                              `/backend/permissions/modules/${encodeURIComponent(permissionModule.module)}`,
                                                              { preserveScroll: true },
                                                          );
                                                      }}
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
                  } as DataTableColumn<PermissionModule>,
              ]
            : []),
    ];

    return (
        <BackendLayout breadcrumbs={[{ title: t('pages.permissions.title', { fallback: 'Permission Management' }), href: '/backend/permissions' }]}>
            <Head title={t('pages.permissions.title', { fallback: 'Permission Management' })} />
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('pages.permissions.title', { fallback: 'Permission Management' })}</h1>
                    <p className="text-muted-foreground">
                        {t('pages.permissions.description', { fallback: 'Manage permission modules, groups, and privileges.' })}
                    </p>
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
                                <SelectValue placeholder={t('pages.permissions.allGroups')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__ALL__">{t('pages.permissions.allGroups')}</SelectItem>
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
                        <DialogTitle>{crud?.mode === 'edit' ? t('buttons.update') : t('buttons.create')}</DialogTitle>
                        <DialogDescription>{t('pages.permissions.formDescription')}</DialogDescription>
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
        </BackendLayout>
    );
}
