<?php

// Story 0019, Phase 6 docs-keeper finding: App\Livewire\Media\Gallery and
// App\Actions\Media\StoreUploadedImage authorized via a bare Gate::authorize()
// with no refusal logged at all -- the one gap in this project's own
// copyable "record a refusal" recipe (docs/architecture/authorization.md,
// story 0015b) that this story's Phase 4/5 passes did not catch, because
// appsec-auditor's brief was about exploitability, not observability.
//
// Media\Gallery is a genuinely different case from Users\Index::mount() /
// Roles\Index::mount() / SalesRegions\Index::mount(), all of which are
// deliberately left UNLOGGED because their routes' own `can:` middleware
// already refuses before mount() ever runs -- a mount()-level refusal there
// is unreachable over HTTP. Gallery has NO route at all (D10): mount() is
// the only gate a caller reaches, so its refusal is the one this recipe
// exists to record, and this file tests it rather than treating it as the
// same deliberate exclusion.
//
// =====================================================================================
// COVERAGE CHECKLIST:
//   1. mount()   viewAny  -- 'mount() authorization refusal is logged, unlike a route-gated screen'
//   2. upload()  create   -- 'upload() authorization refusal is logged, with no target'
//   3. StoreUploadedImage direct-call create refusal -- 'StoreUploadedImage direct-call
//      authorization refusal is logged' (the non-Livewire caller D10 names)
//   4. Must-not-over-log -- a permitted upload produces no refusal entry
// =====================================================================================

use App\Actions\Media\StoreUploadedImage;
use App\Livewire\Media\Gallery;
use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
    Storage::fake('public');
});

/**
 * @param  array<string, mixed>  $context
 */
function mediaRefusalLogContextHasNoSecretLookingKey(array $context): bool
{
    foreach (array_keys($context) as $key) {
        if (! is_string($key)) {
            continue;
        }

        if (str_contains($key, 'password') || str_contains($key, 'token') || str_contains($key, 'hash') || str_contains($key, 'session')) {
            return false;
        }
    }

    return true;
}

// =====================================================================
// mount()
// =====================================================================

test('mount() authorization refusal is logged, unlike a route-gated screen', function () {
    Log::spy();

    $actor = User::factory()->create(); // holds no media permission at all
    $this->actingAs($actor);

    try {
        Livewire::test(Gallery::class);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'viewAny'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && array_key_exists('target_id', $context) && $context['target_id'] === null
            && mediaRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

// =====================================================================
// upload()
// =====================================================================

test('upload() authorization refusal is logged, with no target', function () {
    Log::spy();

    // media.view (only) so mount()'s own viewAny gate succeeds and this test
    // isolates upload()'s OWN 'create' refusal rather than mount()'s.
    $actor = User::factory()->create();
    $actor->givePermissionTo('media.view');
    $this->actingAs($actor);

    // Story 0020 finding: Gallery::updatedPendingUploads() fires upload() the instant
    // `pendingUploads` is set (the real, only trigger a genuine browser upload produces), so title
    // must be set BEFORE pendingUploads and the refusal is thrown from inside
    // ->set('pendingUploads', ...) itself -- there is no trailing ->call('upload') left to run.
    $component = Livewire::test(Gallery::class)->set('title', 'Should be refused');

    try {
        $component->set('pendingUploads', [UploadedFile::fake()->image('product.png', 100, 100)]);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && array_key_exists('target_id', $context) && $context['target_id'] === null
            && mediaRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(Media::count())->toBe(0);
});

// =====================================================================
// StoreUploadedImage — the direct-call authorization test D10 names (a future
// Products/Blog embed, an Artisan command, a queued job).
// =====================================================================

test('StoreUploadedImage direct-call authorization refusal is logged, and nothing is written', function () {
    Log::spy();

    $actor = User::factory()->create(); // holds no permission at all
    $this->actingAs($actor);

    try {
        app(StoreUploadedImage::class)(UploadedFile::fake()->image('product.png', 100, 100), 'Should be refused');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && array_key_exists('target_id', $context) && $context['target_id'] === null
            && mediaRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(Media::count())->toBe(0)
        ->and(Storage::disk('public')->allFiles())->toBeEmpty();
});

// =====================================================================
// Must-not-over-log
// =====================================================================

test('a permitted upload produces no refusal entry', function () {
    Log::spy();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['media.view', 'media.create']);
    $this->actingAs($actor);

    Livewire::test(Gallery::class)
        ->set('title', 'Permitted upload')
        ->set('pendingUploads', [UploadedFile::fake()->image('product.png', 100, 100)])
        ->assertHasNoErrors();

    Log::shouldNotHaveReceived('warning');

    expect(Media::count())->toBe(1);
});
