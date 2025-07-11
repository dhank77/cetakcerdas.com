<?php

use App\Http\Controllers\Frontend\BookingController;
use App\Http\Controllers\Frontend\CalculatePriceController;
use App\Http\Controllers\Frontend\LandingController;
use App\Http\Controllers\Frontend\PrintController;
use Illuminate\Support\Facades\Route;

Route::get('', LandingController::class)->name('home');

Route::get('print/{slug?}', [PrintController::class, 'index'])->name('print');
Route::post('print-order', [PrintController::class, 'order'])->name('print.order');

Route::get('booking/{slug}', [BookingController::class, 'index'])->name('booking');
Route::post('booking/{slug}/upload', [BookingController::class, 'store'])->name('booking.store');

Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
})->name('csrf-token');

Route::post('/calculate-price', CalculatePriceController::class)
    ->middleware('limit.page.access')
    ->name('calculate-price');

// API endpoint for user settings (for desktop app)
Route::get('/api/user-settings/{slug}', [\App\Http\Controllers\SettingController::class, 'getUserSettings'])
    ->name('api.user-settings');

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/desktop.php';
