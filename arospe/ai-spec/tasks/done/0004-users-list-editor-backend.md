# [0004] Users list + create/edit modal — backend (component logic, validation, persistence)

## Description
Build the Livewire component class, policy, validation, actions, and persistence behind the
**Users** screen of PRD Epic 1 — the list query, the "X usuarios · Y activos" summary, and the
create/edit flow for a user's name, unique email, exactly one role, and a status. This component is
the **single call site** for the Users screen: it also wires the delete and role-change actions.
Access is gated on `users.view` with per-action checks for `users.create` / `users.edit`. The
account-state layer it builds on — the `users.status` column, the `UserStatus` enum, and the
pending-email mechanism — is sibling story **0003**; the Blade view is sibling story **0006**.

## Type
backend (related_task_id: **0006** — frontend/view sibling) | includes database-expert: **no**

> **No migration in this story.** The original story 0003 carried the `users.status` migration; it
> now lives in story **0003** together with `users.pending_email`. This story adds no column, so
> `database-expert` is not a participant.

## Gherkin
```gherkin
Feature: Backoffice user administration

  # --- Listing, counts, ordering ---

  Scenario: Listing users with their role and status
    Given a user administrator, with several existing users
    When they open the Users screen
    Then each user is listed with their assigned role and their status

  Scenario: A user who holds no role is still listed
    Given a user administrator, with a registered user who has never been assigned a role
    When they open the Users screen
    Then that user is listed with no role shown

  Scenario: The signed-in administrator's own row is listed
    Given a user administrator, with no other users in the system
    When they open the Users screen
    Then their own row is among the listed users

  Scenario: Users are listed alphabetically by name
    Given a user administrator, with users "Zoe Marin", "Ana Gil" and "Diego Ferrer"
    When they open the Users screen
    Then the users are listed in the order "Ana Gil", "Diego Ferrer", "Zoe Marin"

  Scenario: The header reports the total and active user counts
    Given a user administrator, with six users of whom four are Active
    When they open the Users screen
    Then the header reports six users in total and four active

  Scenario: A user holding the Super Admin role is included in the reported counts
    Given a user administrator, with a user holding the Super Admin role
    When they open the Users screen
    Then that user is included in the total user count

  Scenario: The Super Admin role is never offered when assigning a role
    Given a user administrator, with the Super Admin role existing in the system
    When they open the Users screen
    Then the Super Admin role is not among the assignable roles

  # --- Creating a user ---

  Scenario: Creating a user provisions the account and invites them to set a password
    Given a user administrator, with at least one role available
    When they create a user with a name, a unique email, a role, and a status
    Then the new user is stored with that role and that status
    And that user is sent a message inviting them to set their own password
    And that user's email is recorded as not yet verified

  Scenario: Creating a user with a duplicate email is rejected
    Given a user administrator, with an existing user whose email is "marta.ruiz@arospe.es"
    When they try to create another user with the email "marta.ruiz@arospe.es"
    Then creation is rejected with a validation message, and no second user is created

  Scenario: Creating a user with the same email in different letter case is rejected
    Given a user administrator, with an existing user whose email is "marta.ruiz@arospe.es"
    When they try to create another user with the email "MARTA.RUIZ@AROSPE.ES"
    Then creation is rejected with a validation message, and no second user is created

  Scenario: Creating a user with an email another account is waiting to verify is rejected
    Given a user administrator, with another user holding "marta.ruiz@arospe.es" as a pending address
    When they try to create a user with the email "marta.ruiz@arospe.es"
    Then creation is rejected with a validation message, and no user is created

  Scenario Outline: Creating a user with invalid details is rejected
    Given a user administrator, with at least one role available
    When they try to create a user with <invalid_detail>
    Then creation is rejected with a validation message, and no user is created

    Examples:
      | invalid_detail                   |
      | a blank name                     |
      | a malformed email address        |
      | no role chosen                   |
      | a role that does not exist       |
      | the Super Admin role             |
      | a status outside the allowed set |

  Scenario: A failed creation sends no invitation
    Given a user administrator, with an existing user whose email is "marta.ruiz@arospe.es"
    When they try to create another user with the email "marta.ruiz@arospe.es"
    Then no invitation message is sent to anyone

  # --- Editing a user ---

  Scenario: Changing a user's role replaces the previous one
    Given a user administrator, with a user "Diego Ferrer" holding the role "Editor"
    When they change that user's role to "Blog Editor"
    Then the user holds exactly that one role, the previous role no longer being attached

  Scenario: A user administrator changes another user's status
    Given a user administrator, with another user whose status is "Active"
    When they change that other user's status to "Suspended"
    Then that user's status is updated

  Scenario: Saving a user with their own unchanged email is allowed
    Given a user administrator editing another user
    When they save that user without changing the email
    Then the update succeeds, the uniqueness check ignoring the record being edited

  Scenario: Reusing another user's email is rejected on edit
    Given a user administrator, with two existing users
    When they try to change one user's email to the other user's email
    Then the update is rejected with a validation message

  Scenario: Assigning a role that no longer exists is rejected
    Given a user administrator whose open editor references a role deleted meanwhile
    When they save that user
    Then the update is rejected with a validation message, and the user's role is left unchanged

  # --- Changing an email address is never applied immediately ---

  Scenario: Changing another user's email holds the new address as pending
    Given a user administrator editing another user whose email is verified
    When they change that other user's email to a new address
    Then that user's stored email address and verification date are unchanged,
      the new address being held as pending

  Scenario: Changing another user's email sends the verification link to the new address
    Given a user administrator editing another user whose email is verified
    When they change that other user's email to a new address
    Then a verification message is sent to that new address, not to the administrator

  Scenario: Changing another user's email leaves their status untouched
    Given a user administrator editing another user whose status is "Active"
    When they change that other user's email to a new address
    Then that user's status remains "Active"

  Scenario: Changing a user's name and email at once applies the name immediately
    Given a user administrator editing another user
    When they save that user with both a new name and a new email address
    Then that user's name is updated straight away, the email address staying pending

  # --- Self-edit guard (prevents self-lockout) ---

  Scenario: A user administrator can edit their own name
    Given a user administrator editing their own row
    When they save a new name for themselves
    Then their name is updated

  Scenario: A user administrator changing their own email holds it as pending
    Given a user administrator editing their own row
    When they save a new email address for themselves
    Then their stored email address is unchanged, the new address being held as pending

  Scenario: A user administrator cannot change their own role
    Given a user administrator editing their own row
    When they submit a different role for themselves
    Then their role is left unchanged, no error being raised

  Scenario: A user administrator cannot change their own status
    Given a user administrator editing their own row
    When they submit a different status for themselves
    Then their status is left unchanged, no error being raised

  # --- Authorization ---

  Scenario: A visitor cannot reach the Users screen
    Given a visitor who is not signed in
    When they navigate to the Users screen
    Then they are sent to the sign-in page

  Scenario: Reaching the Users screen without permission is denied
    Given a blog editor whose role does not grant the permission to view users
    When they navigate directly to the Users screen
    Then access is denied server-side, not merely hidden in the UI

  Scenario: Saving without permission is denied even after the page has loaded
    Given a signed-in user whose permission to edit users was revoked after they opened the screen
    When they save a change to a user
    Then the action is denied server-side, and nothing is persisted

  Scenario: Submitting the Super Admin role is refused server-side
    Given a user administrator, with the Super Admin role existing in the system
    When they submit the Super Admin role as another user's role
    Then the assignment is refused, and that user's role is left unchanged

  Scenario: Editing a user who holds the Super Admin role is refused
    Given a user administrator, with a user holding the Super Admin role
    When they try to save a change to that user
    Then the action is denied server-side, and that user is unchanged

  # --- Administrator-level guards ---

  Scenario: Creating a user as an Administrator without the stricter permission is denied
    Given a user administrator without the permission to manage administrator-level roles and users
    When they try to create a user holding the seeded "Administrator" role
    Then the action is denied server-side, and no user is created

  Scenario: Promoting a user to Administrator without the stricter permission is denied
    Given a user administrator without the permission to manage administrator-level roles and users
    When they try to assign the seeded "Administrator" role to another user
    Then the action is denied server-side, and that user's role is left unchanged

  Scenario: Promoting a user to Administrator with the stricter permission succeeds
    Given a user administrator holding the permission to manage administrator-level roles and users
    When they assign the seeded "Administrator" role to another user
    Then that user holds the "Administrator" role

  Scenario: Downgrading an Administrator without the stricter permission is denied
    Given a user administrator without the permission to manage administrator-level roles and users,
      with another user who holds the seeded "Administrator" role
    When they try to change that user's role to "Editor"
    Then the action is denied server-side, and that user's role is left unchanged

  Scenario: Downgrading an Administrator with the stricter permission succeeds
    Given a user administrator holding the permission to manage administrator-level roles and users,
      with another user who holds the seeded "Administrator" role
    When they change that user's role to "Editor"
    Then that user holds the "Editor" role

  Scenario: Deleting a user holding the Administrator role without the stricter permission is denied
    Given a user administrator without the permission to manage administrator-level roles and users,
      with another user who holds the seeded "Administrator" role
    When they try to delete that user
    Then the action is denied server-side, and that user still exists

  Scenario: Deleting an ordinary user is not blocked by the administrator-level guard
    Given a user administrator without the permission to manage administrator-level roles and users,
      with another user who holds no role at all
    When they delete that user
    Then the deletion is allowed

  Scenario: Saving an existing Administrator without changing their role is not a role change
    Given a user administrator without the permission to manage administrator-level roles and users,
      with a user who already holds the seeded "Administrator" role
    When they save that user's name without altering their role
    Then the update succeeds, because no role change was attempted

  Scenario: An unrelated role change is unaffected by the stricter permission
    Given a user administrator without the permission to manage administrator-level roles and users
    When they change another user's role from "Editor" to "Blog Editor"
    Then the user's role is updated
```

## Files to create/modify

> **Authorization mechanism — read this first.** Livewire 4 does **not** re-run route middleware
> on component action calls: `PersistentMiddleware::$persistentMiddleware` is a hardcoded
> allowlist that contains Laravel's `Illuminate\Auth\Middleware\Authorize` (`can:`) but **not**
> Spatie's `PermissionMiddleware` (`permission:`). Gating the route with `permission:` would
> protect only the initial `GET /users`; every `save()` round-trip goes to `/livewire/update`
> and would run **unauthorized**. This story therefore uses **`can:`** middleware (Spatie
> registers permissions as Gate abilities, so it works with no extra setup) **plus** explicit
> per-method authorization. Confirmed independently by `backend-expert` here and by story
> **0010**'s debate.

> **This story defines the user-side policy it calls.** It creates `App\Policies\UserPolicy` with
> `viewAny`, `create`, `update`, `promoteToAdministrator`, **`downgrade` and `delete`** — the last
> two at their **minimal** shape (keyed on `roles.manage-administrators`, identical in form to
> `promoteToAdministrator`). Story **0005** later *extends* the same file's `delete()` with
> soft-delete-and-obfuscation semantics and hardens `downgrade()`; it does not create them.
> This closes the inverted dependency `code-reviewer` flagged in Phase 2: every gate this story's
> tests exercise is defined by this story, so its TDD cycle can go green on its own.
>
> Story **0009** owns the *role-level* administrator rule (who may edit or delete the
> `Administrator` **role** itself, and the Super-Admin-only grant meta-rule) in `RolePolicy` —
> a different policy on a different model. The *user*-side promotion/downgrade/delete rules below
> are this story's, and no other story defines them.

**Policy:**

- `app/Policies/UserPolicy.php` — **new**, scaffolded with
  `php artisan make:policy UserPolicy --model=User --no-interaction`. Laravel 13 auto-discovers
  `App\Policies\UserPolicy` for `App\Models\User`; no provider registration, and this repo has no
  `AuthServiceProvider` (none should be added). `app/Policies/` does not exist yet — it is a stock
  Laravel location inside the existing `app/` tree, but `docs/conventions/base-standards.md`'s
  directory listing needs a line in Phase 6.

  ```php
  // shape, not final code
  public function viewAny(User $actor): bool
  {
      return $actor->hasPermissionTo('users.view');
  }

  public function create(User $actor): bool
  {
      return $actor->hasPermissionTo('users.create');
  }

  public function update(User $actor, User $target): bool
  {
      if ($target->hasRole('Super Admin', 'web')) {
          return false;   // the Super Admin exclusion lives here, so 0005's delete path inherits it
      }

      return $actor->hasPermissionTo('users.edit');
  }

  /**
   * $target is null on the create path, where no user exists to target yet.
   */
  public function promoteToAdministrator(User $actor, ?User $target = null): bool
  {
      return $actor->hasPermissionTo('roles.manage-administrators');
  }

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

  - **`promoteToAdministrator()`'s `$target` is nullable, and that is load-bearing.** The component
    calls it two ways: `Gate::authorize('promoteToAdministrator', $target)` on the edit path, and
    `Gate::authorize('promoteToAdministrator', User::class)` on the create path, where no target
    exists yet. `Gate::callPolicyMethod()` **drops the first argument when it is a class-string**, so
    the class-level call reaches the method with `$actor` alone — a non-optional
    `User $target` parameter would throw `ArgumentCountError` at runtime rather than denying or
    allowing anything. Declaring `?User $target = null` is what makes both call sites invocable.
  - The method body **ignores `$target` entirely** — the rule is purely "does the actor hold
    `roles.manage-administrators`", identical on both paths, so the null case needs no branch. The
    parameter is kept in the signature for symmetry with `downgrade`/`delete` and because Laravel
    passes it on the edit path. If a future story ever adds target-dependent logic here, it must
    handle `$target === null` explicitly as the create case rather than dereferencing it.
  - **Always pass the guard to `hasRole()`** (`'web'`) per
    [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md) —
    an unguarded call resolves against the default guard, which is not guaranteed to be the one the
    role was seeded under.
  - **No self-targeting exception** on `downgrade`/`delete`: the same rule applies when `$actor` and
    `$target` are the same user. (Self-*lockout* is prevented separately, in the component's
    self-edit guard, which never applies a role or status change to the acting user's own row.)
  - Permission names are 0002's real catalog strings — `users.view`, `users.create`, `users.edit`,
    `users.delete`, `roles.manage-administrators`. An unseeded name throws `PermissionDoesNotExist`
    at runtime (`docs/conventions/naming.md`), so these are correctness, not style.
  - The Super Admin actor passes all of the above without holding any permission row, via 0002's
    `Gate::before` bypass — **do not** add a Super Admin branch here.

**Validation** — flat, single-concern traits composed at the consumer, matching `CreateNewUser`'s
`use PasswordValidationRules, ProfileValidationRules;` precedent. There is **no nested-trait `use`**
anywhere in `app/Concerns/`, and nesting would break Larastan 7:

- `app/Concerns/UserValidationRules.php` — **new**, containing **only** `roleRules()` and `statusRules()`.
  - `roleRules()`: `['required', Rule::exists('roles', 'id')->where('guard_name', 'web')->whereNot('name', 'Super Admin')]` — the Super Admin exclusion is **server-side in the rule**, not merely omitted from the dropdown.
  - `statusRules()`: `['required', Rule::enum(UserStatus::class)]`.
  - The consumer spreads both: `[...$this->profileRules($this->editingUserId), 'roleId' => $this->roleRules(), 'status' => $this->statusRules()]`.
- `app/Concerns/ProfileValidationRules.php` — **no change needed here**; story 0003 already widened
  `emailRules(?string $userId)` to reject an address held as another user's `pending_email`, and its
  `?string` signature is already UUID-correct. This story reuses it verbatim.
- Type asymmetry for 0006: `users.id` is a UUID string but `roles.id` is a bigint — hence `$roleId`, cast on the way in.

**Factory:**

- `database/factories/UserFactory.php` — **modify**, adding a `role(string|Role $role)` state, since
  every test in 0004 / 0005 / 0007 needs a roled user. The `status` default and the `inactive()` /
  `suspended()` / `pendingEmail()` states are **0003's**, already in place by the time this story
  starts.

**Actions:**

- `app/Actions/Users/CreateUser.php` — **new**, invokable.
  - Normalises the submitted email to lowercase (`Str::lower($email)`) as **defence in depth**. The
    normalisation that actually prevents a case-different duplicate slipping past the uniqueness
    rule happens **in the component, before `validate()`** — see the component section. MySQL's
    `utf8mb4_0900_ai_ci` already treats `MARTA@…`/`marta@…` as the same row at the unique index, but
    the sqlite test connection does not, so normalising in both places keeps behaviour identical
    across environments and makes it testable.
  - `User::forceCreate([...])` with a **literal whitelist** (`name`, `email`, `password`, `status`, `email_verified_at`), never a spread of validated input. **This is mandatory, not stylistic:** `Model::preventSilentlyDiscardingAttributes()` is not enabled anywhere in `app/Providers/`, so `User::create([... 'status' => …])` would **silently drop** `status` (it is deliberately not in `#[Fillable]`) and fall back to the column default `inactive` — invisible on the happy path, surfacing only when an admin creates an `active`/`suspended` user and it silently downgrades.
  - Password: `Hash::make(Str::password(32))`, never returned, logged, or flashed.
  - Wrap `forceCreate` + `syncRoles` in `DB::transaction()`, and send the invitation **after commit** (`DB::afterCommit()`), so a `syncRoles` failure doesn't leave an email already sent against a rolled-back user.
  - Catch `QueryException` SQLSTATE `23000` around the insert and rethrow as a `ValidationException` on `email`, so a concurrent double-submit is a field error rather than a 500.
  - **Invitation:** `Password::broker()->createToken($user)` + `$user->notify(new UserInvitation($token))` — **not** `Password::sendResetLink()`. `sendResetLink()` bundles the framework's `ResetPassword` notification, whose wording cannot be changed without also re-wording genuine resets (`toMailUsing()` is global), and it is subject to the 60-second `passwords.users.throttle`, which would silently no-op a rapid second create.
  - **A newly created user's address goes straight into `users.email`, unverified** — it is the
    account's initial address, not a *change*, so 0003's pending-email mechanism does not apply. The
    invitation link is what proves the mailbox, and completing it verifies the address and activates
    the account through 0003's `ResetUserPassword` hook.
- `app/Notifications/UserInvitation.php` — **new**, `ShouldQueue`, links to the existing `password.reset` route with the minted token.
- `app/Actions/Users/UpdateUser.php` — **new**, invokable. Normalises the submitted email to lowercase, same as `CreateUser`. Then:
  - `fill()` **name only**, then `$user->status = $status;` (property assignment preserves the enum cast), then `save()`. Role and status are applied **only** when the target is not the acting user.
  - **The email never goes through `fill()`/`save()` here.** When the normalised submitted address
    differs from `$user->getRawOriginal('email')` lowercased, the action delegates to **0003's**
    `App\Actions\Users\RequestEmailChange`, which parks it in `pending_email` and mails the link to
    the new address. `users.email`, `email_verified_at` and `status` are left exactly as they were.
    This replaces the earlier "reset `email_verified_at` and force `Inactive`" rule — human
    decision — and applies identically whether the target is another user or the acting user's own
    row, so there is **one** email-change mechanism in the app, not two.
  - When the submitted address is unchanged (case-insensitively), no pending value is written and no
    notification is sent.

**Livewire component & route:**

- `app/Livewire/Users/Index.php` — **new**. Class-based, `#[Title('Users')]`. Its public surface is **exactly** story 0006's locked interface contract:
  - `public array $users` — rows `[{id, name, email, pendingEmail, role, status}]`. **No pagination and no paginator**: the prototype has no pager, no PRD acceptance criterion asks for one, and 0006's contract is locked on the array shape. (`pendingEmail` is the one addition to that contract this rewrite introduces, so the view can show a mid-flight address change; 0006 is updated to match.)
  - `#[Locked] public ?string $editingUserId` and `#[Locked] public ?string $deletingUserId` — **`#[Locked]` is mandatory**, not a nicety: without it a client can swap the target between opening a modal and acting on it, so the identity authorized is not the identity written. `Security.php` sets the precedent with `#[Locked] public ?int $deletingPasskeyId`.
  - `public bool $showModal`, `public string $name`, `public string $email`, `public ?string $roleId`, `public ?UserStatus $status`, `public bool $showDeleteModal`, `public string $deletingUserName`.
  - `#[Computed] usersSummary(): array` → `['total' => int, 'active' => int]`, as **one** query (`selectRaw('count(*) total, count(case when status = ? then 1 end) active')`), never `User::all()->filter()`.
  - `#[Computed] roleOptions(): array` — excludes Super Admin.
  - The list query eager-loads `roles` (`->with('roles')`) and orders `name ASC, id ASC`. **The `id` tiebreaker is required** for a deterministic order when names collide; UUIDv7 is time-ordered, so it is a meaningful creation-order tiebreaker rather than an arbitrary one. **The acting administrator's own row is included** — it is not filtered out (this answers story 0006's open question; the self-edit guard exists precisely because that row is editable).
  - `openCreateModal()`, `openEditModal(string $userId)`, `save()`, `closeModal()`, `confirmDelete(string $userId)`, `deleteUser()`, `closeDeleteModal()`.
  - **`save()` normalises the email before validating** — human decision, and the fix for the
    contradiction `code-reviewer` flagged: `$this->email = Str::lower($this->email);` is the **first**
    statement after the authorization check and **before** `$this->validate(...)`, on both the create
    and the edit path. Normalising inside the actions alone runs *after* validation, so the
    uniqueness rule would see `MARTA@X.COM` while the row persisted is `marta@x.com` — on sqlite
    those are different values and a case-different duplicate slips through. The actions keep their
    own normalisation as defence in depth, and `App\Models\User`'s read-only `email` accessor
    (story 0003) is a third, independent layer that normalises on read.
  - `Gate::authorize('viewAny', User::class)` in `mount()`; `Gate::authorize('create'|'update', …)` as the **first statement** of every mutating method.
  - **`save()` role-change gating** — compare the submitted role against a fresh read (`$target->roles()->value('roles.id')`, a query, not the cached relation), and only when they differ:
    - Administrator is being **added** to a user who does not hold it → `Gate::authorize('promoteToAdministrator', $target)`.
    - Administrator is being **removed** from an existing holder → `Gate::authorize('downgrade', $target)`.
    - Neither side is Administrator → no extra gate; an unrelated role change must stay unaffected.

    On the **create** path the same rule applies to the role being assigned to the new user, via
    `Gate::authorize('promoteToAdministrator', User::class)` (class-level, no target yet). This is
    why the policy method's `$target` is declared `?User $target = null` — see the policy section
    above; the class-string form calls it with `$actor` only.
  - **`deleteUser()`** — `Gate::authorize('delete', $user)`, then `$user->delete()`. This story's
    `delete()` is the minimal permission rule; the **semantics** of what `$user->delete()` does
    (soft delete plus email obfuscation) are **0005's**, and this story adds none of its own. Until
    0005 lands, `$user->delete()` is a hard delete — that is the correct, honest intermediate state
    and its tests assert only the authorization decision, not the persistence shape.
  - `openEditModal()` / `confirmDelete()` must guard a malformed or unknown id themselves — these are Livewire method calls, not route-model binding, so `HasUuids::resolveRouteBindingQuery()`'s `Str::isUuid()` short-circuit does not apply.
  - `unset($this->users, $this->usersSummary)` at the end of `save()` and `deleteUser()`. **The real staleness risk is in-request, not Spatie's cache:** `syncRoles()` calls `unsetRelation('roles')` on its own instance only, so any other loaded copy of that user stays stale.
- `routes/web.php` — `Route::livewire('users', Index::class)->middleware('can:users.view')->name('users.index')` inside the existing `['auth', 'verified']` group. **`can:`, not Spatie's `permission:`** — see the boxed note above.

## Tests to perform

**`tests/Feature/Policies/UserPolicyTest.php`** (new) — the policy this story creates, tested directly
- [x] `viewAny` / `create` / `update` follow their permission; `update` returns false against a Super Admin target regardless of the actor's permissions.
- [x] `promoteToAdministrator`, `downgrade` and `delete` each deny an actor lacking `roles.manage-administrators` against an `Administrator` target, and allow one holding it.
- [x] `promoteToAdministrator` is invoked **both ways**: `Gate::forUser($actor)->allows('promoteToAdministrator', $target)` (instance) and `Gate::forUser($actor)->allows('promoteToAdministrator', User::class)` (class-level, the create path). Both must return a boolean, not raise `ArgumentCountError`. The class-level assertion is the one that proves the `?User $target = null` default is present — a non-nullable signature passes every instance-level test and fails only here and at the real create call site.
- [x] `downgrade` and `delete` allow against a target holding **no** role, and against a target holding a broad **custom** role that is not `Administrator` — the guard must key on the seeded role, not on "looks powerful".
- [x] Self-targeting is not an exception: an `Administrator` holder lacking the permission is denied `downgrade`/`delete` against themselves.
- [x] A Super Admin actor passes every ability with **zero** permission rows (exercises 0002's `Gate::before`; do not fake the Gate).
- [x] `Gate::forUser($actor)->authorize('delete', $target)` invoked directly still throws `AuthorizationException` — this is what proves "denied server-side, not merely hidden in the UI".

**`tests/Feature/Users/IndexTest.php` — via `Livewire::test(Index::class)`**
- [x] List includes a **roleless** user (Fortify registration creates users with zero roles, and every existing row today is roleless), and includes the acting administrator's **own** row.
- [x] Ordering is the concrete `Ana Gil, Diego Ferrer, Zoe Marin` sequence — **not** "run it twice and compare", which tests MySQL rather than this app.
- [x] `usersSummary()` reports correct totals over a mixed-status set, is computed by query rather than from `$users`, and counts a Super Admin holder in the total.
- [x] `roleOptions()` positively omits the Super Admin role.
- [x] N+1: an explicit query-count budget, **run twice with double the users asserting the count is unchanged** (that is the real N+1 signal), or `Model::preventLazyLoading()` in `beforeEach` — `preventLazyLoading` is not enabled globally, so a `LazyLoadingViolationException` cannot be relied on.
- [x] Create happy path; the invalid-details Outline as a Pest **dataset** (`->with([...])`, one row per `Examples` row).
- [x] **Email-uniqueness ignore keyed on the edited record, not the actor** — three tests: an admin saves *another* user's unchanged email (catches `emailRules(Auth::id())`, the single most likely defect); an admin saves their own unchanged email; a change to a different free email is accepted (otherwise a rule rejecting everything passes the first two).
- [x] Creating a user with an address held as another user's `pending_email` is rejected — proves the component reuses 0003's widened `emailRules()` rather than a narrower local rule.
- [x] **Role detach asserted by absence:** exactly one role, `hasRole('Editor')` false, **and** the `model_has_roles` row count for that `model_uuid` is 1 — the row count is what distinguishes `syncRoles()` from `assignRole()`.
- [x] Status round-trips as a `UserStatus` instance, not a raw string. Create an **`active`** user and assert it persisted as `active` — with the default `inactive`, this is the case that would silently pass through as the wrong value if the whitelist/silent-discard bug reappears; also assert a **`suspended`** create persists correctly.
- [x] Email is normalised **before validation**: creating `MARTA@X.COM` persists `marta@x.com` (asserted via `getRawOriginal('email')`, since the model accessor lowercases on read and would mask a failure), and creating a case-different duplicate of an existing address is rejected as a uniqueness violation, **not** an unhandled `QueryException`. The second assertion is the one that proves the normalisation happens before `validate()` and not only inside the action.
- [x] **Editing an email holds it as pending**: `users.email`, `email_verified_at` and `status` are all unchanged, `pending_email` carries the new address, and exactly one notification goes to the new address. Asserted for a *different* target user **and** for the acting administrator's own row — one mechanism, both directions.
- [x] Editing with an **unchanged** email writes no pending value and sends nothing (guards a regression that treats every save as a change).
- [x] Self-edit guard ×2 (role and status silently ignored) **plus a positive control**: changing *another* user's status/role does apply, and the self-edit *name* change does apply. Without the controls, an implementation that never applies anything passes all the guard tests.
- [x] Administrator gating, all directions: denied on **create**; denied on **promotion**; denied on **downgrade**; denied on **delete** of an `Administrator` holder; permitted on each with the permission; no-op re-save is neither. Plus a Super Admin actor succeeding without holding the permission explicitly.
- [x] **Over-blocking regression:** an actor without `roles.manage-administrators` can still change a user from `Editor` to another non-Administrator role, and can still delete a roleless user. A guard written as "any role change needs the permission" passes every other scenario.
- [x] Super Admin role id submitted as a forged `<select>` value is refused and the target's role is unchanged; saving a user who **holds** the Super Admin role is refused by `UserPolicy::update()`.
- [x] A role deleted out from under an open modal → validation error, not a 500 or a silently roleless user.
- [x] `openEditModal()` / `confirmDelete()` with a malformed or unknown UUID fail cleanly.
- [x] Component-level authorization: `Livewire::test(Index::class)` called directly by a user lacking the permission is forbidden — the Livewire update endpoint is a **separate entry point** that never runs route middleware.
- [x] Authorization re-checked inside `save()`, not only `mount()`.
- [x] Spatie cache freshness, **revocation direction** (a stale cache hides removals, not additions): move a user to a role lacking `products.delete`, assert `hasPermissionTo('products.delete')` is false. Call `forgetCachedPermissions()` in `beforeEach` (the `database` cache store leaks across `RefreshDatabase` tests) but **never between Act and Assert**, or the test can no longer detect its own bug.

**`tests/Feature/Users/IndexTest.php` — via `$this->get(route('users.index'))`** (proves the route layer, which `Livewire::test()` bypasses — both are required)
- [x] Guest redirects to login; 403 without `users.view`; 200 with it; 200 for a Super Admin.

**`tests/Feature/Users/CreateUserTest.php`** — `Notification::fake()` only
- [x] Exactly one invitation, to the new user only; **none** on a failed create.
- [x] `email_verified_at` is null and `pending_email` is null — a new account's address is initial, not pending.
- [x] The password is unusable — assert `Auth::attempt` with an empty password fails **and** `Hash::check('password', …)` is false, rather than the unfalsifiable "not a guessable value".

**Deliberately not tested here:** the soft-delete/obfuscation semantics of `$user->delete()`
(**0005**); the pending-email confirmation flow itself — link validity, replay, expiry, supersede,
the confirmation-time race (**0003**, `tests/Feature/Settings/EmailChangeTest.php`). This story tests
only that an edit **delegates** to that mechanism and leaves the account's own columns alone.

## Expected outcome
A `can:users.view`-gated `/users` screen backed by a working component: it lists all users —
including roleless ones and the acting administrator's own row — with their single role and status,
orders them deterministically, reports accurate totals, and creates or edits a user with a validated
unique email and exactly one role. A created user receives an invitation and cannot sign in until
they complete it, at which point their email becomes verified and their account active (story 0003's
hook). Changing an existing user's email address — theirs or anyone's — never rewrites
`users.email`: it parks the address as pending and mails the verification link to it, leaving the
account's verification date and status untouched. Admins cannot lock themselves out, no one can
assign or edit Super Admin, and administrator-level promotion, downgrade and deletion are each gated
by `UserPolicy`. Every mutating path is authorized at the Livewire action, not only at page load.

## Acceptance criteria
- [x] The list returns all users with their role and status, includes roleless users **and the acting administrator's own row**, orders by `name ASC, id ASC`, and exposes `public array $users` with **no** paginator. Counts come from a single query, not from the loaded array.
- [x] Creating a user persists name, unique email, exactly one role, and a status; sets an unusable random password, a null `email_verified_at` and a null `pending_email`; and sends exactly one invitation, after commit.
- [x] Email is unique and validated on create and edit, the edit path ignoring **the record being edited** (not the actor), and rejecting an address held as another user's pending address. The email is normalised to lowercase **before `validate()` runs** in the component on both paths — the actions' own normalisation is defence in depth, not the primary mechanism.
- [x] Editing a user's email address writes only `pending_email` and delegates to story 0003's `RequestEmailChange`; `users.email`, `email_verified_at` and `status` are unchanged until the recipient uses the link. This holds identically for another user's row and the acting administrator's own row.
- [x] A role is required, always exactly one, via `syncRoles([$role])`; the previous role is detached. The Super Admin role is refused server-side, not merely hidden, and a user who **holds** it cannot be edited at all.
- [x] An admin editing their own row may change their name; their own role and status submissions are silently ignored, and their own email follows the same pending-address path as anyone else's.
- [x] Authorization holds at **both** layers: `can:` route middleware and an explicit `Gate::authorize` at the top of every mutating method. `$editingUserId` and `$deletingUserId` are `#[Locked]`.
- [x] `App\Policies\UserPolicy` is created here with `viewAny`, `create`, `update`, `promoteToAdministrator(User $actor, ?User $target = null)`, `downgrade` and `delete`; adding **or** removing the seeded "Administrator" role, and deleting one of its holders, each require `roles.manage-administrators`. `promoteToAdministrator` is callable both with a target (edit path) and class-level with none (create path). A no-op re-save is neither, and unrelated role changes and deletions are unaffected.
- [x] `deleteUser()` authorizes via `UserPolicy::delete()` and calls `$user->delete()`; this story adds no delete *semantics* — soft deletion and email obfuscation are story 0005's extension of the same policy method.

## Definition of Done
- [x] Tests written and green, plus the full existing suite (`tests/Feature/Settings/**`, `tests/Feature/Auth/**`). This story's own three test files (`UserPolicyTest.php`, `IndexTest.php`, `CreateUserTest.php`) are 100% green (85/85). The full suite briefly stood at 275/276 during this closure — a pre-existing, unrelated story-0001 test (`tests/Feature/Models/UserRouteBindingTest.php`) broken by a calendar-triggered MySQL UUID-integer-coercion issue (no 0004 file participates) — fixed directly (two `assertDatabaseMissing` calls compared the UUID `CHAR` column against an unquoted int literal `1`, which MySQL numerically coerces; changed to the string `'1'`). Full suite now 276/276.
- [x] Code reviewed (code-reviewer). Confirmed by commit `419fff4` ("assert the full $users row contract, dedupe a guest test"), whose test explicitly cites "Code review finding (Phase 5)".
- [x] No security findings (appsec-auditor) — specifically the `#[Locked]` target-swap vector, the Livewire-action authorization gap, and that the generated password is never logged or flashed. `#[Locked]` confirmed on `$editingUserId`/`$deletingUserId` (`app/Livewire/Users/Index.php`); `Gate::authorize` confirmed as the first statement of `mount()`, `save()` and `deleteUser()`; `CreateUser::__invoke()` passes `Str::password(32)` directly into `Hash::make()` with no intermediate variable, log call, or flash. The one finding this audit did raise (F1: status/email bypassing the administrator-level guard) was fixed in commit `78116db`, with its remaining findings triaged into follow-up stories 0008/0009/0015 rather than left open against 0004.
- [x] Documentation updated (docs-keeper) — `docs/api/routes.md` (`users.index`), `docs/architecture/authorization.md` (first real permission-gated route, the `can:` vs `permission:` Livewire finding, and the new `UserPolicy` abilities), and `docs/conventions/base-standards.md`'s directory listing for the **one** folder this story introduces: **`app/Policies/`**.
  **Directory-documentation ownership — do not duplicate story 0003's entries.** `app/Actions/Users/` and `app/Notifications/` are **story 0003's** to document (it lands first and creates both folders, for `RequestEmailChange` / `ConfirmEmailChange` and `PendingEmailVerification`). By the time this story reaches Phase 6 those directory lines already exist in `base-standards.md`; this story adds `CreateUser`, `UpdateUser` and `UserInvitation` *inside* them, which needs no new entry. `app/Enums/`, `app/Listeners/`, `app/Http/Controllers/`'s "first domain controller" rewrite, and `lang/` are likewise 0003's.
- [x] Acceptance criteria met.

## Dependencies and related work
- **Depends on story 0002** — the seeded catalog. Permission strings used here are 0002's real ones: **`users.view`** (page + list), **`users.create`**, **`users.edit`**, **`users.delete`**, **`roles.manage-administrators`** (administrator-level changes). 0002 seeds 38 permissions as `<module-slug>.<action>`; `Administrator` holds 37 (all but `roles.manage-administrators`), `Super Admin` holds none and bypasses via `Gate::before`.
- **Depends on story 0003** — `users.status` and its `UserStatus` enum + cast, `users.pending_email`, the read-only `email` accessor, the `status`/`pendingEmail` factory states, the widened `emailRules()`, and `App\Actions\Users\RequestEmailChange`. **0003 must land first**; this story writes no migration and re-implements none of that mechanism.
- **Story 0006** (frontend) — the view, modal markup, status badges, Spanish labels. This story conforms to 0006's locked interface contract, with one addition: the `pendingEmail` key on each `$users` row, so the view can show a mid-flight address change. 0006 is updated to match; nothing else in that contract moves.
- **Story 0005** — soft delete and email obfuscation. It **extends** the `UserPolicy::delete()` / `downgrade()` this story creates rather than defining them, and it overrides `User::delete()` so this story's `$user->delete()` call gains soft-delete semantics with no change here. Also: 0005's `deleted_at` must anchor `after('updated_at')`, and it must null `pending_email` alongside obfuscating `email`.
- **Story 0007** — Fortify enforcement that a non-`active` status blocks sign-in. It depends on **0003** only (column + enum + factory), **not** on this story.
- **Story 0008 (Super Admin role invariants)** — the exclusion of the `Super Admin` role from `roleOptions()` and from `roleRules()` is **local to this story for now**: this story hardcodes the exclusion in its own computed property and its own `Rule::exists(...)->whereNot('name', 'Super Admin')`. 0008 is expected to centralise that rule, e.g. as a `Role::selectable()` scope or an equivalent single source of truth. **Whoever implements 0008 must revisit these two call sites** and route them through the centralised rule rather than leaving a second, drifting copy of the exclusion. Nothing here should be generalised pre-emptively.
- **Story 0009** — the role-level administrator rule (`RolePolicy`) and the Super-Admin-only grant meta-rule. Disjoint from this story's user-level `UserPolicy`; neither defines the other's abilities.
- **Warning to any later story that touches this route.** `users.index` is gated with **`can:users.view`**, and that choice is load-bearing, not incidental — see the boxed note at the top of *Files to create/modify*. Livewire 4's `PersistentMiddleware` allowlist does not carry Spatie's `permission:` middleware, so swapping it would leave every `/livewire/update` round-trip unauthorized at the route layer. A later module-gating story must not rewrite this route's middleware to `permission:`; if it needs module-level gating semantics here, that must be re-agreed rather than substituted.
- **Browser-test infra task** — `tests/Browser/` is not wired (`phpunit.xml` declares only `Unit` and `Feature`). No browser test is written here.

## Resolved during Phase 1
- **Pagination — dropped.** 0006's locked contract (`public array $users`, no pager) wins; it matches the prototype and the PRD acceptance criteria.
- **`APP_LOCALE=en` badges** — an accepted, documented consequence of the English-source decision, not a defect. No action.
- **Test ownership.** `tests/Feature/Users/IndexTest.php` belongs to **this** story (component logic, persistence, authorization). Story 0006 owns `tests/Feature/Users/IndexRenderingTest.php` and `tests/Browser/UsersIndexTest.php`.

## Resolved directly with the human (Phase 2 rewrite)
- **`UserPolicy::delete()` and `downgrade()` are created here, not in 0005.** Both start at the
  minimal shape keyed on `roles.manage-administrators`, identical in form to
  `promoteToAdministrator()`. Story 0005 extends them with soft-delete and obfuscation. This resolves
  the inverted dependency that failed Phase 2, and the numbering is left intact — 0005 is not
  resequenced ahead of this story.
- **`promoteToAdministrator()` is defined *and* called here.** The earlier prose attributing the
  promotion rule to another story was wrong and blocked an implementer; story **0009** owns only the
  role-level rule in `RolePolicy`.
- **Email normalisation happens in the component before `validate()`**, with the actions' own
  lowercase call retained as defence in depth and the model's read-only accessor as a third layer.
- **An email change is never applied immediately**, in any role and from any screen. Both this story
  and `Settings/Profile` route through story 0003's single pending-email mechanism.
- **The Users list includes the acting administrator's own row** — this answers story 0006's open
  question. The empty state remains a defensive rendering branch rather than a reachable production
  state, and is still required.

## Provenance
This story is the **CRUD-screen half** of the original story 0003 ("Users list + create/edit modal —
backend"), split by human decision after `code-reviewer` failed that story's Phase 2 INVEST review on
**Small** and **Independent**. The status/verification half kept the id **0003**; every story from
the old 0004 onward was renumbered by one.

The original story's Phase 1 was a real three-way debate: `database-expert` (the `User::create()`
silent-discard trap, the migration/ordering dependencies), `backend-expert` (the Livewire
authorization gap, `#[Locked]`, the invitation-notification split, flat trait composition, the
downgrade hole), and `backend-qa` (the Gherkin rule violations, the ignore-keyed-on-actor defect,
the over-blocking regression, the sqlite/MySQL caveat). The Livewire `can:` vs `permission:` finding
was independently confirmed by story 0010's debate.

The human decisions listed in **Resolved directly with the human** above were confirmed directly and
need no reviewer re-confirmation. The remaining technical detail is the amigos' and this rewrite's
derivation from them, and should be reviewed as such.
