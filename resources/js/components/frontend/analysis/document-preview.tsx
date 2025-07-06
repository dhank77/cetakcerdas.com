import { Card, CardContent } from '@/components/ui/card';
import React from 'react';

interface DocumentPreviewProps {
    previewUrl: string | null;
    file: File | null;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ previewUrl, file }) => {
    return (
        <>
            {previewUrl === 'docx-pending' ? (
                <div className="flex h-96 flex-col items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="mb-4 text-6xl">📄</div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{file?.name}</h3>
                    <div className="space-y-1 text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>Ukuran: {((file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</p>
                        <p>Tipe: Microsoft Word Document</p>
                        <p className="mt-4 max-w-md">Klik "Analisis Dokumen" untuk memproses file dan melihat preview DOCX.</p>
                    </div>
                </div>
            ) : previewUrl === 'docx-info' ? (
                <div className="flex h-96 flex-col items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="mb-4 text-6xl">📄</div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{file?.name}</h3>
                    <div className="space-y-1 text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>Ukuran: {((file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</p>
                        <p>Tipe: Microsoft Word Document</p>
                        <p className="mt-4 max-w-md">
                            Preview DOCX tidak tersedia sebaiknya gunakan PDF untuk hasil maksimal. Klik "Analisis Dokumen" untuk memproses file.
                        </p>
                    </div>
                </div>
            ) : !previewUrl ? null : (
                <Card className="dark:border-gray-700 dark:bg-gray-800/50">
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
            )}
        </>
    );
};

export default DocumentPreview;
