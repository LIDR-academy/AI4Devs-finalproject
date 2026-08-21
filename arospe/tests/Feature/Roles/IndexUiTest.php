<?php

// Story 0011 — App\Livewire\Roles\Index's real view
// (resources/views/livewire/roles.blade.php), which does not exist yet. Rendering-only
// tests mirroring tests/Feature/Users/IndexRenderingTest.php's split from story 0010's own
// tests/Feature/Roles/IndexTest.php: component logic, persistence, and authorization are
// already covered there (39 tests) -- nothing here duplicates it. Every test below asserts
// against rendered HTML (assertSee/assertDontSee/->html()) or a rendering-adjacent outcome
// (a Livewire round trip through the real view), which IndexTest.php never does.
//
// Deliberately does NOT invoke the full RolePermissionSeeder for most tests, matching
// IndexTest.php's own stated reasoning: fixture permission/role rows are created directly so
// the suite stays decoupled from the catalog's exact contents. Two exceptions create the real
// Administrator/Super Admin rows directly via Role::firstOrCreate*Role() (not the seeder),
// which is safe -- those methods bypass model events and touch no ambient SUPER_ADMIN_EMAIL
// config, unlike RolePermissionSeeder::bootstrapSuperAdmin().
//
// Helper functions below are named roleUi*() rather than roles*() specifically to avoid a
// PHP "cannot redeclare function" fatal against IndexTest.php's rolesTestPermission()/
// rolesTestActor() when the full suite loads both files in one process.

use App\Livewire\Roles\Index;
use App\Models\Role;
use App\Models\User;
use App\Policies\RolePolicy;
use Livewire\Livewire;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

/**
 * Get-or-create a `web`-guard permission fixture row.
 */
function roleUiPermission(string $name): Permission
{
    return Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
}

/**
 * A user holding `roles.manage` plus any given extra permissions, matching
 * IndexTest.php's rolesTestActor() shape under a non-colliding name.
 *
 * @param  array<int, string>  $extraPermissions
 */
function roleUiActor(array $extraPermissions = []): User
{
    roleUiPermission(RolePolicy::ROLE_MANAGEMENT_PERMISSION);

    $actor = User::factory()->create();
    $actor->givePermissionTo(RolePolicy::ROLE_MANAGEMENT_PERMISSION);

    foreach ($extraPermissions as $permission) {
        roleUiPermission($permission);
        $actor->givePermissionTo($permission);
    }

    return $actor;
}

// =====================================================================
// Listing — empty state, live count, Super Admin exclusion from the
// rendered view (not just the `roles` computed property, which
// IndexTest.php's "the roles list excludes the Super Admin role" test
// already covers at the collection level).
// =====================================================================

test('the empty state replaces the roles list when there are no custom roles', function () {
    // Exact empty-state copy is deliberately unpinned (task decision 5), so this asserts
    // structurally: with zero custom roles, no row-action data-test hook is rendered at all
    // -- there is nothing to iterate over -- while the component still renders successfully
    // (Livewire::test() itself throws on any render-time error).
    $this->actingAs(roleUiActor());

    $html = Livewire::test(Index::class)->html();

    expect($html)->not->toContain('data-test="edit-role-')
        ->and($html)->not->toContain('data-test="delete-role-');
});

test('the live count matches the number of roles actually rendered', function () {
    $this->actingAs(roleUiActor());

    Role::create(['name' => 'Role One', 'guard_name' => 'web']);
    Role::create(['name' => 'Role Two', 'guard_name' => 'web']);
    Role::create(['name' => 'Role Three', 'guard_name' => 'web']);

    // Copy-agnostic per task decision 5: assertCount proves the live count the header must
    // read off matches reality, and assertSee proves each of the three roles is actually
    // rendered -- real content, not a guessed translation key.
    Livewire::test(Index::class)
        ->assertCount('roles', 3)
        ->assertSee('Role One')
        ->assertSee('Role Two')
        ->assertSee('Role Three');
});

test('the Super Admin role is not among the rendered roles list even though it exists in the system', function () {
    $superAdmin = Role::firstOrCreateSuperAdminRole();
    Role::create(['name' => 'Regular Role', 'guard_name' => 'web']);

    $this->actingAs(roleUiActor());

    Livewire::test(Index::class)
        ->assertSee('Regular Role')
        ->assertDontSee($superAdmin->name);
});

// =====================================================================
// Deletion and zero-permission creation — rendered outcomes.
// =====================================================================

test('deleting an unassigned role removes it from the rendered list', function () {
    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $this->actingAs(roleUiActor());

    Livewire::test(Index::class)
        ->assertSee('Blog Editor')
        ->call('confirmDeleteRole', $role->id)
        ->call('deleteRole')
        ->assertHasNoErrors()
        ->assertDontSee('Blog Editor');
});

test('the delete-blocked role remains visible in the rendered list afterwards', function () {
    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $holder = User::factory()->create();
    $holder->assignRole($role);

    $this->actingAs(roleUiActor());

    Livewire::test(Index::class)
        ->call('confirmDeleteRole', $role->id)
        ->call('deleteRole')
        ->assertHasErrors(['deletingRoleId'])
        ->assertSee('Blog Editor');
});

test('a role saved with zero permissions is accepted and appears in the rendered list', function () {
    $this->actingAs(roleUiActor());

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Placeholder')
        ->call('saveRole')
        ->assertHasNoErrors()
        ->assertSee('Placeholder');
});

// =====================================================================
// Server-side refusals rendering inline, not just as pre-emptive
// branches — the two channels the Phase 2 review flagged as needing an
// inline outlet in the markup.
// =====================================================================

test('the self-lockout refusal renders inline when an actor clears roles.manage from a role they hold', function () {
    $roleManage = roleUiPermission(RolePolicy::ROLE_MANAGEMENT_PERMISSION);
    $blogView = roleUiPermission('blog.view');

    $actor = roleUiActor(['blog.view']);
    $ownRole = Role::create(['name' => 'Custom Manager', 'guard_name' => 'web']);
    $ownRole->syncPermissions([$roleManage->name, $blogView->name]);
    $actor->assignRole($ownRole);

    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $ownRole->id)
        ->set('selectedPermissionIds', [$blogView->id])
        ->call('saveRole')
        ->assertHasErrors(['selectedPermissionIds'])
        ->assertSee(__('roles.index.self_lockout_blocked'));
});

test('the holder-count refusal renders inside the delete modal after deleteRole() refuses it, not only as a pre-emptive branch', function () {
    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $holders = User::factory()->count(3)->create();
    foreach ($holders as $holder) {
        $holder->assignRole($role);
    }

    $this->actingAs(roleUiActor());

    Livewire::test(Index::class)
        ->call('confirmDeleteRole', $role->id)
        ->call('deleteRole')
        ->assertHasErrors(['deletingRoleId'])
        ->assertSee(trans_choice('roles.index.delete_blocked', 3, ['count' => 3]));
});

// =====================================================================
// Permission-toggle grouping — derived from the flat, unfiltered
// permissionOptions() catalog, never a hardcoded module list.
// =====================================================================

test('permission toggles are grouped under one heading per module present in the catalog', function () {
    roleUiPermission('blog.view');
    roleUiPermission('products.view');
    roleUiPermission(RolePolicy::ROLE_MANAGEMENT_PERMISSION);

    $this->actingAs(roleUiActor());

    // 'roles' is the derived pseudo-module the two non-CRUD permissions (roles.manage,
    // roles.manage-administrators) group under -- not one of RolePermissionSeeder::MODULES,
    // so this also proves the grouping isn't limited to the 9-module grid.
    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->assertSee(__('roles.modules.blog'))
        ->assertSee(__('roles.modules.products'))
        ->assertSee(__('roles.modules.roles'));
});

test('a sparse permission catalog with only one module renders its heading without crashing', function () {
    roleUiPermission('blog.view');

    $this->actingAs(roleUiActor());

    // Livewire::test() itself throws on a render-time error, so successfully opening the
    // modal with a single module's worth of permissions -- rather than the full nine-module
    // grid -- is exactly what proves the module-grouping transform doesn't assume every
    // module is present, or crash iterating an otherwise-empty group.
    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->assertSee(__('roles.modules.blog'));
});

// =====================================================================
// The unfiltered-catalog rule — "the single highest-value test in this
// story" per the task file: the permission catalog must render in full
// regardless of what the acting user may themselves grant.
// =====================================================================

test('a permission the acting user does not hold is still rendered as an available checkbox and survives an unrelated save', function () {
    $productsDelete = roleUiPermission('products.delete');
    $blogView = roleUiPermission('blog.view');

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $role->syncPermissions([$blogView->name, $productsDelete->name]);

    $this->actingAs(roleUiActor(['blog.view']));

    $component = Livewire::test(Index::class)->call('openEditModal', $role->id);

    // This is the regression test for the "never filter the catalog to what the actor may
    // grant" presentational rule: hiding this checkbox would be the "helpfully filter to
    // what I can grant" anti-pattern the spec explicitly forbids, and it would turn
    // EnforceAdministratorPermissionGrant's documented "omission = preserve" behaviour into
    // a silent revoke the moment a narrow roles.manage holder saves an unrelated change to a
    // role that legitimately holds a permission outside their own grant. Asserted by raw
    // presence of the permission id as a value attribute -- proving the box exists in markup
    // at all -- rather than by exact "checked" attribute syntax, which is an implementation
    // detail this story hasn't built yet.
    expect($component->html())->toContain('value="'.$productsDelete->id.'"');

    $component->set('name', 'Content Editor')
        ->call('saveRole')
        ->assertHasNoErrors();

    expect(Role::where('name', 'Content Editor')->firstOrFail()->permissions->pluck('name')->all())
        ->toContain('products.delete');
});

// =====================================================================
// Negative / edge — invalid role names, one dataset-driven test per
// gherkin-guidelines.md rule 4 (Scenario Outline -> one it() per
// Examples table, driven by ->with()).
// =====================================================================

test('saving a role with an invalid name is refused with inline feedback and adds no role', function (string $invalidName) {
    Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $countBefore = Role::query()->count();

    $this->actingAs(roleUiActor());

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', $invalidName)
        ->call('saveRole')
        ->assertHasErrors(['name']);

    expect(Role::query()->count())->toBe($countBefore);
})->with([
    'a blank name' => [''],
    'a name consisting only of whitespace' => ['   '],
    'the already-taken name "Blog Editor"' => ['Blog Editor'],
]);

// =====================================================================
// The seeded Administrator role's row — three actor tiers, per Phase 2
// review resolution 1. RolePolicy::delete() refuses the Administrator
// role categorically except for the Gate::before bypass, so the middle
// tier's two abilities deliberately disagree (edit enabled, delete
// disabled) -- do not "fix" this dataset to make them agree.
// =====================================================================

test(
    "the Administrator role's row renders edit/delete according to the acting user's authorization tier",
    function (bool $grantAdminLevelPermission, bool $actAsSuperAdmin, bool $expectedCanEdit, bool $expectedCanDelete) {
        $administratorRole = Role::firstOrCreateAdministratorRole();
        roleUiPermission(RolePolicy::ROLE_MANAGEMENT_PERMISSION);
        roleUiPermission(RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION);

        $actor = User::factory()->create();
        $actor->givePermissionTo(RolePolicy::ROLE_MANAGEMENT_PERMISSION);

        if ($grantAdminLevelPermission) {
            $actor->givePermissionTo(RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION);
        }

        if ($actAsSuperAdmin) {
            $actor->assignRole(Role::firstOrCreateSuperAdminRole());
        }

        $this->actingAs($actor);

        $html = Livewire::test(Index::class)->html();

        // Same assertion shape as tests/Feature/Users/IndexRenderingTest.php's
        // $isRowActionDisabled closure -- the row actions are icon-only, so this is the
        // established way to read whether Blade rendered the `disabled` attribute.
        $isRowActionDisabled = fn (string $dataTest): bool => (bool) preg_match(
            '/data-test="'.preg_quote($dataTest, '/').'"[^>]*\sdisabled="disabled"/',
            $html
        );

        expect($isRowActionDisabled('edit-role-'.$administratorRole->id))->toBe(! $expectedCanEdit)
            ->and($isRowActionDisabled('delete-role-'.$administratorRole->id))->toBe(! $expectedCanDelete);
    }
)->with([
    'a plain roles.manage holder sees both disabled' => [false, false, false, false],
    'a roles.manage-administrators holder sees edit enabled but delete disabled' => [true, false, true, false],
    'the Super Admin sees both enabled (accepted drift -- delete still 403s on click at the model layer)' => [false, true, true, true],
]);
