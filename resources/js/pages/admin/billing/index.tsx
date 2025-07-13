import { Head } from '@inertiajs/react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CreditCard,
    Calendar,
    Download,
    Check,
    Package,
    Zap,
    Crown
} from 'lucide-react';

interface Plan {
    name: string;
    price: number;
    billing_cycle: string;
    features: string[];
    is_current?: boolean;
    next_billing_date?: string;
}

interface PaymentMethod {
    id: number;
    type: string;
    last_four: string;
    brand: string;
    is_default: boolean;
    expires_at: string;
}

interface Invoice {
    id: number;
    invoice_number: string;
    amount: number;
    status: string;
    date: string;
    description: string;
}

interface UsageStats {
    prints_this_month: number;
    prints_limit: string;
    storage_used: string;
    storage_limit: string;
}

interface BillingData {
    current_plan: Plan;
    usage_stats: UsageStats;
    billing_history: Invoice[];
    payment_methods: PaymentMethod[];
    available_plans: Plan[];
}

interface Props {
    billingData: BillingData;
}

export default function BillingIndex({ billingData }: Props) {
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

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            paid: 'default',
            pending: 'secondary',
            failed: 'destructive',
            overdue: 'destructive',
        };

        const labels: Record<string, string> = {
            paid: 'Dibayar',
            pending: 'Menunggu',
            failed: 'Gagal',
            overdue: 'Terlambat',
        };

        return (
            <Badge variant={variants[status] || 'outline'}>
                {labels[status] || status}
            </Badge>
        );
    };

    const getPlanIcon = (planName: string) => {
        switch (planName.toLowerCase()) {
            case 'basic plan':
                return <Package className="h-5 w-5" />;
            case 'premium plan':
                return <Zap className="h-5 w-5" />;
            case 'enterprise plan':
                return <Crown className="h-5 w-5" />;
            default:
                return <Package className="h-5 w-5" />;
        }
    };

    return (
        <AppShell>
            <Head title="Tagihan" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tagihan</h1>
                    <p className="text-muted-foreground">
                        Kelola paket berlangganan dan riwayat pembayaran
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Current Plan */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Paket Saat Ini</CardTitle>
                                <CardDescription>
                                    Detail paket berlangganan yang sedang aktif
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-full bg-primary/10">
                                            {getPlanIcon(billingData.current_plan.name)}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{billingData.current_plan.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {formatCurrency(billingData.current_plan.price)}/{billingData.current_plan.billing_cycle === 'monthly' ? 'bulan' : 'tahun'}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge>Aktif</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Fitur:</span>
                                        <ul className="mt-1 space-y-1">
                                            {billingData.current_plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-center text-sm">
                                                    <Check className="h-3 w-3 mr-2 text-green-600" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Tagihan Berikutnya:</span>
                                        <div className="flex items-center mt-1">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span className="text-sm font-medium">
                                                {billingData.current_plan.next_billing_date ? formatDate(billingData.current_plan.next_billing_date) : 'Tidak tersedia'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Usage Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Penggunaan Bulan Ini</CardTitle>
                                <CardDescription>
                                    Statistik penggunaan layanan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Print</div>
                                        <div className="text-2xl font-bold">{billingData.usage_stats.prints_this_month}</div>
                                        <div className="text-sm text-muted-foreground">
                                            dari {billingData.usage_stats.prints_limit}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Storage</div>
                                        <div className="text-2xl font-bold">{billingData.usage_stats.storage_used}</div>
                                        <div className="text-sm text-muted-foreground">
                                            dari {billingData.usage_stats.storage_limit}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Billing History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Riwayat Tagihan</CardTitle>
                                <CardDescription>
                                    Riwayat pembayaran dan invoice
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {billingData.billing_history.map((invoice) => (
                                        <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{invoice.invoice_number}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {invoice.description} • {formatDate(invoice.date)}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {getStatusBadge(invoice.status)}
                                                <div className="text-right">
                                                    <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Payment Methods */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Metode Pembayaran</CardTitle>
                                <CardDescription>
                                    Kelola metode pembayaran
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {billingData.payment_methods.map((method) => (
                                    <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <CreditCard className="h-5 w-5" />
                                            <div>
                                                <div className="font-medium">
                                                    **** **** **** {method.last_four}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {method.brand.toUpperCase()} • Exp {method.expires_at}
                                                </div>
                                            </div>
                                        </div>
                                        {method.is_default && (
                                            <Badge variant="outline">Default</Badge>
                                        )}
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full">
                                    Tambah Metode Pembayaran
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Available Plans */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Paket Tersedia</CardTitle>
                                <CardDescription>
                                    Upgrade atau downgrade paket
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {billingData.available_plans.map((plan, index) => (
                                    <div key={index} className={`p-4 border rounded-lg ${plan.is_current ? 'bg-primary/5 border-primary' : ''}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                {getPlanIcon(plan.name)}
                                                <span className="font-medium">{plan.name}</span>
                                            </div>
                                            {plan.is_current && <Badge>Saat Ini</Badge>}
                                        </div>
                                        <div className="text-2xl font-bold mb-2">
                                            {formatCurrency(plan.price)}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                /{plan.billing_cycle === 'monthly' ? 'bulan' : 'tahun'}
                                            </span>
                                        </div>
                                        <ul className="space-y-1 mb-4">
                                            {plan.features.slice(0, 3).map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-center text-sm">
                                                    <Check className="h-3 w-3 mr-2 text-green-600" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        {!plan.is_current && (
                                            <Button variant="outline" size="sm" className="w-full">
                                                {plan.price > billingData.current_plan.price ? 'Upgrade' : 'Downgrade'}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}