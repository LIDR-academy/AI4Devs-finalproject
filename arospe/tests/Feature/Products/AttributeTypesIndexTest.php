<?php

use App\Actions\Products\CreateProductAttributeType;
use App\Actions\Products\DeleteProductAttributeType;
use App\Actions\Products\UpdateProductAttributeType;
use App\Livewire\Products\AttributeTypes\Index;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Livewire\Features\SupportLockedProperties\CannotUpdateLockedPropertyException;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

// Story 0028, Phase 3 (TDD "red" step): App\Livewire\Products\AttributeTypes\Index,
// routes/product-attribute-types.php, App\Actions\Products\{Create,Update,Delete}
// ProductAttributeType and App\Concerns\ProductAttributeValidationRules do not exist yet -- every
// test below is expected to fail (class/route not found) until backend-expert implements them in
// the next step of the TDD cycle. That is the correct, intended "red" outcome.
//
// Mirrors tests/Feature/ProductCategories/IndexTest.php's two-part shape (component assertions,
// then a dedicated Authorization block covering the route/component/action layers) -- the closest
// precedent in this codebase for a permission-gated CRUD screen with a "Files to create" section
// that gives the Livewire component's public surface verbatim, D6.
//
// ASSUMED SIGNATURES for the three domain actions (D6 states they self-authorize and mirror
// CreateProductCategory/RenameProductCategory/DeleteProductCategory's shape; the exact parameter
// lists are not given verbatim by the task file the way the component's public surface is):
//
//   CreateProductAttributeType::__invoke(string $name, array $values): ProductAttributeType
//   UpdateProductAttributeType::__invoke(ProductAttributeType $type, string $name, array $values): ProductAttributeType
//   DeleteProductAttributeType::__invoke(ProductAttributeType $type): bool
//
// where `$values` is `array<int, array{id: string|null, value: string}>` -- the component's own
// `$values` shape minus the view-only `key` field, matching
// tests/Feature/Products/SyncProductAttributeValuesTest.php's identical assumption for the
// collaborator these two actions share. If the real signatures differ, every affected test fails
// for that reason and the signature assumption is the first thing to reconcile.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * An actor holding every products.* CRUD permission -- the default fixture for tests whose
 * subject is not authorization itself.
 *
 * @param  array<int, string>  $permissions
 */
function attributeTypesFullActor(array $permissions = ['products.view', 'products.create', 'products.edit', 'products.delete']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

/**
 * @param  array<int, string>  $texts
 * @return array<int, array{id: string|null, key: string, value: string}>
 */
function attributeValuesPayload(array $texts): array
{
    return array_map(fn (string $text): array => [
        'id' => null,
        'key' => (string) Str::uuid(),
        'value' => $text,
    ], $texts);
}

// =====================================================================
// Listing / row shape
// =====================================================================

test('each row exposes exactly the id, name, valueCount, valuePreview, canEdit and canDelete keys the view contract requires', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Size', attributeValuesPayload(['38', '39', '40']));

    $rows = collect(Livewire::test(Index::class)->get('types'));
    $row = $rows->firstWhere('id', $type->id);

    expect($row)->toHaveKeys(['id', 'name', 'valueCount', 'valuePreview', 'canEdit', 'canDelete'])
        ->and($row['id'])->toBe($type->id)
        ->and($row['name'])->toBe('Size')
        ->and($row['valueCount'])->toBe(3)
        ->and($row['canEdit'])->toBeTrue()
        ->and($row['canDelete'])->toBeTrue();

    // valuePreview's exact separator/format is not specified by the task file -- only that it
    // exists and previews the values -- so this asserts every value text is present rather than
    // an exact rendered string.
    expect($row['valuePreview'])->toContain('38')
        ->and($row['valuePreview'])->toContain('39')
        ->and($row['valuePreview'])->toContain('40');
});

test('typesSummary returns total types and total values across all of them', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    app(CreateProductAttributeType::class)('Size', attributeValuesPayload(['38', '39']));
    app(CreateProductAttributeType::class)('Color', attributeValuesPayload(['Black']));

    $summary = Livewire::test(Index::class)->get('typesSummary');

    expect($summary)->toHaveKeys(['total', 'values'])
        ->and($summary['total'])->toBe(2)
        ->and($summary['values'])->toBe(3);
});

// =====================================================================
// Create -- happy path
// =====================================================================

test('defining a type with three values persists one type row and exactly three value rows, in the exact sorted set', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Size')
        ->set('values', attributeValuesPayload(['38', '39', '40']))
        ->call('save')
        ->assertHasNoErrors()
        ->assertSet('showModal', false);

    $type = ProductAttributeType::where('name', 'Size')->firstOrFail();

    expect($type->values)->toHaveCount(3);
    expect($type->values->pluck('value')->all())->toBe(['38', '39', '40']);
});

test('a type with non-numeric values persists exactly those value texts', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Color')
        ->set('values', attributeValuesPayload(['Black', 'White', 'Red']))
        ->call('save')
        ->assertHasNoErrors();

    $type = ProductAttributeType::where('name', 'Color')->firstOrFail();
    expect($type->values->pluck('value')->all())->toBe(['Black', 'White', 'Red']);
});

test('a type with zero values is legal and persists as an inert, empty type (Q2a)', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Material')
        ->set('values', [])
        ->call('save')
        ->assertHasNoErrors();

    $type = ProductAttributeType::where('name', 'Material')->firstOrFail();
    expect($type->values)->toHaveCount(0);
});

test('the same value text is accepted under two different types, each holding its own row', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Color')
        ->set('values', attributeValuesPayload(['Black']))
        ->call('save')
        ->assertHasNoErrors();

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Material')
        ->set('values', attributeValuesPayload(['Black']))
        ->call('save')
        ->assertHasNoErrors();

    expect(ProductAttributeValue::where('value', 'Black')->count())->toBe(2);
});

// =====================================================================
// D4 id-stability, driven through the component's full save() path
// =====================================================================

test('adding a value through the component leaves the pre-existing values\' ids identical', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Size', attributeValuesPayload(['38', '39', '40']));
    $originalIds = $type->values->pluck('id')->sort()->values()->all();

    $component = Livewire::test(Index::class)->call('openEditModal', $type->id);
    $values = $component->get('values');
    $values[] = ['id' => null, 'key' => (string) Str::uuid(), 'value' => '41'];

    $component->set('values', $values)->call('save')->assertHasNoErrors();

    $freshType = $type->fresh();
    expect($freshType->values)->toHaveCount(4);
    expect(array_intersect($originalIds, $freshType->values->pluck('id')->all()))->toBe($originalIds);
});

test('removing a value through the component (removeValue by key, not index) deletes exactly that row and leaves survivors\' ids unchanged', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Size', attributeValuesPayload(['38', '39', '40']));
    $values = $type->values;
    $survivorIds = $values->reject(fn (ProductAttributeValue $v): bool => $v->value === '39')->pluck('id')->sort()->values()->all();
    $removedId = $values->firstWhere('value', '39')->id;

    $component = Livewire::test(Index::class)->call('openEditModal', $type->id);
    $loadedValues = collect($component->get('values'));
    $keyToRemove = $loadedValues->firstWhere('id', $removedId)['key'];

    $component->call('removeValue', $keyToRemove)->call('save')->assertHasNoErrors();

    $freshType = $type->fresh();
    expect($freshType->values)->toHaveCount(2);
    expect($freshType->values->pluck('id')->sort()->values()->all())->toBe($survivorIds);
    expect(ProductAttributeValue::find($removedId))->toBeNull();
});

// Regression net for the standard Livewire index-keyed-row foot-gun (see the component's own
// public-surface docblock): removing the FIRST of three rows must remove the row whose real id
// matches, never merely the DOM position "index 0" -- proven by loading three DISTINCT values,
// removing by the first one's KEY, and asserting the SECOND and THIRD (not some arbitrary pair)
// survive with their original ids and text untouched.
test('removeValue targets the row by its stable key even after the array has been reordered client-side', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Size', attributeValuesPayload(['38', '39', '40']));
    $firstValue = $type->values->firstWhere('value', '38');

    $component = Livewire::test(Index::class)->call('openEditModal', $type->id);
    $loadedValues = collect($component->get('values'));
    $firstKey = $loadedValues->firstWhere('id', $firstValue->id)['key'];

    $component->call('removeValue', $firstKey)->call('save')->assertHasNoErrors();

    $freshType = $type->fresh();
    expect($freshType->values->pluck('value')->all())->toBe(['39', '40']);
    expect(ProductAttributeValue::find($firstValue->id))->toBeNull();
});

test('renaming a type leaves its value id set and every value\'s text completely unchanged', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Size', attributeValuesPayload(['38', '39', '40']));
    $originalIds = $type->values->pluck('id')->sort()->values()->all();
    $originalTexts = $type->values->pluck('value')->all();

    $component = Livewire::test(Index::class)->call('openEditModal', $type->id);
    $component->set('name', 'Shoe size')
        ->set('values', $component->get('values'))
        ->call('save')
        ->assertHasNoErrors();

    $freshType = $type->fresh();
    expect($freshType->name)->toBe('Shoe size');
    expect($freshType->values->pluck('id')->sort()->values()->all())->toBe($originalIds);
    expect($freshType->values->pluck('value')->all())->toBe($originalTexts);
});

test('renaming a single value changes only its own text -- id, type binding and siblings unchanged', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Size', attributeValuesPayload(['38']));
    $originalValue = $type->values->first();

    $component = Livewire::test(Index::class)->call('openEditModal', $type->id);
    $values = $component->get('values');
    $values[0]['value'] = '38 EU';

    $component->set('values', $values)->call('save')->assertHasNoErrors();

    $freshValue = ProductAttributeValue::find($originalValue->id);
    expect($freshValue)->not->toBeNull()
        ->and($freshValue->value)->toBe('38 EU')
        ->and($freshValue->product_attribute_type_id)->toBe($type->id);
});

// =====================================================================
// Reorder
// =====================================================================

test('reordering values through save() updates their positions and leaves ids untouched', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Size', attributeValuesPayload(['40', '38', '39']));
    $byValue = $type->values->keyBy('value');
    $originalIds = $byValue->pluck('id')->sort()->values()->all();

    $reordered = [
        ['id' => $byValue->get('38')->id, 'key' => (string) Str::uuid(), 'value' => '38'],
        ['id' => $byValue->get('39')->id, 'key' => (string) Str::uuid(), 'value' => '39'],
        ['id' => $byValue->get('40')->id, 'key' => (string) Str::uuid(), 'value' => '40'],
    ];

    Livewire::test(Index::class)
        ->call('openEditModal', $type->id)
        ->set('values', $reordered)
        ->call('save')
        ->assertHasNoErrors();

    $freshType = $type->fresh();
    expect($freshType->values->pluck('value')->all())->toBe(['38', '39', '40']);
    expect($freshType->values->pluck('id')->sort()->values()->all())->toBe($originalIds);
});

// =====================================================================
// Delete
// =====================================================================

test('deleting a type through the component removes the type and every one of its values, leaving an unrelated type untouched', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $typeToDelete = app(CreateProductAttributeType::class)('Material', attributeValuesPayload(['Cotton', 'Wool']));
    $unrelatedType = app(CreateProductAttributeType::class)('Color', attributeValuesPayload(['Black']));
    $deletedValueIds = $typeToDelete->values->pluck('id')->all();
    $unrelatedValueIds = $unrelatedType->values->pluck('id')->all();

    Livewire::test(Index::class)
        ->call('confirmDelete', $typeToDelete->id)
        ->call('deleteType')
        ->assertSet('showDeleteModal', false);

    expect(ProductAttributeType::find($typeToDelete->id))->toBeNull();
    foreach ($deletedValueIds as $id) {
        expect(ProductAttributeValue::find($id))->toBeNull();
    }

    expect(ProductAttributeType::find($unrelatedType->id))->not->toBeNull();
    foreach ($unrelatedValueIds as $id) {
        expect(ProductAttributeValue::find($id))->not->toBeNull();
    }
});

test('deleting a type twice fails cleanly rather than 500ing', function () {
    $this->withoutExceptionHandling();
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Material', []);

    Livewire::test(Index::class)
        ->call('confirmDelete', $type->id)
        ->call('deleteType');

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', $type->id))
        ->toThrow(ModelNotFoundException::class);
});

// =====================================================================
// Negative / edge -- name validation dataset
// =====================================================================

test('an invalid or duplicate type name is refused on the name field and persists nothing', function (string $existingName, string $submittedName) {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    if ($existingName !== '') {
        app(CreateProductAttributeType::class)($existingName, []);
    }

    $countBefore = ProductAttributeType::count();

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', $submittedName)
        ->set('values', [])
        ->call('save')
        ->assertHasErrors(['name']);

    expect(ProductAttributeType::count())->toBe($countBefore);
})->with([
    'a blank name' => ['', ''],
    'a whitespace-only name' => ['', '   '],
    'a name one character over max:100' => ['', str_repeat('A', 101)],
    'an exact duplicate' => ['Size', 'Size'],
    'a case-only duplicate' => ['Size', 'SIZE'],
    'a surrounding-whitespace duplicate' => ['Size', '  Size  '],
]);

test('a type name at the accepted length boundary is accepted', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', str_repeat('A', 100))
        ->set('values', [])
        ->call('save')
        ->assertHasNoErrors();

    expect(ProductAttributeType::where('name', str_repeat('A', 100))->exists())->toBeTrue();
});

test('a submitted name with surrounding whitespace persists trimmed (Str::squish, D3)', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', '  Size  ')
        ->set('values', [])
        ->call('save')
        ->assertHasNoErrors();

    expect(ProductAttributeType::where('name', 'Size')->exists())->toBeTrue();
    expect(ProductAttributeType::where('name', '  Size  ')->exists())->toBeFalse();
});

test('renaming a type to its own current name, and to a case variant of its own name, both succeed', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Size', []);

    Livewire::test(Index::class)
        ->call('openEditModal', $type->id)
        ->set('name', 'Size')
        ->set('values', [])
        ->call('save')
        ->assertHasNoErrors();

    Livewire::test(Index::class)
        ->call('openEditModal', $type->id)
        ->set('name', 'SIZE')
        ->set('values', [])
        ->call('save')
        ->assertHasNoErrors();

    expect($type->fresh()->name)->toBe('SIZE');
});

// =====================================================================
// Negative / edge -- value validation
// =====================================================================

// FP1: a duplicate value must be a validation error on the value field, never an unhandled
// QueryException -- this is the component-level counterpart to
// tests/Feature/Products/SyncProductAttributeValuesTest.php's identical-purpose direct-action
// test, proving the upstream distinct:ignore_case rule catches it BEFORE the action/database ever
// see it.
test('a duplicate value within the same submission is rejected as a validation error, not an unhandled QueryException', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Size')
        ->set('values', attributeValuesPayload(['38', '38']))
        ->call('save')
        ->assertHasErrors();

    expect(ProductAttributeType::where('name', 'Size')->exists())->toBeFalse();
});

// The in-payload duplicate is caught BEFORE either row is written -- the per-row DB constraint
// would only catch it after the first insert, which is exactly the gap this proves is closed
// upstream of the database.
test('two entries differing only by case or surrounding whitespace within one submission are rejected before either is written', function (string $first, string $second) {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Size')
        ->set('values', attributeValuesPayload([$first, $second]))
        ->call('save')
        ->assertHasErrors();

    expect(ProductAttributeValue::where('value', $first)->exists())->toBeFalse();
    expect(ProductAttributeValue::where('value', $second)->exists())->toBeFalse();
})->with([
    'case-only duplicate' => ['Black', 'BLACK'],
    'surrounding-whitespace duplicate' => ['38', ' 38 '],
]);

test('adding a duplicate value to an existing type is refused, and the type still holds a single value', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Size', attributeValuesPayload(['38']));

    $component = Livewire::test(Index::class)->call('openEditModal', $type->id);
    $values = $component->get('values');
    $values[] = ['id' => null, 'key' => (string) Str::uuid(), 'value' => '38'];

    $component->set('values', $values)->call('save')->assertHasErrors();

    expect($type->fresh()->values)->toHaveCount(1);
});

// D4 step 2, component level: a crafted /livewire/update payload pointing at another type's value
// id must be re-scoped as a NEW row, never update the other type's row -- the direct-action-level
// version of this lives in SyncProductAttributeValuesTest.php; this proves the full save() path
// (validation included) does not defeat the re-scoping.
test('a forged value id belonging to another type in the submitted payload does not update that other type\'s row', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $typeA = app(CreateProductAttributeType::class)('Size', attributeValuesPayload(['38']));
    $foreignValue = $typeA->values->first();
    $typeB = app(CreateProductAttributeType::class)('Color', []);

    Livewire::test(Index::class)
        ->call('openEditModal', $typeB->id)
        ->set('values', [['id' => $foreignValue->id, 'key' => (string) Str::uuid(), 'value' => 'Hijacked']])
        ->call('save')
        ->assertHasNoErrors();

    $stillTypeAsRow = ProductAttributeValue::find($foreignValue->id);
    expect($stillTypeAsRow->value)->toBe('38')
        ->and($stillTypeAsRow->product_attribute_type_id)->toBe($typeA->id);

    $typeBValues = $typeB->fresh()->values;
    expect($typeBValues)->toHaveCount(1)
        ->and($typeBValues->first()->id)->not->toBe($foreignValue->id)
        ->and($typeBValues->first()->value)->toBe('Hijacked');
});

// A forged editingTypeId cannot make Rule::unique()->ignore() skip a different row --
// #[Locked] is the enforcement mechanism, mirroring
// tests/Feature/Users/IndexTest.php's identical locked-property regression test.
test('a forged set against the locked editingTypeId property is rejected, and the other type\'s name is unchanged', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $typeA = app(CreateProductAttributeType::class)('Size', []);
    $typeB = app(CreateProductAttributeType::class)('Color', []);

    $component = Livewire::test(Index::class)->call('openEditModal', $typeA->id);

    expect(fn () => $component->set('editingTypeId', $typeB->id))
        ->toThrow(CannotUpdateLockedPropertyException::class);

    expect($typeB->fresh()->name)->toBe('Color');
});

test('a rejected save (valid name, one invalid value) leaves the type\'s name and all pre-existing values exactly as they were', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Size', attributeValuesPayload(['38', '39', '40']));
    $originalIds = $type->values->pluck('id')->sort()->values()->all();
    $originalTexts = $type->values->pluck('value')->all();

    $component = Livewire::test(Index::class)->call('openEditModal', $type->id);
    $values = $component->get('values');
    $values[2]['value'] = ''; // the third submitted value is invalid (blank)

    $component->set('name', 'Shoe size')
        ->set('values', $values)
        ->call('save')
        ->assertHasErrors();

    $freshType = $type->fresh();
    expect($freshType->name)->toBe('Size');
    expect($freshType->values->pluck('id')->sort()->values()->all())->toBe($originalIds);
    expect($freshType->values->pluck('value')->all())->toBe($originalTexts);
});

// =====================================================================
// Negative / edge -- malformed / unknown ids
// =====================================================================

test('opening the edit modal with an unknown type id fails cleanly with ModelNotFoundException', function () {
    $this->withoutExceptionHandling();
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', (string) Str::uuid7()))
        ->toThrow(ModelNotFoundException::class);
});

test('opening the edit modal with a malformed, non-UUID type id fails cleanly with ModelNotFoundException', function () {
    $this->withoutExceptionHandling();
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', 'not-a-uuid'))
        ->toThrow(ModelNotFoundException::class);
});

test('confirming delete with an unknown type id fails cleanly with ModelNotFoundException', function () {
    $this->withoutExceptionHandling();
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', (string) Str::uuid7()))
        ->toThrow(ModelNotFoundException::class);
});

test('confirming delete with a malformed, non-UUID type id fails cleanly with ModelNotFoundException', function () {
    $this->withoutExceptionHandling();
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', 'not-a-uuid'))
        ->toThrow(ModelNotFoundException::class);
});

// =====================================================================
// N+1 (FP5: a warm-up call is mandatory -- see tests/Feature/Users/IndexTest.php:218-246)
// =====================================================================

test('the list query does not N plus 1 as both the number of types and the number of values per type grow', function () {
    $actor = attributeTypesFullActor();
    $this->actingAs($actor);

    ProductAttributeType::factory()->withValues(2)->count(2)->create();

    // Warm Spatie's permission cache with a throwaway call before measuring: the first
    // Gate::authorize() in a process cold-loads and caches all permission/role data (a
    // fixed one-time cost, unrelated to the type/value counts), which would otherwise be
    // miscounted as part of the list query's own cost and break the comparison below.
    Livewire::test(Index::class)->get('types');

    DB::enableQueryLog();
    Livewire::test(Index::class)->get('types');
    $smallQueryCount = count(DB::getQueryLog());
    DB::flushQueryLog();

    // Grow BOTH dimensions -- more types AND more values per type -- since a naive
    // implementation could avoid N+1 on one axis while still N+1ing on the other (e.g. eager-
    // loading `values` but computing `valueCount`/`valuePreview` with a per-row query).
    ProductAttributeType::factory()->withValues(5)->count(5)->create();
    DB::flushQueryLog();

    Livewire::test(Index::class)->get('types');
    $largeQueryCount = count(DB::getQueryLog());
    DB::disableQueryLog();

    expect($largeQueryCount)->toBe($smallQueryCount);
});

// =====================================================================
// Authorization -- route layer
// =====================================================================

test('guests are redirected to the login page when visiting the attribute types screen', function () {
    $this->get(route('product-attribute-types.index'))->assertRedirect(route('login'));
});

test('an administrator holding products.view can reach the attribute types screen', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('products.view');
    $this->actingAs($actor);

    $this->get(route('product-attribute-types.index'))->assertOk();
});

test('an administrator without any products permission cannot reach the attribute types screen', function () {
    $actor = User::factory()->create();
    $this->actingAs($actor);

    $this->get(route('product-attribute-types.index'))->assertForbidden();
});

test('a Super Admin holding zero permission rows reaches the attribute types screen via the Gate::before bypass', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $this->get(route('product-attribute-types.index'))->assertOk();
});

// =====================================================================
// Authorization -- component layer (FP3: an HTTP 403 and a Livewire::test() authorization test
// are not substitutes for each other -- both are required)
// =====================================================================

test('mounting the component directly is forbidden for an actor lacking products.view, even though route middleware never ran', function () {
    $this->withoutExceptionHandling();
    $actor = User::factory()->create();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class))->toThrow(AuthorizationException::class);
});

test('opening the create modal is forbidden for an actor lacking products.create', function () {
    $this->withoutExceptionHandling();
    $actor = User::factory()->create();
    $actor->givePermissionTo('products.view');
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('openCreateModal'))
        ->toThrow(AuthorizationException::class);
});

test('saving a new type directly (bypassing openCreateModal) is forbidden for an actor lacking products.create, and writes no row', function () {
    $this->withoutExceptionHandling();
    $actor = User::factory()->create();
    $actor->givePermissionTo('products.view');
    $this->actingAs($actor);

    $countBefore = ProductAttributeType::count();

    // set() directly rather than via openCreateModal(), since that opener is itself gated on
    // 'create' above and would throw before save() is ever reached -- this is what proves save()
    // re-checks the gate on its own, independent of the opener.
    expect(fn () => Livewire::test(Index::class)->set('name', 'Should Not Persist')->set('values', [])->call('save'))
        ->toThrow(AuthorizationException::class);

    expect(ProductAttributeType::count())->toBe($countBefore);
});

test('opening the edit modal (a disclosure) is forbidden for an actor lacking products.edit', function () {
    $this->withoutExceptionHandling();
    $creator = attributeTypesFullActor();
    $this->actingAs($creator);
    $target = app(CreateProductAttributeType::class)('Size', []);

    $deniedActor = User::factory()->create();
    $deniedActor->givePermissionTo('products.view');
    $this->actingAs($deniedActor);

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', $target->id))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->name)->toBe('Size');
});

test('saving an edit is re-checked inside save, not only at openEditModal', function () {
    $this->withoutExceptionHandling();
    $actor = attributeTypesFullActor(['products.view', 'products.create', 'products.edit']);
    $this->actingAs($actor);

    $target = app(CreateProductAttributeType::class)('Size', []);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    $actor->revokePermissionTo('products.edit');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->set('name', 'Should Not Persist')->set('values', [])->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->name)->not->toBe('Should Not Persist');
});

test('confirming delete (a disclosure) is forbidden for an actor lacking products.delete', function () {
    $this->withoutExceptionHandling();
    $creator = attributeTypesFullActor();
    $this->actingAs($creator);
    $target = app(CreateProductAttributeType::class)('Size', []);

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.view');
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', $target->id))
        ->toThrow(AuthorizationException::class);

    expect(ProductAttributeType::find($target->id))->not->toBeNull();
});

test('deleting is re-checked inside deleteType, not only at confirmDelete', function () {
    $this->withoutExceptionHandling();
    $actor = attributeTypesFullActor(['products.view', 'products.create', 'products.delete']);
    $this->actingAs($actor);

    $target = app(CreateProductAttributeType::class)('Size', []);

    $component = Livewire::test(Index::class)->call('confirmDelete', $target->id);

    $actor->revokePermissionTo('products.delete');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('deleteType'))
        ->toThrow(AuthorizationException::class);

    expect(ProductAttributeType::find($target->id))->not->toBeNull();
});

test('a Super Admin holding zero permission rows passes every gated component method', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $target = app(CreateProductAttributeType::class)('Size', []);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Super Admin Created')
        ->set('values', [])
        ->call('save')
        ->assertHasNoErrors();

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('name', 'Super Admin Renamed')
        ->set('values', [])
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->name)->toBe('Super Admin Renamed');
});

test('an actor holding only products.view sees every row action disabled', function () {
    $creator = attributeTypesFullActor();
    $this->actingAs($creator);
    app(CreateProductAttributeType::class)('Size', []);
    app(CreateProductAttributeType::class)('Color', []);

    $viewer = User::factory()->create();
    $viewer->givePermissionTo('products.view');
    $this->actingAs($viewer);

    $rows = collect(Livewire::test(Index::class)->get('types'));

    expect($rows)->toHaveCount(2);
    $rows->each(fn (array $row) => expect($row)
        ->canEdit->toBeFalse()
        ->canDelete->toBeFalse());
});

// =====================================================================
// Authorization -- action layer (D6: every action self-authorizes as its own first statement)
// =====================================================================

test('creating a product attribute type directly is forbidden for a denied actor, and writes no row', function () {
    $actor = User::factory()->create();
    $this->actingAs($actor);

    expect(fn () => app(CreateProductAttributeType::class)('Size', []))
        ->toThrow(AuthorizationException::class);

    expect(ProductAttributeType::where('name', 'Size')->exists())->toBeFalse();
});

test('updating a product attribute type directly is forbidden for a denied actor, and leaves the type unchanged', function () {
    $creator = attributeTypesFullActor();
    $this->actingAs($creator);
    $type = app(CreateProductAttributeType::class)('Size', []);

    $deniedActor = User::factory()->create();
    $this->actingAs($deniedActor);

    expect(fn () => app(UpdateProductAttributeType::class)($type, 'Shoe size', []))
        ->toThrow(AuthorizationException::class);

    expect($type->fresh()->name)->toBe('Size');
});

test('deleting a product attribute type directly is forbidden for a denied actor, and the type still exists', function () {
    $creator = attributeTypesFullActor();
    $this->actingAs($creator);
    $type = app(CreateProductAttributeType::class)('Size', []);

    $deniedActor = User::factory()->create();
    $this->actingAs($deniedActor);

    expect(fn () => app(DeleteProductAttributeType::class)($type))
        ->toThrow(AuthorizationException::class);

    expect(ProductAttributeType::find($type->id))->not->toBeNull();
});

// =====================================================================
// Permission-cache staleness (revocation direction) -- never flush between Act and Assert
// =====================================================================

test('revoking products.edit via a role change is reflected immediately, not masked by a stale cache', function () {
    $limitedRole = Role::create(['name' => 'Attribute Type Editor', 'guard_name' => 'web']);
    $limitedRole->givePermissionTo(['products.view']); // deliberately withholds products.edit

    $user = User::factory()->create();
    $user->assignRole('Administrator'); // Administrator holds products.edit

    // Warm the cache first, asserting the pre-revocation truth.
    expect($user->hasPermissionTo('products.edit'))->toBeTrue();

    $user->syncRoles([$limitedRole]);

    // No forgetCachedPermissions() call here, between Act and Assert -- if a stale cache were
    // masking the revocation, this assertion (re-resolved fresh) is what must catch it.
    expect($user->fresh()->hasPermissionTo('products.edit'))->toBeFalse();
});
