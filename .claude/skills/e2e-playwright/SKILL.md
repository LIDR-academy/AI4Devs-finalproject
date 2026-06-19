---
name: e2e-playwright
description: Build and run Playwright E2E suites against the fully integrated RunMarket system — frontend + backend + Postgres. Use for any backlog task whose Verificacion names Playwright, deriving journeys, structure and ports from the task and the current repo rather than from a fixed list.
---

# E2E with Playwright

Playwright E2E tests exercise the **whole system** end to end, not a single layer.
Unlike `backend-feature`/`frontend-feature`, this skill drives a real browser against
the frontend and backend running together — there is no mocked repository, no mocked
`fetch`, no React Testing Library DOM. This is the highest, slowest, most expensive
rung of the test pyramid (`tdd-implementation/SKILL.md`); use it only for journeys the
task's acceptance criteria actually name, never for behaviour already covered by
unit/integration tests.

**Before writing anything:** read the task's acceptance criteria (the backlog entry
that named Playwright in `Verificacion`) to get the exact journeys in scope — don't
assume which ones they are. Then inspect the repo itself (`docker-compose.yml`, each
app's `package.json`/dev scripts, `docs/ARCHITECTURE.md` if present) to learn the real
ports, start commands and where `e2e/` should live. Treat anything below as defaults to
verify against the live repo, not as ground truth — the repo wins if they disagree.

---

## Preconditions (do not start servers from a test, do not reach into the data layer)

The suite assumes the system is already up — typically `docker compose up -d` for
Postgres plus the frontend/backend dev servers, but confirm the actual commands and
ports from the repo (`docker-compose.yml`, `package.json` scripts) instead of
hardcoding them here.

Tests verify behaviour through the browser only — the same boundary a real user has.
This is the **black-box rule**: never provision infrastructure, seed the database
directly, reach into Prisma/an ORM, or otherwise manipulate state through a side
channel. Don't use `cy`/`page.route()`-style interception to mock responses either; if
you need to observe a network call, do it to assert on real behaviour, never to fake
it.

This boundary has a direct consequence for what an E2E spec can and can't cover — see
"Error paths" below.

---

## Project setup

Locate (or create) the E2E project as a sibling of the frontend/backend apps — check
`docs/ARCHITECTURE.md` and the existing repo layout for where that is; don't assume a
fixed path. Inside it:

- A Playwright config with a configurable `baseURL` (env var, e.g. `E2E_BASE_URL`), a
  single browser project by default — add more only when a task names a specific
  cross-browser bug or requirement, since each extra project multiplies run time and
  flake surface for no coverage gain on a single-target MVP — and `retries` only
  under CI (`process.env.CI`) — never as a substitute for a deterministic test.
- Failure artifacts turned on so a CI failure is diagnosable without re-running by
  hand: `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`,
  `video: 'retain-on-failure'` (or equivalent). A flaky-looking failure with no trace
  is not debugged, it's guessed at.
- One spec file per journey **named in the task's acceptance criteria** — don't invent
  extra scenarios, and don't carry over a spec list from a previous task once the
  scope changes.
- An npm script to run the suite (e.g. `test:e2e`) and a line in the project's testing
  docs pointing at it, so the command is discoverable without reading this skill.

---

## Shared state and isolation

This suite runs against one real Postgres and one real session layer, not a fixture
reset per test — treat that as a constraint to design around, not an inconvenience to
patch over:

- **Specs that mutate state** (create an order, fill a cart, etc.) generate their own
  unique data per run (e.g. a timestamped/random email), so two runs — or two specs —
  never collide on the same row.
- **Never assert on absolute counts or "the only X"** — other specs, or previous runs,
  may have left data behind. Assert "the cart contains the product I just added", not
  "the cart has exactly 1 item".
- **Each spec starts from a clean browser context** — don't share a context/session
  across specs or across tests in the same file for convenience; Playwright gives each
  test a fresh one by default.
- **Data created during a run is not cleaned up.** That's accepted debt for this MVP,
  not a problem for the test to solve — don't reach into the database to tidy up
  (that would break the black-box rule above), and don't write assertions that would
  break once data accumulates (see the counts rule).
- If a journey genuinely cannot tolerate parallel execution against shared state (e.g.
  it depends on an exact stock count), mark it to run serially
  (`test.describe.configure({ mode: 'serial' })` or a dedicated project) instead of
  hoping workers don't collide — and say why in a comment.

---

## Writing a spec

1. **Journey, not implementation** — assert what a user sees and does (page content,
   navigation, form fills, confirmation screen), never internal state or network
   calls.
2. **Scope discipline** — implement exactly the scenarios defined in the acceptance
   criteria/Gherkin for the task. Don't add scenarios that weren't specified, even if
   they seem like reasonable coverage.
3. **Selectors, in priority order:**
   - Accessible role/label/text first (`getByRole`, `getByLabel`, `getByText`) — same
     priority as RTL, and Playwright's locators make these reliable.
   - `data-testid` only where no accessible query exists (e.g. picking one card out of
     a grid of identical products).
   - If neither exists on the page yet, that's a gap in the component, not in the
     test: add a `data-testid` to the source rather than falling back to a brittle CSS
     selector.
4. **Waiting** — use Playwright's auto-retrying assertions (`expect(locator).toBeVisible()`,
   `toHaveURL()`, etc.) instead of manual `waitForTimeout`/sleep. A spec with a
   hardcoded sleep is a flake waiting to happen.
5. **Test data** — rely on data already present in the running system (e.g. a seed
   script); assert on attributes/names that are stable in that data, not on assumed
   IDs. Find the actual seed source in the repo rather than assuming its contents.
6. **Explicit assertions** — assert on the specific outcome the criteria describe, not
   just "something rendered" (e.g. the confirmation screen shows the order total, not
   just that a confirmation screen exists).
7. **Error paths — only those a real user action can trigger through the UI.** If the
   acceptance criteria name a failure scenario, cover it for real, not with a mock —
   but only when it's reachable without a side channel:
   - **Out-of-stock**: only testable by reaching a real low/zero-stock state through
     the UI — never by draining a shared product's stock as a side effect (that
     mutates state another spec may depend on, violating "Shared state" above) and
     never by writing to the database at test runtime (that's the side channel
     "Preconditions" forbids). If no seed product already sits at low/zero stock,
     that's a missing fixture, not an uncoverable scenario: a one-line addition to the
     seed script (a normal, reviewed code change, committed ahead of the test run — not
     a runtime side channel) is the right fix. Add it yourself if it's small and
     self-contained; if it's larger or crosses into work this task doesn't own, raise
     it as a separate follow-up task instead of silently dropping the AC.
   - **5xx / infra-level failures**: if the only way to produce one is stopping a
     container, corrupting data, or another side channel, it's out of scope for E2E —
     it belongs at the integration level (`tdd-implementation/SKILL.md`), where it can
     be triggered with a mock. Don't break the black-box rule to chase E2E coverage of
     something the UI alone can't provoke.

---

## Confirm the spec actually tests something

Before trusting a spec, run it once and check it fails for the right reason — a
selector that doesn't exist, an assertion that doesn't match real content — not
because of an environment problem. A spec that's green on its very first run, with no
prior failure observed, hasn't been shown to detect anything; it may be asserting on
something trivially true.

Failures caused by timing or by the shared-state issues above are not "the right
reason" — they're bugs in the spec's isolation. Never resolve a flaky-looking failure
by adding a sleep, raising retries, or loosening the assertion; fix the isolation
problem instead. If the spec does expose a real regression in the app, fix it in the
affected layer/component, then re-run the spec green.

---

## Definition of done

- Every journey named in the task's acceptance criteria has a green spec, run headless,
  output pasted.
- Config has a configurable `baseURL`, CI-only retries, and failure artifacts
  (trace/screenshot/video) enabled.
- The run command is documented where the project's other test commands live.
- No spec talks to the database/ORM directly; no `waitForTimeout` used to mask
  flakiness; no scenario added beyond what the task specified.
- Mutating specs use unique per-run data, don't assert on absolute counts, and don't
  share a browser context with another spec.
- Each spec was seen failing for the right reason before being trusted green; no
  flaky-looking failure was resolved by loosening an assertion or adding retries/sleeps
  instead of fixing isolation.
- Error paths named in the acceptance criteria are covered where reachable through the
  UI alone — adding a missing seed fixture if that's a small, in-scope change. Anything
  still uncovered (needs a side channel, or a fixture that's out of scope here) is named
  as a follow-up rather than silently skipped or faked.
- Backlog task marked `- [x] Implementado`.
