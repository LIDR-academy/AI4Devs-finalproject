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
