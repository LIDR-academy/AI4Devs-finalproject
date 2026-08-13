<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the actor can view the users list.
     */
    public function viewAny(User $actor): bool
    {
        return $actor->hasPermissionTo('users.view');
    }

    /**
     * Determine whether the actor can create users.
     */
    public function create(User $actor): bool
    {
        return $actor->hasPermissionTo('users.create');
    }

    /**
     * Determine whether the actor can update the target user.
     *
     * A user holding the Super Admin role can never be edited through this
     * screen, regardless of the actor's own permissions — this exclusion
     * lives here so story 0005's delete path inherits it too.
     */
    public function update(User $actor, User $target): bool
    {
        if ($target->hasRole('Super Admin', 'web')) {
            return false;
        }

        return $actor->hasPermissionTo('users.edit');
    }

    /**
     * Determine whether the actor can assign the Administrator role.
     *
     * $target is null on the create path, where no user exists to target
     * yet: Gate::callPolicyMethod() drops the first argument when the
     * ability is checked class-level (Gate::authorize('promoteToAdministrator',
     * User::class)), so this parameter must default to null or the
     * class-level call throws ArgumentCountError instead of denying or
     * allowing anything. The rule itself does not depend on $target.
     */
    public function promoteToAdministrator(User $actor, ?User $target = null): bool
    {
        return $actor->hasPermissionTo('roles.manage-administrators');
    }

    /**
     * Determine whether the actor can remove the Administrator role from the
     * target user.
     *
     * No self-targeting exception: the same rule applies when the actor and
     * the target are the same user. Self-lockout is prevented separately, by
     * the component's self-edit guard, which never applies a role or status
     * change to the acting user's own row.
     */
    public function downgrade(User $actor, User $target): bool
    {
        if (! $target->hasRole('Administrator', 'web')) {
            return true;
        }

        return $actor->hasPermissionTo('roles.manage-administrators');
    }

    /**
     * Determine whether the actor can delete the target user.
     *
     * This story defines only the minimal, permission-keyed shape; story
     * 0005 extends this method with soft-delete and email-obfuscation
     * semantics.
     */
    public function delete(User $actor, User $target): bool
    {
        if ($target->hasRole('Super Admin', 'web')) {
            return false;
        }

        if (! $target->hasRole('Administrator', 'web')) {
            return $actor->hasPermissionTo('users.delete');
        }

        return $actor->hasPermissionTo('users.delete')
            && $actor->hasPermissionTo('roles.manage-administrators');
    }
}
