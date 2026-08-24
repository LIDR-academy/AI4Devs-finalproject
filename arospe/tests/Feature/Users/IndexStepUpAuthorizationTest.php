<?php

// Story 0015a -- step-up authentication for privileged Users actions, the DASHBOARD-mediated
// path. App\Livewire\Users\Index::deleteUser() calls the step-up guard directly (there is no
// DeleteUser action to hang it on); save() reaches the same guard indirectly through
// App\Actions\Users\UpdateUser's authorizeRoleAndStatusChange(). Both catch
// App\Exceptions\PasswordConfirmationRequiredException and convert it into a Livewire redirect to
// route('password.confirm') -- this file proves that conversion, not the underlying rule (which
// tests/Feature/Users/UpdateUserStepUpAuthorizationTest.php already covers exhaustively against
// the direct, non-dashboard-caller path). The full browser round trip (landing on
// password.confirm, submitting the password, returning to /users) is out of scope here per the
// story -- "it cannot be proven at Livewire::test() level" -- and is frontend-qa's
// tests/Browser/UsersIndexTest.php.
//
// A permission refusal is NOT caught by this component -- only PasswordConfirmationRequiredException
// is -- so an AuthorizationException from Gate::authorize() still propagates uncaught to the
// caller here, exactly as it already does for every other authorization refusal in
// tests/Feature/Users/IndexTest.php.

use App\Enums\UserStatus;
use App\Livewire\Users\Index;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

function markComponentPasswordConfirmationStale(): void
{
    session(['auth.password_confirmed_at' => now()->subSeconds(config('auth.password_timeout') + 60)->unix()]);
}

function markComponentPasswordConfirmationFresh(): void
{
    session(['auth.password_confirmed_at' => now()->unix()]);
}

// =====================================================================
// deleteUser() -- stale/absent confirmation redirects rather than deleting;
// fresh confirmation deletes as before.
// =====================================================================

test('deleting a user with no password confirmation this session redirects to re-confirm, and the user still exists', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    // auth.password_confirmed_at deliberately never written.

    $target = User::factory()->create();

    Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->call('deleteUser')
        ->assertRedirect(route('password.confirm'));

    expect(User::find($target->id))->not->toBeNull();
});

test('deleting a user with a stale password confirmation redirects to re-confirm, and the user still exists', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    markComponentPasswordConfirmationStale();

    $target = User::factory()->create();

    Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->call('deleteUser')
        ->assertRedirect(route('password.confirm'));

    expect(User::find($target->id))->not->toBeNull();
});

test('deleting a user with a fresh password confirmation succeeds', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    markComponentPasswordConfirmationFresh();

    $target = User::factory()->create();

    Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->call('deleteUser');

    expect(User::find($target->id))->toBeNull();
});

test('a stale confirmation does not mask a permission refusal when deleting -- lacking users.delete still throws, and is never converted into a redirect', function () {
    // Matching every other AuthorizationException-throw test in tests/Feature/Users/IndexTest.php:
    // Livewire::test() runs a component call through the real exception handler, which renders an
    // AuthorizationException as a 403 response rather than letting it propagate to the test unless
    // exception handling is disabled first.
    $this->withoutExceptionHandling();

    $actor = User::factory()->create();
    $actor->givePermissionTo('users.view'); // deliberately NOT users.delete
    $this->actingAs($actor);
    markComponentPasswordConfirmationStale();

    $target = User::factory()->create();

    // confirmDelete() itself authorizes with UserPolicy::delete(), so the refusal happens there,
    // before deleteUser() (and its step-up guard) is ever reached.
    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', $target->id))
        ->toThrow(AuthorizationException::class);

    expect(User::find($target->id))->not->toBeNull();
});

test('the step-up guard binds a Super Admin actor deleting an ordinary user too', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);
    markComponentPasswordConfirmationStale();

    $target = User::factory()->create();

    Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->call('deleteUser')
        ->assertRedirect(route('password.confirm'));

    expect(User::find($target->id))->not->toBeNull();
});

// =====================================================================
// save() -- a role or status change through the dashboard is redirected,
// not silently swallowed, when the confirmation is stale.
// =====================================================================

test('saving a role change with a stale password confirmation redirects to re-confirm, and the role is left unchanged', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    markComponentPasswordConfirmationStale();

    $component->set('roleId', (string) $blogEditorRole->id)
        ->call('save')
        ->assertRedirect(route('password.confirm'));

    expect($target->fresh()->hasRole('Editor'))->toBeTrue();
});

test('saving a status change with a stale password confirmation redirects to re-confirm, and the status is left unchanged', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($editorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    markComponentPasswordConfirmationStale();

    $component->set('status', UserStatus::Suspended->value)
        ->call('save')
        ->assertRedirect(route('password.confirm'));

    expect($target->fresh()->status)->toBe(UserStatus::Active);
});

test('saving a role change with a fresh password confirmation succeeds through the dashboard', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    markComponentPasswordConfirmationFresh();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $blogEditorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->hasRole('Blog Editor'))->toBeTrue();
});

test('saving a name-only edit with a stale password confirmation still succeeds through the dashboard', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['name' => 'Original Name']);
    $target->assignRole($editorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    markComponentPasswordConfirmationStale();

    $component->set('name', 'Renamed Through Dashboard')
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->name)->toBe('Renamed Through Dashboard');
});

test('creating a user with an ordinary role and a stale password confirmation still succeeds through the dashboard', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    markComponentPasswordConfirmationStale();

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Through Dashboard')
        ->set('email', 'new-through-dashboard@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    expect(User::where('email', 'new-through-dashboard@arospe.es')->exists())->toBeTrue();
});

// Phase 4 finding F1 (decision D6): creating an ADMINISTRATOR-TIER user through the dashboard is
// now step-up-gated too -- CreateUser's own guard throws, save()'s catch converts it into the
// same redirect deleteUser()/a role-or-status save() already produce.
test('creating an Administrator-tier user with a stale password confirmation redirects to re-confirm, and no user is created', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);
    markComponentPasswordConfirmationStale();

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Administrator Through Dashboard')
        ->set('email', 'new-administrator-through-dashboard@arospe.es')
        ->set('roleId', (string) $administratorRole->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertRedirect(route('password.confirm'));

    expect(User::where('email', 'new-administrator-through-dashboard@arospe.es')->exists())->toBeFalse();
});

// Phase 4 finding F2 (decision D7): a THIRD-PARTY email change through the dashboard is now
// step-up-gated too.
test('editing another users email with a stale password confirmation redirects to re-confirm, and the pending email is left unset', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'dashboard-third-party@arospe.es']);
    $target->assignRole($editorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    markComponentPasswordConfirmationStale();

    $component->set('email', 'dashboard-third-party-new@arospe.es')
        ->call('save')
        ->assertRedirect(route('password.confirm'));

    expect($target->fresh()->pending_email)->toBeNull()
        ->and($target->fresh()->getRawOriginal('email'))->toBe('dashboard-third-party@arospe.es');
});

// =====================================================================
// Phase 4 finding F4: both catch blocks log the refusal, carrying
// actor_id, action and the target's user_id, before redirecting --
// matching story 0015's F5 Log::info shape for this same class's
// successful mutations.
// =====================================================================

test('a step-up refusal on a role change logs a warning with the actor, the action, and the target before redirecting', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    markComponentPasswordConfirmationStale();

    $component->set('roleId', (string) $blogEditorRole->id)
        ->call('save')
        ->assertRedirect(route('password.confirm'));

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Step-up password confirmation required'
            && ($context['actor_id'] ?? null) === $administrator->id
            && ($context['action'] ?? null) === 'users.update'
            && ($context['user_id'] ?? null) === $target->id)
        ->once();
});

test('a step-up refusal on an Administrator-tier creation logs a warning with the actor and the action, and a null user_id', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);
    markComponentPasswordConfirmationStale();

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Logged Administrator Creation')
        ->set('email', 'logged-administrator-creation@arospe.es')
        ->set('roleId', (string) $administratorRole->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertRedirect(route('password.confirm'));

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Step-up password confirmation required'
            && ($context['actor_id'] ?? null) === $administrator->id
            && ($context['action'] ?? null) === 'users.create'
            && ($context['user_id'] ?? null) === null)
        ->once();
});

test('a step-up refusal on a deletion logs a warning with the actor, the action, and the target before redirecting', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    // auth.password_confirmed_at deliberately never written.

    $target = User::factory()->create();

    Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->call('deleteUser')
        ->assertRedirect(route('password.confirm'));

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Step-up password confirmation required'
            && ($context['actor_id'] ?? null) === $administrator->id
            && ($context['action'] ?? null) === 'users.delete'
            && ($context['user_id'] ?? null) === $target->id)
        ->once();
});

// =====================================================================
// requiresPasswordConfirmation -- the #[Computed] predicate the view's
// warnings read, mirroring EnsureRecentPasswordConfirmation::isRecentlyConfirmed()
// exactly so the hint and the guard cannot drift.
// =====================================================================

test('requiresPasswordConfirmation is true when the confirmation is stale', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    markComponentPasswordConfirmationStale();

    expect(Livewire::test(Index::class)->get('requiresPasswordConfirmation'))->toBeTrue();
});

test('requiresPasswordConfirmation is true when the confirmation was never set', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    expect(Livewire::test(Index::class)->get('requiresPasswordConfirmation'))->toBeTrue();
});

test('requiresPasswordConfirmation is false when the confirmation is fresh', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    markComponentPasswordConfirmationFresh();

    expect(Livewire::test(Index::class)->get('requiresPasswordConfirmation'))->toBeFalse();
});
