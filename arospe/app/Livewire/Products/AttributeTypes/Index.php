<?php

namespace App\Livewire\Products\AttributeTypes;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\Products\CreateProductAttributeType;
use App\Actions\Products\DeleteProductAttributeType;
use App\Actions\Products\UpdateProductAttributeType;
use App\Concerns\ProductAttributeValidationRules;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Title;
use Livewire\Component;

/**
 * Product attribute types management screen: list, create/edit modal with
 * an inline value-list editor, and delete (story 0028). This is the first
 * and only call site of ProductAttributeTypePolicy and the three
 * App\Actions\Products\{Create,Update,Delete}ProductAttributeType actions.
 *
 * Access is gated on `products.view` (route middleware, `mount()`), with
 * per-action checks for `products.create` / `products.edit` /
 * `products.delete` re-checked inside every mutating AND disclosing
 * method, since Livewire 4's `PersistentMiddleware` allow-list does not
 * carry Spatie's `permission:` middleware -- see
 * docs/architecture/authorization.md. Every gate here is defence in depth
 * on top of the identical gate each of the three actions performs as its
 * own first statement (D6).
 *
 * This story ships a minimal placeholder view only (Q6) -- the UI sibling
 * story owns the real markup.
 */
#[Title('Product attribute types')]
class Index extends Component
{
    use ProductAttributeValidationRules;

    /**
     * The rendered type list. Entirely server-derived (loadTypes() is its only
     * writer) and therefore #[Locked], per
     * docs/security/livewire-authorization.md's "every server-derived property
     * is #[Locked]" rule -- the stronger side of that rule rather than
     * ProductCategories\Index::$productCategories' documented unlocked
     * exception, since nothing here needs to be client-writable and locking
     * costs nothing. It carries per-row canEdit/canDelete UI hints, which must
     * never become forgeable even though no method reads them for a decision.
     *
     * @var array<int, array{id: string, name: string, valueCount: int, valuePreview: string, canEdit: bool, canDelete: bool}>
     */
    #[Locked]
    public array $types = [];

    /**
     * null => create mode. Written only from $target->id, never the raw
     * method argument -- this is what makes the id fed to
     * attributeTypeNameRules()'s ->ignore() server-authoritative rather
     * than client-controlled.
     */
    #[Locked]
    public ?string $editingTypeId = null;

    public bool $showModal = false;

    /**
     * Never null -- bound to a text input; see docs/errors-log.md.
     */
    public string $name = '';

    /**
     * The editable value rows. Deliberately NOT #[Locked] -- this is the
     * form's own input, so every `id` in it is client-writable and MUST be
     * re-scoped against a fresh DB read in save() (via
     * SyncProductAttributeValues, D4 step 2). `key` exists only so the
     * view can give each row a stable wire:key that survives a removal --
     * removeValue() targets a row by this key, never by array index, which
     * is the standard Livewire index-keyed-row foot-gun this design avoids
     * entirely.
     *
     * @var array<int, array{id: string|null, key: string, value: string}>
     */
    public array $values = [];

    public bool $showDeleteModal = false;

    #[Locked]
    public ?string $deletingTypeId = null;

    #[Locked]
    public string $deletingTypeName = '';

    /**
     * Populated by confirmDelete() from ProductAttributeType::
     * variantUsageCount() (story 0029a, D-A6) -- the same query
     * App\Actions\Products\DeleteProductAttributeType's own in-use guard
     * consumes, so this property and the guard's refusal message can never
     * disagree about the count.
     */
    #[Locked]
    public int $deletingTypeUsageCount = 0;

    /**
     * How many product variants each currently-loaded value row backs,
     * keyed by value id (story 0030a). Populated once by openEditModal()
     * via ProductAttributeValue::variantUsageCounts() -- one bulk query,
     * never one query per row. Deliberately a SEPARATE #[Locked] property
     * rather than a key inside $values: $values is this component's one
     * deliberately client-writable, un-#[Locked] property (see its own
     * docblock), and putting a server-derived count there would have
     * contradicted the "every server-derived property is #[Locked]" rule
     * this class already follows for $types, and forced the view's
     * existing @continue guard to also check a new key.
     *
     * @var array<string, int>
     */
    #[Locked]
    public array $valueUsageCounts = [];

    /**
     * Mount the component.
     *
     * Deliberately left unlogged, matching every other module screen's
     * identical mount() precedent: the route's own `can:products.view`
     * gate checks the identical ability, and `can:` -- unlike `permission:`
     * -- IS on Livewire's PersistentMiddleware allow-list, so a real HTTP
     * actor who would fail this check is refused by the route before ever
     * reaching mount(). A refusal here is therefore unreachable over HTTP,
     * and only reachable by mounting the component directly (as every
     * Livewire::test() call does), which must be denied on its own.
     */
    public function mount(): void
    {
        Gate::authorize('viewAny', ProductAttributeType::class);

        $this->loadTypes();
    }

    /**
     * Open the create-type form with an empty name and value list.
     *
     * Authorizes as its first statement -- a disclosure/UI-opening path,
     * not only the mutating save(), per
     * docs/security/livewire-authorization.md's "gate every method that
     * mutates *or discloses*" rule.
     */
    public function openCreateModal(LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('create', ProductAttributeType::class, targetType: 'product_attribute_type');

        $this->reset(['editingTypeId', 'name', 'values', 'valueUsageCounts']);
        // Phase 4 audit (0030a, finding L-1): the modal can be dismissed via its
        // wire:model-bound $showModal directly (X / click-outside), bypassing
        // closeModal() entirely -- Livewire persists the error bag across that
        // round trip, so a stale 'sku'/'values' message from a PREVIOUS type's
        // refused save would otherwise render here against an unrelated type.
        $this->resetValidation();
        $this->showModal = true;
    }

    /**
     * Open the edit form prefilled with the target type's current name and
     * value list.
     *
     * This is a Livewire method call, not route-model binding, so a
     * malformed or unknown id must fail on its own -- ProductAttributeType::
     * findOrFail() does that by raising ModelNotFoundException when the
     * query returns no row.
     *
     * $editingTypeId is assigned from $target->id, never the raw $typeId
     * argument -- the server-authoritative id the ->ignore() uniqueness
     * rule relies on. Every loaded value row is given a fresh, server-
     * generated `key` here, since the client has never seen these rows
     * before.
     */
    public function openEditModal(string $typeId, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $target = ProductAttributeType::findOrFail($typeId);

        $logRefusedPrivilegedAttempt->authorize('update', $target, targetType: 'product_attribute_type', targetId: $target->id);

        $this->editingTypeId = $target->id;
        $this->name = $target->name;
        $this->values = $target->values
            ->map(fn (ProductAttributeValue $value): array => [
                'id' => $value->id,
                'key' => (string) Str::uuid(),
                'value' => $value->value,
            ])
            ->all();
        $this->valueUsageCounts = ProductAttributeValue::variantUsageCounts($target->values->pluck('id')->all());
        // Phase 4 audit (0030a, finding L-1): see openCreateModal()'s identical
        // resetValidation() -- without it, a stale 'sku'/'values' error from a
        // previously refused save on a DIFFERENT type renders here on reopen.
        $this->resetValidation();
        $this->showModal = true;
    }

    /**
     * Append a new, empty value row with a fresh, server-generated key.
     */
    public function addValue(): void
    {
        $this->values[] = ['id' => null, 'key' => (string) Str::uuid(), 'value' => ''];
    }

    /**
     * Remove a value row by its stable key -- never by array index, which
     * is the standard Livewire foot-gun this design exists to avoid (see
     * the $values property's own docblock).
     */
    public function removeValue(string $key): void
    {
        $this->values = collect($this->values)
            ->reject(fn (array $row): bool => $row['key'] === $key)
            ->values()
            ->all();
    }

    /**
     * Move a value row one position in the given direction (-1 up, +1
     * down), by its stable key. A no-op when the row is already at the
     * boundary in that direction.
     */
    public function moveValue(string $key, int $direction): void
    {
        $values = $this->values;
        $index = collect($values)->search(fn (array $row): bool => $row['key'] === $key);

        if ($index === false) {
            return;
        }

        $newIndex = $index + $direction;

        if ($newIndex < 0 || $newIndex >= count($values)) {
            return;
        }

        [$values[$index], $values[$newIndex]] = [$values[$newIndex], $values[$index]];

        $this->values = $values;
    }

    /**
     * Validate and persist the create or edit form.
     *
     * Authorization is the first statement of each branch: `create` when
     * no type is being edited, `update` (against a freshly re-resolved
     * target) otherwise -- re-checked here even though openCreateModal()/
     * openEditModal() already authorized the same operation, since a
     * permission can be revoked between opening the modal and submitting
     * it.
     *
     * Str::squish() (trim + collapse internal whitespace runs) is applied
     * to the name and to every submitted value's text BEFORE the rules that
     * judge that text run (D3) -- the same ordering as
     * App\Livewire\Users\Index's Str::lower($this->email). If normalisation
     * happened only inside the action, the uniqueness rule would inspect the
     * un-normalised string and "Size " would slip past an existing "Size".
     * The name is squished before any validate() call; each value's text is
     * squished between validation passes 2 and 3 -- see the three-pass
     * comment inside the method body for why the split exists and why the
     * squish cannot come first.
     *
     * attributeValueListRules() is applied to 'values' only when the
     * submitted array is non-empty -- Laravel's `required` rule always
     * fails against an empty PHP array, and a type with zero values is
     * legal (Q2a). 'values.*.value' is validated unconditionally: an empty
     * array iterates to zero wildcard rules, so this is never a problem
     * for the zero-value case.
     */
    public function save(
        CreateProductAttributeType $create,
        UpdateProductAttributeType $update,
        LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ): void {
        $target = null;

        if ($this->editingTypeId === null) {
            $logRefusedPrivilegedAttempt->authorize('create', ProductAttributeType::class, targetType: 'product_attribute_type');
        } else {
            $target = ProductAttributeType::findOrFail($this->editingTypeId);
            $logRefusedPrivilegedAttempt->authorize('update', $target, targetType: 'product_attribute_type', targetId: $target->id);
        }

        $this->name = Str::squish($this->name);

        // Validation runs in THREE sequential passes, and the split is a
        // security requirement rather than a style choice -- see
        // docs/security/array-validation-bounds.md. A `max:N` rule on an array
        // attribute does NOT gate that array's own `.*` rules: Laravel expands
        // the wildcard against the data it was given and runs every expanded
        // rule regardless of whether the parent attribute's own rules already
        // failed. `values.*.value` carries `distinct:ignore_case`, which is
        // O(n^2) in the number of submitted rows, so a single forged submission
        // ignoring the `max:100` bound burned a measured 51 s of CPU at 20,000
        // rows in this story's own Phase 4 audit -- past PHP's default 30 s
        // max_execution_time -- while still ultimately returning only the
        // `max:100` message.
        //
        // Pass 1 bounds the array's SIZE (and validates `name`, whose rules are
        // O(1) -- one uniqueness query -- so the field an administrator is most
        // likely to have got wrong stays the first thing reported). Nothing
        // per-element runs until this passes, which is what makes that cost
        // impossible rather than merely unlikely.
        $sizePass = ['name' => $this->attributeTypeNameRules($this->editingTypeId)];

        if ($this->values !== []) {
            $sizePass['values'] = $this->attributeValueListRules();
        }

        $validated = $this->validate($sizePass);

        // Pass 2 establishes each row's SHAPE, and it must run before the
        // Str::squish() normalisation below rather than after: `$values` is the
        // form's own client-writable input, so a forged payload can carry a
        // scalar where a row is expected, or a non-string where a value's text
        // is expected. Normalising first would hand those straight to PHP's type
        // system -- an unhandled TypeError (a 500), not a validation error --
        // which is exactly what this story's Phase 4 audit reproduced. These
        // rules are all O(n) and can only ever see the <=100 rows pass 1 allowed.
        $this->validate([
            'values.*' => $this->attributeValueRowRules(),
            'values.*.id' => $this->attributeValueIdRules(),
            'values.*.value' => ['required', 'string'],
        ]);

        // Only now is every row provably `array{id: string|null, value: string}`,
        // so the normalisation closure needs no runtime type guards of its own.
        $this->values = collect($this->values)
            ->map(function (array $row): array {
                $row['value'] = Str::squish($row['value']);

                return $row;
            })
            ->all();

        // Pass 3 applies the real per-value domain rules to the NORMALISED text
        // (D3) -- max:100 must measure the stored value, and distinct:ignore_case
        // must compare stored values, or "Size " would slip past an existing
        // "Size".
        $this->validate(['values.*.value' => $this->attributeValueRules()]);

        $values = collect($this->values)
            ->map(fn (array $row): array => ['id' => $row['id'] ?? null, 'value' => $row['value']])
            ->all();

        if ($target === null) {
            $create((string) $validated['name'], $values);
        } else {
            $update($target, (string) $validated['name'], $values);
        }

        $this->loadTypes();
        $this->closeModal();
    }

    /**
     * Close the create/edit modal and reset its form state.
     *
     * Also resets validation: Livewire persists the error bag across round
     * trips, so without this a refused save's inline message would leak
     * into the next time the create/edit modal opens.
     */
    public function closeModal(): void
    {
        $this->showModal = false;
        $this->reset(['editingTypeId', 'name', 'values', 'valueUsageCounts']);
        $this->resetValidation();
    }

    /**
     * Open the delete-confirmation modal for the target type.
     *
     * Authorizes as its first statement -- a disclosure/UI-opening path,
     * not only the mutating deleteType().
     */
    public function confirmDelete(string $typeId, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $target = ProductAttributeType::findOrFail($typeId);

        $logRefusedPrivilegedAttempt->authorize('delete', $target, targetType: 'product_attribute_type', targetId: $target->id);

        $this->deletingTypeId = $target->id;
        $this->deletingTypeName = $target->name;
        $this->deletingTypeUsageCount = $target->variantUsageCount();
        $this->showDeleteModal = true;
    }

    /**
     * Authorize and delete the confirmed type.
     *
     * Resolves a FRESH ProductAttributeType::findOrFail($this->deletingTypeId)
     * immediately before authorizing and calling DeleteProductAttributeType
     * -- never an instance hydrated earlier in the request lifecycle -- per
     * docs/security/model-instance-trust.md.
     */
    public function deleteType(DeleteProductAttributeType $delete, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        if ($this->deletingTypeId === null) {
            return;
        }

        $target = ProductAttributeType::findOrFail($this->deletingTypeId);

        $logRefusedPrivilegedAttempt->authorize('delete', $target, targetType: 'product_attribute_type', targetId: $target->id);

        $delete($target);

        $this->loadTypes();
        $this->closeDeleteModal();
    }

    /**
     * Close the delete-confirmation modal and reset its state.
     *
     * Also resets validation (story 0030, the identical cross-story fix task 0018 made to
     * task 0017's SalesRegions\Index::closeModal()): deleteType()'s in-use guard (story 0029a)
     * throws a ValidationException keyed 'productAttributeTypeId' BEFORE this method ever runs,
     * so without resetting the bag here, dismissing that blocked message and confirming a
     * DIFFERENT, unblocked type would leak the stale "used by N variants" message into a delete
     * that has nothing to do with it -- Livewire persists the error bag across round trips.
     */
    public function closeDeleteModal(): void
    {
        $this->showDeleteModal = false;
        $this->reset(['deletingTypeId', 'deletingTypeName', 'deletingTypeUsageCount']);
        $this->resetValidation();
    }

    /**
     * @return array{total: int, values: int}
     */
    #[Computed]
    public function typesSummary(): array
    {
        return [
            'total' => count($this->types),
            'values' => array_sum(array_column($this->types, 'valueCount')),
        ];
    }

    /**
     * Reload the attribute type list from the database.
     *
     * Eager-loads `values` once (a single additional WHERE IN query,
     * regardless of the number of types or values per type) rather than
     * calling withCount('values') separately -- valueCount is derived from
     * the already-loaded collection, so the whole method issues exactly
     * two queries no matter how many types or values exist.
     *
     * `canEdit`/`canDelete` mirror the same ProductAttributeTypePolicy
     * methods save()/deleteType() authorize against
     * (Gate::allows('update'|'delete', $type)), so the disabled state
     * cannot drift from what a click would actually do.
     */
    private function loadTypes(): void
    {
        $this->types = ProductAttributeType::query()
            ->with('values')
            ->orderBy('name')
            ->orderBy('id')
            ->get()
            ->map(fn (ProductAttributeType $type): array => [
                'id' => $type->id,
                'name' => $type->name,
                'valueCount' => $type->values->count(),
                'valuePreview' => $type->values->pluck('value')->implode(', '),
                'canEdit' => Gate::allows('update', $type),
                'canDelete' => Gate::allows('delete', $type),
            ])
            ->all();
    }
}
