<?php

use App\Actions\Products\DeriveVariantSku;

// Story 0029, Phase 3 (TDD "red" step): App\Actions\Products\DeriveVariantSku does not exist yet.
// D-4.1/D-4.4's formula, exercised here as a pure function with no DB — the ordering rule itself
// (D-4.2, "product_attribute_types.position, then id") is a Feature-test concern
// (tests/Feature/Products/ProductVariantSkuDerivationTest.php), since it depends on real rows this
// file has no database access to create.

// The PO's own worked examples, asserted as LITERAL strings, never toContain — this is the
// acceptance criterion in executable form.
test('the four worked examples derive exactly', function (string $productSku, array $orderedValues, string $expected) {
    expect(app(DeriveVariantSku::class)($productSku, $orderedValues))->toBe($expected);
})->with([
    '0001 + Talla M' => ['0001', ['M'], '0001-M'],
    '0001 + Talla S' => ['0001', ['S'], '0001-S'],
    '0002 + Color azul marino' => ['0002', ['azul marino'], '0002-azul-marino'],
    '0002 + Color azul marino + Talla L' => ['0002', ['azul marino', 'L'], '0002-azul-marino-L'],
]);

// FP14: a casing assertion on a value that is already all one case proves nothing about case
// preservation, because Str::upper() would also return '0001-M'. Both a value that stays
// lowercase and one that stays uppercase are required in the same file.
test('casing is preserved verbatim, for both a lowercase and an uppercase segment', function () {
    expect(app(DeriveVariantSku::class)('0001', ['L']))->toBe('0001-L')
        ->and(app(DeriveVariantSku::class)('0002', ['azul marino']))->toBe('0002-azul-marino');
});

// The exact OPPOSITE of HashVariantCombinationTest's order-independence assertion — written next
// to a comment saying so, because side by side the two look like a contradiction. D-4.2 note 3: a
// combination's HASH is a set key and must ignore submission order; its derived SKU is an ORDERED
// RENDERING meant to be read, and must not.
test('the derivation is order-sensitive, the opposite of the combination hash', function () {
    expect(app(DeriveVariantSku::class)('0002', ['Color', 'Talla']))
        ->not->toBe(app(DeriveVariantSku::class)('0002', ['Talla', 'Color']));
});

test('segment() edge cases', function (string $input, string $expected) {
    expect(app(DeriveVariantSku::class)->segment($input))->toBe($expected);
})->with([
    'a whitespace run collapses to one hyphen, never a double' => ['azul  marino', 'azul-marino'],
    'leading and trailing whitespace is trimmed' => ['  L  ', 'L'],
    'an accented letter transliterates to ASCII' => ['Marrón', 'Marron'],
    'a character outside the safe set is stripped' => ['A★B', 'AB'],
    'a value that reduces entirely to the empty string is surfaced as such' => ['★★★', ''],
]);

test('the derivation is pure and stable across calls, the property that makes it safe to store', function () {
    $result = app(DeriveVariantSku::class)('0002', ['azul marino', 'L']);

    expect(app(DeriveVariantSku::class)('0002', ['azul marino', 'L']))->toBe($result);
});
