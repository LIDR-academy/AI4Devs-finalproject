# Playbook: full-story

## Purpose

Execute a complete user story (US) from scaffold to merged commit, chaining all four agents.

## When to use

- Beginning of a new US (US1, US2, US3, US4, US5, US6)
- "Sprint" mode for a single US

## Pre-requisites

- Spec is up to date (`specs/001-realista-mvp/spec.md`)
- Branch is current (`feature-entrega2-DMM`)
- Docker is running (for `postgres`)
- OpenRouter API key is set in `.env`

## Steps

### Step 1: Scaffold

```bash
@scaffold-story <us-id>
```

Creates folder structure and stub files. Idempotent.

### Step 2: Foundational check

Verify the US can start:

- Prisma schema includes the entities needed
- Migrations are applied (`npm run db:migrate`)
- Session middleware is in place
- API client is in place (frontend)

If not, run Foundational tasks first (T002–T022 from `tasks.md`).

### Step 3: Implement loop

For each task in the US (in dependency order):

```bash
@implementer task-id=<T-id> story=<US-id> context="<short desc>"
```

The `implementer`:

1. Reads the task and the relevant FR
2. Invokes `tdd-cycle` skill (red → green → refactor)
3. Commits with conventional message
4. Invokes `auto-evidence` skill
5. Returns when done

### Step 4: Review

```bash
@review-pr --branch feature-entrega2-DMM --story <US-id>
```

The `reviewer`:

1. Runs `hexagonal-check`
2. Checks TDD compliance
3. Maps behaviours to FRs
4. Returns critical/important/minor findings
5. Proposes fixes

If findings exist, loop back to Step 3 with the fix scope.

### Step 5: Document

```bash
@documenter change-set=<us-id>
```

The `documenter`:

1. Updates `readme.md` and `prompts.md` if new components were added
2. Refreshes `docs/evidence/INDEX.md`
3. Proposes ADR if a new decision was made
4. Commits with `docs:` prefix

### Step 6: Summary evidence

The orchestrator generates a US-level summary at `docs/evidence/YYYY-MM-DD-HHMM-<US-id>-SUMMARY.md`.

## Time expectation

| Story | Tasks | Est. time |
|---|---|---|
| US1 Listing Lens | 22 | 45-60 min |
| US2 Mortgage Compass | 18 | 35-50 min |
| US3 Dashboard | 13 | 25-35 min |
| US4 Negotiation | 13 | 20-30 min |
| US5 Timeline | 12 | 15-25 min |
| US6 Checklist | 12 | 15-25 min |

## Anti-patterns

- Skipping the review (it catches constitutional violations)
- Bundling multiple tasks in one commit
- Forgetting to invoke `auto-evidence` at the end
- Pushing without `pre-push` hook passing
