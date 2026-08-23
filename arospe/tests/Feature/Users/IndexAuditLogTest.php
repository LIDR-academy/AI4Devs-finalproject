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

test('deleting a user logs the actor and the target', function () {
    Log::spy();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

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
