<?php

use App\Http\Controllers\BillingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Frontend\PrintController;
use App\Http\Controllers\HelpController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\BookingManagementController;
use App\Http\Controllers\PremiumController;
use App\Http\Controllers\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('print-redirect', [PrintController::class, 'redirect'])->name('print.redirect');
    
    Route::prefix('setting')->name('setting.')->group(function () {
        Route::get('', [SettingController::class, 'index'])->name('index');
        Route::post('', [SettingController::class, 'action'])->name('action');
    });

    Route::get('help', HelpController::class)->name('help');
    Route::get('premium', PremiumController::class)->name('premium');
    
    Route::get('bookings', [BookingManagementController::class, 'index'])->name('bookings.index');
    
    // History routes
    Route::get('history', [HistoryController::class, 'index'])->name('history.index');
    
    // Member routes
    Route::prefix('members')
        ->name('members.')
        ->middleware('premium')
        ->group(function () {
            Route::get('', [MemberController::class, 'index'])->name('index');
            Route::get('{id}', [MemberController::class, 'show'])->name('show');
        });
    
    // Report routes
    Route::prefix('reports')
        ->name('reports.')
        ->middleware('premium')
        ->group(function () {
            Route::get('', [ReportController::class, 'index'])->name('index');
            Route::get('sales', [ReportController::class, 'sales'])->name('sales');
        }); 
    
    // Billing routes
    Route::get('billing', [BillingController::class, 'index'])->name('billing.index');
    
    // Testimonial routes
    Route::prefix('testimonials')->name('testimonials.')->group(function () {
        Route::get('', [TestimonialController::class, 'index'])->name('index');
        Route::get('{id}', [TestimonialController::class, 'show'])->name('show');
        Route::patch('{id}/status', [TestimonialController::class, 'updateStatus'])->name('updateStatus');
    });
});
