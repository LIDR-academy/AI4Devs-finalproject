## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Iván Gómez Rodríguez

### **0.2. Nombre del proyecto:**

Sport IT Service Management

### **0.3. Descripción breve del proyecto:**

Sport ITSM is an IT Service Management platform dedicated to supporting the Sports Competition Management System. It provides a centralized environment for managing incidents, service requests, problems, changes, releases, assets, and operational processes related to the competition platform, ensuring service availability, traceability, and continuous improvement throughout the application lifecycle.

```text
Sports Competition Management System (SCMS)
                 │
                 │ Support & Operations
                 ▼
             Sport ITSM
                 │
      ┌──────────┼──────────┐
      │          │          │
      ├── Incident Management
      ├── Service Request Management
      ├── Problem Management
      ├── Change Management
      ├── Release Management
      ├── Knowledge Base
      ├── Asset & Configuration Management
      └── SLA & Reporting
```

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

> Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

**Product purpose**

The product is **Sport ITSM**, a full **IT Service Management (ITSM) platform** dedicated to supporting the **Sports Competition Management System (SCMS)** — an application for managing competitions (tournaments, leagues, and group/division formats). It provides a centralized environment to manage **Incidents, Service Requests, Problems, Changes, Releases, Assets, and operational processes** related to the SCMS platform, ensuring **service availability, traceability, and continuous improvement** across the application lifecycle. The Service Desk acts as the **Single Point of Contact (SPOC)** for the platform's users — players, team managers, tournament organizers, and match officials — while the engineering and operations organization uses the platform to govern platform Changes, Releases, and Assets, all under Service Level Agreements (SLAs).

> **Scope:** Sport ITSM supports the _SCMS platform_, not the sporting operation itself. In-application sport decisions (reschedules, roster changes, result disputes) are made by organizers and officials **inside** SCMS and are out of scope; they reach Sport ITSM only when they surface as a platform defect or an entitled service request. Competition entities (Tournament, Match, Standings…) are therefore the **affected subject** of a ticket, never tickets in their own right. Conversely, **Changes and Releases of the SCMS platform itself** (new versions, features, configuration, hotfixes) are fully **in scope** and governed by the platform.

**Problem it solves**

Competition platforms concentrate user demand into critical live windows — registration deadlines, match days, and finals — when any application failure (standings not updating, brackets not rendering, scores not saving, payments not processed) directly disrupts an event in progress, and when uncontrolled platform changes can trigger those very failures. Without a structured service management function, issues arrive through fragmented channels with no consistent ticket lifecycle, no prioritization of competition-impacting failures, no controlled path for platform changes and releases, and no measurable SLA accountability. Sport ITSM replaces this with a **standardized, auditable, and metric-driven service operation** — spanning support (Incident, Request, Problem) and platform evolution (Change, Release, Asset & Configuration) — that protects service availability when it matters most, aligned with ITIL-based practices.

**Value delivered**

- **Operational consistency:** every interaction follows a controlled lifecycle (logging → categorization → prioritization → assignment → resolution → closure).
- **Event protection:** Major Incident handling and tiered escalation prioritize failures during live competition windows (match days / finals) to minimize time-to-restore.
- **Controlled platform evolution:** Change Management and Release & Deployment Management deliver SCMS changes with risk assessment, approval, and CMDB impact analysis, reducing change-induced Incidents.
- **Accountability:** SLA timers, escalation rules, and audit trails make response and resolution commitments measurable and enforceable.
- **Efficiency:** automated categorization, assignment, and Knowledge-Base self-service deflection reduce manual effort and Mean Time to Resolution (MTTR).
- **Experience:** a Self-Service Portal gives players, organizers, and officials transparency over their tickets and status.
- **Traceability & decision support:** an end-to-end audit trail plus real-time KPIs and dashboards (FCR, MTTR, SLA Compliance, Change Success Rate, CSAT, backlog) drive continual service improvement.

**Target audience (personas)**

- **Player / Competitor:** end user reporting application issues or requesting account services.
- **Team Manager / Captain:** raises team-level support for a team's participation.
- **Tournament Organizer / Admin:** power user configuring competitions; higher entitlement tier.
- **Referee / Match Official:** reports scoring and result-entry issues.
- **League Administrator:** oversees multiple competitions; acts as escalation contact.
- **Service Desk Agent (L1):** first-line operator who logs, triages, and resolves or routes tickets.
- **Application Support Analyst (L2/L3):** platform specialists / engineering resolver group handling escalated work.
- **Change / Release Manager:** governs platform Changes and coordinates SCMS Releases and deployments.
- **Service Owner / Service Manager:** accountable for SCMS service quality, SLAs, and continuous improvement.
- **System Administrator:** configures catalog, workflows, SLAs, CMDB, and access control.

### **1.2. Características y funcionalidades principales:**

> Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

Sport ITSM delivers the following core capabilities, spanning end-user support and platform operations for the SCMS platform:

**1. Ticket Management (Incident & Service Request)** End-to-end ticket lifecycle management with categorization, prioritization (Impact × Urgency → Priority matrix), status tracking, work notes, and closure codes. Handles **Incidents** (platform defects — e.g., standings not updating, bracket not rendering, scores not saving) and **Service Request** fulfillment as distinct but unified workflows. Each ticket records the **affected competition subject** (Tournament, League, Group, Bracket, Fixture, Standings, Registration, Roster, Team, Player Account) without treating it as the ticket itself.

**2. Omnichannel Intake** Capture of tickets from multiple channels — Self-Service Portal, email-to-ticket, in-app help, and phone-logged entries — normalized into a single ticket model with a unique reference number.

**3. Self-Service Portal & Knowledge Base** End-user portal for players, organizers, and officials to submit tickets, track status, and search Knowledge Articles (how-tos, known issues, workarounds). Knowledge-centered deflection reduces ticket volume and improves First Contact Resolution (FCR).

**4. Service Catalog Management** A structured catalog of platform-support Service Offerings with request forms, eligibility rules, and predefined fulfillment workflows — e.g., account creation, role/entitlement and organizer-access provisioning, password reset / account recovery, data export (fixtures, standings, rosters, results), and billing/registration-payment support.

**5. Workflow & Automation Engine** Configurable business rules for automated categorization, routing, and assignment to the correct Resolver Group or Assignment Queue, including skill-based and round-robin assignment and task orchestration.

**6. SLA Management & Escalation** Definition of SLA/OLA targets (response and resolution) per service and priority, with **event-aware policies** that tighten targets during live competition windows (match days / finals). Automated SLA timers, breach warnings, and tiered (functional and hierarchical) escalation enforce service commitments.

**7. Major Incident Management** Dedicated handling for high-impact failures that disrupt an event in progress (e.g., a scoring outage on finals day), with accelerated escalation, coordinated resolver engagement, and stakeholder communication to minimize time-to-restore.

**8. Assignment & Queue Management** Support groups, queues, and workload distribution that route tickets to the appropriate team and provide agents with prioritized work lists.

**9. Problem Management** Linking of recurring Incidents to a Problem record, Root Cause Analysis (RCA), Known Error (KEDB) tracking, and Workaround publication to reduce repeat platform Incidents.

**10. Change Management** Controlled lifecycle for modifications to the SCMS platform (standard, normal, and emergency changes) with risk and impact assessment, CAB-style approval via the Approval Engine, scheduling around competition windows, and change calendars to avoid conflicts with live events.

**11. Release & Deployment Management** Planning, packaging, and coordinated deployment of SCMS versions, with release calendars, rollout/rollback plans, and linkage of releases to the Changes and Configuration Items they deliver.

**12. Asset & Configuration Management (CMDB)** A Configuration Management Database tracking the SCMS platform's Configuration Items (services, environments, components) and their relationships, enabling impact analysis for Incidents, Problems, Changes, and Releases.

**13. Notification Framework** Event-driven notifications (email, push, in-app) to requesters and agents on status changes, assignments, approvals, and SLA breaches, integrated with the platform's participant notification channels.

**14. Approval Engine** Configurable multi-level approval workflows for entitled Service Requests and for Changes/Releases (e.g., organizer-access provisioning, change authorization), with delegation and audit trails.

**15. Reporting, Dashboards & Analytics** Operational and management dashboards exposing key KPIs — FCR, MTTR, MTTA, SLA Compliance Rate, Reopen Rate, Backlog Volume, CSAT, Agent Productivity — plus domain metrics such as time-to-restore for competition-impacting Incidents, Major Incident rate during live windows, Change Success Rate, and release lead time.

**16. Identity & Access Management (RBAC)** Role-based access control aligned with platform personas (Player, Team Manager, Organizer, Official, Agent, Analyst, Change/Release Manager, Service Manager, Administrator), integrated with the platform's identity provider / SSO and enforcing least-privilege access.

**17. Audit Trail & Activity History** Immutable history of all ticket, change, and release transitions, field changes, and user actions to guarantee traceability and compliance across the SCMS application lifecycle.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**

> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.

Sport ITSM is a **modular monolith** built as a single **Nx monorepo** that applies **Domain-Driven Design** (strategic and tactical) and **Hexagonal Architecture (Ports & Adapters)** across both platforms. The diagrams below go from the general to the concrete. The full architecture document — C4 context, context map, tactical model, end-to-end sequences and ADRs — lives in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

#### Containers and technologies

```mermaid
flowchart TB
    USER["Requesters and Service Organization<br/>browser, desktop and mobile"]

    subgraph boundary["Sport ITSM system boundary"]
        WEB["<b>Web Client</b> - apps/web<br/>Angular 20.3, standalone components, signals,<br/>Angular Material 20, Reactive Forms, Transloco<br/>Self-Service Portal, Agent Workspace, Admin Console"]
        API["<b>API</b> - apps/api<br/>NestJS 11 on Express 4, Node.js 20 LTS<br/>Inbound HTTP adapter plus composition root<br/>Passport JWT, class-validator, nestjs-i18n, pino"]
        DB[("<b>PostgreSQL 16</b><br/>single system of record<br/>tickets, SLA timers, catalog, knowledge,<br/>approvals, append-only audit<br/>TypeORM 0.3, synchronize always false")]
    end

    IDP["SCMS Identity Provider / SSO"]
    MAIL["Email Gateway"]
    SCMS["SCMS competition reference data"]

    USER -->|"HTTPS"| WEB
    WEB -->|"HTTPS / JSON REST - typed by libs/shared/contracts<br/>Bearer JWT plus Accept-Language"| API
    API -->|"TCP 5432 - pg driver, migrations only"| DB
    API -->|"validate token and read profile"| IDP
    API -->|"send notification"| MAIL
    API -->|"read competition identifiers - optional, ACL"| SCMS
```

There is deliberately **no message broker, no cache tier and no separate reporting store**: one API process, one database, one client.

#### Layering and the dependency rule

Every bounded context (`incident`, `service-request`, `sla`, `service-catalog`, `knowledge`, `identity-access`, …) is materialized as a set of Nx libraries tagged on three axes — `platform:` / `scope:` / `type:` — and `@nx/enforce-module-boundaries` makes the rule below **mechanical rather than aspirational**.

```mermaid
flowchart LR
    subgraph FE["platform:frontend"]
        F_FEAT["type:feature<br/>routed containers"]
        F_UI["type:ui<br/>presentational"]
        F_DA["type:data-access<br/>HttpClient + signal stores"]
    end

    subgraph SH["platform:shared"]
        CONTRACTS["shared/contracts<br/>DTO types, enums, error codes"]
        SDOM["shared/domain + shared/util"]
    end

    subgraph BE["platform:backend"]
        B_INFRA["type:infrastructure<br/>TypeORM entities, mappers, gateways"]
        B_APP["type:application<br/>use cases"]
        B_DOM["type:domain<br/>aggregates, value objects, ports"]
    end

    APP_API["apps/api - composition root<br/>binds ports to adapters"]

    F_FEAT --> F_UI
    F_FEAT --> F_DA
    F_DA --> CONTRACTS
    B_INFRA --> B_APP
    B_APP --> B_DOM
    B_DOM --> SDOM
    B_INFRA -.->|"implements ports"| B_DOM
    APP_API --> B_INFRA
    APP_API --> B_APP
    APP_API --> CONTRACTS

    FORBIDDEN["FORBIDDEN<br/>domain or application importing NestJS, TypeORM or HTTP<br/>frontend importing backend<br/>context importing another context"]
```

Dependencies point **inward only**: `infrastructure → application → domain`, never the reverse. Domain and application layers contain zero framework, ORM, HTTP or I/O code. Cross-context collaboration (e.g. Incident needing SLA, Approval, Notification or Audit) never becomes an import: the consuming context declares an outbound **port** in its own language and `apps/api` supplies the adapter, so no context-to-context edge ever exists in the Nx graph.

#### Patterns applied and why

| Pattern | Where it applies | Why it was chosen |
| --- | --- | --- |
| **Domain-Driven Design** | One bounded context per ITSM capability | ITSM is a domain with a precise, standardized ubiquitous language (Incident, Problem, Change, SLA, CI, CAB). Modeling it explicitly is what keeps _"a match reschedule is not a ticket"_ enforceable instead of a convention. |
| **Hexagonal (Ports & Adapters)** | Backend, per context | The business rules that matter (Impact × Urgency → Priority, SLA target recalculation, lifecycle transitions) are testable with zero infrastructure, and PostgreSQL/TypeORM/NestJS become replaceable details. |
| **Modular monolith** | Whole system | Fifteen contexts could suggest microservices; delivery is portfolio-scale. One process gives single-transaction consistency and near-zero operational cost, while the Nx boundaries preserve the option to extract a context later. |
| **Nx monorepo + tag boundaries** | Whole system | The architecture is enforced by `pnpm nx lint` in CI, not by review discipline. An illegal dependency fails the build. |
| **Shared typed contracts** | `libs/shared/contracts` | The single permitted coupling between frontend and backend. A breaking API change fails the frontend build immediately — the intended safety property. |
| **Signals-first Angular** | Frontend | Standalone components, `OnPush` everywhere, functional interceptors and signal stores; no NgModules, no external state library. |
| **Event-driven cross-cutting** | Audit, Notification, Reporting | Mutating operations commit first and publish domain events after; a notification outage can never block ticket intake. |

#### Benefits

- **Testability.** Business rules live in framework-free TypeScript. The most valuable tests need no database, no HTTP and no Angular TestBed.
- **Enforced boundaries.** Architectural erosion is caught by the linter, which matters most on a long-lived platform with many capabilities.
- **Evolvability.** Adding `problem`, `change` or `release` in phase 2 is additive: the Incident aggregate already reserves link semantics for them as opaque identifiers.
- **Coherence FE/BE.** One repository, one TypeScript version, one lint/format setup, `nx affected` for changed-only CI, and types that cannot drift between client and server.
- **Replaceable infrastructure.** ORM, identity provider or email gateway are adapters behind ports; swapping one does not touch business logic.

#### Sacrifices and deficits

Honest accounting of what this architecture costs:

- **Ceremony.** A trivial CRUD feature still needs a port, an adapter, a use case, a DTO, a mapper and a contract type. For a small product this is over-engineering; it pays off only because the ITSM domain is genuinely large.
- **Mapping code.** Domain aggregates and TypeORM entities are separate types, so mappers must be written and maintained.
- **A composition root that grows.** Every cross-context collaboration adds one adapter class in `apps/api`. Coupling is not eliminated — it is concentrated in a visible, reviewable place.
- **Single deployable.** Contexts cannot be scaled or released independently; the whole API deploys together, and a defect in one context can affect the process.
- **Eventual consistency in the cross-cutting path.** Audit and notification writes sit outside the ticket transaction. Mitigated with an in-process dispatcher with retry and audit-completeness assertions in acceptance tests, but it is a real trade-off against strict transactional auditing.
- **Learning curve.** DDD + hexagonal + Nx tags is a steep onboarding cost, and the discipline degrades quickly if boundary violations are silenced instead of fixed.

> **Status:** this is the **target architecture**. The Nx workspace (`apps/`, `libs/`) has not been scaffolded yet, so the boundary rules above have not been verified with `pnpm nx lint` / `pnpm nx graph`.

### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

The system is composed of two deployables — the Angular **Web Client** and the NestJS **API** — plus one PostgreSQL system of record. Everything else is an Nx library: each bounded context contributes a **backend hexagon** (`domain` / `application` / `infrastructure`) and, where it has a UI, a **frontend slice** (`feature` / `ui` / `data-access`). The components below are described by responsibility and technology; their allowed dependencies are the ones already shown in §2.1.

#### 2.2.1 Web Client — `apps/web`

The client is an **Angular 20.3** application: standalone components only, signals for state, `OnPush` everywhere, Reactive Forms, Angular Material 20 + CDK, Transloco for i18n. It is a **pure presentation layer**: it holds no authorization decision, derives no Priority and computes no SLA target — it renders what the API decided (NFR-SEC-02).

| Component | Responsibility | Technology |
| --- | --- | --- |
| **Application shell** (`apps/web`) | Bootstrap via `bootstrapApplication` + `provide*` functions, lazy routing, global error handler, theming, cross-context page composition | Angular 20.3, `provideRouter`, `provideHttpClient`, Angular Material theming (SCSS) |
| **Self-Service Portal** | Requester surface: knowledge search first, log an Incident, request a published catalog offering, track own tickets and SLA status, comment, confirm or reject a resolution, submit CSAT | `knowledge/feature`, `incident/feature`, `service-catalog/feature`, `service-request/feature`, `approval/feature` |
| **Agent Workspace** | Supply-side surface: prioritized work list, triage, categorization, the competition-in-progress flag with mandatory justification, work notes, assignment, resolution | `incident/feature`, `service-request/feature`, `knowledge/feature`, SLA countdown rendered by `incident/ui` |
| **Admin Console** | Configuration-as-data surface: taxonomy, Impact × Urgency matrix, SLA policies, catalog offerings, workflows, notification templates, roles and resolver groups | `service-catalog/feature`, `identity-access/feature` + configuration feature libs |
| **Management dashboards** | Operational and management KPI views (FCR, MTTA, MTTR, SLA compliance, backlog) | `reporting/feature` + `reporting/ui` |
| **`type:feature` libs** | Routed containers: orchestrate the store, drive Reactive Forms, own explicit loading / error / empty states | Angular standalone components, signals, Reactive Forms |
| **`type:ui` libs** | Presentational building blocks with zero injected services (`PriorityBadge`, `SlaCountdown`, `StateChip`, `WorkNoteList`, `CompetitionSubjectPicker`) | Angular `input()` / `output()`, `OnPush`, Material + CDK a11y (`FocusTrap`, `LiveAnnouncer`) for WCAG 2.1 AA |
| **`type:data-access` libs** | The **only** outbound edge of the client: typed API services plus injectable signal stores exposing `asReadonly()` / `computed()` | `HttpClient` typed exclusively by `libs/shared/contracts`, Angular signals (no NgRx) |
| **Functional interceptors** | `jwtInterceptor` (Bearer token), `localeInterceptor` (`Accept-Language`), `httpErrorInterceptor` (contract error code → Transloco key) | Angular functional interceptors (`withInterceptors`), Transloco |
| **Route guards** | `authGuard` / `roleGuard` — usability only; never the security boundary | Angular functional guards |

#### 2.2.2 API — `apps/api`

`apps/api` is simultaneously the **inbound HTTP adapter** and the **composition root**: it is the only project allowed to see more than one bounded context, because it is where ports are bound to adapters (ADR-002, ADR-003).

| Component | Responsibility | Technology |
| --- | --- | --- |
| **Controllers** | Thin inbound adapter: route, validate, delegate to a use case, map the result to a contract response. No business logic. | NestJS 11 on Express 4, `@nestjs/swagger` decorators |
| **Global `ValidationPipe`** | Reject unvalidated or unexpected payloads (`whitelist`, `forbidNonWhitelisted`, `transform`) | `class-validator` + `class-transformer` |
| **Auth guards & strategy** | Verify the JWT, resolve the actor and their roles for the use-case authorization check | Passport JWT (`passport-jwt`, `@nestjs/jwt`), `bcrypt` for local credentials |
| **License gating** | `@LicenseFeature()` decorator restricting access to gated capabilities | Custom NestJS decorator + guard |
| **Exception filter** | Map domain errors to a stable, contract-declared error-code envelope (codes are contract, text is not) | NestJS exception filter + `nestjs-i18n` |
| **i18n** | Localize API messages and email templates from `Accept-Language` | `nestjs-i18n` 10 |
| **Logging** | Structured logs with request correlation; no `console.log` | `nestjs-pino` |
| **Health probes** | `/health/live`, `/health/ready` — unprefixed, so Sport ITSM outages are detectable independently of user reports (NFR-CFG-03) | `@nestjs/terminus` |
| **API documentation** | OpenAPI at `/api/docs`, **development only** | `@nestjs/swagger` |
| **Composition root modules** | Bind each port token to its adapter (`{ provide: INCIDENT_REPOSITORY, useClass: TypeOrmIncidentRepository }`), and host the **cross-context adapters** (`SlaPolicyAdapter`, `ApprovalAdapter`, `NotificationAdapter`, `AuditAdapter`) | NestJS DI, `Symbol` injection tokens declared beside each port |
| **Scheduled jobs** | Second inbound adapter: SLA warning/breach sweep and auto-close after the confirmation period | NestJS scheduling over the same application use cases |

#### 2.2.3 Bounded-context libraries

Each context owns its hexagon. Phase 1 scaffolds the MVP contexts; `problem`, `change`, `release` and `asset-config` are **phase 2** (PRD §14.4) and are deliberately not generated yet.

| Context | Phase | Core responsibility | Key model elements |
| --- | --- | --- | --- |
| `incident` | 1 | Incident and Major Incident lifecycle, Impact × Urgency prioritization, agent-set competition-impact flag, work notes, escalation | `Incident` (root), `TicketReference`, `Priority`, `CompetitionImpactFlag`, `CompetitionSubject`, `PriorityCalculator` |
| `service-request` | 1 | Fulfillment of entitled catalog offerings, approval routing, fulfillment tasks | `ServiceRequest` (root) with `FulfillmentTask` entities |
| `sla` | 1 | SLA policy resolution, timer state, pause/resume, warnings, breaches, recalculation on Priority change | `SlaPolicy`, `SlaInstance`; no UI of its own — surfaced inside ticket views |
| `service-catalog` | 1 | Services and Service Offerings, request forms, eligibility rules, publication lifecycle | `Service`, `ServiceOffering` |
| `knowledge` | 1 | Knowledge Articles, authoring lifecycle, audience visibility, full-text search | `KnowledgeArticle` |
| `identity-access` | 0/1 | Authentication, RBAC, least privilege, resolver groups and queues | `User`, `Role`, `ResolverGroup`, `IdentityProviderPort` |
| `approval` | 1 | Configurable approval stages, resolvable approvers, immutable decisions | `ApprovalRequest`, `ApprovalDecision` |
| `notification` | 1 | Event-driven dispatch to requesters, agents, approvers and Major Incident stakeholders | `NotificationDispatch` + templates |
| `audit` | 0 | Append-only activity history; no update or delete capability exists at all | `AuditEntry` |
| `reporting` | 1 | Denormalized read models for operational and management dashboards | read models only, no aggregate |
| `problem`, `change`, `release`, `asset-config` | 2 | RCA/KEDB, change authorization and scheduling, release & deployment, CMDB impact analysis | `Problem`/`KnownError`, `Change`, `Release`, `ConfigurationItem`/`CiRelationship` |

Inside every context the three backend libraries have fixed roles, and the technology allowed in each is what the boundary rules enforce:

| Library | Responsibility | Technology allowed |
| --- | --- | --- |
| `<context>/domain` | Aggregates, entities, value objects, domain services, domain events and **outbound port interfaces** | **Pure TypeScript 5.9 only** — no NestJS, no TypeORM, no HTTP, not even `new Date()` (time arrives through `ClockPort`) |
| `<context>/application` | Use cases: orchestration, transaction boundary and the authorization check expressed in domain terms | TypeScript + `libs/shared/contracts` (types only); still no framework |
| `<context>/infrastructure` | Outbound adapters: TypeORM repositories, persistence entities, explicit mappers, external gateways | TypeORM 0.3, `pg`, NestJS DI |

#### 2.2.4 Shared libraries

| Library | Responsibility | Technology |
| --- | --- | --- |
| `libs/shared/contracts` | The **single typed API surface** shared by both platforms: request/response DTO shapes, enums and error codes. Types only — no logic, no framework, no validation decorators (ADR-007) | TypeScript 5.9 |
| `libs/shared/domain` | Shared kernel primitives used by three or more contexts: `Identity`, `TicketReference`, `ImpactLevel`, `UrgencyLevel`, `Priority`, `DomainEvent`, `StateModel`, `ClockPort` | Pure TypeScript |
| `libs/shared/util` | Pure, dependency-free helpers | Pure TypeScript |

#### 2.2.5 Persistence

**PostgreSQL 16** is the single system of record for every context: tickets, SLA timer timestamps, catalog, knowledge, approvals and the append-only audit trail. Access goes exclusively through **TypeORM 0.3** repositories in `type:infrastructure`, where persistence entities are **separate classes** from domain aggregates with an explicit mapper (ADR-005). `synchronize` is always `false`; the schema evolves only through **migrations** (`pnpm typeorm migration:generate|run|revert -d apps/api/src/data-source.ts`), auto-run only in development. No business rule lives in a trigger or stored procedure. All instants are stored in UTC so SLA timers survive restarts and remain time-zone correct.

#### 2.2.6 Cross-cutting components

```mermaid
flowchart TB
    subgraph inbound["Inbound adapters - apps/api"]
        CTL["Controllers<br/>ValidationPipe, JWT guard,<br/>license gating, i18n, pino"]
        JOB["Scheduled jobs<br/>SLA sweep, auto-close"]
    end

    subgraph core["Bounded context hexagon"]
        UC["application - use cases<br/>transaction boundary + authorization"]
        DOM["domain - aggregates, ports<br/>emits domain events"]
    end

    BUS["InProcessEventPublisher<br/>apps/api - dispatches after commit"]

    subgraph xcut["Cross-cutting subscribers"]
        AUD["audit<br/>append-only AuditEntry"]
        NOT["notification<br/>in-app and email dispatch"]
        RPT["reporting<br/>read-model projections"]
    end

    subgraph outbound["Outbound adapters"]
        REPO["TypeORM repositories<br/>infrastructure"]
        SLAAD["SlaPolicyAdapter<br/>composition root"]
        APRAD["ApprovalAdapter<br/>composition root"]
        ACL["ScmsCompetitionGateway<br/>anticorruption layer + free-text fallback"]
        IDPAD["IdentityProviderAdapter<br/>local credentials now, SSO later"]
        MAILAD["EmailGatewayAdapter"]
        CLK["SystemClock - ClockPort"]
    end

    DB[("PostgreSQL 16")]
    SCMS["SCMS reference data"]
    IDP["SCMS Identity Provider / SSO"]
    MAIL["Email Gateway"]

    CTL --> UC
    JOB --> UC
    UC --> DOM
    UC --> REPO
    UC --> SLAAD
    UC --> APRAD
    UC --> ACL
    UC --> CLK
    UC -->|"publish after commit"| BUS
    BUS --> AUD
    BUS --> NOT
    BUS --> RPT
    REPO --> DB
    AUD --> DB
    RPT --> DB
    NOT --> MAILAD
    MAILAD --> MAIL
    ACL --> SCMS
    IDPAD --> IDP
    CTL --> IDPAD
```

| Component | Responsibility | Technology / placement |
| --- | --- | --- |
| **Domain-event dispatcher** | Single in-process publisher; use cases commit the aggregate first and publish afterwards, so a failing subscriber can never roll back ticket intake (NFR-AVL-03) | `EventPublisherPort` in each context's domain, `InProcessEventPublisher` in `apps/api`; no broker in the MVP |
| **Audit component** | Records an immutable entry for every state transition, field change, assignment, comment, approval, notification and rule execution. Immutability is structural: `AuditRepositoryPort` exposes no update or delete method | `audit` context, TypeORM append-only table |
| **Notification component** | Templated, localizable in-app and email notifications to requesters, agents, approvers and Major Incident stakeholders; every dispatch is recorded against its source record | `notification` context + email gateway adapter, `nestjs-i18n` templates |
| **SLA timer engine** | Attaches a policy at creation, recalculates targets from the original creation time on Priority change, pauses/resumes on configured pending states, raises warnings and breach records, triggers escalation | `sla` context; timer state persisted as UTC timestamps in PostgreSQL, swept by a scheduled job — never in-memory counters |
| **Configuration as data** | Taxonomy, Impact × Urgency matrix, SLA policies, state models, approval chains and notification templates are persisted aggregates edited from the Admin Console, not code | Owning contexts + Admin Console |
| **Observability** | Structured request-correlated logs and liveness/readiness probes | `nestjs-pino`, `@nestjs/terminus` |

#### 2.2.7 External integrations

Every integration is a **port with an adapter**, so none of them is a hard runtime prerequisite for logging a ticket.

| Integration | Purpose | Component |
| --- | --- | --- |
| **SCMS competition reference data** | Read-only lookup of competition identifiers and labels so a ticket can name its affected subject. Sport ITSM consumes no competition calendar and derives no time-based policy from it | `CompetitionSubjectLookupPort` + `ScmsCompetitionGateway` **anticorruption layer**, with a free-text fallback adapter (PRD R10) |
| **SCMS Identity Provider / SSO** | Authentication and profile/entitlement attributes | `IdentityProviderPort` in `identity-access/domain`; local-credential adapter first, SSO adapter later (FR-IAM-04) |
| **Email gateway** | Outbound notification delivery | Adapter behind the `notification` context's outbound port (SMTP/HTTPS) |

> **Status:** as in §2.1, these components describe the **target architecture**. No Nx workspace, `apps/` or `libs/` exists in the repository yet, so no component listed above has been scaffolded or verified with `pnpm nx lint` / `pnpm nx graph`.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

Sport ITSM is delivered as a **single Nx 21.6 monorepo**, managed with **pnpm** as the only package manager, holding the whole system: the NestJS **API** (`apps/api`), the Angular **Web Client** (`apps/web`), their two Cypress + Cucumber acceptance suites, and every bounded-context library under `libs/`. It is a **modular monolith**: one deployable API process, one deployable web client and one PostgreSQL system of record, with the modularity enforced logically by the workspace structure rather than physically by network hops.

The layout is a direct projection of the architecture described in §2.1 and §2.2. Each ITSM capability is a **bounded context** with its own folder under `libs/`, and inside that folder the **hexagonal layers** are separate Nx libraries: `domain` (pure model and ports), `application` (use cases), `infrastructure` (outbound adapters) on the backend side, and `feature` / `ui` / `data-access` on the frontend side. `libs/shared/` holds the shared kernel and the typed contracts that are the only permitted coupling between the two platforms. In this repository the **folder structure *is* the architecture**: a file's path determines the tags of the project it belongs to, and those tags determine what it is allowed to import. A standalone version of this section lives in [`docs/PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md).

#### 2.3.1 Directory tree

```text
AI4Devs-finalproject/
├─ nx.json                          # Nx workspace config: plugins, named inputs, target defaults, release
├─ package.json                     # single root manifest - pinned deps for both platforms
├─ pnpm-workspace.yaml              # pnpm workspace definition (pnpm is the only supported package manager)
├─ pnpm-lock.yaml                   # the only lockfile allowed in the repository
├─ tsconfig.base.json               # TypeScript 5.9 strict + path aliases (@sport-itsm/<lib>) for every library
├─ eslint.config.mjs                # ESLint 9 flat config - hosts @nx/enforce-module-boundaries (the boundary matrix)
├─ .prettierrc                      # Prettier 3 - single quotes, semicolons; formatting is never hand-made
├─ jest.preset.js                   # shared Jest 29 preset
├─ .gitignore
│
├─ apps/
│  ├─ api/                          # platform:backend  scope:shared  type:app
│  │  ├─ src/
│  │  │  ├─ main.ts                 # bootstrap: global prefix /api, ValidationPipe, pino, i18n, Swagger (dev only)
│  │  │  ├─ data-source.ts          # TypeORM DataSource used by the migration CLI (synchronize: false)
│  │  │  ├─ app/
│  │  │  │  ├─ app.module.ts        # root module: imports every context composition module
│  │  │  │  ├─ incident/            # composition root slice for the incident context
│  │  │  │  │  ├─ incident.module.ts            # binds ports to adapters: { provide: INCIDENT_REPOSITORY, useClass: … }
│  │  │  │  │  ├─ incident.controller.ts        # thin inbound HTTP adapter - no business logic
│  │  │  │  │  ├─ dto/
│  │  │  │  │  │  ├─ log-incident.dto.ts        # class-validator DTO implementing the contract type
│  │  │  │  │  │  └─ set-competition-impact.dto.ts
│  │  │  │  │  └─ adapters/
│  │  │  │  │     ├─ sla-policy.adapter.ts      # cross-context adapter: incident's SlaPolicyPort -> sla/application
│  │  │  │  │     ├─ approval.adapter.ts
│  │  │  │  │     └─ audit.adapter.ts
│  │  │  │  ├─ sla/
│  │  │  │  │  ├─ sla.module.ts
│  │  │  │  │  └─ jobs/sla-sweep.job.ts         # second inbound adapter: warning/breach sweep, auto-close
│  │  │  │  ├─ service-request/  knowledge/  service-catalog/  identity-access/
│  │  │  │  ├─ approval/  notification/  audit/  reporting/
│  │  │  │  └─ events/
│  │  │  │     └─ in-process-event-publisher.ts # single post-commit domain-event dispatcher
│  │  │  ├─ common/
│  │  │  │  ├─ filters/domain-error.filter.ts   # domain error -> contract error-code envelope
│  │  │  │  ├─ guards/jwt-auth.guard.ts
│  │  │  │  ├─ guards/license-feature.guard.ts
│  │  │  │  ├─ decorators/license-feature.decorator.ts
│  │  │  │  └─ auth/jwt.strategy.ts             # Passport JWT
│  │  │  ├─ config/
│  │  │  │  ├─ configuration.ts                 # @nestjs/config factory - no raw process.env in feature code
│  │  │  │  └─ env.validation.ts                # validated environment schema
│  │  │  ├─ health/
│  │  │  │  ├─ health.controller.ts             # /health/live and /health/ready - NOT under /api
│  │  │  │  └─ health.module.ts
│  │  │  ├─ i18n/
│  │  │  │  ├─ en/{errors,notifications}.json
│  │  │  │  └─ es/{errors,notifications}.json
│  │  │  └─ migrations/
│  │  │     ├─ 1712345678901-CreateIdentityAccessTables.ts
│  │  │     └─ 1712345679002-CreateIncidentTables.ts
│  │  ├─ jest.config.ts
│  │  ├─ project.json                           # Nx targets + the three tags
│  │  └─ tsconfig.{json,app.json,spec.json}
│  │
│  ├─ api-e2e/                       # platform:backend  scope:shared  type:e2e
│  │  ├─ src/
│  │  │  ├─ features/log-incident.feature       # Gherkin, traced to PRD acceptance criteria
│  │  │  ├─ step-definitions/log-incident.steps.ts
│  │  │  └─ support/
│  │  ├─ cypress.config.ts
│  │  └─ project.json
│  │
│  ├─ web/                           # platform:frontend scope:shared  type:app
│  │  ├─ src/
│  │  │  ├─ main.ts                             # bootstrapApplication(AppComponent, appConfig)
│  │  │  ├─ index.html
│  │  │  ├─ styles.scss                         # Angular Material theme + design tokens
│  │  │  └─ app/
│  │  │     ├─ app.component.ts                 # shell
│  │  │     ├─ app.config.ts                    # provideRouter, provideHttpClient(withInterceptors), Transloco, ErrorHandler
│  │  │     ├─ app.routes.ts                    # lazy loadChildren into each context's feature lib
│  │  │     ├─ interceptors/
│  │  │     │  ├─ jwt.interceptor.ts            # Bearer token
│  │  │     │  ├─ locale.interceptor.ts         # Accept-Language
│  │  │     │  └─ http-error.interceptor.ts     # contract error code -> Transloco key
│  │  │     └─ guards/{auth.guard.ts,role.guard.ts}   # usability only, never the security boundary
│  │  ├─ jest.config.ts
│  │  └─ project.json
│  │
│  └─ web-e2e/                       # platform:frontend scope:shared  type:e2e
│     └─ src/{features,step-definitions,support}/
│
├─ libs/
│  ├─ shared/
│  │  ├─ contracts/                  # platform:shared scope:shared type:contracts - types only (ADR-007)
│  │  │  └─ src/
│  │  │     ├─ index.ts                          # public barrel
│  │  │     └─ lib/
│  │  │        ├─ incident/{log-incident.request.ts,incident-detail.response.ts,incident.enums.ts}
│  │  │        ├─ sla/…  service-request/…  knowledge/…
│  │  │        └─ errors/error-code.ts           # stable error codes shared FE+BE
│  │  ├─ domain/                     # platform:shared scope:shared type:domain - shared kernel primitives
│  │  │  └─ src/lib/{identity.ts,ticket-reference.vo.ts,priority.vo.ts,domain-event.ts,state-model.ts,clock.port.ts}
│  │  └─ util/                       # platform:shared scope:shared type:util - pure helpers
│  │
│  ├─ incident/                      # one folder per bounded context
│  │  ├─ domain/                     # platform:backend scope:incident type:domain   (PURE TypeScript)
│  │  │  └─ src/
│  │  │     ├─ index.ts
│  │  │     └─ lib/
│  │  │        ├─ model/
│  │  │        │  ├─ incident.aggregate.ts       # aggregate root
│  │  │        │  ├─ incident.aggregate.spec.ts
│  │  │        │  ├─ work-note.ts                # domain entity (NOT *.entity.ts - see 2.3.3)
│  │  │        │  └─ incident-state.ts
│  │  │        ├─ value-objects/{competition-impact-flag.vo.ts,competition-subject.vo.ts,origin-channel.vo.ts}
│  │  │        ├─ services/priority-calculator.ts        # domain service over the Impact x Urgency matrix
│  │  │        ├─ events/{incident-logged.event.ts,priority-changed.event.ts,incident-resolved.event.ts}
│  │  │        ├─ ports/
│  │  │        │  ├─ incident-repository.port.ts # interface + Symbol injection token
│  │  │        │  ├─ sla-policy.port.ts          # outbound port in incident's OWN language
│  │  │        │  └─ event-publisher.port.ts
│  │  │        └─ errors/incident.errors.ts      # typed domain errors
│  │  ├─ application/                # platform:backend scope:incident type:application
│  │  │  └─ src/lib/
│  │  │     ├─ use-cases/
│  │  │     │  ├─ log-incident.use-case.ts
│  │  │     │  ├─ log-incident.use-case.spec.ts  # unit test with zero infrastructure
│  │  │     │  ├─ triage-incident.use-case.ts
│  │  │     │  └─ set-competition-impact-flag.use-case.ts
│  │  │     ├─ authorization/incident.policies.ts        # authorization expressed in domain terms
│  │  │     └─ mappers/incident-response.mapper.ts       # aggregate -> contract response
│  │  ├─ infrastructure/             # platform:backend scope:incident type:infrastructure
│  │  │  └─ src/lib/
│  │  │     ├─ persistence/
│  │  │     │  ├─ entities/{incident.entity.ts,work-note.entity.ts}   # TypeORM persistence entities
│  │  │     │  ├─ mappers/incident.mapper.ts                          # entity <-> aggregate (ADR-005)
│  │  │     │  └─ typeorm-incident.repository.ts                      # implements IncidentRepositoryPort
│  │  │     └─ gateways/scms-competition.gateway.ts                   # anticorruption layer + free-text fallback
│  │  ├─ feature/                    # platform:frontend scope:incident type:feature
│  │  │  └─ src/lib/
│  │  │     ├─ incident.routes.ts                # lazy route definitions consumed by apps/web
│  │  │     └─ pages/
│  │  │        ├─ incident-list/{incident-list.page.ts,.html,.scss,.spec.ts}
│  │  │        ├─ incident-detail/…
│  │  │        └─ log-incident/…                 # Reactive Form container
│  │  ├─ ui/                         # platform:frontend scope:incident type:ui
│  │  │  └─ src/lib/
│  │  │     ├─ priority-badge/{priority-badge.component.ts,.html,.scss,.spec.ts}
│  │  │     ├─ sla-countdown/…
│  │  │     └─ work-note-list/…                  # OnPush, input()/output(), zero injected services
│  │  └─ data-access/                # platform:frontend scope:incident type:data-access
│  │     └─ src/lib/
│  │        ├─ incident-api.service.ts           # the only place HttpClient is injected
│  │        ├─ incident.store.ts                 # signal store, exposes asReadonly()/computed()
│  │        └─ incident.store.spec.ts
│  │
│  ├─ service-request/               # same six libs
│  ├─ sla/                           # domain, application, infrastructure (no UI of its own)
│  ├─ service-catalog/  knowledge/   # six libs each
│  ├─ identity-access/               # domain, application, infrastructure, feature, data-access
│  ├─ approval/  notification/  audit/  reporting/    # generic supporting contexts (ADR-001)
│  └─ problem/  change/  release/  asset-config/      # PHASE 2 - deliberately not scaffolded yet
│
├─ docs/
│  ├─ PRD.md                         # product requirements (behavioral authority for the MVP)
│  ├─ ARCHITECTURE.md                # target architecture: C4, context map, hexagon, ADR-001..009
│  ├─ COMPONENTS.md                  # main components (companion to §2.2)
│  ├─ PROJECT-STRUCTURE.md           # companion to this section
│  └─ adr/                           # ADRs promoted to individual files when scaffolding starts
│
├─ openspec/                         # canonical product behavior - propose -> implement -> archive
│  ├─ specs/<capability>/spec.md     # e.g. incident-management, sla-management, service-catalog
│  └─ changes/<change-id>/{proposal.md,tasks.md,design.md,specs/<capability>/spec.md}
│
├─ .claude/
│  ├─ agents/{sport-itsm-architect.md,sport-itsm-product-owner.md}
│  └─ skills/{sport-itsm-architecture,sport-itsm-backend,sport-itsm-frontend,
│             sport-itsm-engineering-principles,service-desk-expert,feature-docs,…}/
│
├─ CLAUDE.md                         # operational context for AI agents working in this repo
├─ readme.md                         # this document
└─ prompts.md
```

#### 2.3.2 Purpose of each main folder

| Path | Purpose |
| --- | --- |
| Root config files | One workspace-wide configuration for both platforms: `nx.json` (task graph, caching), `package.json` + `pnpm-workspace.yaml` + `pnpm-lock.yaml` (single dependency set, pinned majors), `tsconfig.base.json` (strict TypeScript and the `@sport-itsm/*` path aliases that make libraries importable), `eslint.config.mjs` (where the architecture is actually enforced) and `.prettierrc`. |
| `apps/api` | The NestJS deployable: **inbound HTTP adapter** (controllers, DTOs, guards, filters) **and composition root** (binds every port token to a concrete adapter, hosts the cross-context adapters and the in-process event publisher). Also owns the TypeORM data source, migrations, i18n resources and health probes. |
| `apps/api-e2e` | Cypress 15 + Cucumber acceptance tests for the API, written as Gherkin traced to PRD acceptance criteria. |
| `apps/web` | The Angular deployable **shell**: bootstrap and `provide*` configuration, lazy routing into feature libs, functional interceptors, route guards, theming and cross-context page composition. It holds no business logic. |
| `apps/web-e2e` | Cypress 15 + Cucumber acceptance tests for the UI. |
| `libs/<context>/domain` | The pure heart of a bounded context: aggregates, entities, value objects, domain services, domain events and **outbound port interfaces**. No framework, no ORM, no HTTP, not even `new Date()`. |
| `libs/<context>/application` | Use cases: orchestration, transaction boundary and the authorization check expressed in domain terms. May import `shared/contracts` (types only); still framework-free. |
| `libs/<context>/infrastructure` | Outbound adapters: TypeORM repositories, persistence entities, explicit mappers and external gateways. |
| `libs/<context>/feature` | Angular routed containers for the context: orchestrate the store, drive Reactive Forms, own explicit loading / error / empty states. |
| `libs/<context>/ui` | Presentational Angular components with `OnPush` and zero injected services. |
| `libs/<context>/data-access` | The only outbound edge of the client: typed API services and signal stores. |
| `libs/shared/contracts` | The single typed API surface shared by frontend and backend — DTO shapes, enums and error codes. Types only. |
| `libs/shared/domain` | Shared kernel primitives genuinely used by three or more contexts (`Identity`, `TicketReference`, `Priority`, `DomainEvent`, `StateModel`, `ClockPort`). Deliberately kept small. |
| `libs/shared/util` | Pure, dependency-free helpers. |
| `docs/` | Engineering documentation: PRD, architecture, components, project structure, and `docs/adr/` for Architecture Decision Records. |
| `openspec/` | The canonical source of **product behavior** — capability specs and in-flight change proposals with their spec deltas. Never architecture, never stack. |
| `.claude/` | The AI operating model: **agents** (Product Owner, Software Architect) and **skills** (architecture, backend, frontend, engineering principles, ITSM domain, documentation standard). |

#### 2.3.3 Naming and file conventions

| Convention | Rule |
| --- | --- |
| **File names** | `kebab-case.ts` everywhere, on both platforms — the default produced by the Nx, Nest and Angular generators. Directory names are kebab-case too, and match the context / library name. |
| **Public API** | Every library exposes exactly one barrel, `src/index.ts`. Cross-project imports go through the barrel and the `@sport-itsm/*` path alias; deep-importing past a barrel is a boundary violation. |
| **Project names and tags** | An Nx project is named `<context>-<type>` (`incident-domain`, `incident-data-access`) and lives at `libs/<context>/<type>/`. Its `project.json` carries exactly three tags: `platform:`, `scope:`, `type:`. |
| **Domain model** | Aggregate roots are `*.aggregate.ts`, value objects `*.vo.ts`, domain events `*.event.ts`, ports `*.port.ts`, typed errors `*.errors.ts`. Plain domain entities inside an aggregate use their bare noun (`work-note.ts`). |
| **`*.entity.ts` is reserved for persistence** | Only TypeORM persistence entities in `libs/<context>/infrastructure/**/persistence/entities/` use the `*.entity.ts` suffix. The suffix therefore signals "this class is an ORM artifact, not the domain model" — the visible expression of ADR-005 (aggregates and entities are separate classes joined by an explicit `*.mapper.ts`). |
| **Use cases** | One use case per file, `*.use-case.ts`, named with the domain verb (`log-incident.use-case.ts`, `set-competition-impact-flag.use-case.ts`). |
| **NestJS artifacts** | `*.controller.ts`, `*.module.ts`, `*.dto.ts`, `*.guard.ts`, `*.filter.ts`, `*.strategy.ts`, `*.decorator.ts`, and `*.adapter.ts` for the composition-root adapters that implement a port. |
| **Angular artifacts** | `*.page.ts` for routed containers in `feature`, `*.component.ts` for presentational components in `ui`, `*.service.ts` and `*.store.ts` in `data-access`, `*.interceptor.ts` / `*.guard.ts` in the shell, `*.routes.ts` for route definitions. Templates and styles sit beside the class as `*.html` / `*.scss`. |
| **Tests** | Jest specs live **next to the code they test** as `*.spec.ts`. Acceptance tests are Gherkin `*.feature` files in `apps/*-e2e/src/features/` with `*.steps.ts` step definitions. |
| **Migrations** | Generated into `apps/api/src/migrations/` by the TypeORM CLI as `<timestamp>-<PascalCaseName>.ts`; the name describes the schema change (`1712345679002-CreateIncidentTables.ts`). Migrations are the only mechanism for schema evolution. |
| **Ubiquitous language** | Identifiers use the exact ITSM terms of their bounded context (Incident, Service Request, Resolver Group, SLA, Configuration Item). No abbreviations invented locally. |

#### 2.3.4 The pattern the structure obeys

The tree is not an arbitrary organization: it is the **Nx monorepo + DDD bounded contexts + Hexagonal layering** triple, made mechanical.

1. **The first level under `libs/` is a bounded context.** Each ITSM capability owns a folder and a ubiquitous language. Nothing cross-cutting is allowed to live above it except the deliberately minimal `libs/shared/`.
2. **The second level is a hexagonal layer.** `domain` / `application` / `infrastructure` are the backend hexagon; `feature` / `ui` / `data-access` are the frontend slice. A file's layer is therefore visible from its path, and so is the set of imports it is permitted.
3. **Every project carries three tags** — `platform:` (`backend` / `frontend` / `shared`), `scope:` (`<context>` / `shared`) and `type:` (`domain`, `application`, `infrastructure`, `feature`, `ui`, `data-access`, `contracts`, `util`, plus `app` and `e2e` for the four applications, ADR-002). Libraries are created only with Nx generators and explicit `--tags`, so structure and tags never drift.
4. **`@nx/enforce-module-boundaries` in `eslint.config.mjs` turns the three axes into build-time rules.** The `type:` matrix implements the inward-only dependency rule (`infrastructure → application → domain`, never the reverse); the `scope:` rule implements context isolation (a context may depend only on itself and `scope:shared`); the `platform:` rule keeps frontend and backend from ever importing each other. An illegal import fails `pnpm nx lint`.
5. **`apps/api` is the only escape hatch, and it is a designed one.** Tagged `scope:shared`, `type:app`, it is the composition root: the single place that sees more than one context, because that is where a context's outbound port is bound to an adapter delegating to another context's application layer (ADR-003). No library may depend on an app, so the privilege cannot spread.

The consequence worth stating plainly: **in this repository the folder structure is the architecture.** Moving a file to a different folder changes what it is allowed to depend on, and the linter — not a reviewer — decides whether that is legal.

#### 2.3.5 Documentation, specification and agent folders

- **`openspec/`** is the canonical source of **product behavior**. `openspec/specs/<capability>/spec.md` holds the current agreed behavior per ITSM capability; `openspec/changes/<change-id>/` holds in-flight proposals with `proposal.md`, `tasks.md`, an optional `design.md` (the only place where stack detail is allowed) and spec deltas marked `## ADDED / MODIFIED / REMOVED Requirements`. Specs are technology-agnostic; the workflow is `propose → implement → archive`.
- **`docs/`** is the engineering counterpart: the PRD, the architecture document, the component reference, the project-structure document, and `docs/adr/` where the structural decisions currently embedded in `ARCHITECTURE.md` §10 are promoted to individual ADR files once scaffolding starts.
- **`.claude/`** holds the AI operating model: **agents** (`sport-itsm-product-owner`, `sport-itsm-architect`) are roles, and **skills** are the layered, reusable guardrails they consume — business (`service-desk-expert`), system (`sport-itsm-architecture`), craft (`sport-itsm-engineering-principles`), stack (`sport-itsm-backend`, `sport-itsm-frontend`) and documentation (`feature-docs`). `CLAUDE.md` at the root is the entry point that ties them together.

#### 2.3.6 Governance commands

| Purpose | Command |
| --- | --- |
| Install | `pnpm install` |
| Serve | `pnpm nx serve api` / `pnpm nx serve web` |
| Unit tests | `pnpm nx test <project>` |
| Lint, including boundary checks | `pnpm nx lint <project>` |
| Acceptance | `pnpm nx e2e api-e2e` / `pnpm nx e2e web-e2e` |
| Changed-only CI gate | `pnpm nx affected -t lint test build` |
| Inspect the dependency graph | `pnpm nx graph` |
| Schema evolution | `pnpm typeorm migration:generate\|run\|revert -d apps/api/src/data-source.ts` |

> **Status:** as in §2.1 and §2.2, this is the **target structure**. The repository currently contains only `docs/`, `.claude/`, `CLAUDE.md`, `readme.md` and `prompts.md`; there is no Nx workspace, no `package.json`, no `apps/`, no `libs/` and no `openspec/` directory yet. Every path above is prescriptive design intent that scaffolding must produce, and none of the boundary rules has been verified with `pnpm nx lint` / `pnpm nx graph`.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.

This section models the **relational schema persisted in PostgreSQL 16 through TypeORM 0.3** — the persistence entities, not the domain aggregates. The full document, with an attribute-level table for every entity, the constraint catalogue and the modelling decisions taken where the PRD is silent, is [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md).

#### 3.1.1 What is modelled, and what a table is not

The scope is the **phase-0 and phase-1 contexts that actually persist state** (PRD §14.2/§14.3), one PostgreSQL schema per bounded context:

| Context | Schema | Phase | Persists |
| --- | --- | --- | --- |
| `identity-access` | `iam` | 0 | Users, roles, permissions, resolver groups, competition-scoped visibility grants |
| `audit` | `audit` | 0 | Append-only activity history for every record type |
| `service-catalog` | `catalog` | 1 | Services, Service Offerings, request forms, eligibility rules, categorization taxonomy |
| `incident` | `incident` | 1 | Incident tickets, notes, links, escalations, priority matrix, lifecycle configuration |
| `service-request` | `service_request` | 1 | Service Requests, form answers, fulfillment tasks |
| `sla` | `sla` | 1 | Policies, support schedules, timer instances, warnings, breaches, escalation rules |
| `knowledge` | `knowledge` | 1 | Articles, versions, translations, feedback, ticket links |
| `approval` | `approval` | 1 | Workflows, requests, tasks, immutable decisions |
| `notification` | `notification` | 1 | Templates, rules, dispatch records, stakeholder lists |
| `reporting` | `reporting` | 1 | Denormalized read models only — never a system of record |

`problem`, `change`, `release` and `asset-config` are **phase 2** and are deliberately not modelled (§3.1.13).

**A table is not an aggregate (ADR-005).** `type:domain` holds framework-free aggregates (`Incident`, `Priority`, `CompetitionImpactFlag`) and `type:infrastructure` holds TypeORM `*.entity.ts` classes joined to them by an explicit mapper. Two consequences shape every diagram below:

1. **One aggregate spans several tables.** `incident_ticket` + `incident_work_note` + `incident_attachment` + `incident_assignment_history` + `incident_state_transition` + `incident_link` persist **one** `Incident`, loaded and saved as a unit in a single transaction.
2. **Value objects are stored inline as columns, never as their own table** — they have no identity and no independent lifecycle, so a surrogate key would be a modelling lie:

| Value object | Columns | Table |
| --- | --- | --- |
| `TicketReference` | `reference` + unique index | `incident_ticket`, `sr_request` |
| `Priority` | `priority`, `priority_overridden`, `priority_override_justification`, `priority_matrix_id` | `incident_ticket` |
| `CompetitionImpactFlag` | `competition_affects`, `competition_justification`, `competition_flag_set_by`, `competition_flag_set_at` | `incident_ticket`, `sr_request` |
| `CompetitionSubject` | `competition_subject_type`, `competition_subject_external_id`, `competition_subject_label` | `incident_ticket`, `sr_request` |
| `OriginChannel` / `NoteVisibility` | single PG enum column | tickets / notes |
| `ResolverAssignment` | `assigned_group_id`, `assigned_user_id`, `assigned_at` | tickets |
| `SlaCommitment` | `started_at`, `target_at` | `sla_instance` |

#### 3.1.2 Conventions: keys, time, enums, deletes and schema evolution

| Concern | Decision |
| --- | --- |
| **Primary keys** | `uuid` on every table. **UUID v7** (time-ordered), generated by the **repository port** (`nextIdentity()`, alongside `nextReference()`), so an aggregate is fully constructed and valid in pure domain code before any I/O. `DEFAULT gen_random_uuid()` exists only as a migration/fixture safety net. Composite keys only on pure join tables. Business keys (`reference`, `code`, `email`) are **unique constraints**, never the PK. |
| **Reference numbers** | `INC0000123` / `SRQ0000045`, from a dedicated PostgreSQL `SEQUENCE` per record type read by the repository adapter. Sequences do not roll back with a failed transaction — gaps are acceptable, **reuse is not** (FR-INC-02, NFR-DAT-01). |
| **Auditing columns** | Every table: `created_at`, `updated_at`, `created_by`, `updated_by`; aggregate roots also carry `version` for optimistic locking (two agents must not silently overwrite a triage). `updated_at` is **absent** on append-only tables — the missing column *is* the immutability statement. These columns are a convenience, not the audit trail; `audit.audit_entry` is the only authority for "who changed what". |
| **Time** | Every instant is `timestamptz` in **UTC** (NFR-I18N-03), obtained from `ClockPort` (ADR-009) — never `now()` in a trigger. `date`/`time` appear only in `sla_schedule_window` and `sla_holiday`, which are intentionally wall-clock values interpreted in the support schedule's own `time_zone`. |
| **Enums vs lookup tables** | **Native PG enum** when the value set is closed and the domain branches on it (`origin_channel`, `note_visibility`, `impact`, `urgency`, `priority`, `link_type`, `sla_instance_state`, `approval_decision`, `actor_type`). **Lookup table** (`id`, `code` UK, `active`, + `*_translation`) when an administrator may change it without a release (NFR-CFG-01) or it must be translatable without changing its stable identifier (NFR-I18N-05): categories, resolution codes, roles, workflow states, notification templates. Records store the lookup **id**, never the label, so renaming a category changes one row and zero historical facts (NFR-DAT-03). |
| **Configurable lifecycles** | `incident_ticket.state_id` points at `incident_workflow_state` (a lookup), because FR-WFL-01 requires a configurable lifecycle. A denormalized, non-configurable `state_category` enum (`open`, `pending`, `resolved`, `closed`, `cancelled`) sits beside it so queries and KPIs never depend on customer configuration. Configuration is **versioned, never edited in place**: a ticket keeps the matrix and workflow version it was created under (NFR-CFG-02). |
| **Soft delete** | **None. No `deleted_at` on any table.** It would create two truths about existence and is incompatible with an append-only audit trail (K4). "Removal" is a lifecycle state: `publication_status = 'retired'`, `status = 'disabled'`, `revoked_at IS NOT NULL`, `active = false`. Retired reference data stays joinable by history forever. |
| **Retention & erasure** | Retention (NFR-DAT-02) is archival; `audit_entry` is **range-partitioned monthly** so it is a `DETACH PARTITION`, not a mass `DELETE`. Lawful erasure (NFR-SEC-07, K9) is **pseudonymization**: PII columns of `iam_user` are overwritten and `pseudonymized_at` set. Everything else references the user by `uuid` only, so the audit trail stays structurally intact while the personal data is gone. |
| **Schema evolution** | **Migrations only.** `synchronize` is `false` in every environment; the schema changes exclusively through reviewed TypeORM migrations against `apps/api/src/data-source.ts`, auto-run only in development. No business rule ever lives in a trigger or stored procedure; `CHECK` constraints encode only structural invariants that must hold regardless of application version. |

#### 3.1.3 Hard foreign keys vs soft references — and how to read the diagrams

| Notation | Meaning |
| --- | --- |
| `A \|\|--o{ B` **solid** | A real `FOREIGN KEY`, always **within one schema / one bounded context**; `ON DELETE CASCADE` only from an aggregate root to a part it exclusively owns |
| `A \|\|..o{ B` **dashed** | A **logical/soft reference**: an indexed `uuid` column with **no** database constraint, crossing a context boundary or polymorphic |

Cross-context references are deliberately **not** foreign keys, for three reasons:

1. **It is the database expression of ADR-003.** `scope:incident` may not import `scope:sla`. A real FK from `incident_ticket` into `sla.sla_instance` would couple the two contexts in the exact place the architecture works hardest to keep them separate, and the "extractable later" property of ADR-004 would be fiction.
2. **Most of them are polymorphic and cannot be constrained at all.** `sla_instance`, `apr_request`, `ntf_dispatch`, `audit_entry` and `kb_article_link` point at *a record of some type* via `(record_type, record_id)`. One nullable FK column per target type would add a column for every context that ever exists.
3. **The target may not be in this database.** `competition_subject_external_id` points into **SCMS**, a separate system consumed read-only behind an anti-corruption layer with free-text fallback (PRD D2, R10). A FK is impossible by definition — and that is what keeps *"a competition entity is the affected subject of a ticket, never a ticket"* structurally true.

**The cost, stated honestly:** cross-context referential integrity is not guaranteed by PostgreSQL. Mitigations: nothing is ever hard-deleted, so the dominant cause of dangling references does not occur; every cross-context write happens in the same transaction as its aggregate write; a scheduled integrity job reports orphaned soft references; acceptance tests assert audit and SLA completeness for the MVP flows.

#### 3.1.4 Overview — context-level model

Aggregate-root tables only. Note what it makes visible: **every edge leaving a ticket context is dashed** — the module-boundary rule of §2.1 rendered in the database.

```mermaid
erDiagram
    IAM_USER {
        uuid id PK
    }
    IAM_ROLE {
        uuid id PK
    }
    IAM_RESOLVER_GROUP {
        uuid id PK
    }
    CATALOG_SERVICE {
        uuid id PK
    }
    CATALOG_SERVICE_OFFERING {
        uuid id PK
    }
    CATALOG_CATEGORY {
        uuid id PK
    }
    INCIDENT_TICKET {
        uuid id PK
    }
    SR_REQUEST {
        uuid id PK
    }
    SLA_POLICY {
        uuid id PK
    }
    SLA_INSTANCE {
        uuid id PK
    }
    KB_ARTICLE {
        uuid id PK
    }
    APR_REQUEST {
        uuid id PK
    }
    NTF_DISPATCH {
        uuid id PK
    }
    AUDIT_ENTRY {
        uuid id PK
    }
    RPT_TICKET_FACT {
        uuid id PK
    }

    IAM_USER ||--o{ IAM_ROLE : "is granted"
    IAM_USER ||--o{ IAM_RESOLVER_GROUP : "is member of"
    CATALOG_SERVICE ||--o{ CATALOG_SERVICE_OFFERING : "publishes"

    IAM_USER ||..o{ INCIDENT_TICKET : "reports"
    IAM_RESOLVER_GROUP ||..o{ INCIDENT_TICKET : "is assigned"
    CATALOG_SERVICE ||..o{ INCIDENT_TICKET : "is affected service of"
    CATALOG_CATEGORY ||..o{ INCIDENT_TICKET : "classifies"
    INCIDENT_TICKET ||..o{ INCIDENT_TICKET : "parent major incident of"

    IAM_USER ||..o{ SR_REQUEST : "requests"
    CATALOG_SERVICE_OFFERING ||..o{ SR_REQUEST : "is requested through"
    SR_REQUEST ||..o| APR_REQUEST : "is authorized by"

    SLA_POLICY ||--o{ SLA_INSTANCE : "governs"
    INCIDENT_TICKET ||..o{ SLA_INSTANCE : "is timed by"
    SR_REQUEST ||..o{ SLA_INSTANCE : "is timed by"

    KB_ARTICLE ||..o{ INCIDENT_TICKET : "is resolution source of"
    IAM_USER ||..o{ APR_REQUEST : "decides"

    INCIDENT_TICKET ||..o{ NTF_DISPATCH : "triggers"
    APR_REQUEST ||..o{ NTF_DISPATCH : "triggers"
    SLA_INSTANCE ||..o{ NTF_DISPATCH : "triggers"

    INCIDENT_TICKET ||..o{ AUDIT_ENTRY : "is journaled in"
    SR_REQUEST ||..o{ AUDIT_ENTRY : "is journaled in"
    APR_REQUEST ||..o{ AUDIT_ENTRY : "is journaled in"
    IAM_USER ||..o{ AUDIT_ENTRY : "acts in"

    INCIDENT_TICKET ||..o| RPT_TICKET_FACT : "is projected into"
    SR_REQUEST ||..o| RPT_TICKET_FACT : "is projected into"
```

#### 3.1.5 Identity & access — schema `iam`

Phase 0. Owns authentication material, RBAC and the **competition-scoped visibility grants** that make FR-IAM-03 / FR-KNW-09 a server-side predicate rather than a UI filter. Role grants are **temporal rows** (`revoked_at`), never deleted associations, so "who could do what on 3 May" stays answerable (FR-IAM-05, FR-AUD-05).

```mermaid
erDiagram
    IAM_USER {
        uuid id PK
        varchar_64 external_subject_id UK "SSO subject, null until FR-IAM-04 lands"
        citext email UK "login identity, case insensitive"
        varchar_255 password_hash "bcrypt, null when federated, never mapped out"
        varchar_150 display_name
        varchar_32 phone "nullable, PII"
        varchar_10 locale "en, es - NFR-I18N-02"
        varchar_64 time_zone "IANA name, presentation only"
        entitlement_tier_enum entitlement_tier "player, team_manager, organizer, official, league_admin, staff"
        user_status_enum status "active, suspended, disabled"
        timestamptz last_login_at
        timestamptz pseudonymized_at "set on lawful erasure - NFR-SEC-07"
        timestamptz created_at
        timestamptz updated_at
    }
    IAM_ROLE {
        uuid id PK
        varchar_64 code UK "requester, organizer, agent, analyst, approver, service_manager, sysadmin"
        varchar_150 name
        varchar_255 description
        boolean is_system
        boolean active
    }
    IAM_PERMISSION {
        uuid id PK
        varchar_100 code UK "incident.triage, incident.flag_competition, approval.decide"
        varchar_255 description
        boolean is_privileged "requires re-authentication - FR-IAM-06"
    }
    IAM_ROLE_PERMISSION {
        uuid role_id PK
        uuid permission_id PK
        timestamptz created_at
    }
    IAM_USER_ROLE {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
        uuid granted_by "soft ref to iam_user"
        timestamptz granted_at
        timestamptz revoked_at "null while active - unique partial index"
        varchar_255 revocation_reason
    }
    IAM_RESOLVER_GROUP {
        uuid id PK
        varchar_64 code UK
        varchar_150 name
        varchar_255 description
        uuid manager_user_id FK
        uuid coverage_schedule_id "soft ref to sla.sla_support_schedule"
        boolean active
        timestamptz created_at
        timestamptz updated_at
    }
    IAM_RESOLVER_GROUP_MEMBER {
        uuid group_id PK
        uuid user_id PK
        boolean is_backup
        timestamptz created_at
    }
    IAM_COMPETITION_SCOPE {
        uuid id PK
        uuid user_id FK
        competition_subject_enum subject_type "tournament, league, group_division"
        varchar_100 subject_external_id "opaque SCMS identifier - no FK"
        varchar_255 subject_label "free-text fallback - R10"
        scope_kind_enum scope_kind "owner, administrator, approver"
        timestamptz valid_from
        timestamptz valid_to
        timestamptz created_at
    }

    IAM_USER ||--o{ IAM_USER_ROLE : "holds"
    IAM_ROLE ||--o{ IAM_USER_ROLE : "is granted through"
    IAM_ROLE ||--o{ IAM_ROLE_PERMISSION : "aggregates"
    IAM_PERMISSION ||--o{ IAM_ROLE_PERMISSION : "is granted by"
    IAM_USER ||--o{ IAM_RESOLVER_GROUP_MEMBER : "belongs to"
    IAM_RESOLVER_GROUP ||--o{ IAM_RESOLVER_GROUP_MEMBER : "contains"
    IAM_USER ||--o| IAM_RESOLVER_GROUP : "manages"
    IAM_USER ||--o{ IAM_COMPETITION_SCOPE : "is scoped to"
```

There is deliberately **no session or refresh-token table**: the MVP uses stateless JWT, and inactivity timeout (FR-IAM-06) is a token-lifetime concern. `ck_iam_user_credential` requires `password_hash IS NOT NULL OR external_subject_id IS NOT NULL` — an account must be authenticable somehow.

#### 3.1.6 Service catalog & taxonomy — schema `catalog`

Services, Offerings, dynamic request forms, eligibility rules, and the **categorization taxonomy** shared by both ticket types. The PRD requires the taxonomy (FR-INC-03, FR-CAT-01) but assigns no owner; it is placed here because this is the service-reference-data context and duplicating it per ticket context would break NFR-DAT-03.

```mermaid
erDiagram
    CATALOG_SERVICE {
        uuid id PK
        varchar_64 code UK
        varchar_150 name
        text description
        uuid owner_user_id "soft ref to iam.iam_user"
        criticality_enum criticality "low, medium, high, critical"
        publication_status_enum status "draft, published, retired"
        timestamptz created_at
        timestamptz updated_at
    }
    CATALOG_SERVICE_OFFERING {
        uuid id PK
        uuid service_id FK
        varchar_64 code UK
        varchar_150 name
        text description
        uuid category_id FK
        publication_status_enum publication_status "only published is requestable - FR-CAT-03"
        boolean requires_approval
        uuid approval_workflow_id "soft ref to approval.apr_workflow"
        uuid fulfillment_group_id "soft ref to iam.iam_resolver_group"
        uuid sla_policy_id "soft ref to sla.sla_policy - FR-SRQ-07"
        integer expected_fulfillment_hours "FR-CAT-06"
        boolean auto_fulfillment "FR-SRQ-10, phase 3"
        integer sort_order
        timestamptz published_at
        timestamptz retired_at
        timestamptz created_at
        timestamptz updated_at
        integer version
    }
    CATALOG_OFFERING_TRANSLATION {
        uuid id PK
        uuid offering_id FK
        varchar_10 locale UK
        varchar_150 name
        text description
    }
    CATALOG_FORM_DEFINITION {
        uuid id PK
        uuid offering_id FK
        integer version_no UK "immutable once answered by a request"
        boolean active
        timestamptz created_at
    }
    CATALOG_FORM_FIELD {
        uuid id PK
        uuid form_definition_id FK
        varchar_64 field_key UK "stable key stored on the answer row"
        field_type_enum field_type "text, textarea, number, date, select, multiselect, boolean, user, competition_subject, attachment"
        varchar_150 label_key "i18n key - NFR-I18N-01"
        boolean required
        integer sort_order
        jsonb options "choices as stable ids plus i18n keys"
        jsonb validation "min, max, pattern, maxLength"
    }
    CATALOG_ELIGIBILITY_RULE {
        uuid id PK
        uuid offering_id FK
        eligibility_subject_enum subject "role, entitlement_tier, competition_scope - FR-SRQ-02"
        varchar_100 operand
        rule_effect_enum effect "allow, deny"
        integer evaluation_order
        boolean active
    }
    CATALOG_CATEGORY {
        uuid id PK
        uuid parent_id FK "null at level 1"
        taxonomy_level_enum level "category, subcategory, item - FR-INC-03"
        varchar_64 code UK
        varchar_255 path "materialized code path"
        record_type_enum applies_to "incident, service_request, both"
        uuid default_group_id "soft ref to iam.iam_resolver_group"
        boolean active
        integer sort_order
    }
    CATALOG_CATEGORY_TRANSLATION {
        uuid id PK
        uuid category_id FK
        varchar_10 locale UK
        varchar_150 name
        varchar_255 description
    }

    CATALOG_SERVICE ||--o{ CATALOG_SERVICE_OFFERING : "publishes"
    CATALOG_SERVICE_OFFERING ||--o{ CATALOG_OFFERING_TRANSLATION : "is localized by"
    CATALOG_SERVICE_OFFERING ||--o{ CATALOG_FORM_DEFINITION : "is requested through"
    CATALOG_FORM_DEFINITION ||--o{ CATALOG_FORM_FIELD : "declares"
    CATALOG_SERVICE_OFFERING ||--o{ CATALOG_ELIGIBILITY_RULE : "is restricted by"
    CATALOG_CATEGORY ||--o{ CATALOG_CATEGORY : "is parent of"
    CATALOG_CATEGORY ||--o{ CATALOG_CATEGORY_TRANSLATION : "is localized by"
    CATALOG_CATEGORY ||--o{ CATALOG_SERVICE_OFFERING : "classifies"
```

`catalog_form_definition.version_no` is immutable once a request has answered it, and the request stores `form_definition_id`. That is how NFR-CFG-02 holds: editing a form creates a **new** version, and in-flight requests keep validating against the one they were created under.

#### 3.1.7 Incident — schema `incident`

The core context (C1 + C13). `incident_ticket` is the persistence side of the `Incident` aggregate root; notes, attachments, assignment history, transitions, links, escalations and communications are parts of the same aggregate and carry hard FKs with `ON DELETE CASCADE` — the only cascade in the model, legitimate because those rows have no meaning without their ticket.

```mermaid
erDiagram
    INCIDENT_TICKET {
        uuid id PK
        varchar_20 reference UK "INC0000123 - immutable, never reused, FR-INC-02"
        varchar_255 short_description
        text description
        origin_channel_enum origin_channel "portal, agent_logged, email, in_app, phone - FR-OMN-02"
        uuid reporter_user_id "soft ref to iam.iam_user - never anonymous"
        uuid logged_by_user_id "soft ref - agent logging on behalf"
        uuid service_id "soft ref to catalog.catalog_service"
        uuid category_id "soft ref to catalog.catalog_category - required to leave New"
        uuid workflow_id FK
        uuid state_id FK "configurable lifecycle - FR-WFL-01"
        state_category_enum state_category "open, pending, resolved, closed, cancelled"
        pending_reason_enum pending_reason "customer, third_party, change - FR-INC-06"
        uuid priority_matrix_id FK "configuration version in force - NFR-CFG-02"
        impact_enum base_impact "agent assessment before competition uplift"
        impact_enum assessed_impact "after uplift - FR-INC-05"
        urgency_enum urgency
        priority_enum priority "P1 to P4 - derived, never requester chosen, FR-INC-04"
        boolean priority_overridden
        varchar_500 priority_override_justification "mandatory when overridden"
        boolean competition_affects "agent only, never automatic - FR-INC-05"
        varchar_500 competition_justification "mandatory when flag is true"
        uuid competition_flag_set_by "soft ref to iam.iam_user"
        timestamptz competition_flag_set_at
        competition_subject_enum competition_subject_type "tournament, league, fixture, standings, registration, roster, team, player_account, schedule, result"
        varchar_100 competition_subject_external_id "opaque SCMS id - no FK by design"
        varchar_255 competition_subject_label "free-text fallback - R10"
        uuid assigned_group_id "soft ref to iam.iam_resolver_group"
        uuid assigned_user_id "soft ref to iam.iam_user"
        timestamptz assigned_at
        boolean is_major "FR-MIM-01"
        uuid major_declared_by
        timestamptz major_declared_at
        varchar_500 major_justification
        uuid parent_incident_id FK "child of a Major Incident - FR-MIM-03"
        uuid resolution_code_id FK
        text resolution_notes "mandatory to resolve - FR-INC-07"
        uuid resolution_article_id "soft ref to knowledge.kb_article - FR-KNW-05"
        timestamptz first_response_at "MTTA input"
        timestamptz resolved_at
        timestamptz closed_at
        timestamptz confirmation_due_at "auto-close deadline - FR-INC-09"
        boolean first_contact_resolution "FR-INC-18"
        smallint reopen_count
        smallint csat_score "1 to 5, nullable"
        varchar_500 csat_comment
        timestamptz created_at
        timestamptz updated_at
        uuid created_by
        uuid updated_by
        integer version "optimistic lock"
    }
    INCIDENT_WORK_NOTE {
        uuid id PK
        uuid incident_id FK
        note_visibility_enum visibility "public, internal - NFR-SEC-04"
        text body
        uuid author_user_id "soft ref to iam.iam_user"
        author_kind_enum author_kind "user, system_rule"
        timestamptz created_at
    }
    INCIDENT_ATTACHMENT {
        uuid id PK
        uuid incident_id FK
        varchar_255 file_name
        varchar_100 content_type
        integer size_bytes
        varchar_500 storage_key "object storage key, not the blob"
        note_visibility_enum visibility
        uuid uploaded_by
        timestamptz created_at
    }
    INCIDENT_ASSIGNMENT_HISTORY {
        uuid id PK
        uuid incident_id FK
        uuid from_group_id
        uuid from_user_id
        uuid to_group_id
        uuid to_user_id
        varchar_255 reason
        uuid assigned_by
        timestamptz assigned_at "FR-INC-12"
    }
    INCIDENT_STATE_TRANSITION {
        uuid id PK
        uuid incident_id FK
        uuid from_state_id
        uuid to_state_id
        state_category_enum to_state_category
        varchar_255 reason
        actor_type_enum actor_type "user, system_rule"
        uuid actor_user_id
        varchar_100 actor_rule_code
        timestamptz occurred_at "append only - no updated_at"
    }
    INCIDENT_LINK {
        uuid id PK
        uuid incident_id FK
        record_type_enum target_record_type "incident, service_request, problem, change, release, configuration_item"
        uuid target_record_id "opaque - phase 2 contexts already accepted"
        link_type_enum link_type "duplicate_of, related_to, caused_by, child_of, resolved_by"
        uuid created_by
        timestamptz created_at
    }
    INCIDENT_ESCALATION {
        uuid id PK
        uuid incident_id FK
        escalation_type_enum escalation_type "functional, hierarchical - FR-INC-13"
        escalation_trigger_enum trigger "manual, sla_warning, sla_breach"
        uuid from_group_id
        uuid to_group_id
        uuid to_user_id
        varchar_255 reason
        uuid triggered_by
        timestamptz triggered_at
    }
    INCIDENT_MAJOR_COMMUNICATION {
        uuid id PK
        uuid incident_id FK
        varchar_64 audience_code "stakeholder list code - FR-NOT-04"
        varchar_255 subject
        text body
        uuid sent_by
        timestamptz sent_at
    }
    INCIDENT_RESOLUTION_CODE {
        uuid id PK
        varchar_64 code UK
        boolean requires_article
        boolean active
        integer sort_order
    }
    INCIDENT_RESOLUTION_CODE_TRANSLATION {
        uuid id PK
        uuid resolution_code_id FK
        varchar_10 locale UK
        varchar_150 name
    }
    INCIDENT_WORKFLOW {
        uuid id PK
        integer version_no UK
        boolean active
        timestamptz effective_from
    }
    INCIDENT_WORKFLOW_STATE {
        uuid id PK
        uuid workflow_id FK
        varchar_64 code UK
        state_category_enum category
        sla_clock_enum sla_clock "running, paused - FR-INC-08"
        boolean is_initial
        boolean is_final
        integer sort_order
    }
    INCIDENT_WORKFLOW_TRANSITION {
        uuid id PK
        uuid workflow_id FK
        uuid from_state_id FK
        uuid to_state_id FK
        varchar_64 required_permission_code
        jsonb guard "declarative preconditions"
    }
    INCIDENT_PRIORITY_MATRIX {
        uuid id PK
        integer version_no UK
        smallint competition_impact_step "how much the flag raises Impact - FR-INC-05"
        boolean active
        timestamptz effective_from
    }
    INCIDENT_PRIORITY_MATRIX_CELL {
        uuid id PK
        uuid matrix_id FK
        impact_enum impact UK
        urgency_enum urgency UK
        priority_enum priority
    }
    INCIDENT_ROUTING_RULE {
        uuid id PK
        varchar_150 name
        uuid category_id "soft ref to catalog.catalog_category"
        competition_subject_enum competition_subject_type
        origin_channel_enum origin_channel
        uuid target_group_id "soft ref to iam.iam_resolver_group - FR-WFL-03"
        integer evaluation_order
        boolean active
    }
    INCIDENT_BUSINESS_RULE {
        uuid id PK
        varchar_150 name
        rule_event_enum event "on_create, on_update, on_state_change, scheduled"
        jsonb condition
        jsonb actions "set_field, assign, notify, escalate, create_task - FR-WFL-02"
        integer evaluation_order
        boolean active
        integer version_no
    }

    INCIDENT_TICKET ||--o{ INCIDENT_WORK_NOTE : "records"
    INCIDENT_TICKET ||--o{ INCIDENT_ATTACHMENT : "carries"
    INCIDENT_TICKET ||--o{ INCIDENT_ASSIGNMENT_HISTORY : "was routed through"
    INCIDENT_TICKET ||--o{ INCIDENT_STATE_TRANSITION : "moved through"
    INCIDENT_TICKET ||--o{ INCIDENT_LINK : "is linked by"
    INCIDENT_TICKET ||--o{ INCIDENT_ESCALATION : "was escalated by"
    INCIDENT_TICKET ||--o{ INCIDENT_MAJOR_COMMUNICATION : "communicates through"
    INCIDENT_TICKET ||--o| INCIDENT_TICKET : "is parent major incident of"
    INCIDENT_RESOLUTION_CODE ||--o{ INCIDENT_TICKET : "closes"
    INCIDENT_RESOLUTION_CODE ||--o{ INCIDENT_RESOLUTION_CODE_TRANSLATION : "is localized by"
    INCIDENT_WORKFLOW ||--o{ INCIDENT_WORKFLOW_STATE : "declares"
    INCIDENT_WORKFLOW ||--o{ INCIDENT_WORKFLOW_TRANSITION : "allows"
    INCIDENT_WORKFLOW_STATE ||--o{ INCIDENT_TICKET : "is current state of"
    INCIDENT_WORKFLOW ||--o{ INCIDENT_TICKET : "governs"
    INCIDENT_PRIORITY_MATRIX ||--o{ INCIDENT_PRIORITY_MATRIX_CELL : "is composed of"
    INCIDENT_PRIORITY_MATRIX ||--o{ INCIDENT_TICKET : "derived priority of"
```

**Structural invariants** (`CHECK` constraints — safety nets; the *rules* live in the domain layer):

| Constraint | Rule | Requirement |
| --- | --- | --- |
| `ck_incident_resolution` | resolved/closed ⇒ `resolution_code_id` **and** `resolution_notes` present | FR-INC-07 |
| `ck_incident_competition_flag` | flag true ⇒ justification, setter and timestamp present | FR-INC-05 |
| `ck_incident_priority_override` | overridden ⇒ justification present | FR-INC-04 |
| `ck_incident_subject` | a subject type ⇒ an external id **or** a free-text label | R10 |
| `ck_incident_major` | major ⇒ declarer, time and justification present | FR-MIM-01 |

Two columns deserve emphasis. **`base_impact` and `assessed_impact` are separate** because FR-INC-05 says the flag *raises* Impact by a configurable amount: storing only the result would make the agent's original assessment unrecoverable and the calibration KPI (R8) unmeasurable. And **the competition subject has no foreign key** — three columns and nothing else — which is the whole of §3.1.3 point 3 made concrete.

#### 3.1.8 Service Request — schema `service_request`

Structurally a sibling of `incident`: the same reference / state / competition-subject shape, a different lifecycle (FR-SRQ-05), plus form answers and fulfillment tasks. It carries **its own** workflow tables, because each context owns its lifecycle — a central workflow engine was explicitly rejected as a god-context risk (ARCHITECTURE §4.1).

```mermaid
erDiagram
    SR_REQUEST {
        uuid id PK
        varchar_20 reference UK "SRQ0000045 - never reused"
        varchar_255 short_description
        text description
        origin_channel_enum origin_channel
        uuid requester_user_id "soft ref to iam.iam_user"
        uuid logged_by_user_id "soft ref"
        uuid offering_id "soft ref to catalog.catalog_service_offering - FR-SRQ-01, K6"
        uuid form_definition_id "soft ref - pins the form version answered"
        uuid category_id "soft ref to catalog.catalog_category"
        uuid workflow_id FK
        uuid state_id FK
        sr_state_category_enum state_category "new, approval_pending, approved, rejected, in_fulfillment, fulfilled, closed, cancelled"
        priority_enum priority "from the offering, not from Impact x Urgency"
        boolean competition_affects
        varchar_500 competition_justification
        competition_subject_enum competition_subject_type
        varchar_100 competition_subject_external_id
        varchar_255 competition_subject_label
        uuid approval_request_id "soft ref to approval.apr_request - FR-SRQ-04"
        approval_outcome_enum approval_outcome "pending, approved, rejected, not_required"
        varchar_500 rejection_reason "mandatory on rejection - FR-SRQ-11"
        uuid assigned_group_id "soft ref to iam.iam_resolver_group"
        uuid assigned_user_id "soft ref to iam.iam_user"
        timestamptz fulfilled_at
        timestamptz closed_at
        timestamptz cancelled_at "FR-SRQ-08"
        varchar_255 cancellation_reason
        smallint csat_score
        timestamptz created_at
        timestamptz updated_at
        integer version
    }
    SR_FIELD_VALUE {
        uuid id PK
        uuid request_id FK
        varchar_64 field_key UK "matches catalog_form_field.field_key"
        field_type_enum field_type "denormalized for rendering without the catalog"
        text value_text
        jsonb value_json "multiselect and structured answers only"
        timestamptz created_at
    }
    SR_FULFILLMENT_TASK {
        uuid id PK
        uuid request_id FK
        integer sequence_no UK
        task_mode_enum execution_mode "sequential, parallel - FR-SRQ-06"
        boolean is_mandatory "parent closes only when all mandatory tasks complete"
        varchar_255 title
        text instructions
        uuid assigned_group_id "soft ref"
        uuid assigned_user_id "soft ref"
        task_state_enum state "pending, in_progress, completed, skipped, failed"
        text completion_notes
        timestamptz started_at
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
    }
    SR_COMMENT {
        uuid id PK
        uuid request_id FK
        note_visibility_enum visibility
        text body
        uuid author_user_id
        author_kind_enum author_kind
        timestamptz created_at
    }
    SR_ATTACHMENT {
        uuid id PK
        uuid request_id FK
        varchar_255 file_name
        varchar_100 content_type
        integer size_bytes
        varchar_500 storage_key
        uuid uploaded_by
        timestamptz created_at
    }
    SR_STATE_TRANSITION {
        uuid id PK
        uuid request_id FK
        uuid from_state_id
        uuid to_state_id
        sr_state_category_enum to_state_category
        varchar_255 reason
        actor_type_enum actor_type
        uuid actor_user_id
        timestamptz occurred_at "append only"
    }
    SR_LINK {
        uuid id PK
        uuid request_id FK
        record_type_enum target_record_type
        uuid target_record_id
        link_type_enum link_type
        timestamptz created_at
    }
    SR_WORKFLOW {
        uuid id PK
        integer version_no UK
        boolean active
    }
    SR_WORKFLOW_STATE {
        uuid id PK
        uuid workflow_id FK
        varchar_64 code UK
        sr_state_category_enum category
        sla_clock_enum sla_clock
        boolean is_initial
        boolean is_final
    }
    SR_WORKFLOW_TRANSITION {
        uuid id PK
        uuid workflow_id FK
        uuid from_state_id FK
        uuid to_state_id FK
        varchar_64 required_permission_code
    }

    SR_REQUEST ||--o{ SR_FIELD_VALUE : "answers"
    SR_REQUEST ||--o{ SR_FULFILLMENT_TASK : "decomposes into"
    SR_REQUEST ||--o{ SR_COMMENT : "records"
    SR_REQUEST ||--o{ SR_ATTACHMENT : "carries"
    SR_REQUEST ||--o{ SR_STATE_TRANSITION : "moved through"
    SR_REQUEST ||--o{ SR_LINK : "is linked by"
    SR_WORKFLOW ||--o{ SR_WORKFLOW_STATE : "declares"
    SR_WORKFLOW ||--o{ SR_WORKFLOW_TRANSITION : "allows"
    SR_WORKFLOW_STATE ||--o{ SR_REQUEST : "is current state of"
```

`ck_sr_fulfillment_gate` — `state_category NOT IN ('in_fulfillment','fulfilled') OR approval_outcome IN ('approved','not_required')` — is the structural net under FR-SRQ-04. Form answers are **rows, not a `jsonb` document**, because FR-RPT-05 requires filtering and support needs to answer "every organizer-access request for competition X".

#### 3.1.9 SLA — schema `sla`

The most timing-sensitive schema in the system: NFR-AVL-05 (timers survive restarts), NFR-PRF-04 (warning within one minute) and FR-SLA-04 (recalculation from the **original** creation time, previous targets preserved) all land here.

```mermaid
erDiagram
    SLA_SUPPORT_SCHEDULE {
        uuid id PK
        varchar_64 code UK
        varchar_150 name
        boolean is_24x7 "FR-SLA-03"
        varchar_64 time_zone "IANA zone the windows below are expressed in"
        boolean active
    }
    SLA_SCHEDULE_WINDOW {
        uuid id PK
        uuid schedule_id FK
        smallint day_of_week "0 Sunday to 6 Saturday"
        time start_time "local wall clock"
        time end_time
    }
    SLA_HOLIDAY {
        uuid id PK
        uuid schedule_id FK
        date holiday_date UK
        varchar_150 name
    }
    SLA_POLICY {
        uuid id PK
        varchar_64 code UK
        varchar_150 name
        record_type_enum record_type "incident, service_request"
        uuid service_id "soft ref to catalog.catalog_service - null means any"
        uuid offering_id "soft ref to catalog.catalog_service_offering"
        priority_enum priority "null means any priority"
        boolean major_incident_only "accelerated targets - FR-MIM-02"
        uuid support_schedule_id FK
        integer response_target_minutes "minutes of schedule time, not wall time"
        integer resolution_target_minutes
        integer specificity "precomputed match rank - most specific policy wins, FR-SLA-02"
        integer version_no
        boolean active
        timestamptz effective_from
        timestamptz effective_to
    }
    SLA_WARNING_THRESHOLD {
        uuid id PK
        uuid policy_id FK
        sla_target_type_enum target_type UK "response, resolution"
        smallint percent UK "50, 75, 90 - FR-SLA-05"
        boolean active
    }
    SLA_ESCALATION_RULE {
        uuid id PK
        uuid policy_id FK
        escalation_trigger_enum trigger "warning, breach - FR-SLA-07"
        smallint threshold_percent
        escalation_type_enum escalation_type "functional, hierarchical"
        uuid target_group_id "soft ref to iam.iam_resolver_group"
        varchar_64 target_role_code "soft ref to iam.iam_role.code"
        varchar_64 notification_template_code "soft ref to notification.ntf_template.code"
        boolean active
    }
    SLA_INSTANCE {
        uuid id PK
        record_type_enum record_type "incident, service_request"
        uuid record_id "soft ref - polymorphic, no FK by design"
        varchar_20 record_reference "denormalized for operator readability"
        uuid policy_id FK
        integer policy_version_no
        sla_target_type_enum target_type "response, resolution"
        timestamptz record_created_at "ORIGINAL ticket creation - basis of FR-SLA-04"
        timestamptz started_at
        timestamptz target_at "UTC deadline after schedule and pause maths"
        integer elapsed_paused_seconds
        timestamptz paused_at "non null while the clock is stopped - FR-SLA-08"
        timestamptz stopped_at
        sla_instance_state_enum state "running, paused, met, breached, cancelled, superseded"
        boolean breached
        timestamptz breached_at
        integer breach_elapsed_seconds "FR-SLA-06"
        timestamptz superseded_at "recalculation supersedes, never mutates"
        timestamptz created_at
        timestamptz updated_at
        integer version
    }
    SLA_INSTANCE_REVISION {
        uuid id PK
        uuid instance_id FK
        integer revision_no
        uuid previous_policy_id
        timestamptz previous_target_at "preserved value - FR-SLA-04"
        timestamptz new_target_at
        varchar_255 reason "priority_change, service_change, major_declaration"
        uuid changed_by
        timestamptz occurred_at "append only"
    }
    SLA_PAUSE_PERIOD {
        uuid id PK
        uuid instance_id FK
        timestamptz paused_at
        timestamptz resumed_at
        varchar_64 pending_reason "customer, third_party, change"
        uuid paused_by
    }
    SLA_EVENT {
        uuid id PK
        uuid instance_id FK
        sla_event_enum event_type "started, warning, paused, resumed, recalculated, met, breached"
        smallint threshold_percent
        timestamptz occurred_at "append only - no updated_at"
        boolean notified
        uuid notification_dispatch_id "soft ref to notification.ntf_dispatch"
    }

    SLA_SUPPORT_SCHEDULE ||--o{ SLA_SCHEDULE_WINDOW : "opens during"
    SLA_SUPPORT_SCHEDULE ||--o{ SLA_HOLIDAY : "excludes"
    SLA_SUPPORT_SCHEDULE ||--o{ SLA_POLICY : "times"
    SLA_POLICY ||--o{ SLA_WARNING_THRESHOLD : "warns at"
    SLA_POLICY ||--o{ SLA_ESCALATION_RULE : "escalates by"
    SLA_POLICY ||--o{ SLA_INSTANCE : "governs"
    SLA_INSTANCE ||--o{ SLA_INSTANCE_REVISION : "was recalculated by"
    SLA_INSTANCE ||--o{ SLA_PAUSE_PERIOD : "was stopped during"
    SLA_INSTANCE ||--o{ SLA_EVENT : "raised"
```

Three decisions carry the requirements:

- **`record_created_at` is copied onto the instance.** FR-SLA-04 recalculates from the original ticket creation instant, not from the moment the priority changed — this column is what makes that survivable across a restart.
- **Remaining time is always derived from stored UTC timestamps** (`started_at`, `target_at`, `paused_at`, `elapsed_paused_seconds`), never from an in-memory counter or from scheduled-job liveness (NFR-AVL-05, ADR-009).
- **Breach fields are written once and there is no update path** on the repository port: FR-SLA-06 ("no retroactive silent modification") becomes structural rather than procedural. A recalculation **supersedes** an instance and records the previous target in `sla_instance_revision`.

`uq_sla_instance_active` — unique `(record_type, record_id, target_type)` partial `WHERE superseded_at IS NULL` — enforces "exactly one applicable commitment" (FR-SLA-02).

#### 3.1.10 Knowledge — schema `knowledge`

Article identity is stable; content is versioned and translated. Full-text search is native PostgreSQL — **no external search engine** in the MVP (constraint K8).

```mermaid
erDiagram
    KB_ARTICLE {
        uuid id PK
        varchar_20 reference UK "KB0000031"
        kb_type_enum article_type "how_to, known_issue, workaround, faq, policy - FR-KNW-01"
        kb_status_enum status "draft, review, published, retired - FR-KNW-02"
        kb_visibility_enum visibility "requester, internal - there is no public value, FR-KNW-03"
        uuid owner_user_id "soft ref to iam.iam_user"
        uuid category_id "soft ref to catalog.catalog_category"
        uuid service_id "soft ref to catalog.catalog_service"
        integer current_version_no
        uuid approved_by "soft ref - publication approver"
        timestamptz published_at
        timestamptz retired_at
        timestamptz review_due_at "stale-article review - FR-KNW-07"
        integer view_count
        integer helpful_count
        integer not_helpful_count
        timestamptz created_at
        timestamptz updated_at
        integer version
    }
    KB_ARTICLE_VERSION {
        uuid id PK
        uuid article_id FK
        integer version_no UK
        kb_status_enum status
        uuid author_user_id
        varchar_500 change_summary
        timestamptz created_at
    }
    KB_ARTICLE_TRANSLATION {
        uuid id PK
        uuid version_id FK
        varchar_10 locale UK "en, es - NFR-I18N-04"
        varchar_255 title
        varchar_500 summary
        text body_markdown
        tsvector search_vector "generated stored column - GIN indexed, FR-KNW-04"
        boolean is_fallback "the defined fallback language"
    }
    KB_TAG {
        uuid id PK
        varchar_64 code UK
        varchar_100 label
    }
    KB_ARTICLE_TAG {
        uuid article_id PK
        uuid tag_id PK
    }
    KB_ARTICLE_LINK {
        uuid id PK
        uuid article_id FK
        record_type_enum record_type "incident, service_request, problem"
        uuid record_id "soft ref - polymorphic"
        kb_link_type_enum link_type "resolution_source, suggested_at_intake, workaround_of - FR-KNW-05"
        uuid created_by
        timestamptz created_at
    }
    KB_ARTICLE_FEEDBACK {
        uuid id PK
        uuid article_id FK
        uuid user_id "soft ref to iam.iam_user - one rating per reader"
        boolean helpful
        varchar_500 comment
        timestamptz created_at
    }
    KB_VIEW_EVENT {
        uuid id PK
        uuid article_id FK
        uuid user_id "soft ref"
        varchar_64 session_id "deflection correlation - FR-KNW-06, phase 3"
        boolean led_to_ticket
        timestamptz viewed_at "append only"
    }

    KB_ARTICLE ||--o{ KB_ARTICLE_VERSION : "is authored as"
    KB_ARTICLE_VERSION ||--o{ KB_ARTICLE_TRANSLATION : "is localized by"
    KB_ARTICLE ||--o{ KB_ARTICLE_TAG : "is tagged by"
    KB_TAG ||--o{ KB_ARTICLE_TAG : "tags"
    KB_ARTICLE ||--o{ KB_ARTICLE_LINK : "is attached to records by"
    KB_ARTICLE ||--o{ KB_ARTICLE_FEEDBACK : "is rated by"
    KB_ARTICLE ||--o{ KB_VIEW_EVENT : "is read in"
```

`search_vector` is a **generated stored column** over title + summary + body, with a **GIN** index, plus a `pg_trgm` index on `title` for typo-tolerant intake suggestions (FR-INC-16). Search runs against the current version of `published` articles and is filtered by the reader's visibility entitlement **server-side, as a `WHERE` clause** — never by omission in a template (NFR-SEC-02). Language configuration is selected per row from `locale`, which is why translations are rows and not columns. `visibility` has **no `public` value**: nothing is reachable without authentication (FR-IAM-01).

#### 3.1.11 Approval & Notification — schemas `approval` and `notification`

One generic approval engine serves Service Requests now and Changes/Releases in phase 2. Every notification is recorded against its source record and dispatched **after commit** off the domain-event bus (ADR-008), so a failing gateway can never roll back a ticket (NFR-AVL-03).

```mermaid
erDiagram
    APR_WORKFLOW {
        uuid id PK
        varchar_64 code UK
        varchar_150 name
        record_type_enum record_type "service_request, change, release"
        integer version_no
        boolean active
    }
    APR_STAGE {
        uuid id PK
        uuid workflow_id FK
        integer sequence_no UK
        varchar_150 name
        stage_mode_enum mode "sequential, parallel - FR-APR-01"
        quorum_type_enum quorum_type "all, any, majority - FR-APR-06, phase 4"
        smallint quorum_value
        integer due_in_hours "reminder and escalation basis - FR-APR-05"
    }
    APR_APPROVER_RULE {
        uuid id PK
        uuid stage_id FK
        approver_resolver_enum resolver_type "role, group, named_user, competition_owner - FR-APR-02"
        varchar_100 operand
        integer evaluation_order
    }
    APR_REQUEST {
        uuid id PK
        uuid workflow_id FK
        integer workflow_version_no
        record_type_enum record_type
        uuid record_id "soft ref - polymorphic, no FK by design"
        varchar_20 record_reference
        uuid requested_by "soft ref to iam.iam_user"
        timestamptz requested_at
        apr_state_enum state "pending, approved, rejected, cancelled, expired"
        integer current_stage_seq
        timestamptz decided_at
        timestamptz created_at
        timestamptz updated_at
        integer version
    }
    APR_TASK {
        uuid id PK
        uuid request_id FK
        uuid stage_id FK
        uuid approver_user_id "soft ref - resolved at task creation"
        uuid delegate_user_id "soft ref - FR-APR-04, phase 2"
        apr_task_state_enum state "pending, approved, rejected, delegated, expired"
        timestamptz due_at
        timestamptz reminded_at
        timestamptz created_at
        timestamptz updated_at
    }
    APR_DECISION {
        uuid id PK
        uuid task_id FK UK "one decision per task, forever - FR-APR-07"
        uuid request_id FK
        approval_decision_enum decision "approved, rejected"
        varchar_1000 comment "mandatory on rejection - FR-APR-03"
        uuid decided_by "soft ref - the actual decider"
        uuid on_behalf_of "soft ref - original approver when delegated"
        timestamptz decided_at "append only - no updated_at, no update or delete grant"
    }
    NTF_TEMPLATE {
        uuid id PK
        varchar_64 code UK "incident.acknowledged, sla.warning, approval.requested"
        varchar_64 event_type
        ntf_channel_enum channel "in_app, email, push"
        integer version_no
        boolean active
    }
    NTF_TEMPLATE_TRANSLATION {
        uuid id PK
        uuid template_id FK
        varchar_10 locale UK "NFR-I18N-04"
        varchar_255 subject
        text body "token placeholders, no hardcoded strings"
        boolean is_fallback
    }
    NTF_RULE {
        uuid id PK
        varchar_150 name
        varchar_64 event_type
        record_type_enum record_type
        ntf_audience_enum audience "requester, assignee, assigned_group, approver, stakeholder_list, role"
        varchar_64 audience_operand
        uuid template_id FK
        ntf_channel_enum channel
        boolean is_mandatory "cannot be disabled by a user preference - FR-NOT-07"
        boolean active
        integer evaluation_order
    }
    NTF_STAKEHOLDER_LIST {
        uuid id PK
        varchar_64 code UK "major_incident_stakeholders - FR-NOT-04"
        varchar_150 name
        boolean active
    }
    NTF_STAKEHOLDER_MEMBER {
        uuid id PK
        uuid list_id FK
        uuid user_id "soft ref to iam.iam_user"
        varchar_255 external_address
        timestamptz created_at
    }
    NTF_DISPATCH {
        uuid id PK
        uuid template_id FK
        integer template_version_no
        ntf_channel_enum channel
        uuid recipient_user_id "soft ref to iam.iam_user"
        varchar_255 recipient_address "resolved at send time"
        varchar_10 locale
        record_type_enum record_type
        uuid record_id "soft ref - polymorphic, FR-NOT-08"
        varchar_20 record_reference
        varchar_255 rendered_subject
        text rendered_body "what was actually sent, kept as evidence"
        dispatch_state_enum state "queued, sent, failed, read, cancelled"
        smallint attempt_count
        varchar_500 failure_reason
        uuid correlation_event_id "the domain event that caused it"
        timestamptz queued_at
        timestamptz sent_at
        timestamptz read_at
        timestamptz created_at
        timestamptz updated_at
    }

    APR_WORKFLOW ||--o{ APR_STAGE : "is composed of"
    APR_STAGE ||--o{ APR_APPROVER_RULE : "resolves approvers by"
    APR_WORKFLOW ||--o{ APR_REQUEST : "governs"
    APR_REQUEST ||--o{ APR_TASK : "assigns"
    APR_STAGE ||--o{ APR_TASK : "produces"
    APR_TASK ||--|| APR_DECISION : "is closed by"
    APR_REQUEST ||--o{ APR_DECISION : "aggregates"
    NTF_TEMPLATE ||--o{ NTF_TEMPLATE_TRANSLATION : "is localized by"
    NTF_TEMPLATE ||--o{ NTF_RULE : "is selected by"
    NTF_TEMPLATE ||--o{ NTF_DISPATCH : "renders"
    NTF_STAKEHOLDER_LIST ||--o{ NTF_STAKEHOLDER_MEMBER : "contains"
    APR_REQUEST ||..o{ NTF_DISPATCH : "notifies through"
```

**Approval immutability is enforced on three levels, not one** (FR-APR-07): `apr_decision` has no `updated_at`; the repository port exposes no update or delete method for decisions; and the application database role holds `INSERT, SELECT` only on the table. `ntf_dispatch` stores the **rendered** subject and body because "the requester was told X at time T" is evidence — re-rendering from a later template version would falsify it.

#### 3.1.12 Audit & reporting — schemas `audit` and `reporting`

One append-only journal, and a set of projections that are never a system of record.

```mermaid
erDiagram
    AUDIT_ENTRY {
        uuid id PK "UUID v7 - inserts stay at the right edge of the index"
        timestamptz occurred_at PK "monthly range partition key"
        uuid event_id UK "domain event id - idempotency, a retry cannot double-write history"
        varchar_32 context "incident, service_request, sla, approval, iam, catalog, knowledge, notification"
        record_type_enum record_type "includes configuration - FR-AUD-05"
        uuid record_id "soft ref - polymorphic, indexed"
        varchar_20 record_reference "denormalized so 2-year-old history reads without a join"
        actor_type_enum actor_type "user, system_rule, integration"
        uuid actor_user_id "identifier only, never PII - enables pseudonymization"
        varchar_100 actor_rule_code "which automation rule fired - FR-WFL-06"
        varchar_64 action "state_changed, field_changed, assigned, commented, approved, notified"
        varchar_64 field_name "null for whole-record actions"
        jsonb previous_value "FR-AUD-02"
        jsonb new_value "FR-AUD-02"
        audit_visibility_enum visibility "internal, requester_visible - FR-AUD-04"
        uuid correlation_id "ties the entry to the pino request log"
        inet ip_address
        varchar_255 user_agent
    }
    RPT_TICKET_FACT {
        uuid id PK "same id as the source ticket - rebuild is an idempotent upsert"
        record_type_enum record_type "incident, service_request"
        varchar_20 reference UK
        timestamptz created_at
        uuid service_id
        uuid category_id
        varchar_255 category_path "denormalized at projection time - NFR-DAT-03"
        priority_enum priority
        boolean competition_affects
        competition_subject_enum competition_subject_type
        varchar_100 competition_subject_external_id
        origin_channel_enum origin_channel
        uuid assigned_group_id
        uuid assigned_user_id
        state_category_enum state_category
        timestamptz first_response_at
        timestamptz resolved_at
        timestamptz closed_at
        timestamptz response_target_at
        timestamptz resolution_target_at
        boolean response_met
        boolean resolution_met
        integer mtta_minutes "net of clock-stopping pending states"
        integer mttr_minutes "net of clock-stopping pending states"
        boolean first_contact_resolution
        smallint reopen_count
        boolean knowledge_assisted
        smallint csat_score
        boolean is_major
        timestamptz projected_at
    }
    RPT_SLA_COMPLIANCE_DAILY {
        uuid id PK
        date bucket_date UK
        record_type_enum record_type UK
        uuid service_id UK
        priority_enum priority UK
        integer tickets_total
        integer response_met_count
        integer resolution_met_count
        integer breached_count
        numeric_5_2 compliance_pct
        timestamptz projected_at
    }
    RPT_BACKLOG_SNAPSHOT_DAILY {
        uuid id PK
        date snapshot_date UK
        record_type_enum record_type UK
        state_category_enum state_category UK
        priority_enum priority UK
        uuid assigned_group_id UK
        integer open_count
        integer aged_over_target_count
        integer aged_over_2x_target_count
        timestamptz projected_at
    }
    RPT_AGENT_WORKLOAD_DAILY {
        uuid id PK
        date bucket_date UK
        uuid assigned_user_id UK
        uuid assigned_group_id
        integer assigned_count
        integer resolved_count
        integer reopened_count
        timestamptz projected_at
    }
    RPT_PROJECTION_RUN {
        uuid id PK
        varchar_64 projection_name
        timestamptz watermark_from
        timestamptz watermark_to
        integer rows_written
        integer duration_ms
        projection_status_enum status "success, failed, partial"
        varchar_500 error_message
        timestamptz started_at
        timestamptz finished_at
    }

    AUDIT_ENTRY ||..o{ RPT_TICKET_FACT : "is a source of"
    RPT_TICKET_FACT ||..o{ RPT_SLA_COMPLIANCE_DAILY : "is aggregated into"
    RPT_TICKET_FACT ||..o{ RPT_BACKLOG_SNAPSHOT_DAILY : "is aggregated into"
    RPT_TICKET_FACT ||..o{ RPT_AGENT_WORKLOAD_DAILY : "is aggregated into"
    RPT_PROJECTION_RUN ||..o{ RPT_TICKET_FACT : "produced"
```

**What is absent from `audit_entry` is the point.** No `updated_at`, no `deleted_at`, no update or delete method on `AuditRepositoryPort`, and no `UPDATE`/`DELETE` grant for the application role:

```sql
GRANT INSERT, SELECT ON audit.audit_entry TO sport_itsm_app;
REVOKE UPDATE, DELETE, TRUNCATE ON audit.audit_entry FROM sport_itsm_app;
```

FR-AUD-03 says no role — including System Administrator — may edit or delete history. That is not a policy anyone can forget to apply: the capability does not exist at the port and the privilege does not exist at the database. Corrections are made by inserting a new entry (NFR-AUD-02). Administrative configuration changes (FR-AUD-05) live in the **same** table with `record_type = 'configuration'`: one journal, one query path, one guarantee. Retention is `DETACH PARTITION`, not a mass `DELETE` (NFR-DAT-02).

`reporting` owns projections only; dashboards read `reporting` and never query `incident` or `sla` directly, so a heavy report cannot degrade ticket intake. `rpt_projection_run` records the watermark, row count and outcome of every pass, which is the operational meaning of "the same filters over the same period return the same values" (FR-RPT-07).

#### 3.1.13 Indexes that carry the NFRs, and phase 2

Indexes are chosen for stated non-functional requirements, not speculatively:

| Index | Table | Definition | Serves |
| --- | --- | --- | --- |
| `ix_incident_worklist` | `incident_ticket` | `(priority, created_at)` partial `WHERE state_category IN ('open','pending')` | **NFR-PRF-02** — agent work list under 2 s at match-day volume (FR-QUE-02) |
| `ix_incident_group_queue` / `ix_incident_mine` | `incident_ticket` | `(assigned_group_id \| assigned_user_id, state_category, priority)` partial on open states | FR-QUE-02/03 |
| `ix_incident_reporter` | `incident_ticket` | `(reporter_user_id, created_at DESC)` | FR-IAM-03 — a requester sees only their own tickets |
| `ix_incident_subject` | `incident_ticket` | `(competition_subject_type, competition_subject_external_id)` | **NFR-AUD-04** — every Incident affecting a competition in a period |
| `ix_incident_competition_flag` | `incident_ticket` | `(created_at DESC)` partial `WHERE competition_affects` | Domain KPIs on the flagged subset (PRD §9.2) |
| `ix_incident_confirmation` | `incident_ticket` | `(confirmation_due_at)` partial `WHERE state_category = 'resolved'` | FR-INC-09 auto-close sweep |
| `ix_sla_sweep` | `sla_instance` | `(target_at)` partial `WHERE state = 'running'` | **NFR-PRF-04** — warning/breach within one minute, independent of total volume |
| `ix_kb_search` | `kb_article_translation` | **GIN** on `search_vector` | **FR-KNW-04** full-text search |
| `ix_apr_task_pending` | `apr_task` | `(approver_user_id, due_at)` partial `WHERE state = 'pending'` | FR-APR-05 approver inbox |
| `ix_ntf_outbox` | `ntf_dispatch` | `(queued_at)` partial `WHERE state = 'queued'` | ADR-008 post-commit dispatch loop |
| `ix_audit_record` | `audit_entry` | `(record_type, record_id, occurred_at DESC)` | FR-AUD-04 activity history — the most frequent read |
| `ix_iam_user_role_active` | `iam_user_role` | `(user_id)` partial `WHERE revoked_at IS NULL` | Read on **every** authorization check (NFR-SEC-02) |

**Phase 2 is deliberately not modelled.** `problem`, `change`, `release` and `asset-config` (PRD §14.4) have their behavior specified but their schema left to the phase-2 design, so it is shaped by real phase-1 experience rather than speculation. What phase 1 already guarantees for them: `incident_link` and `sr_link` already accept `problem`, `change`, `release` and `configuration_item` as target record types, holding opaque `uuid`s with no FK (FR-INC-10), and `apr_workflow.record_type` already accepts `change` and `release`. Adding those contexts is therefore **additive** — new schemas and new tables, with **no phase-1 table restructured**.

> **Status:** as in §2.1, §2.2 and §2.3, this is the **target data model**. The Nx workspace has not been scaffolded, there is no `apps/api/src/data-source.ts`, **no TypeORM entity and no migration exists**, and no database has ever been created. None of the constraints, partial indexes, partitions or `GRANT`/`REVOKE` statements above has been executed or measured; NFR-PRF-02 and NFR-PRF-04 must be proven with `EXPLAIN (ANALYZE, BUFFERS)` against a seeded volume before either is claimed.

### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto.

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**
