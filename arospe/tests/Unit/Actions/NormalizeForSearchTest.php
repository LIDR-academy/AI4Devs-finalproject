<?php

// Story 0022, Phase 3 Cycle A (TDD "red" step) -- decision D13 in
// ai-spec/tasks/in-progress/0022-searchable-multi-select-component.md is the complete spec for
// App\Actions\NormalizeForSearch, which does NOT exist yet at this point in the cycle. Every test
// below is therefore expected to fail with a "class not found" style error (red) until
// frontend-expert implements the class in the next step -- that failure is the correct, intended
// outcome of this file existing before the production code does.
//
// D13's exact pipeline, quoted verbatim from the task file:
//
//     public function __invoke(string $value): string
//     {
//         return (string) preg_replace(
//             '/\s+/u',
//             ' ',
//             Str::ascii(Str::lower(trim($value)))
//         );
//     }
//
// i.e. trim() -> Str::lower() (mb-safe, BEFORE folding) -> Str::ascii() (accent/diacritic folding,
// deliberately NOT Str::transliterate()) -> preg_replace('/\s+/u', ' ', ...) (collapse internal
// whitespace runs to one space).
//
// This is a pure `tests/Unit/` test per docs/testing/backend/unit-tests.md: no database, no
// RefreshDatabase, no app boot needed at all -- Str::lower()/Str::ascii() are static, self-contained
// string operations with no dependency on the container, the translator, or config. tests/Pest.php
// only binds `Feature` and `Browser` to Tests\TestCase; `Unit` gets the bare PHPUnit\TestCase Pest
// defaults to, which is exactly right here.
//
// Every construction below is `app(NormalizeForSearch::class)`, never `new NormalizeForSearch`
// (docs/conventions/code-style.md's "an action must be resolved from the container, never `new`-ed
// -- including in tests" rule, N2 of story 0022's code review). This still needs no framework
// bootstrap: `app()` with no bound Laravel Application falls back to
// `Illuminate\Container\Container::getInstance()`, a bare container that auto-resolves
// NormalizeForSearch by reflection alone, since its constructor takes no arguments -- verified by
// running this file in isolation, with no other test file's TestCase::createApplication() having
// run first.

use App\Actions\NormalizeForSearch;

/**
 * The exact D13 folding table, quoted verbatim from the task file's "Tests to perform" section.
 * This is the single source of truth for what "every consumer folds identically" means across
 * 0022's own shell, 0026/0027/0034's resolvers and 0032/0033's geography search -- every one of
 * them is required to route both the needle and the haystack through this one class.
 *
 * @return array<string, array{0: string, 1: string}>
 */
function normalizeForSearchFoldingTable(): array
{
    return [
        'Niño → nino' => ['Niño', 'nino'],
        'A Coruña → a coruna' => ['A Coruña', 'a coruna'],
        'Almuñécar → almunecar' => ['Almuñécar', 'almunecar'],
        'ß → ss' => ['ß', 'ss'],
        'ç → c' => ['ç', 'c'],
        'Ölüdeniz → oludeniz' => ['Ölüdeniz', 'oludeniz'],
    ];
}

it('folds the exact D13 dataset', function (string $input, string $expected) {
    expect(app(NormalizeForSearch::class)($input))->toBe($expected);
})->with(normalizeForSearchFoldingTable());

// D13's own comparison table (Str::transliterate(Str::lower(...)) vs Str::ascii(Str::lower(...)))
// names these two inputs specifically because they are the cases where the two functions diverge:
// Str::transliterate()'s default $unknown = '?' injects a literal '?' for an unmappable character
// (an emoji here) and romanizes CJK -- re-introducing UPPERCASE after the lower() step has already
// run. Str::ascii() instead silently drops what it cannot map, which is the D13-mandated behaviour.
//
// If NormalizeForSearch is ever "simplified" to call Str::transliterate() instead of Str::ascii(),
// these two assertions are the ones that catch it -- 'café☕' would come back 'cafe?' (an injected
// '?' character survives into the search term) and 'Ñ东' would come back with 'Dong' romanized in
// instead of dropped, so 'n' would fail. Do not weaken either assertion to accommodate that swap.
it('drops what it cannot map instead of injecting a literal "?" or romanizing CJK (pins Str::ascii() over Str::transliterate())', function () {
    // Str::transliterate(Str::lower('café☕')) === 'cafe?' -- Str::ascii() must never do this.
    expect(app(NormalizeForSearch::class)('café☕'))->toBe('cafe');

    // Str::transliterate(Str::lower('Ñ东')) === 'nDong ' -- CJK is romanized and re-uppercased.
    // Str::ascii() must drop it entirely instead.
    expect(app(NormalizeForSearch::class)('Ñ东'))->toBe('n');
});

it('trims leading/trailing whitespace and collapses internal whitespace runs to a single space', function () {
    expect(app(NormalizeForSearch::class)('  A   Coruña  '))->toBe('a coruna');
});

it('is idempotent: applying it twice is the same as applying it once, across the whole folding dataset', function (string $input) {
    $normalizeForSearch = app(NormalizeForSearch::class);

    $once = $normalizeForSearch($input);
    $twice = $normalizeForSearch($once);

    expect($twice)->toBe($once);
})->with(array_map(
    fn (array $case): array => [$case[0]],
    array_values(normalizeForSearchFoldingTable())
));

it('normalizes the empty string and a whitespace-only string both to an empty string', function () {
    expect(app(NormalizeForSearch::class)(''))->toBe('')
        ->and(app(NormalizeForSearch::class)('   '))->toBe('');
});

it('always outputs lowercase ASCII, as a property over the whole folding dataset', function (string $input) {
    $result = app(NormalizeForSearch::class)($input);

    // No byte >= 0x80 remains -- the output is pure ASCII, never multibyte UTF-8.
    expect(mb_check_encoding($result, 'ASCII'))->toBeTrue();

    // Ignoring the ASCII space that separates words, every remaining character is lowercase.
    $withoutSpaces = str_replace(' ', '', $result);
    expect($withoutSpaces === '' || ctype_lower($withoutSpaces))->toBeTrue();
})->with(array_map(
    fn (array $case): array => [$case[0]],
    array_values(normalizeForSearchFoldingTable())
));
