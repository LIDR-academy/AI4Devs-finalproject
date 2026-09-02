<?php

namespace App\Enums;

/**
 * The badge status shown for a product (story 0024, D-7).
 *
 * NEVER persisted, never validated, no column and no cast -- this is the
 * badge type only, returned by App\Models\Product::displayStatus(). It
 * exists as a dedicated enum (rather than a method on ProductStatus, a
 * #[Computed] property on a future Livewire component, or an @if in Blade)
 * so the "out of stock overrides Active only" rule lives in exactly one
 * place a second consumer (PRD assumption 15's low/zero-stock notification)
 * can reuse without restating it.
 *
 * Do not add an `Agotado`/out-of-stock case to App\Enums\ProductStatus even
 * as a display-only mirror of this one -- ProductStatus::cases() feeds a
 * future status <select>, and a case that can never be persisted becomes an
 * option the user can pick and the server then rejects.
 */
enum ProductDisplayStatus: string
{
    case Active = 'active';
    case Draft = 'draft';
    case OutOfStock = 'out_of_stock';

    /**
     * Get the translated, human-readable label for the display status.
     *
     * Active/Draft reuse `products.statuses.*` (their backing values are
     * identical to ProductStatus's own) rather than duplicating those two
     * strings under a second key group -- `products.display_statuses` owns
     * only the one label this enum actually adds, `out_of_stock`.
     */
    public function label(): string
    {
        return match ($this) {
            self::OutOfStock => __('products.display_statuses.out_of_stock'),
            default => __('products.statuses.'.$this->value),
        };
    }
}
