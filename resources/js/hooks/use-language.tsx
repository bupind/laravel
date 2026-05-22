import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type LocaleOption = {
    code: string;
    label: string;
};

type Language = string;
type Dictionary = Record<string, string>;
type Dictionaries = Record<Language, Dictionary>;

type LanguageContextValue = {
    language: Language;
    setLanguage: (language: Language) => void;
    updateOverrides: (messages?: Partial<Dictionaries>) => void;
    dictionaries: Dictionaries;
    locales: LocaleOption[];
    keys: string[];
    t: (key: string, replacements?: Record<string, string | number>) => string;
};

type LanguageProviderProps = {
    children: React.ReactNode;
    messages?: Partial<Dictionaries>;
    overrides?: Partial<Dictionaries>;
    locales?: LocaleOption[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function normalizeMessages(messages?: Partial<Dictionaries>): Dictionaries {
    return Object.fromEntries(
        Object.entries(messages ?? {})
            .map(([locale, dictionary]) => [normalizeLocaleCode(locale), dictionary ?? {}])
            .filter(([locale]) => locale),
    );
}

function normalizeLocaleCode(locale: string): string {
    return locale.trim().toLowerCase().replaceAll('_', '-');
}

function normalizeLocales(messages: Dictionaries, locales?: LocaleOption[]): LocaleOption[] {
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

    for (const fallback of ['en', 'id']) {
        if (!nextLocales.some((locale) => locale.code === fallback)) {
            nextLocales.unshift({ code: fallback, label: fallback === 'id' ? 'Bahasa Indonesia' : 'English' });
        }
    }

    return nextLocales.filter((locale, index, all) => locale.code && all.findIndex((item) => item.code === locale.code) === index);
}

export function LanguageProvider({ children, messages, overrides, locales }: LanguageProviderProps) {
    const initialMessages = useMemo(() => normalizeMessages(messages ?? overrides), [messages, overrides]);
    const localeOptions = useMemo(() => normalizeLocales(initialMessages, locales), [initialMessages, locales]);
    const [language, setLanguageState] = useState<Language>(localeOptions[0]?.code ?? 'id');
    const [activeMessages, setActiveMessages] = useState<Dictionaries>(initialMessages);

    useEffect(() => {
        setActiveMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        const saved = localStorage.getItem('language');
        const availableCodes = localeOptions.map((locale) => locale.code);

        if (saved && availableCodes.includes(saved)) {
            setLanguageState(saved);
            document.documentElement.lang = saved;
            return;
        }

        const fallbackLanguage = availableCodes.includes('id') ? 'id' : (availableCodes[0] ?? 'id');
        setLanguageState(fallbackLanguage);
        document.documentElement.lang = fallbackLanguage;
    }, [localeOptions]);

    const setLanguage = (nextLanguage: Language) => {
        const normalizedLanguage = normalizeLocaleCode(nextLanguage);
        const availableCodes = localeOptions.map((locale) => locale.code);
        const selectedLanguage = availableCodes.includes(normalizedLanguage) ? normalizedLanguage : (availableCodes[0] ?? 'id');

        setLanguageState(selectedLanguage);
        localStorage.setItem('language', selectedLanguage);
        document.documentElement.lang = selectedLanguage;
    };

    const updateOverrides = (nextMessages?: Partial<Dictionaries>) => {
        setActiveMessages(normalizeMessages(nextMessages));
    };

    const dictionaries = useMemo<Dictionaries>(() => normalizeMessages(activeMessages), [activeMessages]);

    const activeLocaleOptions = useMemo(() => normalizeLocales(dictionaries, localeOptions), [dictionaries, localeOptions]);

    const keys = useMemo(
        () => Array.from(new Set(Object.values(dictionaries).flatMap((dictionary) => Object.keys(dictionary)))).sort(),
        [dictionaries],
    );

    const value = useMemo<LanguageContextValue>(
        () => ({
            language,
            setLanguage,
            updateOverrides,
            dictionaries,
            locales: activeLocaleOptions,
            keys,
            t: (key, replacements = {}) => {
                const translated = dictionaries[language]?.[key];
                let text = translated !== undefined && translated !== '' ? translated : (dictionaries.id?.[key] ?? dictionaries.en?.[key] ?? key);

                Object.entries(replacements)
                    .sort(([left], [right]) => right.length - left.length)
                    .forEach(([placeholder, value]) => {
                        const replacement = String(value);
                        text = text.replaceAll(`:${placeholder}`, replacement).replaceAll(`{${placeholder}}`, replacement);
                    });

                return text;
            },
        }),
        [language, dictionaries, activeLocaleOptions, keys],
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
