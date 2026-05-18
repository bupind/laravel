import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TranslationOverrides = {
    id?: Record<string, string>;
    en?: Record<string, string>;
};

interface Props {
    translations?: TranslationOverrides;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Translation settings',
        href: '/backend/settings/translations',
    },
];

export default function TranslationSettings({ translations = {} }: Props) {
    const { t, keys, dictionaries } = useLanguage();
    const [keyword, setKeyword] = useState('');

    const initialTranslations = useMemo(() => {
        const idValues: Record<string, string> = {};
        const enValues: Record<string, string> = {};

        keys.forEach((key) => {
            idValues[key] = translations.id?.[key] ?? dictionaries.id[key] ?? '';
            enValues[key] = translations.en?.[key] ?? dictionaries.en[key] ?? '';
        });

        return {
            id: idValues,
            en: enValues,
        };
    }, [keys, dictionaries.id, dictionaries.en, translations.id, translations.en]);

    const { data, setData, put, processing } = useForm<{ translations: { id: Record<string, string>; en: Record<string, string> } }>({
        translations: initialTranslations,
    });

    const filteredKeys = useMemo(() => {
        const q = keyword.trim().toLowerCase();

        if (q === '') return keys;

        return keys.filter((key) => key.toLowerCase().includes(q));
    }, [keys, keyword]);

    const submit = () => {
        put(route('translations.update'), {
            preserveScroll: true,
            onSuccess: () => {
                window.location.reload();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.translations.title')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold">{t('settings.translations.title')}</h2>
                        <p className="text-sm text-muted-foreground">{t('settings.translations.description')}</p>
                    </div>

                    <div className="max-w-md">
                        <Label htmlFor="search-key" className="mb-2 block">{t('settings.translations.search')}</Label>
                        <Input
                            id="search-key"
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder={t('settings.translations.search')}
                        />
                    </div>

                    <div className="space-y-4">
                        {filteredKeys.map((key) => (
                            <div key={key} className="rounded-md border p-4">
                                <p className="mb-3 text-xs font-medium text-muted-foreground">{key}</p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>{t('settings.translations.indonesian')}</Label>
                                        <Input
                                            value={data.translations.id[key] ?? ''}
                                            onChange={(event) => setData('translations', {
                                                ...data.translations,
                                                id: {
                                                    ...data.translations.id,
                                                    [key]: event.target.value,
                                                },
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('settings.translations.english')}</Label>
                                        <Input
                                            value={data.translations.en[key] ?? ''}
                                            onChange={(event) => setData('translations', {
                                                ...data.translations,
                                                en: {
                                                    ...data.translations.en,
                                                    [key]: event.target.value,
                                                },
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2">
                        <Button onClick={submit} disabled={processing}>
                            {t('settings.translations.save')}
                        </Button>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
