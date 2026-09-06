# CLAUDE.md

> **Purpose:** Operational context for Claude Code working in this repository — how to orient, where things live, and how to work. This file is **not** a functional-requirements document; product behavior and requirements live in the specifications (see section 4).

---

## 1. Product

Sport ITSM is an IT Service Management (ITSM) platform that supports the Sports Competition Management System (SCMS). It centralizes Incident, Service Request, Problem, Change, Release, and Asset & Configuration management for the SCMS platform, under SLAs and full traceability.
Scope is the **SCMS platform** (its defects, entitled services, Changes, Releases, and CMDB) — **not** the sporting operation itself; in-application sport decisions (reschedules, rosters, result disputes) are out of scope. Competition entities (Tournament, Match, Standings…) are the **affected subject** of a ticket, never tickets in their own right.

---

## 2. Technology Stack

Sport ITSM is a single Nx monorepo hosting a NestJS API and an Angular web client that integrate **only** through shared typed contracts (`libs/shared/contracts`). Versions below are **pinned** — do not bump majors without an approved change.

### Backend

| Concern | Technology |
|---|---|
| Runtime | **Node.js 20 LTS** |
| Framework | **NestJS 11** on **Express 4** (pin intentional) |
| Language | **TypeScript 5.9** (strict) |
| Database / ORM | **PostgreSQL 16** + **TypeORM 0.3** (`pg` driver); `synchronize` always `false`, schema changes via **migrations** only |
| Auth | **Passport JWT** (`passport-jwt`, `@nestjs/jwt`), **bcrypt** hashing; `@LicenseFeature()` license gating |
| Validation / Config | `class-validator` + `class-transformer` (global `ValidationPipe`); `@nestjs/config` (validated schema, no raw `process.env`) |
| i18n | **nestjs-i18n 10** (driven by `Accept-Language`) |
| Observability | **@nestjs/terminus** health (`/health/live`, `/health/ready`), `@nestjs/swagger` (`/api/docs`, dev only), **nestjs-pino** structured logging |
| Testing | **Jest 29** + `ts-jest`; **Cypress 15** API E2E; **Cucumber/Gherkin** (`@badeball/cypress-cucumber-preprocessor`) |

Authoritative source: **`sport-itsm-backend`** skill.

### Frontend

| Concern | Technology |
|---|---|
| Framework | **Angular 20.3** — standalone components, **signals**, built-in control flow |
| Language | **TypeScript 5.9** (strict); **RxJS 7.8** used sparingly (signals-first) |
| UI | **In-house components** — no third-party component library; plain HTML templates + **SCSS** with design tokens, hand-written a11y (native semantics + ARIA); **FullCalendar 6** (scheduling), **Leaflet** (venue maps) |
| State / Data | Angular **Signals** (local + shared via services); **Reactive Forms**; **HttpClient** with functional interceptors |
| i18n | **Transloco** (UI strings); locale interceptor sets `Accept-Language` |
| Testing | **Jest** + `jest-preset-angular`; **Cypress 15** + Cucumber E2E |

Authoritative source: **`sport-itsm-frontend`** skill.

### Shared / Monorepo

**Nx 21.6** orchestration and generators, **pnpm** (the only supported package manager), **TypeScript 5.9** strict across both platforms. Linting/formatting shared: **ESLint 9** flat config (with `@nx/enforce-module-boundaries`) + **Prettier 3** (single quotes, semicolons).

---

## 3. Code Conventions, Folder Structure, Commands & Style Rules

The architecture is **DDD + Hexagonal on Nx**, governed by the `sport-itsm-architecture` skill (the authoritative source for contexts, layers, tags, and the module-boundary matrix). This section is the operational summary; the skills own the depth.

### Build / Test / Lint commands

All commands run through **pnpm + Nx**. Backend project is `api` (E2E `api-e2e`); frontend project is `web` (E2E `web-e2e`); libraries are targeted by their Nx name.

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Serve backend / frontend (dev) | `pnpm nx serve api` / `pnpm nx serve web` |
| Build | `pnpm nx build api` / `pnpm nx build web` |
| Unit/component tests | `pnpm nx test <project>` |
| Lint (runs boundary checks) | `pnpm nx lint <project>` |
| E2E | `pnpm nx e2e api-e2e` / `pnpm nx e2e web-e2e` |
| Changed-only checks | `pnpm nx affected -t lint test build` |
| Dependency graph | `pnpm nx graph` |

TypeORM migrations (data source at `apps/api/src/data-source.ts`):
- Generate: `pnpm typeorm migration:generate -d apps/api/src/data-source.ts <path/Name>`
- Run: `pnpm typeorm migration:run -d apps/api/src/data-source.ts`
- Revert: `pnpm typeorm migration:revert -d apps/api/src/data-source.ts`

### Folder structure

```
apps/
  api/  api-e2e/          # NestJS composition root (inbound HTTP adapter + wiring) + API E2E
  web/  web-e2e/          # Angular shell (routing, providers) + web E2E
libs/
  <context>/              # one bounded context per ITSM capability
    domain/               # pure domain model + ports        (type:domain)
    application/          # use cases (backend)               (type:application)
    infrastructure/       # outbound adapters: TypeORM, gateways (type:infrastructure)
    feature/              # Angular feature libs              (type:feature)
    ui/                   # presentational components         (type:ui)
    data-access/          # HttpClient + signals state        (type:data-access)
  shared/
    contracts/            # DTOs/API types shared FE+BE        (type:contracts)
    domain/               # shared kernel primitives          (type:domain)
    ui/                   # shared design system (FE)         (type:ui)
    util/                 # pure helpers                      (type:util)
```

Baseline contexts: `incident`, `service-request`, `problem`, `change`, `release`, `asset-config`, `sla`, `service-catalog`, `knowledge`, `identity-access`, plus `shared`. Generate only the libs a context actually uses, always via Nx generators. Every project is tagged on **three axes** — `platform:` (`backend`/`frontend`/`shared`), `scope:` (`<context>`/`shared`), `type:` (from the list above) — enforced by `@nx/enforce-module-boundaries`. Cross-project imports go through each lib's `index.ts` barrel; dependencies point **inward only** and cross-context/FE-BE sharing goes exclusively through `shared/contracts`; cross-context UI reuse goes through `libs/shared/ui`, the in-house design system, tagged `platform:frontend`, `scope:shared`, `type:ui` (a shared *scope* does not imply a `platform:shared` *tag*).

### Style rules

- **Formatting:** Prettier 3 (single quotes, semicolons) — formatting is Prettier's job; never hand-format or add stylistic ESLint rules that conflict with it.
- **Linting:** ESLint 9 flat config (`eslint.config.mjs`) with module boundaries + `angular-eslint` on the frontend.
- **Backend idioms:** constructor-based DI, ports bound to adapters via injection tokens; thin controllers (HTTP only, no business logic); validated DTOs everywhere; `ConfigService` over `process.env`; pino over `console.log`.
- **Frontend idioms:** standalone components + `provide*`; `inject()` over constructor DI; signals for state, `computed()`/sparing `effect()`; `OnPush` on every component; control flow (`@if`/`@for` with `track`/`@switch`); Reactive Forms; functional HTTP interceptors. Visual components are **hand-built** — plain HTML templates + component-scoped SCSS in `libs/shared/ui` and the per-context `type:ui` libs, themed through centralized SCSS design tokens (CSS custom properties), with accessibility written by hand (native semantics first, then ARIA roles/states, keyboard handling, focus management, `aria-live`) to WCAG 2.1 AA.
- **Craft:** SOLID + clean-code universals (DRY/KISS/YAGNI, small functions, guard clauses, immutability, typed errors, ubiquitous-language naming) per `sport-itsm-engineering-principles`.

### What NOT to do

- **Do NOT** import frameworks/ORM/HTTP/I/O into `type:domain` or `type:application`, or let domain/application depend on adapters — dependencies point inward only.
- **Do NOT** cross bounded contexts or FE↔BE by deep-import — go through `contracts`/`shared`/domain events; never deep-import past a lib's barrel.
- **Do NOT** create a project without the three tags, or disable/relax `@nx/enforce-module-boundaries` to make a bad dependency compile — fix the design.
- **Do NOT** introduce a second package manager (`npm`/`yarn` lockfiles) or bump pinned majors without an approved change.
- **Backend:** no `synchronize: true`; no unconditional migration auto-run in staging/prod (gate to development); no raw `process.env` in feature code; no unvalidated/`any` request bodies; no `console.log`; no `/api` prefix on health endpoints and no Swagger outside dev; no hardcoded user-facing strings (route via `nestjs-i18n`).
- **Frontend:** no `NgModule`s; no legacy `*ngIf`/`*ngFor`/`*ngSwitch`; no `[(ngModel)]` with mutable objects; no class-based `HTTP_INTERCEPTORS`; no components without `OnPush`; no swallowed HTTP errors or undefined loading/error states; no hardcoded UI strings (use Transloco); no NgRx without an approved change; no injected service, store or `HttpClient` in a `type:ui` lib; no domain-aware component in `libs/shared/ui` (context vocabulary lives in that context's own `type:ui` lib).
- **Frontend — no third-party component library.** Do **NOT** introduce Angular Material, Angular CDK, PrimeNG, Nebular, Bootstrap components, Tailwind UI kits or any equivalent without an approved change. Every visual component is hand-built in `libs/shared/ui` or a per-context `type:ui` lib with a plain HTML template + SCSS; `FullCalendar` (scheduling) and `Leaflet` (maps) are domain-specific libraries, not a generic component library, and remain allowed. Do **NOT** reach for `::ng-deep` or hardcoded colors/spacing — style through the centralized design tokens.

---

## 4. Specifications & OpenSpec Workflow

Specifications live under `openspec/` and are the canonical source of product behavior. Product functional requirements belong here, **never** in this file.

- **Canonical specs:** `openspec/specs/<capability>/spec.md` — the current, agreed-upon behavior per capability (e.g., `incident-management`, `service-request-management`, `change-management`, `release-management`, `asset-configuration-management`, `sla-management`, `service-catalog`).
- **Proposed changes:** `openspec/changes/<change-id>/` — each in-flight change holds `proposal.md` (the what/why), `tasks.md`, optional `design.md` (where stack/architecture detail is allowed), and spec deltas under `openspec/changes/<change-id>/specs/<capability>/spec.md`.

**Workflow:** `propose → implement → archive`.
1. **Propose** — create the change folder with a proposal and spec deltas describing the intended behavior change.
2. **Implement** — build against the approved deltas and complete the tasks.
3. **Archive** — once deployed, fold the deltas into the canonical specs and archive the change.

**Spec delta markers:** deltas use `## ADDED / MODIFIED / REMOVED Requirements` headers to describe how a change alters a capability's spec.

**Specs are technology-agnostic:** they describe behavior only (requirements, scenarios, business rules). Stack, architecture, and implementation detail belong in the change's `design.md` and are owned by engineering — never in a spec delta.

**AGENTS.md vs CLAUDE.md:** the OpenSpec convention also references an `AGENTS.md` file as the entry point for AI agents. In this repository, **CLAUDE.md** (this file) is the Claude Code operational file, and it points to `openspec/` as the specification source of truth.

---

## 5. Roles, Agents & Skills

### Agents (`.claude/agents/`)

Agents are **roles** with their own context and tools; they invoke skills for knowledge.

| Agent | Role |
|-------|------|
| **`sport-itsm-product-owner`** | Product Owner: owns backlog and product vision; writes Epics / User Stories / Gherkin acceptance criteria; translates approved requirements into OpenSpec Change Proposals and Spec Deltas. Grounded in `readme.md` §0.3/§1.1/§1.2. |
| **`sport-itsm-architect`** | Software Architect: owns the end-to-end architecture (frontend + backend) under Nx using DDD + Hexagonal; designs bounded contexts, defines the lib/tag structure and module boundaries, scaffolds Nx libraries, reviews the dependency graph, writes ADRs. |

### Skills (`.claude/skills/`)

Skills are **reusable knowledge/guardrails**, invokable by any agent or the main loop. They are layered by **altitude** (business → system → craft → stack → framework):

| Skill | Altitude | What it provides |
|-------|----------|------------------|
| **`service-desk-expert`** | Business / domain | ITSM service-management processes, functional analysis, and ITSM terminology. Domain depth for specs. |
| **`sport-itsm-architecture`** | System / structure | DDD + Hexagonal + Nx: bounded contexts, layer rules, tag scheme (`platform:`/`scope:`/`type:`), the module-boundary constraint matrix, shared contracts. |
| **`sport-itsm-engineering-principles`** | Craft (class/function) | SOLID + clean-code universals (DRY, KISS, YAGNI, naming, small functions, immutability, error handling) in TypeScript. Stack-agnostic. |
| **`sport-itsm-backend`** | Stack (backend) | NestJS 11 / TypeORM / PostgreSQL exact stack, conventions, commands, and guardrails. |
| **`sport-itsm-frontend`** | Stack (frontend) | Angular 20 / signals / in-house SCSS component layer exact stack, conventions, commands, and guardrails. |
| **`nestjs-best-practices`** | Framework technique (external) | Generic NestJS best-practice rules with examples (DI, security, performance…). Reference library. |
| **`angular-developer`** | Framework technique (external, official) | Generic modern-Angular technique (signals, forms, DI, SSR, a11y, testing). Reference library. |

### How they relate

- **Agents consume skills.** The **PO** uses `service-desk-expert` for domain depth. The **architect** uses `sport-itsm-architecture` + both stack skills + `sport-itsm-engineering-principles`, and may consult the two external skills.
- **Skills are layered, not overlapping.** Each altitude is a single source of truth and cross-references the others instead of duplicating: `sport-itsm-architecture` (system) ↔ `sport-itsm-engineering-principles` (the DIP is the micro-level form of the dependency rule); the two stack skills defer to both for structure and craft, adding only tech-specific rules.
- **Precedence.** The project skills (`sport-itsm-*`) are **project law** and **override** the generic external skills (`nestjs-best-practices`, `angular-developer`) wherever they differ — especially on stack, tooling, boundaries, and E2E (Cypress/Cucumber, not Supertest).
- **Behavior vs structure vs code.** Product behavior lives in `openspec/` (§4); how the system is structured and coded lives in the skills above; this `CLAUDE.md` only points to them.

**Language standard:** all product and specification artifacts are written in **technical English using standard Service Desk / ITSM terminology** (Incident, Service Request, Problem, Change, Release, SLA, OLA, CMDB, Configuration Item, Resolver Group, Major Incident; FCR, MTTR, MTTA, CSAT, RCA, KEDB, CAB), regardless of the language of the request.
