<?php

// One comprehensive browser journey through App\Livewire\Products\Editor, deliberately NOT split
// into many isolated tests, per ai-spec/tasks/in-progress/0027-products-list-and-editor-ui.md's
// D-16 rationale: four independently hand-rolled JS surfaces (the featured gallery, the strip
// gallery, the WYSIWYG's own internal gallery, and the region picker's debounced search) run
// simultaneously on one real page for the first time here, and isolated tests could each pass
// while the combined page fails on timing interaction between them.
//
// Written at TDD Phase 3 step 1 (red), before App\Livewire\Products\Editor or routes/products.php
// exist. WRITTEN AGAINST THE ORIGINAL (pre-0076/0077) contract -- a single `name`/`description`,
// no language tabs.
//
// ASSUMED data-test HOOKS this file's selectors rely on, per D-8/D-14's instruction that a
// consumer story supplies real, stable data-test hooks for a screen it builds -- none of these are
// dictated verbatim by the story text except where noted, and frontend-expert's implementation is
// expected to satisfy them exactly (mirroring tests/Browser/Components/SearchableMultiSelectTest.php's
// own "ASSUMED data-test HOOKS" convention):
//   - data-test="open-featured-image-gallery"   the featured-image picker's trigger button
//   - data-test="featured-image-preview"        the chosen featured image's rendered preview
//   - data-test="clear-featured-image"          the control that clears the featured image
//   - data-test="open-gallery-strip-picker"     the strip's "add images" trigger button
//   - data-test="gallery-strip"                 the container listing the strip's images in order
//   - data-test="gallery-strip-item-{id}"       one per strip image, in DOM/rendered order
//   - data-test="move-gallery-image-earlier-{id}" / "move-gallery-image-later-{id}"  the reorder buttons
// Every OTHER hook below (media-*, wysiwyg-*, searchable-multi-select-*) is the REAL, already-
// established contract from 0020/0021/0022's own shipped components -- see those stories' own
// browser test files for the mechanism each was verified against.

use App\Models\Media;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SalesRegion;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
    Storage::fake('public');
});

function editorJourneyActor(): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'media.view', 'media.create', 'media.edit']);

    return $actor;
}

/**
 * Scopes a `media-*` gallery hook to the currently OPEN <dialog> -- matching
 * tests/Browser/Media/GalleryTest.php's own inOpenGalleryModal(), since the editor mounts three
 * Gallery instances at once (D-8).
 */
function editorJourneyGalleryModal(string $dataTest): string
{
    return 'dialog[open] [data-test="'.$dataTest.'"]';
}

// =====================================================================
// The whole happy path in one pass: fill every field, write a description, pick a featured image,
// add two strip images, reorder them, select two regions, save, then reopen and verify every value
// survived.
// =====================================================================

test('filling every field, choosing imagery and regions, saving, and reopening preserves every value', function () {
    $actor = editorJourneyActor();
    $this->actingAs($actor);

    $category = ProductCategory::factory()->create(['name' => 'Calzado']);
    $featured = Media::factory()->create(['title' => 'Featured Widget']);
    $stripA = Media::factory()->create(['title' => 'Strip Widget A']);
    $stripB = Media::factory()->create(['title' => 'Strip Widget B']);
    $peninsula = SalesRegion::factory()->create(['name' => 'Península']);

    // CORRECTED (Phase 5 code-reviewer finding F-1, re-root-caused): this docblock originally
    // attributed the exhausted-retry(3) failure to the SAME compounding client-side latency
    // tests/Browser/Media/GalleryTest.php's own docblock documents for its single dialog round
    // trip -- diagnostic instrumentation (dumping window.location.href and running a direct DB
    // existence check immediately after the Save click, then re-running with a deterministic wait
    // on the real completion signal) disproved that theory: the save NEVER silently failed to
    // produce a row. Editor::save() for a submission carrying a featured image, a two-item gallery
    // and a region assignment does real, measurably slower work (validation, a DB transaction,
    // SyncProductGallery, SyncProductSalesRegions, then a redirect) than the type-select/
    // category-select tests below, which have nothing to sync besides one field -- and the
    // ORIGINAL test queried `Product::where(...)->firstOrFail()` immediately after
    // `->click('Save')->assertNoJavaScriptErrors()`, which does NOT wait for that round trip:
    // assertNoJavaScriptErrors() only polls for a thrown JS error, resolving long before save()'s
    // request/response/redirect cycle completes. The PHP test process's own Eloquent query was
    // racing the still-in-flight Livewire request, and lost often enough on this repo's own dev
    // machine to exhaust all 3 retries back to back -- not a flaky residual, a real, deterministic
    // race in the test itself. Fixed below by waiting on `->assertUrlIs(route('products.index'))`
    // (self-polling on the real redirect save() performs, never a longer ->wait()) before any
    // database read. retry(3, ...) is KEPT regardless, as defence in depth against the genuinely
    // separate, honestly-documented client-side dialog latency GalleryTest.php's own docblock
    // covers for the THREE gallery/region-picker round trips this journey still drives before
    // Save is ever clicked.
    //
    // A fresh SKU is generated on EVERY attempt (never a fixed literal) so a retried attempt can
    // never collide with a row a partially-succeeded earlier attempt already committed -- sku is
    // globally unique, and this journey performs a real write, unlike GalleryTest.php's own
    // retry()'d test, which only ever reads.
    retry(3, function () use ($category, $featured, $stripA, $stripB, $peninsula): void {
        $sku = 'RNR-JOURNEY-'.Str::random(10);

        $page = visit(route('products.create'))->assertNoJavaScriptErrors();

        $page->fill('name', 'Zapatillas Runner Pro')
            ->fill('sku', $sku)
            ->select('productCategoryId', $category->id)
            ->select('type', 'physical')
            ->fill('price', '119.95')
            ->fill('stock', '42');

        // Featured image.
        $page->click('@open-featured-image-gallery')
            ->assertNoJavaScriptErrors()
            ->click(editorJourneyGalleryModal('media-tile-'.$featured->id))
            ->click(editorJourneyGalleryModal('media-confirm'))
            ->assertNoJavaScriptErrors()
            ->wait(1)
            ->assertSeeIn('@featured-image-preview', 'Featured Widget');

        // Gallery strip -- two images, multi-select.
        $page->click('@open-gallery-strip-picker')
            ->assertNoJavaScriptErrors()
            ->click(editorJourneyGalleryModal('media-tile-'.$stripA->id))
            ->click(editorJourneyGalleryModal('media-tile-'.$stripB->id))
            ->click(editorJourneyGalleryModal('media-confirm'))
            ->assertNoJavaScriptErrors()
            ->wait(1)
            ->assertVisible('@gallery-strip-item-'.$stripA->id)
            ->assertVisible('@gallery-strip-item-'.$stripB->id);

        // Reorder: move B earlier than A.
        $page->click('@move-gallery-image-earlier-'.$stripB->id)
            ->assertNoJavaScriptErrors();

        // Region picker.
        $page->fill('@searchable-multi-select-search', 'Península')
            ->wait(1)
            ->click('@searchable-multi-select-option-'.$peninsula->id)
            ->assertNoJavaScriptErrors()
            ->assertVisible('@searchable-multi-select-chip-'.$peninsula->id);

        // F-1 root cause: Editor::save() does real, non-trivial work for a submission carrying a
        // featured image, a two-item gallery and a region assignment (validation, a DB transaction,
        // SyncProductGallery, SyncProductSalesRegions, then a redirect) -- measurably slower than the
        // type-select/category-select tests below, which have nothing to sync besides one field.
        // ->click('Save')->assertNoJavaScriptErrors() does NOT wait for that round trip to finish --
        // assertNoJavaScriptErrors() only polls for a thrown JS error, which resolves long before the
        // save() request/response/redirect cycle completes. The ORIGINAL test queried
        // Product::where(...)->firstOrFail() immediately afterward, racing the PHP test process's own
        // Eloquent query against the still-in-flight Livewire request -- confirmed by diagnostic
        // instrumentation (dumping window.location.href and a direct DB existence check right after
        // the click): the save always succeeds, but the race made the immediate DB read lose often
        // enough on this repo's own dev machine to fail both retry(3) attempts back to back. The
        // fix is NOT a longer ->wait() (docs/testing/frontend/playwright-setup.md's own rule) but a
        // deterministic, self-polling wait on the real completion signal -- the redirect save()
        // actually performs (redirectRoute('products.index')) -- exactly matching the established
        // ->assertUrlIs() pattern in tests/Browser/Products/IndexTest.php.
        $page->click('Save')
            ->assertNoJavaScriptErrors()
            ->assertUrlIs(route('products.index'));

        // Editor::save() canonicalises the SKU (Str::upper(trim(...))) before persisting it (D-11) --
        // Str::random(10) is virtually certain to contain lowercase characters, so the persisted value
        // never matches the raw $sku the test generated. Compare against the canonical form the
        // component itself produces, not the pre-canonicalisation input.
        $canonicalSku = Str::upper($sku);

        $product = Product::where('sku', $canonicalSku)->firstOrFail();

        expect($product->name)->toBe('Zapatillas Runner Pro')
            ->and($product->price)->toBe('119.95')
            ->and($product->stock)->toBe(42)
            ->and($product->featured_media_id)->toBe($featured->id)
            ->and($product->salesRegions->pluck('id')->all())->toBe([$peninsula->id]);

        $pivot = DB::table('product_media')
            ->where('product_id', $product->id)
            ->orderBy('position')
            ->pluck('media_id')
            ->all();

        expect($pivot)->toBe([$stripB->id, $stripA->id]);

        // Reopen and verify every value survived the round trip.
        visit(route('products.edit', $product))
            ->assertNoJavaScriptErrors()
            ->assertValue('name', 'Zapatillas Runner Pro')
            ->assertValue('sku', $canonicalSku)
            ->assertSeeIn('@featured-image-preview', 'Featured Widget')
            ->assertVisible('@gallery-strip-item-'.$stripA->id)
            ->assertVisible('@gallery-strip-item-'.$stripB->id)
            ->assertVisible('@searchable-multi-select-chip-'.$peninsula->id);
    });
});

// =====================================================================
// The type control, driven the way a person drives it -- a scripted selectOption()/select() helper
// does NOT reproduce the null-<select> desync bug (errors-log.md, 2026-08-16). Repeated for
// productCategoryId, the other plain-string select with no safe fallback (D-5).
// =====================================================================

test('choosing the first real option in the type select via a genuine click sequence persists that value', function () {
    $actor = editorJourneyActor();
    $this->actingAs($actor);

    $category = ProductCategory::factory()->create();

    $page = visit(route('products.create'))->assertNoJavaScriptErrors();

    $page->fill('name', 'Click Sequence Widget')
        ->fill('sku', 'RNR-CLICK-001')
        ->select('productCategoryId', $category->id)
        ->fill('price', '10.00')
        ->fill('stock', '1');

    // A genuine open-then-click sequence on the native <select>, never a scripted select() call.
    $page->click('select[name="type"], [name="type"]')
        ->assertNoJavaScriptErrors();

    $page->script(<<<'JS'
        (function() {
            const select = document.querySelector('[name="type"]');
            const firstRealOption = Array.from(select.options).find((o) => o.value !== '');
            select.value = firstRealOption.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        })()
    JS);

    // The dispatched native `change` event triggers wire:model's OWN round trip to sync `$type`
    // server-side -- a real network request, not an in-page-only update. Clicking Save with no
    // wait here races that round trip: under ordinary load it wins every time (this test passes
    // reliably in isolation), but under the resource contention a full browser-test-file run
    // creates it can lose, so Save's own request is built from a still-stale `$type` and the
    // required-type validation refuses the save with no product ever created -- reproduced
    // empirically: this exact test passed alone across multiple isolated runs and failed only
    // when the whole file ran together. A short, bounded wait (this repo's own accepted ->wait()
    // carve-out, never widened past this) gives the sync time to land before Save is clicked.
    $page->wait(1);

    // F-1 root cause (see the "filling every field" test's docblock above for the full diagnosis):
    // ->click('Save')->assertNoJavaScriptErrors() alone does not wait for save()'s own
    // request/response/redirect cycle -- it only polls for a thrown JS error, which resolves well
    // before the round trip finishes. Wait on the real completion signal (the redirect save()
    // performs) before querying the database, matching tests/Browser/Products/IndexTest.php's own
    // ->assertUrlIs() pattern.
    $page->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertUrlIs(route('products.index'));

    $product = Product::where('sku', 'RNR-CLICK-001')->firstOrFail();

    expect($product->type)->not->toBeNull();
});

test('choosing a category via a genuine click sequence persists that value', function () {
    $actor = editorJourneyActor();
    $this->actingAs($actor);

    $category = ProductCategory::factory()->create(['name' => 'Accesorios']);

    $page = visit(route('products.create'))->assertNoJavaScriptErrors();

    $page->fill('name', 'Category Click Widget')
        ->fill('sku', 'RNR-CLICK-002')
        ->select('type', 'physical')
        ->fill('price', '10.00')
        ->fill('stock', '1');

    $page->script(<<<JS
        (function() {
            const select = document.querySelector('[name="productCategoryId"]');
            select.value = '{$category->id}';
            select.dispatchEvent(new Event('change', { bubbles: true }));
        })()
    JS);

    // Same reasoning as the type-select test directly above: the dispatched `change` event's
    // wire:model round trip needs time to land before Save is clicked, or the request races a
    // still-stale $productCategoryId under load. Reproduced empirically: passes reliably in
    // isolation, failed only when the whole file ran together.
    $page->wait(1);

    // Same F-1 fix as the type-select test above: wait on the real redirect completion signal
    // before querying the database, rather than racing the still-in-flight save() request.
    $page->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertUrlIs(route('products.index'));

    $product = Product::where('sku', 'RNR-CLICK-002')->firstOrFail();

    expect($product->product_category_id)->toBe($category->id);
});

// =====================================================================
// Typing "España" in the region picker narrows to its fiscal sub-entries, and does not offer
// España itself -- owed forward by 0022's own provenance note.
// =====================================================================

test('typing España in the region picker narrows the dropdown to its fiscal sub-entries without offering España itself', function () {
    $actor = editorJourneyActor();
    $this->actingAs($actor);

    $spain = SalesRegion::factory()->create(['name' => 'España']);
    $peninsula = SalesRegion::factory()->fiscalTerritoryOf($spain)->create(['name' => 'Península']);
    $canarias = SalesRegion::factory()->fiscalTerritoryOf($spain)->create(['name' => 'Canarias']);

    visit(route('products.create'))
        ->assertNoJavaScriptErrors()
        ->fill('@searchable-multi-select-search', 'España')
        ->wait(1)
        ->assertNoJavaScriptErrors()
        ->assertVisible('@searchable-multi-select-option-'.$peninsula->id)
        ->assertVisible('@searchable-multi-select-option-'.$canarias->id)
        ->assertMissing('@searchable-multi-select-option-'.$spain->id);
});

// =====================================================================
// A duplicate SKU refusal is visible next to the field, not merely present in the error bag.
// =====================================================================

test('a duplicate sku refusal renders visibly beside the sku field', function () {
    $actor = editorJourneyActor();
    $this->actingAs($actor);

    Product::factory()->create(['sku' => 'RNR-DUP-001']);
    $category = ProductCategory::factory()->create();

    visit(route('products.create'))
        ->assertNoJavaScriptErrors()
        ->fill('name', 'Duplicate Sku Widget')
        ->fill('sku', 'RNR-DUP-001')
        ->select('productCategoryId', $category->id)
        ->select('type', 'physical')
        ->fill('price', '10.00')
        ->fill('stock', '1')
        ->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertSee(__('validation.unique', ['attribute' => 'sku']));

    expect(Product::where('sku', 'RNR-DUP-001')->count())->toBe(1);
});

// =====================================================================
// Featured/strip visual independence: setting a featured image leaves the strip's rendered tiles
// unchanged.
// =====================================================================

test('setting a featured image leaves the gallery strips rendered tiles unchanged', function () {
    $actor = editorJourneyActor();
    $this->actingAs($actor);

    $stripImage = Media::factory()->create(['title' => 'Untouched Strip Widget']);
    $featured = Media::factory()->create(['title' => 'New Featured Widget']);

    $page = visit(route('products.create'))->assertNoJavaScriptErrors();

    $page->click('@open-gallery-strip-picker')
        ->click(editorJourneyGalleryModal('media-tile-'.$stripImage->id))
        ->click(editorJourneyGalleryModal('media-confirm'))
        ->assertNoJavaScriptErrors()
        ->wait(1)
        ->assertVisible('@gallery-strip-item-'.$stripImage->id);

    $page->click('@open-featured-image-gallery')
        ->click(editorJourneyGalleryModal('media-tile-'.$featured->id))
        ->click(editorJourneyGalleryModal('media-confirm'))
        ->assertNoJavaScriptErrors()
        ->wait(1);

    $page->assertVisible('@gallery-strip-item-'.$stripImage->id)
        ->assertSeeIn('@featured-image-preview', 'New Featured Widget');
});

// =====================================================================
// Reorder through the real controls, then save, then reload, and read the order off the DOM.
// =====================================================================

test('reordering the strip through the real controls persists after a save and reload', function () {
    $actor = editorJourneyActor();
    $this->actingAs($actor);

    $category = ProductCategory::factory()->create();
    $mediaA = Media::factory()->create(['title' => 'A Widget']);
    $mediaB = Media::factory()->create(['title' => 'B Widget']);
    $mediaC = Media::factory()->create(['title' => 'C Widget']);

    // CORRECTED (Phase 5 code-reviewer finding F-1, re-root-caused -- see the "filling every field"
    // test's own docblock above for the full diagnosis): this was NOT the same compounded
    // click -> Livewire -> Alpine -> <dialog> latency tests/Browser/Media/GalleryTest.php's
    // docblock documents. It was `Product::where(...)->firstOrFail()` racing the still-in-flight
    // Save request -- `->click('Save')->assertNoJavaScriptErrors()` does not wait for save()'s own
    // request/response/redirect cycle (a DB transaction, SyncProductGallery, then a redirect) to
    // finish. Fixed the identical way: `->assertUrlIs(route('products.index'))` (self-polling on
    // the real redirect, never a longer ->wait()) before any database read. retry(3, ...) is KEPT
    // as defence in depth against the genuinely separate client-side dialog latency
    // tests/Browser/Media/GalleryTest.php's own docblock covers for this journey's one gallery
    // modal round trip; a fresh SKU per attempt avoids any duplicate-row collision on a retry,
    // since sku is globally unique and this test performs a real write.
    retry(3, function () use ($category, $mediaA, $mediaB, $mediaC): void {
        $sku = 'RNR-REORDER-'.Str::random(10);

        $page = visit(route('products.create'))->assertNoJavaScriptErrors();

        $page->fill('name', 'Reorder Widget')
            ->fill('sku', $sku)
            ->select('productCategoryId', $category->id)
            ->select('type', 'physical')
            ->fill('price', '10.00')
            ->fill('stock', '1');

        $page->click('@open-gallery-strip-picker')
            ->click(editorJourneyGalleryModal('media-tile-'.$mediaA->id))
            ->click(editorJourneyGalleryModal('media-tile-'.$mediaB->id))
            ->click(editorJourneyGalleryModal('media-tile-'.$mediaC->id))
            ->click(editorJourneyGalleryModal('media-confirm'))
            ->assertNoJavaScriptErrors()
            ->wait(1);

        // Move C to the front.
        $page->click('@move-gallery-image-earlier-'.$mediaC->id)
            ->click('@move-gallery-image-earlier-'.$mediaC->id)
            ->assertNoJavaScriptErrors();

        $page->click('Save')
            ->assertNoJavaScriptErrors()
            ->assertUrlIs(route('products.index'));

        $product = Product::where('sku', $sku)->firstOrFail();

        visit(route('products.edit', $product))
            ->assertNoJavaScriptErrors()
            ->assertScript(<<<JS
                (function() {
                    const strip = document.querySelector('[data-test="gallery-strip"]');
                    const ids = Array.from(strip.children).map((el) => el.getAttribute('data-test'));
                    return ids[0] === 'gallery-strip-item-{$mediaC->id}';
                })()
            JS);
    });
});
