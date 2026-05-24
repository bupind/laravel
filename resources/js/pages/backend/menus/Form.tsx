import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ComboboxPermission from '@/components/ui/combobox-permission';
import IconPicker from '@/components/ui/icon-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import BackendLayout from '@/layouts/backend-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

interface MenuData {
    id: string;
    title: string;
    translation_key?: string | null;
    scope?: 'backend' | 'frontend';
    route: string;
    icon: string;
    parent_id: string | null;
    permission_name: string | null;
}

interface ParentMenu {
    id: string;
    title: string;
    scope?: 'backend' | 'frontend';
}

interface Props {
    menu?: MenuData;
    parentMenus: ParentMenu[];
    permissions: string[];
    initialScope?: 'backend' | 'frontend';
}

export default function MenuForm({ menu, parentMenus, permissions, initialScope = 'backend' }: Props) {
    const { t } = useLanguage();
    const isEdit = !!menu;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: menu?.title ?? '',
        translation_key: menu?.translation_key ?? '',
        scope: menu?.scope ?? initialScope,
        route: menu?.route ?? '',
        icon: menu?.icon ?? '',
        parent_id: menu?.parent_id ?? (null as string | null),
        permission_name: menu?.permission_name ?? '',
    });

    const availableParentMenus = parentMenus.filter((parentMenu) => (parentMenu.scope ?? 'backend') === data.scope);

    const handleScopeChange = (scope: 'backend' | 'frontend') => {
        setData({
            ...data,
            scope,
            parent_id: parentMenus.some((parentMenu) => parentMenu.id === data.parent_id && (parentMenu.scope ?? 'backend') === scope)
                ? data.parent_id
                : null,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        isEdit ? put(`/backend/menus/${menu?.id}`) : post('/backend/menus', { onSuccess: () => reset() });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('pages.menus.breadcrumb'), href: '/backend/menus' },
        { title: isEdit ? t('buttons.update') : t('buttons.create'), href: '#' },
    ];

    return (
        <BackendLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? t('buttons.update') : t('buttons.create')} />

            <div className="flex-1 p-4 md:p-6">
                <Card className="mx-auto max-w-2xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl font-bold tracking-tight">{isEdit ? t('buttons.update') : t('buttons.create')}</CardTitle>
                        <p className="text-muted-foreground text-sm">{t('pages.menus.formDescription')}</p>
                    </CardHeader>

                    <Separator />

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title">{t('pages.menus.titleLabel')}</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder={t('pages.menus.titlePlaceholder')}
                                        className={errors.title ? 'border-red-500' : ''}
                                    />
                                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="scope">{t('pages.menus.scope')}</Label>
                                    <Select value={data.scope} onValueChange={(val) => handleScopeChange(val as 'backend' | 'frontend')}>
                                        <SelectTrigger id="scope" className={errors.scope ? 'border-red-500' : ''}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="backend">{t('pages.menus.scopeBackend')}</SelectItem>
                                            <SelectItem value="frontend">{t('pages.menus.scopeFrontend')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.scope && <p className="text-sm text-red-500">{errors.scope}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="route">{t('pages.menus.route')}</Label>
                                    <Input
                                        id="route"
                                        value={data.route}
                                        onChange={(e) => setData('route', e.target.value)}
                                        placeholder={t('pages.menus.routePlaceholder')}
                                        className={errors.route ? 'border-red-500' : ''}
                                    />
                                    {errors.route && <p className="text-sm text-red-500">{errors.route}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="translation_key">{t('pages.menus.translationKey')}</Label>
                                    <Input
                                        id="translation_key"
                                        value={data.translation_key}
                                        onChange={(e) => setData('translation_key', e.target.value)}
                                        placeholder={t('pages.menus.translationKeyPlaceholder')}
                                        className={errors.translation_key ? 'border-red-500' : ''}
                                    />
                                    {errors.translation_key && <p className="text-sm text-red-500">{errors.translation_key}</p>}
                                </div>

                                {/* Icon */}
                                <div className="space-y-2">
                                    <Label htmlFor="icon">{t('pages.menus.iconLabel')}</Label>
                                    <IconPicker value={data.icon} onChange={(val) => setData('icon', val)} />
                                    {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
                                </div>

                                {/* Parent Menu — menggunakan Shadcn Select */}
                                <div className="space-y-2">
                                    <Label htmlFor="parent_id">{t('pages.menus.parentMenu')}</Label>
                                    <Select
                                        value={data.parent_id !== null ? String(data.parent_id) : 'none'}
                                        onValueChange={(val) => setData('parent_id', val === 'none' ? null : val)}
                                    >
                                        <SelectTrigger id="parent_id">
                                            <SelectValue placeholder={t('labels.none')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">{t('labels.none')}</SelectItem>
                                            {availableParentMenus.map((m) => (
                                                <SelectItem key={m.id} value={String(m.id)}>
                                                    {m.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Permission */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="permission_name">{t('pages.menus.permission')}</Label>
                                    <ComboboxPermission
                                        value={data.permission_name ?? ''}
                                        onChange={(val) => setData('permission_name', val)}
                                        options={permissions}
                                    />
                                    {errors.permission_name && <p className="text-sm text-red-500">{errors.permission_name}</p>}
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <Link href="/backend/menus" className="w-full sm:w-auto">
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
