<?php

namespace App\Actions\Products;

use App\Enums\TaxRateResolutionTier;
use App\Models\SalesRegion;

/**
 * The answer to "what tax rate applies to this product at this
 * destination" (story 0026, D9). Placed beside its only producer,
 * `App\Actions\Products\ResolveProductTaxRate`, rather than in a new
 * `app/DataTransferObjects/` folder -- project `CLAUDE.md` forbids new base
 * folders without approval, and `app/Actions/Products/` is already
 * sanctioned.
 */
final readonly class ResolvedTaxRate
{
    public function __construct(
        /**
         * decimal:3 STRING, or null == the winning entry is unconfigured.
         * Never `?float` -- `sales_regions.rate` casts `decimal:3`, which
         * returns a string, and typing it `float` is the single likeliest
         * silent bug in this story.
         */
        public ?string $rate,
        /** Which entry decided the answer. */
        public SalesRegion $region,
        public TaxRateResolutionTier $tier,
    ) {}
}
