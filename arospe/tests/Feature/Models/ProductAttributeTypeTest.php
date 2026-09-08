<?php

use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

// Story 0028, Phase 3 (TDD "red" step): App\Models\ProductAttributeType, App\Models\
// ProductAttributeValue, their factories and the two product_attribute_* migrations do not exist
// yet -- every test below is expected to fail (class/table not found) until database-expert/
// backend-expert implement them in the next step of the TDD cycle. That is the correct, intended
// "red" outcome.
//
// Scope, per the task file's own file description: "the model-level tests (values() relationship
// ordering, cascade delete of values when a type is deleted)". Mirrors
// tests/Feature/Models/ProductCategoryTest.php's and SalesRegionTest.php's shape for the UUIDv7/
// #[Fillable]/no-SoftDeletes assertions.

// =====================================================================
// UUID v7 primary keys (D9)
// =====================================================================

test('a factory-created attribute type receives a uuidv7 string primary key', function () {
    $type = ProductAttributeType::factory()->create();

    expect($type->id)->toBeString()
        ->and(Str::isUuid($type->id, 7))->toBeTrue();
});

test('a factory-created attribute value receives a uuidv7 string primary key', function () {
    $value = ProductAttributeValue::factory()->create();

    expect($value->id)->toBeString()
        ->and(Str::isUuid($value->id, 7))->toBeTrue();
});

// =====================================================================
// #[Fillable] guard (D2)
// =====================================================================

test('name and position are the only mass-assignable attributes on ProductAttributeType', function () {
    expect((new ProductAttributeType)->getFillable())->toBe(['name', 'position']);
});

test('product_attribute_type_id, value and position are the only mass-assignable attributes on ProductAttributeValue', function () {
    expect((new ProductAttributeValue)->getFillable())->toBe(['product_attribute_type_id', 'value', 'position']);
});

// =====================================================================
// No SoftDeletes (D7)
// =====================================================================

test('neither model uses SoftDeletes', function () {
    expect(class_uses_recursive(ProductAttributeType::class))->not->toHaveKey(SoftDeletes::class)
        ->and(class_uses_recursive(ProductAttributeValue::class))->not->toHaveKey(SoftDeletes::class);
});

// =====================================================================
// values() relationship ordering (D5, D2) -- position ASC, value ASC tiebreak
// =====================================================================

test('values() orders by position ascending, never by insertion order or a bare value sort', function () {
    $type = ProductAttributeType::factory()->create();

    // Created in a DELIBERATELY scrambled position order (2, 0, 1), each position distinct, so a
    // relation ordered by insertion order (or by `value` alone) would produce a visibly wrong
    // result here -- only an explicit `orderBy('position')` produces the expected array.
    ProductAttributeValue::factory()->for($type, 'type')->create(['value' => 'Third', 'position' => 2]);
    ProductAttributeValue::factory()->for($type, 'type')->create(['value' => 'First', 'position' => 0]);
    ProductAttributeValue::factory()->for($type, 'type')->create(['value' => 'Second', 'position' => 1]);

    expect($type->fresh()->values->pluck('value')->all())->toBe(['First', 'Second', 'Third']);
});

test('values() tiebreaks on value ascending when positions are equal, per D5\'s deterministic-tiebreak rule', function () {
    $type = ProductAttributeType::factory()->create();

    // All three share the column's own default position (0) -- exactly the "freshly imported
    // set" scenario D5 warns about, where MySQL would otherwise return ties in arbitrary order.
    // Created in reverse-alphabetical order so an insertion-order-dependent implementation would
    // fail this test.
    ProductAttributeValue::factory()->for($type, 'type')->create(['value' => 'Zeta', 'position' => 0]);
    ProductAttributeValue::factory()->for($type, 'type')->create(['value' => 'Alpha', 'position' => 0]);
    ProductAttributeValue::factory()->for($type, 'type')->create(['value' => 'Mu', 'position' => 0]);

    expect($type->fresh()->values->pluck('value')->all())->toBe(['Alpha', 'Mu', 'Zeta']);
});

test('a type with no values returns an empty values collection, not null or an error (Q2a: zero values is legal)', function () {
    $type = ProductAttributeType::factory()->create();

    expect($type->values)->toHaveCount(0);
});

// =====================================================================
// Cascade delete (D7)
// =====================================================================

test('deleting a type deletes every one of its own value rows', function () {
    $type = ProductAttributeType::factory()->withValues(3)->create();
    $valueIds = $type->values->pluck('id')->all();

    expect($valueIds)->toHaveCount(3);

    $type->delete();

    expect(ProductAttributeType::find($type->id))->toBeNull();

    foreach ($valueIds as $valueId) {
        expect(ProductAttributeValue::find($valueId))->toBeNull();
    }
});

test('deleting a type leaves an unrelated type\'s values completely untouched', function () {
    $typeToDelete = ProductAttributeType::factory()->withValues(2)->create();
    $unrelatedType = ProductAttributeType::factory()->withValues(2)->create();
    $unrelatedValueIds = $unrelatedType->values->pluck('id')->sort()->values()->all();

    $typeToDelete->delete();

    expect(ProductAttributeType::find($unrelatedType->id))->not->toBeNull();
    expect($unrelatedType->fresh()->values->pluck('id')->sort()->values()->all())->toBe($unrelatedValueIds);
    expect(ProductAttributeValue::where('product_attribute_type_id', $unrelatedType->id)->count())->toBe(2);
});

// The cascade is the DATABASE's own ON DELETE CASCADE (D7 -- "no orphaned passkeys" reasoning
// applied here), not an Eloquent event or observer -- this test drives the delete through a raw
// query builder call specifically to prove the constraint holds independent of any application-
// level cascade logic that might be added (or accidentally removed) later. Deleting a User row
// bypasses model events per docs/conventions/base-standards.md's own "never bulk-delete through
// the query builder" warning -- here that is exactly the point, since only the DB-level
// cascadeOnDelete() FK can make this pass.
test('the cascade holds even through a raw query builder delete that bypasses Eloquent model events entirely', function () {
    $type = ProductAttributeType::factory()->withValues(3)->create();
    $valueIds = $type->values->pluck('id')->all();

    DB::table('product_attribute_types')->where('id', $type->id)->delete();

    foreach ($valueIds as $valueId) {
        expect(ProductAttributeValue::find($valueId))->toBeNull();
    }
});
