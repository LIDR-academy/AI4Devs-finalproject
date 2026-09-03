<?php

use App\Actions\ProductCategories\CreateProductCategory;
use App\Actions\ProductCategories\RenameProductCategory;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// Story 0023, Phase 3 (TDD "red" step) -- see CreateProductCategoryTest.php's file banner; the
// same applies here.
// RenameProductCategory::__invoke(ProductCategory $productCategory, string $name): ProductCategory
// does not exist yet.
//
// Story 0025: both CreateProductCategory (used here only to set up fixtures) and
// RenameProductCategory now authorize themselves as their own first statement, so the actor below
// needs both products.create and products.edit -- see CreateProductCategoryTest.php's identical
// fix and DeleteProductCategoryTest.php's original one (Phase 2 review finding B-2).
beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->actor = User::factory()->create();
    $this->actor->givePermissionTo(['products.create', 'products.edit']);
    $this->actingAs($this->actor);
});

test('renaming to a free name updates the row and leaves the old name unused', function () {
    $category = app(CreateProductCategory::class)('Footwear');

    $renamed = app(RenameProductCategory::class)($category, 'Running shoes');

    expect($renamed->fresh()->name)->toBe('Running shoes')
        ->and(ProductCategory::where('name', 'Footwear')->exists())->toBeFalse();
});

test("renaming onto another category's name is refused and the target keeps its original name", function () {
    app(CreateProductCategory::class)('Footwear');
    $apparel = app(CreateProductCategory::class)('Apparel');

    $caught = null;

    try {
        app(RenameProductCategory::class)($apparel, 'Footwear');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect($apparel->fresh()->name)->toBe('Apparel');
});

// R-1: the single most likely bug in this story -- the Rule::unique()->ignore() trap, and exactly
// why ProfileValidationRules::emailRules() takes a nullable id. Written as THREE tests, not one,
// so a rule that rejects everything cannot pass the first trivially.

test('saving a category under its own current name (a no-op rename) succeeds', function () {
    $category = app(CreateProductCategory::class)('Footwear');

    $result = app(RenameProductCategory::class)($category, 'Footwear');

    expect($result)->not->toBeNull();
});

test('after a no-op rename to the identical name, the row is genuinely unchanged', function () {
    $category = app(CreateProductCategory::class)('Footwear');

    app(RenameProductCategory::class)($category, 'Footwear');

    expect(ProductCategory::where('name', 'Footwear')->count())->toBe(1)
        ->and($category->fresh()->id)->toBe($category->id)
        ->and($category->fresh()->name)->toBe('Footwear');
});

test('a genuinely free name is still accepted when renaming, as the control for the no-op case above', function () {
    $category = app(CreateProductCategory::class)('Footwear');

    $renamed = app(RenameProductCategory::class)($category, 'Boots');

    expect($renamed->fresh()->name)->toBe('Boots');
});

// R-7: nameRules() reused asymmetrically -- a nullable-id rule helper whose $id is threaded
// through on one call path but not the other fails silently in only one direction. The full
// validation depth is re-asserted here independently on the RENAME path, not assumed symmetric
// with create.

test('renaming to a blank name is refused and the category keeps its original name', function () {
    $category = app(CreateProductCategory::class)('Footwear');

    $caught = null;

    try {
        app(RenameProductCategory::class)($category, '');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('name');

    expect($category->fresh()->name)->toBe('Footwear');
});

test('renaming to a whitespace-only name is refused and the category keeps its original name', function () {
    $category = app(CreateProductCategory::class)('Footwear');

    $caught = null;

    try {
        app(RenameProductCategory::class)($category, '   ');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect($category->fresh()->name)->toBe('Footwear');
});

test('renaming to a name of exactly the maximum length (255) is accepted', function () {
    $category = app(CreateProductCategory::class)('Footwear');
    $name = str_repeat('b', 255);

    $renamed = app(RenameProductCategory::class)($category, $name);

    expect($renamed->fresh()->name)->toBe($name);
});

test('renaming to a name one character over the maximum length (256) is refused', function () {
    $category = app(CreateProductCategory::class)('Footwear');
    $name = str_repeat('b', 256);

    $caught = null;

    try {
        app(RenameProductCategory::class)($category, $name);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect($category->fresh()->name)->toBe('Footwear');
});

// R-2/D-4, rename path: mirrors CreateProductCategoryTest's identical race test, driving the
// collision through the real unique index rather than a hand-written assertion about the catch
// block -- proves RenameProductCategory's own 23000 catch independently of
// CreateProductCategory's, rather than assuming the two actions share the same behaviour.
test('a duplicate that bypasses validation via a simulated race surfaces as a ValidationException on name when renaming, not a 500', function () {
    $category = app(CreateProductCategory::class)('Footwear');
    $racedName = 'Race Condition Rename';
    $raced = false;

    DB::listen(function ($query) use (&$raced, $racedName): void {
        if ($raced || ! str_contains($query->sql, 'product_categories')) {
            return;
        }

        $raced = true;

        DB::table('product_categories')->insert([
            'id' => (string) Str::uuid7(),
            'name' => $racedName,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    $caught = null;

    try {
        app(RenameProductCategory::class)($category, $racedName);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($raced)->toBeTrue()
        ->and($caught)->toBeInstanceOf(ValidationException::class);

    expect(ProductCategory::where('name', $racedName)->count())->toBeLessThan(2);
});
