<?php

namespace App\Policies;

use App\Enums\RoleName;
use App\Models\Role;
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
        if ($target->hasRole(Role::superAdminName(), 'web')) {
            return false;
        }

        return $actor->hasPermissionTo('users.edit');
    }

    /**
     * Determine whether the actor can change the target's status or email
     * address.
     *
     * These two fields achieve the same practical effect as a delete
     * (suspending an Administrator locks them out just as surely as removing
     * them, and rewriting their email is a path to full account takeover),
     * so an Administrator-holding target requires the same
     * roles.manage-administrators permission the delete/downgrade/promote
     * abilities require — a bare users.edit is not enough. Security audit
     * finding F1 (Phase 4, story 0004): the role-change guard alone left
     * status and email unauthorized for any Administrator-level actor.
     */
    public function updateSensitiveAttributes(User $actor, User $target): bool
    {
        if (! $this->update($actor, $target)) {
            return false;
        }

        if (! $target->hasRole(RoleName::Administrator->value, 'web')) {
            return true;
        }

        return $actor->hasPermissionTo('roles.manage-administrators');
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
        if (! $target->hasRole(RoleName::Administrator->value, 'web')) {
            return true;
        }

        return $actor->hasPermissionTo('roles.manage-administrators');
    }

    /**
     * Determine whether the actor can delete the target user.
     *
     * Denies a target that is already soft-deleted, so a withTrashed() call
     * site cannot re-run User::delete()'s email-obfuscation write and
     * overwrite the placeholder on an already-trashed row (story 0005). This
     * check is policy-level: a Super Admin actor bypasses it via
     * Gate::before, same as every other ability here — accepted, since the
     * placeholder is deterministic from the immutable UUID and re-running it
     * is harmless in that one case.
     */
    public function delete(User $actor, User $target): bool
    {
        if ($target->hasRole(Role::superAdminName(), 'web')) {
            return false;
        }

        if ($target->trashed()) {
            return false;
        }

        if (! $target->hasRole(RoleName::Administrator->value, 'web')) {
            return $actor->hasPermissionTo('users.delete');
        }

        return $actor->hasPermissionTo('users.delete')
            && $actor->hasPermissionTo('roles.manage-administrators');
    }
}
