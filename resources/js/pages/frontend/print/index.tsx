import DetailedAnalysis from '@/components/frontend/analysis/detailed-analysis';
import DocumentPreview from '@/components/frontend/analysis/document-preview';
import FileUpload from '@/components/frontend/analysis/file-upload';
import Header from '@/components/frontend/analysis/header';
import PriceAnalysis from '@/components/frontend/analysis/price-analysis';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SharedData, User } from '@/types';
import { AnalysisResult } from '@/types/analysis';
import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, Lock, LogOut } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

const Index = ({ user }: { user: User | null }) => {
    const { auth } = usePage<SharedData>().props;

    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // PIN Modal states
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [isLocked, setIsLocked] = useState(user ? true : false);
    const [pinAttempts, setPinAttempts] = useState(0);
    const maxPinAttempts = 3;

    const isUserLoggedIn = auth && auth.user;

    const isProduction = true;//import.meta.env.VITE_APP_ENV === 'production';

    // Hash function for PIN storage with fallback
    const hashPin = useCallback(async (pinValue: string, userSlug: string): Promise<string> => {
        const input = pinValue + userSlug + 'cetak-cerdas-salt';
        
        // Check if Web Crypto API is available
        if (window.crypto && window.crypto.subtle) {
            try {
                const encoder = new TextEncoder();
                const data = encoder.encode(input);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (error) {
                console.warn('Web Crypto API failed, using fallback hash:', error);
            }
        }
        
        // Fallback: Simple hash function (not cryptographically secure but sufficient for this use case)
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Convert to positive hex string
        return Math.abs(hash).toString(16).padStart(8, '0');
    }, []);

    // Alternative: Even simpler fallback using btoa (Base64)
    const hashPinSimple = useCallback((pinValue: string, userSlug: string): string => {
        const input = pinValue + userSlug + 'cetak-cerdas-salt';
        
        // Check if Web Crypto API is available
        if (window.crypto && window.crypto.subtle) {
            // Use the async version above
            return '';
        }
        
        // Simple Base64 encoding as fallback
        try {
            return btoa(input).replace(/[+/=]/g, '').substring(0, 16);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Final fallback: simple string manipulation
            let hash = '';
            for (let i = 0; i < input.length; i++) {
                hash += input.charCodeAt(i).toString(16);
            }
            return hash.substring(0, 16);
        }
    }, []);

    // Check stored PIN hash with error handling
    const checkStoredPin = useCallback(async (): Promise<boolean> => {
        if (!user?.slug) return false;
        
        try {
            const storedHash = localStorage.getItem(`pin_hash_${user.slug}`);
            if (!storedHash) return false;
            
            const correctPin = user?.pin ?? 0;
            const expectedHash = await hashPin(correctPin.toString(), user.slug);
            
            return storedHash === expectedHash;
        } catch (error) {
            console.error('Error checking stored PIN:', error);
            // Clear invalid hash
            localStorage.removeItem(`pin_hash_${user.slug}`);
            return false;
        }
    }, [user?.slug, user?.pin, hashPin]);

    // Store PIN hash with error handling
    const storePinHash = useCallback(async (pinValue: string): Promise<void> => {
        if (!user?.slug) return;
        
        try {
            const hash = await hashPin(pinValue, user.slug);
            localStorage.setItem(`pin_hash_${user.slug}`, hash);
        } catch (error) {
            console.error('Error storing PIN hash:', error);
            // Fallback: store without hash (less secure but functional)
            const simpleHash = hashPinSimple(pinValue, user.slug);
            localStorage.setItem(`pin_hash_${user.slug}`, simpleHash);
        }
    }, [user?.slug, hashPin, hashPinSimple]);

    useEffect(() => {
        const initializePage = async () => {
            // Skip PIN check if not production
            if (!isProduction) {
                setIsLocked(false);
                return;
            }

            // Check if PIN is already stored
            const hasValidPin = await checkStoredPin();
            if (hasValidPin) {
                setIsLocked(false);
            } else {
                setShowPinModal(true);
            }
        };

        initializePage();
    }, [checkStoredPin, isProduction]);

    const handlePinSubmit = async () => {
        const correctPin = user?.pin ?? 0;
        const pinNumber = parseInt(pin);

        if (pinNumber === correctPin) {
            setIsLocked(false);
            setShowPinModal(false);
            setPinError('');
            setPinAttempts(0);

            await storePinHash(pin);
            setPin('');
        } else {
            setPinAttempts((prev) => prev + 1);
            const remainingAttempts = maxPinAttempts - pinAttempts - 1;

            if (remainingAttempts > 0) {
                setPinError(`PIN salah. Sisa percobaan: ${remainingAttempts}`);
            } else {
                setPinError('Terlalu banyak percobaan yang salah. Silakan coba lagi nanti.');
                setTimeout(() => {
                    setPinAttempts(0);
                    setPinError('');
                    setPin('');
                }, 5000);
            }
            setPin('');
        }
    };

    const handleLogout = () => {
        if (user?.slug) {
            localStorage.removeItem(`pin_hash_${user.slug}`);
        }
        router.post(route('logout'));
    };

    const handleResetPin = () => {
        if (user?.slug) {
            localStorage.removeItem(`pin_hash_${user.slug}`);
            setIsLocked(true);
            setShowPinModal(true);
            setPinAttempts(0);
            setPinError('');
            setPin('');
        }
    };

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        setAnalysisResult(null);

        if (selectedFile.type === 'application/pdf') {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        } else if (
            selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            selectedFile.name.toLowerCase().endsWith('.docx')
        ) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`);
        } else {
            setPreviewUrl(null);
        }
    };

    const analyzeDocument = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(route('calculate-price'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to analyze document');
            }

            const result = await response.json();
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setAnalysisResult(null);
        setError(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleDragStateChange = (isDragging: boolean) => {
        setIsDragging(isDragging);
    };

    if (isLocked && isProduction) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
                <Dialog open={showPinModal} onOpenChange={() => {}}>
                    <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Masukkan PIN Akses
                            </DialogTitle>
                            <DialogDescription>
                                Halaman ini memerlukan PIN untuk diakses. Masukkan PIN yang benar untuk melanjutkan.
                                {!isProduction && (
                                    <span className="mt-2 block text-yellow-600 dark:text-yellow-400">Mode Development: PIN dinonaktifkan</span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Masukkan PIN"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handlePinSubmit()}
                                    className="text-center text-lg tracking-widest"
                                    maxLength={6}
                                    disabled={pinAttempts >= maxPinAttempts}
                                />
                                {pinError && <p className="text-sm text-red-600 dark:text-red-400">{pinError}</p>}
                                {pinAttempts >= maxPinAttempts && (
                                    <p className="text-sm text-blue-600 dark:text-blue-400">Menunggu 5 detik sebelum dapat mencoba lagi...</p>
                                )}
                            </div>
                            <Button onClick={handlePinSubmit} className="w-full" disabled={!pin || pinAttempts >= maxPinAttempts}>
                                Buka Halaman
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
            {isUserLoggedIn && (
                <div className="sticky top-0 z-50">
                    <Alert className="rounded-none border-x-0 border-t-0 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>
                                <strong>Peringatan:</strong> Anda saat ini login sebagai {auth.user.name}. Halaman ini untuk pelanggan. Segera logout
                                dan gunakan PIN untuk halaman ini agar dashboard Anda tidak dapat diakses dari halaman ini.
                            </span>
                            <div className="flex gap-2">
                                {isProduction && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResetPin}
                                        className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                                    >
                                        Reset PIN
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {!isProduction && (
                <div className="border-b border-orange-200 bg-orange-100 px-4 py-2 dark:border-orange-800 dark:bg-orange-900/20">
                    <p className="text-center text-sm text-orange-800 dark:text-orange-200">🚧 Mode Development: PIN Security dinonaktifkan</p>
                </div>
            )}

            <Header isLocked={isLocked} user={user} />

            <main className="container mx-auto max-w-6xl px-6 py-8">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{user ? `${user.name}` : 'Analisis Dokumen Cetak'} </h2>
                    {user && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Member Cetak Cerdas, Analisis dokumen cetak Anda akan disimpan di akun {user.name}
                        </p>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <FileUpload
                            file={file}
                            isDragging={isDragging}
                            isAnalyzing={isAnalyzing}
                            error={error}
                            onFileSelect={handleFileSelect}
                            onAnalyze={analyzeDocument}
                            onReset={handleReset}
                            onDragStateChange={handleDragStateChange}
                        />
                        <PriceAnalysis analysisResult={analysisResult} />
                    </div>

                    {file && <DocumentPreview file={file} previewUrl={previewUrl} />}

                    {analysisResult && <DetailedAnalysis analysisResult={analysisResult} />}

                    {!analysisResult && !file && (
                        <Card className="dark:border-gray-700 dark:bg-gray-800/50">
                            <CardContent className="pt-4">
                                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    <div className="mb-3 text-5xl">📈</div>
                                    <p className="text-base">Unggah dokumen untuk melihat hasil analisis dan kalkulasi biaya cetak</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>

            <footer className="mt-16 border-t border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
                <div className="container mx-auto px-6 py-8">
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        <p>© 2025 CetakCerdas. Solusi Cerdas untuk UMKM Percetakan.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Index;
