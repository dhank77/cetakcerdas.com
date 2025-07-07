import FileUpload from '@/components/frontend/analysis/file-upload';
import Header from '@/components/frontend/analysis/header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnalysisResult } from '@/types/analysis';
import { router } from '@inertiajs/react';
import { Calculator, MessageCircle, Upload, User } from 'lucide-react';
import { useCallback, useState } from 'react';

interface BookingProps {
    slug: string;
    priceSettingColor?: number;
    priceSettingPhoto?: number;
    priceSettingBw?: number;
}

const Index = ({ slug, priceSettingColor = 500, priceSettingPhoto = 1000, priceSettingBw = 300 }: BookingProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const handleFileSelect = useCallback((selectedFile: File) => {
        setFile(selectedFile);
        setAnalysisResult(null);
        setError(null);
    }, []);

    const handleReset = useCallback(() => {
        setFile(null);
        setAnalysisResult(null);
        setError(null);
        setIsDragging(false);
    }, []);

    const analyzeDocument = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('slug', slug);

            const response = await fetch(route('calculate-price'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Gagal menganalisis dokumen');
            }

            const result: AnalysisResult = await response.json();
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menganalisis dokumen');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            errors.name = 'Nama harus diisi';
        }

        if (!formData.whatsapp.trim()) {
            errors.whatsapp = 'Nomor WhatsApp harus diisi';
        } else if (!/^[0-9+\-\s()]+$/.test(formData.whatsapp)) {
            errors.whatsapp = 'Nomor WhatsApp hanya boleh berisi angka';
        }

        if (!file) {
            errors.file = 'File harus dipilih';
        }

        if (!analysisResult) {
            errors.analysis = 'Harus melakukan analisis harga terlebih dahulu';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const submitFormData = new FormData();
            submitFormData.append('name', formData.name);
            submitFormData.append('whatsapp', formData.whatsapp);
            submitFormData.append('file', file!);
            submitFormData.append('priceSettingColor', priceSettingColor.toString());
            submitFormData.append('priceSettingBw', priceSettingBw.toString());
            submitFormData.append('priceSettingPhoto', priceSettingPhoto.toString());
            submitFormData.append('totalPrice', analysisResult!.total_price.toString());
            submitFormData.append('totalPages', analysisResult!.total_pages.toString());
            submitFormData.append('bwPages', analysisResult!.bw_pages.toString());
            submitFormData.append('colorPages', analysisResult!.color_pages.toString());
            submitFormData.append('photoPages', analysisResult!.photo_pages.toString());

            router.post(route('booking.store', slug), submitFormData, {
                onSuccess: () => {
                    setFormData({ name: '', whatsapp: '' });
                    setFile(null);
                    setAnalysisResult(null);
                },
                onError: (errors) => {
                    setFormErrors(errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          console.log(err);
          
            setError('Terjadi kesalahan saat mengirim data');
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="container mx-auto px-4 py-8">
                    {/* Header Section */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">📄 Upload & Cetak Dokumen</h1>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                            Upload dokumen Anda, dapatkan analisis harga otomatis, dan kirim untuk dicetak
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
                        {/* Step 1: File Upload */}
                        <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                    <Upload className="h-5 w-5" />
                                    Langkah 1: Upload Dokumen
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FileUpload
                                    file={file}
                                    isDragging={isDragging}
                                    isAnalyzing={isAnalyzing}
                                    error={error}
                                    onFileSelect={handleFileSelect}
                                    onAnalyze={analyzeDocument}
                                    onReset={handleReset}
                                    onDragStateChange={setIsDragging}
                                />
                                {formErrors.file && (
                                    <Alert className="mt-3 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                        <AlertDescription className="text-red-800 dark:text-red-400">{formErrors.file}</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 2: Price Analysis */}
                        {file && (
                            <Card className="border-2 border-dashed border-green-200 dark:border-green-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                        <Calculator className="h-5 w-5" />
                                        Langkah 2: Analisis Harga
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!analysisResult ? (
                                        <div className="py-8 text-center">
                                            <div className="mb-4 text-4xl">🔍</div>
                                            <p className="mb-4 text-gray-600 dark:text-gray-400">
                                                Klik tombol "Hitung Harga" untuk menganalisis dokumen Anda
                                            </p>
                                            <Button onClick={analyzeDocument} disabled={isAnalyzing} className="bg-green-600 hover:bg-green-700">
                                                {isAnalyzing ? (
                                                    <>
                                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                                        Menganalisis...
                                                    </>
                                                ) : (
                                                    <>🔍 Hitung Harga</>
                                                )}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
                                            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                                        {analysisResult.total_pages}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Halaman</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                                        {analysisResult.bw_pages}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Hitam Putih</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                                        {analysisResult.color_pages}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Warna</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                                        {analysisResult.photo_pages}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Foto</div>
                                                </div>
                                            </div>
                                            <div className="border-t border-green-200 pt-4 text-center dark:border-green-700">
                                                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                                                    {formatCurrency(analysisResult.total_price)}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Harga</div>
                                            </div>
                                        </div>
                                    )}
                                    {formErrors.analysis && (
                                        <Alert className="mt-3 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                            <AlertDescription className="text-red-800 dark:text-red-400">{formErrors.analysis}</AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Customer Information */}
                        {analysisResult && (
                            <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                        <User className="h-5 w-5" />
                                        Langkah 3: Informasi Pelanggan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Nama Lengkap *
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                            placeholder="Masukkan nama lengkap Anda"
                                            className={`mt-1 ${formErrors.name ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <MessageCircle className="mr-1 inline h-4 w-4" />
                                            Nomor WhatsApp *
                                        </Label>
                                        <Input
                                            id="whatsapp"
                                            type="text"
                                            value={formData.whatsapp}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                                                setFormData((prev) => ({ ...prev, whatsapp: value }));
                                            }}
                                            placeholder="Contoh: +62812345678 atau 08123456789"
                                            className={`mt-1 ${formErrors.whatsapp ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.whatsapp && <p className="mt-1 text-sm text-red-500">{formErrors.whatsapp}</p>}
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Nomor ini akan digunakan untuk konfirmasi pesanan
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Submit Button */}
                        {analysisResult && formData.name && formData.whatsapp && (
                            <div className="text-center">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-lg font-semibold text-white hover:from-blue-700 hover:to-purple-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>📤 Kirim Pesanan ({formatCurrency(analysisResult.total_price)})</>
                                    )}
                                </Button>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Dengan mengirim pesanan, Anda menyetujui untuk dihubungi melalui WhatsApp
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
};

export default Index;