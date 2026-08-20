# [0010] Roles & Permissions management — backend (component logic, CRUD, cascading permission changes)

## Description
Build the Livewire component class that backs the Roles & Permissions management area: create,
rename, delete custom roles and sync each role's granular per-module permissions. Permission
changes must take effect immediately for every holder of the role, deletion is hard-blocked
while the role still has holders (message states the exact count), and the whole area is gated
server-side on the `roles.manage` permission.

## Type
backend | fullstack (related_task_id: 0011 — the Blade view / UI sibling) | includes database-expert: no

Depends on **0002** (roles & permission catalog seeder, which defines the `<module-slug>.<action>`
permission naming convention, the `roles.manage` and `roles.manage-administrators` permissions, the
seeded baseline `Administrator` role and the `Super Admin` role) — assumed done.

Boundaries with siblings, referenced and never redefined here:
- **0011** owns the Blade view, the component's UI shape, and browser tests. It does **not** create
  `routes/roles.php` or `app/Livewire/Roles/Index.php` — this story does; see
  [Files to create/modify](#files-to-createmodify) and the file-ownership note there.
- **0008** (closed 2026-08-18) owns `app/Models/Role.php`, the shared `selectable()` scope, the
  `config/permission.php` model repoint, `App\Policies\RolePolicy` **itself**, and every Super Admin
  invariant (undeletable / uneditable / non-downgradable, enforced via model events and overrides of
  `syncPermissions()`/`givePermissionTo()`/`revokePermissionTo()`).
- **[0008a](../done/0008a-centralize-administrator-role-identification.md)** — **now `done`, i.e. already
  shipped ahead of this story.** It owns
  `App\Models\Role::isAdministratorRole()`, the `App\Enums\RoleName::Administrator` case, the shared
  private `persistedName()` extraction on `App\Models\Role`, and the *user*-side relocation of the
  Administrator guard into `CreateUser`/`UpdateUser`. **It also modifies `app/Models/Role.php`, which
  this story modifies too** — different methods, so the two edits merge cleanly, but per
  [`docs/contracts.md`](../../../docs/contracts.md)'s Parallel Agent File-Ownership Rule the two stories
  must **never be dispatched to concurrent agents**. Because 0008a is already in flight, the
  "whichever lands first" clause in the `app/Models/Role.php` bullet below will in practice resolve
  to **0008a builds `persistedName()`, and this story consumes it** — but Phase 3 must verify that
  against the real file rather than assume it, since 0008a may still be mid-implementation.
- **0009** owns the authorization rule for who may grant `roles.manage-administrators`, the
  `App\Actions\Roles\EnforceAdministratorPermissionGrant` action this story's `saveRole()` calls, and
  the Administrator-level branch inside `RolePolicy::update()`/`delete()`.
- **0004** owns requiring `roles.manage-administrators` to promote a user to `Administrator`.
- **0013** owns the sidebar entry; until it lands the screen is reached directly at `/roles`.

> Note on vocabulary: the PRD's human phrase "manage roles & permissions" is Gherkin prose. The
> **technical permission name is `roles.manage`**, per 0002's confirmed `<module-slug>.<action>`
> convention — that is the string used in middleware and `can()` checks.

## Gherkin
```gherkin
Feature: Roles and permissions management

  Scenario: Create a custom role with scoped permissions
    Given a user administrator holding the "manage roles & permissions" permission
    When they create a role "Blog Editor" granted only the Blog module permissions
    Then the role is saved with exactly those permissions
    And it becomes selectable when assigning a role to a user

  Scenario: Create a role with no permissions granted
    Given a user administrator holding the "manage roles & permissions" permission
    When they create a role "Placeholder" with no permissions granted
    Then the role is saved as a legal, inert role with no permissions

  Scenario: Rename a custom role
    Given a user administrator holding the "manage roles & permissions" permission, with an existing role "Blog Editor"
    When they rename that role to "Content Editor"
    Then the role is saved under the new name
    And its granted permissions are unchanged

  Scenario: Editing a role updates all of its holders
    Given a user administrator holding the "manage roles & permissions" permission, with three users sharing the role "Blog Editor" who have already exercised their blog permissions
    When they remove the "delete blog content" permission from that role
    Then none of those three users can delete blog content afterwards
    And those three users keep the role's remaining blog permissions

  Scenario: Granting a permission to a role reaches all of its holders
    Given a user administrator holding the "manage roles & permissions" permission, with three users sharing the role "Blog Editor" that has no product permissions
    When they grant that role the "view products" permission
    Then all three users can view products afterwards

  Scenario: Editing one role leaves other roles' holders untouched
    Given a user administrator holding the "manage roles & permissions" permission, with a role "Blog Editor" and an unrelated role "Store Manager" whose holder can delete products
    When they remove a permission from the "Blog Editor" role
    Then the "Store Manager" holder can still delete products

  Scenario: Delete a role that nobody holds
    Given a user administrator holding the "manage roles & permissions" permission, with the role "Blog Editor" held by no users
    When they delete the "Blog Editor" role
    Then the role is removed together with its permission grants
    And it is no longer selectable when assigning a role to a user

  Scenario: Deleting a role still assigned to users is hard-blocked with a count
    Given a user administrator holding the "manage roles & permissions" permission, with the role "Blog Editor" assigned to 3 users
    When they try to delete the "Blog Editor" role
    Then deletion is always blocked, with no confirm-and-proceed path
    And the message states that 3 users hold it
    And the role still exists with its 3 holders

  Scenario Outline: Saving a role with invalid details is refused
    Given a user administrator holding the "manage roles & permissions" permission
    When they save a role with <invalid_detail>
    Then the role is not saved and the reason is shown

    Examples:
      | invalid_detail                                     |
      | a blank name                                       |
      | a name already used by another role                |
      | a name differing from an existing role only by case|
      | a name differing from an existing role only by surrounding spaces |
      | a permission that does not exist in the catalog    |

  Scenario: "Blog Editor" cannot manage roles at all
    Given a blog editor whose role was not granted the "manage roles & permissions" permission
    When they navigate directly to the Roles & Permissions management area
    Then access is denied server-side, not merely hidden in the UI

  Scenario: A user without role-management permission cannot change a role directly
    Given a blog editor whose role was not granted the "manage roles & permissions" permission
    When they attempt to save a change to a role without going through the management area
    Then the change is denied server-side
    And that role's permissions are unchanged

  Scenario: A user without role-management permission cannot delete a role directly
    Given a blog editor whose role was not granted the "manage roles & permissions" permission
    When they attempt to delete a role without going through the management area
    Then the deletion is denied server-side
    And that role still exists

  Scenario: The roles list excludes the Super Admin role
    Given a user administrator holding the "manage roles & permissions" permission
    When they view the roles list
    Then the Super Admin role does not appear in it
```

> **Deliberately *not* a scenario here: "the role selector excludes the Super Admin role."** That
> selector is the Users screen's, not this component's — `App\Livewire\Users\Index::roleOptions()`,
> which already calls `->selectable()` today (shipped by **0008**, and covered by 0008's own
> "Role selector, invisibility" and "Role selector, server-side enforcement" tests). Re-testing it
> here would assert a consumer this story does not own, against code that already ships. This applies
> [open question E](#open-questions)'s recommended answer **E1** — this story proves the
> `selectable()` scope is correct for its own list; each consumer tests its own use of it — so the
> scenario belongs to 0004/0006, which built that consumer.

## Files to create/modify

> **File ownership with sibling 0011 — one-directional, not "whichever lands first".** Both stories
> touch `routes/roles.php` and `app/Livewire/Roles/Index.php`. **This story creates both; 0011
> modifies them.** That direction is not arbitrary: 0011's own Definition of Done states it "is not
> independently shippable — it is the view layer of a component whose logic is 0010's" and lists 0010
> among the stories that must land first, so a "whichever lands first" hedge could only ever resolve
> one way. 0011 has been edited to match, and its shared-surface warning (0011 owns the Blade view and
> the component's UI-state properties; 0010 owns every query, mutation, validation rule and
> authorization decision) still governs *what* each story writes inside the component class.
> [Story 0012](../0012-module-access-gating-backend.md) still carries the older "created by whichever of
> 0010 / 0011 lands first" wording in its own `routes/roles.php` bullet (its open question 3) — it
> owns only the middleware chain, not the file, so nothing breaks, but it should be reconciled to
> "created by 0010" when 0012 is next revised.

- `app/Livewire/Roles/Index.php` — **create**. The component class this story owns. Class name and
  namespace are **shared with sibling 0011**, which registers nothing itself and owns the paired view
  `resources/views/livewire/roles/index.blade.php`. Class-based (not
  single-file) per `docs/conventions/base-standards.md`, declares `#[Title(...)]`, `#[Locked]` on
  everything the browser must not set, boolean naming per `docs/conventions/naming.md`.

  > **Corrected 2026-08-20 (found while running this story's own test suite) — the paired view path
  > quoted above is wrong; it is the flat file, not a nested one.** `App\Livewire\Roles\Index` is an
  > `Index` class inside a subfolder (`Roles/`), which is exactly the case
  > [`docs/conventions/naming.md`](../../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
  > documents as an exception to the normal class↔view mirror: Livewire's `Finder::generateNameFromClass()`
  > strips a trailing `.index` segment, so the component resolves to the **flat**
  > `resources/views/livewire/roles.blade.php` — the direct analogue of
  > `App\Livewire\Users\Index` → `livewire/users.blade.php`, already shipped and documented. Verified by
  > execution, not just by reading the vendor source: `Livewire::test(Index::class)` throws
  > `Illuminate\View\ViewException: File does not exist at path
  > .../resources/views/livewire/roles.blade.php` against this story's real component and test suite —
  > it never even probes the nested path. **0011's own file bullet repeats the same wrong path** (its
  > "core deliverable" line) and needs the identical correction; do not build the view at
  > `resources/views/livewire/roles/index.blade.php`, and do not leave both files present as an
  > accidental duplicate.

  **Ids are `int`, not UUID.** `roles.id` / `permissions.id` are bigint autoincrement
  (`$table->id()` in `2026_07_12_181045_create_permission_tables.php`); only `users` and the
  `model_uuid` morph key are UUID. So:
  ```php
  public string $name = '';
  /** @var array<int, int> */
  public array $selectedPermissionIds = [];
  #[Locked] public ?int $editingRoleId = null;   // null => create mode
  #[Locked] public ?int $deletingRoleId = null;
  #[Locked] public bool $canGrantAdministratorLevel = false; // passthrough for story 0009
  ```
  Actions: `openCreateModal()`, `openEditModal(int $roleId)`, `saveRole()`, `confirmDeleteRole(int $roleId)`,
  `deleteRole()`, `closeModal()`/`closeDeleteModal()`. A `#[Computed] roles()` property backs the
  list, built through `Role::query()->selectable()->withCount('users')` so one query serves both the
  listing's holder badge and the delete-block check.

  **Every mutating method opens with `Gate::authorize(...)` against `App\Policies\RolePolicy`**, and
  `mount()` opens with the `viewAny` equivalent — the house pattern, copied from
  [`app/Livewire/Users/Index.php`](../../../app/Livewire/Users/Index.php), which has eight real
  `Gate::authorize()` call sites plus two `Gate::allows()` UI hints. The full reasoning is under
  **Server-side gating, layer 2** in the *Technical approach* notes at the end of this section; the
  shape:

  ```php
  public function mount(): void
  {
      Gate::authorize('viewAny', Role::class);
      // ...
  }

  public function saveRole(EnforceAdministratorPermissionGrant $enforceAdministratorPermissionGrant): void
  {
      if ($this->editingRoleId === null) {
          Gate::authorize('create', Role::class);   // no record yet
          $role = null;
      } else {
          $role = Role::query()->findOrFail($this->editingRoleId);
          Gate::authorize('update', $role);
      }

      $validated = $this->validate();

      // Ids in, NAMES out -- 0009's action takes names, and this story converts
      // (see the Administrator-level toggle section below).
      $permissionNames = Permission::query()
          ->whereIn('id', $validated['selectedPermissionIds'])
          ->pluck('name')
          ->all();

      // $role is already in scope from the branch above -- null on create,
      // the fully-hydrated row on update. 0009's action reads the "before"
      // state from it directly (see the corrected signature note below).
      $permissionNames = $enforceAdministratorPermissionGrant(Auth::user(), $permissionNames, $role);

      // ... persist name, then $role->syncPermissions($permissionNames);
  }

  public function deleteRole(): void
  {
      $role = Role::query()->findOrFail($this->deletingRoleId);

      Gate::authorize('delete', $role);
      // ... holder-count block, then $role->delete();
  }
  ```

  Two details in that sketch are load-bearing rather than illustrative:

  - **The target is resolved from the `#[Locked]` id and then handed to `Gate::authorize()` as a
    fully-hydrated row**, never as a partially-selected instance — `Role::query()->findOrFail($id)`,
    not `Role::query()->select('id')->find($id)`. Belt-and-braces alongside the hydration-safe identity
    check `RolePolicy` already routes through (`Role::isSuperAdminRoleRow()` — see the corrected note
    in the `app/Policies/RolePolicy.php` bullet below: 0009 closed that residual before this story's
    Phase 3 began, not this story).
  - **The create path needs its own `create` ability; it cannot reuse `update` with a class name.**
    `Gate::authorize('update', Role::class)` would resolve `RolePolicy` from the class string and then
    call `update($user)` with **no second argument** — the class name is used to find the policy, not
    passed to the method — so the shipped `update(User $user, Role $role)` signature raises an
    `ArgumentCountError` rather than denying. This is why the sketch branches, and it mirrors
    `Users\Index::save()`, which calls `Gate::authorize('create', User::class)` on the create branch
    and `Gate::authorize('update', $target)` on the edit branch. The two abilities this story adds to
    `RolePolicy` (`viewAny`, `create`) are specified in its bullet below.
- `routes/roles.php` — **create** (this story, not 0011 — see the file-ownership note above). Mirrors
  `routes/settings.php`: an `['auth', 'verified']` group containing
  `Route::livewire('roles', Index::class)->middleware('can:roles.manage')->name('roles.index');`
- `routes/web.php` — **modify**. Add `require __DIR__.'/roles.php';` beside the existing
  `require __DIR__.'/settings.php';`.
- `app/Models/Role.php` — **consume, created by 0008 (closed 2026-08-18 — the class exists now)**. This
  story uses its `selectable()` scope and `withCount('users')`. It additionally registers a
  `static::deleting()` holder-count guard **alongside** 0008's guards — Laravel allows multiple listeners
  on one model event, so these are additive and must not be written as competing/overwriting closures.

  > **⚠ Register this guard inside 0008's existing `boot()`, not in a second registration point — and
  > read the two docs below before writing it.** 0008's Phase 4 security audit found and fixed two
  > non-obvious bugs in exactly this kind of guard, and a new one written from scratch can reintroduce
  > either. Both are documented:
  >
  > 1. **Registration ordering.** 0008's listeners are registered in an overridden
  >    `protected static function boot()` **before** `parent::boot()`, and that placement is the whole
  >    point: `HasPermissions::bootHasPermissions()` registers its *own* `deleting` listener inside
  >    `parent::boot()`, and it unconditionally detaches every `role_has_permissions` **and**
  >    `model_has_roles` row for the role. A guard registered in `booted()`, in a separate observer, or
  >    anywhere after `parent::boot()`, fires *after* that detach — and `Model::delete()` opens no
  >    transaction, so the detach persists: the `roles` row survives (a naive "the role still exists"
  >    assertion passes) while the role has silently lost all its permissions and all its holders. For a
  >    holder-count guard that is doubly perverse, since the very holders it counts are what the
  >    package's listener has just removed. Put this story's `deleting` closure in the **same** `boot()`
  >    method, alongside 0008's, so registration order stays explicit and reviewable in one place. See
  >    [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#layer-1-registration-order-is-the-whole-point)
  >    (which shows the real `boot()` body, plus the `booted()` anti-pattern) and the mechanism overview
  >    in the same page's
  >    [Super Admin role's invariants](../../../docs/architecture/authorization.md#the-super-admin-roles-invariants)
  >    section.
  > 2. **Reading the row's protected identity.** 0008's re-audit (finding R1) found a working bypass in a
  >    guard that read an in-memory attribute where it needed the *persisted* one, and that used `??` to
  >    fall back — which cannot distinguish "the column was never selected" from "the column is null".
  >    A holder-count guard reads a relation rather than a name, so it is not the identical bug, but it
  >    is the same class: **be explicit about what state you are reading and whether it is actually
  >    hydrated.** `$role->users()->exists()` issues a fresh query and is the safe form; `$role->users`
  >    (the cached relation, possibly loaded before the holders changed) and a `users_count` attribute
  >    carried over from a `withCount()` on the *listing* query are both stale-by-construction inside a
  >    `deleting` listener. The rule and its worked example are in
  >    [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#a-guard-that-reads-a-rows-protected-identity-must-distinguish-not-hydrated-from-hydrated-but-null).
  >
  > A test for this guard must assert the same thing 0008's does: after a refused delete, the
  > `model_has_roles` rows are **still there**, not merely that the `roles` row is.

  > **Already done — corrected 2026-08-19 against 0009's real, shipped work (Phase 5 review finding
  > F-A).** This section originally specified that *this story* would promote 0008's private
  > `isSuperAdminRole()` to a `public static isSuperAdminRole(self $role): bool`. That did not happen
  > the way this section predicted: 0008a's own Phase 4 security audit rounds (not 0008a's Phase 1
  > spec) built the equivalent helper first, under the name **`isSuperAdminRoleRow(self $role): bool`**
  > — added while closing 0008a's re-audit finding N2 (a Super Admin actor could demote another Super
  > Admin holder because nothing checked the *target's current* role, only the *submitted* one; the
  > row-shaped, hydration-safe check this section describes is exactly what N2's fix needed). 0009 then
  > consumed it directly in `RolePolicy::update()`/`delete()` during its own Phase 3, before this story
  > ever reached implementation. **There is nothing left here for this story to do.** `persistedName()`
  > exists too, as 0008a's own private extraction backing both `isSuperAdminRoleRow()` and
  > `isAdministratorRole()`. Do not add a second, differently-named public static method that does the
  > same thing — `Role::isSuperAdminRoleRow()` is the one and only implementation, and this story's
  > `RolePolicy` bullet below already consumes it.

- `app/Policies/RolePolicy.php` — **consume, created by 0008 (closed 2026-08-18) and extended by 0009
  (closed 2026-08-19) — the class, its Administrator-level branch, and its hydration-safe Super Admin
  check all already exist.** This story does not create the class, does not restructure it, and adds
  exactly one thing to it: the two `viewAny`/`create` abilities below ("Edit 2"; there is no "Edit 1"
  left — see the corrected note).

  0008 built this policy, and 0009 gave it its first real call sites plus its Administrator-level
  branch — but **neither wired it into a Livewire component**, since neither 0009 nor 0008 owns one.
  **This story is what gives `RolePolicy` its first component call site** — every `Gate::authorize()`
  in the component sketch above lands here. What is shipped today, verified against the real file
  rather than assumed:

  ```php
  // app/Policies/RolePolicy.php -- current shipped shape (0008 + 0009), both methods identical apart from the name
  public function update(User $user, Role $role): bool
  {
      if (Role::isSuperAdminRoleRow($role)) {
          return false;
      }

      return Role::isAdministratorRole($role)
          ? $user->hasPermissionTo(self::ADMINISTRATOR_LEVEL_PERMISSION)
          : $user->hasPermissionTo(self::ROLE_MANAGEMENT_PERMISSION);
  }

  public function delete(User $user, Role $role): bool { /* identical shape */ }
  ```

  > **Corrected 2026-08-19, against 0009's real, shipped work (Phase 5 review finding F-A) — "Edit 1"
  > described below is already done and is not this story's job.** This section originally specified
  > that *this story* would replace `$role->name === Role::superAdminName()` with a persisted-identity
  > helper it would also build (`Role::isSuperAdminRole()`), closing the ⚠️ residual in
  > [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#known-limitations--what-is-not-closed)
  > that named stories 0010/0011 by number. That did not happen the way this section predicted: 0008a's
  > own Phase 4 audit rounds built the equivalent helper first, under the name
  > `Role::isSuperAdminRoleRow(self $role): bool` (see the `app/Models/Role.php` bullet above), and 0009
  > consumed it directly in both methods above during its own Phase 3 — closing that residual entirely,
  > for both the `RolePolicy` half **and** the `Gate::before` deferral in `AppServiceProvider`, which
  > 0009's own Phase 4 security audit also upgraded to the same helper (finding F4). The underlying bug
  > class this residual was about is exactly 0008's Phase 4 re-audit finding **R1**, a working rename
  > bypass, documented in
  > [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#a-guard-that-reads-a-rows-protected-identity-must-distinguish-not-hydrated-from-hydrated-but-null)
  > — it is fully closed now, not partially. **This story touches neither method's Super Admin branch
  > nor its Administrator-level branch.** The old coordination warning about 0009 and 0010 racing to
  > build the same helper no longer applies (0009 already closed, so there is nothing left to race for),
  > but the Parallel Agent File-Ownership Rule note is still worth honouring for Edit 2 below, since
  > `app/Policies/RolePolicy.php` remains a file both stories touched.

  **Edit 2 — add the two abilities the component's non-edit paths need**, `viewAny(User $user): bool`
  and `create(User $user): bool`, each returning `$user->hasPermissionTo('roles.manage')`. Both take
  **no `Role` argument** (there is no record yet), which is exactly why `mount()` and the create
  branch of `saveRole()` cannot reuse `update()` — see the note under the component sketch above.
  This mirrors [`app/Policies/UserPolicy.php`](../../../app/Policies/UserPolicy.php)'s `viewAny`/`create`
  pair, which `Users\Index::mount()` / `save()` authorize against identically.

  Three properties of the shipped file that this story must preserve rather than rediscover:

  - **`hasPermissionTo()`, not `can()`** — the two new abilities follow the shipped file and
    `UserPolicy`'s six call sites. 0008 recorded the `PermissionDoesNotExist` → 500 consequence as its
    known limitation **F8**, deliberately accepted; 0009 re-confirmed the same decision on 2026-08-19.
    A both-policies fix is a separate story, not a side effect of this one.
  - **The Super Admin refusal is categorical and binds every actor, the Super Admin included** — it is
    an unconditional `return false`, not a permission check a privileged actor passes. Do not assume
    `Gate::before` short-circuits ahead of it; it defers on this target by design (0008's Phase 4
    finding F6).
  - **No `Gate::policy()` registration and no `AppServiceProvider` change.** `App\Policies\RolePolicy`
    is auto-discovered for `App\Models\Role` by naming alone; 0008's Phase 2 review examined and
    explicitly rejected the registration, and the policy works today without it.

- `config/permission.php` — **not modified by this story**; 0008 repoints `models.role`.
- `app/Concerns/RoleValidationRules.php` — **create**. Follows the existing `<Noun>ValidationRules`
  + `<noun>Rules()` pattern of `app/Concerns/ProfileValidationRules.php`:
  ```php
  protected function roleNameRules(?int $roleId = null): array
  {
      return [
          'required', 'string', 'max:255',
          Rule::unique('roles', 'name')->where('guard_name', 'web')->ignore($roleId),
      ];
  }

  protected function rolePermissionRules(): array
  {
      return [
          'selectedPermissionIds' => ['array'],
          'selectedPermissionIds.*' => [
              'integer',
              Rule::exists('permissions', 'id')->where('guard_name', 'web'),
          ],
      ];
  }
  ```
  `Rule::exists('permissions', 'id')` on each element means a forged/nonexistent permission id is
  rejected by `validate()` and never reaches `syncPermissions()`.

  **Both rules are scoped to `guard_name = 'web'`, and that is not decoration.** The physical unique
  index on `roles` is the **composite** `unique(['name', 'guard_name'])`
  (`database/migrations/2026_07_12_181045_create_permission_tables.php`), so an unscoped
  `Rule::unique('roles', 'name')` is *stricter* than the database — it would reject a name already
  taken on some other guard, a row the database would happily accept — while still not being the
  constraint the database actually enforces. The sibling precedent is explicit about this:
  [`App\Concerns\UserValidationRules::roleRules()`](../../../app/Concerns/UserValidationRules.php) writes
  `Rule::exists('roles', 'id')->where('guard_name', 'web')->whereNot('name', Role::superAdminName())`.
  Same reasoning on the permissions side: a permission id is only meaningful against the guard it was
  seeded under, and syncing a non-`web` permission onto a `web` role is a silently inert grant.

  **A role created by this story gets `guard_name = 'web'`, written explicitly.** Every role in this
  single-guard application is `web` — both seeded roles (`database/seeders/RolePermissionSeeder.php`),
  all 38 permissions, and the `Gate::before` bypass's `hasRole(…, 'web')` check. Relying on
  `config('auth.defaults.guard')` to supply it implicitly would make the value environment-dependent
  for no benefit; write `['name' => …, 'guard_name' => 'web']` at the creation call site so the row
  and the validation rules above provably agree. See
  [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#always-pass-the-guard-to-hasrole--hasanyrole)
  for the same "always name the guard" rule on the read side.
- `tests/Feature/Roles/IndexTest.php` — **create** (backend-qa, Phase 3).
- **No migration.** All five permission tables already exist; the catalog rows come from 0002.
- **No `bootstrap/app.php` change**, and no alias registration is consumed from it either. Note the
  file already registers the `role` / `permission` / `role_or_permission` aliases (story 0002); this
  story simply uses none of them, because `can` is a framework default. See the gating section below.

**Technical approach (verified against installed package source, not assumed):**

- **Cascading permission changes are automatic, on two independent layers.** In
  `vendor/spatie/laravel-permission/src/Traits/HasPermissions.php`, `givePermissionTo()` calls
  `$this->forgetCachedPermissions()` at lines 450–452 and `revokePermissionTo()` at lines 509–511,
  both guarded by `if ($this instanceof Role)`; `syncPermissions()` (lines 476–494) is a
  detach/revoke step that ends by calling into `givePermissionTo()`. Independently,
  `Spatie\Permission\Models\Role` uses `RefreshesPermissionCache`, which flushes on the model's own
  `saved`/`deleted` Eloquent events. So `$role->syncPermissions($ids)` is self-flushing —
  **the component must not call `forgetCachedPermissions()` itself.** The cache
  (`spatie.permission.cache`, 24 h TTL) holds the whole role/permission map globally rather than
  per-user, so once flushed the next check by *any* user re-hydrates from the database. Caveat: a
  `User` instance already resolved in the same request keeps its loaded relations; capability must
  be re-checked on a freshly resolved model, which is what a subsequent request does anyway.
- **Hard-blocked deletion.** `deleteRole()` reads the holder count off the same
  `withCount('users')` query and, when greater than zero, adds a validation error naming the exact
  count and returns — there is **no** confirm-and-proceed branch in the method at all. Defense in
  depth: the `static::deleting()` guard on `App\Models\Role` throws whenever `$role->users()->exists()`,
  so the block holds for any future call site that bypasses the component.
- **Server-side gating, layer 1 — `can:roles.manage` route middleware, never Spatie's `permission:`.**
  There is exactly **one** reason for that choice, and it is not the one an earlier draft of this
  story gave. To kill the false version first, because it inverts the risk:
  `'permission:roles.manage'` **is** a valid middleware string in this application today —
  [`bootstrap/app.php`](../../../bootstrap/app.php)'s `withMiddleware()` is **not** empty; it registers
  `'role'`, `'permission'` and `'role_or_permission'` via `$middleware->alias([...])` (story 0002's
  work, documented in
  [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#middleware-aliases)).
  A route gated with `permission:roles.manage` would therefore boot fine, and a manual check of
  `GET /roles` would show it correctly refusing an unprivileged user. **That is precisely what makes
  it dangerous here** — it looks like it works.

  The real, sole reason is Livewire's persistence boundary:
  `Livewire\Mechanisms\PersistentMiddleware\PersistentMiddleware::$persistentMiddleware` (lines 16–25)
  is a hardcoded allow-list of the route middleware Livewire re-applies to `/livewire/update`
  round-trips. It carries `Illuminate\Auth\Middleware\Authorize` — the class behind `can:` — but
  **not** `Spatie\Permission\Middleware\PermissionMiddleware`. So a `permission:`-gated route protects
  the initial `GET` only: every subsequent `saveRole()` / `deleteRole()` action request runs through
  **zero** permission middleware, silently, while the page-load check keeps passing. Sibling story
  [0012](../0012-module-access-gating-backend.md) states the identical rule for every future module
  route, and [`docs/api/routes.md`](../../../docs/api/routes.md#usersindex--the-first-permission-gated-route)
  records it as an already-shipped project convention that must not be "normalised" away —
  `routes/web.php` carries it as an inline comment above `users.index`. Write the same comment above
  `roles.index`.

  `can:` needs **no** alias registration of its own: `can` is a framework default alias
  (`'can' => Illuminate\Auth\Middleware\Authorize::class`), and Spatie registers every permission name
  as a Gate ability via `PermissionRegistrar::registerPermissions($gate)` — so
  `->middleware('can:roles.manage')` works with zero `bootstrap/app.php` setup. This story consumes
  none of the three Spatie aliases and adds none.

- **Server-side gating, layer 2 — `Gate::authorize()` inside the component, against `RolePolicy`.**
  Route middleware is never the only layer, for two independent reasons: `mount()` runs once per page
  load (Livewire hydrates from a snapshot afterwards), and the `PersistentMiddleware` allow-list is an
  internal implementation detail rather than a documented contract. So `mount()` and **every** mutating
  method re-authorize as their first statement, per
  [`docs/security/livewire-authorization.md`](../../../docs/security/livewire-authorization.md).

  **This is `Gate::authorize()` against [`App\Policies\RolePolicy`](../../../app/Policies/RolePolicy.php),
  not a bare permission assertion.** An earlier draft of this story specified
  `abort_unless(Auth::user()->can('roles.manage'), 403);` per method, justified as "matching the
  `abort_unless` style already used in `app/Livewire/Settings/Security.php`". **That precedent does not
  exist** — `grep -rn "abort_unless" app/ tests/ routes/ database/` returns nothing; the function
  appears nowhere in this repository. The real house pattern is
  [`app/Livewire/Users/Index.php`](../../../app/Livewire/Users/Index.php), with eight `Gate::authorize()`
  call sites (`viewAny` in `mount()`, then `create` / `update` / `delete` /
  `promoteToAdministrator` / `updateSensitiveAttributes` on the mutating paths) plus two
  `Gate::allows()` per-row UI hints. Use it.

  Beyond consistency, the policy is what a bare `can('roles.manage')` check structurally **cannot**
  express: `roles.manage` answers "may this actor manage roles *at all*", while `RolePolicy` answers
  "may this actor do it *to this particular role*" — which is where the Super Admin refusal lives
  (0008), and where 0009's Administrator-level branch will live. A permission-only check in the
  component would let a forged `editingRoleId` targeting the Super Admin role past this layer entirely
  and leave the model-event guard as the only thing standing, converting a clean 403 into an
  `ImmutableRoleException`. See
  [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#gateauthorize-at-the-call-site-not-only-at-the-route).

  The mapping — one authorize call per entry point, matching the sketch above:

  | Component method | Check |
  | --- | --- |
  | `mount()` | `Gate::authorize('viewAny', Role::class)` |
  | `saveRole()`, create branch | `Gate::authorize('create', Role::class)` |
  | `saveRole()`, edit branch | `Gate::authorize('update', $role)` |
  | `deleteRole()` | `Gate::authorize('delete', $role)` |

  `openEditModal()` / `confirmDeleteRole()` are **disclosure** paths rather than mutations, so they
  authorize too (`update` / `delete` on the resolved target) — gating every method that mutates *or
  discloses* is the rule in
  [`docs/security/livewire-authorization.md`](../../../docs/security/livewire-authorization.md), not an
  extra. Both layers are required; neither suffices alone.
- **Super Admin exclusion.** Every listing/selector query goes through 0008's shared
  `Role::query()->selectable()` scope; this component never targets that role for edit or delete.
  0008's model-layer guards are the actual enforcement against a forged id — the scope is defense
  in depth.
- **Administrator-level grant — delegated wholesale to 0009's action; this story implements no
  authorization logic of its own for it (human-confirmed decision).** The component exposes
  `#[Locked] public bool $canGrantAdministratorLevel`, computed in `mount()` from the Gate ability
  **0009** defines (`Gate::allows('grantAdministratorPermission', Role::class)`), purely so 0011's
  view can render the toggle conditionally.

  **The "silently strips it from the sync payload" behaviour an earlier draft specified is removed
  entirely.** It was both a second implementation of 0009's rule and the wrong outcome: 0009's action
  **throws `AuthorizationException` (403)** rather than stripping, because the toggle is never
  rendered to a non-Super-Admin, so the only way that input arises is tampering — and Epic 1's Gherkin
  consistently specifies "the action is denied server-side". A silent strip would also return HTTP 200
  and a success message for a request that was refused. `saveRole()` therefore calls the action and
  lets it throw; it neither pre-checks the flag nor filters the payload.

  ```php
  // App\Livewire\Roles\Index::saveRole() -- per-method action injection, per
  // docs/conventions/code-style.md#inject-single-purpose-actions-per-method
  public function saveRole(EnforceAdministratorPermissionGrant $enforceAdministratorPermissionGrant): void
  ```

  **This story converts permission ids to permission names before the call (human-confirmed
  decision).** The id→name lookup happens here, immediately before invoking the action:

  ```php
  $permissionNames = Permission::query()
      ->whereIn('id', $validated['selectedPermissionIds'])
      ->pluck('name')
      ->all();

  $permissionNames = $enforceAdministratorPermissionGrant(Auth::user(), $permissionNames, $role);

  $role->syncPermissions($permissionNames);
  ```

  The conversion is safe to do here because it runs **after** `validate()`, so every id has already
  passed `Rule::exists('permissions', 'id')->where('guard_name', 'web')` — the lookup cannot silently
  drop a forged id, because a forged id never reaches it. `syncPermissions()` accepts names as readily
  as ids, so nothing downstream needs the ids back.

  > **Corrected 2026-08-19, against 0009's real, shipped signature (Phase 5 review finding F-A) — the
  > action takes THREE arguments, not two, and the third is required.** 0009's own Phase 1 draft (and
  > this file's earlier revisions) described `__invoke(User $actor, array $permissionNames): array` as
  > "unchanged" through 0009's Phase 3. That premise did not survive 0009's own Phase 4 security audit:
  > taking only the submitted list meant the action could not tell a genuine new grant from a
  > non-Super-Admin's payload merely *omitting* an already-granted permission (their toggle is never
  > rendered to them at all), and comparing against a caller-supplied "before" array reopened the same
  > hole one level up (a caller could assert an untrue prior state, or supply it in a shape that didn't
  > match). 0009 shipped with `__invoke(User $actor, array $submittedPermissions, ?Role $role): array` —
  > the action now reads the "before" state itself from `$role->permissions` (freshly reloaded), and
  > `$role` carries **no default**: it must be passed explicitly as `null` on the create branch and as
  > the resolved role on the update branch. Both snippets above already have `$role` in scope from the
  > branch just above `saveRole()`'s `validate()` call — passing it is a one-argument change, not a
  > restructure. Do not revert to the two-argument call this section originally specified.
  >
  > **Open design question this story's Phase 1/3 must settle before writing `saveRole()` (0009's
  > Phase 5 review finding F-E, not yet decided) — should the action perform the sync itself?** As
  > shipped, `EnforceAdministratorPermissionGrant` is a transformer, not a write: it returns the
  > permission list to sync, and the caller (`saveRole()`, above) is the one that actually calls
  > `$role->syncPermissions($permissionNames)`. Two latent gaps follow directly from that split, neither
  > exploitable today (no caller exists yet) but both live the moment this story's `saveRole()` ships:
  > a caller that drops the return-value assignment silently loses the whole guard (F1's silent revoke
  > returns in full, with a 200 response); and a caller that syncs a *different* role than the one it
  > passed as the third argument reopens the class of hole 0009's re-audit finding N2 closed. This is
  > the same shape 0008a's story ruled on one story ago, in
  > [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#the-guard-belongs-to-the-action-not-to-the-caller)'s
  > "the guard belongs to the action, not to the caller" section — `CreateUser`/`UpdateUser` authorize
  > and write inside one call for exactly this reason. Two ways to resolve it, in order of preference:
  > **(a)** fold the write into the action for the update path (e.g.
  > `$role !== null ? $role->syncPermissions($final) : $final` returned only on the create path, where
  > this story still owns the actual `Role::create()` call) — the cheaper fix and the one that matches
  > the house pattern, or **(b)** keep the current split and add two explicit, named review checks to
  > this story's own Phase 5 review: the return value is assigned, and the `$role` instance passed in is
  > the same one subsequently synced. Whichever is chosen, record the decision in this story's own
  > implementation record — do not let it stay implicit the way this section was found to be by 0009's
  > audit.

  > **⚠ Sequencing — can Phase 3 of this story genuinely run before 0009 exists? Stated unambiguously,
  > because "add the call site" is otherwise ambiguous about what happens when the callee is absent.**
  > **No — `App\Actions\Roles\EnforceAdministratorPermissionGrant` must exist before this story's
  > Phase 3 begins, and this story must not stub it.** A type-hinted constructor/method parameter that
  > names a non-existent class does not compile-and-degrade: Livewire's container resolution throws
  > `BindingResolutionException` on **every** `saveRole()` call, so the story's own happy-path
  > scenarios ("Create a custom role with scoped permissions", "Rename a custom role") cannot pass.
  > The two ways out and the one chosen:
  >
  > - **(recommended, and the decision taken) the Administrator-level permission-grant story
  >   ([0009](../done/0009-administrator-level-permission-grant.md)) lands first** — which is why it now
  >   carries the **lower** number: the two stories were renumbered on 2026-08-19 so the dependency
  >   precedes its dependent, per [`docs/workflow.md`](../../../docs/workflow.md#task-ordering-rule)'s
  >   task-ordering rule. It is a small backend-only story whose only dependency this story has is
  >   that one action class plus the policy branch. Sequencing it ahead removes the question entirely
  >   and matches 0011's DoD, which already requires 0002, 0008, 0009 **and** this story to have
  >   landed before the UI ships.
  > - **Rejected: a stub/interim marker in this story.** A no-op stub is an authorization control that
  >   silently permits — the worst possible failure mode for this specific rule — and it would need a
  >   tracked follow-up to remove, which is exactly the kind of gap
  >   [`docs/errors-log.md`](../../../docs/errors-log.md) exists to record. Rejected outright.
  >
  > Practical consequence for the backlog: **[0009](../done/0009-administrator-level-permission-grant.md) is a
  > hard, blocking, ordered dependency of this story's Phase 3**, not merely a sibling. If a human
  > decides to run *this* story first anyway, the correct minimal change is to descope the
  > administrator-level grant from this story entirely — omit the action
  > call, omit `$canGrantAdministratorLevel`, and let 0009 add both when it lands — **not** to stub
  > the action. Note the two stories are also file-coupled (`app/Policies/RolePolicy.php`,
  > `app/Models/Role.php`), so they must run sequentially regardless of order.

  The authorization *rule* is entirely 0009's and is not reimplemented here.
- **No conflict with 0004.** This story writes only to `roles` and `role_has_permissions`;
  `syncPermissions()` never touches `model_has_roles`. 0004's rule — requiring
  `roles.manage-administrators` to promote a user to `Administrator` — only *reads* the acting
  user's permissions and writes role *assignments*, so the two stories touch disjoint tables. The
  one shared object is the `roles.manage-administrators` permission row, created by 0002 and
  read-only from 0004's side.

## Tests to perform
All are Feature tests (`RefreshDatabase`, real DB) unless noted — this domain is almost entirely
DB-backed, so genuine no-DB unit tests are rare here.

- [x] Integration test: creating a role persists exactly the selected permissions — assert the full
      sorted permission-name set, not a superset/subset.
- [x] Integration test: a newly created role appears immediately in `Role::selectable()`.
- [x] Integration test: a role created with zero permissions is a legal, inert state (0011 decision 3).
- [x] Integration test: renaming a role leaves its permission id set identical (compare against the
      pre-rename set captured beforehand, not just a count).
- [x] Integration test (cache invalidation — revoke): 3 holders, **warm the cache first** by asserting
      `hasPermissionTo()` is `true` on each holder, drive the change through the component (never
      `syncPermissions()` directly), then re-assert on **freshly resolved** users. Both steps matter:
      without the warm-up there is no stale cache to catch, and without re-fetching, stale in-memory
      relations produce a false pass regardless of the cache.
- [x] Integration test (cache invalidation — grant): same design, asserting `false` before and `true` after.
- [x] Integration test: an unaffected permission on the same role survives the edit (guards against
      "sync wipes everything").
- [x] Integration test: editing one role does not affect an unrelated role's warm-cached holder.
- [x] Integration test: deleting a role with zero holders removes it and leaves no orphaned
      `role_has_permissions` rows.
- [x] Negative test: deleting a role with 3 holders is refused, the message contains `3`, the role
      still exists, and all 3 users still hold it.
- [x] Edge case test: the 1-holder case is refused with a correct singular message.
- [x] Negative test: `$role->delete()` called directly on a role with holders — bypassing the
      component entirely — is also blocked by the model-event guard.
- [x] Negative test (validation dataset): blank name; exact duplicate name; case-only duplicate;
      surrounding-whitespace duplicate (0011 decision 2); a permission id absent from the catalog.
      Each persists nothing — and for an edit, the role's existing permission set is provably
      **unchanged**, so a rejected payload never partially applies.
- [x] Negative test: a guest visiting `/roles` is redirected to sign-in.
- [x] Negative test: an authenticated user without `roles.manage` visiting `/roles` gets 403.
- [x] Happy-path counterpart: a user holding `roles.manage` gets 200 and the component mounts.
- [x] Negative test: a user without `roles.manage` calling `saveRole()` directly on the component —
      bypassing `mount()` — is refused, **and** `assertDatabaseMissing` proves no side effect. The
      absent side effect, not the exception, is what proves the check runs on the action itself.
- [x] Negative test: same shape for `deleteRole()`; the role still exists afterwards.
- [x] Negative test: same shape for the **disclosure** paths, `openEditModal()` and
      `confirmDeleteRole()` — an actor without `roles.manage` is refused rather than being handed the
      target role's name and permission set in the component's public state.
- [x] Edge case test: `Role::query()->selectable()` omits exactly the Super Admin role when both it
      and other roles exist (Feature, not Unit — `tests/Unit/` gets no DB trait in this repo).
- [x] Edge case test: targeting the Super Admin role by forged id in `saveRole()`/`deleteRole()` is
      refused. Assert the refusal only — 0008 owns the invariant's mechanism and messaging.

**Tests for the authorization layer this story adds (`Gate::authorize()` + `RolePolicy`):**

- [x] For each of the four entry points (`mount()` → `viewAny`, `saveRole()` create → `create`,
      `saveRole()` edit → `update`, `deleteRole()` → `delete`): the check runs on the **component
      method itself**, proven by driving `Livewire::test()` without ever hitting the route. An HTTP
      test and a `Livewire::test()` one are **not** substitutes for each other here — the route
      middleware runs in one and not the other — per
      [`docs/testing/README.md`](../../../docs/testing/README.md).
- [x] **Already done, not this story's job (corrected 2026-08-20, Phase 5 review follow-up).** The
      persisted-identity fix this bullet described — proving `Gate::authorize('update', $role)` still
      refuses a partially-hydrated or mid-rename Super Admin role — is already shipped and already
      tested. 0009 routed `RolePolicy::update()`/`delete()` through `Role::isSuperAdminRoleRow()` during
      its own Phase 3, and `tests/Feature/Models/RoleTest.php` carries the partial-hydration and
      rename-in-flight assertions this bullet asked for. This story adds no test for it.
- [ ] **NOT MET — see the implementation record's F-7 entry below. Regression — 0009's `RolePolicy` and `App\Models\Role` guard tests pass unamended.** This
      story adds `viewAny`/`create` only; it does not touch `update()`/`delete()`'s Super Admin or
      Administrator-level branches, and does not promote or rename any model method (both
      `isSuperAdminRoleRow()` and `isAdministratorRole()` already exist as `public static`).
      `tests/Feature/Policies/RolePolicyTest.php` and the model-guard suites in
      `tests/Feature/Models/RoleTest.php` must go green **without edits**. A diff to those assertions is
      a regression to justify, not a test to update.
- [x] The two new abilities are permission-gated, not open: `viewAny` / `create` each return `false`
      for an actor lacking `roles.manage` and `true` for one holding it.
- [x] Positive counterparts for every negative above — a holder of `roles.manage` succeeds at each
      entry point. A negative-only suite passes just as happily against a misspelled ability, since
      Spatie's `Gate::before` swallows `PermissionDoesNotExist` and returns `false`.

**Tests for the `guard_name` scoping (N3):**

- [x] A role name already taken **on another guard** does not collide: creating a `web` role whose
      name matches an existing non-`web` row succeeds, matching the composite
      `unique(['name', 'guard_name'])` index rather than being stricter than it.
- [x] A permission id belonging to a non-`web` permission is rejected by
      `rolePermissionRules()` and never reaches `syncPermissions()`.
- [x] A role created through the component persists `guard_name = 'web'` explicitly.

**Test-arrangement notes for Phase 3:**
- Spatie's `Role`/`Permission` have no factories in this repo. Arrange directly
  (`Permission::create([...])`, `Role::create([...])->syncPermissions([...])`), or via a shared Pest
  helper under `tests/Feature/Roles/` — see open question C about requesting real factories.
- **Do not** invoke 0002's full seeder to arrange; create minimal fixture rows so this suite stays
  decoupled from the catalog's exact contents. The one place the real string matters is the gate
  itself — use `roles.manage`.
- A `beforeEach` calling `app(PermissionRegistrar::class)->forgetCachedPermissions()` is **required**:
  `config/permission.php` uses the `default` store, which is `array` under `phpunit.xml`, and
  `RefreshDatabase` rolls back the DB without clearing it — so a previous test's cache can otherwise
  bleed in and corrupt the warm-cache steps above. 0002's task file flags the same constraint.

## Expected outcome
A signed-in administrator holding `roles.manage` can create, rename and delete custom roles and
toggle their per-module permissions, with changes taking effect for every holder on their next
request. A role with holders can never be deleted, and the refusal names the exact number of
holders. Everyone without the permission is refused server-side, on page load and on every action.
The Super Admin role is absent from every list this component produces, and is refused by
`RolePolicy` even when a forged, partially-hydrated instance of it reaches `Gate::authorize()`.

## Acceptance criteria
- [x] The component creates, renames and deletes custom roles and syncs their permissions via
      Spatie's `syncPermissions()`.
- [x] A permission change on a role takes effect for all of its holders with no manual cache flush,
      covered by a test that would fail against a stale permission cache.
- [x] A role with one or more holders cannot be deleted — hard block, no confirm-and-proceed path —
      and the error message states the exact holder count.
- [x] The block is enforced by a model-event guard as well as in the component, additively with
      0008's guards on the same model.
- [x] Access requires `roles.manage`, enforced by `can:roles.manage` route middleware **and** by a
      `Gate::authorize()` call against `App\Policies\RolePolicy` as the first statement of `mount()`
      and of every component method that mutates *or discloses*. Spatie's `permission:` alias is not
      used on this route — it is registered and would appear to work on page load, but is off
      Livewire's `PersistentMiddleware` allow-list and so would not survive `/livewire/update`.
- [x] ~~`App\Policies\RolePolicy` gains a `viewAny` and a `create` ability, and **nothing else**~~ —
      **amended 2026-08-20 by this story's own Phase 4 security audit (finding F1), not silently.**
      `viewAny` and `create` were added exactly as specified, and the categorical Super Admin refusal in
      `update()`/`delete()` is untouched and still runs first and unconditionally. But `delete()`'s
      **Administrator-level branch did change**: it no longer gates that role on
      `roles.manage-administrators`, it refuses it **categorically**, because the audit's human-confirmed
      decision is that the seeded `Administrator` role is never deletable at all. That is a deliberate
      divergence from `update()`, which keeps the permission-gated branch 0009 wrote. The "nothing else"
      wording was written before the audit found the escalation path and could not have anticipated it;
      it is recorded here as amended rather than quietly ticked.
- [x] **Already true, not this story's job (corrected 2026-08-19, Phase 5 review finding F-A).**
      `RolePolicy`'s Super Admin identity check already runs through the hydration-safe
      `App\Models\Role::isSuperAdminRoleRow($role)` helper rather than the in-memory `$role->name` —
      0009 made this change during its own Phase 3, and 0009's Phase 4 security audit (finding F4)
      additionally upgraded the `Gate::before` deferral in `AppServiceProvider` to the same helper. The
      ⚠️ residual this bullet used to name stories 0010/0011 as owners of is **fully closed**, not
      partially — see the corrected note in the `app/Policies/RolePolicy.php` file bullet above. This
      story adds no test for it (0009's `RolePolicyTest.php` already carries one).
- [x] Every role listing/selector query in this component goes through 0008's `selectable()` scope.
- [x] Role name is required, trimmed and unique **within `guard_name = 'web'`** (matching the
      composite `unique(['name', 'guard_name'])` index, not stricter than it); permission ids are
      validated against the catalog and likewise guard-scoped, so a forged or wrong-guard id never
      reaches `syncPermissions()`; a role created here persists `guard_name = 'web'` explicitly.
- [x] The component exposes 0009's administrator-level grant flag for 0011's view, and delegates the
      grant rule **entirely** to 0009's `EnforceAdministratorPermissionGrant` action — converting
      permission ids to names immediately before the call and letting the action's
      `AuthorizationException` (403) propagate. This story neither strips the permission from the sync
      payload nor re-implements any part of 0009's rule.
- [x] No migration and no `bootstrap/app.php` change are introduced by this story.
- [x] Pint clean and Larastan level 7 clean.

## Definition of Done
- [x] Tests written and green — with **one known, deliberate exception**: every assertion in this
      story's suite that requires the component to *render* fails with
      `Illuminate\View\ViewException`, because `resources/views/livewire/roles.blade.php` is **story
      0011's** deliverable and does not exist yet. That is the agreed boundary between the two
      stories, not a defect; every non-rendering assertion (authorization, persistence, validation,
      cache invalidation, the model-event guards, the audit log) passes. See the implementation
      record for the full picture.
- [x] Code reviewed (code-reviewer) — Phase 5, all findings fixed (F-1 blocking through F-7).
- [x] No security findings (appsec-auditor) — Phase 4, two rounds, round 2 verdict **PASS**.
- [x] Documentation updated (docs-keeper) — Phase 6 completed 2026-08-20; see the implementation
      record for the file-by-file list.

      > **Phase 6 outcome, against what this bullet originally predicted.** The prediction was
      > verified rather than assumed, and it was **half right**. 0009's own docs pass *had* closed the
      > partial-hydration residual in
      > [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#known-limitations--what-is-not-closed)
      > correctly. It had **not** corrected that page's
      > [`RolePolicy` — the second policy](../../../docs/architecture/authorization.md#rolepolicy--the-second-policy)
      > section, which still claimed the policy "has three abilities" and "no call site in `app/`" —
      > both falsified by this story, both now rewritten (**five** abilities, first call site
      > `App\Livewire\Roles\Index`). Note the count in this bullet was itself wrong: it predicted
      > three abilities after this story, on the assumption the policy had one before 0009's third was
      > counted; the real arithmetic is 3 + `viewAny` + `create` = **5**.
      >
      > Four further stale claims that this bullet did **not** anticipate were found by re-reading the
      > pages against the diff rather than by following the change→doc mapping, and corrected in the
      > same pass: the seeder's `Role::firstOrCreate(['name' => 'Administrator', …])` code quote (in
      > *two* places, plus the `RuntimeException` it was said to throw), the `Role::boot()` quote in
      > **Layer 1**, `selectable()`'s "first (and today only) caller", and — in `docs/database/schema.md`
      > — the same `RuntimeException` claim about the Administrator seeding line.
      >
      > One prediction aimed *at* this story was also resolved rather than left standing: that page's
      > "Forward-looking warning for stories 0010/0011" about a `RolePolicy` ability against the Super
      > Admin role being denied-by-default for a Super Admin actor. Verified during Phase 5 to **not
      > bite here** — `AppServiceProvider`'s deferral keys on `$target instanceof Role`, and
      > `Gate::authorize('viewAny', Role::class)` passes a class *string*, so the bypass returns `true`
      > normally for both new abilities. Recorded as verified, not left as an open warning.
- [x] Acceptance criteria met — with one amendment recorded inline above (the "and **nothing else**"
      clause on the `RolePolicy` criterion, which this story's own Phase 4 finding F1 overrode by
      human-confirmed decision).
- [x] **Ordered dependency satisfied: the Administrator-level permission-grant story
      ([0009](../done/0009-administrator-level-permission-grant.md)) has landed** (it owns
      `App\Actions\Roles\EnforceAdministratorPermissionGrant`, which this story's `saveRole()` calls
      by type-hinted injection). See the ⚠ sequencing box in the Administrator-level grant section —
      this story must not stub that action, and if 0009 has *not* landed the correct move is to
      descope the grant from this story rather than fake the dependency.

## Open questions
Resolved during this debate, recorded so they are not reopened: the route (`routes/roles.php`,
`/roles`, `roles.index` — **created by this story**, not 0011), the component class
(`App\Livewire\Roles\Index`, shared with 0011 under its strict split), the gating mechanism
(`can:roles.manage` route middleware **plus** per-method `Gate::authorize()` against `RolePolicy`, no
alias registration), and the scope name (0008's `selectable()`, not a synonym). Three further points
were settled by human decision during Phase 2 remediation and are likewise closed: `RolePolicy` is
the component's authorization layer and its Super Admin check routes through a persisted-identity-safe
helper; the administrator-level grant is delegated wholesale to 0009's action with no local
authorization logic; and this story converts permission ids to names before invoking that action. The
following remain open and should be answered before Phase 3 — none block Phase 2 INVEST review.

**~~A. Message language for the holder-count block~~ — resolved in Phase 3, A1 applied.** Translation
keys from the start. [`lang/en/roles.php`](../../../lang/en/roles.php) and
[`lang/es/roles.php`](../../../lang/es/roles.php) both shipped, key-for-key identical, carrying
`roles.index.delete_blocked` (the holder-count refusal) and `roles.index.self_lockout_blocked` (the
self-lockout refusal added by Phase 4 finding F7). Nothing in
`App\Livewire\Roles\Index` holds a literal user-facing string. Story 0011 owns the screen's markup
and may add keys to the same files; it must not move these two.

**~~B. Singular/plural grammar for the 1-holder message~~ — resolved in Phase 3, and more strongly
than the recommendation asked for.** The recommendation was to assert on the numeral rather than an
exact grammatical string. What shipped is better: `delete_blocked` is **one** key carrying both forms
separated by `|`, resolved with
`trans_choice('roles.index.delete_blocked', $role->users_count, ['count' => $role->users_count])`, so
the singular/plural rule lives in the translation file where a locale with different plural rules can
express it. The suite carries a dedicated singular case (`deleting a role held by exactly 1 user is
refused with a correct singular message`) alongside the 3-holder one. The convention this established
is now written up in [`docs/conventions/naming.md`](../../../docs/conventions/naming.md#translation-keys)
— a count-dependent message is never two keys and never a `$count === 1 ? … : …` branch in PHP.

**~~C. Shared `RoleFactory` / `PermissionFactory`~~ — resolved in Phase 3 by what shipped: C2 taken,
and C1 is not withdrawn but deferred.** No factories were added. `tests/Feature/Roles/IndexTest.php`
arranges through local Pest helpers (`rolesTestPermission()`, `rolesTestActor()`, and direct
`Role::create([...])->syncPermissions([...])`), which keeps this suite decoupled from the seeded
catalog's exact contents — a property the "Test-arrangement notes" below deliberately asked for and
which a shared factory would not have changed either way. C1's actual argument (four suites
hand-rolling near-identical arrangement code) still stands and is now demonstrable across
`tests/Feature/Seeders/`, `tests/Feature/Policies/RolePolicyTest.php`,
`tests/Feature/Models/RoleTest.php` and this file, so it remains a reasonable follow-up — it is simply
not something this story needed, and adding app-code (`database/factories/`) for a test-arrangement
convenience was out of scope for a story already carrying two security-audit rounds.
- C1 — thin `RoleFactory` / `PermissionFactory` following `UserFactory`. Not rejected; deferred.
- **C2 (taken)** — local Pest helpers per suite.

**~~D. Case-insensitive uniqueness depends on live column collation~~ — resolved in Phase 3: verified,
and no extra comparison was needed.** `roles.name` carries **`utf8mb4_unicode_ci`** (set by
`config/database.php`, not MySQL 8.4's `utf8mb4_0900_ai_ci` default), which is case- *and*
accent-insensitive — so `Rule::unique('roles', 'name')->where('guard_name', 'web')` rejects a case-only
duplicate on its own, and the "if it is case-sensitive, add an explicit lowercase comparison" branch of
this question never applied. The finding is recorded where a future reader will actually meet it: the
docblock on [`App\Concerns\RoleValidationRules::roleNameRules()`](../../../app/Concerns/RoleValidationRules.php),
and in [`docs/database/schema.md`](../../../docs/database/schema.md#roles-permissions-model_has_roles-model_has_permissions-role_has_permissions).
Two consequences worth carrying forward rather than rediscovering, both already live in this codebase:

- **The same collation is why the seeder cannot use a bare `firstOrCreate()`** for either protected
  role name — it would silently *adopt* a case-variant row instead of creating the intended one, while
  every identity check in the app is a byte-exact `===`. Both creation paths therefore read the
  persisted name back and throw (`Role::firstOrCreateSuperAdminRole()`, and this story's own
  `Role::firstOrCreateAdministratorRole()`).
- **Trimming is *not* covered by the collation and is this component's job.** A Livewire property
  update never passes through the `TrimStrings` middleware a normal HTTP request body does, so
  `saveRole()` trims `$this->name` explicitly *before* `validate()` runs — otherwise the uniqueness
  check compares a still-padded value. The whitespace-duplicate scenario in the Gherkin above is what
  pins it.

**~~E. Who tests the role selector?~~ — resolved, E1 applied.** This was "becomes selectable when
assigning a role to a user", which points at the Users screen (0004/0006), not this component. **E1
is taken**: this story proves the `selectable()` scope is correct for its own roles list, and each
consumer tests its own use of it — lowest coupling, and consistent with this story never redefining
a sibling's concern. Concretely, the Gherkin scenario "The role selector excludes the Super Admin
role" has been **removed from this story's scope** (see the note under the Gherkin block): that
selector is `App\Livewire\Users\Index::roleOptions()`, which already calls `->selectable()` in the
shipped code and is already covered by 0008's own "Role selector, invisibility" and "Role selector,
server-side enforcement" tests. Re-testing it here would assert shipped code this story does not own.

The one part of E that stays live is its last bullet, restated as a Phase 5 instruction rather than a
question: `code-reviewer` should confirm that 0004/0006 reuse `selectable()` rather than reinventing
a Super Admin filter — that is where a silent gap could open.

**F. Should `RolePolicy::viewAny` / `create` be added by this story, or by 0008 retroactively?** This
story specifies adding both (see the `app/Policies/RolePolicy.php` bullet), because it is the first
call site that needs them and 0008 is closed. Flagged rather than assumed because it means **three**
stories now edit that one file (0008 created it; 0009 added the Administrator branch **and** — beyond
its own original scope, per its Phase 4 security audit — the Super Admin check's hydration-safety
upgrade; 0010 adds two abilities and nothing else in this file).

**G. Should `EnforceAdministratorPermissionGrant` perform the sync itself, rather than only returning
the list to sync?** **Resolved 2026-08-20, Phase 1/3 of this story: G2 — keep the split.** The action
stays exactly as 0009 shipped and closed it (a pure transformer: `array` in, `array` out, no write).
`saveRole()` performs the actual `syncPermissions()` call itself, reusing the sketch already in this
file above (the elided `// ... persist name, then $role->syncPermissions($permissionNames);` comment)
— which already committed to this shape before G was ever raised, so G1 (folding the write into the
action) would mean reopening 0009's already-closed, three-round-audited class to change its contract,
for a benefit ("one fewer statement in `saveRole()`") that does not outweigh the cost. `saveRole()`'s
implementation carries the two safeguards the deferred remediation option asked for instead: the
action's return value is always assigned back to `$permissionNames` before use, and the same `$role`
instance resolved by the authorization branch (or the row just created, on the create branch) is the
one both passed into the action and the one `syncPermissions()` is finally called on — never a second,
independently-fetched instance.
- G1 — fold the write into the action for the update path. Rejected: changes 0009's closed contract
  and only saves one line at the call site.
- **G2 (taken)** — keep the split; enforce "same `$role` instance, return value assigned" as an
  implementation rule for `saveRole()` and a Phase 5 review check, not as a code change to the action.

---

## Phase 3/4/5/6 implementation record

**2026-08-20 — Phase 3 (implementation).** Built exactly what
[Files to create/modify](#files-to-createmodify) specified, with no scope changes:
[`App\Livewire\Roles\Index`](../../../app/Livewire/Roles/Index.php) (create / rename / delete custom
roles and sync per-module permissions), [`App\Concerns\RoleValidationRules`](../../../app/Concerns/RoleValidationRules.php),
[`routes/roles.php`](../../../routes/roles.php) (`roles.index`, `can:roles.manage`) required from
`routes/web.php`, `viewAny` / `create` on [`App\Policies\RolePolicy`](../../../app/Policies/RolePolicy.php),
a holder-count `deleting` guard registered inside 0008's existing `Role::boot()` (never a second
registration point — see the boxed vendor-ordering note above), the new
[`App\Exceptions\RoleInUseException`](../../../app/Exceptions/RoleInUseException.php) it throws
(**409**, not 403 — the request is well-formed and the actor is authorized; the role is simply still
referenced), and `lang/en/roles.php` + `lang/es/roles.php`. No migration, no `bootstrap/app.php`
change, no `Gate::policy()` registration.

Two Phase 1 predictions were falsified during implementation and are corrected in place above rather
than only here: the **paired Blade view path** (`App\Livewire\Roles\Index` is an `Index` class in a
subfolder, so Livewire strips the `.index` segment and resolves the *flat*
`resources/views/livewire/roles.blade.php` — found by execution, not by reading the vendor source),
and open question **G**, decided as **G2** (keep `EnforceAdministratorPermissionGrant` a pure
transformer; `saveRole()` remains the sole writer, carrying the two safeguards the deferred
remediation asked for as implementation rules).

**Phase 4 (`appsec-auditor`), two rounds.**

- **Round 1: FAIL — eight findings.** The two Highs are the ones worth remembering; the rest are
  hardening.
  - **F1 (High, human-confirmed decision) — the Administrator role was renameable and deletable.**
    This story is the first code in the repo able to write `roles.name`, and 0008a's centralized
    Administrator *identity* is derived from that column — so a `roles.manage-administrators` holder
    could **rename** the seeded role, silently demoting every `isAdministratorRole()` check in the app
    (`UserPolicy`, `CreateUser`, `UpdateUser`, `RolePolicy`) while the role kept its 37 permissions and
    every holder kept their access, or **delete** it outright once it had no holders. Both verified
    live. Fixed with three guards on `App\Models\Role` mirroring the Super Admin tier's —
    `guardAgainstAdministratorDeletion()`, `guardAgainstRenamingAdministrator()`,
    `guardAgainstAssumingAdministratorName()` — plus `Role::firstOrCreateAdministratorRole()` as the
    one sanctioned creation path (`withoutEvents()` + a byte-exact read-back against the
    `utf8mb4_unicode_ci` collation), which `RolePermissionSeeder` now calls instead of the raw
    `firstOrCreate()` the new `creating` guard would otherwise refuse. **The protection is deliberately
    narrower than the Super Admin tier's**: only the name is locked and the row is undeletable — the
    permission set stays fully editable, which is the entire point of story 0009.
    `RolePolicy::delete()` was changed in the same pass to refuse the Administrator role
    **categorically** rather than gate it on `roles.manage-administrators`, which is why this story's
    "and nothing else" acceptance criterion carries an amendment.
  - **F2 (High, human-confirmed decision) — a `roles.manage` holder could grant themselves the whole
    catalog.** `roles.manage` authorizes *managing roles*; nothing stopped its holder rewriting any
    role's permission set — including their own role's — to all 38 permissions. Verified live against
    an actor holding two. Fixed by the new
    [`App\Actions\Roles\EnforceGrantorPermissionScope`](../../../app/Actions/Roles/EnforceGrantorPermissionScope.php),
    which refuses a payload that *newly grants* a permission the actor does not hold. It excludes
    `roles.manage-administrators` from its own scope entirely (that permission's grant rule stays
    exclusively `EnforceAdministratorPermissionGrant`'s) and exempts a Super Admin actor outright, who
    holds zero permission rows by design.
  - **F3 (Medium) — a soft-deleted holder counted as zero.** The morph relation applies `User`'s
    `SoftDeletingScope`, so a trashed holder let the delete through and the FK cascade on
    `model_has_roles` then destroyed that holder's grant with no error anywhere. Both the component's
    count and the model-event guard now use `withTrashed()`.
  - **F4 (Low)** — `saveRole()`'s writes and `deleteRole()`'s delete each wrapped in
    `DB::transaction()`; a failure between the rename and the permission sync must not leave a role
    persisted with the wrong set. **F5 (Low)** — every role resolution and the listing scoped to
    `guard_name = 'web'`, matching the validation rules (defence in depth: leaving resolution unscoped
    while validation is scoped would let a rename pass validation and then surface as a raw `23000`).
    **F6 (Low)** — a row lock inside `deleteRole()`'s transaction, closing the window between the
    holder-count check and the delete. **F7 (Low)** — a self-lockout guard refusing a save that would
    strip `roles.manage` from a role the acting user holds, derived from `Auth::user()` internally and
    never accepted as a parameter. **F8 (Low)** — a structured `Log::info()` audit trail on both
    `saveRole()` and `deleteRole()` (actor, role, permission diff), this app having no audit-log table.
- **Round 2 (re-audit): PASS.** All eight round-1 findings re-verified closed **by execution**, not by
  reading the diff. Three new **Low** findings, all accepted and documented rather than code-fixed:
  - **N1 (accepted, human-confirmed).** `EnforceGrantorPermissionScope` restricts *granting* a
    permission the actor lacks but not *revoking* one, so a `roles.manage` holder can still strip
    another role's access. Privilege **consolidation**, not gain, and always repairable by a Super
    Admin. Recorded in the action's own docblock.
  - **N2.** The two transformers handle an **omission** in opposite ways (one preserves, one lets the
    sync revoke), which is safe only because `permissionOptions()` renders the *unfiltered* catalog —
    a property that lives in neither guard. Written up as a forward-looking rule in
    [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#two-guards-on-one-payload-must-agree-on-what-an-omission-means),
    because the obvious next move for story 0011 (hiding permissions the actor cannot grant) is
    exactly what would turn it into a silent-revoke bug.
  - **N3.** `RolePolicy::delete()`'s categorical Administrator refusal is **unreachable for a Super
    Admin actor** — `Gate::before` only defers when the ability's *target* is the Super Admin role, so
    for that one actor/target pair the model-event guard is what actually refuses. Contained (both
    paths render 403); the policy method's docblock, which claimed a relationship to the model guard
    that was not accurate, was corrected.

  The same round corrected a comment in `saveRole()` attributing the split between the two
  transformers to **call order**. Verified live by reversing the two calls: they refuse identically.
  The real mechanism is `EnforceGrantorPermissionScope`'s own `->reject(...)` exclusion of
  `roles.manage-administrators`. Do not reintroduce the order-dependent framing.

**Phase 5 (`code-reviewer`).**

- **F-1 (blocking) — three test files failed a real Pint run.** `vendor/bin/pint --dirty` — the exact
  command this project's own [conventions](../../../docs/conventions/base-standards.md#quality-gates)
  mandate — reported clean, because `--dirty` inspects only *uncommitted* changes and therefore
  no-ops entirely once the tree is committed. A plain `vendor/bin/pint --format agent` found
  `fully_qualified_strict_types` and `ordered_imports` violations immediately. Fixed by that unscoped
  run. **This is a project-wide gate weakness, not a mistake specific to this story**, and is recorded
  as such in [`docs/errors-log.md`](../../../docs/errors-log.md#both-of-this-projects-per-change-quality-gates-are-scoped-by-default-and-both-silently-passed--2026-08-20)
  together with its sibling (`test --filter`, below), with the corresponding correction to the
  conventions page's gate list.
- **F-2 — a disclosure test that asserted nothing.** The `openEditModal()` test was written against
  `Livewire::test(Index::class, ['skipMount' => true])`, which is not a real API (this component's
  `mount()` takes no parameters), and its own skip reason was contradicted eight lines below by
  `confirmDeleteRole()`'s working test. Rewritten in that working shape — mount while privileged,
  revoke, call, expect the throw, assert the disclosed state (`name`, `selectedPermissionIds`) stays
  empty.
- **F-3 — two tests named after methods they never call.** Both forged-Super-Admin-id tests were named
  for `saveRole()` / `deleteRole()` but call `openEditModal()` / `confirmDeleteRole()` — which are in
  fact the only reachable entry points, since `editingRoleId` / `deletingRoleId` are `#[Locked]`. The
  coverage was correct; only the names claimed otherwise. Renamed to state what they assert.
- **F-4 — three docblocks left stale by the F1 fix**, each corrected against the shipped code:
  `ImmutableRoleException` named only the Super Admin role as a thrower; `Role::boot()` still called
  `guardAgainstHolders()` the "second" `deleting` listener when `guardAgainstAdministratorDeletion()`
  now sits between it and the Super Admin guard; and `routes/roles.php`'s inline comment still pointed
  at `users.index` in `routes/web.php` after task 0040 moved it to `routes/users.php`.
- **F-5 — `RolePolicy::create()`'s docblock** named only the uniqueness-rule refusal for the
  Administrator name, missing the second, unconditional refusal `guardAgainstAssumingAdministratorName()`
  now provides.
- **F-6 — a test comment reintroduced the order-dependent framing** the round-2 re-audit had already
  corrected elsewhere. Restated to match the action's docblock and the security page.
- **F-7 — four pre-existing tests were modified, and the justification was only in the test comments.**
  Owner: `product-owner`, precisely so it would be recorded here rather than living in code comments.
  See the next section.
- **O-1 … O-8 — non-blocking observations.** Several were actioned as part of the F-fixes above rather
  than separately (the docblock and test-naming items in particular). **O-7** is the one with work of
  its own: documentation drift in `docs/architecture/authorization.md`, `docs/database/schema.md` and
  `docs/api/routes.md`, handed to Phase 6 and completed there — see below.

### Why four tests this story's own DoD said should go green "without edits" were edited (Phase 5 finding F-7)

The [Tests to perform](#tests-to-perform) section carries a regression bullet requiring
`tests/Feature/Policies/RolePolicyTest.php` and the model-guard suites in
`tests/Feature/Models/RoleTest.php` to pass **unamended**, on the premise that this story adds
`viewAny`/`create` and touches nothing else. That premise did not survive this story's own Phase 4
audit, and the bullet is left **unchecked** above rather than quietly ticked. This is a factual record
of what happened, not a new decision — each edit is a direct consequence of a human-confirmed audit fix:

- **Three tests in `tests/Feature/Policies/RolePolicyTest.php`**, all built on the pre-F1 premise that
  *"the Administrator role is deletable given `roles.manage-administrators`"* — a premise F1's fix
  deliberately made false. Rewritten against the new one: (1) a Super Admin's
  `allows('delete', $administratorRole)` staying `true` is now documented as the **`Gate::before`
  bypass value** rather than as evidence the deletion succeeds — the raw `delete()` call is what
  actually throws (this is finding **N3** made visible in a test); (2) a non-Super-Admin holder of
  `roles.manage-administrators` now gets a `false` Gate check directly; (3) the
  revoke-takes-effect-immediately test switched from `delete` to `update`, because `delete` against the
  Administrator role is now categorically `false` regardless of any permission and would prove nothing
  either side of a revoke.
- **One test in `tests/Feature/Authorization/SuperAdminRoleConfigSourceOfTruthTest.php`**, and this one
  is not about F1 at all — it is a genuine regression this story caused in an unrelated suite, found
  only when the **full** suite was finally run (see F-1's sibling gate weakness above). Two compounding
  causes, both pre-existing. (a) This story's holder-count guard blocks deleting **any** role with
  holders, protected tier or ordinary — the test assigns a holder to the ordinary role literally named
  `"Super Admin"` purely to exercise `Gate::before`/`can()` earlier in the test, then goes on to delete
  that same role; an explicit `removeRole()` was added before the deletion the scenario is actually
  about. (b) This repo's ambient `SUPER_ADMIN_EMAIL` makes `RolePermissionSeeder` provision a second,
  invisible Super Admin holder the test never accounted for — the exact class of ambient-config
  sensitivity [`docs/errors-log.md`](../../../docs/errors-log.md)'s 2026-08-12 entry already names,
  neutralized here the same way `tests/Feature/Seeders/DatabaseSeederTest.php` already does
  (`config(['auth.super_admin.email' => null])` before seeding).

Each of the four carries an inline comment naming its cause; this section is the record the test
comments cannot be.

**Phase 6 (`docs-keeper`), 2026-08-20.** Files updated: `docs/architecture/authorization.md` (two new
sections — **The Administrator tier's immutability** and **The second grant meta-rule** — plus five
corrected stale claims, listed in the Definition-of-Done note above),
`docs/security/authorization-patterns.md` + `docs/security/README.md` (one new durable rule from F1:
*an identity derived from a mutable column must be locked once code exists that can mutate it*),
`docs/api/routes.md` (the `roles.index` row and subsection, including the ⚠️ that `GET /roles` does not
render until 0011 ships its view), `docs/database/schema.md` (the corrected `RuntimeException` claim
and the holder-count 409 guard), `docs/conventions/base-standards.md` (the unscoped-quality-gate rule),
`docs/conventions/naming.md` (`trans_choice()` plurals, `RoleValidationRules`, the second
`Index`-in-a-subfolder row), `docs/errors-log.md` (the eighteenth entry), `docs/README.md`, the root
`README.md`, and the course delivery document `../readme.md`. `CLAUDE.md` and `AGENTS.md` needed no
change — this story adds no new doc file and no new pointer.

The [link-integrity check](../../../docs/workflow.md#link-integrity-check-on-every-stage-move) was run over
this file even though it has not moved since Phase 3, and it **found two real breaks**: both references to
sibling story 0012 were written as bare `](0012-module-access-gating-backend.md)`, which resolved correctly
from `ai-spec/tasks/` and stopped resolving the moment this file moved to `in-progress/`. Corrected to
`](../0012-…)`. Worth noting for the next story: the documented failure mode is about `../../docs/…` links
going one level too shallow, but a **bare sibling-file link** breaks on the same move for the mirror-image
reason — the sibling stayed put while this file went one level deeper. Every relative link and every
`#fragment` in this file now resolves against the filesystem from its real `in-progress/` location.
