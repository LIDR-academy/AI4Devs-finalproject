<?php

namespace App\Actions\SalesRegions;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\SalesRegion;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The single named writer of `is_default`, anywhere in the app -- story
 * 0017 (D1, D2).
 */
class SetDefaultSalesRegion
{
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Flag the given Sales Region entry as the catalog default, clearing
     * whichever entry currently holds it.
     *
     * Authorizes itself first (the Gate-shaped check), outside the
     * transaction -- authorization is a precondition to starting the
     * operation, not part of the data it writes, so a refusal never opens a
     * transaction at all.
     *
     * Phase 4 finding (docs/security/model-instance-trust.md): $newDefault is
     * a caller-supplied instance and must be treated as untrusted on BOTH the
     * read side (its is_active attribute may be stale or forged in-memory)
     * and the write side (save() persists whatever else the caller left
     * dirty on it, not only what this action names). The fix is one
     * re-fetch: the transaction's first statement re-reads every row this
     * call could touch -- the target AND every currently-default row -- in
     * ONE query, locked together, and every read/write below runs against
     * those fresh instances. $newDefault itself is never read or written
     * again after this point.
     *
     * Phase 4 RE-audit finding R-1: the first fix locked the target and the
     * clear-set in two SEPARATE queries. That reopened a real, confirmed (by
     * execution, two live sessions) deadlock between two concurrent calls to
     * THIS action targeting two DIFFERENT regions -- each transaction locks
     * its own target first, then the (unindexed, near-full-table) clear-set
     * scan, and the two can acquire those in opposite orders. A single
     * `orderBy('id')->lockForUpdate()` query covering BOTH row sets removes
     * the inconsistent ordering structurally: any two overlapping
     * acquisitions always request the same rows in the same order.
     *
     * Properties of the transaction below, each load-bearing:
     * - The single combined lock query is why the deadlock above is closed
     *   rather than merely retried -- see `attempts: 3` below for what still
     *   needs a retry (a residual race outside this set, e.g. the
     *   self-healing repair path touching a row this query didn't include).
     * - `is_active` is read off $target only after it is locked, so the
     *   guard observes the row's real, current state rather than an
     *   in-memory attribute from whenever the caller hydrated $newDefault.
     * - Clearing every OTHER already-locked default row (rather than
     *   `->first()`) is deliberate self-healing: if the invariant were ever
     *   violated by a data mishap, the next call converges instead of
     *   leaving a second flag behind.
     * - Clear-before-set ordering is what keeps this compatible with the
     *   deferred database backstop (D13).
     * - `attempts: 3` is Laravel's built-in deadlock retry, kept as a second,
     *   independent layer for whatever the single ordered query does not
     *   cover (see SetSalesRegionActive's docblock for its own multi-row
     *   lock and why nesting into this action's own `attempts` is inert at
     *   `transactions > 1` -- the OUTER transaction's retry is what covers
     *   that nested case).
     */
    public function __invoke(SalesRegion $newDefault): SalesRegion
    {
        $this->logRefusedPrivilegedAttempt->authorize('update', $newDefault, targetType: 'sales_region', targetId: $newDefault->id);

        return DB::transaction(function () use ($newDefault): SalesRegion {
            // Every row this call could touch, locked together in ONE
            // primary-key-ordered query: the target itself, plus every
            // row currently flagged as the default (there should be
            // exactly one, but the self-healing clear-loop below assumes
            // nothing about that count).
            $rows = SalesRegion::query()
                ->where(fn ($query) => $query->where('is_default', true)->orWhere('id', $newDefault->getKey()))
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $target = $rows->first(fn (SalesRegion $row): bool => $row->is($newDefault))
                ?? throw (new ModelNotFoundException)->setModel(SalesRegion::class, [$newDefault->getKey()]);

            if (! $target->is_active) {
                $this->logRefusedPrivilegedAttempt->log(Auth::user(), 'default_must_be_active', 'sales_region', $target->id);

                throw ValidationException::withMessages([
                    'replacementDefaultId' => __('sales-regions.errors.default_must_be_active'),
                ]);
            }

            // Clear every OTHER already-locked row still flagged default --
            // excluding $target's own row, which the query above may have
            // matched twice over (once via `is_default`, once via its key)
            // but `get()` returns as one row either way. If $target is
            // already the current default and this loop touched it too, it
            // would clear the SAME $target instance this method returns
            // below, only to immediately set it back to true -- harmless in
            // itself, but pointless, so it is excluded on purpose.
            $rows->reject(fn (SalesRegion $row): bool => $row->is($target))
                ->each(fn (SalesRegion $current): bool => $current->forceFill(['is_default' => false])->save());

            // tap($target)->forceFill([...])->save() would NOT return
            // $target: HigherOrderTapProxy::__call() unwraps to the raw
            // target after the FIRST chained call, so the second call,
            // ->save(), runs directly on the model and returns its own
            // bool. Wrapping the already-forceFill()ed instance keeps
            // ->save() as the one proxied call.
            return tap($target->forceFill(['is_default' => true]))->save();
        }, attempts: 3);
    }
}
