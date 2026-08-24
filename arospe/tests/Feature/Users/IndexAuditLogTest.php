<?php

// Story 0015 finding F5 — App\Livewire\Users\Index logs a structured event for each privileged
// outcome (user created, user edited, user deleted), mirroring the shipped shape at
// App\Livewire\Roles\Index::saveRole()/deleteRole() (Log::info, never Log::warning) rather than
// the seeder's own convention. Never logs the generated password, the invitation token, or the
// email-change verification hash.
//
// Each test below asserts the LOGGED CONTEXT'S KEYS explicitly, rather than grepping the
// serialized context for a secret value: the generated password and invitation token are
// randomly generated per test run, so there is nothing fixed to grep for -- an allowlist-style
// key check is what actually proves neither one (nor any hash-shaped value) was ever handed to
// the logger, and is agnostic to the exact key names Phase 3 chooses beyond what this story's
// Gherkin explicitly names (actor, target, and -- for the edit path -- the before/after role
// and status).
//
// The withArgs() closures below return a plain bool and perform no expect() calls of their own
// -- matching the shipped precedent at tests/Feature/Roles/IndexTest.php's "saveRole() logs..."
// / "deleteRole() logs..." tests -- so a mismatch fails as a clean "expected call not found"
// from Mockery/shouldHaveReceived(), not as an exception thrown mid-match.

use App\Enums\UserStatus;
use App\Livewire\Users\Index;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Log;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * @param  array<string, mixed>  $context
 */
function usersAuditLogContextHasNoSecretLookingKey(array $context): bool
{
    foreach (array_keys($context) as $key) {
        if (! is_string($key)) {
            continue;
        }

        if (str_contains($key, 'password') || str_contains($key, 'token') || str_contains($key, 'hash')) {
            return false;
        }
    }

    return true;
}

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

test('creating a user logs the actor and the target, with no password- or token-shaped key in the context', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Audited Hire')
        ->set('email', 'audited-create@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'audited-create@arospe.es')->firstOrFail();

    Log::shouldHaveReceived('info')
        ->withArgs(fn (string $message, array $context): bool => $message === 'User created'
            && ($context['actor_id'] ?? null) === $administrator->id
            && ($context['user_id'] ?? null) === $created->id
            && usersAuditLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('editing a user logs the actor, the target, and the PRE-WRITE before/after role and status', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    // Story 0015a: the role+status change under test here requires a fresh password
    // confirmation, so it doesn't get intercepted by the step-up guard before the log line this
    // test is actually about is ever written.
    session(['auth.password_confirmed_at' => now()->unix()]);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $blogEditorRole->id)
        ->set('status', UserStatus::Suspended->value)
        ->call('save')
        ->assertHasNoErrors();

    Log::shouldHaveReceived('info')
        ->withArgs(function (string $message, array $context) use ($administrator, $target): bool {
            if ($message !== 'User updated') {
                return false;
            }

            if (($context['actor_id'] ?? null) !== $administrator->id || ($context['user_id'] ?? null) !== $target->id) {
                return false;
            }

            if (! usersAuditLogContextHasNoSecretLookingKey($context)) {
                return false;
            }

            // A log line built from the model AFTER save() would report the NEW status/role as
            // the "before" value too -- these must genuinely disagree, both directions.
            $encoded = json_encode($context);

            return str_contains($encoded, 'Editor')
                && str_contains($encoded, 'Blog Editor')
                && str_contains($encoded, UserStatus::Active->value)
                && str_contains($encoded, UserStatus::Suspended->value);
        })
        ->once();
});

// Story 0015 Phase 4 re-audit finding F-B: UserPolicy::updateSensitiveAttributes() classifies an
// email rewrite as severity-equivalent to account takeover, and the delete path is already
// logged -- so the "User updated" line must record whether an edit requested an email change,
// even though it never logs the address itself (UpdateUser only ever parks a new address in
// `pending_email`; there is no "after" value to log until its own confirmation link is used).
test('editing a user with a changed email logs email_change_requested as true', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['status' => UserStatus::Active, 'email' => 'audited-before@arospe.es']);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('email', 'audited-after@arospe.es')
        ->set('roleId', (string) $role->id)
        ->call('save')
        ->assertHasNoErrors();

    Log::shouldHaveReceived('info')
        ->withArgs(fn (string $message, array $context): bool => $message === 'User updated'
            && ($context['user_id'] ?? null) === $target->id
            && ($context['email_change_requested'] ?? null) === true
            // The new address itself must never appear in the logged context -- only the
            // boolean flag; UpdateUser never writes it to `users.email` synchronously anyway.
            && ! str_contains((string) json_encode($context), 'audited-after@arospe.es')
            && usersAuditLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('editing a user without changing the email logs email_change_requested as false', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['status' => UserStatus::Active, 'name' => 'Before Name']);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('name', 'After Name')
        ->set('roleId', (string) $role->id)
        ->call('save')
        ->assertHasNoErrors();

    Log::shouldHaveReceived('info')
        ->withArgs(fn (string $message, array $context): bool => $message === 'User updated'
            && ($context['user_id'] ?? null) === $target->id
            && ($context['email_change_requested'] ?? null) === false
            && usersAuditLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('deleting a user logs the actor and the target', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    // Story 0015a: deleteUser() now runs the same step-up guard, so it needs a fresh
    // confirmation to reach the deletion (and its log line) at all.
    session(['auth.password_confirmed_at' => now()->unix()]);

    $target = User::factory()->create();
    $targetId = $target->id;

    Livewire::test(Index::class)
        ->call('confirmDelete', $targetId)
        ->call('deleteUser');

    Log::shouldHaveReceived('info')
        ->withArgs(fn (string $message, array $context): bool => $message === 'User deleted'
            && ($context['actor_id'] ?? null) === $administrator->id
            && ($context['user_id'] ?? null) === $targetId
            && usersAuditLogContextHasNoSecretLookingKey($context))
        ->once();
});
