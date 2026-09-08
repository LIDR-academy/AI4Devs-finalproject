# Commands

All commands run from the Laravel app root (`arospe/`), the same directory as `artisan` and `phpunit.xml`.

## Database prerequisite

Every command on this page needs a live, reachable MySQL connection — this repo has no SQLite/in-memory fallback (see [`ai-spec/tasks/ci-database-connection-gap.md`](../../../ai-spec/tasks/ci-database-connection-gap.md) for why that matters). [`phpunit.xml`](../../../phpunit.xml) pins `<env name="DB_CONNECTION" value="mysql"/>` / `<env name="DB_DATABASE" value="testing"/>`, which take effect the moment PHPUnit/Pest boots and win over whatever `.env`/`.env.testing` says **on disk** — so every `php artisan test` run, local or CI, always targets a MySQL database named `testing` **unless something has already set `DB_DATABASE` at the OS process-environment level before PHPUnit boots**, in which case `phpunit.xml`'s `<env>` tag (`force` defaults to `false` — "set only if absent") leaves that already-set value alone instead of overwriting it. That qualifier is not academic — read it as "this is `testing`, except in the one case below where it isn't."

- **CI** provisions this automatically and always lands on literally `testing`: `.github/workflows/tests.yml` sets `DB_DATABASE: testing` as a **job-level** `env:` (not `.env` at all), which GitHub Actions exports into every step's process environment before any of them run — so `phpunit.xml`'s own `<env>` finds the variable already set to the identical value and is a no-op. See [pipeline-integration.md](pipeline-integration.md#current-state-real-as-of-this-writing) for the full setup.
- **Locally**, you need a MySQL instance reachable at whatever `DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD` your `.env` resolves to — Sail's `compose.yaml` mysql service satisfies this directly. **Whether `DB_DATABASE` itself resolves to literally `testing` or to a worktree's own database name depends on how PHP is launched, and the two cases genuinely differ — this is the qualifier above, spelled out:**
  - **A worktree running PHP natively on the host, with no Sail container in front of it (this repo's own default local setup)** always lands on literally `testing`, exactly like CI, because nothing pre-sets `DB_DATABASE` at the OS level before PHPUnit boots — `.env.testing`'s value is loaded by Laravel's own Dotenv *after* PHPUnit's `<env>` directives already ran, and Dotenv's immutable mode never overwrites an already-set variable. **For this case, `.env.testing` alone does not isolate `php artisan test` — see the bullet below for the required prefix**, and [worktree-databases.md](../worktree-databases.md#setup-opening-a-new-worktree) (its step 5 correction) for the full mechanism and its empirical verification.
  - **A worktree running inside its own Sail container** can differ, because the container's own environment plumbing may already carry `DB_DATABASE` from that worktree's `.env`/`.env.testing` before `php artisan test` ever runs inside it — in which case `phpunit.xml`'s pin is the one left alone, not the winner. Do not assume either outcome for a Sail-based invocation without checking; the two starting points (host-native vs. containerized) are not interchangeable for this specific question, even though every other command on this page behaves identically either way.
- **Running from more than one `git worktree` against the same MySQL instance, on a host-native (non-Sail) checkout?** `phpunit.xml`'s `DB_DATABASE=testing` pin is a real process environment variable and is **not** overridden by a worktree's own `.env.testing` — a `DB_DATABASE=testingN` in `.env.testing` isolates a bare `artisan migrate:fresh --env=testing`, but not `php artisan test` itself, since phpunit's `<env>` block already wins by the time Laravel's dotenv loader runs. **This is the same gap the bullet above names, stated as an operational rule: every `php artisan test` invocation from a host-native worktree must be prefixed explicitly**, which does take precedence over `phpunit.xml` because the variable is then already present at the OS level when PHPUnit boots:

  ```bash
  DB_DATABASE=testing1 php artisan test --compact
  ```

  See [worktree-databases.md](../worktree-databases.md) for why every worktree needs its own database name in the first place, and for the reproduction that confirmed a bare `.env.testing` is not sufficient on its own here.

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

`brianium/paratest` is a declared `require-dev` dependency (since the test-performance review that added this section) and CI runs the full suite with `--parallel` (see [`.github/workflows/tests.yml`](../../../.github/workflows/tests.yml) and [pipeline-integration.md](pipeline-integration.md)):

```bash
php artisan test --parallel
```

Measured on this repo's own suite (950 tests across `Unit`/`Feature`/`Browser`), sequential vs. `--parallel` on an 8-core Sail dev container:

| Suite | Sequential | `--parallel` | Speedup |
| --- | --- | --- | --- |
| `Unit` + `Feature` (920 tests) | ~4m 51s | ~1m 49s (8 processes) | ~2.7x |
| `Browser` (29 tests, 4 files) | ~49s | ~35s (4 processes) — 8 processes gains almost nothing beyond this | ~1.4x |
| Everything (950 tests) | ~5m 39s | ~2m 10s (8 processes) | ~2.6x |

The browser suite parallelizes far worse than `Unit`/`Feature`: it drives a real Chromium instance per worker, so beyond roughly one process per test **file** (4 here — see [frontend/playwright-setup.md](../frontend/playwright-setup.md#test-tagging-naming-and-parallelization)) extra processes mostly add browser-launch overhead rather than throughput. `--processes=4` for a Browser-only run is the sensible default; `--processes` omitted (auto-detects the host's core count) is fine for the combined run, since `Unit`/`Feature` dominates the total.

⚠️ **A `--parallel` run needs `storage/framework/views` (the compiled Blade cache) on a filesystem that tolerates concurrent writes from multiple processes.** On this project's Sail dev setup that directory sits inside the project's bind-mounted volume (`.:/var/www/html` in `compose.yaml`) by default, and concurrent `tempnam()`/`rename()` compiles into it through a WSL2 bind mount were **not reliable** — a batch of unrelated tests failed with `tempnam(): file created in the system's temporary directory`, deterministically, on some hosts. Fixed by giving `storage/framework/views` its own **named Docker volume** (`sail-views`, native to the container, not bind-mounted) in `compose.yaml`, plus a per-`ParallelTesting`-token subdirectory inside it (`app/Providers/AppServiceProvider.php::configureParallelTesting()`), mirroring how Laravel already isolates the test database and `Storage::fake()` per worker. See [errors-log.md](../../errors-log.md) for the full investigation — this is a **Sail/WSL2-specific** fix; CI's `ubuntu-latest` runner has no bind mount in the loop and was never exposed to it.

If you rebuild the Sail image after pulling this change, the named volume starts owned by `root` (Docker's default for a fresh volume) while `sail artisan` always runs as `$WWWUSER`/`sail` — `docker/8.5/start-container` now `chown`s it on every container start, so a plain `sail up -d --build` picks this up with no manual step.

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
| Parallel run | `php artisan test --parallel` (~2.6x faster on the full suite; see caveats above) |
| Static analysis (adjacent quality gate) | `composer types:check` (Larastan, see [conventions/base-standards.md](../../conventions/base-standards.md#quality-gates)) |
| Formatting (adjacent quality gate) | `vendor/bin/pint --dirty --format agent` |

## Environment note: PHP memory limits (PHPStan and `php artisan test`)

### PHPStan

`composer types:check` runs `phpstan analyse`, which analyses in parallel worker processes. On this project's WSL2 dev setup the default CLI `memory_limit` is not enough and the workers crash mid-run (an internal error, not a list of type errors). Raise the limit for that one invocation rather than editing `php.ini`:

```bash
php -d memory_limit=3G vendor/bin/phpstan analyse
```

This is an environment quirk, not a project requirement — CI runs the plain `composer types:check` successfully. If you see PHPStan die without reporting errors, try this before assuming the analysis is broken.

### `php artisan test`, unscoped, on a host-native worktree

Story 0021's Phase 5 code review (finding F5) hit the identical class of failure on the **other** long-running, memory-hungry command on this page: an **unscoped** `php artisan test` — the full, all-three-suites run the [quality gates](../../conventions/base-standards.md#quality-gates) require before a story is declared done — fatals with `Allowed memory size exhausted` at PHP CLI's default `memory_limit=128M`, on this same host-native (no Sail) worktree setup. Reproduced deterministically twice, byte-identical, including once with this story's own `tests/Feature/Components`/`tests/Browser/Components` excluded — so this is an environment ceiling, not a leak in any one story's tests, and a future reviewer following this page's own documented commands should not read it as a regression.

Raise the limit the same way as PHPStan above, **with one difference that is not optional**: invoke `vendor/bin/pest` directly, never `php artisan test`.

```bash
DB_DATABASE=testing<N> php -d memory_limit=1G vendor/bin/pest --compact
```

`php artisan test` launches Pest as a **subprocess** of the `artisan` process (`Illuminate\Foundation\Console\TestCommand` shells out to `vendor/bin/pest` under the hood) — a child process does not inherit a `-d` flag passed to its *parent's* `php` invocation, so `php -d memory_limit=1G artisan test` raises the limit for the outer `artisan` process and leaves the inner Pest process, the one that actually runs every test, at the unmodified 128M default. Calling `vendor/bin/pest` directly is what actually raises the limit where it is enforced. The `DB_DATABASE=testing<N>` prefix is this same command's other mandatory half on a host-native worktree — see the [Database prerequisite](#database-prerequisite) section above; both prefixes are needed together on this environment, and dropping either one silently reintroduces a different failure (a shared-database collision, or this memory fatal).

Same disclaimer as PHPStan's: this is an environment quirk of this specific host-native WSL2 setup, not a project requirement — CI's `services.mysql` job runs the plain unscoped `php artisan test` successfully at its default memory limit. If an unscoped run fatals with no test output and no list of failures, try this before assuming the suite itself is broken.

_Last updated: 2026-08-31 — Story 0021 (Shared WYSIWYG rich-text editor component — frontend), Phase 6. Two additions to this page's "Database prerequisite" and memory-limit sections, both closing findings this story's Phase 5 code review left explicitly deferred to `docs-keeper`. **Database prerequisite**: nuanced the opening claim that "every `php artisan test` run, local or CI, always targets a MySQL database named `testing`" — true for CI (a job-level `env:`, verified against `.github/workflows/tests.yml`) and true for a host-native worktree with no explicit override, but not guaranteed for a Sail-based worktree, whose container environment plumbing may already carry a different `DB_DATABASE` before PHPUnit boots — reconciling this page's blanket claim with [worktree-databases.md](../worktree-databases.md)'s own Phase 3 correction (finding N7), which had come to read as contradicting it. **Memory limits**: renamed the PHPStan-only section and added the `php artisan test`/`vendor/bin/pest` sibling (finding F5) — an unscoped run fatals at PHP CLI's default 128M on this same host-native setup, reproduced deterministically and confirmed unrelated to any one story's tests, with the exact workaround command and why it must invoke `vendor/bin/pest` directly rather than `php artisan test` (a subprocess does not inherit its parent's `-d` flag). **Verified as unchanged rather than assumed:** every other section on this page (single-file/single-test commands, coverage, `--parallel` and its own Sail/WSL2 caveat) — this story adds no route, no migration, and changes no CI workflow file.

_Previously: 2026-08-28 — Test-suite parallelization: rewrote the "Run in parallel" section, which had said `brianium/paratest` was not installed and that `--parallel` would error — the package is now a declared `require-dev` dependency and CI runs `--parallel`. Added the measured sequential-vs-parallel timing table (Unit/Feature ~2.7x, Browser ~1.4x, everything ~2.6x) and the ⚠️ for the Sail/WSL2-specific fix this required (`storage/framework/views` moved to a named Docker volume, per-token subdirectory via `AppServiceProvider::configureParallelTesting()`) — see [errors-log.md](../../errors-log.md) for the full investigation, including why the fix is Sail-only and does not apply to CI's runner._

_Previously, 2026-08-26 — CI database connection gap (`ai-spec/tasks/ci-database-connection-gap.md`): added the "Database prerequisite" section — every command on this page needs a live MySQL connection, `phpunit.xml` pins `DB_CONNECTION`/`DB_DATABASE` ahead of any `.env`/`.env.testing`, and a `DB_DATABASE` override for `php artisan test` must be a real shell environment variable, not a worktree's `.env.testing` entry, since PHPUnit's `<env>` block already wins by the time Laravel's dotenv loader runs. Closes the doc-pass item this task's checklist left open._

_Previously, 2026-08-16 — Task 0006b: `php artisan test` now runs three suites, not two (the `Browser` suite launches a real browser and needs the Playwright binaries present); added the `--testsuite=` command and refreshed the stale "3 test files" parallelization note._

_Previously, 2026-08-12 — Task 0003: recorded the `php -d memory_limit=3G` workaround for PHPStan's parallel workers crashing on this project's WSL2 dev setup._
