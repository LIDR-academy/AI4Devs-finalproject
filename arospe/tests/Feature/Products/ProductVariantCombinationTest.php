<?php

use App\Actions\Products\CreateProductVariant;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0029, Phase 3 (TDD "red" step): App\Actions\Products\CreateProductVariant does not exist
// yet. D-3: no two variants of the same product may share a combination of attribute values,
// enforced by an application check and made a database invariant by
// unique(product_id, combination_hash) -- while the SAME combination stays legal on a different
// product, and a subset/superset is a distinct combination (relational-division bugs).

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.edit');
    $this->actingAs($actor);
});

afterEach(function () {
    ProductVariant::flushEventListeners();
});

/**
 * @return array{0: ProductAttributeType, 1: ProductAttributeValue}
 */
function combinationTestAttribute(string $typeName, string $value, int $typePosition = 0): array
{
    $type = ProductAttributeType::factory()->create(['name' => $typeName, 'position' => $typePosition]);
    $productAttributeValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => $value,
        'position' => 0,
    ]);

    return [$type, $productAttributeValue];
}

test('the same combination twice on one product is refused, and the product still holds exactly one', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $size40] = combinationTestAttribute('Talla', '40');
    [, $black] = combinationTestAttribute('Color', 'Black', 1);

    app(CreateProductVariant::class)($product, [$size40->id, $black->id], '19.99', 5);

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, [$size40->id, $black->id], '29.99', 3);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('combination');

    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(1);
});

// The case a naive implode()-without-a-sort passes on the first test and fails here: the
// combination submitted in reverse order must still be recognized as the same combination.
test('the same combination submitted in a different order is still refused as a duplicate', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $size40] = combinationTestAttribute('Talla', '40');
    [, $black] = combinationTestAttribute('Color', 'Black', 1);

    app(CreateProductVariant::class)($product, [$size40->id, $black->id], '19.99', 5);

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, [$black->id, $size40->id], '29.99', 3);
    } catch (Throwable $e) {
        $caught = $e;
    }

    // D-15: a duplicate combination throws on the 'combination' key, never merely
    // ValidationException in the abstract -- an assertion that only checks the exception class
    // would pass identically for a wrong-key refusal (e.g. a mislabelled 'sku' collision).
    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('combination');

    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(1);
});

// The classic relational-division bug: an implementation that asks "does an existing variant
// contain all my values?" wrongly rejects a genuine subset.
test('a subset of an existing combination is accepted as a distinct combination', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $size40] = combinationTestAttribute('Talla', '40');
    [, $black] = combinationTestAttribute('Color', 'Black', 1);

    app(CreateProductVariant::class)($product, [$size40->id, $black->id], '19.99', 5);

    $subset = app(CreateProductVariant::class)($product, [$size40->id], '29.99', 3);

    expect($subset)->not->toBeNull();
    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(2);
});

// The mirror image of the subset case, and it fails against a different wrong implementation, so
// both are needed.
test('a superset of an existing combination is accepted as a distinct combination', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $size40] = combinationTestAttribute('Talla', '40');
    [, $black] = combinationTestAttribute('Color', 'Black', 1);

    app(CreateProductVariant::class)($product, [$size40->id], '19.99', 5);

    $superset = app(CreateProductVariant::class)($product, [$size40->id, $black->id], '29.99', 3);

    expect($superset)->not->toBeNull();
    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(2);
});

// Pins the unique as (product_id, combination_hash), not combination_hash alone.
test('the same combination on a different product is accepted', function () {
    $productA = Product::factory()->create(['sku' => '0001']);
    $productB = Product::factory()->create(['sku' => '0002']);
    [, $size40] = combinationTestAttribute('Talla', '40');
    [, $black] = combinationTestAttribute('Color', 'Black', 1);

    app(CreateProductVariant::class)($productA, [$size40->id, $black->id], '19.99', 5);
    $variantB = app(CreateProductVariant::class)($productB, [$size40->id, $black->id], '29.99', 3);

    expect($variantB)->not->toBeNull();
});

// The race (0024's established technique, see ProductSkuUniquenessTest): a ProductVariant::creating
// hook inserts the colliding combination between the app-level check and the real insert. Both
// inserts run inside the same DB::transaction() CreateProductVariant opens, so when the real insert
// fails on the unique index and the transaction rolls back, the racer's own manually-inserted row
// rolls back with it -- the same reason 0024's precedent asserts toBeLessThan(2) rather than toBe(1)
// for its own sku race. The outcome that IS guaranteed, and is what this test actually pins, is that
// the collision surfaces as a clean ValidationException, never a 500, and the product never ends up
// with two variants holding the same combination.
test('a race that bypasses the app-level check surfaces as a clean ValidationException, never a 500', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $size40] = combinationTestAttribute('Talla', '40');
    $raced = false;

    ProductVariant::creating(function (ProductVariant $variant) use (&$raced, $product, $size40): void {
        if ($raced || $variant->product_id !== $product->id) {
            return;
        }

        $raced = true;

        $racedVariantId = (string) Str::uuid7();

        DB::table('product_variants')->insert([
            'id' => $racedVariantId,
            'product_id' => $product->id,
            'combination_hash' => hash('sha256', $size40->id),
            'sku' => '0001-RACE',
            'price' => '9.99',
            'stock' => 0,
            'position' => 99,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('product_variant_values')->insert([
            'product_variant_id' => $racedVariantId,
            'product_attribute_value_id' => $size40->id,
        ]);
    });

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, [$size40->id], '19.99', 5);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($raced)->toBeTrue()
        ->and($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('combination');

    expect(ProductVariant::where('product_id', $product->id)->count())->toBeLessThan(2);
});

// R-F: a duplicate SKU error must not be mislabelled as a duplicate combination -- both raise
// 23000 on the same table. Two products whose SKU prefixes overlap so the *variant* SKUs collide
// while the *combinations* are genuinely different (D-4.5 case (c)).
test('a duplicate SKU is not reported as a duplicate combination', function () {
    $productA = Product::factory()->create(['sku' => '0001-M']);
    $productB = Product::factory()->create(['sku' => '0001']);
    // One shared "Talla" type -- combinationTestAttribute() creates a fresh type per call, and
    // product_attribute_types.name is globally unique.
    $tallaType = ProductAttributeType::factory()->create(['name' => 'Talla', 'position' => 0]);
    $tallaL = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $tallaType->id, 'value' => 'L', 'position' => 0]);
    $tallaML = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $tallaType->id, 'value' => 'M-L', 'position' => 1]);

    // 0001-M + L -> 0001-M-L
    app(CreateProductVariant::class)($productA, [$tallaL->id], '19.99', 5);

    $caught = null;

    try {
        // 0001 + M-L -> 0001-M-L, a distinct combination but a colliding derived SKU.
        app(CreateProductVariant::class)($productB, [$tallaML->id], '29.99', 3);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku')
        ->and($caught->errors())->not->toHaveKey('combination');
});
