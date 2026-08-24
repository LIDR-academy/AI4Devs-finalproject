## ADDED Requirements

### Requirement: Backend boots with health check

The system SHALL provide a Django + DRF backend that starts successfully against a PostgreSQL database and exposes a health endpoint.

#### Scenario: Health endpoint responds

- **WHEN** the backend is running and a client calls `GET /api/health`
- **THEN** the response is `200` with a JSON body confirming the service and database are reachable

#### Scenario: Settings load from environment

- **WHEN** the backend starts
- **THEN** `SECRET_KEY`, `DATABASE_URL`, and JWT settings are read from environment variables, not hardcoded

### Requirement: Frontend boots and reaches the backend

The system SHALL provide a React + Vite SPA that builds, runs in dev mode, and can call the backend health endpoint.

#### Scenario: Dev server serves the app

- **WHEN** the frontend dev server starts
- **THEN** the root route renders without runtime errors

#### Scenario: Production build succeeds

- **WHEN** `npm run build` runs
- **THEN** it completes without errors and produces a `dist/` bundle

#### Scenario: HTTP client is JWT-ready

- **WHEN** the frontend HTTP client is inspected
- **THEN** it has a single place (interceptor) where an `Authorization: Bearer <jwt>` header is attached once auth exists

### Requirement: Local environment runs with one command

The system SHALL provide a `docker-compose.yml` that starts PostgreSQL and the backend together for local development.

#### Scenario: Compose up succeeds

- **WHEN** `docker-compose up` runs from a clean checkout with `.env` populated from `.env.example`
- **THEN** the database and backend containers start and the health endpoint becomes reachable

### Requirement: CI validates both apps

The system SHALL run backend lint + tests and frontend lint + build on every push, so regressions are caught before merge.

#### Scenario: Backend CI job

- **WHEN** a change touches `backend/`
- **THEN** CI runs lint and `pytest` and fails the build on any error

#### Scenario: Frontend CI job

- **WHEN** a change touches `frontend/`
- **THEN** CI runs lint and `npm run build` and fails the build on any error

### Requirement: Environment variables are documented and never committed

The system SHALL ship an `.env.example` listing every variable required by the redefined connectivity spec, and SHALL NOT commit real secrets.

#### Scenario: Example file is complete

- **WHEN** `.env.example` is inspected
- **THEN** it lists `DATABASE_URL`, `SECRET_KEY`, `ERP_MODE`, `ADMIN_API_URL`, `PEOPLE_API_URL`, and JWT-related settings with placeholder values

#### Scenario: No secrets in version control

- **WHEN** the repository is inspected
- **THEN** `.env` (with real values) is gitignored and absent from history
