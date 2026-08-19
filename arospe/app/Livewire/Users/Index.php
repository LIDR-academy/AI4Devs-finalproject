<?php

namespace App\Livewire\Users;

use App\Actions\Users\CreateUser;
use App\Actions\Users\RequestEmailChange;
use App\Actions\Users\UpdateUser;
use App\Concerns\ProfileValidationRules;
use App\Concerns\UserValidationRules;
use App\Enums\UserStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
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
     */
    public UserStatus $status = UserStatus::Inactive;

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
     */
    public function openCreateModal(): void
    {
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
     */
    public function openEditModal(string $userId): void
    {
        $target = User::findOrFail($userId);

        $currentRoleId = $target->roles()->value('roles.id');

        $this->editingUserId = $target->id;
        $this->editingPendingEmail = $target->pending_email;
        $this->name = $target->name;
        $this->email = $target->email;
        $this->roleId = $currentRoleId !== null ? (string) $currentRoleId : '';
        $this->status = $target->status;
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

        if ($target === null) {
            $this->createNewUser($createUser, $validated);
        } else {
            $this->updateExistingUser($updateUser, $requestEmailChange, $target, $validated);
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
     */
    public function confirmDelete(string $userId): void
    {
        $target = User::findOrFail($userId);

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
     */
    public function deleteUser(): void
    {
        if ($this->deletingUserId === null) {
            return;
        }

        $target = User::findOrFail($this->deletingUserId);

        Gate::authorize('delete', $target);

        $target->delete();

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
     * `canEdit`/`canDelete` mirror `UserPolicy::update()`/`delete()`
     * (`Gate::allows()` runs the same policy method `save()`/`deleteUser()`
     * authorize with), so the row actions' disabled state matches what a
     * click would do for almost every actor/target combination — an
     * already-trashed target, or an Administrator-holding target edited
     * without `roles.manage-administrators` (delete only; `canEdit` needs
     * only `users.edit`), both resolve to `false` here the same way they
     * would 403 there.
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
                    'canEdit' => Gate::allows('update', $user),
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
        $createUser(
            (string) $validated['name'],
            (string) $validated['email'],
            (string) $validated['roleId'],
            $validated['status'],
        );
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
        $updateUser(
            $target,
            (string) $validated['name'],
            (string) $validated['email'],
            (string) $validated['roleId'],
            $validated['status'],
            $requestEmailChange,
        );
    }
}
