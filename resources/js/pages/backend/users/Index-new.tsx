import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useMemo } from 'react';

import { DataTable, type PaginatedResponse } from '@/components/datatable/data-table';
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
    permissions?: {
        create?: boolean;
        update?: boolean;
        delete?: boolean;
        export?: boolean;
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
}

export default function UsersIndex({ users, roles, filters = {}, datatable, crud }: Props) {
    const { t } = useLanguage();

    const canCreate = crud?.permissions?.create ?? false;
    const canUpdate = crud?.permissions?.update ?? false;
    const canDelete = crud?.permissions?.delete ?? false;
    const canReset = crud?.permissions?.reset ?? false;
    const routes = crud?.resource?.routes ?? {};
    const indexRoute = routes.index ?? '/backend/users';
    const createRoute = routes.create ?? '/backend/users/create';

    const showActionsColumn = canUpdate || canDelete || canReset;

    const handleDelete = (id: string) => {
        router.delete(`${indexRoute}/${id}`, { preserveScroll: true });
    };

    const handleResetPassword = (id: string) => {
        router.put(`${indexRoute}/${id}/reset-password`, {}, { preserveScroll: true });
    };

    const columns = useMemo<ColumnDef<User>[]>(() => {
        const cols: ColumnDef<User>[] = [
            {
                accessorKey: 'name',
                header: t('columns.fullName'),
                cell: (info) => <div className="font-medium">{info.getValue() as string}</div>,
                enableSorting: true,
            },
            {
                accessorKey: 'email',
                header: t('columns.email'),
                cell: (info) => <div className="text-muted-foreground text-sm">{info.getValue() as string}</div>,
                enableSorting: true,
            },
            {
                accessorKey: 'roles',
                header: t('columns.role'),
                cell: (info) => {
                    const rolesData = info.getValue() as Role[];
                    return (
                        <div className="flex flex-wrap gap-1">
                            {rolesData.length === 0 ? (
                                <span className="text-muted-foreground text-xs">{t('users.noRole')}</span>
                            ) : (
                                rolesData.map((role) => (
                                    <Badge key={role.id} variant="secondary" className="rounded-sm text-xs font-normal">
                                        {role.name}
                                    </Badge>
                                ))
                            )}
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                accessorKey: 'created_at',
                header: t('columns.createdAt'),
                cell: (info) => dayjs(info.getValue() as string).format('DD MMM YYYY HH:mm'),
                enableSorting: true,
            },
        ];

        if (showActionsColumn) {
            cols.push({
                id: 'actions',
                header: t('columns.actions'),
                cell: (info) => {
                    const user = info.row.original;
                    return (
                        <div className="flex justify-end">
                            <div className="border-border bg-background inline-flex overflow-hidden rounded-md border">
                                {canUpdate && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="border-border h-7 w-7 rounded-none border-r"
                                        asChild
                                        title={t('buttons.edit')}
                                    >
                                        <Link href={`${indexRoute}/${user.id}/edit`}>
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}

                                {canReset && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="border-border h-7 w-7 rounded-none border-r"
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
                                                <AlertDialogAction onClick={() => handleResetPassword(user.id)}>
                                                    {t('users.confirmReset')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}

                                {canDelete && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive h-7 w-7 rounded-none"
                                                title={t('buttons.delete')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('dialog.delete.title')}</AlertDialogTitle>
                                                <AlertDialogDescription>{t('dialog.delete.description', { item: user.name })}</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(user.id)}>
                                                    {t('users.confirmDelete')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>
                    );
                },
                enableSorting: false,
            });
        }

        return cols;
    }, [t, canUpdate, canDelete, canReset, indexRoute, showActionsColumn]);

    return (
        <BackendLayout breadcrumbs={[{ title: t('pages.users.title', { fallback: 'User Management' }), href: '/backend/users' }]}>
            <Head title={t('pages.users.title', { fallback: 'User Management' })} />

            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('pages.users.title', { fallback: 'User Management' })}</h1>
                    <p className="text-muted-foreground">{t('pages.users.description', { fallback: 'Manage users, access, and assigned roles.' })}</p>
                </div>

                <DataTable<User, any>
                    endpoint={indexRoute}
                    data={users}
                    columns={columns}
                    filters={filters}
                    perPageOptions={datatable?.per_page_options ?? [10, 25, 50, 100]}
                    searchPlaceholder={t('users.search')}
                    emptyMessage={t('users.empty')}
                    toolbarLeft={
                        canCreate ? (
                            <Button size="sm" asChild>
                                <Link href={createRoute}>
                                    <Plus className="h-4 w-4" />
                                    {t('buttons.add')}
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />
            </div>
        </BackendLayout>
    );
}
