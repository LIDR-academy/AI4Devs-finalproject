<?php

use App\Actions\Products\CreateProduct;
use App\Concerns\ProductValidationRules;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0024, Phase 3 (TDD "red" step) — see CreateProductTest.php's file banner for the assumed
// CreateProduct::__invoke() signature; unchanged here. This file is separate from
// CreateProductTest.php because the layer distinction (app-level canonicalisation vs. database
// collation) is the whole point of D-11, and deserves its own file the way 0023's
// CreateProductCategoryTest.php folds it in but this story's own "Tests to perform" section
// calls out as "its own file; the layer distinction is the whole point".
//
// "Saving a product under its own unchanged SKU" lives in UpdateProductTest.php, per the task
// file's own instruction — not duplicated here.

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
function skuTestPayload(array $overrides = []): array
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

function createSkuTestProduct(array $overrides = []): Product
{
    return app(CreateProduct::class)(...skuTestPayload($overrides));
}

test('a second product with an already-used SKU throws ValidationException on sku, not QueryException, and the row count stays 1', function () {
    createSkuTestProduct(['sku' => 'RNR-001']);

    $caught = null;

    try {
        createSkuTestProduct(['sku' => 'RNR-001']);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');

    expect(Product::where('sku', 'RNR-001')->count())->toBe(1);
});

// D-11's `23000` catch, driven through the real MySQL unique index rather than a hand-written
// assertion about the catch block — a Product::creating listener inserts the colliding row via
// the query builder at the instant CreateProduct's own model event fires, necessarily after its
// PHP-level Rule::unique() check has already passed and immediately before its own real INSERT.
// This reproduces two concurrent creates that both passed validation, exactly what the `23000`
// catch (not the pre-flight validation rule) exists to catch.
test('a duplicate that bypasses validation via a simulated race surfaces as a ValidationException on sku, never a 500', function () {
    $category = ProductCategory::factory()->create();
    $sku = 'RNR-RACE-001';
    $raced = false;

    Product::creating(function () use (&$raced, $sku, $category): void {
        if ($raced) {
            return;
        }

        $raced = true;

        DB::table('products')->insert([
            'id' => (string) Str::uuid7(),
            'product_category_id' => $category->id,
            'name' => 'Racer',
            'sku' => $sku,
            'type' => 'physical',
            'status' => 'draft',
            'price' => '9.99',
            'stock' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    $caught = null;

    try {
        createSkuTestProduct(['sku' => $sku, 'productCategoryId' => $category->id]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($raced)->toBeTrue()
        ->and($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');

    expect(Product::where('sku', $sku)->count())->toBeLessThan(2);
});

// Case-differing SKU — three assertions, because only (b) can fail on the engine the suite runs
// on: utf8mb4_unicode_ci is case-insensitive, so the unique index refuses 'rnr-001' regardless of
// what the app does. (a) and (c) are what separate app-level canonicalisation from collation.
test('creating with a lowercase SKU stores it canonically upper-cased', function () {
    $product = createSkuTestProduct(['sku' => 'rnr-002']);

    expect($product->fresh()->sku)->toBe('RNR-002');
});

test('a case-differing duplicate SKU is refused', function () {
    createSkuTestProduct(['sku' => 'RNR-001']);

    $caught = null;

    try {
        createSkuTestProduct(['sku' => 'rnr-001']);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect(Product::count())->toBe(1);
});

test('a case-differing SKU fails the uniqueness rule set in isolation', function () {
    Product::factory()->create(['sku' => 'RNR-001']);

    $rules = (new class
    {
        use ProductValidationRules;

        /** @return array<int, mixed> */
        public function exposedProductSkuRules(): array
        {
            return $this->productSkuRules();
        }
    })->exposedProductSkuRules();

    $validator = Validator::make(['sku' => 'rnr-001'], ['sku' => $rules]);

    expect($validator->fails())->toBeTrue();
});

// Whitespace-differing SKU, same shape and for the same reason: utf8mb4_unicode_ci is a PAD
// SPACE collation, so the refusal half would pass without any trim at all.
test('creating with a whitespace-padded SKU stores it trimmed and canonical', function () {
    $product = createSkuTestProduct(['sku' => '  rnr-003  ']);

    expect($product->fresh()->sku)->toBe('RNR-003');
});

test('a whitespace-differing duplicate SKU is refused', function () {
    createSkuTestProduct(['sku' => 'RNR-001']);

    $caught = null;

    try {
        createSkuTestProduct(['sku' => '  RNR-001  ']);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect(Product::count())->toBe(1);
});

test('a whitespace-differing SKU fails the uniqueness rule set in isolation', function () {
    Product::factory()->create(['sku' => 'RNR-001']);

    $rules = (new class
    {
        use ProductValidationRules;

        /** @return array<int, mixed> */
        public function exposedProductSkuRules(): array
        {
            return $this->productSkuRules();
        }
    })->exposedProductSkuRules();

    $validator = Validator::make(['sku' => '  RNR-001  '], ['sku' => $rules]);

    expect($validator->fails())->toBeTrue();
});

// Phase 4 audit finding F-2: SQLSTATE 23000 covers every integrity-constraint violation, not just
// duplicate keys — this transaction also writes three FKs (product_category_id,
// featured_media_id, product_media rows), so a genuine FK race must not be misreported as "the sku
// is taken". Simulated the same way as the SKU race test above: a Product::creating hook deletes
// the referenced category row (which has zero products yet, so the delete itself succeeds)
// immediately before CreateProduct's own INSERT, which then hits a real 1452 foreign-key
// violation — SQLSTATE 23000, but MySQL error 1452, not 1062 ER_DUP_ENTRY.
test('a genuine foreign key violation inside the transaction is never misreported as a sku uniqueness failure', function () {
    $category = ProductCategory::factory()->create();

    Product::creating(function () use ($category): void {
        DB::table('product_categories')->where('id', $category->id)->delete();
    });

    $caught = null;

    try {
        createSkuTestProduct(['productCategoryId' => $category->id]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(QueryException::class)
        ->and($caught)->not->toBeInstanceOf(ValidationException::class);
});
