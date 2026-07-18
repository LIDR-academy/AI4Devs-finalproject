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

- **`sport-itsm-product-owner`** (`.claude/agents/`) — the Product Owner agent: owns the backlog and product vision, writes Epics / User Stories / Gherkin acceptance criteria, and translates approved requirements into OpenSpec Change Proposals and Spec Deltas.
- **`service-desk-expert`** (`.claude/skills/`) — the ITSM / Service Desk domain skill: authoritative source for service management processes, functional analysis, and ITSM terminology. Invoke it for domain depth when analyzing capabilities or drafting specifications.

**Language standard:** all product and specification artifacts are written in **technical English using standard Service Desk / ITSM terminology** (Incident, Service Request, Problem, Change, Release, SLA, OLA, CMDB, Configuration Item, Resolver Group, Major Incident; FCR, MTTR, MTTA, CSAT, RCA, KEDB, CAB), regardless of the language of the request.
