# Code Constitution — Common Rules

> This file defines the rules that apply to **every** project, regardless of language.
> Language-specific rules live in `CONSTITUTION.go.md` and `CONSTITUTION.ts.md`, which
> extend (never override) this file.

## 1. Philosophy: Boring Code Wins

- Write **boring, obvious code**. If a reviewer pauses to figure out how something works, it's too clever.
- Code is written once and read many times. **Optimize for the human reader**, not the writer.
- A **mid-level developer must be able to navigate the project** without a guide. Quality must be **senior level**: correct, tested, consistent — but never "impressive."
- Prefer duplication over the wrong abstraction. Extract shared code only when the pattern has appeared **at least twice** and is stable.

## 2. Simplicity Rules

- **No over-engineering.** No speculative abstractions, no plugin systems, no config options "for the future." Build what the task needs today.
- Keep functions **short and single-purpose**. If a function needs a scroll to read, split it.
- Keep files focused. One clear responsibility per file.
- Flat is better than nested. Avoid deep folder hierarchies and deep conditional nesting (prefer early returns).
- Choose the standard library and well-known idioms over novel patterns.

## 3. Scope Discipline

- Touch **only the files related to the current task**.
- Do not refactor, rename, reformat, or "improve" unrelated code in passing. If you spot a problem outside the task's scope, **report it — don't fix it.**
- Keep changes small and reviewable. Prefer several small, complete changes over one large one.

## 4. Testing — Non-Negotiable

- Every change ships with tests. **Untested code is unfinished code.**
- Tests must guarantee **stable, deterministic** behavior: no sleeps for synchronization, no reliance on external services, no order-dependent tests.
- **Disabling, skipping, or deleting a failing test to make the build pass is forbidden.** A failing test means the code is wrong or the test is wrong — find out which, or ask (see §7).
- Test behavior, not implementation details. A refactor that preserves behavior should not break tests.
- Cover the error paths, not just the happy path.

## 5. Documentation

- Document **in the code**: every exported/public function, type, and module gets a short comment explaining **what it does and why it exists** — not how (the code shows how).
- Comments explain intent and non-obvious decisions. Delete comments that restate the code.
- Every project has a `README.md` covering: what it is, how to run it, how to test it. Keep it current — an outdated README is a bug.

## 6. Dependencies

- **Standard library first.** Reach for a dependency only when the stdlib genuinely can't do the job reasonably.
- Every new dependency must be justified: what it does, why the stdlib isn't enough, and its maintenance health.
- Never add a dependency for something achievable in a few lines of boring code.

## 7. Ask, Don't Guess — Escalation Protocol

When the agent is unsure, blocked, or facing an unexpected failure it does not fully understand, it must **stop and ask** instead of improvising a fix. Guessing is forbidden.

The question must follow this format:

1. **What I was doing** — the task and step.
2. **What I found** — the exact error, ambiguity, or conflict (include the message/output).
3. **What I considered** — 2–3 options with trade-offs.
4. **What I recommend** — one option and why.
5. **Then wait.** Do not proceed until answered.

Explicitly forbidden "fixes": deleting/skipping tests, loosening linter rules, adding broad error-swallowing, changing unrelated code, downgrading dependencies blindly.

## 8. Bug-Fixing Protocol — Understand, Fix, Prove

Fixing a bug is a three-step process, in this order. Skipping a step is forbidden.

### Step 1 — Understand and reproduce
- **Reproduce the bug first.** Write a failing test (or a minimal script) that demonstrates it. If it can't be reproduced, it isn't understood — investigate or escalate (§7), don't fix blind.
- Identify the **root cause**, not the symptom. Be able to explain, in plain language: *what happens, why it happens, and where in the code it originates.*
- If the root cause can't be explained at that level, **stop and ask (§7)**. Patching a symptom without understanding is guessing.

### Step 2 — Fix
- Fix the root cause with the smallest correct change. No opportunistic refactoring around it (§3).
- If the root cause reveals a design problem too big for a small fix, report it and propose options (§7) instead of a workaround. If a temporary workaround is explicitly approved, mark it clearly in code with a reference to the underlying issue.

### Step 3 — Prove it
- The failing test from Step 1 now passes, and it stays in the codebase as a **regression test**.
- The full test suite still passes — the fix broke nothing else.
- **Never report "it's fixed."** Report: *root cause → change made → test that proves it → full-suite result.* A fix without evidence is an unverified claim, and unverified claims are forbidden.

## 9. Errors Are First-Class

- Never swallow an error silently. Every error is either **handled meaningfully, propagated, or logged with context** — pick one, deliberately.
- Error messages must say what failed and with what input/context, so a human can act on them.
- Fail fast and loudly at startup for configuration problems.

## 10. Security Basics

- No secrets, tokens, or credentials in code, tests, or fixtures. Configuration comes from the environment.
- Validate all external input (HTTP payloads, WebSocket messages, env vars) at the boundary.
- Log nothing sensitive (tokens, passwords, magic links, personal data).

## 11. Definition of Done

A task is finished only when **all** of these are true:

- [ ] Code builds with no errors or new warnings.
- [ ] All tests pass — including pre-existing ones. None disabled or skipped.
- [ ] New/changed behavior is covered by tests (happy path + error paths).
- [ ] Linter and formatter pass clean.
- [ ] Public APIs are documented; README updated if usage changed.
- [ ] The diff contains only changes related to the task.
- [ ] If it was a bug fix: the regression test from §8 exists, and the report includes root cause + evidence (never just "fixed").

If any box can't be checked, the task is not done — either finish it or escalate per §7.
