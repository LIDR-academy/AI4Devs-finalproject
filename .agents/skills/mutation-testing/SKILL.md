---
name: mutation-testing
description: Run mutation testing with StrykerJS on a feature's CHANGED source files in this monorepo (`@helsoft/services`, `@helsoft/hooks`, `@helsoft/components`) and prove the tests bite. Use when the orchestrator's mutation phase runs, after a suite is green, or on "run mutation", "stryker", "mutation score", "are my tests any good". Scopes to changed files only (never whole-repo). Do NOT use to write or fix tests — a surviving mutant is handed back to the TDD implementator.
---

# Mutation testing — proving the tests bite (StrykerJS)

> A green suite says "the code doesn't explode on these inputs." It does **not** say "the tests would fail if the code were wrong." Mutation testing measures the second thing.

**When it runs:** twice per feature, bracketing the full review — **before** it (harden the test net so reviewers look at code whose tests already bite) and **after** it (the review's fixes may have changed code). The threshold must be met and every survivor killed on **both** passes.

## How it works

StrykerJS introduces small defects (*mutants*) into the source and re-runs the Jest suite:

- Some test **fails** → mutant **killed** (good — the net caught it).
- All tests **pass** → mutant **survived** (bad — a hole: a missing assert or case).

**Mutation score = killed / total.** Higher = tests bite harder.

## Run it (scoped to the feature's changed files)

Always mutate **only the files the feature changed** — never the whole repo. The helper script computes the changed source per lib (vs a base ref) and runs Stryker for each affected lib:

```bash
.agents/skills/mutation-testing/scripts/run-mutation.sh            # base ref: main
.agents/skills/mutation-testing/scripts/run-mutation.sh origin/main
```

Or run a single lib by hand:

```bash
pnpm --filter @helsoft/services   exec stryker run --mutate "src/services/foo.service.ts,src/dao/foo.dao.ts"
pnpm --filter @helsoft/hooks      exec stryker run --mutate "src/hooks/use-foo.ts"
pnpm --filter @helsoft/components exec stryker run --mutate "src/atoms/foo/foo.tsx"
```

Per-lib config lives in `libs/<lib>/stryker.config.mjs` (Jest runner; `coverageAnalysis: 'perTest'`; `thresholds.break = 100`).

## Tooling notes

- `@helsoft/services`, `@helsoft/hooks` — ts-jest; `checkers: ['typescript']`.
- `@helsoft/components` — jest-expo/babel; no typescript checker. UI components are mutated via their `<name>.test.tsx` unit tests.

## Scope & threshold (feature policy)

- **Mutate only the feature's changed files** (changed `.ts` for logic, changed `.tsx` for components). No global runs.
- **Threshold: 100% of mutants killed on the new/changed lines** (`thresholds.break = 100`). Legacy untouched code is measured, not blocked.
- `coverageAnalysis: 'perTest'` keeps runs affordable (Stryker re-runs the suite per mutant — compute-bound, the slowest gate; that cost is the point).
- **Equivalent mutants** (no observable behavior change) may be excluded **only** with a written justification in `docs/features/<name>/mutation.md`.

## What is / isn't mutated

- **In scope (Jest-testable):** services, hooks, DAOs, and component logic/behavior (`.tsx`).
- **Out of scope:** Playwright `.e2e.js` visual tests (Stryker's Jest runner can't run them) and `*.stories.tsx`. Playwright (see the `storybook-e2e-tests` skill) guards rendered/visual behavior; Jest is what mutation bites.

## Reporting

Write `docs/features/<name>/mutation.md`: per-lib `total / killed / survived / score`, and each **surviving mutant** as `file:line` + the mutation applied. A survivor is not fixed here — it's handed to `implementator`, who writes the red test that kills it.
