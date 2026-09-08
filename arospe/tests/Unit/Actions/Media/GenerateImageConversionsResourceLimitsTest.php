<?php

// Story 0019, Phase 4 fix round -- finding F-1 (High, blocking), item 1. NEW file; the frozen
// tests/Unit/Actions/Media/GenerateImageConversionsTest.php is not touched.
//
// A real 8000x8000 decompression bomb is not exercised here -- constructing one reliably and
// generically enough for CI is expensive and slow, and the point of item 1 is a mechanical one:
// does GenerateImageConversions actually configure Imagick's resource limits, and does it derive
// them from MediaValidationRules::MAX_DIMENSION rather than a second, hand-copied literal that
// could silently drift from it? Imagick::setResourceLimit() mutates PROCESS-GLOBAL state
// (confirmed via Reflection: it is a static method, not an instance one -- see this session's
// report), so reading it back with Imagick::getResourceLimit() right after a real conversion run
// is a direct, non-mocked assertion of what the action configured -- not an inference from mocks.
//
// Same tests/Unit/ opt-in as the frozen file: no RefreshDatabase, plain Tests\TestCase, per
// tests/Unit/Enums/UserStatusTest.php's precedent (Storage/Image facades need the container).

use App\Actions\Media\GenerateImageConversions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    Storage::fake('public');
});

test('a conversion run pins Imagick resource limits derived from MAX_DIMENSION', function () {
    $original = UploadedFile::fake()->image('original.png', 100, 100);
    Storage::disk('public')->putFileAs('media', $original, 'original.png');

    app(GenerateImageConversions::class)('media/original.png');

    // Read the constant off the class that actually applies it -- a trait constant cannot be
    // referenced as MediaValidationRules::MAX_DIMENSION directly (PHP: "Cannot access trait
    // constant ... directly"), only through a class that `use`s the trait, and
    // GenerateImageConversions itself now does. This is what proves the limits are DERIVED
    // rather than a second, independently-chosen literal.
    $maxDimension = GenerateImageConversions::MAX_DIMENSION;
    $maxArea = $maxDimension * $maxDimension;
    $expectedByteCeiling = $maxArea * 64;

    // Imagick::getResourceLimit() always returns float (verified: var_dump shows float(4000)
    // even for an int passed to setResourceLimit()) -- toEqual() (==) rather than toBe() (===)
    // so this asserts the VALUE Imagick reports rather than PHP's internal numeric type for it.
    //
    // RESOURCETYPE_AREA is asserted against $maxArea + 1 (a PIXEL count, matching
    // WIDTH x HEIGHT), never $expectedByteCeiling -- task 0019a. AREA is a pixel-count
    // resource despite its "byte ceiling" neighbours; asserting it against a byte quantity
    // only ever passed on a host whose ImageMagick policy.xml permitted a value that large,
    // which this project's own Sail image (Debian-packaged ImageMagick 6, policy.xml
    // area="256MP") does not -- see docs/errors-log.md. The `+ 1` matters: ImageMagick's AREA
    // check is a strict `<` against the limit (unlike WIDTH/HEIGHT, which are inclusive), so
    // the limit itself must sit one pixel above the largest legitimate area or a real
    // MAX_DIMENSION x MAX_DIMENSION upload is wrongly refused -- task 0019a Phase 4 finding
    // F-1/B1, and the next test below pins the boundary this comment describes.
    //
    // MEMORY/MAP are asserted with toBeLessThanOrEqual(), not toEqual() -- task 0019a Phase 4
    // finding F-2. Exact equality only held on this host because Debian's policy.xml ceiling
    // (1024MiB / 2048MiB) happens to sit just above $expectedByteCeiling; a host with a
    // stricter policy would silently clamp the request lower (safe -- never *more*
    // permissive -- but a different exact number), and exact equality would fail there for a
    // reason that has nothing to do with a real regression. <= still catches the bug this test
    // exists for: a hand-copied or wrong formula producing a value ABOVE the intended ceiling.
    expect(Imagick::getResourceLimit(Imagick::RESOURCETYPE_WIDTH))->toEqual($maxDimension)
        ->and(Imagick::getResourceLimit(Imagick::RESOURCETYPE_HEIGHT))->toEqual($maxDimension)
        ->and(Imagick::getResourceLimit(Imagick::RESOURCETYPE_AREA))->toEqual($maxArea + 1)
        ->and(Imagick::getResourceLimit(Imagick::RESOURCETYPE_MEMORY))->toBeLessThanOrEqual($expectedByteCeiling)
        ->and(Imagick::getResourceLimit(Imagick::RESOURCETYPE_MAP))->toBeLessThanOrEqual($expectedByteCeiling)
        ->and(Imagick::getResourceLimit(Imagick::RESOURCETYPE_DISK))->toEqual(0)
        ->and(Imagick::getResourceLimit(Imagick::RESOURCETYPE_TIME))->toEqual(60);
});

test('an image at exactly MAX_DIMENSION x MAX_DIMENSION is accepted, not refused by the AREA boundary (0019a B1)', function () {
    // task 0019a Phase 4/5 finding F-1/B1 (both appsec-auditor and code-reviewer found this
    // independently): the resource-limit test above proves the limits are CONFIGURED, and the
    // over-cap test below proves a too-large image is refused, but neither proves the boundary
    // itself is drawn in the right place. Before the `+ 1` fix, AREA was set to exactly
    // MAX_DIMENSION^2 -- ImageMagick's strict `<` check then refused an image sitting exactly
    // AT that pixel count, even though MediaValidationRules::imageUploadRules()'s
    // `dimensions:max_width=4000,max_height=4000` rule is inclusive and would have accepted
    // the same upload at the validation layer. That combination is the worst kind of bug: a
    // legitimate upload passes validation and then fails at decode with a misleading "could
    // not be processed" error.
    //
    // Built directly with Imagick (never UploadedFile::fake()->image(), which allocates
    // ~4 bytes/pixel of PHP-visible memory GD-side -- see the over-cap test below for why),
    // a uniform-colour 4000x4000 PNG compresses to a few KB and builds in ~1-2s.
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_WIDTH, 100000);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_HEIGHT, 100000);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_AREA, 2_000_000_000);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_MEMORY, 2_000_000_000);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_MAP, 2_000_000_000);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_DISK, 2_000_000_000);

    $maxDimension = GenerateImageConversions::MAX_DIMENSION;
    $atCap = new Imagick;
    $atCap->newImage($maxDimension, $maxDimension, new ImagickPixel('green'), 'png');
    $bytes = $atCap->getImageBlob();
    $atCap->destroy();

    Storage::disk('public')->put('media/at-cap.png', $bytes);

    $result = app(GenerateImageConversions::class)('media/at-cap.png');

    expect(Storage::disk('public')->exists($result['webp_path']))->toBeTrue()
        ->and(Storage::disk('public')->exists($result['avif_path']))->toBeTrue();
});

test('the pixel-dimension ceiling was lowered from 8000 to 4000 (finding F-1)', function () {
    // A regression guard on the constant itself, independent of the resource-limit mechanics
    // above -- the 8000 -> 4000 change is a separate, deliberate part of the same finding (a
    // 64-megapixel source measured ~3.3 GB / ~29s peak decode on this project's Imagick build)
    // and is easy to silently revert without this pinning it.
    expect(GenerateImageConversions::MAX_DIMENSION)->toBe(4000);
});

test('a real over-cap image is actually refused, not merely configured to be (N-2)', function () {
    // Story 0019 Phase 4 re-audit, finding N-2 (Low). The test above proves the limits are
    // CONFIGURED; it proves nothing about whether they actually refuse anything -- a regression
    // that moved applyImagickResourceLimits() to run too late (e.g. after decodeBinary()) would
    // keep that test green while removing the real protection. This test builds a genuine
    // 4200x4200 PNG (over MAX_DIMENSION=4000) and asserts GenerateImageConversions throws on it.
    //
    // The fixture is a UNIFORM-COLOUR image built directly with Imagick (never
    // UploadedFile::fake()->image(), which is GD's imagecreatetruecolor() and allocates ~4
    // bytes/pixel of PHP-visible memory -- 4200x4200x4 already exceeds this CLI's 128M
    // memory_limit on its own). A solid-colour PNG compresses to a couple of KB and Imagick's
    // pixel cache is C-level memory that PHP's memory_limit does not see -- this is the same
    // "uniform-colour PNG ... 2,080 B on disk" methodology
    // docs/security/image-upload-processing.md's own measurement table uses, verified in this
    // worktree to build in ~1.5s.
    //
    // Resource limits are PROCESS-GLOBAL (see the test above), so if an earlier test in this
    // same process already tightened WIDTH/HEIGHT to MAX_DIMENSION, building a LARGER fixture
    // via Imagick would itself be refused before this test ever gets to exercise
    // GenerateImageConversions. Reset them to a generous ceiling first, purely so the fixture can
    // be built -- GenerateImageConversions::__invoke() re-applies the real MAX_DIMENSION-derived
    // limits as its own first statement regardless of what this test leaves them at.
    // 2,000,000,000 (~1.9 GB), not PHP_INT_MAX -- verified in this worktree that passing
    // PHP_INT_MAX here overflows to a float Imagick's own resource accounting mishandles,
    // producing the exact same CacheResourcesExhausted this reset exists to avoid. A large,
    // ordinary integer is what actually raises the ceiling.
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_WIDTH, 100000);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_HEIGHT, 100000);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_AREA, 2_000_000_000);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_MEMORY, 2_000_000_000);
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_MAP, 2_000_000_000);
    // DISK too: the first test in this file already ran GenerateImageConversions once, which
    // pinned RESOURCETYPE_DISK to 0 process-globally -- left at 0, Imagick's pixel cache for a
    // 4200x4200 image can hit CacheResourcesExhausted while merely being BUILT, before this test
    // ever gets to the thing it's testing.
    Imagick::setResourceLimit(Imagick::RESOURCETYPE_DISK, 2_000_000_000);

    $oversized = new Imagick;
    $oversized->newImage(4200, 4200, new ImagickPixel('red'), 'png');
    $bytes = $oversized->getImageBlob();
    $oversized->destroy();

    Storage::disk('public')->put('media/huge.png', $bytes);

    $threw = false;
    try {
        app(GenerateImageConversions::class)('media/huge.png');
    } catch (Throwable) {
        $threw = true;
    }

    expect($threw)->toBeTrue();

    // No variant was written -- the decode never got far enough to encode anything.
    expect(Storage::disk('public')->allFiles('media'))->toBe(['media/huge.png']);
});
