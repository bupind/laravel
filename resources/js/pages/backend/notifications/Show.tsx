import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BackendLayout from '@/layouts/backend-layout';
import { type BreadcrumbItem, type NotificationItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    notification: NotificationItem;
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

export default function NotificationDetail({ notification }: Props) {
    const errors = Array.isArray(notification.data.meta?.errors) ? notification.data.meta.errors : [];
    const isError = notification.data.status === 'error';
    const title = notification.data.title ?? 'Notification';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Notifications',
            href: '/backend/notifications',
        },
        {
            title,
            href: `/backend/notifications/${notification.id}`,
        },
    ];

    return (
        <BackendLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground text-sm">{formatDate(notification.created_at)}</p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => router.get('/backend/notifications')}>
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Button>
                </div>

                <Card>
                    <CardHeader className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-base">{title}</CardTitle>
                            <Badge variant={isError ? 'destructive' : 'default'}>{isError ? 'Error' : 'Success'}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{notification.data.message}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {errors.length > 0 ? (
                            <div className="border-destructive/20 bg-destructive/5 rounded-md border p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h2 className="text-sm font-semibold">Detail Error</h2>
                                    <Badge variant="outline">{errors.length} error</Badge>
                                </div>
                                <ol className="space-y-2 pl-5 text-sm">
                                    {errors.map((error, index) => (
                                        <li key={`${notification.id}-${index}`} className="text-destructive list-decimal leading-relaxed">
                                            {error}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        ) : (
                            <div className="text-muted-foreground rounded-md border p-4 text-sm">Tidak ada detail error.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </BackendLayout>
    );
}
