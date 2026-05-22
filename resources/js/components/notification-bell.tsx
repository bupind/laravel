import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Inbox } from 'lucide-react';

function formatDate(value?: string | null): string {
    if (!value) return '';

    try {
        return new Date(value).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '';
    }
}

export function NotificationBell() {
    const { auth } = usePage<SharedData>().props;
    const notifications = auth.notifications;
    const items = notifications?.items ?? [];
    const unreadCount = notifications?.unread_count ?? 0;

    const openDetail = (id: string) => router.get(`/backend/notifications/${id}`);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                    <Button type="button" variant="ghost" size="sm" className="h-7 px-2" asChild>
                        <Link href="/backend/notifications">
                            <Inbox className="h-3.5 w-3.5" />
                            Inbox
                        </Link>
                    </Button>
                </div>
                <DropdownMenuSeparator />
                {items.length === 0 ? (
                    <div className="text-muted-foreground px-2 py-6 text-center text-sm">Belum ada notifikasi.</div>
                ) : (
                    items.map((item) => {
                        const status = item.data.status ?? 'info';
                        const isUnread = !item.read_at;

                        return (
                            <DropdownMenuItem key={item.id} className="items-start gap-3 py-3" onSelect={() => openDetail(item.id)}>
                                <span
                                    className={
                                        status === 'error'
                                            ? 'bg-destructive mt-1 h-2 w-2 shrink-0 rounded-full'
                                            : 'bg-primary mt-1 h-2 w-2 shrink-0 rounded-full'
                                    }
                                />
                                <span className="min-w-0 flex-1">
                                    <span className={isUnread ? 'block text-sm font-semibold' : 'block text-sm font-medium'}>
                                        {item.data.title ?? 'Notification'}
                                    </span>
                                    <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">{item.data.message ?? ''}</span>
                                    {Array.isArray(item.data.meta?.errors) && item.data.meta.errors.length > 0 && (
                                        <span className="text-destructive mt-1 block truncate text-xs">{item.data.meta.errors[0]}</span>
                                    )}
                                    <span className="text-muted-foreground mt-1 block text-[11px]">{formatDate(item.created_at)}</span>
                                </span>
                            </DropdownMenuItem>
                        );
                    })
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
