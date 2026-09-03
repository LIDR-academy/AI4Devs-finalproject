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
 */
class SearchSalesRegions implements MultiSelectOptionsResolver
{
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
     * TOTAL FUNCTION: exactly one entry per requested id, or it throws.
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
