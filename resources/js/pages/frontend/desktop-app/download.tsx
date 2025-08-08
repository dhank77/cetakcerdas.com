import { Head } from '@inertiajs/react';
import { Download, Youtube, Lock, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DesktopAppDownload = () => {
    return (
        <>
            <Head title="Download Aplikasi Desktop Cetak Cerdas" />
            
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-8">Download Aplikasi Desktop Cetak Cerdas</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Download className="h-5 w-5" />
                                    <span>Download Aplikasi</span>
                                </CardTitle>
                                <CardDescription>
                                    Download aplikasi desktop Cetak Cerdas untuk pengalaman cetak yang lebih baik
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4">Aplikasi desktop Cetak Cerdas menyediakan fitur-fitur berikut:</p>
                                <ul className="list-disc pl-5 space-y-2 mb-6">
                                    <li>Analisis dokumen secara lokal</li>
                                    <li>Cetak dokumen langsung dari aplikasi</li>
                                    <li>Dukungan untuk file PDF dan DOCX</li>
                                    <li>Pengaturan cetak yang lebih fleksibel</li>
                                    <li>Tidak perlu upload dokumen ke server</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <a href="/Cetak Cerdas.exe" download>
                                    <Button className="w-full" size="lg">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Cetak Cerdas.exe
                                    </Button>
                                </a>
                            </CardFooter>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Youtube className="h-5 w-5" />
                                    <span>Tutorial Penggunaan</span>
                                </CardTitle>
                                <CardDescription>
                                    Pelajari cara menginstall dan menggunakan aplikasi desktop Cetak Cerdas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                                    <Youtube className="h-16 w-16 text-slate-400" />
                                    <span className="ml-2 text-slate-500">Video Tutorial</span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Video tutorial ini akan menunjukkan cara menginstall dan menggunakan aplikasi desktop Cetak Cerdas
                                </p>
                            </CardContent>
                            <CardFooter>
                                <a href="https://www.youtube.com/watch?v=example" target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="w-full" size="lg">
                                        <Youtube className="mr-2 h-4 w-4" />
                                        Tonton Tutorial di YouTube
                                    </Button>
                                </a>
                            </CardFooter>
                        </Card>
                    </div>
                    
                    <Alert className="mb-8">
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Informasi Login</AlertTitle>
                        <AlertDescription>
                            <p className="mb-2">
                                Untuk menggunakan aplikasi desktop Cetak Cerdas, Anda memerlukan password dan PIN yang tersedia di menu sebelah kanan atas.
                            </p>
                            <div className="flex items-center gap-2 mt-4">
                                <Key className="h-4 w-4" />
                                <span className="font-medium">Password dan PIN diperlukan untuk login di aplikasi desktop</span>
                            </div>
                        </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Langkah-langkah Instalasi</h2>
                        <ol className="list-decimal pl-5 space-y-4">
                            <li>
                                <p className="font-medium">Download aplikasi Cetak Cerdas.exe</p>
                                <p className="text-slate-600">Klik tombol download di atas untuk mengunduh aplikasi</p>
                            </li>
                            <li>
                                <p className="font-medium">Jalankan file installer</p>
                                <p className="text-slate-600">Buka file yang telah diunduh dan ikuti petunjuk instalasi</p>
                            </li>
                            <li>
                                <p className="font-medium">Buka aplikasi Cetak Cerdas</p>
                                <p className="text-slate-600">Setelah instalasi selesai, buka aplikasi dari desktop atau menu start</p>
                            </li>
                            <li>
                                <p className="font-medium">Login dengan password dan PIN</p>
                                <p className="text-slate-600">Gunakan password dan PIN yang tersedia di menu sebelah kanan atas website</p>
                            </li>
                            <li>
                                <p className="font-medium">Mulai menggunakan aplikasi</p>
                                <p className="text-slate-600">Upload dokumen, analisis, dan cetak langsung dari aplikasi</p>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DesktopAppDownload;