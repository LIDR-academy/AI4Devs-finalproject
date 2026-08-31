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
// Driven against the D13/OQ-1 harness (dev.media-gallery-harness --
// App\Livewire\Dev\MediaGalleryHarness / resources/views/livewire/dev/media-gallery-harness.blade.php),
// since the editor has no page of its own -- its real consumers (0027, Epic 4's blog editor) do not
// exist yet. The harness mounts TWO independent editor instances (data-test="harness-editor-instance"
// / "harness-editor-instance-2"), seeded respectively with `<p>BEFORE AFTER</p>` and
// `<p>SECOND BEFORE AFTER</p>` -- exactly what D6's positional acceptance criterion and D5's
// re-entrancy acceptance criterion each need a known before/after fragment pair for.
//
// SELECTOR STRATEGY, matching Media\GalleryTest's own precedent for this same harness: D10's Phase 2
// finding is that every `data-test` hook the editor renders (wysiwyg-bold, wysiwyg-editor-region,
// ...) is a STATIC string duplicated once per mounted instance, so every editor-level hook below is
// scoped to its containing `data-test="harness-editor-instance[-2]"` block via an explicit CSS
// descendant combinator (a string containing `[` -- Selector::isExplicit() passes it straight to
// Playwright's page.locator(), never the ambiguous `@` shorthand). The embedded gallery is scoped the
// same way GalleryTest.php's inOpenGalleryModal() already does (`dialog[open] [data-test="..."]`),
// since only one `<dialog>` is ever open per action sequence here even though up to four exist on
// the page (two standalone harness galleries + one per editor instance).
//
// CARET TECHNIQUE (D6, V13): `fill()`/`type()` replace content wholesale and create no browser
// selection at all; `keys()`-driven selection is brittle to whitespace/line-wrapping for anything
// precision-critical. Every selection or caret placement below is built with a `script()`-constructed
// `Range` over the region's own text nodes (a generic TreeWalker word-finder, so it survives whatever
// nested markup an earlier action produced -- e.g. "BEFORE" moving inside a freshly-applied <b>).

use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
    // Deliberately NOT Storage::fake('public') -- traced live, not assumed: this Pest browser
    // plugin's real HTTP server (LaravelHttpServer, the same in-process driver Media\GalleryTest.php's
    // own banner comment documents) serves an <img src> through Laravel's stock storage/{path}
    // ServeFile route from WITHIN THE SAME PROCESS the test runs in, so Storage::fake('public')'s
    // swapped disk config (no 'visibility' => 'public' key) is what that route sees too -- producing
    // a real 403 on every inserted image's src the moment a real browser actually requests it, not
    // merely a missing byte. Every Media row a test here needs the browser to load therefore uses
    // ->withRealFiles() against the REAL 'public' disk (storage/app/public), with the three written
    // paths deleted at the end of the same test (see wysiwygUiTestCleanupMedia() below).
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
    $actor->givePermissionTo(['media.view', 'media.create', 'media.edit']);

    return $actor;
}

/**
 * Scopes a `wysiwyg-*` hook to one of the harness's two editor instances (D10's Phase 2 finding --
 * every such hook is a static string, duplicated once per mounted instance).
 */
function wysiwygUiTestInstanceSelector(int $instance, string $dataTest): string
{
    $container = $instance === 1 ? 'harness-editor-instance' : 'harness-editor-instance-2';

    return '[data-test="'.$container.'"] [data-test="'.$dataTest.'"]';
}

function wysiwygUiTestRegionSelector(int $instance): string
{
    return wysiwygUiTestInstanceSelector($instance, 'wysiwyg-editor-region');
}

/**
 * Scopes a `media-*` gallery hook to the currently OPEN `<dialog>` -- matching
 * tests/Browser/Media/GalleryTest.php's own inOpenGalleryModal(), necessary because up to four
 * gallery instances (two standalone harness ones, one per editor) render the same shared library on
 * this page at once.
 */
function wysiwygUiTestGalleryModal(string $dataTest): string
{
    return 'dialog[open] [data-test="'.$dataTest.'"]';
}

/**
 * B4 regression (Phase 5 code review, round 2): `media-confirm` renders `:disabled="count($selectedIds)
 * === 0"` (resources/views/livewire/media/gallery.blade.php) and only becomes clickable once the tile
 * click's Livewire round-trip lands. A bare `click(tile)->click(confirm)` races that round-trip and
 * flakes under Playwright's actionability wait -- measured at ~30% on the heaviest-prelude sibling test
 * in WysiwygEditorOutputHtmlTest.php. This assertScript is a real poll (Execution::waitForExpectation()
 * retries on a thrown expectation), not a sleep, and is inserted between every tile click and confirm
 * click in this file for the same reason the cancel test above already gates the modal itself.
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

    $region = wysiwygUiTestRegionSelector(1);
    $control = wysiwygUiTestInstanceSelector(1, $button);

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

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

    $region = wysiwygUiTestRegionSelector(1);

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectAllScript($region));

    $page->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-h2'))
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

    $region = wysiwygUiTestRegionSelector(1);

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectAllScript($region));

    $page->click(wysiwygUiTestInstanceSelector(1, $button))
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

    $region = wysiwygUiTestRegionSelector(1);

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));

    $page->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-link'))
        ->assertNoJavaScriptErrors()
        ->fill(wysiwygUiTestInstanceSelector(1, 'wysiwyg-link-url'), 'https://example.com/story-0021')
        // N3: the Apply button now carries its own data-test="wysiwyg-link-apply" hook (added in
        // parallel by frontend-expert), scoped to this instance exactly like every other toolbar
        // control -- no longer selected via Flux's internal `data-flux-button` attribute plus the
        // popover's own x-show selector.
        ->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-link-apply'))
        ->assertNoJavaScriptErrors()
        ->assertSourceInHas($region, '<a href="https://example.com/story-0021">BEFORE</a>');
});

test('a link to an unsupported address scheme is refused before it is applied, leaving the selection unlinked', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);

    $region = wysiwygUiTestRegionSelector(1);

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));

    $page->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-link'))
        ->assertNoJavaScriptErrors()
        ->fill(wysiwygUiTestInstanceSelector(1, 'wysiwyg-link-url'), 'javascript:alert(1)')
        ->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-link-apply'))
        ->assertNoJavaScriptErrors()
        ->assertSee(__('components.wysiwyg.link_invalid_scheme'))
        ->assertScript("document.querySelector('{$region} a') === null");
});

// =====================================================================
// The toolbar reflects the formatting of the text under the cursor -- placing a collapsed caret
// inside an already-bold word marks the Bold action pressed (V9's queryCommandState mechanism, and
// the only proof it is wired at all).
// =====================================================================

test('the toolbar shows the bold action as active when the cursor sits inside bold text', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);

    $region = wysiwygUiTestRegionSelector(1);
    $bold = wysiwygUiTestInstanceSelector(1, 'wysiwyg-bold');

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

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

    $media = Media::factory()->withRealFiles()->create(['title' => 'Basic Insert Widget', 'description' => null]);

    $region = wysiwygUiTestRegionSelector(1);

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    $page->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-insert-image'))
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

    $media = Media::factory()->withRealFiles()->create(['title' => 'Positional Widget', 'description' => null]);

    $region = wysiwygUiTestRegionSelector(1);

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    // Collapsed caret right before "AFTER" -- D6 step 1's blur-capture mechanism fires when the
    // Insert image button's mousedown steals nothing (mousedown.prevent) and the gallery modal's
    // own focus trap takes focus; this script places the range the button's own saveCaret() will
    // capture on the very next mousedown.
    $page->script(wysiwygUiTestCaretBeforeWordScript($region, 'AFTER'));

    $page->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-insert-image'))
        ->assertNoJavaScriptErrors()
        ->click(wysiwygUiTestGalleryModal('media-tile-'.$media->id))
        ->assertNoJavaScriptErrors()
        ->assertScript(wysiwygUiTestConfirmEnabledScript())
        ->click(wysiwygUiTestGalleryModal('media-confirm'))
        ->assertNoJavaScriptErrors();

    $page->wait(2)->assertNoJavaScriptErrors();

    // Read the CLIENT-side region's own live DOM -- that is where execCommand('insertHTML', ...)
    // lands immediately, with no dependency on the host's own deferred wire:model write-back
    // (App\Livewire\Dev\MediaGalleryHarness::$editorValue only reflects a child #[Modelable]
    // write on the HOST's *next* request, never synchronously -- confirmed empirically, not the
    // component's own bug). Prove positional order -- "an <img> exists somewhere" would pass for
    // "appended at the end" too, which is the exact regression this assertion exists to catch.
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

    $media = Media::factory()->withRealFiles()->create(['title' => 'Never Focused Widget', 'description' => null]);

    $region = wysiwygUiTestRegionSelector(1);

    // Fresh visit: the editor region is never clicked into or otherwise focused before the very
    // first interaction below is the Insert image button itself.
    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    $page->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-insert-image'))
        ->assertNoJavaScriptErrors()
        ->click(wysiwygUiTestGalleryModal('media-tile-'.$media->id))
        ->assertNoJavaScriptErrors()
        ->assertScript(wysiwygUiTestConfirmEnabledScript())
        ->click(wysiwygUiTestGalleryModal('media-confirm'))
        ->assertNoJavaScriptErrors();

    $page->wait(2)->assertNoJavaScriptErrors();

    // Read the CLIENT-side region's own live DOM (see the positional test's comment above for why
    // the host's server-rendered value div is the wrong thing to assert against here -- its write-
    // back from a child #[Modelable] property is deferred to the host's next request, not this
    // component's own behaviour).
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

    Media::factory()->create(['title' => 'Untouched Widget', 'description' => null]);

    $region = wysiwygUiTestRegionSelector(1);

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    $page->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-insert-image'))
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
// Re-entrancy (D5, this story's most important test alongside the positional one): on the
// harness's two editors, an image confirmed from the first's gallery appears only in the first --
// the case a fixed, literal select-event would silently fail (V6).
// =====================================================================

test('an image confirmed from the first editors gallery lands only in the first editor', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);

    $media = Media::factory()->withRealFiles()->create(['title' => 'Re-entrancy Widget', 'description' => null]);

    // The CLIENT-side region's own live DOM, not the host's server-rendered value div -- that
    // write-back is deferred to the host's next request (see the positional test's comment above),
    // and this test needs to observe the confirm's effect within the same page load.
    $firstRegion = wysiwygUiTestRegionSelector(1);
    $secondRegion = wysiwygUiTestRegionSelector(2);

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    // Sanity: the two instances start with their own distinct seeded content.
    $page->assertSeeIn($firstRegion, 'BEFORE AFTER')
        ->assertSeeIn($secondRegion, 'SECOND BEFORE AFTER');

    $page->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-insert-image'))
        ->assertNoJavaScriptErrors()
        ->click(wysiwygUiTestGalleryModal('media-tile-'.$media->id))
        ->assertNoJavaScriptErrors()
        ->assertScript(wysiwygUiTestConfirmEnabledScript())
        ->click(wysiwygUiTestGalleryModal('media-confirm'))
        ->assertNoJavaScriptErrors();

    $page->wait(2)->assertNoJavaScriptErrors();

    $page->assertScript("document.querySelector('{$firstRegion}').innerHTML.indexOf('<img') !== -1")
        ->assertScript("document.querySelector('{$secondRegion}').innerHTML.indexOf('<img') === -1")
        ->assertSeeIn($secondRegion, 'SECOND BEFORE AFTER');

    wysiwygUiTestCleanupMedia($media);
});

// =====================================================================
// B1 regression (Phase 5 code review, cross-instance range capture): the re-entrancy test above
// proves the CONFIRM event only reaches the right editor, but it never puts the browser's own
// Selection inside the SECOND editor before acting on the first -- so it cannot catch the bug B1
// actually describes. Editor 1's "Insert image" button uses `mousedown.prevent` (D6), so pressing
// it moves focus nowhere; if the caret/selection was left inside editor 2 at that instant, the
// document-global `window.getSelection()` editor 1's `saveCaret()` reads still belongs to editor
// 2. Before the fix, `saveCaret()` captured it unconditionally and `insertImage()` restored it
// unconditionally, so editor 1 inserted the confirmed image into editor 2's own range. The fix
// (resources/js/app.js) guards both the capture in `saveCaret()` and the restore in
// `insertImage()`/`applyLink()` with `this.$refs.editor.contains(...)`, so an out-of-scope range
// is treated as "nothing saved" and editor 1 falls back to appending at its own end instead.
// =====================================================================

test('placing the cursor in the second editor does not let the first editors insert-image button capture it', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);

    $media = Media::factory()->withRealFiles()->create(['title' => 'Cross-instance Capture Widget', 'description' => null]);

    $firstRegion = wysiwygUiTestRegionSelector(1);
    $secondRegion = wysiwygUiTestRegionSelector(2);

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    // The precondition B1's fix depends on and the re-entrancy test above never creates: a real
    // selection sitting INSIDE editor 2 at the moment editor 1's own button is pressed. Focusing
    // editor 2 here is what the word-finder script does; nothing after this point touches editor
    // 2's focus or selection again until the final read.
    $page->script(wysiwygUiTestSelectWordScript($secondRegion, 'BEFORE'));

    $page->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-insert-image'))
        ->assertNoJavaScriptErrors()
        ->click(wysiwygUiTestGalleryModal('media-tile-'.$media->id))
        ->assertNoJavaScriptErrors()
        ->assertScript(wysiwygUiTestConfirmEnabledScript())
        ->click(wysiwygUiTestGalleryModal('media-confirm'))
        ->assertNoJavaScriptErrors();

    $page->wait(2)->assertNoJavaScriptErrors();

    // Editor 1 received the image, via the fallback "append at the end" path (D6 step 3's second
    // guard) -- saveCaret() refused to capture editor 2's out-of-scope selection, so editor 1 had
    // no saved range of its own to restore. Its original content is preserved either side.
    $page->assertScript("document.querySelector('{$firstRegion}').innerHTML.indexOf('<img') !== -1")
        ->assertSourceInHas($firstRegion, 'BEFORE')
        ->assertSourceInHas($firstRegion, 'AFTER');

    // Editor 2's content is untouched byte for byte -- the failure B1 describes is exactly the
    // image landing HERE instead, inside the selection that was active when editor 1's button
    // was pressed.
    $page->assertScript(<<<JS
        document.querySelector('{$secondRegion}').innerHTML === '<p>SECOND BEFORE AFTER</p>'
    JS)
        ->assertSourceInMissing($secondRegion, '<img');

    wysiwygUiTestCleanupMedia($media);
});

// =====================================================================
// assertNoJavaScriptErrors() across a representative sequence -- the hand-rolled caret logic (D6)
// is exactly the kind of code that otherwise fails silently, as 0020's dropzone precedent already
// established for this same harness.
// =====================================================================

test('a representative sequence of toolbar actions produces no JavaScript errors', function () {
    $actor = wysiwygUiTestActor();
    $this->actingAs($actor);

    $media = Media::factory()->withRealFiles()->create(['title' => 'Sequence Widget', 'description' => null]);

    $region = wysiwygUiTestRegionSelector(1);

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectWordScript($region, 'BEFORE'));
    $page->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-bold'))->assertNoJavaScriptErrors();

    $page->script(wysiwygUiTestSelectAllScript($region));
    $page->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-h2'))->assertNoJavaScriptErrors();

    $page->click(wysiwygUiTestInstanceSelector(1, 'wysiwyg-insert-image'))->assertNoJavaScriptErrors();
    $page->click(wysiwygUiTestGalleryModal('media-tile-'.$media->id))->assertNoJavaScriptErrors();
    $page->assertScript(wysiwygUiTestConfirmEnabledScript());
    $page->click(wysiwygUiTestGalleryModal('media-confirm'))->assertNoJavaScriptErrors();

    $page->wait(2)->assertNoJavaScriptErrors();

    wysiwygUiTestCleanupMedia($media);
});
