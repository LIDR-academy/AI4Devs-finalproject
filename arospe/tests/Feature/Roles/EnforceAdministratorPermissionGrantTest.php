<?php

// Story 0009 — App\Actions\Roles\EnforceAdministratorPermissionGrant is the
// server-side enforcement of the Super-Admin-only meta-rule: the control to
// GRANT roles.manage-administrators to any role belongs to the Super Admin
// alone, regardless of what permissions the submitting actor already holds
// -- including roles.manage-administrators itself. Every test resolves the
// action from the container and calls it directly, matching story 0008a's
// precedent for actions independently callable outside their eventual
// Livewire call site (story 0010's saveRole(), not yet built).
//
// The full audit history behind this action's shape (three Phase 4 rounds,
// findings F1/F2/N1/N2/N3/NR1) lives in the task file's implementation
// record, not here -- this file tests the invariants that history produced:
// the "before" state is read from the target Role, never accepted as a
// caller-supplied array; the submitted list is flattened before either
// membership check runs, the identical way Role::syncPermissions() itself
// flattens before syncing; and the third parameter has no default, so a
// caller must state "null" (role creation) explicitly rather than a
// forgotten argument silently reading as "nothing is currently granted".

use App\Actions\Roles\EnforceAdministratorPermissionGrant;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// =====================================================================
// Genuine new grant attempts — the permission is absent before, present
// after. Super Admin only, regardless of what the actor already holds.
// $role === null is the role-creation path: nothing can currently be
// granted, so any submitted grant is by definition a new one.
// =====================================================================

test('a new grant of roles.manage-administrators throws for a non-Super-Admin holding roles.manage, on role creation', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    expect(fn () => $enforce($actor, ['users.view', 'roles.manage-administrators'], null))
        ->toThrow(AuthorizationException::class);
});

test('a new grant of roles.manage-administrators to the actor\'s own role throws for a non-Super-Admin (self-escalation)', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $ownRole = Role::create(['name' => 'Custom Editor', 'guard_name' => 'web']);
    $ownRole->givePermissionTo('roles.manage');
    $actor->assignRole($ownRole);

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    // No target-role argument is needed to prove self-targeting is refused
    // identically to any other target -- the rule is about who may submit
    // the permission at all, not about which role receives it.
    expect(fn () => $enforce($actor, ['roles.manage', 'roles.manage-administrators'], $ownRole))
        ->toThrow(AuthorizationException::class);
});

test('holding roles.manage-administrators does not itself confer the right to grant it to a role that does not yet have it', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo(['roles.manage', 'roles.manage-administrators']);

    $target = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);
    $target->givePermissionTo('roles.manage');

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    expect(fn () => $enforce($actor, ['roles.manage', 'roles.manage-administrators'], $target))
        ->toThrow(AuthorizationException::class);
});

test('a new grant of roles.manage-administrators succeeds for the Super Admin, and the permission list is returned unchanged', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    $result = $enforce($superAdmin, ['users.view', 'roles.manage-administrators'], null);

    expect($result)->toBe(['users.view', 'roles.manage-administrators']);
});

test('a payload that never mentions roles.manage-administrators passes through unauthorized for anyone, including a fully unprivileged actor', function () {
    $unprivileged = User::factory()->create();

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    $result = $enforce($unprivileged, ['users.view', 'users.edit'], null);

    expect($result)->toBe(['users.view', 'users.edit']);
});

// =====================================================================
// Preserve, don't silently revoke (F1). A non-Super-Admin editing a role
// that already holds roles.manage-administrators for an unrelated reason
// never has the toggle in their form at all, so their payload's omission
// must not remove the grant. The "before" state is read from the Role
// itself, never from the caller's own claim about it.
// =====================================================================

test('an omission of an already-granted roles.manage-administrators is preserved for a non-Super-Admin, not silently revoked', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $target = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);
    $target->givePermissionTo(['blog.view', 'roles.manage-administrators']);

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    // An unrelated edit -- the actor's payload never carries the
    // administrator-level permission, because the toggle is never
    // rendered to them.
    $result = $enforce($actor, ['blog.view', 'blog.edit'], $target);

    expect($result)->toContain('roles.manage-administrators')
        ->and($result)->toContain('blog.view')
        ->and($result)->toContain('blog.edit');
});

test('a genuine no-op re-save of an already-granted role by its own non-Super-Admin holder succeeds without a throw', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo(['roles.manage', 'roles.manage-administrators']);

    $target = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);
    $target->givePermissionTo(['roles.manage', 'roles.manage-administrators']);

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    // The permission is present in BOTH the current and submitted lists --
    // not a new grant, so no authorization is required for it.
    $result = $enforce($actor, ['roles.manage', 'roles.manage-administrators'], $target);

    expect($result)->toBe(['roles.manage', 'roles.manage-administrators']);
});

test('the Super Admin can still revoke roles.manage-administrators by omitting it, and the omission is honoured', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $target = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);
    $target->givePermissionTo(['roles.manage', 'roles.manage-administrators']);

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    $result = $enforce($superAdmin, ['roles.manage'], $target);

    expect($result)->toBe(['roles.manage']);
});

test('the "before" state is read fresh from the role itself, not from a stale cached relation', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $target = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);

    // Load the role's permissions relation BEFORE granting -- caches an
    // empty collection on this instance, simulating a caller that resolved
    // the role earlier in the request than the actual current state.
    $target->load('permissions');
    $target->givePermissionTo('roles.manage-administrators');

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    // If the stale cached (empty) relation were trusted, this would read as
    // a NEW grant attempt and throw for this non-Super-Admin actor.
    $result = $enforce($actor, [], $target);

    expect($result)->toContain('roles.manage-administrators');
});

// =====================================================================
// Re-audit finding N1 — the membership check must flatten a nested
// array/Collection payload the identical way Role::syncPermissions()
// itself does (HasPermissions::collectPermissions() flattens before
// syncing), or a nested element is invisible to the guard while still
// being honoured by the sync that follows.
// =====================================================================

test('a new grant nested inside an array element still requires the Super Admin', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    expect(fn () => $enforce($actor, ['users.view', ['roles.manage-administrators']], null))
        ->toThrow(AuthorizationException::class);
});

test('a new grant nested inside a Collection element still requires the Super Admin', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    expect(fn () => $enforce($actor, ['users.view', collect(['roles.manage-administrators'])], null))
        ->toThrow(AuthorizationException::class);
});

// =====================================================================
// Finding F2 (original round) — the membership check must resolve every
// flat shape Role::syncPermissions() itself accepts (names, ids,
// Permission instances), not only a bare name string.
// =====================================================================

test('a new grant submitted as a permission id (not a name string) still requires the Super Admin', function () {
    $permissionId = Permission::where('name', 'roles.manage-administrators')->where('guard_name', 'web')->value('id');

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    expect(fn () => $enforce($actor, ['users.view', $permissionId], null))
        ->toThrow(AuthorizationException::class);
});

test('a new grant submitted as a Permission model instance still requires the Super Admin', function () {
    $permission = Permission::where('name', 'roles.manage-administrators')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    expect(fn () => $enforce($actor, ['users.view', $permission], null))
        ->toThrow(AuthorizationException::class);
});

test('a new grant submitted as a permission id succeeds for the Super Admin', function () {
    $permissionId = Permission::where('name', 'roles.manage-administrators')->where('guard_name', 'web')->value('id');

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    $result = $enforce($superAdmin, ['users.view', $permissionId], null);

    expect($result)->toBe(['users.view', $permissionId]);
});
