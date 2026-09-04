<?php

namespace App\Actions\Products;

use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Validation\ValidationException;

/**
 * Disambiguates a `UniqueConstraintViolationException` raised against
 * `product_variants` between its two unique indexes
 * (`product_variants_sku_unique` vs
 * `product_variants_product_id_combination_hash_unique`), translating it
 * into the matching clean ValidationException rather than letting a raw
 * database error surface (R-F). Extracted from
 * `CreateProductVariant::translateRaceViolation()` (Phase 4 finding F-1/F-3,
 * docs/security/derived-column-invariants.md) so every writer of
 * `product_variants.sku` -- the creating writer AND its two re-derivation
 * cascades -- shares one disambiguation instead of re-deriving it.
 *
 * No dependencies: a plain, container-resolved, stateless translator, same
 * shape as DeriveVariantSku/HashVariantCombination.
 */
class TranslateProductVariantUniqueViolation
{
    /**
     * @param  string  $sku  the new SKU value the caller was trying to write -- interpolated
     *                       into the default `derived_sku_taken` message only; ignored when
     *                       `$overrideMessage` is given.
     * @param  string|null  $overrideMessage  Phase 4 re-audit finding R-3: UpdateProduct's own
     *                                        cascade (a PARENT product SKU change re-deriving its variants) needs
     *                                        a different message than a newly-created variant does for the SAME two
     *                                        indexes -- `products.variants.parent_sku_change_collides` rather than
     *                                        `derived_sku_taken`/`duplicate_combination` -- and always under the
     *                                        `sku` key regardless of which index was hit, since from that caller's
     *                                        point of view both indexes mean "the parent's new SKU collides with an
     *                                        existing variant SKU". Passing this reuses the index-name-matching
     *                                        below without reusing the two ordinary messages, so there is still one
     *                                        implementation of "which index was this".
     */
    public function __invoke(UniqueConstraintViolationException $e, string $sku, ?string $overrideMessage = null): ValidationException
    {
        if (str_contains($e->getMessage(), 'product_variants_sku_unique')) {
            return ValidationException::withMessages([
                'sku' => $overrideMessage ?? trans('products.variants.derived_sku_taken', ['sku' => $sku]),
            ]);
        }

        if (str_contains($e->getMessage(), 'product_variants_product_id_combination_hash_unique')) {
            if ($overrideMessage !== null) {
                return ValidationException::withMessages(['sku' => $overrideMessage]);
            }

            return ValidationException::withMessages([
                'combination' => trans('products.variants.duplicate_combination'),
            ]);
        }

        throw $e;
    }
}
