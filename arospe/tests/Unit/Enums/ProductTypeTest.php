<?php

use App\Enums\ProductType;

// Story 0024, Phase 3 (TDD "red" step): App\Enums\ProductType does not exist yet — every test in
// this file is expected to fail (class not found) until backend-expert implements it in the next
// step of the TDD cycle.

test('cases are exactly physical and virtual, in that order', function () {
    expect(array_column(ProductType::cases(), 'value'))->toBe(['physical', 'virtual']);
});

// D-5: product type is required at every layer with NO default anywhere — a bare `default()`
// (or similarly-named) helper method on the enum itself would be exactly the kind of silent
// fallback the migration's missing DEFAULT clause and the action's own validation both exist to
// prevent. This is the enum-level half of that guarantee: "no silent fallback" means the enum
// exposes no way to produce a "default" case at all.
test('the enum exposes no default-returning helper method', function () {
    expect(method_exists(ProductType::class, 'default'))->toBeFalse();
});
