<?php

namespace App\Policies;

use App\Models\SalesRegion;
use App\Models\User;

/**
 * Authorization rules for the Sales Regions catalog (story 0017).
 *
 * Two abilities only (D8): `sales-regions.create` / `sales-regions.delete`
 * are seeded (story 0002) but get no policy method here — the catalog is
 * fixed and seeded, with no create/delete affordance in this story or 0018.
 * Defining abilities nothing calls would add untested surface.
 *
 * `hasPermissionTo()` inside a policy body is correct here, even though it
 * does not itself reach `Gate::before` -- a policy method is only ever
 * reached *through* the Gate, and the Super Admin is granted before the
 * policy is consulted at all. See docs/architecture/authorization.md.
 */
class SalesRegionPolicy
{
    /**
     * Determine whether the user can view the Sales Regions screen.
     */
    public function viewAny(User $actor): bool
    {
        return $actor->hasPermissionTo('sales-regions.view');
    }

    /**
     * Determine whether the user can update a Sales Region entry.
     *
     * No target-dependent branch, unlike UserPolicy::update()'s Super Admin
     * exclusion -- there is no untouchable row in this domain today. Kept as
     * an instance method anyway, so the per-row Gate::allows() UI hint reuses
     * the identical method a future target-dependent rule would need.
     */
    public function update(User $actor, SalesRegion $target): bool
    {
        return $actor->hasPermissionTo('sales-regions.edit');
    }
}
