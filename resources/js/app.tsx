import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';
import { LanguageProvider, type LocaleOption } from './hooks/use-language';

declare global {
    const route: typeof routeFn;
}

interface Setting {
    nama_app?: string;
    seo?: { title?: string | null };
}

interface InitialPageProps {
    translations?: Record<string, Record<string, string> | undefined>;
    translation_locales?: LocaleOption[];
    setting?: Setting;
}

function resolveAppName(): string {
    try {
        const raw = document.getElementById('app')?.dataset.page;
        if (!raw) throw new Error();
        const setting = (JSON.parse(raw)?.props?.setting ?? {}) as Setting;
        return setting.seo?.title || setting.nama_app || import.meta.env.VITE_APP_NAME || 'App';
    } catch {
        return import.meta.env.VITE_APP_NAME || 'App';
    }
}

createInertiaApp({
    title: (title) => {
        const appName = resolveAppName();
        return title ? `${title} – ${appName}` : appName;
    },

    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),

    setup({ el, App, props }) {
        const pageProps = (props.initialPage?.props ?? {}) as InitialPageProps;
        const messages = pageProps.translations ?? {};
        const locales = pageProps.translation_locales ?? [];

        createRoot(el).render(
            <StrictMode>
                <LanguageProvider messages={messages} locales={locales}>
                    <App {...props} />
                </LanguageProvider>
            </StrictMode>,
        );
    },

    progress: { color: '#4B5563' },
});

initializeTheme();
