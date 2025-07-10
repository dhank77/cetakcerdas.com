import DetailedAnalysis from '@/components/frontend/analysis/detailed-analysis';
import DocumentPreview from '@/components/frontend/analysis/document-preview';
import FileUpload from '@/components/frontend/analysis/file-upload';
import Header from '@/components/frontend/analysis/header';
import PriceAnalysis from '@/components/frontend/analysis/price-analysis';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SharedData, User } from '@/types';
import { AnalysisResult } from '@/types/analysis';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import PinModal, { PinModalRef } from '@/components/frontend/landing/pin-modal';

interface PrintProps {
    user: User | null;
    priceSettingColor: number;
    priceSettingPhoto: number;
    priceSettingBw: number;
}

const Index = ({ user, priceSettingColor, priceSettingPhoto, priceSettingBw }: PrintProps) => { 
    const { auth } = usePage<SharedData>().props;
    const pinModalRef = useRef<PinModalRef>(null);

    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [isLocked, setIsLocked] = useState(user ? true : false);
    
    const isUserLoggedIn = auth && auth.user;

    const isProduction = true;//import.meta.env.VITE_APP_ENV === 'production';

    useEffect(() => {
        const initializePage = async () => {
            if (!isProduction) {
                setIsLocked(false);
                return;
            }

            if (pinModalRef.current) {
                const hasValidPin = await pinModalRef.current.checkStoredPin();
                if (hasValidPin) {
                    setIsLocked(false);
                } else {
                    setIsLocked(true);
                }
            }
        };

        initializePage();
    }, [isProduction]);

    const handleLogout = () => {
        if (user?.slug) {
            localStorage.removeItem(`pin_hash_${user.slug}`);
        }
        router.post(route('logout'));
    };

    const handleFileSelect = async (selectedFile: File) => {
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
            setPreviewUrl('docx-pending');
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
            formData.append('slug', user?.slug ?? '');

            // Function to get current CSRF token
            const getCurrentToken = () => {
                return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            };

            // Function to refresh CSRF token using dedicated endpoint
            const refreshCSRFToken = async () => {
                try {
                    const response = await fetch(route('csrf-token'), {
                        method: 'GET',
                        credentials: 'same-origin',
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const newToken = data.token;
                        
                        if (newToken) {
                            // Update the token in current page
                            const currentTokenMeta = document.querySelector('meta[name="csrf-token"]');
                            if (currentTokenMeta) {
                                currentTokenMeta.setAttribute('content', newToken);
                            }
                            return newToken;
                        }
                    }
                } catch (error) {
                    console.error('Failed to refresh CSRF token:', error);
                }
                return null;
            };

            // Function to make the API request
            const makeRequest = async (token: string) => {
                return await fetch(route('calculate-price'), {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': token,
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: formData,
                    credentials: 'same-origin',
                });
            };

            let csrfToken = getCurrentToken();
            
            if (!csrfToken) {
                console.log('No CSRF token found, attempting to get fresh token...');
                csrfToken = await refreshCSRFToken();
                
                if (!csrfToken) {
                    throw new Error('CSRF token tidak ditemukan. Silakan refresh halaman.');
                }
            }

            // First attempt
            let response = await makeRequest(csrfToken);

            // If CSRF token mismatch, try to refresh token and retry once
            if (response.status === 419) {
                console.log('CSRF token mismatch, attempting to refresh token...');
                
                const newToken = await refreshCSRFToken();
                
                if (newToken) {
                    console.log('Token refreshed successfully, retrying request...');
                    response = await makeRequest(newToken);
                } else {
                    throw new Error('Gagal memperbarui token CSRF. Silakan refresh halaman dan coba lagi.');
                }
            }
            
            // If still getting 419 after refresh, give up
            if (response.status === 419) {
                throw new Error('Sesi telah berakhir. Silakan refresh halaman dan coba lagi.');
            }
            
            if (response.status === 429 && (user?.slug ?? '') === '') {
                throw new Error('Terlalu banyak percobaan. Silakan daftar gratis tanpa limit.');
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP Error: ${response.status}`);
            }

            const result = await response.json();
            setAnalysisResult(result);
            
            if (result.file_url && (
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.name.toLowerCase().endsWith('.docx')
            )) {
                const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(result.file_url)}`;
                setPreviewUrl(officeUrl);
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui');
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

    const handlePinSuccess = useCallback(() => {
        setIsLocked(false);
    }, []);

    if (isLocked && isProduction) {
        return (
            <PinModal
                ref={pinModalRef}
                user={user}
                isProduction={isProduction}
                onPinSuccess={handlePinSuccess}
            />
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
            <Head title='Halaman Print' />

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
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
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
                        <PriceAnalysis 
                            analysisResult={analysisResult} 
                            priceSettingColor={priceSettingColor} 
                            priceSettingPhoto={priceSettingPhoto} 
                            priceSettingBw={priceSettingBw}
                            fileName={file?.name}
                            previewUrl={previewUrl}
                        />
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
