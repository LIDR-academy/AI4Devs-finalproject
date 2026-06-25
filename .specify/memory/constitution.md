<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0
Modified principles: n/a (initial ratification from template)
Added sections: Core Principles (I–VII), Tech Stack, Development Workflow, Governance
Removed sections: all bracket-token placeholders replaced
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gates aligned
  ✅ .specify/templates/spec-template.md — no structural changes needed
  ✅ .specify/templates/tasks-template.md — TDD note already present
Deferred items: none
-->

# RealSaveFooding Constitution

## Core Principles

### I. Test-Driven Development (NON-NEGOTIABLE)

TDD is mandatory for all new functionality. Tests MUST be written first, confirmed
failing, reviewed by the engineer, and only then implemented. The Red-Green-Refactor
cycle is strictly enforced. Skipping or reversing this order is a constitution
violation.

Applies to: unit tests (Jest/Vitest), integration tests, and e2e tests (Playwright).

### II. Incremental, Baby-Step Delivery

Every unit of work MUST be scoped to a single, independently testable change.
Never advance more than one logical step before committing and validating. Large
changes MUST be decomposed into ordered tasks where each task delivers verifiable
value on its own. "Done" means tested, committed, and the previous checkpoint
validated—not just code written.

### III. Full Type Safety

All code MUST be fully typed at all times. TypeScript strict mode is required on
both backend (NestJS) and frontend (TanStack Start). No `any`, no implicit `any`,
no type suppressions without explicit justification documented in a comment. Prisma
client types are the source of truth for database entity shapes.

### IV. English-Only Technical Artifacts

All technical artifacts MUST be written in English: code (variables, functions,
classes, comments, errors, logs), documentation, spec files, test names,
configuration, and git commit messages. Natural-language product docs (README
sections, user-facing copy) may use Spanish where appropriate for the target market
but MUST have English counterparts in technical contexts.

### V. Clear, Descriptive Naming

Names MUST communicate intent without requiring a comment to explain them. Functions
describe their action and return, variables describe what they hold, files describe
their responsibility. Abbreviations are allowed only for universally known acronyms
(e.g., `dto`, `id`, `url`). Vague names like `data`, `info`, `handler`, `util` MUST
be replaced with precise alternatives.

### VI. Assumption Auditing

Before implementing any feature or task, all assumptions MUST be surfaced and
questioned. Inferences about requirements, data shapes, or external behavior MUST be
stated explicitly in the spec and either confirmed or marked `NEEDS CLARIFICATION`.
Implementing against an unstated assumption is a constitution violation.

### VII. Pattern Detection Before Adding Code

Before adding any new module, service, utility, or abstraction, the codebase MUST be
scanned for existing patterns that already solve the problem. Repeated logic MUST be
extracted and consolidated. The bar for adding a new abstraction is that it removes
duplication—not that it might be useful in the future (YAGNI).

## Tech Stack

**Backend**: NestJS (TypeScript, CommonJS) · Prisma ORM · PostgreSQL · Jest (unit +
e2e) · AWS SDK (S3, SES, SNS, Textract)

**Frontend**: TanStack Start (TypeScript, ESM) · React · Vitest · Playwright (e2e)
· Radix UI · React Hook Form

**Infrastructure**: AWS-hosted · Docker (local dev) · Node.js ≥ 20

**Monorepo layout**:
- `back/` — NestJS API
- `front/` — TanStack Start SPA/SSR
- `infra/` — infrastructure config
- `docs/` — product, architecture, DB, and ticket documentation
- `specs/` — spec-kit feature specs (this tool)

## Development Workflow

1. **Spec first**: run `/speckit-specify` before any implementation begins.
2. **Plan and clarify**: run `/speckit-plan` (optionally `/speckit-clarify` first).
3. **Tasks**: run `/speckit-tasks` to get an ordered, dependency-tracked task list.
4. **TDD loop**: for each task — write test → confirm failure → implement → green.
5. **Converge**: run `/speckit-converge` after implementation to catch spec drift.
6. **Commit discipline**: one logical change per commit, conventional commit messages,
   no `--no-verify`.

Quality gates (MUST pass before marking a task complete):
- TypeScript compiler: zero errors
- Lint: zero ESLint errors
- Tests: all passing at the layer touched by the task

## Governance

This constitution supersedes all other practices and guidelines. Any conflict between
a CLAUDE.md rule, a PR comment, or a team convention and this constitution MUST be
resolved in favor of this document unless a formal amendment is approved.

**Amendment procedure**:
1. Open a PR with the proposed change to this file.
2. Describe the motivation and any migration plan in the PR body.
3. Version bump follows semantic rules (see below).
4. All specs and templates referencing changed principles MUST be updated in the same
   PR.

**Versioning policy**:
- MAJOR: removal or incompatible redefinition of an existing principle.
- MINOR: new principle or section added; materially expanded guidance.
- PATCH: wording, typo, or clarification with no semantic change.

**Compliance**: Every spec, plan, and task list produced via spec-kit MUST include a
Constitution Check gate. PRs that skip or bypass a principle MUST document the
justification in the PR description.

**Version**: 1.0.0 | **Ratified**: 2026-06-25 | **Last Amended**: 2026-06-25
