import { ReactNode } from 'react';
import { CheckCircle, Calculator, Clock, TrendingUp, Shield } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface AuthSplitLayoutProps {
    children: ReactNode;
}

const benefits = [
    {
        icon: Calculator,
        title: "Kalkulasi Otomatis",
        description: "Hitung harga cetak dengan akurat dalam hitungan detik"
    },
    {
        icon: Clock,
        title: "Hemat Waktu",
        description: "Tidak perlu lagi menghitung manual, fokus pada bisnis Anda"
    },
    {
        icon: TrendingUp,
        title: "Tingkatkan Profit",
        description: "Pastikan margin keuntungan optimal di setiap pesanan"
    },
    {
        icon: Shield,
        title: "Data Aman",
        description: "Semua data pelanggan dan transaksi tersimpan dengan aman"
    }
];

export default function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto max-w-7xl">
                <div className="flex min-h-screen">
                    {/* Left Side - Benefits */}
                    <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-8 xl:px-12">
                        <div className="max-w-md">
                            <div className="mb-8">
                                <Link href={route('home')}>
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="text-3xl">🖨️</div>
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">CetakCerdas</span>
                                    </div>
                                </Link>
                                <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
                                    Revolusi Cara Anda
                                    <span className="text-blue-600 dark:text-blue-400"> Menghitung Harga Cetak</span>
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    Bergabunglah dengan ribuan UMKM percetakan yang sudah merasakan kemudahan dan akurasi CetakCerdas.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {benefits.map((benefit, index) => {
                                    const Icon = benefit.icon;
                                    return (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                                <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{benefit.title}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{benefit.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <span className="font-semibold text-green-800 dark:text-green-300">Gratis untuk Selamanya</span>
                                </div>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Unlimited dokumen per hari, upgrade kapan saja sesuai kebutuhan bisnis Anda.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form Content */}
                    <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-8 xl:px-12">
                        <div className="mx-auto w-full max-w-md">
                            {/* Mobile Header */}
                            <div className="mb-8 text-center lg:hidden">
                                <div className="mb-4 flex items-center justify-center gap-2">
                                    <div className="text-2xl">🖨️</div>
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">CetakCerdas</span>
                                </div>
                            </div>

                            {children}

                            {/* Trust Indicators */}
                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Dipercaya oleh 1000+ UMKM Percetakan</p>
                                <div className="flex justify-center items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        <span>SSL Secured</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        <span>GDPR Compliant</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}