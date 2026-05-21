import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity, Users } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/backend/dashboard' }];

interface Stats {
    totalUsers: number;
    totalLogs: number;
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
    const metricCards = [
        { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-500' },
        { label: 'Activity Logs', value: stats?.totalLogs ?? 0, icon: Activity, color: 'text-cyan-500' },
    ];

    // @ts-ignore
    // @ts-ignore
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                    {metricCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card key={card.label} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-muted-foreground text-xs">{card.label}</p>
                                            <p className="mt-1 text-2xl font-bold">{card.value.toLocaleString()}</p>
                                        </div>
                                        <Icon className={`h-5 w-5 ${card.color}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="px-4 py-3">
                            <CardTitle className="text-base">User Registrations (6 Months)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[220px] pb-4">
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
                            <CardTitle className="text-base">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pb-4">
                            {(stats?.recentActivity ?? []).length === 0 ? (
                                <p className="text-muted-foreground text-sm">No recent activity.</p>
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
                                            <div className="text-muted-foreground mt-0.5 text-xs">by {log.causer}</div>
                                        </div>
                                        <span className="text-muted-foreground shrink-0 text-xs">{log.created_at}</span>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
