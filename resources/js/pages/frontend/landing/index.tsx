import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppearance } from '@/hooks/use-appearance';
import { Link } from '@inertiajs/react';
import { Calculator, CheckCircle, FileText, Moon, Shield, Star, Sun, TrendingUp, Users, Zap } from 'lucide-react';

const Index = () => {
    const { appearance, updateAppearance } = useAppearance();

    const toggleDarkMode = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    const features = [
        {
            icon: <Calculator className="h-8 w-8 text-blue-600" />,
            title: 'Kalkulasi Harga Otomatis',
            description: 'Analisis dokumen PDF & Word secara otomatis untuk menghitung biaya cetak yang akurat berdasarkan jenis halaman.',
        },
        {
            icon: <FileText className="h-8 w-8 text-green-600" />,
            title: 'Deteksi Jenis Halaman',
            description: 'Teknologi AI canggih yang dapat membedakan halaman hitam-putih, berwarna, dan foto dengan presisi tinggi.',
        },
        {
            icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
            title: 'Analisis Detail',
            description: 'Laporan lengkap per halaman dengan persentase warna dan rekomendasi harga untuk setiap jenis cetak.',
        },
        {
            icon: <Zap className="h-8 w-8 text-yellow-600" />,
            title: 'Proses Super Cepat',
            description: 'Analisis dokumen dalam hitungan detik, tidak perlu menunggu lama untuk mendapatkan hasil yang akurat.',
        },
        {
            icon: <Users className="h-8 w-8 text-indigo-600" />,
            title: 'Khusus UMKM Percetakan',
            description: 'Dirancang khusus untuk kebutuhan usaha percetakan kecil dan menengah dengan fitur yang tepat sasaran.',
        },
        {
            icon: <Shield className="h-8 w-8 text-red-600" />,
            title: 'Aman & Terpercaya',
            description: 'Dokumen Anda diproses dengan aman dan tidak disimpan di server kami untuk menjaga privasi.',
        },
    ];

    const testimonials = [
        {
            name: 'Budi Santoso',
            business: 'Percetakan Maju Jaya',
            rating: 5,
            comment: 'Aplikasi ini sangat membantu! Sekarang saya bisa kasih harga yang tepat ke customer tanpa harus tebak-tebakan lagi.',
        },
        {
            name: 'Sari Dewi',
            business: 'Copy Center Sari',
            rating: 5,
            comment: 'Fitur deteksi warna sangat akurat. Customer jadi lebih percaya dengan transparansi harga yang saya berikan.',
        },
        {
            name: 'Ahmad Rizki',
            business: 'Digital Print Express',
            rating: 5,
            comment: 'Hemat waktu banget! Yang dulu butuh 10 menit buat ngecek dokumen, sekarang cuma 30 detik.',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">🖨️ CetakCerdas</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleDarkMode}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                            >
                                {appearance === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>
                            <Link href="/login">
                                <Button variant="outline">Masuk</Button>
                            </Link>
                            <Link href="/register">
                                <Button>Daftar Gratis</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-6 py-20">
                <div className="container mx-auto max-w-6xl text-center">
                    <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200">
                        🎉 Gratis Selamanya untuk Fitur Dasar!
                    </Badge>
                    <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl dark:text-white">
                        Revolusi <span className="text-blue-600 dark:text-blue-400">Kalkulasi Harga</span>
                        <br />
                        untuk UMKM Percetakan
                    </h1>
                    <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
                        Analisis dokumen PDF & Word secara otomatis, deteksi jenis halaman dengan AI, dan dapatkan kalkulasi harga cetak yang akurat
                        dalam hitungan detik!
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href={route('print')}>
                            <Button size="lg" className="px-8 py-4 text-lg">
                                🚀 Coba Gratis Sekarang
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                            📹 Lihat Demo
                        </Button>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        ✅ Tidak perlu kartu kredit • ✅ Langsung bisa digunakan • ✅ Setup 30 detik
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white px-6 py-20 dark:bg-gray-800">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Fitur Canggih untuk Bisnis Percetakan Modern</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Semua yang Anda butuhkan untuk mengelola harga cetak dengan profesional
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl dark:bg-gray-700 dark:shadow-gray-900/20"
                            >
                                <CardHeader>
                                    <div className="mb-4">{feature.icon}</div>
                                    <CardTitle className="text-xl dark:text-white">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="leading-relaxed text-gray-600 dark:text-gray-300">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-20 dark:from-gray-800 dark:to-gray-700">
                <div className="container mx-auto max-w-4xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Harga yang Ramah di Kantong UMKM</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">Mulai gratis, upgrade kapan saja sesuai kebutuhan bisnis Anda</p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* Free Plan */}
                        <Card className="border-2 border-gray-200 shadow-lg dark:border-gray-600 dark:bg-gray-800">
                            <CardHeader className="pb-8 text-center">
                                <div className="mb-4 text-4xl">🆓</div>
                                <CardTitle className="text-2xl dark:text-white">Gratis</CardTitle>
                                <div className="mt-4 text-4xl font-bold text-gray-900 dark:text-white">
                                    Rp 0<span className="text-lg font-normal text-gray-500 dark:text-gray-400">/bulan</span>
                                </div>
                                <CardDescription className="dark:text-gray-300">Perfect untuk memulai</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="mb-8 space-y-3">
                                    <li className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="dark:text-gray-300">5 dokumen per hari</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="dark:text-gray-300">Analisis dasar PDF & Word</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="dark:text-gray-300">Kalkulasi harga otomatis</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="dark:text-gray-300">Deteksi jenis halaman</span>
                                    </li>
                                </ul>
                                <Button className="w-full" variant="outline">
                                    Mulai Gratis
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Pro Plan */}
                        <Card className="relative border-2 border-blue-500 shadow-xl dark:border-blue-400 dark:bg-gray-800">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                                <Badge className="bg-blue-600 px-4 py-1 text-white dark:bg-blue-500">🔥 Paling Populer</Badge>
                            </div>
                            <CardHeader className="pb-8 text-center">
                                <div className="mb-4 text-4xl">⭐</div>
                                <CardTitle className="text-2xl dark:text-white">Pro</CardTitle>
                                <div className="mt-4 text-4xl font-bold text-blue-600 dark:text-blue-400">
                                    Rp 15.000<span className="text-lg font-normal text-gray-500 dark:text-gray-400">/bulan</span>
                                </div>
                                <CardDescription className="dark:text-gray-300">Untuk bisnis yang berkembang</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="mb-8 space-y-3">
                                    <li className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="font-medium dark:text-gray-300">Unlimited dokumen</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="dark:text-gray-300">Analisis premium dengan AI</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="dark:text-gray-300">Export laporan PDF</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="dark:text-gray-300">Riwayat analisis</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="dark:text-gray-300">Custom pricing template</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="dark:text-gray-300">Priority support</span>
                                    </li>
                                </ul>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">Upgrade ke Pro</Button>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 dark:text-gray-300">
                            💡 <strong>Hemat 20%</strong> dengan pembayaran tahunan • 🔒 Garansi uang kembali 30 hari
                        </p>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="bg-white px-6 py-20 dark:bg-gray-800">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Dipercaya oleh Ribuan UMKM Percetakan</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">Lihat apa kata mereka tentang CetakCerdas</p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="border-0 shadow-lg dark:bg-gray-700 dark:shadow-gray-900/20">
                                <CardContent className="pt-6">
                                    <div className="mb-4 flex">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="mb-4 text-gray-600 italic dark:text-gray-300">"{testimonial.comment}"</p>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.business}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-20 text-white">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="mb-6 text-4xl font-bold">Siap Meningkatkan Bisnis Percetakan Anda?</h2>
                    <p className="mb-8 text-xl opacity-90">Bergabung dengan ribuan UMKM percetakan yang sudah merasakan kemudahan CetakCerdas</p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href={route('register')}>
                            <Button size="lg" className="bg-white px-8 py-4 text-lg text-blue-600 hover:bg-gray-100">
                                🚀 Mulai Gratis Sekarang
                            </Button>
                        </Link>
                        <Link href='#'>
                            <Button size="lg" className="bg-white px-8 py-4 text-lg text-blue-600 hover:bg-gray-100">
                                💬 Hubungi Sales
                            </Button>
                        </Link>
                    </div>
                    <p className="mt-6 text-sm opacity-75">⚡ Setup dalam 30 detik • 🎯 Tidak ada komitmen jangka panjang • 🔒 Data aman terjamin</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 px-6 py-12 text-white dark:bg-gray-950">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div>
                            <div className="mb-4 text-2xl font-bold text-blue-400 dark:text-blue-300">🖨️ CetakCerdas</div>
                            <p className="text-gray-400 dark:text-gray-300">Solusi cerdas untuk kalkulasi harga cetak yang akurat dan efisien.</p>
                        </div>
                        <div>
                            <h3 className="mb-4 font-semibold text-white">Produk</h3>
                            <ul className="space-y-2 text-gray-400 dark:text-gray-300">
                                <li>
                                    <a href="#" className="hover:text-white dark:hover:text-blue-300">
                                        Fitur
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white dark:hover:text-blue-300">
                                        Harga
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white dark:hover:text-blue-300">
                                        Demo
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 font-semibold text-white">Dukungan</h3>
                            <ul className="space-y-2 text-gray-400 dark:text-gray-300">
                                <li>
                                    <a href="#" className="hover:text-white dark:hover:text-blue-300">
                                        Bantuan
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white dark:hover:text-blue-300">
                                        Tutorial
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white dark:hover:text-blue-300">
                                        Kontak
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 font-semibold text-white">Perusahaan</h3>
                            <ul className="space-y-2 text-gray-400 dark:text-gray-300">
                                <li>
                                    <a href="#" className="hover:text-white dark:hover:text-blue-300">
                                        Tentang Kami
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white dark:hover:text-blue-300">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white dark:hover:text-blue-300">
                                        Karir
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400 dark:border-gray-700 dark:text-gray-300">
                        <p>© 2025 CetakCerdas. Semua hak dilindungi undang-undang.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Index;
