/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnalysisResult } from '@/types/analysis';
import { FolderOpen, FileText, Printer, Trash2, RefreshCw, Clock, CheckCircle, Eye } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface LocalFile {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  lastModified: number;
  analysisResult?: AnalysisResult;
  analyzedAt?: number;
  fileHash?: string;
}

interface LocalFileBrowserProps {
  onClose?: () => void;
}

// Define API response types
interface AnalysisResponse extends AnalysisResult {
  success?: boolean;
  error?: string;
}

// Extend window interface for desktop APIs
declare global {
  interface Window {
    localFileAPI?: {
      browseFiles: () => Promise<{ canceled: boolean; filePaths: string[] }>;
      getAnalysisHistory: () => Promise<LocalFile[]>;
      getFileInfo: (filePath: string) => Promise<{ size: number; lastModified: number; exists: boolean }>;
      analyzeLocalFile: (fileData: { filePath: string; fileName: string }) => Promise<AnalysisResponse>;
      saveAnalysisResult: (fileData: LocalFile) => Promise<{ success: boolean; id: string }>;
      printLocalFileEnhanced: (options: { filePath: string; printSettings: any }) => Promise<{ success: boolean; failureReason?: string; message?: string }>;
      getPrintSettings: () => Promise<any>;
      clearAnalysisCache: () => Promise<{ success: boolean }>;
    };
  }
}

const LocalFileBrowser: React.FC<LocalFileBrowserProps> = () => {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<LocalFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  // Reset preview when selected file changes
  useEffect(() => {
    setPreviewUrl(null);
  }, [selectedFile]);

  const loadAnalysisHistory = async () => {
    setIsLoading(true);
    try {
      if (window.localFileAPI) {
        const history = await window.localFileAPI.getAnalysisHistory();
        setFiles(history || []);
      }
    } catch (error) {
      console.error('Error loading analysis history:', error);
      setError('Failed to load analysis history');
    } finally {
      setIsLoading(false);
    }
  };

  const browseFiles = async () => {
    try {
      if (window.localFileAPI) {
        const result = await window.localFileAPI.browseFiles();
        if (!result.canceled && result.filePaths.length > 0) {
          // Process selected files
          const newFiles: LocalFile[] = [];
          
          for (const filePath of result.filePaths) {
            const fileName = filePath.split(/[/\\]/).pop() || 'Unknown';
            const fileInfo = await window.localFileAPI.getFileInfo(filePath);
            
            const newFile: LocalFile = {
              id: Date.now().toString() + Math.random(),
              filePath,
              fileName,
              fileSize: fileInfo.size || 0,
              lastModified: fileInfo.lastModified || Date.now()
            };
            
            newFiles.push(newFile);
          }
          
          setFiles(prev => [...newFiles, ...prev]);
          if (newFiles.length === 1) {
            setSelectedFile(newFiles[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error browsing files:', error);
      setError('Failed to browse files');
    }
  };

  const analyzeFile = async (file: LocalFile) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      if (window.localFileAPI) {
        const analysisResult = await window.localFileAPI.analyzeLocalFile({
          filePath: file.filePath,
          fileName: file.fileName
        });
        
        if ('success' in analysisResult && analysisResult.success === false) {
          throw new Error('error' in analysisResult ? analysisResult.error : 'Analysis failed');
        }
        
        const updatedFile = {
          ...file,
          analysisResult,
          analyzedAt: Date.now()
        };
        
        // Save to cache
        await window.localFileAPI.saveAnalysisResult(updatedFile);
        
        // Update local state
        setFiles(prev => prev.map(f => f.id === file.id ? updatedFile : f));
        setSelectedFile(updatedFile);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const previewFile = async (file: LocalFile) => {
    try {
      if (window.localFileAPI) {
        // Create a preview URL for the file
        const fileUrl = `file://${file.filePath}`;
        setPreviewUrl(fileUrl);
      } else {
        setError('Desktop API not available');
      }
    } catch (error) {
      console.error('Preview failed:', error);
      setError('Failed to preview file');
    }
  };

  const printFile = async (file: LocalFile) => {
    if (!file.analysisResult) {
      setError('File must be analyzed before printing');
      return;
    }

    setIsPrinting(true);
    setError(null);
    
    try {
      if (window.localFileAPI) {
        const printSettings = await window.localFileAPI.getPrintSettings();
        const result = await window.localFileAPI.printLocalFileEnhanced({
          filePath: file.filePath,
          printSettings
        });
        
        if (result.success) {
          // Check if it's a DOCX file that was opened with system app
          if (result.message && file.fileName.toLowerCase().endsWith('.docx')) {
            alert('File DOCX berhasil dibuka dengan aplikasi default sistem. Silakan cetak dari aplikasi yang terbuka (misalnya WPS Office, Microsoft Word, atau LibreOffice).');
          }
        } else {
          throw new Error(result.failureReason || 'Print failed');
        }
      }
    } catch (error) {
      console.error('Print failed:', error);
      setError(error instanceof Error ? error.message : 'Print failed');
    } finally {
      setIsPrinting(false);
    }
  };

  const addToCart = async (file: LocalFile) => {
    if (!file.analysisResult) return;

    const cartItem = {
      id: Date.now().toString(),
      fileName: file.fileName,
      totalPrice: file.analysisResult.total_price || 0,
      totalPages: file.analysisResult.total_pages || 0,
      bwPages: file.analysisResult.bw_pages || 0,
      colorPages: file.analysisResult.color_pages || 0,
      photoPages: file.analysisResult.photo_pages || 0,
      priceBw: file.analysisResult.price_bw || 0,
      priceColor: file.analysisResult.price_color || 0,
      pricePhoto: file.analysisResult.price_photo || 0,
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
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const clearCache = async () => {
    try {
      if (window.localFileAPI) {
        await window.localFileAPI.clearAnalysisCache();
        setFiles([]);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      setError('Failed to clear cache');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('id-ID');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* File List Panel */}
      <div className="w-1/3 border-r bg-white dark:bg-gray-800 p-4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Local Files</h2>
          <div className="flex gap-2">
            <Button onClick={browseFiles} size="sm" variant="outline">
              <FolderOpen className="h-4 w-4 mr-1" />
              Browse
            </Button>
            <Button onClick={loadAnalysisHistory} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertDescription className="text-red-800 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No files found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Click Browse to select files</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {files.map(file => (
              <Card 
                key={file.id}
                className={`cursor-pointer transition-colors ${
                  selectedFile?.id === file.id 
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedFile(file)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-gray-900 dark:text-white">
                        {file.fileName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.fileSize)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {file.analysisResult ? (
                          <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Analyzed
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            Not analyzed
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button onClick={clearCache} size="sm" variant="outline" className="w-full">
              Clear All Cache
            </Button>
          </div>
        )}
      </div>

      {/* Analysis Panel */}
      <div className="flex-1 p-4">
        {selectedFile ? (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedFile.fileName}
              </CardTitle>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <div>Size: {formatFileSize(selectedFile.fileSize)}</div>
                <div>Modified: {formatDate(selectedFile.lastModified)}</div>
                {selectedFile.analyzedAt && (
                  <div>Analyzed: {formatDate(selectedFile.analyzedAt)}</div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedFile.analysisResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                        {selectedFile.analysisResult.bw_pages}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">B&W Pages</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Rp {selectedFile.analysisResult.price_bw?.toLocaleString('id-ID') || '0'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedFile.analysisResult.color_pages}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Color Pages</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Rp {selectedFile.analysisResult.price_color?.toLocaleString('id-ID') || '0'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedFile.analysisResult.photo_pages}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Photo Pages</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Rp {selectedFile.analysisResult.price_photo?.toLocaleString('id-ID') || '0'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      Rp {selectedFile.analysisResult.total_price?.toLocaleString('id-ID') || '0'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Print Cost ({selectedFile.analysisResult.total_pages} pages)
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => previewFile(selectedFile)} 
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      onClick={() => printFile(selectedFile)} 
                      className="flex-1"
                      disabled={isPrinting}
                    >
                      {isPrinting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Printing...
                        </>
                      ) : (
                        <>
                          <Printer className="h-4 w-4 mr-2" />
                          Print Document
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => addToCart(selectedFile)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                  
                  {/* Preview Section */}
                  {previewUrl && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">File Preview</h4>
                      <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                        {selectedFile.fileName.toLowerCase().endsWith('.pdf') ? (
                          <iframe 
                            src={previewUrl} 
                            className="w-full h-96" 
                            title="Document Preview"
                            onError={() => {
                              setError('Cannot preview this file type');
                              setPreviewUrl(null);
                            }}
                          />
                        ) : selectedFile.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                          <img 
                            src={previewUrl} 
                            alt="Image Preview" 
                            className="w-full h-96 object-contain"
                            onError={() => {
                              setError('Cannot preview this image');
                              setPreviewUrl(null);
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                              <FileText className="h-12 w-12 mx-auto mb-2" />
                              <p>Preview tidak tersedia untuk tipe file ini</p>
                              <p className="text-sm">Gunakan aplikasi default sistem untuk membuka file</p>
                              <Button 
                                onClick={() => setPreviewUrl(null)} 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
                              >
                                Tutup Preview
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      {(selectedFile.fileName.toLowerCase().endsWith('.pdf') || selectedFile.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) && (
                        <div className="mt-2 flex justify-end">
                          <Button 
                            onClick={() => setPreviewUrl(null)} 
                            variant="outline" 
                            size="sm"
                          >
                            Tutup Preview
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">File not analyzed yet</p>
                  </div>
                  <Button 
                    onClick={() => analyzeFile(selectedFile)}
                    disabled={isAnalyzing}
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Document'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">Select a file to view analysis</p>
              <p className="text-gray-400 dark:text-gray-500">Choose a file from the left panel or browse for new files</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalFileBrowser;