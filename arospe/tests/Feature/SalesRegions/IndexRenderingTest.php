<?php

// RED-phase rendering tests for App\Livewire\SalesRegions\Index's real view
// (resources/views/livewire/sales-regions.blade.php), per
// ai-spec/tasks/in-progress/0018-sales-region-tax-configuration-ui.md's "Component --
// tests/Feature/SalesRegions/IndexRenderingTest.php" bullets (tests 1-9, plus 9b added at the
// task file's own Phase 2 reconciliation, finding F-5).
//
// Component logic, persistence, validation-rule enforcement and authorization refusals are
// already covered by tests/Feature/SalesRegions/{IndexTest,SetSalesRegionActiveTest,
// SetDefaultSalesRegionTest,RefusalLoggingTest}.php (story 0017) -- nothing here duplicates
// that. Every test below asserts against the RENDERED HTML (assertSee/assertDontSee/regex over
// ->html()), which those files never do.
//
// As of this writing resources/views/livewire/sales-regions.blade.php is still 0017's
// placeholder (`<p>{{ count($regions) }}</p>`) -- story 0018's own job, Phase 3.2, has not run
// yet. EVERY test in this file is expected to fail (RED) against that placeholder, on a missing
// assertSee/regex match, not on a fatal error -- App\Livewire\SalesRegions\Index and its actions
// already exist and are fully implemented (story 0017, done).
//
// Arranged only with SalesRegionFactory (fiscalTerritoryOf()/isDefault()/inactive()/withRate())
// -- never SalesRegionSeeder, which story 0016 forbids outright for tests (249 rows).
//
// SELECTOR CONTRACT this file establishes beyond D8's four data-test hooks
// (edit-region-{id} / toggle-active-region-{id} / set-default-region-{id} / expand-region-{id}),
// since the real markup does not exist yet -- adjust these here first if Phase 3.2 names them
// differently:
//   - `data-test="default-badge-region-{id}"` on the amber "Default" badge (D8 names hooks for
//     controls, not for the badge; test 3's "present on the new row, absent from the old one"
//     needs a copy-independent marker).
//   - `data-parent-id="{parentId}"` as an EXTRA attribute on a fiscal territory's own
//     `edit-region-{id}` control, naming its parent's id -- lets test 7 assert the España
//     grouping by relationship (D2) rather than by array position, without inventing a whole
//     second row-level hook.

use App\Livewire\SalesRegions\Index;
use App\Models\SalesRegion;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function salesRegionsIndexRenderingTestActor(array $permissions = ['sales-regions.view', 'sales-regions.edit']): User
{
    $actor = User::factory()->create();

    if ($permissions !== []) {
        $actor->givePermissionTo($permissions);
    }

    return $actor;
}

/**
 * D6's exact rendering formula, quoted from the task file so the expected string in every test
 * below is derived the same way the real markup must be -- never a float cast, never a
 * truthiness test.
 */
function salesRegionsExpectedRateDisplay(?string $rate): string
{
    return $rate === null ? '—' : rtrim(rtrim($rate, '0'), '.').'%';
}

/**
 * The rendered text of ONE row's rate cell (`data-test="rate-region-{id}"`), added at Phase 5 code
 * review finding N3: `assertSee('0%')` / `assertDontSee('—')` are page-global substring checks --
 * '0%' matches inside '10%'/'20%'/'100%', and '—' is also what the code chip's own @else branch
 * now renders (finding N1) -- so they only ever passed because each arrangement held exactly one
 * rate-bearing row. Anchoring on the row's own cell is immune to a second fixture row entirely.
 */
function salesRegionsRateCellText(string $html, string $regionId): ?string
{
    $quoted = preg_quote($regionId, '/');

    if (! preg_match('/data-test="rate-region-'.$quoted.'"[^>]*>\s*([^<]*)</', $html, $matches)) {
        return null;
    }

    return trim($matches[1]);
}

/**
 * Does the tag carrying `data-test="$dataTest"` also carry a `disabled` attribute? Lookaheads
 * make this robust to attribute order and to the element name (Flux's disabled row controls are
 * not all <button> -- the Active column is a <ui-switch> -- see the file banner above).
 *
 * Matches `disabled="disabled"` specifically -- the exact format Laravel's
 * ComponentAttributeBag::__toString() renders a bare boolean `disabled` prop as (`if ($value ===
 * true) { $value = $key; }` then `key="value"`) -- rather than a bare `\sdisabled` substring.
 * flux:button's own compiled classlist unconditionally carries the literal substring
 * " disabled:opacity-75" (a Tailwind variant-prefixed utility, present on the ENABLED branch
 * too), which a bare `\sdisabled` lookahead false-matches on every flux:button regardless of its
 * real state. tests/Feature/Users/IndexRenderingTest.php's own `$isRowActionDisabled` -- the
 * technique this file's header says it borrows -- already anchors on `\sdisabled="disabled"` for
 * exactly this reason; this helper now matches it.
 */
function salesRegionsRowControlDisabled(string $html, string $dataTest): bool
{
    $quoted = preg_quote($dataTest, '/');

    return (bool) preg_match(
        '/<[a-z0-9-]+(?=[^>]*\bdata-test="'.$quoted.'")(?=[^>]*\sdisabled="disabled")[^>]*>/is',
        $html
    );
}

/**
 * Does the <ui-switch> carrying `data-test="$dataTest"` render `checked` -- Phase 4 finding F-3's
 * server-truth assertion. flux/switch.blade.php emits this as a BARE boolean attribute
 * (`@if ($checked) checked data-checked @endif`), not a `key="value"` pair like `disabled` above,
 * so the anchor here is `\schecked` (a literal space before the word). This is deliberately safe
 * against the switch's own compiled classlist, which contains "checked" only as a substring of a
 * hyphen-prefixed utility (`group-has-checked:...`) or the `data-checked` attribute itself
 * (hyphen-prefixed, not space-prefixed) -- neither is preceded by whitespace, so neither
 * false-matches `\schecked`.
 */
function salesRegionsRowControlChecked(string $html, string $dataTest): bool
{
    $quoted = preg_quote($dataTest, '/');

    return (bool) preg_match(
        '/<[a-z0-9-]+(?=[^>]*\bdata-test="'.$quoted.'")(?=[^>]*\schecked(?:\s|>))[^>]*>/is',
        $html
    );
}

/**
 * Is the control carrying `data-test="$dataTest"` wrapped in an explicit <flux:tooltip> (compiled
 * to <ui-tooltip>), the Flux/Blaze trap documented in docs/errors-log.md and required again here
 * by the task file's "Disabled affordances" section? Element-name-agnostic for the same reason as
 * above.
 */
function salesRegionsRowControlWrappedInTooltip(string $html, string $dataTest): bool
{
    $quoted = preg_quote($dataTest, '/');

    return (bool) preg_match(
        '/<ui-tooltip[^>]*>\s*<[a-z0-9-]+[^>]*\bdata-test="'.$quoted.'"/is',
        $html
    );
}

/**
 * Phase 5 code review finding N5: the disabled control carrying `data-test="$dataTest"`'s own
 * tooltip COPY, not merely that a tooltip wraps it -- A3-a's whole content is WHICH string a
 * disabled toggle carries (the default row's "open the edit form" routing copy vs. the generic
 * "you can't do this" one a canEdit===false row gets), and the two coexist verbatim elsewhere on
 * the same page, so a bare assertSee could match either occurrence.
 *
 * flux/tooltip/index.blade.php nests the content as a sibling <flux:tooltip.content> element
 * (compiling to `<div ... data-flux-tooltip-content>{{ text }}</div>`) inside the SAME
 * <ui-tooltip>, not as a `content="..."` attribute on it -- captured here in two steps: isolate
 * the one <ui-tooltip>...</ui-tooltip> block containing $dataTest (bounded so the lazy match
 * cannot cross into a second, unrelated tooltip elsewhere on the page), then read that block's
 * own content div.
 */
function salesRegionsRowControlTooltipContent(string $html, string $dataTest): ?string
{
    $quotedDataTest = preg_quote($dataTest, '/');

    if (! preg_match(
        '/<ui-tooltip[^>]*>((?:(?!<\/ui-tooltip>).)*?data-test="'.$quotedDataTest.'"(?:(?!<\/ui-tooltip>).)*?)<\/ui-tooltip>/is',
        $html,
        $tooltipMatch
    )) {
        return null;
    }

    if (! preg_match('/data-flux-tooltip-content[^>]*>\s*([^<]*)/is', $tooltipMatch[1], $contentMatch)) {
        return null;
    }

    return trim($contentMatch[1]);
}

// =====================================================================
// Test 1 -- the list renders each entry's code chip, name, description and rate exactly as
// configured. Retires: a persisted value that never reaches the rendered row.
// =====================================================================

test('the list renders each entrys code chip, name, description and rate exactly as configured', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $region = SalesRegion::factory()->withRate('21.500')->create([
        'code' => 'PT',
        'name' => 'Portugal',
        'description' => 'Standard mainland rate',
    ]);

    Livewire::test(Index::class)
        ->assertSee('PT')
        ->assertSee('Portugal')
        ->assertSee('Standard mainland rate')
        ->assertSee(salesRegionsExpectedRateDisplay($region->fresh()->rate));
});

// =====================================================================
// Test 2 -- both directions of the rate distinction, as two assertions. Retires the
// if ($rate) truthiness trap (D6): a single-direction test passes on the broken implementation.
// =====================================================================

test('a NULL rate renders the unconfigured marker and a 0.000 rate renders 0%, never the others marker', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $unconfigured = SalesRegion::factory()->create(['name' => 'Marruecos', 'rate' => null]);

    $html = Livewire::test(Index::class)->html();

    // Phase 5 code review finding N3: anchored on this row's own rate-region-{id} cell rather
    // than a page-global assertSee('—')/assertDontSee('0%'), which would false-pass or
    // false-fail the moment a second, differently-rated row exists in the same render.
    expect(salesRegionsRateCellText($html, $unconfigured->id))->toBe('—');

    $unconfigured->delete();

    $configuredZero = SalesRegion::factory()->withRate('0.000')->create(['name' => 'Andorra']);

    $html = Livewire::test(Index::class)->html();

    expect(salesRegionsRateCellText($html, $configuredZero->id))->toBe('0%');

    expect($configuredZero->fresh()->rate)->toBe('0.000');
});

// =====================================================================
// Test 3 -- after a default swap, the badge is present on the new row and absent from the old
// one, asserted on both rows in one test. Retires a view that only ever ADDS the badge.
// =====================================================================

test('after a default swap, the default badge appears on the new row and disappears from the old one', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $oldDefault = SalesRegion::factory()->isDefault()->create(['name' => 'España (Península)']);
    $newDefault = SalesRegion::factory()->create(['name' => 'Portugal', 'is_active' => true, 'is_default' => false]);

    $html = Livewire::test(Index::class)
        ->call('setDefault', $newDefault->id)
        ->html();

    expect($html)->toContain('data-test="default-badge-region-'.$newDefault->id.'"')
        ->and($html)->not->toContain('data-test="default-badge-region-'.$oldDefault->id.'"');
});

// =====================================================================
// Test 4 -- disabling the default with no replacement: the validation message renders next to
// the replacement field, the modal stays open, and the row still renders active + default.
// Retires the worst failure mode -- a UI that reports success on a refused write.
// =====================================================================

test('disabling the default with no replacement shows the blocked message, keeps the modal open, and leaves the row rendered as still active and default', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $default = SalesRegion::factory()->isDefault()->create(['name' => 'España (Península)']);

    $component = Livewire::test(Index::class)
        ->call('openEditModal', $default->id)
        ->set('active', false)
        ->call('save');

    $component
        ->assertSee(__('sales-regions.errors.default_deactivation_requires_replacement'))
        ->assertSet('showModal', true);

    // The row rendered in the table (loaded once, at mount()) never reloaded, since save()
    // throws before reaching loadRegions() -- it must therefore still show this row as active
    // and carrying the default badge, the same copy-independent marker test 3 uses.
    expect($component->html())->toContain('data-test="default-badge-region-'.$default->id.'"');

    expect($default->fresh()->is_active)->toBeTrue()
        ->and($default->fresh()->is_default)->toBeTrue();
});

// =====================================================================
// Test 5 -- the set-default control renders disabled on an already-default row and on an
// inactive row; the enable-disable control renders disabled on the current-default row.
// Retires a clickable control relying solely on the action's own guard to refuse silently.
// =====================================================================

test('the set-default control is disabled on the default and inactive rows, and the toggle is disabled on the default row', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $default = SalesRegion::factory()->isDefault()->create(['name' => 'España (Península)']);
    $inactive = SalesRegion::factory()->inactive()->create(['name' => 'Marruecos']);
    $ordinary = SalesRegion::factory()->create(['name' => 'Portugal', 'is_active' => true, 'is_default' => false]);

    $html = Livewire::test(Index::class)->html();

    expect(salesRegionsRowControlDisabled($html, 'set-default-region-'.$default->id))->toBeTrue()
        ->and(salesRegionsRowControlDisabled($html, 'set-default-region-'.$inactive->id))->toBeTrue()
        ->and(salesRegionsRowControlDisabled($html, 'set-default-region-'.$ordinary->id))->toBeFalse()
        ->and(salesRegionsRowControlDisabled($html, 'toggle-active-region-'.$default->id))->toBeTrue()
        ->and(salesRegionsRowControlDisabled($html, 'toggle-active-region-'.$inactive->id))->toBeFalse()
        ->and(salesRegionsRowControlDisabled($html, 'toggle-active-region-'.$ordinary->id))->toBeFalse();

    // Phase 5 code review finding N5: A3-a's whole content is WHICH tooltip string a disabled
    // toggle carries -- "disabled" alone (asserted above) does not distinguish the default row's
    // "open the edit form" routing copy from the generic "you can't do this" one a canEdit===false
    // row gets (test 6, below), and both copies exist verbatim elsewhere on the same page, so a
    // bare assertSee could match either occurrence.
    expect(salesRegionsRowControlTooltipContent($html, 'toggle-active-region-'.$default->id))
        ->toBe(__('sales-regions.index.default_toggle_tooltip'));
});

// =====================================================================
// Test 6 -- a row with canEdit === false renders edit, toggle and set-default all disabled,
// each inside the explicit flux:tooltip wrapper. Retires re-shipping either documented
// Flux/Blaze bug on a second screen.
// =====================================================================

test('a row the actor cannot edit renders edit, toggle and set-default all disabled, each wrapped in the not-allowed tooltip', function () {
    $actor = salesRegionsIndexRenderingTestActor(['sales-regions.view']);
    $this->actingAs($actor);

    $region = SalesRegion::factory()->create(['name' => 'Portugal', 'is_active' => true, 'is_default' => false]);

    $html = Livewire::test(Index::class)->html();

    expect(salesRegionsRowControlDisabled($html, 'edit-region-'.$region->id))->toBeTrue()
        ->and(salesRegionsRowControlDisabled($html, 'toggle-active-region-'.$region->id))->toBeTrue()
        ->and(salesRegionsRowControlDisabled($html, 'set-default-region-'.$region->id))->toBeTrue()
        ->and(salesRegionsRowControlWrappedInTooltip($html, 'edit-region-'.$region->id))->toBeTrue()
        ->and(salesRegionsRowControlWrappedInTooltip($html, 'toggle-active-region-'.$region->id))->toBeTrue()
        ->and(salesRegionsRowControlWrappedInTooltip($html, 'set-default-region-'.$region->id))->toBeTrue();

    // Phase 5 code review finding N5: this row is NOT the default, so its disabled toggle must
    // carry the generic action_not_allowed copy, never the default row's edit-form-routing one
    // (asserted the other way in test 5, above) -- the two must never swap.
    expect(salesRegionsRowControlTooltipContent($html, 'toggle-active-region-'.$region->id))
        ->toBe(__('sales-regions.index.action_not_allowed'));
});

// =====================================================================
// Test 7 -- Spain's five territories render grouped beneath "España", asserted by relationship
// (not by array position, per D2). A country with no children renders top-level with no expand
// affordance.
// =====================================================================

test('spains five fiscal territories render grouped beneath españa by relationship, and a childless country has no expand affordance', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $espana = SalesRegion::factory()->create(['name' => 'España']);
    $territories = collect(['Península', 'Baleares', 'Canarias', 'Ceuta', 'Melilla'])
        ->map(fn (string $name): SalesRegion => SalesRegion::factory()->fiscalTerritoryOf($espana)->create(['name' => $name]));

    $portugal = SalesRegion::factory()->create(['name' => 'Portugal']);

    $html = Livewire::test(Index::class)->html();

    foreach ($territories as $territory) {
        expect($html)->toContain($territory->name);

        // Relationship, not position: the territory's own edit-region-{id} control must carry
        // data-parent-id naming España's id (this file's own selector contract, above).
        $carriesParentId = (bool) preg_match(
            '/<[a-z0-9-]+(?=[^>]*\bdata-test="edit-region-'.preg_quote($territory->id, '/').'")(?=[^>]*\bdata-parent-id="'.preg_quote($espana->id, '/').'")[^>]*>/is',
            $html
        );

        expect($carriesParentId)->toBeTrue();
    }

    // España itself carries the expand chevron (it has children); a childless country does not.
    expect($html)->toContain('data-test="expand-region-'.$espana->id.'"')
        ->and($html)->not->toContain('data-test="expand-region-'.$portugal->id.'"');
});

// =====================================================================
// Test 8 -- the falsifiable no-create pair: (a) no create/add-region data-test hook or trigger
// anywhere in the rendered HTML; (b) driving every mutating control the render exposes leaves
// SalesRegion::count() unchanged.
// =====================================================================

test('no create-region control exists anywhere, and driving every mutating control leaves the region count unchanged', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $region = SalesRegion::factory()->create(['name' => 'Portugal', 'is_active' => true, 'is_default' => false]);
    $other = SalesRegion::factory()->isDefault()->create(['name' => 'España (Península)']);

    $countBefore = SalesRegion::count();

    $component = Livewire::test(Index::class);

    // Anchors this test to the REAL markup rather than only to absence: the row's own
    // edit-region-{id} hook (D8) must actually be on screen, or a view that renders nothing at
    // all (the placeholder) would satisfy the absence checks below vacuously and this test
    // would pass before a single line of the real screen exists.
    expect($component->html())->toContain('data-test="edit-region-'.$region->id.'"');

    // (a) No create/add-region hook or trigger anywhere on the rendered page.
    expect($component->html())->not->toMatch('/data-test="(create|add)-region/i')
        ->and($component->html())->not->toContain('wire:click="create');

    // (b) Every mutating method the real component exposes, driven end to end, must never
    // change the row count -- there is no createRegion()-shaped method to even call.
    $component
        ->call('openEditModal', $region->id)
        ->set('description', 'Exercised, not created')
        ->call('save')
        ->call('setDefault', $region->id)
        ->call('setActive', $region->id, true, '')
        ->call('setActive', $other->id, false, $region->id);

    expect(SalesRegion::count())->toBe($countBefore);
});

// =====================================================================
// Test 9 -- clearing the rate field and saving renders the unconfigured marker again. Retires a
// regression in D6's blank-clears semantics at the layer the administrator sees.
// =====================================================================

test('clearing a configured rate and saving renders the unconfigured marker again', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $region = SalesRegion::factory()->withRate('21.500')->create(['name' => 'Portugal']);

    $html = Livewire::test(Index::class)
        ->call('openEditModal', $region->id)
        ->set('rate', '')
        ->call('save')
        ->html();

    // Phase 5 code review finding N3: same row-scoped anchor as test 2, above.
    expect(salesRegionsRateCellText($html, $region->id))->toBe('—');

    expect($region->fresh()->rate)->toBeNull();
});

// =====================================================================
// Phase 5 code review finding N5: the edit modal's read-only context block -- name, slug and
// kind are shown but never bound to a form control, the PRD's "a structural attribute cannot be
// changed" requirement satisfied structurally (no property to write) rather than by filtering
// input server-side. Asserted on a fiscal territory specifically, since its kind label
// ("Territorio fiscal" / "Fiscal territory") is the one of the two that also needs D2's
// parent/child relationship to be reachable at all.
// =====================================================================

test('the edit modal shows name, slug and kind as read-only context with no bound form control', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $espana = SalesRegion::factory()->create(['name' => 'España']);
    $canarias = SalesRegion::factory()->fiscalTerritoryOf($espana)->create(['name' => 'Canarias']);

    $html = Livewire::test(Index::class)
        ->call('openEditModal', $canarias->id)
        ->html();

    expect($html)->toContain($canarias->name)
        ->and($html)->toContain($canarias->slug)
        ->and($html)->toContain(__('sales-regions.labels.kind_fiscal_territory'))
        ->and($html)->not->toContain('wire:model="name"')
        ->and($html)->not->toContain('wire:model="slug"')
        ->and($html)->not->toContain('wire:model="kind"');
});

// =====================================================================
// Test 9b -- the orphaned-refusal outlet (Q4, addition A4-a). Added at the task file's Phase 2
// reconciliation (finding F-5): A4-a had an acceptance criterion and no test. Reproduces the
// race deterministically -- no concurrency needed -- by calling setActive() directly on the
// current default with no modal open. Then asserts the SAME message renders exactly once when
// the modal IS open (the @unless ($showModal) guard), so a refusal can never render twice.
// =====================================================================

test('an orphaned replacementDefaultId refusal renders in the page-level outlet when the modal is closed', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $default = SalesRegion::factory()->isDefault()->create(['name' => 'España (Península)']);

    $component = Livewire::test(Index::class)
        ->assertSet('showModal', false)
        ->call('setActive', $default->id, false, '');

    $message = __('sales-regions.errors.default_deactivation_requires_replacement');

    expect(substr_count($component->html(), $message))->toBe(1);

    expect($default->fresh()->is_active)->toBeTrue()
        ->and($default->fresh()->is_default)->toBeTrue();

    // Phase 4 finding F-3: the row's own re-rendered HTML must still claim the switch is
    // checked after the refusal -- the server-truth half of "a UI that reports success on a
    // refused write is the worst outcome" (this story's own stated test-4 rationale). This
    // proves the SERVER never renders a stale/false state; it cannot observe whether a real
    // browser's <ui-switch> (a Flux web component with its own internal click-driven state --
    // see the markup's F-3 note) visually reverts after Livewire's morph finds no HTML change to
    // apply, which is a client-side question this suite's component-level layer cannot answer.
    expect(salesRegionsRowControlChecked($component->html(), 'toggle-active-region-'.$default->id))
        ->toBeTrue();
});

// =====================================================================
// Phase 5 code review finding B1 (blocking): cancelling the modal after a refused save() left the
// replacementDefaultId error on the bag forever, so the page-level `@unless ($showModal)` outlet
// rendered the refusal message with no field and no context -- the exact "orphaned refusal" A4-a
// exists to prevent, produced by the control added to prevent it. closeModal() now also calls
// resetValidation('replacementDefaultId'); this reproduces the failing sequence end to end
// (save() refused inside the modal, THEN cancel) rather than only setActive() with the modal
// already closed, which is what the two tests above already cover.
// =====================================================================

test('cancelling the modal after a refused save clears the stale error from the page-level outlet', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $default = SalesRegion::factory()->isDefault()->create(['name' => 'España (Península)']);

    $component = Livewire::test(Index::class)
        ->call('openEditModal', $default->id)
        ->set('active', false)
        ->set('replacementDefaultId', '')
        ->call('save')
        ->assertHasErrors(['replacementDefaultId'])
        ->assertSet('showModal', true);

    $message = __('sales-regions.errors.default_deactivation_requires_replacement');

    // While the modal is still open (the refusal above never reached closeModal()), the
    // field-level error is the only rendering of the message -- the page-level outlet must stay
    // silent, per the existing "renders exactly once when the modal is open" contract.
    expect(substr_count($component->html(), $message))->toBe(1);

    $component->call('closeModal');

    expect($component->get('showModal'))->toBeFalse()
        ->and(substr_count($component->html(), $message))->toBe(0);

    expect($default->fresh()->is_active)->toBeTrue()
        ->and($default->fresh()->is_default)->toBeTrue();
});

test('an orphaned replacementDefaultId refusal renders exactly once when the modal is open', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $default = SalesRegion::factory()->isDefault()->create(['name' => 'España (Península)']);

    // Open the modal first (on the same row), so $showModal stays true across the setActive()
    // call below -- setActive() never touches it.
    $component = Livewire::test(Index::class)
        ->call('openEditModal', $default->id)
        ->assertSet('showModal', true)
        ->call('setActive', $default->id, false, '');

    $message = __('sales-regions.errors.default_deactivation_requires_replacement');

    // @unless ($showModal) means the page-level outlet must NOT also render it while the modal
    // (which shows its own copy, via the field-level error) is open -- exactly once, never twice.
    expect(substr_count($component->html(), $message))->toBe(1);
});

// =====================================================================
// Test 11 -- Phase 4 finding F-1's regression guard. Every id in $this->regions must have exactly
// one edit-region-{id} hook on the page, regardless of its own or its parent's isActive state.
// F-1 was an inactive PARENT (España) dropping its whole children group -- including whichever
// child held is_default and every configured rate -- from BOTH tables at once. A test naming
// España specifically would only catch that one shape again; asserting this as a blanket
// row-count invariant over an arbitrary, deliberately-mixed-activity tree closes the whole class
// (an inactive parent, an inactive childless country, an inactive default-holding child, all
// mixed with active siblings) rather than one instance of it.
// =====================================================================

test('every region in the component state renders exactly one edit control, regardless of its own or its parents active state', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    // Deliberately inactive PARENT with children -- the exact shape F-1 dropped entirely.
    $espana = SalesRegion::factory()->create(['name' => 'España', 'is_active' => false]);
    $default = SalesRegion::factory()->fiscalTerritoryOf($espana)->isDefault()->create(['name' => 'Península']);
    $inactiveChild = SalesRegion::factory()->fiscalTerritoryOf($espana)->inactive()->create(['name' => 'Canarias']);

    // A childless country, active and inactive, as a control group.
    $activeCountry = SalesRegion::factory()->create(['name' => 'Portugal', 'is_active' => true]);
    $inactiveCountry = SalesRegion::factory()->create(['name' => 'Andorra', 'is_active' => false]);

    $component = Livewire::test(Index::class);
    $html = $component->html();

    $regionIds = collect($component->get('regions'))->pluck('id')
        ->merge([$espana->id, $default->id, $inactiveChild->id, $activeCountry->id, $inactiveCountry->id])
        ->unique();

    foreach ($regionIds as $id) {
        expect(substr_count($html, 'data-test="edit-region-'.$id.'"'))
            ->toBe(1, "Region {$id} must render exactly one edit-region-{$id} control.");
    }
});

// =====================================================================
// Phase 5 code review finding N2: sales-regions.index.empty existed in both lang files with no
// consumer anywhere in the markup -- unreachable in production (0016's seeder always populates
// ~254 rows), but still wired up in the view for the same reason roles.blade.php wires up its
// own, and worth a component-level test since no seeder runs here at all.
// =====================================================================

test('an empty catalog renders the empty-state message and no table', function () {
    $actor = salesRegionsIndexRenderingTestActor();
    $this->actingAs($actor);

    $html = Livewire::test(Index::class)->html();

    expect($html)->toContain(__('sales-regions.index.empty'))
        ->and($html)->not->toContain('<table');
});
