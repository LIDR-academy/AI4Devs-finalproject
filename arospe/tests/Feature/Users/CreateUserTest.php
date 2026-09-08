<?php

use App\Enums\UserStatus;
use App\Livewire\Users\Index;
use App\Models\User;
use App\Notifications\UserInvitation;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    Notification::fake();
});

test('creating a user sends exactly one invitation, to the new user only', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Hire')
        ->set('email', 'new.hire@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'new.hire@arospe.es')->firstOrFail();

    Notification::assertSentTo($created, UserInvitation::class);
    Notification::assertSentTimes(UserInvitation::class, 1);
    Notification::assertNotSentTo($administrator, UserInvitation::class);
});

test('a failed creation sends no invitation to anyone', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    User::factory()->create(['email' => 'marta.ruiz@arospe.es']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Duplicate Attempt')
        ->set('email', 'marta.ruiz@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasErrors(['email']);

    Notification::assertNothingSent();
});

test('a newly created user has a null email_verified_at and a null pending_email', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Hire')
        ->set('email', 'fresh.hire@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'fresh.hire@arospe.es')->firstOrFail();

    expect($created->email_verified_at)->toBeNull()
        ->and($created->pending_email)->toBeNull();
});

test('a newly created user is given an unusable password', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Hire')
        ->set('email', 'no.password@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active->value)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'no.password@arospe.es')->firstOrFail();

    expect(Auth::attempt(['email' => 'no.password@arospe.es', 'password' => '']))->toBeFalse()
        ->and(Hash::check('password', $created->password))->toBeFalse();
});
