<?php

namespace App\Actions\Users;

use App\Enums\RoleName;
use App\Enums\UserStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
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
     *
     * Authorizes the whole operation itself (story 0008a, hardened after its
     * own Phase 4 findings F1/N1/N2) — a caller-independent guard, not only
     * App\Livewire\Users\Index's. `Gate::authorize('update', $user)` covers
     * both the base `users.edit` ability and the Super Admin-target
     * exclusion, and runs unconditionally — including on a self-edit, same
     * as the dashboard's own `save()` — so a name-only edit can no longer
     * reach a write with no authorization check at all. The self-edit guard
     * that scopes role/status writes is derived here from the authenticated
     * user rather than accepted as a caller-supplied flag: once this action
     * is independently callable, a boolean parameter is a one-argument
     * bypass of the self-lockout protection.
     *
     * `$user->load('roles')` is the very first statement, above even
     * `Gate::authorize('update', ...)` — re-audit finding N1: that Gate call
     * resolves `UserPolicy::update()`'s Super Admin-target exclusion via
     * `$target->hasRole()`, which reads whatever roles collection is
     * already loaded on the instance. A caller that hydrated `$user` with
     * `->with('roles')` before invoking this action (the natural idiom, and
     * what App\Livewire\Users\Index::loadUsers() already does elsewhere in
     * this same component) could otherwise hand it a stale collection and
     * evade that exclusion. Reloading before any authorization check
     * consults the relation closes that for every check below, not only
     * the role-tier ones.
     */
    public function __invoke(
        User $user,
        string $name,
        string $email,
        string $roleId,
        UserStatus $status,
        RequestEmailChange $requestEmailChange,
    ): User {
        $user->load('roles');

        Gate::authorize('update', $user);

        // Defence in depth: the primary normalisation happens in the
        // component before validate() runs, so the uniqueness rule already
        // saw this lowercased value. Normalising again here keeps this
        // action correct even if a future caller skips that step.
        $email = Str::lower($email);

        $isSelfEdit = Auth::user()?->is($user) ?? false;

        if (! $isSelfEdit) {
            $this->authorizeRoleAndStatusChange($user, $roleId, $email, $status);
        }

        DB::transaction(function () use ($user, $name, $status, $roleId, $isSelfEdit): void {
            $user->fill(['name' => $name]);

            if (! $isSelfEdit) {
                // Property assignment, not an array key, so the enum cast is
                // preserved rather than writing the raw backing string.
                $user->status = $status;
            }

            $user->save();

            if (! $isSelfEdit) {
                $user->syncRoles([(int) $roleId]);
            }
        });

        $currentEmail = Str::lower((string) $user->getRawOriginal('email'));

        if ($email !== $currentEmail) {
            $requestEmailChange($user, $email);
        }

        return $user;
    }

    /**
     * Authorize an in-flight role/status/email change against the
     * Administrator-level guards, before any write.
     *
     * The target's role was already loaded fresh by __invoke() (never the
     * possibly-stale cached relation), then read the same way both here and
     * in App\Policies\UserPolicy — `$user->hasRole()` / `$user->roles`, over
     * the whole roles collection — rather than by comparing a single
     * arbitrarily-chosen row, so the two cannot disagree for a target
     * holding more than one role (Phase 4 finding F3). The no-op re-save
     * exemption is likewise a set comparison (the submitted role is the
     * target's only current role), not an unordered `first()`.
     *
     * The submitted role is resolved as a fully-hydrated row — never an
     * id-to-id comparison against a name lookup — and handed to
     * Role::isAdministratorRole() / isSuperAdminRoleRow(), the single shared
     * identity checks. Both directions of the Super Admin tier are refused
     * outright, as **direct throws, never through `Gate`**: a `Gate`-based
     * refusal is undone by a Super Admin actor's own `Gate::before` bypass,
     * which decides before any policy method runs. Assigning the Super
     * Admin role is refused (Phase 4 finding F1); so is modifying a target
     * that *currently holds* it (Phase 4 re-audit finding N2) — the
     * user-side mirror of the role-side guards App\Models\Role::
     * syncModels() / assignToModels() / removeFromModels() already carry,
     * which exist for the identical reason: `syncRoles()` below replaces
     * the target's entire role set, and stripping the platform's own Super
     * Admin this way would be an irrecoverable lockout.
     */
    private function authorizeRoleAndStatusChange(User $user, string $roleId, string $email, UserStatus $status): void
    {
        /** @var Collection<int, Role> $currentRoles */
        $currentRoles = $user->roles;

        if ($currentRoles->contains(fn (Role $role): bool => Role::isSuperAdminRoleRow($role))) {
            throw new AuthorizationException('A Super Admin holder cannot be modified through this action.');
        }

        $submittedRole = Role::query()->find((int) $roleId);

        if ($submittedRole !== null && Role::isSuperAdminRoleRow($submittedRole)) {
            throw new AuthorizationException('The Super Admin role cannot be assigned.');
        }

        $currentRoleIds = $currentRoles->pluck('id')->map(fn (mixed $id): int => (int) $id)->all();
        $isNoOpRoleChange = $currentRoleIds === [(int) $roleId];

        if (! $isNoOpRoleChange) {
            $wasAdministrator = $user->hasRole(RoleName::Administrator->value, 'web');
            $willBeAdministrator = $submittedRole !== null && Role::isAdministratorRole($submittedRole);

            if ($willBeAdministrator && ! $wasAdministrator) {
                Gate::authorize('promoteToAdministrator', $user);
            } elseif ($wasAdministrator && ! $willBeAdministrator) {
                Gate::authorize('downgrade', $user);
            }
        }

        // Compared against the PERSISTED status, never the in-memory
        // attribute (Phase 4 finding F2): a caller that already staged
        // $user->status = $status before invoking this action would
        // otherwise make this comparison silently false, skipping the gate
        // for a status change that is about to be persisted regardless.
        $emailChanged = $email !== Str::lower((string) $user->getRawOriginal('email'));
        $statusChanged = $status->value !== $user->getRawOriginal('status');

        if ($emailChanged || $statusChanged) {
            Gate::authorize('updateSensitiveAttributes', $user);
        }
    }
}
