<?php

use App\Actions\Products\CreateProduct;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0024, Phase 3 (TDD "red" step) — see CreateProductTest.php's file banner for the assumed
// CreateProduct::__invoke() signature; unchanged here.
//
// The negative stock boundary (stock = -1) belongs here rather than in
// ProductStockStatusTest.php, per that file's own note: "Negative stock is refused by validation
// (RQ-3), so it is covered in ProductBoundariesTest rather than here."

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
function boundariesPayload(array $overrides = []): array
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

function boundariesExpectRefusal(array $overrides, string $field): void
{
    $caught = null;

    try {
        app(CreateProduct::class)(...boundariesPayload($overrides));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey($field);

    expect(Product::count())->toBe(0);
}

test('stock of zero is accepted and persists as integer 0, not treated as empty', function () {
    $product = app(CreateProduct::class)(...boundariesPayload(['stock' => 0]));

    expect($product->fresh()->stock)->toBeInt()->toBe(0);
});

// D-3: asserting the exception CLASS is what keeps the rule app-level rather than an engine
// artefact — `stock` stays a SIGNED column precisely so this is a ValidationException, never a
// MySQL 1264 "out of range" 500.
test('negative stock is refused by ValidationException on stock', function () {
    boundariesExpectRefusal(['stock' => -1], 'stock');
});

test('the accepted and refused stock input shapes persist with the right type', function (mixed $stock, bool $accepted, mixed $expected) {
    if (! $accepted) {
        boundariesExpectRefusal(['stock' => $stock], 'stock');

        return;
    }

    $product = app(CreateProduct::class)(...boundariesPayload(['stock' => $stock]));

    expect($product->fresh()->stock)->toBe($expected);
})->with([
    'a numeric string is accepted as an integer' => ['12', true, 12],
    'a float is refused' => [12.5, false, null],
]);

test('price of zero is accepted as a free product', function () {
    $product = app(CreateProduct::class)(...boundariesPayload(['price' => '0']));

    expect($product->fresh()->price)->toBe('0.00');
});

test('negative price is refused', function () {
    boundariesExpectRefusal(['price' => '-1'], 'price');
});

// RQ-5: refused BEFORE the database can round 19.999 to 20.00 with only a note — the customer
// would otherwise be charged a different price than the administrator typed.
test('a price with three decimal places is refused by validation, not silently rounded', function () {
    boundariesExpectRefusal(['price' => '19.999'], 'price');
});

test('the maximum price (99999999.99) is accepted and stored exactly', function () {
    $product = app(CreateProduct::class)(...boundariesPayload(['price' => '99999999.99']));

    expect($product->fresh()->price)->toBe('99999999.99');
});

test('a price one cent over the maximum is refused by validation, not a 22003 QueryException', function () {
    boundariesExpectRefusal(['price' => '100000000.00'], 'price');
});

test('a non-numeric price string is refused', function () {
    boundariesExpectRefusal(['price' => 'free'], 'price');
});

// A genuine input path in a Spanish-language backoffice — the comma decimal separator.
test('a comma-decimal price is refused', function () {
    boundariesExpectRefusal(['price' => '19,99'], 'price');
});
