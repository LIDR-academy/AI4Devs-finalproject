# [0006b] Wire up the `tests/Browser/` suite (browser-test infrastructure)

## Description
The Pest 4 browser-testing tooling is installed (`pestphp/pest-plugin-browser` `^4.3`, `playwright`
`^1.61.1`, browser binaries downloaded) but **no browser suite is wired up**: `tests/Browser/` does
not exist, `phpunit.xml` declares only `Unit` and `Feature`, `tests/Pest.php` applies
`RefreshDatabase` only to `Feature`, and `.gitignore` does not ignore browser screenshots — all four
listed as still pending in [playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md).
This story closes that gap with the smallest possible change: the suite declaration, the
`RefreshDatabase` decision, the screenshot ignore, and **one** canary browser test that proves the
pipeline runs end to end. It writes no product behavior and no product tests.

> **Numbering.** This story is deliberately `0006b`, not the next sequential id. Story
> **[0006] Users list + create/edit modal — UI** already exists in the **new** stage and declares a
> hard dependency on "a separate infra task" for its `tests/Browser/UsersIndexTest.php`
> (0006's decision 5 and its *Dependencies & risks* section). [workflow.md](../../../docs/workflow.md)'s
> **Task ordering rule** asks that "a dependency's number is lower than its dependents' numbers"; a
> letter suffix keeps this story adjacent to the one it unblocks **without** renumbering 0006–0015
> and without disturbing the cross-references renumbering would drag along (`related_task_id`, range
> notation, prose mentions inside `done/` files) — a deliberate trade the orchestrator chose.
>
> **Be aware of the cost of that trade:** `0006b` sorts *after* `0006` in a plain directory listing,
> so the ordering intent is **not** carried by the filename. It is carried by this note, by 0006's
> own *Dependencies & risks* section, and by the pick-up rule below. **Pick-up rule: implement
> 0006b before 0006.** **No other task file is renumbered or moved by this story.**

## Type
backend | includes database-expert: **no**

> Backend, not fullstack and not frontend: every file this story touches is test-runner
> configuration or a test file. It creates **no** Livewire component, Blade view, Flux markup or
> CSS, so there is no frontend artifact to split off and therefore no `related_task_id`. No schema,
> migration, seeder or query changes either, so `database-expert` does not join — the one database
> concern (whether the new suite gets `RefreshDatabase`) is a test-harness wiring decision made in
> `tests/Pest.php`, not a data-model decision.

## Refined user story

**As** a backend developer on this project,
**I want** the `tests/Browser/` suite declared, wired to `RefreshDatabase`, ignoring its own
screenshot artifacts, and proven by one canary test,
**so that** any story needing real-browser coverage — starting with **0006**'s create/edit modal
open/prefill/close behavior — can add a test file and have it actually run, instead of discovering
at implementation time that the suite does not exist.

The value is unblocking, not user-facing: nothing an end user can observe changes. The unit of value
delivered is **"a browser test written in this repo executes and can fail"** — which today it
cannot, because `php artisan test` would never discover it.

## Documented functional decisions

| # | Question | Decision | Reasoning |
|---|---|---|---|
| 1 | Does the `Browser` suite get `RefreshDatabase`? | **Yes** — extend the existing `tests/Pest.php` call from `->in('Feature')` to `->in('Feature', 'Browser')`. | This is the bullet [playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md) explicitly marks "**still undecided** … don't assume it's inherited". Browser tests in this repo will use `actingAs()` and model factories (the doc's own "Laravel helpers work inside browser tests" section says to prefer them over driving the UI), so they need exactly the same per-test isolation `Feature` already has. One call, one trait, same shape as `Feature` — no second `pest()->extend(...)` block. |
| 2 | Which browsers are in scope? | **Chromium only** (Pest's default driver). | [playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md)'s *Known caveat* records that Firefox/WebKit are **unverified on this host** because system libraries are missing, and that fixing it needs `sudo npx playwright install --with-deps` — an OS-level change requiring separate approval, explicitly out of scope there. This story does not change that, does not assert cross-browser reliability, and does not add a cross-browser acceptance criterion. |
| 3 | Does this story wire browser tests into CI? | **Amended during Phase 3 (was originally "No").** OQ-1 confirmed the naive "no" would break CI, so the *minimum* fix — installing Chromium — is now in scope; the *broader* CI strategy question stays out. | Originally scoped "No — out of scope" on the reasoning that `.github/workflows/tests.yml` installed neither the browser binaries nor anything else Playwright needs, and that wiring it properly needed an undecided trigger-policy call (every push vs. schedule/label). Phase 3 then proved empirically (OQ-1) that leaving CI untouched isn't neutral — it turns the pipeline red on all three PHP matrix legs the moment `Browser` is declared, which is worse than "no coverage yet". The user chose option (a): add one `npx playwright install --with-deps chromium` step to `tests.yml`, matching decision 2's Chromium-only scope, and leaving decision 3's original larger questions (every-push vs. scheduled runs, cross-browser in CI) genuinely still open — see the amended [Open questions](#open-questions) OQ-1 for the exact change. [ci/pipeline-integration.md](../../../docs/testing/ci/pipeline-integration.md)'s coverage-gate proposal is unaffected. |
| 4 | Does the implementer update `docs/testing/frontend/playwright-setup.md`? | **No — that doc is Phase 6 (`docs-keeper`) work**, recorded here so it is not lost. | Per this project's docs ownership convention, `docs/` is `docs-keeper`'s at Phase 6, not the implementer's at Phase 3. What must be flipped once this lands: the four "still pending and must not be described as done" bullets (`tests/Browser/` does not exist / no `Browser` testsuite / `RefreshDatabase` undecided / `.gitignore`), the folder-structure code block's "NOT created yet" annotation, and the *CI integration* section — which must **stay** accurate, i.e. still say CI does not run browser tests (decision 3), while noting the new suite exists. Do **not** let a docs pass turn "suite wired" into "CI runs browser tests". |
| 5 | Which route does the canary visit? | **`/login`.** | It is unauthenticated (no `actingAs`, no session/password-confirmation setup), config-independent, already exists, and has real user-visible text and a `data-test="login-button"` hook per [playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md)'s selector-strategy section. Critically it does **not** depend on story 0006's not-yet-built Users UI, so this story stays independent of the story that depends on it — otherwise the two would deadlock. |
| 6 | What is the canary allowed to assert? | **Assertion-light: the page renders and throws no JavaScript errors.** | Its job is proving the wiring (browser launches, page loads, `RefreshDatabase` runs, the test is discovered), **not** covering `/login` behavior — that belongs to `tests/Feature/Auth/AuthenticationTest.php` and to whichever story owns sign-in browser coverage. A canary that grows real login assertions becomes a duplicate test with an infra story's name on it. |
| 7 | Where does the canary file live? | `tests/Browser/Auth/LoginSmokeTest.php`. | Mirrors the app structure inside the suite exactly as `tests/Feature/Auth/` already does, which is what [playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md) instructs ("Mirror the app structure inside it (e.g. `tests/Browser/Auth/`, `tests/Browser/Settings/`)"). Establishing the folder convention with the first file is cheaper than relocating later. |
| 8 | Are Pest groups (`smoke` / `regression`) adopted here? | **No.** | [playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md) records tagging as a *proposal, not yet in place*, with a standing TODO to decide it and record an ADR. Adopting a tag convention as a side effect of an infra story would enact an undecided team convention. Listed in [Technical tasks for later backlog](#technical-tasks-for-later-backlog) instead. |

## Gherkin

```gherkin
Feature: Browser test suite wired into the project's test runner

  Scenario: The browser canary is executed by a full test-suite run
    Given a backend developer on a machine with the Playwright browser binaries installed
    When the developer runs the full test suite
    Then the browser canary is reported by name among the executed tests

  Scenario: The browser suite can be run on its own
    Given a backend developer on a machine with the Playwright browser binaries installed
    When the developer runs only the browser suite
    Then the suite is found and reports at least one executed test

  Scenario: The canary reports a JavaScript error on the page it visits
    Given a backend developer who has deliberately introduced a JavaScript error on the sign-in page
    When the developer runs the browser canary
    Then the canary fails and names the JavaScript error

  Scenario: Each browser test starts from a clean database
    Given a backend developer with the browser suite wired up
    When the developer runs the full test suite twice in a row
    Then both runs report the same tests passing, with no state carried over between them

  Scenario: The browser and feature suites run together without interfering
    Given a backend developer with the browser suite wired up
    When the developer runs the browser and feature suites in a single invocation
    Then every test in both suites runs to completion with no database or connection conflict

  Scenario: Screenshots left behind by a failing browser test are not committed
    Given a backend developer whose browser test has just failed and written a screenshot
    When the developer inspects the repository's tracked and untracked files
    Then the screenshot is ignored and offered for neither staging nor commit
```

> Scenarios follow [gherkin-guidelines.md](../../../docs/testing/frontend/gherkin-guidelines.md) rules 1
> (a named actor — here **a backend developer**, since this story has no end-user actor; the same
> shape as the actor-less system phrasing used by infra story **0014**) and 3 (exactly one `When`
> per scenario). They are unavoidably more technical than a product scenario — the deliverable *is*
> test infrastructure — but each still names an observable outcome rather than a file diff.

## Files to create/modify

- `phpunit.xml` — **modify.** Add a third testsuite block after `Feature`, keeping the existing two
  untouched:

  ```xml
  <testsuite name="Browser">
      <directory>tests/Browser</directory>
  </testsuite>
  ```

  Nothing else in the file changes — in particular the `<php>` env block (which pins
  `DB_DATABASE=testing`, the isolation the [Destructive Database Command Rule](../../../docs/contracts.md)
  depends on) and the `<source>` coverage block stay exactly as they are.

- `tests/Pest.php` — **modify.** Extend the single existing binding, decision 1:

  ```php
  pest()->extend(TestCase::class)
      ->use(RefreshDatabase::class)
      ->in('Feature', 'Browser');
  ```

  One call, one trait — do not add a second `pest()->extend(...)` block for `Browser`.

- `.gitignore` — **modify.** Add `/tests/Browser/Screenshots` alongside the other build/artifact
  ignores (`/public/build`, `/storage/framework/views`, …), matching the file's existing
  leading-slash, repo-root-anchored style.

- `tests/Browser/Auth/LoginSmokeTest.php` — **new** (creates the `tests/Browser/` root and its first
  `Auth/` subfolder). One canary test, decisions 5–7: visit `/login`, assert its user-visible text
  renders, assert no JavaScript errors. Only the documented Pest browser API from
  [playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md) — `visit()`, `assertSee()`,
  `assertNoJavaScriptErrors()` — no invented methods. Named for the behavior, not `it('works')`.

- `.github/workflows/tests.yml` — **modify (added during Phase 3, per OQ-1's decision).** One new
  step, `Install Playwright Browser (Chromium)` (`npx playwright install --with-deps chromium`),
  inserted after `Install Node Dependencies` and before `Add Flux Credentials Loaded From ENV`, on
  all three PHP matrix legs. Not part of the original Phase 1 file list — see the amended decision 3
  and the OQ-1 resolution note in [Open questions](#open-questions) for why.

- `docs/testing/frontend/playwright-setup.md` — **NOT modified by the implementer.** Recorded here
  as a **Phase 6 (`docs-keeper`) follow-up** per decision 4; the exact edits it needs are listed in
  that decision's row. Phase 3 must leave this file alone.

### Technical approach

- **Suite declaration before test file.** Wiring `phpunit.xml` and `tests/Pest.php` first makes the
  canary's very first run the proof that discovery works — the TDD "red" here is genuinely
  informative only in that order (a canary added to an undeclared suite fails by never running,
  which looks identical to not existing).
- **`RefreshDatabase`, matching `Feature` exactly.** Pest's browser plugin dispatches requests
  through the same in-process Laravel kernel (`vendor/pestphp/pest-plugin-browser/src/Drivers/LaravelHttpServer.php`
  — `app()->make(HttpKernel::class)` then `$kernel->handle(...)` on the same request), not a
  separate process, so the test's open transaction is visible to the page under test exactly as it
  is for `Feature`. `RefreshDatabase` therefore behaves identically in both suites, which is why one
  shared `->in('Feature', 'Browser')` binding is correct — no second, incompatible strategy needed.
- **Chromium default driver, no browser configuration added.** Decision 2 — do not add a
  browser-matrix config, a `--browser` flag, or a Playwright config file. Fewer knobs now; the
  cross-browser question is backlog.
- **No paratest, no sharding.** Neither `brianium/paratest` nor Pest sharding is installed
  ([playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md), *Parallelization*). This
  story installs no dependency and adds no parallel runner — which is also why the
  same-invocation-interference test below is a real risk worth asserting rather than a formality.

## Tests to perform

- [x] Integration (discovery): the canary is executed by a plain `php artisan test`, confirmed by
      **its own name appearing in the run output** — not by a green summary, which a suite that ran
      zero tests also produces.
- [x] Integration (discovery, negative): `php artisan test --testsuite=Browser` runs the canary and
      only the canary.
- [x] Regression-proof (mutation of the wiring): with **only** the `phpunit.xml` / `tests/Pest.php`
      change reverted, `php artisan test --testsuite=Browser` must fail (suite not found / zero
      tests). This proves the canary is not passing vacuously through some other discovery path.
- [x] Integration (the canary itself): `visit('/login')` renders the page and
      `assertNoJavaScriptErrors()` passes.
- [x] Negative (the assertion is live): with a JavaScript error deliberately injected into the page
      during verification, the canary **fails**. Establishes that `assertNoJavaScriptErrors()` is
      actually wired to a real browser rather than present-but-inert. Revert the injection
      afterwards; this is a manual verification step, not a committed test.
- [x] Edge (database isolation): running the full suite twice back-to-back leaves the `Feature` and
      `Unit` counts and pass/fail status unchanged — proves the new `RefreshDatabase` wiring leaks no
      state across suites or runs.
- [x] Edge (cross-suite interference): running `Browser` and `Feature` in the same invocation
      produces no duplicate-table, connection, or lock errors.
- [x] Artifact hygiene: after a deliberately failing browser test writes a screenshot, `git status`
      shows it as **ignored** — verified by running the command, not by eyeballing `.gitignore`.
- [x] Full-suite gate: `php artisan test --compact` across all suites reports the pre-change total
      plus the canary, with zero failures ([Full Test Suite Gate Rule](../../../docs/contracts.md)).

## QA test cases

| # | Type | Case | Expected result | Why it earns its place |
|---|---|---|---|---|
| QA-1 | Happy | Run `php artisan test` after the `phpunit.xml` change | The canary's test name appears in the output | The whole point of the story; a green summary alone cannot distinguish "ran and passed" from "silently ran nothing" |
| QA-2 | Happy | Compare the total test count against the pre-change baseline | Total increases by exactly the number of browser tests added (one) | Catches the "wired but silently 0-item suite" mistake QA-1 could still miss if the name check is done loosely. **Re-measure the baseline at the start of Phase 3** — see [OQ-2](#open-questions) |
| QA-3 | Negative | Revert only the suite-wiring change, rerun `--testsuite=Browser` | Fails: suite not found / zero tests run | Proves the canary is genuinely discovered *by this story's change* and not by an incidental path |
| QA-4 | Negative | Inject a deliberate JavaScript error into the visited page, rerun the canary | The canary fails, naming the JS error | Proves `assertNoJavaScriptErrors()` is a live assertion against a real browser, not decoration. Mandatory per [test-quality-checklist.md](../../../docs/testing/frontend/test-quality-checklist.md)'s insistence on the check being in every browser test — a check that can't fail is worse than none |
| QA-5 | Edge | Run the full suite twice back-to-back | Identical results both runs; no residual rows | `RefreshDatabase` newly applies to a suite whose HTTP requests run outside the test process — the classic place isolation silently breaks |
| QA-6 | Edge | Run `Browser` and `Feature` in one invocation | Both complete; no duplicate-table / connection / lock errors | Real risk with no parallel runner installed; also the exact shape the [Full Test Suite Gate Rule](../../../docs/contracts.md)'s "suspicious mass-failure" clause warns about |
| QA-7 | Negative | Force a browser-test failure so a screenshot is written, then run `git status` | The screenshot is untracked **and ignored** | `.gitignore` correctness is only observable by running the tool; a path typo reads fine and ignores nothing |
| QA-8 | Gate | `php artisan test --compact` (all suites) | Baseline + 1 passing, 0 failing | The literal Definition of Done per [contracts.md](../../../docs/contracts.md) |

**QA scoping notes:**

- **Chromium only.** No acceptance criterion asserts Firefox or WebKit reliability — unverified on
  this host per decision 2. A cross-browser failure during Phase 3 is evidence for the backlog item,
  not a defect of this story.
- **Local, not CI.** "Gets discovered and executed" is scoped to a **local** `php artisan test` run.
  Since CI wiring is out of scope (decision 3), no acceptance criterion may be phrased as
  "CI runs the browser suite green".

## Expected outcome

`tests/Browser/` exists with one canary test in `Auth/`. `php artisan test` run locally discovers and
executes it alongside `Unit` and `Feature`, reporting it by name, with the previous total plus one
passing and nothing failing. `php artisan test --testsuite=Browser` runs the browser suite alone.
Each browser test starts from a freshly migrated `testing` database, exactly as `Feature` tests do.
A failing browser test's screenshot lands in a git-ignored path. From this point on, any story can
add a file under `tests/Browser/` and have it run — story **0006** in particular can write
`tests/Browser/UsersIndexTest.php` without further infrastructure work. Nothing about the running
application changes; no user-visible behavior is added, removed, or altered.

## Acceptance criteria

- [x] `phpunit.xml` declares a `Browser` testsuite pointing at `tests/Browser`, with the `Unit` and
      `Feature` suites and the `<php>` env block unchanged.
- [x] `tests/Pest.php` applies `RefreshDatabase` to `Browser` as well as `Feature`, through the single
      existing `pest()->extend(...)` call.
- [x] `.gitignore` ignores `/tests/Browser/Screenshots`, verified with a real `git status` after a
      screenshot is produced.
- [x] `tests/Browser/Auth/LoginSmokeTest.php` exists, visits `/login`, asserts user-visible content,
      and calls `assertNoJavaScriptErrors()`.
- [x] The canary is discovered and executed by a **local** `php artisan test` run, evidenced by its
      name in the output.
- [x] The canary passes on Chromium (the default driver). No claim is made about Firefox or WebKit.
- [x] The full suite (all three testsuites) reports the pre-change total plus one, with zero failures.
- [x] No application code (`app/`, `resources/`, `routes/`, `database/`, `config/`) is modified.
- [x] No `docs/` file is modified during Phase 3; the `playwright-setup.md` update is left to Phase 6.
- [x] No new Composer or npm dependency is added.

## Detailed acceptance criteria (Given/When/Then)

**AC-1 — the suite is discovered**
> **Given** a developer machine with the Playwright browser binaries installed,
> **When** the full test suite is run locally,
> **Then** the browser canary appears by name in the run output and the reported total equals the
> pre-change baseline plus one, with zero failures.

**AC-2 — the suite is independently runnable**
> **Given** the `Browser` testsuite declared in `phpunit.xml`,
> **When** only the browser suite is run,
> **Then** it is found and reports exactly the one canary test executed — never "no tests executed".

**AC-3 — the wiring is what makes it run**
> **Given** the suite-wiring change reverted and the canary file left in place,
> **When** the browser suite is run,
> **Then** the run fails to find the suite or reports zero tests, confirming discovery depends on
> this story's change.

**AC-4 — the JavaScript-error assertion is live**
> **Given** a deliberate JavaScript error on the page the canary visits,
> **When** the canary is run,
> **Then** it fails and names the JavaScript error (and passes again once the error is removed).

**AC-5 — database isolation holds**
> **Given** the browser suite wired to `RefreshDatabase`,
> **When** the full suite is run twice consecutively,
> **Then** both runs report identical results, with no `Unit` or `Feature` test changing outcome.

**AC-6 — suites coexist in one invocation**
> **Given** the browser and feature suites both declared,
> **When** both are run in a single invocation,
> **Then** every test completes with no duplicate-table, connection, or locking error.

**AC-7 — artifacts stay out of the repository**
> **Given** a browser test that has just failed and written a screenshot,
> **When** the repository's file status is inspected,
> **Then** the screenshot is ignored and is offered for neither staging nor commit.

## Dependencies, risks & open questions

### Dependencies

- **Depended on by story [0006]** (`ai-spec/tasks/0006-users-list-editor-ui.md`) — its decision 5 and
  *Dependencies & risks* section name this exact infra task, and its
  `tests/Browser/UsersIndexTest.php` cannot exist without it. 0006's component-level tests do not
  depend on this story; only its browser tests do.
- **Depends on nothing.** The tooling it needs is already installed (verified in
  [playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md) against `composer.json`,
  `composer.lock` and `package.json`). It touches no story's files, needs no schema, and its canary
  targets `/login`, which has existed since before story 0001 — so it can be implemented at any time,
  independent of 0004/0005 or anything else in flight.
- **Machine prerequisite, not a code dependency:** `npx playwright install` must have been run on
  whatever machine executes the suite (the binaries are a machine-local cache in
  `~/.cache/ms-playwright/`, never committed).

### Risks

- **CI will start attempting to run the canary without browser binaries.** The `Browser` testsuite
  becomes part of the plain `php artisan test` that `.github/workflows/tests.yml` runs across its
  PHP 8.3/8.4/8.5 matrix, and that runner installs no Playwright binaries. This is the single
  highest-impact risk in an otherwise inert story: if the plugin hard-fails rather than skipping, it
  turns a green pipeline red on three matrix legs. Tracked as **OQ-1** — it must be resolved during
  Phase 3, before Phase 5's "full test suite passes" review.
- **A vacuously green suite.** An empty or undiscovered suite reports success. Mitigated by QA-1,
  QA-2 and QA-3 together — no one of the three is sufficient alone.
- **Flakiness inherited from real-browser testing.** A canary that intermittently fails would poison
  every future run of the suite. Mitigated by decisions 5–7: unauthenticated, config-independent,
  assertion-light, Chromium-only. If it still proves flaky in Phase 3, that is a finding about the
  tooling on this host, not a reason to weaken the assertion to nothing.
- **Suite scope creep.** The canary is a temptation to grow into a real login test. Decision 6 is the
  guard; `code-reviewer` should reject added product assertions in Phase 5.
- **Docs drift in the opposite direction.** Phase 6 flipping four "pending" bullets could
  overshoot into "CI runs browser tests", which decision 3 makes false. Decision 4's row lists
  precisely which sentences move and which must stay.

### Open questions

- **OQ-1 — RESOLVED, hard-fail confirmed empirically (Phase 3).** `.github/workflows/tests.yml` runs
  `npm i` / `npm run build` but never `npx playwright install` — no step downloads browser binaries on
  the runner. `Pest\Browser\Playwright\Servers\PlaywrightNpmServer` has no skip/graceful-degradation
  path (grepped for `markTestSkipped`/`skip(` — no hits); a missing browser surfaces as a thrown
  exception. Verified directly by hiding the sail container's
  `node_modules/playwright-core/.local-browsers/` to simulate a binary-less runner and rerunning the
  canary: `FAILED … PlaywrightOutdatedException … Tests: 1 failed (0 assertions) … EXIT CODE: 2` — a
  real non-zero test failure, not "no tests found". This is exactly what CI's three PHP matrix legs
  would produce today. Binaries were restored and the canary reconfirmed green afterward.
  **Decision needed from the orchestrator/user before Phase 4** among the three options above —
  tracked as a blocking follow-up, see the note directly below this list.
- **OQ-2 — RESOLVED.** Re-measured immediately before the wiring change, on the same tree: **298
  passing, 668 assertions** — matches the Phase 1 indicative figure exactly. QA-2's delta check
  confirmed against this real baseline: post-wiring full suite is **299 passed, 671 assertions**, run
  twice back-to-back with byte-identical results (AC-5).
- **OQ-3 — RESOLVED.** `/tests/Browser/Screenshots` is correct. Confirmed two ways: (1) source —
  `Pest\Browser\Support\Screenshot::dir()` hardcodes `rootPath.'/tests/Browser/Screenshots'`; (2)
  empirically — both an explicit `->screenshot()` call and a genuine assertion failure (Pest
  auto-captures a screenshot on any failed browser assertion, not only on an explicit call — a fact
  worth knowing when writing 0006's browser tests later) landed a `.png` under that exact path, and
  `git status` / `git check-ignore -v` / `git add --dry-run` all confirmed it is ignored and never
  offered for staging. `.gitignore`'s `/tests/Browser/Screenshots` entry needs no correction.

> **OQ-1 decision: option (a), made by the user.** Added a `Install Playwright Browser (Chromium)`
> step (`npx playwright install --with-deps chromium`) to `.github/workflows/tests.yml`, right after
> `Install Node Dependencies` and before the Flux/Composer steps, on all three PHP matrix legs. This
> keeps decision 3 (no *other* CI scope change — trigger policy, cross-browser, coverage gating —
> stays out of scope) while making the pipeline honest about the suite it now runs. `--with-deps`
> installs the OS-level libraries the [Known caveat](../../../docs/testing/frontend/playwright-setup.md#known-caveat-missing-system-libraries-on-this-host)
> flags as missing on the local dev host — safe here because a GitHub-hosted runner is a fresh,
> disposable VM each run, not a persistent machine needing separate approval for a system change.
> **Not yet verified by an actual CI run** — that verification happens naturally the next time this
> branch's PR triggers the workflow; Phase 5 code review should confirm the run is green before
> closure.

## Technical tasks for later backlog

Deliberately **not** part of this story; each is a decision or a system change nobody has approved.

1. **~~Run browser tests in CI.~~ Done by this story (OQ-1, option a).** The narrow fix (install
   Chromium via `--with-deps`) is now in `.github/workflows/tests.yml`. What remains open: deciding
   the trigger policy for browser tests specifically if the suite grows (every push vs.
   schedule/label — currently they simply run every push/PR like everything else, since that's the
   pipeline's existing behavior and this story didn't change it), and whether to record any of this
   as an ADR if contested.
2. **Install the WebKit/Firefox system libraries** (`sudo npx playwright install --with-deps`) so
   cross-browser runs are verified on this host, then decide whether cross-browser coverage is worth
   its runtime. Requires OS-level approval.
3. **Decide the Pest group convention** (`smoke` / `regression` / `browser`) for selective runs, and
   record it as an ADR — this is the standing TODO already written into
   [playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md), not a new idea.
4. **Revisit parallelization** (`brianium/paratest` or Pest sharding) if and only if real suite
   runtime becomes painful once browser tests are numerous — gated on measured pain, per the same
   doc.
5. **Broaden the smoke test into a multi-page sweep** (`visit(['/', '/login', '/register'])
   ->assertNoJavaScriptErrors()->assertNoConsoleLogs()`) once there are more pages worth sweeping.
   A separate, product-facing coverage decision, not infrastructure.

## Definition of Done
- [x] Tests written and green — the canary plus the verification steps in *Tests to perform*, and
      the **full** suite (`php artisan test`, all three testsuites, unfiltered) at 100% passing per
      [contracts.md](../../../docs/contracts.md)'s Full Test Suite Gate Rule. Re-confirmed at Phase 5:
      299/299 passing, 671 assertions, run twice.
- [x] OQ-1 resolved empirically and its answer recorded in this file before Phase 5. Hard-fail
      confirmed; user chose option (a) (install Chromium in CI); implemented in
      `.github/workflows/tests.yml`. **Not yet verified by an actual CI run** — `tests.yml` only
      triggers on push/PR to `develop`/`main`/`master`/`workos`, and this story is being developed on
      `feature-entrega2-ARP`, so no run exists yet on this branch (Phase 5 finding F-2). Treat as
      **deferred to the first PR that lands on one of those branches**, not as fully closed.
- [x] OQ-2's measured baseline recorded in this file, and QA-2's delta checked against it. Baseline
      298/668, post-wiring 299/671, confirmed independently at both Phase 3 and Phase 5.
- [x] OQ-3's real screenshot path confirmed and `.gitignore` matching it. Confirmed against the
      plugin's own source (`Screenshot::dir()`) and empirically twice (Phase 3 and Phase 5).
- [x] Code reviewed (code-reviewer) — including that the canary has not grown product assertions
      (decision 6) and that no application code was touched. Phase 5 verdict: ✅ approved, with one
      non-blocking fix applied (the canary's second assertion was a substring of the first and could
      never independently fail — replaced with a genuinely independent visible string).
- [x] No security findings (appsec-auditor) — not expected to apply (test-runner configuration only,
      no application surface), but Phase 4 still ran per the standard workflow. Verdict: ✅ no
      blocking findings; one Low-severity hardening item applied directly (`npx --no` to stop `npx`
      silently installing an unpinned `playwright@latest` if the local package were ever missing).
- [ ] Documentation updated (docs-keeper) — `docs/testing/frontend/playwright-setup.md` per
      decision 4: flip the four pending bullets and the folder-structure annotation, **keep** the CI
      section saying CI does not run browser tests. **Phase 6 — not yet done.**
- [x] Acceptance criteria met.
