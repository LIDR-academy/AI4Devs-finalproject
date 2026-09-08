<?php

// Authorization tests for App\Livewire\Shipping\Zones -- both the HTTP layer (routes/shipping.php's
// `can:shipping.view` middleware) and the component layer (every mutating method re-authorizing
// independently, since Livewire's /livewire/update endpoint never runs route middleware). Per
// ai-spec/tasks/0034-shipping-zones-ui.md's "Tests to perform" section.

use App\Livewire\Shipping\Zones;
use App\Models\GeographyEntry;
use App\Models\Role;
use App\Models\ShippingZone;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function actorWithShippingPermissions(array $permissions): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

test('GET the shipping zones route is refused without shipping.view', function () {
    $actor = User::factory()->create();
    $this->actingAs($actor);

    $this->get(route('shipping.zones.index'))->assertForbidden();
});

test('GET the shipping zones route succeeds with shipping.view', function () {
    $actor = actorWithShippingPermissions(['shipping.view']);
    $this->actingAs($actor);

    $this->get(route('shipping.zones.index'))->assertOk();
});

test('a user lacking shipping.create cannot open the create modal, and cannot create a zone via the component directly either', function () {
    $this->withoutExceptionHandling();
    $actor = actorWithShippingPermissions(['shipping.view']);
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Zones::class)->call('openCreateModal'))
        ->toThrow(AuthorizationException::class);

    // set('name', ...) directly rather than via openCreateModal(), since that opener is itself
    // gated on 'create' above and would throw before save() is ever reached.
    expect(fn () => Livewire::test(Zones::class)->set('name', 'Zona Norte')->call('save'))
        ->toThrow(AuthorizationException::class);

    expect(ShippingZone::where('name', 'Zona Norte')->exists())->toBeFalse();
});

test('a user lacking shipping.edit cannot open the edit modal, so the geography picker (and SyncShippingZoneGeography behind it) is never reached, and the zone is unchanged', function () {
    $this->withoutExceptionHandling();
    $actor = actorWithShippingPermissions(['shipping.view']);
    $zone = ShippingZone::factory()->create(['name' => 'Zona Norte']);
    GeographyEntry::factory()->create();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Zones::class)->call('openEditModal', $zone->id))
        ->toThrow(AuthorizationException::class);

    expect($zone->fresh()->name)->toBe('Zona Norte')
        ->and($zone->fresh()->geographyEntries()->count())->toBe(0);
});

test('SyncShippingZoneGeography is structurally unreachable from the create branch, even with a tampered geographyEntryIds', function () {
    // D-2: the create modal renders no geography picker at all, and this is a security
    // boundary, not only a UI choice -- geographyEntryIds is deliberately NOT #[Locked]
    // (it is the searchable-multi-select's #[Modelable] binding surface), so a client could
    // still write to it on a create submission. save()'s CREATE branch must never call the
    // sync action regardless.
    $actor = actorWithShippingPermissions(['shipping.view', 'shipping.create']);
    $entry = GeographyEntry::factory()->create();
    $this->actingAs($actor);

    Livewire::test(Zones::class)
        ->call('openCreateModal')
        ->set('name', 'Zona Norte')
        ->set('geographyEntryIds', [(string) $entry->id])
        ->call('save')
        ->assertHasNoErrors();

    $zone = ShippingZone::where('name', 'Zona Norte')->firstOrFail();

    expect($zone->geographyEntries()->count())->toBe(0);
});

test('a user lacking shipping.delete cannot delete a zone, and the zone still exists', function () {
    $this->withoutExceptionHandling();
    $actor = actorWithShippingPermissions(['shipping.view']);
    $zone = ShippingZone::factory()->create();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Zones::class)->call('confirmDelete', $zone->id))
        ->toThrow(AuthorizationException::class);

    expect(ShippingZone::find($zone->id))->not->toBeNull();
});

test('a Super Admin holding no explicit shipping.* grant passes every ability', function () {
    config(['auth.super_admin.email' => null]);

    $actor = User::factory()->create();
    $actor->assignRole(Role::firstOrCreateSuperAdminRole());
    $this->actingAs($actor);

    $zone = ShippingZone::factory()->create(['name' => 'Zona Norte']);

    Livewire::test(Zones::class)
        ->call('openCreateModal')
        ->set('name', 'Zona Sur')
        ->call('save')
        ->assertHasNoErrors();

    Livewire::test(Zones::class)
        ->call('openEditModal', $zone->id)
        ->set('name', 'Zona Norte Renombrada')
        ->call('save')
        ->assertHasNoErrors();

    Livewire::test(Zones::class)
        ->call('confirmDelete', $zone->id)
        ->call('deleteZone');

    expect(ShippingZone::find($zone->id))->toBeNull();
});

test('the screen-level canCreate/canEdit/canDelete flags reflect the acting user\'s permissions', function () {
    $viewOnly = actorWithShippingPermissions(['shipping.view']);
    $this->actingAs($viewOnly);

    Livewire::test(Zones::class)
        ->assertSet('canEdit', false)
        ->assertSet('canDelete', false)
        ->assertSet('canCreate', false);

    $fullActor = actorWithShippingPermissions(['shipping.view', 'shipping.create', 'shipping.edit', 'shipping.delete']);
    $this->actingAs($fullActor);

    Livewire::test(Zones::class)
        ->assertSet('canEdit', true)
        ->assertSet('canDelete', true)
        ->assertSet('canCreate', true);
});

// Phase 5 code-review finding M-3b: the flags test above proves the COMPUTED VALUE is correct,
// not that the disabled branch (D-5's separate markup, `class="cursor-not-allowed!"` tooltip
// wrapper included) is what actually renders -- deleting the whole @else branch in
// zones.blade.php would still leave that test green. This test reads the real rendered HTML.
test('row actions render disabled with the data-test hook still present for a shipping.view-only user, and enabled for a fully-permitted one', function () {
    $zone = ShippingZone::factory()->create(['name' => 'Zona Norte']);

    $viewOnly = actorWithShippingPermissions(['shipping.view']);
    $this->actingAs($viewOnly);

    $html = Livewire::test(Zones::class)->html();

    expect($html)->toMatch('/data-test="edit-zone-'.preg_quote($zone->id, '/').'"[^>]*\bdisabled\b/')
        ->and($html)->toMatch('/data-test="delete-zone-'.preg_quote($zone->id, '/').'"[^>]*\bdisabled\b/');

    $fullActor = actorWithShippingPermissions(['shipping.view', 'shipping.create', 'shipping.edit', 'shipping.delete']);
    $this->actingAs($fullActor);

    $html = Livewire::test(Zones::class)->html();

    expect($html)->toMatch('/data-test="edit-zone-'.preg_quote($zone->id, '/').'"[^>]*wire:click="openEditModal/')
        ->and($html)->not->toMatch('/data-test="edit-zone-'.preg_quote($zone->id, '/').'"[^>]*\bdisabled\b/')
        ->and($html)->toMatch('/data-test="delete-zone-'.preg_quote($zone->id, '/').'"[^>]*wire:click="confirmDelete/')
        ->and($html)->not->toMatch('/data-test="delete-zone-'.preg_quote($zone->id, '/').'"[^>]*\bdisabled\b/');
});
