// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Shield, Lock } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<{ password: string }>>({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Konfirmasi Password"
            description="Ini adalah area aman dari aplikasi. Silakan konfirmasi password Anda sebelum melanjutkan."
        >
            <Head title="Konfirmasi Password" />

            <div className="space-y-6">
                {/* Main Confirm Password Card */}
                <Card className="border-orange-200 dark:border-orange-800 dark:bg-gray-900">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                            <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Konfirmasi Password Diperlukan
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Ini adalah area aman dari aplikasi. Silakan konfirmasi password Anda untuk melanjutkan.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-gray-900 dark:text-gray-100">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Masukkan password Anda"
                                    autoComplete="current-password"
                                    value={data.password}
                                    autoFocus
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="dark:bg-gray-800 dark:border-gray-700"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <Button 
                                disabled={processing} 
                                variant="default" 
                                className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                        Memverifikasi...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Konfirmasi Password
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Security Info Card */}
                <Card className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="pt-4">
                        <div className="text-center space-y-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Keamanan Terjamin</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Password Anda dienkripsi dan tidak akan disimpan dalam bentuk teks biasa.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
