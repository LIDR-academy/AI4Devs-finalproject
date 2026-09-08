<?php

// Story 0015a, Phase 4 finding F5. The Feature-level "fail-closed with no session" test in
// tests/Feature/Users/UpdateUserStepUpAuthorizationTest.php exercised the ABSENT-KEY case (a real
// actingAs() session whose auth.password_confirmed_at key was simply never written) -- which
// tests/Feature/Actions/Auth/EnsureRecentPasswordConfirmationTest.php's own "it throws when the
// confirmation was never set this session" test already covers, and is not a genuinely
// session-less context: Laravel's SessionServiceProvider is a core provider that boots
// regardless, so a session store always exists once the app has booted.
//
// This test proves the honest, stronger claim: with NO Laravel container bound at all
// (Illuminate\Container\Container::setInstance(null), so there is no 'session' service to
// resolve -- not merely an unstarted one), invoking the guard still fails closed. It never
// silently permits the privileged write it protects; the call is refused by SOME exception,
// proving the guard cannot be bypassed by removing the session layer entirely.
//
// Bare PHPUnit\Framework\TestCase, per tests/Pest.php: only 'Feature' and 'Browser' are bound to
// Tests\TestCase (which boots the full app) -- tests/Unit gets no app boot at all, which is
// exactly the precondition this test needs.
//
// Regression-proved manually during Phase 4 fix-and-return: temporarily wrapping the assertion
// below as ->not->toBeTrue() fails (the call really does throw, every time), confirming this is a
// real, specific precondition rather than a vacuously-passing assertion.

use App\Actions\Auth\EnsureRecentPasswordConfirmation;
use Illuminate\Container\Container;

test('it fails closed rather than silently permitting the action when no session driver is bound at all', function () {
    $previousContainer = Container::getInstance();
    Container::setInstance(null);

    try {
        $ensureRecentPasswordConfirmation = new EnsureRecentPasswordConfirmation;

        $threw = false;

        try {
            $ensureRecentPasswordConfirmation();
        } catch (Throwable) {
            $threw = true;
        }

        expect($threw)->toBeTrue();
    } finally {
        // Restore whatever container instance (if any) existed before this test, so a later
        // test file in the same process is not left running against a bare container.
        Container::setInstance($previousContainer);
    }
});
