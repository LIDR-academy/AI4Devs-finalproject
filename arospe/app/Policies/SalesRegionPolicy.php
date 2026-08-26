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
     * Named once on the class that owns the rule, per naming.md's
     * "name a permission once on the class that owns the rule" convention
     * (RolePolicy's ADMINISTRATOR_LEVEL_PERMISSION / ROLE_MANAGEMENT_PERMISSION
     * is the pattern this follows -- UserPolicy's own literals are a
     * documented, deferred cleanup candidate, not the shape to copy).
     */
    public const VIEW_PERMISSION = 'sales-regions.view';

    public const EDIT_PERMISSION = 'sales-regions.edit';

    /**
     * Determine whether the user can view the Sales Regions screen.
     */
    public function viewAny(User $actor): bool
    {
        return $actor->hasPermissionTo(self::VIEW_PERMISSION);
    }

    /**
     * Determine whether the user can update a Sales Region entry.
     *
     * No target-dependent branch, unlike UserPolicy::update()'s Super Admin
     * exclusion -- there is no untouchable row in this domain today. Kept as
     * an instance method anyway, so the per-row Gate::allows() UI hint reuses
     * the identical method a future target-dependent rule would need.
     *
     * Phase 4 RE-audit finding R-3, recorded here rather than fixed (there is
     * no rule to fix yet): every SalesRegions action authorizes against a
     * CALLER-supplied instance, before that action re-fetches its own fresh
     * copy under lock (docs/security/model-instance-trust.md). That is safe
     * only because this method ignores $target entirely. The day a
     * target-dependent branch is added here (e.g. gating on $target->kind),
     * it MUST be evaluated against a freshly re-fetched row, not the
     * caller's -- otherwise a forged in-memory attribute on the caller's
     * instance authorizes a write the action then performs against the real,
     * different row, reopening the exact class of bug this file's sibling
     * actions were fixed for, one layer up and outside their locks.
     */
    public function update(User $actor, SalesRegion $target): bool
    {
        return $actor->hasPermissionTo(self::EDIT_PERMISSION);
    }
}
