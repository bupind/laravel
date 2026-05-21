import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/use-language';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, RefreshCw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type TranslationOverrides = {
    id?: Record<string, string>;
    en?: Record<string, string>;
    [language: string]: Record<string, string> | undefined;
};

interface Props {
    translations?: TranslationOverrides;
    crud?: {
        permissions?: {
            view: boolean;
            create: boolean;
            update: boolean;
            delete: boolean;
            export: boolean;
            sync?: boolean;
        };
        resource?: {
            routes?: {
                index?: string;
                update?: string;
            };
        };
    };
}

const PAGE_SIZE = 10;
const SUPPORTED_LANGUAGES = ['id', 'en'] as const;
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Translations', href: '/backend/translations' }];

export default function TranslationIndex({ translations = {}, crud }: Props) {
    const { t, keys, dictionaries, updateOverrides } = useLanguage();
    const canUpdate = crud?.permissions?.update ?? false;
    const canSync = crud?.permissions?.sync ?? canUpdate;
    const updateRoute = crud?.resource?.routes?.update ?? route('translations.update');
    const [keyword, setKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [syncedTranslations, setSyncedTranslations] = useState<TranslationOverrides>(translations);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialTranslations = useMemo(() => {
        const idValues: Record<string, string> = {};
        const enValues: Record<string, string> = {};

        keys.forEach((key) => {
            idValues[key] = translations.id?.[key] ?? dictionaries.id[key] ?? '';
            enValues[key] = translations.en?.[key] ?? dictionaries.en[key] ?? '';
        });

        return { id: idValues, en: enValues };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { data, setData, put, processing } = useForm<{
        translations: { id: Record<string, string>; en: Record<string, string> };
    }>({ translations: initialTranslations });

    const untranslatedKeys = useMemo(
        () =>
            keys.filter((key) => {
                const idValue = syncedTranslations.id?.[key]?.trim();
                const enValue = syncedTranslations.en?.[key]?.trim();

                return !idValue || !enValue;
            }),
        [keys, syncedTranslations.en, syncedTranslations.id],
    );

    const staleTranslationCount = useMemo(() => {
        const supportedLanguages = new Set<string>(SUPPORTED_LANGUAGES);
        const supportedKeys = new Set(keys);

        return Object.entries(syncedTranslations).reduce((count, [language, values]) => {
            if (!values) {
                return count;
            }

            if (!supportedLanguages.has(language)) {
                return count + Object.keys(values).length;
            }

            return count + Object.keys(values).filter((key) => !supportedKeys.has(key)).length;
        }, 0);
    }, [keys, syncedTranslations]);

    const filteredKeys = useMemo(() => {
        const query = keyword.trim().toLowerCase();

        if (!query) {
            return keys;
        }

        return keys.filter((key) => {
            const idValue = data.translations.id[key] ?? '';
            const enValue = data.translations.en[key] ?? '';

            return [key, idValue, enValue].some((value) => value.toLowerCase().includes(query));
        });
    }, [data.translations.en, data.translations.id, keys, keyword]);

    const totalPages = Math.max(1, Math.ceil(filteredKeys.length / PAGE_SIZE));
    const pageKeys = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;

        return filteredKeys.slice(start, start + PAGE_SIZE);
    }, [currentPage, filteredKeys]);
    const fromRow = filteredKeys.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const toRow = Math.min(currentPage * PAGE_SIZE, filteredKeys.length);

    useEffect(() => {
        setCurrentPage(1);
    }, [keyword]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const setTranslation = (language: 'id' | 'en', key: string, value: string) => {
        setData('translations', {
            ...data.translations,
            [language]: {
                ...data.translations[language],
                [key]: value,
            },
        });
    };

    const syncMissingTranslations = () => {
        if (!canSync) {
            return;
        }

        const nextTranslations: { id: Record<string, string>; en: Record<string, string> } = {
            id: {},
            en: {},
        };

        keys.forEach((key) => {
            SUPPORTED_LANGUAGES.forEach((language) => {
                const currentValue = data.translations[language][key]?.trim();
                const syncedValue = syncedTranslations[language]?.[key]?.trim();
                const fallback = dictionaries[language][key] ?? '';

                nextTranslations[language][key] = currentValue || syncedValue || fallback;
            });
        });

        setData('translations', nextTranslations);
        setSyncedTranslations(nextTranslations);
    };

    const submit = () => {
        if (!canUpdate || processing || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        put(updateRoute, {
            preserveScroll: true,
            onSuccess: () => {
                setSyncedTranslations(data.translations);
                updateOverrides(data.translations);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.translations.title')} />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('settings.translations.title')}</h1>
                        <p className="text-muted-foreground">{t('settings.translations.description')}</p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder={t('settings.translations.search')}
                            className="h-9 w-full sm:w-[280px]"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={syncMissingTranslations}
                            disabled={!canSync || processing || isSubmitting}
                            className="h-9"
                        >
                            <RefreshCw className="h-4 w-4" />
                            {t('buttons.sync')}
                            {untranslatedKeys.length + staleTranslationCount > 0 ? (
                                <span className="bg-background text-foreground rounded-full border px-2 py-0.5 text-xs font-semibold">
                                    {untranslatedKeys.length + staleTranslationCount}
                                </span>
                            ) : null}
                        </Button>
                        <Button type="button" onClick={submit} disabled={!canUpdate || processing || isSubmitting} className="h-9">
                            <Save className="h-4 w-4" />
                            {processing || isSubmitting ? t('buttons.saving') : t('buttons.save')}
                        </Button>
                    </div>
                </div>

                <div className="text-muted-foreground flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        Menampilkan {fromRow}-{toRow} dari {filteredKeys.length} key. Load per halaman: {PAGE_SIZE}.
                    </div>
                    <div>
                        {untranslatedKeys.length === 0 && staleTranslationCount === 0
                            ? 'Semua key sudah tersinkron.'
                            : `${untranslatedKeys.length} key belum tersinkron, ${staleTranslationCount} data lama akan dihapus saat sync.`}
                    </div>
                </div>

                <div className="bg-card overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[840px] text-sm">
                            <thead className="bg-muted text-muted-foreground">
                                <tr className="border-b">
                                    <th className="w-[28%] px-4 py-3 text-left font-semibold">{t('settings.translations.key')}</th>
                                    <th className="w-[36%] px-4 py-3 text-left font-semibold">{t('settings.translations.indonesian')}</th>
                                    <th className="w-[36%] px-4 py-3 text-left font-semibold">{t('settings.translations.english')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredKeys.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-muted-foreground px-4 py-8 text-center">
                                            Tidak ada key ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    pageKeys.map((key) => (
                                        <tr key={key} className="border-b last:border-b-0">
                                            <td className="px-4 py-3 align-top">
                                                <div className="flex flex-col gap-2">
                                                    <code className="text-muted-foreground text-xs break-all">{key}</code>
                                                    {untranslatedKeys.includes(key) ? (
                                                        <Badge variant="secondary" className="w-fit">
                                                            Belum tersinkron
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <Input
                                                    value={data.translations.id[key] ?? ''}
                                                    onChange={(event) => setTranslation('id', key, event.target.value)}
                                                    className="h-9"
                                                />
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <Input
                                                    value={data.translations.en[key] ?? ''}
                                                    onChange={(event) => setTranslation('en', key, event.target.value)}
                                                    className="h-9"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                    </Button>
                    <div className="text-muted-foreground text-sm">
                        Halaman {currentPage} dari {totalPages}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        disabled={currentPage >= totalPages}
                    >
                        Berikutnya
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
