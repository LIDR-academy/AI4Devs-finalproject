---
name: implement-user-story
description: Drive the 6-phase SDD workflow for a RunMarket user story — refine, backend TDD, frontend TDD, verify, OWASP security, close — always pausing between phases and checkpointing before each task. Use for /implement-user-story.
---

# Implement User Story

Execute the SDD workflow for `<US-ID>`. TDD is obligatory in phases 2-3 and in
security remediations; every US passes OWASP review before closing.

## Behaviour

- **Always reads backlog state.** If `docs/backlog/<US-ID>.md` does not exist, run
  `.claude/skills/breakdown-user-story/SKILL.md` first (phase 1) and pause. If it
  exists, resume from the first unchecked phase or unimplemented task.
- **Always pauses between phases** to ask before continuing to the next one.
- **Always checkpoints before each task** in phases 2-3 (see below). No task is
  implemented without explicit user confirmation.
- **Branch per US (automatic).** Before implementation, create and switch to
  `us/<US-ID>-<slug>` (lowercase; `<slug>` = short accent-free kebab of the US title)
  from the current branch via `git switch -c`. Record the originating branch for
  integration. Branch creation needs **no** confirmation; if resuming and the branch
  exists, just switch to it.

---

## The 6 phases

| Phase | What | Role / skill | TDD | OWASP |
|---|---|---|---|---|
| 1 Refine | Generate/confirm backlog | `product-owner` · refine-user-story | — | API/component contract |
| 2 Backend | Implement Backend tasks | `backend-developer` · backend-feature | **yes** | input/queries |
| 3 Frontend | Implement Frontend tasks | `frontend-developer` · frontend-feature | **yes** | XSS/secrets |
| 4 Verification | Run all suites | both | run tests | — |
| 5 Security | OWASP review + remediation loop | `security` · owasp-security-review | regression tests | **yes** |
| 6 Closing | Closing checklist | this skill (inline) | — | — |

Update the **Workflow state** checkboxes in the backlog as each phase completes.

---

## Phases 2-3 — per-task checkpoint (always)

For each task invoke `.claude/skills/implement-task/SKILL.md`, which presents:

```markdown
## Checkpoint — Tarea US-XXX-TASK-NN
Capa: <Backend|Frontend>
Tarea: <título>
Tests previstos: <test de Verificacion>
¿Implementar? sí | no | saltar | revisar
```

After `sí`: TDD red→green→refactor → mark `- [x] Implementado` → pause and ask
before the next task.

---

## Phase 4 — verification

Run the full backend and frontend suites (and Playwright if the US has E2E tasks).
Paste results into "Integrated verification". All green to proceed.

---

## Phase 5 — security

Run `.claude/skills/owasp-security-review/SKILL.md` over the US changes. Record
findings, fix HIGH/CRITICAL with TDD, re-review until zero open HIGH/CRITICAL, mark
`Revisión de seguridad aprobada`.

---

## Phase 6 — closing checklist (inline)

```markdown
## Cierre — US-XXX
- [ ] Todas las tareas del backlog marcadas `- [x] Implementado`
- [ ] Cada criterio de aceptación de la US mapeado y verificado
- [ ] Suite completa en verde (backend + frontend, E2E si aplica)
- [ ] Revisión de arquitectura limpia superada (skill code-review)
- [ ] Revisión de seguridad aprobada (sin HIGH/CRITICAL abiertos)
- [ ] Reglas de seguridad de CLAUDE.md verificadas
- [ ] Estado del workflow: fases 1-5 marcadas
- [ ] Sin alcance fuera de la US
```

When every box is checked, mark Phase 6 done. Then propose creating the **Pull Request**
and, on confirmation, execute it:

1. `git push -u origin us/<US-ID>-<slug>` — push the US branch to remote.
2. `gh pr create --base <originating-branch> --head us/<US-ID>-<slug> \
     --title "<US-ID>: <US title>" \
     --body "$(cat docs/backlog/<US-ID>.md)"` — open the PR with the full backlog as body.
3. Record the PR URL in the backlog under a `## Pull Request` section.

Do **not** merge or delete the branch — the PR documents the US boundary for the exercise.
PR creation requires confirmation. Finally suggest `/archive-user-story US-XXX` to move
the backlog to `docs/backlog/archive/`.

---

## Scope modifiers

`backend-only` (phase 2), `frontend-only` (phase 3), `security-only` (phase 5).
Each runs the matching phase and stops.
