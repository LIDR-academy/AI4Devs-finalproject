<?php

// Story 0031, Phase 3 (TDD "red" step): App\Livewire\Products\VariantBuilder, its view, and the
// embed block in resources/views/livewire/products/editor.blade.php do NOT exist yet -- that
// embed is frontend-expert's Phase 3 step 2 work, not this file's. Deliberately FEW cases, per
// docs/testing/frontend/coverage-policy.md and 0027 R-6: each one proves something no
// Livewire::test()-based Feature test structurally can.
//
// B9/B10 (the generator modal's <dialog> safety and its live checkbox count) are story 0031a's
// own cases, APPENDED to this same file per 0031a's own Files-to-modify table -- 0031a composes
// its generator UI onto this component and view rather than creating a second one, so its two
// browser cases land here too, at the end of this file, rather than in a new one.
//
// ASSUMED data-test HOOKS this file's selectors rely on, per D-8/D-14's instruction that a
// consumer story supplies real, stable data-test hooks for a screen it builds -- CONFIRMED hooks are
// marked as such (taken verbatim from the story's own D-4/D-14/T15 code samples); everything else is
// this file's own best-effort naming for frontend-expert's Phase 3 step 2 implementation to satisfy,
// mirroring tests/Browser/Products/EditorJourneyTest.php's own "ASSUMED data-test HOOKS" convention:
//   CONFIRMED (D-4):        data-test="variant-sku-preview"          the live SKU preview
//   CONFIRMED (D-14 / T15): data-test="edit-variant-{id}"            the edit row action
//   CONFIRMED (D-14 / T15): data-test="delete-variant-{id}"          the delete row action
//   CONFIRMED (D-14 / T15): data-test="revert-variant-image-{id}"    the revert-to-inherited action
//   CONFIRMED (D-2/QA-V5):  [name="combinationRows.{i}.typeId"]      the attribute-type select (a
//                           contract-derived selector -- flux:select's own wire:model path, no new
//                           data-test hook needed)
//   CONFIRMED (D-2/QA-V5):  [name="combinationRows.{i}.valueId"]     the attribute-value select
//   ASSUMED:  data-test="open-create-variant-form"    the "add a variant" trigger
//   ASSUMED:  data-test="save-variant"                the form's save button
//   ASSUMED:  data-test="confirm-delete-variant"      the delete modal's destructive confirm button
//   ASSUMED:  data-test="open-variant-image-gallery-{id}"  a row's own image-picker trigger
//   ASSUMED:  data-test="variant-row-{id}"            one row's own container, for scoped assertions
// Every media-*/gallery hook is the REAL, already-established contract from 0019/0020's own shipped
// Gallery component -- see tests/Browser/Media/GalleryTest.php.

use App\Actions\Products\CreateProductVariant;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
    Storage::fake('public');
});

function variantBuilderJourneyActor(): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.edit', 'media.view', 'media.create']);

    return $actor;
}

/**
 * Scopes a `media-*` gallery hook to the currently OPEN <dialog>, matching
 * tests/Browser/Products/EditorJourneyTest.php's own editorJourneyGalleryModal() helper -- this
 * screen mounts a FOURTH Gallery instance alongside the editor's existing three (D-6).
 */
function variantBuilderGalleryModal(string $dataTest): string
{
    return 'dialog[open] [data-test="'.$dataTest.'"]';
}

/**
 * @return array{0: ProductAttributeType, 1: ProductAttributeValue}
 */
function variantBuilderBrowserAttribute(string $typeName, string $value, int $typePosition = 0): array
{
    $type = ProductAttributeType::factory()->create(['name' => $typeName, 'position' => $typePosition]);
    $productAttributeValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => $value,
        'position' => 0,
    ]);

    return [$type, $productAttributeValue];
}

// =====================================================================
// B1 -- the null-<select> desync detector. selectedIndex, asserted BEFORE any interaction (D-9).
// This is the root-cause assertion; ->select()-driven and assertValue()-driven tests are verified
// (QA-V1/QA-V3) structurally incapable of catching this bug (FP-V14) and are never used for it.
// =====================================================================

test('every attribute select genuinely has its placeholder selected before any interaction', function () {
    $actor = variantBuilderJourneyActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['sku' => '0001']);
    ProductAttributeType::factory()->withValues(2)->create(['name' => 'Talla']);

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->click('@open-create-variant-form')->assertNoJavaScriptErrors();

    // 0 = the disabled placeholder is genuinely selected. -1 would mean wire:model assigned
    // "null"/"undefined" to a native <select> with no matching <option value="">.
    $page->assertScript(
        'document.querySelector(\'[name="combinationRows.0.typeId"]\').selectedIndex',
        0
    );
    $page->assertScript(
        'document.querySelector(\'[name="combinationRows.0.valueId"]\').selectedIndex',
        0
    );
});

// =====================================================================
// B2 -- the live preview, with a NON-IDENTITY value. The single highest-value test in this story:
// a missing .live modifier is invisible at component level (FP-V4), and a JS re-implementation of
// the formula gets M/L/azul marino exactly right and Marrón exactly wrong, so every naive fixture
// passes it.
// =====================================================================

test('choosing Marrón previews 0002-Marron live and the persisted sku matches the same literal', function () {
    // Fixtures are created ONCE, outside retry() -- a retried closure re-runs against the SAME
    // database state (retry() does not roll back a prior attempt's writes), so a fixed-literal
    // sku/name created INSIDE the closure would collide with itself on a second attempt
    // (errors-log.md's docs/testing/frontend/EditorJourneyTest.php precedent: "a fresh SKU is
    // generated on EVERY attempt... so a retried attempt can never collide with a row a
    // partially-succeeded earlier attempt already committed" -- here the fixture is arranged, not
    // submitted through the form, so the fix is to arrange it outside the retry instead).
    $actor = variantBuilderJourneyActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['sku' => '0002']);
    [$color, $marron] = variantBuilderBrowserAttribute('Color', 'Marrón');

    retry(3, function () use ($product, $color, $marron): void {
        $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

        $page->click('@open-create-variant-form')
            ->select('[name="combinationRows.0.typeId"]', $color->id)
            ->assertNoJavaScriptErrors()
            ->select('[name="combinationRows.0.valueId"]', $marron->id)
            ->assertNoJavaScriptErrors()
            ->wait(1);

        $page->assertSeeIn('@variant-sku-preview', '0002-Marron');

        $page->fill('price', '19.99')
            ->fill('stock', '5')
            ->click('@save-variant')
            ->assertNoJavaScriptErrors()
            ->wait(1);

        $variant = DB::table('product_variants')->where('product_id', $product->id)->first();

        expect($variant)->not->toBeNull()
            ->and($variant->sku)->toBe('0002-Marron');

        $page->assertSee('0002-Marron');
    });
});

// =====================================================================
// B3 -- the dependent-select reset (T2), driven by genuine clicks, asserting the PERSISTED value.
// The type's own value set must offer at least two real values, or both a correct implementation
// and the T2 bug end on the same value and the test cannot fail.
// =====================================================================

test('changing a rows attribute type resets its stale value selection, proven by the persisted variant', function () {
    // Fixtures created ONCE, outside retry() -- see the identical comment on the Marrón test above:
    // retry() re-runs against the SAME database state, and product_attribute_types.name carries a
    // UNIQUE index, so a fixed literal type name created INSIDE the closure would collide with
    // itself on a second attempt.
    $actor = variantBuilderJourneyActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['sku' => '0001']);
    $talla = ProductAttributeType::factory()->create(['name' => 'Talla', 'position' => 0]);
    $tallaM = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $talla->id, 'value' => 'M', 'position' => 0,
    ]);
    $color = ProductAttributeType::factory()->create(['name' => 'Color', 'position' => 1]);
    $colorAzul = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $color->id, 'value' => 'azul marino', 'position' => 0,
    ]);
    $colorRojo = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $color->id, 'value' => 'rojo', 'position' => 1,
    ]);

    retry(3, function () use ($product, $talla, $tallaM, $color, $colorRojo): void {
        $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

        $page->click('@open-create-variant-form')
            ->select('[name="combinationRows.0.typeId"]', $talla->id)
            ->assertNoJavaScriptErrors()
            ->select('[name="combinationRows.0.valueId"]', $tallaM->id)
            ->assertNoJavaScriptErrors()
            ->wait(1);

        // Switch the row's TYPE -- the stale Talla-scoped valueId must not survive into the Color
        // option set.
        $page->select('[name="combinationRows.0.typeId"]', $color->id)
            ->assertNoJavaScriptErrors()
            ->wait(1);

        $page->select('[name="combinationRows.0.valueId"]', $colorRojo->id)
            ->assertNoJavaScriptErrors()
            ->wait(1);

        $page->fill('price', '19.99')
            ->fill('stock', '5')
            ->click('@save-variant')
            ->assertNoJavaScriptErrors()
            ->wait(1);

        $variant = DB::table('product_variants')->where('product_id', $product->id)->first();

        expect($variant)->not->toBeNull()
            ->and($variant->sku)->toBe('0001-rojo');
    });
});

// =====================================================================
// B4 -- cross-instance image routing. FOUR Gallery instances now share one page (D-6); instance
// separation is a page-global event-name game resolved only in the browser.
// =====================================================================

test('choosing an image for one variant reaches no other variant, the products featured image, or its gallery strip', function () {
    // Fixtures (including the two variants themselves, created directly through the action --
    // never through the browser) are arranged ONCE, outside retry(), for the identical reason as
    // the two tests above: retry() does not roll back a prior attempt's database writes, and
    // re-running CreateProductVariant a second time on the same combination would be refused as a
    // duplicate.
    $actor = variantBuilderJourneyActor();
    $this->actingAs($actor);

    $productFeatured = Media::factory()->create(['title' => 'Product Featured']);
    $product = Product::factory()->create(['sku' => '0001', 'featured_media_id' => $productFeatured->id]);
    $talla = ProductAttributeType::factory()->create(['name' => 'Talla']);
    $m = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $talla->id, 'value' => 'M', 'position' => 0,
    ]);
    $l = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $talla->id, 'value' => 'L', 'position' => 1,
    ]);
    $variantM = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);
    $variantL = app(CreateProductVariant::class)($product, [$l->id], '19.99', 5);

    $variantImage = Media::factory()->create(['title' => 'Talla L Own Image']);

    retry(3, function () use ($product, $productFeatured, $variantM, $variantL, $variantImage): void {
        $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

        // frontend-expert correction (Phase 3): setVariantImage() -- the single Gallery instance's
        // #[On('variant-image-selected')] listener -- only STAGES the chosen id (see its own
        // docblock and VariantBuilderRenderingTest's "the featuredMediaId refusal renders beside
        // the image picker" case, which proves the id is validated/persisted only inside
        // saveVariant()). The row-level trigger opens that same variant's edit panel first
        // (openImagePicker() -> openEditForm() + showGallery=true), so persisting the newly staged
        // image still needs the ordinary Save click -- exactly like changing price/stock.
        $page->click('@open-variant-image-gallery-'.$variantL->id)
            ->assertNoJavaScriptErrors()
            ->click(variantBuilderGalleryModal('media-tile-'.$variantImage->id))
            ->click(variantBuilderGalleryModal('media-confirm'))
            ->assertNoJavaScriptErrors()
            ->wait(1);

        $page->click('@save-variant')->assertNoJavaScriptErrors()->wait(1);

        expect($variantL->fresh()->featured_media_id)->toBe($variantImage->id)
            ->and($variantM->fresh()->featured_media_id)->toBeNull()
            ->and($product->fresh()->featured_media_id)->toBe($productFeatured->id);

        expect(DB::table('product_media')->where('product_id', $product->id)->count())->toBe(0);
    });
});

// =====================================================================
// B5 -- in-page inheritance reactivity. FP-V8: changing the parent's image and then RELOADING is
// the false pass -- only an in-session change (no reload) discriminates a snapshot implementation.
// =====================================================================

test('changing the products featured image without reloading changes what an inheriting variant shows', function () {
    // Fixtures arranged ONCE, outside retry(), for the same reason as the three tests above.
    $actor = variantBuilderJourneyActor();
    $this->actingAs($actor);

    $oldFeatured = Media::factory()->create(['title' => 'Old Product Featured']);
    $newFeatured = Media::factory()->create(['title' => 'New Product Featured']);
    $product = Product::factory()->create(['sku' => '0001', 'featured_media_id' => $oldFeatured->id]);
    [$talla, $m] = variantBuilderBrowserAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    retry(3, function () use ($product, $newFeatured): void {
        $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

        $page->assertSee('Old Product Featured');

        $page->click('@open-featured-image-gallery')
            ->assertNoJavaScriptErrors()
            ->click(variantBuilderGalleryModal('media-tile-'.$newFeatured->id))
            ->click(variantBuilderGalleryModal('media-confirm'))
            ->assertNoJavaScriptErrors()
            ->wait(1);

        // No reload -- the inheriting variant's own thumbnail follows within the same session.
        $page->assertSee('New Product Featured')
            ->assertDontSee('Old Product Featured');
    });
});

// =====================================================================
// B6 -- each of D-4.5's three collision messages is VISIBLE, and it is the RIGHT one for each case
// (R-F).
// =====================================================================

test('a duplicate combination refusal shows the duplicate-combination message', function () {
    $actor = variantBuilderJourneyActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantBuilderBrowserAttribute('Talla', 'M');
    app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->click('@open-create-variant-form')
        ->select('[name="combinationRows.0.typeId"]', $talla->id)
        ->select('[name="combinationRows.0.valueId"]', $m->id)
        ->fill('price', '25.00')
        ->fill('stock', '1')
        ->click('@save-variant')
        ->assertNoJavaScriptErrors()
        ->assertSee(__('products.variants.duplicate_combination'));
});

test('a cross-table sku collision refusal shows the derived-sku-taken message naming the conflict', function () {
    $actor = variantBuilderJourneyActor();
    $this->actingAs($actor);

    Product::factory()->create(['sku' => '0001-M']);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantBuilderBrowserAttribute('Talla', 'M');

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->click('@open-create-variant-form')
        ->select('[name="combinationRows.0.typeId"]', $talla->id)
        ->select('[name="combinationRows.0.valueId"]', $m->id)
        ->fill('price', '19.99')
        ->fill('stock', '5')
        ->click('@save-variant')
        ->assertNoJavaScriptErrors()
        ->assertSee(__('products.variants.derived_sku_taken', ['sku' => '0001-M']));
});

test('an attribute value reducing to nothing shows the empty-segment message naming the value', function () {
    $actor = variantBuilderJourneyActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['sku' => '0001']);
    [$type, $value] = variantBuilderBrowserAttribute('Simbolo', '★');

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->click('@open-create-variant-form')
        ->select('[name="combinationRows.0.typeId"]', $type->id)
        ->select('[name="combinationRows.0.valueId"]', $value->id)
        ->fill('price', '19.99')
        ->fill('stock', '5')
        ->click('@save-variant')
        ->assertNoJavaScriptErrors()
        ->assertSee(__('products.variants.derived_sku_empty_segment', ['value' => '★']));
});

// =====================================================================
// B7 -- the disabled row action does not respond to a click, its data-test hook is present on both
// branches, and the tooltip appears on hover of the ui-tooltip WRAPPER (the button itself is
// pointer-events-none) -- while an ENABLED row renders no data-flux-tooltip-content at all.
// =====================================================================

test('a disabled row action does not respond to a click and shows its tooltip on the wrapper', function () {
    $creator = variantBuilderJourneyActor();
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantBuilderBrowserAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$m->id], '19.99', 5);

    $viewer = User::factory()->create();
    $viewer->givePermissionTo(['products.view']);
    $this->actingAs($viewer);

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->assertPresent('@delete-variant-'.$variant->id);

    $page->click('@delete-variant-'.$variant->id)->assertNoJavaScriptErrors();

    // The click on a pointer-events-none control must not have opened the delete modal.
    $page->assertDontSee(__('products.variants.delete.title'));
})->skip(
    'This scenario is unreachable through the real routed page, which is not a gap this story can '
    .'close: App\Livewire\Products\Editor::mount() (story 0027, out of scope here) authorizes the '
    .'STRONGER `update` ability -- requiring products.edit, not merely products.view -- as its own '
    .'first statement for ANY existing-product visit, so a products.view-only actor is refused with a '
    .'403 by the host PAGE itself, before App\Livewire\Products\VariantBuilder is ever mounted. '
    .'VariantBuilder::canManageVariants is computed from that identical ability (D-10 note 4 -- by '
    .'design, so the disabled-row hint can never drift from what a click would do), so by the time an '
    .'actor has reached this page at all they already satisfy it too -- there is no permission level '
    .'that reaches the page while still seeing a disabled variant action, given 0027\'s existing page '
    .'gate. The identical scenario IS covered where it is actually reachable: at the component level, '
    .'bypassing the route entirely via Livewire::test() -- see '
    .'VariantBuilderAuthorizationTest.php\'s "canManageVariants reflects the same update ability every '
    .'mutating method authorizes against" and VariantBuilderRenderingTest.php\'s "every row action '
    .'carries its data-test hook on both the enabled and the disabled branch".',
);

// =====================================================================
// B8 -- assertNoJavaScriptErrors() after every step of a full journey.
// =====================================================================

test('a full journey through the builder raises no javascript errors at any step', function () {
    // Fixtures arranged ONCE, outside retry() -- the same reason as every retried test above.
    // Note the journey itself deletes the variant it creates, so a fully-succeeded attempt leaves
    // the combination free again for a hypothetical next attempt -- but the PRODUCT itself (a
    // fixed sku '0001') would still collide on products.sku_unique if a partially-succeeded first
    // attempt (created the product, failed before or during the delete) triggered a retry with the
    // fixture still inside the closure.
    $actor = variantBuilderJourneyActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantBuilderBrowserAttribute('Talla', 'M');
    $ownImage = Media::factory()->create(['title' => 'Journey Own Image']);

    retry(3, function () use ($product, $talla, $m, $ownImage): void {
        $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

        $page->click('@open-create-variant-form')->assertNoJavaScriptErrors();

        $page->select('[name="combinationRows.0.typeId"]', $talla->id)->assertNoJavaScriptErrors();
        $page->select('[name="combinationRows.0.valueId"]', $m->id)->assertNoJavaScriptErrors();

        $page->fill('price', '19.99')->assertNoJavaScriptErrors();
        $page->fill('stock', '5')->assertNoJavaScriptErrors();

        $page->click('@save-variant')->assertNoJavaScriptErrors()->wait(1);

        $variant = DB::table('product_variants')->where('product_id', $product->id)->firstOrFail();

        $page->click('@open-variant-image-gallery-'.$variant->id)->assertNoJavaScriptErrors();
        $page->click(variantBuilderGalleryModal('media-tile-'.$ownImage->id))->assertNoJavaScriptErrors();
        $page->click(variantBuilderGalleryModal('media-confirm'))->assertNoJavaScriptErrors()->wait(1);

        $page->click('@delete-variant-'.$variant->id)->assertNoJavaScriptErrors();
        $page->assertSee(__('products.variants.delete.irreversible'));
        $page->click('@cancel-delete-variant')->assertNoJavaScriptErrors();

        $page->click('@delete-variant-'.$variant->id)->assertNoJavaScriptErrors();
        $page->click('@confirm-delete-variant')->assertNoJavaScriptErrors()->wait(1);

        $page->assertNoJavaScriptErrors();
    });
});

// =====================================================================
// Story 0031a -- the cartesian generator UI, appended to this same file/component (D-17.1).
//
// B9 -- the generate modal is a <dialog> that opens over the page and closes cleanly (D-17.1's
// whole safety argument: unlike the single-variant create form, this modal opens no nested media
// gallery, so the native <dialog>-nesting concern this app has elsewhere never applies here), with
// the summary panel readable AFTER it closes and the variants table visible behind it (D-17.3's
// "readable while looking at the table it changed"). Both are DOM-layer claims a component test
// cannot see.
// =====================================================================

test('the generate modal opens as a dialog over the page and closes cleanly, leaving the summary readable above the table it changed', function () {
    $actor = variantBuilderJourneyActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['sku' => '0001']);
    [$talla] = variantBuilderBrowserAttribute('Talla', 'M');

    retry(3, function () use ($product, $talla): void {
        $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

        // Nothing generated yet -- no summary panel on the page at all.
        $page->assertNotPresent('@generate-summary');

        $page->click('@open-generate-combinations')->assertNoJavaScriptErrors();

        // The picker is a genuine open <dialog>, not merely a hidden block in the DOM.
        $page->assertPresent('dialog[open] [data-test="generate-type-'.$talla->id.'"]');

        $page->click('@generate-type-'.$talla->id)->assertNoJavaScriptErrors();
        $page->click('@confirm-generate-combinations')->assertNoJavaScriptErrors()->wait(1);

        // The dialog is gone -- not merely covered -- and the summary is readable above the
        // table it just changed, with the created variant visible in that same table.
        $page->assertNotPresent('dialog[open]');
        $page->assertPresent('@generate-summary');
        $page->assertSee(__('products.variants.generate.result_title'));

        $variant = DB::table('product_variants')->where('product_id', $product->id)->firstOrFail();
        $page->assertPresent('@variant-row-'.$variant->id);
    });
});

// =====================================================================
// B10 -- the live combination count updates as checkboxes are toggled, driven by genuine clicks.
// Same failure mode as 0031's own B2/B3: a missing `.live` on the checkbox group is invisible to
// Livewire::test()->set() (0031's FP-V4) and would leave the count frozen in a real browser while
// every Feature test stays green.
// =====================================================================

test('the live combination count updates as checkboxes are toggled by genuine clicks', function () {
    $actor = variantBuilderJourneyActor();
    $this->actingAs($actor);

    $product = Product::factory()->create(['sku' => '0001']);
    [$talla] = variantBuilderBrowserAttribute('Talla', '38', 0);
    ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $talla->id,
        'value' => '39',
        'position' => 1,
    ]);
    ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $talla->id,
        'value' => '40',
        'position' => 2,
    ]);
    [$color] = variantBuilderBrowserAttribute('Color', 'Black', 1);
    ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $color->id,
        'value' => 'White',
        'position' => 1,
    ]);

    retry(3, function () use ($product, $talla, $color): void {
        $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

        $page->click('@open-generate-combinations')->assertNoJavaScriptErrors();

        // Nothing selected yet.
        $page->assertSee(trans_choice('products.variants.generate.count', 0, ['count' => 0]));

        // Talla alone: 3 values -> 3 combinations.
        $page->click('@generate-type-'.$talla->id)->assertNoJavaScriptErrors()->wait(1);
        $page->assertSee(trans_choice('products.variants.generate.count', 3, ['count' => 3]));

        // Talla (3) x Color (2) = 6, never 4 or 5 -- the same squared-fixture trap the Feature
        // test for this multiplication already guards against, here proven through a real click.
        $page->click('@generate-type-'.$color->id)->assertNoJavaScriptErrors()->wait(1);
        $page->assertSee(trans_choice('products.variants.generate.count', 6, ['count' => 6]));

        // Unchecking one drops the count back down -- proves the binding is genuinely live in
        // both directions, not merely appending on click.
        $page->click('@generate-type-'.$color->id)->assertNoJavaScriptErrors()->wait(1);
        $page->assertSee(trans_choice('products.variants.generate.count', 3, ['count' => 3]));
    });
});
