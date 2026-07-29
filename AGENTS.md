---
description: Development rules and agent guidance for Reading Analytics Platform (Cursor and other AI tools).
alwaysApply: true
---

# Reading Analytics Platform — Agent Rules

## 0. Source of truth (precedence)

When product behavior, scope, or UX conflict with templates in `ai-specs/` or `openspec/`, **follow the project documentation first**, in this order:

1. **[PRD.md](./PRD.md)** — product vision, MVP scope, personas, functional areas
2. **[readme.md](./readme.md)** — delivery index, architecture, data model summary, API overview, install notes
3. **[docs/product/](./docs/product/)** — [user-stories.md](./docs/product/user-stories.md), [use-cases.md](./docs/product/use-cases.md) (UC-01…UC-10)
4. **Implemented code** — `backend/src/`, `frontend/src/`
5. **[docs/](./docs/)** — contracts (`api-spec.yml`, `data-model.md`), [standards/](./docs/standards/), [development_guide.md](./docs/development_guide.md)
6. **`openspec/`** — change-scoped specs and tasks (must not contradict 1–4)
7. **`ai-specs/`** — optional workflows, planning agents, and skills (supporting material only)

All project documentation lives under **`docs/`** (product + engineering). `ai-specs/` and `openspec/` were added externally to assist development; they do not override the PRD or `docs/product/`.

## 1. Core principles

- **Small tasks, one at a time**: Baby steps; do not skip ahead.
- **Test-Driven Development**: Start with failing tests when tasks require new behavior.
- **Type safety**: Fully typed TypeScript in backend and frontend.
- **Clear naming**: Descriptive names; English only (see §2).
- **Incremental changes**: Focused, reviewable diffs.
- **Question assumptions**: Validate against PRD and use cases before inventing features.

## 2. Language standards

**English only** for code, comments, logs, API errors, OpenSpec artifacts, `docs/`, commit messages, and tests.

Product docs (`PRD.md`, `readme.md`, `docs/product/`) may stay in Spanish where already written; **new technical artifacts** added by agents should be in English unless the user asks otherwise.

## 3. Stack and repository layout

| Layer | Technology | Path |
|-------|------------|------|
| Backend | NestJS 11, TypeORM, PostgreSQL, Jest | `backend/src/` |
| Frontend | React 19, Vite, TanStack Query, React Router | `frontend/src/` |
| API | REST `/v1`, JWT | `docs/api-spec.yml` |
| Database | Users, books, reading_records | `docs/data-model.md` |
| Local DB | Docker Compose Postgres (port **5433**) | `docker-compose.yml` |

## 4. Documentation (`docs/`)

Index: [docs/README.md](./docs/README.md).

- [docs/standards/base-standards.md](./docs/standards/base-standards.md) — same rules as this file
- [docs/standards/backend-standards.md](./docs/standards/backend-standards.md) — NestJS, TypeORM, catalog, auth
- [docs/standards/frontend-standards.md](./docs/standards/frontend-standards.md) — Vite, React, `frontend/src/api/`
- [docs/standards/documentation-standards.md](./docs/standards/documentation-standards.md) — how to maintain docs
- [docs/development_guide.md](./docs/development_guide.md) — local setup and scripts
- [docs/standards/openspec-tasks-mandatory-steps.md](./docs/standards/openspec-tasks-mandatory-steps.md) — checklist for OpenSpec `tasks.md`

Keep `docs/api-spec.yml` and `docs/data-model.md` in sync with code when APIs or schema change.

## 5. OpenSpec (`openspec/`)

Use OpenSpec for **scoped changes** (features, fixes with specs). See [openspec/README.md](./openspec/README.md) and [openspec/config.yaml](./openspec/config.yaml).

- Active work: `openspec/changes/<change-name>/`
- Published capabilities: `openspec/specs/<capability>/spec.md`
- Jira keys: `KAN-*` when linking tickets

**After `/apply` and before `/archive`:** update change artifacts (specs, `tasks.md`) before code-only fixes — see §7.

Cursor commands: `.cursor/commands/opsx-*.md` and `.cursor/skills/openspec-*`.

## 6. AI specs (`ai-specs/`)

Optional helpers; canonical copy under `ai-specs/skills/`, exposed in Cursor via symlinks in `.cursor/skills/`.

- Index: [ai-specs/README.md](./ai-specs/README.md)
- Planning agents (plans only, no implementation): `ai-specs/agents/`
- Useful skills: `enrich-us`, `commit`, `using-git-worktrees`, `code-auditing`, `sync-agent-symlinks`

When a skill matches the request, load its `SKILL.md` before continuing.

**Planning output in Cursor:** prefer `openspec/changes/<change>/` (proposal, design, tasks) or a short plan in the PR description — not `.claude/doc/` paths (Claude Code only).

**Planning quality:** for OpenSpec propose/ff/continue and `enrich-us`, use the highest reasoning model available in the session.

## 7. Symlinks (Cursor)

- Skills: `ai-specs/skills/<name>` → `.cursor/skills/<name>`
- Do not duplicate skill content; run **`sync-agent-symlinks`** after adding or renaming skills
- Leave real directories in `.cursor/skills/` untouched (e.g. `openspec-apply-change`)

## 8. Post-apply changes (OpenSpec)

When a fix is requested after `opsx:apply` and before `opsx:archive`:

1. Update affected change specs and `tasks.md`
2. Regenerate artifacts if needed (`opsx:continue` / `opsx:ff`)
3. Implement only after specs reflect the request
4. Verify, then archive

No silent code-only fixes in that window.
