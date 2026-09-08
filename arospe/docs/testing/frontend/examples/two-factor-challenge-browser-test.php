<?php

/*
 * Hand translation of examples/two-factor-challenge.feature into a Pest 4 browser test.
 *
 * SKELETON — worked example under docs/, not in tests/Browser/. The suite is wired up
 * (see ../playwright-setup.md), so this it() block can be moved into
 * tests/Browser/Auth/TwoFactorChallengeTest.php and will run as-is. It stays here as
 * documentation; nothing under docs/ is executed by the test runner.
 *
 * Given/When/Then -> it() mapping: ../gherkin-guidelines.md.
 * Grounded in: tests/Feature/Auth/TwoFactorChallengeTest.php (real flow + factory state),
 * resources/views/livewire/auth/two-factor-challenge.blade.php (real challenge-page text),
 * config/fortify.php (2FA feature config).
 */

use App\Models\User;
use Laravel\Fortify\Features;

beforeEach(function () {
    // Mirrors the real feature test: only run when 2FA is enabled in Fortify config.
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);
});

// Scenario: A user with two-factor enabled is challenged after entering valid credentials
it('challenges a two-factor user for a second factor after valid credentials', function () {
    // Given a registered user who has enabled two-factor authentication
    $user = User::factory()->withTwoFactor()->create();

    // When the user signs in with valid credentials
    // Then the user is asked for a second authentication factor
    visit('/login')
        ->assertNoJavaScriptErrors()
        ->fill('email', $user->email)
        ->fill('password', 'password')
        ->click('Log in')
        ->assertSee('Two-factor authentication')
        ->assertSee('Authentication code');

    // And the user is not yet signed in (the challenge has not been answered)
    $this->assertGuest();
});
