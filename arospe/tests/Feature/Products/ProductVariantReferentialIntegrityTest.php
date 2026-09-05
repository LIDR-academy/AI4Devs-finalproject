<?php

use App\Models\Media;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

// Story 0029, Phase 3 (TDD "red" step): the product_variants/product_variant_values migrations do
// not exist yet. Driven by raw DB::table(...)->delete() where no application path exists yet -- the
// same deliberate, narrow exception to docs/testing/qa/what-not-to-test.md's "database guarantees"
// rule that 0024 argued for its media FKs. These are the ONLY executable proof of 0028's D4 mandate
// (restrictOnDelete() on the pivot's attribute-value FK) in the whole codebase -- 0029a's own
// application-level in-use guard is a separate, message-carrying layer in front of this FK, not a
// substitute for testing the FK itself.

/**
 * @return array{0: ProductAttributeType, 1: ProductAttributeValue}
 */
function referentialIntegrityTestAttribute(string $typeName, string $value): array
{
    $type = ProductAttributeType::factory()->create(['name' => $typeName]);
    $productAttributeValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => $value,
        'position' => 0,
    ]);

    return [$type, $productAttributeValue];
}

// 0028's D4 mandate: "the combination pivot's FK to product_attribute_values must be
// restrictOnDelete(), never cascadeOnDelete()".
test('deleting an attribute value in use by a variant is refused, and the value survives', function () {
    [, $value] = referentialIntegrityTestAttribute('Talla', 'M');
    $variant = ProductVariant::factory()->withCombination([$value->id])->create();

    expect(fn () => DB::table('product_attribute_values')->where('id', $value->id)->delete())
        ->toThrow(QueryException::class);

    expect(ProductAttributeValue::where('id', $value->id)->exists())->toBeTrue();
    expect(ProductVariant::where('id', $variant->id)->exists())->toBeTrue();
});

// The InnoDB cascade-meets-RESTRICT trap 0028's D7 flagged: RESTRICT guards deleting the PARENT
// product_attribute_values row, not deleting a pivot row -- so deleting the TYPE aborts too, since
// its own cascadeOnDelete() to its values would have to remove a value the pivot still restricts.
test('deleting an attribute type whose values are in use aborts, and the type, its values and the variants all survive', function () {
    [$type, $value] = referentialIntegrityTestAttribute('Talla', 'M');
    $variant = ProductVariant::factory()->withCombination([$value->id])->create();

    expect(fn () => DB::table('product_attribute_types')->where('id', $type->id)->delete())
        ->toThrow(QueryException::class);

    expect(ProductAttributeType::where('id', $type->id)->exists())->toBeTrue();
    expect(ProductAttributeValue::where('id', $value->id)->exists())->toBeTrue();
    expect(ProductVariant::where('id', $variant->id)->exists())->toBeTrue();
});

// D-10's three-level chain: products -> product_variants (CASCADE) -> product_variant_values
// (CASCADE), completing cleanly. The pivot's RESTRICT on the OTHER FK column does not interfere.
test('deleting a product removes its variants and their pivot rows, and leaves the attribute values untouched', function () {
    [, $value] = referentialIntegrityTestAttribute('Talla', 'M');
    $product = Product::factory()->create();
    $variant = ProductVariant::factory()->for($product)->withCombination([$value->id])->create();

    $product->delete();

    expect(ProductVariant::where('id', $variant->id)->exists())->toBeFalse();
    expect(DB::table('product_variant_values')->where('product_variant_id', $variant->id)->exists())->toBeFalse();
    expect(ProductAttributeValue::where('id', $value->id)->exists())->toBeTrue();
});

// 0024 D-9's fourth reference source: a variant's OWN featured image, restrictOnDelete().
test('deleting a media row referenced as a variant\'s own featured image is refused, and the media row survives', function () {
    $media = Media::factory()->create();
    $variant = ProductVariant::factory()->create(['featured_media_id' => $media->id]);

    expect(fn () => DB::table('media')->where('id', $media->id)->delete())
        ->toThrow(QueryException::class);

    expect(Media::where('id', $media->id)->exists())->toBeTrue();
    expect(ProductVariant::where('id', $variant->id)->exists())->toBeTrue();
});

// The complement, so the restriction is not over-broad: deleting a VARIANT succeeds, takes its own
// pivot rows with it, and leaves the media and attribute-value rows intact.
test('deleting a variant succeeds, takes its own pivot rows with it, and leaves media and attribute values intact', function () {
    [, $value] = referentialIntegrityTestAttribute('Talla', 'M');
    $media = Media::factory()->create();
    $variant = ProductVariant::factory()
        ->withCombination([$value->id])
        ->create(['featured_media_id' => $media->id]);

    $variant->delete();

    expect(ProductVariant::where('id', $variant->id)->exists())->toBeFalse();
    expect(DB::table('product_variant_values')->where('product_variant_id', $variant->id)->exists())->toBeFalse();
    expect(Media::where('id', $media->id)->exists())->toBeTrue();
    expect(ProductAttributeValue::where('id', $value->id)->exists())->toBeTrue();
});
