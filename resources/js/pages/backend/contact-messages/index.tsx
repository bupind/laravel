import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';
import BackendLayout from '@/layouts/backend-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Mail, Search, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';

type ContactMessage = {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived' | string;
    created_at?: string | null;
    replied_at?: string | null;
};

type LinkItem = { url: string | null; label: string; active: boolean };
type Paginated<T> = { data: T[]; links: LinkItem[]; from?: number; to?: number; total?: number };

type Props = {
    messages: Paginated<ContactMessage>;
    filters: { search?: string; status?: string; per_page?: number };
    stats: { new: number; read: number; replied: number; total: number };
    can: { reply: boolean; delete: boolean };
};

const statusClass: Record<string, string> = {
    new: 'bg-amber-100 text-amber-800',
    read: 'bg-blue-100 text-blue-800',
    replied: 'bg-green-100 text-green-800',
    archived: 'bg-muted text-muted-foreground',
};

export default function ContactMessagesIndex({ messages, filters, stats, can }: Props) {
    const { t } = useLanguage();
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status && filters.status !== '' ? filters.status : 'all');

    const breadcrumbs = useMemo(() => [{ title: t('pages.contactMessages.title', { fallback: 'Contact Messages' }), href: '/backend/contact-messages' }], [t]);

    const applyFilter = () => {
        router.get(
            '/backend/contact-messages',
            {
                search,
                status: status === 'all' ? '' : status,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <BackendLayout breadcrumbs={breadcrumbs}>
            <Head title={t('pages.contactMessages.title', { fallback: 'Contact Messages' })} />
            <div className="space-y-5 p-4 md:p-6">
                <div className="grid gap-2 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-xs">New Messages</p>
                            <p className="text-2xl font-bold">{stats.new}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-xs">Read</p>
                            <p className="text-2xl font-bold">{stats.read}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-xs">Replied</p>
                            <p className="text-2xl font-bold">{stats.replied}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-xs">Total</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>{t('pages.contactMessages.title', { fallback: 'Contact Messages' })}</CardTitle>
                            <CardDescription>
                                {t('pages.contactMessages.description', {
                                    fallback: 'Pesan dari form contact frontend. Admin dapat membaca dan membalas melalui email.',
                                })}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1 sm:flex-row">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search message..."
                                className="w-full sm:w-64"
                            />
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full sm:w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                    <SelectItem value="replied">Replied</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="button" onClick={applyFilter} className="gap-1">
                                <Search className="h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {messages.data.length === 0 ? (
                            <p className="text-muted-foreground rounded-md border p-6 text-center text-sm">No messages found.</p>
                        ) : (
                            messages.data.map((message) => (
                                <div key={message.id} className="rounded-lg border p-4">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="truncate font-semibold">{message.subject}</h3>
                                                <Badge className={`${statusClass[message.status] ?? statusClass.archived} rounded-sm`}>
                                                    {message.status}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground text-sm">
                                                {message.name} · {message.email}
                                                {message.phone ? ` · ${message.phone}` : ''}
                                            </p>
                                            <p className="text-muted-foreground line-clamp-2 text-sm">{message.message}</p>
                                            <p className="text-muted-foreground text-xs">{message.created_at}</p>
                                        </div>
                                        <div className="flex shrink-0 gap-1">
                                            <Button asChild size="sm" variant="outline" className="gap-1.5">
                                                <Link href={`/backend/contact-messages/${message.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Link>
                                            </Button>
                                            {can.reply && (
                                                <Button asChild size="sm" className="gap-1.5">
                                                    <Link href={`/backend/contact-messages/${message.id}`}>
                                                        <Mail className="h-4 w-4" />
                                                        Reply
                                                    </Link>
                                                </Button>
                                            )}
                                            {can.delete && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete message?</AlertDialogTitle>
                                                            <AlertDialogDescription>This message will be permanently deleted.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => router.delete(`/backend/contact-messages/${message.id}`)}
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="flex flex-wrap gap-1 pt-2">
                            {messages.links.map((link, index) => (
                                <Button
                                    key={`${link.label}-${index}`}
                                    asChild={Boolean(link.url)}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                >
                                    {link.url ? (
                                        <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </BackendLayout>
    );
}
