<?php

use App\Actions\Products\SyncProductAttributeValues;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;

// Story 0028, Phase 3 (TDD "red" step): App\Actions\Products\SyncProductAttributeValues, App\
// Models\ProductAttributeType/ProductAttributeValue, their factories and the two
// product_attribute_* migrations do not exist yet -- every test below is expected to fail (class/
// table not found) until database-expert/backend-expert implement them in the next step of the
// TDD cycle. That is the correct, intended "red" outcome.
//
// This file drives App\Actions\Products\SyncProductAttributeValues DIRECTLY, never through the
// Livewire component -- exactly as the task file's own "Files to create" description says
// ("drives the diff action directly, not through the component") and as D4's own text repeats
// for the no-op regression test specifically ("Drive it through SyncProductAttributeValues
// directly, not only through the component").
//
// ASSUMED SIGNATURE (not given verbatim by the task file, since only the algorithm -- D4's five
// numbered steps -- and the "shared by both actions" role are specified): a `void` action, mirror-
// ing App\Actions\Products\SyncProductGallery's own shape as the closest precedent this codebase
// has for a diff-based pivot/child-row writer:
//
//   public function __invoke(ProductAttributeType $type, array $values): void
//
// where `$values` is an ordered array of `array{id: string|null, value: string}` -- the SAME
// shape the Livewire component's own `$values` property carries, minus the view-only `key` field
// (D2's public-surface docblock is explicit that `key` "exists only so the view can give each row
// a stable wire:key" -- it has no persistence meaning, so tests in this file never include it).
// `position` is never passed explicitly; per D5's "reorder by rewriting the whole sibling set...
// (position = $index over the submitted order)" rule and D4's own diff shape, this action derives
// each row's position from its index in the submitted array on every call -- the same shape
// SyncProductGallery already uses for `product_media.position`. If backend-expert's real
// signature differs, every test below fails for that reason and the signature assumption is the
// first thing to reconcile.

// =====================================================================
// D4 -- the 0029 regression net: id stability
// =====================================================================

test('a no-op re-save of an unchanged type leaves every value id byte-for-byte identical', function () {
    $type = ProductAttributeType::factory()->withValues(3)->create();
    $originalIds = $type->values->pluck('id')->sort()->values()->all();
    $submission = $type->values->map(fn (ProductAttributeValue $value): array => [
        'id' => $value->id,
        'value' => $value->value,
    ])->all();

    app(SyncProductAttributeValues::class)($type, $submission);

    $freshIds = $type->fresh()->values->pluck('id')->sort()->values()->all();

    expect($freshIds)->toBe($originalIds);
    expect(ProductAttributeValue::where('product_attribute_type_id', $type->id)->count())->toBe(3);
});

test('adding a value leaves the ids of every pre-existing value identical and adds exactly one new row', function () {
    $type = ProductAttributeType::factory()->withValues(3)->create();
    $originalIds = $type->values->pluck('id')->sort()->values()->all();
    $submission = $type->values->map(fn (ProductAttributeValue $value): array => [
        'id' => $value->id,
        'value' => $value->value,
    ])->push(['id' => null, 'value' => '41'])->all();

    app(SyncProductAttributeValues::class)($type, $submission);

    $freshType = $type->fresh();

    expect($freshType->values)->toHaveCount(4);

    $freshIds = $freshType->values->pluck('id')->all();
    expect(array_intersect($originalIds, $freshIds))->toBe($originalIds);

    $newIds = array_diff($freshIds, $originalIds);
    expect($newIds)->toHaveCount(1);
    expect(ProductAttributeValue::find(array_values($newIds)[0])->value)->toBe('41');
});

test('removing a value deletes exactly that row and leaves the surviving ids unchanged -- the id comparison IS the test (FP2)', function () {
    $type = ProductAttributeType::factory()->withValues(3)->create();
    $values = $type->values;
    $removed = $values->get(1);
    $survivors = $values->reject(fn (ProductAttributeValue $value): bool => $value->id === $removed->id);
    $survivorIds = $survivors->pluck('id')->sort()->values()->all();

    $submission = $survivors->map(fn (ProductAttributeValue $value): array => [
        'id' => $value->id,
        'value' => $value->value,
    ])->all();

    app(SyncProductAttributeValues::class)($type, $submission);

    $freshType = $type->fresh();

    expect($freshType->values)->toHaveCount(2);
    expect($freshType->values->pluck('id')->sort()->values()->all())->toBe($survivorIds);
    expect(ProductAttributeValue::find($removed->id))->toBeNull();
});

test('renaming a value changes only its own text -- id, type binding, and every sibling are unchanged', function () {
    $type = ProductAttributeType::factory()->withValues(3)->create();
    $values = $type->values;
    $renamed = $values->first();
    $others = $values->skip(1);
    $othersBefore = $others->map(fn (ProductAttributeValue $value): array => ['id' => $value->id, 'value' => $value->value])->all();

    $submission = $values->map(fn (ProductAttributeValue $value): array => [
        'id' => $value->id,
        'value' => $value->id === $renamed->id ? '38 EU' : $value->value,
    ])->all();

    app(SyncProductAttributeValues::class)($type, $submission);

    $freshRenamed = ProductAttributeValue::find($renamed->id);
    expect($freshRenamed)->not->toBeNull()
        ->and($freshRenamed->value)->toBe('38 EU')
        ->and($freshRenamed->product_attribute_type_id)->toBe($type->id);

    foreach ($othersBefore as $before) {
        $fresh = ProductAttributeValue::find($before['id']);
        expect($fresh->value)->toBe($before['value']);
    }
});

// =====================================================================
// D4 step 2 -- forged-id re-scoping (security-critical: R-1/step 2)
// =====================================================================

test('a submitted id that belongs to ANOTHER type is treated as a new row, never updating that other type\'s row', function () {
    $typeA = ProductAttributeType::factory()->withValues(1)->create();
    $foreignValue = $typeA->values->first();
    $typeB = ProductAttributeType::factory()->create();

    // $foreignValue's real id, but scoped to $typeB -- exactly the crafted /livewire/update
    // payload D4 step 2 exists to defend against.
    app(SyncProductAttributeValues::class)($typeB, [
        ['id' => $foreignValue->id, 'value' => 'Hijacked'],
    ]);

    // Type A's row is completely untouched.
    $stillTypeAsRow = ProductAttributeValue::find($foreignValue->id);
    expect($stillTypeAsRow)->not->toBeNull()
        ->and($stillTypeAsRow->value)->toBe($foreignValue->value)
        ->and($stillTypeAsRow->product_attribute_type_id)->toBe($typeA->id);

    // Type B got a genuinely NEW row instead, with a different id.
    $typeBValues = $typeB->fresh()->values;
    expect($typeBValues)->toHaveCount(1)
        ->and($typeBValues->first()->id)->not->toBe($foreignValue->id)
        ->and($typeBValues->first()->value)->toBe('Hijacked');
});

// =====================================================================
// D5 -- position from submission order, exact array (FP6: never toContain / a sorted copy)
// =====================================================================

test('positions are assigned from the submitted array order, not sorted alphabetically or numerically', function () {
    $type = ProductAttributeType::factory()->create();

    // Deliberately NOT in ascending numeric or lexicographic order -- proves position governs
    // the read-back order, not the value text itself.
    app(SyncProductAttributeValues::class)($type, [
        ['id' => null, 'value' => '40'],
        ['id' => null, 'value' => '38'],
        ['id' => null, 'value' => '39'],
    ]);

    expect($type->fresh()->values->pluck('value')->all())->toBe(['40', '38', '39']);
});

test('reordering an existing set updates positions contiguously and does not touch any value id', function () {
    $type = ProductAttributeType::factory()->create();

    app(SyncProductAttributeValues::class)($type, [
        ['id' => null, 'value' => '38'],
        ['id' => null, 'value' => '39'],
        ['id' => null, 'value' => '40'],
    ]);

    $original = $type->fresh()->values->keyBy('value');
    $originalIds = $original->pluck('id')->sort()->values()->all();

    // Submit the SAME ids, in reversed order.
    app(SyncProductAttributeValues::class)($type, [
        ['id' => $original->get('40')->id, 'value' => '40'],
        ['id' => $original->get('39')->id, 'value' => '39'],
        ['id' => $original->get('38')->id, 'value' => '38'],
    ]);

    $reordered = $type->fresh()->values;

    expect($reordered->pluck('value')->all())->toBe(['40', '39', '38']);
    expect($reordered->pluck('id')->sort()->values()->all())->toBe($originalIds);
});

// =====================================================================
// Composite uniqueness (D3): the same value text is legal under two different types
// =====================================================================

test('the same value text is accepted under two different attribute types -- the constraint is composite, never global', function () {
    $color = ProductAttributeType::factory()->create();
    $material = ProductAttributeType::factory()->create();

    app(SyncProductAttributeValues::class)($color, [['id' => null, 'value' => 'Black']]);
    app(SyncProductAttributeValues::class)($material, [['id' => null, 'value' => 'Black']]);

    expect($color->fresh()->values->pluck('value')->all())->toBe(['Black']);
    expect($material->fresh()->values->pluck('value')->all())->toBe(['Black']);
    expect(ProductAttributeValue::where('value', 'Black')->count())->toBe(2);
});

// =====================================================================
// D4's own explicit contract: a QueryException 23000 is caught and rethrown as ValidationException
// =====================================================================

// This layer performs no Validator::make()/distinct:ignore_case check of its own (that lives in
// the calling action/component, above this one) -- so a submission with an in-payload duplicate
// reaches the REAL composite UNIQUE(product_attribute_type_id, value) index unguarded, and this is
// exactly what proves the 23000-to-ValidationException catch D4 requires actually exists, driven
// through a genuine MySQL constraint violation rather than a mocked exception.
test('two submitted values sharing the same text (bypassing upstream validation) surface as a ValidationException, never an unhandled QueryException', function () {
    $type = ProductAttributeType::factory()->create();

    $caught = null;

    try {
        app(SyncProductAttributeValues::class)($type, [
            ['id' => null, 'value' => 'Duplicate'],
            ['id' => null, 'value' => 'Duplicate'],
        ]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);

    // The transaction (D4: "runs inside one DB::transaction") must leave at most one row --
    // never two, and never a partially-committed state.
    expect(ProductAttributeValue::where('product_attribute_type_id', $type->id)->where('value', 'Duplicate')->count())
        ->toBeLessThan(2);
});

// =====================================================================
// Reachability -- D6's fifth shipped "collaborator needs no gate" instance
// =====================================================================
//
// Mirrors tests/Feature/Products/ProductAuthorizationTest.php's identical structural test for
// App\Actions\Products\SyncProductGallery -- SyncProductAttributeValues deliberately authorizes
// NOTHING because it is a collaborator invoked only by CreateProductAttributeType and
// UpdateProductAttributeType, both of which have already authorized the whole operation before
// calling it. This test is what makes that omission structural rather than an oversight: if a
// future caller ever references this class directly, that caller owns adding the gate.

function fileReferencesSyncProductAttributeValuesOutsideComments(string $path): bool
{
    $contents = file_get_contents($path);

    if ($contents === false) {
        return false;
    }

    if (! str_contains($contents, 'SyncProductAttributeValues')) {
        return false;
    }

    foreach (token_get_all($contents) as $token) {
        if (is_array($token) && in_array($token[0], [T_COMMENT, T_DOC_COMMENT], true)) {
            continue;
        }

        $text = is_array($token) ? $token[1] : $token;

        if (str_contains($text, 'SyncProductAttributeValues')) {
            return true;
        }
    }

    return false;
}

test('SyncProductAttributeValues is referenced only by CreateProductAttributeType and UpdateProductAttributeType anywhere under app/, database/ or routes/', function () {
    $allowedFiles = array_map('realpath', array_filter([
        app_path('Actions/Products/CreateProductAttributeType.php'),
        app_path('Actions/Products/UpdateProductAttributeType.php'),
        app_path('Actions/Products/SyncProductAttributeValues.php'),
    ], fn (string $path): bool => file_exists($path)));

    $offenders = [];

    $scanRoots = [app_path(), base_path('database'), base_path('routes')];

    foreach ($scanRoots as $root) {
        if (! is_dir($root)) {
            continue;
        }

        foreach (File::allFiles($root) as $file) {
            $path = $file->getRealPath();

            if ($path === false || $file->getExtension() !== 'php' || in_array($path, $allowedFiles, true)) {
                continue;
            }

            if (fileReferencesSyncProductAttributeValuesOutsideComments($path)) {
                $offenders[] = $path;
            }
        }
    }

    expect($offenders)->toBe([]);
});
