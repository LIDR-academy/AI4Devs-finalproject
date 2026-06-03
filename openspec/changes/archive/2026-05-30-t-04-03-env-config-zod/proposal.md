# Proposal — T-04-03 · Configurar validación de variables de entorno con Zod al arranque

**Ticket:** T-04-03  
**User Story:** US-04 — Scaffold del backend: Express con arquitectura limpia  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

Tras T-04-01 y T-04-02 el backend arranca leyendo `process.env` de forma ad hoc (`loadEnv.ts` + defaults dispersos en `main.ts` y `createApp.ts`). Si falta `DATABASE_URL` o hay valores inválidos, el proceso puede fallar tarde (Prisma, listen) con mensajes crípticos o excepciones no controladas. US-04 escenario 5 y US-01 escenario 4 exigen fallar al arranque con un mensaje claro; T-04-03 centraliza la validación en `config.ts` con Zod antes de cualquier otra lógica.

## What Changes

- Añadir dependencia `zod` al monorepo (raíz `package.json`).
- Crear `backend/src/config.ts` con schema Zod para `DATABASE_URL`, `API_PORT`, `CORS_ORIGIN` y `NODE_ENV` (defaults según DoD).
- Si `DATABASE_URL` falta o está vacía → `process.exit(1)` con mensaje: `"Variable obligatoria DATABASE_URL no definida. Ver .env.example"`.
- Importar `config.ts` en `main.ts` **antes** de Prisma, `createApp` y el resto del bootstrap (manteniendo `loadEnv.ts` como primer paso para cargar `.env`).
- Refactor mínimo en `main.ts` y `createApp.ts` para consumir valores tipados de `config` en lugar de leer `process.env` directamente.
- Crear tests unitarios Vitest `backend/src/config.test.ts` (happy path, obligatorias, enum `NODE_ENV`).
- Actualizar `docs/backend-standards.md` con el patrón `config.ts` + Zod.
- **Estado actual:** existe `loadEnv.ts` (dotenv); no hay `config.ts`; no hay `zod` instalado; `main.ts` usa `Number(process.env.API_PORT) || 3001`; `createApp.ts` usa `process.env.CORS_ORIGIN ?? 'http://localhost:5173'`.

## Capabilities

### New Capabilities

- `env-config-zod`: Validación tipada de variables de entorno al arranque del backend con Zod, salida controlada si faltan obligatorias y objeto `config` exportado para el resto del proceso.

### Modified Capabilities

_(Ninguna — no cambia requisitos normativos de `express-layer-scaffold` ni `env-example`; solo consume las variables ya documentadas en `.env.example`.)_

## Impact

- **Backend / infra:** nuevo módulo `backend/src/config.ts`; orden de imports en `main.ts`.
- **Backend / presentación:** `createApp.ts` puede recibir `corsOrigin` desde config o importar config (decisión en design).
- **Tests:** `backend/src/config.test.ts` (primera suite de config; alineada US-01 S4, US-04 S5).
- **Dependencias:** `zod` (nueva).
- **Documentación:** `docs/backend-standards.md` (sección variables de entorno).
- **Dependencias previas:** T-01-04 ✅ (`.env.example`), T-04-01 ✅ (scaffold Express), T-04-02 ✅ (error handler).
- **Tickets posteriores:** middleware `validateBody` con Zod (US-19), casos de uso que asumen config estable.

## Non-goals

- Validar variables de Docker (`POSTGRES_*`) en runtime del API — solo las consumidas por el backend según DoD.
- Middleware `validateBody` / validación de request bodies (tickets posteriores).
- Cambiar el contenido de `.env.example` salvo coherencia menor si hiciera falta (T-01-04 ya cubierto).
- Logger estructurado de configuración cargada.
- Hot-reload de variables en runtime.
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-04-03)

| Origen | Escenario | Aplicabilidad en T-04-03 |
|--------|-----------|---------------------------|
| US-04 | Scenario 5 — Validación de variables de entorno al arranque | **Completo** — fallo inmediato sin escuchar TCP si falta `DATABASE_URL` |
| US-01 | Scenario 4 — Edge case: .env faltante | **Completo** — mensaje claro, sin excepción no controlada |
| US-04 | Scenario 1 — Servidor arranca | **Regresión** — con `.env` válido el servidor sigue arrancando en `API_PORT` |
