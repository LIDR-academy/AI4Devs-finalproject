<?php

use App\Livewire\ProductCategories\Index as ProductCategoriesIndex;   // aliased: `Index` is ambiguous across areas,
// exactly like routes/roles.php's and routes/sales-regions.php's own imports
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // `can:products.view`, not Spatie's `permission:` -- same reason as
    // users.index / roles.index / sales-regions.index: Livewire 4's
    // PersistentMiddleware allowlist carries Laravel's `Authorize` (`can:`)
    // but not Spatie's `PermissionMiddleware`, so a `permission:`-gated
    // route would protect the initial GET only, leaving every
    // save()/deleteProductCategory() /livewire/update round-trip
    // unauthorized. See docs/architecture/authorization.md.
    Route::livewire('product-categories', ProductCategoriesIndex::class)
        ->middleware(['can:products.view'])
        ->name('product-categories.index');
});
