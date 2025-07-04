import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResult } from '@/types/analysis';
import React from 'react';

interface PriceAnalysisProps {
    analysisResult: AnalysisResult | null;
}

const PriceAnalysis: React.FC<PriceAnalysisProps> = ({ analysisResult }) => {
    const scrollToDetailAnalysis = () => {
        const detailSection = document.getElementById('detail-analysis');
        detailSection?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Card className="h-fit lg:col-span-1 dark:border-gray-700 dark:bg-gray-800/50">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
                    💰 Hasil Analisis Harga
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-700/30">
                        <div className="text-base font-bold text-gray-600 dark:text-gray-400">
                            {analysisResult ? `Rp ${analysisResult.price_bw?.toLocaleString('id-ID') || '0'}` : 'Rp 0'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Hitam Putih</div>
                        {analysisResult && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">{analysisResult.bw_pages} hal</div>
                        )}
                    </div>

                    <div className="rounded-lg bg-blue-50 p-2 text-center dark:bg-blue-900/20">
                        <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                            {analysisResult ? `Rp ${analysisResult.price_color?.toLocaleString('id-ID') || '0'}` : 'Rp 0'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Berwarna</div>
                        {analysisResult && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">{analysisResult.color_pages} hal</div>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                    <div className="text-center">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            {analysisResult?.total_price
                                ? `Rp ${analysisResult.total_price?.toLocaleString('id-ID') || '0'}`
                                : 'Rp 0'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Biaya Cetak</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                            {analysisResult?.total_pages ? `${analysisResult.total_pages} halaman total` : '0 halaman total'}
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