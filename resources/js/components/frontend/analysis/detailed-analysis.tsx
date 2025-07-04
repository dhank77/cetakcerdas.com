import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AnalysisResult } from '@/types/analysis';
import React from 'react';

interface DetailedAnalysisProps {
    analysisResult: AnalysisResult | null;
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ analysisResult }) => {
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

    if (!analysisResult) {
        return null;
    }

    return (
        <Card id="detail-analysis" className="dark:border-gray-700 dark:bg-gray-800/50">
            <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 dark:text-white">📊 Analisis Detail per Halaman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700/30">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{analysisResult.total_pages}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Halaman</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700/30">
                        <div className="text-lg font-bold text-gray-600 dark:text-gray-400">{analysisResult.bw_pages}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Hitam Putih</div>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/20">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{analysisResult.color_pages}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Berwarna</div>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-3 text-center dark:bg-purple-900/20">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{analysisResult.photo_pages}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Foto</div>
                    </div>
                </div>

                <Separator className="dark:bg-gray-600" />

                <div>
                    <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Detail Halaman</h3>
                    <div className="max-h-[400px] space-y-2 overflow-y-auto">
                        {analysisResult.page_details?.map((page, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-lg border bg-white p-2 dark:border-gray-600 dark:bg-gray-800/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                        {page.halaman}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">Halaman {page.halaman}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{page.persentase_warna.toFixed(1)}% warna</div>
                                    </div>
                                </div>
                                <Badge className={`${getPageTypeColor(page.jenis)} text-xs`}>
                                    <span className="mr-1">{getPageTypeIcon(page.jenis)}</span>
                                    {page.jenis === 'hitam_putih' ? 'Hitam Putih' : page.jenis === 'warna' ? 'Berwarna' : 'Foto'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>

                {analysisResult.pengaturan && (
                    <>
                        <Separator className="dark:bg-gray-600" />
                        <div>
                            <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">Pengaturan Analisis</h3>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-700/30">
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Threshold Warna</div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {analysisResult.pengaturan.threshold_warna}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-700/30">
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Threshold Foto</div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {analysisResult.pengaturan.threshold_foto}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default DetailedAnalysis;
