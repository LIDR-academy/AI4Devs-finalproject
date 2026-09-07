# CI/CD — Infrastructure (topology, environments, containers, environment variables)

> **Status.** Almost nothing here is built. This document separates what is **decided** (recorded in
> `ARCHITECTURE.md` or a ticket) from what is **undecided** (nobody has chosen it yet). Never present
> the second group as fact, and never build it without a ticket.

## Target topology — decided

`ARCHITECTURE.md` §3 (C4 level 2), driven by K8 *"one deployable API and one deployable web client —
a modular monolith, not microservices"*:

| Container | What it is | Notes |
|---|---|---|
| `apps/api` | One NestJS 11.2 process | Every route under `/api`, except `/health/live` and `/health/ready` |
| `apps/web` | One Angular 20.3 client, built to static assets | No SSR — `apps/web` has no `main.server.ts` and none is planned |
| PostgreSQL 18 | The single system of record | One database, one schema per bounded context |

Deliberately **absent from the MVP**: no message broker, no cache tier, no separate reporting store.
If a task implies one, it is a scope change, not an infrastructure detail.

## Environments

| Environment | State | Notes |
|---|---|---|
| Local, no containers | **Works today** | `pnpm nx serve api` / `serve web`. This is the daily loop |
| Local PostgreSQL in Docker | **Planned — `T-C10-16`** | `docker-compose.yml` with a named volume and credentials from the environment |
| Pipeline runner | **Not built** | GitHub Actions — see `pipeline.md` |
| Staging / production | **Undecided** | No platform chosen; see below |

## Undecided — do not invent

- **Deployment platform.** `readme.md` §2.4 ("Infraestructura y despliegue") is still the unanswered
  template question, and no ADR covers it. Container host, managed platform, or plain VM: nobody has
  decided. This blocks Dockerfiles for the applications, the reverse proxy, and any deploy job.
- **Reverse proxy / static hosting for `apps/web`.** Follows from the platform choice.
- **Application Dockerfiles.** No ticket owns them. The only container in the backlog is the local
  PostgreSQL of `T-C10-16`.
- **Secrets management.** No secret exists yet because nothing connects to anything.

When a task needs one of these, **stop and say so**: it is an architecture decision owned by
`sport-itsm-architect` and recorded as an ADR.

## Environment variables

`apps/api` validates its environment at boot through `apps/api/src/config/env.validation.ts`, and
**every key is mandatory with no in-code default** — a missing or malformed key aborts the boot
naming the offending variable. That is deliberate: a default would let a missing key boot the
process with a plausible-but-wrong value.

Today the validated schema is exactly:

| Variable | Type | Notes |
|---|---|---|
| `NODE_ENV` | `development` \| `test` \| `staging` \| `production` | Enum — a typo fails the boot |
| `PORT` | integer 1–65535 | No default anywhere |

Database keys arrive with `T-C10-16`, observability keys with the `NFR` epic's observability slice.

**Rules.**

- `.env.example` is the committed template and must list every key. `.env` is gitignored (`.env`,
  `.env.*`, with `!.env.example`), so **nothing automated may depend on a developer's local `.env`** —
  a job that needs `NODE_ENV` and `PORT` supplies them itself.
- Feature code never reads `process.env`; it goes through `ConfigService` (`CLAUDE.md` §3). The only
  place allowed to touch the raw environment is `apps/api/src/config/`.
- Adding a variable means updating `env.validation.ts`, `.env.example`, and any job that starts the
  API.

## Per-project build targets

Read the real `project.json` rather than trusting this table; it is here to tell you what shape to
expect.

- **`api`** — `build` is an `nx:run-commands` target over `webpack-cli` (not the `@nx/webpack`
  executor), producing `dist/apps/api`. It also carries `prune-lockfile` and
  `copy-workspace-modules` targets, which exist precisely so a container image can install only what
  the API needs.
- **`web`** — `build` is `@angular/build:application` (esbuild), output `dist/apps/web`, with a
  `production` configuration carrying budgets and output hashing. `serve` is
  `@angular/build:dev-server` on Angular's default port 4200 (no port is configured).

Note the pattern: **when the Nx wrapper adds nothing, this workspace drives the tool directly**
through `nx:run-commands`. That is why `api:build` calls webpack directly, and why the e2e targets
call `cypress run` directly (ADR-011).

## Health checks

`/health/live` and `/health/ready` are **reserved but not implemented**. `apps/api/src/main.ts`
declares them in the global-prefix exclusion list so that adding them later is a pure addition and
never a change to the prefix contract, but no controller answers them today — every route returns
`404`.

Until they exist, a container or job that waits on the API must wait on the **port**, not on a
health endpoint. Do not write a health-check probe against a URL that returns `404` and call it
green.
