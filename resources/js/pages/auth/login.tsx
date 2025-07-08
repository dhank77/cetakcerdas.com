import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSplitLayout from '@/layouts/auth-split-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    'g-recaptcha-response': string;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
        'g-recaptcha-response': '',
    });

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const grecaptcha = (window as any).grecaptcha;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const siteKey = (window as any).recaptchaSiteKey;

        if (grecaptcha && siteKey) {
            grecaptcha.ready(() => {
                grecaptcha.execute(siteKey, { action: 'login' })
                    .then((token: string) => {
                        console.log('✅ reCAPTCHA token:', token);
                        setData('g-recaptcha-response', token);
                    })
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .catch((err: any) => {
                        console.error('❌ Failed to execute reCAPTCHA:', err);
                        setData('g-recaptcha-response', '');
                    });
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        console.log(data);
        
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthSplitLayout>
            <Head title="Masuk - CetakCerdas" />

            <Card className="border-0 shadow-xl lg:shadow-2xl">
                <CardContent className="p-8">
                    <div className="mb-6 text-center">
                        <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            Selamat Datang Kembali
                        </Badge>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Masuk ke Akun Anda</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Lanjutkan mengelola bisnis percetakan Anda</p>
                    </div>

                    {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

                    <form className="space-y-4" onSubmit={submit}>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Bisnis
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                disabled={processing}
                                placeholder="nama@percetakan.com"
                                className="h-11"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={route('password.request')}
                                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                        tabIndex={5}
                                    >
                                        Lupa password?
                                    </TextLink>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="Masukkan password Anda"
                                className="h-11"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onClick={() => setData('remember', !data.remember)}
                                tabIndex={3}
                            />
                            <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">
                                Ingat saya
                            </Label>
                        </div>

                        {/* reCAPTCHA v3 Hidden Field */}
                        <input type="hidden" name="g-recaptcha-response" value={data['g-recaptcha-response']} />
                        <InputError message={errors['g-recaptcha-response']} />

                        <Button
                            type="submit"
                            className="mt-6 h-11 w-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white hover:from-blue-700 hover:to-purple-700"
                            tabIndex={4}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Masuk...
                                </>
                            ) : (
                                'Masuk ke Dashboard'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Belum punya akun?{' '}
                            <TextLink
                                href={route('register')}
                                tabIndex={6}
                                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                Daftar sekarang
                            </TextLink>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </AuthSplitLayout>
    );
}
