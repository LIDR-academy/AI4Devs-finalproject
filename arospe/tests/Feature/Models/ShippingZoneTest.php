<?php

use App\Models\GeographyEntry;
use App\Models\ShippingZone;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

// Story 0033, Phase 3 (TDD "red" step): App\Models\ShippingZone, its factory
// (database/factories/ShippingZoneFactory.php) and the shipping_zones migration do not exist yet
// -- every test below is expected to fail (class/table not found) until
// database-expert/backend-expert implement them in the next step of the TDD cycle. That is the
// correct, intended "red" outcome.
//
// Mirrors tests/Feature/Models/ProductCategoryTest.php's shape for the UUID v7/timestamp
// assertions and the no-SoftDeletes guard, and tests/Feature/Models/UserTest.php's shape for the
// lexicographic-ordering assertion.

test('a factory-created zone receives a uuidv7 string primary key', function () {
    $zone = ShippingZone::factory()->create();

    expect($zone->id)->toBeString()
        ->and(Str::isUuid($zone->id, 7))->toBeTrue();
});

test('two zones created in immediate succession sort lexicographically in creation order', function () {
    $first = ShippingZone::factory()->create();
    $second = ShippingZone::factory()->create();

    expect(Str::isUuid($first->id, 7))->toBeTrue()
        ->and(Str::isUuid($second->id, 7))->toBeTrue()
        ->and(strcmp((string) $first->id, (string) $second->id))->toBeLessThan(0);
});

// Guards against a future column being added to #[Fillable] by reflex -- `name` is this model's
// only fillable attribute, per the story's "Files to create/modify" spec
// (#[Fillable(['name'])]).
test('name is the only mass-assignable attribute', function () {
    expect((new ShippingZone)->getFillable())->toBe(['name']);
});

// D-7 regression guard: adding SoftDeletes later would silently disable cascadeOnDelete on the
// pivot AND restrictOnDelete on 0036's future shipping_rates FK -- see docs/database/schema.md's
// soft-deletes/FK-interaction note. `ShippingZone` has none of the reasons `users` soft-deletes
// (identity retention, freeing an auth identifier, relations that must survive a hard delete).
test('the model does not use SoftDeletes', function () {
    expect(class_uses_recursive(ShippingZone::class))
        ->not->toHaveKey(SoftDeletes::class);
});

// Deliberately UNCONSTRAINED by level (a zone bundles entries at ANY level) -- one assertion that
// the relation actually returns real GeographyEntry models with the pivot row intact, not a tour
// of belongsToMany's own mechanics.
test('geographyEntries() returns GeographyEntry models with the pivot row intact', function () {
    $country = GeographyEntry::factory()->create(['name' => 'España']);
    $community = GeographyEntry::factory()->community($country)->create(['name' => 'Asturias']);
    $gijon = GeographyEntry::factory()->municipality($community)->create(['name' => 'Gijón']);

    $zone = ShippingZone::factory()->create();
    $zone->geographyEntries()->attach($gijon->id);

    $related = $zone->geographyEntries()->first();

    expect($related)->toBeInstanceOf(GeographyEntry::class)
        ->and($related->id)->toBe($gijon->id)
        ->and($related->name)->toBe('Gijón');
});
