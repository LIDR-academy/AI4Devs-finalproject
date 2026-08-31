<?php

namespace Tests\Support\Livewire;

use App\Actions\NormalizeForSearch;
use App\Exceptions\UnresolvedSelectionException;
use App\Livewire\Components\MultiSelectOptionsResolver;

/**
 * Story 0022 (searchable multi-select component), Phase 3 Cycle B (TDD "red" step). Test-only
 * double implementing App\Livewire\Components\MultiSelectOptionsResolver (D1) -- neither that
 * interface nor App\Exceptions\UnresolvedSelectionException exist yet at this point in the cycle,
 * so simply loading THIS file (via any test that references it) is expected to fail with a
 * "Interface not found" / "class not found" style fatal error until frontend-expert implements
 * both in the next step. That failure is the correct, intended outcome of this file existing
 * before the production code does -- see the task file's "Test double" section, which specifies
 * this exact class by name.
 *
 * Serves BOTH consumer shapes this shared widget must support with the same class: a flat list
 * (every row's `group` is null, matching 0027's ~250-row Sales Region picker) and a grouped list
 * (some rows carry a non-null `group`, matching 0034's by-level geography picker) -- the interface
 * itself is shape-agnostic about that; the caller decides by what it seeds `$rows` with.
 *
 * A call log on both methods lets a test assert "called N times, with limit X, with this exact
 * normalized term" (D9's over-fetch proof, D13's already-normalized-term proof) without any
 * timing assertion -- the non-flaky idiom this project's testing docs require.
 *
 * Per D12, this is a CONFORMING implementation by default: resolveSelected() is a total function
 * that throws UnresolvedSelectionException for any id it cannot vouch for, rather than silently
 * returning a short array. The constructor's `$misbehave` flag opts into the one deliberately
 * non-conforming shape -- returning a short array instead of throwing -- used ONLY by the
 * defence-in-depth test proving the shell itself catches a resolver that gets this wrong.
 */
class ArrayMultiSelectOptionsResolver implements MultiSelectOptionsResolver
{
    /**
     * Default fixture rows. Deliberately includes two accented labels (Niño, A Coruña) so D13's
     * normalization tests -- "nino finds Niño", "NIÑO/niño/Nino all match" -- have something real
     * to fold against without every test having to build its own rows, and one `disabled: true`
     * row so D3/D11's "visible but unselectable" tests need no bespoke fixture either.
     *
     * @var array<int, array{id: string, label: string, group: string|null, disabled: bool}>
     */
    public const DEFAULT_ROWS = [
        ['id' => 'nino', 'label' => 'Niño', 'group' => null, 'disabled' => false],
        ['id' => 'a-coruna', 'label' => 'A Coruña', 'group' => null, 'disabled' => false],
        ['id' => 'madrid', 'label' => 'Madrid', 'group' => null, 'disabled' => false],
        ['id' => 'barcelona', 'label' => 'Barcelona', 'group' => null, 'disabled' => false],
        ['id' => 'unavailable-option', 'label' => 'Unavailable option', 'group' => null, 'disabled' => true],
    ];

    /**
     * @var array<int, array{term: string, limit: int}>
     */
    public array $searchCalls = [];

    /**
     * @var array<int, array<int, string>>
     */
    public array $resolveSelectedCalls = [];

    /**
     * @param  array<int, array{id: string, label: string, group: string|null, disabled: bool}>  $rows
     */
    public function __construct(
        private readonly array $rows = self::DEFAULT_ROWS,
        private readonly bool $misbehave = false,
    ) {}

    /**
     * D1's docblock requires $term to arrive ALREADY NORMALIZED by App\Actions\NormalizeForSearch,
     * and requires the implementation to fold the haystack side with that same utility. This
     * double does exactly that -- it is what makes it a genuinely conforming resolver rather than
     * a stub that happens to pass by coincidence, and it is what makes D13's real-fixture tests
     * (Niño/nino, A Coruña/a coruna) meaningful.
     */
    public function search(string $term, int $limit): array
    {
        // Deliberately performs neither of the two things the interface docblock (Phase 4
        // finding F-8) tells a REAL resolver it must do: no authorization check (this is an
        // in-memory array double with no rows to scope), and no LIKE-wildcard escaping (there is
        // no SQL LIKE query here at all -- str_contains() has no wildcard semantics to escape).
        // Neither omission is a bug in this double; both are the responsibility of a real
        // resolver implementation (0026/0027/0034), never of this test fixture.
        $this->searchCalls[] = ['term' => $term, 'limit' => $limit];

        $normalizeForSearch = new NormalizeForSearch;

        return collect($this->rows)
            ->filter(fn (array $row): bool => str_contains($normalizeForSearch($row['label']), $term))
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * D12's total-function contract: exactly one entry per requested id, or throw
     * UnresolvedSelectionException carrying every id this resolver could not vouch for. The
     * `$misbehave` constructor flag opts into returning a short array instead -- the one
     * deliberately non-conforming shape, used only to prove the shell's own defence in depth.
     */
    public function resolveSelected(array $ids): array
    {
        $this->resolveSelectedCalls[] = $ids;

        $found = collect($this->rows)->whereIn('id', $ids)->values();

        if ($this->misbehave) {
            return $found->all();
        }

        $missingIds = array_values(array_diff($ids, $found->pluck('id')->all()));

        if ($missingIds !== []) {
            throw new UnresolvedSelectionException($missingIds);
        }

        return $found->all();
    }
}
