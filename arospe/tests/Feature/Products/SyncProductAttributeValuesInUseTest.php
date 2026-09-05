<?php

// Story 0029a -- App\Actions\Products\SyncProductAttributeValues' delete branch in-use guard
// (D-A1 path 2 / D-A4). Kept in its own file, separate from tests/Feature/Products/
// SyncProductAttributeValuesTest.php (0028's own diff/id-stability regression suite, which stays
// green and untouched by this story), per the task file's own reasoning: this is the file that
// proves the guard did not disturb the diff, and that file is the file that proves it didn't need
// to be touched to stay correct.
//
// SyncProductAttributeValues authorizes nothing of its own (D6/D-A2) -- every test below calls it
// directly via app(SyncProductAttributeValues::class), the same shape its own docblock and
// CreateProductAttributeType/UpdateProductAttributeType already establish as its real callers.

use App\Actions\Products\SyncProductAttributeValues;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * @return array{0: ProductAttributeType, 1: ProductAttributeValue, 2: ProductAttributeValue}
 */
function syncInUseFixture(): array
{
    $type = ProductAttributeType::factory()->create(['name' => 'Size']);
    $unused = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => '39',
        'position' => 0,
    ]);
    $used = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => '40',
        'position' => 1,
    ]);

    ProductVariant::factory()->withCombination([$used->id])->create();

    return [$type, $unused, $used];
}

// =====================================================================
// The control: a removal with no in-use values still works (the case that stops a
// refuse-everything guard from passing every other test in this file).
// =====================================================================

test('removing a value no variant uses still deletes it', function () {
    $type = ProductAttributeType::factory()->create(['name' => 'Color']);
    $keep = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $type->id, 'value' => 'Black', 'position' => 0]);
    $remove = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $type->id, 'value' => 'White', 'position' => 1]);

    app(SyncProductAttributeValues::class)($type, [
        ['id' => $keep->id, 'value' => $keep->value],
    ]);

    $this->assertDatabaseHas('product_attribute_values', ['id' => $keep->id]);
    $this->assertDatabaseMissing('product_attribute_values', ['id' => $remove->id]);
});

// =====================================================================
// The block (D-A1 path 2 / D-A5).
// =====================================================================

test('removing a value in use throws ValidationException on values, names the count, and the value survives', function () {
    [$type, $unused, $used] = syncInUseFixture();

    $caught = null;

    try {
        app(SyncProductAttributeValues::class)($type, [
            ['id' => $unused->id, 'value' => $unused->value],
        ]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('values')
        ->and($caught->errors()['values'][0])->toContain('1');

    // FP-A2: the row itself survives, not merely the throw.
    $this->assertDatabaseHas('product_attribute_values', ['id' => $used->id]);
});

// The diff runs in one transaction, so a partial apply would leave the type's value list in a
// state the administrator never asked for -- removing TWO values where only one is in use must
// refuse the whole save and delete NEITHER.
test('removing two values where only one is in use refuses the whole save and deletes neither', function () {
    $type = ProductAttributeType::factory()->create(['name' => 'Size']);
    $kept = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $type->id, 'value' => '38', 'position' => 0]);
    $unused = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $type->id, 'value' => '39', 'position' => 1]);
    $used = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $type->id, 'value' => '40', 'position' => 2]);

    ProductVariant::factory()->withCombination([$used->id])->create();

    expect(fn () => app(SyncProductAttributeValues::class)($type, [
        ['id' => $kept->id, 'value' => $kept->value],
    ]))->toThrow(ValidationException::class);

    $this->assertDatabaseHas('product_attribute_values', ['id' => $kept->id]);
    $this->assertDatabaseHas('product_attribute_values', ['id' => $unused->id]);
    $this->assertDatabaseHas('product_attribute_values', ['id' => $used->id]);
});

// FP-A3: both the in-use refusal and SyncProductAttributeValues' own pre-existing duplicate-value
// refusal (writeRow()'s 23000 catch) throw ValidationException on the SAME bag key, 'values' --
// only the TRANSLATION KEY distinguishes them, per D-A4. A bag-key-only assertion would pass
// against a guard that routed the delete through writeRow(), which is the exact bug D-A4 exists
// to prevent.
test('the refusal is an in-use message, never the duplicate-value message', function () {
    [$type, $unused, $used] = syncInUseFixture();

    $caught = null;

    try {
        app(SyncProductAttributeValues::class)($type, [
            ['id' => $unused->id, 'value' => $unused->value],
        ]);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    $message = $caught->errors()['values'][0];

    expect($message)->toBe(trans_choice('products.variants.value_in_use', 1, ['count' => 1]))
        ->and($message)->not->toBe(trans('validation.distinct', ['attribute' => 'value']));
});

// D-A4's race backstop: a competing pivot row is inserted between the app-level pre-check (which
// passes, since the race has not happened yet) and the real DELETE statement, via a
// DB::beforeExecuting() hook matched to the exact DELETE this class issues -- App\Livewire's own
// component has no seam to hook a model event through here, since a plain
// ProductAttributeValue::whereIn(...)->delete() fires no Eloquent model events at all (it never
// instantiates a model). The outcome must be the same clean ValidationException, never a 500 and
// never a duplicate-value message.
test('the 1451 backstop fires cleanly under a race, never a 500 and never a duplicate-value message', function () {
    $type = ProductAttributeType::factory()->create(['name' => 'Size']);
    $kept = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $type->id, 'value' => '38', 'position' => 0]);
    $racedAway = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $type->id, 'value' => '39', 'position' => 1]);

    // A pre-existing variant, attached to an UNRELATED value, so its own combination_hash is
    // legitimate and the race only adds a SECOND pivot row for the same variant.
    $otherType = ProductAttributeType::factory()->create(['name' => 'Color']);
    $otherValue = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $otherType->id, 'value' => 'Black', 'position' => 0]);
    $variant = ProductVariant::factory()->withCombination([$otherValue->id])->create();

    $raced = false;

    DB::beforeExecuting(function ($query, $bindings) use (&$raced, $racedAway, $variant): void {
        if ($raced) {
            return;
        }

        if (str_starts_with((string) $query, 'delete from `product_attribute_values`')
            && in_array($racedAway->id, $bindings, true)) {
            $raced = true;

            DB::table('product_variant_values')->insert([
                'product_variant_id' => $variant->id,
                'product_attribute_value_id' => $racedAway->id,
            ]);
        }
    });

    $caught = null;

    try {
        app(SyncProductAttributeValues::class)($type, [
            ['id' => $kept->id, 'value' => $kept->value],
        ]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($raced)->toBeTrue()
        ->and($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('values')
        ->and($caught->errors()['values'][0])->toBe(trans_choice('products.variants.value_in_use', 1, ['count' => 1]))
        ->and($caught->errors()['values'][0])->not->toBe(trans('validation.distinct', ['attribute' => 'value']));

    $this->assertDatabaseHas('product_attribute_values', ['id' => $racedAway->id]);
});

// The narrowing must not swallow unrelated database errors: a QueryException whose errorInfo is
// deliberately NOT 1451 must still propagate unmodified. Constructed directly via
// DB::beforeExecuting() -- rather than a real deadlock or a schema-level trigger, both of which
// would either be non-deterministic or risk an implicit DDL commit breaking this test's own
// RefreshDatabase transaction -- so this is a fully-formed, real Illuminate\Database\QueryException
// instance thrown from the exact call site the production code catches, with a controlled
// errorInfo[1] that is provably not 1451.
test('a QueryException that is not 1451 still propagates unmodified', function () {
    $type = ProductAttributeType::factory()->create(['name' => 'Size']);
    $kept = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $type->id, 'value' => '38', 'position' => 0]);
    $toRemove = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $type->id, 'value' => '39', 'position' => 1]);

    DB::beforeExecuting(function ($query, $bindings) use ($toRemove): void {
        if (str_starts_with((string) $query, 'delete from `product_attribute_values`')
            && in_array($toRemove->id, $bindings, true)) {
            $previous = new PDOException('Simulated unrelated database error');
            $previous->errorInfo = ['HY000', 9999, 'Simulated unrelated database error'];

            throw new QueryException('mysql', $query, $bindings, $previous);
        }
    });

    $caught = null;

    try {
        app(SyncProductAttributeValues::class)($type, [
            ['id' => $kept->id, 'value' => $kept->value],
        ]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(QueryException::class)
        ->and($caught)->not->toBeInstanceOf(ValidationException::class)
        ->and($caught->errorInfo[1] ?? null)->toBe(9999);

    // The delete never ran (it was intercepted before execution), so the value survives -- not
    // asserted as the point of the test, but recorded so a future reader can tell the fixture
    // apart from a genuine 1451 scenario.
    $this->assertDatabaseHas('product_attribute_values', ['id' => $toRemove->id]);
});
