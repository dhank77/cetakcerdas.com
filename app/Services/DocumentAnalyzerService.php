<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Http\UploadedFile;

class DocumentAnalyzerService
{
    private string $mode;
    private string $fastapiUrl;
    private string $executablePath;
    private bool $autoFallback;

    public function __construct()
    {
        $this->mode = config('fastapi.mode', 'online'); // 'online' atau 'local'
        $this->fastapiUrl = config('fastapi.url', 'http://localhost:9006');
        $this->executablePath = config('fastapi.executable_path', base_path('fastapi/pdf_analyzer/pdf_analyzer'));
        $this->autoFallback = config('fastapi.auto_fallback', true);
    }

    /**
     * Analyze document menggunakan mode yang dipilih
     */
    public function analyzeDocument(
        UploadedFile $file,
        float $colorThreshold = 10.0,
        float $photoThreshold = 30.0
    ): array {
        $originalMode = $this->mode;
        
        try {
            if ($this->mode === 'local') {
                return $this->analyzeDocumentLocal($file, $colorThreshold, $photoThreshold);
            } else {
                return $this->analyzeDocumentOnline($file, $colorThreshold, $photoThreshold);
            }
        } catch (Exception $e) {
            Log::error('Document Analysis Error', [
                'mode' => $this->mode,
                'message' => $e->getMessage(),
                'file_name' => $file->getClientOriginalName(),
                'auto_fallback' => $this->autoFallback
            ]);

            // Auto fallback ke mode lain jika diaktifkan
            if ($this->autoFallback) {
                return $this->tryFallbackMode($file, $colorThreshold, $photoThreshold, $originalMode, $e);
            }

            // Jika tidak ada fallback, return hasil default
            return $this->getFallbackResult();
        }
    }

    /**
     * Coba mode fallback jika mode utama gagal
     */
    private function tryFallbackMode(
        UploadedFile $file,
        float $colorThreshold,
        float $photoThreshold,
        string $originalMode,
        Exception $originalException
    ): array {
        $fallbackMode = $originalMode === 'local' ? 'online' : 'local';
        
        Log::info('Attempting fallback mode', [
            'original_mode' => $originalMode,
            'fallback_mode' => $fallbackMode,
            'file_name' => $file->getClientOriginalName()
        ]);

        try {
            // Temporarily switch mode
            $this->mode = $fallbackMode;
            
            if ($fallbackMode === 'local') {
                $result = $this->analyzeDocumentLocal($file, $colorThreshold, $photoThreshold);
            } else {
                $result = $this->analyzeDocumentOnline($file, $colorThreshold, $photoThreshold);
            }
            
            // Add fallback info to result
            $result['fallback_used'] = true;
            $result['original_mode'] = $originalMode;
            $result['fallback_mode'] = $fallbackMode;
            
            Log::info('Fallback mode successful', [
                'original_mode' => $originalMode,
                'fallback_mode' => $fallbackMode,
                'file_name' => $file->getClientOriginalName()
            ]);
            
            return $result;
            
        } catch (Exception $fallbackException) {
            // Restore original mode
            $this->mode = $originalMode;
            
            Log::error('Fallback mode also failed', [
                'original_mode' => $originalMode,
                'fallback_mode' => $fallbackMode,
                'original_error' => $originalException->getMessage(),
                'fallback_error' => $fallbackException->getMessage(),
                'file_name' => $file->getClientOriginalName()
            ]);

            // Return fallback result with error info
            $result = $this->getFallbackResult();
            $result['fallback_attempted'] = true;
            $result['original_error'] = $originalException->getMessage();
            $result['fallback_error'] = $fallbackException->getMessage();
            
            return $result;
        }
    }

    /**
     * Analyze document menggunakan executable lokal
     */
    private function analyzeDocumentLocal(
        UploadedFile $file,
        float $colorThreshold,
        float $photoThreshold
    ): array {
        // Simpan file sementara
        $tempPath = $this->saveTempFile($file);

        try {
            // Jalankan executable dengan mode CLI
            $command = [
                $this->executablePath,
                '--mode', 'cli',
                '--file', $tempPath,
                '--color-threshold', (string)$colorThreshold,
                '--photo-threshold', (string)$photoThreshold,
                '--output', 'json'
            ];

            $result = Process::run(implode(' ', array_map('escapeshellarg', $command)));

            if (!$result->successful()) {
                throw new Exception('Executable failed: ' . $result->errorOutput());
            }

            $output = json_decode($result->output(), true);

            if (!$output) {
                throw new Exception('Invalid JSON output from executable');
            }

            return $output;

        } finally {
            // Hapus file sementara
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }
        }
    }

    /**
     * Analyze document menggunakan FastAPI online
     */
    private function analyzeDocumentOnline(
        UploadedFile $file,
        float $colorThreshold,
        float $photoThreshold
    ): array {
        $response = Http::timeout(30)
            ->asMultipart()
            ->post("{$this->fastapiUrl}/analyze-document?color_threshold={$colorThreshold}&photo_threshold={$photoThreshold}", [
                [
                    'name' => 'file',
                    'contents' => file_get_contents($file),
                    'filename' => $file->getClientOriginalName(),
                ],
            ]);

        if (!$response->successful()) {
            throw new Exception('FastAPI Error: ' . $response->status() . ' - ' . $response->body());
        }

        $result = $response->json();

        if (!isset($result['color_pages']) || !isset($result['bw_pages']) || !isset($result['photo_pages'])) {
            throw new Exception('Invalid response format from FastAPI');
        }

        return $result;
    }

    /**
     * Simpan file sementara untuk executable
     */
    private function saveTempFile(UploadedFile $file): string
    {
        $tempDir = sys_get_temp_dir();
        $tempPath = $tempDir . DIRECTORY_SEPARATOR . 'pdf_analyzer_' . uniqid() . '.' . $file->getClientOriginalExtension();
        
        file_put_contents($tempPath, file_get_contents($file));
        
        return $tempPath;
    }

    /**
     * Hasil fallback jika analisis gagal
     */
    private function getFallbackResult(): array
    {
        return [
            'total_pages' => 0,
            'color_pages' => 0,
            'bw_pages' => 0,
            'photo_pages' => 0,
            'page_details' => [],
            'pengaturan' => [
                'threshold_warna' => '10%',
                'threshold_foto' => '30%'
            ],
            'fallback' => true
        ];
    }

    /**
     * Check apakah service tersedia
     */
    public function isAvailable(): bool
    {
        try {
            if ($this->mode === 'local') {
                return $this->isExecutableAvailable();
            } else {
                return $this->isOnlineServiceAvailable();
            }
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Check apakah executable tersedia
     */
    private function isExecutableAvailable(): bool
    {
        if (!file_exists($this->executablePath)) {
            return false;
        }

        // Test run executable
        $result = Process::run(escapeshellarg($this->executablePath) . ' --mode cli --help');
        return $result->successful();
    }

    /**
     * Check apakah online service tersedia
     */
    private function isOnlineServiceAvailable(): bool
    {
        try {
            $response = Http::timeout(5)->get("{$this->fastapiUrl}/health");
            return $response->successful();
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Get current mode
     */
    public function getMode(): string
    {
        return $this->mode;
    }

    /**
     * Switch mode
     */
    public function setMode(string $mode): void
    {
        if (!in_array($mode, ['local', 'online'])) {
            throw new Exception('Invalid mode. Use "local" or "online"');
        }
        
        $this->mode = $mode;
    }
}