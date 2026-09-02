<?php

namespace App\Actions\Products;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

/**
 * The single writer of `products.featured_media_id` and of every
 * `product_media` row (story 0024, D-9/D-17).
 *
 * Defined, owned and implemented exclusively by this story -- other stories
 * CALL it (today only through CreateProduct / UpdateProduct), they never
 * re-implement it, duplicate it, wrap it in a second pivot writer, or
 * redefine its signature.
 *
 * Deliberately authorizes NOTHING (D-15): it is a collaborator of two
 * actions that have already authorized the whole operation, never an
 * independently-reachable entry point. The reflexive move -- have it
 * authorize `update` on `$product` -- would be wrong and would break the
 * create path: CreateProduct inserts the row and then calls this action
 * inside the same transaction, so `update` would be asked of an actor who
 * legitimately holds only `products.create`, refusing a correct create
 * halfway through. `tests/Feature/Products/ProductAuthorizationTest.php`
 * asserts that no class under `app/` other than CreateProduct/UpdateProduct
 * references this class, which is what makes the missing Gate call
 * structural rather than an oversight. If a later story ever calls this
 * directly, that story owns adding the gate.
 */
class SyncProductGallery
{
    /**
     * Sync a product's featured image and ordered gallery.
     *
     * `$orderedGalleryMediaIds` is the complete, authoritative new order --
     * not a delta. Ids present are the gallery; ids absent are detached.
     * `position` is written as the 0-based array index, rewritten for every
     * surviving row on every call (never `MAX(position) + 1`), so a
     * reorder is expressed as an ordinary re-save with no append-only path.
     * Both the featured-image write and the whole pivot sync happen inside
     * one transaction.
     *
     * @param  list<string>  $orderedGalleryMediaIds  The complete, authoritative gallery in display order.
     */
    public function __invoke(
        Product $product,
        ?string $featuredMediaId,
        array $orderedGalleryMediaIds,
    ): void {
        // A duplicated id in the input array is the caller's bug, not a
        // silent tie -- deduplicate (keeping the first occurrence) before
        // writing, so the composite PK (product_id, media_id) never sees a
        // duplicate and the order stays total.
        $orderedGalleryMediaIds = array_values(array_unique($orderedGalleryMediaIds, SORT_STRING));

        DB::transaction(function () use ($product, $featuredMediaId, $orderedGalleryMediaIds): void {
            // forceFill(): `featured_media_id` is deliberately absent from
            // Product's #[Fillable] list (D-9) -- this action is its one
            // named writer.
            $product->forceFill(['featured_media_id' => $featuredMediaId])->save();

            $pivotData = [];

            foreach ($orderedGalleryMediaIds as $position => $mediaId) {
                $pivotData[$mediaId] = ['position' => $position];
            }

            // sync() detaches every row not present in $pivotData, inserts
            // every id not currently attached, and -- because every kept id
            // still carries a non-empty attributes array -- rewrites
            // `position` on every surviving row too. That full rewrite is
            // what makes a reorder indistinguishable from an ordinary save.
            $product->gallery()->sync($pivotData);
        });
    }
}
