# Infrastructure fix: no test suite can open a database connection (local fresh setup or CI)

Not a PRD-derived user story — deliberately outside the `00XX-` task numbering. Found while
debating an Epic 2 story in Three Amigos Phase 1; confirmed here by reading the actual config,
not taken on the reporting agent's word.

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

Two parts, both needed — local dev/fresh-clone and CI are currently broken in different ways
that happen to share the same root cause (`.env.example`).

1. **CI (`\.github/workflows/tests.yml`)**: add a MySQL service container (`mysql:8.4`, matching
   `compose.yaml`), with a healthcheck, and set `DB_*` env vars for the job to match it (host
   `127.0.0.1`, the service's mapped port, a database — `testing`, matching what `phpunit.xml`
   already expects — a username/password). This reuses the same "testing" database name the
   project's own `docker/mysql/create-testing-database.sh` already establishes as the
   convention, so `phpunit.xml`'s existing `DB_DATABASE=testing` override becomes correct
   instead of accidentally-almost-right. `docs/testing/ci/pipeline-integration.md` should be
   updated once this lands, since it currently describes the `Run Tests` step without
   mentioning DB provisioning at all.
2. **`.env.example` / local fresh-clone path**: decide and document one of:
   - Point `.env.example` at MySQL by default (matching the project's real architecture and
     this developer's real `.env`), with `DB_HOST=127.0.0.1`/Sail defaults, and document that
     `composer run setup` / a fresh clone requires either Sail (`compose.yaml`) or a locally
     running MySQL instance before running migrations — no silent SQLite fallback.
   - Or, if a zero-dependency local fallback is wanted, keep SQLite as the default but make it
     actually work: point `DB_DATABASE` at a real path (`database/database.sqlite`), add that
     file to `.gitignore`, and add a file-creation step (`touch database/database.sqlite`
     equivalent) to both `composer.json`'s `setup` script and any onboarding docs — while
     keeping CI on MySQL per (1) for architecture parity, since this repo's schema/security docs
     already reason about MySQL-specific behavior (collation, index costs) that SQLite doesn't
     replicate.

Either way, `.env.example`'s `DB_CONNECTION=sqlite` with everything else commented out must not
remain the shipped default — it currently guarantees a first-migration failure with no
recovery step documented anywhere in the repo.

## Files to change

- `.env.example` — DB connection defaults (whichever option above is chosen).
- `.github/workflows/tests.yml` — add a MySQL `services:` block + matching `DB_*` job/step env.
- `composer.json` — `scripts.setup`, if the SQLite-fallback option is chosen (add file creation).
- `.gitignore` — add `database/database.sqlite` (or equivalent), if the SQLite-fallback option
  is chosen.
- `docs/testing/ci/pipeline-integration.md` — document the real DB provisioning step once CI is
  fixed; it currently omits DB setup entirely from its description of the `Run Tests` step.
- `docs/testing/ci/commands.md` — cross-reference or note the DB prerequisite if not already
  implied.
- Possibly `README.md` — if it documents a non-Sail local setup path, it needs the same fix.

Not fixed here — this file is a scoping/documentation pass only, per the requesting task. No
application code, workflow YAML, or config was changed as part of writing this file.
