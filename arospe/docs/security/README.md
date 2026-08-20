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
  unrestricted by construction.
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

_Last updated: 2026-08-20 — Task 0010 (Roles & permissions management — backend), Phase 4 re-audit
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
