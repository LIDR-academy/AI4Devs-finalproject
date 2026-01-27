---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
handoffs: 
  - label: Create Tasks
    agent: speckit.tasks
    prompt: Break the plan into tasks
    send: true
  - label: Create Checklist
    agent: speckit.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```text
$ARGUMENTS
You MUST consider the user input before proceeding (if not empty).

Outline
Setup: Run .specify/scripts/powershell/setup-plan.ps1 -Json from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. For single quotes in args like "I'm Groot", use escape syntax: e.g. 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

Load context: Read ALL normative documents in this EXACT order of precedence:

FEATURE_SPEC (spec.md de la US actual)

.specify/memory/constitution.md (norma suprema)

.specify/instructions/delivery-playbook-backend.md

.specify/instructions/delivery-playbook-frontend.md

.specify/instructions/hexagonal-architecture-guide.md

.specify/instructions/engineering-guidelines.md

.specify/instructions/testing.instructions.md

.specify/instructions/backend.instructions.md

IMPL_PLAN template (already copied)

Apply normative hierarchy: In case of conflict, obey this order:

User Story + BDD (spec.md)

Constitution.md

Delivery Playbooks backend/frontend

Engineering Guidelines

Hexagonal Architecture Guide

Testing/Backend Instructions

IMPL_PLAN template

Execute plan workflow: Follow the structure in IMPL_PLAN template to:

Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")

Fill Constitution Check section from constitution

Evaluate gates (ERROR if violations unjustified)

Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)

Phase 1: Generate data-model.md, contracts/, quickstart.md

Phase 1: Update agent context by running the agent script

Re-evaluate Constitution Check post-design

Stop and report: Command ends after Phase 2 planning. Report branch, IMPL_PLAN path, and generated artifacts.

Non-Negotiable Rules (from Constitution & Playbooks)
❌ PROHIBITED in plan.md
Mentioning HTTP paths, methods, DTOs, headers, or specific status codes.

Naming concrete Java/TypeScript classes, method signatures, or detailed data schemas.

Naming concrete tools (Spectral, Testcontainers, WireMock, Resilience4j, Prometheus, Sentry, Snyk, Trivy, etc.).

Adding response-time targets, NFR metrics, circuit breakers, retries.

Defining technical state mechanisms (session repositories, TTLs, localStorage, custom headers).

Describing observability or deployment strategies.

Introducing artifacts not defined in Constitution/Playbooks (e.g. extra files under specs/).

✅ ONLY allowed in plan.md
Artifacts and EXACT paths defined in Constitution and Delivery Playbooks.

Abstract capabilities derived from BDD When clauses (no HTTP details).

Per-phase structure: Artifacts | Generic tools | Acceptance criteria | Prohibited.

Explicit references back to spec.md and Constitution.

Mandatory paths (from Constitution)
```text
1. BDD First        → /backend/tests/bdd/<boundedContext>/
2. API First        → /backend/src/main/resources/openapi/<boundedContext>/
3. Domain           → /backend/src/main/java/com/hexagonal/<boundedContext>/domain/
4. Application      → /backend/src/main/java/com/hexagonal/<boundedContext>/application/
5. Infrastructure   → /backend/src/main/java/com/hexagonal/<boundedContext>/infrastructure/
6. Controllers      → /backend/src/main/java/com/hexagonal/<boundedContext>/infrastructure/in/rest/
7. Frontend         → /frontend/src/{api,components,pages,hooks,state}/
8. Contracts        → /backend/tests/contracts/
9. E2E              → /backend/tests/e2e/ + /frontend/tests/e2e/
10. CI/CD           → .github/workflows/

All references to artifacts in plan.md MUST use these locations.

## Phases

### Phase 0: Outline & Research

Extract unknowns from the Technical Context section of the IMPL_PLAN template:

- Each **NEEDS CLARIFICATION** → one research task.
- Each external dependency → one best-practices task.
- Each integration point → one patterns task.

Generate and dispatch research agents as textual tasks (no code):
For each unknown in Technical Context:
Task: "Research {unknown} for {feature context}"

For each technology choice:
Task: "Find best practices for {tech} in {domain}"


Consolidate findings in `research.md` using this format:

- **Decision:** [what was chosen]  
- **Rationale:** [why chosen]  
- **Alternatives considered:** [what else evaluated]

**Output:**  
`research.md` with all NEEDS CLARIFICATION items resolved in business/architectural terms, without violating the Prohibited rules above.

---

### Phase 1: Design & Contracts

**Prerequisite:** `research.md` complete.

Extract entities from feature spec → `data-model.md`:

- Entity names and relationships only if they appear or are implied in `BDD/spec.md`.
- Validation rules taken from requirements/BDD.
- State transitions if explicitly described in `spec.md`.

**PROHIBITED:**  
Inventing new entities, fields, or rules not present in `spec.md`.

Generate API capabilities from functional requirements:

- For each BDD **When** clause → one abstract business capability.
- Describe the capability in business terms (no HTTP paths, methods, or DTOs).

**Output:**  
A list of capabilities in the IMPL_PLAN (not a full OpenAPI file).

---

### Agent context update

Run: .specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot


- Scripts detect which AI agent is in use.
- Update the appropriate agent-specific context file.
- Add only **NEW** technologies derived from this plan.
- Preserve manual additions between markers.

**Output:**

- `data-model.md` (minimal, BDD-driven)
- List of abstract capabilities
- `quickstart.md` if required by the IMPL_PLAN template

---

## Key Rules

- Use absolute paths taken from Constitution and Playbooks when referencing files.
- **ERROR** if any constitutional gate fails or any NEEDS CLARIFICATION remains unresolved at the end of Phase 1.
- Everything **MUST trace back to BDD**: if it is not in `spec.md` or reasonably implied by its BDD scenarios, it MUST NOT appear in `plan.md`.
- **Capability ≠ endpoint**: in `plan.md` describe capabilities as business actions derived from **When** clauses, never concrete API design.


