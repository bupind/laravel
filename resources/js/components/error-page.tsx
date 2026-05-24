import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Home, LogIn, RefreshCw, ShieldAlert } from 'lucide-react';

type ErrorStatus = 400 | 401 | 403 | 404 | 500;

interface ErrorPageProps {
    status: ErrorStatus;

    context?: 'frontend' | 'backend';

    title?: string;

    message?: string;
}

interface ErrorConfig {
    title: string;
    message: string;
    Icon: typeof AlertTriangle;

    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
        icon: typeof Home;
    };
}

const ERROR_CONFIG: Record<ErrorStatus, ErrorConfig> = {
    400: {
        title: 'Bad Request',
        message: 'Request tidak dapat diproses karena format atau parameter tidak valid.',
        Icon: AlertTriangle,
    },
    401: {
        title: 'Authorization Required',
        message: 'Anda perlu login atau mengirim credential yang valid untuk mengakses halaman ini.',
        Icon: LogIn,
        action: {
            label: 'Login',
            href: '/login',
            icon: LogIn,
        },
    },
    403: {
        title: 'Forbidden',
        message: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
        Icon: ShieldAlert,
        action: {
            label: 'Ke Beranda',
            href: '/',
            icon: Home,
        },
    },
    404: {
        title: 'Halaman Tidak Ditemukan',
        message: 'Halaman yang Anda cari tidak ditemukan atau sudah dipindahkan.',
        Icon: AlertTriangle,
        action: {
            label: 'Ke Beranda',
            href: '/',
            icon: Home,
        },
    },
    500: {
        title: 'Internal Server Error',
        message: 'Server mengalami kendala saat memproses request ini. Silakan coba beberapa saat lagi.',
        Icon: RefreshCw,
        action: {
            label: 'Coba Lagi',
            onClick: () => window.location.reload(),
            icon: RefreshCw,
        },
    },
} as const;

export default function ErrorPage({ status, context = 'frontend', title, message }: ErrorPageProps) {
    const { t } = useLanguage();
    const config = ERROR_CONFIG[status];
    const { Icon } = config;

    const pageTitle = title ?? config.title;
    const pageMessage = message ?? config.message;
    const extraAction = config.action
        ? {
              ...config.action,
              href: context === 'backend' && config.action.href === '/' ? '/backend/dashboard' : config.action.href,
              label:
                  context === 'backend' && config.action.href === '/'
                      ? t('pages.dashboard.title')
                      : config.action.label === 'Login'
                        ? t('buttons.login')
                        : config.action.label,
          }
        : undefined;

    return (
        <>
            <Head title={`${status} – ${pageTitle}`} />

            <main className="bg-background text-foreground flex min-h-[calc(100svh-8rem)] items-center justify-center px-4 py-12">
                <section className="w-full max-w-xl text-center">
                    <div className="bg-muted mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg border">
                        <Icon className="text-muted-foreground h-7 w-7" aria-hidden="true" />
                    </div>

                    <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">Error {status}</p>

                    <h1 className="mt-2 text-3xl font-semibold tracking-tight">{pageTitle}</h1>

                    <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-6">{pageMessage}</p>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button variant="outline" type="button" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4" />
                            {t('buttons.back')}
                        </Button>

                        {extraAction &&
                            (extraAction.href ? (
                                <Button asChild>
                                    <Link href={extraAction.href}>
                                        <extraAction.icon className="h-4 w-4" />
                                        {extraAction.label}
                                    </Link>
                                </Button>
                            ) : (
                                <Button type="button" onClick={extraAction.onClick}>
                                    <extraAction.icon className="h-4 w-4" />
                                    {extraAction.label}
                                </Button>
                            ))}
                    </div>
                </section>
            </main>
        </>
    );
}
