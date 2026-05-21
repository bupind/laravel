import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ComboboxPermission from '@/components/ui/combobox-permission';
import IconPicker from '@/components/ui/icon-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuData {
    id: number;
    title: string;
    translation_key?: string | null;
    route: string;
    icon: string;
    parent_id: number | null;
    permission_name: string | null;
}

interface ParentMenu {
    id: number;
    title: string;
}

interface Props {
    menu?: MenuData;
    parentMenus: ParentMenu[];
    permissions: string[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MenuForm({ menu, parentMenus, permissions }: Props) {
    const { t } = useLanguage();
    const isEdit = !!menu;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: menu?.title ?? '',
        translation_key: menu?.translation_key ?? '',
        route: menu?.route ?? '',
        icon: menu?.icon ?? '',
        parent_id: menu?.parent_id ?? (null as number | null),
        permission_name: menu?.permission_name ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        isEdit ? put(`/backend/menus/${menu?.id}`) : post('/backend/menus', { onSuccess: () => reset() });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Menu Management', href: '/backend/menus' },
        { title: isEdit ? t('buttons.update') : t('buttons.create'), href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? t('buttons.update') : t('buttons.create')} />

            <div className="flex-1 p-4 md:p-6">
                <Card className="mx-auto max-w-2xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-2xl font-bold tracking-tight">{isEdit ? t('buttons.update') : t('buttons.create')}</CardTitle>
                        <p className="text-muted-foreground text-sm">Kelola detail menu sistem.</p>
                    </CardHeader>

                    <Separator />

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Judul */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Menu *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Contoh: Dashboard"
                                        className={errors.title ? 'border-red-500' : ''}
                                    />
                                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                </div>

                                {/* Route */}
                                <div className="space-y-2">
                                    <Label htmlFor="route">Route</Label>
                                    <Input
                                        id="route"
                                        value={data.route}
                                        onChange={(e) => setData('route', e.target.value)}
                                        placeholder="Contoh: /backend/dashboard"
                                        className={errors.route ? 'border-red-500' : ''}
                                    />
                                    {errors.route && <p className="text-sm text-red-500">{errors.route}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="translation_key">Translation Key</Label>
                                    <Input
                                        id="translation_key"
                                        value={data.translation_key}
                                        onChange={(e) => setData('translation_key', e.target.value)}
                                        placeholder="Contoh: menus.dashboard"
                                        className={errors.translation_key ? 'border-red-500' : ''}
                                    />
                                    {errors.translation_key && <p className="text-sm text-red-500">{errors.translation_key}</p>}
                                </div>

                                {/* Icon */}
                                <div className="space-y-2">
                                    <Label htmlFor="icon">Icon (Lucide)</Label>
                                    <IconPicker value={data.icon} onChange={(val) => setData('icon', val)} />
                                    {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
                                </div>

                                {/* Parent Menu — menggunakan Shadcn Select */}
                                <div className="space-y-2">
                                    <Label htmlFor="parent_id">Parent Menu</Label>
                                    <Select
                                        value={data.parent_id !== null ? String(data.parent_id) : 'none'}
                                        onValueChange={(val) => setData('parent_id', val === 'none' ? null : Number(val))}
                                    >
                                        <SelectTrigger id="parent_id">
                                            <SelectValue placeholder="— Tidak ada —" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">— Tidak ada —</SelectItem>
                                            {parentMenus.map((m) => (
                                                <SelectItem key={m.id} value={String(m.id)}>
                                                    {m.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Permission */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="permission_name">Permission</Label>
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
                                        Batal
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
        </AppLayout>
    );
}
