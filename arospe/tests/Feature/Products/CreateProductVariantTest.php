<?php

use App\Actions\Products\CreateProductVariant;
use App\Actions\Products\DeriveVariantSku;
use App\Actions\Products\HashVariantCombination;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0029, Phase 3 (TDD "red" step): App\Actions\Products\CreateProductVariant does not exist
// yet. Signature per D-17.1, verbatim:
//
//   public function __invoke(
//       Product $product,
//       array $productAttributeValueIds,
//       string $price,
//       int $stock,
//       ?string $featuredMediaId = null,
//   ): ProductVariant
//
// The action self-authorizes (D-12.1) against $product via App\Actions\Auth\
// LogRefusedPrivilegedAttempt — every test below therefore acts as an actor holding
// `products.edit`; the refusal path itself is covered in ProductVariantAuthorizationTest.php.

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
function variantCreateTestAttribute(string $typeName, string $value, int $typePosition = 0): array
{
    $type = ProductAttributeType::factory()->create(['name' => $typeName, 'position' => $typePosition]);
    $productAttributeValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => $value,
        'position' => 0,
    ]);

    return [$type, $productAttributeValue];
}

test('creating a variant with a full combination persists one row, exactly N pivot rows, and every column round-trips', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $talla] = variantCreateTestAttribute('Talla', 'M', 0);
    [, $color] = variantCreateTestAttribute('Color', 'azul marino', 1);

    $variant = app(CreateProductVariant::class)($product, [$talla->id, $color->id], '19.99', 5);

    expect(ProductVariant::count())->toBe(1)
        ->and(DB::table('product_variant_values')->where('product_variant_id', $variant->id)->count())->toBe(2);

    $fresh = $variant->fresh();

    expect($fresh->product_id)->toBe($product->id)
        ->and($fresh->price)->toBe('19.99')
        ->and($fresh->stock)->toBe(5)
        ->and($fresh->featured_media_id)->toBeNull();
});

test('the persisted combination_hash equals the hash of the pivot\'s real ids', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $talla] = variantCreateTestAttribute('Talla', 'M', 0);
    [, $color] = variantCreateTestAttribute('Color', 'azul marino', 1);

    $variant = app(CreateProductVariant::class)($product, [$talla->id, $color->id], '19.99', 5);

    $fresh = $variant->fresh();

    expect($fresh->combination_hash)
        ->toBe(app(HashVariantCombination::class)($fresh->values->pluck('id')->all()));
});

test('position is assigned MAX + 1 scoped to the product, and two products number independently', function () {
    $productA = Product::factory()->create(['sku' => '0001']);
    $productB = Product::factory()->create(['sku' => '0002']);

    // One shared "Talla" type — variantCreateTestAttribute() creates a fresh type per call, and
    // product_attribute_types.name is globally unique, so calling it three times with the same
    // type name collided on the second call. Three sibling values under one type instead.
    $sizeType = ProductAttributeType::factory()->create(['name' => 'Talla', 'position' => 0]);
    $sizeM = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $sizeType->id, 'value' => 'M', 'position' => 0]);
    $sizeS = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $sizeType->id, 'value' => 'S', 'position' => 1]);
    $sizeL = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $sizeType->id, 'value' => 'L', 'position' => 2]);

    $variantA1 = app(CreateProductVariant::class)($productA, [$sizeM->id], '19.99', 5);
    $variantA2 = app(CreateProductVariant::class)($productA, [$sizeS->id], '19.99', 5);
    $variantB1 = app(CreateProductVariant::class)($productB, [$sizeL->id], '19.99', 5);

    expect($variantA1->fresh()->position)->toBe(0)
        ->and($variantA2->fresh()->position)->toBe(1)
        ->and($variantB1->fresh()->position)->toBe(0);
});

// Dataset of invalid inputs, each throwing on the named key and writing zero rows and zero pivot
// rows. Per D-15's closed six-key contract and D-17.1's fixed signature (Product is a resolved
// object, not a string id), "missing product"/"unknown product" from the task file's own checklist
// have no bag key to throw on here — that responsibility belongs to whichever caller resolves
// Product (0031's route-model binding), which this backend-only story does not ship. Covered
// separately below with a fixture that demonstrates the real, database-level guarantee instead.
test('invalid inputs throw ValidationException on the named key and write zero rows', function (array $overrides, string $key) {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $talla] = variantCreateTestAttribute('Talla', 'M');

    $args = array_merge([
        'productAttributeValueIds' => [$talla->id],
        'price' => '19.99',
        'stock' => 5,
    ], $overrides);

    $caught = null;

    try {
        app(CreateProductVariant::class)(
            $product,
            $args['productAttributeValueIds'],
            $args['price'],
            $args['stock'],
        );
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey($key);

    expect(ProductVariant::count())->toBe(0);
    expect(DB::table('product_variant_values')->count())->toBe(0);
})->with([
    'empty attribute-value list' => [['productAttributeValueIds' => []], 'attributeValueIds'],
    'negative stock' => [['stock' => -1], 'stock'],
    'non-numeric price' => [['price' => 'abc'], 'price'],
    'three-decimal price' => [['price' => '19.999'], 'price'],
    'unknown attribute-value id' => [['productAttributeValueIds' => [(string) Str::uuid7()]], 'attributeValueIds'],
    'malformed attribute-value id' => [['productAttributeValueIds' => [123]], 'attributeValueIds'],
]);

// The "missing/unknown product" cases from the task file's own checklist, honestly reframed: since
// CreateProductVariant's signature takes an already-resolved Product instance (D-17.1) rather than
// an id, there is no application-level validation path that can refuse "a product that doesn't
// exist" — the FK constraint on product_variants.product_id is what makes that impossible, and
// that is what this test pins.
test('a variant cannot be persisted against a product row that has since been deleted', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $talla] = variantCreateTestAttribute('Talla', 'M');

    $productId = $product->id;
    DB::table('products')->where('id', $productId)->delete();

    expect(fn () => app(CreateProductVariant::class)($product, [$talla->id], '19.99', 5))
        ->toThrow(QueryException::class);

    expect(ProductVariant::count())->toBe(0);
});

// FP1: toHaveCount(1) on the wrong table passes identically for "correctly refused" and for "the
// variant was rolled back but orphan pivot rows remain" — asserted separately from the row count.
test('a rejected create leaves no orphan pivot rows', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $talla] = variantCreateTestAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$talla->id], '19.99', 5);

    $caught = null;

    try {
        // The identical combination again -- refused by D-3's duplicate-combination check.
        app(CreateProductVariant::class)($product, [$talla->id], '29.99', 3);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect(ProductVariant::count())->toBe(1);
    expect(DB::table('product_variant_values')->count())->toBe(1);
});

// Phase 4 finding F-7: `product_id` is fixed at creation (D-13) and CreateProductVariant writes
// it via forceCreate() -- a variant's parent product should never be reachable through mass
// assignment. `forceCreate()` itself bypasses #[Fillable] entirely (asserted implicitly by every
// test above still creating variants correctly), so this test targets `fill()` directly, the only
// path the #[Fillable] omission actually guards.
test('product_id is excluded from mass assignment, so a fill() attempt cannot reparent a variant (F-7)', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    $decoyProduct = Product::factory()->create(['sku' => '0002']);
    [, $talla] = variantCreateTestAttribute('Talla', 'M');

    $variant = app(CreateProductVariant::class)($product, [$talla->id], '19.99', 5);

    $variant->fill(['product_id' => $decoyProduct->id]);

    expect($variant->product_id)->toBe($product->id);
});

// =====================================================================
// D-15: featuredMediaId's own refusal contract -- zero refusal tests existed anywhere for this key
// before this file.
// =====================================================================

test('a malformed or unknown featuredMediaId throws ValidationException on featuredMediaId and writes zero rows', function (mixed $featuredMediaId) {
    $product = Product::factory()->create(['sku' => '0003']);
    [, $talla] = variantCreateTestAttribute('TallaFmid', 'M');

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, [$talla->id], '19.99', 5, $featuredMediaId);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('featuredMediaId');

    expect(ProductVariant::count())->toBe(0);
})->with([
    'unknown media id' => [(string) Str::uuid7()],
    'malformed media id' => ['not-a-uuid-at-all'],
]);

// =====================================================================
// FP11 / V-10: Rule::exists() is case-insensitive under this schema's utf8mb4_unicode_ci collation
// while HashVariantCombination/DeriveVariantSku are not -- a case-varied id must still validate
// (the uppercased id matches the stored lowercase one under the connection's collation), but the
// mandatory read-back must be what actually decides the pivot, the hash and the derived SKU, never
// the payload's own casing.
// =====================================================================

test('a case-varied attribute-value id validates, but the read-back wins: the persisted pivot, hash and SKU all use the real id and value, never the payload\'s casing (FP11)', function () {
    $product = Product::factory()->create(['sku' => '0004']);
    [, $talla] = variantCreateTestAttribute('TallaCase', 'M', 0);

    $uppercasedId = Str::upper($talla->id);
    expect($uppercasedId)->not->toBe($talla->id);

    // Creates successfully -- the case-varied id validates against Rule::exists() under
    // utf8mb4_unicode_ci.
    $variant = app(CreateProductVariant::class)($product, [$uppercasedId], '19.99', 5);

    expect($variant)->not->toBeNull();

    // The persisted pivot row uses the correct, real LOWERCASE id -- proving the read-back rule
    // wins over the payload's uppercased string.
    $pivotIds = DB::table('product_variant_values')
        ->where('product_variant_id', $variant->id)
        ->pluck('product_attribute_value_id')
        ->all();

    expect($pivotIds)->toBe([$talla->id]);

    // The stored combination_hash/sku match exactly what a LOWERCASE-payload submission would
    // have produced -- computed directly from the real id/value, never from the uppercased
    // payload -- proving no divergent hash/SKU was derived from the wrong-case string.
    $expectedHash = app(HashVariantCombination::class)([$talla->id]);
    $expectedSku = app(DeriveVariantSku::class)($product->sku, [$talla->value]);

    $fresh = $variant->fresh();

    expect($fresh->combination_hash)->toBe($expectedHash)
        ->and($fresh->sku)->toBe($expectedSku);
});
