<?php

// RED-phase Pest 4 browser tests for the Sales Regions screen, per
// ai-spec/tasks/in-progress/0018-sales-region-tax-configuration-ui.md's "Browser --
// tests/Browser/SalesRegionsIndexTest.php" bullets (tests 10-17, current numbering after the
// task file's Phase 2 reconciliation -- F-11 corrected A1-b's own cross-reference to "test 16",
// not 17, which is the assertNoJavaScriptErrors() sweep below).
//
// As of this writing resources/views/livewire/sales-regions.blade.php is still 0017's
// placeholder (`<p>{{ count($regions) }}</p>`), so EVERY test here is expected to fail (RED):
// on a missing element/selector/assertSee, never on a fatal PHP error -- the route
// (taxes/sales-regions), App\Livewire\SalesRegions\Index and its actions are already fully
// implemented and tested (story 0017, done).
//
// Grounded in: app/Livewire/SalesRegions/Index.php's real public interface (mount()/
// openEditModal()/save()/closeModal()/setDefault()/setActive()), route sales-regions.index
// (GET /taxes/sales-regions, auth + verified + can:sales-regions.view), and D1/D2/D3/D4/D5/D8's
// markup contract for resources/views/livewire/sales-regions.blade.php, which does not exist
// yet.
//
// setActive()'s real signature has NO default for $replacementDefaultId (see
// app/Livewire/SalesRegions/Index.php's own docblock) -- every direct component call in
// tests/Feature/SalesRegions/IndexRenderingTest.php passes all three arguments explicitly. That
// constraint does not reach this file directly (every mutation here is driven through the real
// rendered controls, never ->call()), but it is why the inline row switch's own wire:click, once
// Phase 3.2 writes it, must do the same.
//
// SELECTOR STRATEGY: D8's four row hooks (edit-region-{id} / toggle-active-region-{id} /
// set-default-region-{id} / expand-region-{id}) are present on both the enabled and the disabled
// branch of each control, exactly as the Users/Roles screens established -- targeted here via
// click('@edit-region-'.$id) etc. Two hooks this file assumes because the task file leaves them
// to Phase 3.2 (flagged here, same convention tests/Browser/RolesIndexTest.php's own selector
// strategy note uses for its permission-checkbox accessible name -- adjust here first if the
// real markup names them differently):
//   - `data-test="modal-active-switch"` on the edit modal's own $active flux:switch (D4/D5) --
//     distinct from the per-row toggle-active-region-{id} switch, since D4 requires disabling
//     the CURRENT DEFAULT to go only through this modal control, never the row one.
//   - `data-test="show-all-countries-toggle"` / `data-test="show-all-countries-filter"` for
//     Q1(a)'s collapsed-inactive-countries section and its text filter.
//
// The rate/code/description modal inputs are targeted by property name (fill('rate', ...) etc.),
// the same convention tests/Browser/UsersIndexTest.php uses for fill('name', ...) --
// GuessLocator resolves a bare selector against [id="rate"]/[name="rate"] before falling back to
// text, which is what a Flux flux:input's wire:model="rate" binding produces. "Save" and
// "Cancel" are assumed as real, visible button text, following the identical Users/Roles
// precedent -- the first thing to adjust here if Phase 3.2's copy differs.

use App\Models\SalesRegion;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function salesRegionsBrowserTestActor(array $permissions = ['sales-regions.view', 'sales-regions.edit']): User
{
    $actor = User::factory()->create();

    if ($permissions !== []) {
        $actor->givePermissionTo($permissions);
    }

    return $actor;
}

// =====================================================================
// Test 10 -- the decimal comma, through the real input. The only test in the project that can
// catch D1: with type="number" the comma never reaches the wire payload, and
// Livewire::test()->set('rate', '21,5') writes the property directly, so it passes on the
// broken markup.
// =====================================================================

test('a rate typed with a decimal comma is accepted through the real input and shown in the list', function () {
    $actor = salesRegionsBrowserTestActor();
    $this->actingAs($actor);

    $region = SalesRegion::factory()->create(['name' => 'Canarias', 'rate' => null]);

    visit('/taxes/sales-regions')
        ->assertNoJavaScriptErrors()
        ->click('@edit-region-'.$region->id)
        ->assertNoJavaScriptErrors()
        ->fill('rate', '21,5')
        ->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertSee('21.5%');

    expect($region->fresh()->rate)->toBe('21.500');
});

// =====================================================================
// Test 11 -- the atomic default swap through the real replacement <select>. Retires exactly the
// bug class errors-log documents: whether a real click delivers the value to a wire:model-bound
// property at all.
// =====================================================================

test('disabling the default while naming a replacement through the real select updates both rows atomically', function () {
    $actor = salesRegionsBrowserTestActor();
    $this->actingAs($actor);

    $oldDefault = SalesRegion::factory()->isDefault()->create(['name' => 'España (Península)']);
    $replacement = SalesRegion::factory()->create(['name' => 'Portugal', 'is_active' => true, 'is_default' => false]);

    // The switch is bound via wire:click="$toggle('active')" (a real Livewire action call, see
    // the markup's own comment) rather than wire:model: a bare wire:model left the DOM's own
    // wire:snapshot attribute -- the ground truth of what the NEXT request will send -- stuck at
    // the pre-click value under real-browser Playwright automation in this environment, confirmed
    // by reading that attribute directly rather than by inferring it from a flaky run.
    //
    // ->waitForEvent('networkidle') was tried and DISCARDED here, not used: in this environment it
    // does not reliably settle (observed hanging for 15+ minutes before Pest's own action-level
    // timeout finally fired) -- consistent with Playwright's own upstream guidance against relying
    // on networkidle. A bounded ->wait() is the deliberately chosen, bounded-worst-case option.
    //
    // ⚠️ Known residual flakiness, recorded honestly rather than hidden: this story's own
    // investigation additionally found that the replacement <flux:select>'s wire:model binding
    // itself intermittently fails to register a Playwright-driven ->select() under this same
    // real-browser automation -- confirmed by DOM inspection to be a genuine value+event dispatch
    // that the CHECKBOX's fix does not extend to (a select is not an action button; there is no
    // equivalent wire:click-per-option pattern that preserves the task file's flux:select design).
    // A short ->wait() after selecting is the same evidence-based mitigation used by test 12
    // below; it measurably reduces but does not provably eliminate the residual race in this
    // Livewire+Flux+Playwright combination. If this test becomes a recurring source of CI
    // flakiness, the next step is either a Pest-level retry for this one test or replacing the
    // native <flux:select> with a wire:click-per-option control (menu/listbox), matching the
    // checkbox's own fix -- not a longer sleep.
    visit('/taxes/sales-regions')
        ->assertNoJavaScriptErrors()
        ->click('@edit-region-'.$oldDefault->id)
        ->assertNoJavaScriptErrors()
        ->click('@modal-active-switch')
        ->wait(2)
        ->assertNoJavaScriptErrors()
        ->select('replacementDefaultId', 'Portugal')
        ->wait(2)
        ->click('Save')
        ->wait(2)
        ->assertNoJavaScriptErrors();

    expect($oldDefault->fresh()->is_active)->toBeFalse()
        ->and($oldDefault->fresh()->is_default)->toBeFalse()
        ->and($replacement->fresh()->is_active)->toBeTrue()
        ->and($replacement->fresh()->is_default)->toBeTrue()
        ->and(SalesRegion::where('is_default', true)->count())->toBe(1);
});

// =====================================================================
// Test 12 -- attempting the same with the replacement select left at its placeholder is blocked,
// with the message visible on the real page. Confirms the absent pick arrives as '', not some
// other falsy-but-wrong value.
// =====================================================================

test('attempting to disable the default with the replacement select left at its placeholder is blocked, visibly', function () {
    $actor = salesRegionsBrowserTestActor();
    $this->actingAs($actor);

    $default = SalesRegion::factory()->isDefault()->create(['name' => 'España (Península)']);

    // See test 11's identical comment: a short wait after the switch click before Save is a
    // deliberate, evidence-based addition closing the same wire:model timing race.
    visit('/taxes/sales-regions')
        ->assertNoJavaScriptErrors()
        ->click('@edit-region-'.$default->id)
        ->assertNoJavaScriptErrors()
        ->click('@modal-active-switch')
        ->assertNoJavaScriptErrors()
        ->wait(2)
        ->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertSee(__('sales-regions.errors.default_deactivation_requires_replacement'));

    expect($default->fresh()->is_active)->toBeTrue()
        ->and($default->fresh()->is_default)->toBeTrue();
});

// =====================================================================
// Test 13 -- editing rate/description/code through the real modal inputs (fill(), not ->set()),
// saving, and seeing the row update. Retires a wire:model binding typo invisible to component
// tests.
// =====================================================================

test('editing rate, description and code through the real modal inputs updates the row', function () {
    $actor = salesRegionsBrowserTestActor();
    $this->actingAs($actor);

    $region = SalesRegion::factory()->create([
        'name' => 'Francia',
        'code' => null,
        'description' => null,
        'rate' => null,
    ]);

    visit('/taxes/sales-regions')
        ->assertNoJavaScriptErrors()
        ->click('@edit-region-'.$region->id)
        ->assertNoJavaScriptErrors()
        ->fill('code', 'FR')
        ->fill('description', 'Standard mainland rate')
        ->fill('rate', '20')
        ->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertSee('FR')
        ->assertSee('Standard mainland rate')
        ->assertSee('20%');

    expect($region->fresh()->code)->toBe('FR')
        ->and($region->fresh()->description)->toBe('Standard mainland rate')
        ->and($region->fresh()->rate)->toBe('20.000');
});

// =====================================================================
// Test 14 -- collapsing and re-expanding "España" hides and re-shows exactly its five
// territories, with "España" itself still visible. The interactive half of D3; pure Alpine
// state, untestable at component level.
// =====================================================================

test('collapsing and re-expanding españa hides and re-shows exactly its five fiscal territories', function () {
    $actor = salesRegionsBrowserTestActor();
    $this->actingAs($actor);

    $espana = SalesRegion::factory()->create(['name' => 'España']);
    collect(['Península', 'Baleares', 'Canarias', 'Ceuta', 'Melilla'])
        ->each(fn (string $name) => SalesRegion::factory()->fiscalTerritoryOf($espana)->create(['name' => $name]));

    visit('/taxes/sales-regions')
        ->assertNoJavaScriptErrors()
        ->assertSee('España')
        ->assertSee('Península')
        ->assertSee('Melilla')
        ->click('@expand-region-'.$espana->id)
        ->assertNoJavaScriptErrors()
        ->assertSee('España')
        ->assertDontSee('Península')
        ->assertDontSee('Melilla')
        ->click('@expand-region-'.$espana->id)
        ->assertNoJavaScriptErrors()
        ->assertSee('Península')
        ->assertSee('Melilla');
});

// =====================================================================
// Test 15 -- a tax-auditor session: disabled controls are genuinely inert under real pointer
// interaction, and hovering one surfaces the not-allowed tooltip and cursor -- mirroring
// UsersIndexTest.php's elementFromPoint-informed hover check, since the same
// pointer-events-none trap applies here.
// =====================================================================

test('a tax auditor session leaves row controls genuinely inert, and hovering a disabled control shows the not-allowed tooltip', function () {
    $auditor = salesRegionsBrowserTestActor(['sales-regions.view']);
    $this->actingAs($auditor);

    $region = SalesRegion::factory()->create(['name' => 'Portugal', 'is_active' => true, 'is_default' => false]);
    $countBefore = SalesRegion::count();
    // SalesRegionFactory's definition() always sets a random code
    // (strtoupper(fake()->unique()->lexify('??'))) -- it is never null by
    // default, so "genuinely inert" is proven by the value staying
    // UNCHANGED across the interaction, not by it becoming null (which it
    // never was to begin with).
    $codeBefore = $region->code;

    $page = visit('/taxes/sales-regions')
        ->assertNoJavaScriptErrors()
        ->assertSee('Portugal')
        // The row action is icon-only/switch-shaped and disabled with pointer-events: none
        // (Flux's own default class), so hovering the control itself would time out on
        // Playwright's actionability check -- the wrapping <ui-tooltip> is what actually
        // listens for the hover, mirroring tests/Browser/UsersIndexTest.php's identical
        // reasoning for the Users screen's row actions.
        ->hover('ui-tooltip:has([data-test="edit-region-'.$region->id.'"])')
        ->assertSee(__('sales-regions.index.action_not_allowed'))
        ->assertNoJavaScriptErrors();

    // Phase 5 code review finding B2: a real mouse click can never even reach this button --
    // pointer-events: none means Playwright's own actionability check refuses to target it, the
    // same reason the hover above targets the <ui-tooltip> wrapper instead of the button. That
    // makes "assert nothing happened after clicking" untestable via a real pointer click, so this
    // proves inertness the way it is actually guaranteed: the disabled branch's markup (see
    // sales-regions.blade.php's edit-region-{id} @else branch) never renders a `wire:click`
    // attribute at all. Dispatching the DOM's native .click() bypasses Playwright's hit-testing
    // entirely, which is deliberate here -- it is the closest a test can get to "an attacker
    // scripts a click directly", and Livewire's delegated listener finds no wire:click to act on
    // regardless, so even that cannot reach the server.
    $page->script('document.querySelector(\'[data-test="edit-region-'.$region->id.'"]\').click();');

    // Genuinely inert: a forced click on the disabled control must not reach the server at all.
    expect(SalesRegion::count())->toBe($countBefore)
        ->and($region->fresh()->code)->toBe($codeBefore);
});

// =====================================================================
// Test 16 -- the collapsed section survives a round trip (Q1, addition A1-b). Open "Show all
// countries", type into the filter, activate a country with its inline switch, then assert the
// section is still open, the filter still holds what was typed, and the activated row has moved
// into the active section.
// =====================================================================

test('the "show all countries" section stays open with its filter text after activating an entry inline', function () {
    $actor = salesRegionsBrowserTestActor();
    $this->actingAs($actor);

    $francia = SalesRegion::factory()->inactive()->create(['name' => 'Francia']);
    SalesRegion::factory()->inactive()->count(2)->create();
    $inactiveCountBefore = SalesRegion::query()->whereNull('parent_id')->where('is_active', false)->count();

    $page = visit('/taxes/sales-regions')
        ->assertNoJavaScriptErrors()
        ->click('@show-all-countries-toggle')
        ->assertNoJavaScriptErrors()
        ->fill('@show-all-countries-filter', 'Francia')
        ->assertNoJavaScriptErrors()
        ->assertSee('Francia');

    // Phase 5 code review finding N4: the "show all countries (N)" toggle's own live count is
    // what the "moved into the active section" claim was missing -- assertSee('Francia') alone
    // cannot distinguish "still inside the collapsed/filtered section" from "now rendered
    // elsewhere on the page", since Francia's name appears in both cases. Read via ->text() (a
    // plain textContent() fetch), not assertSeeIn()'s getByText() locator -- immaterial here, but
    // kept for parity with the after-click read below, where it mattered (see that comment).
    expect((string) $page->text('@show-all-countries-toggle'))->toContain('('.$inactiveCountBefore.')');

    $page->click('@toggle-active-region-'.$francia->id)
        ->assertNoJavaScriptErrors()
        // A bounded wait here is a second, independent mitigation on top of the real fix below --
        // this exact assertion still failed intermittently in a full, 899-test unscoped run (heavier
        // system load / more concurrent browser activity than an isolated --filter run) even after
        // the compile bug was fixed, while --filter=SalesRegions passed 125/125 on its own. Kept
        // short and bounded, matching this story's own Phase 3 precedent for the same class of
        // real-browser timing sensitivity under load rather than treated as fully eliminated.
        ->wait(1);

    // A1-a: the collapsed section's own count decrementing by exactly one is proof the row left
    // it -- no stability hack keeps it inside the collapsed section. This assertion is what
    // caught a REAL bug during this story's Phase 5 pass: an earlier attempt at N8 (unify on
    // @js() for consistency) silently broke this exact wire:click -- two @js(...) directives
    // inside one flux: component tag's attribute string do not compile, leaving the literal,
    // unprocessed "@js($region['id'])" text in the rendered attribute, so every click here was a
    // no-op with no console error. Isolated by comparing this test's failure against a direct
    // Livewire::test()->call('setActive', ...) call (which worked), then confirmed by dumping the
    // real compiled HTML -- see resources/views/livewire/sales-regions.blade.php's own comment at
    // this wire:click for the fix (docs/errors-log.md has the full writeup). Do not re-attempt the
    // @js() conversion here.
    expect((string) $page->text('@show-all-countries-toggle'))->toContain('('.($inactiveCountBefore - 1).')');

    // A1-b: the disclosure state and the filter text must both survive the round trip.
    $page->assertVisible('@show-all-countries-filter')
        ->assertValue('@show-all-countries-filter', 'Francia')
        ->assertNoJavaScriptErrors();

    expect($francia->fresh()->is_active)->toBeTrue();
});

// =====================================================================
// Test 17 -- assertNoJavaScriptErrors() on load and after every interaction above, per
// test-quality-checklist.md, exercised here as one continuous smoke pass distinct from the
// behaviour-specific tests above.
// =====================================================================

test('the sales regions screen produces no javascript errors on load and on every modal, expand and filter interaction', function () {
    $actor = salesRegionsBrowserTestActor();
    $this->actingAs($actor);

    $espana = SalesRegion::factory()->create(['name' => 'España']);
    SalesRegion::factory()->fiscalTerritoryOf($espana)->create(['name' => 'Península', 'is_default' => true, 'is_active' => true]);
    $inactiveCountry = SalesRegion::factory()->inactive()->create(['name' => 'Francia']);

    visit('/taxes/sales-regions')
        ->assertNoJavaScriptErrors()
        ->click('@expand-region-'.$espana->id)
        ->assertNoJavaScriptErrors()
        ->click('@expand-region-'.$espana->id)
        ->assertNoJavaScriptErrors()
        ->click('@edit-region-'.$espana->id)
        ->assertNoJavaScriptErrors()
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->click('@show-all-countries-toggle')
        ->assertNoJavaScriptErrors()
        ->fill('@show-all-countries-filter', 'Fran')
        ->assertNoJavaScriptErrors()
        ->click('@toggle-active-region-'.$inactiveCountry->id)
        ->assertNoJavaScriptErrors();
});
