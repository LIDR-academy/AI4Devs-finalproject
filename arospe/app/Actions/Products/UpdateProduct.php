<?php

namespace App\Actions\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Concerns\ProductValidationRules;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UpdateProduct
{
    use ProductValidationRules;

    /**
     * Constructor injection -- see CreateProduct's identical rationale. Five
     * collaborators, not two. TranslateProductVariantUniqueViolation is the
     * same shared disambiguator CreateProductVariant/SyncProductAttributeValues
     * already use (Phase 4 re-audit finding R-3, docs/security/
     * derived-column-invariants.md) -- one implementation of "which index
     * was this" that every product_variants.sku writer's catch relies on.
     * DeriveVariantSku is reDeriveVariantSkus()'s own collaborator,
     * constructor-injected rather than resolved via app() inside that
     * method -- this class already constructor-injects four others, so an
     * in-method app() call here was the anti-pattern code-style.md documents,
     * not its carve-out (no fixed, non-`$this`-controlled parameter list
     * forces it).
     */
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly SyncProductGallery $syncProductGallery,
        private readonly SanitizeProductDescription $sanitizeProductDescription,
        private readonly TranslateProductVariantUniqueViolation $translateProductVariantUniqueViolation,
        private readonly DeriveVariantSku $deriveVariantSku,
    ) {}

    /**
     * Update an existing product.
     *
     * Authorizes `update` on `$product` as its own first statement (D-15),
     * with `targetType: 'product'` and `targetId: $product->id` passed
     * explicitly since LogRefusedPrivilegedAttempt::resolveTarget()
     * auto-resolves only User and Role instances.
     *
     * The SKU uniqueness rule ignores the product's own id (R-1/R-15 --
     * this story's single most likely bug alongside the SKU race guard),
     * which is what makes saving a product under its own unchanged SKU
     * succeed.
     *
     * `$featuredMediaId` and `$orderedGalleryMediaIds` carry NO defaults
     * (Phase 4 audit finding F-1), matching `SyncProductGallery`'s own
     * contract (D-17): its array is the complete, authoritative gallery,
     * never a delta, so a caller omitting these two on an otherwise
     * ordinary edit (a partial form submit, a queued job, a future caller)
     * would otherwise silently wipe the product's entire gallery and null
     * its featured image, with zero error and no way to distinguish an
     * intentional clear from an omission. A caller that means to preserve
     * the current gallery must pass it back explicitly.
     *
     * Media membership (`$featuredMediaId` / `$orderedGalleryMediaIds`) is
     * gated on `products.*` alone, deliberately -- neither this action nor
     * `productFeaturedMediaIdRules()`/`productGalleryMediaIdsRules()`
     * checks `media.view`. The media library is a shared, non-per-user
     * resource by PRD design, so an actor holding `products.edit` may
     * attach any existing media row without also needing a media-module
     * permission; that is a recorded product decision, not a gap for a
     * future story to close unilaterally.
     *
     * @param  list<string>  $orderedGalleryMediaIds
     */
    public function __invoke(
        Product $product,
        string $name,
        string $sku,
        ?string $productCategoryId,
        ?string $type,
        ?string $status,
        mixed $price,
        mixed $stock,
        ?string $featuredMediaId,
        array $orderedGalleryMediaIds,
        ?string $description,
    ): Product {
        $this->logRefusedPrivilegedAttempt->authorize(
            'update',
            $product,
            targetType: 'product',
            targetId: $product->id,
        );

        $name = trim($name);
        $sku = Str::upper(trim($sku));
        // 0024a D-16/D-A1: sanitize BEFORE validating, so max:65535 measures the
        // stored value rather than markup the sanitizer is about to remove, and
        // reassign $description so both the Validator::make() array below and the
        // DB::transaction() closure further down read the sanitized value.
        // Asserted independently of CreateProduct's identical wiring -- a
        // sanitizer wired into one action only is a silent hole reachable by
        // editing any product.
        $description = ($this->sanitizeProductDescription)($description);

        Validator::make(
            [
                'name' => $name,
                'sku' => $sku,
                'product_category_id' => $productCategoryId,
                'type' => $type,
                'status' => $status,
                'price' => $price,
                'stock' => $stock,
                'description' => $description,
                'featured_media_id' => $featuredMediaId,
                'gallery_media_ids' => $orderedGalleryMediaIds,
            ],
            $this->productRules($product->id),
        )->validate();

        $resolvedType = ProductType::from((string) $type);
        $resolvedStatus = $status === null ? ProductStatus::Draft : ProductStatus::from($status);

        try {
            // Phase 4 re-audit finding R-1 (docs/security/derived-column-invariants.md,
            // "What the remediation introduced"): deliberately NO `attempts: N` here, unlike
            // CreateProduct/CreateProductVariant. This closure mutates $product -- an Eloquent
            // model created OUTSIDE the closure and handed back to the caller -- via update()
            // further down. A retried attempt after a rolled-back deadlock does NOT reset that
            // model's in-memory state: $skuChanged (captured from the pre-mutation attribute) and
            // isDirty() after fill() both read false on a second attempt, so a retry can commit
            // having written nothing while returning a Product whose attributes look correct and
            // silently skipping the whole D-4.6 variant re-derivation cascade. CreateProduct and
            // CreateProductVariant are safe with `attempts: 3` because they build their row INSIDE
            // the closure via forceCreate() -- a retry there re-does real work. Do not add
            // `attempts: N` back here without re-reading that doc section first.
            return DB::transaction(function () use (
                $product,
                $name,
                $sku,
                $productCategoryId,
                $resolvedType,
                $resolvedStatus,
                $price,
                $stock,
                $description,
                $featuredMediaId,
                $orderedGalleryMediaIds,
            ): Product {
                // Story 0029 D-4.5/D-4.7: SKUs are one namespace across `products` AND
                // `product_variants`. ALWAYS this order -- products (excluding this row), then
                // product_variants.
                $conflict = DB::table('products')
                    ->where('sku', $sku)
                    ->where('id', '!=', $product->id)
                    ->lockForUpdate()
                    ->value('id');

                if ($conflict === null) {
                    $conflict = DB::table('product_variants')->where('sku', $sku)->lockForUpdate()->value('id');
                }

                if ($conflict !== null) {
                    throw ValidationException::withMessages([
                        'sku' => trans('validation.unique', ['attribute' => 'sku']),
                    ]);
                }

                // D-4.6: the SKU follows its inputs. Captured BEFORE update() overwrites the
                // in-memory attribute, so this is genuinely the pre-save value.
                $skuChanged = $product->sku !== $sku;

                $product->update([
                    'name' => $name,
                    'sku' => $sku,
                    'product_category_id' => (string) $productCategoryId,
                    'type' => $resolvedType,
                    'status' => $resolvedStatus,
                    'price' => $price,
                    'stock' => (int) $stock,
                    'description' => $description,
                ]);

                ($this->syncProductGallery)($product, $featuredMediaId, $orderedGalleryMediaIds);

                if ($skuChanged) {
                    $this->reDeriveVariantSkus($product, $sku);
                }

                return $product;
            });
        } catch (QueryException $e) {
            // 1062 = MySQL ER_DUP_ENTRY -- see CreateProduct's identical
            // catch for why SQLSTATE 23000 alone is too broad here (Phase 4
            // audit finding F-2): this transaction also carries three other
            // FKs, so a race on one of them must not be misreported as
            // "the sku is taken". Phase 4 re-audit finding F-6: this catch
            // ALSO wraps reDeriveVariantSkus()'s own write loop, so a 1062
            // here can be a collision on the product's OWN products.sku
            // index, or on either of product_variants' two unique indexes
            // (its cascade writes -- never combination_hash here, but the
            // same table). Disambiguated by the violated index's own name,
            // never assumed to be the product's sku.
            //
            // Phase 4 re-audit finding R-3 (docs/security/derived-column-invariants.md):
            // the product_variants branch below routes through the shared
            // TranslateProductVariantUniqueViolation translator rather than
            // re-matching the two index names inline -- one implementation of
            // "which index was this" for every product_variants.sku writer,
            // not a second one that can drift from it. The translator's
            // ordinary messages (derived_sku_taken / duplicate_combination)
            // are for a NEW variant row; this call site overrides both with
            // parent_sku_change_collides, since here the collision is on a
            // variant SKU re-derived because the PARENT product's own SKU
            // changed, not on a newly-created variant.
            if (($e->errorInfo[1] ?? null) === 1062) {
                if (str_contains($e->getMessage(), 'products_sku_unique')) {
                    throw ValidationException::withMessages([
                        'sku' => trans('validation.unique', ['attribute' => 'sku']),
                    ]);
                }

                if ($e instanceof UniqueConstraintViolationException
                    && (str_contains($e->getMessage(), 'product_variants_sku_unique')
                        || str_contains($e->getMessage(), 'product_variants_product_id_combination_hash_unique'))) {
                    throw ($this->translateProductVariantUniqueViolation)(
                        $e,
                        $sku,
                        overrideMessage: trans('products.variants.parent_sku_change_collides'),
                    );
                }
            }

            throw $e;
        }
    }

    /**
     * D-4.6: a change to the parent product's SKU re-derives every one of
     * its variants, in the SAME transaction as the product update, and
     * re-checks each new value under D-4.5's own fixed lock order. Any
     * single collision aborts the whole update -- this method throws
     * from inside the caller's still-open DB::transaction(), so every
     * write (the product's own SKU included) rolls back with it.
     *
     * Computed and checked for every variant FIRST, written only after
     * every one has passed -- so a collision on variant 3 of 5 leaves
     * variants 1 and 2 untouched rather than partially re-derived.
     */
    private function reDeriveVariantSkus(Product $product, string $newProductSku): void
    {
        $variants = $product->variants()->with('values')->get();

        if ($variants->isEmpty()) {
            return;
        }

        /** @var array<string, string> $newSkus keyed by variant id */
        $newSkus = [];

        foreach ($variants as $variant) {
            $orderedValues = $variant->values->pluck('value')->all();
            // F-1: checked() -- not the bare __invoke() -- so a rename that pushes a derivation
            // over DeriveVariantSku::MAX_LENGTH is refused cleanly here, rather than reaching
            // MySQL as a raw 1406.
            $newSkus[$variant->id] = $this->deriveVariantSku->checked($newProductSku, $orderedValues);
        }

        // F-3's shape, applied here too: assert the batch's own new-SKU set has no internal
        // duplicates BEFORE the database is ever consulted. This is what makes it safe to widen
        // the per-row database pre-check below to exclude the WHOLE batch (Phase 4 re-audit
        // finding R-4) rather than only the row being checked -- a genuine same-batch duplicate is
        // already caught here, so excluding every batch id from the database check below cannot
        // let one slip through. See docs/security/derived-column-invariants.md.
        $duplicatesWithinBatch = array_diff_key($newSkus, array_unique($newSkus));

        if ($duplicatesWithinBatch !== []) {
            throw ValidationException::withMessages([
                'sku' => trans('products.variants.parent_sku_change_collides'),
            ]);
        }

        // R-4: excludes every variant id in THIS batch, not only the row being checked --
        // otherwise a batch that rotates two SKUs between two of its own variants (each ending up
        // with a SKU some OTHER variant in the batch currently holds, but nothing outside it) is
        // wrongly refused as "taken" even though the final state is legal. Safe because the
        // internal-duplicate check above already rules out a genuine within-batch collision.
        $batchVariantIds = array_keys($newSkus);

        foreach ($newSkus as $newSku) {
            $conflict = DB::table('products')
                ->where('sku', $newSku)
                ->where('id', '!=', $product->id)
                ->lockForUpdate()
                ->value('id');

            if ($conflict === null) {
                $conflict = DB::table('product_variants')
                    ->where('sku', $newSku)
                    ->whereNotIn('id', $batchVariantIds)
                    ->lockForUpdate()
                    ->value('id');
            }

            if ($conflict !== null) {
                throw ValidationException::withMessages([
                    'sku' => trans('products.variants.parent_sku_change_collides'),
                ]);
            }
        }

        foreach ($newSkus as $variantId => $newSku) {
            // Query-builder update -- D-13: never the pivot or the hash, only the sku column. Any
            // 1062 that slips past the checks above (a genuine race) propagates out of this
            // transaction to __invoke()'s own outer QueryException catch, which disambiguates it
            // by index name (F-6) rather than misattributing it to the product's own sku.
            DB::table('product_variants')->where('id', $variantId)->update([
                'sku' => $newSku,
                'updated_at' => now(),
            ]);
        }
    }
}
