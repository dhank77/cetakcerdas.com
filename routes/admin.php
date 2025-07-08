<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Frontend\PrintController;
use App\Http\Controllers\HelpController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\BookingManagementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('print-redirect', [PrintController::class, 'redirect'])->name('print.redirect');
    
    Route::prefix('setting')->name('setting.')->group(function () {
        Route::get('', [SettingController::class, 'index'])->name('index');
        Route::put('', [SettingController::class, 'update'])->name('update');
        Route::post('', [SettingController::class, 'store'])->name('store');
    });

    Route::get('help', HelpController::class)->name('help');
    
    Route::get('bookings', [BookingManagementController::class, 'index'])->name('bookings.index');
});