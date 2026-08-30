<?php

namespace App\Livewire\Dev;

use Livewire\Attributes\On;
use Livewire\Attributes\Title;
use Livewire\Component;

/**
 * TEMPORARY SCAFFOLDING for story 0020's own browser tests (D16). Reachable
 * only through the environment-gated `dev.media-gallery-harness` route
 * (routes/web.php, registered exclusively under `testing`/`local`) -- it is
 * NOT app surface, is not linked from anywhere, and is deleted, together
 * with that route and this component's view, by story 0027 once the product
 * editor supplies a real host page for App\Livewire\Media\Gallery. Do not
 * treat this component as a precedent for how a real consumer embeds the
 * gallery -- that is App\Livewire\SalesRegions\Index's shape, or story
 * 0027's own product editor once it exists.
 *
 * The gallery has no route of its own (0019 D10, reconfirmed by 0020 D12),
 * so nothing in this app produces a URL a browser test can `visit()` against
 * it directly. This harness embeds it exactly the way D2 says a real
 * consumer must: a `#[Modelable]` boolean the host toggles, and one `#[On]`
 * listener per embedded instance keyed to that instance's own
 * consumer-supplied `select-event` name.
 *
 * It embeds **two** independent `<livewire:media.gallery>` instances --one
 * single-select, one multi-select -- because a single-instance harness
 * cannot exercise D2/V3's re-entrancy guarantee at all: confirming one
 * gallery's staged selection must dispatch only to its own listener and
 * never bleed into the other embedded instance's. Each instance's listener
 * writes what it received into its own public property below, rendered on
 * the page, so a browser test can assert on the real dispatch outcome
 * without any JS console/network inspection.
 *
 * Per D12, the *consumer* decides whether the child renders at all --
 * both embeds are wrapped in `@can('viewAny', \App\Models\Media::class)` in
 * the view, matching the pattern a real host page (story 0021/0027) must
 * follow.
 */
#[Title('Media gallery harness (dev only)')]
class MediaGalleryHarness extends Component
{
    /**
     * Phase 4 security audit finding F-2 (Low): defence in depth behind
     * routes/web.php's registration-time `if (app()->environment('testing',
     * 'local'))` gate. That gate is correct for a normal boot, but
     * `bootstrap/cache/routes-v7.php` is loaded verbatim by `route:cache`
     * and never re-evaluates it -- so a route cache built while `APP_ENV`
     * was still `local`/`testing` would ship this harness route to
     * production, where the `if` never runs again. `abort_unless(...,
     * 404)`, not 403, so a probe against this URL in production stays
     * indistinguishable from a route that does not exist at all --
     * FOR AN AUTHENTICATED PROBE (Phase 5 fix round finding F-7, narrowing
     * this claim: an unauthenticated probe never reaches this method at
     * all -- `routes/web.php`'s `auth` middleware runs first and redirects
     * to `/login` with a 302, which is trivially distinguishable from a
     * missing route). The two probes this 404 is indistinguishable from a
     * missing route for are: a signed-in, verified user hitting this URL
     * once the route cache has gone stale, and a direct
     * `Livewire::test(MediaGalleryHarness::class)` mount that bypasses the
     * route/middleware layer entirely (see
     * tests/Feature/Dev/MediaGalleryHarnessRouteTest.php's own coverage of
     * both).
     */
    public function mount(): void
    {
        abort_unless(app()->environment('testing', 'local'), 404);
    }

    public bool $showSingle = false;

    public bool $showMulti = false;

    /**
     * What the single-select instance's `#[On]` listener last received.
     *
     * @var array<int, array{id: string, title: string, description: string|null, url: string, webpUrl: string, avifUrl: string, width: int, height: int}>
     */
    public array $singleSelected = [];

    /**
     * What the multi-select instance's `#[On]` listener last received.
     *
     * @var array<int, array{id: string, title: string, description: string|null, url: string, webpUrl: string, avifUrl: string, width: int, height: int}>
     */
    public array $multiSelected = [];

    public function openSingle(): void
    {
        $this->showSingle = true;
    }

    public function openMulti(): void
    {
        $this->showMulti = true;
    }

    /**
     * @param  array<int, array{id: string, title: string, description: string|null, url: string, webpUrl: string, avifUrl: string, width: int, height: int}>  $media
     */
    #[On('harness-single-selected')]
    public function receiveSingleSelection(array $media): void
    {
        $this->singleSelected = $media;
    }

    /**
     * @param  array<int, array{id: string, title: string, description: string|null, url: string, webpUrl: string, avifUrl: string, width: int, height: int}>  $media
     */
    #[On('harness-multi-selected')]
    public function receiveMultiSelection(array $media): void
    {
        $this->multiSelected = $media;
    }
}
