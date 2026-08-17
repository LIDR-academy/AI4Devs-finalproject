<?php

use App\Enums\UserStatus;
use App\Livewire\Users\Index;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// =====================================================================
// roleOptions() — must exclude the Super Admin role via selectable(),
// not a hardcoded literal string match. Proven by moving the config
// value: a hardcoded ->whereNot('name', 'Super Admin') would leak the
// real, config-resolved Super Admin role into the dropdown while
// wrongly hiding the role now literally named "Super Admin".
// =====================================================================

test('roleOptions() excludes the config-resolved Super Admin role, not a hardcoded literal', function () {
    config(['auth.super_admin.role' => 'Something Else']);

    // Role::create() would now be refused by the `creating` guard (story 0008 F3 -- a role
    // cannot acquire the currently-configured Super Admin name); firstOrCreateSuperAdminRole()
    // is the sanctioned path that models what the seeder itself would do under this config.
    Role::firstOrCreateSuperAdminRole();
    // The seeded 'Super Admin' role is now an ordinary, fully manageable role under this config.

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $names = collect(Livewire::test(Index::class)->get('roleOptions'))->pluck('name');

    expect($names)->not->toContain('Something Else')
        ->and($names)->toContain('Super Admin');
});

test('a custom role whose name merely resembles the Super Admin role stays in roleOptions()', function () {
    Role::create(['name' => 'Super Admin Assistant', 'guard_name' => 'web']);

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $names = collect(Livewire::test(Index::class)->get('roleOptions'))->pluck('name');

    expect($names)->toContain('Super Admin Assistant');
});

// =====================================================================
// roleRules() — the server-side half a forged submission actually
// hits. The dropdown filter above is cosmetic only; this is what
// stops a crafted roleId from assigning the real Super Admin role.
// =====================================================================

test('roleRules() rejects the config-resolved Super Admin role id and accepts the id of a role now literally named "Super Admin"', function () {
    config(['auth.super_admin.role' => 'Something Else']);

    // Role::create() would now be refused by the `creating` guard (story 0008 F3); see the
    // comment above.
    $configuredSuperAdminRole = Role::firstOrCreateSuperAdminRole();
    $ordinaryRoleNamedSuperAdmin = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    // A forged submission naming the real (config-resolved) Super Admin role's id is rejected...
    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Forged Submission')
        ->set('email', 'forged@arospe.es')
        ->set('roleId', (string) $configuredSuperAdminRole->id)
        ->set('status', UserStatus::Active)
        ->call('save')
        ->assertHasErrors(['roleId']);

    expect(User::where('email', 'forged@arospe.es')->exists())->toBeFalse();

    // ...while the role literally named "Super Admin" -- now an ordinary role under this
    // config -- is a perfectly legitimate assignment.
    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Legitimate Submission')
        ->set('email', 'legitimate@arospe.es')
        ->set('roleId', (string) $ordinaryRoleNamedSuperAdmin->id)
        ->set('status', UserStatus::Active)
        ->call('save')
        ->assertHasNoErrors();

    expect(User::where('email', 'legitimate@arospe.es')->exists())->toBeTrue();
});
