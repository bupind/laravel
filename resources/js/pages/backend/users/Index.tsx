import { Head, Link, router, useForm } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useMemo } from 'react';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/use-language';
import { useModalShortcuts } from '@/hooks/use-modal-shortcuts';
import BackendLayout from '@/layouts/backend-layout';
import { type Role } from '@/types';
import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';

dayjs.extend(relativeTime);
dayjs.locale('id');

interface User {
    id: string;
    name: string;
    email: string;
    created_at: string;
    roles: Role[];
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
        reset?: boolean;
    };
    resource?: {
        routes?: {
            index?: string;
            create?: string;
            store?: string;
            export?: string | null;
        };
    };
}

interface FormState {
    user?: { id: string; name: string; email: string } | null;
    currentRoles?: string[];
}

interface DatatableState {
    per_page_options?: number[];
    sortable_columns?: string[];
}

interface Props {
    users: PaginatedResponse<User>;
    roles: Role[];
    filters?: { search?: string; sort_by?: string; sort_dir?: 'asc' | 'desc'; per_page?: number };
    datatable?: DatatableState;
    crud?: CrudState;
    form?: FormState;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
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

export default function UserIndex({ users, roles, filters = {}, datatable, crud, form }: Props) {
    const { t } = useLanguage();

    const canCreate = crud?.permissions?.create ?? false;
    const canUpdate = crud?.permissions?.update ?? false;
    const canDelete = crud?.permissions?.delete ?? false;
    const canExport = crud?.permissions?.export ?? false;
    const canReset = crud?.permissions?.reset ?? false;
    const routes = crud?.resource?.routes ?? {};
    const indexRoute = routes.index ?? '/backend/users';
    const createRoute = routes.create ?? '/backend/users/create';
    const storeRoute = routes.store ?? '/backend/users';
    const exportRoute = routes.export ?? '/backend/users/export';

    const {
        delete: destroy,
        processing,
        data,
        setData,
        post,
        put,
        errors,
        reset,
    } = useForm({
        name: '',
        email: '',
        password: '',
        roles: [] as string[],
    });

    const isModalOpen = Boolean(crud?.modal && crud?.open);
    const isEdit = crud?.mode === 'edit' && Boolean(form?.user?.id);

    const activeQuery = useMemo(
        () => ({
            search: filters.search ?? '',
            sort_by: filters.sort_by ?? 'created_at',
            sort_dir: filters.sort_dir ?? 'desc',
            per_page: filters.per_page ?? users.per_page,
        }),
        [filters, users.per_page],
    );

    const activeQueryString = useMemo(() => buildQueryString(activeQuery), [activeQuery]);
    const canSort = (column: string) => datatable?.sortable_columns?.includes(column) ?? false;

    useEffect(() => {
        if (!crud?.modal) return;
        setData({
            name: form?.user?.name ?? '',
            email: form?.user?.email ?? '',
            password: '',
            roles: form?.currentRoles ?? [],
        });
    }, [crud?.modal, crud?.mode, form?.currentRoles, form?.user?.email, form?.user?.id, form?.user?.name, setData]);

    const handleDelete = (id: string) => destroy(`${indexRoute}/${id}`, { preserveScroll: true });
    const handleResetPassword = (id: string) => router.put(`${indexRoute}/${id}/reset-password`, {}, { preserveScroll: true });

    const handleModalOpenChange = (open: boolean) => {
        if (!open) {
            reset();
            router.get(indexRoute, activeQuery, { preserveScroll: true, replace: true });
        }
    };

    const submitForm = () => {
        if (isEdit && form?.user?.id) {
            put(`${indexRoute}/${form.user.id}`, { preserveScroll: true });
            return;
        }
        post(storeRoute, { preserveScroll: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitForm();
    };

    useModalShortcuts({
        open: isModalOpen,
        onSubmit: submitForm,
        onClose: () => handleModalOpenChange(false),
        disabled: processing,
    });

    const showActionsColumn = canUpdate || canDelete || canReset;

    const columns: DataTableColumn<User>[] = [
        {
            key: 'name',
            label: t('columns.fullName'),
            sortable: canSort('name'),
            render: (user) => (
                <div className="flex items-start gap-3">
                    <div className="space-y-1">
                        <div className="font-medium">{user.name}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            label: t('columns.email'),
            sortable: canSort('name'),
            render: (user) => (
                <div className="flex items-start gap-3">
                    <div className="text-muted-foreground text-sm">{user.email}</div>
                </div>
            ),
        },
        {
            key: 'roles',
            label: t('columns.role'),
            render: (user) => (
                <div className="flex flex-wrap gap-1">
                    {user.roles.length === 0 ? (
                        <span className="text-muted-foreground text-xs">{t('users.noRole')}</span>
                    ) : (
                        user.roles.map((role) => (
                            <Badge key={role.id} variant="secondary" className="text-xs font-normal rounded-sm">
                                {role.name}
                            </Badge>
                        ))
                    )}
                </div>
            ),
        },
        {
            key: 'created_at',
            label: t('columns.createdAt'),
            sortable: canSort('created_at'),
            render: (user) => dayjs(user.created_at).format('DD MMM YYYY HH:mm'),
        },
        ...(showActionsColumn
            ? [
                  {
                      key: 'actions',
                      label: t('columns.actions'),
                      width: '96px',
                      minWidth: '96px',
                      maxWidth: '96px',
                      grow: 0,
                      right: true,
                      render: (user: User) => (
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
                                          <Link href={`${indexRoute}/${user.id}/edit${activeQueryString}`}>
                                              <Pencil className="h-4 w-4" />
                                          </Link>
                                      </Button>
                                  )}

                                  {canReset && (
                                      <AlertDialog>
                                          <AlertDialogTrigger>
                                              <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="border-border h-7 w-7 rounded-none border-r"
                                                  aria-label={t('users.reset')}
                                                  title={t('users.reset')}
                                              >
                                                  <KeyRound className="h-4 w-4" />
                                              </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                              <AlertDialogHeader>
                                                  <AlertDialogTitle>{t('users.resetTitle')}</AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                      {t('users.resetDescription', { name: user.name })}
                                                      <br />
                                                      <code className="bg-muted mt-1 inline-block rounded px-2 py-1 text-sm">
                                                          {t('users.resetDefaultPassword')}
                                                      </code>
                                                  </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                  <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                                  <AlertDialogAction onClick={() => handleResetPassword(user.id)} disabled={processing}>
                                                      {t('users.confirmReset')}
                                                  </AlertDialogAction>
                                              </AlertDialogFooter>
                                          </AlertDialogContent>
                                      </AlertDialog>
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
                                                      {t('dialog.delete.description', { item: user.name })}
                                                  </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                  <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                                  <AlertDialogAction onClick={() => handleDelete(user.id)} disabled={processing}>
                                                      {t('users.confirmDelete')}
                                                  </AlertDialogAction>
                                              </AlertDialogFooter>
                                          </AlertDialogContent>
                                      </AlertDialog>
                                  )}
                              </div>
                          </div>
                      ),
                  } as DataTableColumn<User>,
              ]
            : []),
    ];

    return (
        <BackendLayout breadcrumbs={[{ title: t('pages.users.title', { fallback: 'User Management' }), href: '/backend/users' }]}>
            <Head title={t('pages.users.title', { fallback: 'User Management' })} />

            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('pages.users.title', { fallback: 'User Management' })}</h1>
                    <p className="text-muted-foreground">{t('pages.users.description', { fallback: 'Manage users, access, and assigned roles.' })}</p>
                </div>

                <ServerDataTable<User>
                    endpoint={indexRoute}
                    data={users}
                    columns={columns}
                    filters={activeQuery}
                    perPageOptions={datatable?.per_page_options ?? [10, 25, 50, 100]}
                    searchPlaceholder={t('users.search')}
                    emptyMessage={t('users.empty')}
                    exportEndpoint={canExport ? exportRoute : undefined}
                    reloadOnly={['users', 'filters', 'datatable', 'crud']}
                    toolbarLeft={
                        canCreate ? (
                            <Button size="sm">
                                <Link href={`${createRoute}${activeQueryString}`}>
                                    <Plus className="h-4 w-4" />
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />
            </div>

            {/* Modal Create/Edit */}
            <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? t('buttons.update') : t('buttons.create')}</DialogTitle>
                        <DialogDescription>{isEdit ? t('form.updateDescription') : t('form.createDescription')}</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="mb-2 block">
                                {t('labels.name')}
                            </Label>
                            <Input
                                id="name"
                                placeholder={t('labels.name')}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="email" className="mb-2 block">
                                {t('labels.email')}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('users.emailAddress')}
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="password" className="mb-2 block">
                                {t('labels.password')}
                                {isEdit ? ` (${t('users.optional')})` : ''}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div>
                            <Label className="mb-3 block">{t('columns.role')}</Label>
                            <div className="space-y-3 rounded-lg border p-4">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`role-${role.id}`}
                                            checked={data.roles.includes(role.name)}
                                            onCheckedChange={(checked) => {
                                                setData(
                                                    'roles',
                                                    checked === true ? [...data.roles, role.name] : data.roles.filter((r) => r !== role.name),
                                                );
                                            }}
                                        />
                                        <Label htmlFor={`role-${role.id}`} className="cursor-pointer text-sm font-normal">
                                            {role.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {errors.roles && <p className="mt-1 text-sm text-red-500">{errors.roles}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => handleModalOpenChange(false)}>
                                {t('buttons.cancel')}
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? t('buttons.saving') : isEdit ? t('buttons.save') : t('buttons.add')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </BackendLayout>
    );
}
