<?php

namespace App\Http\Controllers;

use App\Actions\Users\ConfirmEmailChange;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class ConfirmEmailChangeController extends Controller
{
    /**
     * Confirm a pending email address change.
     *
     * Reached only via the `signed` + `throttle:6,1` `email-change.confirm`
     * route, with no `auth` middleware — what is being proven is control of
     * the mailbox, via the signed, address-bound, single-use, 60-minute
     * link, not an authenticated session.
     */
    public function __invoke(User $user, string $hash, ConfirmEmailChange $confirmEmailChange): RedirectResponse
    {
        if ($user->pending_email === null || ! hash_equals(sha1($user->pending_email), $hash)) {
            return redirect()->route('profile.edit')->with('status', __('users.email_change.refused'));
        }

        if (! $confirmEmailChange($user, $user->pending_email)) {
            return redirect()->route('profile.edit')->with('status', __('users.email_change.refused'));
        }

        return redirect()->route('profile.edit')->with('status', __('users.email_change.confirmed'));
    }
}
