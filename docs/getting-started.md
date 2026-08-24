# Getting started — EyeMaster V2

This is the practical run guide. For the product/architecture documentation
see `readme.md` (official delivery) and `documentacion-funcional.md`
(expanded analysis).

## Prerequisites

- Python 3.12+
- Node.js 20+
- Docker (optional, for `docker-compose`) — without it, the backend falls
  back to a local SQLite database

## 1. Environment variables

```bash
cp .env.example .env
```

Defaults work out of the box: `ERP_MODE=mock` simulates the ERP webservices
with local fixtures, so no ADMIN/PEOPLE credentials are needed to run or
demo the app.

## 2. Backend

```bash
cd backend
python3 -m venv .venv
./.venv/bin/pip install -r requirements-dev.txt
./.venv/bin/python manage.py migrate
```

Create the first administrator (idempotent, safe to skip if one exists):

```bash
ADMIN_BOOTSTRAP_EMAIL=admin@example.com \
ADMIN_BOOTSTRAP_PASSWORD='change-me' \
./.venv/bin/python manage.py bootstrap_admin
```

Run the API:

```bash
./.venv/bin/python manage.py runserver
```

Health check: `curl http://localhost:8000/api/health`

### Or with Docker Compose

```bash
docker-compose up
```

Starts PostgreSQL + the backend together, reading `.env` for configuration.

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL defaults to http://localhost:8000
npm run dev
```

Open the printed local URL and log in with the bootstrap administrator.

## 4. Tests

Backend:

```bash
cd backend
SECRET_KEY=test ./.venv/bin/pytest
./.venv/bin/ruff check .
```

Frontend:

```bash
cd frontend
npm run lint
npm run test
npm run build
```

## 5. What's simulated vs. real

- `ERP_MODE=mock` (default): all ERP data (companies, plans, payments,
  client catalog) comes from JSON fixtures in `backend/services/erp/fixtures/`.
  No network access to the organization is required.
- `ERP_MODE=real`: requires `ADMIN_API_URL`/`ADMIN_API_TOKEN` and
  `PEOPLE_API_URL`/`PEOPLE_API_TOKEN` to be set; the app fails fast at
  startup otherwise. See `backend/services/erp/CONTRACT.md` for the
  assumed request/response shapes.

## Next steps

- `docs/deployment.md` — how to take this to a real hosting environment.
- `docs/plan-implementacion.md` — the implementation roadmap and its
  OpenSpec-tracked status.
