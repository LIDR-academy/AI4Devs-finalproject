# [0015] Harden the Users CRUD backend's security posture (story 0004 follow-up)

## Description
Story 0004's Phase 4 security audit found one blocking (F1, fixed in the same story) and ten
non-blocking findings (F4–F13) in `App\Livewire\Users\Index`, `App\Actions\Users\CreateUser`,
`App\Actions\Users\UpdateUser` and `App\Notifications\UserInvitation`; its Phase 4 **re-audit** added
F17/F18. None of them is exploitable privilege escalation on its own against the seeded catalog —
that is what made deferring them from 0004 acceptable — but each is a small, well-bounded hardening
item worth closing now that this screen carries real UI traffic (story 0006) and a real roles
mechanism (stories 0008/0008a/0009/0010). This story consolidates what remains of F4–F12 plus
F17/F18 into one pass rather than nine micro-tasks. **F13 (step-up authentication) is no longer part
of this story** — it is split out as its own sibling, [0015a](../in-progress/0015a-step-up-auth-privileged-user-actions.md),
because it needs a UI affordance the Users modals do not have and is therefore fullstack, not
backend. Findings F2/F3 (name-based role matching, guard enforced only in the component) were tracked
on stories 0008/0009 and are closed. F14 was recorded as accepted-as-designed and needs no fix.

**Every finding below was re-verified against the working tree at `HEAD` (`00dd9c7`) on 2026-08-23,
by reading the real files rather than trusting this story's own earlier text.** That check is the
reason this rewrite exists: the first draft was written against story 0004's post-audit tree and
three of its findings had since been closed, half-closed, or invalidated by stories 0005–0013 — see
[What re-verification changed](#what-re-verification-changed-2026-08-23). The four files this story
touches were *created* by story 0004, but their **current contents** are stories 0005, 0006, 0008,
0008a and 0009's; there is no dependency on any of those stories' further work, only on the code they
already shipped. Phase 3 must re-locate every cited line rather than trusting a number.

### Deferred, deliberately — not silently dropped

**F18 — an administrator cannot cancel another user's in-flight pending email change.**
Verified at `HEAD`: [`RequestEmailChange`](../../../app/Actions/Users/RequestEmailChange.php) clears
`pending_email` when handed the address already on the account (lines 34–40), but
[`UpdateUser`](../../../app/Actions/Users/UpdateUser.php) only calls it when the submitted address
*differs* from the current one (lines 97–99), so that clearing branch is unreachable from the Users
screen — `App\Livewire\Settings\Profile` can reach it, this editor cannot. **Decision (human,
2026-08-23): defer.** This is a missing convenience capability, not an attack path — no data is
exposed and no guard is bypassed by its absence — and adding it is a UI-design question (what
affordance surfaces "cancel the pending change"?) that belongs to a future Users-screen pass rather
than to a backend hardening story. Recorded here so it reads as a decision rather than a dropped
finding; **not** in this story's Files to create/modify, Tests, or Acceptance criteria.

**F-C — no refused privileged attempt is logged (Phase 4 finding, `appsec-auditor`).** All three
`Log::info` calls this story adds (F5) sit after a successful mutation; every refusal —
`AuthorizationException` from `openCreateModal()`/`openEditModal()`/`confirmDelete()`/`save()`, and
either action's rate-limit `ValidationException` — logs nothing, so repeated probing of an
Administrator-holding target by an actor lacking `roles.manage-administrators` leaves no trace.
**Decision (human, 2026-08-24): defer.** The identical gap exists on `App\Livewire\Roles\Index`,
which this story does not touch; closing it only here would leave the same hole on that screen, and
this is better addressed as a cross-cutting audit-logging pass covering both admin screens at once
than as a one-off addition buried in a Users-only hardening story. Recorded so it reads as a decision
rather than an overlooked finding; **not** in this story's Files to create/modify, Tests, or
Acceptance criteria.

## Type
backend | includes database-expert: no

## Gherkin
```gherkin
Feature: Users CRUD backend hardening

  Scenario: A client cannot overwrite the server-derived users list
    Given a user administrator viewing the Users screen
    When a forged Livewire payload attempts to set the users list property directly
    Then the property update is rejected, mirroring the existing #[Locked] guard on editingUserId

  Scenario: Opening the create form is itself authorized
    Given a signed-in user who holds users.view but not users.create
    When they call the create-form opener directly
    Then the action is denied server-side, not merely hidden in the UI

  Scenario: Opening the edit form is itself authorized
    Given a signed-in user who holds users.view but not users.edit
    When they call the edit-form opener directly against another user
    Then the action is denied server-side, not merely hidden in the UI

  Scenario: Opening the edit form discloses no Administrator's sensitive fields to an unprivileged actor
    Given a user administrator holding users.edit but not the administrator-management permission
    When they call the edit-form opener against another user holding the Administrator role
    Then the action is denied server-side before that target's status or pending email is copied into component state

  Scenario: Opening the delete confirmation is itself authorized
    Given a signed-in user who holds users.view but not users.delete
    When they call the delete-confirmation opener directly against another user
    Then the action is denied server-side, not merely hidden in the UI

  Scenario: A forged status value is rejected as a validation error, not a server error
    Given a user administrator with an open edit form
    When they submit a status value outside the allowed set
    Then the request is rejected with a validation message on the status field, not an unhandled error

  Scenario: Creating users repeatedly is rate limited
    Given a user administrator who holds users.create
    When they submit an eleventh create request within one hour
    Then the request is rejected with a validation message and no further invitation is sent

  Scenario: Creating a user never queues the invitation's password-set token
    Given a user administrator who holds users.create
    When they create a new user
    Then the invitation is sent without being placed on the queue, so its token never reaches the jobs table

  Scenario: One administrator cannot exhaust another user's own email-change allowance
    Given a user administrator who has already requested the maximum email changes for a target user
    When that target user requests a change of their own email address
    Then their request is accepted, because the allowance is scoped to the requesting actor

  Scenario: A target user's inbox is still protected from repeated email-change mail
    Given several user administrators requesting email changes for the same target user
    When their combined requests exceed the per-target hourly ceiling
    Then further requests are rejected with a validation message and no further mail is sent

  Scenario: A partially applied edit is not possible
    Given a user administrator changing another user's name and email together
    When the email change is refused by its own throttle
    Then the name change is not persisted either

  Scenario: A refused edit sends no verification mail
    Given a user administrator changing another user's name and email together
    When the edit is refused after the email verification step would have run
    Then no verification message is sent for the change that was rolled back

  Scenario: A user administrator cannot delete their own account through the Users screen
    Given a user administrator who holds users.delete directly and whose own row holds no privileged role
    When they confirm deletion of their own account
    Then the action is a no-op and the account still exists

  Scenario: A Super Admin cannot delete their own account through the Users screen
    Given a Super Admin acting on their own row
    When they confirm deletion of their own account
    Then the action is a no-op and the account still exists

  Scenario: An Administrator is refused before reaching the self-delete no-op
    Given a user administrator whose own row holds the Administrator role
    When they attempt to confirm deletion of their own account
    Then the attempt is refused for lacking the administrator-management permission, the same refusal any other Administrator-holding target receives

  Scenario: Changing one's own email never requires the administrator-management permission
    Given a user administrator holding users.edit but not the administrator-management permission,
      who themselves hold the Administrator role
    When they change their own email address
    Then the change is accepted and held as pending

  Scenario: Creating a user leaves an audit trail
    Given a user administrator who creates another user
    When the creation completes
    Then a structured log entry records the actor, the target, and the role and status assigned,
      without the generated password or the invitation token

  Scenario: Editing a user leaves an audit trail
    Given a user administrator who changes another user's role and status
    When the edit completes
    Then a structured log entry records the actor, the target, the before and after role and status,
      and whether an email change was requested, without any email-change verification token

  Scenario: Deleting a user leaves an audit trail
    Given a user administrator who deletes another user
    When the deletion completes
    Then a structured log entry records the actor and the target
```

## Files to create/modify

Line numbers are the **verified** `HEAD` (`00dd9c7`) ones as of 2026-08-23 and are a reading aid only —
Phase 3 must re-locate each site.

---

### F4 — lock the one remaining server-derived Livewire property (`app/Livewire/Users/Index.php`)

**Half of this finding is already closed and must not be re-implemented.** `$deletingUserName` is
**already** `#[Locked]` at [`Index.php:77-78`](../../../app/Livewire/Users/Index.php), alongside
`$editingUserId` (41–42), `$editingPendingEmail` (44–45) and `$deletingUserId` (47–48). The only
unlocked server-derived property left is:

```php
// app/Livewire/Users/Index.php:36-39 — add #[Locked] above this
/**
 * @var array<int, array{id: string, name: string, ...}>
 */
public array $users = [];
```

Add `#[Locked]`, matching `app/Livewire/Settings/Security.php`'s `#[Locked] public array $passkeys`.

> **This change breaks two existing tests, and both are part of this story's scope.**
>
> 1. [`tests/Feature/Users/IndexTest.php:199`](../../../tests/Feature/Users/IndexTest.php) reads
>    `$component = Livewire::test(Index::class)->set('users', []);` — a `set()` against a `#[Locked]`
>    property raises `Livewire\Exceptions\CannotUpdateLockedPropertyException`. That `set('users', [])`
>    exists only to prove `usersSummary()` computes from its own query rather than from the `$users`
>    array; the property assignment is incidental to what the test asserts. Rewrite the test to prove
>    the same thing without writing the property — the shape to prefer is asserting `usersSummary()`
>    against database state that `$users` could not have supplied. Do **not** delete the test, and do
>    **not** weaken it to a smoke check: the independence it pins is real coverage.
> 2. [`tests/Feature/Users/IndexRenderingTest.php:114-116`](../../../tests/Feature/Users/IndexRenderingTest.php)
>    ("the empty state renders when there are no users to display") reads
>    `Livewire::test(Index::class)->set('users', [])->assertSee('No users found.');`. Here the property
>    write is **not** incidental — it is the test's only mechanism, and its own comment records why: with
>    `actingAs()` set, `loadUsers()` always finds at least the acting administrator's own row, so the
>    empty-state branch has no reachable sign-in journey to exercise it through, and forcing `$users`
>    empty directly is deliberate. Locking the property removes that mechanism. **The constraint, not a
>    prescribed implementation:** the empty-state branch must remain pinned — `assertSee('No users
>    found.')` must still be reachable and must still fail if the branch is removed — without writing
>    `$users` directly. One avenue: `loadUsers()` runs a bare `User::query()`, so the `SoftDeletingScope`
>    is the only mechanism already in the codebase that can empty the result set for an authenticated
>    actor (e.g. soft-deleting every seeded user except one who is then excluded some other way, or
>    asserting the empty-state markup directly against a component instance constructed to skip
>    `loadUsers()`). Phase 3 chooses the mechanism and records which one and why in the implementation
>    notes — the same latitude F10 is given below. Do **not** delete this test or weaken it to a smoke
>    check.

---

### F5 — structured audit logging (`app/Livewire/Users/Index.php`)

Log a structured event for each privileged outcome: user created, user edited, user deleted. Never
log the generated password (`CreateUser` line 73), the invitation token (line 83), or the
email-change verification hash.

**Follow the shipped sibling precedent, not the seeder's.** This story's first draft said to match
`RolePermissionSeeder`'s `Log::warning`-for-privileged convention. That is the wrong precedent now:
[`app/Livewire/Roles/Index.php:244`](../../../app/Livewire/Roles/Index.php) and `:335` are the *same
kind of screen* — a permission-gated admin CRUD Livewire component — and they ship this exact shape,
`Log::info` for every outcome including deletes:

```php
// app/Livewire/Roles/Index.php:242-250 — the shape to mirror
// Audit trail (Phase 4 finding F8) -- this app has no dedicated
// audit-log table; a structured log line is the minimum trace for
// the highest-value mutation this screen performs.
Log::info('Role saved', [
    'actor_id' => Auth::id(),
    'role_id' => $role->id,
    'role_name' => $role->name,
    'permissions_granted' => array_values(array_diff($permissionNames, $beforePermissionNames)),
    'permissions_revoked' => array_values(array_diff($beforePermissionNames, $permissionNames)),
]);
```

So: `Log::info('User created', […])`, `Log::info('User updated', […])`, `Log::info('User deleted',
[…])`, each carrying `actor_id` (via `Auth::id()`), `user_id`, and — for the update path — the
before/after `role` and `status`. Two screens logging the same class of event at two different levels
is drift nobody will notice until someone filters a log by level.

**The "before" values must be captured before the write.** The update path runs through
`App\Actions\Users\UpdateUser`, which mutates and saves the model; reading `$target->status` after
`save()` returns the new value. Capture the before-state in `updateExistingUser()` **above** the
`$updateUser(...)` call, from `getRawOriginal('status')` and the loaded roles relation, for the same
reason `Roles\Index` captures `$beforePermissionNames` before its own sync.

---

### F6 — rate-limit user creation, and stop one actor burning another user's email-change allowance

**Part 1 — `app/Actions/Users/CreateUser.php`. Decided (Q3): 10 per hour, keyed on the acting user.**
Add a `RateLimiter::attempt()` guard mirroring `RequestEmailChange`'s existing pattern exactly (same
facade, same `ValidationException` conversion), keyed on `Auth::id()`, `maxAttempts: 10`,
`decaySeconds: 3600`. It belongs in the action (not the component), per
[base-standards.md](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers) —
a rate limit protecting an operation is a property of the operation. Place it **after**
`Gate::authorize('create', User::class)` (line 41) and **before** the `DB::transaction()` (line 63),
so an unauthorized caller is refused without consuming quota and no refused attempt opens a
transaction. Convert a refusal to `ValidationException::withMessages(['email' => …])` with a new
`users.create.throttled` key added to **both** `lang/en/users.php` and `lang/es/users.php`.

**Part 2 — `app/Actions/Users/RequestEmailChange.php`. Verified, and a real problem.** Line 49 reads:

```php
// app/Actions/Users/RequestEmailChange.php:49 — the current key, target-scoped only
$key = 'email-change:'.$user->getKey();
```

with `maxAttempts: 3, decaySeconds: 3600` on line 51. Because the key names only the **target**, and
story 0004 added a second, *cross-user* call site (an administrator editing someone else's row), an
administrator can consume a victim's own three-per-hour allowance and leave the victim unable to
change their own address. Keying purely on the target was correct when `App\Livewire\Settings\Profile`
was the only caller and target ≡ actor; it stopped being correct the moment a second caller existed.

**The fix is both halves together — a composite key *and* a second aggregate limiter.** Neither alone
is sufficient, and this is worth stating so Phase 3 does not implement half of it:

- A composite `(target, actor)` key alone fixes the quota-burn but **removes the inbox-flood ceiling**
  — N administrators would each get their own 3/hour against one victim's inbox.
- A second actor-scoped limiter layered on the unchanged target-scoped one alone keeps the ceiling but
  **does not fix the quota-burn at all** — the victim's target-scoped 3 is still consumable by an
  administrator.

```php
// Both checks run; either refusal is the same ValidationException on `email`.
$actorKey = Auth::id() ?? 'unauthenticated';

// (1) Per (target, actor): the existing 3/hour allowance, now un-burnable across actors,
//     so a target always retains their own three regardless of administrator activity.
$key = 'email-change:'.$user->getKey().':'.$actorKey;

// (2) Per target, aggregate: preserves the inbox-flood ceiling that the old
//     target-only key provided once (1) stops being a global cap.
$aggregateKey = 'email-change-target:'.$user->getKey();
```

- **(1) keeps `maxAttempts: 3, decaySeconds: 3600`** — the currently shipped, unchanged allowance.
- **(2) is `maxAttempts: 10, decaySeconds: 3600`.** This figure is chosen to match Q3's decided
  administrator-action ceiling rather than invented independently: it is the same "one order of
  magnitude above a single user's own allowance, scaled for a legitimate bulk-administration
  workflow" reasoning. It is a tunable — the security property (a victim's own allowance is not
  consumable by anyone else, and their inbox still has a ceiling) holds at any value ≥ 3, so a
  different number is a configuration change, not a redesign.
- **`Auth::id()` may be `null`** (this action has no `Gate` check of its own and is reachable from a
  session-less context). Falling back to a fixed `'unauthenticated'` segment is deliberate: it groups
  every unauthenticated caller into one bucket, which is the fail-*closed* direction. Do not fall back
  to `$user->getKey()`, which would silently restore the current burnable behaviour.
- **Ordering: check (1) first, then (2).** Both use `RateLimiter::attempt()`, which *consumes* on
  success, so checking the wider limiter first would burn aggregate quota on a request the narrower
  one is about to refuse.
- **One accepted asymmetry:** when (1) passes and (2) then refuses, (1) has already consumed one of
  the acting administrator's own three (target, actor) attempts, even though the request as a whole
  was refused. This is fail-*closed* and harmless (the actor loses part of their own allowance, never
  the target's), and is recorded here so Phase 4 does not raise it as a new finding.
- The existing "throttled here, not at the Livewire call site" docblock (lines 42–48) stays and gains
  the actor-scoping rationale.

---

### F7 — authorize the disclosure paths, not only the mutating ones (`app/Livewire/Users/Index.php`)

Verified at `HEAD`: `openCreateModal()` (98), `openEditModal()` (113) and `confirmDelete()` (180) each
perform **no** authorization. `openEditModal()` in particular copies the target's `pending_email`
(120) and `status` (124) into public component state — the two attributes `UserPolicy` itself
classifies as sensitive.

- **`openCreateModal()`** — `Gate::authorize('create', User::class)` as the first statement.
- **`confirmDelete(string $userId)`** — `Gate::authorize('delete', $target)` immediately after
  `User::findOrFail($userId)`, before any assignment to `$deletingUserId` / `$deletingUserName`.
- **`openEditModal(string $userId)`** — **except for the actor's own row** (see the self-row exemption
  below), `Gate::authorize('updateSensitiveAttributes', $target)`, immediately after
  `User::findOrFail($userId)`.

> **`updateSensitiveAttributes` for any *other* target, unconditionally — with no tier check in the
> component.** An earlier draft of this finding said "when `$target` holds the `Administrator` role,
> use `updateSensitiveAttributes` instead of plain `update`". That is the wrong shape for an *other*
> target: it asks the Livewire component to re-derive tier membership, which is exactly the pattern
> story 0008a removed from this very component (`administratorRoleId()` and `authorizeRoleChange()`
> were **deleted**, not relocated — see
> [base-standards.md](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
> and [security/livewire-authorization.md](../../../docs/security/livewire-authorization.md)).
> No branch is needed there, because the policy already contains it —
> verified at [`app/Policies/UserPolicy.php:56-67`](../../../app/Policies/UserPolicy.php):
> `updateSensitiveAttributes()` delegates to `update()` first, then returns `true` outright for any
> target that does not hold the Administrator role. So the unconditional call is *identical* to
> `update` for an ordinary target and strictly stronger for an Administrator-holding one.

> **The self-row exemption, and why it is an identity check, not a reintroduced tier check.**
> **Human decision, 2026-08-23 (resolving Phase 2 finding F-A): an administrator may always open and
> edit their own row** (name, email) **— what they may never do is change their own role or status.**
> That second half is *already* true today and is untouched by this finding: `UpdateUser`'s
> `$isSelfEdit` branch (verified at [`UpdateUser.php:73-92`](../../../app/Actions/Users/UpdateUser.php))
> never calls `authorizeRoleAndStatusChange()` and never applies a submitted role/status for a
> self-edit — `IndexTest.php:670`/`:687` already pin the silent-ignore behaviour. So `openEditModal()`
> gates as:
> ```php
> if (! $target->is(Auth::user())) {
>     Gate::authorize('updateSensitiveAttributes', $target);
> }
> ```
> This is **not** the tier-derivation pattern 0008a removed — it checks *identity* (`is this my own
> row?`), not *role membership* (`does this row hold Administrator?`), and it mirrors the identity
> check `UpdateUser` already performs for the identical reason at the action layer. `pending_email` and
> `status` are not sensitive when disclosed to the row's own owner — they are that user's own data,
> already visible to them via `settings/profile`. **One accepted side effect, recorded so Phase 4 does
> not raise it as a new finding:** the exemption short-circuits the whole gate for the actor's own row,
> so an actor holding only `users.view` (not `users.edit`) can technically open their **own** edit
> modal via `openEditModal()`. This is not a regression — `openEditModal()` performs **no** check at
> all today — and it grants no write: `save()`'s own `Gate::authorize('update', …)` and `UpdateUser`'s
> own authorization still refuse any actual change.

**Four consequences of this gate, all real and all in this story's scope.** They are named here
because the change narrows a capability that ships today, and a silent narrowing is how a "hardening"
story turns into an unexplained regression:

1. **An actor holding `users.edit` but not `roles.manage-administrators` can no longer open an
   Administrator-holding *other* target's edit modal at all** — so they can no longer rename one.
   Today they can: the rename succeeds, and only a status/email/role change is refused. **Human
   decision confirmed 2026-08-23: proceed with this narrowing for any target that is not the actor's
   own row** — the modal's disclosure of another user's `pending_email`/`status` before any save
   attempt is itself the problem, and reopening a per-tier branch in the component to preserve
   rename-only access there would reintroduce the pattern story 0008a deliberately removed. It breaks
   [`tests/Feature/Users/IndexTest.php:982`](../../../tests/Feature/Users/IndexTest.php) ("saving an
   existing Administrator without changing their role … succeeds without the stricter permission"),
   which must be rewritten to assert the new refusal at `openEditModal` — a **deliberate,
   story-scoped test change**, recorded as such rather than quietly amended.
2. **An Administrator actor's own row is unaffected**, per the self-row exemption above — they keep
   opening and renaming/re-emailing their own row exactly as today, and the story's existing Gherkin
   scenario "Changing one's own email never requires the administrator-management permission" (line
   122) stays literally true, including through the Users editor and not only through `UpdateUser`
   directly.
3. **`loadUsers()`'s `canEdit` must mirror the same exemption, using the same identity idiom.** Line
   312 currently reads `'canEdit' => Gate::allows('update', $user)`; it becomes
   `$user->is(Auth::user()) || Gate::allows('updateSensitiveAttributes', $user)` — the same
   `->is(Auth::user())` check `openEditModal()` uses, not a re-derivation against a row-array id field
   (`$user` here is the `User` model instance `loadUsers()`'s query yields, before it is mapped into
   the row-array shape returned to the view, so `->is()` is directly available). One rule, one idiom,
   two call sites. Note `Illuminate\Support\Facades\Auth` is not currently imported in
   `app/Livewire/Users/Index.php` and must be added. Otherwise the row action renders disabled for the
   actor's own row despite `openEditModal()` accepting it, or renders enabled and 403s on click for
   another Administrator-holding target the actor lacks the stricter permission for. The
   `Gate::allows()`-is-a-UI-hint rule requires the hint to reuse *the same rule* the guarded call
   authorizes against — see
   [architecture/authorization.md](../../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer).
   This changes `IndexTest.php:110-112`, which asserts `canEdit->toBeTrue()` for an
   Administrator-holding target viewed by an actor lacking the stricter permission — that assertion's
   fixture is an *other* target, so it becomes `toBeFalse()` unchanged by the self-row exemption; a
   **new** assertion is added for the self-row case, which stays `toBeTrue()`. One existing test's
   *name* goes stale without failing and needs no amendment: `IndexTest.php:119` ("an actor without
   users.edit or users.delete sees every row as not editable and not deletable") asserts only on the
   *target's* row, so it keeps passing — but under this exemption that viewer's own row now has
   `canEdit => true`, making the name inaccurate. Left alone deliberately, recorded here so it is not
   mistaken for a regression at Phase 5.
4. **The pre-existing, accepted Super Admin drift is unchanged by this** (a Super Admin actor viewing
   a Super Admin-holding target sees an enabled row that `UpdateUser` refuses on click). Do not try to
   close it here; it belongs to the `Gate::before` bypass and is documented as accepted.

---

### F8 — a forged `status` must fail validation, not raise `\ValueError` (`app/Livewire/Users/Index.php`)

**Read this whole bullet before touching the property — the obvious fix reopens a documented bug.**

The property today is, verified at [`Index.php:66-73`](../../../app/Livewire/Users/Index.php):

```php
/**
 * Defaults to `Inactive` (matching `users.status`'s own column default) rather than a
 * nullable "unset" state, for the same reason `$roleId` above is a plain string and not
 * `?string`: assigning a JS `null` into the status `<select>` corrupts its native
 * selection state, so this property must never actually be null while bound via wire:model.
 */
public UserStatus $status = UserStatus::Inactive;
```

That non-nullability is **deliberate and load-bearing**, established by
[`docs/errors-log.md` — "A `null` Livewire property bound to a native `<select>` silently dropped the
user's own pick"](../../../docs/errors-log.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16).
This story's first draft said to retype it to `public ?UserStatus $status` → `public ?string $status`.
**That instruction was wrong and is withdrawn**: the nullable retype reintroduces exactly that bug,
in which a user's first-option pick is silently discarded with the correct value still displayed.

**The finding itself is nonetheless real**, verified in the installed vendor source
(`vendor/livewire/livewire/src/Mechanisms/HandleComponents/Synthesizers/EnumSynth.php`):

```php
static function hydrateFromType($type, $value) {
    if ($value === '') return null;

    return $type::from($value);   // \ValueError for any unknown backing value
}
```

A forged `status` therefore raises `\ValueError` during **hydration** — before `save()` runs, and so
before `statusRules()`'s `Rule::enum(UserStatus::class)` ever gets a chance to reject it. (The empty
string is a second hazard on the same line: it hydrates to `null`, which a non-nullable typed property
refuses with a `TypeError`.)

**The only acceptable retype, per B3:**

```php
public string $status = UserStatus::Inactive->value;
```

Never nullable; the default is a real backing value, not `''`. This is the identical shape `$roleId`
already uses one property above, and it is what lets `Rule::enum(UserStatus::class)` do its job:
a forged value hydrates as a plain string and fails validation on the `status` field.

**No Blade change is required** — verified: `resources/views/livewire/users.blade.php:171-175` already
renders `<flux:select.option value="{{ $statusOption->value }}">`, i.e. the backing string, so the
bound value type is already what the DOM emits.

**Call sites inside the component that must change:**

- `openEditModal()` (124): `$this->status = $target->status;` → `$target->status->value`.
- `createNewUser()` / `updateExistingUser()` (335, 358): both pass `$validated['status']` straight to
  actions typed `UserStatus $status`. Hydrate once, at the boundary:
  `UserStatus::from((string) $validated['status'])`. **Do not** relax the actions' parameter types —
  `CreateUser` and `UpdateUser` taking a real enum is correct and unrelated to the transport problem.
- `openCreateModal()` / `closeModal()` `reset(['…', 'status'])` (100, 174) — `reset()` restores the
  property's declared default, so these keep working unchanged; confirm rather than assume.

> **Correction to a false claim in this story's first draft.** It asserted that
> `tests/Feature/Users/IndexTest.php` carries "a status outside the allowed set" dataset row which
> "today substitutes `null` with a comment acknowledging the raw value cannot survive". **No such row
> exists.** The real dataset (`IndexTest.php:317-323`) is exactly five rows: `a blank name`,
> `a malformed email address`, `no role chosen`, `a role that does not exist`, `the Super Admin role`.
> The forged-status case has **never** been covered, so this story adds it rather than fixing it.

> **Blast radius — this is the widest change in the story and it is entirely in tests.** Verified by
> grep: `set('status', …)` / `assertSet('status', …)` appears **22 times across four files** —
> `tests/Feature/Users/IndexTest.php` (15), `CreateUserTest.php` (4), `IndexRoleOptionsTest.php` (2),
> `IndexRenderingTest.php` (1). Every one currently passes a `UserStatus` **case**; against a `string`
> property that is a `TypeError`, so each becomes `UserStatus::Active->value` (and
> `IndexTest.php:291`'s `assertSet('status', UserStatus::Inactive)` becomes
> `UserStatus::Inactive->value`). Two files are **not** affected and must not be "fixed":
> `tests/Feature/Settings/ProfileUpdateTest.php:61` targets a different component
> (`App\Livewire\Settings\Profile`) and asserts that no such property exists there; and
> `tests/Browser/UsersIndexTest.php:130` drives the real `<select>` by visible label (`->select('status',
> 'Active')`), which is independent of the server-side property type. Note also that the `$users` row
> shape (`'status' => $user->status`, line 311) is a **different** value and stays a `UserStatus`
> instance — `IndexTest.php`'s row-shape assertions at lines 59–79 are unaffected.

---

### F9 — do not queue a plaintext password-set token (`app/Notifications/UserInvitation.php`)

**Decided (Q1): drop `ShouldQueue`.** Verified at `HEAD`, line 11:
`class UserInvitation extends Notification implements ShouldQueue`, with `use Queueable,
SerializesModels;` on line 13. The constructor takes `public string $token` (line 26) — a
`Password::broker()` token, minted by `CreateUser` at line 83 — so while the notification is queued,
that token is serialized in plaintext into a `jobs` table row (`QUEUE_CONNECTION=database`).

Remove `implements ShouldQueue` and its `use Illuminate\Contracts\Queue\ShouldQueue;` import, so the
notification sends synchronously, matching Fortify's own `ResetPassword`. `Queueable` /
`SerializesModels` may stay — neither causes queuing without the interface — but if Larastan or Pint
flags an unused trait, removing `Queueable` is acceptable; `SerializesModels` must stay, because
`$notifiable` is a model.

No functional change for the operator: account creation is already an administrator-initiated,
non-realtime action. Note `CreateUser`'s `DB::afterCommit()` wrapper (line 82) is **unrelated** and
must not be removed — it exists so a `syncRoles()` failure cannot leave an invitation already sent
against a rolled-back user, and it keeps working identically for a synchronous send.

---

### F10 — a refused email change must not leave a partially applied edit (`app/Actions/Users/UpdateUser.php`)

**Half of this finding is closed; the half that matters is not.** Story 0008a **already added** the
`DB::transaction()` this finding asked for — verified at
[`UpdateUser.php:79-93`](../../../app/Actions/Users/UpdateUser.php), wrapping `fill()` / `save()` /
`syncRoles()`. But the atomicity goal it was added for is **not** achieved, because the delegation to
`RequestEmailChange` runs *after* the transaction has already committed:

```php
// app/Actions/Users/UpdateUser.php:79-99 — verified current ordering
DB::transaction(function () use (...): void {
    $user->fill(['name' => $name]);
    if (! $isSelfEdit) { $user->status = $status; }
    $user->save();
    if (! $isSelfEdit) { $user->syncRoles([(int) $roleId]); }
});                                     // <-- COMMIT happens here

$currentEmail = Str::lower((string) $user->getRawOriginal('email'));

if ($email !== $currentEmail) {
    $requestEmailChange($user, $email);  // <-- throws AFTER the commit
}
```

So a `RequestEmailChange` refusal — its throttle (`ValidationException`, line 52) or its
`pending_email` uniqueness collision (line 61) — still leaves the name, status and role changes
persisted while the operator sees a validation error. That is exactly the partially-applied edit the
Gherkin scenario forbids, and it is live today.

**What Phase 3 must achieve, and the one constraint on how:**

- **Required outcome:** when `RequestEmailChange` refuses, the target's `name`, `status` and role are
  all unchanged.
- **Hard constraint:** **no verification mail may be sent for a write that is then rolled back.**
  `RequestEmailChange` ends with a `Notification::route('mail', …)->notify(…)` (lines 69–70), which
  is *not* a transactional side effect. Naïvely moving the `$requestEmailChange(...)` call inside the
  existing `DB::transaction()` closure satisfies the required outcome but violates this constraint,
  and it is the precise shape
  [`docs/errors-log.md` — "Wrapping existing code in a `DB::transaction()` moved a cache flush nobody
  had written"](../../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21)
  warns about: a wrapper relocates every side effect of the wrapped code, including the ones the diff
  does not show. Read that entry before choosing a shape.
- **Recommended shape:** run the email-change delegation **after `authorizeRoleAndStatusChange()` and
  before the transaction** — not merely "before the transaction" read loosely, which could be
  misread as "anywhere above line 79" including above the sensitive-attribute check. Placing it above
  `authorizeRoleAndStatusChange()` would let an email change be parked and mailed before that
  check runs at all, for an actor who may not even be allowed to touch the target's sensitive
  attributes. So both refusal paths throw before any name/status/role write occurs, the notification
  still fires outside any open transaction, and the authorization check always runs first. The
  residual this leaves is strictly smaller and strictly less harmful than today's: a later failure
  inside the transaction would leave a `pending_email` parked with no other change applied — a
  reversible, non-privileged state that the target's own confirmation link governs, versus today's
  silently-persisted role and status writes.
- If Phase 3 finds a reason the recommended shape does not hold (for example, an ordering dependency
  on the freshly-saved row), it may choose another — but it must satisfy both the outcome and the
  constraint, and record which shape it chose and why in the implementation notes.
- **The authorization ordering must not move.** `$user->load('roles')` (63),
  `Gate::authorize('update', $user)` (65) and `authorizeRoleAndStatusChange()` (76) all run above
  every write today and must continue to — re-audit findings N1/N2 depend on that exact ordering, and
  a check inside a retried transaction is a check that can run more than once per request.

---

### F11 — self-delete guard (`app/Livewire/Users/Index.php`)

`deleteUser()` (201) resolves the target (202), authorizes (204) and deletes (206) with no self-check.
`UserPolicy::delete()` has none either — verified at
[`UserPolicy.php:113-129`](../../../app/Policies/UserPolicy.php), and a **Super Admin actor bypasses that
policy entirely** via `Gate::before`, so nothing stops a Super Admin actor, or any actor whose own row
`UserPolicy::delete()` would otherwise allow, from deleting their own account from this screen.

Return early — a silent no-op, no error — when `$target->is(Auth::user())`, placed **after**
`findOrFail()` and **before** `Gate::authorize('delete', $target)`. This mirrors the established
"silently ignored" precedent for a self-targeting role/status change (`UpdateUser`'s `$isSelfEdit`
branch, and `IndexTest.php:670`/`:687`, which pin that exact silence as intended behaviour).

**`canDelete` is unchanged by this finding.** It continues to mirror `UserPolicy::delete()` exactly as
today — which already resolves `false` for an actor whose own row holds `Administrator` (the same
branch `IndexTest.php:110-112` pins for an *other* Administrator-holding target: the actor lacks
`roles.manage-administrators`, so the policy refuses regardless of whose row is being evaluated), and
`true` for a Super Admin actor or a non-`Administrator` actor holding `users.delete` directly. Do
**not** add a self-rule to `UserPolicy::delete()`: a `Gate`-mediated rule is undone by a Super Admin
actor's own `Gate::before` bypass, which is the whole reason this guard lives in the component — the
same reasoning `UpdateUser`'s direct-throw Super Admin refusal already records at lines 120–123.

> **Interaction with F7, and a decision this story makes explicitly: `confirmDelete()`'s new gate does
> *not* get a self-row exemption.** `$deletingUserId` is `#[Locked]` (47–48) and `deleteUser()` (201)
> reads only that property, so `deleteUser()` is reachable **only** through `confirmDelete()` — F7's
> unconditional `Gate::authorize('delete', $target)` there always runs before this self-delete no-op
> ever gets a chance to fire. Consequence: **for an actor whose own row holds `Administrator`, deleting
> themselves is refused at `confirmDelete()` with `AuthorizationException`, not silently no-op'd** —
> the same rule that already blocks them from deleting any *other* Administrator-holding user (they
> lack `roles.manage-administrators`) applies equally to their own row, and F7's gate simply makes that
> refusal fire one call earlier than it used to. This is a **stricter, accepted outcome, not a
> regression**: unlike `openEditModal()`, `confirmDelete()`'s gate protects an irreversible action, not
> a disclosure, so there is no case for exempting "my own row" from it the way `openEditModal()` does.
> **This finding's silent no-op is therefore observable only for an actor `UserPolicy::delete()` would
> otherwise allow to delete their own row** — a Super Admin (via `Gate::before`) or a non-`Administrator`
> actor holding `users.delete` directly. For every other actor, F7's gate is what stops the deletion,
> and it does so with a visible refusal rather than a silent one. Recorded here so Phase 4 does not
> raise the ordering as a new finding.

---

### F17 — pin the self-edit email property as intentional (test-only)

**The naming half of this finding is already closed and must not be re-implemented.** It asked for
the self-edit check to be extracted out of a flag named `$applyRoleAndStatus`. Story 0008a did that:
verified at [`UpdateUser.php:73`](../../../app/Actions/Users/UpdateUser.php), the code reads
`$isSelfEdit = Auth::user()?->is($user) ?? false;`, and `$applyRoleAndStatus` no longer exists as a
parameter anywhere.

**What survives is only the test half, and it moves to `UpdateUser`, not `Index`.** The email guard's
scope still rides on `$isSelfEdit`: `authorizeRoleAndStatusChange()` (which contains the
`$emailChanged || $statusChanged → updateSensitiveAttributes` gate, lines 166–171) is called only
inside `if (! $isSelfEdit)` (75–77). So "a self-edit of email never requires
`roles.manage-administrators`" is a real, intentional property that **nothing currently pins**. Add
that test against `App\Actions\Users\UpdateUser` — the class that owns the rule — rather than against
the Livewire component, so a future refactor of the component cannot silently drop the coverage.
No production-code change under this finding.

---

### F12 — closed by story 0008a; **dropped from this story**

Recorded rather than silently removed. F12 asked to guard against two `null`s satisfying
`$wasAdministrator`/`$willBeAdministrator` in `Index::authorizeRoleChange()`, an id-to-id comparison
against an `administratorRoleId()` lookup. **Both methods were deleted by story 0008a** and the
comparison no longer exists in any form. The replacement, verified at
[`UpdateUser.php:151-152`](../../../app/Actions/Users/UpdateUser.php), is row-shaped and cannot be
satisfied by two nulls:

```php
$wasAdministrator = $user->hasRole(RoleName::Administrator->value, 'web');
$willBeAdministrator = $submittedRole !== null && Role::isAdministratorRole($submittedRole);
```

`isAdministratorRole()` compares the row's *persisted* name against a non-null enum value, so an
unresolvable role id yields `false` rather than a null-equals-null true. **No code change, no test,
no acceptance criterion.**

---

## Tests to perform
- [ ] **F4** — a forged `set('users', …)` against the component is rejected
      (`CannotUpdateLockedPropertyException`), mirroring the existing `$editingUserId` coverage.
      Separately: `tests/Feature/Users/IndexTest.php:199` is rewritten so it proves
      `usersSummary()`'s independence from `$users` **without writing** the now-locked property, and
      still fails if `usersSummary()` is reimplemented to read the array; and
      `tests/Feature/Users/IndexRenderingTest.php:114-116` is rewritten so `assertSee('No users
      found.')` is still reachable through some mechanism other than writing `$users` directly (see
      the F4 blockquote above for the constraint and a candidate mechanism), and still fails if the
      empty-state branch is removed from the view.
- [ ] **F7** — `openCreateModal()`, `openEditModal()` (against **another** user; the actor's own row is
      the deliberate exception under the self-row exemption, covered separately below) and
      `confirmDelete()` each throw `AuthorizationException` for an actor lacking the corresponding
      permission, called **directly** (not only through `save()` / `deleteUser()`).
- [ ] **F7** — an actor holding `users.edit` but not `roles.manage-administrators` is refused at
      `openEditModal()` for **another, Administrator-holding** target, and the refusal happens
      **before** `$status` / `$editingPendingEmail` are populated (assert the component's state, not
      only the exception — a check placed after the assignments would pass an exception-only test
      while still having disclosed the values).
- [ ] **F7 — must-not-over-block:** the same actor still opens an **ordinary** target's edit modal
      successfully, so the gate did not become a blanket refusal.
- [ ] **F7 — must-not-over-block, self row:** an Administrator actor who lacks
      `roles.manage-administrators` still opens **their own** row via `openEditModal()`, still renames
      or re-emails themselves successfully, and `canEdit` on their own row stays `true` — proving the
      self-row exemption, not merely that it doesn't crash.
- [ ] **F7 — the complete set of intentional test changes.** This is the full list; no test outside it
      is amended, and none of them is deleted or weakened to a smoke check — each is rewritten to keep
      asserting the property it always asserted, against the new refusal point:
      - `IndexTest.php:982` ("saving an existing Administrator without changing their role … succeeds
        without the stricter permission") → rewritten to assert the refusal now happens at
        `openEditModal()` for that **other**-target case.
      - `IndexTest.php:110-112` (`canEdit->toBeTrue()` for an Administrator-holding **other** target
        viewed by an actor lacking the stricter permission) → becomes `toBeFalse()`. A **new**
        assertion is added alongside it for the **self**-row case, which stays `toBeTrue()` (see the
        must-not-over-block bullet above).
      - `IndexTest.php:894` ("downgrading an Administrator without the stricter permission is denied")
        — this and the three below are the **F1 regression tests**, proving the refusal happens on the
        mutating call. With F7's opener-level gate now in front of them, each must be restructured to
        prove the refusal still happens on `save()`/`deleteUser()` for a caller that reaches past the
        opener — **not** by calling `save()`/`deleteUser()` directly, which is impossible: `$editingUserId`
        (41–42) and `$deletingUserId` (47–48) are both `#[Locked]`, so `save()`'s edit branch and
        `deleteUser()` are each reachable **only** through their opener (`openEditModal()` /
        `confirmDelete()`), and `save()` with `$editingUserId` unset silently takes the **create**
        branch instead, which would make the test assert an unrelated rule (`CreateUser`'s
        `promoteToAdministrator` gate) and pass for the wrong reason — exactly the vacuous-coverage
        trap [`docs/errors-log.md`](../../../docs/errors-log.md) records twice. **The shape to use instead
        is the one already shipped twice in this repo**: call the opener while the actor still holds
        the stricter permission (so it succeeds and reaches the mutating call), then revoke the
        permission and flush the permission cache, then call `save()`/`deleteUser()` and assert the
        refusal there —
        [`tests/Feature/Users/IndexTest.php:746`](../../../tests/Feature/Users/IndexTest.php) is the
        `save()` form of this shape, and
        [`tests/Feature/Roles/IndexTest.php:462-481`](../../../tests/Feature/Roles/IndexTest.php) the
        `deleteRole()` form — so F1's coverage does not silently degrade to "refused somewhere before
        the write, don't know where".
      - `IndexTest.php:1007` ("changing an Administrators status without the stricter permission is
        denied") — same restructuring as `:894`.
      - `IndexTest.php:1044` ("changing an Administrators email without the stricter permission is
        denied") — same restructuring as `:894`.
      - `IndexTest.php:934` ("deleting a user holding the Administrator role without the stricter
        permission is denied") — **verified to collide, deterministically.** The actor lacks
        `roles.manage-administrators`, the target holds `Administrator`, and `UserPolicy::delete()`
        (113-129) requires both `users.delete` and `roles.manage-administrators` for an
        Administrator-holding target — so `confirmDelete()`'s new `Gate::authorize('delete', …)` throws
        before the mutating call runs, outside the test's `toThrow()` closure. Same restructuring as
        `:894`.
      `IndexTest.php:501`, `:586`, `:655`, `:670`, `:687` (the self-row cases) **keep their fixtures and
      assertions unchanged by F7** — the self-row exemption must leave all five passing as they stand
      today, and if any of them starts failing for a reason traceable to `openEditModal()`'s new gate,
      the exemption was implemented incorrectly. **`:687` is nonetheless one of F8's 22 type-conversion
      sites below** (`set('status', UserStatus::Suspended)` at line 694 → `UserStatus::Suspended->value`)
      — that mechanical retype is the only edit any of the five self-row tests receives, and a failure
      there after the retype is an F8 problem, not an F7/exemption problem. Do not conflate the two.
- [ ] **F8** — submitting a status value outside `UserStatus`'s cases is rejected with a validation
      message on `status`, not an unhandled `\ValueError`. Cover the **empty string** in the same
      dataset. This adds the case the story-0004 Gherkin scenario claimed but never had.
- [ ] **F8** — the create form still opens with `status` at the `Inactive` default and `roleId` at
      `''` (the null-select regression test at `IndexTest.php:283` keeps its meaning, re-expressed
      against the new type as `assertSet('status', UserStatus::Inactive->value)`), and a browser-level
      pick of the **first** status option still round-trips — `tests/Browser/UsersIndexTest.php`'s
      existing coverage must pass **unamended**, which is what proves the retype did not reopen the
      documented `<select>` desync.
- [ ] **F6 part 1** — the 11th `CreateUser` call within the window is rejected with a validation
      message and sends no invitation; the limit resets after the decay window
      (`Carbon::setTestNow()` or equivalent); an **unauthorized** caller's refused attempt consumes no
      quota (assert by exhausting nothing: an unauthorized call followed by 10 authorized ones all
      succeed).
- [ ] **F6 part 2** — an administrator exhausting a target's email-change allowance does **not**
      prevent that target changing their own address (drive the target's own request through
      `App\Livewire\Settings\Profile`, the other real call site, so the test proves the two call sites
      no longer share a bucket).
- [ ] **F6 part 2** — the per-target aggregate ceiling still binds: requests from **several distinct
      administrators** against one target are refused once the aggregate limit is reached, and no
      further `PendingEmailVerification` is sent (`Notification::fake()` + `assertSentOnDemandTimes`).
- [ ] **F6 part 2 — ordering:** a request refused by the narrower (target, actor) limiter does **not**
      consume aggregate quota. Assert by exhausting one actor's allowance, then confirming a *second*
      actor still has the full aggregate remainder.
- [ ] **F10** — force `RequestEmailChange` to refuse (exhaust its throttle before the call) while
      submitting a **changed name, status and role** in the same edit, and assert **all three** are
      unchanged afterwards. Assert on the database row, not on the exception alone.
- [ ] **F10** — in that same refused case, `Notification::assertNothingSent()`: no verification mail
      may be sent for a change that did not persist.
- [ ] **F10 — must-not-over-block:** a *successful* edit that changes name, status, role and email
      together still applies all three writes **and** parks the pending email. `IndexTest.php:610`
      pins name + email together today but **not** status/role in the same case — this bullet asks for
      the wider combined coverage explicitly, not a restatement of what `:610` already covers.
- [ ] **F11** — an actor who holds `users.delete` directly and whose own row holds **no** privileged
      role calls `confirmDelete()` then `deleteUser()` against their own row: it is a no-op, the
      account still exists, and no error is raised.
- [ ] **F11** — repeat for a **Super Admin** actor, which is the case `UserPolicy::delete()` cannot
      cover because of the `Gate::before` bypass — that case is the one that fails if the guard is
      implemented as a policy rule.
- [ ] **F11 — the F7 interaction:** an actor whose own row holds the **Administrator** role calls
      `confirmDelete()` against their own row and is refused with `AuthorizationException` — the same
      refusal `UserPolicy::delete()` produces for any *other* Administrator-holding target — proving
      F7's gate runs first and F11's no-op never fires for this actor. Assert the refusal happens at
      `confirmDelete()`, not at `deleteUser()`, and that `$deletingUserId` was never set.
- [ ] **F17** — against `App\Actions\Users\UpdateUser` **called directly**: an actor who holds
      `users.edit` but not `roles.manage-administrators`, and who themselves holds the `Administrator`
      role, can change **their own** email address; the change is accepted and parked in
      `pending_email`. This pins the self-edit email exemption as intentional.
- [ ] **F9** — `UserInvitation` no longer implements `ShouldQueue`: with `Queue::fake()`, creating a
      user enqueues **no** notification job, and with `Notification::fake()` the invitation is still
      sent exactly once. Assert no `jobs` row carries the token.
- [ ] **F5** — creating, editing and deleting a user each produce exactly one matching `Log::info`
      entry (`Log::spy()` / fake), carrying `actor_id` and the target id; the edit entry carries the
      **before and after** role and status; and none of the three contains the generated password, the
      invitation token, or an email-change hash. Assert the before-values are the pre-write ones (a
      log line written after `save()` from the model instance would report the new value as the old).
- [ ] **Full-suite regression:** the whole existing suite passes. Per
      [base-standards.md](../../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done),
      the record is an **unscoped** `php artisan test` and an **unscoped** `vendor/bin/pint --format
      agent` — not `--filter` / `--dirty`. This story changes a validation-facing property type and a
      permission-facing UI hint, so its blast radius is wider than its own feature by construction.

## Expected outcome
The Users CRUD backend built in story 0004 has no known non-blocking security gaps left open, except
the two deliberately carried elsewhere (step-up authentication → [0015a](../in-progress/0015a-step-up-auth-privileged-user-actions.md);
cancelling an in-flight email change → deferred). Every server-derived property is locked; every
method that discloses or mutates state is authorized, with the disclosure check no weaker than the
write check it precedes and no tier logic re-derived in the component; a forged or empty status value
fails cleanly as a validation error without reopening the documented `<select>` desync; account
creation is rate limited per actor; one administrator can no longer exhaust another user's own
email-change allowance while that user's inbox keeps a ceiling; a refused email change leaves no
partially applied edit and sends no mail for a rolled-back write; nobody can delete their own account
from this screen, Super Admin included; the invitation token never reaches the `jobs` table; and
create, edit and delete each leave a structured audit line matching the Roles screen's shipped shape.

## Acceptance criteria
- [ ] `$users` is `#[Locked]`. (`$deletingUserName` already was — no change.)
- [ ] `openCreateModal()` authorizes `create`, `confirmDelete()` authorizes `delete`, and
      `openEditModal()` authorizes **`updateSensitiveAttributes`, except for the actor's own row** —
      no `Administrator` **role-membership** check anywhere in `App\Livewire\Users\Index` (the only
      branch is the identity check `$target->is(Auth::user())`, never a role/tier lookup). Each check
      runs before any target attribute is copied into public component state.
- [ ] `loadUsers()`'s `canEdit` mirrors the same rule — `true` for the actor's own row, otherwise
      `Gate::allows('updateSensitiveAttributes', $user)` — so the row action's disabled state matches
      what a click does for every actor/target pair except the pre-existing, accepted Super Admin one.
- [ ] `App\Livewire\Users\Index::$status` is declared `public string $status =
      UserStatus::Inactive->value;` — **never** nullable, never defaulted to `''`. A forged or empty
      status value is a validation error on `status`, not a `\ValueError` or `TypeError`.
- [ ] `deleteUser()` is a silent no-op against the acting user's own row **for every actor that reaches
      it** — a Super Admin (via `Gate::before`) and any non-`Administrator` actor holding `users.delete`
      directly — and the guard is **not** implemented as a `UserPolicy` rule. An actor whose own row
      holds `Administrator` is refused earlier, at `confirmDelete()`, with the same
      `AuthorizationException` `UserPolicy::delete()` already produces for any other Administrator-
      holding target — `confirmDelete()`'s gate does **not** carry a self-row exemption, unlike
      `openEditModal()`'s.
- [ ] `App\Actions\Users\CreateUser` is rate-limited at **10 attempts per 3600 seconds keyed on the
      acting user's id**, checked after its `Gate::authorize()` and before its `DB::transaction()`,
      refusing with a `ValidationException`.
- [ ] `App\Actions\Users\RequestEmailChange` enforces **two** limiters: `(target, actor)` at
      **3 per 3600 s** (checked first, always applied — including to the target's own self-service
      requests) and `target` aggregate at **10 per 3600 s** (checked second, **skipped entirely when
      the caller is the target themselves** — Phase 4 re-audit finding F-A: the aggregate exists to
      cap third-party mail volume against one target's address, not to cap the target's own choice of
      a new address for themselves), with `Auth::id() ?? 'unauthenticated'` as the actor segment. An
      administrator exhausting a target's allowance leaves that target's own allowance intact, and the
      target's inbox still has a ceiling across all **third-party** actors — the target's own 3/hour
      composite limit remains the only control on their own request rate, pinned by the Phase 4
      follow-up (L-1) test.
- [ ] A refused email change leaves the target's **name, status and role all unchanged**, and sends no
      verification notification. The `load('roles')` → `Gate::authorize('update')` →
      `authorizeRoleAndStatusChange()` ordering in `UpdateUser` is unchanged, and every authorization
      check still runs above the first write.
- [ ] `App\Notifications\UserInvitation` no longer implements `ShouldQueue`; creating a user enqueues
      no job and the token never reaches the `jobs` table.
- [ ] Creating, editing and deleting a user each emit exactly one structured `Log::info` line carrying
      `actor_id`, the target id, and (for the edit path) the before/after role and status plus an
      `email_change_requested` boolean (added by the Phase 4 F-B fix) — matching `App\Livewire\Roles\Index`'s
      shipped shape, never `Log::warning`, and never containing a password, invitation token or
      email-change hash.
- [ ] "A self-edit of email never requires `roles.manage-administrators`" is pinned by a test against
      `App\Actions\Users\UpdateUser` (F17). No production change under this finding.
- [ ] The **complete, enumerated set** of intentional test changes is exactly: F7's list under "Tests to
      perform" (`IndexTest.php:982`, `:110-112` plus a new self-row assertion beside it, `:894`,
      `:1007`, `:1044`, `:934`, **and `IndexRenderingTest.php`'s "the edit and delete row actions are
      disabled for a target the actor cannot edit or delete" — found during Phase 3 implementation, not
      originally enumerated here, and confirmed correct at Phase 5: the rendered-HTML sibling of the
      `:110-112` change, breaking for the identical reason**), F4's `:199` and `IndexRenderingTest.php:114-116`
      rewrites (the latter keeping `assertSee('No users found.')` reachable through a mechanism other
      than writing `$users` directly — Phase 5 confirms it does so via a soft-deleted acting
      administrator, a state that can never occur in production per
      [security/soft-delete-patterns.md](../../../docs/security/soft-delete-patterns.md), and is
      therefore a safe test-only mechanism, not a gap), and F8's 22 `set('status', …)` /
      `assertSet('status', …)` type-conversion sites across four files — which include
      `IndexTest.php:694` (inside the `:687` self-row test). **`IndexRenderingTest.php` therefore
      receives two edits, not one.** No test outside this set is amended, and none of them is deleted
      or weakened to a smoke check. `IndexTest.php:501`, `:586`, `:655`, `:670`, `:687` (the self-row
      cases) keep their fixtures and assertions unchanged by F7 — `:687`'s only edit is F8's mechanical
      status-value retype at line 694, not a fixture or assertion change. The full unscoped suite is
      green (667 tests as shipped, plus L-1's follow-up test).
- [ ] F12 is recorded as closed-by-0008a, F13 as split to 0015a, and F18 as deferred — each stated in
      this file, none silently dropped.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite, run **unscoped**.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — this is itself the security-audit follow-up, so Phase 4
      re-audits specifically against F4–F11 and F17's closure, and confirms F12/F13/F18 are correctly
      dispositioned rather than forgotten.
- [ ] Documentation updated (docs-keeper):
      - [`docs/security/livewire-authorization.md`](../../../docs/security/livewire-authorization.md) —
        its "gate every method that mutates *or discloses*" section gains this story's disclosure
        gates as the shipped example, including **why the disclosure check is the stronger ability**
        and why the component performs no tier lookup to get there.
      - [`docs/api/routes.md`](../../../docs/api/routes.md)'s `users.index` subsection — the per-row
        `canEdit` bullet currently states that `canEdit` comes from `Gate::allows('update', $user)`
        and that it "needs only `users.edit`" for an Administrator-holding target. **Both become false
        the day this ships**; correct them rather than appending. The same claim appears in
        `loadUsers()`'s own docblock (`Index.php:271-292`) — that half is Phase 3's, not
        `docs-keeper`'s, but the two must be corrected together.
      - [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md)'s
        `Gate::allows()`-is-a-UI-hint section — same correction, plus the new self-delete guard as a
        second example of a rule that must live outside `Gate` because of the `Gate::before` bypass.
      - [`docs/errors-log.md`](../../../docs/errors-log.md) — **only if** Phase 3/4/5 produces a real
        mistake. The F10 ordering hazard is a *forward-looking* application of an entry that already
        exists; per this project's precedent it is cross-referenced, not duplicated.
- [ ] Acceptance criteria met.

## What re-verification changed (2026-08-23)

This story failed its Phase 2 INVEST/docs-consistency gate because three of its findings had been
overtaken by later stories. Recorded here so the same drift is visible rather than re-introduced:

| Finding | First draft said | Verified at `HEAD` | Disposition |
| --- | --- | --- | --- |
| F4 | lock `$users` **and** `$deletingUserName` | `$deletingUserName` already `#[Locked]` (`Index.php:77`) | halved; now names both tests it breaks |
| F7 | branch on the target's Administrator role in the component | `UserPolicy::updateSensitiveAttributes()` already contains the branch | unconditional call; no tier logic in the component |
| F8 | retype to `public ?string $status` | property is deliberately non-nullable per a documented errors-log entry | retype to non-nullable `public string`; the "existing dataset row" it cited does not exist |
| F10 | add the `DB::transaction()` | 0008a added it; the email delegation runs **after** the commit | re-scoped to the ordering, with an explicit no-mail-on-rollback constraint |
| F12 | fix the null-collision in `authorizeRoleChange()` | both that method and `administratorRoleId()` were **deleted** by 0008a | closed; dropped from scope |
| F13 | step-up auth in this story | needs a modal affordance `users.blade.php` does not have | split to [0015a](../in-progress/0015a-step-up-auth-privileged-user-actions.md) |
| F17 | rename the flag **and** add a test | 0008a already ships `$isSelfEdit` (`UpdateUser.php:73`) | test half only, relocated to `UpdateUser` |
| F18 | decide whether to add the capability | still true as described | deferred by human decision |

## Open questions — RESOLVED 2026-08-23

Per [`docs/contracts.md`](../../../docs/contracts.md)'s Uncertainty Handling Rule, these needed a human
answer before Phase 3. Answered by the human (aarpwebmaster@gmail.com) on 2026-08-23.

**Q1 — Drop `ShouldQueue` from `UserInvitation`, or restructure to mint the token inside `toMail()`?**
**Decision: drop `ShouldQueue`.** Send synchronously, matching Fortify's own `ResetPassword`
notification. No functional difference to the end user, since account creation is already an
administrator-initiated, non-realtime action; this avoids restructuring token minting around a queued
payload.

**Q2 — Does user administration need step-up authentication (F13)?**
**Decision: yes, for role/status changes and deletion — not plain name edits.** The work itself is
**not in this story**: it is [0015a](../in-progress/0015a-step-up-auth-privileged-user-actions.md), split out because
it requires a re-confirmation affordance in the Users modals and is therefore fullstack.

**Q3 — Rate-limit window and threshold for `CreateUser`?**
**Decision: 10 per hour**, keyed on the acting user's id — one order of magnitude above
`RequestEmailChange`'s 3/hour, scaled for legitimate bulk onboarding.

**Q4 — Should F6's second half be resolved now, or spiked?**
**Decision (human, 2026-08-23): resolve now, as a real spec.** Written up above as the composite-key
plus aggregate-limiter design. One figure in it — the **per-target aggregate ceiling of 10/hour** — is
not itself a human decision; it was chosen to match Q3's already-decided administrator-action ceiling
and is a tunable, since the security property holds at any value ≥ 3.

## Dependencies and related work
- **Follow-up from story 0004**'s Phase 4 security audit and re-audit. F1 was fixed in 0004 itself;
  F2/F3 were tracked on stories 0008/0009 and are closed; F14 is accepted-as-designed; F15/F16 were
  recorded on story 0009.
- **Sibling story: [0015a — Step-up authentication for privileged Users actions](../in-progress/0015a-step-up-auth-privileged-user-actions.md)**
  (F13). Split out of this story on 2026-08-23, following the 0008/0008a precedent. The two are
  **independent and may land in either order**: 0015a adds a new guard to `updateExistingUser()`'s
  role/status path and to `deleteUser()`, while this story changes those methods' *other* concerns
  (audit logging, the self-delete no-op, the disclosure gates). Their only real contact points are two
  files both touch — `app/Livewire/Users/Index.php` and `resources/views/livewire/users.blade.php` —
  so per [`docs/contracts.md`](../../../docs/contracts.md)'s Parallel Agent File-Ownership Rule they must
  **not** be implemented concurrently; whichever reaches Phase 3 second rebases onto the first.
- **Depends on shipped code from stories 0005, 0006, 0008, 0008a and 0009**, all closed. It depends on
  no *unfinished* work: the four files it edits were created by 0004, but their current contents are
  those later stories'. Every finding was re-verified against `HEAD` (`00dd9c7`).
- **Not blocked by, and does not block, story 0013** (module/sidebar gating) — no route, ability,
  column or migration changes here.

## Provenance
F4–F13 raised by `appsec-auditor` during story 0004's Phase 4 security audit, consolidated into one
follow-up task per human decision rather than filed as separate micro-tasks. F17/F18 and the original
F7 sharpening were added by the same auditor's Phase 4 **re-audit**, run after the F1 fix landed; that
re-audit also produced F15 (a sharper restatement of F2/F3) and F16 (informational), both recorded on
story 0009. Rewritten 2026-08-23 after a Phase 2 INVEST/docs-consistency **FAIL** from `code-reviewer`
(blocking findings B1–B6, advisory S1/S3), with every remaining finding re-verified against the real
files at `HEAD` and F13 split out to [0015a](../in-progress/0015a-step-up-auth-privileged-user-actions.md).
