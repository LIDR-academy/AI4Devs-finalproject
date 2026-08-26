# Per-worktree isolated testing databases

## Why this exists

This repo's `phpunit.xml` sets `DB_DATABASE=testing`, but that override only takes effect **when Pest/PHPUnit itself boots** — it does nothing for a bare `php artisan migrate:fresh` (or any other artisan command) run directly from a shell, `--env=testing` included. Laravel's `--env=testing` flag looks for a `.env.testing` file and, if none exists, **silently falls back to the plain `.env`** — which in this project points at `DB_DATABASE=arospe`, the real development database.

That gap is what wiped the shared `arospe` database twice on 2026-08-24: an agent iterating on the test suite hit a failure it (wrongly) diagnosed as "the test DB is corrupted", ran `artisan migrate:fresh --env=testing --force` to reset it, and — because `.env.testing` did not exist — dropped and recreated every table in the real dev database instead. See [`errors-log.md`](../errors-log.md#a-missing-envtesting-file-let-a-self-healing-migratefresh-wipe-the-shared-dev-database--2026-08-26) for the full incident.

The fix: every checkout of this repo — the main checkout **and every `git worktree`** — must have its own `.env.testing` pointing `DB_DATABASE` at a database name **nobody else uses**. `.env.testing` is gitignored (`.gitignore`), so this is a per-checkout, untracked file — it is never committed and never shared between worktrees.

## Why one database per worktree, not one shared `testing` database

Multiple worktrees run their own Sail stack against the **same** `arospe-mysql-1` container (`docker compose` in this repo is not per-worktree). If every worktree's `.env.testing` pointed at the same `testing` database, two worktrees running `php artisan test` concurrently would truncate and reseed the same tables into each other — the exact class of failure this whole convention exists to prevent, just moved one level down.

## Setup: opening a new worktree

1. Copy `.env` to `.env.testing` in the new worktree (or start from `.env.testing.example` if the repo ships one — it doesn't today, so copy `.env`).
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
5. From then on, `./vendor/bin/sail artisan test`, `php artisan test`, and any `artisan migrate:fresh --env=testing` run from this worktree land in `testing<N>` only.

## Cleanup: removing a worktree

Before (or immediately after) `git worktree remove`:

1. Drop the database: `docker exec arospe-mysql-1 mysql -usail -ppassword -e "DROP DATABASE IF EXISTS testing<N>;"`.
2. Delete the worktree's `.env.testing` (it's gitignored and untracked, so this is just local cleanup — nothing to revert in git).

Leaving a stray `testingN` database behind is harmless but wasteful; leaving a stray `.env.testing` behind is harmless once the worktree itself is gone. Do both anyway so the database list stays legible for whoever runs `SHOW DATABASES` next.

## The rule this whole page exists to enforce

**`DB_DATABASE` in every `.env.testing` must never be `arospe`, and must never match another active worktree's `.env.testing`.** If you're not sure a worktree still has a live `.env.testing` pointing at a database, check before reusing a name — the failure mode when two worktrees collide is silent data loss in whichever one loses the race, with no error from either side.

_Last updated: 2026-08-26 — created after the incident recorded in [`errors-log.md`](../errors-log.md#a-missing-envtesting-file-let-a-self-healing-migratefresh-wipe-the-shared-dev-database--2026-08-26)._
