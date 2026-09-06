<?php

// Story 0029a -- App\Actions\Products\DeleteProductAttributeType's in-use guard (D-A1 path 1).
// This file did not exist before this story: 0028 shipped no dedicated action-level test file for
// this class, testing it only indirectly through App\Livewire\Products\AttributeTypes\Index (see
// tests/Feature/Products/AttributeTypesIndexTest.php's own "Delete" section, which stays green and
// untouched by this story -- the regression case below duplicates its intent at the action level
// so this class has direct coverage too). Modeled on tests/Feature/ProductCategories/
// DeleteProductCategoryTest.php's shape (0024b/0025's own in-use-guard precedent), since D-A5
// inherits 0024b's D-14 wholesale.

use App\Actions\Products\DeleteProductAttributeType;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $this->actor = User::factory()->create();
    $this->actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);
    $this->actingAs($this->actor);
});

/**
 * Build a type with $n values, each backing exactly one variant on its own product -- so
 * variantUsageCount() reads $n. A decoy type with 5 variants of its own is seeded every time
 * (FP-A1): without it, ProductVariant::count() and the type-scoped count are indistinguishable,
 * and a test built on this fixture could not fail for the reason it exists.
 */
function deleteAttributeTypeFixtureWithVariants(int $n): ProductAttributeType
{
    // Names are left to the factory's own fake()->unique() default -- this function is called
    // more than once per test ("the singular and plural forms differ"), and a literal name here
    // would collide with product_attribute_types_name_unique on the second call.
    $type = ProductAttributeType::factory()->create();
    $values = ProductAttributeValue::factory()->count($n)->for($type, 'type')->create();

    foreach ($values as $value) {
        ProductVariant::factory()->withCombination([$value->id])->create();
    }

    $decoyType = ProductAttributeType::factory()->create();
    $decoyValue = ProductAttributeValue::factory()->for($decoyType, 'type')->create();
    ProductVariant::factory()->count(5)->withCombination([$decoyValue->id])->create();

    return $type->fresh();
}

function deleteAttributeTypeCaptureMessage(ProductAttributeType $type): string
{
    try {
        app(DeleteProductAttributeType::class)($type->fresh());
    } catch (ValidationException $e) {
        return $e->errors()['productAttributeTypeId'][0];
    }

    throw new RuntimeException('Expected a ValidationException, none was thrown.');
}

// =====================================================================
// Regression -- 0028's own delete behaviour, untouched.
// =====================================================================

test('deleting a type with no variants removes it and its values', function () {
    $type = ProductAttributeType::factory()->withValues(2)->create();
    $valueIds = $type->values->pluck('id')->all();

    $result = app(DeleteProductAttributeType::class)($type);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('product_attribute_types', ['id' => $type->id]);

    foreach ($valueIds as $id) {
        $this->assertDatabaseMissing('product_attribute_values', ['id' => $id]);
    }
});

// =====================================================================
// The block (D-A1 path 1 / D-A3 / D-A5)
// =====================================================================

test('deleting a type whose values back N variants is blocked and the type still exists afterwards', function (int $n) {
    $type = deleteAttributeTypeFixtureWithVariants($n);

    $caught = null;

    try {
        app(DeleteProductAttributeType::class)($type);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('productAttributeTypeId')
        ->and($caught->errors()['productAttributeTypeId'][0])->toContain((string) $n);

    $this->assertDatabaseHas('product_attribute_types', ['id' => $type->id]);
})->with([1, 2, 12]);

// D-A3's DISTINCT is what this pins: a variant built on two values of the SAME type (legal at
// schema level, story 0029's DIS-1) must count once, not twice, or the administrator is told 2
// variants are affected when 1 is.
test('a variant using two values of the same type counts once, not twice', function () {
    $type = ProductAttributeType::factory()->create();
    $values = ProductAttributeValue::factory()->count(2)->for($type, 'type')->create()->all();

    ProductVariant::factory()->withCombination([$values[0]->id, $values[1]->id])->create();

    expect($type->fresh()->variantUsageCount())->toBe(1);

    $caught = null;

    try {
        app(DeleteProductAttributeType::class)($type->fresh());
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors()['productAttributeTypeId'][0])->toContain('1 variant')
        ->and($caught->errors()['productAttributeTypeId'][0])->not->toContain('2 variant');
});

test('the singular and plural forms differ, in both locales', function () {
    $originalLocale = App::getLocale();

    try {
        $one = deleteAttributeTypeFixtureWithVariants(1);
        $two = deleteAttributeTypeFixtureWithVariants(2);

        App::setLocale('en');
        $oneMessageEn = deleteAttributeTypeCaptureMessage($one);
        $twoMessageEn = deleteAttributeTypeCaptureMessage($two);

        expect($oneMessageEn)->toContain('1 variant')->not->toContain('1 variants')
            ->and($twoMessageEn)->toContain('2 variants');

        App::setLocale('es');
        $oneMessageEs = deleteAttributeTypeCaptureMessage($one);
        $twoMessageEs = deleteAttributeTypeCaptureMessage($two);

        expect($oneMessageEs)->toContain('1 variante')->not->toContain('1 variantes')
            ->and($twoMessageEs)->toContain('2 variantes');
    } finally {
        App::setLocale($originalLocale);
    }
});

// =====================================================================
// D-A2: the guard runs strictly AFTER Gate::authorize(), never before.
// =====================================================================

test('an actor without products.delete is refused with AuthorizationException, and the count appears nowhere', function () {
    Log::spy();

    $type = deleteAttributeTypeFixtureWithVariants(12);

    $unauthorized = User::factory()->create();
    $unauthorized->givePermissionTo(['products.view']);
    $this->actingAs($unauthorized);

    $caught = null;

    try {
        app(DeleteProductAttributeType::class)($type->fresh());
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class)
        ->and($caught)->not->toBeInstanceOf(ValidationException::class)
        ->and($caught->getMessage())->not->toContain('12');

    Log::shouldHaveReceived('warning')
        ->withArgs(function (string $message, array $context) use ($unauthorized): bool {
            // Flaky-test fix: this file's own $type is seeded with exactly 12 variants, and the
            // real guarantee under test is that the COUNT never leaks into the log context --
            // i.e. no 'count' key at all, per D-A2. The previous assertion additionally
            // stringified the WHOLE context (including actor_id/target_id, both random UUIDv7
            // strings) and searched it for the literal substring '12', which fails whenever
            // either UUID happens to contain '12' by chance -- measured at ~9% of runs, unrelated
            // to whether the count actually leaked. array_key_exists('count', ...) below is
            // already the precise, deterministic check; dropped the substring scan rather than
            // widen it to a fragile allow-list of "safe" keys.
            return $message === 'Privileged action refused'
                && ($context['actor_id'] ?? null) === $unauthorized->id
                && ($context['ability'] ?? null) === 'delete'
                && ($context['target_type'] ?? null) === 'product_attribute_type'
                && ! array_key_exists('count', $context);
        })
        ->once();

    $this->assertDatabaseHas('product_attribute_types', ['id' => $type->id]);
});

// =====================================================================
// No confirm-and-proceed path, at any privilege level (D-A5).
// =====================================================================

test('there is no confirm-and-proceed path: the method takes exactly one parameter', function () {
    $method = new ReflectionMethod(DeleteProductAttributeType::class, '__invoke');

    expect($method->getNumberOfParameters())->toBe(1)
        ->and($method->getParameters()[0]->getType()?->getName())->toBe(ProductAttributeType::class);
});

test('there is no confirm-and-proceed path: calling twice in succession is refused both times', function () {
    $type = deleteAttributeTypeFixtureWithVariants(1);

    expect(fn () => app(DeleteProductAttributeType::class)($type))->toThrow(ValidationException::class);
    expect(fn () => app(DeleteProductAttributeType::class)($type->fresh()))->toThrow(ValidationException::class);

    $this->assertDatabaseHas('product_attribute_types', ['id' => $type->id]);
});

test('there is no confirm-and-proceed path: a Super Admin is refused identically to any other actor', function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $type = deleteAttributeTypeFixtureWithVariants(12);

    $caught = null;

    try {
        app(DeleteProductAttributeType::class)($type);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors()['productAttributeTypeId'][0])->toContain('12');
    $this->assertDatabaseHas('product_attribute_types', ['id' => $type->id]);
});

// =====================================================================
// Refusal logging (D-A5).
// =====================================================================

test('the in-use refusal is logged with reason attribute_type_in_use, target_type and target_id', function () {
    Log::spy();

    $type = deleteAttributeTypeFixtureWithVariants(3);

    try {
        app(DeleteProductAttributeType::class)($type);
    } catch (ValidationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $this->actor->id
            && ($context['ability'] ?? null) === 'attribute_type_in_use'
            && ($context['target_type'] ?? null) === 'product_attribute_type'
            && ($context['target_id'] ?? null) === $type->id)
        ->once();
});
