<?php

use App\Actions\Products\CreateProduct;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0024, Phase 3 (TDD "red" step) — see CreateProductTest.php's file banner for the assumed
// CreateProduct::__invoke() signature; unchanged here.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);
    $this->actingAs($actor);
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function categoryAssignmentPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Runner Pro',
        'sku' => 'RNR-'.Str::random(10),
        'productCategoryId' => ProductCategory::factory()->create()->id,
        'type' => 'physical',
        'status' => 'active',
        'price' => '19.99',
        'stock' => 5,
        'description' => null,
        'featuredMediaId' => null,
        'orderedGalleryMediaIds' => [],
    ], $overrides);
}

test('a nonexistent but well-formed category id is refused by ValidationException on product_category_id, with zero rows', function () {
    $caught = null;

    try {
        app(CreateProduct::class)(...categoryAssignmentPayload(['productCategoryId' => (string) Str::uuid7()]));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('product_category_id');

    expect(Product::count())->toBe(0);
});

test('a malformed category id is refused by ValidationException, never a QueryException or a 500', function (mixed $malformed) {
    $caught = null;

    try {
        app(CreateProduct::class)(...categoryAssignmentPayload(['productCategoryId' => $malformed]));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect(Product::count())->toBe(0);
})->with([
    'not a uuid at all' => ['not-a-uuid'],
    'a blank string' => [''],
    'an integer' => [123],
]);

// The FK is a real constraint — 0024b's delete guard's second line of defence. A migration
// quietly dropping ->constrained() would remove that backstop with nothing else going red. A
// deliberate, argued exception to what-not-to-test.md's "database guarantees" rule (per the task
// file's own note) — one test, not a suite.
test('the product_category_id foreign key is a real database constraint', function () {
    expect(fn () => DB::table('products')->insert([
        'id' => (string) Str::uuid7(),
        'product_category_id' => (string) Str::uuid7(),
        'name' => 'Orphan Product',
        'sku' => 'RNR-'.Str::random(10),
        'type' => 'physical',
        'status' => 'draft',
        'price' => '19.99',
        'stock' => 0,
        'created_at' => now(),
        'updated_at' => now(),
    ]))->toThrow(QueryException::class);
});
