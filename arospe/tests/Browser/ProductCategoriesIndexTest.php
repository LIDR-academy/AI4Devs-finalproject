<?php

// Pest 4 browser tests for the product category management screen, per
// ai-spec/tasks/in-progress/0025-product-categories-ui.md's "Tests to perform" section, WRITTEN
// AGAINST THE ORIGINAL (pre-0070/0071) design -- a single `name` field, no language tabs, no
// per-language tab strip. Every "⚠️ Correction, 2026-08-30" block in the story file describes
// 0070/0071's later contract and is deliberately not applied here.
//
// Deliberately kept FLAT (tests/Browser/ProductCategoriesIndexTest.php, not a
// tests/Browser/ProductCategories/ subfolder), per the story file's own explicit note: 0071's D-9
// puts ITS browser file in the mirrored subfolder and lists this flat path as a further amendment
// to this story -- "not applied here ... flagged for a human, not silently changed." A testing
// convention decision belongs in a Phase 2 review, not to this dispatch.
//
// Written at TDD Phase 3 step 1 (red), before App\Livewire\ProductCategories\Index or
// routes/product-categories.php existed. Every test below is green against the shipped screen.
//
// SELECTOR STRATEGY, mirroring tests/Browser/UsersIndexTest.php's own established convention: the
// per-row edit/delete actions are icon-only and carry the story's own explicitly-named hooks
// (Acceptance Criteria) -- data-test="edit-product-category-{id}" / "delete-product-category-{id}".
// Pest's click() resolves an "@"-prefixed selector against [data-test=...]
// (vendor/pestphp/pest-plugin-browser/src/Support/GuessLocator.php), so row actions are targeted
// with click('@edit-product-category-'.$category->id) / click('@delete-product-category-'.$category->id).
// The "New category" opener and the modal's Save/Cancel/Delete-confirm controls carry real, visible
// text (matching every other screen in this app -- Users, Roles, Sales Regions), so they are
// targeted by text.

use App\Actions\ProductCategories\CreateProductCategory;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

function productCategoriesBrowserActor(): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);

    return $actor;
}

// Scenario: A catalog administrator opens the create form after a previous edit
test('opening the create form shows a blank field, with no stale prefill leaking from a previous edit', function () {
    $actor = productCategoriesBrowserActor();
    $this->actingAs($actor);

    $existing = app(CreateProductCategory::class)('Footwear');

    visit('/product-categories')
        ->assertNoJavaScriptErrors()
        ->click('@edit-product-category-'.$existing->id)
        ->assertNoJavaScriptErrors()
        ->assertValue('name', 'Footwear')
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->click('New category')
        ->assertNoJavaScriptErrors()
        ->assertValue('name', '');
});

// Scenario: A catalog administrator creates a product category from the screen
test('creating a category through a real fill and save round-trip adds it to the list with no javascript errors', function () {
    // The one test that proves wire:model actually delivers the typed value --
    // Livewire::test()->set() writes the property directly and never touches the DOM.
    $actor = productCategoriesBrowserActor();
    $this->actingAs($actor);

    visit('/product-categories')
        ->assertNoJavaScriptErrors()
        ->click('New category')
        ->assertNoJavaScriptErrors()
        ->fill('name', 'Outerwear')
        ->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertSee('Outerwear');

    expect(ProductCategory::where('name', 'Outerwear')->exists())->toBeTrue();
});

// Scenario: A catalog administrator renames a product category from the screen
test('editing prefills the name, and re-saving it unchanged preserves it', function () {
    $actor = productCategoriesBrowserActor();
    $this->actingAs($actor);

    $category = app(CreateProductCategory::class)('Footwear');

    visit('/product-categories')
        ->assertNoJavaScriptErrors()
        ->click('@edit-product-category-'.$category->id)
        ->assertNoJavaScriptErrors()
        ->assertValue('name', 'Footwear')
        ->click('Save')
        ->assertNoJavaScriptErrors();

    expect($category->fresh()->name)->toBe('Footwear');
});

// Scenario: A catalog administrator cancels the create form without saving
test('cancelling the create form adds nothing', function () {
    $actor = productCategoriesBrowserActor();
    $this->actingAs($actor);

    $countBefore = ProductCategory::count();

    visit('/product-categories')
        ->assertNoJavaScriptErrors()
        ->click('New category')
        ->assertNoJavaScriptErrors()
        ->fill('name', 'Should Not Persist')
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->assertDontSee('Should Not Persist');

    expect(ProductCategory::count())->toBe($countBefore);
});

// Scenario: A catalog administrator deletes an unused product category from the screen
test('deleting an unused category through the confirmation modal removes it from the list', function () {
    $actor = productCategoriesBrowserActor();
    $this->actingAs($actor);

    $category = app(CreateProductCategory::class)('Footwear');

    visit('/product-categories')
        ->assertNoJavaScriptErrors()
        ->assertSee('Footwear')
        ->click('@delete-product-category-'.$category->id)
        ->assertNoJavaScriptErrors()
        ->click('Delete Footwear')
        ->assertNoJavaScriptErrors()
        ->assertDontSee('Footwear');

    expect(ProductCategory::find($category->id))->toBeNull();
});

// Scenario: Deleting a product category still in use is blocked on the screen with a count
test('deleting a category still in use shows the blocked message inline, the category stays listed, with no javascript errors', function () {
    // The highest-value browser test in this story: only a real DOM render proves the
    // confirmation UI does not LOOK like it succeeded (closing, removing the row) while the
    // delete was actually refused server-side.
    $actor = productCategoriesBrowserActor();
    $this->actingAs($actor);

    $category = app(CreateProductCategory::class)('Calzado');
    Product::factory()->count(3)->create(['product_category_id' => $category->id]);

    visit('/product-categories')
        ->assertNoJavaScriptErrors()
        ->assertSee('Calzado')
        ->click('@delete-product-category-'.$category->id)
        ->assertNoJavaScriptErrors()
        ->click('Delete Calzado')
        ->assertNoJavaScriptErrors()
        ->assertSee(trans_choice('products.categories.delete_blocked', 3, ['count' => 3]))
        // Still listed -- the delete was refused, not silently completed.
        ->assertSee('Calzado');

    expect(ProductCategory::find($category->id))->not->toBeNull();
});

// Scenario: Creating a product category with a name already in the catalog is refused on the screen
test('creating a duplicate name through the real form shows the inline error', function () {
    // Proves the @error binding works in a real browser, not merely in the component's error bag.
    $actor = productCategoriesBrowserActor();
    $this->actingAs($actor);

    app(CreateProductCategory::class)('Footwear');

    visit('/product-categories')
        ->assertNoJavaScriptErrors()
        ->click('New category')
        ->assertNoJavaScriptErrors()
        ->fill('name', 'Footwear')
        ->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertSee(__('validation.unique', ['attribute' => 'name']));

    expect(ProductCategory::where('name', 'Footwear')->count())->toBe(1);
});

// Mandatory per test-quality-checklist.md: assertNoJavaScriptErrors() on every step of one
// continuous smoke pass, distinct from the behavior-specific tests above.
test('the product categories screen produces no javascript errors across one continuous smoke pass', function () {
    $actor = productCategoriesBrowserActor();
    $this->actingAs($actor);

    $category = app(CreateProductCategory::class)('Footwear');

    visit('/product-categories')
        ->assertNoJavaScriptErrors()
        ->click('New category')
        ->assertNoJavaScriptErrors()
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->click('@edit-product-category-'.$category->id)
        ->assertNoJavaScriptErrors()
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->click('@delete-product-category-'.$category->id)
        ->assertNoJavaScriptErrors()
        ->click('Cancel')
        ->assertNoJavaScriptErrors();
});
