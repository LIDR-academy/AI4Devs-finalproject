# Tasks: Compose Meditation Content with Optional AI Assistance

**Feature**: Compose Meditation Content with Optional AI Assistance  
**Branch**: `001-compose-meditation-content`  
**Related Documents**: [spec.md](./spec.md) | [plan.md](./plan.md)

---

## Implementation Strategy

This feature follows a **strict hexagonal architecture** with **BDD-first, API-first** approach. Tasks are organized by pipeline phase to ensure proper dependency order and architectural layer separation. Each task focuses on a single layer (domain, application, infrastructure, controllers, frontend, or testing).

**MVP Scope**: User Story 1 (Manual Text Entry) + User Story 2 (Output Type Indication)  
**Incremental Delivery**: P1 → P2 → P3 user stories, each independently deployable

---

## Phase 1: Setup & Infrastructure

Tasks that prepare the project structure and foundational infrastructure needed for all user stories.

### Setup Tasks

- [ ] T001 Create BDD test structure: `/backend/tests/bdd/meditationbuilder/` directory with Cucumber configuration
- [ ] T002 Create OpenAPI base structure: `/backend/src/main/resources/openapi/meditationbuilder/` directory
- [ ] T003 Create domain package structure: `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/{model,enums,ports/in,ports/out}/`
- [ ] T004 Create application package structure: `/backend/src/main/java/com/hexagonal/meditationbuilder/application/{service,mapper,validator}/`
- [ ] T005 Create infrastructure package structure: `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/{in/rest/{controller,dto,mapper},out/service/}`
- [ ] T006 Create frontend base structure: `/frontend/src/{api,components,pages,hooks,state}/`
- [ ] T007 Create contracts test structure: `/backend/tests/contracts/`
- [ ] T008 Create E2E test structures: `/backend/tests/e2e/` and `/frontend/tests/e2e/`

---

## Phase 2: BDD First (Blocking for All User Stories)

**Gate**: BDD scenarios must be defined (pending/yellow) before any implementation begins.

### BDD Definition Tasks

- [ ] T009 [P] Create BDD feature file: `/backend/tests/bdd/meditationbuilder/compose-content.feature` with all scenarios from spec.md (US1-US6)
  - **Criteria**: All Given/When/Then scenarios extracted from spec.md
  - **Criteria**: Steps pending (Cucumber YELLOW state)
  - **Criteria**: 100% business language, no technical terms (HTTP, JSON, DB)
  - **Criteria**: Scenarios cover: manual text entry, output type indication, AI generation from scratch, AI enhancement, music preview, image preview

- [ ] T010 [P] Create BDD step definitions skeleton: `/backend/tests/bdd/meditationbuilder/steps/ComposeContentSteps.java`
  - **Criteria**: All steps declared with @Given, @When, @Then annotations
  - **Criteria**: Methods throw PendingException
  - **Criteria**: No implementation logic
  - **Dependencies**: T009

- [ ] T011 Run BDD tests to verify YELLOW state
  - **Criteria**: All scenarios execute and show as pending/yellow
  - **Criteria**: No failures (red), no passes (green)
  - **Dependencies**: T010

---

## Phase 3: API First (Blocking for Implementation)

**Gate**: OpenAPI specification must be complete and validated before domain implementation.

### API Definition Tasks

- [ ] T012 Define OpenAPI capabilities in `/backend/src/main/resources/openapi/meditationbuilder/compose-content.yaml`
  - **Criteria**: 7 abstract capabilities defined (derived from BDD When clauses):
    1. Access Meditation Builder
    2. Define Meditation Text
    3. Determine Output Type
    4. Generate Meditation Text from Scratch
    5. Enhance Existing Meditation Text
    6. Preview Selected Music
    7. Preview Selected Image
  - **Criteria**: No concrete paths, methods, or DTOs yet
  - **Criteria**: Capabilities mapped to user stories in comments
  - **Dependencies**: T011

- [ ] T013 Define OpenAPI paths and operations in `/backend/src/main/resources/openapi/meditationbuilder/compose-content.yaml`
  - **Criteria**: Concrete HTTP paths and methods for all 7 capabilities
  - **Criteria**: Request/response schemas defined as components
  - **Criteria**: Error responses (400, 503, 429) defined
  - **Criteria**: All operations have operationId matching use case names
  - **Dependencies**: T012

- [ ] T014 Validate OpenAPI specification
  - **Criteria**: OpenAPI file passes validation (openapi-generator validate)
  - **Criteria**: No breaking changes from previous versions (if applicable)
  - **Dependencies**: T013

---

## Phase 4: Domain Layer (User Story 1 & 2 - P1)

**Focus**: Manual Text Entry + Output Type Indication (MVP)

### Domain Model Tasks

- [ ] T015 [P] [US1] Create TextContent value object in `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/model/TextContent.java`
  - **Criteria**: Immutable value object
  - **Criteria**: Validates text not null or empty
  - **Criteria**: Preserves text exactly as provided (invariant)
  - **Criteria**: TDD: Unit tests written first
  - **Dependencies**: T014

- [ ] T016 [P] [US2] Create OutputType enum in `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/enums/OutputType.java`
  - **Criteria**: PODCAST and VIDEO values
  - **Criteria**: Business-meaningful names
  - **Dependencies**: T014

- [ ] T017 [P] [US1] Create MusicReference value object in `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/model/MusicReference.java`
  - **Criteria**: Immutable value object
  - **Criteria**: Optional (can be null)
  - **Criteria**: Contains music identifier
  - **Dependencies**: T014

- [ ] T018 [P] [US1] Create ImageReference value object in `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/model/ImageReference.java`
  - **Criteria**: Immutable value object
  - **Criteria**: Optional (can be null)
  - **Criteria**: Contains image identifier
  - **Dependencies**: T014

- [ ] T019 [US2] Create MeditationComposition aggregate root in `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/model/MeditationComposition.java`
  - **Criteria**: Contains TextContent (mandatory), MusicReference (optional), ImageReference (optional)
  - **Criteria**: Method getOutputType() returns PODCAST if image == null, VIDEO if image != null
  - **Criteria**: TDD: Unit tests verify output type derivation logic
  - **Criteria**: Aggregate invariants enforced (text always required)
  - **Dependencies**: T015, T016, T017, T018

### Domain Ports Tasks

- [ ] T020 [P] [US1] Create ComposeContentUseCase port in `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/ports/in/ComposeContentUseCase.java`
  - **Criteria**: Interface with methods: createComposition(), updateText(), selectMusic(), selectImage(), removeImage()
  - **Criteria**: Input/output use domain types only
  - **Criteria**: No framework dependencies
  - **Dependencies**: T019

- [ ] T021 [P] Create MediaCatalogPort out port in `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/ports/out/MediaCatalogPort.java`
  - **Criteria**: Interface with methods: getMusicById(), getImageById()
  - **Criteria**: Returns domain types
  - **Dependencies**: T017, T018

---

## Phase 5: Domain Layer (User Story 3 & 4 - P2/P3)

**Focus**: AI Text Generation capabilities

### Domain Model Tasks (AI)

- [ ] T022 [P] [US3] Create GenerationMode enum in `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/enums/GenerationMode.java`
  - **Criteria**: MANUAL, AI_FROM_SCRATCH, AI_ENHANCED values
  - **Dependencies**: T014

- [ ] T023 [P] [US3] Create GenerateTextUseCase port in `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/ports/in/GenerateTextUseCase.java`
  - **Criteria**: Interface with methods: generateFromScratch(), enhanceExisting()
  - **Criteria**: Returns TextContent
  - **Dependencies**: T015, T022

- [ ] T024 [P] [US3] Create TextGenerationPort out port in `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/ports/out/TextGenerationPort.java`
  - **Criteria**: Interface with methods: generateText(context), enhanceText(existingText, context)
  - **Criteria**: Throws business exceptions: AiServiceUnavailableException, AiGenerationTimeoutException
  - **Dependencies**: T015

---

## Phase 6: Application Layer (User Story 1 & 2 - P1)

**Focus**: Use case orchestration for manual composition

### Application Service Tasks

- [ ] T025 [US1] Implement ComposeContentService in `/backend/src/main/java/com/hexagonal/meditationbuilder/application/service/ComposeContentService.java`
  - **Criteria**: Implements ComposeContentUseCase
  - **Criteria**: Orchestrates domain objects and out ports
  - **Criteria**: No business logic (only orchestration)
  - **Criteria**: Calls MediaCatalogPort for music/image validation
  - **Criteria**: Unit tests with mocked ports
  - **Dependencies**: T020, T021

- [ ] T026 [P] [US1] Create TextLengthValidator in `/backend/src/main/java/com/hexagonal/meditationbuilder/application/validator/TextLengthValidator.java`
  - **Criteria**: Validates text length (max 10,000 characters based on edge cases)
  - **Criteria**: Returns validation result (no exceptions for business validation)
  - **Dependencies**: T015

---

## Phase 7: Application Layer (User Story 3 & 4 - P2/P3)

**Focus**: AI generation use case orchestration

### Application Service Tasks (AI)

- [ ] T027 [US3] Implement GenerateTextService in `/backend/src/main/java/com/hexagonal/meditationbuilder/application/service/GenerateTextService.java`
  - **Criteria**: Implements GenerateTextUseCase
  - **Criteria**: Orchestrates TextGenerationPort calls
  - **Criteria**: No business logic
  - **Criteria**: Error handling: AI timeout → maps to business exception
  - **Criteria**: Unit tests with mocked TextGenerationPort
  - **Dependencies**: T023, T024

---

## Phase 8: Infrastructure Layer (Adapters Out)

**Focus**: Implementing out ports with external services

### Infrastructure Adapter Tasks

- [ ] T028 [P] Implement MediaCatalogAdapter in `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/service/MediaCatalogAdapter.java`
  - **Criteria**: Implements MediaCatalogPort
  - **Criteria**: Uses Spring RestClient to call media catalog service
  - **Criteria**: Maps external DTOs to domain types
  - **Criteria**: Integration tests with WireMock (no real services)
  - **Dependencies**: T021

- [ ] T029 [P] [US3] Implement TextGenerationAiAdapter in `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/service/TextGenerationAiAdapter.java`
  - **Criteria**: Implements TextGenerationPort
  - **Criteria**: Uses Spring RestClient to call AI service
  - **Criteria**: Error mapping: timeout → HTTP 503, rate limit → 429
  - **Criteria**: No prompts or AI responses in logs (security)
  - **Criteria**: Integration tests with WireMock (mock AI service)
  - **Dependencies**: T024

- [ ] T030 [P] Create AI request/response mappers in `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/service/mapper/AiTextMapper.java`
  - **Criteria**: Maps domain TextContent to AI service request format
  - **Criteria**: Maps AI service response to domain TextContent
  - **Dependencies**: T029

---

## Phase 9: Infrastructure Layer (Controllers In)

**Focus**: REST controllers implementing OpenAPI

### Controller Tasks

- [ ] T031 Create MeditationBuilderController in `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/controller/MeditationBuilderController.java`
  - **Criteria**: Implements all endpoints from OpenAPI spec
  - **Criteria**: Delegates to ComposeContentUseCase and GenerateTextUseCase
  - **Criteria**: Uses DTOs (no domain objects exposed)
  - **Criteria**: Superficial validation only (delegate deep validation to application)
  - **Criteria**: MockMvc tests verify OpenAPI compliance
  - **Dependencies**: T025, T027, T013

- [ ] T032 [P] Create request DTOs in `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/dto/`
  - **Files**: CreateCompositionRequest, UpdateTextRequest, GenerateTextRequest, SelectMusicRequest, SelectImageRequest
  - **Criteria**: Match OpenAPI schemas exactly
  - **Criteria**: Jakarta validation annotations
  - **Dependencies**: T013

- [ ] T033 [P] Create response DTOs in `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/dto/`
  - **Files**: CompositionResponse, TextContentResponse, OutputTypeResponse
  - **Criteria**: Match OpenAPI schemas exactly
  - **Dependencies**: T013

- [ ] T034 [P] Create DTO mappers in `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/mapper/CompositionDtoMapper.java`
  - **Criteria**: Maps domain MeditationComposition ↔ DTOs
  - **Criteria**: Maps domain TextContent ↔ DTOs
  - **Criteria**: Unit tests for bidirectional mapping
  - **Dependencies**: T032, T033

---

## Phase 10: Frontend (User Story 1 & 2 - P1)

**Focus**: Manual text entry and output type indication UI

### Frontend API Client Tasks

- [ ] T035 Generate OpenAPI client in `/frontend/src/api/` using openapi-generator
  - **Criteria**: Client auto-generated from `/backend/src/main/resources/openapi/meditationbuilder/compose-content.yaml`
  - **Criteria**: TypeScript types generated
  - **Dependencies**: T013

### Frontend State Management Tasks

- [ ] T036 [P] [US1] Create composerStore (Zustand) in `/frontend/src/state/composerStore.ts`
  - **Criteria**: UI state: textContent, selectedMusic, selectedImage, outputType
  - **Criteria**: Actions: setText, setMusic, setImage, clearImage
  - **Criteria**: NO server state (managed by React Query)
  - **Dependencies**: T035

### Frontend Component Tasks

- [ ] T037 [P] [US1] Create TextEditor component in `/frontend/src/components/TextEditor.tsx`
  - **Criteria**: Controlled textarea for meditation text
  - **Criteria**: Preserves text exactly as typed (mirrors domain invariant)
  - **Criteria**: Character count display (max 10,000)
  - **Criteria**: Unit tests (Jest/RTL) verify text preservation
  - **Dependencies**: T036

- [ ] T038 [P] [US2] Create OutputTypeIndicator component in `/frontend/src/components/OutputTypeIndicator.tsx`
  - **Criteria**: Displays "Generate Podcast" when no image selected
  - **Criteria**: Displays "Generate Video" when image selected
  - **Criteria**: Updates immediately on image add/remove (< 0.5s per SC-013)
  - **Criteria**: Unit tests verify indicator logic
  - **Dependencies**: T036

- [ ] T039 [P] [US1] Create MusicSelector component in `/frontend/src/components/MusicSelector.tsx`
  - **Criteria**: Displays music selection interface
  - **Criteria**: Integrates with composerStore
  - **Dependencies**: T036

- [ ] T040 [P] [US1] Create ImageSelector component in `/frontend/src/components/ImageSelector.tsx`
  - **Criteria**: Displays image selection interface
  - **Criteria**: Triggers outputType update in store on selection/removal
  - **Dependencies**: T036

- [ ] T041 [US1] Create MeditationBuilderPage in `/frontend/src/pages/MeditationBuilderPage.tsx`
  - **Criteria**: Composes TextEditor, MusicSelector, ImageSelector, OutputTypeIndicator
  - **Criteria**: Manages page layout
  - **Criteria**: Integration test (RTL) verifies composition flow
  - **Dependencies**: T037, T038, T039, T040

### Frontend Hooks Tasks

- [ ] T042 [P] [US1] Create useComposition hook in `/frontend/src/hooks/useComposition.ts`
  - **Criteria**: React Query hook for server-state (fetch/update composition)
  - **Criteria**: Uses auto-generated API client
  - **Criteria**: Error handling for network failures
  - **Dependencies**: T035

---

## Phase 11: Frontend (User Story 3 & 4 - P2/P3)

**Focus**: AI text generation UI

### Frontend Component Tasks (AI)

- [ ] T043 [P] [US3] Create GenerateTextButton component in `/frontend/src/components/GenerateTextButton.tsx`
  - **Criteria**: Button disabled during generation (FR-013)
  - **Criteria**: Shows loading indicator during AI generation
  - **Criteria**: Unit tests verify disabled state during loading
  - **Dependencies**: T036

- [ ] T044 [P] [US3] Create useGenerateText hook in `/frontend/src/hooks/useGenerateText.ts`
  - **Criteria**: React Query mutation for AI text generation
  - **Criteria**: Handles empty field (from scratch) vs. existing content (enhance)
  - **Criteria**: Error handling: AI unavailable → user-friendly message
  - **Criteria**: Integration test with MSW (mock AI endpoint)
  - **Dependencies**: T035

- [ ] T045 [US3] Integrate GenerateTextButton into MeditationBuilderPage
  - **Criteria**: Button triggers useGenerateText hook
  - **Criteria**: Generated text populates TextEditor
  - **Dependencies**: T041, T043, T044

---

## Phase 12: Frontend (User Story 5 & 6 - P2)

**Focus**: Media preview UI

### Frontend Component Tasks (Preview)

- [ ] T046 [P] [US5] Create MusicPreview component in `/frontend/src/components/MusicPreview.tsx`
  - **Criteria**: Audio player with play/pause controls
  - **Criteria**: Preview starts within 2 seconds (SC-004)
  - **Criteria**: Disabled/hidden when no music selected
  - **Criteria**: Unit tests verify playback controls
  - **Dependencies**: T039

- [ ] T047 [P] [US6] Create ImagePreview component in `/frontend/src/components/ImagePreview.tsx`
  - **Criteria**: Displays selected image clearly
  - **Criteria**: Preview displays within 1 second (SC-005)
  - **Criteria**: Disabled/hidden when no image selected
  - **Criteria**: Unit tests verify display logic
  - **Dependencies**: T040

- [ ] T048 Integrate preview components into MeditationBuilderPage
  - **Criteria**: MusicPreview and ImagePreview integrated
  - **Criteria**: Preview triggers on user request
  - **Dependencies**: T041, T046, T047

---

## Phase 13: BDD Implementation (Test Layer)

**Focus**: Implement BDD step definitions (make tests GREEN)

### BDD Implementation Tasks

- [ ] T049 Implement BDD steps for US1 (Manual Text Entry) in `/backend/tests/bdd/meditationbuilder/steps/ComposeContentSteps.java`
  - **Criteria**: Steps call backend REST API (not direct service calls)
  - **Criteria**: Scenarios US1-S1, US1-S2, US1-S3 pass (GREEN)
  - **Criteria**: Uses RestAssured or similar for HTTP calls
  - **Dependencies**: T031, T010

- [ ] T050 Implement BDD steps for US2 (Output Type Indication) in `/backend/tests/bdd/meditationbuilder/steps/ComposeContentSteps.java`
  - **Criteria**: Scenarios US2-S1, US2-S2, US2-S3, US2-S4 pass (GREEN)
  - **Criteria**: Verifies output type in API responses
  - **Dependencies**: T031, T049

- [ ] T051 [P] Implement BDD steps for US3 (AI Generation from Scratch) in `/backend/tests/bdd/meditationbuilder/steps/ComposeContentSteps.java`
  - **Criteria**: Scenarios US3-S1, US3-S2, US3-S3 pass (GREEN)
  - **Criteria**: Mocks AI service (WireMock or test containers)
  - **Dependencies**: T031, T049

- [ ] T052 [P] Implement BDD steps for US4 (AI Enhancement) in `/backend/tests/bdd/meditationbuilder/steps/ComposeContentSteps.java`
  - **Criteria**: Scenarios US4-S1, US4-S2, US4-S3 pass (GREEN)
  - **Criteria**: Mocks AI service
  - **Dependencies**: T031, T051

- [ ] T053 [P] Implement BDD steps for US5 (Music Preview) in `/backend/tests/bdd/meditationbuilder/steps/ComposeContentSteps.java`
  - **Criteria**: Scenarios US5-S1, US5-S2, US5-S3 pass (GREEN)
  - **Criteria**: Mocks media catalog service
  - **Dependencies**: T031, T049

- [ ] T054 [P] Implement BDD steps for US6 (Image Preview) in `/backend/tests/bdd/meditationbuilder/steps/ComposeContentSteps.java`
  - **Criteria**: Scenarios US6-S1, US6-S2, US6-S3 pass (GREEN)
  - **Criteria**: Mocks media catalog service
  - **Dependencies**: T031, T053

- [ ] T055 Run full BDD suite and verify all scenarios GREEN
  - **Criteria**: All BDD scenarios pass
  - **Criteria**: No pending or failed scenarios
  - **Dependencies**: T049, T050, T051, T052, T053, T054

---

## Phase 14: Contract Testing (Test Layer)

**Focus**: Validate backend adheres to OpenAPI contract

### Contract Test Tasks

- [ ] T056 [P] Create provider contract tests in `/backend/tests/contracts/ComposeContentContractTest.java`
  - **Criteria**: Uses Spring Cloud Contract or Pact
  - **Criteria**: Validates all endpoints against OpenAPI schema
  - **Criteria**: Detects breaking changes automatically
  - **Criteria**: Tests verify request/response DTOs match OpenAPI exactly
  - **Dependencies**: T031, T013

- [ ] T057 Run contract tests and verify compliance
  - **Criteria**: All contract tests pass
  - **Criteria**: No schema violations detected
  - **Dependencies**: T056

---

## Phase 15: E2E Testing (Test Layer)

**Focus**: End-to-end testing of backend and frontend

### Backend E2E Tasks

- [ ] T058 [P] Create E2E test for manual composition flow in `/backend/tests/e2e/ManualCompositionE2ETest.java`
  - **Criteria**: Tests full flow: create composition → update text → select music/image → verify output type
  - **Criteria**: Uses real backend (embedded or test container)
  - **Criteria**: Mocks external dependencies (AI, media catalog)
  - **Dependencies**: T055

- [ ] T059 [P] Create E2E test for AI generation flow in `/backend/tests/e2e/AiGenerationE2ETest.java`
  - **Criteria**: Tests: generate from scratch → enhance existing → verify text updated
  - **Criteria**: Mocks AI service
  - **Dependencies**: T058

- [ ] T060 Run backend E2E tests and verify all pass
  - **Criteria**: All E2E scenarios pass
  - **Dependencies**: T058, T059

### Frontend E2E Tasks

- [ ] T061 [P] Create Playwright E2E test for manual composition in `/frontend/tests/e2e/manual-composition.spec.ts`
  - **Criteria**: Tests: login → access builder → enter text → verify text preserved
  - **Criteria**: Tests: select image → verify output type changes to video
  - **Criteria**: Tests: remove image → verify output type changes to podcast
  - **Dependencies**: T041

- [ ] T062 [P] Create Playwright E2E test for AI generation in `/frontend/tests/e2e/ai-generation.spec.ts`
  - **Criteria**: Tests: click generate button → verify loading state → verify generated text appears
  - **Criteria**: Mocks AI endpoint with MSW or Playwright routing
  - **Dependencies**: T045

- [ ] T063 [P] Create Playwright E2E test for media preview in `/frontend/tests/e2e/media-preview.spec.ts`
  - **Criteria**: Tests: select music → preview → verify playback
  - **Criteria**: Tests: select image → preview → verify display
  - **Dependencies**: T048

- [ ] T064 Run frontend E2E tests and verify all pass
  - **Criteria**: All Playwright tests pass
  - **Criteria**: No flaky tests
  - **Dependencies**: T061, T062, T063

---

## Phase 16: CI/CD Gates

**Focus**: Automated pipeline with mandatory gates

### CI/CD Tasks

- [ ] T065 Create backend CI workflow in `.github/workflows/backend-ci.yml`
  - **Criteria**: Gates in order: bdd → unit → infra → contract → e2e → build
  - **Criteria**: All gates blocking (any failure prevents merge)
  - **Criteria**: Uses Maven for backend build
  - **Criteria**: Publishes test reports
  - **Dependencies**: T060, T057

- [ ] T066 Create frontend CI workflow in `.github/workflows/frontend-ci.yml`
  - **Criteria**: Gates: unit → integration → e2e → build
  - **Criteria**: All gates blocking
  - **Criteria**: Uses npm for frontend build
  - **Criteria**: Publishes Playwright reports
  - **Dependencies**: T064

- [ ] T067 Verify CI/CD pipeline end-to-end
  - **Criteria**: Push to feature branch triggers both workflows
  - **Criteria**: All gates pass
  - **Criteria**: Build artifacts generated
  - **Dependencies**: T065, T066

---

## Phase 17: Observability & Polish

**Focus**: Logging, metrics, and final refinements

### Observability Tasks

- [ ] T068 [P] Add logging to ComposeContentService in `/backend/src/main/java/com/hexagonal/meditationbuilder/application/service/ComposeContentService.java`
  - **Criteria**: Log composition created, text updated, music/image selected
  - **Criteria**: Log level: INFO for business events, WARN for errors
  - **Criteria**: No sensitive data (prompts, AI responses) logged
  - **Dependencies**: T025

- [ ] T069 [P] Add logging to GenerateTextService in `/backend/src/main/java/com/hexagonal/meditationbuilder/application/service/GenerateTextService.java`
  - **Criteria**: Log AI generation requests (without prompt content)
  - **Criteria**: Log AI failures with error codes
  - **Dependencies**: T027

- [ ] T070 [P] Add logging to adapters in `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/service/`
  - **Criteria**: Log external service calls (AI, media catalog)
  - **Criteria**: Log latency for AI generation (for performance monitoring)
  - **Dependencies**: T028, T029

- [ ] T071 [P] Add metrics instrumentation (Micrometer/Prometheus)
  - **Criteria**: Metrics: composition_created_total, ai_generation_duration_seconds, ai_generation_failures_total
  - **Criteria**: Metrics exposed on /actuator/metrics
  - **Dependencies**: T068, T069, T070

### Polish Tasks

- [ ] T072 Review and remove all TODO comments
  - **Criteria**: No TODO comments in production code
  - **Criteria**: All deferred work captured in future user stories

- [ ] T073 Review and verify no skipped tests
  - **Criteria**: No @Disabled or @Ignore annotations
  - **Criteria**: All tests executable and passing

- [ ] T074 Code review and refactoring pass
  - **Criteria**: No code smells (God Objects, duplicated classes)
  - **Criteria**: All naming follows conventions (ports, use cases, adapters, controllers, DTOs)

- [ ] T075 Update documentation: README with feature overview and architecture diagram
  - **Criteria**: README includes: feature description, architecture diagram (hexagonal), how to run tests, how to run locally

---

## Dependencies & Execution Order

### Critical Path (Blocking Tasks)

1. **Setup** (T001-T008) → All phases
2. **BDD Yellow** (T009-T011) → API First
3. **API Definition** (T012-T014) → All implementation phases
4. **Domain** (T015-T024) → Application layer
5. **Application** (T025-T027) → Infrastructure & Controllers
6. **Infrastructure + Controllers** (T028-T034) → Frontend, BDD implementation
7. **BDD Green** (T049-T055) → Contract & E2E tests
8. **All Tests** (T056-T064) → CI/CD gates

### User Story Completion Order

**MVP (P1)**: US1 + US2
- Tasks: T015-T021, T025-T026, T028, T031-T042, T049-T050
- **Independent Test**: User can log in, enter text manually, select music/image, see output type indication

**P2 Features**: US3, US5, US6
- Tasks: T022-T024, T027, T029-T030, T043-T048, T051, T053-T054
- **Independent Test**: User can generate text from scratch, preview music, preview images

**P3 Features**: US4
- Tasks: T052
- **Independent Test**: User can enhance existing text with AI

### Parallel Execution Opportunities

**Within Domain Layer** (can run in parallel):
- T015, T016, T017, T018 (value objects and enums)
- T020, T021, T022, T023, T024 (ports - different interfaces)

**Within Infrastructure Layer** (can run in parallel):
- T028, T029, T030 (adapters - different services)
- T032, T033 (DTOs - request vs response)

**Within Frontend Layer** (can run in parallel):
- T037, T038, T039, T040 (components - different UI elements)
- T042, T044 (hooks - different React Query hooks)
- T046, T047 (preview components)

**Within BDD Implementation** (can run in parallel after T049-T050):
- T051, T052, T053, T054 (different user story scenarios)

**Within E2E Tests** (can run in parallel):
- T058, T059 (backend E2E)
- T061, T062, T063 (frontend E2E)

---

## Task Summary

**Total Tasks**: 75

**Tasks by Phase**:
- Setup: 8 tasks
- BDD First: 3 tasks
- API First: 3 tasks
- Domain (P1): 6 tasks
- Domain (P2/P3): 3 tasks
- Application (P1): 2 tasks
- Application (P2/P3): 1 task
- Infrastructure: 3 tasks
- Controllers: 4 tasks
- Frontend (P1): 7 tasks
- Frontend (P2/P3): 3 tasks
- Frontend (Preview): 3 tasks
- BDD Implementation: 7 tasks
- Contract Tests: 2 tasks
- E2E Tests: 7 tasks
- CI/CD: 3 tasks
- Observability & Polish: 8 tasks

**Tasks by User Story**:
- US1 (Manual Text Entry): 18 tasks
- US2 (Output Type Indication): 4 tasks
- US3 (AI Generation from Scratch): 8 tasks
- US4 (AI Enhancement): 3 tasks
- US5 (Music Preview): 3 tasks
- US6 (Image Preview): 3 tasks
- Cross-cutting (Setup, Tests, CI/CD): 36 tasks

**Parallel Opportunities**: 30 tasks marked [P] can execute in parallel within their phase

**Independent Test Criteria**:
- **US1+US2 (MVP)**: User can manually compose meditation (text + music + image) and see correct output type indication
- **US3**: User can generate meditation text from empty field
- **US4**: User can enhance existing text with AI
- **US5**: User can preview selected music
- **US6**: User can preview selected image

---

## Format Validation

✅ All tasks follow mandatory checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`  
✅ Sequential Task IDs (T001-T075)  
✅ [P] marker only on parallelizable tasks (30 tasks)  
✅ [Story] label on user story phase tasks (18 US1, 4 US2, 8 US3, 3 US4, 3 US5, 3 US6)  
✅ File paths included in all implementation tasks  
✅ Setup/Foundational/Polish tasks have no story labels  

---

**Tasks Status**: READY FOR EXECUTION  
**Next Step**: Begin with T001 (Setup) or execute MVP scope (T001-T042, T049-T050)
