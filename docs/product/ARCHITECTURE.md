# Sport ITSM — Architecture Document

| Field | Value |
|---|---|
| Product | **Sport IT Service Management ("Sport ITSM")** |
| Supported service | **Sports Competition Management System (SCMS)** |
| Document type | Software Architecture Document — structural, technology-bearing |
| Owner | Software Architect, Sport ITSM |
| Status | **Target architecture — design intent, not as-built** |
| Authoritative inputs | `CLAUDE.md` (stack, layout, tags), `docs/PRD.md` (behavior, phasing), `readme.md` §0.3/§1.1/§1.2 (ubiquitous language) |
| Governing standards | `sport-itsm-architecture` (structure), `sport-itsm-backend`, `sport-itsm-frontend`, `sport-itsm-engineering-principles` |
| Language standard | Technical English, standard DDD / ITSM terminology |

> ## Reading notice — this document describes a target, not an implementation
>
> **No application code exists in this repository yet.** There is no `apps/` directory, no `libs/` directory, no `package.json` and no Nx workspace. Every project name, path, tag, port, adapter and dependency edge in this document is **prescriptive design intent** that scaffolding must produce, not documentation of code that has been written. Statements are written in the present tense for readability; read them as "shall be".
>
> **Behavioral authority is the PRD.** Where `readme.md` §1.2 still mentions *live windows*, *event-aware SLA policies*, *deployment freeze windows*, *change calendars around competition windows* or a *public/spectator surface*, those concepts are **superseded and out of scope** (PRD §3.3, §11 K5, FR-CHG-07 retired). This architecture therefore contains **no competition-calendar model, no time-based SLA modulation, no freeze-window engine and no anonymous surface**. Competition impact is a single agent-set boolean with mandatory justification that raises assessed Impact inside the configurable **Impact x Urgency** matrix (FR-INC-05, FR-SLA-04).
>
> **No business rules are invented here.** Every capability, lifecycle and constraint referenced traces to a PRD functional requirement ID. Structure is owned by this document; behavior is owned by `openspec/`.

---

## Table of Contents

1. [Architectural Drivers and Principles](#1-architectural-drivers-and-principles)
2. [Level 1 — System Context](#2-level-1--system-context-c4-l1)
3. [Level 2 — Containers](#3-level-2--containers-c4-l2)
4. [Bounded Context Map](#4-bounded-context-map-ddd-strategic)
5. [Nx Monorepo Structure, Tags and Boundaries](#5-nx-monorepo-structure-tags-and-boundaries)
6. [Backend — Hexagonal Architecture](#6-backend--hexagonal-architecture)
7. [Frontend — Angular Architecture](#7-frontend--angular-architecture)
8. [End-to-End Flow Across Both Platforms](#8-end-to-end-flow-across-both-platforms)
9. [Cross-Cutting Architecture](#9-cross-cutting-architecture)
10. [Key Structural Decisions](#10-key-structural-decisions)
11. [Out of Scope for the MVP](#11-out-of-scope-for-the-mvp)
12. [Verification and Governance](#12-verification-and-governance)

---

## 1. Architectural Drivers and Principles

### 1.1 Drivers taken from the PRD

| Driver | PRD source | Architectural consequence |
|---|---|---|
| 24x7 availability of intake; Sport ITSM is itself a critical service | NFR-AVL-01/02 | Health probes and stateless API instances; intake path must not depend on optional subsystems |
| Intake must survive degradation of knowledge, reporting and notifications | NFR-AVL-03 | Notification, knowledge and reporting are **separate contexts behind ports**; their failure cannot fail the ticket transaction |
| Immutable, reconstructable history; no role may mutate it | FR-AUD-01/03, NFR-AUD-02 | An append-only `audit` context fed by domain events; no update or delete adapter is provided at all |
| Everything configurable without a release | NFR-CFG-01, FR-WFL-01 | Taxonomy, Impact x Urgency matrix, SLA policies, workflows, approvals and notification templates are **data**, not code |
| SLA timers accurate across restarts | NFR-AVL-05 | Timer state persisted in PostgreSQL; elapsed time derived from stored timestamps, never from in-memory counters |
| Server-side authorization on every operation | NFR-SEC-02 | Authorization is enforced in the backend application layer; the Angular client never holds a security decision |
| Full localizability, English and Spanish at launch | NFR-I18N-01/02 | Transloco on the client, `nestjs-i18n` on the API driven by `Accept-Language` propagated by a locale interceptor |
| Academic/portfolio delivery capacity | K8 | One deployable API and one deployable web client — a modular monolith, not microservices |

### 1.2 Non-negotiable structural principles

1. **One system, two platforms.** Frontend and backend are governed as a single architecture and integrate **only** through `libs/shared/contracts`. Neither may depend on the other.
2. **Dependencies point inward.** `type:domain` and `type:application` contain no framework, ORM, HTTP or I/O import. Adapters depend on the core; the core never depends on adapters.
3. **Contexts are isolated.** A `scope:<context>` project may depend only on itself and `scope:shared`. Cross-context interaction happens through ports resolved at the composition root, or through domain events.
4. **Boundaries are mechanical.** Every rule above is encoded as Nx tags plus `@nx/enforce-module-boundaries`. An illegal dependency means the design is wrong; the rule is never relaxed.
5. **Modular monolith, context-ready for extraction.** A single NestJS process hosts all contexts, but no context may be coupled in a way that would prevent extracting it later.

---

## 2. Level 1 — System Context (C4 L1)

Sport ITSM serves **identified SCMS users and the service organization only**. There is no anonymous or public surface, no spectator persona and no public Knowledge Base (FR-IAM-01, FR-KNW-03, PRD §3.3).

```mermaid
flowchart TB
    subgraph demand["Demand side - identified SCMS users"]
        P["Player or Competitor"]
        TM["Team Manager or Captain"]
        ORG["Tournament Organizer"]
        REF["Referee or Match Official"]
        LA["League Administrator"]
    end

    subgraph supply["Supply side - service organization"]
        L1["Service Desk Agent L1"]
        L2["Application Support Analyst L2 or L3"]
        CRM["Change and Release Manager"]
        SO["Service Owner or Service Manager"]
        SA["System Administrator"]
    end

    SITSM["<b>Sport ITSM</b><br/>ITSM platform supporting the SCMS platform<br/>Incident, Service Request, Problem, Change,<br/>Release, CMDB, SLA, Catalog, Knowledge, IAM"]

    subgraph ext["External systems"]
        IDP["SCMS Identity Provider / SSO<br/>authentication and profile attributes<br/>PRD D1 - FR-IAM-04"]
        SCMS["SCMS Platform<br/>competition reference data, read only<br/>PRD D2 and D3"]
        MAIL["Email Gateway<br/>outbound notifications<br/>PRD D5 and D7"]
        CICD["CI/CD and Environment Tooling<br/>deployment facts for Release and CMDB<br/>PRD D6 - phase 2"]
        PAY["Payment and Registration Subsystem<br/>context for billing tickets<br/>PRD D4"]
    end

    P --> SITSM
    TM --> SITSM
    ORG --> SITSM
    REF --> SITSM
    LA --> SITSM

    L1 --> SITSM
    L2 --> SITSM
    CRM --> SITSM
    SO --> SITSM
    SA --> SITSM

    SITSM -->|"OIDC or OAuth2 - authenticate and read profile"| IDP
    SITSM -->|"HTTPS read only - competition identifiers and labels"| SCMS
    SITSM -->|"SMTP or HTTPS - send notification"| MAIL
    CICD -.->|"deployment outcome - phase 2, manual fallback"| SITSM
    PAY -.->|"reference context only - no transaction execution"| SITSM

    classDef sys fill:#1f6feb,stroke:#0b3d91,color:#ffffff
    classDef extn fill:#e8e8e8,stroke:#8b8b8b,color:#111111
    class SITSM sys
    class IDP,SCMS,MAIL,CICD,PAY extn
```

**Boundary notes**

- **SCMS is not a data master for Sport ITSM.** Sport ITSM consumes competition **identifiers and labels** only, so a ticket can name its affected subject accurately. It does not import, maintain or reason over a competition calendar (PRD D2, §3.3). Free-text capture of the affected competition instance is the accepted MVP fallback (R10), which means the SCMS integration is **optional at runtime** and sits behind an anti-corruption port.
- **Payment execution stays outside.** Sport ITSM records and supports payment-related Incidents and Requests; it never executes transactions (PRD §3.3).
- **CI/CD integration is phase 2** and has a manual fallback (D6), so it is a port with a human-operated adapter first.

---

## 3. Level 2 — Containers (C4 L2)

Three deployable/runtime containers plus the identity dependency. Deliberately no message broker, no cache tier and no separate reporting store in the MVP — PostgreSQL 16 is the single system of record (constraint K8).

```mermaid
flowchart TB
    USER["Requesters and Service Organization<br/>browser, desktop and mobile"]

    subgraph boundary["Sport ITSM system boundary"]
        WEB["<b>Web Client</b> - apps/web<br/>Angular 20.3, standalone components, signals,<br/>in-house SCSS component library, Reactive Forms, Transloco<br/>Self-Service Portal, Agent Workspace, Admin Console"]
        API["<b>API</b> - apps/api<br/>NestJS 11 on Express 4, Node.js 20 LTS<br/>Inbound HTTP adapter plus composition root<br/>global prefix /api, Swagger at /api/docs in dev,<br/>health at /health/live and /health/ready"]
        DB[("<b>PostgreSQL 16</b><br/>single system of record<br/>tickets, SLA timers, catalog, knowledge,<br/>CMDB, approvals, append-only audit<br/>TypeORM 0.3, synchronize always false")]
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

    classDef c fill:#1f6feb,stroke:#0b3d91,color:#ffffff
    classDef store fill:#0e7c66,stroke:#064e40,color:#ffffff
    classDef extn fill:#e8e8e8,stroke:#8b8b8b,color:#111111
    class WEB,API c
    class DB store
    class IDP,MAIL,SCMS extn
```

### 3.1 Container responsibilities

| Container | Responsibility | Explicitly NOT responsible for |
|---|---|---|
| **`apps/web` — Angular client** | Render the Self-Service Portal, Agent Workspace and Admin Console; capture input with Reactive Forms; hold view state in signals; attach JWT and `Accept-Language`; present loading, error and empty states; WCAG 2.1 AA. | Any authorization decision, any priority derivation, any SLA computation, any lifecycle rule. The UI **reflects** server decisions; it never makes them (NFR-SEC-02). |
| **`apps/api` — NestJS API** | Terminate HTTP; validate DTOs; authenticate and authorize; **compose** the hexagon by binding ports to adapters; execute use cases transactionally; emit and dispatch domain events; expose health and OpenAPI. | Business logic in controllers. Controllers are thin inbound adapters only. |
| **PostgreSQL 16** | Durable state for every context, including SLA timer timestamps and the append-only audit trail. Schema evolves **only** through TypeORM migrations. | Business logic. No triggers or stored procedures carrying domain rules; the domain lives in TypeScript. |

### 3.2 Protocols and cross-cutting HTTP contract

| Concern | Decision |
|---|---|
| Transport | HTTPS, JSON, REST. Route prefix `/api`; health endpoints **not** prefixed. |
| Typing | Request and response shapes are declared once in `libs/shared/contracts` and imported by both platforms — the only permitted FE/BE coupling. |
| AuthN | `Authorization: Bearer <JWT>` issued after Passport JWT verification; `bcrypt` for local credentials until SSO federation lands (FR-IAM-04 is **Should**, phase 2+). |
| i18n | Client sets `Accept-Language`; `nestjs-i18n` localizes API error messages and email templates (NFR-I18N-01/02/04). |
| Errors | Domain errors are mapped by a NestJS exception filter to a stable, contract-declared error-code envelope; the client maps codes to Transloco keys. Error codes are part of the contract, error **text** is not. |
| Time | All instants persisted and computed in UTC; the client renders in the user's locale and time zone (NFR-I18N-03). |

---

## 4. Bounded Context Map (DDD strategic)

### 4.1 Contexts

Ten baseline capability contexts from the architecture standard, plus a shared kernel, plus four **generic supporting contexts** that materialize the PRD's cross-cutting capabilities (C15 Approval, C16 Notification, C17 Reporting, C18 Audit). Introducing supporting contexts extends the baseline list and therefore **requires an ADR** — see [ADR-001](#adr-001--four-generic-supporting-contexts-for-cross-cutting-capabilities).

| Context | Type | PRD capability | Aggregate roots (target) | Phase |
|---|---|---|---|---|
| `incident` | Core | C1, C13 | `Incident` (root), `MajorIncident` declaration on the Incident root | 1 |
| `service-request` | Core | C2 | `ServiceRequest` (root) with `FulfillmentTask` entities | 1 |
| `sla` | Core | C7 | `SlaPolicy`, `SlaInstance` (timer state) | 1 |
| `service-catalog` | Supporting | C8 | `Service`, `ServiceOffering` | 1 |
| `knowledge` | Supporting | C9 | `KnowledgeArticle` | 1 |
| `identity-access` | Generic | C10, C14 | `User`, `Role`, `ResolverGroup` | 0 / 1 |
| `approval` | Generic | C15 | `ApprovalRequest` with immutable `ApprovalDecision` | 1 |
| `notification` | Generic | C16 | `NotificationDispatch` | 1 |
| `audit` | Generic | C18 | `AuditEntry` (append-only, no root mutation) | 0 |
| `reporting` | Generic | C17 | read models only, no aggregate | 1 |
| `problem` | Core | C3 | `Problem`, `KnownError` | 2 |
| `change` | Core | C4 | `Change` | 2 |
| `release` | Core | C5 | `Release` | 2 |
| `asset-config` | Core | C6 | `ConfigurationItem` with typed `CiRelationship` | 2 |
| `shared` | Shared kernel | — | no aggregates; primitives only | 0 |

Two PRD cross-cutting capabilities deliberately get **no context of their own**:

- **C11 Omnichannel Intake** is an *adapter concern*, not a domain. Portal and agent-logged intake are the same inbound HTTP adapter over the same use case; email-to-ticket (phase 3) becomes an additional inbound adapter. Only `originChannel` (FR-OMN-02) enters the domain, as a value object.
- **C12 Workflow and Automation** is realized as **configurable data interpreted by each context's domain**: a state-model and transition-rule primitive lives in `shared/domain`, and each context owns its own configured lifecycle (FR-INC-06, FR-SRQ-05, FR-CHG-04, FR-REL-03, FR-PRB-03). A central workflow engine context is explicitly rejected — it would become a god context every other context depends on, violating isolation.

### 4.2 Context map with integration patterns

```mermaid
flowchart TB
    subgraph kernel["Shared kernel - scope:shared"]
        SK["shared/domain<br/>Identity, TicketReference, ImpactLevel,<br/>UrgencyLevel, Priority, DomainEvent,<br/>StateModel, DateTimeRange"]
        CT["shared/contracts<br/>DTOs, enums, error codes<br/>published language, FE and BE"]
        UT["shared/util<br/>pure helpers"]
        SUI["shared/ui<br/>in-house design system: primitives,<br/>design tokens, a11y directives<br/>platform:frontend"]
    end

    subgraph core["Core contexts"]
        INC["incident<br/>C1 and C13"]
        SRQ["service-request<br/>C2"]
        SLA["sla<br/>C7"]
        PRB["problem - phase 2<br/>C3"]
        CHG["change - phase 2<br/>C4"]
        REL["release - phase 2<br/>C5"]
        CMD["asset-config - phase 2<br/>C6"]
    end

    subgraph supporting["Supporting contexts"]
        CAT["service-catalog<br/>C8"]
        KNW["knowledge<br/>C9"]
    end

    subgraph generic["Generic supporting contexts"]
        IAM["identity-access<br/>C10 and C14"]
        APR["approval<br/>C15"]
        NOT["notification<br/>C16"]
        AUD["audit<br/>C18"]
        RPT["reporting<br/>C17"]
    end

    INC -->|"Customer-Supplier - SlaPolicyPort<br/>attach policy, start, pause, resume"| SLA
    SRQ -->|"Customer-Supplier - SlaPolicyPort<br/>fulfillment target"| SLA
    SRQ -->|"Conformist - offering, form, eligibility"| CAT
    SRQ -->|"Customer-Supplier - ApprovalPort"| APR
    CHG -->|"Customer-Supplier - ApprovalPort"| APR
    REL -->|"Customer-Supplier - ApprovalPort"| APR

    INC -.->|"domain events<br/>IncidentLogged, PriorityChanged,<br/>Resolved, MajorIncidentDeclared"| NOT
    SRQ -.->|"domain events"| NOT
    SLA -.->|"SlaWarningRaised, SlaBreached"| NOT
    APR -.->|"ApprovalRequested, ApprovalDecided"| NOT

    INC -.->|"every state change and field change"| AUD
    SRQ -.-> AUD
    SLA -.-> AUD
    APR -.-> AUD
    CHG -.-> AUD
    IAM -.-> AUD

    INC -.->|"read models"| RPT
    SRQ -.-> RPT
    SLA -.-> RPT

    INC -->|"resolution source, article link"| KNW
    PRB -->|"publish workaround as article"| KNW
    PRB -->|"raise permanent fix"| CHG
    CHG -->|"delivered by"| REL
    CHG -->|"impact analysis"| CMD
    REL -->|"update CI version on deploy"| CMD
    INC -->|"link affected CIs"| CMD
    INC -->|"recurrence becomes Problem"| PRB

    INC --> IAM
    SRQ --> IAM
    CAT --> IAM

    core --> kernel
    supporting --> kernel
    generic --> kernel

    classDef corec fill:#1f6feb,stroke:#0b3d91,color:#ffffff
    classDef supp fill:#0e7c66,stroke:#064e40,color:#ffffff
    classDef gen fill:#6f42c1,stroke:#432874,color:#ffffff
    classDef kern fill:#c9a227,stroke:#7a6115,color:#111111
    class INC,SRQ,SLA,PRB,CHG,REL,CMD corec
    class CAT,KNW supp
    class IAM,APR,NOT,AUD,RPT gen
    class SK,CT,UT,SUI kern
```

**Legend.** Solid arrows are **synchronous** collaborations expressed as an outbound port owned by the upstream consumer. Dashed arrows are **asynchronous** collaborations carried by **domain events** published in-process. In both cases the arrow is a *conceptual* dependency: at the Nx level neither context imports the other (see §5.4).

### 4.3 Integration patterns applied

| Relationship | Pattern | Rationale |
|---|---|---|
| `incident` / `service-request` → `sla` | **Customer-Supplier** | The ticket contexts drive SLA requirements: attach a policy at creation, re-evaluate on priority change (FR-SLA-02, FR-SLA-04), pause and resume on pending states (FR-INC-08, FR-SLA-08). `sla` is a conscious upstream supplier that publishes a stable port. |
| `service-request` → `service-catalog` | **Conformist** | A Service Request exists only for a published offering (FR-SRQ-01). `service-request` conforms to the catalog's model of offering, form definition and eligibility rules rather than translating it. |
| `service-request` / `change` / `release` → `approval` | **Customer-Supplier via Open Host Service** | One generic approval engine serves three consumers with configurable stages and resolvable approvers (FR-APR-01/02). It exposes a single published port. |
| Everything → `audit` | **Published Language over domain events** | Audit consumes a normalized `AuditEntry` shape (actor, timestamp, record reference, action, previous value, new value — FR-AUD-02). Contexts never call audit; they publish events and audit subscribes. This is what makes FR-AUD-03 immutability structurally true: **no context is given a handle to mutate audit.** |
| Everything → `notification` | **Published Language over domain events** | Guarantees NFR-AVL-03: a failing notification adapter cannot fail a ticket transaction, because dispatch happens after commit. |
| Everything → `reporting` | **Open Host / read models** | Reporting reads its own denormalized projections; it never joins into another context's tables at will. Guarantees reproducibility (FR-RPT-07). |
| Sport ITSM → SCMS reference data | **Anticorruption Layer** | A `CompetitionSubjectLookupPort` in `shared/domain` with an SCMS gateway adapter and a free-text fallback adapter (R10). SCMS vocabulary never leaks into the ticket model. |
| Sport ITSM → SSO | **Anticorruption Layer** | An `IdentityProviderPort` in `identity-access` isolates the platform from the SCMS identity model (A2, FR-IAM-04). |

---

## 5. Nx Monorepo Structure, Tags and Boundaries

### 5.1 Target project tree (MVP shape, phase 1)

Phase 2 contexts are shown for completeness and **are not scaffolded in phase 1** — generate only libs a context actually uses.

```text
apps/
  api/                    platform:backend  scope:shared  type:app     NestJS composition root + inbound HTTP adapter
  api-e2e/                platform:backend  scope:shared  type:e2e     Cypress + Cucumber API acceptance tests
  web/                    platform:frontend scope:shared  type:app     Angular shell: routing, providers, interceptors
  web-e2e/                platform:frontend scope:shared  type:e2e     Cypress + Cucumber UI acceptance tests

libs/
  shared/
    contracts/            platform:shared   scope:shared  type:contracts    DTOs, enums, error codes - FE + BE
    domain/               platform:shared   scope:shared  type:domain       shared kernel primitives
    ui/                   platform:frontend scope:shared  type:ui           in-house design system - primitives, tokens, a11y
    util/                 platform:shared   scope:shared  type:util          pure helpers

  incident/
    domain/               platform:backend  scope:incident type:domain          Incident aggregate + ports
    application/          platform:backend  scope:incident type:application     use cases
    infrastructure/       platform:backend  scope:incident type:infrastructure  TypeORM repos, gateways
    feature/              platform:frontend scope:incident type:feature         routed feature libs
    ui/                   platform:frontend scope:incident type:ui              presentational components
    data-access/          platform:frontend scope:incident type:data-access     HttpClient + signals store

  service-request/        same six libs                              scope:service-request
  sla/                    domain, application, infrastructure        scope:sla            (no UI of its own; surfaced inside ticket views)
  service-catalog/        six libs                                   scope:service-catalog
  knowledge/              six libs                                   scope:knowledge
  identity-access/        domain, application, infrastructure,
                          feature, data-access                       scope:identity-access
  approval/               domain, application, infrastructure,
                          feature, ui, data-access                   scope:approval
  notification/           domain, application, infrastructure,
                          data-access                                scope:notification
  audit/                  domain, application, infrastructure, ui    scope:audit
  reporting/              domain, application, infrastructure,
                          feature, ui, data-access                   scope:reporting

  problem/  change/  release/  asset-config/                         phase 2 - not scaffolded in phase 1
```

### 5.2 Tag scheme

Every project carries **exactly three tags**, no exceptions.

| Axis | Allowed values |
|---|---|
| `platform:` | `platform:backend`, `platform:frontend`, `platform:shared` |
| `scope:` | `scope:<context>` for each context in §4.1, or `scope:shared` |
| `type:` | `type:domain`, `type:application`, `type:infrastructure`, `type:feature`, `type:ui`, `type:data-access`, `type:contracts`, `type:util`, plus `type:app` and `type:e2e` for applications — see [ADR-002](#adr-002--typeapp-and-typee2e-added-to-the-type-axis) |

> **`scope:shared` does not imply `platform:shared`.** `platform:shared` is reserved for framework-free code that both platforms can import — `shared/contracts`, `shared/domain`, `shared/util`. `libs/shared/ui`, the in-house design system, is Angular code with a shared scope and is therefore tagged **`platform:frontend`, `scope:shared`, `type:ui`** (see [ADR-010](#adr-010--libssharedui-is-the-in-house-design-system-tagged-platformfrontend--scopeshared)). Read the platform tag per project, never per folder.

### 5.3 Type constraint matrix (enforced by `@nx/enforce-module-boundaries`)

The baseline matrix from the architecture standard, extended with the two application types.

| From \ May depend on | domain | application | infrastructure | feature | ui | data-access | contracts | util | app |
|---|---|---|---|---|---|---|---|---|---|
| **type:domain** | yes | no | no | no | no | no | no | yes | no |
| **type:application** | yes | yes | no | no | no | no | yes | yes | no |
| **type:infrastructure** | yes | yes | yes | no | no | no | yes | yes | no |
| **type:feature** | no | no | no | yes | yes | yes | yes | yes | no |
| **type:ui** | no | no | no | no | yes | no | no | yes | no |
| **type:data-access** | no | no | no | no | no | yes | yes | yes | no |
| **type:contracts** | no | no | no | no | no | no | yes | yes | no |
| **type:util** | no | no | no | no | no | no | no | yes | no |
| **type:app** | yes | yes | yes | yes | yes | yes | yes | yes | no |
| **type:e2e** | no | no | no | no | no | no | yes | yes | no |

Plus the two orthogonal rules:

- **scope rule** — a `scope:<context>` project may depend only on the same `scope:<context>` and on `scope:shared`. `scope:shared` may depend only on `scope:shared`.
- **platform rule** — `platform:frontend` and `platform:backend` may **never** depend on each other; both may depend on `platform:shared`.

`type:app` is the only type allowed to reach across contexts, and it does so **because it is the composition root** (§5.4). Its scope tag is `scope:shared`, so the scope rule does not block it.

`libs/shared/ui` is the only library that combines `scope:shared` with `platform:frontend`, and it needs **no exception** to the matrix above. Every `platform:frontend` project may depend on it — a context's `type:feature`, a context's own `type:ui` and the `apps/web` shell — because the `type:` rows already allow `feature → ui`, `ui → ui` and `app → ui`, and the scope rule allows `scope:<context> → scope:shared`. It may itself depend only on `scope:shared` `type:util`: its own `type:ui` row forbids `contracts`, `data-access`, `feature`, `application` and `infrastructure`, so its component inputs are primitives and locally declared unions, never contract enums. And no backend project can reach it, because the platform rule forbids `platform:backend → platform:frontend`.

### 5.4 Allowed dependency graph

```mermaid
flowchart TB
    subgraph be["platform:backend - per context"]
        BINF["type:infrastructure<br/>TypeORM repositories, gateways"]
        BAPP["type:application<br/>use cases, inbound ports"]
        BDOM["type:domain<br/>aggregates, value objects, outbound ports"]
    end

    subgraph fe["platform:frontend - per context"]
        FFEAT["type:feature<br/>routed containers, orchestration"]
        FUI["type:ui<br/>presentational, OnPush"]
        FDA["type:data-access<br/>HttpClient + signals store"]
    end

    subgraph shfe["platform:frontend - scope:shared"]
        SUI["type:ui - libs/shared/ui<br/>design-system primitives, tokens,<br/>focus-trap directive, aria-live announcer"]
    end

    subgraph sh["platform:shared - scope:shared"]
        CTR["type:contracts"]
        SDOM["type:domain - shared kernel"]
        SUTL["type:util"]
    end

    APIAPP["apps/api<br/>type:app - composition root"]
    WEBAPP["apps/web<br/>type:app - shell"]

    APIAPP --> BINF
    APIAPP --> BAPP
    APIAPP --> BDOM
    APIAPP --> CTR

    BINF --> BAPP
    BINF --> BDOM
    BINF --> CTR
    BAPP --> BDOM
    BAPP --> CTR
    BDOM --> SDOM
    BDOM --> SUTL

    WEBAPP --> FFEAT
    WEBAPP --> CTR
    FFEAT --> FUI
    FFEAT --> FDA
    FFEAT --> CTR
    FDA --> CTR
    FUI --> SUTL
    FDA --> SUTL
    WEBAPP --> SUI
    FFEAT --> SUI
    FUI --> SUI
    SUI --> SUTL

    CTR --> SUTL
    SDOM --> SUTL

    FORBID1["FORBIDDEN<br/>frontend to backend<br/>and backend to frontend"]
    FORBID2["FORBIDDEN<br/>domain or application<br/>to infrastructure"]
    FORBID3["FORBIDDEN<br/>scope:incident to scope:sla<br/>and any cross-context edge"]

    classDef dom fill:#c9a227,stroke:#7a6115,color:#111111
    classDef app fill:#1f6feb,stroke:#0b3d91,color:#ffffff
    classDef inf fill:#0e7c66,stroke:#064e40,color:#ffffff
    classDef shd fill:#6f42c1,stroke:#432874,color:#ffffff
    classDef bad fill:#b42318,stroke:#7a1710,color:#ffffff
    class BDOM dom
    class BAPP,FFEAT app
    class BINF,FDA,FUI,SUI inf
    class CTR,SDOM,SUTL shd
    class FORBID1,FORBID2,FORBID3 bad
```

**How cross-context collaboration stays legal.** `scope:incident` must not import `scope:sla` — yet an Incident needs an SLA policy attached at creation (FR-SLA-02). The resolution is strict Dependency Inversion at the module level:

1. `libs/incident/domain` declares the **outbound port** it needs, in its own ubiquitous language, e.g. `SlaPolicyPort` with `attachPolicyFor(ticketSnapshot): SlaCommitment`.
2. `libs/incident/application` depends on that port only.
3. `apps/api` — the composition root, tagged `scope:shared`, `type:app` — provides an **adapter class** implementing `SlaPolicyPort` by delegating to `libs/sla/application`. Only the app sees both contexts.
4. The Nx graph therefore shows `apps/api → incident/*` and `apps/api → sla/*`, and **never** `incident → sla`.

The same technique carries `approval`, `notification`, `audit` and the SCMS anti-corruption layer. This is the single most important structural rule in this document.

### 5.5 Scaffolding commands

Structure is materialized only with Nx generators, always with explicit tags.

```bash
# Shared kernel
pnpm nx g @nx/js:lib shared-contracts --directory=libs/shared/contracts \
  --tags=platform:shared,scope:shared,type:contracts
pnpm nx g @nx/js:lib shared-domain --directory=libs/shared/domain \
  --tags=platform:shared,scope:shared,type:domain
pnpm nx g @nx/js:lib shared-util --directory=libs/shared/util \
  --tags=platform:shared,scope:shared,type:util

# Shared UI - the in-house design system; Angular code, therefore platform:frontend
pnpm nx g @nx/angular:lib shared-ui --directory=libs/shared/ui \
  --tags=platform:frontend,scope:shared,type:ui

# Backend hexagon for one context
pnpm nx g @nx/js:lib incident-domain --directory=libs/incident/domain \
  --tags=platform:backend,scope:incident,type:domain
pnpm nx g @nx/js:lib incident-application --directory=libs/incident/application \
  --tags=platform:backend,scope:incident,type:application
pnpm nx g @nx/js:lib incident-infrastructure --directory=libs/incident/infrastructure \
  --tags=platform:backend,scope:incident,type:infrastructure

# Frontend slice for the same context
pnpm nx g @nx/angular:lib incident-feature --directory=libs/incident/feature \
  --tags=platform:frontend,scope:incident,type:feature
pnpm nx g @nx/angular:lib incident-ui --directory=libs/incident/ui \
  --tags=platform:frontend,scope:incident,type:ui
pnpm nx g @nx/angular:lib incident-data-access --directory=libs/incident/data-access \
  --tags=platform:frontend,scope:incident,type:data-access
```

---

## 6. Backend — Hexagonal Architecture

### 6.1 Layers, ports and adapters

```mermaid
flowchart LR
    subgraph driving["Driving side - inbound adapters"]
        HTTP["HTTP Controllers - apps/api<br/>thin, validated DTOs, no business logic"]
        SCHED["Scheduled Jobs - apps/api<br/>SLA warning and breach sweep,<br/>auto-close after confirmation period"]
        EVTIN["In-process Event Subscribers<br/>audit, notification, reporting projections"]
    end

    subgraph hex["The hexagon"]
        subgraph applayer["Application layer - type:application"]
            UC["Use cases<br/>LogIncident, TriageIncident,<br/>SetCompetitionInProgressFlag,<br/>OverridePriority, ResolveIncident<br/>orchestration, transaction boundary,<br/>authorization check"]
            IP["Inbound ports<br/>use-case interfaces"]
        end
        subgraph domlayer["Domain layer - type:domain - PURE"]
            AGG["Aggregates and entities<br/>Incident root"]
            VO["Value objects<br/>TicketReference, Impact, Urgency,<br/>Priority, Category, OriginChannel,<br/>CompetitionSubject"]
            DS["Domain services<br/>PriorityCalculator over the<br/>configurable Impact x Urgency matrix"]
            DE["Domain events<br/>IncidentLogged, PriorityChanged,<br/>MajorIncidentDeclared, IncidentResolved"]
            OP["Outbound ports - interfaces<br/>IncidentRepositoryPort, SlaPolicyPort,<br/>NotificationPort, AuditPort,<br/>EventPublisherPort, ClockPort"]
        end
    end

    subgraph driven["Driven side - outbound adapters"]
        REPO["TypeORM repositories<br/>type:infrastructure"]
        SLAAD["SlaPolicyAdapter - apps/api<br/>delegates to sla/application"]
        NOTAD["NotificationAdapter - apps/api<br/>delegates to notification/application"]
        AUDAD["AuditAdapter - apps/api<br/>append only"]
        SCMSAD["ScmsCompetitionGateway<br/>ACL with free-text fallback"]
        CLOCK["SystemClock"]
    end

    DBX[("PostgreSQL 16")]
    MAILX["Email Gateway"]
    SCMSX["SCMS reference data"]

    HTTP --> IP
    SCHED --> IP
    EVTIN --> IP
    IP --- UC
    UC --> AGG
    UC --> DS
    UC --> OP
    AGG --> VO
    AGG --> DE
    DS --> VO

    REPO -.->|"implements"| OP
    SLAAD -.->|"implements"| OP
    NOTAD -.->|"implements"| OP
    AUDAD -.->|"implements"| OP
    SCMSAD -.->|"implements"| OP
    CLOCK -.->|"implements"| OP

    REPO --> DBX
    AUDAD --> DBX
    NOTAD --> MAILX
    SCMSAD --> SCMSX

    classDef dom fill:#c9a227,stroke:#7a6115,color:#111111
    classDef app fill:#1f6feb,stroke:#0b3d91,color:#ffffff
    classDef adp fill:#0e7c66,stroke:#064e40,color:#ffffff
    classDef ext fill:#e8e8e8,stroke:#8b8b8b,color:#111111
    class AGG,VO,DS,DE,OP dom
    class UC,IP app
    class HTTP,SCHED,EVTIN,REPO,SLAAD,NOTAD,AUDAD,SCMSAD,CLOCK adp
    class DBX,MAILX,SCMSX ext
```

**The dependency rule, stated operationally.** Arrows into the hexagon are calls; the dotted arrows from adapters to ports are `implements`. No arrow ever leaves the domain toward an adapter. Concretely:

- `libs/incident/domain` has **zero** runtime dependencies beyond `libs/shared/domain` and `libs/shared/util`. No `@nestjs/*`, no `typeorm`, no `express`, no `Date.now()` (time arrives through `ClockPort`, which is what makes SLA logic testable and NFR-AVL-05 verifiable).
- `libs/incident/application` may import `libs/shared/contracts` — contracts are types only — but still no framework.
- Persistence entities in `libs/incident/infrastructure` are **separate classes** from domain aggregates, with an explicit mapper. The ORM never dictates the domain model.

### 6.2 The `incident` context in tactical detail

Only structure is shown; the behavior each element enforces is owned by the PRD requirement cited.

```mermaid
classDiagram
    class Incident {
        <<AggregateRoot>>
        +TicketReference reference
        +IncidentState state
        +Category category
        +Impact assessedImpact
        +Urgency urgency
        +Priority derivedPriority
        +CompetitionImpactFlag competitionImpact
        +CompetitionSubject affectedSubject
        +OriginChannel originChannel
        +ResolverAssignment assignment
        +log()
        +categorize()
        +flagCompetitionInProgress(justification)
        +overridePriority(priority, justification)
        +assign()
        +transitionTo(state)
        +resolve(resolutionCode, notes)
        +declareMajorIncident(justification)
        +linkChild(incidentId)
    }
    class TicketReference {
        <<ValueObject>>
        +string value
    }
    class CompetitionImpactFlag {
        <<ValueObject>>
        +boolean affectsCompetitionInProgress
        +string justification
        +UserId setBy
        +Instant setAt
    }
    class Priority {
        <<ValueObject>>
        +PriorityLevel level
        +boolean overridden
        +string overrideJustification
    }
    class CompetitionSubject {
        <<ValueObject>>
        +SubjectType type
        +string instanceIdOrLabel
    }
    class WorkNote {
        <<Entity>>
        +NoteVisibility visibility
        +string body
    }
    class PriorityCalculator {
        <<DomainService>>
        +derive(impact, urgency, matrix) Priority
    }
    class IncidentRepositoryPort {
        <<Port>>
        +nextReference() TicketReference
        +findById(id) Incident
        +save(incident) void
    }
    class SlaPolicyPort {
        <<Port>>
        +attachFor(snapshot) SlaCommitment
        +reevaluate(snapshot) SlaCommitment
        +pause(ticketId) void
        +resume(ticketId) void
    }
    class EventPublisherPort {
        <<Port>>
        +publish(events) void
    }

    Incident *-- TicketReference
    Incident *-- Priority
    Incident *-- CompetitionImpactFlag
    Incident *-- CompetitionSubject
    Incident *-- WorkNote
    Incident ..> PriorityCalculator
    IncidentRepositoryPort ..> Incident
```

| Element | Enforces | PRD |
|---|---|---|
| `TicketReference` generated by the repository port, immutable | unique, human-readable, never reused | FR-INC-02, NFR-DAT-01 |
| `PriorityCalculator` domain service over an injected, configurable matrix | Priority is **derived**, never chosen by a requester | FR-INC-04, R8 |
| `CompetitionImpactFlag` requires justification and actor, and is settable only through an agent-authorized use case | agent-only, justified, audited; raises assessed Impact which re-derives Priority | FR-INC-05 |
| `Priority.overridden` + mandatory justification | authorized override is explicit and auditable | FR-INC-04 |
| `Incident.transitionTo` validates against the configured state model | configurable allowed transitions | FR-INC-06, FR-WFL-01 |
| `resolve()` refuses without resolution code and notes | no resolution without a code | FR-INC-07 |
| `WorkNote.visibility` as a first-class value object | internal notes can never leak to requesters | FR-INC-11, NFR-SEC-04 |
| Every mutating method returns domain events | audit trail completeness by construction | FR-AUD-01 |

### 6.3 Backend composition root

`apps/api` is the only place where wiring happens. Per context, a NestJS module binds each port token to a concrete adapter:

- Ports are declared as TypeScript `interface` + a matching `Symbol` injection token exported from the domain lib.
- The context's NestJS module provides `{ provide: INCIDENT_REPOSITORY, useClass: TypeOrmIncidentRepository }` and equivalents.
- **Cross-context adapters live here**, not in either context's infrastructure lib (§5.4).
- Global providers: `ValidationPipe` with `whitelist`, `forbidNonWhitelisted` and `transform`; `nestjs-pino` logger; `nestjs-i18n`; exception filter mapping domain errors to contract error codes; `@nestjs/terminus` health at `/health/live` and `/health/ready` without the `/api` prefix; Swagger at `/api/docs` in development only.
- Persistence: TypeORM `synchronize: false` in every environment; migrations auto-run only when `NODE_ENV=development`, and through a controlled deploy step elsewhere.

---

## 7. Frontend — Angular Architecture

### 7.1 Library slicing and data flow

```mermaid
flowchart TB
    subgraph shell["apps/web - application shell, type:app"]
        BOOT["bootstrapApplication + provide functions<br/>provideRouter with lazy routes,<br/>provideHttpClient with withInterceptors,<br/>provideAnimations, Transloco providers,<br/>global ErrorHandler"]
        ITC["Functional interceptors<br/>1 jwtInterceptor - Bearer token<br/>2 localeInterceptor - Accept-Language<br/>3 httpErrorInterceptor - code to Transloco key"]
        GUARD["Route guards<br/>authGuard, roleGuard<br/>UX only - never the security boundary"]
    end

    subgraph ctx["libs/incident - frontend slice"]
        FEAT["type:feature<br/>IncidentListPage, IncidentDetailPage,<br/>LogIncidentPage, TriagePanel<br/>routed containers, Reactive Forms,<br/>orchestrate the store, own loading and error state"]
        UIL["type:ui<br/>PriorityBadge, SlaCountdown,<br/>StateChip, WorkNoteList,<br/>CompetitionSubjectPicker<br/>OnPush, signal inputs and outputs,<br/>zero injected services"]
        DA["type:data-access<br/>IncidentApiService - HttpClient<br/>IncidentStore - signal + computed<br/>exposes asReadonly signals,<br/>mutations through methods"]
    end

    subgraph shf["libs/shared"]
        CTRF["type:contracts<br/>LogIncidentRequest, IncidentDetailResponse,<br/>PriorityLevel, IncidentState, ErrorCode"]
        UTLF["type:util"]
        SUIF["type:ui - shared/ui<br/>Button, FormField, Dialog, Menu, Table,<br/>Tabs, Toast, Badge, Chip, design tokens,<br/>focusTrap directive, live announcer"]
    end

    API["apps/api - HTTPS JSON"]

    BOOT --> ITC
    BOOT --> GUARD
    BOOT -->|"lazy loadChildren"| FEAT
    FEAT --> UIL
    FEAT --> DA
    FEAT --> CTRF
    DA --> CTRF
    DA --> UTLF
    UIL --> UTLF
    BOOT --> SUIF
    FEAT --> SUIF
    UIL --> SUIF
    SUIF --> UTLF
    DA -->|"typed HttpClient calls"| ITC
    ITC --> API

    classDef app fill:#1f6feb,stroke:#0b3d91,color:#ffffff
    classDef ui fill:#0e7c66,stroke:#064e40,color:#ffffff
    classDef shd fill:#6f42c1,stroke:#432874,color:#ffffff
    class BOOT,ITC,GUARD,FEAT app
    class UIL,DA,SUIF ui
    class CTRF,UTLF shd
```

### 7.2 Frontend rules that follow from the architecture

| Rule | Consequence |
|---|---|
| **`data-access` is the only outbound edge.** | Nothing but a `data-access` lib may inject `HttpClient`. Feature and UI libs never touch the network. The boundary matrix enforces it: `type:ui` cannot depend on `type:data-access` at all. |
| **`ui` libs are pure functions of their inputs.** | Signal `input()` / `output()`, `ChangeDetectionStrategy.OnPush`, no injected service, no store. They can depend only on other `type:ui` and `type:util`. |
| **The design system is shared; domain vocabulary is not.** | `libs/shared/ui` (`platform:frontend`, `scope:shared`, `type:ui`) holds the domain-agnostic primitives every context reuses — button, form field, dialog/overlay, menu, table, tabs, toast, badge, chip — plus the SCSS design-token layer and the a11y primitives. A component that names an ITSM concept (`PriorityBadge`, `SlaCountdown`, `StateChip`, `WorkNoteList`, `CompetitionSubjectPicker`) belongs to its context's own `type:ui` lib, which composes the shared primitives — never the reverse (ADR-010). |
| **`feature` libs orchestrate.** | They read `computed()` selectors from the store, drive Reactive Forms, and render explicit **loading / error / empty** states. No `type:feature` lib may reach into another context's `data-access`. |
| **Cross-context UI composition happens in `apps/web`.** | An agent workspace page that shows Incident data next to SLA countdown and Approval status is assembled by the shell, or by a feature lib consuming only contracts — never by cross-context deep imports. |
| **State lives in signals.** | Injectable store services expose `signal(...).asReadonly()` and `computed()`. RxJS appears only for genuine streams, bridged with `toSignal()`. No NgRx. |
| **Contracts are the single typing authority.** | `IncidentApiService` methods are typed exclusively with `libs/shared/contracts`. A backend contract change breaks the frontend build at compile time — that is the intended coupling. |
| **The client holds no security decision.** | `roleGuard` hides routes for usability; every authorization decision is re-taken server-side (NFR-SEC-02). Internal work notes are filtered by the **API**, never by an `@if` in a template (NFR-SEC-04). |
| **No hardcoded strings.** | Transloco keys everywhere; the locale interceptor propagates the same locale to the API so server messages match the UI. |
| **Accessibility is structural.** | There is no third-party component library and therefore no CDK a11y helper: the hand-written focus-trap/restore directive and the `aria-live` announcer service live in `libs/shared/ui`, next to the in-house components, so WCAG 2.1 AA behavior is reused rather than reimplemented per screen (NFR-USE-03). |

### 7.3 Surfaces

| Surface | Personas | Libraries involved |
|---|---|---|
| **Self-Service Portal** | Player, Team Manager, Organizer, Referee, League Admin | `knowledge/feature` (search first, deflection), `incident/feature` (submit, track, confirm or reject resolution), `service-catalog/feature` + `service-request/feature`, `approval/feature` for approvers |
| **Agent Workspace** | Agent L1, Analyst L2/L3 | `incident/feature` (prioritized work list FR-QUE-02, triage, competition-impact flag with justification, work notes), `service-request/feature`, `knowledge/feature`, `sla` surfaced through `incident/ui` SLA countdown |
| **Management surface** | Service Owner, Group Manager | `reporting/feature` operational and management dashboards (FR-RPT-01/02/05) |
| **Admin Console** | System Administrator | `service-catalog/feature`, `identity-access/feature`, plus configuration screens for taxonomy, Impact x Urgency matrix, SLA policies, workflows and notification templates (NFR-CFG-01) |

---

## 8. End-to-End Flow Across Both Platforms

The MVP acceptance scenario (PRD §14.3): a Referee logs an Incident from the portal; an Agent triages it, flags competition impact with justification, the matrix yields P1, and the SLA targets are recalculated from the original creation time.

```mermaid
sequenceDiagram
    autonumber
    actor REF as Referee - browser
    participant WF as incident/feature<br/>LogIncidentPage
    participant WD as incident/data-access<br/>IncidentApiService + Store
    participant ITC as apps/web<br/>jwt + locale interceptors
    participant CTL as apps/api<br/>IncidentController
    participant UC as incident/application<br/>LogIncidentUseCase
    participant DOM as incident/domain<br/>Incident aggregate
    participant REPO as incident/infrastructure<br/>TypeOrmIncidentRepository
    participant SLAA as apps/api<br/>SlaPolicyAdapter
    participant SLAU as sla/application
    participant BUS as apps/api<br/>InProcessEventPublisher
    participant AUD as audit/application
    participant NOT as notification/application
    actor AG as Agent L1 - browser

    REF->>WF: submit Reactive Form - description,<br/>affected service, affected subject
    WF->>WD: logIncident(LogIncidentRequest from contracts)
    WD->>ITC: POST /api/incidents
    ITC->>CTL: request + Bearer JWT + Accept-Language
    CTL->>CTL: ValidationPipe validates DTO<br/>whitelist and forbidNonWhitelisted
    CTL->>UC: execute(command)
    UC->>UC: authorize actor - requester may log own Incident
    UC->>REPO: nextReference()
    REPO-->>UC: TicketReference
    UC->>DOM: Incident.log(...)
    DOM->>DOM: derive Priority from Impact x Urgency matrix<br/>competition flag NOT set - requester cannot set it
    DOM-->>UC: Incident + IncidentLogged event
    UC->>SLAA: attachFor(ticketSnapshot)
    SLAA->>SLAU: resolve applicable SLA policy
    SLAU-->>SLAA: SlaCommitment - response and resolution targets
    SLAA-->>UC: SlaCommitment
    UC->>REPO: save(incident) - single transaction
    UC->>BUS: publish(events) - after commit
    BUS->>AUD: append AuditEntry - actor, action, before, after
    BUS->>NOT: acknowledgment with reference number
    UC-->>CTL: IncidentDetailResponse from contracts
    CTL-->>ITC: 201 Created
    ITC-->>WD: typed response
    WD->>WD: update signal store
    WD-->>WF: computed signals refresh view
    WF-->>REF: reference number shown, portal tracks status

    Note over AG,DOM: Triage - agent-only path
    AG->>CTL: PATCH /api/incidents/:id/competition-impact<br/>flag true + mandatory justification
    CTL->>UC: SetCompetitionInProgressFlagUseCase
    UC->>UC: authorize - Agent role required
    UC->>DOM: flagCompetitionInProgress(justification)
    DOM->>DOM: raise assessed Impact,<br/>re-derive Priority - result P1
    DOM-->>UC: PriorityChanged + CompetitionImpactFlagged events
    UC->>SLAA: reevaluate(ticketSnapshot)
    SLAA->>SLAU: recompute targets from ORIGINAL creation time,<br/>preserve previous targets
    SLAU-->>SLAA: new SlaCommitment
    UC->>REPO: save(incident)
    UC->>BUS: publish(events)
    BUS->>AUD: append flag change, priority change,<br/>previous and new SLA targets
    BUS->>NOT: notify resolver group and requester
    CTL-->>AG: 200 OK - P1, new SLA countdown
```

**Traceability of this flow:** FR-INC-01 (capture), FR-INC-02 (reference), FR-INC-04 (matrix-derived Priority), FR-INC-05 (agent-only justified flag), FR-SLA-02 (policy attached at creation), FR-SLA-04 (recalculation from original creation time, previous targets preserved), FR-NOT-01 (acknowledgment), FR-AUD-01/02 (immutable entries with previous and new values).

**Three structural facts visible in the diagram:**

1. The **requester can never set a priority-bearing field** — the flag has its own endpoint, its own use case and its own authorization check (FR-INC-01, R8).
2. **`incident` never imports `sla`.** The `SlaPolicyAdapter` in `apps/api` is the only object that knows both.
3. **Audit and notification happen after commit, off the event bus.** A failing email gateway cannot roll back a logged Incident (NFR-AVL-03), and no context is ever handed a mutable reference to audit data (FR-AUD-03).

---

## 9. Cross-Cutting Architecture

| Concern | Structural placement |
|---|---|
| **Authentication** | Passport JWT strategy + guards in `apps/api`; `IdentityProviderPort` in `identity-access/domain` with a local-credential adapter now and an SSO adapter later (FR-IAM-04). |
| **Authorization** | Enforced in `type:application` use cases, expressed in domain terms (`actor may triage`, `requester may view own ticket`), not as controller decorators alone. Ownership and competition-scoped visibility rules (FR-IAM-03, FR-KNW-09) are domain predicates, testable without HTTP. |
| **Audit trail** | Append-only `audit` context fed exclusively by domain events. No update or delete method exists on `AuditRepositoryPort` — immutability by absence of capability, not by convention (FR-AUD-03). |
| **Configuration as data** | Taxonomy, Impact x Urgency matrix, SLA policies, state models, approval chains and notification templates are persisted aggregates owned by their contexts and edited through the Admin Console. In-flight records keep the configuration version they were created under (NFR-CFG-02). |
| **Domain events** | `DomainEvent` base type in `shared/domain`; `EventPublisherPort` in each context's domain; a single in-process dispatcher in `apps/api`. No broker in the MVP; the port makes an out-of-process broker a later adapter swap, not a redesign. |
| **Time** | `ClockPort` in `shared/domain`. Domain and application layers never call `new Date()`. This is what makes SLA pause/resume and business-hours schedules unit-testable and NFR-AVL-05 provable. |
| **i18n** | Transloco (client) + `nestjs-i18n` (API) joined by the `Accept-Language` header. Reference data carries stable identifiers with translatable labels (NFR-I18N-05). |
| **Observability** | `nestjs-pino` structured logs with request correlation; `@nestjs/terminus` liveness and readiness probes (NFR-CFG-03). |
| **Testing** | Domain and application: Jest unit tests with no infrastructure at all — the purity rule is what makes this possible. Infrastructure: integration tests against PostgreSQL. Acceptance: Cypress 15 + Cucumber in `apps/api-e2e` and `apps/web-e2e`, with Gherkin scenarios traced to PRD acceptance criteria. Coverage floor 80% on changed libs. |

---

## 10. Key Structural Decisions

Each decision below should be promoted to a file under `docs/adr/` when scaffolding starts.

### ADR-001 — Four generic supporting contexts for cross-cutting capabilities

**Context.** The PRD defines cross-cutting capabilities C15 Approval, C16 Notification, C17 Reporting and C18 Audit that no single baseline context owns. Placing them in `shared` would create a god shared kernel; duplicating them per context would violate DRY and make FR-AUD-03 unenforceable.
**Decision.** Introduce `approval`, `notification`, `audit` and `reporting` as **generic supporting bounded contexts** with the same tag scheme and boundary rules as capability contexts. C11 Omnichannel Intake and C12 Workflow get **no** context: intake is an adapter concern, workflow is configurable data interpreted by each context's own state model.
**Consequences.** Four extra contexts to scaffold; the baseline context list in the architecture skill is extended and must be updated. In exchange, audit immutability and notification isolation become structural properties rather than review-time discipline. A central workflow engine is explicitly rejected as a god-context risk.

### ADR-002 — `type:app` and `type:e2e` added to the type axis

**Context.** The tag scheme's `type:` axis covers libraries only, but `apps/api`, `apps/web` and the two E2E projects must also carry three tags, and `apps/api` legitimately needs to depend on multiple contexts to act as the composition root.
**Decision.** Add `type:app` (may depend on any type within its platform plus shared; tagged `scope:shared`) and `type:e2e` (may depend only on contracts and util). No library type may depend on `type:app`.
**Consequences.** The composition root gains a legal, explicit privilege instead of an ad-hoc exception. The privilege is narrow: only two projects carry `type:app`, and the ban on libraries depending on apps prevents the escape hatch from spreading.

### ADR-003 — Cross-context collaboration through ports resolved at the composition root

**Context.** The scope rule forbids `scope:incident` from importing `scope:sla`, yet Incident needs SLA, Approval, Notification and Audit collaboration.
**Decision.** The consuming context declares an outbound port in **its own** domain language; the composition root provides an adapter that delegates to the supplying context's application layer. Asynchronous collaborations use domain events dispatched in-process. No context-to-context import ever exists in the Nx graph.
**Consequences.** Contexts remain independently testable and extractable. The cost is one adapter class per collaboration in `apps/api`, and a composition root that grows with the number of collaborations — an acceptable, visible and reviewable concentration of coupling.

### ADR-004 — Modular monolith, not microservices

**Context.** Fifteen bounded contexts could suggest a distributed topology. Delivery capacity is academic/portfolio scale (K8) and the MVP must be demonstrable end to end (PRD §14.3).
**Decision.** One NestJS process, one PostgreSQL database, one Angular client. Contexts are enforced logically by Nx boundaries, not physically by network hops.
**Consequences.** Single-transaction consistency across the ticket-plus-SLA write path; no distributed-transaction complexity; drastically lower operational cost. The boundary discipline is what preserves the option to extract a context later. Scaling is horizontal on stateless API instances, which is why migrations must not auto-run at startup outside development.

### ADR-005 — Separate persistence entities from domain aggregates

**Context.** TypeORM entity decorators in the domain would violate the purity rule and let schema shape dictate the model.
**Decision.** `type:domain` holds framework-free aggregates; `type:infrastructure` holds TypeORM entities plus explicit mappers.
**Consequences.** Mapping code to write and maintain. In exchange the domain is testable with zero infrastructure, `synchronize: false` plus migrations-only stays safe, and the ORM can be replaced without touching business logic.

### ADR-006 — No competition calendar, no live windows, no freeze windows

**Context.** `readme.md` §1.2 describes event-aware SLA policies, change calendars around competition windows and live-window prioritization. The approved PRD removes all of it (§3.3, K5, FR-CHG-07 retired).
**Decision.** No calendar model, no time-based SLA modulation, no deployment-prohibition engine is designed or built. Competition impact is a single agent-set boolean with mandatory justification on the ticket, raising assessed Impact inside the configurable Impact x Urgency matrix.
**Consequences.** Substantially simpler SLA and Change models, and no dependency on SCMS calendar data — which also removes the schedule-integration risk. Prioritization quality now rests on agent judgment, mitigated by mandatory justification, full audit and the flag-usage-share KPI (A1, R8).

### ADR-007 — Contracts are the only FE/BE coupling

**Context.** Frontend and backend evolve together and must not drift.
**Decision.** `libs/shared/contracts` holds types only — DTO shapes, enums and error codes. No logic, no framework, no validation decorators. Both platforms import it; neither imports the other.
**Consequences.** A breaking API change fails the frontend build immediately, which is the intended safety property. Backend `class-validator` decorators live on API-side DTO classes that structurally implement the contract types, keeping validation out of the shared lib.

### ADR-008 — Audit and notification are event-driven and post-commit

**Context.** NFR-AVL-03 requires intake to survive degraded optional subsystems; FR-AUD-01 requires complete history.
**Decision.** Mutating domain operations return domain events; the use case commits the aggregate, then publishes. Audit, notification and reporting projections are subscribers.
**Consequences.** A notification outage cannot block a ticket. The trade-off is that the audit write is not in the ticket transaction; the mitigation is an in-process, same-database dispatcher with retry, and audit completeness assertions in acceptance tests.

### ADR-009 — Time is a port

**Context.** SLA timers must be accurate across restarts and time-zone correct (NFR-AVL-05, NFR-I18N-03).
**Decision.** `ClockPort` in `shared/domain`; no `new Date()` in domain or application code. Timer state is derived from persisted UTC timestamps, never from in-memory counters or scheduled-job liveness.
**Consequences.** SLA behavior becomes deterministically testable, and a process restart cannot lose or double-count elapsed time.

### ADR-010 — `libs/shared/ui` is the in-house design system, tagged `platform:frontend` + `scope:shared`

**Context.** With no third-party component library, every visual primitive — button, form field, dialog/overlay, menu, table, tabs, toast, badge, chip — plus the theming tokens and the WCAG 2.1 AA behaviors (focus trap/restore, `aria-live` announcements) must be hand-built. Duplicating them in each context's `type:ui` lib would violate DRY and make NFR-USE-03 unverifiable; placing them in `shared/domain` or `shared/util` would put Angular inside framework-free libraries. The shared kernel baseline (`contracts`, `domain`, `util`) is `platform:shared`, which an Angular library cannot be.
**Decision.** Add `libs/shared/ui` to the shared kernel as a fourth shared library, tagged **`platform:frontend`, `scope:shared`, `type:ui`**. It holds domain-agnostic presentational components, the SCSS design-token layer and the a11y primitives (focus-trap/restore directive, `aria-live` announcer). It is state in, events out: no injected service, no store, no `HttpClient`, no I/O, and no dependency beyond `scope:shared` `type:util` — not even `type:contracts`, per its `type:ui` row (§5.3). Domain-aware presentational components stay in each context's own `type:ui` lib. `platform:shared` remains reserved for framework-free code both platforms import.
**Consequences.** The `scope:shared` group is no longer uniformly `platform:shared`, so the platform tag must be read per project — which is precisely why this is recorded rather than assumed. In exchange the design system is written once, no boundary exception is needed (`feature → ui`, `ui → ui`, `app → ui` and the scope rule already permit every legal edge, while the platform rule keeps the backend out), and accessibility behavior is reused instead of reimplemented per screen.

---

## 11. Out of Scope for the MVP

### 11.1 Contexts not scaffolded in phase 1

`problem`, `change`, `release` and `asset-config` are **phase 2** (PRD §14.4) and must not be generated in phase 1. They appear in the context map so that phase-1 designs do not foreclose them — specifically, the `incident` aggregate reserves link semantics for Problem, Change, Release and Configuration Item (FR-INC-10) as opaque identifiers, so adding those contexts later requires no change to the Incident model.

### 11.2 Capabilities excluded from the MVP

Per PRD §14.3, out of the MVP: Problem, Change, Release and CMDB management; email-to-ticket intake; skill-based assignment; approval delegation; deflection measurement; CSAT automation beyond basic capture.

### 11.3 Architectural mechanisms deliberately not built

| Not built | Reason | Replacement, and how it stays reversible |
|---|---|---|
| Message broker / queue | Single process, single database (ADR-004) | In-process `EventPublisherPort` dispatcher — a broker becomes a new adapter, not a redesign |
| CQRS with a separate read store | Premature for MVP volumes | `reporting` reads projections from the same database behind its own ports |
| Event sourcing | Not required; the audit trail already satisfies reconstructability (NFR-AUD-01) | State-stored aggregates plus an append-only audit log |
| Competition calendar service, live-window engine, freeze-window engine | Out of scope (ADR-006, PRD §3.3) | Agent-set competition-impact flag only |
| Public / anonymous surface, spectator persona, public Knowledge Base | Out of scope (FR-IAM-01, FR-KNW-03, PRD §3.3) | Every route is behind authentication; article visibility is an entitlement filter applied server-side |
| Multi-tenancy | Single-tenant MVP (K7) | No tenant discriminator in the MVP schema; introducing one later is a migration plus a repository-level filter, confined to `type:infrastructure` |
| NgRx or any external state library | Signals suffice (frontend standard) | Injectable signal stores in `type:data-access` |
| Server-side rendering | Authenticated internal application; no SEO driver | Client-side Angular with lazy routes |

---

## 12. Verification and Governance

### 12.1 How these rules are checked

| Check | Command | Enforces |
|---|---|---|
| Module boundaries and lint | `pnpm nx lint <project>` | §5.3 type matrix, scope rule, platform rule |
| Dependency graph inspection | `pnpm nx graph` | Absence of context-to-context edges; §5.4 |
| Changed-only gate | `pnpm nx affected -t lint test build` | CI enforcement on every change |
| Unit tests without infrastructure | `pnpm nx test <context>-domain` | Domain purity — a domain test that needs a database proves a violation |
| Acceptance | `pnpm nx e2e api-e2e` / `pnpm nx e2e web-e2e` | PRD acceptance criteria as Gherkin |

### 12.2 Architectural review checklist for any new library

1. Does it carry all three tags, generated by an Nx generator?
2. Is its `type:` the narrowest that fits?
3. If `type:domain` or `type:application`: does it import any framework, ORM, HTTP client or `new Date()`? If yes, reject.
4. Does it introduce a `scope:<context>` → `scope:<other-context>` edge? If yes, invert it into a port resolved at the composition root (ADR-003).
5. Does it add logic to `shared/contracts`? If yes, reject (ADR-007).
6. Does it grow `shared/domain` beyond primitives genuinely used by three or more contexts? If yes, push it down into the owning context.
7. Is it a presentational component library? Domain-agnostic primitives belong in `libs/shared/ui` (`platform:frontend`, `scope:shared`, `type:ui`, ADR-010); anything that names an ITSM concept belongs in its context's own `type:ui` lib.
8. Does it warrant an ADR — new context, tag-scheme change, new cross-context integration, new external dependency?

### 12.3 Current verification status

**None of the checks in §12.1 have been executed, because no Nx workspace, no `package.json` and no project code exist in this repository.** This document is the specification those checks will be run against once scaffolding begins. The first scaffolding task is to create the workspace, `libs/shared/*` and the `incident` hexagon per §5.5, then run `pnpm nx lint` and `pnpm nx graph` and report the result truthfully.
