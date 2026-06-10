# 7. Pull Requests — Plan recomendado y estado de evidencia

## 7.1. Estado actual

**No existen pull requests reales** que implementen los módulos descritos en `/deliverables/6-Tickets-de-trabajo.md`. La entrega académica actual cubre exclusivamente documentación y planificación técnica.

Este documento define el **plan recomendado** de PRs para una futura fase de implementación, alineado con los tickets de trabajo y los ADRs aprobados (`/docs/22`). Cada PR debe consumir uno o más tickets, mantener trazabilidad a los documentos fuente, pasar los **quality gates** definidos en `/docs/20-Testing-Strategy.md` y respetar la disciplina DevOps de `/docs/21-Deployment-and-DevOps-Design.md`.

## 7.2. Convenciones del plan

- **Naming de branch:** `feature/<area>-<short-slug>` o `chore/<area>-<short-slug>`.
- **Naming de PR:** `feat(area): …` / `chore(area): …` / `test(area): …` / `docs(area): …` / `security(area): …`.
- **Cada PR debe incluir:** descripción, scope, tickets relacionados, checklist de validación (tests, lint, typecheck, build, migraciones), referencias a documentos fuente.
- **Estado de evidencia por defecto:** `Pending` — solo se marca como `Implemented` / `Merged` cuando exista PR real verificable.

## 7.3. Plan recomendado de PRs

### PR-001 — Project scaffolding y repository structure

- **Objetivo:** establecer la base monorepo o multi-repo (backend + frontend), CI mínima, linting, scripts.
- **Alcance:** `package.json`, scripts, `.editorconfig`, `.nvmrc`, `Dockerfile`, `.env.example`, GitHub Actions inicial, README de instalación.
- **Tickets relacionados:** BE-001, FE-001, DEVOPS-001, DEVOPS-002, DOC-001.
- **Documentos fuente:** `/docs/14`, `/docs/15`, `/docs/21`.
- **Estado de evidencia:** Pending.

### PR-002 — Database schema y Prisma migrations

- **Objetivo:** materializar el modelo de datos físico aprobado.
- **Alcance:** `prisma/schema.prisma`, migración inicial, naming snake_case, enums nativos, JSONB acotado.
- **Tickets:** DB-001, DB-002, DB-003.
- **Fuentes:** `/docs/6`, `/docs/18`.
- **Estado:** Pending.

### PR-003 — Seed strategy y demo data

- **Objetivo:** seed determinista con `is_seed=true` y reset surgical.
- **Alcance:** `prisma/seed.ts`, escenarios mínimos de `/docs/11`, reset endpoint protegido.
- **Tickets:** DB-004, DB-005.
- **Fuentes:** `/docs/11`, `/docs/14`.
- **Estado:** Pending.

### PR-004 — Backend auth y security foundation

- **Objetivo:** sesión por cookie HTTP-only firmada, captcha, rate limit, password hashing, middlewares base.
- **Alcance:** módulo `iam`, middlewares de correlación/logging/auth/RBAC/ownership/Zod/error handler, headers de seguridad.
- **Tickets:** BE-002, BE-003, SEC-001, SEC-002, SEC-003.
- **Fuentes:** `/docs/14`, `/docs/19`.
- **Estado:** Pending.

### PR-005 — Event planning backend module

- **Objetivo:** eventos, tareas, presupuesto.
- **Alcance:** use cases, controladores, repositorios Prisma, jobs ligeros.
- **Tickets:** BE-004, BE-011 (parcial).
- **Fuentes:** `/docs/14`, `/docs/16`, Business Rules.
- **Estado:** Pending.

### PR-006 — AI provider abstraction y `MockAIProvider`

- **Objetivo:** capa IA desacoplada y determinista para CI/demo.
- **Alcance:** puerto `LLMProvider`, `MockAIProvider`, `AnthropicProvider` stub, schemas Zod por feature IA.
- **Tickets:** AI-001, AI-003, AI-004, AI-006 (parcial), AI-007 (parcial).
- **Fuentes:** `/docs/17`.
- **Estado:** Pending.

### PR-007 — AI planning endpoints y persistencia `AIRecommendation`

- **Objetivo:** endpoints IA con flujo human-in-the-loop completo.
- **Alcance:** `POST /events/{eventId}/ai/plan|checklist|budget|vendor-categories`, persistencia y transiciones de `AIRecommendation`, `OpenAIProvider`, mitigaciones de prompt injection.
- **Tickets:** AI-002, AI-005, AI-007, AI-008.
- **Fuentes:** `/docs/17`, `/docs/19`.
- **Estado:** Pending.

### PR-008 — Vendor profile y service modules

- **Objetivo:** perfil de proveedor, servicios, directorio público.
- **Alcance:** módulo `vendor-management`, validaciones de portafolio, filtros del directorio.
- **Tickets:** BE-005.
- **Fuentes:** `/docs/14`, `/docs/15`, `/docs/16`.
- **Estado:** Pending.

### PR-009 — Quote request / quote / booking intent flow

- **Objetivo:** flujo bilateral completo de cotización.
- **Alcance:** módulo `quote-flow`, validaciones (límite 5, validez 15 días, transiciones), notificaciones, `reviews` posterior.
- **Tickets:** BE-006, BE-007.
- **Fuentes:** `/docs/14`, `/docs/16`, Business Rules.
- **Estado:** Pending.

### PR-010 — Admin governance y moderation

- **Objetivo:** aprobaciones, gestión de categorías, moderación de reseñas, `AdminAction`.
- **Alcance:** módulo `admin-governance`, endpoints `/admin/*`.
- **Tickets:** BE-008.
- **Fuentes:** `/docs/19`, `/docs/14`.
- **Estado:** Pending.

### PR-011 — Frontend scaffolding (Next.js App Router)

- **Objetivo:** base del frontend con i18n, design tokens y guardas UX.
- **Alcance:** App Router, Tailwind, TanStack Query, RHF + Zod, next-intl, layouts por rol.
- **Tickets:** FE-001, FE-002, FE-008.
- **Fuentes:** `/docs/15`.
- **Estado:** Pending.

### PR-012 — Organizer workspace UI

- **Objetivo:** UX completa del organizador.
- **Alcance:** wizard de evento, dashboard, checklist, presupuesto, UX HITL para sugerencias IA, comparador de cotizaciones.
- **Tickets:** FE-003, FE-004.
- **Fuentes:** `/docs/15`, `/docs/17`.
- **Estado:** Pending.

### PR-013 — Vendor directory y vendor workspace UI

- **Objetivo:** UX del organizador buscando proveedores y del proveedor gestionando su perfil.
- **Alcance:** filtros del directorio, perfil de proveedor, portafolio, gestión de `QuoteRequest`/`Quote`.
- **Tickets:** FE-005, FE-006.
- **Fuentes:** `/docs/15`, `/docs/16`.
- **Estado:** Pending.

### PR-014 — Admin panel UI

- **Objetivo:** UI para gobernanza administrativa.
- **Alcance:** aprobaciones de proveedores, moderación de reseñas, gestión de categorías, vista auditada de eventos.
- **Tickets:** FE-007.
- **Fuentes:** `/docs/15`, `/docs/19`.
- **Estado:** Pending.

### PR-015 — Testing foundation y critical suites

- **Objetivo:** quality gates listos para CI.
- **Alcance:** Vitest + Supertest backend, Vitest + Testing Library + MSW frontend, Playwright E2E mínimo, tests deterministas IA con `MockAIProvider`, tests negativos de autorización.
- **Tickets:** TEST-001, TEST-002, TEST-003, TEST-004, TEST-005, TEST-006, TEST-007.
- **Fuentes:** `/docs/20`.
- **Estado:** Pending.

### PR-016 — Deployment y DevOps configuration

- **Objetivo:** despliegue público mínimo en AWS.
- **Alcance:** Amplify Hosting (frontend), App Runner (backend Docker), RDS PostgreSQL, S3, Secrets Manager / SSM, CloudWatch, GitHub Actions de despliegue.
- **Tickets:** DEVOPS-003 a DEVOPS-008, SEC-004.
- **Fuentes:** `/docs/21`.
- **Estado:** Pending.

### PR-017 — Final documentation y demo readiness

- **Objetivo:** dejar el repositorio listo para evaluación académica.
- **Alcance:** README de instalación final, OpenAPI 3.1 generado, capturas y video demo, instrucciones de seed reset y credenciales demo.
- **Tickets:** DOC-001, DOC-002, DOC-003.
- **Fuentes:** `/docs/21`, `/docs/16`.
- **Estado:** Pending.

## 7.4. Checklist de validación por PR

Aplicable a cada uno de los PRs del plan:

- [ ] Lint y typecheck pasan.
- [ ] Build pasa.
- [ ] Suites de tests relevantes verdes (unit / integration / API / E2E según el PR).
- [ ] Migraciones Prisma validadas (cuando aplica).
- [ ] Cero secretos comiteados; `.env.example` actualizado cuando aplica.
- [ ] Quality gate de seguridad aplica (RBAC + ownership + assignment-based) cuando aplica.
- [ ] Tests deterministas IA con `MockAIProvider` cuando aplica.
- [ ] Cobertura mínima del feature.
- [ ] Documentos fuente referenciados explícitamente en la descripción del PR.
- [ ] ADRs aplicables citados.

## 7.5. Documentos fuente

- [Architecture Decision Records](../docs/22-Architecture-Decision-Records.md)
- [Testing Strategy](../docs/20-Testing-Strategy.md)
- [Deployment & DevOps Design](../docs/21-Deployment-and-DevOps-Design.md)
- [Backend Technical Design](../docs/14-Backend-Technical-Design.md)
- [Frontend Architecture Design](../docs/15-Frontend-Architecture-Design.md)
- [API Design Specification](../docs/16-API-Design-Specification.md)
- [AI Architecture & PromptOps Design](../docs/17-AI-Architecture-and-PromptOps-Design.md)
- [Security & Authorization Design](../docs/19-Security-and-Authorization-Design.md)
- [Data Seed Strategy](../docs/11-Data-Seed-Strategy.md)
