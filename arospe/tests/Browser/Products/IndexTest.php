<?php

// Pest 4 browser tests for the products list -- the list's real-DOM/JS-round-trip cases only, per
// ai-spec/tasks/in-progress/0027-products-list-and-editor-ui.md's "Tests to perform" section.
// Everything else (row content, badges, thumbnails, query shape, authorization) lives in
// tests/Feature/Products/{Index,IndexQuery,IndexRendering,ScreenAuthorization}Test.php.
//
// Written at TDD Phase 3 step 1 (red), before App\Livewire\Products\Index or routes/products.php
// exist.
//
// SELECTOR STRATEGY, mirroring tests/Browser/ProductCategoriesIndexTest.php and
// tests/Browser/UsersIndexTest.php: icon-only row actions carry data-test="edit-product-{id}" /
// "delete-product-{id}" hooks (present on both the enabled and disabled branch, per D-16), targeted
// with Pest's "@"-prefixed [data-test=...] shorthand; the "Nuevo producto" opener and modal controls
// carry real, visible text.

use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

function productsIndexBrowserActor(): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);

    return $actor;
}

test('clicking a rows edit action navigates to the editor url for that product', function () {
    $actor = productsIndexBrowserActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['name' => 'Runner Pro']);

    visit(route('products.index'))
        ->assertNoJavaScriptErrors()
        ->click('@edit-product-'.$product->id)
        ->assertNoJavaScriptErrors()
        ->assertUrlIs(route('products.edit', $product));
});

test('the delete confirmation modal opens, names the product, and cancelling leaves it in the list', function () {
    $actor = productsIndexBrowserActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['name' => 'Runner Pro']);

    visit(route('products.index'))
        ->assertNoJavaScriptErrors()
        ->assertSee('Runner Pro')
        ->click('@delete-product-'.$product->id)
        ->assertNoJavaScriptErrors()
        ->assertSee('Runner Pro')
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->assertSee('Runner Pro');

    expect(Product::find($product->id))->not->toBeNull();
});

test('a disabled row action does not respond to a click, and its tooltip shows on hover of the wrapper', function () {
    // errors-log.md, 2026-08-16: the disabled button itself is pointer-events-none, so a raw
    // ->click() on it either hangs on Playwright's own actionability check (the button is
    // structurally unreachable, see the SalesRegionsIndexTest.php/UsersIndexTest.php precedent
    // this test now mirrors) or -- worse -- never proves the row is inert at all. The established
    // pattern in this project is two-part: (1) hover the wrapping <ui-tooltip>, not the disabled
    // button, since pointer-events-none only blocks the button and the tooltip prop renders that
    // wrapper as what actually listens for the hover; (2) prove inertness with a page->script()
    // native .click() that bypasses Playwright's hit-testing entirely -- the disabled branch's
    // markup (resources/views/livewire/products.blade.php's delete-product-{id} @else branch)
    // never renders a wire:click attribute at all, so even a scripted click cannot reach the
    // server.
    $creator = productsIndexBrowserActor();
    $this->actingAs($creator);
    $product = Product::factory()->create();

    $viewer = User::factory()->create();
    $viewer->givePermissionTo('products.view');
    $this->actingAs($viewer);

    $page = visit(route('products.index'))
        ->assertNoJavaScriptErrors()
        ->hover('ui-tooltip:has([data-test="delete-product-'.$product->id.'"])')
        ->assertSee(__('products.index.action_not_allowed'))
        ->assertNoJavaScriptErrors();

    $page->script('document.querySelector(\'[data-test="delete-product-'.$product->id.'"]\').click();');

    expect(Product::find($product->id))->not->toBeNull();
});

test('the products list screen produces no javascript errors across one continuous smoke pass', function () {
    $actor = productsIndexBrowserActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['name' => 'Runner Pro']);

    visit(route('products.index'))
        ->assertNoJavaScriptErrors()
        ->click('@delete-product-'.$product->id)
        ->assertNoJavaScriptErrors()
        ->click('Cancel')
        ->assertNoJavaScriptErrors();
});
