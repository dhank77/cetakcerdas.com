<?php

namespace App\Http\Controllers;

use App\Services\DesktopAppService;
use App\Services\DocumentAnalyzerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class DesktopAppController extends Controller
{
    private DesktopAppService $desktopAppService;
    private DocumentAnalyzerService $documentAnalyzerService;

    public function __construct(
        DesktopAppService $desktopAppService,
        DocumentAnalyzerService $documentAnalyzerService
    ) {
        $this->desktopAppService = $desktopAppService;
        $this->documentAnalyzerService = $documentAnalyzerService;
    }

    /**
     * Get desktop app configuration
     */
    public function config(): JsonResponse
    {
        $this->desktopAppService->logActivity('config_requested');

        return response()->json([
            'success' => true,
            'data' => $this->desktopAppService->getDesktopConfig()
        ]);
    }

    /**
     * Health check endpoint for desktop app
     */
    public function health(): JsonResponse
    {
        $pythonServiceStatus = $this->desktopAppService->checkLocalPythonService();
        
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now(),
            'services' => [
                'laravel' => [
                    'status' => 'healthy',
                    'version' => app()->version()
                ],
                'python_local' => $pythonServiceStatus,
                'database' => [
                    'status' => 'healthy' // You might want to add actual DB check
                ]
            ],
            'desktop_app' => [
                'detected' => $this->desktopAppService->isDesktopApp(),
                'user_agent' => request()->header('User-Agent')
            ]
        ]);
    }

    /**
     * Check for desktop app updates
     */
    public function checkUpdates(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'version' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $currentVersion = $request->input('version');
        
        if (!$this->desktopAppService->validateVersion($currentVersion)) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid version format'
            ], 400);
        }

        $updateInfo = $this->desktopAppService->checkForUpdates($currentVersion);
        
        $this->desktopAppService->logActivity('update_check', [
            'current_version' => $currentVersion,
            'has_update' => $updateInfo['has_update']
        ]);

        return response()->json([
            'success' => true,
            'data' => $updateInfo
        ]);
    }

    /**
     * Get recommended settings for desktop app
     */
    public function settings(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->desktopAppService->getRecommendedSettings()
        ]);
    }

    /**
     * Analyze document using local Python service
     * This endpoint is specifically for desktop app to use local processing
     */
    public function analyzeDocumentLocal(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf|max:51200', // 50MB max
            'color_threshold' => 'nullable|numeric|min:0|max:100',
            'photo_threshold' => 'nullable|numeric|min:0|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $file = $request->file('file');
            $colorThreshold = $request->input('color_threshold', 10.0);
            $photoThreshold = $request->input('photo_threshold', 30.0);

            // Force local mode for desktop app
            $this->documentAnalyzerService->setMode('local');
            
            $result = $this->documentAnalyzerService->analyzeDocument(
                $file,
                (float) $colorThreshold,
                (float) $photoThreshold
            );

            $this->desktopAppService->logActivity('document_analyzed_local', [
                'filename' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'pages' => $result['total_pages'] ?? 0
            ]);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json(
                $this->desktopAppService->handleDesktopError($e, 'document_analysis'),
                500
            );
        }
    }

    /**
     * Test local Python service connectivity
     */
    public function testPythonService(): JsonResponse
    {
        $status = $this->desktopAppService->checkLocalPythonService();
        
        $this->desktopAppService->logActivity('python_service_test', $status);

        return response()->json([
            'success' => true,
            'data' => $status
        ]);
    }

    /**
     * Get download links for desktop app
     */
    public function downloadLinks(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'windows' => $this->desktopAppService->getDownloadLink('windows'),
                'mac' => $this->desktopAppService->getDownloadLink('mac'),
                'linux' => $this->desktopAppService->getDownloadLink('linux')
            ]
        ]);
    }

    /**
     * Report desktop app error for debugging
     */
    public function reportError(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'error_type' => 'required|string',
            'error_message' => 'required|string',
            'stack_trace' => 'nullable|string',
            'user_actions' => 'nullable|string',
            'app_version' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $errorData = $request->only([
            'error_type',
            'error_message', 
            'stack_trace',
            'user_actions',
            'app_version'
        ]);

        $this->desktopAppService->logActivity('error_reported', $errorData);

        return response()->json([
            'success' => true,
            'message' => 'Error report received. Thank you for helping us improve the app.'
        ]);
    }

    /**
     * Get system information for desktop app debugging
     */
    public function systemInfo(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'server' => [
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                    'timezone' => config('app.timezone'),
                    'environment' => app()->environment()
                ],
                'features' => [
                    'pdf_analysis' => [
                        'local_mode' => $this->documentAnalyzerService->getMode() === 'local',
                        'fallback_enabled' => config('fastapi.auto_fallback', true)
                    ]
                ],
                'limits' => [
                    'max_file_size' => '50MB',
                    'supported_formats' => ['pdf'],
                    'max_pages' => 1000
                ]
            ]
        ]);
    }
}