<?php

use App\Actions\Shipping\CreateShippingZone;
use App\Actions\Shipping\DeleteShippingZone;
use App\Models\GeographyEntry;
use App\Models\ShippingZone;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

// Story 0033, Phase 3 (TDD "red" step) -- see CreateShippingZoneTest.php's file banner; the same
// applies here. App\Actions\Shipping\DeleteShippingZone::__invoke(ShippingZone $shippingZone):
// bool does not exist yet.
//
// Corrected at Phase 4 security audit (finding F-1) -- see CreateShippingZoneTest.php's own
// corrected banner. DeleteShippingZone now authorizes `delete` on $shippingZone as its own first
// statement, so every test below runs actingAs() an actor holding both `shipping.create` (used
// here only to set up fixtures) and `shipping.delete`, matching
// tests/Feature/ProductCategories/DeleteProductCategoryTest.php's identical fix.

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->actor = User::factory()->create();
    $this->actor->givePermissionTo(['shipping.create', 'shipping.delete']);
    $this->actingAs($this->actor);
});

// D-1: the in-use-by-a-rate-rule guard is CONFIRMED but NOT implementable here, because
// shipping_rates does not exist until story 0036 -- see the single named skip at the bottom.

test('deleting a zone with no memberships removes the row outright, not a soft delete', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');

    $result = app(DeleteShippingZone::class)($zone);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('shipping_zones', ['id' => $zone->id]);
});

// D-7: proves nothing lingers to hold the unique index -- exactly what a soft delete would break.
// Rule::unique() does not apply the soft-delete scope, so a trashed "Zona Norte" would squat its
// name forever if this model soft-deleted.
test('the freed name is immediately reusable', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');

    app(DeleteShippingZone::class)($zone);

    $recreated = app(CreateShippingZone::class)('Zona Norte');

    expect($recreated->fresh()->name)->toBe('Zona Norte')
        ->and(ShippingZone::where('name', 'Zona Norte')->count())->toBe(1);
});

function deleteShippingZoneFixtureWithMemberships(): array
{
    $country = GeographyEntry::factory()->create();
    $community = GeographyEntry::factory()->community($country)->create();
    $gijon = GeographyEntry::factory()->municipality($community)->create();
    $aviles = GeographyEntry::factory()->municipality($community)->create();

    $zone = app(CreateShippingZone::class)('Zona Norte');
    $zone->geographyEntries()->attach([$gijon->id, $aviles->id]);

    return [$zone, $gijon, $aviles];
}

// Assert the PIVOT TABLE directly, not $zone->geographyEntries() -- the relation would re-query
// through the (now-deleted) zone's own key and could read as empty for the wrong reason.
test('deleting a zone with memberships removes every pivot row for that zone', function () {
    [$zone] = deleteShippingZoneFixtureWithMemberships();
    $zoneId = $zone->id;

    app(DeleteShippingZone::class)($zone);

    $this->assertDatabaseCount('shipping_zone_geography_entry', 0);
    expect(DB::table('shipping_zone_geography_entry')->where('shipping_zone_id', $zoneId)->exists())->toBeFalse();
});

// Highest-severity test in the story (task's own words): the distance between
// $zone->geographyEntries()->detach() and ->delete() is one word, and the second hard-deletes
// seeded catalog rows another story owns. Assert the EXACT ids still present, not a count() --
// a count passes if rows were deleted and recreated; ids do not.
test('deleting a zone leaves geography_entries completely untouched', function () {
    [$zone, $gijon, $aviles] = deleteShippingZoneFixtureWithMemberships();

    $idsBefore = GeographyEntry::query()->pluck('id')->sort()->values()->all();

    app(DeleteShippingZone::class)($zone);

    $idsAfter = GeographyEntry::query()->pluck('id')->sort()->values()->all();

    expect($idsAfter)->toBe($idsBefore)
        ->and(GeographyEntry::query()->whereKey($gijon->id)->exists())->toBeTrue()
        ->and(GeographyEntry::query()->whereKey($aviles->id)->exists())->toBeTrue();
});

// Guards a detach scoped by entry instead of by zone -- the same mistake D-2's overlap test
// catches from the other side.
test('deleting zone A does not strip a shared entry from zone B', function () {
    $country = GeographyEntry::factory()->create();
    $community = GeographyEntry::factory()->community($country)->create();
    $gijon = GeographyEntry::factory()->municipality($community)->create();

    $zoneA = app(CreateShippingZone::class)('Zona Norte');
    $zoneB = app(CreateShippingZone::class)('Asturias Centro');

    $zoneA->geographyEntries()->attach($gijon->id);
    $zoneB->geographyEntries()->attach($gijon->id);

    app(DeleteShippingZone::class)($zoneA);

    expect($zoneB->geographyEntries()->pluck('geography_entries.id')->all())->toBe([$gijon->id]);
});

test('deleting an unknown zone id fails cleanly with ModelNotFoundException, not a silent no-op', function () {
    app(CreateShippingZone::class)('Zona Norte');

    expect(fn () => ShippingZone::findOrFail((string) Str::uuid7()))
        ->toThrow(ModelNotFoundException::class);
});

// This story has no route/HTTP layer at all, so HasUuids' route-model-binding UUID validation
// (resolveRouteBindingQuery() rejecting a non-UUID parameter with Str::isUuid() before running a
// doomed query) is never invoked here -- findOrFail() below runs a real `WHERE id = ?` query that
// simply finds no matching row for the malformed string, throwing ModelNotFoundException for that
// ordinary reason. A malformed id must still fail the identical way as an unknown-but-valid one,
// never as a different error shape a future controller/component would have to special-case.
test('deleting a malformed, non-UUID zone id fails cleanly with ModelNotFoundException', function () {
    app(CreateShippingZone::class)('Zona Norte');

    expect(fn () => ShippingZone::findOrFail('not-a-uuid'))
        ->toThrow(ModelNotFoundException::class);
});

// D-1: hard-blocking a delete while a shipping_rates row still references the zone is CONFIRMED
// but NOT implementable here -- shipping_rates does not exist until story 0036. Named per R-8's
// own rule: the BLOCKING ARTIFACT first, the story id second, so a grep for `shipping_rates`
// survives any future renumbering of story 0036.
test('deleting a zone still referenced by a rate rule is hard-blocked with a count')
    ->skip('shipping_rates does not exist yet — story 0036 must un-skip this');
