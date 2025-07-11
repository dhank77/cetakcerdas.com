<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class DesktopAppService
{
    /**
     * Check if request is coming from desktop app
     */
    public function isDesktopApp(): bool
    {
        $userAgent = request()->header('User-Agent', '');
        return str_contains($userAgent, 'Electron') || 
               str_contains($userAgent, 'PrintManagementSystem') ||
               request()->header('X-Desktop-App') === 'true';
    }

    /**
     * Get desktop app configuration
     */
    public function getDesktopConfig(): array
    {
        return [
            'app_name' => config('app.name', 'Print Management System'),
            'version' => '1.0.0',
            'features' => [
                'local_pdf_processing' => true,
                'offline_mode' => false,
                'auto_update' => false
            ],
            'endpoints' => [
                'pdf_analysis' => '/analyze-document-local',
                'health_check' => '/api/health',
                'csrf_token' => '/csrf-token'
            ],
            'python_service' => [
                'port' => 9006,
                'health_endpoint' => 'http://127.0.0.1:9006/health'
            ]
        ];
    }

    /**
     * Validate desktop app version
     */
    public function validateVersion(string $version): bool
    {
        $minVersion = '1.0.0';
        return version_compare($version, $minVersion, '>=');
    }

    /**
     * Log desktop app activity
     */
    public function logActivity(string $action, array $data = []): void
    {
        if ($this->isDesktopApp()) {
            Log::info('Desktop App Activity', [
                'action' => $action,
                'user_agent' => request()->header('User-Agent'),
                'ip' => request()->ip(),
                'data' => $data,
                'timestamp' => now()
            ]);
        }
    }

    /**
     * Check if local Python service is available
     */
    public function checkLocalPythonService(): array
    {
        try {
            $response = Http::timeout(5)->get('http://127.0.0.1:9006/health');
            
            if ($response->successful()) {
                return [
                    'available' => true,
                    'status' => 'healthy',
                    'response_time' => $response->transferStats?->getTransferTime() ?? 0,
                    'data' => $response->json()
                ];
            }
            
            return [
                'available' => false,
                'status' => 'unhealthy',
                'error' => 'Service returned status: ' . $response->status()
            ];
            
        } catch (Exception $e) {
            return [
                'available' => false,
                'status' => 'unavailable',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get recommended settings for desktop app
     */
    public function getRecommendedSettings(): array
    {
        return [
            'pdf_processing' => [
                'mode' => 'local', // Use local Python service
                'fallback' => 'online', // Fallback to server if local fails
                'timeout' => 30,
                'max_file_size' => '50MB'
            ],
            'ui' => [
                'theme' => 'system', // Follow system theme
                'zoom_level' => 1.0,
                'window_state' => 'maximized'
            ],
            'performance' => [
                'cache_enabled' => true,
                'preload_assets' => true,
                'lazy_loading' => true
            ],
            'security' => [
                'auto_logout' => 30, // minutes
                'remember_login' => true,
                'secure_storage' => true
            ]
        ];
    }

    /**
     * Handle desktop app specific errors
     */
    public function handleDesktopError(Exception $e, string $context = ''): array
    {
        $errorData = [
            'error' => true,
            'message' => $e->getMessage(),
            'context' => $context,
            'timestamp' => now(),
            'desktop_app' => true
        ];

        // Log error for desktop app debugging
        Log::error('Desktop App Error', [
            'exception' => $e,
            'context' => $context,
            'user_agent' => request()->header('User-Agent'),
            'ip' => request()->ip()
        ]);

        // Return user-friendly error for desktop app
        return [
            'success' => false,
            'error' => [
                'type' => 'desktop_app_error',
                'message' => 'Terjadi kesalahan pada aplikasi desktop',
                'details' => config('app.debug') ? $e->getMessage() : 'Silakan coba lagi atau hubungi support',
                'code' => $e->getCode(),
                'suggestions' => $this->getErrorSuggestions($e)
            ]
        ];
    }

    /**
     * Get error suggestions for common desktop app issues
     */
    private function getErrorSuggestions(Exception $e): array
    {
        $message = strtolower($e->getMessage());
        $suggestions = [];

        if (str_contains($message, 'connection') || str_contains($message, 'network')) {
            $suggestions[] = 'Periksa koneksi internet Anda';
            $suggestions[] = 'Pastikan server dapat diakses';
        }

        if (str_contains($message, 'python') || str_contains($message, 'pdf')) {
            $suggestions[] = 'Restart aplikasi desktop';
            $suggestions[] = 'Periksa apakah file PDF tidak corrupt';
        }

        if (str_contains($message, 'timeout')) {
            $suggestions[] = 'Coba dengan file yang lebih kecil';
            $suggestions[] = 'Periksa koneksi internet';
        }

        if (empty($suggestions)) {
            $suggestions[] = 'Restart aplikasi desktop';
            $suggestions[] = 'Hubungi administrator jika masalah berlanjut';
        }

        return $suggestions;
    }

    /**
     * Generate desktop app download link
     */
    public function getDownloadLink(string $platform = 'windows'): ?string
    {
        $downloads = [
            'windows' => config('desktop.download_urls.windows'),
            'mac' => config('desktop.download_urls.mac'),
            'linux' => config('desktop.download_urls.linux')
        ];

        return $downloads[$platform] ?? null;
    }

    /**
     * Check for desktop app updates
     */
    public function checkForUpdates(string $currentVersion): array
    {
        // This would typically check against a remote update server
        $latestVersion = '1.0.0'; // This should come from your update server
        
        $hasUpdate = version_compare($currentVersion, $latestVersion, '<');
        
        return [
            'has_update' => $hasUpdate,
            'current_version' => $currentVersion,
            'latest_version' => $latestVersion,
            'download_url' => $hasUpdate ? $this->getDownloadLink() : null,
            'release_notes' => $hasUpdate ? $this->getReleaseNotes($latestVersion) : null,
            'mandatory' => false // Set to true for critical updates
        ];
    }

    /**
     * Get release notes for a version
     */
    private function getReleaseNotes(string $version): array
    {
        // This would typically come from your release management system
        return [
            'version' => $version,
            'date' => now()->format('Y-m-d'),
            'features' => [
                'Improved PDF processing performance',
                'Bug fixes and stability improvements'
            ],
            'fixes' => [
                'Fixed memory leak in PDF analyzer',
                'Resolved connection timeout issues'
            ]
        ];
    }
}