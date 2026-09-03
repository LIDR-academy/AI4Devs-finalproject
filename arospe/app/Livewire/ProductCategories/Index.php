<?php

namespace App\Livewire\ProductCategories;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\NormalizeForSearch;
use App\Actions\ProductCategories\CreateProductCategory;
use App\Actions\ProductCategories\DeleteProductCategory;
use App\Actions\ProductCategories\RenameProductCategory;
use App\Concerns\ProductCategoryValidationRules;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\Gate;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Title;
use Livewire\Component;

/**
 * Product categories management screen: list, create/edit modal, blocked
 * delete (story 0025). This is the first and only call site of
 * ProductCategoryPolicy and the three App\Actions\ProductCategories\*
 * actions -- it owns the whole client surface (component, route, view,
 * sidebar entry, copy), consuming 0023's model/actions/policy and 0024b's
 * delete guard exactly as App\Livewire\Users\Index consumes
 * app/Actions/Users/*.
 *
 * Access is gated on `products.view` (route middleware, `mount()`), with
 * per-action checks for `products.create` / `products.edit` /
 * `products.delete` re-checked inside every mutating AND disclosing
 * method, since Livewire 4's `PersistentMiddleware` allowlist does not
 * carry Spatie's `permission:` middleware -- see
 * docs/architecture/authorization.md. Every gate is defence in depth on
 * top of the identical gate each of the three actions now performs as its
 * own first statement.
 */
#[Title('Product categories')]
class Index extends Component
{
    use ProductCategoryValidationRules;

    /**
     * @var array<int, array{id: string, name: string, productCount: int, canEdit: bool, canDelete: bool}>
     *
     * Deliberately unlocked, unlike every id-carrying property below (D-4):
     * every method that mutates re-reads its target with findOrFail() and
     * re-authorizes against that fresh row, so nothing here is ever read
     * for a decision -- only for display. See
     * docs/security/blade-livewire-output-encoding.md, which records the
     * identical rationale for App\Livewire\Users\Index::$users.
     */
    public array $productCategories = [];

    /**
     * Written only from $target->id, never the raw method argument
     * (R-3) -- this is what makes the id fed to
     * ProductCategoryValidationRules::uniqueNormalisedName()'s ->ignore()
     * server-authoritative rather than client-controlled. See
     * docs/security/livewire-authorization.md.
     */
    #[Locked]
    public ?string $editingCategoryId = null;

    public bool $showModal = false;

    /**
     * The only form field. Never `?string` -- a bound property should
     * carry an empty value in the type the DOM expects (this modal holds a
     * single text input and no `<select>`, so the null-property/native-
     * `<select>` desync trap does not apply here, but the rule is followed
     * anyway).
     */
    public string $name = '';

    public bool $showDeleteModal = false;

    #[Locked]
    public ?string $deletingCategoryId = null;

    #[Locked]
    public string $deletingCategoryName = '';

    /**
     * Mount the component.
     *
     * `viewAny` is authorized here in addition to the route's `can:`
     * middleware because Livewire's `/livewire/update` endpoint is a
     * separate entry point that never runs route middleware -- mounting
     * the component directly (as every `Livewire::test()` call does) must
     * be denied on its own.
     *
     * Deliberately left unlogged, matching App\Livewire\Users\Index's
     * identical mount() precedent: the route's own `can:products.view`
     * gate checks the identical ability, and `can:` -- unlike `permission:`
     * -- IS on Livewire's PersistentMiddleware allow-list, so a real HTTP
     * actor who would fail this check is refused by the route before ever
     * reaching mount(). A refusal here is therefore unreachable over HTTP.
     */
    public function mount(): void
    {
        Gate::authorize('viewAny', ProductCategory::class);

        $this->loadProductCategories();
    }

    /**
     * Open the create-category form with an empty field.
     *
     * Authorizes as its first statement -- a disclosure/UI-opening path,
     * not only the mutating save(), per
     * docs/security/livewire-authorization.md's "gate every method that
     * mutates *or discloses*" rule.
     */
    public function openCreateModal(LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('create', ProductCategory::class, targetType: 'product_category');

        $this->reset(['editingCategoryId', 'name']);
        $this->showModal = true;
    }

    /**
     * Open the edit form prefilled with the target category's current name.
     *
     * This is a Livewire method call, not route-model binding, so
     * HasUuids::resolveRouteBindingQuery()'s Str::isUuid() short-circuit
     * does not apply here -- a malformed or unknown id must fail on its
     * own, which ProductCategory::findOrFail() already does by raising
     * ModelNotFoundException when the query returns no row.
     *
     * $editingCategoryId is assigned from $target->id, never the raw
     * $categoryId argument (R-3) -- the server-authoritative id the
     * ->ignore() uniqueness rule relies on.
     */
    public function openEditModal(string $categoryId, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $target = ProductCategory::findOrFail($categoryId);

        $logRefusedPrivilegedAttempt->authorize('update', $target, targetType: 'product_category', targetId: $target->id);

        $this->editingCategoryId = $target->id;
        $this->name = $target->name;
        $this->showModal = true;
    }

    /**
     * Validate and persist the create or edit form.
     *
     * Authorization is the first statement of each branch: `create` when
     * no category is being edited, `update` (against a freshly re-resolved
     * target) otherwise -- re-checked here even though openCreateModal()/
     * openEditModal() already authorized the same operation, since a
     * permission can be revoked between opening the modal and submitting
     * it.
     */
    public function save(
        CreateProductCategory $createProductCategory,
        RenameProductCategory $renameProductCategory,
        NormalizeForSearch $normalizeForSearch,
        LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ): void {
        $target = null;

        if ($this->editingCategoryId === null) {
            $logRefusedPrivilegedAttempt->authorize('create', ProductCategory::class, targetType: 'product_category');
        } else {
            $target = ProductCategory::findOrFail($this->editingCategoryId);
            $logRefusedPrivilegedAttempt->authorize('update', $target, targetType: 'product_category', targetId: $target->id);
        }

        $validated = $this->validate($this->productCategoryRules($normalizeForSearch, $this->editingCategoryId));

        if ($target === null) {
            $createProductCategory((string) $validated['name']);
        } else {
            $renameProductCategory($target, (string) $validated['name']);
        }

        $this->loadProductCategories();
        $this->closeModal();
    }

    /**
     * Close the create/edit modal and reset its form field.
     *
     * Also resets the 'name' validation error (Phase 4 audit finding N-3):
     * Livewire persists the error bag across round trips, so without this a
     * refused save's inline message would leak into the next time the
     * create/edit modal opens, mirroring closeDeleteModal()'s identical
     * resetErrorBag() call for the same reason.
     */
    public function closeModal(): void
    {
        $this->showModal = false;
        $this->reset(['editingCategoryId', 'name']);
        $this->resetValidation('name');
    }

    /**
     * Open the delete-confirmation modal for the target category.
     *
     * Authorizes as its first statement -- a disclosure/UI-opening path,
     * not only the mutating deleteProductCategory().
     */
    public function confirmDelete(string $categoryId, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $target = ProductCategory::findOrFail($categoryId);

        $logRefusedPrivilegedAttempt->authorize('delete', $target, targetType: 'product_category', targetId: $target->id);

        $this->deletingCategoryId = $target->id;
        $this->deletingCategoryName = $target->name;
        $this->showDeleteModal = true;
    }

    /**
     * Authorize and delete the confirmed category.
     *
     * Resolves a FRESH ProductCategory::findOrFail($this->deletingCategoryId)
     * immediately before authorizing and calling DeleteProductCategory --
     * never an instance hydrated earlier in the request lifecycle or
     * carried in component state -- per
     * docs/security/model-instance-trust.md.
     *
     * No try/catch around the DeleteProductCategory() call (D-2): the
     * ValidationException it throws on a blocked delete is the one
     * exception Livewire already routes into this component's error bag
     * with no plumbing at the call site, keyed on 'productCategoryId'. The
     * throw aborts this method before loadProductCategories()/
     * closeDeleteModal() ever run, which is what keeps the modal open by
     * construction rather than by an explicit flag.
     */
    public function deleteProductCategory(DeleteProductCategory $deleteProductCategory, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        if ($this->deletingCategoryId === null) {
            return;
        }

        $target = ProductCategory::findOrFail($this->deletingCategoryId);

        $logRefusedPrivilegedAttempt->authorize('delete', $target, targetType: 'product_category', targetId: $target->id);

        $deleteProductCategory($target);

        $this->loadProductCategories();
        $this->closeDeleteModal();
    }

    /**
     * Close the delete-confirmation modal and reset its state.
     *
     * Also resets the 'productCategoryId' error bag key (D-2, R-6 of the
     * story file) -- it lives in the error bag rather than in a component
     * property, so without this an earlier blocked-delete message would
     * leak into the next delete attempt on a different, unblocked category.
     */
    public function closeDeleteModal(): void
    {
        $this->showDeleteModal = false;
        $this->reset(['deletingCategoryId', 'deletingCategoryName']);
        $this->resetErrorBag('productCategoryId');
    }

    /**
     * Reload the product categories list from the database.
     *
     * Ordered `name ASC, id ASC` -- the `id` tiebreak costs nothing and is
     * a meaningful creation-order tiebreak given UUIDv7, even though the
     * normalised-uniqueness rule makes exact name collisions structurally
     * impossible (D-10). No pagination -- a product-category catalog is a
     * smaller lookup table than `users`.
     *
     * `canEdit`/`canDelete` mirror the same ProductCategoryPolicy methods
     * save()/deleteProductCategory() authorize against
     * (Gate::allows('update'|'delete', $category)), so the disabled state
     * cannot drift from what a click would actually do. The product count
     * (`withCount('products')`) is informational only and is NEVER used to
     * decide `canDelete` -- D-3: pre-disabling delete on `productCount > 0`
     * would conflate the in-use refusal (a domain invariant) with the
     * authorization UI hint.
     */
    private function loadProductCategories(): void
    {
        $this->productCategories = ProductCategory::query()
            ->withCount('products')
            ->orderBy('name')
            ->orderBy('id')
            ->get()
            ->map(fn (ProductCategory $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'productCount' => (int) $category->products_count,
                'canEdit' => Gate::allows('update', $category),
                'canDelete' => Gate::allows('delete', $category),
            ])
            ->all();
    }
}
