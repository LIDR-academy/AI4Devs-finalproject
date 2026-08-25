<?php

// Story 0017 — App\Actions\SalesRegions\SetSalesRegionActive and App\Livewire\SalesRegions\Index
// do not exist yet. Per the task file's file-allocation table, this file holds the deactivation
// guard and the atomic swap (including the forced-rollback proof), via
// Livewire::test(Index::class)->call('setActive', ...) -- the component's own entry point --
// plus its own direct app(SetSalesRegionActive::class)(...) authorization test, split out
// because its failure-mode assertions do not belong mixed into IndexTest.php's edit happy path.
//
// RED-phase: neither class exists, so every test below is expected to fail on a
// `Class "App\Livewire\SalesRegions\Index" not found` (or the action-class equivalent) error, not
// on an assertion mismatch.
//
// setActive()'s real signature has NO default for $replacementDefaultId (Phase 2 finding F-1: a
// defaulted parameter cannot precede the trailing container-resolved LogRefusedPrivilegedAttempt
// $log) -- every call below passes all three arguments explicitly, an empty string when no
// replacement is named.

use App\Actions\SalesRegions\SetSalesRegionActive;
use App\Livewire\SalesRegions\Index;
use App\Models\SalesRegion;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

function setActiveTestActor(array $permissions = []): User
{
    $actor = User::factory()->create();

    if ($permissions !== []) {
        $actor->givePermissionTo($permissions);
    }

    return $actor;
}

// =====================================================================
// Gherkin: "Enabling a seeded but inactive region entry" — added during Phase 1 reconciliation
// (backend-qa gap): no other bullet exercises the enable direction.
// =====================================================================

test('setActive enables a seeded but inactive entry', function () {
    $region = SalesRegion::factory()->inactive()->create();
    $countBefore = SalesRegion::count();

    $actor = setActiveTestActor(['sales-regions.view', 'sales-regions.edit']);
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setActive', $region->id, true, '')
        ->assertHasNoErrors();

    expect($region->fresh()->is_active)->toBeTrue()
        ->and(SalesRegion::count())->toBe($countBefore);
});

// =====================================================================
// Negative control — disabling a non-default active entry succeeds with no default-related side
// effect, proving the guard is keyed on "is this the default", not "disabling is privileged".
// =====================================================================

test('setActive disables a non-default active entry with no default-related side effect', function () {
    $default = SalesRegion::factory()->isDefault()->create();
    $ordinary = SalesRegion::factory()->create(['is_active' => true, 'is_default' => false]);
    $countBefore = SalesRegion::count();

    $actor = setActiveTestActor(['sales-regions.view', 'sales-regions.edit']);
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setActive', $ordinary->id, false, '')
        ->assertHasNoErrors();

    expect($ordinary->fresh()->is_active)->toBeFalse()
        ->and($default->fresh()->is_default)->toBeTrue()
        ->and($default->fresh()->is_active)->toBeTrue()
        ->and(SalesRegion::count())->toBe($countBefore);
});

// =====================================================================
// The load-bearing refusal (D3) — disabling the current default with NO replacement is refused,
// and the row re-read from the database is still active AND still the default. Asserting only
// the validation error would pass on an implementation that persisted the change and merely
// reported failure.
// =====================================================================

test('disabling the current default with no replacement is refused, leaving it active and still the default', function () {
    $default = SalesRegion::factory()->isDefault()->create();
    $countBefore = SalesRegion::count();

    $actor = setActiveTestActor(['sales-regions.view', 'sales-regions.edit']);
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setActive', $default->id, false, '')
        ->assertHasErrors(['replacementDefaultId']);

    expect($default->fresh()->is_active)->toBeTrue()
        ->and($default->fresh()->is_default)->toBeTrue()
        ->and(SalesRegion::count())->toBe($countBefore);
});

// =====================================================================
// The atomic swap (D3) — disabling the default WHILE naming a replacement is allowed: one test,
// asserting both rows' final state.
// =====================================================================

test('disabling the default while naming a replacement leaves the old row inactive and the new row the only default', function () {
    $oldDefault = SalesRegion::factory()->isDefault()->create();
    $replacement = SalesRegion::factory()->create(['is_active' => true, 'is_default' => false]);
    $countBefore = SalesRegion::count();

    $actor = setActiveTestActor(['sales-regions.view', 'sales-regions.edit']);
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setActive', $oldDefault->id, false, $replacement->id)
        ->assertHasNoErrors();

    expect($oldDefault->fresh()->is_active)->toBeFalse()
        ->and($oldDefault->fresh()->is_default)->toBeFalse()
        ->and($replacement->fresh()->is_default)->toBeTrue()
        ->and($replacement->fresh()->is_active)->toBeTrue()
        ->and(SalesRegion::where('is_default', true)->count())->toBe(1)
        ->and(SalesRegion::count())->toBe($countBefore);
});

// =====================================================================
// Self-replacement — naming the row being deactivated as its own replacement is refused. It
// would otherwise satisfy a naive null-check while producing an inactive default.
// =====================================================================

test('naming the row being deactivated as its own replacement is refused', function () {
    $default = SalesRegion::factory()->isDefault()->create();

    $actor = setActiveTestActor(['sales-regions.view', 'sales-regions.edit']);
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setActive', $default->id, false, $default->id)
        ->assertHasErrors(['replacementDefaultId']);

    expect($default->fresh()->is_active)->toBeTrue()
        ->and($default->fresh()->is_default)->toBeTrue();
});

// =====================================================================
// Malformed replacement — a non-existent id is refused cleanly: a validation failure, not a 500,
// and no partial write.
// =====================================================================

test('a non-existent replacement id is refused cleanly, with no partial write', function () {
    $default = SalesRegion::factory()->isDefault()->create();

    $actor = setActiveTestActor(['sales-regions.view', 'sales-regions.edit']);
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setActive', $default->id, false, (string) Str::uuid())
        ->assertHasErrors(['replacementDefaultId']);

    expect($default->fresh()->is_active)->toBeTrue()
        ->and($default->fresh()->is_default)->toBeTrue();
});

// =====================================================================
// D10, second half — an inactive entry cannot be named as the replacement default. Component
// level here; the action-level proof for THIS SAME rule is below, per the task file's explicit
// "assert the refusal at the action level too, not only through the component" instruction.
// =====================================================================

test('naming an inactive entry as the replacement while disabling the current default is refused, and both rows are untouched', function () {
    $default = SalesRegion::factory()->isDefault()->create();
    $inactiveCandidate = SalesRegion::factory()->inactive()->create();

    $actor = setActiveTestActor(['sales-regions.view', 'sales-regions.edit']);
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('setActive', $default->id, false, $inactiveCandidate->id)
        ->assertHasErrors(['replacementDefaultId']);

    expect($default->fresh()->is_active)->toBeTrue()
        ->and($default->fresh()->is_default)->toBeTrue()
        ->and($inactiveCandidate->fresh()->is_active)->toBeFalse()
        ->and($inactiveCandidate->fresh()->is_default)->toBeFalse();
});

test('naming an inactive entry as the replacement directly (action level) is refused, and both rows are untouched', function () {
    $default = SalesRegion::factory()->isDefault()->create();
    $inactiveCandidate = SalesRegion::factory()->inactive()->create();

    $actor = setActiveTestActor(['sales-regions.edit']);
    $this->actingAs($actor);

    expect(fn () => app(SetSalesRegionActive::class)($default, false, $inactiveCandidate))
        ->toThrow(ValidationException::class);

    expect($default->fresh()->is_active)->toBeTrue()
        ->and($default->fresh()->is_default)->toBeTrue()
        ->and($inactiveCandidate->fresh()->is_active)->toBeFalse()
        ->and($inactiveCandidate->fresh()->is_default)->toBeFalse();
});

// =====================================================================
// Atomicity under failure (revert-check 3) — force the SECOND write inside the transaction (the
// deactivate save() on the old default, which runs after the replacement's promotion) to throw,
// and assert the FIRST write (the promotion) was rolled back too. This is the only test that
// exists if and only if SetSalesRegionActive's OUTER DB::transaction() wraps its call into
// SetDefaultSalesRegion -- without it, the corrected revert-check 3 description applies: the
// promotion sticks (persisted) while the old row's is_active never gets written.
//
// A SalesRegion::saving() listener is used to force the failure deterministically at the exact
// write this test is about, rather than depending on any particular internal call order beyond
// what the task file's own action code block already documents (promote first, deactivate
// second). The listener is registered on a fresh per-test event dispatcher (Laravel rebinds
// Model::$dispatcher on every test's fresh application boot), so it cannot leak into any other
// test in the suite.
//
// TODO(Phase 3 step 3): this is also revert-check 3 itself once SetSalesRegionActive exists --
// temporarily remove its outer DB::transaction() wrapper and re-run this test; it must go red
// with the CORRECTED symptom (promotion persisted, old row's is_active stays true), not the
// original (pre-Phase-1) symptom.
// =====================================================================

test('a forced failure on the deactivation write rolls back the just-completed promotion too', function () {
    $oldDefault = SalesRegion::factory()->isDefault()->create();
    $replacement = SalesRegion::factory()->create(['is_active' => true, 'is_default' => false]);

    SalesRegion::saving(function (SalesRegion $model) use ($oldDefault): void {
        if ($model->is($oldDefault) && $model->is_active === false) {
            throw new RuntimeException('forced failure for the 0017 atomicity test');
        }
    });

    $actor = setActiveTestActor(['sales-regions.edit']);
    $this->actingAs($actor);

    expect(fn () => app(SetSalesRegionActive::class)($oldDefault, false, $replacement))
        ->toThrow(RuntimeException::class, 'forced failure for the 0017 atomicity test');

    // The promotion (SetDefaultSalesRegion's own write against $replacement) must have been
    // rolled back by the OUTER transaction, even though it is a separate action call that opened
    // its own (nested, savepoint-only) transaction.
    expect($replacement->fresh()->is_default)->toBeFalse()
        ->and($oldDefault->fresh()->is_default)->toBeTrue()
        ->and($oldDefault->fresh()->is_active)->toBeTrue();
});

// =====================================================================
// Authorization — action layer, direct call. An actor lacking sales-regions.edit is refused
// independently of the component, and nothing persists.
// =====================================================================

test('setting active directly throws for an actor lacking sales-regions.edit, and nothing changes', function () {
    $region = SalesRegion::factory()->inactive()->create();

    $actor = setActiveTestActor(); // holds no permission at all
    $this->actingAs($actor);

    expect(fn () => app(SetSalesRegionActive::class)($region, true))
        ->toThrow(AuthorizationException::class);

    expect($region->fresh()->is_active)->toBeFalse();
});

test('setting active directly succeeds for an actor holding sales-regions.edit', function () {
    $region = SalesRegion::factory()->inactive()->create();

    $actor = setActiveTestActor(['sales-regions.edit']);
    $this->actingAs($actor);

    app(SetSalesRegionActive::class)($region, true);

    expect($region->fresh()->is_active)->toBeTrue();
});

// =====================================================================
// Phase 4 finding F-1 (docs/security/model-instance-trust.md) — is_default (the target row) and
// is_active (the replacement row) must be re-read under lock, inside the transaction, never
// trusted off caller-supplied instances. Regression shape per the security page: mutate the row
// behind the instance with a direct query between hydration and the call, the honest
// single-process simulation of another administrator's already-committed transaction.
// =====================================================================

test('concurrent promotion of the deactivation target is honoured: deactivating it without a replacement is refused, not silently applied', function () {
    $region = SalesRegion::factory()->create(['is_default' => false, 'is_active' => true]);

    // $region is hydrated here, NOT the default. Simulate a second
    // administrator's already-committed setDefault($region) landing between
    // hydration and this call.
    SalesRegion::query()->whereKey($region->id)->update(['is_default' => true]);

    $actor = setActiveTestActor(['sales-regions.edit']);
    $this->actingAs($actor);

    // Assert the specific D3 message (Phase 4 RE-audit finding R-5): a bare
    // ValidationException::class match cannot distinguish this refusal from
    // D10's (default_must_be_active), which throws on the same
    // replacementDefaultId key -- a regression that refused for the WRONG
    // reason would still pass a class-only assertion.
    try {
        app(SetSalesRegionActive::class)($region, false, null);
        $this->fail('Expected a ValidationException.');
    } catch (ValidationException $e) {
        expect($e->errors()['replacementDefaultId'][0])
            ->toBe(__('sales-regions.errors.default_deactivation_requires_replacement'));
    }

    expect($region->fresh()->is_active)->toBeTrue()
        ->and($region->fresh()->is_default)->toBeTrue();
});

test('concurrent deactivation of the named replacement is honoured: promoting an inactive replacement is refused, not silently applied', function () {
    $currentDefault = SalesRegion::factory()->isDefault()->create();
    $replacement = SalesRegion::factory()->create(['is_active' => true]);

    // $replacement is hydrated here, active. Simulate a second
    // administrator's already-committed deactivation landing between
    // hydration and this call.
    SalesRegion::query()->whereKey($replacement->id)->update(['is_active' => false]);

    $actor = setActiveTestActor(['sales-regions.edit']);
    $this->actingAs($actor);

    // Assert the specific D10 message -- the refusal this test is actually
    // about is the NESTED SetDefaultSalesRegion call's guard, not this
    // action's own D3 one, and both throw ValidationException on the same
    // key (Phase 4 RE-audit finding R-5).
    try {
        app(SetSalesRegionActive::class)($currentDefault, false, $replacement);
        $this->fail('Expected a ValidationException.');
    } catch (ValidationException $e) {
        expect($e->errors()['replacementDefaultId'][0])
            ->toBe(__('sales-regions.errors.default_must_be_active'));
    }

    expect($currentDefault->fresh()->is_active)->toBeTrue()
        ->and($currentDefault->fresh()->is_default)->toBeTrue()
        ->and($replacement->fresh()->is_default)->toBeFalse();
});

// =====================================================================
// Phase 4 finding F-2 (docs/security/model-instance-trust.md) — save() writes the whole dirty
// set, not an allow-list. A caller-forged is_default on the target instance must not ride along
// and produce a second default; a caller-dirtied structural column must not persist either.
// =====================================================================

test('a caller-forged is_default on the target instance does not produce a second default', function () {
    $currentDefault = SalesRegion::factory()->isDefault()->create();
    $region = SalesRegion::factory()->create(['is_active' => false]);

    // Forge the in-memory attribute WITHOUT persisting it -- this action
    // does not own is_default, so its final save() must not write it.
    $region->is_default = true;

    $actor = setActiveTestActor(['sales-regions.edit']);
    $this->actingAs($actor);

    app(SetSalesRegionActive::class)($region, true);

    expect(SalesRegion::where('is_default', true)->count())->toBe(1)
        ->and($currentDefault->fresh()->is_default)->toBeTrue()
        ->and($region->fresh()->is_default)->toBeFalse()
        ->and($region->fresh()->is_active)->toBeTrue();
});

test('a caller-dirtied structural column does not persist through this action', function () {
    $region = SalesRegion::factory()->inactive()->create();
    $originalSlug = $region->slug;

    $region->slug = 'hijacked-via-set-active';

    $actor = setActiveTestActor(['sales-regions.edit']);
    $this->actingAs($actor);

    app(SetSalesRegionActive::class)($region, true);

    expect($region->fresh()->is_active)->toBeTrue()
        ->and($region->fresh()->slug)->toBe($originalSlug);
});

// =====================================================================
// Phase 4 RE-audit finding R-2 (docs/security/model-instance-trust.md) — the returned instance
// must reflect the promotion's effect on is_default, not a stale in-memory copy from before the
// nested SetDefaultSalesRegion call cleared it through a separate instance.
// =====================================================================

test('the returned instance reflects is_default being cleared by the atomic promotion, not a stale copy', function () {
    $oldDefault = SalesRegion::factory()->isDefault()->create();
    $replacement = SalesRegion::factory()->create(['is_active' => true, 'is_default' => false]);

    $actor = setActiveTestActor(['sales-regions.edit']);
    $this->actingAs($actor);

    $returned = app(SetSalesRegionActive::class)($oldDefault, false, $replacement);

    expect($returned->is($oldDefault))->toBeTrue()
        ->and($returned->is_default)->toBeFalse()
        ->and($returned->is_active)->toBeFalse();
});
