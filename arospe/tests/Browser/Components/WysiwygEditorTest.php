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

/**
 * JS (D-16bis): places a collapsed caret at the very START of the FIRST `<pre><code>` block's own
 * text -- which the block must already carry SOME content (this project's D6/D9-adjacent Chromium
 * quirk, confirmed empirically: `execCommand('insertText', ...)` on a Range anchored inside a
 * genuinely EMPTY inline element inserts the character as a preceding SIBLING of that element
 * instead of inside it, even when the Range is built against an explicitly-appended empty text
 * node; anchored inside an existing non-empty text node, it behaves exactly as expected) -- then
 * types `$text` one character at a time via `document.execCommand('insertText', ...)`. That is a
 * real DOM text mutation that fires a native `input` event per character exactly like keyboard
 * typing does, so this exercises `onEditorInput()`'s live-colouring path on every single keystroke
 * (never one bulk mutation). Kept as one script() call, mirroring this file's own established
 * D6/V13 technique of building caret/selection state via a `Range` rather than driving Playwright's
 * own keyboard input -- there is no existing use of this plugin's `keys()`/`type()` methods against
 * a contenteditable region anywhere in this project to build on instead.
 */
function wysiwygUiTestTypeIntoCodeBlockScript(string $regionSelector, string $text): string
{
    $jsonText = json_encode($text);

    return <<<JS
        (function() {
            const region = document.querySelector('{$regionSelector}');
            const code = region.querySelector('pre code');
            const textNode = code.firstChild;
            region.focus();
            const range = document.createRange();
            range.setStart(textNode, 0);
            range.collapse(true);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            Array.from({$jsonText}).forEach((character) => {
                document.execCommand('insertText', false, character);
            });
        })()
    JS;
}

/**
 * JS (D-16bis bug fix): places a collapsed caret at the given PLAIN-TEXT character `$offset`
 * inside the region's FIRST `pre code` block, walking its text nodes exactly the way
 * resources/js/app.js's own `setCaretOffset()` does -- required because a code block already
 * highlighted at mount time (init()'s own highlightAllCodeBlocks() call) has no single flat text
 * node at all: every character sits inside its own `<span class="hljs-*">`, so a naive
 * `code.firstChild` is a `<span>` element, not text, and offsetting into it means something
 * completely different from offsetting into the block's own source string.
 */
function wysiwygUiTestCaretInCodeBlockScript(string $regionSelector, int $offset): string
{
    return <<<JS
        (function() {
            const region = document.querySelector('{$regionSelector}');
            const code = region.querySelector('pre code');
            region.focus();

            const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
            let remaining = {$offset};
            let node = walker.nextNode();
            let target = code;
            let targetOffset = 0;

            while (node) {
                if (remaining <= node.textContent.length) {
                    target = node;
                    targetOffset = remaining;
                    break;
                }
                remaining -= node.textContent.length;
                node = walker.nextNode();
            }

            const range = document.createRange();
            range.setStart(target, targetOffset);
            range.collapse(true);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.dispatchEvent(new Event('selectionchange'));
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
// Insert code: wrapping a selection (or nothing, at a collapsed caret) in
// <pre><code class="language-{lang}">, followed by an empty paragraph so the caret always has
// somewhere to land after the block. These tests assert the RAW text each language produces --
// deliberately picking selections/languages hljs.highlight() leaves untouched (an unmatched word
// under a `php` grammar, an empty string) so the assertions stay about the insertion shape itself,
// not about hljs's own tokenisation. Live COLOURING (D-16bis) is covered separately, further down
// this file, by a case chosen specifically to exercise it.
// =====================================================================

test('inserting a code block wraps the current selection in pre/code carrying the chosen language class', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));

    $page->select('@wysiwyg-code-language', 'php')
        ->click(wysiwygUiTestControl('wysiwyg-insert-code'))
        ->assertNoJavaScriptErrors()
        ->assertSourceInHas($region, '<pre><code class="language-php">BEFORE</code></pre>');
});

test('inserting a code block with nothing selected produces an empty pre/code block, not an error', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    // A collapsed caret at the very start of the region -- no word selection script run at all.
    $page->click($region);

    $page->select('@wysiwyg-code-language', 'javascript')
        ->click(wysiwygUiTestControl('wysiwyg-insert-code'))
        ->assertNoJavaScriptErrors()
        ->assertSourceInHas($region, '<pre><code class="language-javascript"></code></pre>');
});

// A selection containing markup-significant characters must render as literal code text, never be
// re-parsed as HTML -- the same safe-insertion shape insertImage()'s `alt` already relies on
// (App\Actions\Products\SanitizeProductDescription is a SEPARATE, server-side authoritative check;
// this proves the CLIENT-side insertion path itself never lets a `<`/`>` in selected text become a
// real element). This selection's language (`javascript`) DOES get live-coloured (D-16bis) --
// "if" and "c" both match hljs's own javascript grammar -- so the expected shape below is the
// full, real `hljs.highlight()` output for this exact string (verified directly against the
// installed highlight.js version, not guessed), rather than the earlier tests' deliberately
// hljs-inert selections. hljs escapes `&`/`<`/`>` in its own output exactly like the raw-text
// insertion path already did, so the safety property under test is unaffected by colouring.
test('code inserted from a selection containing angle brackets renders as literal text, not markup', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct('<p>if (a &lt; b) { c(); }</p>');

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectAllScript($region));

    $page->select('@wysiwyg-code-language', 'javascript')
        ->click(wysiwygUiTestControl('wysiwyg-insert-code'))
        ->assertNoJavaScriptErrors()
        ->assertSourceInHas(
            $region,
            '<pre><code class="language-javascript"><span class="hljs-keyword">if</span> (a &lt; b) { <span class="hljs-title function_">c</span>(); }</code></pre>'
        )
        // The negative half: if the "&lt;" text had been re-parsed as a real "<" instead of
        // staying literal, a real (and, per the sanitizer's own allow-list, unsupported) element
        // boundary would exist here -- assert its absence directly rather than only the positive
        // shape above, which a partial mis-escape could still satisfy.
        ->assertSourceInMissing($region, '<b>');
});

// =====================================================================
// The HTML-source toggle: switching to source mode shows the region's raw markup in an editable
// <textarea>; editing it and switching back writes the edited markup into the contenteditable
// region. No round trip through the server sanitizer happens at this stage -- that is
// App\Actions\Products\SanitizeProductDescription's job on SAVE, proven separately in
// tests/Feature/Products/ProductDescriptionSanitizationTest.php; this only proves the CLIENT-side
// toggle itself moves the right text in the right direction.
// =====================================================================

test('toggling to HTML source shows the regions raw markup, and toggling back applies an edit made there', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct('<p>BEFORE AFTER</p>');

    $region = wysiwygUiTestRegion();
    $toggle = wysiwygUiTestControl('wysiwyg-html-source-toggle');
    $source = wysiwygUiTestControl('wysiwyg-html-source');

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->assertVisible($region)
        ->assertMissing($source);

    $page->click($toggle)
        ->assertNoJavaScriptErrors()
        ->assertVisible($source)
        ->assertMissing($region)
        ->assertValue($source, '<p>BEFORE AFTER</p>');

    $page->fill($source, '<p>REPLACED</p><h2>New heading</h2>');

    $page->click($toggle)
        ->assertNoJavaScriptErrors()
        ->assertVisible($region)
        ->assertMissing($source)
        ->assertSourceInHas($region, '<p>REPLACED</p>')
        ->assertSourceInHas($region, '<h2>New heading</h2>');
});

// A round trip through Save proves the edit made in source mode reaches $wire.set('value', ...) --
// toggling alone (the test above) only proves the CLIENT-side DOM swap; this proves it was
// actually synced, not merely displayed. Sanitization is exercised for real here too: the raw
// markup typed into the textarea includes both an allowed tag (<h2>) and one the toolbar could
// never produce and the sanitizer's own allow-list rejects (<div>), so this is also the one place
// in this file where the HTML-source path's full, real save-time behaviour -- not the mid-story
// client toggle alone -- is proven end to end.
test('an edit made in HTML source mode survives a save and reload, sanitized like any other edit', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct('<p>BEFORE AFTER</p>');

    $region = wysiwygUiTestRegion();
    $toggle = wysiwygUiTestControl('wysiwyg-html-source-toggle');
    $source = wysiwygUiTestControl('wysiwyg-html-source');

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->click($toggle)
        ->assertNoJavaScriptErrors()
        ->fill($source, '<h2>Allowed</h2><div class="evil">Not allowed as a div</div>');

    $page->click($toggle)->assertNoJavaScriptErrors();

    // ->click('Save')->assertNoJavaScriptErrors() alone does not wait for save()'s own
    // request/transaction/redirect round trip to finish (a real, previously-diagnosed race in this
    // very screen -- see EditorJourneyTest.php's identical comment); ->assertUrlIs() is the
    // deterministic, self-polling wait on save()'s actual completion signal
    // (redirectRoute('products.index')), not a longer ->wait().
    $page->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertUrlIs(route('products.index'));

    expect($product->fresh()->description)
        ->toBe('<h2>Allowed</h2>Not allowed as a div');
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

// =====================================================================
// Live syntax colouring & Preview mode (D-16bis) -- an explicit revision of this story's earlier
// "display-only highlighting" decision: code is now coloured LIVE, per keystroke, inside the editor
// itself, and a third Preview mode (alongside Edit/HTML source in the same toolbar panel) shows a
// read-only rendering of the whole description. What is ever SYNCED to the server stays plain,
// uncoloured code text throughout -- colouring is a purely client-side rendering affordance
// (resources/js/app.js's buildCleanValue()).
// =====================================================================

test('typing inside a code block colours it live, per keystroke, while the caret survives every re-colour', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct();

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    // A PHP code block wrapping the selected word "BEFORE" -- the exact shape "inserting a code
    // block wraps the current selection" above already proves insertCodeBlock() itself produces.
    // The block therefore already carries text (never an EMPTY <code>) before any typing happens,
    // which the typing helper's own docblock explains is required for
    // execCommand('insertText', ...) to land inside the block at all.
    $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));
    $page->select('@wysiwyg-code-language', 'php')
        ->click(wysiwygUiTestControl('wysiwyg-insert-code'))
        ->assertNoJavaScriptErrors()
        ->assertSourceInHas($region, '<pre><code class="language-php">BEFORE</code></pre>');

    // Typed at the very START of "BEFORE": "echo" alone is a recognised PHP keyword; "$x"
    // immediately after it is a recognised PHP variable -- together they exercise BOTH a mid-word
    // state (no colouring is expected until "echo" is complete: hljs.highlight('ech', {language:
    // 'php'}) is verified to stay plain) and a colour BOUNDARY the caret must cross correctly (the
    // 5th and 6th keystrokes land immediately after an already-coloured span, not inside a plain
    // run of text) -- a broken caret restore would scramble the character order or drop keystrokes
    // (e.g. typing into "BEFORE" itself, or reordering around it), which the exact final shape
    // below -- "echo$x" immediately followed by the UNTOUCHED original "BEFORE" -- would not
    // tolerate.
    $page->script(wysiwygUiTestTypeIntoCodeBlockScript($region, 'echo$x'));

    $page->assertNoJavaScriptErrors()
        ->assertSourceInHas(
            $region,
            '<pre><code class="language-php"><span class="hljs-keyword">echo</span><span class="hljs-variable">$xBEFORE</span></code></pre>'
        );

    // scheduleSync()'s own 400ms debounce (D9) has not necessarily flushed $wire.set('value', ...)
    // the instant the last keystroke's script() call returns -- a bounded, documented wait (this
    // file's own established `->wait()` carve-out, docs/testing/frontend/playwright-setup.md)
    // before Save, never a longer one racing Playwright::$timeout.
    $page->wait(1);

    // The colouring is undone before it is ever synced to the server -- Save and reload proves the
    // PERSISTED value is plain code text, never the hljs-* spans the editor showed live.
    $page->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertUrlIs(route('products.index'));

    expect($product->fresh()->description)
        ->toContain('<pre><code class="language-php">echo$xBEFORE</code></pre>')
        ->not->toContain('hljs-');
});

// =====================================================================
// A code block already present when the editor mounts (i.e. seeded in `$value` from the database)
// is coloured immediately, not only once the administrator starts editing it -- D-16bis's own
// init()-time highlightAllCodeBlocks() call.
// =====================================================================

test('a code block already present in the description is coloured as soon as the editor mounts', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct('<pre><code class="language-php">echo$x</code></pre>');

    $region = wysiwygUiTestRegion();

    visit(route('products.edit', $product))
        ->assertNoJavaScriptErrors()
        ->assertSourceInHas(
            $region,
            '<pre><code class="language-php"><span class="hljs-keyword">echo</span><span class="hljs-variable">$x</span></code></pre>'
        );
});

// =====================================================================
// Preview mode: a third, read-only view alongside Edit/HTML source in the same toolbar panel,
// showing exactly how the description will render -- including the SAME live colouring the editor
// itself already shows, since previewHtml is a snapshot of the editor's own current markup.
// Toggling it a second time returns to the normal Edit view.
// =====================================================================

test('the preview toggle shows a read-only, coloured rendering and hides the editor, and toggling again returns to Edit', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct('<p><b>BEFORE</b> AFTER</p><pre><code class="language-php">echo$x</code></pre>');

    $region = wysiwygUiTestRegion();
    $preview = wysiwygUiTestControl('wysiwyg-preview');
    $previewToggle = wysiwygUiTestControl('wysiwyg-preview-toggle');

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->assertVisible($region)
        ->assertMissing($preview);

    $page->click($previewToggle)
        ->assertNoJavaScriptErrors()
        ->assertVisible($preview)
        ->assertMissing($region)
        // The formatting toolbar is meaningless while nothing is editable -- hidden along with the
        // editor itself (the same `x-show="!htmlSourceMode && !previewMode"` group the HTML-source
        // toggle already hides).
        ->assertMissing(wysiwygUiTestControl('wysiwyg-bold'))
        ->assertSourceInHas($preview, '<b>BEFORE</b>')
        ->assertSourceInHas($preview, '<span class="hljs-keyword">echo</span><span class="hljs-variable">$x</span>');

    $page->click($previewToggle)
        ->assertNoJavaScriptErrors()
        ->assertVisible($region)
        ->assertMissing($preview);
});

// =====================================================================
// Mutual exclusivity between Preview and HTML source (D-16bis): only one of the three modes is ever
// open at once, and switching directly from one to the other commits/refreshes correctly rather
// than leaving stale content behind.
// =====================================================================

test('switching directly from Preview to HTML source, and back to Preview, shows the current content in each', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct('<p>BEFORE AFTER</p>');

    $region = wysiwygUiTestRegion();
    $preview = wysiwygUiTestControl('wysiwyg-preview');
    $source = wysiwygUiTestControl('wysiwyg-html-source');
    $previewToggle = wysiwygUiTestControl('wysiwyg-preview-toggle');
    $sourceToggle = wysiwygUiTestControl('wysiwyg-html-source-toggle');

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    $page->click($previewToggle)->assertNoJavaScriptErrors()->assertVisible($preview);

    // Switching directly to HTML source (without first returning to Edit) closes Preview and shows
    // the editable source textarea instead -- never both, never neither.
    $page->click($sourceToggle)
        ->assertNoJavaScriptErrors()
        ->assertVisible($source)
        ->assertMissing($preview)
        ->assertMissing($region)
        ->assertValue($source, '<p>BEFORE AFTER</p>');

    $page->fill($source, '<p>REPLACED</p>');

    // Switching directly to Preview from HTML source commits the edit made there first (mirroring
    // toggleHtmlSource()'s own OUT transition), so Preview reflects it rather than stale content
    // from before the source-mode edit.
    $page->click($previewToggle)
        ->assertNoJavaScriptErrors()
        ->assertVisible($preview)
        ->assertMissing($source)
        ->assertSourceInHas($preview, '<p>REPLACED</p>');
});

// =====================================================================
// Two real bugs reported after this feature shipped, both against a code block that already
// EXISTED when the editor mounted (i.e. reopening a product, not inserting a fresh block) --
// D-16bis's own regression coverage never exercised that path, since every prior test either
// inserted a block through the toolbar or typed into one immediately after inserting it.
// =====================================================================

// Bug 1: moving the caret into an existing code block left the language <select> showing
// whatever it last showed (the "plaintext" default, if the administrator never touched it),
// silently disagreeing with the block the caret was actually inside.
test('the code-language select updates to match the language of the code block the caret moves into', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    $product = wysiwygUiTestProduct('<p>BEFORE AFTER</p><pre><code class="language-json">{"a":1}</code></pre>');

    $region = wysiwygUiTestRegion();
    $languageSelect = wysiwygUiTestControl('wysiwyg-code-language');

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    // The select's own initial value is the Alpine component's `plaintext` default -- moving the
    // caret into the JSON block, below, is what this test asserts changes it.
    $page->assertValue($languageSelect, 'plaintext');

    $page->script(wysiwygUiTestCaretInCodeBlockScript($region, 1));

    // A `selectionchange`-driven Alpine reactive update is not guaranteed to have flushed to the
    // DOM the instant script() returns -- this file's own established `->wait()` carve-out
    // (docs/testing/frontend/playwright-setup.md), mirroring the toolbar active-state test above.
    $page->wait(1)
        ->assertNoJavaScriptErrors()
        ->assertValue($languageSelect, 'json');
});

// Bug 2: pressing Enter inside a code block appeared to do nothing at all -- the browser's own
// native line-break insertion was silently destroyed the moment the very next keystroke's
// re-highlight read the block's `.textContent` (which counts a `<br>` as zero characters) and
// rewrote the block from that shorter, newline-free string.
test('pressing Enter inside a code block inserts a real line break, live and after a save/reload round trip', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);
    // Deliberately no quotes/angle brackets in the seeded code -- symfony/html-sanitizer's own
    // DOMDocument-based re-serialization entity-encodes a literal `"` in text content on save
    // (e.g. `&#34;`), which is pre-existing, expected sanitizer behaviour unrelated to this
    // fix and would only make the assertion below harder to read for no benefit.
    $product = wysiwygUiTestProduct('<pre><code class="language-php">abcd</code></pre>');

    $region = wysiwygUiTestRegion();

    $page = visit(route('products.edit', $product))->assertNoJavaScriptErrors();

    // Caret between "ab" and "cd" -- inside the block's existing, already-coloured content
    // (init()'s own mount-time highlightAllCodeBlocks() call already ran, though "abcd" itself
    // matches no PHP keyword and stays a single plain text node either way), so the fix must
    // survive interacting with hljs's own re-highlight pass on both sides of the insertion point.
    $page->script(wysiwygUiTestCaretInCodeBlockScript($region, 2));

    // A real Enter keypress in Chromium's own contenteditable handling is
    // execCommand('insertParagraph', ...) -- reproduced directly here, mirroring
    // wysiwygUiTestTypeIntoCodeBlockScript()'s own established D-16bis technique of driving
    // execCommand rather than Playwright's keyboard input (see that helper's docblock above).
    $page->script(<<<'JS'
        (function() {
            document.execCommand('insertParagraph', false, null);
            document.execCommand('insertText', false, 'X');
        })()
    JS);

    $page->assertNoJavaScriptErrors();

    // The live DOM: the newline survived the very next re-highlight, and "X" landed exactly
    // where it was typed -- immediately AFTER the newline (the caret-offset off-by-one this fix
    // also closes: a `<br>`, like a bare `.textContent` read, counts as zero characters unless
    // both getCaretOffset() and the text this block re-highlights from agree it counts as one),
    // never merging into the untouched "cd" that followed the caret.
    $page->assertScript(
        "document.querySelector('{$region} pre code').textContent === ".json_encode("ab\nXcd")
    );

    // scheduleSync()'s own 400ms debounce (D9) has not necessarily flushed $wire.set('value', ...)
    // the instant the last script() call returns -- this file's own established `->wait()`
    // carve-out before Save, exactly as the live-highlighting test above already does.
    $page->wait(1);

    $page->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertUrlIs(route('products.index'));

    // The PERSISTED value carries the real line break too -- proving buildCleanValue()'s own fix
    // (it reads a code block's plain text through the same `<br>`-aware helper), not only the
    // live editor's.
    expect($product->fresh()->description)
        ->toContain("<pre><code class=\"language-php\">ab\nXcd</code></pre>");
});
