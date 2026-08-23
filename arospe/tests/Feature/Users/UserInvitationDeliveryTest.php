<?php

// Story 0015 finding F9 — App\Notifications\UserInvitation no longer implements ShouldQueue
// (decision Q1). Before this fix, the notification's constructor took a Password::broker()
// token minted BEFORE the notification was ever sent, so while queued that plaintext,
// still-valid password-set token was serialized into a `jobs` table row
// (QUEUE_CONNECTION=database in real deployments).
//
// Deliberately does NOT reuse tests/Feature/Users/CreateUserTest.php's file-wide
// Notification::fake() beforeEach: proving "no longer queued" requires the REAL notification
// pipeline to run (so it would actually reach the queue if ShouldQueue were still present),
// observed instead through Queue::fake() -- Notification::fake() bypasses the queue mechanism
// entirely regardless of whether ShouldQueue is implemented, so it cannot tell the two states
// apart.

use App\Enums\UserStatus;
use App\Livewire\Users\Index;
use App\Models\User;
use App\Notifications\UserInvitation;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

test('UserInvitation no longer implements ShouldQueue', function () {
    expect(is_subclass_of(UserInvitation::class, ShouldQueue::class))->toBeFalse();
});

test('creating a user enqueues no job for the invitation notification', function () {
    Queue::fake();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Hire')
        ->set('email', 'not-queued-hire@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    // If UserInvitation still implemented ShouldQueue, sending it would push a
    // SendQueuedNotifications job -- this asserts nothing was pushed to the queue at all.
    Queue::assertNothingPushed();
});

test('creating a user still sends the invitation exactly once, synchronously', function () {
    Notification::fake();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Hire')
        ->set('email', 'still-sent-hire@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'still-sent-hire@arospe.es')->firstOrFail();

    Notification::assertSentTo($created, UserInvitation::class);
    Notification::assertSentTimes(UserInvitation::class, 1);
});

test('creating a user leaves no invitation token in the jobs table', function () {
    // Force the REAL queue connection this notification would use in production
    // (QUEUE_CONNECTION=database) rather than the test suite's default `sync`, which never
    // touches the jobs table regardless of ShouldQueue -- so a passing assertion here is
    // meaningful only because the connection really could have received a row.
    config(['queue.default' => 'database']);

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Hire')
        ->set('email', 'no-jobs-row-hire@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    expect(DB::table('jobs')->count())->toBe(0);
});
