/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResult } from '@/types/analysis';
import { Check, Plus, Eye } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import CartPopup from './cart-popup';

interface PriceAnalysisProps {
    analysisResult: AnalysisResult | null;
    priceSettingColor: number;
    priceSettingPhoto: number;
    priceSettingBw: number;
    fileName?: string;
    previewUrl?: string | null;
    isDesktopApp?: boolean;
}

const PriceAnalysis: React.FC<PriceAnalysisProps> = ({
    analysisResult,
    priceSettingColor,
    priceSettingPhoto,
    priceSettingBw,
    fileName = 'Dokumen',
    previewUrl,
    isDesktopApp = false,
}) => {
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [isItemAdded, setIsItemAdded] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

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
    
    // Ensure cart popup stays visible even when window loses focus
    useEffect(() => {
        const handleWindowFocus = () => {
            // Re-check cart visibility when window regains focus
            const existingCart = localStorage.getItem('printCart');
            if (existingCart) {
                const cartItems = JSON.parse(existingCart);
                if (cartItems.length > 0 && isItemAdded) {
                    setIsCartVisible(true);
                }
            }
        };
        
        window.addEventListener('focus', handleWindowFocus);
        return () => window.removeEventListener('focus', handleWindowFocus);
    }, [isItemAdded]);

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
        
        // Mark item as added and show cart popup IMMEDIATELY after adding to cart
        setIsItemAdded(true);
        setIsCartVisible(true);
        
        // Small delay to ensure cart popup is rendered before print operations
        await new Promise(resolve => setTimeout(resolve, 200));

        // Enhanced desktop app detection and local file handling
        const detectedDesktopApp = (window as any).desktopAPI?.isDesktop || (window as any).isDesktopApp || false;
        const finalIsDesktopApp = isDesktopApp || detectedDesktopApp;
        const electronAPI = (window as any).electronAPI;
        const localFileAPI = (window as any).localFileAPI;
        
        console.log('🔍 Enhanced Print Debug Info:');
        console.log('- desktopAPI.isDesktop:', (window as any).desktopAPI?.isDesktop);
        console.log('- window.isDesktopApp:', (window as any).isDesktopApp);
        console.log('- isDesktopApp prop:', isDesktopApp);
        console.log('- detectedDesktopApp:', detectedDesktopApp);
        console.log('- finalIsDesktopApp:', finalIsDesktopApp);
        console.log('- previewUrl:', previewUrl);
        console.log('- analysisResult.file_url:', analysisResult.file_url);
        console.log('- electronAPI available:', !!electronAPI?.printDocument);
        console.log('- localFileAPI available:', !!localFileAPI);
        console.log('- analysisResult.analysis_mode:', analysisResult.analysis_mode);
        console.log('- fileName:', fileName);
        console.log('- file extension:', fileName.toLowerCase().split('.').pop());
        
        // Save analysis result to local cache if desktop app
        if (finalIsDesktopApp && localFileAPI && analysisResult) {
            try {
                await localFileAPI.saveAnalysisResult({
                    id: cartItem.id,
                    fileName: fileName,
                    analysisResult: analysisResult,
                    analyzedAt: Date.now(),
                    filePath: previewUrl || analysisResult.file_url || '',
                    fileSize: 0,
                    lastModified: Date.now()
                });
                console.log('✅ Analysis result saved to local cache');
            } catch (error) {
                console.error('❌ Failed to save analysis to local cache:', error);
            }
        }
        
        // Enhanced printing logic with local file support
        const fileExtension = fileName.toLowerCase().split('.').pop();
        const isDocxFile = fileExtension === 'docx';
        
        // For desktop app with local analysis, handle DOCX files differently
        if (finalIsDesktopApp && analysisResult.analysis_mode === 'local_desktop' && isDocxFile) {
            console.log('📄 Local DOCX file detected in desktop app');
            
            // For local DOCX files, try to convert to PDF or use system default
            if (localFileAPI) {
                try {
                    console.log('🖨️ Attempting to print local DOCX file with LibreOffice conversion...');
                    const printSettings = await localFileAPI.getPrintSettings();
                    
                    // Use the original file path from analysis result
                    const filePath = analysisResult.file_url || previewUrl;
                    if (filePath && filePath.startsWith('file://')) {
                        const result = await localFileAPI.printLocalFileEnhanced({
                            filePath: filePath,
                            printSettings
                        });
                        
                        if (result.success) {
                            console.log('✅ Local DOCX print successful');
                            if (result.message) {
                                alert('File DOCX berhasil dibuka dengan aplikasi default sistem. Silakan cetak dari aplikasi yang terbuka (misalnya WPS Office, Microsoft Word, atau LibreOffice).');
                            }
                        } else {
                            console.warn('⚠️ Local DOCX print warning:', result.failureReason);
                            // Don't throw error for DOCX files, just show a user-friendly message
                            alert('File DOCX berhasil dianalisis tetapi tidak dapat dicetak langsung. Silakan buka file dengan aplikasi office (WPS Office, Microsoft Word, atau LibreOffice) untuk mencetak.');
                        }
                    } else {
                        throw new Error('Invalid file path for local DOCX');
                    }
                } catch (error) {
                    console.error('❌ Local DOCX print failed:', error);
                    alert('Gagal mencetak file DOCX. Pastikan aplikasi office seperti Microsoft Word, WPS Office, atau LibreOffice terinstall di sistem Anda.');
                }
            } else {
                alert('Local file API tidak tersedia. Silakan restart aplikasi desktop.');
            }
        } else if (previewUrl && previewUrl !== 'docx-pending' && previewUrl !== 'docx-info') {
            console.log('✅ Using previewUrl for printing:', previewUrl);
            
            if (finalIsDesktopApp && localFileAPI && analysisResult.analysis_mode === 'local_desktop') {
                // Use enhanced local file printing for local analysis
                console.log('🖨️ Using enhanced local file printing...');
                try {
                    const printSettings = await localFileAPI.getPrintSettings();
                    const result = await localFileAPI.printLocalFileEnhanced({
                        filePath: previewUrl,
                        printSettings
                    });
                    
                    if (result.success) {
                        console.log('✅ Enhanced local print successful');
                        if (result.message) {
                            alert(result.message);
                        }
                    } else {
                        console.warn('⚠️ Enhanced local print warning:', result.failureReason);
                        if (result.failureReason) {
                            alert(result.failureReason);
                        }
                    }
                } catch (error) {
                    console.error('❌ Enhanced local print failed, falling back to standard print:', error);
                    // Fallback to standard electron print
                    if (electronAPI?.printDocument) {
                        await electronAPI.printDocument(previewUrl);
                    }
                }
            } else if (finalIsDesktopApp && electronAPI?.printDocument) {
                // Use standard desktop app print functionality
                console.log('🖨️ Using standard desktop app print function...');
                try {
                    const result = await electronAPI.printDocument(previewUrl);
                    console.log('✅ Standard desktop print result:', result);
                } catch (error) {
                    console.error('❌ Standard desktop print failed:', error);
                    alert('Gagal mencetak dokumen. Silakan coba lagi.');
                }
            } else {
                console.log('🌐 Using browser print functionality');
                // Use browser print functionality
                const printWindow = window.open(previewUrl, '_blank');
                if (printWindow) {
                    printWindow.onload = () => {
                        setTimeout(() => {
                            printWindow.print();
                        }, 1000);
                    };
                    
                    // Ensure cart popup remains visible after print window operations
                    printWindow.onbeforeunload = () => {
                        setTimeout(() => {
                            setIsCartVisible(true);
                        }, 500);
                    };
                }
            }
        } else if (analysisResult.file_url) {
            console.log('📄 Using fallback file_url for printing:', analysisResult.file_url);
            
            if (finalIsDesktopApp && localFileAPI && analysisResult.file_url.startsWith('file://')) {
                // Handle local file URLs with enhanced printing
                console.log('🖨️ Using enhanced printing for local file URL...');
                try {
                    const printSettings = await localFileAPI.getPrintSettings();
                    const result = await localFileAPI.printLocalFileEnhanced({
                        filePath: analysisResult.file_url,
                        printSettings
                    });
                    
                    if (result.success) {
                        console.log('✅ Enhanced local file URL print successful');
                        if (result.message) {
                            alert(result.message);
                        }
                    } else {
                        console.warn('⚠️ Enhanced local file URL print warning:', result.failureReason);
                        if (result.failureReason) {
                            alert(result.failureReason);
                        }
                    }
                } catch (error) {
                    console.error('❌ Enhanced local file URL print failed:', error);
                    // Fallback to standard print
                    if (electronAPI?.printDocument) {
                        await electronAPI.printDocument(analysisResult.file_url);
                    }
                }
            } else if (finalIsDesktopApp && electronAPI?.printDocument) {
                // Use desktop app print functionality for fallback URL
                console.log('🖨️ Using standard desktop print with fallback URL...');
                try {
                    const result = await electronAPI.printDocument(analysisResult.file_url);
                    console.log('✅ Standard desktop print result:', result);
                } catch (error) {
                    console.error('❌ Standard desktop print failed:', error);
                    alert('Gagal mencetak dokumen. Silakan coba lagi.');
                }
            } else {
                console.log('🌐 Using browser print functionality with fallback URL');
                // Fallback to file_url from analysis result
                const printWindow = window.open(analysisResult.file_url, '_blank');
                if (printWindow) {
                    printWindow.onload = () => {
                        setTimeout(() => {
                            printWindow.print();
                        }, 1000);
                    };
                    
                    // Ensure cart popup remains visible after print window operations
                    printWindow.onbeforeunload = () => {
                        setTimeout(() => {
                            setIsCartVisible(true);
                        }, 500);
                    };
                }
            }
        } else {
            console.log('❌ No valid URL available for printing');
            console.log('- previewUrl:', previewUrl);
            console.log('- analysisResult.file_url:', analysisResult.file_url);
            
            // For DOCX files, provide alternative solution
            if (previewUrl === 'docx-pending' || previewUrl === 'docx-info') {
                console.log('📄 DOCX file detected, providing alternative solution');
                alert('File DOCX tidak dapat dicetak langsung dari aplikasi desktop. Silakan:\n\n1. Download file DOCX\n2. Buka dengan aplikasi office (WPS Office, Microsoft Word, atau LibreOffice)\n3. Print dari aplikasi tersebut\n\nAtau convert ke PDF terlebih dahulu untuk hasil terbaik.');
            } else {
                alert('Dokumen tidak tersedia untuk dicetak. Silakan upload ulang dokumen.');
            }
        }

        // Ensure cart popup is visible at the end, regardless of print operations
        // This is a final safety check to make sure cart popup appears
        setTimeout(() => {
            // Check if item was actually added to cart
            const currentCart = localStorage.getItem('printCart');
            if (currentCart) {
                const cartItems = JSON.parse(currentCart);
                if (cartItems.length > 0) {
                    setIsCartVisible(true);
                }
            }
        }, 300);
    };

    const handleCartFinish = () => {
        setIsCartVisible(false);
        setIsItemAdded(false);
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    };

    const handlePreviewDocx = async () => {
        if (!analysisResult || !fileName) return;
        
        const finalIsDesktopApp = isDesktopApp || window.electronAPI;
        const localFileAPI = window.localFileAPI;
        
        // Check if this is a DOCX file
        const fileExtension = fileName.toLowerCase().split('.').pop();
        const isDocxFile = fileExtension === 'docx';
        
        if (!isDocxFile) {
            alert('Preview hanya tersedia untuk file DOCX.');
            return;
        }
        
        if (!finalIsDesktopApp || !localFileAPI) {
            alert('Preview DOCX hanya tersedia di aplikasi desktop.');
            return;
        }
        
        setIsPreviewLoading(true);
        
        try {
            const filePath = analysisResult.file_url || previewUrl;
            if (!filePath || !filePath.startsWith('file://')) {
                throw new Error('File path tidak valid untuk preview');
            }
            
            console.log('📄 Opening DOCX preview for:', filePath);
            const result = await localFileAPI.previewDocxFile(filePath);
            
            if (result.success) {
                console.log('✅ DOCX preview opened successfully');
            } else {
                throw new Error(result.message || 'Gagal membuka preview');
            }
        } catch (error) {
            console.error('❌ DOCX preview failed:', error);
            alert('Gagal membuka preview DOCX: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsPreviewLoading(false);
        }
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
                        {/* Preview DOCX Button - only show for DOCX files in desktop app */}
                        {analysisResult && fileName && fileName.toLowerCase().endsWith('.docx') && (isDesktopApp || window.electronAPI) && (
                            <Button
                                onClick={handlePreviewDocx}
                                disabled={isPreviewLoading}
                                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                                size="sm"
                                variant="outline"
                            >
                                <Eye className="h-4 w-4" />
                                {isPreviewLoading ? 'Membuka Preview...' : 'Preview DOCX'}
                            </Button>
                        )}
                        
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
                    </div>
                </CardContent>
            </Card>

            <CartPopup isVisible={isCartVisible} onClose={() => setIsCartVisible(false)} onFinish={handleCartFinish} />
        </>
    );
};

export default PriceAnalysis;
