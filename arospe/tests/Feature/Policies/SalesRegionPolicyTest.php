<?php

// Story 0017 — App\Policies\SalesRegionPolicy, auto-discovered for App\Models\SalesRegion by
// name alone (no provider registration; see conventions/base-standards.md). The Super Admin
// bypass test passes regardless of the policy's own logic, since Gate::before grants a Super
// Admin actor before any policy is ever consulted.
//
// Two abilities only (D8): sales-regions.create / sales-regions.delete get no policy method,
// because nothing in this story or 0018 calls them -- the catalog is fixed, seeded, and has no
// create/delete affordance.

use App\Models\SalesRegion;
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
// viewAny
// =====================================================================

test('viewAny is allowed for an actor holding sales-regions.view and denied for one without it', function () {
    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('sales-regions.view');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('viewAny', SalesRegion::class))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('viewAny', SalesRegion::class))->toBeFalse();
});

// =====================================================================
// update
// =====================================================================

test('update is allowed for an actor holding sales-regions.edit and denied for one without it', function () {
    $target = SalesRegion::factory()->create();

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('sales-regions.edit');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('update', $target))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('update', $target))->toBeFalse();
});

// Narrowness — holding only sales-regions.view is not sufficient for update. Distinct from the
// bare "denied for one without it" case above (an actor with NO permission at all): this actor
// holds a real, different permission on the SAME module, so a policy that accidentally checked
// "any sales-regions.* permission" rather than the exact sales-regions.edit string would pass
// this actor incorrectly.
test('update is denied for an actor holding only sales-regions.view', function () {
    $target = SalesRegion::factory()->create();

    $viewOnlyActor = User::factory()->create();
    $viewOnlyActor->givePermissionTo('sales-regions.view');

    expect(Gate::forUser($viewOnlyActor)->allows('update', $target))->toBeFalse();
});

// No target-dependent branch (unlike UserPolicy::update()'s Super Admin exclusion) -- update()
// answers identically regardless of which SalesRegion row is passed, since there is no
// untouchable row in this domain today.
test('update answers identically for a default entry and an ordinary entry, for the same actor', function () {
    $defaultRegion = SalesRegion::factory()->isDefault()->create();
    $ordinaryRegion = SalesRegion::factory()->create();

    $actor = User::factory()->create();
    $actor->givePermissionTo('sales-regions.edit');

    expect(Gate::forUser($actor)->allows('update', $defaultRegion))->toBeTrue()
        ->and(Gate::forUser($actor)->allows('update', $ordinaryRegion))->toBeTrue();
});

// =====================================================================
// Denial is enforced server-side, not merely hidden in the UI
// =====================================================================

test('authorize throws AuthorizationException when update is denied', function () {
    $actor = User::factory()->create(); // holds no permission at all
    $target = SalesRegion::factory()->create();

    expect(fn () => Gate::forUser($actor)->authorize('update', $target))
        ->toThrow(AuthorizationException::class);
});

// =====================================================================
// Super Admin bypass — PASSES even in RED phase (see file-header note): Gate::before grants a
// Super Admin actor regardless of whether SalesRegionPolicy exists at all.
// =====================================================================

test('a Super Admin actor passes every SalesRegionPolicy ability while holding zero permission rows', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $target = SalesRegion::factory()->create();

    expect($superAdmin->getAllPermissions())->toHaveCount(0)
        ->and(Gate::forUser($superAdmin)->allows('viewAny', SalesRegion::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('update', $target))->toBeTrue();
});
