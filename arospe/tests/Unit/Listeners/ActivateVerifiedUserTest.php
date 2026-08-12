<?php

use App\Enums\UserStatus;
use App\Listeners\ActivateVerifiedUser;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Contracts\Auth\MustVerifyEmail;

// The listener's own decision logic (when it transitions `status`, when it persists) is what
// this file isolates. The DB write it triggers on the activation branch is stubbed via a
// partial mock of `User::save()` so this stays a `tests/Unit/` test (no real database write) —
// the actual persisted effect, reached through the real HTTP route, is covered separately in
// tests/Feature/Settings/EmailChangeTest.php per this story's "Tests to perform" list.

test('activates an inactive user when their email is verified', function () {
    $user = Mockery::mock(User::class)->makePartial();
    $user->status = UserStatus::Inactive;
    $user->shouldReceive('save')->once();

    (new ActivateVerifiedUser)->handle(new Verified($user));

    expect($user->status)->toBe(UserStatus::Active);
});

test('never reactivates a suspended user', function () {
    $user = Mockery::mock(User::class)->makePartial();
    $user->status = UserStatus::Suspended;
    $user->shouldNotReceive('save');

    (new ActivateVerifiedUser)->handle(new Verified($user));

    expect($user->status)->toBe(UserStatus::Suspended);
});

test('is a no-op on an already active user', function () {
    $user = Mockery::mock(User::class)->makePartial();
    $user->status = UserStatus::Active;
    $user->shouldNotReceive('save');

    (new ActivateVerifiedUser)->handle(new Verified($user));

    expect($user->status)->toBe(UserStatus::Active);
});

test('does nothing when the verified user is not an App\Models\User instance', function () {
    // Illuminate\Auth\Events\Verified::$user is typed as the MustVerifyEmail
    // interface, not concretely App\Models\User — the listener's
    // `instanceof User` guard is real, reachable code and must not throw
    // when handed some other implementation of that interface.
    $notAUser = new class implements MustVerifyEmail
    {
        public function getEmailForVerification(): string
        {
            return 'not-a-user@example.com';
        }

        public function hasVerifiedEmail(): bool
        {
            return false;
        }

        public function markEmailAsVerified(): bool
        {
            return true;
        }

        public function markEmailAsUnverified(): bool
        {
            return true;
        }

        public function sendEmailVerificationNotification(): void {}
    };

    (new ActivateVerifiedUser)->handle(new Verified($notAUser));
})->throwsNoExceptions();
