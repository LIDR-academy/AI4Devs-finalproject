<?php

use App\Livewire\Shipping\Zones;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // `can:shipping.view`, not Spatie's `permission:` -- same reason as every other
    // gated route in this app: Livewire 4's PersistentMiddleware allowlist carries
    // Laravel's Authorize (`can:`) but not Spatie's PermissionMiddleware, so a
    // `permission:`-gated route would protect the initial GET only, leaving every
    // save()/deleteZone() /livewire/update round-trip unauthorized. See
    // docs/architecture/authorization.md.
    //
    // Story 0034 (D-1): its own route rather than a tab inside a future `/shipping`
    // screen (story 0035) -- see this route's own docs/api/routes.md entry.
    Route::livewire('shipping/zones', Zones::class)
        ->middleware(['can:shipping.view'])
        ->name('shipping.zones.index');
});
