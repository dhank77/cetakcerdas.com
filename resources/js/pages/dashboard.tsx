import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React from 'react';
import { 
    Calendar, 
    CalendarDays, 
    TrendingUp, 
    FileText, 
    DollarSign, 
    Users,
    Printer,
    PieChart
} from 'lucide-react';

// Define interfaces
interface DashboardStats {
    today: {
        count: number;
        revenue: number;
        pages: number;
        customers: number;
    };
    month: {
        count: number;
        revenue: number;
        pages: number;
        customers: number;
    };
    year: {
        count: number;
        revenue: number;
        pages: number;
        customers: number;
    };
    breakdown: {
        bwPages: number;
        colorPages: number;
        photoPages: number;
    };
}

interface RecentOrder {
    id: number;
    total_price: number;
    total_pages: number;
    created_at: string;
}

interface DashboardProps {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const Dashboard = ({ stats, recentOrders = [] }: DashboardProps) => {
    // Safe currency formatter
    const formatCurrency = (amount: number) => {
        if (!amount || amount < 0) {
            return 'Rp 0';
        }
        
        try {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        } catch (error) {
            console.error('Error formatting currency:', error);
            return 'Rp 0';
        }
    };

    // Safe number formatter
    const formatNumber = (num: number) => {
        if (!num || num < 0) {
            return '0';
        }
        return num.toLocaleString('id-ID');
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Ringkasan data order dan statistik bisnis printing Anda
                </p>
            </div>

            {/* Today's Stats */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Hari Ini</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Order</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(stats.today.count)}</div>
                            <p className="text-xs text-muted-foreground">
                                Order hari ini
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.today.revenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                Revenue hari ini
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Halaman</CardTitle>
                            <Printer className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(stats.today.pages)}</div>
                            <p className="text-xs text-muted-foreground">
                                Halaman dicetak hari ini
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pelanggan</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(stats.today.customers)}</div>
                            <p className="text-xs text-muted-foreground">
                                Pelanggan unik hari ini
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Monthly Stats */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-green-600" />
                    <h2 className="text-xl font-semibold">Bulan Ini</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Order</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(stats.month.count)}</div>
                            <p className="text-xs text-muted-foreground">
                                Order bulan ini
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.month.revenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                Revenue bulan ini
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Halaman</CardTitle>
                            <Printer className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(stats.month.pages)}</div>
                            <p className="text-xs text-muted-foreground">
                                Halaman dicetak bulan ini
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pelanggan</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(stats.month.customers)}</div>
                            <p className="text-xs text-muted-foreground">
                                Pelanggan unik bulan ini
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Yearly Stats */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <h2 className="text-xl font-semibold">Tahun Ini</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Order</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(stats.year.count)}</div>
                            <p className="text-xs text-muted-foreground">
                                Order tahun ini
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.year.revenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                Revenue tahun ini
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Halaman</CardTitle>
                            <Printer className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(stats.year.pages)}</div>
                            <p className="text-xs text-muted-foreground">
                                Halaman dicetak tahun ini
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pelanggan</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(stats.year.customers)}</div>
                            <p className="text-xs text-muted-foreground">
                                Pelanggan unik tahun ini
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Breakdown by Print Type */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-orange-600" />
                    <h2 className="text-xl font-semibold">Breakdown Jenis Cetak</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Hitam Putih</CardTitle>
                            <CardDescription>Total halaman B&W yang dicetak</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-600">
                                {formatNumber(stats.breakdown.bwPages)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Halaman hitam putih
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Berwarna</CardTitle>
                            <CardDescription>Total halaman berwarna yang dicetak</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {formatNumber(stats.breakdown.colorPages)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Halaman berwarna
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Foto</CardTitle>
                            <CardDescription>Total halaman foto yang dicetak</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">
                                {formatNumber(stats.breakdown.photoPages)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Halaman foto
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Order Terbaru (5 Terakhir)</h2>
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">ID</th>
                                        <th className="text-left p-4 font-medium">Tanggal</th>
                                        <th className="text-left p-4 font-medium">Total Halaman</th>
                                        <th className="text-left p-4 font-medium">Total Harga</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="p-4 font-mono text-sm">#{order.id}</td>
                                            <td className="p-4">
                                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="p-4">{formatNumber(order.total_pages)} halaman</td>
                                            <td className="p-4 font-semibold">{formatCurrency(order.total_price)}</td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    Selesai
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {recentOrders.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">Belum ada order</h3>
                                <p className="text-muted-foreground">Order akan muncul di sini setelah pelanggan melakukan pemesanan.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Dashboard.layout = (page: React.ReactElement) => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            {page}
        </AppLayout>
    );
};

export default Dashboard;