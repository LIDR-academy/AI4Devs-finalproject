<?php

// Hand translation of the "Creating and editing", "Deleting", and "Administrator-level grant
// visibility" scenarios from ai-spec/tasks/in-progress/0011-role-permission-management-ui.md
// into Pest 4 browser tests, per ../../docs/testing/frontend/gherkin-guidelines.md's
// Given/When/Then -> it() convention. A small ceiling of real user journeys per
// docs/testing/frontend/coverage-policy.md -- cheaper structural cases (empty state, live
// count, module grouping, validation, the three-tier Administrator row) are pushed down to
// tests/Feature/Roles/IndexUiTest.php instead of padding this suite.
//
// Grounded in: app/Livewire/Roles/Index.php's public interface (openCreateModal()/
// openEditModal()/saveRole()/confirmDeleteRole()/deleteRole()), route roles.index (GET
// /roles, auth + verified + can:roles.manage), and the task file's markup contract for
// resources/views/livewire/roles.blade.php, which does not exist yet.
//
// SELECTOR STRATEGY: the per-row edit/delete actions follow the Users screen's established
// convention -- icon-only flux:button elements carrying data-test="edit-role-{id}" /
// "delete-role-{id}", targeted here via click('@edit-role-'.$id) / click('@delete-role-'.$id).
// The permission checkboxes are Flux's <ui-checkbox> custom element (Blaze-compiled, no plain
// native <input> in the Blade stub), so they are targeted by their accessible ROLE + NAME
// (Playwright's getByRole('checkbox', {name: ...})) via roleCheckboxSelector() below, built
// from Pest\Browser\Support\Selector::getByRoleSelector() and passed straight into check()/
// uncheck()/assertChecked()/assertNotChecked() -- Selector::isExplicit() recognises the
// resulting "internal:role=..." string and hands it to Playwright's locator engine untouched,
// bypassing GuessLocator's id/name/text heuristics entirely. This is the standard
// robust way to target a custom-element form control and does not depend on the exact
// DOM/shadow structure Flux compiles down to.
//
// The accessible name assumed for each checkbox is the composition the task file's own
// resolved decision 3 gives as the example: __("roles.modules.$module") . ' — ' .
// __("roles.actions.$action") (an em dash, exactly as written in the task file) -- flagged as
// an assumption because the task file explicitly leaves the exact composition mechanism ("or
// equivalent") open to Phase 3. If the real view composes the label differently, these
// selectors are the first thing to adjust, not the underlying journeys they exercise.
//
// The "New role" create-trigger button and the "Delete :name" confirm button follow the
// Users screen's "New user" / "Delete :name" precedent by direct analogy (task decision 5
// pins the list/empty-state copy as unpinned but says nothing narrower about button copy);
// same caveat as above if the real button text differs.

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Pest\Browser\Support\Selector;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    // Isolate every test in this file from whatever SUPER_ADMIN_EMAIL happens to be set to
    // locally -- see docs/errors-log.md ("A test asserted against a fixture address that the
    // local .env also pointed SUPER_ADMIN_EMAIL at") and tests/Feature/Users/
    // IndexRenderingTest.php's identical guard. Must run before the seed() call below.
    config(['auth.super_admin.email' => null]);

    $this->seed(RolePermissionSeeder::class);
});

/**
 * Build a Playwright internal role-selector string for the permission checkbox labelled
 * "<module> — <action>" (see the SELECTOR STRATEGY note above), suitable for check()/
 * uncheck()/assertChecked()/assertNotChecked().
 */
function roleCheckboxSelector(string $module, string $action): string
{
    $name = __("roles.modules.{$module}").' — '.__("roles.actions.{$action}");

    return Selector::getByRoleSelector('checkbox', ['name' => $name, 'exact' => true]);
}

// Scenario: Create a custom role with scoped permissions
test('creating a role with only Blog module permissions toggled lists it afterwards', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    visit('/roles')
        ->assertNoJavaScriptErrors()
        ->click('New role')
        ->assertNoJavaScriptErrors()
        ->fill('name', 'Blog Editor')
        ->check(roleCheckboxSelector('blog', 'view'))
        ->check(roleCheckboxSelector('blog', 'edit'))
        ->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertSee('Blog Editor');

    $role = Role::where('name', 'Blog Editor')->where('guard_name', 'web')->first();

    expect($role)->not->toBeNull()
        ->and($role->permissions->pluck('name')->sort()->values()->all())->toBe(['blog.edit', 'blog.view']);
});

// Scenario: A newly created role reopens with exactly the permissions it was given
test('reopening a created role for editing shows exactly the permissions it was given', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $role->syncPermissions(['blog.view', 'blog.edit']);

    visit('/roles')
        ->assertNoJavaScriptErrors()
        ->click('@edit-role-'.$role->id)
        ->assertNoJavaScriptErrors()
        ->assertChecked(roleCheckboxSelector('blog', 'view'))
        ->assertChecked(roleCheckboxSelector('blog', 'edit'))
        ->assertNotChecked(roleCheckboxSelector('blog', 'delete'))
        ->assertNotChecked(roleCheckboxSelector('products', 'view'));
});

// Scenario: Editing a role's permissions persists the change
test('editing a role and clearing a permission persists, verified by reopening the editor', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $role->syncPermissions(['blog.view', 'blog.delete']);

    visit('/roles')
        ->assertNoJavaScriptErrors()
        ->click('@edit-role-'.$role->id)
        ->assertNoJavaScriptErrors()
        ->assertChecked(roleCheckboxSelector('blog', 'delete'))
        ->uncheck(roleCheckboxSelector('blog', 'delete'))
        ->click('Save')
        ->assertNoJavaScriptErrors()
        ->click('@edit-role-'.$role->id)
        ->assertNoJavaScriptErrors()
        ->assertNotChecked(roleCheckboxSelector('blog', 'delete'))
        ->assertChecked(roleCheckboxSelector('blog', 'view'));

    expect($role->fresh()->permissions->pluck('name')->all())->toBe(['blog.view']);
});

// Scenario: Deleting a role still assigned to users is hard-blocked with a count
test('deleting a role assigned to 3 users is blocked with the count and offers no confirm-and-proceed control', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $holders = User::factory()->count(3)->create();
    foreach ($holders as $holder) {
        $holder->assignRole($role);
    }

    visit('/roles')
        ->assertNoJavaScriptErrors()
        ->click('@delete-role-'.$role->id)
        ->assertNoJavaScriptErrors()
        ->assertSee(trans_choice('roles.index.delete_blocked', 3, ['count' => 3]))
        // The PRD's "no confirm-and-proceed path" expressed in markup: the destructive
        // button is not rendered at all, rather than rendered-and-disabled.
        ->assertDontSee('Delete Blog Editor');

    expect(Role::find($role->id))->not->toBeNull();

    foreach ($holders as $holder) {
        expect($holder->fresh()->hasRole('Blog Editor'))->toBeTrue();
    }
});

// Scenario: Only the Super Admin sees the administrator-management grant option
test('a signed-in Super Admin sees the administrator-management grant toggle', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    visit('/roles')
        ->assertNoJavaScriptErrors()
        ->click('@edit-role-'.$role->id)
        ->assertNoJavaScriptErrors()
        ->assertSee(__('roles.modules.roles').' — '.__('roles.actions.manage_administrators'));
});

// Scenario: A broad administrator never sees the administrator-management grant option
test('a broad administrator holding roles.manage does not have the administrator-management grant toggle in the DOM', function () {
    // The seeded Administrator role holds roles.manage but deliberately not
    // roles.manage-administrators (RolePermissionSeeder) -- exactly the "not the Super
    // Admin" actor the Gherkin scenario names.
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    visit('/roles')
        ->assertNoJavaScriptErrors()
        ->click('@edit-role-'.$role->id)
        ->assertNoJavaScriptErrors()
        // Absence, not invisibility: the toggle's composed label must not appear as text
        // anywhere on the page, matching the "absent from the DOM, not merely hidden or
        // disabled" acceptance criterion.
        ->assertDontSee(__('roles.modules.roles').' — '.__('roles.actions.manage_administrators'));
});
