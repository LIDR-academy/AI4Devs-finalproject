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

class CreateProduct
{
    use ProductValidationRules;

    /**
     * Constructor injection, not method injection: __invoke()'s domain
     * arguments are this action's whole public signature, matched verbatim
     * by every direct-call test, so all three collaborators are resolved
     * from the container without widening that signature (code-style.md's
     * constructor-injection exception).
     */
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly SyncProductGallery $syncProductGallery,
        private readonly SanitizeProductDescription $sanitizeProductDescription,
    ) {}

    /**
     * Create a new product.
     *
     * Authorizes `create` on `Product::class` as its own first statement
     * (D-15, reversed at the split) -- before any transaction opens -- so a
     * future Artisan command, queued job or REST controller inherits the
     * same refusal the dashboard will get. `targetType: 'product'` is
     * passed explicitly, since LogRefusedPrivilegedAttempt::resolveTarget()
     * auto-resolves only User and Role instances/classes.
     *
     * The SKU is canonicalised (upper-cased, trimmed) BEFORE validation and
     * again before persistence (D-11), so the uniqueness rule always
     * compares like-for-like against what is actually stored. `name` is
     * trimmed the same way, before `required` is ever asked, so a
     * whitespace-only value is refused rather than silently accepted
     * (R-6).
     *
     * The row is built from a literal whitelist via `Product::forceCreate()`,
     * never a spread of validated input: `Model::preventSilentlyDiscardingAttributes()`
     * is not enabled anywhere in this app, so if `status` were ever dropped
     * from `#[Fillable]`, a plain `create()` would silently discard it and
     * the row would fall back to the column default instead of raising an
     * error (R-5) -- the literal whitelist is what a future removal from
     * `#[Fillable]` would fail loudly against instead.
     *
     * `$featuredMediaId` and `$orderedGalleryMediaIds` carry NO defaults
     * (Phase 4 audit finding F-1), matching `SyncProductGallery`'s own
     * contract (D-17): its array is the complete, authoritative gallery,
     * never a delta, so a caller omitting these two would otherwise
     * silently wipe an existing gallery and null the featured image with
     * no error. A new product genuinely starts with neither, but the
     * signature is kept symmetric with `UpdateProduct`'s rather than
     * quietly relying on "this one is harmless" -- the whole point is that
     * a caller must always state intent.
     *
     * Media membership (`$featuredMediaId` / `$orderedGalleryMediaIds`) is
     * gated on `products.*` alone, deliberately -- neither this action nor
     * `productFeaturedMediaIdRules()`/`productGalleryMediaIdsRules()`
     * checks `media.view`. The media library is a shared, non-per-user
     * resource by PRD design, so an actor holding `products.create` may
     * attach any existing media row without also needing a media-module
     * permission; that is a recorded product decision, not a gap for a
     * future story to close unilaterally.
     *
     * `$description` keeps its `null` default here (unlike `UpdateProduct`,
     * Phase 4 re-audit finding F-6, which dropped it) -- a brand-new product
     * genuinely starts with no description, so omission and "no description"
     * are the same state on create, which is not true on update.
     *
     * @param  list<string>  $orderedGalleryMediaIds
     */
    public function __invoke(
        string $name,
        string $sku,
        ?string $productCategoryId,
        ?string $type,
        ?string $status,
        mixed $price,
        mixed $stock,
        ?string $featuredMediaId,
        array $orderedGalleryMediaIds,
        ?string $description = null,
    ): Product {
        $this->logRefusedPrivilegedAttempt->authorize('create', Product::class, targetType: 'product');

        $name = trim($name);
        $sku = Str::upper(trim($sku));
        // 0024a D-16/D-A1: sanitize BEFORE validating, so max:65535 measures the
        // stored value rather than markup the sanitizer is about to remove, and
        // reassign $description so both the Validator::make() array below and the
        // DB::transaction() closure further down read the sanitized value.
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
            $this->productRules(),
        )->validate();

        // Guaranteed non-null by the `required` + Rule::enum() rules above;
        // the (string) cast is for the static analyser, which does not
        // track that validate() throws before this line is ever reached
        // with a null value.
        $resolvedType = ProductType::from((string) $type);
        $resolvedStatus = $status === null ? ProductStatus::Draft : ProductStatus::from($status);

        try {
            // attempts: 3 (Phase 4 re-audit finding F-5) -- this transaction's own D-4.5 comment
            // already states the design intent ("a concurrent writer... deadlocks (1213,
            // retryable)"), but Laravel only retries causedByConcurrencyError() when
            // $attempts > 1. A ValidationException is not a concurrency error and propagates
            // unaffected on the first attempt.
            return DB::transaction(function () use (
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
                // `product_variants` -- a product may not claim a string some variant already
                // derived. ALWAYS this order -- products, then product_variants -- so a
                // concurrent writer claiming the same string on either table deadlocks (1213,
                // retryable) rather than corrupting the invariant.
                $conflict = DB::table('products')->where('sku', $sku)->lockForUpdate()->value('id');

                if ($conflict === null) {
                    $conflict = DB::table('product_variants')->where('sku', $sku)->lockForUpdate()->value('id');
                }

                if ($conflict !== null) {
                    throw ValidationException::withMessages([
                        'sku' => trans('validation.unique', ['attribute' => 'sku']),
                    ]);
                }

                $product = Product::forceCreate([
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
            }, attempts: 3);
        } catch (QueryException $e) {
            // 1062 = MySQL ER_DUP_ENTRY. SQLSTATE 23000 alone is too broad
            // here (Phase 4 audit finding F-2): this transaction also
            // carries three other FKs (product_category_id,
            // featured_media_id, and every product_media row), so a race
            // where a referenced category/media row is deleted between
            // Rule::exists() validation and this INSERT would raise a
            // genuine FK violation (also SQLSTATE 23000) that must not be
            // misreported as "the sku is taken".
            if (($e->errorInfo[1] ?? null) === 1062) {
                // The unique index is the last-word RACE guard behind the
                // validation rule above, not the primary defence (D-11) --
                // converted to the same clean ValidationException shape
                // App\Actions\Users\CreateUser already uses for `email`.
                throw ValidationException::withMessages([
                    'sku' => trans('validation.unique', ['attribute' => 'sku']),
                ]);
            }

            throw $e;
        }
    }
}
