# Proposal — T-05-02 · Instalar y configurar Tailwind CSS v4 con tema ConRutina

**Ticket:** T-05-02  
**User Story:** US-05 — Scaffold del frontend: Vite + React + TypeScript + Tailwind + shadcn/ui  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

ConRutina necesita un sistema de estilos coherente basado en Tailwind CSS v4 con la paleta de producto (primario, estados de hábito, fondos y superficies) definida como variables CSS reutilizables. El backlog marca T-05-02 como pendiente, pero el repositorio ya incluye `@tailwindcss/vite`, directivas Tailwind v4 y un `theme.css` heredado de shadcn con colores genéricos. Este change audita el estado real, alinea el tema con la identidad ConRutina y cierra el DoD del ticket sin reinstalar tooling ya presente.

## What Changes

- Confirmar Tailwind CSS v4 integrado vía plugin `@tailwindcss/vite` en `vite.config.ts` (sin `tailwind.config.js`).
- Actualizar `frontend/src/styles/theme.css` con variables CSS del tema ConRutina: `--color-primary`, `--color-completed`, `--color-failed`, `--color-pending`, `--color-background`, `--color-surface`, expuestas en `@theme inline` para clases utilitarias Tailwind.
- Verificar que `frontend/src/styles/index.css` importa la cadena Tailwind + tema (`tailwind.css` → `theme.css`).
- Añadir o ajustar un componente de prueba mínimo que use clases del tema (p. ej. `bg-primary`, `bg-completed`) para validación visual en navegador.
- Documentar brechas detectadas vs DoD en `design.md`; no migrar componentes de negocio a las nuevas clases (fuera de scope).

## Capabilities

### New Capabilities

- `tailwind-conrutina-theme`: Integración Tailwind v4 vía Vite y variables de tema ConRutina (colores de producto y estados de hábito) consumibles como utilidades Tailwind.

### Modified Capabilities

_(Ninguna — no existen specs previas en `openspec/specs/` para el tema Tailwind.)_

## Impact

- **Frontend estilos:** `frontend/src/styles/theme.css`, `frontend/src/styles/tailwind.css`, `frontend/src/styles/index.css`.
- **Vite:** `vite.config.ts` (solo verificación del plugin `@tailwindcss/vite`; ya presente).
- **Dependencias:** `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css` (ya en `package.json` raíz).
- **Componente de prueba:** posible ajuste temporal en `App.tsx` o componente dedicado de smoke visual.
- **Sin impacto** en backend, Prisma, API ni primitivos shadcn/ui (T-05-03).

## Non-goals

- Instalar o configurar shadcn/ui y primitivos Radix (T-05-03).
- Crear estructura de capas frontend o refactorizar `App.tsx` base (T-05-04).
- Refactorizar todos los componentes existentes para usar las nuevas clases de tema (p. ej. sustituir `bg-green-500` en `HabitRow`).
- Introducir `tailwind.config.js` (Tailwind v4 usa CSS-first).
- Tests unitarios de estilos (el ticket indica verificación visual en navegador).
- Tema oscuro completo o `next-themes` (puede coexistir con variables existentes; no es objetivo del ticket).

## Criterios de aceptación (US-05 — alcance T-05-02)

Este ticket cubre parcialmente la US-05. Escenarios Gherkin aplicables:

| Escenario US-05 | Aplicabilidad en T-05-02 |
|-----------------|---------------------------|
| Scenario 1 — SPA arranca | **Fuera de scope** — T-05-01 |
| Scenario 2 — Proxy a la API | **Fuera de scope** — T-05-01 |
| Scenario 3 — Tailwind y tema: clases aplicadas y paleta como CSS variables | **In scope** — objetivo principal |
| Scenario 4 — Componentes shadcn/ui | **Fuera de scope** — T-05-03 |
| Scenario 5 — Estructura de capas frontend | **Fuera de scope** — T-05-04 |
| Scenario 6 — Build de producción | **Verificación secundaria** — confirmar que `npm run build` no regresa por cambios CSS |
