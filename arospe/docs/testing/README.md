# Testing

How this team writes, reviews, and runs tests in this Laravel 13 + Livewire 4 app. The short version: **coverage is not synonymous with quality**. A test earns its place by verifying real behavior — inputs, outputs, side effects, state changes — not by executing lines of code. See [philosophy.md](philosophy.md) for the full argument and the anti-patterns to avoid.

This set is split into small files on purpose, so you only load what your current task needs:

## QA — how to think about what to test

Framework-agnostic, applies to any new feature before a single line of test code is written.

- [Risk-based testing](qa/risk-based-testing.md) — the question checklist ("what can fail here?") for designing test cases.
- [Coverage review checklist](qa/coverage-review-checklist.md) — what a reviewer runs through before approving a PR's tests.
- [What not to test](qa/what-not-to-test.md) — what's reasonable to skip, and why.

## Backend — how to write it in Pest 4

- [Backend index](backend/README.md) — which file to open depending on what you're about to write.

## Frontend / Browser — how to write it in Pest 4

For QA engineers writing browser-level tests, and for turning user stories into Gherkin scenarios and then into Pest browser tests.

- [Frontend / browser testing guide](frontend/README.md) — tooling decision (Pest 4 browser testing, not a separate Playwright/BDD runner), the user-story → Gherkin → Pest workflow and reference prompt, setup status, Gherkin guidelines + domain glossary, browser-specific quality checklist, frontend coverage policy, and worked scenario/test examples.

## CI — how to run and enforce it

- [Commands](ci/commands.md) — full suite, single file/test, coverage report, thresholds, parallel runs. Command table at the end.
- [Pipeline integration](ci/pipeline-integration.md) — a documented proposal for CI coverage enforcement (the real pipeline doesn't enforce coverage today — see that file for the current state).

## Local environment — per-worktree isolated testing databases

- [Worktree databases](worktree-databases.md) — why `.env.testing` (gitignored, one per checkout) is required, why every `git worktree` needs its **own** testing database name (`testing1`, `testing2`, …) rather than sharing one, and the setup/cleanup steps for opening and removing a worktree. Read this before running `artisan migrate:fresh` (with or without `--env=testing`) from any worktree.

## Related, not duplicated here

- [`.claude/skills/pest-testing/SKILL.md`](../../.claude/skills/pest-testing/SKILL.md) — Pest 4 syntax reference (`test()`/`it()`/`expect()`, `make:test`, browser/smoke/architecture testing). This doc set assumes you know that or will look it up there; it focuses on judgment (what/why to test), not syntax (how to call `expect()`).
- [conventions/base-standards.md](../conventions/base-standards.md) — the quality-gate order (test → Pint → Larastan) every change goes through.

_Last updated: 2026-07-19 — Added the Frontend / Browser testing section linking to docs/testing/frontend/._
