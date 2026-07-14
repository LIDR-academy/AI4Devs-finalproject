# ORCHESTRATOR.md — Agentic Orchestrator (source of truth)

> **Rule of precedence:** if this file conflicts with any agent/command/rule file, **this file wins** — except the canonical project rules in `.agents/rules/global.mdc`, `hooks-service-dao.mdc`, `atomic-design.mdc`, `component-split.mdc`, which always take precedence on _how code is written_. The step-by-step protocol lives in `.agents/agents/orchestrator_lead.md` and is **not** duplicated here.

Takes one user story from `user-stories/` to a validated, PR-ready feature through four phases, driven by `orchestrator_lead` with **one human gate up front** — a single combined approval of the spec + Gherkin contract. Full rationale: `/ORCHESTRATOR_PLAN.md`.

## Principles

- **One worktree per feature** (`git worktree add .worktrees/<name> -b feat/<name>`); all work — docs + code — happens there; the human merges the PR. **One feature at a time** (`progress/current.md`).
- **State on disk, not in chat.** Agents write to `docs/features/<name>/` and return one reference line (anti-"telephone" rule).
- **Strict TDD.** No production code without a failing test that demands it.
- **The review is the whole game.** Agents draft; judgment prunes. **Validation is compute-bound** — mutation proves the tests bite.

## Pipeline & state machine

```
pending
  → spec_partner        → spec.md, tasks.md, task-N.md, gherkin-scenarios.md
        (+ risks.md → gitignored tmp/<name>/, landed in docs/ at PR time)              [spec_drafted]
  → spec_reviewer       → review-spec.md  (loop with spec_partner, ≤ 2 rounds)          [spec_ready]
  → ⏸ HUMAN GATE: approve the spec + Gherkin contract (single approval)                 [approved]
  → implementator       → per vertical slice: build (TDD) → reviewer_slice (ONE agent,
        code + design lenses) → fix → commit; no slice N+1 until slice N is clean       [in_progress]
  ── quality gate (after all slices) ──
  → mutation_tester (pre-review)   → mutation.md; kill every survivor (≤ 2 rounds)      [mutation]
  → reviews_lead (full)            → CI once + the 2 reviewers (engineering, standards),
        skipping any the diff can't trigger → review.md; fix every finding;
        round 2 re-runs only the reviewer(s) with open findings (≤ 2 rounds)             [in_review]
  → mutation_tester (post-review)  → ONLY if the review changed source, scoped to the
        pre-review sha; kill every survivor (≤ 2 rounds)                                [mutation]
  → dod_validator       → dod.md (validate only, no PR)                                 [pr_ready]
  → ⟵ human opens & merges the PR                                                       [done]
```

Only `orchestrator_lead` writes the feature phase (in `tasks.md` frontmatter); `implementator` flips `task-N.md` statuses. Everything after the gate is autonomous up to `pr_ready`.

## Roles (see `.agents/agents/<name>.md` — each reviewer file carries its own rubric)

| Agent | Phase | Writes | Edits code? |
|---|---|---|---|
| `orchestrator_lead` | orchestrates all | `progress/*`, phase in `tasks.md` | no |
| `spec_partner` | 1 — spec + contract (debate) | spec bundle + `gherkin-scenarios.md` | no |
| `spec_reviewer` | 1 — spec review (pre-gate) | `review-spec.md` | no |
| `implementator` | 2 — build (TDD) | `src/`, `tests/`, `tdd.md`, task statuses | **yes** |
| `reviewer_slice` | 2 — per slice (code + design lenses, one agent) | `review-slice.md` | no |
| `reviews_lead` | 3 — full review round (CI once, reviewer/lens skipping) | `review.md` | no |
| `reviewer_engineering` (code · architecture · performance) / `reviewer_standards` (security · accessibility) | 3 — full only (2 agents in parallel, as applicable) | `review-engineering.md` / `review-standards.md` | no |
| `mutation_tester` | 3 — StrykerJS (pre-review; post-review only if the review changed source) | `mutation.md` | no |
| `dod_validator` | 4 — DoD | `dod.md` | no |

`implementator` is the **only** agent that edits feature code. Reviewers and leads prune, they don't patch.

## Models (per-agent `model:` frontmatter)

- **Opus** — `spec_partner` (highest-leverage reasoning).
- **Sonnet** — `orchestrator_lead`, `spec_reviewer`, `implementator`, `reviewer_slice`, `reviews_lead`, and both full reviewers (`reviewer_engineering`, `reviewer_standards`).
- **Haiku** — `mutation_tester`, `dod_validator` (mechanical).

## Gates (all must pass to advance — full detail in `orchestrator_lead.md` §Protocol)

1. **spec_drafted → spec_ready** — `spec_reviewer` clean (≤ 2 rounds).
2. **HUMAN GATE** — spec + contract approved together.
3. **per-slice** — lint + check-types + tests (+ e2e where relevant) green; slice `@s` covered; `tdd.md` ≤ 8 000 bytes; `reviewer_slice` clean (≤ 2 rounds, no minors accepted).
4. **mutation (pre-review)** — 100% killed on changed lines (≤ 2 rounds, else escalate).
5. **full review** — every finding fixed, any severity (≤ 2 rounds); after round 2: open blocker/major → escalate; only minors → ship as documented, human-accepted risks.
6. **mutation (post-review)** — only if the review changed source; 100% again on the review-fix files (≤ 2 rounds).
7. **pr_ready** — `dod_validator` all-pass; human opens/merges the PR → `done`.

## Artifact map — `docs/features/<name>/`

```
spec.md  tasks.md  task-1.md … task-N.md
gherkin-scenarios.md  review-spec.md  tdd.md
review-slice.md
review-engineering.md  review-standards.md
review.md  mutation.md  dod.md
risks.md   # lands here only at PR time (step 11); during the run it lives in tmp/<name>/
```

**`risks.md` is written to a gitignored `tmp/<name>/` folder** by `spec_partner` and is **never re-read into context** during the run (not reviewed, not part of the bundle). `orchestrator_lead` moves `tmp/<name>/risks.md` → `docs/features/<name>/risks.md` at PR prep (step 11) so it ships in the PR.

Session state: `progress/current.md` (active pointer) + `progress/history.md` (append-only, one line per entry).

## Token-efficiency rules (why the pipeline is shaped this way)

- **Rubrics live in each reviewer's agent file** — there is no shared review-standards doc loaded into every context.
- **CI runs once per review round** (by `reviews_lead`); reviewers never re-run `pnpm lint`/`check-types`/`test` — they get the status and judge the **diff**, not the world.
- **Two full reviewers** — `reviewer_engineering` (code · architecture · performance) always runs; `reviewer_standards` (security · accessibility) is skipped only on a types/docs-only diff with no UI and no security surface. Each agent self-marks any sub-lens the diff can't trigger as `N/A`; each skip is recorded in `review.md`. **Design-system review is not in the full review** — `reviewer_slice` covers it per slice. (Consolidating the review lenses cuts fan-out context/token cost.)
- **Round 2 re-runs only the reviewer(s) with open findings.**
- **Per-slice review is ONE agent** (`reviewer_slice`), not a lead + fan-out.
- **Post-review mutation is conditional** and scoped to the pre-review sha.
- **Quiet runners everywhere** — `turbo --output-logs=errors-only`; scoped `pnpm --filter <ws> test -- <file> --silent` during TDD cycles; Stryker `--logLevel warn` (log to file, read the summary); Playwright `--reporter=list`.
- **Artifact hygiene** — a fact lives in exactly one place, others link (ACs only in `gherkin-scenarios.md`; `tasks.md` a bare index; DoD cites rather than restates). Logs are summaries (`tdd.md` = `@s → test` map + one line per cycle, ≤ 8 000 bytes, enforced at each slice gate). One findings-only `review-<type>.md` per reviewer, overwritten each round — never `-r2`/`-r3` copies. State lines are one line. **`risks.md` never enters context** — written once to `tmp/<name>/`, landed in `docs/` only at PR time.

## Entry

```
/ticket-orchestrator <story>      # reads user-stories/pending/<story>.md, invokes orchestrator_lead
# Story lifecycle: user-stories/pending/ → (on start) in-progress/ → (on pr_ready) done/ — moved via git mv, committed on feat/<name>
```

## Definition of Done

See `/ORCHESTRATOR_PLAN.md` §7. Validated by `dod_validator`: Functionality · Code quality · Architecture · Design system · Security (OWASP) · Accessibility (WCAG 2.2 AA) · Testing rigor · Observability & i18n.

## Rules index (passive standards)

- `.agents/rules/global.mdc` — monorepo spec · `hooks-service-dao.mdc` — layering · `atomic-design.mdc` — component structure · `component-split.mdc` — UI file split · `tdd.mdc` — Three Laws, Red→Green→Refactor
- Reviewer rubrics: **in each `.agents/agents/reviewer_*.md` + `spec_reviewer.md`** (no separate rules file)

## Skills index (invocable procedures)

- `.agents/skills/gherkin-authoring/` — the `@s` contract (used by `spec_partner`)
- `.agents/skills/mutation-testing/` — StrykerJS scoped to changed files, `scripts/run-mutation.sh [base-ref]` (used by `mutation_tester`)
- `.agents/skills/storybook-e2e-tests/` — Playwright e2e for Storybook components (used by `implementator`)
- `.agents/skills/compact-docs/` — pre-PR doc cleanup (used by `orchestrator_lead`, step 10)
