<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

// F1: DatabaseSeeder's test@example.com fixture must be environment-guarded, while the
// RolePermissionSeeder call stays unconditional in every environment. Faking the environment
// this way is done by directly invoking the seeder rather than through the `db:seed` Artisan
// command, since that command's ConfirmableTrait would otherwise prompt (and, non-interactively,
// abort) when it detects a production environment.

test('seeding a production environment creates no test@example.com fixture user', function () {
    app()->instance('env', 'production');
    // Isolate this assertion from whatever SUPER_ADMIN_EMAIL happens to be set to locally: when
    // it is unset, RolePermissionSeeder::bootstrapSuperAdmin() is a no-op (`! filled($email)`),
    // so only DatabaseSeeder's own environment gate is under test here. Without this, a local
    // .env that (coincidentally, as in this repo's dev setup) sets SUPER_ADMIN_EMAIL to the same
    // address as the fixture user makes bootstrapSuperAdmin's *provision* branch create a
    // test@example.com row through a completely different code path, producing a false failure
    // that has nothing to do with the fixture gate this test exists to check.
    config(['auth.super_admin.email' => null]);

    (new DatabaseSeeder)();

    expect(User::where('email', 'test@example.com')->exists())->toBeFalse();
});

test('seeding a production environment still populates the roles and permission catalog', function () {
    app()->instance('env', 'production');

    (new DatabaseSeeder)();

    expect(Role::count())->toBe(2)
        ->and(Permission::count())->toBe(38);
});

test('seeding the default non-production test environment still creates the test@example.com fixture user', function () {
    $this->seed();

    expect(User::where('email', 'test@example.com')->exists())->toBeTrue();
});

// N4: the guard narrows from a "not production" deny-list to an explicit ['local', 'testing']
// allow-list, because staging/demo/qa are commonly internet-reachable too. Staging is the case
// that distinguishes the two: under the old `! app()->isProduction()` guard the fixture would
// still be created there.

test('seeding a staging environment creates no test@example.com fixture user', function () {
    app()->instance('env', 'staging');
    // Same isolation as the production case above: neutralize the ambient SUPER_ADMIN_EMAIL so
    // this test checks only DatabaseSeeder's own fixture gate, not RolePermissionSeeder's
    // separate (and unconditional-by-design) Super Admin provisioning path.
    config(['auth.super_admin.email' => null]);

    (new DatabaseSeeder)();

    expect(User::where('email', 'test@example.com')->exists())->toBeFalse();
});

test('seeding a staging environment still populates the roles and permission catalog', function () {
    app()->instance('env', 'staging');

    (new DatabaseSeeder)();

    expect(Role::count())->toBe(2)
        ->and(Permission::count())->toBe(38);
});

test('seeding a local environment still creates the test@example.com fixture user', function () {
    app()->instance('env', 'local');

    (new DatabaseSeeder)();

    expect(User::where('email', 'test@example.com')->exists())->toBeTrue();
});
