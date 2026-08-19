<?php

// Story 0008a — App\Actions\Users\CreateUser must refuse an unprivileged
// Administrator-role creation ON ITS OWN, independently of App\Livewire\
// Users\Index. Every test in this file resolves the action from the
// container and calls it DIRECTLY -- never through Livewire::test() --
// because that is the actual gap this story closed: before it, only the
// Livewire component checked anything, so a future API endpoint, Artisan
// command or queued job calling CreateUser directly would have been
// completely ungated. The dashboard-mediated coverage for the same
// scenarios already exists in tests/Feature/Users/IndexTest.php and must
// keep passing unamended -- it is not duplicated here.

use App\Actions\Users\CreateUser;
use App\Enums\RoleName;
use App\Enums\UserStatus;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// =====================================================================
// The headline test — a direct call is independently refused. Would have
// passed the pre-story Index-mediated tests while still succeeding in
// reality, because nothing in CreateUser itself checked anything before
// this story.
// =====================================================================

test('creating a user with the Administrator role directly throws for an actor lacking roles.manage-administrators, and creates no user', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.create'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $countBefore = User::count();

    expect(fn () => app(CreateUser::class)('New Administrator', 'new.administrator.direct@arospe.es', (string) $administratorRole->id, UserStatus::Active))
        ->toThrow(AuthorizationException::class);

    expect(User::count())->toBe($countBefore)
        ->and(User::where('email', 'new.administrator.direct@arospe.es')->exists())->toBeFalse();
});

// =====================================================================
// Happy path / regression — the relocated guard is not a blanket refusal.
// The equivalent dashboard-mediated flow is already covered by IndexTest.php;
// this proves the action itself behaves identically when called directly.
// =====================================================================

test('creating a user with the Administrator role directly succeeds for an actor holding roles.manage-administrators', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.create', 'roles.manage-administrators']);
    $this->actingAs($actor);

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $created = app(CreateUser::class)('New Administrator', 'new.administrator.allowed@arospe.es', (string) $administratorRole->id, UserStatus::Active);

    expect($created->hasRole('Administrator'))->toBeTrue();
});

// =====================================================================
// Narrowness — the guard stays scoped to the Administrator role.
// =====================================================================

test('creating a user with an ordinary role directly needs no roles.manage-administrators permission', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.create');
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    $created = app(CreateUser::class)('New Hire', 'new.hire.narrow@arospe.es', (string) $editorRole->id, UserStatus::Active);

    expect($created->hasRole('Editor'))->toBeTrue();
});

// =====================================================================
// Edge — no Administrator role row present (fresh database, before
// RolePermissionSeeder has run its Administrator-creating branch).
// Nothing is wrongly blocked when the row simply does not exist.
// =====================================================================

test('with no Administrator role row present, creating a user with an ordinary role completes without error', function () {
    DB::table('roles')->where('name', RoleName::Administrator->value)->where('guard_name', 'web')->delete();
    expect(Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->exists())->toBeFalse();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.create');
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    $created = app(CreateUser::class)('New Hire', 'new.hire.no-admin-row@arospe.es', (string) $editorRole->id, UserStatus::Active);

    expect($created->hasRole('Editor'))->toBeTrue();
});

// =====================================================================
// Edge — a roleId matching no role at all is not administrator-level
// (nothing can be promoted into a role that does not exist), and fails
// on its own rather than being silently treated as a promotion or a
// bypass of the authorization gate.
// =====================================================================

test('a roleId matching no role at all when creating is not treated as a promotion, and fails on its own', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.create'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $caught = null;

    try {
        app(CreateUser::class)('New Hire', 'new.hire.bad-role-id@arospe.es', '999999999', UserStatus::Active);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull()
        ->and($caught)->not->toBeInstanceOf(AuthorizationException::class)
        ->and(User::where('email', 'new.hire.bad-role-id@arospe.es')->exists())->toBeFalse();
});

// =====================================================================
// Phase 4 audit finding F1 — the Super Admin role is never assignable
// through this action, by ANYONE: no ability grants it, unlike the
// Administrator role which promoteToAdministrator can grant. Before this
// fix, isAdministratorRole() correctly answered false for the Super Admin
// role (the two tiers are not aliased) and nothing else checked it at
// all, so an actor holding every permission could mint a second,
// Gate::before-bypassing Super Admin account.
// =====================================================================

test('creating a user with the Super Admin role directly throws for an actor holding every permission, and creates no user', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.create', 'roles.manage-administrators']);
    $this->actingAs($actor);

    $superAdminRole = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();
    $countBefore = User::count();

    expect(fn () => app(CreateUser::class)('New Super Admin', 'new.super-admin.direct@arospe.es', (string) $superAdminRole->id, UserStatus::Active))
        ->toThrow(AuthorizationException::class);

    expect(User::count())->toBe($countBefore)
        ->and(User::where('email', 'new.super-admin.direct@arospe.es')->exists())->toBeFalse();
});

// =====================================================================
// Phase 4 audit finding F1 — the base users.create ability is checked by
// the action itself, not only by the dashboard.
// =====================================================================

test('creating a user directly throws for an actor holding no permissions at all', function () {
    $actor = User::factory()->create();
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $countBefore = User::count();

    expect(fn () => app(CreateUser::class)('New Hire', 'new.hire.no-permission@arospe.es', (string) $editorRole->id, UserStatus::Active))
        ->toThrow(AuthorizationException::class);

    expect(User::count())->toBe($countBefore);
});
