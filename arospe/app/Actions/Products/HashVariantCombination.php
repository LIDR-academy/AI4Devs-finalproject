<?php

namespace App\Actions\Products;

/**
 * The single definition of a variant combination's hash (story 0029, D-3):
 * a pure function of a set of attribute-value ids, with no dependencies and
 * no side effects -- filed under `app/Actions/Products/` rather than
 * `app/Support/` (which would be an unapproved new base folder) and never
 * `new`-ed, per code-style.md's per-method action-injection convention.
 *
 * It exists only so "no two variants of a product share a combination" is a
 * database invariant (`unique(product_id, combination_hash)`), never read
 * for meaning, never joined, never rendered.
 */
class HashVariantCombination
{
    /**
     * 🔴 The ids passed here MUST already be read back from the database,
     * never taken from a client payload (V-10): `utf8mb4_unicode_ci` makes
     * `Rule::exists()` case-insensitive, so a submitted `V-40` validates
     * against a stored `v-40` while hashing differently -- a case-varied
     * payload would pass every validation rule and still produce a genuine
     * duplicate combination.
     *
     * `SORT_STRING` is explicit because PHP's default `sort()` flags
     * compare numeric-looking strings numerically; `'|'` rather than `','`
     * because it cannot occur in a UUID.
     *
     * @param  array<int, string>  $productAttributeValueIds  ids ALREADY READ BACK FROM THE DATABASE
     */
    public function __invoke(array $productAttributeValueIds): string
    {
        $canonical = collect($productAttributeValueIds)->unique()->sort(SORT_STRING)->values()->implode('|');

        return hash('sha256', $canonical);
    }
}
