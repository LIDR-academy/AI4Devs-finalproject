# Contracts

Behavioral contracts that govern what actions an AI agent working in this repository is allowed or forbidden to take, and how it should make decisions when working here. This is distinct from [architecture/authorization.md](architecture/authorization.md) (application-level roles/permissions enforced by the running app) and [conventions/](conventions/) (code style) — those govern the *product*; this file governs the *agent*.

New contracts are appended below as additional `###` sections; nothing here is removed without the change being visible in this file's history.

### Uncertainty Handling Rule

When you are not sufficiently confident that you understand the user's intent or have all the information required to complete a task correctly, **do not make assumptions or choose an option on the user's behalf**.

Follow this protocol:

1. **Proceed only when the request has a single, clear, and well-supported interpretation.**
2. **If any required information is missing, ambiguous, or open to multiple reasonable interpretations, stop before taking action.**
3. **Ask concise, specific clarifying questions to resolve the ambiguity.**
4. **Whenever appropriate, present multiple possible answers or courses of action. Clearly label the option you believe is the best fit for the project as _**(recommended)**_, and briefly explain why you recommend it.**
5. **Wait for the user's response before continuing with any action that depends on the answer.**
6. **Never invent missing information, infer user preferences, or make irreversible decisions without explicit confirmation.**
7. **When in doubt, asking a clarifying question is always preferred over making an assumption.**

Your goal is to maximize correctness rather than speed. It is better to ask one clarifying question than to complete the wrong task. When providing options, your role is to guide the user with a recommendation—not to make the final decision on their behalf.

### Commit Approval Rule

You must **never commit anything on behalf of the user**. Committing is a human decision that requires a human to review the actual staged changes first — even a direct, explicit-seeming instruction to "commit" is a request to prepare a commit for review, not to run `git commit` yourself.

Follow this protocol:

1. **Stage only the intended changes explicitly** with `git add <files>`, naming the specific files. Never stage with `git add -A`, `git add .`, or any other bulk/catch-all form.
2. **Prepare a draft commit message** for the staged changes.
3. **Present both to a human for review**: what was staged and the proposed commit message, so the human can inspect the actual staged changes (e.g. via `git diff --staged` / `git status`) before deciding.
4. **Wait for explicit human approval before running `git commit`.** Do not run `git commit` until a human has reviewed the staged changes and explicitly approved. Absent that approval, stop at staging plus a proposed message.
5. **Treat even an explicit "commit this" as stopping at staging plus a proposed message for review** — do not interpret it as pre-approval to run `git commit`. The approval must come *after* the human has seen the actual staged changes.

This contract is intentionally stricter than the general "only commit when explicitly asked" git-safety guidance: here the boundary is that you never run `git commit` at all without a human first reviewing the staged diff and explicitly approving.

### Destructive Database Command Rule

Never run `migrate:fresh`, `migrate:refresh`, `migrate:rollback`, `migrate:reset`, `db:wipe`, or any other command that drops or rewinds schema/data against this project's **real** database without the user's **explicit authorization first**. "Real" means the local development database (`arospe`, per `.env`'s `DB_DATABASE`) exactly as much as any staging/production database — anything that is not the isolated `testing` database Laravel's test suite runs against.

Follow this protocol:

1. **Before running any destructive migration/wipe command directly** via `php artisan` (or `docker exec`/Sail), **stop and ask the user for explicit authorization.** Do not run it — not for debugging, not to "just reset state," and not because a similar destructive action was approved earlier in the same session. Approval does not carry over across commands or sessions; ask again each time.
2. **Running the test suite itself is exempt and always safe** — `php artisan test`, `vendor/bin/pest`, `vendor/bin/phpunit`, and Pest's `RefreshDatabase`/`DatabaseTransactions` traits may be run freely, because `phpunit.xml` pins `DB_DATABASE=testing` for every process launched through them, isolating all resets to the dedicated testing database.
3. **Do not trust a bare `--env=testing` flag (or similar) to redirect a direct `artisan` invocation to a safe database.** This repo has no `.env.testing` file, so `php artisan migrate:fresh --env=testing` run directly (outside the test runner) silently falls back to `.env`'s real `DB_DATABASE` (`arospe`) — this already happened once in this project and wiped the dev database (see [errors-log.md](errors-log.md)). The only reliable way to target the testing database outside the test runner is to export `DB_DATABASE=testing` explicitly, or better, just invoke through the test runner itself.
4. **If you need to inspect or reset test data while debugging, run the actual test suite** (it resets its own database safely) instead of a manual `artisan` command against whatever database happens to be configured.

This is intentionally stricter than the general "confirm before destructive operations" git-safety guidance: here, prior approval never generalizes across commands or sessions, and the testing-database exemption is narrow — it covers only commands executed through Laravel's test runner, never a manually typed `artisan` command that merely references "testing."

### Full Test Suite Gate Rule

A task must **never be closed** — i.e. its file must never be moved from `ai-spec/tasks/in-progress/` to `ai-spec/tasks/done/` (Phase 7 of [workflow.md](workflow.md)), and work must never proceed to the next task — while even one test in the **full** suite is failing. "All tests green" means every test in the project, not just the tests the current task added or touched.

Follow this protocol:

1. **Immediately before moving a task's file to `done/`, run the complete suite** (`php artisan test`, not a filtered subset) and confirm it reports 100% passing.
2. **A failing test blocks closure regardless of whose it is.** A failure that predates the current task, belongs to unrelated code, or was only just discovered is not an exception — "not my test" does not authorize closing the task anyway. Diagnose and resolve it first, following [workflow.md](workflow.md) Phase 3's existing "Test issue" vs. "Code issue" distinction for how to fix it and who fixes it.
3. **A suspicious mass-failure must be verified as real before being acted on or reported as a regression.** If a full-suite run shows unexpected, widespread failures, first rule out test-run interference — most commonly two processes (e.g. two agents, or a manual run overlapping an agent's run) exercising the same shared database concurrently, which can produce deadlocks or seed collisions that look like a regression but are not one. Re-run the suite in isolation, with no other process touching the same database, before drawing any conclusion.
4. **Only a single, isolated, 100%-passing full-suite run is sufficient evidence to close a task.** A task file's Definition of Done "full suite green" checkbox must not be checked off, and the file must not be moved to `done/`, on the strength of anything weaker than that — not a partial/filtered run, not a run contaminated by concurrent interference, and not a prior run whose result may since have been invalidated by later changes.

This complements [workflow.md](workflow.md)'s existing gates — Phase 3's TDD requirement that tests are green before Phase 4, and Phase 5's "the full test suite passes" review criterion — by making the same requirement binding specifically at the Phase 7 closure step, so a regression introduced or discovered between Phase 5's review and closure cannot slip a task into `done/` unnoticed.

_Last updated: 2026-08-15 — Added the Full Test Suite Gate Rule: a task may never be closed (moved to `ai-spec/tasks/done/`) while any test in the full suite fails, regardless of whether the failure belongs to that task, and a suspicious mass-failure must be verified as real (ruling out concurrent test-run interference) before being treated as a regression or a pass._

_Previously, 2026-08-10 — Added the Destructive Database Command Rule: never run `migrate:fresh`/`migrate:refresh`/`migrate:rollback`/`migrate:reset`/`db:wipe` against the real database without explicit per-instance authorization; the test suite's own database resets remain unrestricted since they're isolated to the `testing` database by `phpunit.xml`._

_Previously, 2026-07-19 — Added the Commit Approval Rule: never run `git commit` on the user's behalf; always stop at explicit staging plus a proposed message and wait for human review/approval._
