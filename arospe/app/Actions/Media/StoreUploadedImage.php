<?php

namespace App\Actions\Media;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Concerns\MediaValidationRules;
use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Exceptions\ImageException;
use RuntimeException;
use Throwable;

/**
 * Store an uploaded image on the `public` disk, generate its `.webp` and
 * `.avif` conversions, and record the row -- atomically, per D6: the
 * original, both variants and the `media` row commit or fail together. Any
 * file this call itself wrote is deleted before an exception propagates, so
 * a failure never leaves an orphaned file behind.
 *
 * `$generateImageConversions` and `$logRefusedPrivilegedAttempt` are both
 * constructor-injected rather than method-injected: `__invoke()`'s parameter
 * list is a public contract every caller (the Livewire component, and every
 * direct-call test) matches verbatim, so this action's own dependencies go
 * in the constructor instead of widening that signature -- the same
 * exception `SetSalesRegionActive`'s dependency on `SetDefaultSalesRegion`
 * follows (docs/conventions/code-style.md).
 */
class StoreUploadedImage
{
    use MediaValidationRules;

    public function __construct(
        private readonly GenerateImageConversions $generateImageConversions,
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Store $photo, generate its conversions and create the `media` row.
     * `uploaded_by` is derived from the authenticated actor internally
     * rather than accepted as a parameter, matching the "derive a
     * security-relevant/identity value internally" convention `CreateUser`
     * / `UpdateUser` already established.
     *
     * Story 0019 Phase 4 finding F-2 (Medium, blocking): this class is
     * designed (D10) to be callable by a future non-Livewire caller
     * (Products/Blog embed, Artisan command, queued job) — this method
     * re-validates $photo itself, defence in depth, exactly like the
     * doubled `Gate::authorize()` call below already does for the same
     * reason. It does NOT replace App\Livewire\Media\Gallery::upload()'s
     * own validation via App\Concerns\MediaValidationRules -- that stays,
     * and this is what a caller other than the Livewire component inherits
     * independently.
     */
    public function __invoke(UploadedFile $photo, string $title, ?string $description = null): Media
    {
        // Phase 6 docs-keeper finding: this call used a bare Gate::authorize()
        // and every other privileged mutation this story ships (Gallery's own
        // authorize calls) logs its refusal via LogRefusedPrivilegedAttempt
        // (story 0015b's recipe) -- this action is the one a future
        // non-Livewire caller (D10) would reach with no other log site
        // upstream, so it must record its own refusal independently.
        $this->logRefusedPrivilegedAttempt->authorize('create', Media::class);

        // Story 0019 Phase 4 finding F-2: without this, a caller that never
        // goes through App\Livewire\Media\Gallery::upload() (D10's own
        // stated future consumer) inherits NO file-type check at all, and
        // an attacker-controlled byte stream could be written into a
        // directory storage:link makes web-reachable -- with an extension
        // derived from sniffed content (text/html -> .html,
        // image/svg+xml -> .svg), enabling stored XSS from the app's own
        // origin. `Validator::make(...)->validate()` throws
        // ValidationException on failure, the same as the Livewire
        // component's own `$this->validate()`.
        Validator::make(
            ['photo' => $photo],
            ['photo' => $this->imageUploadRules()],
        )->validate();

        $disk = Storage::disk('public');

        // Story 0019 Phase 4 finding F-2, second half: don't trust
        // Storage::putFile()'s inferred extension (via $file->hashName(),
        // which derives it from the sniffed MIME's guessExtension()) as the
        // sole gate against an unexpected file type landing in a
        // web-served directory. Store with an explicit, allow-listed
        // extension derived from the now-validated MIME instead --
        // putFileAs() with a random basename, matching putFile()'s own "no
        // user input reaches the path" property.
        $extension = $this->extensionForValidatedMimeType($photo->getMimeType());

        $path = $disk->putFileAs('media', $photo, Str::random(40).'.'.$extension) ?: throw new RuntimeException(
            'Failed to store the uploaded image on the public disk.'
        );

        /** @var array{webp_path: string, avif_path: string}|null $conversions */
        $conversions = null;

        try {
            // Validation already guarantees $photo decodes as an image, so
            // a false return here means the file on disk doesn't match what
            // was validated -- fail loudly rather than store a bogus 0x0.
            $dimensions = getimagesize($disk->path($path)) ?: throw new RuntimeException(
                "Unable to read dimensions of uploaded image at [{$path}]."
            );

            $conversions = ($this->generateImageConversions)($path);

            return DB::transaction(function () use ($photo, $title, $description, $path, $dimensions, $conversions): Media {
                // Literal whitelist via forceCreate(), matching
                // App\Actions\Users\CreateUser's own precedent: `path`,
                // `webp_path`, `avif_path`, `width`, `height`, `size_bytes`
                // and `uploaded_by` are deliberately absent from
                // #[Fillable] (server-derived), so a plain Media::create()
                // would silently drop them.
                return Media::forceCreate([
                    'title' => $title,
                    'description' => $description,
                    'path' => $path,
                    'webp_path' => $conversions['webp_path'],
                    'avif_path' => $conversions['avif_path'],
                    'width' => $dimensions[0],
                    'height' => $dimensions[1],
                    'size_bytes' => $photo->getSize(),
                    'uploaded_by' => Auth::id(),
                ]);
            });
        } catch (Throwable $e) {
            // The DB transaction above only rolls back the database write --
            // every filesystem side effect (the original, and whichever
            // variant(s) GenerateImageConversions wrote before throwing, or
            // both variants if the row insert itself is what failed) is
            // cleaned up here (D6).
            $disk->delete($path);

            if ($conversions !== null) {
                $disk->delete([$conversions['webp_path'], $conversions['avif_path']]);
            }

            // Story 0019 Phase 4 finding F-1 (High), item 4: a refusal from
            // GenerateImageConversions' Imagick resource limits (or any
            // other decode/encode failure) surfaces as an
            // Intervention\Image\Exceptions\ImageException -- Intervention
            // wraps the underlying ImagickException itself. Translate it to
            // a real, non-alarming validation message on the `photo` field
            // instead of letting a raw imaging-library exception surface as
            // a 500: Livewire's SupportValidation feature catches a
            // ValidationException thrown from ANY component method call,
            // not only from $this->validate() (the same mechanism
            // App\Actions\Users\RequestEmailChange and
            // App\Actions\SalesRegions\SetDefaultSalesRegion already rely
            // on), so this propagates through App\Livewire\Media\Gallery::
            // upload() uncaught and renders as a normal inline error. Any
            // other Throwable (a bad row insert, a disk failure) is
            // rethrown unchanged.
            if ($e instanceof ImageException) {
                throw ValidationException::withMessages([
                    'photo' => trans('media.upload_rejected'),
                ]);
            }

            throw $e;
        }
    }

    /**
     * Map a validated image MIME type to its stored file extension.
     * Deliberately a fixed, allow-listed map rather than
     * `guessExtension()`/`clientExtension()` -- neither is trustworthy for
     * a path a web server serves directly. The `default` arm should be
     * unreachable given imageUploadRules()'s `mimes:jpg,jpeg,png` check
     * above; it exists as a fail-loud backstop, not a real branch.
     */
    private function extensionForValidatedMimeType(?string $mimeType): string
    {
        return match ($mimeType) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            default => throw new RuntimeException(
                "Unexpected MIME type [{$mimeType}] reached storage after validation passed."
            ),
        };
    }
}
