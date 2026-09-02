<?php

use App\Actions\ProductCategories\CreateProductCategory;
use App\Actions\ProductCategories\DeleteProductCategory;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0023 created this file; story 0024b (D-14) extended it with the in-use
// hard-block-with-count guard, once products.product_category_id exists. Every test below --
// the four regression cases and the new block/no-confirm-and-proceed/race cases -- now runs
// actingAs() an actor, per the story's own test-setup requirement: DeleteProductCategory does
// not itself authorize (D-B1).
//
// Corrected at Phase 5 review, finding B-2: this banner previously claimed "0025 will add a
// Gate::authorize() call above this guard without changing any of these tests" -- true only
// under the PRE-Phase-4-correction reading (gate in the calling component). Under the corrected
// D-B2 (the gate goes INSIDE DeleteProductCategory itself), every test in this file that reaches
// the guard runs through a real Gate::denies() check against an unseeded permission catalog --
// $this->actor here is a bare User::factory() with no role and no seeded permissions, so once
// the gate exists it will either throw PermissionDoesNotExist (catalog unseeded) or a genuine
// AuthorizationException, not the ValidationException these tests assert on today. 0025 MUST
// seed RolePermissionSeeder and grant products.delete to $this->actor in this file's beforeEach
// (the Super Admin test below already does the former for its own actor, deliberately inside
// its own test body rather than in beforeEach -- Phase 5 review finding N-12 -- so 0025's fix is
// one seed call moved up, not new).

beforeEach(function () {
    $this->actor = User::factory()->create();
    $this->actingAs($this->actor);
});

// =====================================================================
// Regression -- 0023's own four cases, unmodified in substance (Phase 2
// finding B-1 corrected the task file's stale "three" count).
// =====================================================================

test('deleting a category removes the row outright, not a soft delete', function () {
    $category = app(CreateProductCategory::class)('Footwear');

    $result = app(DeleteProductCategory::class)($category);

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('product_categories', ['id' => $category->id]);
});

// D-3: proves nothing lingers to hold the unique index -- exactly what a soft delete would break.
// Rule::unique() does not apply the soft-delete scope (see docs/database/schema.md#soft-deletes),
// so a trashed "Footwear" would squat its name forever if this model soft-deleted.
test('the freed name can immediately be reused by a new category', function () {
    $category = app(CreateProductCategory::class)('Footwear');

    app(DeleteProductCategory::class)($category);

    $recreated = app(CreateProductCategory::class)('Footwear');

    expect($recreated->fresh()->name)->toBe('Footwear')
        ->and(ProductCategory::where('name', 'Footwear')->count())->toBe(1);
});

// Resolving an unknown category id (the shape a future route/Livewire caller would use before
// handing a resolved model to DeleteProductCategory) fails cleanly with ModelNotFoundException,
// not a silent no-op.
test('resolving an unknown category id fails cleanly with ModelNotFoundException, not a silent no-op', function () {
    app(CreateProductCategory::class)('Footwear');

    expect(fn () => ProductCategory::findOrFail((string) Str::uuid7()))
        ->toThrow(ModelNotFoundException::class);
});

// This story has no route/HTTP layer at all, so HasUuids' route-model-binding UUID validation
// (resolveRouteBindingQuery() rejecting a non-UUID parameter with Str::isUuid() before running a
// doomed query) is never invoked here -- findOrFail() below runs a real `WHERE id = ?` query that
// simply finds no matching row for the malformed string, throwing ModelNotFoundException for that
// ordinary reason. A malformed id must still fail the identical way as an unknown-but-valid one,
// never as a different error shape a future controller/component would have to special-case.
test('resolving a malformed, non-UUID category id fails cleanly with ModelNotFoundException', function () {
    app(CreateProductCategory::class)('Footwear');

    expect(fn () => ProductCategory::findOrFail('not-a-uuid'))
        ->toThrow(ModelNotFoundException::class);
});

// =====================================================================
// The block (story 0024b, D-14)
// =====================================================================

function deleteProductCategoryFixtureWithProducts(int $n): ProductCategory
{
    $category = app(CreateProductCategory::class)('Calzado');
    Product::factory()->count($n)->create(['product_category_id' => $category->id]);

    // A decoy category with 5 products of its own -- without it,
    // Product::count() and $category->products()->count() are
    // indistinguishable, and the test cannot fail for the reason it
    // exists (Phase 2 review's own reasoning, restated in the test).
    $decoy = app(CreateProductCategory::class)('Decoy');
    Product::factory()->count(5)->create(['product_category_id' => $decoy->id]);

    return $category->fresh();
}

test('deleting a category with N products throws and the row still exists afterwards', function (int $n) {
    $category = deleteProductCategoryFixtureWithProducts($n);

    $caught = null;

    try {
        app(DeleteProductCategory::class)($category);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('productCategoryId')
        ->and($caught->errors()['productCategoryId'][0])->toContain((string) $n);
    $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
})->with([1, 2, 12]);

// Draft products count too -- the likeliest implementation bug is a stray
// ->where('status', Active), whose real-world consequence is a raw FK error instead of a
// friendly message.
test('draft products count towards the block', function () {
    $category = app(CreateProductCategory::class)('Calzado');
    Product::factory()->count(3)->draft()->create(['product_category_id' => $category->id]);

    $caught = null;

    try {
        app(DeleteProductCategory::class)($category);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors()['productCategoryId'][0])->toContain('3');
});

// Phase 5 review finding N-4: the test above alone cannot catch a stray ->where('status',
// Draft') (or any filter that happens to include Draft), because ProductFactory defaults every
// product to Draft (D-6) -- every dataset row in this file so far is all-draft. A MIXED category
// (2 active + 1 draft) is what actually proves the count is unfiltered by status in BOTH
// directions, not only the one direction the test above demonstrates.
test('a mix of active and draft products both count towards the block', function () {
    $category = app(CreateProductCategory::class)('Calzado');
    Product::factory()->count(2)->active()->create(['product_category_id' => $category->id]);
    Product::factory()->draft()->create(['product_category_id' => $category->id]);

    $caught = null;

    try {
        app(DeleteProductCategory::class)($category);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors()['productCategoryId'][0])->toContain('3');
});

// The singular/plural forms differ between N = 1 and N = 2, asserted on the rendered message in
// BOTH locales -- the es half is what catches a Spanish file that copied the English plural.
test('the singular and plural forms differ, in both locales', function () {
    $originalLocale = App::getLocale();

    try {
        $one = app(CreateProductCategory::class)('Calzado Uno');
        Product::factory()->create(['product_category_id' => $one->id]);
        $two = app(CreateProductCategory::class)('Calzado Dos');
        Product::factory()->count(2)->create(['product_category_id' => $two->id]);

        App::setLocale('en');
        $oneMessageEn = deleteProductCategoryCaptureMessage($one);
        $twoMessageEn = deleteProductCategoryCaptureMessage($two);

        expect($oneMessageEn)->toContain('1 product')->not->toContain('1 products')
            ->and($twoMessageEn)->toContain('2 products');

        App::setLocale('es');
        $oneMessageEs = deleteProductCategoryCaptureMessage($one);
        $twoMessageEs = deleteProductCategoryCaptureMessage($two);

        expect($oneMessageEs)->toContain('1 producto')->not->toContain('1 productos')
            ->and($twoMessageEs)->toContain('2 productos');
    } finally {
        App::setLocale($originalLocale);
    }
});

function deleteProductCategoryCaptureMessage(ProductCategory $category): string
{
    try {
        app(DeleteProductCategory::class)($category->fresh());
    } catch (ValidationException $e) {
        return $e->errors()['productCategoryId'][0];
    }

    throw new RuntimeException('Expected a ValidationException, none was thrown.');
}

// No confirm-and-proceed path, proven three ways -- (c) is the strongest, (a) is knowingly
// weaker and recorded as such: proving a negative capability has no purely behavioural
// formulation.
test('there is no confirm-and-proceed path: the method takes exactly one parameter', function () {
    $method = new ReflectionMethod(DeleteProductCategory::class, '__invoke');

    expect($method->getNumberOfParameters())->toBe(1)
        ->and($method->getParameters()[0]->getType()?->getName())->toBe(ProductCategory::class);
});

test('there is no confirm-and-proceed path: calling twice in succession is refused both times', function () {
    $category = deleteProductCategoryFixtureWithProducts(1);

    expect(fn () => app(DeleteProductCategory::class)($category))->toThrow(ValidationException::class);
    expect(fn () => app(DeleteProductCategory::class)($category->fresh()))->toThrow(ValidationException::class);

    $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
});

test('there is no confirm-and-proceed path: a Super Admin is refused identically to any other actor', function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $category = deleteProductCategoryFixtureWithProducts(12);

    $caught = null;

    try {
        app(DeleteProductCategory::class)($category);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors()['productCategoryId'][0])->toContain('12');
    $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
});

// Reassigning the last product frees the category for deletion (Phase 2 finding B-3 -- this
// Gherkin scenario had no mapped test). Proves the guard RELEASES, not merely blocks.
test('reassigning the last product frees the category for deletion', function () {
    $category = app(CreateProductCategory::class)('Calzado');
    $other = app(CreateProductCategory::class)('Otra');
    $product = Product::factory()->create(['product_category_id' => $category->id]);

    expect(fn () => app(DeleteProductCategory::class)($category->fresh()))
        ->toThrow(ValidationException::class);

    $product->update(['product_category_id' => $other->id]);

    $result = app(DeleteProductCategory::class)($category->fresh());

    expect($result)->toBeTrue();
    $this->assertDatabaseMissing('product_categories', ['id' => $category->id]);
});

// The race, and the FK as backstop: a ProductCategory::deleting hook assigns a product to the
// category AFTER the count and BEFORE the DELETE, so the outcome must be the same clean
// ValidationException -- never a raw QueryException, never a 500 -- and the category must
// survive. This fails if the FK is cascadeOnDelete (products silently vanish) or nullOnDelete
// (products silently orphaned).
test('a product assigned between the count and the delete is caught by the FK, not a raw error', function () {
    $category = app(CreateProductCategory::class)('Calzado');
    $racingProduct = Product::factory()->create();

    // No teardown needed for this listener (Phase 4 audit finding F-4): TestCase's own
    // tearDownTheTestEnvironment() flushes and nulls the app after every test, and
    // DatabaseServiceProvider::boot() unconditionally re-runs Model::setEventDispatcher() on
    // the next test's fresh container -- this closure is left registered on a DISCARDED
    // dispatcher and can never fire again. That is a property of this project's test
    // lifecycle, not of this test: a model-event listener registered outside it (a raw
    // withoutBootingFramework() call, or a tests/Unit placement with no RefreshDatabase) must
    // flush it explicitly, or it leaks into whichever test runs next in that same process.
    ProductCategory::deleting(function (ProductCategory $deleting) use ($category, $racingProduct) {
        if ($deleting->is($category)) {
            $racingProduct->update(['product_category_id' => $deleting->id]);
        }
    });

    $caught = null;

    try {
        app(DeleteProductCategory::class)($category);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors()['productCategoryId'][0])->toContain('1');
    $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
});

// The guard means what it says only because Product is hard-deleted -- a regression guard
// duplicated deliberately from tests/Feature/Models/ProductTest.php's identical assertion
// (R-11's sibling): if anyone adds SoftDeletes to Product later, the count silently starts
// excluding trashed products and THIS guard changes meaning with no edit to this file.
test('the guard means what it says only because Product is hard-deleted', function () {
    expect(class_uses_recursive(Product::class))
        ->not->toHaveKey(SoftDeletes::class);
});

// Phase 4 audit finding F-2's drift guard, the mechanical form of "this catch must be
// re-derived": DeleteProductCategory's catch (QueryException $e) narrows to errorInfo[1] ===
// 1451 specifically, on the argument that products.product_category_id is the ONLY foreign key
// with a RESTRICT/NO ACTION delete rule anywhere in this schema referencing product_categories
// -- so 1451 cannot mean anything else. If this test ever fails, that argument no longer holds,
// and the catch must be re-derived before whichever story added the new restricting FK ships.
//
// Corrected at Phase 5 review, finding B-3: an earlier version of this test matched ANY foreign
// key referencing product_categories, restricting or not -- which does not match what the catch
// actually needs (only a restricting FK can raise 1451) and would have made story 0070's
// cascadeOnDelete() FK (product_category_translations.product_category_id) trip this test even
// though 0070's own task file correctly declares DeleteProductCategory untouched. Joining
// REFERENTIAL_CONSTRAINTS and filtering on DELETE_RULE is what makes that declaration provably
// true rather than merely asserted, and lets 0070 land without touching this file.
test('products.product_category_id is still the only restricting foreign key referencing product_categories', function () {
    $restrictingReferences = DB::table('information_schema.KEY_COLUMN_USAGE as kcu')
        ->join('information_schema.REFERENTIAL_CONSTRAINTS as rc', function ($join) {
            $join->on('rc.CONSTRAINT_SCHEMA', '=', 'kcu.CONSTRAINT_SCHEMA')
                ->on('rc.CONSTRAINT_NAME', '=', 'kcu.CONSTRAINT_NAME');
        })
        ->where('kcu.TABLE_SCHEMA', DB::getDatabaseName())
        ->where('kcu.REFERENCED_TABLE_NAME', 'product_categories')
        ->whereIn('rc.DELETE_RULE', ['RESTRICT', 'NO ACTION'])
        ->get(['kcu.TABLE_NAME', 'kcu.COLUMN_NAME'])
        ->map(fn ($row) => "{$row->TABLE_NAME}.{$row->COLUMN_NAME}")
        ->sort()
        ->values();

    expect($restrictingReferences->all())->toBe(['products.product_category_id']);
});
