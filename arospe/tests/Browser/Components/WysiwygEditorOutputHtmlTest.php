<?php

// Story 0021 (Shared WYSIWYG rich-text editor component), Phase 3 step 9 -- the output-HTML
// allow-list contract test, kept in its own file per the task's own instruction: its job is
// different from WysiwygEditorTest.php's interaction coverage. It is a regression guard on the
// coordination point with 0024's D-16 sanitizer allow-list -- exactly the tag set
// docs/../0024-products-core-crud-backend.md's D-16 accepts -- and must be findable by whoever
// re-reads that decision later.
//
// SCOPE BOUNDARY (load-bearing, do not blur it): this file asserts what the EDITOR'S OWN DOM
// contains, before any server-side sync or sanitization. It never touches
// symfony/html-sanitizer and must not be confused with 0024's own
// ProductDescriptionSanitizationTest.php (which does not exist yet -- 0024 has not started), which
// will assert what the STORED COLUMN contains AFTER the sanitizer runs. Keeping these two
// independent is deliberate: D-16 defines the allow-list as "exactly the WYSIWYG toolbar's own tag
// set", so a drift between the two is a real bug, and collapsing them into one test would hide
// which side drifted.
//
// WHY EXHAUSTIVE ENUMERATION, NOT assertSourceInHas('<b>'): a positive containment check proves the
// WANTED tag arrived and says nothing about an UNWANTED tag sitting beside it. A suite built only
// from those checks stays green while Chromium also emits a stray <div> wrapper or a `style=`
// attribute -- precisely the failure this story's whole allow-list argument turns on. Only the
// "every element is in this list" form (assertScript(), V13) fails when something extra appears.
// The unscoped assertSourceHas()/assertSourceMissing() forms are never used here either -- they
// read the WHOLE page and would match the gallery's own tiles or Flux icon SVGs (both of which
// render real <svg>/<button>/<img> markup elsewhere on this harness page).
//
// D-16's allow-list, cited from the task file's D2 table: b, strong, i, em, u, h2, ul, ol, li, a,
// img, p, br. This editor never emits `strong`/`em` itself (V3: execCommand emits the short forms
// only), but they stay in the allow-list check below because D-16's own list includes them as
// alternates -- an editor that DID emit them would still be compliant.

use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
    // Deliberately NOT Storage::fake('public') -- traced live, not assumed: this Pest browser
    // plugin's real HTTP server serves an <img src> through Laravel's stock storage/{path}
    // ServeFile route from WITHIN THE SAME PROCESS the test runs in, so Storage::fake('public')'s
    // swapped disk config (no 'visibility' => 'public' key) is what that route sees too --
    // producing a real 403 the moment a real browser requests the inserted image's src. Every
    // Media row a test here needs the browser to load therefore uses ->withRealFiles() against the
    // REAL 'public' disk (storage/app/public), with the three written paths deleted at the end of
    // the same test (see wysiwygHtmlTestCleanupMedia() below).
});

/**
 * Deletes the three real files ->withRealFiles() wrote to the REAL public disk for one Media row --
 * called at the end of every test that creates one, since nothing here fakes the disk (see the
 * beforeEach comment above).
 */
function wysiwygHtmlTestCleanupMedia(Media $media): void
{
    Storage::disk('public')->delete([$media->path, $media->webp_path, $media->avif_path]);
}

function wysiwygHtmlTestActor(): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo(['media.view', 'media.create', 'media.edit']);

    return $actor;
}

function wysiwygHtmlTestInstanceSelector(string $dataTest): string
{
    return '[data-test="harness-editor-instance"] [data-test="'.$dataTest.'"]';
}

function wysiwygHtmlTestRegionSelector(): string
{
    return wysiwygHtmlTestInstanceSelector('wysiwyg-editor-region');
}

function wysiwygHtmlTestValueSelector(): string
{
    return '[data-test="harness-editor-value"]';
}

function wysiwygHtmlTestGalleryModal(string $dataTest): string
{
    return 'dialog[open] [data-test="'.$dataTest.'"]';
}

/**
 * B4 regression (Phase 5 code review, round 2): `media-confirm` renders `:disabled="count($selectedIds)
 * === 0"` (resources/views/livewire/media/gallery.blade.php) and only becomes clickable once the tile
 * click's Livewire round-trip lands. A bare `click(tile)->click(confirm)` races that round-trip and
 * flaked at ~30% on this file's own heaviest-prelude test (measured, not inferred). This assertScript
 * is a real poll (Execution::waitForExpectation() retries on a thrown expectation), not a sleep.
 */
function wysiwygHtmlTestConfirmEnabledScript(): string
{
    return "document.querySelector('".wysiwygHtmlTestGalleryModal('media-confirm')."').disabled === false";
}

/**
 * JS: focuses the region and selects the first occurrence of `$word` in any of its text nodes --
 * same generic TreeWalker word-finder as WysiwygEditorTest.php, redeclared locally (with a
 * differently-prefixed name) rather than shared, since both files load into the same PHP process.
 */
function wysiwygHtmlTestSelectWordScript(string $regionSelector, string $word): string
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

function wysiwygHtmlTestSelectAllScript(string $regionSelector): string
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
 * JS: every element inside the region has a tag name in D-16's allow-list -- the exhaustive check,
 * evaluated via assertScript() rather than spot-checked. Wrapped in an IIFE and enumerated with
 * `querySelectorAll('*')` so it catches ANY unexpected element, not only the named ones below.
 */
function wysiwygHtmlTestAllowedTagsScript(string $regionSelector): string
{
    return <<<JS
        (function() {
            const allowed = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'H2', 'UL', 'OL', 'LI', 'A', 'IMG', 'P', 'BR']);
            const region = document.querySelector('{$regionSelector}');
            const elements = region.querySelectorAll('*');
            for (const el of elements) {
                if (!allowed.has(el.tagName)) {
                    return false;
                }
            }
            return true;
        })()
    JS;
}

/**
 * JS: no `style` attribute anywhere in the region -- the direct regression test for D2's
 * `styleWithCSS` rule (V3: flipping it to `true` would switch bold/italic/underline's output from
 * <b>/<i>/<u> to <span style="...">, and BOTH <span> and `style` are stripped by 0024's sanitizer,
 * silently discarding every bit of formatting an administrator applied).
 */
function wysiwygHtmlTestNoStyleAttributeScript(string $regionSelector): string
{
    return <<<JS
        (function() {
            const region = document.querySelector('{$regionSelector}');
            return region.querySelectorAll('[style]').length === 0;
        })()
    JS;
}

/**
 * JS: none of the specifically-named disallowed tags appear -- named explicitly, per the task
 * file's own instruction, "so a reviewer can see what is guarded" rather than leaving it entirely
 * to the generic allow-list check above.
 */
function wysiwygHtmlTestNoDisallowedTagsScript(string $regionSelector): string
{
    return <<<JS
        (function() {
            const region = document.querySelector('{$regionSelector}');
            return region.querySelectorAll('div, font, span, figure, figcaption, h1, h3, h4, h5, h6').length === 0;
        })()
    JS;
}

/**
 * Runs the FULL exhaustive contract (allow-list + no style + none of the named disallowed tags)
 * against the given region -- the three checks every case in this file asserts together.
 */
function wysiwygHtmlTestAssertAllowListContract($page, string $regionSelector): void
{
    $page->assertScript(wysiwygHtmlTestAllowedTagsScript($regionSelector))
        ->assertScript(wysiwygHtmlTestNoStyleAttributeScript($regionSelector))
        ->assertScript(wysiwygHtmlTestNoDisallowedTagsScript($regionSelector));
}

// =====================================================================
// Every toolbar action produces only server-accepted HTML -- Gherkin's own Scenario Outline over
// the eight toolbar_action values, translated to one Pest dataset per this project's convention.
// =====================================================================

test('every toolbar action produces only tags inside the sanitizer allow-list', function (string $action) {
    $actor = wysiwygHtmlTestActor();
    $this->actingAs($actor);

    $media = Media::factory()->withRealFiles()->create(['title' => 'Allow List Widget', 'description' => null]);

    $region = wysiwygHtmlTestRegionSelector();

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    if ($action === 'bold') {
        $page->script(wysiwygHtmlTestSelectWordScript($region, 'BEFORE'));
        $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-bold'))->assertNoJavaScriptErrors();
    } elseif ($action === 'italic') {
        $page->script(wysiwygHtmlTestSelectWordScript($region, 'BEFORE'));
        $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-italic'))->assertNoJavaScriptErrors();
    } elseif ($action === 'underline') {
        $page->script(wysiwygHtmlTestSelectWordScript($region, 'BEFORE'));
        $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-underline'))->assertNoJavaScriptErrors();
    } elseif ($action === 'the heading') {
        $page->script(wysiwygHtmlTestSelectAllScript($region));
        $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-h2'))->assertNoJavaScriptErrors();
    } elseif ($action === 'a bullet list') {
        $page->script(wysiwygHtmlTestSelectAllScript($region));
        $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-bullet-list'))->assertNoJavaScriptErrors();
    } elseif ($action === 'a numbered list') {
        $page->script(wysiwygHtmlTestSelectAllScript($region));
        $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-numbered-list'))->assertNoJavaScriptErrors();
    } elseif ($action === 'a link') {
        $page->script(wysiwygHtmlTestSelectWordScript($region, 'BEFORE'));
        $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-link'))->assertNoJavaScriptErrors();
        $page->fill(wysiwygHtmlTestInstanceSelector('wysiwyg-link-url'), 'https://example.com/allow-list');
        // N3: scoped by the Apply button's own data-test="wysiwyg-link-apply" hook (added in
        // parallel by frontend-expert), matching every other toolbar control's selector style --
        // no longer Flux's internal `data-flux-button` attribute plus the popover's x-show selector.
        $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-link-apply'))
            ->assertNoJavaScriptErrors();
    } elseif ($action === 'an image') {
        $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-insert-image'))->assertNoJavaScriptErrors();
        $page->click(wysiwygHtmlTestGalleryModal('media-tile-'.$media->id))->assertNoJavaScriptErrors();
        $page->assertScript(wysiwygHtmlTestConfirmEnabledScript());
        $page->click(wysiwygHtmlTestGalleryModal('media-confirm'))->assertNoJavaScriptErrors();
        $page->wait(2)->assertNoJavaScriptErrors();
    }

    wysiwygHtmlTestAssertAllowListContract($page, $region);

    wysiwygHtmlTestCleanupMedia($media);
})->with(['bold', 'italic', 'underline', 'the heading', 'a bullet list', 'a numbered list', 'a link', 'an image']);

// =====================================================================
// A composed description -- several toolbar actions applied in sequence -- still stays within the
// server-accepted HTML. Catches interaction effects a single-action test cannot (e.g. a link
// wrapping an already-bold word producing a nested chain).
// =====================================================================

test('a description composed from several toolbar actions in sequence still stays within the allow-list', function () {
    $actor = wysiwygHtmlTestActor();
    $this->actingAs($actor);

    $media = Media::factory()->withRealFiles()->create(['title' => 'Composed Widget', 'description' => null]);

    $region = wysiwygHtmlTestRegionSelector();

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    // bold -> heading -> bullet list -> link -> image, each acted on a fresh selection/caret built
    // by the same generic TreeWalker helpers used above -- they survive whatever nesting the
    // previous step already produced.
    $page->script(wysiwygHtmlTestSelectWordScript($region, 'BEFORE'));
    $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-bold'))->assertNoJavaScriptErrors();

    $page->script(wysiwygHtmlTestSelectAllScript($region));
    $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-h2'))->assertNoJavaScriptErrors();

    $page->script(wysiwygHtmlTestSelectAllScript($region));
    $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-bullet-list'))->assertNoJavaScriptErrors();

    $page->script(wysiwygHtmlTestSelectWordScript($region, 'AFTER'));
    $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-link'))->assertNoJavaScriptErrors();
    $page->fill(wysiwygHtmlTestInstanceSelector('wysiwyg-link-url'), 'https://example.com/composed');
    $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-link-apply'))
        ->assertNoJavaScriptErrors();

    $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-insert-image'))->assertNoJavaScriptErrors();
    $page->click(wysiwygHtmlTestGalleryModal('media-tile-'.$media->id))->assertNoJavaScriptErrors();
    $page->assertScript(wysiwygHtmlTestConfirmEnabledScript());
    $page->click(wysiwygHtmlTestGalleryModal('media-confirm'))->assertNoJavaScriptErrors();
    $page->wait(2)->assertNoJavaScriptErrors();

    wysiwygHtmlTestAssertAllowListContract($page, $region);

    wysiwygHtmlTestCleanupMedia($media);
})->flaky(3);
// B4 (Phase 5 code review, round 2): this is the heaviest-prelude test in either browser file -- four
// debounced $wire.set('value', ...) syncs (D9's 400ms debounce, one per formatting action) plus a link
// apply, all before the gallery interaction the wysiwygHtmlTestConfirmEnabledScript() gate above waits
// on. Measured directly rather than assumed: even with that gate in place, the underlying Livewire
// staging round-trip occasionally still exceeds Playwright::$timeout (5000ms, a project-wide constant
// this file's own trap notes already cite -- a longer bare `->wait()` is not automatically safer, so
// widening that budget per-call is not the fix). Story 0020's own flaky-test investigation
// (docs/testing/frontend/playwright-setup.md) exhausted the wait/assertion-permutation space for an
// unrelated test and named "a Pest-level retry" as the next lever without ever applying it -- this is
// that lever's first use in this codebase. `->flaky(3)` retries only on a genuine assertion failure, so
// a real allow-list regression still fails the test; it does not mask incorrect output, only environment
// timing variance under this worktree's documented resource contention.

// =====================================================================
// The <a href> produced carries an http/https/mailto scheme; a javascript: address is refused
// client-side before createLink ever runs (D8) -- the client check is the explanation, never the
// control, but it must still hold so no javascript: href is ever produced by the toolbar at all.
// =====================================================================

test('the produced link href carries a supported scheme, and an unsupported scheme never reaches the DOM', function () {
    $actor = wysiwygHtmlTestActor();
    $this->actingAs($actor);

    $region = wysiwygHtmlTestRegionSelector();

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    $page->script(wysiwygHtmlTestSelectWordScript($region, 'BEFORE'));
    $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-link'))->assertNoJavaScriptErrors();
    $page->fill(wysiwygHtmlTestInstanceSelector('wysiwyg-link-url'), 'javascript:alert(document.cookie)');
    $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-link-apply'))
        ->assertNoJavaScriptErrors();

    $page->assertScript("document.querySelector('{$region} a') === null");

    $page->fill(wysiwygHtmlTestInstanceSelector('wysiwyg-link-url'), 'https://example.com/valid-scheme');
    $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-link-apply'))
        ->assertNoJavaScriptErrors();

    $page->assertScript(<<<JS
        (function() {
            const link = document.querySelector('{$region} a');
            if (!link) return false;
            return /^https:/.test(link.getAttribute('href'));
        })()
    JS);
});

// =====================================================================
// The inserted <img> carries the gallery payload's original url and an alt, and is NOT wrapped in
// a <figure> (D7: bare <img src alt> is the whole shape -- no <figure>, no <figcaption>,
// no <picture>).
// =====================================================================

test('the inserted image is a bare img carrying the original url and title, never wrapped in a figure', function () {
    $actor = wysiwygHtmlTestActor();
    $this->actingAs($actor);

    $media = Media::factory()->withRealFiles()->create(['title' => 'Figure-Free Widget', 'description' => null]);
    $expectedUrl = Storage::disk('public')->url($media->path);

    $region = wysiwygHtmlTestRegionSelector();

    $page = visit(route('dev.media-gallery-harness'))->assertNoJavaScriptErrors();

    $page->click(wysiwygHtmlTestInstanceSelector('wysiwyg-insert-image'))->assertNoJavaScriptErrors();
    $page->click(wysiwygHtmlTestGalleryModal('media-tile-'.$media->id))->assertNoJavaScriptErrors();
    $page->assertScript(wysiwygHtmlTestConfirmEnabledScript());
    $page->click(wysiwygHtmlTestGalleryModal('media-confirm'))->assertNoJavaScriptErrors();
    $page->wait(2)->assertNoJavaScriptErrors();

    $page->assertScript(wysiwygHtmlTestNoDisallowedTagsScript($region))
        ->assertAttribute($region.' img', 'src', $expectedUrl)
        ->assertAttribute($region.' img', 'alt', $media->title)
        ->assertScript("document.querySelector('{$region} figure') === null")
        ->assertScript("document.querySelector('{$region} picture') === null");

    wysiwygHtmlTestCleanupMedia($media);
});
