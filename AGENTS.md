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
  European Accessibility Act). Hosting **propuesto, pendiente de confirmación**
  del usuario (está explorando opciones): **Vercel** (frontend, gratis sin
  caducidad), **Render** (API, free tier con cold start) y **Neon** (Postgres,
  free tier que suspende pero no borra) — descartados la Postgres gratuita de
  Render (caduca a los 30 días) y Railway (ya no gratuito con BD en 2026). Ver
  `prompts.md` § Log de prompts, entrada 2026-07-03.
- **PRD:** borrador completo en `documents/PRD.md`, sintetizado desde
  `openspec/changes/clickoteca-mvp/` + `readme.md` §1.2 + log de prompts.
  Sirve de fuente detallada de la que luego se condensará `readme.md` §1.
  Pendiente de revisión del usuario; diseño/UX y criterios de éxito de
  negocio quedaron marcados como pendientes ahí (no inventados).
- _(More facts to be added as the project develops.)_

## Open questions

- Framework de frontend concreto (React/Vue/Angular/Svelte...) — el usuario
  indicó que detallará los requisitos técnicos más adelante.
- Framework de backend concreto (Express/Fastify/NestJS...) — a decidir junto
  con el frontend antes de cerrar la tarea 1.1.
- Confirmación final del hosting (Vercel + Render + Neon, propuesto) — el
  usuario está explorando las opciones antes de confirmar.
