<?php

namespace App\Actions\Auth;

use App\Exceptions\PasswordConfirmationRequiredException;
use Illuminate\Support\Facades\Date;

/**
 * Story 0015a — the single implementation of the password-confirmation
 * freshness check, reused by App\Actions\Users\UpdateUser (role/status
 * changes) and App\Livewire\Users\Index::deleteUser() (deletion). Neither
 * call site re-derives this comparison inline.
 *
 * Reads and compares exactly the way
 * Illuminate\Auth\Middleware\RequirePassword::shouldConfirmPassword() does —
 * same session key (`auth.password_confirmed_at`), same config key
 * (`auth.password_timeout`, reused verbatim per decision D2 — no new,
 * Users-specific timeout), and the identical `>` (not `>=`) comparison, so a
 * confirmation exactly `password_timeout` seconds old is still valid:
 *
 *     $confirmedAt = Date::now()->unix() - $request->session()->get('auth.password_confirmed_at', 0);
 *     return $confirmedAt > ($passwordTimeoutSeconds ?? $this->passwordTimeout);
 *
 * The session key's `0` default means "never confirmed" resolves to a huge
 * elapsed time and therefore to "must confirm" — fail-closed by
 * construction, including for a caller with no session at all (an
 * unauthenticated/console context), which is deliberate: this action never
 * exempts an absent session, matching the precedent story 0008a recorded for
 * these same Users actions.
 */
class EnsureRecentPasswordConfirmation
{
    /**
     * Refuse the caller unless their password confirmation is still fresh.
     *
     * @throws PasswordConfirmationRequiredException
     */
    public function __invoke(): void
    {
        if (! $this->isRecentlyConfirmed()) {
            throw new PasswordConfirmationRequiredException(
                'Your password confirmation has expired. Please confirm your password to continue.',
            );
        }
    }

    /**
     * Non-throwing predicate for the view's re-confirmation warning — reads
     * the same session/config values and applies the same comparison as
     * __invoke() itself (one rule, two shapes), so the UI hint and the guard
     * can never drift.
     */
    public function isRecentlyConfirmed(): bool
    {
        $elapsedSeconds = Date::now()->unix() - session('auth.password_confirmed_at', 0);

        return $elapsedSeconds <= (int) config('auth.password_timeout');
    }
}
