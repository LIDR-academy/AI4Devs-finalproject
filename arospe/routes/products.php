<?php

// Story 0027 -- one area file, mirroring routes/product-categories.php exactly: its own
// ['auth', 'verified'] group, and the component imports ALIASED, since `Index` is ambiguous
// across six areas now and `Editor` becomes ambiguous the moment a second area has one
// (routes/roles.php, sales-regions.php and product-categories.php all alias).
use App\Livewire\Products\Editor as ProductEditor;
use App\Livewire\Products\Index as ProductsIndex;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // `can:products.view`, not Spatie's `permission:` -- Livewire 4's PersistentMiddleware
    // allowlist does not carry `permission:`, so every /livewire/update round-trip (save(),
    // deleteProduct(), the gallery's own methods, ...) would run unauthorized. The finer
    // abilities (create/update/delete) are authorized inside the components. Comment duplicated
    // verbatim from the sibling area files by convention -- a reader auditing one route file
    // must not have to open another to learn why. See docs/architecture/authorization.md.
    Route::livewire('products', ProductsIndex::class)
        ->middleware(['can:products.view'])
        ->name('products.index');

    Route::livewire('products/create', ProductEditor::class)
        ->middleware(['can:products.view'])
        ->name('products.create');

    Route::livewire('products/{product}/edit', ProductEditor::class)
        ->middleware(['can:products.view'])
        ->name('products.edit');
});
