<?php

/*
 * Hand translation of examples/login.feature into a Pest 4 browser test.
 *
 * SKELETON — this file lives under docs/ as a worked example, not in tests/Browser/.
 * The tests/Browser/ suite is wired up (see ../playwright-setup.md), so these it() blocks
 * can be copied into tests/Browser/Auth/LoginTest.php and will run as-is. They stay here
 * as documentation; nothing under docs/ is executed by the test runner.
 *
 * Given/When/Then -> it() body mapping is documented in ../gherkin-guidelines.md.
 * Syntax (visit/fill/click/assertSee/assertNoJavaScriptErrors) is from
 * .claude/skills/pest-testing/SKILL.md. Routes/labels are real:
 * routes/web.php + resources/views/livewire/auth/login.blade.php.
 */

use App\Models\User;

// Scenario: A registered user signs in with valid credentials
it('signs a registered user in and lands them on the dashboard', function () {
    // Given a registered user
    $user = User::factory()->create();

    // When the user signs in with valid credentials
    // Then the user reaches their dashboard
    visit('/login')
        ->assertNoJavaScriptErrors()
        ->assertSee('Log in')
        ->fill('email', $user->email)
        ->fill('password', 'password')
        ->click('Log in')
        ->assertSee('Dashboard');
});

// Scenario: Sign-in is refused with a wrong password
it('refuses sign-in with a wrong password and keeps the user signed out', function () {
    // Given a registered user
    $user = User::factory()->create();

    // When the user tries to sign in with an incorrect password
    // Then the user is told the credentials are invalid
    visit('/login')
        ->assertNoJavaScriptErrors()
        ->fill('email', $user->email)
        ->fill('password', 'wrong-password')
        ->click('Log in')
        ->assertSee('These credentials do not match our records.');

    // And the user remains signed out
    $this->assertGuest();
});
