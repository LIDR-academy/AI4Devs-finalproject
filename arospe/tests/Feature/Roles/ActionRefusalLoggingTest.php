<?php

// Story 0015b, Q5 — App\Actions\Roles\EnforceAdministratorPermissionGrant and
// EnforceGrantorPermissionScope each log their own refusals, independently of
// App\Livewire\Roles\Index, with the SAME shape and level the two Livewire components use.
// Every test resolves the action from the container and calls it DIRECTLY, matching the
// precedent at tests/Feature/Roles/EnforceAdministratorPermissionGrantTest.php and
// tests/Feature/Roles/EnforceGrantorPermissionScopeTest.php.
//
// RED-phase: App\Actions\Auth\LogRefusedPrivilegedAttempt does not exist yet, so every test below
// is expected to fail because no Log::warning is ever recorded.
//
// The load-bearing difference from every other refusal site in this story: BOTH actions
// authorize against an EXPLICIT `User $actor` parameter, via `Gate::forUser($actor)` /
// `$actor->getAllPermissions()` -- never `Auth::user()` / `Auth::id()`. The task file's Q2
// revision (finding B3) exists specifically so a non-dashboard caller (a queued job, an Artisan
// command) that authenticates nobody still gets a correctly-attributed `actor_id` in the log --
// so every test below deliberately calls `actingAs()` with a DIFFERENT user than the one passed
// as `$actor`, and one test calls with NO authenticated session at all, proving `actor_id` tracks
// the explicit parameter rather than a bare Auth::id().
//
// =====================================================================================
// COVERAGE CHECKLIST (task file "Files to create/modify" -> Roles non-Gate refusals):
//
//   EnforceAdministratorPermissionGrant.php:71  Gate::forUser($actor)->authorize('grantAdministratorPermission', Role::class)
//     -- 'EnforceAdministratorPermissionGrant -- a new grant refusal is logged with the EXPLICIT actor, not Auth::id()'
//   EnforceGrantorPermissionScope.php:93        throw_if(...AuthorizationException::class...) (direct throw, non-Gate)
//     -- 'EnforceGrantorPermissionScope -- a scope-exceeding grant refusal is logged with the EXPLICIT actor, not Auth::id()'
// =====================================================================================

use App\Actions\Roles\EnforceAdministratorPermissionGrant;
use App\Actions\Roles\EnforceGrantorPermissionScope;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<string, mixed>  $context
 */
function rolesActionRefusalLogContextHasNoSecretLookingKey(array $context): bool
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
// EnforceAdministratorPermissionGrant
// =====================================================================

test('EnforceAdministratorPermissionGrant -- a new grant refusal is logged with the EXPLICIT actor, not Auth::id()', function () {
    Log::spy();

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    // Deliberately signed in as a DIFFERENT user -- proves the logged actor_id comes from the
    // $actor PARAMETER, not from a bare Auth::id() read inside the action.
    $bystander = User::factory()->create();
    $this->actingAs($bystander);

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    try {
        $enforce($actor, ['users.view', 'roles.manage-administrators'], null);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['actor_id'] ?? null) !== $bystander->id
            && ($context['ability'] ?? null) === 'grantAdministratorPermission'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && rolesActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('EnforceAdministratorPermissionGrant -- a new grant refusal on an existing role logs that roles target_type and id', function () {
    Log::spy();

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');
    $this->actingAs($actor);

    $target = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);
    $target->givePermissionTo('roles.manage');

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    try {
        $enforce($actor, ['roles.manage', 'roles.manage-administrators'], $target);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'grantAdministratorPermission'
            && ($context['target_type'] ?? null) === 'role'
            && ($context['target_id'] ?? null) === $target->id
            && rolesActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

// Proves the logged actor_id survives an entirely UNAUTHENTICATED caller (Auth::id() === null),
// exactly the queued-job/Artisan-command scenario Q5/Q2's revision exist for.
test('EnforceAdministratorPermissionGrant -- the explicit actor is logged correctly even with no authenticated session at all', function () {
    Log::spy();
    expect(Auth::id())->toBeNull();

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    try {
        $enforce($actor, ['users.view', 'roles.manage-administrators'], null);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && rolesActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

// "The refusal still refuses, identically" — this action returns the mutated permission list
// rather than throwing on every refusal shape (an omission is silently preserved, not refused);
// the one shape that DOES throw is a genuine new grant, asserted here.
test('EnforceAdministratorPermissionGrant refusal still throws AuthorizationException', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');
    $this->actingAs(User::factory()->create());

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    expect(fn () => $enforce($actor, ['users.view', 'roles.manage-administrators'], null))
        ->toThrow(AuthorizationException::class);
});

// =====================================================================
// EnforceGrantorPermissionScope
// =====================================================================

test('EnforceGrantorPermissionScope -- a scope-exceeding grant refusal is logged with the EXPLICIT actor, not Auth::id()', function () {
    Log::spy();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['roles.manage', 'users.view']); // deliberately NOT blog.view

    $bystander = User::factory()->create();
    $this->actingAs($bystander);

    $enforce = app(EnforceGrantorPermissionScope::class);

    try {
        $enforce($actor, ['users.view', 'blog.view'], null);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['actor_id'] ?? null) !== $bystander->id
            && is_string($context['ability'] ?? null)
            && $context['ability'] !== 'roles.manage' // distinct from any real permission name
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && rolesActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('EnforceGrantorPermissionScope -- a scope-exceeding grant refusal on an existing role logs that roles target_type and id', function () {
    Log::spy();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['roles.manage', 'users.view']);
    $this->actingAs($actor);

    $target = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);
    $target->givePermissionTo('users.view');

    $enforce = app(EnforceGrantorPermissionScope::class);

    try {
        $enforce($actor, ['users.view', 'blog.view'], $target);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && is_string($context['ability'] ?? null)
            && ($context['target_type'] ?? null) === 'role'
            && ($context['target_id'] ?? null) === $target->id
            && rolesActionRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('EnforceGrantorPermissionScope refusal still throws AuthorizationException and returns nothing', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');
    $this->actingAs(User::factory()->create());

    $enforce = app(EnforceGrantorPermissionScope::class);

    expect(fn () => $enforce($actor, ['users.view', 'blog.view'], null))
        ->toThrow(AuthorizationException::class);
});

// =====================================================================
// Must-not-over-log — a Super Admin actor is exempt from EnforceGrantorPermissionScope entirely
// (returns early, before any log could fire) and a permitted grant produces no refusal entry.
// =====================================================================

test('a Super Admin actor granting any permission through EnforceGrantorPermissionScope produces no refusal entry', function () {
    Log::spy();

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    $enforce = app(EnforceGrantorPermissionScope::class);

    $result = $enforce($superAdmin, ['users.view', 'blog.view', 'roles.manage'], null);

    expect($result)->toBe(['users.view', 'blog.view', 'roles.manage']);
    Log::shouldNotHaveReceived('warning');
});

test('a Super Admin actor granting roles.manage-administrators through EnforceAdministratorPermissionGrant produces no refusal entry', function () {
    Log::spy();

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    $enforce = app(EnforceAdministratorPermissionGrant::class);

    $result = $enforce($superAdmin, ['users.view', 'roles.manage-administrators'], null);

    expect($result)->toBe(['users.view', 'roles.manage-administrators']);
    Log::shouldNotHaveReceived('warning');
});
