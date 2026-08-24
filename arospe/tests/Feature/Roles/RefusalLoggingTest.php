<?php

// Story 0015b — App\Livewire\Roles\Index logs a structured Log::warning('Privileged action
// refused', [...]) line for every Gate::authorize() refusal it surfaces, the same shape and
// level as tests/Feature/Users/RefusalLoggingTest.php's sibling component -- so a log filter
// covers both admin screens with one pattern. RED-phase: App\Actions\Auth\
// LogRefusedPrivilegedAttempt does not exist yet, so every test below is expected to fail
// because no Log::warning is ever recorded, not because of an unrelated setup error.
//
// =====================================================================================
// COVERAGE CHECKLIST -- the 7 Gate::authorize() sites in this component:
//
//   1. mount()             :90  viewAny  -- DELIBERATELY NOT COVERED HERE, same reasoning as
//      tests/Feature/Users/RefusalLoggingTest.php's identical decision for its own mount():
//      `can:roles.manage` is on Livewire's PersistentMiddleware allow-list, so a real HTTP actor
//      failing this check never reaches the route in the first place; whether to log this
//      defense-in-depth refusal at all is left to Phase 3, not pre-agreed the way the other 6
//      sites are.
//   2. openCreateModal()   :106 create   -- 'openCreateModal() authorization refusal is logged'
//   3. openEditModal()     :125 update   -- 'openEditModal() authorization refusal is logged...' (Gherkin scenario 2) + 'openEditModal() refusal still throws...'
//   4. saveRole() create    :148 create  -- 'saveRole() create-branch authorization refusal is logged'
//   5. saveRole() update    :152 update  -- 'saveRole() update-branch authorization refusal is logged'
//   6. confirmDeleteRole() :276 delete   -- 'confirmDeleteRole() authorization refusal is logged'
//   7. deleteRole()        :307 delete   -- 'deleteRole() authorization refusal is logged'
//
// Non-Gate refusals owned by THIS component's own methods (the self-lockout ValidationException
// at saveRole():209, the holders-remaining ValidationException at deleteRole():310) are covered
// here too, since they are reachable through the component with no action-layer detour needed.
// The two Roles ACTIONS' own refusals (EnforceAdministratorPermissionGrant,
// EnforceGrantorPermissionScope) are covered separately in
// tests/Feature/Roles/ActionRefusalLoggingTest.php, called directly per Q5/the 0008a
// independently-callable-action precedent, since -- like the Users actions -- they authorize
// against an explicit $actor parameter rather than Auth::user(), and their own base checks are
// upstream of what the component's own gates would let through for the same actor/target.
// =====================================================================================

use App\Livewire\Roles\Index;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

/**
 * @param  array<string, mixed>  $context
 */
function rolesRefusalLogContextHasNoSecretLookingKey(array $context): bool
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
 * Local re-implementation of tests/Feature/Roles/IndexTest.php's `rolesTestPermission()` /
 * `rolesTestActor()` -- Pest test files do not share file-scoped functions with each other, and
 * duplicating this ~10-line fixture helper is this repo's own existing convention (compare
 * tests/Feature/Users/IndexAuditLogTest.php's locally-defined secret-key check against
 * tests/Feature/Users/RefusalLoggingTest.php's).
 */
function refusalTestPermission(string $name): Permission
{
    return Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
}

/**
 * @param  array<int, string>  $extraPermissions
 */
function refusalTestActor(array $extraPermissions = []): User
{
    refusalTestPermission('roles.manage');

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    foreach ($extraPermissions as $permission) {
        refusalTestPermission($permission);
        $actor->givePermissionTo($permission);
    }

    return $actor;
}

// =====================================================================
// Gherkin scenario 2 — "A refused role-management attempt is recorded".
// =====================================================================

test('openEditModal() authorization refusal is logged with the actor, ability and target', function () {
    Log::spy();

    $role = Role::create(['name' => 'Sensitive Role Name', 'guard_name' => 'web']);

    $actor = refusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class);

    $actor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('openEditModal', $role->id);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'role'
            && ($context['target_id'] ?? null) === $role->id
            && rolesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('openEditModal() refusal still throws and discloses no part of the target role', function () {
    $this->withoutExceptionHandling();

    $role = Role::create(['name' => 'Sensitive Role Name', 'guard_name' => 'web']);

    $actor = refusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class);

    $actor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('openEditModal', $role->id))
        ->toThrow(AuthorizationException::class);

    expect($component->get('name'))->toBe('')
        ->and($component->get('selectedPermissionIds'))->toBe([]);
});

// =====================================================================
// The remaining 5 Gate-shaped / non-Gate sites.
// =====================================================================

test('openCreateModal() authorization refusal is logged, with no target', function () {
    Log::spy();

    $actor = refusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class); // mount() succeeds -- actor holds roles.manage

    $actor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('openCreateModal');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && rolesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('saveRole() create-branch authorization refusal is logged, with no target', function () {
    Log::spy();

    $actor = refusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class)->call('openCreateModal');

    $actor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->set('name', 'Should Not Persist')->call('saveRole');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && rolesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(Role::where('name', 'Should Not Persist')->exists())->toBeFalse();
});

test('saveRole() update-branch authorization refusal is logged', function () {
    Log::spy();

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $actor = refusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class)->call('openEditModal', $role->id);

    $actor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->set('name', 'Renamed Without Permission')->call('saveRole');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'role'
            && ($context['target_id'] ?? null) === $role->id
            && rolesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($role->fresh()->name)->toBe('Blog Editor');
});

test('confirmDeleteRole() authorization refusal is logged', function () {
    Log::spy();

    $role = Role::create(['name' => 'Sensitive Role Name', 'guard_name' => 'web']);

    $actor = refusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class);

    $actor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('confirmDeleteRole', $role->id);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'delete'
            && ($context['target_type'] ?? null) === 'role'
            && ($context['target_id'] ?? null) === $role->id
            && rolesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('deleteRole() authorization refusal is logged', function () {
    Log::spy();

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $actor = refusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class)->call('confirmDeleteRole', $role->id);

    $actor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('deleteRole');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'delete'
            && ($context['target_type'] ?? null) === 'role'
            && ($context['target_id'] ?? null) === $role->id
            && rolesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(Role::find($role->id))->not->toBeNull();
});

// "The refusal still refuses, identically" — a second, independent site from openEditModal()'s
// own still-throws test above.
test('deleteRole() refusal still throws and the role still exists', function () {
    $this->withoutExceptionHandling();

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $actor = refusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class)->call('confirmDeleteRole', $role->id);

    $actor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('deleteRole'))->toThrow(AuthorizationException::class);
    expect(Role::find($role->id))->not->toBeNull();
});

// =====================================================================
// Non-Gate refusals owned directly by this component: self-lockout (saveRole():209) and
// holders-remaining (deleteRole():310), both ValidationException-shaped -- Livewire's test
// harness catches these into $component->errors() rather than re-throwing, so the "still
// refuses" half of each test below is `assertHasErrors()` / persistence-unchanged, matching the
// shipped precedent at tests/Feature/Roles/IndexTest.php's identical scenarios.
// =====================================================================

test('the self-lockout refusal is logged, distinguishable from an authorization refusal, and the role is left unchanged', function () {
    Log::spy();

    $roleManage = refusalTestPermission('roles.manage');
    $blogView = refusalTestPermission('blog.view');

    $actor = refusalTestActor(['blog.view']);
    $ownRole = Role::create(['name' => 'Custom Manager', 'guard_name' => 'web']);
    $ownRole->syncPermissions([$roleManage->name, $blogView->name]);
    $actor->assignRole($ownRole);
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $ownRole->id)
        ->set('selectedPermissionIds', [$blogView->id])
        ->call('saveRole')
        ->assertHasErrors(['selectedPermissionIds']);

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'self_lockout'
            && $context['ability'] !== 'update' // distinguishable from an authorization refusal
            && ($context['target_type'] ?? null) === 'role'
            && ($context['target_id'] ?? null) === $ownRole->id
            && rolesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($ownRole->fresh()->permissions->pluck('name')->sort()->values()->all())
        ->toBe(['blog.view', 'roles.manage']);
});

test('the holders-remaining delete refusal is logged and the role is left intact', function () {
    Log::spy();

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $holder = User::factory()->create();
    $holder->assignRole($role);

    $actor = refusalTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('confirmDeleteRole', $role->id)
        ->call('deleteRole')
        ->assertHasErrors(['deletingRoleId']);

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && is_string($context['ability'] ?? null) && $context['ability'] !== 'delete'
            && ($context['target_type'] ?? null) === 'role'
            && ($context['target_id'] ?? null) === $role->id
            && rolesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(Role::find($role->id))->not->toBeNull();
});

// =====================================================================
// Must-not-over-log — a permitted create, edit and delete on THIS screen still produce exactly
// the existing single Log::info success line and NO Log::warning refusal line (Phase 5 finding
// R-2(a) — tests/Feature/Users/RefusalLoggingTest.php already carries the Users-side three; this
// screen had none). Each scenario below deliberately runs adjacent to the ONE Roles-only refusal
// shape most capable of over-firing on a legitimate save/delete -- self-lockout (saveRole():227)
// and holders-remaining (deleteRole():332) -- so a passing test here is not merely "nothing was
// exercised near the guard", the way an unrelated create/rename would be.
// =====================================================================

test('a permitted create produces no refusal entry', function () {
    Log::spy();

    $blogView = refusalTestPermission('blog.view');

    // Holds blog.view directly (not only through the role being created), so
    // EnforceGrantorPermissionScope -- which refuses a NEWLY granted permission the actor does
    // not themselves currently hold -- has no reason to refuse this save.
    $actor = refusalTestActor(['blog.view']);
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Permitted New Role')
        ->set('selectedPermissionIds', [$blogView->id])
        ->call('saveRole')
        ->assertHasNoErrors();

    Log::shouldNotHaveReceived('warning');
    Log::shouldHaveReceived('info')->withArgs(fn (string $message): bool => $message === 'Role saved')->once();

    expect(Role::where('name', 'Permitted New Role')->exists())->toBeTrue();
});

test('a permitted edit that keeps the actor\'s own roles.manage grant produces no refusal entry', function () {
    Log::spy();

    $roleManage = refusalTestPermission('roles.manage');
    $blogView = refusalTestPermission('blog.view');

    // The actor holds roles.manage AND is assigned the very role being edited -- the exact
    // precondition saveRole()'s self-lockout guard checks (Auth::user()->hasRole($role->name)) --
    // but the save below keeps roles.manage in the submitted permission set, so the guard's
    // `! in_array(ROLE_MANAGEMENT_PERMISSION, $permissionNames, true)` branch is never true.
    $actor = refusalTestActor(['blog.view']);
    $ownRole = Role::create(['name' => 'Custom Manager', 'guard_name' => 'web']);
    $ownRole->syncPermissions([$roleManage->name, $blogView->name]);
    $actor->assignRole($ownRole);
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $ownRole->id)
        ->set('name', 'Custom Manager Renamed')
        ->set('selectedPermissionIds', [$roleManage->id, $blogView->id])
        ->call('saveRole')
        ->assertHasNoErrors();

    Log::shouldNotHaveReceived('warning');
    Log::shouldHaveReceived('info')->withArgs(fn (string $message): bool => $message === 'Role saved')->once();

    expect($ownRole->fresh()->name)->toBe('Custom Manager Renamed');
});

test('a permitted delete of a role with zero holders produces no refusal entry', function () {
    Log::spy();

    $actor = refusalTestActor();
    $this->actingAs($actor);

    // Zero holders -- deleteRole()'s `$role->users_count > 0` branch (the one that logs
    // 'holders_remaining') is adjacent but never entered.
    $role = Role::create(['name' => 'Unheld Role', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('confirmDeleteRole', $role->id)
        ->call('deleteRole');

    Log::shouldNotHaveReceived('warning');
    Log::shouldHaveReceived('info')->withArgs(fn (string $message): bool => $message === 'Role deleted')->once();

    expect(Role::find($role->id))->toBeNull();
});

// =====================================================================
// "The two screens emit the same line shape at the same level" — the equivalence test the
// acceptance criteria explicitly require, asserted directly rather than each screen asserting
// its own shape in isolation. Compares the Roles openEditModal() refusal captured here against a
// freshly-produced Users openEditModal() refusal, keyed the same way
// tests/Feature/Users/RefusalLoggingTest.php's own "openEditModal() authorization refusal is
// logged..." test captures it.
// =====================================================================

test('the Roles and Users screens refusal log lines share exactly the same shape', function () {
    Log::spy();

    // -- Roles refusal --
    $rolesTarget = Role::create(['name' => 'Sensitive Role Name', 'guard_name' => 'web']);
    $rolesActor = refusalTestActor();
    $this->actingAs($rolesActor);
    $rolesComponent = Livewire::test(Index::class);
    $rolesActor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $rolesComponent->call('openEditModal', $rolesTarget->id);
    } catch (AuthorizationException) {
        //
    }

    // -- Users refusal (a second, distinct actor/target pair, same session). Deliberately the
    // simplest possible Users refusal -- an actor holding NO permission at all, refused at the
    // base updateSensitiveAttributes ability -- rather than reproducing the
    // roles.manage-administrators/Administrator-tier scenario tests/Feature/Users/
    // RefusalLoggingTest.php's own dedicated test already covers: this test is only about
    // whether the CONTEXT SHAPE matches across screens, not about re-proving either screen's own
    // authorization rules a second time. --
    // This file never seeds RolePermissionSeeder, so 'users.view'/'users.edit' do not exist as
    // permission ROWS yet -- UserPolicy::viewAny()/update() calling hasPermissionTo() on either
    // name throws Spatie's own PermissionDoesNotExist otherwise, regardless of whether the actor
    // HOLDS it. refusalTestPermission() registers the row without granting it.
    refusalTestPermission('users.view');
    refusalTestPermission('users.edit');
    // loadUsers() (called from mount(), after the viewAny gate) evaluates
    // Gate::allows('delete'|'updateSensitiveAttributes', ...) for every row it renders, which
    // needs these permission ROWS to exist too, or Spatie throws PermissionDoesNotExist for the
    // SAME reason as users.view/users.edit above.
    refusalTestPermission('users.delete');
    refusalTestPermission('roles.manage-administrators');

    // users.view (only) so App\Livewire\Users\Index::mount()'s own viewAny gate succeeds --
    // without it, Livewire::test(...) itself would throw during mount(), and since that call is
    // dispatched through the full HTTP kernel (no withoutExceptionHandling() here), the
    // AuthorizationException is converted into a 403 HTML response instead of propagating; the
    // chained ->call('openEditModal', ...) then fails with an unrelated "Invalid Livewire
    // snapshot structure" error trying to parse that 403 page as component state. Isolating
    // openEditModal()'s OWN updateSensitiveAttributes refusal requires mount() to succeed first.
    $usersActor = User::factory()->create();
    $usersActor->givePermissionTo('users.view');
    $this->actingAs($usersActor);

    $usersTarget = User::factory()->create();

    try {
        Livewire::test(App\Livewire\Users\Index::class)->call('openEditModal', $usersTarget->id);
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

    // Every recorded refusal -- Roles' and Users' alike -- must expose the identical key set.
    // count(array_unique(..., SORT_REGULAR)) === 1 proves every entry in $keySets is the same
    // array, not merely that the first two happen to match.
    $serializedKeySets = array_map(fn (array $keys): string => implode(',', $keys), $keySets);
    expect(array_unique($serializedKeySets))->toHaveCount(1)
        ->and($keySets[0])->toBe(['ability', 'actor_id', 'target_id', 'target_type']);
});
