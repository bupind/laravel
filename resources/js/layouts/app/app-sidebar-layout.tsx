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

function resolveFlashMessage(message: FlashMessage | undefined, t: (key: string, replacements?: Record<string, string | number>) => string): string {
    if (!message) return '';
    if (typeof message === 'string') return t(message);
    if (typeof message.key === 'string') return t(message.key, message.replacements ?? {});
    return '';
}

function useFlashToast(flash: FlashProps | undefined) {
    const { t } = useLanguage();

    useEffect(() => {
        const successText = resolveFlashMessage(flash?.success, t);
        const errorText = resolveFlashMessage(flash?.error, t);

        if (successText) toast.success(successText);
        if (errorText) toast.error(errorText);
    }, [flash?.success, flash?.error]);
}

export default function AppSidebarLayout({ children, breadcrumbs = [], title }: Props) {
    const { props } = usePage();
    const { t } = useLanguage();

    const flash = props?.flash as FlashProps | undefined;
    const setting = props?.setting as Setting | undefined;

    useFlashToast(flash);

    const primaryColor = setting?.warna ?? '#0ea5e9';
    const primaryForeground = '#ffffff';

    const themeVars = useMemo<CSSProperties>(
        () => ({
            '--primary': primaryColor,
            '--primary-foreground': primaryForeground,
            '--color-primary': primaryColor,
            '--color-primary-foreground': primaryForeground,
        }),
        [primaryColor],
    );

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
    const pageTitle = title ?? breadcrumbTitle ?? setting?.seo?.title ?? setting?.nama_app ?? t('pages.dashboard.title');

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
