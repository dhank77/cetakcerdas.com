<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Frontend\PrintController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('print-redirect', [PrintController::class, 'redirect'])->name('print.redirect');
    
    Route::get('setting', [SettingController::class, 'index'])->name('setting');
    Route::put('setting', [SettingController::class, 'update'])->name('setting.update');
    Route::post('setting', [SettingController::class, 'store'])->name('setting.store');
});