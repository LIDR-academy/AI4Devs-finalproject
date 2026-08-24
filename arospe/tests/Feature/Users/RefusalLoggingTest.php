<?php

// Story 0015b — App\Livewire\Users\Index logs a structured Log::warning('Privileged action
// refused', [...]) line for every Gate::authorize() / rate-limit refusal it surfaces, mirroring
// the shipped Log::info audit-trail shape (story 0015's F5) but at a distinct level and for the
// OPPOSITE outcome. This is the RED half of TDD -- App\Actions\Auth\LogRefusedPrivilegedAttempt
// does not exist yet and none of the sites below log anything today, so every test in this file
// is expected to fail because Log::warning is never called, not because of some unrelated setup
// error. Once backend-expert wires the shared helper into each site, these go green with no
// change to the assertions.
//
// Shape asserted throughout (per the task file's "Named now" paragraph, agreed before Phase 3 so
// QA and the implementer do not need a round-trip):
//   Log::warning('Privileged action refused', [
//       'actor_id'    => string,               // the resolved actor's id
//       'ability'     => string,                // real Gate ability name, or a short snake_case
//                                                // non-Gate reason distinct from any real
//                                                // permission name (e.g. 'create_rate_limited')
//       'target_type' => 'user'|'role'|null,
//       'target_id'   => ?string,
//   ]);
//
// =====================================================================================
// COVERAGE CHECKLIST -- the 7 Gate::authorize() sites in this component, mapped to the test
// that exercises each (task file "Files to create/modify" table, re-verified against HEAD):
//
//   1. mount()          :102 viewAny                  -- DELIBERATELY NOT COVERED HERE. See the
//      note directly below the checklist: `can:users.view` sits on Livewire's
//      PersistentMiddleware allow-list, so a real HTTP actor who would fail this check is
//      refused by the ROUTE before ever reaching the component -- mount() only runs once, on
//      the very first render, which the route already gated. A Livewire::test(Index::class)
//      call (as the existing "mounting the component directly is forbidden..." test at
//      tests/Feature/Users/IndexTest.php:819 already proves) DOES reach it directly and
//      genuinely throws, so a test against it would not be technically vacuous in the sense
//      the errors-log's `verified`-middleware entry describes -- but whether this refusal is
//      worth logging AT ALL is an explicit Phase 3 implementation decision the task file leaves
//      open ("Phase 3 must therefore decide explicitly whether mount() gets a refusal log at
//      all"), not a pre-agreed contract the way the other 6 sites are. Writing a test now would
//      either force that decision on Phase 3's behalf or need deleting/rewriting once Phase 3
//      decides -- so it is left out here, per the task file's own guidance that mount() is "the
//      known candidate" for an explicit, documented non-coverage decision.
//   2. openCreateModal() :117 create                   -- 'openCreateModal() authorization refusal is logged'
//   3. openEditModal()   :156 updateSensitiveAttributes -- 'openEditModal() authorization refusal is logged...' (Gherkin scenario 1) + 'openEditModal() refusal still throws...'
//   4. save() create      :184 create                  -- 'save() create-branch authorization refusal is logged'
//   5. save() update      :187 update                  -- 'save() update-branch authorization refusal is logged (own row)'
//   6. confirmDelete()   :271 delete                   -- 'confirmDelete() authorization refusal is logged'
//   7. deleteUser()      :328 delete                   -- 'deleteUser() authorization refusal is logged'
//
// Non-Gate refusals that surface through this component (via the actions it calls) are
// deliberately tested at the ACTION layer instead, in tests/Feature/Users/ActionRefusalLoggingTest.php
// -- not duplicated here -- because, for the same actor/target, Index's own Gate checks above
// (save()'s 'create'/'update', openEditModal()'s 'updateSensitiveAttributes') always fire BEFORE
// CreateUser's/UpdateUser's OWN base gate would, so those inner checks are only independently
// reachable by calling the action directly (exactly the non-dashboard-caller case Q5 exists
// for). The ONE exception is CreateUser's rate limiter, which Index has no gate of its own in
// front of -- tested here too, via the component, per the task file's explicit "Users --
// rate-limit refusal is logged" bullet (in addition to the direct-call coverage in
// ActionRefusalLoggingTest.php).
// =====================================================================================

use App\Actions\Users\CreateUser;
use App\Enums\UserStatus;
use App\Livewire\Users\Index;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
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
function usersRefusalLogContextHasNoSecretLookingKey(array $context): bool
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

// =====================================================================
// Gherkin scenario 1 — "A refused user-management attempt is recorded".
// =====================================================================

test('openEditModal() authorization refusal is logged with the actor, ability and target', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create();
    $target->assignRole($administratorRole);

    try {
        Livewire::test(Index::class)->call('openEditModal', $target->id);
    } catch (AuthorizationException) {
        // Expected -- asserted properly by the sibling "still throws" test below. This test is
        // only about what got logged before the exception propagated.
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $administrator->id
            && ($context['ability'] ?? null) === 'updateSensitiveAttributes'
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

// This is the test that fails if a fix swallows the AuthorizationException while adding logging
// -- deliberately separate from the log-content assertion above, per the task file's own
// "Users -- the refusal still refuses" bullet.
test('openEditModal() refusal still throws and leaves editingUserId/editingPendingEmail/status unpopulated', function () {
    $this->withoutExceptionHandling();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create();
    $target->assignRole($administratorRole);

    $component = Livewire::test(Index::class);

    expect(fn () => $component->call('openEditModal', $target->id))
        ->toThrow(AuthorizationException::class);

    expect($component->get('editingUserId'))->toBeNull()
        ->and($component->get('editingPendingEmail'))->toBeNull()
        // status defaults to Inactive->value (never null -- see the property's own docblock);
        // the point here is that it was never overwritten with the target's real status.
        ->and($component->get('status'))->toBe(UserStatus::Inactive->value);
});

// =====================================================================
// The remaining 4 Gate-shaped sites -- one dedicated test each.
// =====================================================================

test('openCreateModal() authorization refusal is logged, with no target', function () {
    Log::spy();

    // users.view (only) so mount()'s own viewAny gate succeeds and this test isolates
    // openCreateModal()'s OWN 'create' refusal rather than mount()'s.
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.view');
    $this->actingAs($actor);

    try {
        Livewire::test(Index::class)->call('openCreateModal');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && array_key_exists('target_id', $context) && $context['target_id'] === null
            && usersRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

// save()'s create branch is reachable directly -- editingUserId defaults to null (Locked, never
// set by this test), so save() takes the create branch and its own Gate::authorize('create', ...)
// at :184 fires without needing openCreateModal() to have been called first.
test('save() create-branch authorization refusal is logged, with no target', function () {
    Log::spy();

    // users.view (only) so mount() succeeds and this isolates save()'s own 'create' refusal.
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.view');
    $this->actingAs($actor);

    try {
        Livewire::test(Index::class)
            ->set('name', 'Should Not Persist')
            ->set('email', 'should-not-persist@arospe.es')
            ->call('save');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && usersRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(User::where('email', 'should-not-persist@arospe.es')->exists())->toBeFalse();
});

// save()'s update branch (:187 Gate::authorize('update', $target)) is only reachable once
// editingUserId is populated, which only openEditModal() can do -- and openEditModal() gates
// updateSensitiveAttributes for any OTHER target. The self-row exemption
// (`! $target->is(Auth::user())`) is what lets an actor with ZERO permissions open the edit
// modal on their OWN row unchecked, isolating save()'s own :187 refusal from openEditModal()'s.
test('save() update-branch authorization refusal is logged, targeting the acting users own row', function () {
    Log::spy();

    // users.view (only, deliberately NOT users.edit) so mount() and openEditModal()'s self-row
    // exemption both succeed, isolating save()'s own :187 'update' refusal.
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.view');
    $this->actingAs($actor);

    $component = Livewire::test(Index::class)->call('openEditModal', $actor->id);

    try {
        $component->set('name', 'Should Not Persist')->call('save');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $actor->id
            && usersRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($actor->fresh()->name)->not->toBe('Should Not Persist');
});

test('confirmDelete() authorization refusal is logged', function () {
    Log::spy();

    // users.view (only) so mount() succeeds and this isolates confirmDelete()'s own 'delete'
    // refusal.
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.view');
    $this->actingAs($actor);

    $target = User::factory()->create();

    try {
        Livewire::test(Index::class)->call('confirmDelete', $target->id);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'delete'
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(User::find($target->id))->not->toBeNull();
});

// deleteUser()'s own Gate::authorize('delete', ...) at :328 is only reachable once
// deletingUserId is populated by confirmDelete() -- which authorizes 'delete' too. The
// permission is granted to open the modal, then revoked before the mutating call, matching the
// shipped precedent at tests/Feature/Users/IndexTest.php's "authorization for editing is
// re-checked inside save" / "...is denied, and that user still exists" tests.
test('deleteUser() authorization refusal is logged', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $target = User::factory()->create();

    $component = Livewire::test(Index::class)->call('confirmDelete', $target->id);

    $administrator->removeRole('Administrator');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('deleteUser');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $administrator->id
            && ($context['ability'] ?? null) === 'delete'
            && ($context['target_type'] ?? null) === 'user'
            && ($context['target_id'] ?? null) === $target->id
            && usersRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(User::find($target->id))->not->toBeNull();
});

// =====================================================================
// "Domain actions — the refusal still refuses, identically" (Gate-shaped, component-mediated
// counterpart): a second, independent proof that logging cannot swallow an exception, run
// through a DIFFERENT site than the openEditModal() one above (confirmDelete()), so a fix that
// only special-cased one call site would still be caught.
// =====================================================================

test('confirmDelete() refusal still throws and leaves the delete modal unopened', function () {
    $this->withoutExceptionHandling();

    // users.view (only) so building $component below (which mounts the component) does not
    // itself throw -- isolating confirmDelete()'s own refusal in the closure that follows.
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.view');
    $this->actingAs($actor);

    $target = User::factory()->create();

    $component = Livewire::test(Index::class);

    expect(fn () => $component->call('confirmDelete', $target->id))
        ->toThrow(AuthorizationException::class);

    expect($component->get('deletingUserId'))->toBeNull()
        ->and($component->get('showDeleteModal'))->toBeFalse();
});

// =====================================================================
// Gherkin scenario 3 — "A refused rate-limited creation is recorded", distinguishable from an
// authorization refusal. Driven directly through CreateUser (bypassing the Livewire layer) for
// speed, exactly as tests/Feature/Users/CreateUserActionAuthorizationTest.php's own rate-limit
// tests do -- Index has no rate limiter of its own in front of this one, so the refusal that
// reaches save() IS CreateUser's.
// =====================================================================

test('an 11th CreateUser call within the window logs a rate-limit refusal distinguishable from an authorization refusal', function () {
    Log::spy();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.create');
    $this->actingAs($actor);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $createUser = app(CreateUser::class);

    for ($i = 0; $i < 10; $i++) {
        $createUser("Hire {$i}", "refusal-throttle-hire-{$i}@arospe.es", (string) $role->id, UserStatus::Active);
    }

    try {
        $createUser('Eleventh Hire', 'refusal-throttle-hire-11@arospe.es', (string) $role->id, UserStatus::Active);
    } catch (ValidationException) {
        //
    }

    // The 'ability' value is the pre-agreed, Named-now non-Gate reason string for this
    // specific site (task file's "Context keys" paragraph) -- distinct from any of the 38 real
    // permission names in the seeded catalog, so a log reader can never confuse the two.
    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create_rate_limited'
            && $context['ability'] !== 'create' // distinguishable from the base authorization ability
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && usersRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(User::where('email', 'refusal-throttle-hire-11@arospe.es')->exists())->toBeFalse();
});

// =====================================================================
// Gherkin scenario 4 — "A refusal log entry never carries a credential", across BOTH an
// authorization refusal and a rate-limit refusal. Asserted on the recorded context ARRAY (its
// keys), never on a rendered/serialized string, per the task file's explicit instruction and the
// errors-log's count/substring-assertion lesson.
// =====================================================================

test('no credential-shaped key ever reaches the log across an authorization refusal and a rate-limit refusal', function () {
    Log::spy();

    // -- Authorization refusal --
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create();
    $target->assignRole($administratorRole);

    try {
        Livewire::test(Index::class)->call('openEditModal', $target->id);
    } catch (AuthorizationException) {
        //
    }

    // -- Rate-limit refusal (CreateUser directly, so 10 invitations are actually generated and
    // consumed internally -- exactly the scenario a leaked password/token would surface in) --
    $creator = User::factory()->create();
    $creator->givePermissionTo('users.create');
    $this->actingAs($creator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $createUser = app(CreateUser::class);

    for ($i = 0; $i < 10; $i++) {
        $createUser("Hire {$i}", "credential-check-hire-{$i}@arospe.es", (string) $role->id, UserStatus::Active);
    }

    try {
        $createUser('Eleventh Hire', 'credential-check-hire-11@arospe.es', (string) $role->id, UserStatus::Active);
    } catch (ValidationException) {
        //
    }

    // Proven capable of failing (not vacuous): this assertion inspects EVERY recorded key on
    // EVERY 'Privileged action refused' call, so a future site that logs e.g. 'password_hint' or
    // 'invitation_token' fails it -- unlike asserting Log::spy() was "not called with the wrong
    // args", which would pass even with zero calls recorded at all.
    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message !== 'Privileged action refused'
            || usersRefusalLogContextHasNoSecretLookingKey($context))
        ->atLeast()->times(2);
});

// =====================================================================
// Must-not-over-log — a permitted create/edit/delete produces exactly the existing single
// Log::info success line and NO Log::warning refusal line. Story 0015's own audit-log tests
// (tests/Feature/Users/IndexAuditLogTest.php) must keep passing UNAMENDED alongside these; run
// separately (not modified here) to confirm.
// =====================================================================

test('a permitted create produces no refusal entry', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Permitted Hire')
        ->set('email', 'permitted-hire@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    Log::shouldNotHaveReceived('warning');
    Log::shouldHaveReceived('info')->withArgs(fn (string $message): bool => $message === 'User created')->once();
});

test('a permitted edit produces no refusal entry', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['name' => 'Before Name']);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('name', 'After Name')
        ->call('save')
        ->assertHasNoErrors();

    Log::shouldNotHaveReceived('warning');
    Log::shouldHaveReceived('info')->withArgs(fn (string $message): bool => $message === 'User updated')->once();
});

test('a permitted delete produces no refusal entry', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    session(['auth.password_confirmed_at' => now()->unix()]);

    $target = User::factory()->create();

    Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->call('deleteUser');

    Log::shouldNotHaveReceived('warning');
    Log::shouldHaveReceived('info')->withArgs(fn (string $message): bool => $message === 'User deleted')->once();
});

// =====================================================================
// Regression-proof for at least one assertion per screen (per this repo's standing convention,
// docs/errors-log.md's vacuous-arch()-rule and count-assertion entries): the assertion shape
// used throughout this file -- `Log::shouldHaveReceived('warning')->withArgs(fn (...) =>
// <positive shape match>)->once()` -- can ONLY pass if Log::warning is actually called with
// matching arguments. It is structurally incapable of passing on zero calls (unlike asserting
// "was NOT called with the wrong arguments", the trap docs/errors-log.md's 2026-08-18 entry
// warns about), and today, with no App\Actions\Auth\LogRefusedPrivilegedAttempt call anywhere in
// the codebase, EVERY test above fails for exactly that reason -- proven by the full-suite run
// accompanying this file's introduction (see the QA agent's report for the actual failure
// output). No separate "remove the call and watch it go red" step is possible before the call
// exists; this file's current all-red state IS that proof.
// =====================================================================
