---
name: sport-itsm-architecture
description: Cross-cutting architecture standard for Sport ITSM — Domain-Driven Design (DDD) and Hexagonal (Ports & Adapters) architecture governed across the whole application (frontend and backend) inside an Nx monorepo. Use this skill whenever designing bounded contexts, defining library structure and Nx tags/module boundaries, placing code in domain/application/adapter layers, shaping shared contracts, or reviewing the dependency graph. This is the authoritative source for structural rules shared by frontend and backend.
---

# Sport ITSM — Architecture Standard (DDD + Hexagonal on Nx)

You are the architecture authority for **Sport ITSM**, the ITSM platform that supports the Sports Competition Management System (SCMS). This skill defines **how the whole application is structured** — frontend and backend — using **Domain-Driven Design** and **Hexagonal (Ports & Adapters)** architecture inside an **Nx monorepo**. These structural rules are cross-cutting and shared; technology-specific mapping lives in `sport-itsm-backend` and `sport-itsm-frontend`, which defer to this skill for the rules below.

All artifacts, identifiers, and documentation are written in **English**, using standard DDD/architecture and ITSM terminology.

> This skill governs **structure** ("where code lives and what may depend on what"). Product behavior lives in `openspec/`; code-level stack rules live in the two stack skills; class/function-level craft (SOLID, clean code) lives in **`sport-itsm-engineering-principles`**. Never encode business requirements here.
>
> **DIP cross-link:** the module-level Dependency Inversion enforced here (the inward-only dependency rule and ports/adapters) is the system-level form of SOLID's **D** stated in `sport-itsm-engineering-principles`. Honor it at both levels.

---

# 1. Domain-Driven Design — Strategic

- The system is decomposed into **bounded contexts**, one per ITSM capability. Baseline contexts: `incident`, `service-request`, `problem`, `change`, `release`, `asset-config` (CMDB), `sla`, `service-catalog`, `knowledge`, `identity-access`. A shared kernel context `shared` holds cross-context primitives.
- Each bounded context has its own **ubiquitous language** — use the exact ITSM terms consistently in code, tests, and docs (Incident, Service Request, Change, Release, Configuration Item, SLA…).
- Contexts are **isolated**: a context may depend only on itself and on `shared`. Cross-context interaction happens through **published contracts** (see §5) or domain events — never by reaching into another context's internals.
- Respect the platform scope rule from `readme.md` §0.3: the platform models support/operations of the SCMS platform; in-application sport decisions are out of scope.

# 2. Domain-Driven Design — Tactical

Within a context's domain layer, model with: **Entities**, **Value Objects**, **Aggregates** (with a single aggregate root as the consistency boundary), **Domain Events**, **Domain Services** (for logic that doesn't belong to one entity), and **Repository interfaces (ports)** owned by the domain. Keep the domain **pure**: no framework, ORM, HTTP, or I/O imports.

# 3. Hexagonal Architecture — Layers & the Dependency Rule

Three concentric layers per context. **Dependencies always point inward.**

- **Domain** (innermost, pure) — entities, value objects, aggregates, domain events, and **port interfaces**. Depends on nothing but itself and pure utilities.
- **Application** — use cases / application services that orchestrate the domain and declare **inbound ports** (use-case interfaces) and depend on **outbound ports** (repository/gateway interfaces defined in the domain). No framework specifics.
- **Adapters (Infrastructure)** — implement ports:
  - **Inbound adapters** (driving): HTTP controllers, GraphQL, message consumers, UI — call application use cases.
  - **Outbound adapters** (driven): TypeORM repositories, external service gateways, email/notification, etc. — implement outbound ports.

The domain and application layers **never** import adapters. Adapters are wired via dependency injection at the composition root (NestJS module / Angular providers).

# 4. Nx Workspace Layout

```
apps/
  api/              # NestJS composition root (inbound HTTP adapter + wiring)
  api-e2e/
  web/              # Angular composition root (shell, routing)
  web-e2e/
libs/
  <context>/
    domain/         # type:domain      (pure domain model + ports)
    application/    # type:application (use cases; backend-side)
    infrastructure/ # type:infrastructure (outbound adapters: TypeORM, gateways)
    feature/        # type:feature     (Angular feature libs; frontend-side)
    ui/             # type:ui          (Angular presentational components)
    data-access/    # type:data-access (Angular HTTP/state; inbound-to-backend client)
  shared/
    contracts/      # type:contracts   (DTOs / API types shared FE+BE)
    domain/         # type:domain      (shared kernel primitives)
    util/           # type:util        (pure helpers)
```

Not every context needs every lib — generate only what a context actually uses. Use **Nx generators** to scaffold libs so tags and paths stay consistent.

# 5. Shared Contracts

- A single source of truth for the API surface (request/response DTOs, enums, error codes) lives in `libs/shared/contracts` (`type:contracts`, `platform:shared`).
- Contracts contain **types only** — no logic, no framework. Both the backend (to shape controllers/DTOs) and the frontend (to type HttpClient calls) import contracts, keeping FE and BE in lockstep.

# 6. Nx Tags & Module Boundaries (enforced)

Every project is tagged on **three axes** in its `project.json`:

- **platform:** `platform:backend` | `platform:frontend` | `platform:shared`
- **scope:** `scope:<context>` (e.g. `scope:incident`) or `scope:shared`
- **type:** `type:domain` | `type:application` | `type:infrastructure` | `type:feature` | `type:ui` | `type:data-access` | `type:contracts` | `type:util`

Enforce with `@nx/enforce-module-boundaries` in `eslint.config.mjs`. Dependency constraints:

| From \ May depend on | domain | application | infrastructure | feature | ui | data-access | contracts | util |
|---|---|---|---|---|---|---|---|---|
| **type:domain** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **type:application** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **type:infrastructure** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **type:feature** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **type:ui** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **type:data-access** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **type:contracts** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **type:util** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

Plus:
- **scope:** a `scope:<context>` project may depend only on the same `scope:<context>` and `scope:shared`.
- **platform:** `platform:frontend` and `platform:backend` may **not** depend on each other; both may depend on `platform:shared` (contracts/util).

These two matrices together enforce the dependency rule (§3) and context isolation (§1) mechanically.

# 7. Governance Commands (Nx)

- Visualize the graph: `pnpm nx graph`
- Check only what changed: `pnpm nx affected -t lint test build`
- Lint (runs boundary checks): `pnpm nx lint <project>`
- Scaffold libs with correct tags:
  - `pnpm nx g @nx/js:lib <context>-domain --directory=libs/<context>/domain --tags=platform:backend,scope:<context>,type:domain`
  - `pnpm nx g @nx/angular:lib <context>-feature --directory=libs/<context>/feature --tags=platform:frontend,scope:<context>,type:feature`

# 8. Architecture Decision Records

Record significant, hard-to-reverse structural decisions as short **ADRs** (context → decision → consequences) under `docs/adr/` (or the repo's agreed location). New bounded contexts, tag-scheme changes, and cross-context integration choices warrant an ADR.

---

# What NOT to do (guardrails)

- **Do NOT** import frameworks, ORM, HTTP, or I/O into `type:domain` or `type:application` — keep them pure.
- **Do NOT** let domain/application depend on adapters — dependencies point inward only.
- **Do NOT** cross bounded contexts by deep-importing internals — go through `contracts`, `shared`, or domain events.
- **Do NOT** put logic in `contracts` — types only.
- **Do NOT** create a project without the three tags (`platform:`, `scope:`, `type:`).
- **Do NOT** relax or disable `@nx/enforce-module-boundaries` to make a bad dependency compile — fix the design.
- **Do NOT** let frontend and backend libraries depend on each other — share only via `platform:shared`.
- **Do NOT** create a "god" shared lib — keep `shared` minimal and justified.
