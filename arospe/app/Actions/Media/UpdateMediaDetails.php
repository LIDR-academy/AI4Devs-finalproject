<?php

namespace App\Actions\Media;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Concerns\MediaValidationRules;
use App\Models\Media;
use Illuminate\Support\Facades\Validator;

/**
 * Persist an inline title/description edit on an existing `Media` row (story
 * 0020, D10) -- the first real exercise of the `media.edit` ability story
 * 0019 seeded and stubbed but never used.
 *
 * Authorizes and validates itself, defence in depth on top of
 * App\Livewire\Media\Gallery::updateMediaDetails()'s own identical check
 * (matching App\Actions\Media\StoreUploadedImage's precedent): this class is
 * designed to be independently callable by a future non-Livewire caller, so
 * a caller that never goes through the Gallery component must not inherit a
 * weaker rule than the one the modal enforces.
 *
 * Writes `title`/`description` only -- the three path columns and the
 * server-derived dimension/size/uploader columns stay outside
 * `#[Fillable]` (0019's mass-assignment guard) and nothing here has any
 * business touching them, so a plain `$media->update([...])` is the correct
 * (allow-listed) write.
 */
class UpdateMediaDetails
{
    use MediaValidationRules;

    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Validate and persist $title/$description on $media, returning the
     * refreshed row.
     */
    public function __invoke(Media $media, string $title, ?string $description = null): Media
    {
        $this->logRefusedPrivilegedAttempt->authorize('update', $media);

        $validated = Validator::make(
            ['title' => $title, 'description' => $description],
            $this->mediaDetailsRules(),
            attributes: __('media.attributes'),
        )->validate();

        // `nullable` does not rewrite '' to null (the same note
        // App\Livewire\Media\Gallery::upload() already carries for the
        // upload form's own description field) -- convert explicitly so an
        // emptied description is stored as NULL rather than ''.
        $media->update([
            'title' => $validated['title'],
            'description' => $validated['description'] !== '' && $validated['description'] !== null
                ? $validated['description']
                : null,
        ]);

        return $media->refresh();
    }
}
