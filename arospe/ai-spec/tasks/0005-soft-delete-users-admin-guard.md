# [0005] Soft-delete users + administrator-level protection guard

## Description
Add soft deletion to `users` so removing a user marks the row deleted instead of destroying it,
preserving historical references, and free the deleted user's email address for reuse by
obfuscating it at delete time. Harden the server-side authorization guard so an administrator
lacking the "manage administrator-level roles/users" permission cannot delete or downgrade a user
holding the seeded baseline "Administrator" role — **extending** the `delete()` / `downgrade()`
abilities story **0004** already created on `App\Policies\UserPolicy`, not defining them from
scratch.

## Type
backend | includes database-expert: **yes**

Related sibling stories (dependencies and scope boundaries — **not** implemented here):
- **0002** seeds the roles/permissions catalog (the "Administrator" role, the Super Admin role, and
  the "manage administrator-level roles/users" permission) **and owns the `Gate::before` Super Admin
  bypass wiring**. This story assumes both exist; it only *enforces* the permission at user level.
- **0003** adds the `users.status` column and the `UserStatus` enum, plus the `users.pending_email`
  column and the pending-email verification mechanism. Not this story.
- **0004** builds the Users CRUD screen: the role-assignment surface (`syncRoles()`), the
  **promotion-to-Administrator gating**, and — importantly for this story — **it creates
  `App\Policies\UserPolicy`, including the minimal `delete()` and `downgrade()` abilities**. This
  story *extends* that existing file; it does not create it. See
  [Files to create/modify](#files-to-createmodify).
- **0007** blocks a non-`active` user from signing in. Not this story.
- **0010** owns **role-level** enforcement (editing/deleting the "Administrator" role itself) and the
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
          $this->pending_email = null;
          $this->saveQuietly();

          return (bool) parent::delete();
      });
  }
  ```

  > **`pending_email` must be cleared in the same write — required by story 0003, not optional.**
  > 0003 adds a nullable, **unique** `users.pending_email` plus a signed confirmation link that
  > writes the pending address into `users.email`. Leaving it populated on a soft-deleted row has two
  > concrete consequences: the outstanding link would write a real, live address back onto a trashed
  > account, undoing the obfuscation this story exists for; and the unique index would keep that
  > address reserved against a new user who legitimately wants it, defeating the "deleting a user
  > frees their email for reuse" acceptance criterion for the pending case. Nulling it also
  > invalidates the link, because 0003's confirmation action aborts when `pending_email` no longer
  > matches the address the signature is bound to.

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

- `app/Policies/UserPolicy.php` (**modify — created by story 0004, extended here**). 0004 already
  ships `viewAny`, `create`, `update`, `promoteToAdministrator`, `downgrade` and `delete`, the last
  two at their minimal shape:

  ```php
  // already present after story 0004 — do NOT recreate the file
  public function downgrade(User $actor, User $target): bool
  {
      if (! $target->hasRole('Administrator', 'web')) {
          return true;
      }

      return $actor->hasPermissionTo('roles.manage-administrators');
  }

  public function delete(User $actor, User $target): bool
  {
      if ($target->hasRole('Super Admin', 'web')) {
          return false;
      }

      if (! $target->hasRole('Administrator', 'web')) {
          return $actor->hasPermissionTo('users.delete');
      }

      return $actor->hasPermissionTo('users.delete')
          && $actor->hasPermissionTo('roles.manage-administrators');
  }
  ```

  **What this story adds to that file** is the hardening the soft-delete semantics make necessary,
  not a second implementation of the same rule:
  - Deleting an **already soft-deleted** user is denied (the row is out of scope for a second delete;
    `withTrashed()` call sites must not be able to re-trigger obfuscation on a restored-then-deleted
    account by accident).
  - The full authorization matrix in [Tests to perform](#tests-to-perform) is proved here — 0004's
    own policy tests cover the permission decision, this story's cover it against the soft-delete
    behaviour and the direct-invocation bypass path.

  **Permission naming, corrected.** Earlier drafts of this story used the prose literal
  `'manage administrator-level roles/users'`. That string is **not** in story 0002's seeded catalog
  and `hasPermissionTo()` would throw `PermissionDoesNotExist` against it. The canonical names are
  **`roles.manage-administrators`** and **`users.delete`**, per
  [`docs/conventions/naming.md`](../../docs/conventions/naming.md#permission-names). The Gherkin below
  keeps the human phrase because it is business prose, not a code literal.

  No self-targeting exception: the same rule applies when `$actor` and `$target` are the same user.
  A Policy was chosen over a bare `Gate` closure (no natural home for two related abilities, not
  unit-testable as a class), over an `app/Actions/` class (that convention is for state changes, not
  yes/no checks), and over a FormRequest (this repo has none anywhere — Livewire validates inline).

  > **Note for `code-reviewer`:** `app/Policies/` is introduced by story **0004**, which also owns
  > adding it to `conventions/base-standards.md`'s directory structure in its Phase 6. This story
  > only edits an existing file and adds no new directory.

**Tests** (paths verified against the real tree):

- `tests/Feature/Policies/UserPolicyTest.php` (**existing after 0004 — extend**) — the full
  authorization matrix, plus the soft-delete-specific cases this story adds.
- `tests/Feature/Models/UserSoftDeleteTest.php` (**new**) — soft-delete mechanics, email obfuscation
  and reuse, `pending_email` clearing, passkey survival.
- `tests/Feature/Auth/AuthenticationTest.php` (**existing — extend**) — a deleted user cannot sign in.
- `tests/Feature/Settings/SecurityTest.php` (**existing — extend**) — a deleted user cannot sign in
  with a passkey.
- `tests/Feature/Models/UserRouteBindingTest.php` (**existing — extend**) — a deleted user's
  identifier 404s.

**Explicitly NOT in this story** (listed so reviewers don't reopen them): `app/Providers/AppServiceProvider.php`
(the `Gate::before` Super Admin bypass belongs to 0002); any role-assignment/`syncRoles()` surface,
promotion gating, or the creation of `UserPolicy` itself (all **0004**); the `users.status` /
`users.pending_email` columns and the pending-email flow (**0003**); any Users-CRUD Livewire
component (**0004**/**0006**); `database/factories/UserFactory.php` (Laravel's base
`Factory::trashed()` state works automatically once the model uses `SoftDeletes`).

## Tests to perform
- [ ] Unit/model: `delete()` sets `deleted_at` and the row still exists; `deleted_at` is null on a
      freshly created user; `withTrashed()->find()` returns the deleted user; `onlyTrashed()` returns
      exactly the deleted set; default queries (`User::all()`, `User::query()`) exclude deleted users.
- [ ] Unit/model: deleting leaves `name` and role assignments untouched (it is a flag, not a data wipe).
- [ ] Integration: after deleting a user, a new user can be created with that user's original email;
      the deleted row's stored email matches `deleted+{id}@deleted.invalid` and `email_verified_at` is null.
      **Assert the stored email via `getRawOriginal('email')` or a `DB::table('users')` read** —
      story 0003 adds a read-only lowercasing accessor on `email`, so `$user->email` no longer returns
      the raw column value.
- [ ] Integration: deleting a user with a **pending** email change nulls `pending_email`; the
      previously outstanding confirmation link is then refused and writes nothing; and a *new* user
      can immediately be created with that pending address (proving the unique index no longer
      reserves it).
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
      administrator holding only the general `roles.manage` permission (proving `roles.manage` and
      `roles.manage-administrators` are checked independently, not conflated).
- [ ] Policy — downgrade matrix: the same six cases.
- [ ] Policy — soft-delete interaction (this story's own addition): deleting an **already
      soft-deleted** user is denied, so a `withTrashed()` call site cannot re-run the obfuscation.
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
immediately available for a new registration — including an address that was still only *pending*,
since `pending_email` is cleared in the same write and its outstanding link stops working.
Independently, `UserPolicy` — the file story 0004 created and this story extends — denies deletion
and downgrade of any user holding the seeded "Administrator" role to any actor lacking
`roles.manage-administrators`, including when the actor targets themselves, and that denial holds
when the check is invoked directly rather than through an interface.

## Acceptance criteria
- [ ] `users` has a nullable `deleted_at` column added by a new alteration migration with a symmetric
      `down()`; the historical `create_*` migrations are untouched.
- [ ] `App\Models\User` uses `SoftDeletes`, declares `@property Carbon|null $deleted_at`, and casts
      `deleted_at` to `datetime`.
- [ ] Deleting a user preserves the row (no physical delete) and preserves its passkeys, sessions, and
      role assignments.
- [ ] Soft-deleted users are excluded from default queries, from the active users list, from
      route-model binding, and from both password and passkey sign-in.
- [ ] Deleting a user obfuscates the stored email to `deleted+{id}@deleted.invalid`, nulls
      `email_verified_at` **and nulls `pending_email`**, making both the original address and any
      pending one immediately reusable for a new user, and invalidating any outstanding email-change
      confirmation link.
- [ ] `App\Policies\UserPolicy` — **extended, not created, by this story** — denies `delete` and
      `downgrade` against a target holding the seeded "Administrator" role to any actor lacking
      `roles.manage-administrators`, including when the actor is the target, and allows it otherwise.
- [ ] Deleting an already soft-deleted user is denied, so the obfuscation cannot be re-run on a
      trashed row.
- [ ] The guard treats "administrator-level" as **specifically** the seeded "Administrator" role: no
      other custom role, however broad its permissions, triggers it.
- [ ] The general `roles.manage` permission does **not** satisfy the guard.
- [ ] Denial is enforced server-side and holds under direct invocation, not merely hidden in the UI.

## Definition of Done
- [ ] Tests written and green (extended policy suite + new soft-delete suite, plus all listed regressions).
- [ ] Code reviewed (code-reviewer) — including that `UserPolicy` was **extended**, not rewritten,
      and that no duplicate `delete()`/`downgrade()` definition was introduced.
- [ ] No security findings (appsec-auditor).
- [ ] Documentation updated (docs-keeper) — `docs/database/schema.md` (`deleted_at` column + the
      soft-delete note + the `pending_email` clearing behaviour) and
      `docs/architecture/authorization.md` (the hardened `UserPolicy` abilities).
      `docs/conventions/base-standards.md`'s `app/Policies/` line is story **0004**'s to add.
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
      A restored user would need an admin to re-enter their address manually — which, after story 0003,
      means the new address goes through the pending-email flow and only takes effect once the
      recipient confirms it. Carry a one-line PHPDoc note on the overridden `delete()` flagging this
      for whoever builds a restore flow.
- [ ] **Deliberate schema omissions, recorded so they are not mistaken for oversights.** (a) **No index
      on `deleted_at`**: on MySQL 8.4 at this table's expected size, `deleted_at IS NULL` matches the
      large majority of rows, so the optimizer would very likely reject the index in favour of a scan,
      while every insert and delete pays for maintaining it. Revisit against story 0003's `status`
      column, which fixes the real active-list query shape — a composite index over both columns
      (`(deleted_at, status)`, in that order) would then be the
      right shape, not a standalone one. (b) **No change to the `email` unique index**: the obfuscation
      approach frees the address without touching it. A composite unique on `(email, deleted_at)` was
      considered and **ruled out as unsafe on MySQL** — `NULL <> NULL` for uniqueness purposes, so all
      active users (`deleted_at IS NULL`) would stop being constrained against sharing an email, a
      correctness regression on the exact invariant we need to keep.
- [ ] **Deferred to sibling stories, not gaps in this one:** session invalidation on delete and
      `remember_token` handling (**0007**'s login-blocking work, and worth surfacing to
      `appsec-auditor` in Phase 4 regardless); promotion-to-Administrator gating and the creation of
      `UserPolicy` itself (**0004**, at the `syncRoles()` call site); role-level protection of the
      "Administrator" role itself and the "who may grant the permission" meta-rule (**0010**); the
      `Gate::before` Super Admin bypass (0002 — **this story's Super Admin
      scenarios cannot pass until 0002 has registered it**). `password_reset_tokens` was checked and
      needs nothing: it is keyed by plain email with no FK, so after obfuscation no user resolves by the
      old address and any stale token is already inert and ages out normally.
