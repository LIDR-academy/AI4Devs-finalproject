<?php

// Story 0017 — Sales Regions is the "third admin screen" the copyable refusal-logging recipe in
// docs/architecture/authorization.md describes prospectively (story 0015b), and this file is its
// first real proof. Neither App\Livewire\SalesRegions\Index nor any of the three
// app/Actions/SalesRegions/* action classes exist yet, so every test below is expected to fail on
// a missing-class error, not on an unrelated setup failure -- no Log::warning/Log::info is ever
// recorded because nothing exists to record it.
//
// =====================================================================================
// COVERAGE CHECKLIST -- the four Gate-shaped sites (mount() excepted, mirroring
// Users\Index::mount()/Roles\Index::mount()'s identical, deliberately-unlogged exception since
// can:sales-regions.view is on Livewire's PersistentMiddleware allow-list) plus the two
// action-owned, non-Gate D3/D10 refusals reachable through the component with no action-layer
// detour:
//
//   1. openEditModal()  update  -- 'openEditModal() authorization refusal is logged'
//   2. save()           update  -- 'save() authorization refusal is logged'
//   3. setDefault()     update  -- 'setDefault() authorization refusal is logged'
//   4. setActive()      update  -- 'setActive() authorization refusal is logged'
//   5. SetDefaultSalesRegion's own D10 refusal (default_must_be_active), reached via the
//      component's setDefault() -- 'the D10 (default-must-be-active) refusal is logged...'
//   6. SetSalesRegionActive's own D3 refusal (default_deactivation_requires_replacement), reached
//      via the component's setActive() -- 'the D3 (default-deactivation-requires-replacement)...'
//
// UpdateSalesRegion's own direct-call authorization test lives here too (per the task file's
// file-allocation table), since that action has no other dedicated test file.
// =====================================================================================

use App\Actions\SalesRegions\UpdateSalesRegion;
use App\Livewire\Roles\Index as RolesIndex;
use App\Livewire\SalesRegions\Index;
use App\Models\SalesRegion;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<string, mixed>  $context
 */
function salesRegionsRefusalLogContextHasNoSecretLookingKey(array $context): bool
{
    foreach (array_keys($context) as $key) {
        if (! is_string($key)) {
            continue;
        }

        if (str_contains($key, 'password') || str_contains($key, 'token') || str_contains($key, 'hash') || str_contains($key, 'session')) {
            return false;
        }
    }

    return true;
}

/**
 * @param  array<int, string>  $extraPermissions
 */
function salesRegionsRefusalTestActor(array $extraPermissions = ['sales-regions.view', 'sales-regions.edit']): User
{
    $actor = User::factory()->create();

    if ($extraPermissions !== []) {
        $actor->givePermissionTo($extraPermissions);
    }

    return $actor;
}

// =====================================================================
// openEditModal()
// =====================================================================

test('openEditModal() authorization refusal is logged with the actor, ability and target', function () {
    Log::spy();

    $region = SalesRegion::factory()->create();

    $actor = salesRegionsRefusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class);

    $actor->revokePermissionTo('sales-regions.edit');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('openEditModal', $region->id);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'sales_region'
            && ($context['target_id'] ?? null) === $region->id
            && salesRegionsRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('openEditModal() refusal still throws, and no field is populated from the target', function () {
    $this->withoutExceptionHandling();

    $region = SalesRegion::factory()->create(['code' => 'XX']);

    $actor = salesRegionsRefusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class);

    $actor->revokePermissionTo('sales-regions.edit');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('openEditModal', $region->id))
        ->toThrow(AuthorizationException::class);

    expect($component->get('code'))->toBe('');
});

// =====================================================================
// save()
// =====================================================================

test('save() authorization refusal is logged', function () {
    Log::spy();

    $region = SalesRegion::factory()->create(['description' => 'Original']);

    $actor = salesRegionsRefusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class)->call('openEditModal', $region->id);

    $actor->revokePermissionTo('sales-regions.edit');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->set('description', 'Should Not Persist')->call('save');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'sales_region'
            && ($context['target_id'] ?? null) === $region->id
            && salesRegionsRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($region->fresh()->description)->toBe('Original');
});

// =====================================================================
// setDefault()
// =====================================================================

test('setDefault() authorization refusal is logged', function () {
    Log::spy();

    $region = SalesRegion::factory()->create();

    $actor = salesRegionsRefusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class);

    $actor->revokePermissionTo('sales-regions.edit');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('setDefault', $region->id);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'sales_region'
            && ($context['target_id'] ?? null) === $region->id
            && salesRegionsRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($region->fresh()->is_default)->toBeFalse();
});

// =====================================================================
// setActive()
// =====================================================================

test('setActive() authorization refusal is logged', function () {
    Log::spy();

    $region = SalesRegion::factory()->inactive()->create();

    $actor = salesRegionsRefusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class);

    $actor->revokePermissionTo('sales-regions.edit');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('setActive', $region->id, true, '');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'sales_region'
            && ($context['target_id'] ?? null) === $region->id
            && salesRegionsRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($region->fresh()->is_active)->toBeFalse();
});

// =====================================================================
// Non-Gate refusals owned by the actions themselves, reached through the component with no
// action-layer detour: D10 (SetDefaultSalesRegion) and D3 (SetSalesRegionActive).
// =====================================================================

test('the D10 (default-must-be-active) refusal is logged, distinguishable from an authorization refusal', function () {
    Log::spy();

    $inactiveCandidate = SalesRegion::factory()->inactive()->create();

    $actor = salesRegionsRefusalTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setDefault', $inactiveCandidate->id)
        ->assertHasErrors(['replacementDefaultId']);

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'default_must_be_active'
            && $context['ability'] !== 'update'
            && ($context['target_type'] ?? null) === 'sales_region'
            && ($context['target_id'] ?? null) === $inactiveCandidate->id
            && salesRegionsRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($inactiveCandidate->fresh()->is_default)->toBeFalse();
});

test('the D3 (default-deactivation-requires-replacement) refusal is logged, distinguishable from an authorization refusal', function () {
    Log::spy();

    $default = SalesRegion::factory()->isDefault()->create();

    $actor = salesRegionsRefusalTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setActive', $default->id, false, '')
        ->assertHasErrors(['replacementDefaultId']);

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'default_deactivation_requires_replacement'
            && $context['ability'] !== 'update'
            && ($context['target_type'] ?? null) === 'sales_region'
            && ($context['target_id'] ?? null) === $default->id
            && salesRegionsRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($default->fresh()->is_active)->toBeTrue()
        ->and($default->fresh()->is_default)->toBeTrue();
});

// =====================================================================
// Must-not-over-log — a permitted save(), setDefault() and setActive() each produce exactly the
// new Log::info('Sales region updated', [...]) success line (Phase 2 finding F-5) and NO
// Log::warning refusal line.
// =====================================================================

test('a permitted save produces no refusal entry, only the success line', function () {
    Log::spy();

    $region = SalesRegion::factory()->create();

    $actor = salesRegionsRefusalTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $region->id)
        ->set('description', 'Permitted change')
        ->call('save')
        ->assertHasNoErrors();

    Log::shouldNotHaveReceived('warning');
    Log::shouldHaveReceived('info')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Sales region updated'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['sales_region_id'] ?? null) === $region->id)
        ->once();

    expect($region->fresh()->description)->toBe('Permitted change');
});

test('a permitted setDefault produces no refusal entry, only the success line', function () {
    Log::spy();

    SalesRegion::factory()->isDefault()->create();
    $candidate = SalesRegion::factory()->create();

    $actor = salesRegionsRefusalTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setDefault', $candidate->id)
        ->assertHasNoErrors();

    Log::shouldNotHaveReceived('warning');
    Log::shouldHaveReceived('info')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Sales region updated'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['sales_region_id'] ?? null) === $candidate->id)
        ->once();

    expect($candidate->fresh()->is_default)->toBeTrue();
});

test('a permitted setActive produces no refusal entry, only the success line', function () {
    Log::spy();

    $region = SalesRegion::factory()->inactive()->create();

    $actor = salesRegionsRefusalTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setActive', $region->id, true, '')
        ->assertHasNoErrors();

    Log::shouldNotHaveReceived('warning');
    Log::shouldHaveReceived('info')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Sales region updated'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['sales_region_id'] ?? null) === $region->id)
        ->once();

    expect($region->fresh()->is_active)->toBeTrue();
});

// =====================================================================
// UpdateSalesRegion — the direct action-level authorization test (this action has no other
// dedicated test file, per the task file's file-allocation table).
// =====================================================================

test('UpdateSalesRegion direct-call authorization refusal is logged, and nothing changes', function () {
    Log::spy();

    $region = SalesRegion::factory()->create(['code' => 'ES']);

    $actor = User::factory()->create(); // holds no permission at all
    $this->actingAs($actor);

    try {
        app(UpdateSalesRegion::class)($region, 'XX', 'Attempted change', null);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'sales_region'
            && ($context['target_id'] ?? null) === $region->id
            && salesRegionsRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($region->fresh()->code)->toBe('ES');
});

test('UpdateSalesRegion direct-call succeeds for an actor holding sales-regions.edit', function () {
    $region = SalesRegion::factory()->create(['code' => 'ES']);

    $actor = User::factory()->create();
    $actor->givePermissionTo('sales-regions.edit');
    $this->actingAs($actor);

    app(UpdateSalesRegion::class)($region, 'XX', 'A real change', '7.500');

    expect($region->fresh()->code)->toBe('XX')
        ->and($region->fresh()->description)->toBe('A real change')
        ->and((string) $region->fresh()->rate)->toBe('7.500');
});

// =====================================================================
// Phase 4 finding F-2 (docs/security/model-instance-trust.md) — save() writes the whole dirty
// set, not the fill() allow-list. A caller-dirtied structural column must not persist through
// this action, even though it is never named in the fill() array.
// =====================================================================

test('UpdateSalesRegion does not persist a caller-dirtied structural column', function () {
    $region = SalesRegion::factory()->create();
    $originalSlug = $region->slug;
    $originalName = $region->name;
    $originalParentId = $region->parent_id;

    $region->slug = 'hijacked-slug';
    $region->name = 'Hijacked';
    $region->sort_order = 999;

    $actor = User::factory()->create();
    $actor->givePermissionTo('sales-regions.edit');
    $this->actingAs($actor);

    app(UpdateSalesRegion::class)($region, 'XX', 'desc', '5.000');

    expect($region->fresh()->slug)->toBe($originalSlug)
        ->and($region->fresh()->name)->toBe($originalName)
        ->and($region->fresh()->parent_id)->toBe($originalParentId)
        ->and($region->fresh()->sort_order)->not->toBe(999)
        ->and($region->fresh()->code)->toBe('XX');
});

// =====================================================================
// "The three screens emit the same line shape at the same level" — the exact-key-set equivalence
// assertion tests/Feature/Roles/RefusalLoggingTest.php's own "the Roles and Users screens refusal
// log lines share exactly the same shape" test already establishes for two screens, extended
// here to prove Sales Regions (the third) matches too, per the task file's explicit "mirror the
// exact-key-set equivalence assertion ... this is the 'third admin screen' proof" instruction.
// =====================================================================

test('the Sales Regions and Roles screens refusal log lines share exactly the same shape', function () {
    Log::spy();

    // -- Sales Regions refusal --
    $salesRegionsTarget = SalesRegion::factory()->create();
    $salesRegionsActor = salesRegionsRefusalTestActor();
    $this->actingAs($salesRegionsActor);
    $salesRegionsComponent = Livewire::test(Index::class);
    $salesRegionsActor->revokePermissionTo('sales-regions.edit');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $salesRegionsComponent->call('openEditModal', $salesRegionsTarget->id);
    } catch (AuthorizationException) {
        //
    }

    // -- Roles refusal (a second, distinct actor/target pair, same session). --
    $rolesActor = User::factory()->create();
    $rolesActor->givePermissionTo('roles.manage');
    $this->actingAs($rolesActor);

    $rolesComponent = Livewire::test(RolesIndex::class);
    $rolesTarget = Role::create(['name' => 'Sales Regions Equivalence Role', 'guard_name' => 'web']);

    $rolesActor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $rolesComponent->call('openEditModal', $rolesTarget->id);
    } catch (AuthorizationException) {
        //
    }

    $recordedContexts = [];

    Log::shouldHaveReceived('warning')
        ->withArgs(function (string $message, array $context) use (&$recordedContexts): bool {
            if ($message === 'Privileged action refused') {
                $recordedContexts[] = $context;
            }

            return true;
        })
        ->atLeast()->times(2);

    expect(count($recordedContexts))->toBeGreaterThanOrEqual(2);

    $keySets = array_map(
        fn (array $context): array => collect(array_keys($context))->sort()->values()->all(),
        $recordedContexts,
    );

    $serializedKeySets = array_map(fn (array $keys): string => implode(',', $keys), $keySets);
    expect(array_unique($serializedKeySets))->toHaveCount(1)
        ->and($keySets[0])->toBe(['ability', 'actor_id', 'target_id', 'target_type']);
});
