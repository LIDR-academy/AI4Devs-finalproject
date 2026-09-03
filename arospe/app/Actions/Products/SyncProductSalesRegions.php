<?php

namespace App\Actions\Products;

use App\Models\Product;

/**
 * The single named writer of the `product_sales_region` pivot (story 0026).
 *
 * Shaped like -- but in no way calling, wrapping, extending or owning --
 * `App\Actions\Products\SyncProductGallery` (story 0024). Sales-region
 * assignment only; product media is entirely out of this story's scope.
 *
 * `sync()`, not `attach()`: the caller always submits the complete new set
 * (0027's picker is edit-form shaped -- "assign the product to these
 * regions" names the whole set), so `attach()`-only growth would make
 * deselecting a region in the picker silently do nothing.
 *
 * Deliberately authorizes NOTHING (D8), matching `SyncProductGallery`
 * exactly and for the identical structural reason: it is a collaborator
 * invoked only inside an already-authorized transaction, never an
 * independently-reachable entry point. `tests/Feature/Products/
 * ProductSalesRegionAssignmentTest.php` asserts that no class under app/,
 * database/ or routes/ other than this file references it, which is what
 * makes the missing Gate call structural rather than an oversight -- if a
 * later story ever calls this directly, that story owns adding the gate.
 *
 * Must be safe to call inside a caller-opened transaction, and must not
 * open its own (D13): it performs one `sync()` and lets every exception
 * escape -- no `try`/`catch`, no `DB::transaction()` wrapper of its own.
 * Atomicity across the product's core-field update AND this sync is the
 * orchestrator's obligation (story 0027), not this action's.
 */
class SyncProductSalesRegions
{
    /**
     * Sync a product's Sales Region assignments.
     *
     * `$salesRegionIds` is the complete, authoritative new set -- not a
     * delta. Ids present are the assignment; ids absent are detached. An
     * empty array clears every assignment and does not throw -- a product
     * assigned to no region is a legitimate business state (it resolves to
     * the catalog default).
     *
     * @param  array<int, string>  $salesRegionIds
     */
    public function __invoke(Product $product, array $salesRegionIds): void
    {
        $product->salesRegions()->sync($salesRegionIds);
    }
}
