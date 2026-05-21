import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Toaster } from '@/components/ui/sonner';
import { useLanguage } from '@/hooks/use-language';
import { type BreadcrumbItem, type Setting } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { type CSSProperties, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type FlashMessage = string | { key?: string; replacements?: Record<string, string | number> };

interface FlashProps {
    success?: FlashMessage;
    error?: FlashMessage;
}

interface Props {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

const layoutTitleTranslationKeys: Record<string, string> = {
    'Audit Logs': 'pages.auditLogs.title',
    Backup: 'pages.backup.title',
    Categories: 'pages.categories.title',
    'File Management': 'pages.files.title',
    'File Manager': 'pages.files.title',
    'Menu Management': 'pages.menus.title',
    'Permission Management': 'pages.permissions.title',
    'Role Management': 'pages.roles.title',
    Tags: 'pages.tags.title',
    Translations: 'settings.translations.title',
    'Manajemen User': 'users.title',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveFlashMessage(message: FlashMessage | undefined, t: (key: string, replacements?: Record<string, string | number>) => string): string {
    if (!message) return '';
    if (typeof message === 'string') return t(message);
    if (typeof message.key === 'string') return t(message.key, message.replacements ?? {});
    return '';
}

// ─── Flash Hook ───────────────────────────────────────────────────────────────

function useFlashToast(flash: FlashProps | undefined) {
    const { t } = useLanguage();

    useEffect(() => {
        const successText = resolveFlashMessage(flash?.success, t);
        const errorText = resolveFlashMessage(flash?.error, t);

        if (successText) toast.success(successText);
        if (errorText) toast.error(errorText);

        // Hanya bergantung pada nilai flash, bukan referensi fungsi `t`,
        // agar tidak menyebabkan re-trigger saat referensi `t` berubah.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flash?.success, flash?.error]);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppSidebarLayout({ children, breadcrumbs = [], title }: Props) {
    const { props } = usePage();
    const { t } = useLanguage();

    const flash = props?.flash as FlashProps | undefined;
    const setting = props?.setting as Setting | undefined;

    useFlashToast(flash);

    const primaryColor = setting?.warna ?? '#0ea5e9';
    const primaryForeground = '#ffffff';

    // Inline CSS variables untuk wrapper div
    const themeVars = useMemo<CSSProperties>(
        () => ({
            '--primary': primaryColor,
            '--primary-foreground': primaryForeground,
            '--color-primary': primaryColor,
            '--color-primary-foreground': primaryForeground,
        }),
        [primaryColor],
    );

    // Global <style> diinjeksi ke <head> agar CSS variables tersedia secara global
    const themeStyle = useMemo(
        () => `
            :root {
                --primary: ${primaryColor};
                --color-primary: ${primaryColor};
                --primary-foreground: ${primaryForeground};
                --color-primary-foreground: ${primaryForeground};
            }
            .dark {
                --primary: ${primaryColor};
                --color-primary: ${primaryColor};
                --primary-foreground: ${primaryForeground};
                --color-primary-foreground: ${primaryForeground};
            }
        `,
        [primaryColor],
    );

    const breadcrumbTitle = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1]?.title : undefined;
    const translatedBreadcrumbTitle = breadcrumbTitle ? t(layoutTitleTranslationKeys[breadcrumbTitle] ?? breadcrumbTitle) : undefined;
    const pageTitle = title ?? translatedBreadcrumbTitle ?? setting?.seo?.title ?? setting?.nama_app ?? 'Dashboard';

    return (
        <>
            <Head>
                <title>{pageTitle}</title>

                {setting?.seo?.description && <meta name="description" content={setting.seo.description} />}

                {setting?.seo?.keywords && <meta name="keywords" content={setting.seo.keywords} />}

                {/* Warna primary dinamis agar Tailwind CSS variables bekerja secara global */}
                <style>{themeStyle}</style>
            </Head>

            <div style={themeVars}>
                <AppShell variant="sidebar">
                    <AppSidebar />
                    <AppContent variant="sidebar">
                        <AppSidebarHeader breadcrumbs={breadcrumbs} />
                        {children}
                    </AppContent>
                </AppShell>
            </div>

            {/* Toaster di luar div tema agar portal z-index tidak terpengaruh */}
            <Toaster />
        </>
    );
}
