<?php

use App\Http\Controllers\Frontend\BookingController;
use App\Http\Controllers\Frontend\CalculatePriceController;
use App\Http\Controllers\Frontend\DesktopAppController;
use App\Http\Controllers\Frontend\LandingController;
use App\Http\Controllers\Frontend\PrintController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

Route::get('', LandingController::class)->name('home');

Route::get('print/{slug?}', [PrintController::class, 'index'])->name('print');
Route::post('print-order', [PrintController::class, 'order'])->name('print.order');

Route::get('protected-print', [PrintController::class, 'protected'])->name('print.protected');
Route::post('protected-print', [PrintController::class, 'protectedAccess'])->name('print.protected.access');
Route::get('protected-print-validated', [PrintController::class, 'protectedValidated'])->name('print.protected.validated');

Route::get('booking/{slug}', [BookingController::class, 'index'])->name('booking');
Route::post('booking/{slug}/upload', [BookingController::class, 'store'])->name('booking.store');

Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
})->name('csrf-token');

Route::post('/calculate-price', CalculatePriceController::class)
    ->middleware('limit.page.access')
    ->name('calculate-price');

// API endpoint for user settings (for desktop app)
Route::get('/api/user-settings/{slug}', [SettingController::class, 'getUserSettings'])
    ->name('api.user-settings');

// Desktop app download page
Route::get('/desktop-app', [DesktopAppController::class, 'download'])->name('desktop.download');

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/desktop.php';
