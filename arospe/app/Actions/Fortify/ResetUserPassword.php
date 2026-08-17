<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\ResetsUserPasswords;

class ResetUserPassword implements ResetsUserPasswords
{
    use PasswordValidationRules;

    /**
     * Validate and reset the user's forgotten password.
     *
     * @param  array<string, string>  $input
     */
    public function reset(User $user, array $input): void
    {
        Validator::make($input, [
            'password' => $this->passwordRules(),
        ])->validate();

        $wasUnverified = is_null($user->email_verified_at);

        $user->forceFill([
            'password' => $input['password'],
            ...($wasUnverified ? ['email_verified_at' => now()] : []),
        ])->save();

        if ($wasUnverified) {
            // Verified::$user is typed via PHPDoc as MustVerifyEmail; App\Models\User
            // deliberately does not implement that interface today (see the
            // commented-out import in app/Models/User.php), but the event's
            // constructor has no native type hint, so this is safe at runtime and is
            // exactly how Fortify's own verification controller fires it.
            //
            // App\Listeners\ActivateVerifiedUser relies on the save() above being
            // the last dirty write to email_verified_at before this event fires --
            // do not insert another save() between them.
            // @phpstan-ignore argument.type
            event(new Verified($user));
        }
    }
}
