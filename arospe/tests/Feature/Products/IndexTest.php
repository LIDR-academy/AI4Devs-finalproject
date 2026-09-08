<?php

// Component + route-authorization tests for App\Livewire\Products\Index, per
// ai-spec/tasks/in-progress/0027-products-list-and-editor-ui.md's "Tests to perform" section,
// WRITTEN AGAINST THE ORIGINAL (pre-0076/0077 translatable-content-retrofit) contract: a scalar
// `products.name` column, no slug/SEO/language tabs. Every "⚠️ Correction, 2026-08-30" blockquote
// in the story file describes 0076/0077's later, unbuilt contract and is deliberately NOT applied
// here, per this dispatch's explicit instruction.
//
// Written at TDD Phase 3 step 1 (red), before App\Livewire\Products\Index or routes/products.php
// exist. Every test below is expected to fail red -- "class/route not found" style -- until
// frontend-expert implements the component next. 0024's model/actions/policy and 0026's region
// actions are already shipped and consumed as-is; nothing here writes application code.
//
// Mirrors tests/Feature/ProductCategories/IndexTest.php's shape (a full-permissions actor helper,
// component-level assertions via Livewire::test(), a route-layer authorization block). Markup-level
// assertions (badges, thumbnails, Flux/Blaze traps) live in IndexRenderingTest.php; the query shape
// itself lives in IndexQueryTest.php -- neither is duplicated here.

use App\Livewire\Products\Index;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * An actor holding every products.* CRUD permission -- the default fixture for tests whose subject
 * is not authorization itself.
 *
 * @param  array<int, string>  $permissions
 */
function productsIndexFullActor(array $permissions = ['products.view', 'products.create', 'products.edit', 'products.delete']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

// =====================================================================
// Route-layer authorization
// =====================================================================

test('the products list route resolves for a holder of products.view', function () {
    $actor = productsIndexFullActor(['products.view']);
    $this->actingAs($actor);

    $this->get(route('products.index'))->assertOk();
});

test('the products list route is refused (403) for an actor without products.view', function () {
    $actor = User::factory()->create();
    $this->actingAs($actor);

    $this->get(route('products.index'))->assertForbidden();
});

test('guests are redirected to the login page when visiting the products list', function () {
    $this->get(route('products.index'))->assertRedirect(route('login'));
});

// =====================================================================
// mount() authorization -- proven directly, not merely via the route 403 (an HTTP test and a
// Livewire::test() test are not substitutes for each other, per docs/testing/README.md).
// =====================================================================

test('mount() authorizes viewAny, proven by a direct Livewire::test() call as a denied actor', function () {
    $this->withoutExceptionHandling();
    $actor = User::factory()->create();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class))->toThrow(AuthorizationException::class);
});

test('mount() succeeds for an actor holding products.view, as the control', function () {
    $actor = productsIndexFullActor(['products.view']);
    $this->actingAs($actor);

    Livewire::test(Index::class)->assertOk();
});

// =====================================================================
// Listing
// =====================================================================

test('the list renders every product with its name, sku, price and stock', function () {
    $actor = productsIndexFullActor();
    $this->actingAs($actor);

    $product = Product::factory()->create([
        'name' => 'Zapatillas Runner Pro',
        'sku' => 'RNR-001',
        'price' => '119.95',
        'stock' => 42,
    ]);

    Livewire::test(Index::class)
        ->assertSee('Zapatillas Runner Pro')
        ->assertSee('RNR-001')
        ->assertSee('119.95')
        ->assertSee('42');
});

test('ordering is deterministic and asserted as an exact sequence, never toContain', function () {
    // D-4: orderBy('name')->orderBy('id') -- created deliberately out of alphabetical order, so
    // nothing but the query's own ORDER BY could produce the expected sequence.
    $actor = productsIndexFullActor();
    $this->actingAs($actor);

    Product::factory()->create(['name' => 'Zapatillas']);
    Product::factory()->create(['name' => 'Abrigos']);
    Product::factory()->create(['name' => 'Mochilas']);

    $names = collect(Livewire::test(Index::class)->get('products')->items())
        ->pluck('name')
        ->all();

    expect($names)->toBe(['Abrigos', 'Mochilas', 'Zapatillas']);
});

// =====================================================================
// Delete confirmation and deletion
// =====================================================================

test('confirmDelete() populates deletingProductName from the database, not from a row array', function () {
    $actor = productsIndexFullActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['name' => 'Runner Pro']);

    Livewire::test(Index::class)
        ->call('confirmDelete', $product->id)
        ->assertSet('deletingProductId', $product->id)
        ->assertSet('deletingProductName', 'Runner Pro')
        ->assertSet('showDeleteModal', true);
});

test('deleteProduct() authorizes delete first, and removes the row', function () {
    $actor = productsIndexFullActor();
    $this->actingAs($actor);

    $product = Product::factory()->create();

    Livewire::test(Index::class)
        ->call('confirmDelete', $product->id)
        ->call('deleteProduct')
        ->assertSet('showDeleteModal', false);

    expect(Product::find($product->id))->toBeNull();
});

test('confirmDelete() as a denied actor is refused and writes nothing', function () {
    // Appsec audit F-3: confirmDelete() is now gated on `delete` too (matching
    // App\Livewire\ProductCategories\Index::confirmDelete()'s precedent), since opening the
    // modal discloses the target row to an actor who may not be authorized to delete it.
    $this->withoutExceptionHandling();
    $creator = productsIndexFullActor();
    $this->actingAs($creator);
    $product = Product::factory()->create();

    $deniedActor = User::factory()->create();
    $deniedActor->givePermissionTo('products.view');
    $this->actingAs($deniedActor);

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', $product->id))
        ->toThrow(AuthorizationException::class);

    expect(Product::find($product->id))->not->toBeNull();
});

test('deleteProduct() as a denied actor writes nothing', function () {
    // deleteProduct() re-authorizes independently of confirmDelete()'s own check -- defence in
    // depth for the case a permission is revoked mid-session, between confirming and deleting.
    $this->withoutExceptionHandling();
    $actor = productsIndexFullActor(['products.view', 'products.delete']);
    $this->actingAs($actor);
    $product = Product::factory()->create();

    $component = Livewire::test(Index::class)->call('confirmDelete', $product->id);

    $actor->revokePermissionTo('products.delete');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('deleteProduct'))->toThrow(AuthorizationException::class);

    expect(Product::find($product->id))->not->toBeNull();
});

test('deleteProduct() fails closed when deletingProductId names a product deleted since confirmDelete() ran', function () {
    // A race, not a client-forged id: deletingProductId is #[Locked] and set only from
    // confirmDelete()'s own findOrFail(), so the only way it can name a nonexistent product at
    // deleteProduct() time is a real deletion landing in between -- the two-step race the story's
    // "fails closed" language describes.
    $this->withoutExceptionHandling();
    $actor = productsIndexFullActor();
    $this->actingAs($actor);

    $product = Product::factory()->create();

    $component = Livewire::test(Index::class)->call('confirmDelete', $product->id);

    Product::destroy($product->id);

    expect(fn () => $component->call('deleteProduct'))
        ->toThrow(ModelNotFoundException::class);
});

test('closeDeleteModal() clears both locked properties and the error bag', function () {
    $actor = productsIndexFullActor();
    $this->actingAs($actor);

    $product = Product::factory()->create();

    Livewire::test(Index::class)
        ->call('confirmDelete', $product->id)
        ->call('closeDeleteModal')
        ->assertSet('showDeleteModal', false)
        ->assertSet('deletingProductId', null)
        ->assertSet('deletingProductName', '')
        ->assertHasNoErrors();
});

test('confirmDelete() with an unknown product id fails cleanly with ModelNotFoundException', function () {
    $this->withoutExceptionHandling();
    $actor = productsIndexFullActor();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', (string) Str::uuid7()))
        ->toThrow(ModelNotFoundException::class);
});
