<?php

// Story 0022 (searchable, server-side-filtered multi-select component), Phase 3 Cycle B (TDD "red"
// step). Real-DOM browser coverage for App\Livewire\Components\SearchableMultiSelect -- the split
// this project already established for tests/Browser/Components/WysiwygEditorTest.php and this
// story's own tests/Feature/Components/SearchableMultiSelectTest.php: that file proves server
// wiring cheaply through Livewire::test(); everything about a real debounce timer, a real click
// narrowing the visible result list, and what wire:model.live actually does in a browser belongs
// here, because none of it exists outside a real browser.
//
// Neither App\Livewire\Components\SearchableMultiSelect, its interface, nor its Blade view exist
// yet at this point in the cycle (Phase 3 Cycle B, before frontend-expert's implementation step),
// so visiting the route registered below is expected to fail red right now -- the correct,
// intended outcome of this file existing before the production code does.
//
// TEST DOUBLE / HARNESS, per the task file's own "Test double" section: neither consumer (0027,
// 0034) exists, so there is no real screen to drive. A host view + route are registered ENTIRELY
// INSIDE THIS FILE -- a fixture Blade file under tests/Browser/Components/fixtures/, added via
// View::addLocation(), and a full-page Livewire route (Route::livewire(), the mechanism this repo
// actually uses to mount a routed Livewire component -- see routes/users.php and its siblings;
// "declared in the test file itself" is the requirement the task file states, not a mandate for
// the bare Route::get() facade method specifically). This touches no application file, so it stays
// inside this story's scope boundary. Since D12, the host page also carries a trivial save
// control: SearchableMultiSelectBrowserTestHost::save() re-derives the same refusal
// App\Livewire\Components\SearchableMultiSelect::assertSelectionResolvable() would (D12's own
// documented alternative -- "or its own resolveSelected() call" -- since Livewire gives a parent
// no live reference to a mounted child's instance across the request boundary, so a genuine
// cross-component method call is not the mechanism available here).
//
// ASSUMED data-test HOOKS this file's selectors rely on, mirrored from the Feature test file's own
// assumptions (none of these names are specified by the task file itself -- if Phase 3's
// implementation picks different ones, update both files together):
//   - data-test="searchable-multi-select-option-{id}"        one per rendered result row
//   - data-test="searchable-multi-select-chip-{id}"           one per rendered chip
//   - data-test="searchable-multi-select-chip-remove-{id}"    the chip's own remove control
//   - data-test="searchable-multi-select-empty-state"          the "no results" container
//   - data-test="searchable-multi-select-chip-area"            the (possibly bounded) chip container
//
// The honest limitation the task file itself states: a green run here proves the shell's own
// mechanics work in an isolated host page, not that it survives its real embedding inside a
// flux:modal or a real Eloquent-backed resolver -- 0027 and 0034 each carry a forward
// Definition-of-Done item to add one browser test against their real embedding.

use App\Exceptions\UnresolvedSelectionException;
use App\Models\User;
use Illuminate\Contracts\View\View as ViewContract;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\View;
use Illuminate\Validation\ValidationException;
use Livewire\Component;
use Tests\Support\Livewire\ArrayMultiSelectOptionsResolver;

/**
 * Trivial parent Livewire component for this file's isolated host page. Binds the widget's
 * #[Modelable] $selected via a plain wire:model (D1's own consumer usage snippet), and does
 * nothing else beyond the save control D12 requires the host page to exercise.
 */
class SearchableMultiSelectBrowserTestHost extends Component
{
    public array $selected = [];

    public string $optionResolver = '';

    public ?string $maxChipAreaHeight = null;

    /**
     * N1 code-review fix: null means "let the widget's own #[Locked] $debounceMs default (300)
     * apply" -- the fixture Blade file below only forwards `:debounce-ms` when this is non-null,
     * so a test that never sets it exercises the real default rather than a duplicated literal
     * 300 here.
     */
    public ?int $debounceMs = null;

    public bool $saved = false;

    public function mount(): void
    {
        $this->optionResolver = ArrayMultiSelectOptionsResolver::class;

        // Test-only wiring: this host reads its own per-test scenario config from a container
        // binding the test sets before visit() -- mirroring exactly how the resolver double
        // itself is wired (the "Test double" section's own instructions), rather than inventing a
        // query-string/route-parameter mechanism that would be scope creep for a fixture that
        // touches no application file.
        $config = app()->bound('searchable-multi-select-test-config')
            ? app()->make('searchable-multi-select-test-config')
            : [];

        $this->selected = $config['selected'] ?? [];
        $this->maxChipAreaHeight = $config['maxChipAreaHeight'] ?? null;
        $this->debounceMs = $config['debounceMs'] ?? null;
    }

    /**
     * D12's second sanctioned consumer shape ("or its own resolveSelected() call") rather than a
     * cross-component call onto the mounted child -- see the file banner comment above.
     */
    public function save(): void
    {
        try {
            app($this->optionResolver)->resolveSelected($this->selected);
        } catch (UnresolvedSelectionException) {
            throw ValidationException::withMessages([
                'selected' => 'One or more selected values could not be resolved.',
            ]);
        }

        $this->saved = true;
    }

    public function render(): ViewContract
    {
        return view('searchable-multi-select-test-host');
    }
}

beforeEach(function () {
    View::addLocation(__DIR__.'/fixtures');

    Route::livewire('__test/searchable-multi-select', SearchableMultiSelectBrowserTestHost::class)
        ->middleware(['web', 'auth']);
});

/**
 * @param  array<int, array{id: string, label: string, group: string|null, disabled: bool}>|null  $rows
 */
function multiSelectBrowserBind(?array $rows = null): ArrayMultiSelectOptionsResolver
{
    $resolver = new ArrayMultiSelectOptionsResolver($rows ?? ArrayMultiSelectOptionsResolver::DEFAULT_ROWS);

    app()->instance(ArrayMultiSelectOptionsResolver::class, $resolver);

    return $resolver;
}

/**
 * @param  array{selected?: array<int, string>, maxChipAreaHeight?: string|null, debounceMs?: int|null}  $config
 */
function multiSelectBrowserConfig(array $config): void
{
    app()->instance('searchable-multi-select-test-config', $config);
}

/**
 * @return array<int, array{id: string, label: string, group: string|null, disabled: bool}>
 */
function multiSelectBrowserRowsWithQuoteId(): array
{
    return array_merge(ArrayMultiSelectOptionsResolver::DEFAULT_ROWS, [
        ['id' => "q'uote", 'label' => 'Quote Option', 'group' => null, 'disabled' => false],
    ]);
}

// =====================================================================
// Debounce and real narrowing
// =====================================================================

test('real typing into the search input narrows the rendered list', function () {
    multiSelectBrowserBind();
    $this->actingAs(User::factory()->create());

    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->fill('Regions', 'madrid')
        ->assertSee('Madrid')
        ->assertDontSee('Barcelona')
        ->assertNoJavaScriptErrors();
});

test('debounce coalesces a rapid keystroke burst into fewer resolver calls than keystrokes', function () {
    $double = multiSelectBrowserBind();
    $this->actingAs(User::factory()->create());

    $page = visit('/__test/searchable-multi-select')->assertNoJavaScriptErrors();

    // Each ->fill() overwrites the field's value and fires its own native `input` event,
    // restarting the hand-rolled Alpine setTimeout() debounce that x-on:input drives (N1, code
    // review -- resources/views/livewire/components/searchable-multi-select.blade.php) -- three
    // fills issued back-to-back (no artificial wait between them) exercise the same coalescing a
    // fast human typist triggers, at the widget's real #[Locked] default (this host is not
    // configured with a debounceMs override, so it renders the literal 300).
    $page->fill('Regions', 'm')
        ->fill('Regions', 'ma')
        ->fill('Regions', 'mad');

    // Poll the DOM's own settled state rather than a bare wait -- assertSee() retries via
    // Execution::waitForExpectation() until the debounced round trip lands.
    $page->assertSee('Madrid')->assertNoJavaScriptErrors();

    expect(count($double->searchCalls))->toBeLessThan(3);
});

test('debounceMs is a real, per-instance-configurable value, not silently ignored in favour of a hardcoded 300ms (N1, code review)', function () {
    // A RELATIVE comparison across two visits, not an assertion on an exact call count for
    // either one: this environment's real inter-fill() timing is not precise enough to promise
    // a specific number (measured directly, over three consecutive runs: debounceMs=0 produced
    // exactly 2 calls every time for this identical three-fill burst, never 3 or 1 -- the JS
    // macrotask queue does not guarantee every fill's 0ms timer fires before the next fill
    // lands). What IS stable and reproducible, and what actually proves $debounceMs is read and
    // honored rather than silently ignored (N1's exact finding -- the widget could not
    // parameterize a native wire:model.live.debounce.Xms modifier by $debounceMs at all, so
    // every consumer got a literal 300 regardless of what they configured), is that configuring
    // debounceMs far BELOW the real default produces MORE independent resolver calls than the
    // real default does for the identical burst. See docs/testing/frontend/playwright-setup.md's
    // own warnings about exact-timing browser assertions in this environment -- this test
    // deliberately avoids relying on one.
    $this->actingAs(User::factory()->create());

    $doubleDefault = multiSelectBrowserBind();
    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->fill('Regions', 'm')
        ->fill('Regions', 'ma')
        ->fill('Regions', 'mad')
        ->assertSee('Madrid')
        ->assertNoJavaScriptErrors();
    $defaultCallCount = count($doubleDefault->searchCalls);

    $doubleShort = multiSelectBrowserBind();
    multiSelectBrowserConfig(['debounceMs' => 0]);
    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->fill('Regions', 'm')
        ->fill('Regions', 'ma')
        ->fill('Regions', 'mad')
        ->assertSee('Madrid')
        ->assertNoJavaScriptErrors();
    $shortCallCount = count($doubleShort->searchCalls);

    expect($shortCallCount)->toBeGreaterThan($defaultCallCount);
});

// =====================================================================
// Selection lifecycle, through real clicks
// =====================================================================

test('a real click on a result option adds a visible chip and removes that option from the visible result list', function () {
    multiSelectBrowserBind();
    $this->actingAs(User::factory()->create());

    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->fill('Regions', 'madrid')
        ->assertVisible('@searchable-multi-select-option-madrid')
        ->click('@searchable-multi-select-option-madrid')
        ->assertVisible('@searchable-multi-select-chip-madrid')
        ->assertMissing('@searchable-multi-select-option-madrid')
        ->assertNoJavaScriptErrors();
});

test('a real click on a chips remove control removes it, and the option becomes offerable again on the next matching search', function () {
    multiSelectBrowserBind();
    $this->actingAs(User::factory()->create());

    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->fill('Regions', 'madrid')
        ->click('@searchable-multi-select-option-madrid')
        ->assertVisible('@searchable-multi-select-chip-madrid')
        ->click('@searchable-multi-select-chip-remove-madrid')
        ->assertMissing('@searchable-multi-select-chip-madrid')
        // Investigated as a server-state question first (see the Feature-level probe this
        // finding is based on): calling removeOption() directly and re-issuing the identical
        // search term both correctly return 'madrid' in $results server-side -- this is not a
        // server bug. The field's real DOM value is still "madrid" from the fill() above (it
        // was never changed), so re-filling with the exact same string here does not reliably
        // dispatch a fresh `input` event for wire:model.live to react to -- clearing the field
        // first forces a genuine value transition, matching this file's own debounce test,
        // which never re-fills an unchanged value either.
        ->fill('Regions', '')
        ->fill('Regions', 'madrid')
        ->assertVisible('@searchable-multi-select-option-madrid')
        ->assertNoJavaScriptErrors();
});

test('the empty state is visible on a no-match search, not merely present in the DOM', function () {
    multiSelectBrowserBind();
    $this->actingAs(User::factory()->create());

    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->fill('Regions', 'zzz-no-match-zzz')
        ->assertVisible('@searchable-multi-select-empty-state')
        ->assertNoJavaScriptErrors();
});

test('preselected values render as chips on first paint, before any interaction', function () {
    multiSelectBrowserBind();
    multiSelectBrowserConfig(['selected' => ['madrid', 'barcelona']]);
    $this->actingAs(User::factory()->create());

    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->assertVisible('@searchable-multi-select-chip-madrid')
        ->assertVisible('@searchable-multi-select-chip-barcelona')
        ->assertNoJavaScriptErrors();
});

test('a selected chip keeps its correct label after an unrelated search, through real hydration -- the D2 trap', function () {
    multiSelectBrowserBind();
    multiSelectBrowserConfig(['selected' => ['nino']]);
    $this->actingAs(User::factory()->create());

    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->assertSee('Niño')
        ->fill('Regions', 'francia-no-such-term')
        ->assertSee('Niño')
        ->assertNoJavaScriptErrors();
});

// =====================================================================
// The @js() trap (D8) -- the only test that can catch a missing one
// =====================================================================

test('an option whose id contains a quote character is selectable without a JS error', function () {
    multiSelectBrowserBind(multiSelectBrowserRowsWithQuoteId());
    $this->actingAs(User::factory()->create());

    $quoteId = "q'uote";
    $optionSelector = '[data-test="searchable-multi-select-option-'.$quoteId.'"]';
    $chipSelector = '[data-test="searchable-multi-select-chip-'.$quoteId.'"]';

    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->fill('Regions', 'quote')
        ->assertSee('Quote Option')
        // A missing @js() around the id would land an unescaped `'` inside the compiled
        // wire:click argument's JS-string literal, breaking the whole page's JS evaluator --
        // exactly the failure assertNoJavaScriptErrors() below exists to catch.
        ->click($optionSelector)
        ->assertVisible($chipSelector)
        ->assertNoJavaScriptErrors();
});

// =====================================================================
// A disabled option's explanation on hover (D3), mirroring the Users screen's own idiom
// =====================================================================

test('a disabled: true option shows its explanation on hover', function () {
    multiSelectBrowserBind();
    $this->actingAs(User::factory()->create());

    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->fill('Regions', 'unavailable')
        // A disabled control renders `pointer-events: none` (Flux's own default), so
        // Playwright's actionability check refuses to target it directly -- the wrapping
        // <ui-tooltip> is what actually listens for the hover. See
        // tests/Browser/UsersIndexTest.php's identical idiom and the two related Flux/Blaze
        // traps in docs/errors-log.md.
        ->hover('ui-tooltip:has([data-test="searchable-multi-select-option-unavailable-option"])')
        // A page-global [role="tooltip"] selector strict-mode-fails here: the authenticated
        // layout's sidebar renders its own Flux tooltips on every page (see
        // tests/Browser/UsersIndexTest.php / SalesRegionsIndexTest.php's identical pattern), so
        // the assertion must be scoped by the tooltip's own translated content instead of an
        // unscoped element selector.
        ->assertSee(__('components.searchable_multi_select.unavailable_option_reason'))
        ->assertNoJavaScriptErrors();
});

// =====================================================================
// D13 -- normalized search, through a real round trip
// =====================================================================

test('typing an unaccented term surfaces the accented option in the real rendered list', function () {
    multiSelectBrowserBind();
    $this->actingAs(User::factory()->create());

    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->fill('Regions', 'nino')
        ->assertSee('Niño')
        ->assertNoJavaScriptErrors();
});

// =====================================================================
// D12 -- an unresolvable selection on first paint, and the host's save refusal
// =====================================================================

test('a selection holding an unresolvable id renders the unavailable chip and the field error on first paint, and the hosts save control refuses outright', function () {
    multiSelectBrowserBind();
    multiSelectBrowserConfig(['selected' => ['ghost-id']]);
    $this->actingAs(User::factory()->create());

    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->assertSee(__('components.searchable_multi_select.unavailable_option'))
        ->assertDontSee('ghost-id')
        ->click('@host-save-button')
        ->assertVisible('@host-save-error')
        ->assertMissing('@host-save-success')
        ->assertNoJavaScriptErrors();
});

// =====================================================================
// D14 -- bounded vs. unbounded chip area, measured from the real layout
// =====================================================================

test('with maxChipAreaHeight set, the chip containers rendered scrollHeight exceeds its clientHeight while the field itself stays bounded; unbounded, it does not', function () {
    $ids = collect(range(1, 20))->map(fn (int $i) => "chip-{$i}")->all();
    $rows = collect($ids)->map(fn (string $id): array => [
        'id' => $id, 'label' => strtoupper(str_replace('-', ' ', $id)), 'group' => null, 'disabled' => false,
    ])->all();

    $scrollHeightExceedsClientHeightScript = <<<'JS'
        (function() {
            const el = document.querySelector('[data-test="searchable-multi-select-chip-area"]');
            return el.scrollHeight > el.clientHeight;
        })()
        JS;

    $scrollHeightEqualsClientHeightScript = <<<'JS'
        (function() {
            const el = document.querySelector('[data-test="searchable-multi-select-chip-area"]');
            return el.scrollHeight === el.clientHeight;
        })()
        JS;

    multiSelectBrowserBind($rows);
    multiSelectBrowserConfig(['selected' => $ids, 'maxChipAreaHeight' => '4rem']);
    $this->actingAs(User::factory()->create());

    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->assertScript($scrollHeightExceedsClientHeightScript)
        ->assertNoJavaScriptErrors();

    // Same fixture, no bound height -- the chip area grows to fit every chip instead of scrolling.
    multiSelectBrowserBind($rows);
    multiSelectBrowserConfig(['selected' => $ids]);

    visit('/__test/searchable-multi-select')
        ->assertNoJavaScriptErrors()
        ->assertScript($scrollHeightEqualsClientHeightScript)
        ->assertNoJavaScriptErrors();
});
