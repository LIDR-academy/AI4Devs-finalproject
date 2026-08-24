<?php

// Story 0015a -- the domain exception App\Actions\Auth\EnsureRecentPasswordConfirmation throws
// when the acting administrator's password confirmation is stale or absent. Mirrors
// tests/Unit/Exceptions/ImmutableRoleExceptionTest.php's own shape for the same reason that file
// exists: prove the render() contract in isolation, with no HTTP kernel and no database.
//
// Status: 423 Locked -- deliberately NOT 403. A 403 is indistinguishable from "you lack the
// permission"; the whole point of this refusal is that the actor DOES hold the permission and is
// only missing a recent proof of identity. 423 is also not invented for this app: it is the exact
// status Illuminate\Auth\Middleware\RequirePassword::handle() itself returns on its own JSON
// branch, so this app's step-up refusal converges on the status the framework already uses for
// the identical condition.

use App\Exceptions\PasswordConfirmationRequiredException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;

test('it is a runtime exception', function () {
    expect(new PasswordConfirmationRequiredException('Your password confirmation has expired.'))
        ->toBeInstanceOf(RuntimeException::class);
});

test('it is not an authorization exception -- a step-up refusal must be distinguishable from a permission refusal', function () {
    expect(new PasswordConfirmationRequiredException('Your password confirmation has expired.'))
        ->not->toBeInstanceOf(AuthorizationException::class);
});

test('rendering it produces a 423 response, matching RequirePassword\'s own JSON-branch status for the identical condition', function () {
    $exception = new PasswordConfirmationRequiredException('Your password confirmation has expired.');

    $response = $exception->render(Request::create('/users'));

    expect($response->getStatusCode())->toBe(423)
        ->and($response->getStatusCode())->not->toBe(403);
});
