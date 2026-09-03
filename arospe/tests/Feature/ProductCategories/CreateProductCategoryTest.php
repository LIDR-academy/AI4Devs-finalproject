<?php

use App\Actions\ProductCategories\CreateProductCategory;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// Story 0023, Phase 3 (TDD "red" step): App\Models\ProductCategory,
// App\Actions\ProductCategories\CreateProductCategory, the product_categories migration and
// App\Concerns\ProductCategoryValidationRules do not exist yet. Every test in this file is
// expected to fail (class/table not found) until backend-expert/database-expert implement them in
// the next step of the TDD cycle -- that is the correct, intended "red" outcome.
//
// Every assertion goes through the ACTION directly (`app(CreateProductCategory::class)(...)`),
// never a Livewire component -- D-1 is explicit this story ships no screen at all, so there is
// nothing else to assert through.
//
// Story 0025: CreateProductCategory now authorizes `create` on ProductCategory::class as its own
// first statement (the corrected D-B2 shape, matching DeleteProductCategoryTest.php's identical
// fix). Every test below runs actingAs() an actor holding products.create, or the call throws
// AuthorizationException before validation ever runs.
beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->actor = User::factory()->create();
    $this->actor->givePermissionTo('products.create');
    $this->actingAs($this->actor);
});

test('creating with a valid name persists exactly one row and populates timestamps', function () {
    $category = app(CreateProductCategory::class)('Footwear');

    expect(ProductCategory::where('name', 'Footwear')->count())->toBe(1);

    $fresh = $category->fresh();

    expect($fresh->name)->toBe('Footwear')
        ->and($fresh->created_at)->not->toBeNull()
        ->and($fresh->updated_at)->not->toBeNull();
});

test('creating with a blank name throws ValidationException on name and writes no row', function () {
    $caught = null;

    try {
        app(CreateProductCategory::class)('');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('name');

    expect(ProductCategory::count())->toBe(0);
});

// R-6, the highest-value case in the story alongside R-1: Laravel's `required` treats a string of
// spaces as PRESENT, so a bare ['required', 'string', 'max:255'] rule set lets a whitespace-only
// name validate and persist. This proves the trim happens BEFORE validation, not after.
test('creating with a whitespace-only name is refused', function () {
    $caught = null;

    try {
        app(CreateProductCategory::class)('   ');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect(ProductCategory::count())->toBe(0);
});

// Without a trim, 'Footwear' and '  Footwear  ' would be two rows indistinguishable to a human that
// do not collide as duplicates -- assert the exact PERSISTED value, not merely "no error" (R-6).
test('a name with leading and trailing whitespace is stored trimmed', function () {
    $category = app(CreateProductCategory::class)('  Footwear  ');

    expect($category->fresh()->name)->toBe('Footwear');
});

// D-5 / R-4: the migration length and the validation max: must stay in lockstep at 255.
test('a name of exactly the maximum length (255) is accepted', function () {
    $name = str_repeat('a', 255);

    $category = app(CreateProductCategory::class)($name);

    expect($category->fresh()->name)->toBe($name);
});

test('a name one character over the maximum length (256) is refused', function () {
    $name = str_repeat('a', 256);

    $caught = null;

    try {
        app(CreateProductCategory::class)($name);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect(ProductCategory::count())->toBe(0);
});

test('creating a duplicate name is refused at the validation layer, never as a QueryException', function () {
    app(CreateProductCategory::class)('Footwear');

    $caught = null;

    try {
        app(CreateProductCategory::class)('Footwear');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('name');

    expect(ProductCategory::where('name', 'Footwear')->count())->toBe(1);
});

// R-2/D-4: proves the 23000 catch, driving the collision through the REAL MySQL unique index
// rather than a hand-written assertion about the catch block. A DB::listen() callback fires the
// instant the action's OWN uniqueness check issues its first query touching `product_categories`
// -- necessarily before the action's real INSERT -- and inserts the colliding row directly via the
// query builder at that exact moment, bypassing the action's PHP-level validation entirely. This
// reproduces two concurrent creates that both pass validation, which is exactly what the `23000`
// catch (not the pre-flight validation rule) exists to catch -- the same technique
// docs/security/signed-link-verification.md's "a pre-flight check is not a race guard" section
// documents for `users.pending_email`.
test('a duplicate that bypasses validation via a simulated race surfaces as a ValidationException on name, not a 500', function () {
    $name = 'Race Condition';
    $raced = false;

    DB::listen(function ($query) use (&$raced, $name): void {
        if ($raced || ! str_contains($query->sql, 'product_categories')) {
            return;
        }

        $raced = true;

        DB::table('product_categories')->insert([
            'id' => (string) Str::uuid7(),
            'name' => $name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    $caught = null;

    try {
        app(CreateProductCategory::class)($name);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($raced)->toBeTrue()
        ->and($caught)->toBeInstanceOf(ValidationException::class);

    // Whatever happened to the racer row (it may or may not survive a wrapping transaction's
    // rollback, depending on implementation), the action's own create must never have produced a
    // second row -- exactly one or zero rows named "Race Condition" may exist, never two.
    expect(ProductCategory::where('name', $name)->count())->toBeLessThan(2);
});

// R-2/D-4: the exception CLASS is the whole point of this test. MySQL's utf8mb4_unicode_ci index
// would ALSO refuse this pair, so a test only asserting "the second row was not created" would
// pass even with the app-level normalised comparison deleted entirely.
test('a case-only-different duplicate name is refused by validation, never as a QueryException', function () {
    app(CreateProductCategory::class)('Footwear');

    $caught = null;

    try {
        app(CreateProductCategory::class)('footwear');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('name');

    expect(ProductCategory::count())->toBe(1);
});

// Pins D-4's "fold at least as aggressively as utf8mb4_unicode_ci" constraint -- a normaliser
// folding case but not accents would let PHP accept this pair and hand the refusal to the index
// as a raw 23000, which this test would catch as a wrong exception class.
test('an accent-only-different duplicate name is refused by validation, never as a QueryException', function () {
    app(CreateProductCategory::class)('Nino');

    $caught = null;

    try {
        app(CreateProductCategory::class)('Niño');
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('name');

    expect(ProductCategory::count())->toBe(1);
});
