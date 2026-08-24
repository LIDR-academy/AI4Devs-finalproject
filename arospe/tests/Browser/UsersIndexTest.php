<?php

use App\Enums\UserStatus;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/*
 * Hand translation of the "Create / edit modal" and "Delete" scenarios from
 * ai-spec/tasks/in-progress/0006-users-list-editor-ui.md into Pest 4 browser tests, per
 * ../../docs/testing/frontend/gherkin-guidelines.md's Given/When/Then -> it() convention.
 *
 * Grounded in: app/Livewire/Users/Index.php's public interface contract (mount()/openCreateModal()/
 * openEditModal()/save()/confirmDelete()/deleteUser()/closeModal()/closeDeleteModal()), route
 * users.index (GET /users, auth + verified + can:users.view), and the real markup in
 * resources/views/livewire/users.blade.php.
 *
 * SELECTOR STRATEGY: the per-row edit/delete actions are icon-only flux:button elements with no
 * visible text -- each carries an aria-label ("Edit :name" / "Delete :name") and a
 * data-test="edit-user-{id}" / "delete-user-{id}" attribute. Pest's click() resolves an
 * "@"-prefixed selector against [data-testid=...], [data-test=...] (see
 * vendor/pestphp/pest-plugin-browser/src/Support/GuessLocator.php), so row actions below are
 * targeted with click('@edit-user-'.$target->id) / click('@delete-user-'.$target->id), using the
 * real id of the factory-created target rather than button text. The modal's own "Save",
 * "Cancel", and "Delete :name" (confirm) buttons keep real, visible text and no data-test hook,
 * so they are still targeted by text -- the confirm-delete button's text is unambiguous on its
 * own now that the row action beside it is icon-only.
 */

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// Scenario: A user administrator opens the create-user form
test('opening the create-user form via New user produces no javascript errors', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->assertSee('New user')
        ->click('New user')
        ->assertNoJavaScriptErrors()
        // The form must open blank -- a stale prefill leaking from a prior edit into create
        // mode is the story's own flagged highest-risk failure mode for this screen.
        ->assertValue('name', '')
        ->assertValue('email', '')
        // The fields must also be live/writable from that blank starting state, not stuck
        // showing stale data from some other form state.
        ->fill('name', 'Brand New Person')
        ->fill('email', 'brand.new.person@arospe.es')
        ->assertValue('name', 'Brand New Person')
        ->assertNoJavaScriptErrors();
});

// Scenario: A user administrator opens the edit form for an existing user
// This is the story's own highest-risk case: "a wrong/stale prefill is a silent data bug."
// Verified two ways: directly, by asserting the name field is prefilled the moment the modal
// opens (localizes a failure to the view itself); and by re-saving the form completely
// unchanged and asserting the target's real data survives -- if openEditModal() had failed to
// prefill roleId as "selected" (the int/string casting trap the component's own doc comment
// calls out), re-submitting would either fail validation or silently detach the role, and this
// second assertion would catch either outcome.
test('the per-row edit action opens the modal prefilled, so re-saving without changes preserves the users data', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create([
        'name' => 'Diego Ferrer',
        'email' => 'diego.ferrer@arospe.es',
        'status' => UserStatus::Suspended,
    ]);
    $target->assignRole($editorRole);

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->assertSee('Diego Ferrer')
        ->click('@edit-user-'.$target->id)
        ->assertNoJavaScriptErrors()
        ->assertValue('name', 'Diego Ferrer')
        ->click('Save')
        ->assertNoJavaScriptErrors();

    expect($target->fresh()->name)->toBe('Diego Ferrer')
        ->and($target->fresh()->hasRole('Editor'))->toBeTrue()
        ->and($target->fresh()->status)->toBe(UserStatus::Suspended);
});

// Scenario: A user administrator creates a new user by picking a role and a status from
// the dropdowns
//
// This is the one step none of this file's other create-flow tests actually drive: every
// other create/edit test either never reaches save() or reaches it with roleId/status already
// populated server-side (the edit-prefill test below re-saves without touching either select).
// Component-level tests in tests/Feature/Users/IndexTest.php only ever set these two properties
// via Livewire::test()->set(...), which writes the property directly and never proves the
// browser's native <select data-flux-select-native> elements actually deliver their picked
// value back to the component through wire:model.
//
// Picking "Administrator" here is deliberate, not incidental: it is the FIRST (and, with no
// other role seeded, only) real option after the disabled placeholder. That is exactly the
// position a native <select>'s "selectedness reset" silently snaps to if its bound property is
// ever a genuine `null` at render time (Livewire's wire:model sync assigns the dehydrated
// property value straight to the DOM select's `.value`, and assigning the JS value `null`
// desyncs `selectedIndex` from the disabled `selected` placeholder option) -- so picking any
// *other* option would still produce a real value delta and fire `change` even with that bug
// present, silently failing to catch a regression. Picking the first option is the only choice
// that actually exercises the fix (`$roleId` now defaults to `''`, never `null`; see
// app/Livewire/Users/Index.php). The acting user is a Super Admin so the pick doesn't also
// trip the separate `promoteToAdministrator` authorization gate.
test('creating a user by selecting a role and a status from the dropdowns saves it with no validation errors', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    // Story 0015a, Phase 4 finding F1: creating an Administrator-tier user (picked below) now
    // requires a fresh password confirmation too, even for a Super Admin actor.
    $this->actingAs($superAdmin)->withSession([
        'auth.password_confirmed_at' => now()->unix(),
    ]);

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->click('New user')
        ->assertNoJavaScriptErrors()
        ->fill('name', 'Dropdown Picked Person')
        ->fill('email', 'dropdown.picked.person@arospe.es')
        ->select('roleId', 'Administrator')
        ->select('status', 'Active')
        ->click('Save')
        ->assertNoJavaScriptErrors()
        ->assertDontSee('The role id field is required.')
        ->assertDontSee('The status field is required.')
        // A successful save closes the modal and reloads the list -- the new user's name
        // showing up in the table (not stuck inside a still-open modal) is itself proof the
        // save succeeded, on top of the two assertions above.
        ->assertSee('Dropdown Picked Person');

    $created = User::where('email', 'dropdown.picked.person@arospe.es')->first();

    expect($created)->not->toBeNull()
        ->and($created->hasRole('Administrator'))->toBeTrue()
        ->and($created->status)->toBe(UserStatus::Active);
});

// Scenario: A user administrator hovers a disabled row action
test('hovering a disabled row action shows the not-allowed cursor and an explanatory tooltip', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $superAdminTarget = User::factory()->create(['name' => 'Untouchable Person']);
    $superAdminTarget->assignRole('Super Admin');

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->assertSee('Untouchable Person')
        // The row action is icon-only (see docs/api/routes.md), so the tooltip's own text is
        // what proves "why can't I click this" is actually communicated, not just the disabled
        // state itself. Hovering the button itself times out: it renders `disabled` with
        // `pointer-events: none` (Flux's own default class), so Playwright's actionability
        // check refuses to target it directly. flux:button's `tooltip` prop wraps the button in
        // a `<ui-tooltip>` element instead (see resources/views/livewire/users.blade.php), which
        // is what actually listens for the hover -- CSS pointer-events on the disabled child
        // doesn't stop the ancestor from receiving it.
        ->hover('ui-tooltip:has(button[data-test="edit-user-'.$superAdminTarget->id.'"])')
        ->assertSee(__('users.index.action_not_allowed'))
        ->assertNoJavaScriptErrors();
});

// Scenario: A user administrator cancels the create-user form without saving
test('cancelling the create-user form closes it and adds no new user', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $countBefore = User::count();

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->click('New user')
        ->assertNoJavaScriptErrors()
        ->fill('name', 'Should Not Persist')
        ->fill('email', 'should.not.persist@arospe.es')
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->assertDontSee('Should Not Persist');

    expect(User::where('email', 'should.not.persist@arospe.es')->exists())->toBeFalse()
        ->and(User::count())->toBe($countBefore);
});

// Scenario: Deleting a user asks for confirmation first / A user administrator confirms the deletion
test('confirming the delete action removes the user from the list', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    // Story 0015a: deletion now requires a fresh password confirmation.
    $this->actingAs($administrator)->withSession([
        'auth.password_confirmed_at' => now()->unix(),
    ]);

    $target = User::factory()->create(['name' => 'Diego Ferrer']);

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->assertSee('Diego Ferrer')
        ->click('@delete-user-'.$target->id)
        ->assertNoJavaScriptErrors()
        // Asserts the confirmation sentence itself, not just the target's name -- the name
        // alone is already visible in the row behind the modal, so that alone would never
        // fail even if the modal hadn't opened.
        ->assertSee('Are you sure you want to delete')
        ->click('Delete Diego Ferrer')
        ->assertNoJavaScriptErrors()
        ->assertDontSee('Diego Ferrer');

    expect(User::find($target->id))->toBeNull();
});

// Scenario: A user administrator dismisses the delete confirmation
test('dismissing the delete confirmation keeps the user listed', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $target = User::factory()->create(['name' => 'Diego Ferrer']);

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->click('@delete-user-'.$target->id)
        ->assertNoJavaScriptErrors()
        ->assertSee('Diego Ferrer')
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->assertSee('Diego Ferrer');

    expect(User::find($target->id))->not->toBeNull();
});

// Mandatory per test-quality-checklist.md: assertNoJavaScriptErrors() on list load and on every
// modal open/close, exercised here as one continuous smoke pass distinct from the behavior-specific
// tests above.
test('the users screen produces no javascript errors on load and on every modal open and close', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['name' => 'Diego Ferrer']);
    $target->assignRole($editorRole);

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->click('New user')
        ->assertNoJavaScriptErrors()
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->click('@edit-user-'.$target->id)
        ->assertNoJavaScriptErrors()
        ->click('Cancel')
        ->assertNoJavaScriptErrors()
        ->click('@delete-user-'.$target->id)
        ->assertNoJavaScriptErrors()
        ->click('Cancel')
        ->assertNoJavaScriptErrors();
});

/*
 * ============================================================================
 * Story 0015a — Step-up authentication for privileged Users actions
 * ============================================================================
 *
 * Hand translation of the "redirect round-trip" and "affordance renders, and only when
 * it should" bullets from
 * ai-spec/tasks/in-progress/0015a-step-up-auth-privileged-user-actions.md's "Tests to
 * perform" section. Phase 3, step 1 (red): none of this story's application code exists
 * yet -- App\Actions\Auth\EnsureRecentPasswordConfirmation, the
 * PasswordConfirmationRequiredException catch/redirect in App\Livewire\Users\Index, and
 * the two notices in resources/views/livewire/users.blade.php are all still to be
 * written by frontend-expert/backend-expert. These tests are expected to fail now.
 *
 * THE MECHANISM (verified vendor behaviour, quoted from the task file's own "The
 * mechanism" section rather than re-derived here): RequirePassword::
 * shouldConfirmPassword() reads session('auth.password_confirmed_at', 0) against
 * config('auth.password_timeout') with a strict `>` comparison; the ONLY writer of
 * that session key is Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::
 * store(), reached by POSTing route('password.confirm.store') from the real
 * livewire.auth.confirm-password view (resources/views/livewire/auth/confirm-password.
 * blade.php), which carries data-test="confirm-password-button" and a `password` field
 * -- both driven directly below rather than re-derived. "Stale" below always means an
 * explicit timestamp older than config('auth.password_timeout'), matching that `>`
 * comparison exactly (never merely absent), so these tests remain correct however that
 * config value changes.
 *
 * SELECTOR CONTRACT for the not-yet-built affordance (task file, "Files to
 * create/modify" > resources/views/livewire/users.blade.php): a data-test hook is
 * required because the notice's copy is translated (lang/en/users.php and
 * lang/es/users.php) and must not be selected by text. This file fixes the two exact
 * hook names frontend-expert must use -- data-test="edit-modal-reconfirm-notice" on the
 * create/edit modal's notice, data-test="delete-modal-reconfirm-notice" on the delete
 * modal's -- so implementation and test cannot silently drift on naming.
 */

// Scenario: A stale password confirmation blocks a role change / re-confirming restores
// the ability to act (the round-trip). Covers the `url.intended` hazard the task file's
// Files-to-modify section names explicitly: the redirect originates from a POST to
// /livewire/update, not the GET RequirePassword::redirectGuest() normally handles, so
// nothing sets the intended URL for us unless the component does so itself -- this can
// only be proven end to end in a real browser, never at Livewire::test() level.
test('a stale password confirmation on a role change redirects to reconfirm the password and returns to /users', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');

    // Both roles here are deliberately ordinary (non-Administrator, non-Super-Admin), so
    // neither promoteToAdministrator() nor downgrade() ever fires -- the seeded
    // Administrator role itself lacks roles.manage-administrators, so a change touching
    // either of those abilities would confound this test with an unrelated permission
    // refusal. This is also the task file's own flagged edge case: "the step-up guard
    // must still fire" even on the branch where neither Gate::authorize() call precedes
    // it, because the role genuinely changed.
    $viewerRole = Role::create(['name' => 'Viewer', 'guard_name' => 'web']);
    Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['name' => 'Diego Ferrer']);
    $target->assignRole($viewerRole);

    $this->actingAs($administrator)->withSession([
        'auth.password_confirmed_at' => now()->subSeconds(config('auth.password_timeout') + 1)->unix(),
    ]);

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->click('@edit-user-'.$target->id)
        ->assertNoJavaScriptErrors()
        ->select('roleId', 'Editor')
        ->click('Save')
        // The refusal must route the administrator to Fortify's own re-confirmation
        // screen -- never silently apply the role change, and never a bare 403.
        ->assertPathIs('/user/confirm-password')
        ->assertSee('Confirm password')
        ->assertNoJavaScriptErrors()
        ->fill('password', 'password')
        ->click('Confirm')
        // Fortify's own post-confirmation response must return the actor to /users
        // specifically, not whatever page it lands on by default.
        ->assertPathIs('/users')
        ->assertNoJavaScriptErrors();

    // D4 (task file, Human decisions): the redirect leaves the modal, so the original
    // in-flight role change is NOT retried automatically -- the administrator must
    // resubmit. The round-trip above must therefore leave the target's role exactly as
    // it was before the refused save, not silently apply it once confirmed.
    expect($target->fresh()->hasRole('Viewer'))->toBeTrue()
        ->and($target->fresh()->hasRole('Editor'))->toBeFalse();
});

// Scenario: The edit form warns before the administrator fills it in
test('the edit form shows a re-confirmation notice when the password confirmation is stale', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');

    $target = User::factory()->create(['name' => 'Diego Ferrer']);

    $this->actingAs($administrator)->withSession([
        'auth.password_confirmed_at' => now()->subSeconds(config('auth.password_timeout') + 1)->unix(),
    ]);

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->click('@edit-user-'.$target->id)
        ->assertNoJavaScriptErrors()
        ->assertVisible('@edit-modal-reconfirm-notice')
        ->assertNoJavaScriptErrors();
});

// Scenario: A fresh confirmation shows no warning
test('the edit form shows no re-confirmation notice when the password confirmation is fresh', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');

    $target = User::factory()->create(['name' => 'Diego Ferrer']);

    $this->actingAs($administrator)->withSession([
        'auth.password_confirmed_at' => now()->unix(),
    ]);

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->click('@edit-user-'.$target->id)
        ->assertNoJavaScriptErrors()
        ->assertMissing('@edit-modal-reconfirm-notice')
        ->assertNoJavaScriptErrors();
});

// Scenario: The delete confirmation warns before the administrator commits
test('the delete confirmation shows a re-confirmation notice when the password confirmation is stale', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');

    $target = User::factory()->create(['name' => 'Diego Ferrer']);

    $this->actingAs($administrator)->withSession([
        'auth.password_confirmed_at' => now()->subSeconds(config('auth.password_timeout') + 1)->unix(),
    ]);

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->click('@delete-user-'.$target->id)
        ->assertNoJavaScriptErrors()
        ->assertVisible('@delete-modal-reconfirm-notice')
        ->assertNoJavaScriptErrors();
});

// Scenario: A fresh confirmation shows no warning (delete confirmation)
test('the delete confirmation shows no re-confirmation notice when the password confirmation is fresh', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');

    $target = User::factory()->create(['name' => 'Diego Ferrer']);

    $this->actingAs($administrator)->withSession([
        'auth.password_confirmed_at' => now()->unix(),
    ]);

    visit('/users')
        ->assertNoJavaScriptErrors()
        ->click('@delete-user-'.$target->id)
        ->assertNoJavaScriptErrors()
        ->assertMissing('@delete-modal-reconfirm-notice')
        ->assertNoJavaScriptErrors();
});
