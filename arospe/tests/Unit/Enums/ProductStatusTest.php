<?php

use App\Enums\ProductStatus;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

// Story 0024, Phase 3 (TDD "red" step): App\Enums\ProductStatus does not exist yet — every test
// in this file is expected to fail (class not found) until backend-expert implements it in the
// next step of the TDD cycle. That is the correct, intended "red" outcome.
//
// `label()` resolves through the translator (`__()`), which needs the app container — bound
// per-file here rather than directory-wide, so this stays a tests/Unit/ test (no
// RefreshDatabase, no database touched) per docs/testing/backend/unit-tests.md, matching
// tests/Unit/Enums/UserStatusTest.php's existing precedent.

uses(TestCase::class);

// D-7 (confirmed Phase 0 decision — do not reopen): ProductStatus has EXACTLY two cases. This is
// the primary pin on that decision — asserted as an exact array via array_column(), never
// ->toContain(), because ->toContain() stays green the moment anyone adds a third case (e.g. a
// persisted "agotado"), which is precisely the regression this test exists to catch.
test('cases are exactly active and draft, in that order', function () {
    expect(array_column(ProductStatus::cases(), 'value'))->toBe(['active', 'draft']);
});

test('tryFrom returns null for every out-of-stock spelling', function (string $value) {
    expect(ProductStatus::tryFrom($value))->toBeNull();
})->with(['agotado', 'out_of_stock', 'sold_out', 'outofstock']);

test('from throws ValueError for an unrecognized value', function () {
    expect(fn () => ProductStatus::from('agotado'))->toThrow(ValueError::class);
});

// Phase 5 finding N-2: asserting against trans('products.statuses.active') is green even against a
// hardcoded `return 'Active';` implementation, since the default 'en' locale's own translation
// happens to be the identical literal — the assertion could not distinguish "goes through the
// translator" from "coincidentally returns the same string". Switching locale to 'es' and
// asserting the Spanish copy (lang/es/products.php: 'active' => 'Activo', 'draft' => 'Borrador')
// is what actually proves the translator is consulted, since no hardcoded English literal could
// ever produce those strings. The locale is restored afterward -- this repo's tests/Pest.php /
// TestCase.php carry no automatic per-test locale reset, so a test that changes it owns undoing
// it, or it leaks into whichever test runs next in this process.
test('label resolves through the translator rather than returning a literal', function () {
    $originalLocale = App::getLocale();

    App::setLocale('es');

    try {
        expect(ProductStatus::Active->label())->toBe('Activo')
            ->and(ProductStatus::Draft->label())->toBe('Borrador');
    } finally {
        App::setLocale($originalLocale);
    }
});
