<?php

namespace App\Enums;

/**
 * A product's persisted publication status (story 0024, D-6/D-7).
 *
 * Exactly two cases -- Active and Draft. "Agotado" (out of stock) is
 * deliberately NOT a case here: it is computed from `stock` at read time by
 * App\Models\Product::displayStatus(), never stored, never validated, never
 * a value this enum can produce. Do not add a third case, under any
 * circumstance (D-7, confirmed Phase 0 decision) -- see
 * App\Enums\ProductDisplayStatus for the badge type that layer belongs to.
 *
 * Defaults to Draft (the `products.status` column default) as a fail-closed
 * safety net for any path that omits it (a factory, a seeder, a future
 * import) -- the happy-path create always passes one explicitly, and
 * `draft` can never accidentally publish anything.
 */
enum ProductStatus: string
{
    case Active = 'active';
    case Draft = 'draft';

    /**
     * Get the translated, human-readable label for the status.
     */
    public function label(): string
    {
        return __('products.statuses.'.$this->value);
    }
}
