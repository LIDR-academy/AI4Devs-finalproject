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

    visit('/taxes/sales-regions')
        ->assertNoJavaScriptErrors()
        ->click('@edit-region-'.$oldDefault->id)
        ->assertNoJavaScriptErrors()
        ->click('@modal-active-switch')
        ->assertNoJavaScriptErrors()
        ->select('replacementDefaultId', 'Portugal')
        ->click('Save')
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

    visit('/taxes/sales-regions')
        ->assertNoJavaScriptErrors()
        ->click('@edit-region-'.$default->id)
        ->assertNoJavaScriptErrors()
        ->click('@modal-active-switch')
        ->assertNoJavaScriptErrors()
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

    visit('/taxes/sales-regions')
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

    // Genuinely inert: a click on a disabled control must not reach the server at all.
    expect(SalesRegion::count())->toBe($countBefore)
        ->and($region->fresh()->code)->toBeNull();
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

    visit('/taxes/sales-regions')
        ->assertNoJavaScriptErrors()
        ->click('@show-all-countries-toggle')
        ->assertNoJavaScriptErrors()
        ->fill('@show-all-countries-filter', 'Francia')
        ->assertNoJavaScriptErrors()
        ->assertSee('Francia')
        ->click('@toggle-active-region-'.$francia->id)
        ->assertNoJavaScriptErrors()
        // A1-a: the row moving into the active section is the confirmation the click took
        // effect -- no stability hack keeps it inside the collapsed section.
        ->assertSee('Francia')
        // A1-b: the disclosure state and the filter text must both survive the round trip.
        ->assertVisible('@show-all-countries-filter')
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
