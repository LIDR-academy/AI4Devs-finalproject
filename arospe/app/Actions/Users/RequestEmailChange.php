<?php

namespace App\Actions\Users;

use App\Models\User;
use App\Notifications\PendingEmailVerification;
use Illuminate\Database\QueryException;
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
        $key = 'email-change:'.$user->getKey();

        if (! RateLimiter::attempt($key, maxAttempts: 3, callback: fn (): bool => true, decaySeconds: 3600)) {
            throw ValidationException::withMessages([
                'email' => trans('users.email_change.throttled'),
            ]);
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
