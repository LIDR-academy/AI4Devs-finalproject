---
description: Run the agentic orchestrator on a user story — spec → Gherkin → TDD → parallel review → mutation → DoD (PR-ready)
argument-hint: "<story> — the name of a file in user-stories/ (with or without .md), e.g. lesson-list"
---

# /ticket-orchestrator — run the agentic orchestrator

Act as **`orchestrator_lead`** and drive the full pipeline for ONE feature. Story: `$ARGUMENTS`

## Boot

1. **Read the source of truth:** `.agents/ORCHESTRATOR.md` (roles, gates, state machine, DoD). It governs everything below; the canonical code rules in `.agents/rules/*` govern how code is written.
2. **Resolve the story:** open `user-stories/$ARGUMENTS.md` (accept the name with or without `.md`). If it doesn't exist, list `user-stories/*.md` and stop. Derive a kebab `<name>`.
3. **Create the worktree:** `git worktree add .worktrees/<name> -b feat/<name>` from the up-to-date default branch, and `cd` into it — **all** work (docs + code + commits) happens there. `pnpm install` if the worktree lacks `node_modules`. Then create `docs/features/<name>/` from `.agents/templates/` and point `progress/current.md` at it.

## Run the phases (guard every gate; state on disk)

1. `spec_partner` → `spec.md` + `risks.md` + `tasks.md` + `task-N.md` + `gherkin-scenarios.md` (contract via the `gherkin-authoring` skill) → then `spec_reviewer` vets the whole bundle (`review-spec.md`); findings loop back to `spec_partner` (≤ 2 rounds) → **⏸ HUMAN GATE** (single, combined: approve spec **and** contract).
2. `implementator` → strict TDD, one vertical slice at a time; **after each slice, invoke `reviewer_slice` directly (ONE agent, code + design lenses)** → fix findings → next slice.
3. After all slices — **quality gate: mutation → full review → conditional mutation**:
   a. `mutation_tester` (**pre-review**) → StrykerJS on changed files → `implementator` kills every survivor (≤ 2 rounds). Record the pre-review sha before step b.
   b. `reviews_lead` in **`full` mode** → runs CI **once**, skips lenses the diff can't trigger, fans out the applicable reviewers in parallel → consolidated `review.md` → `implementator` fixes every finding (≤ 2 rounds; any severity incl. minor; round 2 re-runs **only** reviewers with open findings).
   c. `mutation_tester` (**post-review**) → **only if the review changed source files**; scoped via `base-ref = <pre-review-sha>` → `implementator` kills every survivor (≤ 2 rounds). Otherwise append one skip line to `mutation.md`.
4. `dod_validator` → `dod.md` (validate only) → **`pr_ready`**.

At `pr_ready`, tell me the feature is ready and that opening & merging the PR is my manual step. Append a line to `progress/history.md`.

## Rules

- Stop and wait at the human gate. Never skip it. One feature at a time.
- Subagents write to `docs/features/<name>/` and return one reference line — read the file if you need detail; don't relay walls of text.
- `implementator` is the only agent that edits feature code.
