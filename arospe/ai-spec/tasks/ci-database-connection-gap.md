# Infrastructure fix: no test suite can open a database connection (local fresh setup or CI)

Not a PRD-derived user story — deliberately outside the `00XX-` task numbering. Found while
debating an Epic 2 story in Three Amigos Phase 1; confirmed here by reading the actual config,
not taken on the reporting agent's word.

> **Status: fixed — 2026-08-19.** MySQL is this project's only supported database; a SQLite
> fallback was never a real option (confirmed by the project owner, not just inferred from
> `docs/architecture/overview.md`). `.env.example`, `phpunit.xml` and
> `.github/workflows/tests.yml` were updated to make MySQL the actual, working default end to
> end — see [Recommended fix](#recommended-fix) below, which now describes what was **done**,
> not a choice between options. `docs/testing/ci/pipeline-integration.md` and
> `docs/testing/ci/commands.md` still need the doc pass noted in
> [Files to change](#files-to-change).

## Problem

Both a fresh local clone and CI (`.github/workflows/tests.yml`) start from `.env.example`,
which selects `DB_CONNECTION=sqlite` with no `DB_DATABASE` path override. Laravel's SQLite
connector does **not** auto-create a missing database file — `SQLiteConnector::parseDatabasePath()`
(`vendor/laravel/framework/src/Illuminate/Database/Connectors/SQLiteConnector.php`) calls
`realpath($path)` and throws `SQLiteDatabaseDoesNotExistException` when it returns `false`.
No `database/database.sqlite` file exists in this repo, nothing in `.env.example`, the CI
workflow, or `composer.json`'s `setup` script creates one. So any `php artisan migrate` /
`php artisan test` run starting from a clean checkout fails at the very first migration with
`SQLiteDatabaseDoesNotExistException`, before a single test executes.

This is worse than "CI never provisions MySQL" — even the SQLite fallback CI implicitly relies
on is broken, because nothing ever creates the file.

## Evidence

- **`.env.example`**: `DB_CONNECTION=sqlite`, with `DB_HOST`/`DB_PORT`/`DB_DATABASE`/`DB_USERNAME`/`DB_PASSWORD`
  all commented out (the stock, unmodified Laravel skeleton defaults — never adjusted for this
  project's real MySQL-based stack).
- **`config/database.php`**: sqlite connection is `'database' => env('DB_DATABASE', database_path('database.sqlite'))`
  — with `.env.example` as-is, that resolves to `database/database.sqlite`, which does not exist
  in the working tree (`ls database/` — no `.sqlite` file) and is not `.gitignore`d as a
  generated file either.
- **`phpunit.xml`**: overrides `DB_DATABASE=testing` for test runs but never overrides
  `DB_CONNECTION`. Combined with the inherited `sqlite` connection, `testing` is treated as a
  relative sqlite file path — also nonexistent, also throws the same exception. The literal
  value `testing` is not a coincidence: it matches the database name
  `docker/mysql/create-testing-database.sh` provisions (`CREATE DATABASE IF NOT EXISTS testing`)
  for Sail's MySQL container — strong evidence `phpunit.xml` was written assuming a MySQL
  connection, and `.env.example` was simply never updated to match.
- **`compose.yaml`** (Sail): defines a real `mysql:8.4` service, provisions both the app's dev
  database and a separate `testing` database via `docker/mysql/create-testing-database.sh`
  mounted as a MySQL entrypoint script. This is real infrastructure for local dev, but Sail is
  opt-in — nothing requires a contributor to use it, and `.env.example` doesn't point at it.
- **This repo's own real (gitignored) `.env`**: `DB_CONNECTION=mysql`, `DB_HOST=mysql`,
  `DB_PORT=3306`, `DB_DATABASE=arospe`, `DB_USERNAME=sail` — i.e., the actual working local
  setup already diverges from `.env.example` by hand, which is exactly the kind of drift that
  breaks on a fresh clone.
- **`.github/workflows/tests.yml`**: no `services:` block (no MySQL, no anything DB-related),
  and no step touches/creates a SQLite file. Its only DB-adjacent action is
  `cp .env.example .env`, which reproduces the broken sqlite config verbatim, followed directly
  by `php artisan test`.
- **`composer.json`'s `setup` script**: `copy('.env.example', '.env')` → `key:generate` →
  `migrate --force` — same gap for a first-time local contributor who doesn't use Sail.
- **`docs/testing/ci/commands.md`** and **`docs/testing/ci/pipeline-integration.md`**: both
  describe running `php artisan test` (and a proposed `--coverage --min=80` gate) as if a
  working DB connection is a given. Neither documents what that connection actually is or how
  it's provisioned — because today, nothing provisions it.
- **`docs/architecture/overview.md`**: names MySQL (`mysql:8.4`) as the app's real runtime
  database dependency — the stated architecture is MySQL, not SQLite, which favors fixing this
  with a real MySQL connection in CI (matching production/dev parity) over switching to SQLite
  purely to make CI pass.

## Recommended fix

**MySQL only — a SQLite fallback was never on the table.** This project has exactly one
supported database engine; an option that made SQLite "actually work" as a zero-dependency
local fallback (considered in an earlier draft of this file) is rejected outright, not merely
deprioritized — any database connection that isn't MySQL is wrong for this repo, full stop, per
the same architecture `docs/architecture/overview.md` already names and this repo's
schema/security docs already reason about (collation, MySQL-specific index costs) in ways
SQLite wouldn't replicate anyway. Two parts, both needed, both **done**:

1. **CI (`.github/workflows/tests.yml`)** — added a `services.mysql` container (`mysql:8.4`,
   matching `compose.yaml`), with a `mysqladmin ping` healthcheck the runner waits on
   automatically, and a job-level `env:` block pointing `DB_CONNECTION`/`DB_HOST`/`DB_PORT`/
   `DB_DATABASE`/`DB_USERNAME`/`DB_PASSWORD` at it (`127.0.0.1:3306`, database `testing`, user
   `root`, empty password via `MYSQL_ALLOW_EMPTY_PASSWORD`). Job-level env vars are real
   process environment variables, so they take precedence over whatever `cp .env.example .env`
   writes to disk — no `.env` edit needed in the workflow. Also fixed the pre-existing `npm i` →
   `npm ci` gap in the same step this file's audit had already flagged as belonging to
   "whichever change next touches this file" (see
   [`docs/security/ci-workflow-hardening.md`](../../docs/security/ci-workflow-hardening.md)).
2. **`.env.example`** — `DB_CONNECTION` changed from `sqlite` to `mysql`, and `DB_HOST`/
   `DB_PORT` uncommented to Sail's real networking values (`mysql`/`3306` — the Docker service
   name from `compose.yaml`, not a secret). `DB_DATABASE`/`DB_USERNAME`/`DB_PASSWORD` stay
   commented deliberately: per `README.md`, working credentials are requested privately from
   Angel, never guessed or invented into a committed file — Laravel's own `mysql` connection
   defaults (`config/database.php`) are also non-functional placeholders, which is consistent
   with that convention rather than a gap.
3. **`phpunit.xml`** — added `<env name="DB_CONNECTION" value="mysql"/>` alongside the existing
   `DB_DATABASE=testing` override, so every test run is pinned to MySQL regardless of what a
   contributor's real `.env` says, the same way the database name already was.

Verified locally post-fix: `sail artisan test --compact --filter=ExampleTest` passes against the
Sail `mysql` container with the new `phpunit.xml` override in place.

## Files to change

- [x] `.env.example` — `DB_CONNECTION=mysql`, `DB_HOST=mysql`, `DB_PORT=3306` uncommented;
      `DB_DATABASE`/`DB_USERNAME`/`DB_PASSWORD` deliberately left as commented placeholders.
- [x] `phpunit.xml` — added `DB_CONNECTION=mysql` next to the existing `DB_DATABASE=testing`.
- [x] `.github/workflows/tests.yml` — added the MySQL `services:` block, job-level `DB_*` env,
      and fixed `npm i` → `npm ci` in the same step.
- [ ] `docs/testing/ci/pipeline-integration.md` — still needs to document the real DB
      provisioning step; it currently describes the `Run Tests` step without mentioning it.
- [ ] `docs/testing/ci/commands.md` — still needs a cross-reference/note of the DB prerequisite.
- Not needed: `composer.json` / `.gitignore` (SQLite-fallback-only items, moot now that the
  fallback option is rejected); `README.md` (already correctly documents the Sail/MySQL-only
  local setup path and the "request credentials from Angel" convention — nothing to change).
