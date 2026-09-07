---
name: ci-cd
description: >
  CI/CD, DevOps and environment configuration for Sport ITSM (Nx monorepo, Angular 20.3 +
  NestJS 11.2 + PostgreSQL 18, pnpm 10 on Node 22). Use it whenever working with
  Docker/docker-compose, Dockerfiles, GitHub Actions workflows (`.github/workflows/`), deploy
  configuration, health checks, reverse proxy, environment variables (`.env`), database
  provisioning and backups, per-project build/serve targets (`project.json`), or the
  squash/consolidation of TypeORM migrations. Does NOT cover backend business logic
  (`backend-engineer`), frontend logic (`frontend-engineer`) or test code
  (`testing-implementer`). Applied by the `ci-cd-expert` agent.
---

# Sport ITSM — CI/CD and infrastructure

Continuous integration, DevOps and environments: containers, GitHub Actions workflows, environment
configuration and deploys. Maintains and evolves the infrastructure without touching business logic.

Detailed reference content lives in `references/` — this `SKILL.md` is the process index; read the
reference that matches the task.

## Read this first: almost nothing exists yet

This repository has **no infrastructure at all**. There is no `docker/`, no `Dockerfile`, no
`docker-compose.yml`, no reverse proxy config, no `scripts/`, and **no `.github/workflows/`**. The
only planned piece is a local PostgreSQL 18 `docker-compose.yml`, owned by ticket **`T-C10-16`**.

**No deployment platform has been chosen.** `readme.md` §2.4 ("Infraestructura y despliegue") is
still an unanswered template question and no ADR covers it. Choosing one is an architecture decision
owned by `sport-itsm-architect` and recorded as an ADR — never a side effect of a pipeline change.

Consequences for you: describe targets as targets, mark what is undecided as undecided, and **never
invent infrastructure that no ticket asked for**.

## "CI" means Configuration Item here

In this product's vocabulary `CI` is a **Configuration Item** (CMDB, the `asset-config` context),
not Continuous Integration. `ARCHITECTURE.md` says *"update CI version on deploy"* and the epic map
says *"CI linkage"* meaning configuration items. Read backlog and product docs that way, and when
you write, say **"pipeline"** or **"GitHub Actions"** rather than a bare "CI".

## Mandatory bootstrapping

Before ANY change:

1. Read `CLAUDE.md` — §2 for the pinned stack, §3 for commands and the "what NOT to do" list.
2. Load `sport-itsm-workflow` for the verification discipline and artifact ownership; load
   `sport-itsm-architecture` if the change touches `project.json` or the project graph.
3. Read `package.json` — the **SSOT** for exact versions. `CLAUDE.md` §2 pins `major.minor`; the
   patch lives only in the manifest, so never restate it elsewhere.
4. Explore whatever exists before touching it. If it does not exist, say so instead of assuming.
5. Read the `project.json` of `api` and `web` for the real `build` / `serve` targets.

## References — what to read and when

| Reference | Read it when… |
|---|---|
| `references/infrastructure.md` | You touch environments, containers, env vars, or need the target topology and what is still undecided. |
| `references/pipeline.md` | You create or modify a GitHub Actions workflow: jobs, caching, pnpm/Node setup, the gates this repo actually has. |
| `references/database.md` | You work with PostgreSQL provisioning, the TypeORM data source, the migration execution model, or an ephemeral database for acceptance runs. |
| `references/optimize-db.md` | The user asks to **consolidate/squash migrations** ("recreate the DB", "simplify the migrations"). Full procedure plus activation signals. |
| `references/gotchas.md` | Anything touching Dockerfiles, the TypeORM CLI, third-party container images, or a build that fails in a runner but not locally. Rules learned from real incidents. |

## Project constraints that bind every change

- **pnpm 10 is the only package manager.** `npm install` or `yarn` produces a second lockfile and is
  forbidden. In a workflow: `pnpm/action-setup` plus `--frozen-lockfile`.
- **Node 22.** `engines.node` is `>=22.0.0 <23.0.0`, `.nvmrc` says `22`. Every image and runner must
  pin Node explicitly and verifiably.
- **`synchronize` is always `false`.** Migrations are the only schema-change mechanism, and their
  auto-run is gated to development — never unconditional in staging or production.
- **`/health/live` and `/health/ready` sit outside the `/api` prefix.** They are reserved in the
  exclusion list of `apps/api/src/main.ts` but **not implemented yet**, so there is no health
  endpoint to probe today. Swagger is development-only.
- **One deployable API and one deployable web client** — a modular monolith, not microservices
  (`ARCHITECTURE.md` §3, driver K8). Plus one PostgreSQL. No broker, no cache tier, no separate
  reporting store in the MVP.
- **`@nx/cypress` is not installed** (ADR-011). Cypress runs through `nx:run-commands`; there is no
  `e2e-ci` target, no Nx Cypress preset and no `ciWebServerCommand`.
- **pnpm 10 blocks postinstall scripts**, and Cypress downloads its binary in one. Any job running
  Cypress needs an explicit build-script allowlist or it fails with `No version of Cypress is
  installed`.

## Competencies

Multi-stage Docker and layer optimisation · Docker Compose (healthchecks, `depends_on`, volumes,
networks) · GitHub Actions (jobs, matrices, caching, artifacts, reusable workflows, concurrency,
environments and secrets) · Reverse proxy for an SPA (gzip, cache, security headers) ·
PostgreSQL 18 (`pg_dump`/`restore`, `pg_isready`) · TypeORM 1.1 migrations · Nx (targets,
configurations, `affected`) · Shell scripting (entrypoints, health checks) · Security (CORS,
headers, secrets, `.env`).

## Strict rules

1. **NEVER** hardcode secrets or credentials — environment variables and GitHub Secrets only.
2. **NEVER** change a Dockerfile or a workflow without verifying the rest still works.
3. **ALWAYS** keep health checks aligned with the endpoints that actually exist.
4. **ALWAYS** verify Node, pnpm and Cypress are consistent across local, Docker and the runner.
5. **ALWAYS** document environment-variable changes in `.env.example` — the committed template;
   `.env` itself is gitignored, so nothing may depend on a developer's local copy.
6. **ALWAYS** check cache and artifact paths are relative to the workspace when adding a job.
7. **Everything committed is in English**, including configuration comments and job names
   (`CLAUDE.md` §5).
8. **Pin third-party actions and images** by version tag or SHA, and verify what a tag actually
   contains rather than trusting its name.

## Output format

- Show the **exact file path** before each code block.
- State **which environment** the change affects (local / docker / pipeline / deploy).
- If you touch the pipeline: which **jobs and steps** are affected.
- If you touch a Dockerfile: **impact on layers and image size**.
- Flag whether the change requires **updating secrets or variables** in an external service.
- Run what can be run and **paste the real output**. A check you did not execute is reported as not
  executed, never as passed.

## Quality checks before finishing

1. Versions consistent across `package.json`, Dockerfiles and workflows.
2. `pnpm install --frozen-lockfile` still works, with no `WARN Unsupported engine`.
3. Exactly one lockfile: `pnpm-lock.yaml`.
4. Valid YAML, with every action pinned.
5. `.env.example` updated if variables changed.
6. Artifact and cache paths relative to the workspace.
7. `project.json` consistent with whatever the Dockerfile or workflow assumes.
8. `pnpm nx run-many -t lint test build`, `pnpm verify:boundaries` and `pnpm prettier --check .`
   still green.

## Scope

Infrastructure and pipeline only. Backend business logic → `backend-engineer`; frontend →
`frontend-engineer`; test code → `testing-implementer`; structural decisions and ADRs →
`sport-itsm-architect`.
