<?php

namespace App\Actions\Products;

use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * The single definition of a variant SKU's derivation (story 0029, D-4.1 /
 * D-4.4): a pure function of the parent product's SKU and its attribute
 * values, with no dependencies and no side effects -- same folder/naming
 * reasoning as HashVariantCombination, never `new`-ed.
 *
 * The PO's rule names exactly one transformation -- spaces become hyphens,
 * casing is preserved verbatim. Everything else `segment()` does is the
 * minimum needed to keep the result a usable identifier.
 */
class DeriveVariantSku
{
    /**
     * 0024's `products.sku` is `string(64)`; this column is `string(128)`
     * on purpose (D-4.4) -- the derivation's inputs are not directly
     * controlled by the administrator, so there is no field to shorten.
     */
    public const MAX_LENGTH = 128;

    /**
     * One attribute value, rendered as one SKU segment. Casing is
     * preserved on purpose (the PO's rule).
     */
    public function segment(string $value): string
    {
        $ascii = Str::ascii(trim($value));                          // 'Marrón' -> 'Marron'
        $hyphenated = (string) preg_replace('/\s+/u', '-', $ascii); // the PO's rule; a run collapses to one
        $safe = (string) preg_replace('/[^A-Za-z0-9._\/-]/', '', $hyphenated);

        return trim((string) preg_replace('/-{2,}/', '-', $safe), '-');
    }

    /**
     * @param  array<int, string>  $orderedValues  value STRINGS read back from the DB, in D-4.2 order
     */
    public function __invoke(string $productSku, array $orderedValues): string
    {
        return collect($orderedValues)
            ->map(fn (string $v): string => $this->segment($v))
            ->prepend($productSku)
            ->implode('-');
    }

    /**
     * Derive AND validate a variant SKU, in one seam every writer of
     * `product_variants.sku` shares -- the fix for Phase 4 findings F-1/F-2
     * (docs/security/derived-column-invariants.md). `CreateProductVariant`
     * originally carried these two checks inline; `UpdateProduct`'s and
     * `SyncProductAttributeValues`' re-derivation cascades carried neither,
     * so a rename could silently truncate (a raw 1406) or store a
     * trailing-hyphen SKU for a value that reduces to the empty string. Both
     * checks now live here, once, so no writer can call the derivation and
     * skip them.
     *
     * @param  array<int, string>  $orderedValues  value STRINGS read back from the DB, in D-4.2 order
     *
     * @throws ValidationException on `sku` -- an empty-segment value, or a derivation over MAX_LENGTH
     */
    public function checked(string $productSku, array $orderedValues): string
    {
        // D-4.4: a value that reduces entirely to the empty string is refused loudly -- silently
        // dropping it would derive a different, colliding variant's SKU (or, on a rename, a
        // silent trailing-hyphen SKU nobody asked for).
        foreach ($orderedValues as $value) {
            if ($this->segment($value) === '') {
                throw ValidationException::withMessages([
                    'sku' => trans('products.variants.derived_sku_empty_segment', ['value' => $value]),
                ]);
            }
        }

        $sku = $this($productSku, $orderedValues);

        if (mb_strlen($sku) > self::MAX_LENGTH) {
            throw ValidationException::withMessages([
                'sku' => trans('products.variants.derived_sku_too_long', ['max' => self::MAX_LENGTH]),
            ]);
        }

        return $sku;
    }
}
