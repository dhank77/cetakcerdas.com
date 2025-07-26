import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Head, useForm } from '@inertiajs/react';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface FormData {
    password: string;
    pin: string;
}

const ProtectedAuth = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm<FormData>({
        password: '',
        pin: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('print.protected.access'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
            <Head title="Akses Halaman Khusus - Print" />
            
            <div className="flex min-h-screen items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md shadow-lg dark:border-gray-700 dark:bg-gray-800/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            Halaman Khusus
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Masukkan password dan PIN untuk mengakses halaman print khusus
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        {errors.auth && (
                            <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <AlertDescription className="text-red-700 dark:text-red-300">
                                    {errors.auth}
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Masukkan password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="pin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    PIN
                                </Label>
                                <Input
                                    id="pin"
                                    type="password"
                                    placeholder="Masukkan PIN (maksimal 6 digit)"
                                    value={data.pin}
                                    onChange={(e) => setData('pin', e.target.value)}
                                    maxLength={6}
                                    className="text-center text-lg tracking-widest"
                                    required
                                />
                                {errors.pin && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.pin}</p>
                                )}
                            </div>
                            
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing || !data.password || !data.pin}
                            >
                                {processing ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Memverifikasi...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Akses Halaman
                                    </>
                                )}
                            </Button>
                        </form>
                        
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Halaman ini memerlukan autentikasi khusus dengan password dan PIN yang valid
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
                <div className="container mx-auto px-6 py-4">
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>© 2025 CetakCerdas. Solusi Cerdas untuk UMKM Percetakan.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ProtectedAuth;