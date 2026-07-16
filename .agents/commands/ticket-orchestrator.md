---
description: Run the agentic orchestrator on a user story — spec → Gherkin → TDD → parallel review → mutation → DoD (PR-ready)
argument-hint: "<story> — the name of a file in user-stories/pending/ (with or without .md), e.g. lesson-list"
---

# /ticket-orchestrator — run the agentic orchestrator

Act as **`orchestrator_lead`** and drive the full pipeline for ONE feature. Story: `$ARGUMENTS`

## Boot

1. **Read the source of truth:** `.agents/ORCHESTRATOR.md` (roles, gates, state machine, DoD). It governs everything below; the canonical code rules in `.agents/rules/*` govern how code is written.
2. **Resolve the story:** open `user-stories/pending/$ARGUMENTS.md` (accept the name with or without `.md`; if not in `pending/`, check `user-stories/in-progress/` for a resume). If it doesn't exist, list `user-stories/pending/*.md` and stop. Derive a kebab `<name>`.
3. **Create the worktree + mark in-progress:** `git worktree add .worktrees/<name> -b feat/<name>` from the up-to-date default branch, and `cd` into it — **all** work (docs + code + commits) happens there. **Move the story:** `git mv user-stories/pending/<story>.md user-stories/in-progress/<story>.md` + commit. `pnpm install` if the worktree lacks `node_modules`. Then create `docs/features/<name>/` from `.agents/templates/` (**spec.md, tasks.md, task.md — not risks.md**) and point `progress/current.md` at it. `risks.md` is written to a gitignored `tmp/<name>/` folder, never re-read into context; it's landed in `docs/` at PR time (step 5).

## Run the phases (guard every gate; state on disk)

1. `spec_partner` → `spec.md` + `tasks.md` + `task-N.md` + `gherkin-scenarios.md` (contract via the `gherkin-authoring` skill; `risks.md` → gitignored `tmp/<name>/`, out of the bundle) → then `spec_reviewer` vets the whole bundle (`review-spec.md`); findings loop back to `spec_partner` (≤ 2 rounds) → **⏸ HUMAN GATE** (single, combined: approve spec **and** contract).
2. `implementer` → strict TDD, one vertical slice at a time; **after each slice, invoke `reviewer_slice` directly (ONE agent: checks the slice against all `.agents/rules/` + design)** → fix findings → next slice.
3. After all slices — **quality gate: mutation → full review → conditional mutation**:
   a. `mutation_tester` (**pre-review**) → StrykerJS on changed files → `implementer` kills every survivor (≤ 2 rounds). Record the pre-review sha before step b.
   b. `reviews_lead` in **`full` mode** → runs CI **once**, then fans out the **2 reviewers in parallel** (`reviewer_engineering` = code · architecture · performance, always; `reviewer_standards` = security · accessibility, unless the diff is types/docs-only with no UI/security surface) → consolidated `review.md` → `implementer` fixes every finding (≤ 2 rounds; any severity incl. minor; round 2 re-runs **only** the reviewer(s) with open findings).
   c. `mutation_tester` (**post-review**) → **only if the review changed source files**; scoped via `base-ref = <pre-review-sha>` → `implementer` kills every survivor (≤ 2 rounds). Otherwise append one skip line to `mutation.md`.
4. `dod_validator` → `dod.md` (validate only) → **`pr_ready`**.
5. **Mark done + land risks + compact:** move `tmp/<name>/risks.md` → `docs/features/<name>/risks.md` (`mkdir -p` if needed) so it ships in the PR; `git mv user-stories/in-progress/<story>.md user-stories/done/<story>.md`; `git add docs/features/<name>/risks.md` + commit; run the compact-docs **script** (`.agents/skills/compact-docs/scripts/compact-docs.sh <name>`) — **script only, no agent trimming**.

At `pr_ready`, tell me the feature is ready and that opening & merging the PR is my manual step. Append a one-line entry to `progress/history.md`.

## Rules

- Stop and wait at the human gate. Never skip it. One feature at a time.
- Subagents write to `docs/features/<name>/` and return one reference line — read the file if you need detail; don't relay walls of text.
- `implementer` is the only agent that edits feature code.
