import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResult } from '@/types/analysis';
import React from 'react';

interface PriceAnalysisProps {
    analysisResult: AnalysisResult | null;
    priceSettingColor: number;
    priceSettingPhoto: number;
    priceSettingBw: number;
}

const PriceAnalysis: React.FC<PriceAnalysisProps> = ({ analysisResult, priceSettingColor, priceSettingPhoto, priceSettingBw }) => {
    const scrollToDetailAnalysis = () => {
        const detailSection = document.getElementById('detail-analysis');
        detailSection?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Card className="h-fit lg:col-span-2 dark:border-gray-700 dark:bg-gray-800/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-white">💰 Hasil Analisis Harga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/10">
                    <div className="mb-2 text-xs font-medium text-blue-800 dark:text-blue-200">Harga Satuan (per halaman)</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                            <div className="font-semibold text-gray-700 dark:text-gray-300">Rp {priceSettingBw?.toLocaleString('id-ID') || '0'}</div>
                            <div className="text-gray-500 dark:text-gray-400">H/P</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-blue-600 dark:text-blue-400">
                                Rp {priceSettingColor?.toLocaleString('id-ID') || '0'}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">Warna</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-purple-600 dark:text-purple-400">
                                Rp {priceSettingPhoto?.toLocaleString('id-ID') || '0'}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">Foto</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-700/30">
                        <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            {analysisResult ? `Rp ${analysisResult.price_bw?.toLocaleString('id-ID') || '0'}` : 'Rp 0'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Hitam Putih</div>
                        {analysisResult && <div className="text-xs text-gray-500 dark:text-gray-500">{analysisResult.bw_pages} hal</div>}
                    </div>

                    <div className="rounded-lg bg-blue-50 p-2 text-center dark:bg-blue-900/20">
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {analysisResult ? `Rp ${analysisResult.price_color?.toLocaleString('id-ID') || '0'}` : 'Rp 0'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Berwarna</div>
                        {analysisResult && <div className="text-xs text-gray-500 dark:text-gray-500">{analysisResult.color_pages} hal</div>}
                    </div>

                    <div className="rounded-lg bg-purple-50 p-2 text-center dark:bg-purple-900/20">
                        <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                            {analysisResult ? `Rp ${analysisResult.price_photo?.toLocaleString('id-ID') || '0'}` : 'Rp 0'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Foto</div>
                        {analysisResult && <div className="text-xs text-gray-500 dark:text-gray-500">{analysisResult.photo_pages} hal</div>}
                    </div>
                </div>

                <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                    <div>
                        <div className='flex justify-between'>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Total Biaya Cetak</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                                {analysisResult?.total_pages ? `${analysisResult.total_pages} halaman total` : '0 halaman total'}
                            </div>
                        </div>
                        <div className="text-center text-xl font-bold text-green-600 dark:text-green-400">
                            {analysisResult?.total_price ? `Rp ${analysisResult.total_price?.toLocaleString('id-ID') || '0'}` : 'Rp 0'}
                        </div>
                    </div>
                </div>

                <div className="pt-1">
                    <Button
                        onClick={scrollToDetailAnalysis}
                        className="w-full gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                        size="sm"
                    >
                        📊 Lihat Detail Analisis
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default PriceAnalysis;
