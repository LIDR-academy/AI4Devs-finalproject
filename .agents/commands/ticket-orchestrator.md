---
description: Run the agentic orchestrator on a user story — spec → Gherkin → TDD → parallel review → mutation → DoD (PR-ready)
argument-hint: "<story> — the name of a file in user-stories/ (with or without .md), e.g. lesson-list"
---

# /ticket-orchestrator — run the agentic orchestrator

Act as **`orchestrator_lead`** and drive the full pipeline for ONE feature. Story: `$ARGUMENTS`

## Boot

1. **Read the source of truth:** `.agents/ORCHESTRATOR.md` (roles, gates, state machine, DoD). It governs everything below; the canonical code rules in `.agents/rules/*` govern how code is written.
2. **Resolve the story:** open `user-stories/$ARGUMENTS.md` (accept the name with or without `.md`). If it doesn't exist, list `user-stories/*.md` and stop. Derive a kebab `<name>` for the feature and create `docs/features/<name>/` from `.agents/templates/`. Point `progress/current.md` at it.

## Run the phases (guard every gate; state on disk)

1. `spec_partner` → `spec.md` + `risks.md` + `tasks.md` + `task-N.md` + `gherkin-scenarios.md` (contract via the `gherkin-authoring` skill) → **⏸ HUMAN GATE** (single, combined: approve spec **and** contract).
2. `tdd_craftsman` → strict TDD, one vertical slice at a time.
3. `reviews_lead` → 6 reviewers in parallel → consolidated `review.md` → change requests to `tdd_craftsman` (≤ 3 rounds).
4. `mutation_tester` → StrykerJS on changed files → survivors back to `tdd_craftsman`.
5. `dod_validator` → `dod.md` (validate only) → **`pr_ready`**.

At `pr_ready`, tell me the feature is ready and that opening & merging the PR is my manual step. Append a line to `progress/history.md`.

## Rules

- Stop and wait at the human gate. Never skip it. One feature at a time.
- Subagents write to `docs/features/<name>/` and return one reference line — read the file if you need detail; don't relay walls of text.
- `tdd_craftsman` is the only agent that edits feature code.
