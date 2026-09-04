<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::view('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/roles.php';
require __DIR__.'/users.php';
require __DIR__.'/sales-regions.php';
require __DIR__.'/product-categories.php';
require __DIR__.'/products.php';
