---
name: breakdown-user-story
description: Refine an existing RunMarket user story into an implementation-ready technical backlog and break it down into ordered Backend/Frontend tasks with TDD verification. Produces docs/backlog/<US-ID>.md. Use for /refine-user-story.
---

# Breakdown User Story

Turn an existing user story from `docs/USER-STORIES.md` into the technical backlog
file `docs/backlog/<US-ID>.md`. **No application code** is written here — this skill
only produces the backlog. The backlog body is written in **Spanish**.

Driven by the `product-owner` agent. Read first: the target US in
`docs/USER-STORIES.md`, plus `docs/PRD.md`, `docs/ARCHITECTURE.md`,
`docs/DATA-MODEL.md`, and the security rules in `CLAUDE.md`.

---

## When to run each part

| Invocation | Parts executed |
|---|---|
| `/refine-user-story US-XXX` | Part A → Part B → Part C |
| `/refine-user-story US-XXX breakdown-only` | Part B → Part C (Part A skipped — US is accepted as written) |

---

## Part A — Refine the US

1. Load the US block from `docs/USER-STORIES.md` (history, description, acceptance
   criteria, entities, estimate, priority).
2. Resolve ambiguities against PRD/ARCHITECTURE/DATA-MODEL. Make implicit behaviour
   explicit: status codes, validation, pagination/sorting, UX states.
3. Describe the **technical contract** according to the scope of the US:
   - **Backend or full-stack US** — sketch the API contract (method, path,
     request/response shape, error codes). Consider OWASP here: input validation,
     safe errors, IDOR over `sessionId`.
   - **Frontend-only US** — describe the component contract: entry-point route/component,
     props/state shape, which existing API endpoint is consumed, UX states
     (loading/empty/error/happy path), and any URL params validated against domain enums.
   - If the US involves both, cover both contracts.
4. Identify every acceptance criterion — each one must be covered by ≥1 task.

Output of Part A: the "Refined US" section of the backlog.

---

## Part B — Generate tasks

Split the refined US into the **smallest valuable tasks**. Rules:

- Task ID: `<US-ID>-TASK-<NN>`, `NN` two digits, sequential, global per US.
- `Capa` is exactly `Backend` or `Frontend`.
- Backend tasks come before the Frontend tasks that depend on them.
- Each task maps to ≥1 acceptance criterion.
- The `Verificacion` column names a **concrete** test type and assertion (Supertest,
  Jest, RTL, Playwright) — never "manual" or "TBD".

Produce the **mandatory task table**:

| ID | Capa | Tarea | Depende de | Verificacion |
|---|---|---|---|---|

Then, for each task, emit a detail block using
`.claude/skills/breakdown-user-story/task-template.md` (Implementado checkbox,
done criteria, TDD tests, mapped acceptance criterion).

If a task cannot follow TDD, document the reason in its block (do not silently skip).

---

## Part C — Checkpoint

After writing the backlog, stop and present a summary to the user:

```markdown
## Backlog generated — US-XXX
Tasks: N (Backend: x · Frontend: y)
Covered acceptance criteria: A/B
Blockers: <none | description>
Next: /implement-user-story US-XXX continue
```

Ask whether to proceed to implementation. Do **not** start implementing from this
skill.

---

## Backlog file structure (`docs/backlog/<US-ID>.md`)

1. **Workflow state** — checkboxes per phase (see below).
2. **Refined US**.
3. **Task table** (the table above).
4. **Task detail** — one block per task from the template.
5. **Integrated verification** — how the tasks are tested together.
6. **OWASP security** — findings + remediation (filled in phase 5).

Workflow state checkboxes:

```markdown
## Estado del workflow
- [ ] Fase 1 — US refinada y backlog generado
- [ ] Fase 2 — Backend implementado (TDD)
- [ ] Fase 3 — Frontend implementado (TDD)
- [ ] Fase 4 — Verificación (tests en verde)
- [ ] Fase 5 — Revisión de seguridad aprobada (sin HIGH/CRITICAL)
- [ ] Fase 6 — Cierre (checklist completado)
```
