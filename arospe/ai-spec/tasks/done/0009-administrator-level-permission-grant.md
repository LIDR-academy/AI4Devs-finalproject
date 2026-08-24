# [0009] Administrator-level permission — role-level enforcement + Super-Admin-only grant visibility

## Description
Enforce, server-side, that **editing or deleting the seeded baseline "Administrator" role itself**
requires the distinct `roles.manage-administrators` permission, and implement the
meta-rule that the control to **grant** that permission to a role is available **only to the Super
Admin** — never to any other administrator, however broad their permissions. Exposes a stable
authorization check that story 0011's frontend consumes to conditionally render the toggle, and
rejects tampered role-save payloads that try to bypass it.

## Type
backend | includes database-expert: **no**

> **Dependencies (do not re-implement here).**
> - **0002** seeds the `Super Admin` role, the baseline `Administrator` role, and the
>   `roles.manage` / `roles.manage-administrators` permissions, **and owns
>   the global Super-Admin `Gate::before` bypass hook.** This story consumes both; it registers neither.
> - **[0010](0010-role-permission-management-backend.md)** (Roles & Permissions management —
>   backend) owns the action that persists a role's name/permissions and the role-delete action.
>   This story hooks its enforcement into those call sites; it does not create a competing role-CRUD
>   path.
>   **Sequencing: this story must land *before* the Roles & Permissions management backend story
>   ([0010](0010-role-permission-management-backend.md)) reaches its Phase 3 — which is exactly why
>   this story carries the lower number.** That story's `saveRole()` type-hints
>   `App\Actions\Roles\EnforceAdministratorPermissionGrant` as an injected parameter, and a type-hinted
>   parameter naming a class that does not exist throws `BindingResolutionException` on **every**
>   `saveRole()` call — so its own happy-path scenarios cannot pass without this story's action
>   class. It has explicitly ruled out stubbing it (a no-op stub of *this* rule is an authorization
>   control that silently permits). The two stories are also file-coupled on
>   `app/Policies/RolePolicy.php` and `app/Models/Role.php`, so they must run **sequentially** in any
>   case — never as concurrent agents.
> - **0008** (Super Admin role invariants — **closed 2026-08-18**) already created `App\Models\Role`,
>   `App\Enums\RoleName`, `App\Models\Role::superAdminName()` and — importantly for this story —
>   **`App\Policies\RolePolicy` itself**, with working `update()`/`delete()` methods that already refuse
>   the Super Admin role categorically. This story **modifies** that policy; it does not create it. Read
>   [`app/Policies/RolePolicy.php`](../../../app/Policies/RolePolicy.php) and
>   [`app/Models/Role.php`](../../../app/Models/Role.php) before Phase 3 — 0008's implementation grew
>   substantially during its own Phase 4 security audit, beyond what its Phase 1 spec described.
> - **0008a** (Centralize Administrator-level role identification) owns the shared
>   `App\Models\Role::isAdministratorRole()` helper and the `App\Enums\RoleName::Administrator` case this
>   story's identity check consumes, plus the *user*-side relocation of the Administrator guard into
>   `CreateUser` / `UpdateUser`. Whichever of the two stories reaches Phase 3 first creates the helper;
>   the other consumes it. Neither may define its own comparison.
> - **0011** (frontend) renders the permission toggles and consumes the check defined below.
> - **0004** owns the whole *user*-side rule in `App\Policies\UserPolicy`: it **defines and calls**
>   `promoteToAdministrator()` (assigning a user *into* the `Administrator` role), `downgrade()` and
>   `delete()`. **0005** later extends `delete()`/`downgrade()` with soft-delete semantics. **This
>   story defines none of them** — its scope is `App\Policies\RolePolicy`, i.e. the *role* object,
>   not user↔role assignments. The two policies are disjoint and neither delegates to the other.
>   Earlier drafts split the user-side rule between two stories; that attribution was wrong and is
>   corrected here.
>
> **Confirmed decision — role identity.** The seeded `Administrator` role's **name is locked and
> uneditable** (decided centrally, consistently across Epic 1 stories). It is therefore identified
> at runtime by **exact, case-sensitive name comparison** (`$role->name === 'Administrator'`). No
> marker column and no migration are required, which is why this story stays backend-only. Spatie
> enforces uniqueness on `(name, guard_name)`, so no second role can occupy that exact name.
>
> **Where that comparison lives:** in exactly one shared place, `App\Models\Role::isAdministratorRole()`
> — a `public static` helper specified by story
> [0008a](0008a-centralize-administrator-role-identification.md), which centralizes the same tier's
> identity for the *user* side (`UserPolicy`, `App\Livewire\Users\Index`, `CreateUser`, `UpdateUser`).
> **This story consumes that helper; it does not define its own.** Whichever of 0008a and 0009 reaches
> Phase 3 first creates it on `App\Models\Role`; the other calls it. The literal string
> `'Administrator'` is written once, in `App\Enums\RoleName::Administrator`, and nowhere else.
> Note the deliberate asymmetry with the Super Admin tier, which *is* config-driven
> (`Role::superAdminName()` reading `config('auth.super_admin.role')`): that key exists because
> `Gate::before` already needed it, not because config indirection is the house pattern. The
> Administrator name is locked precisely so it has no override path.

## Gherkin
```gherkin
Feature: Administrator-level role management and its Super-Admin-only grant

  # --- (a) Role-level enforcement: editing/deleting the seeded "Administrator" role ---

  Scenario: The Super Admin edits the seeded "Administrator" role's permissions
    Given a signed-in Super Admin
    When they change the permissions of the seeded "Administrator" role
    Then the change is saved

  Scenario: The Super Admin deletes the seeded "Administrator" role
    Given a signed-in Super Admin, with the seeded "Administrator" role held by no users
    When they delete the seeded "Administrator" role
    Then the role is deleted

  Scenario: A granted administrator edits the seeded "Administrator" role's permissions
    Given an administrator whose role was granted the "manage administrator-level roles/users" permission
    When they change the permissions of the seeded "Administrator" role
    Then the change is saved

  Scenario: A granted administrator deletes the seeded "Administrator" role
    Given an administrator whose role was granted the "manage administrator-level roles/users"
      permission, with the seeded "Administrator" role held by no users
    When they delete the seeded "Administrator" role
    Then the role is deleted

  Scenario: A broad administrator cannot edit the seeded "Administrator" role's permissions
    Given an administrator who holds the general "manage roles & permissions" permission
      but not the "manage administrator-level roles/users" permission
    When they try to change the permissions of the seeded "Administrator" role
    Then the action is denied server-side
    And that role's permissions are unchanged

  Scenario: A broad administrator cannot delete the seeded "Administrator" role
    Given an administrator who holds the general "manage roles & permissions" permission
      but not the "manage administrator-level roles/users" permission
    When they try to delete the seeded "Administrator" role
    Then the action is denied server-side
    And the role still exists

  Scenario: A custom role is not administrator-level
    Given an administrator who holds the general "manage roles & permissions" permission
      but not the "manage administrator-level roles/users" permission, with an unassigned
      custom role "Blog Editor"
    When they delete the "Blog Editor" role
    Then the role is deleted

  Scenario: A custom role whose name merely resembles "Administrator" is not administrator-level
    Given an administrator who holds the general "manage roles & permissions" permission
      but not the "manage administrator-level roles/users" permission, with an unassigned
      custom role "Administrador Regional"
    When they delete the "Administrador Regional" role
    Then the role is deleted

  Scenario: Administrator-level matching is case-sensitive
    Given an administrator who holds the general "manage roles & permissions" permission
      but not the "manage administrator-level roles/users" permission, with an unassigned
      custom role named "administrator" in lowercase
    When they delete the "administrator" role
    Then the role is deleted

  # --- (b) The Super-Admin-only grant meta-rule (wording preserved from the PRD) ---

  Scenario: Only the Super Admin sees the administrator-management grant option
    Given a signed-in Super Admin editing a role's permissions
    When they open that role's permission toggles
    Then they can see and toggle the "manage administrator-level roles/users" permission

  Scenario: A broad administrator never sees the administrator-management grant option
    Given an administrator who holds the general "manage roles & permissions" permission
      but is not the Super Admin
    When they edit a role's permissions
    Then the "manage administrator-level roles/users" toggle is not shown to them

  Scenario: The Super Admin grants a role administrator-management permission
    Given a signed-in Super Admin
    When they grant a custom role the "manage administrator-level roles/users" permission
    Then holders of that role can delete/edit the seeded "Administrator" role and
      downgrade users who hold it

  # --- (b) Server-side enforcement against a tampered grant ---

  Scenario: A tampered role save that grants administrator-management is denied
    Given an administrator who holds the general "manage roles & permissions" permission
      but is not the Super Admin
    When they submit a save of another role that includes the
      "manage administrator-level roles/users" permission
    Then the action is denied server-side
    And that role does not receive the permission

  Scenario: A tampered role save granting administrator-management to one's own role is denied
    Given an administrator who holds the general "manage roles & permissions" permission
      but is not the Super Admin
    When they submit a save of their own role that includes the
      "manage administrator-level roles/users" permission
    Then the action is denied server-side
    And their own role does not receive the permission

  Scenario: Holding administrator-management does not confer the right to grant it
    Given an administrator whose role was granted the "manage administrator-level roles/users"
      permission but who is not the Super Admin
    When they submit a save of another role that includes the
      "manage administrator-level roles/users" permission
    Then the action is denied server-side
    And that role does not receive the permission

  Scenario: A freshly granted administrator-management permission takes effect immediately
    Given an administrator whose role has just been granted the
      "manage administrator-level roles/users" permission by the Super Admin
    When they change the permissions of the seeded "Administrator" role
    Then the change is saved

  Scenario: Revoking administrator-management takes effect immediately
    Given an administrator whose role has just had the "manage administrator-level roles/users"
      permission removed by the Super Admin
    When they try to delete the seeded "Administrator" role
    Then the action is denied server-side
```

## Files to create/modify

- `app/Policies/RolePolicy.php` — **modify. This file already exists** — story
  [0008](0008-super-admin-role-invariants.md) created it, and it already has working `update()` and
  `delete()` methods. This story **adds an Administrator-level branch to those two existing methods** and
  **adds one new ability**, `grantAdministratorPermission`. It does not create the class, does not
  restructure it, and must not replace the Super Admin refusal already in it.

  > **Read [`app/Policies/RolePolicy.php`](../../../app/Policies/RolePolicy.php) before writing this.** The
  > text below is reconciled against the real shipped file as of 2026-08-19, but 0008's implementation
  > grew during its own Phase 4 security audit and may have moved again since.

  **What is there today** (verbatim shape, both methods identical apart from the name):

  ```php
  // app/Policies/RolePolicy.php — the shipped 0008 version
  class RolePolicy
  {
      public function update(User $user, Role $role): bool
      {
          if ($role->name === Role::superAdminName()) {
              return false;
          }

          return $user->hasPermissionTo('roles.manage');
      }

      public function delete(User $user, Role $role): bool { /* identical shape */ }
  }
  ```

  Three facts about that code this story must preserve rather than rediscover:

  - **The Super Admin refusal is categorical and applies to every actor, the Super Admin included.** It
    is not a permission check that a sufficiently privileged actor passes — it is an unconditional
    `return false`. `AppServiceProvider::configureAuthorization()`'s `Gate::before` bypass **defers**
    (returns `null` instead of short-circuiting `true`) when the target is the Super Admin role, which
    is what lets this refusal reach a Super Admin actor at all. That deferral was added during 0008's
    Phase 4 audit (finding F6); do not undo it, and do not assume `Gate::before` short-circuits here.
  - **`Role::superAdminName()` is the established single source of truth for that name** — config-driven
    (`config('auth.super_admin.role')`), shared by the `Gate::before` bypass, the model guards,
    `selectable()` and this policy. This story must **not** introduce a `SUPER_ADMIN_ROLE` constant of
    its own; an earlier draft did, and that is a second independent definition of exactly the thing 0008
    centralized.
  - **`Role` here is `App\Models\Role`**, and that is load-bearing — see the import rule below.

  > **Resolved — `can()` vs. `hasPermissionTo()` (human-confirmed 2026-08-19).** This story's snippet
  > below (inherited from its original draft) wrote `$user->can('roles.manage')`, while the shipped
  > `RolePolicy` writes `$user->hasPermissionTo('roles.manage')`. They are **not** interchangeable: on a
  > database with the permission tables migrated but not seeded, `hasPermissionTo()` throws
  > `PermissionDoesNotExist` (→ 500) where `can()` returns `false` (→ 403). 0008 recorded that as a
  > deliberate, documented limitation (its Phase 4 re-audit finding **F8**) and kept `hasPermissionTo()`
  > for consistency with `UserPolicy`'s six call sites. **Decision: this story uses `hasPermissionTo()`
  > throughout, matching the shipped code and every other policy in the repo** — not `can()`. The
  > both-policies F8 fix, if ever done, is a separate, explicitly-scoped story, not a side effect of this
  > one. The snippet below has been corrected accordingly.

  **What this story adds.** An Administrator-level branch in each of `update()` and `delete()`, running
  **after** the existing Super-Admin check (which stays first and unconditional), plus the new
  Super-Admin-only `grantAdministratorPermission` ability:

  ```php
  // app/Policies/RolePolicy.php — this story's additions, on top of the shipped file
  public const ADMINISTRATOR_LEVEL_PERMISSION = 'roles.manage-administrators';
  public const ROLE_MANAGEMENT_PERMISSION = 'roles.manage';

  public function update(User $user, Role $role): bool
  {
      // Still first, still unconditional. Shown in its post-0010 form: the identity check
      // routes through the persisted-identity-safe helper rather than $role->name -- see the
      // "Known residual" box above for who builds that helper if 0010 has not landed yet.
      if (Role::isSuperAdminRole($role)) {
          return false;
      }

      return Role::isAdministratorRole($role)          // added by this story
          ? $user->hasPermissionTo(self::ADMINISTRATOR_LEVEL_PERMISSION)
          : $user->hasPermissionTo(self::ROLE_MANAGEMENT_PERMISSION);
  }

  public function delete(User $user, Role $role): bool { /* same shape as update() */ }

  /** The Super-Admin-only meta-rule consumed by story 0011. */
  public function grantAdministratorPermission(User $user): bool
  {
      return $user->hasRole(Role::superAdminName(), 'web');
  }
  ```

  **`Role::isAdministratorRole($role)`, not a private `isAdministratorLevel()` on this policy.** An
  earlier draft of this story defined the comparison as a policy-private helper. That is the same
  concept story [0008a](0008a-centralize-administrator-role-identification.md) centralizes for the
  *user* side, and a private helper here would leave the codebase with two independent literal
  comparisons for one tier — precisely what 0008a exists to remove. The shared `public static`
  `App\Models\Role::isAdministratorRole(Role $role): bool` (exact, case-sensitive
  `$role->name === RoleName::Administrator->value`) is defined by 0008a; **whichever of the two stories
  lands first creates it, and the other consumes it.** Do not define a second comparison here under any
  name.

  **Import rule (enforced, not stylistic).** Every reference to the role model in this file — the
  type hints, the static calls, the `Gate::allows(..., Role::class)` contract below — is
  `App\Models\Role`, **never** `Spatie\Permission\Models\Role`. 0008 established that convention and
  backed it with a Pest `arch()` test (`tests/Unit/ArchitectureTest.php`) forbidding any file in the
  `['App', 'Database\Seeders']` namespaces from importing the package class; `config/permission.php`'s
  `models.role` binding is the single exemption. An earlier draft of this story wrote
  `\Spatie\Permission\Models\Role::class` in its story-0011 contract snippet — that would fail the
  `arch()` test outright, and more importantly the two classes are different Eloquent models over the
  same table, only one of which carries 0008's guards.

  > **Permission literals corrected to story 0002's real catalog.** Earlier drafts of this story
  > used the prose strings `'manage administrator-level roles/users'` and
  > `'manage roles & permissions'`. **Neither is seeded**, and `can()` / `hasPermissionTo()` against
  > an unseeded name throws `PermissionDoesNotExist` at runtime — so this was a correctness bug, not
  > a naming preference. 0002's task file flagged it explicitly as an outstanding correction. The
  > canonical names are **`roles.manage-administrators`** and **`roles.manage`**, per
  > [`docs/conventions/naming.md`](../../../docs/conventions/naming.md#permission-names). The Gherkin
  > above keeps the human phrases, which are business prose rather than code literals.

  > `hasRole()` is called **with its guard** (`'web'`) per
  > [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#always-pass-the-guard-to-hasrole--hasanyrole)
  > — an unguarded call resolves against the default guard, which is not guaranteed to be the one the
  > role was seeded under.

  > **Coordination rule with story 0008 (already shipped): the Super-Admin-role check runs first and
  > unconditionally**, before this story's administrator-level check. This is no longer a rule for a
  > future author to honour — it is the shape of the code that exists, and this story's branch is
  > appended below it.

  > **Known residual inherited from 0008 — resolved, and owned by story 0010 (human-confirmed
  > 2026-08-19). Do not re-decide it here.** The shipped `update()`/`delete()` identify the target with
  > `$role->name` — the *in-memory* attribute — whereas the model-level guards deliberately read the
  > **persisted** identity, because by the time a rename is in flight the in-memory name is the
  > attacker-supplied new one.
  > [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#rolepolicy--the-second-policy)
  > records it as "the documented residual the roles-screen author must resolve", addressing stories
  > 0010/0011. **Story [0010](0010-role-permission-management-backend.md) has taken ownership**, because
  > it is the first story to add real `authorize()` call sites against `RolePolicy` and therefore the
  > first to make the residual reachable. Its resolution, which this story must preserve rather than
  > relitigate:
  >
  > - 0010 promotes 0008's private instance `isSuperAdminRole()` on `App\Models\Role` to a
  >   **`public static isSuperAdminRole(self $role): bool`** taking a row, mirroring 0008a's
  >   `isAdministratorRole(self $role)` exactly, and rewrites **both** `RolePolicy` methods' Super Admin
  >   branch to call it instead of comparing `$role->name`.
  > - **Whichever of 0010 and this story reaches Phase 3 first builds that helper and converts both
  >   call sites; the other consumes it** and must **not** revert them to `$role->name === …`. Both
  >   stories edit the same two method bodies, so per
  >   [`docs/contracts.md`](../../../docs/contracts.md)'s Parallel Agent File-Ownership Rule **0009 and
  >   0010 must not be dispatched to concurrent agents** — `app/Policies/RolePolicy.php` and
  >   `app/Models/Role.php` are both shared.
  > - **This story's Administrator-level branch needs no equivalent hardening of its own.** It resolves
  >   identity through 0008a's `App\Models\Role::isAdministratorRole()`, which is hydration-safe **by
  >   construction** (it reads the row's persisted name via the shared `persistedName()` extraction) —
  >   see 0008a's boxed note on why the "callers must fully hydrate" alternative was rejected there too.
  >   So consuming the shared helper, as the bullet above already requires, is the whole of this story's
  >   obligation on this point.
  >
  > The general rule behind all of it is in
  > [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#a-guard-that-reads-a-rows-protected-identity-must-distinguish-not-hydrated-from-hydrated-but-null).

  **No `Gate::policy()` registration, and no `app/Providers/AppServiceProvider.php` change.** An earlier
  draft of this story asked for an explicit `Gate::policy(Role::class, RolePolicy::class)` line, on the
  grounds that "`Role` lives outside `app/Models`, so auto-discovery is not relied on". **That premise is
  now factually wrong**: `App\Models\Role` has lived inside `app/Models/` since story 0008, and Laravel 13
  auto-discovers `App\Policies\RolePolicy` for it by naming convention alone — which is this repo's
  documented, registration-free convention
  ([base-standards.md](../../../docs/conventions/base-standards.md#directory-structure),
  [naming.md](../../../docs/conventions/naming.md#classes)). 0008's own Phase 2 review examined and
  explicitly rejected the registration, and the policy is working today without it. Do not reinstate the
  line. (Also unchanged from the earlier draft: **do not** add the Super-Admin `Gate::before` bypass here
  — story 0002 owns it.)

- `app/Actions/Roles/EnforceAdministratorPermissionGrant.php` — **new**, single-purpose invokable
  action following the "inject single-purpose actions per-method" convention; `Roles/` mirrors the
  existing `Actions/Fortify/` one-subfolder-per-concern layout. Composed into story 0010's role-save
  path. Throws `AuthorizationException` (403) rather than silently stripping the permission, because
  the toggle is never rendered to a non-Super-Admin, so the only way this input arises is tampering
  — and Epic 1's Gherkin consistently specifies "the action is denied server-side".

  ```php
  /**
   * @param  array<int, string>  $permissionNames
   * @return array<int, string>
   *
   * @throws AuthorizationException
   */
  public function __invoke(User $actor, array $permissionNames): array
  ```

- **Call sites owned by story 0010** (coordination note, not files this story authors).
  `App\Livewire\Roles\Index` opens `mount()` with `Gate::authorize('viewAny', Role::class)` and every
  method that mutates or discloses with `Gate::authorize('create', Role::class)` /
  `Gate::authorize('update', $role)` / `Gate::authorize('delete', $role)` — the
  `App\Livewire\Users\Index` house pattern, resolving `$role` through a **fully-hydrated**
  `Role::query()->findOrFail($id)`. Its `saveRole()` injects
  `EnforceAdministratorPermissionGrant` per-method and invokes it before `syncPermissions()`.

  Two contract details, settled with 0010 on 2026-08-19 so neither story has to guess:

  - **This action's signature is unchanged: `__invoke(User $actor, array $permissionNames): array`.**
    0010's component works in permission **ids** (`roles`/`permissions` are bigint autoincrement), and
    **0010 does the id→name conversion itself**, immediately before the call, after `validate()` has
    already proven every id exists on the `web` guard. This action never sees an id.
  - **This action throws; 0010 does not pre-filter.** An earlier draft of 0010 also "silently stripped"
    `roles.manage-administrators` from the sync payload when its own flag was false — a second,
    divergent implementation of this story's rule, and one that would return HTTP 200 for a refused
    request. That behaviour has been **removed from 0010**: it calls this action and lets the
    `AuthorizationException` (403) propagate, per Epic 1's "the action is denied server-side".

### Contract consumed by story 0011 (frontend)

Unambiguous mechanism — the toggle is rendered only when this is true:

```php
use App\Models\Role;

Gate::allows('grantAdministratorPermission', Role::class)
```

Story 0011 wraps it in its own component property:

```php
use App\Models\Role;

#[Computed]
public function canGrantAdministratorPermission(): bool
{
    return Gate::allows('grantAdministratorPermission', Role::class);
}
```

**`App\Models\Role::class`, never `\Spatie\Permission\Models\Role::class`** — an earlier draft of this
section wrote the package class, which (a) would fail the `arch()` test story 0008 added
(`tests/Unit/ArchitectureTest.php` forbids that import anywhere in `['App', 'Database\Seeders']`) and
(b) would not resolve the policy at all: `Gate::getPolicyFor()` walks *subclasses* of a registered
class, and `Spatie\Permission\Models\Role` is `App\Models\Role`'s **parent**, not its child.

Story 0002's `Gate::before` bypass short-circuits this to `true` for the Super Admin before the
policy method runs. The explicit `hasRole('Super Admin')` check inside the policy is kept anyway as
defense-in-depth: it is what actually executes for every non-Super-Admin caller, and it keeps the
policy independently correct if the bypass hook is ever refactored.

## Tests to perform
- [ ] Unit test: `RolePolicy::grantAdministratorPermission()` returns true only for a Super Admin holder.
- [ ] Unit test: `RolePolicy` identifies the seeded `Administrator` role by exact, case-sensitive name, **through the shared `App\Models\Role::isAdministratorRole()` helper** — the assertion should fail if a policy-private comparison is reintroduced.
- [ ] **Regression — 0008's Super Admin refusal survives this story's edit to `update()`/`delete()`.** Both methods still refuse the Super Admin role categorically, for an actor holding `roles.manage`, for one holding `roles.manage-administrators`, and for a Super Admin actor (the case that only works because `Gate::before` defers). This story rewrites both method bodies, so `tests/Feature/Policies/RolePolicyTest.php`'s existing coverage must pass unamended — a diff to those assertions is a regression to justify, not a test to update.
- [ ] **Ordering — the Super-Admin branch wins over the Administrator branch.** Assert that the refusal for the Super Admin role is unconditional even for an actor holding `roles.manage-administrators`; a naive rewrite that puts the new administrator-level branch first would grant it.
- [ ] Integration test: the Super Admin edits the seeded `Administrator` role's permissions successfully.
- [ ] Integration test: the Super Admin deletes the unassigned seeded `Administrator` role successfully.
- [ ] Integration test: an administrator granted `roles.manage-administrators` edits the seeded `Administrator` role successfully.
- [ ] Integration test: an administrator granted `roles.manage-administrators` deletes the unassigned seeded `Administrator` role successfully.
- [ ] Integration test: the Super Admin succeeds even though the `Super Admin` role holds no explicit administrator-level permission row (exercises the bypass, not a grant).
- [ ] Integration test: the Super Admin grants a custom role `roles.manage-administrators` and the target role's permission set reflects it.
- [ ] Integration test: a grant made through the real save path takes effect without a manual permission-cache clear.
- [ ] Integration test: a revoke made through the real save path takes effect immediately.
- [ ] Negative/edge case test: a broad administrator (holds only `roles.manage`) is denied editing the seeded `Administrator` role; its permission set is unchanged.
- [ ] Negative/edge case test: a broad administrator is denied deleting the seeded `Administrator` role; the role still exists.
- [ ] Negative/edge case test: a broad administrator *can* delete an unassigned custom role `Blog Editor` (guards against over-broad matching).
- [ ] Negative/edge case test: a broad administrator *can* delete an unassigned custom role `Administrador Regional`.
- [ ] Negative/edge case test: a broad administrator *can* delete an unassigned custom role named `administrator` in lowercase (guards against case-insensitive matching).
- [ ] Negative/edge case test: a tampered role-save payload from a non-Super-Admin holding `roles.manage` that includes `roles.manage-administrators` is denied and never persisted.
- [ ] Negative/edge case test: the same tampered payload targeting the actor's **own** role is denied (self-escalation).
- [ ] Negative/edge case test: an actor who *holds* `roles.manage-administrators` but is not the Super Admin cannot grant it via a crafted payload.
- [ ] Delete-path tests use a role held by **zero** users, to isolate this permission check from the unrelated "a role in use cannot be deleted" hard block.

> Not tested here: the entire *user*-side rule — delete, downgrade **and** promotion into the
> `Administrator` role — which lives in `UserPolicy` and belongs to story **0004** (extended by
> **0005**); and whether the toggle is actually rendered in the DOM (story **0011**). The general
> "no `roles.manage` at all" gate belongs to 0002/0010.

## Expected outcome
Editing or deleting the seeded `Administrator` role is refused server-side for any administrator
lacking `roles.manage-administrators`, and succeeds for the Super Admin or for a role the
Super Admin has explicitly granted that permission. Every other custom role — including ones with
admin-sounding or differently-cased names — remains governed only by the general
`roles.manage` permission. The grant control itself is exposed to the frontend through
a single named Gate ability that is true only for the Super Admin, and a forged role-save payload
carrying that permission is rejected with a 403 rather than partially applied.

## Acceptance criteria
- [ ] Deleting or editing the seeded `Administrator` role requires `roles.manage-administrators`; denial happens server-side, not merely by hiding UI.
- [ ] "Administrator-level" resolves to exactly the seeded `Administrator` role, matched by exact case-sensitive name; no other custom role qualifies.
- [ ] The Super Admin can perform both actions without holding an explicit administrator-level permission row.
- [ ] A role the Super Admin has granted `roles.manage-administrators` can perform both actions; revoking it removes that ability immediately.
- [ ] `Gate::allows('grantAdministratorPermission', Role::class)` returns true **only** when the acting user holds the `Super Admin` role, and is documented as the contract story 0011 consumes.
- [ ] A non-Super-Admin — including one holding `roles.manage`, and including one holding `roles.manage-administrators` — cannot grant that permission to any role, including their own, even via a tampered payload; the attempt fails with a 403 and nothing is persisted.
- [ ] No Super-Admin `Gate::before` hook is registered by this story (story 0002 owns it), **no `Gate::policy()` registration is added** (`App\Policies\RolePolicy` is auto-discovered — see the file list), and no migration is introduced.
- [ ] The canonical role/permission strings are referenced from the shared definitions, not re-typed per call site: the two permission names from this policy's own constants, the Super Admin role name from `App\Models\Role::superAdminName()`, and the Administrator role identity from `App\Models\Role::isAdministratorRole()` / `App\Enums\RoleName::Administrator`. No `SUPER_ADMIN_ROLE` or `ADMINISTRATOR_ROLE` constant is introduced on `RolePolicy`.
- [ ] `App\Policies\RolePolicy`'s existing categorical Super Admin refusal in `update()`/`delete()` is preserved verbatim, still runs first, and still binds a Super Admin actor — proven by a test, since this story edits both methods.
- [ ] Every role-model reference added by this story is `App\Models\Role`; `tests/Unit/ArchitectureTest.php`'s existing `arch()` test still passes.

## Definition of Done
- [ ] Tests written and green
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met
- [ ] **Known, accepted limitation (F15/F16, human-confirmed 2026-08-19) — "administrator-level" is
      name-scoped by design, and stays that way.** A custom role granted `roles.manage-administrators`
      does **not** itself become administrator-level for the purposes of downgrade/delete protection:
      only the literally-named seeded `Administrator` role is protected. This matches the PRD's explicit
      scope — *"'Administrator-level' refers specifically to the seeded baseline 'Administrator' role —
      no other custom role, however broad its permissions, counts as administrator-level"*
      ([PRD.md](../../../docs/PRD/PRD.md), Epic 1). It is a deliberate, PRD-scoped product decision, **not
      an oversight**: do not silently "fix" it by switching to permission-set-based matching without a
      new product decision, and do not let a future audit re-file it as an open finding without checking
      this bullet first.

      *Provenance, stated precisely so the finding numbers are not garbled later.* F15 was raised by
      `appsec-auditor` during story 0004's Phase 4 **re-audit** as a sharper restatement of F2/F3: the
      guard is *role-shaped where it could be privilege-shaped* — a target holding
      `roles.manage-administrators` via a direct `model_has_permissions` grant or via a differently-named
      custom role is not covered by `UserPolicy`'s Administrator branches at all. F16 from the same
      re-audit is **informational, requiring no action**. Both were recorded against this story rather
      than against [0015](0015-harden-users-crud-security-posture.md) because they concern this
      not-yet-built mechanism rather than 0015's own code (see 0015's *Provenance* section). The human
      decision above resolves F15 as **accepted, with the PRD as the authority** — the earlier draft of
      this bullet mandated re-deriving the guard from the actual permission set, and that requirement is
      **withdrawn**.

- [ ] **Still in force from the same F2/F3 lineage — the guard must not live in one caller.**
      `App\Actions\Users\CreateUser` / `UpdateUser` currently apply whatever role, status and email they
      are handed with no authorization of their own; the Administrator-level guard exists only inside
      `App\Livewire\Users\Index`, so every non-component caller is ungated. That half of F2/F3 is **not**
      withdrawn — it is simply not this story's work: it is owned end-to-end by story
      [0008a](0008a-centralize-administrator-role-identification.md), which moves the authorization into
      both actions and centralizes the five literal-name sites behind
      `App\Models\Role::isAdministratorRole()` / `App\Enums\RoleName::Administrator`. This story's
      obligation is only to consume that shared identity rather than add a sixth comparison of its own
      (see the `RolePolicy` bullet in [Files to create/modify](#files-to-createmodify)).

---

## Phase 3/4/5 implementation record

**2026-08-19/20 — Phase 3 (implementation).** `App\Policies\RolePolicy::update()`/`delete()` gained an
Administrator-level branch after the pre-existing, unconditional Super Admin refusal — and that refusal
was itself upgraded in the same pass from `$role->name === Role::superAdminName()` to the hydration-safe
`Role::isSuperAdminRoleRow($role)`. That helper was **not** built by this story: 0008a's own Phase 4
security-audit rounds had already built it (closing 0008a's re-audit finding N2, an unrelated fix on the
*user* side), so this story consumed it rather than inventing the differently-named `isSuperAdminRole()`
its own Phase 1 draft had specified — see the "Corrected 2026-08-19/20" reconciliation notes threaded
through [`0010-role-permission-management-backend.md`](0010-role-permission-management-backend.md),
which had inherited the same stale premise (Phase 5 finding F-A, below). `RolePolicy` also gained a third
ability, `grantAdministratorPermission(User $user): bool` — the Super-Admin-only meta-rule story 0011's
frontend will consume. `App\Actions\Roles\EnforceAdministratorPermissionGrant` was created new, meant to
be composed into story 0010's (not yet built) role-save path. `App\Models\Role::superAdminName()` gained
a guard refusing to ever resolve to the same name as the locked Administrator tier.

**Phase 4 (`appsec-auditor`), three rounds — all on `EnforceAdministratorPermissionGrant`.**

- **Round 1: FAIL.** F1 (Medium) — the action only checked whether the submitted payload *contained* the
  administrator-level permission. Since `Role::syncPermissions()` replaces a role's entire permission
  set, and story 0011's toggle is never rendered to a non-Super-Admin at all, a broad administrator's
  unrelated edit to a role that already legitimately held the permission would submit a payload that
  *omitted* it — silently revoking a Super Admin's grant with no error. The mirror case (permission
  present in both lists, a genuine no-op re-save) incorrectly threw. **Closing this required a human
  product decision, not a technical derivation**: asked explicitly mid-audit (via a clarifying question),
  the human chose **preserve** — an omission of an already-granted permission is read as "the toggle
  wasn't in this actor's form", never as an intentional revoke, unless the actor can actually revoke it.
  F2 (Medium) — the membership check only recognized an exact name string; `Role::syncPermissions()`
  itself accepts names, ids, or `Permission` instances, so submitting the permission's id bypassed the
  check. F3 (Medium, **accepted, deferred to 0010** — see below) — the action is a validator composed
  into a future caller, not the write path itself. F4 (Low, fixed) — `AppServiceProvider`'s `Gate::before`
  Super Admin deferral wasn't upgraded to the hydration-safe helper in the same pass `RolePolicy` was. F5
  (Low, **accepted, pre-existing** — not this story's to fix) — the permission literal is duplicated in
  `UserPolicy` outside `RolePolicy`'s new constants. F6 (Low, fixed) — nothing prevented
  `auth.super_admin.role` from ever being configured to collide with the locked Administrator name.
- **Round 2: FAIL again.** The F1/F2 fix's first version took the "before" snapshot as a caller-supplied
  `array $currentPermissionNames` parameter, which reopened the same class of hole one level up: N1
  (Medium) — the membership-check normalization didn't flatten nested arrays/Collections the way
  `Role::syncPermissions()`'s own vendor code does, proven live to bypass the guard entirely. N2 (Medium)
  — nothing stopped a caller from asserting an untrue "before" state through that array parameter. N3
  (Medium) — the two snapshots were normalized asymmetrically, silently defeating the diff. Fixed by
  replacing `array $currentPermissionNames` with `?Role $role` — the action now reads the "before"
  snapshot itself from the model, reloaded fresh (never the possibly-stale cached relation), eliminating
  N2/N3 structurally rather than patching the demonstrated case.
- **Round 3: PASS**, after live re-derivation of N1/N2/N3 found none still worked. One new finding (NR1,
  fixed in the same pass) — the `?Role $role` parameter originally carried a `= null` default, so a
  forgotten third argument at a future call site would silently mean "nothing currently granted"; fixed
  by removing the default (the parameter stays nullable, just not optional).

**Phase 5 (`code-reviewer`), two rounds.**

- **Round 1: "changes needed."** F-A (Medium) — the action's real signature (three required params)
  diverged from what [`0010-role-permission-management-backend.md`](0010-role-permission-management-backend.md)
  documented (two params, described as "unchanged" twice) and from its own component sketch, which never
  passed the third argument — 0010 would have hit `ArgumentCountError` on every `saveRole()` call.
  Investigating this further surfaced a **much larger** pre-existing inconsistency: substantial portions
  of that file (its `app/Models/Role.php` bullet, most of its `app/Policies/RolePolicy.php` bullet
  including its own "Edit 1", one acceptance criterion, and several Definition-of-Done-adjacent
  bullets) were written on the premise that **story 0010 itself** would build the
  `Role::isSuperAdminRoleRow()`-equivalent helper (under the guessed name `isSuperAdminRole()`) and
  rewrite `RolePolicy`'s Super Admin branch to use it — a premise already false by the time this story
  reached Phase 3, since 0008a's audit rounds built the real helper first and this story consumed it
  directly. **All of it was rewritten** to reflect the real, shipped state, and a new open design
  question (F-E, below) was recorded for 0010's own Phase 1/3 to decide rather than inherit silently. F-B
  (Medium) — the F6 `RuntimeException` guard shipped with zero test coverage; two tests added
  (exact-match and case-insensitive collision). F-C (Low, design) — throwing from `superAdminName()`
  (called from `Gate::before` on nearly every authorization check in the app) was fail-closed but
  *detected lazily*, wherever the first request happened to reach it; moved to an eager call at the top
  of `AppServiceProvider::configureAuthorization()`, and the comparison was widened to case-insensitive.
  F-D through F-I: docblock-accuracy, naming, and test-hygiene fixes (a false "written once" claim now
  naming `UserPolicy`'s four outstanding literals; `$permissionNames` renamed to `$submittedPermissions`
  since it can hold names, ids, or `Permission` instances; two misleadingly-named
  `RolePolicyTest` cases renamed to describe what they actually prove; a duplicated content-scan test
  folded into the existing shared dataset in `AdministratorRoleLiteralContentScanTest.php`; the action's
  docblock trimmed of "round 2 finding N1-N3" narrative that described code which never shipped, in
  favour of stating only the durable, shipped invariants).
- **F-E (Medium, design, deliberately left open, not resolved by this story):**
  `EnforceAdministratorPermissionGrant` is a transformer — it returns the list to sync rather than
  performing the write itself — so a future caller could drop the return value or sync a different role
  than the one it authorized against, silently reopening F1/N2. Resolving this properly means deciding
  whether the action should fold in the actual `Role::syncPermissions()` call, which depends on story
  0010's real `saveRole()` shape, which does not exist yet. Recorded as an explicit open design question
  inside [`0010-role-permission-management-backend.md`](0010-role-permission-management-backend.md)
  (both a boxed note in the relevant file bullet and entry **G** in that file's `## Open questions`
  section) — 0010's own Phase 1/3 must decide and record the decision.
- **Round 2 (final): "Approved for closure."** Confirmed every round-1 finding genuinely resolved, full
  suite green, Pint and Larastan level 7 clean. A handful of trivial residual nits were found and fixed
  in the same pass: a stale pointer-comment file reference, a typo in `AppServiceProvider`'s new comment,
  and three lines discovered on a full re-read of `0010-role-permission-management-backend.md` that still
  asserted the pre-rewrite premise the F-A reconciliation had already corrected elsewhere in the same
  file (a "Tests to perform" bullet instructing 0010 to prove a fix it doesn't own, a regression bullet
  claiming 0010 "rewrites the Super Admin branch and promotes a private model method", and an "Open
  questions" entry claiming 0010 "hardens the Super Admin check") — all corrected to state the real,
  already-closed status and point at this story's own test coverage instead.

**Known, accepted, permanently-not-fixed limitations — recorded here so a future audit does not re-file
them as new findings:**

- **F3** — the action's guard is caller-composed rather than being the write path itself. Accepted
  because the action has no production caller yet; folding the write in is exactly F-E, deliberately
  deferred to 0010's own Phase 1/3.
- **F5** — the `roles.manage-administrators` permission literal is written four times in `UserPolicy`
  outside `RolePolicy`'s named constants. Pre-existing (predates this story), not this story's to fix.
- **F15/F16** (pre-existing, from story 0004's Phase 4 audit, reconfirmed by this story's own Definition
  of Done above) — "administrator-level" is deliberately name-scoped; a custom role granted
  `roles.manage-administrators` does not itself become protected the way the seeded `Administrator` role
  is. A PRD-scoped product decision, not a gap.

**Status: Phase 5 passed, documentation synced in the same pass as this record, ready for closure.**
