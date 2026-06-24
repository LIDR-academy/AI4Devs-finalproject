# Prompt Traceability Report

> **Scope:** Allowed sources are `prompts/*.md` files only. **`prompts/prompts-entrega2-ics.md` and any path containing `prompts-entrega2-ics` were excluded** from search, ranking, and all entries below.

---

## 1. Product Overview

Prompt 1:
- **Source:** `prompts/prompts-project-audit.md` — `## Prompt - 2026-06-23T05:30:00Z` (Agent: Agent)
- **Relevance:** Directly requested updating `README.md` after production deployment and accumulated changes; README is the primary committed source for product overview, routes, deployment status, and UC-001 scope in delivery documentation.
- **Excerpt/Summary:** "@README.md is out of date. The application is already deployed. Also there were changes made over the time. Review from @README.md commit until the current changes and update @README.md with the appropiate updates."

Prompt 2:
- **Source:** `prompts/prompts-scrum-6.md` — `## Prompt - 2026-06-21T03:25:54Z` (Agent: orchestrator)
- **Relevance:** Initiated backend orchestration for SCRUM-6 / UC-001 environmental batch ingestion — the core product capability documented under Product Overview (environmental readings import).
- **Excerpt/Summary:** "Act as orchestrator. Run orchestrate for SCRUM-6. Track: backend. UC: UC-001. T: https://acualuz.atlassian.net/browse/SCRUM-6. Stop for my approval after the plan and after the PR description."

Prompt 3:
- **Source:** `prompts/prompts-scrum-12.md` — `## Prompt - 2026-06-21T07:08:03Z` (Agent: orchestrator)
- **Relevance:** Initiated backend orchestration for SCRUM-12 / UC-001 chemical reading capture and alerts listing — the remaining monitor product features in the overview.
- **Excerpt/Summary:** "Act as orchestrator. Run orchestrate for SCRUM-12. Track: backend. UC: UC-001. T: https://acualuz.atlassian.net/browse/SCRUM-12. Stop for my approval after the plan and after the PR description."

---

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
- **Source:** `prompts/prompts-init.md` — CodeRabbit nitpick in `## Prompt - 2026-06-01T05:20:00Z` block (Agent: Agent)
- **Relevance:** Documents the `monitor-environmental-import` Lambda, its HTTP route, and Cognito scope — a primary product component in the architecture description.
- **Excerpt/Summary:** "monitor-environmental-import Lambda (handler bootstrap) ingests environmental readings via POST /api/monitor/readings/environmental and requires the cognito scope monitor.write."

Prompt 2:
- **Source:** `prompts/prompts-project-audit.md` — `## Prompt - 2026-06-23T04:51:41Z` (Agent: Agent)
- **Relevance:** Triggered observability alignment across handlers and runbooks — components include structured logging, EMF metrics, and discovery/product Lambdas documented in the architecture section.
- **Excerpt/Summary:** "Observability alignment plan — Implement the plan as specified … To-do's from the plan have already been created."

Prompt 3:
- **Source:** `prompts/prompts-scrum-12.md` — `## Prompt - 2026-06-21T07:25:00Z` (Agent: skill:develop-backend)
- **Relevance:** Explicitly scoped implementation of `POST /api/monitor/readings/chemical` and `GET /api/monitor/alerts` — two of the six documented Lambdas/components.
- **Excerpt/Summary:** "implement POST /api/monitor/readings/chemical and GET /api/monitor/alerts per the approved plan in .tmp/orchestration-run.md. Follow TDD; mirror environmental-import patterns; Refs: UC-001, T-002."

### 2.3. High-Level Project Description and File Structure

Prompt 1:
- **Source:** `prompts/prompts-init.md` — `## Prompt - 2026-06-01T05:20:00Z` (Agent: Agent), bootstrap-backend references in same file
- **Relevance:** References `bootstrap-backend` skill and `src/cmd/`, `internal/`, `pkg/` layout expectations aligned with backend-design package structure.
- **Excerpt/Summary:** Nitpick and skill updates instruct agents to scaffold under `src/cmd/`, `src/internal/{handler,usecase,domain,repository}`, and `src/pkg/auth` without implementing full business logic in bootstrap.

Prompt 2:
- **Source:** `prompts/prompts-agents-upgrade.md` — `## Prompt - 2026-06-03T00:00:00Z` (Agent: Agent)
- **Relevance:** Introduced `.cursor/domain.manifest.yaml` and branch-scoped prompt governance — manifest defines routes, Lambdas, entities, and file-structure anchors used in project description.
- **Excerpt/Summary:** Branch-scoped prompt log and domain manifest work (file begins with domain manifest / prompt governance upgrade on branch `feat/agents-upgrade`).

Prompt 3:
- **Source:** `prompts/prompts-ci-cd-upgrade.md` — `## Prompt - 2026-06-07T05:19:19Z` (Agent: Agent)
- **Relevance:** Strengthened `scripts/validate-domain-manifest.sh` counting of `productRoutes` — validates the same route/Lambda inventory documented in file-structure and manifest sections.
- **Excerpt/Summary:** "replace the fragile awk block that sets product_route_count with a robust YAML parse … to count entries under the productRoutes key."

### 2.4. Infrastructure & Deployment

Prompt 1:
- **Source:** `prompts/prompts-main.md` — `## Prompt - 2026-06-21T18:00:00Z` (Agent: Agent)
- **Relevance:** Diagnosed and drove fixes for `make deploy STAGE=production` failures (Cognito SSM resolution) — core production deployment path documented in Infrastructure & Deployment.
- **Excerpt/Summary:** "Cannot resolve variable at provider.environment.COGNITO_USER_POOL_ID … Cannot resolve variable at provider.environment.COGNITO_CLIENT_ID … make: *** [Makefile:162: deploy] Error 1"

Prompt 2:
- **Source:** `prompts/prompts-ci-deploy.md` — `## Prompt - 2026-06-22T00:55:00Z` (Agent: Agent)
- **Relevance:** Fixed `deploy.yml` workflow error for post-deploy smoke `PRODUCTION_BASE_URL` — directly affects documented production base URL and smoke checks.
- **Excerpt/Summary:** "Invalid workflow file … Unrecognized named-value: 'secrets' … secrets.PRODUCTION_BASE_URL"

Prompt 3:
- **Source:** `prompts/prompts-docs-audit.md` — `## Prompt - 2026-06-09T02:13:18Z` (Agent: Agent)
- **Relevance:** Requested documentation headers for `.github/workflows/deploy.yml` — the deploy pipeline artifact referenced in infrastructure documentation.
- **Excerpt/Summary:** "@.github/workflows/deploy.yml add Docstring for this code."

### 2.5. Security

Prompt 1:
- **Source:** `prompts/prompts-token-claims.md` — `## Prompt - 2026-06-22T22:37:59Z` (Agent: Agent)
- **Relevance:** Implemented farm authorization via Cognito groups (`farm:<farmId>`) — central to documented BOLA/farm-scope security model on product routes.
- **Excerpt/Summary:** "Fix farm authorization via Cognito Groups (no Pre Token Generation) — Implement the plan as specified."

Prompt 2:
- **Source:** `prompts/prompts-cognito-scopes.md` — `## Prompt - 2026-06-22T21:43:07Z` (Agent: Agent)
- **Relevance:** Aligned API Gateway authorizer scopes (`monitor/read`, `monitor/write`) with Cognito resource server — documented in Security and API auth columns.
- **Excerpt/Summary:** "Is it possible to update API Gateway authorizer scopes to fix insufficient_scope (monitor.read vs Cognito monitor/read)?"

Prompt 3:
- **Source:** `prompts/prompts-scrum-12.md` — `## Prompt - 2026-06-21T20:38:10Z` (Agent: Agent)
- **Relevance:** CodeRabbit review addressed request body size limits (256 KB) and OpenAPI-driven validation on chemical import — OWASP API4 resource-consumption controls in Security section.
- **Excerpt/Summary:** "Add a 256 KB byte limit to req.Body before passing it to the parseChemicalReadingBody function by wrapping req.Body with http.MaxBytesReader set to 256 KB (262144 bytes)."

### 2.6. Testing

Prompt 1:
- **Source:** `prompts/prompts-scrum-6.md` — `## Prompt - 2026-06-21T05:23:45Z` (Agent: Agent)
- **Relevance:** Raised docstring coverage gate failure (80% threshold) for pre-merge checks — directly tied to documented testing/quality gates.
- **Excerpt/Summary:** "Docstring coverage is 25.78% which is insufficient. The required threshold is 80.00% the pre-merge check is not passing."

Prompt 2:
- **Source:** `prompts/prompts-scrum-12.md` — `## Prompt - 2026-06-21T18:25:00Z` (Agent: Agent)
- **Relevance:** CI unit-test failure on domain layer 100% coverage floor — matches per-layer coverage thresholds in Testing strategy documentation.
- **Excerpt/Summary:** "internal/domain line coverage: 99.1% (floor 100%) … make[1]: *** [Makefile:74: coverage-floor] Error 1"

Prompt 3:
- **Source:** `prompts/prompts-sonarcloud-integration.md` — `## Prompt - 2026-06-23T16:06:00Z` (Agent: skill:audit-config)
- **Relevance:** Initiated SonarCloud integration audit and upgrade plan — SonarCloud is listed as a CI static-analysis gate in Testing documentation.
- **Excerpt/Summary:** "@.cursor/skills/audit-config/SKILL.md run the audit. Target score 98."

---

## 3. Data Model

Prompt 1:
- **Source:** `prompts/prompts-scrum-6.md` — `## Prompt - 2026-06-21T06:04:00Z` (Agent: Agent)
- **Relevance:** Review finding on `monitor_repository.go` GetItem idempotency `ConsistentRead` — touches DynamoDB access patterns for monitor table entities.
- **Excerpt/Summary:** "Verify ConsistentRead finding on monitor_repository.go GetItem idempotency calls."

Prompt 2:
- **Source:** `prompts/prompts-scrum-12.md` — `## Prompt - 2026-06-21T20:38:10Z` (Agent: Agent)
- **Relevance:** CodeRabbit findings on `chemical.go` timestamp validation and `monitor_repository.go` cursor encoding — domain validation and repository persistence for `ChemicalReading` entity.
- **Excerpt/Summary:** "ValidateChemicalReading … Parse the RecordedAtRaw string directly using RFC3339 parsing … Replace base64.StdEncoding with base64.URLEncoding in encodeCursor and decodeCursor functions."

Prompt 3:
- **Source:** `prompts/prompts-sonarcloud-integration.md` — integration-test excerpt in late prompts (Agent: Agent)
- **Relevance:** Added DynamoDB integration-test exemplar with table waiter for `PutEnvironmentalReading` — validates data-model write path against DynamoDB Local.
- **Excerpt/Summary:** "After the CreateTable call in the test setup, add a waiter that blocks until the DynamoDB table reaches ACTIVE status before proceeding with repository calls like PutEnvironmentalReading."

---

## 4. API Specification

Prompt 1:
- **Source:** `prompts/prompts-project-audit.md` — `## Prompt - 2026-06-23T04:22:07Z` (Agent: Agent)
- **Relevance:** Explicitly requested regenerating human-readable API schema documentation from the OpenAPI spec — primary API specification companion doc.
- **Excerpt/Summary:** "Update schema-reference.md from open-api.yaml"

Prompt 2:
- **Source:** `prompts/prompts-project-audit.md` — `## Prompt - 2026-06-23T12:02:00Z` (Agent: Agent)
- **Relevance:** Clarified scope of `schema-reference.md` vs full `open-api.yaml` route set (product vs discovery routes) — directly shapes API specification tables in delivery docs.
- **Excerpt/Summary:** "open-api.yaml contains 6 total routes including 3 discovery routes (/healthz, /open-api.json, /docs) … add a clarifying note … scope is intentionally limited to product routes only."

Prompt 3:
- **Source:** `prompts/prompts-ci-cd-upgrade.md` — `## Prompt - 2026-06-07T05:00:53Z` (Agent: Agent)
- **Relevance:** Renamed discovery HTTP route to `/open-api.json` — one of six documented API endpoints in the specification section.
- **Excerpt/Summary:** "Rename HTTP route to `/open-api.json` — Implement the plan as specified."

---

## 5. User Stories

Prompt 1:
- **Source:** `prompts/prompts-scrum-6.md` — `## Prompt - 2026-06-21T03:25:54Z` (Agent: orchestrator)
- **Relevance:** Names UC-001 and Jira SCRUM-6 (T-001 environmental batch ingestion user story / ticket).
- **Excerpt/Summary:** "UC: UC-001. T: https://acualuz.atlassian.net/browse/SCRUM-6"

Prompt 2:
- **Source:** `prompts/prompts-scrum-12.md` — `## Prompt - 2026-06-21T07:08:03Z` (Agent: orchestrator)
- **Relevance:** Names UC-001 and Jira SCRUM-12 (T-002 chemical + alerts user story / ticket).
- **Excerpt/Summary:** "UC: UC-001. T: https://acualuz.atlassian.net/browse/SCRUM-12"

Prompt 3:
- **Source:** `prompts/prompts-scrum-12.md` — `## Prompt - 2026-06-21T07:32:00Z` (Agent: skill:jira-sync)
- **Relevance:** Requested updating Jira ticket status after SCRUM-12 implementation — ties delivered work to user-story tracking in Jira.
- **Excerpt/Summary:** "Update the status of the ticket in jira."

---

## 6. Work Tickets

Prompt 1:
- **Source:** `prompts/prompts-scrum-6.md` — `## Prompt - 2026-06-21T03:25:54Z` (Agent: orchestrator)
- **Relevance:** Work ticket SCRUM-6 (maps to T-001: Environmental batch ingestion API) with explicit Jira URL.
- **Excerpt/Summary:** "Run orchestrate for SCRUM-6 … T: https://acualuz.atlassian.net/browse/SCRUM-6"

Prompt 2:
- **Source:** `prompts/prompts-scrum-12.md` — `## Prompt - 2026-06-21T07:25:00Z` (Agent: skill:develop-backend)
- **Relevance:** Names ticket T-002 and SCRUM-12 deliverables (`POST /api/monitor/readings/chemical`, `GET /api/monitor/alerts`).
- **Excerpt/Summary:** "Run develop-backend for SCRUM-12 / T-002 … implement POST /api/monitor/readings/chemical and GET /api/monitor/alerts … Refs: UC-001, T-002."

Prompt 3:
- **Source:** `prompts/prompts-scrum-12.md` — `## Prompt - 2026-06-21T07:08:03Z` (Agent: orchestrator)
- **Relevance:** Orchestration entry point for SCRUM-12 work ticket with plan/PR approval gates — defines ticket execution workflow.
- **Excerpt/Summary:** "Act as orchestrator. Run orchestrate for SCRUM-12 … Stop for my approval after the plan and after the PR description."

---

## 7. Pull Requests

Prompt 1:
- **Source:** `prompts/prompts-scrum-6.md` — `## Prompt - 2026-06-21T06:00:00Z` (Agent: skill:qodo-pr-resolver)
- **Relevance:** Invoked Qodo PR resolver to address review feedback on the SCRUM-6 pull request (feat/SCRUM-6 → PR #5).
- **Excerpt/Summary:** "/qodo-pr-resolver"

Prompt 2:
- **Source:** `prompts/prompts-scrum-12.md` — `## Prompt - 2026-06-21T07:35:00Z` (Agent: skill:commit)
- **Relevance:** Commit skill invocation during SCRUM-12 delivery — commits with `Refs:` footers feed PR #6 traceability chain documented in Pull Requests section.
- **Excerpt/Summary:** "/commit"

Prompt 3:
- **Source:** `prompts/prompts-ci-deploy.md` — `## Prompt - 2026-06-22T02:06:37Z` (Agent: skill:plan-pr)
- **Relevance:** Explicitly invoked PR description drafting skill (`plan-pr`) aligned with `.github/pull_request_template.md` — governs PR metadata quality in delivery traceability.
- **Excerpt/Summary:** "/plan-pr"

---

*Report generated from allowed prompt logs only.  
Excluded: `prompts/prompts-entrega2-ics.md`.*
