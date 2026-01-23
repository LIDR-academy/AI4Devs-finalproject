# Implementation Plan: Compose Meditation Content

**Branch**: `001-compose-meditation-content` | **Date**: January 23, 2026 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-compose-meditation-content/spec.md`

---

## Summary

This implementation plan delivers a meditation composition capability where authenticated users can define text (mandatory), music (optional), and images (optional) for meditation content. The system determines output type: compositions without images result in podcasts (audio-only), while compositions with images result in videos. Users can compose content manually or request AI assistance. All content remains in session state without persistence. The actual generation of podcasts/videos occurs in future user stories.

**Golden Rule**: Everything traces to BDD. No implementation, endpoint materialization, or domain decisions happen without explicit BDD coverage.

---

## Technical Context

**Language/Version**: Backend: Java 21 | Frontend: TypeScript 5.x  
**Primary Dependencies**: Backend: Spring Boot 3.x, Cucumber JVM 7.x | Frontend: React 18, React Query, Zustand  
**Storage**: N/A - Session-based state only (no persistence per spec)  
**Testing**: Backend: JUnit 5, Testcontainers, Cucumber | Frontend: Vitest, React Testing Library, Playwright  
**Target Platform**: Web application (backend REST API + frontend SPA)  
**Project Type**: Monorepo with /backend and /frontend  
**Performance Goals**: AI text generation <8s (90th percentile), Music preview <2s, Image preview <1s, Output type indication update <0.5s  
**Constraints**: No persistence, AI generation only on explicit user request, output type derived from image presence (no manual override)  
**Scale/Scope**: Single user session-based composition, 6 user stories (2 P1, 3 P2, 1 P3), 19 functional requirements

---

## Constitution Check

**GATE**: Must pass before Phase 0 research. Re-check after Phase 1 design.

### Compliance Validation

- ✅ **BDD-First**: All 6 user stories have Given-When-Then scenarios in spec.md
- ✅ **Vertical Slice**: Feature delivers observable value (compose meditation content with output type indication)
- ✅ **Hexagonal Architecture**: Backend follows strict layer separation (domain/application/infrastructure/controllers)
- ✅ **DDD Tactical**: Domain concepts identified (Meditation Composition, Text Content, Music Selection, Image Selection, Output Type)
- ✅ **TDD Mandatory**: Domain logic (output type derivation, validation) must be test-driven
- ✅ **API First Minimal**: OpenAPI contract derives from BDD When clauses only
- ✅ **No Persistence**: Explicitly stated in spec - session state only
- ✅ **Frontend Pattern**: React Query for server-state, Zustand for UI-state
- ✅ **Independent**: Feature does not depend on future persistence or podcast/video generation features
- ✅ **Testable**: Clear acceptance scenarios for each capability

### Potential Risks

- **AI Service Dependency**: External AI service availability impacts FR-003, FR-004 (mitigation: graceful degradation, clear error messages)
- **Session Management**: Session state handling not specified (mitigation: clarify session mechanism in Phase 0 research)
- **Media Catalog Integration**: Music/image selection assumes existing catalog (mitigation: define catalog interface contract)

---

## Project Structure

### Documentation (this feature)

```
specs/001-compose-meditation-content/
├── spec.md              # Business specification (exists)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technical decisions)
├── data-model.md        # Phase 1 output (domain entities)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (OpenAPI specifications)
└── tasks.md             # Phase 2 output (NOT created by this command)
```

### Source Code (repository root)

```
/backend
  /src/main/java/com/hexagonal/meditationbuilder
    /application          # Use cases, orchestration
    /domain               # Business logic, ports, entities
    /infrastructure       # Adapters (REST, AI, media catalog, session)
  /src/main/resources/openapi/meditationbuilder
  /src/test/java/...      # Unit + integration tests
  /tests/bdd              # Cucumber feature files
  /tests/contracts        # Provider contract tests
  /tests/e2e              # E2E tests

/frontend
  /src
    /api                  # OpenAPI generated client
    /components           # UI components
    /pages                # Page components
    /hooks                # React Query hooks
    /state                # Zustand stores
  /tests
    /unit                 # Component unit tests
    /integration          # Integration tests
    /e2e                  # Playwright E2E tests
```

---

# Phase 0: Research & Technical Decisions

**Objective**: Resolve all technical unknowns and clarify integration patterns before design begins.

## Research Tasks

### Task 1: Session State Management Strategy

**Question**: How should non-persistent composition state be maintained across user interactions?

**Options to Evaluate**:
- Backend session storage (in-memory cache with TTL)
- Frontend-only state (Zustand + browser storage)
- Hybrid approach (server-side session ID + client-side content)

**Decision Criteria**:
- Consistency with authentication session mechanism
- Failure recovery (browser refresh, network interruption)
- Multi-tab behavior expectations
- Security implications (session hijacking prevention)

**Output**: Document chosen session mechanism, TTL configuration, cleanup strategy

---

### Task 2: AI Text Generation Service Integration

**Question**: What integration pattern should be used for AI text generation requests?

**Options to Evaluate**:
- Synchronous REST API call
- Asynchronous with polling
- Asynchronous with webhooks/server-sent events

**Decision Criteria**:
- Response time expectations (<8s per SC-003)
- User experience during generation (loading indicators)
- Timeout and retry handling
- Error scenarios (service unavailable, rate limiting)

**Output**: Document integration pattern, timeout configuration, circuit breaker strategy, error mapping

---

### Task 3: Media Catalog Interface Definition

**Question**: How should the system query and preview music/image resources?

**Options to Evaluate**:
- Direct HTTP calls to media service
- Gateway/proxy pattern
- Pre-signed URL generation for previews

**Decision Criteria**:
- Security (no direct media service access from frontend)
- Performance (preview load times per SC-004, SC-005)
- Caching strategy for metadata vs. content
- Availability fallback

**Output**: Document catalog interface contract, preview URL generation strategy, caching policy

---

### Task 4: Output Type Derivation Logic

**Question**: Where should output type derivation logic reside and how should it be tested?

**Analysis**:
- Business rule: Output type = PODCAST if no image, VIDEO if image present
- No manual override allowed (per spec constraints)
- Must update within 0.5s (per SC-013)

**Decision Criteria**:
- Domain model purity (no infrastructure dependencies)
- Reactivity (immediate UI update when image added/removed)
- Testability (pure business logic)

**Output**: Document placement (domain entity vs. application service), test strategy, UI update mechanism

---

### Task 5: Error Handling Patterns

**Question**: How should AI service failures, media unavailability, and session expiration be handled?

**Scenarios to Address**:
- AI service returns 503 (temporarily unavailable)
- AI service returns 429 (rate limit exceeded)
- Media resource 404 (not found)
- Session timeout during composition

**Decision Criteria**:
- User experience (clear error messages, preserve content)
- Retry logic (exponential backoff)
- Degradation strategy (manual entry always works)

**Output**: Document error codes, user-facing messages, retry policies, content preservation guarantees

---

## Research Artifacts

**Output File**: `specs/001-compose-meditation-content/research.md`

**Required Sections**:
- Session Management Decision (rationale, configuration, cleanup)
- AI Integration Pattern (sync/async, timeouts, retries, circuit breaker)
- Media Catalog Interface (contract, preview strategy, caching)
- Output Type Logic Placement (domain entity decision, test approach)
- Error Handling Strategy (codes, messages, retries, preservation)
- Performance Budget Allocation (breakdown of SC-001 to SC-013 targets)
- Security Considerations (session security, media access control)

---

# Phase 1: Design Artifacts (BDD-Driven)

**Objective**: Generate data model, minimal OpenAPI contract, and setup documentation based on BDD scenarios and research decisions.

**Prerequisites**: Phase 0 research.md complete, all technical decisions documented

---

## Artifact 1: Data Model

**Output File**: `specs/001-compose-meditation-content/data-model.md`

### Domain Entities (Derived from BDD)

**Entity: Meditation Composition**
- Source: All user stories reference "meditation content" being composed
- Responsibility: Aggregate root for composition session
- Attributes (from functional requirements):
  - Text content (mandatory per FR-001, FR-002)
  - Music reference (optional per FR-006)
  - Image reference (optional per FR-008)
  - Output type (derived per FR-016, FR-017, FR-018)
- Invariants:
  - Text must not be null (FR-001)
  - Output type must equal PODCAST when image is null
  - Output type must equal VIDEO when image is not null
- Lifecycle: Created on session start, destroyed on session end (no persistence per FR-010)

**Value Object: Text Content**
- Source: US1, US3, US4 scenarios
- Responsibility: Encapsulate meditation script
- Attributes:
  - Raw text (string, max length 10,000 characters per edge cases)
- Validation:
  - Not null
  - Length within bounds

**Value Object: Music Selection**
- Source: US5 scenarios
- Responsibility: Reference to selected music resource
- Attributes:
  - Resource identifier
  - Preview URL (from media catalog)
- Validation:
  - Resource exists in catalog

**Value Object: Image Selection**
- Source: US6 scenarios, US2 output type logic
- Responsibility: Reference to selected image resource
- Attributes:
  - Resource identifier
  - Preview URL (from media catalog)
- Validation:
  - Resource exists in catalog

**Enumeration: Output Type**
- Source: US2 scenarios (FR-016 to FR-019)
- Values: PODCAST, VIDEO
- Derivation Rule: PODCAST if image is null, VIDEO if image is not null

### Domain Ports (Interfaces)

**Port IN: Compose Meditation Use Case**
- Responsibilities derived from BDD When clauses:
  - Retrieve current composition state
  - Update text content
  - Generate text via AI (from scratch or enhancement)
  - Select music
  - Remove music
  - Select image
  - Remove image
  - Get music preview URL
  - Get image preview URL

**Port OUT: AI Text Generation**
- Responsibility: Generate meditation text
- Operations:
  - Generate from scratch
  - Generate with context (existing text)
- Error scenarios: Service unavailable (503), Rate limit (429)

**Port OUT: Media Catalog**
- Responsibility: Validate and retrieve media resources
- Operations:
  - Validate music exists
  - Validate image exists
  - Get music preview URL
  - Get image preview URL
- Error scenarios: Resource not found (404)

**Port OUT: Session Repository**
- Responsibility: Store/retrieve composition in session
- Operations:
  - Save composition state
  - Retrieve composition state
  - Clear composition state
- Error scenarios: Session expired

---

## Artifact 2: OpenAPI Contract (Minimal Capabilities)

**Output File**: `specs/001-compose-meditation-content/contracts/meditation-composition-api.yaml`

### Abstract Capabilities (Derived from BDD When Clauses)

**Capability 1: Retrieve Current Composition State**
- BDD Source: "When the user reviews the composition"
- Purpose: Fetch current text, music, image, and output type
- Success Response: Composition state object
- Error Responses: 401 (not authenticated), 500 (server error)

**Capability 2: Update Meditation Text**
- BDD Source: "When the user types text into the meditation text field"
- Purpose: Modify text content of composition
- Input: Text string
- Success Response: Updated composition state
- Error Responses: 400 (invalid text), 401, 500

**Capability 3: Generate Text via AI**
- BDD Source: "When the user requests AI generation of meditation text" (US3, US4)
- Purpose: Generate new text from scratch or based on existing content
- Input: Optional context flag (from scratch vs. enhancement)
- Success Response: Generated text content
- Error Responses: 400 (invalid request), 401, 429 (rate limit), 503 (AI unavailable), 500

**Capability 4: Select Music**
- BDD Source: "When the user selects music for their meditation"
- Purpose: Associate music resource with composition
- Input: Music resource identifier
- Success Response: Updated composition state with music reference
- Error Responses: 400 (invalid music ID), 404 (music not found), 401, 500

**Capability 5: Remove Music**
- BDD Source: Implied by optional music requirement
- Purpose: Disassociate music from composition
- Success Response: Updated composition state without music
- Error Responses: 401, 500

**Capability 6: Select Image**
- BDD Source: "When the user selects an image" (US2, US6)
- Purpose: Associate image resource with composition (triggers output type change to VIDEO)
- Input: Image resource identifier
- Success Response: Updated composition state with image reference and output type VIDEO
- Error Responses: 400 (invalid image ID), 404 (image not found), 401, 500

**Capability 7: Remove Image**
- BDD Source: "When the user removes the image selection" (US2)
- Purpose: Disassociate image from composition (triggers output type change to PODCAST)
- Success Response: Updated composition state without image and output type PODCAST
- Error Responses: 401, 500

**Capability 8: Get Music Preview**
- BDD Source: "When the user requests to preview the music" (US5)
- Purpose: Retrieve preview URL for selected music
- Success Response: Preview URL and metadata
- Error Responses: 404 (no music selected), 401, 500

**Capability 9: Get Image Preview**
- BDD Source: "When the user requests to preview the image" (US6)
- Purpose: Retrieve preview URL for selected image
- Success Response: Preview URL and metadata
- Error Responses: 404 (no image selected), 401, 500

### Data Schemas (Minimal)

**Schema: Composition State**
- text (string, required)
- musicId (string, optional)
- imageId (string, optional)
- outputType (enum: PODCAST or VIDEO, required, derived)

**Schema: AI Generation Request**
- fromScratch (boolean, required)

**Schema: AI Generation Response**
- generatedText (string, required)

**Schema: Preview Response**
- previewUrl (string, required)
- title (string, optional)
- duration or dimensions (metadata)

**Schema: Error Response**
- code (string, required)
- message (string, required)
- details (object, optional)

### OpenAPI Requirements

- Version: 3.0.3
- Authentication: Bearer token (assumes external auth service)
- Session Identification: Custom header (e.g., X-Session-ID)
- Validation: Spectral lint must pass
- Documentation: Swagger UI enabled

---

## Artifact 3: Quickstart Guide

**Output File**: `specs/001-compose-meditation-content/quickstart.md`

**Sections**:
1. Prerequisites (Java 21, Node 18+, authentication service running)
2. Backend Setup (Maven dependencies, environment variables, run instructions)
3. Frontend Setup (npm install, environment variables, dev server)
4. Running BDD Tests (Cucumber execution)
5. Testing with API Client (Swagger UI, sample requests)
6. Common Issues and Solutions

---

## Phase 1 Tools

- OpenAPI Generator 7.x (generate server stubs, TypeScript client)
- Spectral (OpenAPI linting)
- Mermaid (optional: data model diagrams)

---

## Phase 1 Acceptance Criteria

- [ ] data-model.md documents all entities, value objects, ports with BDD traceability
- [ ] OpenAPI YAML defines 9 capabilities mapping to BDD When clauses
- [ ] OpenAPI passes Spectral lint with zero errors
- [ ] All data schemas contain only fields required by BDD scenarios
- [ ] quickstart.md provides complete setup instructions
- [ ] No endpoints, DTOs, or domain model names invented beyond BDD scope
- [ ] Constitution Check re-validated (no violations introduced during design)

---

## Phase 1 Dependencies

- Phase 0 research.md complete

---

## Phase 1 Prohibitions

- Defining HTTP paths or methods (defer to implementation phases)
- Naming specific Java classes or TypeScript types (defer to implementation)
- Adding "nice-to-have" fields not in BDD
- Designing persistence mechanisms (spec explicitly states no persistence)
- Creating technical architecture diagrams (defer to implementation)

---

# Phase 2: Tasks Generation (Out of Scope for /speckit.plan)

**Note**: Task breakdown happens via `/speckit.tasks` command after plan approval.

The tasks will follow the 10-phase pipeline:

1. BDD First (Cucumber feature files, pending step definitions)
2. API First (OpenAPI finalization, contract validation)
3. Domain (TDD: entities, value objects, ports)
4. Application (Use cases, orchestration)
5. Infrastructure (Adapters: AI service, media catalog, session storage)
6. Controllers (REST endpoints, DTOs, mappers)
7. Frontend (React components, hooks, state, OpenAPI client)
8. Contracts (Provider tests backend, consumer tests frontend)
9. E2E (Playwright frontend, Cucumber backend E2E)
10. CI/CD (Gates, deployment pipeline)

Each phase will have granular tasks with:
- Objective
- Exact file locations
- Acceptance criteria
- Tools required
- Dependencies on previous tasks
- Prohibitions

---

# Pipeline Overview: 10-Phase Delivery

## Phase 1: BDD First

**Artifacts**:
- `/backend/tests/bdd/meditationbuilder/compose-meditation-content.feature`
- `/backend/tests/bdd/meditationbuilder/steps/ComposeMeditationSteps.java` (pending)

**Tools**: Cucumber JVM 7.x, JUnit 5

**Acceptance Criteria**:
- All 6 user stories translated to Given-When-Then scenarios
- 100% business language (no HTTP, JSON, DTOs)
- Step definitions exist but throw PendingException
- Cucumber execution shows all scenarios as PENDING (yellow)
- Feature file approved by PO, QA, Backend, Frontend

**Dependencies**: None (BDD is the starting point)

**Prohibitions**:
- Implementing step definitions before domain exists
- Using technical terms in scenarios
- Adding scenarios not in spec.md

---

## Phase 2: API First (Contract Definition)

**Artifacts**:
- `/backend/src/main/resources/openapi/meditationbuilder/meditation-composition-api.yaml`

**Tools**: OpenAPI Generator, Spectral

**Acceptance Criteria**:
- 9 capabilities defined (from contracts/ artifact in Phase 1)
- All capabilities map to BDD When clauses
- Schemas contain only BDD-required fields
- Spectral lint passes (zero errors)
- OpenAPI version 3.0.3
- Authentication scheme defined

**Dependencies**: Phase 1 BDD complete

**Prohibitions**:
- Adding capabilities not in BDD
- Materializing HTTP paths or methods prematurely
- Including fields for "future use"

---

## Phase 3: Domain (DDD + TDD)

**Artifacts**:
- `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/model/`
- `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/ports/in/`
- `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/ports/out/`
- `/backend/src/test/java/com/hexagonal/meditationbuilder/domain/`

**Tools**: JUnit 5, AssertJ

**Acceptance Criteria**:
- Output type derivation logic implemented and tested (PODCAST when no image, VIDEO when image present)
- Text validation tested (max length, not null)
- All domain classes are pure Java (no Spring annotations)
- TDD: Tests written before implementation
- Domain test coverage ≥ 90%
- Ports defined (no implementation)

**Dependencies**: Phase 2 API contract validated

**Prohibitions**:
- Using Spring or infrastructure dependencies in domain
- Implementing ports (that's infrastructure's job)
- Adding business rules not in BDD

---

## Phase 4: Application (Use Cases)

**Artifacts**:
- `/backend/src/main/java/com/hexagonal/meditationbuilder/application/service/`
- `/backend/src/test/java/com/hexagonal/meditationbuilder/application/`

**Tools**: Spring Context (DI only), Mockito

**Acceptance Criteria**:
- Use cases orchestrate domain + ports (no business logic)
- All external calls go through ports
- Application test coverage ≥ 80%
- Use cases map 1:1 to domain ports IN

**Dependencies**: Phase 3 Domain complete

**Prohibitions**:
- Implementing business logic (belongs in domain)
- Direct infrastructure access (use ports)
- Creating new business rules

---

## Phase 5: Infrastructure (Adapters OUT)

**Artifacts**:
- `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/ai/`
- `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/media/`
- `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/session/`
- `/backend/src/test/java/com/hexagonal/meditationbuilder/infrastructure/`

**Tools**: Spring RestClient, Testcontainers, WireMock, Resilience4j

**Acceptance Criteria**:
- AI adapter implements AI text generation port
- Media catalog adapter implements media catalog port
- Session adapter implements session storage port (non-persistent)
- Circuit breaker configured for AI calls
- Retries with exponential backoff
- Integration tests use Testcontainers/WireMock (no real services)
- Infrastructure test coverage ≥ 70%

**Dependencies**: Phase 4 Application complete

**Prohibitions**:
- Business logic in adapters
- Hardcoded credentials or URLs
- Using real external services in tests
- Persisting composition to database (session only)

---

## Phase 6: Controllers (REST Adapters IN)

**Artifacts**:
- `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/controller/`
- `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/dto/`
- `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/mapper/`
- `/backend/src/test/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/controller/`

**Tools**: Spring Web MVC, MockMvc, Bean Validation

**Acceptance Criteria**:
- Controllers expose 9 capabilities from OpenAPI
- DTOs match OpenAPI schemas exactly
- Controllers delegate to use cases (no business logic)
- HTTP status codes match OpenAPI (200, 400, 401, 404, 429, 500, 503)
- Bean Validation for input
- Controller test coverage ≥ 80%

**Dependencies**: Phase 5 Infrastructure complete

**Prohibitions**:
- Business logic in controllers
- Deviating from OpenAPI contract
- Direct infrastructure access

---

## Phase 7: Frontend (UI + State + Client)

**Artifacts**:
- `/frontend/src/api/generated/` (OpenAPI client)
- `/frontend/src/hooks/useMeditationComposition.ts`
- `/frontend/src/state/composer-ui-store.ts`
- `/frontend/src/pages/MeditationBuilderPage.tsx`
- `/frontend/src/components/` (text section, music section, image section, output type indicator)
- `/frontend/tests/unit/`, `/frontend/tests/integration/`

**Tools**: OpenAPI Generator (typescript-fetch), React Query, Zustand, Vitest, React Testing Library, MSW

**Acceptance Criteria**:
- OpenAPI client generated successfully
- All API calls use generated client (no manual fetch)
- React Query manages server state (composition data)
- Zustand manages UI state (loading flags, playback state)
- Output type indicator updates immediately when image added/removed (< 0.5s per SC-013)
- Components are presentational (no business logic)
- Unit test coverage ≥ 70%
- Integration test coverage ≥ 60%

**Dependencies**: Phase 6 Controllers deployed to test environment

**Prohibitions**:
- Manual HTTP calls (must use generated client)
- Business logic in components
- Storing server data in Zustand (use React Query)

---

## Phase 8: Contracts (Provider/Consumer Tests)

**Artifacts**:
- `/backend/tests/contracts/MeditationCompositionContractTest.java`
- `/frontend/tests/contracts/api-contract.spec.ts`

**Tools**: JSON Schema Validator, MSW

**Acceptance Criteria**:
- Provider tests validate all backend responses against OpenAPI schemas
- Consumer tests validate frontend can parse all backend responses
- All error codes tested (400, 401, 404, 429, 500, 503)
- Contract tests execute in CI before E2E

**Dependencies**: Phase 7 Frontend complete

**Prohibitions**:
- Modifying OpenAPI without updating contract tests
- Allowing breaking changes without versioning

---

## Phase 9: E2E (End-to-End Tests)

**Artifacts**:
- `/frontend/tests/e2e/meditation-builder.e2e.ts`
- `/backend/tests/e2e/compose-meditation.e2e.feature`

**Tools**: Playwright (frontend), Cucumber JVM (backend), Testcontainers, WireMock

**Acceptance Criteria**:
- All 6 user stories have E2E test coverage
- US1: Manual text entry flow tested
- US2: Output type indication (podcast/video) tested
- US3: AI text generation from scratch tested
- US4: AI text enhancement tested
- US5: Music selection and preview tested
- US6: Image selection and preview tested
- Edge cases tested (AI unavailable, session timeout)
- Performance targets validated (SC-001 to SC-013)
- E2E tests pass in CI

**Dependencies**: Phase 8 Contracts complete

**Prohibitions**:
- Using production services in E2E
- Hardcoding test data that couples tests together

---

## Phase 10: CI/CD (Gates and Deployment)

**Artifacts**:
- `.github/workflows/meditation-builder-pipeline.yml`

**Gates (Execution Order)**:
1. BDD Tests (Cucumber - must be implemented, not pending)
2. API Validation (Spectral lint)
3. Unit Tests Backend (Domain + Application ≥ 80% coverage)
4. Integration Tests Backend (Infrastructure ≥ 70% coverage)
5. Contract Tests (Provider + Consumer)
6. Unit + Integration Tests Frontend (Unit ≥ 70%, Integration ≥ 60%)
7. E2E Backend (Cucumber E2E)
8. E2E Frontend (Playwright)
9. Build Artifacts (JAR + frontend dist)
10. Security Scan (Snyk/Trivy - critical vulnerabilities block)
11. Deploy to Staging (automated)
12. Smoke Tests (post-deployment validation)
13. Deploy to Production (manual approval)

**Tools**: GitHub Actions, Docker, Snyk/Trivy, Prometheus, Sentry

**Acceptance Criteria**:
- All 13 gates configured
- Failed gates block merge to main
- Observability configured (logs, metrics, traces)
- Rollback capability tested
- Smoke tests validate deployments

**Dependencies**: All phases 1-9 complete

**Prohibitions**:
- Skipping gates for "time savings"
- Deploying untested code
- Hardcoding secrets in workflows

---

# Definition of Done

A user story is **DONE** and **deployable** when:

## Technical Completeness

- [ ] BDD scenarios GREEN (all step definitions implemented)
- [ ] OpenAPI validated and versioned
- [ ] Domain logic with TDD (≥ 90% coverage)
- [ ] Application layer tested (≥ 80% coverage)
- [ ] Infrastructure adapters with integration tests (≥ 70% coverage)
- [ ] Controllers conform to OpenAPI (≥ 80% coverage)
- [ ] Frontend implemented with React Query + Zustand
- [ ] Frontend tests: unit ≥ 70%, integration ≥ 60%
- [ ] Contract tests GREEN (provider + consumer)
- [ ] E2E tests GREEN (Cucumber backend + Playwright frontend)

## Quality Gates

- [ ] All CI/CD gates passed
- [ ] No critical security vulnerabilities (Snyk/Trivy)
- [ ] Performance targets met (SC-001 to SC-013)
- [ ] Error handling validated (AI failures, rate limits, media unavailability)
- [ ] Observability configured (logs, metrics, traces)

## Architectural Compliance

- [ ] Hexagonal architecture preserved (no layer violations)
- [ ] No business logic outside domain
- [ ] No persistence in this feature (session state only per spec)
- [ ] No capabilities beyond BDD scope
- [ ] DDD principles applied (entities, value objects, aggregates)

## Documentation

- [ ] OpenAPI documented and published
- [ ] README updated with feature description
- [ ] Deployment instructions documented
- [ ] Known limitations documented

## Operational Readiness

- [ ] Deployed to staging and validated
- [ ] Smoke tests passed in staging
- [ ] Rollback procedure tested
- [ ] Monitoring dashboards configured
- [ ] Error alerting configured

---

# Out of Scope (Explicit Non-Goals)

**Not included in this feature** (per spec.md):

- Persistent storage of meditation content
- Actual podcast or video generation
- Custom music/image upload from user device
- Multi-language support
- Collaboration or sharing
- Content library management
- Rich text editing
- Music/image editing
- AI parameter configuration
- Content validation for quality
- Offline functionality
- Template system
- Version history
- Analytics
- User registration/authentication (dependency)

---

# Key Constraints (From BDD and Constitution)

1. **No Persistence**: Composition state exists only in session (FR-010, FR-011)
2. **AI Explicit Only**: No automatic AI generation, user must request (FR-005)
3. **Output Type Derived**: Automatically determined by image presence, no manual override (FR-016 to FR-019)
4. **Session-Based**: All content maintained in active user session (FR-011)
5. **Text Mandatory**: Text field is required for valid composition (FR-001)
6. **Music Optional**: Music selection is not required (FR-006)
7. **Image Optional**: Image selection is not required but determines output type (FR-008, US2)
8. **Preview Read-Only**: Media previews are view-only, no editing (US5, US6)

---

# References

- [Constitution 2.0.0](../../.specify/memory/constitution.md)
- [Backend Delivery Playbook](../../.specify/instructions/delivery-playbook-backend.md)
- [Frontend Delivery Playbook](../../.specify/instructions/delivery-playbook-frontend.md)
- [Feature Specification](./spec.md)

---

**Plan Status**: ✅ **READY FOR RESEARCH (Phase 0)**  
**Next Command**: `/speckit.plan` will execute Phase 0 research tasks  
**Estimated Effort**: 8-10 developer days (following TDD/BDD strictly)  
**Risk Level**: Medium (AI service dependency, session management strategy)

---

**END OF IMPLEMENTATION PLAN**
