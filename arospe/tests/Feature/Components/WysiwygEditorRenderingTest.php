<?php

// Story 0021 (Shared WYSIWYG rich-text editor component), Phase 3 step 3 (RED). Markup-level
// assertions for App\Livewire\Components\WysiwygEditor's real view
// (resources/views/livewire/components/wysiwyg-editor.blade.php), mirroring the split this project
// already established for tests/Feature/{Users,SalesRegions,Media/Gallery}/*RenderingTest.php --
// component logic, dispatch payloads and #[Locked] enforcement are covered by WysiwygEditorTest.php;
// every test in this file asserts against the RENDERED HTML (->html() + regex/assertSee), which that
// file never does.
//
// As of this writing App\Livewire\Components\WysiwygEditor and its view do not exist at all (this is
// technical task 3, the RED half of Phase 3's TDD cycle). EVERY test in this file is expected to
// fail on a class-not-found error, not on a wrong assertion.
//
// SELECTOR CONTRACT this file asserts against, per D10's own explicit list -- the eight toolbar
// action hooks (`wysiwyg-bold`, `wysiwyg-italic`, `wysiwyg-underline`, `wysiwyg-h2`,
// `wysiwyg-bullet-list`, `wysiwyg-numbered-list`, `wysiwyg-link`, `wysiwyg-insert-image`), plus
// `wysiwyg-link-url` (the popover's URL input, not a toolbar button) and `wysiwyg-editor-region` (the
// wire:ignore'd contenteditable region, not a toolbar button either) -- both named but not the
// subject of this file's "eight toolbar controls" assertion, which is deliberately scoped to the
// eight buttons D10 fixes as the toolbar's whole action set.
//
// Assertion technique for "is this control disabled / wrapped in a tooltip" mirrors this project's
// existing usersRowActionDisabled()/salesRegionsRowControlDisabled()/galleryControlDisabled()-style
// helpers (see tests/Feature/Media/GalleryRenderingTest.php): match `disabled="disabled"` --
// Laravel's ComponentAttributeBag's exact rendered form for a bare boolean `disabled` prop -- never a
// bare `\sdisabled` substring, which Flux's own `disabled:opacity-75` utility class carries on the
// ENABLED branch too (docs/errors-log.md). Helper names are prefixed `wysiwygEditor*` throughout, to
// avoid colliding with the differently-named but analogous helpers GalleryRenderingTest.php already
// defines as GLOBAL functions in the same test run.

use App\Livewire\Components\WysiwygEditor;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
    Storage::fake('public');
});

/**
 * @param  array<int, string>  $permissions
 */
function wysiwygEditorRenderingTestActor(array $permissions = ['media.view', 'media.create', 'media.edit']): User
{
    $actor = User::factory()->create();

    if ($permissions !== []) {
        $actor->givePermissionTo($permissions);
    }

    return $actor;
}

/**
 * Extracts the outer HTML of the `<div role="toolbar">…</div>` region from a full component
 * render, via DOMDocument/DOMXPath rather than a naive regex or substring search -- N2's own
 * empirical check (`php artisan tinker`, against the real rendered HTML) found that a naive
 * non-greedy `<div[^>]*role="toolbar"[^>]*>(.*?)<\/div>` stops at the FIRST nested `</div>`
 * textually following (deep inside the link popover), silently excluding
 * `wysiwyg-insert-image` from the "toolbar" fragment while including only part of the popover.
 * DOMDocument/DOMXPath is nesting-aware and immune to that trap.
 */
function wysiwygEditorToolbarFragment(string $html): string
{
    $dom = new DOMDocument;
    libxml_use_internal_errors(true);
    $dom->loadHTML($html);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);
    $toolbar = $xpath->query('//*[@role="toolbar"]')->item(0);

    expect($toolbar)->not->toBeNull('Expected exactly one role="toolbar" element in the rendered HTML.');

    return $dom->saveHTML($toolbar);
}

/**
 * Does the element carrying `data-test="$dataTest"` also carry a real, non-empty `aria-label`?
 */
function wysiwygEditorControlHasAriaLabel(string $html, string $dataTest): bool
{
    $quoted = preg_quote($dataTest, '/');

    return (bool) preg_match(
        '/<[a-z0-9-]+(?=[^>]*\bdata-test="'.$quoted.'")[^>]*\baria-label="[^"]+"[^>]*>/is',
        $html
    );
}

/**
 * Is the element carrying `data-test="$dataTest"` also carrying `disabled="disabled"` -- the exact
 * rendered form a bare boolean `disabled` prop takes, never a bare `\sdisabled` substring match
 * (docs/errors-log.md's two Flux/Blaze traps).
 */
function wysiwygEditorControlDisabled(string $html, string $dataTest): bool
{
    $quoted = preg_quote($dataTest, '/');

    return (bool) preg_match(
        '/<[a-z0-9-]+(?=[^>]*\bdata-test="'.$quoted.'")(?=[^>]*\sdisabled="disabled")[^>]*>/is',
        $html
    );
}

/**
 * Is the control carrying `data-test="$dataTest"` wrapped in an explicit <flux:tooltip> (compiled to
 * <ui-tooltip>) -- D10's explicit requirement ("never `:tooltip="$cond ? … : null"`"), the same
 * Flux/Blaze presence trap docs/errors-log.md records.
 */
function wysiwygEditorControlWrappedInTooltip(string $html, string $dataTest): bool
{
    $quoted = preg_quote($dataTest, '/');

    return (bool) preg_match(
        '/<ui-tooltip[^>]*>\s*<[a-z0-9-]+[^>]*\bdata-test="'.$quoted.'"/is',
        $html
    );
}

/**
 * Does the element carrying `data-test="$dataTest"` also carry an attribute whose name contains
 * `$attribute` (e.g. `wire:ignore`, `contenteditable`) -- presence only, not a specific value, since
 * `contenteditable` may render as a bare boolean attribute or as `contenteditable="true"`.
 */
function wysiwygEditorElementHasAttributeNamed(string $html, string $dataTest, string $attribute): bool
{
    $quotedDataTest = preg_quote($dataTest, '/');
    $quotedAttribute = preg_quote($attribute, '/');

    return (bool) preg_match(
        '/<[a-z0-9-]+(?=[^>]*\bdata-test="'.$quotedDataTest.'")(?=[^>]*\b'.$quotedAttribute.')[^>]*>/is',
        $html
    );
}

/**
 * N5/N6: the `id` carried by the compiled `<flux:label>` element (a `<ui-label ... data-flux-label>`
 * at render time, verified against the real output rather than assumed from the Blade source) --
 * `null` when no such element is present, matching the `@if ($label !== '')` guard in the view.
 */
function wysiwygEditorLabelId(string $html): ?string
{
    if (preg_match('/<[a-z0-9-]+(?=[^>]*\bdata-flux-label\b)(?=[^>]*\bid="(wysiwyg-editor-label-[^"]+)")[^>]*>/is', $html, $matches) === 1) {
        return $matches[1];
    }

    return null;
}

/**
 * N6: the editable region's own `aria-labelledby`, when present -- `null` when the region carries
 * none, matching the same `@if ($label !== '')` guard on the other side of the pairing.
 */
function wysiwygEditorRegionAriaLabelledby(string $html): ?string
{
    if (preg_match('/<[a-z0-9-]+(?=[^>]*\bdata-test="wysiwyg-editor-region")(?=[^>]*\baria-labelledby="([^"]+)")[^>]*>/is', $html, $matches) === 1) {
        return $matches[1];
    }

    return null;
}

// =====================================================================
// Test 1 -- all eight toolbar controls render with their data-test hook and a real aria-label,
// inside a role="toolbar" region that itself carries an aria-label (D10).
// =====================================================================

test('all eight toolbar controls render with their data-test hook and aria-label, inside a labelled toolbar region', function () {
    $this->actingAs(wysiwygEditorRenderingTestActor());

    $html = Livewire::test(WysiwygEditor::class)->html();

    expect($html)->toContain('role="toolbar"');

    // The toolbar region itself carries its own aria-label, per D10 -- and its copy comes from the
    // components.wysiwyg.toolbar_label lang key D12 names explicitly, never a hardcoded string.
    expect($html)->toContain(__('components.wysiwyg.toolbar_label'));

    $toolbarButtonHooks = [
        'wysiwyg-bold',
        'wysiwyg-italic',
        'wysiwyg-underline',
        'wysiwyg-h2',
        'wysiwyg-bullet-list',
        'wysiwyg-numbered-list',
        'wysiwyg-link',
        'wysiwyg-insert-image',
    ];

    foreach ($toolbarButtonHooks as $hook) {
        expect($html)->toContain('data-test="'.$hook.'"');
        expect(wysiwygEditorControlHasAriaLabel($html, $hook))->toBeTrue("Expected [{$hook}] to carry a real aria-label.");
    }
});

// =====================================================================
// Test 1b (N2) -- the toolbar renders EXACTLY eight controls and no ninth. Test 1 above only
// checks that each of the eight named hooks is PRESENT, so nothing there would fail if a ninth
// control were accidentally added to the toolbar -- this is the missing negative half.
//
// The link popover's own `wysiwyg-link-url` / `wysiwyg-link-apply` hooks are structurally NESTED
// inside `role="toolbar"` (the popover sits inside the same `<div class="relative">` wrapper as
// the Link button, itself inside the toolbar element) -- verified empirically, not assumed, via
// `php artisan tinker` against the real rendered HTML. They are stripped out by name before
// counting, since they are not toolbar ACTION buttons in D10's sense; what remains is exactly the
// eight buttons D10 fixes as the toolbar's whole action set.
// =====================================================================

test('the toolbar region renders exactly eight wysiwyg controls and no others', function () {
    $this->actingAs(wysiwygEditorRenderingTestActor());

    $html = Livewire::test(WysiwygEditor::class)->html();

    $toolbarHtml = wysiwygEditorToolbarFragment($html);

    $toolbarHtml = str_replace(
        ['data-test="wysiwyg-link-url"', 'data-test="wysiwyg-link-apply"'],
        '',
        $toolbarHtml
    );

    expect(substr_count($toolbarHtml, 'data-test="wysiwyg-'))->toBe(8);
});

// =====================================================================
// Test 2 -- the editable region renders wire:ignore and contenteditable -- the markup-level proof of
// D9. If the implementation ever drops wire:ignore, this is what catches it.
// =====================================================================

test('the editable region renders wire:ignore and contenteditable', function () {
    $this->actingAs(wysiwygEditorRenderingTestActor());

    $html = Livewire::test(WysiwygEditor::class)->html();

    expect($html)->toContain('wire:ignore');
    expect(wysiwygEditorElementHasAttributeNamed($html, 'wysiwyg-editor-region', 'contenteditable'))->toBeTrue();
});

// =====================================================================
// Test 3 -- the embedded gallery tag carries :multi="false" and the instance-unique select-event
// (D4/D5). Read the mounted child's own serialized wire:snapshot data -- the DOM's own ground truth
// -- rather than the Blade source, matching this file's sibling in WysiwygEditorTest.php.
// =====================================================================

test('the embedded gallery tag carries multi false and the instance-unique select-event', function () {
    $this->actingAs(wysiwygEditorRenderingTestActor());

    $component = Livewire::test(WysiwygEditor::class);
    $html = $component->html();

    expect($html)->toContain('&quot;multi&quot;:false');
    expect($html)->toContain('&quot;selectEvent&quot;:&quot;'.$component->get('galleryEvent').'&quot;');
});

// =====================================================================
// Test 4 -- for a user WITH media.view the insert-image button renders enabled; for a user WITHOUT
// it, it renders disabled inside a tooltip AND the gallery is not embedded at all (D4's @can
// wrapper, mirroring 0020 D12's own within-modal rule) -- with the data-test hook present on both
// branches either way.
// =====================================================================

test('the insert-image button renders enabled for a user holding media.view', function () {
    $this->actingAs(wysiwygEditorRenderingTestActor(['media.view']));

    $html = Livewire::test(WysiwygEditor::class)->html();

    expect($html)->toContain('data-test="wysiwyg-insert-image"');
    expect(wysiwygEditorControlDisabled($html, 'wysiwyg-insert-image'))->toBeFalse();
});

test('the insert-image button renders disabled inside a tooltip for a user without media.view, and the gallery is not embedded', function () {
    $this->actingAs(wysiwygEditorRenderingTestActor([]));

    $html = Livewire::test(WysiwygEditor::class)->html();

    expect($html)->toContain('data-test="wysiwyg-insert-image"');
    expect(wysiwygEditorControlDisabled($html, 'wysiwyg-insert-image'))->toBeTrue();
    expect(wysiwygEditorControlWrappedInTooltip($html, 'wysiwyg-insert-image'))->toBeTrue();
    expect($html)->toContain(__('components.wysiwyg.insert_image_not_allowed'));

    // The gallery is genuinely absent from the DOM, not merely hidden -- assert against one of its
    // own unique data-test hooks (0020's media-search input), never a loose substring like
    // "media.gallery" that could coincidentally match elsewhere (e.g. a storage URL).
    expect($html)->not->toContain('data-test="media-search"');
});

// =====================================================================
// Test 5 -- the other seven toolbar buttons render enabled regardless of media permissions (D4's
// boundary: this story adds no permission of its own and gates nothing else).
// =====================================================================

test('the other seven toolbar buttons render enabled regardless of media permissions', function () {
    $this->actingAs(wysiwygEditorRenderingTestActor([]));

    $html = Livewire::test(WysiwygEditor::class)->html();

    $nonImageHooks = [
        'wysiwyg-bold',
        'wysiwyg-italic',
        'wysiwyg-underline',
        'wysiwyg-h2',
        'wysiwyg-bullet-list',
        'wysiwyg-numbered-list',
        'wysiwyg-link',
    ];

    foreach ($nonImageHooks as $hook) {
        expect(wysiwygEditorControlDisabled($html, $hook))->toBeFalse("Expected [{$hook}] to render enabled.");
    }
});

// =====================================================================
// Test 5b (N5) -- $label is #[Locked] but nothing exercised it from a component-tag attribute
// before this test: mount the component passing `label` and confirm the <flux:label> actually
// renders with that text. Also covers N6 (frontend-expert's parallel work, already landed by the
// time this test was written): the editable region's own `aria-labelledby` names this exact
// label id, so a consumer's `<label>` and the contenteditable region it describes stay wired
// together rather than merely coexisting on the page.
// =====================================================================

test('a supplied label renders as a flux:label with the given text, wired to the editable region via aria-labelledby', function () {
    $this->actingAs(wysiwygEditorRenderingTestActor());

    $html = Livewire::test(WysiwygEditor::class, ['label' => 'Descripción del producto'])->html();

    expect($html)->toContain('Descripción del producto');

    $labelId = wysiwygEditorLabelId($html);
    expect($labelId)->not->toBeNull('Expected a <flux:label> element carrying id="wysiwyg-editor-label-*" and data-flux-label.');

    $regionAriaLabelledby = wysiwygEditorRegionAriaLabelledby($html);
    expect($regionAriaLabelledby)->not->toBeNull('Expected the editable region to carry aria-labelledby when a label is supplied.');
    expect($regionAriaLabelledby)->toBe($labelId);
});

// =====================================================================
// Test 6 -- no hardcoded user-facing string; lang/en/components.php and lang/es/components.php are
// key-for-key identical (D12).
// =====================================================================

test('lang/en/components.php and lang/es/components.php are key-for-key identical', function () {
    $en = require base_path('lang/en/components.php');
    $es = require base_path('lang/es/components.php');

    $enKeys = collect(Arr::dot($en))->keys()->sort()->values()->all();
    $esKeys = collect(Arr::dot($es))->keys()->sort()->values()->all();

    expect($enKeys)->toBe($esKeys);
});
