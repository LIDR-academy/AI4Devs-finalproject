<?php

// Real-browser coverage for App\Livewire\Shipping\Zones, per
// ai-spec/tasks/0034-shipping-zones-ui.md's "Tests to perform" section.
//
// This file also discharges story 0022's forward Definition-of-Done obligation: at least one
// browser test exercising SearchableMultiSelect in its REAL embedding, with a REAL Eloquent-backed
// resolver (App\Actions\Shipping\SearchGeographyEntries), inside a flux:modal -- 0022 could only
// test the shell in a vacuum against a fake double.
//
// The single most dangerous gap a naive plan here would walk into: Livewire::test()->set(...)
// cannot prove the picker works in a browser (the null-<select> desync precedent in
// docs/errors-log.md is exact -- set() never touches a DOM element at all). The assign-by-typing
// test below drives the control the way a person does (real typing, real click on a real result
// row) and asserts PERSISTED, server-side coverage after a page reload -- never a rendered chip
// alone, which would only prove the client-side echo worked.

use App\Actions\NormalizeForSearch;
use App\Models\GeographyEntry;
use App\Models\ShippingZone;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

function shippingZonesBrowserActor(): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo(['shipping.view', 'shipping.create', 'shipping.edit', 'shipping.delete']);

    return $actor;
}

// Phase 5 code-review finding L-2: expressed as a dataset over the PRD's own three geography
// levels, per gherkin-guidelines.md's Scenario Outline rule -- the task file's own Gherkin
// carries this as a Scenario Outline (D-4/AC 6), and the shipped test previously drove only the
// municipio branch, leaving country/comunidad-autónoma assignment entirely browser-unverified.
test('assign a geography entry by really typing and really clicking, and it survives a reload', function (string $level, string $searchTerm) {
    $actor = shippingZonesBrowserActor();
    $this->actingAs($actor);

    $zone = ShippingZone::factory()->create(['name' => 'Zona Norte']);

    $country = GeographyEntry::factory()->create(['name' => 'España', 'normalized_name' => app(NormalizeForSearch::class)('España')]);
    $community = GeographyEntry::factory()->community($country)->create(['name' => 'Asturias', 'normalized_name' => app(NormalizeForSearch::class)('Asturias')]);

    $entry = match ($level) {
        'country' => GeographyEntry::factory()->create(['name' => 'Francia', 'normalized_name' => app(NormalizeForSearch::class)('Francia')]),
        'community' => GeographyEntry::factory()->community($country)->create(['name' => 'Galicia', 'normalized_name' => app(NormalizeForSearch::class)('Galicia')]),
        'municipality' => GeographyEntry::factory()->municipality($community)->create(['name' => 'Gijón', 'normalized_name' => app(NormalizeForSearch::class)('Gijón'), 'province_name' => 'Asturias']),
    };

    $page = visit(route('shipping.zones.index'))->assertNoJavaScriptErrors();

    $page->click('@edit-zone-'.$zone->id)
        ->assertNoJavaScriptErrors()
        ->fill('@searchable-multi-select-search', $searchTerm)
        ->wait(1)
        ->click('@searchable-multi-select-option-'.$entry->id)
        ->assertNoJavaScriptErrors()
        ->assertVisible('@searchable-multi-select-chip-'.$entry->id)
        ->click('@save-zone-button')
        ->assertNoJavaScriptErrors()
        ->wait(1);

    expect($zone->fresh()->geographyEntries()->pluck('id')->all())->toBe([$entry->id]);

    // Reload and re-open the editor -- the coverage must render on FIRST paint, not only survive
    // in the still-open component.
    $page = visit(route('shipping.zones.index'))->assertNoJavaScriptErrors();

    $page->click('@edit-zone-'.$zone->id)
        ->assertNoJavaScriptErrors()
        ->assertVisible('@searchable-multi-select-chip-'.$entry->id);
})->with([
    'the country "Francia"' => ['country', 'Francia'],
    'the autonomous community "Galicia"' => ['community', 'Galicia'],
    'the municipio "Gijón"' => ['municipality', 'Gijon'],
]);

test('removing an assigned entry drops it from coverage, and it becomes offerable again', function () {
    $actor = shippingZonesBrowserActor();
    $this->actingAs($actor);

    $zone = ShippingZone::factory()->create(['name' => 'Zona Norte']);
    $entry = GeographyEntry::factory()->create([
        'name' => 'Gijón',
        'normalized_name' => app(NormalizeForSearch::class)('Gijón'),
        'province_name' => 'Asturias',
    ]);
    $zone->geographyEntries()->attach($entry->id);

    $page = visit(route('shipping.zones.index'))->assertNoJavaScriptErrors();

    $page->click('@edit-zone-'.$zone->id)
        ->assertNoJavaScriptErrors()
        ->assertVisible('@searchable-multi-select-chip-'.$entry->id)
        ->click('@searchable-multi-select-chip-remove-'.$entry->id)
        ->assertNoJavaScriptErrors()
        ->assertMissing('@searchable-multi-select-chip-'.$entry->id)
        ->fill('@searchable-multi-select-search', 'Gijon')
        ->wait(1)
        ->assertVisible('@searchable-multi-select-option-'.$entry->id);
});

test('the geography picker shows an empty state with no way to add a new catalog entry', function () {
    $actor = shippingZonesBrowserActor();
    $this->actingAs($actor);

    $zone = ShippingZone::factory()->create();

    $page = visit(route('shipping.zones.index'))->assertNoJavaScriptErrors();

    // Phase 5 code-review finding L-3: a page-wide assertDontSee('Create') passes by
    // coincidence here (the edit modal's own heading is "Edit shipping zone", never
    // "Create..."), not because the picker's empty state specifically offers no affordance --
    // scoped instead to the empty-state element itself, asserting it contains no clickable
    // button or link of any kind.
    $page->click('@edit-zone-'.$zone->id)
        ->assertNoJavaScriptErrors()
        ->fill('@searchable-multi-select-search', 'Xyznonexistentplace')
        ->wait(1)
        ->assertVisible('@searchable-multi-select-empty-state')
        ->assertScript(
            'document.querySelector(\'[data-test="searchable-multi-select-empty-state"]\').querySelector(\'button, a\') === null',
            true,
        );
});

test('the full create, rename and delete journey through real clicks', function () {
    $actor = shippingZonesBrowserActor();
    $this->actingAs($actor);

    $page = visit(route('shipping.zones.index'))->assertNoJavaScriptErrors();

    $page->click('@new-zone-button')
        ->assertNoJavaScriptErrors()
        ->fill('@zone-name-input', 'Zona Norte')
        ->click('@save-zone-button')
        ->assertNoJavaScriptErrors()
        ->wait(1)
        ->assertSee('Zona Norte');

    $zone = ShippingZone::where('name', 'Zona Norte')->firstOrFail();

    $page->click('@edit-zone-'.$zone->id)
        ->assertNoJavaScriptErrors()
        ->fill('@zone-name-input', 'Cornisa Cantábrica')
        ->click('@save-zone-button')
        ->assertNoJavaScriptErrors()
        ->wait(1)
        ->assertSee('Cornisa Cantábrica');

    $page->click('@delete-zone-'.$zone->id)
        ->assertNoJavaScriptErrors()
        ->click('@confirm-delete-zone-button')
        ->assertNoJavaScriptErrors()
        ->wait(1)
        ->assertDontSee('Cornisa Cantábrica');

    expect(ShippingZone::find($zone->id))->toBeNull();
});
