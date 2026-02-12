# GitHub Copilot — Strict Operational Instructions
**Project:** Meditation Builder  
**Scope:** Backend (Java 21 + Spring Boot + Hexagonal) and Frontend (React + TypeScript)

---

# 0. General Principle

Copilot operates in **strict mode** and must apply, without reinterpretation, the rules defined in:

1. User Story + BDD (`.feature`)
2. `.specify/memory/constitution.md`
3. `delivery-playbook-backend.md` / `delivery-playbook-frontend.md`
4. `engineering-guidelines.md`
5. `java21-best-practices.md` (Records, UUID, Clock, immutability)
6. `hexagonal-architecture-guide.md` and `testing.instructions.md`

This file only defines **how** Copilot uses those rules; it does not redefine architecture or pipeline.

---

# 1. Source Hierarchy

Copilot must respect the same order as the Constitution:

1. User Story + BDD
2. Constitution
3. Backend/Frontend Delivery Playbooks
4. Engineering Guidelines
5. **Java 21 Best Practices** (`java21-best-practices.md`)
6. Hexagonal Architecture Guide
7. Testing Instructions
8. THIS file (`copilot-instructions.md`)
9. Frameworks (Spring, React, etc.)

Copilot CANNOT contradict any higher-level source.

---

# 2. Behavior Rules (all tasks)

Copilot MUST:

- Maintain strict BDD compliance (nothing outside defined behavior).
- Follow hexagonal architecture and dependency rules.
- Apply DDD + TDD in backend.
- Use React Query + Zustand correctly in frontend.
- Respect repository paths according to Constitution/Hexagonal Guide:
  - Backend: `backend/src/main/java/com/hexagonal/<boundedContext>/...`
  - OpenAPI: `backend/src/main/resources/openapi/<boundedContext>/...`
  - Backend BDD features: `backend/src/test/resources/features/<boundedContext>/`
  - Backend BDD steps: `backend/src/test/java/.../bdd/`
  - Backend E2E: `backend/src/test/java/.../e2e/`
  - Backend contracts: `backend/src/test/contracts/`
  - Frontend: `frontend/src`, `frontend/tests/e2e`
- Always divide tasks by layer (never mix domain, application, infra, controllers, frontend in the same task).

---

# 3. Strictly Forbidden

Copilot MUST NOT:

- Generate endpoints not present in approved BDD/OpenAPI.
- Add fields to DTOs without being in OpenAPI.
- Create new business rules.
- Put business logic in controllers or infrastructure.
- Mix pipeline steps (e.g., generate domain before BDD+OpenAPI).
- Create domain models "in anticipation" without BDD backing.
- Use HTTP clients directly without going through domain ports.
- Generate persistence if the story doesn't require it.
- Use real external services in tests.
- Create tasks that mix multiple layers.

---

# 4. Instructions for `spec.md`

Copilot MUST:

- Generate 100% business narrative, understandable by PO/QA.
- Use consolidated BDD provided by the user.
- Include only:
  - Scope summary.
  - Business BDD scenarios.
  - Non-goals and business risks if requested.
- DO NOT include:
  - HTTP, JSON, DTOs, architecture, code, persistence.
  - Technical metrics, response times, formats, CI/CD.

---

# 5. Instructions for `plan.md`

Copilot MUST:

- Describe the complete story pipeline, phase by phase, **following exactly** the Constitution and Playbooks lifecycle.
- Explain what artifacts are generated and in which folders.
- Do not skip steps or mix layers.

---

# 6. Instructions for `tasks.md`

Copilot MUST:

- Generate micro-tasks by layer (domain / application / infra / controllers / frontend / tests).
- For each task: objective, artifacts, exact location, acceptance criteria.
- Do not anticipate future stories or add new endpoints.
- If a task touches multiple layers → divide it into multiple tasks.

---

# 7. Code Generation Rules

Copilot can only generate code when:

1. Executable `.feature` exists in red state.
2. Minimum validated OpenAPI exists for the story.
3. Complete `spec.md`, `plan.md` and `tasks.md` exist.
4. The user explicitly requests it.

### Backend

- Strict hexagonal architecture.
- Domain without Spring or infrastructure types.
- Use cases without business logic (only orchestration).
- Infrastructure that implements out ports.
- Controllers that comply with OpenAPI without deviations.

### Frontend

- Auto-generated OpenAPI client.
- React Query for server-state; Zustand for UI-state.
- No business logic in UI.
- Playwright for E2E.

---

# 8. Mandatory Testing (reminder)

Copilot must follow `testing.instructions.md` when suggesting tests:

- Backend:
  - Unit tests (domain + application).
  - Integration tests (infra).
  - Contract tests (OpenAPI).
  - BDD (Cucumber).
  - E2E.
- Frontend:
  - Unit tests (Jest/Vitest).
  - Integration (RTL + MSW).
  - E2E (Playwright).

---

# 9. CI/CD Gates

Copilot must consider the gates defined in Constitution and Testing Instructions as blocking:

1. BDD
2. API
3. Unit
4. Infra
5. Contract
6. E2E backend
7. E2E frontend

---

# 10. Anti-patterns (reject)

Copilot must actively avoid and suggest alternatives when it detects:

- God Objects.
- Mixed UI ↔ domain logic.
- Unrequested persistence.
- Duplicate classes.
- Tests without assertions.
- Endpoints not based on BDD.
- Design "for the future" without justification in stories/BDD.

---

# 11. Final Principle

Copilot must produce **conservative, traceable and aligned** results with:

- BDD + User Stories
- Constitution
- Playbooks
- Engineering and architecture guides

Never beyond what the business has defined.

END OF DOCUMENT
