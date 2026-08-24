## Why

There is no runnable code yet — only documentation. Every other change (ERP gateway, auth, clients, etc.) needs a place to live: a Django+DRF backend, a React+Vite frontend, a local PostgreSQL, and basic CI. Without this scaffold nothing else can be implemented or tested.

## What Changes

- Create `backend/` Django project with DRF installed, project settings split for env-based config (`.env`), and an empty `core` app for cross-cutting settings.
- Create `frontend/` React + Vite SPA skeleton with routing, an HTTP client with a JWT-attach interceptor placeholder, and base UI components (button, select, table, badge).
- Add `docker-compose.yml` running PostgreSQL + backend for local development.
- Add CI workflow: backend lint (`ruff`) + `pytest`, frontend lint (`eslint`) + build.
- Add `.env.example` documenting all environment variables referenced by the redefined connectivity spec (`ERP_MODE`, `ADMIN_API_URL`, `PEOPLE_API_URL`, `DATABASE_URL`, `SECRET_KEY`, JWT settings).

## Capabilities

### New Capabilities
- `project-scaffold`: The runnable skeleton (backend, frontend, local infra, CI) that all other capabilities are built on top of. No business behavior; verified by "it boots" scenarios.

### Modified Capabilities
<!-- None. Greenfield. -->

## Impact

- **New code:** `backend/` (Django project + `core` app + `manage.py`), `frontend/` (Vite + React app), `docker-compose.yml`, `.github/workflows/ci.yml` (or equivalent), `.env.example`.
- **Dependencies:** Django, djangorestframework, djangorestframework-simplejwt, psycopg, python-dotenv on backend; react, react-router, vite, a lightweight HTTP client (axios or fetch wrapper) on frontend.
- **Downstream:** every subsequent change (`add-erp-gateway`, `add-auth-rbac`, ...) assumes this scaffold exists at `backend/` and `frontend/`.
- **Docs:** matches the file structure documented in `readme.md` §2.3.
