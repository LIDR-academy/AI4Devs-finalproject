---
name: sport-itsm-backend
description: Backend engineering standard for Sport ITSM — the NestJS/TypeScript API that powers the ITSM platform supporting the Sports Competition Management System (SCMS). Use this skill whenever writing, reviewing, or structuring backend code: NestJS modules, controllers, services, TypeORM entities/migrations, DTO validation, Passport JWT auth, license gating, i18n, health checks, and tests. Encodes the exact stack, conventions, commands, and guardrails.
---

# Sport ITSM — Backend Engineering Standard

You are a Senior Backend Engineer working on **Sport ITSM**, the ITSM platform that supports the Sports Competition Management System (SCMS). This skill is the authoritative standard for **how backend code is written** in this repository. Apply it to every backend change.

All code, identifiers, comments, commit messages, and technical documentation are written in **English**, using standard backend and ITSM terminology.

> This skill governs implementation ("how"). Product behavior and functional requirements live in `docs/product/PRD.md` (see `CLAUDE.md` §4). Never encode business requirements here.
>
> **Companion skills:** apply **`sport-itsm-architecture`** for structure (contexts, layers, boundaries) and **`sport-itsm-engineering-principles`** for class/function-level craft (SOLID, clean code). This skill only adds NestJS/TypeORM-specific rules on top of them.

---

# Technology Stack (source of truth)

## Core
- **Node.js 22 LTS** — runtime.
- **TypeScript 5.9** — **strict mode** (`strict: true`); no implicit `any`, no unchecked non-null assertions without justification.
- **NestJS 11** — modular framework; use dependency injection and decorators idiomatically.
- **Express 5** — HTTP adapter under NestJS. `@nestjs/platform-express@11` has bundled Express 5 since `11.0.0`, so NestJS 11 never shipped on Express 4; there is no Express 4 pin to preserve and no pnpm override may be added to force one. Never declare `express` directly in `package.json` — the adapter pins it. Note that Express 5 routes through `path-to-regexp@8`, where the Express 4 wildcard forms (`*`, `:param*`) are rejected: route patterns must be literal or use the v8 grammar.
- **Nx 21.6** — monorepo orchestration.

## Package manager
- **pnpm** — the only supported package manager. Use `pnpm` for installs and `pnpm nx …` for Nx targets. Do not introduce `npm`/`yarn` lockfiles.

## Database & ORM
- **PostgreSQL 16** — Docker container in dev; managed instance in staging/prod.
- **TypeORM 0.3** — entities, repositories, migrations.
- **`pg`** driver.
- **`synchronize` is ALWAYS `false`** in every environment. Schema changes happen **only** through migrations — never via schema auto-sync.
- **Migrations execution policy:**
  - **Development:** may auto-run on backend startup (`apps/api/src/data-source.ts`).
  - **Staging/Production:** migrations are applied through a **controlled step** (deploy job / explicit command), **not** unconditionally on every instance startup — this avoids race conditions when multiple API instances boot concurrently. Gate startup auto-run behind an environment flag (e.g., only when `NODE_ENV=development`).

## Authentication / Authorization
- **Passport.js** with the **`passport-jwt`** strategy.
- **`@nestjs/jwt`** for token signing/verification.
- **`bcrypt`** for password hashing (native module — ensure build toolchain is available in CI/images).
- Custom decorator **`@LicenseFeature()`** gates endpoints by license plan — see `libs/license/api/`. Apply it (with the appropriate guard) on any endpoint whose availability depends on the customer's license.

## Validation (baseline — mandatory)
- **`class-validator`** + **`class-transformer`** for all request DTOs.
- A **global `ValidationPipe`** is enabled with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`. Every controller input is a typed, validated DTO — never consume raw `any` request bodies.

## Configuration (baseline — mandatory)
- **`@nestjs/config`** with a **validated** schema for environment variables. Do not read `process.env` directly outside the config layer; inject `ConfigService` instead.

## i18n
- **`nestjs-i18n` 10** — translates error messages and emails based on the `Accept-Language` header. User-facing messages go through i18n; do not hardcode localized strings.

## Observability
- **`@nestjs/terminus`** — health checks at **`/health/live`** and **`/health/ready`**. These endpoints are **NOT** prefixed with `/api`.
- **`@nestjs/swagger`** — OpenAPI docs at **`/api/docs`** (dev only). Decorate DTOs and endpoints so the generated spec stays accurate.
- **Structured logging (baseline — mandatory)**: **`nestjs-pino`** (pino) for structured, JSON logs with request correlation. Do not use `console.log` in application code.

## Testing
- **Jest 29.7** with **`ts-jest`** — unit and integration tests.
- **Cypress 15.20** — API E2E tests in **`apps/api-e2e/`** using Cypress' request runner. Cypress is invoked through the built-in **`nx:run-commands`** executor, **not** through `@nx/cypress`: that plugin cannot host Cypress 15 at the pinned Nx 21.6, and its generators throw outright on any Cypress major above 14 (**ADR-011**). `apps/api-e2e` owns its `cypress.config.ts` and sequences the API under test with an explicit `dependsOn`.
- **Cucumber / Gherkin** — acceptance tests via **`@badeball/cypress-cucumber-preprocessor` 28.0**, bundled by **`@bahmutov/cypress-esbuild-preprocessor` 2.2** over a direct **`esbuild` 0.28** dev dependency. `.feature` files are the spec entry point; step definitions resolve per feature. The preprocessor sets the Cypress floor: **below 15.18.0 is unsupported**.
- **Coverage target: 80%** lines/branches/functions/statements for changed libraries. It is **enforced wherever a `coverageThreshold` is configured** (project/jest config); treat 80% as the minimum bar for new/changed code even where not yet enforced.

## Development Tools
- **ESLint 9** — flat config in `eslint.config.mjs` with **`@nx/eslint-plugin`**; it enforces **module boundaries** between Nx projects. Never disable boundary rules to work around a bad dependency — fix the dependency.
- **Prettier 3** — single quotes, semicolons. Formatting is Prettier's job; do not hand-format or add stylistic ESLint rules that conflict with Prettier.
- **`ts-node` + `tsconfig-paths`** — used for TypeORM CLI execution.

---

# Architecture & Monorepo Conventions

> **Cross-cutting architecture (DDD + Hexagonal + Nx tags/boundaries) is defined by the `sport-itsm-architecture` skill — defer to it for bounded contexts, layer rules, tag scheme, and the dependency-constraint matrix.** This section only maps those rules to NestJS.

- This is an **Nx monorepo**. The API composition root lives in **`apps/api/`**; its E2E suite in **`apps/api-e2e/`**; domain/application/infrastructure code lives in **`libs/<context>/…`** (e.g., `libs/license/api/`).
- Respect **module boundaries** enforced by ESLint (`@nx/enforce-module-boundaries`). Cross-project imports go through each library's public `index.ts` barrel, never deep-import internals.
- **Hexagonal → NestJS mapping:**
  - `type:domain` — pure entities/value objects/aggregates + **port interfaces**. No `@nestjs/*`, no TypeORM.
  - `type:application` — use cases (application services) implementing inbound ports and depending on outbound ports. Framework-light.
  - `type:infrastructure` — **outbound adapters**: TypeORM repository implementations, external gateways.
  - `apps/api` + NestJS **modules** are the **composition root** and **inbound adapter** (controllers): wire ports to adapters via DI. Keep controllers thin (HTTP only); no business logic in controllers.
- Use **constructor-based dependency injection**; bind ports to adapters with **injection tokens/interfaces** (this is the idiomatic NestJS way to honor the dependency rule).

# API Conventions

- Global route prefix is **`/api`**, with **health endpoints excluded** (`/health/live`, `/health/ready` are served without the prefix). Swagger UI is at **`/api/docs`** (dev only).
- All endpoints accept and return **validated DTOs**. Return meaningful HTTP status codes; surface domain errors through NestJS exception filters, with messages localized via `nestjs-i18n`.
- Gate license-restricted endpoints with **`@LicenseFeature()`**.

# Persistence Conventions

- Define TypeORM **entities** with explicit column types; keep them free of business logic.
- All schema evolution is a **migration**. Name migrations descriptively; keep them reversible where feasible.
- Access data through repositories/services; do not scatter query builders across controllers.

---

# Common Commands (pnpm + Nx)

> Exact target names and scripts are defined in `project.json`/`package.json` (owned by the engineering/architecture setup). The canonical forms are:

- Install: `pnpm install`
- Run the API (dev): `pnpm nx serve api`
- Build the API: `pnpm nx build api`
- Unit/integration tests for a project: `pnpm nx test <project>`
- Lint a project: `pnpm nx lint <project>`
- API E2E (Cypress + Cucumber): `pnpm nx e2e api-e2e` — an `nx:run-commands` target over `cypress run`, not an `@nx/cypress` executor (ADR-011)
- Affected checks: `pnpm nx affected -t lint test build`
- TypeORM migrations (via `ts-node` + `tsconfig-paths`, data source at `apps/api/src/data-source.ts`):
  - Generate: `pnpm typeorm migration:generate -d apps/api/src/data-source.ts <path/Name>`
  - Run: `pnpm typeorm migration:run -d apps/api/src/data-source.ts`
  - Revert: `pnpm typeorm migration:revert -d apps/api/src/data-source.ts`

---

# What NOT to do (guardrails)

- **Do NOT** set TypeORM `synchronize: true` in any environment — migrations only.
- **Do NOT** auto-run migrations unconditionally on startup in staging/prod — gate to development.
- **Do NOT** read `process.env` directly in feature code — use `ConfigService`.
- **Do NOT** consume unvalidated/`any` request bodies — always use DTOs with `class-validator`.
- **Do NOT** use `console.log` — use the pino logger.
- **Do NOT** deep-import across Nx projects or disable ESLint module-boundary rules.
- **Do NOT** hardcode user-facing/localized messages — route them through `nestjs-i18n`.
- **Do NOT** prefix the health endpoints with `/api`, and do NOT expose Swagger outside dev.
- **Do NOT** hand-format code against Prettier, or add stylistic ESLint rules that conflict with it.
- **Do NOT** introduce `npm`/`yarn` lockfiles or a second package manager.
- **Do NOT** downgrade or bump pinned major versions (Node 22, NestJS 11, Express 5, TypeORM 0.3, etc.) without an approved change.
