<?php

// Story 0015a, Phase 4 finding F1 (decision D6) -- App\Actions\Users\CreateUser must refuse
// creating an ADMINISTRATOR-TIER user when the acting administrator's password confirmation is
// stale or absent, via App\Actions\Auth\EnsureRecentPasswordConfirmation, called immediately
// after the branch's own Gate::authorize('promoteToAdministrator', ...) call -- but must NOT
// block an ORDINARY-role creation, which reaches no step-up check at all. See
// ai-spec/tasks/in-progress/0015a-step-up-auth-privileged-user-actions.md's "Widened after Phase
// 4" section.
//
// Every test in this file resolves CreateUser DIRECTLY from the container and calls it as a
// callable -- never through Livewire::test() -- matching
// tests/Feature/Users/CreateUserActionAuthorizationTest.php's own convention (story 0008a): the
// guard must bind a non-dashboard caller too, not only the Livewire component. The dashboard-
// mediated coverage (the redirect the component converts this exception into) lives in
// tests/Feature/Users/IndexStepUpAuthorizationTest.php and is not duplicated here.
//
// Ordering under test throughout this file: a permission refusal (Gate::authorize()) must always
// win over a step-up refusal when both would apply -- the guard runs only AFTER the branch's own
// Gate call has passed, never before.

use App\Actions\Users\CreateUser;
use App\Enums\RoleName;
use App\Enums\UserStatus;
use App\Exceptions\PasswordConfirmationRequiredException;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * Marks the session's password confirmation as older than the app's configured timeout --
 * config('auth.password_timeout'), reused verbatim (decision D2, no Users-specific window) --
 * guaranteed stale regardless of that value.
 */
function markCreatePasswordConfirmationStale(): void
{
    session(['auth.password_confirmed_at' => now()->subSeconds(config('auth.password_timeout') + 60)->unix()]);
}

/**
 * Marks the session's password confirmation as just-now, written the same shape
 * Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::store() itself uses.
 */
function markCreatePasswordConfirmationFresh(): void
{
    session(['auth.password_confirmed_at' => now()->unix()]);
}

// =====================================================================
// The headline refusal -- Administrator-tier creation, confirmation
// absent (never set) and, separately, set but stale.
// =====================================================================

test('creating an Administrator-tier user is refused when the confirmation was never set this session, and no user is created', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.create', 'roles.manage-administrators']);
    $this->actingAs($actor);
    // auth.password_confirmed_at deliberately never written.

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $countBefore = User::count();

    expect(fn () => app(CreateUser::class)('New Administrator', 'stepup-create-never-set@arospe.es', (string) $administratorRole->id, UserStatus::Active))
        ->toThrow(PasswordConfirmationRequiredException::class);

    expect(User::count())->toBe($countBefore)
        ->and(User::where('email', 'stepup-create-never-set@arospe.es')->exists())->toBeFalse();
});

test('creating an Administrator-tier user is refused when the confirmation is stale, and no user is created', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.create', 'roles.manage-administrators']);
    $this->actingAs($actor);
    markCreatePasswordConfirmationStale();

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $countBefore = User::count();

    expect(fn () => app(CreateUser::class)('New Administrator', 'stepup-create-stale@arospe.es', (string) $administratorRole->id, UserStatus::Active))
        ->toThrow(PasswordConfirmationRequiredException::class);

    expect(User::count())->toBe($countBefore)
        ->and(User::where('email', 'stepup-create-stale@arospe.es')->exists())->toBeFalse();
});

// =====================================================================
// Happy path -- a fresh confirmation is not a blanket refusal.
// =====================================================================

test('creating an Administrator-tier user succeeds when the confirmation is fresh', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.create', 'roles.manage-administrators']);
    $this->actingAs($actor);
    markCreatePasswordConfirmationFresh();

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $created = app(CreateUser::class)('New Administrator', 'stepup-create-fresh@arospe.es', (string) $administratorRole->id, UserStatus::Active);

    expect($created->hasRole('Administrator'))->toBeTrue();
});

// =====================================================================
// Must-not-over-block -- an ORDINARY-role creation reaches no step-up
// check at all, regardless of confirmation freshness.
// =====================================================================

test('creating a user with an ordinary role succeeds despite a stale confirmation', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.create');
    $this->actingAs($actor);
    markCreatePasswordConfirmationStale();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    $created = app(CreateUser::class)('New Hire', 'stepup-create-ordinary@arospe.es', (string) $editorRole->id, UserStatus::Active);

    expect($created->hasRole('Editor'))->toBeTrue();
});

// =====================================================================
// Permission refusal must always win over step-up refusal. The guard
// runs only AFTER promoteToAdministrator's Gate::authorize() has already
// passed -- an actor who lacks that permission must see the permission
// refusal, never be told to merely re-confirm their password.
// =====================================================================

test('a stale confirmation does not mask a permission refusal for an actor lacking roles.manage-administrators', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.create'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);
    markCreatePasswordConfirmationStale();

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $countBefore = User::count();

    $caught = null;

    try {
        app(CreateUser::class)('New Administrator', 'stepup-create-no-permission@arospe.es', (string) $administratorRole->id, UserStatus::Active);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class)
        ->and($caught)->not->toBeInstanceOf(PasswordConfirmationRequiredException::class);

    expect(User::count())->toBe($countBefore);
});

// =====================================================================
// The guard binds a Super Admin actor too -- it is a direct throw, not a
// Gate check, so Gate::before's bypass does not exempt it.
// =====================================================================

test('the step-up guard binds a Super Admin actor creating an Administrator-tier user too', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);
    markCreatePasswordConfirmationStale();

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $countBefore = User::count();

    expect(fn () => app(CreateUser::class)('New Administrator', 'stepup-create-super-admin@arospe.es', (string) $administratorRole->id, UserStatus::Active))
        ->toThrow(PasswordConfirmationRequiredException::class);

    expect(User::count())->toBe($countBefore);
});
