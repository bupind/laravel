import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import BackendLayout from '@/layouts/backend-layout';
import { Head, Link } from '@inertiajs/react';
import { Activity, Boxes, FileText, Mail, Newspaper, Users } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Stats {
    totalUsers: number;
    totalLogs: number;
    totalProducts: number;
    activeProducts: number;
    totalServices: number;
    publishedPages: number;
    totalMessages: number;
    newMessages: number;
    monthlyUsers: Array<{ month: string; total: number }>;
    recentActivity: Array<{ id: number; description: string; causer: string; created_at: string; event: string }>;
}

interface Props {
    stats?: Stats;
}

const STATUS_COLOR: Record<string, string> = {
    created: 'bg-green-100 text-green-700',
    updated: 'bg-blue-100 text-blue-700',
    deleted: 'bg-red-100 text-red-700',
};

export default function Dashboard({ stats }: Props) {
    const { t } = useLanguage();
    const metricCards = [
        {
            title: t('pages.dashboard.users.title', { fallback: 'Users' }),
            description: t('pages.dashboard.users.description', { fallback: 'Registered backend users' }),
            value: stats?.totalUsers ?? 0,
            href: '/backend/users',
            icon: Users,
        },
        {
            title: t('pages.dashboard.products.title', { fallback: 'Products' }),
            description: t('pages.dashboard.products.description', { fallback: `${stats?.activeProducts ?? 0} active products` }),
            value: stats?.totalProducts ?? 0,
            href: '/backend/products',
            icon: Boxes,
        },
        {
            title: t('pages.dashboard.services.title', { fallback: 'Services' }),
            description: t('pages.dashboard.services.description', { fallback: 'Published business/service sections' }),
            value: stats?.totalServices ?? 0,
            href: '/backend/services',
            icon: Newspaper,
        },
        {
            title: t('pages.dashboard.pages.title', { fallback: 'Global Pages' }),
            description: t('pages.dashboard.pages.description', { fallback: 'Dynamic published pages' }),
            value: stats?.publishedPages ?? 0,
            href: '/backend/pages',
            icon: FileText,
        },
        {
            title: t('pages.dashboard.messages.title', { fallback: 'Contact Messages' }),
            description: t('pages.dashboard.messages.description', { fallback: `${stats?.newMessages ?? 0} new messages` }),
            value: stats?.totalMessages ?? 0,
            href: '/backend/contact-messages',
            icon: Mail,
        },
        {
            title: t('pages.dashboard.logs.title', { fallback: 'Activity Logs' }),
            description: t('pages.dashboard.logs.description', { fallback: 'Recorded system activities' }),
            value: stats?.totalLogs ?? 0,
            href: '/backend/audit-logs',
            icon: Activity,
        },
    ];

    return (
        <BackendLayout breadcrumbs={[{ title: t('pages.dashboard.title', { fallback: 'Dashboard' }), href: '/backend/dashboard' }]}>
            <Head title={t('pages.dashboard.title', { fallback: 'Dashboard' })} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{t('pages.dashboard.title', { fallback: 'Dashboard' })}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {t('pages.dashboard.description', { fallback: 'Ringkasan aplikasi, konten, pesan contact, dan aktivitas terbaru.' })}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    {metricCards.map((card) => {
                        const Icon = card.icon;
                        const content = (
                            <Card className="hover:border-primary/40 h-full transition hover:shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{card.title}</p>
                                            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{card.description}</p>
                                            <p className="mt-3 text-2xl font-bold">{card.value.toLocaleString()}</p>
                                        </div>
                                        <Icon className="text-muted-foreground h-5 w-5 shrink-0" />
                                    </div>
                                </CardContent>
                            </Card>
                        );

                        return (
                            <Link key={card.title} href={card.href} className="block h-full">
                                {content}
                            </Link>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="px-4 py-3">
                            <CardTitle className="text-base">{t('pages.dashboard.userRegistrations', { fallback: 'User Registrations' })}</CardTitle>
                            <CardDescription>
                                {t('pages.dashboard.userRegistrationsDescription', { fallback: 'New user registrations over the last 6 months.' })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[240px] pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.monthlyUsers ?? []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="total" name="Users" stroke="#8b5cf6" fill="#ede9fe" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="px-4 py-3">
                            <CardTitle className="text-base">{t('pages.dashboard.recentActivity', { fallback: 'Recent Activity' })}</CardTitle>
                            <CardDescription>
                                {t('pages.dashboard.recentActivityDescription', { fallback: 'Latest create, update, and delete events.' })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 pb-4">
                            {(stats?.recentActivity ?? []).length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    {t('pages.dashboard.noRecentActivity', { fallback: 'No recent activity.' })}
                                </p>
                            ) : (
                                (stats?.recentActivity ?? []).map((log) => (
                                    <div key={log.id} className="flex items-start justify-between gap-3 text-sm">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_COLOR[log.event] ?? 'bg-gray-100 text-gray-600'}`}
                                                >
                                                    {log.event}
                                                </span>
                                                <span className="text-muted-foreground truncate">{log.description}</span>
                                            </div>
                                            <div className="text-muted-foreground mt-0.5 text-xs">
                                                {t('pages.dashboard.byUser', { user: log.causer, fallback: `by ${log.causer}` })}
                                            </div>
                                        </div>
                                        <span className="text-muted-foreground shrink-0 text-xs">{log.created_at}</span>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </BackendLayout>
    );
}
