<?php

// Story 0013 — sidebar module gating: config/modules.php (a declarative
// registry, split into `groups`/`items`), the new anonymous
// resources/views/components/sidebar-nav.blade.php component, and
// lang/{en,es}/navigation.php. None of that production code exists yet at
// the time this file is written -- this is the TDD red step (Phase 3 step
// 1, per ai-spec/tasks/done/0013-sidebar-module-gating-ui.md).
// frontend-expert implements it green next, in a separate phase.
//
// Feature tests only, never tests/Browser/: this is pure server-rendered
// conditional markup with no JS/Alpine/Livewire round-trip involved (task
// file, Phase 2 review F-4) -- a plain HTTP GET to the dashboard route
// renders the full page through resources/views/layouts/app/sidebar.blade.php
// (via <x-layouts::app>, confirmed against resources/views/dashboard.blade.php
// and routes/web.php's `Route::view('dashboard', 'dashboard')`), so a Feature
// test asserting on the response body observes everything a browser test
// would, without the added flake/runtime.
//
// Asserting absence never uses assertDontSee('Users') / assertDontSee('Settings')
// -- those words collide with the page <title> and the personal-account
// Settings menu item in the same rendered page (see
// resources/views/layouts/app/sidebar.blade.php's mobile-header dropdown).
// Every presence/absence assertion below targets the data-test hook the
// task file specifies instead: `sidebar-link-{key}` per item,
// `sidebar-group-{key}` per group heading.
//
// Fixtures use ad-hoc custom roles + Permission::firstOrCreate() rather than
// seeding the full RolePermissionSeeder catalog, matching
// tests/Feature/Roles/IndexUiTest.php's own stated reasoning: this file only
// cares about the exact strings `users.view` and `roles.manage` (plus a
// couple of unrelated permissions to prove independence), so it stays
// decoupled from the catalog's full contents. The one exception is the
// Super Admin case, which must go through Role::firstOrCreateSuperAdminRole()
// / Role::superAdminName() per the task file's explicit instruction (never a
// hardcoded "Super Admin" string or RoleName::SuperAdmin->value directly --
// see App\Enums\RoleName's own docblock on why).
//
// Helper functions are named sidebarNav*() specifically to avoid a PHP
// "cannot redeclare function" fatal against roleUi*() (IndexUiTest.php) and
// moduleAccess*() (ModuleRouteAccessTest.php) when the full suite loads
// every Feature test file in one process.

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    // Pinned rather than left to the developer's ambient .env, matching
    // every other file in this suite that touches role/permission fixtures
    // (docs/errors-log.md, 2026-08-12 entry) -- and required here
    // specifically because the Super Admin test below resolves the role via
    // Role::superAdminName(), which reads this exact config key.
    config(['auth.super_admin.email' => null]);
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

/**
 * A `web`-guard permission fixture row, get-or-create.
 */
function sidebarNavPermission(string $name): Permission
{
    return Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
}

/**
 * A signed-in user holding exactly the given permissions and nothing else,
 * via a fresh custom role -- deliberately never the seeded Administrator
 * role, which holds both users.view and roles.manage at once and would
 * silently defeat the gate-independence assertions below.
 *
 * @param  array<int, string>  $permissions
 */
function sidebarNavUserWith(array $permissions): User
{
    $role = Role::create(['name' => 'Sidebar Test Role '.Str::random(8), 'guard_name' => 'web']);

    foreach ($permissions as $permission) {
        sidebarNavPermission($permission);
        $role->givePermissionTo($permission);
    }

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

/**
 * A Super Admin holding zero permission rows of its own -- the fixture must
 * not assign anything "just in case", or the test would prove a broad grant
 * rather than the Gate::before bypass path (task file, Tests to perform).
 */
function sidebarNavSuperAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole(Role::firstOrCreateSuperAdminRole());

    return $user;
}

// =====================================================================
// Happy path — each entry appears for a role holding its exact permission.
// =====================================================================

test('a role holding users.view sees the Users entry', function () {
    $this->actingAs(sidebarNavUserWith(['users.view']));

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertSee('data-test="sidebar-link-users"', false);
});

test('a role holding roles.manage sees the Roles & Permissions entry', function () {
    $this->actingAs(sidebarNavUserWith(['roles.manage']));

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertSee('data-test="sidebar-link-roles"', false);
});

// =====================================================================
// Negative — an entry stays hidden without its own exact permission.
// Anchored with an assertSee() on the always-visible Dashboard hook so the
// assertion actually exercises the sidebar-nav component once it exists,
// rather than passing vacuously because the hook doesn't exist at all yet.
// =====================================================================

test('a role without users.view never sees the Users entry', function () {
    $this->actingAs(sidebarNavUserWith(['blog.view']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-link-dashboard"', false);
    $response->assertDontSee('data-test="sidebar-link-users"', false);
});

test('a role holding the related-but-different users.create permission still never sees the Users entry', function () {
    // The regression test for "never advertise a link the route would
    // refuse" (task file, Phase 2 review F-3) — the highest-value new case
    // in this story. routes/users.php gates users.index on exactly
    // can:users.view; a registry entry gated on anything broader (e.g.
    // adding users.create) would show this link to a role the route itself
    // then 403s.
    $this->actingAs(sidebarNavUserWith(['users.create']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-link-dashboard"', false);
    $response->assertDontSee('data-test="sidebar-link-users"', false);
});

// =====================================================================
// Gate independence, both directions. A single test granting both
// permissions together would pass even if both entries were wired to the
// same permission list — direction 2 is the one most likely to be skipped,
// per the task file, and must not be the only coverage's counterpart.
// =====================================================================

test('gate independence, direction 1 — a role holding users.view but not roles.manage never sees the Roles & Permissions entry', function () {
    $this->actingAs(sidebarNavUserWith(['users.view']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-link-users"', false);
    $response->assertDontSee('data-test="sidebar-link-roles"', false);
});

test('gate independence, direction 2 — a role holding only roles.manage never sees the Users entry', function () {
    $this->actingAs(sidebarNavUserWith(['roles.manage']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-link-roles"', false);
    $response->assertDontSee('data-test="sidebar-link-users"', false);
});

test('a role holding neither users.view nor roles.manage sees neither gated entry', function () {
    $this->actingAs(sidebarNavUserWith(['blog.view']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-link-dashboard"', false);
    $response->assertDontSee('data-test="sidebar-link-users"', false);
    $response->assertDontSee('data-test="sidebar-link-roles"', false);
});

// =====================================================================
// Mechanism, real journey — filter-before-group against the real, shipped
// "Settings" group, not a stubbed registry (task file, Phase 2 review F-7).
// =====================================================================

test('the Settings group renders no heading at all when its only entry is hidden', function () {
    $this->actingAs(sidebarNavUserWith(['users.view']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    // Platform survives (Dashboard + Users), so its heading must still
    // render -- proving the "no heading" behaviour is specific to an
    // emptied group and not a blanket suppression.
    $response->assertSee('data-test="sidebar-group-platform"', false);
    $response->assertSee('data-test="sidebar-link-users"', false);
    // Settings' only entry (Roles & Permissions) is filtered out first, so
    // the group itself must never reach the render step at all -- not
    // merely render with an empty body. assertDontSee('Settings') is
    // deliberately not used here: it would collide with the personal
    // Settings item in the user-menu dropdown, rendered in the same page.
    $response->assertDontSee('data-test="sidebar-group-settings"', false);
});

// =====================================================================
// Edge — the Super Admin bypass, exercised through the real Gate::before
// closure (task 0002/0008) with zero permission rows of its own.
// =====================================================================

test('a Super Admin holding zero permission rows sees every registered module entry', function () {
    $this->actingAs(sidebarNavSuperAdmin());

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-group-platform"', false);
    $response->assertSee('data-test="sidebar-link-dashboard"', false);
    $response->assertSee('data-test="sidebar-link-users"', false);
    $response->assertSee('data-test="sidebar-group-settings"', false);
    $response->assertSee('data-test="sidebar-link-roles"', false);
});

// =====================================================================
// Edge — Dashboard is not a permission-gated module.
// =====================================================================

test('a user with zero module permissions still sees the Dashboard entry', function () {
    $this->actingAs(User::factory()->create());

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-link-dashboard"', false);
    $response->assertDontSee('data-test="sidebar-link-users"', false);
    $response->assertDontSee('data-test="sidebar-link-roles"', false);
});

// =====================================================================
// Scope boundary — module gating must not affect the personal account
// menu, which is rendered by resources/views/layouts/app/sidebar.blade.php
// itself (mobile-header dropdown) and is explicitly out of this story's
// scope ("Files to create/modify" — modify, not replace; everything but
// the two <flux:sidebar.group> blocks is unchanged). This test is expected
// to PASS already, before any production code for this story exists --
// unlike every test above, it pins pre-existing, unrelated-to-this-story
// behaviour rather than exercising the new registry/component, so it is a
// regression guard rather than a red-step case.
// =====================================================================

test('module gating does not affect the personal account menu', function () {
    $this->actingAs(User::factory()->create());

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="logout-button"', false);
    $response->assertSee('href="'.route('profile.edit').'"', false);
});

// =====================================================================
// Reactivity — a revoked permission removes its entry on the NEXT request.
// Spatie's registrar cache is flushed internally by revokePermissionTo(),
// and Gate::before re-resolves per request, so no manual cache-busting is
// needed here -- no forgetCachedPermissions() call between Act and Assert,
// matching tests/Feature/Authorization/ModuleRouteAccessTest.php's
// identical reactivity test at the route-middleware layer.
// =====================================================================

test('revoking a role\'s users.view permission removes the Users entry on the next request', function () {
    sidebarNavPermission('users.view');
    $role = Role::create(['name' => 'Revocable Sidebar Role', 'guard_name' => 'web']);
    $role->givePermissionTo('users.view');

    $user = User::factory()->create();
    $user->assignRole($role);
    $this->actingAs($user);

    // Warm request -- proves the entry is live before the change.
    $this->get(route('dashboard'))->assertSee('data-test="sidebar-link-users"', false);

    $role->revokePermissionTo('users.view');

    $this->get(route('dashboard'))->assertDontSee('data-test="sidebar-link-users"', false);
});

// =====================================================================
// Mechanism — config/modules.php contains no closures and survives
// config:cache (task file, Phase 2 re-review note: previously untested
// beyond code review). Wrapped in try/finally so the working tree is left
// exactly as it started (php artisan config:clear) regardless of outcome.
//
// This test currently PASSES rather than fails red: config:cache succeeds
// today regardless of config/modules.php's absence (Laravel merges
// whatever config/*.php files exist), so there is nothing yet for this
// specific assertion to catch. Its value is prospective -- once
// config/modules.php exists, this becomes the regression guard for the
// acceptance criterion "contains no closures and survives config:cache":
// config:cache throws when any config file returns a non-serializable
// closure, which this test would then catch.
// =====================================================================

test('config:cache succeeds with the module registry present', function () {
    try {
        $exitCode = Artisan::call('config:cache');

        expect($exitCode)->toBe(0);
    } finally {
        Artisan::call('config:clear');
    }
});

// =====================================================================
// Regression guards added at Phase 4 (appsec-auditor, story 0013, findings
// F1/F2 -- both Low, non-exploitable since the route's own `can:` middleware
// still refuses either way, but the registry is designed to be appended to
// by every later epic, and `empty($item['permissions'])` reads a MISSING or
// misspelled `permissions` key identically to a deliberate `[]` -- an
// omission and a decision look the same. See
// docs/security/authorization-patterns.md's "A registry that means
// 'ungated' by absence fails open, silently" section.
// =====================================================================

test('every ungated registry item is on the explicit allow-list', function () {
    // F1 — `empty($item['permissions'])` in sidebar-nav.blade.php cannot
    // distinguish "deliberately ungated" from "the permissions key was
    // forgotten or misspelled" -- both make the entry visible to everyone.
    // Epic 1 ships exactly one deliberately ungated entry (Dashboard); this
    // is an allow-list, not a shape check, so a new item can only join it by
    // someone editing this line -- never silently by omission.
    $deliberatelyUngated = ['dashboard'];

    foreach (config('modules.items') as $key => $item) {
        expect($item)->toHaveKey('permissions')
            ->and($item['permissions'])->toBeArray();

        if ($item['permissions'] === []) {
            expect($key)->toBeIn($deliberatelyUngated);
        }
    }
});

test('every gated registry item\'s permissions match exactly what its route\'s can: middleware enforces', function () {
    // F2 — config/modules.php's mapping is correct today (verified here,
    // mechanically, rather than trusted from the file's own prose comment),
    // but nothing previously pinned it: a route gaining, losing, or
    // widening its `can:` gate would silently desync from the registry,
    // violating the acceptance criterion "never advertise a link the route
    // would refuse" with no test failing anywhere.
    foreach (config('modules.items') as $item) {
        $route = Route::getRoutes()->getByName($item['route']);
        expect($route)->not->toBeNull();

        $gatedAbilities = collect($route->gatherMiddleware())
            ->filter(fn (string $middleware): bool => str_starts_with($middleware, 'can:'))
            ->map(fn (string $middleware): string => substr($middleware, strlen('can:')))
            ->values()
            ->all();

        expect($gatedAbilities)->toEqualCanonicalizing($item['permissions']);
    }
});
