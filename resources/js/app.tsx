import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { ReactNode } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';
import { LanguageProvider, type LocaleOption } from './hooks/use-language';
import BackendLayout from './layouts/backend-layout';
import FrontendLayout from './layouts/frontend-layout';

declare global {
    const route: typeof routeFn;
}

interface Setting {
    app_name?: string;
    seo?: { title?: string | null };
}

interface InitialPageProps {
    translations?: Record<string, Record<string, string> | undefined>;
    translation_locales?: LocaleOption[];
    translation_default_locale?: string;
    translation_scope?: string;
    translation_version?: number;
    setting?: Setting;
}

function resolveAppName(): string {
    try {
        const raw = document.getElementById('app')?.dataset.page;
        if (!raw) throw new Error();
        const setting = (JSON.parse(raw)?.props?.setting ?? {}) as Setting;
        return setting.seo?.title || setting.app_name || import.meta.env.VITE_APP_NAME || 'App';
    } catch {
        return import.meta.env.VITE_APP_NAME || 'App';
    }
}

type PageModule = {
    default?: {
        layout?: (page: ReactNode) => ReactNode;
    };
};

const frontendLayout = (page: ReactNode) => <FrontendLayout>{page}</FrontendLayout>;
const backendLayout = (page: ReactNode) => <BackendLayout>{page}</BackendLayout>;

function withDefaultLayout(name: string, pageModule: unknown): unknown {
    const module = pageModule as PageModule;

    if (name.startsWith('frontend/') && module.default) {
        module.default.layout = frontendLayout;
    }

    if (name.startsWith('backend/errors/') && module.default && module.default.layout === undefined) {
        module.default.layout = backendLayout;
    }

    return pageModule;
}

createInertiaApp({
    title: (title) => {
        const appName = resolveAppName();
        return title ? `${title} – ${appName}` : appName;
    },

    resolve: (name) =>
        resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')).then((pageModule) => withDefaultLayout(name, pageModule)),

    setup({ el, App, props }) {
        const pageProps = (props.initialPage?.props ?? {}) as InitialPageProps;
        const messages = pageProps.translations ?? {};
        const locales = pageProps.translation_locales ?? [];
        const defaultLocale = pageProps.translation_default_locale ?? locales[0]?.code ?? 'id';
        const scope = pageProps.translation_scope ?? 'backend';
        const version = pageProps.translation_version ?? 1;

        createRoot(el).render(
            <StrictMode>
                <LanguageProvider messages={messages} locales={locales} defaultLocale={defaultLocale} scope={scope} version={version}>
                    <App {...props} />
                </LanguageProvider>
            </StrictMode>,
        );
    },

    progress: { color: '#4B5563' },
});

initializeTheme();
