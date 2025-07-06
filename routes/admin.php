<?php

use App\Http\Controllers\Frontend\PrintController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('print-redirect', [PrintController::class, 'redirect'])->name('print.redirect');

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});