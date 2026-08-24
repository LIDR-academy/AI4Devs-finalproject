## 1. Backend scaffold

- [x] 1.1 Create `backend/` Django project (`django-admin startproject core .`) with DRF, `simplejwt`, `psycopg`, `python-dotenv` installed
- [x] 1.2 Split settings to read `SECRET_KEY`, `DATABASE_URL`, `DEBUG`, `ALLOWED_HOSTS`, `ERP_MODE`, `ADMIN_API_URL`, `PEOPLE_API_URL` from environment
- [x] 1.3 Add `GET /api/health` endpoint checking DB connectivity
- [x] 1.4 Add `requirements.txt` / `pyproject.toml` and a `ruff` config
- [x] 1.5 Add `pytest` + `pytest-django` config and one smoke test for `/api/health`

## 2. Frontend scaffold

- [x] 2.1 Create `frontend/` with Vite + React (TypeScript) template
- [x] 2.2 Add `react-router` with a root route and a placeholder page
- [x] 2.3 Add an HTTP client wrapper (`src/services/httpClient.ts`) with a single interceptor point for future JWT attachment
- [x] 2.4 Add base UI components: `Button`, `Select`, `Table`, `Badge` (minimal, unstyled-or-lightly-styled)
- [x] 2.5 Add `eslint` + `prettier` config
- [x] 2.6 Wire root page to call `/api/health` and show status

## 3. Local infrastructure

- [x] 3.1 Write `docker-compose.yml` with `db` (postgres) and `backend` services
- [x] 3.2 Write `.env.example` with every variable from the connectivity spec (placeholders only)
- [x] 3.3 Add `.gitignore` entries for `.env`, `node_modules/`, `__pycache__/`, `dist/`
- [x] 3.4 Verify `docker-compose up` boots db + backend and `/api/health` returns 200

## 4. CI

- [x] 4.1 Add backend CI job: install deps, `ruff check`, `pytest`
- [x] 4.2 Add frontend CI job: install deps, `eslint`, `npm run build`
- [x] 4.3 Confirm both jobs run on push/PR and fail on introduced errors

## 5. Verification

- [x] 5.1 Confirm directory layout matches `readme.md` §2.3 (adjusted for what actually exists at this stage)
- [x] 5.2 Update `docs/plan-implementacion.md` status table if needed
