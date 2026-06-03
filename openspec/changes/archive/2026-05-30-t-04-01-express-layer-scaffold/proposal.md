# Proposal — T-04-01 · Inicializar servidor Express con estructura de capas

**Ticket:** T-04-01  
**User Story:** US-04 — Scaffold del backend: Express con arquitectura limpia  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

Tras US-03 (Prisma, migración y seed) el repositorio dispone de persistencia y datos demo, pero el servidor HTTP aún no cumple el contrato mínimo de US-04: arranque formal con Prisma, middleware base (CORS + JSON), endpoint de salud y estructura de capas completa. Sin este scaffold, los tickets T-04-02 (error handler), T-04-03 (config Zod) y las APIs de Sprint 1 no tienen una base consistente ni testeable (`GET /health`).

## What Changes

- Alinear `backend/src/main.ts` con el DoD: instanciar `PrismaClient`, invocar `createApp(prisma)` y escuchar en `API_PORT` con log `"Server running on port {port}"`.
- Completar `backend/src/presentation/http/createApp.ts`: CORS desde `CORS_ORIGIN`, `express.json()`, ruta `GET /health` → `200 { status: "ok", timestamp: "<ISO>" }`.
- Garantizar directorios de Clean Architecture: `domain/`, `application/`, `application/ports/`, `infrastructure/`, `presentation/http/middleware/` (este último puede contener `.gitkeep` hasta T-04-02).
- Añadir script `npm run api` como alias de `tsx watch backend/src/main.ts` (DoD del ticket; conservar `dev:api` existente).
- Refactorizar la composición actual (`createApp({ userRepository })` + `GET /api/profile`) para que `createApp` reciba `PrismaClient` y monte rutas internamente, preservando el endpoint de perfil ya consumido por el frontend.
- Actualizar `docs/development_guide.md` y `docs/api-spec.yml` con el endpoint `/health`.
- **Estado actual:** existen `main.ts`, `createApp.ts`, capas parciales y `GET /api/profile`; faltan `/health`, body parser JSON, directorio `middleware/`, firma `createApp(prisma)` y script `npm run api`.

## Capabilities

### New Capabilities

- `express-layer-scaffold`: Servidor Express con Clean Architecture, middleware base (CORS + JSON), health check y arranque vía `npm run api` / `npm run dev:api`.

### Modified Capabilities

_(Ninguna — no cambian requisitos normativos de specs archivadas; solo scaffold HTTP.)_

## Impact

- **Backend / presentación:** `main.ts`, `createApp.ts`, nuevo directorio `presentation/http/middleware/`.
- **Backend / composición:** inyección de `PrismaClient` en lugar de repositorio suelto en la firma pública de `createApp`.
- **Scripts:** `package.json` — añadir `"api": "tsx watch backend/src/main.ts"`.
- **API:** nuevo endpoint `GET /health` (sin prefijo `/api`).
- **Documentación:** `docs/development_guide.md`, `docs/api-spec.yml`.
- **Dependencias previas:** T-01-01 (monorepo) ✅, T-02-01 (PostgreSQL) ✅, T-03-01/02/03 (Prisma + seed) ✅.
- **Tickets posteriores:** T-04-02 (error handler en `middleware/`), T-04-03 (config Zod), APIs Sprint 1.

## Non-goals

- Middleware global de errores (T-04-02).
- Validación Zod de variables de entorno en `config.ts` (T-04-03).
- Headers de seguridad avanzados (helmet) — US-04 esc. 3 los menciona pero no están en el DoD de T-04-01.
- Nuevos endpoints de negocio más allá de preservar `GET /api/profile` existente.
- Tests unitarios del scaffold (validación manual / smoke curl según ticket).
- Cambios en Prisma schema, migraciones o seed.
- Scaffold del frontend (US-05 / T-05-xx).

## Criterios de aceptación (US-04 — alcance T-04-01)

| Escenario Gherkin | Aplicabilidad en T-04-01 |
|-------------------|---------------------------|
| Scenario 1 — Servidor arranca | **Completo** — `npm run api`, log en puerto, `GET /health` → 200 `{ status: "ok" }` |
| Scenario 2 — Estructura de capas | **Completo** — directorios domain, application, application/ports, infrastructure, presentation |
| Scenario 3 — Middleware base | **Parcial** — CORS + JSON parser; headers de seguridad → fuera de DoD explícito |
| Scenario 4 — Manejo global de errores | **Fuera de alcance** — T-04-02 |
| Scenario 5 — Validación env al arranque | **Fuera de alcance** — T-04-03 |
