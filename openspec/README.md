# OpenSpec — Reading Analytics Platform

OpenSpec manages **incremental change specs** for this repo. It supports AI-assisted implementation but does **not** replace product documentation.

## Precedence

Before writing or implementing OpenSpec artifacts, read:

1. [PRD.md](../PRD.md)
2. [readme.md](../readme.md)
3. [docs/product/use-cases.md](../docs/product/use-cases.md) / [docs/product/user-stories.md](../docs/product/user-stories.md)

OpenSpec deltas must align with UC IDs and MVP scope from those documents. If a change contradicts the PRD, stop and clarify with the user.

## Layout

```
openspec/
├── config.yaml          # Context and rules for artifact generation
├── specs/               # Main (published) capability specs
│   ├── book-create/
│   ├── catalog-search/
│   ├── add-book-ui/
│   └── ...
└── changes/             # Active and archived change folders
    └── archive/         # Completed changes (e.g. KAN-9)
```

## Stack (implementation)

- **Backend:** NestJS, TypeORM, PostgreSQL — `backend/src/`
- **Frontend:** React, Vite — `frontend/src/`
- **Contracts:** [docs/api-spec.yml](../docs/api-spec.yml), [docs/data-model.md](../docs/data-model.md)

## Workflow (Cursor)

| Step | Command / skill |
|------|------------------|
| Optional refine ticket | `enrich-us` (ai-specs) |
| New change | `/opsx-propose` or OpenSpec `ff` |
| Implement | `/opsx-apply` |
| Verify | `/opsx-verify` or manual steps in `tasks.md` |
| Archive | `/opsx-archive` |

See [docs/standards/openspec-tasks-mandatory-steps.md](../docs/standards/openspec-tasks-mandatory-steps.md) for required `tasks.md` steps.

## Jira

Ticket keys use prefix **KAN-*** (e.g. KAN-9). Link the key in `proposal.md` and `tasks.md`.

## Current capabilities (examples)

Specs under `openspec/specs/` describe shipped or agreed behavior for add-book, catalog search, edition covers, and Book Tracker UI. Archived changes under `changes/archive/` retain design notes and manual test checklists.
