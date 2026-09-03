<?php

// RED-phase (TDD Phase 3 step 1) view-level rendering tests for the not-yet-built
// App\Livewire\ProductCategories\Index / resources/views/livewire/product-categories.blade.php,
// per ai-spec/tasks/in-progress/0025-product-categories-ui.md's "Tests to perform" section,
// WRITTEN AGAINST THE ORIGINAL (pre-0070/0071) design -- a single `public string $name` field, no
// language tabs. Every "⚠️ Correction, 2026-08-30" block in the story file describes 0070/0071's
// later contract and is deliberately not applied here.
//
// EVERY TEST IN THIS FILE IS EXPECTED TO FAIL. Component logic, persistence, validation-rule
// enforcement and both authorization layers are already covered by
// tests/Feature/ProductCategories/IndexTest.php -- nothing here duplicates that. Every test below
// asserts against the RENDERED HTML (assertSee/assertDontSee/->html()), which that file never
// does directly (its own trans_choice() assertSee() calls are the one exception, kept there
// because they are inseparable from the "surfaces an error" assertion they sit beside).
//
// Mirrors tests/Feature/SalesRegions/IndexRenderingTest.php's shape and its own stated method:
// where the real markup does not exist yet, this file establishes the data-test hook / structural
// contract the not-yet-written Blade view must satisfy, adjustable here first if Phase 3 names a
// hook differently. The two hooks named explicitly in the story's own Acceptance Criteria --
// data-test="edit-product-category-{id}" / data-test="delete-product-category-{id}" -- are
// authoritative and used as-is; the empty-state hook below is this file's own contract.

use App\Actions\ProductCategories\CreateProductCategory;
use App\Livewire\ProductCategories\Index;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function productCategoriesIndexRenderingActor(array $permissions = ['products.view', 'products.create', 'products.edit', 'products.delete']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

test('the list renders each categorys name and its product count', function () {
    $actor = productCategoriesIndexRenderingActor();
    $this->actingAs($actor);

    $category = app(CreateProductCategory::class)('Footwear');
    Product::factory()->count(4)->create(['product_category_id' => $category->id]);

    Livewire::test(Index::class)
        ->assertSee('Footwear')
        ->assertSee('4');
});

test('the empty state renders when the catalog holds no categories', function () {
    $actor = productCategoriesIndexRenderingActor();
    $this->actingAs($actor);

    expect(ProductCategory::count())->toBe(0);

    $html = Livewire::test(Index::class)->html();

    // This file's own contract for the not-yet-built markup: a data-test hook, so the empty
    // state is selectable without depending on a specific translated string.
    expect($html)->toContain('data-test="product-categories-empty-state"');
});

test('the create and edit modal contains exactly one text input and no select markup', function () {
    // A cheap guard against a stray element copy-pasted in from the Users view, which has both
    // a role AND a status <select>. This story's modal has a single name field and no <select>
    // anywhere (per the story's own "runtime traps" section, trap 4).
    $actor = productCategoriesIndexRenderingActor();
    $this->actingAs($actor);

    $html = Livewire::test(Index::class)->call('openCreateModal')->html();

    expect(substr_count($html, '<input'))->toBe(1)
        ->and($html)->not->toContain('<select');
});

test('the blocked-delete message renders in the DOM with the correct singular digit', function () {
    $actor = productCategoriesIndexRenderingActor();
    $this->actingAs($actor);

    $category = app(CreateProductCategory::class)('Calzado');
    Product::factory()->create(['product_category_id' => $category->id]);

    Livewire::test(Index::class)
        ->call('confirmDelete', $category->id)
        ->call('deleteProductCategory')
        ->assertSee(trans_choice('products.categories.delete_blocked', 1, ['count' => 1]));
});

test('the blocked-delete message renders in the DOM with the correct plural digit', function () {
    $actor = productCategoriesIndexRenderingActor();
    $this->actingAs($actor);

    $category = app(CreateProductCategory::class)('Calzado');
    Product::factory()->count(12)->create(['product_category_id' => $category->id]);

    Livewire::test(Index::class)
        ->call('confirmDelete', $category->id)
        ->call('deleteProductCategory')
        ->assertSee(trans_choice('products.categories.delete_blocked', 12, ['count' => 12]));
});

test('a validation message appears next to the name field and the modal stays open', function () {
    // A test asserting only assertHasErrors() never proves the human actually sees the
    // sentence -- this asserts the rendered message text AND that the modal is still open.
    $actor = productCategoriesIndexRenderingActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', '')
        ->call('save')
        ->assertSee(__('validation.required', ['attribute' => 'name']))
        ->assertSet('showModal', true);
});
