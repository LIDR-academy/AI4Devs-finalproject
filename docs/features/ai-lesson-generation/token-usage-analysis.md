# Token usage analysis — `ai-lesson-generation` ticket-orchestrator run

## Bottom line

**16 subagent dispatches, ~1.98M subagent tokens**, plus the orchestrator's (main loop) own tokens on top of that — every `Bash` test/lint/e2e run, every doc edit, and 16 long self-contained prompts (each several hundred words, because fresh agents have zero memory of the conversation and had to be re-briefed from scratch every time).

That 1.98M also understates the real agent count: `reviews_lead`'s reported 227,542 tokens is a *single* number covering ~10 internal sub-invocations it fanned out itself (6 parallel reviewers round 1 + 1 implementer fix + 4 re-invoked reviewers round 2) — visible in its 215 tool calls. So the true work-unit count behind this session is closer to **25+ agent runs**, not 16.

## Per-phase breakdown

| Phase | Agent | Tokens | Tool calls | `.md` files it loaded | Main cost driver |
|---|---|---|---|---|---|
| Finalize slice-1 docs | implementer | 136K | 87 | 5× `.agents/rules/*.mdc`, `gherkin-scenarios.md`, `tasks.md`, `task-1`..`task-10.md` | Reading ~20 source+test files to build the `@s→test` map |
| Fix RadioGroup bug | implementer | 97K | 72 | none (self-contained bug report) | Tracing RN-web internals in `node_modules`, cross-component comparison |
| Review slice 1 (round 1) | reviewer_slice | 145K | 92 | `gherkin-scenarios.md`, `spec.md`, `tdd.md`, `task-1..10.md` | Reading the full 93-file slice-1 diff for both lenses |
| Fix slice-1 findings | implementer | 113K | 79 | none (findings embedded in prompt) | 5 fixes across 5 files + full test/e2e reruns |
| Review slice 1 (round 2) | reviewer_slice | 41K | 21 | `review-slice.md` (round 1) | Cheap — scoped to 5 changed files only |
| **Build slice 2** | implementer | **391K** | 260 | 5× `.mdc`, `spec.md`, `gherkin-scenarios.md`, `risks.md`, `task-11/12/13.md` | Biggest single call — ~30 source/test files across 5 workspaces + Deno mirror |
| Review slice 2 | reviewer_slice | 119K | 57 | `gherkin-scenarios.md`, `spec.md`, `risks.md`, `tdd.md`, `task-11/12/13.md` | Full slice-2 diff, both lenses |
| Build slice 3 | implementer | 136K | 79 | 5× `.mdc`, `spec.md`, `gherkin-scenarios.md`, `task-14/15.md` | i18n coverage-guard file is 267+ lines; 4 locale bundles |
| Review slice 3 | reviewer_slice | 64K | 43 | `gherkin-scenarios.md`, `spec.md`, `tdd.md` | Smallest slice diff |
| Mutation (pre-review) | mutation_tester | 36K | 6 | none really | Cheap — mechanical Stryker run |
| Kill mutation survivors | implementer | 142K | 50 | `mutation.md` (16KB pre-compaction, 41 survivor writeups) | Reading the whole report + iterative Stryker re-runs per fix |
| Verify mutation round 2 | mutation_tester | 56K | 15 | `mutation.md` | Independent equivalence re-tracing |
| **Full review** | reviews_lead | **228K** | 215 | `spec.md`, `gherkin-scenarios.md`, `risks.md`, `tasks.md`, all 15 `task-N.md`, `tdd.md`, `mutation.md` | Bundles 6 parallel reviewers (each re-reading spec/gherkin + the whole diff) + 1 fix round + 4 re-reviews |
| Mutation (post-review) | mutation_tester | 31K | 14 | `mutation.md` | Cheap — scoped to the 6-file fix diff |
| DoD validation | dod_validator | 64K | 33 | `spec.md`, `gherkin-scenarios.md`, `risks.md`, `tasks.md`, `review.md`, `mutation.md`, `tdd.md` | Re-runs lint/check-types/test/e2e/bootstrap itself, trusts nothing |
| Docs compaction | general-purpose | 182K | 57 | all 18 over-budget `.md` files | Read-then-rewrite doubles cost per file |

**Total: ~1,980,598 subagent tokens** across the 16 top-level dispatches above.

## Reference doc sizes (bytes)

Foundational rule files, loaded by nearly every `implementer`/`reviewer_slice` call:

| File | Bytes |
|---|---|
| `.agents/rules/atomic-design.mdc` | 2,334 |
| `.agents/rules/component-split.mdc` | 1,901 |
| `.agents/rules/global.mdc` | 4,401 |
| `.agents/rules/hooks-service-dao.mdc` | 4,952 |
| `.agents/rules/tdd.mdc` | 4,327 |
| **Total (the "always-loaded" rule set)** | **18,826** |

Feature docs, before vs. after the pre-PR compaction pass:

| File | Before | After |
|---|---|---|
| `mutation.md` | 16,003 | 3,110 |
| `spec.md` | 19,497 | 16,018 |
| `dod.md` | 8,763 | 3,721 |
| `review-security.md` | 10,298 | 3,703 |
| `review-accessibility.md` | 7,213 | 2,159 |
| `review-performance.md` | 7,032 | 2,539 |
| `review-architecture.md` | 5,913 | 1,925 |
| `review-code.md` | 4,894 | 1,983 |
| `review-design.md` | 4,152 | 1,424 |
| `review-slice.md` | 4,070 | 2,042 |
| `review-spec.md` | 3,151 | 2,059 |
| `review.md` | 4,550 | 3,008 |
| `risks.md` | 6,707 | 4,040 |
| `gherkin-scenarios.md` | 8,075 | 8,075 (left as-is — approved contract) |
| `tasks.md` | 5,050 | 3,689 |
| `task-1.md` / `task-4.md` / `task-10.md` | 4,872 / 4,901 / 4,176 | 3,695 / 4,275 / 3,502 |
| **Feature-folder total** | **158,486** | **100,136** |

## Why the total is this large — structural reasons

1. **Every non-fork agent starts with zero memory.** 16 separate dispatches each had to reload the "always-loaded" core doc set from scratch: 5× `.agents/rules/*.mdc` (~19KB), `spec.md` (16-19KB), `gherkin-scenarios.md` (8KB), `risks.md`, `tasks.md`, plus whichever `task-N.md` files applied. Roughly 40-50KB of pure doc re-reading, repeated 10+ times over the session — nothing shares a cache across separate `Agent` calls.
2. **TDD is inherently iterative.** `implementer` doesn't read once — it's read-test → write → run → read-failure → edit → rerun, per scenario, per task. Slice 2 alone covered 3 tasks across 5 workspaces, hence its 260 tool calls.
3. **Full review fans out in parallel and re-verifies.** `reviews_lead`'s 228K is really ~10 agent-equivalents (6 lenses × round 1, 4 lenses × round 2) collapsed into one reported number — each lens independently re-reads `spec.md`/`gherkin-scenarios.md` and the entire diff.
4. **Mutation reports are verbose by nature.** Stryker enumerated 367 mutants pre-review; `mutation.md` ballooned to 16KB describing 41 survivors with diffs before compaction — and `implementer` had to read that whole file to know what to fix.
5. **The orchestrator deliberately re-verified instead of trusting subagent self-reports.** Re-running `lint`/`check-types`/`test`/e2e after almost every slice before handing off to `reviewer_slice` caught 2 real bugs (a stray `package.json` diff, a `RadioGroup` accessibility bug) but meant some test suites ran 2-3× per slice.
6. **Docs compaction is a full read+rewrite of 18 files** — inherently ~2× the token cost of the content itself, since you can't trim what you haven't fully read.
7. **Prompts to each subagent were long by design.** Briefing a fresh agent well (file paths, line numbers, exact scope) means each of the 16 dispatch prompts ran 300-600 words — cheap to write, but it's context every subagent has to parse before doing anything.

None of this was wasted: the re-verification loop caught two real bugs, and the mutation/review loops killed 41+7 real gaps — but it's an inherently expensive pipeline. Fresh-context isolation is traded for correctness independence, at the cost of ~25+ agent-equivalents for a single feature.
