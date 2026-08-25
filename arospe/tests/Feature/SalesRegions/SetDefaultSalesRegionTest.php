<?php

// Story 0017 — App\Actions\SalesRegions\SetDefaultSalesRegion does not exist yet. Added during
// Phase 1 reconciliation (backend-qa gap): the direct, action-level call
// app(SetDefaultSalesRegion::class)(...), bypassing the Livewire layer entirely, proven
// independently of the component per the 0008a/0015b convention that an action must be
// independently callable and independently authorized. This file holds the D10 inactive-target
// refusal and LogRefusedPrivilegedAttempt::authorize()'s own refusal, at the action level.
//
// RED-phase: the class does not exist, so every test below is expected to fail on
// `Class "App\Actions\SalesRegions\SetDefaultSalesRegion" not found` (or an equivalent
// autoload/container-resolution error), not on an assertion mismatch.
//
// Component-mediated coverage of the same rule (the single-default invariant's "both halves",
// the old-default-specifically check, and the idempotent re-set) lives in
// tests/Feature/SalesRegions/IndexTest.php, per the task file's file-allocation table -- not
// duplicated here.

use App\Actions\SalesRegions\SetDefaultSalesRegion;
use App\Models\SalesRegion;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// =====================================================================
// Authorization — action layer, direct call. Mirrors the
// Users/CreateUserActionAuthorizationTest.php / UpdateUserActionAuthorizationTest.php precedent:
// an actor lacking sales-regions.edit is refused independently of any component-level check.
// =====================================================================

test('setting a default directly throws for an actor lacking sales-regions.edit, and nothing changes', function () {
    $currentDefault = SalesRegion::factory()->isDefault()->create();
    $candidate = SalesRegion::factory()->create();

    $actor = User::factory()->create(); // holds no permission at all
    $this->actingAs($actor);

    $countBefore = SalesRegion::count();

    expect(fn () => app(SetDefaultSalesRegion::class)($candidate))
        ->toThrow(AuthorizationException::class);

    expect(SalesRegion::count())->toBe($countBefore)
        ->and($candidate->fresh()->is_default)->toBeFalse()
        ->and($currentDefault->fresh()->is_default)->toBeTrue();
});

test('setting a default directly succeeds for an actor holding sales-regions.edit', function () {
    $currentDefault = SalesRegion::factory()->isDefault()->create();
    $candidate = SalesRegion::factory()->create();

    $actor = User::factory()->create();
    $actor->givePermissionTo('sales-regions.edit');
    $this->actingAs($actor);

    app(SetDefaultSalesRegion::class)($candidate);

    expect($candidate->fresh()->is_default)->toBeTrue()
        ->and($currentDefault->fresh()->is_default)->toBeFalse();
});

// =====================================================================
// D10 — an inactive entry may never hold the default flag, enforced HERE (in the action), not
// only in the form's replacementDefaultRules() -- so every call site inherits it, including a
// future non-dashboard caller.
// =====================================================================

test('setting an inactive entry as the default directly is refused, and the existing default is untouched', function () {
    $currentDefault = SalesRegion::factory()->isDefault()->create();
    $inactiveCandidate = SalesRegion::factory()->inactive()->create();

    $actor = User::factory()->create();
    $actor->givePermissionTo('sales-regions.edit');
    $this->actingAs($actor);

    expect(fn () => app(SetDefaultSalesRegion::class)($inactiveCandidate))
        ->toThrow(ValidationException::class);

    expect($inactiveCandidate->fresh()->is_default)->toBeFalse()
        ->and($currentDefault->fresh()->is_default)->toBeTrue()
        ->and($currentDefault->fresh()->is_active)->toBeTrue();
});

// =====================================================================
// Idempotent — re-setting the already-default entry directly is a no-op: still exactly one
// default, same row, no error.
// =====================================================================

test('setting the already-default entry as the default directly changes nothing and raises no error', function () {
    $currentDefault = SalesRegion::factory()->isDefault()->create();
    SalesRegion::factory()->count(2)->create();

    $actor = User::factory()->create();
    $actor->givePermissionTo('sales-regions.edit');
    $this->actingAs($actor);

    app(SetDefaultSalesRegion::class)($currentDefault);

    expect(SalesRegion::where('is_default', true)->count())->toBe(1)
        ->and(SalesRegion::where('is_default', true)->first()->id)->toBe($currentDefault->id);
});

// =====================================================================
// Phase 4 finding F-1 (docs/security/model-instance-trust.md) — is_active must be re-read under
// lock, inside the transaction, never trusted off the caller-supplied instance. A stale in-memory
// attribute must not be able to defeat D10.
// =====================================================================

test('a caller-hydrated instance carrying a stale in-memory is_active cannot bypass the D10 guard', function () {
    $currentDefault = SalesRegion::factory()->isDefault()->create();
    $candidate = SalesRegion::factory()->inactive()->create();

    // Hydrate, then forge the in-memory attribute WITHOUT persisting it --
    // exactly the caller-hydrated-instance exploit path the audit confirmed
    // by execution.
    $candidate->is_active = true;

    $actor = User::factory()->create();
    $actor->givePermissionTo('sales-regions.edit');
    $this->actingAs($actor);

    expect(fn () => app(SetDefaultSalesRegion::class)($candidate))
        ->toThrow(ValidationException::class);

    expect($candidate->fresh()->is_default)->toBeFalse()
        ->and($candidate->fresh()->is_active)->toBeFalse()
        ->and($currentDefault->fresh()->is_default)->toBeTrue();
});

test('the row is re-read under lock: a concurrent deactivation between hydration and the call is honoured, not the stale copy', function () {
    $currentDefault = SalesRegion::factory()->isDefault()->create();
    $candidate = SalesRegion::factory()->create(['is_active' => true]);

    // $candidate is hydrated here, active. Simulate a second administrator's
    // already-committed deactivation landing between hydration and this
    // call -- the honest single-process simulation of another transaction,
    // per docs/security/model-instance-trust.md's "Regression test shape".
    SalesRegion::query()->whereKey($candidate->id)->update(['is_active' => false]);

    $actor = User::factory()->create();
    $actor->givePermissionTo('sales-regions.edit');
    $this->actingAs($actor);

    expect(fn () => app(SetDefaultSalesRegion::class)($candidate))
        ->toThrow(ValidationException::class);

    expect($currentDefault->fresh()->is_default)->toBeTrue();
});

// =====================================================================
// Phase 4 finding F-2 (docs/security/model-instance-trust.md) — save() writes the whole dirty
// set, not an allow-list, so this action must write through an instance it hydrates itself. A
// caller-dirtied structural column must not ride along.
// =====================================================================

test('a caller-dirtied structural column does not persist through this action', function () {
    $currentDefault = SalesRegion::factory()->isDefault()->create();
    $candidate = SalesRegion::factory()->create();
    $originalName = $candidate->name;

    $candidate->name = 'Hijacked via SetDefaultSalesRegion';
    $candidate->sort_order = 999;

    $actor = User::factory()->create();
    $actor->givePermissionTo('sales-regions.edit');
    $this->actingAs($actor);

    app(SetDefaultSalesRegion::class)($candidate);

    expect($candidate->fresh()->is_default)->toBeTrue()
        ->and($candidate->fresh()->name)->toBe($originalName)
        ->and($candidate->fresh()->sort_order)->not->toBe(999)
        ->and($currentDefault->fresh()->is_default)->toBeFalse();
});
