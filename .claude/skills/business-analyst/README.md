# Business Analyst Subagent Skill

## Purpose

Generates the user stories for **one epic**, from the epic map. Stage 2 of the `backlog-creator` workflow.

Its defining job is not "turn requirements into stories" — it is **to write the difference between the specification and the running system**. Most requirements in this project are partly built, so a story that describes a feature which already half exists is worse than no story: it looks correct and sends someone to rebuild working code.

## Role

**Business Analyst (Stage 2 subagent)** — for the epic it is given:

- One story per unit of *remaining* work, shaped by the requirement's as-built state
- Given/When/Then acceptance criteria grounded in real code paths
- Traceability: story → requirement (`FR-`/`NFR-`) → persona (`PER-`) → epic

## Story shape by build state

| Build state | Shape | Reads code? |
|---|---|---|
| 🔴 Not built | **Greenfield** — the capability end to end | Optional |
| 🟡 Partial | **Gap** — only what is missing, naming what already works | **Required** |
| ⚫ Broken | **Defect** — what fails, why, and what correct looks like | **Required** |
| 🟢 Built | *(no story)* | — |
| 🔍 Unverified | Resolve against code first, then apply the row above | **Required** |

## Inputs

- `docs/backlog/epic-map.md` — the epic's section: key, requirement list, build states, "what actually remains"
- `docs/product/prd.md` — **only** the sections its requirements live in, never the whole file
- **The code** — mandatory for every 🟡 / ⚫ / 🔍 requirement

## Outputs

- `docs/backlog/<key>/user-stories.md` — stories with IDs `US-<key>-nn` (`US-PF-03`, `US-F2-01`, …)
- Findings, where the epic map and the code disagree

## Constraints

- **One epic per run.** A story outside the epic's requirement list is out of scope by definition.
- **Epic-scoped IDs.** `US-<key>-nn` only — this is what lets one epic be drilled while another stays untouched.
- **Never renumbers PRD IDs** (`P`, `BO-`, `F-`, `FR-`, `NFR-`, `PER-`).
- **Never re-derives the epic grouping or keys** — `epic-map.md` owns them.
- Acceptance criteria in English (`base-standards.md` §2).
- **Writes no tickets, estimates or test plans** — that is `architect-tech-lead`.

## Integration

Invoked by the `backlog-creator` orchestrator during a drill: `/backlog-creator <key>`.

Hands off to `architect-tech-lead`, which turns each story into `T-<key>-nn` tickets. A gap story must already have answered *"what part of this is left"*, or the ticket breakdown cannot size it.
