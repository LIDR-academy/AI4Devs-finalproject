---
name: implement-task
description: Implement a single backlog task (US-XXX-TASK-NN) with TDD, choosing the backend or frontend role from the task's Capa column. Use for /implement-task and as the inner loop of /implement-user-story phases 2-3.
---

# Implement Task

Implement exactly **one** task from `docs/backlog/<US-ID>.md`. The task's `Capa`
column selects the role and skill. TDD is obligatory.

---

## Inputs

- `<US-ID>` and `<US-ID>-TASK-<NN>`.
- The task block in `docs/backlog/<US-ID>.md`: description, done criteria, mapped
  acceptance criterion, and the `Verificacion` test.

## Role selection (by `Capa`)

| Layer | Agent | Skill |
|---|---|---|
| Backend | `backend-developer` | `.claude/skills/backend-feature/SKILL.md` |
| Frontend | `frontend-developer` | `.claude/skills/frontend-feature/SKILL.md` |

Both always apply `.claude/skills/tdd-implementation/SKILL.md`.

---

## Checkpoint (always, before implementing)

```markdown
## Checkpoint — Tarea US-XXX-TASK-NN
Capa: <Backend|Frontend>
Tarea: <título>
Tests previstos: <test de Verificacion>
¿Implementar? sí | no | saltar | revisar
```

- `sí` → proceed. `no` → stop. `saltar` → leave unimplemented, move on. `revisar` →
  show the task detail and re-ask.

## Loop (after `sí`)

1. Verify dependencies (`Depende de`) are implemented; if not, stop and report.
2. **Red** — write the failing test named in `Verificacion`.
3. **Green** — minimal code to pass, respecting clean architecture / UX states.
4. **Refactor** — green suite.
5. Run the full suite; paste output into the task's "Executed verification".
6. Run `.claude/skills/code-review/SKILL.md` checklist for the relevant layer.
7. Mark `- [x] Implementado` in the backlog. Report and stop.

A task is done only when its named test is green, the suite passes, the review
checklist passes, and the applicable security rules hold.
