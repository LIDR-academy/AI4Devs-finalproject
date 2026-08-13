---
name: tdd-implementation
description: Red-green-refactor TDD discipline for RunMarket. Decides unit vs integration vs E2E, enforces test-quality criteria, and requires a failing test before production code. Referenced by backend-developer, frontend-developer, and implement-task.
---

# TDD Implementation

Test-Driven Development is **obligatory** for every implementation task (phases 2, 3
and security remediations). This skill defines the cycle, the test pyramid, and the
quality bar.

---

## The cycle (per task)

1. **Red** — write the smallest test that fails for the right reason. Run it; confirm
   it fails because the behaviour is missing, not because of a typo/setup error.
2. **Green** — write the minimum production code to make the test pass. No extra
   features, no speculative generality.
3. **Refactor** — improve names/structure with the suite **green**. Re-run after each
   refactor.

Never write production code without a failing test pointing at it. If a test cannot be
written first for a given case, record the reason in the task block of the backlog.

---

## Which level of test?

| Level | When | Tooling (RunMarket) |
|---|---|---|
| **Unit** | Pure business logic; a service with **mocked repository**; a pure UI helper/hook | Jest (backend), Vitest (frontend) |
| **Integration** | Endpoint behaviour through the HTTP layer; controller→service→repository wiring; a component with its real children + mocked fetch | Supertest + Jest (backend), RTL (frontend) |
| **E2E** | A user journey across pages (catalog → product → cart → checkout) | Playwright |

Rules of thumb:

- Services are unit-tested with **mocked repositories — never a real database**
  (CLAUDE.md). Repository logic that needs the DB is covered by integration tests.
- Prefer the lowest level that can express the behaviour. Push only genuine journeys
  to E2E (they are slow and brittle).
- Each backlog task names its test in the `Verificacion` column — honour that level.

---

## Test-quality criteria (inline checklist)

- [ ] One reason to fail — the test asserts a single behaviour.
- [ ] Arrange-Act-Assert is visible; no hidden assertions in setup.
- [ ] Test name states the behaviour, not the method (`returns 404 when product is unknown`).
- [ ] No assertion on incidental details (timestamps, ordering you don't control).
- [ ] Deterministic — no real time, no real network, no random without a seed.
- [ ] Failure message is informative (assert on values, not just truthiness).
- [ ] Edge cases covered: empty, invalid input, error path — not only the happy path.
- [ ] Mocks are at architectural boundaries (repository, fetch), not internal details.
- [ ] The test would fail if the feature regressed (mutate the code mentally to check).

---

## Output of a TDD task

When you finish a task, report:

```markdown
### TDD — <task-id>
Tests added:
- <test name> (<unit|integration|e2e>) — <assertion>

Execution:
<command> → <PASS/FAIL counts>
```

Paste the real runner output. A task is not done until its named test is green and
the full suite still passes.
