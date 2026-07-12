---
description: Implement a single GitHub issue end-to-end using the Superpowers executing-plans workflow, with TDD, scoped commits, and a templated PR.
argument-hint: <github-issue-number-or-url>
---

Use the `superpowers:executing-plans` workflow to implement GitHub issue **$ARGUMENTS**.

## Sources of truth

- **Implementation plan:** `specs/001-guest-search-booking/tasks.md` — source of truth for implementation details (tasks, file paths, ACs).
- **GitHub issue $ARGUMENTS** — source of truth for tracking/status.
- **PR template:** `.github/pull_request_template.md` — must be used verbatim for every PR.

## Rules

- Map the issue to the relevant task(s) in `tasks.md` before starting. If the mapping is unclear, stop and ask.
- Work this issue and only this issue. Do not mix work from other issues into the same branch or PR unless I explicitly say so.
- Create a separate branch (or worktree) per GitHub issue.
- Create exactly **one PR per GitHub issue**.
- Keep commits scoped to the current issue only.
- Do **not** close the GitHub issue automatically — leave that to me unless I tell you otherwise.
- Stop and ask if the spec or issue requirements are ambiguous, conflicting, or contradicted by `tasks.md`.

## Procedure

1. **Read the issue.** Fetch issue $ARGUMENTS via `gh issue view $ARGUMENTS` and extract its acceptance criteria.
2. **Cross-check with `tasks.md`.** Identify the matching task(s). If there is any conflict between the issue and `tasks.md`, stop and report it before writing any code.
3. **Worktree.** Create an isolated git worktree for this issue — never work in the main working directory. This is mandatory when multiple issues are implemented in parallel (agents sharing a working directory will see each other's uncommitted files and accidentally include them in commits):
   ```bash
   git worktree add .worktrees/issue-$ARGUMENTS-<short-slug> -b issue-$ARGUMENTS-<short-slug>
   cd .worktrees/issue-$ARGUMENTS-<short-slug>
   ```
   All subsequent steps run inside this worktree. Remove it after the PR is merged:
   ```bash
   git worktree remove .worktrees/issue-$ARGUMENTS-<short-slug>
   ```
4. **Implement using TDD:**
   - Write failing tests first that encode the issue's acceptance criteria.
   - Confirm they fail for the right reasons.
   - Implement the minimum code to make them pass.
   - Refactor only if needed; keep tests green.
5. **Verify before completion.** Run the full validation suite (build, lint/format, unit tests, integration tests where applicable) and show me the actual output. Do not proceed if anything fails.
   - **Flow/test coverage (definition of done):** if the issue added or changed an HTTP endpoint, there MUST be a per-endpoint integration test (full `@SpringBootTest(RANDOM_PORT)` + `WebTestClient.bindToServer()` + TestContainers, in `presentation/api/integration/`) — a `@WebFluxTest`/`bindToController` slice does not count, it mocks the use case and skips the real codec/security chain (this is how #130 and #132 shipped green). If it added or changed a user journey, the Playwright E2E (`frontend/tests/e2e/`) MUST cover it. The task is **not done** until that coverage exists and is green. See `docs/superpowers/specs/2026-06-19-e2e-flow-testing-strategy-design.md`.
5a. **Architecture review (backend changes only).** If any changed files live under `backend/src/main/kotlin/`, dispatch the `arch-reviewer` agent:
   ```
   Agent({
     subagent_type: "arch-reviewer",
     prompt: "Review these files for Clean Architecture violations: <paste changed file paths and their full content>"
   })
   ```
   Do not open the PR if the reviewer returns VIOLATIONS FOUND with Critical or Important severity. Fix first, then re-run validation.
6. **Commit.** Use Conventional Commits and include the issue reference, e.g.:
   `feat(booking): add availability check (#$ARGUMENTS)`
   Keep every commit scoped to this issue.
6a. **Security review.** Run `/security-review` on the branch. If any HIGH-severity finding survives the false-positive filter (confidence ≥ 8), fix it before opening the PR. MEDIUM findings must be acknowledged in the PR body under the **Impact** section. Do not open the PR if there are unresolved HIGH findings.
7. **Open the PR.** Push the branch and open exactly one PR for this issue with `gh pr create`. The PR description **must** be generated from `.github/pull_request_template.md` (use the file as the literal scaffold). Fill in every relevant section:
   - **What** — implementation summary
   - **Why** — link to issue $ARGUMENTS and the relevant user story / task in `tasks.md`
   - **Impact** — API/contract/data-model/dependency/perf/security/observability implications
   - **References** — issue #$ARGUMENTS, the matching `tasks.md` task ID(s), and the user story
   - **Checklist** — tick only items that are genuinely satisfied; leave the rest unchecked and explain in the PR body
   - Add an **AI tools used** note and any **architectural decisions** if relevant.
8. **Report back.** Output the PR URL, the commits included, and a short status of validation steps run.

If at any point the issue's requirements look ambiguous, conflict with `tasks.md`, or expand beyond the stated scope, **stop and ask** rather than guessing.
