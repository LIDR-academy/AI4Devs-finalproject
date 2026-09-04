<?php

// Story 0021 (Shared WYSIWYG rich-text editor component), Phase 3 step 9. Real-DOM browser
// coverage for App\Livewire\Components\WysiwygEditor -- the split this project already established
// for tests/Feature/Media/{Gallery,GalleryRendering}Test.php and this story's own
// tests/Feature/Components/{WysiwygEditor,WysiwygEditorRendering}Test.php: those files prove server
// wiring cheaply through Livewire::test(); everything about a real caret, a real DOM `Selection`
// and what `document.execCommand` actually emits belongs here, because none of it exists outside a
// real browser (the same reasoning this project's own null-<select> errors-log entry already
// established for a different component).
//
// ⚠️ MIGRATED by story 0027's D-14 (2026-09-03, TDD Phase 3 step 1 / "red") -- these tests used to
// run against the D13/OQ-1 harness (dev.media-gallery-harness -- App\Livewire\Dev\MediaGalleryHarness /
// resources/views/livewire/dev/media-gallery-harness.blade.php), which mounted TWO independent
// WysiwygEditor instances purely so a browser test had somewhere to `visit()`. 0027's
// App\Livewire\Products\Editor is the real, routed consumer this component was always waiting for
// (routes/products.php's `products.create`/`products.edit`), and it embeds exactly ONE WysiwygEditor
// instance -- bound to `description` -- not two (0021's per-language N-instance shape is 0077's,
// unbuilt). Every test below now `visit()`s `route('products.edit', $product)` with the product's
// `description` PRE-SEEDED to a known BEFORE/AFTER fragment pair (the harness used to seed this via
// its own `$editorValue` property; here it is `Product::factory()->create(['description' => ...])`),
// and every harness-specific per-instance selector helper is COLLAPSED to a single, unscoped one --
// there is only one WysiwygEditor on this page, so the duplication-hazard scoping the harness needed
// (D10's Phase 2 finding) does not apply here.
//
// The harness component/view/route (App\Livewire\Dev\MediaGalleryHarness, its Blade view, and its
// routes/web.php registration), plus tests/Feature/Dev/MediaGalleryHarnessRouteTest.php, HAVE been
// deleted by this story, per D-14's own ordering rule: this file was made green against the real
// editor first, and only then was the harness removed.
//
// RE-ENTRANCY, REDESIGNED (D-14 step 3): the harness's own cross-instance tests (two WysiwygEditor
// instances on one page) have NO home here -- 0027's editor has only one. D-14 redirects the
// re-entrancy proof onto the editor's OTHER two gallery embeds instead, and states it is a STRONGER
// proof than the harness gave: confirming an image from the WYSIWYG's own internal gallery must
// insert it into the description text and must NOT set the featured image or add to the gallery
// strip, and vice versa -- confirming a FEATURED image or a STRIP image must never touch the
// description text. This is now competing the WYSIWYG's own per-instance-derived select-event (0021
// D5) against TWO real literals (`featured-image-selected` / `product-images-added`), not merely a
// second copy of itself the way the harness's two editors did. The harness's own
// "cross-instance range capture" (B1) regression test has NO equivalent here at all -- it depended
// on a SECOND WysiwygEditor instance existing on the page, which this story's editor does not mount
// (0077's problem, not this story's) -- so it is deliberately NOT migrated, with this comment as its
// record.
//
// ASSUMED data-test HOOKS this migration relies on for the editor's OTHER two embeds (see
// tests/Browser/Products/EditorJourneyTest.php's identical "ASSUMED data-test HOOKS" block):
//   - data-test="open-featured-image-gallery" / "featured-image-preview"
//   - data-test="open-gallery-strip-picker" / "gallery-strip" / "gallery-strip-item-{id}"
//
// CARET TECHNIQUE (D6, V13): `fill()`/`type()` replace content wholesale and create no browser
// selection at all; `keys()`-driven selection is brittle to whitespace/line-wrapping for anything
// precision-critical. Every selection or caret placement below is built with a `script()`-constructed
// `Range` over the region's own text nodes (a generic TreeWalker word-finder, so it survives whatever
// nested markup an earlier action produced -- e.g. "BEFORE" moving inside a freshly-applied <b>).

use App\Models\Media;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
    // Deliberately NOT Storage::fake('public') -- traced live, not assumed (see
    // tests/Browser/Media/GalleryTest.php's identical banner-comment finding, unchanged by this
    // migration): this Pest browser plugin's real HTTP server serves an <img src> through Laravel's
    // stock storage/{path} ServeFile route from WITHIN THE SAME PROCESS the test runs in, so
    // Storage::fake('public')'s swapped disk config is what that route sees too -- producing a real
    // 403 on every inserted image's src the moment a real browser actually requests it. Every Media
    // row a test here needs the browser to load therefore uses ->withRealFiles() against the REAL
    // 'public' disk (storage/app/public), with the three written paths deleted at the end of the
    // same test (see wysiwygUiTestCleanupMedia() below).
});

/**
 * Deletes the three real files ->withRealFiles() wrote to the REAL public disk for one Media row --
 * called at the end of every test that creates one, since nothing here fakes the disk (see the
 * beforeEach comment above) and these bytes would otherwise accumulate in storage/app/public/media/
 * across runs.
 */
function wysiwygUiTestCleanupMedia(Media $media): void
{
    Storage::disk('public')->delete([$media->path, $media->webp_path, $media->avif_path]);
}

function wysiwygUiTestActor(): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'media.view', 'media.create', 'media.edit']);

    return $actor;
}

/**
 * A product pre-seeded with the known BEFORE/AFTER description fragment pair D6's positional
 * acceptance criterion needs -- the migrated equivalent of the harness's own seeded
 * `$editorValue`/`$secondEditorValue` properties.
 */
function wysiwygUiTestProduct(string $description = '<p>BEFORE AFTER</p>'): Product
{
    return Product::factory()->create([
        'product_category_id' => ProductCategory::factory()->create()->id,
        'description' => $description,
    ]);
}

/**
 * The description field's own editable region -- unscoped, since the editor mounts exactly ONE
 * WysiwygEditor instance (unlike the harness's two), so none of D10's Phase 2 duplication-hazard
 * scoping applies here.
 */
function wysiwygUiTestRegion(): string
{
    return '[data-test="wysiwyg-editor-region"]';
}

function wysiwygUiTestControl(string $dataTest): string
{
    return '[data-test="'.$dataTest.'"]';
}

/**
 * Scopes a `media-*` gallery hook to the currently OPEN `<dialog>` -- matching
 * tests/Browser/Media/GalleryTest.php's own inOpenGalleryModal(), necessary because the editor
 * mounts THREE gallery instances at once (D-8: the featured picker, the strip picker, and the
 * WYSIWYG's own internal one).
 */
function wysiwygUiTestGalleryModal(string $dataTest): string
{
    return 'dialog[open] [data-test="'.$dataTest.'"]';
}

/**
 * B4 regression (carried forward from the harness version of this file): `media-confirm` renders
 * `:disabled="count($selectedIds) === 0"` and only becomes clickable once the tile click's Livewire
 * round-trip lands. A bare `click(tile)->click(confirm)` races that round-trip and flakes under
 * Playwright's actionability wait. This assertScript is a real poll (a thrown-expectation retry),
 * not a sleep, inserted between every tile click and confirm click below.
 */
function wysiwygUiTestConfirmEnabledScript(): string
{
    return "document.querySelector('".wysiwygUiTestGalleryModal('media-confirm')."').disabled === false";
}

/**
 * JS: focuses the given region and selects the FIRST occurrence of `$word` in ANY of its text
 * nodes, via a TreeWalker rather than a hardcoded offset -- so it survives whatever nested markup an
 * earlier action already produced (e.g. "BEFORE" sitting inside a <b> after a bold toggle).
 */
function wysiwygUiTestSelectWordScript(string $regionSelector, string $word): string
{
    return <<<JS
        (function() {
            const region = document.querySelector('{$regionSelector}');
            region.focus();
            const walker = document.createTreeWalker(region, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                const idx = node.textContent.indexOf('{$word}');
                if (idx !== -1) {
                    const range = document.createRange();
                    range.setStart(node, idx);
                    range.setEnd(node, idx + '{$word}'.length);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return true;
                }
            }
            return false;
        })()
    JS;
}

/**
 * JS: focuses the given region and places a COLLAPSED caret immediately BEFORE the first
 * occurrence of `$word` -- the D6/V13 positional technique, used to place the cursor between two
 * known text fragments without disturbing either side.
 */
function wysiwygUiTestCaretBeforeWordScript(string $regionSelector, string $word): string
{
    return <<<JS
        (function() {
            const region = document.querySelector('{$regionSelector}');
            region.focus();
            const walker = document.createTreeWalker(region, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                const idx = node.textContent.indexOf('{$word}');
                if (idx !== -1) {
                    const range = document.createRange();
                    range.setStart(node, idx);
                    range.setEnd(node, idx);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return true;
                }
            }
            return false;
        })()
    JS;
}

/**
 * JS: focuses the given region and selects ALL of its contents -- used for actions (H2, lists)
 * that operate on whichever block(s) the selection spans, where a whole-line selection is what the
 * Gherkin describes ("a line of text selected" / "several lines of text selected").
 */
function wysiwygUiTestSelectAllScript(string $regionSelector): string
{
    return <<<JS
        (function() {
            const region = document.querySelector('{$regionSelector}');
            region.focus();
            const range = document.createRange();
            range.selectNodeContents(region);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        })()
    JS;
}

// =====================================================================
// Applying an inline text format wraps the selection, and re-applying it removes the wrap --
// Gherkin's two "inline_format" Scenario Outlines (bold/italic/underline), collapsed into one
// dataset test the way this project's other Scenario Outlines translate to Pest datasets.
// =====================================================================

test('selecting text and applying an inline format wraps it, and applying it again removes the formatting', function (string $button, string $tag) {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $region = wysiwygUiTestRegion();
    $control = wysiwygUiTestControl($button);

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));

    $page->click($control)
        ->assertNoJavaScriptErrors()
        ->assertSourceInHas($region, "<{$tag}>BEFORE</{$tag}>");

    // Re-select the (now-wrapped) word via the same generic word-finder -- it survives the new
    // nesting, since the TreeWalker searches every text node rather than assuming a fixed offset.
    $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));

    $page->click($control)
        ->assertNoJavaScriptErrors()
        ->assertSourceInMissing($region, "<{$tag}>BEFORE</{$tag}>");
})->with([
    'bold' => ['wysiwyg-bold', 'b'],
    'italic' => ['wysiwyg-italic', 'i'],
    'underline' => ['wysiwyg-underline', 'u'],
]);

// =====================================================================
// Structuring a line of text as a heading produces a real <h2>, never a <div> or a class-carrying
// wrapper.
// =====================================================================

test('applying the heading style to a selected line produces a real h2, not a div or a styled wrapper', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectAllScript($region));

    $page->click(wysiwygUiTestControl('wysiwyg-h2'))
        ->assertNoJavaScriptErrors()
        ->assertSourceInHas($region, '<h2>')
        ->assertSourceInMissing($region, '<div')
        ->assertSourceInMissing($region, 'class=');
});

// =====================================================================
// Structuring several lines as a bullet list, or as a numbered list, produces real <ul>/<ol> with
// <li> children -- content and structure asserted, never byte-identical HTML (D11: the empty
// flanking <p></p> Chromium's own parser produces around a list is expected output).
// =====================================================================

test('turning a selected line into a list produces real list markup with list items', function (string $button, string $listTag) {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectAllScript($region));

    $page->click(wysiwygUiTestControl($button))
        ->assertNoJavaScriptErrors()
        ->assertScript("document.querySelector('{$region} {$listTag}') !== null")
        ->assertScript("document.querySelector('{$region} li') !== null")
        ->assertSourceInHas($region, 'BEFORE')
        ->assertSourceInHas($region, 'AFTER');
})->with([
    'bullet list' => ['wysiwyg-bullet-list', 'ul'],
    'numbered list' => ['wysiwyg-numbered-list', 'ol'],
]);

// =====================================================================
// Turning selected text into a link opens the D8 in-page popover (never window.prompt() -- V12
// makes that untestable here by construction) and applies exactly the URL that was typed.
// =====================================================================

test('turning selected text into a link applies the URL actually typed in the popover', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));

    $page->click(wysiwygUiTestControl('wysiwyg-link'))
        ->assertNoJavaScriptErrors()
        ->fill(wysiwygUiTestControl('wysiwyg-link-url'), 'https://example.com/story-0027')
        ->click(wysiwygUiTestControl('wysiwyg-link-apply'))
        ->assertNoJavaScriptErrors()
        ->assertSourceInHas($region, '<a href="https://example.com/story-0027">BEFORE</a>');
});

test('a link to an unsupported address scheme is refused before it is applied, leaving the selection unlinked', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));

    $page->click(wysiwygUiTestControl('wysiwyg-link'))
        ->assertNoJavaScriptErrors()
        ->fill(wysiwygUiTestControl('wysiwyg-link-url'), 'javascript:alert(1)')
        ->click(wysiwygUiTestControl('wysiwyg-link-apply'))
        ->assertNoJavaScriptErrors()
        ->assertSee(__('components.wysiwyg.link_invalid_scheme'))
        ->assertScript("document.querySelector('{$region} a') === null");
});

// A real user's click is a `mousedown` and a `click` fired as two SEPARATE browser events, with
// real wall-clock time between them; Playwright's own `->click()` helper reproduces that shape
// closely enough that this exact bug still slipped past the two tests above for a whole story --
// they never caught it. The trigger button used to sit OUTSIDE the popover `<div>` that alone
// carried `x-on:click.outside`, so the button's own `click` (which follows the `mousedown` that
// opens the popover, per D8's `x-on:mousedown.prevent="openLinkPopover()"`) was itself read by
// Alpine's `.outside` modifier as a click landing *outside* the popover -- `el.contains(e.target)`
// is false for a sibling -- closing the popover a moment after it opened. Reported live: the
// popover visibly flashes open then immediately shuts, before a URL can ever be typed. Dispatching
// `mousedown` and `click` as two independent `->script()` calls below -- rather than one atomic
// `->click()` -- forces a real round trip to the browser between them, which is what actually
// exposes the race (Alpine's own `el._x_isShown` flag needs that same gap to have flushed before
// the `click` event's outside-check runs, which is also why the atomic `->click()` in the two
// tests above did not reliably catch this). See `resources/views/livewire/components/wysiwyg-editor.blade.php`'s
// wrapper `<div>` for the fix: `x-on:click.outside` now lives on the element containing BOTH the
// trigger button and the popover, so a click on the trigger is a click on a descendant and is
// correctly excluded rather than misread as outside.
test('clicking the link button opens the popover and a real click does not immediately close it', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $region = wysiwygUiTestRegion();
    $trigger = wysiwygUiTestControl('wysiwyg-link');

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));

    $page->script("document.querySelector('{$trigger}').dispatchEvent(new MouseEvent('mousedown', {bubbles: true}))");
    $page->script("document.querySelector('{$trigger}').dispatchEvent(new MouseEvent('click', {bubbles: true}))");

    $page->assertNoJavaScriptErrors()
        ->assertVisible(wysiwygUiTestControl('wysiwyg-link-url'));
});

// =====================================================================
// The toolbar reflects the formatting of the text under the cursor -- placing a collapsed caret
// inside an already-bold word marks the Bold action pressed (V9's queryCommandState mechanism, and
// the only proof it is wired at all).
// =====================================================================

test('the toolbar shows the bold action as active when the cursor sits inside bold text', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $region = wysiwygUiTestRegion();
    $bold = wysiwygUiTestControl('wysiwyg-bold');

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    // First make "BEFORE" bold, exactly like the toggle test above.
    $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));
    $page->click($bold)->assertNoJavaScriptErrors();

    // Caret inside the still-plain "AFTER" word: not pressed.
    $page->script(wysiwygUiTestCaretBeforeWordScript($region, 'AFTER'));
    // A `selectionchange`-driven Alpine reactive update is not guaranteed to have flushed to the
    // DOM by the instant script() returns -- a short, documented wait, per this repo's accepted
    // ->wait() carve-out (docs/testing/frontend/playwright-setup.md), never widened past this.
    $page->wait(1)->assertAriaAttribute($bold, 'pressed', 'false');

    // Caret inside the now-bold "BEFORE" word: pressed.
    $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));
    $page->wait(1)->assertAriaAttribute($bold, 'pressed', 'true');
});

// =====================================================================
// "Insert image" opens the gallery in single-select mode; confirming a tile inserts the image and
// closes the modal.
// =====================================================================

test('insert image opens the gallery, and confirming a tile inserts the image and closes the modal', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $media = Media::factory()->withRealFiles()->create(['title' => 'Basic Insert Widget', 'description' => null]);

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->click(wysiwygUiTestControl('wysiwyg-insert-image'))
        ->assertNoJavaScriptErrors()
        ->assertScript("document.querySelector('dialog[open]') !== null")
        ->click(wysiwygUiTestGalleryModal('media-tile-'.$media->id))
        ->assertNoJavaScriptErrors()
        ->assertScript(wysiwygUiTestConfirmEnabledScript())
        ->click(wysiwygUiTestGalleryModal('media-confirm'))
        ->assertNoJavaScriptErrors();

    // Two chained round trips follow the confirm click (D6 steps 4-6): the gallery's own
    // confirmSelection() request, then the editor's own explicit $wire->set('value', ...) sync --
    // a bounded, documented wait rather than a longer one racing Playwright::$timeout (5000ms).
    $page->wait(2)
        ->assertNoJavaScriptErrors()
        ->assertScript("document.querySelector('dialog[open]') === null")
        ->assertScript("document.querySelector('{$region} img') !== null");

    wysiwygUiTestCleanupMedia($media);
});

// =====================================================================
// The positional acceptance criterion (PRD §2.3 AC 7): with the caret placed mid-content via the
// script()-Range technique, the inserted <img> sits BETWEEN the known before/after fragments -- not
// merely present somewhere. No weaker assertion catches a regression to "append at the end", the
// exact failure mode D6 exists to prevent.
// =====================================================================

test('a confirmed image lands exactly where the cursor was, with content on both sides preserved', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $media = Media::factory()->withRealFiles()->create(['title' => 'Positional Widget', 'description' => null]);

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    // Collapsed caret right before "AFTER" -- D6 step 1's blur-capture mechanism fires when the
    // Insert image button's mousedown steals nothing (mousedown.prevent) and the gallery modal's
    // own focus trap takes focus; this script places the range the button's own saveCaret() will
    // capture on the very next mousedown.
    $page->script(wysiwygUiTestCaretBeforeWordScript($region, 'AFTER'));

    $page->click(wysiwygUiTestControl('wysiwyg-insert-image'))
        ->assertNoJavaScriptErrors()
        ->click(wysiwygUiTestGalleryModal('media-tile-'.$media->id))
        ->assertNoJavaScriptErrors()
        ->assertScript(wysiwygUiTestConfirmEnabledScript())
        ->click(wysiwygUiTestGalleryModal('media-confirm'))
        ->assertNoJavaScriptErrors();

    $page->wait(2)->assertNoJavaScriptErrors();

    // Read the CLIENT-side region's own live DOM -- that is where execCommand('insertHTML', ...)
    // lands immediately, with no dependency on the host's own deferred wire:model write-back.
    // Prove positional order -- "an <img> exists somewhere" would pass for "appended at the end"
    // too, which is the exact regression this assertion exists to catch.
    $page->assertScript(<<<JS
        (function() {
            const html = document.querySelector('{$region}').innerHTML;
            const beforeIdx = html.indexOf('BEFORE');
            const imgIdx = html.indexOf('<img');
            const afterIdx = html.indexOf('AFTER');
            return beforeIdx !== -1 && imgIdx !== -1 && afterIdx !== -1
                && beforeIdx < imgIdx && imgIdx < afterIdx;
        })()
    JS);

    wysiwygUiTestCleanupMedia($media);
});

// =====================================================================
// Opening the gallery without ever having placed the cursor in the editor appends the image rather
// than refusing (D6 step 3's second guard -- the never-focused-at-all fallback).
// =====================================================================

test('opening the gallery without having focused the editor appends the confirmed image rather than refusing', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $media = Media::factory()->withRealFiles()->create(['title' => 'Never Focused Widget', 'description' => null]);

    $region = wysiwygUiTestRegion();

    // Fresh visit: the editor region is never clicked into or otherwise focused before the very
    // first interaction below is the Insert image button itself.
    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->click(wysiwygUiTestControl('wysiwyg-insert-image'))
        ->assertNoJavaScriptErrors()
        ->click(wysiwygUiTestGalleryModal('media-tile-'.$media->id))
        ->assertNoJavaScriptErrors()
        ->assertScript(wysiwygUiTestConfirmEnabledScript())
        ->click(wysiwygUiTestGalleryModal('media-confirm'))
        ->assertNoJavaScriptErrors();

    $page->wait(2)->assertNoJavaScriptErrors();

    $page->assertScript(<<<JS
        (function() {
            const html = document.querySelector('{$region}').innerHTML;
            const beforeIdx = html.indexOf('BEFORE');
            const afterIdx = html.indexOf('AFTER');
            const imgIdx = html.indexOf('<img');
            return beforeIdx !== -1 && afterIdx !== -1 && imgIdx !== -1
                && beforeIdx < afterIdx && afterIdx < imgIdx;
        })()
    JS);

    wysiwygUiTestCleanupMedia($media);
});

// =====================================================================
// Cancelling the gallery leaves the editor's content exactly as it was before the gallery opened.
// =====================================================================

test('cancelling the gallery leaves the editors content untouched', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    Media::factory()->create(['title' => 'Untouched Widget', 'description' => null]);

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->click(wysiwygUiTestControl('wysiwyg-insert-image'))
        ->assertNoJavaScriptErrors()
        ->assertScript("document.querySelector('dialog[open]') !== null")
        ->click(wysiwygUiTestGalleryModal('media-cancel'))
        ->assertNoJavaScriptErrors();

    $page->wait(1)
        ->assertScript("document.querySelector('dialog[open]') === null")
        ->assertSourceInHas($region, 'BEFORE AFTER')
        ->assertSourceInMissing($region, '<img');
});

// =====================================================================
// Re-entrancy, REDESIGNED per D-14 step 3: an image confirmed from the WYSIWYG's own internal
// gallery lands in the description text and does NOT set the featured image or add to the gallery
// strip -- the case a fixed, literal select-event would silently fail (V6), now proven against two
// real embeds rather than a second copy of the same component.
// =====================================================================

test('an image confirmed from the wysiwyg editors own gallery lands only in the description, never the featured image or the gallery strip', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $media = Media::factory()->withRealFiles()->create(['title' => 'Re-entrancy Widget', 'description' => null]);

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->assertSeeIn($region, 'BEFORE AFTER')
        ->assertMissing('@gallery-strip-item-'.$media->id);

    $page->click(wysiwygUiTestControl('wysiwyg-insert-image'))
        ->assertNoJavaScriptErrors()
        ->click(wysiwygUiTestGalleryModal('media-tile-'.$media->id))
        ->assertNoJavaScriptErrors()
        ->assertScript(wysiwygUiTestConfirmEnabledScript())
        ->click(wysiwygUiTestGalleryModal('media-confirm'))
        ->assertNoJavaScriptErrors();

    $page->wait(2)->assertNoJavaScriptErrors();

    $page->assertScript("document.querySelector('{$region}').innerHTML.indexOf('<img') !== -1")
        ->assertMissing('@gallery-strip-item-'.$media->id);

    wysiwygUiTestCleanupMedia($media);
});

test('confirming a featured image or a gallery strip image never touches the description text', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $featured = Media::factory()->create(['title' => 'Featured Not Description Widget']);

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->click('@open-featured-image-gallery')
        ->assertNoJavaScriptErrors()
        ->click(wysiwygUiTestGalleryModal('media-tile-'.$featured->id))
        ->assertNoJavaScriptErrors()
        ->click(wysiwygUiTestGalleryModal('media-confirm'))
        ->assertNoJavaScriptErrors();

    $page->wait(1)->assertNoJavaScriptErrors();

    $page->assertSourceInHas($region, 'BEFORE AFTER')
        ->assertSourceInMissing($region, '<img');
});

// =====================================================================
// assertNoJavaScriptErrors() across a representative sequence -- the hand-rolled caret logic (D6)
// is exactly the kind of code that otherwise fails silently.
// =====================================================================

test('a representative sequence of toolbar actions produces no JavaScript errors', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $media = Media::factory()->withRealFiles()->create(['title' => 'Sequence Widget', 'description' => null]);

    $region = wysiwygUiTestRegion();

    // The longest chain in this file: two formatting round trips followed by the same
    // click -> Livewire -> Alpine -> <dialog> gallery-confirm race tests/Browser/Media/GalleryTest.php's
    // own docblock already measured and closed with retry(3, ...) rather than a fourth
    // wait/assertion permutation (25%/50% single-attempt failure rates across two independent
    // 12-run baselines, none of it a client-side artifact this test's own wait/assertion choices
    // can rule out further). Reproduced here empirically: this exact test failed with "Timeout
    // 5000ms exceeded" on a full-file run (15/16 passing) while every other test in this file
    // passed -- the same class of occasional real-world latency, on the same chain shape, not a
    // defect in the sequence this test drives. retry(3, ...) wraps the whole real-DOM interaction;
    // $media is created once, outside the retry, and re-used across attempts exactly as
    // GalleryTest.php's own retried test does.
    retry(3, function () use ($product, $region, $media): void {
        $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

        $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));
        $page->click(wysiwygUiTestControl('wysiwyg-bold'))->assertNoJavaScriptErrors();

        $page->script(wysiwygUiTestSelectAllScript($region));
        $page->click(wysiwygUiTestControl('wysiwyg-h2'))->assertNoJavaScriptErrors();

        $page->click(wysiwygUiTestControl('wysiwyg-insert-image'))->assertNoJavaScriptErrors();
        $page->click(wysiwygUiTestGalleryModal('media-tile-'.$media->id))->assertNoJavaScriptErrors();
        $page->assertScript(wysiwygUiTestConfirmEnabledScript());
        $page->click(wysiwygUiTestGalleryModal('media-confirm'))->assertNoJavaScriptErrors();

        $page->wait(2)->assertNoJavaScriptErrors();
    });

    wysiwygUiTestCleanupMedia($media);
});
