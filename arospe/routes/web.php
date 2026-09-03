<?php

use App\Livewire\Dev\MediaGalleryHarness;
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

// TEMPORARY SCAFFOLDING for story 0020's own browser tests (D16), EXTENDED
// by story 0021 (D13/OQ-1, Option A) to also host a WysiwygEditor instance
// for its own browser tests. NOT app surface -- delete this whole block,
// together with App\Livewire\Dev\MediaGalleryHarness and its view, when
// story 0027 (product editor) provides a real host page for both
// App\Livewire\Media\Gallery and App\Livewire\Components\WysiwygEditor.
// The environment check is the security control and it is a
// REGISTRATION-time gate, not a middleware check: the route does not exist
// at all outside testing/local, rather than existing and refusing a
// request. `auth` + `verified` are kept anyway as defense in depth behind
// the gate, not instead of it, in case this ever ran in a misconfigured
// environment.
if (app()->environment('testing', 'local')) {
    Route::livewire('dev/media-gallery-harness', MediaGalleryHarness::class)
        ->middleware(['auth', 'verified'])
        ->name('dev.media-gallery-harness');
}
