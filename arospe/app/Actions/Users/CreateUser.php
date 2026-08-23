<?php

namespace App\Actions\Users;

use App\Enums\UserStatus;
use App\Models\Role;
use App\Models\User;
use App\Notifications\UserInvitation;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
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
     *
     * Authorizes the whole operation itself (story 0008a, hardened after its
     * own Phase 4 finding F1) — this is a caller-independent guard, not only
     * App\Livewire\Users\Index's: a future API endpoint, Artisan command or
     * queued job calling this action directly is refused exactly as the
     * dashboard is. `Gate::authorize('create', ...)` covers the base
     * `users.create` ability; the Super Admin role can never be assigned
     * through this action, by anyone, since no ability grants that (F1); the
     * Administrator role additionally requires `promoteToAdministrator`.
     */
    public function __invoke(string $name, string $email, string $roleId, UserStatus $status): User
    {
        Gate::authorize('create', User::class);

        // Story 0015 finding F6 part 1: rate-limited at 10 attempts per
        // hour, keyed on the acting user's id (decision Q3 — one order of
        // magnitude above RequestEmailChange's 3/hour, scaled for a
        // legitimate bulk-onboarding workflow). Placed after
        // Gate::authorize() above, so an unauthorized caller is refused
        // without consuming quota, and before DB::transaction() below, so
        // no refused attempt ever opens one.
        if (! RateLimiter::attempt('users-create:'.Auth::id(), maxAttempts: 10, callback: fn (): bool => true, decaySeconds: 3600)) {
            throw ValidationException::withMessages([
                'email' => trans('users.create.throttled'),
            ]);
        }

        // Defence in depth: the primary normalisation happens in the
        // component before validate() runs, so the uniqueness rule already
        // saw this lowercased value. Normalising again here keeps this
        // action correct even if a future caller skips that step.
        $email = Str::lower($email);

        $submittedRole = Role::query()->find((int) $roleId);

        if ($submittedRole !== null && Role::isSuperAdminRoleRow($submittedRole)) {
            throw new AuthorizationException('The Super Admin role cannot be assigned.');
        }

        if ($submittedRole !== null && Role::isAdministratorRole($submittedRole)) {
            // Class-level: no target exists yet on the create path, which is
            // why UserPolicy::promoteToAdministrator()'s $target parameter
            // defaults to null.
            Gate::authorize('promoteToAdministrator', User::class);
        }

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
