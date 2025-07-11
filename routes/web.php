<?php

use App\Http\Controllers\Frontend\BookingController;
use App\Http\Controllers\Frontend\CalculatePriceController;
use App\Http\Controllers\Frontend\LandingController;
use App\Http\Controllers\Frontend\PrintController;
use App\Services\DocumentAnalyzerService;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('', LandingController::class)->name('home');

Route::get('print/{slug?}', [PrintController::class, 'index'])->name('print');
Route::post('print-order', [PrintController::class, 'order'])->name('print.order');

Route::get('booking/{slug}', [BookingController::class, 'index'])->name('booking');
Route::post('booking/{slug}/upload', [BookingController::class, 'store'])->name('booking.store');

// CSRF token endpoint
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
})->name('csrf-token');

// Document analysis endpoint (untuk intercept desktop app)
Route::post('/analyze-document-internal', function (Request $request) {
    $request->validate([
        'file' => 'required|file|mimes:pdf,docx,doc|max:2048',
        'color_threshold' => 'numeric|min:0|max:100',
        'photo_threshold' => 'numeric|min:0|max:100',
    ]);

    $analyzerService = app(DocumentAnalyzerService::class);
    
    $result = $analyzerService->analyzeDocument(
        $request->file('file'),
        $request->input('color_threshold', 20),
        $request->input('photo_threshold', 30)
    );
    
    return response()->json($result);
})->name('analyze-document-internal');

Route::post('/calculate-price', CalculatePriceController::class)
    ->middleware('limit.page.access')
    ->name('calculate-price');

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/desktop.php';
