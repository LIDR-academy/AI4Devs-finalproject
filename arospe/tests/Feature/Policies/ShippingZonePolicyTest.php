<?php

use App\Models\ShippingZone;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\PermissionRegistrar;

// Story 0033, Phase 3 (TDD "red" step): App\Policies\ShippingZonePolicy, App\Models\ShippingZone
// and its factory do not exist yet -- every test below is expected to fail (class not found)
// until backend-expert implements them in the next step of the TDD cycle. That failure is the
// correct, intended "red" outcome.
//
// Corrected at Phase 4 re-audit (finding N-2): this banner previously claimed the policy "ships
// with ZERO call sites... since the four actions deliberately self-authorize nothing" -- that is
// no longer true. The Phase 4 audit's own finding F-1 added a Gate::authorize() call (via
// LogRefusedPrivilegedAttempt) as the first statement of all four app/Actions/Shipping/ actions
// (see tests/Feature/ShippingZones/CreateShippingZoneTest.php's corrected banner), so this policy
// now has four real call sites. This file is still worth keeping as-is: it drives the policy
// DIRECTLY via Gate::forUser(...)->authorize(...), independent of any action, which is what proves
// the ability rules themselves (permission-string match, target-independence, Super Admin bypass)
// rather than how a particular action happens to invoke them --
// tests/Feature/ShippingZones/ShippingZoneAuthorizationTest.php is the complementary suite that
// proves the four actions actually call this policy correctly. Every ability gets both an allow
// and a deny test, per docs/testing/qa/what-not-to-test.md's authorization rule, following
// tests/Feature/Policies/UserPolicyTest.php and tests/Feature/Policies/ProductCategoryPolicyTest.php's
// shape.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

test('viewAny is allowed for an actor holding shipping.view and denied for one without it', function () {
    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('shipping.view');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('viewAny', ShippingZone::class))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('viewAny', ShippingZone::class))->toBeFalse();
});

test('create is allowed for an actor holding shipping.create and denied for one without it', function () {
    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('shipping.create');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('create', ShippingZone::class))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('create', ShippingZone::class))->toBeFalse();
});

test('update is allowed for an actor holding shipping.edit and denied for one without it', function () {
    $target = ShippingZone::factory()->create();

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('shipping.edit');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('update', $target))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('update', $target))->toBeFalse();
});

test('delete is allowed for an actor holding shipping.delete and denied for one without it', function () {
    $target = ShippingZone::factory()->create();

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('shipping.delete');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('delete', $target))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('delete', $target))->toBeFalse();
});

// Server-side enforcement -- not merely allows() returning false, per what-not-to-test.md's
// authorization rule. Proves a denial is a real, throwing refusal rather than merely hidden in a
// UI a caller could bypass.
test('Gate::forUser denies each ability by throwing AuthorizationException, never merely returning false', function () {
    $target = ShippingZone::factory()->create();
    $deniedActor = User::factory()->create();

    expect(fn () => Gate::forUser($deniedActor)->authorize('viewAny', ShippingZone::class))
        ->toThrow(AuthorizationException::class);

    expect(fn () => Gate::forUser($deniedActor)->authorize('create', ShippingZone::class))
        ->toThrow(AuthorizationException::class);

    expect(fn () => Gate::forUser($deniedActor)->authorize('update', $target))
        ->toThrow(AuthorizationException::class);

    expect(fn () => Gate::forUser($deniedActor)->authorize('delete', $target))
        ->toThrow(AuthorizationException::class);
});

// Super Admin bypass, consistent with every other policy in this repo (UserPolicy, RolePolicy,
// SalesRegionPolicy, MediaPolicy, ProductCategoryPolicy, ProductPolicy, ProductAttributeTypePolicy).
test('a Super Admin actor passes every ShippingZonePolicy ability while holding zero permission rows', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $target = ShippingZone::factory()->create();

    expect($superAdmin->getAllPermissions())->toHaveCount(0)
        ->and(Gate::forUser($superAdmin)->allows('viewAny', ShippingZone::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('create', ShippingZone::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('update', $target))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('delete', $target))->toBeTrue();
});

// The permission names are asserted against RolePermissionSeeder's seeded catalog -- a permission
// string not in the catalog throws PermissionDoesNotExist at runtime, so this is a correctness
// test, not a style one (D-9/AC: confirmed to gate on the already-seeded shipping.* module, no new
// permission and no RolePermissionSeeder change).
test('the four permission strings ShippingZonePolicy gates on are all in the seeded shipping module', function () {
    expect(in_array('shipping', RolePermissionSeeder::MODULES, true))->toBeTrue();

    // givePermissionTo() throws Spatie\Permission\Exceptions\PermissionDoesNotExist if any of
    // these four strings is not in the seeded catalog -- this call succeeding is itself the
    // assertion that all four exist.
    $actor = User::factory()->create();
    $actor->givePermissionTo(['shipping.view', 'shipping.create', 'shipping.edit', 'shipping.delete']);

    expect($actor->getAllPermissions())->toHaveCount(4);
});
