# [0008a] Centralize Administrator-level role identification (follow-up to 0008 and story 0004's F2/F3)

## Description
Give the **Administrator** privilege tier a single, centralized identity resolution — one place that
answers "is this the Administrator role?" — and move the Administrator-level authorization it guards out
of the Livewire component and **into** `App\Actions\Users\CreateUser` / `UpdateUser`, so the guard
travels with the operation instead of with one caller. Today "is this role / this user
Administrator-level?" is a hardcoded `'Administrator'` string in five places, and the guard built on it
lives only inside `App\Livewire\Users\Index` — meaning every one of those five sites has to be found and
changed together for any adjustment to hold, and any non-component caller of those two actions (a future
API endpoint, an Artisan command, a queued job) is completely ungated. This story also picks up the two
Super Admin `UserPolicy` call sites that 0008 deliberately deferred here, so all five literal-role-name
checks in that policy move in one pass.

> **The mechanism is deliberately *not* the config-driven one story 0008 built for the Super Admin
> role.** The seeded Administrator role's **name is locked and uneditable** — decided centrally and
> applied consistently across Epic 1, and recorded in story
> [0010](0010-administrator-level-permission-grant.md)'s "Confirmed decision — role identity" note. It is
> therefore identified at runtime by **exact, case-sensitive comparison against the literal name**
> (`$role->name === 'Administrator'`), with **no config key and no override capability**. What this story
> centralizes is *where that comparison lives*, not what it reads: five scattered literals collapse into
> one shared helper plus one enum case. Adding an `auth.administrator.role` config key would create an
> override path the locked-name decision explicitly rules out, so it is out of scope and must not be
> reintroduced. (An earlier draft of this story mirrored 0008's config mechanism one tier down; that
> draft was superseded by the locked-name decision — see [Human decisions](#human-decisions-recorded-before-phase-3) D1.)

## Type
backend | includes database-expert: **no**

## Gherkin
```gherkin
Feature: Administrator-level role identification and guard placement

  # --- Happy path: the privileged actor keeps every Administrator-level power (regression guard) ---

  Scenario: A user administrator with administrator-management permission creates an Administrator
    Given a user administrator holding the administrator-management permission
    When they create a new user with the Administrator role
    Then the user is created holding the Administrator role

  Scenario: A user administrator with administrator-management permission promotes a user
    Given a user administrator holding the administrator-management permission,
      with an existing user holding an ordinary role
    When they change that user's role to Administrator
    Then the user's role is changed to Administrator

  Scenario: A user administrator with administrator-management permission downgrades an Administrator
    Given a user administrator holding the administrator-management permission,
      with an existing user holding the Administrator role
    When they change that user's role to an ordinary role
    Then the user's role is changed to the ordinary role

  Scenario: A user administrator with administrator-management permission suspends an Administrator
    Given a user administrator holding the administrator-management permission,
      with an existing user holding the Administrator role
    When they change that user's status to suspended
    Then the user's status is changed to suspended

  Scenario: A user administrator with administrator-management permission deletes an Administrator
    Given a user administrator holding the administrator-management permission,
      with an existing user holding the Administrator role
    When they delete that user
    Then the user is deleted

  # --- Refusal through the dashboard (existing coverage, must not regress) ---

  Scenario: Creating an Administrator from the dashboard without the permission is refused
    Given a user administrator holding user-creation permission
      but not the administrator-management permission
    When they submit the create form with the Administrator role selected
    Then the attempt is refused server-side and no user is created

  Scenario: Promoting a user from the dashboard without the permission is refused
    Given a user administrator holding user-editing permission
      but not the administrator-management permission
    When they submit the edit form changing an ordinary user's role to Administrator
    Then the attempt is refused server-side and the user's role is unchanged

  # --- Refusal outside the dashboard (the gap this story exists to close) ---

  Scenario: Creating an Administrator outside the dashboard without the permission is refused
    Given a user administrator holding user-creation permission
      but not the administrator-management permission,
      whose request bypasses the dashboard entirely
    When they invoke the user-creation action directly with the Administrator role
    Then the attempt is refused server-side and no user is created

  Scenario: Promoting a user outside the dashboard without the permission is refused
    Given a user administrator holding user-editing permission
      but not the administrator-management permission,
      whose request bypasses the dashboard entirely
    When they invoke the user-update action directly to set an ordinary user's role to Administrator
    Then the attempt is refused server-side and the user's role is unchanged

  Scenario: Downgrading an Administrator outside the dashboard without the permission is refused
    Given a user administrator holding user-editing permission
      but not the administrator-management permission,
      whose request bypasses the dashboard entirely
    When they invoke the user-update action directly to set an Administrator's role to an ordinary role
    Then the attempt is refused server-side and the user's role is unchanged

  Scenario: Suspending an Administrator outside the dashboard without the permission is refused
    Given a user administrator holding user-editing permission
      but not the administrator-management permission,
      whose request bypasses the dashboard entirely
    When they invoke the user-update action directly to set an Administrator's status to suspended
    Then the attempt is refused server-side and the user's status is unchanged

  Scenario: A self-targeting update outside the dashboard cannot change the caller's own role
    Given a user administrator holding every user-management permission,
      whose request bypasses the dashboard entirely
    When they invoke the user-update action directly against their own account with a different role
    Then their own role and status are left unchanged,
      because the action derives the self-edit guard itself rather than trusting the caller

  # --- Administrator-level identity is an exact, case-sensitive name match ---

  Scenario: A custom role whose name merely resembles "Administrator" is not administrator-level
    Given a user administrator holding user-editing permission
      but not the administrator-management permission,
      with a custom role "Administrador Regional"
    When they change an ordinary user's role to "Administrador Regional"
    Then the user's role is changed to "Administrador Regional",
      because only the exactly-named seeded "Administrator" role is administrator-level

  Scenario: Administrator-level matching is case-sensitive
    Given a user administrator holding user-editing permission
      but not the administrator-management permission,
      with a custom role named "administrator" in lowercase
    When they change an ordinary user's role to "administrator"
    Then the user's role is changed to "administrator",
      because the match is case-sensitive

  Scenario: A custom role holding administrator-level permissions is still not administrator-level
    Given a user administrator holding user-editing permission
      but not the administrator-management permission,
      with a custom role "Deputy" that holds every permission the seeded "Administrator" role holds
    When they change an ordinary user's role to "Deputy"
    Then the user's role is changed to "Deputy",
      because administrator-level is defined by the role's name, not by its permission set

  # --- The guard stays narrow (must not over-block) ---

  Scenario: Assigning an ordinary role needs no administrator-management permission
    Given a user administrator holding user-editing permission
      but not the administrator-management permission,
      with a custom role "Blog Editor"
    When they change an ordinary user's role to "Blog Editor"
    Then the user's role is changed to "Blog Editor"

  Scenario: Editing an ordinary user's status needs no administrator-management permission
    Given a user administrator holding user-editing permission
      but not the administrator-management permission
    When they change an ordinary user's status to suspended
    Then the user's status is changed to suspended

  Scenario: Deleting an ordinary user needs no administrator-management permission
    Given a user administrator holding user-deletion permission
      but not the administrator-management permission
    When they delete an ordinary user
    Then the user is deleted

  Scenario: User management is unaffected before the Administrator role has been seeded
    Given a user administrator working on a fresh installation
      where the Administrator role has not been seeded yet
    When they create a user holding an ordinary role
    Then the user is created, and nothing is wrongly withheld or blocked

  # --- The two tiers must not be aliased into one another ---

  Scenario: The Super Admin target check resolves independently of the Administrator mechanism
    Given a platform operator who has configured the Super Admin role name to a
      non-default value, and a user administrator holding every user-management permission
    When they attempt to edit a user holding the configured Super Admin role
    Then the attempt is refused server-side, because the Super Admin exclusion resolves
      through its own configured name while the Administrator check resolves through its
      own locked literal name, and neither is aliased onto the other

  Scenario: Reconfiguring the Super Admin role name leaves the Administrator tier untouched
    Given a platform operator who has configured the Super Admin role name to a
      non-default value, and a user administrator without the administrator-management permission
    When they attempt to assign the seeded "Administrator" role to a user
    Then the attempt is refused server-side, because the Administrator tier's identity
      does not depend on the Super Admin configuration
```

## Files to create/modify

Everything below was verified against the working tree during this debate (`Read` + `grep`, not memory);
every line number cited is the **current** one and Phase 3 must re-check it before editing, since story
0008 lands first and will shift some of them.

**What already exists, and what 0008 brought.** `App\Models\Role`, `App\Enums\RoleName` and
`Role::superAdminName()` did **not** exist when this file was written; story 0008 created all three and
closed on 2026-08-18, so they are in the working tree now and this story extends them rather than
assuming them. 0008 also shipped more than its own Phase 1 spec described — read
[`app/Models/Role.php`](../../app/Models/Role.php) and
[`app/Policies/RolePolicy.php`](../../app/Policies/RolePolicy.php) directly before editing either. See
[Dependencies, risks and open questions](#dependencies-risks-and-open-questions).

**The verified Administrator-by-literal-name sites.** `grep -rn "'Administrator'" app/ database/ config/`
returns exactly five:

| File:line | Expression | In scope here? |
| --- | --- | --- |
| `app/Livewire/Users/Index.php:405` | `->where('name', 'Administrator')`, inside `administratorRoleId()` (declared line 402) | yes |
| `app/Policies/UserPolicy.php:60` | `$target->hasRole('Administrator', 'web')` in `updateSensitiveAttributes()` | yes |
| `app/Policies/UserPolicy.php:93` | `$target->hasRole('Administrator', 'web')` in `downgrade()` | yes |
| `app/Policies/UserPolicy.php:121` | `$target->hasRole('Administrator', 'web')` in `delete()` | yes |
| `database/seeders/RolePermissionSeeder.php:53` | `Role::firstOrCreate(['name' => 'Administrator', …])` | yes — see Q1 (resolved) |

> **Correction to a Phase 1 contribution, recorded so Phase 3 does not inherit it.** `backend-expert`
> described the three `UserPolicy` Administrator sites as "`promoteToAdministrator`-adjacent, `downgrade`,
> `updateSensitiveAttributes`". The first is wrong: `promoteToAdministrator()` (declared line 77) contains
> **no** `hasRole()` call at all — it is a pure `$actor->hasPermissionTo('roles.manage-administrators')`
> check. The real third site is **`delete()` at line 121**. The count (three) is right; one member of the
> set is not.

**Also verified, contradicting a claim worth ruling out explicitly.**
`App\Concerns\UserValidationRules::roleRules()` does **not** hardcode `'Administrator'`. Its only literal
is `'Super Admin'` (line 24, inside the `Rule::exists(...)->whereNot('name', 'Super Admin')` constraint),
and story **0008 already owns that line**. Nothing in `app/Concerns/` is in this story's scope. Do not
"also fix" it here.

**And the five `UserPolicy` call sites move together, in one pass.** Story 0008's acceptance criteria
explicitly exempt `UserPolicy.php` lines **34** (`update()`) and **113** (`delete()`) —
`$target->hasRole('Super Admin', 'web')` — and its [Notes /
follow-up](done/0008-super-admin-role-invariants.md) section defers them *here*, on the grounds that they
"have the identical shape and must move together" with the Administrator checks "not piecemeal". This
story therefore swaps **five** call sites: two to `Role::superAdminName()` (already built by 0008 — this
story consumes it and reinvents nothing) and three to `RoleName::Administrator->value`.

### The mechanism — one literal, one shared helper, no config layer

**Read this first, because it is the one place this story deliberately diverges from 0008.** Story 0008
routes "which role is the Super Admin?" through `config('auth.super_admin.role')` because the
`Gate::before` bypass already read that key, so a second, independent literal would have been a genuine
divergence hazard. The Administrator tier has **no such key and must not gain one**: its name is locked
and uneditable, so the enum case below *is* the source of truth and comparing against it directly is
correct here — the very thing 0008 forbids for `RoleName::SuperAdmin`, and for a reason that does not
apply once there is no config value that could disagree with the literal. Do not add
`config('auth.administrator.role')`, do not add an `'administrator'` block to `config/auth.php`, and do
not write an `administratorName()` resolver mirroring `superAdminName()`.

- `app/Enums/RoleName.php` (**modify** — created by 0008) — add `case Administrator = 'Administrator';`
  alongside the existing `SuperAdmin` case. TitleCase key, backing value matching the seeded role name
  exactly (including case), per project `CLAUDE.md` and
  [naming.md](../../docs/conventions/naming.md#classes). This case is the **one and only place the
  literal string `'Administrator'` is written** anywhere in the guard path. Note the asymmetry with
  `SuperAdmin`, and do not "normalise" it away: `RoleName::SuperAdmin` is a compiled-in *default* for a
  config key and is never an identity check, whereas `RoleName::Administrator` **is** the identity.

- `app/Models/Role.php` (**modify** — created by 0008) — add one `public static` helper. It takes a role
  **row** and answers whether that row is the Administrator role, by exact, case-sensitive comparison:

  ```php
  // app/Models/Role.php
  public static function isAdministratorRole(self $role): bool
  {
      return $role->name === RoleName::Administrator->value;
  }
  ```

  Four properties of this shape are load-bearing:

  - **`public static`, not a private policy-local helper.** Story
    [0010](0010-administrator-level-permission-grant.md) needs the identical predicate inside
    `App\Policies\RolePolicy::update()` / `delete()`, and its own draft spelled it as a **private**
    `isAdministratorLevel()` on that policy. A private helper on `RolePolicy` is invisible to this
    story's call sites (`UserPolicy`, `App\Livewire\Users\Index`, `CreateUser`, `UpdateUser`) and would
    leave the two stories with two independent literal comparisons for one concept — exactly the
    duplication this story exists to remove. **The helper lives on `App\Models\Role`, and 0010 consumes
    it rather than defining its own.** This is the coordination point between the two stories; see 0010's
    `RolePolicy` bullet, which has been reconciled to match.
  - **Exact `===` on `name`, never `LIKE`, never a case-insensitive comparison, never a "contains"
    match.** "Administrador Regional" and lowercase "administrator" are ordinary custom roles. Spatie's
    `unique(['name', 'guard_name'])` index means no second row can occupy the exact name, which is what
    makes a name match a safe identity.
  - **It takes a `Role`, so it cannot be handed a name string by accident.** The three call sites that
    need the *name* rather than a row (see below) read `RoleName::Administrator->value` directly.
  - **No config read, no `??` fallback, nothing to resolve at call time.** There is no key that could be
    missing or present-but-`null`, which is the whole point of the locked-name decision: the guard cannot
    silently resolve to `null` and fail open the way a dropped `??` would in 0008's mechanism.

  **The three sites that need a name string, not a row.** `hasRole()`, a `where('name', …)` query and
  `firstOrCreate(['name' => …])` all take the name itself, so they read `RoleName::Administrator->value`
  directly — the same single literal the helper compares against, so the two shapes are one identity
  expressed for two different inputs and cannot drift. Import `App\Enums\RoleName` at those sites.

- `app/Policies/UserPolicy.php` (**modify**) — all **five** literal-role-name checks resolve through the
  centralized methods, and nothing else about the policy's logic changes:

  | Line | Method | Becomes |
  | --- | --- | --- |
  | 34 | `update()` | `$target->hasRole(Role::superAdminName(), 'web')` |
  | 60 | `updateSensitiveAttributes()` | `$target->hasRole(RoleName::Administrator->value, 'web')` |
  | 93 | `downgrade()` | `$target->hasRole(RoleName::Administrator->value, 'web')` |
  | 113 | `delete()` | `$target->hasRole(Role::superAdminName(), 'web')` |
  | 121 | `delete()` | `$target->hasRole(RoleName::Administrator->value, 'web')` |

  The two tiers resolve through deliberately different mechanisms and the table is not a typo: the Super
  Admin name is config-resolved (0008's `Role::superAdminName()`, which this story consumes and does not
  reinvent), the Administrator name is the locked literal held by the enum. These are `hasRole()` checks
  against a **user**, not a `Role` row, which is why they read the name rather than calling
  `Role::isAdministratorRole()`.

  The explicit `'web'` guard argument stays on every one of them, per
  [`docs/security/authorization-patterns.md`](../../docs/security/authorization-patterns.md#always-pass-the-guard-to-hasrole--hasanyrole).
  Import `App\Models\Role` (never `Spatie\Permission\Models\Role` — 0008 establishes that convention and
  enforces it with an `arch()` test scoped to `['App', 'Database\Seeders']`, which covers this file) and
  `App\Enums\RoleName`.

  Note this is a *policy-body* `hasRole()` against the **target**, which
  [`docs/architecture/authorization.md`](../../docs/architecture/authorization.md#userpolicy-abilities)
  explicitly carves out of the "gate on permissions, never role names" convention: it asks *does this
  target hold the role?*, not *may this actor do X?*. Centralizing the name does not change which side of
  that line the check sits on.

- `app/Livewire/Users/Index.php` (**modify**) — three distinct changes:

  1. **Identity.** `administratorRoleId()` (line 402) currently reads
     `->where('name', 'Administrator')` (line 405); swap the literal for
     `RoleName::Administrator->value` (a `where` clause needs the name, not a row — see the three
     name-consuming sites above). The file's `Role` import is currently
     `Spatie\Permission\Models\Role` (line 19) — story 0008 already swaps it to `App\Models\Role`, so by
     the time this story runs the import is correct; re-verify rather than assume.
  2. **Guard relocation (decision 2).** `createNewUser()` (line 308) holds the
     `Gate::authorize('promoteToAdministrator', User::class)` branch (lines 310–315);
     `updateExistingUser()` (line 343) holds the `authorizeRoleChange()` call and the
     `updateSensitiveAttributes` branch (lines 345–356); `authorizeRoleChange()` (line 379) holds the
     promote/downgrade decision. **All of this authorization logic moves into the actions** — the
     component keeps only what it needs to render and submit, and delegates. It must not keep a second
     copy: two implementations of the same rule is the drift this story exists to remove.
  3. **Call-site signature update (decision 3).** `updateExistingUser()` currently computes
     `$applyRoleAndStatus = ! $target->is(Auth::user());` (line 345) and passes it as `UpdateUser`'s sixth
     positional argument (line 364). That argument goes away — see below. Removing it shifts
     `RequestEmailChange` up one position, so the call site must be updated, not merely trimmed.

- `app/Actions/Users/CreateUser.php` (**modify**) — gains the Administrator-role-creation authorization
  check moved out of `Index::createNewUser()`. The action already receives `string $roleId` (line 27), so
  it can resolve the Administrator role id itself and authorize before opening its `DB::transaction()`
  (line 36) — refusing **before** any write, exactly as the component refuses before calling the action
  today. The ability is `promoteToAdministrator`, checked class-level:

  ```php
  Gate::authorize('promoteToAdministrator', User::class);
  ```

  **Verified**, since the story depends on it: `UserPolicy::promoteToAdministrator()` exists at line 77
  with the signature `public function promoteToAdministrator(User $actor, ?User $target = null): bool`,
  and its docblock (lines 67–76) records precisely why `$target` must default to `null` — Laravel's
  `Gate::callPolicyMethod()` drops the first argument for a class-level check, so without the default the
  call raises `ArgumentCountError` instead of allowing or denying anything. The class-level form is what
  `Index.php:314` already uses today.

- `app/Actions/Users/UpdateUser.php` (**modify**) — two changes:

  1. **Gains the promotion / downgrade / sensitive-attribute authorization** moved out of
     `Index::updateExistingUser()` and `Index::authorizeRoleChange()`. The action already has everything
     it needs: `$user`, `$roleId`, `$status`, and `$email` (which it already lowercases at line 37 and
     already compares against `$user->getRawOriginal('email')` at lines 53–55 to decide whether to
     delegate to `RequestEmailChange`). The relocated logic must preserve today's exact semantics:
     - a **no-op** role re-save (submitted role equals the target's current role) is neither a promotion
       nor a downgrade and needs no extra gate (`authorizeRoleChange()` line 384);
     - the current role is read with a **fresh query** (`$target->roles()->value('roles.id')`, line 381),
       never the possibly-stale cached relation;
     - the `updateSensitiveAttributes` gate fires only when the email or the status actually changed
       (lines 350–355), not on every save;
     - **all authorization runs before the first write.** Today the component authorizes before ever
       calling the action; `UpdateUser` currently calls `$user->save()` at line 47, so the relocated
       checks must sit above it or a refused edit could persist the name change before throwing.
  2. **`bool $applyRoleAndStatus` is removed from the signature (decision 3)** — it is currently the sixth
     parameter (line 30) and gates both the status write (line 41) and the `syncRoles()` call (line 49).
     The action derives it internally instead (`Auth::id() !== $user->id`, or the equivalent
     `! $user->is(Auth::user())` the component uses today at line 345). A caller-supplied self-lockout
     guard is only a guard while every caller computes it correctly; once the action is independently
     callable, `applyRoleAndStatus: true` on a self-targeting update is a one-argument bypass of the
     protection.

- `database/seeders/RolePermissionSeeder.php` (**modify**, resolved by Q1) — line 53's
  `Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web'])` becomes
  `Role::firstOrCreate(['name' => RoleName::Administrator->value, 'guard_name' => 'web'])`, structurally
  parallel to the change 0008 makes to line 49 (the Super Admin row) directly above it, differing only in
  that the name comes from the enum rather than from config. This is the smaller half of the change —
  behaviour is identical today — but it is what makes the enum genuinely the single place the literal is
  written: leaving the seeder on its own literal means the row the seeder creates and the row every guard
  protects are two independently-typed strings that a typo could separate.

Confirmed **not** needed, recorded so reviewers don't re-open them: **no `config/auth.php` change and no
`auth.administrator.role` key** (the locked-name decision rules out an override path — see the boxed note
in [Description](#description) and D1); no migration and no new column (D1 rejects the flag-column option
too); no change to `app/Concerns/UserValidationRules.php` (it carries no `'Administrator'` literal, and
its `'Super Admin'` one belongs to 0008); no new `Gate::policy()` registration (`App\Policies\UserPolicy`
is already auto-discovered — 0008 documents why at length and the same reasoning applies unchanged); no
change to `bootstrap/app.php` or `config/permission.php`.

## Tests to perform
- [ ] **Happy path / regression, via the dashboard:** an actor holding `roles.manage-administrators` can still (a) create a user with the Administrator role, (b) promote an ordinary user to Administrator, (c) downgrade an Administrator to an ordinary role, (d) change an Administrator's status, (e) change an Administrator's email, and (f) delete an Administrator. Proves the relocation did not turn the guard into a blanket refusal.
- [ ] **The headline test — direct action calls are independently refused.** With an actor holding `users.create` / `users.edit` but **not** `roles.manage-administrators`, call `App\Actions\Users\CreateUser` and `App\Actions\Users\UpdateUser` **directly** (resolved from the container under `actingAs()`, never through `Livewire::test()`), and assert each throws `AuthorizationException` and writes nothing: (a) `CreateUser` with the Administrator role id; (b) `UpdateUser` promoting an ordinary user to Administrator; (c) `UpdateUser` downgrading an Administrator; (d) `UpdateUser` changing an Administrator's status; (e) `UpdateUser` changing an Administrator's email. **This is the actual proof the gap is closed** — every one of these passes today's `Index`-mediated tests and fails in reality, because nothing in the actions checks anything. Assert on the database row afterwards, not only on the exception.
- [ ] **Refusal happens before any write.** In the `UpdateUser` cases above, submit a **changed name** alongside the refused role/status change and assert the name is *also* unchanged afterwards. Without this, a check placed below `$user->save()` (line 47 today) passes every other bullet while still persisting half the edit.
- [ ] **Self-lockout cannot be re-enabled by a caller (decision 3):** call `UpdateUser` directly against the acting user's own account with a different role id and a different status, and assert the caller's own role and status are unchanged. Confirm by signature inspection that `$applyRoleAndStatus` is no longer a parameter — a test that merely passes `false` proves nothing once the parameter is gone.
- [ ] **Existing dashboard coverage still holds:** the `Livewire::test()`-driven refusals already in `tests/Feature/Users/IndexTest.php` and `tests/Feature/Users/CreateUserTest.php` must keep passing unchanged. Any diff to their assertions is a UX regression to justify, not a test to update — Livewire does not distinguish an exception thrown in the component from one bubbling up one call deeper in the same synchronous `save()`.
- [ ] **Exact-match identity — a near-miss name is an ordinary role.** With an actor holding `users.edit` but **not** `roles.manage-administrators`, assigning a custom role named `"Administrador Regional"` to a user **succeeds**, and so does assigning one named `"administrator"` in lowercase (case-sensitivity). Same for deleting a user holding either. Mirrors story [0010](0010-administrator-level-permission-grant.md)'s equivalent role-side bullets, so the two stories pin the same identity semantics from both sides. This is the test that fails if Phase 3 reaches for `LIKE`, `strcasecmp`, or a "contains" match.
- [ ] **Permission-set-equivalent custom role is still not administrator-level.** A custom role holding every permission the seeded `Administrator` role holds is assignable by an actor with `users.edit` alone. This pins the deliberate, PRD-scoped limitation recorded in the Definition of Done (F15) as *tested behaviour* rather than an accident — so a later change to permission-set-based matching is a visible, deliberate test change rather than a silent redefinition.
- [ ] **Seeder writes the enum's name (Q1).** Running `RolePermissionSeeder` creates a role named exactly `RoleName::Administrator->value` and grants it the same 37 permissions as today. Assert against the enum, not a re-typed `'Administrator'` string literal in the test — otherwise the test and the code can drift together without failing.
- [ ] **All five `UserPolicy` call sites resolve through the centralized identities.** With `auth.super_admin.role` overridden to a non-default value (the Super Admin half is still config-driven — 0008's mechanism, unchanged here), exercise each of `update()`, `updateSensitiveAttributes()`, `downgrade()` and `delete()` (both of its branches) and assert: the two Super Admin branches follow the **configured** name and treat a role literally named `'Super Admin'` as ordinary, while the three Administrator branches follow the **locked literal** name regardless of that config value.
- [ ] **The two tiers are not aliased (`backend-qa`'s combined test).** In the same setup, assert the Super Admin exclusion resolves through `Role::superAdminName()` **independently** of the Administrator identity: a target holding the configured Super Admin role is uneditable and undeletable even by an actor holding every permission, while a target holding the seeded `Administrator` role is editable by an actor holding `roles.manage-administrators`. This is what fails if Phase 3 collapses the two tiers onto one shared literal, or "helpfully" routes the Administrator identity through a config key of its own.
- [ ] **The shared helper is the only implementation.** `App\Models\Role::isAdministratorRole()` exists as a `public static` method and returns `true` only for the exactly-named seeded role. Story 0010's `App\Policies\RolePolicy` is specified to call **this** method rather than define a private `isAdministratorLevel()` of its own; if 0010 lands first, verify it does so rather than adding a second comparison (see 0010's `RolePolicy` bullet).
- [ ] **Narrowness / must-not-over-block:** an actor with `users.edit` but not `roles.manage-administrators` can still assign an ordinary custom role, change an ordinary user's status and email, and delete an ordinary user; an actor with `users.create` alone can still create an ordinary user. Mirrors 0008's "guard stays narrow" section.
- [ ] **Edge — the Administrator role row is absent** (fresh database, before `RolePermissionSeeder` has run): creating and editing users with ordinary roles completes without error and nothing is wrongly blocked. Note the current fail-open shape this pins down: `Index::createNewUser()` compares `(int) $validated['roleId'] === $this->administratorRoleId()`, and `administratorRoleId()` returns `null` when no such role exists, so the comparison is false and no gate fires. That is correct behaviour (no Administrator role means nothing can be promoted to it), but it is behaviour worth a test rather than an accident.
- [ ] **Content-scan test — no `'Administrator'` literal survives in the guard path.** Assert that `app/Policies/UserPolicy.php`, `app/Livewire/Users/Index.php`, `app/Actions/Users/CreateUser.php` and `app/Actions/Users/UpdateUser.php` contain no `'Administrator'` / `'Super Admin'` string literal. Extend the same scan to assert none of them (nor `app/Models/Role.php`, nor `config/auth.php`) contains `auth.administrator.role` or an `'administrator' =>` config block — the locked-name decision forbids that key, and a scan is the cheapest way to keep a well-meaning "mirror 0008 exactly" refactor from reintroducing it. **This is a plain Pest test that reads the files, *not* a real `arch()` expectation** — `backend-qa` proposed it as `arch()` and flagged the caveat themselves: Pest's `arch()` API reasons about namespaces, imports, inheritance and class shape, not about string literals passed as method arguments, so there is no `arch()` expectation that can express "this file contains no such literal". Write it as an ordinary test over `file_get_contents()` (or a small `str_contains` dataset across the four paths) and say so in a comment, so a later reader does not try to "convert it back" to `arch()`.
- [ ] **Placement:** all of the above touch `users`, `roles` and `model_has_roles` rows, so they belong in `tests/Feature/` with `RefreshDatabase`, not `tests/Unit/` — same reasoning as story 0008's placement bullet. The direct-action-call tests go in `tests/Feature/Users/` alongside the existing `CreateUserTest.php` / `IndexTest.php`.

## Expected outcome
Once implemented, "which role is the Administrator tier?" has exactly one answer in the codebase — the
locked literal held by `App\Enums\RoleName::Administrator`, compared through the single shared
`App\Models\Role::isAdministratorRole()` helper wherever a role **row** is in hand and read directly as
`RoleName::Administrator->value` at the three sites that need the name itself — reached by the policy, by
the Livewire component, by both user actions and by story 0010's `RolePolicy` alike. The literal is
written once instead of five times, so the tier's identity can no longer be half-changed. More importantly, the
Administrator-level guard is no longer a property of *one caller*: `App\Actions\Users\CreateUser` and
`App\Actions\Users\UpdateUser` refuse an unprivileged actor on their own, so a future API endpoint,
Artisan command or queued job inherits the protection instead of having to remember it — and
`UpdateUser` can no longer be told to skip the self-lockout guard by a caller passing the wrong flag.
The dashboard behaves exactly as it does today: the same refusals, at the same point in the same
request, with the same `AuthorizationException`. The two Super Admin `UserPolicy` checks deferred by
story 0008 are closed in the same pass, and the two privilege tiers provably resolve through separate
configuration.

## Acceptance criteria
- [ ] `App\Models\Role::isAdministratorRole(self $role): bool` exists as a **single `public static`** implementation performing an exact, case-sensitive `$role->name === RoleName::Administrator->value` comparison. It is the only such comparison in the codebase for a role **row**; story 0010's `App\Policies\RolePolicy` calls it rather than defining a private `isAdministratorLevel()` of its own.
- [ ] `App\Enums\RoleName` carries an `Administrator` case, and it is the **only** place the literal string `'Administrator'` is written anywhere in the guard path — the shared helper compares against it, and the three name-consuming sites (`UserPolicy`'s three `hasRole()` calls, `Index::administratorRoleId()`'s `where`, the seeder's `firstOrCreate`) read `RoleName::Administrator->value` from it.
- [ ] **No `auth.administrator.role` config key exists, and `config/auth.php` is unmodified by this story.** The Administrator tier's name is locked and has no override path — verified by the content-scan test, not only by review.
- [ ] **All five `App\Policies\UserPolicy` literal-role-name call sites resolve through the two centralized identities** — the two Super Admin checks (currently lines 34 and 113) via 0008's config-driven `Role::superAdminName()`, the three Administrator checks (currently lines 60, 93 and 121) via the locked `RoleName::Administrator->value` — each retaining its explicit `'web'` guard argument, and none of the policy's actual authorization logic otherwise changed.
- [ ] `App\Livewire\Users\Index::administratorRoleId()` resolves the role name via `RoleName::Administrator->value` rather than the literal at line 405.
- [ ] `database/seeders/RolePermissionSeeder.php` creates the Administrator role via `RoleName::Administrator->value` (line 53) rather than a re-typed literal, and that role still receives the same 37 permissions.
- [ ] **`App\Actions\Users\CreateUser` and `App\Actions\Users\UpdateUser` each refuse an unprivileged direct caller on their own**, throwing `AuthorizationException` with no database write, proven by tests that call them directly rather than through `App\Livewire\Users\Index`.
- [ ] **`App\Livewire\Users\Index` no longer contains the promotion, downgrade or sensitive-attribute authorization logic itself** — it computes what it needs and delegates. There is one implementation of each rule in the codebase, not a component copy and an action copy.
- [ ] **`UpdateUser`'s `$applyRoleAndStatus` is no longer a parameter**; the action derives the self-edit guard internally from the authenticated user, and `Index`'s call site is updated for the new signature.
- [ ] Refusal happens **before any write**: a refused update leaves the target's name, role, status and email all unchanged.
- [ ] Administrator-level identity is an **exact, case-sensitive name match**: a custom role named `"Administrador Regional"`, one named `"administrator"` in lowercase, and one holding every permission the seeded `Administrator` role holds are all ordinary roles, freely assignable with `users.edit` alone.
- [ ] The two tiers resolve independently: with `auth.super_admin.role` overridden, the Super Admin exclusions follow the configured name while the Administrator guards keep following their locked literal, and neither is aliased onto the other.
- [ ] Ordinary (non-Administrator, non-Super-Admin) role and user management is completely unaffected — assigning a custom role, editing an ordinary user's status/email, and deleting an ordinary user all still work with `users.edit`/`users.delete` alone.
- [ ] With no Administrator role row present, nothing crashes and nothing is wrongly blocked or wrongly permitted.
- [ ] The dashboard's observable behaviour is unchanged: the existing `Livewire::test()`-driven refusal tests pass without amendment.

## Definition of Done
- [ ] Tests written and green
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper) — primary target
      [`docs/architecture/authorization.md`](../../docs/architecture/authorization.md), which must record
      (a) that `App\Enums\RoleName::Administrator` plus the shared `Role::isAdministratorRole()` helper
      are now the single source of truth for the Administrator tier — **and explicitly why this tier is
      *not* config-driven the way `auth.super_admin.role` is**, so the asymmetry between the two reads as
      a decision rather than an oversight to a future reader of that page — and (b) that the
      Administrator-level authorization now lives in `app/Actions/Users/` rather than in the Livewire
      component — its [`UserPolicy` abilities](../../docs/architecture/authorization.md#userpolicy-abilities)
      and [`Gate::authorize` at the call site](../../docs/architecture/authorization.md#gateauthorize-at-the-call-site-not-only-at-the-route)
      sections both describe the current, about-to-change placement. Secondary:
      [`docs/api/routes.md`](../../docs/api/routes.md)'s `users.index` entry describes where the
      component re-authorizes, and
      [`docs/conventions/base-standards.md`](../../docs/conventions/base-standards.md#controllers-sit-in-front-of-actions-not-instead-of-them)'s
      action conventions gain the rule this story establishes: **an authorization rule belongs to the
      action, not to one of its callers.**
- [ ] Acceptance criteria met
- [ ] **Known limitation — the actions authorize against the *authenticated* user, so an unauthenticated
      caller is denied rather than allowed.** `Gate::authorize()` with no resolved user denies, which is
      fail-closed and therefore safe, but it means a future genuinely-unauthenticated caller (a system
      seeder, a console command provisioning a first Administrator) cannot use these actions as-is and
      will need an explicit, deliberately-designed bypass rather than a quietly-relaxed guard. Verified
      **not currently reachable**: nothing in `database/seeders/` or `app/Console/Commands/` calls either
      action today (`app/Console/Commands/` is empty; the only non-doc references to `CreateUser` /
      `UpdateUser` anywhere in `app/`, `database/` or `routes/` are the four in
      `app/Livewire/Users/Index.php`). Recorded so it is a known design consequence, not a surprise.

## Dependencies, risks and open questions

**Sequencing dependency — 0008 must close first, and it now has (2026-08-18).** This story consumes three
artefacts that story [0008](done/0008-super-admin-role-invariants.md) creates. When this file was first
written none of them existed; all three are now **shipped and in the working tree**, so the dependency is
satisfied and Phase 3 is unblocked:

- `App\Models\Role` — this story adds a method to it;
- `App\Enums\RoleName` — this story adds a case to it;
- `App\Models\Role::superAdminName()` — this story *calls* it for the two deferred `UserPolicy` lines. It
  no longer *mirrors* it: the Administrator tier is deliberately not config-driven (D1).

Two consequences of 0008 having landed, both of which Phase 3 must verify rather than assume. Every line
number cited in this file was read from the **pre-0008** tree, and 0008 edited `Index.php`,
`UserValidationRules.php`, `AppServiceProvider.php` and the seeder — so re-locate each site instead of
trusting the numbers. And 0008 shipped guards that its own Phase 1 spec did not contain (its Phase 4
security audit added `creating`/`updating` name-assumption guards, `firstOrCreateSuperAdminRole()`, and
the `assignToModels()` / `removeFromModels()` / `syncModels()` overrides), so read
[`app/Models/Role.php`](../../app/Models/Role.php) itself before adding a method to it. Per
[`docs/workflow.md`](../../docs/workflow.md#task-ordering-rule)'s task-ordering rule, a dependency's
number must sort below its dependents': `0008` sorts before `0008a`, so the filename ordering is
already correct and no renumbering is needed.

**Risk — the relocation is a behaviour-preserving move, and "behaviour-preserving" is the hard part.**
Four semantics currently encoded in `Index::updateExistingUser()` / `authorizeRoleChange()` are easy to
lose in transit, and each is called out in [Files to create/modify](#files-to-createmodify) and covered
by a test bullet: the no-op role re-save exemption; the fresh-query read of the target's current role;
the `updateSensitiveAttributes` gate firing only on an actual email or status change; and authorization
running before the first write. A fifth is the ordering of `Gate::authorize()` relative to
`CreateUser`'s `DB::transaction()` — refusing inside the transaction would still roll back, but refusing
before it is what the component does today and is what the tests should pin.

**Not an open question — unauthenticated callers.** Verified via grep that nothing in
`database/seeders/` or `app/Console/Commands/` invokes `CreateUser` or `UpdateUser` today, so the
fail-closed `Gate::authorize()` behaviour described in the Definition of Done is a design consequence to
record, not a live regression. Nothing to decide.

**Not an open question — `UserValidationRules`.** Verified it carries no `'Administrator'` literal. Out
of scope.

**Q1 (resolved — human decision) — `database/seeders/RolePermissionSeeder.php:53` is in scope.** That line
creates the Administrator role with the literal `'Administrator'`
(`Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web'])`), paralleling line 49's Super
Admin creation — which story **0008 does** convert to `Role::superAdminName()`. **Decision: include it.**
`database/seeders/RolePermissionSeeder.php` is in "Files to create/modify", with the name coming from the
enum: `['name' => RoleName::Administrator->value, 'guard_name' => 'web']`. Behaviour is unchanged today;
what the change buys is that the row the seeder *creates* and the row every guard *protects* stop being
two independently-typed strings. (The original rationale for this decision cited divergence under an
overridden `config('auth.administrator.role')`; that key no longer exists under the locked-name decision,
but the conclusion is unchanged and the reason above still holds on its own.)

**Q2 (for Phase 3 to confirm, not to decide) — the exact ability `CreateUser` authorizes against.**
This file cites `Gate::authorize('promoteToAdministrator', User::class)`, and the ability was verified to
exist with a `?User $target = null` default at `app/Policies/UserPolicy.php:77` — so the class-level call
is valid, and it is what `Index.php:314` already does. What Phase 3 must confirm rather than assume is
that the **relocated** call still reaches the policy identically once it is made from inside the action
rather than from the component: same actor resolution, same `AuthorizationException`, same 403 shape. It
should; nothing about `Gate` depends on the caller's class. Flagged as a confirmation step rather than
asserted, because it was not executed during this debate.

---

## Human decisions (recorded before Phase 3)

- **D1 (revised 2026-08-19 — supersedes the original) — Mechanism: literal name comparison, centralized;
  explicitly *not* config-driven. Approved.** The seeded Administrator role's name is **locked and
  uneditable** (decided centrally, consistently across Epic 1 stories, and recorded in story
  [0010](0010-administrator-level-permission-grant.md)'s "Confirmed decision — role identity" note). It is
  therefore identified at runtime by exact, case-sensitive comparison against the literal name
  (`$role->name === 'Administrator'`), centralized as `App\Models\Role::isAdministratorRole()` plus the
  single `App\Enums\RoleName::Administrator` case that holds the literal. **No `config/auth.php` key, no
  override capability, no migration, no marker column.** Three alternatives were considered and
  **rejected**:
  - *Mirroring 0008's `config('auth.administrator.role')` pattern one tier down* — which is what an
    earlier draft of this story specified in full, including a `Role::administratorName()` resolver with
    both fallbacks. **Rejected because it contradicts the locked-name decision**: a config key *is* an
    override capability, and shipping one would mean the two Epic 1 stories that touch this tier
    (0008a and 0010) disagree about whether the name can change. The symmetry with 0008 is superficially
    attractive and must be resisted — the Super Admin key exists because `Gate::before` already read it,
    not because config indirection is the house pattern for role identity.
  - *A permission-based check* (ask what the target *holds* rather than which role it *is*). Rejected
    because the question these five call sites ask is a target-side **identity** question, not an actor-side
    capability question. [`docs/architecture/authorization.md`](../../docs/architecture/authorization.md#userpolicy-abilities)
    already carves this out explicitly: the "gate on permissions, never role names" convention "governs the
    **call sites**", while "inside a policy body … `hasRole()` [is appropriate] for asking a literal
    question about the *target*, which is exactly what the Super Admin and Administrator exclusions do."
    This is also the F15 question, and the human's confirmed answer is recorded on story 0010's Definition
    of Done: name-based scope is a deliberate, PRD-scoped limitation, not a gap to close here.
  - *A flag column on `roles`* (e.g. `is_administrator_level`). Rejected for the same reason story 0008
    rejected its own equivalent (its Q3): there is no evidence the app needs multiple administrator-tier
    roles, and a column pulls in a migration and `database-expert`, contradicting this story's declared
    backend-only type and its Small INVEST sizing.
- **D2 — Structural approach: move the logic, don't duplicate it. Approved.** The promotion, downgrade and
  sensitive-attribute authorization currently in `Index::createNewUser()`, `Index::updateExistingUser()`
  and `Index::authorizeRoleChange()` moves **into** `CreateUser` / `UpdateUser`. One implementation, not
  two copies: `Index` shrinks to computing what it needs and delegating, and the actions become
  independently safe for any caller. No UX regression — the actions throw `AuthorizationException` at the
  same point in the same synchronous `save()` request, and Livewire does not distinguish an exception
  raised in the component from one bubbling up one call deeper.
- **D3 — Adjacent gap: `UpdateUser` derives `$applyRoleAndStatus` itself. Approved, in scope.** The
  parameter (currently line 30) is caller-supplied and computed by the component as
  `! $target->is(Auth::user())` (line 345) — the self-lockout guard. Once the action is independently
  callable, a caller passing `applyRoleAndStatus: true` on a self-targeting update bypasses that
  protection with one argument. The parameter is removed from the signature and derived internally from
  the authenticated user; `Index`'s call site is updated accordingly.
- **D4 — Unauthenticated callers: verified non-issue, recorded not deferred.** Nothing in
  `database/seeders/` or `app/Console/Commands/` calls either action today, and `Gate::authorize()` with
  no resolved user denies — fail-closed by default. Documented as a known design consequence in the
  Definition of Done rather than carried as an open question.
