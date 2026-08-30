<?php

namespace App\Livewire\Media;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\Media\StoreUploadedImage;
use App\Actions\Media\UpdateMediaDetails;
use App\Concerns\MediaValidationRules;
use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Modelable;
use Livewire\Attributes\Title;
use Livewire\Component;
use Livewire\WithFileUploads;

/**
 * The Shared Media Gallery (PRD §2.3) -- story 0019 shipped this component's
 * `mount()`/upload() surface plus a placeholder view; story 0020 adds the
 * D2 consumer contract (selection, confirm/cancel, search), D10's inline
 * title/description editing, and the real modal view.
 *
 * D10 -- modal-only, no route: there is no standalone Media Library page
 * this phase, so there is no `can:` route middleware to rely on. **All**
 * authorization is therefore this component's own -- authorized (and, per
 * story 0015b's recipe, logged on refusal via
 * App\Actions\Auth\LogRefusedPrivilegedAttempt) in `mount()` and as the
 * first statement of `upload()` and `updateMediaDetails()`, per
 * docs/security/livewire-authorization.md's "gate every method that mutates
 * or discloses" rule. Story 0020's D12 additionally makes the *consumer*
 * responsible for whether this child renders at all
 * (`@can('viewAny', \App\Models\Media::class)` around the `<livewire:...>`
 * tag), so a user who cannot reach the gallery never 403s the host page --
 * every `Gate`/`LogRefusedPrivilegedAttempt` call below stays as defence in
 * depth for a direct `Livewire::test()` mount or a mounted-then-revoked
 * mid-session actor.
 */
#[Title('Media Library')]
class Gallery extends Component
{
    use MediaValidationRules, WithFileUploads;

    /**
     * The parent's own boolean `wire:model` target (D2) -- the consumer
     * opens/closes this modal by toggling its bound property; `cancel()`
     * and `confirmSelection()` both close it from this side too.
     */
    #[Modelable]
    public bool $open = false;

    /**
     * Mount-time config (D2) -- never legitimately changes mid-life, so it
     * is `#[Locked]` and assigned only from `mount()`'s own parameters,
     * never via `wire:model`/`->set()`.
     */
    #[Locked]
    public bool $multi = false;

    /**
     * The consumer-supplied event name `confirmSelection()` dispatches
     * under (D2). Deliberately consumer-supplied rather than fixed or
     * `->to()`-targeted: two embedded instances on one page cannot be told
     * apart by component name alone (V3) -- see D2's rejected-alternatives
     * table.
     */
    #[Locked]
    public string $selectEvent = 'media-selected';

    /**
     * Blank means "use the `$multi`-keyed lang fallback", never "unset"
     * (D3) -- the same `''`-not-`null` convention this project's other
     * `#[Locked]` string config properties already follow.
     */
    #[Locked]
    public string $confirmLabel = '';

    /**
     * The staged selection. Component state, never a projection of the
     * currently-rendered/filtered tile grid (D5) -- mutated only by
     * `toggleSelect()` and cleared by `confirmSelection()`/`cancel()`.
     *
     * @var array<int, string>
     */
    #[Locked]
    public array $selectedIds = [];

    /**
     * The gallery's only client-writable property (D6). Never `null` -- the
     * errors-log's null-`<select>`-desync rule, applied here even though
     * this binds a text input rather than a `<select>`, for the same
     * reason: a `wire:model`-bound property must never actually be `null`.
     */
    public string $search = '';

    /**
     * The maximum number of files one drop or file-picker selection may
     * carry (D9). V6 (no `max_execution_time` override, so PHP's 30s
     * default applies) plus 0019 D4's "sub-second to a few seconds per
     * file" is what bounds this. Appears in exactly two places, per D9: the
     * validation rule below and the `media.gallery.too_many_files` copy it
     * names in its own custom validation message.
     *
     * Lowered from the originally-confirmed 5 to 3 by a Phase 4 security
     * re-audit of this story's D8/D9 additions (finding F-E, Low): D9's own
     * "five sequential two-format Imagick encodes stay inside 30s with
     * margin" justification did not hold under measurement -- 5 files at
     * `MediaValidationRules::MAX_DIMENSION` (4000x4000) took a measured
     * 34.8s total through `StoreUploadedImage` alone, over the 30s
     * `max_execution_time` default with no margin at all. 3 files at the
     * same worst-case dimension measured ~21s, comfortably inside 30s with
     * real margin. This dev environment's CLI SAPI happens not to enforce
     * `max_execution_time`, which masked the risk here, but a real FPM
     * deployment inheriting the 30s default would kill the request
     * mid-batch -- compounding the F-B fix below, since a killed request
     * never reaches the `reset()` call that recovers the upload surface for
     * the next attempt.
     */
    private const MAX_FILES = 3;

    /**
     * `wire:model="pendingUploads" multiple` (D7/D9) drives Livewire's own
     * upload-to-temporary-storage pipeline automatically for every file the
     * administrator picks or drops, staged as one batch; nothing in the
     * view calls `upload()` directly, so `updatedPendingUploads()` below is
     * what turns "a batch finished staging" into the real store-and-convert
     * call.
     *
     * Story 0020 Phase 5 fix round, D9: supersedes 0019's original singular
     * `public ?UploadedFile $photo` -- Phase 2 divergence #2 already
     * flagged this as a deliberate, documented supersession of D4 rather
     * than a silent rename. Capped at `self::MAX_FILES` per batch, enforced
     * by `validate()` inside `upload()`, never by silently truncating the
     * array here.
     *
     * @var array<int, UploadedFile>
     */
    public array $pendingUploads = [];

    /**
     * Never null -- see the errors-log entry on a null-valued property
     * desyncing a native form control (the same rule this project's other
     * screens already follow for a `wire:model`-bound string property).
     */
    public string $title = '';

    public string $description = '';

    /**
     * D10 -- the tile currently open for inline editing, if any. Deliberate
     * separate property names from `$title`/`$description` above (Phase 2
     * divergence #4): those are the *upload* form's fields, and reusing
     * them for the per-tile edit form would silently collide the two.
     */
    #[Locked]
    public ?string $editingMediaId = null;

    public string $editTitle = '';

    public string $editDescription = '';

    /**
     * Mount the component. `viewAny` is authorized here because -- per D10
     * -- there is no route middleware behind this component at all; every
     * `Livewire::test()` call (and every real embed) reaches `mount()`
     * directly.
     *
     * $multi/$selectEvent/$confirmLabel are only assigned here when the
     * consumer actually supplied them, so an omitted attribute keeps the
     * property's own default rather than being overwritten with an empty
     * value.
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
    public function mount(
        LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        ?bool $multi = null,
        ?string $selectEvent = null,
        ?string $confirmLabel = null,
    ): void {
        $logRefusedPrivilegedAttempt->authorize('viewAny', Media::class);

        if ($multi !== null) {
            $this->multi = $multi;
        }

        if ($selectEvent !== null) {
            $this->selectEvent = $selectEvent;
        }

        if ($confirmLabel !== null) {
            $this->confirmLabel = $confirmLabel;
        }
    }

    /**
     * The gallery's tile list (D6) -- a `#[Computed]` property over 0019's
     * `Media::search()` scope, matching `usersSummary()`/`roleOptions()` in
     * `App\Livewire\Users\Index` rather than a stored `$results` array
     * (there is no exclusion/over-fetch bookkeeping to preserve between
     * renders here, unlike 0022's own search component).
     *
     * Capped at 60, newest first (D6, confirmed by the coordinator): the
     * cap applies to the *rendered* grid only -- a staged id excluded by it
     * stays staged (D5), since `$selectedIds` is never derived from this
     * list.
     *
     * Each item carries D2's exact payload shape (id, title, description,
     * url, webpUrl, avifUrl, width, height) plus one extra UI-hint key,
     * `canEdit` (D12/D14) -- safe to add here because this method's return
     * value is never asserted for exact-shape equality the way
     * `confirmSelection()`'s dispatch payload is; only `toPayloadItem()`
     * needs to stay byte-for-byte D2.
     *
     * Phase 4 security audit finding F-1 (Medium): this component has no
     * route (D10/D12), so Livewire's `PersistentMiddleware` replays only
     * the HOST page's own middleware on every `/livewire/update` round
     * trip -- nothing re-checks `media.view` on this specific method
     * between requests. `toggleSelect()`/`confirmSelection()` are explicit
     * user actions, so they throw and get logged by
     * `LogRefusedPrivilegedAttempt`, matching every other screen in this
     * app; this method is instead reached from `render()`, where a throw
     * would take down the HOST page -- exactly the failure mode D12 exists
     * to prevent -- so it fails CLOSED (an empty array) rather than
     * throwing.
     *
     * @return array<int, array{id: string, title: string, description: string|null, url: string, webpUrl: string, avifUrl: string, width: int, height: int, canEdit: bool}>
     */
    #[Computed]
    public function tiles(): array
    {
        if (Gate::denies('viewAny', Media::class)) {
            return [];
        }

        return Media::query()
            ->search($this->search)
            ->latest()
            ->limit(60)
            ->get()
            ->map(fn (Media $media): array => [
                ...$this->toPayloadItem($media),
                'canEdit' => Gate::allows('update', $media),
            ])
            ->all();
    }

    /**
     * UI hint (D12/D14) for the upload button/dropzone's disabled+tooltip
     * branch -- `Gate::allows()`, never `Gate::authorize()`, since this
     * renders inside a list render rather than guarding a write; `upload()`
     * carries the real, logged gate.
     */
    #[Computed]
    public function canCreate(): bool
    {
        return Gate::allows('create', Media::class);
    }

    /**
     * Single replaces, multi accumulates/toggles (D4). Tiles stay visible
     * once selected -- the prototype keeps a selected tile in the grid with
     * a checkmark overlay rather than removing it from the list, and this
     * gallery has no scale pressure (10²-10³ rows, 0019 D7) forcing
     * exclusion the way 0022's over-fetch bookkeeping does.
     *
     * Phase 4 security audit finding F-1 (Medium): re-checks `media.view`
     * on every call, logged on refusal -- see the note on `tiles()` for why
     * this method throws where that one fails closed instead.
     */
    public function toggleSelect(string $id, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('viewAny', Media::class);

        if ($this->multi) {
            $this->selectedIds = in_array($id, $this->selectedIds, true)
                ? array_values(array_diff($this->selectedIds, [$id]))
                : [...$this->selectedIds, $id];
        } else {
            $this->selectedIds = [$id];
        }
    }

    /**
     * Dispatch the staged selection under the consumer-supplied event name
     * (D2), then reset the modal's own state.
     *
     * The payload is re-fetched from the database here -- never assembled
     * from anything `tiles()` rendered -- and re-ordered to match
     * `$selectedIds`'s own order; an id `whereIn()` does not vouch for
     * (tampered, or deleted between selection and confirm) is silently
     * dropped rather than erroring, exactly as D2 requires.
     *
     * Phase 4 security audit finding F-1 (Medium): re-checks `media.view`
     * on every call, logged on refusal -- see the note on `tiles()` for why
     * this method throws where that one fails closed instead.
     */
    public function confirmSelection(LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('viewAny', Media::class);

        $media = Media::query()->whereIn('id', $this->selectedIds)->get()->keyBy('id');

        $payload = collect($this->selectedIds)
            ->map(fn (string $id): ?Media => $media->get($id))
            ->filter()
            ->map(fn (Media $item): array => $this->toPayloadItem($item))
            ->values()
            ->all();

        $this->dispatch($this->selectEvent, media: $payload);

        $this->selectedIds = [];
        $this->search = '';
        $this->open = false;
    }

    /**
     * Discard the staged selection without dispatching anything (Gherkin:
     * "Cancelling the gallery discards the staged selection").
     */
    public function cancel(): void
    {
        $this->selectedIds = [];
        $this->search = '';
        $this->editingMediaId = null;
        $this->open = false;

        // Phase 4 re-audit finding F-B (Medium): a rejected/staged batch on
        // $pendingUploads was never cleared by cancel() either, so closing
        // the modal on a bad batch and reopening it did not recover the
        // upload surface -- only a full page reload did.
        $this->reset(['pendingUploads', 'title', 'description']);
    }

    /**
     * Open a tile's inline title/description editor (D10). Disclosure-
     * adjacent rather than a fresh disclosure -- the tile's current title/
     * description are already rendered on the card -- but gated anyway so
     * a user without `media.edit` cannot reach the edit form at all, not
     * merely see it rendered disabled (D12/D14).
     *
     * Phase 5 fix round finding F-8: this gates on `update` (`media.edit`),
     * a STRONGER ability than `toggleSelect()`'s `viewAny` (`media.view`)
     * just above -- deliberately, not an inconsistency to "fix" into a
     * matching pair. Per docs/security/livewire-authorization.md's rule
     * that a disclosure gate must ask a stronger ability than the write it
     * precedes (see "the shipped disclosure gates and why the disclosure
     * check is the stronger ability"), `update` is the correct ability
     * here because this method's real effect is opening a WRITE form, not
     * merely disclosing a value the tile already renders -- so a reviewer
     * should not "fix" this into a second `viewAny` check mirroring
     * `toggleSelect()`; that would only weaken the gate this method
     * actually needs.
     */
    public function startEditing(string $id, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $media = Media::query()->findOrFail($id);

        $logRefusedPrivilegedAttempt->authorize('update', $media);

        $this->editingMediaId = $media->id;
        $this->editTitle = $media->title;
        $this->editDescription = $media->description ?? '';
    }

    /**
     * Close a tile's inline editor without saving.
     */
    public function cancelEditing(): void
    {
        $this->editingMediaId = null;
    }

    /**
     * Persist an inline title/description edit (D10, Gherkin: "An inline
     * title and description edit persists").
     *
     * `Gate::authorize()`-equivalent here duplicates the identical check
     * `App\Actions\Media\UpdateMediaDetails` performs -- deliberate defence
     * in depth, matching `upload()`'s own doubled `create` check against
     * `StoreUploadedImage`: this is what fails fast before the action's own
     * validation runs, and what a direct caller of the action inherits
     * independently of this component.
     *
     * Phase 2 divergence #6: gates via `LogRefusedPrivilegedAttempt`
     * (story 0015b's recipe), matching `mount()`/`upload()` -- not a bare
     * `Gate::authorize()`.
     */
    public function updateMediaDetails(
        string $id,
        string $title,
        ?string $description,
        UpdateMediaDetails $updateMediaDetails,
        LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ): void {
        $media = Media::query()->findOrFail($id);

        $logRefusedPrivilegedAttempt->authorize('update', $media);

        $updateMediaDetails($media, $title, $description);

        $this->editingMediaId = null;
    }

    /**
     * Build one item in D2's exact payload shape -- reused, byte-for-byte
     * identical, by both `tiles()` (which layers one extra UI-hint key on
     * top) and `confirmSelection()` (which must not).
     *
     * @return array{id: string, title: string, description: string|null, url: string, webpUrl: string, avifUrl: string, width: int, height: int}
     */
    private function toPayloadItem(Media $media): array
    {
        $disk = Storage::disk('public');

        return [
            'id' => $media->id,
            'title' => $media->title,
            'description' => $media->description,
            'url' => $disk->url($media->path),
            'webpUrl' => $disk->url($media->webp_path),
            'avifUrl' => $disk->url($media->avif_path),
            'width' => $media->width,
            'height' => $media->height,
        ];
    }

    /**
     * Livewire's `updated<Property>()` lifecycle hook (SupportLifecycleHooks)
     * -- fired automatically once `$pendingUploads`'s temporary-upload round
     * trip finishes for the WHOLE batch, which is the real, only trigger
     * for a genuine browser upload: the view has no `wire:click="upload"`
     * anywhere, by design (D7's whole point is that the button and the
     * dropzone both just feed the same hidden `multiple` input, and
     * `wire:model="pendingUploads"` alone drives Livewire's upload pipeline
     * for every staged file at once). Found missing during story 0020's
     * own browser-test pass -- every Feature test called `->call('upload')`
     * directly, which exercises `upload()` correctly but never proves
     * anything invokes it.
     *
     * Renamed from `updatedPhoto()` (story 0020 Phase 5 fix round, D9) --
     * same trigger, now firing once per BATCH rather than once per file,
     * since a `multiple` input stages every selected/dropped file before
     * this hook runs, with the whole array already on `$pendingUploads`.
     *
     * Livewire calls lifecycle hooks with fixed, non-DI'd parameters
     * (`wrap($component)->__call($name, $params)`, not a container `call()`),
     * so `upload()`'s own action-owns-its-dependencies signature can't be
     * type-hinted here directly -- resolved from the container instead,
     * matching this project's documented `app()` exception for a
     * framework-invoked method whose parameter list is fixed by something
     * other than this class (docs/conventions/code-style.md).
     */
    public function updatedPendingUploads(): void
    {
        if ($this->pendingUploads === []) {
            return;
        }

        $this->upload(app(StoreUploadedImage::class), app(LogRefusedPrivilegedAttempt::class));
    }

    /**
     * Validate and store every file in the pending batch (D9) -- one
     * `App\Actions\Media\StoreUploadedImage` call per file, each protected
     * by that action's own D6 transaction.
     *
     * `Gate::authorize('create', ...)` here duplicates the identical check
     * `StoreUploadedImage` performs -- deliberate defence in depth, not
     * redundancy to remove: this is what fails fast before validation even
     * runs, and what a direct caller of the action (an Artisan command, a
     * future Products/Blog embed) inherits independently of this component
     * (docs/conventions/base-standards.md).
     *
     * Story 0019 Phase 4 finding F-1 (High), item 3: rate-limited, at the
     * component level. Livewire's own `throttle:60,1` on the *temporary*-
     * upload endpoint (config/livewire.php) only bounds how fast a file can
     * be staged there -- an already-validated temporary-upload token can
     * otherwise be replayed against this method (and therefore against
     * StoreUploadedImage's synchronous Imagick decode, D4) unboundedly.
     * 10/hour matches this project's existing scale for a comparable
     * backoffice write action (App\Actions\Users\RequestEmailChange's own
     * 10/hour aggregate ceiling). Thrown/surfaced as a validation-shaped
     * message (never a raw HTTP 429) to match the action-level throttle
     * idiom this project already uses: there is no route or HTTP middleware
     * layer behind this modal-only component (D10) to attach a `throttle:`
     * alias to.
     *
     * Story 0020 Phase 5 fix round, D9: the throttle is now consumed PER
     * FILE inside the loop below, not once per request -- a batch of up to
     * `self::MAX_FILES` files would otherwise let one throttled "attempt"
     * cover up to `self::MAX_FILES` synchronous Imagick decodes, silently
     * multiplying the effective hourly ceiling for a batch caller versus a
     * single-file one. Once the shared hourly window is exhausted mid-batch,
     * the loop stops (rather than continuing to fail an identical check
     * against every remaining file) and every file not yet processed in
     * this request is refused.
     *
     * Story 0019 Phase 4 re-audit finding N-4 (Low): the throttle consumes
     * an attempt only AFTER `$this->validate()` succeeds for the WHOLE
     * batch, not before -- a rejected batch (a wrong file type anywhere in
     * it, an oversized file, more than `self::MAX_FILES` files) never
     * reaches the loop at all, so it burns zero attempts. An empty
     * `$pendingUploads` (Phase 4 re-audit, informational) is not itself
     * "rejected": the `'array'` rule carries no `required`/`min:1`, so it
     * passes validation and the loop below simply does nothing -- harmless
     * given `updatedPendingUploads()` (this method's only real trigger)
     * already early-returns on an empty array before ever calling here.
     *
     * D9's mid-loop failure decision: "one file's failure rolls back only
     * that file and leaves its siblings committed, matching the prototype's
     * per-file completion" is read here as CONTINUE processing the
     * remaining files after one file's own store/convert step fails (an
     * `ImageException`-derived `ValidationException` from
     * `StoreUploadedImage`) -- never abort the whole batch on the first
     * such failure. `StoreUploadedImage`'s own D6 transaction already
     * guarantees a failed file leaves no partial row/file behind; this loop
     * is what guarantees that one file's failure does not also discard
     * files that already succeeded or files still to come. The one
     * exception is a THROTTLE refusal (above): once the shared window is
     * exhausted, every further attempt in the same request would fail
     * identically, so the loop stops rather than iterating pointlessly.
     * Any failure (throttle or per-file) is surfaced as one inline
     * `pendingUploads` error via `addError()` rather than a thrown
     * `ValidationException`, specifically so it does NOT unwind or hide the
     * already-committed successes from the same batch.
     *
     * D11 -- title per file, per file: for a batch of exactly one file,
     * `$this->title`/`$this->description` (this component's only
     * pre-upload form fields) are honoured as a FALLBACK, exactly as
     * before D9 -- an administrator who has already typed a title before
     * the upload commits keeps it, and an empty title falls back to the
     * file's own name. For a batch of MORE than one file there is no
     * sensible way to apply one shared text field's value to N
     * independently named files, so `$this->title`/`$this->description`
     * are ignored entirely and EVERY file in the batch derives its own
     * title from its own filename, with no description -- matching the
     * PRD's single-step "the tile is the form" flow, applied per tile.
     *
     * D10 -- single-vs-batch auto-open-edit: on a successful upload the new
     * tile's inline editor opens immediately (the same state
     * `startEditing()` produces for an existing tile) ONLY when the batch
     * held exactly one file and it succeeded. Auto-opening N simultaneous
     * inline edit forms for a multi-file batch is not a usable
     * interaction, so a batch of more than one file never auto-opens any
     * tile's editor -- the administrator can still open any tile's editor
     * manually via the pencil action (D10), unchanged.
     */
    public function upload(StoreUploadedImage $storeUploadedImage, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('create', Media::class);

        // Phase 4 re-audit finding F-A (Medium): the single-file title
        // fallback used to dereference $this->pendingUploads[0] BEFORE
        // validate() ran, so a crafted non-UploadedFile array element (e.g.
        // via a direct ->set('pendingUploads', [...]) on this unlocked,
        // client-writable property) threw an unhandled error instead of a
        // clean validation refusal. isSingleFileBatch/the title derivation
        // now read from $validated, after validate() has already confirmed
        // every element really is a valid UploadedFile.
        //
        // Phase 4 re-audit finding F-B (Medium): a rejected batch used to
        // stay on $this->pendingUploads (never reset on a thrown
        // ValidationException), and Livewire's WithFileUploads appends
        // rather than replaces for a `multiple` input -- so every
        // subsequent pick merged onto the stale rejected one, and the
        // upload surface stayed broken for the rest of the session. The
        // reset now runs on this catch too, not only after a successful
        // pass through the loop below.
        try {
            $validated = $this->validate([
                'pendingUploads' => ['array', 'max:'.self::MAX_FILES],
                'pendingUploads.*' => $this->imageUploadRules(),
            ], messages: [
                'pendingUploads.max' => __('media.gallery.too_many_files'),
            ], attributes: __('media.attributes'));
        } catch (ValidationException $e) {
            $this->reset(['pendingUploads', 'title', 'description']);

            throw $e;
        }

        /** @var array<int, UploadedFile> $files */
        $files = array_values($validated['pendingUploads']);
        $isSingleFileBatch = count($files) === 1;

        // D11's title/description rules (`mediaDetailsRules()`) only apply
        // to the single-file batch, which is the only case with a
        // pre-upload title/description field to validate at all (D9: a
        // multi-file batch ignores both and derives per-file, below). Kept
        // as its OWN validate() call rather than merged into the batch-shape
        // one above, because $isSingleFileBatch can only be known safely
        // after that first call has already confirmed every pendingUploads
        // element really is an UploadedFile (F-A).
        if ($isSingleFileBatch) {
            if ($this->title === '') {
                $this->title = pathinfo($files[0]->getClientOriginalName(), PATHINFO_FILENAME);
            }

            try {
                $this->validate($this->mediaDetailsRules(), attributes: __('media.attributes'));
            } catch (ValidationException $e) {
                $this->reset(['pendingUploads', 'title', 'description']);

                throw $e;
            }
        }

        $throttleKey = 'media-upload:'.(Auth::id() ?? 'unauthenticated');

        $storedCount = 0;
        $lastStored = null;
        $failureMessages = [];

        foreach ($files as $file) {
            if (! RateLimiter::attempt($throttleKey, maxAttempts: 10, callback: fn (): bool => true, decaySeconds: 3600)) {
                $failureMessages[] = trans('media.upload_throttled');

                break;
            }

            // `nullable` does not rewrite '' to null (the same note
            // SalesRegionValidationRules::rateRules() carries) -- convert
            // explicitly so an omitted description is stored as NULL,
            // matching the column's own "optional" semantics.
            if ($isSingleFileBatch) {
                $title = $this->title;
                $description = $this->description !== '' ? $this->description : null;
            } else {
                // Phase 4 re-audit finding F-C (Low): a filename that
                // derives to an empty title (e.g. a file literally named
                // `.png`) used to reach the database with `title === ''`,
                // which `mediaDetailsRules()`'s `required` rule would
                // refuse if it were applied here -- guarantee a non-empty
                // fallback instead of validating N synthetic titles.
                $derivedTitle = Str::limit(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME), 255, '');
                $title = $derivedTitle !== '' ? $derivedTitle : __('media.gallery.untitled_fallback');
                $description = null;
            }

            try {
                $lastStored = $storeUploadedImage($file, $title, $description);
                $storedCount++;
            } catch (ValidationException $e) {
                $failureMessages[] = collect($e->errors())->flatten()->first() ?? trans('media.upload_rejected');
            }
        }

        $this->reset(['pendingUploads', 'title', 'description']);

        // Phase 4 re-audit finding F-D (Low): only the FIRST failure
        // message used to be rendered, so a throttle stop mid-batch was
        // silently masked behind an unrelated per-file message -- the
        // actor could not tell "one bad file" from "you lost most of your
        // batch to the rate limit". The throttle message takes precedence
        // when present (it describes state that outlives this request);
        // otherwise every distinct per-file message is shown.
        if ($failureMessages !== []) {
            $throttleMessage = trans('media.upload_throttled');
            $message = in_array($throttleMessage, $failureMessages, true)
                ? $throttleMessage
                : implode(' ', array_unique($failureMessages));

            $this->addError('pendingUploads', $message);
        }

        if ($isSingleFileBatch && $storedCount === 1 && $lastStored !== null) {
            $this->editingMediaId = $lastStored->id;
            $this->editTitle = $lastStored->title;
            $this->editDescription = $lastStored->description ?? '';
        }
    }
}
