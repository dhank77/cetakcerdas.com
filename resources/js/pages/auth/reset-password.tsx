import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, KeyRound, Lock, CheckCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Reset Password" description="Silakan masukkan password baru Anda di bawah ini">
            <Head title="Reset Password" />

            <div className="space-y-6">
                {/* Main Reset Password Card */}
                <Card className="border-green-200 dark:border-green-800 dark:bg-gray-900">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <KeyRound className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Reset Password Anda
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Masukkan password baru yang aman untuk akun Anda. Pastikan password mudah diingat namun sulit ditebak.
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
                                    readOnly
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@cetakcerdas.com"
                                    className="dark:bg-gray-800 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-gray-900 dark:text-gray-100">Password Baru</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    autoComplete="new-password"
                                    value={data.password}
                                    autoFocus
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Masukkan password baru"
                                    className="dark:bg-gray-800 dark:border-gray-700"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-gray-900 dark:text-gray-100">Konfirmasi Password Baru</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Konfirmasi password baru"
                                    className="dark:bg-gray-800 dark:border-gray-700"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button 
                                disabled={processing} 
                                variant="default" 
                                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                        Mereset Password...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Reset Password
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Password Tips Card */}
                <Card className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="pt-4">
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">Tips Password Aman</h4>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                    <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 flex-shrink-0" />
                                    <span>Minimal 8 karakter</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                    <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 flex-shrink-0" />
                                    <span>Kombinasi huruf besar dan kecil</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                    <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 flex-shrink-0" />
                                    <span>Sertakan angka dan simbol</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
