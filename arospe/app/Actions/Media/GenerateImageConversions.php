<?php

namespace App\Actions\Media;

use App\Concerns\MediaValidationRules;
use Illuminate\Support\Facades\Storage;
use Imagick;
use Intervention\Image\Encoders\AvifEncoder;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\Laravel\Facades\Image;
use RuntimeException;
use Throwable;

/**
 * Generate a `.webp` and an `.avif` variant of an image already stored on
 * the `public` disk, writing both alongside the original under the same
 * basename (story 0019, D1/D2/D8).
 *
 * This is the **only** class in the story that imports the imaging library
 * (Intervention Image, pinned to the Imagick driver -- see
 * config/intervention-image.php). Every other class is unaware of which
 * package provides it.
 *
 * `use MediaValidationRules` here is deliberate even though this class calls
 * neither of the trait's rule methods: it is the only way to reach
 * `MAX_DIMENSION` without duplicating the literal, since a trait constant
 * cannot be read as `MediaValidationRules::MAX_DIMENSION` directly (PHP
 * throws "Cannot access trait constant ... directly") -- only through a
 * class that `use`s the trait. See applyImagickResourceLimits() below.
 */
class GenerateImageConversions
{
    use MediaValidationRules;

    /**
     * Story 0019 Phase 4 finding F-1 (High): a bounds-based ceiling ALONE
     * (MediaValidationRules::MAX_DIMENSION, checked by the `dimensions:`
     * validation rule) does not bound decoded memory, because bytes-per-
     * pixel is a property of the installed ImageMagick build, not a
     * constant -- this project's Q16-HDRI Imagick measured ~51 bytes/pixel
     * decoded (a later, decode-plus-encode-cycle measurement in
     * docs/security/image-upload-processing.md reports ~35 -- a different
     * measurement condition, not a contradiction), not the naive 4 the pixel
     * cap alone assumes. 64 is a deliberate safety margin over the higher of
     * the two measurements (not a tight fit), so a real
     * MAX_DIMENSION x MAX_DIMENSION photo is never falsely refused.
     */
    private const BYTES_PER_PIXEL_CEILING = 64;

    /**
     * A wall-clock backstop against any input shape the pixel/byte limits
     * above don't otherwise bound (e.g. a pathological animation or a
     * format-specific decode cost). Generous for a single small backoffice
     * upload (D4 already assumes synchronous decoding is sub-second to a
     * few seconds).
     */
    private const TIME_LIMIT_SECONDS = 60;

    /**
     * Decode the file at `$originalPath` on the `public` disk and encode it
     * to `.webp` and `.avif`, writing both next to the original. Throws
     * (any Throwable) on an undecodable input or a failed encode, and never
     * leaves a partially-written variant behind -- whatever this call
     * itself wrote is deleted before the exception propagates. Deleting the
     * original itself on failure is the caller's job (StoreUploadedImage,
     * D6), not this action's.
     *
     * @return array{webp_path: string, avif_path: string}
     */
    public function __invoke(string $originalPath): array
    {
        $this->applyImagickResourceLimits();

        $disk = Storage::disk('public');

        // decodeBinary(), never decodePath()/decode($path) -- the source is
        // read through the Storage facade so this works identically against
        // Storage::fake('public') in tests and the real local disk.
        $image = Image::decodeBinary($disk->get($originalPath));

        $basename = preg_replace('/\.[^.\/]+$/', '', $originalPath);
        $webpPath = $basename.'.webp';
        $avifPath = $basename.'.avif';

        $written = [];

        try {
            // Story 0019 Phase 4 finding F-3 (Medium): config/filesystems.php sets
            // 'throw' => false on the 'public' disk, so a failing Storage::put()
            // (full disk, permissions, quota) returns `false` rather than
            // throwing -- the return value was previously ignored for both
            // writes below, which could commit a `media` row pointing at a
            // variant that was never written. Checked the same way
            // StoreUploadedImage::putFile() already checks its own write.
            $disk->put($webpPath, $image->encode(new WebpEncoder)->toString()) ?: throw new RuntimeException(
                "Failed to write the .webp conversion to [{$webpPath}]."
            );
            $written[] = $webpPath;

            $disk->put($avifPath, $image->encode(new AvifEncoder)->toString()) ?: throw new RuntimeException(
                "Failed to write the .avif conversion to [{$avifPath}]."
            );
            $written[] = $avifPath;
        } catch (Throwable $e) {
            foreach ($written as $path) {
                $disk->delete($path);
            }

            throw $e;
        }

        return ['webp_path' => $webpPath, 'avif_path' => $avifPath];
    }

    /**
     * Story 0019 Phase 4 finding F-1 (High): make the decoder enforce the
     * same pixel ceiling `MediaValidationRules::imageUploadRules()`'s
     * `dimensions:` rule promises, instead of trusting a header-reported
     * dimension check alone. `Imagick::setResourceLimit()` is a static
     * method mutating process-global state (verified via Reflection before
     * relying on it), so calling this at the top of every `__invoke()` is
     * correct and idempotent rather than something to cache or call once.
     *
     * WIDTH/HEIGHT are capped in pixels at MAX_DIMENSION so an oversized
     * image is refused at header-parse time, before any pixel buffer is
     * allocated. AREA is *also* a pixel-count resource -- not a byte one,
     * despite its name reading like the others -- and is capped at
     * MAX_DIMENSION^2, matching WIDTH x HEIGHT already being capped
     * individually (task 0019a; see docs/errors-log.md). MEMORY/MAP are the
     * genuinely byte-based resources and are capped at
     * MAX_DIMENSION^2 x BYTES_PER_PIXEL_CEILING -- generous enough for a
     * legitimate MAX_DIMENSION x MAX_DIMENSION image at this build's
     * worst-case bytes-per-pixel, while still refusing a decompression bomb
     * whose header claims a byte cost far beyond that (e.g. an animated
     * image whose every frame is individually within the WIDTH/HEIGHT/AREA
     * caps but whose cumulative decoded size is not). DISK is 0 so a
     * refused decode fails fast rather than spilling gigabytes of pixel
     * cache to disk first. TIME is a wall-clock backstop.
     *
     * Task 0019a note: on a host whose ImageMagick ships a restrictive
     * policy.xml (e.g. Debian/Ubuntu's packaged ImageMagick 6, which is what
     * this project's own Sail image installs), `setResourceLimit()` can only
     * *tighten* a resource below the policy's own ceiling -- it silently
     * clamps a request that exceeds it, with no error. Requesting the byte
     * ceiling for AREA (a pixel resource) previously asked for a value far
     * above the policy's pixel ceiling on that host, which happened to still
     * be silently accepted-and-clamped rather than throw, but was
     * conceptually wrong regardless of which host runs it.
     *
     * Task 0019a Phase 4 finding F-1: ImageMagick's AREA check is a STRICT
     * `<` against the limit (verified: AREA == MAX_DIMENSION^2 refuses an
     * exactly-MAX_DIMENSION x MAX_DIMENSION image; AREA == MAX_DIMENSION^2+1
     * admits it), so the limit itself must be one pixel *above* the largest
     * legitimate area, not equal to it -- otherwise a legal upload at
     * exactly the dimension ceiling is refused, contradicting
     * MediaValidationRules::imageUploadRules()'s inclusive `dimensions:`
     * rule. `+ 1` is the fix, not a wider margin: WIDTH/HEIGHT already cap
     * every dimension individually, so MAX_DIMENSION^2 is the true
     * ceiling and one pixel of headroom is exactly what "greater than the
     * largest legal value" requires.
     */
    private function applyImagickResourceLimits(): void
    {
        $maxLegitimateArea = self::MAX_DIMENSION * self::MAX_DIMENSION;
        $byteCeiling = $maxLegitimateArea * self::BYTES_PER_PIXEL_CEILING;

        Imagick::setResourceLimit(Imagick::RESOURCETYPE_WIDTH, self::MAX_DIMENSION);
        Imagick::setResourceLimit(Imagick::RESOURCETYPE_HEIGHT, self::MAX_DIMENSION);
        Imagick::setResourceLimit(Imagick::RESOURCETYPE_AREA, $maxLegitimateArea + 1);
        Imagick::setResourceLimit(Imagick::RESOURCETYPE_MEMORY, $byteCeiling);
        Imagick::setResourceLimit(Imagick::RESOURCETYPE_MAP, $byteCeiling);
        Imagick::setResourceLimit(Imagick::RESOURCETYPE_DISK, 0);
        Imagick::setResourceLimit(Imagick::RESOURCETYPE_TIME, self::TIME_LIMIT_SECONDS);
    }
}
