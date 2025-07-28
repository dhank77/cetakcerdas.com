/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResult } from '@/types/analysis';
import { Check, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import CartPopup from './cart-popup';

interface PriceAnalysisProps {
    analysisResult: AnalysisResult | null;
    priceSettingColor: number;
    priceSettingPhoto: number;
    priceSettingBw: number;
    fileName?: string;
    previewUrl?: string | null; // Tambahkan prop ini
}

const PriceAnalysis: React.FC<PriceAnalysisProps> = ({
    analysisResult,
    priceSettingColor,
    priceSettingPhoto,
    priceSettingBw,
    fileName = 'Dokumen',
    previewUrl,
}) => {
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [isItemAdded, setIsItemAdded] = useState(false);

    useEffect(() => {
        const existingCart = localStorage.getItem('printCart');
        if (existingCart) {
            const cartItems = JSON.parse(existingCart);
            if (cartItems.length > 0) {
                setIsCartVisible(true);
            }
        }
    }, []);

    useEffect(() => {
        setIsItemAdded(false);
    }, [analysisResult]);

    const addToCart = async () => {
        if (!analysisResult) return;

        const cartItem = {
            id: Date.now().toString(),
            fileName: fileName,
            totalPrice: analysisResult.total_price || 0,
            totalPages: analysisResult.total_pages || 0,
            bwPages: analysisResult.bw_pages || 0,
            colorPages: analysisResult.color_pages || 0,
            photoPages: analysisResult.photo_pages || 0,
            priceBw: analysisResult.price_bw || 0,
            priceColor: analysisResult.price_color || 0,
            pricePhoto: analysisResult.price_photo || 0,
            timestamp: Date.now(),
        };

        // Get existing cart
        const existingCart = localStorage.getItem('printCart');
        const cartItems = existingCart ? JSON.parse(existingCart) : [];

        // Add new item
        cartItems.push(cartItem);

        // Save to localStorage
        localStorage.setItem('printCart', JSON.stringify(cartItems));

        // Dispatch custom event to notify cart update
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        // Check if running in desktop app
        const isDesktopApp = (window as any).desktopAPI?.isDesktop;
        
        if (previewUrl && previewUrl !== 'docx-pending' && previewUrl !== 'docx-info') {
            if (isDesktopApp && (window as any).electronAPI?.printDocument) {
                // Use desktop app print functionality
                try {
                    await (window as any).electronAPI.printDocument(previewUrl);
                } catch (error) {
                    console.error('Desktop print failed:', error);
                    alert('Gagal mencetak dokumen. Silakan coba lagi.');
                }
            } else {
                // Use browser print functionality
                const printWindow = window.open(previewUrl, '_blank');
                if (printWindow) {
                    printWindow.onload = () => {
                        setTimeout(() => {
                            printWindow.print();
                        }, 1000);
                    };
                }
            }
        } else if (analysisResult.file_url) {
            if (isDesktopApp && (window as any).electronAPI?.printDocument) {
                // Use desktop app print functionality for fallback URL
                try {
                    await (window as any).electronAPI.printDocument(analysisResult.file_url);
                } catch (error) {
                    console.error('Desktop print failed:', error);
                    alert('Gagal mencetak dokumen. Silakan coba lagi.');
                }
            } else {
                // Fallback to file_url from analysis result
                const printWindow = window.open(analysisResult.file_url, '_blank');
                if (printWindow) {
                    printWindow.onload = () => {
                        setTimeout(() => {
                            printWindow.print();
                        }, 1000);
                    };
                }
            }
        } else {
            alert('Dokumen tidak tersedia untuk dicetak. Silakan upload ulang dokumen.');
        }

        // Mark item as added and show cart popup
        setIsItemAdded(true);
        setIsCartVisible(true);
    };

    const handleCartFinish = () => {
        setIsCartVisible(false);
        setIsItemAdded(false);
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    };

    return (
        <>
            <Card className="h-fit lg:col-span-2 dark:border-gray-700 dark:bg-gray-800/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-white">💰 Hasil Analisis Harga</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/10">
                        <div className="mb-2 text-xs font-medium text-blue-800 dark:text-blue-200">Harga Satuan (per halaman)</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                                <div className="font-semibold text-gray-700 dark:text-gray-300">
                                    Rp {priceSettingBw?.toLocaleString('id-ID') || '0'}
                                </div>
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
                            <div className="flex justify-between">
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

                    <div className="space-y-2 pt-1">
                        {analysisResult && analysisResult.total_price > 0 && (
                            <Button
                                onClick={addToCart}
                                disabled={isItemAdded}
                                className={`w-full gap-2 ${
                                    isItemAdded
                                        ? 'bg-green-600 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-600'
                                        : 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700'
                                }`}
                                size="sm"
                            >
                                {isItemAdded ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Sudah Ditambahkan
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Tambah ke Keranjang & Cetak
                                    </>
                                )}
                            </Button>
                        )}
                        {/* Tombol "Lihat Detail Analisis" dihilangkan sesuai permintaan */}
                    </div>
                </CardContent>
            </Card>

            <CartPopup isVisible={isCartVisible} onClose={() => setIsCartVisible(false)} onFinish={handleCartFinish} />
        </>
    );
};

export default PriceAnalysis;
