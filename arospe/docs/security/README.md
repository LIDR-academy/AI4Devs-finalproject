# Security Knowledge Base

Project-specific security knowledge for this Laravel 13 + Livewire 4 application, written by the
[`appsec-auditor`](../../.claude/agents/appsec-auditor.md) agent during Phase 4 of
[`docs/workflow.md`](../workflow.md).

Same "only lasting-value entries" spirit as [`errors-log.md`](../errors-log.md) and
[`decisions/`](../decisions/): per-review finding lists live in the audit response, not here. A page
is added here only when an audit establishes a **durable rule or pattern** that future code in this
repo must follow — always with a real code example pulled from this repository.

## Index

- [Authorization patterns](authorization-patterns.md) — the rules governing the `spatie/laravel-permission`
  authorization foundation introduced by task 0002: which checks the Super Admin `Gate::before` bypass
  actually covers (and which it silently does not), why the permission-cache flush must happen after the
  transaction commits, why `hasRole()` must always be passed a guard, why a `Gate::before` closure must
  guard with `instanceof` rather than a type hint, why `config($key, $default)` alone cannot protect
  against a present-but-`null` key, why an ability must cover every **attribute** whose mutation
  achieves the effect it forbids (not only the operation it is named after — task 0004's finding F1),
  why a model-level guard reading a row's protected identity must separate "column not hydrated" from
  "hydrated but null" with `array_key_exists` rather than `??` (task 0008's finding R1 — a working
  rename bypass that survived its own first fix), why role-name collision is closed by the
  `creating`/`updating` guards rather than by the unique index alone, and — from task 0008a's three
  Phase 4 rounds — why a rule that must bind a **Super Admin actor** has to be a direct throw rather
  than a `Gate` check (`Gate::before` decides before any policy method runs, so a `Gate`-mediated
  invariant is inert for exactly the actor it exists to bind), why such a guard must check the target's
  **current** state and not only the value being submitted, and why authorization that consults an
  Eloquent relation must reload it *above* the first check that reads it — a caller's `->with('roles')`
  hydration is attacker-influenced input, and the stale path fails open and silently. From task 0009's
  three Phase 4 rounds it also carries the two rules governing a permission **grant**: why a full-replace
  `sync*()` driven by a form that shows the actor only part of the set must **preserve** what they were
  never shown rather than read its absence as a revoke (and why choosing preserve-vs-deny is a product
  decision to escalate, not a security derivation), and why a check over a submitted list must accept
  every input shape the write itself accepts *and* derive the "before" state from the model rather than
  accept it as a parameter — the state a guard protects can never be an argument to it. Task 0010's
  Phase 4 re-audit adds the pipeline-level companion to those two: when **more than one** guard
  transforms the same full-replace payload, they must agree on what an *omission* means — the roles
  screen's two transformers deliberately disagree (one preserves, one ignores), which is safe only
  because `permissionOptions()` renders the catalog unfiltered, so the safe-making property lives in a
  view rather than in either guard. It carries the condition that would invalidate it, plus why the
  two actions' call *order* is not the safety mechanism and why a grant-scope rule leaves revocation
  unrestricted by construction. From the same story's round 1 it also carries the rule that closes the
  loop on task 0008a's centralization work: **an identity derived from a mutable column must be locked
  once code exists that can mutate it** — the roles screen made `roles.name` writable, which silently
  turned a rename of the seeded `Administrator` role into a way to strip every Administrator-tier
  protection in the app, and a delete into a way to remove the catalog's base role outright. It names
  the review question that catches this class ("which existing invariants does this screen's write
  surface newly reach?"), why the lock must cover exactly the identity and not the row's whole surface,
  and why a `creating` guard without a sanctioned bypass breaks seeding in production. Task 0011's Phase 4
  audit closes that thread from the **view** side: **a control omitted from the DOM is safe only for the
  one value whose guard preserves an omission** — the roles editor withholds exactly one checkbox
  (`roles.manage-administrators`, absent rather than disabled, because a disabled control both leaks the
  permission's existence and does not submit), and that is safe only because it is precisely the
  permission `EnforceAdministratorPermissionGrant` re-adds. It names the one-`@if`-away regression, the
  count-based test that catches it where an `assertDontSee()` would not, and the accepted Low residual
  that withholding the control does not withhold the id. Task 0012 adds the **confirmed-safe** entry
  every future module gate inherits: a `can:`-gated route's 403 names no permission because
  `AccessDeniedHttpException` is an `HttpException` and `prepareResponse()` therefore never reaches the
  debug renderer — `errors::403` prints only the exception message, byte-identically at both `APP_DEBUG`
  settings. It names the two things that *would* reopen the disclosure (an app-owned
  `resources/views/errors/403.blade.php`, or a `Response::deny('…')` message naming an ability), why
  pinning `app.debug` in a test proves nothing on that path, and why `assertForbidden()` +
  `assertDontSee()` needs a positive assertion beside it — both are satisfied by an empty body. Task 0013
  adds the first rule governing a **declarative permission registry** (`config/modules.php`, designed for
  every later epic to append to): **a registry that means "ungated" by *absence* fails open, silently** —
  `empty($item['permissions'])` cannot distinguish "declared ungated" from "the author forgot the key",
  and `empty()` is the one construct that reads a missing key without a warning, so an omitted key, a
  misspelled key and a `null` value all render the entry for everyone while the *wrong-looking* mistakes
  (a string instead of an array, an unknown group key, an unseeded ability) all fail closed. **Closed in
  the same story**, so both ✅ blocks are the shipped guard tests quoted verbatim: the allow-list schema
  test a new ungated entry cannot join without someone editing its one literal line, and the test pinning
  each entry's `permissions` to its route's real `can:` middleware so the registry cannot drift from what
  the route enforces. It also records why asserting `toHaveKey('permissions')` alone is a correct
  narrowing rather than a gap — `permissions` is the only registry key whose absence is silent, since
  every other one either raises an `ErrorException` at render or fails closed. A companion **confirmed-safe** section
  recording the six mechanics a later epic should not re-derive: that `Gate::any()` traverses the same
  `callBeforeCallbacks()` path as `can:` middleware (so the sidebar and the route cannot disagree), that
  Spatie's and this app's two `Gate::before` callbacks compose in either registration order because the
  vendor's returns `null` rather than `false` on failure, that `hasAnyPermission()` would have shown the
  zero-row Super Admin *nothing*, that an unseeded ability and a guest both deny rather than throw, that
  every rendered position is escaped including the `data-test` array keys, and that `flux:sidebar.group`
  renders its slot **twice** when `expandable` and `icon` are combined — a count assertion against it is
  off by a constant. The registry's *reusable* shape, for a later epic adding its own entry, is owned by
  [architecture/authorization.md](../architecture/authorization.md#the-second-half-of-a-module-gate-the-sidebar-registry);
  this page holds only the security rules.
- [Seeder safety](seeder-safety.md) — why `db:seed` is a production-reachable operation in this app, why
  fixture data must be guarded by an environment **allow-list** rather than a "not production" deny-list,
  and the rules for bootstrapping a privileged account from a configured email address: canonical
  lowercase, format-validate before any lookup, mailbox-ownership proof (`email_verified_at`) before any
  grant, abort with a `return` rather than an exception so the catalog still commits, and a persisted
  audit log that never carries the generated secret. Since task 0016 it also owns the rules for a
  **required catalog seeder that is not a privilege bootstrap**: why the production runbook now names
  `--class=ProductionSeeder` rather than any single catalog class (a pinned class silently skips a
  catalog added later), why `WithoutModelEvents` on `DatabaseSeeder` but not `ProductionSeeder` makes
  the same seeder run under two different event semantics, why `?->` on a structural lookup commits a
  silently invalid catalog instead of failing, why a seeder idempotency key on a `utf8mb4_unicode_ci`
  column is byte-exact in PHP and case-insensitive in the database (the `roles.name` trap, now on
  `sales_regions.slug` — insert fails closed, `where()` fails open), and the confirmed-safe split
  between seeder-owned and administrator-configurable columns that makes `upsert()` the wrong default.
- [Signed-link verification patterns](signed-link-verification.md) — the rules governing this repo's
  first app-owned signed route (`email-change.confirm`, task 0003): why `ValidateSignature` is
  globally prioritised ahead of `SubstituteBindings` (and the side effects verified across the `web`
  pipeline), why a value bound into a link by `sha1()` must be normalised as the action's first
  statement, why `lockForUpdate()` plus an availability re-check is not a race guard without the
  unique index and its SQLSTATE `23000` catch, and why every refusal branch must flash identical copy.
- [Livewire component authorization](livewire-authorization.md) — the rules governing this repo's first
  permission-gated Livewire screen (`App\Livewire\Users\Index`, task 0004): the verified
  `PersistentMiddleware` allow-list and what it silently drops on `/livewire/update` (Spatie's
  `permission:`, but also `verified`, `password.confirm` and `throttle:`), why every method that mutates
  **or discloses** re-authorizes as its first statement, why `#[Locked]` plus a database-read assignment
  is what keeps `Rule::unique()->ignore()` safe, why server-derived properties must be locked too, and
  why a privilege rule enforced only in the component is bypassed by every other call site of the action.
- [Soft-delete security patterns](soft-delete-patterns.md) — the rules that follow from putting
  `SoftDeletes` on this app's only authenticatable model (`App\Models\User`, task 0005): why the
  `SoftDeletingScope` *is* the sign-in refusal rather than one check among several, why
  `laravel/passkeys`' `$passkey->user` relation is the single place that scope can be lost silently
  (and what must land alongside any `withTrashed()` there), why freeing an email address also
  obliges you to revoke everything keyed by that string (`password_reset_tokens`), how adding
  `SoftDeletes` silently flipped `spatie/laravel-permission` into **keeping** role grants on deleted
  accounts, why a UUID-derived placeholder written into a `UNIQUE` column still needs the SQLSTATE
  `23000` catch every other writer in this repo has, and the list of paths confirmed already covered.
- [CI workflow hardening](ci-workflow-hardening.md) — the rules governing `.github/workflows/*.yml`,
  established by task 0006b's `npx playwright install --with-deps chromium` step (this repo's first
  CI step that downloads and executes a third-party binary): why the SHA-pinning convention covers
  `uses:` but not `run:`, why `npx <pkg>` must be written so a missing local install fails instead of
  silently fetching `@latest`, why `npm ci` rather than `npm i` is what makes `package-lock.json` an
  actual pin, why every step executing third-party code must sit **above** the step that writes the
  Flux credentials to disk, why git-ignoring `tests/Browser/Screenshots` is only sufficient while no
  workflow uploads artifacts, and the verification that `DB_DATABASE=testing` still covers the new
  `Browser` suite because the app under test shares the test process.
- [Blade / Livewire output encoding](blade-livewire-output-encoding.md) — where `{{ }}` stops being
  enough, established by task 0006's Users list markup: why a value interpolated inside a `wire:*`
  directive lands in a **JavaScript** evaluator (`x-on:` → `Alpine.evaluateRaw` → `new AsyncFunction`)
  and why Blade's `&#039;` is decoded back to `'` by the HTML parser before Livewire reads it, making
  `@js(...)` the only correct encoder for a directive argument; why a public property with no
  `wire:model` is still client-writable unless `#[Locked]` — which is why `$deletingUserName` now
  carries it and why `$users` staying unlocked is an accepted residual with a stated reopening
  condition; why a modal must read authoritative values from the model rather than back out of a
  client-writable array; plus the list
  of template patterns verified already safe (no `{!! !!}`, Flux's own escaping, literal-only `__()`
  keys, and why `@close="closeModal"` is not a dead handler).
- [Login-time account-status enforcement](login-status-enforcement.md) — the rules that follow from
  task 0007 turning `users.status` into an authentication control: why every `Inactive` → `Active`
  transition is now a privilege grant (and why `ActivateVerifiedUser`'s `Suspended`-only guard does
  not cover an administrator's *deactivation*), the four vendor `$guard->login()` call sites and which
  of the three enforcement points reaches each, why a custom `Fortify::authenticateUsing()` callback
  must resolve credentials through the guard's `UserProvider` (soft-delete scope + password rehash),
  why the refusal must be thrown only *after* credentials verify and must never name the status, why a
  status-blocked attempt counts toward the limiter only because `fortify.limiters.login` moves it to
  route middleware, why rejecting on the `Login` event alone is silently undone by
  `SessionGuard::login()`'s very next line, and — from the re-audit — why the pre-save value a
  `Verified` listener needs is `getPrevious()` and **never** `getOriginal()` (`finishSave()` calls
  `syncOriginal()` after every successful save), with the four constraints that come with it, plus
  the nullable-`?User` rule for `Passkeys::authorizeLoginUsing()`.

- [Step-up authentication](step-up-authentication.md) — the rules governing the app's **third**
  authorization layer, added by task 0015a: a password-confirmation freshness guard that answers
  "is the person at the keyboard still the account holder", which route middleware and policies both
  pass for a hijacked or unattended session. Why the check must reuse
  `RequirePassword`'s own session key, config key and `>` boundary rather than re-derive them (and why
  the boundary needs asserting from *both* sides to tell `>` from `>=`); why the throwing guard must be
  a wrapper around the non-throwing predicate the UI warning reads, so the hint cannot drift from the
  rule; why the guard runs strictly **after** every `Gate::authorize()` on its branch — an inverted
  ordering turns a permission refusal into a credential prompt plus a target-exists disclosure, and a
  branch with no preceding `Gate` call is not an exemption; why the refusal is a **direct throw** (a
  `Gate`-mediated one is inert for the Super Admin it most needs to bind) rendering **423, never 403**
  (the actor *does* hold the permission), with `Handler::render()` verified to consult `render()` ahead
  of the debug renderer; and why the guard must key off the narrowest booleans describing the privileged
  write rather than the wider `updateSensitiveAttributes` condition beside it, which would silently
  extend it to an email-only edit. Carries a **confirmed-safe** list of six verified mechanics (absent
  key *and* no session both fail closed, a logout flushes the key while `SessionGuard::login()`'s
  `migrate(true)` would not, the intended-URL round trip is a fixed route with no open-redirect surface,
  `$this->redirect()` vs. a returned `Redirector`) and a ⚠️ list of five things the layer does **not**
  close — creation and email change are both out of scope by decision while remaining escalation and
  account-seizure primitives, `POST /user/confirm-password` is unthrottled, a refusal writes no audit
  record, and `settings/security` still relies on route middleware alone.

_Last updated: 2026-08-24 — Added [step-up-authentication.md](step-up-authentication.md) from the
Phase 4 audit of task 0015a (step-up authentication for privileged Users actions) — the first code in
this repo to act on the `password.confirm` row of
[livewire-authorization.md](livewire-authorization.md)'s `PersistentMiddleware` table. The audit
raised no blocking implementation finding: the guard's ordering, scope, fail-closed behaviour, 423
render and single-predicate UI hint were each verified against the shipped code and vendor source.
Its findings are about the control's **scope and dependencies** — recorded as that page's ⚠️ list,
since each needs a human decision rather than a patch._

_Previously: 2026-08-22 — Task 0013 (module/sidebar access gating — UI), Phase 6 docs sync: the registry section's index entry above is rewritten now that **both findings are closed** — its ✅ blocks are the shipped guard tests rather than recommendations, and it records why the shipped allow-list assertion is deliberately narrower than the one originally recommended. Added the pointer to [architecture/authorization.md](../architecture/authorization.md#the-second-half-of-a-module-gate-the-sidebar-registry), which now owns the registry's reusable shape so this page can stay limited to the security rules. No new page and no new rule in this pass._

_Previously: 2026-08-21 — Task 0013 (module/sidebar access gating — UI), Phase 4 audit: no new page —
`authorization-patterns.md` gained two sections for this repo's first **declarative permission registry**,
`config/modules.php`. The registry's whole design is that every later epic appends entries to it, which
makes the shape of its default the durable question rather than the two entries it holds today: "ungated"
is currently expressed as an **absent or empty** `permissions` key read through `empty()`, so three
distinct developer mistakes — an omitted key, a misspelled key, a `null` value — all resolve to "visible
to everyone" with no warning, no exception and no log, while the mistakes that *look* riskier all fail
closed. Written as a ❌/✅ pair with the finding marked **open**, per the audit-authored-page rule, so
Phase 5's fix has a slot rather than needing the framing rewritten. The companion **confirmed-safe**
section records the `Gate::any()` mechanics a later epic should not re-derive, all verified by execution
against the real component and vendor source rather than from the package's docs. Per-review findings (the
severity list, including the registry-vs-route drift guard and two low-severity hygiene notes) live in the
audit response, not here._

_Previously: 2026-08-21 — Task 0012 (module/sidebar access gating — backend), Phase 4 audit: no new
page — `authorization-patterns.md` gained one **confirmed-safe** rule, "A `can:`-gated route's 403 names
no permission — and `APP_DEBUG` is not what makes that true". This story ships zero production code, so
it produced no bypass to write up; what it did produce is a guarantee that every later epic's module
gate inherits, holding for a mechanism different from the one assumed, with two named conditions that
would reopen it. Verified by rendering the real exception handler at both debug settings rather than by
reading the test's assertions. The audit's other findings are per-review (a missing post-commit
permission-cache flush in `App\Livewire\Roles\Index`, which is a **violation of an existing rule on this
same page** rather than a new one, plus three test-quality corrections) and live in the audit response,
not here._

_Previously: 2026-08-21 — Task 0011 (Roles & permissions management — UI), Phase 4 audit (verdict
PASS, no blocking findings): still no new page — `authorization-patterns.md` gained one durable rule,
"A control omitted from the DOM is safe only for the one value whose guard preserves an omission", and
its **"Two guards on one payload"** section was narrowed in the same pass. That section closed with
"the second action never has to preserve anything, because nothing is ever invisibly absent" — true
while the paired Blade view was still unbuilt, and no longer true now that it ships one deliberate
omission, with `EnforceAdministratorPermissionGrant`'s preserve branch live rather than dormant.
Corrected rather than only appended to, per [errors-log.md](../errors-log.md)'s "a security page
documented the vulnerable code as current" lesson. Every claim in the new section was verified by
rendering the real component for both actor tiers (37 vs. 38 checkboxes) and by executing a broad
administrator's omitting save, not by reading the markup._

_Previously: 2026-08-20 — Task 0010 (Roles & permissions management — backend), Phase 6 docs sync:
still no new page — `authorization-patterns.md` gained a second rule from this story, "An identity
derived from a mutable column must be locked once code exists that can mutate it" (Phase 4 round-1
finding **F1**, High). Round 1's other seven findings each already had a home on that page or were
screen-specific hardening with no generalizable lesson; F1's did not, and it is the one most likely to
recur — every future module screen widens the set of columns application code can write, and some of
those columns are read as identities elsewhere. The index entry above was widened accordingly._

_Previously: 2026-08-20 — Task 0010, Phase 4 re-audit
(round 2, verdict PASS): added no new page — it expanded `authorization-patterns.md` with one durable
rule, "Two guards on one payload must agree on what an omission means", the pipeline-level companion to
task 0009's two grant rules. It is the first section on that page recording a **hazard rather than a
bypass**: the roles screen's two transformer actions deliberately treat an omitted-but-already-granted
permission in opposite ways, and the property that makes the combination safe (`permissionOptions()`
returning the unfiltered catalog) lives in neither guard. The index entry above was widened accordingly.
Round 1's eight findings were each re-verified closed by execution, not by reading._

_Previously: 2026-08-20 — Task 0009 (Administrator-level permission grant): its three Phase 4 rounds
again added no new page — they expanded `authorization-patterns.md` with two durable rules (a full-set
sync behind a partially-visible form must preserve what the actor cannot see; a check over a submitted
list must accept every shape the write accepts and derive the "before" state itself) and **closed** that
page's policy-layer partial-hydration residual, now that `RolePolicy` and the `Gate::before` deferral
both read `Role::isSuperAdminRoleRow()`. The index entry above was widened accordingly._

_Previously: 2026-08-20 — Task 0016 (Sales Region catalog schema + seeder): added no new page — the
audit expanded `seeder-safety.md` with four durable rules for required-catalog seeders and withdrew that
page's now-wrong `--class=RolePermissionSeeder` production runbook line. The index entry above was
widened accordingly._

_Previously: 2026-08-19 — Task 0008a (centralize Administrator-level role identification): its three
Phase 4 rounds added no new page — they expanded `authorization-patterns.md` with two durable rules
(a rule that must bind a Super Admin actor is a direct throw, never a `Gate` check; authorization that
consults a relation reloads it above the first check that reads it) and corrected two of that page's
now-stale passages. The index entry above was widened accordingly._

_Previously: 2026-08-17 — Third Phase 4 pass on task 0008: expanded the `authorization-patterns.md`
entry for the partially-hydrated-identity rule (finding R1) and for role-name acquisition now being
closed by the `creating`/`updating` guards rather than the unique index (finding F3)._

_Previously: 2026-08-17 — Phase 4 re-audit of task 0007: expanded the `login-status-enforcement.md`
entry for the `getPrevious()`-not-`getOriginal()` rule (which replaced that page's own disproven
first recommendation) and the nullable passkey-callback rule._

_Previously: 2026-08-17 — Added `login-status-enforcement.md` from the Phase 4 audit of task 0007
(non-active status blocks sign-in)._

_Previously: 2026-08-16 — Added `blade-livewire-output-encoding.md` from the Phase 4 audit of task
0006 (Users list + create/edit modal UI)._

_Previously: 2026-08-16 — Added `ci-workflow-hardening.md` from the Phase 4 audit of task 0006b
(browser-test infrastructure setup)._

_Previously: 2026-08-14 — Added `soft-delete-patterns.md` from the Phase 4 audit of task 0005
(soft-delete users + administrator-level protection guard)._
