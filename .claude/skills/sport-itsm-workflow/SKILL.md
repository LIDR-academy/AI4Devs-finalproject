---
name: sport-itsm-workflow
description: >
  Process and operations for the Sport ITSM repository (not code patterns): the mandatory task
  execution cycle, the verification discipline that decides when a task is done, the Nx/pnpm command
  surface and what is runnable today, artifact ownership (who may edit what, and what to report
  instead), and the change-to-documentation mapping. Use it when operating the repo, closing a task,
  or deciding which document a change obliges you to update. For code and architecture patterns use
  `sport-itsm-architecture` (structure) and `sport-itsm-engineering-principles` (craft).
---

# Sport ITSM — Process and operations

This skill covers **how to operate the repository and close a task**. It does not cover how to
structure code: layers, contexts and boundaries live in `sport-itsm-architecture`; class- and
function-level craft lives in `sport-itsm-engineering-principles`; the exact stacks live in
`sport-itsm-backend` and `sport-itsm-frontend`.

There is **no `docs/standards/` directory in this repository**. Authority is distributed, and this
is the map:

| For | Read |
|---|---|
| Pinned stack and versions | `CLAUDE.md` §2 (pins `major.minor`; `package.json` owns the patch) |
| Commands, conventions, what NOT to do | `CLAUDE.md` §3 |
| Roles, agents, skills, precedence, language standard | `CLAUDE.md` §5 |
| Product behavior | `docs/product/PRD.md` — canonical, and the only source |
| Structure, boundaries, ADRs | `docs/product/ARCHITECTURE.md` |
| Target schema | `docs/product/DATA-MODEL.md` |
| On-disk layout | `docs/product/PROJECT-STRUCTURE.md` |
| What is left to build | `docs/backlog/` — epic map → user stories → tickets |
| Whether a boundary rule still bites | `tools/boundary-probes/` (`pnpm verify:boundaries`) |

## Golden rules

- **Run the verification yourself. Never assert it.** Paste the real output. A criterion you did not
  execute is reported as **not executed**, never as passed.
- **Never work on `main`.** If a feature branch is already checked out, stay on it — do not create
  another. **Never commit or push unless explicitly asked.**
- **One ticket at a time, and its `## Scope` is the contract.** Its "out of scope" list is binding:
  it names the tickets that own that work. Getting ahead turns a greenfield ticket into a gap ticket
  for someone else.
- **Report upstream problems; do not fix them.** One owner per artifact (`CLAUDE.md` §5).
- **When you change code, update the documentation the change obliges** — see the mapping below.
- **Everything committed is in technical English**, using standard ITSM terminology: code,
  comments, commit messages, documentation, Gherkin. Spanish is for the chat with the user and for
  Spanish i18n translation files only (`CLAUDE.md` §5).

## The task execution cycle

**Step 0 — Verify the preconditions before touching anything.** Read the ticket in full, plus the
documents it cites. Then prove the workspace is in the state the ticket assumes: the right Node,
the expected project list, `pnpm verify:boundaries` green, the previous ticket's build passing. If a
precondition fails, **stop and say so** — do not repair it as a side effect of an unrelated ticket.

**Step 1 — Implement exactly the Scope.** Nothing the ticket did not ask for. Generators are helpers,
not authors: they habitually produce marketing components, extra projects, editor configuration and
`^`/`~` version ranges. Remove what falls outside Scope, pin what they install, and **report what you
removed**.

**Step 2 — Verify, mechanically.** Every acceptance criterion, executed for real. See below.

**Step 3 — Report.** Files created or modified; dependencies added with their exact version; the
output of every check; what the generator produced that you had to strip; and any status note this
work makes stale elsewhere — **reported, not corrected**.

## Verification discipline

This is the part that decides whether a task is actually done.

- **Green is not proof of the right thing.** A passing lint over legal code shows the config loads;
  it never shows an illegal import would be caught. That is what `pnpm verify:boundaries` is for —
  it scaffolds deliberate violations, asserts each is rejected, checks three legal control edges are
  *not* rejected, and removes the scaffolding. Re-run it after any change to the tag vocabulary, the
  type matrix or `depConstraints`.
- **A probe must isolate the rule it claims to test.** If a deliberate violation trips a different
  rule first, say which one actually fired. Revert every probe before closing, and leave the files it
  touched byte-identical.
- **Long-running processes outlive their wrapper.** `pnpm nx serve` spawns a child that survives the
  Nx process. Find the PID actually holding the port, kill that, and confirm the port is free.
- **Prove behavior where the behavior lives.** A client-rendered app returns `index.html` over HTTP;
  that is not proof the UI rendered. Reach for the level that can actually observe the claim, and if
  you cannot, say so plainly rather than overstating a weaker check.

## Command surface

Everything runs from the repository root through **pnpm + Nx**. pnpm is the only supported package
manager: an `npm install` or `yarn` here produces a second lockfile and is forbidden.

```bash
pnpm install                          # single lockfile: pnpm-lock.yaml
pnpm nx serve api | serve web         # dev, watch mode
pnpm nx build api | build web         # production bundle under dist/
pnpm nx test <project>                # Jest
pnpm nx lint <project>                # ESLint, boundary checks included
pnpm nx run-many -t lint test build   # every project
pnpm nx affected -t lint test build   # only what changed against main
pnpm verify:boundaries                # proves the boundary rule still bites
pnpm nx show projects                 # exactly the projects the tickets created
pnpm nx graph                         # dependency graph
pnpm prettier --check . | --write .   # the formatting gate
pnpm nx reset                         # clear the Nx cache when it looks stale
```

**Not runnable yet, and why.** `pnpm nx e2e api-e2e | web-e2e` — neither acceptance project exists
until `T-C10-06`. `pnpm typeorm migration:generate|run|revert -d apps/api/src/data-source.ts` — there
is no data source, no migration and no database until `T-C10-16` / `T-C10-17`. There is **no CI**:
no `.gitlab-ci.yml`, no `.github/workflows/`. Do not write configuration for a pipeline that does
not exist, and do not claim a check ran in CI.

**Unit test suites are configured but empty.** Both `test` targets pass via `passWithNoTests`, so a
green run proves the runner works and nothing more.

## Artifact ownership — report, do not edit

`CLAUDE.md` §5: one owner per artifact. A downstream role that finds an upstream artifact wrong
**reports the finding**; the fix is made by the owner, and the affected downstream artifacts are
regenerated rather than hand-patched.

| Artifact | Owner | If you find it wrong |
|---|---|---|
| `docs/product/PRD.md` | `sport-itsm-product-owner` | Report. Behavior changes are made here, then the backlog is regenerated |
| `docs/product/ARCHITECTURE.md`, ADRs, `CLAUDE.md` §2–§3 | `sport-itsm-architect` | Report. A pin or a boundary is an approved change, never a side effect |
| `docs/backlog/epic-map.md` | `sport-itsm-product-owner` (Mode 2) | Report |
| `docs/backlog/<key>/user-stories.md` | `business-analyst` | Report |
| `docs/backlog/<key>/tickets/`, `test-plan.md` | `architect-tech-lead` | Report — never edit a ticket to match what you built |
| Test code (`.feature`, `*.steps.ts`) | `testing-implementer` | — |
| Backlog provenance blocks (dated `ReadTheCode()` records, a ticket's original premise) | their author | Leave them. They record what was true at a commit; rewriting them falsifies the record |

## Change → documentation mapping

| When you change | Update |
|---|---|
| A dependency version | `CLAUDE.md` §2 at `major.minor`, plus the stack skill that repeats it. Never restate the patch outside `package.json` |
| The tag vocabulary, the type matrix or `depConstraints` | `docs/product/ARCHITECTURE.md` §5, re-run `pnpm verify:boundaries`, and add a probe if a new rule was introduced |
| A structural decision that is hard to reverse | A new ADR in `docs/product/ARCHITECTURE.md` §10, numbered after the last one |
| Where something lives on disk | `docs/product/PROJECT-STRUCTURE.md` |
| The persisted schema | `docs/product/DATA-MODEL.md`, and a TypeORM migration — `synchronize` is always `false` |
| A command or a convention | `CLAUDE.md` §3, and the stack skill if it is platform-specific |
| Anything that makes an as-built status note stale | Report it. Status notes in `readme.md` §2 and `ARCHITECTURE.md` §12.3 are the user's call, not a side effect of your ticket |

Never put a requirement in an engineering document, and never put stack detail in the PRD.
