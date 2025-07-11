<?php

use App\Http\Controllers\DesktopAppController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Desktop App Routes
|--------------------------------------------------------------------------
|
| Routes specifically for the desktop application.
| These routes handle desktop app specific functionality like
| local PDF processing, health checks, and configuration.
|
*/

Route::prefix('desktop')->name('desktop.')->group(function () {
    
    // Public routes (no authentication required)
    Route::get('config', [DesktopAppController::class, 'config'])->name('config');
    Route::get('health', [DesktopAppController::class, 'health'])->name('health');
    Route::get('download-links', [DesktopAppController::class, 'downloadLinks'])->name('download-links');
    Route::get('system-info', [DesktopAppController::class, 'systemInfo'])->name('system-info');
    
    // Update checking
    Route::post('check-updates', [DesktopAppController::class, 'checkUpdates'])->name('check-updates');
    
    // Error reporting
    Route::post('report-error', [DesktopAppController::class, 'reportError'])->name('report-error');
    
    // Authenticated routes
    Route::middleware(['auth'])->group(function () {
        
        // Settings and preferences
        Route::get('settings', [DesktopAppController::class, 'settings'])->name('settings');
        
        // Local PDF processing
        Route::post('analyze-document-local', [DesktopAppController::class, 'analyzeDocumentLocal'])
            ->name('analyze-document-local');
        
        // Python service testing
        Route::get('test-python-service', [DesktopAppController::class, 'testPythonService'])
            ->name('test-python-service');
    });
});

// Legacy routes for backward compatibility
Route::post('analyze-document-local', [DesktopAppController::class, 'analyzeDocumentLocal'])
    ->middleware(['auth'])
    ->name('analyze-document-local');