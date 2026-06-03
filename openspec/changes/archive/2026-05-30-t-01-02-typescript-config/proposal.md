# Proposal — T-01-02 · Configurar TypeScript con paths y tsconfig estricto

**Ticket:** T-01-02  
**User Story:** US-01 — Configurar repositorio, herramientas de desarrollo y estructura del proyecto  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

Tras T-01-01 el monorepo arranca correctamente, pero la configuración TypeScript sigue siendo un único `tsconfig.json` en la raíz que mezcla opciones de frontend y backend. Separar la configuración en base + subproyectos con `strict` y paths `@/*` garantiza comprobación de tipos coherente para cada capa, alinea el repo con el DoD del backlog y habilita `tsc --noEmit` como gate de calidad antes de ESLint (T-01-03).

## What Changes

- Refactorizar `tsconfig.json` raíz como configuración base compartida (`strict`, `esModuleInterop`, `moduleResolution: bundler`, paths `@/*` → `frontend/src/*`).
- Crear `frontend/tsconfig.json` que extiende la raíz e incluye `jsx: react-jsx` y el ámbito `frontend/src`.
- Crear `backend/tsconfig.json` que extiende la raíz con `target: ES2022` y módulo adecuado al runtime (`tsx`/Node).
- Añadir referencias entre configs (raíz referencia frontend y backend) para que IDEs y `tsc -b` resuelvan el grafo correctamente.
- Añadir script `typecheck` (o equivalente) en `package.json` raíz que ejecute `tsc --noEmit` sobre los scaffolds actuales.
- Instalar `typescript` como `devDependency` explícita si aún no está declarada (requerida para `tsc --noEmit`).

## Capabilities

### New Capabilities

- `typescript-config`: Configuración TypeScript estricta en monorepo con tsconfig raíz + frontend + backend, paths `@/*` y verificación `tsc --noEmit` sin errores.

### Modified Capabilities

_(Ninguna — no se alteran requisitos de `monorepo-scaffold`; solo se completa el ítem de tsconfig referenciado en US-01 Scenario 2.)_

## Impact

- **Raíz:** `tsconfig.json`, posible `package.json` (script `typecheck`, devDependency `typescript`).
- **Frontend:** nuevo `frontend/tsconfig.json`; Vite ya define alias `@` en `vite.config.ts` — debe mantenerse alineado con paths TS.
- **Backend:** nuevo `backend/tsconfig.json`; `tsx watch backend/src/main.ts` y compilación implícita de Vite no cambian de runtime.
- **Sin impacto** en lógica de negocio, API, modelos de datos ni UI más allá de corregir posibles errores de tipos revelados por `strict`.

## Non-goals

- ESLint, Prettier y `.editorconfig` (T-01-03).
- Variables de entorno en `.env.example` (T-01-04).
- Migrar a project references con build emit (`composite: true`) o paquetes npm separados por subproyecto.
- Refactor de imports existentes más allá de lo necesario para que `tsc --noEmit` pase.
- Configuración de Vitest/tsconfig para tests (fuera del DoD explícito del ticket).

## Criterios de aceptación (US-01 — alcance T-01-02)

Este ticket cubre parcialmente la US-01. Escenarios Gherkin aplicables:

| Escenario US-01 | Aplicabilidad en T-01-02 |
|-----------------|---------------------------|
| Scenario 1 — Happy path: `npm install` + `npm run dev` | **Verificación indirecta** — no debe regresionar tras el cambio de tsconfig |
| Scenario 2 — Estructura: `tsconfig.json` en la raíz con paths configurados | **In scope** — objetivo principal |
| Scenario 3 — Linting funcional | **Fuera de scope** — T-01-03 |
| Scenario 4 — Edge case `.env` faltante | **Fuera de scope** — T-01-04 / backend config |
