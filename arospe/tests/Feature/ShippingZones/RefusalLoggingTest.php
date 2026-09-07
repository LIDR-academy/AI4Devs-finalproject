<?php

use App\Actions\Shipping\CreateShippingZone;
use App\Actions\Shipping\DeleteShippingZone;
use App\Models\ShippingZone;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\PermissionRegistrar;

// Story 0033, Phase 4 re-audit finding N-1: covers whether a refusal at the action layer logs
// correctly via LogRefusedPrivilegedAttempt, matching
// tests/Feature/ProductCategories/RefusalLoggingTest.php's precedent shape.
//
// Not exhaustive across all four app/Actions/Shipping/ actions -- the mechanism is identical in
// every one of them (each constructor-injects LogRefusedPrivilegedAttempt and calls ->authorize()
// with the same targetType: 'shipping_zone' shape, per their own docblocks), so this file covers
// CreateShippingZone (a class-level target, no targetId) and DeleteShippingZone (an instance-level
// target, with targetId) -- one of each shape. RenameShippingZone and SyncShippingZoneGeography
// share DeleteShippingZone's instance-level shape exactly and are covered by the AuthorizationException
// assertions in tests/Feature/ShippingZones/ShippingZoneAuthorizationTest.php instead.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

test('CreateShippingZone authorization refusal is logged with the actor, ability and target type', function () {
    Log::spy();

    $actor = User::factory()->create();
    $this->actingAs($actor);

    try {
        app(CreateShippingZone::class)('Zona Norte');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && ($context['target_type'] ?? null) === 'shipping_zone'
            && array_key_exists('target_id', $context) && $context['target_id'] === null)
        ->once();

    expect(ShippingZone::count())->toBe(0);
});

test('DeleteShippingZone authorization refusal is logged with the actor, ability and target', function () {
    Log::spy();

    $creator = User::factory()->create();
    $creator->givePermissionTo('shipping.create');
    $this->actingAs($creator);
    $zone = app(CreateShippingZone::class)('Zona Norte');

    $actor = User::factory()->create();
    $this->actingAs($actor);

    try {
        app(DeleteShippingZone::class)($zone);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'delete'
            && ($context['target_type'] ?? null) === 'shipping_zone'
            && ($context['target_id'] ?? null) === $zone->id)
        ->once();

    $this->assertDatabaseHas('shipping_zones', ['id' => $zone->id]);
});
