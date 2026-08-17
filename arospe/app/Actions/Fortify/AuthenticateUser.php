<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;

/**
 * Validate sign-in credentials and enforce the account's active status.
 *
 * Registered as Fortify::authenticateUsing() in FortifyServiceProvider,
 * which routes both the plain email+password pipe
 * (Laravel\Fortify\Actions\AttemptToAuthenticate) and the two-factor pipe
 * (Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable) through this
 * action — so a non-active user is refused before a two-factor challenge is
 * ever offered. Passkey sign-in and remember-me/recaller re-authentication
 * do not reach this action; see Laravel\Passkeys\Passkeys::authorizeLoginUsing()
 * (registered alongside this in FortifyServiceProvider) and
 * App\Listeners\RejectNonActiveUserLogin respectively.
 *
 * Constructor injection (rather than this repo's usual Livewire
 * per-method-injection convention) matches Fortify's own AttemptToAuthenticate
 * / RedirectIfTwoFactorAuthenticatable — this is not a Livewire component.
 */
class AuthenticateUser
{
    public function __construct(protected StatefulGuard $guard)
    {
        //
    }

    /**
     * Resolve and verify the request's credentials, then enforce that the
     * matched user's status is active.
     *
     * Replicates guard->attempt()'s own credential-resolution steps
     * (retrieveByCredentials(), validateCredentials(),
     * rehashPasswordIfRequired()) instead of calling attempt() itself,
     * because Fortify::authenticateUsing() bypasses attempt() entirely —
     * this is what keeps today's implicit password-rehash-on-login behavior.
     * Going through the guard's own UserProvider (rather than a hand-rolled
     * User::where()) also preserves the SoftDeletingScope sign-in refusal
     * (see docs/security/soft-delete-patterns.md).
     *
     * Returns null for invalid credentials, so Fortify's own generic
     * `auth.failed` message and rate-limiter increment run unchanged (see
     * AttemptToAuthenticate::handleUsingCustomCallback()). Throws only once
     * credentials are already known to be valid, so a wrong password never
     * discloses that the account exists but is merely non-active — and the
     * thrown message never names which non-active status applies.
     */
    public function __invoke(Request $request): ?User
    {
        $provider = $this->guard->getProvider();

        /** @var User|null $user */
        $user = $provider->retrieveByCredentials($request->only(Fortify::username(), 'password'));

        if (! $user || ! $provider->validateCredentials($user, ['password' => $request->password])) {
            return null;
        }

        // Larastan's stub for the app's configured 'eloquent' provider narrows
        // UserProvider to EloquentUserProvider, which always has this method
        // -- but the check is defensive against a differently-configured
        // provider, exactly like Fortify's own RedirectIfTwoFactorAuthenticatable
        // does it, so it stays even though it's a tautology under the stub.
        // @phpstan-ignore function.alreadyNarrowedType
        if (config('hashing.rehash_on_login', true) && method_exists($provider, 'rehashPasswordIfRequired')) {
            $provider->rehashPasswordIfRequired($user, ['password' => $request->password]);
        }

        if (! $user->isActive()) {
            throw ValidationException::withMessages([
                Fortify::username() => [__('users.login.not_active')],
            ]);
        }

        return $user;
    }
}
