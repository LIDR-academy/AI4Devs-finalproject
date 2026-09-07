# CI/CD — Database (provisioning, data source, migration execution model)

> **Status: not built.** There is no `docker-compose.yml`, no `apps/api/src/data-source.ts`, no
> migration and no database in this repository. Provisioning and the data source are owned by ticket
> **`T-C10-16`**; the first migration by **`T-C10-17`**. This document is the contract those tickets
> must produce and the rules that bind them afterwards.

## Provisioning — `T-C10-16`

A local PostgreSQL **16** through `docker-compose.yml`, with a **named volume** and credentials read
from the environment — never hardcoded, never committed. `pnpm typeorm migration:show` against it
must connect and report an empty migration list.

Waiting for it to be ready means `pg_isready`, not a sleep.

## The migration execution model — the rule that matters most

From `CLAUDE.md` §3 and `ARCHITECTURE.md` §6.3, and non-negotiable:

- **`synchronize` is `false` in every environment.** No code path sets it to `true`, ever. Schema
  changes happen through migrations and nothing else.
- **`migrationsRun` is `false`.** Auto-run is gated to development and is never unconditional in
  staging or production, where migrations run as a **controlled, separate deploy step** before the
  new application version starts serving.
- The data source resolves every connection value through `ConfigService`. Grepping
  `data-source.ts` for `process.env` must return nothing outside the configuration module it
  delegates to.

The four scripts `T-C10-16` delivers: `migration:generate`, `migration:run`, `migration:revert`,
`migration:show` — all with `-d apps/api/src/data-source.ts`.

## Ephemeral database for acceptance runs

Once `apps/api-e2e` exists (`T-C10-06`) and the API talks to a database, acceptance runs need their
own instance. The shape that works:

1. Start a disposable PostgreSQL 18 (a service container, or the same compose file with a distinct
   volume and port).
2. Wait with `pg_isready`, not a fixed sleep.
3. Run the migration chain against it — the same chain production uses, never `synchronize`.
4. Run the suite.
5. Discard the volume.

Never point an acceptance run at a shared or long-lived database. The suites assert on state, and a
suite that depends on leftover rows is a suite that passes for the wrong reason.

## Backups and resets

No backup script exists and no environment needs one yet — there is no data anywhere. When a
long-lived environment appears, the operations are `pg_dump` for capture and `pg_restore` for
recovery, and a reset means **drop, recreate, re-run the migration chain** — never a manual `ALTER`
that leaves the schema in a state no migration can reproduce.

`FR-AUD-03` says no role, including System Administrator, may edit or delete history. That shapes
database operations too: a "fix" applied directly to the audit tables is a defect, not a repair.

## Rules

- **The migration chain is the schema.** If a database cannot be rebuilt from an empty state by
  running the chain, the chain is broken — fix it, do not patch the database.
- **Every schema change ships as a migration**, generated against the entity model, reviewed like
  code.
- **Credentials come from the environment.** `.env` is gitignored; `.env.example` lists the keys.
- **One database, schema per bounded context.** Cross-context references are indexed `uuid` columns
  with no foreign key (ADR-003) — the database expression of the module-boundary rule. Do not "fix"
  a missing FK by adding one.
