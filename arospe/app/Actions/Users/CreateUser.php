<?php

namespace App\Actions\Users;

use App\Enums\UserStatus;
use App\Models\User;
use App\Notifications\UserInvitation;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateUser
{
    /**
     * Provision a new administrator-created user account.
     *
     * The address goes straight into `users.email`, unverified — it is the
     * account's initial address, not a change, so App\Actions\Users\
     * RequestEmailChange's pending-email mechanism does not apply here. The
     * invitation link is what proves the mailbox; completing it verifies the
     * address and activates the account through App\Listeners\
     * ActivateVerifiedUser.
     */
    public function __invoke(string $name, string $email, string $roleId, UserStatus $status): User
    {
        // Defence in depth: the primary normalisation happens in the
        // component before validate() runs, so the uniqueness rule already
        // saw this lowercased value. Normalising again here keeps this
        // action correct even if a future caller skips that step.
        $email = Str::lower($email);

        try {
            $user = DB::transaction(function () use ($name, $email, $roleId, $status): User {
                // Literal whitelist, never a spread of validated input:
                // Model::preventSilentlyDiscardingAttributes() is not enabled
                // anywhere in app/Providers/, so User::create([...'status' =>
                // ...]) would silently drop `status` (deliberately absent
                // from #[Fillable]) and fall back to the column default
                // `inactive` instead of raising an error.
                $user = User::forceCreate([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make(Str::password(32)),
                    'status' => $status,
                    'email_verified_at' => null,
                ]);

                $user->syncRoles([(int) $roleId]);

                // Sent after commit, so a syncRoles() failure doesn't leave
                // an invitation already sent against a rolled-back user.
                DB::afterCommit(function () use ($user, $email): void {
                    $token = Password::broker()->createToken($user);

                    $user->notify(new UserInvitation($token, $email));
                });

                return $user;
            });
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                throw ValidationException::withMessages([
                    'email' => trans('validation.unique', ['attribute' => 'email']),
                ]);
            }

            throw $e;
        }

        return $user;
    }
}
