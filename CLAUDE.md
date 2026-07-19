# CLAUDE.md

> **Purpose:** Operational context for Claude Code working in this repository — how to orient, where things live, and how to work. This file is **not** a functional-requirements document; product behavior and requirements live in the specifications (see section 4).

---

## 1. Product

Sport ITSM is an IT Service Management (ITSM) platform that supports the Sports Competition Management System (SCMS). It centralizes Incident, Service Request, Problem, Change, Release, and Asset & Configuration management for the SCMS platform, under SLAs and full traceability.
Scope is the **SCMS platform** (its defects, entitled services, Changes, Releases, and CMDB) — **not** the sporting operation itself; in-application sport decisions (reschedules, rosters, result disputes) are out of scope. Competition entities (Tournament, Match, Standings…) are the **affected subject** of a ticket, never tickets in their own right.

---

## 2. Technology Stack

> _To be defined by the tech-stack / architecture agent._ Do not assume, invent, or propose a stack until this section is filled.

---

## 3. Code Conventions, Folder Structure, Commands & Style Rules

> _To be defined by the architecture / engineering agent._ Do not invent conventions, folder structures, or commands until this section is filled. When completed, this section must include:
>
> - **Build / Test / Lint commands** — the exact commands to build, test, and lint.
> - **Folder structure** — the project layout and the purpose of each top-level folder.
> - **Style rules** — formatting, naming, and code-style conventions.
> - **What NOT to do** — anti-patterns and prohibited practices for this repo.

---

## 4. Specifications & OpenSpec Workflow

Specifications live under `openspec/` and are the canonical source of product behavior. Product functional requirements belong here, **never** in this file.

- **Canonical specs:** `openspec/specs/<capability>/spec.md` — the current, agreed-upon behavior per capability (e.g., `incident-management`, `service-request-management`, `change-management`, `release-management`, `asset-configuration-management`, `sla-management`, `service-catalog`).
- **Proposed changes:** `openspec/changes/<change-id>/` — each in-flight change holds `proposal.md` (the what/why), `tasks.md`, optional `design.md` (where stack/architecture detail is allowed), and spec deltas under `openspec/changes/<change-id>/specs/<capability>/spec.md`.

**Workflow:** `propose → implement → archive`.
1. **Propose** — create the change folder with a proposal and spec deltas describing the intended behavior change.
2. **Implement** — build against the approved deltas and complete the tasks.
3. **Archive** — once deployed, fold the deltas into the canonical specs and archive the change.

**Spec delta markers:** deltas use `## ADDED / MODIFIED / REMOVED Requirements` headers to describe how a change alters a capability's spec.

**Specs are technology-agnostic:** they describe behavior only (requirements, scenarios, business rules). Stack, architecture, and implementation detail belong in the change's `design.md` and are owned by engineering — never in a spec delta.

**AGENTS.md vs CLAUDE.md:** the OpenSpec convention also references an `AGENTS.md` file as the entry point for AI agents. In this repository, **CLAUDE.md** (this file) is the Claude Code operational file, and it points to `openspec/` as the specification source of truth.

---

## 5. Roles, Agents & Skills

### Agents (`.claude/agents/`)

Agents are **roles** with their own context and tools; they invoke skills for knowledge.

| Agent | Role |
|-------|------|
| **`sport-itsm-product-owner`** | Product Owner: owns backlog and product vision; writes Epics / User Stories / Gherkin acceptance criteria; translates approved requirements into OpenSpec Change Proposals and Spec Deltas. Grounded in `readme.md` §0.3/§1.1/§1.2. |
| **`sport-itsm-architect`** | Software Architect: owns the end-to-end architecture (frontend + backend) under Nx using DDD + Hexagonal; designs bounded contexts, defines the lib/tag structure and module boundaries, scaffolds Nx libraries, reviews the dependency graph, writes ADRs. |

### Skills (`.claude/skills/`)

Skills are **reusable knowledge/guardrails**, invokable by any agent or the main loop. They are layered by **altitude** (business → system → craft → stack → framework):

| Skill | Altitude | What it provides |
|-------|----------|------------------|
| **`service-desk-expert`** | Business / domain | ITSM service-management processes, functional analysis, and ITSM terminology. Domain depth for specs. |
| **`sport-itsm-architecture`** | System / structure | DDD + Hexagonal + Nx: bounded contexts, layer rules, tag scheme (`platform:`/`scope:`/`type:`), the module-boundary constraint matrix, shared contracts. |
| **`sport-itsm-engineering-principles`** | Craft (class/function) | SOLID + clean-code universals (DRY, KISS, YAGNI, naming, small functions, immutability, error handling) in TypeScript. Stack-agnostic. |
| **`sport-itsm-backend`** | Stack (backend) | NestJS 11 / TypeORM / PostgreSQL exact stack, conventions, commands, and guardrails. |
| **`sport-itsm-frontend`** | Stack (frontend) | Angular 20 / signals / Material exact stack, conventions, commands, and guardrails. |
| **`nestjs-best-practices`** | Framework technique (external) | Generic NestJS best-practice rules with examples (DI, security, performance…). Reference library. |
| **`angular-developer`** | Framework technique (external, official) | Generic modern-Angular technique (signals, forms, DI, SSR, a11y, testing). Reference library. |

### How they relate

- **Agents consume skills.** The **PO** uses `service-desk-expert` for domain depth. The **architect** uses `sport-itsm-architecture` + both stack skills + `sport-itsm-engineering-principles`, and may consult the two external skills.
- **Skills are layered, not overlapping.** Each altitude is a single source of truth and cross-references the others instead of duplicating: `sport-itsm-architecture` (system) ↔ `sport-itsm-engineering-principles` (the DIP is the micro-level form of the dependency rule); the two stack skills defer to both for structure and craft, adding only tech-specific rules.
- **Precedence.** The project skills (`sport-itsm-*`) are **project law** and **override** the generic external skills (`nestjs-best-practices`, `angular-developer`) wherever they differ — especially on stack, tooling, boundaries, and E2E (Cypress/Cucumber, not Supertest).
- **Behavior vs structure vs code.** Product behavior lives in `openspec/` (§4); how the system is structured and coded lives in the skills above; this `CLAUDE.md` only points to them.

**Language standard:** all product and specification artifacts are written in **technical English using standard Service Desk / ITSM terminology** (Incident, Service Request, Problem, Change, Release, SLA, OLA, CMDB, Configuration Item, Resolver Group, Major Incident; FCR, MTTR, MTTA, CSAT, RCA, KEDB, CAB), regardless of the language of the request.
