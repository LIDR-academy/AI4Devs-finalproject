<?php

use App\Actions\NormalizeForSearch;
use App\Concerns\ShippingZoneValidationRules;

// Story 0033, Phase 3 (TDD "red" step): App\Concerns\ShippingZoneValidationRules does not exist
// yet -- this file is expected to fail with a "trait not found" style error until backend-expert
// implements it in the next step of the TDD cycle. That failure is the correct, intended outcome.
//
// Per D-12/this story's own note under "Unit -- ShippingZoneValidationRulesTest": the exhaustive
// folding table (ß, ç, CJK, double spaces, idempotence) is NOT re-asserted here -- that is
// tests/Unit/Actions/NormalizeForSearchTest.php's job (story 0022, D13). This file only proves
// that shipping zone name validation THREADS the shared normaliser and the zone id through
// correctly, and that the closure genuinely uses the SAME injected normalizer instance (never a
// private/re-inlined fold) -- this is the story's only genuinely unit-testable surface, since the
// actual uniqueness comparison needs a real row in the database.
//
// Mirrors tests/Unit/Concerns/ProductCategoryValidationRulesTest.php's shape exactly, per D-6's
// "enforced exactly as 0023's D-4 enforces product category names" instruction and the Phase 2
// correction's confirmed signature: shippingZoneNameRules(NormalizeForSearch $normalizer,
// ?string $id = null).
//
// An anonymous class exposes the trait's protected method publicly, matching
// ProductCategoryValidationRulesTest's own harness shape. `app(NormalizeForSearch::class)`, never
// `new NormalizeForSearch`, per docs/conventions/code-style.md's "an action must be resolved from
// the container, never `new`-ed" rule.

function shippingZoneValidationRulesHarness(): object
{
    return new class
    {
        use ShippingZoneValidationRules;

        /**
         * @return array<int, mixed>
         */
        public function exposedShippingZoneNameRules(NormalizeForSearch $normalizer, ?string $id = null): array
        {
            return $this->shippingZoneNameRules($normalizer, $id);
        }
    };
}

it('shippingZoneNameRules(normalizer, null) returns required/string/max:150 plus exactly one uniqueness rule', function () {
    $rules = shippingZoneValidationRulesHarness()->exposedShippingZoneNameRules(app(NormalizeForSearch::class), null);

    expect($rules)->toHaveCount(4)
        ->and($rules[0])->toBe('required')
        ->and($rules[1])->toBe('string')
        ->and($rules[2])->toBe('max:150');

    // The 4th rule is the uniqueness check -- D-6 requires it be a closure/custom rule rather
    // than a bare Rule::unique() string form, so it must never be a plain string like its
    // siblings.
    expect($rules[3])->not->toBeString();
});

it('shippingZoneNameRules(normalizer, $id) still returns exactly 4 rules, with the ignore-branch uniqueness rule present', function () {
    $rules = shippingZoneValidationRulesHarness()->exposedShippingZoneNameRules(app(NormalizeForSearch::class), 'a-shipping-zone-id');

    expect($rules)->toHaveCount(4)
        ->and($rules[0])->toBe('required')
        ->and($rules[1])->toBe('string')
        ->and($rules[2])->toBe('max:150')
        ->and($rules[3])->not->toBeString();
});

// R-1-equivalent for this story (the missing ->ignore() trap): proves the id genuinely reaches
// the closure rather than merely proving a closure of SOME kind exists at index 3. Checked by
// VALUE rather than by a hardcoded captured-variable key name -- this file does not assume what
// backend-expert names the closure's own `use (...)` variable, only that the given id is
// genuinely among what it captures, and that a null id never is.
it("shippingZoneNameRules(\$id) threads the id into the uniqueness closure's own captured state, distinct from a null id", function () {
    $normalizer = app(NormalizeForSearch::class);
    $harness = shippingZoneValidationRulesHarness();

    $closureWithoutId = $harness->exposedShippingZoneNameRules($normalizer, null)[3];
    $closureWithId = $harness->exposedShippingZoneNameRules($normalizer, 'a-shipping-zone-id')[3];

    expect($closureWithoutId)->toBeInstanceOf(Closure::class)
        ->and($closureWithId)->toBeInstanceOf(Closure::class);

    $capturedWithoutId = (new ReflectionFunction($closureWithoutId))->getStaticVariables();
    $capturedWithId = (new ReflectionFunction($closureWithId))->getStaticVariables();

    expect(in_array('a-shipping-zone-id', $capturedWithId, true))->toBeTrue()
        ->and(in_array('a-shipping-zone-id', $capturedWithoutId, true))->toBeFalse();
});

// D-12: pins that the closure genuinely captures the SAME NormalizeForSearch instance passed
// in -- proving the trait routes through the shared utility rather than instantiating (or
// re-implementing) its own fold -- and, as a pure function with no database involved, that this
// exact normalizer folds D-6's own motivating example (the "península"/"PENÍNSULA"/"Peninsula"
// dataset the Gherkin Scenario Outline names) identically regardless of case, accent or
// surrounding whitespace. The exhaustive fold table (ß, ç, CJK, ...) stays
// tests/Unit/Actions/NormalizeForSearchTest.php's job -- this is only enough to prove D-6's own
// scenario would be caught, not a second specification of the fold.
it('the uniqueness closure captures the injected normalizer instance, which folds the D-6 motivating example identically', function () {
    $normalizer = app(NormalizeForSearch::class);
    $harness = shippingZoneValidationRulesHarness();

    $closure = $harness->exposedShippingZoneNameRules($normalizer, null)[3];
    $captured = (new ReflectionFunction($closure))->getStaticVariables();

    expect(in_array($normalizer, $captured, true))->toBeTrue();

    expect($normalizer('Península'))
        ->toBe($normalizer('península'))
        ->toBe($normalizer('PENÍNSULA'))
        ->toBe($normalizer('Peninsula'))
        ->toBe($normalizer('  Península  '));
});
