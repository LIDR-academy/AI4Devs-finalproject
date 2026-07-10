# ORCHESTRATOR.md — Agentic Orchestrator (source of truth)

> **Rule of precedence:** if this file conflicts with any agent/command/rule file, **this file (`.agents/ORCHESTRATOR.md`) wins** — except the canonical project rules in `.agents/rules/global.mdc`, `hooks-service-dao.mdc`, `atomic-design.mdc`, which always take precedence on _how code is written_.

This pipeline takes one user story from `user-stories/` to a validated, PR-ready feature through five phases, driven by `orchestrator_lead` with **one human gate up front** — a single combined approval of the spec + Gherkin contract. Full rationale lives in `/ORCHESTRATOR_PLAN.md`.

## Principles

- **One feature at a time.** `progress/current.md` points at the active feature.
- **State on disk, not in chat.** Every agent writes artifacts to `docs/features/<name>/` and returns a single reference line. Content never travels through chat (anti-"telephone" rule).
- **Contracts per phase + explicit gates.** No phase advances until its gate passes.
- **Strict TDD.** No production code without a failing test that demands it.
- **The review is the whole game.** Agents draft; judgment prunes.
- **Validation is compute-bound.** Mutation testing proves the tests bite.

## Pipeline & state machine

```
pending
  → spec_partner        → spec.md, risks.md, tasks.md, task-N.md, gherkin-scenarios.md   [spec_ready]
  → ⏸ HUMAN GATE: approve the spec + Gherkin contract (single approval)            [approved]
  → tdd_craftsman       → src + tests, one vertical slice at a time                 [in_progress]
  → reviews_lead        → 6 reviewers in parallel → review.md                       [in_review]
  → mutation_tester     → StrykerJS on changed files → mutation.md                  [mutation]
  → dod_validator       → dod.md (validate only, no PR)                             [pr_ready]
  → ⟵ human opens & merges the PR                                                    [done]
```

Only `orchestrator_lead` writes the feature phase (in `tasks.md` frontmatter); `tdd_craftsman` flips `task-N.md` statuses as it builds. Everything after the gate is autonomous up to `pr_ready`. Opening/merging the PR is a manual human step.

## Roles (see `.agents/agents/<name>.md`)

| Agent | Phase | Writes | Edits code? |
|---|---|---|---|
| `orchestrator_lead` | orchestrates all | `progress/*`, phase in `tasks.md` | no |
| `spec_partner` | 1 — spec + contract (debate) | `spec.md`, `risks.md`, `tasks.md`, `task-N.md`, `gherkin-scenarios.md` | no |
| `tdd_craftsman` | 2 — build (TDD) | `src/`, `tests/`, `tdd.md`, task statuses | **yes** |
| `reviews_lead` | 3 — review round | `review.md` | no |
| `reviewer_code` | 3 (parallel) | `review-code.md` | no |
| `reviewer_design` | 3 (parallel) | `review-design.md` | no |
| `reviewer_architecture` | 3 (parallel) | `review-architecture.md` | no |
| `reviewer_security` | 3 (parallel, OWASP) | `review-security.md` | no |
| `reviewer_accessibility` | 3 (parallel, WCAG) | `review-accessibility.md` | no |
| `reviewer_performance` | 3 (parallel) | `review-performance.md` | no |
| `mutation_tester` | 4 — StrykerJS | `mutation.md` | no |
| `dod_validator` | 5 — DoD | `dod.md` | no |

`tdd_craftsman` is the **only** agent that edits feature code. Reviewers and leads prune, they don't patch.

## Gates (all must pass to advance)

1. **spec_ready** — every AC is Given/When/Then; 4 UI states defined (if UI); risks mitigated; one `@s` scenario per behavior in `gherkin-scenarios.md`; every AC maps to a scenario; tasks map to `libs/*` paths obeying the layering rules.
2. **HUMAN GATE (combined)** — human approves `spec.md` **and** `gherkin-scenarios.md` in one pass → `approved`.
3. **in_review** — every `@s` covered by a concrete test; integration test green; `pnpm lint` + `pnpm check-types` + `pnpm test` (+ `test:e2e` where relevant) green; no scope beyond contract; no hardcoded strings/colors/dims.
4. **in_review → mutation** — `reviews_lead` reports all 6 reviewers APPROVED (≤ 3 rounds, else escalate to human).
5. **mutation → pr_ready** — mutation score threshold met (100% on changed lines).
6. **pr_ready** — `dod_validator` marks every DoD item passing. Human opens/merges the PR → `done`.

## Artifact map — `docs/features/<name>/`

```
spec.md  risks.md  tasks.md  task-1.md … task-N.md
gherkin-scenarios.md
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
- `.agents/skills/storybook-e2e-tests/` — write Playwright e2e for Storybook components; owns the `.e2e.js` location convention (used by `tdd_craftsman`)
