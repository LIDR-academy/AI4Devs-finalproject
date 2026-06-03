# Proposal — T-02-01 · Docker Compose para PostgreSQL 16 con volumen persistente

**Ticket:** T-02-01  
**User Story:** US-02 — Configurar entorno de base de datos con Docker y PostgreSQL  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

ConRutina persiste datos en PostgreSQL; sin un entorno de BD reproducible por Docker, cada desarrollador debe instalar PostgreSQL manualmente y el equipo no garantiza la misma versión ni credenciales. US-02 exige PostgreSQL 16 levantable con un comando, con persistencia entre reinicios y variables desde `.env` (ya entregado en T-01-04). Este ticket cierra la capa de infraestructura de BD que desbloquea Prisma (US-03) y el arranque del API con conexión real.

## What Changes

- Ajustar o crear `docker-compose.yml` de desarrollo con servicio **`db`**, imagen `postgres:16-alpine`, variables `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` desde `.env`, puerto `${POSTGRES_PORT:-5432}` y volumen nombrado **`ConRutina_postgres_data`**.
- Configurar health check con `pg_isready -U ${POSTGRES_USER}`.
- Añadir scripts npm **`db:up`** (alias de `docker compose up -d db`) y **`db:down`** (detener el servicio `db`).
- Alinear documentación (`README.md`, `docs/development_guide.md`) con los nuevos nombres de servicio, volumen y scripts.
- **Nota sobre estado actual:** el repo ya incluye un `docker-compose.yml` con servicio `postgres`, volumen `conrutina_postgres_data` y scripts `docker:up` / `docker:down`; el apply debe converger al DoD del ticket sin scope creep.

## Capabilities

### New Capabilities

- `docker-postgres-dev`: Entorno PostgreSQL 16 de desarrollo vía Docker Compose — servicio `db`, persistencia, health check, scripts `db:up` / `db:down` y variables desde `.env`.

### Modified Capabilities

_(Ninguna — no se alteran requisitos normativos en `openspec/specs/`; `env-example` ya documenta las variables `POSTGRES_*` consumidas por este servicio.)_

## Impact

- **Raíz:** `docker-compose.yml`, `package.json` (scripts `db:up`, `db:down`).
- **Documentación:** `README.md`, `docs/development_guide.md` (referencias a `docker:up` → `db:up` donde aplique).
- **Runtime:** ningún cambio en código de aplicación; Prisma y el API consumen `DATABASE_URL` ya alineada con `.env.example`.
- **Dependencias:** Docker y Docker Compose en la máquina del desarrollador; fichero `.env` copiado desde `.env.example` (T-01-04).
- **Tickets posteriores:** T-03-01 (Prisma schema), T-03-02 (migraciones) requieren este entorno operativo.

## Non-goals

- Instalar o configurar Prisma, migraciones o seed (US-03 / T-03-xx).
- Definir esquema de tablas o modelos de dominio.
- Cambios en endpoints del API o frontend.
- Configuración de CI/CD, producción o orquestación distinta a desarrollo local.
- Eliminar scripts `docker:*` existentes salvo que el diseño acuerde mantenerlos como alias retrocompatibles (decisión en `design.md`).

## Criterios de aceptación (US-02 — alcance T-02-01)

| Escenario Gherkin | Aplicabilidad en T-02-01 |
|-------------------|---------------------------|
| Scenario 1 — Happy path: `docker compose up -d db`, PostgreSQL 16, `pg_isready`, persistencia | **Completo** — objetivo principal del ticket |
| Scenario 2 — Variables de entorno desde `.env`, sin hardcode en compose | **Completo** — credenciales vía `${POSTGRES_*}` |
| Scenario 3 — Edge case: puerto ocupado, `POSTGRES_PORT` alternativo | **Completo** — mapeo `${POSTGRES_PORT:-5432}:5432` y mensaje Docker visible |
