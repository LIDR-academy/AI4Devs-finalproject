# Commands

All commands run from the Laravel app root (`arospe/`), the same directory as `artisan` and `phpunit.xml`.

## Database prerequisite

Every command on this page needs a live, reachable MySQL connection — this repo has no SQLite/in-memory fallback (see [`ai-spec/tasks/ci-database-connection-gap.md`](../../../ai-spec/tasks/ci-database-connection-gap.md) for why that matters). [`phpunit.xml`](../../../phpunit.xml) pins `<env name="DB_CONNECTION" value="mysql"/>` / `<env name="DB_DATABASE" value="testing"/>`, which take effect the moment PHPUnit/Pest boots and win over whatever your real `.env` (or `.env.testing`) says — so every `php artisan test` run, local or CI, always targets a MySQL database named `testing` regardless of which environment file is on disk.

- **CI** provisions this automatically: `.github/workflows/tests.yml` runs a `services.mysql` container and never touches `.env` for it — see [pipeline-integration.md](pipeline-integration.md#current-state-real-as-of-this-writing) for the full setup.
- **Locally**, you need a MySQL instance reachable at whatever `DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD` your `.env` resolves to (`DB_CONNECTION`/`DB_DATABASE` themselves get overridden by `phpunit.xml` regardless) — Sail's `compose.yaml` mysql service satisfies this directly.
- **Running from more than one `git worktree` against the same MySQL instance?** `phpunit.xml`'s `DB_DATABASE=testing` pin is a real process environment variable and is **not** overridden by a worktree's own `.env.testing` — a `DB_DATABASE=testingN` in `.env.testing` isolates a bare `artisan migrate:fresh --env=testing`, but not `php artisan test` itself, since phpunit's `<env>` block already wins by the time Laravel's dotenv loader runs. To point one `php artisan test` run at a different database, override it as an actual shell environment variable, which does take precedence over `phpunit.xml`:

  ```bash
  DB_DATABASE=testing1 php artisan test --compact
  ```

  See [worktree-databases.md](../worktree-databases.md) for why every worktree needs its own database name in the first place.

## Run the full suite

```bash
php artisan test
```

Per the [pest-testing skill](../../../.claude/skills/pest-testing/SKILL.md), use `--compact` day-to-day for less noisy output:

```bash
php artisan test --compact
```

This runs all three suites declared in [`phpunit.xml`](../../../phpunit.xml) (`Unit` → `tests/Unit`, `Feature` → `tests/Feature`, `Browser` → `tests/Browser`). Since task 0006b, a plain `php artisan test` therefore launches a real browser — it needs the Playwright binaries present on the machine (`npx playwright install`, see [frontend/playwright-setup.md](../frontend/playwright-setup.md)); without them the run **fails**, it does not skip.

## Run one suite

```bash
php artisan test --compact --testsuite=Browser
```

Useful for the browser suite in particular, which is the slow one; `--testsuite=Unit` / `--testsuite=Feature` skip the browser entirely.

## Run a single file

```bash
php artisan test --compact tests/Feature/DashboardTest.php
```

## Run a single test

By name (matches the `test('...')`/`it('...')` description):

```bash
php artisan test --compact --filter="authenticated users can visit the dashboard"
```

Scoped to one file plus a filter, when the description isn't unique across the suite:

```bash
php artisan test --compact tests/Feature/DashboardTest.php --filter="authenticated users can visit the dashboard"
```

## Generate a coverage report

Requires a coverage driver — CI already installs one (`shivammathur/setup-php` with `coverage: xdebug`, see [`.github/workflows/tests.yml`](../../../.github/workflows/tests.yml)); locally you need Xdebug or PCOV enabled.

```bash
php artisan test --coverage
```

Terminal summary only shows percentages per file. For a browsable HTML report:

```bash
php artisan test --coverage-html=coverage-report
```

Then open `coverage-report/index.html`.

## Enforce a minimum coverage threshold

```bash
php artisan test --coverage --min=80
```

This **fails the command** (non-zero exit code) if total coverage drops below 80% — which is what makes it usable as a CI gate (see [pipeline-integration.md](pipeline-integration.md)). Treat 80% as a **floor**, not a target: don't add trivial/meaningless tests just to clear this number (see [philosophy.md](../philosophy.md) and [qa/what-not-to-test.md](../qa/what-not-to-test.md)). If a legitimate change drops coverage below 80% because it added real, hard-to-test edge-case code, that's a signal to write the missing test — not to lower the threshold or pad it with a throwaway one.

## Run in parallel

Laravel's `--parallel` flag requires `brianium/paratest`, which **is not currently installed** in this project (not present in `composer.json`). Don't add `--parallel` to CI or local docs as if it already works — it will error (`Please install the brianium/paratest package...`) until that dependency is added deliberately:

```bash
composer require brianium/paratest --dev
php artisan test --parallel
```

Evaluate this only if suite run time becomes a real bottleneck. It isn't one today, and note that the browser suite — the obvious candidate for wanting parallelism — drives a real browser, so it is the part least likely to benefit from naively forking processes. Pest's own test **sharding** is likewise not configured here (see [frontend/playwright-setup.md](../frontend/playwright-setup.md#test-tagging-naming-and-parallelization)).

## Summary table

| Task | Command |
| --- | --- |
| Run everything (`Unit` + `Feature` + `Browser`) | `php artisan test --compact` |
| Run one suite | `php artisan test --compact --testsuite=Browser` |
| Run one file | `php artisan test --compact tests/Feature/DashboardTest.php` |
| Run one test by name | `php artisan test --compact --filter="<test description>"` |
| Coverage summary (terminal) | `php artisan test --coverage` |
| Coverage report (HTML) | `php artisan test --coverage-html=coverage-report` |
| Enforce a coverage floor (CI gate) | `php artisan test --coverage --min=80` |
| Parallel run | Requires `composer require brianium/paratest --dev` first, then `php artisan test --parallel` |
| Static analysis (adjacent quality gate) | `composer types:check` (Larastan, see [conventions/base-standards.md](../../conventions/base-standards.md#quality-gates)) |
| Formatting (adjacent quality gate) | `vendor/bin/pint --dirty --format agent` |

## Environment note: PHPStan and the PHP memory limit

`composer types:check` runs `phpstan analyse`, which analyses in parallel worker processes. On this project's WSL2 dev setup the default CLI `memory_limit` is not enough and the workers crash mid-run (an internal error, not a list of type errors). Raise the limit for that one invocation rather than editing `php.ini`:

```bash
php -d memory_limit=3G vendor/bin/phpstan analyse
```

This is an environment quirk, not a project requirement — CI runs the plain `composer types:check` successfully. If you see PHPStan die without reporting errors, try this before assuming the analysis is broken.

_Last updated: 2026-08-26 — CI database connection gap (`ai-spec/tasks/ci-database-connection-gap.md`): added the "Database prerequisite" section — every command on this page needs a live MySQL connection, `phpunit.xml` pins `DB_CONNECTION`/`DB_DATABASE` ahead of any `.env`/`.env.testing`, and a `DB_DATABASE` override for `php artisan test` must be a real shell environment variable, not a worktree's `.env.testing` entry, since PHPUnit's `<env>` block already wins by the time Laravel's dotenv loader runs. Closes the doc-pass item this task's checklist left open._

_Previously, 2026-08-16 — Task 0006b: `php artisan test` now runs three suites, not two (the `Browser` suite launches a real browser and needs the Playwright binaries present); added the `--testsuite=` command and refreshed the stale "3 test files" parallelization note._

_Previously, 2026-08-12 — Task 0003: recorded the `php -d memory_limit=3G` workaround for PHPStan's parallel workers crashing on this project's WSL2 dev setup._
