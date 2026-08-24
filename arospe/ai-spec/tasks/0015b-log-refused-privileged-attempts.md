# [0015b] Log refused privileged attempts on the admin screens (split from 0015's F-C)

## Description
Both permission-gated admin CRUD screens — `App\Livewire\Users\Index` and `App\Livewire\Roles\Index` —
log a structured line for every **successful** privileged mutation and nothing at all for a **refused**
one. An actor repeatedly probing an Administrator-holding target, or hammering a rate-limited action,
therefore leaves no trace anywhere: the refusal is correct, but it is invisible. This story adds a
structured audit line on the refusal paths of both screens, so repeated unauthorized probing is
detectable after the fact. It is a **cross-cutting** pass by design — the identical gap exists on both
screens, and closing it on one only would leave the same hole on the other while creating a second,
divergent logging convention.

> **Split out of story [0015](done/0015-harden-users-crud-security-posture.md)**, where it was
> Phase 4 finding **F-C**, deferred by explicit human decision (2026-08-24) rather than fixed in
> place, following the [0008](done/0008-super-admin-role-invariants.md) /
> [0008a](done/0008a-centralize-administrator-role-identification.md) and 0015/0015a precedent.
> 0015's own text records the deferral in its "Deferred, deliberately — not silently dropped"
> section; this file is the follow-up that section implies and that `code-reviewer`'s Phase 5 review
> of 0015 found missing.

> ⚠️ **This story is not started and has had no Phase 1 debate.** Its scope came pre-specified from a
> security finding rather than from a Three Amigos session, so it sits in `ai-spec/tasks/` as a
> pre-scoped backlog item. The [Open questions](#open-questions--must-be-answered-before-phase-3)
> below are genuinely open and **must be answered by a human before Phase 3**, per
> [`docs/contracts.md`](../../docs/contracts.md)'s Uncertainty Handling Rule — the *interception
> mechanism* and the *log level* in particular are design decisions this file deliberately does not
> make on its own.

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
```

## Files to create/modify

Line numbers are the verified working-tree ones read on 2026-08-24, **with story 0015's own changes
already applied** (0015 is `in-progress/` and its F5/F7/F11 work has landed in the tree). They are a
reading aid only — Phase 3 must re-locate every site, and must re-verify the list itself if 0015 or
[0015a](in-progress/0015a-step-up-auth-privileged-user-actions.md) lands further changes first.

### The complete, verified set of refusal points

**Verified by reading both components at `HEAD`, not by trusting a prior list.** 0015's own F-C
paragraph named four Users refusal points (`openCreateModal()`, `openEditModal()`, `confirmDelete()`,
`save()`); `code-reviewer`'s Phase 5 informational finding **I-2** noted that list was incomplete, and
it is — it omits `mount()`'s `viewAny` check and `deleteUser()`'s own `delete` check. The real list is
below. **Neither component logs anything on any of these paths today.**

#### `app/Livewire/Users/Index.php` — 7 `Gate::authorize()` sites, 0 refusal logs

| # | Method | Line | Ability | Note |
| --- | --- | --- | --- | --- |
| 1 | `mount()` | 100 | `viewAny` on `User::class` | see the ⚠️ below — effectively unreachable over HTTP |
| 2 | `openCreateModal()` | 115 | `create` | added by 0015 F7 |
| 3 | `openEditModal()` | 154 | `updateSensitiveAttributes` | added by 0015 F7; **conditional** — skipped for the actor's own row |
| 4 | `save()` | 182 | `create` (create branch) | |
| 5 | `save()` | 185 | `update` (edit branch) | |
| 6 | `confirmDelete()` | 236 | `delete` | added by 0015 F7 |
| 7 | `deleteUser()` | 285 | `delete` | |

Non-`Gate` refusals that surface **through** this component and are equally untraced today:

- `App\Actions\Users\CreateUser` — the rate-limit `ValidationException` (`CreateUser.php:53`), the
  Super Admin `AuthorizationException` (`:67`), and `Gate::authorize('promoteToAdministrator')` (`:74`).
- `App\Actions\Users\UpdateUser` — `Gate::authorize('update')` (`:65`), two Super Admin
  `AuthorizationException` throws (`:154`, `:160`), `promoteToAdministrator` / `downgrade` (`:171`,
  `:173`) and `updateSensitiveAttributes` (`:186`).
- `App\Actions\Users\RequestEmailChange` — **two** rate-limit `ValidationException`s: the composite
  `(target, actor)` limiter (`:69`) and the per-target aggregate (`:99-100`), plus the
  `pending_email` uniqueness collision (`:110`).

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

Non-`Gate` refusals that surface through this component:

- `saveRole()` `:209` — the self-lockout `ValidationException` (stripping `roles.manage` from a role
  the actor holds).
- `deleteRole()` `:310` — the holders-remaining `ValidationException`.
- `App\Exceptions\RoleInUseException` (409) and `App\Exceptions\ImmutableRoleException` (403), thrown
  by `App\Models\Role`'s own model-event guards, which the component never catches.
- `App\Actions\Roles\EnforceAdministratorPermissionGrant` and
  `App\Actions\Roles\EnforceGrantorPermissionScope` — both throw `AuthorizationException` from inside
  `saveRole()`.

**The two screens' existing success-path logs, for shape reference** — the refusal lines must be
recognisably their siblings, not a second convention:

```php
// app/Livewire/Roles/Index.php:244 and :335
Log::info('Role saved', ['actor_id' => Auth::id(), 'role_id' => …, …]);
Log::info('Role deleted', [...]);

// app/Livewire/Users/Index.php:295, :440, :505 (all added by story 0015's F5)
Log::info('User deleted', [...]);  Log::info('User created', [...]);  Log::info('User updated', [...]);
```

> ⚠️ **`mount()`'s refusal is very likely unreachable over HTTP, and a test asserting it may be
> vacuous.** Verified: `UserPolicy::viewAny()` returns `$actor->hasPermissionTo('users.view')` and
> `RolePolicy::viewAny()` returns `hasPermissionTo('roles.manage')` — the **same** abilities the
> routes' own `can:users.view` / `can:roles.manage` middleware enforces, and `can:` **is** on
> Livewire's `PersistentMiddleware` allow-list, so it re-applies on `/livewire/update` round-trips too.
> An actor who would fail `mount()` is refused by the route first and never reaches the component.
> Phase 3 must therefore decide explicitly whether `mount()` gets a refusal log at all, and any test
> for it must be **proven able to fail** (temporarily remove the route gate and confirm the assertion
> goes red) before it counts as coverage — this is exactly the trap
> [`docs/errors-log.md`](../../docs/errors-log.md#a-planned-test-asserted-a-refusal-by-verified-a-middleware-that-refuses-nobody-in-this-app--2026-08-20)
> records for the `verified` middleware. Defence in depth is still the right reason to keep the
> check; it is not automatically a reason to log it.

### Implementation shape — deliberately not decided here

The **mechanism** is [Q2](#q2--how-is-the-refusal-intercepted) and must be answered before Phase 3.
Whichever is chosen, these constraints hold and are not negotiable:

- **One implementation of the rule, not fourteen.** Fourteen hand-written `try { … } catch { Log::…;
  throw; }` blocks across two components is drift waiting to happen, and it is precisely the
  copy-the-rule pattern
  [`base-standards.md`](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
  forbids for authorization rules themselves. Move the rule into one place; call it from many.
- **The refusal must still propagate unchanged.** Logging is observation, never handling: the
  `AuthorizationException` / `ValidationException` / `RoleInUseException` each still reaches the user
  exactly as it does today, with the same status code and the same message. A log line that swallows
  the exception turns a hardening story into a security regression.
- **The log line must not become a disclosure channel of its own.** It records *what was attempted by
  whom against what*, never the payload: no password, no invitation token, no email-change hash, no
  session id, no raw request body. See
  [`docs/security/blade-livewire-output-encoding.md`](../../docs/security/blade-livewire-output-encoding.md)
  for the sibling reasoning about what is safe to emit.
- **No new config file, no new base folder, no new dependency.** If a shared helper is the answer, it
  lands in an existing stock Laravel location.
- **`config/logging.php` is unmodified** unless [Q3](#q3--does-this-need-its-own-log-channel) is
  answered "yes", in which case that answer authorizes exactly that one change and nothing more.

### Confirmed *not* in scope, decided rather than omitted

- **No audit-log table.** This app has none, both screens' success paths already accept a structured
  log line as "the minimum trace", and introducing a table is a materially larger story with its own
  schema, retention and querying decisions. If one is ever wanted it supersedes this story rather than
  extending it.
- **No UI.** Nothing renders differently; no administrator sees anything change.
- **No change to any refusal's status code, message, or timing.** A refusal that is a 403 today stays
  a 403; a `ValidationException` stays a validation error on the same field.
- **The `settings/*` screens and `App\Livewire\Settings\*` are not in scope.** They are a different
  trust boundary (a user acting on their own account) with their own tests; extending the pattern
  there is a separate story if it is wanted at all.

## Tests to perform
- [ ] **Users — authorization refusal is logged.** With `Log::spy()`, an actor holding `users.edit`
      but **not** `roles.manage-administrators` calls `openEditModal()` against another user holding
      the `Administrator` role: exactly one refusal entry is recorded, carrying the actor id, the
      attempted ability and the target id.
- [ ] **Users — the refusal still refuses.** The same call still throws `AuthorizationException` and
      still leaves `$editingUserId`, `$editingPendingEmail` and `$status` unpopulated. This is the
      test that fails if logging swallowed the exception.
- [ ] **Roles — authorization refusal is logged.** An actor lacking `roles.manage` calling
      `openEditModal()` on `App\Livewire\Roles\Index` produces one refusal entry with the same shape,
      and still throws. **Assert the shape matches the Users entry** — same keys, same level — so the
      two screens cannot diverge into two conventions.
- [ ] **Users — rate-limit refusal is logged, and is distinguishable.** Exhaust `CreateUser`'s 10/hour
      allowance, submit an eleventh create, and assert one refusal entry is recorded that a log filter
      can tell apart from an authorization refusal (a distinct message or a `reason` field — whichever
      [Q1/Q2](#open-questions--must-be-answered-before-phase-3) settle on).
      **Note this scenario has no Roles counterpart**: `App\Livewire\Roles\Index` carries no rate
      limiter at all today, so there is nothing to mirror — recorded so its absence does not read as
      a gap in coverage.
- [ ] **No credential leaks into any refusal entry.** Across an authorization refusal *and* a
      rate-limit refusal, assert the recorded context contains no password, no invitation token, no
      email-change hash and no session id. Assert on the **recorded context array**, not on a
      rendered string, so an added key cannot slip past a substring check — and per
      [`docs/errors-log.md`](../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21),
      prove the assertion can fail before trusting it.
- [ ] **Must-not-over-log — the success path is unchanged.** A permitted create, edit and delete on
      each screen still produce **exactly** their existing single `Log::info` success line and **no**
      refusal line. Story 0015's F5 tests and the Roles screen's own logging tests must pass
      **unamended**; if any needs amending, that is a signal the refusal path is firing where it
      should not.
- [ ] **Every enumerated refusal point is actually covered, or explicitly recorded as not covered.**
      Phase 3 produces a checklist mapping each of the 14 `Gate::authorize()` sites (plus the
      non-`Gate` refusals listed above) to the test that exercises it, or to a one-line reason it is
      unreachable — `mount()` being the known candidate. A silently uncovered site is the failure
      mode this story exists to prevent, one level up.
- [ ] **Regression-proof each new assertion.** For at least one refusal test per screen, temporarily
      remove the logging call and confirm the test goes red, per this repo's standing convention. A
      logging assertion that has never been observed failing is the same vacuous coverage
      [`docs/errors-log.md`](../../docs/errors-log.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18)
      records twice.
- [ ] **Full-suite regression.** Per
      [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done),
      the record is an **unscoped** `php artisan test` and an **unscoped** `vendor/bin/pint --format
      agent` — not `--filter` / `--dirty`. If Q2 is answered with a global exception hook, the blast
      radius is the **whole suite** by construction, not the two screens.

## Expected outcome
Every refused privileged attempt on the Users and Roles screens leaves a structured log line naming
the actor, the attempted ability and the target — enough that repeated probing of a sensitive target,
or sustained hammering of a rate-limited action, is detectable after the fact by filtering the log.
Both screens use the **same** line shape and the same level as each other, so a single filter covers
both and a third admin screen has one pattern to copy. Nothing else changes: every refusal returns the
same status, the same message and the same timing it does today, no credential or token reaches the
log, and every existing success-path log line is untouched.

## Acceptance criteria
- [ ] Every `Gate::authorize()` refusal in `App\Livewire\Users\Index` and `App\Livewire\Roles\Index`
      is logged — the **complete** enumerated set above (7 sites per component), with any deliberate
      omission (`mount()` being the expected one) stated in this file with its reason, not silently
      skipped.
- [ ] The rate-limit refusals reaching the Users screen (`CreateUser`'s create limiter and
      `RequestEmailChange`'s two limiters) are logged and are **distinguishable** from an
      authorization refusal by a log filter.
- [ ] The two screens emit the **same line shape at the same level** — same keys, same naming — and a
      test asserts that equivalence directly rather than each screen asserting its own shape in
      isolation.
- [ ] The rule has **one implementation**; no call site re-derives it inline.
- [ ] **Every refusal still refuses identically.** Same exception class, same status code, same
      message, same field for a `ValidationException`, and no state populated that was not populated
      before. Logging never catches-and-continues.
- [ ] No refusal entry contains a password, an invitation token, an email-change hash or a session
      identifier, asserted against the recorded context array.
- [ ] Existing success-path logging is unchanged — `Log::info('User created'/'User updated'/'User
      deleted')` and `Log::info('Role saved'/'Role deleted')` keep their exact current shape and
      level, and their tests pass unamended.
- [ ] No migration, no column, no route, no ability, no UI change, and no new base folder or
      dependency. `config/logging.php` is unmodified unless Q3 is answered "yes".
- [ ] The full unscoped suite is green.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite, run **unscoped**.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Phase 4 should pay particular attention to: whether any
      logged value is itself a disclosure, whether the log is a **denial-of-service amplifier** (an
      unauthenticated or permission-less actor can drive unbounded log writes at zero cost — see Q4),
      and whether any refusal's propagation changed.
- [ ] Documentation updated (docs-keeper):
      - [`docs/security/livewire-authorization.md`](../../docs/security/livewire-authorization.md) —
        its "gate every method that mutates *or discloses*" section gains the observability half:
        gating a method is not the same as knowing when the gate fired.
      - [`docs/architecture/authorization.md`](../../docs/architecture/authorization.md) — the refusal
        line shape as the copyable pattern a third admin screen inherits, alongside the module-gate
        and sidebar-registry patterns it already owns for later epics.
      - [`docs/errors-log.md`](../../docs/errors-log.md) — **only if** Phase 3/4/5 produces a real
        mistake. The incompleteness of 0015's own F-C list (finding I-2) is arguably one already:
        a finding's own prose enumerated its call sites from memory rather than from a grep, and the
        omission survived a Phase 4 audit and into a Phase 5 review. `docs-keeper` decides at Phase 6
        whether that clears this log's "produced a lasting convention" bar.
- [ ] Acceptance criteria met.

## Open questions — must be answered before Phase 3

Per [`docs/contracts.md`](../../docs/contracts.md)'s Uncertainty Handling Rule, these are genuine
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

### Q3 — Does this need its own log channel?
Recommendation: **no** — write to the default channel, as both screens' success lines already do. A
dedicated `audit` channel in `config/logging.php` is defensible if these lines are ever meant to have
their own retention, but that is an operations decision with no code dependency here, and it can be
added later without touching any of this story's code.

### Q4 — Should refusal logging be throttled?
A refusal costs an attacker nothing and writes a log line every time, so the feature is its own
modest denial-of-service amplifier — the very "repeated probing" case it exists to detect is also the
case that floods the log. Options: log every refusal (simplest, recommended for a backoffice of this
size — the traffic ceiling is low and losing entries defeats the purpose); or throttle per
actor/ability with a `RateLimiter`-backed suppression counter (more correct at scale, materially more
code, and a suppressed entry is a blind spot in exactly the window that matters). **Recommended: log
every refusal, and record this question's reasoning in the code so a future scale problem has its
answer waiting.**

### Q5 — Do the actions get the same treatment, or only the two components?
0015's deferral text scopes F-C to "both admin screens". But `App\Actions\Users\CreateUser` /
`UpdateUser` own their own `Gate::authorize()` calls precisely so a **non-dashboard** caller (a future
API endpoint, an Artisan command, a queued job) inherits them — and such a caller would inherit no
logging under a component-only scope. Recommendation: **decide with Q2** — answer (b) covers the
actions for free, answer (a) makes them an explicit extra decision. Listed separately so the coupling
is visible rather than discovered at Phase 4.

## Dependencies and related work
- **Split from story [0015 — Harden the Users CRUD backend's security posture](done/0015-harden-users-crud-security-posture.md)**
  (Phase 4 finding **F-C**), on 2026-08-24. 0015 records the deferral in its "Deferred, deliberately —
  not silently dropped" section; that section stays as written, and this file is the follow-up it
  implies. 0015 owns no part of this work.
- **Independent of sibling story [0015a — Step-up authentication for privileged Users actions](in-progress/0015a-step-up-auth-privileged-user-actions.md).**
  Different concerns entirely: 0015a adds a *guard*, this story adds *observation* of guards that
  already exist. Neither depends on the other's outcome and they may land in either order.
  > ⚠️ **They must not be implemented concurrently.** Both touch `app/Livewire/Users/Index.php` —
  > 0015a adds a step-up call and a catch block, this story adds refusal logging on the same methods.
  > This story's Users-side changes are purely additive, but "additive" does not make concurrent
  > writes safe: per [`docs/contracts.md`](../../docs/contracts.md)'s **Parallel Agent File-Ownership
  > Rule**, two agents writing one file is a lost-edit bug waiting to happen, and this project adopted
  > that rule after a real incident on this exact screen's files (see
  > [`docs/errors-log.md`](../../docs/errors-log.md#two-agents-dispatched-in-parallel-both-wrote-to-the-same-blade-view--2026-08-16)).
  > Whichever story reaches Phase 3 second rebases onto the first and **re-verifies its own line
  > citations**, which this file's tables will have invalidated.
- **Blocked until story 0015 closes**, in practice rather than in principle: 0015 is `in-progress/`
  and its F5/F7/F11 work has already changed `App\Livewire\Users\Index` — three of the seven Users
  refusal points enumerated above (`openCreateModal()`, `openEditModal()`, `confirmDelete()`) are
  0015's own additions and would not exist without it. Starting this story before 0015 closes means
  logging gates that are still moving.
- **Task ordering:** `0015` sorts before `0015a` and `0015b`, satisfying
  [`docs/workflow.md`](../../docs/workflow.md#task-ordering-rule)'s rule. 0015a and 0015b are
  siblings, not a dependency pair.
- **Depends on shipped code only** — both screens' existing `Gate::authorize()` calls and their
  existing `Log::info` success lines. Nothing unfinished beyond 0015 itself.

## Provenance
Finding **F-C**, raised by `appsec-auditor` during story
[0015](done/0015-harden-users-crud-security-posture.md)'s Phase 4 security audit: the three
`Log::info` calls that story adds all sit after a *successful* mutation, so every refusal —
`AuthorizationException` from the disclosure and mutation gates, and either action's rate-limit
`ValidationException` — logs nothing. Deferred by explicit human decision (2026-08-24) rather than
fixed in 0015, because the identical gap exists on `App\Livewire\Roles\Index`, which 0015 does not
touch: closing it on one screen only would leave the same hole on the other and create a second
logging convention alongside it.

Filed as this standalone story on 2026-08-24 after `code-reviewer`'s Phase 5 review of 0015 found that
the deferral was recorded in prose but had **no follow-up task file** — unlike sibling finding F13,
which had been properly split off as
[0015a](in-progress/0015a-step-up-auth-privileged-user-actions.md). The same review's informational finding
**I-2** (originating in the auditor's own report) noted that F-C's list of Users refusal points was
incomplete; **the enumerated tables above were therefore built by reading both components' current
code directly rather than by trusting either prior list**, and they add the two sites both lists
omitted: `mount()`'s `viewAny` check and `deleteUser()`'s own `delete` check.
