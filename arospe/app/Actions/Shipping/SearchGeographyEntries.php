<?php

namespace App\Actions\Shipping;

use App\Enums\GeographyLevel;
use App\Exceptions\UnresolvedSelectionException;
use App\Livewire\Components\MultiSelectOptionsResolver;
use App\Models\GeographyEntry;

/**
 * Story 0034's `MultiSelectOptionsResolver` implementation for the shipping
 * zone geography picker (D-4).
 *
 * `search()` runs THREE bounded per-level queries -- one per
 * `App\Enums\GeographyLevel` case -- each shaped
 * `WHERE level = ? AND normalized_name LIKE 'term%' LIMIT ?`, rather than one
 * open `LIKE` across the whole table. This is not a style choice: story
 * 0032's `geography_entries` table ships `INDEX(level, normalized_name)`
 * with `level` as the LEADING column specifically for this shape -- a query
 * with no equality predicate on `level` cannot range-scan `normalized_name`
 * at all and degrades to a full ~8,300-row scan on every keystroke-burst.
 *
 * `$term` arrives ALREADY NORMALIZED -- `App\Livewire\Components\
 * SearchableMultiSelect::updatedSearch()` folds it through
 * `App\Actions\NormalizeForSearch` before ever calling this resolver, and
 * `geography_entries.normalized_name` is folded by the SAME class at seed
 * time (story 0032). This class therefore contains NO normalization logic
 * of its own -- no inlined `Str::lower()`, `iconv()` or accent map -- both
 * sides of the comparison are already folded before they ever reach here.
 *
 * `LIKE 'term%'`, prefix-anchored, never `'%term%'` -- a leading wildcard
 * cannot use the index either, defeating the whole point (OQ-B, accepted
 * product consequence: "lava" does not find "Torrelavega").
 *
 * Merge order is broad-to-narrow (Country, Community, Municipality), each
 * query receiving the FULL `$limit` (never `$limit / 3` -- dividing it
 * would starve a level matching more than its share), then the merged set
 * is truncated to `$limit`.
 *
 * AUTHORIZATION: per `MultiSelectOptionsResolver`'s own docblock, a real
 * implementation must authorize itself if the underlying data is not
 * uniformly visible to every authenticated user. No `Gate` call is added
 * here, deliberately: the geography catalog is read-only, seeded reference
 * data (country/comunidad-autónoma/municipio names) with no per-row
 * sensitivity, the identical reasoning `App\Actions\Products\
 * SearchSalesRegions` and `App\Actions\Products\ResolveProductTaxRate`
 * already give for the same omission.
 */
class SearchGeographyEntries implements MultiSelectOptionsResolver
{
    /**
     * @return array<int, array{id: string, label: string, group: string|null, disabled: bool}>
     */
    public function search(string $term, int $limit): array
    {
        // The interface's own contract requires escaping the term's LIKE
        // wildcard characters before interpolating it, rather than matching
        // the normalized term raw -- App\Models\Media::search() already
        // establishes this exact escaping shape for the same reason.
        $escaped = addcslashes($term, '%_\\');

        $merged = [];

        foreach ([GeographyLevel::Country, GeographyLevel::Community, GeographyLevel::Municipality] as $level) {
            $entries = GeographyEntry::query()
                ->where('level', $level->value)
                ->where('normalized_name', 'like', $escaped.'%')
                ->orderBy('normalized_name')
                ->limit($limit)
                ->get();

            foreach ($entries as $entry) {
                $merged[] = $this->toOption($entry);
            }
        }

        return array_slice($merged, 0, $limit);
    }

    /**
     * TOTAL FUNCTION (D-12): returns exactly one option per requested id, or
     * throws `UnresolvedSelectionException` naming every id it could not
     * resolve -- never a short array. No term and no level filter: a
     * currently-assigned entry must stay resolvable regardless of whether it
     * still matches anything the administrator is searching for right now.
     *
     * @param  array<int, string>  $ids
     * @return array<int, array{id: string, label: string, group: string|null, disabled: bool}>
     *
     * @throws UnresolvedSelectionException when any id cannot be resolved
     */
    public function resolveSelected(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        $entries = GeographyEntry::query()->whereKey($ids)->get()->keyBy(
            fn (GeographyEntry $entry): string => (string) $entry->id
        );

        $missingIds = array_values(array_diff(
            array_map(strval(...), $ids),
            $entries->keys()->all()
        ));

        if ($missingIds !== []) {
            throw new UnresolvedSelectionException($missingIds);
        }

        return collect($ids)
            ->map(fn (string $id): array => $this->toOption($entries->get((string) $id)))
            ->values()
            ->all();
    }

    /**
     * @return array{id: string, label: string, group: string|null, disabled: bool}
     */
    private function toOption(GeographyEntry $entry): array
    {
        // D-4: a municipio's label carries its province, so two same-named
        // municipios in different provinces are distinguishable -- the
        // concrete payoff of story 0032 keeping `province_name` denormalized
        // on municipio rows.
        $label = $entry->level === GeographyLevel::Municipality && $entry->province_name !== null
            ? "{$entry->name} ({$entry->province_name})"
            : $entry->name;

        return [
            'id' => (string) $entry->id,
            'label' => $label,
            'group' => $entry->level->label(),
            // Always false (D-4): marking an entry unavailable because
            // another zone already covers it would contradict story 0033's
            // D-2 -- overlap between zones is allowed, deliberately.
            'disabled' => false,
        ];
    }
}
