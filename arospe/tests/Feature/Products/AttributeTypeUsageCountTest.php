<?php

// Story 0029a -- App\Models\ProductAttributeType::variantUsageCount() (D-A3/D-A6), the single
// source of the type-level count consumed by both App\Actions\Products\
// DeleteProductAttributeType's in-use guard and App\Livewire\Products\AttributeTypes\Index::
// confirmDelete(). One query, one source of truth: this file pins that both callers agree with
// it, over the same dataset tests/Feature/Products/DeleteProductAttributeTypeTest.php uses.

use App\Livewire\Products\AttributeTypes\Index;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Livewire\Attributes\Locked;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $this->actor = User::factory()->create();
    $this->actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);
    $this->actingAs($this->actor);
});

/**
 * Same shape as DeleteProductAttributeTypeTest.php's own fixture (kept independent, not shared,
 * since Pest test files cannot share a global function of the same name) -- $n values, each
 * backing exactly one variant, plus a decoy type with 5 variants of its own (FP-A1).
 */
function usageCountFixtureWithVariants(int $n): ProductAttributeType
{
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

test('variantUsageCount() returns the exact number of distinct variants built on any value of the type', function (int $n) {
    $type = usageCountFixtureWithVariants($n);

    expect($type->variantUsageCount())->toBe($n);
})->with([1, 2, 12]);

test('variantUsageCount() is 0 for a type with no variants at all', function () {
    $type = ProductAttributeType::factory()->withValues(2)->create();

    expect($type->variantUsageCount())->toBe(0);
});

test('confirmDelete() populates deletingTypeUsageCount with the real value from variantUsageCount()', function () {
    $type = usageCountFixtureWithVariants(7);

    $component = Livewire::test(Index::class)->call('confirmDelete', $type->id);

    expect($component->get('deletingTypeUsageCount'))->toBe(7)
        ->and($type->variantUsageCount())->toBe(7);
});

test('deletingTypeUsageCount stays an int and #[Locked] after confirmDelete()', function () {
    $type = usageCountFixtureWithVariants(2);

    $reflection = new ReflectionProperty(Index::class, 'deletingTypeUsageCount');

    expect((string) $reflection->getType())->toBe('int')
        ->and($reflection->getAttributes(Locked::class))->not->toBeEmpty();

    Livewire::test(Index::class)->call('confirmDelete', $type->id)
        ->assertSet('deletingTypeUsageCount', 2);
});

// D-A2's component-level mirror: confirmDelete() refuses BEFORE populating the count property,
// for an actor lacking products.delete.
test('confirmDelete() for an actor without products.delete refuses before populating the usage count', function () {
    $this->withoutExceptionHandling();

    $type = usageCountFixtureWithVariants(12);

    $unauthorized = User::factory()->create();
    $unauthorized->givePermissionTo(['products.view']);
    $this->actingAs($unauthorized);

    $component = Livewire::test(Index::class);

    expect(fn () => $component->call('confirmDelete', $type->id))
        ->toThrow(AuthorizationException::class);

    expect($component->get('deletingTypeUsageCount'))->toBe(0)
        ->and($component->get('showDeleteModal'))->toBeFalse();
});
