# [0005] Soft-delete users + administrator-level protection guard

## Description
Add soft deletion to `users` so removing a user marks the row deleted instead of destroying it,
preserving historical references, and free the deleted user's email address for reuse by
obfuscating it at delete time. On the authorization side the story is deliberately **small**: story
**0004** already ships the working Administrator-level guard on `App\Policies\UserPolicy` (an actor
lacking `roles.manage-administrators` cannot delete or downgrade a holder of the seeded
"Administrator" role), so this story adds exactly **one** new rule — `delete()` refuses an
already-soft-deleted target — and otherwise only **re-verifies** the existing guard under the new
soft-delete query semantics.

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
- **0009** owns **role-level** enforcement (editing/deleting the "Administrator" role itself) and the
  meta-rule about who may see/grant the permission. Not this story.

## Gherkin

> **Read the block headers before writing tests.** This story's Gherkin is split into two kinds of
> block, and they behave differently under Phase 3's mandatory red-then-green TDD step:
>
> - **`# --- New behavior: ... ---`** — nothing in the shipped code satisfies these. They **must go
>   red first**. This is the story's actual implementation surface.
> - **`# --- Regression: ... ---`** — these are **already fully satisfied today** by
>   `app/Policies/UserPolicy.php` (`delete()` / `downgrade()`, shipped by story 0004) plus the live
>   `Gate::before` Super Admin bypass. They are expected to **pass on first run**, and a QA author must
>   not treat a green result there as a broken TDD cycle or "fix" the test to force it red. They are
>   carried here on purpose: adding `SoftDeletes` installs a global scope that rewrites the queries
>   underneath every one of these checks, so re-proving them under the new query semantics is real
>   coverage — but it is *verification*, not new behavior.

```gherkin
Feature: Soft-deleting users and protecting administrator-level accounts

  # --- New behavior: soft-delete mechanics ---

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

  # --- New behavior: deleted users cannot authenticate ---

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

  # --- New behavior: an already-deleted user cannot be deleted again ---

  Scenario: Deleting a user who is already deleted is refused
    Given a user administrator holding every user-management permission,
      with a user "Diego Ferrer" who has already been deleted
    When they try to delete that already-deleted user again
    Then the action is denied server-side, so the obfuscated placeholder cannot be rewritten

  # --- Regression: 0004's guard still holds under soft-delete ---
  # Every scenario in this block already passes against the shipped
  # app/Policies/UserPolicy.php and the live Gate::before Super Admin bypass. They are
  # re-proved here because the SoftDeletes global scope changes the queries underneath
  # them; they are NOT expected to go red in Phase 3.

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

  # --- Regression: downgrading an Administrator-role holder (already passes today) ---

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

  # --- Regression: self-targeting has no exception (already passes today) ---

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

  # --- Regression: guard edge cases (already pass today) ---

  Scenario: A target holding "Administrator" alongside another role is still protected
    Given an administrator without the "manage administrator-level roles/users" permission
    When they try to delete another user who holds both "Administrator" and "Editor"
    Then the action is denied server-side

  Scenario: The last remaining administrator is not specially protected
    Given a signed-in Super Admin, with exactly one user holding the seeded "Administrator" role
    When they delete that last administrator
    Then the deletion is allowed, no headcount rule applying

  # --- Regression: server-side enforcement (already passes today) ---

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
      if (! $this->exists) {
          return (bool) parent::delete();
      }

      return DB::transaction(function (): bool {
          $this->forceFill([
              'email' => "deleted+{$this->id}@deleted.invalid",
              'email_verified_at' => null,
              'pending_email' => null,
          ])->saveQuietly();

          return (bool) parent::delete();
      });
  }
  ```

  **Three implementation notes for `backend-expert` (raised in review; fold them into Phase 3):**

  1. **The `! $this->exists` early return is not optional.** `Model::delete()` returns early when the
     instance was never persisted. Without the guard, calling `delete()` on a non-persisted instance
     would run `saveQuietly()` on a model with no row — **inserting a phantom obfuscated user** instead
     of doing nothing. Cover it with a test: `(new User)->delete()` must leave `users` untouched.
  2. **`forceDelete()` routes through `delete()`**, so a hard delete pays for the obfuscation write
     immediately before physically removing the row. That is wasteful but harmless and *correct by
     accident* (the row is gone either way). Decide in Phase 3 whether to short-circuit it; if you leave
     it, say so in the override's PHPDoc so the next reader does not mistake it for a bug.
  3. **`forceFill()` rather than direct property assignment** — an earlier draft assigned
     `$this->pending_email = null` directly. `users.pending_email` and `users.status` are deliberately
     omitted from `User`'s `#[Fillable]`, and
     [`docs/conventions/base-standards.md`](../../../docs/conventions/base-standards.md#model-conventions)
     states the convention as "written only via an explicit `forceFill()` in an action". Using
     `forceFill()` here keeps the one convention intact rather than opening a second accepted way to
     write those columns. Note the convention's wording says *"in an action"* and this is a **model
     override**; if `docs-keeper` judges that the wording needs widening to "in one named place", that
     is a Phase 6 doc edit — not a reason to deviate from `forceFill()` in Phase 3.

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

- `app/Policies/UserPolicy.php` (**modify — created by story 0004, extended here**).

  **Full inventory of what 0004 shipped — seven abilities, verified against the real file.** All
  seven must survive this story's edit intact; the DoD asks a reviewer to confirm no ability was
  clobbered or duplicated, and that check is only meaningful against a complete list:

  | Ability | Rule (as shipped) |
  | --- | --- |
  | `viewAny(User $actor)` | `users.view` |
  | `create(User $actor)` | `users.create` |
  | `update(User $actor, User $target)` | denies any `Super Admin` target, else `users.edit` |
  | `updateSensitiveAttributes(User $actor, User $target)` | `update()` **and**, for an `Administrator` target, `roles.manage-administrators` |
  | `promoteToAdministrator(User $actor, ?User $target = null)` | `roles.manage-administrators` (`$target` nullable for the class-level create-path check) |
  | `downgrade(User $actor, User $target)` | free for a non-`Administrator` target, else `roles.manage-administrators` |
  | `delete(User $actor, User $target)` | denies any `Super Admin` target; `users.delete` for a non-`Administrator` target; `users.delete` **and** `roles.manage-administrators` otherwise |

  > **`updateSensitiveAttributes()` is the one this story must not overlook**, and it was missing from
  > an earlier draft of this list. It was added by 0004's **Phase 4 security finding F1** and gates
  > *status and email* changes on an `Administrator`-holding target behind `roles.manage-administrators`
  > — precisely because rewriting a user's email is a path to account takeover. This story's core
  > mechanic **rewrites `users.email`** (the obfuscation), so the overlap is deliberate and must be
  > stated rather than left implicit: **the obfuscating write is already authorized by the `delete()`
  > gate**, which requires the same `roles.manage-administrators` for an `Administrator` target, so no
  > actor can reach the email rewrite through delete that could not already reach it through
  > `updateSensitiveAttributes()`. **Do not** add an `updateSensitiveAttributes()` check inside
  > `User::delete()` — the model override runs after authorization, has no `$actor`, and every current
  > call site is already gated. Equally, **do not modify `updateSensitiveAttributes()` in this story**;
  > it is listed here so it is not silently dropped when `delete()` is edited.

  The two abilities this story touches, at the shape 0004 left them in:

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

  **What this story adds to that file is exactly one new branch**, and nothing else:

  - `delete()` denies a target that is **already soft-deleted** (`$target->trashed()`), so a
    `withTrashed()` call site cannot re-trigger the obfuscation on a trashed row and rewrite the
    placeholder. This is the single genuinely-new policy behavior in the story, and the only policy
    assertion that can legitimately go red in Phase 3.

  Everything else in the Administrator-level delete/downgrade matrix **already works today** and is
  re-proved, not implemented — see the `# --- Regression: ... ---` Gherkin blocks and the matching
  regression items in [Tests to perform](#tests-to-perform). 0004's own
  `tests/Feature/Policies/UserPolicyTest.php` already covers the permission decision; what this story
  adds on top is the same matrix exercised with the `SoftDeletes` global scope installed, plus the
  direct-invocation bypass proof.

  **Permission naming, corrected.** Earlier drafts of this story used the prose literal
  `'manage administrator-level roles/users'`. That string is **not** in story 0002's seeded catalog
  and `hasPermissionTo()` would throw `PermissionDoesNotExist` against it. The canonical names are
  **`roles.manage-administrators`** and **`users.delete`**, per
  [`docs/conventions/naming.md`](../../../docs/conventions/naming.md#permission-names). The Gherkin below
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
- `tests/Feature/Users/IndexTest.php` (**existing after 0004 — extend, verification only**) — a
  trashed user is absent from the list rows and from both `usersSummary()` counts, proving the global
  scope covers `App\Livewire\Users\Index` with no component edit (see the carve-out below).

**Explicitly NOT in this story** (listed so reviewers don't reopen them): `app/Providers/AppServiceProvider.php`
(the `Gate::before` Super Admin bypass belongs to 0002); any role-assignment/`syncRoles()` surface,
promotion gating, or the creation of `UserPolicy` itself (all **0004**); the `users.status` /
`users.pending_email` columns and the pending-email flow (**0003**); **editing** any Users-CRUD
Livewire component (**0004**/**0006** — see the carve-out immediately below);
`database/factories/UserFactory.php` (Laravel's base `Factory::trashed()` state works automatically
once the model uses `SoftDeletes`).

> **Carve-out — `App\Livewire\Users\Index` is verified here, not edited here.** This story owns an
> acceptance criterion stating that a soft-deleted user disappears from the active users list, which
> would otherwise contradict the exclusion above. It does not: **no component edit is needed, and none
> is permitted in this story.** `Index::loadUsers()` (line 252) and `Index::usersSummary()` (line 214)
> both build from a bare `User::query()`, so Eloquent's `SoftDeletingScope` applies to the list rows
> **and** to the `count(*)` / `count(case when status = ...)` summary automatically, with zero changes
> to the component. The criterion is discharged by **adding a case to
> `tests/Feature/Users/IndexTest.php`** asserting a trashed user is absent from `$users` and excluded
> from both summary counts. If that test fails, the correct response is to escalate — a component
> change is out of this story's scope and would mean a wrong assumption about the query shape, not a
> missing line of code.

## Tests to perform
- [x] Unit/model: `delete()` sets `deleted_at` and the row still exists; `deleted_at` is null on a
      freshly created user; `withTrashed()->find()` returns the deleted user; `onlyTrashed()` returns
      exactly the deleted set; default queries (`User::all()`, `User::query()`) exclude deleted users.
- [x] Unit/model: deleting leaves `name` and role assignments untouched (it is a flag, not a data wipe).
- [x] Integration: after deleting a user, a new user can be created with that user's original email;
      the deleted row's stored email matches `deleted+{id}@deleted.invalid` and `email_verified_at` is null.
      **Assert the stored email via `getRawOriginal('email')` or a `DB::table('users')` read** —
      story 0003 adds a read-only lowercasing accessor on `email`, so `$user->email` no longer returns
      the raw column value.
- [x] Integration: deleting a user with a **pending** email change nulls `pending_email`; the
      previously outstanding confirmation link is then refused and writes nothing; and a *new* user
      can immediately be created with that pending address (proving the unique index no longer
      reserves it).
- [x] Negative/model: calling `delete()` on a **non-persisted** `User` instance inserts nothing and
      leaves the `users` table untouched (guards the `! $this->exists` early return — without it the
      override phantom-inserts an obfuscated row).
- [x] Integration: obfuscation is collision-proof — deleting two users, then re-deleting a restored
      user, never produces a duplicate-key error.
- [x] Integration: a deleted user's `passkeys` rows survive (the `cascadeOnDelete()` FK does **not** fire
      on a soft delete, because Eloquent issues an `UPDATE`, not a `DELETE`).
- [x] Integration/auth: a deleted user cannot authenticate via `POST /login` (verifying the automatic
      `SoftDeletingScope` behavior rather than assuming it); a deleted user cannot complete **passkey**
      sign-in — `laravel/passkeys` resolves the user through its own flow and it is **unverified**
      whether that path carries the global scope, so this needs an explicit negative test, not an
      assumption.
- [x] Integration/binding: a deleted user's UUID 404s via model-not-found on a user-bound route.
> **The next six items are regression coverage, not new behavior.** They already pass against the
> shipped `app/Policies/UserPolicy.php` + `Gate::before`; they are written here to prove the matrix
> still holds once the `SoftDeletes` global scope is installed underneath it. Expect them green on the
> first run. Only the "soft-delete interaction" item below is expected to go red.

- [x] Policy (regression) — delete matrix: denied for an administrator without the permission against an
      "Administrator" target; allowed for an administrator **with** it; allowed for the Super Admin;
      allowed against a broad custom-role target; allowed against a role-less target; **denied** for an
      administrator holding only the general `roles.manage` permission (proving `roles.manage` and
      `roles.manage-administrators` are checked independently, not conflated).
- [ ] Policy (regression) — downgrade matrix: the same six cases.
- [x] Policy (regression) — self-targeting: denied for self-delete and self-downgrade when the actor
      holds "Administrator" without the permission.
- [x] Policy (regression) — multi-role edge: a target holding both "Administrator" and another role is
      protected (role presence anywhere in the set, not exclusivity).
- [x] Policy (regression) — headcount edge: deleting the **last** remaining "Administrator" is **not**
      specially blocked. Asserted explicitly so a future undocumented "last admin" rule cannot land
      silently.
- [x] Policy (**new — must go red first**) — soft-delete interaction, the story's only new policy
      behavior: deleting an **already soft-deleted** user is denied, so a non-Super-Admin actor at a
      `withTrashed()` call site cannot re-run the obfuscation and rewrite the placeholder. This is a
      policy-level guard: a Super Admin actor still bypasses it via the existing `Gate::before` hook,
      exactly as they bypass every other ability (accepted, documented in `UserPolicy::delete()`'s
      PHPDoc — the re-write is idempotent since the placeholder is deterministic from the immutable
      UUID, so the bypass has no effect beyond writing the same value again).
- [ ] Negative/server-side proof (regression): invoking `Gate::forUser($actor)->authorize('delete', $target)` (and
      the downgrade equivalent) directly, bypassing any interface state, still throws
      `AuthorizationException` — this is the test that actually proves the PRD's "denied server-side,
      not merely hidden in the UI" wording.
- [x] Regression (stay green): **the full suite**, `php artisan test --compact`, per
      [`docs/testing/ci/commands.md`](../../../docs/testing/ci/commands.md). Do **not** substitute an
      enumerated list of suites here — an earlier draft did, and it went stale within one story (it
      predated 0004 and omitted `tests/Feature/Users/*`, `tests/Feature/Authorization/*` and
      `tests/Feature/Seeders/*` entirely). Adding `SoftDeletes` installs a global scope that silently
      rewrites **every** `User` query in the app, so the blast radius is the whole suite by
      construction and any enumeration is a liability.
      - **Highest-risk suite: `tests/Feature/Users/*`** (`IndexTest.php`, `CreateUserTest.php`).
        `App\Livewire\Users\Index` runs a bare `User::query()` in **two** places — `loadUsers()
        (line 252)` and the `selectRaw('count(*) ... count(case when status = ? ...)')` in
        `usersSummary() (line 214)` — so both the list rows and the "N of M active" summary counts
        change meaning the moment the scope lands. Run this suite first when Phase 3 goes green.
      - **Verified fact, not an assumption:** the three existing delete assertions in
        `tests/Feature/Users/IndexTest.php` (lines ~847/849, ~864/866, ~878/880) were checked against
        the real file and **survive soft-delete unchanged**. They assert through `User::find($target->id)`,
        which picks up the `SoftDeletingScope` and therefore keeps returning `null` for a
        now-soft-deleted target exactly as it did for a hard-deleted one. No edit to those three
        assertions is required or wanted — if one of them fails, that is a genuine regression signal,
        not an expected test-fixture update.

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
Independently, `UserPolicy::delete()` gains one new refusal — an already-trashed target — so the
obfuscated placeholder can never be rewritten by a second delete. The Administrator-level protection
that surrounds it is **unchanged and already live**: `UserPolicy` (created by 0004) denies deletion and
downgrade of any user holding the seeded "Administrator" role to any actor lacking
`roles.manage-administrators`, including when the actor targets themselves, and that denial holds when
the check is invoked directly rather than through an interface. What this story adds there is proof
that installing the `SoftDeletes` global scope did not weaken any of it.

## Acceptance criteria
- [x] `users` has a nullable `deleted_at` column added by a new alteration migration with a symmetric
      `down()`; the historical `create_*` migrations are untouched.
- [x] `App\Models\User` uses `SoftDeletes`, declares `@property Carbon|null $deleted_at`, and casts
      `deleted_at` to `datetime`.
- [x] Deleting a user preserves the row (no physical delete) and preserves its passkeys, sessions, and
      role assignments.
- [x] Soft-deleted users are excluded from default queries, from route-model binding, and from both
      password and passkey sign-in.
- [x] **(Verification only — no application code changes.)** A soft-deleted user is absent from the
      active users list and from both of its summary counts. `App\Livewire\Users\Index::loadUsers()`
      and `::usersSummary()` both run a bare `User::query()`, so the `SoftDeletingScope` covers them
      automatically; this criterion is met by an added case in `tests/Feature/Users/IndexTest.php`, and
      **editing the component would put this story out of scope** (0004/0006 own it).
- [x] Deleting a user obfuscates the stored email to `deleted+{id}@deleted.invalid`, nulls
      `email_verified_at` **and nulls `pending_email`**, making both the original address and any
      pending one immediately reusable for a new user, and invalidating any outstanding email-change
      confirmation link.
- [x] **(New behavior — the only new policy rule in this story.)** `App\Policies\UserPolicy::delete()`
      denies a target that is **already soft-deleted**, so a non-Super-Admin actor at a
      `withTrashed()` call site cannot re-run the obfuscation and overwrite the placeholder on a
      trashed row. Policy-level only: a Super Admin actor bypasses this via the existing
      `Gate::before` hook, same as every other ability — accepted, since the re-write is idempotent
      (the placeholder is deterministic from the immutable UUID).
- [x] **(Regression — re-verified, NOT newly implemented.)** 0004's Administrator-level
      delete/downgrade matrix still holds once `SoftDeletes` is installed on `App\Models\User`: `delete`
      and `downgrade` remain denied against a target holding the seeded "Administrator" role for any
      actor lacking `roles.manage-administrators` (including when the actor is the target) and allowed
      otherwise; "administrator-level" still means **specifically** the seeded "Administrator" role and
      no other custom role however broad; the general `roles.manage` permission still does **not**
      satisfy it; and denial still holds under direct `Gate::forUser(...)->authorize(...)` invocation
      rather than being hidden in the UI. All of this passes today — the criterion is that the global
      scope did not break it, and the evidence is the regression block of
      `tests/Feature/Policies/UserPolicyTest.php` running green.
- [x] All **seven** abilities 0004 shipped on `UserPolicy` are still present and unmodified except for
      `delete()`'s new trashed-target branch — in particular `updateSensitiveAttributes()`, which is
      easy to lose when editing this file and which is what authorizes email/status changes on an
      Administrator target.

## Definition of Done
- [x] Tests written and green (extended policy suite + new soft-delete suite, plus all listed regressions).
- [x] Code reviewed (code-reviewer) — including that `UserPolicy` was **extended**, not rewritten:
      all **seven** abilities listed in [Files to create/modify](#files-to-createmodify) are still
      present (`viewAny`, `create`, `update`, `updateSensitiveAttributes`, `promoteToAdministrator`,
      `downgrade`, `delete`), no duplicate `delete()`/`downgrade()` definition was introduced, and the
      only diff to the file is `delete()`'s trashed-target branch.
- [x] No security findings (appsec-auditor).
- [x] Documentation updated (docs-keeper). **Scope call, made deliberately in this revision:**
      - `docs/database/schema.md` — **required.** The `deleted_at` column, the soft-delete note, the
        email-obfuscation-on-delete behaviour, the `pending_email` clearing, and the two deliberate
        index omissions. Soft-delete is primarily a schema + model-behaviour fact, and this is the doc
        that owns it.
      - `docs/architecture/authorization.md` — **required, but a narrow one-paragraph pass, not a
        rewrite of the Policies section.** An earlier draft assigned it "the hardened `UserPolicy`
        abilities", which over-stated the change: after this revision the story adds exactly one new
        authorization rule. That rule is still genuinely an authorization rule — `delete()` gains a
        branch that denies a trashed target — so the Policies section's `delete()` description does go
        stale without a touch, and per [`docs/errors-log.md`](../../../docs/errors-log.md)'s rule about
        claims outliving the code, a doc that describes an ability must describe all of its branches.
        Confine the edit to that: **do not** re-document the Administrator-level matrix, which is
        unchanged and already correct there.
      - `docs/conventions/base-standards.md`'s `app/Policies/` line is story **0004**'s to add — not
        this story's.
- [x] Acceptance criteria met.
- [x] **Accepted, human-confirmed tradeoff — the original email is unrecoverable.** This repo has no
      audit-log table, so obfuscating the email at delete time permanently destroys the original
      address. Freeing the address for reuse was chosen deliberately over retaining it. If an audit
      trail is ever added, capturing the pre-obfuscation email becomes a candidate follow-up.
- [x] **Known constraint — never bulk-delete `User` rows via the query builder.** `User::whereIn(...)->delete()`
      bypasses model instance methods entirely, skipping the email obfuscation. Every current call site
      uses instance `->delete()`; this constraint must be documented alongside the override so it stays
      true.
- [x] **Known limitation — a restored user keeps the obfuscated email.** `SoftDeletes::restore()` exists
      on the model for free, but no restore call site exists anywhere in the app and none is built here.
      A restored user would need an admin to re-enter their address manually — which, after story 0003,
      means the new address goes through the pending-email flow and only takes effect once the
      recipient confirms it. Carry a one-line PHPDoc note on the overridden `delete()` flagging this
      for whoever builds a restore flow.
- [x] **Deliberate schema omissions, recorded so they are not mistaken for oversights.** (a) **No index
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
- [x] **Deferred to sibling stories, not gaps in this one:** session invalidation on delete and
      `remember_token` handling (**0007**'s login-blocking work, and worth surfacing to
      `appsec-auditor` in Phase 4 regardless); promotion-to-Administrator gating and the creation of
      `UserPolicy` itself (**0004**, at the `syncRoles()` call site); role-level protection of the
      "Administrator" role itself and the "who may grant the permission" meta-rule (**0009**); the
      `Gate::before` Super Admin bypass (**0002** — done and live; this story's Super Admin
      scenarios rely on it, not on any work still pending).
- [x] **`password_reset_tokens` is not inert after obfuscation — it is actively revoked.** Phase 4
      (`appsec-auditor`) found the original claim here false: the table is keyed by plain `email` with no
      FK, so obfuscating `users.email` frees the address for reuse *before* the stale token expires,
      and Fortify's password broker resolves the reset link's user by that same email string at
      confirm-time — a new account that later claims the recycled address would inherit the old user's
      still-valid reset link (60-minute window, `config/auth.php`), an account-takeover path. Fixed:
      `User::delete()` now deletes any `password_reset_tokens` row keyed to the account's real
      (pre-obfuscation) `email` — captured via `getRawOriginal('email')` before the forceFill — in the
      same transaction that obfuscates it. `pending_email` needs no equivalent cleanup: it is never
      looked up by the password broker and its own confirmation link is a signed URL, not a
      `password_reset_tokens` row.

---

## Revision history

**2026-08-14 — rewritten by `product-owner` after failing Phase 2 (INVEST) on four blocking findings
from `code-reviewer`.** No factual claim about existing code was wrong; all four were scope/structure
problems. What changed:

- **F1 — pre-satisfied scenarios were presented as new work.** 13 of 24 Gherkin scenarios already pass
  against shipped 0004 code and could not go red in Phase 3's TDD step. The Gherkin blocks are now
  split into `# --- New behavior ---` and `# --- Regression ---` headers with an explicit reading note;
  the single genuinely-new policy rule (trashed-target denial) got its own scenario, its own
  new-behavior AC, and its own `(new — must go red first)` test item; the matrix became one explicitly
  labelled regression AC. **Decision on the reviewer's open question: the pre-satisfied scenarios are
  kept, relabelled, not dropped** — the `SoftDeletes` global scope genuinely rewrites the queries
  underneath them, so re-proving the matrix under the new semantics is real coverage, and duplication
  with 0004's `UserPolicyTest.php` is the cheaper risk.
- **F2 — the `UserPolicy` ability inventory listed 6 of 7.** Replaced with a complete seven-row table
  including `updateSensitiveAttributes()`, plus an explicit statement of why it matters here (this
  story rewrites `users.email`) and the instruction not to duplicate its check inside `User::delete()`.
- **F3 — the regression test list was stale (predated 0004).** Replaced the enumeration with the
  full-suite gate (`php artisan test --compact`), named `tests/Feature/Users/*` as the highest-risk
  suite with the two bare `User::query()` call sites, and recorded as a **verified fact** that
  `IndexTest.php`'s three existing delete assertions survive unchanged via `User::find()`.
- **F4 — an AC asserted `Users\Index` behavior the story disclaimed.** Kept in scope as
  **verification-only** with a carve-out explaining why no component edit is needed, and named
  `tests/Feature/Users/IndexTest.php` as the file that proves it.
- **Phase 6 doc scope (reviewer's second open question), decided:** `docs/database/schema.md` is
  required; `docs/architecture/authorization.md` still needs a pass but a **narrow one** — only
  `delete()`'s new trashed-target branch, not a re-documentation of the unchanged matrix.
- **Non-blocking notes folded in for Phase 3:** the `! $this->exists` guard (with a test), the
  `forceDelete()`-routes-through-`delete()` observation, and a switch from direct property assignment
  to `forceFill()` for `pending_email` to stay inside `base-standards.md`'s stated convention.

Sections reviewed clean and **left untouched**: migration placement/shape, obfuscation format,
`pending_email` clearing rationale, passkey survival, the deliberate index omissions, and the
unrecoverable-email tradeoff.

**2026-08-14 — second Phase 2 pass by `code-reviewer`: ✅ PASS.** All four findings verified fixed
against current code; INVEST holds. Four non-blocking notes carried into Phase 3:

- **N1** — of the six regression policy items, only three are not already covered by 0004's
  `UserPolicyTest.php`: a `roles.manage`-only actor denied, a target holding `Administrator` plus
  another role, and the last-administrator headcount case. `backend-qa` should write only those three
  rather than restating the whole matrix.
- **N2** — the trashed-target denial is policy-level; a Super Admin actor bypasses it via
  `Gate::before` before the new branch runs (already asserted generically by
  `UserPolicyTest.php:220`), so the AC's "cannot re-run the obfuscation" wording is not literally true
  for that one actor. Harmless in practice (the placeholder is deterministic from the immutable UUID),
  but Phase 3/4 should either reword the AC to name the Super Admin bypass explicitly, or move the
  idempotency guard into `User::delete()` where no bypass applies — implementer's call, not another
  Phase 2 loop.
- **N3** — trim the stale conditional clause on the last DoD bullet ("this story's Super Admin
  scenarios cannot pass until 0002 has registered it") — 0002 is done and live; it contradicts the
  Gherkin reading note in the same file.
- **N4** — "a deleted user cannot sign in with a passkey" belongs in `tests/Feature/Auth/`, not
  `tests/Feature/Settings/SecurityTest.php` (that file is passkey/2FA *management* for an
  already-authenticated user; no passkey sign-in test exists yet anywhere in `tests/`).

**Moved to `ai-spec/tasks/in-progress/`** — Phase 3 (TDD) begins.

**2026-08-14 — Phase 3 went green (296/296, then 298/298 after the Phase 4 F1 fix below).
Phase 4 (`appsec-auditor`) reviewed the shipped implementation and found one blocking finding
(fixed, re-audited, closed) plus four explicitly deferred, not-this-story findings, recorded here
for traceability since none of them appear elsewhere in this file:**

- **F1 (blocking, fixed)** — recycling a deleted user's email left a stale `password_reset_tokens`
  row keyed by the old address, enabling account takeover of whoever later registers that recycled
  address within the 60-minute token window. Fixed in `User::delete()` (see the DoD bullet above);
  re-audited and confirmed closed.
- **F2 (deferred)** — passkey sign-in for a soft-deleted owner throws an uncaught `TypeError`
  (500) rather than a clean refusal, because `$passkey->user` resolves to `null` and
  `laravel/passkeys`' `PasskeyVerified` event/`StatefulGuard::login()` are typed non-nullable.
  Verified **not** an auth bypass or usable DoS (the throw requires already holding the deleted
  owner's passkey private key, and it unwinds inside a `DB::transaction()`). Follow-up: register
  `Passkeys::authorizeLoginUsing()` in `FortifyServiceProvider` for a clean refusal — not this story.
- **F3 (deferred)** — the obfuscated address `deleted+{id}@deleted.invalid` is typeable by an
  attacker who knows a target's UUID (learnable from their own `email-change.confirm` link), so an
  attacker could pre-occupy a future victim's placeholder address and force that victim's eventual
  delete into an unhandled `23000` duplicate-key 500. Recoverable, requires an authenticated account
  and a known UUID. Follow-up: reserve the `@deleted.invalid` namespace in `emailRules()`, and/or add
  the same `23000` catch `RequestEmailChange`/`ConfirmEmailChange`/`CreateUser` already carry.
- **F4 (deferred)** — `UserPolicy::update()` / `updateSensitiveAttributes()` have no trashed-target
  branch (only `delete()` does), an asymmetry with no live exploit today since the only
  `withTrashed()` call site in the repo is a test. Follow-up: whichever story introduces the first
  real `withTrashed()` call site (a restore flow, an admin "deleted users" view) must add the
  trashed branch to `update()` in the same change.
- **F5 (deferred)** — a trashed row keeps its role grants (Spatie's detach-on-delete boot hook now
  no-ops under `SoftDeletes`) and all credential material (`password`, 2FA secrets, passkeys)
  indefinitely, with no restore flow yet to re-authorize any of it. Follow-up: a future restore story
  must re-grant roles as an explicit, separately authorized decision and rotate `remember_token`; a
  retention story should consider clearing credential material at delete time.

All five are written up with reproductions in `docs/security/soft-delete-patterns.md`
(`docs/security/README.md`-indexed), which `docs-keeper` should treat as authoritative for Phase 6
rather than re-deriving from this summary.
