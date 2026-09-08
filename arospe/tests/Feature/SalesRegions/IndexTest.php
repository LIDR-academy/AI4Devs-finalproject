<?php

// Story 0017 — App\Livewire\SalesRegions\Index, App\Concerns\SalesRegionValidationRules and the
// three app/Actions/SalesRegions/* action classes. Per the task file's file-allocation table,
// this file holds the route-level HTTP block, and Livewire::test() coverage of edit / rate
// validation / setDefault. setActive() coverage (the deactivation guard, the atomic swap, the
// forced-rollback proof) lives in SetSalesRegionActiveTest.php instead, per that same table's
// own split.
//
// Arranged with SalesRegionFactory throughout (never SalesRegionSeeder's 249 rows), except the
// one deliberate exception named by the task file: the seeder cross-check test at the bottom of
// this file.

use App\Actions\SalesRegions\UpdateSalesRegion;
use App\Concerns\SalesRegionValidationRules;
use App\Enums\SalesRegionKind;
use App\Livewire\SalesRegions\Index;
use App\Models\SalesRegion;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\SalesRegionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Validator;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function salesRegionsIndexTestActor(array $permissions = ['sales-regions.view', 'sales-regions.edit']): User
{
    $actor = User::factory()->create();

    if ($permissions !== []) {
        $actor->givePermissionTo($permissions);
    }

    return $actor;
}

// =====================================================================
// $this->get(route('sales-regions.index')) — HTTP layer
// =====================================================================

test('guests are redirected to the login page when visiting the sales regions screen', function () {
    $this->get(route('sales-regions.index'))->assertRedirect(route('login'));
});

test('a signed-in user without sales-regions.view is forbidden from the sales regions screen', function () {
    $actor = salesRegionsIndexTestActor([]);
    $this->actingAs($actor);

    $this->get(route('sales-regions.index'))->assertForbidden();
});

test('a user holding sales-regions.view can reach the sales regions screen', function () {
    $actor = salesRegionsIndexTestActor(['sales-regions.view']);
    $this->actingAs($actor);

    $this->get(route('sales-regions.index'))->assertOk();
});

test('a Super Admin holding zero permission rows can reach the sales regions screen', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $this->get(route('sales-regions.index'))->assertOk();
});

// =====================================================================
// Livewire::test(Index::class) — authorization layer
// =====================================================================

test('mounting the component directly is forbidden for a user holding zero relevant permissions, even though route middleware never ran', function () {
    $this->withoutExceptionHandling();
    $actor = salesRegionsIndexTestActor([]);
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class))->toThrow(AuthorizationException::class);
});

test('a user holding sales-regions.view but not sales-regions.edit is refused on openEditModal, and no field is populated', function () {
    $this->withoutExceptionHandling();
    $region = SalesRegion::factory()->create(['code' => 'XX']);

    $actor = salesRegionsIndexTestActor(['sales-regions.view']);
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', $region->id))
        ->toThrow(AuthorizationException::class);
});

test('a user holding sales-regions.view but not sales-regions.edit is refused on save, and nothing persists', function () {
    $this->withoutExceptionHandling();
    $region = SalesRegion::factory()->create(['description' => 'Original']);

    $viewOnlyActor = salesRegionsIndexTestActor(['sales-regions.view']);
    $editingActor = salesRegionsIndexTestActor(['sales-regions.view', 'sales-regions.edit']);

    // openEditModal() populates the form while authorized (as a real edit flow would); the actor
    // is then swapped for one who cannot save, isolating save()'s own re-check.
    $this->actingAs($editingActor);
    $component = Livewire::test(Index::class)->call('openEditModal', $region->id);

    $this->actingAs($viewOnlyActor);

    expect(fn () => $component->set('description', 'Should not persist')->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($region->fresh()->description)->toBe('Original');
});

test('a user holding sales-regions.view but not sales-regions.edit is refused on setDefault, and nothing persists', function () {
    $this->withoutExceptionHandling();
    $region = SalesRegion::factory()->create();

    $actor = salesRegionsIndexTestActor(['sales-regions.view']);
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('setDefault', $region->id))
        ->toThrow(AuthorizationException::class);

    expect($region->fresh()->is_default)->toBeFalse();
});

test('a user holding sales-regions.view but not sales-regions.edit is refused on setActive, and nothing persists', function () {
    $this->withoutExceptionHandling();
    $region = SalesRegion::factory()->inactive()->create();

    $actor = salesRegionsIndexTestActor(['sales-regions.view']);
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Index::class)->call('setActive', $region->id, true, ''))
        ->toThrow(AuthorizationException::class);

    expect($region->fresh()->is_active)->toBeFalse();
});

// =====================================================================
// Integration (editing) — Gherkin: "Setting the tax rate", "Setting the description",
// "Setting the code", "Configuring one field leaves the other configured fields alone",
// "Configuring an entry leaves its identity untouched".
// =====================================================================

test('editing rate persists exactly and round-trips as a string, not a float', function () {
    $region = SalesRegion::factory()->create();
    $countBefore = SalesRegion::count();

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $region->id)
        ->set('rate', '7.5')
        ->call('save')
        ->assertHasNoErrors();

    $fresh = $region->fresh();

    expect($fresh->rate)->toBe('7.500')
        ->and($fresh->rate)->toBeString()
        ->and(SalesRegion::count())->toBe($countBefore);
});

test('editing description and code persist exactly, and clearing description removes a previously-set value', function () {
    $region = SalesRegion::factory()->create(['description' => 'Old description', 'code' => 'OL']);

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $region->id)
        ->set('description', '')
        ->set('code', 'NW')
        ->call('save')
        ->assertHasNoErrors();

    $fresh = $region->fresh();

    expect($fresh->description)->toBeNull()
        ->and($fresh->code)->toBe('NW');
});

test('changing only the rate leaves code and description untouched', function () {
    $region = SalesRegion::factory()->create(['code' => 'FR', 'description' => 'Existing description']);

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $region->id)
        ->set('rate', '12.5')
        ->call('save')
        ->assertHasNoErrors();

    $fresh = $region->fresh();

    expect($fresh->code)->toBe('FR')
        ->and($fresh->description)->toBe('Existing description')
        ->and($fresh->rate)->toBe('12.500');
});

test('editing an entry through the component leaves its seeded identity columns unchanged', function () {
    $spain = SalesRegion::factory()->create(['slug' => 'es', 'kind' => SalesRegionKind::Country]);
    $region = SalesRegion::factory()->fiscalTerritoryOf($spain)->create(['name' => 'Canarias', 'sort_order' => 3]);

    $originalSlug = $region->slug;
    $originalName = $region->name;
    $originalParentId = $region->parent_id;
    $originalKind = $region->kind;
    $originalSortOrder = $region->sort_order;

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $region->id)
        ->set('rate', '7.000')
        ->call('save')
        ->assertHasNoErrors();

    $fresh = $region->fresh();

    expect($fresh->slug)->toBe($originalSlug)
        ->and($fresh->name)->toBe($originalName)
        ->and($fresh->parent_id)->toBe($originalParentId)
        ->and($fresh->kind)->toBe($originalKind)
        ->and($fresh->sort_order)->toBe($originalSortOrder)
        ->and($fresh->rate)->toBe('7.000');
});

// =====================================================================
// Integration (structural columns) — the real write path (UpdateSalesRegion, not fill() in
// isolation, which 0016's tests/Unit/Models/SalesRegionTest.php already proves) cannot change
// slug, name, parent_id, kind or sort_order. UpdateSalesRegion's real signature
// (__invoke(SalesRegion $region, ?string $code, ?string $description, ?string $rate)) carries no
// parameter for any of these five columns at all, so there is no form field to "forge" through —
// this test proves the real, persisted write path (not a standalone fill()-then-never-save() unit
// test) leaves them alone while genuinely changing the columns it is allowed to.
// =====================================================================

test('UpdateSalesRegion cannot change slug, name, parent_id, kind or sort_order through its real write path', function () {
    $spain = SalesRegion::factory()->create(['slug' => 'es', 'kind' => SalesRegionKind::Country]);
    $region = SalesRegion::factory()->fiscalTerritoryOf($spain)->create(['name' => 'Baleares', 'sort_order' => 2]);

    $originalSlug = $region->slug;
    $originalName = $region->name;
    $originalParentId = $region->parent_id;
    $originalKind = $region->kind;
    $originalSortOrder = $region->sort_order;

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    app(UpdateSalesRegion::class)($region, 'ZZ', 'Changed description', '3.500');

    $fresh = $region->fresh();

    expect($fresh->slug)->toBe($originalSlug)
        ->and($fresh->name)->toBe($originalName)
        ->and($fresh->parent_id)->toBe($originalParentId)
        ->and($fresh->kind)->toBe($originalKind)
        ->and($fresh->sort_order)->toBe($originalSortOrder)
        // The allowed columns DID change -- proving this was a real write, not a no-op.
        ->and($fresh->code)->toBe('ZZ')
        ->and($fresh->description)->toBe('Changed description')
        ->and($fresh->rate)->toBe('3.500');
});

// =====================================================================
// Integration (clearing a rate, D6/AC7) — a blank submission clears a configured rate back to
// unconfigured.
// =====================================================================

test('clearing the rate through the component returns it to unconfigured', function () {
    $region = SalesRegion::factory()->withRate('15.000')->create();

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $region->id)
        ->set('rate', '')
        ->call('save')
        ->assertHasNoErrors();

    expect($region->fresh()->rate)->toBeNull();
});

// =====================================================================
// Positive (rate boundaries) — 0 persists as the STRING '0.000', not null (0016: 0.000 is a real
// rate distinct from NULL); the exact upper bound (100) is accepted; the dataset below already
// covers one unit over it.
// =====================================================================

test('a rate of zero persists as the string 0.000, not null', function () {
    $region = SalesRegion::factory()->create();

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $region->id)
        ->set('rate', '0')
        ->call('save')
        ->assertHasNoErrors();

    $fresh = $region->fresh();

    expect($fresh->rate)->not->toBeNull()
        ->and($fresh->rate)->toBe('0.000');
});

test('the exact upper bound rate (100) is accepted', function () {
    $region = SalesRegion::factory()->create();

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $region->id)
        ->set('rate', '100')
        ->call('save')
        ->assertHasNoErrors();

    expect($region->fresh()->rate)->toBe('100.000');
});

// =====================================================================
// Negative (rate validation, Pest dataset, D5) — each rejected through the component, and the
// entry's previous rate survives every one of them.
// =====================================================================

test('an invalid rate is rejected through the component, and the previous rate survives', function (string $invalidRate) {
    $region = SalesRegion::factory()->withRate('5.000')->create();

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $region->id)
        ->set('rate', $invalidRate)
        ->call('save')
        ->assertHasErrors(['rate'])
        // Phase 5 code review finding N5: a refused save must also leave the modal open (the
        // administrator is meant to correct the field, not lose their place) and the LIST still
        // showing the previous rate -- loadRegions() is never reached because save() throws
        // before it. This test's own arrangement creates exactly one rated region, so a bare
        // assertSee('5%') is safe here (no second row to collide with).
        ->assertSet('showModal', true)
        ->assertSee('5%');

    expect($region->fresh()->rate)->toBe('5.000');
})->with([
    'negative integer' => ['-1'],
    'negative decimal' => ['-0.001'],
    'non-numeric' => ['abc'],
    'scientific notation' => ['1e2'],
    'over-precision (more than 3 decimals)' => ['21.0001'],
    'over the maximum (above 100)' => ['100.001'],
]);

// =====================================================================
// Positive (locale comma, D12) — accepted and normalised through the component; its mirror
// against rateRules() in isolation fails, which is exactly why the component's normalisation
// step exists and must never be "simplified" away.
// =====================================================================

test('a rate typed with a decimal comma is accepted through the component and stored normalised', function () {
    $region = SalesRegion::factory()->create();

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $region->id)
        ->set('rate', '21,5')
        ->call('save')
        ->assertHasNoErrors();

    expect($region->fresh()->rate)->toBe('21.500');
});

test('a decimal comma fails rateRules() in isolation, which is why the components normalisation step exists', function () {
    $rulesHolder = new class
    {
        use SalesRegionValidationRules;

        /** @return array<int, mixed> */
        public function exposedRateRules(): array
        {
            return $this->rateRules();
        }
    };

    $validator = Validator::make(['rate' => '21,5'], ['rate' => $rulesHolder->exposedRateRules()]);

    expect($validator->fails())->toBeTrue();
});

// =====================================================================
// Integration (single default, both halves) — after setDefault, assert count(is_default=true)
// is 1 AND that the single row is the new one, as two separate assertions.
// =====================================================================

test('setDefault clears the previous default, leaving exactly the new row as the only default', function () {
    $oldDefault = SalesRegion::factory()->isDefault()->create();
    $newCandidate = SalesRegion::factory()->create();
    $countBefore = SalesRegion::count();

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setDefault', $newCandidate->id)
        ->assertHasNoErrors();

    expect(SalesRegion::where('is_default', true)->count())->toBe(1)
        ->and(SalesRegion::where('is_default', true)->first()->id)->toBe($newCandidate->id)
        ->and(SalesRegion::count())->toBe($countBefore);
});

// =====================================================================
// Integration (the old default specifically) — re-fetch the previously-default row and assert
// is_default === false, and that is_active was NOT touched.
// =====================================================================

test('setDefault leaves the previous default active, only no longer flagged as the default', function () {
    $oldDefault = SalesRegion::factory()->isDefault()->create();
    $newCandidate = SalesRegion::factory()->create();

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setDefault', $newCandidate->id)
        ->assertHasNoErrors();

    expect($oldDefault->fresh()->is_default)->toBeFalse()
        ->and($oldDefault->fresh()->is_active)->toBeTrue();
});

// =====================================================================
// Integration (idempotent default) — re-setting the already-default entry is a no-op.
// =====================================================================

test('re-setting the already-default entry through the component changes nothing and raises no error', function () {
    $default = SalesRegion::factory()->isDefault()->create();
    SalesRegion::factory()->count(2)->create();
    $countBefore = SalesRegion::count();

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setDefault', $default->id)
        ->assertHasNoErrors();

    expect(SalesRegion::where('is_default', true)->count())->toBe(1)
        ->and(SalesRegion::where('is_default', true)->first()->id)->toBe($default->id)
        ->and(SalesRegion::count())->toBe($countBefore);
});

// =====================================================================
// Integration (inactive cannot be the default, D10, component half) — setDefault() on an
// inactive entry is refused, and the existing default is untouched. The naming-an-inactive-
// -replacement half, and both action-level halves, live in
// tests/Feature/SalesRegions/SetSalesRegionActiveTest.php / SetDefaultSalesRegionTest.php.
// =====================================================================

test('setDefault on an inactive entry is refused through the component, and the existing default is untouched', function () {
    $default = SalesRegion::factory()->isDefault()->create();
    $inactiveCandidate = SalesRegion::factory()->inactive()->create();

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setDefault', $inactiveCandidate->id)
        ->assertHasErrors(['replacementDefaultId']);

    expect($inactiveCandidate->fresh()->is_default)->toBeFalse()
        ->and($default->fresh()->is_default)->toBeTrue()
        ->and($default->fresh()->is_active)->toBeTrue();
});

// =====================================================================
// Integration (seeder cross-check, one test) — the ONE deliberate exception to "never arrange
// with SalesRegionSeeder in this story's tests" (0016's own instruction): after this story's
// actions change rate, code, description, is_active and is_default, re-running the seeder must
// leave every administrator-configurable column untouched. Two rows are used rather than one,
// since a row currently holding is_default=true cannot also be made is_active=false (D10) --
// functionally equivalent coverage of all five columns across the two administrator-configurable
// mutations this story ships.
// =====================================================================

test('re-running the seeder after this storys actions have configured rows leaves every administrator-configurable column untouched', function () {
    $this->seed(SalesRegionSeeder::class);

    $configuredRow = SalesRegion::where('slug', 'es-baleares')->firstOrFail();
    $newDefaultRow = SalesRegion::where('slug', 'es-canarias')->firstOrFail();

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    app(UpdateSalesRegion::class)($configuredRow, 'CUSTOM', 'Administrator-configured description', '9.999');
    Livewire::test(Index::class)
        ->call('setActive', $configuredRow->id, false, '')
        ->assertHasNoErrors();

    Livewire::test(Index::class)
        ->call('setDefault', $newDefaultRow->id)
        ->assertHasNoErrors();

    $configuredBefore = $configuredRow->fresh();
    $newDefaultBefore = $newDefaultRow->fresh();

    expect($configuredBefore->code)->toBe('CUSTOM')
        ->and($configuredBefore->description)->toBe('Administrator-configured description')
        ->and($configuredBefore->rate)->toBe('9.999')
        ->and($configuredBefore->is_active)->toBeFalse()
        ->and($newDefaultBefore->is_default)->toBeTrue();

    $this->seed(SalesRegionSeeder::class);

    $configuredAfter = $configuredRow->fresh();
    $newDefaultAfter = $newDefaultRow->fresh();

    expect($configuredAfter->code)->toBe('CUSTOM')
        ->and($configuredAfter->description)->toBe('Administrator-configured description')
        ->and($configuredAfter->rate)->toBe('9.999')
        ->and($configuredAfter->is_active)->toBeFalse()
        ->and($newDefaultAfter->is_default)->toBeTrue();
});

// =====================================================================
// Phase 5 code review finding F-4: "the component public surface" is the interface story 0018
// binds to, and the task file says so explicitly -- but nothing pinned its shape, its per-row
// canEdit hint, or replacementCandidates() before this. A regression renaming a key, dropping a
// field, or returning the wrong Gate result would have passed every other test in this file.
// =====================================================================

test('each row exposes the full $regions shape the component public surface promises', function () {
    $parent = SalesRegion::factory()->create();
    $region = SalesRegion::factory()->fiscalTerritoryOf($parent)->withRate('7.500')->create([
        'code' => 'ES-X',
        'description' => 'A fiscal territory',
        'is_active' => true,
        'is_default' => false,
        'sort_order' => 3,
    ]);

    $actor = salesRegionsIndexTestActor(); // holds both view and edit
    $this->actingAs($actor);

    $rows = collect(Livewire::test(Index::class)->get('regions'));

    expect($rows->firstWhere('id', $region->id))->toBe([
        'id' => $region->id,
        'slug' => $region->slug,
        'code' => 'ES-X',
        'name' => $region->name,
        'description' => 'A fiscal territory',
        'rate' => '7.500',
        'kind' => SalesRegionKind::FiscalTerritory,
        'parentId' => $parent->id,
        'isDefault' => false,
        'isActive' => true,
        'sortOrder' => 3,
        'canEdit' => true,
    ]);
});

test('canEdit mirrors what SalesRegionPolicy would actually authorize for the row', function () {
    $region = SalesRegion::factory()->create();

    $editor = salesRegionsIndexTestActor(); // sales-regions.view + sales-regions.edit
    $this->actingAs($editor);

    $editorRows = collect(Livewire::test(Index::class)->get('regions'));
    expect($editorRows->firstWhere('id', $region->id)['canEdit'])->toBeTrue();

    $viewer = salesRegionsIndexTestActor(['sales-regions.view']); // no sales-regions.edit
    $this->actingAs($viewer);

    $viewerRows = collect(Livewire::test(Index::class)->get('regions'));
    expect($viewerRows->firstWhere('id', $region->id)['canEdit'])->toBeFalse();
});

// =====================================================================
// replacementCandidates() -- D10's third expression ("active, not self"), the one path the
// action-level revert-checks don't reach: an inactive entry or the row being edited must never be
// offerable as a replacement, no matter what the form later submits.
// =====================================================================

test('replacementCandidates excludes inactive entries and the entry currently being edited', function () {
    $editing = SalesRegion::factory()->create(['is_active' => true, 'name' => 'Being Edited']);
    $inactiveCandidate = SalesRegion::factory()->inactive()->create(['name' => 'Inactive Candidate']);
    $eligibleCandidate = SalesRegion::factory()->create(['is_active' => true, 'name' => 'Eligible Candidate']);

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    $candidateIds = collect(
        Livewire::test(Index::class)
            ->call('openEditModal', $editing->id)
            ->get('replacementCandidates')
    )->pluck('id');

    expect($candidateIds)->toContain($eligibleCandidate->id)
        ->not->toContain($inactiveCandidate->id)
        ->not->toContain($editing->id);
});

test('replacementCandidates includes every active entry before any row is being edited', function () {
    SalesRegion::factory()->create(['is_active' => true]);
    SalesRegion::factory()->inactive()->create();

    $actor = salesRegionsIndexTestActor();
    $this->actingAs($actor);

    $candidateCount = Livewire::test(Index::class)->get('replacementCandidates');

    expect($candidateCount)->toHaveCount(SalesRegion::where('is_active', true)->count());
});
