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
