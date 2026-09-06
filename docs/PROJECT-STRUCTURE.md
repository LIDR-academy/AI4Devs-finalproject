# Sport ITSM - Project Structure

> Companion to [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`COMPONENTS.md`](COMPONENTS.md), and to section **2.3. Descripción de alto nivel del proyecto y estructura de ficheros** of [`../readme.md`](../readme.md). The architecture diagrams and the rationale for the patterns live in readme §2.1; the responsibility and technology of each component live in readme §2.2 and `COMPONENTS.md`; the full C4 model, context map, tactical model, sequences and ADRs live in `ARCHITECTURE.md`. This document describes **where things live on disk and why**.

## 1. High-level description of the repository

Sport ITSM is delivered as a **single Nx 21.6 monorepo**, managed with **pnpm** as the only package manager, holding the whole system: the NestJS **API** (`apps/api`), the Angular **Web Client** (`apps/web`), their two Cypress + Cucumber acceptance suites, and every bounded-context library under `libs/`. It is a **modular monolith**: one deployable API process, one deployable web client and one PostgreSQL system of record, with the modularity enforced logically by the workspace structure rather than physically by network hops.

The layout is a direct projection of the architecture. Each ITSM capability is a **bounded context** with its own folder under `libs/`, and inside that folder the **hexagonal layers** are separate Nx libraries: `domain` (pure model and ports), `application` (use cases), `infrastructure` (outbound adapters) on the backend side, and `feature` / `ui` / `data-access` on the frontend side. `libs/shared/` holds the shared kernel, the typed contracts that are the only permitted coupling between the two platforms, and `libs/shared/ui`, the in-house design system reused by every context. In this repository the **folder structure *is* the architecture**: a file's path determines the tags of the project it belongs to, and those tags determine what it is allowed to import.

## 2. Directory tree

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
│  │  │  ├─ styles.scss                         # global SCSS design tokens + base theme
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
│  │  ├─ ui/                         # platform:frontend scope:shared type:ui - in-house design system (ADR-010)
│  │  │  └─ src/lib/{button/,form-field/,dialog/,menu/,table/,tabs/,toast/,badge/,chip/,a11y/{focus-trap.directive.ts,live-announcer.service.ts},styles/_tokens.scss}
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
│  │  │        │  ├─ work-note.ts                # domain entity (NOT *.entity.ts - see §4)
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
│  ├─ ARCHITECTURE.md                # target architecture: C4, context map, hexagon, ADR-001..010
│  ├─ COMPONENTS.md                  # main components (companion to readme §2.2)
│  ├─ PROJECT-STRUCTURE.md           # this document (companion to readme §2.3)
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
├─ readme.md                         # the delivery document
└─ prompts.md
```

## 3. Purpose of each main folder

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
| `libs/shared/ui` | The in-house **design system**: domain-agnostic presentational components reusable by any context (button, form field, dialog/overlay, menu, table, tabs, toast, badge, chip), the SCSS design-token layer and the hand-written accessibility primitives (focus-trap/restore directive, `aria-live` announcer). Angular code with a shared scope, therefore tagged `platform:frontend scope:shared type:ui`, not `platform:shared` (ADR-010). It injects no service and performs no I/O. |
| `libs/shared/util` | Pure, dependency-free helpers. |
| `docs/` | Engineering documentation: PRD, architecture, components, this structure document, and `docs/adr/` for Architecture Decision Records. |
| `openspec/` | The canonical source of **product behavior** — capability specs and in-flight change proposals with their spec deltas. Never architecture, never stack. |
| `.claude/` | The AI operating model: **agents** (Product Owner, Software Architect) and **skills** (architecture, backend, frontend, engineering principles, ITSM domain, documentation standard). |

## 4. Naming and file conventions

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

## 5. The pattern the structure obeys

The tree is not an arbitrary organization: it is the **Nx monorepo + DDD bounded contexts + Hexagonal layering** triple, made mechanical.

1. **The first level under `libs/` is a bounded context.** Each ITSM capability owns a folder and a ubiquitous language. Nothing cross-cutting is allowed to live above it except the deliberately minimal `libs/shared/`.
2. **The second level is a hexagonal layer.** `domain` / `application` / `infrastructure` are the backend hexagon; `feature` / `ui` / `data-access` are the frontend slice. A file's layer is therefore visible from its path, and so is the set of imports it is permitted.
3. **Every project carries three tags** — `platform:` (`backend` / `frontend` / `shared`), `scope:` (`<context>` / `shared`) and `type:` (`domain`, `application`, `infrastructure`, `feature`, `ui`, `data-access`, `contracts`, `util`, plus `app` and `e2e` for the four applications, ADR-002). Libraries are created only with Nx generators and explicit `--tags`, so structure and tags never drift. The one nuance worth memorizing: `libs/shared/ui` is `platform:frontend`, not `platform:shared` — a shared *scope* never implies a shared *platform* (ADR-010).
4. **`@nx/enforce-module-boundaries` in `eslint.config.mjs` turns the three axes into build-time rules.** The `type:` matrix implements the inward-only dependency rule (`infrastructure → application → domain`, never the reverse); the `scope:` rule implements context isolation (a context may depend only on itself and `scope:shared`); the `platform:` rule keeps frontend and backend from ever importing each other. An illegal import fails `pnpm nx lint`.
5. **`apps/api` is the only escape hatch, and it is a designed one.** Tagged `scope:shared`, `type:app`, it is the composition root: the single place that sees more than one context, because that is where a context's outbound port is bound to an adapter delegating to another context's application layer (ADR-003). No library may depend on an app, so the privilege cannot spread.

The consequence worth stating plainly: **in this repository the folder structure is the architecture.** Moving a file to a different folder changes what it is allowed to depend on, and the linter — not a reviewer — decides whether that is legal.

## 6. Documentation, specification and agent folders

- **`openspec/`** is the canonical source of **product behavior**. `openspec/specs/<capability>/spec.md` holds the current agreed behavior per ITSM capability; `openspec/changes/<change-id>/` holds in-flight proposals with `proposal.md`, `tasks.md`, an optional `design.md` (the only place where stack detail is allowed) and spec deltas marked `## ADDED / MODIFIED / REMOVED Requirements`. Specs are technology-agnostic; the workflow is `propose → implement → archive`.
- **`docs/`** is the engineering counterpart: the PRD, the architecture document, the component reference, this structure document, and `docs/adr/` where the structural decisions currently embedded in `ARCHITECTURE.md` §10 are promoted to individual ADR files once scaffolding starts.
- **`.claude/`** holds the AI operating model: **agents** (`sport-itsm-product-owner`, `sport-itsm-architect`) are roles, and **skills** are the layered, reusable guardrails they consume — business (`service-desk-expert`), system (`sport-itsm-architecture`), craft (`sport-itsm-engineering-principles`), stack (`sport-itsm-backend`, `sport-itsm-frontend`) and documentation (`feature-docs`). `CLAUDE.md` at the root is the entry point that ties them together.

## 7. Governance commands

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

> **Status:** as in readme §2.1 and §2.2, this is the **target structure**. The repository currently contains only `docs/`, `.claude/`, `CLAUDE.md`, `readme.md` and `prompts.md`; there is no Nx workspace, no `package.json`, no `apps/`, no `libs/` and no `openspec/` directory yet. Every path above is prescriptive design intent that scaffolding must produce, and none of the boundary rules has been verified with `pnpm nx lint` / `pnpm nx graph`.
