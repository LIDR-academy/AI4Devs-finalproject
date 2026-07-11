# ORCHESTRATOR.md — Agentic Orchestrator (source of truth)

> **Rule of precedence:** if this file conflicts with any agent/command/rule file, **this file (`.agents/ORCHESTRATOR.md`) wins** — except the canonical project rules in `.agents/rules/global.mdc`, `hooks-service-dao.mdc`, `atomic-design.mdc`, which always take precedence on _how code is written_.

This pipeline takes one user story from `user-stories/` to a validated, PR-ready feature through four phases, driven by `orchestrator_lead` with **one human gate up front** — a single combined approval of the spec + Gherkin contract. Full rationale lives in `/ORCHESTRATOR_PLAN.md`.

## Principles

- **One worktree per feature.** The orchestrator creates a git worktree on branch `feat/<name>` (`git worktree add .worktrees/<name> -b feat/<name>`) and does **all** work there — docs + code — so the main checkout stays clean. The human merges it via the PR; the worktree is removed after.
- **One feature at a time.** `progress/current.md` points at the active feature.
- **State on disk, not in chat.** Every agent writes artifacts to `docs/features/<name>/` and returns a single reference line. Content never travels through chat (anti-"telephone" rule).
- **Contracts per phase + explicit gates.** No phase advances until its gate passes.
- **Strict TDD.** No production code without a failing test that demands it.
- **The review is the whole game.** Agents draft; judgment prunes.
- **Validation is compute-bound.** Mutation testing proves the tests bite.

## Pipeline & state machine

```
pending
  → spec_partner        → spec.md, risks.md, tasks.md, task-N.md, gherkin-scenarios.md   [spec_drafted]
  → spec_reviewer       → review-spec.md  (loop with spec_partner, ≤ 2 rounds)           [spec_ready]
  → ⏸ HUMAN GATE: approve the spec + Gherkin contract (single approval)            [approved]
  → implementator       → src + tests, one vertical slice at a time                 [in_progress]
        └ per slice: light review (reviewer_code + reviewer_design only) → fix → next slice
  ── quality gate (after all slices): mutation → full review → mutation ──
  → mutation_tester (pre-review)   → mutation.md   kill every survivor (≤ 2 rounds)   [mutation]
  → reviews_lead (full: all 6)     → review.md     fix every finding (≤ 2 rounds)     [in_review]
  → mutation_tester (post-review)  → mutation.md   kill every survivor again (≤ 2)    [mutation]
  → dod_validator       → dod.md (validate only, no PR)                             [pr_ready]
  → ⟵ human opens & merges the PR                                                    [done]
```

Only `orchestrator_lead` writes the feature phase (in `tasks.md` frontmatter); `implementator` flips `task-N.md` statuses as it builds. Everything after the gate is autonomous up to `pr_ready`. Opening/merging the PR is a manual human step.

## Roles (see `.agents/agents/<name>.md`)

| Agent | Phase | Writes | Edits code? |
|---|---|---|---|
| `orchestrator_lead` | orchestrates all | `progress/*`, phase in `tasks.md` | no |
| `spec_partner` | 1 — spec + contract (debate) | `spec.md`, `risks.md`, `tasks.md`, `task-N.md`, `gherkin-scenarios.md` | no |
| `spec_reviewer` | 1 — spec review (pre-gate) | `review-spec.md` | no |
| `implementator` | 2 — build (TDD) | `src/`, `tests/`, `tdd.md`, task statuses | **yes** |
| `reviews_lead` | per-slice review + Phase 3 review round | `review.md` | no |
| `reviewer_code` | per slice **and** full (parallel) | `review-code.md` | no |
| `reviewer_design` | per slice **and** full (parallel) | `review-design.md` | no |
| `reviewer_architecture` | 3 — full only (parallel) | `review-architecture.md` | no |
| `reviewer_security` | 3 — full only (parallel, OWASP) | `review-security.md` | no |
| `reviewer_accessibility` | 3 — full only (parallel, WCAG) | `review-accessibility.md` | no |
| `reviewer_performance` | 3 — full only (parallel) | `review-performance.md` | no |
| `mutation_tester` | 3 — StrykerJS (pre **and** post review) | `mutation.md` | no |
| `dod_validator` | 4 — DoD | `dod.md` | no |

`implementator` is the **only** agent that edits feature code. Reviewers and leads prune, they don't patch.

## Models (per-agent, set via `model:` in each agent's frontmatter)

- **Opus** — `spec_partner` (highest-leverage reasoning: debating and pinning down the spec + Gherkin contract).
- **Sonnet** — `orchestrator_lead`, `spec_reviewer`, `implementator`, `reviews_lead`, and the 6 reviewers (coding + judgment).
- **Haiku** — `mutation_tester`, `dod_validator` (mechanical: run scripts/checks and report).

`model` accepts `opus` / `sonnet` / `haiku` (or `inherit`); each agent runs on its own model regardless of which agent invokes it.

## Gates (all must pass to advance)

1. **spec_drafted → spec_ready (automated spec review)** — `spec_reviewer` vets the bundle: every AC is a testable Given/When/Then; 4 UI states (if UI); risks mitigated; one `@s` per behavior; **every AC ↔ ≥ 1 scenario**; tasks atomic, correctly sliced, with valid `libs/*` paths; full story→AC→scenario→task traceability. Findings loop back to `spec_partner` (≤ 2 rounds); clean → `spec_ready`.
2. **HUMAN GATE (combined)** — human approves `spec.md` **and** `gherkin-scenarios.md` in one pass (with any open `review-spec.md` findings surfaced) → `approved`.
3. **per-slice gate** — for each vertical slice: `pnpm lint` + `pnpm check-types` + `pnpm test` (+ `test:e2e` where relevant) green; the slice's `@s` covered by tests; no scope beyond contract; no hardcoded strings/colors/dims; **and a light `reviewer_code` + `reviewer_design` review is clean** (findings fixed, ≤ 2 rounds) before the slice is committed and the next begins.
4. **mutation (pre-review)** — after all slices, `mutation_tester` runs **first**; `implementator` kills every surviving mutant until **100% on changed lines** (≤ 2 rounds, else escalate). Hardens the test net before the reviewers look.
5. **full review (≤ 2 rounds)** — all six reviewers run; `implementator` fixes **every** finding (blocker, major, **and minor**); `review.md` pruned to only open findings. **After the 2nd round:** any open **blocker/major → escalate & block**; **only minors** → ship as **documented, human-accepted** risks (recorded in `review.md`, `spec.md`, `dod.md`).
6. **mutation (post-review)** — `mutation_tester` re-runs (the review's fixes may have changed code); `implementator` kills every surviving mutant until **100% on changed lines** again (≤ 2 rounds, else escalate). Mutants are killed on **both** passes.
7. **pr_ready** — `dod_validator` marks every DoD item passing. Human opens/merges the PR → `done`.

## Artifact map — `docs/features/<name>/`

```
spec.md  risks.md  tasks.md  task-1.md … task-N.md
gherkin-scenarios.md
review-spec.md
tdd.md
review-code.md  review-design.md  review-architecture.md
review-security.md  review-accessibility.md  review-performance.md
review.md
mutation.md
dod.md
```

Session state: `progress/current.md` (active pointer) + `progress/history.md` (append-only).

## Entry

```
/ticket-orchestrator <story>      # reads user-stories/<story>.md, invokes orchestrator_lead
```

## Definition of Done

See `/ORCHESTRATOR_PLAN.md` §7. Validated by `dod_validator`: Functionality · Code quality · Architecture · Design system · Security (OWASP) · Accessibility (WCAG 2.2 AA) · Testing rigor (per-scenario tests + component unit tests + mutation threshold) · Observability & i18n.

## Rules index (passive standards — always-on reference)

- `.agents/rules/global.mdc` — monorepo spec (folders, libs, naming, tooling, Supabase)
- `.agents/rules/hooks-service-dao.mdc` — Component→Hook→Service→DAO layering
- `.agents/rules/atomic-design.mdc` — component structure
- `.agents/rules/tdd.md` — Three Laws of TDD, Red→Green→Refactor (TypeScript)
- `.agents/rules/review-standards.md` — the 6 reviewer rubrics

## Skills index (invocable procedures — loaded on demand)

- `.agents/skills/gherkin-authoring/` — distill a spec into a tagged `gherkin-scenarios.md` contract (used by `spec_partner`)
- `.agents/skills/mutation-testing/` — run StrykerJS scoped to changed files, `scripts/run-mutation.sh` (used by `mutation_tester`)
- `.agents/skills/storybook-e2e-tests/` — write Playwright e2e for Storybook components; owns the `.e2e.js` location convention (used by `implementator`)
