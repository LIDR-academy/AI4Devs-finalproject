<?php

namespace App\Actions\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Concerns\ProductValidationRules;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UpdateProduct
{
    use ProductValidationRules;

    /**
     * Constructor injection -- see CreateProduct's identical rationale. Three
     * collaborators, not two.
     */
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly SyncProductGallery $syncProductGallery,
        private readonly SanitizeProductDescription $sanitizeProductDescription,
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

                return $product;
            });
        } catch (QueryException $e) {
            // 1062 = MySQL ER_DUP_ENTRY -- see CreateProduct's identical
            // catch for why SQLSTATE 23000 alone is too broad here (Phase 4
            // audit finding F-2): this transaction also carries three other
            // FKs, so a race on one of them must not be misreported as
            // "the sku is taken".
            if (($e->errorInfo[1] ?? null) === 1062) {
                throw ValidationException::withMessages([
                    'sku' => trans('validation.unique', ['attribute' => 'sku']),
                ]);
            }

            throw $e;
        }
    }
}
