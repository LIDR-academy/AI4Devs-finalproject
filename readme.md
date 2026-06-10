# EventFlow — Final Project Delivery

## Overview

EventFlow es un MVP de planificación de eventos asistida por IA y gestión simplificada de cotizaciones de proveedores, orientado inicialmente al mercado de Guatemala con visión futura hacia España y LATAM. La documentación disponible posiciona el producto como un workspace web responsive para organizadores, proveedores y administradores, con foco en plan, checklist, presupuesto y flujo estructurado de cotizaciones, evitando documentarlo como marketplace transaccional completo en v1.

Este repositorio contiene una entrega académica de **documentación y planificación técnica** del proyecto. La fase actual cubre, de extremo a extremo:

- Descubrimiento de dominio y decisiones de producto.
- Definición del alcance MVP, reglas de negocio y matriz de roles/permisos.
- Modelo de dominio, casos de uso, FRD y NFR.
- Estrategia de datos semilla (seed) y demo readiness.
- Visión y principios arquitectónicos.
- Arquitectura del sistema (vistas C4).
- Diseño técnico de backend (Node.js + Express + TypeScript + Prisma + PostgreSQL).
- Arquitectura de frontend (Next.js + App Router + TypeScript + TanStack Query + Tailwind).
- Especificación de la API REST (`/api/v1`).
- Arquitectura de IA y PromptOps (`LLMProvider`, `OpenAIProvider`, `MockAIProvider`, `AnthropicProvider` stub).
- Diseño físico de base de datos (PostgreSQL + Prisma).
- Diseño de seguridad y autorización (RBAC + ownership + captcha + cookies HTTP-only).
- Estrategia de testing (Vitest + Supertest + MSW + Playwright + tests deterministas con `MockAIProvider`).
- Diseño de despliegue y DevOps (AWS Amplify + App Runner + RDS + S3 + GitHub Actions).
- Registro formal de 46 ADRs.

La entrega **no incluye** implementación funcional, despliegue en URL pública, capturas finales, PRs reales mergeados ni demos ejecutables. Todas esas secciones están explícitamente marcadas como pendientes en este README y en cada deliverable.

---

## Delivery Index

Paquete académico final disponible en `/deliverables`:

| # | Documento | Resumen ejecutivo | Documentos fuente principales | Link |
|---:|---|---|---|---|
| 0 | Ficha del proyecto | Identidad del proyecto, autor, descripción breve, estado de URL y repositorio. | Discovery, MVP Scope, Architecture Vision. | [Ver](./deliverables/0-Ficha-del-proyecto.md) |
| 1 | Descripción general del producto | Objetivo del MVP, módulos funcionales documentados, experiencia esperada por rol, instalación pendiente. | Discovery, MVP Scope, FRD, AI Features. | [Ver](./deliverables/1-Descripcion-general-del-producto.md) |
| 2 | Arquitectura del sistema | Estilo (Modular Monolith + Clean/Hex), C4 L1/L2/L3, componentes, seguridad y despliegue planeado. | Architecture Vision, System Architecture, Backend/Frontend Technical Design, DevOps. | [Ver](./deliverables/2-Arquitectura-del-sistema.md) |
| 3 | Modelo de datos | Entidades MVP, reglas clave de integridad y diagrama ER alineado con el diseño físico Prisma + PostgreSQL. | Domain Data Model, Database Physical Design, Seed Strategy, AI Architecture. | [Ver](./deliverables/3-Modelo-de-datos.md) |
| 4 | Especificación de la API | Principios REST, módulos del API, endpoints representativos y disposición para OpenAPI 3.1. | API Design Specification, Backend Technical Design, Security Design. | [Ver](./deliverables/4-Especificacion-de-la-API.md) |
| 5 | Historias de usuario | Backlog curado por épica, con criterios de aceptación y trazabilidad a FRD/Use Cases. | FRD, Use Cases, Business Rules, AI Features, Security Design. | [Ver](./deliverables/5-Historias-de-usuario.md) |
| 6 | Tickets de trabajo | Backlog técnico organizado por área (backend, frontend, DB, IA, seguridad, testing, DevOps, docs). | Backend/Frontend Technical Design, AI Architecture, Database Physical Design, Testing Strategy, DevOps Design. | [Ver](./deliverables/6-Tickets-de-trabajo.md) |
| 7 | Pull requests | Plan recomendado de PRs por fase de implementación con estado de evidencia. | Architecture, Backend, Frontend, DevOps, Testing. | [Ver](./deliverables/7-Pull-requests.md) |

---

## Project Documentation Index

Documentación completa del proyecto en `/docs`, en orden lógico de generación:

| # | Documento | Propósito | Link |
|---:|---|---|---|
| 1 | Domain Discovery Report | Define el problema, dominio, actores, oportunidades y recomendación estratégica inicial. | [Ver](./docs/1-Domain-Discovery-Report.md) |
| 2 | Product Owner Decisions | Consolida decisiones formales de producto que delimitan el MVP. | [Ver](./docs/2-Product-Owner-Decisions.md) |
| 3 | MVP Scope Definition | Define alcance MoSCoW, módulos incluidos/excluidos y criterios de éxito. | [Ver](./docs/3-MVP-Scope-Definition.md) |
| 4 | Business Rules Document | Cataloga las reglas BR-* enforced en backend, IA y base de datos. | [Ver](./docs/4-Business-Rules-Document.md) |
| 5 | User Roles & Permissions Matrix | Matriz RBAC + ownership por entidad para `organizer`, `vendor` y `admin`. | [Ver](./docs/5-User-Roles-Permissions-Matrix.md) |
| 6 | Domain Data Model | Entidades, relaciones, estados y reglas del dominio. | [Ver](./docs/6-Domain-Data-Model.md) |
| 7 | AI Features Specification | Capacidades IA aprobadas, abstracción `LLMProvider`, human-in-the-loop. | [Ver](./docs/7-AI-Features-Specification.md) |
| 8 | Use Cases Specification | Casos de uso por módulo, flujos críticos y validaciones. | [Ver](./docs/8-Use-Cases-Specification.md) |
| 8.1 | PO Decisions — Use Cases Addendum | 19 decisiones formales de PO sobre IA, captcha, currency, rating, validez y soft delete. | [Ver](./docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md) |
| 8.2 | Documentation Alignment Review | Validación de coherencia documental previa al FRD. | [Ver](./docs/8.2-Documentation-Alignment-Review-Before-FRD.md) |
| 9 | Functional Requirements Document | FR-* por módulo derivados de use cases y reglas de negocio. | [Ver](./docs/9-Functional-Requirements-Document.md) |
| 10 | Non-Functional Requirements | NFR de performance, seguridad, IA, i18n, accesibilidad, observabilidad y despliegue. | [Ver](./docs/10-Non-Functional-Requirements.md) |
| 11 | Data Seed Strategy | Estrategia seed reproducible para demo, QA y desarrollo (`is_seed`, reset surgical). | [Ver](./docs/11-Data-Seed-Strategy.md) |
| 12 | Architecture Vision & Principles | Decisión arquitectónica principal (Modular Monolith + Clean/Hex + REST + PostgreSQL + LLMProvider). | [Ver](./docs/12-Architecture-Vision-and-Principles.md) |
| 13 | System Architecture Document | Vistas C4 L1/L2/L3, contenedores, módulos backend, runtime flows. | [Ver](./docs/13-System-Architecture-Document.md) |
| 14 | Backend Technical Design | Capas (Interface/Application/Domain/Ports/Infrastructure), módulos, use cases, DTOs, errores, transacciones. | [Ver](./docs/14-Backend-Technical-Design.md) |
| 15 | Frontend Architecture Design | Next.js + App Router, feature-first, áreas autenticadas vs públicas SEO, integración REST y AI UX. | [Ver](./docs/15-Frontend-Architecture-Design.md) |
| 16 | API Design Specification | Contrato REST `/api/v1`, envelopes, errores, paginación, matriz de autorización por endpoint. | [Ver](./docs/16-API-Design-Specification.md) |
| 17 | AI Architecture & PromptOps Design | `LLMProvider`, adapters, prompt registry, JSON estricto, fallback, timeout 60s, demo mode. | [Ver](./docs/17-AI-Architecture-and-PromptOps-Design.md) |
| 18 | Database Physical Design | PostgreSQL 15+ con Prisma, UUID v4, enums nativos, JSONB acotado, índices query-driven. | [Ver](./docs/18-Database-Physical-Design.md) |
| 19 | Security & Authorization Design | Cookies HTTP-only, captcha, rate limit, RBAC + ownership + assignment, `AdminAction`. | [Ver](./docs/19-Security-and-Authorization-Design.md) |
| 20 | Testing Strategy | Pirámide de pruebas, Vitest + Supertest + MSW + Playwright + tests negativos de autorización. | [Ver](./docs/20-Testing-Strategy.md) |
| 21 | Deployment & DevOps Design | AWS (Amplify + App Runner + RDS + S3 + CloudWatch), Docker, GitHub Actions, entornos. | [Ver](./docs/21-Deployment-and-DevOps-Design.md) |
| 22 | Architecture Decision Records | 46 ADRs formales en 9 categorías (Architecture, Backend, Frontend, DB, AI, Security, API, Testing, DevOps). | [Ver](./docs/22-Architecture-Decision-Records.md) |

---

## Prompt Index

Prompts usados para generar y mantener la documentación, en `/prompts`:

| Prompt | Genera o actualiza | Técnica principal | Link |
|---|---|---|---|
| `0-system-prompt.md` | System prompt base reutilizable para el resto de prompts del proyecto. | Role-based prompting + traceability-first. | [Ver](./prompts/0-system-prompt.md) |
| `1-Domain-Discovery-Report.md` | Domain Discovery Report. | AAA prompting + role-based. | [Ver](./prompts/1-Domain-Discovery-Report.md) |
| `2-Generate-MVP-Scope-Definition.md` | MVP Scope Definition (MoSCoW). | AAA prompting + context-grounded generation. | [Ver](./prompts/2-Generate-MVP-Scope-Definition.md) |
| `3-Generate-Business-Rules.md` | Business Rules Document. | Context-grounded generation + traceability-first. | [Ver](./prompts/3-Generate-Business-Rules.md) |
| `4-User-Roles-Permissions-Matrix.md` | RBAC + ownership matrix. | Role-based prompting + matrix decomposition. | [Ver](./prompts/4-User-Roles-Permissions-Matrix.md) |
| `5-Generate-Domain-Data-Model.md` | Domain Data Model. | Context-grounded generation + traceability-first. | [Ver](./prompts/5-Generate-Domain-Data-Model.md) |
| `6-Generate-AI-features.md` | AI Features Specification. | AAA prompting + human-in-the-loop constraints. | [Ver](./prompts/6-Generate-AI-features.md) |
| `7-Generate-Use-Cases-Specification.md` | Use Cases Specification. | Context-grounded generation + traceability-first. | [Ver](./prompts/7-Generate-Use-Cases-Specification.md) |
| `7.1-Review-and-Update-Documentation-Before-FRD.md` | Coherence review previo al FRD. | Documentation alignment prompting. | [Ver](./prompts/7.1-Review-and-Update-Documentation-Before-FRD.md) |
| `8-Generate-Functional-Requirements-FRD.md` | Functional Requirements Document. | Implementation-ready technical design prompting. | [Ver](./prompts/8-Generate-Functional-Requirements-FRD.md) |
| `9-Generate-Non-Functional-Requirements.md` | Non-Functional Requirements. | AAA prompting + traceability-first. | [Ver](./prompts/9-Generate-Non-Functional-Requirements.md) |
| `11-Generate-Data-Seed-Strategy.md` | Data Seed Strategy. | Implementation-ready technical design prompting. | [Ver](./prompts/11-Generate-Data-Seed-Strategy.md) |
| `12-Generate-Architecture-Vision-and-Principles.md` | Architecture Vision & Principles. | Architecture decision prompting + role-based. | [Ver](./prompts/12-Generate-Architecture-Vision-and-Principles.md) |
| `13-Generate-System-Architecture.md` | System Architecture Document (C4). | Architecture decision prompting + C4 modeling. | [Ver](./prompts/13-Generate-System-Architecture.md) |
| `14-Generate-Backend-Technical-Design.md` | Backend Technical Design Document. | Implementation-ready technical design prompting. | [Ver](./prompts/14-Generate-Backend-Technical-Design.md) |
| `15-Frontend-Architecture-Design.md` | Frontend Architecture Design. | Implementation-ready technical design prompting. | [Ver](./prompts/15-Frontend-Architecture-Design.md) |
| `16-Generate-API-Design-Specification.md` | API Design Specification. | Implementation-ready technical design prompting. | [Ver](./prompts/16-Generate-API-Design-Specification.md) |
| `17-Generate-AI-Architecture-Prompts-Design.md` | AI Architecture & PromptOps Design. | Architecture decision prompting + PromptOps discipline. | [Ver](./prompts/17-Generate-AI-Architecture-Prompts-Design.md) |
| `18-Generate-Database-Physical-Design.md` | Database Physical Design. | Implementation-ready technical design prompting. | [Ver](./prompts/18-Generate-Database-Physical-Design.md) |
| `19-Generate-Security-Authorization-Design.md` | Security & Authorization Design. | Security review prompting + traceability-first. | [Ver](./prompts/19-Generate-Security-Authorization-Design.md) |
| `20-Generate-Testing-Strategy.md` | Testing Strategy. | Implementation-ready technical design prompting. | [Ver](./prompts/20-Generate-Testing-Strategy.md) |
| `21-Generate-Deployment-and-DevOps-Design.md` | Deployment & DevOps Design. | Architecture decision prompting + implementation-ready. | [Ver](./prompts/21-Generate-Deployment-and-DevOps-Design.md) |
| `22-Generate-ADR-Design.md` | Architecture Decision Records Log. | Architecture decision prompting + traceability-first. | [Ver](./prompts/22-Generate-ADR-Design.md) |
| `23-Generate-Epic-Map-Document.md` | EventFlow Epic Map. | AAA prompting + backlog engineering. | [Ver](./prompts/23-Generate-Epic-Map-Document.md) |
| `24-Generate-User-Stories.md` | Catálogo completo de User Stories MVP (150 historias). | AAA prompting + traceability-first. | [Ver](./prompts/24-Generate-User-Stories.md) |
| `25-Generate-Product-Backlog-Prioritized.md` | Product Backlog Prioritized (P0–P4). | AAA prompting + prioritization framework. | [Ver](./prompts/25-Generate-Product-Backlog-Prioritized.md) |

### Prompts de management — User Story Lifecycle

Los prompts en [`/prompts/management/`](./prompts/management/) orquestan el ciclo de vida iterativo de cada User Story. Cada uno invoca una EventFlow Skill específica (ver siguiente sección):

| Prompt | Skill invocada | Output observado |
|---|---|---|
| [`1-User-Stories-Refinement.md`](./prompts/management/1-User-Stories-Refinement.md) | `eventflow-user-story-refinement` | Refina User Story + crea `refinement-reviews/` cuando hay blocking questions. |
| [`1.5-po-ba-decision-resolver.md`](./prompts/management/1.5-po-ba-decision-resolver.md) | `eventflow-po-ba-decision-resolver` | Resuelve preguntas pendientes + crea `decision-resolutions/`. |
| [`2-User-Story-Approval.md`](./prompts/management/2-User-Story-Approval.md) | `eventflow-user-story-approval` | Approval Gate formal (Status → Approved). |
| [`2.5-User-Story-Tech-Spec.md`](./prompts/management/2.5-User-Story-Tech-Spec.md) | `eventflow-user-story-technical-spec` | Genera Technical Specification bajo `technical-specs/<PRIORITY>/<BACKLOG_ID>/`. |
| [`3-User-Story-to-Development.md`](./prompts/management/3-User-Story-to-Development.md) | `eventflow-user-story-to-development-tasks` | Genera Development Tasks bajo `development-tasks/<PRIORITY>/<BACKLOG_ID>/`. |

Para el catálogo ejecutivo completo de prompts, ver [`prompts.md`](./prompts.md).

---

## Management Artifacts

La carpeta [`/management/`](./management/) contiene los artifacts de planning, backlog engineering y User Story lifecycle generados a partir de los prompts 23–25 y los prompts de management.

| Artifact o carpeta | Ubicación real | Propósito inferido desde su contenido | Estado |
| ------------------ | -------------- | ------------------------------------- | ------ |
| Epic Map | [`management/artifacts/1-EventFlow-Epic-Map.md`](./management/artifacts/1-EventFlow-Epic-Map.md) | Agrupa capacidades MVP en épicas trazables hacia FRD/UC/Entidades. | Existente |
| User Stories Coverage Matrix | [`management/artifacts/2-User-Stories-Coverage-Matrix.md`](./management/artifacts/2-User-Stories-Coverage-Matrix.md) | Matriz de cobertura US ↔ FRD/UC/BR/NFR. | Existente |
| Product Backlog Prioritization Input | [`management/artifacts/3-Product-Backlog-Prioritization-Input.md`](./management/artifacts/3-Product-Backlog-Prioritization-Input.md) | Insumos para priorización (valor, riesgo, dependencias). | Existente |
| Product Backlog Prioritized | [`management/artifacts/4-Product-Backlog-Prioritized.md`](./management/artifacts/4-Product-Backlog-Prioritized.md) | Backlog priorizado en P0–P4 con items `PB-P<priority>-<NNN>`. | Existente |
| User Story Template | [`management/templates/user-story.tpl.md`](./management/templates/user-story.tpl.md) | Plantilla canónica utilizada por las 150 User Stories. | Existente |
| User Stories (catálogo) | [`management/user-stories/`](./management/user-stories/) — `US-001-*.md` … `US-150-*.md` + [`README.md`](./management/user-stories/README.md) | 150 User Stories del MVP siguiendo la plantilla. | Existente — 150 historias archivadas |
| Refinement Reviews | [`management/user-stories/refinement-reviews/`](./management/user-stories/refinement-reviews/) | Artifacts generados por `eventflow-user-story-refinement` cuando existen blocking questions. | Existente — observado para `US-099`, `US-100` |
| Decision Resolutions | [`management/user-stories/decision-resolutions/`](./management/user-stories/decision-resolutions/) | Artifacts generados por `eventflow-po-ba-decision-resolver` con las decisiones PO/BA formalizadas. | Existente — observado para `US-099`, `US-100` |
| Technical Specifications | [`management/technical-specs/P0/PB-P0-001/`](./management/technical-specs/P0/PB-P0-001/) | Specs técnicas por User Story aprobada bajo `<PRIORITY>/<BACKLOG_ID>/`. | Existente — observado para `US-099`, `US-100` |
| Development Tasks | [`management/development-tasks/P0/PB-P0-001/`](./management/development-tasks/P0/PB-P0-001/) | Desglose de tareas por área (DB/BE/QA/SEC/OPS/DOC) listo para Sprint Planning. | Existente — observado para `US-099`, `US-100` |

> El flujo end-to-end (refinement → decision resolution → approval → technical spec → development tasks) está completo a la fecha para **US-099** y **US-100** dentro del backlog item `PB-P0-001`. Las 148 User Stories restantes existen archivadas pero no han recorrido el lifecycle completo todavía.

---

## EventFlow Skills

La carpeta [`/.skills/`](./.skills/) contiene las EventFlow Skills reutilizables que encapsulan la lógica invocada por los prompts. Cada skill vive en su propio directorio con un `SKILL.md` que define propósito, inputs/outputs y reglas.

| Skill | Ubicación real | Propósito | Cuándo usarla | Output esperado |
| ----- | -------------- | --------- | ------------- | --------------- |
| `eventflow-domain-discovery` | [`.skills/eventflow-domain-discovery/SKILL.md`](./.skills/eventflow-domain-discovery/SKILL.md) | Define dominio de negocio, alcance MVP, oportunidades IA, journeys, entidades, reglas, riesgos y recomendación estratégica. | Discovery / product definition / domain analysis / MVP planning. | Insumos para el Domain Discovery Report (`docs/1`). |
| `eventflow-user-story-refinement` | [`.skills/eventflow-user-story-refinement/SKILL.md`](./.skills/eventflow-user-story-refinement/SKILL.md) | Refinement & PO/BA review de User Stories. Determina si la historia es clara, valiosa, testable, trazable y MVP-safe. | Después de generar una User Story, antes del Approval Gate. | Update in-place + opcional `refinement-reviews/US-<id>-refinement-review.md`. |
| `eventflow-po-ba-decision-resolver` | [`.skills/eventflow-po-ba-decision-resolver/SKILL.md`](./.skills/eventflow-po-ba-decision-resolver/SKILL.md) | Resuelve preguntas pendientes PO/BA, formaliza decisiones y crea Decision Resolution artifact. | Cuando el refinement retorna `Needs Refinement` con blocking questions. | Update User Story + `decision-resolutions/US-<id>-decision-resolution.md`. |
| `eventflow-user-story-approval` | [`.skills/eventflow-user-story-approval/SKILL.md`](./.skills/eventflow-user-story-approval/SKILL.md) | Approval Gate formal PO/BA contra Definition of Ready. | Después del refinement (y decision resolution si aplica), antes de generar Technical Spec. | Status → Approved / Needs Changes / Blocked / Split Required. |
| `eventflow-user-story-technical-spec` | [`.skills/eventflow-user-story-technical-spec/SKILL.md`](./.skills/eventflow-user-story-technical-spec/SKILL.md) | Technical Specification de la User Story aprobada. No genera código. | Después del Approval Gate, antes del desglose de tareas. | `management/technical-specs/<PRIORITY>/<BACKLOG_ID>/US-<id>-technical-spec.md`. |
| `eventflow-user-story-to-development-tasks` | [`.skills/eventflow-user-story-to-development-tasks/SKILL.md`](./.skills/eventflow-user-story-to-development-tasks/SKILL.md) | Desglose en Development Tasks listas para Sprint Planning. | Después de la Technical Specification. | `management/development-tasks/<PRIORITY>/<BACKLOG_ID>/US-<id>-development-tasks.md`. |

---

## Recommended Workflow

La estructura real del repositorio permite deducir el siguiente flujo end-to-end:

### Fase 1 — Documentación SDLC (prompts 0–22)

Generación secuencial de `/docs/1` a `/docs/22` siguiendo el orden numérico de los prompts. La cadena documental está descrita en detalle en [`prompts.md`](./prompts.md) §7. Esta fase está **completa**.

### Fase 2 — Backlog engineering (prompts 23–25)

1. Prompt `23-Generate-Epic-Map-Document.md` → `management/artifacts/1-EventFlow-Epic-Map.md`.
2. Prompt `24-Generate-User-Stories.md` → 150 archivos `US-001-*.md` … `US-150-*.md` + `management/artifacts/2-User-Stories-Coverage-Matrix.md`.
3. Prompt `25-Generate-Product-Backlog-Prioritized.md` → `management/artifacts/3-Product-Backlog-Prioritization-Input.md` + `management/artifacts/4-Product-Backlog-Prioritized.md`.

Esta fase está **completa**.

### Fase 3 — User Story Lifecycle (prompts de management, iterativo por historia)

Para cada User Story:

```text
1. prompts/management/1-User-Stories-Refinement.md
   → invoca eventflow-user-story-refinement
2. prompts/management/1.5-po-ba-decision-resolver.md (si hay blocking questions)
   → invoca eventflow-po-ba-decision-resolver
3. prompts/management/1-User-Stories-Refinement.md (segunda pasada opcional de validación)
4. prompts/management/2-User-Story-Approval.md
   → invoca eventflow-user-story-approval (Status → Approved)
5. prompts/management/2.5-User-Story-Tech-Spec.md
   → invoca eventflow-user-story-technical-spec
6. prompts/management/3-User-Story-to-Development.md
   → invoca eventflow-user-story-to-development-tasks
```

Esta fase está **parcialmente completa**: el ciclo end-to-end se ha ejecutado para `US-099` y `US-100` dentro de `PB-P0-001`. Las 148 historias restantes aguardan su turno.

### Workflow observations

- El orden Fase 1 → Fase 2 → Fase 3 se deduce de la numeración de prompts y de la cadena de dependencias declarada en los propios archivos.
- El orden dentro de la Fase 3 se confirma por las invocaciones explícitas de skills en cada prompt de management.
- La prioridad y orden de ejecución de las User Stories **no** sigue la numeración `US-<id>`, sino el `Backlog Execution Order` definido en `management/artifacts/4-Product-Backlog-Prioritized.md` (regla explicitada por el skill `eventflow-user-story-to-development-tasks`).

---

## Traceability

El proyecto conecta cinco capas mediante referencias verificables en archivos reales:

```text
Prompts (/prompts/, /prompts/management/)
   ↓ generan
Documentation (/docs/1 … /docs/22)
   ↓ alimenta
Management artifacts (/management/artifacts/, /management/templates/)
   ↓ derivan
User Stories (/management/user-stories/US-001..US-150)
   ↓ procesadas vía
EventFlow Skills (/.skills/)
   ↓ producen
Development outputs (/management/technical-specs/, /management/development-tasks/)
```

Cada User Story refinada contiene referencias `Traceability` hacia FRD, Use Cases, Business Rules, NFRs y ADRs reales en `/docs/`. Cada Technical Spec y cada Development Tasks file mapea cada AC a un section del spec y cada task a ≥1 AC + ≥1 section del Technical Spec.

---

## Academic / Portfolio Readiness

Este repositorio está organizado para:

- **Evaluación académica:** documentación SDLC completa, trazabilidad explícita, decisiones formalizadas y deliverables empaquetados.
- **Trazabilidad documental:** cada artifact referencia explícitamente sus fuentes (Discovery → MVP Scope → Business Rules → … → ADRs → Epic Map → User Stories → Technical Spec → Development Tasks).
- **Generación asistida por IA:** todo prompt está versionado en `/prompts/` y cada skill EventFlow en `/.skills/` con su `SKILL.md` documentado.
- **Planificación de desarrollo:** Product Backlog Prioritized + 150 User Stories + Technical Specs + Development Tasks listos para Sprint Planning.
- **Evidencia de prompts:** [`prompts.md`](./prompts.md) actúa como catálogo ejecutivo con técnica de prompting, inputs y outputs reales.
- **Evidencia de arquitectura:** 46 ADRs formales en [`docs/22-Architecture-Decision-Records.md`](./docs/22-Architecture-Decision-Records.md) + decisiones PO/BA en `decision-resolutions/`.
- **Preparación para implementación:** Technical Specs y Development Tasks para `US-099` y `US-100` (`PB-P0-001`) listos para Sprint Planning; el resto del catálogo aguarda procesamiento iterativo.

---

## Current Delivery Status

### Completed documentation

- Discovery, MVP scope, business rules, roles, domain data model.
- AI features, use cases, FRD, NFR, seed strategy.
- Architecture vision, system architecture (C4), backend technical design, frontend architecture, API design.
- AI architecture & PromptOps, database physical design.
- Security & authorization design, testing strategy, deployment & DevOps design.
- 46 ADRs formalizados en `/docs/22`.
- Paquete académico final en `/deliverables/0` a `/deliverables/7`.

### Completed backlog engineering

- Epic Map en `management/artifacts/1-EventFlow-Epic-Map.md`.
- 150 User Stories archivadas siguiendo `management/templates/user-story.tpl.md`.
- User Stories Coverage Matrix.
- Product Backlog Prioritized (P0–P4).

### Completed User Story lifecycle (parcial)

Flujo end-to-end completado para:

- **US-099 — Prisma schema declarativo** (Approved 2026-06-09).
- **US-100 — Prisma migrations baseline + multi-environment** (Approved 2026-06-10).

Ambas dentro del backlog item `PB-P0-001`, con `decision-resolutions/`, `refinement-reviews/`, `technical-specs/P0/PB-P0-001/` y `development-tasks/P0/PB-P0-001/` reales en el repositorio.

### Pending implementation evidence

- No existe código fuente del backend Node.js + Express + TypeScript en este repositorio.
- No existe código fuente del frontend Next.js + App Router en este repositorio.
- No existe `prisma/schema.prisma`, migraciones ni scripts de seed implementados.
- No existen suites de pruebas ejecutables.

### Pending deployment evidence

- No existe URL pública desplegada (Amplify Hosting / App Runner) que demuestre la aplicación.
- No existen pipelines de GitHub Actions ejecutados.
- No existen recursos AWS provisionados (RDS, S3, Secrets Manager, CloudWatch).

### Pending pull request evidence

- No hay PRs reales mergeados que implementen los módulos descritos en `/deliverables/7-Pull-requests.md`.
- El documento de PRs funciona como **plan recomendado** y placeholder de evidencia futura.

### Pending visual/demo evidence

- No existen capturas, mockups ni video demo.
- No existen artefactos de Figma vinculados.
- No existe reporte de ejecución de tests ni cobertura.

Cualquier ítem marcado como pendiente en este README sólo debe declararse completado cuando exista evidencia verificable en el repositorio.
