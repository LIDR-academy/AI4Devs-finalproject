<?php

use App\Actions\Products\CreateProductVariant;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0029, Phase 3 (TDD "red" step): App\Actions\Products\CreateProductVariant does not exist
// yet. D-4: a variant's SKU is DERIVED, never typed. This file exercises the derivation IN SITU --
// against real product_attribute_types.position rows, D-4.2's whole ordering rule (never
// submission order) -- as distinct from tests/Unit/Actions/Products/DeriveVariantSkuTest.php's
// pure-function coverage of the formula itself.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.edit');
    $this->actingAs($actor);
});

/**
 * @return array{0: ProductAttributeType, 1: ProductAttributeValue}
 */
function skuDerivationTestAttribute(string $typeName, string $value, int $typePosition = 0): array
{
    $type = ProductAttributeType::factory()->create(['name' => $typeName, 'position' => $typePosition]);
    $productAttributeValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => $value,
        'position' => 0,
    ]);

    return [$type, $productAttributeValue];
}

test('creating a single-attribute variant persists exactly the derived SKU, asserted against the literal string in the database', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $talla] = skuDerivationTestAttribute('Talla', 'M');

    $variant = app(CreateProductVariant::class)($product, [$talla->id], '19.99', 5);

    // FP15: not a re-call of DeriveVariantSku -- that would be tautological against a formula bug
    // that lives inside __invoke() itself.
    $this->assertDatabaseHas('product_variants', ['id' => $variant->id, 'sku' => '0001-M']);
});

// D-4.3: the only test that proves `sku` really is outside #[Fillable]. Because CreateProductVariant's
// signature has no $sku parameter at all (D-17.1), the exclusion is proven directly at the model
// level: fill() silently discards a non-fillable attribute, so a raw mass-assignment attempt on an
// already-legitimately-derived variant cannot overwrite it.
test('sku is excluded from mass assignment, so a raw fill attempt cannot override the derived value', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $talla] = skuDerivationTestAttribute('Talla', 'M');

    $variant = app(CreateProductVariant::class)($product, [$talla->id], '19.99', 5);
    $derivedSku = $variant->sku;

    $variant->fill(['sku' => 'HACKED-SKU']);

    expect($variant->sku)->toBe($derivedSku);
});

// The discriminating test for D-4.2: an implementation that derives from payload/submission order
// passes every single-attribute test and only fails here. The same two values, submitted in BOTH
// orders on two different products (so the two calls cannot collide on the combination), must
// derive their segments in the identical relative order -- differing only by the product prefix.
test('submission order does not affect the SKU', function () {
    [, $color] = skuDerivationTestAttribute('Color', 'azul marino', 0);
    [, $talla] = skuDerivationTestAttribute('Talla', 'L', 1);

    $productA = Product::factory()->create(['sku' => '0002']);
    $productB = Product::factory()->create(['sku' => '0002B']);

    $variantA = app(CreateProductVariant::class)($productA, [$color->id, $talla->id], '19.99', 5);
    $variantB = app(CreateProductVariant::class)($productB, [$talla->id, $color->id], '19.99', 5);

    expect($variantA->fresh()->sku)->toBe('0002-azul-marino-L')
        ->and($variantB->fresh()->sku)->toBe('0002B-azul-marino-L');
});

// FP16: the fixture must make position order, id/creation order and alphabetical name order
// deliberately disagree, or an implementation ordered by name/id/creation passes identically.
// Talla created FIRST (earliest id) but given the LATER position; Color created SECOND (later id)
// but given the EARLIER position; names chosen so alphabetical order (Color, Talla) differs again
// from position order once reordered below.
test('the order is product_attribute_types.position, proven by changing it', function () {
    $talla = ProductAttributeType::factory()->create(['name' => 'Talla', 'position' => 1]);
    $color = ProductAttributeType::factory()->create(['name' => 'Color', 'position' => 0]);

    $tallaL = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $talla->id, 'value' => 'L', 'position' => 0,
    ]);
    $colorAzul = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $color->id, 'value' => 'azul marino', 'position' => 0,
    ]);

    $productA = Product::factory()->create(['sku' => '0002']);
    $variantA = app(CreateProductVariant::class)($productA, [$tallaL->id, $colorAzul->id], '19.99', 5);

    // position order: Color (0), Talla (1) -> azul-marino, L
    expect($variantA->fresh()->sku)->toBe('0002-azul-marino-L');

    // Reorder the types -- Talla now sorts before Color.
    $talla->update(['position' => 0]);
    $color->update(['position' => 1]);

    $productB = Product::factory()->create(['sku' => '0002B']);
    $variantB = app(CreateProductVariant::class)($productB, [$tallaL->id, $colorAzul->id], '19.99', 5);

    expect($variantB->fresh()->sku)->toBe('0002B-L-azul-marino');
});

// The DIS-1 shape: two values of the SAME type, undefined without the (value.position, value.id)
// tail of the sort key.
test('two values of the same type derive deterministically, ordered by value position then id', function () {
    $type = ProductAttributeType::factory()->create(['name' => 'Talla', 'position' => 0]);
    $sizeS = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id, 'value' => 'S', 'position' => 0,
    ]);
    $sizeM = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id, 'value' => 'M', 'position' => 1,
    ]);

    $product = Product::factory()->create(['sku' => '0003']);
    $variant = app(CreateProductVariant::class)($product, [$sizeM->id, $sizeS->id], '19.99', 5);

    expect($variant->fresh()->sku)->toBe('0003-S-M');
});

test('a value that reduces to an empty segment is refused, naming the offending value, with zero rows written', function () {
    $product = Product::factory()->create(['sku' => '0004']);
    [, $starValue] = skuDerivationTestAttribute('Symbol', '★★★');

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, [$starValue->id], '19.99', 5);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');

    expect(ProductVariant::count())->toBe(0);
    expect(DB::table('product_variant_values')->count())->toBe(0);
});

test('a derivation exceeding DeriveVariantSku::MAX_LENGTH is refused cleanly, not truncated and not a raw database error', function () {
    // products.sku is VARCHAR(64) and product_attribute_values.value is VARCHAR(100) -- both
    // segments below sit inside their own column's width, so the refusal is genuinely
    // DeriveVariantSku::MAX_LENGTH being exceeded, never a raw database truncation error one layer
    // lower. 64 (product) + 1 (hyphen) + 65 (value) = 130, over MAX_LENGTH (128) regardless of the
    // exact characters used.
    $product = Product::factory()->create(['sku' => str_repeat('9', 64)]);
    $overLongSegment = str_repeat('a', 65);
    [, $longValue] = skuDerivationTestAttribute('LongAttr', $overLongSegment);

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, [$longValue->id], '19.99', 5);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');

    expect(ProductVariant::count())->toBe(0);
});
