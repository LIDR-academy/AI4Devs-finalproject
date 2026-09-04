<?php

use App\Actions\Products\CreateProductVariant;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0029, Phase 3 (TDD "red" step): D-16.1 -- the two id arrays (well, here just one,
// attributeValueIds) must be validated in TWO passes, never one combined rule array, per
// docs/security/array-validation-bounds.md's own established mechanism. This file is CreateProductVariant's
// own instance of that pattern -- mirroring tests/Feature/Products/EditorTest.php's
// "an oversized regionIds submission issues zero sales_regions existence queries" test exactly.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.edit');
    $this->actingAs($actor);
});

test('an oversized attributeValueIds submission issues zero product_attribute_values existence queries', function () {
    $product = Product::factory()->create(['sku' => '0001']);

    // FP7: a throwaway warm-up call first, so the first Gate::authorize() in this process does not
    // absorb a one-time permission-cache-load cost into the counted call below.
    try {
        app(CreateProductVariant::class)($product, [], '19.99', 5);
    } catch (Throwable) {
        // expected -- this is only warming the permission cache, its outcome is irrelevant.
    }

    $oversized = array_map(fn () => (string) Str::uuid7(), range(1, 2000));

    $queries = 0;
    DB::listen(function ($query) use (&$queries): void {
        if (str_contains($query->sql, 'product_attribute_values')) {
            $queries++;
        }
    });

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, $oversized, '19.99', 5);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull();
    expect($queries)->toBe(0);
    expect(ProductVariant::count())->toBe(0);
});

// The Livewire error-bag bloat half of the same finding: one message, not 2,001.
test('the same oversized submission returns one error message, not one per element', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    $oversized = array_map(fn () => (string) Str::uuid7(), range(1, 2000));

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, $oversized, '19.99', 5);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull();
    expect($caught->validator->errors()->get('attributeValueIds'))->toHaveCount(1);
});

// FP21: the D-3 read-back's IN (...) binding list is bounded, asserted on the BINDINGS and not on
// the query count -- both a bounded and an unbounded implementation issue exactly one read-back
// query, only the binding count moves.
//
// Fixed (Phase 5 finding): submitting exactly the legal max (10 ids) can never produce more than
// 10 bindings regardless of whether the implementation is bounded or not -- it passed for the
// wrong reason. An OVERSIZED submission (2,000 REAL, existing ids, matching the fake-id pattern's
// own magnitude used elsewhere in this file) is the only shape that can actually fail against an
// unbounded implementation: D-16.1 pass 1's max:10 rule must throw before ANY query below is
// issued. If that bound were ever weakened or removed, these 2,000 REAL ids would sail straight
// through pass 2's per-element Rule::exists() checks (since they genuinely exist, unlike the fake
// uuid7() ids used above) and reach the D-3 read-back's single whereIn(...) query with up to 2,000
// bindings in one call.
test('no query touching product_attribute_values ever carries more bindings than the max:10 cap allows, for an oversized REAL submission', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    $type = ProductAttributeType::factory()->create(['name' => 'Talla']);

    $now = now();
    $rows = collect(range(1, 2000))->map(fn (int $i): array => [
        'id' => (string) Str::uuid7(),
        'product_attribute_type_id' => $type->id,
        'value' => "Bound-{$i}",
        'position' => $i,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('product_attribute_values')->insert($rows->all());
    $ids = $rows->pluck('id')->all();

    $bindingCounts = [];
    DB::listen(function ($query) use (&$bindingCounts): void {
        if (str_contains($query->sql, 'product_attribute_values')) {
            $bindingCounts[] = count($query->bindings);
        }
    });

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, $ids, '19.99', 5);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull();

    foreach ($bindingCounts as $count) {
        expect($count)->toBeLessThanOrEqual(10);
    }

    expect(ProductVariant::count())->toBe(0);
});

// The control that stops a reject-everything bound passing the two tests above trivially.
test('a legitimate 3-id submission still validates and still creates', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    $type = ProductAttributeType::factory()->create(['name' => 'Talla']);
    $values = ProductAttributeValue::factory()
        ->count(3)
        ->sequence(fn ($sequence) => ['position' => $sequence->index])
        ->for($type, 'type')
        ->create();
    $ids = $values->pluck('id')->all();

    $variant = app(CreateProductVariant::class)($product, $ids, '19.99', 5);

    expect($variant)->not->toBeNull();
    expect(ProductVariant::count())->toBe(1);
});
