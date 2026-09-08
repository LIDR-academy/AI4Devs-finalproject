<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

test('a Super Admin passes a permission check that was never granted to them', function () {
    $user = User::factory()->create();
    $user->assignRole('Super Admin');

    expect($user->can('products.delete'))->toBeTrue();
});

test('a Super Admin passes a check for an ability the permission catalog does not define', function () {
    $user = User::factory()->create();
    $user->assignRole('Super Admin');

    expect($user->can('an-ability-outside-the-seeded-catalog'))->toBeTrue();
});

test('the bypass returns null, not false, for a non-Super-Admin, so their real permissions are still consulted', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');

    // If the Gate::before closure returned false for every non-Super-Admin, this granted
    // permission would also be denied. It passing proves the closure yields null here.
    expect($administrator->can('roles.manage'))->toBeTrue()
        ->and($administrator->can('roles.manage-administrators'))->toBeFalse();
});

test('a non-Super-Admin still passes checks for permissions their role actually holds', function () {
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $blogEditorRole->givePermissionTo(['blog.view', 'blog.create', 'blog.edit', 'blog.delete']);

    $editor = User::factory()->create();
    $editor->assignRole($blogEditorRole);

    expect($editor->can('blog.edit'))->toBeTrue();
});

test('a blog editor whose role grants only the Blog permissions is refused a products.delete check', function () {
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $blogEditorRole->givePermissionTo(['blog.view', 'blog.create', 'blog.edit', 'blog.delete']);

    $editor = User::factory()->create();
    $editor->assignRole($blogEditorRole);

    expect($editor->can('products.delete'))->toBeFalse();
});

test('a user with no role fails every catalog permission check', function () {
    $user = User::factory()->create();

    expect($user->can('products.delete'))->toBeFalse()
        ->and($user->can('roles.manage'))->toBeFalse()
        ->and($user->can('blog.view'))->toBeFalse();
});

// --- Gate closure guards (F5/F6/F7) ---

test('the gate closure returns null for a non-User authenticatable instead of throwing', function () {
    // Gate::before invokes its callback without consulting the closure's type hint, so a
    // non-User authenticatable reaching the old `fn (User $user)` closure fatals with a
    // TypeError rather than falling through cleanly. This pins the F7 fix: an anonymous
    // Authenticatable (no `checkPermissionTo`, so Spatie's own before-hook also no-ops)
    // must not blow up the check. It also implements the Authorizable contract (trivially)
    // so Spatie's *own* unrelated `Gate::before` closure — type-hinted against Authorizable,
    // not our app's User — doesn't throw first and mask what this test is actually pinning.
    $fakeAuthenticatable = new class implements Authenticatable, AuthorizableContract
    {
        public function getAuthIdentifierName()
        {
            return 'id';
        }

        public function getAuthIdentifier()
        {
            return 'fake-id';
        }

        public function getAuthPasswordName()
        {
            return 'password';
        }

        public function getAuthPassword()
        {
            return 'hash';
        }

        public function getRememberToken()
        {
            return null;
        }

        public function setRememberToken($value) {}

        public function getRememberTokenName()
        {
            return 'remember_token';
        }

        public function can($abilities, $arguments = [])
        {
            return false;
        }
    };

    expect(fn () => Gate::forUser($fakeAuthenticatable)->allows('products.delete'))
        ->not->toThrow(Throwable::class);

    expect(Gate::forUser($fakeAuthenticatable)->allows('products.delete'))->toBeFalse();
});

test('an unset super_admin.role config value fails safe instead of throwing, and the fallback default still lets a real Super Admin bypass', function () {
    config(['auth.super_admin.role' => null]);

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    // The Administrator holds `roles.manage` as a direct grant, so that check can be
    // satisfied by Spatie's own Gate::before hook without ever reaching our closure. The
    // Super Admin holds zero permission rows by design, so this check can *only* be
    // satisfied by our closure falling through to it — this is the call that would
    // otherwise fatal on hasRole(null) without the F6 fallback default.
    expect(fn () => $superAdmin->can('products.delete'))->not->toThrow(Throwable::class);

    expect($administrator->can('roles.manage'))->toBeTrue()
        ->and($superAdmin->can('products.delete'))->toBeTrue();
});

test('a Super Admin role created on a different guard does not bypass a web-guard permission check', function () {
    config(['auth.guards.api' => ['driver' => 'session', 'provider' => 'users']]);

    $apiSuperAdminRole = Role::create(['name' => 'Super Admin', 'guard_name' => 'api']);

    $user = User::factory()->create();
    $user->assignRole($apiSuperAdminRole);

    expect($user->hasRole('Super Admin', 'api'))->toBeTrue()
        ->and($user->can('products.delete'))->toBeFalse();
});
