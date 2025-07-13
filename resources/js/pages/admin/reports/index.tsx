import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link } from '@inertiajs/react';
import { Activity, BarChart3, Calendar, DollarSign, FileText, Users } from 'lucide-react';

interface DailyStats {
    total_orders: number;
    total_revenue: number;
    total_pages_printed: number;
    active_customers: number;
}

interface TopCustomer {
    name: string;
    orders: number;
    spent: number;
}

interface PopularService {
    service: string;
    count: number;
    revenue: number;
}

interface RecentActivity {
    type: string;
    description: string;
    time: string;
}

interface Reports {
    daily_stats: DailyStats;
    weekly_stats: DailyStats;
    monthly_stats: DailyStats;
    top_customers: TopCustomer[];
    popular_services: PopularService[];
    recent_activity: RecentActivity[];
}

interface Props {
    reports: Reports;
}

const ReportsIndex = ({ reports }: Props) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'order':
                return <FileText className="h-4 w-4" />;
            case 'payment':
                return <DollarSign className="h-4 w-4" />;
            case 'print':
                return <Activity className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'order':
                return 'text-blue-600';
            case 'payment':
                return 'text-green-600';
            case 'print':
                return 'text-purple-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
                    <p className="text-muted-foreground">Analisis performa bisnis dan statistik penjualan</p>
                </div>
                <Link href={route('reports.sales')}>
                    <Button>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Laporan Penjualan
                    </Button>
                </Link>
            </div>

            {/* Daily Stats */}
            <div>
                <h2 className="mb-4 text-xl font-semibold">Statistik Hari Ini</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reports.daily_stats.total_orders}</div>
                            <p className="text-xs text-muted-foreground">
                                +{Math.round((reports.daily_stats.total_orders / reports.weekly_stats.total_orders) * 100)}% dari minggu lalu
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(reports.daily_stats.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                +{Math.round((reports.daily_stats.total_revenue / reports.weekly_stats.total_revenue) * 100)}% dari minggu lalu
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Halaman Dicetak</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reports.daily_stats.total_pages_printed}</div>
                            <p className="text-xs text-muted-foreground">
                                +{Math.round((reports.daily_stats.total_pages_printed / reports.weekly_stats.total_pages_printed) * 100)}% dari minggu
                                lalu
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reports.daily_stats.active_customers}</div>
                            <p className="text-xs text-muted-foreground">
                                +{Math.round((reports.daily_stats.active_customers / reports.weekly_stats.active_customers) * 100)}% dari minggu lalu
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Customers */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pelanggan Teratas</CardTitle>
                        <CardDescription>Pelanggan dengan pesanan terbanyak</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {reports.top_customers.map((customer, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        <span className="text-sm font-medium">{index + 1}</span>
                                    </div>
                                    <div>
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-sm text-muted-foreground">{customer.orders} pesanan</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{formatCurrency(customer.spent)}</div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Popular Services */}
                <Card>
                    <CardHeader>
                        <CardTitle>Layanan Populer</CardTitle>
                        <CardDescription>Layanan yang paling banyak dipesan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {reports.popular_services.map((service, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{service.service}</div>
                                    <div className="text-sm text-muted-foreground">{service.count} kali dipesan</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{formatCurrency(service.revenue)}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {Math.round((service.revenue / reports.monthly_stats.total_revenue) * 100)}% dari total
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Aktivitas Terbaru</CardTitle>
                    <CardDescription>Aktivitas sistem dalam beberapa jam terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reports.recent_activity.map((activity, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <div className={`rounded-full bg-gray-100 p-2 ${getActivityColor(activity.type)}`}>
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm">{activity.description}</div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        {formatDate(activity.time)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
ReportsIndex.layout = (page: React.ReactElement) => (
    <AppSidebarLayout>
        <Head title="Laporan" />
        {page}
    </AppSidebarLayout>
);

export default ReportsIndex;
