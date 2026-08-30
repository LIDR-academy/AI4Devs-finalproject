<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Shared validation rules for the Media Library area (story 0019), consumed
 * by App\Livewire\Media\Gallery.
 */
trait MediaValidationRules
{
    /**
     * The upload size ceiling, in kilobytes (D5). Laravel's `File`/`Image`
     * validation rules measure a file's `getSize()` in KB (see
     * `ValidatesAttributes::getSize()`), so `max:8192` is exactly 8 MB. A
     * constant on this trait, not an `.env` key -- see D5.
     */
    public const MAX_UPLOAD_KB = 8192;

    /**
     * The pixel-dimension ceiling applied to both width and height (D5). A
     * size cap alone does not bound decode cost, since a highly-compressible
     * image can be tiny on disk and huge once decoded.
     *
     * Lowered from the originally-recommended 8000 to 4000 by story 0019's
     * Phase 4 security audit (finding F-1, High): this project's installed
     * Imagick build (Q16-HDRI) measured ~51 bytes/pixel decoded (the
     * re-audit's later, decode-plus-encode-cycle measurement in
     * docs/security/image-upload-processing.md reports ~35 -- a different
     * measurement condition, not a contradiction; both are far above the
     * naive 4 bytes/pixel a dimension cap alone assumes), so an 8000x8000
     * upload (a 182 KB file well under the 8 MB size cap) could decode to
     * ~3.3 GB / ~29s in a single request. At 4000x4000 the same build
     * measured ~850 MB peak — a real availability difference, and a
     * 64-megapixel source has no legitimate use for a gallery tile. D5 itself
     * names this constant as "explicitly left open for adjustment", so
     * lowering it is within the story's own stated latitude. See
     * App\Actions\Media\GenerateImageConversions, which derives its Imagick
     * resource limits from this same constant so the decoder enforces the
     * identical ceiling this validation rule promises.
     */
    public const MAX_DIMENSION = 4000;

    /**
     * Get the validation rules used to validate an uploaded image file.
     *
     * `mimes:jpg,jpeg,png` and `image` both resolve their check through
     * Symfony's content-sniffed `guessExtension()` (not the filename), so a
     * text file renamed to `.png` is rejected by either rule alone -- both
     * are kept per D5, which names them as a pair.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function imageUploadRules(): array
    {
        return [
            'required',
            'image',
            'mimes:jpg,jpeg,png',
            'max:'.self::MAX_UPLOAD_KB,
            'dimensions:max_width='.self::MAX_DIMENSION.',max_height='.self::MAX_DIMENSION,
        ];
    }

    /**
     * Get the validation rules used to validate a media item's title and
     * description (PRD §2.3 -- title required, description optional).
     *
     * `description` carries an explicit `max:2000` (story 0020 Phase 4
     * security audit finding F-3, Low): the column is `TEXT`, and with no
     * length rule an over-large value reaches the database and throws an
     * unhandled `QueryException` (a 500) under MySQL strict mode rather
     * than failing validation cleanly. Reachable both via `Gallery::upload()`
     * and via `App\Actions\Media\UpdateMediaDetails`'s inline-edit
     * `editDescription` field, an unlocked, fully client-controlled
     * `wire:model`-bound property.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function mediaDetailsRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
