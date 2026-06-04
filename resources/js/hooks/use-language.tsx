import { router } from '@inertiajs/react';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type LocaleOption = {
    code: string;
    label: string;
};

type Language = string;
type Dictionary = Record<string, string>;
type FallbackValue = string | number | Partial<Record<Language, string | number>>;
type Dictionaries = Record<Language, Dictionary>;

type LanguageContextValue = {
    language: Language;
    setLanguage: (language: Language) => void;
    updateOverrides: (messages?: Partial<Dictionaries>) => void;
    preload: (keys: string | string[]) => void;
    dictionaries: Dictionaries;
    locales: LocaleOption[];
    keys: string[];
    loading: boolean;
    t: (key: string, replacements?: Record<string, string | number | FallbackValue | undefined>) => string;
};

type LanguageProviderProps = {
    children: React.ReactNode;
    messages?: Partial<Dictionaries>;
    overrides?: Partial<Dictionaries>;
    locales?: LocaleOption[];
    defaultLocale?: string;
    scope?: string;
    version?: number;
};

type ResolvePayload = {
    locale?: string;
    messages?: Dictionary;
    sources?: Record<string, { scope?: string; locale?: string }>;
};

type TranslationPageProps = {
    translations?: Partial<Dictionaries>;
    translation_scope?: string;
    translation_version?: number;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function normalizeLocaleCode(locale: string): string {
    return locale.trim().toLowerCase().replaceAll('_', '-');
}

function normalizeMessages(messages?: Partial<Dictionaries>): Dictionaries {
    return Object.fromEntries(
        Object.entries(messages ?? {})
            .map(([locale, dictionary]) => [normalizeLocaleCode(locale), dictionary ?? {}])
            .filter(([locale]) => locale),
    );
}

function normalizeLocales(messages: Dictionaries, locales?: LocaleOption[], defaultLocale = 'id'): LocaleOption[] {
    const existingCodes = Object.keys(messages);
    const nextLocales = (locales ?? []).map((locale) => ({
        code: normalizeLocaleCode(locale.code),
        label: locale.label || locale.code.toUpperCase(),
    }));

    for (const code of existingCodes) {
        if (!nextLocales.some((locale) => locale.code === code)) {
            nextLocales.push({ code, label: code.toUpperCase() });
        }
    }

    if (nextLocales.length === 0) {
        const fallback = normalizeLocaleCode(defaultLocale) || 'id';
        nextLocales.push({ code: fallback, label: fallback.toUpperCase() });
    }

    return nextLocales.filter((locale, index, all) => locale.code && all.findIndex((item) => item.code === locale.code) === index);
}

function normalizeTranslationKeys(keys: string | string[]): string[] {
    return (Array.isArray(keys) ? keys : [keys])
        .map((key) => String(key).trim())
        .filter((key, index, all) => key.includes('.') && key !== '' && all.indexOf(key) === index);
}

function humanizeTranslationKey(key: string): string {
    const lastSegment = key.split('.').pop() ?? key;
    const spaced = lastSegment
        .replace(/[_-]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();

    if (!spaced) return key;
    return spaced.replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveExactFallbackValue(fallback: FallbackValue | undefined, language: string): string | undefined {
    if (fallback === undefined || fallback === null || typeof fallback === 'string' || typeof fallback === 'number') {
        return undefined;
    }

    const normalizedLanguage = normalizeLocaleCode(language);
    const selected = fallback[normalizedLanguage] ?? fallback[normalizedLanguage.split('-')[0]];
    return selected === undefined || selected === null ? undefined : String(selected);
}

function resolveFallbackValue(fallback: FallbackValue | undefined, language: string, defaultLocale: string): string | undefined {
    if (fallback === undefined || fallback === null) return undefined;

    if (typeof fallback === 'string' || typeof fallback === 'number') {
        return String(fallback);
    }

    const normalizedLanguage = normalizeLocaleCode(language);
    const normalizedDefaultLocale = normalizeLocaleCode(defaultLocale);
    const direct = fallback[normalizedLanguage];
    const base = fallback[normalizedLanguage.split('-')[0]];
    const defaultValue = fallback[normalizedDefaultLocale] ?? fallback[normalizedDefaultLocale.split('-')[0]];
    const firstValue = Object.values(fallback).find((value) => value !== undefined && value !== null);

    const selected = direct ?? base ?? defaultValue ?? firstValue;
    return selected === undefined || selected === null ? undefined : String(selected);
}

async function resolveTranslations(locale: string, scope: string, keys: string[]): Promise<ResolvePayload> {
    if (keys.length === 0) return {};

    const response = await fetch('/api/translations/resolve', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ locale, scope, keys }),
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Failed to resolve translations: HTTP ${response.status}`);
    }

    return (await response.json()) as ResolvePayload;
}

export function LanguageProvider({ children, messages, overrides, locales, defaultLocale = 'id', scope = 'backend', version = 1 }: LanguageProviderProps) {
    const normalizedDefaultLocale = normalizeLocaleCode(defaultLocale) || 'id';
    const initialMessages = useMemo(() => normalizeMessages(messages ?? overrides), [messages, overrides]);
    const localeOptions = useMemo(
        () => normalizeLocales(initialMessages, locales, normalizedDefaultLocale),
        [initialMessages, locales, normalizedDefaultLocale],
    );
    const [language, setLanguageState] = useState<Language>(normalizedDefaultLocale);
    const [activeMessages, setActiveMessages] = useState<Dictionaries>(initialMessages);
    const [loading, setLoading] = useState(false);

    const requestedKeys = useRef(new Set<string>());
    const pendingKeys = useRef(new Set<string>());
    const inFlightKeys = useRef(new Set<string>());
    const loadedMissingKeys = useRef(new Set<string>());
    const timerRef = useRef<number | null>(null);
    const languageRef = useRef(language);
    const scopeRef = useRef(scope);
    const versionRef = useRef(version);

    useEffect(() => {
        languageRef.current = language;
    }, [language]);

    useEffect(() => {
        scopeRef.current = scope;
    }, [scope]);

    useEffect(() => {
        setActiveMessages((current) => ({
            ...current,
            ...initialMessages,
        }));
    }, [initialMessages]);

    const flushPendingKeys = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        const keys = Array.from(pendingKeys.current).filter((key) => !inFlightKeys.current.has(`${languageRef.current}:${key}`));
        pendingKeys.current.clear();

        if (keys.length === 0) return;

        const locale = languageRef.current;
        const activeScope = scopeRef.current;
        keys.forEach((key) => inFlightKeys.current.add(`${locale}:${key}`));
        setLoading(true);

        resolveTranslations(locale, activeScope, keys)
            .then((payload) => {
                const messages = payload.messages ?? {};
                const sources = payload.sources ?? {};

                setActiveMessages((current) => {
                    const next: Dictionaries = { ...current };

                    Object.entries(messages).forEach(([key, value]) => {
                        const sourceLocale = normalizeLocaleCode(sources[key]?.locale ?? locale);
                        const targetLocale = sourceLocale || locale;

                        next[targetLocale] = {
                            ...(next[targetLocale] ?? {}),
                            [key]: value,
                        };
                    });

                    return next;
                });

                keys.forEach((key) => {
                    const sourceLocale = normalizeLocaleCode(sources[key]?.locale ?? '');
                    if (messages[key] === undefined || (sourceLocale && sourceLocale !== locale)) {
                        loadedMissingKeys.current.add(`${locale}:${key}`);
                    }
                });
            })
            .catch(() => {
                keys.forEach((key) => loadedMissingKeys.current.add(`${locale}:${key}`));
            })
            .finally(() => {
                keys.forEach((key) => inFlightKeys.current.delete(`${locale}:${key}`));
                setLoading(false);
            });
    }, []);

    const queueKeys = useCallback(
        (keys: string | string[]) => {
            const normalizedKeys = normalizeTranslationKeys(keys);
            const locale = languageRef.current;

            normalizedKeys.forEach((key) => {
                requestedKeys.current.add(key);

                const cacheKey = `${locale}:${key}`;
                if (activeMessages[locale]?.[key] !== undefined || inFlightKeys.current.has(cacheKey) || loadedMissingKeys.current.has(cacheKey)) {
                    return;
                }
                pendingKeys.current.add(key);
            });

            if (typeof window !== 'undefined' && pendingKeys.current.size > 0 && timerRef.current === null) {
                timerRef.current = window.setTimeout(flushPendingKeys, 40);
            }
        },
        [activeMessages, flushPendingKeys],
    );

    const refreshRequestedKeys = useCallback(() => {
        const locale = languageRef.current;

        requestedKeys.current.forEach((key) => {
            const cacheKey = `${locale}:${key}`;
            loadedMissingKeys.current.delete(cacheKey);

            if (!inFlightKeys.current.has(cacheKey)) {
                pendingKeys.current.add(key);
            }
        });

        if (typeof window !== 'undefined' && pendingKeys.current.size > 0 && timerRef.current === null) {
            timerRef.current = window.setTimeout(flushPendingKeys, 40);
        }
    }, [flushPendingKeys]);

    useEffect(() => {
        return () => {
            if (timerRef.current !== null) {
                window.clearTimeout(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const unsubscribe = router.on('success', (event) => {
            const props = ((event.detail.page.props ?? {}) as TranslationPageProps) || {};
            const nextScope = props.translation_scope ?? scopeRef.current;
            const nextVersion = Number(props.translation_version ?? versionRef.current);
            const scopeChanged = nextScope !== scopeRef.current;
            const versionChanged = nextVersion !== versionRef.current;

            scopeRef.current = nextScope;
            versionRef.current = nextVersion;

            if (props.translations) {
                setActiveMessages((current) => ({
                    ...current,
                    ...normalizeMessages(props.translations),
                }));
            }

            if (scopeChanged || versionChanged) {
                refreshRequestedKeys();
            }
        });

        return () => {
            unsubscribe();
        };
    }, [refreshRequestedKeys]);

    useEffect(() => {
        const saved = localStorage.getItem('language');
        const availableCodes = localeOptions.map((locale) => locale.code);

        if (saved && availableCodes.includes(saved)) {
            setLanguageState(saved);
            document.documentElement.lang = saved;
            return;
        }

        const browserLanguage = normalizeLocaleCode(navigator.language || '');
        const browserBaseLanguage = browserLanguage.split('-')[0] ?? '';
        const fallbackLanguage = availableCodes.includes(normalizedDefaultLocale)
            ? normalizedDefaultLocale
            : availableCodes.includes(browserLanguage)
              ? browserLanguage
              : availableCodes.includes(browserBaseLanguage)
                ? browserBaseLanguage
                : (availableCodes[0] ?? normalizedDefaultLocale);
        setLanguageState(fallbackLanguage);
        localStorage.setItem('language', fallbackLanguage);
        document.documentElement.lang = fallbackLanguage;
    }, [localeOptions, normalizedDefaultLocale]);

    const setLanguage = (nextLanguage: Language) => {
        const normalizedLanguage = normalizeLocaleCode(nextLanguage);
        const availableCodes = localeOptions.map((locale) => locale.code);
        const selectedLanguage = availableCodes.includes(normalizedLanguage) ? normalizedLanguage : (availableCodes[0] ?? normalizedDefaultLocale);

        languageRef.current = selectedLanguage;

        pendingKeys.current.clear();
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        Array.from(loadedMissingKeys.current).forEach((cacheKey) => {
            if (cacheKey.startsWith(`${selectedLanguage}:`)) {
                loadedMissingKeys.current.delete(cacheKey);
            }
        });

        setLanguageState(selectedLanguage);
        localStorage.setItem('language', selectedLanguage);
        document.documentElement.lang = selectedLanguage;
    };

    const updateOverrides = (nextMessages?: Partial<Dictionaries>) => {
        setActiveMessages((current) => ({
            ...current,
            ...normalizeMessages(nextMessages),
        }));
    };

    const dictionaries = useMemo<Dictionaries>(() => normalizeMessages(activeMessages), [activeMessages]);

    const activeLocaleOptions = useMemo(
        () => normalizeLocales(dictionaries, localeOptions, normalizedDefaultLocale),
        [dictionaries, localeOptions, normalizedDefaultLocale],
    );
    const keys = useMemo(
        () => Array.from(new Set(Object.values(dictionaries).flatMap((dictionary) => Object.keys(dictionary)))).sort(),
        [dictionaries],
    );

    const value = useMemo<LanguageContextValue>(
        () => ({
            language,
            setLanguage,
            updateOverrides,
            preload: queueKeys,
            dictionaries,
            locales: activeLocaleOptions,
            keys,
            loading,
            t: (key, replacements = {}) => {
                requestedKeys.current.add(key);

                const translated = dictionaries[language]?.[key];
                const dictionaryFallback =
                    language === normalizedDefaultLocale
                        ? (dictionaries[normalizedDefaultLocale]?.[key] ?? Object.values(dictionaries).find((dictionary) => dictionary[key])?.[key])
                        : undefined;
                const fallbackValue = replacements.fallback as FallbackValue | undefined;
                const explicitFallback = resolveFallbackValue(fallbackValue, language, normalizedDefaultLocale);
                const selectedLocaleFallback = resolveExactFallbackValue(fallbackValue, language);
                const defaultLocaleFallback = resolveExactFallbackValue(fallbackValue, normalizedDefaultLocale);

                const isStaleDefaultValue =
                    language !== normalizedDefaultLocale &&
                    translated !== undefined &&
                    selectedLocaleFallback !== undefined &&
                    defaultLocaleFallback !== undefined &&
                    selectedLocaleFallback !== defaultLocaleFallback &&
                    translated === defaultLocaleFallback;

                const isGenericTitleDescription =
                    translated !== undefined &&
                    explicitFallback !== undefined &&
                    ['Title', 'Description'].includes(String(translated)) &&
                    /\.(title|description)$/i.test(key) &&
                    String(translated) !== explicitFallback;

                let text =
                    translated !== undefined && translated !== '' && !isStaleDefaultValue && !isGenericTitleDescription
                        ? translated
                        : (explicitFallback ?? dictionaryFallback ?? humanizeTranslationKey(key));

                if (translated === undefined) {
                    queueKeys(key);
                }

                Object.entries(replacements)
                    .filter(([placeholder]) => placeholder !== 'fallback')
                    .sort(([left], [right]) => right.length - left.length)
                    .forEach(([placeholder, value]) => {
                        const replacement = String(value ?? '');
                        text = text.replaceAll(`:${placeholder}`, replacement).replaceAll(`{${placeholder}}`, replacement);
                    });

                return text;
            },
        }),
        [language, dictionaries, activeLocaleOptions, keys, loading, normalizedDefaultLocale, queueKeys],
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error('useLanguage must be used inside LanguageProvider');
    }

    return context;
}
