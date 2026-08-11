# AGENTS.md — Project instructions & memory

This file is the persistent memory and working agreement for AI assistants on this
project. Read it at the start of every session.

## Working conventions

- **Personal project.** Owner: Xavier Vergés (<xaviverges@gmail.com>).
- **Memory lives here.** Record durable project facts, decisions, and context in this
  file (AGENTS.md) — not in the default `.claude` memory directory.
- **Prompt log.** Log **only project-content prompts** (those producing deliverables:
  architecture, data model, API, code, etc.). **Skip meta/setup/workflow prompts.** For
  each logged prompt, do **both**:
  1. Append it to the chronological **"Log de prompts"** section at the end of
     `prompts.md`, with a short summary ("resumen") of the assistant's response.
  2. File the most relevant ones into their matching structured deliverable section,
     respecting the "max 3 per section" rule.
- **Don't invent.** When anything is ambiguous or unknown, ask the user rather than
  guessing.
- All diagrams must be written in Mermaid language for enhanced compatibility

## Project facts

- **Context:** AI4Devs final project (Lidr). The `main` branch currently contains only
  documentation scaffolding: `readme.md` (project deliverable template, in Spanish) and
  `prompts.md` (prompt log template). Application code is expected on other branches.
- **Product:** Clickoteca — LEGO set rental-by-subscription library. MVP defined as
  an OpenSpec change at `openspec/changes/clickoteca-mvp/` (not yet implemented —
  `tasks.md` all unchecked). Pricing (BASIC 14,99€/mes, PREMIUM 24,99€/mes) is
  benchmarked against real competitors (Brick Borrow, Pley, BrickDrop, NetBricks) —
  see `design.md` D9. Seed catalog data/images recommended source: Rebrickable
  (free public dataset/API, has `img_url` per set; no age/difficulty fields —
  curate those manually for the seed subset).
- **Arquitectura/stack (tarea 1.1, en curso):** Confirmado — **framework
  Next.js full-stack** (App Router, TypeScript; decidido 2026-07-05) que sirve
  **front (SSR/RSC)** y **API REST pública** (Route Handlers en `app/api/*` +
  Zod → OpenAPI) en un solo proyecto; capa de datos **PostgreSQL + Prisma**;
  arquitectura en capas (Route Handlers → casos de uso → repositorios → dominio),
  dominio agnóstico del framework, sin DI pesado; scheduler como **proceso Node
  aparte** (node-cron), no in-process (Next multi-instancia lo duplicaría);
  frontend cross-browser (evergreen), responsive mobile-first, accesibilidad
  objetivo **WCAG 2.1 AA** (EN 301 549 / European Accessibility Act). Hosting
  **decidido**: **VM única con IP pública** en **Oracle Cloud Free Tier** (Ampere
  A1 / ARM64, 2 OCPU · 12 GB · 50 GB, Ubuntu 24.04). Un reverse proxy (Caddy)
  termina TLS y enruta al servidor Next (front + `/api`); Postgres
  corre en `localhost`; las imágenes en el filesystem → **mismo origen** (sin CORS,
  cookie de sesión *first-party*). Descartado el split PaaS Vercel+Render+Neon
  (multi-origen, cold-start, suspensión de BD); plan B si Oracle reclama la
  instancia: Hetzner CX22 (~4 €/mes). Detalle en `documents/ADR-0001` §5 y
  `ADR-0002` (auth + errores).
- **PRD:** borrador completo en `documents/PRD.md`, sintetizado desde
  `openspec/changes/clickoteca-mvp/` + `readme.md` §1.2 + log de prompts.
  Sirve de fuente detallada de la que luego se condensará `readme.md` §1.
  Pendiente de revisión del usuario; diseño/UX y criterios de éxito de
  negocio quedaron marcados como pendientes ahí (no inventados).
- **Modelo de datos (definido 2026-07-04):** documentado en `documents/PRD.md` §15
  (tres anillos de importancia + diagramas ER Mermaid + máquina de estados de
  `Copy`) e implementado en `prisma/schema.prisma` (20 modelos + 16 enums,
  PostgreSQL). Reflejado también en `readme.md` §3. Modelos en inglés (convención
  Prisma) que mapean a los términos de dominio en español de las specs. Decisiones
  clave añadidas a `design.md`: **D10** (catálogo de entidades + `User` único con
  rol, sin `Employee`) y **D11** — que en su primera versión (esta sesión) fue
  "`score` de cola materializado + recálculo", pero **fue reescrito** ese mismo día a
  **orden por `effectiveEntryAt` inmutable, sin recálculo** (ver sesión de
  arquitectura más abajo y `design.md` D11). El modelo de datos refleja ya la forma
  reescrita: la entrada de cola guarda `enqueuedAt` + `appliedBonus` +
  `effectiveEntryAt` (no una columna `score`). Specs y `readme.md`/`PRD.md`
  sincronizados (Requirement "Orden de cola por entrada efectiva inmutable" en
  `reservation-queue`; `tasks.md` 1.2/6.2);
  `openspec validate clickoteca-mvp --strict` en verde. **Nota de versión:**
  el esquema aún trae la forma clásica `url = env("DATABASE_URL")`; con la decisión
  de **Prisma 7** (ver hecho más abajo) hay que **migrar el datasource a
  `prisma.config.ts`** al inicializar el backend.
- **Arquitectura C4 + ADR (2026-07-04):** `documents/C4-architecture.md`
  (diagramas C4 niveles 1–3 en Mermaid: contexto, contenedores, componentes de la
  API por capability + capas) y `documents/ADR-0001-arquitectura-mvp.md` (ADR de
  arquitectura de la aplicación, estado **Propuesto**). El scheduler (recálculo de
  score, caducidad de ofertas, recordatorios) se modela como contenedor lógico,
  previsiblemente **in-process** en la API en el MVP. Se mantuvo el criterio "no
  inventar": frameworks concretos y hosting quedan como *pendiente/propuesto*. El
  prompt se archivó en `prompts.md` §2.1.
- **Frontend — separación de superficies:** el principio se mantiene (Portal del
  Suscriptor y Back-office segmentados por rol; el código de back-office no viaja
  al navegador del suscriptor sin autorización), pero con **Next.js** el mecanismo
  ya **no** es un *chunk lazy* de SPA sino **route groups + middleware de auth** y
  el *code-splitting* por ruta nativo de Next (`ADR-0001` §2–§3, decisión
  2026-07-05 que supersede la "opción 2 de 3 / SPA única" del 2026-07-04). La capa
  compartida (tipos, dominio, cliente OpenAPI) se factoriza para dejar barata una
  futura extracción de la API. Los specs de comportamiento (`accounts-roles`) no
  cambian: el acceso al back-office ya es por rol.
- **Visitante = actor no autenticado (decidido 2026-07-05):** el visitante (usuario
  sin sesión) se modela como **actor no autenticado**, **no** como un cuarto rol de
  `User` (los tres roles siguen siendo `SUBSCRIBER|OPERATOR|ADMIN`, uno por cuenta;
  el enum `Role` no cambia). Puede ver una **proyección pública** del catálogo
  (atributos de Sets publicados, **sin** disponibilidad ni cola), los planes/
  condiciones y el alta; la disponibilidad y todo lo de nivel copia/cola exigen
  login. La frontera se traza en la proyección de datos, no en el catálogo. Registro
  en `design.md` **D13**; specs `accounts-roles` (Requirement "Acceso público no
  autenticado") y `catalog-inventory` (Requirement "Proyección pública del
  catálogo"); PRD §3/§4.1/§14.1 (UC-P02 ya no muestra disponibilidad al visitante);
  historia **HU-00** en `documents/user_stories.md`; tareas 2.7 y 3.6.
- **Stack de UI (decidido 2026-08-11):** **Tailwind CSS + shadcn/ui** (componentes
  sobre **Radix UI**, copiados al repo en `components/ui/*`, sin lock-in y con
  tree-shaking perfecto). Elegido por: peso mínimo en móvil (Tailwind purga clases,
  **cero runtime CSS-in-JS**), accesibilidad AA de serie vía Radix (foco/ARIA/teclado
  — alineado con el objetivo WCAG 2.1 AA), estética moderna y encaje nativo con App
  Router/RSC. Theming por CSS variables (encaja con el modelo `Theme`). Iconos con
  **lucide-react**. Formularios con **react-hook-form + Zod**, **compartiendo los
  esquemas Zod con la API** (Route Handlers → OpenAPI). Descartados MUI/Chakra
  (runtime CSS-in-JS, fricción con RSC) y Mantine (más bundle, menos idiomático RSC).
- **Stack de tests (decidido 2026-08-11):** **Vitest** (unit/integración, ESM-nativo),
  **Playwright** (E2E — recorridos de tareas 5.7/8.4 y checks de accesibilidad) y
  **Testcontainers** para levantar **Postgres real** en integración (evita mocks de
  Prisma; prueba de verdad las transiciones de estado de `Copy` y el CAS/orden de la
  cola). "Tests no negociables": priorizar caminos de error y casos límite.
- **Versión de Prisma (decidido 2026-08-11):** **Prisma 7.** Implica **migrar la
  config del datasource** de `url = env("DATABASE_URL")` (forma clásica en el
  `schema.prisma` actual) a **`prisma.config.ts`**, requisito de Prisma 7. Hacerlo al
  inicializar el backend (afecta a la tarea 1.2). Supersede la nota previa de "pinnear
  Prisma 6".
- **Scaffolding hecho (tarea 1.1, 2026-08-11):** proyecto **Next.js 16** (App Router,
  TS, `type: module`) en la **raíz** del repo (no `backend/`; el schema se movió a
  `prisma/schema.prisma`). Stack instalado: **React 19.2, Tailwind v4** (config
  CSS-first en `app/globals.css`, sin `tailwind.config`), **shadcn/ui** (new-york,
  base neutral; `components.json`; `lib/utils.ts` con `cn`; primer componente
  `components/ui/button.tsx`), **Prisma 7.9** (generator nuevo `prisma-client` →
  `src/generated/prisma`, gitignored; **driver adapter** `@prisma/adapter-pg`; URL en
  `prisma.config.ts`), **Zod 4 + react-hook-form**. Estructura: route groups
  `app/(public)` (landing pública), `app/(portal)/portal`, `app/(backoffice)/backoffice`;
  API `app/api/health`; **`proxy.ts`** (Next 16 renombró `middleware`→`proxy`) como
  esqueleto de auth por rol; capas `src/domain` (incl. `reservation-queue/ordering.ts`
  puro, alineado con D11), `src/use-cases`, `src/repositories` (READMEs con la regla de
  dependencias), `src/db/prisma.ts` (singleton con adapter); `scheduler/index.ts`
  (proceso node-cron aparte). Tests: **Vitest** (jsdom + Testing Library; 6 tests humo
  en verde) + **Playwright** (`e2e/smoke.spec.ts`; falta `npx playwright install`).
  Scripts npm: `dev/build/start/lint/typecheck/test/test:e2e/db:generate/db:migrate/
  db:seed/scheduler`. **Verificado en verde:** `prisma generate`, `tsc --noEmit`,
  `eslint .`, `next build` (5 rutas), `vitest run`, y runtime real (`/api/health` →
  `{status:"ok"}`, landing y `/portal` 200). `.gitattributes` fuerza LF.
  **Caveats:** (1) `testcontainers@12` pide **Node ≥22.22** (hay 22.19) → subir Node
  antes de los tests de integración con Postgres; (2) ESLint 9: `eslint-config-next` 16
  se importa como **flat config nativo** (`eslint-config-next/core-web-vitals` +
  `/typescript`), **no** vía `FlatCompat` (daba error de estructura circular).
- _(More facts to be added as the project develops.)_

## Open questions

- _(Ninguna abierta.)_ Arquitectura, hosting, auth, UI, tests y versión de Prisma
  cerrados; scaffolding (1.1) hecho y verificado. Siguiente: tarea 1.2 (afinar el
  schema para Prisma 7 y primera migración) y 1.3 (semillas).

_(Cerradas: framework front+back → **Next.js full-stack** (App Router), API REST en
Route Handlers + OpenAPI (`ADR-0001` §2–§3, 2026-07-05); hosting → VM única Oracle
free (`ADR-0001` §5); auth → cookie de sesión
+ contrato de errores RFC 9457 (`ADR-0002`); concurrencia → CAS y orden de cola
inmutable (`design.md` D11 rev / D12).)_
