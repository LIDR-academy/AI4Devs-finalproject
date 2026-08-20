<?php

namespace App\Actions\Roles;

use App\Models\Role;
use App\Models\User;
use App\Policies\RolePolicy;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;

class EnforceGrantorPermissionScope
{
    /**
     * Refuse a role-save payload that newly grants a permission the acting
     * user does not themselves hold -- story 0010 Phase 4 security audit
     * finding F2, human-confirmed decision: `roles.manage` authorizes
     * managing roles, never granting a permission the actor lacks. Without
     * this, any `roles.manage` holder could rewrite a role's -- including
     * their own -- permission set to the full catalog, verified live during
     * the audit against an actor holding only two permissions.
     *
     * Only the NEWLY granted permissions are checked, by diffing against
     * the role's persisted "before" state (read from $role itself, never
     * accepted from the caller -- the same trap
     * EnforceAdministratorPermissionGrant's own audit history closed, see
     * docs/errors-log.md's 2026-08-20 entry). Removing a permission, or a
     * payload merely omitting one the actor cannot see, is never refused
     * here.
     *
     * roles.manage-administrators is deliberately excluded from this check
     * in both directions: whether an actor may grant it is not "do they
     * hold it themselves" -- that is entirely
     * EnforceAdministratorPermissionGrant's question, and
     * RolePolicy::grantAdministratorPermission()'s own rule is that holding
     * it never confers the right to grant it onward. This action must run
     * *before* that one in the caller (App\Livewire\Roles\Index::saveRole())
     * -- excluding the name here, rather than after, is what keeps the two
     * from disagreeing about it.
     *
     * A Super Admin actor is exempt entirely: RolePermissionSeeder grants
     * the Super Admin role no permissions of its own (Gate::before bypasses
     * every check instead), so a literal "do you hold what you're granting"
     * reading would wrongly refuse them from granting anything at all.
     *
     * @param  array<int, string>  $submittedPermissionNames  Already-resolved permission name strings -- the caller's job to convert ids/instances before calling this, since its only current call site (saveRole()) already has.
     * @param  Role|null  $role  The role being saved, resolved and fully hydrated by the caller -- null only for role creation, where nothing can currently be granted, so every submitted permission counts as newly granted.
     * @return array<int, string> The submitted list, unchanged -- this action only inspects, never rewrites, the payload.
     *
     * @throws AuthorizationException
     */
    public function __invoke(User $actor, array $submittedPermissionNames, ?Role $role): array
    {
        if ($actor->hasRole(Role::superAdminName(), 'web')) {
            return $submittedPermissionNames;
        }

        $currentNames = [];

        if ($role !== null) {
            // Reloaded fresh, never the possibly-stale cached relation --
            // same reason EnforceAdministratorPermissionGrant never trusts
            // a caller's hydration state for what the role currently holds.
            $role->load('permissions');
            $currentNames = $role->permissions->pluck('name')->all();
        }

        $newlyGranted = Collection::make($submittedPermissionNames)
            ->diff($currentNames)
            ->reject(fn (string $name): bool => $name === RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION);

        $ungranted = $newlyGranted->diff($actor->getAllPermissions()->pluck('name'));

        throw_if(
            $ungranted->isNotEmpty(),
            AuthorizationException::class,
            'You cannot grant a permission you do not hold yourself.',
        );

        return $submittedPermissionNames;
    }
}
