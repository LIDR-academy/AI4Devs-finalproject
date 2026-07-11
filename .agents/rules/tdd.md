# TDD — Three Laws & Red→Green→Refactor (TypeScript)

The `implementator` obeys these. Every line of production code exists because a failing test demanded it first.

## The Three Laws (non-negotiable)

1. **No production code** except to make a failing test pass.
2. **No more of a test** than is sufficient to fail — and *not compiling / not importing counts as failing*.
3. **No more production code** than is sufficient to pass the one failing test.

## The cycle (small, repeated)

```
RED      → write ONE test that fails (derives from the next @s in gherkin-scenarios.md)
GREEN    → the minimum implementation that makes it pass
REFACTOR → with the bar green, remove duplication, improve names, shorten functions
```

- One `@s` scenario at a time. Do not pre-write tests for future scenarios.
- A test that passes on the first run proves nothing — tighten it or be suspicious.
- Refactor **only on green**. If tests are red, you fix, you don't refactor.
- Re-run tests after every change.

## What "a test" means here (by artifact type)

- **UI component** → `<name>.test.tsx` (Jest + `@testing-library/react-native`), driven first. Assert rendering per prop, each of the 4 UI states (Loading/Content/Error/Empty) where applicable, conditional branches, handler/callback wiring, and accessibility roles/labels. **Required for every component** — this is what makes UI both TDD- and mutation-testable. Then the component, then the Storybook story, then a Playwright e2e via the `storybook-e2e-tests` skill (which owns the `.e2e.js` conventions and location — `libs/<lib>/tests/e2e/…` mirroring `src/`, **not** co-located).
- **Logic (hook/service/DAO)** → `use-*.test.ts`, `*.service.test.ts`, `*.dao.test.ts` (Jest; mock `getSupabase()`/`fetch` or the layer below). Then implement following `Component→Hook→Service→DAO` (`.agents/rules/hooks-service-dao.mdc`).
- **Always** → one **integration test** across the vertical slice (e.g. hook→service→DAO with a mocked Supabase client, or a Playwright flow across composed components).

## Vertical slices (build order)

The feature ships as thin end-to-end slices; each slice is its own set of Red→Green→Refactor cycles, its own commit, and its own gate. Do not start slice N+1 until slice N's gate passes.

| Slice | Scope | Commit |
|---|---|---|
| 1 | Happy path + Loading | `feat(<name>): implement happy path` |
| 2 | Empty + Error + Retry | `feat(<name>): add error handling and empty state` |
| 3 | Analytics + Feature flag + a11y + i18n | `feat(<name>): add analytics, a11y, and i18n` |

Logic-only features slice by risk (happy path → error/edge → observability) even without the 4 UI states.

## Traceability

Every `@s` scenario must end up covered by at least one concrete test. Keep the `@s → test` map and one block per cycle/slice in `docs/features/<name>/tdd.md`.

### Keep `tdd.md` terse — it is a **log, not a transcript**
`tdd.md` is the single largest artifact if you let it be. Write:
- a compact **`@s → test` table** (scenario tag → test name → file), and
- **one line per Red→Green→Refactor cycle** (`@s`, the test added, the one-line change) — a short block per slice.

Do **NOT** paste test bodies, production code, diffs, or command output into `tdd.md` — that content already lives in the repo and the git history. Prose summaries only.

## Conventions

Functional React only; always a `Props` type; kebab-case filenames; reuse existing tokens/components; no hardcoded strings/colors/dimensions; short functions; revealing names; no magic numbers. Conventional Commits per `.agents/commands/commit.md`.
