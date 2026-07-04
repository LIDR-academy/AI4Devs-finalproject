> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras.

---

> # ⚠️
> **Aviso importante sobre este documento**
>
> Este fichero `prompts.md` ha sido **generado con ayuda de IA (Claude Desktop)** a partir del historial de conversaciones de la fase de planificación del proyecto. Los prompts recogidos aquí son representativos pero **pueden no ser 100% exactos** — son reconstrucciones fieles de lo que se usó, no copias literales volcadas en tiempo real.
>
> **La fuente de verdad absoluta de todos los prompts utilizados durante el desarrollo es el log automático generado por un hook agnóstico de agente inyectado en el repositorio desde el inicio de la implementación:**
>
> **Prompt log actual**: 👉[`prompts-log.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/prompts-log.md)
> 
> **Prompt log histórico**: 
> 
> 🗃️Del 30/04/2026 al 31/05/2026: [`20260430-20260531-prompts-log.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/20260430-20260531-prompts-log.md)
>
> Dicho log captura cada prompt tal y como fue enviado al agente, en tiempo real, independientemente de la herramienta utilizada (Claude Code CLI, GitHub Copilot CLI, Cursor). Este fichero `prompts.md` cubre principalmente la **fase de planificación previa al primer commit**, que ocurrió en Claude Desktop y no está capturada por el hook.

---

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)
8. [Retrospectiva final](#8-retrospectiva-final)

---

## 1. Descripción general del producto

**Prompt 1:**

> **Propósito:** Generar el PRD inicial de AgentHub a partir de una idea y un spike técnico ya validado.
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai) con el skill `/prompt-engineer`
> **Fase:** Diseño — Phase 0
>
> Prompt enviado al agente generador del PRD (extracto del prompt engineered):
>
> ```text
> # Role
> Senior Product Manager with hands-on experience designing API-first developer
> platforms and AI-powered tooling for engineering teams.
>
> # Objective
> Produce a complete, structured Product Requirements Document (PRD) for AgentHub —
> an AI agent orchestration dashboard that is the final project of the AI4Devs
> master programme.
>
> # Context
> AgentHub is an Agent Orchestration Dashboard that allows software engineers and
> tech leads to orchestrate AI coding agents (Claude Code, GitHub Copilot CLI) from
> any device, including mobile. The system exposes a dashboard showing agent status,
> prompt input, and human-in-the-loop confirmation workflows.
>
> Validated technical decisions from the spike phase:
> - Backend: Spring Boot 4.0.1 + Spring AI 2.0.0-M4
> - Agent execution: Claude Code CLI via ProcessBuilder in headless mode
>   (--print --output-format stream-json)
> - Spec-driven development: OpenSpec slash commands (/opsx:propose, /opsx:apply,
>   /opsx:archive) executed natively by Claude Code
> - Agent runner abstraction: vendor-agnostic AgentRunner interface
> - Human-in-the-loop confirmation is a first-class feature, not an afterthought
> ```
>
> **Resultado:** PRD v1.0 de 17 secciones, ~80KB, que sirvió de base para todas las iteraciones posteriores hasta la v2.1 actual.
> **Referencia:** [`docs/prd.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/prd.md)

---

**Prompt 2:**

> **Propósito:** Extraer una especificación de producto orientada a UX a partir del prototipo interactivo de Lovable, para complementar el PRD técnico con los flujos de usuario reales.
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai) con el skill `/prompt-engineer`
> **Fase:** Diseño — Phase 0 (UX Prototype)
>
> Prompt enviado al agente de extracción UX (extracto):
>
> ```text
> # Role
> You are a senior product manager and UX analyst. You are reviewing a live,
> interactive Lovable prototype of AgentHub.
>
> # Objective
> Produce a UX and feature-focused PRD derived exclusively from what is visible
> and implemented in the Lovable prototype. Do not invent features not shown.
>
> # User journey stages to document:
> 1. Onboarding and project configuration (Linear + GitHub integration)
> 2. Main dashboard (Kanban board with agent status)
> 3. Assign ticket to agent (provision agent flow)
> 4. Ticket detail view (logs, metadata, agent activity)
> 5. Human-in-the-loop prompt UI (proposal review, send back with instructions)
> 6. PR review flow
>
> # Output format
> Structured markdown: Product Overview, Primary User Persona, User Journey Map
> (table), Feature Specifications per section, UX Principles Observed, Open Questions
> ```
>
> **Resultado:** Especificación UX que documentó los 6 flujos principales del prototipo, los principios de diseño observados, y las preguntas abiertas que guiaron el diseño del frontend.
> **Referencia:** [`docs/use-cases.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/use-cases.md)

---

**Prompt 3:**

> **Propósito:** Ciclo iterativo de "roast-and-fix" para llevar el PRD de v1.0 a v2.1 — revisión crítica seguida de correcciones quirúrgicas con referencias exactas al texto.
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai) — múltiples sesiones iterativas
> **Fase:** Diseño — refinamiento iterativo
>
> Patrón de prompt usado en cada ciclo:
>
> ```text
> Roast the docs folder in the aregall-agenthub directory. Score it between 0 to 10
> and, in case we don't reach at least 9, propose fixes with exact text references
> before any prompt is written.
> ```
>
> Seguido de prompts de corrección quirúrgica generados por el skill `/prompt-engineer` con referencias exactas al texto a modificar (línea por línea, sin reescrituras completas).
>
> **Resultado:** PRD v2.1 con puntuación 10/10 en consistencia de entidades, ausencia de contradicciones tecnológicas, y self-containment para sub-agentes. Eliminación de `NG-09` (que excluía los tests), adición de `§10.8 Test Strategy` y `§9.16 CI/CD Pipeline`.
> **Referencia:** Historial de conversación completo disponible en sesiones de Claude.ai del proyecto — ver también [`docs/ai-usage.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/ai-usage.md)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

> **Propósito:** Generar `docs/architecture.md` a partir de la sección §11 del PRD, con diagramas C4 L1/L2/L3 en Mermaid y el inventario de servicios.
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai)
> **Fase:** Diseño — Phase 0
>
> ```text
> Extract docs/architecture.md as a standalone document from docs/prd.md §11
> System Architecture Overview. Include:
> - C4 Level 1 (System Context) Mermaid diagram
> - C4 Level 2 (Container) Mermaid diagram
> - C4 Level 3 (Component) Mermaid diagram for the backend API
> - Service inventory table with technology, responsibility, and port
> - Spike-validated implementation notes from the spring-ai-claude-wrapper spike
> Follow exactly the entity names from docs/data-model.md throughout.
> Add a version header (Version: 1.0).
> ```
>
> **Resultado:** [`docs/architecture.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/architecture.md) con diagramas C4 en tres niveles, inventario completo de servicios y notas de spike.
> **Referencia:** [`docs/architecture.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/architecture.md)

---

**Prompt 2:**

> **Propósito:** Investigar el estado del arte de monorepos Java + React en 2026 para definir la estructura del proyecto antes del primer commit.
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai) con el skill `/prompt-engineer` + Claude Code CLI
> **Fase:** Implementación — Phase 1 (scaffold US-00)
>
> Extracto del prompt de investigación:
>
> ```text
> You are a senior Java and full-stack architect. Research the current best practices
> for structuring a Java monorepo containing a Spring Boot 4.0.6 backend and a React
> SPA frontend in 2026. Evaluate Nx and alternatives for mixed-language monorepo
> orchestration. Produce:
> 1. Recommended directory layout with annotations
> 2. Maven Wrapper + Spring Initializr conventions for Spring Boot 4.0.6
> 3. Vertical slice package structure (NOT hexagonal — no *Port interfaces)
> 4. Minimal application.yml (YAML only, no .properties)
> 5. Spotless 3.x with Google Java Format + Checkstyle plugin blocks
> 6. ArchUnit rules for vertical slice enforcement
> 7. RestAssured + Testcontainers + WireMock Testcontainer base test class
> ```
>
> **Resultado:** Informe de investigación que estableció la estructura definitiva del monorepo, el patrón de vertical slicing, y la configuración de todos los plugins de calidad de código.
> **Referencia:** Ejecutado sobre el repositorio real — estructura reflejada en `backend/`, `frontend/`, `e2e/`

---

**Prompt 3:**

> **Propósito:** Actualizar `docs/architecture.md` con los hallazgos del spike real una vez el código fue revisado.
> **Herramienta:** Claude Code CLI
> **Fase:** Implementación — validación post-spike
>
> ```text
> Review the spring-ai-claude-wrapper spike codebase at
> /Users/arnau.aregall/git/arnau/master-ai4devs/spikes/spring-ai-claude-wrapper
> and all AgentHub documentation. Identify findings or architectural gaps.
> For each finding: severity, document, section, finding, proposed fix with
> exact text. Evaluate accuracy, completeness, consistency, traceability,
> and PRD alignment. Produce a prioritised findings report.
> ```
>
> **Resultado:** Informe de hallazgos con correcciones aplicadas a `docs/architecture.md` y `docs/spikes/spring-ai-claude-wrapper/README.md` — alineación entre el código real del spike y la documentación.
> **Referencia:** [`docs/spikes/spring-ai-claude-wrapper/README.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/spikes/spring-ai-claude-wrapper/README.md)

---

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

> **Propósito:** Evaluar Base UI + Tailwind CSS 3 como sistema de componentes para el frontend y determinar la solución para el Kanban drag-and-drop.
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai) con el skill `/prompt-engineer`
> **Fase:** Diseño frontend — Phase 3
>
> ```text
> Fetch https://base-ui.com/llms.txt and evaluate @base-ui/react against AgentHub's
> component needs. Evaluate @dnd-kit/core + @dnd-kit/sortable for the Kanban gap.
> Produce: component coverage map, Tailwind CSS v3 compatibility assessment,
> drag-and-drop recommendation with code sketch, combined stack verdict (YES/NO),
> and the exact docs/architecture.md addition block.
> ```
>
> **Resultado:** Decisión de adoptar `@base-ui/react` v1.4.1 + `@dnd-kit/core` + Tailwind CSS 3. Bloque de texto añadido a `docs/architecture.md` sección Frontend.
> **Referencia:** [`docs/architecture.md` — sección Frontend](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/architecture.md)

---

**Prompt 2:**

> **Propósito:** Extraer la especificación de diseño visual del prototipo Lovable para guiar la implementación del frontend por agentes.
> **Herramienta:** Claude in Chrome (browser automation) con el skill `/prompt-engineer`
> **Fase:** Diseño frontend — Phase 3
>
> ```text
> Navigate https://lovable.dev/projects/79049098-9bed-476e-9c00-a122d9114d3c.
> Follow the complete user flow: login → configure Linear → create work project →
> open Kanban board → provision agent → open In Progress side panel → open Review
> side panel → send back with instructions.
> For every screen: extract colours (hex + Tailwind CSS 3 class), typography
> (font family, size, weight as Tailwind), spacing and layout (as Tailwind),
> component anatomy tables. Produce docs/frontend-design-spec.md.
> ```
>
> **Resultado:** Especificación de diseño visual completa por pantalla — tokens de color, tipografía, anatomía de componentes con clases Tailwind CSS 3.
> **Referencia:** [`docs/frontend-design-spec.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/frontend-design-spec.md)

---

**Prompt 3:**

> *(Sección cubierta con los prompts 1 y 2 — sin prompt adicional significativo para esta subsección.)*

---

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

> **Propósito:** Generar `AGENTS.md` como fuente única de verdad para agentes de IA trabajando en el repositorio.
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai)
> **Fase:** Diseño — Phase 0
>
> ```text
> Generate AGENTS.md at the repository root. This is the primary source of truth
> for any AI coding agent working on this repository. Include: project overview,
> repository layout with one-line descriptions, backend conventions (vertical slice
> architecture — NOT hexagonal, Spring Data JDBC, Flyway naming), frontend
> conventions (React 18 + Vite 5 + Tailwind CSS 3 + Base UI), testing conventions
> (Testcontainers + WireMock + RestAssured + ArchUnit), and a skills table
> referencing all .ai-specs/skills/ available.
> ```
>
> **Resultado:** [`AGENTS.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/AGENTS.md) — fichero de instrucciones para Claude Code CLI, GitHub Copilot CLI, y Cursor, con symlinks a `.github/copilot-instructions.md` y `CLAUDE.md`.

---

**Prompt 2:**

> *(Estructura derivada de la investigación de monorepo — ver §2.1 Prompt 2)*

---

**Prompt 3:**

> *(Sin prompt adicional significativo para esta subsección)*

---

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

> **Propósito:** Investigar el estado del arte de CLI de agentes de IA en 2026, evaluar el impacto del cambio de billing de GitHub Copilot, y generar el documento de investigación de runners.
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai) + búsquedas web
> **Fase:** Diseño — decisiones de infraestructura
>
> ```text
> Research the current state of agentic CLI tooling as of April 2026. Evaluate:
> Claude Code CLI, GitHub Copilot CLI (usage-based billing from June 1 2026),
> OpenCode, Gemini CLI, Cursor CLI, OpenAI Codex CLI (GPT-5.4/5.5).
> Produce docs/agentic-runners-research.md covering: landscape overview table,
> runner architecture decision, Copilot billing risk register (OQ-11),
> OpenCode risk assessment, Cursor CLI assessment, budget plan (€50 max),
> and monitoring checklist.
> ```
>
> **Resultado:** [`docs/agentic-runners-research.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/agentic-runners-research.md) — documento de investigación de 9 secciones con decisiones de runner, análisis de costes, y plan de presupuesto para el desarrollo del master.

---

**Prompt 2:**

> *(CI/CD pipeline especificado en PRD §9.16 — FR-97 a FR-101. Implementación pendiente Phase 5)*

---

**Prompt 3:**

> *(Sin prompt adicional significativo para esta subsección)*

---

### **2.5. Seguridad**

**Prompt 1:**

> **Propósito:** Verificar que las prácticas de seguridad del proyecto están correctamente documentadas y no hay secrets hardcodeados en el código generado por agentes.
> **Herramienta:** Claude Code CLI
> **Fase:** Implementación — revisión transversal
>
> ```text
> Review all files in backend/src/ for security issues: hardcoded secrets,
> API keys, or credentials in source code or application.yml. Verify that:
> - GitHub OAuth credentials use ${GITHUB_CLIENT_ID} and ${GITHUB_CLIENT_SECRET}
> - Anthropic API key uses ${ANTHROPIC_API_KEY}
> - Database password uses ${DB_PASSWORD}
> - JWT secret uses ${JWT_SECRET}
> Report any finding with file path and line number.
> ```
>
> **Resultado:** Confirmación de que ningún secret está hardcodeado. Variables de entorno correctamente referenciadas en `application.yml` con valores por defecto seguros para desarrollo local.

---

**Prompt 2:**

> *(Sin prompt adicional significativo para esta subsección)*

---

**Prompt 3:**

> *(Sin prompt adicional significativo para esta subsección)*

---

### **2.6. Tests**

**Prompt 1:**

> **Propósito:** Añadir la estrategia de tests al PRD como NFRs formales tras descubrir que `NG-09` excluía los tests, contradiciendo los requisitos del master.
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai) con el skill `/prompt-engineer`
> **Fase:** Diseño — corrección post-tutoría
>
> ```text
> Modification 2 — Add §10.8 Test Strategy to §10 Non-Functional Requirements.
> The development approach is TDD: AI agents building backend features are instructed
> to write tests first. Backend tests use Spring integration tests backed by
> Testcontainers (PostgreSQL container). Unit tests target domain logic and state
> machine transitions.
> Frontend testing: Vite + Vitest for unit and component tests.
> E2E: Cypress with Cucumber feature files targeting the primary flow.
> Add NFR-40 through NFR-44 with exact requirement text.
> ```
>
> **Resultado:** `§10.8 Test Strategy` añadida al PRD con NFR-40 (integración Testcontainers), NFR-41 (unit tests estado máquina), NFR-42 (Vitest frontend), NFR-43 (Cypress E2E), NFR-44 (CI verde como gate para ECR push).

---

**Prompt 2:**

> *(Sin prompt adicional significativo para esta subsección)*

---

**Prompt 3:**

> *(Sin prompt adicional significativo para esta subsección)*

---

## 3. Modelo de Datos

**Prompt 1:**

> **Propósito:** Generar `docs/data-model.md` como documento standalone a partir del PRD, con tipos exactos, constraints, ERD y decisiones de diseño por entidad.
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai)
> **Fase:** Diseño — Phase 0
>
> ```text
> Extract docs/data-model.md as a standalone document from docs/prd.md §12 Data Model.
> Include for each of the 8 entities (user, work_project, architecture_profile, ticket,
> agent_run, run_log_chunk, proposal_review, audit_log):
> - All fields with exact PostgreSQL types and constraints
> - Primary key, foreign keys, unique constraints
> - Design decisions explaining non-obvious choices
> Generate a Mermaid ERD with all entities, fields, and relationships.
> Use only canonical entity names — no aliases or variations.
> ```
>
> **Resultado:** [`docs/data-model.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/data-model.md) con las 8 entidades completas, ERD Mermaid, y decisiones de diseño explicadas.

---

**Prompt 2:**

> **Propósito:** Verificar consistencia de nombres de entidades en todos los documentos tras múltiples iteraciones — detectar residuos del schema antiguo.
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai) — ciclo roast-and-fix
> **Fase:** Diseño — refinamiento
>
> ```text
> Review §13 Success Metrics measurements in docs/prd.md.
> Find all references to stale entity names: execution_run, execution_phase,
> openspec_artefact, ExecutionTraceRepository.
> Replace with canonical names: agent_run, run_log_chunk, proposal_review,
> AgentRunRepository.
> Apply surgical fixes with exact text references — do not rewrite sections.
> ```
>
> **Resultado:** Eliminación de todos los residuos del schema antiguo en §13. Consistencia total de nombres canónicos en los 5 documentos de `docs/`.

---

**Prompt 3:**

> *(Sin prompt adicional significativo — el modelo de datos se mantuvo estable tras el segundo ciclo de corrección)*

---

## 4. Especificación de la API

**Prompt 1:**

> **Propósito:** Generar los endpoints de la API REST a partir de los FRs del PRD, con el agente instruyendo el desarrollo de los controllers en vertical slice.
> **Herramienta:** Claude Code CLI
> **Fase:** Implementación — Phase 1 y Phase 2
>
> ```text
> Implement the REST API endpoints for the agent run pipeline following the vertical
> slice architecture in backend/src/main/java/com/aregall/agenthub/.
> Use Spring Boot 4.0.6 + Spring Data JDBC. No JPA, no RestTemplate.
> Each slice owns its controller, service, and repository.
> Endpoints required:
> - POST /api/v1/agent-runs (delegate ticket, trigger propose phase)
> - GET /api/v1/agent-runs/{id}/stream (SSE stdout streaming)
> - POST /api/v1/agent-runs/{id}/proposals/{proposalId}/review (approve/reject)
> Write Testcontainers integration tests first (TDD). Use RestAssured for assertions.
> Mock GitHub API and Anthropic API with WireMock Testcontainer.
> ```
>
> **Resultado:** Controllers, services y repositories implementados en los slices `agentrun/` y `proposal/`. Tests de integración con Testcontainers + WireMock pasando en `./mvnw verify`.

---

**Prompt 2:**

> *(Sin prompt adicional significativo para esta subsección)*

---

**Prompt 3:**

> *(Sin prompt adicional significativo para esta subsección)*

---

## 5. Historias de Usuario

**Prompt 1:**

> **Propósito:** Orquestar los sub-agentes de backlog planning para generar las historias de usuario a partir del PRD y publicarlas en GitHub Issues.
> **Herramienta:** Claude Code CLI — agente orquestador (`.ai-specs/agents/00-backlog-orchestrator.agent.md`)
> **Fase:** Planificación — backlog generation
>
> Prompt del orquestador (extracto):
>
> ```text
> You are the backlog orchestrator for AgentHub. Coordinate agents 01-04 in order:
> 1. Agent 01 (user-story-writer): derive stories from docs/prd.md §8, §9, §2
> 2. Agent 02 (backlog-prioritizer): prioritize using §1, §3 MoSCoW
> 3. For each Must Have story in parallel:
>    Agent 03 (ticket-breakdown): decompose using §9 FRs + §11 tech stack
>    Agent 04 (effort-estimator): estimate with Fibonacci
>    Skill create-github-issue: publish to ArnauAregall/aregall-agenthub
>    repo with labels, milestones, and project board column Backlog
> Pre-flight: gh auth status, milestones created, labels created,
> project board 1 at https://github.com/users/ArnauAregall/projects/1
> ```
>
> **Resultado:** 18 historias de usuario generadas, priorizadas, y publicadas como GitHub Issues con labels, milestones por fase, y añadidas al GitHub Projects Kanban board.
> **Referencia:** [`docs/backlog/user-stories.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md) + [GitHub Issues](https://github.com/ArnauAregall/aregall-agenthub/issues)

---

**Prompt 2:**

> **Propósito:** Generar el skill `create-github-issue` para publicar stories y tickets automáticamente con los metadatos correctos (labels, milestones, project board).
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai) con el skill `/prompt-engineer`
> **Fase:** Planificación — tooling de backlog
>
> ```text
> Create .ai-specs/skills/create-github-issue/SKILL.md following the conventions
> of .ai-specs/skills/create-user-story/SKILL.md.
> The skill receives a User Story or Work Ticket and publishes it as a GitHub Issue
> in ArnauAregall/aregall-agenthub using gh CLI.
> Hardcode: repo ArnauAregall/aregall-agenthub, project board number 1,
> owner ArnauAregall.
> Include: pre-flight checklist with gh commands to create milestones and labels,
> Story mode and Ticket mode, temp file approach for --body-file,
> gh project item-add command to add to board column Backlog.
> ```
>
> **Resultado:** Skill `create-github-issue` con pre-flight checklist completo, comandos `gh` exactos hardcodeados, y soporte para Story mode y Ticket mode.
> **Referencia:** [`.ai-specs/skills/create-github-issue/SKILL.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/.ai-specs/skills/create-github-issue/SKILL.md)

---

**Prompt 3:**

> *(Sin prompt adicional significativo para esta subsección)*

---

## 6. Tickets de Trabajo

**Prompt 1:**

> **Propósito:** Descomponer cada historia de usuario en tickets de trabajo técnicos usando el sub-agente de ticket breakdown.
> **Herramienta:** Claude Code CLI — sub-agente (`.ai-specs/agents/03-ticket-breakdown.agent.md`)
> **Fase:** Planificación — ticket decomposition
>
> Extracto del prompt del sub-agente:
>
> ```text
> You are the ticket breakdown agent for AgentHub.
> Input: one User Story with acceptance criteria.
> Output: work tickets decomposed by layer (backend / frontend / database / qa).
> For each ticket:
> - Title, type, phase, priority (Must/Should)
> - Technical approach referencing docs/prd.md §9 FRs and docs/data-model.md
> - Acceptance criteria (Gherkin when appropriate)
> - Definition of done checklist
> - Dependencies on other tickets
> Use the tech stack from docs/prd.md §11: Spring Boot 4.0.6, Java 21,
> Spring Data JDBC, Flyway, React 18, Vite 5, Testcontainers, WireMock.
> Vertical slice architecture — no cross-slice dependencies.
> ```
>
> **Resultado:** Tickets de trabajo detallados para cada historia de usuario, almacenados en `docs/backlog/tickets-US-*.md` y publicados como GitHub Issues enlazados a la historia padre.
> **Referencia:** [`docs/backlog/`](https://github.com/ArnauAregall/aregall-agenthub/tree/main/docs/backlog) + [GitHub Issues](https://github.com/ArnauAregall/aregall-agenthub/issues)

---

**Prompt 2:**

> **Propósito:** Generar US-00 (scaffold del proyecto) al detectar que US-01 requería una migración Flyway sin que existiera ningún proyecto base.
> **Herramienta:** Claude Code CLI
> **Fase:** Implementación — Phase 1 (US-00 bootstrap)
>
> ```text
> Implement US-00: Project scaffold — minimal runnable application.
> Bootstrap the AgentHub monorepo at https://github.com/ArnauAregall/aregall-agenthub
> following the research report produced earlier.
>
> Backend (backend/): Spring Boot 4.0.6 via start.spring.io, Maven Wrapper,
> vertical slice package com.aregall.agenthub, Flyway baseline migration,
> Spring Data JDBC, Spotless 3.x (Google Java Format), Checkstyle, ArchUnit,
> RestAssured + Testcontainers base test class, WireMock Testcontainer.
>
> Frontend (frontend/): React 18 + Vite 5 + TypeScript + Tailwind CSS 3,
> @base-ui/react, @dnd-kit/core, TanStack Query v5, Vitest.
>
> Infrastructure: docker-compose.yml at repo root (PostgreSQL 17 + named volume),
> application.yml (YAML only, no .properties), /actuator/health returning 200.
>
> Definition of done: ./mvnw verify passes (Checkstyle + Spotless + ArchUnit +
> Testcontainers integration test green), Vite dev server starts on :5173,
> /actuator/health returns 200, /swagger-ui.html accessible.
> ```
>
> **Resultado:** Scaffold completo del monorepo con backend Spring Boot 4.0.6, frontend React 18 + Vite 5, Docker Compose con PostgreSQL 17, y todos los plugins de calidad configurados. `./mvnw verify` verde desde el primer commit.

---

**Prompt 3:**

> *(Sin prompt adicional significativo para esta subsección)*

---

## 7. Pull Requests

**Prompt 1:**

> **Propósito:** Definir el template de Pull Request adaptado al flujo de AgentHub donde el autor es un agente de IA operando con OpenSpec.
> **Herramienta:** Claude Sonnet 4.6 (Claude.ai)
> **Fase:** Implementación — configuración del repositorio
>
> ```text
> Adjust the following standard MR template for a project mainly coded by AI agents
> using OpenSpec within the AgentHub mono-repository (backend, frontend, e2e).
> The human reviewer is the Tech Lead. Key sections needed:
> - OpenSpec Traceability (agent run ID, ticket, runner, spec archive path,
>   proposal review link) — auto-populated by AgentHub archive phase
> - Acceptance criteria coverage table (AC per row, status column)
> - What the agent changed (from OpenSpec task list)
> - What the agent did NOT implement (explicitly deferred ACs)
> - Human review checklist (not self-review — reviewer is the Tech Lead):
>   spec alignment, code quality (ArchUnit, Spotless, no RestTemplate,
>   no .properties, no @MockBean for HTTP), tests, database, OpenAPI, follow-ups
> ```
>
> **Resultado:** Template de PR en `.github/pull_request_template.md` con sección de trazabilidad OpenSpec, tabla de ACs, y checklist orientado al Tech Lead revisor.
> **Referencia:** [`.github/pull_request_template.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/.github/pull_request_template.md)

---

**Prompt 2:**

> *(Las PRs son generadas por Claude Code CLI al completar la fase de archive de cada agent run — el prompt es el ARCHIVE_PROMPT constante del AgentRunService, no un prompt ad-hoc)*

---

**Prompt 3:**

> *(Sin prompt adicional significativo para esta subsección)*

---

## 8. Retrospectiva final

**Prompt 1:**

> **Propósito:** Generar un informe cuantitativo del uso de IA a lo largo de todo el proyecto, contando directamente
> desde el log de auditoría en lugar de estimar de memoria.
> **Herramienta:** Claude Code CLI
> **Fase:** Cierre del proyecto — documentación final
>
> ```text
> Parse prompts-log.md and 20260430-20260531-prompts-log.md end to end. Produce a
> report counting: total prompts, distinct sessions, tool split (Claude Code vs
> GitHub Copilot vs unattributed) by session ID pattern, model usage breakdown,
> activity by month, and skill/sub-agent invocation counts (OpenSpec family,
> wrapper skills, review skills, handoff). Every number must be counted directly
> from the log, nothing estimated. Conclude with what the data shows actually
> drove velocity, not just raw token/time totals.
> ```
>
> **Resultado:** `docs/ai4devs-final-delivery/retrospective/ai-development-report.md` — métricas verificadas del ciclo de vida completo (781 prompts, 186 sesiones, ~9.5 semanas).
> **Referencia:** [`ai-development-report.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/ai4devs-final-delivery/retrospective/ai-development-report.md)

---

**Prompt 2:**

> **Propósito:** Complementar el informe cuantitativo con una retrospectiva cualitativa, entrevistando al propio autor
> del proyecto sobre momentos concretos extraídos del log de prompts.
> **Herramienta:** Claude Code CLI
> **Fase:** Cierre del proyecto — documentación final
>
> ```text
> Using the prompt log and the quantitative report as source material, interview
> me directly about specific moments in the project's history — tool-switching
> behavior, the busiest single day, course corrections, the /handoff pattern,
> pre-emptive guardrails against known AI failure modes. Ask me what actually
> happened and why, quote me directly, and don't smooth over an honest limitation
> if I state one. Close with what I'd change starting over.
> ```
>
> **Resultado:** `docs/ai4devs-final-delivery/retrospective/ai-development-human-retrospective.md` — reflexión honesta sobre aciertos y limitaciones, incluyendo la dificultad de trasladar este flujo a un equipo.
> **Referencia:** [`ai-development-human-retrospective.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/ai4devs-final-delivery/retrospective/ai-development-human-retrospective.md)
