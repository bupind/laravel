import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import FrontendLayout from '@/layouts/frontend-layout';
import { Head, useForm } from '@inertiajs/react';
import { Mail, MessageSquare, Send } from 'lucide-react';
import React from 'react';

type ContactForm = {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    website: string;
};

export default function Contact() {
    const { t } = useLanguage();
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm<ContactForm>({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        website: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => reset('subject', 'message', 'website'),
        });
    };

    return (
        <>
            <Head title={t('pages.contact.title', { fallback: 'Contact Us' })} />
            <main className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-[0.9fr_1.1fr] md:px-6 lg:py-14">
                <section className="space-y-5">
                    <div>
                        <p className="text-primary text-sm font-semibold">{t('pages.contact.badge', { fallback: 'Contact' })}</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{t('pages.contact.title', { fallback: 'Contact Us' })}</h1>
                        <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-6">
                            {t('pages.contact.description', {
                                fallback: 'Kirim pertanyaan, masukan, atau kebutuhan kerja sama melalui form ini. Pesan akan masuk ke dashboard admin dan dapat dibalas melalui email.',
                            })}
                        </p>
                    </div>

                    <div className="grid gap-3 text-sm">
                        <Card>
                            <CardContent className="flex items-start gap-3 p-4">
                                <Mail className="text-primary mt-0.5 h-5 w-5" />
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-muted-foreground">{t('pages.contact.emailHelp', { fallback: 'Balasan admin akan dikirim ke alamat email yang Anda masukkan.' })}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-start gap-3 p-4">
                                <MessageSquare className="text-primary mt-0.5 h-5 w-5" />
                                <div>
                                    <p className="font-medium">Dashboard Message</p>
                                    <p className="text-muted-foreground">{t('pages.contact.dashboardHelp', { fallback: 'Semua pesan tersimpan di dashboard agar mudah dipantau dan ditindaklanjuti.' })}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('pages.contact.formTitle', { fallback: 'Send Message' })}</CardTitle>
                        <CardDescription>{t('pages.contact.formDescription', { fallback: 'Isi data dengan benar agar admin dapat membalas pesan Anda.' })}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <input type="text" value={data.website} onChange={(e) => setData('website', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('fields.name', { fallback: 'Name' })}</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} disabled={processing} />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} disabled={processing} />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">{t('fields.phone', { fallback: 'Phone' })}</Label>
                                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} disabled={processing} />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="subject">{t('fields.subject', { fallback: 'Subject' })}</Label>
                                <Input id="subject" value={data.subject} onChange={(e) => setData('subject', e.target.value)} disabled={processing} />
                                <InputError message={errors.subject} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message">{t('fields.message', { fallback: 'Message' })}</Label>
                                <Textarea id="message" rows={7} value={data.message} onChange={(e) => setData('message', e.target.value)} disabled={processing} />
                                <InputError message={errors.message} />
                            </div>
                            {recentlySuccessful && <p className="text-sm text-green-600">{t('pages.contact.sent', { fallback: 'Pesan berhasil dikirim.' })}</p>}
                            <Button type="submit" disabled={processing} className="gap-2">
                                <Send className="h-4 w-4" />
                                {processing ? t('buttons.sending', { fallback: 'Sending...' }) : t('buttons.sendMessage', { fallback: 'Send Message' })}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

Contact.layout = (page: React.ReactNode) => <FrontendLayout>{page}</FrontendLayout>;
