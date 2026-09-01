<?php

use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

// Story 0023, Phase 3 (TDD "red" step): App\Models\ProductCategory, its factory
// (database/factories/ProductCategoryFactory.php) and the product_categories migration do not
// exist yet -- every test below is expected to fail (class/table not found) until
// database-expert/backend-expert implement them in the next step of the TDD cycle. That is the
// correct, intended "red" outcome.
//
// Mirrors tests/Feature/Models/UserTest.php's shape for the UUID v7/timestamp assertions, and
// tests/Feature/Models/SalesRegionTest.php's shape for a greenfield UUID model with no SoftDeletes.

test('a factory-created product category receives a uuidv7 string primary key', function () {
    $category = ProductCategory::factory()->create();

    expect($category->id)->toBeString()
        ->and(Str::isUuid($category->id, 7))->toBeTrue();
});

test('two product categories created in immediate succession sort lexicographically in creation order', function () {
    $first = ProductCategory::factory()->create();
    $second = ProductCategory::factory()->create();

    expect(Str::isUuid($first->id, 7))->toBeTrue()
        ->and(Str::isUuid($second->id, 7))->toBeTrue()
        ->and(strcmp((string) $first->id, (string) $second->id))->toBeLessThan(0);
});

test('creating and re-fetching a category persists the name and populates both timestamps', function () {
    $category = ProductCategory::create(['name' => 'Footwear']);

    $fresh = $category->fresh();

    expect($fresh->name)->toBe('Footwear')
        ->and($fresh->created_at)->not->toBeNull()
        ->and($fresh->updated_at)->not->toBeNull();
});

// Guards against a future column being added to #[Fillable] by reflex -- `name` is this model's
// only fillable attribute, per the story's "Files to create/modify" spec
// (#[Fillable(['name'])]).
test('name is the only mass-assignable attribute', function () {
    expect((new ProductCategory)->getFillable())->toBe(['name']);
});

// D-3 regression guard: adding SoftDeletes later would silently change what Rule::unique() and
// every future query against this table see -- Rule::unique() does NOT apply the soft-delete scope
// (see docs/database/schema.md#soft-deletes), so a trashed row would squat its name forever unless
// every uniqueness check were made trashed-aware. `product_categories` is a lookup table with none
// of the reasons `users` soft-deletes (identity retention, freeing an auth identifier, relations
// that must survive).
test('the model does not use SoftDeletes', function () {
    expect(class_uses_recursive(ProductCategory::class))
        ->not->toHaveKey(SoftDeletes::class);
});
