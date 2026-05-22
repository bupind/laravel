import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/use-language';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type TranslationValues = {
    [locale: string]: string | undefined;
};

type TranslationRow = {
    scope: string;
    namespace: string;
    key: string;
    full_key?: string;
    is_active: boolean;
    values: TranslationValues;
};

interface Props {
    rows?: TranslationRow[];
    scopes?: string[];
    locales?: string[];
    localeOptions?: { code: string; label: string }[];
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
                sync?: string;
            };
        };
    };
}

const PAGE_SIZE = 12;
function normalizeLocaleCode(locale: string): string {
    return locale.trim().toLowerCase().replaceAll('_', '-');
}

function localeLabel(locale: string, localeOptions: { code: string; label: string }[] = []): string {
    return localeOptions.find((option) => option.code === locale)?.label ?? locale.toUpperCase();
}

function normalizeLocaleList(locales: string[] = [], rows: TranslationRow[] = [], localeOptions: { code: string; label: string }[] = []) {
    const rowLocales = rows.flatMap((row) => Object.keys(row.values ?? {}));
    const optionLocales = localeOptions.map((option) => option.code);
    const normalized = [...locales, ...optionLocales, ...rowLocales]
        .map(normalizeLocaleCode)
        .filter((locale) => /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(locale));

    for (const fallback of ['en', 'id']) {
        if (!normalized.includes(fallback)) {
            normalized.unshift(fallback);
        }
    }

    return Array.from(new Set(normalized)).map((code) => ({
        code,
        label: localeLabel(code, localeOptions),
    }));
}

function emptyValues(locales: { code: string }[]): TranslationValues {
    return Object.fromEntries(locales.map((locale) => [locale.code, '']));
}

function normalizeRows(rows: TranslationRow[] = [], locales: { code: string }[] = []): TranslationRow[] {
    return rows.map((row) => ({
        scope: row.scope || 'common',
        namespace: row.namespace || 'common',
        key: row.key || '',
        full_key: row.full_key || `${row.namespace}.${row.key}`,
        is_active: row.is_active ?? true,
        values: {
            ...emptyValues(locales),
            ...(row.values ?? {}),
        },
    }));
}

function buildDictionary(rows: TranslationRow[], locales: { code: string }[]) {
    const messages = Object.fromEntries(locales.map((locale) => [locale.code, {} as Record<string, string>]));

    rows.forEach((row) => {
        if (!row.is_active || !row.namespace || !row.key) {
            return;
        }

        const fullKey = `${row.namespace}.${row.key}`;
        locales.forEach((locale) => {
            const value = row.values[locale.code] ?? '';
            if (value !== '') {
                messages[locale.code][fullKey] = value;
            }
        });
    });

    return messages;
}

export default function TranslationIndex({
    rows = [],
    scopes = ['common', 'backend', 'frontend', 'api'],
    locales = ['id', 'en'],
    localeOptions = [],
    crud,
}: Props) {
    const { t, updateOverrides } = useLanguage();
    const initialLocales = useMemo(() => normalizeLocaleList(locales, rows, localeOptions), [locales, rows, localeOptions]);
    const canUpdate = crud?.permissions?.update ?? false;
    const canSync = crud?.permissions?.sync ?? canUpdate;
    const updateRoute = crud?.resource?.routes?.update ?? route('translations.update');
    const syncRoute = crud?.resource?.routes?.sync ?? route('translations.sync');
    const [keyword, setKeyword] = useState('');
    const [scopeFilter, setScopeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [newLocale, setNewLocale] = useState('');
    const [editableLocales, setEditableLocales] = useState(initialLocales);

    const { data, setData, put, post, processing } = useForm<{ rows: TranslationRow[] }>({
        rows: normalizeRows(rows, initialLocales),
    });

    const filteredRows = useMemo(() => {
        const query = keyword.trim().toLowerCase();

        return data.rows.filter((row) => {
            const fullKey = `${row.namespace}.${row.key}`;
            const matchScope = scopeFilter === 'all' || row.scope === scopeFilter;
            const matchKeyword =
                !query ||
                [row.scope, row.namespace, row.key, fullKey, ...Object.values(row.values ?? {})].some((value = '') =>
                    value.toLowerCase().includes(query),
                );

            return matchScope && matchKeyword;
        });
    }, [data.rows, keyword, scopeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const pageRows = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;

        return filteredRows.slice(start, start + PAGE_SIZE);
    }, [currentPage, filteredRows]);
    const fromRow = filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const toRow = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

    useEffect(() => {
        setCurrentPage(1);
    }, [keyword, scopeFilter]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const updateRow = (index: number, patch: Partial<TranslationRow>) => {
        const nextRows = [...data.rows];
        nextRows[index] = {
            ...nextRows[index],
            ...patch,
        };
        setData('rows', nextRows);
    };

    const updateValue = (index: number, locale: string, value: string) => {
        const nextRows = [...data.rows];
        nextRows[index] = {
            ...nextRows[index],
            values: {
                ...nextRows[index].values,
                [locale]: value,
            },
        };
        setData('rows', nextRows);
    };

    const addLocale = () => {
        const code = normalizeLocaleCode(newLocale);
        if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(code) || editableLocales.some((locale) => locale.code === code)) {
            return;
        }

        setEditableLocales([...editableLocales, { code, label: localeLabel(code, localeOptions) }]);
        setData(
            'rows',
            data.rows.map((row) => ({
                ...row,
                values: {
                    ...row.values,
                    [code]: '',
                },
            })),
        );
        setNewLocale('');
    };

    const addRow = () => {
        setData('rows', [
            {
                scope: scopeFilter !== 'all' ? scopeFilter : 'backend',
                namespace: 'custom',
                key: 'new_key',
                full_key: 'custom.new_key',
                is_active: true,
                values: emptyValues(editableLocales),
            },
            ...data.rows,
        ]);
        setCurrentPage(1);
    };

    const submit = () => {
        if (!canUpdate || processing) {
            return;
        }

        put(updateRoute, {
            preserveScroll: true,
            onSuccess: () => {
                updateOverrides(buildDictionary(data.rows, editableLocales));
            },
        });
    };

    const syncTranslations = () => {
        if (!canSync || processing) {
            return;
        }

        post(syncRoute, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: t('settings.translations.title'), href: '/backend/translations' }]}>
            <Head title={t('settings.translations.title')} />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('settings.translations.title')}</h1>
                        <p className="text-muted-foreground">{t('settings.translations.description')}</p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <select
                            value={scopeFilter}
                            onChange={(event) => setScopeFilter(event.target.value)}
                            className="border-input bg-background ring-offset-background h-9 rounded-md border px-3 text-sm"
                        >
                            <option value="all">{t('settings.translations.allScopes')}</option>
                            {scopes.map((scope) => (
                                <option key={scope} value={scope}>
                                    {scope}
                                </option>
                            ))}
                        </select>
                        <Input
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder={t('settings.translations.search')}
                            className="h-9 w-full sm:w-[280px]"
                        />
                        <div className="flex gap-2">
                            <Input
                                value={newLocale}
                                onChange={(event) => setNewLocale(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        addLocale();
                                    }
                                }}
                                placeholder="ar"
                                disabled={!canUpdate || processing}
                                className="h-9 w-20"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={addLocale}
                                disabled={!canUpdate || processing || !newLocale.trim()}
                                className="h-9"
                            >
                                {t('buttons.add')}
                            </Button>
                        </div>
                        <Button type="button" variant="secondary" onClick={addRow} disabled={!canUpdate || processing} className="h-9">
                            <Plus className="h-4 w-4" />
                            {t('buttons.add')}
                        </Button>
                        <Button type="button" variant="secondary" onClick={syncTranslations} disabled={!canSync || processing} className="h-9">
                            <RefreshCw className={processing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                            {t('buttons.sync')}
                        </Button>
                        <Button type="button" onClick={submit} disabled={!canUpdate || processing} className="h-9">
                            <Save className="h-4 w-4" />
                            {processing ? t('buttons.saving') : t('buttons.save')}
                        </Button>
                    </div>
                </div>

                <div className="text-muted-foreground flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
                    <div>{t('settings.translations.resultSummary', { from: fromRow, to: toRow, total: filteredRows.length })}</div>
                    <div className="flex flex-wrap gap-2">
                        {scopes.map((scope) => (
                            <Badge key={scope} variant={scopeFilter === scope ? 'default' : 'secondary'}>
                                {scope}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="bg-card overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" style={{ minWidth: `${620 + editableLocales.length * 260}px` }}>
                            <thead className="bg-muted text-muted-foreground">
                                <tr className="border-b">
                                    <th className="w-[12%] px-4 py-3 text-left font-semibold">{t('settings.translations.scope')}</th>
                                    <th className="w-[14%] px-4 py-3 text-left font-semibold">{t('settings.translations.namespace')}</th>
                                    <th className="w-[18%] px-4 py-3 text-left font-semibold">{t('settings.translations.key')}</th>
                                    {editableLocales.map((locale) => (
                                        <th key={locale.code} className="min-w-[240px] px-4 py-3 text-left font-semibold">
                                            {locale.label}
                                            <span className="text-muted-foreground ml-2 font-mono text-xs">{locale.code}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={3 + editableLocales.length} className="text-muted-foreground px-4 py-8 text-center">
                                            {t('settings.translations.noKeys')}
                                        </td>
                                    </tr>
                                ) : (
                                    pageRows.map((row) => {
                                        const realIndex = data.rows.indexOf(row);

                                        return (
                                            <tr key={`${row.scope}.${row.namespace}.${row.key}.${realIndex}`} className="border-b last:border-b-0">
                                                <td className="px-4 py-3 align-top">
                                                    <select
                                                        value={row.scope}
                                                        onChange={(event) => updateRow(realIndex, { scope: event.target.value })}
                                                        disabled={!canUpdate}
                                                        className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                                                    >
                                                        {scopes.map((scope) => (
                                                            <option key={scope} value={scope}>
                                                                {scope}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <Input
                                                        value={row.namespace}
                                                        onChange={(event) => updateRow(realIndex, { namespace: event.target.value })}
                                                        disabled={!canUpdate}
                                                        className="h-9"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 align-top">
                                                    <Input
                                                        value={row.key}
                                                        onChange={(event) => updateRow(realIndex, { key: event.target.value })}
                                                        disabled={!canUpdate}
                                                        className="h-9"
                                                    />
                                                    <code className="text-muted-foreground mt-1 block text-xs break-all">
                                                        {row.namespace}.{row.key}
                                                    </code>
                                                </td>
                                                {editableLocales.map((locale) => (
                                                    <td key={locale.code} className="px-4 py-3 align-top">
                                                        <Input
                                                            value={row.values[locale.code] ?? ''}
                                                            onChange={(event) => updateValue(realIndex, locale.code, event.target.value)}
                                                            disabled={!canUpdate}
                                                            className="h-9"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })
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
                        {t('buttons.previous')}
                    </Button>
                    <div className="text-muted-foreground text-sm">{t('pagination.summary', { current: currentPage, total: totalPages })}</div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        disabled={currentPage >= totalPages}
                    >
                        {t('buttons.next')}
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
