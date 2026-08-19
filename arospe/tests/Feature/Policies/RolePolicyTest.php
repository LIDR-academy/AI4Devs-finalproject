<?php

use App\Exceptions\ImmutableRoleException;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// =====================================================================
// Narrowness — an ordinary role is fully manageable through the policy.
// =====================================================================

test('update and delete are allowed against an ordinary custom role for an actor holding roles.manage', function () {
    $custom = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    expect(Gate::forUser($actor)->allows('update', $custom))->toBeTrue()
        ->and(Gate::forUser($actor)->allows('delete', $custom))->toBeTrue();
});

// =====================================================================
// Bypass, negative — the refusal is categorical, not permission-based.
// An unprivileged actor and the holder of the broadest role-management
// permission are refused identically.
// =====================================================================

test('update and delete are refused against the Super Admin role identically for an unprivileged actor and for the holder of the broadest role-management permission', function (string $ability) {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $unprivileged = User::factory()->create();

    $broadestHolder = User::factory()->create();
    $broadestHolder->givePermissionTo('roles.manage');

    expect(Gate::forUser($unprivileged)->allows($ability, $superAdmin))->toBeFalse()
        ->and(Gate::forUser($broadestHolder)->allows($ability, $superAdmin))->toBeFalse();
})->with(['delete', 'update']);

test('authorizing delete against the Super Admin role throws for a permission-holding actor', function () {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    expect(fn () => Gate::forUser($actor)->authorize('delete', $superAdmin))
        ->toThrow(AuthorizationException::class);
});

// =====================================================================
// Story 0008 re-audit (F6) — RolePolicy is now independently effective
// even for a Super Admin actor acting on their own role.
// AppServiceProvider::configureAuthorization()'s Gate::before bypass
// now returns null (defers) rather than short-circuiting true/false
// whenever the check's own *target* is the Super Admin role, so a
// Super Admin's own Gate::authorize('delete', $superAdminRole) reaches
// RolePolicy::delete() like any other actor's would, and is refused by
// it -- not only by the deeper model-level guard. The model guard
// still refuses the mutation too (defense in depth), which the second
// half of this test still proves.
// =====================================================================

test('a Super Admin actor is refused by the policy for their own role too, not only by the deeper model guard', function () {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $actingSuperAdmin = User::factory()->create();
    $actingSuperAdmin->assignRole('Super Admin');

    expect(Gate::forUser($actingSuperAdmin)->allows('delete', $superAdmin))->toBeFalse();

    expect(fn () => $superAdmin->delete())->toThrow(ImmutableRoleException::class);
    expect(Role::where('id', $superAdmin->id)->exists())->toBeTrue();
});

// =====================================================================
// The Gate::before deferral above must be narrow: it only defers when
// the check's target IS the Super Admin role. A Super Admin's every
// OTHER ability check must still be bypassed as normal.
// =====================================================================

test('a Super Admin actor still bypasses every other ability check unrelated to the Super Admin role target', function () {
    $blogEditor = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $actingSuperAdmin = User::factory()->create();
    $actingSuperAdmin->assignRole('Super Admin');

    expect(Gate::forUser($actingSuperAdmin)->allows('delete', $blogEditor))->toBeTrue()
        ->and($actingSuperAdmin->can('an-ability-outside-the-seeded-catalog'))->toBeTrue();
});

// =====================================================================
// Retargeting — a legitimate edit of one role forged to target the
// Super Admin role's identifier instead is refused, and the role that
// was actually meant to be edited is left completely untouched.
// =====================================================================

test('retargeting an edit meant for the Blog Editor role at the Super Admin role by forging its identifier is refused, and neither role is modified', function () {
    $blogEditor = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $blogEditor->givePermissionTo(['blog.view', 'blog.edit']);

    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    // The actor is legitimately allowed to edit "Blog Editor" -- proving the refusal below
    // is about *which role* the forged request targets, not a general lack of edit rights.
    expect(Gate::forUser($actor)->allows('update', $blogEditor))->toBeTrue();

    // The request body is forged to carry the Super Admin role's identifier instead.
    expect(fn () => Gate::forUser($actor)->authorize('update', $superAdmin))
        ->toThrow(AuthorizationException::class);

    expect($superAdmin->fresh()->name)->toBe('Super Admin')
        ->and($blogEditor->fresh()->name)->toBe('Blog Editor')
        ->and($blogEditor->fresh()->permissions->pluck('name')->sort()->values()->all())->toBe(['blog.edit', 'blog.view']);
});

// =====================================================================
// Config source of truth — a present-but-null config key must not
// leave RolePolicy denying nothing.
// =====================================================================

test('with a present-but-null auth.super_admin.role config value, RolePolicy still denies delete against the role literally named "Super Admin"', function () {
    config(['auth.super_admin.role' => null]);

    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    expect(Gate::forUser($actor)->allows('delete', $superAdmin))->toBeFalse();
});

// =====================================================================
// Story 0009 — the Administrator-level branch: editing/deleting the
// seeded "Administrator" role requires roles.manage-administrators, on
// top of (never instead of) the categorical Super Admin refusal above.
// Every check below resolves through the shared, hydration-safe
// App\Models\Role::isAdministratorRole() / isSuperAdminRoleRow() helpers
// -- this file defines no comparison of its own.
// =====================================================================

// The content-scan proving no literal role-name string survives in
// app/Policies/RolePolicy.php lives in
// tests/Feature/Users/AdministratorRoleLiteralContentScanTest.php, whose
// $guardPathFiles dataset now includes that file -- see that test's own
// rationale for why this is a raw-content scan and not an arch() rule.

test('the Super Admin refusal is unconditional even for an actor holding roles.manage-administrators', function (string $ability) {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['roles.manage', 'roles.manage-administrators']);

    expect(Gate::forUser($actor)->allows($ability, $superAdmin))->toBeFalse();
})->with(['update', 'delete']);

test('the Super Admin edits the seeded Administrator role\'s permissions successfully', function () {
    $administrator = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    $actingSuperAdmin = User::factory()->create();
    $actingSuperAdmin->assignRole('Super Admin');

    expect(Gate::forUser($actingSuperAdmin)->allows('update', $administrator))->toBeTrue();

    $administrator->syncPermissions(['users.view', 'users.edit']);

    expect($administrator->fresh()->permissions->pluck('name')->sort()->values()->all())
        ->toBe(['users.edit', 'users.view']);
});

test('the Super Admin deletes the unassigned seeded Administrator role successfully', function () {
    $administrator = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    $actingSuperAdmin = User::factory()->create();
    $actingSuperAdmin->assignRole('Super Admin');

    expect(Gate::forUser($actingSuperAdmin)->allows('delete', $administrator))->toBeTrue();

    $administrator->delete();

    expect(Role::where('name', 'Administrator')->where('guard_name', 'web')->exists())->toBeFalse();
});

test('an administrator granted roles.manage-administrators edits the seeded Administrator role successfully', function () {
    $administrator = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['roles.manage-administrators']);

    expect(Gate::forUser($actor)->allows('update', $administrator))->toBeTrue();

    $administrator->syncPermissions(['users.view']);

    expect($administrator->fresh()->permissions->pluck('name')->all())->toBe(['users.view']);
});

test('an administrator granted roles.manage-administrators deletes the unassigned seeded Administrator role successfully', function () {
    $administrator = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['roles.manage-administrators']);

    expect(Gate::forUser($actor)->allows('delete', $administrator))->toBeTrue();

    $administrator->delete();

    expect(Role::where('name', 'Administrator')->where('guard_name', 'web')->exists())->toBeFalse();
});

test('the Super Admin succeeds even though the seeded Super Admin role holds no explicit roles.manage-administrators permission row', function () {
    $superAdminRole = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();
    $administrator = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    // The bypass, not a grant: the Super Admin role itself carries no
    // permission rows at all (see RolePermissionSeederTest).
    expect($superAdminRole->permissions->pluck('name')->all())->toBe([]);

    $actingSuperAdmin = User::factory()->create();
    $actingSuperAdmin->assignRole('Super Admin');

    expect(Gate::forUser($actingSuperAdmin)->allows('update', $administrator))->toBeTrue()
        ->and(Gate::forUser($actingSuperAdmin)->allows('delete', $administrator))->toBeTrue();
});

test('the broad administrator holding only roles.manage is denied editing the seeded Administrator role, and its permissions are unchanged', function () {
    $administrator = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $originalPermissions = $administrator->permissions->pluck('name')->sort()->values()->all();

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    expect(fn () => Gate::forUser($actor)->authorize('update', $administrator))
        ->toThrow(AuthorizationException::class);

    expect($administrator->fresh()->permissions->pluck('name')->sort()->values()->all())
        ->toBe($originalPermissions);
});

test('the broad administrator holding only roles.manage is denied deleting the seeded Administrator role, and it still exists', function () {
    $administrator = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    expect(fn () => Gate::forUser($actor)->authorize('delete', $administrator))
        ->toThrow(AuthorizationException::class);

    expect(Role::where('name', 'Administrator')->where('guard_name', 'web')->exists())->toBeTrue();
});

// =====================================================================
// Narrowness — "administrator-level" is exactly the seeded Administrator
// role, matched by exact case-sensitive name. A broad administrator (only
// roles.manage) can freely manage every other role, including one whose
// name merely resembles it.
// =====================================================================

test('the broad administrator can delete an unassigned custom role, including one whose name merely resembles "Administrator"', function (string $name) {
    $custom = Role::create(['name' => $name, 'guard_name' => 'web']);

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    expect(Gate::forUser($actor)->allows('delete', $custom))->toBeTrue();

    $custom->delete();

    expect(Role::where('name', $name)->where('guard_name', 'web')->exists())->toBeFalse();
})->with(['Blog Editor', 'Administrador Regional']);

// A role literally named "administrator" in lowercase is DELIBERATELY not reproduced here as a
// Role::create() fixture: roles.name carries the case-INSENSITIVE collation utf8mb4_unicode_ci
// (verified by story 0008a), so a row named "administrator" cannot coexist with the already-seeded
// "Administrator" row at all -- MySQL's own unique index on (name, guard_name) refuses it before this
// policy is ever reached. The exact-match `===` comparison this policy delegates to is already
// exercised against a not-yet-persisted instance in tests/Feature/Models/RoleTest.php.

// =====================================================================
// grantAdministratorPermission() -- the Super-Admin-only meta-rule story
// 0011's frontend consumes to conditionally render the toggle.
// =====================================================================

test('grantAdministratorPermission() returns true only for a Super Admin holder', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $broadestHolder = User::factory()->create();
    $broadestHolder->givePermissionTo(['roles.manage', 'roles.manage-administrators']);

    $unprivileged = User::factory()->create();

    expect(Gate::forUser($superAdmin)->allows('grantAdministratorPermission', Role::class))->toBeTrue()
        ->and(Gate::forUser($broadestHolder)->allows('grantAdministratorPermission', Role::class))->toBeFalse()
        ->and(Gate::forUser($unprivileged)->allows('grantAdministratorPermission', Role::class))->toBeFalse();
});

// =====================================================================
// Granting/revoking roles.manage-administrators on a role takes effect
// immediately, through the real permission-cache invalidation Spatie's own
// model events perform -- no manual PermissionRegistrar::forgetCachedPermissions()
// call in either test. These exercise the grant/revoke mechanism directly
// (Role::givePermissionTo()/revokePermissionTo()), not the Super Admin
// actor performing it through an authorized save -- there is no save path
// to go through yet (story 0010); that half of this story's "grant made
// through the real save path" checklist item is 0010's to cover once its
// role-save action exists.
// =====================================================================

test('granting roles.manage-administrators to a role takes effect immediately', function () {
    $custom = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);
    $custom->givePermissionTo('roles.manage');

    $holder = User::factory()->create();
    $holder->assignRole($custom);

    $administrator = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    expect(Gate::forUser($holder)->allows('update', $administrator))->toBeFalse();

    $custom->givePermissionTo('roles.manage-administrators');

    expect($custom->fresh()->permissions->pluck('name')->sort()->values()->all())
        ->toBe(['roles.manage', 'roles.manage-administrators'])
        ->and(Gate::forUser($holder->fresh())->allows('update', $administrator))->toBeTrue();
});

test('revoking roles.manage-administrators from a role takes effect immediately', function () {
    $custom = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);
    $custom->givePermissionTo(['roles.manage', 'roles.manage-administrators']);

    $holder = User::factory()->create();
    $holder->assignRole($custom);

    $administrator = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    expect(Gate::forUser($holder)->allows('delete', $administrator))->toBeTrue();

    $custom->revokePermissionTo('roles.manage-administrators');

    expect(Gate::forUser($holder->fresh())->allows('delete', $administrator))->toBeFalse();
});
