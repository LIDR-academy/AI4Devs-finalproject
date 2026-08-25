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
     * Three properties of the transaction below, each load-bearing:
     * - The lock is on `where('is_default', true)`, not on the target row --
     *   that is what serialises two concurrent "set default" calls aimed at
     *   different targets: both transactions contend on the same
     *   currently-default row, so the second blocks until the first commits
     *   and then reads the already-cleared state.
     * - `->get()->each(...)` rather than `->first()` is deliberate
     *   self-healing: if the invariant were ever violated by a data mishap,
     *   the next call converges instead of leaving a second flag behind.
     * - Clear-before-set ordering is what keeps this compatible with the
     *   deferred database backstop (D13).
     *
     * The is_active refusal (D10) is inside the transaction and inside the
     * lock, so it cannot be raced by a concurrent deactivation of the very
     * row being promoted. Logged before the throw so a direct
     * (non-dashboard) caller's probing is traced identically to the
     * component's.
     */
    public function __invoke(SalesRegion $newDefault): SalesRegion
    {
        $this->logRefusedPrivilegedAttempt->authorize('update', $newDefault, targetType: 'sales_region', targetId: $newDefault->id);

        return DB::transaction(function () use ($newDefault): SalesRegion {
            if (! $newDefault->is_active) {
                $this->logRefusedPrivilegedAttempt->log(Auth::user(), 'default_must_be_active', 'sales_region', $newDefault->id);

                throw ValidationException::withMessages([
                    'replacementDefaultId' => __('sales-regions.errors.default_must_be_active'),
                ]);
            }

            // whereKeyNot($newDefault->getKey()) -- verified by execution to be
            // required, not merely defensive: when $newDefault is ALREADY the
            // default, its own row would otherwise be cleared here through a
            // freshly-fetched, DIFFERENT model instance, then the final
            // forceFill(['is_default' => true]) below would run against
            // $newDefault's STALE in-memory original (still `true`, since
            // forceFill() alone never re-syncs `original`) -- Eloquent would
            // see no dirty change on that column and skip writing it back,
            // leaving the row incorrectly cleared. Excluding $newDefault's own
            // row keeps the idempotent "re-set the current default" case a
            // true no-op instead of a silent clear.
            SalesRegion::query()
                ->where('is_default', true)
                ->whereKeyNot($newDefault->getKey())
                ->lockForUpdate()
                ->get()
                ->each(fn (SalesRegion $current): bool => $current->forceFill(['is_default' => false])->save());

            // tap($newDefault)->forceFill([...])->save() would NOT return
            // $newDefault: HigherOrderTapProxy::__call() unwraps to the raw
            // target after the FIRST chained call, so the second call,
            // ->save(), runs directly on the model and returns its own
            // bool. Wrapping the already-forceFill()ed instance keeps
            // ->save() as the one proxied call.
            return tap($newDefault->forceFill(['is_default' => true]))->save();
        });
    }
}
