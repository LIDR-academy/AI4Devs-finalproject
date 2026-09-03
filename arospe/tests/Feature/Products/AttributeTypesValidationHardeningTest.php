<?php

use App\Actions\Products\CreateProductAttributeType;
use App\Actions\Products\SyncProductAttributeValues;
use App\Livewire\Products\AttributeTypes\Index;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Str;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

// Story 0028, Phase 4 security-audit regression tests. appsec-auditor found and fixed three real
// findings directly in App\Livewire\Products\AttributeTypes\Index::save(),
// App\Concerns\ProductAttributeValidationRules and App\Actions\Products\SyncProductAttributeValues
// -- this file pins each one so a revert of the fix would fail here.
//
// F-1 (Medium, DoS/validation-cost): save() used to run values.*.value's distinct:ignore_case
// rule (O(n^2) in the submitted row count) unconditionally, even when `values` had already failed
// its own max:100 size rule -- Laravel expands a wildcard rule against the data it was given
// regardless of whether the parent attribute's own rules already failed (see
// docs/security/array-validation-bounds.md). save() now runs THREE sequential validation passes:
// (1) name + the `values` array's own size, (2) each row's shape/id type, (3) per-value domain
// rules on normalised text -- nothing per-element runs until pass 1 has already passed.
//
// F-2 (Low, unhandled TypeError/500 from client-writable $values): `values` is the form's own
// input and therefore fully client-writable over /livewire/update -- a forged row shaped as a
// bare scalar, or an `id` shaped as an array, used to reach PHP's own type system (an
// array_key_exists() lookup, a string cast) before validation ever ran, raising an uncaught
// TypeError (a 500) rather than a clean validation error. attributeValueRowRules() ('values.*' =>
// ['array']) and attributeValueIdRules() ('values.*.id' => ['nullable', 'string']) now catch both
// shapes in pass 2, before the normalisation closure or SyncProductAttributeValues ever sees them.
//
// F-3 (Low, silent data loss): submitting the SAME owned value id twice in one save used to
// collapse two submitted rows into a single persisted row, because the diff algorithm re-matched
// the same owned id against both submitted rows. SyncProductAttributeValues now unset()s the id
// from its owned-ids lookup set the moment it is matched, so a repeat is treated as a genuinely
// new row instead -- which the composite UNIQUE(product_attribute_type_id, value) index then
// judges on its own merits.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function attributeTypesHardeningActor(array $permissions = ['products.view', 'products.create', 'products.edit', 'products.delete']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

/**
 * @param  array<int, string>  $texts
 * @return array<int, array{id: string|null, key: string, value: string}>
 */
function attributeTypesHardeningValuesPayload(array $texts): array
{
    return array_map(fn (string $text): array => [
        'id' => null,
        'key' => (string) Str::uuid(),
        'value' => $text,
    ], $texts);
}

// =====================================================================
// F-1 -- the array-size bound gates the O(n^2) distinct check, per
// docs/security/array-validation-bounds.md's established rule.
// =====================================================================

test('an oversized values submission is rejected on the size bound alone, before any per-value distinct check runs', function () {
    $actor = attributeTypesHardeningActor();
    $this->actingAs($actor);

    // 150 entries -- comfortably past attributeValueListRules()'s max:100 -- and DELIBERATELY
    // full of duplicates (every entry is literally "Duplicate"). This is what makes the
    // assertion below able to actually distinguish the fix from a revert: with 150 unique
    // values, distinct:ignore_case would never produce an error either way (fixed or not), so
    // an error-key assertion alone couldn't tell the two apart. With duplicates, an unconditional
    // (unpatched) validate() call would ALSO flag "values.*.value" entries as failing
    // distinct:ignore_case alongside the "values" size error -- Laravel expands a wildcard rule
    // against the data it was given regardless of whether the parent attribute's own rules
    // already failed (docs/security/array-validation-bounds.md). The fixed three-pass save()
    // aborts at pass 1 (the size bound) and never reaches pass 3 (distinct:ignore_case) at all,
    // so the error bag carries EXACTLY the "values" key and nothing else.
    $values = attributeTypesHardeningValuesPayload(array_fill(0, 150, 'Duplicate'));

    $startedAt = microtime(true);

    $component = Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Oversized Type')
        ->set('values', $values)
        ->call('save');

    $elapsedSeconds = microtime(true) - $startedAt;

    $component->assertHasErrors(['values']);

    expect($component->errors()->keys())->toBe(['values']);

    expect(ProductAttributeType::where('name', 'Oversized Type')->exists())->toBeFalse();

    // A generous, non-flaky ceiling: the fixed three-pass structure returns near-instantly for
    // 150 rows because pass 1 short-circuits before any per-element rule runs.
    expect($elapsedSeconds)->toBeLessThan(5.0);
});

// =====================================================================
// F-2 -- a malformed, client-writable `values` payload fails cleanly as a
// validation error, never an unhandled TypeError.
// =====================================================================

test('a forged array id in place of a value id is rejected as a validation error, not an unhandled TypeError', function () {
    $actor = attributeTypesHardeningActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Forged Id Type')
        ->set('values', [
            ['id' => ['forged', 'array'], 'key' => (string) Str::uuid(), 'value' => 'Black'],
        ])
        ->call('save');

    $component->assertHasErrors(['values.0.id']);

    expect(ProductAttributeType::where('name', 'Forged Id Type')->exists())->toBeFalse();
});

test('a value row shaped as a bare string instead of an array is rejected as a validation error, not an unhandled TypeError', function () {
    $actor = attributeTypesHardeningActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Forged Row Type')
        // A whole row collapsed to a bare string -- the shape a component-tag-level tamper of
        // the client-writable $values array could produce.
        ->set('values', ['just-a-string-not-a-row'])
        ->call('save');

    $component->assertHasErrors(['values.0']);

    expect(ProductAttributeType::where('name', 'Forged Row Type')->exists())->toBeFalse();
});

// =====================================================================
// F-3 -- the same owned value id submitted twice must produce two distinct
// rows, never a silent collapse. Id-stability via captured id SETS, never
// counts (FP2).
// =====================================================================

test('submitting the same owned value id twice produces two distinct persisted rows, never a silent collapse', function () {
    // SyncProductAttributeValues itself authorizes nothing (D6) -- only the CreateProductAttributeType
    // call below needs an authenticated actor holding products.create.
    $this->actingAs(attributeTypesHardeningActor());

    $type = app(CreateProductAttributeType::class)('Size', attributeTypesHardeningValuesPayload(['38']));
    $existingValue = $type->fresh()->values->first();
    $originalId = $existingValue->id;

    // The SAME owned id submitted twice, with DIFFERENT text on each row -- both can legally
    // coexist under the composite unique index once the second is correctly treated as a new row.
    app(SyncProductAttributeValues::class)($type, [
        ['id' => $originalId, 'value' => '38'],
        ['id' => $originalId, 'value' => '39'],
    ]);

    $freshValues = $type->fresh()->values;

    expect($freshValues)->toHaveCount(2);

    $freshIds = $freshValues->pluck('id')->all();
    // The original row's id survives untouched -- the first occurrence is the one that matches
    // and consumes the owned id.
    expect($freshIds)->toContain($originalId);

    $newIds = array_diff($freshIds, [$originalId]);
    expect($newIds)->toHaveCount(1);

    expect(ProductAttributeValue::find($originalId)->value)->toBe('38');
    expect(ProductAttributeValue::find(array_values($newIds)[0])->value)->toBe('39');
});
