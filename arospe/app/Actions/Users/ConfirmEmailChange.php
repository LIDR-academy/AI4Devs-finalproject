<?php

namespace App\Actions\Users;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class ConfirmEmailChange
{
    /**
     * Apply a pending email address change.
     *
     * Returns whether the change was actually applied. Both abort branches
     * (the pending value no longer matching, or the address having been
     * claimed by another account in the meantime) are expected, non
     * exceptional outcomes of a link arriving late — not domain faults — so
     * the caller (App\Http\Controllers\ConfirmEmailChangeController) is
     * required to branch on the boolean result rather than assume success.
     */
    public function __invoke(User $user, string $email): bool
    {
        return DB::transaction(function () use ($user, $email): bool {
            /** @var User $locked */
            $locked = User::query()->lockForUpdate()->findOrFail($user->getKey());

            if ($locked->pending_email !== $email) {
                return false;
            }

            $addressTaken = User::query()
                ->whereKeyNot($locked->getKey())
                ->where(function ($query) use ($email): void {
                    $query->where('email', $email)->orWhere('pending_email', $email);
                })
                ->exists();

            if ($addressTaken) {
                return false;
            }

            try {
                $locked->forceFill([
                    'email' => $email,
                    'pending_email' => null,
                    'email_verified_at' => now(),
                ])->save();
            } catch (QueryException $e) {
                if ($e->getCode() === '23000') {
                    return false;
                }

                throw $e;
            }

            // See the identical note in app/Actions/Fortify/ResetUserPassword.php.
            //
            // App\Listeners\ActivateVerifiedUser relies on the save() above being
            // the last dirty write to email_verified_at before this event fires --
            // do not insert another save() between them.
            // @phpstan-ignore argument.type
            event(new Verified($locked));

            return true;
        });
    }
}
