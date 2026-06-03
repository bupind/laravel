import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import BackendLayout from '@/layouts/backend-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import React, { useMemo } from 'react';

type Message = {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
    status: string;
    created_at?: string | null;
    read_at?: string | null;
    replied_at?: string | null;
    reply_subject?: string | null;
    reply_message?: string | null;
};

type Props = { message: Message; can: { reply: boolean; delete: boolean } };

export default function ContactMessageShow({ message, can }: Props) {
    const { t } = useLanguage();
    const breadcrumbs = useMemo(
        () => [
            { title: t('pages.contactMessages.title', { fallback: 'Contact Messages' }), href: '/backend/contact-messages' },
            { title: message.subject, href: '#' },
        ],
        [t, message.subject],
    );
    const { data, setData, post, processing, errors } = useForm({
        subject: `Re: ${message.subject}`,
        message: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(`/backend/contact-messages/${message.id}/reply`, { preserveScroll: true });
    };

    return (
        <BackendLayout breadcrumbs={breadcrumbs}>
            <Head title={message.subject} />
            <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-6">
                <Button asChild variant="ghost" size="sm" className="gap-1.5 pl-0">
                    <Link href="/backend/contact-messages">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                                <CardTitle>{message.subject}</CardTitle>
                                <CardDescription>
                                    {message.name} · {message.email}
                                    {message.phone ? ` · ${message.phone}` : ''}
                                </CardDescription>
                            </div>
                            <Badge className={`${message.status} rounded-sm`}>{message.status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4 text-sm leading-6 whitespace-pre-wrap">{message.message}</div>
                        <div className="text-muted-foreground grid gap-1 text-xs sm:grid-cols-3">
                            <span>Created: {message.created_at ?? '-'}</span>
                            <span>Read: {message.read_at ?? '-'}</span>
                            <span>Replied: {message.replied_at ?? '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                {message.reply_message && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Mail className="h-4 w-4" />
                                Last Reply
                            </CardTitle>
                            <CardDescription>{message.reply_subject}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border p-4 text-sm leading-6 whitespace-pre-wrap">{message.reply_message}</div>
                        </CardContent>
                    </Card>
                )}

                {can.reply && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Reply by Email</CardTitle>
                            <CardDescription>Balasan akan dikirim melalui email service dan disimpan sebagai riwayat pesan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="reply-subject">Subject</Label>
                                    <input
                                        id="reply-subject"
                                        className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.subject} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reply-message">Message</Label>
                                    <Textarea
                                        id="reply-message"
                                        rows={8}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.message} />
                                </div>
                                <div className="text-end">
                                    <Button type="submit" disabled={processing} className="gap-2">
                                        <Send className="h-4 w-4" />
                                        Send Reply
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </BackendLayout>
    );
}
