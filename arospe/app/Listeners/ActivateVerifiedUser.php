<?php

namespace App\Listeners;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Auth\Events\Verified;

class ActivateVerifiedUser
{
    /**
     * Handle the event.
     *
     * This is the single activation point for the no-self-activation
     * invariant: Fortify's own email-verification flow, the invitation
     * flow, and the pending-email confirmation flow all reach `Active`
     * through this listener rather than each re-implementing the rule.
     *
     * Only transitions a user who is both currently `Inactive` AND has
     * *never* verified an email before (`Inactive` is also the status an
     * administrator lands a previously-active, previously-verified user on
     * when deactivating them -- see UserPolicy/UpdateUser's `statusRules()`
     * -- and that case must NOT be auto-reactivated just because a later
     * email-change confirmation fires this same event). Never touches a
     * `Suspended` user, and is a no-op on an already-`Active` user.
     *
     * `getPrevious()['email_verified_at']` -- neither the live attribute nor
     * `getOriginal()` -- is what correctly holds the pre-change value here.
     * Every caller that fires this event (Fortify's VerifyEmailController,
     * App\Actions\Fortify\ResetUserPassword,
     * App\Actions\Users\ConfirmEmailChange) writes the new
     * `email_verified_at` and calls `save()` *before* firing `Verified` on
     * that same instance. `Model::save()` -> `finishSave()` calls
     * `syncOriginal()` unconditionally at the very end of *every* successful
     * save (insert or update) -- so by the time this handler runs,
     * `getOriginal()` already reflects the value that was just written, not
     * the pre-save one (verified against `vendor/laravel/framework`; do not
     * "fix" this back to `getOriginal()`, it silently breaks every
     * legitimate first-verification flow by always finding a non-null
     * "original"). What does survive is `$this->previous`, populated by
     * `syncChanges()` from inside `performUpdate()` *before* `finishSave()`
     * runs -- it captures the raw pre-save value of every attribute that was
     * actually dirty on that save, keyed by attribute name, and is left
     * untouched by the later `syncOriginal()` call. `syncChanges()` is never
     * called from `performInsert()`, so `getPrevious()` is empty right after
     * a fresh insert -- a `Verified` fired on a just-inserted, pre-verified
     * instance would fail closed here too. If `email_verified_at` isn't
     * present in `getPrevious()` at all (i.e. it wasn't part of the last
     * save's dirty set -- which also means whichever `save()` writes it must
     * be the one immediately preceding `event(new Verified(...))`, with no
     * other intervening save), this fails closed and does not activate.
     */
    public function handle(Verified $event): void
    {
        $user = $event->user;

        if (! $user instanceof User || $user->status !== UserStatus::Inactive) {
            return;
        }

        $previous = $user->getPrevious();

        $neverVerified = array_key_exists('email_verified_at', $previous) && is_null($previous['email_verified_at']);

        if (! $neverVerified) {
            return;
        }

        $user->status = UserStatus::Active;
        $user->save();
    }
}
