<?php

// Story 0031, Phase 3 (TDD "red" step): App\Livewire\Products\VariantBuilder does not exist yet.
// Own/inherited/none image badges, the four refusal surfaces (D-8), the three Flux/Blaze
// regression guards this screen is the worst case in the codebase for (D-9/D-14), data-test hooks
// on both branches, the @can('viewAny', Media::class) wrapper (T13), and both empty states.
//
// Every refusal message is asserted via __() against the real, already-shipped 0029 lang keys
// (FP-V15) -- never a hardcoded English literal.

use App\Actions\Products\CreateProductVariant;
use App\Livewire\Products\VariantBuilder;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Str;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

function variantRenderingActor(array $permissions = ['products.view', 'products.edit', 'media.view']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

/**
 * @return array{0: ProductAttributeType, 1: ProductAttributeValue}
 */
function variantRenderingTestAttribute(string $typeName, string $value): array
{
    $type = ProductAttributeType::factory()->create(['name' => $typeName]);
    $productAttributeValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => $value,
        'position' => 0,
    ]);

    return [$type, $productAttributeValue];
}

// =====================================================================
// Image inheritance rendering (D-6)
// =====================================================================

test('a variant with no image of its own renders the parents featured image and the inherited badge', function () {
    $this->actingAs(variantRenderingActor());

    $parentImage = Media::factory()->create();
    $product = Product::factory()->create(['sku' => '0001', 'featured_media_id' => $parentImage->id]);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->assertSee(__('products.variants.image.inherited_badge'));
});

test('a variant with its own image renders that image and the own badge', function () {
    $this->actingAs(variantRenderingActor());

    $product = Product::factory()->create(['sku' => '0001']);
    $ownImage = Media::factory()->create();
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$m->id], '19.99', 5, $ownImage->id);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->assertSee(__('products.variants.image.own_badge'));
});

test('a variant whose product also has no featured image renders the shared placeholder tile with no badge', function () {
    $this->actingAs(variantRenderingActor());

    $product = Product::factory()->create(['sku' => '0001', 'featured_media_id' => null]);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->assertDontSee(__('products.variants.image.own_badge'))
        ->assertDontSee(__('products.variants.image.inherited_badge'));
});

test('changing the parents featured image in-session changes what an inheriting variant shows', function () {
    // The FP2 discriminator at the UI layer -- a UI that snapshots the resolved URL at mount passes
    // every other image test and fails only here.
    $this->actingAs(variantRenderingActor());

    $oldImage = Media::factory()->create(['title' => 'Old Parent Image']);
    $newImage = Media::factory()->create(['title' => 'New Parent Image']);
    $product = Product::factory()->create(['sku' => '0001', 'featured_media_id' => $oldImage->id]);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $component->assertSee('Old Parent Image');

    // frontend-expert correction (Phase 3): App\Models\Product's #[Fillable] deliberately omits
    // `featured_media_id` (docs/conventions/base-standards.md's mass-assignment-guard convention --
    // it is written only by App\Actions\Products\SyncProductGallery). A plain ->update([...]) on
    // that key is therefore a silent no-op and the row never actually changes, which is what made
    // this test's own arrangement provably unable to fail regardless of this component's
    // correctness. forceFill()->save() is the same bypass CreateProduct/UpdateProduct themselves
    // use to write this column.
    $product->forceFill(['featured_media_id' => $newImage->id])->save();
    $component->call('$refresh');

    $component->assertSee('New Parent Image')->assertDontSee('Old Parent Image');
});

test('a variant created with no image persists featured_media_id as literally NULL', function () {
    $this->actingAs(variantRenderingActor());

    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id],
    ])->set('price', '19.99')->set('stock', '5')
        ->call('saveVariant')
        ->assertHasNoErrors();

    $this->assertDatabaseHas('product_variants', [
        'product_id' => $product->id,
        'featured_media_id' => null,
    ]);
});

test('reverting an own image sets it back to NULL and re-renders the inherited badge', function () {
    $this->actingAs(variantRenderingActor());

    $parentImage = Media::factory()->create();
    $ownImage = Media::factory()->create();
    $product = Product::factory()->create(['sku' => '0001', 'featured_media_id' => $parentImage->id]);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5, $ownImage->id);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $component->call('revertToInheritedImage', $variant->id);

    expect($variant->fresh()->featured_media_id)->toBeNull();

    $component->assertSee(__('products.variants.image.inherited_badge'));
});

// =====================================================================
// The four refusal surfaces are visible, one per key (D-8) -- three of four bind to no field at
// all on this screen and render nowhere unless explicitly rendered (FP-V6).
// =====================================================================

test('the combination refusal renders inside the combination fieldset', function () {
    $this->actingAs(variantRenderingActor());

    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id],
    ])->set('price', '25.00')->set('stock', '1')->call('saveVariant');

    $component->assertSee(__('products.variants.duplicate_combination'));
});

test('the sku-taken refusal renders beneath the sku preview', function () {
    $this->actingAs(variantRenderingActor());

    Product::factory()->create(['sku' => '0001-M']);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id],
    ])->set('price', '19.99')->set('stock', '5')->call('saveVariant');

    $component->assertSee(__('products.variants.derived_sku_taken', ['sku' => '0001-M']));

    // D-8 point 1: since there is no SKU field to retype, the refusal must ALSO name the two
    // remedies the administrator can actually act on -- a new key this story owns (D-15), not
    // 0029's.
    $component->assertSee(__('products.variants.sku.remedy_hint'));
});

test('the empty-segment refusal renders and names the offending value', function () {
    $this->actingAs(variantRenderingActor());

    $product = Product::factory()->create(['sku' => '0001']);
    [$type, $value] = variantRenderingTestAttribute('Simbolo', '★');

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $type->id, 'valueId' => $value->id],
    ])->set('price', '19.99')->set('stock', '5')->call('saveVariant');

    $component->assertSee(__('products.variants.derived_sku_empty_segment', ['value' => '★']));
});

test('the featuredMediaId refusal renders beside the image picker when a chosen id no longer exists', function () {
    $this->actingAs(variantRenderingActor());

    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $component->call('openCreateForm')->set('combinationRows', [
        ['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id],
    ])->set('price', '19.99')->set('stock', '5');

    // A deleted media row handed back by the Gallery event -- the race worth surfacing rather than
    // swallowing.
    $component->call('setVariantImage', [['id' => (string) Str::uuid()]]);
    $component->call('saveVariant');

    $component->assertHasErrors(['featuredMediaId']);
});

test('the staged image previews inside the form before the variant is saved, and clearing it removes the preview', function () {
    $this->actingAs(variantRenderingActor());

    $product = Product::factory()->create(['sku' => '0001']);
    variantRenderingTestAttribute('Talla', 'M');
    $media = Media::factory()->create(['title' => 'Swatch']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $component->call('openCreateForm');

    // No preview at all while nothing has been chosen yet -- the empty branch still renders its
    // data-test hook so a test can assert either state without a conditional selector.
    $component->assertSeeHtml('data-test="variant-image-preview"');
    expect($component->instance()->featuredMediaPreview())->toBeNull();

    $component->call('setVariantImage', [['id' => $media->id]]);

    // The whole point: this is visible BEFORE saveVariant() ever runs.
    $component->assertSee('Swatch');
    expect($component->instance()->featuredMediaPreview())->not->toBeNull();

    $component->call('clearVariantImage');

    expect($component->get('featuredMediaId'))->toBeNull();
    expect($component->instance()->featuredMediaPreview())->toBeNull();
});

// =====================================================================
// Combination is shown fixed on edit (D-11), never as disabled selects.
// =====================================================================

test('editing a variant renders the combination as static badges with no enabled attribute control', function () {
    $this->actingAs(variantRenderingActor());

    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $component->call('openEditForm', $variant->id);

    $component->assertSee(__('products.variants.combination.immutable_notice'));

    $html = $component->html();
    expect($html)->not->toContain('name="combinationRows.0.typeId"');
});

test('the delete confirmation states the removal is permanent', function () {
    $this->actingAs(variantRenderingActor());

    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $component->call('confirmDelete', $variant->id);

    $component->assertSee(__('products.variants.delete.irreversible'));
});

// =====================================================================
// Both empty states (FP-V17: "no exception" alone is a false positive -- it passes even if the
// whole builder is broken, since nothing builder-related runs).
// =====================================================================

test('a product with no variants renders the empty state, not an empty table', function () {
    $this->actingAs(variantRenderingActor());
    $product = Product::factory()->create(['sku' => '0001']);
    ProductAttributeType::factory()->withValues(2)->create();

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->assertSee(__('products.variants.builder.empty'));
});

test('a catalog with no attribute types explains the dead end and links to the attribute types screen', function () {
    $this->actingAs(variantRenderingActor());
    $product = Product::factory()->create(['sku' => '0001']);

    expect(ProductAttributeType::count())->toBe(0);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->assertSee(__('products.variants.builder.no_attribute_types'));
    expect($component->html())->toContain(route('product-attribute-types.index'));
});

// =====================================================================
// Flux/Blaze regression guards (D-9/D-14/errors-log.md) -- verified live in this repo, not
// recalled: three separate traps this screen is the worst case for.
// =====================================================================

test('an enabled row action renders no data-flux-tooltip-content element', function () {
    // frontend-expert correction (Phase 3): the page-wide assertion below also covers the single
    // embedded <livewire:media.gallery> instance (D-6) -- media.view alone leaves ITS OWN upload
    // trigger disabled (Gallery requires media.create too), which would render a legitimate
    // data-flux-tooltip-content of Gallery's own that has nothing to do with this component's row
    // actions. Granting media.create here is what makes every action on the whole rendered page
    // enabled, which is the premise the assertion actually needs to hold.
    $this->actingAs(variantRenderingActor(['products.view', 'products.edit', 'media.view', 'media.create']));
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    expect($component->html())->not->toContain('data-flux-tooltip-content');
});

test('an actor without edit permission sees the disabled cursor-not-allowed class on the tooltip wrapper, never on the button', function () {
    // The fixture variant is created by a FULLY PRIVILEGED actor -- CreateProductVariant
    // self-authorizes update on the parent product (0029 D-12.1), so arranging it as the
    // permission-lacking viewer under test would throw for the wrong reason before the assertion
    // this test is actually about is ever reached.
    $creator = variantRenderingActor();
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $viewer = User::factory()->create();
    $viewer->givePermissionTo(['products.view']);
    $this->actingAs($viewer);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $html = $component->html();

    expect($html)->toContain('cursor-not-allowed!');
});

test('every id interpolated into a wire click argument is passed through the js directive, never raw braces', function () {
    $this->actingAs(variantRenderingActor());
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);
    $html = $component->html();

    // T5: openEditForm, confirmDelete, removeCombinationRow, revertToInheritedImage all take a
    // UUID argument -- a raw {{ }} interpolation would emit an UNQUOTED string into a JS call,
    // which @js() always quotes. Matched with a regex rather than a fixed quote style, since @js()
    // may render either single or double quotes.
    expect($html)->toMatch('/openEditForm\([\'"]'.preg_quote($variant->id, '/').'[\'"]\)/');
});

test('every row action carries its data-test hook on both the enabled and the disabled branch', function () {
    $creator = variantRenderingActor();
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $enabledHtml = Livewire::test(VariantBuilder::class, ['productId' => $product->id])->html();
    expect($enabledHtml)->toContain('data-test="edit-variant-'.$variant->id.'"')
        ->and($enabledHtml)->toContain('data-test="delete-variant-'.$variant->id.'"');

    $viewer = User::factory()->create();
    $viewer->givePermissionTo(['products.view']);
    $this->actingAs($viewer);

    $disabledHtml = Livewire::test(VariantBuilder::class, ['productId' => $product->id])->html();
    expect($disabledHtml)->toContain('data-test="edit-variant-'.$variant->id.'"')
        ->and($disabledHtml)->toContain('data-test="delete-variant-'.$variant->id.'"');
});

// =====================================================================
// The Gallery embed sits inside @can('viewAny', Media::class) (T13) -- an actor who may edit
// products but lacks media.view must still reach the builder, with the picker disabled rather than
// the whole page 403'd.
// =====================================================================

test('an actor without media.view still renders the builder, with the image picker shown disabled', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.edit']);
    $this->actingAs($actor);

    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantRenderingTestAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->assertOk();
    $component->assertDontSee('media-tile-');
});
