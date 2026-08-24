<?php

namespace App\Livewire\Users;

use App\Actions\Auth\EnsureRecentPasswordConfirmation;
use App\Actions\Users\CreateUser;
use App\Actions\Users\RequestEmailChange;
use App\Actions\Users\UpdateUser;
use App\Concerns\ProfileValidationRules;
use App\Concerns\UserValidationRules;
use App\Enums\UserStatus;
use App\Exceptions\PasswordConfirmationRequiredException;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Title;
use Livewire\Component;

/**
 * Backoffice Users screen: list, create, edit and delete.
 *
 * This is the single call site for the Users screen — it also wires the
 * delete and role-change actions. Access is gated on `users.view` (route
 * middleware, `mount()`), with per-action checks for `users.create` /
 * `users.edit` / `users.delete` / `roles.manage-administrators` re-checked
 * inside every mutating method, since Livewire 4's `PersistentMiddleware`
 * allowlist does not carry Spatie's `permission:` middleware — see
 * docs/architecture/authorization.md.
 */
#[Title('Users')]
class Index extends Component
{
    use ProfileValidationRules, UserValidationRules;

    /**
     * @var array<int, array{id: string, name: string, email: string, pendingEmail: string|null, role: string|null, status: UserStatus, canEdit: bool, canDelete: bool}>
     */
    #[Locked]
    public array $users = [];

    #[Locked]
    public ?string $editingUserId = null;

    #[Locked]
    public ?string $editingPendingEmail = null;

    #[Locked]
    public ?string $deletingUserId = null;

    public bool $showModal = false;

    public string $name = '';

    public string $email = '';

    /**
     * Never `null` -- an empty string is the "nothing chosen yet" sentinel for the create
     * form's role `<select>`. Livewire's wire:model sync assigns this property's dehydrated
     * value directly to the DOM select's `.value`; assigning the JS value `null` (rather than
     * `""`) desyncs a native `<select>`'s `selectedIndex` from its literal, disabled
     * `selected` placeholder option, so a later real pick that happens to match the browser's
     * resulting auto-selected option produces no `change` event and is silently dropped.
     */
    public string $roleId = '';

    /**
     * Defaults to `Inactive` (matching `users.status`'s own column default) rather than a
     * nullable "unset" state, for the same reason `$roleId` above is a plain string and not
     * `?string`: assigning a JS `null` into the status `<select>` corrupts its native
     * selection state, so this property must never actually be null while bound via
     * wire:model.
     *
     * A plain `string`, not `UserStatus` (story 0015 finding F8): Livewire's `EnumSynth`
     * hydrates a forged backing value via `$type::from($value)` during property hydration --
     * before `statusRules()`'s `Rule::enum(UserStatus::class)` ever runs -- so a typed enum
     * property let a forged value raise an unhandled `\ValueError` (or, for an empty string,
     * a `TypeError`) instead of failing validation cleanly. Never nullable: see the paragraph
     * above.
     */
    public string $status = UserStatus::Inactive->value;

    public bool $showDeleteModal = false;

    #[Locked]
    public string $deletingUserName = '';

    /**
     * Mount the component.
     *
     * `viewAny` is authorized here in addition to the route's `can:` middleware
     * because Livewire's `/livewire/update` endpoint is a separate entry point
     * that never runs route middleware — mounting the component directly (as
     * every `Livewire::test()` call does) must be denied on its own.
     */
    public function mount(): void
    {
        Gate::authorize('viewAny', User::class);

        $this->loadUsers();
    }

    /**
     * Open the create-user form with empty fields.
     *
     * Authorizes as its first statement (story 0015 finding F7): a
     * disclosure/UI-opening path, not only the mutating save(), per
     * docs/security/livewire-authorization.md's "gate every method that
     * mutates *or discloses*" rule.
     */
    public function openCreateModal(): void
    {
        Gate::authorize('create', User::class);

        $this->reset(['editingUserId', 'editingPendingEmail', 'name', 'email', 'roleId', 'status']);
        $this->showModal = true;
    }

    /**
     * Open the edit form prefilled with the target user's current values.
     *
     * This is a Livewire method call, not route-model binding, so
     * HasUuids::resolveRouteBindingQuery()'s Str::isUuid() short-circuit does
     * not apply here — a malformed or unknown id must fail on its own, which
     * User::findOrFail() already does by raising ModelNotFoundException when
     * the query returns no row.
     *
     * Authorizes with `updateSensitiveAttributes` for any *other* target,
     * unconditionally (story 0015 finding F7) — never a role-membership
     * check re-derived here, since `UserPolicy::updateSensitiveAttributes()`
     * already delegates to `update()` and then returns `true` outright for a
     * target that does not hold the Administrator role, so the unconditional
     * call is identical to `update` for an ordinary target and strictly
     * stronger for an Administrator-holding one. The check runs before any
     * of the target's attributes are copied into public component state,
     * because `pending_email` and `status` are exactly what
     * `UserPolicy` itself classifies as sensitive.
     *
     * The actor's own row is exempt (`$target->is(Auth::user())`) — an
     * identity check, not a role/tier lookup, mirroring the identical
     * exemption `App\Actions\Users\UpdateUser`'s `$isSelfEdit` already
     * applies at the write layer. `pending_email` and `status` are not
     * sensitive when disclosed to the row's own owner. See
     * docs/architecture/authorization.md for the full rule and its accepted
     * side effects.
     */
    public function openEditModal(string $userId): void
    {
        $target = User::findOrFail($userId);

        if (! $target->is(Auth::user())) {
            Gate::authorize('updateSensitiveAttributes', $target);
        }

        $currentRoleId = $target->roles()->value('roles.id');

        $this->editingUserId = $target->id;
        $this->editingPendingEmail = $target->pending_email;
        $this->name = $target->name;
        $this->email = $target->email;
        $this->roleId = $currentRoleId !== null ? (string) $currentRoleId : '';
        $this->status = $target->status->value;
        $this->showModal = true;
    }

    /**
     * Validate and persist the create or edit form.
     *
     * Authorization is the first statement of this method, and the email is
     * normalised to lowercase immediately after it and before validate()
     * runs — normalising only inside the actions would let the uniqueness
     * rule see a still-mixed-case value, letting a case-different duplicate
     * slip through on the sqlite test connection.
     */
    public function save(CreateUser $createUser, UpdateUser $updateUser, RequestEmailChange $requestEmailChange): void
    {
        $target = null;

        if ($this->editingUserId === null) {
            Gate::authorize('create', User::class);
        } else {
            $target = User::findOrFail($this->editingUserId);
            Gate::authorize('update', $target);
        }

        $this->email = Str::lower($this->email);

        $validated = $this->validate([
            ...$this->profileRules($this->editingUserId),
            'roleId' => $this->roleRules(),
            'status' => $this->statusRules(),
        ]);

        // Hydrated once, at this boundary (story 0015 finding F8): $status is transported as a
        // plain string so a forged value fails statusRules()'s Rule::enum() cleanly, but the
        // downstream actions still take a real UserStatus, and a validated string is guaranteed
        // to be one of its backing values by this point.
        $validated['status'] = UserStatus::from((string) $validated['status']);

        try {
            if ($target === null) {
                $this->createNewUser($createUser, $validated);
            } else {
                $this->updateExistingUser($updateUser, $requestEmailChange, $target, $validated);
            }
        } catch (PasswordConfirmationRequiredException) {
            // Story 0015a — a role/status/email change (or, on the create
            // path, an Administrator-tier creation -- Phase 4 finding F1)
            // reached the step-up guard. The modal is deliberately left open
            // (accepted UX wart, decision D4) rather than closed/reloaded:
            // the actor is being redirected away entirely, so there is
            // nothing to reset here. setIntendedUrl() is required because
            // this request is a POST to /livewire/update, not the GET
            // RequirePassword::redirectGuest() normally handles, so nothing
            // else populates `url.intended` for Fortify's post-confirmation
            // response to return to. $this->redirect() (not a bare
            // redirect()->route()) is what a Livewire action method needs to
            // turn into a real browser navigation.
            //
            // Phase 4 finding F4: logged before redirecting -- a step-up
            // refusal is the strongest available signal of a hijacked or
            // unattended session, and was previously invisible to the audit
            // trail story 0015's F5 established for this same class.
            // $target is null on the create path (the guard fired inside
            // CreateUser before any row existed), so the action/user_id
            // reflect whichever branch actually threw.
            Log::warning('Step-up password confirmation required', [
                'actor_id' => Auth::id(),
                'action' => $target === null ? 'users.create' : 'users.update',
                'user_id' => $target?->id,
            ]);

            redirect()->setIntendedUrl(route('users.index'));
            $this->redirect(route('password.confirm'));

            return;
        }

        $this->loadUsers();
        unset($this->usersSummary);

        $this->closeModal();
    }

    /**
     * Close the create/edit modal and reset its form fields.
     */
    public function closeModal(): void
    {
        $this->showModal = false;
        $this->reset(['editingUserId', 'editingPendingEmail', 'name', 'email', 'roleId', 'status']);
    }

    /**
     * Open the delete-confirmation modal for the target user.
     *
     * Authorizes as its first statement (story 0015 finding F7): a
     * disclosure/UI-opening path, not only the mutating deleteUser(). Unlike
     * openEditModal(), this gate carries **no** self-row exemption — see
     * deleteUser()'s docblock for why, and for how that interacts with F11's
     * self-delete no-op below.
     */
    public function confirmDelete(string $userId): void
    {
        $target = User::findOrFail($userId);

        Gate::authorize('delete', $target);

        $this->deletingUserId = $target->id;
        $this->deletingUserName = $target->name;
        $this->showDeleteModal = true;
    }

    /**
     * Authorize and delete the confirmed user.
     *
     * UserPolicy::delete() is the permission rule; the soft delete plus email
     * obfuscation (and password_reset_tokens revocation) happen via the
     * App\Models\User::delete() override added by story 0005.
     *
     * Self-delete is a no-op on the account (story 0015 finding F11): neither
     * UserPolicy::delete() nor its Gate::before Super Admin bypass stops an
     * actor from deleting their own account, so the guard lives here, as a
     * direct identity check rather than a Gate-mediated rule -- a
     * Gate-mediated rule would be undone by a Super Admin actor's own
     * Gate::before bypass, same reasoning as UpdateUser's Super Admin
     * guards. This is reachable only through confirmDelete() above (
     * $deletingUserId is #[Locked]), whose gate carries no self-row
     * exemption -- so an actor whose own row holds Administrator is already
     * refused there, with a visible AuthorizationException, before this
     * no-op ever gets a chance to fire. The no-op is therefore observable
     * only for an actor UserPolicy::delete() would otherwise allow to
     * delete their own row (a Super Admin, via Gate::before, or a
     * non-Administrator actor holding users.delete directly). It still
     * closes the delete-confirmation modal (Phase 5 finding A-1) so the
     * confirm click gets visible feedback rather than appearing frozen.
     *
     * Story 0015a: the step-up guard runs immediately after
     * Gate::authorize('delete', ...) and before $target->delete() -- never
     * before the Gate call, so an actor who lacks permission always sees the
     * permission refusal rather than a re-confirmation prompt. There is no
     * dedicated DeleteUser action to hang this on (this method calls
     * $target->delete() directly), so it is guarded here in the component,
     * matching the docblock above it.
     */
    public function deleteUser(EnsureRecentPasswordConfirmation $ensureRecentPasswordConfirmation): void
    {
        if ($this->deletingUserId === null) {
            return;
        }

        $target = User::findOrFail($this->deletingUserId);

        if ($target->is(Auth::user())) {
            // story 0015 Phase 5 finding A-1: the self-delete no-op above must
            // still close the modal -- otherwise $showDeleteModal /
            // $deletingUserId stay set and the confirm click appears to do
            // nothing, with no feedback that the no-op fired.
            $this->closeDeleteModal();

            return;
        }

        Gate::authorize('delete', $target);

        try {
            $ensureRecentPasswordConfirmation();
        } catch (PasswordConfirmationRequiredException) {
            // See save()'s identical catch block for why both
            // setIntendedUrl() and $this->redirect() are required here, and
            // for why the refusal is logged first (Phase 4 finding F4).
            Log::warning('Step-up password confirmation required', [
                'actor_id' => Auth::id(),
                'action' => 'users.delete',
                'user_id' => $target->id,
            ]);

            redirect()->setIntendedUrl(route('users.index'));
            $this->redirect(route('password.confirm'));

            return;
        }

        $targetId = $target->id;

        $target->delete();

        // Audit trail (story 0015 finding F5) -- this app has no dedicated
        // audit-log table; a structured log line is the minimum trace for
        // the highest-value mutation this screen performs. Mirrors the
        // shipped shape at App\Livewire\Roles\Index::deleteRole().
        Log::info('User deleted', [
            'actor_id' => Auth::id(),
            'user_id' => $targetId,
        ]);

        $this->loadUsers();
        unset($this->usersSummary);

        $this->closeDeleteModal();
    }

    /**
     * Close the delete-confirmation modal and reset its state.
     */
    public function closeDeleteModal(): void
    {
        $this->showDeleteModal = false;
        $this->reset(['deletingUserId', 'deletingUserName']);
    }

    /**
     * The header's total and active user counts, computed by a single
     * query — never from the loaded `$users` array.
     *
     * @return array{total: int, active: int}
     */
    #[Computed]
    public function usersSummary(): array
    {
        /** @var object{total: int|string, active: int|string} $counts */
        $counts = User::query()
            ->selectRaw('count(*) as total, count(case when status = ? then 1 end) as active', [UserStatus::Active->value])
            ->first();

        return [
            'total' => (int) $counts->total,
            'active' => (int) $counts->active,
        ];
    }

    /**
     * Whether the acting user's password confirmation is stale or absent —
     * the predicate the create/edit and delete modals' re-confirmation
     * notices are gated on (story 0015a). Reads
     * EnsureRecentPasswordConfirmation::isRecentlyConfirmed() rather than
     * re-deriving the session/config comparison here, so the warning shown
     * before the guard fires and the guard itself can never drift.
     */
    #[Computed]
    public function requiresPasswordConfirmation(): bool
    {
        return ! app(EnsureRecentPasswordConfirmation::class)->isRecentlyConfirmed();
    }

    /**
     * Whether the edit modal's currently open target is the actor's own row
     * (story 0015a, Phase 4 re-audit finding N6) — extracted here so the
     * check has exactly one spelling instead of being re-derived inline in
     * the view (which previously compared `$editingUserId !== auth()->id()`
     * directly). A self-edit reaches no step-up check at all, so this is
     * what the edit modal's re-confirmation notice is exempted on.
     *
     * Compares ids (`$editingUserId === Auth::id()`) rather than loading
     * `$target` and calling `$target->is(Auth::user())`, the idiom
     * `openEditModal()` and `UpdateUser`'s `$isSelfEdit` use — the two are
     * equivalent for this UUID-keyed model (`Model::is()` itself compares
     * `getKey()`, `getKeyName()` and the class), and comparing ids needs no
     * extra query since `$editingUserId` is already the value the modal was
     * opened with. Phase 5 re-audit finding F-5 flagged an earlier draft of
     * this docblock for claiming the `->is()` idiom was used verbatim when
     * it wasn't; corrected here rather than changed to match, since the
     * id comparison is the cheaper of the two equivalent checks.
     */
    #[Computed]
    public function isEditingOwnRow(): bool
    {
        return $this->editingUserId !== null && $this->editingUserId === Auth::id();
    }

    /**
     * Whether the delete modal's currently open target is the actor's own
     * row (story 0015a, Phase 4 re-audit finding N6). `deleteUser()` no-ops
     * silently on a self-target (story 0015's F11) rather than throwing
     * `PasswordConfirmationRequiredException`, so the delete modal's
     * re-confirmation notice must not claim that confirming will be
     * required on that row — it never reaches the guard at all. Same id
     * comparison as `isEditingOwnRow()` above, for the same reason.
     */
    #[Computed]
    public function isDeletingOwnRow(): bool
    {
        return $this->deletingUserId !== null && $this->deletingUserId === Auth::id();
    }

    /**
     * Whether the create form's currently selected role is Administrator-
     * tier — the second predicate the create form's re-confirmation notice
     * is gated on, alongside requiresPasswordConfirmation() above (story
     * 0015a, Phase 4 finding F1). Reads Role::isAdministratorRole() against
     * the resolved $roleId, the identical check CreateUser's own step-up
     * guard fires on, so the hint and the guard cannot drift. An empty or
     * unresolvable $roleId is never Administrator-tier.
     *
     * `isset($this->roleId)` rather than a bare property read: a forged
     * `->set('roleId', null)` against this non-nullable `string` property
     * (tests/Feature/Users/IndexTest.php's "no role chosen" validation
     * dataset does exactly this, to prove roleRules() rejects it) leaves
     * Livewire's synth unable to coerce the incoming `null` into the
     * declared `string` type, so it clears the property via reflection
     * rather than writing an invalid value -- an uninitialized *typed*
     * property, which is a distinct PHP state from "holds null". A direct
     * `$this->roleId` read in that state throws PHP's own
     * "must not be accessed before initialization" Error; `isset()` is the
     * one construct that observes that state without throwing, returning
     * `false` -- exactly the right answer here: no role is selected.
     *
     * Larastan (level 7) flags the `isset()` below as `isset.property`,
     * reasoning from the property's *declared* type (`string`, with a
     * default) that it can never be unset -- a correct read of the static
     * declaration that misses the runtime possibility above, which
     * tests/Feature/Users/IndexTest.php's "no role chosen" dataset proves
     * really happens. Suppressed rather than restructured, matching this
     * repo's existing precedent for a framework behaviour Larastan's stubs
     * do not model (see app/Listeners/RejectNonActiveUserLogin.php).
     */
    #[Computed]
    public function isAdministratorRoleSelected(): bool
    {
        // @phpstan-ignore isset.property
        if (! isset($this->roleId) || $this->roleId === '') {
            return false;
        }

        $role = Role::query()->find((int) $this->roleId);

        return $role !== null && Role::isAdministratorRole($role);
    }

    /**
     * The roles assignable from the create/edit form — the Super Admin role
     * is never offered, via the shared selectable() scope (story 0008)
     * rather than a hardcoded literal, so it moves with
     * config('auth.super_admin.role') instead of drifting from it.
     *
     * @return array<int, array{id: int, name: string}>
     */
    #[Computed]
    public function roleOptions(): array
    {
        return Role::query()
            ->where('guard_name', 'web')
            ->selectable()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Role $role): array => ['id' => (int) $role->id, 'name' => $role->name])
            ->all();
    }

    /**
     * Reload the users list from the database.
     *
     * Eager-loads `roles` and orders by `name ASC, id ASC` — the `id`
     * tiebreaker keeps the order deterministic when names collide, and is a
     * meaningful creation-order tiebreaker since `id` is a time-ordered
     * UUIDv7. The acting administrator's own row is not filtered out.
     *
     * `canDelete` mirrors `UserPolicy::delete()` (`Gate::allows()` runs the
     * same policy method deleteUser() authorizes with). `canEdit` (story
     * 0015 finding F7) is `true` for the actor's own row -- the same
     * identity exemption openEditModal() applies -- and otherwise
     * `Gate::allows('updateSensitiveAttributes', $user)`, the same,
     * unconditional ability openEditModal() authorizes any *other* target
     * against. So the row actions' disabled state matches what a click
     * would do for almost every actor/target combination: an
     * already-trashed target, or an Administrator-holding *other* target
     * edited without `roles.manage-administrators` (both `canEdit` and
     * `canDelete` now resolve to `false` for that combination, since
     * `updateSensitiveAttributes` requires that permission for an
     * Administrator-holding target), resolve to `false` here the same way
     * they would 403 there.
     *
     * One combination has drifted since story 0008a and is a known,
     * accepted gap rather than a bug to fix here: for a **Super Admin
     * actor** viewing a **Super Admin-holding target**, `Gate::allows()`
     * returns `true` (the `Gate::before` bypass grants it), so the row
     * renders enabled — but `App\Actions\Users\UpdateUser` /
     * `App\Livewire\Users\Index::deleteUser()` refuse that same actor on
     * the mutating path: `UpdateUser` via a direct, non-`Gate`-mediated
     * throw (deliberately outside `Gate`, since a Super Admin actor's own
     * bypass would undo a `Gate`-mediated refusal), `deleteUser()` still
     * only through `UserPolicy::delete()`'s policy-level exclusion (a
     * `Gate::before`-bypassed gap `UpdateUser`'s guard does not cover — see
     * docs/architecture/authorization.md's known limitations). The drift
     * only ever runs enabled-then-refused, never the reverse.
     */
    private function loadUsers(): void
    {
        $this->users = User::query()
            ->with('roles')
            ->orderBy('name')
            ->orderBy('id')
            ->get()
            ->map(function (User $user): array {
                /** @var Role|null $role */
                $role = $user->roles->first();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'pendingEmail' => $user->pending_email,
                    'role' => $role?->name,
                    'status' => $user->status,
                    'canEdit' => $user->is(Auth::user()) || Gate::allows('updateSensitiveAttributes', $user),
                    'canDelete' => Gate::allows('delete', $user),
                ];
            })
            ->all();
    }

    /**
     * Create the new user described by the create form.
     *
     * Administrator-role-assignment authorization lives in
     * App\Actions\Users\CreateUser itself (story 0008a) — the component no
     * longer duplicates it, so a future non-dashboard caller of the action
     * inherits the same guard.
     *
     * @param  array<string, mixed>  $validated
     */
    private function createNewUser(CreateUser $createUser, array $validated): void
    {
        $created = $createUser(
            (string) $validated['name'],
            (string) $validated['email'],
            (string) $validated['roleId'],
            $validated['status'],
        );

        // Audit trail (story 0015 finding F5) -- mirrors the shipped shape
        // at App\Livewire\Roles\Index::saveRole(). Never logs the generated
        // password or the invitation token, neither of which is available
        // here at all -- CreateUser generates and consumes both internally.
        Log::info('User created', [
            'actor_id' => Auth::id(),
            'user_id' => $created->id,
            'role' => $this->currentRoleName($created),
            'status' => $created->status->value,
        ]);
    }

    /**
     * Apply the edit form to the target user.
     *
     * Every piece of authorization this used to perform — the self-edit
     * guard, the promotion/downgrade gates, and the sensitive-attribute gate
     * for a status or email change on another Administrator-holding user
     * (security audit finding F1, Phase 4, story 0004) — lives in
     * App\Actions\Users\UpdateUser itself now (story 0008a), so the
     * component only submits the form.
     *
     * @param  array<string, mixed>  $validated
     */
    private function updateExistingUser(UpdateUser $updateUser, RequestEmailChange $requestEmailChange, User $target, array $validated): void
    {
        // Captured BEFORE the write (story 0015 finding F5): $updateUser()
        // mutates this same $target instance in place, so reading these
        // after the call would report the new values as the "before" ones
        // -- the same reason App\Livewire\Roles\Index::saveRole() captures
        // $beforePermissionNames above its own sync.
        $beforeRole = $this->currentRoleName($target);
        $beforeStatus = $target->getRawOriginal('status');

        // Story 0015 Phase 4 re-audit finding F-B: whether this edit
        // requested an email change at all -- not the new address itself,
        // which UpdateUser never writes to `users.email` synchronously
        // (RequestEmailChange only parks it in `pending_email`), so there is
        // no "after" value to log yet. UserPolicy::updateSensitiveAttributes()
        // classifies an email rewrite as severity-equivalent to account
        // takeover, and the delete path below is already logged -- an
        // "User updated" line silent on this was the highest-value mutation
        // this screen performs going unrepresented in the only audit trail
        // this app has. Compared the same way UpdateUser's own
        // authorizeRoleAndStatusChange() compares it (Str::lower() both
        // sides, against getRawOriginal() rather than a possibly-mutated
        // in-memory attribute), matching $beforeStatus's use of
        // getRawOriginal() above -- and computed here, above the write, for
        // the identical reason: nothing about `users.email` changes as a
        // side effect of the call below, but reading it in the same place
        // as every other "before" value keeps the audit-log block's ordering
        // uniform rather than making this one field an exception.
        $emailChanged = Str::lower((string) $validated['email']) !== Str::lower((string) $target->getRawOriginal('email'));

        $updateUser(
            $target,
            (string) $validated['name'],
            (string) $validated['email'],
            (string) $validated['roleId'],
            $validated['status'],
            $requestEmailChange,
        );

        // Audit trail (story 0015 finding F5). Never logs an email-change
        // verification token or the submitted/new address itself -- neither
        // this method nor UpdateUser ever holds a token, and the address is
        // not yet the account's real email (it is only ever parked in
        // `pending_email` until its own confirmation link is used); only
        // whether a change was requested (F-B) is logged.
        Log::info('User updated', [
            'actor_id' => Auth::id(),
            'user_id' => $target->id,
            'role_before' => $beforeRole,
            'role_after' => $this->currentRoleName($target),
            'status_before' => $beforeStatus,
            'status_after' => $target->status->value,
            'email_change_requested' => $emailChanged,
        ]);
    }

    /**
     * The name of the given user's single current role, or null when
     * roleless -- a typed helper so callers reading it for the audit log
     * above don't each need their own @var Role|null hint (matching
     * loadUsers()'s existing pattern for the same relation).
     */
    private function currentRoleName(User $user): ?string
    {
        /** @var Role|null $role */
        $role = $user->roles->first();

        return $role?->name;
    }
}
