# Prompts Mapping Logs

Status: Approved
Last updated: 2026-05-25

> This document is a replica of [`prompts-1.md`](https://github.com/icsanabriar/acualuz-c4/tree/feat/setup-cursor/docs/deliveries/prompts-1.md).
> Source of truth: every fact in this document is taken from [`docs/prompts.md`](https://github.com/icsanabriar/acualuz-c4/tree/feat/setup-cursor/docs/prompts.md).
> Sections without supporting information in `docs/prompts.md` are explicitly marked as `Not documented in docs/prompts.md.`

## Summary

Maps the three most relevant entries from [`docs/prompts.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/prompts.md) to each section of the project delivery summary. Prompts whose scope is limited to `.cursor/` framework files, prompt-log maintenance, BMAD cross-reference dry runs, or generation of the meta-deliverable `README-1.md` itself are excluded. Sections without any qualifying prompt are marked `N/A` per the user instruction.

Each entry cites the prompt by its UTC heading in `docs/prompts.md` followed by a one-line summary of the desired outcome.

## 1. Product Overview

**Source artifacts:** 
- [`prd.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/product/prd.md)
- [`lean-canvas.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/product/lean-canvas.md)
- [`mvp-use-cases.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/product/mvp-use-cases.md)
- [`current-state.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/current-state.md)

**Prompt 1:** `2026-04-07T15:52:41Z` — Execute every mandatory architecture-iteration step (1–10) and produce all required artifacts, including the product documents from the `use-case` skill plus downstream PRD-workflow content consolidated into `prd.md` and `lean-canvas.md`.

**Prompt 2:** `2026-05-10T20:32:00Z` — Extend platform functionality to track diverse plant and animal lots beyond fish (orchestrator-driven iteration 2), refreshing product scope, use cases, and PRD descriptions.

**Prompt 3:** `2026-05-23T12:00:00Z` — Replace the diagram in `lean-canvas.md` (lines 27–119) with the pre-generated image `docs/product/images/lean-canvas.png`.

## 2. System Architecture

### 2.1. Architecture Diagram

**Source artifacts:** 
- [`architecture.dsl`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/dsl/architecture.dsl)
- [`C4 PNG renders`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/dsl/images)
- [`target-architecture.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/target-architecture.md)

**Prompt 1:** `2026-04-07T15:52:41Z` — Full 10-step iteration including `c4-design` (step 4), producing `target-architecture.md` and `architecture.dsl` with C4 system / container / component views.

**Prompt 2:** `2026-05-11T04:10:00Z` — Refactor to a unified `SpeciesLot` entity; iteration 3 updates the C4 DSL and target-architecture narrative to reflect consolidated tracing storage.

**Prompt 3:** `2026-05-24T02:30:00Z` — Fix broken references to the removed root-level `images/` folder; repoint every C4 diagram PNG link to `docs/dsl/images/`.

### 2.2. Description of Main Components

**Source artifacts:** 
- [`current-state.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/current-state.md)
- [`target-architecture.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/target-architecture.md)
- [`backend-design.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/backend-design.md)
- [`frontend-design.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/frontend-design.md)

**Prompt 1:** `2026-04-07T15:52:41Z` — Full iteration produces component descriptions via `c4-design`, `backend-design` (step 6), and `frontend-design` (step 7).

**Prompt 2:** `2026-05-10T20:32:00Z` — Multi-species tracing extension adds new `tracing` components (plant / animal registers, cross-species KPI surface) and updates target-architecture.

**Prompt 3:** `2026-05-11T04:10:00Z` — `SpeciesLot` consolidation collapses per-species lot components and events into the unified tracing component set documented in iteration-3 outputs.

### 2.3. High-Level Project Description and File Structure

**Source artifacts:** 
- [`repo-boundaries.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/repo-boundaries.md)
- [`backend-design.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/backend-design.md)
- [`frontend-design.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/frontend-design.md)

**Prompt 1:** `2026-04-07T15:52:41Z` — Full iteration including `repo-boundaries` (step 3) defines the seven-repository topology and per-service Go / React package layouts.

**Prompt 2:** `2026-04-09T20:11:24Z` — Split epics into per-repository files (`epics-<slug>.md`), aligning the product documentation structure with the repository boundaries.

**Prompt 3:** `2026-05-11T04:10:00Z` — `SpeciesLot` refactor iteration updates repo-boundary contracts and the backend package references for the unified tracing entity.

### 2.4. Infrastructure & Deployment

**Source artifacts:** 
- [`aws-cost.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/aws-cost.md)
- [`backend-design.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/backend-design.md)
- [`data-strategy.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/data/data-strategy.md)
- [`current-state.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/current-state.md)
- [`adr/002-serverless-aws-baseline.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/adr/002-serverless-aws-baseline.md)

**Prompt 1:** `2026-04-07T15:52:41Z` — Full iteration including `aws-cost` (step 8) and `backend-design` Lambda / environment configuration; establishes the serverless AWS baseline (Cognito + API Gateway HTTP + Lambda + DynamoDB + S3).

**Prompt 2:** `2026-04-07T15:41:13Z` — Run the `current-state` skill to produce `current-state.md`, documenting the planned (not yet deployed) runtime infrastructure status.

**Prompt 3:** `2026-05-11T04:10:00Z` — `SpeciesLot` iteration revises the cost estimate and backend environment variables for consolidated tracing storage (final approved baseline ≈ USD 5.87 / month).

### 2.5. Security

**Source artifacts:** 
- [`backend-design.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/backend-design.md)
- [`frontend-design.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/frontend-design.md)
- [`repo-boundaries.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/repo-boundaries.md)
- [`data-strategy.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/data/data-strategy.md)
- [`adr/003-cognito-authentication.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/adr/003-cognito-authentication.md)

**Prompt 1:** `2026-04-07T15:52:41Z` — Full iteration establishes Cognito JWT validation on every Lambda, the API Gateway auth model, frontend Cognito / Amplify patterns.

**Prompt 2:** `2026-04-07T15:43:48Z` — Kick off the mandatory architecture iteration from step 1, initiating the governed workflow that produced the security-related ADRs and design constraints.

**Prompt 3:** N/A — No prompt in `docs/prompts.md` targets security as a standalone deliverable; security content was authored implicitly inside the full-iteration prompts above.

### 2.6. Testing

**Source artifacts:** 
- [`testing-strategy.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/testing-strategy.md)
- [`mvp-tickets.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/product/mvp-tickets.md).

**Prompt 1:** `2026-05-25T01:02:00Z` — Generate the single complete testing-strategy Markdown document (unit / integration / regression / E2E / contract / security / performance / infrastructure layers, BDD-Gherkin scenarios, coverage and AWS-cost ceilings, pre-merge / CI gates, risk matrix, roadmap, documentation gaps).

**Prompt 2:** `2026-05-25T01:15:00Z` — Orchestrator-led consistency review of the testing strategy against the approved MVP architecture; verdict with critical / major / minor findings.

**Prompt 3:** `2026-05-25T01:30:00Z` — Quick-flow correction pass (`32-quick-flow.mdc`) to fix M1–M4 in `testing-strategy.md` (broken cross-refs, `validate-doc` CI scope, rule 90 artifact registration, complete E2E ticket matrix).

## 3. Data Model

**Source artifacts:** 
- [`data-model.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/data/data-model.md)
- [`events.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/data/events.md)
- [`data-strategy.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/data/data-strategy.md)

**Prompt 1:** `2026-04-07T15:52:41Z` — Full iteration including `data-design` (step 5), producing the initial single-table DynamoDB model, event catalog, and data strategy.

**Prompt 2:** `2026-05-10T20:32:00Z` — Multi-species extension introducing `FishLot`, `PlantLot`, and `AnimalLot` entities, species-specific lifecycle vocabulary, and new tracing events (iteration 2).

**Prompt 3:** `2026-05-11T04:10:00Z` — `SpeciesLot` consolidation replacing three per-species entities with a unified `SpeciesLot` (`SK = <SPECIES_SLUG>#<lotId>`) plus consolidated tracing events (iteration 3 — see ADR-007).

## 4. API Specification

**Source artifacts:** 
- [`backend-design.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/architecture/backend-design.md)

**Prompt 1:** `2026-04-07T15:52:41Z` — Full iteration including `backend-design` (step 6) registers every Lambda route, handler, and JSON Schema contract ID per service slug.

**Prompt 2:** `2026-05-10T20:32:00Z` — Multi-species iteration adds tracing routes for plant and animal lots and extends the API surface documented in `backend-design.md`.

**Prompt 3:** `2026-05-11T04:10:00Z` — `SpeciesLot` refactor updates tracing API contracts to the unified lot endpoints while preserving the species-specific request / response schemas.

## 5. User Stories

**Source artifacts:** 
- [`mvp-use-cases.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/product/mvp-use-cases.md)
- [`use-case-diagrams.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/product/use-case-diagrams.md)
- user-story sections of [`prd.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/product/prd.md)

**Prompt 1:** `2026-04-07T15:52:41Z` — Full iteration `use-case` skill (step 2) producing `mvp-use-cases.md` with `UC-001`–`UC-006` (iteration 1 baseline).

**Prompt 2:** `2026-05-10T20:32:00Z` — Multi-species extension adding `UC-007`, `UC-008`, and `UC-009` for plant / animal lot tracking and the cross-species KPI dashboard (iteration 2).

**Prompt 3:** `2026-05-23T21:05:00Z` — Replace the diagram in `prd.md` (lines 98–125) with `docs/product/images/lean-pillars.png`, refining the PRD's user-story / pillar visualization.

## 6. Work Tickets

**Source artifacts:** 
- [`mvp-tickets.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/product/mvp-tickets.md)
- [`jira-traceability.md`](https://github.com/icsanabriar/acualuz-c4/blob/feat/setup-cursor/docs/product/jira-traceability.md)

**Prompt 1:** `2026-04-07T15:52:41Z` — Full iteration `use-case` skill (step 2) producing `mvp-tickets.md` with `T-001`–`T-012` (iteration 1 baseline).

**Prompt 2:** `2026-05-10T20:32:00Z` — Multi-species iteration extends the ticket backlog to `T-013`–`T-018` for the new tracing and KPI capabilities.

**Prompt 3:** `2026-05-23T23:59:00Z` — Import the 18 MVP tickets into JIRA (project `acualuz-tech` / `SCRUM`), create per-service epics, and update documentation with bidirectional JIRA links in `jira-traceability.md`.

## 7. Pull Requests

**Source artifacts:** 
- None

**Prompt 1:** N/A.

**Prompt 2:** N/A.

**Prompt 3:** N/A.
