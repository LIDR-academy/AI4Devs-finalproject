<?php

use App\Enums\TaxRateResolutionTier;

// Story 0026, Phase 3 (TDD "red" step): App\Enums\TaxRateResolutionTier does not exist yet -- this
// test is expected to fail (class not found) until backend-expert implements it in the next step
// of the TDD cycle. No RefreshDatabase needed -- a pure enum, tests/Unit/ per
// docs/testing/backend/unit-tests.md.
//
// No label() method is specified for this enum (nothing renders it yet -- 0016 declined the same
// thing for SalesRegionKind until a real consumer existed), so this file carries exactly the one
// test the task file specifies.

test('cases() is exactly assigned_region and catalog_default, in that order', function () {
    // Asserted as an EXACT array, never ->toContain() -- a toContain() assertion would not go red
    // when a third tier is added without thought (e.g. a resurrected grouping tier).
    expect(array_column(TaxRateResolutionTier::cases(), 'value'))->toBe(['assigned_region', 'catalog_default']);
});
