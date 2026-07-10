# Auto-Orchestration Rules (Lean MVP)

## Default Behavior

For non-trivial requests, act as a coordinated team using only the minimum set of agents, rules, skills, and workflows needed to deliver value quickly for the MVP.

Avoid over-orchestration.

---

## Required Context Alignment

Before responding to non-trivial requests, align context in this order:

1. user request
2. `README.md`
3. `project_context.md`
4. `architecture.md`
5. `tech_stack.md`
6. `.github/rules/*`
7. `.github/workflows-ai/*`
8. `.github/skills/*`

Do not invent business rules, architecture constraints, or technology choices outside documented project context.

---

## MVP Completion Criteria

For any user-visible or operationally relevant change:

- update `CHANGELOG.md` when present
- update affected docs in the same task when needed

---

## Core Workflows

Use these workflows by default:

| User Intent | Workflow |
|---|---|
| New feature, user story, capability | `.github/workflows-ai/feature-development.workflow.md` |
| Bug, broken behavior, regression | `.github/workflows-ai/bugfix.workflow.md` |
| QA or regression validation | `.github/workflows-ai/testing.workflow.md` |
| Security-sensitive changes | `.github/workflows-ai/security-review.workflow.md` |
| Release and deploy readiness | `.github/workflows-ai/release.workflow.md` |

Other workflows are optional and should be used only when explicitly needed.

---

## Core Agents (8)

Use only these agents unless the user explicitly asks to expand:

1. `orchestrator`
2. `product-owner`
3. `backend-developer`
4. `frontend-developer`
5. `qa-engineer`
6. `security-reviewer`
7. `devops-engineer`
8. `ai-estimation-engineer`

### Selection Hints

- Use `product-owner` for unclear requirements and acceptance criteria.
- Use `backend-developer` for APIs, business logic, persistence, and integrations.
- Use `frontend-developer` for UI, forms, and API integration.
- Use `qa-engineer` for test scenarios, edge cases, and regression risk.
- Use `security-reviewer` for auth, sensitive data, permissions, and public endpoints.
- Use `devops-engineer` for CI/CD, environments, deploys, and runtime reliability.
- Use `ai-estimation-engineer` for prompts, schema stability, parsing reliability, and token/cost estimation logic.

---

## Minimal Skill Set (10)

Use this reduced set of skills:

- `backend-api-design.skill.md`
- `backend-implementation.skill.md`
- `backend-persistence.skill.md`
- `backend-error-handling.skill.md`
- `frontend-component-design.skill.md`
- `frontend-api-integration.skill.md`
- `test-strategy.skill.md`
- `security-review.skill.md`
- `ci-cd-design.skill.md`
- `ai-estimation-contract.skill.md`

---

## Ticket Routing (T01-T12)

Use this matrix as the default execution contract for the MVP backlog.

| Ticket | Primary Workflow | Required Agents | Required Skills |
|---|---|---|---|
| T01 Data model and Prisma schema | `.github/workflows-ai/feature-development.workflow.md` | `backend-developer` | `backend-persistence.skill.md`, `backend-implementation.skill.md` |
| T02 Projects API endpoints | `.github/workflows-ai/feature-development.workflow.md` | `backend-developer`, `qa-engineer` | `backend-api-design.skill.md`, `backend-error-handling.skill.md`, `test-strategy.skill.md` |
| T03 Estimation endpoint with Azure OpenAI | `.github/workflows-ai/feature-development.workflow.md` | `backend-developer`, `ai-estimation-engineer`, `security-reviewer`, `qa-engineer` | `backend-implementation.skill.md`, `ai-estimation-contract.skill.md`, `security-review.skill.md`, `test-strategy.skill.md` |
| T04 Structured estimation prompt | `.github/workflows-ai/feature-development.workflow.md` | `ai-estimation-engineer`, `backend-developer`, `qa-engineer` | `ai-estimation-contract.skill.md`, `backend-error-handling.skill.md`, `test-strategy.skill.md` |
| T05 Project creation form | `.github/workflows-ai/feature-development.workflow.md` | `frontend-developer`, `qa-engineer` | `frontend-component-design.skill.md`, `frontend-api-integration.skill.md`, `test-strategy.skill.md` |
| T06 Use case form | `.github/workflows-ai/feature-development.workflow.md` | `frontend-developer`, `qa-engineer` | `frontend-component-design.skill.md`, `frontend-api-integration.skill.md`, `test-strategy.skill.md` |
| T07 Role selection and estimation trigger | `.github/workflows-ai/feature-development.workflow.md` | `frontend-developer`, `backend-developer`, `qa-engineer` | `frontend-api-integration.skill.md`, `backend-api-design.skill.md`, `test-strategy.skill.md` |
| T08 Report view | `.github/workflows-ai/feature-development.workflow.md` | `frontend-developer`, `qa-engineer` | `frontend-component-design.skill.md`, `frontend-api-integration.skill.md`, `test-strategy.skill.md` |
| T09 Unit tests | `.github/workflows-ai/testing.workflow.md` | `qa-engineer`, `backend-developer` | `test-strategy.skill.md`, `backend-implementation.skill.md` |
| T10 Integration tests | `.github/workflows-ai/testing.workflow.md` | `qa-engineer`, `backend-developer` | `test-strategy.skill.md`, `backend-api-design.skill.md`, `backend-persistence.skill.md` |
| T11 E2E test | `.github/workflows-ai/testing.workflow.md` | `qa-engineer`, `frontend-developer`, `backend-developer` | `test-strategy.skill.md`, `frontend-api-integration.skill.md` |
| T12 Deploy and environment config | `.github/workflows-ai/release.workflow.md` | `devops-engineer`, `security-reviewer`, `qa-engineer` | `ci-cd-design.skill.md`, `security-review.skill.md`, `test-strategy.skill.md` |

### Ticket Guardrails

1. No ticket starts without explicit acceptance criteria from `README.md`.
2. T03 and T04 always require output-contract validation before merge.
3. Any ticket touching public API or secrets must include `security-reviewer`.
4. T09-T11 must include at least one failing-path scenario, not only happy path.
5. T12 requires rollback notes and environment variable checklist.

### Escalation Rules

1. Bring in `product-owner` when requirements are ambiguous.
2. Bring in `orchestrator` when a ticket crosses backend, frontend, and deploy concerns.
3. If one ticket scope exceeds 1 PR, split into sub-tasks and keep traceability to the original ticket ID.

---

## Response Style for Non-Trivial Tasks

Keep responses concise and execution-focused.

Structure:

1. detected workflow
2. participating agents (only necessary ones)
3. implementation output
4. risks and validation
5. next step

Avoid verbose multi-agent reports unless the user asks for detailed analysis.
