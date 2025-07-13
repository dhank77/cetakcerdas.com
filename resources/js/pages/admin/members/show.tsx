import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Mail, Package, Phone, TrendingUp, User } from 'lucide-react';

interface RecentOrder {
    id: number;
    order_number: string;
    total: number;
    created_at: string;
}

interface Member {
    id: string;
    name: string;
    email: string;
    phone: string;
    membership_type: string;
    total_orders: number;
    total_spent: number;
    joined_at: string;
    status: string;
    recent_orders: RecentOrder[];
}

interface Props {
    member: Member;
}

const MemberShow = ({ member }: Props) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getMembershipBadge = (type: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            premium: 'default',
            basic: 'secondary',
            vip: 'outline',
        };

        const labels: Record<string, string> = {
            premium: 'Premium',
            basic: 'Basic',
            vip: 'VIP',
        };

        return <Badge variant={variants[type] || 'outline'}>{labels[type] || type}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            inactive: 'secondary',
            suspended: 'destructive',
        };

        const labels: Record<string, string> = {
            active: 'Aktif',
            inactive: 'Tidak Aktif',
            suspended: 'Ditangguhkan',
        };

        return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center space-x-4">
                <Link href={route('members.index')}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{member.name}</h1>
                    <p className="text-muted-foreground">Detail informasi member</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    {/* Member Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{member.total_orders}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Belanja</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(member.total_spent)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata per Pesanan</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {member.total_orders > 0 ? formatCurrency(member.total_spent / member.total_orders) : formatCurrency(0)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pesanan Terbaru</CardTitle>
                            <CardDescription>Riwayat pesanan terbaru dari member ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {member.recent_orders.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <p className="text-muted-foreground">Belum ada pesanan</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {member.recent_orders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center space-x-3">
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{order.order_number}</div>
                                                    <div className="text-sm text-muted-foreground">{formatDateTime(order.created_at)}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">{formatCurrency(order.total)}</div>
                                                <Link href={route('orders.show', order.id)}>
                                                    <Button variant="outline" size="sm" className="mt-1">
                                                        Lihat Detail
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Member Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Member</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="mb-4 flex items-center justify-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                    <User className="h-10 w-10" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-sm text-muted-foreground">Nama Lengkap</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">{member.email}</div>
                                        <div className="text-sm text-muted-foreground">Email</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">{member.phone}</div>
                                        <div className="text-sm text-muted-foreground">Nomor Telepon</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">{formatDate(member.joined_at)}</div>
                                        <div className="text-sm text-muted-foreground">Tanggal Bergabung</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Membership Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Keanggotaan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Tipe Member:</span>
                                {getMembershipBadge(member.membership_type)}
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Status:</span>
                                {getStatusBadge(member.status)}
                            </div>
                            <div className="space-y-2">
                                <Button className="w-full" variant="outline">
                                    Edit Member
                                </Button>
                                <Button className="w-full" variant="outline">
                                    Upgrade Membership
                                </Button>
                                {member.status === 'active' ? (
                                    <Button className="w-full" variant="destructive">
                                        Suspend Member
                                    </Button>
                                ) : (
                                    <Button className="w-full" variant="default">
                                        Activate Member
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

MemberShow.layout = (page: React.ReactElement) => (
    <AppSidebarLayout>
        <Head title="Detail Member" />
        {page}
    </AppSidebarLayout>
);

export default MemberShow;
