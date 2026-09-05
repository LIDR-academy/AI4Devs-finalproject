<?php

use App\Actions\Products\CreateProduct;
use App\Actions\Products\CreateProductVariant;
use App\Actions\Products\DeriveVariantSku;
use App\Actions\Products\HashVariantCombination;
use App\Actions\Products\SyncProductAttributeValues;
use App\Actions\Products\UpdateProduct;
use App\Actions\Products\UpdateProductVariant;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductCategory;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0029, Phase 3 (TDD "red" step): App\Actions\Products\CreateProductVariant does not exist
// yet, and 0024's CreateProduct/UpdateProduct do not yet carry this story's retrofit (D-4.7). This
// file is separate from ProductVariantSkuDerivationTest.php because the LAYER distinction is the
// whole point (D-4.5): a variant SKU can no longer be CHOSEN to collide -- it has to be ARRANGED to
// collide, across the three narrow cases D-4.5 enumerates.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);
    $this->actingAs($actor);
});

/**
 * @return array{0: ProductAttributeType, 1: ProductAttributeValue}
 */
function skuUniquenessTestAttribute(string $typeName, string $value, int $typePosition = 0): array
{
    $type = ProductAttributeType::factory()->create(['name' => $typeName, 'position' => $typePosition]);
    $productAttributeValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => $value,
        'position' => 0,
    ]);

    return [$type, $productAttributeValue];
}

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function skuUniquenessTestProductPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Fixture Product',
        'sku' => 'SKU-'.Str::random(10),
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

// =====================================================================
// D-4.5 case (a): a derived variant SKU colliding with a PRODUCT's own typed SKU
// =====================================================================

test('case (a): a derived variant SKU colliding with an existing product\'s typed SKU is refused', function () {
    // No index spans the two tables -- this can only pass for the right reason.
    app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0001-M']));

    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0001']));
    [, $tallaM] = skuUniquenessTestAttribute('Talla', 'M');

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, [$tallaM->id], '19.99', 5);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');

    expect(ProductVariant::count())->toBe(0);
});

// The reverse direction, and the only test that proves 0024's actions were actually retrofitted
// (R-E).
test('case (a), reverse: a product SKU colliding with an already-derived variant SKU is refused', function () {
    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0001']));
    [, $tallaM] = skuUniquenessTestAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$tallaM->id], '19.99', 5);

    $caught = null;

    try {
        app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0001-M']));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');
});

// =====================================================================
// D-4.5 case (b): two attribute values on the same product reducing to the same segment
// =====================================================================

test('case (b): two attribute values reducing to the same segment on one product are refused', function () {
    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0002']));
    [, $azulSpace] = skuUniquenessTestAttribute('Color', 'azul marino');
    [, $azulHyphen] = skuUniquenessTestAttribute('Color2', 'azul-marino', 1);

    app(CreateProductVariant::class)($product, [$azulSpace->id], '19.99', 5);

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, [$azulHyphen->id], '29.99', 3);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');
});

// =====================================================================
// D-4.5 case (c): separator ambiguity across two products
// =====================================================================

test('case (c): separator ambiguity across two products is refused', function () {
    $productA = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0001-M']));
    [, $valueL] = skuUniquenessTestAttribute('Talla', 'L');
    app(CreateProductVariant::class)($productA, [$valueL->id], '19.99', 5);

    $productB = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0001']));
    [, $valueML] = skuUniquenessTestAttribute('Talla2', 'M-L', 1);

    $caught = null;

    try {
        app(CreateProductVariant::class)($productB, [$valueML->id], '29.99', 3);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');
});

// =====================================================================
// The refusal must be actionable, not merely correct
// =====================================================================

test('the refusal names the conflicting record, not just the SKU', function () {
    $conflictingProduct = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0001-M']));
    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0001']));
    [, $tallaM] = skuUniquenessTestAttribute('Talla', 'M');

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, [$tallaM->id], '19.99', 5);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    $message = $caught->errors()['sku'][0];

    expect($message)->toContain($conflictingProduct->sku)
        ->and($message)->not->toBe(__('products.variants.duplicate_combination'));
});

// D-4.5's own ordering: a duplicate combination is reported first, never mislabelled as a SKU
// collision, even though both are true for the identical combination re-submitted.
test('a duplicate combination is reported as a duplicate combination, not as a duplicate SKU', function () {
    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0001']));
    [, $tallaM] = skuUniquenessTestAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$tallaM->id], '19.99', 5);

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, [$tallaM->id], '29.99', 3);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught->errors())->toHaveKey('combination')
        ->and($caught->errors())->not->toHaveKey('sku');
});

// =====================================================================
// FP4/0024's three-assertion pattern: case-differing SKU. Only (b) alone cannot fail on the
// engine the suite runs on (utf8mb4_unicode_ci is case-insensitive).
// =====================================================================

test('case-differing SKU: three assertions, because only two can fail', function () {
    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0002']));
    [, $azulMarino] = skuUniquenessTestAttribute('Color', 'azul marino');

    $variant = app(CreateProductVariant::class)($product, [$azulMarino->id], '19.99', 5);

    // (a) the exact stored casing.
    expect($variant->fresh()->sku)->toBe('0002-azul-marino');

    // (b) refused when a product already holds the case-differing collision -- true regardless of
    // whether the app enforces it, since utf8mb4_unicode_ci already refuses it at the index alone.
    expect(fn () => app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0002-AZUL-MARINO'])))
        ->toThrow(ValidationException::class);

    // (c) the derivation IN ISOLATION returns the lowercase form -- what actually pins the
    // casing-preserved rule (OQ-14) against the collation, since (b) alone cannot distinguish them.
    expect(app(DeriveVariantSku::class)('0002', ['azul marino']))->toBe('0002-azul-marino');
});

test('whitespace-differing values: the same three-part shape', function () {
    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0002']));
    [, $doubleSpace] = skuUniquenessTestAttribute('Color', 'azul  marino');

    $variant = app(CreateProductVariant::class)($product, [$doubleSpace->id], '19.99', 5);

    expect($variant->fresh()->sku)->toBe('0002-azul-marino');

    expect(fn () => app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0002-azul-marino'])))
        ->toThrow(ValidationException::class);
});

// =====================================================================
// D-4.6: re-derivation
// =====================================================================

test('renaming the parent product\'s SKU re-derives every one of its variants, in the same transaction', function () {
    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0001']));
    [, $tallaM] = skuUniquenessTestAttribute('Talla', 'M');
    [, $tallaS] = skuUniquenessTestAttribute('Talla2', 'S', 1);

    $variantM = app(CreateProductVariant::class)($product, [$tallaM->id], '19.99', 5);
    $variantS = app(CreateProductVariant::class)($product, [$tallaS->id], '19.99', 5);

    app(UpdateProduct::class)(...array_merge(
        ['product' => $product],
        skuUniquenessTestProductPayload([
            'name' => $product->name,
            'sku' => '0009',
            'productCategoryId' => $product->product_category_id,
        ]),
    ));

    expect($variantM->fresh()->sku)->toBe('0009-M')
        ->and($variantS->fresh()->sku)->toBe('0009-S');
});

test('re-derivation on a parent SKU change is all-or-nothing: a colliding case aborts the whole update', function () {
    app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0009-M']));

    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0001']));
    [, $tallaM] = skuUniquenessTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$tallaM->id], '19.99', 5);

    $caught = null;

    try {
        app(UpdateProduct::class)(...array_merge(
            ['product' => $product],
            skuUniquenessTestProductPayload([
                'name' => $product->name,
                'sku' => '0009',
                'productCategoryId' => $product->product_category_id,
            ]),
        ));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);

    // FP5's shape: assert the unchanged rows, not only the exception.
    expect($product->fresh()->sku)->toBe('0001')
        ->and($variant->fresh()->sku)->toBe('0001-M');
});

test('renaming an attribute value re-derives every variant built on it, across every product that uses it', function () {
    [, $azulMarino] = skuUniquenessTestAttribute('Color', 'azul marino');

    $productA = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0002']));
    $productB = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0003']));

    $variantA = app(CreateProductVariant::class)($productA, [$azulMarino->id], '19.99', 5);
    $variantB = app(CreateProductVariant::class)($productB, [$azulMarino->id], '19.99', 5);

    // The rename branch is a plain query-builder mass update (D-4.6.1) -- exercised directly here,
    // matching how SyncProductAttributeValuesTest.php exercises the same class elsewhere.
    app(SyncProductAttributeValues::class)(
        $azulMarino->type,
        [['id' => $azulMarino->id, 'value' => 'azul']],
    );

    expect($variantA->fresh()->sku)->toBe('0002-azul')
        ->and($variantB->fresh()->sku)->toBe('0003-azul');
});

// D-4.3's analogue of D-3's global consistency test -- the regression net for the derivation
// AND its re-derivation cascades.
test('every stored SKU equals the derivation of its current parent SKU and current ordered values, before and after renames', function () {
    $productA = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0001']));
    $productB = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0002']));
    [, $tallaM] = skuUniquenessTestAttribute('Talla', 'M');
    [, $colorAzul] = skuUniquenessTestAttribute('Color', 'azul marino', 1);

    app(CreateProductVariant::class)($productA, [$tallaM->id], '19.99', 5);
    app(CreateProductVariant::class)($productB, [$colorAzul->id], '19.99', 5);

    $assertGlobalConsistency = function (): void {
        ProductVariant::query()->with(['values.type', 'product'])->get()->each(function (ProductVariant $variant): void {
            $orderedValues = $variant->values
                ->sortBy([
                    fn ($a, $b) => $a->type->position <=> $b->type->position,
                    fn ($a, $b) => $a->type->id <=> $b->type->id,
                    fn ($a, $b) => $a->position <=> $b->position,
                    fn ($a, $b) => $a->id <=> $b->id,
                ])
                ->pluck('value')
                ->all();

            expect($variant->sku)->toBe(app(DeriveVariantSku::class)($variant->product->sku, $orderedValues));
        });
    };

    $assertGlobalConsistency();

    app(UpdateProduct::class)(...array_merge(
        ['product' => $productA],
        skuUniquenessTestProductPayload([
            'name' => $productA->name,
            'sku' => '0009',
            'productCategoryId' => $productA->product_category_id,
        ]),
    ));

    $assertGlobalConsistency();

    app(SyncProductAttributeValues::class)(
        $colorAzul->type,
        [['id' => $colorAzul->id, 'value' => 'azul']],
    );

    $assertGlobalConsistency();
});

// D-3's own global consistency test, mirroring the SKU sweep directly above it -- and, per D-13,
// run once at baseline AND again after an UpdateProductVariant call that changes price/stock, since
// D-13 requires UpdateProductVariant to NEVER touch the pivot or the hash. A sweep run only once at
// creation would never catch a regression on the update path.
test('every stored combination_hash equals the hash of its current real pivot ids, at baseline and after an UpdateProductVariant call', function () {
    $productA = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0020']));
    $productB = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0021']));
    [, $tallaHash] = skuUniquenessTestAttribute('TallaHash', 'M');
    [, $colorHash] = skuUniquenessTestAttribute('ColorHash', 'azul marino', 1);

    $variantA = app(CreateProductVariant::class)($productA, [$tallaHash->id, $colorHash->id], '19.99', 5);
    $variantB = app(CreateProductVariant::class)($productB, [$tallaHash->id], '29.99', 3);

    $assertGlobalHashConsistency = function (): void {
        ProductVariant::query()->with('values')->get()->each(function (ProductVariant $variant): void {
            $currentPivotIds = $variant->values->pluck('id')->all();

            expect($variant->combination_hash)
                ->toBe(app(HashVariantCombination::class)($currentPivotIds));
        });
    };

    $assertGlobalHashConsistency();

    // D-13: UpdateProductVariant may write price/stock/featured_media_id/position and must NEVER
    // touch the pivot or the hash -- proving the hash truly never moves on this path, not just
    // asserted once at creation. `featuredMediaId`/`position` are passed explicitly (never relying
    // on the action's own parameter defaults).
    app(UpdateProductVariant::class)($variantA, '99.99', 42, null, null);
    app(UpdateProductVariant::class)($variantB, '1.00', 0, null, null);

    $assertGlobalHashConsistency();
});

// =====================================================================
// Phase 4 audit findings F-1/F-2/F-3/F-6: docs/security/derived-column-invariants.md -- every
// invariant CreateProductVariant enforces on the CREATING write must be re-enforced on both
// re-derivation cascades (UpdateProduct::reDeriveVariantSkus(),
// SyncProductAttributeValues::reDeriveVariantSkusForRenamedValues()), because neither "looks like"
// a SKU writer -- one looks like renaming a product, the other like renaming an attribute value.
// =====================================================================

// F-1, via the rename cascade: reproduces the auditor's own scenario -- renaming an attribute
// value to a 100-char string (product_attribute_values.value's real column width) on a variant
// whose parent SKU is already long, pushing the derivation over DeriveVariantSku::MAX_LENGTH. Before
// the fix this reached MySQL as a raw SQLSTATE 22001 / error 1406 ("Data too long for column
// 'sku'"), an unhandled QueryException.
test('F-1: renaming an attribute value that pushes a variant SKU over MAX_LENGTH via the rename cascade is refused cleanly, not a raw database error', function () {
    // products.sku is VARCHAR(64); product_attribute_values.value is VARCHAR(100). 64 + 1 + 100 =
    // 165, comfortably over DeriveVariantSku::MAX_LENGTH (128) regardless of the exact characters.
    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => str_repeat('9', 64)]));
    [, $shortValue] = skuUniquenessTestAttribute('Attr', 'M');
    $variant = app(CreateProductVariant::class)($product, [$shortValue->id], '19.99', 5);

    $overLongValue = str_repeat('a', 100);

    $caught = null;

    try {
        app(SyncProductAttributeValues::class)(
            $shortValue->type,
            [['id' => $shortValue->id, 'value' => $overLongValue]],
        );
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');

    // The whole rename rolled back -- the variant's sku, and the attribute value's own row,
    // stayed exactly as they were.
    expect($variant->fresh()->sku)->toBe(str_repeat('9', 64).'-M')
        ->and($shortValue->fresh()->value)->toBe('M');
});

// F-1, via UpdateProduct's own cascade: the identical hazard one writer over -- renaming the
// PRODUCT's own sku to a long string pushes an already-existing variant's re-derivation over
// MAX_LENGTH.
test('F-1: changing the parent product\'s SKU to a length that pushes a variant SKU over MAX_LENGTH is refused cleanly via UpdateProduct\'s cascade', function () {
    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0014']));
    $overLongValue = str_repeat('b', 100);
    [, $longAttrValue] = skuUniquenessTestAttribute('Attr', $overLongValue);
    $variant = app(CreateProductVariant::class)($product, [$longAttrValue->id], '19.99', 5);

    $caught = null;

    try {
        app(UpdateProduct::class)(...array_merge(
            ['product' => $product],
            skuUniquenessTestProductPayload([
                'name' => $product->name,
                'sku' => str_repeat('9', 64),
                'productCategoryId' => $product->product_category_id,
            ]),
        ));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');

    expect($product->fresh()->sku)->toBe('0014')
        ->and($variant->fresh()->sku)->toBe('0014-'.$overLongValue);
});

// F-2: renaming a value to something that reduces entirely to the empty string (D-4.4) must be
// refused loudly on the rename cascade too -- before the fix this raised NO exception at all and
// silently stored a trailing-hyphen SKU (e.g. "0010-").
test('F-2: renaming an attribute value to something reducing to an empty segment is refused via the rename cascade, never a silent trailing-hyphen SKU', function () {
    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0010']));
    [, $value] = skuUniquenessTestAttribute('Attr', 'M');
    $variant = app(CreateProductVariant::class)($product, [$value->id], '19.99', 5);

    $caught = null;

    try {
        app(SyncProductAttributeValues::class)(
            $value->type,
            [['id' => $value->id, 'value' => '???']],
        );
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');

    // Rolled back atomically: no "0010-" trailing-hyphen write, and the value's own rename
    // never landed either.
    expect($variant->fresh()->sku)->toBe('0010-M')
        ->and($value->fresh()->value)->toBe('M');
});

// F-3: the pre-check must compare against the BATCH's own pending values, not only against the
// database -- renaming two sibling values of the SAME type in one save so both derive the
// identical new SKU segment for two variants of one product. Before the fix, the pre-check
// excluded each variant's own row but queried the database, where the OTHER renamed variant still
// held its OLD sku at check time -- so both passed and the second write hit the unique index as an
// uncaught UniqueConstraintViolationException.
test('F-3: renaming two sibling values in one save so both derive the same new SKU is refused as a clean ValidationException, never an uncaught UniqueConstraintViolationException', function () {
    $type = ProductAttributeType::factory()->create(['name' => 'Color', 'position' => 0]);
    $valueOne = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id, 'value' => 'Rojo', 'position' => 0,
    ]);
    $valueTwo = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id, 'value' => 'Verde', 'position' => 1,
    ]);

    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0011']));
    $variantOne = app(CreateProductVariant::class)($product, [$valueOne->id], '19.99', 5);
    $variantTwo = app(CreateProductVariant::class)($product, [$valueTwo->id], '29.99', 3);

    $caught = null;

    try {
        // 'A A' and 'A-A' are distinct literal strings (so they pass the values' own
        // unique(type_id, value) index) but DeriveVariantSku::segment() renders BOTH as 'A-A' --
        // a space becomes a hyphen, and a hyphen is already legal.
        app(SyncProductAttributeValues::class)($type, [
            ['id' => $valueOne->id, 'value' => 'A A'],
            ['id' => $valueTwo->id, 'value' => 'A-A'],
        ]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');

    // Neither variant's sku moved -- the whole rename aborted atomically, before either write.
    expect($variantOne->fresh()->sku)->toBe('0011-Rojo')
        ->and($variantTwo->fresh()->sku)->toBe('0011-Verde');
});

// =====================================================================
// Phase 4 re-audit finding R-4: docs/security/derived-column-invariants.md -- the per-row
// database pre-check in BOTH cascades must exclude the WHOLE batch's own variant ids, not only the
// row being checked, or a same-batch SKU rotation is wrongly refused as "taken" even though the
// final state is legal. Safe to widen because the internal-duplicate check (F-3, above) already
// rules out a genuine within-batch collision before either database check ever runs.
// =====================================================================

// NOTE: a genuine two-element SWAP (A <-> B, each taking exactly what the other currently holds)
// can NEVER succeed via sequential single-row UPDATEs against a real, immediately-enforced UNIQUE
// index -- MySQL has no deferred-constraint mechanism for a plain UNIQUE index, so whichever row
// writes first collides with the other's still-unwritten value, and there is no write order that
// avoids it for a true 2-cycle. R-4's fix (excluding the whole batch from the PRE-check) is what
// stops that scenario from being wrongly refused BEFORE either write is even attempted; the tests
// below instead use a one-directional chain -- variant A's new value lands on variant B's OLD
// value, while B's own new value is untaken by anyone -- which a real write order CAN complete
// cleanly, and is what R-4's fix makes reachable at all (pre-fix, the pre-check refused it before
// either write ran). Both cascades write their batch in the order `Product::variants()`
// (`->orderBy('position')->orderBy('sku')`) or the fetch query returns it, so the VACATING variant
// is created first (lower position) in both tests below -- not incidental, but what makes the
// scenario's write order the one that actually completes.
test('R-4: swapping two sibling attribute values\' text so one variant\'s new SKU lands on the other\'s current SKU succeeds, never wrongly refused', function () {
    $type = ProductAttributeType::factory()->create(['name' => 'Talla', 'position' => 0]);
    $valueVacating = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id, 'value' => 'M', 'position' => 0,
    ]);
    $valueClaiming = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id, 'value' => 'X', 'position' => 1,
    ]);

    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => 'P']));
    // The vacating variant is created FIRST -- Product::variants()'s orderBy('position') (which
    // both cascades ultimately read through) processes it before the claiming variant, so its
    // write frees 'P-M' before the claiming variant's write asks for it.
    $variantVacating = app(CreateProductVariant::class)($product, [$valueVacating->id], '19.99', 5);
    $variantClaiming = app(CreateProductVariant::class)($product, [$valueClaiming->id], '29.99', 3);

    expect($variantVacating->fresh()->sku)->toBe('P-M')
        ->and($variantClaiming->fresh()->sku)->toBe('P-X');

    // valueVacating renames 'M' -> 'Y' (untaken by anyone); valueClaiming renames 'X' -> 'M',
    // landing exactly on variantVacating's CURRENT (pre-rename) sku. Before the fix, the per-row
    // pre-check excluded only the row being checked (`where('id', '!=', $variantId)`), so checking
    // variantClaiming's new sku 'P-M' found variantVacating's still-un-updated row (still holding
    // 'P-M' at pre-check time, since no write in this batch has happened yet) and wrongly refused
    // the whole rename with a ValidationException, even though the end state is legal.
    app(SyncProductAttributeValues::class)($type, [
        ['id' => $valueVacating->id, 'value' => 'Y'],
        ['id' => $valueClaiming->id, 'value' => 'M'],
    ]);

    expect($variantVacating->fresh()->sku)->toBe('P-Y')
        ->and($variantClaiming->fresh()->sku)->toBe('P-M');
});

test('R-4: a parent SKU change that makes one variant\'s new SKU equal a sibling\'s still-pre-rename SKU succeeds, never wrongly refused', function () {
    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => 'P']));

    [, $valueXQ] = skuUniquenessTestAttribute('Attr2', 'X-Q');
    [, $valueQ] = skuUniquenessTestAttribute('Attr', 'Q', 1);

    // The vacating variant (valueXQ's) is created FIRST -- Product::variants()'s explicit
    // orderBy('position') processes it before variantQ, so its write moves it off 'P-X-Q' before
    // variantQ's write claims that same string.
    $variantXQ = app(CreateProductVariant::class)($product, [$valueXQ->id], '29.99', 3);
    $variantQ = app(CreateProductVariant::class)($product, [$valueQ->id], '19.99', 5);

    expect($variantXQ->fresh()->sku)->toBe('P-X-Q')
        ->and($variantQ->fresh()->sku)->toBe('P-Q');

    // Changing the PARENT's own sku from 'P' to 'P-X' re-derives EVERY variant of the product in
    // the same batch. variantQ's new sku ('P-X-Q') lands exactly on variantXQ's CURRENT
    // (pre-rename) sku -- before the fix, the per-row pre-check excluded only variantQ's own id, so
    // it found variantXQ's still-un-updated row and wrongly refused the whole update, even though
    // variantXQ's own sku moves away from 'P-X-Q' (to 'P-X-X-Q') inside this same batch.
    app(UpdateProduct::class)(...array_merge(
        ['product' => $product],
        skuUniquenessTestProductPayload([
            'name' => $product->name,
            'sku' => 'P-X',
            'productCategoryId' => $product->product_category_id,
        ]),
    ));

    expect($variantXQ->fresh()->sku)->toBe('P-X-X-Q')
        ->and($variantQ->fresh()->sku)->toBe('P-X-Q');
});

// =====================================================================
// Phase 4 re-audit finding R-1: docs/security/derived-column-invariants.md, "What the remediation
// introduced" -- UpdateProduct's own DB::transaction() call must carry NO `attempts` parameter,
// because its closure mutates $product, a model created OUTSIDE the closure and handed back to the
// caller. A retried attempt after a rolled-back deadlock does not reset that model's in-memory
// state, so a retry can commit having written nothing while $skuChanged silently reads false and the
// whole D-4.6 variant re-derivation cascade is skipped -- a silent lost update reported as saved.
// CreateProduct/CreateProductVariant remain safe with `attempts: 3` because they build their row
// INSIDE the closure via forceCreate() -- a retry there re-does real work rather than skipping it.
// =====================================================================

test('R-1: UpdateProduct\'s transaction carries no retry parameter, unlike CreateProduct/CreateProductVariant', function () {
    $updateProductSource = (string) file_get_contents(app_path('Actions/Products/UpdateProduct.php'));
    $createProductSource = (string) file_get_contents(app_path('Actions/Products/CreateProduct.php'));
    $createProductVariantSource = (string) file_get_contents(app_path('Actions/Products/CreateProductVariant.php'));

    // The real code shape both siblings use to pass `attempts` to DB::transaction() -- checked as
    // the literal closing-tag-plus-argument string, never a bare 'attempts:' substring, since
    // UpdateProduct's own docblock comment (immediately above its transaction call) legitimately
    // discusses `attempts: N`/`attempts: 3` in prose as the very thing it does NOT do.
    $retrySignature = '}, attempts:';

    // Regression net for the assertion itself: prove the string CAN be found before trusting its
    // absence means anything -- CreateProduct and CreateProductVariant must still carry it.
    expect($createProductSource)->toContain($retrySignature)
        ->and($createProductVariantSource)->toContain($retrySignature)
        ->and($updateProductSource)->not->toContain($retrySignature);
});

// F-6: UpdateProduct's 1062 catch must disambiguate by the violated index's own name -- a
// collision raised by its own variant-cascade write must surface as
// products.variants.parent_sku_change_collides, never misattributed to "the product's own sku is
// taken". Reproduced as a genuine RACE (DB::listen), because the application-level pre-check
// already catches a static, pre-seeded collision -- only a row inserted strictly between the
// cascade's own pre-check query and its write reaches this catch at all.
test('F-6: a variant-cascade collision surfaces via the parent_sku_change_collides message, never misattributed to the product\'s own sku', function () {
    $decoyProduct = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0015-DECOY']));

    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0015']));
    [, $tallaM] = skuUniquenessTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$tallaM->id], '19.99', 5);

    // The new product sku is '0009', so the re-derived variant sku is '0009-M' -- the pre-check's
    // own query for that exact value is what we intercept, inserting the colliding row only AFTER
    // it has already run (and found nothing), so the pre-check itself never sees it.
    $injected = false;
    DB::listen(function ($query) use (&$injected, $decoyProduct): void {
        if ($injected
            || ! str_contains($query->sql, 'from `product_variants`')
            || ! in_array('0009-M', $query->bindings, true)
        ) {
            return;
        }

        $injected = true;

        DB::table('product_variants')->insert([
            'id' => (string) Str::uuid7(),
            'product_id' => $decoyProduct->id,
            'combination_hash' => hash('sha256', 'f6-race-fixture'),
            'sku' => '0009-M',
            'price' => '9.99',
            'stock' => 0,
            'position' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    $caught = null;

    try {
        app(UpdateProduct::class)(...array_merge(
            ['product' => $product],
            skuUniquenessTestProductPayload([
                'name' => $product->name,
                'sku' => '0009',
                'productCategoryId' => $product->product_category_id,
            ]),
        ));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($injected)->toBeTrue();
    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect($caught->errors()['sku'][0])->toBe(__('products.variants.parent_sku_change_collides'))
        ->and($caught->errors()['sku'][0])->not->toBe(trans('validation.unique', ['attribute' => 'sku']));

    // Neither the product's own sku nor the variant's moved -- the whole update rolled back.
    expect($product->fresh()->sku)->toBe('0015')
        ->and($variant->fresh()->sku)->toBe('0015-M');
});

// =====================================================================
// The race, both directions -- a collision arriving between D-16.1's validation pass and D-4.5's
// two sequential cross-table checks, so it is the SECOND check (never a pre-flight rule that ran
// once and was trusted) that catches it.
//
// A genuinely concurrent, cross-connection gap-lock block (V-H, verified directly against
// performance_schema.data_locks) is not reproducible from a single PHP process without a second
// real database connection -- that mechanics-level verification is D-4.5's own, executed once, not
// re-derived here. What IS reproducible, and is what these two tests pin, is the property the gap
// lock exists to guarantee at the application boundary: a collision that appears strictly AFTER
// this action's own validation has already passed, but before its cross-table checks run, is still
// caught cleanly rather than slipping through on a stale "already validated" assumption.
// =====================================================================

test('a race landing between validation and CreateProductVariant\'s cross-table SKU check is caught, never a 500', function () {
    $product = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0005']));
    [, $race] = skuUniquenessTestAttribute('Race', 'RACE');

    // The first query touching product_attribute_values is D-16.1 pass 2's Rule::exists() check --
    // guaranteed to run before D-4.5's SKU derivation and its own lockForUpdate() checks. Injecting
    // the collision there, rather than before the whole call, is what makes this a RACE rather than
    // a restatement of the pre-seeded case (a)/(b)/(c) tests above.
    $injected = false;
    DB::listen(function ($query) use (&$injected): void {
        if ($injected || ! str_contains($query->sql, 'product_attribute_values')) {
            return;
        }

        $injected = true;

        $category = ProductCategory::factory()->create();
        DB::table('products')->insert([
            'id' => (string) Str::uuid7(),
            'product_category_id' => $category->id,
            'name' => 'Racer Product',
            'sku' => '0005-RACE',
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
        app(CreateProductVariant::class)($product, [$race->id], '19.99', 5);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');

    expect(ProductVariant::count())->toBe(0);
});

test('a race landing between validation and CreateProduct\'s cross-table SKU check is caught, never a 500', function () {
    $variantOwner = app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0006']));
    [, $race] = skuUniquenessTestAttribute('Race', 'RACE');

    // The first query touching `products` is validation's own Rule::unique(Product::class, 'sku')
    // check -- guaranteed to run before D-4.5's own two-step lockForUpdate() check (products, then
    // product_variants), so the racing row lands strictly between them and is only findable by the
    // SECOND (product_variants) step.
    $injected = false;
    DB::listen(function ($query) use (&$injected, $variantOwner): void {
        if ($injected || ! str_contains($query->sql, 'from `products`')) {
            return;
        }

        $injected = true;

        DB::table('product_variants')->insert([
            'id' => (string) Str::uuid7(),
            'product_id' => $variantOwner->id,
            'combination_hash' => hash('sha256', 'race-fixture'),
            'sku' => '0006-RACE',
            'price' => '9.99',
            'stock' => 0,
            'position' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    $caught = null;

    try {
        app(CreateProduct::class)(...skuUniquenessTestProductPayload(['sku' => '0006-RACE']));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('sku');
});
