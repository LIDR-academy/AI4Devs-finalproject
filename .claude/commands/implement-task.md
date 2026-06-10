---
description: Implement a single backlog task with TDD, role chosen by its Capa column
argument-hint: US-XXX US-XXX-TASK-NN
---

# /implement-task

Implement the single task `$2` of user story `$1` from `docs/backlog/$1.md`.

## Steps

1. Read the `$2` block in `docs/backlog/$1.md` (description, done criteria, mapped
   acceptance criterion, `Verificacion` test, `Depende de`).
2. Run `.claude/skills/implement-task/SKILL.md`. Role by `Capa`:
   - Backend → `.claude/agents/backend-developer.md` +
     `.claude/skills/backend-feature/SKILL.md`
   - Frontend → `.claude/agents/frontend-developer.md` +
     `.claude/skills/frontend-feature/SKILL.md`
   - Always apply `.claude/skills/tdd-implementation/SKILL.md`.
3. Show the per-task checkpoint and wait for `sí | no | saltar | revisar`.
4. After `sí`: verify dependencies → red → green → refactor → run suite → review with
   `.claude/skills/code-review/SKILL.md` → mark `- [x] Implementado`.

## Rules

- TDD obligatory; the named test must be green and the full suite must pass.
- Do not implement other tasks. Report and stop.
