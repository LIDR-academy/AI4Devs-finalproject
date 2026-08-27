<?php

namespace App\Livewire\Media;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\Media\StoreUploadedImage;
use App\Concerns\MediaValidationRules;
use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Title;
use Livewire\Component;
use Livewire\WithFileUploads;

/**
 * The Shared Media Gallery (PRD §2.3) -- story 0019 ships this component
 * class and a placeholder view only; story 0020 replaces the view with the
 * real modal (D10).
 *
 * D10 -- modal-only, no route: there is no standalone Media Library page
 * this phase, so there is no `can:` route middleware to rely on. **All**
 * authorization is therefore this component's own -- authorized (and, per
 * story 0015b's recipe, logged on refusal via
 * App\Actions\Auth\LogRefusedPrivilegedAttempt) in `mount()` and as the
 * first statement of `upload()`, per
 * docs/security/livewire-authorization.md's "gate every method that mutates
 * or discloses" rule.
 */
#[Title('Media Library')]
class Gallery extends Component
{
    use MediaValidationRules, WithFileUploads;

    public ?UploadedFile $photo = null;

    /**
     * Never null -- see the errors-log entry on a null-valued property
     * desyncing a native form control (the same rule this project's other
     * screens already follow for a `wire:model`-bound string property).
     */
    public string $title = '';

    public string $description = '';

    /**
     * Mount the component. `viewAny` is authorized here because -- per D10
     * -- there is no route middleware behind this component at all; every
     * `Livewire::test()` call (and every real embed) reaches `mount()`
     * directly.
     *
     * Phase 6 docs-keeper finding: logged via LogRefusedPrivilegedAttempt
     * (story 0015b's recipe), unlike Users\Index::mount() /
     * Roles\Index::mount() / SalesRegions\Index::mount(), which are
     * deliberately left unlogged because their routes' own `can:` gate
     * already refuses before mount() ever runs, making a mount()-level
     * refusal unreachable over HTTP. This component has no route (D10) --
     * mount() is the *only* gate a caller reaches, so its refusal is the
     * one this recipe exists to record.
     */
    public function mount(LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('viewAny', Media::class);
    }

    /**
     * Validate and store the pending upload.
     *
     * `Gate::authorize('create', ...)` here duplicates the identical check
     * `StoreUploadedImage` performs -- deliberate defence in depth, not
     * redundancy to remove: this is what fails fast before validation even
     * runs, and what a direct caller of the action (an Artisan command, a
     * future Products/Blog embed) inherits independently of this component
     * (docs/conventions/base-standards.md).
     *
     * Story 0019 Phase 4 finding F-1 (High), item 3: rate-limited here, at
     * the component level. Livewire's own `throttle:60,1` on the
     * *temporary*-upload endpoint (config/livewire.php) only bounds how
     * fast a file can be staged there -- a single already-validated
     * temporary-upload token can otherwise be replayed against this method
     * (and therefore against StoreUploadedImage's synchronous Imagick
     * decode, D4) unboundedly. 10/hour matches this project's existing
     * scale for a comparable backoffice write action
     * (App\Actions\Users\RequestEmailChange's own 10/hour aggregate
     * ceiling) -- cheap for a legitimate upload session, meaningful against
     * replay. Thrown as a ValidationException (not a raw HTTP 429) to
     * match the action-level throttle idiom this project already uses
     * (RequestEmailChange does the same on its own limiter): there is no
     * route or HTTP middleware layer behind this modal-only component
     * (D10) to attach a `throttle:` alias to, so `password.confirm`'s 429
     * -- a route-middleware throttle -- is not the applicable precedent
     * here.
     *
     * Story 0019 Phase 4 re-audit finding N-4 (Low): the throttle consumes
     * an attempt only AFTER `$this->validate()` succeeds, not before. It
     * exists to bound the expensive synchronous Imagick decode
     * (StoreUploadedImage -> GenerateImageConversions), so a rejected
     * upload that never reaches that decode -- wrong file type, no file
     * selected, an oversized file -- must not burn the same hourly
     * allowance a user who fumbles the form ten times would otherwise lose
     * for the rest of the window.
     */
    public function upload(StoreUploadedImage $storeUploadedImage, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('create', Media::class);

        $validated = $this->validate([
            'photo' => $this->imageUploadRules(),
            ...$this->mediaDetailsRules(),
        ], attributes: __('media.attributes'));

        $throttleKey = 'media-upload:'.(Auth::id() ?? 'unauthenticated');

        if (! RateLimiter::attempt($throttleKey, maxAttempts: 10, callback: fn (): bool => true, decaySeconds: 3600)) {
            throw ValidationException::withMessages([
                'photo' => trans('media.upload_throttled'),
            ]);
        }

        // `nullable` does not rewrite '' to null (the same note
        // SalesRegionValidationRules::rateRules() carries) -- convert
        // explicitly so an omitted description is stored as NULL, matching
        // the column's own "optional" semantics.
        $storeUploadedImage(
            $validated['photo'],
            $validated['title'],
            $validated['description'] !== '' ? $validated['description'] : null,
        );

        $this->reset(['photo', 'title', 'description']);
    }
}
