<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

/**
 * Shared validation rules for the product variant sub-domain (story 0029,
 * D-16). Flat, single-concern, `use`s no other trait -- and deliberately
 * does NOT `use ProductValidationRules`: doing so would put
 * `productSkuRules()` in reach of a caller that must never validate a SKU,
 * since a variant's SKU is derived, never typed (D-4.3). There is
 * therefore no `skuRules()`/`variantSkuRules()` method here at all.
 *
 * Every leaf method is entity-prefixed (`variant...`), matching 0024's
 * `ProductValidationRules` naming trap: a variant editor composing this
 * alongside `ProductValidationRules` would otherwise fatal on a duplicate
 * `priceRules()`/`stockRules()`/`featuredMediaIdRules()` method name.
 */
trait ProductVariantValidationRules
{
    /**
     * Get the validation rules used to validate the combination array
     * itself (D-16.1 pass 1 -- shape and bound ALONE, no rule that touches
     * the database).
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function variantCombinationRules(): array
    {
        return ['required', 'array', 'min:1', 'max:10'];
    }

    /**
     * Get the validation rules used to validate each submitted attribute
     * value id (D-16.1 pass 2). `Rule::exists()` here is a first pass,
     * never the authority -- V-10's read-back in
     * App\Actions\Products\CreateProductVariant is what actually decides
     * both the hash and the SKU derivation, since `utf8mb4_unicode_ci`
     * makes this rule case-insensitive.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function variantCombinationValueRules(): array
    {
        return ['string', 'distinct', Rule::exists('product_attribute_values', 'id')];
    }

    /**
     * Get the validation rules used to validate a variant's price --
     * 0024's `productPriceRules()` verbatim.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function variantPriceRules(): array
    {
        return ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'];
    }

    /**
     * Get the validation rules used to validate a variant's stock level --
     * 0024's `productStockRules()` verbatim. `min:0` is the app-level
     * statement of the invariant D-6 deliberately keeps out of the DDL
     * (`stock` is a signed column).
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function variantStockRules(): array
    {
        return ['required', 'integer', 'min:0'];
    }

    /**
     * Get the validation rules used to validate a variant's own featured
     * image.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function variantFeaturedMediaIdRules(): array
    {
        return ['nullable', 'string', Rule::exists('media', 'id')];
    }

    /**
     * Get the validation rules used to validate the generator's selected
     * attribute-type array itself (0029b, D-G8 pass 1 -- shape and bound
     * ALONE, no rule that touches the database). `max:5` is a sanity bound
     * one level up from the batch cap (D-G5): five types of four values
     * each is already 1,024 combinations, so the cap is what actually
     * refuses that.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function variantAttributeTypeIdsRules(): array
    {
        return ['required', 'array', 'min:1', 'max:5'];
    }

    /**
     * Get the validation rules used to validate each submitted attribute
     * type id (0029b, D-G8 pass 2). `Rule::exists()` here is a first pass,
     * never the authority -- the generator's own value-set read is what
     * actually decides the cartesian product. `uuid` bounds each element's
     * own length/format before it ever reaches a query binding -- max:5
     * bounds how MANY ids may be submitted, not how large any one of them
     * is.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function variantAttributeTypeIdRules(): array
    {
        return ['string', 'uuid', 'distinct', Rule::exists('product_attribute_types', 'id')];
    }
}
