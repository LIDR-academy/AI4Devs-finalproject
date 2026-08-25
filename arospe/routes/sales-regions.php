<?php

use App\Livewire\SalesRegions\Index as SalesRegionsIndex;   // aliased: `Index` is ambiguous across areas,
// exactly like routes/roles.php's own import
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // `can:sales-regions.view`, not Spatie's `permission:` — same reason as
    // users.index / roles.index: Livewire 4's PersistentMiddleware allowlist
    // carries Laravel's `Authorize` (`can:`) but not Spatie's
    // `PermissionMiddleware`, so a `permission:`-gated route would protect
    // the initial GET only, leaving every save()/setDefault()/setActive()
    // /livewire/update round-trip unauthorized. See docs/architecture/authorization.md.
    Route::livewire('taxes/sales-regions', SalesRegionsIndex::class)
        ->middleware(['can:sales-regions.view'])
        ->name('sales-regions.index');
});
