import DetailedAnalysis from '@/components/frontend/analysis/detailed-analysis';
import DocumentPreview from '@/components/frontend/analysis/document-preview';
import FileUpload from '@/components/frontend/analysis/file-upload';
import Header from '@/components/frontend/analysis/header';
import PriceAnalysis from '@/components/frontend/analysis/price-analysis';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/types';
import { AnalysisResult } from '@/types/analysis';
import { useState } from 'react';

const Index = ({ user }: { user: User | null }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
            <Header />

            <main className="container mx-auto max-w-6xl px-6 py-8">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{user ? `${user.name}` : 'Analisis Dokumen Cetak'} </h2>
                    {
                        user && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Member Cetak Cerdas, Analisis dokumen cetak Anda akan disimpan di akun {user.name}
                            </p>
                        )
                    }
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
