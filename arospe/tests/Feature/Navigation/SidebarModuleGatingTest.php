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
// Story 0018 — the sales_regions entry, RE-TARGETED by story 0080 (see the
// story 0080 sections further below for the full rationale). `groups.taxes`
// is retired by 0080 D-4 and `sales_regions` moves into the `store_settings`
// cluster inside the new `store` group (D-1) -- R-3 in the 0080 task file
// explicitly instructs converting every `sidebar-group-taxes`/
// `sidebar-group-platform` hit "deliberately" rather than leaving it stale,
// so these three tests are UPDATED in place (same behaviour under test,
// new hooks) rather than left asserting a group key story 0080 deletes.
// Two generic Phase-4 guard tests already cross-check the registry against
// the route for every entry with no edit needed (see below); what is added
// here is the per-entry coverage those generic checks cannot supply.
// =====================================================================

test('a role holding exactly sales-regions.view sees the Sales Regions entry under the Store settings cluster', function () {
    $this->actingAs(sidebarNavUserWith(['sales-regions.view']));

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertSee('data-test="sidebar-group-store"', false)
        ->assertSee('data-test="sidebar-cluster-store_settings"', false)
        ->assertSee('data-test="sidebar-link-sales_regions"', false)
        // This role holds no products-family permission, so the sibling
        // Products cluster must not render at all (0080 category 3).
        ->assertDontSee('data-test="sidebar-cluster-products"', false);
});

test('a role holding the related-but-different sales-regions.edit permission never sees the Sales Regions entry, the Store settings cluster or the Store group', function () {
    // The same "never advertise a link the route would refuse" regression
    // case story 0013 established for users.create — routes/sales-regions.php
    // gates sales-regions.index on exactly can:sales-regions.view. This role
    // holds no products-family permission either, so the whole Store group
    // (both of its clusters) must vanish, not merely the Sales Regions link.
    $this->actingAs(sidebarNavUserWith(['sales-regions.edit']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-link-dashboard"', false);
    $response->assertDontSee('data-test="sidebar-link-sales_regions"', false);
    $response->assertDontSee('data-test="sidebar-cluster-store_settings"', false);
    $response->assertDontSee('data-test="sidebar-group-store"', false);
});

test('the Store group renders no heading at all when neither of its clusters has a visible child', function () {
    // 0080 category 3's headline scenario: unlike the retired `taxes` group
    // (one direct item), `store` starts with TWO clusters and ZERO direct
    // items (D-1), so this is testable immediately -- no fixture faking or
    // deferral needed, per the 0080 task file's own note under "Tests to
    // perform" #3.
    $this->actingAs(sidebarNavUserWith(['users.view']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    // Dashboard and Users still render bare (0080 D-2), proving the "no
    // heading" behaviour is specific to the emptied Store group, not a
    // blanket suppression of the whole sidebar.
    $response->assertSee('data-test="sidebar-link-dashboard"', false);
    $response->assertSee('data-test="sidebar-link-users"', false);
    $response->assertDontSee('data-test="sidebar-group-store"', false);
    $response->assertDontSee('data-test="sidebar-cluster-products"', false);
    $response->assertDontSee('data-test="sidebar-cluster-store_settings"', false);
    $response->assertDontSee('data-test="sidebar-link-sales_regions"', false);
});

// =====================================================================
// Story 0034 — the shipping_zones entry. RE-TARGETED at merge time (2026-09-08): 0034's own
// branch shipped this as its own flat top-level `shipping` group (mirroring the now-retired
// `taxes` shape); merging into `feature-entrega2-ARP` after story 0080 landed re-targets it into
// 0080's real, shipped `store_settings` cluster instead -- the SAME cluster `sales_regions`
// already occupies (0080's own forward note in config/modules.php named this exact outcome).
// Two generic Phase-4 guard tests already cross-check the registry against the route with no
// edit needed (see below); this trio covers what those cannot: shipping_zones' own per-entry
// gating, AND (the genuinely new scenario `store_settings` did not exercise before this story,
// since it held only one item) two siblings in the SAME cluster gated independently of each
// other -- one visible while the other is hidden must still render the cluster.
// =====================================================================

test('a role holding exactly shipping.view sees the Shipping zones entry under the Store settings cluster, with Sales Regions hidden', function () {
    $this->actingAs(sidebarNavUserWith(['shipping.view']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-group-store"', false);
    $response->assertSee('data-test="sidebar-cluster-store_settings"', false);
    $response->assertSee('data-test="sidebar-link-shipping_zones"', false);
    // This role holds no sales-regions permission, so its sibling in the SAME cluster must not
    // render, while the cluster itself still does (this is the new case: a shared cluster with
    // mixed per-item visibility, untestable before shipping_zones became store_settings' second
    // member).
    $response->assertDontSee('data-test="sidebar-link-sales_regions"', false);
    // No products-family permission either, so the sibling Products cluster must not render.
    $response->assertDontSee('data-test="sidebar-cluster-products"', false);
});

test('a role holding the related-but-different shipping.edit permission never sees the Shipping zones entry, the Store settings cluster or the Store group', function () {
    $this->actingAs(sidebarNavUserWith(['shipping.edit']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-link-dashboard"', false);
    $response->assertDontSee('data-test="sidebar-link-shipping_zones"', false);
    $response->assertDontSee('data-test="sidebar-cluster-store_settings"', false);
    $response->assertDontSee('data-test="sidebar-group-store"', false);
});

test('the Store settings cluster still renders with only one visible child when its two members are gated independently', function () {
    // Inverse of the first test above: this role holds sales-regions.view but not
    // shipping.view, so the cluster survives on ITS OTHER member alone.
    $this->actingAs(sidebarNavUserWith(['sales-regions.view']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-cluster-store_settings"', false);
    $response->assertSee('data-test="sidebar-link-sales_regions"', false);
    $response->assertDontSee('data-test="sidebar-link-shipping_zones"', false);
});

// =====================================================================
// Story 0025 — the product_categories entry. Two generic Phase-4 guard tests
// already cross-check the registry against the route for every entry with no
// edit needed (see below); what is added here is the per-entry coverage those
// generic checks cannot supply, mirroring story 0018's sales_regions tests
// (Phase 5 review finding N-4).
// =====================================================================

test('a role holding exactly products.view sees the Product categories entry under the Products cluster', function () {
    // Re-targeted by story 0080 (D-1/D-4): product_categories now nests in
    // the `products` cluster inside the `store` group, not the retired flat
    // `platform` group — see the story 0018 block above for why this
    // conversion is a deliberate R-3 update, not a weakening.
    $this->actingAs(sidebarNavUserWith(['products.view']));

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertSee('data-test="sidebar-group-store"', false)
        ->assertSee('data-test="sidebar-cluster-products"', false)
        ->assertSee('data-test="sidebar-link-product_categories"', false);
});

test('a role holding the related-but-different products.edit permission never sees the Product categories entry or the Products cluster', function () {
    // routes/product-categories.php gates product-categories.index on exactly
    // can:products.view.
    $this->actingAs(sidebarNavUserWith(['products.edit']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-link-dashboard"', false);
    $response->assertDontSee('data-test="sidebar-link-product_categories"', false);
    $response->assertDontSee('data-test="sidebar-cluster-products"', false);
});

// =====================================================================
// Story 0027 — the products entry. Two generic Phase-4 guard tests already
// cross-check the registry against the route for every entry with no edit
// needed (see below); what is added here is the per-entry coverage those
// generic checks cannot supply, mirroring story 0018's sales_regions and
// story 0025's product_categories tests (code-reviewer, story 0027 Phase 5
// review, finding F-3).
// =====================================================================

test('a role holding exactly products.view sees the Products entry under the Products cluster', function () {
    // Re-targeted by story 0080 (D-1/D-4): products now nests in the
    // `products` cluster inside the `store` group.
    $this->actingAs(sidebarNavUserWith(['products.view']));

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertSee('data-test="sidebar-group-store"', false)
        ->assertSee('data-test="sidebar-cluster-products"', false)
        ->assertSee('data-test="sidebar-link-products"', false);
});

test('a role holding only the related-but-different products.edit permission never sees the Products entry', function () {
    // routes/products.php gates products.index on exactly can:products.view.
    $this->actingAs(sidebarNavUserWith(['products.edit']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-link-dashboard"', false);
    $response->assertDontSee('data-test="sidebar-link-products"', false);
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
    // Story 0018 — the same role holds no sales-regions.view either, so it
    // must not see the sales_regions entry (this test would otherwise
    // silently under-cover the new registry entry, task file note on
    // this file).
    $response->assertDontSee('data-test="sidebar-link-sales_regions"', false);
});

// =====================================================================
// Mechanism, real journey — filter-before-group against the real, shipped
// "Settings" group, not a stubbed registry (task file, Phase 2 review F-7).
// =====================================================================

test('the Settings group renders no heading at all when its only entry is hidden', function () {
    $this->actingAs(sidebarNavUserWith(['users.view']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    // Re-targeted by story 0080: Dashboard and Users are no longer inside a
    // "Platform" group at all (D-2 -- bare top-level items, no wrapper), so
    // the "something else survives" half of this proof is now that the bare
    // links themselves still render, not that a group heading does.
    $response->assertSee('data-test="sidebar-link-dashboard"', false);
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
    // Re-targeted by story 0080: Dashboard/Users are bare (D-2, no group
    // wrapper) and every products-family + sales_regions entry now nests
    // inside the Store group's two clusters (D-1/D-4) rather than the
    // retired flat `platform`/`taxes` groups. Settings/Roles is UNAFFECTED
    // by this story and its assertions are kept exactly as they were.
    $response->assertSee('data-test="sidebar-link-dashboard"', false);
    $response->assertSee('data-test="sidebar-link-users"', false);
    $response->assertSee('data-test="sidebar-group-settings"', false);
    $response->assertSee('data-test="sidebar-link-roles"', false);
    // Story 0080 — the Store group and both of its clusters, fully visible.
    $response->assertSee('data-test="sidebar-group-store"', false);
    $response->assertSee('data-test="sidebar-cluster-products"', false);
    $response->assertSee('data-test="sidebar-link-products"', false);
    $response->assertSee('data-test="sidebar-link-product_categories"', false);
    $response->assertSee('data-test="sidebar-link-product_attribute_types"', false);
    $response->assertSee('data-test="sidebar-cluster-store_settings"', false);
    $response->assertSee('data-test="sidebar-link-sales_regions"', false);
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
    // Story 0018, re-targeted by story 0080 -- see the story 0018 block
    // above for why `sidebar-group-taxes` becomes `sidebar-group-store`.
    $response->assertDontSee('data-test="sidebar-link-sales_regions"', false);
    $response->assertDontSee('data-test="sidebar-group-store"', false);
    $response->assertDontSee('data-test="sidebar-cluster-products"', false);
    $response->assertDontSee('data-test="sidebar-cluster-store_settings"', false);
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
//
// Story 0080 note (0080 task file, "Tests to perform" #4 -- "Both existing
// generic drift guards still pass, extended to recurse into cluster
// children"): neither test below needs any CODE change to satisfy that.
// D-1 deliberately keeps `items` a FLAT array (three sibling arrays --
// `groups`/`clusters`/`items` -- rather than nesting a `children` array
// inside a cluster or item), specifically so a generic guard iterating
// `config('modules.items')` already covers every item regardless of whether
// its `cluster` key is null or set -- there is no separate "children" bag a
// guard could forget to recurse into. Both tests below are therefore
// UNCHANGED by this story and are expected to keep passing once the target
// schema ships; two NEW guards immediately below them cover the risk that
// *is* new under the target schema -- a dangling `cluster`/`group`
// reference (0080 category 6).
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

// =====================================================================
// Story 0080 -- sidebar navigation grouping and sub-resource nesting.
//
// Written RED, against the CURRENT (unmodified) config/modules.php and
// resources/views/components/sidebar-nav.blade.php -- neither the
// `clusters` registry array nor the `sidebar-cluster-{key}` rendering
// primitive exists yet, so most of what follows fails until frontend-expert
// ships the target schema (0080 task file D-1 through D-4, Phase 3 step 2).
//
// Two rendering-shape facts below were verified directly against the real,
// installed vendor/livewire/flux source and a throwaway render of the
// CURRENT sidebar (not assumed), because a plain assertSee() cannot
// distinguish "current"/"expanded" from their opposite:
//
//   1. flux:sidebar.item's `:current` prop is merged onto the rendered
//      <a ...> tag as a literal `data-current="data-current"` attribute
//      when true, and OMITTED ENTIRELY when false
//      (vendor/livewire/flux/stubs/resources/views/flux/button-or-link.blade.php).
//   2. flux:sidebar.group's `:expanded` prop, when the group is
//      `expandable`, renders as a bare `open` attribute on the underlying
//      <ui-disclosure ...> tag when true, and is OMITTED ENTIRELY when
//      false (vendor/livewire/flux/stubs/resources/views/flux/sidebar/group.blade.php).
//      When NOT `expandable` (the shipped Platform/Taxes groups today, and
//      the target `store` group per D-1's target shape -- `expandable:
//      false`), the group renders as a plain <div>, with no open/expanded
//      concept at all -- confirmed by the same file's `elseif ($heading)`
//      branch. Categories 2/5 below therefore assume clusters render via
//      the SAME expandable <flux:sidebar.group> primitive the existing
//      Settings/Roles disclosure already uses (D-3's "reference shape"),
//      nested one level deeper inside the outer (non-expandable) Store
//      group -- the natural reading of D-1/D-3, and the primary design R-1
//      asks to verify by execution. If R-1's fallback (a non-expandable
//      cluster) is taken instead, the open/collapsed assertions in
//      category 5 below need adjusting; every other assertion in this
//      section (hooks, nesting order, gating) is unaffected either way.
//
// Both facts were captured with a throwaway Feature test dumping real
// response HTML around the relevant hooks, then deleted -- not guessed.
// =====================================================================

/**
 * Extract the single HTML tag (from its nearest preceding `<` to its next
 * `>`) that contains the given needle string, e.g. a `data-test="..."`
 * attribute. This is what lets a Feature test tell "is this specific link
 * marked current" apart from "does the word `data-current` appear anywhere
 * on the page" -- both `data-current` and `data-test` sit on the SAME
 * opening tag for a flux:sidebar.item / flux:sidebar.group render (verified
 * live, see the file banner above), so extracting that one tag and
 * inspecting it is a precise, non-flaky proxy for "this element's own
 * attributes", with no dependency on attribute order.
 */
function sidebarNavExtractTagContaining(string $html, string $needle): string
{
    $needlePos = strpos($html, $needle);
    expect($needlePos)->not->toBeFalse("Expected to find \"{$needle}\" in the rendered page, but it was not present at all.");

    $tagStart = strrpos(substr($html, 0, $needlePos), '<');
    $tagEnd = strpos($html, '>', $needlePos);

    expect($tagStart)->not->toBeFalse()->and($tagEnd)->not->toBeFalse();

    return substr($html, $tagStart, $tagEnd - $tagStart + 1);
}

/**
 * Asserts the sidebar-link-{$itemKey} anchor carries `data-current`, i.e.
 * that item is highlighted as the current page (per request()->routeIs()
 * against the item's own `current_when` pattern).
 */
function sidebarNavAssertLinkCurrent(string $html, string $itemKey): void
{
    $tag = sidebarNavExtractTagContaining($html, 'data-test="sidebar-link-'.$itemKey.'"');

    expect($tag)->toContain('data-current="data-current"');
}

/**
 * Inverse of sidebarNavAssertLinkCurrent() -- the item's own anchor tag
 * must NOT carry `data-current`.
 */
function sidebarNavAssertLinkNotCurrent(string $html, string $itemKey): void
{
    $tag = sidebarNavExtractTagContaining($html, 'data-test="sidebar-link-'.$itemKey.'"');

    expect($tag)->not->toContain('data-current="data-current"');
}

/**
 * Asserts the sidebar-cluster-{$clusterKey} disclosure element carries the
 * bare `open` attribute -- i.e. the cluster is expanded, per D-3's rule
 * that a cluster's expand state is DERIVED from whether any of its
 * currently visible children matches the current route, never a
 * separately-maintained `expanded_when` pattern.
 */
function sidebarNavAssertClusterExpanded(string $html, string $clusterKey): void
{
    $tag = sidebarNavExtractTagContaining($html, 'data-test="sidebar-cluster-'.$clusterKey.'"');

    expect($tag)->toMatch('/(^|[\s<])open([\s>]|$)/');
}

/**
 * Inverse of sidebarNavAssertClusterExpanded() -- the cluster's own
 * disclosure element must NOT carry the bare `open` attribute.
 */
function sidebarNavAssertClusterCollapsed(string $html, string $clusterKey): void
{
    $tag = sidebarNavExtractTagContaining($html, 'data-test="sidebar-cluster-'.$clusterKey.'"');

    expect($tag)->not->toMatch('/(^|[\s<])open([\s>]|$)/');
}

// =====================================================================
// 0080 category 1 — structural rendering.
// =====================================================================

test('Dashboard and Users render before any group hook, proving no group element wraps them', function () {
    // D-2: a bare top-level item renders with NO wrapping <flux:sidebar.group>
    // at all -- not even one with a null heading. There is no single
    // assertSee() that proves an *absence* of a wrapping element, so this
    // asserts the next best directly-observable fact: both bare items'
    // link hooks appear in the rendered HTML strictly BEFORE the first
    // group hook of any kind, since resources/views/components/sidebar-nav
    // is expected to render bare items ahead of every grouped/clustered one
    // (0080 "Files to create/modify" bullet: "bare items ... direct group
    // children ... clusters", in that order).
    $this->actingAs(sidebarNavSuperAdmin());

    $response = $this->get(route('dashboard'));
    $html = $response->getContent();

    $dashboardPos = strpos($html, 'data-test="sidebar-link-dashboard"');
    $usersPos = strpos($html, 'data-test="sidebar-link-users"');
    $firstGroupPos = strpos($html, 'data-test="sidebar-group-');

    expect($dashboardPos)->not->toBeFalse()
        ->and($usersPos)->not->toBeFalse()
        ->and($firstGroupPos)->not->toBeFalse()
        ->and($dashboardPos)->toBeLessThan($firstGroupPos)
        ->and($usersPos)->toBeLessThan($firstGroupPos);
});

test('the Store group renders a translated heading containing both the Products and Store settings clusters', function () {
    $this->actingAs(sidebarNavSuperAdmin());

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-group-store"', false);
    $response->assertSee('data-test="sidebar-cluster-products"', false);
    $response->assertSee('data-test="sidebar-cluster-store_settings"', false);
    // The heading is a translation KEY resolved through __(), never the raw
    // config value -- naming.md's registry-mirroring rule. Assert the raw
    // key never leaks into the page, matching the translated string
    // 'navigation.groups.store' is expected to resolve to in lang/en.
    $response->assertDontSee('navigation.groups.store', false);
});

test('group and cluster order is stable — ungrouped, then Store (Products before Store settings), then Settings', function () {
    $this->actingAs(sidebarNavSuperAdmin());

    $response = $this->get(route('dashboard'));
    $html = $response->getContent();

    $dashboardPos = strpos($html, 'data-test="sidebar-link-dashboard"');
    $storeGroupPos = strpos($html, 'data-test="sidebar-group-store"');
    $productsClusterPos = strpos($html, 'data-test="sidebar-cluster-products"');
    $storeSettingsClusterPos = strpos($html, 'data-test="sidebar-cluster-store_settings"');
    $settingsGroupPos = strpos($html, 'data-test="sidebar-group-settings"');

    foreach (['dashboardPos', 'storeGroupPos', 'productsClusterPos', 'storeSettingsClusterPos', 'settingsGroupPos'] as $var) {
        expect($$var)->not->toBeFalse("Expected to find the {$var} hook.");
    }

    expect($dashboardPos)->toBeLessThan($storeGroupPos)
        ->and($storeGroupPos)->toBeLessThan($productsClusterPos)
        ->and($productsClusterPos)->toBeLessThan($storeSettingsClusterPos)
        ->and($storeSettingsClusterPos)->toBeLessThan($settingsGroupPos);
});

test('no content group or blog cluster exists in the registry yet', function () {
    // D-5 -- Content is deliberately not declared by this story; it is
    // story 0060 (or whichever Blog story ships first)'s to add, alongside
    // its own `blog` cluster. This guards against 0080 accidentally
    // pre-declaring what D-5 explicitly defers.
    expect(config('modules.groups'))->not->toHaveKey('content');
    expect(config('modules.clusters', []))->not->toHaveKey('blog');
});

// =====================================================================
// 0080 category 2 — the nesting mechanism.
// =====================================================================

test('a cluster hook is distinguishable from a top-level group hook by its own data-test prefix', function () {
    // D-1's own stated reason for the "sidebar-cluster-{key}" prefix rather
    // than reusing "sidebar-group-{key}" for a cluster too.
    $this->actingAs(sidebarNavSuperAdmin());

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-group-store"', false);
    $response->assertSee('data-test="sidebar-cluster-products"', false);
    // The cluster prefix never collides with the group prefix string.
    expect(str_starts_with('sidebar-cluster-products', 'sidebar-group-'))->toBeFalse();
});

test('a cluster\'s children render nested inside it, not as its siblings', function () {
    // Order-based proxy for nesting depth: every one of the Products
    // cluster's three children must appear AFTER the cluster's own hook and
    // BEFORE the next cluster's hook (Store settings) -- if a child were
    // rendered as a flat sibling of the cluster instead of inside it, its
    // hook could just as easily land before the cluster's own hook or after
    // the whole Store group closes.
    $this->actingAs(sidebarNavSuperAdmin());

    $response = $this->get(route('dashboard'));
    $html = $response->getContent();

    $productsClusterPos = strpos($html, 'data-test="sidebar-cluster-products"');
    $storeSettingsClusterPos = strpos($html, 'data-test="sidebar-cluster-store_settings"');

    expect($productsClusterPos)->not->toBeFalse('Expected to find the Products cluster hook.');
    expect($storeSettingsClusterPos)->not->toBeFalse('Expected to find the Store settings cluster hook.');

    foreach (['products', 'product_categories', 'product_attribute_types'] as $childKey) {
        $childPos = strpos($html, 'data-test="sidebar-link-'.$childKey.'"');

        expect($childPos)->not->toBeFalse("Expected to find the {$childKey} link hook.");
        expect($childPos)->toBeGreaterThan($productsClusterPos);
        expect($childPos)->toBeLessThan($storeSettingsClusterPos);
    }

    $salesRegionsPos = strpos($html, 'data-test="sidebar-link-sales_regions"');
    expect($salesRegionsPos)->not->toBeFalse('Expected to find the sales_regions link hook.');
    expect($salesRegionsPos)->toBeGreaterThan($storeSettingsClusterPos);
});

test('both new clusters use the same expandable disclosure primitive as the existing Settings/Roles reference shape', function () {
    // Reference shape per D-3: the same open/collapsed mechanism already
    // proven by the Settings group (see the file banner above for how this
    // was verified against the real Flux vendor source and a throwaway
    // render). Both clusters are checked here, not just one, since 0080's
    // own Definition of Done calls this out as exercised TWICE.
    $this->actingAs(sidebarNavUserWith(['products.view', 'sales-regions.view']));

    $response = $this->get(route('dashboard'));
    $html = $response->getContent();

    $productsTag = sidebarNavExtractTagContaining($html, 'data-test="sidebar-cluster-products"');
    $storeSettingsTag = sidebarNavExtractTagContaining($html, 'data-test="sidebar-cluster-store_settings"');

    expect($productsTag)->toContain('<ui-disclosure');
    expect($storeSettingsTag)->toContain('<ui-disclosure');
});

test('a cluster with zero visible children renders no heading and no disclosure control at all', function () {
    // A role holding neither of the Products family's permissions must not
    // see the Products cluster hook anywhere on the page -- not merely a
    // collapsed/empty one.
    $this->actingAs(sidebarNavUserWith(['sales-regions.view']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertDontSee('data-test="sidebar-cluster-products"', false);
    $response->assertDontSee('data-test="sidebar-link-products"', false);
    $response->assertDontSee('data-test="sidebar-link-product_categories"', false);
    $response->assertDontSee('data-test="sidebar-link-product_attribute_types"', false);
});

test('a cluster with exactly one visible child still renders the cluster wrapper rather than collapsing into a flat item', function () {
    // Exercised for real by Store settings today (D-1: only Sales Regions
    // lives there until shipping ships its own UI story), not only as a
    // hypothetical -- 0080 "Tests to perform" #2's own framing.
    $this->actingAs(sidebarNavUserWith(['sales-regions.view']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-cluster-store_settings"', false);
    $response->assertSee('data-test="sidebar-link-sales_regions"', false);
});

// =====================================================================
// 0080 category 3 — permission gating × nesting.
// =====================================================================

test('a role holding products.view sees the Products cluster with all three children', function () {
    $this->actingAs(sidebarNavUserWith(['products.view']));

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertSee('data-test="sidebar-cluster-products"', false)
        ->assertSee('data-test="sidebar-link-products"', false)
        ->assertSee('data-test="sidebar-link-product_categories"', false)
        ->assertSee('data-test="sidebar-link-product_attribute_types"', false);
});

test('a role holding exactly one of products.view or sales-regions.view sees the Store heading with only the matching cluster inside it', function () {
    // Direction A -- products.view only: Products cluster present, Store
    // settings cluster (and its one child) absent.
    $this->actingAs(sidebarNavUserWith(['products.view']));

    $responseA = $this->get(route('dashboard'));
    $responseA->assertOk();
    $responseA->assertSee('data-test="sidebar-group-store"', false);
    $responseA->assertSee('data-test="sidebar-cluster-products"', false);
    $responseA->assertDontSee('data-test="sidebar-cluster-store_settings"', false);
    $responseA->assertDontSee('data-test="sidebar-link-sales_regions"', false);

    // Direction B -- sales-regions.view only: Store settings cluster
    // present, Products cluster (and all three of its children) absent.
    $this->actingAs(sidebarNavUserWith(['sales-regions.view']));

    $responseB = $this->get(route('dashboard'));
    $responseB->assertOk();
    $responseB->assertSee('data-test="sidebar-group-store"', false);
    $responseB->assertSee('data-test="sidebar-cluster-store_settings"', false);
    $responseB->assertDontSee('data-test="sidebar-cluster-products"', false);
    $responseB->assertDontSee('data-test="sidebar-link-products"', false);
    $responseB->assertDontSee('data-test="sidebar-link-product_categories"', false);
    $responseB->assertDontSee('data-test="sidebar-link-product_attribute_types"', false);
});

test('each cluster child is gated by evaluating its own permissions entry independently, not its cluster\'s or a sibling\'s', function () {
    // Proven with a fixture override rather than production data (the
    // Products family shares `products.view` in production, per 0080's own
    // "Tests to perform" #3 instruction) -- temporarily give
    // product_categories a DIFFERENT permission than its two siblings, and
    // confirm a role holding only `products.view` still sees `products` and
    // `product_attribute_types` (the cluster and its permission-matching
    // children render) while `product_categories` specifically disappears,
    // proving the rendering pass reads each item's OWN `permissions` array
    // rather than deciding once per cluster.
    config(['modules.items.product_categories.permissions' => ['some.other.permission']]);

    $this->actingAs(sidebarNavUserWith(['products.view']));

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-cluster-products"', false);
    $response->assertSee('data-test="sidebar-link-products"', false);
    $response->assertSee('data-test="sidebar-link-product_attribute_types"', false);
    $response->assertDontSee('data-test="sidebar-link-product_categories"', false);
});

test('permissions: [] on a nested cluster child still means always-visible, evaluated by the same explicit branch as a bare item', function () {
    // Same fixture-override technique as the independent-gating test above,
    // proving the "permissions: [] is never handed to Gate::any([])" rule
    // (sidebar-nav.blade.php's own docblock) holds identically for a
    // CLUSTER child, not only for the two bare top-level items that
    // exercise it in production (dashboard). Gate::any([]) returns false
    // for an empty array (nothing to iterate to true), so if the renderer
    // regressed to that shape this item would vanish even for a role
    // holding zero permissions.
    config(['modules.items.sales_regions.permissions' => []]);

    $this->actingAs(User::factory()->create());

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-cluster-store_settings"', false);
    $response->assertSee('data-test="sidebar-link-sales_regions"', false);
});

test('a Super Admin sees both clusters and every child regardless of any permission entry', function () {
    // Complements the whole-page Super Admin test earlier in this file with
    // an explicit per-cluster framing, matching 0080's own "Tests to
    // perform" #3 wording.
    $this->actingAs(sidebarNavSuperAdmin());

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertSee('data-test="sidebar-cluster-products"', false);
    $response->assertSee('data-test="sidebar-link-products"', false);
    $response->assertSee('data-test="sidebar-link-product_categories"', false);
    $response->assertSee('data-test="sidebar-link-product_attribute_types"', false);
    $response->assertSee('data-test="sidebar-cluster-store_settings"', false);
    $response->assertSee('data-test="sidebar-link-sales_regions"', false);
});

// =====================================================================
// 0080 category 5 — route highlighting / auto-expand for nested children.
// =====================================================================

test('visiting product-categories.index expands and highlights the Products cluster', function () {
    $this->actingAs(sidebarNavUserWith(['products.view']));

    $response = $this->get(route('product-categories.index'));
    $response->assertOk();

    $html = $response->getContent();

    sidebarNavAssertClusterExpanded($html, 'products');
    sidebarNavAssertLinkCurrent($html, 'product_categories');
    // Its two siblings inside the same cluster must not also read as
    // current -- only the actually-visited route's own item does.
    sidebarNavAssertLinkNotCurrent($html, 'products');
    sidebarNavAssertLinkNotCurrent($html, 'product_attribute_types');
});

test('visiting sales-regions.index expands and highlights the Store settings cluster', function () {
    $this->actingAs(sidebarNavUserWith(['sales-regions.view']));

    $response = $this->get(route('sales-regions.index'));
    $response->assertOk();

    $html = $response->getContent();

    sidebarNavAssertClusterExpanded($html, 'store_settings');
    sidebarNavAssertLinkCurrent($html, 'sales_regions');
});

test('visiting product-attribute-types.index marks that specific child current, not merely expands the cluster with nothing highlighted', function () {
    $this->actingAs(sidebarNavUserWith(['products.view']));

    $response = $this->get(route('product-attribute-types.index'));
    $response->assertOk();

    $html = $response->getContent();

    sidebarNavAssertClusterExpanded($html, 'products');
    sidebarNavAssertLinkCurrent($html, 'product_attribute_types');
    sidebarNavAssertLinkNotCurrent($html, 'products');
    sidebarNavAssertLinkNotCurrent($html, 'product_categories');
});

test('landing on products.index expands and highlights the Products entry itself, and the cluster heading is never marked current', function () {
    // Q-1, RESOLVED (a): the cluster heading is inert -- Products is just
    // another equal child of the cluster it happens to share a name with,
    // never the cluster's own "home" link. `clusters` entries carry no
    // `route`/`current_when` of their own (D-1), so there is nothing for a
    // cluster's own disclosure element to be ":current" ABOUT in the first
    // place -- this test pins that a `:current` state cannot leak onto it.
    // products.blade.php's own `@can('create', \App\Models\Product::class)`
    // (the "New product" button) resolves through ProductPolicy, and
    // Spatie's hasPermissionTo() throws PermissionDoesNotExist the moment a
    // permission STRING has never been created in the `permissions` table
    // at all -- regardless of whether the acting user holds it -- so this
    // fixture must also create the `products.create` row, unlike every
    // other sidebar-only test in this file that visits a page with no such
    // Blade-level @can check.
    $this->actingAs(sidebarNavUserWith(['products.view', 'products.create']));

    $response = $this->get(route('products.index'));
    $response->assertOk();

    $html = $response->getContent();

    sidebarNavAssertClusterExpanded($html, 'products');
    sidebarNavAssertLinkCurrent($html, 'products');

    $clusterTag = sidebarNavExtractTagContaining($html, 'data-test="sidebar-cluster-products"');
    expect($clusterTag)->not->toContain('data-current');
});

test('navigating away to Dashboard on a fresh request collapses a previously-expanded cluster', function () {
    // D-3: expand state is DERIVED per request from request()->routeIs(...)
    // against the currently-visible children's own current_when values --
    // never client-persisted Alpine state -- so a plain, separate Feature
    // GET to a different route is a valid way to observe the collapse, with
    // no browser/Alpine dependency. (If the shipped implementation instead
    // makes this depend on client-side-only state a Feature test cannot
    // observe, this specific test is the one to skip/adjust -- everything
    // else in this file is unaffected by that risk.)
    $this->actingAs(sidebarNavUserWith(['products.view']));

    $expandedHtml = $this->get(route('product-categories.index'))->assertOk()->getContent();
    sidebarNavAssertClusterExpanded($expandedHtml, 'products');

    $dashboardHtml = $this->get(route('dashboard'))->assertOk()->getContent();
    sidebarNavAssertClusterCollapsed($dashboardHtml, 'products');
});

// =====================================================================
// 0080 category 6 — silent-drop / typo risk.
// =====================================================================

test('an item referencing a non-existent cluster key fails loudly, rather than silently vanishing from the sidebar', function () {
    // The registry-integrity counterpart of the F1/F2 guards above, for the
    // hazard those two cannot see: D-1's `cluster` key is a foreign
    // reference into `config('modules.clusters')` with no database-level
    // constraint behind it, so a typo'd cluster key must be caught by a
    // test, not discovered by a screen quietly missing an entry. Written as
    // a plain assertion over the REAL registry (never an artificially
    // injected bad value) so it fails red today for the honest reason --
    // every item is missing the `cluster` key entirely under the current
    // schema -- and, once the target schema ships, keeps this exact
    // assertion live as the drift guard a future typo would trip.
    foreach (config('modules.items') as $key => $item) {
        expect($item)->toHaveKey('cluster');

        if ($item['cluster'] !== null) {
            // Named `message:` argument, not a positional second argument --
            // Pest's toHaveKey(string|int $key, mixed $value = new Any,
            // string $message = '') treats a positional second argument as
            // an expected VALUE at that key (asserted via assertEquals), not
            // a custom failure message; passing the message positionally
            // made this assertion compare the message string itself against
            // config('modules.clusters')[$item['cluster']] and fail on every
            // run, regardless of whether the referenced cluster existed.
            expect(config('modules.clusters', []))->toHaveKey($item['cluster'], message: "Item \"{$key}\" references cluster \"{$item['cluster']}\", which does not exist in config('modules.clusters').");
        }
    }
});

test('a cluster whose group key matches no real group fails loudly the same way', function () {
    // Same real-registry-only shape as the item/cluster guard above. The
    // first assertion (`clusters` config actually exists) is what makes
    // this fail red today for the honest reason, rather than passing
    // vacuously with zero assertions because config('modules.clusters', [])
    // silently defaults to an empty array today and the foreach below would
    // never run.
    expect(config('modules.clusters'))->not->toBeNull();

    $groupKeys = collect(config('modules.groups'))->keys();

    foreach (config('modules.clusters', []) as $key => $cluster) {
        expect($cluster)->toHaveKey('group');
        // toContain(mixed ...$needles) has no message parameter at all --
        // passing the message string as a second "needle" made this
        // assertion require BOTH the real group key AND the literal message
        // string to be present in $groupKeys, which can never hold. Asserted
        // via toBeTrue(), whose $message parameter is real, instead.
        expect($groupKeys->contains($cluster['group']))->toBeTrue("Cluster \"{$key}\" references group \"{$cluster['group']}\", which does not exist in config('modules.groups').");
    }
});

test('every item declares mutually exclusive, independently-nullable group and cluster keys', function () {
    // D-1's own schema constraint: `group` and `cluster` are never both set
    // on the same item (a bare item has both null; a direct group child has
    // `group` set and `cluster` null; a nested item has `cluster` set and
    // `group` null).
    foreach (config('modules.items') as $key => $item) {
        expect($item)->toHaveKeys(['group', 'cluster']);
        expect($item['group'] !== null && $item['cluster'] !== null)
            ->toBeFalse("Item \"{$key}\" sets both `group` and `cluster` -- these must be mutually exclusive per 0080 D-1.");
    }
});

test('a Super Admin\'s rendered item hooks exactly match every registered item key, catching any dangling or mistyped key at either nesting level', function () {
    // Catch-all per 0080 "Tests to perform" #6: for an actor that bypasses
    // all permission filtering, the SET of rendered `sidebar-link-*` hooks
    // must exactly equal the set of `config('modules.items')` keys.
    //
    // Deliberately NOT a raw substr_count() (0080's own wording literally
    // says "count", but a raw occurrence count is not actually equivalent
    // to it here, and using it would be a false positive/negative trap):
    // Flux's own `flux:sidebar.group` renders an EXPANDABLE group with an
    // ICON twice over -- once inside its `<ui-disclosure>` body, and again
    // inside a `<flux:dropdown>` fallback used when the desktop sidebar is
    // collapsed to icons-only (vendor/livewire/flux/stubs/resources/views/
    // flux/sidebar/group.blade.php, verified live) -- so every item inside
    // such a group (today: `roles` under the expandable+iconed `settings`
    // group; under the target schema: every child of the expandable+iconed
    // `products`/`store_settings` clusters too) renders its `data-test`
    // hook TWICE, while a bare or non-expandable-group item renders it
    // once. A raw substr_count() would therefore need to know the exact
    // expandable/icon shape of every group and cluster to predict the
    // right number -- brittle, and not what this guard is actually for.
    // Comparing the DISTINCT rendered key set against the registry's own
    // key set is immune to that duplication and still catches the real
    // hazard: a config entry that renders zero times (a dangling/mistyped
    // key), or a rendered hook whose key isn't in the registry at all.
    //
    // This test already passes against the CURRENT, unmodified schema (see
    // this story's Phase 3 report) -- like the F1/F2 guards above it, it is
    // a general safety net rather than new-nesting-specific coverage, and
    // is included here because the task file lists it explicitly.
    $this->actingAs(sidebarNavSuperAdmin());

    $response = $this->get(route('dashboard'));
    $response->assertOk();

    $html = $response->getContent();
    preg_match_all('/data-test="sidebar-link-([a-z_]+)"/', $html, $matches);
    $renderedKeys = collect($matches[1])->unique()->sort()->values()->all();
    $expectedKeys = collect(array_keys(config('modules.items')))->sort()->values()->all();

    expect($renderedKeys)->toBe($expectedKeys);
});
