<?php

// Story 0019, Phase 4 fix round -- finding F-2 (Medium, blocking). NEW file; the frozen
// tests/Feature/Media/UploadTest.php is not touched.
//
// StoreUploadedImage is designed (D10) to be independently callable by a future non-Livewire
// caller (a Products/Blog embed, an Artisan command, a queued job) -- the same premise task
// 0008a's "an authorization rule belongs to the action" convention rests on, applied here to
// VALIDATION rather than authorization. Before this fix the action trusted its caller to have
// already validated $photo (its own docblock said so), which is fine for
// App\Livewire\Media\Gallery::upload() but leaves any OTHER caller with no file-type check
// at all. This file calls the action directly, the way such a future caller would, bypassing
// the Livewire component entirely -- mirroring tests/Feature/Settings/EmailChangeTest.php's own
// direct app(SomeAction::class)(...) call convention for an independently-callable action.

use App\Actions\Media\StoreUploadedImage;
use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
    Storage::fake('public');
});

function storeUploadedImageTestActor(): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo('media.create');

    return $actor;
}

test('calling StoreUploadedImage directly with a disguised non-image file is rejected and creates no row or file', function () {
    $actor = storeUploadedImageTestActor();
    $this->actingAs($actor);

    // The same disguised fixture the frozen UploadTest.php uses for the Livewire path -- a
    // .png-named file whose real content is plain text. Only content sniffing (the `image`
    // rule), not the extension, catches this.
    $disguisedTextFile = UploadedFile::fake()->createWithContent('not-an-image.png', 'plain text content, not an image at all');

    $attempt = fn () => app(StoreUploadedImage::class)($disguisedTextFile, 'Should not be created');

    expect($attempt)->toThrow(ValidationException::class);

    expect(Media::count())->toBe(0)
        ->and(Storage::disk('public')->allFiles())->toBeEmpty();
});

test('calling StoreUploadedImage directly with an oversized image is rejected and creates no row or file', function () {
    $actor = storeUploadedImageTestActor();
    $this->actingAs($actor);

    $oversized = UploadedFile::fake()->image('oversized.png', 100, 100)->size(8193);

    $attempt = fn () => app(StoreUploadedImage::class)($oversized, 'Too big');

    expect($attempt)->toThrow(ValidationException::class);

    expect(Media::count())->toBe(0)
        ->and(Storage::disk('public')->allFiles())->toBeEmpty();
});

test('a successful direct call stores the original under an explicit allow-listed extension', function () {
    $actor = storeUploadedImageTestActor();
    $this->actingAs($actor);

    $photo = UploadedFile::fake()->image('product.png', 100, 100);

    $media = app(StoreUploadedImage::class)($photo, 'Widget');

    // Not putFile()'s own inferred name (Storage::putFile() -> $file->hashName() ->
    // guessExtension() from the sniffed MIME) -- an explicit, allow-listed extension chosen
    // from the validated MIME type (finding F-2, second half).
    expect($media->path)->toEndWith('.png')
        ->and(Storage::disk('public')->exists($media->path))->toBeTrue();
});
