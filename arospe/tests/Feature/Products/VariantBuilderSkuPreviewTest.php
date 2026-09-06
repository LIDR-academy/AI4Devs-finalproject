<?php

// Story 0031, Phase 3 (TDD "red" step): App\Livewire\Products\VariantBuilder does not exist yet.
// D-4/D-5: a variant's SKU is a server-side #[Computed] PREVIEW while the form is open and the
// STORED product_variants.sku column once a variant is saved -- the two must never be confused.
//
// Every SKU assertion in this file is a HAND-WRITTEN LITERAL STRING (FP-V2 / 0029 FP15) -- never a
// re-call of App\Actions\Products\DeriveVariantSku::derive() (deliberately not imported here, so
// the rule cannot be violated by accident: the component calls derive() itself, so comparing
// against a second call to the same function would be tautological against a formula bug that
// lives inside the derivation itself).
//
// Method/property names below follow the story's own confirmed contract: `saveVariant()` (D-10,
// T7, D-3's own checklist item -- "addVariant()" appears exactly once in the story's prose as an
// informal reference and is not used here), `openCreateForm()` (D-10), and the combinationRows
// array shape `['key' => ..., 'typeId' => ..., 'valueId' => ...]` (D-2/D-9). The whole array is set
// in one Livewire::test()->set('combinationRows', [...]) call rather than built up row by row,
// since no "add a row" method name is confirmed anywhere in the story text.

use App\Livewire\Products\VariantBuilder;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Livewire\Exceptions\PublicPropertyNotFoundException;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.edit']);
    $this->actingAs($actor);
});

/**
 * @return array{0: ProductAttributeType, 1: ProductAttributeValue}
 */
function skuPreviewTestAttribute(string $typeName, string $value, int $typePosition = 0, int $valuePosition = 0): array
{
    $type = ProductAttributeType::factory()->create(['name' => $typeName, 'position' => $typePosition]);
    $productAttributeValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => $value,
        'position' => $valuePosition,
    ]);

    return [$type, $productAttributeValue];
}

/**
 * The three-way ordering fixture (0029 FP16, corrected by frontend-qa to three attribute types --
 * two types can only ever separate position-order from {name, id}-order, since name-order and
 * id-order cannot themselves be told apart with only two items). Position/name/id/submission order
 * all deliberately disagree:
 *
 * | Type | Created | position | Name    | Value        |
 * |------|---------|----------|---------|--------------|
 * | T1   | 1st     | 2        | Color   | azul marino  |
 * | T2   | 2nd     | 0        | Acabado | Mate         |
 * | T3   | 3rd     | 1        | Talla   | L            |
 *
 * Only the position-ordered reading ("Acabado", then "Talla", then "Color" -- position 0, 1, 2)
 * produces '0002-Mate-L-azul-marino'; by-name ('Acabado', 'Color', 'Talla'), by-id/creation
 * ('Color', 'Acabado', 'Talla') and by-submission (T1, T2, T3 as created) each produce a different,
 * distinct literal, so this fixture can only pass for the right reason.
 *
 * @return array{0: Product, 1: ProductAttributeType, 2: ProductAttributeValue, 3: ProductAttributeType, 4: ProductAttributeValue, 5: ProductAttributeType, 6: ProductAttributeValue}
 */
function skuPreviewThreeWayFixture(): array
{
    $product = Product::factory()->create(['sku' => '0002']);

    [$t1Color, $v1AzulMarino] = skuPreviewTestAttribute('Color', 'azul marino', typePosition: 2);
    [$t2Acabado, $v2Mate] = skuPreviewTestAttribute('Acabado', 'Mate', typePosition: 0);
    [$t3Talla, $v3L] = skuPreviewTestAttribute('Talla', 'L', typePosition: 1);

    return [$product, $t1Color, $v1AzulMarino, $t2Acabado, $v2Mate, $t3Talla, $v3L];
}

test('adding a variant for the Talla value M on product 0001 persists and renders the literal 0001-M', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = skuPreviewTestAttribute('Talla', 'M');

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')
        ->set('combinationRows', [
            ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id],
        ])
        ->set('price', '19.99')
        ->set('stock', '5')
        ->call('saveVariant')
        ->assertHasNoErrors();

    // Hand-written literal -- never toBe(VariantSku::derive(...)) (FP-V2).
    $variant = ProductVariant::where('product_id', $product->id)->firstOrFail();
    expect($variant->sku)->toBe('0001-M');

    $component->assertSee('0001-M');
});

test('the three-way ordering fixture derives the SKU by type position, never by name, id or submission order', function () {
    [$product, $t1Color, $v1AzulMarino, $t2Acabado, $v2Mate, $t3Talla, $v3L] = skuPreviewThreeWayFixture();

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $t1Color->id, 'valueId' => $v1AzulMarino->id],
        ['key' => 'row-1', 'typeId' => $t2Acabado->id, 'valueId' => $v2Mate->id],
        ['key' => 'row-2', 'typeId' => $t3Talla->id, 'valueId' => $v3L->id],
    ]);

    // Position order (Acabado=0, Talla=1, Color=2) is the ONLY reading producing this literal --
    // by-name, by-id/creation and by-submission each derive a different string (see the fixture's
    // own docblock table).
    expect($component->get('skuPreview'))->toBe('0002-Mate-L-azul-marino');

    $component->set('price', '19.99')->set('stock', '5')->call('saveVariant')->assertHasNoErrors();

    $variant = ProductVariant::where('product_id', $product->id)->firstOrFail();
    expect($variant->sku)->toBe('0002-Mate-L-azul-marino');
});

test('submission order does not affect the previewed SKU', function () {
    [$product, $t1Color, $v1AzulMarino, $t2Acabado, $v2Mate, $t3Talla, $v3L] = skuPreviewThreeWayFixture();

    // The SAME three values, submitted in reverse key order (T3, T1, T2) -- $combinationRows is a
    // PHP array whose insertion order IS the submission order, so this is a faithful reproduction
    // of a differently-ordered payload vector.
    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $t3Talla->id, 'valueId' => $v3L->id],
        ['key' => 'row-1', 'typeId' => $t1Color->id, 'valueId' => $v1AzulMarino->id],
        ['key' => 'row-2', 'typeId' => $t2Acabado->id, 'valueId' => $v2Mate->id],
    ]);

    expect($component->get('skuPreview'))->toBe('0002-Mate-L-azul-marino');
});

test('a submitted sku property does not exist on the component and the rendered form carries no sku control', function () {
    $product = Product::factory()->create(['sku' => '0001']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openCreateForm');

    // D-4.3/D-5: no public property named `sku` exists on this component at all -- there is
    // nothing to bind, so a forged `->set('sku', ...)` payload must fail exactly like setting any
    // other undeclared property.
    expect(fn () => $component->set('sku', '0001-HACKED'))
        ->toThrow(PublicPropertyNotFoundException::class);

    $html = $component->html();

    // No <input>/<select> named "sku", and no hidden input carrying a preview string -- the SKU is
    // rendered as read-only text, never posted back (D-4 point 3, D-5).
    expect($html)->not->toContain('name="sku"')
        ->and($html)->not->toContain("name='sku'");
});

test('casing is preserved in both directions in the previewed SKU', function () {
    // A single all-one-case assertion cannot fail against an implementation that upper-cases
    // everything (0029 FP14) -- "L" (already upper) and "azul marino" (already lower) must BOTH
    // survive unchanged.
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla, $l] = skuPreviewTestAttribute('Talla', 'L', typePosition: 0);
    [$color, $azulMarino] = skuPreviewTestAttribute('Color', 'azul marino', typePosition: 1);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $l->id],
        ['key' => 'row-1', 'typeId' => $color->id, 'valueId' => $azulMarino->id],
    ]);

    expect($component->get('skuPreview'))->toBe('0002-L-azul-marino');
});

test('an empty combination previews the placeholder, never a bare parent sku', function () {
    $product = Product::factory()->create(['sku' => '0003']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openCreateForm');

    expect($component->get('skuPreview'))->toBeNull();

    $html = $component->html();
    expect($html)->not->toContain('>0003<')
        ->and($html)->not->toContain('>0003-<');
});

test('after a successful create, the listed sku is re-read from the database rather than the previewed string', function () {
    // D-5 R2 / D-16(d): the SOLE test in this project proving this. An administrator opens the
    // builder; the option list is loaded from the attribute values at that moment. Between opening
    // the form and saving, another actor (or another tab) renames the attribute value directly in
    // the database -- 0029's own derivation always reads the value STRINGS back out of the
    // database at save time (V-10), so the stored SKU reflects the rename while a naive
    // implementation that reused the previewed string would not.
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $value] = skuPreviewTestAttribute('Talla', 'M');

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $value->id],
    ]);

    expect($component->get('skuPreview'))->toBe('0001-M');

    // The rename happens on a different route (0030's screen) between preview and save -- mutated
    // directly in the database, never through the component.
    $value->update(['value' => 'XL']);

    $component->set('price', '19.99')->set('stock', '5')->call('saveVariant')->assertHasNoErrors();

    $variant = ProductVariant::where('product_id', $product->id)->firstOrFail();

    // The STORED value reflects the rename ('0001-XL'), never the STALE preview the form showed
    // before the rename ('0001-M').
    expect($variant->sku)->toBe('0001-XL');

    $component->assertSee('0001-XL')->assertDontSee('0001-M');
});
