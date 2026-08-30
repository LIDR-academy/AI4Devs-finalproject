<?php

// Story 0020 (Shared media gallery modal -- frontend). Component-level interaction/logic tests for
// App\Livewire\Media\Gallery.
//
// Test-design decisions this file establishes:
//   - The #[Computed] tile list D6 describes is exposed as `tiles()`, read via
//     Livewire::test(...)->get('tiles') -- the same idiom App\Livewire\SalesRegions\Index's
//     #[Computed] regions() already establishes in this codebase.
//   - Each tile/confirm-payload item uses D2's own documented shape verbatim: id, title,
//     description, url, webpUrl, avifUrl, width, height.
//   - `url`/`webpUrl`/`avifUrl` are built as Storage::disk('public')->url($media->path /
//     ->webp_path / ->avif_path) -- the disk 0019's own docs (storage:link) already establish for
//     this table.
//   - $multi, $selectEvent and $confirmLabel are #[Locked] (D2), so they can only be supplied at
//     MOUNT time, via Livewire::test(Gallery::class, [...]) -- never via ->set(), which would throw
//     CannotUpdateLockedPropertyException once the property really is locked.
//
// Phase 5 fix round (D8/D9 implemented in full): $photo/upload() was renamed to the array
// $pendingUploads/updatedPendingUploads() (D7/D9's multi-file supersession of 0019's original
// singular surface). Livewire's own Testable::setProperty() detects an array of UploadedFile
// instances and routes it through its real upload-simulation path
// (vendor/livewire/livewire/src/Features/SupportTesting/Testable.php's `upload($name, $files,
// $isMultiple = true)` branch) rather than a plain property write, so
// ->set('pendingUploads', [UploadedFile::fake()->image(...), ...]) genuinely exercises the same
// _startUpload/_finishUpload round trip a real multi-file browser upload does, including firing
// updatedPendingUploads().
//
// Arranged with Media::factory() throughout (never a real upload, except where the test is
// specifically about upload() itself) -- Storage::fake('public') is set regardless, defensively,
// per this project's existing Media test files.

use App\Livewire\Media\Gallery;
use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
function galleryModalTestActor(array $permissions = ['media.view', 'media.create', 'media.edit']): User
{
    $actor = User::factory()->create();

    if ($permissions !== []) {
        $actor->givePermissionTo($permissions);
    }

    return $actor;
}

/**
 * The D2 confirm-payload/tile shape for one Media row, built the same way the target
 * implementation is assumed to build it (see file banner). Reused by every test that asserts an
 * exact shape rather than a loose subset, so the expectation is derived once, not retyped per test.
 *
 * @return array{id: string, title: string, description: string|null, url: string, webpUrl: string, avifUrl: string, width: int, height: int}
 */
function galleryExpectedItemShape(Media $media): array
{
    return [
        'id' => $media->id,
        'title' => $media->title,
        'description' => $media->description,
        'url' => Storage::disk('public')->url($media->path),
        'webpUrl' => Storage::disk('public')->url($media->webp_path),
        'avifUrl' => Storage::disk('public')->url($media->avif_path),
        'width' => $media->width,
        'height' => $media->height,
    ];
}

// =====================================================================
// Integration -- search (D6, Gherkin: "Search filters the gallery by title", "...by description",
// "...shows an empty state...", "Clearing the search restores the full gallery").
// =====================================================================

test('setting the search property filters the exposed tile list by title', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $match = Media::factory()->create(['title' => 'Red Widget', 'description' => 'unrelated']);
    Media::factory()->create(['title' => 'Blue Gadget', 'description' => 'also unrelated']);

    $tiles = collect(
        Livewire::test(Gallery::class)
            ->set('search', 'Widget')
            ->get('tiles')
    );

    expect($tiles->pluck('id')->all())->toBe([$match->id]);
});

test('setting the search property filters the exposed tile list by description', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $match = Media::factory()->create(['title' => 'Widget', 'description' => 'A shiny red item']);
    Media::factory()->create(['title' => 'Gadget', 'description' => 'A dull blue item']);

    $tiles = collect(
        Livewire::test(Gallery::class)
            ->set('search', 'shiny')
            ->get('tiles')
    );

    expect($tiles->pluck('id')->all())->toBe([$match->id]);
});

test('a non-matching search term yields an empty tile list', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    Media::factory()->create(['title' => 'Red Widget']);

    $tiles = Livewire::test(Gallery::class)
        ->set('search', 'nonexistent-term-xyz')
        ->get('tiles');

    expect($tiles)->toBeEmpty();
});

test('clearing the search term restores the full tile list', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    Media::factory()->count(3)->create();

    $component = Livewire::test(Gallery::class)->set('search', 'nonexistent-term-xyz');
    expect($component->get('tiles'))->toBeEmpty();

    $component->set('search', '');
    expect($component->get('tiles'))->toHaveCount(3);
});

// =====================================================================
// Integration -- selection semantics (D4, Gherkin: "Single-select mode stages exactly one image",
// "Multi-select mode accumulates selections...").
// =====================================================================

test('in single-select mode, selecting a second tile leaves exactly one staged id', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $first = Media::factory()->create();
    $second = Media::factory()->create();

    $component = Livewire::test(Gallery::class, ['multi' => false])
        ->call('toggleSelect', $first->id)
        ->call('toggleSelect', $second->id);

    expect($component->get('selectedIds'))->toBe([$second->id]);
});

test('in multi-select mode, selecting three tiles stages three ids; re-selecting one removes it', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $tiles = Media::factory()->count(3)->create();

    $component = Livewire::test(Gallery::class, ['multi' => true]);

    foreach ($tiles as $tile) {
        $component->call('toggleSelect', $tile->id);
    }

    expect($component->get('selectedIds'))->toHaveCount(3)
        ->and(collect($component->get('selectedIds'))->sort()->values()->all())
        ->toBe($tiles->pluck('id')->sort()->values()->all());

    // Toggling the same id again (D4's toggle rule) removes it rather than adding a duplicate.
    $component->call('toggleSelect', $tiles->first()->id);

    expect($component->get('selectedIds'))->toHaveCount(2)
        ->and($component->get('selectedIds'))->not->toContain($tiles->first()->id);
});

// =====================================================================
// Integration -- a staged selection is independent of the search filter (D5, Gherkin: "A staged
// selection survives a search that hides it"). The arrangement below is deliberately built so an
// implementation that derives $selectedIds from the currently-rendered/filtered tile list (rather
// than treating it as independent component state) actually fails this test: the staged item is
// searched OUT of the tile list before either assertion runs.
// =====================================================================

test('a staged selection survives a search that excludes it, and is still in the confirm payload', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $staged = Media::factory()->create(['title' => 'Selected Widget', 'description' => null]);
    Media::factory()->create(['title' => 'Excluding Term Match', 'description' => null]);

    $component = Livewire::test(Gallery::class, ['multi' => true, 'selectEvent' => 'gallery-survives-filter'])
        ->call('toggleSelect', $staged->id)
        ->set('search', 'Excluding'); // matches the OTHER row, not $staged

    // The rendered/filtered tile list genuinely excludes the staged item...
    expect(collect($component->get('tiles'))->pluck('id')->all())->not->toContain($staged->id);

    // ...yet the staged id itself survives, because it is component state, not a projection of
    // the currently-visible grid (D5).
    expect($component->get('selectedIds'))->toContain($staged->id);

    $component->call('confirmSelection');

    $component->assertDispatched(
        'gallery-survives-filter',
        fn (string $name, array $params): bool => collect($params['media'] ?? [])->pluck('id')->contains($staged->id)
    );
});

// =====================================================================
// Integration -- confirmSelection() dispatch contract (D2). Assert the exact shape, not merely
// that something fired, and assert it fires under the CONSUMER-supplied event name (never a fixed
// component-owned name) -- the property V3 makes load-bearing for re-entrancy.
// =====================================================================

test('confirmSelection dispatches under the consumer-supplied event name with the exact D2 array shape', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $media = Media::factory()->create([
        'title' => 'Red widget',
        'description' => 'A red widget',
    ]);

    $expected = [galleryExpectedItemShape($media)];

    $component = Livewire::test(Gallery::class, ['multi' => false, 'selectEvent' => 'custom-picked-event'])
        ->call('toggleSelect', $media->id)
        ->call('confirmSelection');

    $component->assertDispatched(
        'custom-picked-event',
        fn (string $name, array $params): bool => ($params['media'] ?? null) === $expected
    );

    // The default event name never fires -- proves the name genuinely comes from the consumer
    // rather than being hardcoded alongside it.
    $component->assertNotDispatched('media-selected');
});

test('single-select mode dispatches a one-element list, never a bare object', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $media = Media::factory()->create();

    $component = Livewire::test(Gallery::class, ['multi' => false, 'selectEvent' => 'single-mode-picked'])
        ->call('toggleSelect', $media->id)
        ->call('confirmSelection');

    $component->assertDispatched(
        'single-mode-picked',
        function (string $name, array $params): bool {
            $payload = $params['media'] ?? null;

            return is_array($payload) && array_is_list($payload) && count($payload) === 1;
        }
    );
});

// =====================================================================
// Integration -- cancelling (Gherkin: "Cancelling the gallery discards the staged selection").
// =====================================================================

test('cancelling dispatches nothing and clears the staged selection', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $media = Media::factory()->create();

    $component = Livewire::test(Gallery::class, ['multi' => true, 'selectEvent' => 'should-never-fire'])
        ->call('toggleSelect', $media->id)
        ->call('cancel');

    $component->assertNotDispatched('should-never-fire');

    expect($component->get('selectedIds'))->toBe([]);
});

// =====================================================================
// Integration -- a tampered/deleted id in the staged selection is dropped silently at confirm time
// (D2: "the payload is re-fetched from the database at confirm time ... an id the query does not
// vouch for is silently dropped").
// =====================================================================

test('a confirm payload naming an id no longer in the database silently drops that id', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $real = Media::factory()->create();
    $ghostId = (string) Str::uuid7();

    $component = Livewire::test(Gallery::class, ['multi' => true, 'selectEvent' => 'tampered-picked'])
        ->call('toggleSelect', $real->id)
        ->call('toggleSelect', $ghostId)
        ->call('confirmSelection');

    $component->assertDispatched(
        'tampered-picked',
        function (string $name, array $params) use ($real): bool {
            $payload = $params['media'] ?? [];

            return count($payload) === 1 && $payload[0]['id'] === $real->id;
        }
    );
});

// =====================================================================
// Integration -- upload still creates a row and the new tile appears at the head of the D6 tile
// list (`latest()`).
// =====================================================================

test('an upload creates a media row and the new tile appears at the head of the list', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    // An explicit older timestamp avoids a same-second tie with the row the upload below creates,
    // which would make `latest()` ordering nondeterministic.
    Media::factory()->create(['title' => 'Existing older item', 'created_at' => now()->subMinutes(5)]);

    // Gallery::updatedPendingUploads() -- the real, only trigger a genuine browser upload produces
    // (see tests/Browser/Media/GalleryTest.php's own findings) -- fires upload() the instant
    // `pendingUploads` is set, using whatever `title`/`description` are already on the component at
    // that moment for a single-file batch. So title must be set BEFORE pendingUploads, matching the
    // real UI (there is no pre-upload title field; D11's filename fallback only applies when title
    // is still empty), and there is no explicit ->call('upload') -- setting pendingUploads already
    // performs it.
    $component = Livewire::test(Gallery::class)
        ->set('title', 'Brand new upload')
        ->set('pendingUploads', [UploadedFile::fake()->image('new-upload.png', 100, 100)])
        ->assertHasNoErrors();

    expect(Media::count())->toBe(2);

    $tiles = collect($component->get('tiles'));

    expect($tiles->first()['title'])->toBe('Brand new upload');
});

// =====================================================================
// Integration -- D9 multi-file upload: exactly 3 files succeeds (the cap, inclusive), 4 files is
// rejected naming the limit and creates no rows. Lowered from 5 to 3 by the Phase 4 re-audit
// (finding F-E): 5 files at MediaValidationRules::MAX_DIMENSION measured 34.8s total against PHP's
// 30s max_execution_time default, over budget with no margin; 3 files measured ~21s.
// =====================================================================

test('uploading exactly 3 files succeeds and creates 3 media rows', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $files = collect(range(1, 3))
        ->map(fn (int $i): UploadedFile => UploadedFile::fake()->image("batch-{$i}.png", 100, 100))
        ->all();

    Livewire::test(Gallery::class)
        ->set('pendingUploads', $files)
        ->assertHasNoErrors();

    expect(Media::count())->toBe(3);
});

test('uploading 4 files is rejected naming the limit, and creates no rows', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $files = collect(range(1, 4))
        ->map(fn (int $i): UploadedFile => UploadedFile::fake()->image("batch-{$i}.png", 100, 100))
        ->all();

    Livewire::test(Gallery::class)
        ->set('pendingUploads', $files)
        ->assertHasErrors(['pendingUploads'])
        ->assertSee(__('media.gallery.too_many_files'));

    expect(Media::count())->toBe(0);
});

// =====================================================================
// Integration -- D11 per-file title derivation: in a multi-file batch, each file's title comes
// from ITS OWN filename, never from a single shared $title across the whole batch (D9's own
// restatement of D11 for a batch).
// =====================================================================

test('each file in a multi-file batch derives its own title from its own filename', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    Livewire::test(Gallery::class)
        ->set('pendingUploads', [
            UploadedFile::fake()->image('first-widget.png', 100, 100),
            UploadedFile::fake()->image('second-gadget.png', 100, 100),
        ])
        ->assertHasNoErrors();

    expect(Media::count())->toBe(2);
    expect(Media::query()->pluck('title')->sort()->values()->all())
        ->toBe(['first-widget', 'second-gadget']);
});

// =====================================================================
// Integration -- D10 single-vs-batch auto-open-edit: a single file (even through the now-`multiple`
// -capable input) still auto-opens the new tile's inline editor; a batch of more than one file
// never auto-opens any tile's editor.
// =====================================================================

test('a single file uploaded through the multi-capable input still auto-opens the inline editor', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Gallery::class)
        ->set('pendingUploads', [UploadedFile::fake()->image('solo-upload.png', 100, 100)])
        ->assertHasNoErrors();

    $media = Media::query()->sole();

    expect($component->get('editingMediaId'))->toBe($media->id);
});

test('a multi-file batch never auto-opens any tile inline editor', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Gallery::class)
        ->set('pendingUploads', [
            UploadedFile::fake()->image('batch-a.png', 100, 100),
            UploadedFile::fake()->image('batch-b.png', 100, 100),
        ])
        ->assertHasNoErrors();

    expect(Media::count())->toBe(2);
    expect($component->get('editingMediaId'))->toBeNull();
});

// =====================================================================
// Integration -- inline editing persistence (D10, Gherkin: "An inline title and description edit
// persists").
// =====================================================================

test('updateMediaDetails persists title and description', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $media = Media::factory()->create(['title' => 'Old title', 'description' => 'Old description']);

    Livewire::test(Gallery::class)
        ->call('updateMediaDetails', $media->id, 'New title', 'New description')
        ->assertHasNoErrors();

    $fresh = $media->fresh();

    expect($fresh->title)->toBe('New title')
        ->and($fresh->description)->toBe('New description');
});

// =====================================================================
// Negative -- an invalid upload surfaces a validation message and creates no row (Gherkin
// scenario outline: "An invalid upload is rejected inside the modal"). The full validation matrix
// is already proven server-side by 0019's UploadTest.php; this is one representative case proving
// the Gallery-level wiring still routes to the same rule.
// =====================================================================

test('an invalid upload surfaces a validation message and creates no row', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $disguisedTextFile = UploadedFile::fake()->createWithContent('not-an-image.png', 'plain text, not an image');

    // Title before pendingUploads (updatedPendingUploads() fires on the pendingUploads set -- see
    // the comment on the "an upload creates a media row" test above), and no trailing
    // ->call('upload'). Per-file validation errors land under `pendingUploads.0`, not the bare
    // `pendingUploads` key -- see this file's own "pendingUploads.*" @foreach handling in the view.
    Livewire::test(Gallery::class)
        ->set('title', 'Should not be created')
        ->set('pendingUploads', [$disguisedTextFile])
        ->assertHasErrors(['pendingUploads.0']);

    expect(Media::count())->toBe(0);
});

// =====================================================================
// Authorization (D12: mount()/upload()/updateMediaDetails() each Gate::authorize() as their first
// statement; Gherkin: "An administrator without media.view is not offered the gallery", "...without
// media.create cannot upload", "...without media.edit cannot save an inline detail change").
// =====================================================================

test('a user holding no media permission cannot mount the component', function () {
    $this->withoutExceptionHandling();
    $actor = galleryModalTestActor([]);
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Gallery::class))->toThrow(AuthorizationException::class);
});

test('media.view without media.create is refused the upload, and the row count is unchanged', function () {
    $this->withoutExceptionHandling();
    $actor = galleryModalTestActor(['media.view']);
    $this->actingAs($actor);

    $attempt = fn () => Livewire::test(Gallery::class)
        ->set('title', 'Should be refused')
        ->set('pendingUploads', [UploadedFile::fake()->image('product.png', 100, 100)]);

    expect($attempt)->toThrow(AuthorizationException::class);

    expect(Media::count())->toBe(0);
});

test('media.view without media.edit is refused updateMediaDetails, and the title is unchanged', function () {
    $this->withoutExceptionHandling();
    $media = Media::factory()->create(['title' => 'Original title']);

    $actor = galleryModalTestActor(['media.view']);
    $this->actingAs($actor);

    $attempt = fn () => Livewire::test(Gallery::class)
        ->call('updateMediaDetails', $media->id, 'Attempted new title', null);

    expect($attempt)->toThrow(AuthorizationException::class);

    expect($media->fresh()->title)->toBe('Original title');
});

test('a Super Admin holding zero permission rows passes mount, upload and updateMediaDetails via the Gate::before bypass', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $existing = Media::factory()->create(['title' => 'Pre-existing']);

    $component = Livewire::test(Gallery::class)
        ->set('title', 'Super admin upload')
        ->set('pendingUploads', [UploadedFile::fake()->image('product.png', 100, 100)])
        ->assertHasNoErrors();

    expect(Media::count())->toBe(2);

    $component->call('updateMediaDetails', $existing->id, 'Renamed by super admin', null)
        ->assertHasNoErrors();

    expect($existing->fresh()->title)->toBe('Renamed by super admin');
});

// =====================================================================
// Phase 4 security audit finding F-1 (Medium): this component has no route, so nothing re-checks
// media.view between /livewire/update round trips except these three methods' own guards. Prove a
// mid-session revocation is actually observed by tiles()/toggleSelect()/confirmSelection(), and
// that the happy path (permission still held) is unaffected.
// =====================================================================

test('revoking media.view mid-session makes tiles() fail closed to an empty array', function () {
    Media::factory()->count(3)->create();

    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Gallery::class);

    expect($component->get('tiles'))->toHaveCount(3);

    $actor->revokePermissionTo('media.view');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    // #[Computed] memoizes tiles() on the component instance until the next real
    // dehydrate/hydrate round trip -- a bare ->get() re-reads that same in-memory cache rather
    // than recomputing it, so a no-op ->set() forces the round trip a real subsequent
    // /livewire/update request would also cause.
    $component->set('search', '');

    expect($component->get('tiles'))->toBe([]);
});

test('tiles() still returns the real library while media.view is held', function () {
    Media::factory()->count(2)->create();

    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    expect(Livewire::test(Gallery::class)->get('tiles'))->toHaveCount(2);
});

test('revoking media.view mid-session makes toggleSelect() throw rather than stage the id', function () {
    $this->withoutExceptionHandling();
    $media = Media::factory()->create();

    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Gallery::class);

    $actor->revokePermissionTo('media.view');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('toggleSelect', $media->id))
        ->toThrow(AuthorizationException::class);
});

test('revoking media.view mid-session makes confirmSelection() throw rather than dispatch', function () {
    $this->withoutExceptionHandling();
    $media = Media::factory()->create();

    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Gallery::class)
        ->call('toggleSelect', $media->id);

    $actor->revokePermissionTo('media.view');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('confirmSelection'))
        ->toThrow(AuthorizationException::class);

    $component->assertNotDispatched('media-selected');
});

test('toggleSelect() and confirmSelection() are unaffected while media.view is held', function () {
    $media = Media::factory()->create();

    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    Livewire::test(Gallery::class)
        ->call('toggleSelect', $media->id)
        ->call('confirmSelection')
        ->assertDispatched('media-selected');
});

// =====================================================================
// Phase 4 security audit finding F-3 (Low): `description` had no length bound in
// mediaDetailsRules(), so an over-large value reached the TEXT column and threw an unhandled
// QueryException under MySQL strict mode instead of failing validation. Cover both call paths --
// upload() and the inline-edit path via updateMediaDetails().
// =====================================================================

test('an overlong description fails validation on upload rather than throwing a database error', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    Livewire::test(Gallery::class)
        ->set('title', 'Widget with a huge description')
        ->set('description', str_repeat('a', 2001))
        ->set('pendingUploads', [UploadedFile::fake()->image('product.png', 100, 100)])
        ->assertHasErrors(['description']);

    expect(Media::count())->toBe(0);
});

test('an overlong description fails validation on the inline-edit path rather than throwing a database error', function () {
    $media = Media::factory()->create(['title' => 'Original title', 'description' => 'Original description']);

    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    // App\Actions\Media\UpdateMediaDetails validates via Validator::make(...)->validate(), and
    // Livewire's own component-call handling catches that ValidationException and populates the
    // component's error bag rather than letting it propagate to the test's own call site -- so
    // this is asserted via assertHasErrors(), not ->toThrow(), unlike the AuthorizationException
    // tests above (a plain, uncaught exception).
    Livewire::test(Gallery::class)
        ->call('updateMediaDetails', $media->id, 'Original title', str_repeat('a', 2001))
        ->assertHasErrors(['description']);

    expect($media->fresh()->description)->toBe('Original description');
});

// =====================================================================
// Phase 4 re-audit findings F-A, F-B, F-C(b): $pendingUploads is public and NOT #[Locked], so a
// crafted client payload can put something other than a real UploadedFile onto it, and a rejected
// batch's own recovery must not leave the upload surface (or a stale title) stuck for the rest of
// the session.
// =====================================================================

test('F-A: a crafted non-file value on pendingUploads fails validation cleanly rather than crashing', function () {
    // Before the fix, the single-file title-fallback derivation dereferenced
    // $this->pendingUploads[0]->getClientOriginalName() BEFORE validate() ran, so a value that
    // was never really an UploadedFile threw an unhandled error instead of a clean refusal.
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    Livewire::test(Gallery::class)
        ->set('pendingUploads', ['not-a-file'])
        ->assertHasErrors(['pendingUploads.0']);

    expect(Media::count())->toBe(0);
});

test('F-B/F-C(b): a rejected batch is cleared, and the next upload succeeds cleanly with no stale title', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    // A wrong-dimension file rejected by validate() -- MediaValidationRules::imageUploadRules()'s
    // `dimensions:max_width=...,max_height=...` rule.
    $component = Livewire::test(Gallery::class)
        ->set('pendingUploads', [UploadedFile::fake()->image('rejected-name.png', 5000, 100)])
        ->assertHasErrors(['pendingUploads.0']);

    // Before the fix, $pendingUploads (and $title, auto-derived from the rejected file's own
    // name) stayed on the component -- Livewire's WithFileUploads appends rather than replaces
    // for a `multiple` input, so the next pick would have merged onto the stale rejected one and
    // the stale title would have leaked onto an unrelated, later successful upload.
    expect($component->get('pendingUploads'))->toBe([]);
    expect($component->get('title'))->toBe('');

    $component
        ->set('pendingUploads', [UploadedFile::fake()->image('good-photo.png', 50, 50)])
        ->assertHasNoErrors();

    expect(Media::count())->toBe(1);
    expect(Media::first()->title)->toBe('good-photo');
});

test('F-C(a): a multi-file batch file whose name derives to an empty title falls back to a non-empty one', function () {
    $actor = galleryModalTestActor();
    $this->actingAs($actor);

    Livewire::test(Gallery::class)
        ->set('pendingUploads', [
            UploadedFile::fake()->image('.png', 50, 50),
            UploadedFile::fake()->image('second.png', 50, 50),
        ])
        ->assertHasNoErrors();

    expect(Media::count())->toBe(2);

    $titles = Media::query()->pluck('title')->all();
    expect($titles)->not->toContain('');
    expect($titles)->toContain(__('media.gallery.untitled_fallback'));
    expect($titles)->toContain('second');
});
