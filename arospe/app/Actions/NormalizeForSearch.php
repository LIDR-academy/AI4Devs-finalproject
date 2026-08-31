<?php

namespace App\Actions;

use Illuminate\Support\Str;

class NormalizeForSearch
{
    /**
     * Normalize a search-comparison value so both the needle a user types and the haystack a
     * resolver matches against fold identically, everywhere in the app.
     *
     * Exact behaviour, in this order (see decision D13 in story 0022's task file):
     * 1. `trim()` — strip leading/trailing whitespace.
     * 2. `Str::lower()` — mb-safe lowercasing, applied BEFORE accent/diacritic folding.
     * 3. `Str::ascii()` — accent/diacritic folding. Deliberately never `Str::transliterate()`:
     *    that call's default `$unknown = '?'` injects a literal `?` for any unmappable character
     *    (breaking a search term) and romanizes CJK, re-introducing uppercase after step 2 has
     *    already run. `Str::ascii()` silently drops what it cannot map, which is correct here.
     * 4. `preg_replace('/\s+/u', ' ', …)` — collapse internal whitespace runs to a single space.
     *
     * No consumer may reimplement lowercasing, accent-stripping, trimming or whitespace collapsing
     * inline — both sides of every search comparison must route through this one class.
     */
    public function __invoke(string $value): string
    {
        return (string) preg_replace(
            '/\s+/u',
            ' ',
            Str::ascii(Str::lower(trim($value)))
        );
    }
}
