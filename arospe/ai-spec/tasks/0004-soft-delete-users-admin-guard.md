# [0004] Soft-delete users + administrator-level protection guard

## Description
Add soft deletion to `users` so removing a user marks the row deleted instead of destroying it,
preserving historical references, and free the deleted user's email address for reuse by
obfuscating it at delete time. Add a server-side authorization guard so an administrator lacking
the "manage administrator-level roles/users" permission cannot delete or downgrade a user holding
the seeded baseline "Administrator" role.

## Type
backend | includes database-expert: **yes**

Related sibling stories (dependencies and scope boundaries — **not** implemented here):
- **0002** seeds the roles/permissions catalog (the "Administrator" role, the Super Admin role, and
  the "manage administrator-level roles/users" permission) **and owns the `Gate::before` Super Admin
  bypass wiring**. This story assumes both exist; it only *enforces* the permission at user level.
- **0003** adds the `status` column, the Fortify login block, and the role-assignment surface
  (`syncRoles()`) — and therefore owns **promotion-to-Administrator gating**. Not this story.
- **0009** owns **role-level** enforcement (editing/deleting the "Administrator" role itself) and the
  meta-rule about who may see/grant the permission. Not this story.

## Gherkin
```gherkin
Feature: Soft-deleting users and protecting administrator-level accounts

  # --- Soft-delete mechanics ---

  Scenario: Deleting a user soft-deletes the record
    Given a user administrator, with an existing user "Diego Ferrer"
    When they delete that user
    Then the user is marked deleted rather than physically removed, so historical references are preserved

  Scenario: A soft-deleted user disappears from the active users list
    Given a user administrator, with a user "Diego Ferrer" who has been deleted
    When they view the active users list
    Then "Diego Ferrer" is not listed

  Scenario: A soft-deleted user is still retrievable when deleted records are included
    Given a user administrator, with a user "Diego Ferrer" who has been deleted
    When they look up that user including deleted records
    Then the user record is returned with its deletion timestamp set

  Scenario: Deleting a user leaves their remaining details untouched
    Given a user administrator, with a user "Diego Ferrer" holding the role "Editor"
    When they delete that user
    Then the user's name and role assignment are unchanged on the retained record

  Scenario: Deleting a user frees their email address for reuse
    Given a user administrator, with a deleted user whose email was "diego.ferrer@arospe.es"
    When they create a new user with the email "diego.ferrer@arospe.es"
    Then the new user is created successfully

  Scenario: A deleted user's original email address is not recoverable
    Given a user administrator, with a deleted user whose email was "diego.ferrer@arospe.es"
    When they inspect that deleted user's stored email address
    Then it is an obfuscated placeholder and the original address is gone
      (an accepted tradeoff — this system keeps no audit log)

  Scenario: Deleting a user does not remove their passkeys
    Given a user administrator, with a user "Diego Ferrer" who has a registered passkey
    When they delete that user
    Then the user's passkey records still exist

  # --- Deleted users cannot authenticate ---

  Scenario: A soft-deleted user cannot sign in with their password
    Given a user who has been deleted
    When that user tries to sign in with the credentials they used before deletion
    Then sign-in is refused and no session is granted

  Scenario: A soft-deleted user cannot sign in with a passkey
    Given a user who has been deleted and who had registered a passkey
    When that user tries to sign in with that passkey
    Then sign-in is refused and no session is granted

  Scenario: A route bound to a soft-deleted user is not found
    Given a user administrator, with a user who has been deleted
    When they open a route bound to that deleted user's identifier
    Then the request is rejected as not found

  # --- Guard: deleting an Administrator-role holder ---

  Scenario: A regular administrator cannot delete a user holding the "Administrator" role
    Given an administrator without the "manage administrator-level roles/users" permission
    When they try to delete another user who holds the seeded "Administrator" role
    Then the action is denied server-side

  Scenario: A permitted administrator can delete a user holding the "Administrator" role
    Given an administrator holding the "manage administrator-level roles/users" permission
    When they delete another user who holds the seeded "Administrator" role
    Then the deletion is allowed

  Scenario: The Super Admin can delete a user holding the "Administrator" role
    Given a signed-in Super Admin
    When they delete another user who holds the seeded "Administrator" role
    Then the deletion is allowed, the Super Admin bypassing permission checks entirely

  Scenario: A broad custom role does not count as administrator-level for deletion
    Given an administrator without the "manage administrator-level roles/users" permission
    When they delete another user who holds a broad custom role that is not "Administrator"
    Then the deletion is allowed

  Scenario: An ordinary user without roles is not protected from deletion
    Given an administrator without the "manage administrator-level roles/users" permission
    When they delete another user who holds no role at all
    Then the deletion is allowed

  Scenario: The general role-management permission does not confer administrator-level deletion
    Given an administrator holding only the general "manage roles & permissions" permission
    When they try to delete another user who holds the seeded "Administrator" role
    Then the action is denied server-side

  # --- Guard: downgrading an Administrator-role holder ---

  Scenario: A regular administrator cannot downgrade a user holding the "Administrator" role
    Given an administrator without the "manage administrator-level roles/users" permission
    When they try to downgrade another user who holds the seeded "Administrator" role
    Then the action is denied server-side

  Scenario: A permitted administrator can downgrade a user holding the "Administrator" role
    Given an administrator holding the "manage administrator-level roles/users" permission
    When they downgrade another user who holds the seeded "Administrator" role
    Then the change is allowed

  Scenario: The Super Admin can downgrade a user holding the "Administrator" role
    Given a signed-in Super Admin
    When they downgrade another user who holds the seeded "Administrator" role
    Then the change is allowed

  Scenario: Changing a non-administrator's role is never blocked by this guard
    Given an administrator without the "manage administrator-level roles/users" permission
    When they change the role of another user who does not hold the seeded "Administrator" role
    Then the change is allowed

  # --- Self-targeting (no exception) ---

  Scenario: A regular administrator cannot delete their own administrator-level account
    Given an administrator who holds the seeded "Administrator" role
      but not the "manage administrator-level roles/users" permission
    When they try to delete their own account
    Then the action is denied server-side

  Scenario: A regular administrator cannot downgrade their own administrator-level account
    Given an administrator who holds the seeded "Administrator" role
      but not the "manage administrator-level roles/users" permission
    When they try to downgrade their own role
    Then the action is denied server-side

  # --- Edge cases ---

  Scenario: A target holding "Administrator" alongside another role is still protected
    Given an administrator without the "manage administrator-level roles/users" permission
    When they try to delete another user who holds both "Administrator" and "Editor"
    Then the action is denied server-side

  Scenario: The last remaining administrator is not specially protected
    Given a signed-in Super Admin, with exactly one user holding the seeded "Administrator" role
    When they delete that last administrator
    Then the deletion is allowed, no headcount rule applying

  Scenario: The guard cannot be bypassed by invoking the delete path directly
    Given an administrator without the "manage administrator-level roles/users" permission
    When they invoke the delete authorization check directly rather than through the interface
    Then the action is denied server-side, proving the rule is not merely hidden in the interface
```

## Files to create/modify

**Migration** (new alteration migration — never hand-edit the historical `create_*` files), scaffold
with `php artisan make:migration add_soft_deletes_to_users_table --no-interaction`:

- `database/migrations/<ts>_add_soft_deletes_to_users_table.php` — adds the nullable `deleted_at`
  timestamp. The real current column order was traced through every migration (the five
  `2026_07_22_1000xx` UUID migrations only rename/retype `id` in place, they never move columns), so
  `updated_at` is genuinely last and `deleted_at` goes after it:

  ```php
  public function up(): void
  {
      Schema::table('users', function (Blueprint $table): void {
          $table->softDeletes()->after('updated_at');
      });
  }

  public function down(): void
  {
      Schema::table('users', function (Blueprint $table): void {
          $table->dropColumn('deleted_at');
      });
  }
  ```

  **No index on `deleted_at`** and **no change to the `email` unique index.** Rationale for both is in
  [Expected outcome](#expected-outcome) and the Definition of Done notes.

**Backend code:**

- `app/Models/User.php` — three changes:
  1. Add `Illuminate\Database\Eloquent\SoftDeletes` to the trait list (alphabetical slot: after
     `PasskeyAuthenticatable`, before `TwoFactorAuthenticatable`, matching the file's existing
     ordering and Pint style).
  2. Add `@property Carbon|null $deleted_at` to the class docblock and `'deleted_at' => 'datetime'`
     to `casts()` — `base-standards.md` requires the `@property` block stay in sync with the migration.
  3. Override `delete(): bool` to obfuscate the email before soft-deleting, wrapped in
     `DB::transaction()`, writing via `saveQuietly()` and then calling `parent::delete()`:

  ```php
  // shape, not final code
  public function delete(): bool
  {
      return DB::transaction(function (): bool {
          $this->email = "deleted+{$this->id}@deleted.invalid";
          $this->email_verified_at = null;
          $this->saveQuietly();

          return (bool) parent::delete();
      });
  }
  ```

  **Obfuscation format — `deleted+{id}@deleted.invalid`**, e.g.
  `deleted+01935e3a-4b2f-7c91-8a6d-3f5b7c9d1e02@deleted.invalid`. Anchored to the immutable UUIDv7
  `id` rather than to any original email content, so it is collision-proof, is reproduced identically
  if a restored user is deleted again, and stays greppable/joinable to `passkeys` and `sessions` rows
  by a human reading the database. `.invalid` is the RFC 2606 reserved TLD, guaranteed never to
  resolve, so it can never collide with an address anyone could register. It fits `users.email`
  (`string`, 255) and still satisfies a bare `'email'` validation rule (syntax-only, no DNS check).

  Chosen over a `deleting` model-event listener (which fires *before* `runSoftDelete()` builds its own
  narrow `UPDATE`, so it would need its own explicit save anyway — no simpler, just less locally
  visible) and over an `app/Actions/` class (a future caller could call `$user->delete()` directly and
  silently skip it; the override is structurally inescapable for instance deletes).

- `app/Policies/UserPolicy.php` (**new**) — the server-side guard, scaffolded with
  `php artisan make:policy UserPolicy --model=User --no-interaction`. Auto-discovered from
  `App\Policies\{Model}Policy` → `App\Models\{Model}`; **no provider registration needed** (this repo
  has no `AuthServiceProvider`, and none should be added). Two abilities:

  ```php
  // shape, not final code
  public function delete(User $actor, User $target): bool
  {
      if (! $target->hasRole('Administrator')) {
          return true;
      }

      return $actor->hasPermissionTo('manage administrator-level roles/users');
  }

  public function downgrade(User $actor, User $target): bool
  {
      if (! $target->hasRole('Administrator')) {
          return true;
      }

      return $actor->hasPermissionTo('manage administrator-level roles/users');
  }
  ```

  No self-targeting exception: the same rule applies when `$actor` and `$target` are the same user.
  A Policy was chosen over a bare `Gate` closure (no natural home for two related abilities, not
  unit-testable as a class), over an `app/Actions/` class (that convention is for state changes, not
  yes/no checks), and over a FormRequest (this repo has none anywhere — Livewire validates inline).

  > **Note for `code-reviewer`:** `app/Policies/` does not exist yet and is not listed in
  > `conventions/base-standards.md`'s directory structure. It is Laravel's standard location and sits
  > inside the existing `app/` tree rather than being a new top-level folder, but the directory-structure
  > doc will need a line adding in Phase 6.

**Tests** (paths verified against the real tree):

- `tests/Feature/Policies/UserPolicyTest.php` (**new**) — the full authorization matrix.
- `tests/Feature/Models/UserSoftDeleteTest.php` (**new**) — soft-delete mechanics, email obfuscation
  and reuse, passkey survival.
- `tests/Feature/Auth/AuthenticationTest.php` (**existing — extend**) — a deleted user cannot sign in.
- `tests/Feature/Settings/SecurityTest.php` (**existing — extend**) — a deleted user cannot sign in
  with a passkey.
- `tests/Feature/Models/UserRouteBindingTest.php` (**existing — extend**) — a deleted user's
  identifier 404s.

**Explicitly NOT in this story** (listed so reviewers don't reopen them): `app/Providers/AppServiceProvider.php`
(the `Gate::before` Super Admin bypass belongs to 0002); any role-assignment/`syncRoles()` surface and
promotion gating (0003); any Users-CRUD Livewire component; `database/factories/UserFactory.php`
(Laravel's base `Factory::trashed()` state works automatically once the model uses `SoftDeletes`).

## Tests to perform
- [ ] Unit/model: `delete()` sets `deleted_at` and the row still exists; `deleted_at` is null on a
      freshly created user; `withTrashed()->find()` returns the deleted user; `onlyTrashed()` returns
      exactly the deleted set; default queries (`User::all()`, `User::query()`) exclude deleted users.
- [ ] Unit/model: deleting leaves `name` and role assignments untouched (it is a flag, not a data wipe).
- [ ] Integration: after deleting a user, a new user can be created with that user's original email;
      the deleted row's stored email matches `deleted+{id}@deleted.invalid` and `email_verified_at` is null.
- [ ] Integration: obfuscation is collision-proof — deleting two users, then re-deleting a restored
      user, never produces a duplicate-key error.
- [ ] Integration: a deleted user's `passkeys` rows survive (the `cascadeOnDelete()` FK does **not** fire
      on a soft delete, because Eloquent issues an `UPDATE`, not a `DELETE`).
- [ ] Integration/auth: a deleted user cannot authenticate via `POST /login` (verifying the automatic
      `SoftDeletingScope` behavior rather than assuming it); a deleted user cannot complete **passkey**
      sign-in — `laravel/passkeys` resolves the user through its own flow and it is **unverified**
      whether that path carries the global scope, so this needs an explicit negative test, not an
      assumption.
- [ ] Integration/binding: a deleted user's UUID 404s via model-not-found on a user-bound route.
- [ ] Policy — delete matrix: denied for an administrator without the permission against an
      "Administrator" target; allowed for an administrator **with** it; allowed for the Super Admin;
      allowed against a broad custom-role target; allowed against a role-less target; **denied** for an
      administrator holding only the general "manage roles & permissions" permission (proving the two
      permissions are checked independently, not conflated).
- [ ] Policy — downgrade matrix: the same six cases.
- [ ] Policy — self-targeting: denied for self-delete and self-downgrade when the actor holds
      "Administrator" without the permission.
- [ ] Policy — multi-role edge: a target holding both "Administrator" and another role is protected
      (role presence anywhere in the set, not exclusivity).
- [ ] Policy — headcount edge: deleting the **last** remaining "Administrator" is **not** specially
      blocked. Asserted explicitly so a future undocumented "last admin" rule cannot land silently.
- [ ] Negative/server-side proof: invoking `Gate::forUser($actor)->authorize('delete', $target)` (and
      the downgrade equivalent) directly, bypassing any interface state, still throws
      `AuthorizationException` — this is the test that actually proves the PRD's "denied server-side,
      not merely hidden in the UI" wording.
- [ ] Regression (stay green): the existing `tests/Feature/Auth/*`, `tests/Feature/Settings/*`,
      `tests/Feature/Models/*` and `tests/Unit/Models/UserTest.php` suites — the `SoftDeletes` global
      scope silently rewrites every `User` query in the app.

**Test-setup requirements** (carried from `backend-qa`, not optional):
- Spatie's permission cache is **not** rolled back by `RefreshDatabase` and will leak stale checks
  between tests in the same run. Flush it in `beforeEach()` via
  `app(PermissionRegistrar::class)->forgetCachedPermissions()`, or point `permission.cache.store` at
  the `array` driver in the test config.
- Create the "Administrator" role and the permission locally in test setup
  (`Role::findOrCreate(...)` / `Permission::findOrCreate(...)`) rather than depending on story 0002's
  full production seeder, keeping these tests independent. If 0002 exposes the role/permission names as
  constants or config, reference that source instead of retyping the literals in two places.

## Expected outcome
Deleting a user through the model marks the row deleted, rewrites its email to a collision-proof
placeholder, and leaves every historical reference (passkeys, sessions, role assignments) physically
intact. The deleted user vanishes from default queries, from any active users list, from route-model
binding, and from both password and passkey sign-in — while their original email address becomes
immediately available for a new registration. Independently, `UserPolicy` denies deletion and
downgrade of any user holding the seeded "Administrator" role to any actor lacking the
"manage administrator-level roles/users" permission, including when the actor targets themselves, and
that denial holds when the check is invoked directly rather than through an interface.

## Acceptance criteria
- [ ] `users` has a nullable `deleted_at` column added by a new alteration migration with a symmetric
      `down()`; the historical `create_*` migrations are untouched.
- [ ] `App\Models\User` uses `SoftDeletes`, declares `@property Carbon|null $deleted_at`, and casts
      `deleted_at` to `datetime`.
- [ ] Deleting a user preserves the row (no physical delete) and preserves its passkeys, sessions, and
      role assignments.
- [ ] Soft-deleted users are excluded from default queries, from the active users list, from
      route-model binding, and from both password and passkey sign-in.
- [ ] Deleting a user obfuscates the stored email to `deleted+{id}@deleted.invalid` and nulls
      `email_verified_at`, making the original address immediately reusable for a new user.
- [ ] `App\Policies\UserPolicy` denies `delete` and `downgrade` against a target holding the seeded
      "Administrator" role to any actor lacking the "manage administrator-level roles/users"
      permission — including when the actor is the target — and allows it otherwise.
- [ ] The guard treats "administrator-level" as **specifically** the seeded "Administrator" role: no
      other custom role, however broad its permissions, triggers it.
- [ ] The general "manage roles & permissions" permission does **not** satisfy the guard.
- [ ] Denial is enforced server-side and holds under direct invocation, not merely hidden in the UI.

## Definition of Done
- [ ] Tests written and green (new policy + soft-delete suites, plus all listed regressions).
- [ ] Code reviewed (code-reviewer) — including the `app/Policies/` directory-convention note above.
- [ ] No security findings (appsec-auditor).
- [ ] Documentation updated (docs-keeper) — `docs/database/schema.md` (`deleted_at` column + the
      soft-delete note), `docs/architecture/authorization.md` (the first real permission check in the
      app), and `docs/conventions/base-standards.md` (the new `app/Policies/` directory).
- [ ] Acceptance criteria met.
- [ ] **Accepted, human-confirmed tradeoff — the original email is unrecoverable.** This repo has no
      audit-log table, so obfuscating the email at delete time permanently destroys the original
      address. Freeing the address for reuse was chosen deliberately over retaining it. If an audit
      trail is ever added, capturing the pre-obfuscation email becomes a candidate follow-up.
- [ ] **Known constraint — never bulk-delete `User` rows via the query builder.** `User::whereIn(...)->delete()`
      bypasses model instance methods entirely, skipping the email obfuscation. Every current call site
      uses instance `->delete()`; this constraint must be documented alongside the override so it stays
      true.
- [ ] **Known limitation — a restored user keeps the obfuscated email.** `SoftDeletes::restore()` exists
      on the model for free, but no restore call site exists anywhere in the app and none is built here.
      A restored user would need an admin to re-enter their address manually. Carry a one-line PHPDoc
      note on the overridden `delete()` flagging this for whoever builds a restore flow.
- [ ] **Deliberate schema omissions, recorded so they are not mistaken for oversights.** (a) **No index
      on `deleted_at`**: on MySQL 8.4 at this table's expected size, `deleted_at IS NULL` matches the
      large majority of rows, so the optimizer would very likely reject the index in favour of a scan,
      while every insert and delete pays for maintaining it. Revisit once story 0003's `status` column
      fixes the real active-list query shape — a composite index over both columns would then be the
      right shape, not a standalone one. (b) **No change to the `email` unique index**: the obfuscation
      approach frees the address without touching it. A composite unique on `(email, deleted_at)` was
      considered and **ruled out as unsafe on MySQL** — `NULL <> NULL` for uniqueness purposes, so all
      active users (`deleted_at IS NULL`) would stop being constrained against sharing an email, a
      correctness regression on the exact invariant we need to keep.
- [ ] **Deferred to sibling stories, not gaps in this one:** session invalidation on delete and
      `remember_token` handling (0003's login-blocking work, and worth surfacing to `appsec-auditor` in
      Phase 4 regardless); promotion-to-Administrator gating (0003, at the `syncRoles()` call site);
      role-level protection of the "Administrator" role itself and the "who may grant the permission"
      meta-rule (0009); the `Gate::before` Super Admin bypass (0002 — **this story's Super Admin
      scenarios cannot pass until 0002 has registered it**). `password_reset_tokens` was checked and
      needs nothing: it is keyed by plain email with no FK, so after obfuscation no user resolves by the
      old address and any stale token is already inert and ages out normally.
