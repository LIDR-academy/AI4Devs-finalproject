<?php

use App\Actions\Products\CreateProduct;
use App\Actions\Products\SyncProductGallery;
use App\Actions\Products\UpdateProduct;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\PermissionRegistrar;

// Story 0024, Phase 3 (TDD "red" step): App\Actions\Products\UpdateProduct does not exist yet.
//
// ASSUMED UpdateProduct::__invoke() SIGNATURE — see CreateProductTest.php's file banner for the
// full rationale behind why these are raw/untyped inputs rather than already-typed enums.
// UpdateProduct takes the same fields as CreateProduct, plus the existing $product first
// (matching the file table's literal "__invoke(Product $product, ...)"):
//
//   public function __invoke(
//       Product $product,
//       string $name,
//       string $sku,
//       ?string $productCategoryId,
//       ?string $type,
//       ?string $status,
//       mixed $price,
//       mixed $stock,
//       ?string $featuredMediaId,
//       array $orderedGalleryMediaIds,
//       ?string $description = null,
//   ): Product
//
// Phase 4 audit finding F-1: $featuredMediaId and $orderedGalleryMediaIds carry NO defaults
// (unlike the original draft above), matching SyncProductGallery's own "not a delta" contract —
// a caller omitting them would otherwise silently wipe an existing gallery/featured image. Every
// call in this file passes both explicitly via updateProductPayload()'s named-argument spread, so
// the removed defaults change nothing here except making intent mandatory.
//
// This file's SKU-unchanged tests live here per the story's own instruction under
// ProductSkuUniquenessTest.php's checklist entry ("Lives in UpdateProductTest.php; listed here
// because it belongs to this rule").

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);
    $this->actingAs($actor);
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function updateProductPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Runner Pro',
        'sku' => 'RNR-001',
        'productCategoryId' => ProductCategory::factory()->create()->id,
        'type' => 'physical',
        'status' => 'active',
        'price' => '19.99',
        'stock' => 5,
        'description' => 'A great running shoe.',
        'featuredMediaId' => null,
        'orderedGalleryMediaIds' => [],
    ], $overrides);
}

function makeUpdatableProduct(string $sku = 'RNR-001', ?string $categoryId = null): Product
{
    $categoryId ??= ProductCategory::factory()->create()->id;

    return app(CreateProduct::class)(...updateProductPayload([
        'sku' => $sku,
        'productCategoryId' => $categoryId,
    ]));
}

function updateProductWith(Product $product, array $overrides = []): Product
{
    return app(UpdateProduct::class)(...array_merge(
        ['product' => $product],
        updateProductPayload(array_merge(
            ['sku' => $product->sku, 'productCategoryId' => $product->product_category_id],
            $overrides,
        )),
    ));
}

// 0023's R-1 pattern — the single most likely bug in this story alongside the SKU race guard —
// written as THREE tests so a reject-everything Rule::unique() cannot pass the first trivially.

test('saving a product under its own unchanged SKU succeeds', function () {
    $product = makeUpdatableProduct('RNR-001');

    $result = updateProductWith($product, ['sku' => 'RNR-001']);

    expect($result)->not->toBeNull();
});

test('after a no-op save with an unchanged SKU, the row is genuinely unchanged', function () {
    $product = makeUpdatableProduct('RNR-001');

    updateProductWith($product, ['sku' => 'RNR-001']);

    expect(Product::where('sku', 'RNR-001')->count())->toBe(1)
        ->and($product->fresh()->id)->toBe($product->id)
        ->and($product->fresh()->sku)->toBe('RNR-001');
});

test('a genuinely free SKU is still accepted when updating, as the control for the no-op case above', function () {
    $product = makeUpdatableProduct('RNR-001');

    $updated = updateProductWith($product, ['sku' => 'RNR-002']);

    expect($updated->fresh()->sku)->toBe('RNR-002');
});

// Gherkin: "Editing a product changes its stored values" — a direct, minimal check that a plain
// field edit persists, distinct from the SKU-specific control above.
test('updating a product changes its stored values', function () {
    $product = makeUpdatableProduct('RNR-001');

    $updated = updateProductWith($product, ['name' => 'Runner Pro II', 'sku' => 'RNR-001']);

    expect($updated->fresh()->name)->toBe('Runner Pro II');
});

// Phase 4 audit finding F-1: two tests pinning that removing the defaults from $featuredMediaId /
// $orderedGalleryMediaIds is deliberate and destructive-when-explicit, not accidental — (a) proves
// a caller who wants to KEEP the current gallery/featured image must state it explicitly, and (b)
// proves that stating an empty gallery/null featured image genuinely clears them, so the removed
// defaults are not merely a signature change with no observable behaviour.

test('re-passing the product\'s current gallery and featured image on an unrelated update preserves them exactly', function () {
    $product = makeUpdatableProduct('RNR-001');
    $featured = Media::factory()->create();
    $galleryA = Media::factory()->create();
    $galleryB = Media::factory()->create();

    app(SyncProductGallery::class)($product, $featured->id, [$galleryA->id, $galleryB->id]);

    $updated = updateProductWith($product, [
        'name' => 'Runner Pro II',
        'sku' => 'RNR-001',
        'featuredMediaId' => $featured->id,
        'orderedGalleryMediaIds' => [$galleryA->id, $galleryB->id],
    ]);

    expect($updated->fresh()->name)->toBe('Runner Pro II')
        ->and($updated->fresh()->featured_media_id)->toBe($featured->id)
        ->and($updated->fresh()->gallery->pluck('id')->all())->toBe([$galleryA->id, $galleryB->id]);
});

test('explicitly passing an empty gallery array and a null featured image genuinely clears both', function () {
    $product = makeUpdatableProduct('RNR-001');
    $featured = Media::factory()->create();
    $galleryA = Media::factory()->create();

    app(SyncProductGallery::class)($product, $featured->id, [$galleryA->id]);

    $updated = updateProductWith($product, [
        'featuredMediaId' => null,
        'orderedGalleryMediaIds' => [],
    ]);

    expect($updated->fresh()->featured_media_id)->toBeNull()
        ->and($updated->fresh()->gallery)->toHaveCount(0);
});
