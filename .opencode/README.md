# Realista AI Engineering — `.opencode/`

This directory contains the **AI engineering components** of the Realista project: agents, commands, skills, hooks, playbooks, prompt-runs, and harness documentation. Together, they define how the model is invoked, what it can do, and what support it has.

## Directory layout

```
.opencode/
├── README.md                  # this file
├── agents/                    # 4 high-level AI agents
├── commands/                  # 8 slash commands
├── skills/                    # 6 encapsulated behaviours
├── hooks/                     # 4 automation triggers
├── playbooks/                 # 3 multi-step flows
├── prompts/                   # 3 LLM prompt-runs
├── harness/                   # 6 technical support docs + config.yaml
└── config.yaml                # harness version + stack + coverage + agent catalogue
```

## Components

### Agents (4)

High-level AI personas that orchestrate the work:

| Agent | Purpose |
|---|---|
| [`implementer`](./agents/implementer.md) | TDD code generation for a task |
| [`reviewer`](./agents/reviewer.md) | Critical code review against constitutional principles |
| [`documenter`](./agents/documenter.md) | Keeps `readme.md`, `prompts.md`, ADRs, and evidence index current |
| [`orchestrator`](./agents/orchestrator.md) | Coordinates the others for a full user story |

### Commands (8)

Slash commands for common operations:

| Command | Purpose |
|---|---|
| [`/analyze-listing`](./commands/analyze-listing.md) | Run the full Listing Lens flow on a URL |
| [`/review-pr`](./commands/review-pr.md) | Run `reviewer` on the staged diff or a branch |
| [`/document-task`](./commands/document-task.md) | Generate evidence for a specific task |
| [`/check-architecture`](./commands/check-architecture.md) | Run `hexagonal-check` over the repo |
| [`/generate-adr`](./commands/generate-adr.md) | Draft a new ADR |
| [`/scaffold-story`](./commands/scaffold-story.md) | Create folder structure for a US |
| [`/sprint`](./commands/sprint.md) | Orchestrate a full US from scaffold to evidence |
| [`/evidence-report`](./commands/evidence-report.md) | Aggregate evidence report for milestone reviews |

### Skills (6)

Encapsulated behaviours reusable across agents:

| Skill | Purpose |
|---|---|
| [`auto-evidence`](./skills/auto-evidence.md) | Generate per-task evidence files |
| [`tdd-cycle`](./skills/tdd-cycle.md) | Enforce red→green→refactor with 80% domain coverage |
| [`hexagonal-check`](./skills/hexagonal-check.md) | Verify domain layer has zero framework deps |
| [`adr-suggest`](./skills/adr-suggest.md) | Detect and propose ADRs for new decisions |
| [`pwa-shell`](./skills/pwa-shell.md) | Generate PWA manifest, service worker, icons |
| [`prisma-migrate`](./skills/prisma-migrate.md) | Create safe Prisma migrations with naming + rollback |

### Hooks (4)

Event triggers (documented as runnable scripts; OpenCode has no native hook runner):

| Hook | Trigger | Purpose |
|---|---|---|
| [`post-commit`](./hooks/post-commit.md) | `git commit` succeeds | lint + typecheck + test + hexagonal-check |
| [`pre-push`](./hooks/pre-push.md) | `git push` initiated | full test suite + E2E (mocked) |
| [`post-merge`](./hooks/post-merge.md) | `git merge` completes | regenerate evidence index + ADR catalogue |
| [`on-save-svelte`](./hooks/on-save-svelte.md) | `.svelte` file saved | run `svelte-check` for fast feedback |

### Playbooks (3)

Multi-step orchestrations chaining multiple agents:

| Playbook | Purpose |
|---|---|
| [`full-story`](./playbooks/full-story.md) | scaffold → implement → review → document → evidence |
| [`adr-lifecycle`](./playbooks/adr-lifecycle.md) | detect → propose → review → commit → reference |
| [`release`](./playbooks/release.md) | verify → CHANGELOG → version bump → tag → evidence report |

### Prompt-runs (3)

LLM instruction templates:

| Prompt | Purpose |
|---|---|
| [`llm-system-listing`](./prompts/llm-system-listing.md) | System prompt for the Listing Lens analyzer |
| [`llm-system-location`](./prompts/llm-system-location.md) | DEPRECATED — kept for historical reference |
| [`narrative-templates`](./prompts/narrative-templates.md) | Mortgage Compass narrative templates (persona × scenario) |

### Harness (6 + 1)

Technical support documentation and configuration:

| File | Purpose |
|---|---|
| [`harness/README.md`](./harness/README.md) | Harness overview |
| [`harness/stack.md`](./harness/stack.md) | Exact versions, compatibility, rationale |
| [`harness/env-vars.md`](./harness/env-vars.md) | All env vars: required, optional, defaults, validation |
| [`harness/test-strategy.md`](./harness/test-strategy.md) | TDD workflow, coverage targets, Vitest + Playwright |
| [`harness/run-locally.md`](./harness/run-locally.md) | Step-by-step local setup |
| [`harness/troubleshooting.md`](./harness/troubleshooting.md) | Common errors and fixes |
| [`harness/config.yaml`](./harness/config.yaml) | Machine-readable harness version + config |

## How the components work together

```
User prompt
    ↓
Orchestrator (decomposes US)
    ↓
Scaffold story (creates structure)
    ↓
Implementer ──── invokes ──── tdd-cycle, prisma-migrate, pwa-shell
    ↓                              ↓
(commits)                    auto-evidence (generates evidence)
    ↓                              ↓
Reviewer ──── invokes ──── hexagonal-check, adr-suggest
    ↓
(loops back if findings)
    ↓
Documenter ──── invokes ──── auto-evidence
    ↓
(commits docs)
    ↓
Done — evidence in docs/evidence/, INDEX.md updated
```

## Versioning

The harness is versioned in `harness/config.yaml`. Bump when:

- A new major library is added/removed
- A new external API is integrated
- The deployment target changes
- The testing framework changes

## Related

- [`docs/constitution.md`](../../docs/constitution.md) — constitutional principles
- [`specs/001-realista-mvp/`](../../specs/001-realista-mvp/) — spec-kit artefacts
- [`docs/evidence/`](../../docs/evidence/) — per-task evidence
- [`docs/adr/`](../../docs/adr/) — architecture decision records
