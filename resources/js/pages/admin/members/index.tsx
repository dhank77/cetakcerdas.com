import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Eye, Mail, Phone, TrendingUp, Users } from 'lucide-react';

interface Member {
    id: number;
    name: string;
    email: string;
    phone: string;
    membership_type: string;
    total_orders: number;
    total_spent: number;
    joined_at: string;
    status: string;
}

interface Props {
    members: Member[];
}

const MembersIndex = ({ members }: Props) => {
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

    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === 'active').length;
    const premiumMembers = members.filter((m) => m.membership_type === 'premium').length;
    const totalRevenue = members.reduce((sum, m) => sum + m.total_spent, 0);

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Member</h1>
                <p className="text-muted-foreground">Kelola data member dan keanggotaan</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Member</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMembers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Member Aktif</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeMembers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Member Premium</CardTitle>
                        <Badge className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{premiumMembers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Members List */}
            <div className="grid gap-4">
                {members.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">Belum ada member</h3>
                            <p className="text-center text-muted-foreground">Data member akan muncul di sini setelah ada pelanggan yang mendaftar.</p>
                        </CardContent>
                    </Card>
                ) : (
                    members.map((member) => (
                        <Card key={member.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">{member.name}</CardTitle>
                                        <CardDescription className="mt-1 flex items-center space-x-4">
                                            <span className="flex items-center">
                                                <Mail className="mr-1 h-3 w-3" />
                                                {member.email}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center">
                                                <Phone className="mr-1 h-3 w-3" />
                                                {member.phone}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {getMembershipBadge(member.membership_type)}
                                        {getStatusBadge(member.status)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Total Pesanan:</span>
                                            <div className="font-medium">{member.total_orders}</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Belanja:</span>
                                            <div className="font-medium">{formatCurrency(member.total_spent)}</div>
                                        </div>
                                        <div>
                                            <span className="flex items-center text-muted-foreground">
                                                <Calendar className="mr-1 h-3 w-3" />
                                                Bergabung:
                                            </span>
                                            <div className="font-medium">{formatDate(member.joined_at)}</div>
                                        </div>
                                    </div>
                                    <Link href={route('members.show', member.id)}>
                                        <Button variant="outline" size="sm">
                                            <Eye className="mr-2 h-4 w-4" />
                                            Detail
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

MembersIndex.layout = (page: React.ReactElement) => (
    <AppSidebarLayout>
        <Head title="Riwayat Print" />
        {page}
    </AppSidebarLayout>
);

export default MembersIndex;
