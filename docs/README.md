# Documentation

Single documentation tree for **Reading Analytics Platform**.

## Layout

```text
docs/
├── product/                 # Product requirements (stories, use cases, diagrams)
│   ├── user-guide.md        # End-user guide (features + screenshot slots)
│   ├── user-stories.md
│   ├── use-cases.md
│   ├── screenshots/         # Images referenced by the user guide
│   └── diagrams/            # Architecture, ER, deployment, UC sequence diagrams
├── standards/               # Engineering conventions for agents and humans
│   ├── base-standards.md
│   ├── backend-standards.md
│   ├── frontend-standards.md
│   ├── documentation-standards.md
│   └── openspec-tasks-mandatory-steps.md
├── api-spec.yml             # OpenAPI REST contracts (/v1)
├── data-model.md            # PostgreSQL schema (implemented)
├── design-system-palette.md # PRD colors → CSS tokens
├── development_guide.md     # Local setup, scripts, troubleshooting
└── deployment.md            # Production URLs (Vercel + Render + Neon)
```

## Precedence

See [AGENTS.md](../AGENTS.md): `PRD.md` → `readme.md` → `docs/product/` → code → rest of `docs/` → `openspec/` → `ai-specs/`.

## Quick links

| Need | File |
|------|------|
| **User guide (features + screenshots)** | [product/user-guide.md](./product/user-guide.md) |
| Install locally | [development_guide.md](./development_guide.md) |
| **Production deploy** | [deployment.md](./deployment.md) |
| User stories | [product/user-stories.md](./product/user-stories.md) |
| Use cases UC-01…10 | [product/use-cases.md](./product/use-cases.md) |
| API contract | [api-spec.yml](./api-spec.yml) |
| Database schema | [data-model.md](./data-model.md) |
| Backend rules | [standards/backend-standards.md](./standards/backend-standards.md) |
| Frontend rules | [standards/frontend-standards.md](./standards/frontend-standards.md) |
