<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

/**
 * Authorization for role management -- the layer 0009/0011's dashboard
 * screens call via `authorize()`. The Super Admin role is refused for
 * `update()`/`delete()` categorically, identified the same way every other
 * mechanism in this story identifies it: `Role::superAdminName()`, never a
 * direct comparison against `App\Enums\RoleName::SuperAdmin`.
 *
 * This is a *complement* to, not a substitute for, `App\Models\Role`'s own
 * guards: `AppServiceProvider::configureAuthorization()`'s `Gate::before`
 * closure defers (returns `null`) rather than short-circuiting `true`
 * whenever the check's own target is the Super Admin role, so a Super
 * Admin actor's own `update()`/`delete()` attempt against their role
 * reaches this policy -- and is refused by it -- like any other actor's
 * would. The model-level guard still refuses the mutation too (defense in
 * depth) if this layer is ever bypassed (e.g. a code path that mutates
 * without calling `authorize()`). See tests/Feature/Policies/RolePolicyTest.php.
 */
class RolePolicy
{
    /**
     * Determine whether the actor can update the target role.
     */
    public function update(User $user, Role $role): bool
    {
        if ($role->name === Role::superAdminName()) {
            return false;
        }

        return $user->hasPermissionTo('roles.manage');
    }

    /**
     * Determine whether the actor can delete the target role.
     */
    public function delete(User $user, Role $role): bool
    {
        if ($role->name === Role::superAdminName()) {
            return false;
        }

        return $user->hasPermissionTo('roles.manage');
    }
}
