<?php

namespace App\Listeners;

use App\Models\User;
use Illuminate\Auth\Events\Authenticated;
use Illuminate\Auth\Events\Login;
use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Support\Facades\Auth;

/**
 * Safety net (not the primary enforcement mechanism) for story 0007's
 * non-active-status sign-in block.
 *
 * App\Actions\Fortify\AuthenticateUser covers email+password and two-factor
 * sign-in *before* a challenge is issued, and
 * Laravel\Passkeys\Passkeys::authorizeLoginUsing() covers passkey sign-in.
 * Neither is reached by:
 *
 *  - remember-me/recaller re-authentication: Illuminate\Auth\SessionGuard::user()
 *    resolves a recalled user via retrieveByToken() entirely outside both
 *    callbacks, yet still fires Login for that resolution.
 *  - a two-factor code submission for a user whose status changed to
 *    non-active *after* the password step: Fortify's
 *    TwoFactorAuthenticatedSessionController::store() resolves the
 *    challenged user straight from the session and calls
 *    $guard->login($user, ...) directly, never consulting
 *    Fortify::authenticateUsing() again.
 *
 * This listener closes both paths, and needs two event hooks (not one) to do
 * it. SessionGuard::login() -- the method both of the above ultimately call --
 * fires Login *before* it calls setUser($user), and setUser() unconditionally
 * overwrites the guard's $user property and fires Authenticated immediately
 * afterwards:
 *
 *   $this->fireLoginEvent($user, $remember);  // our Login handler runs; a
 *                                              // logout() here is clobbered
 *                                              // by the very next line
 *   $this->setUser($user);                    // sets $this->user = $user,
 *                                              // fires Authenticated
 *
 * So a logout() triggered purely by Login is real for the recaller path
 * (SessionGuard::user() fires Login as the *last* thing it does before
 * returning $this->user, with no setUser() call after it to undo the
 * logout), but is silently undone on the login()/two-factor path. The Login
 * handler below still runs first and marks the current request via
 * request()->attributes -- a container-bound, per-request instance, safe to
 * use as a flag across two separately-container-resolved listener
 * invocations -- and the Authenticated handler, which necessarily runs
 * *after* setUser() finishes, performs the actual, sticking logout when that
 * flag is set.
 *
 * This deliberately does NOT logout on every Authenticated event -- only
 * when it was preceded, in the same request, by a Login event for a
 * non-active user. An already-authenticated user's ordinary subsequent
 * request fires Authenticated alone (via SessionGuard::user()'s
 * retrieveById() branch), never Login, so the flag is never set and this
 * listener is a no-op there -- already-live sessions are explicitly out of
 * scope for this story (see the User Story's Functional decisions).
 */
class RejectNonActiveUserLogin
{
    /**
     * The request-attribute key used to pass "a non-active user just fired
     * Login" from the Login handler to the Authenticated handler below. The
     * stored value is that user's auth identifier (not a bare boolean) --
     * see handleAuthenticated()'s docblock for why.
     */
    private const string DETECTED_FLAG = 'reject_non_active_user_login.detected';

    /**
     * Handle a Login event.
     *
     * Real fix for the remember-me/recaller path (no setUser() call follows
     * this event there); best-effort (see class docblock) for every other
     * path, where handleAuthenticated() below is what actually sticks.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;

        // App\Http\Controllers (Fortify's RegisteredUserController, in this
        // case) logs a brand-new self-registered user in immediately after
        // creating them, while their status is still Inactive by design --
        // see docs/architecture/authentication.md's no-self-activation
        // invariant. That is a *registration* concern, not a *sign-in*
        // concern, and is explicitly out of this story's scope: a freshly
        // registered user must stay signed in until they verify their
        // email, exactly like today. wasRecentlyCreated is true only on the
        // very instance Eloquent just inserted, which is the same instance
        // this Login event carries in that flow -- a settled sign-in
        // (through AuthenticateUser, the recaller, or a two-factor code
        // submission) is always against a user fetched from an existing
        // row, so this can't be spoofed by a call site outside registration.
        if (! $user instanceof User || $user->isActive() || $user->wasRecentlyCreated) {
            return;
        }

        request()->attributes->set(self::DETECTED_FLAG, $user->getAuthIdentifier());

        $this->forceLogout($event->guard);
    }

    /**
     * Handle an Authenticated event.
     *
     * Only acts when this request's Login handler (above) already detected
     * a non-active user -- see the class docblock for why this is what
     * actually closes the two-factor mid-challenge race. The flag stores
     * the detected user's identifier (not a bare boolean) and is compared
     * against $event->user's own identifier, so a flag set for one user
     * cannot be misread as covering a different user resolved later in the
     * same request.
     */
    public function handleAuthenticated(Authenticated $event): void
    {
        if (request()->attributes->get(self::DETECTED_FLAG) !== $event->user->getAuthIdentifier()) {
            return;
        }

        $this->forceLogout($event->guard);
    }

    /**
     * Log the given guard out and invalidate the current session.
     */
    private function forceLogout(string $guardName): void
    {
        $guard = Auth::guard($guardName);

        // Larastan's stub for this app's configured 'web' guard narrows the
        // return type to StatefulGuard already, but the check is defensive
        // against a differently-configured guard for the name carried by the
        // event -- the same defensive pattern laravel/passkeys' own
        // PasskeyLoginController uses before calling $guard->login().
        // @phpstan-ignore instanceof.alwaysTrue
        if (! $guard instanceof StatefulGuard) {
            return;
        }

        $guard->logout();

        // Mirrors Fortify's own AuthenticatedSessionController::destroy():
        // a session is not guaranteed to exist in every context a StatefulGuard
        // can be logged out from (e.g. a future console/queued login), so
        // invalidating it must be guarded rather than assumed.
        if (request()->hasSession()) {
            request()->session()->invalidate();
        }
    }
}
