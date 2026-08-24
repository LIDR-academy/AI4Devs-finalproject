<?php

// Story 0015a -- App\Actions\Auth\EnsureRecentPasswordConfirmation is the SINGLE implementation
// of the password-confirmation freshness check reused by App\Actions\Users\UpdateUser (role/status
// changes) and App\Livewire\Users\Index::deleteUser(). These tests exercise the action directly
// and in isolation from the Users domain -- no User model, no permissions, no RolePermissionSeeder
// -- because the rule itself has nothing to do with Users; it is a pure session/config check.
//
// The comparison under test is Illuminate\Auth\Middleware\RequirePassword::shouldConfirmPassword()
// itself, read out of the installed vendor source (see
// ai-spec/tasks/in-progress/0015a-step-up-auth-privileged-user-actions.md's "The mechanism"
// section):
//
//     $confirmedAt = Date::now()->unix() - $request->session()->get('auth.password_confirmed_at', 0);
//     return $confirmedAt > ($passwordTimeoutSeconds ?? $this->passwordTimeout);
//
// -- same session key (auth.password_confirmed_at), same config key (auth.password_timeout,
// reused verbatim per decision D2 -- no new Users-specific window), and critically the same ">"
// (not ">=") comparison: a confirmation exactly `password_timeout` seconds old is still valid.
//
// No actingAs() call appears anywhere in this file. The action's whole point is to fail closed
// with NO proof of a session at all -- these tests never manufacture one.

use App\Actions\Auth\EnsureRecentPasswordConfirmation;
use App\Exceptions\PasswordConfirmationRequiredException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Carbon;

afterEach(function () {
    Carbon::setTestNow();
});

// =====================================================================
// __invoke() -- the throwing form.
// =====================================================================

test('it throws when the confirmation was never set this session', function () {
    // auth.password_confirmed_at deliberately never written -- the Gherkin "caller with no
    // session" / "never confirmed" case. session('auth.password_confirmed_at', 0)'s own default
    // of 0 makes the elapsed time huge, so this must fail closed by construction.
    $ensureRecentPasswordConfirmation = app(EnsureRecentPasswordConfirmation::class);

    expect(fn () => $ensureRecentPasswordConfirmation())
        ->toThrow(PasswordConfirmationRequiredException::class);
});

test('it throws when the confirmation is older than the configured timeout', function () {
    session(['auth.password_confirmed_at' => now()->subSeconds(config('auth.password_timeout') + 60)->unix()]);

    $ensureRecentPasswordConfirmation = app(EnsureRecentPasswordConfirmation::class);

    expect(fn () => $ensureRecentPasswordConfirmation())
        ->toThrow(PasswordConfirmationRequiredException::class);
});

test('it does not throw when the confirmation is recent', function () {
    session(['auth.password_confirmed_at' => now()->unix()]);

    $ensureRecentPasswordConfirmation = app(EnsureRecentPasswordConfirmation::class);
    $ensureRecentPasswordConfirmation();

    // Reaching this line at all proves no exception was thrown above.
    expect(true)->toBeTrue();
});

test('the thrown exception is PasswordConfirmationRequiredException, never an AuthorizationException', function () {
    $ensureRecentPasswordConfirmation = app(EnsureRecentPasswordConfirmation::class);

    $caught = null;

    try {
        $ensureRecentPasswordConfirmation();
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(PasswordConfirmationRequiredException::class)
        ->and($caught)->not->toBeInstanceOf(AuthorizationException::class);
});

// =====================================================================
// The exact boundary -- ">" not ">=". Carbon::setTestNow() pins "now" so the
// elapsed time can be controlled to the second in both directions.
// =====================================================================

test('a confirmation exactly at the configured timeout is still valid', function () {
    $timeout = config('auth.password_timeout');
    $now = Carbon::create(2026, 1, 1, 12, 0, 0);
    Carbon::setTestNow($now);

    session(['auth.password_confirmed_at' => $now->clone()->subSeconds($timeout)->unix()]);

    app(EnsureRecentPasswordConfirmation::class)();

    expect(true)->toBeTrue();
});

test('a confirmation one second older than the configured timeout is refused', function () {
    $timeout = config('auth.password_timeout');
    $now = Carbon::create(2026, 1, 1, 12, 0, 0);
    Carbon::setTestNow($now);

    session(['auth.password_confirmed_at' => $now->clone()->subSeconds($timeout + 1)->unix()]);

    expect(fn () => app(EnsureRecentPasswordConfirmation::class)())
        ->toThrow(PasswordConfirmationRequiredException::class);
});

// =====================================================================
// isRecentlyConfirmed(): bool -- the non-throwing predicate the UI hint
// reads. Must mirror __invoke()'s own logic exactly (same rule, two shapes)
// so the guard and the warning shown before the guard fires can never drift.
// =====================================================================

test('isRecentlyConfirmed returns false when never confirmed', function () {
    expect(app(EnsureRecentPasswordConfirmation::class)->isRecentlyConfirmed())->toBeFalse();
});

test('isRecentlyConfirmed returns false when stale, without throwing', function () {
    session(['auth.password_confirmed_at' => now()->subSeconds(config('auth.password_timeout') + 60)->unix()]);

    expect(app(EnsureRecentPasswordConfirmation::class)->isRecentlyConfirmed())->toBeFalse();
});

test('isRecentlyConfirmed returns true when recently confirmed', function () {
    session(['auth.password_confirmed_at' => now()->unix()]);

    expect(app(EnsureRecentPasswordConfirmation::class)->isRecentlyConfirmed())->toBeTrue();
});

test('isRecentlyConfirmed mirrors the exact ">" boundary the throwing check uses', function () {
    $timeout = config('auth.password_timeout');
    $now = Carbon::create(2026, 1, 1, 12, 0, 0);
    Carbon::setTestNow($now);

    session(['auth.password_confirmed_at' => $now->clone()->subSeconds($timeout)->unix()]);
    expect(app(EnsureRecentPasswordConfirmation::class)->isRecentlyConfirmed())->toBeTrue();

    session(['auth.password_confirmed_at' => $now->clone()->subSeconds($timeout + 1)->unix()]);
    expect(app(EnsureRecentPasswordConfirmation::class)->isRecentlyConfirmed())->toBeFalse();
});
