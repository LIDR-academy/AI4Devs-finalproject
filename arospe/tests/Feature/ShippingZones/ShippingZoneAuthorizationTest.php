<?php

use App\Actions\Shipping\CreateShippingZone;
use App\Actions\Shipping\DeleteShippingZone;
use App\Actions\Shipping\RenameShippingZone;
use App\Actions\Shipping\SyncShippingZoneGeography;
use App\Models\GeographyEntry;
use App\Models\ShippingZone;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

// Story 0033, Phase 4 re-audit finding N-1: the F-1 fix added Gate::authorize() (via
// LogRefusedPrivilegedAttempt) as the first statement of all four app/Actions/Shipping/ actions,
// but no test in this story exercised the DENY path at the action layer -- appsec-auditor proved
// this by mutation testing (commenting out all four gate calls; the whole story suite stayed
// byte-identical green, because every existing test acts as a permitted actor).
// tests/Feature/Policies/ShippingZonePolicyTest.php only drives the policy directly via
// Gate::forUser(...)->authorize(...), never through an action, so it does not close this gap
// either.
//
// Modelled on tests/Feature/Products/ProductVariantAuthorizationTest.php (the closest real
// precedent for "four self-authorizing domain actions, one deny + one control test each"), which
// is itself modelled on tests/Feature/Products/ProductAuthorizationTest.php.
//
// Each deny test asserts AuthorizationException SPECIFICALLY (never a generic Throwable), and
// that no state changed -- this is what would catch a gate being reordered below validation, or
// (for DeleteShippingZone) below story 0036's future in-use-by-a-rate-rule count guard.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// =====================================================================
// CreateShippingZone -- authorizes `create` on ShippingZone::class
// =====================================================================

test('CreateShippingZone is refused for an actor lacking shipping.create and writes no row', function () {
    $actor = User::factory()->create();
    $this->actingAs($actor);

    $caught = null;

    try {
        app(CreateShippingZone::class)('Zona Norte');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class);
    expect(ShippingZone::count())->toBe(0);
});

test('CreateShippingZone succeeds for an actor holding shipping.create, as the control', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('shipping.create');
    $this->actingAs($actor);

    $zone = app(CreateShippingZone::class)('Zona Norte');

    expect(ShippingZone::count())->toBe(1)
        ->and($zone->fresh())->not->toBeNull();
});

// =====================================================================
// RenameShippingZone -- authorizes `update` on the target ShippingZone
// =====================================================================

test('RenameShippingZone is refused for an actor lacking shipping.edit and leaves the name unchanged', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('shipping.create');
    $this->actingAs($creator);
    $zone = app(CreateShippingZone::class)('Zona Norte');

    $actor = User::factory()->create();
    $this->actingAs($actor);

    $caught = null;

    try {
        app(RenameShippingZone::class)($zone, 'Should Not Persist');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class);
    expect($zone->fresh()->name)->toBe('Zona Norte');
});

test('RenameShippingZone succeeds for an actor holding shipping.edit, as the control', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('shipping.create');
    $this->actingAs($creator);
    $zone = app(CreateShippingZone::class)('Zona Norte');

    $actor = User::factory()->create();
    $actor->givePermissionTo('shipping.edit');
    $this->actingAs($actor);

    $renamed = app(RenameShippingZone::class)($zone, 'Cornisa Cantábrica');

    expect($renamed->fresh()->name)->toBe('Cornisa Cantábrica');
});

// =====================================================================
// DeleteShippingZone -- authorizes `delete` on the target ShippingZone
// =====================================================================

test('DeleteShippingZone is refused for an actor lacking shipping.delete, the zone survives, and its pivot rows are untouched', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('shipping.create');
    $this->actingAs($creator);
    $zone = app(CreateShippingZone::class)('Zona Norte');
    $entry = GeographyEntry::factory()->create();
    $zone->geographyEntries()->attach($entry->id);

    $actor = User::factory()->create();
    $this->actingAs($actor);

    $caught = null;

    try {
        app(DeleteShippingZone::class)($zone);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class);
    $this->assertDatabaseHas('shipping_zones', ['id' => $zone->id]);
    $this->assertDatabaseCount('shipping_zone_geography_entry', 1);
    expect(DB::table('shipping_zone_geography_entry')->where('shipping_zone_id', $zone->id)->exists())->toBeTrue();
});

test('DeleteShippingZone succeeds for an actor holding shipping.delete, as the control', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('shipping.create');
    $this->actingAs($creator);
    $zone = app(CreateShippingZone::class)('Zona Norte');

    $actor = User::factory()->create();
    $actor->givePermissionTo('shipping.delete');
    $this->actingAs($actor);

    $result = app(DeleteShippingZone::class)($zone);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('shipping_zones', ['id' => $zone->id]);
});

// =====================================================================
// SyncShippingZoneGeography -- authorizes `update` on the target ShippingZone
// =====================================================================

test('SyncShippingZoneGeography is refused for an actor lacking shipping.edit and writes no pivot row', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('shipping.create');
    $this->actingAs($creator);
    $zone = app(CreateShippingZone::class)('Zona Norte');
    $entry = GeographyEntry::factory()->create();

    $actor = User::factory()->create();
    $this->actingAs($actor);

    $caught = null;

    try {
        app(SyncShippingZoneGeography::class)($zone, [$entry->id]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class);
    $this->assertDatabaseCount('shipping_zone_geography_entry', 0);
});

test('SyncShippingZoneGeography succeeds for an actor holding shipping.edit, as the control', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('shipping.create');
    $this->actingAs($creator);
    $zone = app(CreateShippingZone::class)('Zona Norte');
    $entry = GeographyEntry::factory()->create();

    $actor = User::factory()->create();
    $actor->givePermissionTo('shipping.edit');
    $this->actingAs($actor);

    app(SyncShippingZoneGeography::class)($zone, [$entry->id]);

    expect($zone->geographyEntries()->count())->toBe(1);
});

// =====================================================================
// Super Admin bypass -- consistent with every other action-layer authorization test in this repo
// (e.g. tests/Feature/Products/ProductVariantAuthorizationTest.php).
// =====================================================================

test('a Super Admin actor holding zero permission rows passes create, rename, sync and delete', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $zone = app(CreateShippingZone::class)('Zona Norte');
    expect($zone)->not->toBeNull();

    $renamed = app(RenameShippingZone::class)($zone, 'Cornisa Cantábrica');
    expect($renamed->fresh()->name)->toBe('Cornisa Cantábrica');

    $entry = GeographyEntry::factory()->create();
    app(SyncShippingZoneGeography::class)($zone, [$entry->id]);
    expect($zone->geographyEntries()->count())->toBe(1);

    $result = app(DeleteShippingZone::class)($zone);
    expect($result)->toBeTrue();
});
