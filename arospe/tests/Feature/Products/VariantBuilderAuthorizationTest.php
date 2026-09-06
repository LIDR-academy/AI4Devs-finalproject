<?php

// Story 0031, Phase 3 (TDD "red" step): App\Livewire\Products\VariantBuilder does not exist yet.
// D-10: every method that mutates or discloses authorizes `update` against the PARENT PRODUCT,
// defence in depth on top of 0029's own now-self-authorizing actions (D-12.1). Modelled on
// tests/Feature/Products/ScreenAuthorizationTest.php and
// tests/Feature/Products/ProductVariantAuthorizationTest.php.
//
// `generateCombinations()`'s own allow/deny pair is OUT OF SCOPE -- moved to 0031a with the rest of
// the generator UI.
//
// Every component is MOUNTED under a fully-privileged actor first, and the acting user is switched
// only immediately before the gated call under test. This sidesteps mount()'s own, still-unconfirmed
// ability (D-10's code sample authorizes 'view', which ProductPolicy does not currently define as a
// method -- OQ-1 is unresolved as of this file) without weakening any of the six methods' own
// allow/deny coverage, which is what this file exists to pin.

use App\Actions\Products\CreateProductVariant;
use App\Livewire\Products\VariantBuilder;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Gate;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    // frontend-expert correction (Phase 3): every allow/deny pair in this file expects a raw
    // AuthorizationException/ModelNotFoundException to propagate straight out of
    // Livewire::test()->call() -- without this, Laravel's exception handler converts it into an
    // HTTP-403-shaped component response instead, and expect(...)->toThrow(...) fails with "not
    // thrown" even though the gate DID refuse. Every existing allow/deny test file in this
    // codebase that asserts the identical pattern already calls this per-test
    // (tests/Feature/Products/IndexTest.php, ScreenAuthorizationTest.php,
    // AttributeTypeUsageCountTest.php) -- called once here, in beforeEach(), since every test in
    // this file needs it and a successful ("as the control") call is unaffected by it either way.
    $this->withoutExceptionHandling();

    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function variantAuthzActor(array $permissions = ['products.view', 'products.edit']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

/**
 * @return array{0: ProductAttributeType, 1: ProductAttributeValue}
 */
function variantAuthzAttribute(string $typeName, string $value): array
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
// openCreateForm
// =====================================================================

test('openCreateForm is refused for an actor lacking products.edit', function () {
    $creator = variantAuthzActor();
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $deniedActor = variantAuthzActor(['products.view']);
    $this->actingAs($deniedActor);

    expect(fn () => $component->call('openCreateForm'))->toThrow(AuthorizationException::class);
});

test('openCreateForm succeeds for an actor holding products.edit, as the control', function () {
    $actor = variantAuthzActor();
    $this->actingAs($actor);
    $product = Product::factory()->create(['sku' => '0001']);

    Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openCreateForm')
        ->assertHasNoErrors();
});

// =====================================================================
// openEditForm -- also DISCLOSES a variant's price/stock
// =====================================================================

test('openEditForm is refused for an actor lacking products.edit', function () {
    $creator = variantAuthzActor();
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantAuthzAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $deniedActor = variantAuthzActor(['products.view']);
    $this->actingAs($deniedActor);

    expect(fn () => $component->call('openEditForm', $variant->id))->toThrow(AuthorizationException::class);
});

test('openEditForm succeeds for an actor holding products.edit, as the control', function () {
    $actor = variantAuthzActor();
    $this->actingAs($actor);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantAuthzAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openEditForm', $variant->id)
        ->assertHasNoErrors();
});

// =====================================================================
// saveVariant
// =====================================================================

test('saveVariant is refused for an actor lacking products.edit, and writes no row', function () {
    $creator = variantAuthzActor();
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantAuthzAttribute('Talla', 'M');

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openCreateForm')
        ->set('combinationRows', [['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id]])
        ->set('price', '19.99')
        ->set('stock', '5');

    $deniedActor = variantAuthzActor(['products.view']);
    $this->actingAs($deniedActor);

    expect(fn () => $component->call('saveVariant'))->toThrow(AuthorizationException::class);

    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

test('saveVariant succeeds for an actor holding products.edit, as the control', function () {
    $actor = variantAuthzActor();
    $this->actingAs($actor);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantAuthzAttribute('Talla', 'M');

    Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openCreateForm')
        ->set('combinationRows', [['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id]])
        ->set('price', '19.99')
        ->set('stock', '5')
        ->call('saveVariant')
        ->assertHasNoErrors();

    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(1);
});

// =====================================================================
// confirmDelete -- DISCLOSES the target's label/sku
// =====================================================================

test('confirmDelete is refused for an actor lacking products.edit', function () {
    $creator = variantAuthzActor();
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantAuthzAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $deniedActor = variantAuthzActor(['products.view']);
    $this->actingAs($deniedActor);

    expect(fn () => $component->call('confirmDelete', $variant->id))->toThrow(AuthorizationException::class);
});

test('confirmDelete succeeds for an actor holding products.edit, as the control', function () {
    $actor = variantAuthzActor();
    $this->actingAs($actor);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantAuthzAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('confirmDelete', $variant->id)
        ->assertHasNoErrors();
});

// =====================================================================
// deleteVariant
// =====================================================================

test('deleteVariant is refused for an actor lacking products.edit, and the variant survives', function () {
    $creator = variantAuthzActor();
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantAuthzAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('confirmDelete', $variant->id);

    $deniedActor = variantAuthzActor(['products.view']);
    $this->actingAs($deniedActor);

    expect(fn () => $component->call('deleteVariant'))->toThrow(AuthorizationException::class);

    expect(ProductVariant::where('id', $variant->id)->exists())->toBeTrue();
});

test('deleteVariant succeeds for an actor holding products.edit, as the control', function () {
    $actor = variantAuthzActor();
    $this->actingAs($actor);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantAuthzAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('confirmDelete', $variant->id)
        ->call('deleteVariant');

    expect(ProductVariant::where('id', $variant->id)->exists())->toBeFalse();
});

// =====================================================================
// setVariantImage -- the #[On('variant-image-selected')] listener
// =====================================================================

test('setVariantImage is refused for an actor lacking products.edit', function () {
    $creator = variantAuthzActor();
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantAuthzAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openEditForm', $variant->id);

    $deniedActor = variantAuthzActor(['products.view']);
    $this->actingAs($deniedActor);

    expect(fn () => $component->call('setVariantImage', [['id' => 'irrelevant']]))
        ->toThrow(AuthorizationException::class);
});

test('setVariantImage succeeds for an actor holding products.edit, as the control', function () {
    $actor = variantAuthzActor();
    $this->actingAs($actor);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantAuthzAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openEditForm', $variant->id)
        ->call('setVariantImage', [['id' => 'irrelevant']])
        ->assertHasNoErrors();
});

// =====================================================================
// The cross-product target test -- exists only here (0029 has no component, 0027 has no variants).
// If deleteVariant() resolves its "parent product" from the component's OWN bound $productId rather
// than scoping the lookup through $this->product()->variants(), an actor editing product X's page
// could delete a variant belonging to an unrelated product Y. Modelled on D-1's embed-shape
// obligation ("re-reads the model with findOrFail() at the top of every method", the 0022 D6
// precedent applied verbatim) -- a variant id outside the component's own product scope must not
// resolve at all.
// =====================================================================

test('a variant belonging to another product cannot be deleted through this products builder', function () {
    $actor = variantAuthzActor();
    $this->actingAs($actor);

    $productX = Product::factory()->create(['sku' => '0001']);
    $productY = Product::factory()->create(['sku' => '0002']);
    [$typeX, $valueX] = variantAuthzAttribute('TallaX', 'M');
    [$typeY, $valueY] = variantAuthzAttribute('TallaY', 'S');

    app(CreateProductVariant::class)($productX, [$valueX->id], '19.99', 5);
    $variantY = app(CreateProductVariant::class)($productY, [$valueY->id], '29.99', 3);

    // Scoped to product X's own builder -- product Y's variant id is submitted as though it
    // belonged here.
    $component = Livewire::test(VariantBuilder::class, ['productId' => $productX->id]);

    expect(fn () => $component->call('confirmDelete', $variantY->id))
        ->toThrow(ModelNotFoundException::class);

    expect(ProductVariant::where('id', $variantY->id)->exists())->toBeTrue()
        ->and($variantY->fresh()->product_id)->toBe($productY->id);
});

// =====================================================================
// Super Admin bypass
// =====================================================================

test('a Super Admin actor holding zero permission rows passes every gated method', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantAuthzAttribute('Talla', 'M');

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openCreateForm')
        ->set('combinationRows', [['key' => 'row-0', 'typeId' => $talla->id, 'valueId' => $m->id]])
        ->set('price', '19.99')
        ->set('stock', '5')
        ->call('saveVariant')
        ->assertHasNoErrors();

    $variant = ProductVariant::where('product_id', $product->id)->firstOrFail();

    $component->call('openEditForm', $variant->id)
        ->call('setVariantImage', [['id' => 'irrelevant']])
        ->call('confirmDelete', $variant->id)
        ->call('deleteVariant');

    expect(ProductVariant::where('id', $variant->id)->exists())->toBeFalse();
});

// =====================================================================
// Permission-cache staleness: a revocation is reflected on a freshly resolved user, with no
// forgetCachedPermissions() call between the revoke and the assert -- Spatie's own model events
// invalidate the cache on write.
// =====================================================================

test('a revoked permission is reflected without an explicit cache flush between the act and the assert', function () {
    $actor = variantAuthzActor();
    $this->actingAs($actor);
    $product = Product::factory()->create(['sku' => '0001']);

    // Warmed true first.
    expect(Gate::allows('update', $product))->toBeTrue();

    $actor->revokePermissionTo('products.edit');

    $freshActor = $actor->fresh();
    $this->actingAs($freshActor);

    expect(fn () => Livewire::test(VariantBuilder::class, ['productId' => $product->id])->call('openCreateForm'))
        ->toThrow(AuthorizationException::class);
});

// =====================================================================
// Named exception classes everywhere -- never ->throws(Exception::class), which
// PermissionDoesNotExist (an unseeded catalog) would also satisfy (0029 FP6). Every allow/deny pair
// above already asserts a genuine AuthorizationException via ->toThrow(AuthorizationException::class),
// never a bare boolean Gate::allows() check -- this file adds no separate case for the rule, since
// a standalone test of Gate::forUser(...)->authorize(...) alone would exercise ProductPolicy
// directly and prove nothing about this component.
// =====================================================================
// The disabled-action UI hint comes from the SAME policy method the mutating paths authorize
// against, computed once -- never a per-row matrix (D-10 note 4).
// =====================================================================

test('canManageVariants reflects the same update ability every mutating method authorizes against', function () {
    $viewer = variantAuthzActor(['products.view']);
    $this->actingAs($viewer);
    $product = Product::factory()->create(['sku' => '0001']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    expect($component->get('canManageVariants'))->toBeFalse();

    $editor = variantAuthzActor();
    $this->actingAs($editor);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    expect($component->get('canManageVariants'))->toBeTrue();
});
