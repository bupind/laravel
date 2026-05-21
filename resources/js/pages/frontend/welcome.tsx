import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, LayoutDashboard, LogIn, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';

export default function Welcome() {
    const { auth, setting } = usePage<SharedData>().props;

    const primaryColor = setting?.warna || '#2563eb';
    const appName = setting?.nama_app ?? 'Laravel Starter';
    const appDesc = setting?.deskripsi ?? 'Kelola aplikasi dari satu dashboard yang ringkas dan terstruktur.';
    const title = setting?.seo?.title ?? appName;
    const isAuthenticated = Boolean(auth?.user);
    const dashboardHref = route('dashboard');
    const loginHref = route('login');
    const actionHref = isAuthenticated ? dashboardHref : loginHref;
    const actionLabel = isAuthenticated ? 'Buka Dashboard' : 'Login';
    const ActionIcon = isAuthenticated ? LayoutDashboard : LogIn;

    useEffect(() => {
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--color-primary', primaryColor);
    }, [primaryColor]);

    return (
        <>
            <Head title={title}>
                {setting?.seo?.description && <meta name="description" content={setting.seo.description} />}
                {setting?.seo?.keywords && <meta name="keywords" content={setting.seo.keywords} />}
            </Head>

            <main className="bg-background text-foreground min-h-screen">
                <header className="border-border border-b">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
                        <Link href="/" className="flex items-center gap-3 font-semibold">
                            {setting?.logo ? (
                                <img src={`/storage/${setting.logo}`} alt={appName} className="h-8 max-w-40 object-contain" />
                            ) : (
                                <span
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {appName.slice(0, 1).toUpperCase()}
                                </span>
                            )}
                            <span>{appName}</span>
                        </Link>

                        <nav className="flex items-center gap-2">
                            {!isAuthenticated && (
                                <Button asChild size="sm" variant="outline">
                                    <Link href={loginHref}>
                                        <LogIn className="h-4 w-4" />
                                        Login
                                    </Link>
                                </Button>
                            )}
                            <Button asChild size="sm" variant="default" style={{ backgroundColor: primaryColor }}>
                                <Link href={dashboardHref}>
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        </nav>
                    </div>
                </header>

                <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1fr_0.86fr] md:px-6">
                    <div className="max-w-2xl">
                        <div className="border-border text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm">
                            <ShieldCheck className="h-4 w-4" style={{ color: primaryColor }} />
                            Admin workspace
                        </div>

                        <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl">{appName}</h1>
                        <p className="text-muted-foreground mt-5 max-w-xl text-base leading-7 md:text-lg">{appDesc}</p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button asChild size="lg" style={{ backgroundColor: primaryColor }}>
                                <Link href={actionHref}>
                                    <ActionIcon className="h-4 w-4" />
                                    {actionLabel}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="border-border bg-card text-card-foreground rounded-lg border p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Status Aplikasi</p>
                                <p className="text-muted-foreground text-xs">Ringkasan akses saat ini</p>
                            </div>
                            <CheckCircle2 className="h-5 w-5" style={{ color: primaryColor }} />
                        </div>

                        <dl className="space-y-4 text-sm">
                            <div className="flex items-center justify-between gap-4 border-b pb-4">
                                <dt className="text-muted-foreground">Nama</dt>
                                <dd className="font-medium">{appName}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b pb-4">
                                <dt className="text-muted-foreground">Status</dt>
                                <dd className="font-medium">Aktif</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">Sesi</dt>
                                <dd className="font-medium">{auth?.user ? auth.user.name : 'Tamu'}</dd>
                            </div>
                        </dl>
                    </div>
                </section>

                <footer className="border-border border-t">
                    <div className="text-muted-foreground mx-auto max-w-6xl px-4 py-5 text-sm md:px-6">
                        (c) {new Date().getFullYear()} {appName}
                    </div>
                </footer>
            </main>
        </>
    );
}
