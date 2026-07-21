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
