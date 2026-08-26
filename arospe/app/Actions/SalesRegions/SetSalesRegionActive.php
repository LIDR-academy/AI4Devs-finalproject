<?php

namespace App\Actions\SalesRegions;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\SalesRegion;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The single named writer of `is_active` -- story 0017. Also the place the
 * PRD's coupling between deactivation and the default flag is expressed
 * (D3).
 */
class SetSalesRegionActive
{
    /**
     * $setDefaultSalesRegion is constructor-injected, matching UpdateUser's
     * documented exception to this repo's per-method-injection convention:
     * __invoke()'s parameter list is a public contract every caller matches
     * verbatim, so an internal dependency (this action's own dependency on
     * another action) is constructor-injected rather than widening that
     * signature. See docs/conventions/code-style.md.
     */
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly SetDefaultSalesRegion $setDefaultSalesRegion,
    ) {}

    /**
     * Enable or disable a Sales Region entry, atomically promoting a
     * replacement default when deactivating the current default (D3).
     *
     * Authorizes both rows it can write -- its own target, and (if
     * supplied) the replacement, since promoting it is this action's effect
     * too, not only SetDefaultSalesRegion's. Both authorize() calls sit
     * outside the transaction, before it opens, so a refusal on the
     * replacement row is reported before any transaction opens at all.
     *
     * Phase 4 finding (docs/security/model-instance-trust.md): $region and
     * $replacementDefault are caller-supplied instances, untrusted on both
     * the read side (is_default may be stale/forged) and the write side
     * (save() persists whatever else is dirty on them). The transaction's
     * first statement re-fetches both rows -- in ONE query, locked together
     * -- and every read/write below runs against those fresh instances;
     * $region and $replacementDefault are never read or written again after
     * that point.
     *
     * One transaction, so "simultaneously" is literal: there is never an
     * observable instant with zero defaults. Because $this->setDefaultSalesRegion
     * opens its own inner DB::transaction(), Laravel nests it as a SAVEPOINT
     * only while THIS transaction is open -- removing this outer wrapper
     * would let the inner call run as an independent, fully-committing
     * transaction instead. It is load-bearing for real, not merely
     * stylistic.
     *
     * $replacement->is($target) is refused too -- naming the row being
     * deactivated as its own replacement would satisfy a naive null-check
     * while producing an inactive default.
     *
     * Lock ordering: both candidate rows are locked in one
     * whereIn(...)->orderBy('id')->lockForUpdate() query rather than as two
     * separate lockForUpdate() calls. This does NOT protect a "two calls
     * naming each other's target as their own replacement" scenario --
     * that interleaving cannot occur, since the nested call below only ever
     * runs when $target->is_default is true, so both sides of such a race
     * would need is_default=true simultaneously, the exact state this story
     * exists to forbid (Phase 4 RE-audit finding R-1a, which corrected this
     * docblock's original, wrong framing).
     *
     * What ordering-then-locking here DOES buy: within a single such query,
     * any two transactions needing an overlapping subset of these two rows
     * request them in the same order. What it does NOT fully buy, corrected
     * by Phase 5 code review finding F-3 (a second over-claim in this same
     * docblock): this method's own promotion path still acquires TWO
     * separate lock sets in sequence -- this query, then the nested
     * SetDefaultSalesRegion call's own single-but-separate ordered query
     * over `is_default` (an unindexed, near-full-table scan) -- so a
     * concurrent plain SetDefaultSalesRegion(other) call can still hold a
     * row this sequence needs while waiting on one it holds, the same
     * two-separate-lock-sets shape R-1b found deadlockable. What actually
     * closes THAT residual window is `attempts: 3`: Laravel only retries a
     * deadlock at `transactions === 1`, and the nested call's own inner
     * transaction runs as a SAVEPOINT while this one is open, so a real
     * deadlock there rethrows a DeadlockException that THIS (outer)
     * transaction's `attempts: 3` retries into a converged state -- not the
     * lock ordering. See docs/security/model-instance-trust.md's
     * "Re-audit round 2" section for the full reasoning and why closing
     * this residually (indexing is_default, or acquiring the full union of
     * rows up front) is out of this story's scope.
     */
    public function __invoke(SalesRegion $region, bool $active, ?SalesRegion $replacementDefault = null): SalesRegion
    {
        $this->logRefusedPrivilegedAttempt->authorize('update', $region, targetType: 'sales_region', targetId: $region->id);

        if ($replacementDefault !== null) {
            $this->logRefusedPrivilegedAttempt->authorize('update', $replacementDefault, targetType: 'sales_region', targetId: $replacementDefault->id);
        }

        $regionKey = $region->getKey();
        $replacementKey = $replacementDefault?->getKey();

        return DB::transaction(function () use ($regionKey, $replacementKey, $active): SalesRegion {
            $keys = array_values(array_unique(array_filter([$regionKey, $replacementKey])));

            $rows = SalesRegion::query()
                ->whereIn('id', $keys)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy(fn (SalesRegion $row): string => $row->getKey());

            $target = $rows->get($regionKey) ?? throw (new ModelNotFoundException)->setModel(SalesRegion::class, [$regionKey]);
            $replacement = $replacementKey !== null ? $rows->get($replacementKey) : null;

            if (! $active && $target->is_default) {
                if ($replacement === null || $replacement->is($target)) {
                    $this->logRefusedPrivilegedAttempt->log(Auth::user(), 'default_deactivation_requires_replacement', 'sales_region', $target->id);

                    throw ValidationException::withMessages([
                        'replacementDefaultId' => __('sales-regions.errors.default_deactivation_requires_replacement'),
                    ]);
                }

                ($this->setDefaultSalesRegion)($replacement);
            }

            $target->forceFill(['is_active' => $active])->save();

            // Phase 4 RE-audit finding R-2: when the branch above ran, the
            // nested SetDefaultSalesRegion call cleared THIS row's
            // is_default through its OWN, separately re-fetched instance
            // (its whereKeyNot()-equivalent only excludes $replacement) --
            // invisibly to $target's own dirty-tracking, whose `original`
            // still says `true`. The persisted state is correct (is_default
            // is simply not dirty on $target, so save() above never touched
            // it), but without this refresh the RETURNED instance would
            // still claim is_default=true for a row the database now has as
            // false -- a real defect for any future caller that reads the
            // return value, even though nothing in this app does today.
            return $target->refresh();
        }, attempts: 3);
    }
}
