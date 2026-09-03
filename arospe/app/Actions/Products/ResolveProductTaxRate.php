<?php

namespace App\Actions\Products;

use App\Enums\TaxRateResolutionTier;
use App\Exceptions\NoDefaultSalesRegionException;
use App\Models\Product;
use App\Models\SalesRegion;

/**
 * Answers "what tax rate applies to this product at this destination"
 * (story 0026, PRD §2.2/§2.1/§3.2).
 *
 * Exactly two tiers, with no third. Since supranational groupings no
 * longer exist in the catalog (D10), the destination's id is matched
 * against the product's own assigned entries -- individual countries and
 * Spain's fiscal sub-territories, the only two kinds the catalog holds --
 * and falls back to the catalog default when nothing matches. There is no
 * grouping-tier step and no membership inference of any kind, and no
 * ancestor walk in either direction (D4): assigning a fiscal territory
 * does not cover its parent, and assigning a parent does not cover its
 * fiscal territories.
 *
 * The resolver never invents a rate and never substitutes another entry's
 * (D5): once an entry wins, its own `rate` is the answer verbatim --
 * `null` and `'0.000'` both honoured, neither falling through to the
 * default tier and neither becoming a fabricated `0`.
 *
 * The destination arrives already resolved to a catalog row. Address ->
 * region mapping is Epic 3's, and this story's scope fence excludes it --
 * this action performs no geolocation and no address parsing.
 *
 * It calls `$product->loadMissing('salesRegions')` as a correctness net.
 * A caller resolving many products in one request must eager-load
 * `Product::with('salesRegions')` up front or pay a query per product --
 * the same hazard-flagging posture 0024 takes at R-9 rather than solving a
 * problem this story does not own.
 *
 * It self-authorizes nothing (0024's RQ-10 convention): it is a pure read
 * of values already visible to anyone holding `products.view` or
 * `sales-regions.view`, and it discloses nothing new. Epic 3 may call it
 * from an order pipeline with no acting user at all.
 */
class ResolveProductTaxRate
{
    public function __invoke(Product $product, SalesRegion $destination): ResolvedTaxRate
    {
        $product->loadMissing('salesRegions');

        $assignedRegion = $product->salesRegions->firstWhere('id', $destination->id);

        if ($assignedRegion !== null) {
            return new ResolvedTaxRate($assignedRegion->rate, $assignedRegion, TaxRateResolutionTier::AssignedRegion);
        }

        $default = SalesRegion::query()->where('is_default', true)->first();

        if ($default === null) {
            throw new NoDefaultSalesRegionException(
                'No Sales Region entry is flagged as the catalog default -- the catalog invariant story 0017 guarantees has been violated.'
            );
        }

        return new ResolvedTaxRate($default->rate, $default, TaxRateResolutionTier::CatalogDefault);
    }
}
