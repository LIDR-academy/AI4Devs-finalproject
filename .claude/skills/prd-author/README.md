# PRD Author Skill

## Purpose

Authors the **Product Requirements Document (PRD)** for Sport ITSM and the foundational product-analysis artifacts around it (personas, roadmap). It turns the strategic proposal into a decision-ready PRD.

## Role

**Product Owner** — synthesizes and structures:

- Product vision & positioning
- Business objectives / OKRs and the monetization model
- User personas (role-scoped)
- Scope: MVP vs post-MVP vs out-of-scope
- Functional & non-functional requirements (traceable, testable)
- Success metrics (north-star + funnel KPIs)
- Prioritization (MoSCoW + RICE) and release roadmap

## Inputs (mandatory sources)

- `docs/strategic/00.Sport ITSM — Strategic MVP Proposal (EN).md` — primary source of truth
- `CLAUDE.md` — architecture + license system
- `docs/standards/data-model.md` — current domain model (traceability)
- `docs/standards/documentation-standards.md` — how the doc must be written

## Outputs

- `docs/product/PRD.md` — the PRD (primary)
- `docs/product/personas.md`, `docs/product/roadmap.md` — optional companions

## Structure

The full section-by-section PRD structure is in [`references/prd-template.md`](references/prd-template.md).

## Owner

Loaded and executed by the `sport-product-owner` agent (Mode 1 — strategic / document authoring). For building the epic map from an _existing_ PRD (backlog pipeline), that agent uses the sibling `epic-mapper` skill instead (Mode 3).

## Gates

The workflow is gated: vision & objectives → personas → scope & requirements → metrics & prioritization → assemble. It does **not** auto-generate the PRD; it stops for user approval at each gate and writes `docs/product/PRD.md` only on explicit approval.
