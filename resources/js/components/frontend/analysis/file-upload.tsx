import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useCallback } from 'react';

interface FileUploadProps {
    file: File | null;
    isDragging: boolean;
    isAnalyzing: boolean;
    error: string | null;
    onFileSelect: (file: File) => void;
    onAnalyze: () => void;
    onReset: () => void;
    onDragStateChange: (isDragging: boolean) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
    file,
    isDragging,
    isAnalyzing,
    error,
    onFileSelect,
    onAnalyze,
    onReset,
    onDragStateChange,
}) => {
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        onDragStateChange(true);
    }, [onDragStateChange]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        onDragStateChange(false);
    }, [onDragStateChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        onDragStateChange(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (
                droppedFile.type === 'application/pdf' ||
                droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                droppedFile.name.toLowerCase().endsWith('.docx')
            ) {
                onFileSelect(droppedFile);
            }
        }
    }, [onFileSelect, onDragStateChange]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    };

    return (
        <Card className="lg:col-span-2 dark:border-gray-700 dark:bg-gray-800/50">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">📁 Unggah Dokumen</CardTitle>
                <CardDescription className="dark:text-gray-400">Seret dan lepas dokumen PDF atau Word Anda di sini</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className={`rounded-lg border-2 border-dashed p-4 text-center transition-all duration-300 ${
                        isDragging
                            ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {file ? (
                        <div className="space-y-2">
                            <div className="text-3xl">📄</div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <div className="flex justify-center gap-2">
                                <Button onClick={onAnalyze} disabled={isAnalyzing}>
                                    {isAnalyzing ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                            Menganalisis...
                                        </>
                                    ) : (
                                        <>🔍 Hitung Harga</>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={onReset}>
                                    🗑️ Hapus
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 py-2">
                            <div className="text-4xl text-gray-400 dark:text-gray-600">📁</div>
                            <div>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">Letakkan dokumen Anda di sini</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Mendukung dokumen PDF dan Word (.pdf, .docx)
                                </p>
                                <input
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload">
                                    <Button asChild variant="outline">
                                        <span className="cursor-pointer">Pilih File</span>
                                    </Button>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <Alert className="mt-3 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <div className="text-red-800 dark:text-red-400">
                            <strong>Kesalahan:</strong> {error}
                        </div>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default FileUpload;