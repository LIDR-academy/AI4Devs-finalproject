<?php

use App\Enums\UserStatus;
use App\Livewire\Settings\Profile;
use App\Models\User;
use Livewire\Exceptions\PublicPropertyNotFoundException;
use Livewire\Livewire;

test('profile page is displayed', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/settings/profile')->assertOk();
});

test('a name change applies immediately, while an email change is held as pending', function () {
    $user = User::factory()->create(['status' => UserStatus::Active]);
    $originalEmail = $user->getRawOriginal('email');
    $originalVerifiedAt = $user->email_verified_at;

    $this->actingAs($user);

    $response = Livewire::test(Profile::class)
        ->set('name', 'Test User')
        ->set('email', 'test@example.com')
        ->call('updateProfileInformation');

    $response->assertHasNoErrors();

    $user->refresh();

    expect($user->name)->toEqual('Test User')
        ->and($user->getRawOriginal('email'))->toBe($originalEmail)
        ->and($user->email_verified_at)->toEqual($originalVerifiedAt)
        ->and($user->pending_email)->toBe('test@example.com');
});

test('changing a name alongside an email applies the name immediately, leaving the email pending', function () {
    $user = User::factory()->create(['name' => 'Original Name', 'status' => UserStatus::Active]);
    $originalEmail = $user->getRawOriginal('email');

    $this->actingAs($user);

    Livewire::test(Profile::class)
        ->set('name', 'New Name')
        ->set('email', 'new-address@example.com')
        ->call('updateProfileInformation')
        ->assertHasNoErrors();

    $user->refresh();

    expect($user->name)->toBe('New Name')
        ->and($user->getRawOriginal('email'))->toBe($originalEmail)
        ->and($user->pending_email)->toBe('new-address@example.com');
});

test('a self-service profile update cannot mass-assign a status', function () {
    $user = User::factory()->create(['status' => UserStatus::Active]);

    $this->actingAs($user);

    expect(fn () => Livewire::test(Profile::class)->set('status', 'suspended'))
        ->toThrow(PublicPropertyNotFoundException::class);

    expect($user->fresh()->status)->toBe(UserStatus::Active);
});

test('email verification status is unchanged when email address is unchanged', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = Livewire::test(Profile::class)
        ->set('name', 'Test User')
        ->set('email', $user->email)
        ->call('updateProfileInformation');

    $response->assertHasNoErrors();

    expect($user->refresh()->email_verified_at)->not->toBeNull()
        ->and($user->pending_email)->toBeNull();
});

test('saving your own unchanged email still passes the uniqueness check', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = Livewire::test(Profile::class)
        ->set('name', 'Updated Name')
        ->set('email', $user->email)
        ->call('updateProfileInformation');

    $response->assertHasNoErrors(['email']);

    expect($user->fresh()->name)->toBe('Updated Name');
});

test('user can delete their account', function () {
    $user = User::factory()->create();
    $id = $user->id;

    $this->actingAs($user);

    $response = Livewire::test('settings.delete-user-form')
        ->set('password', 'password')
        ->call('deleteUser');

    $response
        ->assertHasNoErrors()
        ->assertRedirect('/');

    // Story 0005: account deletion is a soft delete, not a hard delete --
    // fresh() bypasses the SoftDeletingScope, so the row is retained (not
    // null) but trashed, with its email obfuscated. See
    // tests/Feature/Models/UserSoftDeleteTest.php for the equivalent
    // model-level coverage this mirrors.
    $trashed = User::withTrashed()->find($id);

    expect($trashed)->not->toBeNull()
        ->and($trashed->trashed())->toBeTrue()
        ->and($trashed->getRawOriginal('email'))->toBe("deleted+{$id}@deleted.invalid");
    expect(auth()->check())->toBeFalse();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = Livewire::test('settings.delete-user-form')
        ->set('password', 'wrong-password')
        ->call('deleteUser');

    $response->assertHasErrors(['password']);

    expect($user->fresh())->not->toBeNull();
});
