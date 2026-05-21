import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_WARNA = '#0ea5e9';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingApp {
    nama_app: string;
    deskripsi: string;
    warna: string;
    logo: string;
    favicon: string;
    seo: {
        title?: string;
        description?: string;
        keywords?: string;
    };
}

interface Props {
    setting: SettingApp | null;
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pengaturan Aplikasi', href: '/backend/settingsapp' }];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingForm({ setting }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nama_app: setting?.nama_app ?? '',
        deskripsi: setting?.deskripsi ?? '',
        warna: setting?.warna ?? DEFAULT_WARNA,
        seo: {
            title: setting?.seo?.title ?? '',
            description: setting?.seo?.description ?? '',
            keywords: setting?.seo?.keywords ?? '',
        },
        logo: null as File | null,
        favicon: null as File | null,
    });

    // Pakai useState agar preview re-render saat berubah
    const [logoPreview, setLogoPreview] = useState<string | null>(setting?.logo ? `/storage/${setting.logo}` : null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(setting?.favicon ? `/storage/${setting.favicon}` : null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/backend/settingsapp', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleFileChange = (
        field: 'logo' | 'favicon',
        setPreview: React.Dispatch<React.SetStateAction<string | null>>,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0] ?? null;
        setData(field, file);
        if (file) {
            // Revoke URL sebelumnya agar tidak memory leak
            setPreview((prev) => {
                if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
                return URL.createObjectURL(file);
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} title="Pengaturan Aplikasi">
            <Head title="Pengaturan Aplikasi" />

            <div className="flex-1 p-4 md:p-6">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold tracking-tight">Pengaturan Aplikasi</CardTitle>
                        <p className="text-muted-foreground mt-1 text-sm">Konfigurasi identitas aplikasi, warna tema, logo, dan metadata SEO.</p>
                    </CardHeader>

                    <Separator />

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nama Aplikasi */}
                            <div className="space-y-1">
                                <Label htmlFor="nama_app">Nama Aplikasi</Label>
                                <Input
                                    id="nama_app"
                                    value={data.nama_app}
                                    onChange={(e) => setData('nama_app', e.target.value)}
                                    className={errors.nama_app ? 'border-red-500' : ''}
                                />
                                {errors.nama_app && <p className="text-sm text-red-500">{errors.nama_app}</p>}
                            </div>

                            {/* Deskripsi */}
                            <div className="space-y-1">
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Textarea id="deskripsi" value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} />
                            </div>

                            {/* Warna Tema */}
                            <div className="space-y-1">
                                <Label htmlFor="warna">Warna Tema</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="warna"
                                        type="color"
                                        value={data.warna}
                                        onChange={(e) => setData('warna', e.target.value)}
                                        className="h-10 w-16 p-1"
                                    />
                                    <span className="text-muted-foreground font-mono text-sm">{data.warna}</span>
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setData('warna', DEFAULT_WARNA)}>
                                        Reset Default
                                    </Button>
                                </div>
                            </div>

                            {/* Logo */}
                            <div className="space-y-1">
                                <Label htmlFor="logo">Logo (Maks. 2MB)</Label>
                                <Input id="logo" type="file" accept="image/*" onChange={(e) => handleFileChange('logo', setLogoPreview, e)} />
                                {logoPreview && <img src={logoPreview} alt="Preview Logo" className="mt-2 h-16 rounded object-contain" />}
                                {errors.logo && <p className="text-sm text-red-500">{errors.logo}</p>}
                            </div>

                            {/* Favicon */}
                            <div className="space-y-1">
                                <Label htmlFor="favicon">Favicon (Maks. 1MB)</Label>
                                <Input
                                    id="favicon"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('favicon', setFaviconPreview, e)}
                                />
                                {faviconPreview && <img src={faviconPreview} alt="Preview Favicon" className="mt-2 h-10 rounded object-contain" />}
                                {errors.favicon && <p className="text-sm text-red-500">{errors.favicon}</p>}
                            </div>

                            {/* SEO */}
                            <Separator />
                            <h3 className="text-lg font-semibold">Pengaturan SEO</h3>

                            <div className="space-y-1">
                                <Label htmlFor="seo_title">SEO Title</Label>
                                <Input
                                    id="seo_title"
                                    value={data.seo.title}
                                    onChange={(e) => setData('seo', { ...data.seo, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="seo_description">SEO Description</Label>
                                <Textarea
                                    id="seo_description"
                                    value={data.seo.description}
                                    onChange={(e) => setData('seo', { ...data.seo, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="seo_keywords">
                                    SEO Keywords <span className="text-muted-foreground text-xs">(pisahkan dengan koma)</span>
                                </Label>
                                <Input
                                    id="seo_keywords"
                                    value={data.seo.keywords}
                                    onChange={(e) => setData('seo', { ...data.seo, keywords: e.target.value })}
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={processing} className="px-6">
                                    {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
