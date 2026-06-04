import { FormTextField } from '@/components/forms/form-fields';
import { FormMultiSelect } from '@/components/forms/form-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useInertiaFormWithSchema } from '@/hooks/use-inertia-form';
import { useLanguage } from '@/hooks/use-language';
import BackendLayout from '@/layouts/backend-layout';
import { type UserFormData, userSchema } from '@/lib/validation-schemas';
import { type BreadcrumbItem, type Role } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { z } from 'zod';

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

const userUpdateSchema = userSchema.extend({
    password: z.string().optional().default(''),
});

export default function UserForm({ user, roles, currentRoles }: Props) {
    const isEdit = !!user;
    const { t } = useLanguage();

    const schema = isEdit ? userUpdateSchema : userSchema;

    const form = useInertiaFormWithSchema<UserFormData>({
        schema,
        endpoint: isEdit ? `/backend/users/${user?.id}` : '/backend/users',
        method: isEdit ? 'put' : 'post',
        defaultValues: {
            name: user?.name ?? '',
            email: user?.email ?? '',
            password: '',
            roles: currentRoles ?? [],
        },
        onSuccess: () => {
            router.visit('/backend/users', { preserveState: false });
        },
    });

    const handleSubmit = form.handleSubmit;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('pages.users.title', { fallback: 'User Management' }), href: '/backend/users' },
        { title: isEdit ? t('buttons.update') : t('buttons.create'), href: '#' },
    ];

    const roleOptions = roles.map((role) => ({
        value: role.name,
        label: role.name,
    }));

    return (
        <BackendLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? t('buttons.update') : t('buttons.create')} />

            <div className="flex-1 p-4 md:p-6">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl font-bold tracking-tight">{isEdit ? t('buttons.update') : t('buttons.create')}</CardTitle>
                        <CardDescription>{isEdit ? t('form.updateDescription') : t('form.createDescription')}</CardDescription>
                    </CardHeader>

                    <Separator />

                    <CardContent className="pt-5">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{t('labels.personalInformation', { fallback: 'Personal Information' })}</h3>
                                    <p className="text-muted-foreground text-sm">
                                        {t('labels.personalInformationDescription', { fallback: 'Update your basic information' })}
                                    </p>
                                </div>

                                <FormTextField form={form.form} name="name" label={t('labels.name')} placeholder={t('labels.name')} required />

                                <FormTextField
                                    form={form.form}
                                    name="email"
                                    type="email"
                                    label={t('labels.email')}
                                    placeholder={t('users.emailAddress')}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{t('labels.security', { fallback: 'Security' })}</h3>
                                    <p className="text-muted-foreground text-sm">
                                        {isEdit
                                            ? t('labels.passwordOptional', { fallback: 'Leave blank to keep current password' })
                                            : t('labels.passwordRequired', { fallback: 'Set a secure password' })}
                                    </p>
                                </div>

                                <FormTextField form={form.form} name="password" type="password" label={t('labels.password')} required={!isEdit} />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{t('columns.role')}</h3>
                                    <p className="text-muted-foreground text-sm">
                                        {t('labels.selectRoles', { fallback: 'Assign roles to this user' })}
                                    </p>
                                </div>

                                <FormMultiSelect form={form.form} name="roles" options={roleOptions} />
                            </div>

                            <Separator />

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <Link href="/backend/users" className="w-full sm:w-auto">
                                    <Button type="button" variant="secondary" className="w-full">
                                        {t('buttons.cancel')}
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={form.isSubmitting} className="w-full sm:w-auto">
                                    {form.isSubmitting ? (
                                        <>
                                            <span className="animate-spin">⟳</span> {t('buttons.saving')}
                                        </>
                                    ) : isEdit ? (
                                        t('buttons.save')
                                    ) : (
                                        t('buttons.add')
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </BackendLayout>
    );
}
