<?php

use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

// Story 0024, Phase 3 (TDD "red" step): App\Models\Product, database/factories/ProductFactory.php
// and the products/product_media migrations do not exist yet — every test below is expected to
// fail (class/table not found) until database-expert/backend-expert implement them in the next
// step of the TDD cycle. That is the correct, intended "red" outcome.
//
// Mirrors tests/Feature/Models/UserTest.php's shape for the UUID v7/timestamp assertions and
// tests/Feature/Models/ProductCategoryTest.php's shape for a greenfield UUID model with no
// SoftDeletes.

test('a factory-created product receives a uuidv7 string primary key', function () {
    $product = Product::factory()->create();

    expect($product->id)->toBeString()
        ->and(Str::isUuid($product->id, 7))->toBeTrue();
});

test('two products created in immediate succession sort lexicographically in creation order', function () {
    $first = Product::factory()->create();
    $second = Product::factory()->create();

    expect(Str::isUuid($first->id, 7))->toBeTrue()
        ->and(Str::isUuid($second->id, 7))->toBeTrue()
        ->and(strcmp((string) $first->id, (string) $second->id))->toBeLessThan(0);
});

// R-4, the likeliest silent bug in this story: `decimal:2` returns a STRING. A test asserting
// only the numeric VALUE passes against either a string or a float cast and lets the drift ship.
test('price, stock, status and type round-trip through their declared casts', function () {
    $product = Product::factory()->create([
        'price' => '19.99',
        'stock' => 5,
        'status' => ProductStatus::Active,
        'type' => ProductType::Physical,
    ]);

    $fresh = $product->fresh();

    expect($fresh->price)->toBeString()
        ->and($fresh->price)->toBe('19.99')
        ->and($fresh->stock)->toBeInt()
        ->and($fresh->status)->toBeInstanceOf(ProductStatus::class)
        ->and($fresh->status)->toBe(ProductStatus::Active)
        ->and($fresh->type)->toBeInstanceOf(ProductType::class)
        ->and($fresh->type)->toBe(ProductType::Physical);
});

// Guards against a future column being added to #[Fillable] by reflex. `featured_media_id` is
// deliberately EXCLUDED: it is written only by App\Actions\Products\SyncProductGallery (D-9's
// single-writer rule), the same shape App\Models\SalesRegion already establishes for
// `is_default`/`is_active`.
test('the fillable set is exactly the columns a plain create/update payload may set directly', function () {
    expect((new Product)->getFillable())->toBe([
        'name', 'sku', 'product_category_id', 'type', 'status', 'price', 'stock', 'description',
    ]);
});

// The `products()` relation on ProductCategory is 0024b's — until it ships, only the inverse
// `$product->category` half is asserted here. The decoy category is what makes this non-trivial:
// a product must resolve ITS OWN category, not merely any category that happens to exist.
test('a product resolves its own category, with a decoy category present', function () {
    $ownCategory = ProductCategory::factory()->create();
    $decoyCategory = ProductCategory::factory()->create();

    $product = Product::factory()->create(['product_category_id' => $ownCategory->id]);
    Product::factory()->create(['product_category_id' => $decoyCategory->id]);

    expect($product->category)->not->toBeNull()
        ->and($product->category->id)->toBe($ownCategory->id)
        ->and($product->category->id)->not->toBe($decoyCategory->id);
});

// Story 0024b: the products() relation on ProductCategory, and its inverse-exclusion half. The
// decoy product (in ITS OWN category) is what makes this non-trivial -- a category must resolve
// only the products that reference it, not merely any product that happens to exist.
test('a category resolves only its own products, excluding one assigned to a decoy category', function () {
    $category = ProductCategory::factory()->create();
    $decoyCategory = ProductCategory::factory()->create();

    $ownProduct = Product::factory()->create(['product_category_id' => $category->id]);
    Product::factory()->create(['product_category_id' => $decoyCategory->id]);

    expect($category->products)->toHaveCount(1)
        ->and($category->products->first()->id)->toBe($ownProduct->id);
});

// D-12 regression guard: adding SoftDeletes later would silently change what Rule::unique() sees
// on `sku` (the story's central uniqueness rule) and 0029's variant cascade semantics.
test('the model does not use SoftDeletes', function () {
    expect(class_uses_recursive(Product::class))
        ->not->toHaveKey(SoftDeletes::class);
});
