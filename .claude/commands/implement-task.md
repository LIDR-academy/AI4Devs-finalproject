---
description: Implement a single backlog task with TDD, role chosen by its Capa column
argument-hint: US-XXX US-XXX-TASK-NN
---

# /implement-task

Implement the single task `$2` of user story `$1` from `docs/backlog/$1.md`.

## Steps

1. Read the `$2` block in `docs/backlog/$1.md` (description, done criteria, mapped
   acceptance criterion, `Verificacion` test, `Depende de`).
2. **Ensure the US branch (automatic).** Make sure you are on `us/$1-<slug>` (lowercase;
   `<slug>` = short accent-free kebab of the US title): create it from the current branch
   with `git switch -c` if it doesn't exist, or switch to it if it does. No confirmation.
   When this command runs inside `/implement-user-story` you are already on it — no-op.
3. Run `.claude/skills/implement-task/SKILL.md`. Role by `Capa`:
   - Backend → `.claude/agents/backend-developer.md` +
     `.claude/skills/backend-feature/SKILL.md`
   - Frontend → `.claude/agents/frontend-developer.md` +
     `.claude/skills/frontend-feature/SKILL.md`
   - Always apply `.claude/skills/tdd-implementation/SKILL.md`.
4. Show the per-task checkpoint and wait for `sí | no | saltar | revisar`.
5. After `sí`: verify dependencies → red → green → refactor → run suite → review with
   `.claude/skills/code-review/SKILL.md` → mark `- [x] Implementado`.

## Rules

- TDD obligatory; the named test must be green and the full suite must pass.
- Do not implement other tasks. Report and stop.
- Single-task scope: do **not** merge or delete the branch — integration happens at US
  close (`/implement-user-story` Phase 6) or manually.
