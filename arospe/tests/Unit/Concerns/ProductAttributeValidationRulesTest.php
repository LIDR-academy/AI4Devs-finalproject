<?php

use App\Concerns\ProductAttributeValidationRules;
use Illuminate\Validation\Rules\Unique;

// Story 0028, Phase 3 (TDD "red" step): App\Concerns\ProductAttributeValidationRules does not
// exist yet -- every test below is expected to fail (trait not found) until backend-expert
// implements it in the next step of the TDD cycle. That failure is the correct, intended outcome.
//
// Pure unit tests, no DB: this file lives under tests/Unit/, which tests/Pest.php does NOT bind
// RefreshDatabase to (Feature and Browser only) -- see docs/testing/README.md. Only the three
// rule-array-shape methods the task file's own D2/Files-to-create snippet gives verbatim are
// exercised here:
//
//   protected function attributeTypeNameRules(?string $typeId = null): array
//   protected function attributeValueListRules(): array
//   protected function attributeValueRules(): array
//
// Unlike App\Concerns\ProductCategoryValidationRules, none of these three methods takes a
// NormalizeForSearch collaborator -- D3's uniqueness guard for attribute type names deliberately
// relies on this project's utf8mb4_unicode_ci collation (case- AND accent-insensitive) via a bare
// Rule::unique(), not the NormalizeForSearch-based closure ProductCategoryValidationRules uses --
// so this harness needs no container-resolved dependency at all.
//
// An anonymous class exposes the trait's protected methods publicly, mirroring
// tests/Unit/Concerns/ProductCategoryValidationRulesTest.php's identical harness shape -- there is
// no second precedent to diverge from.

function productAttributeValidationRulesHarness(): object
{
    return new class
    {
        use ProductAttributeValidationRules;

        /**
         * @return array<int, mixed>
         */
        public function exposedAttributeTypeNameRules(?string $typeId = null): array
        {
            return $this->attributeTypeNameRules($typeId);
        }

        /**
         * @return array<int, mixed>
         */
        public function exposedAttributeValueListRules(): array
        {
            return $this->attributeValueListRules();
        }

        /**
         * @return array<int, mixed>
         */
        public function exposedAttributeValueRules(): array
        {
            return $this->attributeValueRules();
        }
    };
}

// =====================================================================
// attributeTypeNameRules()
// =====================================================================

test('attributeTypeNameRules(null) returns required/string/max:100 plus exactly one uniqueness rule', function () {
    $rules = productAttributeValidationRulesHarness()->exposedAttributeTypeNameRules();

    expect($rules)->toHaveCount(4)
        ->and($rules[0])->toBe('required')
        ->and($rules[1])->toBe('string')
        ->and($rules[2])->toBe('max:100');

    // max:100 matches the column width from D2 -- asserted as its own literal string rather
    // than folded into a toContain(), so a future accidental "max:255" copy-paste from
    // ProductCategoryValidationRules fails here specifically rather than only at the Feature
    // level once a 101-256 character name is actually submitted.
    //
    // The 4th rule is the uniqueness check. Unlike ProductCategoryValidationRules'
    // closure-based guard, D2's own snippet gives this as a bare Rule::unique() instance --
    // deliberately relying on this project's case-/accent-insensitive utf8mb4_unicode_ci
    // collation (D3) rather than a NormalizeForSearch-based comparison, so it must be an
    // actual Unique rule object, not a Closure and not a plain string.
    expect($rules[3])->toBeInstanceOf(Unique::class);
});

test('attributeTypeNameRules($typeId) still returns exactly 4 rules, with the ignore-branch uniqueness rule present', function () {
    $rules = productAttributeValidationRulesHarness()->exposedAttributeTypeNameRules('a-type-id');

    expect($rules)->toHaveCount(4)
        ->and($rules[0])->toBe('required')
        ->and($rules[1])->toBe('string')
        ->and($rules[2])->toBe('max:100')
        ->and($rules[3])->toBeInstanceOf(Unique::class);
});

// Distinguishes "the id was threaded through to ->ignore()" from "the id was silently dropped" --
// both a correct and a buggy attributeTypeNameRules() produce an identical rule-array SHAPE by the
// two tests above alone. Unique::__toString() renders the ignored id into the compiled rule
// string (e.g. "unique:product_attribute_types,name,a-type-id"), which is the cheapest way to
// observe the rule's own internal state without touching the database -- this file stays DB-free.
test('attributeTypeNameRules($typeId) genuinely ignores that id, distinct from the null case', function () {
    $ruleWithoutId = (string) productAttributeValidationRulesHarness()->exposedAttributeTypeNameRules()[3];
    $ruleWithId = (string) productAttributeValidationRulesHarness()->exposedAttributeTypeNameRules('a-type-id')[3];

    expect($ruleWithId)->toContain('a-type-id')
        ->and($ruleWithoutId)->not->toContain('a-type-id');
});

// =====================================================================
// attributeValueListRules()
// =====================================================================

// Q2a (Phase 2 resolution, adopted): a type with zero values is legal and inert, matching story
// 0010's "a role with zero permissions is a legal, inert state" precedent -- so this rule array
// must NOT carry `min:1`. This is the one behavioural fact the "two unit tests" instruction alone
// would leave unpinned at the unit level, and it is cheap to pin here before any Feature-level
// zero-value creation test can even run.
test('attributeValueListRules() returns required/array/max:100 and deliberately carries no min:1 (Q2a)', function () {
    $rules = productAttributeValidationRulesHarness()->exposedAttributeValueListRules();

    expect($rules)->toBe(['required', 'array', 'max:100']);
});

// =====================================================================
// attributeValueRules()
// =====================================================================

test('attributeValueRules() returns required/string/max:100/distinct:ignore_case', function () {
    $rules = productAttributeValidationRulesHarness()->exposedAttributeValueRules();

    expect($rules)->toBe(['required', 'string', 'max:100', 'distinct:ignore_case']);
});

// D4 step 2 / R-2 (task file): a per-row scoped Rule::unique()->where(...)->ignore($valueId) was
// considered and rejected, because $valueId is client-writable and would hand ->ignore() a forged
// value -- so attributeValueRules() must never carry a Rule::unique instance at all. This is the
// one thing a naive "just add a uniqueness rule here too" edit would introduce silently, and this
// file is the only place that would catch it, since a Feature test only observes the OUTCOME of
// validation, never which rule object produced it.
test('attributeValueRules() carries no Rule::unique instance -- per-type uniqueness is enforced by distinct:ignore_case plus the DB backstop, never a scoped Rule::unique', function () {
    $rules = productAttributeValidationRulesHarness()->exposedAttributeValueRules();

    foreach ($rules as $rule) {
        expect($rule)->not->toBeInstanceOf(Unique::class);
    }
});
