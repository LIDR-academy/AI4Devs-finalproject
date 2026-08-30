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

- [Frontend / browser testing guide](frontend/README.md) — tooling decision (Pest 4 browser testing, not a separate Playwright/BDD runner), the user-story → Gherkin → Pest workflow and reference prompt, setup status, Gherkin guidelines + domain glossary, browser-specific quality checklist, frontend coverage policy, and worked scenario/test examples. Since task 0018 [playwright-setup.md](frontend/playwright-setup.md#waiting-one-call-is-banned-in-this-repo-and-one-is-bounded) also owns this repo's **waiting rules** (`->waitForEvent('networkidle')` banned outright; a bounded `->wait(n)` with a stated reason as the one accepted mitigation) and the selector ⚠️ for an admin list screen whose row controls are icon-only. Since story 0020 it owns three more environment findings that decide what a browser test can even be written to do, all source-verified rather than inferred: **`->wait(n)` is not a polling primitive, and a longer one can fail *because* it is longer** (it is routed through a retry loop that only re-tries on a thrown expectation, and `Playwright::$timeout` is 5000 ms, so `->wait(5)` throws against its own budget); **a real file upload is unreachable through `visit()` in this environment**, both because `attach()` is refused for any file input over a non-collocated Playwright connection and because the plugin's own HTTP driver never parses a multipart body into `UploadedFile`s — so an upload's *completion* is Feature-test territory permanently, while everything up to the XHR starting is still coverable; and **a page mounting one component twice duplicates every `data-test` hook**, tripping Playwright strict mode on single-element assertions while `assertSee()` silently tolerates it. Read all of it before writing a browser test against `tests/Browser/`'s four files.

## CI — how to run and enforce it

- [Commands](ci/commands.md) — full suite, single file/test, coverage report, thresholds, parallel runs. Command table at the end.
- [Pipeline integration](ci/pipeline-integration.md) — a documented proposal for CI coverage enforcement (the real pipeline doesn't enforce coverage today — see that file for the current state). Since story 0019 it also records the first `setup-php` input added for **correctness** rather than tooling, `extensions: imagick`, and why `->skip(fn () => ! extension_loaded('imagick'))` was rejected in its place.

## Local environment — per-worktree isolated testing databases

- [Worktree databases](worktree-databases.md) — why `.env.testing` (gitignored, one per checkout) is required, why every `git worktree` needs its **own** testing database name (`testing1`, `testing2`, …) rather than sharing one, and the setup/cleanup steps for opening and removing a worktree. Read this before running `artisan migrate:fresh` (with or without `--env=testing`) from any worktree.

## Related, not duplicated here

- [`.claude/skills/pest-testing/SKILL.md`](../../.claude/skills/pest-testing/SKILL.md) — Pest 4 syntax reference (`test()`/`it()`/`expect()`, `make:test`, browser/smoke/architecture testing). This doc set assumes you know that or will look it up there; it focuses on judgment (what/why to test), not syntax (how to call `expect()`).
- [conventions/base-standards.md](../conventions/base-standards.md) — the quality-gate order (test → Pint → Larastan) every change goes through.
- [security/image-upload-processing.md](../security/image-upload-processing.md) — not a testing doc, but the one security page that is mostly **test-design** guidance: why asserting a generated file's *extension* proves nothing and its byte signature must be checked instead (`RIFF`…`WEBP`, the ISO-BMFF `avif` brand), why a read-only-directory fixture makes the **first** write fail and leaves a partial-write cleanup branch vacuously asserted, and why a fixture named `.jpg` can report `image/jpeg` from 2 KB of random bytes. Read it before writing a test against anything that decodes a user-supplied file.

_Last updated: 2026-08-29 — Story 0020 (Shared media gallery modal — frontend): one widened pointer, no structural change. The **Frontend / Browser** entry now names story 0020's three source-verified tooling findings, because each one changes what a QA author should even attempt: a bare `->wait(n)` gets none of an assertion's retry machinery **and** races the plugin's own 5000 ms ceiling, so widening one is a fix that makes things worse; a real file upload cannot be driven through `visit()` at all here (two independent causes, one of them a literal `[], // @TODO files...` in the plugin's HTTP driver), so upload-completion coverage belongs to Feature tests permanently and a browser test that needs it is honestly `->skip()`'d; and a page mounting one component twice duplicates every `data-test` hook, which fails selectively — strict-mode violations on single-element assertions, silent tolerance from `assertSee()`. **Verified as unchanged rather than assumed:** the four authorization layers (story 0020's Phase 4 F-1 is a new *rule* about layer three on a routeless component, not a fifth layer — see [security/livewire-authorization.md](../security/livewire-authorization.md#the-routeless-case-a-component-with-no-route-has-no-per-request-backstop-at-all)), the QA section, the backend section, the CI entry and the worktree-databases entry; the story adds ~40 tests across `tests/Feature/Media/`, `tests/Feature/Dev/` and the new `tests/Browser/Media/`, and changes no command, threshold or database strategy._

_Previously: 2026-08-27 — Story 0019 (Media Library upload and conversions — backend): two pointers, no structural change. The **CI** entry now names `extensions: imagick` and the rejected `->skip()` alternative, and **Related** gains [security/image-upload-processing.md](../security/image-upload-processing.md) — deliberately filed there rather than under a new Security heading, since this index has never carried one and inventing a section for a single page would be worse than a pointer. It earns the pointer because most of what it contains is test-design guidance a QA author would otherwise rediscover: assert a converted file's **byte signature**, never its extension; a read-only-directory fixture fails the *first* write and leaves a cleanup branch vacuously asserted; and a `.jpg`-named blob of random bytes reports as `image/jpeg`, so `mimes:` is not the rule that rejects it. **Verified as unchanged rather than assumed:** the four authorization layers (story 0019 adds a fourth **policy**, not a fourth layer — a policy is layer three), the QA section, the backend section and the worktree-databases entry; the story adds ~56 tests across new `tests/Feature/Media/`, `tests/Feature/Policies/` and `tests/Unit/Actions/Media/` files and changes no command, threshold or database strategy._

_Previously: 2026-08-26 — Task 0018 (Sales Regions & Taxes screen — UI): widened the Frontend/Browser entry to point at [playwright-setup.md](frontend/playwright-setup.md)'s two new sections (the waiting rules, and the icon-only-row-control selector ⚠️), since both are things a QA author hits by discovery otherwise. **Verified as unchanged rather than assumed:** the four authorization layers (this story adds none — every gate on the screen it builds belongs to task 0017's already-audited component), the QA and backend sections, and the CI section — the story adds eight browser tests and roughly twenty component tests to existing folders and changes no command, threshold or database strategy._

_Previously: 2026-07-19 — Added the Frontend / Browser testing section linking to docs/testing/frontend/._
