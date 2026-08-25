<?php

namespace App\Actions\SalesRegions;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\SalesRegion;
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
     * One transaction, so "simultaneously" is literal: there is never an
     * observable instant with zero defaults. Because $this->setDefaultSalesRegion
     * opens its own inner DB::transaction(), Laravel nests it as a SAVEPOINT
     * only while THIS transaction is open -- removing this outer wrapper
     * would let the inner call run as an independent, fully-committing
     * transaction instead. It is load-bearing for real, not merely
     * stylistic.
     *
     * $replacementDefault->is($region) is refused too -- naming the row
     * being deactivated as its own replacement would satisfy a naive
     * null-check while producing an inactive default.
     */
    public function __invoke(SalesRegion $region, bool $active, ?SalesRegion $replacementDefault = null): SalesRegion
    {
        $this->logRefusedPrivilegedAttempt->authorize('update', $region, targetType: 'sales_region', targetId: $region->id);

        if ($replacementDefault !== null) {
            $this->logRefusedPrivilegedAttempt->authorize('update', $replacementDefault, targetType: 'sales_region', targetId: $replacementDefault->id);
        }

        return DB::transaction(function () use ($region, $active, $replacementDefault): SalesRegion {
            if (! $active && $region->is_default) {
                if ($replacementDefault === null || $replacementDefault->is($region)) {
                    $this->logRefusedPrivilegedAttempt->log(Auth::user(), 'default_deactivation_requires_replacement', 'sales_region', $region->id);

                    throw ValidationException::withMessages([
                        'replacementDefaultId' => __('sales-regions.errors.default_deactivation_requires_replacement'),
                    ]);
                }

                ($this->setDefaultSalesRegion)($replacementDefault);
            }

            // tap($region)->forceFill([...])->save() would NOT return
            // $region: HigherOrderTapProxy::__call() unwraps to the raw
            // target after the FIRST chained call, so the second call,
            // ->save(), runs directly on the model and returns its own
            // bool. Wrapping the already-forceFill()ed instance keeps
            // ->save() as the one proxied call.
            return tap($region->forceFill(['is_active' => $active]))->save();
        });
    }
}
