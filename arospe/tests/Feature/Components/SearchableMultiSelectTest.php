<?php

// Story 0022 (searchable, server-side-filtered multi-select component), Phase 3 Cycle B (TDD "red"
// step). Component-level tests for App\Livewire\Components\SearchableMultiSelect, which does NOT
// exist yet at this point in the cycle -- neither does App\Livewire\Components\
// MultiSelectOptionsResolver (the D1 interface) nor App\Exceptions\UnresolvedSelectionException
// (D12). EVERY test in this file is expected to fail red right now, almost all of them on a
// class/interface-not-found style error the moment Livewire::test(SearchableMultiSelect::class,
// ...) tries to resolve the class -- that is the correct, intended outcome of this file existing
// before the production code does (mirrors Cycle A's already-green
// tests/Unit/Actions/NormalizeForSearchTest.php and this project's own precedent in
// tests/Feature/Components/WysiwygEditorTest.php).
//
// Everything about a real DOM round trip (real typing driving wire:model.live.debounce, a real
// click narrowing the visible result list, a real hover revealing a disabled option's tooltip)
// belongs to tests/Browser/Components/SearchableMultiSelectTest.php instead -- Livewire::test()
// never reaches a JS evaluator or a real debounce timer, so none of that is provable here. This
// file proves server wiring cheaply: mount(), the public surface in D5, the D9/D11 fetch-and-
// exclude arithmetic, D12's reject-never-drop mechanism, D13's normalization pass-through, and
// D14's additive prop -- all through Livewire::test() and the component's own PHP state.
//
// D3's option shape throughout: array{id: string, label: string, group: string|null, disabled: bool}.
//
// ASSUMED data-test HOOKS this file's rendering-level assertions rely on, none of which the task
// file names explicitly -- frontend-expert's implementation is expected to render exactly these
// (see the mirrored assumptions in tests/Browser/Components/SearchableMultiSelectTest.php); if a
// different name is chosen in Phase 3, both files' hooks must be updated together:
//   - data-test="searchable-multi-select-truncated"     the "narrow your search" notice (D9)
//   - data-test="searchable-multi-select-group-heading" a rendered group heading (D3/D10)
//   - data-test="searchable-multi-select-chip-area"      the chip container (D14)

use App\Actions\NormalizeForSearch;
use App\Exceptions\UnresolvedSelectionException;
use App\Livewire\Components\SearchableMultiSelect;
use Illuminate\Validation\ValidationException;
use Livewire\Features\SupportLockedProperties\CannotUpdateLockedPropertyException;
use Livewire\Livewire;
use Tests\Support\Livewire\ArrayMultiSelectOptionsResolver;

/**
 * Binds a fresh ArrayMultiSelectOptionsResolver instance into the container for this test and
 * returns its class-string -- exactly the shape a real consumer's Blade `:option-resolver`
 * attribute carries (D1); the shell resolves it with `app($this->optionResolver)`. Standard
 * container swap, matching the "Test double" section's own wiring instructions verbatim.
 *
 * @param  array<int, array{id: string, label: string, group: string|null, disabled: bool}>|null  $rows
 */
function multiSelectResolver(?array $rows = null, bool $misbehave = false): string
{
    $resolver = new ArrayMultiSelectOptionsResolver(
        $rows ?? ArrayMultiSelectOptionsResolver::DEFAULT_ROWS,
        $misbehave,
    );

    app()->instance(ArrayMultiSelectOptionsResolver::class, $resolver);

    return ArrayMultiSelectOptionsResolver::class;
}

/**
 * @return array<int, array{id: string, label: string, group: string|null, disabled: bool}>
 */
function multiSelectManyMatchingRows(int $count, string $prefix = 'match'): array
{
    return collect(range(1, $count))
        ->map(fn (int $i): array => [
            'id' => "{$prefix}-{$i}",
            'label' => "Match {$i}",
            'group' => null,
            'disabled' => false,
        ])
        ->all();
}

// =====================================================================
// mount() and the resolver contract
// =====================================================================

test('mount() rejects a class-string that does not implement MultiSelectOptionsResolver', function () {
    expect(fn () => Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => stdClass::class,
    ]))->toThrow(InvalidArgumentException::class);
});

// =====================================================================
// Search: debounce hook, minSearchLength boundary, whitespace-only terms
// =====================================================================

test('typing a term narrows $results to matches', function () {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
    ])->set('search', 'madrid');

    expect(collect($component->get('results'))->pluck('id')->all())->toBe(['madrid']);
});

test('below minSearchLength, no resolver call is made and $results stays empty', function () {
    $resolver = multiSelectResolver();
    $double = app(ArrayMultiSelectOptionsResolver::class);

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'minSearchLength' => 3,
    ])->set('search', 'ma');

    expect($component->get('results'))->toBe([])
        ->and($double->searchCalls)->toBe([]);
});

test('at exactly minSearchLength, the resolver is called -- the boundary, where an off-by-one is the realistic bug', function () {
    $resolver = multiSelectResolver();
    $double = app(ArrayMultiSelectOptionsResolver::class);

    Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'minSearchLength' => 3,
    ])->set('search', 'mad');

    expect($double->searchCalls)->toHaveCount(1);
});

test('a whitespace-only term is treated as empty -- no resolver call, no results', function () {
    $resolver = multiSelectResolver();
    $double = app(ArrayMultiSelectOptionsResolver::class);

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
    ])->set('search', '   ');

    expect($component->get('results'))->toBe([])
        ->and($double->searchCalls)->toBe([]);
});

// =====================================================================
// Selection lifecycle: select, remove, exclusion, defensive re-select
// =====================================================================

test('selecting an offered option updates both $selected and $selectedOptions', function () {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
    ])->call('selectOption', 'madrid');

    expect($component->get('selected'))->toBe(['madrid'])
        ->and($component->get('selectedOptions'))->toHaveKey('madrid');
});

test('removing a chip removes the id from both $selected and $selectedOptions', function () {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
    ])->call('selectOption', 'madrid')
        ->call('removeOption', 'madrid');

    expect($component->get('selected'))->toBe([])
        ->and($component->get('selectedOptions'))->not->toHaveKey('madrid');
});

test('an already-selected option is excluded from $results when the search term matches it (D11)', function () {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
    ])->call('selectOption', 'madrid')
        ->set('search', 'mad');

    expect(collect($component->get('results'))->pluck('id')->all())->not->toContain('madrid');
});

test('re-selecting an already-selected id via a direct method call produces no duplicate -- the defensive server-side guard D11 leaves in place for the /livewire/update entry point', function () {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
    ])->call('selectOption', 'madrid')
        ->call('selectOption', 'madrid');

    expect($component->get('selected'))->toBe(['madrid']);
});

test('a no-match search leaves $results empty and renders the empty state', function () {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        // Set explicitly rather than relying on the "blank => lang fallback" default (D5), so this
        // assertion does not depend on guessing an as-yet-undecided translation key.
        'emptyStateText' => 'No matches found for this search.',
    ])->set('search', 'zzz-no-match-zzz');

    expect($component->get('results'))->toBe([]);

    $component->assertSee('No matches found for this search.');
});

test('preselected ids passed to mount() render as chips, sourced from resolveSelected()', function () {
    $resolver = multiSelectResolver();
    $double = app(ArrayMultiSelectOptionsResolver::class);

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'selected' => ['madrid', 'barcelona'],
    ]);

    expect($component->get('selectedOptions'))->toHaveKeys(['madrid', 'barcelona'])
        ->and($double->resolveSelectedCalls)->not->toBe([]);

    $component->assertSee('Madrid')->assertSee('Barcelona');
});

test('changing the search term does not change $selectedOptions -- the D2 chip-label regression', function () {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'selected' => ['nino'],
    ]);

    $before = $component->get('selectedOptions');

    $component->set('search', 'francia-no-such-term');

    expect($component->get('selectedOptions'))->toBe($before)
        ->and($component->get('selectedOptions'))->toHaveKey('nino');
});

// =====================================================================
// Truncation and grouping (D9, D3/D10)
// =====================================================================

test('exactly resultLimit matches produce no truncation notice', function () {
    $resolver = multiSelectResolver(multiSelectManyMatchingRows(5));

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'resultLimit' => 5,
    ])->set('search', 'match');

    expect($component->get('results'))->toHaveCount(5);

    $component->assertDontSee('data-test="searchable-multi-select-truncated"', false);
});

test('resultLimit + 1 matches fetched are trimmed to resultLimit, and the truncation notice is shown', function () {
    // resultLimit(5) + 1 + count($selected)(0) = 6 fetched; 6 rows all match, proving the trim.
    $resolver = multiSelectResolver(multiSelectManyMatchingRows(6));

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'resultLimit' => 5,
    ])->set('search', 'match');

    expect($component->get('results'))->toHaveCount(5);

    $component->assertSee('data-test="searchable-multi-select-truncated"', false);
});

test('with several options already selected, a broad search still yields a full resultLimit list -- proves D9s over-fetch', function () {
    $rows = multiSelectManyMatchingRows(30);
    $resolver = multiSelectResolver($rows);

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'resultLimit' => 20,
        'selected' => ['match-1', 'match-2', 'match-3'],
    ])->set('search', 'match');

    expect($component->get('results'))->toHaveCount(20);

    $ids = collect($component->get('results'))->pluck('id')->all();
    expect($ids)->not->toContain('match-1')
        ->and($ids)->not->toContain('match-2')
        ->and($ids)->not->toContain('match-3');
});

test('the resolver is always called with resultLimit + 1 + count($selected) -- bounded, never unbounded', function () {
    $rows = multiSelectManyMatchingRows(30);
    $resolver = multiSelectResolver($rows);
    $double = app(ArrayMultiSelectOptionsResolver::class);

    Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'resultLimit' => 20,
        'selected' => ['match-1', 'match-2', 'match-3'],
    ])->set('search', 'match');

    expect($double->searchCalls)->toHaveCount(1)
        ->and($double->searchCalls[0]['limit'])->toBe(20 + 1 + 3);
});

test('a 10,000-row fixture still yields exactly resultLimit rendered options -- the real "it scales" assertion', function () {
    $rows = multiSelectManyMatchingRows(10000, 'row');
    $resolver = multiSelectResolver($rows);

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'resultLimit' => 20,
    ])->set('search', 'match');

    expect($component->get('results'))->toHaveCount(20);
});

test('grouped results render under their group heading; group: null results render with no heading', function () {
    $groupedRows = [
        ['id' => 'canarias', 'label' => 'Canarias', 'group' => 'Comunidad Autónoma', 'disabled' => false],
        ['id' => 'peninsula', 'label' => 'Península', 'group' => 'Comunidad Autónoma', 'disabled' => false],
    ];

    Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => multiSelectResolver($groupedRows),
    ])->set('search', 'a')
        ->assertSee('Comunidad Autónoma')
        ->assertSee('data-test="searchable-multi-select-group-heading"', false);

    Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => multiSelectResolver(),
    ])->set('search', 'madrid')
        ->assertDontSee('data-test="searchable-multi-select-group-heading"', false);
});

// =====================================================================
// disabled options (D3) and the disabled field (D7)
// =====================================================================

test('a disabled: true option cannot be selected server-side', function () {
    $resolver = multiSelectResolver(); // DEFAULT_ROWS includes 'unavailable-option', disabled: true

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
    ])->call('selectOption', 'unavailable-option');

    expect($component->get('selected'))->not->toContain('unavailable-option');
});

test('with $disabled true, updatedSearch(), selectOption() and removeOption() all no-op', function () {
    $resolver = multiSelectResolver();
    $double = app(ArrayMultiSelectOptionsResolver::class);

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'disabled' => true,
        'selected' => ['madrid'],
    ]);

    $component->set('search', 'barcelona');
    expect($component->get('results'))->toBe([])
        ->and($double->searchCalls)->toBe([]);

    $component->call('selectOption', 'barcelona');
    expect($component->get('selected'))->toBe(['madrid']);

    $component->call('removeOption', 'madrid');
    expect($component->get('selected'))->toBe(['madrid']);
});

// =====================================================================
// #[Locked] regression proofs (D5/D6)
// =====================================================================

test('locked server-derived properties reject a client-initiated set() -- a regression-proof against someone dropping a #[Locked]', function (string $property, mixed $value) {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
    ]);

    expect(fn () => $component->set($property, $value))
        ->toThrow(CannotUpdateLockedPropertyException::class);
})->with([
    'optionResolver' => ['optionResolver', 'App\\Some\\Other\\Class'],
    'selectedOptions' => ['selectedOptions', ['tampered' => ['label' => 'x', 'group' => null]]],
    'results' => ['results', [['id' => 'x', 'label' => 'x', 'group' => null, 'disabled' => false]]],
    'unresolvableSelected' => ['unresolvableSelected', ['x']],
    'maxChipAreaHeight' => ['maxChipAreaHeight', '99rem'],
]);

// =====================================================================
// D12 -- rejecting unresolvable ids (these replace the superseded silent-drop behaviour)
// =====================================================================

test('an injected id the resolver cannot vouch for is kept in $selected, listed in $unresolvableSelected, and raises a validation error on the field -- never silently dropped', function () {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'selected' => ['madrid', 'ghost-id'],
    ]);

    expect($component->get('selected'))->toBe(['madrid', 'ghost-id'])
        ->and($component->get('unresolvableSelected'))->toBe(['ghost-id']);

    $component->assertHasErrors('selected');
});

test('mount() catches an unresolvable preselected id rather than throwing and 500-ing the host screen', function () {
    $resolver = multiSelectResolver();

    // No expect()->not->toThrow() wrapper: Pest 4's toThrow() requires at least one argument even
    // negated, so a bare closure assertion isn't available here. Calling mount() directly is the
    // correct replacement -- if it throws, the exception propagates and fails this test with an
    // error, which is exactly what "does not throw" means; the assertion below additionally proves
    // real behavior (mount() completed and recorded the unresolvable id) rather than leaving the
    // test with no assertion at all.
    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'selected' => ['ghost-id'],
    ]);

    expect($component->get('unresolvableSelected'))->toBe(['ghost-id']);
});

test('an unresolvable chip renders the generic localized label, never the raw id', function () {
    $resolver = multiSelectResolver();
    $conspicuousId = 'ghost-id-CONSPICUOUS-93a7';

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'selected' => [$conspicuousId],
    ]);

    $component->assertSee(__('components.searchable_multi_select.unavailable_option'))
        ->assertDontSee($conspicuousId);
});

test('assertSelectionResolvable() throws ValidationException, not a bare UnresolvedSelectionException, when a selected id is unresolvable, and returns cleanly when all resolve', function () {
    $resolver = multiSelectResolver();

    $withGhost = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'selected' => ['ghost-id'],
    ]);

    expect(fn () => $withGhost->instance()->assertSelectionResolvable())
        ->toThrow(ValidationException::class);

    $allResolve = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'selected' => ['madrid'],
    ]);

    // Called directly rather than via expect()->not->toThrow() (Pest 4's toThrow() requires at
    // least one argument even negated -- see the sibling comment above). A direct call still
    // proves "returns cleanly": a thrown exception here propagates and fails the test with an
    // error, exactly like the ->not->toThrow() this replaces.
    $allResolve->instance()->assertSelectionResolvable();
});

test('removing the unavailable chip clears $unresolvableSelected and the field error, and assertSelectionResolvable() then passes', function () {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'selected' => ['madrid', 'ghost-id'],
    ]);

    $component->assertHasErrors('selected')
        ->call('removeOption', 'ghost-id')
        ->assertHasNoErrors('selected');

    expect($component->get('unresolvableSelected'))->toBe([])
        ->and($component->get('selected'))->toBe(['madrid']);

    // Called directly rather than via expect()->not->toThrow() (Pest 4's toThrow() requires at
    // least one argument even negated). The assertions above already prove real behavior; a
    // thrown exception here would still fail the test with an error, so "then passes" is proven
    // by this line completing.
    $component->instance()->assertSelectionResolvable();
});

test('UnresolvedSelectionException::$missingIds carries every unresolvable id, not just the first', function () {
    $resolver = new ArrayMultiSelectOptionsResolver(ArrayMultiSelectOptionsResolver::DEFAULT_ROWS);

    try {
        $resolver->resolveSelected(['ghost-1', 'madrid', 'ghost-2', 'ghost-3']);
        $this->fail('Expected UnresolvedSelectionException to be thrown.');
    } catch (UnresolvedSelectionException $exception) {
        expect($exception->missingIds)->toBe(['ghost-1', 'ghost-2', 'ghost-3']);
    }
});

test('a resolver that (wrongly) returns a short array instead of throwing is still caught by the shell -- defence in depth against a consumer implementing the interface incorrectly', function () {
    $resolver = multiSelectResolver(rows: ArrayMultiSelectOptionsResolver::DEFAULT_ROWS, misbehave: true);

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'selected' => ['madrid', 'ghost-id'],
    ]);

    expect($component->get('unresolvableSelected'))->toBe(['ghost-id'])
        ->and($component->get('selected'))->toBe(['madrid', 'ghost-id']);

    $component->assertHasErrors('selected');
});

test('UnresolvedSelectionException has no render() method, so it can never accidentally become an HTTP response', function () {
    expect(class_exists(UnresolvedSelectionException::class))->toBeTrue()
        ->and(method_exists(UnresolvedSelectionException::class, 'render'))->toBeFalse();
});

// =====================================================================
// D13 -- normalized search
// =====================================================================

test('a search term written without accents matches an accented option label', function () {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
    ])->set('search', 'nino');

    expect(collect($component->get('results'))->pluck('id')->all())->toContain('nino');
});

test('search matching ignores letter case', function (string $term) {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
    ])->set('search', $term);

    expect(collect($component->get('results'))->pluck('id')->all())->toContain('nino');
})->with(['NIÑO', 'niño', 'Nino']);

test('the resolver receives an already-normalized term -- asserted from the doubles call log', function () {
    $resolver = multiSelectResolver();
    $double = app(ArrayMultiSelectOptionsResolver::class);

    Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
    ])->set('search', '  ÑÍÑO  ');

    expect($double->searchCalls)->toHaveCount(1)
        ->and($double->searchCalls[0]['term'])->toBe((new NormalizeForSearch)('  ÑÍÑO  '));
});

test('a whitespace-only term normalizes to empty, so no resolver call is made (OQ-5, now covered by D13)', function () {
    $resolver = multiSelectResolver();
    $double = app(ArrayMultiSelectOptionsResolver::class);

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
    ])->set('search', '   ');

    expect($component->get('results'))->toBe([])
        ->and($double->searchCalls)->toBe([]);
});

test('minSearchLength is measured against the normalized term, not the raw input', function () {
    $resolver = multiSelectResolver();
    $double = app(ArrayMultiSelectOptionsResolver::class);

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'minSearchLength' => 2,
    ]);

    // "  ñ  " normalizes to "n" (length 1) -- below minSearchLength=2, no search performed.
    $component->set('search', '  ñ  ');
    expect($double->searchCalls)->toBe([]);

    // " ñu " normalizes to "nu" (length 2) -- meets minSearchLength=2, search performed.
    $component->set('search', ' ñu ');
    expect($double->searchCalls)->toHaveCount(1);
});

// =====================================================================
// D14 -- bounded chip area
// =====================================================================

test('omitting maxChipAreaHeight renders the chip container with no style attribute and no overflow class -- the additive-change proof', function () {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'selected' => ['madrid'],
    ]);

    $html = $component->html();
    $anchor = 'data-test="searchable-multi-select-chip-area"';
    $anchorPosition = strpos($html, $anchor);

    expect($anchorPosition)->not->toBeFalse();

    // Scope the assertion to the chip-area tag's own opening tag, not the whole page -- this
    // project's own count/content-assertion convention (docs/errors-log.md), so a `style=`
    // attribute anywhere ELSE on the page can never produce a false positive here.
    $openingTagEnd = strpos($html, '>', $anchorPosition);
    $openingTag = substr($html, max(0, $anchorPosition - 200), $openingTagEnd - max(0, $anchorPosition - 200) + 1);

    expect($openingTag)->not->toContain('style=')
        ->and($openingTag)->not->toContain('overflow-y-auto');
});

test('setting maxChipAreaHeight renders max-height plus the overflow class on the chip container, with an accessible name present', function () {
    $resolver = multiSelectResolver();

    $component = Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'selected' => ['madrid'],
        'maxChipAreaHeight' => '12rem',
    ]);

    $component->assertSee('max-height: 12rem', false)
        ->assertSee('overflow-y-auto', false)
        ->assertSee('role="group"', false)
        ->assertSee('aria-label=', false);
});

test('mount() throws InvalidArgumentException for a maxChipAreaHeight outside the CSS-length allow-list', function (string $invalidValue) {
    $resolver = multiSelectResolver();

    expect(fn () => Livewire::test(SearchableMultiSelect::class, [
        'optionResolver' => $resolver,
        'maxChipAreaHeight' => $invalidValue,
    ]))->toThrow(InvalidArgumentException::class);
})->with([
    'a bare number with no unit' => ['12'],
    'a disallowed unit (%)' => ['12%'],
    'a style-injection attempt via a semicolon' => ['1rem; background: url(x)'],
]);
