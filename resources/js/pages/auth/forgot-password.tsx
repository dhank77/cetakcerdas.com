// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, KeyRound, CheckCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout title="Lupa Password" description="Masukkan alamat email Anda untuk menerima tautan reset password">
            <Head title="Lupa Password" />

            <div className="space-y-6">
                {/* Success Message */}
                {status && (
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-3 text-green-700 dark:text-green-300">
                                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                <p className="text-sm font-medium">
                                    {status}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Reset Password Card */}
                <Card className="border-blue-200 dark:border-blue-800 dark:bg-gray-900">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <KeyRound className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Lupa Password?
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Tidak masalah! Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mereset password.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={data.email}
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@cetakcerdas.com"
                                    className="dark:bg-gray-800 dark:border-gray-700"
                                />
                                <InputError message={errors.email} />
                            </div>

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
                                        Kirim Tautan Reset Password
                                    </>
                                )}
                            </Button>
                            
                            <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Ingat password Anda?
                                </p>
                                <TextLink 
                                    href={route('login')} 
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                >
                                    Kembali ke Halaman Login
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
                                Jika Anda mengalami masalah dengan reset password, silakan hubungi tim support kami.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
