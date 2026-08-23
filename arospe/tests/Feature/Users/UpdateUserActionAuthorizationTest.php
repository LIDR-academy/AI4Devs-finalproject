<?php

// Story 0008a — App\Actions\Users\UpdateUser must refuse an unprivileged
// promotion/downgrade/sensitive-attribute change ON ITS OWN, independently
// of App\Livewire\Users\Index, and must derive its own self-lockout guard
// rather than trusting a caller-supplied flag. Every test in this file
// resolves the action from the container and calls it DIRECTLY -- never
// through Livewire::test().
//
// The direct call is written against UpdateUser's real signature -- six
// positional arguments, ending in RequestEmailChange, with NO
// `bool $applyRoleAndStatus` parameter:
//
//     $updateUser($target, $name, $email, $roleId, $status, app(RequestEmailChange::class));
//
// Pre-story, this shape would have thrown a TypeError against the then-
// 7-parameter signature (position 6 expected bool, not a RequestEmailChange
// instance) -- the correct RED signal at the time: the call shape this
// story required did not fit the signature that existed before it. The
// dedicated reflection test below proves the parameter's removal directly,
// since a test that merely passes `false` for it would prove nothing once
// the parameter is gone.
//
// The dashboard-mediated coverage for the same scenarios already exists in
// tests/Feature/Users/IndexTest.php and must keep passing unamended -- it
// is not duplicated here.

use App\Actions\Users\RequestEmailChange;
use App\Actions\Users\UpdateUser;
use App\Enums\RoleName;
use App\Enums\UserStatus;
use App\Models\Role;
use App\Models\User;
use App\Notifications\PendingEmailVerification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// =====================================================================
// Signature — $applyRoleAndStatus is gone. Reflection, not behaviour: a
// test that only ever passes `false` for it would keep passing even if
// the parameter still existed.
// =====================================================================

test('UpdateUser no longer accepts an applyRoleAndStatus parameter', function () {
    $parameterNames = collect((new ReflectionMethod(UpdateUser::class, '__invoke'))->getParameters())
        ->map(fn (ReflectionParameter $parameter): string => $parameter->getName())
        ->all();

    expect($parameterNames)->not->toContain('applyRoleAndStatus');
});

// =====================================================================
// The headline tests — direct calls are independently refused, and the
// refusal happens BEFORE any write. Each of these submits a changed name
// alongside the refused role/status/email change and asserts the name is
// ALSO unchanged -- proving the check sits above every write, not merely
// above the role/status one.
// =====================================================================

test('updating a user directly to promote them to Administrator throws for an actor lacking roles.manage-administrators, and writes nothing', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $target = User::factory()->create(['name' => 'Original Name', 'email' => 'promote.target@arospe.es', 'status' => UserStatus::Inactive]);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, 'Changed Name', 'promote.target@arospe.es', (string) $administratorRole->id, UserStatus::Inactive, app(RequestEmailChange::class)))
        ->toThrow(AuthorizationException::class);

    $target->refresh();
    expect($target->name)->toBe('Original Name')
        ->and($target->hasRole('Administrator'))->toBeFalse()
        ->and($target->hasRole('Editor'))->toBeTrue();
});

test('updating a user directly to downgrade them from Administrator throws for an actor lacking roles.manage-administrators, and writes nothing', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $target = User::factory()->create(['name' => 'Original Name', 'email' => 'downgrade.target@arospe.es', 'status' => UserStatus::Active]);
    $target->assignRole($administratorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, 'Changed Name', 'downgrade.target@arospe.es', (string) $editorRole->id, UserStatus::Active, app(RequestEmailChange::class)))
        ->toThrow(AuthorizationException::class);

    $target->refresh();
    expect($target->name)->toBe('Original Name')
        ->and($target->hasRole('Administrator'))->toBeTrue()
        ->and($target->hasRole('Editor'))->toBeFalse();
});

test('updating a user directly to change an Administrators status throws for an actor lacking roles.manage-administrators, and writes nothing', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $target = User::factory()->create(['name' => 'Original Name', 'email' => 'status.target@arospe.es', 'status' => UserStatus::Active]);
    $target->assignRole($administratorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, 'Changed Name', 'status.target@arospe.es', (string) $administratorRole->id, UserStatus::Suspended, app(RequestEmailChange::class)))
        ->toThrow(AuthorizationException::class);

    $target->refresh();
    expect($target->name)->toBe('Original Name')
        ->and($target->status)->toBe(UserStatus::Active);
});

test('updating a user directly to change an Administrators email throws for an actor lacking roles.manage-administrators, and writes nothing', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $target = User::factory()->create(['name' => 'Original Name', 'email' => 'admin.target@arospe.es', 'status' => UserStatus::Active]);
    $target->assignRole($administratorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, 'Changed Name', 'attacker@arospe.es', (string) $administratorRole->id, UserStatus::Active, app(RequestEmailChange::class)))
        ->toThrow(AuthorizationException::class);

    $target->refresh();
    expect($target->name)->toBe('Original Name')
        ->and($target->email)->toBe('admin.target@arospe.es')
        ->and($target->pending_email)->toBeNull();
});

// =====================================================================
// Phase 4 audit finding F2 — the status-changed comparison reads the
// TARGET'S PERSISTED status, not its in-memory attribute. Before this fix,
// a caller that had already staged $user->status = $newStatus on the
// instance before invoking this action (e.g. a future controller doing
// $target->fill($request->all())) made the in-memory comparison silently
// false, skipping updateSensitiveAttributes entirely while still
// persisting the staged change.
// =====================================================================

test('updating an Administrators already-staged (but not yet persisted) status change still throws for an actor lacking roles.manage-administrators', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $target = User::factory()->create(['name' => 'Original Name', 'email' => 'staged-status.target@arospe.es', 'status' => UserStatus::Active]);
    $target->assignRole($administratorRole);

    // Simulate a caller that already staged the change on the instance
    // in-memory before invoking the action.
    $target->status = UserStatus::Suspended;

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, 'Changed Name', 'staged-status.target@arospe.es', (string) $administratorRole->id, UserStatus::Suspended, app(RequestEmailChange::class)))
        ->toThrow(AuthorizationException::class);

    $target->refresh();
    expect($target->name)->toBe('Original Name')
        ->and($target->status)->toBe(UserStatus::Active);
});

// =====================================================================
// Phase 4 audit finding F3 — the promotion/downgrade decision reads the
// target's role via $user->hasRole(), over the WHOLE roles collection, not
// via an unordered first() on a single row. Before this fix, a target
// holding more than one role could have its Administrator role silently
// stripped with no downgrade gate, depending on which row an unordered
// query happened to return first.
// =====================================================================

test('downgrading a user holding both Administrator and an ordinary role still throws for an actor lacking roles.manage-administrators', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $target = User::factory()->create(['name' => 'Original Name', 'email' => 'multi-role.target@arospe.es', 'status' => UserStatus::Active]);
    $target->assignRole($administratorRole);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, 'Changed Name', 'multi-role.target@arospe.es', (string) $editorRole->id, UserStatus::Active, app(RequestEmailChange::class)))
        ->toThrow(AuthorizationException::class);

    $target->refresh();
    expect($target->name)->toBe('Original Name')
        ->and($target->hasRole('Administrator'))->toBeTrue()
        ->and($target->hasRole('Editor'))->toBeTrue();
});

// =====================================================================
// Happy path / regression — the relocated guard is not a blanket refusal.
// =====================================================================

test('updating a user directly to promote them to Administrator succeeds for an actor holding roles.manage-administrators', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.edit', 'roles.manage-administrators']);
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $target = User::factory()->create(['email' => 'promote.allowed@arospe.es']);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);
    $updateUser($target, $target->name, 'promote.allowed@arospe.es', (string) $administratorRole->id, $target->status, app(RequestEmailChange::class));

    expect($target->fresh()->hasRole('Administrator'))->toBeTrue();
});

// =====================================================================
// Self-lockout cannot be re-enabled by a caller (decision D3). The action
// derives the self-edit guard from the authenticated user itself, so
// there is no argument a caller could pass to bypass it.
// =====================================================================

test('updating a user directly against their own account leaves their own role and status unchanged, even holding every permission', function () {
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create(['status' => UserStatus::Active]);
    $actor->assignRole($administratorRole);
    // Every user-management permission, users.edit included -- Gate::authorize('update', $user)
    // now runs unconditionally (Phase 4 finding F1), including on a self-edit, so the actor must
    // hold it to reach this action at all, same as the dashboard's own save() already required.
    $actor->givePermissionTo(['users.edit', 'roles.manage-administrators']);
    $this->actingAs($actor);

    $updateUser = app(UpdateUser::class);
    $updateUser($actor, $actor->name, $actor->email, (string) $editorRole->id, UserStatus::Suspended, app(RequestEmailChange::class));

    $actor->refresh();
    expect($actor->hasRole('Administrator'))->toBeTrue()
        ->and($actor->hasRole('Editor'))->toBeFalse()
        ->and($actor->status)->toBe(UserStatus::Active);
});

// =====================================================================
// Administrator-level identity is an exact, case-sensitive name match --
// a near-miss or differently-cased name is an ordinary role, freely
// assignable with users.edit alone.
// =====================================================================

test('assigning a custom role named "Administrador Regional" needs no roles.manage-administrators permission', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $customRole = Role::create(['name' => 'Administrador Regional', 'guard_name' => 'web']);
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'regional.target@arospe.es']);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);
    $updateUser($target, $target->name, 'regional.target@arospe.es', (string) $customRole->id, $target->status, app(RequestEmailChange::class));

    expect($target->fresh()->hasRole('Administrador Regional'))->toBeTrue();
});

// Deliberately NOT reproduced here as a "create a role named 'administrator'
// and assign it" scenario: verified (SHOW FULL COLUMNS FROM roles) that the
// real roles.name column carries the case-INSENSITIVE collation
// utf8mb4_unicode_ci, so a row named "administrator" cannot coexist with the
// already-seeded "Administrator" row at all -- MySQL's own unique index on
// (name, guard_name) refuses it (RoleAlreadyExists) before this action, or
// any guard this story adds, is ever reached. The Gherkin scenario
// "Administrator-level matching is case-sensitive ... a custom role named
// 'administrator' in lowercase" is therefore unreachable via role creation
// in this schema -- recorded in the task file's "Phase 3/4/5 implementation
// record" (Phase 5 finding F3). The exact-match `===` comparison itself is
// still exercised, against a not-yet-persisted instance, in
// tests/Feature/Models/RoleTest.php.

test('a custom role holding every permission the seeded Administrator role holds is still assignable with users.edit alone', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $administratorRole = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $deputyRole = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);
    $deputyRole->syncPermissions($administratorRole->permissions->pluck('name')->all());

    $target = User::factory()->create(['email' => 'deputy.target@arospe.es']);

    $updateUser = app(UpdateUser::class);
    $updateUser($target, $target->name, 'deputy.target@arospe.es', (string) $deputyRole->id, $target->status, app(RequestEmailChange::class));

    expect($target->fresh()->hasRole('Deputy'))->toBeTrue();
});

// =====================================================================
// Narrowness — status and email changes on an ordinary (non-Administrator)
// target need no roles.manage-administrators permission.
// =====================================================================

test('changing an ordinary users status and email directly needs no roles.manage-administrators permission', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['status' => UserStatus::Active, 'email' => 'ordinary.target@arospe.es']);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);
    $updateUser($target, $target->name, 'ordinary.new-address@arospe.es', (string) $editorRole->id, UserStatus::Suspended, app(RequestEmailChange::class));

    $target->refresh();
    expect($target->status)->toBe(UserStatus::Suspended)
        ->and($target->pending_email)->toBe('ordinary.new-address@arospe.es');
});

// =====================================================================
// Edge — no Administrator role row present. Nothing is wrongly blocked
// when the row simply does not exist.
// =====================================================================

test('with no Administrator role row present, updating a user with an ordinary role completes without error', function () {
    DB::table('roles')->where('name', RoleName::Administrator->value)->where('guard_name', 'web')->delete();
    expect(Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->exists())->toBeFalse();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'no-admin-row.target@arospe.es']);

    $updateUser = app(UpdateUser::class);
    $updateUser($target, $target->name, 'no-admin-row.target@arospe.es', (string) $editorRole->id, $target->status, app(RequestEmailChange::class));

    expect($target->fresh()->hasRole('Editor'))->toBeTrue();
});

// =====================================================================
// Edge — a roleId matching no role at all is not administrator-level,
// and fails on its own rather than being silently treated as a
// promotion or bypassing the authorization gate.
// =====================================================================

test('a roleId matching no role at all when updating is not treated as a promotion, and fails on its own', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    $caught = null;

    try {
        $updateUser($target, $target->name, $target->email, '999999999', $target->status, app(RequestEmailChange::class));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull()
        ->and($caught)->not->toBeInstanceOf(AuthorizationException::class);
});

// =====================================================================
// Phase 4 audit finding F1 — the Super Admin role is never assignable
// through this action, by ANYONE: no ability grants it, unlike the
// Administrator role which promoteToAdministrator/downgrade can grant.
// Before this fix, isAdministratorRole() correctly answered false for the
// Super Admin role (the two tiers are not aliased) and nothing else
// checked it at all, so an actor holding every permission could promote
// an accomplice to Super Admin, or strip the platform's own Super Admin
// down to Administrator via the promoteToAdministrator ability alone.
// =====================================================================

test('promoting a user directly to Super Admin throws for an actor holding every permission, and writes nothing', function () {
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $superAdminRole = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.edit', 'roles.manage-administrators']);
    $this->actingAs($actor);

    $target = User::factory()->create(['email' => 'super-admin.target@arospe.es']);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, $target->name, 'super-admin.target@arospe.es', (string) $superAdminRole->id, $target->status, app(RequestEmailChange::class)))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->hasRole('Super Admin'))->toBeFalse()
        ->and($target->fresh()->hasRole('Editor'))->toBeTrue();
});

// =====================================================================
// Phase 4 audit finding F1 — the base users.edit ability, and the Super
// Admin-target exclusion, are checked by the action itself, not only by
// the dashboard — including on a name-only edit that touches no role,
// status or email, which previously reached $user->save() with no
// authorization check running at all.
// =====================================================================

test('updating a user directly throws for an actor holding no permissions at all, even for a name-only change', function () {
    $actor = User::factory()->create();
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['name' => 'Original Name', 'email' => 'no-permission.target@arospe.es']);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, 'Changed Name', 'no-permission.target@arospe.es', (string) $editorRole->id, $target->status, app(RequestEmailChange::class)))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->name)->toBe('Original Name');
});

test('updating a Super Admin holder directly throws for an actor holding every permission', function () {
    $superAdminRole = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.edit', 'roles.manage-administrators']);
    $this->actingAs($actor);

    $target = User::factory()->create(['name' => 'Original Name']);
    $target->assignRole($superAdminRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($target, 'Changed Name', $target->email, (string) $superAdminRole->id, $target->status, app(RequestEmailChange::class)))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->name)->toBe('Original Name');
});

// =====================================================================
// Phase 4 re-audit finding N2 — a target CURRENTLY holding the Super Admin
// role cannot be modified through this action, by ANYONE -- including a
// Super Admin actor, whose own Gate::before bypass would otherwise undo a
// Gate-mediated refusal. Before this fix, only the SUBMITTED role was
// checked against the Super Admin tier; nothing stopped a Super Admin
// actor from calling syncRoles() against another Super Admin holder and
// stripping their grant -- an irrecoverable lockout, since Gate::before is
// the only route to unrestricted access.
// =====================================================================

test('a Super Admin actor cannot demote another Super Admin holder directly, and writes nothing', function () {
    $superAdminRole = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    $actor = User::factory()->create();
    $actor->assignRole($superAdminRole);
    $this->actingAs($actor);

    $victim = User::factory()->create(['name' => 'Victim Name', 'status' => UserStatus::Active]);
    $victim->assignRole($superAdminRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($victim, 'Renamed', $victim->email, (string) $editorRole->id, UserStatus::Suspended, app(RequestEmailChange::class)))
        ->toThrow(AuthorizationException::class);

    $victim->refresh();
    expect($victim->name)->toBe('Victim Name')
        ->and($victim->status)->toBe(UserStatus::Active)
        ->and($victim->hasRole('Super Admin'))->toBeTrue();
});

// =====================================================================
// Phase 4 re-audit finding N1 — the target's roles are reloaded fresh as
// the very first statement of __invoke(), before Gate::authorize('update',
// ...) ever consults them. Before this fix, a caller that had already
// hydrated $user with a stale ->with('roles') collection (e.g. loaded
// before a Super Admin grant landed) could make UserPolicy::update()'s
// Super Admin-target exclusion evaluate against data that no longer
// matched the database.
// =====================================================================

test('a stale, pre-hydrated roles collection on the target cannot evade the Super Admin exclusion', function () {
    $superAdminRole = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    $actor = User::factory()->create();
    $actor->givePermissionTo(['users.edit', 'roles.manage-administrators']);
    $this->actingAs($actor);

    $target = User::factory()->create(['name' => 'Original Name']);

    // Hydrate a stale copy BEFORE the Super Admin grant lands, caching an
    // empty roles relation on this instance -- simulating a caller that did
    // User::with('roles')->find($id) earlier in the request.
    $staleTarget = User::with('roles')->findOrFail($target->id);

    $target->assignRole($superAdminRole);

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser($staleTarget, 'Renamed', $staleTarget->email, (string) $editorRole->id, $staleTarget->status, app(RequestEmailChange::class)))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->name)->toBe('Original Name')
        ->and($target->fresh()->hasRole('Super Admin'))->toBeTrue();
});

// =====================================================================
// Story 0015 finding F10 — a refused email change (RequestEmailChange's own
// throttle, or its pending_email uniqueness collision) must not leave a
// partially applied edit: the name, status and role writes run in the same
// DB::transaction(), but the email-change delegation used to run AFTER that
// transaction had already committed, so a throttled/refused email change
// still left the name/status/role changes persisted. Fixed by moving the
// delegation above the transaction (and above no authorization check),
// while keeping it below authorizeRoleAndStatusChange() so the
// notification still cannot fire for an actor who was never allowed to
// touch the target's sensitive attributes at all.
// =====================================================================

test('a refused email change during an edit leaves name, status and role all unchanged, and sends no verification mail for the rolled-back write', function () {
    Notification::fake();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $target = User::factory()->create([
        'name' => 'Original Name',
        'email' => 'throttled-edit-target@arospe.es',
        'status' => UserStatus::Active,
    ]);
    $target->assignRole($editorRole);

    // Exhaust THIS actor's (target, actor) email-change allowance before the edit under test, so
    // UpdateUser's own delegation to RequestEmailChange is what refuses -- not anything else.
    $requestEmailChange = app(RequestEmailChange::class);
    $requestEmailChange($target, 'first-throttle-fill@arospe.es');
    $requestEmailChange($target, 'second-throttle-fill@arospe.es');
    $requestEmailChange($target, 'third-throttle-fill@arospe.es');

    $updateUser = app(UpdateUser::class);

    expect(fn () => $updateUser(
        $target,
        'Changed Name',
        'refused-change@arospe.es',
        (string) $blogEditorRole->id,
        UserStatus::Suspended,
        $requestEmailChange,
    ))->toThrow(ValidationException::class);

    $target->refresh();

    // Asserted on the database row, not on the exception alone.
    expect($target->name)->toBe('Original Name')
        ->and($target->status)->toBe(UserStatus::Active)
        ->and($target->hasRole('Editor'))->toBeTrue()
        ->and($target->hasRole('Blog Editor'))->toBeFalse();

    // The three throttle-filling calls above already sent three notifications -- asserting
    // exactly 3 (not 0) is what proves no FOURTH one was sent for the refused, rolled-back edit.
    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 3);
});

test('a successful edit that changes name, status, role and email together applies all three writes and still parks the pending email', function () {
    Notification::fake();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.edit');
    $this->actingAs($actor);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $target = User::factory()->create([
        'name' => 'Original Name',
        'email' => 'combined-edit-target@arospe.es',
        'status' => UserStatus::Active,
    ]);
    $target->assignRole($editorRole);

    $updateUser = app(UpdateUser::class);

    $updateUser(
        $target,
        'Fully Changed Name',
        'combined-new-address@arospe.es',
        (string) $blogEditorRole->id,
        UserStatus::Suspended,
        app(RequestEmailChange::class),
    );

    $target->refresh();

    expect($target->name)->toBe('Fully Changed Name')
        ->and($target->status)->toBe(UserStatus::Suspended)
        ->and($target->hasRole('Blog Editor'))->toBeTrue()
        ->and($target->hasRole('Editor'))->toBeFalse()
        ->and($target->getRawOriginal('email'))->toBe('combined-edit-target@arospe.es')
        ->and($target->pending_email)->toBe('combined-new-address@arospe.es');

    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 1);
});

// =====================================================================
// Story 0015 finding F17 — "a self-edit of email never requires
// roles.manage-administrators" is a real, intentional property (the email
// guard inside authorizeRoleAndStatusChange() is never even reached for a
// self-edit, since __invoke() only calls it when ! $isSelfEdit), but
// nothing pinned it as a test before this story. Pinned here, against
// UpdateUser directly -- the class that owns the rule -- rather than
// against the Livewire component, so a future refactor of the component
// cannot silently drop the coverage.
// =====================================================================

test('an actor holding users.edit but not roles.manage-administrators, who themselves holds the Administrator role, can change their own email address', function () {
    $actor = User::factory()->create(['email' => 'self-edit-admin@arospe.es', 'status' => UserStatus::Active]);
    $actor->assignRole('Administrator');
    $actor->givePermissionTo('users.edit'); // deliberately NOT roles.manage-administrators
    $this->actingAs($actor);

    $updateUser = app(UpdateUser::class);

    $updateUser(
        $actor,
        $actor->name,
        'self-edit-new-address@arospe.es',
        (string) $actor->roles()->value('roles.id'),
        $actor->status,
        app(RequestEmailChange::class),
    );

    $actor->refresh();

    expect($actor->getRawOriginal('email'))->toBe('self-edit-admin@arospe.es')
        ->and($actor->pending_email)->toBe('self-edit-new-address@arospe.es');
});
