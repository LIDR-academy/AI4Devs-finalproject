<?php

namespace App\Actions\Users;

use App\Actions\Auth\EnsureRecentPasswordConfirmation;
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
     * Constructor injection, not method injection, for the same reason
     * App\Actions\Users\UpdateUser uses it (story 0015a): __invoke()'s four
     * domain arguments are this action's whole public signature, called
     * that way from both App\Livewire\Users\Index::createNewUser() and
     * every direct-call test, so the guard is resolved from the container
     * without widening that signature.
     */
    public function __construct(
        private readonly EnsureRecentPasswordConfirmation $ensureRecentPasswordConfirmation,
    ) {}

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
     *
     * Story 0015a, Phase 4 finding F1 (decision D6): creating an
     * Administrator-tier account additionally requires a recently confirmed
     * password. Deliberately narrow -- the guard fires only on the
     * Administrator branch below, immediately after that branch's own
     * `Gate::authorize('promoteToAdministrator', ...)` call, never before
     * it: a caller lacking `roles.manage-administrators` must always see the
     * permission refusal, never a re-confirmation prompt. Ordinary-role
     * creation reaches no step-up check at all.
     */
    public function __invoke(string $name, string $email, string $roleId, UserStatus $status): User
    {
        Gate::authorize('create', User::class);

        // Story 0015 finding F6 part 1: rate-limited at 10 attempts per
        // hour, keyed on the acting user's id (decision Q3 — one order of
        // magnitude above RequestEmailChange's 3/hour, scaled for a
        // legitimate bulk-onboarding workflow). Placed after the base
        // `create` Gate::authorize() above, so a caller lacking users.create
        // is refused without consuming quota, and before DB::transaction()
        // below, so no refused attempt ever opens one. This does NOT extend
        // to the Super Admin / Administrator-tier checks below (story
        // 0015a, Phase 4 re-audit finding N1): a role-assignment refusal or
        // a step-up refusal on the Administrator branch runs after this
        // limiter and does consume one attempt, same as it did before story
        // 0015a. Deliberately not changed here -- moving those checks above
        // the limiter would be a bigger, unrelated quota-semantics change,
        // and the refusal is still bounded (10/hour) either way.
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

            // Story 0015a, Phase 4 finding F1: only after the Gate call
            // immediately above, never before -- so an actor lacking
            // roles.manage-administrators always sees the permission
            // refusal rather than a re-confirmation prompt.
            ($this->ensureRecentPasswordConfirmation)();
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
