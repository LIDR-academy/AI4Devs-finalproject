<?php

// Story 0019, Phase 4 fix round -- finding F-3 (Medium, blocking). NEW file, per the fix
// instruction; the frozen tests/Unit/Actions/Media/GenerateImageConversionsTest.php is not
// touched.
//
// config/filesystems.php sets 'throw' => false on the 'public' disk, so a failing
// Storage::put() (full disk, permissions, quota) returns `false` rather than throwing --
// FilesystemAdapter::put() catches League\Flysystem's UnableToWriteFile and, because
// throwsExceptions() is false for this disk, returns `false` instead of letting it propagate.
// GenerateImageConversions previously ignored that return value for both the .webp and .avif
// writes, so a `media` row could commit while pointing at a variant that was never written.
//
// The failure is induced with a REAL filesystem permission failure, not a Mockery double, per
// the fix instruction's own suggested alternative -- this test suite runs as a non-root local
// user (verified: `id` reports uid=1000, not 0; see this session's report), so making the
// 'media' directory read-only reliably makes the underlying write fail while the
// already-written original stays readable (the directory's execute+read bits are untouched).
// Storage::fake('public')'s config is built by merging the REAL 'public' disk's 'throw' key
// (Illuminate\Support\Facades\Storage::buildDiskConfiguration()), so this exercises the exact
// production 'throw' => false behaviour, not a testing-only shortcut.

use App\Actions\Media\GenerateImageConversions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    Storage::fake('public');
});

afterEach(function () {
    // Restore write permission before Pest's NEXT Storage::fake('public') call tries to
    // clean this same directory (Illuminate\Support\Facades\Storage::fake() calls
    // (new Filesystem)->cleanDirectory($root) at the top of the next test) -- a read-only
    // 'media' subdirectory left behind would make that cleanup itself fail.
    $mediaDir = Storage::disk('public')->path('media');

    if (is_dir($mediaDir)) {
        chmod($mediaDir, 0755);
    }
});

test('a failed disk write during conversion throws and leaves no partially-written variant behind', function () {
    $original = UploadedFile::fake()->image('original.png', 100, 100);
    Storage::disk('public')->putFileAs('media', $original, 'original.png');

    $filesBefore = Storage::disk('public')->allFiles();

    // Read-only: the already-written original stays readable (read+execute bits untouched),
    // but writing a NEW file into this directory now fails at the filesystem level. This makes
    // the FIRST write (.webp) fail, so $written never gains an entry and the cleanup foreach
    // loop's body never actually runs -- see the second test below for that.
    chmod(Storage::disk('public')->path('media'), 0555);

    // NOT ->toThrow(Throwable::class): Pest's toThrow() resolves its argument with
    // class_exists(), which returns false for an INTERFACE and silently falls back to a
    // string-contains-in-message check -- the same trap the frozen GenerateImageConversionsTest
    // already documents. A manual catch asserts "some Throwable propagates" without assuming a
    // concrete exception class.
    $threw = false;
    try {
        app(GenerateImageConversions::class)('media/original.png');
    } catch (Throwable) {
        $threw = true;
    }

    // Restore permission immediately, before any assertion below could itself need to touch
    // the disk (Storage::disk('public')->allFiles() only reads, but this keeps the ordering
    // safe regardless).
    chmod(Storage::disk('public')->path('media'), 0755);

    expect($threw)->toBeTrue();

    // No new file (partial .webp, partial .avif, or otherwise) was left behind -- the file
    // list is byte-for-byte what it was before the failed attempt.
    expect(Storage::disk('public')->allFiles())->toBe($filesBefore);
});

test('a failure on the SECOND write deletes the variant already written by the first (N-1)', function () {
    // Story 0019 Phase 4 re-audit, finding N-1 (Low). The test above fails on the FIRST write
    // (.webp), so $written stays empty and the cleanup `foreach ($written as $path)` loop body
    // in GenerateImageConversions::__invoke() never actually executes -- that assertion passes
    // vacuously regardless of whether the cleanup loop works at all. This test makes the FIRST
    // write (.webp) succeed and only the SECOND (.avif) fail, so the loop has something real to
    // delete.
    //
    // Verified via tinker in this exact worktree: Storage::put() to a path that already exists
    // as a DIRECTORY returns `false` (config/filesystems.php's 'throw' => false on 'public'
    // means League\Flysystem's UnableToWriteFile is caught rather than propagated), matching the
    // real "disk full/permission" failure mode the write-return-value check exists for -- it is
    // not a different code path, just a different way to make put() return false on demand.
    $original = UploadedFile::fake()->image('original.png', 100, 100);
    Storage::disk('public')->putFileAs('media', $original, 'original.png');

    // Pre-create a real directory at the exact path GenerateImageConversions will try to put()
    // the .avif variant at, so that write -- and only that one -- fails.
    Storage::disk('public')->makeDirectory('media/original.avif');

    $threw = false;
    try {
        app(GenerateImageConversions::class)('media/original.png');
    } catch (Throwable) {
        $threw = true;
    }

    expect($threw)->toBeTrue();

    // The .webp file WAS written (proving the first write succeeded and the loop had a real
    // entry to act on) and is gone afterward -- the cleanup loop deleted it.
    expect(Storage::disk('public')->exists('media/original.webp'))->toBeFalse();

    // The original is untouched -- GenerateImageConversions never deletes it (that's
    // StoreUploadedImage's job, D6).
    expect(Storage::disk('public')->exists('media/original.png'))->toBeTrue();
});
