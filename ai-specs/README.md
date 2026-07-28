# AI Specs — Reading Analytics Platform

Supporting configuration for AI-assisted development in **Cursor**. Product and scope are defined in **[PRD.md](../PRD.md)**, **[readme.md](../readme.md)**, and **[docs/product/](../docs/product/)** — those take precedence over this folder.

## When to use `ai-specs/`

| Use | Do not use |
|-----|------------|
| Optional skills (`enrich-us`, `commit`, …) | Product requirements (use PRD / use cases) |
| Planning agents (implementation **plans** only) | API contracts (use `docs/api-spec.yml`) |
| Specboot / OpenSpec workflow notes | Data model truth (use `docs/data-model.md` + code) |

## Project map

| Area | Location |
|------|----------|
| Product | `PRD.md`, `readme.md`, `docs/product/user-stories.md`, `docs/product/use-cases.md` |
| Engineering | `docs/standards/backend-standards.md`, `docs/standards/frontend-standards.md`, `docs/api-spec.yml` |
| Agent rules | `AGENTS.md` (root) |
| OpenSpec | `openspec/config.yaml`, `openspec/changes/`, `openspec/specs/` |
| Backend | NestJS + TypeORM — `backend/src/` |
| Frontend | Vite + React — `frontend/src/` |

**Stack:** TypeScript, NestJS 11, TypeORM, PostgreSQL, React 19, Vite, TanStack Query. Catalog: Open Library, Google Books.

**Jira:** `KAN-*` (Atlassian MCP: `user-atlassian` in Cursor).

## Structure

```
ai-specs/
├── README.md
├── specboot-instructions.md   # Setup reference (Specboot template)
├── agents/                    # Planning-only role prompts
├── queues/                    # KAN pipeline queue + state (kan-pipeline skill)
└── skills/                    # Canonical skills (symlink → .cursor/skills/)
```

## Agents

| Agent | Use when |
|-------|----------|
| `backend-developer` | NestJS modules, TypeORM, catalog, JWT |
| `frontend-developer` | React pages, `frontend/src/api/`, Book Tracker UI |
| `product-strategy-analyst` | Ideation aligned with PRD (not replacing use cases) |

**Output location (Cursor):** `openspec/changes/<change>/` (proposal, design, tasks) or PR notes — not `.claude/doc/`.

## Skills

| Skill | Purpose |
|-------|---------|
| `enrich-us` | Refine `KAN-*` or pasted tickets before OpenSpec |
| `sync-agent-symlinks` | Sync `ai-specs/skills` → `.cursor/skills` |
| `using-git-worktrees` | Isolated branch before large changes |
| `commit` | Focused commits and PRs |
| `kan-pipeline` | Full ticket lifecycle: enrich → propose → apply → PR/merge → archive (see `ai-specs/queues/`) |
| `code-auditing` | Quality / security audit |
| `adversarial-review` | Pre-archive review |

OpenSpec Cursor commands: `.cursor/skills/openspec-*` (not under `ai-specs/`).

## Cursor setup

- Rules: [AGENTS.md](../AGENTS.md) and [.cursor/rules/](../.cursor/rules/)
- Skills: symlinks from `.cursor/skills/<name>` → `../../ai-specs/skills/<name>`
- Run **`sync-agent-symlinks`** after adding or renaming a skill

## Specboot

See [specboot-instructions.md](./specboot-instructions.md) for OpenSpec install and workflow. This project uses **`AGENTS.md`** at the repo root (not `CLAUDE.md`).
