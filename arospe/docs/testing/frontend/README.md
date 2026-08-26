# Frontend / Browser Testing Guide

A reference for QA engineers writing browser-level tests for this Laravel 13 + Livewire 4 app. It covers how we go from a user story to a runnable browser test, what tooling we use (and don't), how to write good Gherkin scenarios, and how quality and coverage are judged at the browser level.

The general **judgment** of what to test and why is not repeated here — it lives in the shared, framework-agnostic testing docs and applies as-is to browser tests. This guide only adds the genuinely frontend/browser/Gherkin-specific deltas.

## Table of Contents

- [Tooling decision (read this first)](#tooling-decision-read-this-first)
- [Files in this guide](#files-in-this-guide)
- [Workflow: from user story to browser test](#workflow-from-user-story-to-browser-test)
- [The reusable reference prompt](#the-reusable-reference-prompt)
- [Related, not duplicated here](#related-not-duplicated-here)

## Tooling decision (read this first)

This project does **not** use a separate Playwright + `playwright-bdd` + Cucumber toolchain. There are no `.feature` runner files, no step-definition files, and no JavaScript test runner. Instead, browser tests are written with **Pest 4's built-in browser testing** (Playwright-driven under the hood), so they reuse the existing Pest suite, conventions, factories, and Laravel test helpers rather than introducing a parallel JS runner.

Consequence for QA: a Gherkin `.feature` scenario in this repo is a **specification artifact**, not something a BDD engine executes. A human (or an LLM, reviewed by a human) translates each scenario **by hand** into a Pest browser test in `tests/Browser/`, following the Given/When/Then → Pest `it()` mapping in [gherkin-guidelines.md](gherkin-guidelines.md#givenwhenthen--pest-it-translation-convention).

> Status: `pestphp/pest-plugin-browser` (`^4.3.1`) and `playwright` (`^1.61.1`) are **installed**, the browser binaries have been downloaded (`npx playwright install`), and since task 0006b the suite is **wired up**: `tests/Browser/` exists with a first test, `phpunit.xml` declares a `Browser` testsuite, `RefreshDatabase` applies to it, and CI runs it on **Chromium only**. Still open: cross-browser coverage, and whether a growing browser suite should keep running on every push. See [playwright-setup.md](playwright-setup.md) for the full status, the one-time browser-binary setup step, and a known missing-system-library caveat before you try to run any browser test. Since task 0018 that file also carries the repo's **waiting rules** — `->waitForEvent('networkidle')` is banned here and a bounded `->wait(n)` is the one accepted mitigation — which are the fastest way to lose an afternoon if you meet them by discovery instead of by reading.

## Files in this guide

- [playwright-setup.md](playwright-setup.md) — despite the filename, documents the **actual** setup: Pest 4 browser testing (Playwright internally). Install status, folder structure, real `visit()`/`assertSee()`/`click()`/`fill()` syntax, selector strategy, proposed tagging/parallelization, and CI status.
- [gherkin-guidelines.md](gherkin-guidelines.md) — the seven rules for writing scenarios (each with a ❌/✅ pair grounded in this app's real auth flows), the **domain glossary** for terms that exist today, and the Given/When/Then → Pest `it()` translation convention.
- [test-quality-checklist.md](test-quality-checklist.md) — the six-question checklist for deciding whether a browser test earns its place, plus browser-specific deltas (flakiness, `assertNoJavaScriptErrors()`, visual regression).
- [coverage-policy.md](coverage-policy.md) — why the backend 80% line-coverage floor does **not** transfer to browser/E2E tests, and the open `TODO` for a frontend-appropriate metric.
- [examples/](examples/) — real scenario/test pairs grounded in existing flows:
  - [login.feature](examples/login.feature) → [login-browser-test.php](examples/login-browser-test.php) (happy path + invalid credentials)
  - [two-factor-challenge.feature](examples/two-factor-challenge.feature) → [two-factor-challenge-browser-test.php](examples/two-factor-challenge-browser-test.php)
  - [passkey-deletion.feature](examples/passkey-deletion.feature) → [passkey-deletion-browser-test.php](examples/passkey-deletion-browser-test.php)

## Workflow: from user story to browser test

1. **Start from a real user story.** Do not invent preconditions. If the story is ambiguous, ask the product owner rather than filling the gap (per the [Uncertainty Handling Rule](../../contracts.md)).
2. **Generate Gherkin scenarios** from the story using the [reference prompt](#the-reusable-reference-prompt) below — happy path, empty case, invalid input, and combinations.
3. **Review the scenarios against [gherkin-guidelines.md](gherkin-guidelines.md)** — business language, single `When`, no technical detail, consistent glossary, no ghost scenarios.
4. **Save the scenario** as a `.feature` specification artifact (e.g. under `docs/testing/frontend/examples/` while patterns are being established, or alongside the feature it describes).
5. **Translate by hand into a Pest browser test** in `tests/Browser/`, mapping Given → arrange (`actingAs`, factories, `Notification::fake()`), When → the single user action, Then → `assertSee`/`assertNoJavaScriptErrors`/state assertions. See the [translation convention](gherkin-guidelines.md#givenwhenthen--pest-it-translation-convention).
6. **Judge the test** against [test-quality-checklist.md](test-quality-checklist.md) before committing it.

## The reusable reference prompt

Use this verbatim to generate BDD scenarios from a user story. Fill in the bracketed parts and keep the rules intact.

```
As a [role] of the [project name] project, I have this user story:
"As a [role], I want to [action] in order to [goal]."

Generate BDD scenarios in Gherkin format (Feature + Scenarios) covering:
(1) happy path
(2) empty case / no data
(3) invalid input/filter
(4) combination of conditions/filters

Rules:
- A single When per scenario.
- Domain language (not UI language): avoid "click", technical IDs, DB field names.
- Use Scenario Outline if cases share the same structure.
- Do not invent preconditions not mentioned in the user story.
- Use the project's domain glossary consistently.
```

The "project's domain glossary" referenced in the last rule is the one in [gherkin-guidelines.md](gherkin-guidelines.md#domain-glossary).

## Related, not duplicated here

These already cover the general reasoning and apply as-is to frontend/browser tests — link to them, don't restate them:

- [../philosophy.md](../philosophy.md) — coverage is not quality; the "revert the fix, does a test go red?" test.
- [../qa/risk-based-testing.md](../qa/risk-based-testing.md) — the "what can fail here?" checklist for designing cases.
- [../qa/what-not-to-test.md](../qa/what-not-to-test.md) — what's reasonable to skip.
- [../qa/coverage-review-checklist.md](../qa/coverage-review-checklist.md) — what a reviewer runs through before approving.
- [../ci/commands.md](../ci/commands.md) / [../ci/pipeline-integration.md](../ci/pipeline-integration.md) — the existing backend coverage commands and the proposed (not-yet-enforced) CI gate.
- [`.claude/skills/pest-testing/SKILL.md`](../../../.claude/skills/pest-testing/SKILL.md) — Pest 4 browser syntax reference (`visit()`, `click()`, `fill()`, smoke testing, `assertNoJavaScriptErrors()`).

_Last updated: 2026-08-26 — Task 0018 (Sales Regions & Taxes screen — UI): one clause added to the status line, pointing at [playwright-setup.md](playwright-setup.md#waiting-one-call-is-banned-in-this-repo-and-one-is-bounded)'s new waiting rules. Nothing else here changed — the tooling decision, the story→Gherkin→Pest workflow and the links out are all unaffected by a story that added a third browser-test file following them._

_Previously: 2026-08-16 — Task 0006b: updated the tooling-decision status line — the `tests/Browser/` suite and its CI wiring are no longer pending; CI runs it Chromium-only._

_Previously, 2026-07-19 — Updated the tooling-decision status line: pest-plugin-browser + playwright are now installed; tests/Browser suite and CI wiring remain pending._
