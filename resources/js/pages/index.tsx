import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import React, { useCallback, useEffect, useState } from 'react';

interface PageDetail {
    halaman: number;
    jenis: 'hitam_putih' | 'warna' | 'foto';
    persentase_warna: number;
}

interface AnalysisResult {
    total_pages: number;
    color_pages: number;
    bw_pages: number;
    photo_pages: number;
    page_details: PageDetail[];
    pengaturan: {
        threshold_warna: string;
        threshold_foto: string;
    };
}

const Index = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

        setIsDarkMode(shouldUseDark);
        document.documentElement.classList.toggle('dark', shouldUseDark);
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newDarkMode);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (
                droppedFile.type === 'application/pdf' ||
                droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                droppedFile.name.toLowerCase().endsWith('.docx')
            ) {
                setFile(droppedFile);
                setError(null);
                setAnalysisResult(null);

                if (droppedFile.type === 'application/pdf') {
                    const url = URL.createObjectURL(droppedFile);
                    setPreviewUrl(url);
                } else if (
                    droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    droppedFile.name.toLowerCase().endsWith('.docx')
                ) {
                    const url = URL.createObjectURL(droppedFile);
                    setPreviewUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`);
                } else {
                    setPreviewUrl(null);
                }
            } else {
                setError('Silakan unggah dokumen PDF atau Word (.pdf, .docx)');
            }
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
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

    const resetUpload = () => {
        setFile(null);
        setAnalysisResult(null);
        setError(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const getPageTypeColor = (type: string) => {
        switch (type) {
            case 'foto':
                return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
            case 'warna':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
            case 'hitam_putih':
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
        }
    };

    const getPageTypeIcon = (type: string) => {
        switch (type) {
            case 'foto':
                return '📸';
            case 'warna':
                return '🎨';
            case 'hitam_putih':
                return '⚫';
            default:
                return '📄';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
            {/* Custom Header */}
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">📄</div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">CetakCerdas.Com</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Analisis Dokumen Berbasis AI</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={toggleDarkMode} className="gap-2">
                            <span>{isDarkMode ? '☀️' : '🌙'}</span>
                            <span>{isDarkMode ? 'Terang' : 'Gelap'}</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-6xl px-6 py-8">
                {/* Hero Section */}
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Analisis Dokumen Cetak Anda</h2>
                </div>

                {/* Upload Section - Full Width */}
                <div className="space-y-8">
                    <Card className="dark:border-gray-700 dark:bg-gray-800/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">📁 Unggah Dokumen</CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Seret dan lepas dokumen PDF atau Word Anda di sini, atau klik untuk memilih file
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`rounded-lg border-2 border-dashed p-6 text-center transition-all duration-300 ${
                                    isDragging
                                        ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800/50'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {file ? (
                                    <div className="space-y-4">
                                        <div className="text-4xl">📄</div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <div className="flex justify-center gap-3">
                                            <Button onClick={analyzeDocument} disabled={isAnalyzing} size="lg">
                                                {isAnalyzing ? (
                                                    <>
                                                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                                        Menganalisis...
                                                    </>
                                                ) : (
                                                    <>🔍 Hitung Harga</>
                                                )}
                                            </Button>
                                            <Button variant="outline" onClick={resetUpload} size="lg">
                                                🗑️ Hapus
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 py-2">
                                        <div className="text-5xl text-gray-400 dark:text-gray-600">📁</div>
                                        <div>
                                            <p className="text-xl font-medium text-gray-900 dark:text-white">Letakkan dokumen Anda di sini</p>
                                            <p className="text-gray-500 dark:text-gray-400">Mendukung dokumen PDF dan Word (.pdf, .docx)</p>
                                            <input type="file" accept=".pdf,.docx" onChange={handleFileSelect} className="hidden" id="file-upload" />
                                            <label htmlFor="file-upload">
                                                <Button asChild variant="outline" size="lg">
                                                    <span className="cursor-pointer">Pilih File</span>
                                                </Button>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                    <div className="text-red-800 dark:text-red-400">
                                        <strong>Kesalahan:</strong> {error}
                                    </div>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Preview Section - Full Width Below Upload */}
                    {previewUrl && (
                        <Card className="dark:border-gray-700 dark:bg-gray-800/50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-gray-900 dark:text-white">📖 Pratinjau Dokumen</CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (file?.type === 'application/pdf') {
                                                    window.open(previewUrl, '_blank');
                                                } else {
                                                    // For Word documents, open in new tab for better printing experience
                                                    window.open(previewUrl, '_blank');
                                                }
                                            }}
                                        >
                                            🖨️ Cetak
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => window.open(previewUrl, '_blank')}>
                                            🔍 Buka di Tab Baru
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-hidden rounded-lg border dark:border-gray-600">
                                    <iframe src={previewUrl} className="h-[600px] w-full" title="Document Preview" allow="print" />
                                </div>
                                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                    <p className="flex items-center gap-2">
                                        <span>💡</span>
                                        {file?.type === 'application/pdf'
                                            ? 'Dokumen PDF dapat dicetak langsung dari pratinjau ini'
                                            : 'Dokumen Word ditampilkan menggunakan Office Online. Klik "Cetak" atau "Buka di Tab Baru" untuk opsi cetak yang lebih baik'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Analysis Results - Full Width */}
                    {analysisResult && (
                        <div className="space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <Card className="dark:border-gray-700 dark:bg-gray-800/50">
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analysisResult.total_pages}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Halaman</div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="dark:border-gray-700 dark:bg-gray-800/50">
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                                {analysisResult.photo_pages}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Halaman Foto</div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="dark:border-gray-700 dark:bg-gray-800/50">
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{analysisResult.color_pages}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Halaman Warna</div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="dark:border-gray-700 dark:bg-gray-800/50">
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{analysisResult.bw_pages}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Halaman Hitam Putih</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detailed Analysis */}
                            <Card className="dark:border-gray-700 dark:bg-gray-800/50">
                                <CardHeader>
                                    <CardTitle className="text-gray-900 dark:text-white">📊 Analisis Detail</CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Rincian per halaman dengan persentase warna untuk kalkulasi biaya cetak
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-96 space-y-3 overflow-y-auto">
                                        {analysisResult.page_details.map((page) => (
                                            <div
                                                key={page.halaman}
                                                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="text-lg">{getPageTypeIcon(page.jenis)}</div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">Halaman {page.halaman}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {page.persentase_warna}% konten warna
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge className={getPageTypeColor(page.jenis)} variant="outline">
                                                    {page.jenis.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator className="my-4 dark:bg-gray-600" />

                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <div className="mb-1 flex justify-between">
                                            <span>Ambang Batas Warna:</span>
                                            <span>{analysisResult.pengaturan.threshold_warna}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Ambang Batas Foto:</span>
                                            <span>{analysisResult.pengaturan.threshold_foto}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {!analysisResult && !file && (
                        <Card className="dark:border-gray-700 dark:bg-gray-800/50">
                            <CardContent className="pt-6">
                                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="mb-4 text-6xl">📈</div>
                                    <p className="text-lg">Unggah dokumen untuk melihat hasil analisis dan kalkulasi biaya cetak</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>

            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                Unggah dokumen PDF atau Word Anda untuk mendapatkan analisis detail jenis halaman, distribusi warna, dan kalkulasi biaya cetak untuk
                UMKM percetakan
            </p>

            {/* Footer */}
            <footer className="mt-16 border-t border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
                <div className="container mx-auto px-6 py-8">
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        <p>© 2024 CetakCerdas. Solusi Cerdas untuk UMKM Percetakan.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Index;
