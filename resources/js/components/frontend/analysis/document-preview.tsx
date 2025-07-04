import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

interface DocumentPreviewProps {
    previewUrl: string | null;
    file: File | null;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ previewUrl, file }) => {
    const handlePrint = () => {
        if (!previewUrl) return;
        
        if (file?.type === 'application/pdf') {
            const printWindow = window.open(previewUrl, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        } else {
            window.open(previewUrl, '_blank');
        }
    };

    const handleOpenInNewTab = () => {
        if (previewUrl) {
            window.open(previewUrl, '_blank');
        }
    };

    if (!previewUrl) {
        return null;
    }

    return (
        <Card className="dark:border-gray-700 dark:bg-gray-800/50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 dark:text-white">📖 Pratinjau Dokumen</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            🖨️ Cetak
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                            🔍 Buka di Tab Baru
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-lg border dark:border-gray-600">
                    <iframe src={previewUrl} className="h-[500px] w-full" title="Document Preview" allow="print" />
                </div>
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <p className="flex items-center gap-2">
                        <span>💡</span>
                        {file?.type === 'application/pdf'
                            ? 'Dokumen PDF dapat dicetak langsung dari pratinjau ini'
                            : 'Dokumen Word ditampilkan menggunakan Office Online. Klik "Cetak" atau "Buka di Tab Baru" untuk opsi cetak yang lebih baik'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default DocumentPreview;