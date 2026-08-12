# Commands

All commands run from the Laravel app root (`arospe/`), the same directory as `artisan` and `phpunit.xml`.

## Run the full suite

```bash
php artisan test
```

Per the [pest-testing skill](../../../.claude/skills/pest-testing/SKILL.md), use `--compact` day-to-day for less noisy output:

```bash
php artisan test --compact
```

This runs both suites declared in [`phpunit.xml`](../../../phpunit.xml) (`Unit` → `tests/Unit`, `Feature` → `tests/Feature`).

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

Evaluate this only if suite run time becomes a real bottleneck; the current suite (3 test files) doesn't need it.

## Summary table

| Task | Command |
| --- | --- |
| Run everything | `php artisan test --compact` |
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

_Last updated: 2026-08-12 — Task 0003: recorded the `php -d memory_limit=3G` workaround for PHPStan's parallel workers crashing on this project's WSL2 dev setup._
