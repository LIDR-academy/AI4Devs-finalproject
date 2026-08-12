# Security Knowledge Base

Project-specific security knowledge for this Laravel 13 + Livewire 4 application, written by the
[`appsec-auditor`](../../.claude/agents/appsec-auditor.md) agent during Phase 4 of
[`docs/workflow.md`](../workflow.md).

Same "only lasting-value entries" spirit as [`errors-log.md`](../errors-log.md) and
[`decisions/`](../decisions/): per-review finding lists live in the audit response, not here. A page
is added here only when an audit establishes a **durable rule or pattern** that future code in this
repo must follow — always with a real code example pulled from this repository.

## Index

- [Authorization patterns](authorization-patterns.md) — the rules governing the `spatie/laravel-permission`
  authorization foundation introduced by task 0002: which checks the Super Admin `Gate::before` bypass
  actually covers (and which it silently does not), why the permission-cache flush must happen after the
  transaction commits, why `hasRole()` must always be passed a guard, why a `Gate::before` closure must
  guard with `instanceof` rather than a type hint, why `config($key, $default)` alone cannot protect
  against a present-but-`null` key, and why the seeded catalog is safe from role-name collisions.
- [Seeder safety](seeder-safety.md) — why `db:seed` is a production-reachable operation in this app, why
  fixture data must be guarded by an environment **allow-list** rather than a "not production" deny-list,
  and the rules for bootstrapping a privileged account from a configured email address: canonical
  lowercase, format-validate before any lookup, mailbox-ownership proof (`email_verified_at`) before any
  grant, abort with a `return` rather than an exception so the catalog still commits, and a persisted
  audit log that never carries the generated secret.
- [Signed-link verification patterns](signed-link-verification.md) — the rules governing this repo's
  first app-owned signed route (`email-change.confirm`, task 0003): why `ValidateSignature` is
  globally prioritised ahead of `SubstituteBindings` (and the side effects verified across the `web`
  pipeline), why a value bound into a link by `sha1()` must be normalised as the action's first
  statement, why `lockForUpdate()` plus an availability re-check is not a race guard without the
  unique index and its SQLSTATE `23000` catch, and why every refusal branch must flash identical copy.

_Last updated: 2026-08-12 — Added `signed-link-verification.md` from the Phase 4 audit of task 0003
(user status & email-verification lifecycle)._
