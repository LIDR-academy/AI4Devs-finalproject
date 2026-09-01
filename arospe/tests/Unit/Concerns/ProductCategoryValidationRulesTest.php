<?php

use App\Actions\NormalizeForSearch;
use App\Concerns\ProductCategoryValidationRules;

// Story 0023, Phase 3 (TDD "red" step): App\Concerns\ProductCategoryValidationRules does not exist
// yet -- this file is expected to fail with a "trait not found" style error until backend-expert
// implements it in the next step of the TDD cycle. That failure is the correct, intended outcome.
//
// Per the story's own note under "Unit -- ProductCategoryValidationRulesTest": the exhaustive
// folding table (ß, ç, CJK, double spaces, idempotence) is NOT re-asserted here -- that is
// tests/Unit/Actions/NormalizeForSearchTest.php's job (story 0022, D-12). Duplicating it here would
// create a second specification of the fold that can drift from the first. This file only proves
// that category name validation THREADS the shared normaliser and the product category id through
// correctly -- this is the story's only genuinely unit-testable surface, since everything else
// (the actual uniqueness comparison) needs a real row in the database.
//
// An anonymous class exposes the trait's protected methods publicly, since there is no
// tests/Unit/Concerns/ precedent to mirror in this repo yet -- every other <Noun>ValidationRules
// trait is exercised only indirectly through its consuming Livewire component/action's Feature
// tests. `app(NormalizeForSearch::class)`, never `new NormalizeForSearch`, per
// docs/conventions/code-style.md's "an action must be resolved from the container, never `new`-ed"
// rule.

function productCategoryValidationRulesHarness(): object
{
    return new class
    {
        use ProductCategoryValidationRules;

        /**
         * @return array<int, mixed>
         */
        public function exposedNameRules(NormalizeForSearch $normalizeForSearch, ?string $productCategoryId = null): array
        {
            return $this->nameRules($normalizeForSearch, $productCategoryId);
        }

        /**
         * @return array<string, array<int, mixed>>
         */
        public function exposedProductCategoryRules(NormalizeForSearch $normalizeForSearch, ?string $productCategoryId = null): array
        {
            return $this->productCategoryRules($normalizeForSearch, $productCategoryId);
        }
    };
}

it('nameRules(null) returns required/string/max:255 plus exactly one uniqueness rule', function () {
    $rules = productCategoryValidationRulesHarness()->exposedNameRules(app(NormalizeForSearch::class), null);

    expect($rules)->toHaveCount(4)
        ->and($rules[0])->toBe('required')
        ->and($rules[1])->toBe('string')
        ->and($rules[2])->toBe('max:255');

    // The 4th rule is the uniqueness check -- D-4 requires it be a closure/custom rule rather than
    // a bare Rule::unique() string form, so it must never be a plain string like its siblings.
    expect($rules[3])->not->toBeString();
});

it('nameRules($id) still returns exactly 4 rules, with the ignore-branch uniqueness rule present', function () {
    $rules = productCategoryValidationRulesHarness()->exposedNameRules(app(NormalizeForSearch::class), 'a-product-category-id');

    expect($rules)->toHaveCount(4)
        ->and($rules[0])->toBe('required')
        ->and($rules[1])->toBe('string')
        ->and($rules[2])->toBe('max:255')
        ->and($rules[3])->not->toBeString();
});

// F-4 (Phase 5 code review): the two tests above both assert "4 rules, and the 4th is not a
// string" for BOTH the null-id and the id-carrying case, which cannot distinguish "the id was
// threaded through correctly" from "the id was silently dropped" -- both a correct
// uniqueNormalisedName() and a buggy one that ignores $productCategoryId entirely produce an
// identical shape by that measure. This test instead inspects the closure's own captured `use`
// variables via reflection, proving the id genuinely reaches the closure rather than merely
// proving a closure of *some* kind exists at index 3.
//
// Reflection over invoking the closure against a real ProductCategory row (the review's other
// suggested approach) is deliberately preferred here: invoking it would hit the database via
// ProductCategory::query(), and this file lives under tests/Unit/ -- which this repo's testing
// conventions (docs/testing/README.md, tests/Pest.php) keep DB-free and un-refreshed on purpose.
// The ignore-branch's actual DB behaviour (a no-op rename succeeding) is already pinned three
// separate ways at the Feature level in RenameProductCategoryTest.php:44-68 (R-1); this test's
// job is narrower -- prove the plumbing between nameRules($id) and the closure it returns.
it('nameRules($id) threads the id into the uniqueness closure\'s own captured state, distinct from nameRules(null)', function () {
    $normalizeForSearch = app(NormalizeForSearch::class);
    $harness = productCategoryValidationRulesHarness();

    $closureWithoutId = $harness->exposedNameRules($normalizeForSearch, null)[3];
    $closureWithId = $harness->exposedNameRules($normalizeForSearch, 'a-product-category-id')[3];

    expect($closureWithoutId)->toBeInstanceOf(Closure::class)
        ->and($closureWithId)->toBeInstanceOf(Closure::class);

    // ReflectionFunction::getStaticVariables() returns a closure's captured `use (...)` variables
    // keyed by name -- this reads the real, captured value the closure will act on when Laravel's
    // validator later invokes it, rather than re-deriving it from the outer method call.
    $capturedWithoutId = (new ReflectionFunction($closureWithoutId))->getStaticVariables();
    $capturedWithId = (new ReflectionFunction($closureWithId))->getStaticVariables();

    expect($capturedWithoutId)->toHaveKey('productCategoryId')
        ->and($capturedWithoutId['productCategoryId'])->toBeNull()
        ->and($capturedWithId)->toHaveKey('productCategoryId')
        ->and($capturedWithId['productCategoryId'])->toBe('a-product-category-id');
});

it('productCategoryRules() wraps nameRules() under the "name" key, for both the null and the id-carrying case', function () {
    $normalizeForSearch = app(NormalizeForSearch::class);
    $harness = productCategoryValidationRulesHarness();

    $withoutId = $harness->exposedProductCategoryRules($normalizeForSearch, null);
    $withId = $harness->exposedProductCategoryRules($normalizeForSearch, 'a-product-category-id');

    expect($withoutId)->toHaveKey('name')
        ->and($withoutId)->toHaveCount(1)
        ->and($withoutId['name'])->toHaveCount(4);

    expect($withId)->toHaveKey('name')
        ->and($withId)->toHaveCount(1)
        ->and($withId['name'])->toHaveCount(4);
});
