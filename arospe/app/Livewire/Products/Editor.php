<?php

namespace App\Livewire\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\Products\CreateProduct;
use App\Actions\Products\SearchSalesRegions;
use App\Actions\Products\SyncProductSalesRegions;
use App\Actions\Products\UpdateProduct;
use App\Concerns\ProductValidationRules;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Exceptions\UnresolvedSelectionException;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\On;
use Livewire\Attributes\Title;
use Livewire\Component;

/**
 * The routed product create/edit screen (story 0027, D-1): a full page rather than a modal, so a
 * WYSIWYG, two media-gallery modals and a searchable dropdown never have to nest inside a
 * `flux:modal`'s own `<dialog>` (D-1 reasons 1-2), and so a save can safely redirect (D-12c).
 *
 * `products.create` and `products.edit` both resolve this class (D-2); mount() branches on
 * whether a `Product` was route-model-bound. Gated on `products.view` at the route, with the
 * finer `create`/`update`/`delete` abilities authorized here as the SECOND layer over
 * CreateProduct/UpdateProduct's own self-authorization (0024's D-15 was reversed at its split).
 *
 * WRITTEN AGAINST THE ORIGINAL (pre-0076/0077 translatable-content-retrofit) contract: `$name` and
 * `$description` are plain scalar properties, matching the still-scalar `products.name` /
 * `products.description` columns. See the story file's own "predates Epic 5" blockquotes.
 */
#[Title('Product editor')]
class Editor extends Component
{
    use ProductValidationRules;

    /**
     * Matches App\Concerns\ProductValidationRules::productGalleryMediaIdsRules()'s `max:20` --
     * addGalleryImages() enforces the identical bound at the mutation point (F-1, appsec audit),
     * not only at save()'s validation.
     */
    private const MAX_GALLERY_SIZE = 20;

    /**
     * null => create. Written only from $product->id inside mount(), never a client argument --
     * this, plus #[Locked], is what makes the id fed to productSkuRules()'s ->ignore()
     * server-authoritative rather than client-controlled (obligation 3;
     * docs/security/livewire-authorization.md).
     */
    #[Locked]
    public ?string $productId = null;

    // --- form fields, all bound with wire:model. NONE of them is ever null (D-5) ---
    public string $name = '';

    public string $sku = '';

    /** '' matches the placeholder <option value=""> -- the $roleId fix from errors-log.md. */
    public string $productCategoryId = '';

    /**
     * Plain string, deliberately NOT ?ProductType (D-5): 0024 D-5 states type has no legitimate
     * default, so an enum-typed property would be structurally incapable of holding "nothing
     * chosen" and would force a case to be pre-selected. Cast with ProductType::from(...) only
     * after validation passes, inside save().
     */
    public string $type = '';

    /**
     * Plain string, not a typed ProductStatus enum (D-5's Phase 3 verification item, task 0015
     * finding F8): Livewire's EnumSynth hydrates a client-supplied backing value through
     * $type::from($value) BEFORE validation runs, so a tampered status would surface as an
     * unhandled \ValueError (a 500) rather than a validation error. Follows
     * App\Livewire\Users\Index::$status's identical precedent -- a real backing value, never ''.
     */
    public string $status = ProductStatus::Draft->value;

    public string $price = '';

    public string $stock = '';

    /** The WYSIWYG's #[Modelable] target. */
    public string $description = '';

    /**
     * The searchable multi-select's #[Modelable] target -- NOT #[Locked] (that binding needs it
     * writable).
     *
     * @var list<string>
     */
    public array $regionIds = [];

    // --- imagery: server-derived, so locked (D-8) ---
    #[Locked]
    public ?string $featuredMediaId = null;

    /** @var array{id: string, title: string, url: string, webpUrl: string, avifUrl: string}|null */
    #[Locked]
    public ?array $featuredPreview = null;

    /**
     * ORDERED -- the array order IS the gallery order, and it IS the persisted `position` (0024
     * D-17b). Never mutated except through addGalleryImages()/removeGalleryImage()/
     * moveGalleryImage{Earlier,Later}(), and resubmitted whole to CreateProduct/UpdateProduct on
     * every save.
     *
     * @var list<string>
     */
    #[Locked]
    public array $galleryMediaIds = [];

    /** @var list<array{id: string, title: string, url: string, webpUrl: string, avifUrl: string}> */
    #[Locked]
    public array $galleryPreviews = [];

    // --- modal open flags, each the #[Modelable] target of one Gallery instance (D-8) ---
    public bool $showFeaturedGallery = false;

    public bool $showStripGallery = false;

    /**
     * mount() authorizes `create`/`update` as its own first statement -- reachable directly via
     * Livewire::test()/a direct component mount even though the route itself is also gated
     * `can:products.view` (a coarser ability; the finer create/update check belongs here, matching
     * this screen's own public-surface contract).
     *
     * NOT exempt from refusal logging (F-2, appsec audit) -- unlike Index::mount()'s `viewAny`
     * check, which mirrors the route's own `can:products.view` gate exactly and is therefore
     * unreachable over HTTP, this method asks `create`/`update`: a FINER ability than the
     * route's. An actor holding only `products.view` passes the route's middleware and reaches
     * this method, where they ARE refused -- so a refusal here is reachable over HTTP and, until
     * this fix, was refused with nothing logged.
     */
    public function mount(LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt, ?Product $product = null): void
    {
        $logRefusedPrivilegedAttempt->authorize(
            $product === null ? 'create' : 'update',
            $product ?? Product::class,
            targetType: 'product',
            targetId: $product?->id,
        );

        if ($product === null) {
            return;
        }

        $this->productId = $product->id;
        $this->name = $product->name;
        $this->sku = $product->sku;
        $this->productCategoryId = $product->product_category_id;
        $this->type = $product->type->value;
        $this->status = $product->status->value;
        $this->price = $product->price;
        $this->stock = (string) $product->stock;
        $this->description = $product->description ?? '';
        $this->regionIds = array_values($product->salesRegions->pluck('id')->all());

        $featuredImage = $product->featuredImage;
        if ($featuredImage !== null) {
            $this->featuredMediaId = $featuredImage->id;
            $this->featuredPreview = $this->toPreview($featuredImage);
        }

        $gallery = $product->gallery;
        $this->galleryMediaIds = array_values($gallery->pluck('id')->all());
        $this->galleryPreviews = array_values($gallery->map(fn (Media $media): array => $this->toPreview($media))->all());
    }

    /**
     * @param  array<int, array<string, mixed>>  $media  0020's dispatched payload -- this handler
     *                                                   reads only the first item's `id`, since the
     *                                                   featured-image gallery is single-select.
     *
     * F-4 (appsec audit): the preview is built server-side from a fresh `Media::find()`, never
     * from the event payload's own `title`/`url`/`webpUrl`/`avifUrl` -- matching the "derive,
     * never accept" rule `Gallery::confirmSelection()` and `WysiwygEditor::insertImage()` already
     * follow. A tampered or since-deleted id is a silent no-op, matching `insertImage()`'s own
     * precedent for the identical situation.
     *
     * F-6 (code-review re-audit, story 0027): this is a page-globally-registered, client-
     * dispatchable `#[On]` listener with no route-level backstop of its own (Livewire's
     * `PersistentMiddleware` replays only the host page's `can:products.view`, which says nothing
     * about `media.*`) -- matching `WysiwygEditor::openGallery()`/`insertImage()`'s own routeless-
     * component pattern exactly, this gates `viewAny` on `Media::class` as its first statement, so
     * an actor holding `products.edit` but not `media.view` cannot dispatch this event directly
     * (bypassing the `@can('viewAny', \App\Models\Media::class)` wrapper that only hides the
     * picker button) and read a media row's title/url/webpUrl/avifUrl into this component.
     *
     * N-1 (code-review re-audit): `$id` is validated as a string BEFORE it reaches `find()`, the
     * identical guard `WysiwygEditor::insertImage()` already carries -- Eloquent's `find()` treats
     * an ARRAY argument as a call to `findMany()`, which returns a `Collection` rather than `null`,
     * so a forged payload shaping `id` as a nested array (e.g. `{"id": ["a","b"]}`) would otherwise
     * throw `ErrorException: Array to string conversion` from the old `(string) $item['id']` cast
     * instead of collapsing into the `$item === null` no-op guard below it.
     */
    #[On('featured-image-selected')]
    public function setFeaturedImage(array $media, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('viewAny', Media::class);

        $id = $media[0]['id'] ?? null;

        if (! is_string($id)) {
            return;
        }

        $selected = Media::query()->find($id);

        if ($selected === null) {
            return;
        }

        $this->featuredMediaId = $selected->id;
        $this->featuredPreview = $this->toPreview($selected);
    }

    /**
     * Clears the featured image only -- the gallery strip is untouched (D-8's independence
     * guarantee, 0024 D-9).
     */
    public function clearFeaturedImage(): void
    {
        $this->featuredMediaId = null;
        $this->featuredPreview = null;
    }

    /**
     * @param  array<int, array<string, mixed>>  $media  0020's dispatched payload, one or more
     *                                                   items since the strip picker is multi-select.
     *
     * F-1 (appsec audit): caps the total gallery size at self::MAX_GALLERY_SIZE (matching
     * ProductValidationRules::productGalleryMediaIdsRules()'s `max:20`) at the mutation point
     * too, not only at save()'s validation -- this is a public Livewire method (also a
     * page-globally-registered, client-dispatchable #[On] listener) with no other bound, so an
     * uncapped caller could otherwise grow $galleryMediaIds/$galleryPreviews without limit even
     * if save() is never called, since the array is serialized into the Livewire snapshot on
     * every round trip. This is a UI action rather than a validated form submit, so excess items
     * are silently dropped rather than raising an error.
     *
     * F-4 (appsec audit): each preview is built server-side from a fresh `Media::find()`, never
     * from the event payload's own `title`/`url`/`webpUrl`/`avifUrl` -- matching
     * setFeaturedImage()'s identical fix above (the "derive, never accept" rule
     * `Gallery::confirmSelection()`/`WysiwygEditor::insertImage()` already follow). A tampered or
     * since-deleted id is silently skipped.
     *
     * R-1 (appsec re-audit): F-1's cap only stopped the LOOP once the array had already grown to
     * self::MAX_GALLERY_SIZE -- a payload of ids that never make it into the array (non-existent
     * ids, since-deleted rows, or duplicates already in the strip) never tripped that check, so a
     * caller submitting hundreds of bogus ids drove one `Media::query()->find()` per item
     * regardless of the array's own length. The candidate list is now sliced to the remaining
     * capacity BEFORE any query runs, and every surviving id is resolved in one `whereIn()` query
     * instead of one query per item -- bounding both the query COUNT and the query COUNT to a
     * single query, not merely the array's final size.
     *
     * F-6 (code-review re-audit, story 0027): gates `viewAny` on `Media::class` as its first
     * statement, exactly like `setFeaturedImage()` above and `WysiwygEditor::openGallery()`/
     * `insertImage()`'s own routeless-component precedent -- this is a page-globally-registered,
     * client-dispatchable `#[On]` listener with no route-level backstop, so an actor holding
     * `products.edit` but not `media.view` could otherwise dispatch this event directly (bypassing
     * the `@can('viewAny', \App\Models\Media::class)` wrapper that only hides the picker button)
     * and read every matching media row's title/url/webpUrl/avifUrl into the component.
     *
     * N-1 (code-review re-audit): candidate ids are filtered to genuine strings BEFORE the
     * `whereIn()`/`in_array()` calls below, the identical guard `WysiwygEditor::insertImage()`
     * already carries for the single-select case -- the previous blind `(string) $id` cast would
     * throw `ErrorException: Array to string conversion` on a forged payload shaping one `id` as a
     * nested array (e.g. `{"id": ["a","b"]}`), a self-inflicted 500 rather than the silent-skip
     * this method promises for every other malformed element.
     */
    #[On('product-images-added')]
    public function addGalleryImages(array $media, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('viewAny', Media::class);

        $remainingCapacity = self::MAX_GALLERY_SIZE - count($this->galleryMediaIds);

        $candidateIds = collect($media)
            ->pluck('id')
            ->filter(fn (mixed $id): bool => is_string($id) && $id !== '')
            ->take(max($remainingCapacity, 0))
            ->all();

        $foundMedia = Media::query()->whereIn('id', $candidateIds)->get()->keyBy('id');

        foreach ($candidateIds as $id) {
            if (count($this->galleryMediaIds) >= self::MAX_GALLERY_SIZE) {
                break;
            }

            // An image already in the strip is not added twice -- not merely SyncProductGallery's
            // own dedupe backstop, but a real behaviour of this method.
            if (in_array($id, $this->galleryMediaIds, true)) {
                continue;
            }

            $selected = $foundMedia->get($id);

            if ($selected === null) {
                continue;
            }

            $this->galleryMediaIds[] = $selected->id;
            $this->galleryPreviews[] = $this->toPreview($selected);
        }
    }

    public function removeGalleryImage(string $mediaId): void
    {
        $index = array_search($mediaId, $this->galleryMediaIds, true);

        if ($index === false) {
            return;
        }

        $ids = $this->galleryMediaIds;
        $previews = $this->galleryPreviews;

        unset($ids[$index], $previews[$index]);

        $this->galleryMediaIds = array_values($ids);
        $this->galleryPreviews = array_values($previews);
    }

    /**
     * D-9b: mutates only the in-memory ordered array (and its parallel preview array) -- no
     * action call, no query, no pivot write, no `position` arithmetic. Persistence happens only on
     * save(), which resubmits the complete reordered array.
     */
    public function moveGalleryImageEarlier(string $mediaId): void
    {
        $this->swapGalleryPosition($mediaId, -1);
    }

    public function moveGalleryImageLater(string $mediaId): void
    {
        $this->swapGalleryPosition($mediaId, 1);
    }

    /**
     * Validate and persist the create/edit form, per D-12's ordering: authorize -> read
     * `$preserved` from the database -> validate the core fields -> validate the region array's
     * shape alone -> validate the region array's elements -> resolveSelected() -> open one
     * DB::transaction() -> create/update (which syncs the gallery through SyncProductGallery,
     * D-12a) -> sync regions -> redirect (D-12c).
     */
    public function save(
        CreateProduct $create,
        UpdateProduct $update,
        SyncProductSalesRegions $syncRegions,
        SearchSalesRegions $searchSalesRegions,
        LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ): mixed {
        $product = $this->productId === null ? null : Product::findOrFail($this->productId);

        $logRefusedPrivilegedAttempt->authorize(
            $product === null ? 'create' : 'update',
            $product ?? Product::class,
            targetType: 'product',
            targetId: $product?->id,
        );

        // 0026 D12: the preserved set is read server-side from the PERSISTED product, before
        // validating and never from the request -- [] on create, which compiles to `or 0 = 1`,
        // i.e. bit-for-bit the pre-D12 strict rule (obligation 4).
        $preserved = $product?->salesRegions->pluck('id')->all() ?? [];

        // Canonicalise BEFORE validating, mirroring CreateProduct/UpdateProduct's own
        // Str::upper(trim(...))/trim(...) (D-11): productSkuRules()'s regex requires the
        // already-canonical form, and this component's own validate() call runs before either
        // action ever sees the value, so without this the raw, pre-canonical submission would
        // fail a regex check the persisted value was always going to satisfy.
        $this->name = trim($this->name);
        $this->sku = Str::upper(trim($this->sku));

        // 1. The core fields, composed from ProductValidationRules' per-field methods.
        $this->validate([
            'name' => $this->productNameRules(),
            'sku' => $this->productSkuRules($this->productId),
            'productCategoryId' => $this->productCategoryIdRules(),
            'type' => $this->productTypeRules(),
            'status' => $this->productStatusRules(),
            'price' => $this->productPriceRules(),
            'stock' => $this->productStockRules(),
            'description' => $this->productDescriptionRules(),
            'featuredMediaId' => $this->productFeaturedMediaIdRules(),
        ]);

        // 1b. galleryMediaIds' SHAPE AND BOUND, alone, in its own call -- must throw before a
        //     single per-element exists() query runs, matching the regionIds two-pass pattern
        //     immediately below (F-1, appsec audit). Laravel expands a `.*` wildcard rule against
        //     every element regardless of whether the parent array's own rules already failed, so
        //     a combined single `validate()` call runs one Rule::exists() query per submitted
        //     element before `max:20` is ever consulted -- an uncapped-cost path for a UI action
        //     with no other bound on it (see productGalleryMediaIdsRules()'s own ⚠️ for the
        //     identical hazard on salesRegionIdsRules()).
        Validator::make(
            ['galleryMediaIds' => $this->galleryMediaIds],
            ['galleryMediaIds' => $this->productGalleryMediaIdsRules()],
        )->validate();

        Validator::make(
            ['galleryMediaIds' => $this->galleryMediaIds],
            ['galleryMediaIds.*' => ['string', 'distinct', Rule::exists('media', 'id')]],
        )->validate();

        // 2. The region array's SHAPE AND BOUND, alone, in its own call -- must throw before a
        //    single per-element exists() query runs (obligation 7, D-12(b2)).
        Validator::make(
            ['regionIds' => $this->regionIds],
            ['regionIds' => $this->salesRegionIdsRules()],
        )->validate();

        // 3. Only now the per-element rules, provably against at most 254 elements.
        Validator::make(
            ['regionIds' => $this->regionIds],
            ['regionIds.*' => $this->salesRegionIdRules($preserved)],
        )->validate();

        // D-10: the mandatory consumer-side re-check -- a total function, never a short return.
        // Runs on EVERY submitted id, preserved ones included, since it is what catches a
        // pre-existing id whose row was deleted outright.
        try {
            $searchSalesRegions->resolveSelected($this->regionIds);
        } catch (UnresolvedSelectionException) {
            throw ValidationException::withMessages([
                'regionIds' => __('products.sales_regions.unresolvable'),
            ]);
        }

        DB::transaction(function () use ($create, $update, $syncRegions, $product): void {
            // CreateProduct / UpdateProduct call SyncProductGallery internally (D-12a, 0024
            // D-17a) -- never called directly from here. Both imagery arguments are ALWAYS
            // passed, since neither action gives them a default.
            $saved = $product === null
                ? $create(
                    $this->name,
                    $this->sku,
                    $this->productCategoryId,
                    $this->type,
                    $this->status,
                    $this->price,
                    $this->stock,
                    $this->featuredMediaId,
                    $this->galleryMediaIds,
                    $this->description,
                )
                : $update(
                    $product,
                    $this->name,
                    $this->sku,
                    $this->productCategoryId,
                    $this->type,
                    $this->status,
                    $this->price,
                    $this->stock,
                    $this->featuredMediaId,
                    $this->galleryMediaIds,
                    $this->description,
                );

            $syncRegions($saved, $this->regionIds);
        });

        // D-12c: a successful save redirects; it never resets the form in place -- 0021 D9 means a
        // server-side write to $description would not appear in the (wire:ignore'd) editor anyway.
        return $this->redirectRoute('products.index');
    }

    /**
     * @return list<array{id: string, name: string}>
     */
    #[Computed]
    public function categoryOptions(): array
    {
        return array_values(
            ProductCategory::query()
                ->orderBy('name')
                ->orderBy('id')
                ->get(['id', 'name'])
                ->map(fn (ProductCategory $category): array => ['id' => $category->id, 'name' => $category->name])
                ->all()
        );
    }

    /**
     * @return list<ProductType>
     */
    #[Computed]
    public function typeOptions(): array
    {
        return ProductType::cases();
    }

    /**
     * D-6: fed from the PERSISTED enum, never ProductDisplayStatus -- an option that can never be
     * persisted becomes something the user picks and the server then rejects.
     *
     * @return list<ProductStatus>
     */
    #[Computed]
    public function statusOptions(): array
    {
        return ProductStatus::cases();
    }

    private function swapGalleryPosition(string $mediaId, int $direction): void
    {
        $index = array_search($mediaId, $this->galleryMediaIds, true);

        if ($index === false) {
            return;
        }

        $target = $index + $direction;

        if ($target < 0 || $target >= count($this->galleryMediaIds)) {
            return;
        }

        $ids = $this->galleryMediaIds;
        $previews = $this->galleryPreviews;

        [$ids[$index], $ids[$target]] = [$ids[$target], $ids[$index]];
        [$previews[$index], $previews[$target]] = [$previews[$target], $previews[$index]];

        $this->galleryMediaIds = array_values($ids);
        $this->galleryPreviews = $previews;
    }

    /**
     * Builds the {id, title, url, webpUrl, avifUrl} preview shape from 0019's real
     * `path`/`webp_path`/`avif_path` columns -- mirroring App\Livewire\Media\Gallery::
     * toPayloadItem() and App\Livewire\Components\WysiwygEditor::insertImage() (D-17): there is no
     * url()-style accessor on App\Models\Media to reach for.
     *
     * @return array{id: string, title: string, url: string, webpUrl: string, avifUrl: string}
     */
    private function toPreview(Media $media): array
    {
        $disk = Storage::disk('public');

        return [
            'id' => $media->id,
            'title' => (string) $media->title,
            'url' => $disk->url($media->path),
            'webpUrl' => $disk->url($media->webp_path),
            'avifUrl' => $disk->url($media->avif_path),
        ];
    }
}
