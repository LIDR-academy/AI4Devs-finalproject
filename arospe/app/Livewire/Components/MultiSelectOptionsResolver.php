<?php

namespace App\Livewire\Components;

use App\Exceptions\UnresolvedSelectionException;

/**
 * Story 0022 (searchable, server-side-filtered multi-select component), decision D1. The whole
 * integration surface a consumer (0026/0027/0034) implements: a class-string passed to
 * App\Livewire\Components\SearchableMultiSelect's `optionResolver` prop, resolved server-side
 * with `app($optionResolver)`. See D2 for why this is two methods rather than one.
 */
interface MultiSelectOptionsResolver
{
    /**
     * Options matching $term, capped at $limit.
     *
     * $term arrives ALREADY NORMALIZED by App\Actions\NormalizeForSearch (D13) — lowercased,
     * accent-folded, trimmed, internal whitespace collapsed. The implementation MUST fold the
     * haystack side with that same utility (or match a column already stored folded); comparing
     * a folded needle against an unfolded haystack silently matches nothing.
     *
     * Two things this shell deliberately does NOT do on the implementer's behalf (Phase 4
     * finding F-8), because it owns no table and no domain knowledge (D7):
     *
     * - **Authorization.** This shell ships no `Gate::authorize()` call of its own — the
     *   resolver is the ONLY place row-level authorization for this data can live. A real
     *   implementation MUST perform its own authorization (e.g. scope the query to what the
     *   acting user may see, or `Gate::authorize('viewAny', ...)` before querying) if the
     *   underlying data is not uniformly visible to every authenticated user.
     * - **`LIKE`-wildcard escaping.** If the implementation matches $term against a `LIKE`
     *   query, it MUST escape the term's own `%`/`_`/`\` wildcard characters before
     *   interpolating it — the way `App\Models\Media::search()` already does with
     *   `addcslashes($term, '%_\\')` — rather than interpolating the normalized term raw.
     *
     * @return array<int, array{id: string, label: string, group: string|null, disabled: bool}>
     */
    public function search(string $term, int $limit): array;

    /**
     * Authoritative labels for ids that are already selected, independent of any search term.
     *
     * TOTAL FUNCTION (D12): returns exactly one entry per requested id, or throws. It MUST NOT
     * return a short array — an id it cannot vouch for is an error to be reported, never an
     * entry to omit.
     *
     * @param  array<int, string>  $ids
     * @return array<int, array{id: string, label: string, group: string|null, disabled: bool}>
     *
     * @throws UnresolvedSelectionException when any id cannot be resolved
     */
    public function resolveSelected(array $ids): array;
}
