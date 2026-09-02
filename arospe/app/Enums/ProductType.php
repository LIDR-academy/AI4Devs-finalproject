<?php

namespace App\Enums;

/**
 * A product's physical/virtual type (story 0024, D-5).
 *
 * Enum column, not a lookup table: behaviour hangs off this value (PRD
 * §3.2 — a physical order resolves its tax Sales Region from the shipping
 * address, a virtual one from the billing address after an IP-geo match).
 * Required at every layer with NO default anywhere — physical and virtual
 * are equally wrong guesses, so an omission must fail loudly rather than
 * silently guess. This enum deliberately exposes no default-returning
 * helper method, which is the enum-level half of that guarantee.
 */
enum ProductType: string
{
    case Physical = 'physical';
    case Virtual = 'virtual';

    /**
     * Get the translated, human-readable label for the type.
     */
    public function label(): string
    {
        return __('products.types.'.$this->value);
    }
}
