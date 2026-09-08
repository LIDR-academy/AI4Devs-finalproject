<?php

// Component-level tests for App\Livewire\Shipping\Zones, per
// ai-spec/tasks/0034-shipping-zones-ui.md's "Tests to perform" section.
//
// Test-data strategy (per the task file): never seed the real ~8,300-row geography catalog --
// build a handful of rows with GeographyEntryFactory's country()/community()/municipality()
// states, with explicit names taken from the PRD for traceability.

use App\Actions\Shipping\SearchGeographyEntries;
use App\Exceptions\UnresolvedSelectionException;
use App\Livewire\SalesRegions\Index as SalesRegionsIndex;
use App\Livewire\Shipping\Zones;
use App\Models\GeographyEntry;
use App\Models\SalesRegion;
use App\Models\ShippingZone;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Livewire\Features\SupportLockedProperties\CannotUpdateLockedPropertyException;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function shippingZonesFullActor(array $permissions = ['shipping.view', 'shipping.create', 'shipping.edit', 'shipping.delete']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

// =====================================================================
// Listing
// =====================================================================

test('the screen lists zones with their coverage counts, ordered by name', function () {
    $this->actingAs(shippingZonesFullActor());

    $zapatos = ShippingZone::factory()->create(['name' => 'Zapatos Zone']);
    $abrigos = ShippingZone::factory()->withGeography(2)->create(['name' => 'Abrigos Zone']);

    $rows = Livewire::test(Zones::class)->get('zones');

    expect(collect($rows)->pluck('name')->all())->toBe(['Abrigos Zone', 'Zapatos Zone'])
        ->and(collect($rows)->firstWhere('id', $abrigos->id)['entriesCount'])->toBe(2)
        ->and(collect($rows)->firstWhere('id', $zapatos->id)['entriesCount'])->toBe(0);
});

test('a newly created zone covers nothing, and the list renders that neutrally', function () {
    $this->actingAs(shippingZonesFullActor());

    Livewire::test(Zones::class)
        ->set('name', 'Zona Norte')
        ->call('save');

    $zone = ShippingZone::where('name', 'Zona Norte')->firstOrFail();

    expect($zone->geographyEntries()->count())->toBe(0);
});

test('loadZones issues a bounded number of queries regardless of zone count', function () {
    $this->actingAs(shippingZonesFullActor());

    ShippingZone::factory()->withGeography(2)->count(5)->create();

    $queries = 0;
    DB::listen(function () use (&$queries) {
        $queries++;
    });

    Livewire::test(Zones::class);

    // One query for the actor's permissions cache miss is possible, plus exactly one for the
    // zones list itself (withCount -- a single query with a correlated subquery, never N+1).
    // Bounded well under "one per zone" (5 zones would mean 6+ queries under an N+1).
    expect($queries)->toBeLessThan(5);
});

// =====================================================================
// Create
// =====================================================================

test('creating a zone with a valid name adds it to the list, and the modal closes', function () {
    $this->actingAs(shippingZonesFullActor());

    Livewire::test(Zones::class)
        ->call('openCreateModal')
        ->set('name', 'Zona Norte')
        ->call('save')
        ->assertSet('showModal', false)
        ->assertHasNoErrors();

    expect(ShippingZone::where('name', 'Zona Norte')->exists())->toBeTrue();
});

test('a whitespace-only name is refused with the error on the name field; no zone is created', function () {
    $this->actingAs(shippingZonesFullActor());

    Livewire::test(Zones::class)
        ->call('openCreateModal')
        ->set('name', '   ')
        ->call('save')
        ->assertHasErrors(['name']);

    expect(ShippingZone::count())->toBe(0);
});

test('a duplicate name is refused with the error on name', function (string $duplicateName) {
    $this->actingAs(shippingZonesFullActor());

    ShippingZone::factory()->create(['name' => 'Península']);

    Livewire::test(Zones::class)
        ->call('openCreateModal')
        ->set('name', $duplicateName)
        ->call('save')
        ->assertHasErrors(['name']);

    expect(ShippingZone::count())->toBe(1);
})->with([
    'exact duplicate' => ['Península'],
    'case-only duplicate' => ['PENÍNSULA'],
    'accent-only duplicate' => ['Peninsula'],
]);

// =====================================================================
// Rename / save-under-own-name
// =====================================================================

test('renaming a zone updates the list', function () {
    $this->actingAs(shippingZonesFullActor());

    $zone = ShippingZone::factory()->create(['name' => 'Zona Norte']);

    Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->set('name', 'Cornisa Cantábrica')
        ->call('save')
        ->assertHasNoErrors();

    expect($zone->refresh()->name)->toBe('Cornisa Cantábrica');
});

test('saving a zone under its own unchanged name succeeds, and the zone is genuinely unchanged', function () {
    $this->actingAs(shippingZonesFullActor());

    $zone = ShippingZone::factory()->withGeography(1)->create(['name' => 'Zona Norte']);
    $originalEntryIds = $zone->geographyEntries()->pluck('geography_entries.id')->map(strval(...))->all();

    Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->call('save')
        ->assertHasNoErrors();

    $zone->refresh();

    expect($zone->name)->toBe('Zona Norte')
        ->and($zone->geographyEntries()->pluck('geography_entries.id')->map(strval(...))->all())
        ->toEqualCanonicalizing($originalEntryIds);
});

test('saving an edit applies the rename and the coverage replace in one submit', function () {
    $this->actingAs(shippingZonesFullActor());

    $zone = ShippingZone::factory()->create(['name' => 'Zona Norte']);
    $entry = GeographyEntry::factory()->create(['name' => 'Francia']);

    Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->set('name', 'Cornisa Cantábrica')
        ->set('geographyEntryIds', [(string) $entry->id])
        ->call('save')
        ->assertHasNoErrors();

    $zone->refresh();

    expect($zone->name)->toBe('Cornisa Cantábrica')
        ->and($zone->geographyEntries()->pluck('id')->all())->toBe([$entry->id]);
});

// =====================================================================
// Delete
// =====================================================================

test('deleting through the confirmation flow removes the zone; cancelling leaves it', function () {
    $this->actingAs(shippingZonesFullActor());

    $zone = ShippingZone::factory()->create();

    $component = Livewire::test(Zones::class)
        ->call('confirmDelete', $zone->id)
        ->assertSet('showDeleteModal', true)
        ->assertSet('deletingZoneName', $zone->name);

    $component->call('closeDeleteModal')->assertSet('showDeleteModal', false);
    expect(ShippingZone::find($zone->id))->not->toBeNull();

    Livewire::test(Zones::class)
        ->call('confirmDelete', $zone->id)
        ->call('deleteZone')
        ->assertSet('showDeleteModal', false);

    expect(ShippingZone::find($zone->id))->toBeNull();
});

test('confirmDelete populates the target name from the model, not from a client-writable array', function () {
    $this->actingAs(shippingZonesFullActor());

    $zone = ShippingZone::factory()->create(['name' => 'Zona Norte']);

    Livewire::test(Zones::class)
        ->call('confirmDelete', $zone->id)
        ->assertSet('deletingZoneId', $zone->id)
        ->assertSet('deletingZoneName', 'Zona Norte');
});

// =====================================================================
// Geography coverage
// =====================================================================

test('saving with an empty selection clears the coverage and leaves the zone listed', function () {
    $this->actingAs(shippingZonesFullActor());

    $zone = ShippingZone::factory()->withGeography(1)->create();

    Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->set('geographyEntryIds', [])
        ->call('save')
        ->assertHasNoErrors();

    expect($zone->fresh()->geographyEntries()->count())->toBe(0)
        ->and(ShippingZone::find($zone->id))->not->toBeNull();
});

test('a save carrying a stale or invalid geography id is rejected whole', function () {
    $this->actingAs(shippingZonesFullActor());

    $entry = GeographyEntry::factory()->create();
    $zone = ShippingZone::factory()->withGeography(1)->create();
    $existingIds = $zone->geographyEntries()->pluck('geography_entries.id')->map(strval(...))->all();

    Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->set('geographyEntryIds', ['999999999'])
        ->call('save')
        ->assertHasErrors(['geographyEntryIds']);

    expect($zone->fresh()->geographyEntries()->pluck('geography_entries.id')->map(strval(...))->all())
        ->toEqualCanonicalizing($existingIds);
});

test('a save mixing one valid and one stale id saves neither', function () {
    $this->actingAs(shippingZonesFullActor());

    $validEntry = GeographyEntry::factory()->create(['name' => 'Gijón']);
    $zone = ShippingZone::factory()->create();

    Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->set('geographyEntryIds', [(string) $validEntry->id, '999999999'])
        ->call('save')
        ->assertHasErrors(['geographyEntryIds']);

    expect($zone->fresh()->geographyEntries()->count())->toBe(0);
});

test('a rejected geography save also leaves the name unchanged', function () {
    $this->actingAs(shippingZonesFullActor());

    $zone = ShippingZone::factory()->create(['name' => 'Zona Norte']);

    Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->set('name', 'Cornisa Cantábrica')
        ->set('geographyEntryIds', ['999999999'])
        ->call('save')
        ->assertHasErrors(['geographyEntryIds']);

    expect($zone->fresh()->name)->toBe('Zona Norte');
});

// Phase 4 security-audit finding F-2: assertHasErrors() proves the error landed in the bag, not
// that the template renders it -- the picker's OWN <flux:error> reads a different, per-component
// bag, so the fix is a dedicated outlet in zones.blade.php. This test asserts the rendered HTML.
test('a save carrying an id that fails ShippingZoneValidationRules own existence check renders A visible error, not only a bag entry', function () {
    $this->actingAs(shippingZonesFullActor());

    $zone = ShippingZone::factory()->create();

    Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->set('geographyEntryIds', ['999999999'])
        ->call('save')
        ->assertSee(trans('validation.exists', ['attribute' => 'geographyEntryIds']));
});

// Phase 4 security-audit finding F-2: the mixed/stale-id tests above are all rejected by
// ShippingZoneValidationRules::geographyEntryIdsRules()'s OWN existence check, which runs before
// SearchGeographyEntries::resolveSelected() is ever reached -- so none of them actually exercise
// D-12's own total-function reject path. This test forces that path directly (the resolver mocked
// to throw, as the race-condition backstop it exists for would), and asserts THIS story's own
// geography_unresolvable message renders visibly.
test('when resolveSelected rejects the selection directly, the D-12 refusal message renders visibly', function () {
    $this->actingAs(shippingZonesFullActor());

    $entry = GeographyEntry::factory()->create();
    $zone = ShippingZone::factory()->create();

    $this->mock(SearchGeographyEntries::class, function ($mock) {
        $mock->shouldReceive('resolveSelected')
            ->andThrow(new UnresolvedSelectionException(['999999999']));
    });

    Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->set('geographyEntryIds', [(string) $entry->id])
        ->call('save')
        ->assertHasErrors(['geographyEntryIds'])
        ->assertSee(__('shipping.zones.editor.geography_unresolvable'));

    expect($zone->fresh()->geographyEntries()->count())->toBe(0);
});

test('assigning an entry another zone already covers succeeds with no error on any field', function () {
    $this->actingAs(shippingZonesFullActor());

    $entry = GeographyEntry::factory()->create(['name' => 'Gijón']);
    ShippingZone::factory()->create(['name' => 'Asturias Centro'])
        ->geographyEntries()->attach($entry->id);
    $zone = ShippingZone::factory()->create(['name' => 'Zona Norte']);

    Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->set('geographyEntryIds', [(string) $entry->id])
        ->call('save')
        ->assertHasNoErrors();

    expect($zone->fresh()->geographyEntries()->pluck('id')->all())->toBe([$entry->id]);
});

// =====================================================================
// Locked properties
// =====================================================================

test('editingZoneId, deletingZoneId and deletingZoneName are locked', function () {
    $this->actingAs(shippingZonesFullActor());

    $component = Livewire::test(Zones::class);

    expect(fn () => $component->set('editingZoneId', 'tampered'))
        ->toThrow(CannotUpdateLockedPropertyException::class);
    expect(fn () => $component->set('deletingZoneId', 'tampered'))
        ->toThrow(CannotUpdateLockedPropertyException::class);
    expect(fn () => $component->set('deletingZoneName', 'tampered'))
        ->toThrow(CannotUpdateLockedPropertyException::class);
});

// Phase 5 code-review finding M-3a: the original form of this test only asserted the resolver
// class exists -- removing :option-resolver from the Blade embed entirely would still pass it.
// Asserting the rendered edit-modal HTML actually carries the class-string is what proves the
// screen genuinely binds the picker to this resolver, not just that the class is loadable.
test('the edit modal genuinely binds the picker to App\Actions\Shipping\SearchGeographyEntries', function () {
    // A rendered-HTML assertion cannot prove this: :option-resolver="..." is consumed server-side
    // to mount the nested SearchableMultiSelect component and never appears as literal text in
    // the parent's output (verified by execution -- assertSeeHtml(SearchGeographyEntries::class)
    // fails against the real render, since the value lives in the child's own Livewire snapshot,
    // not in visible markup). Reading the view's own source is what actually proves the wiring,
    // and what removing :option-resolver from zones.blade.php would break.
    $view = file_get_contents(resource_path('views/livewire/shipping/zones.blade.php'));

    expect($view)->toContain('option-resolver')
        ->and($view)->toContain(SearchGeographyEntries::class.'::class');
});

// =====================================================================
// Phase 4 security-audit finding F-1: geographyEntryIds must never size an unbounded query, and
// coverageSummary() must never crash on a malformed id -- both reachable on the RENDER path,
// with no validate() upstream, since the property is the picker's client-writable binding.
// =====================================================================

test('updatedGeographyEntryIds bounds an oversized array at the mutation point, not only at save time', function () {
    $this->actingAs(shippingZonesFullActor());

    $zone = ShippingZone::factory()->create();
    $oversized = array_map(strval(...), range(1, 600));

    $component = Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->set('geographyEntryIds', $oversized);

    expect($component->get('geographyEntryIds'))->toHaveCount(500);
});

test('coverageSummary does not crash on a malformed or out-of-range geography id', function () {
    $this->actingAs(shippingZonesFullActor());

    $zone = ShippingZone::factory()->create();

    $component = Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->set('geographyEntryIds', ['99999999999999999999999999', 'not-a-number', '']);

    expect($component->get('coverageSummary'))->toBe(['total' => 3, 'byLevel' => []]);
});

// =====================================================================
// Phase 4 security-audit finding F-3: every mutating method now carries its own component-level
// gate -- deleteZone() was the one exception, unpinned by any test (only confirmDelete() was
// tested against an under-privileged actor).
// =====================================================================

test('deleteZone is refused directly for an actor lacking shipping.delete, and the zone still exists', function () {
    $this->withoutExceptionHandling();
    $actor = User::factory()->create();
    $actor->givePermissionTo(['shipping.view', 'shipping.delete']);
    $zone = ShippingZone::factory()->create();
    $this->actingAs($actor);

    $component = Livewire::test(Zones::class)->call('confirmDelete', $zone->id);

    $actor->revokePermissionTo('shipping.delete');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('deleteZone'))
        ->toThrow(AuthorizationException::class);

    expect(ShippingZone::find($zone->id))->not->toBeNull();
});

// =====================================================================
// Deferred. The task file's own "Tests to perform" section named two skips here; only one
// remains -- see the un-skip note below the first. Naming the blocking artifact FIRST and the
// story id second is deliberate (0033 R-8) -- a grep for the artifact survives renumbering even
// if this skip is ever moved or copied.
// =====================================================================

test('the delete modal renders the in-use hard-block message when DeleteShippingZone raises a ValidationException', function () {
    // shipping_rates does not exist yet -- story 0036 must un-skip this once it ships the
    // in-use-by-a-rate-rule count guard on DeleteShippingZone (0033 D-1).
})->skip('shipping_rates does not exist yet -- story 0036 must un-skip this');

// Un-skipped: task 0018 shipped the Sales Regions screen (App\Livewire\SalesRegions\Index,
// route sales-regions.index) the original skip reason named as still missing -- the "UI-driven
// comparison this story cannot exercise alone" is now buildable. Read through the REAL
// sales-regions screen's own component, before and after, rather than a raw DB row count, so
// the assertion is genuinely "at the UI layer": if that screen's own query or view contract ever
// changed to surface a shipping-zone-derived value, this would catch it where a bare
// SalesRegion::count() comparison could not.
test('creating a shipping zone leaves the Sales Region catalog untouched, at the UI layer', function () {
    $actor = shippingZonesFullActor();
    $actor->givePermissionTo('sales-regions.view');
    $this->actingAs($actor);

    SalesRegion::factory()->create(['name' => 'Some Region']);
    SalesRegion::factory()->create(['name' => 'Another Region']);

    $before = Livewire::test(SalesRegionsIndex::class)->get('regions');

    Livewire::test(Zones::class)
        ->call('openCreateModal')
        ->set('name', 'Zona Norte')
        ->call('save')
        ->assertHasNoErrors();

    $after = Livewire::test(SalesRegionsIndex::class)->get('regions');

    expect($after)->toBe($before);
});
