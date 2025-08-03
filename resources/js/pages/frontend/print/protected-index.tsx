/* eslint-disable @typescript-eslint/no-explicit-any */
import DetailedAnalysis from '@/components/frontend/analysis/detailed-analysis';
import DocumentPreview from '@/components/frontend/analysis/document-preview';
import FileUpload from '@/components/frontend/analysis/file-upload';
import Header from '@/components/frontend/analysis/header';
import LocalFileBrowser from '@/components/frontend/analysis/local-file-browser';
import PriceAnalysis from '@/components/frontend/analysis/price-analysis';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SharedData, User } from '@/types';
import { AnalysisResult } from '@/types/analysis';
import { Head, usePage } from '@inertiajs/react';
import { FolderOpen, Lock, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProtectedPrintProps {
    user: User;
    priceSettingColor: number;
    priceSettingPhoto: number;
    priceSettingBw: number;
}

const ProtectedIndex = ({ user, priceSettingColor, priceSettingPhoto, priceSettingBw }: ProtectedPrintProps) => {
    const { auth } = usePage<SharedData>().props;

    // Auto reload on first access
    useEffect(() => {
        const hasReloaded = sessionStorage.getItem('protected_page_reloaded');
        if (!hasReloaded) {
            sessionStorage.setItem('protected_page_reloaded', 'true');
            window.location.reload();
        }
    }, []);

    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showLocalFileBrowser, setShowLocalFileBrowser] = useState(false);
    const [isDesktopApp, setIsDesktopApp] = useState(false);

    const isUserLoggedIn = auth && auth.user;

    // Check if running in desktop app
    useEffect(() => {
        const checkDesktopApp = () => {
            const desktopAPI = (window as any).desktopAPI;
            const isDesktop = desktopAPI?.isDesktop || (window as any).isDesktopApp || false;
            setIsDesktopApp(isDesktop);
        };
        
        checkDesktopApp();
        
        // Check URL parameters for file browser mode
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'file-browser') {
            setShowLocalFileBrowser(true);
        }
    }, []);

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
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
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
                        Accept: 'application/json',
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

            if (response.status === 429) {
                throw new Error('Terlalu banyak percobaan. Silakan tunggu sebentar.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP Error: ${response.status}`);
            }

            const result = await response.json();
            setAnalysisResult(result);

            if (
                result.file_url &&
                (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx'))
            ) {
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

    const openLocalFileBrowser = async () => {
        try {
            const localFileAPI = (window as any).localFileAPI;
            if (localFileAPI) {
                await localFileAPI.openFileBrowser();
            } else {
                alert('Local file browser is only available in the desktop app');
            }
        } catch (error) {
            console.error('Error opening local file browser:', error);
            alert('Failed to open local file browser');
        }
    };

    // If in file browser mode, show the local file browser component
    if (showLocalFileBrowser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
                <Head title={`Local File Browser - ${user.name}`} />
                <LocalFileBrowser />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
            {/* Admin Warning if logged in */}
            {isUserLoggedIn && (
                <div className="sticky top-0 z-40">
                    <Alert className="rounded-none border-x-0 border-t-0 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <Lock className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>
                                <strong>Peringatan Admin:</strong> Anda login sebagai {auth.user.name} dan mengakses halaman khusus. Pastikan ini
                                adalah akses yang diinginkan.
                            </span>
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            <Header isLocked={false} user={user} />
            <Head title={`Halaman Khusus - ${user.name}`} />

            <main className="container mx-auto max-w-6xl px-6 py-8">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                        <Shield className="mr-3 inline h-8 w-8 text-green-600" />
                        {user.name} - Halaman Khusus
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Halaman print khusus dengan akses terbatas. Analisis dokumen cetak akan disimpan di akun {user.name}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Desktop App Local File Browser Button */}
                    {isDesktopApp && (
                        <div className="mb-6">
                            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                                Desktop App Features
                                            </h3>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                Access local files and view analysis history
                                            </p>
                                        </div>
                                        <Button
                                            onClick={openLocalFileBrowser}
                                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                                        >
                                            <FolderOpen className="h-4 w-4 mr-2" />
                                            Buka File Lokal
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

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
                            isDesktopApp={isDesktopApp}
                        />
                    </div>

                    {file && <DocumentPreview file={file} previewUrl={previewUrl} />}

                    {analysisResult && <DetailedAnalysis analysisResult={analysisResult} />}

                    {!analysisResult && !file && (
                        <Card className="dark:border-gray-700 dark:bg-gray-800/50">
                            <CardContent className="pt-4">
                                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    <div className="mb-3 text-5xl">🔒</div>
                                    <p className="text-base">
                                        Halaman khusus siap digunakan. Unggah dokumen untuk melihat hasil analisis dan kalkulasi biaya cetak
                                    </p>
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
                        <p className="mt-2 text-sm">Halaman Khusus - Akses Terbatas</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ProtectedIndex;
