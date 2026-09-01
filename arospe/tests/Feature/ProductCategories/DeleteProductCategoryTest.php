<?php

use App\Actions\ProductCategories\CreateProductCategory;
use App\Actions\ProductCategories\DeleteProductCategory;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;

// Story 0023, Phase 3 (TDD "red" step) -- see CreateProductCategoryTest.php's file banner.
// DeleteProductCategory::__invoke(ProductCategory $productCategory): bool does not exist yet.

test('deleting a category removes the row outright, not a soft delete', function () {
    $category = app(CreateProductCategory::class)('Footwear');

    $result = app(DeleteProductCategory::class)($category);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('product_categories', ['id' => $category->id]);
});

// D-3: proves nothing lingers to hold the unique index -- exactly what a soft delete would break.
// Rule::unique() does not apply the soft-delete scope (see docs/database/schema.md#soft-deletes),
// so a trashed "Footwear" would squat its name forever if this model soft-deleted.
test('the freed name can immediately be reused by a new category', function () {
    $category = app(CreateProductCategory::class)('Footwear');

    app(DeleteProductCategory::class)($category);

    $recreated = app(CreateProductCategory::class)('Footwear');

    expect($recreated->fresh()->name)->toBe('Footwear')
        ->and(ProductCategory::where('name', 'Footwear')->count())->toBe(1);
});

// Resolving an unknown category id (the shape a future route/Livewire caller would use before
// handing a resolved model to DeleteProductCategory) fails cleanly with ModelNotFoundException,
// not a silent no-op.
test('resolving an unknown category id fails cleanly with ModelNotFoundException, not a silent no-op', function () {
    app(CreateProductCategory::class)('Footwear');

    expect(fn () => ProductCategory::findOrFail((string) Str::uuid7()))
        ->toThrow(ModelNotFoundException::class);
});

// This story has no route/HTTP layer at all, so HasUuids' route-model-binding UUID validation
// (resolveRouteBindingQuery() rejecting a non-UUID parameter with Str::isUuid() before running a
// doomed query) is never invoked here -- findOrFail() below runs a real `WHERE id = ?` query that
// simply finds no matching row for the malformed string, throwing ModelNotFoundException for that
// ordinary reason. A malformed id must still fail the identical way as an unknown-but-valid one,
// never as a different error shape a future controller/component would have to special-case.
test('resolving a malformed, non-UUID category id fails cleanly with ModelNotFoundException', function () {
    app(CreateProductCategory::class)('Footwear');

    expect(fn () => ProductCategory::findOrFail('not-a-uuid'))
        ->toThrow(ModelNotFoundException::class);
});
