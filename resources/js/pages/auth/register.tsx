import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSplitLayout from '@/layouts/auth-split-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    'g-recaptcha-response': string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
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
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout>
            <Head title="Daftar - CetakCerdas" />

            <Card className="border-0 shadow-xl lg:shadow-2xl">
                <CardContent className="p-8">
                    <div className="mb-6 text-center">
                        <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            Mulai Gratis Hari Ini
                        </Badge>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Akun Anda</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Bergabung dalam 2 menit dan rasakan perbedaannya</p>
                    </div>

                    <form className="space-y-4" onSubmit={submit}>
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nama Bisnis anda
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                disabled={processing}
                                placeholder="Masukkan nama lengkap bisnis anda"
                                className="h-11"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Bisnis
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={2}
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
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="Minimal 8 karakter"
                                className="h-11"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Konfirmasi Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="Ulangi password Anda"
                                className="h-11"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        {/* reCAPTCHA v3 Hidden Field */}
                        <input type="hidden" name="g-recaptcha-response" value={data['g-recaptcha-response']} />
                        <InputError message={errors['g-recaptcha-response']} />

                        <Button
                            type="submit"
                            className="mt-6 h-11 w-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white hover:from-blue-700 hover:to-purple-700"
                            tabIndex={5}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Membuat Akun...
                                </>
                            ) : (
                                'Mulai Gratis Sekarang'
                            )}
                        </Button>

                        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                            Dengan mendaftar, Anda menyetujui{' '}
                            <TextLink href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                Syarat & Ketentuan
                            </TextLink>{' '}
                            dan{' '}
                            <TextLink href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                Kebijakan Privasi
                            </TextLink>
                        </p>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Sudah punya akun?{' '}
                            <TextLink
                                href={route('login')}
                                tabIndex={6}
                                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                Masuk di sini
                            </TextLink>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </AuthSplitLayout>
    );
}
