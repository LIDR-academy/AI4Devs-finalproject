<?php

// The largest file: App\Livewire\Products\Editor's save orchestration, per
// ai-spec/tasks/in-progress/0027-products-list-and-editor-ui.md's "Tests to perform" section.
// WRITTEN AGAINST THE ORIGINAL (pre-0076/0077) contract: a scalar `name`/`description`, no
// language tabs, no slug/SEO fields. Every "⚠️ Correction, 2026-08-30" blockquote in the story file
// is deliberately NOT applied here.
//
// Written at TDD Phase 3 step 1 (red), before App\Livewire\Products\Editor exists. 0024's
// CreateProduct/UpdateProduct/SyncProductGallery and 0026's SyncProductSalesRegions/
// SearchSalesRegions are already shipped and consumed as-is -- nothing here writes application
// code.
//
// D-5 (Phase 3 verification item, per this dispatch's brief): Editor::$status is assumed
// STRING-typed (`public string $status = ProductStatus::Draft->value;`), following
// App\Livewire\Users\Index::$status's precedent (task 0015 finding F8 -- Livewire's EnumSynth
// hydrates a forged backing value into a \ValueError BEFORE validation runs). Every assertion
// below reads/writes $status as a plain string.
//
// Error-bag keys throughout match the component's own camelCase property names (productCategoryId,
// featuredMediaId, regionIds, ...), per D-12's own save() code sample, which composes
// productRules()'s per-field methods keyed by those exact property names -- never the snake_case DB
// column names ProductValidationRules' own aggregate productRules() uses internally.

use App\Actions\Products\SyncProductSalesRegions;
use App\Livewire\Products\Editor;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SalesRegion;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Livewire\Features\SupportLockedProperties\CannotUpdateLockedPropertyException;
use Livewire\Features\SupportTesting\Testable;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function productsEditorFullActor(array $permissions = ['products.view', 'products.create', 'products.edit', 'products.delete']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

/**
 * A valid, complete Editor form payload -- every field D-5's never-null rule covers is filled with
 * a real value, never null.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function editorValidPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Zapatillas Runner Pro',
        'sku' => 'RNR-'.Str::random(10),
        'productCategoryId' => ProductCategory::factory()->create()->id,
        'type' => 'physical',
        'status' => 'active',
        'price' => '119.95',
        'stock' => '42',
        'description' => '<p>A test description.</p>',
        'regionIds' => [],
    ], $overrides);
}

/**
 * @param  Testable  $component
 * @param  array<string, mixed>  $payload
 */
function fillEditorForm($component, array $payload)
{
    foreach ($payload as $field => $value) {
        $component->set($field, $value);
    }

    return $component;
}

// =====================================================================
// Create path
// =====================================================================

test('a full valid payload creates exactly one product carrying every submitted value', function () {
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $category = ProductCategory::factory()->create();
    $sku = 'RNR-'.Str::random(10);

    $component = fillEditorForm(Livewire::test(Editor::class), editorValidPayload([
        'productCategoryId' => $category->id,
        'sku' => $sku,
        'price' => '119.95',
    ]));

    // F-2 (code-reviewer, story 0027 Phase 5 review): the story's acceptance criteria explicitly
    // require "a successful save redirects rather than resetting the form in place" -- pinned here
    // at the Feature-test level, the layer this kind of assertion normally lives at in this repo
    // (the browser-level EditorJourneyTest.php also asserts it via assertUrlIs(), per frontend-
    // expert's F-1 fix -- this is the redundant, faster-running layer, not a duplicate of intent).
    $component->call('save')
        ->assertHasNoErrors()
        ->assertRedirect(route('products.index'));

    expect(Product::count())->toBe(1);

    $product = Product::where('sku', $sku)->firstOrFail();

    expect($product->name)->toBe('Zapatillas Runner Pro')
        ->and($product->product_category_id)->toBe($category->id)
        ->and($product->type->value)->toBe('physical')
        ->and($product->status->value)->toBe('active')
        // R-4: price casts to a STRING, never a float -- toBe('119.95') would silently coerce a
        // numeric comparison and hide a precision regression.
        ->and($product->price)->toBe('119.95')
        ->and($product->stock)->toBe(42);
});

test('saving without a type writes zero rows and reports an error on the type field', function () {
    // 0024's most load-bearing invariant (D-5): no fallback is ever applied.
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $component = fillEditorForm(Livewire::test(Editor::class), editorValidPayload(['type' => '']));

    $component->call('save')->assertHasErrors(['type']);

    expect(Product::count())->toBe(0);
});

test('saving without a category writes zero rows', function () {
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $component = fillEditorForm(Livewire::test(Editor::class), editorValidPayload(['productCategoryId' => '']));

    $component->call('save')->assertHasErrors(['productCategoryId']);

    expect(Product::count())->toBe(0);
});

test('saving with an unknown category id writes zero rows', function () {
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $component = fillEditorForm(Livewire::test(Editor::class), editorValidPayload([
        'productCategoryId' => (string) Str::uuid7(),
    ]));

    $component->call('save')->assertHasErrors(['productCategoryId']);

    expect(Product::count())->toBe(0);
});

test('a duplicate sku is refused with the error on the sku field', function () {
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    Product::factory()->create(['sku' => 'RNR-001']);

    $component = fillEditorForm(Livewire::test(Editor::class), editorValidPayload(['sku' => 'RNR-001']));

    $component->call('save')->assertHasErrors(['sku']);

    expect(Product::where('sku', 'RNR-001')->count())->toBe(1);
});

test('the sku round-trips through the component in its canonical, upper-cased and trimmed form', function () {
    // Proves the component routes into 0024's canonicalisation rather than re-implementing it.
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $component = fillEditorForm(Livewire::test(Editor::class), editorValidPayload(['sku' => '  rnr-002  ']));

    $component->call('save')->assertHasNoErrors();

    expect(Product::where('sku', 'RNR-002')->exists())->toBeTrue();
});

test('a price with three decimals is refused', function () {
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $component = fillEditorForm(Livewire::test(Editor::class), editorValidPayload(['price' => '19.999']));

    $component->call('save')->assertHasErrors(['price']);

    expect(Product::count())->toBe(0);
});

test('negative stock is refused', function () {
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $component = fillEditorForm(Livewire::test(Editor::class), editorValidPayload(['stock' => '-1']));

    $component->call('save')->assertHasErrors(['stock']);

    expect(Product::count())->toBe(0);
});

// =====================================================================
// Edit path
// =====================================================================

test('opening an existing product populates every field from the database', function () {
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $product = Product::factory()->active()->create([
        'name' => 'Runner Pro',
        'sku' => 'RNR-001',
        'price' => '99.00',
        'stock' => 7,
        'description' => '<p>Stored description.</p>',
    ]);

    Livewire::test(Editor::class, ['product' => $product])
        ->assertSet('productId', $product->id)
        ->assertSet('name', 'Runner Pro')
        ->assertSet('sku', 'RNR-001')
        ->assertSet('productCategoryId', $product->product_category_id)
        ->assertSet('type', $product->type->value)
        ->assertSet('status', $product->status->value)
        ->assertSet('price', '99.00')
        ->assertSet('stock', '7')
        ->assertSet('description', '<p>Stored description.</p>');
});

test('saving a product under its own unchanged sku is accepted', function () {
    // The ->ignore() test -- 0024 R-15 / 0023 R-1 both rate the omission the single likeliest bug.
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['sku' => 'RNR-001']);

    $component = fillEditorForm(
        Livewire::test(Editor::class, ['product' => $product]),
        editorValidPayload(['sku' => 'RNR-001', 'productCategoryId' => $product->product_category_id]),
    );

    // F-2 (code-reviewer, story 0027 Phase 5 review): pins the redirect criterion on the update
    // path too, matching the create-path assertion above -- see that test's comment for why this
    // lives at the Feature level alongside the browser-level assertUrlIs() check.
    $component->call('save')
        ->assertHasNoErrors()
        ->assertRedirect(route('products.index'));

    expect($product->fresh()->sku)->toBe('RNR-001');
});

test('the retarget attempt on productId throws rather than silently renaming another product', function () {
    // #[Locked] plus assignment from $product->id (never a client argument) is what prevents a
    // crafted payload from renaming a different product. This test pins the pair.
    $this->withoutExceptionHandling();
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $productA = Product::factory()->create();
    $productB = Product::factory()->create();

    $component = Livewire::test(Editor::class, ['product' => $productA]);

    expect(fn () => $component->set('productId', $productB->id))
        ->toThrow(CannotUpdateLockedPropertyException::class);
});

// =====================================================================
// Orchestration -- the tests only this story can write
// =====================================================================

test('a stale region id refuses the whole save with zero database writes', function () {
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $regionA = SalesRegion::factory()->create();
    $regionB = SalesRegion::factory()->create();

    $product = Product::factory()->create(['name' => 'Original Name', 'price' => '10.00']);
    $product->salesRegions()->sync([$regionA->id]);

    $regionBId = $regionB->id;
    $regionB->delete();

    $component = fillEditorForm(
        Livewire::test(Editor::class, ['product' => $product]),
        editorValidPayload([
            'name' => 'Should Not Persist',
            'sku' => $product->sku,
            'productCategoryId' => $product->product_category_id,
            'regionIds' => [$regionA->id, $regionBId],
        ]),
    );

    $component->call('save')->assertHasErrors();

    $fresh = $product->fresh();
    expect($fresh->name)->toBe('Original Name')
        ->and($fresh->price)->toBe('10.00')
        ->and($fresh->salesRegions->pluck('id')->all())->toBe([$regionA->id]);
});

test('a since-deactivated preserved region does not block the save', function () {
    // D-11 resolution / 0026 D12: the exemption applies only to ids the product ALREADY carries.
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $region = SalesRegion::factory()->create();
    $product = Product::factory()->create(['price' => '10.00']);
    $product->salesRegions()->sync([$region->id]);

    $region->update(['is_active' => false]);

    $component = fillEditorForm(
        Livewire::test(Editor::class, ['product' => $product]),
        editorValidPayload([
            'name' => $product->name,
            'sku' => $product->sku,
            'productCategoryId' => $product->product_category_id,
            'price' => '25.00',
            'regionIds' => [$region->id],
        ]),
    );

    $component->call('save')->assertHasNoErrors();

    $fresh = $product->fresh();
    expect($fresh->price)->toBe('25.00')
        ->and($fresh->salesRegions->pluck('id')->all())->toBe([$region->id]);
});

test('a since-deactivated region that is newly added is still refused', function () {
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $region = SalesRegion::factory()->inactive()->create();
    $product = Product::factory()->create(['price' => '10.00']);

    expect($product->salesRegions()->count())->toBe(0);

    $component = fillEditorForm(
        Livewire::test(Editor::class, ['product' => $product]),
        editorValidPayload([
            'name' => $product->name,
            'sku' => $product->sku,
            'productCategoryId' => $product->product_category_id,
            'regionIds' => [$region->id],
        ]),
    );

    $component->call('save')->assertHasErrors();

    $fresh = $product->fresh();
    expect($fresh->price)->toBe('10.00')
        ->and($fresh->salesRegions->count())->toBe(0);
});

test('the preserved region set cannot be supplied by the client', function () {
    // 0026 D12 constraint 2 / revert-check #11: a crafted payload naming a deactivated,
    // never-assigned region as though it were pre-existing is still refused -- $preserved is read
    // from $product->salesRegions server-side, never from the request.
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $neverAssigned = SalesRegion::factory()->inactive()->create();
    $product = Product::factory()->create();

    expect($product->salesRegions()->count())->toBe(0);

    $component = fillEditorForm(
        Livewire::test(Editor::class, ['product' => $product]),
        editorValidPayload([
            'name' => $product->name,
            'sku' => $product->sku,
            'productCategoryId' => $product->product_category_id,
            'regionIds' => [$neverAssigned->id],
        ]),
    );

    $component->call('save')->assertHasErrors();

    expect($product->fresh()->salesRegions->count())->toBe(0);
});

test('a create submitting a deactivated region is refused exactly as before 0026 D12', function () {
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $region = SalesRegion::factory()->inactive()->create();

    $component = fillEditorForm(Livewire::test(Editor::class), editorValidPayload([
        'regionIds' => [$region->id],
    ]));

    $component->call('save')->assertHasErrors();

    expect(Product::count())->toBe(0);
});

test('an oversized regionIds submission issues zero sales_regions existence queries', function () {
    // Obligation 7 / 0026 hand-off item 5 / D-12(b2), measured in
    // docs/security/array-validation-bounds.md: the two-pass shape throws at 0 queries; the
    // combined single-validate() shape pays one query per submitted id before max:254 is
    // consulted. This test is the whole point of the two-call shape and cannot be replaced by a
    // functional one -- a combined validate() refuses the same submission with the same visible
    // outcome while issuing hundreds of queries first.
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $oversized = array_map(fn () => (string) Str::uuid7(), range(1, 300));

    $component = fillEditorForm(Livewire::test(Editor::class), editorValidPayload([
        'regionIds' => $oversized,
    ]));

    $salesRegionQueries = 0;
    DB::listen(function ($query) use (&$salesRegionQueries): void {
        if (str_contains($query->sql, 'sales_regions')) {
            $salesRegionQueries++;
        }
    });

    $component->call('save')->assertHasErrors();

    expect($salesRegionQueries)->toBe(0);
    expect(Product::count())->toBe(0);
});

test('a legal 254-id regionIds submission still validates every element', function () {
    // The positive-case pair to the oversized-submission test above: proves the size guard cannot
    // be satisfied by simply never running the element rules.
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $regions = SalesRegion::factory()->count(254)->create();
    $ids = $regions->pluck('id')->all();

    $component = fillEditorForm(Livewire::test(Editor::class), editorValidPayload([
        'regionIds' => $ids,
    ]));

    $salesRegionQueries = 0;
    DB::listen(function ($query) use (&$salesRegionQueries): void {
        if (str_contains($query->sql, 'sales_regions')) {
            $salesRegionQueries++;
        }
    });

    $component->call('save');

    expect($salesRegionQueries)->toBeGreaterThan(0);
});

test('a save that fails mid-flight leaves nothing partially written', function () {
    // The single DB::transaction() of D-12b / 0026 D13, exercised by forcing
    // SyncProductSalesRegions to throw on a save that also changes name, the featured image and
    // the gallery order.
    $actor = productsEditorFullActor(['products.view', 'products.create', 'products.edit', 'products.delete', 'media.view']);
    $this->actingAs($actor);

    $originalFeatured = Media::factory()->create();
    $newFeatured = Media::factory()->create();
    $region = SalesRegion::factory()->create();

    $product = Product::factory()->create([
        'name' => 'Original Name',
        'featured_media_id' => $originalFeatured->id,
    ]);
    $product->salesRegions()->sync([$region->id]);

    $this->mock(SyncProductSalesRegions::class, function ($mock): void {
        $mock->shouldReceive('__invoke')->andThrow(new RuntimeException('forced failure'));
    });

    $component = fillEditorForm(
        Livewire::test(Editor::class, ['product' => $product]),
        editorValidPayload([
            'name' => 'Should Not Persist',
            'sku' => $product->sku,
            'productCategoryId' => $product->product_category_id,
            'regionIds' => [$region->id],
        ]),
    );

    // featuredMediaId is #[Locked] -- driven through setFeaturedImage(), the #[On] handler a real
    // Gallery confirmation dispatches into, never a direct ->set().
    $component->call('setFeaturedImage', [['id' => $newFeatured->id, 'title' => 'New Featured']]);

    $caught = null;

    try {
        $component->call('save');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull();

    $fresh = $product->fresh();
    expect($fresh->name)->toBe('Original Name')
        ->and($fresh->featured_media_id)->toBe($originalFeatured->id)
        ->and($fresh->salesRegions->pluck('id')->all())->toBe([$region->id]);
});

test('a validation exception never travels through an open transaction', function () {
    $actor = productsEditorFullActor();
    $this->actingAs($actor);

    $component = fillEditorForm(Livewire::test(Editor::class), editorValidPayload(['name' => '']));

    $writeQueries = 0;
    DB::listen(function ($query) use (&$writeQueries): void {
        if (preg_match('/^(insert|update|delete)\b/i', trim($query->sql)) === 1) {
            $writeQueries++;
        }
    });

    $component->call('save')->assertHasErrors(['name']);

    expect($writeQueries)->toBe(0);
    expect(Product::count())->toBe(0);
});

test('setting a featured image does not change the product_media pivot row count', function () {
    // 0024 D-9 independence, re-asserted at this story's integration layer.
    $actor = productsEditorFullActor(['products.view', 'products.create', 'products.edit', 'products.delete', 'media.view']);
    $this->actingAs($actor);

    $product = Product::factory()->withGallery(2)->create();
    $newFeatured = Media::factory()->create();

    $pivotCountBefore = DB::table('product_media')->where('product_id', $product->id)->count();

    // The product's own existing name/sku/category/type/price/stock are already valid (mount()
    // populated them from the database) -- only featuredMediaId is changed here, through
    // setFeaturedImage() since the property is #[Locked] and cannot be ->set() directly.
    $component = Livewire::test(Editor::class, ['product' => $product])
        ->call('setFeaturedImage', [['id' => $newFeatured->id, 'title' => 'New Featured']]);

    $component->call('save')->assertHasNoErrors();

    $pivotCountAfter = DB::table('product_media')->where('product_id', $product->id)->count();

    expect($pivotCountAfter)->toBe($pivotCountBefore);
});

test('the gallery strips array order is persisted as the 0-based position, and survives a fresh mount', function () {
    // D-9a / 0024 D-17b -- asserted as an exact [0, 1, 2] sequence mapped to the expected media
    // ids, never toContain.
    $actor = productsEditorFullActor(['products.view', 'products.create', 'products.edit', 'products.delete', 'media.view']);
    $this->actingAs($actor);

    $mediaA = Media::factory()->create();
    $mediaB = Media::factory()->create();
    $mediaC = Media::factory()->create();

    $product = Product::factory()->create();

    $component = fillEditorForm(
        Livewire::test(Editor::class, ['product' => $product]),
        editorValidPayload([
            'name' => $product->name,
            'sku' => $product->sku,
            'productCategoryId' => $product->product_category_id,
        ]),
    );

    $component->call('addGalleryImages', [
        ['id' => $mediaA->id, 'title' => 'A'],
        ['id' => $mediaB->id, 'title' => 'B'],
        ['id' => $mediaC->id, 'title' => 'C'],
    ]);

    $component->call('save')->assertHasNoErrors();

    $pivot = DB::table('product_media')
        ->where('product_id', $product->id)
        ->orderBy('position')
        ->get(['media_id', 'position']);

    expect($pivot->pluck('position')->all())->toBe([0, 1, 2]);
    expect($pivot->pluck('media_id')->all())->toBe([$mediaA->id, $mediaB->id, $mediaC->id]);

    // Re-mount fresh and confirm the order round-trips.
    $reopened = Livewire::test(Editor::class, ['product' => $product->fresh()]);
    expect($reopened->get('galleryMediaIds'))->toBe([$mediaA->id, $mediaB->id, $mediaC->id]);
});

test('a reorder is expressed as a resubmitted array, not a swap, with one save call and no per-move write', function () {
    $actor = productsEditorFullActor(['products.view', 'products.create', 'products.edit', 'products.delete', 'media.view']);
    $this->actingAs($actor);

    $mediaA = Media::factory()->create();
    $mediaB = Media::factory()->create();
    $mediaC = Media::factory()->create();

    $product = Product::factory()->create();

    $component = fillEditorForm(
        Livewire::test(Editor::class, ['product' => $product]),
        editorValidPayload([
            'name' => $product->name,
            'sku' => $product->sku,
            'productCategoryId' => $product->product_category_id,
        ]),
    );

    $component->call('addGalleryImages', [
        ['id' => $mediaA->id, 'title' => 'A'],
        ['id' => $mediaB->id, 'title' => 'B'],
        ['id' => $mediaC->id, 'title' => 'C'],
    ]);

    $writeQueriesDuringMoves = 0;
    DB::listen(function ($query) use (&$writeQueriesDuringMoves): void {
        if (str_contains($query->sql, 'product_media') && preg_match('/^(insert|update|delete)\b/i', trim($query->sql)) === 1) {
            $writeQueriesDuringMoves++;
        }
    });

    // Move C to the front: earlier() twice.
    $component->call('moveGalleryImageEarlier', $mediaC->id);
    $component->call('moveGalleryImageEarlier', $mediaC->id);

    expect($writeQueriesDuringMoves)->toBe(0);
    expect($component->get('galleryMediaIds'))->toBe([$mediaC->id, $mediaA->id, $mediaB->id]);

    $component->call('save')->assertHasNoErrors();

    $pivot = DB::table('product_media')
        ->where('product_id', $product->id)
        ->orderBy('position')
        ->pluck('media_id')
        ->all();

    expect($pivot)->toBe([$mediaC->id, $mediaA->id, $mediaB->id]);
});

test('a removal leaves no position gap', function () {
    $actor = productsEditorFullActor(['products.view', 'products.create', 'products.edit', 'products.delete', 'media.view']);
    $this->actingAs($actor);

    $mediaA = Media::factory()->create();
    $mediaB = Media::factory()->create();
    $mediaC = Media::factory()->create();

    $product = Product::factory()->create();

    $component = fillEditorForm(
        Livewire::test(Editor::class, ['product' => $product]),
        editorValidPayload([
            'name' => $product->name,
            'sku' => $product->sku,
            'productCategoryId' => $product->product_category_id,
        ]),
    );

    $component->call('addGalleryImages', [
        ['id' => $mediaA->id, 'title' => 'A'],
        ['id' => $mediaB->id, 'title' => 'B'],
        ['id' => $mediaC->id, 'title' => 'C'],
    ]);

    $component->call('removeGalleryImage', $mediaB->id);
    $component->call('save')->assertHasNoErrors();

    $pivot = DB::table('product_media')
        ->where('product_id', $product->id)
        ->orderBy('position')
        ->get(['media_id', 'position']);

    expect($pivot->pluck('position')->all())->toBe([0, 1]);
    expect($pivot->pluck('media_id')->all())->toBe([$mediaA->id, $mediaC->id]);
});

// =====================================================================
// Appsec audit follow-up (F-1, F-4): addGalleryImages()/setFeaturedImage() cap the gallery size
// at the mutation point and derive their preview from the database, never from the event
// payload's own title/url/webpUrl/avifUrl.
// =====================================================================

test('addGalleryImages() caps the total gallery size at 20, silently dropping excess', function () {
    $actor = productsEditorFullActor(['products.view', 'products.create', 'products.edit', 'products.delete', 'media.view']);
    $this->actingAs($actor);

    $existing = Media::factory()->count(18)->create();
    $incoming = Media::factory()->count(5)->create();

    $product = Product::factory()->create();

    $component = Livewire::test(Editor::class, ['product' => $product]);

    $component->call('addGalleryImages', $existing->map(fn (Media $media) => ['id' => $media->id])->all());
    expect($component->get('galleryMediaIds'))->toHaveCount(18);

    $component->call('addGalleryImages', $incoming->map(fn (Media $media) => ['id' => $media->id])->all());

    expect($component->get('galleryMediaIds'))->toHaveCount(20)
        ->and($component->get('galleryPreviews'))->toHaveCount(20)
        ->and($component->get('galleryMediaIds'))->toContain($incoming[0]->id, $incoming[1]->id)
        ->and($component->get('galleryMediaIds'))->not->toContain($incoming[2]->id, $incoming[3]->id, $incoming[4]->id);
});

test("addGalleryImages() and setFeaturedImage() derive the preview from the database, ignoring the payload's own title/url", function () {
    $actor = productsEditorFullActor(['products.view', 'products.create', 'products.edit', 'products.delete', 'media.view']);
    $this->actingAs($actor);

    $media = Media::factory()->create(['title' => 'Real Title']);
    $product = Product::factory()->create();

    $component = Livewire::test(Editor::class, ['product' => $product]);

    $component->call('addGalleryImages', [
        ['id' => $media->id, 'title' => 'FORGED TITLE', 'url' => 'https://evil.example/x.png'],
    ]);
    $component->call('setFeaturedImage', [
        ['id' => $media->id, 'title' => 'FORGED TITLE', 'url' => 'https://evil.example/x.png'],
    ]);

    $galleryPreviews = $component->get('galleryPreviews');
    expect($galleryPreviews[0]['title'])->toBe('Real Title')
        ->and($galleryPreviews[0]['url'])->not->toContain('evil.example');

    $featuredPreview = $component->get('featuredPreview');
    expect($featuredPreview['title'])->toBe('Real Title')
        ->and($featuredPreview['url'])->not->toContain('evil.example');
});

test('addGalleryImages() silently skips an id with no matching media row', function () {
    $actor = productsEditorFullActor(['products.view', 'products.create', 'products.edit', 'products.delete', 'media.view']);
    $this->actingAs($actor);

    $product = Product::factory()->create();

    $component = Livewire::test(Editor::class, ['product' => $product]);
    $component->call('addGalleryImages', [['id' => (string) Str::uuid7()]]);

    expect($component->get('galleryMediaIds'))->toBe([]);
    expect($component->get('galleryPreviews'))->toBe([]);
});

test('addGalleryImages() with an oversized non-existent-id submission issues exactly one media query, not one per item', function () {
    // R-1 (appsec re-audit): before the fix, the cap check only fired once the array had already
    // GROWN to self::MAX_GALLERY_SIZE, so a payload of ids that never make it into the array
    // (non-existent here) ran the full loop -- and, before the query was collapsed to a single
    // whereIn(), issued one Media::query()->find() per submitted item regardless of the array's
    // own length. Mirrors 'an oversized regionIds submission issues zero sales_regions existence
    // queries' above (0026 D-12(b2)/array-validation-bounds.md), the matching guard for the
    // gallery-media path.
    $actor = productsEditorFullActor(['products.view', 'products.create', 'products.edit', 'products.delete', 'media.view']);
    $this->actingAs($actor);

    $product = Product::factory()->create();

    $component = Livewire::test(Editor::class, ['product' => $product]);

    $bogusIds = array_map(fn () => (string) Str::uuid7(), range(1, 500));

    $mediaQueries = 0;
    $bindingCounts = [];
    DB::listen(function ($query) use (&$mediaQueries, &$bindingCounts): void {
        // Backtick-quoted so `product_media` (a different table) never matches this count.
        if (str_contains($query->sql, '`media`')) {
            $mediaQueries++;
            $bindingCounts[] = count($query->bindings);
        }
    });

    $component->call('addGalleryImages', array_map(fn (string $id) => ['id' => $id], $bogusIds));

    expect($mediaQueries)->toBe(1);
    // The query-count assertion alone passes whether the 500-id payload is sliced to
    // MAX_GALLERY_SIZE (20) before the whereIn() or not -- both shapes issue exactly one query,
    // and only the binding count distinguishes "sliced before the query" (<= 20 bindings) from
    // "not sliced at all" (500 bindings). Without this, F-7's regression (the take()-before-
    // whereIn() slice silently removed) would pass this test unnoticed.
    expect($bindingCounts[0])->toBeLessThanOrEqual(20);
    expect($component->get('galleryMediaIds'))->toBe([]);
    expect($component->get('galleryPreviews'))->toBe([]);
});

test('setFeaturedImage() silently no-ops for an id with no matching media row', function () {
    $actor = productsEditorFullActor(['products.view', 'products.create', 'products.edit', 'products.delete', 'media.view']);
    $this->actingAs($actor);

    $product = Product::factory()->create();

    $component = Livewire::test(Editor::class, ['product' => $product]);
    $component->call('setFeaturedImage', [['id' => (string) Str::uuid7()]]);

    expect($component->get('featuredMediaId'))->toBeNull();
    expect($component->get('featuredPreview'))->toBeNull();
});

test('save authorizes create as its first statement for a denied actor, on a new product', function () {
    // Editor::mount() authorizes `create`/`update` as ITS OWN first statement (D-2, D-12), matching
    // ScreenAuthorizationTest.php's 4 passing cases -- so for an actor denied `products.create`, the
    // AuthorizationException surfaces at Livewire::test(Editor::class) construction itself, before
    // fillEditorForm() or ->call('save') ever run. The whole chain must be inside the expectation,
    // not merely the ->call('save') tail.
    $this->withoutExceptionHandling();
    $actor = User::factory()->create();
    $this->actingAs($actor);

    expect(fn () => fillEditorForm(Livewire::test(Editor::class), editorValidPayload())->call('save'))
        ->toThrow(AuthorizationException::class);

    expect(Product::count())->toBe(0);
});

test('save authorizes update as its first statement for a denied actor, on an existing product', function () {
    // Same reasoning as the create case above: mount(?Product $product) authorizes `update` before
    // any field is ever set, so Livewire::test(Editor::class, ['product' => $product]) itself throws
    // for an actor holding only `products.view`.
    $this->withoutExceptionHandling();
    $creator = productsEditorFullActor();
    $this->actingAs($creator);
    $product = Product::factory()->create(['name' => 'Original Name']);

    $deniedActor = User::factory()->create();
    $deniedActor->givePermissionTo('products.view');
    $this->actingAs($deniedActor);

    expect(fn () => fillEditorForm(
        Livewire::test(Editor::class, ['product' => $product]),
        editorValidPayload([
            'name' => 'Should Not Persist',
            'sku' => $product->sku,
            'productCategoryId' => $product->product_category_id,
        ]),
    )->call('save'))->toThrow(AuthorizationException::class);

    expect($product->fresh()->name)->toBe('Original Name');
});

test('a save by a denied actor writes nothing across products, product_media and product_sales_region', function () {
    // The AuthorizationException fires at mount(), not at ->call('save') -- the whole chain from
    // Livewire::test() through fillEditorForm() must sit inside the try block.
    $this->withoutExceptionHandling();
    $actor = User::factory()->create();
    $this->actingAs($actor);

    try {
        fillEditorForm(Livewire::test(Editor::class), editorValidPayload())->call('save');
    } catch (AuthorizationException) {
        // expected
    }

    expect(Product::count())->toBe(0)
        ->and(DB::table('product_media')->count())->toBe(0)
        ->and(DB::table('product_sales_region')->count())->toBe(0);
});
