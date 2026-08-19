<?php

use App\Models\Role as AppRole;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// --- viewAny / create / update follow their permission ---

test('viewAny is allowed for an actor holding users.view and denied for one without it', function () {
    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('users.view');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('viewAny', User::class))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('viewAny', User::class))->toBeFalse();
});

test('create is allowed for an actor holding users.create and denied for one without it', function () {
    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('users.create');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('create', User::class))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('create', User::class))->toBeFalse();
});

test('update is allowed for an actor holding users.edit and denied for one without it', function () {
    $target = User::factory()->create();

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('users.edit');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('update', $target))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('update', $target))->toBeFalse();
});

test('update returns false against a Super Admin target regardless of the actors permissions', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');

    $superAdminTarget = User::factory()->create();
    $superAdminTarget->assignRole('Super Admin');

    expect(Gate::forUser($actor)->allows('update', $superAdminTarget))->toBeFalse();
});

// --- updateSensitiveAttributes: security audit finding F1 (Phase 4, story 0004) ---
// status/email on an Administrator target require the same permission a role change does.

test('updateSensitiveAttributes denies an actor lacking roles.manage-administrators against an Administrator target, and allows one holding it', function () {
    $target = User::factory()->create();
    $target->assignRole('Administrator');

    $deniedActor = User::factory()->create();
    $deniedActor->givePermissionTo('users.edit');

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo(['users.edit', 'roles.manage-administrators']);

    expect(Gate::forUser($deniedActor)->allows('updateSensitiveAttributes', $target))->toBeFalse()
        ->and(Gate::forUser($allowedActor)->allows('updateSensitiveAttributes', $target))->toBeTrue();
});

test('updateSensitiveAttributes allows an actor lacking roles.manage-administrators when the target holds no Administrator role', function () {
    $target = User::factory()->create();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');

    expect(Gate::forUser($actor)->allows('updateSensitiveAttributes', $target))->toBeTrue();
});

test('updateSensitiveAttributes returns false against a Super Admin target regardless of the actors permissions', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.edit', 'roles.manage-administrators']);

    $superAdminTarget = User::factory()->create();
    $superAdminTarget->assignRole('Super Admin');

    expect(Gate::forUser($actor)->allows('updateSensitiveAttributes', $superAdminTarget))->toBeFalse();
});

test('updateSensitiveAttributes is denied outright when the actor lacks users.edit, even holding roles.manage-administrators', function () {
    $target = User::factory()->create();
    $target->assignRole('Administrator');

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage-administrators');

    expect(Gate::forUser($actor)->allows('updateSensitiveAttributes', $target))->toBeFalse();
});

// --- promoteToAdministrator / downgrade / delete key on roles.manage-administrators ---

test('promoteToAdministrator denies an actor lacking roles.manage-administrators against an Administrator target, and allows one holding it', function () {
    $target = User::factory()->create();
    $target->assignRole('Administrator');

    $deniedActor = User::factory()->create();

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('roles.manage-administrators');

    expect(Gate::forUser($deniedActor)->allows('promoteToAdministrator', $target))->toBeFalse()
        ->and(Gate::forUser($allowedActor)->allows('promoteToAdministrator', $target))->toBeTrue();
});

test('downgrade denies an actor lacking roles.manage-administrators against an Administrator target, and allows one holding it', function () {
    $target = User::factory()->create();
    $target->assignRole('Administrator');

    $deniedActor = User::factory()->create();

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('roles.manage-administrators');

    expect(Gate::forUser($deniedActor)->allows('downgrade', $target))->toBeFalse()
        ->and(Gate::forUser($allowedActor)->allows('downgrade', $target))->toBeTrue();
});

test('delete denies an actor lacking roles.manage-administrators against an Administrator target, and allows one holding both required permissions', function () {
    $target = User::factory()->create();
    $target->assignRole('Administrator');

    // Holds users.delete but not the stricter permission -- must still be denied.
    $deniedActor = User::factory()->create();
    $deniedActor->givePermissionTo('users.delete');

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo(['users.delete', 'roles.manage-administrators']);

    expect(Gate::forUser($deniedActor)->allows('delete', $target))->toBeFalse()
        ->and(Gate::forUser($allowedActor)->allows('delete', $target))->toBeTrue();
});

// --- promoteToAdministrator's nullable $target (instance vs. class-level create path) ---

test('promoteToAdministrator is invoked both as an instance check and a class-level check on the create path', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage-administrators');
    $target = User::factory()->create();

    // The class-level call (User::class, no target) is what the create path uses, since no
    // user exists yet. It must not raise ArgumentCountError -- that is what proves the policy
    // method's $target parameter is declared `?User $target = null`, not a bare `User $target`.
    $instanceResult = Gate::forUser($actor)->allows('promoteToAdministrator', $target);
    $classLevelResult = Gate::forUser($actor)->allows('promoteToAdministrator', User::class);

    expect($instanceResult)->toBeTrue()
        ->and($classLevelResult)->toBeTrue();
});

// --- downgrade / delete must key on the seeded role name, not on "looks powerful" ---

test('downgrade allows an actor lacking roles.manage-administrators when the target holds no role at all', function () {
    $target = User::factory()->create();
    $actorWithoutPermission = User::factory()->create();

    expect(Gate::forUser($actorWithoutPermission)->allows('downgrade', $target))->toBeTrue();
});

test('downgrade allows an actor lacking roles.manage-administrators when the target holds a broad custom role that is not Administrator', function () {
    $broadRole = Role::create(['name' => 'Store Manager', 'guard_name' => 'web']);
    $broadRole->givePermissionTo(['users.view', 'users.create', 'users.edit', 'users.delete', 'products.view', 'products.create', 'products.edit', 'products.delete']);

    $target = User::factory()->create();
    $target->assignRole($broadRole);

    $actorWithoutPermission = User::factory()->create();

    expect(Gate::forUser($actorWithoutPermission)->allows('downgrade', $target))->toBeTrue();
});

test('delete allows an actor holding only users.delete when the target holds no role at all', function () {
    $target = User::factory()->create();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.delete');

    expect(Gate::forUser($actor)->allows('delete', $target))->toBeTrue();
});

test('delete allows an actor holding only users.delete when the target holds a broad custom role that is not Administrator', function () {
    $broadRole = Role::create(['name' => 'Store Manager', 'guard_name' => 'web']);
    $broadRole->givePermissionTo(['users.view', 'users.create', 'users.edit', 'users.delete', 'products.view', 'products.create', 'products.edit', 'products.delete']);

    $target = User::factory()->create();
    $target->assignRole($broadRole);

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.delete');

    expect(Gate::forUser($actor)->allows('delete', $target))->toBeTrue();
});

// --- No self-targeting exception ---

test('self-targeting is not an exception: an Administrator holder lacking the stricter permission is denied downgrade and delete against themselves', function () {
    $actor = User::factory()->create();
    $actor->assignRole('Administrator'); // holds users.delete but not roles.manage-administrators

    expect(Gate::forUser($actor)->allows('downgrade', $actor))->toBeFalse()
        ->and(Gate::forUser($actor)->allows('delete', $actor))->toBeFalse();
});

// --- Super Admin bypass ---

test('a Super Admin actor passes every UserPolicy ability while holding zero permission rows', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $target = User::factory()->create();
    $administratorTarget = User::factory()->create();
    $administratorTarget->assignRole('Administrator');

    expect($superAdmin->getAllPermissions())->toHaveCount(0)
        ->and(Gate::forUser($superAdmin)->allows('viewAny', User::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('create', User::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('update', $target))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('promoteToAdministrator', $target))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('promoteToAdministrator', User::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('downgrade', $administratorTarget))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('delete', $administratorTarget))->toBeTrue();
});

// --- Story 0005 regression edges (N1): the three delete-matrix cases not already
// covered above -- a roles.manage-only actor, a target holding Administrator
// alongside another role, and the last-remaining-Administrator headcount. These
// already pass against 0004's shipped policy; they are re-proved here because the
// SoftDeletes global scope story 0005 installs rewrites the queries underneath
// every hasRole()/hasPermissionTo() check. Not expected to go red.

test('delete denies an actor holding only the general roles.manage permission against an Administrator target', function () {
    $target = User::factory()->create();
    $target->assignRole('Administrator');

    // Holds users.delete and the general roles.manage permission, but not the
    // stricter roles.manage-administrators -- proving the two are not conflated.
    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.delete', 'roles.manage']);

    expect(Gate::forUser($actor)->allows('delete', $target))->toBeFalse();
});

test('delete denies an actor lacking roles.manage-administrators against a target holding Administrator alongside another role', function () {
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    $target = User::factory()->create();
    $target->assignRole('Administrator');
    $target->assignRole($editorRole);

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.delete');

    expect(Gate::forUser($actor)->allows('delete', $target))->toBeFalse();
});

test('deleting the last remaining Administrator is not specially protected', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $lastAdministrator = User::factory()->create();
    $lastAdministrator->assignRole('Administrator');

    expect(User::role('Administrator', 'web')->count())->toBe(1)
        ->and(Gate::forUser($superAdmin)->allows('delete', $lastAdministrator))->toBeTrue();
});

// --- Story 0005 (new — must go red first): delete() refuses an already
// soft-deleted target, so a withTrashed() call site cannot re-run the
// obfuscation and rewrite the placeholder on a trashed row. Nothing in the
// shipped policy satisfies this yet -- there is no SoftDeletes trait, no
// trashed() method, and no trashed-target branch in UserPolicy::delete().

test('delete denies a target that is already soft-deleted, so the obfuscated placeholder cannot be rewritten', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.delete');

    // Goes through the real delete() flow rather than poking `deleted_at`
    // directly: Laravel 13's base Factory class has no built-in trashed()
    // state (confirmed against the installed vendor/laravel/framework
    // source -- only SoftDeletes::trashed(), an instance method, exists),
    // so this also does not depend on one existing.
    $target = User::factory()->create();
    $target->delete();

    expect(Gate::forUser($actor)->allows('delete', $target))->toBeFalse();
});

// --- Denial is enforced server-side, not merely hidden in the UI ---

test('authorize throws AuthorizationException when delete is denied', function () {
    $actor = User::factory()->create(); // holds no permissions at all
    $target = User::factory()->create();

    expect(fn () => Gate::forUser($actor)->authorize('delete', $target))
        ->toThrow(AuthorizationException::class);
});

// =====================================================================
// Story 0008a — the two tiers must not be aliased onto one another. With
// auth.super_admin.role overridden to a non-default value, update() and
// delete()'s Super Admin branch must follow the CONFIGURED name (via
// App\Models\Role::superAdminName()), while updateSensitiveAttributes(),
// downgrade() and delete()'s Administrator branch must keep following
// the LOCKED literal RoleName::Administrator, regardless of that config
// value. Neither mechanism may resolve through the other's source of
// truth.
// =====================================================================

test('with auth.super_admin.role overridden, update() and delete() follow the configured name, not the literal "Super Admin"', function () {
    config(['auth.super_admin.role' => 'Something Else']);

    // firstOrCreateSuperAdminRole() is the sanctioned way to bring the configured role into
    // existence -- it bypasses the `creating` guard that otherwise refuses any role acquiring
    // the configured Super Admin name (story 0008).
    $configuredSuperAdminRole = AppRole::firstOrCreateSuperAdminRole();
    $ordinaryRoleNamedSuperAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.edit', 'users.delete', 'roles.manage-administrators']);

    $configuredTarget = User::factory()->create();
    $configuredTarget->assignRole($configuredSuperAdminRole);

    $literalTarget = User::factory()->create();
    $literalTarget->assignRole($ordinaryRoleNamedSuperAdmin);

    // The role actually configured as Super Admin is uneditable/undeletable...
    expect(Gate::forUser($actor)->allows('update', $configuredTarget))->toBeFalse()
        ->and(Gate::forUser($actor)->allows('delete', $configuredTarget))->toBeFalse()
        // ...while a role that is merely literally named "Super Admin" (but is not the
        // configured one) is fully ordinary.
        ->and(Gate::forUser($actor)->allows('update', $literalTarget))->toBeTrue()
        ->and(Gate::forUser($actor)->allows('delete', $literalTarget))->toBeTrue();
});

test('with auth.super_admin.role overridden, the Administrator-tier abilities still key on the locked literal name, unaffected by that config value', function () {
    config(['auth.super_admin.role' => 'Something Else']);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    $deniedActor = User::factory()->create();
    $deniedActor->givePermissionTo('users.edit');

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo(['users.edit', 'users.delete', 'roles.manage-administrators']);

    $target = User::factory()->create();
    $target->assignRole($administratorRole);

    expect(Gate::forUser($deniedActor)->allows('updateSensitiveAttributes', $target))->toBeFalse()
        ->and(Gate::forUser($deniedActor)->allows('downgrade', $target))->toBeFalse()
        ->and(Gate::forUser($deniedActor)->allows('delete', $target))->toBeFalse()
        ->and(Gate::forUser($allowedActor)->allows('updateSensitiveAttributes', $target))->toBeTrue()
        ->and(Gate::forUser($allowedActor)->allows('downgrade', $target))->toBeTrue()
        ->and(Gate::forUser($allowedActor)->allows('delete', $target))->toBeTrue();
});
