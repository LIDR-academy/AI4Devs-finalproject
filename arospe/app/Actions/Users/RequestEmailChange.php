<?php

namespace App\Actions\Users;

use App\Models\User;
use App\Notifications\PendingEmailVerification;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RequestEmailChange
{
    /**
     * Request a change of the given user's email address.
     *
     * Never writes `users.email`, `email_verified_at` or `status`: the new
     * address is parked in `pending_email` and a verification link is sent
     * to that address only. The change is applied later by
     * App\Actions\Users\ConfirmEmailChange, once that link is used.
     */
    public function __invoke(User $user, string $newEmail): void
    {
        // Step 0 — normalise before anything else: the comparison below, the
        // value written to `pending_email`, and the value hashed into the
        // verification link must all see the same, single, normalised
        // string. See the story's "Normalisation must happen before the
        // hash exists" note for what silently breaks otherwise.
        $newEmail = Str::lower($newEmail);

        $currentEmail = Str::lower((string) $user->getRawOriginal('email'));

        if ($newEmail === $currentEmail) {
            if ($user->pending_email !== null) {
                $user->forceFill(['pending_email' => null])->save();
            }

            return;
        }

        // Throttled here (not at the Livewire call site) so App\Livewire\
        // Settings\Profile and story 0004's administrative user editor —
        // both of which call this action — share the same limit. Without
        // it, resubmitting the same still-pending address (which passes
        // validation every time, since the uniqueness rule ignores the
        // caller's own row) or cycling through arbitrary addresses drives
        // unlimited mail to a third-party inbox.
        //
        // Story 0015 finding F6 part 2: TWO limiters, not one, since the
        // original single target-only key let an administrator (a second,
        // cross-user caller since story 0004) burn a victim's own 3/hour
        // allowance. `Auth::id() ?? 'unauthenticated'` is the fail-closed
        // direction for the one caller with no authenticated actor at all
        // -- never fall back to $user->getKey(), which would silently
        // restore the burnable behaviour this exists to close.
        $actorKey = Auth::id() ?? 'unauthenticated';

        // (1) Per (target, actor): the existing 3/hour allowance, now
        // un-burnable across actors, so a target always retains their own
        // three regardless of administrator activity. Checked FIRST: both
        // limiters use RateLimiter::attempt(), which consumes on success,
        // so checking the wider one first would burn aggregate quota on a
        // request this narrower one is about to refuse anyway.
        $key = 'email-change:'.$user->getKey().':'.$actorKey;

        if (! RateLimiter::attempt($key, maxAttempts: 3, callback: fn (): bool => true, decaySeconds: 3600)) {
            throw ValidationException::withMessages([
                'email' => trans('users.email_change.throttled'),
            ]);
        }

        // (2) Per target, aggregate -- but NEVER applied to the target's own
        // self-service request (story 0015 Phase 4 re-audit finding F-A).
        // This key is shared by every administrator acting on this target,
        // so it is inherently burnable by third-party activity; the target
        // themselves is not a third party. Without this exemption, four
        // administrators each sending 3 requests (each within their own
        // per-(target,actor) cap) exhausts the aggregate 10 before the
        // target ever acts, locking them out of changing their own address
        // via App\Livewire\Settings\Profile for up to an hour -- entirely
        // caused by administrator activity, contradicting this story's own
        // "a target always retains their own three regardless of
        // administrator activity" acceptance criterion. The target's own
        // three-per-hour allowance above is unaffected either way.
        $isSelfService = Auth::id() !== null && $user->is(Auth::user());

        if (! $isSelfService) {
            // Preserves the inbox-flood ceiling the old target-only key
            // provided once (1) stopped being a global cap. 10/hour matches
            // decision Q3's already-decided CreateUser ceiling (one order of
            // magnitude above a single user's own allowance) -- a tunable,
            // since the security property (a victim's own allowance is not
            // consumable by anyone else, and their inbox still has a
            // ceiling) holds at any value >= 3.
            $aggregateKey = 'email-change-target:'.$user->getKey();

            if (! RateLimiter::attempt($aggregateKey, maxAttempts: 10, callback: fn (): bool => true, decaySeconds: 3600)) {
                throw ValidationException::withMessages([
                    'email' => trans('users.email_change.throttled'),
                ]);
            }
        }

        try {
            $user->forceFill(['pending_email' => $newEmail])->save();
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                throw ValidationException::withMessages([
                    'email' => trans('validation.unique', ['attribute' => 'email']),
                ]);
            }

            throw $e;
        }

        Notification::route('mail', $newEmail)
            ->notify(new PendingEmailVerification($user, $newEmail));
    }
}
