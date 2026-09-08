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
 * MATCHING (Phase 4 finding F-4, corrected): the assigned-region match is a
 * direct `$product->salesRegions()->whereKey(...)` query against the
 * pivot, never a lookup against an in-memory `$product->salesRegions`
 * collection. An earlier version called `$product->loadMissing('salesRegions')`
 * and then searched the loaded collection -- `loadMissing()` is a no-op the
 * moment a caller has already loaded ANY version of the relation,
 * including one CONSTRAINED by a closure
 * (`Product::with(['salesRegions' => fn ($q) => $q->active()])`), which
 * would silently make a since-deactivated-but-still-assigned region
 * disappear from the match and produce the WRONG rate -- directly
 * defeating D6's guarantee that a disabled-but-assigned region keeps
 * deciding the rate. A direct per-call query is correct regardless of what
 * the caller eager-loaded, because it ignores any constraint a prior
 * `with()` call applied to the relation and always asks the pivot table
 * itself. The tradeoff, stated rather than hidden: this reopens the N+1
 * cost this docblock used to advise callers to avoid via eager-loading --
 * resolving many products in one request now pays one query per product
 * for this step regardless of what was eager-loaded, because eager-loading
 * can no longer be trusted to short-circuit it safely. Correctness was
 * judged the higher priority here: a resolver that occasionally returns
 * the wrong tax rate is a worse failure than a resolver that is one query
 * more expensive per call. A caller resolving many products in one request
 * still SHOULD eager-load `Product::with('salesRegions')` (unconstrained)
 * to warm Eloquent's query log / connection reuse, but must not rely on it
 * to avoid the query this method issues.
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
        $assignedRegion = $product->salesRegions()->whereKey($destination->id)->first();

        if ($assignedRegion !== null) {
            return new ResolvedTaxRate($assignedRegion->rate, $assignedRegion, TaxRateResolutionTier::AssignedRegion);
        }

        // Deterministic tiebreak (Phase 4 finding F-5): nothing in the
        // database enforces at-most-one `is_default` row (see
        // docs/database/schema.md's ⚠️ on sales_regions), so an unordered
        // `first()` could silently return a different row across requests
        // if that invariant is ever violated. `oldest('created_at')` then
        // `orderBy('id')` (a tiebreak for two rows sharing a timestamp) is
        // a deterministic ordering, not a fix for the underlying
        // invariant -- this deliberately does not attempt to detect or
        // reject a duplicate default, only to answer consistently if one
        // exists.
        $default = SalesRegion::query()
            ->where('is_default', true)
            ->oldest('created_at')
            ->orderBy('id')
            ->first();

        if ($default === null) {
            throw new NoDefaultSalesRegionException(
                'No Sales Region entry is flagged as the catalog default -- the catalog invariant story 0017 guarantees has been violated.'
            );
        }

        return new ResolvedTaxRate($default->rate, $default, TaxRateResolutionTier::CatalogDefault);
    }
}
