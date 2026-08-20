<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

/**
 * Authorization for role management -- the layer 0009/0011's dashboard
 * screens call via `authorize()`. Two tiers are refused independently of
 * the general `roles.manage` permission, in this order:
 *
 * 1. The Super Admin role is refused for `update()`/`delete()`
 *    categorically, identified via the hydration-safe, row-shaped
 *    `Role::isSuperAdminRoleRow()` (never `$role->name === ...` directly --
 *    see that method's own docblock for why a partially-hydrated or
 *    mid-rename row must still answer correctly).
 * 2. The seeded `Administrator` role requires the distinct
 *    `roles.manage-administrators` permission on top of `roles.manage`,
 *    identified via `Role::isAdministratorRole()` -- the same row-shaped
 *    helper story 0008a centralizes for the *user* side
 *    (`UserPolicy`, `CreateUser`, `UpdateUser`). Both helpers live on
 *    `App\Models\Role`; this policy defines no comparison of its own.
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
     * The permission required to manage the seeded Administrator role --
     * distinct from, and narrower than, the general roles.manage permission
     * every other role is governed by. This policy and
     * EnforceAdministratorPermissionGrant (plus their tests) read this
     * constant rather than the literal. UserPolicy still writes the literal
     * at four call sites of its own (Phase 4 finding F5, deferred to a
     * future cleanup rather than this story's scope) -- point those here
     * once F5 is closed, rather than assuming it already is.
     */
    public const ADMINISTRATOR_LEVEL_PERMISSION = 'roles.manage-administrators';

    /**
     * The general role-management permission that governs every role
     * except the two protected tiers above.
     */
    public const ROLE_MANAGEMENT_PERMISSION = 'roles.manage';

    /**
     * Determine whether the actor can view the roles list -- the
     * `mount()`-equivalent check for App\Livewire\Roles\Index (story 0010),
     * this policy's first component call site.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(self::ROLE_MANAGEMENT_PERMISSION);
    }

    /**
     * Determine whether the actor can create a new role. Unlike update()/
     * delete(), there is no target row yet, so neither protected-tier branch
     * applies here -- a role cannot be created under the Super Admin name
     * (App\Models\Role's own `creating` event guards that directly) or the
     * Administrator name (already taken by the seeded row, so roleNameRules()'
     * uniqueness rule refuses the duplicate before this ability is even
     * relevant).
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo(self::ROLE_MANAGEMENT_PERMISSION);
    }

    /**
     * Determine whether the actor can update the target role.
     */
    public function update(User $user, Role $role): bool
    {
        if (Role::isSuperAdminRoleRow($role)) {
            return false;
        }

        return Role::isAdministratorRole($role)
            ? $user->hasPermissionTo(self::ADMINISTRATOR_LEVEL_PERMISSION)
            : $user->hasPermissionTo(self::ROLE_MANAGEMENT_PERMISSION);
    }

    /**
     * Determine whether the actor can delete the target role.
     *
     * Diverges from update() on purpose (story 0010 Phase 4 security audit,
     * finding F1, human-confirmed decision): the Administrator role is
     * refused categorically here, the same as the Super Admin role, rather
     * than gated by ADMINISTRATOR_LEVEL_PERMISSION -- it is never
     * deletable, only its permission set is editable. App\Models\Role's own
     * guardAgainstAdministratorDeletion() refuses it too (defense in depth).
     *
     * Corrected 2026-08-20 (Phase 4 round 2 re-audit, finding N3): the
     * relationship to the model guard is NOT identical to the Super Admin
     * refusal's. AppServiceProvider's Gate::before closure only defers
     * (returns null) when the ability's TARGET is the Super Admin role, so
     * for a Super Admin actor targeting the Administrator role it bypasses
     * (true) unconditionally -- this method's Administrator branch never
     * runs for that actor at all, and the model-event guard is what
     * actually refuses the delete. Both paths render as a 403
     * (ImmutableRoleException::render() matches a policy refusal), so the
     * behaviour is correct, but a story-0011 per-row Gate::allows() UI hint
     * will render enabled for that one actor/target pair -- the same
     * accepted drift shape already documented for the Users screen (see
     * docs/api/routes.md#usersindex--the-first-permission-gated-route).
     */
    public function delete(User $user, Role $role): bool
    {
        if (Role::isSuperAdminRoleRow($role) || Role::isAdministratorRole($role)) {
            return false;
        }

        return $user->hasPermissionTo(self::ROLE_MANAGEMENT_PERMISSION);
    }

    /**
     * Determine whether the actor may grant/revoke the
     * roles.manage-administrators permission on any role -- the
     * Super-Admin-only meta-rule consumed by story 0011's toggle visibility
     * and enforced server-side by App\Actions\Roles\EnforceAdministratorPermissionGrant.
     * Deliberately not itself gated by any permission: holding
     * roles.manage-administrators grants the *managed* ability, never the
     * right to grant it to someone else.
     */
    public function grantAdministratorPermission(User $user): bool
    {
        return $user->hasRole(Role::superAdminName(), 'web');
    }
}
