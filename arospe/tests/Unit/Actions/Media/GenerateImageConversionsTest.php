<?php

// Story 0019 (media library backend), Phase 3 step 1 (RED). App\Actions\Media\GenerateImageConversions
// does not exist yet -- every test below is expected to fail with an "class not found" error, not
// a syntax error in this file. Confirm the failure mode by running this file once the app doesn't
// have the class, per the task file's own instruction.
//
// This is the ONLY class in the story that imports the imaging library (Intervention Image, pinned
// to the Imagick driver -- see config/intervention-image.php, D1/D2 in the task file). It is
// expected to operate on a file already written to the 'public' disk (StoreUploadedImage's job)
// and to return the two variant paths it wrote, keyed 'webp_path' / 'avif_path' to match the
// media table's own column names (D8) -- so a caller never has to derive a variant path itself.
// This exact signature -- __invoke(string $originalPath): array{webp_path: string, avif_path: string}
// -- is a test-design decision made here in the absence of a fixed contract; see this session's
// report for the reasoning.
//
// tests/Unit/ gets NO app boot by default (tests/Pest.php binds RefreshDatabase+TestCase only to
// 'Feature'/'Browser') -- see tests/Unit/Actions/Auth/EnsureRecentPasswordConfirmationTest.php's
// own comment. This action needs the Storage and Image facades, both of which need the container,
// so this file opts into Tests\TestCase per-file WITHOUT RefreshDatabase, following the exact
// precedent in tests/Unit/Enums/UserStatusTest.php. Nothing here touches the database, so it stays
// a tests/Unit/ test per docs/testing/backend/unit-tests.md.
//
// Test-design trap (named explicitly in the task file): UploadedFile::fake()->image(...) is
// GD-generated but IS a valid, decodable PNG -- a fine INPUT to an Imagick encode even though GD
// itself has no AVIF encoder on this platform. UploadedFile::fake()->create() (zero-content) is
// used ONLY for the negative/failure case below, per the task's own guidance -- never as a
// positive fixture.
//
// The byte-signature assertions below (WebP's leading "RIFF"..."WEBP", AVIF's ISO-BMFF
// "ftyp"/"avif" brand at bytes 4-8/8-12) were verified against this machine's real
// Imagick 7.1.2-8 before this file was written -- a GD-generated fixture PNG was actually
// converted to .webp and .avif with Imagick directly (not through Intervention, which doesn't
// exist yet) and the raw output bytes were inspected. These are not guessed offsets.

use App\Actions\Media\GenerateImageConversions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    Storage::fake('public');
});

test('generating conversions from a real fixture image writes exactly two new files', function () {
    $original = UploadedFile::fake()->image('original.png', 100, 100);
    Storage::disk('public')->putFileAs('media', $original, 'original.png');

    $result = app(GenerateImageConversions::class)('media/original.png');

    // The original was already on disk before the call; exactly two NEW files (the variants)
    // must exist afterward -- 1 original + 2 variants = 3, proving nothing extra was written.
    expect(Storage::disk('public')->allFiles('media'))->toHaveCount(3)
        ->and($result)->toHaveKeys(['webp_path', 'avif_path'])
        ->and(Storage::disk('public')->exists($result['webp_path']))->toBeTrue()
        ->and(Storage::disk('public')->exists($result['avif_path']))->toBeTrue();
});

test('the generated .webp file is genuinely WebP, asserted on the file signature bytes', function () {
    $original = UploadedFile::fake()->image('original.png', 100, 100);
    Storage::disk('public')->putFileAs('media', $original, 'original.png');

    $result = app(GenerateImageConversions::class)('media/original.png');

    $webpBytes = Storage::disk('public')->get($result['webp_path']);

    // RIFF container header (bytes 0-4) and the WEBP four-character code (bytes 8-12) --
    // verified against a real Imagick-encoded .webp, not the file extension.
    expect(substr($webpBytes, 0, 4))->toBe('RIFF')
        ->and(substr($webpBytes, 8, 4))->toBe('WEBP');
});

test('the generated .avif file is genuinely AVIF, asserted on the ISO-BMFF ftyp brand bytes', function () {
    $original = UploadedFile::fake()->image('original.png', 100, 100);
    Storage::disk('public')->putFileAs('media', $original, 'original.png');

    $result = app(GenerateImageConversions::class)('media/original.png');

    $avifBytes = Storage::disk('public')->get($result['avif_path']);

    // ISO-BMFF box: 4 bytes box size, then the 'ftyp' box type (bytes 4-8), then the major
    // brand (bytes 8-12) -- verified against a real Imagick-encoded .avif.
    expect(substr($avifBytes, 4, 4))->toBe('ftyp')
        ->and(substr($avifBytes, 8, 4))->toBe('avif');
});

test('the original file is left byte-identical after conversions are generated', function () {
    $original = UploadedFile::fake()->image('original.png', 100, 100);
    $originalBytes = file_get_contents($original->getRealPath());
    Storage::disk('public')->putFileAs('media', $original, 'original.png');

    app(GenerateImageConversions::class)('media/original.png');

    expect(Storage::disk('public')->get('media/original.png'))->toBe($originalBytes);
});

test('a failure during encoding throws and leaves no partially-written variant behind', function () {
    // A real image file is not required for THIS fixture -- the task file itself names a
    // corrupted/undecodable file as the correct negative fixture for a conversion failure
    // (as opposed to the positive tests above, which need a genuinely decodable image).
    Storage::disk('public')->put('media/corrupt.png', 'this is not a real image, just garbage bytes');

    $filesBefore = Storage::disk('public')->allFiles();

    // NOT ->toThrow(Throwable::class): Pest's toThrow() resolves its argument with
    // class_exists(), which returns false for an INTERFACE, silently falling back to a
    // string-contains-in-message check instead of an instanceof check (verified against
    // vendor/pestphp/pest/src/Mixins/Expectation.php:965 in this exact worktree). A manual
    // catch is the honest way to assert "some Throwable propagates" without assuming a
    // concrete exception class the real implementation hasn't fixed yet.
    $threw = false;
    try {
        app(GenerateImageConversions::class)('media/corrupt.png');
    } catch (Throwable) {
        $threw = true;
    }

    expect($threw)->toBeTrue();

    // No new file (partial or otherwise) was left behind by the failed attempt. Deleting the
    // corrupt ORIGINAL itself is StoreUploadedImage's job (D6), not this action's -- that half
    // is covered by tests/Feature/Media/UploadTest.php instead.
    expect(Storage::disk('public')->allFiles())->toBe($filesBefore);
});
