---
description: Run the 6-phase SDD workflow for a user story from its backlog (TDD + OWASP), always pausing between phases and checkpointing before each task
argument-hint: US-XXX [backend-only|frontend-only|security-only]
---

# /implement-user-story

Drive the SDD workflow for `$1`.

## Validation

If no US ID is provided (`$1` is empty), stop immediately and respond:

```
Error: debes indicar el ID de la user story.
Uso: /implement-user-story US-XXX
```

Do not proceed further.

## Behaviour

- If `docs/backlog/$1.md` **does not exist**: runs phase 1 (refine) via
  `.claude/skills/breakdown-user-story/SKILL.md` with `.claude/agents/product-owner.md`,
  then pauses.
- If `docs/backlog/$1.md` **exists**: reads the Workflow state and the
  `[x] Implementado` checkboxes; resumes from the first pending phase or task.
- **Always pauses between phases** to ask for confirmation before continuing.
- **Always checkpoints before each task** in phases 2-3, regardless of any argument.

## Branch per US (automatic)

Before any implementation, **automatically** create and switch to a dedicated branch for
the US, from whatever branch is currently checked out (the delivery branch, e.g.
`feature-entrega2-XVB`). Record that originating branch for later integration.

- **Naming:** `us/<US-ID>-<slug>` — lowercase; `<slug>` is a short, accent-free kebab of
  the US title in `docs/USER-STORIES.md` (e.g. `us/US-007-anadir-al-carrito`).
- Create with `git switch -c us/<US-ID>-<slug>` from `HEAD`. If the branch already exists
  (resuming), switch to it. **Branch creation is automatic — no confirmation.**
- All US work (backlog generated here + every implementation commit) lives on this branch.

On **Phase 6 close**, propose and — on confirmation — execute the integration:

1. `git switch <originating-branch>`
2. `git merge --no-ff us/<US-ID>-<slug>` (the merge commit marks the US boundary)
3. `git branch -d us/<US-ID>-<slug>`

No PR (solo fork, no merge to `main`). The **merge and delete require confirmation**;
branch creation does not.

## Steps

Run `.claude/skills/implement-user-story/SKILL.md` for `$1`. Phases and roles:

- Phase 1 → `.claude/agents/product-owner.md` +
  `.claude/skills/breakdown-user-story/SKILL.md`
- Phase 2 Backend → `.claude/agents/backend-developer.md` +
  `.claude/skills/backend-feature/SKILL.md`
- Phase 3 Frontend → `.claude/agents/frontend-developer.md` +
  `.claude/skills/frontend-feature/SKILL.md`
- Phase 4 Verification → run the full backend/frontend suites (Playwright if the US
  has E2E tasks); no dedicated agent.
- Phase 5 Security → `.claude/agents/security.md` +
  `.claude/skills/owasp-security-review/SKILL.md`
- Every implementation task uses `.claude/skills/implement-task/SKILL.md` +
  `.claude/skills/tdd-implementation/SKILL.md`.

## Scope modifiers (`$2`)

- `backend-only` — run phase 2 only and stop.
- `frontend-only` — run phase 3 only and stop.
- `security-only` — run phase 5 only and stop.


## Rules

- TDD obligatory in phases 2-3 and security fixes.
- Update workflow-state checkboxes in the backlog as phases complete.
- Phase 6 runs the inline closing checklist; on completion suggest
  `/archive-user-story $1`.
- Do not expand scope beyond `$1`.
