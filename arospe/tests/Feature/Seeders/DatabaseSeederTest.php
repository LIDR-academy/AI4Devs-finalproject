<?php

use App\Enums\SalesRegionKind;
use App\Models\SalesRegion;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\ProductionSeeder;
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

// F-2 (Phase 5 review, story 0016): DatabaseSeeder::run() calls SalesRegionSeeder
// unconditionally, deliberately OUTSIDE the ['local', 'testing'] allow-list a few lines
// above it -- that placement is what AC9 ("the catalog is not environment-gated")
// requires. Every other Sales Region production-environment test in this file goes
// through ProductionSeeder, which has no environment gate to fall into at all, so none
// of them would catch a regression that moved DatabaseSeeder's `$this->call(SalesRegionSeeder::class)`
// line inside the allow-list block. This test drives DatabaseSeeder itself.

test('seeding a production environment through DatabaseSeeder still populates the Sales Region catalog', function () {
    app()->instance('env', 'production');
    config(['auth.super_admin.email' => null]);

    (new DatabaseSeeder)();

    expect(SalesRegion::where('kind', SalesRegionKind::Country)->count())->toBeGreaterThanOrEqual(200)
        ->and(SalesRegion::where('is_active', true)->count())->toBe(6);
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

// Story 0016 (D8): ProductionSeeder composes the required application catalogs
// (RolePermissionSeeder + SalesRegionSeeder) into one class production is meant to
// target forever, instead of the single targeted `--class=RolePermissionSeeder`
// invocation story 0002's runbook documented -- a call that would now silently skip
// the Sales Region catalog with no error at all. These cases mirror 0002's existing
// production/staging pairs above, one level down.

test('seeding a production environment populates the Sales Region catalog', function () {
    app()->instance('env', 'production');
    config(['auth.super_admin.email' => null]);

    (new ProductionSeeder)();

    expect(SalesRegion::where('kind', SalesRegionKind::Country)->count())->toBeGreaterThanOrEqual(200)
        ->and(SalesRegion::where('is_active', true)->count())->toBe(6);
});

test('the production seeder also populates the roles and permission catalog', function () {
    app()->instance('env', 'production');
    config(['auth.super_admin.email' => null]);

    (new ProductionSeeder)();

    expect(Role::count())->toBe(2)
        ->and(Permission::count())->toBe(38);
});

test('seeding a staging environment through the production seeder still populates the Sales Region catalog', function () {
    app()->instance('env', 'staging');
    config(['auth.super_admin.email' => null]);

    (new ProductionSeeder)();

    expect(SalesRegion::where('kind', SalesRegionKind::Country)->count())->toBeGreaterThanOrEqual(200)
        ->and(SalesRegion::where('is_active', true)->count())->toBe(6);
});
