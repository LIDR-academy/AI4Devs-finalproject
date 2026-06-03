# Proposal — T-04-02 · Implementar middleware de manejo global de errores

**Ticket:** T-04-02  
**User Story:** US-04 — Scaffold del backend: Express con arquitectura limpia  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

Tras T-04-01 el servidor Express expone `/health` y `/api/profile`, pero los errores se manejan de forma ad hoc en cada ruta (`try/catch` con JSON `{ error: "..." }` y códigos inconsistentes). Sin un middleware global, los tickets de API (US-06, US-07, US-19) no pueden devolver el contrato unificado `{ code, message, details? }`, ni cumplir US-04 escenario 4 (500 genérico sin stack en producción) ni US-06 escenario 4 (fallos de BD sin detalles de infraestructura).

## What Changes

- Definir clases de error de dominio/aplicación discriminables: `ValidationError`, `NotFoundError`, `ConflictError`, `UnprocessableError` (con `code`, `message`, `details?` opcional).
- Implementar `errorHandler` en `backend/src/presentation/http/middleware/errorHandler.ts` y registrarlo como **último** middleware en `createApp.ts`.
- Mapear errores tipados a HTTP: 400 / 404 / 409 / 422; errores no reconocidos → 500 `{ code: "INTERNAL_ERROR", message: "Error interno del servidor" }`.
- Incluir `stack` en la respuesta JSON solo cuando `NODE_ENV !== "production"` (desarrollo/test).
- Añadir tests unitarios Vitest `errorHandler.test.ts` (mapeo, formato, entornos).
- Refactor mínimo de `GET /api/profile` para propagar errores con `next(error)` en lugar de respuestas 500 locales (habilita el handler en la ruta existente sin cambiar el contrato de éxito).
- Actualizar `docs/backend-standards.md` y `docs/api-spec.yml` con el esquema de error estándar `{ code, message, details?, stack? }`.
- **Estado actual:** existe `presentation/http/middleware/` (placeholder T-04-01); `createApp.ts` maneja errores inline en `/api/profile`; no hay clases de error ni `errorHandler`.

## Capabilities

### New Capabilities

- `global-error-handler`: Middleware Express de errores, tipos de error discriminados, mapeo HTTP y comportamiento según `NODE_ENV`.

### Modified Capabilities

_(Ninguna — `express-layer-scaffold` no cambia requisitos normativos; solo se integra el handler en la composición HTTP.)_

## Impact

- **Backend / dominio:** nuevo módulo de errores (p. ej. `backend/src/domain/errors/`).
- **Backend / presentación:** `middleware/errorHandler.ts`, registro en `createApp.ts`, posible helper `asyncHandler` para rutas async en Express 4.
- **Backend / rutas:** ajuste mínimo en handler de `/api/profile`.
- **Tests:** `backend/src/presentation/http/middleware/errorHandler.test.ts`.
- **Documentación:** `docs/backend-standards.md`, `docs/api-spec.yml`.
- **Dependencias previas:** T-04-01 ✅ (scaffold Express).
- **Tickets posteriores:** T-04-03 (config Zod), T-06-01+ (casos de uso que lanzan `NotFoundError`, etc.), T-07-xx (`validateBody` → `ValidationError`).

## Non-goals

- Middleware `validateBody` con Zod (ticket posterior).
- Validación de variables de entorno en `config.ts` (T-04-03).
- Migrar todos los endpoints futuros a errores tipados (solo la base y la ruta de perfil existente).
- Cambiar el payload de éxito de `GET /api/profile` ni implementar `USER_NOT_FOUND` estructurado (T-06-01).
- Headers de seguridad (helmet).
- Tests de integración E2E del frontend (US-19 escenarios de toast).
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-04-02)

| Origen | Escenario | Aplicabilidad en T-04-02 |
|--------|-----------|---------------------------|
| US-04 | Scenario 4 — Manejo global de errores | **Completo** — 500 `INTERNAL_ERROR`, sin `stack` en producción |
| US-06 | Scenario 4 — Fallo de BD | **Base** — errores genéricos → 500 sin detalles de infra en producción |
| US-19 | Scenario 2 — Validación backend 400 con `details` | **Base** — `ValidationError` → 400 con `details` (tests unitarios; endpoints POST en tickets posteriores) |
| US-19 | Scenario 4 — 422 `INSUFFICIENT_POINTS` | **Base** — `UnprocessableError` → 422 (mapeo en handler; lógica de canje fuera de alcance) |
