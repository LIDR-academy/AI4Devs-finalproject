# [0008a] Centralize Administrator-level role identification (follow-up to 0008 and story 0004's F2/F3)

## Description
Give the **Administrator** privilege tier the same single, config-driven identity resolution that story
[0008](done/0008-super-admin-role-invariants.md) gives the Super Admin role, and move the Administrator-level
authorization it guards out of the Livewire component and **into** `App\Actions\Users\CreateUser` /
`UpdateUser`, so the guard travels with the operation instead of with one caller. Today "is this role /
this user Administrator-level?" is a hardcoded `'Administrator'` string in four places, and the guard
built on it lives only inside `App\Livewire\Users\Index` — meaning a rename of the role silently disarms
every check, and any non-component caller of those two actions (a future API endpoint, an Artisan
command, a queued job) is completely ungated. This story also picks up the two Super Admin
`UserPolicy` call sites that 0008 deliberately deferred here, so all five literal-role-name checks in
that policy move in one pass.

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

  # --- Renaming / reconfiguring the Administrator role must not disarm the guard ---

  Scenario: The guard follows the reconfigured Administrator role
    Given a platform operator who has reconfigured the Administrator-level role name
      to "Something Else", and a user administrator without the administrator-management permission
    When that user administrator attempts to assign the "Something Else" role to a user
    Then the attempt is refused server-side and the user's role is unchanged

  Scenario: The role literally named "Administrator" becomes an ordinary role once reconfigured
    Given a platform operator who has reconfigured the Administrator-level role name
      to "Something Else", and a user administrator without the administrator-management permission
    When that user administrator assigns the now-ordinary role named "Administrator" to a user
    Then the role is assigned, because only the configured role carries the guard

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
    Given a platform operator who has configured the Super Admin role name and the
      Administrator-level role name to two different non-default values,
      and a user administrator holding every user-management permission
    When they attempt to edit a user holding the configured Super Admin role
    Then the attempt is refused server-side, because the Super Admin exclusion resolves
      through its own configured name and not through the Administrator one
```

## Files to create/modify

Everything below was verified against the working tree during this debate (`Read` + `grep`, not memory);
every line number cited is the **current** one and Phase 3 must re-check it before editing, since story
0008 lands first and will shift some of them.

**What already exists, and what 0008 brings.** `App\Models\Role`, `App\Enums\RoleName` and
`Role::superAdminName()` **do not exist in the working tree today** (`ls app/Models/` → `User.php` only;
`ls app/Enums/` → `UserStatus.php` only). They are all created by story 0008, which is why this story
cannot start Phase 3 before 0008 closes — see [Dependencies, risks and open
questions](#dependencies-risks-and-open-questions).

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
story consumes it and reinvents nothing) and three to the new `Role::administratorName()`.

### The mechanism — a verbatim mirror of 0008's, one tier down

- `app/Enums/RoleName.php` (**modify** — created by 0008) — add `case Administrator = 'Administrator';`
  alongside the existing `SuperAdmin` case. TitleCase key, lowercase-free backing value matching the
  seeded role name exactly, per project `CLAUDE.md` and
  [naming.md](../../docs/conventions/naming.md#classes). Exactly as with `SuperAdmin`, this case is the
  **one place the literal string is written** — it is *not* the identity check, and no guard, policy or
  query may compare a role row against it directly.

- `config/auth.php` (**modify**) — add an `administrator` block beside the existing `super_admin` one
  (currently lines 128–131, holding `'role' => 'Super Admin'` and `'email' => env('SUPER_ADMIN_EMAIL')`;
  0008 replaces that bare `'Super Admin'` literal with `RoleName::SuperAdmin->value`):

  ```php
  // config/auth.php — new block, mirroring 'super_admin' directly above it
  'administrator' => [
      'role' => App\Enums\RoleName::Administrator->value,
  ],
  ```

  No `email` key: unlike `super_admin`, there is no bootstrap-by-address flow for this tier.

- `app/Models/Role.php` (**modify** — created by 0008) — add a second `public static` resolver, a
  **verbatim structural mirror** of `superAdminName()`:

  ```php
  // app/Models/Role.php
  public static function administratorName(): string
  {
      return config('auth.administrator.role', RoleName::Administrator->value) ?? RoleName::Administrator->value;
  }
  ```

  Three properties of this signature are load-bearing and carry over from 0008 unchanged — do not
  "simplify" any of them:

  - **The `??` fallback is mandatory, not redundant.** `config($key, $default)` delegates to `Arr::get()`,
    whose existence check is `array_key_exists()`, so the default substitutes only for a **missing** key.
    A key that is *present but `null`* — `'role' => env('ADMINISTRATOR_ROLE')` with the env var unset, a
    `bootstrap/cache/config.php` built before the block existed, or a test doing
    `config(['auth.administrator.role' => null])` — returns `null`. This repo documents the rule with the
    sibling key as its worked example:
    [`docs/security/authorization-patterns.md`](../../docs/security/authorization-patterns.md#read-the-super-admin-role-name-with-a-literal-default),
    which states the correct form outright and says "Do not 'simplify' this to one of the two". Here the
    consequence of dropping it is sharper than for the Super Admin case: `hasRole(null, 'web')` on a
    target returns **false**, so every Administrator-level guard would silently stop firing and an
    unprivileged actor could promote, downgrade, suspend and delete Administrators at will. It fails
    **open**.
  - **`public`, not `private`.** `UserPolicy`, `App\Livewire\Users\Index`, `CreateUser` and `UpdateUser`
    are four separate classes and must call one implementation.
  - **The read happens inside the method body**, i.e. at call time — never in a constructor, a property
    initialiser, or anywhere that could run before config is loaded.

- `app/Policies/UserPolicy.php` (**modify**) — all **five** literal-role-name checks resolve through the
  centralized methods, and nothing else about the policy's logic changes:

  | Line | Method | Becomes |
  | --- | --- | --- |
  | 34 | `update()` | `$target->hasRole(Role::superAdminName(), 'web')` |
  | 60 | `updateSensitiveAttributes()` | `$target->hasRole(Role::administratorName(), 'web')` |
  | 93 | `downgrade()` | `$target->hasRole(Role::administratorName(), 'web')` |
  | 113 | `delete()` | `$target->hasRole(Role::superAdminName(), 'web')` |
  | 121 | `delete()` | `$target->hasRole(Role::administratorName(), 'web')` |

  The explicit `'web'` guard argument stays on every one of them, per
  [`docs/security/authorization-patterns.md`](../../docs/security/authorization-patterns.md#always-pass-the-guard-to-hasrole--hasanyrole).
  Import `App\Models\Role` (never `Spatie\Permission\Models\Role` — 0008 establishes that convention and
  enforces it with an `arch()` test scoped to `['App', 'Database\Seeders']`, which covers this file).

  Note this is a *policy-body* `hasRole()` against the **target**, which
  [`docs/architecture/authorization.md`](../../docs/architecture/authorization.md#userpolicy-abilities)
  explicitly carves out of the "gate on permissions, never role names" convention: it asks *does this
  target hold the role?*, not *may this actor do X?*. Centralizing the name does not change which side of
  that line the check sits on.

- `app/Livewire/Users/Index.php` (**modify**) — three distinct changes:

  1. **Identity.** `administratorRoleId()` (line 402) currently reads
     `->where('name', 'Administrator')` (line 405); swap the literal for `Role::administratorName()`. The
     file's `Role` import is currently `Spatie\Permission\Models\Role` (line 19) — story 0008 already
     swaps it to `App\Models\Role`, so by the time this story runs the import is correct; re-verify
     rather than assume.
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
  `Role::firstOrCreate(['name' => Role::administratorName(), 'guard_name' => 'web'])`, the same one-line
  change 0008 makes to line 49 (the Super Admin row) directly above it. Without this the seeder and the
  guards would diverge under an overridden `config('auth.administrator.role')`: the seeder keeps creating
  a row named `'Administrator'` that no guard treats as Administrator-level, while the role the config
  actually names is never seeded and never receives the 37 permissions `syncPermissions()` grants it.

Confirmed **not** needed, recorded so reviewers don't re-open them: no migration and no new column
(decision 1 rejects the flag-column option); no change to `app/Concerns/UserValidationRules.php` (it
carries no `'Administrator'` literal, and its `'Super Admin'` one belongs to 0008); no new
`Gate::policy()` registration (`App\Policies\UserPolicy` is already auto-discovered — 0008 documents why
at length and the same reasoning applies unchanged); no change to `bootstrap/app.php` or
`config/permission.php`.

## Tests to perform
- [ ] **Happy path / regression, via the dashboard:** an actor holding `roles.manage-administrators` can still (a) create a user with the Administrator role, (b) promote an ordinary user to Administrator, (c) downgrade an Administrator to an ordinary role, (d) change an Administrator's status, (e) change an Administrator's email, and (f) delete an Administrator. Proves the relocation did not turn the guard into a blanket refusal.
- [ ] **The headline test — direct action calls are independently refused.** With an actor holding `users.create` / `users.edit` but **not** `roles.manage-administrators`, call `App\Actions\Users\CreateUser` and `App\Actions\Users\UpdateUser` **directly** (resolved from the container under `actingAs()`, never through `Livewire::test()`), and assert each throws `AuthorizationException` and writes nothing: (a) `CreateUser` with the Administrator role id; (b) `UpdateUser` promoting an ordinary user to Administrator; (c) `UpdateUser` downgrading an Administrator; (d) `UpdateUser` changing an Administrator's status; (e) `UpdateUser` changing an Administrator's email. **This is the actual proof the gap is closed** — every one of these passes today's `Index`-mediated tests and fails in reality, because nothing in the actions checks anything. Assert on the database row afterwards, not only on the exception.
- [ ] **Refusal happens before any write.** In the `UpdateUser` cases above, submit a **changed name** alongside the refused role/status change and assert the name is *also* unchanged afterwards. Without this, a check placed below `$user->save()` (line 47 today) passes every other bullet while still persisting half the edit.
- [ ] **Self-lockout cannot be re-enabled by a caller (decision 3):** call `UpdateUser` directly against the acting user's own account with a different role id and a different status, and assert the caller's own role and status are unchanged. Confirm by signature inspection that `$applyRoleAndStatus` is no longer a parameter — a test that merely passes `false` proves nothing once the parameter is gone.
- [ ] **Existing dashboard coverage still holds:** the `Livewire::test()`-driven refusals already in `tests/Feature/Users/IndexTest.php` and `tests/Feature/Users/CreateUserTest.php` must keep passing unchanged. Any diff to their assertions is a UX regression to justify, not a test to update — Livewire does not distinguish an exception thrown in the component from one bubbling up one call deeper in the same synchronous `save()`.
- [ ] **Config override — the guard follows the configured role.** With `config(['auth.administrator.role' => 'Something Else'])` and a role of that name present, an actor lacking `roles.manage-administrators` is **refused** when assigning "Something Else", and **permitted** when assigning the now-ordinary role literally named "Administrator". Both directions, driven through both the component and a direct action call. This is the test that fails if any site compares against `App\Enums\RoleName::Administrator` directly instead of resolving the config.
- [ ] **Config present-but-`null` — the test that proves the `??` is actually there.** With `config(['auth.administrator.role' => null])`, `App\Models\Role::administratorName()` returns `RoleName::Administrator->value` and every guard still fires normally against the `'Administrator'` role. Note why no other bullet covers this: `config([… => 'Something Else'])` sets a **present, non-null** key, which the two-argument `config($key, $default)` form resolves perfectly well — a present-but-`null` key is the only input that distinguishes the two forms. Without the `??`, `administratorName()` returns `null`, `hasRole(null, 'web')` is false, and the entire Administrator guard surface silently fails **open**.
- [ ] **Seeder follows the configured name (Q1).** Running `RolePermissionSeeder` under `config(['auth.administrator.role' => 'Something Else'])` creates a role named "Something Else", not "Administrator", and that role receives the same 37-permission grant `syncPermissions()` gives the Administrator role today — mirroring the equivalent 0008 test for the Super Admin row.
- [ ] **All five `UserPolicy` call sites resolve through the centralized methods, under overridden config.** With *both* `auth.super_admin.role` and `auth.administrator.role` overridden to distinct non-default values, exercise each of `update()`, `updateSensitiveAttributes()`, `downgrade()` and `delete()` (both of its branches) and assert each denies for a target holding the *configured* role and permits for a target holding the *literal* default-named role.
- [ ] **The two tiers are not aliased (`backend-qa`'s combined test).** In the same dual-override setup, assert the Super Admin exclusion still resolves through `Role::superAdminName()` **independently**: a target holding the configured Super Admin role is uneditable and undeletable even by an actor holding every permission, while a target holding the configured Administrator role is editable by an actor holding `roles.manage-administrators`. This is what fails if Phase 3 collapses both resolvers onto one shared literal or one shared config key by accident.
- [ ] **Narrowness / must-not-over-block:** an actor with `users.edit` but not `roles.manage-administrators` can still assign an ordinary custom role, change an ordinary user's status and email, and delete an ordinary user; an actor with `users.create` alone can still create an ordinary user. Mirrors 0008's "guard stays narrow" section.
- [ ] **Edge — the Administrator role row is absent** (fresh database, before `RolePermissionSeeder` has run): creating and editing users with ordinary roles completes without error and nothing is wrongly blocked. Note the current fail-open shape this pins down: `Index::createNewUser()` compares `(int) $validated['roleId'] === $this->administratorRoleId()`, and `administratorRoleId()` returns `null` when no such role exists, so the comparison is false and no gate fires. That is correct behaviour (no Administrator role means nothing can be promoted to it), but it is behaviour worth a test rather than an accident.
- [ ] **Content-scan test — no `'Administrator'` literal survives in the guard path.** Assert that `app/Policies/UserPolicy.php`, `app/Livewire/Users/Index.php`, `app/Actions/Users/CreateUser.php` and `app/Actions/Users/UpdateUser.php` contain no `'Administrator'` / `'Super Admin'` string literal. **This is a plain Pest test that reads the files, *not* a real `arch()` expectation** — `backend-qa` proposed it as `arch()` and flagged the caveat themselves: Pest's `arch()` API reasons about namespaces, imports, inheritance and class shape, not about string literals passed as method arguments, so there is no `arch()` expectation that can express "this file contains no such literal". Write it as an ordinary test over `file_get_contents()` (or a small `str_contains` dataset across the four paths) and say so in a comment, so a later reader does not try to "convert it back" to `arch()`.
- [ ] **Placement:** all of the above touch `users`, `roles` and `model_has_roles` rows, so they belong in `tests/Feature/` with `RefreshDatabase`, not `tests/Unit/` — same reasoning as story 0008's placement bullet. The direct-action-call tests go in `tests/Feature/Users/` alongside the existing `CreateUserTest.php` / `IndexTest.php`.

## Expected outcome
Once implemented, "which role is the Administrator tier?" has exactly one answer in the codebase —
`App\Models\Role::administratorName()`, reading `config('auth.administrator.role')` with
`App\Enums\RoleName::Administrator->value` as its only compiled-in literal — and it is called by the
policy, by the Livewire component and by both user actions alike. Renaming or reconfiguring that role
moves every guard with it in one step instead of silently disarming them. More importantly, the
Administrator-level guard is no longer a property of *one caller*: `App\Actions\Users\CreateUser` and
`App\Actions\Users\UpdateUser` refuse an unprivileged actor on their own, so a future API endpoint,
Artisan command or queued job inherits the protection instead of having to remember it — and
`UpdateUser` can no longer be told to skip the self-lockout guard by a caller passing the wrong flag.
The dashboard behaves exactly as it does today: the same refusals, at the same point in the same
request, with the same `AuthorizationException`. The two Super Admin `UserPolicy` checks deferred by
story 0008 are closed in the same pass, and the two privilege tiers provably resolve through separate
configuration.

## Acceptance criteria
- [ ] `App\Models\Role::administratorName(): string` exists as a **single `public static`** implementation reading `config('auth.administrator.role', RoleName::Administrator->value) ?? RoleName::Administrator->value`, with **both** fallbacks present (`config()`'s default for a missing key, `??` for a key present but `null`), per [`docs/security/authorization-patterns.md`](../../docs/security/authorization-patterns.md#read-the-super-admin-role-name-with-a-literal-default). No call site re-derives the `config()` read inline, and none compares a role against `App\Enums\RoleName::Administrator` directly.
- [ ] `App\Enums\RoleName` carries an `Administrator` case, and `config/auth.php` carries an `administrator.role` key defaulting to `RoleName::Administrator->value` — the literal string `'Administrator'` is written in exactly one place in the guard path.
- [ ] **All five `App\Policies\UserPolicy` literal-role-name call sites resolve through the two centralized methods** — the two Super Admin checks (currently lines 34 and 113) via `Role::superAdminName()`, the three Administrator checks (currently lines 60, 93 and 121) via `Role::administratorName()` — each retaining its explicit `'web'` guard argument, and none of the policy's actual authorization logic otherwise changed.
- [ ] `App\Livewire\Users\Index::administratorRoleId()` resolves the role name via `Role::administratorName()` rather than the literal at line 405.
- [ ] `database/seeders/RolePermissionSeeder.php` creates the Administrator role via `Role::administratorName()` (line 53) rather than the literal, mirroring the Super Admin row four lines above it — under a reconfigured `auth.administrator.role`, seeding creates the configured role and grants it the same 37 permissions.
- [ ] **`App\Actions\Users\CreateUser` and `App\Actions\Users\UpdateUser` each refuse an unprivileged direct caller on their own**, throwing `AuthorizationException` with no database write, proven by tests that call them directly rather than through `App\Livewire\Users\Index`.
- [ ] **`App\Livewire\Users\Index` no longer contains the promotion, downgrade or sensitive-attribute authorization logic itself** — it computes what it needs and delegates. There is one implementation of each rule in the codebase, not a component copy and an action copy.
- [ ] **`UpdateUser`'s `$applyRoleAndStatus` is no longer a parameter**; the action derives the self-edit guard internally from the authenticated user, and `Index`'s call site is updated for the new signature.
- [ ] Refusal happens **before any write**: a refused update leaves the target's name, role, status and email all unchanged.
- [ ] Reconfiguring the Administrator role name via `config('auth.administrator.role')` moves every guard to the newly-configured role and leaves the role literally named `'Administrator'` fully ordinary — verified in both directions.
- [ ] The two tiers resolve independently: with both config keys overridden to distinct values, the Super Admin exclusions and the Administrator guards each follow their own key, and neither is aliased onto the other's literal.
- [ ] Ordinary (non-Administrator, non-Super-Admin) role and user management is completely unaffected — assigning a custom role, editing an ordinary user's status/email, and deleting an ordinary user all still work with `users.edit`/`users.delete` alone.
- [ ] With no Administrator role row present, nothing crashes and nothing is wrongly blocked or wrongly permitted.
- [ ] The dashboard's observable behaviour is unchanged: the existing `Livewire::test()`-driven refusal tests pass without amendment.

## Definition of Done
- [ ] Tests written and green
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper) — primary target
      [`docs/architecture/authorization.md`](../../docs/architecture/authorization.md), which must record
      (a) that `config('auth.administrator.role')` is now the single source of truth for the
      Administrator tier, mirroring what story 0008 records for `auth.super_admin.role`, and (b) that the
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

**Hard sequencing dependency — 0008 must close first.** This story consumes three artefacts that story
[0008](done/0008-super-admin-role-invariants.md) creates and that **do not exist in the working tree today**
(verified: `ls app/Models/` returns `User.php` only, `ls app/Enums/` returns `UserStatus.php` only, and
`git status` shows no pending creation of either):

- `App\Models\Role` — this story adds a method to it;
- `App\Enums\RoleName` — this story adds a case to it;
- `App\Models\Role::superAdminName()` — this story *calls* it for the two deferred `UserPolicy` lines,
  and structurally mirrors it for `administratorName()`.

**Phase 3 cannot begin until story 0008 has actually reached Phase 7 closure.** Starting earlier means
either building against classes that don't exist or creating a second, conflicting `App\Models\Role` —
and 0008 additionally swaps `app/Livewire/Users/Index.php`'s `Role` import from
`Spatie\Permission\Models\Role` to `App\Models\Role`, a line this story also touches. Per
[`docs/workflow.md`](../../docs/workflow.md#task-ordering-rule)'s task-ordering rule, a dependency's
number must sort below its dependents': `0008` sorts before `0008a`, so the filename ordering is
already correct and no renumbering is needed. Also note every line number cited in this file was read
from the **pre-0008** tree; 0008 edits `Index.php`, `UserValidationRules.php`, `AppServiceProvider.php`
and the seeder, so Phase 3 must re-locate each site rather than trusting the numbers.

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
(`Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web'])`), exactly paralleling line 49's
Super Admin creation — which story **0008 does** convert to `Role::superAdminName()`. Leaving the seeder
out would break that symmetry: under an overridden `config('auth.administrator.role')` the seeder would
keep creating a role named `'Administrator'` that no guard treats as Administrator-level, while the
configured role is never seeded at all. **Decision: include it.** `database/seeders/RolePermissionSeeder.php`
is added to "Files to create/modify" — the same one-line change 0008 makes to the line four above it:
`['name' => Role::administratorName(), 'guard_name' => 'web']`. A new test bullet is added below: seeding
under an overridden `config('auth.administrator.role')` creates the configured role and grants it the 37
permissions, mirroring the equivalent 0008 seeder test for Super Admin.

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

- **D1 — Mechanism: config-driven, mirroring story 0008's exact pattern. Approved.** A new
  `App\Models\Role::administratorName()` reading a new `config('auth.administrator.role')` key, with a new
  `App\Enums\RoleName::Administrator` case supplying its only compiled-in literal. Two alternatives were
  considered and **rejected**:
  - *A permission-based check* (ask what the target *holds* rather than which role it *is*). Rejected
    because the question these five call sites ask is a target-side **identity** question, not an actor-side
    capability question. [`docs/architecture/authorization.md`](../../docs/architecture/authorization.md#userpolicy-abilities)
    already carves this out explicitly: the "gate on permissions, never role names" convention "governs the
    **call sites**", while "inside a policy body … `hasRole()` [is appropriate] for asking a literal
    question about the *target*, which is exactly what the Super Admin and Administrator exclusions do."
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
