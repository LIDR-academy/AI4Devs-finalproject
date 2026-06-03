# Proposal — T-05-04 · Crear estructura de capas del frontend y App.tsx base

**Ticket:** T-05-04  
**User Story:** US-05 — Scaffold del frontend: Vite + React + TypeScript + Tailwind + shadcn/ui  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

T-05-01 a T-05-03 dejaron la SPA arrancando, el tema Tailwind y los primitivos shadcn/ui, pero la US-05 exige además una **arquitectura por capas** explícita y un **App.tsx base** con el layout de ConRutina (cabecera, stats, calendario, recompensas). El repo ya contiene código heredado del scaffold inicial (dominio, hooks, componentes de negocio e `App.tsx` monolítico), por lo que T-05-04 **formaliza y cierra brechas** respecto al DoD — no asume greenfield — antes de que Sprint 1 (US-06+, US-13) añada lógica conectada a la API.

## What Changes

- Auditar y confirmar directorios de capas: `domain/`, `application/`, `infrastructure/`, `presentation/components/`, `styles/`.
- Añadir convenciones mínimas por capa (p. ej. `README.md` o barrel `index.ts` donde falten) alineadas con `docs/frontend-standards.md`.
- Extraer el **layout shell** de ConRutina desde `App.tsx` a componentes de presentación reutilizables (`AppLayout`, secciones stats/calendar/rewards) manteniendo las secciones visibles del DoD.
- Completar `frontend/src/styles/fonts.css` con importaciones de fuentes (stack ConRutina: sans para UI, serif para título) y enlazarlas vía variables CSS en `theme.css` o clases utilitarias.
- Sustituir estilos inline dispersos (p. ej. `backgroundColor: '#FAF8F5'`, `fontFamily: 'Georgia'`) por tokens del tema T-05-02.
- Asegurar cliente HTTP base en `infrastructure/` (p. ej. `httpClient.ts`) y mantener `profileApi.ts` como adaptador concreto.
- Verificar que `main.tsx` monta `App.tsx`, que la SPA compila (`npm run typecheck`, `npm run build`) y que el layout base se renderiza sin errores en consola.

## Capabilities

### New Capabilities

- `frontend-layer-scaffold`: Estructura de capas frontend (domain, application, infrastructure, presentation, styles), layout base de la SPA en `App.tsx` y fuentes globales en `fonts.css`.

### Modified Capabilities

_(Ninguna — no se alteran requisitos de specs existentes en `openspec/specs/`.)_

## Impact

- **Frontend arquitectura:** `frontend/src/domain/`, `application/`, `infrastructure/`, `presentation/` (nuevos componentes layout + refactor de `App.tsx`), `styles/fonts.css` y posible ajuste en `theme.css`.
- **Entry point:** `frontend/src/main.tsx` — sin cambios funcionales salvo imports de estilos si se reorganizan.
- **Documentación:** actualizar `docs/frontend-standards.md` si la estructura final difiere del diagrama actual.
- **Sin impacto** en backend, Prisma, API, shadcn primitivos (T-05-03) ni tema Tailwind base (T-05-02).
- **Dependencias:** T-05-01 (Vite), T-05-02 (tema), T-05-03 (shadcn/Toaster). Prerequisito de US-13 (dominio frontend) y tickets UI Sprint 1+.

## Non-goals

- Implementar casos de uso o hooks de negocio nuevos (US-13, T-13-01).
- Conectar todas las secciones del layout a endpoints reales de la API (Sprint 1 — US-06+).
- Refactorizar modales o formularios para shadcn completo (T-16-04, T-17-03).
- Eliminar componentes de negocio existentes (`HabitRow`, `RewardCard`, etc.) salvo moverlos a la estructura de capas correcta.
- Tests unitarios Vitest del layout (el ticket indica validación manual/build; cobertura en T-15-01).
- Routing multi-página o React Router (fuera del MVP scaffold).

## Criterios de aceptación (US-05 — alcance T-05-04)

Este ticket cierra el **Scenario 5** de US-05 y verifica compilación (Scenario 6). Escenarios Gherkin aplicables:

| Escenario US-05 | Aplicabilidad en T-05-04 |
|-----------------|---------------------------|
| Scenario 1 — SPA arranca | **Verificación secundaria** — confirmar que el refactor no rompe `npm run dev:web` |
| Scenario 2 — Proxy a la API | **Fuera de scope** — T-05-01 |
| Scenario 3 — Tailwind y tema | **Dependencia** — layout debe usar tokens de `theme.css` (T-05-02) |
| Scenario 4 — Componentes shadcn/ui | **Fuera de scope** — T-05-03 |
| Scenario 5 — Estructura de capas frontend | **In scope** — objetivo principal |
| Scenario 6 — Build de producción | **Verificación secundaria** — `npm run build` sin errores TS |
