<?php

namespace App\Livewire\Roles;

use App\Actions\Roles\EnforceAdministratorPermissionGrant;
use App\Concerns\RoleValidationRules;
use App\Models\Role;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Title;
use Livewire\Component;
use Spatie\Permission\Models\Permission;

/**
 * Backoffice Roles & Permissions management screen: create, rename and
 * delete custom roles, and sync each role's per-module permission set.
 *
 * Class name and namespace are shared with sibling story 0011, which owns
 * the paired Blade view (resources/views/livewire/roles/index.blade.php)
 * and the component's UI-state properties; this story owns every query,
 * mutation, validation rule and authorization decision. Access is gated on
 * `roles.manage` (route middleware, `mount()`), with `App\Policies\RolePolicy`
 * re-checked as the first statement of every method that mutates or
 * discloses — Livewire 4's `PersistentMiddleware` allowlist does not carry
 * Spatie's `permission:` middleware, so route middleware alone does not
 * protect `/livewire/update` round-trips. See docs/architecture/authorization.md.
 */
#[Title('Roles & permissions')]
class Index extends Component
{
    use RoleValidationRules;

    public string $name = '';

    /** @var array<int, int> */
    public array $selectedPermissionIds = [];

    #[Locked]
    public ?int $editingRoleId = null;

    #[Locked]
    public ?int $deletingRoleId = null;

    /**
     * Passthrough for story 0011's toggle visibility -- computed once in
     * mount() from the Gate ability App\Actions\Roles\EnforceAdministratorPermissionGrant
     * (story 0009) enforces server-side. This property decides nothing on
     * its own; the action re-derives and re-authorizes independently on
     * every saveRole() call, so a stale value here can only hide or show a
     * control, never grant or deny anything.
     */
    #[Locked]
    public bool $canGrantAdministratorLevel = false;

    public bool $showModal = false;

    public bool $showDeleteModal = false;

    #[Locked]
    public string $deletingRoleName = '';

    /**
     * Mount the component.
     *
     * `viewAny` is authorized here in addition to the route's `can:`
     * middleware because Livewire's `/livewire/update` endpoint is a
     * separate entry point that never runs route middleware — mounting the
     * component directly (as every `Livewire::test()` call does) must be
     * denied on its own.
     */
    public function mount(): void
    {
        Gate::authorize('viewAny', Role::class);

        $this->canGrantAdministratorLevel = Gate::allows('grantAdministratorPermission', Role::class);
    }

    /**
     * Open the create-role form with empty fields.
     */
    public function openCreateModal(): void
    {
        $this->reset(['editingRoleId', 'name', 'selectedPermissionIds']);
        $this->showModal = true;
    }

    /**
     * Open the edit form prefilled with the target role's current name and
     * permission set.
     *
     * A disclosure path, not a mutation, so it authorizes independently of
     * saveRole() rather than trusting that a later save-time check is
     * enough — per docs/security/livewire-authorization.md, every method
     * that mutates *or discloses* re-authorizes as its first statement.
     */
    public function openEditModal(int $roleId): void
    {
        $role = Role::query()->with('permissions')->findOrFail($roleId);

        Gate::authorize('update', $role);

        $this->editingRoleId = $role->id;
        $this->name = $role->name;
        $this->selectedPermissionIds = $role->permissions->pluck('id')->all();
        $this->showModal = true;
    }

    /**
     * Validate and persist the create or edit form.
     *
     * Authorization is the first statement of this method. The name is
     * trimmed immediately afterwards and before validate() runs -- a
     * Livewire property update never passes through the `TrimStrings`
     * middleware a normal HTTP request body does, so trimming only inside
     * the validation rule would let the uniqueness check see a
     * still-padded value.
     */
    public function saveRole(EnforceAdministratorPermissionGrant $enforceAdministratorPermissionGrant): void
    {
        if ($this->editingRoleId === null) {
            Gate::authorize('create', Role::class);
            $role = null;
        } else {
            $role = Role::query()->findOrFail($this->editingRoleId);
            Gate::authorize('update', $role);
        }

        $this->name = trim($this->name);

        $validated = $this->validate([
            'name' => $this->roleNameRules($this->editingRoleId),
            ...$this->rolePermissionRules(),
        ]);

        // Ids in, NAMES out -- EnforceAdministratorPermissionGrant (story
        // 0009) takes names. Safe to resolve after validate(): every id has
        // already passed Rule::exists('permissions', 'id')->where('guard_name',
        // 'web'), so a forged id never reaches this lookup.
        $permissionNames = Permission::query()
            ->whereIn('id', $validated['selectedPermissionIds'])
            ->pluck('name')
            ->all();

        // $role is already in scope from the branch above -- null on
        // create, the fully-hydrated row on update. The action reads the
        // "before" state from it directly and throws AuthorizationException
        // (403) on a genuine new grant a non-Super-Admin actor attempts;
        // it neither strips the permission nor re-implements the rule here
        // (human-confirmed decision, story 0009).
        $permissionNames = $enforceAdministratorPermissionGrant(Auth::user(), $permissionNames, $role);

        // G2 (this story's Phase 1/3 decision, see the task file's open
        // question G): the action stays a pure transformer; this method is
        // the sole writer. The same $role instance authorized above -- or
        // the row just created below -- is the one syncPermissions() is
        // finally called on, never a second, independently-fetched instance.
        if ($role === null) {
            $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);
        } else {
            $role->update(['name' => $validated['name']]);
        }

        $role->syncPermissions($permissionNames);

        unset($this->roles);

        $this->closeModal();
    }

    /**
     * Close the create/edit modal and reset its form fields.
     */
    public function closeModal(): void
    {
        $this->showModal = false;
        $this->reset(['editingRoleId', 'name', 'selectedPermissionIds']);
    }

    /**
     * Open the delete-confirmation modal for the target role.
     *
     * A disclosure path (the target's name), so it authorizes independently
     * of deleteRole() -- same reasoning as openEditModal() above.
     */
    public function confirmDeleteRole(int $roleId): void
    {
        $role = Role::query()->findOrFail($roleId);

        Gate::authorize('delete', $role);

        $this->deletingRoleId = $role->id;
        $this->deletingRoleName = $role->name;
        $this->showDeleteModal = true;
    }

    /**
     * Authorize and delete the confirmed role.
     *
     * Hard-blocked while the role still has holders -- no confirm-and-proceed
     * path exists. The holder count is read off the same `withCount('users')`
     * query used for the block, so the count in the refusal message can
     * never disagree with the query that decided to refuse. Defense in
     * depth: App\Models\Role's own `deleting` guard throws
     * RoleInUseException for any future call site that bypasses this method.
     */
    public function deleteRole(): void
    {
        if ($this->deletingRoleId === null) {
            return;
        }

        $role = Role::query()->withCount('users')->findOrFail($this->deletingRoleId);

        Gate::authorize('delete', $role);

        if ($role->users_count > 0) {
            throw ValidationException::withMessages([
                'deletingRoleId' => trans_choice('roles.index.delete_blocked', $role->users_count, ['count' => $role->users_count]),
            ]);
        }

        $role->delete();

        unset($this->roles);

        $this->closeDeleteModal();
    }

    /**
     * Close the delete-confirmation modal and reset its state.
     */
    public function closeDeleteModal(): void
    {
        $this->showDeleteModal = false;
        $this->reset(['deletingRoleId', 'deletingRoleName']);
    }

    /**
     * The roles list -- the Super Admin role is never included, via 0008's
     * shared `selectable()` scope rather than a hardcoded exclusion, so it
     * moves with `config('auth.super_admin.role')` instead of drifting from
     * it. `withCount('users')` serves both the listing's holder badge and
     * `deleteRole()`'s block check off the same query shape; `permissions`
     * is eager-loaded so the list can render each role's granted modules
     * without an N+1.
     *
     * @return EloquentCollection<int, Role>
     */
    #[Computed]
    public function roles(): EloquentCollection
    {
        return Role::query()
            ->selectable()
            ->with('permissions')
            ->withCount('users')
            ->orderBy('name')
            ->get();
    }

    /**
     * The full `web`-guard permission catalog, for the create/edit form's
     * permission checkboxes.
     *
     * @return EloquentCollection<int, Permission>
     */
    #[Computed]
    public function permissionOptions(): EloquentCollection
    {
        return Permission::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->get(['id', 'name']);
    }
}
