# CI Workflow Hardening

Rules governing `.github/workflows/*.yml` in this repo, established by the Phase 4 audit of task
**0006b** (browser-test infrastructure) — the first change to add a CI step that **downloads and
executes a third-party binary** (`npx playwright install --with-deps chromium`).

Nothing here is about application code. It is about the trust boundary of the GitHub-hosted runner:
what executes there, with what privileges, and in what order relative to the repository's secrets.

## Table of Contents

- [A step that runs a dependency's binary must resolve it locally, never from the registry](#a-step-that-runs-a-dependencys-binary-must-resolve-it-locally-never-from-the-registry)
- [The lockfile is the pin — a CI step that depends on it must be installed with `npm ci`](#the-lockfile-is-the-pin--a-ci-step-that-depends-on-it-must-be-installed-with-npm-ci)
- [Untrusted install steps run *before* secrets are written to the runner's disk](#untrusted-install-steps-run-before-secrets-are-written-to-the-runners-disk)
- [Test artifacts are only safe while nothing uploads them](#test-artifacts-are-only-safe-while-nothing-uploads-them)
- [Verified safe: the browser suite cannot reach a non-`testing` database](#verified-safe-the-browser-suite-cannot-reach-a-non-testing-database)

## A step that runs a dependency's binary must resolve it locally, never from the registry

This repo pins every GitHub Action by **commit SHA** (`actions/checkout@9c091bb…`,
`shivammathur/setup-php@f3e473d…`, `actions/setup-node@48b55a0…`). That convention covers `uses:`
steps only — a `run:` step that invokes a package binary has its own, separate pinning question, and
it is easy to assume the SHA convention already answered it.

For Playwright the pin chain is genuinely solid **as long as the binary resolves locally**:

- `package-lock.json` pins `playwright` to `1.61.1` with an `integrity` hash;
- `playwright-core@1.61.1`'s `browsers.json` hardcodes `chromium` revision `1228`
  (Chrome for Testing 149.0.7827.55).

So the downloaded browser build is deterministic and transitively pinned — it is *not* "latest".
The weak link is `npx`'s fallback: **`npx <pkg>` installs `<pkg>@latest` from the npm registry when
it is not present locally, and in a non-TTY shell such as CI it does so without prompting.** Today
that fallback is unreachable (`npm i` runs first and installs devDependencies), but it is one
`NODE_ENV=production` or `--omit=dev` away from silently executing an unpinned, unreviewed package
as a build step.

✅ Good — fail loudly instead of silently fetching:

```yaml
- name: Install Playwright Browser (Chromium)
  run: npx --no playwright install --with-deps chromium
```

Equivalent and equally explicit: `run: ./node_modules/.bin/playwright install --with-deps chromium`.

❌ Bad — the current form, which degrades to a registry fetch rather than an error:

```yaml
- name: Install Playwright Browser (Chromium)
  run: npx playwright install --with-deps chromium
```

The rule generalizes past Playwright: **any `run:` step invoking a binary that a lockfile is
supposed to pin must be written so that a missing local install fails the job**, never so that it
reaches the network for an unpinned replacement.

## The lockfile is the pin — a CI step that depends on it must be installed with `npm ci`

`tests.yml` and `lint.yml` both install Node dependencies with `npm i` / `npm install`. `npm i`
treats `package-lock.json` as *advisory*: it honours the lock when the `package.json` ranges are
satisfiable by it, but it will also resolve differently and rewrite the lock when they are not,
without failing. `npm ci` treats the lock as *binding* and errors on any drift.

That distinction was cosmetic while npm only supplied front-end assets. It stopped being cosmetic
the moment a CI step began executing an npm-resolved binary that then downloads browser executables:
`package-lock.json` is now the only thing pinning what code runs on the runner.

✅ Good — for a CI job, which never wants to resolve a new version implicitly:

```yaml
- name: Install Node Dependencies
  run: npm ci
```

❌ Bad — in CI specifically, because a drifting lock is silently accepted rather than reported:

```yaml
- name: Install Node Dependencies
  run: npm i
```

Note this is **pre-existing** in both workflows, not introduced by task 0006b; the task is what made
it load-bearing. Fix it in whichever change next touches those steps.

## Untrusted install steps run *before* secrets are written to the runner's disk

`tests.yml` writes the Flux Composer credentials to disk with:

```yaml
- name: Add Flux Credentials Loaded From ENV
  run: composer config http-basic.composer.fluxui.dev "${{ secrets.FLUX_USERNAME }}" "${{ secrets.FLUX_LICENSE_KEY }}"
```

Task 0006b inserted the Playwright step **after `Install Node Dependencies` and before this one**.
That ordering is a real security property and must be preserved deliberately rather than by
accident: `npm ci`/`npm i` and `playwright install` both execute third-party code (lifecycle
scripts, and — with `--with-deps` — `sudo apt-get`), and running them *before* the credentials exist
on disk means a compromised package in that step has nothing to steal from the filesystem.

**Rule: every step that executes third-party code goes above the step that materializes a secret.**
When adding a new install/tooling step, place it in the untrusted-install block at the top, never
between the credentials step and the end of the job.

Two related facts, both verified and both fine as they stand:

- **`--with-deps` gives the npm-resolved `playwright` package root on the runner.** On Linux it
  shells out to `sudo apt-get install …`, which succeeds because GitHub-hosted runners grant the
  `runner` user passwordless sudo. This is Playwright's own documented CI recipe and is acceptable
  **only** because the runner is a fresh, single-tenant, disposable VM. Do not copy the flag onto a
  self-hosted or persistent runner without re-auditing it — there, the same command is a durable
  root-level system change.
- **`tests.yml` declares `permissions: contents: read` and `persist-credentials: false`.** Both are
  correct and neither needs widening for browser tests. Keep it that way; a browser suite never
  needs a writable token.

> **Known gap, out of scope for 0006b:** `lint.yml` declares `permissions: contents: write` while
> its only step that would need it (`stefanzweifel/git-auto-commit-action`) is commented out. Drop
> it to `contents: read` when that file is next touched, or restore the auto-commit step — the
> current state is write access nothing uses.

## Test artifacts are only safe while nothing uploads them

Pest's browser plugin auto-captures a screenshot on **any** failed browser assertion, not only on an
explicit `->screenshot()` call. `Pest\Browser\Support\Screenshot::dir()` hardcodes
`<root>/tests/Browser/Screenshots`, and that directory is the plugin's **only** artifact output —
image-diff output nests under it (`Screenshots/ImageDiffView`), and there is no separate video,
trace, or download directory. So `.gitignore`'s single directory-level entry covers everything:

```gitignore
/tests/Browser/Screenshots
```

Verified with `git check-ignore -v tests/Browser/Screenshots/foo.png`, not by reading the file — a
path typo reads fine and ignores nothing.

Git-ignoring is sufficient **today** only because neither workflow uploads anything: there is no
`actions/upload-artifact` and no `actions/cache` step in `.github/`. That is the load-bearing half
of the guarantee, and it is the half that a future change can silently remove.

**Rule: do not add `actions/upload-artifact` for `tests/Browser/Screenshots` without deciding what
is in the images first.** A screenshot is a rendering of an authenticated page: once browser tests
use `actingAs()` and factories (which this repo's guidance prefers over driving the sign-in UI), a
failure screenshot can contain user names, email addresses, and session-bound UI. Artifacts on a
public repository are downloadable by anyone. If such an upload is ever wanted, scope it to failures,
set a short `retention-days`, and confirm the fixtures are synthetic.

One mitigating control already exists and is worth knowing rather than rediscovering:
`Pest\Browser\Drivers\LaravelHttpServer::handleRequest()` forces `config(['app.debug' => false])`
around `$kernel->handle(...)` and restores it in a `finally`. An exception during a browser test
therefore renders the production error page, so **stack traces, environment dumps, and connection
strings cannot reach a screenshot** even though the suite runs with `APP_DEBUG=true` locally.

## Verified safe: the browser suite cannot reach a non-`testing` database

[contracts.md](../contracts.md)'s **Destructive Database Command Rule** exempts the test runner
because `phpunit.xml` pins `DB_DATABASE=testing` for every process it launches. Adding a third
testsuite raises the obvious question of whether that exemption still holds — it does, for two
independent reasons, both confirmed against the installed vendor source:

1. **`<php>` is process-wide, not per-suite.** The `<php>` block is a sibling of `<testsuites>`, and
   this file defines no per-suite override, so `DB_DATABASE=testing` applies to the `Browser` suite
   exactly as it does to `Unit` and `Feature`. Declaring a suite cannot scope it.
2. **The app under test runs in the *same PHP process* as the test.**
   `Pest\Browser\Drivers\LaravelHttpServer` serves the page from an in-process Amp socket that calls
   `app()->make(HttpKernel::class)` and `$kernel->handle(...)` — there is no `php artisan serve`
   subprocess that could re-read `.env` and pick up the real `arospe` database. The only subprocess
   is `node_modules/.bin/playwright run-server`, which drives the browser and never touches PHP or
   the database.

This is also why one shared `pest()->extend(...)->use(RefreshDatabase::class)->in('Feature', 'Browser')`
binding is correct rather than merely convenient: the test's open transaction is visible to the page
under test, because it is the same connection.

Both servers bind to **loopback only** (`ServerManager::DEFAULT_HOST = '127.0.0.1'`), so neither the
application under test nor Playwright's unauthenticated browser-control WebSocket is reachable off
the host during a run.

**Rule: before assuming the `testing`-database exemption covers a new suite or runner, confirm the
application under test shares the test process.** The exemption is a property of in-process
execution, not of the word "test" in a directory name — a future runner that serves the app from a
separate process (a real `php artisan serve`, a Docker service, a remote Selenium grid) would read
`.env` instead and point at the real database, and would need its own explicit `DB_DATABASE` pin.

_Last updated: 2026-08-16 — Created from the Phase 4 audit of task 0006b (browser-test
infrastructure): the repo's first CI step that downloads and executes a third-party binary._
