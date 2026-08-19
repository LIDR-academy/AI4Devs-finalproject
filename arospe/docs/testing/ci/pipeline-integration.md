# Pipeline Integration

## Current state (real, as of this writing)

[`.github/workflows/tests.yml`](../../../.github/workflows/tests.yml) runs on every push/PR to `develop`/`main`/`master`/`workos`, across a PHP `8.3`/`8.4`/`8.5` matrix. The relevant steps today:

```yaml
- name: Setup PHP
  uses: shivammathur/setup-php@...
  with:
    php-version: ${{ matrix.php-version }}
    tools: composer:v2
    coverage: xdebug

# ...

- name: Run Type Analysis
  run: composer types:check

- name: Run Tests
  run: php artisan test
```

A coverage driver (`xdebug`) is already installed by the `setup-php` step, but **the `Run Tests` step does not currently request coverage or enforce a threshold** — it's a plain `php artisan test`. There is no coverage gate blocking merges today. This file documents what adding one would look like; it is a proposal, not a change that has been made to `tests.yml`.

**Database provisioning.** The job declares a `services.mysql` container (`mysql:8.4`, matching `compose.yaml`), gated behind a `mysqladmin ping` healthcheck the runner waits on before any step runs, plus a job-level `env:` block pointing `DB_CONNECTION`/`DB_HOST`/`DB_PORT`/`DB_DATABASE`/`DB_USERNAME`/`DB_PASSWORD` at it (`127.0.0.1:3306`, database `testing`, user `root`, empty password). Those are real process environment variables, so they take precedence over whatever the `Copy Environment File` step (`cp .env.example .env`) writes to disk — no `.env` edit happens in CI. `phpunit.xml`'s own `<env name="DB_CONNECTION" value="mysql"/>` / `<env name="DB_DATABASE" value="testing"/>` pins the same target for local runs, so CI and a local `php artisan test` always hit the same MySQL `testing` database regardless of a contributor's real `.env`. See [`ai-spec/tasks/ci-database-connection-gap.md`](../../../ai-spec/tasks/ci-database-connection-gap.md) for why this was needed — before this fix, neither CI nor a fresh local clone could open a database connection at all.

> Note that since task 0006b, that plain `php artisan test` also runs the `Browser` testsuite, which is why the workflow carries an `Install Playwright Browser (Chromium)` step (elided from the excerpt above) between `Install Node Dependencies` and the Composer steps. Coverage gating is unaffected by it either way — see [frontend/playwright-setup.md](../frontend/playwright-setup.md#ci-integration) for what CI does and does not cover on the browser side, and [security/ci-workflow-hardening.md](../../security/ci-workflow-hardening.md) for that step's supply-chain constraints.

## Proposed: adding a coverage gate

To make the [`--min=80` floor](commands.md#enforce-a-minimum-coverage-threshold) actually block merges, the `Run Tests` step would change to:

```yaml
- name: Run Tests
  run: php artisan test --coverage --min=80
```

Nothing else in the workflow needs to change — `coverage: xdebug` is already configured, and `--min=80` alone is sufficient: Pest exits non-zero when coverage falls under the threshold, which fails the step, which fails the job, which blocks the PR from being merged if this job is a required check on the target branch.

## What happens if the threshold isn't met, once this is wired up

1. The `Run Tests` CI step fails and the job shows red in the PR checks.
2. If `ci` is configured as a required status check on the branch protection rule for `main`/`master`/`develop`, the merge button is blocked until it's green again.
3. The fix is **not** "lower `--min`" or "add a trivial test to inflate the number" — per [philosophy.md](../philosophy.md) and [qa/what-not-to-test.md](../qa/what-not-to-test.md), the fix is to write a real test for whatever code path dropped coverage. If a reviewer sees a PR that pads coverage back up with meaningless tests instead, that's a [coverage-review-checklist.md](../qa/coverage-review-checklist.md) rejection, not an approval.

## Before actually enabling this

Since this repo's PR contract ([`docs/contracts.md`](../../contracts.md)) calls for asking before taking non-obvious actions rather than assuming: adding `--min=80` to the real workflow is a deliberate decision for whoever owns CI to make (it will start failing PRs the moment coverage is under 80%, which may or may not be true today — nobody has measured it yet with `php artisan test --coverage` locally). Run that locally first to see where this repo actually stands before wiring the gate into `tests.yml`.
