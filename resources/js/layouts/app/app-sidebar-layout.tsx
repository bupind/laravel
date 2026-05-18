import { useEffect, type CSSProperties } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/use-language';

type FlashMessage = string | { key?: string; replacements?: Record<string, string | number> };

interface Props {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
}

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
  title = 'Dashboard',
}: Props) {
  const { props } = usePage();
  const { t } = useLanguage();
  const successMessage = (props?.flash as { success?: FlashMessage } | undefined)?.success;
  const errorMessage = (props?.flash as { error?: FlashMessage } | undefined)?.error;

  const setting = props?.setting as {
    nama_app: string;
    logo?: string;
    warna?: string;
    seo?: {
      title?: string;
      description?: string;
      keywords?: string;
    };
  };

  useEffect(() => {
    const resolveFlashMessage = (message?: FlashMessage) => {
      if (!message) return '';

      if (typeof message === 'string') {
        return t(message);
      }

      if (typeof message.key === 'string') {
        return t(message.key, message.replacements ?? {});
      }

      return '';
    };

    const successText = resolveFlashMessage(successMessage);
    const errorText = resolveFlashMessage(errorMessage);

    if (successText) toast.success(successText);
    if (errorText) toast.error(errorText);
  }, [successMessage, errorMessage, t]);

  const primaryColor = setting?.warna || '#0ea5e9';
  const primaryForeground = '#ffffff';
  const themeVars = {
    '--primary': primaryColor,
    '--primary-foreground': primaryForeground,
    '--color-primary': primaryColor,
    '--color-primary-foreground': primaryForeground,
  } satisfies CSSProperties;

  return (
    <>
      <Head>
        <title>{title ?? setting?.seo?.title ?? setting?.nama_app ?? 'Dashboard'}</title>
        {setting?.seo?.description && (
          <meta name="description" content={setting.seo.description} />
        )}
        {setting?.seo?.keywords && (
          <meta name="keywords" content={setting.seo.keywords} />
        )}
        <style>
          {`
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
          `}
        </style>
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

      <Toaster />
    </>
  );
}
