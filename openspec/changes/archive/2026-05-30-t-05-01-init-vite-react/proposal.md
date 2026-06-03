# Proposal — T-05-01 · Inicializar proyecto Vite con React y TypeScript

**Ticket:** T-05-01  
**User Story:** US-05 — Scaffold del frontend: Vite + React + TypeScript + Tailwind + shadcn/ui  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

El desarrollo de UI de ConRutina requiere un scaffold Vite + React + TypeScript que arranque en `:5173`, compile sin errores y reenvíe peticiones `/api` al backend Express. El backlog marca este ticket como pendiente, pero el repositorio ya contiene un frontend funcional con Vite configurado en la raíz; este change audita el estado real, cierra brechas respecto al DoD de T-05-01 y formaliza el contrato OpenSpec sin reescribir lo que ya cumple.

## What Changes

- Verificar y, si falta algo, completar `frontend/index.html` como entry point SPA con `lang="es"`.
- Verificar y, si falta algo, completar `frontend/src/main.tsx` montando `<App />` en `#root`.
- Auditar `vite.config.ts` en la raíz: `root: "frontend"`, alias `@` → `frontend/src`, plugin React, proxy `/api` → `http://localhost:3001`.
- Confirmar scripts raíz `npm run dev` (Vite en `:5173`) y `npm run build` (salida en `frontend/dist/`).
- Verificar `frontend/tsconfig.json` y resolución de paths `@/*` coherente con Vite y el tsconfig raíz.
- Documentar el estado actual vs DoD en design.md; no introducir Tailwind, shadcn ni estructura de capas (tickets T-05-02 a T-05-04).

## Capabilities

### New Capabilities

- `vite-react-scaffold`: Entry point HTML/TSX, configuración Vite en raíz (root, alias, proxy), scripts de desarrollo y build de producción para la SPA React+TypeScript.

### Modified Capabilities

_(Ninguna — no existen specs previas en `openspec/specs/` para el scaffold frontend.)_

## Impact

- **Raíz:** `vite.config.ts`, `package.json` (scripts `dev:web`, `dev`, `build`).
- **Frontend:** `frontend/index.html`, `frontend/src/main.tsx`, `frontend/tsconfig.json`.
- **Dependencias:** `vite`, `@vitejs/plugin-react`, `react`, `react-dom`, `@types/react`, `@types/react-dom` (ya presentes en el monorepo raíz).
- **Sin impacto** en lógica de negocio backend, modelos Prisma ni componentes UI más allá de verificar que el arranque y el build no regresionan.

## Non-goals

- Instalar o configurar Tailwind CSS v4 y tema ConRutina (T-05-02).
- Instalar shadcn/ui y primitivos Radix (T-05-03).
- Crear estructura de capas frontend (`domain/`, `application/`, etc.) y `App.tsx` base (T-05-04).
- Tests unitarios de tooling Vite (el ticket indica verificación con `npm run dev` / `npm run build`).
- Refactor del monorepo a `frontend/package.json` separado.

## Criterios de aceptación (US-05 — alcance T-05-01)

Este ticket cubre parcialmente la US-05. Escenarios Gherkin aplicables:

| Escenario US-05 | Aplicabilidad en T-05-01 |
|-----------------|---------------------------|
| Scenario 1 — SPA arranca: `npm run dev` en `:5173` sin errores | **In scope** — objetivo principal |
| Scenario 2 — Proxy a la API: `fetch('/api/health')` reenviado a `:3001` | **In scope** — verificar proxy en `vite.config.ts` |
| Scenario 3 — Tailwind y tema | **Fuera de scope** — T-05-02 |
| Scenario 4 — Componentes shadcn/ui | **Fuera de scope** — T-05-03 |
| Scenario 5 — Estructura de capas frontend | **Fuera de scope** — T-05-04 |
| Scenario 6 — Build de producción: `npm run build` → `frontend/dist/` | **In scope** — verificar build sin errores TS |
