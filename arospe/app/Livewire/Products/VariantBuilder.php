<?php

namespace App\Livewire\Products;

use App\Actions\Products\CreateProductVariant;
use App\Actions\Products\DeleteProductVariant;
use App\Actions\Products\DeriveVariantSku;
use App\Actions\Products\UpdateProductVariant;
use App\Concerns\ProductVariantValidationRules;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\On;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * The variant builder, nested inside 0027's routed product editor (story 0031, D-1): one attribute-
 * value combination composed at a time, each carrying a live-previewed, read-only, derived SKU, its
 * own price/stock and an optional own image that falls back to the parent product's featured image
 * at read time.
 *
 * No `#[Title]` -- this is a nested child, not a page; the page title stays Editor's own.
 * `#[Locked] public string $productId` is re-declared here and the parent Product is re-read with
 * `Product::findOrFail()` at the top of every method (D-1's embed-shape obligation, the 0022 D6
 * precedent applied verbatim) -- never trusted from a caller-staged instance.
 *
 * D-10 note 5: no `->ignore()` anywhere on this component. The SKU is derived, never typed, so
 * there is no field to exempt from a uniqueness check and no `skuRules()`/variant-SKU rule of any
 * kind exists here or in the composed trait.
 *
 * Composes ONLY `ProductVariantValidationRules` (D-13) -- never `App\Concerns\ProductValidationRules`,
 * which would put `productSkuRules()` in reach of a component that must never validate a SKU.
 */
class VariantBuilder extends Component
{
    use ProductVariantValidationRules;
    use WithPagination;

    /**
     * Re-declared per the embed's own obligation (D-1) -- the parent Product is re-read with
     * `Product::findOrFail()` at the top of every method, never trusted from a cached instance.
     */
    #[Locked]
    public string $productId;

    /**
     * One row per attribute-type/value pair being composed (D-2/D-9). Every bound value is `''`,
     * NEVER `null` and never absent -- the null-<select> desync trap this screen is the worst case
     * in the codebase for. `key` is a stable, server-generated UUID minted once per row and never
     * mutated; removal is by KEY, never by index (D-2).
     *
     * @var list<array{key: string, typeId: string, valueId: string}>
     */
    public array $combinationRows = [];

    /**
     * decimal:2 returns a STRING (0024 R-4 / 0029 R-C). Never float, never null.
     */
    public string $price = '';

    /** String for the same reason: an int property cannot hold the '' a cleared input sends. */
    public string $stock = '0';

    /**
     * The staged image for the variant currently being composed/edited -- never bound with
     * wire:model directly (chosen only through the single Gallery instance's dispatched event), so
     * #[Locked] to match every other id-carrying property on this component.
     */
    #[Locked]
    public ?string $featuredMediaId = null;

    public bool $showForm = false;

    /**
     * null => composing a NEW variant. Written only from $variant->id inside openEditForm(), never
     * a client argument -- the 0022 D6 precedent, applied here to keep the id fed to every scoped
     * lookup server-authoritative.
     */
    #[Locked]
    public ?string $editingVariantId = null;

    /** The single Gallery instance's #[Modelable] target (D-6) -- one instance, never one per row. */
    public bool $showGallery = false;

    #[Locked]
    public bool $showDeleteModal = false;

    #[Locked]
    public ?string $deletingVariantId = null;

    #[Locked]
    public ?string $deletingVariantLabel = null;

    #[Locked]
    public ?string $deletingVariantSku = null;

    /**
     * Computed ONCE from the same policy method every mutating path authorizes against (D-10 note
     * 4) -- never a per-row matrix, since every ProductPolicy ability answers identically for every
     * variant of one product.
     */
    #[Locked]
    public bool $canManageVariants = false;

    /**
     * `$productId` arrives from the embedding Editor view's own `:product-id="$productId"`
     * attribute (D-1) -- accepted as an explicit mount() parameter rather than relying on
     * Livewire's automatic attribute-to-property hydration, matching Editor::mount()'s own
     * "written only from a resolved value inside mount()" discipline for its `#[Locked]` id
     * properties.
     *
     * Asks `viewAny` -- the SAME coarse ability the host route's own `can:products.view` gate
     * already enforces (matching App\Livewire\Products\Index::mount()'s identical precedent), so a
     * real HTTP actor who would fail it never reaches this child component at all. The finer
     * `update` ability every mutating/disclosing method below asks is a strictly stronger check.
     */
    public function mount(string $productId): void
    {
        $this->productId = $productId;

        Gate::authorize('viewAny', Product::class);

        $this->canManageVariants = Gate::allows('update', $this->product());
    }

    /**
     * The parent product, re-read fresh on every call -- never cached across requests, per this
     * component's own embed-shape obligation (D-1).
     */
    public function product(): Product
    {
        return Product::findOrFail($this->productId);
    }

    /**
     * D-10: authorizes `update` on the PARENT PRODUCT as the first statement, defence in depth over
     * 0029's own now-self-authorizing actions (D-12.1). Resets the whole form to a single blank row
     * -- D-3's structural invariant that the builder never holds more than one unsaved variant.
     */
    public function openCreateForm(): void
    {
        Gate::authorize('update', $this->product());

        $this->editingVariantId = null;
        $this->combinationRows = [$this->newCombinationRow()];
        $this->price = (string) $this->product()->price;
        $this->stock = '0';
        $this->featuredMediaId = null;
        $this->showForm = true;
        $this->resetErrorBag();
        $this->resetValidation();
    }

    /**
     * D-10: authorizes `update` because this method also DISCLOSES a variant's price/stock. The
     * variant is resolved through the parent's OWN `variants()` relation, never a bare
     * `ProductVariant::findOrFail()` -- the cross-product-target guard: a variant id belonging to
     * an unrelated product must not resolve here at all.
     *
     * D-11: the combination is shown FIXED (lockedCombination()), never re-populated into the
     * editable repeater -- `combinationRows` stays empty while editing, so saveVariant() never
     * reads a combination change out of it (0029 D-13, combination immutable after creation).
     */
    public function openEditForm(string $id): void
    {
        Gate::authorize('update', $this->product());

        $variant = $this->product()->variants()->findOrFail($id);

        $this->editingVariantId = $variant->id;
        $this->combinationRows = [];
        $this->price = (string) $variant->price;
        $this->stock = (string) $variant->stock;
        $this->featuredMediaId = $variant->featured_media_id;
        $this->showForm = true;
        $this->resetErrorBag();
        $this->resetValidation();
    }

    /**
     * A row-level shortcut: opens the edit form for an already-saved variant (loading its current
     * price/stock/image) and immediately opens the single Gallery instance -- D-6's "the single
     * instance targets whichever variant the open form addresses". Persisting the newly chosen
     * image still goes through saveVariant() like any other field edit; setVariantImage() itself
     * only stages the id (see its own docblock).
     */
    public function openImagePicker(string $id): void
    {
        $this->openEditForm($id);
        $this->showGallery = true;
    }

    /**
     * D-10: authorizes `update` as the first statement. Delegates the whole validate-then-persist
     * decision to the two confirmed action signatures (D-13a) -- price/stock/featuredMediaId are
     * validated here, component-side, BEFORE `(int) $this->stock` ever casts the raw string: both
     * action signatures type `stock` as `int`, and casting an unvalidated non-numeric string first
     * would either silently coerce a malformed value to 0 or raise an uncaught TypeError, neither of
     * which is the validation-message refusal this screen promises.
     *
     * The combination array itself is deliberately NOT re-validated here -- CreateProductVariant's
     * own two-pass validation (D-16.1) uses the IDENTICAL trait methods this component composes, so
     * duplicating it would only repeat the same check under the same bag key for no benefit.
     */
    public function saveVariant(
        CreateProductVariant $createProductVariant,
        UpdateProductVariant $updateProductVariant,
    ): void {
        Gate::authorize('update', $this->product());

        $this->validate([
            'price' => $this->variantPriceRules(),
            'stock' => $this->variantStockRules(),
            'featuredMediaId' => $this->variantFeaturedMediaIdRules(),
        ]);

        if ($this->editingVariantId === null) {
            $createProductVariant(
                $this->product(),
                $this->combinationValueIds(),
                $this->price,
                (int) $this->stock,
                $this->featuredMediaId,
            );
        } else {
            $variant = $this->product()->variants()->findOrFail($this->editingVariantId);

            // D-13: combination is NEVER touched here -- $this->combinationRows is ignored on
            // purpose, whatever the client submitted (FP-V16: absent markup is not an absent
            // method).
            $updateProductVariant($variant, $this->price, (int) $this->stock, $this->featuredMediaId);
        }

        $this->closeForm();
    }

    /**
     * D-8: clears the error bag left by a refused save (0025 R-6's stale-error trap, sharper here
     * because a refusal is attached to a DERIVED value the next combination no longer produces).
     */
    public function closeForm(): void
    {
        $this->showForm = false;
        $this->editingVariantId = null;
        $this->combinationRows = [];
        $this->price = '';
        $this->stock = '0';
        $this->featuredMediaId = null;
        $this->resetErrorBag();
        $this->resetValidation();
    }

    public function addCombinationRow(): void
    {
        Gate::authorize('update', $this->product());

        $this->combinationRows[] = $this->newCombinationRow();
    }

    /**
     * D-2: removal by KEY, never by index -- an index-based removal deletes the wrong row after any
     * prior removal shifts the array.
     */
    public function removeCombinationRow(string $key): void
    {
        Gate::authorize('update', $this->product());

        $this->combinationRows = array_values(array_filter(
            $this->combinationRows,
            fn (array $row): bool => $row['key'] !== $key,
        ));
    }

    /**
     * D-9's dependent-select reset: changing a row's TYPE resets that row's VALUE to '' in the same
     * round trip, closing the "new instance of the null-<select> desync" trap a stale value select
     * would otherwise reach (the old valueId may not even belong to the newly chosen type's option
     * set).
     */
    public function updated(string $name, mixed $value): void
    {
        if (Str::is('combinationRows.*.typeId', $name)) {
            $index = (int) explode('.', $name)[1];

            if (isset($this->combinationRows[$index])) {
                $this->combinationRows[$index]['valueId'] = '';
            }
        }
    }

    /**
     * D-10: authorizes `update` because this method DISCLOSES the target's label/sku. D-5 R3: both
     * are read fresh from the database here, never backed out of whatever the list last rendered --
     * the stale-rename trigger this modal must resist (a rename may have happened on 0030's screen,
     * in another tab, between the list render and this click).
     */
    public function confirmDelete(string $id): void
    {
        Gate::authorize('update', $this->product());

        $variant = $this->product()->variants()->findOrFail($id);

        $this->deletingVariantId = $variant->id;
        $this->deletingVariantLabel = $variant->label();
        $this->deletingVariantSku = $variant->sku;
        $this->showDeleteModal = true;
    }

    public function deleteVariant(DeleteProductVariant $deleteProductVariant): void
    {
        Gate::authorize('update', $this->product());

        if ($this->deletingVariantId === null) {
            return;
        }

        $variant = $this->product()->variants()->findOrFail($this->deletingVariantId);

        $deleteProductVariant($variant);

        // The deleted row can no longer be "the one being edited" -- without this, an open edit
        // panel left pointed at a now-deleted variant crashes the very next render, since
        // lockedCombination() re-resolves it with findOrFail().
        if ($this->editingVariantId === $variant->id) {
            $this->closeForm();
        }

        $this->closeDeleteModal();
    }

    public function closeDeleteModal(): void
    {
        $this->showDeleteModal = false;
        $this->deletingVariantId = null;
        $this->deletingVariantLabel = null;
        $this->deletingVariantSku = null;
    }

    /**
     * D-6: a per-row, non-destructive, instantly-reversible action -- sets `featuredMediaId = null`
     * and calls UpdateProductVariant directly, no confirmation. Never touches price/stock.
     */
    public function revertToInheritedImage(string $id, UpdateProductVariant $updateProductVariant): void
    {
        Gate::authorize('update', $this->product());

        $variant = $this->product()->variants()->findOrFail($id);

        $updateProductVariant($variant, $variant->price, $variant->stock, null);
    }

    /**
     * The single Gallery instance's listener (D-6) -- STAGES the chosen id only. Validation and
     * persistence both happen later, inside saveVariant(), exactly like every other field on this
     * form: the D-8 error-table entry for `featuredMediaId` ("only reachable if the Gallery hands
     * back an id that has since been deleted") is surfaced there, on purpose, rather than here.
     *
     * @param  array<int, array<string, mixed>>  $media  0020's dispatched payload -- single-select,
     *                                                   so only the first item's `id` is read.
     */
    #[On('variant-image-selected')]
    public function setVariantImage(array $media): void
    {
        Gate::authorize('update', $this->product());

        $id = $media[0]['id'] ?? null;

        $this->featuredMediaId = is_string($id) ? $id : null;
    }

    /**
     * The SKU the current combination would derive, or null while nothing is chosen. A #[Computed]
     * METHOD, never a property (D-4): a Livewire property is sent in the snapshot whether or not its
     * input is disabled, so a property here would re-open the typed-claimant problem the derivation
     * removes. Values are read back OUT OF THE DATABASE (V-10), never taken from the request.
     */
    #[Computed]
    public function skuPreview(): ?string
    {
        $values = $this->orderedSelectedValues();

        if ($values === []) {
            return null;
        }

        return app(DeriveVariantSku::class)($this->product()->sku, $values);
    }

    /**
     * D-6's corrected eager-load list: `featuredImage` AND `values.type` -- 0029's own R-D names
     * only the first, which would N+1 twice per row on the combination column. `product.featuredImage`
     * is deliberately ABSENT -- the parent's own image is loaded ONCE via parentFeaturedImage()
     * below, never per row. D-17: paginated at 25, matching 0027 D-4's page size; the order
     * (`position ASC, sku ASC`) is declared inside Product::variants() itself, never re-applied here.
     *
     * @return LengthAwarePaginator<int, ProductVariant>
     */
    #[Computed]
    public function variants(): LengthAwarePaginator
    {
        return $this->product()->variants()
            ->with([
                'featuredImage:id,title,path,webp_path,avif_path',
                'values.type:id,name,position',
            ])
            ->paginate(25);
    }

    /**
     * The parent product's OWN featured image, loaded ONCE and reused for every inheriting row
     * (D-6) -- the builder already holds the parent, so resolving it once here is what keeps the
     * variants query free of a `product.featuredImage` eager load.
     */
    #[Computed]
    public function parentFeaturedImage(): ?Media
    {
        return $this->product()->featuredImage;
    }

    /**
     * The catalog's attribute types, in the SAME order the derivation uses (type.position, type.id)
     * -- so the repeater's rows read in the same order as the SKU (D-2).
     *
     * @return Collection<int, ProductAttributeType>
     */
    #[Computed]
    public function attributeTypes(): Collection
    {
        return ProductAttributeType::query()->with('values')->orderBy('position')->orderBy('id')->get();
    }

    /**
     * The type options available to one row: every catalog type EXCEPT those already chosen in
     * another row (D-2's structural DIS-1 guard -- "Size 40 / Size 41" is unbuildable because a
     * type picked in one row is removed from every other row's own options).
     *
     * @return Collection<int, ProductAttributeType>
     */
    public function availableTypesForRow(int $index): Collection
    {
        $usedTypeIds = collect($this->combinationRows)
            ->reject(fn (array $row, int $i): bool => $i === $index)
            ->pluck('typeId')
            ->filter(fn (string $id): bool => $id !== '')
            ->all();

        return $this->attributeTypes()->reject(
            fn (ProductAttributeType $type): bool => in_array($type->id, $usedTypeIds, true),
        )->values();
    }

    /**
     * The value options for one row's currently chosen type -- empty until a type is picked.
     *
     * @return \Illuminate\Support\Collection<int, ProductAttributeValue>
     */
    public function valuesForRow(int $index): \Illuminate\Support\Collection
    {
        $typeId = $this->combinationRows[$index]['typeId'] ?? '';

        if ($typeId === '') {
            return collect();
        }

        $type = $this->attributeTypes()->firstWhere('id', $typeId);

        return $type === null ? collect() : collect($type->values);
    }

    /**
     * Whether at least one catalog type is not yet used by any row -- drives the "Añadir atributo"
     * button's disabled state (D-14 T3).
     */
    public function hasUnusedAttributeTypes(): bool
    {
        $usedTypeIds = collect($this->combinationRows)
            ->pluck('typeId')
            ->filter(fn (string $id): bool => $id !== '')
            ->all();

        return $this->attributeTypes()
            ->reject(fn (ProductAttributeType $type): bool => in_array($type->id, $usedTypeIds, true))
            ->isNotEmpty();
    }

    /**
     * The combination's display for an EXISTING variant being edited (D-11) -- static badges, never
     * a re-populated editable repeater.
     *
     * @return list<array{type: string, value: string}>
     */
    #[Computed]
    public function lockedCombination(): array
    {
        if ($this->editingVariantId === null) {
            return [];
        }

        $variant = $this->product()->variants()->with('values.type')->findOrFail($this->editingVariantId);

        return array_values($variant->values
            ->map(fn (ProductAttributeValue $value): array => ['type' => $value->type->name, 'value' => $value->value])
            ->all());
    }

    /**
     * @return array{key: string, typeId: string, valueId: string}
     */
    private function newCombinationRow(): array
    {
        return ['key' => (string) Str::uuid(), 'typeId' => '', 'valueId' => ''];
    }

    /**
     * @return list<string>
     */
    private function combinationValueIds(): array
    {
        return array_values(array_filter(
            array_map(
                fn (array $row): string => (string) $row['valueId'],
                $this->combinationRows,
            ),
            fn (string $id): bool => $id !== '',
        ));
    }

    /**
     * D-4.2's exact ordering (type.position, type.id, value.position, value.id) applied to the
     * currently selected rows, values read back FROM THE DATABASE (V-10) rather than taken from the
     * request -- the same fact the stored SKU is derived from, which is what makes D-5's "stale
     * option list" test meaningful.
     *
     * @return list<string>
     */
    private function orderedSelectedValues(): array
    {
        $valueIds = $this->combinationValueIds();

        if ($valueIds === []) {
            return [];
        }

        $ordered = ProductAttributeValue::query()
            ->whereIn('id', $valueIds)
            ->with('type')
            ->get()
            ->sortBy([
                fn (ProductAttributeValue $a, ProductAttributeValue $b): int => $a->type->position <=> $b->type->position,
                fn (ProductAttributeValue $a, ProductAttributeValue $b): int => $a->type->id <=> $b->type->id,
                fn (ProductAttributeValue $a, ProductAttributeValue $b): int => $a->position <=> $b->position,
                fn (ProductAttributeValue $a, ProductAttributeValue $b): int => $a->id <=> $b->id,
            ]);

        return array_values($ordered->map(fn (ProductAttributeValue $value): string => $value->value)->all());
    }
}
