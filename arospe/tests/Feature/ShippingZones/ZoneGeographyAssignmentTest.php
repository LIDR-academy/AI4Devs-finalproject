<?php

use App\Actions\Shipping\CreateShippingZone;
use App\Actions\Shipping\SyncShippingZoneGeography;
use App\Models\GeographyEntry;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

// Story 0033, Phase 3 (TDD "red" step) -- see CreateShippingZoneTest.php's file banner; the same
// applies here. App\Actions\Shipping\SyncShippingZoneGeography does not exist yet.
//
// Corrected at Phase 4 security audit (finding F-1) -- see CreateShippingZoneTest.php's own
// corrected banner. SyncShippingZoneGeography now authorizes `update` on the zone as its own
// first statement, so every test below runs actingAs() an actor holding both `shipping.create`
// (used here only to set up fixtures) and `shipping.edit`.

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->actor = User::factory()->create();
    $this->actor->givePermissionTo(['shipping.create', 'shipping.edit']);
    $this->actingAs($this->actor);
});

// Test-data strategy (per the story's own "never seed the geography catalog" rule): every entry
// below is created via GeographyEntryFactory with explicit names, never looked up from a seeded
// catalog. Most tests need only a row with the right level; where parentage genuinely matters
// (mixing levels, D-3's literal-not-transitive test), the full país -> comunidad -> municipio
// chain is built inline with GeographyEntryFactory::community()/municipality(), both of which
// require an explicit parent argument.

test('one entry at each level round-trips through the pivot', function (Closure $makeEntry, string $expectedLevel) {
    $zone = app(CreateShippingZone::class)('Zona Norte');
    $entry = $makeEntry();

    app(SyncShippingZoneGeography::class)($zone, [$entry->id]);

    $pivotRows = DB::table('shipping_zone_geography_entry')->where('shipping_zone_id', $zone->id)->get();

    expect($pivotRows)->toHaveCount(1)
        ->and((int) $pivotRows->first()->geography_entry_id)->toBe($entry->id);

    $roundTripped = $zone->geographyEntries()->first();

    expect($roundTripped->id)->toBe($entry->id)
        ->and($roundTripped->level->value)->toBe($expectedLevel);
})->with([
    'country' => [fn () => GeographyEntry::factory()->create(['name' => 'Francia']), 'country'],
    'community' => [
        fn () => GeographyEntry::factory()->community(GeographyEntry::factory()->create(['name' => 'España']))->create(['name' => 'Galicia']),
        'community',
    ],
    'municipality' => [
        fn () => GeographyEntry::factory()->municipality(
            GeographyEntry::factory()->community(GeographyEntry::factory()->create(['name' => 'España']))->create(['name' => 'Asturias'])
        )->create(['name' => 'Gijón']),
        'municipality',
    ],
]);

// The PRD's own "Gijón, Avilés and Siero" example -- a separate test because the assertion
// differs (count = 3, exact id set), not a fourth dataset case.
test('assigning several entries at once syncs the exact set', function () {
    $spain = GeographyEntry::factory()->create(['name' => 'España']);
    $asturias = GeographyEntry::factory()->community($spain)->create(['name' => 'Asturias']);
    $gijon = GeographyEntry::factory()->municipality($asturias)->create(['name' => 'Gijón']);
    $aviles = GeographyEntry::factory()->municipality($asturias)->create(['name' => 'Avilés']);
    $siero = GeographyEntry::factory()->municipality($asturias)->create(['name' => 'Siero']);

    $zone = app(CreateShippingZone::class)('Zona Norte');

    app(SyncShippingZoneGeography::class)($zone, [$gijon->id, $aviles->id, $siero->id]);

    $ids = $zone->geographyEntries()->pluck('geography_entries.id')->sort()->values()->all();

    expect($ids)->toHaveCount(3)
        ->and($ids)->toBe(collect([$gijon->id, $aviles->id, $siero->id])->sort()->values()->all());
});

test('a single zone may mix geography levels', function () {
    $francia = GeographyEntry::factory()->create(['name' => 'Francia']);
    $spain = GeographyEntry::factory()->create(['name' => 'España']);
    $galicia = GeographyEntry::factory()->community($spain)->create(['name' => 'Galicia']);
    $gijon = GeographyEntry::factory()->municipality($galicia)->create(['name' => 'Gijón']);

    $zone = app(CreateShippingZone::class)('Zona Norte');

    app(SyncShippingZoneGeography::class)($zone, [$francia->id, $galicia->id, $gijon->id]);

    $ids = $zone->geographyEntries()->pluck('geography_entries.id')->sort()->values()->all();

    expect($ids)->toBe(collect([$francia->id, $galicia->id, $gijon->id])->sort()->values()->all());
});

// D-4: syncing [A, B] then [B, C] leaves exactly [B, C] -- proves replace, not append, semantics.
test('syncing a zone geography replaces the prior set rather than appending to it', function () {
    $a = GeographyEntry::factory()->create(['name' => 'A']);
    $b = GeographyEntry::factory()->create(['name' => 'B']);
    $c = GeographyEntry::factory()->create(['name' => 'C']);

    $zone = app(CreateShippingZone::class)('Zona Norte');

    app(SyncShippingZoneGeography::class)($zone, [$a->id, $b->id]);
    app(SyncShippingZoneGeography::class)($zone, [$b->id, $c->id]);

    $ids = $zone->geographyEntries()->pluck('geography_entries.id')->sort()->values()->all();

    expect($ids)->toBe(collect([$b->id, $c->id])->sort()->values()->all());
});

// D-5: an empty array is legal and clears coverage without touching the zone row itself.
test('syncing an empty array clears coverage and leaves the zone itself intact', function () {
    $entry = GeographyEntry::factory()->create();
    $zone = app(CreateShippingZone::class)('Zona Norte');
    app(SyncShippingZoneGeography::class)($zone, [$entry->id]);

    app(SyncShippingZoneGeography::class)($zone, []);

    expect($zone->geographyEntries()->count())->toBe(0);
    $this->assertDatabaseHas('shipping_zones', ['id' => $zone->id]);
});

// D-2: the same entry twice in one zone must be refused BY THE DATABASE. Driven through a direct
// insert against the composite primary key -- never sync(), which de-duplicates its own input and
// would make this pass vacuously with or without the constraint.
test('the same entry twice in one zone is refused by the database, driven through a direct insert against the composite primary key', function () {
    $entry = GeographyEntry::factory()->create();
    $zone = app(CreateShippingZone::class)('Zona Norte');

    DB::table('shipping_zone_geography_entry')->insert([
        'shipping_zone_id' => $zone->id,
        'geography_entry_id' => $entry->id,
    ]);

    $caught = null;

    try {
        DB::table('shipping_zone_geography_entry')->insert([
            'shipping_zone_id' => $zone->id,
            'geography_entry_id' => $entry->id,
        ]);
    } catch (QueryException $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull()
        ->and($caught->getCode())->toBe('23000');
    $this->assertDatabaseCount('shipping_zone_geography_entry', 1);
});

// Asserts WHICH LAYER refuses an unknown id: validation refuses cleanly first (no row written),
// and a validation-bypassing insert raises 23000 (the FK) rather than writing an orphan.
test('an unknown geography_entry_id is refused by validation, and the FK is the backstop behind it', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');
    $unknownId = 999999999;

    expect(GeographyEntry::query()->whereKey($unknownId)->exists())->toBeFalse();

    $caught = null;

    try {
        app(SyncShippingZoneGeography::class)($zone, [$unknownId]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    $this->assertDatabaseCount('shipping_zone_geography_entry', 0);

    $caughtQueryException = null;

    try {
        DB::table('shipping_zone_geography_entry')->insert([
            'shipping_zone_id' => $zone->id,
            'geography_entry_id' => $unknownId,
        ]);
    } catch (QueryException $e) {
        $caughtQueryException = $e;
    }

    expect($caughtQueryException)->not->toBeNull()
        ->and($caughtQueryException->getCode())->toBe('23000');
    $this->assertDatabaseCount('shipping_zone_geography_entry', 0);
});

// Phase 4 security re-audit finding N-3: F-2's array_slice()-before-the-exists-query bound and
// F-3's is_int()/ctype_digit() guard (both in ShippingZoneValidationRules::geographyEntryIdsRules())
// had zero regression coverage -- every existing payload in this file is a handful of real
// in-range integer ids, so both fixes could be reverted with the whole suite staying green. These
// two tests are the ones the audit's own report names as the minimal closing pair.
test('more than MAX_GEOGRAPHY_ENTRIES ids is refused by validation, never reaching the database', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');
    $tooMany = range(1, SyncShippingZoneGeography::MAX_GEOGRAPHY_ENTRIES + 1);

    $caught = null;

    try {
        app(SyncShippingZoneGeography::class)($zone, $tooMany);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    $this->assertDatabaseCount('shipping_zone_geography_entry', 0);
});

test('a numeric id string exceeding PHP_INT_MAX is refused cleanly by validation, never as an uncaught error', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');
    $tooLarge = ((string) PHP_INT_MAX).'0';

    $caught = null;

    try {
        app(SyncShippingZoneGeography::class)($zone, [$tooLarge]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    $this->assertDatabaseCount('shipping_zone_geography_entry', 0);
});

// The only meaningful executable form of the PRD's "the catalog does not allow inventing new
// entries" scenario -- fails against a firstOrCreate-based implementation, which is the real way
// an administrator would end up inventing an entry through this story.
test('a rejected unknown id creates no geography_entries row as a side effect', function () {
    $zone = app(CreateShippingZone::class)('Zona Norte');
    $idsBefore = GeographyEntry::query()->pluck('id')->sort()->values()->all();

    try {
        app(SyncShippingZoneGeography::class)($zone, [999999999]);
    } catch (Throwable) {
        // Expected -- see the layered test above.
    }

    $idsAfter = GeographyEntry::query()->pluck('id')->sort()->values()->all();

    expect($idsAfter)->toBe($idsBefore);
});

// D-2: two zones may cover the same municipio -- both assignments succeed, both pivot rows
// exist, neither zone loses it. Guards the concrete one-token accident of writing
// unique('geography_entry_id') instead of the composite primary key.
test('two zones may cover the same municipio (explicit overlap is allowed)', function () {
    $spain = GeographyEntry::factory()->create(['name' => 'España']);
    $asturias = GeographyEntry::factory()->community($spain)->create(['name' => 'Asturias']);
    $gijon = GeographyEntry::factory()->municipality($asturias)->create(['name' => 'Gijón']);

    $zoneA = app(CreateShippingZone::class)('Asturias Centro');
    $zoneB = app(CreateShippingZone::class)('Zona Norte');

    app(SyncShippingZoneGeography::class)($zoneA, [$gijon->id]);
    app(SyncShippingZoneGeography::class)($zoneB, [$gijon->id]);

    expect($zoneA->geographyEntries()->pluck('geography_entries.id')->all())->toBe([$gijon->id])
        ->and($zoneB->geographyEntries()->pluck('geography_entries.id')->all())->toBe([$gijon->id]);
});

// D-3: membership is literal, never transitive. Assigning the country "España" creates EXACTLY
// ONE pivot row -- not 17 communities, not ~8,100 municipios.
test('assigning a country creates exactly one pivot row, never expanding to its communities or municipios', function () {
    $spain = GeographyEntry::factory()->create(['name' => 'España']);
    $galicia = GeographyEntry::factory()->community($spain)->create(['name' => 'Galicia']);
    GeographyEntry::factory()->municipality($galicia)->create(['name' => 'Santiago de Compostela']);

    $zone = app(CreateShippingZone::class)('Zona España');
    app(SyncShippingZoneGeography::class)($zone, [$spain->id]);

    expect($zone->geographyEntries()->count())->toBe(1)
        ->and($zone->geographyEntries()->pluck('geography_entries.id')->all())->toBe([$spain->id]);
});

// D-3, the other half: an "España" zone and a "Gijón" zone each save, each keeping its own single
// entry, neither rewriting the other -- the testable half of implicit overlap (D-2).
test('a country-covering zone and a municipio-covering zone each keep their own single entry with no cross-write', function () {
    $spain = GeographyEntry::factory()->create(['name' => 'España']);
    $asturias = GeographyEntry::factory()->community($spain)->create(['name' => 'Asturias']);
    $gijon = GeographyEntry::factory()->municipality($asturias)->create(['name' => 'Gijón']);

    $zoneSpain = app(CreateShippingZone::class)('Zona España');
    $zoneGijon = app(CreateShippingZone::class)('Zona Gijón');

    app(SyncShippingZoneGeography::class)($zoneSpain, [$spain->id]);
    app(SyncShippingZoneGeography::class)($zoneGijon, [$gijon->id]);

    expect($zoneSpain->geographyEntries()->pluck('geography_entries.id')->all())->toBe([$spain->id])
        ->and($zoneGijon->geographyEntries()->pluck('geography_entries.id')->all())->toBe([$gijon->id]);
});
