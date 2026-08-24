# [0015a] Step-up authentication for privileged Users actions (split from 0015's F13)

## Description
Require a **recently confirmed password** before an administrator may change another user's role or
status, or delete a user, from the Users screen. Holding `users.edit` / `users.delete` proves what the
actor *may* do; it does not prove that the person at the keyboard is still the account holder. A
hijacked or unattended session today can promote, suspend or delete accounts with no further proof of
identity, while this app already treats a comparable trust boundary — managing 2FA and passkeys on
`settings/security` — as needing `password.confirm`. This story closes that asymmetry for the three
highest-value Users actions, and adds the UI affordance that makes the re-confirmation
comprehensible rather than a surprise redirect.

> **Split out of story [0015](../done/0015-harden-users-crud-security-posture.md) on 2026-08-23**, following
> the [0008](../done/0008-super-admin-role-invariants.md) / [0008a](../done/0008a-centralize-administrator-role-identification.md)
> precedent. It was finding **F13** there. Two reasons for the split, both structural rather than
> cosmetic: 0015 is declared **backend** and this work needs a re-confirmation affordance in
> `resources/views/livewire/users.blade.php`, which story 0006's shipped UI does not have (verified —
> that file's two modals carry no password field, no notice and no confirmation state); and F13 was
> the only finding in 0015 that adds a *new capability* rather than closing a gap in an existing one,
> which made 0015 fail its own INVEST sizing.

> **The mechanism is Laravel's stock one, reused — not a new one.** This story adds **no new timeout
> config, no Users-specific window, and no second password-confirmation flow.** It reads the same
> session key Laravel's own `password.confirm` middleware reads, against the same
> `config('auth.password_timeout')` value `settings/security` already relies on. See
> [The mechanism](#the-mechanism--verified-vendor-behaviour-not-inferred) for what was verified in
> vendor source, and for the two mechanisms an earlier draft of F13 named that **do not exist**.

## Type
fullstack (related_task_id: 0015) | includes database-expert: **no**

## Gherkin
```gherkin
Feature: Step-up authentication for privileged Users actions

  # --- The three refusals this story exists to add ---

  Scenario: A stale password confirmation blocks a role change
    Given a user administrator whose password confirmation has expired
    When they submit a change to another user's role
    Then the change is refused and they are routed to re-confirm their password

  Scenario: An absent password confirmation blocks a status change
    Given a user administrator who has never confirmed their password this session
    When they submit a change to another user's status
    Then the change is refused and they are routed to re-confirm their password

  Scenario: A stale password confirmation blocks a deletion
    Given a user administrator whose password confirmation has expired
    When they confirm deletion of another user
    Then the deletion is refused and they are routed to re-confirm their password

  # --- The guard must stay narrow (must not over-block) ---

  Scenario: A plain name edit is not blocked by a stale password confirmation
    Given a user administrator whose password confirmation has expired
    When they change another user's name only
    Then the change is applied without any re-confirmation

  Scenario: An email change to another user's account requires re-confirmation
    Given a user administrator whose password confirmation has expired
    When they change another user's email address only
    Then the change is refused and they are routed to re-confirm their password

  Scenario: A self-service email change is not blocked, because it is not a third-party change
    Given a user administrator whose password confirmation has expired
    When they change their own email address
    Then the change is held as pending without any re-confirmation

  Scenario: Creating an ordinary user is not blocked by a stale password confirmation
    Given a user administrator whose password confirmation has expired
    When they create a new user with an ordinary role
    Then the user is created without any re-confirmation

  Scenario: Creating an Administrator-tier user requires re-confirmation
    Given a user administrator whose password confirmation has expired
    When they create a new user with the Administrator role
    Then the creation is refused and they are routed to re-confirm their password

  Scenario: Repeated password-confirmation attempts are rate limited
    Given a user administrator submitting their password on the re-confirmation screen
    When they submit a sixth incorrect password within one minute
    Then the attempt is rejected with a throttling message rather than checked against their password

  Scenario: A self-edit that submits a role is not blocked, because no role change occurs
    Given a user administrator whose password confirmation has expired
    When they save their own row with a different role selected
    Then the save succeeds and their own role is left unchanged, as it already is today

  Scenario: A permission refusal takes precedence over a step-up refusal
    Given a user administrator who lacks permission to delete another user, with an expired password confirmation
    When they attempt to delete that user
    Then they receive the permission refusal, not a prompt to re-confirm their password

  Scenario: The step-up guard binds a Super Admin actor too
    Given a Super Admin whose password confirmation has expired
    When they submit a change to another user's role
    Then the change is refused and they are routed to re-confirm their password

  # --- The happy path (regression guard) ---

  Scenario: A fresh password confirmation allows a role change
    Given a user administrator who confirmed their password moments ago
    When they submit a change to another user's role
    Then the change is applied

  Scenario: A fresh password confirmation allows a deletion
    Given a user administrator who confirmed their password moments ago
    When they confirm deletion of another user
    Then the user is deleted

  Scenario: Re-confirming the password restores the ability to act
    Given a user administrator who was refused a role change for a stale confirmation
    When they re-confirm their password and submit the change again
    Then the change is applied

  # --- The affordance ---

  Scenario: The edit form warns before the administrator fills it in
    Given a user administrator whose password confirmation has expired
    When they open another user's edit form
    Then the form states that changing the role or status will require re-confirming their password

  Scenario: The delete confirmation warns before the administrator commits
    Given a user administrator whose password confirmation has expired
    When they open the delete confirmation for another user
    Then it states that deleting will require re-confirming their password

  Scenario: A fresh confirmation shows no warning
    Given a user administrator who confirmed their password moments ago
    When they open another user's edit form
    Then no re-confirmation warning is shown

  # --- Session boundaries ---

  Scenario: The confirmation does not survive a sign-out
    Given a user administrator who confirmed their password, then signed out and signed in again
    When they submit a change to another user's role
    Then the change is refused and they are routed to re-confirm their password

  Scenario: A caller with no session is refused rather than exempted
    Given a caller invoking the user-update action outside any web session
    When they submit a role change
    Then the attempt is refused, because an absent confirmation fails closed
```

## The mechanism — verified vendor behaviour, not inferred

Everything in this section was read out of the installed vendor source and this repo's own config on
2026-08-23. It is written out because **F13's original implementation guidance named two mechanisms
that do not exist**, and Phase 3 must not inherit them:

| Original F13 said | Reality |
| --- | --- |
| "likely `request()->hasValidSignature()`-style helper" | ❌ unrelated — that is **signed-URL** verification (`Illuminate\Routing\Middleware\ValidateSignature`), used by this app for `email-change.confirm` only |
| "or Fortify's own `PasswordConfirmed` session flag" | ❌ there is **no** `PasswordConfirmed` class in `laravel/fortify` (grepping will surface `PasswordConfirmedResponse`, a response *contract* Fortify's controller returns after confirming — unrelated to reading confirmation freshness) |

The real mechanism, in three verified parts:

1. **The alias.** `password.confirm` resolves to Laravel's stock
   `Illuminate\Auth\Middleware\RequirePassword`. It is the only thing protecting
   `settings/security` today (`routes/settings.php`, lines 18–21).
2. **The check.** `RequirePassword::shouldConfirmPassword()`:

   ```php
   // vendor/laravel/framework/src/Illuminate/Auth/Middleware/RequirePassword.php
   protected function shouldConfirmPassword($request, $passwordTimeoutSeconds = null)
   {
       $confirmedAt = Date::now()->unix() - $request->session()->get('auth.password_confirmed_at', 0);

       return $confirmedAt > ($passwordTimeoutSeconds ?? $this->passwordTimeout);
   }
   ```

   The session key is `auth.password_confirmed_at`, a **unix timestamp**. Its `0` default means "never
   confirmed" resolves to a huge elapsed time and therefore to "must confirm" — **fail-closed by
   construction**, which is the property this story depends on.
3. **The timeout, and where it comes from.** `$this->passwordTimeout` is **not** the class's
   hardcoded `10800` fallback in this app: `Illuminate\Auth\AuthServiceProvider` (line 75) binds the
   middleware with `$app['config']->get('auth.password_timeout')`, and `config/auth.php:116` reads
   `'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800)`. **Decision: reuse that value
   unchanged** (3 hours) — no Users-specific shorter window, no new config key. One timeout for every
   step-up in the app is the point; a second one is a second thing to get wrong.
4. **Who writes the key.** `Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::store()`
   — `$request->session()->put('auth.password_confirmed_at', Date::now()->unix())` — reached by
   POSTing to the `password.confirm.store` route from the `livewire.auth.confirm-password` view
   (registered in `app/Providers/FortifyServiceProvider.php:94`). This story writes that key **nowhere**
   itself; it only reads it.

**Why an in-method guard rather than route middleware.** `RequirePassword` is **not** on Livewire 4's
`PersistentMiddleware` allow-list — verified, and already documented in this repo at
[`docs/security/livewire-authorization.md`](../../../docs/security/livewire-authorization.md), whose
table lists `password.confirm` → `Illuminate\Auth\Middleware\RequirePassword` → "❌ no". So adding
`->middleware(['password.confirm'])` to `routes/users.php` would protect the initial `GET /users` and
leave **every** `/livewire/update` round-trip — which is where `save()` and `deleteUser()` actually
run — completely unguarded. This is the same reason the route is gated with `can:` rather than
Spatie's `permission:`.

> ⚠️ **The same gap applies to `settings/security` today**, which relies on route middleware alone.
> That is a **pre-existing** condition, out of this story's scope, and must not be "fixed in passing" —
> it is a different screen with its own tests and its own Phase 4 history. Recorded here only so a
> reader does not mistake this story's in-method approach for an inconsistency.

## Files to create/modify

Line numbers are the verified `HEAD` (`00dd9c7`) ones as of 2026-08-23 and are a reading aid only.

- **`app/Actions/Auth/EnsureRecentPasswordConfirmation.php` (create)** — one invokable action, the
  **single** implementation of the check. It reads `session('auth.password_confirmed_at', 0)`,
  compares the elapsed time against `config('auth.password_timeout')` using the identical
  `>` comparison `RequirePassword` uses, and throws when stale. New subfolder `app/Actions/Auth/`,
  following the one-subfolder-per-area convention `app/Actions/Roles/` established (see
  [base-standards.md](../../../docs/conventions/base-standards.md#directory-structure)); it also exposes a
  non-throwing `isRecentlyConfirmed(): bool` (named as a predicate, not the ambiguous `isConfirmed()` —
  confirmed *what* is unclear out of context) for the view's warning, so the UI hint and the guard
  cannot drift — the same "the hint reuses the guard's own predicate" rule the `Gate::allows()` UI hints
  follow.
  - **Do not re-derive the comparison inline at either call site.** Two implementations of one rule is
    the drift `docs/errors-log.md` and `base-standards.md` both warn about; move the rule, never copy it.
  - **Fail closed with no session.** `session()` outside a web request has no key, so the elapsed time
    is unbounded and the guard throws. That is deliberate and matches the precedent story 0008a
    recorded for these same actions (an unauthenticated caller is *denied*, not exempted). It is also
    the reason this story does **not** try to make `UpdateUser` usable from a console context — that
    was already true before this story and is documented as a known design consequence there.

- **`app/Exceptions/PasswordConfirmationRequiredException.php` (create)** — the domain exception the
  guard throws, rendering its own response, matching the `app/Exceptions/` convention
  `ImmutableRoleException` (403) and `RoleInUseException` (409) established. **Status: 423 Locked**,
  which is the status `RequirePassword` itself returns on its JSON branch — so the code this app
  emits for "password confirmation required" is the code the framework already uses for it. It must
  **not** be a 403: a 403 is indistinguishable from "you lack the permission", and the whole point of
  this refusal is that the actor *does* have the permission.

- **`app/Actions/Users/UpdateUser.php` (modify)** — call the guard from inside
  `authorizeRoleAndStatusChange()` (declared 132), so it binds the operation rather than one caller,
  per [base-standards.md](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers).
  Two placement rules, both load-bearing:
  - **It must fire when a role change, a status change, or a third-party email change is actually
    happening — never on a name-only edit, and never on a self-edit of any kind.** *(Widened by the
    Phase 4 F2 decision above; the original scope keyed the guard off `$isNoOpRoleChange`/`$statusChanged`
    alone and left `$emailChanged` out, matching `updateSensitiveAttributes`'s wider
    `$emailChanged || $statusChanged` condition on the status half but deliberately not the email half.
    That asymmetry is now closed: the step-up guard's condition is exactly
    `updateSensitiveAttributes`'s own condition, evaluated only when `! $isSelfEdit`.)* A name-only edit
    must reach no step-up check at all. Getting the self-edit exemption wrong is the single most likely
    way this story over-blocks — a self-service email change (the actor changing their own address)
    must stay exempt, since `$isSelfEdit` already means there is no third party to protect.
  - **It must run above the first write, and after every `Gate` check on its branch has passed** —
    below `Gate::authorize('promoteToAdministrator')` / `downgrade` (155/157) and below
    `Gate::authorize('updateSensitiveAttributes')` (170) where those run, so a permission refusal is
    never converted into a re-confirmation prompt (same reasoning as the `deleteUser()` ordering
    above). This does not conflict with running above the first write: the whole method already runs
    above `__invoke()`'s `DB::transaction()` (79), so "after the Gate calls, above the transaction" is
    satisfiable simultaneously — same reasoning as 0008a's N1/N2 findings. **Note this "after the Gate
    calls" rule is vacuously satisfied, not skippable, on an ordinary-to-ordinary role change**: when
    neither target nor submitted role is Administrator, `promoteToAdministrator`/`downgrade` (155/157)
    never fire at all — but the role **did** change, so the step-up guard must still fire; the absence
    of a preceding `Gate` call on that branch is not a reason to skip it.

- **`app/Livewire/Users/Index.php` (modify)** — three changes:
  1. `deleteUser()` (196) calls the guard as an early statement. It goes **after** the `$deletingUserId
     === null` early return (198), after `findOrFail()` (202), **and after** `Gate::authorize('delete',
     $target)` (204) — immediately before `$target->delete()` (206). This ordering (not the reverse) is
     what achieves the stated goal: a request that is going to be refused for lack of permission must
     return the permission refusal, never be masked into a re-confirmation prompt — prompting an actor
     who may not delete at all to re-enter their password is both a needless credential surface and a
     disclosure that the target row resolved. Putting the guard *before* `Gate::authorize()` produces
     exactly the masking this ordering exists to avoid; do not swap them.
     The delete path is guarded in the component, not in an action, because there is no `DeleteUser`
     action — `deleteUser()` calls `$target->delete()` directly (206). If story 0015's own work or a
     later story extracts one, the guard moves with it.
  2. A `#[Computed]` boolean (e.g. `requiresPasswordConfirmation()`) reading the guard's non-throwing
     predicate, for the view's warnings. Name it as a predicate per
     [naming.md](../../../docs/conventions/naming.md#boolean-properties).
  3. Catch `PasswordConfirmationRequiredException` in `save()` and `deleteUser()` and route the actor
     to re-confirm: set the intended URL back to `users.index` explicitly
     (`redirect()->setIntendedUrl(route('users.index'))`) and issue the redirect through Livewire's own
     `$this->redirect(route('password.confirm'))` — **not** by returning the plain
     `Illuminate\Routing\Redirector` a bare `redirect()->route(...)` produces, which a Livewire action
     method does not turn into a browser navigation on its own.
     **Phase 3 must verify the round-trip end to end rather than assume it** — the redirect originates
     from a POST to `/livewire/update`, not from the GET that `RequirePassword::redirectGuest()`
     normally handles, so nothing sets `url.intended` for us; and Fortify's own post-confirmation
     response decides where the user lands. Prove the actor returns to `/users`, in a test, not by
     reading vendor code.
     **This is the dashboard-caller path; a non-dashboard caller of `UpdateUser` directly (e.g. from a
     future API or Artisan command) never reaches this catch block and instead sees the exception's own
     423 response** — the two are for different callers, not alternatives to choose between.
  4. **(Phase 4, F4)** Both catch blocks log the refusal before redirecting —
     `Log::warning('Step-up password confirmation required', ['actor_id' => Auth::id(), 'action' =>
     'users.update'|'users.delete', 'user_id' => $target->id])` — matching the shape story 0015's F5
     already established on this same class (`Log::info` for create/edit/delete). A step-up refusal is
     the strongest available signal of a hijacked or unattended session; without this it was the one
     event on this screen invisible to the audit trail.

- **`app/Actions/Users/CreateUser.php` (modify — Phase 4, F1)** — gate creation of an Administrator-tier
  user the same way. `CreateUser` already computes whether the submitted role is Administrator-tier for
  its own `Gate::authorize('promoteToAdministrator', User::class)` call; call the step-up guard
  immediately after that check passes, on the Administrator branch only. An ordinary-role creation
  reaches no step-up check at all — this is deliberately narrow, matching the "fire only on the
  privileged branch" rule the rest of this story follows, not a blanket gate on every creation.

- **`app/Providers/FortifyServiceProvider.php` and/or `config/fortify.php` (modify — Phase 4, F3)** — add
  a rate limiter to `password.confirm.store`. Verified in the audit: that route carries no throttle at
  all today (`config/fortify.php`'s `limiters` names `login`/`two-factor`/`passkeys` only), and once
  this story makes it the sole barrier in front of role/status/delete/promote-to-Administrator/
  third-party-email-change, an attacker holding a hijacked session can guess the account's own password
  against it without limit. 5/minute, keyed by user id when authenticated (falling back to IP),
  matching Fortify's own `login` limiter's shape.

- **`resources/views/livewire/users.blade.php` (modify)** — the affordance. Story 0006's shipped
  modals have none: the create/edit modal (142–194) and the delete modal (197–228) contain only
  inputs and Cancel/Save buttons. Add, gated on the new computed property:
  - inside `@if ($showModal)`, a notice stating that changing the role, status or email will require
    re-confirming the password — placed **above** the role/status selects (165–175), so it is read
    before the fields it applies to; shown only for an edit of another user (per the F2 self-edit
    exemption above), never on the create form for an ordinary role, but a second notice on the create
    form (or the same one, reworded) when the selected role is Administrator-tier, per F1;
  - inside `@if ($showDeleteModal)`, the equivalent notice above the destructive button (217–224).
  - Use a `flux:callout` (or `flux:text`, matching the existing `pending_notice_admin` treatment at
    158–162 — check what reads best against the shipped modals rather than inventing a new pattern).
    Give each a `data-test` hook, since the copy is translated and must not be selected by text.
  - **No password field goes in these modals.** Re-confirmation happens on Fortify's own
    `password.confirm` screen; a second in-modal password form would be a second confirmation flow
    with its own throttling and its own failure modes, which is exactly what
    [The mechanism](#the-mechanism--verified-vendor-behaviour-not-inferred) rules out.

- **`lang/en/users.php` and `lang/es/users.php` (modify)** — new keys under the existing `index`
  group, key-for-key identical across both files: the edit-modal warning (now covering role, status
  *and* email per F2), the delete-modal warning, the create-modal Administrator-tier warning (F1), plus
  any flash message shown on return. `snake_case` leaves, per
  [naming.md](../../../docs/conventions/naming.md#translation-keys).

**Confirmed *not* needed**, recorded so reviewers do not re-open them: **no `config/auth.php` change**
and **no new timeout key** (the existing `auth.password_timeout` is reused verbatim); **no
`routes/users.php` change** — adding `password.confirm` there would be dead weight on the
`/livewire/update` path (see the mechanism section) and would additionally block a *name-only* edit,
which Q2 explicitly exempts; **no migration and no column**; **no change to `UserPolicy`** — step-up
freshness is not an ability and does not belong in a policy that `Gate::before` bypasses wholesale for
a Super Admin.

### Out of scope, decided rather than omitted

- **A self-edit is not step-up-gated**, because a self-edit already applies neither a role, a status
  nor a third-party email change (`UpdateUser`'s `$isSelfEdit` branch, 75–92) — there is no privileged
  write to guard.
- **The Roles screen (`App\Livewire\Roles\Index`) is not in scope**, though it performs comparably
  privileged writes. If the pattern should extend there it is a separate story, with its own tests.

### Widened after Phase 4 (2026-08-24) — three findings resolved by human decision, not deferred

`appsec-auditor`'s Phase 4 audit found the step-up guard, as originally scoped (role/status/delete
only), left open exactly the class of escalation this story's own Description names as the threat:
a hijacked or unattended session could still seize an account through two paths the guard didn't
cover, and the control's only remaining barrier had no rate limit of its own. All three were escalated
to the human per [contracts.md](../../../docs/contracts.md)'s Uncertainty Handling Rule, and each was
approved as recommended:

- **F1 — creating an Administrator-tier account is now step-up-gated too.** A hijacked session could
  not promote, suspend or delete under the original scope — but could still `CreateUser` a **new**
  Administrator account, mailed to an address the attacker chooses, which is a *stronger* outcome
  (durable, independently credentialed, survives the victim's password change). **Decided: gate
  `CreateUser` when the submitted role is Administrator-tier, reusing the
  `Role::isAdministratorRole($submittedRole)` check `CreateUser` already computes for its own
  `promoteToAdministrator` gate** (see the file entry below). Ordinary-role creation is unaffected —
  the guard fires only on the Administrator branch, after that branch's own `Gate::authorize()`, same
  ordering rule as everywhere else in this story.
- **F2 — a third-party email change is now step-up-gated too.** `UserPolicy::updateSensitiveAttributes()`'s
  own docblock calls an email rewrite "severity-equivalent to account takeover", yet the original scope
  exempted it, and `RequestEmailChange` mails only the *new* address — the account's current owner gets
  no signal. **Decided: add `$emailChanged` to `UpdateUser`'s step-up condition, for non-self edits
  only** — a self-service email change (the actor changing their own address) remains exempt, since
  `$isSelfEdit` already means there is no third party to protect. This reopens and narrows Q2's original
  "not plain name edits" framing: an email change was never a name edit, and D1's rationale (seizing or
  destroying *another* administrator's account) applies to it exactly as it does to role/status.
- **F3 — `password.confirm.store` gains a rate limit.** Verified in the audit: Fortify's
  `ConfirmablePasswordController::store()` route carries no throttle at all (`config/fortify.php`'s
  `limiters` names `login`/`two-factor`/`passkeys` only), so once this story makes that endpoint the
  single gate in front of role/status/delete/promote-to-Administrator/email-change-of-another-user, an
  attacker holding a hijacked session can guess the account's own password against it without limit.
  **Decided: add a 5/minute limiter**, keyed the same way Fortify's own `login` limiter is (by user id
  when authenticated, falling back to IP). Pre-existing gap, not introduced by this story, but this
  story is what makes it load-bearing — fixed here rather than left as a residual, since the fix is a
  few lines in `FortifyServiceProvider`/`config/fortify.php` and this story is the reason it matters.

Also fixed as part of the same Phase 4 pass, both Low severity: **F4** — a step-up refusal on the
dashboard path (`save()`/`deleteUser()`'s catch blocks) previously logged nothing, so the control's own
refusals were invisible to the audit trail story 0015's F5 established for this same screen; now logs
`Log::warning('Step-up password confirmation required', [...])` before redirecting, matching that
shape. **F5** — the "fail-closed with no session" test exercised the *absent-key* case (already covered
by a sibling test) rather than a genuinely session-less context; renamed/restructured to match what it
actually proves.

## Tests to perform
- [ ] **Role change, stale confirmation:** with `auth.password_confirmed_at` unset (and, separately,
      set to a timestamp older than `config('auth.password_timeout')`), a role change is refused and
      the target's role is **unchanged in the database**. Assert on the row, not only on the response.
- [ ] **Status change, stale confirmation:** same shape, asserting the target's `status` is unchanged.
- [ ] **Deletion, stale confirmation:** same shape, asserting `User::find($id)` is still non-null.
- [ ] **(Phase 4, F2) Third-party email change, stale confirmation:** same shape, editing **another**
      user's email only, asserting `pending_email` is still unset on the target's row.
- [ ] **(Phase 4, F1) Administrator-tier creation, stale confirmation:** submitting a create form with
      the Administrator role selected is refused; no user is created.
- [ ] **Happy path:** with `auth.password_confirmed_at` set to `now()`, each of the three actions
      succeeds. This is the regression guard that proves the story did not ship a blanket refusal.
- [ ] **Boundary:** a confirmation exactly `config('auth.password_timeout')` seconds old is **still
      valid**, and one second older is not — `RequirePassword` uses `>`, not `>=`, and this story must
      match it exactly. Drive it with `Carbon::setTestNow()`.
- [ ] **Must-not-over-block — name only:** with a stale confirmation, a name-only edit of another user
      succeeds and the name is persisted.
- [ ] **Must-not-over-block — self-service email:** with a stale confirmation, an administrator changing
      **their own** email address (an `$isSelfEdit` request) is accepted and parked in `pending_email`.
      *(Narrowed by the Phase 4 F2 decision — an email change of **another** user is now covered by the
      "Third-party email change, stale confirmation" bullet above, not this one.)*
- [ ] **Must-not-over-block — create (ordinary role):** with a stale confirmation, creating a user with
      an **ordinary** role succeeds. *(Narrowed by the Phase 4 F1 decision — Administrator-tier creation
      is now covered by the "Administrator-tier creation, stale confirmation" bullet above.)*
- [ ] **Must-not-over-block — self-edit:** with a stale confirmation, an administrator saving their own
      row with a different role selected succeeds and their role is unchanged, exactly as
      `tests/Feature/Users/IndexTest.php:670` pins today.
- [ ] **Permission refusal takes precedence:** an actor lacking `users.delete` (and, separately, lacking
      `promoteToAdministrator`/`downgrade`/`updateSensitiveAttributes` as relevant) with a **stale**
      confirmation receives the authorization refusal (`AuthorizationException`), never the
      password-confirmation refusal — proves the ordering fix, not just its absence of a crash.
- [ ] **Binds a Super Admin actor:** a Super Admin with a stale confirmation is refused a role change —
      `Gate::before`'s bypass does not exempt the step-up guard, since it is a direct throw, not a
      `Gate` check.
- [ ] **Direct action call:** invoke `App\Actions\Users\UpdateUser` **directly** (resolved from the
      container under `actingAs()`, never through `Livewire::test()`) with a stale confirmation and a
      role change, and assert it throws and writes nothing — the guard must not be a property of the
      Livewire caller alone, per the same rule story 0008a established for these actions.
- [ ] **Fail-closed with no session:** the same direct call in a genuinely session-less context (not
      merely an unset key under `actingAs()`, which a sibling test already covers — Phase 4 finding F5
      caught the original version of this test exercising the wrong case) is refused, not exempted.
- [ ] **(Phase 4, F3) `password.confirm.store` is rate limited:** the 6th password submission within one
      minute is rejected with a throttling message rather than checked against the actual password —
      matching Fortify's own `login` limiter's shape (by user id when authenticated, else IP).
- [ ] **(Phase 4, F4) A step-up refusal is logged:** both the `save()` and `deleteUser()` catch paths
      emit exactly one `Log::warning` carrying `actor_id`, `action`, and the target's `user_id` before
      redirecting (`Log::spy()`/fake), matching story 0015's `Log::info` shape for the same class's
      successful mutations.
- [ ] **The refusal is not a 403.** Against the **direct action call** (the non-dashboard-caller path —
      see "Direct action call" above), assert the thrown exception is
      `PasswordConfirmationRequiredException` rendering 423, **not** an `AuthorizationException`/403 —
      an actor who holds `users.edit` must be able to tell "your confirmation expired" from "you may
      not do this". The dashboard-caller path is covered separately by the redirect round-trip test
      below, which never surfaces a raw status code to assert on.
- [ ] **Re-confirmation restores the ability:** refuse, write the session key the way
      `ConfirmablePasswordController::store()` does, retry, and assert the change now applies.
- [ ] **Sign-out invalidates it:** confirm, sign out, sign in again, and assert the action is refused.
- [ ] **Redirect round-trip (browser, `tests/Browser/UsersIndexTest.php`):** a refused role change
      lands the administrator on the password-confirmation screen, and after submitting their password
      they are returned to `/users`. This is the bullet that catches the `url.intended` hazard named in
      Files to create/modify — it cannot be proven at `Livewire::test()` level.
- [ ] **The affordance renders, and only when it should:** with a stale confirmation the create/edit
      and delete modals each show their notice (selected by `data-test`, never by translated text);
      with a fresh confirmation neither does. Prove the assertion can fail — flip the condition once
      and confirm the test goes red — per this repo's regression-proof convention.
- [ ] **Full-suite regression:** run `php artisan test` and `vendor/bin/pint --format agent` **unscoped**
      (see [base-standards.md](../../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done)).
      This story adds a guard inside an action that many existing tests exercise, so its blast radius
      is the whole Users suite by construction — expect existing tests that change a role or status to
      need the session key seeded, and treat each such amendment as a deliberate, listed change rather
      than a silent fix.

## Expected outcome
An administrator whose password confirmation is older than `config('auth.password_timeout')` cannot
change another user's role, status or email, cannot delete a user, and cannot create a new
Administrator-tier account, until they re-confirm — while name edits, a self-service email change,
ordinary-role creation and self-edits generally are entirely unaffected. The refusal is a distinct,
non-403 response that routes them to Laravel's existing confirmation screen and returns them to
`/users`, and both Users modals (plus the create form, for an Administrator-tier selection) warn about
the requirement *before* the administrator commits to a change. There is one implementation of the
freshness check, one timeout value shared with `settings/security`, no second password-confirmation
flow anywhere in the app, the confirmation screen itself is rate limited, and a refusal leaves a
structured log entry.

## Acceptance criteria
- [ ] `App\Actions\Auth\EnsureRecentPasswordConfirmation` is the **single** implementation of the
      freshness check: it reads `session('auth.password_confirmed_at', 0)` against
      `config('auth.password_timeout')` with the same `>` comparison `RequirePassword` uses, and no
      call site re-derives it inline.
- [ ] **No new timeout is introduced.** `config/auth.php` is unmodified, no `AUTH_*` env key is added,
      and no Users-specific window exists — the value is the same 3 hours `settings/security` relies on.
- [ ] The guard is enforced from **`App\Actions\Users\UpdateUser`** for role, status and third-party
      email changes (so a direct, non-dashboard caller inherits it), from
      **`App\Livewire\Users\Index::deleteUser()`** for deletion, and from
      **`App\Actions\Users\CreateUser`** for an Administrator-tier creation (Phase 4, F1) — in every
      case **above the first write**.
- [ ] The guard fires **only** when a role change, a status change, a third-party email change, or an
      Administrator-tier creation is actually occurring. A name-only edit, a self-service email change,
      an ordinary-role creation, and a self-edit generally, each reach no step-up check.
- [ ] **(Phase 4, F3)** `password.confirm.store` is rate limited at 5/minute, keyed the same way
      Fortify's own `login` limiter is.
- [ ] **(Phase 4, F4)** A step-up refusal on the dashboard path emits exactly one `Log::warning` entry
      before redirecting, carrying `actor_id`, `action`, and the target's `user_id`.
- [ ] A stale or absent confirmation, including no session at all, **fails closed**.
- [ ] **When both a permission refusal and a step-up refusal would apply, the permission refusal wins.**
      The guard runs only after every `Gate::authorize()` call on its branch has passed — never before —
      so an actor who lacks the underlying permission always sees the permission refusal, never a
      re-confirmation prompt. This holds for a Super Admin actor too: the guard is a direct throw, not a
      `Gate` check, so `Gate::before`'s bypass does not exempt it from step-up.
- [ ] The refusal is `App\Exceptions\PasswordConfirmationRequiredException` rendering **423** when it
      reaches an HTTP response uncaught (the direct/non-dashboard caller path) — never a 403 and never an
      `AuthorizationException`, so it is distinguishable from a permission refusal. On the dashboard path
      the same exception is caught and converted to a redirect (see the next criterion) rather than
      rendered.
- [ ] A refused action routes the actor to `route('password.confirm')` and, after confirming, returns
      them to `/users` — proven by a browser test, not by reading vendor code.
- [ ] The edit and delete Users modals show a re-confirmation notice when — and only when — the
      confirmation is stale, driven by the **same** predicate the guard uses, each with a `data-test`
      hook; the create form warns when an Administrator-tier role is selected (Phase 4, F1); new keys
      present in **both** `lang/en/users.php` and `lang/es/users.php`.
- [ ] No password field is added to any Users modal or the create form; re-confirmation happens on
      Fortify's own screen.
- [ ] `routes/users.php` is unchanged, and `App\Policies\UserPolicy` is unchanged.
- [ ] Every existing test amended to seed the confirmation session key is listed explicitly in the
      implementation notes, and no existing *assertion* is weakened.
- [ ] The full unscoped suite is green.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite, run **unscoped** — including at least one
      browser test for the redirect round-trip and one for the modal affordance.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Phase 4 should pay particular attention to: the guard
      firing on exactly the intended branches (an over-block is a usability regression, an under-block
      is the whole finding), the fail-closed behaviour with no session, and whether the 423 response
      discloses anything it should not.
- [ ] Documentation updated (docs-keeper):
      - [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md) — a new
        section for step-up authentication as a **third** authorization layer alongside route
        middleware and policies: what it protects, why it is an in-method check rather than route
        middleware, and why it is deliberately not a `UserPolicy` ability.
      - [`docs/security/livewire-authorization.md`](../../../docs/security/livewire-authorization.md) —
        its `PersistentMiddleware` table already records `password.confirm` as **not** persistent;
        this story is the first code to act on that row, so it becomes that row's worked example.
      - [`docs/api/routes.md`](../../../docs/api/routes.md)'s `users.index` subsection — the
        "the middleware column understates what protects this route" bullet gains the step-up
        requirement.
      - [`docs/conventions/base-standards.md`](../../../docs/conventions/base-standards.md) —
        `app/Actions/Auth/` added to the directory listing, and
        `PasswordConfirmationRequiredException` (423) beside the two existing domain exceptions.
- [ ] Acceptance criteria met.
- [ ] **Known limitation, recorded rather than fixed — `settings/security` still relies on route
      middleware alone**, so its own `/livewire/update` round-trips are not re-checked for password
      freshness. Pre-existing, deliberately out of scope, and a candidate for its own follow-up story.

## Dependencies and related work
- **Split from story [0015 — Harden the Users CRUD backend's security posture](../done/0015-harden-users-crud-security-posture.md)**
  (finding **F13**), on 2026-08-23, mirroring the [0008](../done/0008-super-admin-role-invariants.md) /
  [0008a](../done/0008a-centralize-administrator-role-identification.md) precedent. 0015 records the
  split in its own Dependencies section and in its Q2 resolution; this story owns F13 entirely, and
  0015 owns no part of it.
- **Independent of 0015 — either may land first.** This story adds a *new* guard to
  `updateExistingUser()`'s role/status path and to `deleteUser()`; 0015 changes those methods' other
  concerns (audit logging, the self-delete no-op, the disclosure gates, the `$status` property type).
  Neither depends on the other's outcome.
  > ⚠️ **They must not be implemented concurrently.** Both edit `app/Livewire/Users/Index.php` and
  > `resources/views/livewire/users.blade.php`, and per
  > [`docs/contracts.md`](../../../docs/contracts.md)'s Parallel Agent File-Ownership Rule two agents
  > writing one file is a lost-edit bug waiting to happen — a rule this project adopted after a real
  > incident on this exact Blade file (see
  > [`docs/errors-log.md`](../../../docs/errors-log.md#two-agents-dispatched-in-parallel-both-wrote-to-the-same-blade-view--2026-08-16)).
  > Whichever story reaches Phase 3 second rebases onto the first and re-verifies its own line
  > citations.
- **Depends on shipped code only** — `laravel/fortify`'s password-confirmation flow (live, and the
  sole protection on `settings/security`), `App\Actions\Users\UpdateUser`'s post-0008a shape, and
  story 0006's Users modals. Nothing unfinished.
- **Task ordering:** `0015` sorts before `0015a`, satisfying
  [`docs/workflow.md`](../../../docs/workflow.md#task-ordering-rule)'s rule, and the two are siblings
  rather than a dependency pair.

## Human decisions (recorded before Phase 3)
- **D1 — Step-up authentication is required, for role/status changes and deletion only; not for plain
  name edits. Approved (2026-08-23, originally Q2 on story 0015).** The comparison drawn was
  `settings/security`'s existing `password.confirm` requirement for 2FA and passkeys: seizing or
  destroying another administrator's account is at least that consequential a trust boundary.
- **D2 — Reuse the app's existing global `config('auth.password_timeout')` (3 h / 10800 s). Approved
  (2026-08-23).** A Users-specific, shorter window was considered and **rejected**: it would add a
  second timeout to keep in sync, and a re-confirmation prompt an administrator meets several times
  an hour is one they learn to click through, which weakens the control rather than strengthening it.
- **D3 — The check is an in-method guard, not route middleware. Approved (2026-08-23).** Forced by
  vendor behaviour rather than preference — `RequirePassword` is absent from Livewire's
  `PersistentMiddleware` allow-list, so route middleware would leave `save()` and `deleteUser()`
  unguarded on `/livewire/update`. See [The mechanism](#the-mechanism--verified-vendor-behaviour-not-inferred).
- **D4 — A failed check routes the actor to re-confirm, following `settings/security`'s precedent.
  Approved (2026-08-23).** Not a bare 403, and not an in-modal password field.
  > **Accepted UX wart, named rather than hidden:** the redirect leaves the modal, so an
  > administrator who has already filled the edit form loses those unsaved field values on the way to
  > re-confirm. The mitigation is the *warning shown when the modal opens*, which is why the
  > affordance is part of this story rather than a follow-up — an administrator should learn about
  > the requirement before typing, not after clicking Save. Preserving and restoring the in-flight
  > form state was considered and left out: it would mean persisting user-supplied form state across
  > a redirect for a security-relevant screen, which is a larger design decision than this story
  > should make on its own.
- **D5 — The story is fullstack, not backend. Approved (2026-08-23).** Verified against the shipped
  view: `resources/views/livewire/users.blade.php` has no password-confirmation affordance of any kind
  to extend, so the frontend half is new work rather than a tweak.
- **D6 — `CreateUser` is step-up-gated when the submitted role is Administrator-tier. Approved
  (2026-08-24, Phase 4 finding F1).** The original scope (role/status/delete on an *existing* target)
  left open a stronger outcome for a hijacked session: mint a brand-new, independently-credentialed
  Administrator account instead of seizing one. Ordinary-role creation is unaffected.
- **D7 — `UpdateUser`'s step-up condition includes a third-party email change. Approved (2026-08-24,
  Phase 4 finding F2).** `UserPolicy::updateSensitiveAttributes()` already treats an email rewrite as
  account-takeover-equivalent; the original scope's "not plain name edits" framing (Q2) exempted email
  changes as if they were name edits, which they are not. A self-service email change (the actor's own
  address) stays exempt — `$isSelfEdit` already means there is no third party to protect, the same
  reasoning D1 already applied to role/status.
- **D8 — `password.confirm.store` gains a 5/minute rate limit. Approved (2026-08-24, Phase 4 finding
  F3).** Pre-existing gap (Fortify ships no throttle on this route), not introduced by this story, but
  this story is what makes the endpoint load-bearing for the highest-value mutations on this screen —
  fixed here rather than left as an unowned residual.

## Provenance
Finding **F13**, raised by `appsec-auditor` during story 0004's Phase 4 security audit and carried
into story [0015](../done/0015-harden-users-crud-security-posture.md) as one of ten consolidated non-blocking
items. Split into this standalone story on 2026-08-23 after `code-reviewer`'s Phase 2 INVEST review of
0015 (blocking finding **B4**: F13's implementation guidance named two mechanisms that do not exist;
**B6**: it carried no Gherkin at all). The mechanism described above replaces that guidance and was
verified against installed vendor source and this repo's own config rather than inferred.
