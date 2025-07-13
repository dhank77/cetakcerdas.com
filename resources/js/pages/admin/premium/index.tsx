import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, Check, Crown, FileText, Lock, Printer, Shield, Sparkles, Star, Users, X, Zap } from 'lucide-react';

const PremiumIndex = () => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    const freeFeatures = [
        { name: 'Kalkulasi Print Unlimited', included: true },
        { name: 'Format PDF & DOC', included: true },
        { name: 'Print hitam putih dan warna', included: true },
        { name: 'Support email', included: true },
        { name: 'Setting harga hitam putih dan warna', included: true },
        { name: 'Setting harga photo dan tingkat ketelitian', included: false },
        { name: 'Priority support', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Custom branding', included: false },
    ];

    const premiumFeatures = [
        { name: 'Kalkulasi Print unlimited', icon: Printer },
        { name: 'Print berwarna premium', icon: Sparkles },
        { name: 'Priority support 24/7', icon: Shield },
        { name: 'Advanced analytics & reports', icon: BarChart3 },
        { name: 'Custom branding', icon: Star },
        { name: 'API access', icon: Zap },
        { name: 'Bulk printing', icon: FileText },
        { name: 'Team collaboration', icon: Users },
    ];

    return (
        <div className="space-y-8 p-6">
            {/* Hero Section */}
            <div className="space-y-4 text-center">
                <div className="mb-4 flex items-center justify-center space-x-2">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                    <Crown className="h-10 w-10 text-yellow-500" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Upgrade ke Premium</h1>
                <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                    Akses fitur premium yang Anda coba memerlukan upgrade akun. Dapatkan pengalaman printing terbaik dengan fitur unlimited dan
                    support prioritas.
                </p>
                <Badge variant="secondary" className="text-sm">
                    Saat ini Anda menggunakan Free Plan
                </Badge>
            </div>

            {/* Pricing Cards */}
            <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
                {/* Free Plan */}
                <Card className="relative">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">Free Plan</CardTitle>
                                <CardDescription>Plan saat ini</CardDescription>
                            </div>
                            <Badge variant="outline">Aktif</Badge>
                        </div>
                        <div className="text-3xl font-bold">
                            Gratis
                            <span className="text-base font-normal text-muted-foreground">/bulan</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-3">
                            {freeFeatures.map((feature, index) => (
                                <li key={index} className="flex items-center space-x-3">
                                    {feature.included ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-500" />}
                                    <span className={feature.included ? '' : 'text-muted-foreground line-through'}>{feature.name}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Premium Plan */}
                <Card className="relative border-primary shadow-lg">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            <Crown className="mr-1 h-3 w-3" />
                            Recommended
                        </Badge>
                    </div>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center text-2xl">
                                    <Crown className="mr-2 h-6 w-6 text-yellow-500" />
                                    Premium Plan
                                </CardTitle>
                                <CardDescription>Akses semua fitur premium</CardDescription>
                            </div>
                        </div>
                        <div className="text-3xl font-bold">
                            {formatCurrency(99000)}
                            <span className="text-base font-normal text-muted-foreground">/bulan</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Hemat 20% dengan paket tahunan</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-3">
                            {premiumFeatures.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <div className="rounded-full bg-primary/10 p-1">
                                        <feature.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="font-medium">{feature.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="grid space-y-3">
                            <Link href={route('billing.index')}>
                                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                    <Crown className="mr-2 h-4 w-4" />
                                    Upgrade Sekarang
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full">
                                Coba Gratis 7 Hari
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Benefits Section */}
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 text-center">
                    <h2 className="mb-4 text-3xl font-bold">Mengapa Memilih Premium?</h2>
                    <p className="text-muted-foreground">Dapatkan pengalaman printing terbaik dengan fitur-fitur eksklusif</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Printer className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="mb-2 font-semibold">Print Unlimited</h3>
                            <p className="text-sm text-muted-foreground">Tidak ada batasan jumlah print per bulan</p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                <Sparkles className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="mb-2 font-semibold">Kualitas Premium</h3>
                            <p className="text-sm text-muted-foreground">Print berwarna dengan kualitas terbaik</p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <Shield className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="mb-2 font-semibold">Priority Support</h3>
                            <p className="text-sm text-muted-foreground">Dukungan 24/7 dengan respon cepat</p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                                <BarChart3 className="h-6 w-6 text-yellow-600" />
                            </div>
                            <h3 className="mb-2 font-semibold">Advanced Analytics</h3>
                            <p className="text-sm text-muted-foreground">Laporan detail dan insights mendalam</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 py-12 text-center dark:from-gray-800 dark:to-gray-900">
                <Crown className="mx-auto h-16 w-16 text-yellow-500" />

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Siap untuk Upgrade?</h2>

                <p className="mx-auto max-w-2xl text-muted-foreground dark:text-gray-300">
                    Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan dan kualitas premium. Mulai trial gratis hari ini!
                </p>

                <div className="flex items-center justify-center space-x-4">
                    <Link href={route('billing.index')}>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
                        >
                            <Crown className="mr-2 h-5 w-5" />
                            Mulai Trial Gratis
                        </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-800">
                        Pelajari Lebih Lanjut
                    </Button>
                </div>

                <p className="text-sm text-muted-foreground dark:text-gray-400">Tidak ada komitmen • Batalkan kapan saja • Support 24/7</p>
            </div>
        </div>
    );
};

PremiumIndex.layout = (page: React.ReactElement) => (
    <AppSidebarLayout>
        <Head title="Upgrade ke Premium" />
        {page}
    </AppSidebarLayout>
);

export default PremiumIndex;
