# [0003] Users list + create/edit modal — backend (component logic, validation, persistence)

## Description
Build the Livewire component class, policy, validation, actions, and persistence behind the
**Users** screen of PRD Epic 1 — the list query, the "X usuarios · Y activos" summary, and the
create/edit flow for a user's name, unique email, exactly one role, and a status. Adds the
`users.status` column and its backing enum. This component is the **single call site** for the
Users screen: it also wires the delete and role-change actions, delegating their business rules
to the policies defined in stories 0004 and 0009. Access is gated on `users.view` with
per-action checks for `users.create` / `users.edit`. The Blade view is sibling story **0005**.

## Type
backend (related_task_id: **0005** — frontend/view sibling) | includes database-expert: **yes**

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

  # --- Self-edit guard (prevents self-lockout) ---

  Scenario: A user administrator can edit their own name and email
    Given a user administrator editing their own row
    When they save a new name and email for themselves
    Then their name and email are updated

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

  # --- Administrator-level role changes (rules defined by 0004 / 0009, invoked here) ---

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

  Scenario: Saving an existing Administrator without changing their role is not a role change
    Given a user administrator without the permission to manage administrator-level roles and users,
      with a user who already holds the seeded "Administrator" role
    When they save that user's name without altering their role
    Then the update succeeds, because no role change was attempted

  Scenario: An unrelated role change is unaffected by the stricter permission
    Given a user administrator without the permission to manage administrator-level roles and users
    When they change another user's role from "Editor" to "Blog Editor"
    Then the user's role is updated

  # --- Status is not casually mass-assignable ---

  Scenario: A self-service profile update cannot change a status
    Given a registered user on their own profile settings
    When they submit a profile update that includes a status value
    Then their status is left unchanged

  # --- Inactive-until-verified default (human decision) ---

  Scenario: A newly self-registered user starts out inactive
    Given a visitor who registers a new account
    When registration completes
    Then that user's status is "Inactive" until their email is verified

  Scenario: Verifying an email activates a previously inactive user
    Given a registered user whose status is "Inactive" and whose email is not yet verified
    When they verify their email address
    Then their status becomes "Active"

  Scenario: Verifying an email never reactivates a suspended user
    Given a user administrator, with a user whose status is "Suspended" and whose email is not yet verified
    When that user verifies their email address
    Then their status remains "Suspended"

  Scenario: Completing an invitation activates the invited user
    Given a user administrator, with a newly invited user who has not yet set a password
    When the invited user completes the invitation flow by setting their password
    Then that user's status becomes "Active" and their email is recorded as verified

  Scenario: Changing another user's email forces re-verification
    Given a user administrator editing another user whose status is "Active"
    When they change that other user's email to a new address
    Then that user's email is recorded as not yet verified, and their status becomes "Inactive"
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
> **0008**'s debate.

> **Call site vs. definition site.** This component is the single call site for the Users
> screen and owns every action method 0005's markup binds to — including `deleteUser()` and the
> role-change path. It does **not** own the business rules those methods invoke: the
> `delete` and `downgrade` policy methods are **0004's**, and the promotion rule is **0009's**.
> 0003 wires and orchestrates; 0004/0009 define.

**Migration** — shape confirmed by `database-expert`, **default revised by the human to `inactive`** (see below):

- `database/migrations/<ts>_add_status_to_users_table.php` — **new**.

  ```php
  use App\Enums\UserStatus;   // importing an app class from a migration follows 2026_07_22_100004_*

  public function up(): void
  {
      Schema::table('users', function (Blueprint $table): void {
          $table->string('status', 20)->after('email_verified_at')->default(UserStatus::Inactive->value);
      });

      DB::table('users')
          ->whereNotNull('email_verified_at')
          ->update(['status' => UserStatus::Active->value]);
  }

  public function down(): void
  {
      Schema::table('users', function (Blueprint $table): void {
          $table->dropColumn('status');
      });
  }
  ```

  - **`string(20)`, not bare `string()`** — a bare `string()` is `VARCHAR(255)` for a 10-char token and would make any future index a 1020-byte utf8mb4 key.
  - **`string` + app enum** over native MySQL `enum` (needs DDL per new value; MySQL orders it by ordinal, not alphabetically) and over `tinyInteger` (opaque in raw SQL). `Rule::enum(UserStatus::class)` is the validation boundary, so the DB need not re-enforce it.
  - **Placement confirmed.** Real physical order is `id, name, email, email_verified_at, password, two_factor_*, remember_token, timestamps`; `status` is account-state and belongs beside `email_verified_at`, not among the encrypted 2FA blobs. No rebuild penalty — MySQL 8.0.29+ supports `ALGORITHM=INSTANT` for a positioned add and `compose.yaml` pins `mysql:8.4`.
  - **Default is `inactive`, not `active` — human decision, overriding Phase 1's original draft.** An account (self-registered, invited, or admin-created) is not `active` until its email is verified, or an admin explicitly picks a different status. Because the column default also governs `ALTER TABLE`'s implicit backfill, applying it blindly would flip **every existing row — including already-verified accounts and the Super Admin — to `inactive`.** The migration therefore follows the schema change with an explicit conditional `UPDATE … WHERE email_verified_at IS NOT NULL` to `active`, so only rows that were never verified inherit the raw default. This is why `up()` is two statements, not one.
  - **No index — and the reason matters.** *Not* "low selectivity": a narrow secondary index on `status` genuinely would be chosen for `COUNT(*) WHERE status = 'active'`, because the clustered index here is unusually fat (CHAR(36) PK + two TEXT columns). The real reason is **cardinality** — a backoffice `users` table is 10²–10³ rows, both queries resolve in a sub-millisecond clustered scan, and an index costs a write on every insert/update. **If one is ever added it must be composite `(deleted_at, status)`, never plain `status`**, because story 0004 puts `deleted_at IS NULL` into all three queries; that index belongs to 0004 or later, never retrofitted here.
  - **Rollback is clean and lossless** — `down()` removes exactly what `up()` added and nothing references `status`. This is a different risk class from the UUID set's documented data-lossy rollback; do not import that caution here.

**Enum and translations:**

- `app/Enums/UserStatus.php` — **new**. Backed string enum, TitleCase keys: `Active = 'active'`, `Inactive = 'inactive'`, `Suspended = 'suspended'`, plus `label(): string` returning `__('users.statuses.'.$this->value)`.
- `lang/es/users.php` + `lang/en/users.php` — **new**, three status labels each. `lang/` is a framework-standard directory (`php artisan lang:publish`), not a new base folder needing approval. Note `APP_LOCALE=en` today, so badges render English until Epic 5 adds the switcher — an accepted, documented consequence of the English-source decision, not a defect.

**Model, factory, policy:**

- `app/Models/User.php` — add `@property UserStatus $status` (after `email_verified_at`, mirroring physical order) and `'status' => UserStatus::class` to `casts()`. **`#[Fillable]` stays `['name', 'email', 'password']`** — that omission *is* the mass-assignment guard. The existing `@return array<string, string>` docblock on `casts()` still satisfies Larastan 7 with an enum class-string.
- `database/factories/UserFactory.php` — `'status' => UserStatus::Active` in `definition()`; `inactive()` and `suspended()` states in the existing `unverified()`/`withTwoFactor()` shape; plus a `role(string|Role $role)` state, since every test in 0003/0004/0006 needs a roled user.
- `app/Policies/UserPolicy.php` — **created here** with `viewAny`, `create`, `update`, and `promoteToAdministrator(User $actor, User $target)`. Laravel 13 auto-discovers `App\Policies\UserPolicy` for `App\Models\User`; no provider registration. **The Super Admin exclusion lives here** (`update()` returns false for a Super Admin target) so 0004's delete path inherits it. **Story 0004 extends this same file** with `delete()` and `downgrade()` — 0003 creates it, 0004 adds to it.

**Validation** — flat, single-concern traits composed at the consumer, matching `CreateNewUser`'s `use PasswordValidationRules, ProfileValidationRules;` precedent. There is **no nested-trait `use`** anywhere in `app/Concerns/`, and nesting would break Larastan 7:

- `app/Concerns/UserValidationRules.php` — **new**, containing **only** `roleRules()` and `statusRules()`.
  - `roleRules()`: `['required', Rule::exists('roles', 'id')->where('guard_name', 'web')->whereNot('name', 'Super Admin')]` — the Super Admin exclusion is **server-side in the rule**, not merely omitted from the dropdown.
  - `statusRules()`: `['required', Rule::enum(UserStatus::class)]`.
  - The consumer spreads both: `[...$this->profileRules($this->editingUserId), 'roleId' => $this->roleRules(), 'status' => $this->statusRules()]`.
- `app/Concerns/ProfileValidationRules.php` — **no change needed**; `emailRules(?string $userId)` is already `?string`-typed for the UUID PK and is reused verbatim.
- Type asymmetry for 0005: `users.id` is a UUID string but `roles.id` is a bigint — hence `$roleId`, cast on the way in.

**Actions:**

- `app/Actions/Users/CreateUser.php` — **new**, invokable.
  - Normalises the submitted email to lowercase (`Str::lower($email)`) before anything else touches it — **human decision, resolves OQ-2**: MySQL's `utf8mb4_0900_ai_ci` already treats `MARTA@…`/`marta@…` as the same row at the unique index, but the test connection (sqlite) does not, so normalising in the action keeps behaviour identical across environments and makes it testable.
  - `User::forceCreate([...])` with a **literal whitelist** (`name`, `email`, `password`, `status`, `email_verified_at`), never a spread of validated input. **This is mandatory, not stylistic:** `Model::preventSilentlyDiscardingAttributes()` is not enabled anywhere in `app/Providers/`, so `User::create([... 'status' => …])` would **silently drop** `status` and fall back to the column default `inactive` — invisible on the happy path, surfacing only when an admin creates an `active`/`suspended` user and it silently downgrades to `inactive`.
  - Password: `Hash::make(Str::password(32))`, never returned, logged, or flashed.
  - Wrap `forceCreate` + `syncRoles` in `DB::transaction()`, and send the invitation **after commit** (`DB::afterCommit()`), so a `syncRoles` failure doesn't leave an email already sent against a rolled-back user.
  - Catch `QueryException` SQLSTATE `23000` around the insert and rethrow as a `ValidationException` on `email`, so a concurrent double-submit is a field error rather than a 500.
  - **Invitation:** `Password::broker()->createToken($user)` + `$user->notify(new UserInvitation($token))` — **not** `Password::sendResetLink()`. `sendResetLink()` bundles the framework's `ResetPassword` notification, whose wording cannot be changed without also re-wording genuine resets (`toMailUsing()` is global), and it is subject to the 60-second `passwords.users.throttle`, which would silently no-op a rapid second create.
- `app/Notifications/UserInvitation.php` — **new**, `ShouldQueue`, links to the existing `password.reset` route with the minted token.
- `app/Actions/Users/UpdateUser.php` — **new**, invokable. Normalises the submitted email to lowercase, same as `CreateUser` (resolves OQ-2). `fill()` name/email only, then `$user->status = $status;` (property assignment preserves the enum cast), then `save()`. Role and status are applied **only** when the target is not the acting user. **When the (normalised) email actually changes and the target is not the actor** — human decision, resolves OQ-3 — the action also forces `email_verified_at` to `null` (mirroring `App\Livewire\Settings\Profile`'s self-service behaviour) **and** forces `status` to `UserStatus::Inactive`, overriding whatever status value the admin submitted in the same request: an email change always demands re-verification before the account is usable again, consistent with the inactive-until-verified invariant. A self-edit never triggers this path, since role/status/email-verification side effects are already skipped for the acting user's own row (see the self-edit guard).
- `app/Actions/Fortify/ResetUserPassword.php` — **modify.** `forceFill(['email_verified_at' => now()])` when it is currently null, **and**, if the user's `status` is currently `UserStatus::Inactive`, also `forceFill(['status' => UserStatus::Active])` in the same call — human decision, keeps the invitation flow consistent with the new inactive-until-verified default; never overrides a `Suspended` status. **Without the `email_verified_at` fix the feature is broken as specified:** the recorded decision says an invited user becomes verified on completing the flow, but Fortify's reset path does not mark emails verified, so the invitee would set a password, sign in, and be bounced to `verification.notice` forever by the `verified` middleware. This touches a shared Fortify action — `tests/Feature/Auth/PasswordResetTest.php` is a real regression surface.
- `app/Listeners/ActivateVerifiedUser.php` — **new, human decision**, needed because the default is now `inactive`. Listens for `Illuminate\Auth\Events\Verified` (fired by Fortify's own email-verification flow for self-registered users, who have no `status` field to set at registration time) and, only when the user's current `status` is `UserStatus::Inactive`, sets it to `UserStatus::Active`. Never touches a `Suspended` user — verifying an email must not undo an administrator's suspension. Registered via `Event::listen(Verified::class, ActivateVerifiedUser::class)` in `app/Providers/AppServiceProvider::boot()` (no new provider needed).

**Livewire component & route:**

- `app/Livewire/Users/Index.php` — **new**. Class-based, `#[Title('Users')]`. Its public surface is **exactly** story 0005's locked interface contract:
  - `public array $users` — rows `[{id, name, email, role, status}]`. **No pagination and no paginator**: the prototype has no pager, no PRD acceptance criterion asks for one, and 0005's contract is locked on the array shape.
  - `#[Locked] public ?string $editingUserId` and `#[Locked] public ?string $deletingUserId` — **`#[Locked]` is mandatory**, not a nicety: without it a client can swap the target between opening a modal and acting on it, so the identity authorized is not the identity written. `Security.php` sets the precedent with `#[Locked] public ?int $deletingPasskeyId`.
  - `public bool $showModal`, `public string $name`, `public string $email`, `public ?string $roleId`, `public ?UserStatus $status`, `public bool $showDeleteModal`, `public string $deletingUserName`.
  - `#[Computed] usersSummary(): array` → `['total' => int, 'active' => int]`, as **one** query (`selectRaw('count(*) total, count(case when status = ? then 1 end) active')`), never `User::all()->filter()`.
  - `#[Computed] roleOptions(): array` — excludes Super Admin.
  - The list query eager-loads `roles` (`->with('roles')`) and orders `name ASC, id ASC`. **The `id` tiebreaker is required** for a deterministic order when names collide; UUIDv7 is time-ordered, so it is a meaningful creation-order tiebreaker rather than an arbitrary one.
  - `openCreateModal()`, `openEditModal(string $userId)`, `save()`, `closeModal()`, `confirmDelete(string $userId)`, `deleteUser()`, `closeDeleteModal()`.
  - `Gate::authorize('viewAny', User::class)` in `mount()`; `Gate::authorize('create'|'update', …)` as the **first statement** of every mutating method.
  - **`save()` role-change gating** — compare the submitted role against a fresh read (`$target->roles()->value('roles.id')`, a query, not the cached relation), and only when they differ:
    - Administrator is being **added** to a user who does not hold it → `Gate::authorize('promoteToAdministrator', $target)` (0009's rule).
    - Administrator is being **removed** from an existing holder → `Gate::authorize('downgrade', $target)` (**0004's** policy method).
    - Neither side is Administrator → no extra gate; an unrelated role change must stay unaffected.
  - **`deleteUser()`** — `Gate::authorize('delete', $user)` against 0004's policy, then `$user->delete()`, which triggers 0004's soft-delete-with-obfuscation. 0003 supplies no delete semantics of its own.
  - `openEditModal()` / `confirmDelete()` must guard a malformed or unknown id themselves — these are Livewire method calls, not route-model binding, so `HasUuids::resolveRouteBindingQuery()`'s `Str::isUuid()` short-circuit does not apply.
  - `unset($this->users, $this->usersSummary)` at the end of `save()` and `deleteUser()`. **The real staleness risk is in-request, not Spatie's cache:** `syncRoles()` calls `unsetRelation('roles')` on its own instance only, so any other loaded copy of that user stays stale.
- `routes/web.php` — `Route::livewire('users', Index::class)->middleware('can:users.view')->name('users.index')` inside the existing `['auth', 'verified']` group. **`can:`, not Spatie's `permission:`** — see the boxed note above.

## Tests to perform

**`tests/Unit/Enums/UserStatusTest.php`** (no DB)
- [ ] Backing values are exactly `active` / `inactive` / `suspended`; `UserStatus::from('deleted')` throws.
- [ ] `label()` routes through `__()` — assert against `trans('users.statuses.active')`, **not** a literal, so this doesn't assert display copy Epic 5 owns.

**`tests/Unit/Models/UserTest.php`** (extend)
- [ ] `(new User)->fill(['status' => 'suspended'])` leaves the attribute unset — guards `#[Fillable]`.

**`tests/Feature/Users/IndexTest.php` — via `Livewire::test(Index::class)`**
- [ ] List includes a **roleless** user (Fortify registration creates users with zero roles, and every existing row today is roleless).
- [ ] Ordering is the concrete `Ana Gil, Diego Ferrer, Zoe Marin` sequence — **not** "run it twice and compare", which tests MySQL rather than this app.
- [ ] `usersSummary()` reports correct totals over a mixed-status set, is computed by query rather than from `$users`, and counts a Super Admin holder in the total.
- [ ] `roleOptions()` positively omits the Super Admin role.
- [ ] N+1: an explicit query-count budget, **run twice with double the users asserting the count is unchanged** (that is the real N+1 signal), or `Model::preventLazyLoading()` in `beforeEach` — `preventLazyLoading` is not enabled globally, so a `LazyLoadingViolationException` cannot be relied on.
- [ ] Create happy path; the invalid-details Outline as a Pest **dataset** (`->with([...])`, one row per `Examples` row).
- [ ] **Email-uniqueness ignore keyed on the edited record, not the actor** — three tests: an admin saves *another* user's unchanged email (catches `emailRules(Auth::id())`, the single most likely defect); an admin saves their own unchanged email; a change to a different free email succeeds (otherwise a rule rejecting everything passes the first two).
- [ ] **Role detach asserted by absence:** exactly one role, `hasRole('Editor')` false, **and** the `model_has_roles` row count for that `model_uuid` is 1 — the row count is what distinguishes `syncRoles()` from `assignRole()`.
- [ ] Status round-trips as a `UserStatus` instance, not a raw string. Create an **`active`** user and assert it persisted as `active` — with the default now `inactive`, this is the case that would silently pass through as the wrong value if the whitelist/silent-discard bug reappears; also assert a **`suspended`** create persists correctly.
- [ ] Email is normalised to lowercase on create and edit (`MARTA@x.com` persists as `marta@x.com`), and a case-different duplicate is rejected as a uniqueness violation (resolves OQ-2).
- [ ] Changing another user's email resets `email_verified_at` to null and forces `status` back to `Inactive`, even when the admin submitted a different status in the same request — and this must **not** happen when the target is the acting user (self-edit guard) or when the email is unchanged (resolves OQ-3).
- [ ] Self-edit guard ×2 **plus a positive control**: changing *another* user's status/role does apply. Without the control, an implementation that never applies role or status passes all the guard tests.
- [ ] Administrator gating, all six directions: denied on **create**; denied on **promotion**; denied on **downgrade**; permitted on promotion and downgrade with the permission; no-op re-save is neither. Plus a Super Admin actor (via 0002's `Gate::before` bypass) succeeding without holding the permission explicitly.
- [ ] **Over-blocking regression:** an actor without `roles.manage-administrators` can still change a user from `Editor` to another non-Administrator role. A guard written as "any role change needs the permission" passes every other scenario.
- [ ] Super Admin role id submitted as a forged `<select>` value is refused and the target's role is unchanged.
- [ ] A role deleted out from under an open modal → validation error, not a 500 or a silently roleless user.
- [ ] `openEditModal()` / `confirmDelete()` with a malformed or unknown UUID fail cleanly.
- [ ] `deleteUser()` delegates to `Gate::authorize('delete', …)` — assert the gate is consulted. The soft-delete semantics themselves are **0004's** tests, not duplicated here.
- [ ] Component-level authorization: `Livewire::test(Index::class)` called directly by a user lacking the permission is forbidden — the Livewire update endpoint is a **separate entry point** that never runs route middleware.
- [ ] Authorization re-checked inside `save()`, not only `mount()`.
- [ ] Spatie cache freshness, **revocation direction** (a stale cache hides removals, not additions): move a user to a role lacking `products.delete`, assert `hasPermissionTo('products.delete')` is false. Call `forgetCachedPermissions()` in `beforeEach` (the `database` cache store leaks across `RefreshDatabase` tests) but **never between Act and Assert**, or the test can no longer detect its own bug.

**`tests/Feature/Users/IndexTest.php` — via `$this->get(route('users.index'))`** (proves the route layer, which `Livewire::test()` bypasses — both are required)
- [ ] Guest redirects to login; 403 without `users.view`; 200 with it; 200 for a Super Admin.

**`tests/Feature/Users/CreateUserTest.php`** — `Notification::fake()` only
- [ ] Exactly one invitation, to the new user only; **none** on a failed create.
- [ ] `email_verified_at` is null; the password is unusable — assert `Auth::attempt` with an empty password fails **and** `Hash::check('password', …)` is false, rather than the unfalsifiable "not a guessable value".

**`tests/Unit/Listeners/ActivateVerifiedUserTest.php`** (new, no DB required beyond a factory user) — human decision, covers `app/Listeners/ActivateVerifiedUser.php`
- [ ] An `Inactive` user with a fired `Verified` event becomes `Active`.
- [ ] A `Suspended` user with a fired `Verified` event stays `Suspended` (must never be silently reactivated).
- [ ] An already-`Active` user is a no-op.

**Existing files, extended**
- [ ] `tests/Feature/Settings/ProfileUpdateTest.php` — `Livewire::test(Profile::class)->set('status', 'suspended')->call('updateProfileInformation')` leaves `users.status` unchanged.
- [ ] `tests/Feature/Auth/RegistrationTest.php` — a Fortify-registered user gets `Inactive`, not `Active` — the default flipped by human decision; that path never touches this story's action and would break silently if the column default ever changed back.
- [ ] `tests/Feature/Auth/PasswordResetTest.php` — regression for the `ResetUserPassword` change: completing the flow verifies a previously-unverified email **and** flips `Inactive` → `Active`, but never touches a `Suspended` status.

**Deliberately not tested here:** migration `up()`/`down()` mechanics (`RefreshDatabase` runs every migration each run; `docs/testing/qa/what-not-to-test.md` excludes this, and `down()` symmetry is a code-review item). The duplicate-email `QueryException` race is **conditional** — see OQ-2, the test connection is sqlite while production is MySQL 8.4 and case-insensitive collation behaviour differs. The migration's conditional backfill (`active` for already-verified rows) is likewise not covered by a dedicated Pest test: `RefreshDatabase` always runs migrations against an empty schema, so there is no practical way to seed a "legacy row without `status`" before `up()` runs; verify it manually against a MySQL staging copy before deploy.

## Expected outcome
A `can:users.view`-gated `/users` screen backed by a working component: it lists all users with
their single role and status (including roleless ones), orders them deterministically, reports
accurate totals, and creates or edits a user with a validated unique email and exactly one role.
A created user receives an invitation and cannot sign in until they complete it — at which point
their email becomes verified. `users.status` exists with an **`inactive` default** (human
decision): an account — self-registered, invited, or admin-created — is `active` only once its
email is verified, or an admin explicitly picks a different status. Verifying an email or
completing an invitation activates a previously `inactive` user (never a `Suspended` one);
changing another user's email forces re-verification and reverts them to `inactive`. Admins
cannot lock themselves out, no one can assign Super Admin, and administrator-level role changes
in **both** directions are gated. Every mutating path is authorized at the Livewire action, not
only at page load.

## Acceptance criteria
- [ ] `users.status` exists (`VARCHAR(20)`, non-nullable, default `inactive`), cast to `App\Enums\UserStatus`, and is **not** mass-assignable. Pre-existing rows are backfilled to `active` when already verified, `inactive` otherwise.
- [ ] A previously `inactive` user becomes `active` when their email is verified (self-registration) or when they complete an invitation — in both cases, a `Suspended` status is never overridden.
- [ ] Changing another user's email resets `email_verified_at` to null and their status to `Inactive`, regardless of the status value submitted in the same request; this never applies to a self-edit.
- [ ] The list returns all users with their role and status, includes roleless users, orders by `name ASC, id ASC`, and exposes `public array $users` with **no** paginator. Counts come from a single query, not from the loaded array.
- [ ] Creating a user persists name, unique email, exactly one role, and a status; sets an unusable random password and a null `email_verified_at`; and sends exactly one invitation, after commit.
- [ ] Completing the invitation flow marks the user's email verified.
- [ ] Email is unique and validated on create and edit, the edit path ignoring **the record being edited** (not the actor); the email is normalised to lowercase before validation and persistence on both paths, so case-different duplicates are caught consistently in sqlite (tests) and MySQL (production).
- [ ] A role is required, always exactly one, via `syncRoles([$role])`; the previous role is detached. The Super Admin role is refused server-side, not merely hidden.
- [ ] An admin editing their own row may change name/email; their own role and status submissions are silently ignored.
- [ ] Authorization holds at **both** layers: `can:` route middleware and an explicit `Gate::authorize` at the top of every mutating method. `$editingUserId` and `$deletingUserId` are `#[Locked]`.
- [ ] Adding **or** removing the seeded "Administrator" role is gated — promotion via 0009's rule, downgrade via 0004's `UserPolicy::downgrade()`. A no-op re-save is neither, and unrelated role changes are unaffected.
- [ ] `deleteUser()` authorizes via 0004's `UserPolicy::delete()` and calls `$user->delete()`; this story adds no delete semantics of its own.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (`ProfileUpdateTest`, `RegistrationTest`, `PasswordResetTest`, `tests/Feature/Settings/**`).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically the `#[Locked]` target-swap vector, the Livewire-action authorization gap, and that the generated password is never logged or flashed.
- [ ] Documentation updated (docs-keeper) — `docs/database/schema.md` (`users.status`), `docs/api/routes.md` (`users.index`), `docs/architecture/authorization.md` (first real permission-gated route + the `can:` vs `permission:` Livewire finding), `docs/conventions/base-standards.md` (`app/Enums/`).
- [ ] Acceptance criteria met.

## Dependencies and related work
- **Depends on story 0002** — the seeded catalog. Permission strings used here are 0002's real ones: **`users.view`** (page + list), **`users.create`**, **`users.edit`**, **`users.delete`** (via 0004's policy), **`roles.manage-administrators`** (administrator-level changes). 0002 seeds 38 permissions as `<module-slug>.<action>`; `Administrator` holds 37 (all but `roles.manage-administrators`), `Super Admin` holds none and bypasses via `Gate::before`.
- **Story 0005** (frontend) — the view, modal markup, status badges, Spanish labels. This story now conforms to 0005's locked interface contract exactly, including the no-pagination `array $users` shape and the delete-modal members; **0005 needs no change**.
- **Story 0004** — soft delete and the administrator-level delete/downgrade **rules**. 0004 adds `delete()` and `downgrade()` to the `UserPolicy` this story creates; 0003 calls them. Also: 0004's `deleted_at` must anchor `after('remember_token')`, **never `after('status')`** — if 0004's timestamp sorts first on a fresh `migrate`, an `after('status')` anchor fails outright.
- **Story 0006** — Fortify enforcement that a non-`active` status blocks sign-in. This story only stores the status and provides the `inactive` → `active` transition on verification/invitation (`ActivateVerifiedUser`, `ResetUserPassword`); 0006 is what actually blocks sign-in for a non-`active` account.
- **Stories 0007 / 0009** — Super Admin invariants and the promotion rule invoked by `save()`.
- **Browser-test infra task** — `tests/Browser/` is not wired (`phpunit.xml` declares only `Unit` and `Feature`). No browser test is written here.

## Resolved during Phase 1
- **Pagination — dropped.** 0005's locked contract (`public array $users`, no pager) wins; it matches the prototype and the PRD acceptance criteria. The earlier "0003 owns pagination" instruction is superseded, and the page-boundary count test it implied is no longer applicable.
- **Delete and downgrade — not a scope conflict.** Call site vs. definition site: 0003 owns the action methods 0005 binds to (`confirmDelete`/`deleteUser`, and the role-change path in `save()`); 0004 and 0009 own the rules those methods invoke. Both directions of the Administrator guard are now gated in `save()`.
- **`APP_LOCALE=en` badges** — an accepted, documented consequence of the English-source decision, not a defect. No action.

## Resolved directly with the human (this session)
- **`users.status` default changed to `inactive`**, superseding the original Phase 1 draft's `active` default. An account is `active` only once verified (or explicitly set otherwise by an admin). The migration backfills pre-existing rows conditionally (`active` if already verified, `inactive` otherwise) instead of relying on the raw column default, and a new `app/Listeners/ActivateVerifiedUser.php` plus a change to `ResetUserPassword.php` flip `Inactive` → `Active` on verification/invitation completion, never overriding `Suspended`.
- **OQ-1 resolved — invitation expiry.** Accept the existing 60-minute window (`passwords.users.expire`); "resend invitation" deferred to a later story. `config/auth.php` is not touched by this story.
- **OQ-2 resolved — email collation.** `CreateUser` and `UpdateUser` normalise the submitted email to lowercase before validation/persistence, so behaviour is identical between the sqlite test connection and MySQL production, and the normalisation itself is tested.
- **OQ-3 resolved — email change and verification.** Changing another user's email (never a self-edit) resets `email_verified_at` to null and forces `status` back to `Inactive`, mirroring `App\Livewire\Settings\Profile`'s self-service behaviour and staying consistent with the inactive-until-verified invariant.
- **OQ-4 resolved — test ownership.** `tests/Feature/Users/IndexTest.php` belongs to **0003** (component logic, persistence, authorization). Story 0005 owns `tests/Feature/Users/IndexRenderingTest.php` and `tests/Browser/UsersIndexTest.php`.

## Open questions (remaining)

OQ-1 through OQ-4 were resolved directly by the human in this session — see **Resolved directly
with the human (this session)** above. Only OQ-5 remains open.

**OQ-5 — pre-existing schema debt, out of scope.** `2026_07_22_100001_*` created the `uuid`
column with `->unique()`; `2026_07_22_100005_*` renamed it to `id` and made it PRIMARY without
dropping that unique index, so `users` likely carries a redundant `users_uuid_unique` secondary
index on the PK — a wasted CHAR(36) index written on every insert. Unconfirmed (`SHOW INDEX`
could not be run; the MySQL container was not resolving). **Not this story's to fix** — worth an
`errors-log.md` entry and a follow-up task.

## Provenance
Phase 1 was run **twice**. The first attempt could not convene the amigos (the 20-concurrent
subagent limit blocked every launch), so the resulting draft was self-derived by the
product-owner. This version is the product of a **real three-way debate**: `database-expert`
(migration shape, indexing, the `User::create()` silent-discard trap, the 0004 `after()`
ordering dependency), `backend-expert` (the Livewire authorization gap, `#[Locked]`, the
unimplemented email-verification step, the invitation-notification split, flat trait
composition, the downgrade hole), and `backend-qa` (the Gherkin rule violations, the
ignore-keyed-on-actor defect, the over-blocking regression, the sqlite/MySQL caveat). The
Livewire `can:` vs `permission:` finding was independently confirmed by story 0008's debate and
relayed by the coordinator.

The functional decisions this story implements were **relayed to the product-owner agent by the
coordinating agent as decisions from the human**, not observed directly from the human in this
session. A reviewer should confirm them.

**Update (later session, direct with the human).** The human reviewed and confirmed, directly
and explicitly, the following: the `users.status` default (`inactive`, not `active`) and its
conditional backfill; OQ-1 (accept the 60-minute invitation expiry); OQ-2 (normalise email to
lowercase); OQ-3 (an email change forces re-verification and reverts status to `inactive`); and
OQ-4 (the `IndexTest.php` / `IndexRenderingTest.php` / `UsersIndexTest.php` split). These specific
points no longer need reviewer confirmation — see **Resolved directly with the human (this
session)** above. The rest of the story's decisions retain the original relayed provenance
described above and still warrant a reviewer's confirmation.
