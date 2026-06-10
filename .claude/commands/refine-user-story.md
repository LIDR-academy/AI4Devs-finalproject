---
description: Refine an existing user story into a technical backlog at docs/backlog/<US-ID>.md (no code)
argument-hint: US-XXX [breakdown-only]
---

# /refine-user-story

Refine the user story `$1` from `docs/USER-STORIES.md` into the technical backlog
`docs/backlog/$1.md`. **No application code** is produced — only the backlog.

## Modes

| Argument | Behaviour |
|---|---|
| `/refine-user-story US-XXX` | Full flow: Part A (analyse + resolve ambiguities + technical contract) → Part B (tasks) → Part C (checkpoint) |
| `/refine-user-story US-XXX breakdown-only` | The US is already validated. Skip Part A analysis. Go straight to Part B (task breakdown) → Part C (checkpoint) |

## Steps

1. Adopt the role in `.claude/agents/product-owner.md`.
2. Read the `$1` block in `docs/USER-STORIES.md` plus `docs/PRD.md`,
   `docs/ARCHITECTURE.md`, `docs/DATA-MODEL.md`, and the security rules in `CLAUDE.md`.
3. Run `.claude/skills/breakdown-user-story/SKILL.md`:
   - **Without `breakdown-only`**: Part A (analyse, resolve ambiguities, describe
     technical contract) → Part B → Part C.
   - **With `breakdown-only`**: skip Part A; go directly to Part B (generate task
     table and per-task detail) → Part C.
4. Write `docs/backlog/$1.md` in Spanish with: workflow state, refined US, task table
   (`| ID | Capa | Tarea | Depende de | Verificacion |`), per-task detail with TDD
   tests, integrated verification, and the OWASP security section.

## Rules

- Each task maps to ≥1 acceptance criterion; the `Verificacion` column names a
  concrete test (Supertest, Jest, RTL, Playwright).
- Backend tasks precede dependent Frontend tasks. Task IDs: `$1-TASK-NN`.
- Stop after Part C. Do not implement. Suggest `/implement-user-story $1`.
