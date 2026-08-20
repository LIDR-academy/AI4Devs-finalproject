<?php

use App\Enums\RoleName;
use App\Exceptions\ImmutableRoleException;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Exceptions\RoleAlreadyExists;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// =====================================================================
// Role::superAdminName() — the single source of truth every guard,
// the selectable() scope, RolePolicy and the seeder must call.
// =====================================================================

test('superAdminName() resolves to the RoleName enum default when no config override is set', function () {
    expect(Role::superAdminName())->toBe(RoleName::SuperAdmin->value)
        ->and(Role::superAdminName())->toBe('Super Admin');
});

test('superAdminName() resolves to an overridden config value', function () {
    config(['auth.super_admin.role' => 'Something Else']);

    expect(Role::superAdminName())->toBe('Something Else');
});

test('a present-but-null auth.super_admin.role config value still falls back to the enum default, not null', function () {
    // config('key', $default) only substitutes its default for a *missing* key
    // (Arr::exists() === array_key_exists()); a present-but-null key returns null unless
    // the `??` fallback is also there. This is the input that distinguishes the two forms.
    config(['auth.super_admin.role' => null]);

    expect(Role::superAdminName())->toBe(RoleName::SuperAdmin->value);
});

// Story 0009 Phase 4 finding F6 — the two protected tiers must never be
// able to resolve to the same name.
test('superAdminName() refuses a config value colliding with the locked Administrator name', function () {
    config(['auth.super_admin.role' => RoleName::Administrator->value]);

    expect(fn () => Role::superAdminName())->toThrow(RuntimeException::class);
});

test('superAdminName() refuses a config value colliding with the Administrator name case-insensitively', function () {
    config(['auth.super_admin.role' => 'administrator']);

    expect(fn () => Role::superAdminName())->toThrow(RuntimeException::class);
});

// =====================================================================
// selectable() — the shared local scope every roles list / role
// selector must use. Excludes exactly the Super Admin role.
// =====================================================================

test('selectable() excludes the Super Admin role by exact name match', function () {
    $names = Role::query()->selectable()->pluck('name');

    expect($names)->not->toContain('Super Admin');
});

test('a custom role whose name merely resembles the Super Admin role stays visible under selectable()', function () {
    Role::create(['name' => 'Super Admin Assistant', 'guard_name' => 'web']);

    $names = Role::query()->selectable()->pluck('name');

    expect($names)->toContain('Super Admin Assistant');
});

test('selectable() still excludes the Super Admin role under additional query constraints and pagination', function () {
    Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $paginated = Role::query()->selectable()->where('guard_name', 'web')->orderBy('name')->paginate(50);

    expect(collect($paginated->items())->pluck('name'))->not->toContain('Super Admin')
        ->and(collect($paginated->items())->pluck('name'))->toContain('Blog Editor');
});

// =====================================================================
// Deletion — categorically refused, both through a dashboard-style
// authorized flow and through a direct instance call with no
// authorization context at all.
// =====================================================================

test('the delete a dashboard-style flow would issue is rejected for the Super Admin role even when the actor is authorized to manage roles, and the row survives', function () {
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    // A future dashboard action would authorize first (which this actor legitimately
    // passes), then call delete() on the resolved model -- the same call this test makes.
    expect(fn () => $superAdmin->delete())->toThrow(ImmutableRoleException::class);

    expect(Role::where('name', 'Super Admin')->where('guard_name', 'web')->exists())->toBeTrue();
});

test('a direct delete() call on the Super Admin role instance is rejected with no authorization context at all, and the row survives', function () {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    // No Gate/authorize() call anywhere here -- this is the "crafted request that never
    // touches the dashboard" / console-command shaped call the model guard alone must stop.
    expect(fn () => $superAdmin->delete())->toThrow(ImmutableRoleException::class);

    expect(Role::where('name', 'Super Admin')->where('guard_name', 'web')->exists())->toBeTrue();
});

test('a refused delete leaves the role_has_permissions and model_has_roles rows for the Super Admin role intact, not just its own row', function () {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();
    $permission = Permission::where('guard_name', 'web')->firstOrFail();
    $holder = User::factory()->create();

    // Inserted directly against the pivot tables -- givePermissionTo()/assignRole() through
    // the guarded model would themselves throw for the Super Admin role by this story's own
    // design (Q2), so this simulates whatever state the row carries regardless of how it got
    // there. The point of this test is what survives a refused delete, not how the state was
    // produced.
    DB::table('role_has_permissions')->insert([
        'permission_id' => $permission->id,
        'role_id' => $superAdmin->id,
    ]);
    DB::table('model_has_roles')->insert([
        'role_id' => $superAdmin->id,
        'model_type' => User::class,
        'model_uuid' => $holder->id,
    ]);

    // This is the assertion that catches the booted()-ordering bug: Spatie's own `deleting`
    // listener detaches both pivot rows unconditionally before a booted()-registered guard
    // would ever run, and Model::delete() opens no transaction, so that detach persists even
    // though the `roles` row itself survives. Asserting only the `roles` row exists would
    // pass on that broken implementation too.
    expect(fn () => $superAdmin->delete())->toThrow(ImmutableRoleException::class);

    expect(Role::where('id', $superAdmin->id)->exists())->toBeTrue()
        ->and(DB::table('role_has_permissions')->where('role_id', $superAdmin->id)->where('permission_id', $permission->id)->exists())->toBeTrue()
        ->and(DB::table('model_has_roles')->where('role_id', $superAdmin->id)->where('model_uuid', $holder->id)->exists())->toBeTrue();
});

// =====================================================================
// Edit — categorically refused in every direction: rename, guard_name
// change, and every direction of permission mutation (revoke, empty,
// reduce to a subset, grant an addition). Not merely "no downgrades".
// =====================================================================

test('the Super Admin role rejects every direction of edit, leaving its name, guard_name and permission set unchanged', function (Closure $mutate) {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    /** @var array<int, Permission> $permissions */
    $permissions = Permission::where('guard_name', 'web')->orderBy('name')->limit(3)->get()->all();
    [$permissionA, $permissionB, $extraPermission] = $permissions;

    DB::table('role_has_permissions')->insert([
        ['permission_id' => $permissionA->id, 'role_id' => $superAdmin->id],
        ['permission_id' => $permissionB->id, 'role_id' => $superAdmin->id],
    ]);

    $originalName = $superAdmin->name;
    $originalGuardName = $superAdmin->guard_name;
    $originalPermissionIds = DB::table('role_has_permissions')->where('role_id', $superAdmin->id)->pluck('permission_id')->sort()->values()->all();

    expect(fn () => $mutate($superAdmin, $permissionA, $permissionB, $extraPermission))
        ->toThrow(ImmutableRoleException::class);

    $superAdmin->refresh();
    $currentPermissionIds = DB::table('role_has_permissions')->where('role_id', $superAdmin->id)->pluck('permission_id')->sort()->values()->all();

    expect($superAdmin->name)->toBe($originalName)
        ->and($superAdmin->guard_name)->toBe($originalGuardName)
        ->and($currentPermissionIds)->toBe($originalPermissionIds);
})->with([
    'renaming the role' => [fn (Role $role) => $role->update(['name' => 'Not Super Admin Anymore'])],
    'changing its guard_name' => [fn (Role $role) => $role->update(['guard_name' => 'api'])],
    'revoking one of its permissions' => [fn (Role $role, Permission $a) => $role->revokePermissionTo($a)],
    'emptying its permission set entirely' => [fn (Role $role) => $role->syncPermissions([])],
    'reducing its permission set to a strict subset' => [fn (Role $role, Permission $a) => $role->syncPermissions([$a])],
    'granting it an additional permission (not merely a downgrade)' => [fn (Role $role, Permission $a, Permission $b, Permission $extra) => $role->givePermissionTo($extra)],
]);

// =====================================================================
// Narrowness — the guard is not "nobody can edit any role".
// =====================================================================

test('an ordinary custom role remains fully deletable and editable in every direction', function () {
    $custom = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $permissions = Permission::where('guard_name', 'web')->orderBy('name')->limit(2)->get();

    $custom->givePermissionTo($permissions->pluck('name')->all());
    expect($custom->fresh()->permissions)->toHaveCount(2);

    $custom->revokePermissionTo($permissions->first()->name);
    expect($custom->fresh()->permissions)->toHaveCount(1);

    $custom->syncPermissions([]);
    expect($custom->fresh()->permissions)->toHaveCount(0);

    $custom->update(['name' => 'Blog Editor Renamed']);
    expect($custom->fresh()->name)->toBe('Blog Editor Renamed');

    expect(Role::query()->selectable()->pluck('name'))->toContain('Blog Editor Renamed');

    $custom->delete();
    expect(Role::where('id', $custom->id)->exists())->toBeFalse();
});

// =====================================================================
// Regression — the invisibility/immutability mechanism must not break
// seeding, role assignment by name, permission cache hydration, or a
// Super Admin's own authorization.
// =====================================================================

test('seeding still creates exactly one Super Admin role and one Administrator role, resolved through App\Models\Role', function () {
    expect(Role::where('name', 'Super Admin')->where('guard_name', 'web')->count())->toBe(1)
        ->and(Role::where('name', 'Administrator')->where('guard_name', 'web')->count())->toBe(1);
});

test('assignRole() by name still resolves and grants the Super Admin role', function () {
    $user = User::factory()->create();

    $user->assignRole('Super Admin');

    expect($user->fresh()->hasRole('Super Admin'))->toBeTrue();
});

test('the permission cache rehydrates correctly after being flushed, for a role held by a user', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');

    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect($administrator->hasPermissionTo('roles.manage'))->toBeTrue();
});

test('a Super Admins own hasRole() and permission-check bypass are unaffected by the role being hidden from selectable() results', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    // can() is the entry point the Gate::before bypass actually intercepts -- the Super
    // Admin role deliberately holds zero permission rows (Q4), so hasPermissionTo() alone
    // would (correctly) return false here and prove nothing about the bypass.
    expect($superAdmin->hasRole('Super Admin'))->toBeTrue()
        ->and($superAdmin->can('products.delete'))->toBeTrue()
        ->and(Role::query()->selectable()->pluck('name'))->not->toContain('Super Admin');
});

// =====================================================================
// Edge — nothing is wrongly blocked when no Super Admin row exists.
// Deliberately does NOT rely on the beforeEach seeder for the role
// state under test (it still runs, so permissions/Administrator exist,
// but the Super Admin role itself is removed before the assertions).
// =====================================================================

test('with no Super Admin role row present, selectable() and an unrelated roles delete/edit both complete without error and nothing is wrongly blocked', function () {
    // Removed via the query builder, not an instance delete() -- the point here is only to
    // produce a database state with no Super Admin row, not to exercise (or bypass) this
    // story's own instance-level delete guard.
    DB::table('roles')->where('name', 'Super Admin')->where('guard_name', 'web')->delete();

    expect(Role::where('name', 'Super Admin')->where('guard_name', 'web')->exists())->toBeFalse();

    expect(fn () => Role::query()->selectable()->get())->not->toThrow(Throwable::class);

    $custom = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $custom->update(['name' => 'Blog Editor Renamed']);
    expect($custom->fresh()->name)->toBe('Blog Editor Renamed');

    $custom->delete();
    expect(Role::where('id', $custom->id)->exists())->toBeFalse();
});

// =====================================================================
// Phase 4 re-audit (F2) — a partially-hydrated instance (no `name`
// selected) must not bypass the guard. Both getOriginal('name') and
// $this->name are null on such an instance; the guard must read the
// name back from the database rather than treat "unknown" as
// "unprotected".
// =====================================================================

test('deleting a partially-hydrated Super Admin instance (no name column selected) is still refused, and the row survives', function () {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $partiallyHydrated = Role::query()->select('id')->whereKey($superAdmin->id)->firstOrFail();

    expect(fn () => $partiallyHydrated->delete())->toThrow(ImmutableRoleException::class);
    expect(Role::where('id', $superAdmin->id)->exists())->toBeTrue();
});

test('updating a partially-hydrated Super Admin instance (no name column selected) is still refused, and the row survives unchanged', function () {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $partiallyHydrated = Role::query()->select('id')->whereKey($superAdmin->id)->firstOrFail();

    expect(fn () => $partiallyHydrated->update(['guard_name' => 'api']))->toThrow(ImmutableRoleException::class);
    expect(Role::where('id', $superAdmin->id)->value('guard_name'))->toBe('web');
});

// Phase 4 re-audit (R1) — the guard_name test above happens to pass even
// with the buggy `??` version, because guard_name isn't the identifying
// attribute. A RENAME on a partially-hydrated instance is the case that
// actually exercises the gap: getAttribute('name') returns the new,
// attacker-supplied name, which is non-null and so short-circuited the `??`
// before the database read-back ever ran.
test('renaming a partially-hydrated Super Admin instance (no name column selected) is still refused', function () {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $partiallyHydrated = Role::query()->select('id')->whereKey($superAdmin->id)->firstOrFail();

    expect(fn () => $partiallyHydrated->update(['name' => 'Pwned']))->toThrow(ImmutableRoleException::class);
    expect(Role::where('id', $superAdmin->id)->value('name'))->toBe('Super Admin');
});

// =====================================================================
// Phase 4 re-audit (F3) — nothing may bring a role into existence
// already carrying the Super Admin name, nor rename an ordinary role
// into it. Reachable whenever config('auth.super_admin.role') names a
// role that hasn't been seeded yet, or on a fresh install before
// seeding.
// =====================================================================

test('creating a role literally named "Super Admin" while the seeded row already exists is refused by Spatie\'s own duplicate check, ahead of reaching the creating guard at all', function () {
    // The beforeEach seeder already created the real row, so Spatie's own overridden
    // Role::create() (vendor/spatie/laravel-permission/src/Models/Role.php) finds it via
    // findByParam() and throws RoleAlreadyExists *before* ever calling
    // static::query()->create() -- the call that would fire our `creating` guard. Recorded
    // here so a reader doesn't mistake this call for evidence the guard fires on every
    // Super-Admin-named create(): the case that actually needs the guard is the *next* test,
    // where no colliding row exists yet.
    expect(fn () => Role::create(['name' => 'Super Admin', 'guard_name' => 'web']))
        ->toThrow(RoleAlreadyExists::class);

    expect(Role::where('name', 'Super Admin')->where('guard_name', 'web')->count())->toBe(1);
});

test('creating a role named after an overridden, not-yet-seeded super_admin.role config value is refused', function () {
    config(['auth.super_admin.role' => 'Something Else']);

    // No row named "Something Else" exists yet -- this is the "config names a role that
    // hasn't been seeded" case the story's own file list calls out as reachable, and there
    // is no unique-index collision to fall back on here.
    expect(fn () => Role::create(['name' => 'Something Else', 'guard_name' => 'web']))
        ->toThrow(ImmutableRoleException::class);

    expect(Role::where('name', 'Something Else')->exists())->toBeFalse();
});

test('renaming an ordinary role into the Super Admin name is refused, and the role keeps its original name', function () {
    $custom = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    expect(fn () => $custom->update(['name' => 'Super Admin']))->toThrow(ImmutableRoleException::class);

    expect($custom->fresh()->name)->toBe('Blog Editor');
});

test('firstOrCreateSuperAdminRole() is the sanctioned exception and bypasses the creating guard', function () {
    // The beforeEach seeder already created the row via this exact method; calling it again
    // proves it is idempotent (first-or-create) rather than throwing on the row it itself
    // owns.
    $role = Role::firstOrCreateSuperAdminRole();

    expect($role->name)->toBe('Super Admin')
        ->and(Role::where('name', 'Super Admin')->where('guard_name', 'web')->count())->toBe(1);
});

// =====================================================================
// Phase 4 re-audit (F5) — HasAssignedModels' role-side pivot mutators
// (assignToModels/removeFromModels/syncModels) bypass every model
// event the boot() guards above intercept, exactly like the
// permission-pivot mutators above. syncModels([]) in particular would
// strip every Super Admin holder in one call.
// =====================================================================

test('assignToModels() is refused against the Super Admin role, and grants no holder', function () {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create();

    expect(fn () => $superAdmin->assignToModels($target))->toThrow(ImmutableRoleException::class);

    expect($target->fresh()->hasRole('Super Admin'))->toBeFalse();
});

test('syncModels() is refused against the Super Admin role, leaving its existing holders untouched', function () {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();
    $existingHolder = User::factory()->create();
    $existingHolder->assignRole('Super Admin');

    expect(fn () => $superAdmin->syncModels([]))->toThrow(ImmutableRoleException::class);

    expect($existingHolder->fresh()->hasRole('Super Admin'))->toBeTrue();
});

test('removeFromModels() is refused against the Super Admin role, leaving its existing holders untouched', function () {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();
    $existingHolder = User::factory()->create();
    $existingHolder->assignRole('Super Admin');

    expect(fn () => $superAdmin->removeFromModels($existingHolder))->toThrow(ImmutableRoleException::class);

    expect($existingHolder->fresh()->hasRole('Super Admin'))->toBeTrue();
});

// =====================================================================
// Story 0008a — isAdministratorRole(): the shared, hydration-safe
// identity check for the Administrator tier. Exact, case-sensitive
// comparison against the row's PERSISTED name -- never LIKE, never
// case-insensitive, never a "contains" match, and never fooled by an
// in-memory rename that hasn't been saved.
// =====================================================================

test('isAdministratorRole() returns true for the seeded Administrator role', function () {
    $administrator = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    expect(Role::isAdministratorRole($administrator))->toBeTrue();
});

test('isAdministratorRole() returns false for an ordinary role', function () {
    $custom = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    expect(Role::isAdministratorRole($custom))->toBeFalse();
});

test('isAdministratorRole() returns false for the Super Admin role -- the two tiers are not aliased', function () {
    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    expect(Role::isAdministratorRole($superAdmin))->toBeFalse();
});

// --- Hydration-safety (the ⚠️ residual this story closes on its own side) ---

test('isAdministratorRole() answers true for a partially-hydrated Administrator row (name column not selected)', function () {
    $administrator = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $partiallyHydrated = Role::query()->select('id')->whereKey($administrator->id)->firstOrFail();

    expect(Role::isAdministratorRole($partiallyHydrated))->toBeTrue();
});

test('isAdministratorRole() answers false for a partially-hydrated ordinary role (name column not selected)', function () {
    $custom = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $partiallyHydrated = Role::query()->select('id')->whereKey($custom->id)->firstOrFail();

    expect(Role::isAdministratorRole($partiallyHydrated))->toBeFalse();
});

test('isAdministratorRole() answers true for a role renamed in memory but not saved, because identity comes from the persisted name', function () {
    $administrator = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    $administrator->name = 'Something Else';

    expect(Role::isAdministratorRole($administrator))->toBeTrue();

    // Nothing was actually persisted by this test -- confirms the assertion above
    // is exercising the in-memory/persisted split, not a database write.
    expect(Role::where('id', $administrator->id)->value('name'))->toBe(RoleName::Administrator->value);
});

// --- Exact, case-sensitive match only ---

test('isAdministratorRole() returns false for a role whose name merely resembles "Administrator"', function () {
    $custom = Role::create(['name' => 'Administrador Regional', 'guard_name' => 'web']);

    expect(Role::isAdministratorRole($custom))->toBeFalse();
});

// NOT persisted via Role::create(): the real roles.name column carries the
// case-INSENSITIVE collation utf8mb4_unicode_ci (verified with `SHOW FULL
// COLUMNS FROM roles`), so a row named "administrator" cannot coexist with
// the already-seeded "Administrator" row at all -- MySQL's own unique index
// on (name, guard_name) refuses it (RoleAlreadyExists / a 23000 duplicate
// key, confirmed by attempting exactly this in an earlier draft of this
// test), independently of anything this story's PHP-level `===` comparison
// does. The Gherkin scenario "Administrator-level matching is case-sensitive
// ... a custom role named 'administrator' in lowercase" is therefore
// unreachable via role creation in this schema -- recorded in the task
// file's "Phase 3/4/5 implementation record" (Phase 5 finding F3). What CAN
// still be exercised, and is exercised below, is
// the exact-match `===` comparison itself against a not-yet-persisted
// instance -- the one case persistedName() legitimately reads the in-memory
// attribute for (mirroring `guardAgainstAssumingSuperAdminName()`'s own
// creating-path fallback above).
test('isAdministratorRole() is case-sensitive: a not-yet-persisted role named "administrator" in lowercase is not administrator-level', function () {
    $inMemory = new Role(['name' => 'administrator', 'guard_name' => 'web']);

    expect(Role::isAdministratorRole($inMemory))->toBeFalse();
});

test('isAdministratorRole() returns false for a custom role holding every permission the seeded Administrator role holds', function () {
    $administrator = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $deputy = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);
    $deputy->syncPermissions($administrator->permissions->pluck('name')->all());

    expect(Role::isAdministratorRole($deputy))->toBeFalse();
});

// =====================================================================
// Story 0010 Phase 4 security audit, finding F1, human-confirmed
// decision — the Administrator role is never deletable (the same as
// Super Admin) and its name is locked, but unlike Super Admin its
// permission set stays editable (story 0009's whole point). Narrower
// guards than the Super Admin ones, on purpose.
// =====================================================================

test('deleting the seeded Administrator role is refused with no authorization context at all, and the row survives', function () {
    $administrator = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    expect(fn () => $administrator->delete())->toThrow(ImmutableRoleException::class);

    expect(Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->exists())->toBeTrue();
});

test('a refused delete leaves the Administrator role_has_permissions and model_has_roles rows intact', function () {
    $administrator = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    $holder = User::factory()->create();
    $holder->assignRole($administrator);

    $originalPermissionCount = $administrator->permissions()->count();

    // Same ordering assertion as the Super Admin equivalent above: a
    // booted()-registered guard would let Spatie's own `deleting` listener
    // detach both pivot rows before this guard ever ran, since
    // Model::delete() opens no transaction.
    expect(fn () => $administrator->delete())->toThrow(ImmutableRoleException::class);

    expect(Role::where('id', $administrator->id)->exists())->toBeTrue()
        ->and($administrator->fresh()->permissions()->count())->toBe($originalPermissionCount)
        ->and($holder->fresh()->hasRole(RoleName::Administrator->value))->toBeTrue();
});

test('renaming the seeded Administrator role is refused, and it keeps its original name', function () {
    $administrator = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();

    expect(fn () => $administrator->update(['name' => 'Not Administrator Anymore']))
        ->toThrow(ImmutableRoleException::class);

    expect($administrator->fresh()->name)->toBe(RoleName::Administrator->value);
});

test('renaming an ordinary role into the Administrator name is refused, and the role keeps its original name', function () {
    $custom = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    expect(fn () => $custom->update(['name' => RoleName::Administrator->value]))
        ->toThrow(ImmutableRoleException::class);

    expect($custom->fresh()->name)->toBe('Blog Editor');
});

test('the Administrator role permission set remains fully editable in every direction, unlike the Super Admin role', function () {
    $administrator = Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->firstOrFail();
    expect($administrator->permissions()->count())->toBeGreaterThan(0);

    $administrator->syncPermissions(['users.view']);
    expect($administrator->fresh()->permissions->pluck('name')->all())->toBe(['users.view']);

    $administrator->givePermissionTo('users.edit');
    expect($administrator->fresh()->permissions)->toHaveCount(2);

    $administrator->revokePermissionTo('users.view');
    expect($administrator->fresh()->permissions->pluck('name')->all())->toBe(['users.edit']);
});

test('firstOrCreateAdministratorRole() is the sanctioned exception and bypasses the creating guard', function () {
    // The beforeEach seeder already created the row via this exact method; calling it again
    // proves it is idempotent (first-or-create) rather than throwing on the row it itself
    // owns.
    $role = Role::firstOrCreateAdministratorRole();

    expect($role->name)->toBe(RoleName::Administrator->value)
        ->and(Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->count())->toBe(1);
});

test('creating a role literally named "Administrator" while the seeded row already exists is refused by Spatie\'s own duplicate check, ahead of reaching the creating guard at all', function () {
    // Same shape as the identical Super Admin test above: Spatie's own
    // overridden Role::create() finds the existing row via findByParam()
    // and throws RoleAlreadyExists before ever calling static::query()->create()
    // -- the call that would fire our `creating` guard.
    expect(fn () => Role::create(['name' => RoleName::Administrator->value, 'guard_name' => 'web']))
        ->toThrow(RoleAlreadyExists::class);

    expect(Role::where('name', RoleName::Administrator->value)->where('guard_name', 'web')->count())->toBe(1);
});

test('creating a role named "Administrator" is refused by the creating guard itself when no colliding row exists yet', function () {
    // Removed via the query builder, not an instance delete() (which is now
    // categorically refused): the point here is only to produce a database
    // state with no Administrator row, so Role::create() reaches our
    // `creating` guard instead of Spatie's own duplicate check above.
    DB::table('roles')->where('name', RoleName::Administrator->value)->where('guard_name', 'web')->delete();

    expect(fn () => Role::create(['name' => RoleName::Administrator->value, 'guard_name' => 'web']))
        ->toThrow(ImmutableRoleException::class);

    expect(Role::where('name', RoleName::Administrator->value)->exists())->toBeFalse();
});

// =====================================================================
// Story 0010 Phase 4 security audit, finding F3 — a soft-deleted holder
// must still count as a holder, or the FK cascade on model_has_roles
// silently destroys their role grant the moment the role is deleted.
// =====================================================================

test('a role with only a soft-deleted holder is still refused for deletion, via the model-event guard', function () {
    $custom = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $holder = User::factory()->create();
    $holder->assignRole($custom);
    $holder->delete();

    expect(User::withTrashed()->whereKey($holder->id)->firstOrFail()->trashed())->toBeTrue();

    expect(fn () => $custom->delete())->toThrow(App\Exceptions\RoleInUseException::class);

    expect(Role::where('id', $custom->id)->exists())->toBeTrue();
    expect(DB::table('model_has_roles')->where('role_id', $custom->id)->exists())->toBeTrue();
});
