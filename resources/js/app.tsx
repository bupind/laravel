/**
 * app.tsx – Inertia React entry point
 * ─────────────────────────────────────────────────────────────────
 * CATATAN KEAMANAN:
 *  - `route()` helper di-expose sebagai global constant (bukan window property)
 *    sehingga Ziggy config tidak mudah di-inspect melalui browser console.
 *  - Jangan lakukan `window.__ziggy = Ziggy` atau serialize Ziggy ke JSON
 *    di tempat lain.
 */

import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';
import { LanguageProvider, type LocaleOption } from './hooks/use-language';

// ─── Types ────────────────────────────────────────────────────────────────────

declare global {
    /** Ziggy route helper — tidak di-attach ke window agar tidak mudah di-scrape. */
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Baca nama app dari shared Inertia props.
 * Prioritas: seo.title (dari DB) → nama_app (dari DB) → VITE_APP_NAME → 'App'
 *
 * Kenapa baca dari dataset bukan closure?
 * Karena `title()` dipanggil sebelum React mount, jadi kita baca
 * langsung dari JSON yang di-embed Laravel di atribut data-page.
 */
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

// ─── Bootstrap ────────────────────────────────────────────────────────────────

createInertiaApp({
    // Format: "Page Title – Nama App", atau hanya Nama App jika tidak ada title.
    // Nama app dibaca dari database (setting.seo.title / setting.nama_app)
    // sehingga otomatis update tanpa perlu ubah .env.
    title: (title) => {
        const appName = resolveAppName();
        return title ? `${title} – ${appName}` : appName;
    },

    resolve: (name) =>
        resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),

    setup({ el, App, props }) {
        const pageProps = (props.initialPage?.props ?? {}) as InitialPageProps;
        const messages = pageProps.translations ?? {};
        const locales  = pageProps.translation_locales ?? [];

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

// Inisialisasi theme (dark/light) sebelum render pertama untuk menghindari FOUC
initializeTheme();
