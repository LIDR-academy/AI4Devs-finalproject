<?php

namespace App\Actions\Products;

use App\Actions\NormalizeForSearch;
use App\Exceptions\UnresolvedSelectionException;
use App\Livewire\Components\MultiSelectOptionsResolver;
use App\Models\SalesRegion;

/**
 * Story 0022's `MultiSelectOptionsResolver` implementation for the Sales
 * Region picker (story 0026). `search()` and `resolveSelected()`
 * deliberately answer different questions (D7) -- conflating them is this
 * story's sharpest trap, and getting it wrong silently deletes data.
 *
 * `search()` offers only `assignable()` entries -- active, and not a
 * heading over fiscal territories -- matched against the entry's own name
 * AND its parent's name, which is what makes "selecting Spain surfaces its
 * fiscal sub-entries" fall out with no extra mechanism: typing "España"
 * returns the five territories, and "España" itself is simply absent.
 *
 * `resolveSelected()` vouches for every currently-assigned id regardless
 * of `is_active`/children (D7), marking a no-longer-assignable one
 * `disabled: true` rather than silently dropping it -- dropping it would
 * make the very next save delete the assignment with no warning. An id
 * neither method can vouch for at all throws `UnresolvedSelectionException`
 * (0022's D12) -- a total function, never a short return.
 *
 * Labels are qualified ("España (Península)"), not "Península" +
 * `group: "España"` (D-OQ4) -- that is PRD §2.1's own spelling of the
 * entry, it makes a selected chip self-describing out of context, and it
 * matches 0022's D3 expectation that this consumer renders a flat list.
 *
 * AUTHORIZATION (Phase 4 finding F-1): `MultiSelectOptionsResolver`'s own
 * docblock states, IN CAPITALS, that a real implementation MUST perform its
 * own authorization if the underlying data is not uniformly visible to
 * every authenticated user. Decision (already made -- not a call for a
 * future reader to re-litigate): no `Gate` call is added here. The Sales
 * Region catalog data this resolver exposes -- `name`, `is_active` (via
 * `disabled`) and has-children (also via `disabled`, indirectly through
 * `assignable()`) -- is treated as uniformly visible to any authenticated
 * admin reaching this resolver, exactly the reasoning `ResolveProductTaxRate`
 * already states for the identical omission (see that class's own
 * docblock). What this resolver deliberately does NOT disclose, in either
 * method: `rate`, `description`, `is_default`. Verified against `toOption()`
 * below, the single formatter both `search()` and `resolveSelected()` route
 * through -- it returns exactly `{id, label, group, disabled}` and nothing
 * else, so neither method can leak a fiscal figure or the seeder-only
 * default flag regardless of which catalog columns are hydrated on the
 * underlying `SalesRegion` instance.
 */
class SearchSalesRegions implements MultiSelectOptionsResolver
{
    /**
     * Hard ceiling on the number of `assignable()` rows this class will ever
     * pull into memory before applying `$limit` and before the in-PHP name
     * match runs (Phase 4 finding F-6). Negligible today -- the catalog's
     * `assignable()` set is ~6 rows -- but this class is the template a
     * later story (0034, shipping zones) is expected to copy over a table
     * that can hold thousands of rows, and an unbounded `->get()` copied
     * verbatim would silently become an unbounded full-table pull the day
     * that happens. 1000 is chosen as comfortably above any plausible
     * `$limit` a consumer passes (0022's own shell caps results well below
     * that) while still bounding a full-table scan on a much larger future
     * table to a fixed, small cost. A COPYING STORY OVER A LARGE TABLE:
     * re-derive this constant for your own table's realistic scale rather
     * than reusing 1000 unexamined -- and know what "too small" looks like
     * (Phase 5 finding N-7): the ceiling is applied via `->limit()` BEFORE
     * the in-PHP name match, in `sort_order`/`name` order, so a genuine
     * match sorted past the ceiling is silently invisible to search, with
     * no truncation signal to the consumer (unlike `Media\Gallery`, which
     * renders a `media-results-truncated` notice at its own cap). Harmless
     * at this catalog's real size (~6 assignable rows); a copier over a
     * table where the ceiling can plausibly bind should add an equivalent
     * signal rather than let a real match silently vanish.
     */
    private const MAX_SCANNED_ROWS = 1000;

    /**
     * `$term`/`$limit` are fixed by `MultiSelectOptionsResolver`'s public
     * contract, so `NormalizeForSearch` is resolved via `app()` rather than
     * injected as a method parameter -- the documented exception in
     * code-style.md for a method whose parameter list is fixed by
     * something other than this class.
     *
     * @return array<int, array{id: string, label: string, group: string|null, disabled: bool}>
     */
    public function search(string $term, int $limit): array
    {
        $normalizeForSearch = app(NormalizeForSearch::class);

        return SalesRegion::query()
            ->assignable()
            ->with('parent')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->limit(self::MAX_SCANNED_ROWS)
            ->get()
            ->filter(function (SalesRegion $region) use ($term, $normalizeForSearch): bool {
                if (str_contains($normalizeForSearch($region->name), $term)) {
                    return true;
                }

                return $region->parent !== null && str_contains($normalizeForSearch($region->parent->name), $term);
            })
            ->take($limit)
            ->map(fn (SalesRegion $region): array => $this->toOption($region, disabled: false))
            ->values()
            ->all();
    }

    /**
     * TOTAL FUNCTION: never a short return -- every requested id is either present in the result or
     * this throws (Phase 5 finding N-6: this is NOT a dedupe guarantee -- a duplicate id in `$ids`
     * produces a duplicate row in the result, matching `$ids`' own shape; `distinct` in
     * `salesRegionIdRules()` and the shell's own dedupe are what a caller relies on for uniqueness).
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

        $regions = SalesRegion::query()
            ->with('parent')
            ->withCount('children')
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id');

        $missingIds = array_values(array_diff($ids, $regions->keys()->all()));

        if ($missingIds !== []) {
            throw new UnresolvedSelectionException($missingIds);
        }

        return collect($ids)
            ->map(function (string $id) use ($regions): array {
                /** @var SalesRegion $region Every id was confirmed present above. */
                $region = $regions->get($id);

                $disabled = ! ($region->is_active && (int) $region->children_count === 0);

                return $this->toOption($region, $disabled);
            })
            ->values()
            ->all();
    }

    /**
     * @return array{id: string, label: string, group: string|null, disabled: bool}
     */
    private function toOption(SalesRegion $region, bool $disabled): array
    {
        $label = $region->parent !== null
            ? "{$region->parent->name} ({$region->name})"
            : $region->name;

        return [
            'id' => $region->id,
            'label' => $label,
            'group' => null,
            'disabled' => $disabled,
        ];
    }
}
