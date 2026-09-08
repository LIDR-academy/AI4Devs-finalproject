<?php

namespace App\Livewire\Shipping;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\NormalizeForSearch;
use App\Actions\Shipping\CreateShippingZone;
use App\Actions\Shipping\DeleteShippingZone;
use App\Actions\Shipping\RenameShippingZone;
use App\Actions\Shipping\SearchGeographyEntries;
use App\Actions\Shipping\SyncShippingZoneGeography;
use App\Concerns\ShippingZoneValidationRules;
use App\Enums\GeographyLevel;
use App\Exceptions\UnresolvedSelectionException;
use App\Models\GeographyEntry;
use App\Models\ShippingZone;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Title;
use Livewire\Component;

/**
 * Backoffice Shipping zones screen: list, create, rename, delete, and (in
 * the edit modal) assign geography-catalog coverage at any level.
 *
 * Story 0034. `ShippingZonePolicy` (story 0033) gains its first real call
 * site here -- every action already self-authorizes (0033 Phase 4 finding
 * F-1), so every gate call in this class is a SECOND layer, matching this
 * project's "the component authorizing too is defence in depth, not
 * duplication" convention (see docs/conventions/base-standards.md).
 *
 * D-5: row actions gate on SCREEN-LEVEL capability flags (`canCreate()`
 * `canEdit()` `canDelete()`), never per-row `Gate::allows()` -- unlike
 * UserPolicy, ShippingZonePolicy carries no per-target rule at all (its
 * `update()`/`delete()` ignore `$target` entirely), so a screen-level flag
 * says exactly as much as N per-row checks and costs one evaluation instead
 * of N.
 */
#[Title('Shipping zones')]
class Zones extends Component
{
    use ShippingZoneValidationRules;

    /** @var array<int, array{id: string, name: string, entriesCount: int}> */
    #[Locked]
    public array $zones = [];

    /**
     * Server-authoritative -- set only from a resolved model's own `id`,
     * never the raw method argument, and re-read from the database again in
     * save() (never trusted from this property alone). This is what keeps
     * `shippingZoneNameRules()`'s `->ignore()` (via `Rule::unique()`-shaped
     * closure) from being pointed at another zone's row by a tampered
     * `/livewire/update` payload.
     */
    #[Locked]
    public ?string $editingZoneId = null;

    public bool $showModal = false;

    public string $name = '';

    /**
     * The picker's wire:model target. Bare ids only, never labels, never
     * null (0022 D4/D8). Deliberately NOT #[Locked]: it is the
     * #[Modelable] binding surface a plain `wire:model` writes through, and
     * locking it would break that binding. Its safety comes from
     * server-side validation -- `geographyEntryIdsRules()` bounds and
     * existence-checks it, and `SearchGeographyEntries::resolveSelected()`
     * REJECTS the whole save when any id cannot be resolved (D-12), never
     * filtering it out and saving around it.
     *
     * @var array<int, string>
     */
    public array $geographyEntryIds = [];

    public bool $showDeleteModal = false;

    #[Locked]
    public ?string $deletingZoneId = null;

    #[Locked]
    public string $deletingZoneName = '';

    /**
     * `viewAny` is authorized here in addition to the route's `can:`
     * middleware because Livewire's `/livewire/update` endpoint never runs
     * route middleware -- mounting the component directly (as every
     * `Livewire::test()` call does) must be denied on its own. Unlogged,
     * matching `App\Livewire\Users\Index::mount()`'s own reasoning: the
     * route's `can:shipping.view` gate checks the identical ability, and
     * `can:` IS on Livewire's `PersistentMiddleware` allow-list, so a real
     * HTTP actor who would fail this is refused by the route before ever
     * reaching here -- a refusal here is unreachable over HTTP.
     */
    public function mount(): void
    {
        Gate::authorize('viewAny', ShippingZone::class);

        $this->loadZones();
    }

    /**
     * Phase 4 security-audit finding F-1: bounds $geographyEntryIds at the mutation point, not
     * only inside save()'s own validate() call. coverageSummary() below reads this property on
     * EVERY render of the open edit modal, with no validate() upstream -- an unbounded client
     * payload (via the picker's #[Modelable] binding) would otherwise size a real SQL statement
     * proportional to attacker-chosen array length. Same MAX_GEOGRAPHY_ENTRIES constant as the
     * save-path rule (ShippingZoneValidationRules::geographyEntryIdsRules()), so the render bound
     * and the save bound cannot drift apart -- mirrors
     * App\Livewire\Components\SearchableMultiSelect::updatedSelected()'s identical shape for the
     * identical reason (Phase 4 finding R-1 there).
     */
    public function updatedGeographyEntryIds(): void
    {
        $this->geographyEntryIds = array_slice($this->geographyEntryIds, 0, self::MAX_GEOGRAPHY_ENTRIES);
    }

    /**
     * Open the create-zone form. D-2: name only -- geography is assigned in
     * the edit modal, once the zone exists.
     *
     * Phase 5 code-review finding H-1: resetValidation() as the last
     * statement, matching App\Livewire\ProductCategories\Index and
     * App\Livewire\Products\AttributeTypes\Index's own openers -- without
     * it, a stale `name`/`geographyEntryIds` error from a previously
     * refused save on a DIFFERENT zone (Livewire persists the error bag
     * across the round trip via SupportValidation::dehydrate()/hydrate())
     * renders against this freshly emptied form.
     */
    public function openCreateModal(LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('create', ShippingZone::class, targetType: 'shipping_zone');

        $this->reset(['editingZoneId', 'name', 'geographyEntryIds']);
        $this->resetValidation();
        $this->showModal = true;
    }

    /**
     * Open the edit form prefilled with the target zone's current name and
     * geography coverage.
     *
     * Phase 5 code-review finding H-1: resetValidation() as the last
     * statement, for the identical reason openCreateModal() now carries it
     * -- a stale error from a previously refused save on a DIFFERENT zone
     * must not render against this one's freshly loaded values.
     */
    public function openEditModal(string $zoneId, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $target = ShippingZone::findOrFail($zoneId);

        $logRefusedPrivilegedAttempt->authorize(
            'update',
            $target,
            targetType: 'shipping_zone',
            targetId: $target->id,
        );

        $this->editingZoneId = $target->id;
        $this->name = $target->name;
        $this->geographyEntryIds = $target->geographyEntries()
            ->pluck('id')
            ->map(strval(...))
            ->all();
        $this->resetValidation();
        $this->showModal = true;
    }

    /**
     * Validate and persist the create/edit form.
     *
     * D-7's ordering: authorize -> trim the name -> validate the name rules
     * -> validate geographyEntryIds' shape/bound/existence (one query, per
     * ShippingZoneValidationRules::geographyEntryIdsRules()'s own deliberate
     * single-closure shape) -> D-12's total-function re-check via
     * SearchGeographyEntries::resolveSelected() -> only THEN invoke
     * RenameShippingZone/CreateShippingZone followed by
     * SyncShippingZoneGeography. Every check that can fail on ordinary
     * input runs before either action is invoked, so a rejected save never
     * partially applies -- neither the rename nor the coverage replace ever
     * run alone.
     *
     * Phase 5 code-review finding M-1: deliberately NO component-level
     * DB::transaction() wrapping the two action calls -- an earlier draft
     * added one and mis-cited D-7 as its source. D-7 explicitly considered
     * and REJECTED that wrapper: "0033 chose the action as the unit of
     * atomicity, and a component that quietly widens that boundary makes
     * the actions' own guarantees untrue for one caller and not the
     * others." The residual window this leaves is the one D-7 names and
     * accepts: a concurrent name collision surfacing between the rename
     * and the sync leaves the rename applied and the coverage unchanged --
     * recoverable and visible (the modal reopens with the error), which
     * D-7 calls "the right failure."
     */
    public function save(
        CreateShippingZone $create,
        RenameShippingZone $rename,
        SyncShippingZoneGeography $sync,
        SearchGeographyEntries $searchGeographyEntries,
        NormalizeForSearch $normalizeForSearch,
        LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ): void {
        $target = $this->editingZoneId === null ? null : ShippingZone::findOrFail($this->editingZoneId);

        $logRefusedPrivilegedAttempt->authorize(
            $target === null ? 'create' : 'update',
            $target ?? ShippingZone::class,
            targetType: 'shipping_zone',
            targetId: $target?->id,
        );

        // Trimmed BEFORE validation, matching CreateShippingZone/RenameShippingZone's own
        // trim() -- Laravel's `required` treats a string of spaces as present.
        $this->name = trim($this->name);

        // Phase 4 audit non-finding note: $target->id (the re-read, server-authoritative row),
        // never $this->editingZoneId directly -- equivalent today since the findOrFail() above
        // already succeeded against that exact value, but this makes the "never trust the
        // locked property alone" invariant self-evident at the call site rather than implicit.
        $this->validate([
            'name' => $this->shippingZoneNameRules($normalizeForSearch, $target?->id),
        ]);

        Validator::make(
            ['geographyEntryIds' => $this->geographyEntryIds],
            ['geographyEntryIds' => $this->geographyEntryIdsRules()],
        )->validate();

        // D-12: a total function -- rejects the WHOLE save the moment any submitted id cannot
        // be vouched for, never silently reduced to the resolvable subset.
        try {
            $searchGeographyEntries->resolveSelected($this->geographyEntryIds);
        } catch (UnresolvedSelectionException) {
            throw ValidationException::withMessages([
                'geographyEntryIds' => __('shipping.zones.editor.geography_unresolvable'),
            ]);
        }

        $zone = $target === null
            ? $create($this->name)
            : $rename($target, $this->name);

        // D-2: the CREATE branch never syncs -- the create modal renders no geography
        // picker at all, and this is a security boundary, not only a UI choice: a
        // create-then-sync path would need `create` to authorize what is semantically
        // an `update` operation. A tampered `geographyEntryIds` on the create path is
        // therefore validated above (harmless) but never reaches the pivot. Passing an
        // empty array on the edit branch is legal (0033 D-5) and clears coverage.
        if ($target !== null) {
            $sync($zone, $this->geographyEntryIds);
        }

        $this->loadZones();
        $this->closeModal();
    }

    /**
     * Close the create/edit modal and reset its form fields.
     *
     * Phase 5 code-review finding H-1: resetValidation() here too, since
     * this is also reached by dismissing the modal directly (the X control
     * or a click outside, via `@close="closeModal"`) rather than only
     * through a fresh save -- the same stale-error risk openCreateModal()/
     * openEditModal() now guard against on the OPENING side.
     */
    public function closeModal(): void
    {
        $this->showModal = false;
        $this->reset(['editingZoneId', 'name', 'geographyEntryIds']);
        $this->resetValidation();
    }

    /**
     * Open the delete-confirmation modal for the target zone.
     */
    public function confirmDelete(string $zoneId, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $target = ShippingZone::findOrFail($zoneId);

        $logRefusedPrivilegedAttempt->authorize(
            'delete',
            $target,
            targetType: 'shipping_zone',
            targetId: $target->id,
        );

        $this->deletingZoneId = $target->id;
        $this->deletingZoneName = $target->name;
        $this->showDeleteModal = true;
    }

    /**
     * Delete the confirmed zone.
     *
     * D-6: any `ValidationException` `DeleteShippingZone` raises (today:
     * none -- the in-use-by-a-rate-rule guard is story 0036's, not yet
     * implementable since `shipping_rates` does not exist) is left to
     * surface into this component's error bag and render inside the
     * still-open delete modal, message-agnostic -- this screen adds no
     * `zones.delete_blocked` key of its own.
     *
     * Phase 4 security-audit finding F-3: re-authorizes here too, even
     * though `DeleteShippingZone` already self-authorizes (0033 Phase 4
     * finding F-1) and `confirmDelete()` already gated the same ability
     * before this modal ever opened -- every other mutating/disclosing
     * method on this class carries its own component-level gate, and this
     * was the one exception, unpinned by any test.
     */
    public function deleteZone(DeleteShippingZone $delete, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        if ($this->deletingZoneId === null) {
            return;
        }

        $target = ShippingZone::findOrFail($this->deletingZoneId);

        $logRefusedPrivilegedAttempt->authorize(
            'delete',
            $target,
            targetType: 'shipping_zone',
            targetId: $target->id,
        );

        $delete($target);

        $this->loadZones();
        $this->closeDeleteModal();
    }

    /**
     * Close the delete-confirmation modal and reset its state.
     *
     * Phase 5 code-review finding H-1: resetErrorBag('shippingZoneId') so
     * a future in-use refusal (story 0036) does not leak into the next
     * zone's delete-confirmation modal -- matching
     * App\Livewire\ProductCategories\Index::closeDeleteModal()'s identical
     * resetErrorBag('productCategoryId') call.
     */
    public function closeDeleteModal(): void
    {
        $this->showDeleteModal = false;
        $this->reset(['deletingZoneId', 'deletingZoneName']);
        $this->resetErrorBag('shippingZoneId');
    }

    /**
     * D-8: one query, no N+1 -- the list column shows a single coverage
     * total per zone, ordered by name.
     */
    private function loadZones(): void
    {
        $this->zones = ShippingZone::query()
            ->withCount('geographyEntries')
            ->orderBy('name')
            ->get()
            ->map(fn (ShippingZone $zone): array => [
                'id' => $zone->id,
                'name' => $zone->name,
                'entriesCount' => $zone->geography_entries_count,
            ])
            ->all();
    }

    /**
     * D-5: screen-level, evaluated once per render. `ShippingZonePolicy`
     * carries no per-target rule -- an unsaved instance is a correct,
     * query-free target for `update`/`delete` since neither method reads it.
     */
    #[Computed]
    public function canCreate(): bool
    {
        return Gate::allows('create', ShippingZone::class);
    }

    #[Computed]
    public function canEdit(): bool
    {
        return Gate::allows('update', new ShippingZone);
    }

    #[Computed]
    public function canDelete(): bool
    {
        return Gate::allows('delete', new ShippingZone);
    }

    /**
     * D-3: a read-only, per-level breakdown of the CURRENT selection --
     * `País 1 · Comunidad autónoma 2 · Municipio 147`, plus the total. No
     * remove control; it is information, not a second idiom over the same
     * selection (which is what the bounded, scrollable chip area already
     * is).
     *
     * Phase 5 code-review finding L-7 (accepted, not fixed): `total` is the
     * raw count of $geographyEntryIds -- "how many the picker shows as
     * selected" -- while `byLevel` sums only ids that are integer-shaped
     * and in range (F-1's filter). The two can disagree only for a
     * malformed/tampered id, which D-12 already rejects outright at save
     * time; deriving `total` from the same filtered set would hide that
     * exact discrepancy instead of leaving it visible.
     *
     * @return array{total: int, byLevel: array<int, array{label: string, count: int}>}
     */
    #[Computed]
    public function coverageSummary(): array
    {
        if ($this->geographyEntryIds === []) {
            return ['total' => 0, 'byLevel' => []];
        }

        // Phase 4 security-audit finding F-1: a non-integer-shaped or out-of-PHP_INT_MAX id
        // reaching whereKey() (whereIntegerInRaw() under the hood) triggers a `(int)` cast
        // E_WARNING this app's error handler turns into a 500 -- the identical hazard
        // ShippingZoneValidationRules::geographyEntryIdsRules()'s own isWithinPhpIntRange()
        // guard already closes on the save path. Reused here (a trait's private method is a
        // private method of the composing class) rather than re-derived, so the two checks
        // cannot drift apart.
        $ids = array_values(array_filter(
            $this->geographyEntryIds,
            fn (string $id): bool => $id !== '' && ctype_digit($id) && self::isWithinPhpIntRange($id),
        ));

        if ($ids === []) {
            return ['total' => count($this->geographyEntryIds), 'byLevel' => []];
        }

        $counts = GeographyEntry::query()
            ->whereKey($ids)
            ->selectRaw('level, COUNT(*) as aggregate')
            ->groupBy('level')
            ->pluck('aggregate', 'level');

        $byLevel = [];

        foreach (GeographyLevel::cases() as $level) {
            $count = (int) ($counts[$level->value] ?? 0);

            if ($count > 0) {
                $byLevel[] = ['label' => $level->label(), 'count' => $count];
            }
        }

        return [
            'total' => count($this->geographyEntryIds),
            'byLevel' => $byLevel,
        ];
    }
}
