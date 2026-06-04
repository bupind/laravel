import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import BackendLayout from '@/layouts/backend-layout';
import { type BreadcrumbItem, type NotificationItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedNotifications {
    data: NotificationItem[];
    links: PaginationLink[];
}

interface Props {
    notifications: PaginatedNotifications;
}

function formatDate(value?: string | null): string {
    if (!value) return '';

    try {
        return new Date(value).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '';
    }
}

function cleanLabel(label: string): string {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

export default function NotificationInbox({ notifications }: Props) {
    const { t } = useLanguage();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('notifications.title'),
            href: '/backend/notifications',
        },
    ];

    const markAsRead = (id: string) => {
        router.post(
            `/backend/notifications/${id}/read`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <BackendLayout breadcrumbs={breadcrumbs}>
            <Head title={t('notifications.title')} />

            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('notifications.title')}</h1>
                    <p className="text-muted-foreground text-sm">{t('notifications.description')}</p>
                </div>

                <div className="space-y-3">
                    {notifications.data.length === 0 ? (
                        <Card>
                            <CardContent className="text-muted-foreground py-10 text-center text-sm">{t('notifications.empty')}</CardContent>
                        </Card>
                    ) : (
                        notifications.data.map((item) => {
                            const errors = Array.isArray(item.data.meta?.errors) ? item.data.meta.errors : [];
                            const isError = item.data.status === 'error';
                            const isUnread = !item.read_at;

                            return (
                                <Card key={item.id} className={isUnread ? 'border-primary/40' : undefined}>
                                    <CardHeader className="space-y-2">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <CardTitle className="text-base">
                                                        <Link href={`/backend/notifications/${item.id}`} className="hover:underline">
                                                            {item.data.title ?? t('notifications.itemFallback')}
                                                        </Link>
                                                    </CardTitle>
                                                    <Badge variant={isError ? 'destructive' : 'default'}>
                                                        {isError ? t('notifications.status.error') : t('notifications.status.success')}
                                                    </Badge>
                                                    {isUnread && <Badge variant="secondary">{t('notifications.status.unread')}</Badge>}
                                                </div>
                                                <p className="text-muted-foreground text-sm">{item.data.message}</p>
                                                <p className="text-muted-foreground text-xs">{formatDate(item.created_at)}</p>
                                            </div>
                                            {isUnread && (
                                                <Button type="button" variant="outline" size="sm" onClick={() => markAsRead(item.id)}>
                                                    {t('notifications.markAsRead')}
                                                </Button>
                                            )}
                                            <Button type="button" variant="secondary" size="sm" asChild>
                                                <Link href={`/backend/notifications/${item.id}`}>{t('buttons.detail')}</Link>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    {errors.length > 0 && (
                                        <CardContent>
                                            <div className="border-destructive/20 bg-destructive/5 max-h-96 overflow-y-auto rounded-md border p-3">
                                                <ol className="space-y-1 pl-5 text-sm">
                                                    {errors.map((error, index) => (
                                                        <li key={`${item.id}-${index}`} className="text-destructive list-decimal leading-relaxed">
                                                            {error}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })
                    )}
                </div>

                {notifications.links.length > 3 && (
                    <div className="flex flex-wrap gap-2">
                        {notifications.links.map((link, index) => (
                            <Button
                                key={`${link.label}-${index}`}
                                type="button"
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                            >
                                {cleanLabel(link.label)}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </BackendLayout>
    );
}
