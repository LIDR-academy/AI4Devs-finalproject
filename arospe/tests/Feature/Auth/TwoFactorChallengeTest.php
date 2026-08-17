<?php

use App\Enums\UserStatus;
use App\Models\User;
use Laravel\Fortify\Features;
use PragmaRX\Google2FA\Google2FA;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());
});

test('two factor challenge redirects to login when not authenticated', function () {
    $response = $this->get(route('two-factor.login'));

    $response->assertRedirect(route('login'));
});

test('two factor challenge can be rendered', function () {
    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('two-factor.login'));
});

// --- Story 0007: non-active status blocks sign-in, before and mid-challenge ---

test('a non-active user with two-factor authentication enabled never reaches the challenge step', function (UserStatus $status) {
    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create(['status' => $status]);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    // Refused before the challenge: not a redirect to the two-factor
    // screen, and RedirectIfTwoFactorAuthenticatable's own session key
    // ('login.id') is never set -- its absence is what proves the block ran
    // before that pipe, not after.
    $response->assertSessionHasErrors(['email' => __('users.login.not_active')]);

    // The message names no specific status.
    $message = session('errors')->first('email');
    expect($message)
        ->not->toContain(UserStatus::Inactive->value)
        ->not->toContain(UserStatus::Suspended->value);

    expect($response->headers->get('Location'))->not->toBe(route('two-factor.login'));
    // assertSessionMissing() is a TestResponse method, not a TestCase one.
    $response->assertSessionMissing('login.id');

    $this->assertGuest();
})->with([
    'inactive' => [UserStatus::Inactive],
    'suspended' => [UserStatus::Suspended],
]);

test('a user suspended mid-challenge is refused even with a valid authentication code', function () {
    $secret = app(Google2FA::class)->generateSecretKey();

    $user = User::factory()->suspended()->create([
        'two_factor_secret' => encrypt($secret),
        'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
        'two_factor_confirmed_at' => now(),
    ]);

    $validCode = app(Google2FA::class)->getCurrentOtp($secret);

    // Seed the pending challenge state RedirectIfTwoFactorAuthenticatable
    // would have written before the user's status changed to Suspended.
    $this->withSession([
        'login.id' => $user->id,
        'login.remember' => false,
    ]);

    $this->post(route('two-factor.login.store'), [
        'code' => $validCode,
    ]);

    $this->assertGuest();
});
