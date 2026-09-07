<?php

namespace App\Policies;

use App\Models\ShippingZone;
use App\Models\User;

/**
 * Authorization rules for the shipping zone catalog (story 0033).
 *
 * Corrected at Phase 4 security audit (finding F-1): this docblock
 * previously claimed D-9 shipped this policy "even though this story's own
 * actions ... deliberately self-authorize nothing, matching
 * App\Actions\Users\CreateUser/UpdateUser" -- that citation was FALSE
 * (CreateUser/UpdateUser both self-authorize as their own first statement).
 * All four actions in app/Actions/Shipping/ now self-authorize against this
 * policy as their own first statement, the identical shape
 * App\Actions\ProductCategories\* (story 0025) already uses -- see each
 * action's own docblock. This policy is therefore no longer this story's
 * only authorization artifact, and the hand-off below is narrower than it
 * used to be: this story still ships zero call sites of its own (D-8: no
 * route, no Livewire component), but every action call already inherits a
 * real, enforced gate rather than depending on a future UI story to add
 * one.
 *
 * Gates on the already-seeded `shipping.*` module permissions -- no new
 * permission and no RolePermissionSeeder change.
 */
class ShippingZonePolicy
{
    /**
     * Named once on the class that owns the rule, per naming.md's "name a
     * permission once on the class that owns the rule" convention.
     */
    public const VIEW_PERMISSION = 'shipping.view';

    public const CREATE_PERMISSION = 'shipping.create';

    public const EDIT_PERMISSION = 'shipping.edit';

    public const DELETE_PERMISSION = 'shipping.delete';

    /**
     * Determine whether the user can view the shipping zone catalog.
     */
    public function viewAny(User $actor): bool
    {
        return $actor->hasPermissionTo(self::VIEW_PERMISSION);
    }

    /**
     * Determine whether the user can create a shipping zone.
     */
    public function create(User $actor): bool
    {
        return $actor->hasPermissionTo(self::CREATE_PERMISSION);
    }

    /**
     * Determine whether the user can rename a shipping zone or replace its
     * geography membership.
     *
     * No target-dependent branch -- there is no untouchable row in this
     * domain, the same shape SalesRegionPolicy::update() /
     * ProductCategoryPolicy::update() already establish. Kept as an
     * instance method anyway, so a future per-row Gate::allows() UI hint
     * reuses the identical method a target-dependent rule would need.
     */
    public function update(User $actor, ShippingZone $target): bool
    {
        return $actor->hasPermissionTo(self::EDIT_PERMISSION);
    }

    /**
     * Determine whether the user can delete a shipping zone.
     *
     * D-1: the in-use-by-a-rate-rule count guard does NOT belong here -- it
     * is a data precondition (a ValidationException with a count), not an
     * authorization rule, and a policy-level rule would be reachable by the
     * Super Admin Gate::before bypass, defeating the whole point of the
     * guard. See App\Actions\Shipping\DeleteShippingZone's docblock.
     */
    public function delete(User $actor, ShippingZone $target): bool
    {
        return $actor->hasPermissionTo(self::DELETE_PERMISSION);
    }
}
