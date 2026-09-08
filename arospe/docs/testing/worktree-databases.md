# Per-worktree isolated testing databases

## Why this exists

This repo's `phpunit.xml` sets `DB_DATABASE=testing`, but that override only takes effect **when Pest/PHPUnit itself boots** — it does nothing for a bare `php artisan migrate:fresh` (or any other artisan command) run directly from a shell, `--env=testing` included. Laravel's `--env=testing` flag looks for a `.env.testing` file and, if none exists, **silently falls back to the plain `.env`** — which in this project points at `DB_DATABASE=arospe`, the real development database.

That gap is what wiped the shared `arospe` database twice on 2026-08-24: an agent iterating on the test suite hit a failure it (wrongly) diagnosed as "the test DB is corrupted", ran `artisan migrate:fresh --env=testing --force` to reset it, and — because `.env.testing` did not exist — dropped and recreated every table in the real dev database instead. See [`errors-log.md`](../errors-log.md#a-missing-envtesting-file-let-a-self-healing-migratefresh-wipe-the-shared-dev-database--2026-08-26) for the full incident.

The fix: every checkout of this repo — the main checkout **and every `git worktree`** — must have its own `.env.testing` pointing `DB_DATABASE` at a database name **nobody else uses**. `.env.testing` is gitignored (`.gitignore`), so this is a per-checkout, untracked file — it is never committed and never shared between worktrees.

## Why one database per worktree, not one shared `testing` database

Multiple worktrees run their own Sail stack against the **same** `arospe-mysql-1` container (`docker compose` in this repo is not per-worktree). If every worktree's `.env.testing` pointed at the same `testing` database, two worktrees running `php artisan test` concurrently would truncate and reseed the same tables into each other — the exact class of failure this whole convention exists to prevent, just moved one level down.

## Setup: opening a new worktree

1. Copy `.env` to `.env.testing` in the new worktree (or start from `.env.testing.example` if the repo ships one — it doesn't today, so copy `.env`). **Copy the whole file, not just the `DB_*` lines** — `APP_KEY` in particular must come along; a `.env.testing` missing it produces a wide, misleading spray of failures across unrelated Feature test files (`No application encryption key has been specified`, often surfacing as a wrapping `Illuminate\View\ViewException` instead) that has nothing to do with whatever those tests are actually about. See the [errors-log.md](../errors-log.md#a-env-testing-missing-most-of-envs-content-produced-a-wide-spray-of-unrelated-looking-feature-test-failures--2026-09-06) entry for the full failure shape and why it's easy to misdiagnose as a real regression.
2. Pick a database name that doesn't collide with any other active worktree or the main checkout: `testing`, `testing1`, `testing2`, … A quick check: `docker exec arospe-mysql-1 mysql -usail -ppassword -e "SHOW DATABASES;"`.
3. In that worktree's `.env.testing`, set:
   ```
   APP_ENV=testing
   DB_DATABASE=testing<N>
   ```
   (keep every other value — `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` — identical to `.env`, since all worktrees share the one `arospe-mysql-1` container).
4. Create the database and migrate it:
   ```
   docker exec arospe-mysql-1 mysql -usail -ppassword -e "CREATE DATABASE IF NOT EXISTS testing<N>;"
   docker exec arospe-laravel.test-1 php artisan migrate:fresh --env=testing --force
   ```
   (this needs to run from inside a container that has this worktree's code mounted — if worktrees don't each have their own Sail stack, run migrations through `php artisan migrate:fresh --database=testing --force` after temporarily pointing `.env`'s `DB_DATABASE` at the worktree's testing DB, or via `php -d ... artisan` with `DB_DATABASE=testing<N>` in the environment — whatever this worktree's actual container wiring is, the destination database must be `testing<N>`, never `arospe`.)
5. From then on, `./vendor/bin/sail artisan test`, `php artisan test`, and any `artisan migrate:fresh --env=testing` run from this worktree land in `testing<N>` only — **with one execution-path exception, see the correction below.**
6. **Build frontend assets and link storage once, before running any Feature test that renders a real page or serves an uploaded file** — a fresh `git worktree` checkout has neither `public/build/` (the Vite manifest) nor the `public/storage` symlink, and both are gitignored, never carried over from the main checkout:
   ```
   npm install
   npm run build
   php artisan storage:link
   ```
   Skipping this is a second, independent way to fail nearly every non-trivial Feature test with a misleading error (`Vite manifest not found at: public/build/manifest.json`), distinct from the `APP_KEY` gap in step 1 above — see the same errors-log entry for both failure shapes together.

> **Correction — 2026-08-31, story 0021.** Step 5's claim about `php artisan test` is true only when the process's OS-level environment already carries the worktree's `DB_DATABASE` before PHP starts — which is exactly what happens under Sail, where `docker compose`'s `environment:`/`env_file` wiring bakes the container's own `.env` values into the process environment before `php artisan test` ever runs, so `phpunit.xml`'s `<env name="DB_DATABASE" value="testing"/>` (`force` defaults to `false`, i.e. "set only if absent") finds the variable already set and leaves it alone. **It does not hold for a worktree running PHP natively on the host** (no Sail — e.g. because the shared `arospe-mysql-1`/`arospe-laravel.test-1` containers are already bound to another checkout's ports): there, nothing sets `DB_DATABASE` at the OS level before PHPUnit boots, `.env.testing`'s value is loaded by Laravel's own (immutable-mode) Dotenv *after* PHPUnit's `<env>` directives already ran, and Dotenv's immutable mode never overwrites an already-set variable — so `phpunit.xml`'s `testing` wins outright, silently, regardless of what `.env.testing` says. Verified by reproduction in this story's worktree: a Pest test asserting `DB::connection()->getDatabaseName()` returned `testing` (the shared database) with `.env.testing` pointing at `testing3`, and a real Feature test run hit a live deadlock against the shared `testing` database as a direct consequence — confirmed fixed by prefixing the invocation with a real process-level override, `DB_DATABASE=testing3 php artisan test`, which is *not* overridden because the variable is then already present when PHPUnit boots. **The rule for a host-native worktree: every `php artisan test` invocation must be prefixed with `DB_DATABASE=testing<N>` explicitly** (bare `--env=testing` on `migrate:fresh` is unaffected by this specific gap, since that command never goes through `phpunit.xml` at all — see the section above). `.env.testing` alone is not sufficient for the `php artisan test` path off Sail.

## Cleanup: removing a worktree

Before (or immediately after) `git worktree remove`:

1. Drop the database: `docker exec arospe-mysql-1 mysql -usail -ppassword -e "DROP DATABASE IF EXISTS testing<N>;"`.
2. Delete the worktree's `.env.testing` (it's gitignored and untracked, so this is just local cleanup — nothing to revert in git).

Leaving a stray `testingN` database behind is harmless but wasteful; leaving a stray `.env.testing` behind is harmless once the worktree itself is gone. Do both anyway so the database list stays legible for whoever runs `SHOW DATABASES` next.

## The rule this whole page exists to enforce

**`DB_DATABASE` in every `.env.testing` must never be `arospe`, and must never match another active worktree's `.env.testing`.** If you're not sure a worktree still has a live `.env.testing` pointing at a database, check before reusing a name — the failure mode when two worktrees collide is silent data loss in whichever one loses the race, with no error from either side.

_Last updated: 2026-09-06 — Story 0032 (Shipping geography catalog seed). Added step 1's warning about copying `.env.testing`'s full content (not just `DB_*`) and a new step 6 (`npm run build` + `storage:link`, once per worktree) after the incident recorded in [`errors-log.md`](../errors-log.md#a-env-testing-missing-most-of-envs-content-produced-a-wide-spray-of-unrelated-looking-feature-test-failures--2026-09-06)._

_Previously: 2026-08-26 — created after the incident recorded in [`errors-log.md`](../errors-log.md#a-missing-envtesting-file-let-a-self-healing-migratefresh-wipe-the-shared-dev-database--2026-08-26)._
