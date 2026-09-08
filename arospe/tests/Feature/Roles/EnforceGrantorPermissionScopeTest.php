<?php

// Story 0010 Phase 4 security audit, finding F2, human-confirmed decision —
// App\Actions\Roles\EnforceGrantorPermissionScope refuses a role-save
// payload that newly grants a permission the acting user does not
// themselves hold. Every test resolves the action from the container and
// calls it directly, matching EnforceAdministratorPermissionGrantTest's own
// precedent for actions independently callable outside their Livewire call
// site (App\Livewire\Roles\Index::saveRole()).

use App\Actions\Roles\EnforceGrantorPermissionScope;
use App\Models\Role;
use App\Models\User;
use App\Policies\RolePolicy;
use Illuminate\Auth\Access\AuthorizationException;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

/**
 * Get-or-create a `web`-guard permission fixture row and return its name.
 */
function grantorScopeTestPermission(string $name): string
{
    Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);

    return $name;
}

// =====================================================================
// The self-escalation path this action closes — an actor granting a
// role a permission they do not themselves hold.
// =====================================================================

test('a newly granted permission the actor does not hold throws, on role creation', function () {
    grantorScopeTestPermission('roles.manage');
    grantorScopeTestPermission('blog.view');
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $enforce = app(EnforceGrantorPermissionScope::class);

    expect(fn () => $enforce($actor, ['blog.view'], null))
        ->toThrow(AuthorizationException::class);
});

test('a newly granted permission the actor does not hold throws, when editing a role -- including the actor\'s own role', function () {
    grantorScopeTestPermission('roles.manage');
    grantorScopeTestPermission('users.delete');
    $actor = User::factory()->create();

    $ownRole = Role::create(['name' => 'Custom Editor', 'guard_name' => 'web']);
    $ownRole->givePermissionTo('roles.manage');
    $actor->assignRole($ownRole);

    $enforce = app(EnforceGrantorPermissionScope::class);

    expect(fn () => $enforce($actor, ['roles.manage', 'users.delete'], $ownRole))
        ->toThrow(AuthorizationException::class);
});

test('a newly granted permission the actor DOES hold succeeds, and the list is returned unchanged', function () {
    grantorScopeTestPermission('roles.manage');
    grantorScopeTestPermission('blog.view');
    $actor = User::factory()->create();
    $actor->givePermissionTo(['roles.manage', 'blog.view']);

    $enforce = app(EnforceGrantorPermissionScope::class);

    $result = $enforce($actor, ['blog.view'], null);

    expect($result)->toBe(['blog.view']);
});

test('removing a permission from a role is never refused, regardless of what the actor holds', function () {
    grantorScopeTestPermission('roles.manage');
    grantorScopeTestPermission('blog.view');
    grantorScopeTestPermission('blog.delete');
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $target = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);
    $target->givePermissionTo(['blog.view', 'blog.delete']);

    $enforce = app(EnforceGrantorPermissionScope::class);

    // Submitted list drops blog.delete -- a removal, not a grant.
    $result = $enforce($actor, ['blog.view'], $target);

    expect($result)->toBe(['blog.view']);
});

test('a permission the target role already holds is never treated as newly granted, regardless of what the actor holds', function () {
    grantorScopeTestPermission('roles.manage');
    grantorScopeTestPermission('blog.view');
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $target = Role::create(['name' => 'Deputy', 'guard_name' => 'web']);
    $target->givePermissionTo('blog.view');

    $enforce = app(EnforceGrantorPermissionScope::class);

    // Resubmitting the same, already-held permission -- not a grant.
    $result = $enforce($actor, ['blog.view'], $target);

    expect($result)->toBe(['blog.view']);
});

// =====================================================================
// The roles.manage-administrators carve-out — that permission's grant
// rule belongs entirely to EnforceAdministratorPermissionGrant.
// =====================================================================

test('roles.manage-administrators is never refused by this action, even for an actor who does not hold it', function () {
    grantorScopeTestPermission('roles.manage');
    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    $enforce = app(EnforceGrantorPermissionScope::class);

    // This actor does NOT hold roles.manage-administrators, and this
    // action alone would otherwise refuse it as a newly granted permission
    // it does not hold -- but that permission's grant rule belongs
    // entirely to EnforceAdministratorPermissionGrant, which excludes it
    // from its own scope (see this class's docblock). Not a matter of call
    // order in saveRole(): verified live that reversing the two calls
    // there refuses identically.
    $result = $enforce($actor, [RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION], null);

    expect($result)->toBe([RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION]);
});

// =====================================================================
// The Super Admin exemption — RolePermissionSeeder grants the Super
// Admin role no permissions of its own (Gate::before bypasses instead),
// so a literal "do you hold what you're granting" reading would wrongly
// refuse them from granting anything at all.
// =====================================================================

test('a Super Admin actor is exempt entirely, and may grant a permission they do not themselves hold', function () {
    grantorScopeTestPermission('users.delete');
    Role::firstOrCreateSuperAdminRole();
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $enforce = app(EnforceGrantorPermissionScope::class);

    $result = $enforce($superAdmin, ['users.delete'], null);

    expect($result)->toBe(['users.delete']);
});

// =====================================================================
// A fully unprivileged actor granting nothing new — the vacuous case
// must not throw.
// =====================================================================

test('an empty submitted permission list never throws, regardless of the actor', function () {
    $unprivileged = User::factory()->create();

    $enforce = app(EnforceGrantorPermissionScope::class);

    $result = $enforce($unprivileged, [], null);

    expect($result)->toBe([]);
});
