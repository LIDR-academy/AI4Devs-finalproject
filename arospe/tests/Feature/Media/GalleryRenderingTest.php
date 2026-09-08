<?php

// Story 0020 (Shared media gallery modal -- frontend), Phase 3 step 1 (RED). RED-phase rendering
// tests for App\Livewire\Media\Gallery's real view (resources/views/livewire/media/gallery.blade.php),
// mirroring the split this project already established for tests/Feature/{Users,SalesRegions}/
// IndexRenderingTest.php: component logic, persistence and authorization refusals are covered by
// GalleryTest.php; every test here asserts against the RENDERED HTML (assertSee / ->html() +
// regex), which that file never does.
//
// As of this writing resources/views/livewire/media/gallery.blade.php is still 0019's placeholder
// (a single empty <div>) -- story 0020's own job, Phase 3.5, has not run yet. EVERY test in this
// file is expected to fail (RED) against that placeholder, on a missing assertSee/regex match, not
// on a fatal error -- App\Livewire\Media\Gallery, App\Models\Media, App\Policies\MediaPolicy and
// App\Concerns\MediaValidationRules already exist and work (story 0019, done); only the view (and
// the D2/D6 component surface GalleryTest.php's own banner documents) do not.
//
// SELECTOR CONTRACT this file establishes, per D14 plus this session's own naming decisions for
// the properties the real markup does not exist yet to confirm (adjust here first if Phase 3.5
// names any of these differently):
//   - `data-test="media-tile-{id}"` on a tile, `aria-pressed="true|false"` on that same element
//     (D14 -- a toggle, so aria-pressed rather than aria-selected).
//   - `data-test="media-empty-state"` on the "no results" block (D14 does not name this one
//     explicitly; invented here since the Gherkin scenario requires an explicit empty state).
//   - `data-test="media-upload-button"`, `data-test="media-dropzone"`, `data-test="edit-media-{id}"`
//     (D14's icon-only control hooks), each present on BOTH the enabled and disabled branch.
//   - `data-test="media-selection-count"` on the footer's running-count region (D14 does not name
//     this one explicitly either; invented so the footer count -- which D5 requires to come from
//     $selectedIds, not from the rendered/filtered tile list -- is assertable independent of copy).
//   - `data-test="media-confirm"` / `data-test="media-cancel"` for the confirm/cancel controls
//     (named in D14; not directly asserted by a dedicated test in this file since the Component
//     test file already exercises confirmSelection()/cancel() behaviourally, but used here to
//     locate the confirm button's rendered label).
//
// Arranged only with Media::factory() -- withRealFiles() where a test actually needs the three
// files to exist on the faked disk (the <picture> test), the lightweight default state everywhere
// else, matching MediaFactory's own documented split.

use App\Livewire\Media\Gallery;
use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
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
function galleryRenderingTestActor(array $permissions = ['media.view', 'media.create', 'media.edit']): User
{
    $actor = User::factory()->create();

    if ($permissions !== []) {
        $actor->givePermissionTo($permissions);
    }

    return $actor;
}

/**
 * Reads the `aria-pressed` value off the element carrying `data-test="media-tile-{id}"`, order
 * agnostic between the two attributes (lookaheads, matching this project's existing
 * salesRegionsRowControlDisabled()-style helpers rather than a brittle fixed attribute order).
 */
function galleryTileAriaPressed(string $html, string $mediaId): ?string
{
    $quoted = preg_quote('media-tile-'.$mediaId, '/');

    if (! preg_match(
        '/<[a-z0-9-]+(?=[^>]*\bdata-test="'.$quoted.'")[^>]*\baria-pressed="(true|false)"[^>]*>/is',
        $html,
        $matches
    )) {
        return null;
    }

    return $matches[1];
}

/**
 * Does the tag carrying `data-test="$dataTest"` also carry `disabled="disabled"` -- the exact
 * rendered form Laravel's ComponentAttributeBag produces for a bare boolean `disabled` prop, per
 * the existing salesRegionsRowControlDisabled()/usersRowActionDisabled() convention this project's
 * errors-log records (a bare `\sdisabled` substring false-matches Flux's own
 * `disabled:opacity-75` utility class, present on the ENABLED branch too).
 */
function galleryControlDisabled(string $html, string $dataTest): bool
{
    $quoted = preg_quote($dataTest, '/');

    return (bool) preg_match(
        '/<[a-z0-9-]+(?=[^>]*\bdata-test="'.$quoted.'")(?=[^>]*\sdisabled="disabled")[^>]*>/is',
        $html
    );
}

/**
 * Is the control carrying `data-test="$dataTest"` wrapped in an explicit <flux:tooltip> (compiled
 * to <ui-tooltip>) -- the Flux/Blaze presence trap documented in docs/errors-log.md, and D14's
 * explicit requirement ("never `:tooltip="$cond ? … : null"`").
 */
function galleryControlWrappedInTooltip(string $html, string $dataTest): bool
{
    $quoted = preg_quote($dataTest, '/');

    return (bool) preg_match(
        '/<ui-tooltip[^>]*>\s*<[a-z0-9-]+[^>]*\bdata-test="'.$quoted.'"/is',
        $html
    );
}

/**
 * The plain-text content of the element carrying `data-test="media-selection-count"`, trimmed.
 */
function galleryFooterSelectionCountText(string $html): ?string
{
    if (! preg_match('/data-test="media-selection-count"[^>]*>\s*([^<]*)</', $html, $matches)) {
        return null;
    }

    return trim($matches[1]);
}

// =====================================================================
// Test 1 -- the empty-state markup renders when the search matches nothing, and tiles do not
// (Gherkin: "The gallery shows an empty state when a search matches nothing").
// =====================================================================

test('the empty-state markup renders when the search matches nothing, and tiles do not', function () {
    $actor = galleryRenderingTestActor();
    $this->actingAs($actor);

    $media = Media::factory()->create(['title' => 'Red Widget']);

    $html = Livewire::test(Gallery::class)
        ->set('search', 'nonexistent-term-xyz')
        ->html();

    expect($html)->toContain('data-test="media-empty-state"')
        ->and($html)->not->toContain('data-test="media-tile-'.$media->id.'"');
});

// =====================================================================
// Test 2 -- a tile renders its data-test hook, title, description, and a <picture> with both
// <source type="image/avif"> and <source type="image/webp"> (D13).
// =====================================================================

test('a tile renders its data-test hook, title, description, and a picture with both avif and webp sources', function () {
    $actor = galleryRenderingTestActor();
    $this->actingAs($actor);

    $media = Media::factory()->withRealFiles()->create([
        'title' => 'Red Widget',
        'description' => 'A red widget on a white background',
    ]);

    $html = Livewire::test(Gallery::class)->html();

    expect($html)->toContain('data-test="media-tile-'.$media->id.'"')
        ->and($html)->toContain('Red Widget')
        ->and($html)->toContain('A red widget on a white background')
        ->and($html)->toMatch('/<source[^>]+type="image\/avif"/i')
        ->and($html)->toMatch('/<source[^>]+type="image\/webp"/i')
        ->and($html)->toContain('<picture');
});

// =====================================================================
// Test 3 -- aria-pressed is "true" on a staged tile and "false" on an unstaged one (D14).
// =====================================================================

test('aria-pressed is true on a staged tile and false on an unstaged one', function () {
    $actor = galleryRenderingTestActor();
    $this->actingAs($actor);

    $staged = Media::factory()->create(['title' => 'Staged']);
    $unstaged = Media::factory()->create(['title' => 'Unstaged']);

    $html = Livewire::test(Gallery::class)
        ->call('toggleSelect', $staged->id)
        ->html();

    expect(galleryTileAriaPressed($html, $staged->id))->toBe('true')
        ->and(galleryTileAriaPressed($html, $unstaged->id))->toBe('false');
});

// =====================================================================
// Test 4 -- the footer reports the selection count from $selectedIds, including while a staged
// tile is filtered out of view (the visible half of D5).
// =====================================================================

test('the footer reports the selection count from selectedIds, including while a staged tile is filtered out of view', function () {
    $actor = galleryRenderingTestActor();
    $this->actingAs($actor);

    $staged = Media::factory()->create(['title' => 'Selected Widget']);
    Media::factory()->create(['title' => 'Non-matching term']);

    $html = Livewire::test(Gallery::class, ['multi' => true])
        ->call('toggleSelect', $staged->id)
        ->set('search', 'Non-matching') // excludes $staged from the rendered grid
        ->html();

    expect($html)->toContain('data-test="media-selection-count"');
    expect(galleryFooterSelectionCountText($html))->toContain('1');
});

// =====================================================================
// Test 5 -- the confirm button carries $confirmLabel when supplied, and the $multi-keyed lang
// fallback when blank (D3, D15's confirm_default_single / confirm_default_multi keys).
// =====================================================================

test('the confirm button carries confirmLabel when supplied, and the multi-keyed lang fallback when blank', function () {
    $actor = galleryRenderingTestActor();
    $this->actingAs($actor);

    $htmlWithLabel = Livewire::test(Gallery::class, ['confirmLabel' => 'Usar como destacada'])->html();
    expect($htmlWithLabel)->toContain('Usar como destacada');

    $htmlSingleFallback = Livewire::test(Gallery::class, ['multi' => false, 'confirmLabel' => ''])->html();
    expect($htmlSingleFallback)->toContain(__('media.gallery.confirm_default_single'));

    $htmlMultiFallback = Livewire::test(Gallery::class, ['multi' => true, 'confirmLabel' => ''])->html();
    expect($htmlMultiFallback)->toContain(__('media.gallery.confirm_default_multi'));
});

// =====================================================================
// Test 6 -- the upload button and dropzone render disabled with a tooltip for a media.view-only
// user, and enabled for a media.create holder (D12) -- the data-test hook present on BOTH
// branches.
// =====================================================================

test('the upload button and dropzone render disabled with a tooltip for a media.view-only user, and enabled for a media.create holder', function () {
    $viewOnly = galleryRenderingTestActor(['media.view']);
    $this->actingAs($viewOnly);

    $htmlViewOnly = Livewire::test(Gallery::class)->html();

    expect($htmlViewOnly)->toContain('data-test="media-upload-button"')
        ->and($htmlViewOnly)->toContain('data-test="media-dropzone"');

    expect(galleryControlDisabled($htmlViewOnly, 'media-upload-button'))->toBeTrue()
        ->and(galleryControlWrappedInTooltip($htmlViewOnly, 'media-upload-button'))->toBeTrue();

    $creator = galleryRenderingTestActor(['media.view', 'media.create']);
    $this->actingAs($creator);

    $htmlCreator = Livewire::test(Gallery::class)->html();

    expect($htmlCreator)->toContain('data-test="media-upload-button"')
        ->and(galleryControlDisabled($htmlCreator, 'media-upload-button'))->toBeFalse();
});

// =====================================================================
// Test 7 -- the pencil action renders disabled for a user without media.edit (D10, D12).
// =====================================================================

test('the pencil action renders disabled for a user without media.edit', function () {
    $viewOnly = galleryRenderingTestActor(['media.view']);
    $this->actingAs($viewOnly);

    $media = Media::factory()->create();

    $html = Livewire::test(Gallery::class)->html();

    expect($html)->toContain('data-test="edit-media-'.$media->id.'"');
    expect(galleryControlDisabled($html, 'edit-media-'.$media->id))->toBeTrue();
});

// =====================================================================
// Test 8 -- Phase 5 fix round finding F-9 (previously untested): the D6 60-tile grid cap renders
// exactly 60 tiles, newest first, with the (now-correct, per F-2) results_truncated notice -- and
// NOT the D9 upload-cap message (too_many_files), which the truncation block used to reuse by
// mistake.
// =====================================================================

test('the grid renders at most 60 tiles, newest first, with the results-truncated notice when the library exceeds the cap', function () {
    $actor = galleryRenderingTestActor();
    $this->actingAs($actor);

    // 61 rows: one more than the D6 cap, so the cap is genuinely exercised rather than
    // coincidentally matching the library size. An explicit ascending created_at spread makes
    // "newest first" a real assertion rather than luck against same-second timestamps.
    $rows = collect(range(1, 61))->map(fn (int $i): Media => Media::factory()->create([
        'title' => "Item {$i}",
        'created_at' => now()->subMinutes(61 - $i),
    ]));

    $newest = $rows->last();
    $oldest = $rows->first();

    $html = Livewire::test(Gallery::class)->html();

    expect($html)->toContain('data-test="media-tile-'.$newest->id.'"')
        ->and($html)->not->toContain('data-test="media-tile-'.$oldest->id.'"')
        ->and($html)->toContain('data-test="media-results-truncated"')
        ->and($html)->toContain(__('media.gallery.results_truncated'))
        ->and($html)->not->toContain(__('media.gallery.too_many_files'));

    expect(substr_count($html, 'data-test="media-tile-'))->toBe(60);
});
