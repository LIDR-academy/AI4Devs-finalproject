<?php

use App\Enums\RoleName;
use App\Exceptions\ImmutableRoleException;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    // Neutralize the ambient auth.super_admin.email a developer's local .env
    // may set (this repo's own .env.example ships one) -- otherwise the
    // seeder's bootstrap path provisions a second Super Admin holder this
    // file's tests never account for, on top of whichever holder each test
    // explicitly assigns itself. See docs/errors-log.md's 2026-08-12 entry
    // on the same class of ambient-config sensitivity.
    config(['auth.super_admin.email' => null]);
    $this->seed(RolePermissionSeeder::class);
});

// =====================================================================
// config('auth.super_admin.role') is authoritative everywhere. This
// test fails if any guard, the selectable() scope, RolePolicy or the
// seeder ever compares against App\Enums\RoleName::SuperAdmin (or the
// literal 'Super Admin') directly instead of resolving the config key
// -- it proves the Gate::before bypass, the model guards and the
// selectable() scope all move together when the config value changes,
// and that the role literally named "Super Admin" becomes fully
// ordinary once it is no longer the configured name.
// =====================================================================

test('overriding auth.super_admin.role moves the Gate::before bypass, selectable() and the model guards in lockstep', function () {
    config(['auth.super_admin.role' => 'Something Else']);

    // Role::create() would now be refused by the `creating` guard (story 0008 F3 -- a role
    // cannot acquire the currently-configured Super Admin name); firstOrCreateSuperAdminRole()
    // is the sanctioned path that models what the seeder itself would do under this config.
    $configuredSuperAdmin = Role::firstOrCreateSuperAdminRole();
    $ordinaryRoleNamedSuperAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    // 1. The Gate::before bypass follows the config, not the literal name.
    $holderOfConfiguredRole = User::factory()->create();
    $holderOfConfiguredRole->assignRole($configuredSuperAdmin);
    expect($holderOfConfiguredRole->can('an-ability-outside-the-seeded-catalog'))->toBeTrue();

    $holderOfLiteralSuperAdminName = User::factory()->create();
    $holderOfLiteralSuperAdminName->assignRole($ordinaryRoleNamedSuperAdmin);
    expect($holderOfLiteralSuperAdminName->can('an-ability-outside-the-seeded-catalog'))->toBeFalse();

    // 2. selectable() hides the configured role, not the literally-named one.
    $selectableNames = Role::query()->selectable()->pluck('name');
    expect($selectableNames)->not->toContain('Something Else')
        ->and($selectableNames)->toContain('Super Admin');

    // 3. RolePolicy denies against the configured role, not the literally-named one.
    $roleAdministrator = User::factory()->create();
    $roleAdministrator->givePermissionTo('roles.manage');
    expect(Gate::forUser($roleAdministrator)->allows('delete', $configuredSuperAdmin))->toBeFalse()
        ->and(Gate::forUser($roleAdministrator)->allows('delete', $ordinaryRoleNamedSuperAdmin))->toBeTrue();

    // 4. The model guards protect the configured role...
    $anyPermission = Permission::where('guard_name', 'web')->firstOrFail();
    expect(fn () => $configuredSuperAdmin->update(['name' => 'Renamed']))->toThrow(ImmutableRoleException::class);
    expect(fn () => $configuredSuperAdmin->givePermissionTo($anyPermission->name))->toThrow(ImmutableRoleException::class);
    expect(fn () => $configuredSuperAdmin->delete())->toThrow(ImmutableRoleException::class);
    expect(Role::where('id', $configuredSuperAdmin->id)->exists())->toBeTrue();

    // ...while the role literally named "Super Admin" is now fully manageable.
    $ordinaryRoleNamedSuperAdmin->givePermissionTo($anyPermission->name);
    expect($ordinaryRoleNamedSuperAdmin->fresh()->permissions)->toHaveCount(1);

    $ordinaryRoleNamedSuperAdmin->update(['name' => 'Super Admin Renamed']);
    expect(Role::where('id', $ordinaryRoleNamedSuperAdmin->id)->value('name'))->toBe('Super Admin Renamed');

    // story 0010's holder-count guard (App\Models\Role::guardAgainstHolders())
    // now blocks deleting any role -- protected or ordinary -- while it still
    // has holders; $holderOfLiteralSuperAdminName was assigned to this role
    // above purely to exercise the Gate::before/can() behaviour, and plays no
    // further part in this test, so it is unassigned before the deletion
    // this test's own scenario is actually about.
    $holderOfLiteralSuperAdminName->removeRole($ordinaryRoleNamedSuperAdmin);

    $ordinaryRoleNamedSuperAdmin->delete();
    expect(Role::where('id', $ordinaryRoleNamedSuperAdmin->id)->exists())->toBeFalse();
});

// =====================================================================
// A present-but-null config key must not leave every mechanism built
// on superAdminName() silently protecting/hiding/denying nothing. The
// two-argument config('key', $default) form alone cannot be
// distinguished from the correct `?? $default` form by any *other*
// input in this test suite -- a present, non-null override (as above)
// is resolved correctly by either form. Only a present-but-null key
// tells them apart.
// =====================================================================

test('a present-but-null auth.super_admin.role config value still protects, hides and denies the role literally named "Super Admin"', function () {
    config(['auth.super_admin.role' => null]);

    expect(Role::superAdminName())->toBe(RoleName::SuperAdmin->value);

    $superAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    expect(Role::query()->selectable()->pluck('name'))->not->toContain('Super Admin');

    $roleAdministrator = User::factory()->create();
    $roleAdministrator->givePermissionTo('roles.manage');
    expect(Gate::forUser($roleAdministrator)->allows('delete', $superAdmin))->toBeFalse();

    expect(fn () => $superAdmin->delete())->toThrow(ImmutableRoleException::class);
    expect(Role::where('id', $superAdmin->id)->exists())->toBeTrue();
});
