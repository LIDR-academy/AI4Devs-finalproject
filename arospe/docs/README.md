# Documentation Index

Technical documentation for this Laravel 13 + Livewire 4 application, kept in sync with the real code by the [`docs-maintainer`](../.claude/skills/docs-maintainer/SKILL.md) skill. If something here contradicts the code, the code is right — flag it or fix the doc.

## Contracts

- [Contracts](contracts.md) — behavioral contracts governing what the AI agent may or may not do, and how it should make decisions, while working in this repository.

## Workflow

- [Workflow](workflow.md) — the required multi-agent orchestration process (Three Amigos + TDD + security audit + code review + continuous docs) the project's Claude Code agents follow to carry a task from definition to closure, phase by phase, including the three-stage task-storage convention (`ai-spec/tasks/` → `in-progress/` → `done/`).
- [`.claude/skills/three-amigos-debate/SKILL.md`](../.claude/skills/three-amigos-debate/SKILL.md) — the skill that automates [Phase 1](workflow.md#phase-1--three-amigos-debate) of that workflow: `/three-amigos-debate epic <n>` decomposes a [PRD](PRD/PRD.md) epic into candidate stories (pausing for your confirmation), `/three-amigos-debate story <description>` debates a single ad-hoc story, and either way it convenes the expert/QA/database agents and writes one User Story file per story to `./ai-spec/tasks/`. It stops at Phase 1 — no code, no INVEST check, no TDD.

## Product Requirements

- [PRD](PRD/PRD.md) — product-level requirements for the Arospe backoffice (Users/Roles, Products/Taxes/Shipping, Blog, Internationalization): per-epic Gherkin scenarios, acceptance criteria, roadmap, and scope boundaries; feeds the Three Amigos process for individual tasks.

## Architecture

- [Overview](architecture/overview.md) — what this app is today, the real request lifecycle (routes → Livewire → actions → models → DB), and runtime dependencies (MySQL, database-backed session/cache/queue).
- [Authentication](architecture/authentication.md) — Fortify-based registration, login, password reset, two-factor authentication, and passkeys, plus the account lifecycle layered on top: the `users.status` / `App\Enums\UserStatus` account state, the no-self-activation invariant and the single `ActivateVerifiedUser` listener all three verification paths converge on, and the pending-email mechanism (an email change is parked in `users.pending_email` and only applied once its signed, address-bound, 60-minute link is used). The single source of truth for how auth works.
- [Authorization](architecture/authorization.md) — `spatie/laravel-permission` roles & permissions, now a working foundation: the two seeded roles (`Super Admin`, `Administrator`), the 38-permission `<module-slug>.<action>` catalog and who holds what, the seeder (including the five-branch Super Admin bootstrap driven by `SUPER_ADMIN_EMAIL`), the `Gate::before` Super Admin bypass with its coverage gap and the "gate on permissions, never role names" convention, and the three middleware aliases.

## Database

- [Schema](database/schema.md) — ER diagram and column-level description of every table (`users` including `status` and `pending_email`, `passkeys`, `sessions`, the permission tables) and how they relate, plus the known redundant `users_uuid_unique` index.
- [Migrations](database/migrations.md) — this repo's real migration conventions (naming, `down()` symmetry, adding columns, backfilling when a new column's default is wrong for existing rows, dropping a unique index before its column), with examples pulled from `database/migrations/`.

## API

- [Routes](api/routes.md) — the real contract surface today: app-owned web/Livewire routes, the `email-change.confirm` controller route (the first one deliberately registered outside the `auth` groups), plus the Fortify- and Passkeys-vendored auth routes. There is no REST API yet; this file explains what replaces it once one exists.

## Conventions

- [Base standards](conventions/base-standards.md) — stack versions, directory layout (including `app/Actions/Users/`, `app/Enums/`, `app/Listeners/`, `app/Notifications/`, `lang/`), model conventions (attribute-based `#[Fillable]`/`#[Hidden]`, `casts()`, and omission-from-`#[Fillable]` as the mass-assignment guard), the class-based Livewire component convention, when a controller belongs in front of an action, and the artisan-first/test-first quality gates.
- [Code style](conventions/code-style.md) — line-level conventions (explicit types, braces, shared validation traits, PHPDoc array shapes, per-method action injection), each with a real ✅/❌ pair.
- [Naming](conventions/naming.md) — class/file naming, Livewire component ↔ view naming, validation-trait naming, route naming, boolean property naming.

## Testing

- [Testing index](testing/README.md) — how to write, review, and run tests in this repo: testing philosophy and anti-patterns, a QA risk-based thinking guide, Pest 4 backend conventions, and CI commands/coverage. Start there; it links out to `.claude/skills/pest-testing/SKILL.md` for basic Pest syntax rather than duplicating it.
- [Frontend / browser testing guide](testing/frontend/README.md) — QA-oriented guide for browser-level tests: the tooling decision (Pest 4 browser testing, not a separate Playwright/BDD runner), the user-story → Gherkin → Pest workflow and reference prompt, setup status, Gherkin guidelines + domain glossary, a browser-specific quality checklist, the frontend coverage policy, and worked scenario/test examples.

## Security

- [Security knowledge base](security/README.md) — durable security rules established by `appsec-auditor` during Phase 4 audits, each with a real code example from this repo. Three pages so far: [authorization patterns](security/authorization-patterns.md) (what the Super Admin `Gate::before` bypass does and does not cover, permission-cache flush ordering around a transaction, always passing the guard to `hasRole()`, `Gate::before` closures guarding with `instanceof`, why `config($key, $default)` alone cannot cover a present-but-`null` key), [seeder safety](security/seeder-safety.md) (why `db:seed` is production-reachable here, environment allow-lists over deny-lists for fixture data, and the rules for bootstrapping a privileged account from a configured email address), and [signed-link verification patterns](security/signed-link-verification.md) (why `ValidateSignature` is globally prioritised ahead of `SubstituteBindings`, why a value bound into a link by `sha1()` must be normalised first, why a locked re-check still needs the unique index to have the last word, and why every refusal branch must be indistinguishable).

## Decisions

- [Decision records](decisions/README.md) — ADR format and folder purpose. First ADR recorded: [0001 — UUID primary keys](decisions/0001-uuid-primary-keys.md) (UUIDv7 via `HasUuids` for `users` and PRD Epic 2/4 domain entities).

## Errors log

- [Errors log](errors-log.md) — structured record of real mistakes and the rule adopted to avoid repeating them. Four entries: the Gherkin actor/single-action convention violation, the Super Admin bootstrap treating an existing `users` row as proof of mailbox ownership (now half-closed by the pending-email mechanism), the redundant `users_uuid_unique` index left behind by the UUID conversion, and a seeder test that depended on the developer's ambient `SUPER_ADMIN_EMAIL`.

_Last updated: 2026-08-12 — Task 0003 (user status & email-verification lifecycle): expanded the Authentication, Schema, Migrations, Routes and Base standards entries to cover `users.status` / `pending_email`, the activation listener, the `email-change.confirm` route and the new app directories; indexed the third security page; updated the Errors log entry count._
