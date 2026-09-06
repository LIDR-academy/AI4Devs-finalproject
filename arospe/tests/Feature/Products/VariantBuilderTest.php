<?php

// Story 0031, Phase 3 (TDD "red" step): App\Livewire\Products\VariantBuilder does not exist yet.
// Orchestration: create/update/delete, the one-unsaved-variant invariant, and error-key routing
// (D-8's six-key table). 0029's CreateProductVariant/UpdateProductVariant/DeleteProductVariant and
// App\Concerns\ProductVariantValidationRules are already shipped and consumed as-is -- nothing here
// writes application code.
//
// Every SKU literal below is hand-written (FP-V2). Every refusal message is asserted via __()
// against the REAL, already-shipped 0029 lang keys (FP-V15) -- this story does not own or duplicate
// them (D-15).
//
// tests/Feature/Products/VariantBuilderGeneratorTest.php is explicitly OUT OF SCOPE (moved to
// 0031a, the 2026-09-06 split) -- no generator-related case appears in this file.

use App\Actions\Products\CreateProductVariant;
use App\Livewire\Products\VariantBuilder;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
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
function variantBuilderTestAttribute(string $typeName, string $value, int $typePosition = 0): array
{
    $type = ProductAttributeType::factory()->create(['name' => $typeName, 'position' => $typePosition]);
    $productAttributeValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => $value,
        'position' => 0,
    ]);

    return [$type, $productAttributeValue];
}

test('a full valid payload creates exactly one variant with exactly N pivot rows, price a quoted string', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantBuilderTestAttribute('Talla', 'M');
    [$color, $azul] = variantBuilderTestAttribute('Color', 'azul marino', typePosition: 1);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id],
        ['key' => 'row-1', 'typeId' => $color->id, 'valueId' => $azul->id],
    ])->set('price', '19.99')->set('stock', '5')
        ->call('saveVariant')
        ->assertHasNoErrors();

    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(1);

    $variant = ProductVariant::where('product_id', $product->id)->firstOrFail();

    // T12: price is a QUOTED STRING, never a float comparison.
    expect($variant->price)->toBe('19.99');

    $pivotCount = DB::table('product_variant_values')->where('product_variant_id', $variant->id)->count();
    expect($pivotCount)->toBe(2);
});

test('the price is pre-filled from the parent product on create', function () {
    $product = Product::factory()->create(['price' => '119.95']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openCreateForm');

    // decimal:2 already returns the STRING '119.95' -- byte-for-byte, never re-formatted.
    expect($component->get('price'))->toBe('119.95');
});

test('the price is pre-filled from the variant itself on edit, never re-applying the parents price', function () {
    $product = Product::factory()->create(['price' => '119.95', 'sku' => '0001']);
    [$talla, $m] = variantBuilderTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '75.00', 3);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openEditForm', $variant->id);

    expect($component->get('price'))->toBe('75.00');
});

test('a duplicate attribute combination is refused on the combination key and writes no new row or pivot row', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantBuilderTestAttribute('Talla', 'M');

    $existing = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id],
    ])->set('price', '25.00')->set('stock', '1')
        ->call('saveVariant')
        ->assertHasErrors(['combination']);

    // 0029 FP1: a variant-row count alone passes when the row rolled back but orphan pivot rows
    // survived -- assert both.
    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(1);
    $pivotCount = DB::table('product_variant_values')->where('product_variant_id', $existing->id)->count();
    expect($pivotCount)->toBe(1);
});

test('a combination whose derived sku another product already uses is refused on the sku key, naming the conflict', function () {
    Product::factory()->create(['sku' => '0001-M']);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantBuilderTestAttribute('Talla', 'M');

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id],
    ])->set('price', '19.99')->set('stock', '5')
        ->call('saveVariant')
        ->assertHasErrors(['sku']);

    expect($component->errors()->first('sku'))
        ->toBe(__('products.variants.derived_sku_taken', ['sku' => '0001-M']));

    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

test('when a duplicate combination and a sku collision both apply, the combination refusal wins', function () {
    // 0029 D-4.5's deliberate ordering (R-F): the duplicate-combination check runs BEFORE the
    // cross-table SKU check, so the clearer message wins when both are true.
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantBuilderTestAttribute('Talla', 'M');

    $existing = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);
    // A second product literally squats the SKU the (duplicate) combination would also derive.
    Product::factory()->create(['sku' => $existing->sku]);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id],
    ])->set('price', '19.99')->set('stock', '5')
        ->call('saveVariant')
        ->assertHasErrors(['combination'])
        ->assertHasNoErrors(['sku']);
});

test('an attribute value that reduces to an empty sku segment is refused on the sku key, writing zero rows', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [$type, $value] = variantBuilderTestAttribute('Simbolo', '★');

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $type->id, 'valueId' => $value->id],
    ])->set('price', '19.99')->set('stock', '5')
        ->call('saveVariant')
        ->assertHasErrors(['sku']);

    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
    expect(DB::table('product_variant_values')->count())->toBe(0);
});

test('a derived sku longer than the limit is refused on the sku key, writing zero rows', function () {
    $product = Product::factory()->create(['sku' => str_repeat('A', 60)]);
    [$type, $value] = variantBuilderTestAttribute('Descripcion', str_repeat('B', 70));

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $type->id, 'valueId' => $value->id],
    ])->set('price', '19.99')->set('stock', '5')
        ->call('saveVariant')
        ->assertHasErrors(['sku']);

    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
    expect(DB::table('product_variant_values')->count())->toBe(0);
});

test('the builder never holds more than one unsaved variant at a time', function () {
    // D-3's structural invariant: opening the create form a second time (e.g. the administrator
    // starts filling one combination, changes their mind, and clicks "add variant" again) must not
    // accumulate a second pending combination alongside the first -- there is exactly one in-flight
    // form.
    $product = Product::factory()->create(['sku' => '0001', 'price' => '50.00']);
    [$talla, $m] = variantBuilderTestAttribute('Talla', 'M');

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id],
    ])->set('price', '999.00');

    // Reopening the create form resets the in-flight state rather than layering a second pending
    // variant on top of the first -- price returns to the parent's prefill, never the partially
    // typed 999.00 from the abandoned attempt.
    $component->call('openCreateForm');

    expect($component->get('price'))->toBe('50.00');
    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

test('closeForm clears the error bag left by a refused save', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantBuilderTestAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id],
    ])->set('price', '25.00')->set('stock', '1')
        ->call('saveVariant')
        ->assertHasErrors(['combination']);

    $component->call('closeForm')->call('openCreateForm');

    $component->assertHasNoErrors();
});

test('deleting a variant removes its row and pivot rows, and the freed combination and sku are immediately re-creatable', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantBuilderTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);
    $variantId = $variant->id;

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->call('confirmDelete', $variantId)->call('deleteVariant');

    expect(ProductVariant::where('id', $variantId)->exists())->toBeFalse();
    expect(DB::table('product_variant_values')->where('product_variant_id', $variantId)->count())->toBe(0);

    // 0029 D-6: no SoftDeletes -- the identical combination and SKU can be built again immediately.
    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id],
    ])->set('price', '19.99')->set('stock', '5')
        ->call('saveVariant')
        ->assertHasNoErrors();

    $recreated = ProductVariant::where('product_id', $product->id)->firstOrFail();
    expect($recreated->sku)->toBe('0001-M');
});

test('confirmDelete populates the label and sku from the database, reflecting a change made after the list was first rendered', function () {
    // D-5 R3: a modal must read authoritative values from the model, never back them out of a
    // client-writable array -- the stale-rename trigger, not a tampering one. 0029 owns the actual
    // re-derivation cascade (out of scope here); this test only needs to prove confirmDelete()
    // re-reads the STORED row rather than trusting whatever the list last rendered.
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantBuilderTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    // Render the list once, so a component holding a stale, mount()-time array would already have
    // captured the OLD sku.
    $component->assertSee('0001-M');

    // Mutated directly in the database, simulating 0029's own re-derivation cascade having already
    // run on a different route (0030's screen) between the list render and the delete click.
    DB::table('product_variants')->where('id', $variant->id)->update(['sku' => '0001-XL']);

    $component->call('confirmDelete', $variant->id);

    $html = $component->html();
    expect($html)->toContain('0001-XL')
        ->and($html)->not->toContain('0001-M');
});

test('combination immutability is proven against the method, not only the markup', function () {
    // FP-V16: absent markup is not an absent method -- /livewire/update reaches saveVariant()
    // regardless of what renders, so a forced ->set() on an existing variant's combinationRows must
    // still leave the pivot, hash and sku untouched.
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantBuilderTestAttribute('Talla', 'M');
    [$color, $azul] = variantBuilderTestAttribute('Color', 'azul marino', typePosition: 1);
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $originalHash = $variant->combination_hash;
    $originalSku = $variant->sku;
    $originalValueIds = DB::table('product_variant_values')
        ->where('product_variant_id', $variant->id)
        ->pluck('product_attribute_value_id')
        ->sort()
        ->values()
        ->all();

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $component->call('openEditForm', $variant->id);

    // A combination change the markup never offers, forced directly through the wire protocol.
    $component->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $color->id, 'valueId' => $azul->id],
    ])->set('price', '29.99')->set('stock', '2')
        ->call('saveVariant')
        ->assertHasNoErrors();

    $fresh = $variant->fresh();
    expect($fresh->combination_hash)->toBe($originalHash)
        ->and($fresh->sku)->toBe($originalSku);

    $freshValueIds = DB::table('product_variant_values')
        ->where('product_variant_id', $variant->id)
        ->pluck('product_attribute_value_id')
        ->sort()
        ->values()
        ->all();

    expect($freshValueIds)->toBe($originalValueIds);

    // Price/stock, which ARE editable, did take effect.
    expect($fresh->price)->toBe('29.99')->and($fresh->stock)->toBe(2);
});
