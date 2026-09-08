<?php

namespace App\Actions\Roles;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\Role;
use App\Models\User;
use App\Policies\RolePolicy;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Permission;

class EnforceAdministratorPermissionGrant
{
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Refuse a role-save payload that newly grants roles.manage-administrators
     * unless the acting user is the Super Admin, and preserve an existing
     * grant a non-Super-Admin's payload merely omitted rather than silently
     * revoking it.
     *
     * Role::syncPermissions() replaces a role's entire permission set, and
     * story 0011's toggle is never rendered to a non-Super-Admin at all
     * (absent from the DOM, not merely disabled) -- so a broad
     * administrator editing an unrelated field on a role that already
     * legitimately holds roles.manage-administrators submits a payload that
     * OMITS it, not because they chose to revoke it but because the field
     * was never in their form. This method diffs the "before" state (read
     * from $role itself, never accepted from the caller -- see the
     * parameter docblock) against the submitted "after" list: only a
     * genuine NEW grant (absent before, present after) requires
     * grantAdministratorPermission; an omission of an already-granted
     * permission is preserved rather than read as an intentional revoke,
     * unless the actor actually has the right to revoke it (the Super
     * Admin, who can still remove it by submitting a payload that omits it
     * -- see "Revoking administrator-management takes effect immediately"
     * in story 0009's Gherkin). normalizeNames() below flattens the
     * submitted list with the identical call Spatie's own
     * HasPermissions::collectPermissions() uses before syncing, so a
     * nested array/Collection element can never be invisible to this check
     * while still being honoured by the sync that follows.
     *
     * Throws rather than silently stripping a genuine new-grant attempt,
     * because the toggle is never rendered to a non-Super-Admin in the
     * first place, so the only way that specific input arises is
     * tampering.
     *
     * @param  array<int, mixed>  $submittedPermissions  The submitted (post-edit) permission list -- names, ids, or Permission instances, in whatever mix or nesting the caller has on hand.
     * @param  Role|null  $role  The role being saved, resolved and fully hydrated by the caller -- null only for role creation, where nothing can currently be granted. Required (no default): a forgotten argument must not be silently read as "nothing is currently granted" for what could be an existing, already-granted role (Phase 4 re-audit finding NR1).
     * @return array<int, mixed> The permission list to actually sync -- the submitted list, with the administrator-level permission re-added if it was preserved.
     *
     * @throws AuthorizationException
     */
    public function __invoke(User $actor, array $submittedPermissions, ?Role $role): array
    {
        $submittedNames = $this->normalizeNames($submittedPermissions);

        $currentNames = [];

        if ($role !== null) {
            // Reloaded fresh, never the possibly-stale cached relation: a
            // caller's hydration state is not this action's source of
            // truth for what the role currently holds.
            $role->load('permissions');
            $currentNames = $role->permissions->pluck('name')->all();
        }

        $wasGranted = in_array(RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION, $currentNames, true);
        $isSubmittedGranted = in_array(RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION, $submittedNames, true);

        if ($isSubmittedGranted && ! $wasGranted) {
            // Story 0015b: the Gate target is the Role CLASS (a class-level
            // ability -- no specific row is being tested), but the target
            // this refusal is actually ABOUT is $role when one exists, so it
            // is passed explicitly rather than left to auto-derive from the
            // Gate target.
            $this->logRefusedPrivilegedAttempt->authorize(
                'grantAdministratorPermission',
                Role::class,
                actor: $actor,
                targetType: $role !== null ? 'role' : null,
                targetId: $role?->id,
            );
        }

        if ($wasGranted && ! $isSubmittedGranted && Gate::forUser($actor)->denies('grantAdministratorPermission', Role::class)) {
            $submittedPermissions[] = RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION;
        }

        return $submittedPermissions;
    }

    /**
     * Resolve a mixed, possibly-nested permission list -- names, ids,
     * Permission instances, or arrays/Collections of any of those, every
     * shape Role::syncPermissions() itself accepts by flattening the input
     * the identical way -- to plain name strings, so the membership checks
     * above cannot be evaded by a caller submitting the administrator-level
     * permission in a shape or nesting other than its bare name string.
     *
     * @param  array<int, mixed>  $permissions
     * @return array<int, string>
     */
    private function normalizeNames(array $permissions): array
    {
        $ids = [];
        $names = [];

        // Same flattening HasPermissions::collectPermissions() applies before
        // syncing -- a nested array/Collection element must not be invisible
        // here while still being honoured by the sync that follows.
        foreach (Collection::make($permissions)->flatten() as $permission) {
            if ($permission instanceof Permission) {
                $names[] = $permission->name;
            } elseif (is_numeric($permission)) {
                $ids[] = $permission;
            } else {
                $names[] = (string) $permission;
            }
        }

        if ($ids !== []) {
            array_push($names, ...Permission::query()->whereIn('id', $ids)->pluck('name')->all());
        }

        return $names;
    }
}
