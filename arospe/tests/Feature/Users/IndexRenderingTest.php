<?php

use App\Enums\UserStatus;
use App\Livewire\Users\Index;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/*
 * Rendering-only tests for App\Livewire\Users\Index's real view
 * (resources/views/livewire/users.blade.php), per story
 * ai-spec/tasks/in-progress/0006-users-list-editor-ui.md's "Component test:" bullets.
 *
 * Component logic, persistence and authorization are already covered by
 * tests/Feature/Users/IndexTest.php (story 0004) -- nothing here duplicates that file; every
 * test below asserts against the rendered HTML (assertSee/assertDontSee/assertSet), which
 * IndexTest.php never does.
 */

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    // Isolate every test in this file from whatever SUPER_ADMIN_EMAIL happens to be set to
    // locally: with it ambiently set, RolePermissionSeeder::bootstrapSuperAdmin() provisions a
    // real user holding the Super Admin role on every seed below, which the "omits Super Admin"
    // test then legitimately sees rendered in the users list -- the same class of bug already
    // documented in docs/errors-log.md ("A test asserted against a fixture address that the
    // local .env also pointed SUPER_ADMIN_EMAIL at") and fixed the same way in
    // tests/Feature/Seeders/DatabaseSeederTest.php. This must run before the seed() call below,
    // and applies file-wide because it is harmless to every other test here (e.g. "the header
    // renders the live user count" already computes its expected totals from a dynamically
    // read baseline rather than a hardcoded count).
    config(['auth.super_admin.email' => null]);

    $this->seed(RolePermissionSeeder::class);
});

test('the list renders each users name, email, role, and status', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create([
        'name' => 'Diego Ferrer',
        'email' => 'diego.ferrer@arospe.es',
        'status' => UserStatus::Active,
    ]);
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->assertSee('Diego Ferrer')
        ->assertSee('diego.ferrer@arospe.es')
        ->assertSee('Editor')
        ->assertSee(UserStatus::Active->label());
});

test('the header renders the live user count', function () {
    // Baseline-aware, matching IndexTest.php's own usersSummary tests: RolePermissionSeeder's
    // bootstrap can add an extra Super Admin user when the ambient SUPER_ADMIN_EMAIL config is
    // set (see docs/errors-log.md), so a hardcoded expected total would be flaky locally.
    $baselineTotal = User::count();
    $baselineActive = User::where('status', UserStatus::Active)->count();

    $administrator = User::factory()->create(['status' => UserStatus::Active]);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    User::factory()->count(2)->create(['status' => UserStatus::Active]);
    User::factory()->count(3)->create(['status' => UserStatus::Inactive]);

    // added: administrator + 2 active + 3 inactive = 6 total; active: administrator + 2 = 3
    $expectedTotal = $baselineTotal + 6;
    $expectedActive = $baselineActive + 3;

    // Reuses the existing users.index.summary key -- its own lang-file comment says it is
    // "used by both this story's placeholder view and 0006's real one", so the header must
    // keep rendering through it rather than a newly invented key.
    Livewire::test(Index::class)
        ->assertSee(__('users.index.summary', ['total' => $expectedTotal, 'active' => $expectedActive]));
});

test('the status badge shows the correct label for each status', function (UserStatus $status) {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    User::factory()->create(['name' => 'Status Sample User', 'status' => $status]);

    // $user['status'] is a UserStatus enum instance in the $users array, not a string -- the
    // badge markup must call ->label() / match on the enum cases rather than compare strings.
    Livewire::test(Index::class)->assertSee($status->label());
})->with([
    'Active' => [UserStatus::Active],
    'Inactive' => [UserStatus::Inactive],
    'Suspended' => [UserStatus::Suspended],
]);

test('the empty state renders when there are no users to display', function () {
    // Per the story's "Resolved questions": the users list always includes at least the acting
    // administrator's own row in real use (mount() -> loadUsers() always finds >= 1 row for a
    // signed-in caller), so this branch has no reachable sign-in journey to exercise it through
    // and must be forced.
    //
    // Story 0015 finding F4: $users is now #[Locked], so it can no longer be forced empty via
    // set('users', []) -- that write is exactly what this test's own mechanism needs to avoid.
    // The SoftDeletingScope installed on App\Models\User (story 0005) is the mechanism chosen
    // instead: soft-deleting the acting administrator's own row removes it from every
    // User::query() result, including loadUsers()'s bare query, while leaving the already-
    // resolved Auth::user() instance untouched -- actingAs() sets it directly on the guard
    // in-memory, it is never re-queried from the database, so mount()'s own
    // Gate::authorize('viewAny', ...) still passes for the now-trashed row. This still fails if
    // the empty-state branch is removed from the view, exactly as set('users', []) did.
    //
    // Exact copy is explicitly unpinned by the story (decision 1 only fixes "New user"'s
    // wording, not the empty state's). "No users found." is the real, confirmed copy the view
    // renders today (resources/views/livewire/users.blade.php) -- if that copy ever changes,
    // update this literal string, not the test's intent.
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $administrator->delete();

    Livewire::test(Index::class)
        ->assertSee('No users found.');
});

test('a row for a user with no assigned role renders with no role value and no error', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $roleless = User::factory()->create(['name' => 'Roleless Person', 'email' => 'roleless.person@arospe.es']);

    // Livewire::test() itself throws on a render-time error (e.g. calling ->name on the null
    // $role for this row), so simply rendering successfully and showing this row's own data is
    // exactly what protects against the "blank/broken cell" acceptance criterion.
    Livewire::test(Index::class)
        ->assertSee('Roleless Person')
        ->assertSee('roleless.person@arospe.es');

    expect($roleless->fresh())->not->toBeNull();
});

test('a row with a pending email change shows both the current and pending address', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    User::factory()
        ->pendingEmail('new.address@arospe.es')
        ->create(['name' => 'Diego Ferrer', 'email' => 'diego.ferrer@arospe.es']);

    // Uses users.email_change.pending_notice_admin -- the admin-facing wording, distinct from
    // the self-service users.email_change.pending_notice key used on the profile screen
    // (resources/views/livewire/settings/profile.blade.php), because the account holder (not
    // the administrator) is the one who must use the confirmation link.
    Livewire::test(Index::class)
        ->assertSee('diego.ferrer@arospe.es')
        ->assertSee(__('users.email_change.pending_notice_admin', ['email' => 'new.address@arospe.es']));
});

test('a row without a pending email change shows no pending marker', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    User::factory()->create(['name' => 'Diego Ferrer', 'email' => 'diego.ferrer@arospe.es']);

    // The fixed portion of users.email_change.pending_notice_admin (independent of the :email
    // placeholder) must not appear anywhere on the page for a user with no pending change --
    // a marker rendered unconditionally would still pass the positive-case test above alone.
    Livewire::test(Index::class)
        ->assertSee('diego.ferrer@arospe.es')
        ->assertDontSee('is pending confirmation from the account holder');
});

test('the edit modal for a user with a pending address shows it, with the explanatory line', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()
        ->pendingEmail('new.address@arospe.es')
        ->create(['name' => 'Diego Ferrer', 'email' => 'diego.ferrer@arospe.es']);
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->assertSee(__('users.email_change.pending_notice_admin', ['email' => 'new.address@arospe.es']));
});

test('the role select renders the available roles and omits Super Admin', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->assertSee('Editor')
        ->assertSee('Blog Editor')
        ->assertDontSee('Super Admin');
});

test('the edit and delete row actions are disabled for a target the actor cannot edit or delete', function () {
    // An Administrator holds users.edit/users.delete but not roles.manage-administrators
    // (RolePermissionSeeder). Story 0015 finding F7 narrowed canEdit for an OTHER
    // Administrator-holding target from "needs only users.edit" to the same
    // updateSensitiveAttributes ability canDelete already required (see the identical
    // canEdit->toBeFalse() rewrite at tests/Feature/Users/IndexTest.php:116-118, which pins the
    // same underlying rule this test pins at the rendered-HTML level) -- both actions are now
    // disabled for this target, not just delete.
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $administratorTarget = User::factory()->create();
    $administratorTarget->assignRole('Administrator');

    $superAdminTarget = User::factory()->create();
    $superAdminTarget->assignRole('Super Admin');

    $html = Livewire::test(Index::class)->html();

    // The row actions are icon-only (see docs/api/routes.md), so there is no visible text to
    // assert against instead -- this locates each <button> by its data-test hook and reads
    // whether Blade rendered the `disabled` attribute onto it.
    $isRowActionDisabled = fn (string $dataTest): bool => (bool) preg_match(
        '/data-test="'.preg_quote($dataTest, '/').'"[^>]*\sdisabled="disabled"/',
        $html
    );

    expect($isRowActionDisabled('edit-user-'.$administratorTarget->id))->toBeTrue()
        ->and($isRowActionDisabled('delete-user-'.$administratorTarget->id))->toBeTrue()
        ->and($isRowActionDisabled('edit-user-'.$superAdminTarget->id))->toBeTrue()
        ->and($isRowActionDisabled('delete-user-'.$superAdminTarget->id))->toBeTrue();
});

test('a disabled row action carries the "action not allowed" tooltip and an enabled one carries none', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $allowedTarget = User::factory()->create();
    $allowedTarget->assignRole($editorRole);

    $disallowedTarget = User::factory()->create();
    $disallowedTarget->assignRole('Super Admin');

    $html = Livewire::test(Index::class)->html();

    // The view wraps a disabled row action in <flux:tooltip> only in the disabled branch (see
    // resources/views/livewire/users.blade.php's comment): flux:button's own `tooltip` prop
    // can't be bound conditionally, because Livewire/Blaze's compiled attribute handling
    // treats the prop as present whenever `tooltip=`/`:tooltip=` is written on the tag at all,
    // regardless of the bound value -- that rendered an empty tooltip bubble on every enabled
    // row action, the bug this test guards against. The rendered order is always
    // <ui-tooltip ...><button ... data-test="X" ...>, so requiring no other tag between them
    // is what makes this element-scoped rather than a page-wide text match.
    $isWrappedInTooltip = fn (string $dataTest): bool => (bool) preg_match(
        '/<ui-tooltip[^>]*>\s*<button[^>]*data-test="'.preg_quote($dataTest, '/').'"/',
        $html
    );

    expect($isWrappedInTooltip('edit-user-'.$disallowedTarget->id))->toBeTrue()
        ->and($isWrappedInTooltip('delete-user-'.$disallowedTarget->id))->toBeTrue()
        ->and($isWrappedInTooltip('edit-user-'.$allowedTarget->id))->toBeFalse()
        ->and($isWrappedInTooltip('delete-user-'.$allowedTarget->id))->toBeFalse();
});

test('the edit and delete row actions are enabled for a target the actor is authorized to edit and delete', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $html = Livewire::test(Index::class)->html();

    $isRowActionDisabled = fn (string $dataTest): bool => (bool) preg_match(
        '/data-test="'.preg_quote($dataTest, '/').'"[^>]*\sdisabled="disabled"/',
        $html
    );

    expect($isRowActionDisabled('edit-user-'.$target->id))->toBeFalse()
        ->and($isRowActionDisabled('delete-user-'.$target->id))->toBeFalse();
});

test('submitting an invalid form renders a validation message next to the field and leaves the modal open', function (string $property, mixed $value, string $message) {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    if ($property === 'email') {
        // "an email already in use" needs an existing row to collide with.
        User::factory()->create(['email' => 'taken@arospe.es']);
    }

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Valid Name')
        ->set('email', 'valid.create@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->set($property, $value)
        ->call('save')
        ->assertSee($message)
        ->assertSet('showModal', true);
})->with([
    // Default Laravel validation messages (lang/en (vendor)/validation.php), no custom
    // attribute names or messages are defined anywhere in this app for these fields.
    'a blank name' => ['name', '', 'The name field is required.'],
    'a blank email' => ['email', '', 'The email field is required.'],
    'an email already in use' => ['email', 'taken@arospe.es', 'The email has already been taken.'],
    'no role selected' => ['roleId', null, 'The role id field is required.'],
]);
