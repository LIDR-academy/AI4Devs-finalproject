<?php

use App\Actions\Products\HashVariantCombination;
use Illuminate\Support\Str;

// Story 0029, Phase 3 (TDD "red" step): App\Actions\Products\HashVariantCombination does not exist
// yet. D-3's exact definition:
//
//   $canonical = collect($ids)->unique()->sort(SORT_STRING)->values()->implode('|');
//   return hash('sha256', $canonical);
//
// No DB, per D-3's own docblock ("ids ALREADY READ BACK FROM THE DATABASE") — this file exercises
// only the hashing formula as a pure function over an array of ids. What those ids ARE (real
// ProductAttributeValue rows, case sensitivity, V-10's read-back requirement) is a Feature-test
// concern: tests/Feature/Products/ProductVariantCombinationTest.php and
// tests/Feature/Products/ProductVariantValidationBoundsTest.php.

test('the hash is order-independent for the same id set', function () {
    $a = (string) Str::uuid7();
    $b = (string) Str::uuid7();
    $c = (string) Str::uuid7();

    $hash1 = app(HashVariantCombination::class)([$a, $b, $c]);
    $hash2 = app(HashVariantCombination::class)([$c, $a, $b]);
    $hash3 = app(HashVariantCombination::class)([$b, $c, $a]);

    expect($hash1)->toBe($hash2)->toBe($hash3);
});

test('the hash is duplicate-insensitive', function () {
    $a = (string) Str::uuid7();
    $b = (string) Str::uuid7();

    expect(app(HashVariantCombination::class)([$a, $b, $b]))
        ->toBe(app(HashVariantCombination::class)([$a, $b]));
});

// The assertion that catches a "sum the ids" or "XOR the ids" implementation, both of which pass
// the two tests above identically for a subset and its superset.
test('the hash distinguishes a subset from a superset', function () {
    $a = (string) Str::uuid7();
    $b = (string) Str::uuid7();

    expect(app(HashVariantCombination::class)([$a]))
        ->not->toBe(app(HashVariantCombination::class)([$a, $b]));
});

test('the hash is 64 lowercase hex characters and stable across calls, with no salt or randomness', function () {
    $ids = [(string) Str::uuid7(), (string) Str::uuid7()];

    $hash = app(HashVariantCombination::class)($ids);

    expect($hash)->toMatch('/^[0-9a-f]{64}$/')
        ->and(app(HashVariantCombination::class)($ids))->toBe($hash);
});
