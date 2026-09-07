<?php

use App\Actions\Shipping\CreateShippingZone;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Schema;

// Story 0033, Phase 3 (TDD "red" step): App\Actions\Shipping\CreateShippingZone and the
// shipping_zone_geography_entry migration do not exist yet -- every test below is expected to
// fail (class/table not found) until backend-expert/database-expert implement them in the next
// step of the TDD cycle. That is the correct, intended "red" outcome.
//
// Phase 2 correction item 1: this project's CI and local dev both run MySQL only
// (phpunit.xml:29 pins DB_CONNECTION=mysql, fixed 2026-08-26). The SQLite/MySQL engine-
// portability caveat this test's Phase 1 spec carried ("verify getForeignKeys() returns usefully
// on SQLite before relying on it; drop rather than make it MySQL-only") is stale text kept for
// its historical reasoning, not a live constraint here -- Phase 3 targets MySQL only, so
// Schema::getForeignKeys() is directly and reliably measurable.

test('the pivot reports exactly two foreign keys -- one to shipping_zones, one to geography_entries -- and none to anything else', function () {
    $foreignKeys = collect(Schema::getForeignKeys('shipping_zone_geography_entry'));

    expect($foreignKeys)->toHaveCount(2);

    $foreignTables = $foreignKeys->pluck('foreign_table')->sort()->values()->all();

    expect($foreignTables)->toBe(['geography_entries', 'shipping_zones']);
});

// Phase 2 correction item 2: sales_regions already exists (App\Models\SalesRegion, since task
// 0016) -- this file's originally-planned `->skip('sales_regions does not exist yet -- story
// 0016')` stub is stale. This is the real, un-skipped structural assertion the story's own
// "Recorded dissent" note argues FOR instead of 0032's `Schema::hasTable('sales_regions') ===
// false` shape (which would go red the day 0016 shipped, for no defect, per backend-qa's
// objection): the FK-shape test above already encodes this story's OWN schema-independence
// property as something that stays true forever (it fails only if a future change adds a
// sales_region-referencing column to this pivot); this test is the companion table-existence
// sanity check, matching the shape of the data-level snapshot already un-skipped in
// tests/Feature/Seeders/GeographyCatalogSeederTest.php's sibling assertion.
// Phase 4 security audit, finding F-1: CreateShippingZone now authorizes `create` on
// ShippingZone::class as its own first statement (see CreateShippingZoneTest.php's corrected file
// banner), so this test needs an actor holding `shipping.create`, seeded and granted locally
// rather than via a file-wide beforeEach, since this is the only test in this file calling a
// Shipping action.
test('creating a shipping zone leaves the sales_regions table itself untouched', function () {
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo('shipping.create');
    $this->actingAs($actor);

    expect(Schema::hasTable('sales_regions'))->toBeTrue();

    app(CreateShippingZone::class)('Zona Norte');

    expect(Schema::hasTable('sales_regions'))->toBeTrue();
});
