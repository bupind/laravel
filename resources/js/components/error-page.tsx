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
        title: 'errors.badRequest.title',
        message: 'errors.badRequest.message',
        Icon: AlertTriangle,
    },
    401: {
        title: 'errors.unauthorized.title',
        message: 'errors.unauthorized.message',
        Icon: LogIn,
        action: {
            label: 'buttons.login',
            href: '/login',
            icon: LogIn,
        },
    },
    403: {
        title: 'errors.forbidden.title',
        message: 'errors.forbidden.message',
        Icon: ShieldAlert,
        action: {
            label: 'buttons.backHome',
            href: '/',
            icon: Home,
        },
    },
    404: {
        title: 'errors.notFound.title',
        message: 'errors.notFound.message',
        Icon: AlertTriangle,
        action: {
            label: 'buttons.backHome',
            href: '/',
            icon: Home,
        },
    },
    500: {
        title: 'errors.serverError.title',
        message: 'errors.serverError.message',
        Icon: RefreshCw,
        action: {
            label: 'buttons.retry',
            onClick: () => window.location.reload(),
            icon: RefreshCw,
        },
    },
} as const;

export default function ErrorPage({ status, context = 'frontend', title, message }: ErrorPageProps) {
    const { t } = useLanguage();
    const config = ERROR_CONFIG[status];
    const { Icon } = config;

    const pageTitle = title ?? t(config.title);
    const pageMessage = message ?? t(config.message);
    const extraAction = config.action
        ? {
              ...config.action,
              href: context === 'backend' && config.action.href === '/' ? '/backend/dashboard' : config.action.href,
              label: t(config.action.label),
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

                    <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
                        {t('errors.label')} {status}
                    </p>

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
