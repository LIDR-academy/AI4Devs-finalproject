<?php

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

// --- Denial is enforced server-side, not merely hidden in the UI ---

test('authorize throws AuthorizationException when delete is denied', function () {
    $actor = User::factory()->create(); // holds no permissions at all
    $target = User::factory()->create();

    expect(fn () => Gate::forUser($actor)->authorize('delete', $target))
        ->toThrow(AuthorizationException::class);
});
