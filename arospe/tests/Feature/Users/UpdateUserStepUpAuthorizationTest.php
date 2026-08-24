<?php

// Story 0015a -- step-up authentication for privileged Users actions.
//
// App\Actions\Users\UpdateUser must refuse a role or status change when the acting
// administrator's password confirmation is stale or absent, via
// App\Actions\Auth\EnsureRecentPasswordConfirmation, called from inside
// authorizeRoleAndStatusChange() -- but must NOT block a name-only edit, an email-only edit, or a
// self-edit (which never reaches authorizeRoleAndStatusChange() at all, since __invoke() only
// calls it when ! $isSelfEdit). See
// ai-spec/tasks/in-progress/0015a-step-up-auth-privileged-user-actions.md.
//
// Every test in this file resolves UpdateUser DIRECTLY from the container and calls it as a
// callable -- never through Livewire::test() -- matching
// tests/Feature/Users/UpdateUserActionAuthorizationTest.php's own convention (story 0008a): the
// guard must bind a non-dashboard caller too, not only the Livewire component. The dashboard-
// mediated coverage (the redirect the component converts this exception into) lives in
// tests/Feature/Users/IndexStepUpAuthorizationTest.php and is not duplicated here.
//
// Ordering under test throughout this file: a permission refusal (Gate::authorize()) must always
// win over a step-up refusal when both would apply -- the guard runs only AFTER every Gate call
// on its branch has passed, never before. Getting this backwards was story 0015's own round-1
// Phase 2 finding.

use App\Actions\Users\RequestEmailChange;
use App\Actions\Users\UpdateUser;
use App\Enums\RoleName;
use App\Enums\UserStatus;
use App\Exceptions\PasswordConfirmationRequiredException;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Carbon;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

afterEach(function () {
    Carbon::setTestNow();
});

/**
 * Marks the session's password confirmation as older than the app's configured timeout --
 * config('auth.password_timeout'), reused verbatim (decision D2, no Users-specific window) --
 * guaranteed stale regardless of that value.
 */
function markPasswordConfirmationStale(): void
{
    session(['auth.password_confirmed_at' => now()->subSeconds(config('auth.password_timeout') + 60)->unix()]);
}

/**
 * Marks the session's password confirmation as just-now, written the same shape
 * Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::store() itself uses:
 * $request->session()->put('auth.password_confirmed_at', Date::now()->unix()).
 */
function markPasswordConfirmationFresh(): void
{
    session(['auth.password_confirmed_at' => now()->unix()]);
}

// =====================================================================
// The headline refusals -- role change and status change, with the
// confirmation absent (never set) and, separately, set but stale.
// =====================================================================

test('a role change is refused when the confirmation was never set this session, and the role is left unchanged', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    // auth.password_confirmed_at deliberately never written -- the "never confirmed" case.

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, $target->name, $target->email, (string) $blogEditorRole->id, $target->status, app(RequestEmailChange::class)))
        ->toThrow(PasswordConfirmationRequiredException::class);

    expect($target->fresh()->hasRole('Editor'))->toBeTrue()
        ->and($target->fresh()->hasRole('Blog Editor'))->toBeFalse();
});

test('a role change is refused when the confirmation is older than the configured timeout, and the role is left unchanged', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    markPasswordConfirmationStale();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, $target->name, $target->email, (string) $blogEditorRole->id, $target->status, app(RequestEmailChange::class)))
        ->toThrow(PasswordConfirmationRequiredException::class);

    expect($target->fresh()->hasRole('Editor'))->toBeTrue();
});

test('a status change is refused when the confirmation is stale, and the status is left unchanged', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    markPasswordConfirmationStale();

    // The role id submitted is the target's own current role (a no-op), isolating this scenario
    // to a status-only change -- a role change is covered by its own tests above.
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, $target->name, $target->email, (string) $editorRole->id, UserStatus::Suspended, app(RequestEmailChange::class)))
        ->toThrow(PasswordConfirmationRequiredException::class);

    expect($target->fresh()->status)->toBe(UserStatus::Active);
});

// =====================================================================
// Happy path -- a fresh confirmation is not a blanket refusal.
// =====================================================================

test('a role change succeeds when the confirmation is fresh', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    markPasswordConfirmationFresh();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);
    $updateUser($target, $target->name, $target->email, (string) $blogEditorRole->id, $target->status, app(RequestEmailChange::class));

    expect($target->fresh()->hasRole('Blog Editor'))->toBeTrue();
});

test('a status change succeeds when the confirmation is fresh', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    markPasswordConfirmationFresh();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);
    $updateUser($target, $target->name, $target->email, (string) $editorRole->id, UserStatus::Suspended, app(RequestEmailChange::class));

    expect($target->fresh()->status)->toBe(UserStatus::Suspended);
});

// =====================================================================
// The exact boundary -- ">" not ">=", matching RequirePassword exactly.
// =====================================================================

test('a confirmation exactly at the configured timeout still allows a role change', function () {
    $timeout = config('auth.password_timeout');
    $now = Carbon::create(2026, 1, 1, 12, 0, 0);
    Carbon::setTestNow($now);

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    session(['auth.password_confirmed_at' => $now->clone()->subSeconds($timeout)->unix()]);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);
    $updateUser($target, $target->name, $target->email, (string) $blogEditorRole->id, $target->status, app(RequestEmailChange::class));

    expect($target->fresh()->hasRole('Blog Editor'))->toBeTrue();
});

test('a confirmation one second past the configured timeout refuses a role change', function () {
    $timeout = config('auth.password_timeout');
    $now = Carbon::create(2026, 1, 1, 12, 0, 0);
    Carbon::setTestNow($now);

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    session(['auth.password_confirmed_at' => $now->clone()->subSeconds($timeout + 1)->unix()]);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, $target->name, $target->email, (string) $blogEditorRole->id, $target->status, app(RequestEmailChange::class)))
        ->toThrow(PasswordConfirmationRequiredException::class);

    expect($target->fresh()->hasRole('Editor'))->toBeTrue();
});

// =====================================================================
// Must-not-over-block -- the guard must fire ONLY on an actual role/status
// change, never on the entry to authorizeRoleAndStatusChange() itself.
// =====================================================================

test('a name-only edit succeeds despite a stale confirmation', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    markPasswordConfirmationStale();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['name' => 'Original Name', 'status' => UserStatus::Active]);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);
    $updateUser($target, 'Renamed', $target->email, (string) $editorRole->id, $target->status, app(RequestEmailChange::class));

    expect($target->fresh()->name)->toBe('Renamed');
});

// This is the test that fails if the guard is attached to authorizeRoleAndStatusChange()'s ENTRY
// (which also runs for an email-only change, since that method also gates
// updateSensitiveAttributes for an email change) rather than to its role/status branches
// specifically -- exactly the over-block risk the story's Files-to-modify section calls out as
// "the single most likely way this story over-blocks".
test('an email-only change is accepted and parked as pending despite a stale confirmation', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    markPasswordConfirmationStale();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'stepup-email-only@arospe.es', 'status' => UserStatus::Active]);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);
    $updateUser($target, $target->name, 'stepup-email-only-new@arospe.es', (string) $editorRole->id, $target->status, app(RequestEmailChange::class));

    $target->refresh();
    expect($target->pending_email)->toBe('stepup-email-only-new@arospe.es')
        ->and($target->getRawOriginal('email'))->toBe('stepup-email-only@arospe.es');
});

test('a self-edit that submits a different role succeeds despite a stale confirmation, because no role change actually occurs', function () {
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    $actor = User::factory()->create(['status' => UserStatus::Active]);
    $actor->assignRole('Administrator');
    $actor->givePermissionTo(['users.edit', 'roles.manage-administrators']);
    $this->actingAs($actor);
    markPasswordConfirmationStale();

    $updateUser = app(UpdateUser::class);
    $updateUser($actor, $actor->name, $actor->email, (string) $editorRole->id, UserStatus::Suspended, app(RequestEmailChange::class));

    $actor->refresh();
    expect($actor->hasRole('Administrator'))->toBeTrue()
        ->and($actor->hasRole('Editor'))->toBeFalse()
        ->and($actor->status)->toBe(UserStatus::Active);
});

// =====================================================================
// Permission refusal must always win over step-up refusal. The guard runs
// only AFTER every Gate::authorize() call on its branch has already passed
// -- an actor who lacks the underlying permission must see the permission
// refusal, never be told to merely re-confirm their password.
// =====================================================================

test('a stale confirmation does not mask a permission refusal for a promotion the actor may not perform', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);
    markPasswordConfirmationStale();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    $caught = null;

    try {
        $updateUser($target, $target->name, $target->email, (string) $administratorRole->id, $target->status, app(RequestEmailChange::class));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class)
        ->and($caught)->not->toBeInstanceOf(PasswordConfirmationRequiredException::class);

    expect($target->fresh()->hasRole('Administrator'))->toBeFalse();
});

test('a stale confirmation does not mask a permission refusal for a downgrade the actor may not perform', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);
    markPasswordConfirmationStale();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($administratorRole);

    $updateUser = app(UpdateUser::class);

    $caught = null;

    try {
        $updateUser($target, $target->name, $target->email, (string) $editorRole->id, UserStatus::Active, app(RequestEmailChange::class));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class)
        ->and($caught)->not->toBeInstanceOf(PasswordConfirmationRequiredException::class);

    expect($target->fresh()->hasRole('Administrator'))->toBeTrue();
});

test('a stale confirmation does not mask a permission refusal for a sensitive status change on an Administrator target', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);
    markPasswordConfirmationStale();

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($administratorRole);

    $updateUser = app(UpdateUser::class);

    $caught = null;

    try {
        $updateUser($target, $target->name, $target->email, (string) $administratorRole->id, UserStatus::Suspended, app(RequestEmailChange::class));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class)
        ->and($caught)->not->toBeInstanceOf(PasswordConfirmationRequiredException::class);

    expect($target->fresh()->status)->toBe(UserStatus::Active);
});

test('a stale confirmation does not mask the base permission refusal for an actor holding no permissions at all', function () {
    $actor = User::factory()->create();
    $this->actingAs($actor);
    markPasswordConfirmationStale();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    $caught = null;

    try {
        $updateUser($target, $target->name, $target->email, (string) $blogEditorRole->id, $target->status, app(RequestEmailChange::class));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class)
        ->and($caught)->not->toBeInstanceOf(PasswordConfirmationRequiredException::class);
});

// =====================================================================
// The guard binds a Super Admin actor too -- it is a direct throw, not a
// Gate check, so Gate::before's bypass does not exempt it.
// =====================================================================

test('the step-up guard binds a Super Admin actor -- Gate::before does not exempt a direct throw', function () {
    $superAdminRole = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $actor = User::factory()->create();
    $actor->assignRole($superAdminRole);
    $this->actingAs($actor);
    markPasswordConfirmationStale();

    // Deliberately NOT a Super Admin target -- that would refuse for the unrelated "Super Admin
    // holder cannot be modified" reason, proving nothing about step-up.
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, $target->name, $target->email, (string) $blogEditorRole->id, $target->status, app(RequestEmailChange::class)))
        ->toThrow(PasswordConfirmationRequiredException::class);

    expect($target->fresh()->hasRole('Editor'))->toBeTrue();
});

// =====================================================================
// The refusal is not a 403, against the direct/non-dashboard-caller path.
// =====================================================================

test('the refusal against a direct call is PasswordConfirmationRequiredException rendering 423, never an AuthorizationException/403', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    markPasswordConfirmationStale();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    $caught = null;

    try {
        $updateUser($target, $target->name, $target->email, (string) $blogEditorRole->id, $target->status, app(RequestEmailChange::class));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(PasswordConfirmationRequiredException::class)
        ->and($caught)->not->toBeInstanceOf(AuthorizationException::class);

    /** @var PasswordConfirmationRequiredException $caught */
    $response = $caught->render(request());

    expect($response->getStatusCode())->toBe(423)
        ->and($response->getStatusCode())->not->toBe(403);
});

// =====================================================================
// Fail-closed with no session at all.
// =====================================================================

test('a caller invoking the action with no session at all is refused rather than exempted', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    // auth.password_confirmed_at deliberately never touched anywhere in this test.

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, $target->name, $target->email, (string) $blogEditorRole->id, $target->status, app(RequestEmailChange::class)))
        ->toThrow(PasswordConfirmationRequiredException::class);

    expect($target->fresh()->hasRole('Editor'))->toBeTrue();
});

// =====================================================================
// Re-confirming restores the ability to act, and signing out invalidates it.
// =====================================================================

test('re-confirming the password, written the same way ConfirmablePasswordController does, restores the ability to change a role', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    markPasswordConfirmationStale();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, $target->name, $target->email, (string) $blogEditorRole->id, $target->status, app(RequestEmailChange::class)))
        ->toThrow(PasswordConfirmationRequiredException::class);

    // Written exactly as Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::store()
    // does: $request->session()->put('auth.password_confirmed_at', Date::now()->unix()).
    markPasswordConfirmationFresh();

    $updateUser($target, $target->name, $target->email, (string) $blogEditorRole->id, $target->status, app(RequestEmailChange::class));

    expect($target->fresh()->hasRole('Blog Editor'))->toBeTrue();
});

test('signing out clears the confirmation, so a role change is refused again after signing back in', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);
    markPasswordConfirmationFresh();

    // Simulate a real sign-out: session invalidation is what actually removes
    // auth.password_confirmed_at from the session -- not merely time passing.
    session()->flush();
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, $target->name, $target->email, (string) $blogEditorRole->id, $target->status, app(RequestEmailChange::class)))
        ->toThrow(PasswordConfirmationRequiredException::class);

    expect($target->fresh()->hasRole('Editor'))->toBeTrue();
});
