# CLAUDE.md

> **Purpose:** Operational context for Claude Code working in this repository — how to orient, where things live, and how to work. This file is **not** a functional-requirements document; product behavior and requirements live in the product documentation (see section 4).

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
| Runtime | **Node.js 22 LTS** |
| Framework | **NestJS 11** on **Express 5** — `@nestjs/platform-express@11` has bundled Express 5 since `11.0.0`; NestJS 11 never shipped on Express 4. Do **not** add a pnpm override to force Express 4. |
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

Bounded contexts (the authoritative list is `ARCHITECTURE.md` §4.1 — **14 contexts**, which with `shared` gives the 15 allowed `scope:` values). Capability contexts: `incident`, `service-request`, `problem`, `change`, `release`, `asset-config`, `sla`, `service-catalog`, `knowledge`, `identity-access`. Generic supporting contexts (ADR-001): `approval`, `notification`, `audit`, `reporting`. Plus `shared`. Generate only the libs a context actually uses, always via Nx generators. Every project is tagged on **three axes** — `platform:` (`backend`/`frontend`/`shared`), `scope:` (`<context>`/`shared`), `type:` (from the list above) — enforced by `@nx/enforce-module-boundaries`. Cross-project imports go through each lib's `index.ts` barrel; dependencies point **inward only** and cross-context/FE-BE sharing goes exclusively through `shared/contracts`; cross-context UI reuse goes through `libs/shared/ui`, the in-house design system, tagged `platform:frontend`, `scope:shared`, `type:ui` (a shared *scope* does not imply a `platform:shared` *tag*).

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

## 4. Product Behavior — Specifications, Product Docs & Backlog

**The rule that does not change: product functional requirements do NOT live in this file.** `CLAUDE.md` points to where behavior is specified; it never restates it.

**Doctrine (Product Owner decision).** **`docs/product/PRD.md` is the canonical source of product behavior today; `openspec/` is the change-control layer that will be stood up on top of it once implementation begins** — a spec delta only carries meaning against an agreed, implemented baseline, and today the entire product is a greenfield `ADDED` set, so seeding `openspec/specs/` now would create a second source of truth with nothing to reconcile it against.

**Where do I go?**

| I need… | Read |
|---|---|
| What the product must do, and why | `docs/product/PRD.md` (canonical) |
| How the system is structured / built | `docs/product/ARCHITECTURE.md` + §2–§3 above + the `sport-itsm-*` skills |
| What is left to build, grouped and sized | `docs/backlog/epic-map.md` (derived) |
| A behavior **change** to already-implemented behavior | `openspec/changes/<change-id>/` — **not created yet**, see §4.4 |

### 4.1 Canonical behavior — `docs/product/PRD.md`

Business and functional, technology-agnostic. It owns:

| PRD section | Owns |
|---|---|
| §1 Product Vision & Value Proposition | Vision statement, value proposition, differentiators |
| §2–§3 Problem Statement, Scope | The in-scope / out-of-scope rule (SCMS platform, not the sporting operation) |
| §4 Personas & Roles | The personas (Requester, Agent L1, Analyst L2/L3, Change/Release Manager, Service Owner, System Administrator…) |
| §5–§6 Capability Breakdown, User Journeys | The capability catalogue `C1…C18` and the end-to-end journeys |
| **§7 Functional Requirements** | **`FR-<CAP>-nn`** (e.g. `FR-INC-04`, `FR-MIM-01`) with MoSCoW priority, grouped one subsection per capability |
| **§8 Non-Functional Requirements** | **`NFR-<CAP>-nn`** (e.g. `NFR-AVL-01`), expressed as observable behavior only |
| §9 Success Metrics & KPIs | FCR, MTTA, MTTR, CSAT, deflection rate and their targets |
| §10–§13 | Assumptions, constraints, dependencies, risks |
| **§14 Phased Release Plan** | Prioritization method (WSJF-style + MoSCoW), Phase 0 foundations, MVP scope, later phases |
| §15–§16 | Definition of Ready / Definition of Done, glossary |

**Rules.** PRD requirement IDs are **stable**: never renumber, reuse or invent one — anywhere, in any artifact. The PRD is **behavior only**: no stack, schema, endpoint or component choice ever enters it. Each §7 subsection already names the OpenSpec capability slug it will map to (`incident-management`, `service-request-management`, `change-management`, `release-management`, `asset-configuration-management`, `sla-management`, `service-catalog`, …), so the future migration is a lookup, not a re-derivation. The PRD is owned by the `sport-itsm-product-owner` agent via the `prd-author` skill.

### 4.2 Engineering documentation — `docs/product/`

The technical companions to the PRD. They describe the **target state**: nothing is implemented yet, so read them as prescriptive ("shall be"), not descriptive.

- **`ARCHITECTURE.md`** — the authoritative design baseline: C4 context and containers, the **bounded context map** (§4), the **Nx monorepo structure, three-axis tags and module-boundary matrix** (§5), the backend hexagon and frontend architecture (§6–§7), cross-cutting architecture (§9) and the **ADRs** (§10, to be promoted to `docs/adr/` when scaffolding starts). Together with §3 of this file and the `sport-itsm-architecture` skill, it is the layer/boundary reference.
- **`DATA-MODEL.md`** — the prescriptive relational schema the first TypeORM migrations must produce, per context schema, each table traced to an FR ID.
- **`COMPONENTS.md`** — the main components (Web Client, API, PostgreSQL, per-context libraries), their responsibility and technology.
- **`PROJECT-STRUCTURE.md`** — where things live on disk and why: the directory tree and the folder-structure-*is*-the-architecture rule.

These hold the **how**. Never put a requirement in them, and never put stack detail in the PRD.

### 4.3 Derived backlog — `docs/backlog/`

The delivery chain, produced **from** the PRD, one epic at a time:

`docs/backlog/epic-map.md` → `docs/backlog/<key>/user-stories.md` → `docs/backlog/<key>/tickets/T-<key>-nn.md`

**The backlog is derived, never a source.** No backlog artifact may introduce a requirement that is not in the PRD, and none may invent, renumber or reword a PRD ID. Epic keys are the PRD's own capability IDs (`C1`, `C10`, `C18`, plus `NFR` for §8); story IDs are `US-<key>-nn` and ticket IDs `T-<key>-nn`. A downstream role that finds the PRD wrong **reports the finding** — the fix is made in the PRD by the Product Owner, then the affected backlog artifacts are regenerated.

### 4.4 `openspec/` — planned, not yet created

**`openspec/` does not exist in this repository today.** Do not read it, cite it, or treat a missing file under it as an error: until it is created, §4.1 is the specification source of truth and §4.3 is the delivery plan.

**When it activates.** Per capability, at the **first behavior change proposed against already-implemented behavior** of that capability — i.e. once its PRD requirements have been built, not before. Creating `openspec/` is itself an approved change, never a side effect of an unrelated task.

**How the migration works.** Seeding a capability writes `openspec/specs/<capability>/spec.md` from that capability's PRD §7/§8 requirements — behavior carried over verbatim in intent, **PRD IDs referenced, never renumbered**. From that point the canonical spec owns that capability's current behavior and the PRD remains the product-level narrative (vision, personas, scope, metrics, phases) and the register of not-yet-built requirements. A capability that has not been seeded stays governed by the PRD.

**Structure, once active.**

- **Canonical specs:** `openspec/specs/<capability>/spec.md` — the current, agreed-upon behavior per capability.
- **Proposed changes:** `openspec/changes/<change-id>/` — `proposal.md` (the what/why), `tasks.md`, optional `design.md` (where stack/architecture detail is allowed), and spec deltas under `openspec/changes/<change-id>/specs/<capability>/spec.md`.
- **Workflow:** `propose → implement → archive`. **Propose** the change folder with proposal and deltas; **implement** against the approved deltas; **archive** by folding the deltas into the canonical specs.
- **Spec delta markers:** `## ADDED / MODIFIED / REMOVED Requirements`.
- **Specs are technology-agnostic:** behavior only (requirements, scenarios, business rules). Stack, architecture and implementation detail belong in the change's `design.md` and are owned by engineering — never in a spec delta. This mirrors the PRD rule in §4.1, so a requirement migrates cleanly.

### 4.5 AGENTS.md vs CLAUDE.md

The OpenSpec convention also references an `AGENTS.md` file as the entry point for AI agents. In this repository, **CLAUDE.md** (this file) is the Claude Code operational file, and there is no `AGENTS.md`. It points to **`docs/product/PRD.md`** as the specification source of truth today, and to `openspec/` for capabilities once they have been seeded per §4.4.

---

## 5. Roles, Agents & Skills

### Agents (`.claude/agents/`)

Agents are **roles** with their own context and tools; they invoke skills for knowledge.

| Agent | Role |
|-------|------|
| **`sport-itsm-product-owner`** | Product Owner: owns backlog and product vision. **Mode 1** — authors the PRD, personas and roadmap (via `prd-author`). **Mode 2** — builds `docs/backlog/epic-map.md` (via `epic-mapper`). Translates approved requirements into OpenSpec Change Proposals and Spec Deltas **once `openspec/` is active** (§4.4). Working baseline: `docs/product/PRD.md`, itself grounded in `readme.md` §0.3/§1.1/§1.2. |
| **`sport-itsm-architect`** | Software Architect: owns the end-to-end architecture (frontend + backend) under Nx using DDD + Hexagonal; designs bounded contexts, defines the lib/tag structure and module boundaries, scaffolds Nx libraries, reviews the dependency graph, writes ADRs. **Structure only — it does not write stories or tickets.** |
| **`business-analyst`** | Business Analyst: writes the user stories for **one** epic into `docs/backlog/<key>/user-stories.md`, shaped by each requirement's as-built state (greenfield / gap / defect). Consumes the epic map; never re-derives an epic key. |
| **`architect-tech-lead`** | Architect / Tech Lead: decomposes **one** epic's user stories into board-ready tickets (≤3h) at `docs/backlog/<key>/tickets/T-<key>-nn.md`, plus the BDD specification and the test plan. Single owner of ticket generation; does **not** write test code. |

**Backlog pipeline.** The three backlog roles form a chain, one epic at a time, each consuming the previous artifact and never re-deriving it:

`sport-itsm-product-owner` (Mode 2) → `docs/backlog/epic-map.md` → `business-analyst` → `docs/backlog/<key>/user-stories.md` → `architect-tech-lead` → `docs/backlog/<key>/tickets/`

Keys (`C1`, `C10`, `C18`, `NFR`…) are owned by the epic map. Story IDs are `US-<key>-nn`, ticket IDs `T-<key>-nn`; neither role renumbers a PRD identifier (`FR-`, `NFR-`, `BO-`).

### Skills (`.claude/skills/`)

Skills are **reusable knowledge/guardrails**, invokable by any agent or the main loop. They are layered by **altitude** (process → business → system → craft → stack → framework):

| Skill | Altitude | What it provides |
|-------|----------|------------------|
| **`prd-author`** | Process (product) | The PRD workflow, template and quality checklist, plus the personas and roadmap artifacts around it. Owned by the PO (Mode 1). |
| **`epic-mapper`** | Process (product) | Builds `docs/backlog/epic-map.md`: requirement counts by build state, what remains, dependencies, size, drill order. Maps and measures — it never writes stories or tickets. Owned by the PO (Mode 2). |
| **`business-analyst`** | Process (backlog) | Story shaping by as-built state, the story-shape table and the `user-stories.md` output format. One epic per run. |
| **`architect-tech-lead`** | Process (backlog) | Ticket decomposition (≤3h), the ticket file format, the BDD specification and the test strategy (coverage, gaps, P0/P1/P2, test type). One epic per run. |
| **`feature-docs`** | Process (technical writing) | The standard for written + visual technical documents: feature specs, architecture diagrams, structured technical references. |
| **`service-desk-expert`** | Business / domain | ITSM service-management processes, functional analysis, and ITSM terminology. Domain depth for specs. |
| **`sport-itsm-architecture`** | System / structure | DDD + Hexagonal + Nx: bounded contexts, layer rules, tag scheme (`platform:`/`scope:`/`type:`), the module-boundary constraint matrix, shared contracts. |
| **`sport-itsm-engineering-principles`** | Craft (class/function) | SOLID + clean-code universals (DRY, KISS, YAGNI, naming, small functions, immutability, error handling) in TypeScript. Stack-agnostic. |
| **`sport-itsm-backend`** | Stack (backend) | NestJS 11 / TypeORM / PostgreSQL exact stack, conventions, commands, and guardrails. |
| **`sport-itsm-frontend`** | Stack (frontend) | Angular 20 / signals / in-house SCSS component layer exact stack, conventions, commands, and guardrails. |
| **`nestjs-best-practices`** | Framework technique (external) | Generic NestJS best-practice rules with examples (DI, security, performance…). Reference library. |
| **`angular-developer`** | Framework technique (external, official) | Generic modern-Angular technique (signals, forms, DI, SSR, a11y, testing). Reference library. |

### How they relate

- **Agents consume skills.** The **PO** uses `service-desk-expert` for domain depth, `prd-author` in Mode 1 and `epic-mapper` in Mode 2. The **architect** uses `sport-itsm-architecture` + both stack skills + `sport-itsm-engineering-principles` + `feature-docs`, and may consult the two external skills. **`business-analyst`** and **`architect-tech-lead`** are thin agents over the skill of the same name, and both also read `sport-itsm-architecture` so their output is expressible in this structure.
- **One owner per artifact.** The epic map is the PO's; `user-stories.md` is the Business Analyst's; the tickets and the test plan are the Architect / Tech Lead's. A downstream role that finds an upstream artifact wrong **reports it** — it does not edit it. That is why every `user-stories.md` ends in a Findings section.
- **Skills are layered, not overlapping.** Each altitude is a single source of truth and cross-references the others instead of duplicating: `sport-itsm-architecture` (system) ↔ `sport-itsm-engineering-principles` (the DIP is the micro-level form of the dependency rule); the two stack skills defer to both for structure and craft, adding only tech-specific rules.
- **Precedence.** The project skills (`sport-itsm-*`) are **project law** and **override** the generic external skills (`nestjs-best-practices`, `angular-developer`) wherever they differ — especially on stack, tooling, boundaries, and E2E (Cypress/Cucumber, not Supertest).
- **Behavior vs structure vs code.** Product behavior lives in `docs/product/PRD.md` (§4); how the system is structured and coded lives in `docs/product/ARCHITECTURE.md` and the skills above; this `CLAUDE.md` only points to them.

**Language standard:** all product and specification artifacts are written in **technical English using standard Service Desk / ITSM terminology** (Incident, Service Request, Problem, Change, Release, SLA, OLA, CMDB, Configuration Item, Resolver Group, Major Incident; FCR, MTTR, MTTA, CSAT, RCA, KEDB, CAB), regardless of the language of the request.
