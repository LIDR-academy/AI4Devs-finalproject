# [0015b] Log refused privileged attempts on the admin screens (split from 0015's F-C)

## Description
Both permission-gated admin CRUD screens — `App\Livewire\Users\Index` and `App\Livewire\Roles\Index` —
and the domain actions behind them (`CreateUser`, `UpdateUser`, `RequestEmailChange`,
`EnforceAdministratorPermissionGrant`, `EnforceGrantorPermissionScope` — brought into scope by the Q5
decision below) log a structured line for every **successful** privileged mutation and nothing at all
for a **refused** one. An actor repeatedly probing an Administrator-holding target, or hammering a
rate-limited action, therefore leaves no trace anywhere: the refusal is correct, but it is invisible.
This story adds a structured audit line on the refusal paths of both screens and their actions, so
repeated unauthorized probing is detectable after the fact — including from a future non-dashboard
caller. It is a **cross-cutting** pass by design — the identical gap exists everywhere a `Gate::authorize()`
or rate-limit refusal can fire on these two domains, and closing it in one place only would leave the
same hole elsewhere while creating a second, divergent logging convention.

> **Split out of story [0015](../done/0015-harden-users-crud-security-posture.md)**, where it was
> Phase 4 finding **F-C**, deferred by explicit human decision (2026-08-24) rather than fixed in
> place, following the [0008](../done/0008-super-admin-role-invariants.md) /
> [0008a](../done/0008a-centralize-administrator-role-identification.md) and 0015/0015a precedent.
> 0015's own text records the deferral in its "Deferred, deliberately — not silently dropped"
> section; this file is the follow-up that section implies and that `code-reviewer`'s Phase 5 review
> of 0015 found missing.

> ⚠️ **This story had no Phase 1 debate.** Its scope came pre-specified from a security finding
> rather than from a Three Amigos session, so it sits in `ai-spec/tasks/` as a pre-scoped backlog
> item. Per [`docs/contracts.md`](../../../docs/contracts.md)'s Uncertainty Handling Rule its five open
> questions required a human answer before Phase 3 could start — **all five are now answered**, see
> [Decisions](#decisions-recorded-2026-08-24-by-human-answer--see-each-q-below-for-the-full-reasoning)
> below. Phase 2 (`code-reviewer`, INVEST + doc-consistency check) ran against that Decisions section
> and **passed with required corrections**, which this revision applies — see the "Blocking before
> Phase 3" items folded into the sections below (stale line numbers re-verified against `HEAD`, the
> already-shipped step-up refusal log from story 0015a reconciled with this story's scope, the helper
> design widened to accept an explicit actor, two missing refusal sites enumerated, and a sixth
> Gherkin scenario added for the domain-action case).

## Type
backend | includes database-expert: no

This app has **no audit-log table** and this story does not add one — the deliverable is structured
log lines, the same shape both screens already use for their success paths. No migration, no column,
no route, no ability, no UI.

## Gherkin
```gherkin
Feature: Audit trail for refused privileged attempts

  Scenario: A refused user-management attempt is recorded
    Given a user administrator who lacks the administrator-management permission
    When they attempt to open the edit form of another user holding the Administrator role
    Then the refusal is recorded in a structured log entry naming the actor, the attempted ability and the target

  Scenario: A refused role-management attempt is recorded
    Given a signed-in administrator who lacks the role-management permission
    When they attempt to open the role edit form directly
    Then the refusal is recorded in a structured log entry naming the actor, the attempted ability and the target

  Scenario: A refused rate-limited creation is recorded
    Given a user administrator who has exhausted their hourly user-creation allowance
    When they submit a further create request
    Then the refusal is recorded in a structured log entry distinguishable from an authorization refusal

  Scenario: A refusal log entry never carries a credential
    Given a user administrator whose privileged attempt has just been refused
    When the refusal is recorded
    Then the entry contains no password, no invitation token, no email-change hash and no session identifier

  Scenario: A permitted privileged action produces no refusal entry
    Given a user administrator who holds every permission the action requires
    When they complete that action successfully
    Then no refusal entry is recorded, and the existing success entry is unchanged

  Scenario: A refused attempt through a domain action is recorded even outside the dashboard
    Given a caller other than the Livewire dashboard that invokes a Users or Roles domain action directly
    When that action refuses the attempt for lacking the required permission
    Then the refusal is recorded in a structured log entry with the same shape the dashboard's own refusals use
```

## Files to create/modify

Line numbers below are **re-verified against `HEAD` on 2026-08-24, after both story 0015 and story
0015a closed** (both now sit in `ai-spec/tasks/done/`; `in-progress/` is empty) — this revision
corrects the previous pass's citations, which `code-reviewer`'s Phase 2 review found stale against
0015a's own changes (its own predicted failure mode, see [Dependencies](#dependencies-and-related-work)).
They are still a reading aid, not a locator — Phase 3 must re-locate every site rather than trust the
line number alone.

### The complete, verified set of refusal points

**Verified by reading both components and all five in-scope actions at `HEAD`, not by trusting a prior
list.** 0015's own F-C paragraph named four Users refusal points; `code-reviewer`'s Phase 5 review of
0015 (informational finding I-2) and this story's own Phase 2 review each found that list incomplete —
it omitted `mount()`'s `viewAny` check, `deleteUser()`'s own `delete` check, and `CreateUser`'s base
`create` gate. The real list is below.

**One refusal shape is already logged, and is deliberately excluded from this story's scope.** Story
0015a shipped two `Log::warning('Step-up password confirmation required', ['actor_id' => …, 'action' =>
…, 'user_id' => …])` calls in `App\Livewire\Users\Index` (lines 231 and 336 today) — one on the
same-page 423 path, one on the dashboard's catch-and-redirect path. These answer a different question
("is the password confirmation stale?") than every refusal enumerated below ("does the actor hold the
required permission, or have they exhausted a rate limit?"), and they were added and audited as part of
0015a's own closed scope. **This story does not fold them into its shared helper and does not change
their shape** — reconciling two independently-shipped conventions into one is a larger edit to
already-closed, audited code than this story's stated purpose, and the two remain deliberately
distinguishable log lines rather than accidentally-divergent ones. Recorded here so Phase 4 confirms
this reasoning rather than flags it as a missed site.

#### `app/Livewire/Users/Index.php` — 7 `Gate::authorize()` sites, 0 refusal logs

| # | Method | Line | Ability | Note |
| --- | --- | --- | --- | --- |
| 1 | `mount()` | 102 | `viewAny` on `User::class` | see the ⚠️ below — effectively unreachable over HTTP |
| 2 | `openCreateModal()` | 117 | `create` | added by 0015 F7 |
| 3 | `openEditModal()` | 156 | `updateSensitiveAttributes` | added by 0015 F7; **conditional** — skipped for the actor's own row |
| 4 | `save()` | 184 | `create` (create branch) | |
| 5 | `save()` | 187 | `update` (edit branch) | |
| 6 | `confirmDelete()` | 271 | `delete` | added by 0015 F7 |
| 7 | `deleteUser()` | 328 | `delete` | |

Non-`Gate` and previously-omitted refusals that surface **through** this component and are equally
untraced today:

- `App\Actions\Users\CreateUser` — `Gate::authorize('create', User::class)` (`CreateUser.php:65`, the
  action's own base gate, omitted from the previous pass), the rate-limit `ValidationException`
  (`:82`), the Super Admin `AuthorizationException` (`:96`), and
  `Gate::authorize('promoteToAdministrator')` (`:103`).
- `App\Actions\Users\UpdateUser` — `Gate::authorize('update')` (`:79`), two Super Admin
  `AuthorizationException` throws (`:168`, `:174`), `promoteToAdministrator` / `downgrade` (`:185`,
  `:187`) and `updateSensitiveAttributes` (`:200`).
- `App\Actions\Users\RequestEmailChange` — **two** rate-limit `ValidationException`s: the composite
  `(target, actor)` limiter (`:69`) and the per-target aggregate (`:99-100`), plus the
  `pending_email` uniqueness collision (`:110`).
- **Deliberately excluded** (see the step-up note above): the `PasswordConfirmationRequiredException`
  thrown by `EnsureRecentPasswordConfirmation` from inside `CreateUser`/`UpdateUser` — the component
  already logs this refusal shape, this story does not duplicate it at the action level either.

#### `app/Livewire/Roles/Index.php` — 7 `Gate::authorize()` sites, 0 refusal logs

| # | Method | Line | Ability | Note |
| --- | --- | --- | --- | --- |
| 1 | `mount()` | 90 | `viewAny` on `Role::class` | same ⚠️ as Users |
| 2 | `openCreateModal()` | 106 | `create` | |
| 3 | `openEditModal()` | 125 | `update` | a **disclosure** path — discloses a role's permission set |
| 4 | `saveRole()` | 148 | `create` (create branch) | |
| 5 | `saveRole()` | 152 | `update` (edit branch) | |
| 6 | `confirmDeleteRole()` | 276 | `delete` | |
| 7 | `deleteRole()` | 307 | `delete` | |

Non-`Gate` refusals that surface through this component and its two actions:

- `saveRole()` `:209` — the self-lockout `ValidationException` (stripping `roles.manage` from a role
  the actor holds).
- `deleteRole()` `:310` — the holders-remaining `ValidationException`.
- `App\Exceptions\RoleInUseException` (409) and `App\Exceptions\ImmutableRoleException` (403), thrown
  by `App\Models\Role`'s own model-event guards — **out of scope**, see the Q5 decision below.
- `App\Actions\Roles\EnforceAdministratorPermissionGrant.php:71` —
  `Gate::forUser($actor)->authorize('grantAdministratorPermission', Role::class)`. **Note the
  mechanism**: this goes through `Gate::forUser()`, not a bare `Gate::authorize()` against the
  currently-authenticated user — the shared helper (Q2, revised below) must accept the explicit
  `$actor` this action already receives, not assume `Auth::user()`.
- `App\Actions\Roles\EnforceGrantorPermissionScope.php:93` — `throw_if($ungranted->isNotEmpty(),
  AuthorizationException::class, …)`, a direct throw decided from `$actor->getAllPermissions()`, not a
  `Gate` call at all. Same actor-parameter note applies.

**The two screens' existing success-path logs, for shape reference** — the refusal lines must be
recognisably their siblings, not a second convention:

```php
// app/Livewire/Roles/Index.php:244 and :335
Log::info('Role saved', ['actor_id' => Auth::id(), 'role_id' => …, …]);
Log::info('Role deleted', [...]);

// app/Livewire/Users/Index.php:356, :607, :672 (all added by story 0015's F5)
Log::info('User deleted', [...]);  Log::info('User created', [...]);  Log::info('User updated', [...]);
```

**Target-key naming across the whole surface (resolves Phase 2 finding C3):** the two screens'
success lines already diverge (`role_id` vs. `user_id`), and the step-up warning uses `user_id` +
`action` on top of that — a third shape. Rather than add a fourth, the new refusal helper uses a
**generic** key pair — `target_type` (`'user'` / `'role'`) and `target_id` — plus `actor_id` and
`ability`, so one shape covers users, roles, and any future third admin screen without inventing a new
key per domain. This does not change the two existing `Log::info` success lines or the step-up warning
lines, which keep their current keys unmodified (see the "Must-not-over-log" and "Existing success-path
logging is unchanged" requirements below).

**Named now so QA (writes tests first) and the implementer (writes code second) agree without a
round-trip — Phase 3 may rename if it finds a real reason to, but must update every reference in this
file if it does:**

- Class: `App\Actions\Auth\LogRefusedPrivilegedAttempt` (imperative verb phrase, no `Action`/`Service`
  suffix, matching `EnsureRecentPasswordConfirmation`'s naming) — **shipped as designed**, modeled on
  `EnsureRecentPasswordConfirmation`'s own shape (a non-throwing `log()` plus a throwing `authorize()`
  wrapper for `Gate`-shaped sites), constructor-injected into the three Users actions and the two Roles
  actions, matching that precedent.
- `Log::warning` message string: `'Privileged action refused'` (fixed, never interpolated —
  interpolating a value into the message string rather than the context array is how a value evades a
  structured-log filter). **Shipped as designed.**
- Context keys, in this order: `actor_id` (`?string`, the resolved actor's `id`, never a bare
  `Auth::id()` — see the Q2 revision above), `ability` (`string` — the `Gate` ability name for a
  Gate-shaped refusal; for a non-`Gate` refusal, a short snake_case reason distinct from any real
  permission name), `target_type` (`'user'` / `'role'` / `null` for a create-shaped refusal with no
  existing target), `target_id`.
  > **Revised during Phase 3 implementation:** `target_id` shipped typed **`int|string|null`**, not the
  > `?string` originally written above. `App\Models\Role` has a native auto-increment `int` primary key
  > (no `HasUuids`, unlike `User`), and QA's own Roles-side tests assert `$context['target_id'] ===
  > $role->id` with strict `===` — casting to `?string` would fail every one of those assertions.
  > `backend-expert` correctly treated the shipped tests as the real spec (per their brief, they could
  > not edit QA's test files) rather than this doc's earlier `?string` note. Recorded here as the
  > accurate shipped shape rather than left silently wrong.
  >
  > **The only two literal `ability` reason strings this file pre-agreed** were `'create_rate_limited'`
  > (`CreateUser`'s rate limit) and `'self_lockout'` (Roles' self-lockout check) — both shipped exactly
  > as named. Every other non-`Gate` site's reason string was left to implementer judgment (QA's tests
  > assert `is_string(...)` and distinctness from a real permission name, not an exact literal), and
  > shipped as: `'assign_super_admin_role'` and `'super_admin_holder_protected'` (`UpdateUser`'s two
  > direct-throw Super Admin refusals), `'email_change_rate_limited'` / `'email_change_aggregate_rate_limited'`
  > / `'pending_email_conflict'` (`RequestEmailChange`'s three non-Gate refusals), `'holders_remaining'`
  > (Roles' `deleteRole()` check), `'grant_exceeds_scope'` (`EnforceGrantorPermissionScope`'s direct
  > throw).

> ⚠️ **`mount()`'s refusal is very likely unreachable over HTTP, and a test asserting it may be
> vacuous.** Verified: `UserPolicy::viewAny()` returns `$actor->hasPermissionTo('users.view')` and
> `RolePolicy::viewAny()` returns `hasPermissionTo('roles.manage')` — the **same** abilities the
> routes' own `can:users.view` / `can:roles.manage` middleware enforces, and `can:` **is** on
> Livewire's `PersistentMiddleware` allow-list, so it re-applies on `/livewire/update` round-trips too.
> An actor who would fail `mount()` is refused by the route first and never reaches the component.
> Phase 3 must therefore decide explicitly whether `mount()` gets a refusal log at all, and any test
> for it must be **proven able to fail** (temporarily remove the route gate and confirm the assertion
> goes red) before it counts as coverage — this is exactly the trap
> [`docs/errors-log.md`](../../../docs/errors-log.md#a-planned-test-asserted-a-refusal-by-verified-a-middleware-that-refuses-nobody-in-this-app--2026-08-20)
> records for the `verified` middleware. Defence in depth is still the right reason to keep the
> check; it is not automatically a reason to log it.

### Implementation shape — settled by the Decisions section below

The **mechanism** is [Q2](#decisions-recorded-2026-08-24-by-human-answer--see-each-q-below-for-the-full-reasoning),
now decided: a shared helper, not a global hook or per-site duplication. These constraints hold and are
not negotiable:

- **One implementation of the rule, not fourteen-plus.** Hand-written `try { … } catch { Log::…;
  throw; }` blocks at every call site is drift waiting to happen, and it is precisely the
  copy-the-rule pattern
  [`base-standards.md`](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
  forbids for authorization rules themselves. Move the rule into one place; call it from many. **Model
  the helper on the shipped `App\Actions\Auth\EnsureRecentPasswordConfirmation` pair**: a
  non-throwing predicate (its `isRecentlyConfirmed()`) plus a throwing wrapper (its `__invoke()`) — the
  same shape [`docs/security/step-up-authentication.md`](../../../docs/security/step-up-authentication.md)
  documents specifically so the "warn" half and the "enforce" half cannot drift apart. For a Gate-shaped
  site, the wrapper still calls `Gate::authorize()` itself (or `Gate::forUser($actor)->authorize()` when
  an explicit actor is available — see the Roles-actions note above) so the exact same exception and
  message are thrown as today; the predicate only decides whether to log first. For a
  `ValidationException`-shaped site (a rate limiter, the self-lockout check, the holders-remaining
  check), the predicate is whatever boolean the call site already evaluates to decide whether to throw
  — the helper's log call is inserted immediately before that existing `throw`, not a second
  independent check that could disagree with it.
- **The refusal must still propagate unchanged.** Logging is observation, never handling: the
  `AuthorizationException` / `ValidationException` / `RoleInUseException` each still reaches the user
  exactly as it does today, with the same status code and the same message. A log line that swallows
  the exception turns a hardening story into a security regression.
- **The log line must not become a disclosure channel of its own.** It records *what was attempted by
  whom against what*, never the payload: no password, no invitation token, no email-change hash, no
  session id, no raw request body. See
  [`docs/security/blade-livewire-output-encoding.md`](../../../docs/security/blade-livewire-output-encoding.md)
  for the sibling reasoning about what is safe to emit.
- **No new config file, no new base folder, no new dependency.** The shared helper lands in
  `app/Actions/Auth/` — an existing stock-Laravel-adjacent location already housing one cross-cutting
  auth concern (`EnsureRecentPasswordConfirmation`), per that folder's own naming rule in
  [`base-standards.md`](../../../docs/conventions/base-standards.md#directory-structure).
- **`config/logging.php` is unmodified** (Q3 — decided "no dedicated channel").

### Confirmed *not* in scope, decided rather than omitted

- **No audit-log table.** This app has none, both screens' success paths already accept a structured
  log line as "the minimum trace", and introducing a table is a materially larger story with its own
  schema, retention and querying decisions. If one is ever wanted it supersedes this story rather than
  extending it.
- **No UI.** Nothing renders differently; no administrator sees anything change.
- **No change to any refusal's status code, message, or timing.** A refusal that is a 403 today stays
  a 403; a `ValidationException` stays a validation error on the same field.
- **The `settings/*` screens and `App\Livewire\Settings\*` are not in scope directly** — with one
  caveat found and closed at Phase 4 (finding F-1, see "Phase 4 findings" below): `RequestEmailChange`
  is a **shared** action, called by both the Users admin screen (in scope) and
  `App\Livewire\Settings\Profile::updateProfileInformation()` (`settings/profile`, `auth`-only, no
  permission gate — self-service). Bringing the action into scope via Q5 silently brought that second,
  unprivileged caller's rate-limit refusal with it, which an unbounded per-attempt log would have let
  any authenticated user flood at will. The **fix** is a per-window log ceiling (one entry per
  `(target, actor)` per rate-limit window, not one per refused attempt), applied at
  `RequestEmailChange`'s three log sites and, for symmetry, `CreateUser`'s rate-limit site — not a
  scope exclusion, so both callers keep the same trace, just bounded. `App\Livewire\Settings\*` beyond
  this one shared action remains genuinely out of scope.

## Phase 4 findings (security audit) and resolution

`appsec-auditor`'s Phase 4 audit **FAILed** the first implementation: 1 Medium (F-1), 2 Low (F-2, F-3),
no Critical/High. It separately verified — as new code, at every one of the ~28 sites, not a sample —
that no logged value is a disclosure, no refusal's propagation changed, and actor resolution cannot be
spoofed; those three properties are **not** re-litigated at re-audit unless the fix below touches them.

- **F-1 (Medium, decided by human 2026-08-24 — "one log per window" option, recommended by the
  auditor)**: see the corrected "settings/*" bullet above for the finding; the fix is a second,
  1-attempt `RateLimiter::attempt()` gating the log call itself (not the real rate limit, which is
  unchanged) at `RequestEmailChange`'s three sites and `CreateUser`'s rate-limit site. Route to
  `backend-expert`.
- **F-2 (Low)**: both components' `mount()` deliberately keep a bare, unlogged `Gate::authorize()`
  (reasoning verified sound by the auditor — the route's own `can:` gate is byte-identical to
  `viewAny()` and is on Livewire's `PersistentMiddleware` allow-list, so a refusal there is
  unreachable over HTTP). Add one docblock sentence to each `mount()` recording *why*, so the
  asymmetry with the other six instrumented sites per component isn't silently unexplained once this
  task file reaches `done/`. Route to `backend-expert`.
- **F-3 (Low, documentation only, no code change)**: the Expected Outcome's "a single filter covers
  all of them" is not quite true — a refusal on these two screens produces one of **two** message
  strings (`'Privileged action refused'` from this story, `'Step-up password confirmation required'`
  from story 0015a, deliberately left separate). Deferred to Phase 6 — `docs-keeper` states both
  strings together in `docs/architecture/authorization.md`, and this file's Expected Outcome sentence
  below is corrected in the same pass.

**Re-audit (same day): PASS.** `appsec-auditor` re-verified both fixes as new code (not diffed against
the finding text) — the log-throttle keys provably bound the flood without under-logging the first
refusal in a window (over-logging under a race is the only failure direction, verified against
`RateLimiter::hit()`'s real implementation), cannot be poisoned to pre-suppress a genuine refusal (each
throttle key has exactly one writer, sitting inside the real refusal branch it logs), and introduce no
new disclosure or propagation change. `phpstan` and `pint` both clean. Both `mount()` docblocks were
checked claim-by-claim against the route files and Livewire's vendor source and found accurate. Two
non-blocking Low items were raised alongside the PASS, both dispositioned at Phase 5
(`code-reviewer`, findings R-2/R-3 below fold both in):
- **L-1** — both `mount()` docblocks state *that* the refusal is unlogged and *why it's true today*,
  but not the tripwire condition that would make it stop being true. **Disposition: fix, folded into
  Phase 5's R-3.** One sentence added to each: "If `viewAny()` ever gains a condition the route's own
  `can:` ability does not check, this refusal becomes reachable over HTTP and must be logged."
- **L-2** — `RequestEmailChange`'s aggregate-limiter log-throttle key is target-only, unlike its two
  siblings (target+actor), so a second administrator's aggregate refusal against a target another
  administrator already triggered a log for within the hour goes unlogged. `code-reviewer` verified the
  auditor's "not urgent" reasoning holds (the branch is self-service-exempt so the actor set is bounded
  to administrators, and each contributing send is already traced by its own success-path log) but took
  the one-line fix anyway, as the resolution of Phase 5's R-3 rather than leave an asymmetry nobody
  wanted: the key becomes `'email-change-target-log:'.$aggregateKey.':'.$actorKey`, matching its
  siblings' shape exactly.

## Phase 5 findings (final code review) and resolution

`code-reviewer` **FAILed** the first Phase 5 pass — independently re-verified 770/770 + Pint + Larastan
clean, 9 of 10 acceptance criteria and all applicable DoD items met, all project conventions followed
correctly (including the constructor-vs-method-injection split, verified against
[code-style.md](../../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)'s
documented exception) — but found three concrete, mechanical gaps:

- **R-1 (this file itself)**: the Phase 4 section above documented only the first (FAILed) audit round,
  never the re-audit's PASS or the L-1/L-2 disposition — an audit-trail story shipping with its own
  incomplete audit trail. **Fixed by this edit** (the "Re-audit (same day): PASS" block above).
- **R-2 (tests, → `backend-qa`) — fixed.** (a) Three Roles-side must-not-over-log tests added to
  `tests/Feature/Roles/RefusalLoggingTest.php` (permitted create; a permitted edit that keeps the
  actor's own `roles.manage`, adjacent to but not tripping the self-lockout guard; a permitted delete
  of a zero-holder role, adjacent to but not tripping the holders-remaining guard), each pairing
  `Log::shouldNotHaveReceived('warning')` with the existing `Log::info` success line still firing.
  (b) One new equivalence test in `tests/Feature/Users/ActionRefusalLoggingTest.php` captures a genuine
  `UpdateUser::promoteToAdministrator` refusal and a genuine `Livewire\Users\Index::openEditModal()`
  refusal in one `Log::spy()` session and set-equates their key sets, mirroring the two-component
  equivalence test one layer down. All four regression-proofed (a stray log call / an extra context key
  injected, each confirmed to turn the new assertion red, then reverted).
- **R-3 (code, → `backend-expert`) — fixed.** Took L-2's key fix: `RequestEmailChange`'s aggregate log
  throttle key is now `'email-change-target-log:'.$aggregateKey.':'.$actorKey`, matching the composite
  limiter's target+actor shape exactly; the comment above it is now an accurate description rather than
  a false one. L-1's tripwire sentence added to both `mount()` docblocks in the same pass.
- **Full-suite re-verification (post R-1/R-2/R-3), performed by the orchestrator directly** once both
  parallel fix agents reported done (they had raced on the shared `testing` database mid-fix, producing
  one transient "unknown column" failure neither's own diff caused — resolved by re-running once,
  sequentially, after both landed): unscoped `php artisan test --testsuite=Unit,Feature` → **774
  passed** (2060 assertions; up from 770 — the four new R-2 tests), unscoped
  `vendor/bin/pint --test --format agent` → clean.
- **Second re-review, after the fixes: PASS**, no further findings. Two non-blocking notes for
  Phase 6/closure: **N-1** (R-3's target+actor key behaviour — a second administrator's aggregate
  refusal against a target already logged by a first administrator in the same window — was not
  test-pinned) and **N-2** (this file's checkboxes were still unticked). **N-1 closed the same day**:
  `backend-qa` added `'RequestEmailChange -- two different administrators each get their own logged
  aggregate refusal against the same target'` to `tests/Feature/Users/ActionRefusalLoggingTest.php`,
  regression-proofed by temporarily reverting the key to target-only and confirming the new test goes
  red (administrator E's refusal silently suppressed by administrator D's earlier one under the old
  key), then green again with the real key restored. **N-2 closed**: every checkbox in this file's
  "Tests to perform" and "Acceptance criteria" sections, and every applicable "Definition of Done" item
  (documentation excepted — genuinely Phase 6's), is now ticked.
- **The step-up password-confirmation refusal already logged by story 0015a is not re-shaped or folded
  in** — see the note above the two refusal-point tables.
- **`App\Models\Role`'s model-event guards (`ImmutableRoleException`, `RoleInUseException`) are not
  covered**, per the Q5 decision below.

## Tests to perform
- [x] **Users — authorization refusal is logged.** With `Log::spy()`, an actor holding `users.edit`
      but **not** `roles.manage-administrators` calls `openEditModal()` against another user holding
      the `Administrator` role: exactly one refusal entry is recorded, carrying the actor id, the
      attempted ability and the target id.
- [x] **Users — the refusal still refuses.** The same call still throws `AuthorizationException` and
      still leaves `$editingUserId`, `$editingPendingEmail` and `$status` unpopulated. This is the
      test that fails if logging swallowed the exception.
- [x] **Roles — authorization refusal is logged.** An actor lacking `roles.manage` calling
      `openEditModal()` on `App\Livewire\Roles\Index` produces one refusal entry with the same shape,
      and still throws. **Assert the shape matches the Users entry** — same keys, same level — so the
      two screens cannot diverge into two conventions.
- [x] **Users — rate-limit refusal is logged, and is distinguishable.** Exhaust `CreateUser`'s 10/hour
      allowance, submit an eleventh create, and assert one refusal entry is recorded that a log filter
      can tell apart from an authorization refusal (a distinct message or a `reason` field — whichever
      [Q1/Q2](#open-questions--must-be-answered-before-phase-3-historical--see-decisions-above)
      settle on).
      **Note this scenario has no Roles counterpart**: `App\Livewire\Roles\Index` carries no rate
      limiter at all today, so there is nothing to mirror — recorded so its absence does not read as
      a gap in coverage.
- [x] **No credential leaks into any refusal entry.** Across an authorization refusal *and* a
      rate-limit refusal, assert the recorded context contains no password, no invitation token, no
      email-change hash and no session id. Assert on the **recorded context array**, not on a
      rendered string, so an added key cannot slip past a substring check — and per
      [`docs/errors-log.md`](../../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21),
      prove the assertion can fail before trusting it.
- [x] **Must-not-over-log — the success path is unchanged.** A permitted create, edit and delete on
      each screen still produce **exactly** their existing single `Log::info` success line and **no**
      refusal line. Story 0015's F5 tests and the Roles screen's own logging tests must pass
      **unamended**; if any needs amending, that is a signal the refusal path is firing where it
      should not.
- [x] **Every enumerated refusal point is actually covered, or explicitly recorded as not covered.**
      Phase 3 produces a checklist mapping each of the 14 `Gate::authorize()` sites (plus the
      non-`Gate` refusals listed above) to the test that exercises it, or to a one-line reason it is
      unreachable — `mount()` being the known candidate. A silently uncovered site is the failure
      mode this story exists to prevent, one level up.
- [x] **Regression-proof each new assertion.** For at least one refusal test per screen, temporarily
      remove the logging call and confirm the test goes red, per this repo's standing convention. A
      logging assertion that has never been observed failing is the same vacuous coverage
      [`docs/errors-log.md`](../../../docs/errors-log-archive.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18)
      records twice.
- [x] **Domain actions — authorization refusal is logged, matching the components' shape.** Per the
      Q5 decision above, `App\Actions\Users\CreateUser`'s `promoteToAdministrator` refusal,
      `App\Actions\Users\UpdateUser`'s `update` / `promoteToAdministrator` / `downgrade` /
      `updateSensitiveAttributes` refusals and its two direct-throw Super Admin
      `AuthorizationException`s, `App\Actions\Users\RequestEmailChange`'s two rate-limit refusals,
      and `App\Actions\Roles\EnforceAdministratorPermissionGrant` /
      `EnforceGrantorPermissionScope`'s `AuthorizationException` throws each produce exactly one
      refusal entry, same keys and level as the two components' entries, asserted directly (not by
      each action asserting its own shape in isolation) — mirroring the equivalence test already
      required between the two Livewire components.
- [x] **Domain actions — the refusal still refuses, identically.** Calling any of the above directly
      (bypassing the Livewire layer entirely, per the 0008a convention that these actions are
      independently callable) still throws the same exception class with the same message; logging
      never intercepts or swallows it.
- [x] **Full-suite regression.** Per
      [base-standards.md](../../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done),
      the record is an **unscoped** `php artisan test` and an **unscoped** `vendor/bin/pint --format
      agent` — not `--filter` / `--dirty`. If Q2 is answered with a global exception hook, the blast
      radius is the **whole suite** by construction, not the two screens.

## Expected outcome
Every refused privileged attempt on the Users and Roles screens — and on the five domain actions behind
them, reachable from any caller, not only the dashboard — leaves a structured `Log::warning` line
naming the actor (`actor_id`), the attempted ability (`ability`), and the target (`target_type` /
`target_id`), enough that repeated probing of a sensitive target, or sustained hammering of a
rate-limited action, is detectable after the fact by filtering the log. Every refusal site uses the
**same** line shape and the same level, so a third admin screen has one pattern to copy.

> **Corrected at Phase 6, per Phase 4 finding F-3.** This sentence previously read "…so a **single
> filter** covers all of them". That is not quite true, and the imprecision matters to a defender:
> a refusal on these two screens produces one of **two** message strings — `'Privileged action
> refused'` (this story) and `'Step-up password confirmation required'` (story 0015a, deliberately
> left unfolded). Both are `Log::warning` on the default channel, so a **level** filter does cover
> all of them; a **message** filter needs both strings. Stated with its table in
> [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#-a-refusal-on-these-screens-produces-one-of-two-message-strings).

Nothing else changes: every refusal returns the same status, the same message
and the same timing it does today, no credential or token reaches the log, every existing success-path
`Log::info` line is untouched, and story 0015a's own step-up refusal log keeps its separate shape
unmodified.

## Acceptance criteria
- [x] Every `Gate::authorize()` refusal in `App\Livewire\Users\Index` and `App\Livewire\Roles\Index`
      is logged — the **complete** enumerated set above (7 sites per component), with any deliberate
      omission (`mount()` being the expected one) stated in this file with its reason, not silently
      skipped.
- [x] The rate-limit refusals reaching the Users screen (`CreateUser`'s create limiter and
      `RequestEmailChange`'s two limiters) are logged and are **distinguishable** from an
      authorization refusal by a log filter.
- [x] The two screens emit the **same line shape at the same level** — same keys, same naming — and a
      test asserts that equivalence directly rather than each screen asserting its own shape in
      isolation.
- [x] **Per the Q5 decision, the five named domain actions** (`CreateUser`, `UpdateUser`,
      `RequestEmailChange`, `EnforceAdministratorPermissionGrant`, `EnforceGrantorPermissionScope`)
      log their own refusals with the **same shape and level** as the two components, callable
      independently of the Livewire layer — so a future non-dashboard caller inherits the logging for
      free, the same reasoning [`base-standards.md`](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
      already applies to the authorization rules themselves. `App\Models\Role`'s model-event guards
      (`ImmutableRoleException`, `RoleInUseException`) are explicitly **not** in this pass — recorded
      as a deferred decision, not an oversight.
- [x] The rule has **one implementation**; no call site re-derives it inline.
- [x] **Every refusal still refuses identically.** Same exception class, same status code, same
      message, same field for a `ValidationException`, and no state populated that was not populated
      before. Logging never catches-and-continues.
- [x] No refusal entry contains a password, an invitation token, an email-change hash or a session
      identifier, asserted against the recorded context array.
- [x] Existing success-path logging is unchanged — `Log::info('User created'/'User updated'/'User
      deleted')` and `Log::info('Role saved'/'Role deleted')` keep their exact current shape and
      level, and their tests pass unamended.
- [x] No migration, no column, no route, no ability, no UI change, and no new base folder or
      dependency. `config/logging.php` is unmodified unless Q3 is answered "yes".
- [x] The full unscoped suite is green.

## Definition of Done
- [x] Tests written and green, plus the full existing suite, run **unscoped**.
- [x] Code reviewed (code-reviewer).
- [x] No security findings (appsec-auditor). Phase 4 should pay particular attention to: whether any
      logged value is itself a disclosure, whether the log is a **denial-of-service amplifier** (an
      unauthenticated or permission-less actor can drive unbounded log writes at zero cost — see Q4),
      and whether any refusal's propagation changed.
- [x] Documentation updated (docs-keeper) — Phase 6 complete, 2026-08-24:
      - [`docs/security/livewire-authorization.md`](../../../docs/security/livewire-authorization.md) —
        **done.** New subsection "Gating a method is not the same as knowing when the gate fired", the
        observability half of that page's own two-year-old rule, with the ✅/❌ pair and the three
        component-specific consequences (method- vs. constructor-injection; `mount()` as the one
        deliberate exception, justified by that page's own `PersistentMiddleware` table read in the
        *opposite* direction from the `password.confirm` row above it; and why a disclosure gate still
        needs its state assertion).
      - [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md) —
        **done.** New top-level section "Recording a refusal — what every gate owes the audit trail",
        the page's third copyable pattern beside the module gate and the sidebar registry. Includes
        the ⚠️ closing **F-3** (two message strings), the three deliberate exclusions, and the
        shared-action log-ceiling rule from **F-1**. Plus a Current-state bullet and four
        "Where it lives" rows.
      - [`docs/errors-log.md`](../../../docs/errors-log.md) — **one entry added** (twenty-two →
        twenty-three): **F-1**, a scope exclusion phrased in terms of *screens* while the story's unit
        of change was a *class* those screens share. `docs-keeper` judged the Phase 3 off-by-one loop
        bound **below the bar** (caught inside its own phase, absent from this file's record, no
        lasting convention), and 0015's finding **I-2** likewise — it is already covered by
        [the deferred-findings entry](../../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23),
        whose rule ("write a finding as the property that must hold, and re-verify it against `HEAD`")
        is exactly what this story's own enumeration tables did.
      - **Four files this DoD does not name were also corrected**, found by grepping rather than by the
        change→doc mapping: [`docs/conventions/base-standards.md`](../../../docs/conventions/base-standards.md)
        and [`docs/architecture/overview.md`](../../../docs/architecture/overview.md) (both described
        `app/Actions/Auth/` as holding one class — an under-count as of this story),
        [`docs/conventions/code-style.md`](../../../docs/conventions/code-style.md) (an action is
        resolved from the container, never `new`-ed — three actions gained their first constructor
        dependency here) and [`docs/README.md`](../../../docs/README.md)'s index.
- [x] Acceptance criteria met.

## Decisions (recorded 2026-08-24, by human answer — see each Q below for the full reasoning)

All five open questions below are now **answered**. Phase 3 may start.

- **Q1 — `Log::warning`.** Refusals are anomalies, distinct level from the `Log::info` success lines.
- **Q2 — Shared helper, not a self-logging exception.** A single shared implementation (an
  `app/Actions/Auth/` class, alongside `EnsureRecentPasswordConfirmation` per that folder's existing
  cross-cutting-concern convention) is called explicitly at every refusal site. It checks the
  condition (`Gate::denies($ability, $target)`, or `Gate::forUser($actor)->denies(...)` when an
  explicit actor is available — see the revision below — for the Gate-shaped sites; an explicit boolean
  for the rate-limit/self-lockout/holders-remaining sites), logs if the check indicates a refusal, then
  lets the **original, unwrapped** exception (`AuthorizationException` via `Gate::authorize()` /
  `Gate::forUser($actor)->authorize()`, `ValidationException`) propagate exactly as it does today. A
  self-logging custom exception (`report()`) was considered — see the rejected shape below — and not
  used, because the ValidationException-shaped refusals (rate limits, self-lockout, holders-remaining)
  cannot receive that treatment without touching `ValidationException`'s `report()` app-wide, which is
  out of scope and far too broad a blast radius. One helper covering both shapes keeps the "one
  implementation of the rule" requirement intact without that risk.
  > **Revised at Phase 2 (`code-reviewer` finding B3):** the helper's signature must accept an
  > **optional, explicit `?User $actor = null` parameter**, defaulting to `Auth::user()` when omitted,
  > not assume `Auth::user()` unconditionally. `App\Actions\Roles\EnforceAdministratorPermissionGrant`
  > and `App\Actions\Roles\EnforceGrantorPermissionScope` both authorize against a `User $actor` passed
  > into them, precisely so a non-dashboard caller works — the same reasoning Q5 gives for bringing
  > actions into scope at all. The logged `actor_id` must come from that resolved actor, never from a
  > bare `Auth::id()`, or a queued job / Artisan-command caller would log `actor_id: null` — exactly
  > the caller this decision exists to serve.
- **Q3 — No dedicated log channel.** Default channel, as both screens' success lines already use.
  `config/logging.php` stays unmodified.
- **Q4 — No throttling.** Every refusal is logged; losing entries would defeat the story's purpose at
  this backoffice's traffic scale. The reasoning is recorded in the code (per Q4's own recommendation
  below) so a future scale problem has its answer waiting.
- **Q5 — Domain actions are in scope too, not only the two Livewire components.** `App\Actions\Users\CreateUser`,
  `App\Actions\Users\UpdateUser`, `App\Actions\Users\RequestEmailChange`,
  `App\Actions\Roles\EnforceAdministratorPermissionGrant` and
  `App\Actions\Roles\EnforceGrantorPermissionScope` all own `Gate::authorize()` / validation-shaped
  refusals of their own (enumerated in [Files to create/modify](#files-to-createmodify) above), and a
  future non-dashboard caller (API endpoint, Artisan command, queued job) must inherit the same
  logging the dashboard gets — mirroring the [action-owns-the-rule
  convention](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
  this repo already applies to authorization itself. **Explicitly still out of scope in this pass:**
  `App\Models\Role`'s own model-event guards (`ImmutableRoleException`, `RoleInUseException`) — these
  are deterministic state-based refusals with no per-attempt disclosure risk beyond what the Gate
  refusals already cover (a caller cannot use them to probe permission boundaries, only real database
  state), so extending the pattern there is deferred rather than silently dropped. Phase 4 should
  confirm this reasoning holds rather than assume it.

Rejected shape for Q2 (recorded for the next reader who considers it again): a custom exception
(`extends AuthorizationException`) with its own `report()` method, thrown from each Gate-shaped site
in place of `Gate::authorize()`. This is clean for the seven-per-screen `Gate::authorize()` sites (no
`bootstrap/app.php` change needed — Laravel calls a defined `report()` automatically) but has no
equivalent for the `ValidationException`-shaped refusals without touching validation handling
app-wide, so it does not cover the story's full scope on its own and was not adopted.

## Open questions — must be answered before Phase 3 (historical — see Decisions above)

Per [`docs/contracts.md`](../../../docs/contracts.md)'s Uncertainty Handling Rule, these are genuine
forks with more than one reasonable answer. **No implementation may start until a human answers them.**

### Q1 — What level does a refusal log at?
- **(a) `Log::warning` (recommended).** A refusal is an anomaly, not an outcome; putting it at a
  different level from the success lines is what makes "show me every refused attempt" a one-filter
  query rather than a message-substring grep. `RolePermissionSeeder` already uses `Log::warning` for
  a privileged anomaly, so the precedent exists in this repo.
- **(b) `Log::info`, matching the success lines.** Consistent with both screens' existing shape, and
  keeps one level for "everything this screen did". The cost is that refusals and successes become
  separable only by message text.

### Q2 — How is the refusal intercepted?
- **(a) One shared helper/trait called from each site (recommended).** Explicit, greppable, and
  scoped precisely to the two components — a reader of `openEditModal()` can see that a refusal is
  recorded. The cost is 14 call sites to keep in step, mitigated by the single implementation the
  helper provides.
- **(b) A global hook in `bootstrap/app.php`** (`Exceptions::reportable(...)` on
  `AuthorizationException`). Zero call sites, catches every refusal in the app **including ones this
  story never enumerated** — which is simultaneously its appeal and its risk: it changes behaviour
  app-wide, its blast radius is the entire suite, and it cannot easily distinguish an admin-screen
  refusal from any other.
- **(c) Per-site `try/catch`.** Rejected as the starting point — it is the copy-the-rule shape this
  project has already recorded as drift, and it is listed only so the rejection is on the record.

### Q3 — Does this need its own log channel? — decided "no"
Write to the default channel, as both screens' success lines already do. A dedicated `audit` channel in
`config/logging.php` is defensible if these lines are ever meant to have their own retention, but that
is an operations decision with no code dependency here, and it can be added later without touching any
of this story's code.

### Q4 — Should refusal logging be throttled? — decided "no"
A refusal costs an attacker nothing and writes a log line every time, so the feature is its own
modest denial-of-service amplifier — the very "repeated probing" case it exists to detect is also the
case that floods the log. Log every refusal (simplest, right for a backoffice of this size — the
traffic ceiling is low and losing entries defeats the purpose). Record this reasoning in the code so a
future scale problem has its answer waiting, rather than throttling per actor/ability with a
`RateLimiter`-backed suppression counter now (more correct at scale, materially more code, and a
suppressed entry is a blind spot in exactly the window that matters).

### Q5 — Do the actions get the same treatment, or only the two components? — decided "yes, the actions too"
0015's deferral text scopes F-C to "both admin screens". But `App\Actions\Users\CreateUser` /
`UpdateUser` own their own `Gate::authorize()` calls precisely so a **non-dashboard** caller (a future
API endpoint, an Artisan command, a queued job) inherits them — and such a caller would inherit no
logging under a component-only scope. Decided as an explicit extra decision (Q2 was answered (a), the
shared-helper form, which does not cover the actions "for free" the way a global hook would) — see the
Decisions section above for the exact scope (which five actions, and what stays excluded).

## Dependencies and related work
- **Split from story [0015 — Harden the Users CRUD backend's security posture](../done/0015-harden-users-crud-security-posture.md)**
  (Phase 4 finding **F-C**), on 2026-08-24. 0015 records the deferral in its "Deferred, deliberately —
  not silently dropped" section; that section stays as written, and this file is the follow-up it
  implies. 0015 owns no part of this work.
- **Independent of sibling story [0015a — Step-up authentication for privileged Users actions](../done/0015a-step-up-auth-privileged-user-actions.md), and now sequenced after it.**
  Different concerns: 0015a added a *guard* (and its own step-up refusal log, explicitly excluded from
  this story's scope — see the note above the refusal-point tables). 0015a closed and moved to
  `ai-spec/tasks/done/` before this story reached Phase 3, which is exactly the "lands further changes
  first" case the previous revision of this file anticipated (see the superseded ⚠️ this paragraph
  replaces) — this revision's line-number tables are re-verified against the tree with 0015a's changes
  already applied, per `code-reviewer`'s Phase 2 finding B2.
- **No longer blocked.** Both story 0015 and story 0015a are closed (`ai-spec/tasks/done/`),
  `ai-spec/tasks/in-progress/` is empty, and this file's refusal-point tables were re-read directly
  against `HEAD` rather than assumed — Phase 3 may start.
- **Task ordering:** `0015` sorts before `0015a` and `0015b`, satisfying
  [`docs/workflow.md`](../../../docs/workflow.md#task-ordering-rule)'s rule. 0015a and 0015b were
  siblings, not a dependency pair, and both are now closed independently.
- **Depends on shipped code only** — both screens' existing `Gate::authorize()` calls, their existing
  `Log::info` success lines, and the five domain actions' own `Gate::authorize()` / validation-shaped
  refusals (Q5). Nothing unfinished remains upstream of this story.

## Provenance
Finding **F-C**, raised by `appsec-auditor` during story
[0015](../done/0015-harden-users-crud-security-posture.md)'s Phase 4 security audit: the three
`Log::info` calls that story adds all sit after a *successful* mutation, so every refusal —
`AuthorizationException` from the disclosure and mutation gates, and either action's rate-limit
`ValidationException` — logs nothing. Deferred by explicit human decision (2026-08-24) rather than
fixed in 0015, because the identical gap exists on `App\Livewire\Roles\Index`, which 0015 does not
touch: closing it on one screen only would leave the same hole on the other and create a second
logging convention alongside it.

Filed as this standalone story on 2026-08-24 after `code-reviewer`'s Phase 5 review of 0015 found that
the deferral was recorded in prose but had **no follow-up task file** — unlike sibling finding F13,
which had been properly split off as
[0015a](../done/0015a-step-up-auth-privileged-user-actions.md). The same review's informational finding
**I-2** (originating in the auditor's own report) noted that F-C's list of Users refusal points was
incomplete; **the enumerated tables above were therefore built by reading both components' current
code directly rather than by trusting either prior list**, and they add the two sites both lists
omitted: `mount()`'s `viewAny` check and `deleteUser()`'s own `delete` check.
