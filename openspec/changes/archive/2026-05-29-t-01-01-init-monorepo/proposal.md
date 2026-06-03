# Proposal — T-01-01 · Inicializar repositorio Git con estructura monorepo

**Ticket:** T-01-01  
**User Story:** US-01 — Configurar repositorio, herramientas de desarrollo y estructura del proyecto  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

ConRutina necesita una base de monorepo reproducible para que cualquier desarrollador clone el repositorio, instale dependencias y arranque frontend y backend con un único comando. El backlog describe un setup greenfield, pero el repositorio ya contiene código funcional; este change cierra las brechas respecto al DoD del ticket T-01-01 sin reescribir lo que ya cumple.

## What Changes

- Verificar y, si falta algo, completar la estructura de monorepo (`frontend/`, `backend/`, raíz con `package.json`, `LICENSE`, `README.md`).
- Asegurar que `.gitignore` excluya `node_modules/`, `dist/`, `.env`, `coverage/` y `*.local`.
- Ajustar el script raíz `dev` para arrancar **frontend y backend en paralelo** (p. ej. con `concurrently`), alineado con el happy path del ticket.
- Confirmar scripts raíz `build`, `test` y `lint` operativos sobre el scaffold actual.
- Mantener `pnpm-workspace.yaml` (o equivalente) declarando el workspace raíz.
- Documentar en `README.md` las secciones mínimas: descripción, requisitos, instalación y arranque.

## Capabilities

### New Capabilities

- `monorepo-scaffold`: Estructura Git/monorepo, `.gitignore`, scripts raíz (`dev`, `build`, `test`, `lint`), workspace y README mínimo para onboarding en < 10 minutos.

### Modified Capabilities

_(Ninguna — no existen specs previas en `openspec/specs/`.)_

## Impact

- **Raíz:** `package.json`, `.gitignore`, `pnpm-workspace.yaml`, `README.md`, `LICENSE`.
- **Dependencias:** posible adición de `concurrently` como devDependency para el script `dev`.
- **Sin impacto** en lógica de negocio, API, modelos de datos ni UI más allá de verificar que el arranque conjunto no rompe los procesos existentes (`vite` + `tsx watch backend/src/main.ts`).

## Non-goals

- Configuración de TypeScript estricto, paths y tsconfig (T-01-02).
- ESLint, Prettier y `.editorconfig` (T-01-03).
- Variables de entorno documentadas en `.env.example` (T-01-04).
- Docker Compose para PostgreSQL (T-02-01).
- Refactor del layout de paquetes npm/pnpm más allá del workspace mínimo ya presente.

## Criterios de aceptación (US-01 — alcance T-01-01)

Este ticket cubre parcialmente la US-01. Escenarios Gherkin aplicables:

| Escenario US-01 | Aplicabilidad en T-01-01 |
|-----------------|---------------------------|
| Scenario 1 — Happy path: `npm install` + `npm run dev` arranca frontend y backend | **In scope** — objetivo principal |
| Scenario 2 — Estructura: `frontend/`, `backend/`, scripts y `.gitignore` | **In scope** — verificar/completar (tsconfig queda para T-01-02) |
| Scenario 3 — Linting funcional | **Fuera de scope** — T-01-03 |
| Scenario 4 — Edge case `.env` faltante | **Fuera de scope** — T-01-04 / backend config |
