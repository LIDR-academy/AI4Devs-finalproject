<?php

namespace App\Livewire\Roles;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\Roles\EnforceAdministratorPermissionGrant;
use App\Actions\Roles\EnforceGrantorPermissionScope;
use App\Concerns\RoleValidationRules;
use App\Models\Role;
use App\Policies\RolePolicy;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Title;
use Livewire\Component;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

/**
 * Backoffice Roles & Permissions management screen: create, rename and
 * delete custom roles, and sync each role's per-module permission set.
 *
 * Class name and namespace are shared with sibling story 0011, which owns
 * the paired Blade view (resources/views/livewire/roles.blade.php) and the
 * component's UI-state properties; this story owns every query, mutation,
 * validation rule and authorization decision. Access is gated on
 * `roles.manage` (route middleware, `mount()`), with `App\Policies\RolePolicy`
 * re-checked as the first statement of every method that mutates or
 * discloses — Livewire 4's `PersistentMiddleware` allowlist does not carry
 * Spatie's `permission:` middleware, so route middleware alone does not
 * protect `/livewire/update` round-trips. See docs/architecture/authorization.md.
 *
 * Every role resolution and the listing below are scoped to
 * `guard_name = 'web'`, matching the validation rules in
 * App\Concerns\RoleValidationRules -- story 0010 Phase 4 security audit
 * finding F5: this app defines only the `web` guard today, so this is
 * defense in depth rather than a live gap, but leaving resolution unscoped
 * while validation is scoped would let a rename pass validation and then
 * hit the composite unique index as a raw, unhandled 23000.
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
     *
     * Deliberately left unlogged by story 0015b (Phase 4 finding F-2), unlike
     * every other `Gate::authorize()` call in this class: the route's own
     * `can:roles.manage` gate checks the identical ability `viewAny()` does,
     * and `can:` — unlike `permission:` — IS on Livewire's
     * `PersistentMiddleware` allow-list, so a real HTTP actor who would fail
     * this check is refused by the route before ever reaching `mount()`. A
     * refusal here is therefore unreachable over HTTP; logging it would only
     * ever fire from a `Livewire::test()` call that mounts the component
     * directly.
     *
     * If `viewAny()` ever gains a condition the route's own `can:` ability
     * does not check, this refusal becomes reachable over HTTP and must be
     * logged.
     */
    public function mount(): void
    {
        Gate::authorize('viewAny', Role::class);

        $this->canGrantAdministratorLevel = Gate::allows('grantAdministratorPermission', Role::class);
    }

    /**
     * Open the create-role form with empty fields.
     *
     * Authorizes even though it neither mutates nor discloses anything
     * (saveRole() gates the actual write) -- kept for consistency with
     * every other public method in this file authorizing as its first
     * statement, so a future reader never has to reason about which
     * methods are the one exception.
     */
    public function openCreateModal(LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('create', Role::class);

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
    public function openEditModal(int $roleId, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $role = Role::query()->where('guard_name', 'web')->with('permissions')->findOrFail($roleId);

        $logRefusedPrivilegedAttempt->authorize('update', $role);

        $this->editingRoleId = (int) $role->id;
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
    public function saveRole(
        EnforceGrantorPermissionScope $enforceGrantorPermissionScope,
        EnforceAdministratorPermissionGrant $enforceAdministratorPermissionGrant,
        LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ): void {
        if ($this->editingRoleId === null) {
            $logRefusedPrivilegedAttempt->authorize('create', Role::class);
            $role = null;
        } else {
            $role = Role::query()->where('guard_name', 'web')->findOrFail($this->editingRoleId);
            $logRefusedPrivilegedAttempt->authorize('update', $role);
        }

        $this->name = trim($this->name);

        $validated = $this->validate([
            'name' => $this->roleNameRules($this->editingRoleId),
            ...$this->rolePermissionRules(),
        ]);

        // Ids in, NAMES out -- both transformer actions below take names.
        // Safe to resolve after validate(): every id has already passed
        // Rule::exists('permissions', 'id')->where('guard_name', 'web'), so
        // a forged id never reaches this lookup.
        $permissionNames = Permission::query()
            ->whereIn('id', $validated['selectedPermissionIds'])
            ->pluck('name')
            ->all();

        // Captured before either transformer runs, purely for the audit log
        // below -- each action independently reloads $role->permissions
        // fresh for its own decision and never trusts this snapshot.
        $beforePermissionNames = $role !== null
            ? $role->load('permissions')->permissions->pluck('name')->all()
            : [];

        // Two independent transformers. EnforceGrantorPermissionScope
        // (story 0010 Phase 4 security audit finding F2) refuses a payload
        // that newly grants a permission the actor does not themselves
        // hold. EnforceAdministratorPermissionGrant (story 0009) owns
        // roles.manage-administrators' grant rule exclusively (holding it
        // never confers the right to grant it onward). What keeps the two
        // from disagreeing about that one permission is
        // EnforceGrantorPermissionScope's own explicit exclusion of it from
        // its scope (see that class's docblock) -- corrected 2026-08-20
        // (Phase 4 round 2 re-audit, informational finding): call order
        // here is NOT what enforces the split; verified live that running
        // them in the other order refuses identically. Neither strips a
        // permission nor re-derives the other's rule; both throw
        // AuthorizationException (403) and let it propagate.
        $permissionNames = $enforceGrantorPermissionScope(Auth::user(), $permissionNames, $role);
        $permissionNames = $enforceAdministratorPermissionGrant(Auth::user(), $permissionNames, $role);

        // Self-lockout guard (story 0010 Phase 4 security audit finding
        // F7): refuse a save that would strip roles.manage from a role the
        // acting user currently holds. Derived from Auth::user() here,
        // never accepted as a parameter -- see docs/errors-log.md's
        // 2026-08-20 entry on a guard that took the state it was protecting
        // as an argument. Deliberately conservative: this checks only
        // whether *this* role grants roles.manage to the actor, not whether
        // a second role would still cover them, so it can refuse a save
        // that was actually safe -- erring toward refusal here costs one
        // extra click, not a security gap.
        if ($role !== null
            && Auth::user()->hasRole($role->name, 'web')
            && ! in_array(RolePolicy::ROLE_MANAGEMENT_PERMISSION, $permissionNames, true)
        ) {
            // Story 0015b: a non-Gate refusal, logged immediately before the
            // existing throw rather than as a second, independent check.
            $logRefusedPrivilegedAttempt->log(Auth::user(), 'self_lockout', 'role', $role->id);

            throw ValidationException::withMessages([
                'selectedPermissionIds' => __('roles.index.self_lockout_blocked'),
            ]);
        }

        // G2 (this story's Phase 1/3 decision, see the task file's open
        // question G): the actions stay pure transformers; this method is
        // the sole writer. The same $role instance authorized above -- or
        // the row just created below -- is the one syncPermissions() is
        // finally called on, never a second, independently-fetched
        // instance. Wrapped in a transaction (Phase 4 finding F4): a
        // failure between the rename and the permission sync must not
        // leave a role persisted with the wrong permission set.
        DB::transaction(function () use (&$role, $validated, $permissionNames): void {
            if ($role === null) {
                $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);
            } else {
                $role->update(['name' => $validated['name']]);
            }

            $role->syncPermissions($permissionNames);
        });

        // Story 0012 Phase 4 security audit finding F1: syncPermissions()
        // already flushes the permission cache, but it does so INSIDE the
        // transaction above -- a concurrent request landing between that
        // flush and this COMMIT would miss the cache, read the pre-commit
        // rows, and re-cache them on the shared `database` store for 24
        // hours. This second, post-commit flush is what closes that window.
        // See docs/security/authorization-patterns.md#flush-the-permission-cache-after-the-transaction-commits-never-inside-it.
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Audit trail (Phase 4 finding F8) -- this app has no dedicated
        // audit-log table; a structured log line is the minimum trace for
        // the highest-value mutation this screen performs.
        Log::info('Role saved', [
            'actor_id' => Auth::id(),
            'role_id' => $role->id,
            'role_name' => $role->name,
            'permissions_granted' => array_values(array_diff($permissionNames, $beforePermissionNames)),
            'permissions_revoked' => array_values(array_diff($beforePermissionNames, $permissionNames)),
        ]);

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
    public function confirmDeleteRole(int $roleId, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $role = Role::query()->where('guard_name', 'web')->findOrFail($roleId);

        $logRefusedPrivilegedAttempt->authorize('delete', $role);

        $this->deletingRoleId = (int) $role->id;
        $this->deletingRoleName = $role->name;
        $this->showDeleteModal = true;
    }

    /**
     * Authorize and delete the confirmed role.
     *
     * Hard-blocked while the role still has holders -- no confirm-and-proceed
     * path exists. The holder count is read off the same `withCount('users')`
     * query used for the block (including soft-deleted holders, Phase 4
     * finding F3 -- a trashed holder must still count, or the FK cascade on
     * `model_has_roles` silently destroys their role grant the moment this
     * role is deleted), so the count in the refusal message can never
     * disagree with the query that decided to refuse. Defense in depth:
     * App\Models\Role's own `deleting` guard throws RoleInUseException for
     * any future call site that bypasses this method.
     */
    public function deleteRole(LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        if ($this->deletingRoleId === null) {
            return;
        }

        $role = Role::query()
            ->where('guard_name', 'web')
            ->withCount(['users' => fn ($query) => $query->withTrashed()])
            ->findOrFail($this->deletingRoleId);

        $logRefusedPrivilegedAttempt->authorize('delete', $role);

        if ($role->users_count > 0) {
            // Story 0015b: a non-Gate refusal, logged immediately before the
            // existing throw rather than as a second, independent check.
            $logRefusedPrivilegedAttempt->log(Auth::user(), 'holders_remaining', 'role', $role->id);

            throw ValidationException::withMessages([
                'deletingRoleId' => trans_choice('roles.index.delete_blocked', $role->users_count, ['count' => $role->users_count]),
            ]);
        }

        // Locked and re-checked inside a transaction (Phase 4 finding F6):
        // a pre-flight check is not a race guard -- see
        // docs/security/signed-link-verification.md for the same rule
        // applied to a different flow. This closes the window between the
        // holder-count check above and the delete below; App\Models\Role's
        // own `guardAgainstHolders()` still re-checks at delete time too.
        DB::transaction(function () use ($role): void {
            Role::query()->whereKey($role->id)->lockForUpdate()->firstOrFail();

            $role->delete();
        });

        // Story 0012 Phase 4 security audit finding F1 -- same reasoning as
        // the identical post-commit flush in saveRole() above: Role's own
        // `deleted` event flushes the cache, but only inside the
        // transaction just closed.
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Audit trail (Phase 4 finding F8) -- see the identical note in
        // saveRole() above.
        Log::info('Role deleted', [
            'actor_id' => Auth::id(),
            'role_id' => $role->id,
            'role_name' => $role->name,
        ]);

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
     * it. `withCount('users')` (soft-deleted holders included, matching
     * `deleteRole()`'s own count -- Phase 4 finding F3) serves both the
     * listing's holder badge and the block check off the same query shape;
     * `permissions` is eager-loaded so the list can render each role's
     * granted modules without an N+1.
     *
     * `canEdit` / `canDelete` (story 0011, Phase 2 review open item 1) are
     * appended as pseudo-attributes on each row -- `Gate::allows('update'
     * |'delete', $role)`, the same `UserPolicy`-shaped ability the row
     * actions already authorize against in `openEditModal()` /
     * `confirmDeleteRole()` -- mirroring `App\Livewire\Users\Index::
     * loadUsers()`'s per-row `canEdit`/`canDelete` UI hint exactly. This is
     * a UI hint the paired view disables a control with, never a substitute
     * for the `Gate::authorize()` calls that actually gate the click; see
     * docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer.
     *
     * @return EloquentCollection<int, Role>
     */
    #[Computed]
    public function roles(): EloquentCollection
    {
        return Role::query()
            ->where('guard_name', 'web')
            ->selectable()
            ->with('permissions')
            ->withCount(['users' => fn ($query) => $query->withTrashed()])
            ->orderBy('name')
            ->get()
            ->each(function (Role $role): void {
                $role->canEdit = Gate::allows('update', $role);
                $role->canDelete = Gate::allows('delete', $role);
            });
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
