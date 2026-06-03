# Proposal — T-05-03 · Instalar y configurar shadcn/ui (Radix primitives)

**Ticket:** T-05-03  
**User Story:** US-05 — Scaffold del frontend: Vite + React + TypeScript + Tailwind + shadcn/ui  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

ConRutina necesita primitivos UI accesibles (Radix + Tailwind + CVA) listos para que los tickets de UI (modales, formularios, toasts) no reimplementen patrones desde cero. T-05-02 ya alineó el tema Tailwind v4; T-05-03 cierra la capa shadcn/ui: utilidad `cn()`, componentes base importables y toasts globales vía Sonner. El backlog marca el ticket como pendiente aunque el repo incluye muchos ficheros bajo `presentation/components/ui/` heredados del scaffold inicial — este change audita el estado real, corrige brechas (p. ej. `sonner.tsx` acoplado a `next-themes` sin `ThemeProvider`, ausencia de `<Toaster />` en `App.tsx`) y cumple el DoD sin expandir el catálogo más allá de los ocho primitivos requeridos.

## What Changes

- Confirmar o crear `frontend/src/presentation/components/ui/utils.ts` con `cn()` (clsx + tailwind-merge).
- Asegurar los primitivos del DoD en `frontend/src/presentation/components/ui/`: `button`, `dialog`, `input`, `label`, `card`, `progress`, `badge`, `sonner` — alineados con Tailwind v4 y variables de `theme.css` (T-05-02).
- Añadir `components.json` en raíz del monorepo (o `frontend/`) para convención shadcn CLI: alias `@/`, rutas `presentation/components/ui`, estilo `new-york` / Tailwind v4.
- Adaptar `sonner.tsx` para Vite + React SPA (sin depender de `next-themes` si no hay `ThemeProvider`).
- Montar `<Toaster />` en `App.tsx` para toasts globales.
- Añadir componente smoke mínimo que importe y renderice Button, Dialog, Input, Card (validación de importación y compilación).
- Verificar `npm run typecheck` y `npm run build` sin errores nuevos por los primitivos.

## Capabilities

### New Capabilities

- `shadcn-ui-primitives`: Utilidad `cn()`, primitivos shadcn/ui requeridos por T-05-03, configuración CLI mínima e integración de Sonner en la SPA.

### Modified Capabilities

_(Ninguna — no existen specs previas en `openspec/specs/` para shadcn/ui.)_

## Impact

- **Frontend UI:** `frontend/src/presentation/components/ui/` (utils + 8 primitivos), posible `components.json`.
- **App shell:** `frontend/src/presentation/App.tsx` — montaje de `<Toaster />` y smoke opcional de primitivos.
- **Dependencias:** Radix, `class-variance-authority`, `clsx`, `tailwind-merge`, `sonner` (ya en `package.json` raíz); posible eliminación de uso directo de `next-themes` en `sonner.tsx`.
- **Estilos:** Consumo de tokens en `frontend/src/styles/theme.css` (sin modificar el DoD de T-05-02 salvo variables shadcn ya existentes).
- **Sin impacto** en backend, Prisma, API ni refactor de modales de negocio (`AddHabitModal`, etc.) — eso queda para tickets posteriores (T-16-04, T-17-03).

## Non-goals

- Instalar o documentar los ~40 componentes shadcn adicionales ya presentes en el repo fuera del DoD (accordion, sidebar, chart, etc.) — no eliminarlos, pero no ampliar scope.
- Refactorizar modales o formularios de negocio para usar los primitivos shadcn (T-16-04, T-17-03).
- Crear estructura de capas frontend o layout base de `App.tsx` (T-05-04).
- Configurar `react-hook-form` + `Form` shadcn (uso futuro).
- Tests unitarios de primitivos UI (el ticket indica validación en componentes de negocio posteriores).
- Tema oscuro completo con `next-themes` (opcional futuro; no requisito del ticket).

## Criterios de aceptación (US-05 — alcance T-05-03)

Este ticket cubre parcialmente la US-05. Escenarios Gherkin aplicables:

| Escenario US-05 | Aplicabilidad en T-05-03 |
|-----------------|---------------------------|
| Scenario 1 — SPA arranca | **Verificación secundaria** — confirmar que los cambios no rompen `npm run dev` |
| Scenario 2 — Proxy a la API | **Fuera de scope** — T-05-01 |
| Scenario 3 — Tailwind y tema | **Dependencia** — primitivos deben usar variables de `theme.css` (T-05-02) |
| Scenario 4 — Componentes shadcn/ui disponibles e importables | **In scope** — objetivo principal |
| Scenario 5 — Estructura de capas frontend | **Fuera de scope** — T-05-04 |
| Scenario 6 — Build de producción | **Verificación secundaria** — `npm run build` sin errores TS |
