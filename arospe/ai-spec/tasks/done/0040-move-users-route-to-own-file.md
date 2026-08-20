# [0040] Move `users.index` into its own `routes/users.php`

## Description
`routes/web.php` declares `users.index` inline, unlike every other functional area:
`settings.php` already follows the "one route file per area, required from `web.php`" pattern,
and task 0010 is about to add `routes/roles.php` following the same shape. `users.index` is the
one route left behind. Pure relocation — no middleware, route name, URI, or authorization
behavior changes; only the file it lives in.

## Type
backend | includes database-expert: no

## Gherkin
```gherkin
Feature: users.index resolves identically after moving into its own route file

  Scenario: An authenticated user holding users.view reaches the Users screen
    Given a user administrator holding the users.view permission
    When they request the Users screen
    Then the Users screen is displayed

  Scenario: A guest is redirected to login
    Given an unauthenticated visitor
    When they request the Users screen
    Then they are redirected to the login page

  Scenario: An authenticated user lacking users.view is refused
    Given an authenticated user who does not hold the users.view permission
    When they request the Users screen
    Then they are refused access to the Users screen
```

## Files to create/modify

- `routes/users.php` — new. Mirrors `routes/settings.php`'s exact shape (single `<?php` header,
  only the `use` imports this file needs, one `Route::middleware([...])->group(function () {...})`
  block, no closing `?>`). The `can:` vs. `permission:` explanatory comment moves here **verbatim**
  — it documents this specific route declaration, not `web.php` as a file:
  ```php
  <?php

  use App\Livewire\Users\Index as UsersIndex;
  use Illuminate\Support\Facades\Route;

  Route::middleware(['auth', 'verified'])->group(function () {
      // `can:users.view`, not Spatie's `permission:` — Livewire 4's
      // PersistentMiddleware allowlist does not carry `permission:`, so every
      // /livewire/update round-trip (save(), deleteUser(), ...) would run
      // unauthorized. `can:` works because Spatie registers permissions as
      // Gate abilities. See docs/architecture/authorization.md.
      Route::livewire('users', UsersIndex::class)
          ->middleware(['can:users.view'])
          ->name('users.index');
  });
  ```
- `routes/web.php` — remove the `Route::livewire('users', ...)` block and its comment; remove the
  now-unused `use App\Livewire\Users\Index as UsersIndex;` import (nothing else in this file
  references it); append `require __DIR__.'/users.php';` after the existing
  `require __DIR__.'/settings.php';` (append, don't reorder — load order between the two doesn't
  affect resolution, since `/users` shares no URI pattern or route name with anything under
  `/settings/*`). Resulting file:
  ```php
  <?php

  use Illuminate\Support\Facades\Route;

  Route::view('/', 'welcome')->name('home');

  Route::middleware(['auth', 'verified'])->group(function () {
      Route::view('dashboard', 'dashboard')->name('dashboard');
  });

  require __DIR__.'/settings.php';
  require __DIR__.'/users.php';
  ```
- **Docs — not touched by this story, flagged here for Phase 6 (`docs-keeper`).** Every location
  that names or quotes `routes/web.php` as where `users.index` lives goes stale the moment this
  ships, confirmed by `grep -rn "routes/web.php" docs/`:
  - `docs/api/routes.md` — the table's scope sentence ("Declared in `routes/web.php` and
    `routes/settings.php`"), the `users.index` subsection's "It lives in `routes/web.php`..."
    sentence, and its `// routes/web.php` code quote of the moving block.
  - `docs/architecture/authorization.md` — a second verbatim `// routes/web.php` quote of the same
    block, the "this is why `routes/web.php` carries an inline comment..." sentence, and the
    Known-limitations table row `The only gated route | routes/web.php (users.index, ...)`.
  - `docs/security/livewire-authorization.md` — a third verbatim `// routes/web.php` quote of the
    same block.
  - `docs/conventions/base-standards.md` — the `routes/` directory listing
    (`web.php, settings.php (no api.php yet)`).
  - `docs/architecture/overview.md` — the Mermaid entry-points node, the components table, and the
    "Web entry points are declared in `routes/web.php` and `routes/settings.php`..." sentence, all
    of which enumerate the route files as exactly `web.php` + `settings.php`.
  - `docs/testing/qa/risk-based-testing.md` — a link citing `routes/web.php` as where
    `can:users.view` on `users.index` lives.

## Tests to perform

Per QA's read of the existing suite: everything this relocation could break is **already** proven
by tests that hit the route over real HTTP, and re-running them unmodified is the actual
regression check — `Livewire::test(Index::class)`-based tests (`IndexRenderingTest.php`,
`CreateUserTest.php`, etc.) never touch route resolution at all and prove nothing about this task.
**No new test is added by this story** — see the correction note below for why the one originally
planned (an unverified-user case) was dropped rather than written.

- [x] Regression (no code change needed, existing tests only): `tests/Feature/Users/IndexTest.php`
      lines ~1186–1215 plus line 732 — guest → redirected to login; authenticated without
      `users.view` → forbidden; authenticated with `users.view` → OK; Super Admin → OK (bypass
      still reaches the relocated route). All must stay green, unmodified, after the move.
- [x] Regression: `tests/Browser/UsersIndexTest.php` — `/users` still resolves and mounts for real
      through the browser pipeline.
- [x] Sanity check before merging: `grep -rn "routes/web.php" tests/` — confirm no test asserts
      against the route's file location/content rather than its behavior (route name, URI,
      middleware outcome). None found during Phase 1, but re-verify at implementation time.

Explicitly **not** worth adding, per `docs/testing/qa/what-not-to-test.md`: a structural test on
`routes/users.php`'s existence, its `require` line, or reflecting `Route::getRoutes()` for the
literal middleware array — the HTTP-level assertions above already subsume this with less
fragility (a structural test would break on cosmetic middleware-array reordering with no added
signal).

### Correction (Phase 3, before implementation) — the `verified`-middleware test case was dropped

Phase 1's QA contribution proposed one new test: an unverified user hitting `route('users.index')`
should be redirected to `route('verification.notice')`, meant to catch the `verified` middleware
being silently dropped while hand-copying the route group into its new file. Phase 3 step 1
(`backend-qa`, red-test step) wrote that test and proved it **cannot work as intended**: this app's
`App\Models\User` does not implement `Illuminate\Contracts\Auth\MustVerifyEmail` (the import in
`app/Models/User.php` is present but commented out — verification/status is enforced at sign-in
time via `users.status`, per `docs/architecture/authentication.md`'s sign-in block, not via
Laravel's native per-request contract). Laravel's stock `EnsureEmailIsVerified` middleware only
acts when `$request->user() instanceof MustVerifyEmail`, so for every actor in this app that
condition is always `false` — **`verified` is a structural no-op on every route it's attached to,
this one included.** Proven mechanically: with the route's middleware group temporarily changed to
drop `verified` entirely, the test's outcome was bitwise identical (still a 403 from `can:users.view`,
same message) to the unmodified group — meaning the test could never have distinguished a correct
relocation from one that silently lost `verified`. It was reverted rather than kept as dead
coverage. Consequence: the four pre-existing HTTP-level tests already cover every outcome that
actually holds in this app, so this story adds no new test at all — a corrected, smaller scope
than Phase 1 assumed, not a gap.

## Expected outcome
`routes/users.php` exists and is required from `web.php` exactly like `settings.php` is; `web.php`
is left declaring only `home` and `dashboard` plus the two `require` lines. `GET /users` behaves
identically for every actor: same URI, route name, and middleware outcome (guest → login redirect,
unauthorized → 403, authorized → 200).

## Acceptance criteria
- [x] `users.index` is declared in `routes/users.php`, not `routes/web.php`.
- [x] `routes/web.php` requires `routes/users.php` the same way it requires `routes/settings.php`,
      and no longer imports `App\Livewire\Users\Index`.
- [x] No behavioral change: middleware (`auth`, `verified`, `can:users.view`), route name, and URI
      are identical before and after — proven by the unmodified existing HTTP-level tests in
      `IndexTest.php` staying green.
- [x] `docs/api/routes.md`, `docs/architecture/authorization.md`, `docs/security/livewire-authorization.md`,
      `docs/conventions/base-standards.md`, `docs/architecture/overview.md` and
      `docs/testing/qa/risk-based-testing.md` all reflect `routes/users.php` (Phase 6), verified by
      `grep -rn "routes/web.php" docs/` returning no claim that `users.index` lives there.

## Definition of Done
- [x] Full existing suite re-run in isolation and green (no new test — see the Phase 3 correction
      note above)
- [x] Code reviewed (code-reviewer)
- [x] No security findings (appsec-auditor) — not expected to apply (pure relocation, no
      authorization logic changes), but Phase 4 still runs per the standard workflow
- [x] Documentation updated (docs-keeper) — see the doc list in Acceptance criteria
- [x] Acceptance criteria met

## Documented functional decisions
- The `can:` vs. `permission:` explanatory comment moves with the route, verbatim, rather than
  being duplicated or dropped — it documents the route declaration itself, not the file it
  happens to live in.
- `require __DIR__.'/users.php';` is appended after the existing `settings.php` require rather
  than inserted before it or reordered — minimizes the diff; load order is provably irrelevant
  here since `/users` shares no URI pattern or route name with anything under `/settings/*`.
- No new authorization test is added at all (revised from Phase 1's plan — see the Phase 3
  correction note above): the four middleware/permission outcomes that actually hold in this app
  (guest, forbidden, authorized, Super Admin bypass) are already proven by existing HTTP-level
  tests that would fail immediately if the relocation broke them; `verified` is confirmed a
  structural no-op here, so no test of it can carry signal.

## Dependencies and related work
- No dependency on tasks 0009–0013 (the roles/permissions line); independent cleanup, shippable
  before, after, or in parallel with it.
- Related to task 0010's `routes/roles.php`, which will establish the same "one file per area,
  required from `web.php`" shape this task retrofits onto `users.index` — this task's
  `routes/users.php` gives 0010 a second precedent to copy, not just `settings.php`.

## Provenance
Raised during a review conversation about why task 0011 puts its route in a new `routes/roles.php`
rather than `routes/web.php`: `users.index` turned out to be the one route in the codebase that
doesn't follow that pattern, with no documented reason for the exception. Logged as a separate,
independently shippable cleanup task rather than folded into 0010/0011. This file is the Phase 1
output of the Three Amigos debate (`backend-expert` + `backend-qa`, no `database-expert`),
superseding an earlier placeholder draft written outside the formal process.

## Closure notes

- Phase 2 (`code-reviewer`, INVEST) — first pass ❌ FAIL: Gherkin scenario 5 had no business-role
  actor and asserted a structural claim nothing in "Tests to perform" would ever verify (rule 1 and
  Testable violations), and the doc-staleness list under "Files to create/modify" named only
  `docs/api/routes.md` when five more locations also went stale. Both fixed (scenario 5 deleted,
  scenario 4 reworded to drop an HTTP-level implementation detail; doc list expanded to six files
  with their exact sub-locations). Re-run ✅ PASS, two further non-blocking nits fixed in the same
  pass (an incomplete `overview.md` sub-location list, an off-by-one "three"/"four" in prose).
- Phase 3 (TDD) — `backend-qa`'s red-test step (step 1) found that the one new test Phase 1 had
  planned (an unverified user redirected to `verification.notice`) tested a middleware that refuses
  nobody in this app: `App\Models\User` does not implement `MustVerifyEmail`, confirmed by proving
  the test's outcome was bitwise identical with `verified` present or removed from the route group.
  The test was reverted and the story corrected in place (Gherkin, "Tests to perform", Expected
  outcome, Acceptance criteria, DoD and "Documented functional decisions" all updated to drop it) —
  see the "Correction (Phase 3, before implementation)" section above. `backend-expert` (step 2)
  then created `routes/users.php` and edited `routes/web.php` exactly to the story's spec — verified
  byte-accurate by diff, not merely trusted. `route:list --name=users.index -v` confirmed identical
  URI/name/middleware before and after. `IndexTest` (75/75), `IndexRenderingTest` (18/18) and
  `Browser/UsersIndexTest` (8/8) all green, run sequentially after two unrelated infrastructure
  incidents on the shared dev host were resolved (a stuck shell process from a malformed multi-line
  command, and the shared `arospe-mysql-1` container being OOM-killed twice under host memory
  pressure from two concurrent Sail stacks — both diagnosed and fixed without touching application
  code; see the conversation this task ran in for the forensics, not repeated here since neither
  produced a lasting code convention).
- Phase 4 (`appsec-auditor`) — ✅ no findings on the first pass. Verified independently rather than
  assumed: middleware stack identical two ways (`route:list -v` and a byte-diff of the declaration),
  the new `require __DIR__.'/users.php';` is unconditional (no environment/config gate could skip
  it), nothing outside `routes/` and the doc list references `routes/web.php` as `users.index`'s
  location, `route:cache`/`route:clear` round-trip still resolves the route, and scope is exactly
  the two intended files (`git status --porcelain`). Recorded that `verified`'s no-op status is
  pre-existing and unaffected by this task, with a note for whoever eventually implements
  `MustVerifyEmail` that four routes (`dashboard`, `appearance.edit`, `security.edit`,
  `users.index`) would all change behavior simultaneously.
- Phase 5 (`code-reviewer`) — ✅ PASS. Full suite re-run in isolation: **443/443 tests, 1096
  assertions**, Pint clean, Larastan level 7 clean (0 errors on `routes/`). Confirmed the reviewer's
  own run was the sole client on the shared `testing` database for its duration (`mysqladmin
  processlist`), satisfying `docs/contracts.md`'s Full Test Suite Gate Rule despite the shared
  MySQL container. One nit noted and left as-is per the story's own spec (F2: `routes/users.php`
  keeps the aliased `use ... as UsersIndex` import, which reads slightly redundant in a
  Users-dedicated file but matches what Phase 1 specified verbatim).
- Phase 6 (`docs-keeper`) — done. All six flagged doc files updated (`api/routes.md`,
  `architecture/authorization.md`, `security/livewire-authorization.md`,
  `conventions/base-standards.md`, `architecture/overview.md`, `testing/qa/risk-based-testing.md`),
  each with its `_Last updated:_` footer rewritten and the prior entry demoted to `_Previously:_`.
  `docs/README.md`'s index footer and Errors-log summary updated. Added a new `docs/errors-log.md`
  entry (fourteen → fifteen) for the Phase 3 finding — framed as a process rule ("prove a middleware
  can refuse someone before asserting that it refuses") rather than restating the underlying fact,
  which `docs/architecture/authentication.md` already owned since task 0007. Final
  `grep -rn "routes/web.php" docs/` returns only the three Phase-5-confirmed-unaffected hits
  (dashboard/login routes) plus changelog prose describing the move itself — no surviving claim that
  `users.index` lives in `routes/web.php`.
- Phase 7 (closure) — this file moves to `ai-spec/tasks/done/`. No relative markdown links in this
  file at any point in its lifecycle (verified by grepping for `](` before both the `new` →
  `in-progress/` move and again here before `in-progress/` → `done/`), so the
  [link-integrity check](../../../docs/workflow.md#link-integrity-check-on-every-stage-move)
  required on every stage move has nothing to fix.

### Environment note, out of scope for this story

Two host-level issues surfaced and were fixed while running this task's tests, neither caused by
this story's code and neither warranting an `errors-log.md` entry (no lasting code convention):
a `Bash` command combining `cd <path>` and `php artisan test ...` on two lines under a single
`eval` left a `tail` process blocked reading an unopened pipe for several hours; and this worktree's
shared `arospe-mysql-1` MySQL container was OOM-killed twice by the host's memory pressure from two
concurrent full Sail stacks (this worktree's and a parallel session's for story 0010) plus ~2.5GiB
of leaked processes in `arospe-laravel.test-1`. Both were diagnosed and resolved by restarting the
affected containers/processes; worth a follow-up if concurrent worktree sessions on this host become
routine (e.g., capping Sail's per-stack resource usage, or a periodic reap of leaked
Playwright/browser-test processes).
