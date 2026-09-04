<?php

use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

// Story 0029, Phase 3 (TDD "red" step): App\Models\ProductVariant,
// database/factories/ProductVariantFactory.php and the product_variants/product_variant_values
// migrations do not exist yet — every test below is expected to fail (class/table not found) until
// database-expert/backend-expert implement them. That is the correct, intended "red" outcome.
//
// Mirrors tests/Feature/Models/ProductTest.php's shape.

test('a factory-created variant receives a uuidv7 string primary key', function () {
    $variant = ProductVariant::factory()->create();

    expect($variant->id)->toBeString()
        ->and(Str::isUuid($variant->id, 7))->toBeTrue();
});

// R-4/D-6, the likeliest silent bug in this story, inherited wholesale from 0024: `decimal:2`
// returns a STRING. A value-only assertion passes against either a string or a float cast and
// lets the drift ship.
test('price, stock and position round-trip through their declared casts', function () {
    $variant = ProductVariant::factory()->create([
        'price' => '19.99',
        'stock' => 5,
        'position' => 3,
    ]);

    $fresh = $variant->fresh();

    expect($fresh->price)->toBeString()
        ->and($fresh->price)->toBe('19.99')
        ->and($fresh->stock)->toBeInt()
        ->and($fresh->stock)->toBe(5)
        ->and($fresh->position)->toBeInt()
        ->and($fresh->position)->toBe(3);
});

// D-4.3: both `combination_hash` and `sku` are server-derived and must never be settable by a
// plain create/update payload. Guards against either being added to #[Fillable] by reflex.
test('the fillable set excludes both combination_hash and sku', function () {
    $fillable = (new ProductVariant)->getFillable();

    expect($fillable)->not->toContain('combination_hash')
        ->and($fillable)->not->toContain('sku');
});

// D-6 regression guard: adding SoftDeletes later would silently change what Rule::unique() sees
// on `sku`/`combination_hash` and both in-use counts this domain relies on.
test('the model does not use SoftDeletes', function () {
    expect(class_uses_recursive(ProductVariant::class))
        ->not->toHaveKey(SoftDeletes::class);
});

// D-8/D-17.2: values() must return the combination in a deterministic order — asserted as an
// EXACT array (FP8), never toContain or a sorted copy, which would pass against an unordered
// relation too.
test('values() returns the combination in a deterministic, exact order', function () {
    $product = Product::factory()->create();

    $color = ProductAttributeType::factory()->create(['name' => 'Color', 'position' => 0]);
    $talla = ProductAttributeType::factory()->create(['name' => 'Talla', 'position' => 1]);

    $colorValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $color->id,
        'value' => 'azul marino',
        'position' => 0,
    ]);
    $tallaValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $talla->id,
        'value' => 'L',
        'position' => 0,
    ]);

    $variant = ProductVariant::factory()
        ->for($product)
        ->withCombination([$tallaValue->id, $colorValue->id])
        ->create();

    expect($variant->fresh()->values->pluck('id')->all())
        ->toBe([$colorValue->id, $tallaValue->id]);
});
