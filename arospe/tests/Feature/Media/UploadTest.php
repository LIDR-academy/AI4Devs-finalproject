<?php

// Story 0019 (media library backend), Phase 3 step 1 (RED). None of App\Models\Media,
// App\Policies\MediaPolicy, App\Actions\Media\StoreUploadedImage,
// App\Actions\Media\GenerateImageConversions or App\Livewire\Media\Gallery exist yet -- every
// test below is expected to fail with a "class not found" error (or an error resolving the
// unknown Livewire component), never a syntax error in this file.
//
// D10 (no route, modal-only, this phase): App\Livewire\Media\Gallery is mounted directly through
// Livewire::test() everywhere in this file, exactly as SalesRegions/RolesIndex tests exercise
// mount()-level authorization when there is no route middleware to rely on -- see
// tests/Feature/SalesRegions/IndexTest.php's own "mounting the component directly is forbidden...
// even though route middleware never ran" test for the precedent this file follows.
//
// Test-design decisions made here in the absence of a fixed component/action contract (see this
// session's report for the reasoning):
//   - App\Livewire\Media\Gallery exposes public $photo (WithFileUploads), string $title,
//     string $description, and a method named upload().
//   - App\Actions\Media\StoreUploadedImage is called by upload() and returns/persists a Media row
//     with columns path/webp_path/avif_path/width/height/size_bytes/uploaded_by, matching the
//     task file's "Proposed media schema" table verbatim.
//   - A conversion failure is a THROWN exception (not a validation error) -- the Gherkin scenario
//     for it ("A failed conversion leaves nothing behind") is deliberately the only upload-rejection
//     scenario that does NOT say "rejected with an explanatory validation message", unlike the
//     three scenarios immediately above it (non-image / oversized / oversized-dimensions), which
//     all use that exact phrase.
//
// Story 0020 Phase 5 fix round, D9: `$photo` (WithFileUploads' singular property) was renamed to
// the array `$pendingUploads` (`wire:model="pendingUploads" multiple`), and
// Gallery::updatedPendingUploads() now fires upload() the instant the batch finishes staging -- the
// real, only trigger a genuine browser upload produces (see tests/Browser/Media/GalleryTest.php's
// own findings) -- so every test below sets `title`/`description` BEFORE `pendingUploads` (matching
// the real UI: there is no pre-upload title field, and D11's filename fallback only applies while
// title is still empty) and carries no trailing ->call('upload') -- setting `pendingUploads` already
// performs it, and calling it a second time would validate an already-reset (empty) array. A
// single-element array is still the correct shape here: this file exercises 0019's original,
// single-file upload/validation contract; D9's multi-file batch behaviour (the 3-file cap, per-file
// title derivation, partial-batch failure handling) is covered separately in
// tests/Feature/Media/GalleryTest.php.
//
// Storage::fake('public') everywhere (per the task file): nothing here may touch this worktree's
// real storage/app/public.

use App\Actions\Media\GenerateImageConversions;
use App\Livewire\Media\Gallery;
use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
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
function mediaGalleryTestActor(array $permissions = ['media.view', 'media.create']): User
{
    $actor = User::factory()->create();

    if ($permissions !== []) {
        $actor->givePermissionTo($permissions);
    }

    return $actor;
}

// =====================================================================
// Integration -- a successful upload (Gherkin: "Uploading an image generates webp and avif
// variants", "A successful upload is recorded in the media library")
// =====================================================================

test('a valid upload by a media.create holder creates one media row and three files on the faked disk', function () {
    $actor = mediaGalleryTestActor();
    $this->actingAs($actor);

    Livewire::test(Gallery::class)
        ->set('title', 'Red widget')
        ->set('description', 'A red widget on a white background')
        ->set('pendingUploads', [UploadedFile::fake()->image('product.png', 200, 150)])
        ->assertHasNoErrors();

    expect(Media::count())->toBe(1);

    $media = Media::sole();

    expect(Storage::disk('public')->exists($media->path))->toBeTrue()
        ->and(Storage::disk('public')->exists($media->webp_path))->toBeTrue()
        ->and(Storage::disk('public')->exists($media->avif_path))->toBeTrue();
});

test('the created row carries the submitted title, description, dimensions and size', function () {
    $actor = mediaGalleryTestActor();
    $this->actingAs($actor);

    $photo = UploadedFile::fake()->image('product.png', 200, 150);
    $expectedSize = $photo->getSize();

    Livewire::test(Gallery::class)
        ->set('title', 'Red widget')
        ->set('description', 'A red widget on a white background')
        ->set('pendingUploads', [$photo])
        ->assertHasNoErrors();

    $media = Media::sole();

    expect($media->title)->toBe('Red widget')
        ->and($media->description)->toBe('A red widget on a white background')
        ->and($media->width)->toBe(200)
        ->and($media->height)->toBe(150)
        ->and($media->size_bytes)->toBe($expectedSize);
});

test('uploaded_by is set to the id of the user who performed the upload', function () {
    $actor = mediaGalleryTestActor();
    $this->actingAs($actor);

    Livewire::test(Gallery::class)
        ->set('title', 'Widget')
        ->set('pendingUploads', [UploadedFile::fake()->image('product.png', 100, 100)])
        ->assertHasNoErrors();

    expect(Media::sole()->uploaded_by)->toBe($actor->id);
});

// =====================================================================
// Negative -- validation (Gherkin: "A non-image upload is rejected", "An oversized image upload
// is rejected", "An image with excessive pixel dimensions is rejected")
// =====================================================================

test('a non-image file disguised with an image extension is rejected and creates no row or file', function () {
    $actor = mediaGalleryTestActor();
    $this->actingAs($actor);

    // The interesting case per the task file's own guidance: a .png-named file whose real
    // content is plain text. Only content sniffing (the `image` validation rule), not the
    // extension, catches this.
    $disguisedTextFile = UploadedFile::fake()->createWithContent('not-an-image.png', 'plain text content, not an image at all');

    Livewire::test(Gallery::class)
        ->set('title', 'Should not be created')
        ->set('pendingUploads', [$disguisedTextFile])
        ->assertHasErrors(['pendingUploads.0']);

    expect(Media::count())->toBe(0)
        ->and(Storage::disk('public')->allFiles())->toBeEmpty();
});

test('an image of 8193 KB -- one KB over the 8 MB limit -- is rejected', function () {
    $actor = mediaGalleryTestActor();
    $this->actingAs($actor);

    Livewire::test(Gallery::class)
        ->set('title', 'Too big')
        ->set('pendingUploads', [UploadedFile::fake()->image('oversized.png', 100, 100)->size(8193)])
        ->assertHasErrors(['pendingUploads.0']);

    expect(Media::count())->toBe(0)
        ->and(Storage::disk('public')->allFiles())->toBeEmpty();
});

test('an image of 8191 KB -- one KB under the 8 MB limit -- is accepted', function () {
    $actor = mediaGalleryTestActor();
    $this->actingAs($actor);

    Livewire::test(Gallery::class)
        ->set('title', 'Just under the limit')
        ->set('pendingUploads', [UploadedFile::fake()->image('boundary.png', 100, 100)->size(8191)])
        ->assertHasNoErrors();

    expect(Media::count())->toBe(1);
});

test('an image exceeding the pixel dimension ceiling is rejected', function () {
    $actor = mediaGalleryTestActor();
    $this->actingAs($actor);

    Livewire::test(Gallery::class)
        ->set('title', 'Too wide')
        ->set('pendingUploads', [UploadedFile::fake()->image('huge.png', 8001, 100)])
        ->assertHasErrors(['pendingUploads.0']);

    expect(Media::count())->toBe(0)
        ->and(Storage::disk('public')->allFiles())->toBeEmpty();
});

// =====================================================================
// Negative -- atomicity (D6, Gherkin: "A failed conversion leaves nothing behind"). The failing
// conversion action is faked here rather than driven by a corrupt file -- exactly per the task
// file's own instruction -- because the thing under test is StoreUploadedImage's rollback, not
// GenerateImageConversions' own encoding correctness (already covered, with a real corrupt file,
// by tests/Unit/Actions/Media/GenerateImageConversionsTest.php).
// =====================================================================

test('an upload whose conversion fails leaves no media row and no orphaned original on disk', function () {
    $actor = mediaGalleryTestActor();
    $this->actingAs($actor);

    $this->mock(GenerateImageConversions::class, function ($mock) {
        $mock->shouldReceive('__invoke')->once()->andThrow(new RuntimeException('Conversion failed'));
    });

    // NOT ->toThrow(Throwable::class): Pest's toThrow() resolves its argument with
    // class_exists(), which returns false for an INTERFACE, silently falling back to a
    // string-contains-in-message check instead of an instanceof check (verified against
    // vendor/pestphp/pest/src/Mixins/Expectation.php:965 in this exact worktree). A manual
    // catch is the honest way to assert "some Throwable propagates" without assuming the
    // exact exception class the real implementation hasn't fixed yet.
    $threw = false;
    try {
        // Title before pendingUploads: updatedPendingUploads() fires upload() the instant the
        // batch is set, so the throw happens inside ->set('pendingUploads', ...) itself.
        Livewire::test(Gallery::class)
            ->set('title', 'Should roll back entirely')
            ->set('pendingUploads', [UploadedFile::fake()->image('product.png', 100, 100)]);
    } catch (Throwable) {
        $threw = true;
    }

    expect($threw)->toBeTrue();

    expect(Media::count())->toBe(0)
        ->and(Storage::disk('public')->allFiles())->toBeEmpty();
});

// =====================================================================
// Authorization (Gherkin: "An administrator without media.create cannot upload", "An
// administrator without media.view cannot browse the media gallery component")
// =====================================================================

test('a user holding media.view but not media.create is refused the upload with a 403', function () {
    $this->withoutExceptionHandling();
    $actor = mediaGalleryTestActor(['media.view']);
    $this->actingAs($actor);

    $attemptUpload = fn () => Livewire::test(Gallery::class)
        ->set('title', 'Should be refused')
        ->set('pendingUploads', [UploadedFile::fake()->image('product.png', 100, 100)]);

    expect($attemptUpload)->toThrow(AuthorizationException::class);

    expect(Media::count())->toBe(0);
});

test('a user holding no media permission cannot mount the media gallery component', function () {
    $this->withoutExceptionHandling();
    $actor = mediaGalleryTestActor([]);
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Gallery::class))->toThrow(AuthorizationException::class);
});

test('a Super Admin holding zero permission rows can mount the component and upload, via the Gate::before bypass', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    Livewire::test(Gallery::class)
        ->set('title', 'Super admin upload')
        ->set('pendingUploads', [UploadedFile::fake()->image('product.png', 100, 100)])
        ->assertHasNoErrors();

    expect(Media::count())->toBe(1);
});
