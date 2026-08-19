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
> [0009](../0009-administrator-level-permission-grant.md)'s "Confirmed decision — role identity" note. It is
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
[`app/Models/Role.php`](../../../app/Models/Role.php) and
[`app/Policies/RolePolicy.php`](../../../app/Policies/RolePolicy.php) directly before editing either. See
[Dependencies, risks and open questions](#dependencies-risks-and-open-questions).

**The verified Administrator-by-literal-name sites.** `grep -rn "'Administrator'" app/ database/ config/`
returns exactly five:

| File:line | Expression | In scope here? |
| --- | --- | --- |
| `app/Livewire/Users/Index.php:407` | `->where('name', 'Administrator')`, inside `administratorRoleId()` (declared line 404) | yes — but **not by substitution**: the method is *deleted* with its two callers, so the literal disappears rather than being centralized. See the `Index.php` bullet, D2 and AC5 |
| `app/Policies/UserPolicy.php:60` | `$target->hasRole('Administrator', 'web')` in `updateSensitiveAttributes()` | yes |
| `app/Policies/UserPolicy.php:93` | `$target->hasRole('Administrator', 'web')` in `downgrade()` | yes |
| `app/Policies/UserPolicy.php:121` | `$target->hasRole('Administrator', 'web')` in `delete()` | yes |
| `database/seeders/RolePermissionSeeder.php:54` | `Role::firstOrCreate(['name' => 'Administrator', …])` — the call opens at line 53, the literal is on line 54 | yes — see Q1 (resolved) |

**Line numbers re-measured 2026-08-19, after 0008 landed.** The `app/Livewire/Users/Index.php` citations
throughout this file are the post-0008 ones (0008 shifted them by +2 from the pre-0008 numbers an earlier
draft carried); `app/Policies/UserPolicy.php`, `app/Actions/Users/CreateUser.php` and
`app/Actions/Users/UpdateUser.php` were re-verified unchanged. Phase 3 must still re-locate every site
rather than trusting a number.

> **Correction to a Phase 1 contribution, recorded so Phase 3 does not inherit it.** `backend-expert`
> described the three `UserPolicy` Administrator sites as "`promoteToAdministrator`-adjacent, `downgrade`,
> `updateSensitiveAttributes`". The first is wrong: `promoteToAdministrator()` (declared line 77) contains
> **no** `hasRole()` call at all — it is a pure `$actor->hasPermissionTo('roles.manage-administrators')`
> check. The real third site is **`delete()` at line 121**. The count (three) is right; one member of the
> set is not.

**Also verified, contradicting a claim worth ruling out explicitly.**
`App\Concerns\UserValidationRules::roleRules()` does **not** hardcode `'Administrator'`. Its only
role-name literal was `'Super Admin'`, and story **0008 already converted it**: line 30 now reads
`Rule::exists('roles', 'id')->where('guard_name', 'web')->whereNot('name', Role::superAdminName())`.
Nothing in `app/Concerns/` is in this story's scope, and there is nothing left there to convert. Do not
"also fix" it here.

**And the five `UserPolicy` call sites move together, in one pass.** Story 0008's acceptance criteria
explicitly exempt `UserPolicy.php` lines **34** (`update()`) and **113** (`delete()`) —
`$target->hasRole('Super Admin', 'web')` — and its [Notes /
follow-up](../done/0008-super-admin-role-invariants.md) section defers them *here*, on the grounds that they
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
  [naming.md](../../../docs/conventions/naming.md#classes). This case is the **one and only place the
  literal string `'Administrator'` is written** anywhere in the guard path. Note the asymmetry with
  `SuperAdmin`, and do not "normalise" it away: `RoleName::SuperAdmin` is a compiled-in *default* for a
  config key and is never an identity check, whereas `RoleName::Administrator` **is** the identity.

  **The file's own class docblock must be corrected in the same edit.** Lines 8–11 of
  [`app/Enums/RoleName.php`](../../../app/Enums/RoleName.php) currently assert that this enum "supplies only
  the compiled-in default" and that "no guard, scope or policy compares a role row against this enum
  directly" — a bare negative claim that this story makes false the moment it lands, since
  `Role::isAdministratorRole()` does exactly that. Rewrite it to state the rule *per case* (the
  `SuperAdmin` case is a default only and is resolved through `Role::superAdminName()`; the
  `Administrator` case is the locked identity itself and is compared against directly), rather than
  leaving a sentence that has quietly gone stale. Same obligation on the docs side — see the Definition
  of Done's `docs-keeper` bullet — and the general rule in
  [`docs/errors-log.md`](../../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13).

- `app/Models/Role.php` (**modify** — created by 0008) — add one `public static` helper. It takes a role
  **row** and answers whether that row is the Administrator role, by exact, case-sensitive comparison
  against the row's **persisted** name:

  ```php
  // app/Models/Role.php
  public static function isAdministratorRole(self $role): bool
  {
      return $role->persistedName() === RoleName::Administrator->value;
  }
  ```

  **`persistedName()` is a small, strictly behaviour-preserving extraction from 0008's existing private
  `isSuperAdminRole()`** — the not-hydrated-aware resolution that method already performs, lifted into
  one private method both identities then share, so the codebase has exactly one implementation of "read
  this row's real name" rather than two:

  ```php
  // app/Models/Role.php — extracted verbatim from isSuperAdminRole()'s current body
  private function persistedName(): ?string
  {
      if ($this->exists && $this->getKey() !== null) {
          return array_key_exists('name', $this->getOriginal())
              ? $this->getOriginal('name')
              : static::query()->whereKey($this->getKey())->value('name');
      }

      return $this->getAttribute('name');
  }

  private function isSuperAdminRole(): bool
  {
      return $this->persistedName() === self::superAdminName();
  }
  ```

  The extraction must not change `isSuperAdminRole()`'s behaviour in any way: 0008's guard tests
  (`deleting` / `updating` / `creating`, the permission-pivot overrides, the `assignToModels()` family)
  must pass **unamended**. A diff to those assertions is a regression to justify, not a test to update.
  0008's long docblock on `isSuperAdminRole()` explaining *why* it reads persisted identity moves onto
  `persistedName()`, where the logic now lives; do not drop it, and do not merge
  `guardAgainstAssumingSuperAdminName()` into it — that one reads the in-memory attribute on purpose.

  Five properties of this shape are load-bearing:

  - **`public static`, not a private policy-local helper.** Story
    [0009](../0009-administrator-level-permission-grant.md) needs the identical predicate inside
    `App\Policies\RolePolicy::update()` / `delete()`, and its own draft spelled it as a **private**
    `isAdministratorLevel()` on that policy. A private helper on `RolePolicy` is invisible to this
    story's call sites (`UserPolicy`, `App\Livewire\Users\Index`, `CreateUser`, `UpdateUser`) and would
    leave the two stories with two independent literal comparisons for one concept — exactly the
    duplication this story exists to remove. **The helper lives on `App\Models\Role`, and 0009 consumes
    it rather than defining its own.** This is the coordination point between the two stories; see 0009's
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
  - **It reads the row's *persisted* name, so a partially-hydrated instance cannot silently answer
    `false`.** This is a deliberate answer to a documented, still-open residual, not incidental polish —
    see the boxed note directly below.

  > **⚠️ Why the helper hardens itself instead of trusting its callers — the answer to
  > [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#known-limitations--what-is-not-closed)'s
  > open residual.** That page ends with a warning aimed squarely at this story's consumers: `RolePolicy`
  > and the `Gate::before` deferral identify their target with the **in-memory** `$role->name`, so a
  > partially-hydrated instance (`Role::query()->select('id')->find($id)`) passed to `Gate::authorize()`
  > would evade the policy-layer identity check — the column is simply not loaded, `name` reads as
  > `null`, and the guard returns the actor's ordinary answer instead of the protective one.
  > `RolePolicy::update()` / `delete()` already exist — 0008 shipped them with the Super Admin branch —
  > and story [0009](../0009-administrator-level-permission-grant.md)'s planned edits add their Administrator
  > branch, specified to call this helper. That makes them the
  > **first `Gate::authorize()` call sites in this app that pass a `Role` instance to a policy** — so the
  > scenario the ⚠️ was written for is exactly the one this story ships into. None of *this* story's own call sites is affected (all of them resolve a row
  > with a full `select *` read), but the story that defines a shared guard owns its behaviour for every
  > consumer, so the obligation is discharged **inside the helper** rather than pushed onto call sites as
  > a rule someone must remember. Reading persisted identity also answers the rename-in-flight case
  > protectively: a role currently named `Administrator` being renamed away is still administrator-level
  > while the rename is being authorized, because the identity comes from the database rather than from
  > the attacker-supplied new attribute. The alternative — documenting a "callers must fully hydrate"
  > obligation — was **rejected**: it is unenforceable, invisible at the call site, and fails *open*
  > (under-protection) when forgotten, which is the worst of the two failure directions.
  >
  > **What this does *not* close, stated so it is not mistaken for a full fix.** `RolePolicy`'s
  > **Super Admin** branch (`$role->name === Role::superAdminName()`) and the `Gate::before` deferral
  > still read the in-memory attribute, and this story does not touch either — `RolePolicy` belongs to
  > 0009/0010/0011. After this story the residual is **half-closed**: hydration-safe on the Administrator
  > branch by construction, still open on the Super Admin branch. The Definition of Done's `docs-keeper`
  > bullet requires that page's ⚠️ to be updated to say exactly that, rather than left describing a state
  > that no longer fully holds. The underlying rule is
  > [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#a-guard-that-reads-a-rows-protected-identity-must-distinguish-not-hydrated-from-hydrated-but-null).

  **The four sites that need a name string, not a row.** `hasRole()` and `firstOrCreate(['name' => …])`
  take the name itself, so they read `RoleName::Administrator->value` directly — the same single literal
  the helper compares against, so the two shapes are one identity expressed for two different inputs and
  cannot drift. They are `UserPolicy`'s three `hasRole()` calls (lines 60, 93, 121) and the seeder's
  `firstOrCreate` (line 54). Import `App\Enums\RoleName` at those sites.

  **The two sites that hold a role *id*, and how they get to a yes/no answer.** `CreateUser` and
  `UpdateUser` both receive `string $roleId` — an id, not a name and not a row — so neither of the two
  shapes above fits them as given. **They resolve the id to a fully-hydrated row and ask the helper**;
  they must *not* invent a third comparison shape (an id-to-id compare against a
  `where('name', …)->value('id')` lookup, which is what the about-to-be-deleted
  `Index::administratorRoleId()` did):

  ```php
  // the one resolution shape both actions use
  $submittedRole = Role::query()->find((int) $roleId);   // full select *, never select('id')

  $isAdministratorLevel = $submittedRole !== null && Role::isAdministratorRole($submittedRole);
  ```

  Three consequences worth stating so Phase 3 does not re-decide them: a **`null`** row (an id that
  matches no role) is *not* administrator-level — nothing can be promoted into a role that does not
  exist, and the subsequent `syncRoles()` fails on its own; the read is a plain `find()` with **no
  column list**, because a `select('id')` here would hand the helper an unhydrated `name` (the helper
  survives that by design, but the call site should not create the situation); and `UpdateUser` needs
  the **target's current** role in the same shape, read fresh — `$user->roles()->first()`, which queries
  through the relation rather than reading a possibly-stale loaded collection, and hydrates `roles.*`.

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
  [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#always-pass-the-guard-to-hasrole--hasanyrole).
  Import `App\Models\Role` (never `Spatie\Permission\Models\Role` — 0008 establishes that convention and
  enforces it in [`tests/Unit/ArchitectureTest.php`](../../../tests/Unit/ArchitectureTest.php) with **two
  separate single-namespace `arch()` rules**, one `->expect('App')` and one
  `->expect('Database\Seeders')`; the first covers this file) and `App\Enums\RoleName`.

  > **Do not "tidy" those two rules into one `expect(['App', 'Database\Seeders'])`.** Pest evaluates an
  > array of targets **disjunctively** — the rule passes as soon as any one target satisfies it — so the
  > merged form is vacuous over half its stated scope. That is not a hypothetical: it is how the test
  > shipped green the first time, and it is a recorded entry in
  > [`docs/errors-log.md`](../../../docs/errors-log.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18).
  > The split form is deliberate and carries a comment in the test file saying so.

  Note this is a *policy-body* `hasRole()` against the **target**, which
  [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#userpolicy-abilities)
  explicitly carves out of the "gate on permissions, never role names" convention: it asks *does this
  target hold the role?*, not *may this actor do X?*. Centralizing the name does not change which side of
  that line the check sits on.

- `app/Livewire/Users/Index.php` (**modify**) — three distinct changes:

  1. **Guard relocation (decision 2).** `createNewUser()` (line 310) holds the
     `Gate::authorize('promoteToAdministrator', User::class)` branch (lines 312–317);
     `updateExistingUser()` (line 345) holds the `authorizeRoleChange()` call and the
     `updateSensitiveAttributes` branch (lines 347–358); `authorizeRoleChange()` (line 381) holds the
     promote/downgrade decision. **All of this authorization logic moves into the actions** — the
     component keeps only what it needs to render and submit, and delegates. It must not keep a second
     copy: two implementations of the same rule is the drift this story exists to remove.
     `authorizeRoleChange()` itself is deleted, not emptied.
  2. **`administratorRoleId()` is deleted, not converted.** The method (declared line 404, carrying the
     `->where('name', 'Administrator')` literal on line 407) has exactly **two** callers today —
     `createNewUser()` (line 312) and `authorizeRoleChange()` (line 390–392) — and change 1 relocates
     both into the actions. Nothing else in the component or its view references it: `roleOptions()`
     (line 253) builds the role `<select>` from `Role::query()->selectable()` and never singles the
     Administrator role out, and `resources/views/livewire/users.blade.php` (line 166) just iterates
     that list. Converting the literal to `RoleName::Administrator->value` would therefore ship a
     centralized-but-dead private method — so the literal leaves this file by **deletion**, which is the
     honest consequence of D2 and is what AC5 requires. The file's `Role` import (line 11) is
     `App\Models\Role` since 0008; once `administratorRoleId()` is gone, check whether the component
     still uses it (it does — `roleOptions()`) before removing the import.
  3. **Call-site signature update (decision 3).** `updateExistingUser()` currently computes
     `$applyRoleAndStatus = ! $target->is(Auth::user());` (line 347) and passes it as `UpdateUser`'s sixth
     positional argument (line 366). That argument goes away — see below. Removing it shifts
     `RequestEmailChange` up one position, so the call site must be updated, not merely trimmed.

- `app/Actions/Users/CreateUser.php` (**modify**) — gains the Administrator-role-creation authorization
  check moved out of `Index::createNewUser()`. The action already receives `string $roleId` (line 27), so
  it resolves that id to a row itself and authorizes before opening its `DB::transaction()` (line 36) —
  refusing **before** any write, exactly as the component refuses before calling the action today. The
  ability is `promoteToAdministrator`, checked class-level:

  ```php
  // above the try/DB::transaction() block
  $submittedRole = Role::query()->find((int) $roleId);

  if ($submittedRole !== null && Role::isAdministratorRole($submittedRole)) {
      // Class-level: no target exists yet on the create path, which is why
      // UserPolicy::promoteToAdministrator()'s $target parameter defaults to null.
      Gate::authorize('promoteToAdministrator', User::class);
  }
  ```

  This is the shared row-shaped resolution described under
  [The mechanism](#the-mechanism--one-literal-one-shared-helper-no-config-layer) — one `find()`, one
  helper call, no id-to-id comparison and no second name lookup. Import `App\Models\Role` (never the
  Spatie class) and `Illuminate\Support\Facades\Gate`.

  **Verified**, since the story depends on it: `UserPolicy::promoteToAdministrator()` exists at line 77
  with the signature `public function promoteToAdministrator(User $actor, ?User $target = null): bool`,
  and its docblock (lines 67–76) records precisely why `$target` must default to `null` — Laravel's
  `Gate::callPolicyMethod()` drops the first argument for a class-level check, so without the default the
  call raises `ArgumentCountError` instead of allowing or denying anything. The class-level form is what
  `Index.php:316` already uses today.

- `app/Actions/Users/UpdateUser.php` (**modify**) — two changes:

  1. **Gains the promotion / downgrade / sensitive-attribute authorization** moved out of
     `Index::updateExistingUser()` and `Index::authorizeRoleChange()`. The action already has everything
     it needs: `$user`, `$roleId`, `$status`, and `$email` (which it already lowercases at line 37 and
     already compares against `$user->getRawOriginal('email')` at lines 53–55 to decide whether to
     delegate to `RequestEmailChange`). Both role identities are resolved as **rows**, in the one shape
     the mechanism section defines — never as ids compared against a name lookup:

     ```php
     // at the top of __invoke(), above every write
     $isSelfEdit = Auth::user()?->is($user) ?? false;   // derived internally — see item 2 below (D3)

     if (! $isSelfEdit) {
         $submittedRole = Role::query()->find((int) $roleId);
         $currentRole = $user->roles()->first();      // fresh query through the relation, roles.* hydrated
         $currentRoleId = $currentRole?->getKey();

         if ($currentRoleId === null || (int) $currentRoleId !== (int) $roleId) {
             $wasAdministrator = $currentRole !== null && Role::isAdministratorRole($currentRole);
             $willBeAdministrator = $submittedRole !== null && Role::isAdministratorRole($submittedRole);

             if ($willBeAdministrator && ! $wasAdministrator) {
                 Gate::authorize('promoteToAdministrator', $user);
             } elseif ($wasAdministrator && ! $willBeAdministrator) {
                 Gate::authorize('downgrade', $user);
             }
         }
     }
     ```

     The outer `! $isSelfEdit` guard is what item 2 below means by "scopes the relocated authorization
     block above exactly as it scopes it in the component today" — shown here explicitly, since a reader
     of the snippet alone (rather than the surrounding prose) would otherwise see the promote/downgrade
     gates run unconditionally, including against a self-edit, which today they never do
     (`Index.php:349` wraps them in the same condition). The `updateSensitiveAttributes` gate (not shown
     above) sits inside the same `! $isSelfEdit` block.

     Note the null-safe no-op comparison: `$currentRoleId` must be checked for `null` **before** the
     `(int)` cast, or a roleless user (`null` → `0`) would compare equal to a submitted `'0'` and skip
     the gate. The relocated logic must preserve today's exact semantics:
     - a **no-op** role re-save (submitted role equals the target's current role) is neither a promotion
       nor a downgrade and needs no extra gate (`authorizeRoleChange()` lines 386–388);
     - the current role is read with a **fresh query** (`$target->roles()->value('roles.id')`, line 383 —
       becoming `$user->roles()->first()` here, since the action needs the row, not just its id), never
       the possibly-stale cached relation;
     - the `updateSensitiveAttributes` gate fires only when the email or the status actually changed
       (lines 352–357), not on every save;
     - **all authorization runs before the first write.** Today the component authorizes before ever
       calling the action; `UpdateUser` currently calls `$user->save()` at line 47, so the relocated
       checks must sit above it or a refused edit could persist the name change before throwing.
  2. **`bool $applyRoleAndStatus` is removed from the signature (decision 3)** — it is currently the sixth
     parameter (line 30) and gates both the status write (line 41) and the `syncRoles()` call (line 49).
     The action derives it internally instead (`Auth::id() !== $user->id`, or the equivalent
     `! $user->is(Auth::user())` the component uses today at line 347), and that derived value scopes
     the relocated authorization block above exactly as it scopes it in the component today — a
     self-edit reaches neither the role gates nor `updateSensitiveAttributes`. When no user is
     authenticated, `Auth::user()` is `null` and `$user->is(null)` is `false`, so the target is never
     "self" and the gates do run — where they refuse, per D4. A caller-supplied self-lockout
     guard is only a guard while every caller computes it correctly; once the action is independently
     callable, `applyRoleAndStatus: true` on a self-targeting update is a one-argument bypass of the
     protection.

- `database/seeders/RolePermissionSeeder.php` (**modify**, resolved by Q1) — the
  `Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web'])` call opening at line 53
  (the literal is on line 54) becomes
  `Role::firstOrCreate(['name' => RoleName::Administrator->value, 'guard_name' => 'web'])`, structurally
  parallel to the change 0008 **already made** on the Super Admin row directly above it (line 51, now
  `Role::firstOrCreateSuperAdminRole()`), differing only in that the name comes from the enum rather
  than from config — and that the Administrator row needs no equivalent `firstOrCreate…Role()` factory,
  since no model guard refuses its creation. This is the smaller half of the change —
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
- [ ] **Exact-match identity — a near-miss name is an ordinary role.** With an actor holding `users.edit` but **not** `roles.manage-administrators`, assigning a custom role named `"Administrador Regional"` to a user **succeeds**, and so does assigning one named `"administrator"` in lowercase (case-sensitivity). Same for deleting a user holding either. Mirrors story [0009](../0009-administrator-level-permission-grant.md)'s equivalent role-side bullets, so the two stories pin the same identity semantics from both sides. This is the test that fails if Phase 3 reaches for `LIKE`, `strcasecmp`, or a "contains" match.
- [ ] **Permission-set-equivalent custom role is still not administrator-level.** A custom role holding every permission the seeded `Administrator` role holds is assignable by an actor with `users.edit` alone. This pins the deliberate, PRD-scoped limitation recorded in the Definition of Done (F15) as *tested behaviour* rather than an accident — so a later change to permission-set-based matching is a visible, deliberate test change rather than a silent redefinition.
- [ ] **Seeder writes the enum's name (Q1).** Running `RolePermissionSeeder` creates a role named exactly `RoleName::Administrator->value` and grants it the same 37 permissions as today. Assert against the enum, not a re-typed `'Administrator'` string literal in the test — otherwise the test and the code can drift together without failing.
- [ ] **All five `UserPolicy` call sites resolve through the centralized identities.** With `auth.super_admin.role` overridden to a non-default value (the Super Admin half is still config-driven — 0008's mechanism, unchanged here), exercise each of `update()`, `updateSensitiveAttributes()`, `downgrade()` and `delete()` (both of its branches) and assert: the two Super Admin branches follow the **configured** name and treat a role literally named `'Super Admin'` as ordinary, while the three Administrator branches follow the **locked literal** name regardless of that config value.
- [ ] **The two tiers are not aliased (`backend-qa`'s combined test).** In the same setup, assert the Super Admin exclusion resolves through `Role::superAdminName()` **independently** of the Administrator identity: a target holding the configured Super Admin role is uneditable and undeletable even by an actor holding every permission, while a target holding the seeded `Administrator` role is editable by an actor holding `roles.manage-administrators`. This is what fails if Phase 3 collapses the two tiers onto one shared literal, or "helpfully" routes the Administrator identity through a config key of its own.
- [ ] **The shared helper is the only implementation.** `App\Models\Role::isAdministratorRole()` exists as a `public static` method and returns `true` only for the exactly-named seeded role. Story 0009's `App\Policies\RolePolicy` is specified to call **this** method rather than define a private `isAdministratorLevel()` of its own; if 0009 lands first, verify it does so rather than adding a second comparison (see 0009's `RolePolicy` bullet, and the [cross-story contract](#cross-story-contract-with-0009--not-an-acceptance-criterion-of-this-story) below).
- [ ] **The helper is hydration-safe (the ⚠️ residual this story closes on its own side).** `Role::isAdministratorRole(Role::query()->select('id')->find($seededAdministratorRole->getKey()))` returns **`true`** — a partially-hydrated row must not silently answer `false` because `name` was never selected. Assert the mirror case too (a partially-hydrated *ordinary* role still answers `false`, so the hardening did not turn into a blanket `true`), and one rename-in-flight case: a row loaded normally, then given `$role->name = 'Something Else'` in memory **without saving**, still answers `true`, because identity comes from the persisted name. This is the test that fails if Phase 3 writes the naive `$role->name === RoleName::Administrator->value`.
- [ ] **0008's Super Admin guards survive the `persistedName()` extraction.** The existing `App\Models\Role` guard tests — `deleting` / `updating` / `creating`, the permission-pivot overrides, the `assignToModels()` / `removeFromModels()` / `syncModels()` overrides — pass **unamended** after `isSuperAdminRole()` is refactored to call the extracted method. A diff to those assertions is a regression to justify, not a test to update.
- [ ] **Narrowness / must-not-over-block:** an actor with `users.edit` but not `roles.manage-administrators` can still assign an ordinary custom role, change an ordinary user's status and email, and delete an ordinary user; an actor with `users.create` alone can still create an ordinary user. Mirrors 0008's "guard stays narrow" section.
- [ ] **Edge — the Administrator role row is absent** (fresh database, before `RolePermissionSeeder` has run): creating and editing users with ordinary roles completes without error and nothing is wrongly blocked. The shape this pins down after the relocation: the actions resolve the submitted id to a row and ask `Role::isAdministratorRole()`, and no existing row can carry the Administrator name when the role has not been seeded, so no gate fires. Cover the adjacent case in the same bullet — a `roleId` matching **no** role at all resolves to `null`, is likewise not administrator-level, and fails later on its own at `syncRoles()` rather than being silently treated as a promotion. Both are correct behaviour (nothing can be promoted into a role that does not exist), but they are behaviour worth a test rather than an accident. Today's equivalent lived in `Index::administratorRoleId()` returning `null`; that method is deleted by this story.
- [ ] **Content-scan test — no `'Administrator'` literal survives in the guard path.** Assert that `app/Policies/UserPolicy.php`, `app/Livewire/Users/Index.php`, `app/Actions/Users/CreateUser.php` and `app/Actions/Users/UpdateUser.php` contain no `'Administrator'` / `'Super Admin'` string literal. Extend the same scan to assert none of them (nor `app/Models/Role.php`, nor `config/auth.php`) contains `auth.administrator.role` or an `'administrator' =>` config block — the locked-name decision forbids that key, and a scan is the cheapest way to keep a well-meaning "mirror 0008 exactly" refactor from reintroducing it. **This is a plain Pest test that reads the files, *not* a real `arch()` expectation** — `backend-qa` proposed it as `arch()` and flagged the caveat themselves: Pest's `arch()` API reasons about namespaces, imports, inheritance and class shape, not about string literals passed as method arguments, so there is no `arch()` expectation that can express "this file contains no such literal". Write it as an ordinary test over `file_get_contents()` (or a small `str_contains` dataset across the four paths) and say so in a comment, so a later reader does not try to "convert it back" to `arch()`.
- [ ] **Placement:** all of the above touch `users`, `roles` and `model_has_roles` rows, so they belong in `tests/Feature/` with `RefreshDatabase`, not `tests/Unit/` — same reasoning as story 0008's placement bullet. The direct-action-call tests go in `tests/Feature/Users/` alongside the existing `CreateUserTest.php` / `IndexTest.php`.

## Expected outcome
Once implemented, "which role is the Administrator tier?" has exactly one answer in the codebase — the
locked literal held by `App\Enums\RoleName::Administrator`, compared through the single shared
`App\Models\Role::isAdministratorRole()` helper wherever a role **row** is in hand (both user actions
today, story 0009's `RolePolicy` next) and read directly as `RoleName::Administrator->value` at the four
sites that need the name itself (`UserPolicy`'s three `hasRole()` calls and the seeder). The Livewire
component holds neither shape any more: its own copy left with `administratorRoleId()`. The literal is
written once instead of five times, so the tier's identity can no longer be half-changed — and because
the helper resolves the row's *persisted* name, a partially-hydrated `Role` handed to a policy answers
protectively instead of silently falling through. More importantly, the
Administrator-level guard is no longer a property of *one caller*: `App\Actions\Users\CreateUser` and
`App\Actions\Users\UpdateUser` refuse an unprivileged actor on their own, so a future API endpoint,
Artisan command or queued job inherits the protection instead of having to remember it — and
`UpdateUser` can no longer be told to skip the self-lockout guard by a caller passing the wrong flag.
The dashboard behaves exactly as it does today: the same refusals, at the same point in the same
request, with the same `AuthorizationException`. The two Super Admin `UserPolicy` checks deferred by
story 0008 are closed in the same pass, and the two privilege tiers provably resolve through separate
configuration.

## Acceptance criteria
- [ ] `App\Models\Role::isAdministratorRole(self $role): bool` exists as a **single `public static`** implementation performing an exact, case-sensitive comparison of the row's **persisted** name against `RoleName::Administrator->value`. Within the files this story touches it is the only row-shaped Administrator comparison — no call site, and no other class, re-derives it. (What story **0009** does with it is a cross-story contract recorded in [Dependencies](#cross-story-contract-with-0009--not-an-acceptance-criterion-of-this-story), deliberately **not** an acceptance criterion here: 0009 may not have landed when this story reaches Phase 5, and this story cannot be blocked on a file it does not author.)
- [ ] **The helper is hydration-safe**: a partially-hydrated Administrator row (`Role::query()->select('id')->find($id)`) answers `true`, and a row renamed in memory but not saved still answers by its persisted name. `isSuperAdminRole()` resolves through the same extracted `persistedName()` method, with 0008's guard tests passing unamended.
- [ ] `App\Enums\RoleName` carries an `Administrator` case, and it is the **only** place the literal string `'Administrator'` is written anywhere in the guard path — the shared helper compares against it, and the four name-consuming sites (`UserPolicy`'s three `hasRole()` calls and the seeder's `firstOrCreate`) read `RoleName::Administrator->value` from it. The enum's class docblock no longer claims that no guard compares a role row against it directly.
- [ ] **No `auth.administrator.role` config key exists, and `config/auth.php` is unmodified by this story.** The Administrator tier's name is locked and has no override path — verified by the content-scan test, not only by review.
- [ ] **All five `App\Policies\UserPolicy` literal-role-name call sites resolve through the two centralized identities** — the two Super Admin checks (currently lines 34 and 113) via 0008's config-driven `Role::superAdminName()`, the three Administrator checks (currently lines 60, 93 and 121) via the locked `RoleName::Administrator->value` — each retaining its explicit `'web'` guard argument, and none of the policy's actual authorization logic otherwise changed.
- [ ] **`App\Livewire\Users\Index::administratorRoleId()` no longer exists** — it is deleted along with `authorizeRoleChange()`, since D2 relocates both of its callers into the actions and nothing else in the component or its view uses it. The Administrator-role-identity question it used to answer is asked **inside `CreateUser` / `UpdateUser` instead**, in the row shape: each resolves its `string $roleId` (and, in `UpdateUser`, the target's current role) to a fully-hydrated `App\Models\Role` and calls `Role::isAdministratorRole()`. Neither action reintroduces the old id-to-id comparison against a `where('name', …)->value('id')` lookup, and no `'Administrator'` literal survives in either file.
- [ ] `database/seeders/RolePermissionSeeder.php` creates the Administrator role via `RoleName::Administrator->value` (the `firstOrCreate` opening at line 53) rather than a re-typed literal, and that role still receives the same 37 permissions.
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
      [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md), which must record
      (a) that `App\Enums\RoleName::Administrator` plus the shared `Role::isAdministratorRole()` helper
      are now the single source of truth for the Administrator tier — **and explicitly why this tier is
      *not* config-driven the way `auth.super_admin.role` is**, so the asymmetry between the two reads as
      a decision rather than an oversight to a future reader of that page — and (b) that the
      Administrator-level authorization now lives in `app/Actions/Users/` rather than in the Livewire
      component — its [`UserPolicy` abilities](../../../docs/architecture/authorization.md#userpolicy-abilities)
      and [`Gate::authorize` at the call site](../../../docs/architecture/authorization.md#gateauthorize-at-the-call-site-not-only-at-the-route)
      sections both describe the current, about-to-change placement.

      **Three specific statements elsewhere become false the day this ships and must be corrected in
      the same pass — named here so they are not left to be discovered later**, per the "don't leave a
      bare negative claim to go stale into a lie" rule in
      [`docs/errors-log.md`](../../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13):

      1. [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#one-name-one-resolution-path)'s
         **"One name, one resolution path"** section closes with "`App\Enums\RoleName` supplies **only**
         the compiled-in default … and it is never an identity check." True of the `SuperAdmin` case,
         false of the `Administrator` case this story adds. Rewrite it per case rather than deleting the
         sentence — the *Super Admin* half of it is the rule 0008 exists to protect.
      2. [`app/Enums/RoleName.php`](../../../app/Enums/RoleName.php)'s own class docblock (lines 8–11)
         carries the same claim in code — "no guard, scope or policy compares a role row against this
         enum directly". That correction is **Phase 3 work, not `docs-keeper`'s** (it is a source file);
         it is listed in [Files to create/modify](#files-to-createmodify) under the enum bullet and
         repeated here only so the two halves are corrected together.
      3. The ⚠️ residual at the end of that page's
         [Known limitations](../../../docs/architecture/authorization.md#known-limitations--what-is-not-closed)
         section — "a partially-hydrated `Role` … would evade the **policy** layer" — is **half-closed**
         by this story and must say so: hydration-safe wherever identity resolves through
         `Role::isAdministratorRole()`, still open on `RolePolicy`'s Super Admin branch and the
         `Gate::before` deferral, which read the in-memory `$role->name` and belong to stories
         0009/0010/0011. Do not delete the warning; narrow it.

      Secondary:
      [`docs/api/routes.md`](../../../docs/api/routes.md)'s `users.index` entry describes where the
      component re-authorizes, and
      [`docs/conventions/base-standards.md`](../../../docs/conventions/base-standards.md#controllers-sit-in-front-of-actions-not-instead-of-them)'s
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
      `UpdateUser` anywhere in `app/`, `database/` or `routes/` are the five in
      `app/Livewire/Users/Index.php` — the two imports plus three call sites). Recorded so it is a known
      design consequence, not a surprise.

## Dependencies, risks and open questions

**Sequencing dependency — 0008 must close first, and it now has (2026-08-18).** This story consumes three
artefacts that story [0008](../done/0008-super-admin-role-invariants.md) creates. When this file was first
written none of them existed; all three are now **shipped and in the working tree**, so the dependency is
satisfied and Phase 3 is unblocked:

- `App\Models\Role` — this story adds a method to it;
- `App\Enums\RoleName` — this story adds a case to it;
- `App\Models\Role::superAdminName()` — this story *calls* it for the two deferred `UserPolicy` lines. It
  no longer *mirrors* it: the Administrator tier is deliberately not config-driven (D1).

Two consequences of 0008 having landed, both of which Phase 3 must verify rather than assume. The line
numbers in this file were **re-measured against the post-0008 tree on 2026-08-19** (0008 edited
`Index.php`, `UserValidationRules.php`, `AppServiceProvider.php` and the seeder, shifting the
`Index.php` citations by +2 and the seeder's by +1), but they are still only a reading aid — re-locate
each site rather than trusting a number. And 0008 shipped guards that its own Phase 1 spec did not contain (its Phase 4
security audit added `creating`/`updating` name-assumption guards, `firstOrCreateSuperAdminRole()`, and
the `assignToModels()` / `removeFromModels()` / `syncModels()` overrides), so read
[`app/Models/Role.php`](../../../app/Models/Role.php) itself before adding a method to it. Per
[`docs/workflow.md`](../../../docs/workflow.md#task-ordering-rule)'s task-ordering rule, a dependency's
number must sort below its dependents': `0008` sorts before `0008a`, so the filename ordering is
already correct and no renumbering is needed.

### Cross-story contract with 0009 — not an acceptance criterion of this story

Story [0009](../0009-administrator-level-permission-grant.md) needs the identical predicate inside
`App\Policies\RolePolicy::update()` / `delete()`, and an earlier draft of it spelled that as a
**private** `isAdministratorLevel()` on the policy. The two stories are reconciled: **the helper lives
on `App\Models\Role`, and 0009 consumes it rather than defining its own** — whichever story reaches
Phase 3 first creates it, the other calls it. 0009's `RolePolicy` bullet already states this from its
side, and this story's mechanism section states it from this one.

**That expectation is recorded here rather than as an acceptance criterion, deliberately.** 0009 may
well not have landed when this story reaches its own Phase 5, and an AC of the form "0009's file calls
this method" would then be unverifiable from inside this story — a criterion no reviewer could tick
without reviewing a file that does not exist. What *is* an acceptance criterion here is the half this
story owns: the helper exists, is `public static`, is hydration-safe, and is the only row-shaped
Administrator comparison in the files this story touches. The 0009 half is verified when 0009 is
reviewed, and this story's test bullet on it stays conditional ("if 0009 lands first, verify it does so
rather than adding a second comparison") for the same reason.

Two further clauses of the same contract, both already reflected in 0009's file:

- **The helper stays `public static`, taking `self $role`.** 0009's snippet calls it as
  `Role::isAdministratorRole($role)`; changing it to an instance method would silently invalidate a
  spec that has already been reconciled once.
- **0009 inherits the hydration-safety, and should say so.** Because the helper resolves persisted
  identity, 0009's Administrator branch is safe against the partially-hydrated `Role` its own file flags
  as "a known residual inherited from 0008, worth a decision here rather than a rediscovery". 0009's
  decision on that point is therefore narrowed to its **Super Admin** branch only, which this story does
  not touch. Worth noting for 0009's author: renaming an ordinary role *into* `'Administrator'` is
  blocked by Spatie's `unique(name, guard_name)` index while the seeded row exists — the Administrator
  name has no `creating`/`updating` guard of its own, unlike the Super Admin name.

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
(`Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web'])`), paralleling the Super Admin
creation directly above it — which story **0008 already converted**, to
`Role::firstOrCreateSuperAdminRole()` (line 51). **Decision: include it.**
`database/seeders/RolePermissionSeeder.php` is in "Files to create/modify", with the name coming from the
enum: `['name' => RoleName::Administrator->value, 'guard_name' => 'web']`. Behaviour is unchanged today;
what the change buys is that the row the seeder *creates* and the row every guard *protects* stop being
two independently-typed strings. (The original rationale for this decision cited divergence under an
overridden `config('auth.administrator.role')`; that key no longer exists under the locked-name decision,
but the conclusion is unchanged and the reason above still holds on its own.)

**Q2 (for Phase 3 to confirm, not to decide) — the exact ability `CreateUser` authorizes against.**
This file cites `Gate::authorize('promoteToAdministrator', User::class)`, and the ability was verified to
exist with a `?User $target = null` default at `app/Policies/UserPolicy.php:77` — so the class-level call
is valid, and it is what `Index.php:316` already does. What Phase 3 must confirm rather than assume is
that the **relocated** call still reaches the policy identically once it is made from inside the action
rather than from the component: same actor resolution, same `AuthorizationException`, same 403 shape. It
should; nothing about `Gate` depends on the caller's class. Flagged as a confirmation step rather than
asserted, because it was not executed during this debate.

---

## Human decisions (recorded before Phase 3)

- **D1 (revised 2026-08-19 — supersedes the original) — Mechanism: literal name comparison, centralized;
  explicitly *not* config-driven. Approved.** The seeded Administrator role's name is **locked and
  uneditable** (decided centrally, consistently across Epic 1 stories, and recorded in story
  [0009](../0009-administrator-level-permission-grant.md)'s "Confirmed decision — role identity" note). It is
  therefore identified at runtime by exact, case-sensitive comparison against the literal name
  (`$role->name === 'Administrator'` — refined by **D5** below to compare the row's *persisted* name, an
  answer to a hydration hazard rather than a change of mechanism), centralized as
  `App\Models\Role::isAdministratorRole()` plus the
  single `App\Enums\RoleName::Administrator` case that holds the literal. **No `config/auth.php` key, no
  override capability, no migration, no marker column.** Three alternatives were considered and
  **rejected**:
  - *Mirroring 0008's `config('auth.administrator.role')` pattern one tier down* — which is what an
    earlier draft of this story specified in full, including a `Role::administratorName()` resolver with
    both fallbacks. **Rejected because it contradicts the locked-name decision**: a config key *is* an
    override capability, and shipping one would mean the two Epic 1 stories that touch this tier
    (0008a and 0009) disagree about whether the name can change. The symmetry with 0008 is superficially
    attractive and must be resisted — the Super Admin key exists because `Gate::before` already read it,
    not because config indirection is the house pattern for role identity.
  - *A permission-based check* (ask what the target *holds* rather than which role it *is*). Rejected
    because the question these five call sites ask is a target-side **identity** question, not an actor-side
    capability question. [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#userpolicy-abilities)
    already carves this out explicitly: the "gate on permissions, never role names" convention "governs the
    **call sites**", while "inside a policy body … `hasRole()` [is appropriate] for asking a literal
    question about the *target*, which is exactly what the Super Admin and Administrator exclusions do."
    This is also the F15 question, and the human's confirmed answer is recorded on story 0009's Definition
    of Done: name-based scope is a deliberate, PRD-scoped limitation, not a gap to close here.
  - *A flag column on `roles`* (e.g. `is_administrator_level`). Rejected for the same reason story 0008
    rejected its own equivalent (its Q3): there is no evidence the app needs multiple administrator-tier
    roles, and a column pulls in a migration and `database-expert`, contradicting this story's declared
    backend-only type and its Small INVEST sizing.
- **D2 (extended 2026-08-19 — see D6) — Structural approach: move the logic, don't duplicate it.
  Approved.** The promotion, downgrade and
  sensitive-attribute authorization currently in `Index::createNewUser()`, `Index::updateExistingUser()`
  and `Index::authorizeRoleChange()` moves **into** `CreateUser` / `UpdateUser`. One implementation, not
  two copies: `Index` shrinks to computing what it needs and delegating, and the actions become
  independently safe for any caller. **Two private methods leave the component entirely rather than
  being converted:** `authorizeRoleChange()`, whose whole body relocates, and `administratorRoleId()`,
  whose only two callers were `createNewUser()` and `authorizeRoleChange()` — with both gone it has no
  caller left, so keeping it (even with its literal centralized) would ship dead code. The identity
  question it answered is asked inside the actions instead, in the row shape defined by D5/D6. No UX regression — the actions throw `AuthorizationException` at the
  same point in the same synchronous `save()` request, and Livewire does not distinguish an exception
  raised in the component from one bubbling up one call deeper.
- **D3 — Adjacent gap: `UpdateUser` derives `$applyRoleAndStatus` itself. Approved, in scope.** The
  parameter (currently line 30) is caller-supplied and computed by the component as
  `! $target->is(Auth::user())` (line 347) — the self-lockout guard. Once the action is independently
  callable, a caller passing `applyRoleAndStatus: true` on a self-targeting update bypasses that
  protection with one argument. The parameter is removed from the signature and derived internally from
  the authenticated user; `Index`'s call site is updated accordingly.
- **D4 — Unauthenticated callers: verified non-issue, recorded not deferred.** Nothing in
  `database/seeders/` or `app/Console/Commands/` calls either action today, and `Gate::authorize()` with
  no resolved user denies — fail-closed by default. Documented as a known design consequence in the
  Definition of Done rather than carried as an open question.
- **D5 (added 2026-08-19, resolving Phase 2 blocking point 3) — the helper hardens itself; the
  "callers must fully hydrate" alternative is rejected.** `Role::isAdministratorRole()` compares the
  row's **persisted** name, resolved through a `persistedName()` method extracted from 0008's existing
  private `isSuperAdminRole()` (so there is one implementation of that resolution, not two). Rationale,
  in the order it was weighed: this story's own call sites are unaffected either way (all resolve rows
  with a full `select *`), but this story *defines the shared guard*, and story 0009's `RolePolicy` —
  the first `Gate::authorize()` call sites in this app to pass a `Role` to a policy — is exactly the
  scenario `docs/architecture/authorization.md`'s ⚠️ residual warns about. A documented caller
  obligation was rejected because it is unenforceable, invisible at the call site, and fails **open**
  when forgotten; hardening costs one already-proven code path and fails **closed**. Scope guard: the
  extraction must be strictly behaviour-preserving and 0008's guard tests must pass unamended, and this
  story does **not** touch `RolePolicy`'s Super Admin branch, which stays 0009/0010/0011's obligation
  and stays named in the (narrowed, not deleted) ⚠️.
- **D6 (added 2026-08-19, resolving Phase 2 blocking point 1) — `Index::administratorRoleId()` is
  deleted, and the actions resolve *rows*, not ids.** Keeping the method to satisfy the old AC5 would
  have shipped a private method with no caller; deleting it is the honest consequence of D2. The
  replacement shape is stated once and used by both actions: resolve `string $roleId` with
  `Role::query()->find((int) $roleId)` (full `select *`), resolve `UpdateUser`'s current role with
  `$user->roles()->first()` (fresh query through the relation), and ask `Role::isAdministratorRole()`.
  The rejected alternative was the id-shaped one the deleted method used — a name-keyed
  `where('name', …)->value('id')` lookup compared id-to-id — which would have introduced a **third**
  comparison shape for one identity, exactly what this story exists to prevent. A `null` row is not
  administrator-level.
- **D7 (added 2026-08-19, resolving Phase 2 blocking point 2) — 0009's consumption of the helper is a
  cross-story contract, not an acceptance criterion of this story.** Moved out of the acceptance
  criteria and into [Dependencies](#cross-story-contract-with-0009--not-an-acceptance-criterion-of-this-story),
  because 0009 may not have landed when this story reaches Phase 5 and no reviewer can tick a criterion
  about a file that does not exist. The corresponding test bullet stays conditional, which is how it was
  already written.

---

## Phase 2 review record

**2026-08-19 — Phase 2 (INVEST + doc-consistency, `code-reviewer`): ❌ rejected, revised, resubmitted.**
Per [`docs/workflow.md`](../../../docs/workflow.md#governance-notes)'s governance note that no task advances
without an explicit recorded reason, this is the record of that rejection and of how each point was
closed. No Phase 3 work had started; the file was in the `new` stage throughout.

Three blocking findings:

1. **`Index::administratorRoleId()` dead-code contradiction** — AC5 required the method to survive with a
   centralized literal, while D2 relocated both of its callers, leaving it caller-less. Resolved as
   **D6**: the method is deleted, AC5 now requires the action-internal row-shaped resolution instead, and
   the "Files to create/modify" `Index.php` bullet, D2 and AC5 were rewritten to agree. The related
   **Estimable** gap — which input shape the actions actually hold — is closed in the same pass: both
   receive `string $roleId`, and the mechanism section now specifies the single resolution
   (`Role::query()->find()` → `Role::isAdministratorRole()`, plus `$user->roles()->first()` for the
   target's current role) with the null and no-op cases spelled out.
2. **AC1 depended on an unwritten file in a sibling story** — resolved as **D7**: the 0009 expectation
   moved into a new *Cross-story contract with 0009* subsection under Dependencies; AC1 now asserts only
   what this story's own files can be reviewed against; the already-hedged test bullet is unchanged and
   now points at that subsection.
3. **The helper walked into `authorization.md`'s open ⚠️ partial-hydration residual** — resolved as
   **D5** (option (a), self-hardening): the helper reads persisted identity via an extracted
   `persistedName()`, with a boxed note recording why the caller-obligation alternative was rejected,
   what the change does *not* close (`RolePolicy`'s Super Admin branch, the `Gate::before` deferral), two
   new test bullets (hydration-safety, and 0008's guards surviving the extraction), a new acceptance
   criterion, and a Definition-of-Done requirement to **narrow rather than delete** that ⚠️.

Four non-blocking findings, all applied:

- The DoD `docs-keeper` bullet now names the three statements this story falsifies — `authorization.md`'s
  "`RoleName` … is never an identity check", `app/Enums/RoleName.php`'s matching docblock claim (assigned
  to Phase 3, since it is a source file), and the ⚠️ residual — per the errors-log rule on bare negative
  claims outliving the code.
- The `arch()` description was corrected from the **vacuous** `expect(['App', 'Database\Seeders'])` array
  form to the two separate single-namespace rules `tests/Unit/ArchitectureTest.php` really ships, with a
  boxed warning so Phase 3 does not "tidy" them back together.
- `UserValidationRules::roleRules()` corrected to past tense — 0008 **already** converted that line;
  `app/Concerns/` remains out of scope, and there is now nothing left there to convert.
- Line numbers re-measured against the post-0008 tree (`Index.php` +2, seeder +1; `UserPolicy.php`,
  `CreateUser.php`, `UpdateUser.php` verified unchanged), with a note that they remain a reading aid
  rather than a contract.

Everything the reviewer verified sound was left alone: the locked-literal-vs-config design (D1), the
Gherkin, the test bullets other than the three touched above, and D2–D4 apart from D2's added deletion
clause.

**2026-08-19 — Phase 2, second pass: ✅ passed.** All three blocking findings verified resolved and
internally consistent (no stray survivor of `administratorRoleId()`, the `persistedName()` extraction
confirmed to be `isSuperAdminRole()`'s real current body, AC1 confirmed self-contained). Five further
non-blocking polish items from the second pass were applied directly, none of them gating: the two
`Index.php:314` citations corrected to `:316` and the `line 345` self-lockout citation corrected to
`:347`; the `RoleName.php` docblock citation corrected from lines 10–12 to 8–11 (both occurrences); the
`UpdateUser` authorization snippet now shows the `! $isSelfEdit` guard explicitly instead of relying on
adjacent prose, so it can't be misread in isolation; the Definition of Done's known-limitation bullet
corrected from "four" to "five" non-doc references to `CreateUser`/`UpdateUser` in `Index.php`; and the
boxed ⚠️ note reworded so it credits 0009 with adding the Administrator *branch* to `RolePolicy::update()`
/ `delete()`, not with authoring those methods — both already exist, shipped by 0008. **Status: Phase 2
passed, ready for Phase 3.**

---

## Phase 3/4/5 implementation record

**2026-08-19 — Phase 3 (`backend-expert`): implemented as specified.** `RoleName::Administrator`,
`Role::isAdministratorRole()` (with `persistedName()` extracted from `isSuperAdminRole()`), the five
`UserPolicy` call sites, `Index::administratorRoleId()`/`authorizeRoleChange()` deletion, and the
relocation into `CreateUser`/`UpdateUser` (including removing `UpdateUser`'s `$applyRoleAndStatus`
parameter) all landed as the mechanism section specifies. 434 tests passing, Pint and Larastan clean.

**2026-08-19 — Phase 4 (`appsec-auditor`), three rounds.** Round 1: **FAIL**, one High + two Medium
findings — F1 (the guard relocation was partial: assigning the *Super Admin* role through either action
was completely ungated, and a name-only `UpdateUser` edit reached `$user->save()` with no authorization
at all), F2 (TOCTOU — `$statusChanged` compared against the in-memory `$user->status` rather than the
persisted value), F3 (`UpdateUser` decided "was Administrator?" from an unordered `roles()->first()`
while `UserPolicy` decides it via `hasRole()` over the whole collection). Three Low findings also raised
(F4 `guard_name`-agnostic matching, accepted/documented; F5 the case-insensitive `roles.name` collation
letting the seeder silently adopt a colliding row; F6 no transaction around `UpdateUser`'s writes). All
six fixed in the same pass: `Role::isSuperAdminRoleRow()` added; `CreateUser`/`UpdateUser` both call
`Gate::authorize('create'|'update', ...)` themselves and `throw` directly (never through `Gate`) when the
*submitted* role is Super Admin; `UpdateUser` compares against `getRawOriginal('status')`; its writes
wrapped in `DB::transaction()`; the seeder gained a `throw_unless()` read-back assertion.

Round 2 re-audited those fixes and again **FAIL**ed, with two Medium + one Low new finding against the
fixes themselves: N1 (`Gate::authorize('update', $user)` ran *before* the fresh `roles` reload added for
F3, so a caller passing a stale `->with('roles')`-hydrated instance could evade `UserPolicy::update()`'s
Super Admin-target exclusion), N2 (the Super Admin refusal only checked the *submitted* role, never
whether the *target currently holds* Super Admin — a Super Admin actor, whose `Gate::before` bypass makes
any `Gate`-mediated check moot, could demote another Super Admin via `UpdateUser`), N3
(`Role::firstOrCreateSuperAdminRole()` lacked the same case-collation read-back guard F5 had just given
the Administrator-role seeder line). Fixed: `$user->load('roles')` moved to the literal first statement
of `UpdateUser::__invoke()`; a direct-throw check for the target's *current* Super Admin membership added
as the first statement of `authorizeRoleAndStatusChange()`; `firstOrCreateSuperAdminRole()` gained its own
`throw_unless()`, centralized in the model rather than duplicated at the seeder call site.

Round 3: **PASS**, unambiguously — all of F1–F6 and N1–N3 verified closed by live execution. Two
non-blocking follow-ups noted, not fixed as part of this story (see below): P1 (the `Index::loadUsers()`
`canEdit` UI hint can render enabled for a Super Admin actor viewing a Super Admin-holding target, while
`UpdateUser`'s N2 guard still refuses the save) and P2 (`UserPolicy::delete()`'s Super Admin-target
exclusion is still only policy-level, so a Super Admin actor can still delete — including self-delete —
another Super Admin holder; pre-existing since story 0005/0008, out of this story's scope). 443 tests
passing throughout, Pint and Larastan clean.

**2026-08-19 — Phase 5 (`code-reviewer`): changes needed — minor, then resolved in the same pass.**
Verdict was "no logic change required", four findings addressed directly (comment/record corrections
only):

- **F1 (source docblock)** — `Index::loadUsers()`'s docblock asserted the row-action disabled state "can
  never drift from what actually happens if they were clicked", which P1 above makes false for a Super
  Admin actor viewing a Super Admin-holding target. Rewritten to name that one accepted exception (drift
  is always enabled-then-refused, never the reverse) and to correct an adjacent pre-existing inaccuracy
  (the sentence described `canEdit` with `canDelete`'s stricter rule).
- **F2 (test-file TDD narration)** — `UpdateUserActionAuthorizationTest.php`, `CreateUserActionAuthorizationTest.php`
  and `RoleTest.php` carried present-tense "this does not exist yet" / "TODAY's signature" framing written
  before Phase 3 landed, which read as false claims once it had. Reworded to past tense; the rationale
  each comment carries (why the direct call matters, what each finding was) was kept.
- **F3 (this record) — the case-sensitivity Gherkin scenario and half of AC12 are unsatisfiable in this
  schema.** `roles.name` carries the `utf8mb4_unicode_ci` collation (`config/database.php`), so Spatie's
  `unique(name, guard_name)` index refuses a lowercase `"administrator"` row while the seeded
  `"Administrator"` exists — the scenario *"Administrator-level matching is case-sensitive … a custom role
  named 'administrator' in lowercase"* cannot be reached via role creation in this schema. The `===`
  comparison itself is still exercised, deliberately, against a **not-yet-persisted** instance
  (`RoleTest.php`'s `isAdministratorRole() is case-sensitive: a not-yet-persisted role named
  "administrator"…` test) — retained because it is the correct guard if the collation is ever changed to
  a case-/accent-sensitive one, and because it is what makes the F5/N3 seeder read-back guards meaningful
  (they assert the *persisted* name matches exactly, which only means something if `===` is genuinely
  exact). Not a defect: the compensating control is the seeder-level read-back guard (F5/N3), which fails
  loudly on exactly the collision this scenario can't otherwise exercise.
- **F4 (this record) — one dashboard behaviour changed, an accepted AC16 deviation.** Before this story, a
  Super Admin actor editing another Super Admin-holding user through the dashboard succeeded
  (`Gate::before` bypassed `UserPolicy::update()`'s exclusion, and nothing else checked). After the N2 fix
  it throws. This is the correct outcome — the whole point of N2 was closing exactly this — and is
  recorded here as a deliberate, security-motivated AC16 deviation rather than a silent behaviour change.
  It is the code-side twin of P1 above (the UI hint still renders that save as available). `docs-keeper`'s
  brief is widened accordingly: beyond the three statements named in the Definition of Done, correct
  `docs/architecture/authorization.md`'s "consistent with the mutating path, which grants them too" claim
  (now false for this one actor/target combination, and still quoting the pre-story
  `hasRole('Super Admin', 'web')` literal) and `docs/api/routes.md`'s "the disabled state cannot drift"
  claim, and record the P1/P2 asymmetry (`UpdateUser` now hard-refuses a Super Admin-holding target;
  `deleteUser()` does not) explicitly rather than leaving a reader to find it by accident.

Three further findings were reviewed and left as-is, per the reviewer's own recommendation not to churn
working code for a preference: F5 (the seeder's Administrator-collision guard throws `RuntimeException`
while `firstOrCreateSuperAdminRole()`'s throws `ImmutableRoleException` — cosmetic inconsistency, not
correctness), F6 (`isSuperAdminRoleRow()` beside a private `isSuperAdminRole()` reads as a confusable
pair, acceptable per its docblock), F7 (`authorizeRoleAndStatusChange()`'s name undersells that it also
authorizes an email change), F8 (the seeder's new enum-value test is a drift-detector, not a proof —
correct per the story's own instruction to assert against the enum rather than a re-typed literal).

**P2 follow-up — not filed as a separate task by this story.** Closing `UserPolicy::delete()`'s
Super-Admin-target exclusion at the action level (mirroring N2's placement in `UpdateUser`) is out of
0008a's scope — the gap predates this story (0005/0008) and this story only changed *how the Administrator
tier's name resolves*, not the delete path's guard placement. Recorded here as a candidate for a future
task; `docs-keeper` should state the resulting asymmetry explicitly in
`docs/architecture/authorization.md` rather than leave it implicit.

**Status: Phase 5 passed (with the four corrections above applied in the same pass), ready for
`docs-keeper` / closure.**
