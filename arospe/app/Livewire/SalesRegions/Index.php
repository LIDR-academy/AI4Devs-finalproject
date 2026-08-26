<?php

namespace App\Livewire\SalesRegions;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\SalesRegions\SetDefaultSalesRegion;
use App\Actions\SalesRegions\SetSalesRegionActive;
use App\Actions\SalesRegions\UpdateSalesRegion;
use App\Concerns\SalesRegionValidationRules;
use App\Enums\SalesRegionKind;
use App\Models\SalesRegion;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Title;
use Livewire\Component;

/**
 * Backoffice Sales Regions (tax configuration) screen: configure a seeded
 * entry's rate/description/code, enable or disable it, and move the
 * single-default flag between entries -- story 0017.
 *
 * This is the component class only; the paired markup ships in sibling
 * story 0018, the same split story 0004 (App\Livewire\Users\Index) used
 * with story 0006. Access is gated on `sales-regions.view` (route
 * middleware, `mount()`), with `sales-regions.edit` re-checked as the first
 * statement of every mutating/disclosing method, since Livewire 4's
 * `PersistentMiddleware` allowlist does not carry Spatie's `permission:`
 * middleware -- see docs/architecture/authorization.md. Every refusal is
 * logged via App\Actions\Auth\LogRefusedPrivilegedAttempt, the "third admin
 * screen" this app's copyable refusal-logging recipe describes.
 *
 * The catalog is fixed and seeded (story 0016): there is no create path and
 * no delete path here, by design.
 */
#[Title('Sales Regions')]
class Index extends Component
{
    use SalesRegionValidationRules;

    /**
     * @var array<int, array{id: string, slug: string, code: string|null, name: string,
     *     description: string|null, rate: string|null, kind: SalesRegionKind, parentId: string|null,
     *     isDefault: bool, isActive: bool, sortOrder: int, canEdit: bool}>
     */
    #[Locked]
    public array $regions = [];

    #[Locked]
    public ?string $editingRegionId = null;

    public bool $showModal = false;

    /**
     * Never null -- see the errors-log entry on a null-valued property
     * desyncing a native form control. An empty string is "not configured"
     * for code/description/rate, and matches the placeholder value.
     */
    public string $code = '';

    public string $description = '';

    /**
     * '' == unconfigured; converted to a real null (or a real value) before
     * being handed to UpdateSalesRegion -- validate() alone never rewrites
     * an empty submission to null (D6).
     */
    public string $rate = '';

    /**
     * Matches is_active's own column default.
     */
    public bool $active = false;

    /**
     * '' == no replacement chosen. Doubles as the error-bag key both
     * SetDefaultSalesRegion's and SetSalesRegionActive's ValidationException
     * throw against (D4) -- it must stay a real declared public property or
     * Livewire's dehydrate() silently drops the error on the next
     * round-trip.
     */
    public string $replacementDefaultId = '';

    /**
     * Mount the component.
     *
     * `viewAny` is authorized here in addition to the route's `can:`
     * middleware because Livewire's `/livewire/update` endpoint is a
     * separate entry point that never runs route middleware -- mounting the
     * component directly (as every `Livewire::test()` call does) must be
     * denied on its own.
     *
     * Deliberately left unlogged, mirroring Users\Index::mount() /
     * Roles\Index::mount(): the route's own `can:sales-regions.view` gate
     * checks the identical ability, and `can:` -- unlike `permission:` -- IS
     * on Livewire's `PersistentMiddleware` allow-list, so a real HTTP actor
     * who would fail this check is refused by the route before ever
     * reaching `mount()`. A refusal here is therefore unreachable over HTTP;
     * logging it would only ever fire from a `Livewire::test()` call that
     * mounts the component directly. Do not "fix" this into a logged call.
     */
    public function mount(): void
    {
        Gate::authorize('viewAny', SalesRegion::class);

        $this->loadRegions();
    }

    /**
     * Open the edit form prefilled with the target entry's current values.
     *
     * A disclosure path, not only a mutation, so it authorizes
     * independently of save() -- per docs/security/livewire-authorization.md,
     * every method that mutates *or discloses* re-authorizes as its first
     * statement.
     */
    public function openEditModal(string $regionId, LogRefusedPrivilegedAttempt $log): void
    {
        $target = SalesRegion::findOrFail($regionId);

        $log->authorize('update', $target, targetType: 'sales_region', targetId: $target->id);

        $this->editingRegionId = $target->id;
        $this->code = $target->code ?? '';
        $this->description = $target->description ?? '';
        $this->rate = $target->rate ?? '';
        $this->active = $target->is_active;
        $this->replacementDefaultId = '';
        $this->showModal = true;
    }

    /**
     * Validate and persist the edit form: rate/description/code (via
     * UpdateSalesRegion) and the active/default state (via
     * SetSalesRegionActive) -- two entry points to one rule, the same
     * SetSalesRegionActive setActive() delegates to below, so 0018 may
     * render an inline row switch, a modal field, or both, without the
     * single-default invariant existing in two places.
     *
     * Authorization is the first statement -- BOTH rows it can write,
     * including the replacement default, per Phase 4 RE-audit finding R-4:
     * the replacement's authorize() call used to run after UpdateSalesRegion
     * had already written the rate/description/code, so an actor lacking
     * update rights on the replacement row (should a future target-dependent
     * rule ever grant SalesRegionPolicy::update() one -- see its own
     * docblock) would still get that first write committed before being
     * refused. Both authorize() calls now run before either action is
     * called. This does NOT change the accepted, Users-screen-consistent
     * two-transaction shape below -- see the Phase 1 reconciliation section
     * of this story's task file for why a mid-submit VALIDATION refusal
     * (D3/D10) is still allowed to leave the rate/description/code half
     * committed; only the AUTHORIZATION ordering moved.
     *
     * The rate is normalised (a Spanish-locale decimal comma to a dot, D12)
     * immediately afterwards and before validate() runs -- normalising only
     * inside the action would let the validation rule see the un-normalised
     * value and reject it.
     */
    public function save(UpdateSalesRegion $updateSalesRegion, SetSalesRegionActive $setSalesRegionActive, LogRefusedPrivilegedAttempt $log): void
    {
        $target = SalesRegion::findOrFail((string) $this->editingRegionId);

        $log->authorize('update', $target, targetType: 'sales_region', targetId: $target->id);

        $this->rate = trim(str_replace(',', '.', $this->rate));

        $validated = $this->validate([
            'code' => $this->codeRules(),
            'description' => $this->descriptionRules(),
            'rate' => $this->rateRules(),
            'replacementDefaultId' => $this->replacementDefaultRules(),
        ], attributes: __('sales-regions.attributes'));

        // Narrowed from $validated's mixed values at the point of use, the
        // same convention Users\Index::save() follows for its own
        // $validated reads -- SalesRegion::find() widens to
        // SalesRegion|Collection|null for a non-string key, which is what
        // Larastan (finding F-1, Phase 5 code review) flagged: this repo's
        // one PHPStan-level-7 gate had never actually run against this
        // story until that review.
        $code = $validated['code'] === '' ? null : (string) $validated['code'];
        $description = $validated['description'] === '' ? null : (string) $validated['description'];
        $rate = $validated['rate'] === '' ? null : (string) $validated['rate'];
        $replacementDefaultId = $validated['replacementDefaultId'] === '' ? null : (string) $validated['replacementDefaultId'];

        $replacementDefault = $replacementDefaultId !== null
            ? SalesRegion::find($replacementDefaultId)
            : null;

        if ($replacementDefault !== null) {
            $log->authorize('update', $replacementDefault, targetType: 'sales_region', targetId: $replacementDefault->id);
        }

        $updateSalesRegion($target, $code, $description, $rate);

        $setSalesRegionActive($target, $this->active, $replacementDefault);

        // Phase 5 code review finding F-5: this success line, setDefault()'s
        // and setActive()'s used to be byte-identical, so an operator
        // reading the audit trail could not tell a rate edit from a default
        // move from a deactivation apart -- the one distinction worth
        // having on an otherwise identical shape. Three distinct messages,
        // matching Roles\Index's 'Role saved' / 'Role deleted' and
        // Users\Index's 'User created' / 'User updated' / 'User deleted'
        // precedent. This is the component's own audit trail for "an
        // administrator changed this row", not a rule the action itself
        // enforces -- authorization.md's generic-key rule binds the
        // REFUSAL line only, and is unaffected by this.
        Log::info('Sales region updated', [
            'actor_id' => Auth::id(),
            'sales_region_id' => $target->id,
        ]);

        $this->loadRegions();
        $this->closeModal();
    }

    /**
     * Close the edit modal and reset its form fields.
     */
    public function closeModal(): void
    {
        $this->showModal = false;
        $this->reset(['editingRegionId', 'code', 'description', 'rate', 'active', 'replacementDefaultId']);
    }

    /**
     * Flag the given entry as the catalog default -- the single-default
     * invariant, enforced by App\Actions\SalesRegions\SetDefaultSalesRegion.
     *
     * Authorization is the first statement. An inactive target (D10) is
     * refused inside the action itself, not only by the form rule, so every
     * call site inherits the guard.
     */
    public function setDefault(string $regionId, SetDefaultSalesRegion $setDefaultSalesRegion, LogRefusedPrivilegedAttempt $log): void
    {
        $target = SalesRegion::findOrFail($regionId);

        $log->authorize('update', $target, targetType: 'sales_region', targetId: $target->id);

        $setDefaultSalesRegion($target);

        Log::info('Sales region default changed', [
            'actor_id' => Auth::id(),
            'sales_region_id' => $target->id,
        ]);

        $this->loadRegions();
    }

    /**
     * Enable or disable the given entry, atomically promoting a named
     * replacement default when deactivating the current default (D3) --
     * enforced by App\Actions\SalesRegions\SetSalesRegionActive.
     *
     * $replacementDefaultId carries no default value: a defaulted parameter
     * cannot precede the trailing container-resolved dependencies. Every
     * caller (0018's Blade markup, every test) must pass all arguments
     * explicitly, an empty string when no replacement is named.
     *
     * Authorizes both rows it can write -- its own target, and (when a
     * replacement id resolves to a real, existing row) the replacement too,
     * since promoting it is this method's effect too, not only
     * SetSalesRegionActive's own internal delegation. A non-existent or
     * malformed replacement id resolves to null here (SalesRegion::find(),
     * never findOrFail() -- a malformed id must fail as a clean validation
     * refusal inside the action, not as an uncaught ModelNotFoundException),
     * which SetSalesRegionActive then treats identically to "no replacement
     * named".
     */
    public function setActive(string $regionId, bool $active, string $replacementDefaultId, SetSalesRegionActive $setSalesRegionActive, LogRefusedPrivilegedAttempt $log): void
    {
        $target = SalesRegion::findOrFail($regionId);

        $log->authorize('update', $target, targetType: 'sales_region', targetId: $target->id);

        $replacementDefault = $replacementDefaultId !== '' ? SalesRegion::find($replacementDefaultId) : null;

        if ($replacementDefault !== null) {
            $log->authorize('update', $replacementDefault, targetType: 'sales_region', targetId: $replacementDefault->id);
        }

        $setSalesRegionActive($target, $active, $replacementDefault);

        Log::info('Sales region active state changed', [
            'actor_id' => Auth::id(),
            'sales_region_id' => $target->id,
            'active' => $active,
        ]);

        $this->loadRegions();
    }

    /**
     * Active regions except the one being edited -- D10 means an inactive
     * entry is never offerable as a replacement, so this is "active, not
     * self", not "all, not self".
     *
     * @return array<int, array{id: string, name: string}>
     */
    #[Computed]
    public function replacementCandidates(): array
    {
        return SalesRegion::query()
            ->where('is_active', true)
            ->when($this->editingRegionId !== null, fn ($query) => $query->whereKeyNot($this->editingRegionId))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (SalesRegion $region): array => ['id' => $region->id, 'name' => $region->name])
            ->all();
    }

    /**
     * Reload the Sales Regions list from the database.
     *
     * `canEdit` is a UI hint layered on top of the mandatory per-method
     * checks above, never a replacement for them -- `Gate::allows('update',
     * $region)`, never `Gate::authorize()`, which would throw while
     * rendering a list. There is no `canDelete`: no delete affordance
     * exists in this domain (D8).
     */
    private function loadRegions(): void
    {
        $this->regions = SalesRegion::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (SalesRegion $region): array => [
                'id' => $region->id,
                'slug' => $region->slug,
                'code' => $region->code,
                'name' => $region->name,
                'description' => $region->description,
                'rate' => $region->rate,
                'kind' => $region->kind,
                'parentId' => $region->parent_id,
                'isDefault' => $region->is_default,
                'isActive' => $region->is_active,
                'sortOrder' => $region->sort_order,
                'canEdit' => Gate::allows('update', $region),
            ])
            ->all();
    }
}
