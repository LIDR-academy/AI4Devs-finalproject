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
- **Arquitectura/stack (tarea 1.1, en curso):** Confirmado — capa de datos
  **PostgreSQL + Prisma**; backend como **API REST pública en TypeScript**
  documentada en OpenAPI, siguiendo SOLID/CUPID/DRY vía arquitectura en capas
  (rutas → casos de uso → repositorios → dominio), sin DI pesado si añade
  ceremonia innecesaria; frontend en **TypeScript**, cross-browser (evergreen),
  responsive mobile-first, accesibilidad objetivo **WCAG 2.1 AA** (EN 301 549 /
  European Accessibility Act). Hosting **decidido**: **VM única con IP pública**
  en **Oracle Cloud Free Tier** (Ampere A1 / ARM64, 2 OCPU · 12 GB · 50 GB,
  Ubuntu 24.04). Un reverse proxy (Caddy) sirve la SPA y enruta `/api`; Postgres
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
  `Copy`) e implementado en `backend/prisma/schema.prisma` (20 modelos + 16 enums,
  PostgreSQL). Reflejado también en `readme.md` §3. Modelos en inglés (convención
  Prisma) que mapean a los términos de dominio en español de las specs. Decisiones
  clave añadidas a `design.md`: **D10** (catálogo de entidades + `User` único con
  rol, sin `Employee`) y **D11** (`score` de cola materializado + recálculo). Specs
  sincronizadas (nueva Requirement de recálculo en `reservation-queue`; `tasks.md`
  1.2/6.2); `openspec validate clickoteca-mvp --strict` en verde. **Nota de versión:**
  el esquema usa la forma clásica `url = env("DATABASE_URL")`, válida en Prisma ≤6;
  Prisma 7 exige moverla a `prisma.config.ts` — pinnear Prisma 6 al fijar el
  `package.json` del backend, o migrar la config del datasource.
- **Arquitectura C4 + ADR (2026-07-04):** `documents/C4-architecture.md`
  (diagramas C4 niveles 1–3 en Mermaid: contexto, contenedores, componentes de la
  API por capability + capas) y `documents/ADR-0001-arquitectura-mvp.md` (ADR de
  arquitectura de la aplicación, estado **Propuesto**). El scheduler (recálculo de
  score, caducidad de ofertas, recordatorios) se modela como contenedor lógico,
  previsiblemente **in-process** en la API en el MVP. Se mantuvo el criterio "no
  inventar": frameworks concretos y hosting quedan como *pendiente/propuesto*. El
  prompt se archivó en `prompts.md` §2.1.
- **Frontend — separación de superficies (decidido 2026-07-04):** adoptada la
  **opción 2** de 3: **SPA única** con el Back-office en un ***chunk* lazy
  (code-splitting)** segmentado por rol —no viaja en el bundle público— y la capa
  compartida (cliente OpenAPI, tipos, dominio) factorizada para dejar barata una
  futura separación en dos apps (pospuesta). Descartadas: SPA monolítica sin split
  y dos apps separadas desde ya. Registrado en `ADR-0001` §3, reflejado en
  `C4-architecture.md` y en `tasks.md` 1.1. Los specs de comportamiento
  (`accounts-roles`) no cambian: el acceso al back-office ya es por rol.
- _(More facts to be added as the project develops.)_

## Open questions

- Framework de frontend concreto (React/Vue/Angular/Svelte...) — el usuario
  indicó que detallará los requisitos técnicos más adelante.
- Framework de backend concreto (Express/Fastify/NestJS...) — a decidir junto
  con el frontend antes de cerrar la tarea 1.1.

_(Cerradas: hosting → VM única Oracle free (`ADR-0001` §5); auth → cookie de sesión
+ contrato de errores RFC 9457 (`ADR-0002`); concurrencia → CAS y orden de cola
inmutable (`design.md` D11 rev / D12).)_
