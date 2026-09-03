<?php

use App\Actions\Products\SyncProductSalesRegions;
use App\Concerns\ProductValidationRules;
use App\Models\Product;
use App\Models\SalesRegion;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// Story 0026, Phase 3 (TDD "red" step). None of App\Actions\Products\SyncProductSalesRegions,
// Product::salesRegions(), SalesRegion::scopeActive()/scopeAssignable() or
// App\Concerns\ProductValidationRules::salesRegionIdsRules()/salesRegionIdRules() exist yet, so
// every test below (with one documented exception, at the bottom of the file) is expected to fail
// red -- "class/method not found" style -- until backend-expert implements them next.
//
// Every test arranges with SalesRegionFactory/ProductFactory directly -- never SalesRegionSeeder
// (249 rows per beforeEach is the exact anti-pattern 0016 forbids). SalesRegionFactory::isDefault()
// is deliberately NOT the base state, so a default row must be created explicitly wherever a test
// needs one; base sales_regions() from the factory are already active + childless + no rate, i.e.
// exactly D3's "assignable" shape unless a state overrides it.

// =====================================================================
// Validation harness -- exposes App\Concerns\ProductValidationRules'
// protected salesRegionIdsRules()/salesRegionIdRules() so a Feature test can
// drive the REAL Validator the same way 0027's save path will, per the
// task file's own "Applied as" example:
//
//   [
//       'salesRegionIds'   => $this->salesRegionIdsRules(),
//       'salesRegionIds.*' => $this->salesRegionIdRules($preserved),
//   ]
//
// Matches tests/Unit/Concerns/ProductValidationRulesTest.php's own
// anonymous-class-exposes-protected-methods precedent.
// =====================================================================

function salesRegionValidationHarness(): object
{
    return new class
    {
        use ProductValidationRules;

        /** @return array<int, mixed> */
        public function exposedSalesRegionIdsRules(): array
        {
            return $this->salesRegionIdsRules();
        }

        /**
         * @param  array<int, string>  $preservedSalesRegionIds
         * @return array<int, mixed>
         */
        public function exposedSalesRegionIdRules(array $preservedSalesRegionIds = []): array
        {
            return $this->salesRegionIdRules($preservedSalesRegionIds);
        }
    };
}

/**
 * Runs the real Validator against a submitted `salesRegionIds` array, exactly as 0027's save path
 * will. Throws Illuminate\Validation\ValidationException on failure; returns void on success.
 *
 * @param  array<int, mixed>  $submittedIds
 * @param  array<int, string>  $preservedSalesRegionIds
 */
function validateSalesRegionIds(array $submittedIds, array $preservedSalesRegionIds = []): void
{
    $harness = salesRegionValidationHarness();

    validator(
        ['salesRegionIds' => $submittedIds],
        [
            'salesRegionIds' => $harness->exposedSalesRegionIdsRules(),
            'salesRegionIds.*' => $harness->exposedSalesRegionIdRules($preservedSalesRegionIds),
        ],
    )->validate();
}

/**
 * @return array<int, string>
 */
function pivotRegionIdsFor(Product $product): array
{
    return DB::table('product_sales_region')
        ->where('product_id', $product->id)
        ->pluck('sales_region_id')
        ->sort()
        ->values()
        ->all();
}

/**
 * @param  array<int, string>  $ids
 * @return array<int, string>
 */
function sortedIds(array $ids): array
{
    sort($ids);

    return $ids;
}

// =====================================================================
// SyncProductSalesRegions -- assignment behaviour
// =====================================================================

test('assigning a product to Peninsula, Canarias and Francia associates it with exactly those three entries', function () {
    $product = Product::factory()->create();
    $spain = SalesRegion::factory()->create();
    $peninsula = SalesRegion::factory()->fiscalTerritoryOf($spain)->create();
    $canarias = SalesRegion::factory()->fiscalTerritoryOf($spain)->create();
    $francia = SalesRegion::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$peninsula->id, $canarias->id, $francia->id]);

    expect(pivotRegionIdsFor($product))->toBe(sortedIds([$peninsula->id, $canarias->id, $francia->id]));
});

// The single place sync() and attach() diverge completely -- an attach()-based bug does not
// throw, it silently accumulates regions forever, so this must be asserted as an EXACT set.
test('reassigning a product narrows its regions -- {A,B,C} to {B,D} yields exactly {B,D}', function () {
    $product = Product::factory()->create();
    [$a, $b, $c, $d] = SalesRegion::factory()->count(4)->create();

    app(SyncProductSalesRegions::class)($product, [$a->id, $b->id, $c->id]);
    app(SyncProductSalesRegions::class)($product, [$b->id, $d->id]);

    expect(pivotRegionIdsFor($product))->toBe(sortedIds([$b->id, $d->id]));
});

test('reassigning a product to a superset -- {A} to {A,B,C} -- yields exactly {A,B,C}', function () {
    $product = Product::factory()->create();
    [$a, $b, $c] = SalesRegion::factory()->count(3)->create();

    app(SyncProductSalesRegions::class)($product, [$a->id]);
    app(SyncProductSalesRegions::class)($product, [$a->id, $b->id, $c->id]);

    expect(pivotRegionIdsFor($product))->toBe(sortedIds([$a->id, $b->id, $c->id]));
});

test('syncing an empty set on an assigned product leaves zero pivot rows and does not throw', function () {
    $product = Product::factory()->create();
    [$a, $b] = SalesRegion::factory()->count(2)->create();

    app(SyncProductSalesRegions::class)($product, [$a->id, $b->id]);

    expect(fn () => app(SyncProductSalesRegions::class)($product, []))->not->toThrow(Throwable::class);
    expect(pivotRegionIdsFor($product))->toBe([]);
});

test('submitting the same region id twice yields one pivot row', function () {
    $product = Product::factory()->create();
    $region = SalesRegion::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$region->id, $region->id]);

    expect(DB::table('product_sales_region')->where('product_id', $product->id)->count())->toBe(1);
});

test('the same region assigned to two products -- clearing the first leaves the second intact', function () {
    $region = SalesRegion::factory()->create();
    $productA = Product::factory()->create();
    $productB = Product::factory()->create();

    app(SyncProductSalesRegions::class)($productA, [$region->id]);
    app(SyncProductSalesRegions::class)($productB, [$region->id]);

    app(SyncProductSalesRegions::class)($productA, []);

    expect(pivotRegionIdsFor($productA))->toBe([])
        ->and(pivotRegionIdsFor($productB))->toBe([$region->id]);
});

test('deleting a product removes its pivot rows and the sales region survives', function () {
    $region = SalesRegion::factory()->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$region->id]);

    $product->delete();

    expect(DB::table('product_sales_region')->where('product_id', $product->id)->exists())->toBeFalse()
        ->and(SalesRegion::query()->find($region->id))->not->toBeNull();
});

// =====================================================================
// Validation -- D3 (assignable), D11 (whole-set rejection), D12 (preserved exemption)
// =====================================================================

test('a well-formed but nonexistent region id fails validation, writes no row, and leaves existing assignments unchanged', function () {
    $product = Product::factory()->create();
    $existing = SalesRegion::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$existing->id]);

    $nonexistentId = (string) Str::uuid();

    $caught = null;

    try {
        validateSalesRegionIds([$existing->id, $nonexistentId]);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect(pivotRegionIdsFor($product))->toBe([$existing->id]);
});

// D11: a set that is valid except for one stale id is rejected ENTIRELY -- the pivot must still
// hold exactly {A}, asserted as an exact set, because the regression this pins writes {A, B} and
// looks like a success. A toContain('A') assertion would pass against that bug.
test('a set valid except for one stale id is rejected entirely, and the pivot still holds exactly the prior assignment', function () {
    $product = Product::factory()->create();
    $a = SalesRegion::factory()->create();
    $b = SalesRegion::factory()->create();
    $deletedRegionId = (string) Str::uuid();

    app(SyncProductSalesRegions::class)($product, [$a->id]);

    $caught = null;

    try {
        validateSalesRegionIds([$a->id, $b->id, $deletedRegionId], preservedSalesRegionIds: [$a->id]);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect(pivotRegionIdsFor($product))->toBe([$a->id]);
});

test('the refusal for a stale id names the offending element in the salesRegionIds error bag', function () {
    $stale = (string) Str::uuid();

    $caught = null;

    try {
        validateSalesRegionIds([$stale]);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);

    $errorKeys = array_keys($caught->errors());
    $matchingKeys = array_filter($errorKeys, fn (string $key): bool => str_starts_with($key, 'salesRegionIds.'));

    expect($matchingKeys)->not->toBe([]);
});

test('a malformed submitted id fails validation, never a QueryException, never a 500', function (mixed $malformedId) {
    $caught = null;

    try {
        validateSalesRegionIds([$malformedId]);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
})->with([
    'not a uuid' => ['not-a-uuid'],
    'empty string' => [''],
    'integer' => [1],
    'null' => [null],
]);

test('an inactive region id is refused by validation', function () {
    $inactive = SalesRegion::factory()->inactive()->create();

    expect(fn () => validateSalesRegionIds([$inactive->id]))->toThrow(ValidationException::class);
});

// D3: paired with a positive control in the SAME test, so a refuse-everything rule cannot pass
// the negative half trivially.
test('a region with children (a heading like Espana) is refused, while a childless active country is accepted', function () {
    $spain = SalesRegion::factory()->create();
    SalesRegion::factory()->fiscalTerritoryOf($spain)->create();
    $childlessCountry = SalesRegion::factory()->create();

    expect(fn () => validateSalesRegionIds([$spain->id]))->toThrow(ValidationException::class);
    expect(fn () => validateSalesRegionIds([$childlessCountry->id]))->not->toThrow(ValidationException::class);
});

// =====================================================================
// D6/D7/D12 -- deactivation preserves the assignment, and preserves saveability
// =====================================================================

test('deactivating an assigned region does not detach it', function () {
    $product = Product::factory()->create();
    $region = SalesRegion::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$region->id]);

    $region->is_active = false;
    $region->save();

    expect(pivotRegionIdsFor($product))->toBe([$region->id])
        ->and($product->fresh()->salesRegions->pluck('id')->all())->toBe([$region->id]);
});

// D12: this is the test that goes red against the unconditional is_active rule this story
// shipped before D12, where an UNRELATED field change made the whole product unsaveable.
test('a product carrying a since-deactivated assigned region still validates and saves', function () {
    $product = Product::factory()->create();
    $region = SalesRegion::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$region->id]);

    $region->is_active = false;
    $region->save();

    $preserved = $product->fresh()->salesRegions->pluck('id')->all();

    expect(fn () => validateSalesRegionIds([$region->id], preservedSalesRegionIds: $preserved))
        ->not->toThrow(ValidationException::class);
    expect(pivotRegionIdsFor($product))->toBe([$region->id]);
});

// D12: newly adding a currently-inactive region is still refused, even beside a preserved one.
// Paired with the test above in the same file so neither can pass against a rule that has simply
// stopped checking is_active at all.
test('newly adding an inactive region is still refused, even beside a preserved active-then-deactivated one', function () {
    $product = Product::factory()->create();
    $preservedRegion = SalesRegion::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$preservedRegion->id]);

    $preservedRegion->is_active = false;
    $preservedRegion->save();

    $neverAssignedInactive = SalesRegion::factory()->inactive()->create();

    $preserved = $product->fresh()->salesRegions->pluck('id')->all();

    $caught = null;

    try {
        validateSalesRegionIds([$preservedRegion->id, $neverAssignedInactive->id], preservedSalesRegionIds: $preserved);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect(pivotRegionIdsFor($product))->toBe([$preservedRegion->id]);
});

// D12: the identical pairing for a child-bearing entry (0016 D3 anticipates a country acquiring
// fiscal sub-territories after products are already assigned to it).
test('a product may keep an assignment to an entry that has since acquired children', function () {
    $product = Product::factory()->create();
    $region = SalesRegion::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$region->id]);

    // The region acquires a child AFTER the assignment -- it now "has children" per D3's rule.
    SalesRegion::factory()->fiscalTerritoryOf($region)->create();

    $preserved = $product->fresh()->salesRegions->pluck('id')->all();

    expect(fn () => validateSalesRegionIds([$region->id], preservedSalesRegionIds: $preserved))
        ->not->toThrow(ValidationException::class);
});

test('newly adding a child-bearing entry is still refused, even beside a preserved one', function () {
    $product = Product::factory()->create();
    $preservedRegion = SalesRegion::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$preservedRegion->id]);
    SalesRegion::factory()->fiscalTerritoryOf($preservedRegion)->create();

    $neverAssignedParent = SalesRegion::factory()->create();
    SalesRegion::factory()->fiscalTerritoryOf($neverAssignedParent)->create();

    $preserved = $product->fresh()->salesRegions->pluck('id')->all();

    $caught = null;

    try {
        validateSalesRegionIds([$preservedRegion->id, $neverAssignedParent->id], preservedSalesRegionIds: $preserved);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
    expect(pivotRegionIdsFor($product))->toBe([$preservedRegion->id]);
});

// D12 security: the preserved set must be SERVER-derived. A test that hands the id under test
// straight into $preserved proves nothing -- the arrangement here goes through
// Product::salesRegions, never a hand-built array literal containing the tested id.
test('the preserved set is server-derived from Product::salesRegions, not from an arbitrary caller-supplied array', function () {
    $product = Product::factory()->create();
    $assigned = SalesRegion::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$assigned->id]);

    $neverAssignedInactive = SalesRegion::factory()->inactive()->create();

    // Read straight off the persisted relation -- this is the "server-derived" property under test.
    $preserved = $product->fresh()->salesRegions->pluck('id')->all();

    expect($preserved)->toBe([$assigned->id]);

    $caught = null;

    try {
        validateSalesRegionIds([$assigned->id, $neverAssignedInactive->id], preservedSalesRegionIds: $preserved);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class);
});

// =====================================================================
// The FKs really constrain -- an argued exception to what-not-to-test.md's "database guarantees"
// rule, identical in kind to 0024's category/media FK tests.
// =====================================================================

test('a raw insert with a nonexistent sales_region_id raises a QueryException 23000', function () {
    $product = Product::factory()->create();

    $caught = null;

    try {
        DB::table('product_sales_region')->insert([
            'product_id' => $product->id,
            'sales_region_id' => (string) Str::uuid(),
        ]);
    } catch (QueryException $e) {
        $caught = $e;
    }

    // Asserting the SQLSTATE (23000, integrity constraint violation) rather than a bare
    // QueryException instance -- a bare instance check passes today for the WRONG reason (the
    // product_sales_region table itself does not exist yet, "42S02"), which would be a false-red
    // signal indistinguishable from the real FK violation this test exists to pin.
    expect($caught)->toBeInstanceOf(QueryException::class)
        ->and($caught->getCode())->toBe('23000');
});

// The ONLY executable proof of restrictOnDelete() anywhere in the codebase, since no application
// path deletes a region.
test('deleting an assigned sales region raises a QueryException 23000 and the region survives', function () {
    $region = SalesRegion::factory()->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$region->id]);

    $caught = null;

    try {
        DB::table('sales_regions')->where('id', $region->id)->delete();
    } catch (QueryException $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(QueryException::class)
        ->and($caught->getCode())->toBe('23000')
        ->and(SalesRegion::query()->find($region->id))->not->toBeNull();
});

// =====================================================================
// D8 -- SyncProductSalesRegions is unreachable from anywhere but its intended callers.
//
// NOTE, per the task file's own text: "Today, before 0027 exists, the assertion is simply that
// nothing under app/ calls it at all." Because this test greps for the literal string
// "SyncProductSalesRegions" rather than exercising the class, it needs no class to exist to run --
// exactly the documented exception tests/Feature/Products/ProductAuthorizationTest.php already
// carries for the identical SyncProductGallery reachability test ("this test does not depend on
// SyncProductGallery existing yet... it is honestly a structural constraint expressed as a test
// rather than something that fails red today"). This is the ONE test in this file that is expected
// to PASS today rather than fail red -- every other test above fails with a class/method-not-found
// error until the production code exists.
// =====================================================================

function fileReferencesSyncProductSalesRegionsOutsideComments(string $path): bool
{
    $contents = file_get_contents($path);

    if ($contents === false) {
        return false;
    }

    if (! str_contains($contents, 'SyncProductSalesRegions')) {
        return false;
    }

    foreach (token_get_all($contents) as $token) {
        if (is_array($token) && in_array($token[0], [T_COMMENT, T_DOC_COMMENT], true)) {
            continue;
        }

        $text = is_array($token) ? $token[1] : $token;

        if (str_contains($text, 'SyncProductSalesRegions')) {
            return true;
        }
    }

    return false;
}

test('SyncProductSalesRegions is unreachable from anywhere under app/, database/ or routes/ but its own file', function () {
    $allowedFiles = array_filter([
        realpath(app_path('Actions/Products/SyncProductSalesRegions.php')),
    ]);

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

            if (fileReferencesSyncProductSalesRegionsOutsideComments($path)) {
                $offenders[] = $path;
            }
        }
    }

    expect($offenders)->toBe([]);
});
