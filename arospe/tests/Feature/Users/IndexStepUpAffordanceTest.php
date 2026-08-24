<?php

// Story 0015a -- the re-confirmation affordance in resources/views/livewire/users.blade.php.
// Story 0006's shipped modals carry no password-confirmation notice of any kind (verified in the
// task file); this story adds one to each, gated on the SAME predicate the guard itself uses
// (App\Livewire\Users\Index::requiresPasswordConfirmation(), reading
// App\Actions\Auth\EnsureRecentPasswordConfirmation::isRecentlyConfirmed()) so the hint and the
// guard cannot drift.
//
// Selected by data-test hook, never by translated text (per docs/api/routes.md's established
// convention for this screen, and because the copy is translated). This file is the first place
// these two hooks and their two lang keys are named -- they do not exist anywhere yet, which is
// exactly why every "notice appears" assertion below is RED right now:
//
//   - data-test="step-up-notice-edit"   -- inside @if ($showModal), above the role/status selects
//   - data-test="step-up-notice-delete" -- inside @if ($showDeleteModal), above the destructive button
//   - users.index.step_up_notice_edit / users.index.step_up_notice_delete -- lang/en/users.php and
//     lang/es/users.php, key-for-key identical across both.
//
// The "notice does NOT appear" tests are expected to be GREEN already (nothing renders it today
// either), which is correct TDD -- they still pin real, checkable behaviour and will catch a
// future regression that renders the notice unconditionally.

use App\Livewire\Users\Index;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    // Isolate this file from an ambiently-set SUPER_ADMIN_EMAIL, matching
    // tests/Feature/Users/IndexRenderingTest.php's own beforeEach -- see docs/errors-log.md.
    config(['auth.super_admin.email' => null]);

    $this->seed(RolePermissionSeeder::class);
});

function markAffordancePasswordConfirmationStale(): void
{
    session(['auth.password_confirmed_at' => now()->subSeconds(config('auth.password_timeout') + 60)->unix()]);
}

function markAffordancePasswordConfirmationFresh(): void
{
    session(['auth.password_confirmed_at' => now()->unix()]);
}

// =====================================================================
// The edit modal.
// =====================================================================

test('the edit modal shows a re-confirmation notice when the confirmation is stale', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    markAffordancePasswordConfirmationStale();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $html = Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->html();

    expect($html)->toContain('data-test="step-up-notice-edit"');
});

test('the edit modal shows a re-confirmation notice when the confirmation was never set', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $html = Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->html();

    expect($html)->toContain('data-test="step-up-notice-edit"');
});

test('the edit modal shows no re-confirmation notice when the confirmation is fresh', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    markAffordancePasswordConfirmationFresh();

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $html = Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->html();

    expect($html)->not->toContain('data-test="step-up-notice-edit"');
});

// Creation is never step-up-gated (Q2 / decision D1), so the create modal must show no notice
// regardless of confirmation freshness -- even though it shares the same $showModal block the
// edit modal uses.
test('the create modal shows no re-confirmation notice even when the confirmation is stale', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    markAffordancePasswordConfirmationStale();

    $html = Livewire::test(Index::class)
        ->call('openCreateModal')
        ->html();

    expect($html)->not->toContain('data-test="step-up-notice-edit"');
});

// =====================================================================
// The delete modal.
// =====================================================================

test('the delete modal shows a re-confirmation notice when the confirmation is stale', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    markAffordancePasswordConfirmationStale();

    $target = User::factory()->create();

    $html = Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->html();

    expect($html)->toContain('data-test="step-up-notice-delete"');
});

test('the delete modal shows a re-confirmation notice when the confirmation was never set', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $target = User::factory()->create();

    $html = Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->html();

    expect($html)->toContain('data-test="step-up-notice-delete"');
});

test('the delete modal shows no re-confirmation notice when the confirmation is fresh', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    markAffordancePasswordConfirmationFresh();

    $target = User::factory()->create();

    $html = Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->html();

    expect($html)->not->toContain('data-test="step-up-notice-delete"');
});
