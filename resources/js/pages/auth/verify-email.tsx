// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, CheckCircle, Printer, FileText, BarChart3, Settings } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status, user }: { status?: string; user?: { name: string; email: string } }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout title="Verifikasi Email" description={`Halo ${user?.name || 'User'}! Silakan verifikasi alamat email Anda untuk mengakses cetakcerdas.com.`}>
            <Head title="Verifikasi Email" />

            <div className="space-y-6">
                {/* Success Message */}
                {status === 'verification-link-sent' && (
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-3 text-green-700 dark:text-green-300">
                                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                <p className="text-sm font-medium">
                                    Email verifikasi berhasil dikirim! Silakan periksa kotak masuk Anda.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Verification Card */}
                <Card className="border-blue-200 dark:border-blue-800 dark:bg-gray-900">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <Printer className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Verifikasi Email Diperlukan
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Halo <span className="font-medium text-gray-900 dark:text-gray-100">{user?.name || 'User'}</span>! <br />
                            Kami telah mengirim email verifikasi ke <span className="font-medium text-blue-600 dark:text-blue-400">{user?.email}</span>
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        {/* Features Grid */}
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                            <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                                Setelah verifikasi, Anda dapat mengakses:
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                    <Printer className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                    <span>cetakcerdas.com</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                    <FileText className="h-4 w-4 text-green-500 dark:text-green-400" />
                                    <span>Analisis Dokumen</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                    <BarChart3 className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                    <span>Dashboard & Laporan</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                    <Settings className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                                    <span>Pengaturan Akun</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Form */}
                        <form onSubmit={submit} className="space-y-4">
                            <Button 
                                disabled={processing} 
                                variant="default" 
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Kirim Ulang Email Verifikasi
                                    </>
                                )}
                            </Button>
                            
                            <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Tidak menerima email? Periksa folder spam atau tunggu beberapa menit.
                                </p>
                                <TextLink 
                                    href={route('logout')} 
                                    method="post" 
                                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                                >
                                    Keluar dari Akun
                                </TextLink>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Help Card */}
                <Card className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="pt-4">
                        <div className="text-center space-y-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Butuh Bantuan?</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Jika Anda mengalami masalah dengan verifikasi email, silakan hubungi tim support kami.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
