# epic-mapper Skill

## Purpose

Phase 1 of the `backlog-creator` workflow. Reads the PRD's requirement groups and their as-built status, cross-checks them against the code, and produces **`docs/backlog/epic-map.md`** — the artifact you decide from before generating any backlog.

Replaces the former `product-owner` skill, which extracted personas and requirements the PRD already carried with stable IDs. That was re-derivation, not analysis. This skill answers the question that actually blocks a decision: **what is left, grouped how, and how big is each group.**

## Role

**Epic mapper (Phase 1 subagent)** — loaded by the `sport-product-owner` agent.

## Reads from

- `docs/product/prd.md` — icon legend, §6 feature specs, §7 functional requirements, §8 NFRs
- `docs/product/implementation-baseline.md` — the code-side inventory, used as cross-check
- The code itself — for 🔍 Unverified requirements and PRD/baseline disagreements

## Writes

- `docs/backlog/epic-map.md` (the orchestrator persists it; this skill returns the data)

## Key outputs

- Per-epic requirement counts by build state (🔴 Not built · 🟡 Partial · ⚫ Broken · 🟢 Built)
- **Epic keys** — `F-1…F-6` where the PRD gives one, short mnemonics (`PF`, `PAY`, …) where it does not. These keys become the `US-<key>-nn` / `T-<key>-nn` ID prefixes, so nothing downstream may reassign them.
- Dependencies between epics, with inferred ones visibly labelled
- Relative size (S/M/L/XL) — never hours
- A provenance stamp (generation date, HEAD sha, PRD's last commit) that makes staleness detectable
- Findings where the PRD and the code disagree

## Constraints

- **Never renumbers or invents PRD IDs** — no new `F-` numbers, ever.
- **Never writes user stories or tickets** — that is `business-analyst` and `architect-tech-lead`.
- **Reports disagreements, does not resolve them** by picking a side.
- Output in English (`base-standards.md` §2).
