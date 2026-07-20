# Prompt Traceability Report

## 1. Product Overview

Prompt 1:
- **Source:** `acualuz-frontend/prompts/prompts-audit-setup.md` — `## Prompt - 2026-07-14T02:45:00Z` (`### Agent: Agent`)
- **Relevance:** The audit prompt requires validating Cursor governance against the operator SPA consuming six backend services and explicitly lists required reading on `docs/product/mvp-use-cases.md` (UC-001…UC-009), aligning with product-scope documentation for the delivery summary.
- **Excerpt/Summary:** Directs a frontend architecture audit of `.cursor/` configuration “building a production-ready React operator SPA that consumes the six backend services and covers UC-001…UC-009 documented in `docs/`,” with domain alignment against `frontend-design.md` and `backend-design.md`.

Prompt 2:
- **Source:** `acualuz-frontend/prompts/prompts-scrum-35.md` — `## Prompt - 2026-07-14T14:12:00Z` (`### Agent: orchestrator`)
- **Relevance:** Orchestration for SCRUM-35 ties the monitor operator experience to UC-001 and the Jira ticket, reflecting MVP product scope captured in delivery user-story and ticket sections.
- **Excerpt/Summary:** “Act as orchestrator. Run orchestrate for SCRUM-35. Track: frontend UC: UC-001 T: https://acualuz.atlassian.net/browse/SCRUM-35”

Prompt 3:
- **Source:** `acualuz-frontend/prompts/prompts-scrum-36.md` — `## Prompt - 2026-07-18T03:55:38Z` (`### Agent: orchestrator`)
- **Relevance:** SCRUM-36 orchestration anchors tracing product capabilities to UC-002 and related tracing use cases (UC-007/008/009 in the same track), which define operator-facing product behavior summarized under product overview.
- **Excerpt/Summary:** “Act as orchestrator. Run orchesttrate for SCRUM-36. Track: frontend UC: UC-002 T: https://acualuz.atlassian.net/browse/SCRUM-36” (followed by tracing module implementation scope under `frontend/`).

## 2. System Architecture

### 2.1. Architecture Diagram

Prompt 1:
- **Source:** `prompts/prompts-project-audit.md` — `## Prompt - 2026-06-23T04:01:57Z` (Agent: Agent)
- **Relevance:** Requested adding a flow diagram to document workflow architecture; closest allowed prompt explicitly calling for a diagram in project documentation (workflows/CI flow).
- **Excerpt/Summary:** "@.cursor/README.md add a section with a flow diagram to show how the workflows work."

Prompt 2:
- **Source:** `prompts/prompts-init.md` — `## Prompt - 2026-05-31T21:00:00Z` (Agent: skill:audit-config)
- **Relevance:** Audit persona explicitly assesses AWS Lambda API architecture guidance (API Gateway, Lambda, DynamoDB, IAM) — the same component set shown in architecture diagrams for this service.
- **Excerpt/Summary:** "Validate whether the rules and agents provide enough guidance for: Lambda Function design; API Gateway routing and contracts; IAM least privilege; … Logging and observability; Local and cloud testing."

Prompt 3:
- **Source:** `prompts/prompts-project-audit.md` — `## Prompt - 2026-06-23T05:30:00Z` (Agent: Agent)
- **Relevance:** README update prompt; committed README contains the Mermaid architecture-at-a-glance diagram reproduced in delivery documentation.
- **Excerpt/Summary:** "@README.md is out of date. The application is already deployed. … update @README.md with the appropiate updates."

### 2.2. Description of Main Components

Prompt 1:
- **Source:** `acualuz-frontend/prompts/prompts-audit-setup.md` — `## Prompt - 2026-07-14T02:45:00Z` (`### Agent: Agent`)
- **Relevance:** Required reading cites `docs/architecture/frontend-design.md` module map, API client structure, auth flow, and state management— the same component boundaries (six modules, API clients, Cognito auth) described in architecture component sections.
- **Excerpt/Summary:** Mandates assessment of “frontend SPA architecture guidance” and domain alignment using `frontend-design.md` sections on module map, API clients, auth, and state management plus `backend-design.md` API routes and contracts.

Prompt 2:
- **Source:** `acualuz-tracing/prompts/prompts-scrum-13.md` — `## Prompt - 2026-07-03T22:34:00Z` (`### Agent: Agent`)
- **Relevance:** Defines the tracing service’s AWS components (HTTP API, JWT authorizer, Lambdas, DynamoDB table, EventBridge, CloudWatch alarms)— concrete main components for one platform microservice.
- **Excerpt/Summary:** Requests `serverless.yml` for `acualuz-tracing` with “13 functions from manifest,” `TracingEventBus`, `TracingTable with PK/SK + GSI1,” Cognito JWT authorizer, and CloudWatch alarms for Lambda/API/DynamoDB/auth failures.

Prompt 3:
- **Source:** `acualuz-events/prompts/prompts-scrum-15.md` — `## Prompt - 2026-07-06T07:15:00Z` (`### Agent: backend-developer`)
- **Relevance:** Specifies the events service operational-event Lambda, DynamoDB persistence shape, idempotency, and EventBridge emission— documenting another named backend component in the six-service architecture.
- **Excerpt/Summary:** “Implement POST /api/events/operational (events-register-operational Lambda) with … DynamoDB persistence for OperationalEvent … Idempotency-Key support … Emit EVENTS_OPERATIONAL_EVENT_CREATED (EventBridge when EVENT_BUS_NAME set).”

### 2.3. High-Level Project Description and File Structure

Prompt 1:
- **Source:** `acualuz-frontend/prompts/prompts-scrum-35.md` — `## Prompt - 2026-07-14T14:21:00Z` (`### Agent: frontend-developer`)
- **Relevance:** Establishes the frontend repository layout decision (application under `frontend/` subdirectory, governance at repo root), which delivery file-structure sections document.
- **Excerpt/Summary:** “Bootstrap the React + TypeScript + Vite application under …/acualuz-frontend/frontend/ (NOT repo root) … User requires ALL application code under `frontend/` subdirectory.”

Prompt 2:
- **Source:** `acualuz-frontend/prompts/prompts-setup-cursor.md` — `## Prompt - 2026-07-14T01:40:00Z` (`### Agent: Agent`)
- **Relevance:** Updates README and bootstrap skills to document prerequisites, install, dev server, build, test, and deployment workflows— high-level project description and contributor file layout in the frontend repo.
- **Excerpt/Summary:** “Add dedicated README sections covering prerequisites, installation, development server, build, test, and deployment; document the applicable commands and workflow details, or explicitly label each unavailable workflow as ‘N/A — <reason>’ while scaffolding is absent.”

Prompt 3:
- **Source:** `acualuz-tracing/prompts/prompts-cursor-setup.md` — `## Prompt - 2026-06-24T22:22:29Z` (`### Agent: Agent`)
- **Relevance:** Fills `.cursor/domain.manifest.yaml` from imported `docs/` and Cursor setup— tying repository structure and domain manifest to platform documentation.
- **Excerpt/Summary:** “@.cursor/domain.manifest.yaml needs to be filled for this respository. Please update it using the necesary information given by @.cursor/ setup and imported @docs/ .”

### 2.4. Infrastructure & Deployment

Prompt 1:
- **Source:** `acualuz-frontend/prompts/prompts-deploy-production.md` — `## Prompt - 2026-07-15T00:17:47Z` (`### Agent: Agent`)
- **Relevance:** Adjusts production deploy pipeline behavior (post-deploy smoke checks, SonarCloud CI jobs)— infrastructure and deployment automation for the frontend static hosting path.
- **Excerpt/Summary:** “Relax post-deploy-smoke security header checks” with plan implementation; related entries refine `.github/workflows/ci.yml` SonarCloud execution and `deploy.yml` job documentation in develop-devops skill.

Prompt 2:
- **Source:** `acualuz-monitor/prompts/prompts-ci-cd-upgrade.md` — `## Prompt - 2026-06-05T21:49:27Z` (`### Agent: devops-engineer`)
- **Relevance:** Refactors CI/CD under `.github/` using GitHub Actions best practices— core to how services build, test, and deploy on AWS serverless baselines.
- **Excerpt/Summary:** “Refactor de ci/cd process under @.github/” referencing GitHub Actions CI/CD best-practices instructions for the devops-engineer agent.

Prompt 3:
- **Source:** `acualuz-frontend/prompts/prompts-vars-injection.md` — `## Prompt - 2026-07-19T04:04:00Z` (`### Agent: Agent`)
- **Relevance:** Patches `deploy.yml` with missing build-time environment variables required for production static deployment and per-service API Gateway URLs.
- **Excerpt/Summary:** “Patch deploy.yml with the missing env vars.”

### 2.5. Security

Prompt 1:
- **Source:** `acualuz-frontend/prompts/prompts-login-flow.md` — `## Prompt - 2026-07-17T18:21:00Z` (`### Agent: Agent`)
- **Relevance:** Fixes Cognito login and farm authorization regression (`/forbidden`), directly supporting documented auth flow and operator access control.
- **Excerpt/Summary:** “Fix Cognito login flow (/forbidden regression) … Implement the plan as specified.”

Prompt 2:
- **Source:** `acualuz-frontend/prompts/prompts-setup-cursor.md` — `## Prompt - 2026-07-14T01:20:00Z` (`### Agent: Agent`)
- **Relevance:** Updates `30-security.mdc` CSP directives, refresh-token cookie requirements, and token-storage prohibitions reflected in delivery security sections.
- **Excerpt/Summary:** Requires `object-src 'none'` and `base-uri 'self'` in CSP guidance; mandates httpOnly Secure SameSite refresh cookies and removes localStorage refresh-token fallback wording.

Prompt 3:
- **Source:** `acualuz-monitor/prompts/prompts-jwt-flow.md` — `## Prompt - 2026-06-22T23:45:00Z` (`### Agent: Agent`)
- **Relevance:** Addresses API Gateway JWT authorization and farm-scoped access (`FORBIDDEN` on list alerts)— backend security behavior paired with Cognito tokens.
- **Excerpt/Summary:** “Fix farm authorization FORBIDDEN on list alerts … Implement the plan as specified.”

### 2.6. Testing

Prompt 1:
- **Source:** `acualuz-frontend/prompts/prompts-audit-setup.md` — `## Prompt - 2026-07-14T02:45:00Z` (`### Agent: Agent`)
- **Relevance:** Audit scope explicitly includes “testing and quality gates” against `docs/architecture/testing-strategy.md`, matching delivery testing strategy content.
- **Excerpt/Summary:** Requires assessment of testing/quality gates and cites `docs/architecture/testing-strategy.md` in required reading alongside frontend and backend design docs.

Prompt 2:
- **Source:** `acualuz-events/prompts/prompts-integration-test.md` — `## Prompt - 2026-07-08T03:09:48Z` (`### Agent: Agent`)
- **Relevance:** Hardens CI integration tests (DynamoDB Local readiness in workflow)— infrastructure testing aligned with backend integration-test gates in delivery docs.
- **Excerpt/Summary:** CI workflow update so “integration tests begin” only after DynamoDB Local is ready via health check or wait step on the `dynamodb-local` service.

Prompt 3:
- **Source:** `acualuz-frontend/prompts/prompts-scrum-36.md` — `## Prompt - 2026-07-18T04:32:57Z` (`### Agent: frontend-developer`)
- **Relevance:** Specifies TDD, Vitest coverage gates, MSW contract tests, traceability blocks in tests, and vitest-axe accessibility— concrete frontend testing requirements for delivery testing sections.
- **Excerpt/Summary:** “TDD, Spanish UI via i18n … Traceability blocks in every test file (UC-002, T-018, routes, schemas) … accessibility (visible labels + axe) … Run … npm run test:unit -- --coverage.”

## 3. Data Model

Prompt 1:
- **Source:** `acualuz-tracing/prompts/prompts-scrum-13.md` — `## Prompt - 2026-07-03T22:34:00Z` (`### Agent: Agent`)
- **Relevance:** Provisions `TracingTable` with PK/SK and GSI1 in serverless resources— foundational tracing DynamoDB data model.
- **Excerpt/Summary:** “resources: TracingEventBus, TracingTable with PK/SK + GSI1.”

Prompt 2:
- **Source:** `acualuz-tracing/prompts/prompts-scrum-13.md` — `## Prompt - 2026-07-04T05:36:00Z` (`### Agent: Agent`)
- **Relevance:** Documents DynamoDB single-table key layout on species lot and idempotency items— explicit data-model documentation in code aligned with delivery data-model summaries.
- **Excerpt/Summary:** “Document the DynamoDB key layout directly on speciesLotItem, lotCodeIndexItem, and idempotencyItem … PK/SK/GSI1PK/GSI1SK formats and what entity each key prefix represents.”

Prompt 3:
- **Source:** `acualuz-events/prompts/prompts-scrum-15.md` — `## Prompt - 2026-07-06T07:15:00Z` (`### Agent: backend-developer`)
- **Relevance:** Defines OperationalEvent DynamoDB keys (PK `FARM#farmId`, SK `EVENT#eventId`, GSI1 zone/timestamp)— events domain entity model.
- **Excerpt/Summary:** “DynamoDB persistence for OperationalEvent (PK FARM#farmId, SK EVENT#eventId, GSI1 ZONE#zoneId / TS#iso8601).”

## 4. API Specification

Prompt 1:
- **Source:** `acualuz-frontend/prompts/prompts-scrum-36.md` — `## Prompt - 2026-07-18T04:32:57Z` (`### Agent: frontend-developer`)
- **Relevance:** Lists all ten tracing HTTP routes with schema identifiers and requires Zod DTOs matching backend contracts— direct API specification work for the tracing service consumed by the SPA.
- **Excerpt/Summary:** “Implement all 10 tracing functions with Zod DTOs matching schema identifiers exactly (createFishLot, getTracingKpis, … listLots) … Add tracing.test.ts contract tests.”

Prompt 2:
- **Source:** `acualuz-tracing/prompts/prompts-scrum-13.md` — `## Prompt - 2026-07-03T23:04:00Z` (`### Agent: backend-developer`)
- **Relevance:** Backend implementation gate for POST `/api/tracing/fish-lots` including OpenAPI contract validation targets— API specification enforcement on the tracing service.
- **Excerpt/Summary:** “Implement SCRUM-13 / T-003 / UC-002: POST /api/tracing/fish-lots … Finish quality gates (… open-api-validate …).”

Prompt 3:
- **Source:** `acualuz-events/prompts/prompts-scrum-15.md` — `## Prompt - 2026-07-06T07:15:00Z` (`### Agent: backend-developer`)
- **Relevance:** Specifies POST `/api/events/operational` request validation, OpenAPI schemas, and operational event categories— events API contract implementation.
- **Excerpt/Summary:** “Implement POST /api/events/operational (events-register-operational Lambda) with: Domain event category enum + validation (CLEANING, APPLICATION, MAINTENANCE, INSPECTION) … OpenAPI schemas …”

## 5. User Stories

Prompt 1:
- **Source:** `acualuz-frontend/prompts/prompts-scrum-37.md` — `## Prompt - 2026-07-18T20:11:00Z` (`### Agent: orchestrator`)
- **Relevance:** Explicitly requires story refinement before plan approval for UC-003 events module— user-story workflow tied to Jira SCRUM-37.
- **Excerpt/Summary:** “Before approving the plan, execute story refinement.”

Prompt 2:
- **Source:** `acualuz-frontend/prompts/prompts-scrum-38.md` — `## Prompt - 2026-07-18T23:57:00Z` (`### Agent: orchestrator`)
- **Relevance:** SCRUM-38 orchestration for UC-005 visitors module includes story refinement and quality gates— maps operator user stories to implementation.
- **Excerpt/Summary:** “Run orchesttrate for SCRUM-38 … UC: UC-005 … also not forget to execute story refinement and after implementation execute the quality gates.”

Prompt 3:
- **Source:** `acualuz-frontend/prompts/prompts-scrum-36.md` — `## Prompt - 2026-07-18T04:32:57Z` (`### Agent: frontend-developer`)
- **Relevance:** Maps Stitch screens to routes and use cases UC-002, UC-007, UC-008, UC-009— user-story acceptance captured as route/screen matrix.
- **Excerpt/Summary:** Table linking routes (`/tracing/fish/lots/new`, plant lot detail, stage advance, animal placeholder) to UC-002/007/008/009 and Stitch screen IDs.

## 6. Work Tickets

Prompt 1:
- **Source:** `acualuz-frontend/prompts/prompts-scrum-35.md` — `## Prompt - 2026-07-14T14:12:00Z` (`### Agent: orchestrator`)
- **Relevance:** Names Jira ticket SCRUM-35 and requires Jira status updates during workflow— direct work-ticket traceability.
- **Excerpt/Summary:** “T: https://acualuz.atlassian.net/browse/SCRUM-35”

Prompt 2:
- **Source:** `acualuz-monitor/prompts/prompts-scrum-6.md` — `## Prompt - 2026-06-21T03:25:54Z` (`### Agent: orchestrator`)
- **Relevance:** Backend orchestration for SCRUM-6 / UC-001 with explicit Jira URL and approval gates— monitor service ticket delivery.
- **Excerpt/Summary:** “Run orchestrate for SCRUM-6. Track: backend UC: UC-001 T: https://acualuz.atlassian.net/browse/SCRUM-6”

Prompt 3:
- **Source:** `acualuz-visitors/prompts/prompts-scrum-21.md` — `## Prompt - 2026-07-10T07:52:00Z` (`### Agent: orchestrator`)
- **Relevance:** SCRUM-21 backend ticket for UC-005 with Jira workflow updates— visitors service work ticket.
- **Excerpt/Summary:** “Run orchestrate for SCRUM-21. Track: backend UC: UC-005 T: https://acualuz.atlassian.net/browse/SCRUM-21”

## 7. Pull Requests

Prompt 1:
- **Source:** `acualuz-frontend/prompts/prompts-scrum-36.md` — `## Prompt - 2026-07-18T13:17:35Z` (`### Agent: Agent`)
- **Relevance:** CI failure on PR description validation embeds a full SCRUM-36 PR body (Summary, Traceability, routes, schemas)— documents how pull requests are structured and validated for this repository.
- **Excerpt/Summary:** GitHub Actions `validate-pr-sections` run with `PR_BODY` containing “## 📋 Summary … ## 🔗 Traceability … Routes consumed: POST /api/tracing/fish-lots …” for feat/SCRUM-36.

Prompt 2:
- **Source:** `acualuz-frontend/prompts/prompts-audit-setup.md` — `## Prompt - 2026-07-14T03:32:27Z` (`### Agent: Agent`)
- **Relevance:** Implements cursor audit upgrade plan including `.github/pull_request_template.md`, CodeRabbit, and Qodo config— foundational PR review artifacts referenced in delivery pull-request sections.
- **Excerpt/Summary:** “authored the new bootstrap-governance skill … underlying `.coderabbit.yaml`/`.pr_agent.toml`/`.github/pull_request_template.md`/`.github/CODEOWNERS` files were already created in prior turns on this branch.”

Prompt 3:
- **Source:** `acualuz-monitor/prompts/prompts-ci-cd-upgrade.md` — `## Prompt - 2026-06-07T04:26:57Z` (`### Agent: Agent`)
- **Relevance:** Implements standardized emoji PR description section titles— aligns with CodeRabbit/Qodo PR template requirements listed in delivery pull-request documentation.
- **Excerpt/Summary:** “PR description emoji section titles … Implement the plan as specified.”
