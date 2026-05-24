import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import BackendLayout from '@/layouts/backend-layout';
import { type BreadcrumbItem, type Role } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

interface UserData {
    id?: number;
    name: string;
    email: string;
    roles?: string[];
}

interface Props {
    user?: UserData;
    roles: Role[];
    currentRoles?: string[];
}

export default function UserForm({ user, roles, currentRoles }: Props) {
    const isEdit = !!user;
    const { t } = useLanguage();

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        roles: currentRoles ?? [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        isEdit ? put(`/backend/users/${user?.id}`) : post('/backend/users');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('pages.users.title', { fallback: 'User Management' }), href: '/backend/users' },
        { title: isEdit ? t('buttons.update') : t('buttons.create'), href: '#' },
    ];

    return (
        <BackendLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? t('buttons.update') : t('buttons.create')} />

            <div className="flex-1 p-4 md:p-6">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl font-bold tracking-tight">{isEdit ? t('buttons.update') : t('buttons.create')}</CardTitle>
                        <p className="text-muted-foreground text-sm">{isEdit ? t('form.updateDescription') : t('form.createDescription')}</p>
                    </CardHeader>

                    <Separator />

                    <CardContent className="pt-5">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                {/* Nama */}
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
                                    {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
                                </div>

                                {/* Email */}
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
                                    {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <Label htmlFor="password" className="mb-2 block">
                                        {t('labels.password')}
                                        {isEdit ? ` (${t('users.optional')})` : ''}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder=""
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
                                </div>

                                {/* Roles */}
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
                                    {errors.roles && <p className="mt-2 text-sm text-red-500">{errors.roles}</p>}
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <Link href="/backend/users" className="w-full sm:w-auto">
                                    <Button type="button" variant="secondary" className="w-full">
                                        {t('buttons.cancel')}
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    {processing ? t('buttons.saving') : isEdit ? t('buttons.save') : t('buttons.add')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </BackendLayout>
    );
}
