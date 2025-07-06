<?php

use App\Http\Controllers\Frontend\CalculatePriceController;
use App\Http\Controllers\Frontend\LandingController;
use App\Http\Controllers\Frontend\PrintController;
use Illuminate\Support\Facades\Route;

Route::get('', LandingController::class)->name('home');

Route::get('print/{slug?}', [PrintController::class, 'index'])->name('print');
Route::post('print-order', [PrintController::class, 'order'])->name('print.order');
Route::post('/calculate-price', CalculatePriceController::class)
    ->middleware('limit.page.access')
    ->name('calculate-price');

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
