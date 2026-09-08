<?php

use App\Models\SalesRegion;
use Illuminate\Support\Str;

// F-3 (Phase 5 review, story 0016): the task file's "Deliberately not tested" section
// says the new-per-model HasUuids behavior "is covered by the key-type test plus one
// Str::isUuid() assertion" -- tests/Unit/Models/SalesRegionTest.php has the key-type
// test, but nothing anywhere actually asserted the persisted id is a real UUID rather
// than e.g. an autoincrement-string artifact of some other HasUniqueStringIds-family
// trait. This needs a real persisted row, so it belongs here (Feature), not in Unit.

test('a created sales region is persisted with a real UUID primary key', function () {
    $salesRegion = SalesRegion::factory()->create();

    expect(Str::isUuid($salesRegion->id))->toBeTrue();
});

test('rate round-trips through the decimal cast as an exact string', function (string $rate) {
    $salesRegion = SalesRegion::factory()->withRate($rate)->create();

    $fresh = $salesRegion->fresh();

    // 'decimal:3' casts to a STRING, never a float -- pinning the type here, not just
    // the value, is deliberate: every downstream consumer of `rate` depends on which.
    expect($fresh->rate)->toBe($rate)
        ->and($fresh->rate)->toBeString();
})->with([
    '21.000',
    '7.500',
    '0.000',
    '4.050',
]);

test('is_default returns a strict boolean', function () {
    $salesRegion = SalesRegion::factory()->isDefault()->create();

    $fresh = $salesRegion->fresh();

    // Strict, not truthy: MySQL's `boolean` cast can produce a value that differs from
    // a strict PHP boolean type coercion depending on driver behavior, so pinning
    // true/false (not merely truthy) is what actually catches a missing/wrong cast.
    expect($fresh->is_default)->toBeTrue()
        ->and($fresh->is_default)->toBeBool();
});

test('is_active returns a strict boolean', function () {
    $active = SalesRegion::factory()->create();
    $inactive = SalesRegion::factory()->inactive()->create();

    expect($active->fresh()->is_active)->toBeTrue()
        ->and($active->fresh()->is_active)->toBeBool()
        ->and($inactive->fresh()->is_active)->toBeFalse()
        ->and($inactive->fresh()->is_active)->toBeBool();
});
