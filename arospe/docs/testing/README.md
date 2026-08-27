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

- [Frontend / browser testing guide](frontend/README.md) — tooling decision (Pest 4 browser testing, not a separate Playwright/BDD runner), the user-story → Gherkin → Pest workflow and reference prompt, setup status, Gherkin guidelines + domain glossary, browser-specific quality checklist, frontend coverage policy, and worked scenario/test examples. Since task 0018 [playwright-setup.md](frontend/playwright-setup.md#waiting-one-call-is-banned-in-this-repo-and-one-is-bounded) also owns this repo's **waiting rules** (`->waitForEvent('networkidle')` banned outright; a bounded `->wait(n)` with a stated reason as the one accepted mitigation) and the selector ⚠️ for an admin list screen whose row controls are icon-only — read both before writing a browser test against `tests/Browser/`'s three files.

## CI — how to run and enforce it

- [Commands](ci/commands.md) — full suite, single file/test, coverage report, thresholds, parallel runs. Command table at the end.
- [Pipeline integration](ci/pipeline-integration.md) — a documented proposal for CI coverage enforcement (the real pipeline doesn't enforce coverage today — see that file for the current state). Since story 0019 it also records the first `setup-php` input added for **correctness** rather than tooling, `extensions: imagick`, and why `->skip(fn () => ! extension_loaded('imagick'))` was rejected in its place.

## Local environment — per-worktree isolated testing databases

- [Worktree databases](worktree-databases.md) — why `.env.testing` (gitignored, one per checkout) is required, why every `git worktree` needs its **own** testing database name (`testing1`, `testing2`, …) rather than sharing one, and the setup/cleanup steps for opening and removing a worktree. Read this before running `artisan migrate:fresh` (with or without `--env=testing`) from any worktree.

## Related, not duplicated here

- [`.claude/skills/pest-testing/SKILL.md`](../../.claude/skills/pest-testing/SKILL.md) — Pest 4 syntax reference (`test()`/`it()`/`expect()`, `make:test`, browser/smoke/architecture testing). This doc set assumes you know that or will look it up there; it focuses on judgment (what/why to test), not syntax (how to call `expect()`).
- [conventions/base-standards.md](../conventions/base-standards.md) — the quality-gate order (test → Pint → Larastan) every change goes through.
- [security/image-upload-processing.md](../security/image-upload-processing.md) — not a testing doc, but the one security page that is mostly **test-design** guidance: why asserting a generated file's *extension* proves nothing and its byte signature must be checked instead (`RIFF`…`WEBP`, the ISO-BMFF `avif` brand), why a read-only-directory fixture makes the **first** write fail and leaves a partial-write cleanup branch vacuously asserted, and why a fixture named `.jpg` can report `image/jpeg` from 2 KB of random bytes. Read it before writing a test against anything that decodes a user-supplied file.

_Last updated: 2026-08-27 — Story 0019 (Media Library upload and conversions — backend): two pointers, no structural change. The **CI** entry now names `extensions: imagick` and the rejected `->skip()` alternative, and **Related** gains [security/image-upload-processing.md](../security/image-upload-processing.md) — deliberately filed there rather than under a new Security heading, since this index has never carried one and inventing a section for a single page would be worse than a pointer. It earns the pointer because most of what it contains is test-design guidance a QA author would otherwise rediscover: assert a converted file's **byte signature**, never its extension; a read-only-directory fixture fails the *first* write and leaves a cleanup branch vacuously asserted; and a `.jpg`-named blob of random bytes reports as `image/jpeg`, so `mimes:` is not the rule that rejects it. **Verified as unchanged rather than assumed:** the four authorization layers (story 0019 adds a fourth **policy**, not a fourth layer — a policy is layer three), the QA section, the backend section and the worktree-databases entry; the story adds ~56 tests across new `tests/Feature/Media/`, `tests/Feature/Policies/` and `tests/Unit/Actions/Media/` files and changes no command, threshold or database strategy._

_Previously: 2026-08-26 — Task 0018 (Sales Regions & Taxes screen — UI): widened the Frontend/Browser entry to point at [playwright-setup.md](frontend/playwright-setup.md)'s two new sections (the waiting rules, and the icon-only-row-control selector ⚠️), since both are things a QA author hits by discovery otherwise. **Verified as unchanged rather than assumed:** the four authorization layers (this story adds none — every gate on the screen it builds belongs to task 0017's already-audited component), the QA and backend sections, and the CI section — the story adds eight browser tests and roughly twenty component tests to existing folders and changes no command, threshold or database strategy._

_Previously: 2026-07-19 — Added the Frontend / Browser testing section linking to docs/testing/frontend/._
