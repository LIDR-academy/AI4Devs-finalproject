# [0007] Non-active user status blocks sign-in (Fortify integration)

## Description
Enforce the `users.status` value inside the authentication flow so a user whose status is
*Inactivo* or *Suspendido* can never obtain a session: sign-in is refused and they are told the
account is not active. Enforcement covers all three paths that grant a **fresh** session —
email+password (including two-factor accounts), passkey sign-in, and remember-me cookie
re-authentication. Restoring a user's status to *Activo* restores sign-in on their next attempt.
The `status` column itself is **not** created here — it is owned by sibling story **0003**.

## Type
backend | includes database-expert: **no**

> **Dependency scope, confirmed.** This story depends on story **0003** only — the `users.status`
> column, the `App\Enums\UserStatus` enum and cast, and `UserFactory`'s status states. It does
> **not** depend on story **0004** (the Users CRUD screen): nothing here reads, calls or renders
> that component, and an administrator being able to *set* a status is a separate capability from
> the login flow *honouring* it. 0007 can therefore be implemented and shipped as soon as 0003
> lands, in parallel with 0004.

## Gherkin
```gherkin
Feature: Non-active account status blocks sign-in

  # --- Core blocking / restoring ---

  Scenario Outline: A non-active user cannot sign in
    Given a registered user whose status is "<status>"
    When that user tries to sign in with their correct credentials
    Then sign-in is refused and no session is granted
    And they are told the account is not active

    Examples:
      | status     |
      | Inactivo   |
      | Suspendido |

  Scenario: An active user signs in normally
    Given a registered user whose status is "Activo"
    When that user signs in with their correct credentials
    Then they reach their dashboard

  Scenario: Reactivating a user restores sign-in
    Given a registered user who was blocked from signing in because their status was "Suspendido"
      and whose status a user administrator has since set back to "Activo"
    When that user tries to sign in with their correct credentials
    Then they reach their dashboard

  # --- Two-factor authentication path ---

  Scenario: A non-active user with two-factor authentication never reaches the code step
    Given a registered user whose status is "Suspendido" and who has two-factor authentication enabled
    When that user tries to sign in with their correct credentials
    Then sign-in is refused before the two-factor authentication code step is ever offered
    And no pending two-factor challenge is left behind for them

  Scenario: A user suspended mid-challenge is refused at the two-factor code step
    Given a registered user with a pending two-factor challenge whose status became "Suspendido"
      after the password step
    When that user submits a valid authentication code
    Then sign-in is refused and no session is granted

  # --- Passkey path ---

  Scenario: A non-active user cannot sign in with a passkey
    Given a registered user whose status is "Suspendido" and who owns a registered passkey
    When that user tries to sign in with that passkey
    Then sign-in is refused and no session is granted

  # --- Remember-me path ---

  Scenario: A remember-me cookie stops granting access once the user is suspended
    Given a registered user who signed in choosing to be remembered, whose session has since ended
      and whose status a user administrator then set to "Suspendido"
    When that user returns to the dashboard carrying only their remember-me cookie
    Then access is refused and no session is granted

  # --- Account-disclosure boundary ---

  Scenario Outline: A wrong password reveals nothing about account status
    Given a registered user whose status is "<status>"
    When that user tries to sign in with an incorrect password
    Then they are told only that the credentials are invalid, with no mention of account status

    Examples:
      | status     |
      | Inactivo   |
      | Suspendido |

  Scenario: The refusal message does not reveal which non-active status applies
    Given a registered user whose status is "Suspendido"
    When that user tries to sign in with their correct credentials
    Then the message states only that the account is not active, naming no specific status

  # --- Abuse protection ---

  Scenario: Blocked sign-in attempts count toward the sign-in rate limit
    Given a registered user whose status is "Suspendido"
    When that user exceeds the allowed number of sign-in attempts with correct credentials
    Then further attempts are throttled exactly as repeated failed sign-ins are
```

## Files to create/modify

- `app/Enums/UserStatus.php` — **not created here.** Owned by story 0003; consumed by this story.
  This story only requires that a single "active" sentinel case exists and that `$user->status`
  is comparable against it by enum identity.
- `app/Actions/Fortify/AuthenticateUser.php` — **new.** Single-purpose invokable action,
  `__invoke(Request $request): ?User`. Resolves and verifies credentials through the guard's
  `UserProvider` (`retrieveByCredentials()` + `validateCredentials()` + `rehashPasswordIfRequired()`),
  then enforces `$user->isActive()`. Returns `null` for bad credentials so Fortify's existing
  generic `auth.failed` message and rate-limiter increment run unchanged; throws
  `ValidationException::withMessages([Fortify::username() => [__('…')]])` **only** when credentials
  are valid but the status blocks sign-in.
  > Replicating `rehashPasswordIfRequired()` is **required, not optional**: `Fortify::authenticateUsing`
  > bypasses `guard->attempt()`, so today's implicit password-rehash-on-login is silently lost if the
  > action hand-rolls a `User::where()` + `Hash::check()` instead of going through the provider.
  > Constructor injection is used here (matching Fortify's own `AttemptToAuthenticate` /
  > `RedirectIfTwoFactorAuthenticatable`), a deliberate, justified departure from this repo's
  > Livewire per-method-injection convention — this is not a Livewire component action.
- `app/Listeners/RejectNonActiveUserLogin.php` — **new.** Listener on
  `Illuminate\Auth\Events\Login` that logs the user back out and invalidates the session when
  `$user->isActive()` is false. Exists **specifically** to cover remember-me/recaller
  re-authentication, which reaches neither of the two callbacks below (it resolves the user via
  `retrieveByToken()`), and which fires `Login` on the recaller path. It is a safety net, not the
  primary mechanism — see [Functional decisions](#functional-decisions).
- `app/Providers/FortifyServiceProvider.php` — register
  `Fortify::authenticateUsing(app(AuthenticateUser::class));` in `configureActions()`, and add a
  passkey configuration step calling
  `Passkeys::authorizeLoginUsing(fn ($request, $user, $passkey) => $user->isActive())`
  (`Laravel\Passkeys\Passkeys`).
  > **Pass an object instance, not a class string.** Unlike `createUsersUsing()` /
  > `resetUserPasswordsUsing()`, `authenticateUsing()` stores the raw callable and later calls
  > `call_user_func($callback, $request)` — a bare class string is not a valid target there.
- `app/Models/User.php` — add `public function isActive(): bool` comparing `$this->status`
  against the enum's active case, mirroring the existing `initials()` /
  `hasEnabledTwoFactorAuthentication()` shape. The `@property` line for `status` is added by
  story 0003. **This file is also touched by 0003 and 0004 — sequence 0003 first and rebase this
  story on top; 0004 touches a disjoint part of the same file (no `@property`/`casts()` conflict),
  so the two can proceed independently.**
- `app/Providers/AppServiceProvider.php` (or the app's event discovery) — wire the listener to
  `Illuminate\Auth\Events\Login`. Exact registration point is the Phase 3 implementer's call,
  following whatever this app already does for event wiring.
- `tests/Feature/Auth/AuthenticationTest.php` — extend (do **not** create a parallel file); it
  already owns the login-refusal convention (`assertSessionHasErrorsIn('email')`).
- `tests/Feature/Auth/TwoFactorChallengeTest.php` — extend for the two-factor cases.
- New test file for the passkey and remember-me paths — path to be agreed with `backend-qa` in
  Phase 3. No passkey **sign-in** test or harness exists in the repo today (`SecurityTest.php`
  covers passkey *management* only).

Not touched: `config/fortify.php` (no config surface for this), `routes/*` (no new routes),
`database/migrations/*` (the column is 0003's).

## Tests to perform

- [x] Happy path: an *Activo* user signs in normally — `assertSessionHasNoErrors()`,
      `assertRedirect(route('dashboard'))`, `assertAuthenticated()`. Control case proving the
      check does not block legitimate sign-in.
- [x] Happy path: status restored to *Activo* → the **next** attempt succeeds. Proves the check
      is re-evaluated per attempt and is not cached or session-sticky.
- [x] Negative (dataset over *Inactivo* / *Suspendido*): sign-in refused with correct
      credentials — `assertGuest()`, error present on the `email` key, and
      `assertDatabaseMissing('sessions', ['user_id' => $user->id])` so the assertion proves no
      session row was ever persisted rather than merely that the redirect looked like a failure.
- [x] Negative (dataset over *Inactivo* / *Suspendido*): a non-active user with two-factor
      authentication enabled is refused **before** the challenge — response is not a redirect to
      `two-factor.login`, `assertGuest()`, and the pending-challenge session key Fortify's
      `RedirectIfTwoFactorAuthenticatable` sets (`login.id`) is absent. Its absence is what proves
      the block ran before that pipe, not after.
- [x] Negative: a seeded pending two-factor challenge for a now-*Suspendido* user, submitted with
      a valid authentication code, still refuses — `assertGuest()`. Defense-in-depth for the
      status-changed-mid-challenge race.
- [x] Negative: passkey sign-in refused for a non-active user. A full WebAuthn ceremony is not
      practical here; assert against the enforcement point (`Passkeys::allowsLogin()` /
      the registered `authorizeLoginUsing` callback) with a non-active user's passkey rather than
      fabricating a fake assertion payload through `POST /passkeys/login`.
- [x] Negative: remember-me recall refused — sign in as *Activo* with `remember: true`, capture
      the recaller cookie, flush the server-side session, set status to *Suspendido*, then request
      `/dashboard` carrying only that cookie → `assertRedirect(route('login'))`, `assertGuest()`.
- [x] Negative/disclosure (dataset over *Inactivo* / *Suspendido*): wrong password + non-active
      status returns a message **byte-identical** to the existing wrong-password message asserted
      in `AuthenticationTest`'s "users can not authenticate with invalid password" — reuse that
      test's expected string as the baseline.
- [x] Edge: blocked attempts count toward Fortify's login limiter
      (`Limit::perMinute(5)` in `FortifyServiceProvider::configureRateLimiting()`) — five
      correct-credential attempts against a *Suspendido* user, sixth is throttled.
- [x] Edge: password rehash on login still occurs through `AuthenticateUser` (guard against the
      `rehashPasswordIfRequired()` regression noted above).
- [x] Regression — run the **full** suite (`php artisan test --compact`), not just
      `tests/Feature/Auth/**`. At-risk files: `tests/Feature/Auth/AuthenticationTest.php`,
      `tests/Feature/Auth/TwoFactorChallengeTest.php` (both post to `login.store` with
      factory-made users), and secondarily `PasswordResetTest.php`, `RegistrationTest.php`,
      `EmailVerificationTest.php`. All break unless `UserFactory`'s default status is the active
      case — see [Dependencies](#dependencies-risks--open-questions).
- [x] Regression: `tests/Feature/Settings/**` and every other `actingAs()`-based test must stay
      green **unchanged** — they bypass the login flow entirely, and this story's scope
      deliberately leaves them unaffected. A break there signals the enforcement leaked into
      per-request territory, which is out of scope.

## Expected outcome
A user whose status is *Inactivo* or *Suspendido* cannot obtain a session by any means that
grants a fresh one: the login form refuses them with "the account is not active", a two-factor
account never reaches the code step, a passkey sign-in is rejected, and a remember-me cookie no
longer resurrects access. An administrator setting the status back to *Activo* restores sign-in on
the very next attempt, with no cache to clear or session to reset. Everything about an *Activo*
user's sign-in — messages, redirects, throttling, password rehashing — is byte-for-byte unchanged.

## Acceptance criteria
- [x] A user whose status is not the active case cannot obtain a session via email+password,
      including accounts with two-factor authentication enabled.
- [x] The two-factor block happens **before** the challenge is offered — no pending-challenge
      session state is created, and no authentication code is consumed.
- [x] Passkey sign-in is blocked for a non-active user, via `Passkeys::authorizeLoginUsing()`
      (passkey login does not pass through Fortify's pipeline and is not covered by
      `authenticateUsing`).
- [x] Remember-me/recaller re-authentication is blocked for a non-active user, via the
      `Login`-event listener.
- [x] Restoring the status to the active case restores sign-in on the next attempt, with no
      further administrative step.
- [x] Wrong credentials produce today's generic message unchanged, whatever the user's status; the
      "account is not active" message is reached **only** after credentials verify correct, and
      never names which non-active status applies.
- [x] The refusal message is wrapped in `__()` and surfaces on the `email` field via Fortify's
      standard `ValidationException` convention — no new UI wiring in
      `resources/views/livewire/auth/login.blade.php`.
- [x] Password rehash-on-login behavior is preserved through the custom callback.
- [x] Already-authenticated live sessions are **not** terminated by this story (explicitly out of
      scope — see Functional decisions).

## Definition of Done
- [x] Tests written and green (new cases + the full-suite regression run).
- [x] Code reviewed (code-reviewer).
- [x] No security findings (appsec-auditor) — with the disclosure tradeoff below reviewed
      explicitly as an intentional, PRD-mandated decision rather than a candidate finding.
- [x] Documentation updated (docs-keeper) — `docs/architecture/authentication.md` gains the
      status check as part of the real sign-in flow, covering all three enforcement points.
- [x] Acceptance criteria met.
- [x] Story 0003 merged first; this story rebased on top of it. Story 0004 is **not** a prerequisite.

---

## Functional decisions

1. **Three enforcement points, not one.** `Fortify::authenticateUsing()` covers email+password
   *and* two-factor accounts, because `RedirectIfTwoFactorAuthenticatable::validateCredentials()`
   consults the same callback before it writes the pending-challenge session state — verified
   against the installed vendor code. Passkey login bypasses Fortify's pipeline entirely and needs
   `Passkeys::authorizeLoginUsing()`. Remember-me recall reaches neither and needs the
   `Login`-event listener. *Rejected:* using the `Login` listener as the **primary** mechanism —
   it fires only after a session is granted, so on the two-factor path it would force-log-out a
   momentarily-real session after the user already spent a valid authentication code, instead of
   preventing the session. *Rejected:* `Fortify::authenticateThrough()` — it replaces the whole
   pipeline array, so we would hand-maintain `EnsureLoginIsNotThrottled`, `CanonicalizeUsername`,
   the two-factor conditional and `PrepareAuthenticatedSession` ourselves, risking silent loss of
   throttling on a Fortify upgrade. *Rejected:* a custom guard/`UserProvider` — affects every
   `Auth::user()` resolution app-wide for a login-time concern.
2. **Credentials first, status second.** Status is only consulted once credentials have verified
   correct. A wrong email or wrong password takes Fortify's existing generic-failure path
   unchanged, so this story adds no new account-enumeration signal there.
3. **The "account is not active" message is a deliberate, PRD-mandated disclosure.** It tells
   someone who already holds valid credentials that the account exists but is blocked. This is
   required verbatim by `docs/PRD/PRD.md` ("And they are told the account is not active"). The
   leak is narrowed by decision 2 (valid credentials required to see it) and by not naming which
   non-active status applies. Flag to `appsec-auditor` in Phase 4 as intentional.
4. **Already-live sessions are out of scope** (human-confirmed). Suspending a user prevents them
   obtaining a *new* session; it does not terminate one they already hold. The PRD Gherkin speaks
   only of sign-in time ("tries to sign in", "on their next attempt"), and per-request enforcement
   would touch virtually every `actingAs()`-based feature test — a distinct piece of scope that
   would fail INVEST "Small" if bundled here. Recorded as a follow-up story below.
5. **Scenarios and tests are written against the `UserStatus` enum, not raw strings**
   (human-confirmed), for type safety at every comparison site. Gherkin keeps the business labels
   *Activo* / *Inactivo* / *Suspendido* because those are the terms the PRD and the Users screen
   use.

## Dependencies, risks & open questions

**Hard dependency — story 0003 must ship first.** This story creates no column, no enum and no
migration. From 0003 it needs, and 0003 now definitively provides:

- `users.status`, **NOT NULL**, `VARCHAR(20)`, so no row is ever `NULL` and `isActive()` never has
  to decide what `NULL` means. **The column default is `inactive`, not `active`** — a human
  decision recorded in 0003, following the inactive-until-verified invariant. That is the *column*
  default, which governs rows created outside the application (and Fortify self-registration); it
  is deliberately **not** the same as the factory default below.
- `App\Enums\UserStatus`, a backed string enum cast in `User::casts()`, with the three cases now
  finalized by 0003: `Active = 'active'`, `Inactive = 'inactive'`, `Suspended = 'suspended'`
  (TitleCase keys per `docs/conventions/code-style.md`). `isActive()` compares against
  `UserStatus::Active`.
- `UserFactory`: `definition()` defaults to `UserStatus::Active` (paired with the existing
  `'email_verified_at' => now()`, so the default fixture is a coherent verified-and-active
  account), plus `inactive()` and `suspended()` states in the existing `unverified()` /
  `withTwoFactor()` shape. 0003 also changes **`unverified()` to set `status => Inactive`**, so
  that state can no longer construct an active-but-unverified user.

**Risk — the factory default is the single point of mass regression, and the column default is a
decoy.** Every existing auth test builds users with `User::factory()->create()` and no status; they
stay green only because 0003's *factory* default is the active case, even though the *column*
default is `inactive`. Two concrete consequences for this story:
- Do not "simplify" by reading the column default and assuming fixtures inherit it — they do not.
- 0003's `unverified()` change means every existing caller of that state now produces an `Inactive`
  user. Those tests authenticate with `actingAs()` rather than through the login form, so this
  story's check does not reach them — but any *new* test here that reaches for `unverified()`
  expecting a signed-in-capable user will fail, correctly.

This is why the full suite, not just `tests/Feature/Auth/**`, is in the DoD.

**Risk — the passkey path is the easy one to miss.** An implementer who reads only "integrate with
Fortify's authentication pipeline" will register `authenticateUsing` alone and ship a silent
bypass, because passkey login has its own controller. The passkey acceptance criterion is listed
separately for exactly this reason.

**Known gap, accepted:** a suspended user holding a live session keeps it until it expires
naturally (decision 4).

**Open question deferred to Phase 3, not blocking:** the test path/harness for passkey sign-in.
No passkey-login test exists in the repo, and a full WebAuthn ceremony in Pest is disproportionate;
the recommendation is to assert against the enforcement callback directly. `backend-qa` and
`backend-expert` settle the exact shape when they write it.

## Technical tasks for the backlog

1. Add `isActive()` to `App\Models\User` (after 0003 lands), comparing `$this->status` against `UserStatus::Active`.
2. Build `App\Actions\Fortify\AuthenticateUser`, preserving `rehashPasswordIfRequired()`.
3. Register `Fortify::authenticateUsing()` with an **instance** in `FortifyServiceProvider`.
4. Register `Passkeys::authorizeLoginUsing()` for the passkey path.
5. Build and wire `RejectNonActiveUserLogin` on `Illuminate\Auth\Events\Login` for remember-me.
6. Extend `AuthenticationTest` / `TwoFactorChallengeTest`; add passkey + remember-me coverage.
7. **Follow-up story (not this one):** immediately terminate the live sessions of a user who
   becomes non-active — per-request `EnsureUserIsActive` middleware, or deleting the user's rows
   in the `sessions` table (`sessions.user_id` already supports this per
   `docs/database/schema.md`).

---

## Closure — Phase 7 (2026-08-17)

Closed and moved to `ai-spec/tasks/done/`. All seven phases passed. Every checkbox above was
verified against the real files at closure time rather than carried over from a phase report —
each of the ten behavioural test items maps to a named, existing test:

| Test item | Test |
| --- | --- |
| Active user signs in | `an active user signs in normally` (`tests/Feature/Auth/AuthenticationTest.php`) |
| Reactivation restores sign-in | `a user reactivated after being suspended can sign in on their next attempt` (same file) |
| Non-active refused, no `sessions` row | `a non-active user cannot sign in with correct credentials` (dataset: inactive/suspended) |
| Two-factor blocked before the challenge | `a non-active user with two-factor authentication enabled never reaches the challenge step` (`TwoFactorChallengeTest.php`, dataset) |
| Suspended mid-challenge | `a user suspended mid-challenge is refused even with a valid authentication code` (same file) |
| Passkey refused | `a suspended user cannot sign in with a passkey` (`PasskeyAuthenticationTest.php`) |
| Remember-me recall refused | `a remember-me cookie stops granting access once the user is suspended` (`RememberMeAuthenticationTest.php`) |
| Wrong password discloses nothing | `a wrong password reveals nothing about a non-active account status` (dataset) |
| Blocked attempts hit the limiter | `blocked sign-in attempts against a suspended user still count toward the login rate limiter` |
| Password rehash preserved | `password rehash on login still occurs for an active user` |

The out-of-scope boundary from functional decision 4 is pinned by its own test as well — `an
already-authenticated user who becomes non-active keeps their live session`.

### Final full-suite result

**345 tests, 345 passed, 843 assertions, ~92 s — the whole suite green, exit 0**, run at closure as
a single isolated `./vendor/bin/sail test --compact`. This includes the `Browser` testsuite, which
was re-run on its own to confirm it was not skipped: **9 passed, 57 assertions**.

**Disposition of the `tests/Browser/UsersIndexTest.php` failures reported during Phase 5.** They are
**not** a regression from this story, and they are not a defect in that test file either — they are
an artifact of *how* the suite was invoked. Running `php artisan test` from the **host** executes
outside the Docker Compose stack, where neither the database nor the served application is
reachable: the closure run reproduced it and the underlying error is
`SQLSTATE[HY000] [2002] php_network_getaddresses: getaddrinfo for mysql failed: Name does not
resolve (Host: mysql, Port: 3306, Database: testing)` — a connectivity failure raised before any
assertion runs, not a failed expectation. The same tests pass when the suite is run the way this
project actually runs it, through `./vendor/bin/sail test` (i.e. inside the `laravel.test`
container, alongside the `mysql` service). CI is unaffected for the reason already recorded for
task 0006b: it builds assets fresh and runs the suite inside its own service container.

Two operational notes worth carrying forward, both observed during this closure run:

- **Run the suite through Sail, not the host PHP.** A host `php artisan test` will not fail
  loudly as "misconfigured" — it fails as a wall of ordinary-looking red tests, which is exactly
  how a green story can be mistaken for a broken one.
- **A leftover Playwright `run-server` process can inherit the test run's stdout** and hold the
  pipe open after PHP has already exited, so a piped invocation (`… | tail`) appears to hang
  indefinitely with zero output. Redirect to a file instead of piping when running the suite in
  the background.

### Phase-by-phase record

- Phase 2 (INVEST) — passed on the first pass.
- Phase 3 (TDD) — implementation and tests completed.
- Phase 4 (`appsec-auditor`) — one re-audit cycle; **four findings, all fixed and confirmed
  closed**. The audit's durable output is [`docs/security/login-status-enforcement.md`](../../../docs/security/login-status-enforcement.md),
  indexed from [`docs/security/README.md`](../../../docs/security/README.md), which is authoritative
  for this story's security reasoning. Two of those findings left visible traces in the tree: the
  `Passkeys::authorizeLoginUsing()` callback's user parameter became nullable (F2, with
  `a soft-deleted user cannot sign in with a passkey, and the attempt is refused cleanly rather than
  throwing` proving it), and `App\Listeners\ActivateVerifiedUser` gained a third guard once
  `Inactive` started denying access — covered by the added `EmailChangeTest.php` case
  `confirming a pending email change does not reactivate a user who was deactivated after a genuine
  prior verification`. Note this is the one qualification on the "Settings tests stay green
  **unchanged**" regression item above: no existing test in `tests/Feature/Settings/**` was
  modified — that file was only **added to**, by the security follow-up.
- Phase 5 (`code-reviewer`) — approved on the second pass, after one blocking finding (the wrong
  refusal message in `AuthenticateUser`) and two minor ones (a missing live-session-boundary test,
  a stale comment) were fixed.
- Phase 6 (`docs-keeper`) — [`docs/architecture/authentication.md`](../../../docs/architecture/authentication.md)
  gained the **Sign-in: the account-status block** section covering all three enforcement points
  (plus three stale statements this story invalidated, corrected in the same pass);
  [`docs/database/schema.md`](../../../docs/database/schema.md),
  [`docs/README.md`](../../../docs/README.md),
  [`docs/errors-log.md`](../../../docs/errors-log.md) (eleventh → twelfth entry), the root
  `README.md` and the Spanish delivery `readme.md` were updated alongside.
- Phase 7 (closure) — this file moved to `ai-spec/tasks/done/`.

### Link-integrity check on the stage move

Per [`docs/workflow.md`](../../../docs/workflow.md#link-integrity-check-on-every-stage-move).
`in-progress/` and `done/` sit at the **same** directory depth (both three levels below the repo
root), so unlike the `new` → `in-progress/` move this one changes no relative-path resolution.
Verified rather than assumed: before this closure note was added the file contained **no**
path-relative links at all — only two intra-file anchors, `#functional-decisions` and
`#dependencies-risks--open-questions`, both of which still match real headings here. The
`../../../docs/…` links introduced by this note are written for the `done/` location and were
resolved against the filesystem.

**Follow-up recorded, not done here:** technical task 7 above — terminating a non-active user's
**already-live** sessions — remains open by design (functional decision 4).
