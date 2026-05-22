import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';

type SettingRow = {
    key: string;
    value: string;
    type?: 'text' | 'textarea' | 'color' | 'file' | 'json';
    is_system?: boolean;
};

interface Props {
    settings?: SettingRow[];
}

function labelFor(key: string): string {
    return key
        .replaceAll('_', ' ')
        .replaceAll('.', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function storageUrl(path?: string | null): string | null {
    return path ? `/storage/${path}` : null;
}

export default function SettingForm({ settings = [] }: Props) {
    const { t } = useLanguage();
    const initialRows = useMemo(() => settings.map((row) => ({ ...row, value: row.value ?? '' })), [settings]);
    const { data, setData, post, processing, errors } = useForm<{
        settings: SettingRow[];
        files: Record<string, File | null>;
    }>({
        settings: initialRows,
        files: {},
    });
    const [previews, setPreviews] = useState<Record<string, string | null>>(
        Object.fromEntries(initialRows.filter((row) => row.type === 'file').map((row) => [row.key, storageUrl(row.value)])),
    );

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('setting.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const updateRow = (index: number, patch: Partial<SettingRow>) => {
        const nextRows = [...data.settings];
        nextRows[index] = {
            ...nextRows[index],
            ...patch,
        };
        setData('settings', nextRows);
    };

    const addRow = () => {
        setData('settings', [{ key: '', value: '', type: 'text', is_system: false }, ...data.settings]);
    };

    const removeRow = (index: number) => {
        const row = data.settings[index];
        setData(
            'settings',
            data.settings.filter((_, rowIndex) => rowIndex !== index),
        );

        if (row?.type === 'file') {
            const nextFiles = { ...data.files };
            delete nextFiles[row.key];
            setData('files', nextFiles);
        }
    };

    const handleFileChange = (row: SettingRow, file: File | null) => {
        setData('files', {
            ...data.files,
            [row.key]: file,
        });

        if (!file) {
            setPreviews((current) => ({ ...current, [row.key]: storageUrl(row.value) }));
            return;
        }

        setPreviews((current) => {
            const previous = current[row.key];
            if (previous?.startsWith('blob:')) {
                URL.revokeObjectURL(previous);
            }

            return {
                ...current,
                [row.key]: URL.createObjectURL(file),
            };
        });
    };

    const renderValueField = (row: SettingRow, index: number) => {
        if (row.type === 'textarea' || row.type === 'json') {
            return (
                <Textarea
                    value={row.value}
                    onChange={(event) => updateRow(index, { value: event.target.value })}
                    className={row.type === 'json' ? 'min-h-28 font-mono text-xs' : undefined}
                />
            );
        }

        if (row.type === 'color') {
            return (
                <div className="flex items-center gap-3">
                    <Input
                        type="color"
                        value={row.value || '#0ea5e9'}
                        onChange={(event) => updateRow(index, { value: event.target.value })}
                        className="h-10 w-16 p-1"
                    />
                    <Input value={row.value} onChange={(event) => updateRow(index, { value: event.target.value })} className="font-mono" />
                </div>
            );
        }

        if (row.type === 'file') {
            return (
                <div className="space-y-2">
                    <Input
                        type="file"
                        accept="image/jpg,image/jpeg,image/png,image/webp,image/svg+xml,image/x-icon"
                        onChange={(event) => handleFileChange(row, event.target.files?.[0] ?? null)}
                    />
                    {previews[row.key] ? (
                        <img src={previews[row.key] ?? ''} alt={labelFor(row.key)} className="h-14 max-w-48 rounded border object-contain p-1" />
                    ) : null}
                    <Input value={row.value} onChange={(event) => updateRow(index, { value: event.target.value })} placeholder="path/in/storage" />
                </div>
            );
        }

        return <Input value={row.value} onChange={(event) => updateRow(index, { value: event.target.value })} />;
    };

    return (
        <AppLayout breadcrumbs={[{ title: t('pages.settingapp.title'), href: '/backend/settingsapp' }]} title={t('pages.settingapp.title')}>
            <Head title={t('pages.settingapp.title')} />

            <div className="flex-1 p-4 md:p-6">
                <Card className="mx-auto max-w-4xl">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight">{t('pages.settingapp.title')}</CardTitle>
                            <p className="text-muted-foreground mt-1 text-sm">{t('pages.settingapp.description')}</p>
                        </div>
                        <Button type="button" variant="secondary" onClick={addRow}>
                            <Plus className="h-4 w-4" />
                            {t('buttons.add')}
                        </Button>
                    </CardHeader>

                    <Separator />

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {data.settings.length === 0 ? (
                                <p className="text-muted-foreground rounded-md border border-dashed px-3 py-6 text-center text-sm">
                                    {t('pages.settingapp.noCustomSettings')}
                                </p>
                            ) : (
                                data.settings.map((row, index) => (
                                    <div key={`${row.key}-${index}`} className="rounded-md border p-4">
                                        <div className="grid gap-3 lg:grid-cols-[240px_1fr_auto]">
                                            <div className="space-y-1">
                                                <Label htmlFor={`setting-key-${index}`}>{t('settings.translations.key')}</Label>
                                                <Input
                                                    id={`setting-key-${index}`}
                                                    value={row.key}
                                                    onChange={(event) => updateRow(index, { key: event.target.value })}
                                                    disabled={row.is_system}
                                                    placeholder="support_email"
                                                    className={errors[`settings.${index}.key`] ? 'border-red-500' : ''}
                                                />
                                                <p className="text-muted-foreground text-xs">{labelFor(row.key || 'custom_setting')}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <Label>{t('pages.settingapp.customValue')}</Label>
                                                {renderValueField(row, index)}
                                            </div>

                                            <div className="flex items-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeRow(index)}
                                                    aria-label={t('buttons.delete')}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={processing} className="px-6">
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
