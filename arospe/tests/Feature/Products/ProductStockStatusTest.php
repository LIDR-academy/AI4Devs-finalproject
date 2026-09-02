<?php

use App\Actions\Products\CreateProduct;
use App\Enums\ProductDisplayStatus;
use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0024, Phase 3 (TDD "red" step) — see CreateProductTest.php's file banner for the assumed
// CreateProduct::__invoke() signature. The "Agotado" invariant (D-7, confirmed Phase 0 decision —
// do not reopen): out-of-stock is COMPUTED from `stock` at read time, never persisted, never a
// third ProductStatus case, with no code path anywhere that could write it.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);
    $this->actingAs($actor);
});

afterEach(function () {
    Product::flushEventListeners();
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function stockStatusPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Runner Pro',
        'sku' => 'RNR-'.Str::random(10),
        'productCategoryId' => ProductCategory::factory()->create()->id,
        'type' => 'physical',
        'status' => 'active',
        'price' => '19.99',
        'stock' => 5,
        'description' => null,
        'featuredMediaId' => null,
        'orderedGalleryMediaIds' => [],
    ], $overrides);
}

test('submitting an out-of-stock spelling as status is refused by validation, with zero rows written', function (string $spelling) {
    $caught = null;

    try {
        app(CreateProduct::class)(...stockStatusPayload(['status' => $spelling]));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('status');

    expect(Product::count())->toBe(0);
})->with(['agotado', 'out_of_stock', 'sold_out']);

// The Eloquent cast layer — the path a seeder or console command bypassing CreateProduct
// entirely would take.
test('assigning an out-of-stock spelling to the status column throws ValueError on the cast', function (string $spelling) {
    $category = ProductCategory::factory()->create();

    expect(fn () => Product::create([
        'name' => 'Cast Layer Product',
        'sku' => 'RNR-'.Str::random(10),
        'product_category_id' => $category->id,
        'type' => 'physical',
        'status' => $spelling,
        'price' => '19.99',
        'stock' => 5,
    ])->status)->toThrow(ValueError::class);
})->with(['agotado', 'out_of_stock', 'sold_out']);

// A deliberate characterization test: a plain VARCHAR accepts this value with no complaint,
// documenting that the enforcement is entirely app-level and that no database constraint exists
// — a reviewer must not believe otherwise.
test('a raw insert of an out-of-stock status string succeeds at the database layer', function () {
    $category = ProductCategory::factory()->create();

    DB::table('products')->insert([
        'id' => (string) Str::uuid7(),
        'product_category_id' => $category->id,
        'name' => 'Raw Insert Product',
        'sku' => 'RNR-'.Str::random(10),
        'type' => 'physical',
        'status' => 'agotado',
        'price' => '19.99',
        'stock' => 0,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    expect(DB::table('products')->where('status', 'agotado')->exists())->toBeTrue();
});

// The paired assertion that defeats the tautology — a single assertion on displayStatus() is just
// a restatement of stock === 0; the second assertion is what goes red if anyone implements
// "Agotado" by writing the status column.
test('an active product with zero stock reports the out-of-stock badge while its stored status stays active', function () {
    $product = app(CreateProduct::class)(...stockStatusPayload(['status' => 'active', 'stock' => 0]));

    expect($product->fresh()->displayStatus())->toBe(ProductDisplayStatus::OutOfStock);

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'status' => 'active',
    ]);
});

test('restocking an out-of-stock active product restores the active badge without ever writing status', function () {
    $product = app(CreateProduct::class)(...stockStatusPayload(['status' => 'active', 'stock' => 0]));

    $statusWasDirty = null;

    Product::updating(function (Product $updating) use (&$statusWasDirty): void {
        $statusWasDirty = array_key_exists('status', $updating->getDirty());
    });

    $product->update(['stock' => 5]);

    expect($product->fresh()->displayStatus())->toBe(ProductDisplayStatus::Active)
        ->and($product->fresh()->status)->toBe(ProductStatus::Active)
        ->and($product->wasChanged('status'))->toBeFalse()
        ->and($statusWasDirty)->toBeFalse();
});

// RQ-4: the out-of-stock badge overrides Active only — a Draft product reads as Draft regardless
// of stock.
test('a draft product with zero stock reads as Draft, not out of stock, and its stored status stays draft', function () {
    $product = app(CreateProduct::class)(...stockStatusPayload(['status' => 'draft', 'stock' => 0]));

    expect($product->fresh()->displayStatus())->toBe(ProductDisplayStatus::Draft);

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'status' => 'draft',
    ]);
});

// The dataset is a CLOSURE (`fn () => [...]`), not a plain array literal: a plain array would
// eagerly evaluate `ProductDisplayStatus::OutOfStock` while Pest is still COLLECTING tests, and
// since that enum does not exist yet in this "red" phase, PHP's fatal "class not found" there
// gets swallowed by Pest's dataset-collection step and re-surfaces as the misleading
// `Pest\Exceptions\DatasetMissing` for the WHOLE FILE (confirmed by direct reproduction) rather
// than a clean per-test failure. Deferring evaluation to run time keeps the failure isolated and
// legible.
test('the out-of-stock threshold is exactly stock <= 0', function (int $stock, ProductDisplayStatus $expected) {
    $product = app(CreateProduct::class)(...stockStatusPayload(['status' => 'active', 'stock' => $stock]));

    expect($product->fresh()->displayStatus())->toBe($expected);
})->with(fn () => [
    'stock 0 is out of stock' => [0, ProductDisplayStatus::OutOfStock],
    'stock 1 is active' => [1, ProductDisplayStatus::Active],
]);
