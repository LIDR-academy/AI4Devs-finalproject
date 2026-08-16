# [0003] User status & email-verification lifecycle (`users.status`, no self-activation without verification, pending email changes)

## Description
Introduce the account-state layer every later Users story builds on: the `users.status` column and
its backing enum, the **no-self-activation** invariant (no account reaches `active` *by its own
action* without its email being proven — self-registration, completing an invitation, and confirming
a pending email change all activate only through verification), and the **pending-email**
mechanism — changing an email address (one's own or another user's, in any role) never rewrites
`users.email` immediately; it parks the new address in `users.pending_email` and sends a
verification link to the **new** address, applying it only when that link is used. No Users CRUD
screen is built here — that is sibling story **0004**, which consumes everything defined below.

> **Scope of the invariant — human decision, settling the contradiction between this story and 0004.**
> This story constrains **automatic** activation only. An administrator creating a user in 0004's
> editor retains full authority over that account's initial status and **may set it to `Active` with
> the email still unverified**; that is a deliberate, authorized, audited-by-a-human act, not a
> self-activation. What is forbidden is an account activating *itself* — nobody grants themselves
> `Active` by registering, and no code path flips a status to `Active` except on proof of email
> control. The `status` column's *default* is still `inactive`, which is what governs every path that
> does not name a status explicitly (Fortify registration, the raw `ALTER TABLE` backfill).

## Type
backend | includes database-expert: **yes**

### Why this is one story and not two

`status` and `pending_email` are two columns but a single invariant: *an account's usable state is
tied to proof that its email address is controlled by its owner*. `ActivateVerifiedUser` is the one
transition point both halves converge on (Fortify's own verification, the invitation flow, and the
pending-email confirmation all end by firing `Illuminate\Auth\Events\Verified`), and the confirmation
action cannot be specified without the status transition it triggers. Splitting them would leave the
first half shipping a `status` whose activation path is defined in the second, and the second half
shipping a verification flow with nothing to activate. The scope this story deliberately does **not**
carry — the Users list, the create/edit component, `UserPolicy`, `CreateUser`/`UpdateUser`, the
invitation notification and the `users.index` route — is what moved out into **0004**.

## Gherkin
```gherkin
Feature: Account status and email-verification lifecycle

  # --- Inactive-until-verified default ---

  Scenario: A newly self-registered user starts out inactive
    Given a visitor who registers a new account
    When registration completes
    Then that user's status is "Inactive", their email not yet being verified

  Scenario: Verifying an email activates a previously inactive user
    Given a registered user whose status is "Inactive" and whose email is not yet verified
    When they verify their email address
    Then their status becomes "Active"

  Scenario: Verifying an email never reactivates a suspended user
    Given a registered user whose status is "Suspended" and whose email is not yet verified
    When they verify their email address
    Then their status remains "Suspended"

  Scenario: Verifying an email leaves an already-active user untouched
    Given a registered user whose status is "Active" and whose email is not yet verified
    When they verify their email address
    Then their status remains "Active"

  Scenario: Completing an invitation activates the invited user
    Given a registered user whose status is "Inactive" and who has not yet set a password
    When they complete the invitation flow by setting their password
    Then their status becomes "Active" and their email is recorded as verified

  Scenario: Completing an invitation never reactivates a suspended user
    Given a registered user whose status is "Suspended" and who has not yet set a password
    When they complete the invitation flow by setting their password
    Then their status remains "Suspended"

  # --- Status is not casually mass-assignable ---

  Scenario: A self-service profile update cannot change a status
    Given a registered user on their own profile settings
    When they submit a profile update that includes a status value
    Then their status is left unchanged

  # --- Pending email: requesting the change ---

  Scenario: A registered user changing their own email address does not change it yet
    Given a registered user whose status is "Active" and whose email is verified
    When they submit a new email address on their profile settings
    Then their stored email address and its verification date are unchanged,
      the new address being held as pending

  Scenario: Requesting an email change sends a verification link to the new address
    Given a registered user whose status is "Active" and whose email is verified
    When they submit a new email address on their profile settings
    Then a verification message is sent to the new address only

  Scenario: A pending email change leaves the account's status untouched
    Given a registered user whose status is "Active"
    When they submit a new email address on their profile settings
    Then their status remains "Active"

  Scenario: Changing a name alongside an email applies the name immediately
    Given a registered user on their own profile settings
    When they submit both a new name and a new email address
    Then their name is updated straight away, the email address staying pending

  Scenario: An email address is changed on a user's behalf without applying it
    Given a user administrator, with another registered user whose email is verified
    When they submit a new email address for that other user
    Then that user's stored email address is unchanged, the new address being held as pending

  Scenario: A user whose email is changed on their behalf is the one who receives the link
    Given a user administrator, with another registered user whose email is verified
    When they submit a new email address for that other user
    Then the verification message is sent to that new address, not to the administrator

  # --- Pending email: confirming the change ---

  Scenario: Using the verification link applies the pending email address
    Given a registered user with a pending email address change
    When they use the verification link sent to the new address
    Then that address becomes their stored email address and is recorded as verified

  Scenario: Applying a pending email address clears the pending address
    Given a registered user with a pending email address change
    When they use the verification link sent to the new address
    Then no pending email address remains on their account

  Scenario: Confirming a pending email activates a previously inactive user
    Given a registered user whose status is "Inactive" and who has a pending email address change
    When they use the verification link sent to the new address
    Then their status becomes "Active"

  Scenario: Confirming a pending email never reactivates a suspended user
    Given a registered user whose status is "Suspended" and who has a pending email address change
    When they use the verification link sent to the new address
    Then their status remains "Suspended"

  # --- Pending email: negative and edge cases ---

  Scenario: A verification link cannot be used twice
    Given a registered user who has already applied a pending email address change
    When they use that same verification link again
    Then the request is refused and their stored email address is unchanged

  Scenario: A tampered verification link is refused
    Given a registered user with a pending email address change
    When they use a verification link whose contents have been altered
    Then the request is refused and their stored email address is unchanged

  Scenario: An expired verification link is refused
    Given a registered user whose email-change verification link has expired
    When they use that link
    Then the request is refused and their stored email address is unchanged

  Scenario: Requesting a second email change replaces the first pending address
    Given a registered user with a pending email address change to a first new address
    When they submit a different new email address
    Then only the second address is held as pending

  Scenario: The superseded verification link stops working
    Given a registered user who replaced their pending email address with a different one
    When they use the verification link sent for the superseded address
    Then the request is refused and their stored email address is unchanged

  Scenario: A registered user cancels a pending email change
    Given a registered user with a pending email address change
    When they cancel that pending change on their profile settings
    Then no pending email address remains and their stored email address is unchanged

  Scenario: An email address already in use cannot be requested as a pending address
    Given a registered user, with another account already using "marta.ruiz@arospe.es"
    When they submit "marta.ruiz@arospe.es" as their new email address
    Then the request is rejected with a validation message and no pending address is held

  Scenario: An email address already pending for another account cannot be requested
    Given a registered user, with another account already holding "marta.ruiz@arospe.es" as pending
    When they submit "marta.ruiz@arospe.es" as their new email address
    Then the request is rejected with a validation message and no pending address is held

  Scenario: A pending address claimed by someone else in the meantime is refused on confirmation
    Given a registered user whose pending email address was claimed by another account afterwards
    When they use the verification link sent to that address
    Then the change is refused and their stored email address is unchanged

  Scenario: Submitting one's own current address is not treated as a change
    Given a registered user whose status is "Active", with no pending email address change
    When they submit their own current email address on their profile settings
    Then no pending address is held and no verification message is sent

  Scenario: Submitting one's own current address does not cancel a pending change
    Given a registered user with a pending email address change
    When they submit their own current (not the pending) email address on their profile settings, without using the Cancel control
    Then the pending email address change is left untouched and no additional verification message is sent

  Scenario: The submitted address is matched without regard to letter case
    Given a registered user whose email address is "marta.ruiz@arospe.es"
    When they submit "MARTA.RUIZ@AROSPE.ES" as their new email address
    Then no pending address is held, because it is the same address
```

## Files to create/modify

### Migration 1 — `users.status`

Shape confirmed by `database-expert`; **default revised by the human to `inactive`**.

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
  - **Default is `inactive`, not `active` — human decision.** Because the column default also governs `ALTER TABLE`'s implicit backfill, applying it blindly would flip **every existing row — including already-verified accounts and the Super Admin — to `inactive`.** The migration therefore follows the schema change with an explicit conditional `UPDATE … WHERE email_verified_at IS NOT NULL` to `active`, so only rows that were never verified inherit the raw default. This is why `up()` is two statements, not one.
  - **No index — and the reason matters.** *Not* "low selectivity": a narrow secondary index on `status` genuinely would be chosen for `COUNT(*) WHERE status = 'active'`, because the clustered index here is unusually fat (CHAR(36) PK + two TEXT columns). The real reason is **cardinality** — a backoffice `users` table is 10²–10³ rows, both queries resolve in a sub-millisecond clustered scan, and an index costs a write on every insert/update. **If one is ever added it must be composite `(deleted_at, status)`, never plain `status`**, because story **0005** puts `deleted_at IS NULL` into all three queries; that index belongs to 0005 or later, never retrofitted here.
  - **Rollback is clean and lossless** — `down()` removes exactly what `up()` added and nothing references `status` after rollback.

### Migration 2 — `users.pending_email`

- `database/migrations/<ts>_add_pending_email_to_users_table.php` — **new**.

  ```php
  public function up(): void
  {
      Schema::table('users', function (Blueprint $table): void {
          $table->string('pending_email')->nullable()->unique()->after('email');
      });
  }

  public function down(): void
  {
      Schema::table('users', function (Blueprint $table): void {
          $table->dropUnique(['pending_email']);
          $table->dropColumn('pending_email');
      });
  }
  ```

  - **Same length as `email`** (default 255) so the same address always fits both columns.
  - **`unique()` is intentional and safe.** Both MySQL and SQLite permit unlimited `NULL`s in a unique index, so the constraint only binds rows that actually hold a pending address — it makes "two accounts cannot be waiting on the same address" a database invariant rather than a validation-only one.
  - **`down()` drops the index before the column** — dropping the column first leaves MySQL to infer the index drop, which is version-dependent; being explicit keeps `migrate:rollback` deterministic.
  - **Deliberately no cross-column constraint** between `email` and `pending_email` — no portable way to express "this value must not equal any other row's `email`" in either engine. That half is enforced by validation (below) **and re-checked at confirmation time**, which is where the real race lives.

### Enum and translations

- `app/Enums/UserStatus.php` — **new**. Backed string enum, TitleCase keys: `Active = 'active'`, `Inactive = 'inactive'`, `Suspended = 'suspended'`, plus `label(): string` returning `__('users.statuses.'.$this->value)`. This is the repo's first `app/Enums/` file — a stock Laravel location (`php artisan make:enum`), not a new top-level folder, but `docs/conventions/base-standards.md`'s directory listing needs a line adding in Phase 6.
- `lang/es/users.php` + `lang/en/users.php` — **new**, three status labels each, plus the pending-email copy (notification subject/body, the profile notice, the success/refusal messages). `lang/` is a framework-standard directory (`php artisan lang:publish`), not a new base folder needing approval. Note `APP_LOCALE=en` today, so labels render English until Epic 5 adds the switcher — an accepted, documented consequence of the English-source decision, not a defect.

### Model

- `app/Models/User.php` — four changes:
  1. `@property UserStatus $status` (after `email_verified_at`, mirroring physical order) and `@property string|null $pending_email` (after `email`), plus `'status' => UserStatus::class` in `casts()`.
  2. **`#[Fillable]` stays `['name', 'email', 'password']`** — that omission *is* the mass-assignment guard for both `status` and `pending_email`. The existing `@return array<string, string>` docblock on `casts()` still satisfies Larastan 7 with an enum class-string.
  3. **A read-only lowercase accessor on `email`** — human decision, Laravel 13 attribute syntax:

     ```php
     protected function email(): Attribute
     {
         return Attribute::make(
             get: fn (string $value) => strtolower($value),
         );
     }
     ```

     > **This normalises on *read*, not on write.** It is a consistency layer for any row that could
     > carry a mixed-case address — legacy data, or a future write path outside this story's reach —
     > and it deliberately does **not** replace the normalisation-before-validation defined below.
     > Only normalising *before* `validate()` runs makes the uniqueness check see the same value that
     > will be persisted; an accessor runs far too late for that. Both layers are required.
     >
     > **Consequence every test must respect:** `$user->email` (and `$user->refresh()->email`) now
     > always returns lowercase, so an assertion on the *stored* bytes must go through
     > `$user->getRawOriginal('email')` or a direct `DB::table('users')` read. An assertion written
     > against `$user->email` cannot fail when the stored value is `MARTA@X.COM`, and would silently
     > vouch for a normalisation that never happened.
  4. `pending_email` is **not** cast and **not** hidden — it is the user's own address, and 0004's
     editor and the profile screen both need to display it.

### Factory

- `database/factories/UserFactory.php` — **modify**:
  - `'status' => UserStatus::Active` in `definition()` (matching the existing `'email_verified_at' => now()` default, so the default user is a coherent verified-and-active account).
  - New states `inactive()` and `suspended()`, in the existing `unverified()` / `withTwoFactor()` shape.
  - New state `pendingEmail(?string $email = null)` setting `pending_email`, so 0003's and 0004's tests can arrange a mid-flight change without driving the whole request.
  - **`unverified()` — explicit decision, do not leave as-is.** Today it sets only
    `email_verified_at => null`, which combined with the new `definition()` default would produce an
    `Active` **but unverified** user. That combination is **not** forbidden — story 0004 lets an
    administrator create exactly such an account deliberately — but it is the *wrong default* for a
    state named `unverified()`. **Decision: `unverified()` also sets `status => UserStatus::Inactive`**,
    for one reason: it models the **common** case. Almost every caller of `unverified()` in stories
    0003 and 0007 is arranging a self-registered or pending-email account, and those are `Inactive`
    by definition of the no-self-activation invariant. A state whose default silently contradicts the
    scenario nine times out of ten forces every one of those call sites to append the same
    `['status' => UserStatus::Inactive]` override:

    ```php
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
            'status' => UserStatus::Inactive,
        ]);
    }
    ```

    **How story 0004 constructs the admin-created `Active`-but-unverified account.** Deliberately
    and explicitly at the call site, never as a factory default:

    ```php
    // tests/Feature/Users/*.php (story 0004)
    User::factory()->unverified()->create(['status' => UserStatus::Active]);
    ```

    Spelling the override out is the point: the combination is legitimate but unusual, and it should
    be visible in the test that depends on it rather than inherited silently. If 0004 ends up needing
    it in enough places to be noisy, it may add its own named state (e.g. `adminCreated()`) — that is
    0004's call, and it does not change `unverified()`'s default here.

    Rejected alternatives, recorded so they are not reopened: (a) leaving `unverified()` untouched
    and letting each test set `status` itself — it inverts the ratio, making the majority of call
    sites (self-registration and pending-email arrangements) carry the boilerplate so the minority
    can go without; (b) making `unverified()` status-agnostic by not touching `status` at all — same
    problem, plus the state's meaning then depends on whichever `definition()` default happens to be
    in force. Note this is a *default-selection* argument, not a claim that `Active` + unverified is
    an impossible state: it is a reachable, supported state, just not the one `unverified()` means.

    **Regression surface:** every current `unverified()` caller (`EmailVerificationTest`,
    `ProfileUpdateTest`) now gets an `Inactive` user. Those tests authenticate with `actingAs()`
    rather than through the login form, so story **0007**'s sign-in block does not affect them — but
    the full suite must be run, not just the changed files.

### Activation listener and the invitation path

- `app/Listeners/ActivateVerifiedUser.php` — **new**. Listens for `Illuminate\Auth\Events\Verified`
  and, **only** when the user's current `status` is `UserStatus::Inactive`, sets it to
  `UserStatus::Active`. Never touches a `Suspended` user — verifying an email must not undo an
  administrator's suspension — and is a no-op on an already-`Active` user. Registered via
  `Event::listen(Verified::class, ActivateVerifiedUser::class)` in
  `app/Providers/AppServiceProvider::boot()` (no new provider needed).

  > This listener is the **single** activation point. Fortify's own email-verification flow, the
  > invitation flow, and this story's pending-email confirmation all reach `Active` through it,
  > rather than each re-implementing the `Inactive`-only, never-`Suspended` rule.

- `app/Actions/Fortify/ResetUserPassword.php` — **modify.** Add `'email_verified_at' => now()` to
  the existing `forceFill()` **when it is currently null**, and fire
  `Illuminate\Auth\Events\Verified` so `ActivateVerifiedUser` performs the status transition (rather
  than setting `status` here and duplicating the `Suspended` carve-out).
  **Why the `email_verified_at` write is required — the real reasons.** Fortify's reset path does not
  mark emails verified, so without this change an invitee who completed the flow would stay
  `email_verified_at = null` forever, and two concrete things break:
  1. **The status transition never happens.** `ActivateVerifiedUser` is driven by the `Verified`
     event, so an invited user would remain `Inactive` after setting their password — and once story
     **0007** lands, permanently unable to sign in. The invitation flow would provision accounts
     nobody can use.
  2. **The Super Admin bootstrap could never match them.** `RolePermissionSeeder` looks up the
     configured address with `whereNotNull('email_verified_at')` (see
     [`docs/errors-log.md`](../../../docs/errors-log.md)). An operator who provisions the Super Admin
     account by invitation would complete the invitation and still be skipped by the seeder, with no
     obvious reason why.

  > **A previous draft justified this differently and was wrong**: it claimed the invitee would be
  > bounced to `verification.notice` by the `verified` middleware. `App\Models\User` does **not**
  > implement `MustVerifyEmail` today (the import is commented out at `app/Models/User.php:5`), so
  > `EnsureEmailIsVerified` lets every user through and blocks nothing. The change is still required,
  > for the two reasons above; do not re-derive it from the middleware.

  This touches a shared Fortify action — `tests/Feature/Auth/PasswordResetTest.php` is a real
  regression surface, and a genuine
  forgot-password reset by an already-verified user must remain a no-op on both columns.

### Pending-email mechanism

This is the part that replaces the old "reset `email_verified_at` on email change" behaviour, in
**both** the self-service and the administrative direction. It exists to close the vector already
recorded in [`docs/errors-log.md`](../../../docs/errors-log.md): today
`App\Livewire\Settings\Profile::updateProfileInformation()` writes an arbitrary new address straight
into `users.email` and merely nulls `email_verified_at`, so any signed-in user can point their
account at an address they do not control — including the one an operator intends to configure as
`SUPER_ADMIN_EMAIL`. Once a *changed* address only lands in `users.email` after its link has been
used, `users.email` **plus a non-null `email_verified_at`** is proof of mailbox control — which is
precisely the pair `RolePermissionSeeder`'s `whereNotNull('email_verified_at')` lookup depends on.
(The seeder deliberately keys on both columns, not on `users.email` alone; story 0004 still lets an
administrator write an unverified initial address, and that row correctly fails the seeder's filter.)

- `app/Actions/Users/RequestEmailChange.php` — **new**, invokable.
  `__invoke(User $user, string $newEmail): void`.
  - **Step 0, before anything else: `$newEmail = Str::lower($newEmail);`.** The normalisation is the
    action's **first statement** — it happens **before** the comparison against the current address,
    **before** `pending_email` is written, and **before** `PendingEmailVerification` is constructed.
    Every subsequent step in this action, without exception, operates on the lowercased value; the
    raw argument is not used again after this line. **This ordering is not stylistic — see
    "Normalisation must happen before the hash exists" below for what silently breaks if it is done
    later.**
  - Compares the (already-lowercased) address against `$user->getRawOriginal('email')` lowercased: if
    equal, clears any pending address and returns without sending anything (the "not a change"
    scenario).
  - Otherwise writes `pending_email` — **the lowercased value** — via `forceFill(...)->save()` (the
    column is deliberately not fillable) and notifies **the new address**, not the account's current
    one:
    `Notification::route('mail', $newEmail)->notify(new PendingEmailVerification($user, $newEmail))`.
    Both the persisted column and the notification argument are the **same** lowercased string.
  - Writing `pending_email` **overwrites** any previous pending address in the same statement — that
    is what invalidates the superseded link, because the signature (below) is bound to the address.
  - **Catch the `pending_email` uniqueness collision at write time and rethrow it as a validation
    error.** `users.pending_email` is `unique`, so two concurrent requests parking the *same* address
    (two different users racing, or one user double-submitting) can reach the database and fail with a
    `QueryException` carrying SQLSTATE `23000` — after request-time validation has already passed,
    because validation and insert are not atomic. Wrap the `forceFill(...)->save()` in a
    `try`/`catch (QueryException $e)`, and when the SQLSTATE is `23000` rethrow it as a
    `ValidationException` on the **`email`** field (Laravel's `ValidationException::withMessages([...])`),
    so the caller sees the same field-level "address already in use" error the validator would have
    produced, instead of a 500. Any other SQLSTATE is rethrown untouched — swallowing unrelated
    database failures as validation errors would hide real faults.
    **This is deliberately the same pattern story 0004's `CreateUser` uses around its insert**; the two
    are symmetric on purpose (both write a unique address column that a concurrent request can claim
    first), and they must stay symmetric so a reader of either one is not surprised by the other.
  - `users.email`, `email_verified_at` and `status` are **never** written by this action.

  > **Normalisation must happen before the hash exists.** `PendingEmailVerification` builds its link
  > with `sha1($newEmail)`, and `ConfirmEmailChangeController` validates it with
  > `hash_equals(sha1($user->pending_email), $hash)`. Those two `sha1()` calls agree **only** if the
  > value hashed at send time is byte-for-byte the value stored in `pending_email` — which is
  > guaranteed by, and only by, lowercasing **once, up front**, so that a single normalised string
  > flows into both. Normalising after building the notification, or normalising the persisted column
  > but passing the raw argument to the notification (or vice versa), yields
  > `sha1('MARTA@X.COM') !== sha1('marta@x.com')` and makes **every verification link from a
  > mixed-case request fail the controller's hash check** — as a refusal redirect, not an error, so
  > nothing is logged and nothing 500s. That failure mode is invisible to any test that only ever
  > requests an already-lowercase address, which is why the hash-ordering test below exists and must
  > not be dropped.

- `app/Actions/Users/ConfirmEmailChange.php` — **new**, invokable.
  **`__invoke(User $user, string $email): bool`** — it **returns whether the change was applied**, and
  the caller is required to branch on that value. Called only from
  `App\Http\Controllers\ConfirmEmailChangeController` (below), after the signature has been validated
  by the `signed` middleware and the address has been matched against `{hash}`. It takes the resolved
  **address**, never the URL's hash segment. Inside `DB::transaction()`:
  1. Re-read the user `lockForUpdate()`; **`return false`** if `pending_email` no longer equals
     `$email` (already applied, superseded, or cancelled).
  2. Re-check the address is still free across **both** `users.email` and other rows'
     `pending_email` — someone may have claimed it between request and confirmation. **`return false`**;
     do **not** silently drop the pending value, and do **not** throw.
  3. `forceFill(['email' => $email, 'pending_email' => null, 'email_verified_at' => now()])->save()`.
  4. `event(new Verified($user))` so `ActivateVerifiedUser` applies the status transition.
  5. **`return true`.**
  - Catch `QueryException` SQLSTATE `23000` around the save and **`return false`** — the same refusal
    as branch 2 — so a lost race is a message rather than a 500.

  > **Why `bool` and not a domain exception — decided here so Phase 3 does not have to improvise it.**
  > Both branches that abort (superseded/replayed pending value, address claimed in the meantime) are
  > *expected, non-exceptional* outcomes of a link arriving late: nothing is broken, nothing needs
  > logging as a fault, and the only thing the caller does with the information is choose which flash
  > message to redirect with. A `bool` expresses exactly that, keeps the abort branches and the caught
  > `QueryException` on one single refusal path, and needs no new exception class. This story
  > introduces no domain exception type; the one exception it does throw — `ValidationException` from
  > `RequestEmailChange` (above) — is Laravel's request-boundary validation mechanism reaching a form
  > field, not a domain signal, so the two are not inconsistent. Recorded so it is not reopened: a
  > `void` signature is what made the controller unable to distinguish success from refusal in the
  > first place, and is not an option.

- `app/Notifications/PendingEmailVerification.php` — **new**, `ShouldQueue`. Builds the link with
  `URL::temporarySignedRoute('email-change.confirm', now()->addMinutes(60), ['user' => $user->id, 'hash' => sha1($newEmail)])`.
  - **The `$newEmail` it receives is already lowercased** — `RequestEmailChange` normalises as its
    first statement and hands this notification the exact string it persisted to `pending_email`. This
    class therefore neither re-normalises nor defends against a raw value; it hashes what it is given,
    and that is only correct because the caller normalises first.
  - **The `hash` parameter is load-bearing, not decoration.** It binds the link to one specific
    address. Without it, an old link would apply whatever address happens to be pending when it is
    used — so replacing a pending address would silently re-point every outstanding link at the new
    one.
    **Where a superseded link actually fails, precisely:** its own signature is still valid (the
    signature covers that URL, hash included), so it passes the `signed` middleware and is refused
    one step later by the controller's `hash_equals(sha1($user->pending_email), $hash)` check, which
    no longer matches. Do not describe a superseded link as a signature failure — a *tampered* link
    is the signature failure (403); a superseded one is the controller's refusal redirect.
  - 60 minutes matches the invitation/reset window already accepted for this epic
    (`passwords.users.expire`); no `config/auth.php` change.

- `app/Http/Controllers/ConfirmEmailChangeController.php` — **new**, invokable. Signature:
  `__invoke(User $user, string $hash): RedirectResponse`.

  ```php
  // shape, not final code — ConfirmEmailChange is appended as a trailing container-resolved
  // parameter, per the per-method action-injection convention in docs/conventions/code-style.md
  public function __invoke(User $user, string $hash, ConfirmEmailChange $confirmEmailChange): RedirectResponse
  {
      if ($user->pending_email === null || ! hash_equals(sha1($user->pending_email), $hash)) {
          return redirect()->route('profile.edit')->with('status', __('users.email_change.refused'));
      }

      if (! $confirmEmailChange($user, $user->pending_email)) {
          return redirect()->route('profile.edit')->with('status', __('users.email_change.refused'));
      }

      return redirect()->route('profile.edit')->with('status', __('users.email_change.confirmed'));
  }
  ```

  - **This is the repo's first domain controller.** `app/Http/Controllers/` today holds only the
    empty abstract `Controller.php` base — `docs/conventions/base-standards.md` describes the folder
    verbatim as *"Empty abstract base only — no domain controllers yet"*. That listing must be
    updated in Phase 6 (see the Definition of Done).
  - **The controller exists because the action cannot be routed directly.** `ConfirmEmailChange` takes
    the *address* (`__invoke(User $user, string $email)`), while the URL's second segment is `{hash}`.
    Laravel binds a non-class-typed parameter positionally against the remaining route parameters, so
    pointing the route at the action would push `{hash}` into `$email` — the equality check could
    never succeed — and a `void` return cannot produce the redirect this story requires. The
    controller is the HTTP boundary: it turns `{hash}` into a verified address, calls the action, and
    returns the redirect.
  - `hash_equals()` is the constant-time comparison. `sha1($user->pending_email)` is an
    address-binding token, not a security hash — the `signed` middleware is what authenticates the
    link; the hash is what binds it to one specific address.
  - The refusal branch (no pending address, or a hash that no longer matches because the pending
    address was replaced or cancelled) redirects with a refusal message and writes nothing. A
    *tampered* hash normally never reaches this code at all, because altering it invalidates the
    signature — this branch is the second line of defence and the one that handles replay and
    supersede.
  - **There are two refusal branches, not one, and the controller must have both.** The first is the
    pre-flight hash check above. The second is `ConfirmEmailChange` returning `false` from *inside* its
    own transaction — the pending value changed between the controller's read and the locking re-read,
    or the address was claimed by another account in the meantime, or the unique index rejected the
    save. A controller that calls the action and then unconditionally redirects with
    `users.email_change.confirmed` would tell the user their address was changed when it was not; that
    is the specific defect this branch exists to prevent.
  - **Both refusal branches flash the same `users.email_change.refused` copy, deliberately.** One
    refusal message for every "the link is no longer usable" outcome keeps the response from
    disclosing *which* check failed — in particular it does not reveal to the holder of an old link
    that the address is now taken by someone else. What matters, and what the tests assert, is that a
    refusal is never rendered with the `users.email_change.confirmed` copy, and never surfaces as a
    500.

- `routes/settings.php` — **modify.** Register the confirmation route in an **ungrouped block at the
  top level of the file, outside both the `['auth']` group and the `['auth', 'verified']` group** —
  beside the existing ungrouped `well-known.passkeys` route at the bottom, which is this file's
  precedent for a route that must not inherit `auth`:

  ```php
  // routes/settings.php — file top level, NOT inside either Route::middleware([...])->group(...)
  Route::get('settings/email/confirm/{user}/{hash}', ConfirmEmailChangeController::class)
      ->middleware(['signed', 'throttle:6,1'])
      ->name('email-change.confirm');
  ```

  **"Beside the existing settings routes" is explicitly *not* an acceptable reading.** Every
  `settings/*` route in this file sits inside a group that applies `auth`, and inheriting it would
  break the exact case this route exists for: an `Inactive` user — the user an administrator most
  often changes an address for, and who (once story **0007** lands) cannot sign in at all — would be
  bounced to the login page and could never reach the link that would activate them. The route's
  complete middleware list is `signed` + `throttle:6,1`, and nothing else.

  Registering it in `routes/web.php` instead would be equally correct and changes nothing else;
  `routes/settings.php` is chosen because both the URI prefix and the redirect target (`profile.edit`)
  live in the settings area. Whichever file is used, the route must end up free of any inherited
  `auth` middleware.

  Route-model binding on `{user}` is safe with UUID keys — `HasUuids::resolveRouteBindingQuery()`
  rejects a malformed identifier as a 404 before any query runs. That this route carries **no `auth`**
  is a closed decision with its full rationale in *Resolved directly with the human* below; it is not
  an open question.

- `app/Livewire/Settings/Profile.php` — **modify.** `updateProfileInformation()` currently does
  `fill($validated)` and nulls `email_verified_at`. New behaviour:
  - Normalise `$this->email = Str::lower($this->email)` **before** `$this->validate(...)`, so the
    uniqueness rule sees the value that will actually be stored.
  - Apply `name` immediately with `$user->fill(['name' => ...])->save()`.
  - Route the email through `RequestEmailChange` instead of writing it. **Remove** the
    `if ($user->isDirty('email')) { $user->email_verified_at = null; }` branch entirely — it is
    exactly the behaviour being replaced.
  - Add `cancelEmailChange(): void`, clearing `pending_email`.
  - Add `#[Computed] pendingEmail(): ?string` for the view.
- `resources/views/livewire/settings/profile.blade.php` — **modify**, minimally: a notice showing
  the pending address with a cancel control, and a line explaining that the current address stays in
  effect until the link is used. No redesign; this story owns only the copy the new behaviour makes
  necessary.

### Validation

- `app/Concerns/ProfileValidationRules.php` — **modify** `emailRules(?string $userId = null)` so the
  uniqueness check spans **both** columns: the address must be unused as any user's `email`
  (ignoring the record being edited) **and** not held as another user's `pending_email`. Keeping this
  in the existing shared trait means the profile screen and 0004's editor cannot drift apart — which
  is the whole reason the trait exists (`docs/conventions/code-style.md`, "Centralize shared
  validation in traits"). The `?string` signature is already UUID-correct and does not change.

### Explicitly NOT in this story

Listed so reviewers do not reopen them: `app/Livewire/Users/Index.php`, `app/Policies/UserPolicy.php`,
`app/Concerns/UserValidationRules.php`, `app/Actions/Users/CreateUser.php`,
`app/Actions/Users/UpdateUser.php`, `app/Notifications/UserInvitation.php`, the `users.index` route
(all **0004**); soft delete (**0005**); the Users view (**0006**); blocking a non-`active` user from
signing in (**0007**).

## Tests to perform

**`tests/Unit/Enums/UserStatusTest.php`** (no DB)
- [ ] Backing values are exactly `active` / `inactive` / `suspended`; `UserStatus::from('deleted')` throws.
- [ ] `label()` routes through `__()` — assert against `trans('users.statuses.active')`, **not** a literal, so this does not assert display copy Epic 5 owns.

**`tests/Unit/Models/UserTest.php`** (extend)
- [ ] `(new User)->fill(['status' => 'suspended'])` leaves the attribute unset — guards `#[Fillable]`.
- [ ] `(new User)->fill(['pending_email' => 'x@y.com'])` leaves the attribute unset — same guard, second column.
- [ ] The `email` accessor lowercases on read: a user force-filled with `MARTA@X.COM` returns `marta@x.com` from `$user->email` while `getRawOriginal('email')` still returns `MARTA@X.COM`. **This test is what proves the accessor is read-only** — without the `getRawOriginal` half it would equally pass for a write mutator, and the two layers would become indistinguishable.

**`tests/Unit/Listeners/ActivateVerifiedUserTest.php`** (new)
- [ ] An `Inactive` user with a fired `Verified` event becomes `Active`.
- [ ] A `Suspended` user with a fired `Verified` event stays `Suspended` (must never be silently reactivated).
- [ ] An already-`Active` user is a no-op.

**`tests/Feature/Settings/EmailChangeTest.php`** (new — the pending-email flow end to end)
- [ ] Requesting a change stores `pending_email`, leaves `getRawOriginal('email')`, `email_verified_at` **and** `status` untouched, and sends exactly one notification — asserted with `Notification::fake()` and `assertSentOnDemand(...)`/`assertSentTo(...)` **to the new address only**, so a regression that mails the old address fails.
- [ ] Using the link applies the address, nulls `pending_email`, sets `email_verified_at`, and dispatches `Verified` (`Event::fake([Verified::class])` in a dedicated test, since faking it would also disable the activation assertions below).
- [ ] Confirming activates an `Inactive` user and leaves a `Suspended` one suspended — the two status branches, driven through the real route, not by calling the listener.
- [ ] Replay: using the same link a second time is refused and the stored email is unchanged.
- [ ] Tamper: altering `{hash}`, `{user}`, or the signature each yields a 403 and no change — the `signed` middleware rejects these before the controller runs. **Distinguish this from the controller's own refusal branch**, which handles a *still-validly-signed* link whose address no longer matches (replay, supersede, cancel): that path is a redirect to `profile.edit` carrying a refusal message, **not** a 403. Assert the two shapes separately, or a test asserting 403 everywhere will fail against a correct implementation.
- [ ] The route is reachable **while signed out**: a guest hitting a valid link is not redirected to `login`. This is the regression test for the route accidentally being registered inside one of `routes/settings.php`'s `auth` groups — the single most likely implementation slip, and one every other test in this file would miss because they all run `actingAs()`.
- [ ] Expiry: travelling past 60 minutes (`$this->travel(61)->minutes()`) yields a 403 and no change.
- [ ] Supersede: requesting a second address replaces the pending value, and the **first** link then fails at the controller's hash check (refusal redirect, not a 403) with no change to the account — this is the case the `sha1($newEmail)` binding exists for, and the one most likely to be lost in implementation.
- [ ] Cancel: `cancelEmailChange()` clears `pending_email` and the outstanding link stops working.
- [ ] No-op: submitting the account's own current address (and the same address in a different case) stores no pending value and sends nothing.
- [ ] Uniqueness, both columns: an address already used as another user's `email`, and an address already held as another user's `pending_email`, are each rejected with a validation error and store nothing.
- [ ] **Uniqueness collision at write time (the `pending_email` unique index):** call `RequestEmailChange` **directly** — bypassing the component, and therefore bypassing request-time validation — for an address another user already holds as their `pending_email`. Assert a `ValidationException` on the **`email`** field is thrown, not a `QueryException` and not a 500, and that the acting user's own `pending_email` is unchanged. Going through the action directly is the point: the component's validator would reject the address first, so a test driven through the UI can never reach the `catch` block this asserts.
- [ ] **Race at confirmation:** arrange a pending address, then create a second user holding that address as their `email`, then use the link → refused, no change, no 500. **Assert the response too, not only the absence of an effect:** the redirect carries `users.email_change.refused` and **not** `users.email_change.confirmed`. Effect-only assertions ("the email did not change") pass just as happily against a controller that ignores the action's return value and flashes the success copy over a change that never happened — telling the user their address was updated when it was not. This is the only test that exercises the re-check inside the transaction *and* the controller's branch on its `bool` result; without it, the implementation can pass every other case while relying solely on request-time validation.
- [ ] Case handling: requesting `MARTA@X.COM` stores `marta@x.com` as pending and applies it lowercased, asserted via `getRawOriginal`.
- [ ] **Hash ordering — the link is built from the *normalised* address:** request a change to `MARTA@X.COM`, capture the `PendingEmailVerification` notification (`Notification::fake()`), and assert its link's `hash` parameter equals **`sha1('marta@x.com')`** and **not** `sha1('MARTA@X.COM')`. This is the test that fails loudly, in red, for an implementation that lowercases *after* building the notification (or that persists the lowercased value but hashes the raw argument) — an ordering slip that produces no exception and no 500, only verification links that are silently refused at the controller's `hash_equals` check for every mixed-case request. Assert the hash itself, not merely that the confirmation round-trip succeeds: a round-trip test can pass by coincidence if both sides happen to be wrong in the same direction.

**Existing files, extended**
- [ ] `tests/Feature/Settings/ProfileUpdateTest.php` — a name change still applies immediately; an email change **no longer** rewrites `users.email` nor nulls `email_verified_at` (this rewrites the existing assertion, which encodes the old behaviour — it is a deliberate change, not a break); `Livewire::test(Profile::class)->set('status', 'suspended')->call('updateProfileInformation')` leaves `users.status` unchanged.
- [ ] `tests/Feature/Auth/RegistrationTest.php` — a Fortify-registered user gets `Inactive`, not `Active`. That path never touches this story's actions and would break silently if the column default ever changed back.
- [ ] `tests/Feature/Auth/EmailVerificationTest.php` — completing Fortify's own verification flips `Inactive` → `Active` through the listener; the `unverified()` factory change lands here first.
- [ ] `tests/Feature/Auth/PasswordResetTest.php` — completing the flow verifies a previously-unverified email **and** flips `Inactive` → `Active`, never touches a `Suspended` status, and leaves an already-verified user's `email_verified_at` unchanged.

**Deliberately not tested here:** migration `up()`/`down()` mechanics (`RefreshDatabase` runs every
migration each run; `docs/testing/qa/what-not-to-test.md` excludes this, and `down()` symmetry is a
code-review item). The `status` migration's conditional backfill (`active` for already-verified rows)
is likewise not covered by a dedicated Pest test: `RefreshDatabase` always runs migrations against an
empty schema, so there is no practical way to seed a "legacy row without `status`" before `up()` runs
— verify it manually against a MySQL staging copy before deploy.

## Expected outcome
`users` carries a `status` (`VARCHAR(20)`, default `inactive`) and a nullable, unique
`pending_email`. No account reaches `active` **by its own action** without its email being proven:
self-registration starts at `inactive`, and the only automatic transition to `active` — from
Fortify's own verification, from completing an invitation, or from confirming a pending email
change — happens in exactly one place, for all three flows, and never overrides a `Suspended`
status. (An administrator creating a user in story **0004** may still choose any initial status,
including `Active` with the address not yet verified; that is an authorized act, not a
self-activation, and this story does not restrict it.) Changing an email address, from the profile
screen or on someone else's behalf, no longer rewrites `users.email`: the new address is parked as
pending, a 60-minute signed link goes to that address alone, and only using the link applies it,
verifies it, and clears the pending value. Superseding, cancelling, replaying, tampering with or
expiring a link all leave the account exactly as it was, and an address claimed by someone else in
the meantime is refused rather than half-applied.

`users.email` on its own still does **not** mean "an address this account has demonstrably
controlled" — story 0004 lets an administrator write an unverified initial address straight into that
column when creating a user. What this story guarantees is narrower and is exactly what the Super
Admin bootstrap needs: **`users.email` together with a non-null `email_verified_at`** means the
address has been proven, because no *change* to `users.email` can ever land without its own
verification link being used, and every path that sets `email_verified_at` requires proof of mailbox
control. `RolePermissionSeeder`'s `whereNotNull('email_verified_at')` lookup depends on the pair, not
on `users.email` alone, so its security property holds unchanged (see
[`docs/errors-log.md`](../../../docs/errors-log.md)).

## Acceptance criteria
- [x] `users.status` exists (`VARCHAR(20)`, non-nullable, default `inactive`), cast to `App\Enums\UserStatus`, and is **not** mass-assignable. Pre-existing rows are backfilled to `active` when already verified, `inactive` otherwise.
- [x] `users.pending_email` exists (nullable, unique) and is **not** mass-assignable.
- [x] A previously `inactive` user becomes `active` when their email is verified — via Fortify's own flow, by completing an invitation, or by confirming a pending email change — and in all three cases a `Suspended` status is never overridden. All three routes converge on `ActivateVerifiedUser`; none re-implements the rule.
- [x] Completing the invitation/reset flow marks a previously-unverified email verified, and leaves an already-verified user's `email_verified_at` untouched.
- [x] Submitting a new email address — one's own or another user's, in any role — writes only `pending_email` and sends a verification link to that address only. `users.email`, `email_verified_at` and `status` are unchanged until the link is used.
- [x] Using a valid link applies the pending address, clears `pending_email`, sets `email_verified_at`, and fires `Verified`.
- [x] `email-change.confirm` is handled by `App\Http\Controllers\ConfirmEmailChangeController` (signature `__invoke(User $user, string $hash): RedirectResponse`), which matches the hash with `hash_equals()` and then delegates to `ConfirmEmailChange`; the action itself is never routed directly. The route carries **only** `signed` + `throttle:6,1` and inherits **no** `auth` middleware — a signed-out user with a valid link reaches it.
- [x] `ConfirmEmailChange::__invoke()` returns **`bool`** — `true` only when the address was actually applied — and the controller **branches on it**: applied → the `users.email_change.confirmed` message; refused (pending value no longer matching, address claimed in the meantime, or a `23000` collision on save) → the `users.email_change.refused` message. A refusal is never reported with the confirmation copy and never surfaces as a 500.
- [x] A link is single-use, address-bound, signature-protected, and expires after 60 minutes; replayed, tampered, expired and superseded links are all refused with no change to the account.
- [x] A pending address can be cancelled, which also invalidates the outstanding link.
- [x] An address already used as another user's `email`, or already pending for another user, is rejected at validation; a `pending_email` uniqueness collision that slips past validation and reaches the database (SQLSTATE `23000`) is rethrown by `RequestEmailChange` as a `ValidationException` on the `email` field, never as a 500 — the same pattern story 0004's `CreateUser` applies to its insert. An address claimed between request and confirmation is refused inside the confirmation transaction, not half-applied.
- [x] Email is normalised to lowercase **before** validation on the profile path, and `App\Models\User` additionally exposes a read-only lowercasing accessor on `email`. The accessor is explicitly not a write mutator and does not substitute for the pre-validation normalisation.
- [x] Inside `RequestEmailChange`, lowercasing is the **first** step: the value written to `pending_email` and the value hashed into the verification link are the same normalised string, so `sha1()` at send time and `sha1()` at confirmation time always agree. A request for `MARTA@X.COM` produces a link whose `hash` is `sha1('marta@x.com')`.
- [x] `UserFactory` defaults to a coherent verified-and-active user, and `unverified()` also sets `status => Inactive` because that is the common case it models (self-registration and pending-email accounts). An `Active`-but-unverified account — legitimate when an administrator creates one in story 0004 — is constructed by an explicit override at the call site, not by this state's default.
- [x] `App\Livewire\Settings\Profile` no longer writes an unverified address into `users.email`, closing the vector recorded in `docs/errors-log.md`.

## Definition of Done
- [x] Tests written and green, plus the full existing suite (`ProfileUpdateTest`, `RegistrationTest`, `EmailVerificationTest`, `PasswordResetTest`, `tests/Feature/Settings/**`).
- [x] Code reviewed (code-reviewer).
- [x] No security findings (appsec-auditor) — specifically: the signed link's address binding, the confirmation-time re-check of address availability, throttling on the confirmation route, and that no notification is ever sent to the account's *old* address.
- [x] Documentation updated (docs-keeper) — `docs/database/schema.md` (`users.status`, `users.pending_email`), `docs/architecture/authentication.md` (the pending-email flow as a real, non-Fortify verification path, and the invitation/reset activation hook), `docs/api/routes.md` (`email-change.confirm` — note it is the first app-owned route deliberately registered *outside* the `auth` groups, with `signed` + `throttle` as its only middleware), `docs/conventions/base-standards.md`'s directory listing (`app/Enums/`, `app/Listeners/`, `app/Notifications/`, `app/Actions/Users/`, `lang/`), and `docs/errors-log.md` (the profile-email vector recorded there is now closed by this mechanism — update the entry rather than adding a new one).
- [x] Documentation updated (docs-keeper) — **`docs/conventions/base-standards.md`'s "Directory structure" entry for `app/Http/Controllers/` must be rewritten.** It currently reads *"Empty abstract base only — no domain controllers yet"*; `App\Http\Controllers\ConfirmEmailChangeController` is this repo's **first domain controller**, so that line becomes false the moment this story lands. Phase 6 must also record the convention it establishes: a controller is used where an HTTP concern (route-parameter binding, a redirect response) sits in front of an `app/Actions/` class, rather than routing the action itself.
- [x] Acceptance criteria met.

## Dependencies and related work
- **Depends on story 0002** — the seeded catalog. This story needs no permission of its own (the profile screen is self-service), but it changes the meaning of `users.email` that 0002's `SUPER_ADMIN_EMAIL` bootstrap relies on.
- **Story 0004 (Users list + create/edit — backend) depends on this one.** It consumes `UserStatus`, the cast, the `email` accessor, the factory states, and — when an administrator changes another user's address — `RequestEmailChange`. 0004 must not write `users.email` directly for an edit.
- **Story 0005 (soft delete)** obfuscates `users.email` at delete time. It must also null `pending_email` in the same `saveQuietly()`, or a deleted account keeps an outstanding link that would write a real address back onto a trashed row. Flagged there.
- **Story 0007 (non-active status blocks sign-in)** depends on this story only — the column, the enum, the factory states. It does **not** depend on 0004.
- **Browser-test infra task** — `tests/Browser/` is not wired (`phpunit.xml` declares only `Unit` and `Feature`). No browser test is written here.

## Resolved directly with the human
- **`users.status` default is `inactive`**, superseding the original Phase 1 draft's `active`. An account is `active` only once verified (or explicitly set otherwise by an administrator). The migration backfills pre-existing rows conditionally.
- **Invitation expiry** — accept the existing 60-minute window (`passwords.users.expire`); "resend invitation" is deferred to a later story. `config/auth.php` is not touched. The pending-email link reuses the same 60-minute window for consistency.
- **Email normalisation is layered**: lowercase *before* `validate()` at the component, defensive lowercase inside the actions, and a read-only lowercasing accessor on the model. The accessor is a consistency layer, not a substitute for the first.
- **An email change is never applied immediately** — self-service or administrative, any role. The new address is held as `pending_email` and applied only after its own verification link is used; `users.email` and `email_verified_at` do not move until then. This supersedes the earlier draft's "reset `email_verified_at` on an admin-initiated email change" rule, and both the Users screen and `Settings/Profile` use this one mechanism rather than two parallel implementations.
- **`UserFactory::unverified()`** also sets `status => Inactive`, because that is the common case it
  models — not because `Active` + unverified is forbidden (decision and rejected alternatives
  recorded above).
- **The invariant constrains automatic activation, not an administrator's authority.** No account
  activates *itself* without email verification (self-registration, invitation, pending-email
  confirmation). An administrator creating a user in story **0004** may set any initial status,
  including `Active` with the address unverified. This resolves the direct contradiction
  `code-reviewer` found between this story's original absolute wording and 0004's create form; 0004's
  original design stands unchanged.
- **`email-change.confirm` is `signed` + `throttle`, with no `auth` requirement.** What is being proven
  is control of the *mailbox*, and the signed, address-bound, single-use, 60-minute link proves exactly
  that. Requiring `auth` would deadlock the case an administrator most needs it for: changing the
  address of a user who is `Inactive` and therefore — once story **0007** lands — cannot sign in at
  all, so they could never reach the link that would activate them.

## Open questions

**OQ-1 — Should an administrator be notified when a pending change they requested is confirmed?**
Nothing in the PRD asks for it and this story sends nothing to the requester.
- **(recommended) No notification.** Keeps the mail surface minimal, and the Users screen (0004/0006)
  already shows the pending address, so the state is visible where an administrator would look.
- Alternative: notify the requesting administrator on confirmation. Reasonable later, but it is new
  copy plus a new notification class and belongs in its own story.

**OQ-2 — pre-existing schema debt, out of scope.** `2026_07_22_100001_*` created the `uuid` column
with `->unique()`; `2026_07_22_100005_*` renamed it to `id` and made it PRIMARY without dropping that
unique index, so `users` likely carries a redundant `users_uuid_unique` secondary index on the PK — a
wasted CHAR(36) index written on every insert. Unconfirmed (`SHOW INDEX` could not be run; the MySQL
container was not resolving). **Not this story's to fix** — worth an `errors-log.md` entry and a
follow-up task.

## Provenance
This story is the **status-and-verification half** of the original story 0003 ("Users list +
create/edit modal — backend"), split by human decision after `code-reviewer` failed that story's
Phase 2 INVEST review on **Small** (one story carrying a migration, an enum, a listener, two actions,
a notification, a policy and a seven-method Livewire component against ~45 test cases in 8 files) and
on **Independent** (it called `UserPolicy` methods attributed to a higher-numbered story). The CRUD
half became story **0004**; every story from the old 0004 onward was renumbered by one.

The original story's Phase 1 was a real three-way debate: `database-expert` (migration shape,
indexing, the `User::create()` silent-discard trap, the `after()` ordering dependency),
`backend-expert` (the Livewire authorization gap, `#[Locked]`, the unimplemented email-verification
step, the invitation-notification split, flat trait composition), and `backend-qa` (the Gherkin rule
violations, the sqlite/MySQL collation caveat). Those contributions are preserved in whichever half
they apply to.

**Human decisions carried into this rewrite** (confirmed directly, not relayed): the `inactive`
default and its conditional backfill; the 60-minute expiry; the three-layer email normalisation
including the read-only `email` accessor; and — replacing the earlier `email_verified_at`-reset rule
— the pending-email pattern applying to self-service and administrative email changes alike, placed
in this half of the split. The remaining technical detail (the signed-route shape, the confirmation
transaction, the factory-state decision, the validation-trait change) is this rewrite's own
derivation from those decisions and should be reviewed as such.
