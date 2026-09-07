# ci-cd Skill

## Purpose

CI/CD, DevOps and environment configuration for Sport ITSM: Docker and docker-compose, Dockerfiles,
GitHub Actions workflows, deploy configuration, reverse proxy, environment variables, database
provisioning and backups, per-project build targets, and TypeORM migration squashing. All the
infrastructure reference knowledge and process, applied by the `ci-cd-expert` agent.

## Role

**CI/CD / infrastructure reference (support skill)** — the *how the infra and the pipeline work
here*. Does not touch backend, frontend or test code.

## Structure

- `SKILL.md` — bootstrapping, the constraints that bind every change, competencies, strict rules,
  output format, quality checks and pointers.
- `references/infrastructure.md` — target topology, environments, containers, environment
  variables, and an explicit record of what is still undecided.
- `references/pipeline.md` — GitHub Actions: the gates this repo actually has, pnpm/Node setup,
  caching, and the Cypress binary problem.
- `references/database.md` — PostgreSQL provisioning, the TypeORM data source, the migration
  execution model, and an ephemeral database for acceptance runs.
- `references/optimize-db.md` — the migration squash/consolidation procedure.
- `references/gotchas.md` — durable operational rules learned from real incidents, each marked as
  applicable now or as a caution for when the corresponding piece is built.

## Loaded by

- `ci-cd-expert` — the thin role agent.

## Reads from

- `sport-itsm-workflow` — verification discipline and artifact ownership.
- `sport-itsm-architecture` — layers and boundaries, when a change touches `project.json` or the
  project graph.

## Constraints

- **Nothing infrastructural exists in this repository yet**, and **no deployment platform has been
  chosen** (`readme.md` §2.4 is unanswered). The references describe targets and decisions, never
  invented facts. Re-verify before relying on any "what exists" statement.
- Infrastructure and pipeline only; business logic → `backend-engineer` / `frontend-engineer`; test
  code → `testing-implementer`; structural decisions and ADRs → `sport-itsm-architect`.
- No hardcoded secrets. Version consistency across `package.json`, Dockerfiles and workflows.
- Everything committed, including configuration comments, is in English.
- **`package.json` is the SSOT for exact versions.** `CLAUDE.md` §2 pins `major.minor`; no reference
  here restates a patch version.
- In this product's vocabulary **`CI` means Configuration Item**, not Continuous Integration.
