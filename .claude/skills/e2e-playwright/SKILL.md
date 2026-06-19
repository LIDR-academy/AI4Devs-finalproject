---
name: e2e-playwright
description: Build and run the RunMarket Playwright E2E suite (e2e/ at repo root) against the fully integrated system — frontend + backend + Postgres in Docker. Used for US-014 and any future task whose Verificacion names Playwright.
---

# E2E with Playwright

Playwright E2E tests exercise the **whole system** end to end, not a single layer.
Unlike `backend-feature`/`frontend-feature`, this skill drives a real browser against
the frontend and backend running together — there is no mocked repository, no mocked
`fetch`, no React Testing Library DOM. This is the highest, slowest, most
expensive rung of the test pyramid (`tdd-implementation/SKILL.md`); use it only for
the three journeys named in US-014, not for behaviour already covered by
unit/integration tests.

**Read first:** `docs/ARCHITECTURE.md` §5 (file tree — `e2e/` sits at repo root,
sibling to `frontend/` and `backend/`) and the US-014 acceptance criteria in
`docs/USER-STORIES.md`.

---

## Preconditions (do not start servers from a test)

The suite assumes the system is already up:

```
docker compose up -d        # PostgreSQL
# backend on :4000, frontend on :3000 (already implemented by US-001..US-013)
```

Tests verify behaviour; they never provision infrastructure, seed the database
directly, or reach into Prisma. The system is a black box reached only through the
browser — same boundary a real user has.

---

## Project setup (`e2e/` at repo root)

```
e2e/
├── tests/
│   ├── catalog.spec.ts     ← search + filter journey
│   ├── product.spec.ts     ← catalog → product detail
│   └── purchase.spec.ts    ← cart → checkout → confirmation
└── playwright.config.ts
```

- `playwright.config.ts`: single Chromium project for the MVP (see
  `docs/ARCHITECTURE.md` decisions table), `baseURL` read from an env var
  (`E2E_BASE_URL`, default `http://localhost:3000`), a reasonable global timeout,
  `retries: 1` only in CI (`process.env.CI`) — never retries as a substitute for a
  deterministic test.
- Add the `npx playwright test` command to the testing section of `readme.md` (US-014
  AC) and an npm script (`"test:e2e": "playwright test"`) in `e2e/package.json`.

---

## Writing a spec

1. **Journey, not implementation** — assert what a runner sees and does (page
   content, navigation, form fills, confirmation screen), never internal state or
   network calls.
2. **Selectors** — same priority order as RTL: accessible role/label/text first
   (`getByRole`, `getByLabel`, `getByText`). Fall back to `data-testid` only where no
   accessible query exists (e.g. a specific product card in a grid).
3. **Waiting** — use Playwright's auto-retrying assertions (`expect(locator).toBeVisible()`,
   `toHaveURL()`) instead of manual `waitForTimeout`/`sleep`. A spec with a hardcoded
   sleep is a flake waiting to happen.
4. **Test data** — rely on `backend/prisma/seed.ts` data already present in the
   Docker database; assert on product attributes/names that are stable in the seed,
   not on assumed IDs.
5. **Independence** — each spec must pass standalone and in any order. Don't depend
   on state left over by a previous spec (e.g. `purchase.spec.ts` adds its own item to
   the cart rather than assuming one is already there).

---

## TDD note (deviation, document it)

Classic red→green doesn't apply the same way here: by the time US-014 runs, the
behaviour under test (US-001..US-013) is already implemented, so there is no
production code to drive. "Red" here means: run the new spec against the live system
and confirm it fails for the right reason (selector/assertion not yet matching
reality) before adjusting the spec — not before writing application code. If a spec
exposes a real regression, fix it with the normal TDD cycle in the affected
layer/component, then re-run the spec green. Record this deviation in the backlog
task block per `tdd-implementation/SKILL.md`'s rule on undoable TDD.

---

## Definition of done

- `catalog.spec.ts`, `product.spec.ts`, `purchase.spec.ts` all green headless
  (`npx playwright test`), pasted output.
- `playwright.config.ts` has a configurable `baseURL`, a single Chromium project, and
  CI-only retries.
- `npx playwright test` documented in `readme.md`.
- No spec talks to Prisma/the database directly; no `waitForTimeout` used to mask
  flakiness.
- Backlog task marked `- [x] Implementado`.
