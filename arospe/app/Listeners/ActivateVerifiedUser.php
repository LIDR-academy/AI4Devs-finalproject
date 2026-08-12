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
     * Only transitions a currently `Inactive` user to `Active`. Never
     * touches a `Suspended` user, and is a no-op on an already-`Active`
     * user.
     */
    public function handle(Verified $event): void
    {
        $user = $event->user;

        if (! $user instanceof User || $user->status !== UserStatus::Inactive) {
            return;
        }

        $user->status = UserStatus::Active;
        $user->save();
    }
}
