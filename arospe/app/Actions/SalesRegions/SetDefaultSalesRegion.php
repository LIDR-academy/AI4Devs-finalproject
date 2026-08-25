<?php

namespace App\Actions\SalesRegions;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\SalesRegion;
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
     * re-fetch: the transaction's first statement re-reads the target row
     * under lockForUpdate(), and every read and write below runs against
     * that fresh $target instance -- $newDefault itself is never read or
     * written again after this point.
     *
     * Properties of the transaction below, each load-bearing:
     * - $target is locked BEFORE the is_active guard reads it, so the guard
     *   observes the row's real, current state rather than an in-memory
     *   attribute from whenever the caller hydrated $newDefault.
     * - `->get()->each(...)` rather than `->first()` on the clear-query is
     *   deliberate self-healing: if the invariant were ever violated by a
     *   data mishap, the next call converges instead of leaving a second
     *   flag behind.
     * - Clear-before-set ordering is what keeps this compatible with the
     *   deferred database backstop (D13).
     * - `attempts: 3` -- SetSalesRegionActive's own nested call into this
     *   action, combined with the lockForUpdate() scans below, opens a
     *   narrow deadlock surface between two concurrent operations naming
     *   each other's target as their replacement (see
     *   SetSalesRegionActive's docblock for the lock-ordering half of the
     *   mitigation). Laravel's built-in deadlock retry is the other half.
     */
    public function __invoke(SalesRegion $newDefault): SalesRegion
    {
        $this->logRefusedPrivilegedAttempt->authorize('update', $newDefault, targetType: 'sales_region', targetId: $newDefault->id);

        return DB::transaction(function () use ($newDefault): SalesRegion {
            // The row this guard is about, re-read under lock inside this
            // transaction: is_active is the state D10 protects, so it may
            // not arrive as an attribute of an instance hydrated by the
            // caller, at an unknown time.
            $target = SalesRegion::query()
                ->whereKey($newDefault->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if (! $target->is_active) {
                $this->logRefusedPrivilegedAttempt->log(Auth::user(), 'default_must_be_active', 'sales_region', $target->id);

                throw ValidationException::withMessages([
                    'replacementDefaultId' => __('sales-regions.errors.default_must_be_active'),
                ]);
            }

            // whereKeyNot($target->getKey()) -- still required even though
            // $target is now freshly locked: the rows matched below are a
            // SEPARATE query and therefore hydrate as SEPARATE model
            // instances, even for $target's own row. If $target is already
            // the current default and this query were allowed to also match
            // it, that separate instance would be cleared here
            // (forceFill(['is_default' => false])->save()), invisibly to
            // $target -- whose own `original` already says `true`, so the
            // final forceFill(['is_default' => true]) below would see no
            // dirty change and skip writing it back, leaving the row
            // incorrectly cleared. Excluding $target's own row keeps the
            // idempotent "re-set the current default" case a true no-op
            // instead of a silent clear.
            SalesRegion::query()
                ->where('is_default', true)
                ->whereKeyNot($target->getKey())
                ->lockForUpdate()
                ->get()
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
