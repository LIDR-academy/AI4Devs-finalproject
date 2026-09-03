<?php

// RED-phase (TDD Phase 3 step 1) component + route-authorization tests for the not-yet-built
// App\Livewire\ProductCategories\Index, per ai-spec/tasks/in-progress/0025-product-categories-ui.md's
// "Tests to perform" section, WRITTEN AGAINST THE ORIGINAL (pre-0070/0071) design: a single
// `public string $name` field on ProductCategory::name, per the coordinator's explicit framing
// for this dispatch. Every "⚠️ Correction, 2026-08-30" block inside the story file describes a
// LATER story's (0070/0071) contract and is deliberately NOT followed here.
//
// EVERY TEST IN THIS FILE IS EXPECTED TO FAIL. Neither App\Livewire\ProductCategories\Index nor
// routes/product-categories.php exist yet -- a fatal "class not found" / RouteNotFoundException is
// an acceptable red state for a not-yet-created Livewire component and route, per this dispatch's
// own framing. 0023's model/actions/policy/validation-trait ARE already shipped and are consumed
// as-is (no application code is written by this file).
//
// Mirrors tests/Feature/Users/IndexTest.php's two-part shape (Livewire::test() component
// assertions, then a dedicated Authorization block covering both the route and the component
// layer), and tests/Feature/ProductCategories/DeleteProductCategoryTest.php's decoy-category
// convention for every blocked-delete dataset case.

use App\Actions\ProductCategories\CreateProductCategory;
use App\Actions\ProductCategories\DeleteProductCategory;
use App\Actions\ProductCategories\RenameProductCategory;
use App\Livewire\ProductCategories\Index;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;
use Livewire\Features\SupportLockedProperties\CannotUpdateLockedPropertyException;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * An actor holding every products.* CRUD permission -- the default fixture for tests whose
 * subject is not authorization itself.
 *
 * @param  array<int, string>  $permissions
 */
function productCategoriesFullActor(array $permissions = ['products.view', 'products.create', 'products.edit', 'products.delete']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

// =====================================================================
// Listing
// =====================================================================

test('the list is ordered by name', function () {
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    // Created deliberately out of alphabetical order -- nothing in the schema enforces order
    // (no sort_order column), only the query does, silently.
    app(CreateProductCategory::class)('Zapatos');
    app(CreateProductCategory::class)('Abrigos');
    app(CreateProductCategory::class)('Mochilas');

    $names = collect(Livewire::test(Index::class)->get('productCategories'))
        ->pluck('name')
        ->filter(fn (string $name): bool => in_array($name, ['Zapatos', 'Abrigos', 'Mochilas'], true))
        ->values()
        ->all();

    expect($names)->toBe(['Abrigos', 'Mochilas', 'Zapatos']);
});

test('each row exposes exactly the id, name, productCount, canEdit and canDelete keys the view contract requires', function () {
    // Locks the view contract so a renamed or dropped key breaks here rather than silently in
    // the Blade -- mirrors tests/Feature/Users/IndexTest.php's identical row-shape test.
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    $category = app(CreateProductCategory::class)('Footwear');
    Product::factory()->count(2)->create(['product_category_id' => $category->id]);

    $rows = collect(Livewire::test(Index::class)->get('productCategories'));

    expect($rows->firstWhere('id', $category->id))->toBe([
        'id' => $category->id,
        'name' => 'Footwear',
        'productCount' => 2,
        'canEdit' => true,
        'canDelete' => true,
    ]);
});

// =====================================================================
// Create
// =====================================================================

test('submitting a new product category persists exactly one row and closes the modal', function () {
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    $countBefore = ProductCategory::count();

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Outerwear')
        ->call('save')
        ->assertHasNoErrors()
        ->assertSet('showModal', false);

    expect(ProductCategory::count())->toBe($countBefore + 1);
    expect(ProductCategory::where('name', 'Outerwear')->exists())->toBeTrue();
});

test('blank and whitespace-only names are refused and add no row', function (string $invalidName) {
    // Proves save() routes through the shared ProductCategoryValidationRules trait rather than
    // validating the raw wire:model value (0023 R-6, one layer up).
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    $countBefore = ProductCategory::count();

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', $invalidName)
        ->call('save')
        ->assertHasErrors(['name']);

    expect(ProductCategory::count())->toBe($countBefore);
})->with([
    'a blank name' => [''],
    'a name made only of whitespace' => ['   '],
]);

test('creating a product category with a name already in the catalog is refused on the name field', function () {
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    app(CreateProductCategory::class)('Footwear');

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Footwear')
        ->call('save')
        ->assertHasErrors(['name']);

    expect(ProductCategory::where('name', 'Footwear')->count())->toBe(1);
});

test('a case-only or accent-only duplicate name is refused on the name field', function (string $existingName, string $submittedDuplicate) {
    // A canary, not the full normalisation matrix: 0023's own suite proves case/accent folding
    // exhaustively at the action layer. This is the only test that would catch the component's
    // save() bypassing the shared trait and validating with a bare Rule::unique() that misses
    // the normalised comparison entirely.
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    app(CreateProductCategory::class)($existingName);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', $submittedDuplicate)
        ->call('save')
        ->assertHasErrors(['name']);

    expect(ProductCategory::count())->toBe(1);
})->with([
    'case-only duplicate' => ['Footwear', 'FOOTWEAR'],
    'accent-only duplicate' => ['Niño', 'Nino'],
]);

test('a name at the accepted length boundary is accepted, one character over is refused', function () {
    // One length-boundary canary, derived from the same 'max:255' constant 0023 uses.
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', str_repeat('A', 255))
        ->call('save')
        ->assertHasNoErrors();

    expect(ProductCategory::where('name', str_repeat('A', 255))->exists())->toBeTrue();

    $countBefore = ProductCategory::count();

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', str_repeat('B', 256))
        ->call('save')
        ->assertHasErrors(['name']);

    expect(ProductCategory::count())->toBe($countBefore);
});

// =====================================================================
// Rename
// =====================================================================

test('renaming a category to a free name updates the row', function () {
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    $category = app(CreateProductCategory::class)('Footwear');

    Livewire::test(Index::class)
        ->call('openEditModal', $category->id)
        ->set('name', 'Running shoes')
        ->call('save')
        ->assertHasNoErrors();

    expect($category->fresh()->name)->toBe('Running shoes');
});

test('saving a category under its own unchanged name is accepted', function () {
    // 0023's R-1 canary -- the ->ignore() id (below) is what makes this succeed rather than
    // colliding with itself.
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    $category = app(CreateProductCategory::class)('Footwear');

    Livewire::test(Index::class)
        ->call('openEditModal', $category->id)
        ->set('name', 'Footwear')
        ->call('save')
        ->assertHasNoErrors();

    expect($category->fresh()->name)->toBe('Footwear');
});

test('the id fed to Rule::unique ignore is server-authoritative and cannot be retargeted from the client', function () {
    // R-3: dropping #[Locked], or assigning the raw client argument instead of $target->id,
    // would silently turn the uniqueness check into a rename-any-category primitive. Asserts
    // the retarget attempt THROWS, never that it silently retargets $categoryB.
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    $categoryA = app(CreateProductCategory::class)('Footwear');
    $categoryB = app(CreateProductCategory::class)('Apparel');

    $component = Livewire::test(Index::class)->call('openEditModal', $categoryA->id);

    expect(fn () => $component->set('editingCategoryId', $categoryB->id))
        ->toThrow(CannotUpdateLockedPropertyException::class);
});

// =====================================================================
// Delete -- unused
// =====================================================================

test('deleting an unused category removes the row and it disappears from the reloaded list', function () {
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    $category = app(CreateProductCategory::class)('Footwear');

    $component = Livewire::test(Index::class)
        ->call('confirmDelete', $category->id)
        ->call('deleteProductCategory');

    expect(ProductCategory::find($category->id))->toBeNull();

    $ids = collect($component->get('productCategories'))->pluck('id');
    expect($ids)->not->toContain($category->id);
});

// =====================================================================
// Delete -- blocked (requires 0024 / 0024b, both shipped)
// =====================================================================

function productCategoriesFixtureWithProducts(int $n): ProductCategory
{
    $category = app(CreateProductCategory::class)('Calzado');
    Product::factory()->count($n)->create(['product_category_id' => $category->id]);

    // A decoy category with 5 products of its own -- without it, a global Product::count() and
    // a scoped count are indistinguishable, and the test cannot fail for the reason it exists
    // (0024's own explicit guidance, mirrored from DeleteProductCategoryTest.php).
    $decoy = app(CreateProductCategory::class)('Decoy');
    Product::factory()->count(5)->create(['product_category_id' => $decoy->id]);

    return $category->fresh();
}

test('deleting a category with N products surfaces an error on productCategoryId with the correct count, and the category survives', function (int $n) {
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    $category = productCategoriesFixtureWithProducts($n);

    Livewire::test(Index::class)
        ->call('confirmDelete', $category->id)
        ->call('deleteProductCategory')
        ->assertHasErrors(['productCategoryId'])
        ->assertSee(trans_choice('products.categories.delete_blocked', $n, ['count' => $n]));

    $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
})->with([1, 2, 12]);

test('the singular and plural forms differ', function () {
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    $one = productCategoriesFixtureWithProducts(1);
    $two = app(CreateProductCategory::class)('Calzado Dos');
    Product::factory()->count(2)->create(['product_category_id' => $two->id]);

    $oneComponent = Livewire::test(Index::class)
        ->call('confirmDelete', $one->id)
        ->call('deleteProductCategory');

    expect($oneComponent->html())->toContain('1 product')
        ->not->toContain('1 products');

    $twoComponent = Livewire::test(Index::class)
        ->call('confirmDelete', $two->id)
        ->call('deleteProductCategory');

    expect($twoComponent->html())->toContain('2 products');
});

test('draft products count towards the block', function () {
    // The likeliest implementation bug is a stray ->where('status', Active) filter.
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    $category = app(CreateProductCategory::class)('Calzado');
    Product::factory()->count(3)->draft()->create(['product_category_id' => $category->id]);

    Livewire::test(Index::class)
        ->call('confirmDelete', $category->id)
        ->call('deleteProductCategory')
        ->assertSee(trans_choice('products.categories.delete_blocked', 3, ['count' => 3]));

    $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
});

test('a Super Admin is refused identically to any other actor', function () {
    // The single most important test in this story: proves the block is a data-integrity rule
    // and not an authorization one. If the guard were ever routed through Gate, a Super Admin
    // could force-delete and orphan the referencing products.
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $category = productCategoriesFixtureWithProducts(12);

    Livewire::test(Index::class)
        ->call('confirmDelete', $category->id)
        ->call('deleteProductCategory')
        ->assertHasErrors(['productCategoryId'])
        ->assertSee(trans_choice('products.categories.delete_blocked', 12, ['count' => 12]));

    $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
});

test('calling delete twice in succession on the same in-use category is refused both times', function () {
    // No "confirmed" state accumulates.
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    $category = productCategoriesFixtureWithProducts(1);

    Livewire::test(Index::class)
        ->call('confirmDelete', $category->id)
        ->call('deleteProductCategory')
        ->assertHasErrors(['productCategoryId']);

    Livewire::test(Index::class)
        ->call('confirmDelete', $category->id)
        ->call('deleteProductCategory')
        ->assertHasErrors(['productCategoryId']);

    $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
});

// =====================================================================
// Authorization -- route layer
// =====================================================================
//
// The route is gated on a single ability (viewAny/products.view); create/update/delete have no
// route of their own -- every save()/deleteProductCategory() round-trip is a /livewire/update
// POST against the same route, so the "route layer" test is meaningful only for viewAny. The
// remaining three abilities are tested at the component layer below, mirroring the identical
// shape tests/Feature/Users/IndexTest.php and tests/Feature/SalesRegions/IndexTest.php already
// use for their own single-gated-route screens.

test('an administrator holding products.view can reach the product category screen', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('products.view');
    $this->actingAs($actor);

    $this->get(route('product-categories.index'))->assertOk();
});

test('an administrator without the products permission cannot reach the product category screen', function () {
    $actor = User::factory()->create();
    $this->actingAs($actor);

    $this->get(route('product-categories.index'))->assertForbidden();
});

// =====================================================================
// Authorization -- component layer
// =====================================================================

test('mounting the component directly is forbidden for an actor lacking products.view, even though route middleware never ran', function () {
    $this->withoutExceptionHandling();
    $actor = User::factory()->create();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class))->toThrow(AuthorizationException::class);
});

// Four gated methods per the story's corrected Phase 2 finding (openEditModal() and
// confirmDelete() gate exactly as App\Livewire\Users\Index's real, shipped openers do -- the
// story's own OQ-4 premise that they don't was checked against that real code and found false):
// save() (covering both the create and the update branch), deleteProductCategory(),
// openEditModal(), confirmDelete().

test('opening the create modal is forbidden for an actor lacking products.create', function () {
    $this->withoutExceptionHandling();
    $actor = User::factory()->create();
    $actor->givePermissionTo('products.view');
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('openCreateModal'))
        ->toThrow(AuthorizationException::class);
});

test('saving a new category is forbidden for an actor lacking products.create', function () {
    $this->withoutExceptionHandling();
    $actor = User::factory()->create();
    $actor->givePermissionTo('products.view');
    $this->actingAs($actor);

    $countBefore = ProductCategory::count();

    // set('name', ...) directly rather than via openCreateModal(), since that opener is itself
    // gated on 'create' above and would throw before save() is ever reached.
    expect(fn () => Livewire::test(Index::class)->set('name', 'Should Not Persist')->call('save'))
        ->toThrow(AuthorizationException::class);

    expect(ProductCategory::count())->toBe($countBefore);
});

test('opening the edit modal is forbidden for an actor lacking products.edit', function () {
    $this->withoutExceptionHandling();
    $creator = productCategoriesFullActor();
    $this->actingAs($creator);
    $target = app(CreateProductCategory::class)('Footwear');

    $deniedActor = User::factory()->create();
    $deniedActor->givePermissionTo('products.view');
    $this->actingAs($deniedActor);

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', $target->id))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->name)->toBe('Footwear');
});

test('renaming a category is re-checked inside save, not only at the opener', function () {
    $this->withoutExceptionHandling();
    // products.create is only for the fixture setup below; revoking products.edit mid-test still
    // proves save() re-checks 'update', not 'create'.
    $actor = productCategoriesFullActor(['products.view', 'products.create', 'products.edit']);
    $this->actingAs($actor);

    $target = app(CreateProductCategory::class)('Footwear');

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    // The permission is revoked AFTER the modal is already open, exactly the "revoked after
    // the screen loaded" scenario -- mirrors tests/Feature/Users/IndexTest.php's identical
    // re-check-inside-save test.
    $actor->revokePermissionTo('products.edit');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->set('name', 'Should Not Persist')->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->name)->not->toBe('Should Not Persist');
});

test('confirming delete is forbidden for an actor lacking products.delete', function () {
    $this->withoutExceptionHandling();
    // Fixture created by a separately-privileged actor, mirroring "opening the edit modal is
    // forbidden ..." above -- the denied actor below must hold nothing beyond products.view.
    $creator = productCategoriesFullActor();
    $this->actingAs($creator);
    $target = app(CreateProductCategory::class)('Footwear');

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.view');
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', $target->id))
        ->toThrow(AuthorizationException::class);

    expect(ProductCategory::find($target->id))->not->toBeNull();
});

test('deleting a category is re-checked inside deleteProductCategory, not only at confirmDelete', function () {
    $this->withoutExceptionHandling();
    // products.create is only for the fixture setup below; revoking products.delete mid-test
    // still proves deleteProductCategory() re-checks 'delete', not 'create'.
    $actor = productCategoriesFullActor(['products.view', 'products.create', 'products.delete']);
    $this->actingAs($actor);

    $target = app(CreateProductCategory::class)('Footwear');

    $component = Livewire::test(Index::class)->call('confirmDelete', $target->id);

    $actor->revokePermissionTo('products.delete');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('deleteProductCategory'))
        ->toThrow(AuthorizationException::class);

    expect(ProductCategory::find($target->id))->not->toBeNull();
});

test('a Super Admin holding zero permission rows passes viewAny, create and update via Gate before', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $target = app(CreateProductCategory::class)('Footwear');

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Super Admin Created')
        ->call('save')
        ->assertHasNoErrors();

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('name', 'Super Admin Renamed')
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->name)->toBe('Super Admin Renamed');
});

test('an actor holding only products.view sees every row action disabled', function () {
    // ONE global-state test, deliberately not a per-row matrix (D-5): every row answers
    // identically for a given actor, since ProductCategoryPolicy gates purely on the actor's
    // module permission with no target-dependent branch.
    // Fixtures created by a separately-privileged actor -- the viewer under test below must hold
    // nothing beyond products.view.
    $creator = productCategoriesFullActor();
    $this->actingAs($creator);
    app(CreateProductCategory::class)('Footwear');
    app(CreateProductCategory::class)('Apparel');

    $viewer = User::factory()->create();
    $viewer->givePermissionTo('products.view');
    $this->actingAs($viewer);

    $rows = collect(Livewire::test(Index::class)->get('productCategories'));

    expect($rows)->toHaveCount(2);
    $rows->each(fn (array $row) => expect($row)
        ->canEdit->toBeFalse()
        ->canDelete->toBeFalse());
});

// =====================================================================
// Authorization -- action layer (0025's own self-authorization hand-off, D-B2/R-6)
// =====================================================================
//
// app/Actions/ProductCategories/{Create,Rename,Delete}ProductCategory.php currently do NOT
// self-authorize (verified by reading all three) -- this story adds Gate::authorize() as the
// literal first statement of each __invoke(), via App\Actions\Auth\LogRefusedPrivilegedAttempt,
// matching App\Actions\Products\CreateProduct/DeleteProduct's shape exactly. These tests call the
// actions DIRECTLY, bypassing the component entirely, proving the gate is not only a
// component-layer convenience a non-HTTP caller (a queued job, an Artisan command) would miss.

test('creating a product category directly is forbidden for a denied actor', function () {
    $actor = User::factory()->create();
    $this->actingAs($actor);

    expect(fn () => app(CreateProductCategory::class)('Footwear'))
        ->toThrow(AuthorizationException::class);

    expect(ProductCategory::where('name', 'Footwear')->exists())->toBeFalse();
});

test('renaming a product category directly is forbidden for a denied actor', function () {
    $creator = productCategoriesFullActor();
    $this->actingAs($creator);
    $category = app(CreateProductCategory::class)('Footwear');

    $deniedActor = User::factory()->create();
    $this->actingAs($deniedActor);

    expect(fn () => app(RenameProductCategory::class)($category, 'Running shoes'))
        ->toThrow(AuthorizationException::class);

    expect($category->fresh()->name)->toBe('Footwear');
});

test('deleting a product category directly is forbidden for a denied actor', function () {
    $creator = productCategoriesFullActor();
    $this->actingAs($creator);
    $category = app(CreateProductCategory::class)('Footwear');

    $deniedActor = User::factory()->create();
    $this->actingAs($deniedActor);

    expect(fn () => app(DeleteProductCategory::class)($category))
        ->toThrow(AuthorizationException::class);

    expect(ProductCategory::find($category->id))->not->toBeNull();
});

test('a denied actor deleting an in-use category is refused by authorization, not by the in-use count leaking the total', function () {
    // 0024b D-B2 / R-6: the authorize() call must run BEFORE the in-use count check, never
    // after -- a reversed order would leak the product count to an actor who does not even
    // hold products.delete. Asserting AuthorizationException specifically (not
    // ValidationException) is what would catch a reversed ordering: a reversed guard would
    // throw ValidationException::withMessages(['productCategoryId' => '... used by 3
    // products ...']) instead, which this expectation does not match.
    $creator = productCategoriesFullActor();
    $this->actingAs($creator);
    $category = app(CreateProductCategory::class)('Calzado');
    Product::factory()->count(3)->create(['product_category_id' => $category->id]);

    $deniedActor = User::factory()->create();
    $deniedActor->givePermissionTo('products.view'); // holds enough to view, not to delete
    $this->actingAs($deniedActor);

    expect(fn () => app(DeleteProductCategory::class)($category->fresh()))
        ->toThrow(AuthorizationException::class);

    $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
});

// =====================================================================
// Malformed / unknown ids
// =====================================================================

test('opening the edit modal with an unknown category id fails cleanly with ModelNotFoundException', function () {
    $this->withoutExceptionHandling();
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', (string) Str::uuid7()))
        ->toThrow(ModelNotFoundException::class);
});

test('opening the edit modal with a malformed, non-UUID category id fails cleanly with ModelNotFoundException', function () {
    $this->withoutExceptionHandling();
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', 'not-a-uuid'))
        ->toThrow(ModelNotFoundException::class);
});

test('confirming delete with an unknown category id fails cleanly with ModelNotFoundException', function () {
    $this->withoutExceptionHandling();
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', (string) Str::uuid7()))
        ->toThrow(ModelNotFoundException::class);
});

test('confirming delete with a malformed, non-UUID category id fails cleanly with ModelNotFoundException', function () {
    $this->withoutExceptionHandling();
    $actor = productCategoriesFullActor();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', 'not-a-uuid'))
        ->toThrow(ModelNotFoundException::class);
});
