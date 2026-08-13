<?php

namespace App\Actions\Users;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Str;

class UpdateUser
{
    /**
     * Update an existing user's name and, unless the target is the acting
     * user, their role and status.
     *
     * The email is never written here. When the normalised submitted
     * address differs from the user's current stored address, this
     * delegates to App\Actions\Users\RequestEmailChange, which parks it in
     * `pending_email` and mails the verification link to the new address —
     * `users.email`, `email_verified_at` and `status` are left exactly as
     * they were. This applies identically whether the target is another
     * user or the acting user's own row, so there is one email-change
     * mechanism in the app, not two.
     */
    public function __invoke(
        User $user,
        string $name,
        string $email,
        string $roleId,
        UserStatus $status,
        bool $applyRoleAndStatus,
        RequestEmailChange $requestEmailChange,
    ): User {
        // Defence in depth: the primary normalisation happens in the
        // component before validate() runs, so the uniqueness rule already
        // saw this lowercased value. Normalising again here keeps this
        // action correct even if a future caller skips that step.
        $email = Str::lower($email);

        $user->fill(['name' => $name]);

        if ($applyRoleAndStatus) {
            // Property assignment, not an array key, so the enum cast is
            // preserved rather than writing the raw backing string.
            $user->status = $status;
        }

        $user->save();

        if ($applyRoleAndStatus) {
            $user->syncRoles([(int) $roleId]);
        }

        $currentEmail = Str::lower((string) $user->getRawOriginal('email'));

        if ($email !== $currentEmail) {
            $requestEmailChange($user, $email);
        }

        return $user;
    }
}
