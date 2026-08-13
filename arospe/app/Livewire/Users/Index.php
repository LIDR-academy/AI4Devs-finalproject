<?php

namespace App\Livewire\Users;

use App\Actions\Users\CreateUser;
use App\Actions\Users\RequestEmailChange;
use App\Actions\Users\UpdateUser;
use App\Concerns\ProfileValidationRules;
use App\Concerns\UserValidationRules;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Title;
use Livewire\Component;
use Spatie\Permission\Models\Role;

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
     * @var array<int, array{id: string, name: string, email: string, pendingEmail: string|null, role: string|null, status: UserStatus}>
     */
    public array $users = [];

    #[Locked]
    public ?string $editingUserId = null;

    #[Locked]
    public ?string $deletingUserId = null;

    public bool $showModal = false;

    public string $name = '';

    public string $email = '';

    public ?string $roleId = null;

    public ?UserStatus $status = null;

    public bool $showDeleteModal = false;

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
        $this->reset(['editingUserId', 'name', 'email', 'roleId', 'status']);
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
        $this->name = $target->name;
        $this->email = $target->email;
        $this->roleId = $currentRoleId !== null ? (string) $currentRoleId : null;
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
        $this->reset(['editingUserId', 'name', 'email', 'roleId', 'status']);
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
     * This story's UserPolicy::delete() is the minimal permission rule; the
     * semantics of what User::delete() does (soft delete plus email
     * obfuscation) are story 0005's — until it lands this is a hard delete.
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
     * is never offered.
     *
     * @return array<int, array{id: int, name: string}>
     */
    #[Computed]
    public function roleOptions(): array
    {
        return Role::query()
            ->where('guard_name', 'web')
            ->whereNot('name', 'Super Admin')
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
                ];
            })
            ->all();
    }

    /**
     * Authorize and create the new user described by the create form.
     *
     * @param  array<string, mixed>  $validated
     */
    private function createNewUser(CreateUser $createUser, array $validated): void
    {
        if ((int) $validated['roleId'] === $this->administratorRoleId()) {
            // Class-level: no target exists yet on the create path, which is
            // why UserPolicy::promoteToAdministrator()'s $target parameter
            // must default to null.
            Gate::authorize('promoteToAdministrator', User::class);
        }

        $createUser(
            (string) $validated['name'],
            (string) $validated['email'],
            (string) $validated['roleId'],
            $validated['status'],
        );
    }

    /**
     * Authorize (when needed) and apply the edit form to the target user.
     *
     * Role and status are applied only when the target is not the acting
     * user — this is the self-edit guard that prevents self-lockout. The
     * email always goes through UpdateUser, which decides on its own
     * whether it changed.
     *
     * A status or email change on another Administrator-holding user
     * requires roles.manage-administrators, same as a role change: both
     * achieve the same effect a role/delete guard exists to prevent —
     * suspending or seizing an Administrator's account. Security audit
     * finding F1 (Phase 4, story 0004). Scoped to $applyRoleAndStatus (i.e.
     * another user, not a self-edit): an Administrator changing their own
     * email carries no such risk and needs no extra permission.
     *
     * @param  array<string, mixed>  $validated
     */
    private function updateExistingUser(UpdateUser $updateUser, RequestEmailChange $requestEmailChange, User $target, array $validated): void
    {
        $applyRoleAndStatus = ! $target->is(Auth::user());

        if ($applyRoleAndStatus) {
            $this->authorizeRoleChange($target, (int) $validated['roleId']);

            $emailChanged = Str::lower((string) $validated['email']) !== Str::lower((string) $target->getRawOriginal('email'));
            $statusChanged = $validated['status'] !== $target->status;

            if ($emailChanged || $statusChanged) {
                Gate::authorize('updateSensitiveAttributes', $target);
            }
        }

        $updateUser(
            $target,
            (string) $validated['name'],
            (string) $validated['email'],
            (string) $validated['roleId'],
            $validated['status'],
            $applyRoleAndStatus,
            $requestEmailChange,
        );
    }

    /**
     * Authorize an in-flight role change against the Administrator-level
     * guards, comparing the submitted role against a fresh read of the
     * target's current role — a query, not the (possibly stale) cached
     * relation.
     *
     * A no-op re-save (the role is unchanged) is neither a promotion nor a
     * downgrade and needs no extra gate; an unrelated role change (neither
     * side is Administrator) is likewise unaffected.
     */
    private function authorizeRoleChange(User $target, int $newRoleId): void
    {
        $currentRoleId = $target->roles()->value('roles.id');
        $currentRoleId = $currentRoleId !== null ? (int) $currentRoleId : null;

        if ($currentRoleId === $newRoleId) {
            return;
        }

        $administratorRoleId = $this->administratorRoleId();
        $wasAdministrator = $currentRoleId === $administratorRoleId;
        $willBeAdministrator = $newRoleId === $administratorRoleId;

        if ($willBeAdministrator && ! $wasAdministrator) {
            Gate::authorize('promoteToAdministrator', $target);
        } elseif ($wasAdministrator && ! $willBeAdministrator) {
            Gate::authorize('downgrade', $target);
        }
    }

    /**
     * The seeded Administrator role's id, read fresh on every call.
     */
    private function administratorRoleId(): ?int
    {
        return Role::query()
            ->where('name', 'Administrator')
            ->where('guard_name', 'web')
            ->value('id');
    }
}
