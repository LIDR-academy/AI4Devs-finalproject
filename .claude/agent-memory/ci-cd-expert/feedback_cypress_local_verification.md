---
name: feedback-cypress-local-verification
description: Local sandbox limits on verifying Nx e2e / Cypress targets — what can and cannot be proven without a real GitHub Actions run
metadata:
  type: feedback
---

`cypress run` cannot be executed in this Windows sandbox at all, so a smoke scenario's
actual pass/fail cannot be observed here.

**Why:** `cypress run` invoked directly (bypassing Nx entirely, against a manually started
API) crashes the sandbox process with `Illegal instruction` (exit 132) — Electron cannot
launch here, independently of Nx. Note that this is a sandbox limit, not a repository one:
in the main session's shell the same suites run and pass, once `ELECTRON_RUN_AS_NODE` (which
an Electron-hosted editor exports) is unset.

**How to apply:** when adding or changing a workflow step that runs `nx e2e <project>`, state
plainly what was verified (YAML validity, job graph and `needs`, `pnpm install
--frozen-lockfile`, the e2e projects' `project.json` shape) versus what only the first real
run on `ubuntu-latest` can confirm.

**But do not dismiss an `nx e2e` failure as environmental without checking.** A reproducible
"no run marker" failure from `tools/e2e/assert-under-test.mjs` was originally filed here as
Windows/Nx flakiness to be ignored. It was not: it was a real race, since fixed. Nx starts a
dependent task as soon as a continuous dependency is *registered* as running
(`tasks-schedule.js` checks `runningTasks.has(id)`) — `readyWhen` governs how that task
reports itself, not when its dependents begin — so a check that ran once could execute before
the supervisor had written its marker. It lost roughly one run in three. The fix was to make
the assertion wait for the marker, the process and the port rather than sample them once.
The lesson: a safety net that trips is evidence about the system until proven otherwise, and
"it only happens on Windows" is a hypothesis, not a diagnosis.
