<?php

// Story 0012 — server-side module access gating for the two Epic-1 module
// routes (`users.index`, `roles.index`). Per the task file
// (ai-spec/tasks/in-progress/0012-module-access-gating-backend.md), both
// routes already ship gated (`can:users.view` on routes/users.php,
// `can:roles.manage` on routes/roles.php) -- this story's real scope is the
// four gaps neither Users/IndexTest.php nor Roles/IndexTest.php already
// cover: (1) Super Admin -> 200 on roles.index, (2) cross-gate independence
// in both directions, (3) the 403 body naming no permission, and (4)
// permission-cache staleness proven through a real HTTP route round-trip
// rather than at the component/model level. See that task file's "Tests to
// perform" section for the full regression list this file does NOT
// duplicate -- those cases already live in Users/IndexTest.php and
// Roles/IndexTest.php and are re-run, not rewritten, as part of Phase 3.

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    // Pinned rather than left to the developer's ambient .env -- an
    // unrelated SUPER_ADMIN_EMAIL would otherwise have the seeder
    // provision a second account and attempt a reset mail on every test in
    // this file. Same lesson as docs/errors-log.md's SUPER_ADMIN_EMAIL
    // entry.
    config(['auth.super_admin.email' => null]);
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * A user holding exactly the given catalog permission(s) and nothing else,
 * via a fresh custom role -- deliberately never the seeded Administrator
 * role, which holds nearly the whole catalog and would silently defeat a
 * cross-gate independence assertion. Permission names must come from
 * RolePermissionSeeder's own catalog (MODULES x ACTIONS, ROLE_PERMISSIONS),
 * never be invented -- see this file's own tests below, which reference the
 * real seeded names directly.
 *
 * @param  array<int, string>  $permissions
 */
function moduleAccessUserWith(array $permissions, string $roleName): User
{
    $role = Role::create(['name' => $roleName, 'guard_name' => 'web']);
    $role->givePermissionTo($permissions);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

/**
 * A Super Admin holding no permission rows of their own -- the bypass is
 * exercised through the real Gate::before closure (0002), never faked.
 * Resolved through Role::superAdminName(), the single source of truth
 * Gate::before itself reads -- never the RoleName enum's compiled-in
 * default directly, which would silently stop matching under a configured
 * `auth.super_admin.role` override (see App\Enums\RoleName's own docblock).
 */
function moduleAccessSuperAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole(Role::superAdminName());

    return $user;
}

// =====================================================================
// New scope 1 — Super Admin -> 200 on roles.index. Users/IndexTest.php:1214
// already pins this for users.index; roles.index has no equivalent case
// today.
// =====================================================================

test('a Super Admin holding no permission rows can reach the roles screen', function () {
    $this->actingAs(moduleAccessSuperAdmin());

    $this->get(route('roles.index'))->assertOk();
});

// =====================================================================
// New scope 2 — cross-gate independence, both directions. Nothing in
// either sibling suite asserts that holding one module's permission
// refuses the other module's route.
// =====================================================================

test('a users.view holder reaches the users screen but is forbidden from the roles screen', function () {
    $user = moduleAccessUserWith(['users.view'], 'Users Viewer');
    $this->actingAs($user);

    $this->get(route('users.index'))->assertOk();
    $this->get(route('roles.index'))->assertForbidden();
});

test('a roles.manage holder reaches the roles screen but is forbidden from the users screen', function () {
    $user = moduleAccessUserWith(['roles.manage'], 'Roles Manager');
    $this->actingAs($user);

    $this->get(route('roles.index'))->assertOk();
    $this->get(route('users.index'))->assertForbidden();
});

// =====================================================================
// New scope 3 — the refusal discloses no permission name. Mirrors the
// Gherkin scenario exactly: a blog editor whose role grants only Blog
// permissions is refused the Users screen, and the refusal must not name
// "users.view" anywhere in the rendered body.
// =====================================================================

test('the users-screen refusal names no permission, so the permission catalog is not disclosed', function () {
    $blogEditor = moduleAccessUserWith(
        ['blog.view', 'blog.create', 'blog.edit', 'blog.delete'],
        'Blog Editor'
    );
    $this->actingAs($blogEditor);

    $response = $this->get(route('users.index'));

    $response->assertForbidden();
    // Positive control: the generic error page actually rendered, rather
    // than an empty/non-HTML body that would satisfy the assertDontSee()
    // calls below vacuously. AuthorizationException -> AccessDeniedHttpException
    // IS an HttpException, so Handler::prepareResponse() always renders the
    // stock errors::403 view and never the debug page regardless of
    // APP_DEBUG -- see docs/security/authorization-patterns.md#confirmed-safe-a-can-gated-routes-403-names-no-permission--and-app_debug-is-not-what-makes-that-true.
    $response->assertSee('This action is unauthorized.');
    $response->assertDontSee('users.view', false);
    $response->assertDontSee('users.create', false);
    $response->assertDontSee('users.edit', false);
    $response->assertDontSee('users.delete', false);
});

test('the roles-screen refusal names no permission, so the permission catalog is not disclosed', function () {
    $blogEditor = moduleAccessUserWith(
        ['blog.view', 'blog.create', 'blog.edit', 'blog.delete'],
        'Blog Editor'
    );
    $this->actingAs($blogEditor);

    $response = $this->get(route('roles.index'));

    $response->assertForbidden();
    $response->assertSee('This action is unauthorized.');
    $response->assertDontSee('roles.manage', false);
    $response->assertDontSee('roles.manage-administrators', false);
});

// =====================================================================
// New scope 4 — permission-cache staleness proven through the real HTTP
// route, not at the component/model level (Users/IndexTest.php:1169 and
// Roles/IndexTest.php:152/:182 already cover the latter). This is the
// layer this story actually owns: the route-middleware gate.
// =====================================================================

test('revoking a route permission from a holder role closes it on the very next HTTP request', function (string $routeName, string $permission) {
    $role = Role::create(['name' => "Revoke Test - {$routeName}", 'guard_name' => 'web']);
    $role->givePermissionTo($permission);

    $user = User::factory()->create();
    $user->assignRole($role);
    $this->actingAs($user);

    // Warm request, proves the permission is live before the change.
    $this->get(route($routeName))->assertOk();

    $role->revokePermissionTo($permission);

    // No forgetCachedPermissions() call here, between Act and Assert: if a
    // stale cache were masking the revocation, this HTTP round-trip -- not
    // a call the test makes for it -- is what must catch it.
    $this->get(route($routeName))->assertForbidden();
})->with([
    'users.index / users.view' => ['users.index', 'users.view'],
    'roles.index / roles.manage' => ['roles.index', 'roles.manage'],
]);

test('granting a route permission to a holder role opens it on the very next HTTP request', function (string $routeName, string $permission) {
    $role = Role::create(['name' => "Grant Test - {$routeName}", 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole($role);
    $this->actingAs($user);

    $this->get(route($routeName))->assertForbidden();

    $role->givePermissionTo($permission);

    $this->get(route($routeName))->assertOk();
})->with([
    'users.index / users.view' => ['users.index', 'users.view'],
    'roles.index / roles.manage' => ['roles.index', 'roles.manage'],
]);
