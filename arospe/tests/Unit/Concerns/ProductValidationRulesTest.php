<?php

use App\Concerns\ProductCategoryValidationRules;
use App\Concerns\ProductValidationRules;
use App\Concerns\ProfileValidationRules;
use Illuminate\Validation\Rules\Unique;

// Story 0024, Phase 3 (TDD "red" step): App\Concerns\ProductValidationRules does not exist yet —
// every test in this file is expected to fail (trait not found) until backend-expert implements
// it in the next step of the TDD cycle.
//
// These assert RULE COMPOSITION, one step removed from behaviour (per the task file's own note
// under this section) — they exist to catch the asymmetry class of bug only; every rule's actual
// effect is re-asserted through the Feature-level action tests under tests/Feature/Products/.
//
// D-13's naming decision: every method here is entity-prefixed (productNameRules(),
// productSkuRules(), ...), uniformly rather than selectively, specifically because
// App\Concerns\ProductCategoryValidationRules::nameRules() and
// App\Concerns\ProfileValidationRules::nameRules() already both exist, and
// App\Concerns\SalesRegionValidationRules::descriptionRules() already claims
// descriptionRules() — two traits composed onto one class declaring the same method is a PHP
// fatal error, and the obvious future consumer (0027's editor, with a create-a-category-on-the-
// fly control) composes exactly ProductValidationRules with ProductCategoryValidationRules.
//
// An anonymous class exposes the trait's protected methods publicly, matching
// tests/Unit/Concerns/ProductCategoryValidationRulesTest.php's own precedent (the first and only
// tests/Unit/Concerns/ file before this one).
//
// D-13's rules table itself lists `status` as `['required', Rule::enum(ProductStatus::class)]`,
// which directly contradicts this section's own checklist item below ("does NOT mark status
// required — it has a default") and D-6's whole point (omitting status must default to Draft,
// per the Gherkin scenario "A product is saved as a draft when no status is given"). This test
// follows the checklist/D-6 as the more specific and more recently corrected source, and the
// contradiction is flagged in the dispatching report rather than silently resolved one way.
//
// The collision guard below composes ONLY ProductValidationRules + ProductCategoryValidationRules
// — the real future consumer shape (0027's editor, per the naming decision above) — not
// ProfileValidationRules as well. backend-expert's Phase 3 implementation confirmed
// App\Concerns\ProductCategoryValidationRules::nameRules() and
// App\Concerns\ProfileValidationRules::nameRules() already collide with EACH OTHER, independent
// of anything this story adds (a pre-existing collision between two traits from stories 0023 and
// the original profile-settings screen) — removing ProductValidationRules from that pair
// reproduces the identical fatal, and none of ProductValidationRules' 11 methods share a name
// with anything in either trait. Composing all three here would therefore fatal for a reason this
// story's own naming decision has nothing to do with, which is exactly the kind of test failure
// that discredits the guard rather than proving it.

function productValidationRulesHarness(): object
{
    return new class
    {
        use ProductValidationRules;

        /**
         * @return array<string, array<int, mixed>>
         */
        public function exposedProductRules(?string $productId = null): array
        {
            return $this->productRules($productId);
        }

        /**
         * @return array<int, mixed>
         */
        public function exposedProductSkuRules(?string $productId = null): array
        {
            return $this->productSkuRules($productId);
        }

        /**
         * @return array<int, mixed>
         */
        public function exposedProductPriceRules(): array
        {
            return $this->productPriceRules();
        }

        /**
         * @return array<int, mixed>
         */
        public function exposedProductStockRules(): array
        {
            return $this->productStockRules();
        }
    };
}

/**
 * @param  array<int, mixed>  $rules
 */
function findUniqueRuleAmong(array $rules): Unique
{
    foreach ($rules as $rule) {
        if ($rule instanceof Unique) {
            return $rule;
        }
    }

    throw new RuntimeException('No Illuminate\Validation\Rules\Unique instance found in the given rule set.');
}

test('productRules(null) marks name, sku, product_category_id, type, price and stock as required, and does not mark status required', function () {
    $rules = productValidationRulesHarness()->exposedProductRules(null);

    foreach (['name', 'sku', 'product_category_id', 'type', 'price', 'stock'] as $field) {
        expect($rules)->toHaveKey($field)
            ->and($rules[$field])->toContain('required');
    }

    expect($rules)->toHaveKey('status')
        ->and($rules['status'])->not->toContain('required');
});

// R-7 (0023's pattern, applied to Products): a nullable-id rule helper whose $id is threaded
// through on one call path but not the other fails silently in only one direction. Verified via
// the SKU uniqueness rule's own captured `ignore` state — the only field carrying a Rule::unique()
// — rather than a shape-only assertion, so a buggy implementation that silently drops
// $productId cannot pass by accident.
test('productRules($id) threads $id into the SKU uniqueness rule\'s ignore branch, and productRules(null) does not', function () {
    $withoutId = findUniqueRuleAmong(productValidationRulesHarness()->exposedProductRules(null)['sku']);
    $withId = findUniqueRuleAmong(productValidationRulesHarness()->exposedProductRules('a-product-id')['sku']);

    expect((string) $withoutId)->toContain('NULL')
        ->and((string) $withoutId)->not->toContain('a-product-id')
        ->and((string) $withId)->toContain('a-product-id')
        ->and((string) $withId)->not->toBe((string) $withoutId);
});

test('productSkuRules($id) threads $id into the ignore branch directly, and productSkuRules(null) does not', function () {
    $withoutId = findUniqueRuleAmong(productValidationRulesHarness()->exposedProductSkuRules(null));
    $withId = findUniqueRuleAmong(productValidationRulesHarness()->exposedProductSkuRules('a-product-id'));

    expect((string) $withoutId)->toContain('NULL')
        ->and((string) $withId)->toContain('a-product-id');
});

test('price rules carry the 2-decimal scale rule and a floor of zero', function () {
    $rules = productValidationRulesHarness()->exposedProductPriceRules();

    expect($rules)->toContain('decimal:0,2')
        ->and($rules)->toContain('min:0');
});

test('stock rules carry the integer type and a floor of zero', function () {
    $rules = productValidationRulesHarness()->exposedProductStockRules();

    expect($rules)->toContain('integer')
        ->and($rules)->toContain('min:0');
});

// The collision guard is a real test, not a comment: this is what pins the entity-prefix
// decision — without it, the prefixes read as a style choice and the next author "tidies" one
// away. PHP raises a fatal error when two composed traits declare the same method name; if this
// test cannot even be collected/run because of such a fatal, that IS the failure this test exists
// to surface (the same shape as tests/Unit/ArchitectureTest.php's disjunctive-arch-rule lesson:
// prove the guard can actually fail before trusting it).
//
// Composes ONLY the real future consumer shape (0027's editor, per the naming decision in this
// file's own banner) — ProductValidationRules + ProductCategoryValidationRules — and deliberately
// NOT ProfileValidationRules, which collides with ProductCategoryValidationRules on its own
// (a pre-existing collision between two traits from earlier stories, unrelated to this one) and
// would fatal this test for a reason ProductValidationRules has nothing to do with.
test('ProductValidationRules composes with ProductCategoryValidationRules with no method collision', function () {
    $harness = new class
    {
        use ProductCategoryValidationRules, ProductValidationRules;
    };

    expect($harness)->toBeObject();
});

// Phase 5 finding N-3: the test above pins the pair this story's real future consumer (0027)
// actually composes, but D-13's own naming note names a SECOND collision risk that pair does not
// exercise: App\Concerns\ProfileValidationRules::nameRules() also exists, and would collide with
// an unprefixed productNameRules() had this trait not entity-prefixed every method. This test
// pins that pair independently — ProductValidationRules is entirely prefixed
// (productNameRules(), productSkuRules(), ...), so it shares no method name with
// ProfileValidationRules's nameRules()/emailRules()/profileRules() and the two compose cleanly.
// (ProfileValidationRules is deliberately absent from the test above, and stays absent there,
// because it collides with ProductCategoryValidationRules on its own -- a separate, pre-existing
// fact this test does not re-litigate.)
test('ProductValidationRules composes with ProfileValidationRules with no method collision', function () {
    $harness = new class
    {
        use ProductValidationRules, ProfileValidationRules;
    };

    expect($harness)->toBeObject();
});
