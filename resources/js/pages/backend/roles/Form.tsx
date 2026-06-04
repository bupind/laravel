import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import BackendLayout from '@/layouts/backend-layout';
import { type BreadcrumbItem, type Permission } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useMemo } from 'react';

interface RoleData {
    id?: number;
    name: string;
    permissions?: Permission[];
}

interface Props {
    role?: RoleData;
    groupedPermissions: Record<string, Permission[]>;
}

const actionOrder: Record<string, number> = {
    view: 1,
    create: 2,
    update: 3,
    edit: 3,
    delete: 4,
    reset: 5,
};

function splitPermissionName(name: string) {
    const parts = name.split('-');

    if (parts.length < 2) {
        return {
            module: name,
            action: 'view',
        };
    }

    const action = parts.pop() ?? 'view';

    return {
        module: parts.join('-'),
        action,
    };
}

function formatPermissionLabel(value: string) {
    return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function RoleForm({ role, groupedPermissions }: Props) {
    const { t } = useLanguage();
    const isEdit = !!role;

    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name ?? '',
        permissions: role?.permissions?.map((p) => p.name) ?? [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        isEdit ? put(`/backend/roles/${role?.id}`) : post('/backend/roles');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('pages.roles.title', { fallback: 'Role Management' }), href: '/backend/roles' },
        { title: isEdit ? t('buttons.update') : t('buttons.create'), href: '#' },
    ];

    const permissionGroups = useMemo(
        () =>
            Object.entries(groupedPermissions).map(([group, permissions]) => {
                const modules = permissions.reduce<Record<string, { module: string; label: string; children: Permission[] }>>((carry, permission) => {
                    const parts = splitPermissionName(permission.name);

                    carry[parts.module] ??= {
                        module: parts.module,
                        label: formatPermissionLabel(parts.module),
                        children: [],
                    };

                    carry[parts.module].children.push(permission);

                    return carry;
                }, {});

                return {
                    group,
                    modules: Object.values(modules)
                        .map((module) => ({
                            ...module,
                            children: module.children.sort((a, b) => {
                                const first = splitPermissionName(a.name).action;
                                const second = splitPermissionName(b.name).action;

                                return (actionOrder[first] ?? 99) - (actionOrder[second] ?? 99) || a.name.localeCompare(b.name);
                            }),
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label)),
                };
            }),
        [groupedPermissions],
    );

    const togglePermission = (permName: string) => {
        setData(
            'permissions',
            data.permissions.includes(permName) ? data.permissions.filter((p) => p !== permName) : [...data.permissions, permName],
        );
    };

    const toggleGroup = (perms: Permission[]) => {
        const permNames = perms.map((p) => p.name);
        const allChecked = permNames.every((name) => data.permissions.includes(name));

        setData(
            'permissions',
            allChecked ? data.permissions.filter((p) => !permNames.includes(p)) : [...new Set([...data.permissions, ...permNames])],
        );
    };

    return (
        <BackendLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? t('buttons.update') : t('buttons.create')} />

            <div className="flex-1 p-4 md:p-6">
                <Card className="mx-auto max-w-4xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl font-bold tracking-tight">{isEdit ? t('buttons.update') : t('buttons.create')}</CardTitle>
                        <p className="text-muted-foreground text-sm">{t('pages.roles.formDescription')}</p>
                    </CardHeader>

                    <Separator />

                    <CardContent className="pt-5">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div>
                                <Label htmlFor="name" className="mb-2 block">
                                    {t('pages.roles.nameLabel')}
                                </Label>
                                <Input
                                    id="name"
                                    placeholder={t('pages.roles.namePlaceholder')}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <Separator />

                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold">{t('pages.roles.permissions')}</h2>
                                    <p className="text-muted-foreground text-sm">{t('pages.roles.permissionsDescription')}</p>
                                </div>

                                <div className="space-y-4">
                                    {permissionGroups.map(({ group, modules }) => {
                                        const groupPermissions = modules.flatMap((module) => module.children);
                                        const allChecked = groupPermissions.every((perm) => data.permissions.includes(perm.name));
                                        const someChecked = groupPermissions.some((perm) => data.permissions.includes(perm.name));

                                        return (
                                            <div key={group} className="bg-muted/20 rounded-lg border p-4">
                                                <div className="mb-4 flex items-center gap-3">
                                                    <Checkbox
                                                        id={`group-${group}`}
                                                        checked={allChecked}
                                                        ref={(el) => {
                                                            if (el) {
                                                                (el as HTMLInputElement).indeterminate = someChecked && !allChecked;
                                                            }
                                                        }}
                                                        onCheckedChange={() => toggleGroup(groupPermissions)}
                                                    />
                                                    <label
                                                        htmlFor={`group-${group}`}
                                                        className="text-muted-foreground cursor-pointer text-sm font-medium tracking-wider uppercase"
                                                    >
                                                        {group}
                                                    </label>
                                                </div>

                                                <div className="space-y-3 pl-7">
                                                    {modules.map((module) => {
                                                        const allModuleChecked = module.children.every((perm) =>
                                                            data.permissions.includes(perm.name),
                                                        );
                                                        const someModuleChecked = module.children.some((perm) =>
                                                            data.permissions.includes(perm.name),
                                                        );

                                                        return (
                                                            <div key={module.module} className="bg-background rounded-md border p-3">
                                                                <div className="mb-3 flex items-center gap-3">
                                                                    <Checkbox
                                                                        id={`module-${group}-${module.module}`}
                                                                        checked={allModuleChecked}
                                                                        ref={(el) => {
                                                                            if (el) {
                                                                                (el as HTMLInputElement).indeterminate =
                                                                                    someModuleChecked && !allModuleChecked;
                                                                            }
                                                                        }}
                                                                        onCheckedChange={() => toggleGroup(module.children)}
                                                                    />
                                                                    <label
                                                                        htmlFor={`module-${group}-${module.module}`}
                                                                        className="cursor-pointer text-sm font-medium"
                                                                    >
                                                                        {module.label}
                                                                    </label>
                                                                </div>
                                                                <div className="grid grid-cols-1 gap-3 pl-7 sm:grid-cols-2 md:grid-cols-4">
                                                                    {module.children.map((perm) => {
                                                                        const action = splitPermissionName(perm.name).action;

                                                                        return (
                                                                            <div key={perm.id} className="flex items-center gap-3">
                                                                                <Checkbox
                                                                                    id={`perm-${perm.id}`}
                                                                                    checked={data.permissions.includes(perm.name)}
                                                                                    onCheckedChange={() => togglePermission(perm.name)}
                                                                                />
                                                                                <label htmlFor={`perm-${perm.id}`} className="cursor-pointer text-sm">
                                                                                    {formatPermissionLabel(action)}
                                                                                </label>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <Link href="/backend/roles" className="w-full sm:w-auto">
                                    <Button type="button" variant="secondary" className="w-full">
                                        {t('buttons.cancel')}
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    {processing ? t('buttons.saving') : t('buttons.save')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </BackendLayout>
    );
}
