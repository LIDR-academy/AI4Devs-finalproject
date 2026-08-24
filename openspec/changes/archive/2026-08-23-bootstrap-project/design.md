## Context

Greenfield repository — currently only markdown docs exist. This change lays down the skeleton every later change depends on. No business logic, no ERP calls yet (that's `add-erp-gateway`, built next on top of this).

## Goals / Non-Goals

**Goals:**
- A backend and frontend that boot locally and in CI with zero manual steps beyond `.env` + `docker-compose up`.
- File layout matching `readme.md` §2.3 so later changes drop code into predictable places.
- Environment-driven config from day one (no hardcoded secrets, no settings that block introducing `ERP_MODE` later).

**Non-Goals:**
- Any authentication, business domain model, or ERP integration (separate changes).
- Production deployment automation (that's `harden-and-deploy`, F10).
- Styling/design system depth — base components are placeholders only.

## Decisions

- **Django apps by domain, services outside apps.** Matches the documented structure (`apps/accounts`, `apps/clientes`, ... plus `services/`). Only `core` (settings/middleware) exists in this change; domain apps are created by the changes that need them, to avoid empty scaffolcolumn debt.
- **`django-environ` or plain `os.environ` + `python-dotenv`** for settings — kept minimal; no need for a heavier config framework at this stage.
- **Vite + React with `react-router` and a thin `fetch`/`axios` wrapper**, not a full state-management library yet — added when a module actually needs shared state (e.g., reporting engine).
- **`docker-compose` with two services (db, backend) only.** Frontend runs via `npm run dev` on the host during development; containerizing the frontend is deferred to deployment (F10).
- **CI as two independent jobs** (backend, frontend) so a frontend-only or backend-only PR isn't blocked by the other stack's setup.

## Risks / Trade-offs

- **Scaffold drifts from the documented file structure as real modules land** → each subsequent change's tasks include "confirm layout matches `readme.md` §2.3", already present in `add-erp-gateway` tasks.
- **Empty domain apps aren't created here** → slightly more setup work in later changes, but avoids maintaining unused Django apps with no models.
- **No frontend container yet** → acceptable for local dev; addressed explicitly in `harden-and-deploy`.

## Migration Plan

N/A — first commit of runnable code, nothing to migrate. Rollback is simply not merging.

## Open Questions

- Exact Python/Node pin versions for CI (use what's locally available: Python 3.14, Node 25, unless the team specifies LTS targets later).
