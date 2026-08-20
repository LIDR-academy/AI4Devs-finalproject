<?php

use App\Livewire\Users\Index as UsersIndex;
use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::view('dashboard', 'dashboard')->name('dashboard');

    // `can:users.view`, not Spatie's `permission:` — Livewire 4's
    // PersistentMiddleware allowlist does not carry `permission:`, so every
    // /livewire/update round-trip (save(), deleteUser(), ...) would run
    // unauthorized. `can:` works because Spatie registers permissions as
    // Gate abilities. See docs/architecture/authorization.md.
    Route::livewire('users', UsersIndex::class)
        ->middleware(['can:users.view'])
        ->name('users.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/roles.php';
