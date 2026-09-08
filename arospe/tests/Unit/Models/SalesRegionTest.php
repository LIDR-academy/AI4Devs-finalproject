<?php

use App\Enums\SalesRegionKind;
use App\Models\SalesRegion;
use Illuminate\Support\Str;

test('the sales region model reports a non-incrementing string key type', function () {
    $salesRegion = new SalesRegion;

    expect($salesRegion->getKeyType())->toBe('string')
        ->and($salesRegion->getIncrementing())->toBeFalse();
});

test('slug is not mass-assignable', function () {
    $salesRegion = new SalesRegion;

    $salesRegion->fill(['slug' => 'invented-slug']);

    expect($salesRegion->isDirty('slug'))->toBeFalse()
        ->and($salesRegion->slug)->toBeNull();
});

test('parent_id is not mass-assignable', function () {
    $salesRegion = new SalesRegion;

    $salesRegion->fill(['parent_id' => (string) Str::uuid()]);

    expect($salesRegion->isDirty('parent_id'))->toBeFalse()
        ->and($salesRegion->parent_id)->toBeNull();
});

test('kind is not mass-assignable', function () {
    $salesRegion = new SalesRegion;

    $salesRegion->fill(['kind' => SalesRegionKind::FiscalTerritory->value]);

    expect($salesRegion->isDirty('kind'))->toBeFalse()
        ->and($salesRegion->kind)->toBeNull();
});

test('is_default is not mass-assignable', function () {
    $salesRegion = new SalesRegion;

    $salesRegion->fill(['is_default' => true]);

    expect($salesRegion->isDirty('is_default'))->toBeFalse()
        ->and($salesRegion->is_default)->toBeNull();
});

test('is_active is not mass-assignable', function () {
    $salesRegion = new SalesRegion;

    $salesRegion->fill(['is_active' => true]);

    expect($salesRegion->isDirty('is_active'))->toBeFalse()
        ->and($salesRegion->is_active)->toBeNull();
});

test('name is not mass-assignable', function () {
    $salesRegion = new SalesRegion;

    $salesRegion->fill(['name' => 'Invented Country']);

    expect($salesRegion->isDirty('name'))->toBeFalse()
        ->and($salesRegion->name)->toBeNull();
});

test('sort_order is not mass-assignable', function () {
    $salesRegion = new SalesRegion;

    $salesRegion->fill(['sort_order' => 99]);

    expect($salesRegion->isDirty('sort_order'))->toBeFalse()
        ->and($salesRegion->sort_order)->toBeNull();
});
