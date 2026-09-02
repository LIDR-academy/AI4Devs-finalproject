<?php

use App\Actions\Products\CreateProduct;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0024, Phase 3 (TDD "red" step): App\Models\Product, App\Actions\Products\CreateProduct,
// the products/product_media migrations, App\Enums\{ProductType,ProductStatus} and
// App\Concerns\ProductValidationRules do not exist yet — every test in this file is expected to
// fail (class/table not found) until backend-expert/database-expert implement them in the next
// step of the TDD cycle. That is the correct, intended "red" outcome.
//
// ================================================================================================
// ASSUMED CreateProduct::__invoke() SIGNATURE — the task file gives only "__invoke(...): Product"
// with an ellipsis, never a literal signature (unlike SyncProductGallery, which the task file
// spells out verbatim under D-17b). This story ships NO Livewire component (D-1), so
// CreateProduct must validate its own raw input — there is no other caller to do it — matching
// App\Actions\ProductCategories\CreateProductCategory's precedent (raw/untyped input, validated
// inside the action) rather than App\Actions\Users\CreateUser's already-typed-enum parameters
// (whose Livewire caller validates first, before the action ever runs). Assumed:
//
//   public function __invoke(
//       string $name,
//       string $sku,
//       ?string $productCategoryId,
//       ?string $type,
//       ?string $status,
//       mixed $price,
//       mixed $stock,
//       ?string $description = null,
//       ?string $featuredMediaId = null,
//       array $orderedGalleryMediaIds = [],
//   ): Product
//
// Every call below uses PHP 8 NAMED ARGUMENTS specifically so a parameter REORDER during
// implementation does not break these tests — only a parameter RENAME would. If backend-expert's
// real signature differs, these calls are the single place to reconcile it.
//
// D-13's own rules table lists `status` as `['required', Rule::enum(ProductStatus::class)]`,
// which directly contradicts this story's own "Tests to perform" checklist ("productRules(null)
// ... does NOT mark status required — it has a default") and D-6 (omitting status must default to
// Draft). This file follows the checklist/D-6 as the more specific, more recently corrected
// source — flagged in the dispatching report, not silently resolved one way.
// ================================================================================================

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
function createProductPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Runner Pro',
        'sku' => 'RNR-'.Str::random(10),
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

function createProductWith(array $overrides = []): Product
{
    return app(CreateProduct::class)(...createProductPayload($overrides));
}

function expectCreateProductRefusal(array $overrides, string $field): void
{
    $caught = null;

    try {
        createProductWith($overrides);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey($field);

    expect(Product::count())->toBe(0);
}

// Gherkin: "Create a product with core fields".
test('creating with every required field persists exactly one row with every value round-tripping, and populates both timestamps', function () {
    $category = ProductCategory::factory()->create();

    $product = app(CreateProduct::class)(
        name: 'Runner Pro',
        sku: 'RNR-001',
        productCategoryId: $category->id,
        type: 'physical',
        status: 'active',
        price: '19.99',
        stock: 5,
        description: 'A great running shoe.',
        featuredMediaId: null,
        orderedGalleryMediaIds: [],
    );

    expect(Product::count())->toBe(1);

    $fresh = $product->fresh();

    expect($fresh->name)->toBe('Runner Pro')
        ->and($fresh->sku)->toBe('RNR-001')
        ->and($fresh->product_category_id)->toBe($category->id)
        ->and($fresh->type)->toBe(ProductType::Physical)
        ->and($fresh->status)->toBe(ProductStatus::Active)
        ->and($fresh->price)->toBe('19.99')
        ->and($fresh->stock)->toBe(5)
        ->and($fresh->description)->toBe('A great running shoe.')
        ->and($fresh->created_at)->not->toBeNull()
        ->and($fresh->updated_at)->not->toBeNull();
});

// D-5: "Product type is required with no default" — three tests at three layers, each covering a
// different place a silent fallback could be introduced.

// (a) the action layer.
test('creating without a type throws ValidationException on type, and writes zero rows', function () {
    expectCreateProductRefusal(['type' => null], 'type');
});

// (b) the database layer — this is the one that survives someone adding a column default later,
// where (a) would stay green regardless.
test('a raw insert omitting type throws QueryException at the database layer', function () {
    $category = ProductCategory::factory()->create();

    expect(fn () => DB::table('products')->insert([
        'id' => (string) Str::uuid7(),
        'product_category_id' => $category->id,
        'name' => 'Raw Insert Product',
        'sku' => 'RAW-'.Str::random(10),
        'price' => '19.99',
        'created_at' => now(),
        'updated_at' => now(),
    ]))->toThrow(QueryException::class);
});

// (c) the model layer — no model-level attribute default exists either.
test('a freshly instantiated, unsaved product has no type attribute default', function () {
    expect((new Product)->type)->toBeNull();
});

// D-6 / Gherkin: "A product is saved as a draft when no status is given".
test('creating without a status persists it as Draft', function () {
    $product = createProductWith(['status' => null]);

    expect($product->fresh()->status)->toBe(ProductStatus::Draft);
});

// R-5: if `status` were ever dropped from #[Fillable], a plain create() would silently discard it
// and the row would fall back to Draft with no error anywhere — nothing else in the suite would
// notice. assertDatabaseHas pins the literal persisted value.
test('creating with status explicitly set to active persists active', function () {
    $product = createProductWith(['status' => 'active']);

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'status' => 'active',
    ]);
});

test('invalid input is refused on the named field, with zero rows written', function (string $field, array $overrides) {
    expectCreateProductRefusal($overrides, $field);
})->with([
    'blank name' => ['name', ['name' => '']],
    'whitespace-only name' => ['name', ['name' => '   ']],
    'over-length name' => ['name', ['name' => str_repeat('a', 256)]],
    'blank SKU' => ['sku', ['sku' => '']],
    'whitespace-only SKU' => ['sku', ['sku' => '   ']],
    'missing category' => ['product_category_id', ['productCategoryId' => null]],
    'invalid type' => ['type', ['type' => 'digital']],
    'invalid status' => ['status', ['status' => 'agotado']],
    'non-numeric price' => ['price', ['price' => 'free']],
    'non-integer stock' => ['stock', ['stock' => 12.5]],
]);

// R-6 class: without a trim, 'Runner Pro' and '  Runner Pro  ' would be indistinguishable rows to
// a human that do not collide as duplicates — assert the exact PERSISTED value, not merely "no
// error".
test('leading and trailing whitespace on name and sku is stored trimmed', function () {
    $product = createProductWith(['name' => '  Runner Pro  ', 'sku' => '  TRIM-SKU-001  ']);

    expect($product->fresh()->name)->toBe('Runner Pro')
        ->and($product->fresh()->sku)->toBe('TRIM-SKU-001');
});

// R-7: the migration length and the validation max: must stay in lockstep at 255/64.
test('a name of exactly the maximum length (255) is accepted', function () {
    $name = str_repeat('a', 255);

    $product = createProductWith(['name' => $name]);

    expect($product->fresh()->name)->toBe($name);
});

test('a name one character over the maximum length (256) is refused', function () {
    expectCreateProductRefusal(['name' => str_repeat('a', 256)], 'name');
});

test('a SKU of exactly the maximum length (64) is accepted', function () {
    $sku = 'A'.str_repeat('0', 63);

    $product = createProductWith(['sku' => $sku]);

    expect($product->fresh()->sku)->toBe($sku);
});

test('a SKU one character over the maximum length (65) is refused', function () {
    $sku = 'A'.str_repeat('0', 64);

    expectCreateProductRefusal(['sku' => $sku], 'sku');
});
