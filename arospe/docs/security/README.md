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
  Since task 0018 it also carries the **confirmed-safe** verdict on `wire:click="$toggle('prop')"` — the
  repo's first magic action used as a form binding, adopted on the Sales Regions modal for a real-browser
  automation reason: it is client-side sugar over `$set`, which writes the *same* `updates` payload
  `wire:model` does, while the `$set` call itself is `$returnEarly()`d server-side, so it dispatches no
  method and `#[Locked]` binds it unchanged (verified by execution, not by reading) — with the rule that
  choosing between `wire:model`, `wire:model.live` and `$toggle` is a **reactivity** decision and never
  an authorization one.
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

- [Model-instance trust](model-instance-trust.md) — the rules established by task 0017's Phase 4 audit,
  this repo's first **domain-invariant** guard (a rule about the shape of the data — "exactly one default,
  and it is always active" — rather than about who may act). Every "derive the state, never accept it" rule
  on [authorization-patterns.md](authorization-patterns.md) is stated in terms of a *parameter beside* the
  model; this page is the same failure class one level down, where the untrusted input **is** the model.
  Two rules, one root cause. **(1)** A guard must re-read its subject under lock *inside* its own
  transaction: `SetDefaultSalesRegion`'s D10 refusal is correctly placed inside the transaction and still
  cannot hold, because `$newDefault->is_active` was read before that transaction existed — with the three
  reasons `lockForUpdate()` does not close it and reordering it would not either (it locks the rows being
  *cleared*, not the one being *promoted*; on MySQL the unindexed scan happens to lock the whole table and
  it still makes no difference; and a lock protects a row from changing but cannot refresh a value already
  in a PHP variable). Three confirmed paths to the forbidden `is_default = true, is_active = false` state,
  the sharpest needing no forged input at all — two administrators clicking within the same second
  deactivate the catalog's only default with no replacement named and no refusal raised. **(2)** `save()`
  writes the whole **dirty set**, not the `fill()` allow-list, so "the single named writer of this column"
  is a convention among callers rather than an enforcement: a caller that dirties `slug`/`name`/`sort_order`
  before calling `UpdateSalesRegion` persists all three despite `#[Fillable]`, and one that dirties
  `is_default` before calling `SetSalesRegionActive` reaches **two defaults** without `SetDefaultSalesRegion`
  ever running. Both sections marked **closed**, same day as the audit that found them — each ❌ block is the
  code as it shipped from Phase 3, each ✅ block is the real shipped fix (re-fetch the row under
  `lockForUpdate()`, inside the action's own transaction, and read/write only through that instance) — plus
  the note that `App\Actions\Users\UpdateUser` shares the second shape (out of scope for 0017, recorded so
  the next audit treats it as known rather than new), the corrected `whereKeyNot()` docblock rationale, and
  the regression-test shape that can actually fail (dirty the instance, or mutate the row behind it,
  *between* hydration and the call) — eight such tests were added and each was confirmed to redden against
  the pre-fix code before the fix was restored. **A third section, "Re-audit round 2" (2026-08-26), records
  what re-auditing that fix as new code found**, per this project's own standing rule that a security fix
  needs the same scrutiny as the bug it closes: the round-1 fix's own lock-ordering docblock justified itself
  against a scenario that provably cannot occur, while round 1 had *introduced* a real, confirmed (two live
  MySQL sessions) deadlock elsewhere — `SetDefaultSalesRegion` acquiring its target lock and its clear-scan
  lock as two separate queries rather than one ordered one, closed by collapsing them (**R-1**); the
  promotion branch could also return an instance that lied about `is_default` after the nested action's
  separate write cleared it, closed with a `refresh()` (**R-2**); plus a recorded-not-fixed note on the
  `Gate` target still being the caller's instance (**R-3**, no rule reads it yet), an authorization-ordering
  fix that deliberately did *not* touch an already-reviewed-and-accepted two-transaction shape (**R-4** — the
  re-audit's broader suggestion was declined in writing rather than silently reversing a Phase 1 decision),
  and three test-hygiene fixes (**R-5**). **A Phase 5 code review then corrected two claims on the page itself** — an unusually fast recurrence of [the audit-authored-page failure mode](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20), where the stale sentence was *one day old* rather than one story old: its status blockquote said **neither** finding was reachable through the shipped dashboard, which is true of F-2 (the component re-fetches every row with `findOrFail()` before each call, so it never hands an action a dirtied instance) and **false of F-1** — that `findOrFail()` runs *outside* the action's transaction, so a second administrator's already-committed write landing in that window reproduces the exact stale read, which is the "two administrators clicking within the same second" row the page's own exploit table already described two paragraphs below. And the lock-ordering bullet repeated R-1a's over-claim one layer up: `SetSalesRegionActive`'s promotion path still acquires two lock sets in sequence (its own ordered query, then the nested action's separate one), so what closes that residual window is the **outer** transaction's `attempts: 3` retry, not the ordering — a nested SAVEPOINT-level call cannot retry itself, since Laravel only retries at `transactions === 1`.
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
  write rather than a wider, nearby condition — task 0015a's own Phase 3 shape got this backwards for
  a **third-party email change**, exempting it alongside a self-service one when only the self-service
  case should be exempt, closed by decision D7 (finding F2). Carries a **confirmed-safe** list of six
  verified mechanics (absent key *and* no session both fail closed, a logout flushes the key while
  `SessionGuard::login()`'s `migrate(true)` would not, the intended-URL round trip is a fixed route with
  no open-redirect surface, `$this->redirect()` vs. a returned `Redirector`), a **closed-by-decision**
  section covering the first Phase 4 audit's four findings (creation of an Administrator-tier account,
  D6/F1; a third-party email change, D7/F2; the unthrottled `password.confirm.store` endpoint, D8/F3;
  and a step-up refusal writing no audit record, F4 — each as a ❌/✅ pair, re-verified by a Phase 4
  re-audit rather than taken on the fix commit's word), and a narrowed ⚠️ list of what the layer still
  does **not** close — `settings/security` relies on route middleware alone, and `settings/profile`
  permits a self-service email change with no step-up check at all (re-audit finding N5), the same
  self-service case this layer's own `$isSelfEdit` exemption leaves alone for a different, narrower
  reason.

- [Image upload & server-side image processing](image-upload-processing.md) — the rules established by
  story 0019's Phase 4 audit and **re-audit**, and the first page here about a feature that accepts a
  file from a user and then *decodes* it. Its central rule is that **a pixel-dimension cap does not
  bound decode memory**: bytes-per-pixel is a property of the installed ImageMagick build, not a
  constant, and this project's Q16-HDRI build measures ~35 bytes/pixel — so an 8000×8000 PNG that is
  **7,898 bytes on disk** (0.1% of the 8 MB size cap) extrapolates to ~2.2 GB in one request, with
  `memory_get_peak_usage()` reporting a few MB throughout because it cannot see Imagick's C-level
  allocations. The decoder must therefore enforce the same ceiling the validator promises, derived from
  the *same constant* so the two cannot drift. It carries the measured evidence that the two limit
  layers do **different** jobs and neither is redundant (`WIDTH`/`HEIGHT` refuse at header-parse time
  at 0.00 s and 38.5 MB; the byte ceiling is slower and coarser but is the only layer that sees an
  animated input whose *per-frame* dimensions are all legal — 965.9 MB with limits versus 2,823.1 MB
  without, which matters because `decodeAnimation` is `true`); why `DISK => 0` is what makes the byte
  ceiling bite instead of converting memory exhaustion into disk exhaustion; and a ⚠️ that
  `Imagick::setResourceLimit()` is **process-global**, which is not a concurrency hazard on this NTS,
  Octane-free stack but *is* sequential contamination — harmless only while
  `GenerateImageConversions` remains the single Imagick consumer in `app/`. On the storage side it
  covers why `Storage::putFile()`'s content-sniffed extension must never name a file the web server
  serves directly (a sniffed `image/svg+xml` becomes `.svg`), the allow-listed-`match` replacement, and
  the **enumeration** that proves such a `match`'s `default => throw` arm unreachable rather than
  asserting it — over Symfony's full 1,848-entry table exactly three MIME types can satisfy
  `mimes:jpg,jpeg,png`, and the one the map does not cover (`image/pjpeg`) is unproducible by either
  detector in this stack. It also records that **`image` + `mimes:` is not by itself a content check for
  a Livewire temporary upload**, because `TemporaryUploadedFile::getMimeType()` routes through
  Flysystem's `FallbackMimeTypeDetector`, which guesses from the *extension* whenever finfo is
  inconclusive — 2 KB of `random_bytes()` named `garbage.jpg` reports as `image/jpeg`, and `dimensions:`
  is the rule that actually rejects it; that `Storage::put()` **returns `false` rather than throwing**
  on a `'throw' => false` disk, so an ignored return commits a row pointing at a file that was never
  written; and — the test-design half of the same finding — that a read-only-directory fixture makes the
  *first* write fail, leaving the partial-write cleanup branch **vacuously** asserted, with the
  `mkdir()`-over-the-second-path fixture that actually exercises it. Finally it covers why an imaging
  exception must never reach the user (Imagick messages carry absolute paths and internal source
  locations), why the catch must be on the base `ImageException` (a resource refusal arrives as
  `ImageDecoderException` on one path and `DriverException` on the other), and a **confirmed-safe** list
  of six verified mechanics — including the rule that a limiter key falling back to a shared
  `'unauthenticated'` literal must be *proven* unreachable, the companion hazard to a limiter keyed on
  the target.

_Last updated: 2026-08-27 — Story 0019 (Media Library upload and conversions — backend), **Phase 4 re-audit**: added [image-upload-processing.md](image-upload-processing.md), the eleventh page, from the verification of findings F-1 (decompression bomb via unbounded Imagick decode), F-2 (the action not validating its own input, and trusting `putFile()`'s inferred extension), F-3 (unchecked `Storage::put()` return) and F-5 (Livewire's temporary-upload endpoint carrying no `mimes` restriction and a looser size ceiling). Every number on that page was measured against the shipped code in this worktree rather than carried over from the first audit's notes, and the reproduction fixtures were removed afterwards. Written as ❌/✅ pairs describing the **shipped** state from the outset, per [errors-log.md](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20)'s rule for an audit-authored page — the failure mode that page's own footer records as having recurred with a one-day fuse._

_Previously: 2026-08-26 — Task 0017 (Sales Region tax configuration — backend), **Phase 6 docs sync**: no new page and no new rule — [model-instance-trust.md](model-instance-trust.md) was re-verified against `HEAD` rather than rewritten (every ❌/✅ code block still matches the shipped actions, the `whereKeyNot()` → `$rows->reject(...)` supersession is recorded on the page and confirmed in the code, and nothing in this app reads `SetSalesRegionActive`'s return value, exactly as the R-2 section says). What this pass corrected is **this index entry**, which stopped at Phase 4 round 2 while the page itself gained two Phase 5 code-review corrections the next day: the status blockquote's "neither finding was dashboard-reachable" claim, which is true only of F-2, and the lock-ordering bullet's over-claim, where the residual window inside `SetSalesRegionActive`'s promotion path is closed by the **outer** transaction's `attempts: 3` rather than by ordering. Both are now summarised above. Recorded as a distinct data point rather than folded away: this is the audit-authored-page failure mode recurring with a **one-day** fuse instead of a one-story one, caught by the review that immediately followed — which is the prescribed fix working, not a new lesson (see [errors-log.md](../errors-log.md))._

_Previously: 2026-08-26 — Task 0017, Phase 4 re-audit round 2 and
same-day fix: [model-instance-trust.md](model-instance-trust.md) gained a third section, applying this
project's own rule that a security fix needs re-auditing as new code, not merely confirmed to close the
finding it answers. The round-1 fix's own lock-ordering justification turned out to protect a scenario that
cannot occur, while round 1 had introduced a real, execution-confirmed deadlock elsewhere — collapsed to one
real ordered lock query rather than an asserted one (R-1). A promotion branch could return an instance lying
about `is_default` after a nested action's separate write cleared it, fixed with a `refresh()` (R-2). A note
recorded (not fixed — no rule reads it yet) on the `Gate` target still being the caller's instance (R-3). An
authorization-ordering fix applied without touching an already-reviewed-and-accepted two-transaction shape
(R-4 — the re-audit's broader atomicity suggestion was declined in writing, per this project's own rule that
a re-raised instruction contradicting an existing decision is withdrawn rather than acted on). Three
test-hygiene fixes (R-5).

_Previously: 2026-08-25 — Task 0017, Phase 4 audit and same-day fix: added
[model-instance-trust.md](model-instance-trust.md), the **tenth** page (this said "eleventh" until the Phase 6 pass counted the directory: `ls docs/security/*.md` returns ten files besides this index). The audit's two findings
share one root cause and one remedy, which is what earns them a page rather than a per-review note: a
caller-supplied Eloquent instance is untrusted on **both** sides — its attributes are not a safe input to a
guard, and its dirty set is not a safe payload for a write. Written as ❌/✅ pairs from the start per the
[audit-authored-page rule](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20)
and updated to **closed** once the fix landed the same day, so neither block was left describing a tree that
no longer existed. This is also the first page here about a **domain invariant** rather than an authorization
rule — the authorization coverage of this story (three actions, five component methods, the policy, the
`can:`-gated route and the refusal logging) was audited and found complete, with no finding. Per-review
findings, including the severity list and the verdict on the TOCTOU item Phase 2 deferred here, live in the
audit response, not on this page._

_Previously: 2026-08-24 — Task 0015a, Phase 5 code review finding F-3: [step-up-authentication.md](step-up-authentication.md)
was authored during the *first* Phase 4 audit (Phase 3's shipped code, role/status/delete only) and
never revisited once the human-approved widening (F1/F2/F3/F4, decisions D6/D7/D8) and its own re-audit
landed — the exact staleness
[errors-log.md](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20)
already names. This entry is rewritten around that page's now-closed ⚠️ items rather than describing
them as open._

_Previously: 2026-08-24 — Added [step-up-authentication.md](step-up-authentication.md) from the
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
rendering the real component for both actor tiers (41 vs. 42 checkboxes) and by executing a broad
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
