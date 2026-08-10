# [0009] Administrator-level permission — role-level enforcement + Super-Admin-only grant visibility

## Description
Enforce, server-side, that **editing or deleting the seeded baseline "Administrator" role itself**
requires the distinct `manage administrator-level roles/users` permission, and implement the
meta-rule that the control to **grant** that permission to a role is available **only to the Super
Admin** — never to any other administrator, however broad their permissions. Exposes a stable
authorization check that story 0010's frontend consumes to conditionally render the toggle, and
rejects tampered role-save payloads that try to bypass it.

## Type
backend | includes database-expert: **no**

> **Dependencies (do not re-implement here).**
> - **0002** seeds the `Super Admin` role, the baseline `Administrator` role, and the
>   `manage roles & permissions` / `manage administrator-level roles/users` permissions, **and owns
>   the global Super-Admin `Gate::before` bypass hook.** 0009 consumes both; it registers neither.
> - **0008** (Roles & Permissions management — backend) owns the action that persists a role's
>   name/permissions and the role-delete action. 0009 hooks its enforcement into those call sites;
>   it does not create a competing role-CRUD path.
> - **0010** (frontend) renders the permission toggles and consumes the check defined below.
> - **0004** owns the *user*-side rule (an administrator lacking the permission cannot delete or
>   downgrade a **user** holding the `Administrator` role). **0003** owns the promotion side
>   (assigning a user *into* the `Administrator` role is gated by the same permission). Both are
>   cross-referenced, not duplicated here.
>
> **Confirmed decision — role identity.** The seeded `Administrator` role's **name is locked and
> uneditable** (decided centrally, consistently across Epic 1 stories). It is therefore identified
> at runtime by **exact, case-sensitive name comparison** (`$role->name === 'Administrator'`). No
> marker column and no migration are required, which is why this story stays backend-only. Spatie
> enforces uniqueness on `(name, guard_name)`, so no second role can occupy that exact name.

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

- `app/Policies/RolePolicy.php` — **new.** Single source of truth for role authorization. Holds
  the canonical name constants and three abilities: `update`, `delete`, and
  `grantAdministratorPermission`. Chosen over inline Livewire checks or provider Gates because it
  keeps "what counts as administrator-level" in exactly one place and is reusable from any future
  call site (`$this->authorize(...)`, `@can`, middleware).

  ```php
  final class RolePolicy
  {
      public const SUPER_ADMIN_ROLE = 'Super Admin';
      public const ADMINISTRATOR_ROLE = 'Administrator';
      public const ADMINISTRATOR_LEVEL_PERMISSION = 'manage administrator-level roles/users';

      public function update(User $user, Role $role): bool
      {
          return $this->isAdministratorLevel($role)
              ? $user->can(self::ADMINISTRATOR_LEVEL_PERMISSION)
              : $user->can('manage roles & permissions');
      }

      public function delete(User $user, Role $role): bool { /* same shape as update() */ }

      /** The Super-Admin-only meta-rule consumed by story 0010. */
      public function grantAdministratorPermission(User $user): bool
      {
          return $user->hasRole(self::SUPER_ADMIN_ROLE);
      }

      private function isAdministratorLevel(Role $role): bool
      {
          return $role->name === self::ADMINISTRATOR_ROLE;
      }
  }
  ```

  > The `Super Admin` role's *own* categorical immutability is a separate sibling story that also
  > touches `update`/`delete`. Coordination rule: **the Super-Admin-role check runs first and
  > unconditionally**, before this story's administrator-level check.

- `app/Providers/AppServiceProvider.php` — **modify `boot()`.** Register
  `Gate::policy(Role::class, RolePolicy::class)` explicitly (this app has no `AuthServiceProvider`,
  and `Role` lives outside `app/Models`, so auto-discovery is not relied on). **Do not add the
  Super-Admin `Gate::before` bypass here — story 0002 owns it.**

- `app/Actions/Roles/EnforceAdministratorPermissionGrant.php` — **new**, single-purpose invokable
  action following the "inject single-purpose actions per-method" convention; `Roles/` mirrors the
  existing `Actions/Fortify/` one-subfolder-per-concern layout. Composed into story 0008's role-save
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

- **Call sites owned by story 0008** (coordination note, not files this story authors): 0008's
  role update/delete actions add `$this->authorize('update', $role)` / `$this->authorize('delete',
  $role)`, and its save path invokes `EnforceAdministratorPermissionGrant` before syncing
  permissions.

### Contract consumed by story 0010 (frontend)

Unambiguous mechanism — the toggle is rendered only when this is true:

```php
Gate::allows('grantAdministratorPermission', \Spatie\Permission\Models\Role::class)
```

Story 0010 wraps it in its own component property:

```php
#[Computed]
public function canGrantAdministratorPermission(): bool
{
    return Gate::allows('grantAdministratorPermission', Role::class);
}
```

Story 0002's `Gate::before` bypass short-circuits this to `true` for the Super Admin before the
policy method runs. The explicit `hasRole('Super Admin')` check inside the policy is kept anyway as
defense-in-depth: it is what actually executes for every non-Super-Admin caller, and it keeps the
policy independently correct if the bypass hook is ever refactored.

## Tests to perform
- [ ] Unit test: `RolePolicy::grantAdministratorPermission()` returns true only for a Super Admin holder.
- [ ] Unit test: `RolePolicy` identifies the seeded `Administrator` role by exact, case-sensitive name.
- [ ] Integration test: the Super Admin edits the seeded `Administrator` role's permissions successfully.
- [ ] Integration test: the Super Admin deletes the unassigned seeded `Administrator` role successfully.
- [ ] Integration test: an administrator granted `manage administrator-level roles/users` edits the seeded `Administrator` role successfully.
- [ ] Integration test: an administrator granted `manage administrator-level roles/users` deletes the unassigned seeded `Administrator` role successfully.
- [ ] Integration test: the Super Admin succeeds even though the `Super Admin` role holds no explicit administrator-level permission row (exercises the bypass, not a grant).
- [ ] Integration test: the Super Admin grants a custom role `manage administrator-level roles/users` and the target role's permission set reflects it.
- [ ] Integration test: a grant made through the real save path takes effect without a manual permission-cache clear.
- [ ] Integration test: a revoke made through the real save path takes effect immediately.
- [ ] Negative/edge case test: a broad administrator (holds only `manage roles & permissions`) is denied editing the seeded `Administrator` role; its permission set is unchanged.
- [ ] Negative/edge case test: a broad administrator is denied deleting the seeded `Administrator` role; the role still exists.
- [ ] Negative/edge case test: a broad administrator *can* delete an unassigned custom role `Blog Editor` (guards against over-broad matching).
- [ ] Negative/edge case test: a broad administrator *can* delete an unassigned custom role `Administrador Regional`.
- [ ] Negative/edge case test: a broad administrator *can* delete an unassigned custom role named `administrator` in lowercase (guards against case-insensitive matching).
- [ ] Negative/edge case test: a tampered role-save payload from a non-Super-Admin holding `manage roles & permissions` that includes `manage administrator-level roles/users` is denied and never persisted.
- [ ] Negative/edge case test: the same tampered payload targeting the actor's **own** role is denied (self-escalation).
- [ ] Negative/edge case test: an actor who *holds* `manage administrator-level roles/users` but is not the Super Admin cannot grant it via a crafted payload.
- [ ] Delete-path tests use a role held by **zero** users, to isolate this permission check from the unrelated "a role in use cannot be deleted" hard block.

> Not tested here: the *user*-side delete/downgrade rule (story **0004**), promotion into the
> `Administrator` role (story **0003**), and whether the toggle is actually rendered in the DOM
> (story **0010**). The general "no `manage roles & permissions` at all" gate belongs to 0002/0008.

## Expected outcome
Editing or deleting the seeded `Administrator` role is refused server-side for any administrator
lacking `manage administrator-level roles/users`, and succeeds for the Super Admin or for a role the
Super Admin has explicitly granted that permission. Every other custom role — including ones with
admin-sounding or differently-cased names — remains governed only by the general
`manage roles & permissions` permission. The grant control itself is exposed to the frontend through
a single named Gate ability that is true only for the Super Admin, and a forged role-save payload
carrying that permission is rejected with a 403 rather than partially applied.

## Acceptance criteria
- [ ] Deleting or editing the seeded `Administrator` role requires `manage administrator-level roles/users`; denial happens server-side, not merely by hiding UI.
- [ ] "Administrator-level" resolves to exactly the seeded `Administrator` role, matched by exact case-sensitive name; no other custom role qualifies.
- [ ] The Super Admin can perform both actions without holding an explicit administrator-level permission row.
- [ ] A role the Super Admin has granted `manage administrator-level roles/users` can perform both actions; revoking it removes that ability immediately.
- [ ] `Gate::allows('grantAdministratorPermission', Role::class)` returns true **only** when the acting user holds the `Super Admin` role, and is documented as the contract story 0010 consumes.
- [ ] A non-Super-Admin — including one holding `manage roles & permissions`, and including one holding `manage administrator-level roles/users` — cannot grant that permission to any role, including their own, even via a tampered payload; the attempt fails with a 403 and nothing is persisted.
- [ ] No Super-Admin `Gate::before` hook is registered by this story (story 0002 owns it) and no migration is introduced.
- [ ] The canonical role/permission strings are referenced from shared constants, not re-typed per call site.

## Definition of Done
- [ ] Tests written and green
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met
