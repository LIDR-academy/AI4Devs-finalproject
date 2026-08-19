# [0010] Administrator-level permission — role-level enforcement + Super-Admin-only grant visibility

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
> - **0009** (Roles & Permissions management — backend) owns the action that persists a role's
>   name/permissions and the role-delete action. This story hooks its enforcement into those call
>   sites; it does not create a competing role-CRUD path.
> - **0008** (Super Admin role invariants — **closed 2026-08-18**) already created `App\Models\Role`,
>   `App\Enums\RoleName`, `App\Models\Role::superAdminName()` and — importantly for this story —
>   **`App\Policies\RolePolicy` itself**, with working `update()`/`delete()` methods that already refuse
>   the Super Admin role categorically. This story **modifies** that policy; it does not create it. Read
>   [`app/Policies/RolePolicy.php`](../../app/Policies/RolePolicy.php) and
>   [`app/Models/Role.php`](../../app/Models/Role.php) before Phase 3 — 0008's implementation grew
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
> **This story consumes that helper; it does not define its own.** Whichever of 0008a and 0010 reaches
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
  [0008](done/0008-super-admin-role-invariants.md) created it, and it already has working `update()` and
  `delete()` methods. This story **adds an Administrator-level branch to those two existing methods** and
  **adds one new ability**, `grantAdministratorPermission`. It does not create the class, does not
  restructure it, and must not replace the Super Admin refusal already in it.

  > **Read [`app/Policies/RolePolicy.php`](../../app/Policies/RolePolicy.php) before writing this.** The
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
      if ($role->name === Role::superAdminName()) {   // existing, unchanged, still first
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
  > [`docs/conventions/naming.md`](../../docs/conventions/naming.md#permission-names). The Gherkin
  > above keeps the human phrases, which are business prose rather than code literals.

  > `hasRole()` is called **with its guard** (`'web'`) per
  > [`docs/security/authorization-patterns.md`](../../docs/security/authorization-patterns.md#always-pass-the-guard-to-hasrole--hasanyrole)
  > — an unguarded call resolves against the default guard, which is not guaranteed to be the one the
  > role was seeded under.

  > **Coordination rule with story 0008 (already shipped): the Super-Admin-role check runs first and
  > unconditionally**, before this story's administrator-level check. This is no longer a rule for a
  > future author to honour — it is the shape of the code that exists, and this story's branch is
  > appended below it.

  > **Known residual inherited from 0008, worth a decision here rather than a rediscovery.** The
  > shipped `update()`/`delete()` identify the target with `$role->name` — the *in-memory* attribute —
  > whereas the model-level guards deliberately read the **persisted** identity, because by the time a
  > rename is in flight the in-memory name is the attacker-supplied new one.
  > [`docs/architecture/authorization.md`](../../docs/architecture/authorization.md#rolepolicy--the-second-policy)
  > records this explicitly as "the documented residual the roles-screen author must resolve" — and this
  > story is (with 0009/0011) that author. Phase 1 of this story should decide whether the new
  > Administrator-level branch reads persisted identity too; the same rename-in-flight reasoning applies
  > to it, and the general rule is in
  > [`docs/security/authorization-patterns.md`](../../docs/security/authorization-patterns.md#a-guard-that-reads-a-rows-protected-identity-must-distinguish-not-hydrated-from-hydrated-but-null).

  **No `Gate::policy()` registration, and no `app/Providers/AppServiceProvider.php` change.** An earlier
  draft of this story asked for an explicit `Gate::policy(Role::class, RolePolicy::class)` line, on the
  grounds that "`Role` lives outside `app/Models`, so auto-discovery is not relied on". **That premise is
  now factually wrong**: `App\Models\Role` has lived inside `app/Models/` since story 0008, and Laravel 13
  auto-discovers `App\Policies\RolePolicy` for it by naming convention alone — which is this repo's
  documented, registration-free convention
  ([base-standards.md](../../docs/conventions/base-standards.md#directory-structure),
  [naming.md](../../docs/conventions/naming.md#classes)). 0008's own Phase 2 review examined and
  explicitly rejected the registration, and the policy is working today without it. Do not reinstate the
  line. (Also unchanged from the earlier draft: **do not** add the Super-Admin `Gate::before` bypass here
  — story 0002 owns it.)

- `app/Actions/Roles/EnforceAdministratorPermissionGrant.php` — **new**, single-purpose invokable
  action following the "inject single-purpose actions per-method" convention; `Roles/` mirrors the
  existing `Actions/Fortify/` one-subfolder-per-concern layout. Composed into story 0009's role-save
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

- **Call sites owned by story 0009** (coordination note, not files this story authors): 0009's
  role update/delete actions add `$this->authorize('update', $role)` / `$this->authorize('delete',
  $role)`, and its save path invokes `EnforceAdministratorPermissionGrant` before syncing
  permissions.

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
> "no `roles.manage` at all" gate belongs to 0002/0009.

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
      ([PRD.md](../../docs/PRD/PRD.md), Epic 1). It is a deliberate, PRD-scoped product decision, **not
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
