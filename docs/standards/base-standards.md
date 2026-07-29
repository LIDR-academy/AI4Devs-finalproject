---
description: Core development rules for Reading Analytics Platform (paths relative to docs/standards/).
alwaysApply: true
---

# Base development standards

This file mirrors [AGENTS.md](../../AGENTS.md) at the repository root. Cursor loads both; keep them aligned.

## Source of truth (precedence)

1. [PRD.md](../../PRD.md)
2. [readme.md](../../readme.md)
3. [user-stories.md](../product/user-stories.md), [use-cases.md](../product/use-cases.md)
4. `backend/src/`, `frontend/src/`
5. `docs/` (this documentation tree)
6. `openspec/`
7. `ai-specs/` (supporting only)

## Core principles

- Small tasks, one at a time
- TDD when tasks require new behavior
- Full TypeScript typing
- English for new technical artifacts
- Incremental, focused changes

## Specific standards

- [Backend standards](./backend-standards.md) — NestJS, TypeORM, catalog, JWT
- [Frontend standards](./frontend-standards.md) — Vite, React, API client
- [Documentation standards](./documentation-standards.md)
- [OpenSpec tasks mandatory steps](./openspec-tasks-mandatory-steps.md)

## Skills and OpenSpec

- Skills: `ai-specs/skills/` (symlinked under `.cursor/skills/`)
- OpenSpec config: `openspec/config.yaml`
- Post-apply: update change specs before code fixes (see AGENTS.md §8)
