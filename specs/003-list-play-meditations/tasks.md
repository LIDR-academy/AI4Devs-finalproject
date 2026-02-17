---
description: "Implementation tasks for US4 - List and Play Generated Meditations (v2 - Layer-based)"
---

# Tasks: List and Play Generated Meditations (US4)

**Branch**: `003-list-play-meditations`  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)  
**Data Model**: [data-model.md](./data-model.md)

**Complexity**: Media (lectura de datos existentes, no generación compleja)  
**Target Tasks**: 20-35 tareas (agrupadas por capa)

---

## Phase 1: Setup & Foundation

**Purpose**: Initialize branch, verify infrastructure prerequisites

- [x] **T001 - Setup Playback BC Structure**  
  **Description**: Create branch `003-list-play-meditations` from `develop`, initialize bounded context directory structure  
  **Artifacts**:
  - `backend/src/main/java/com/hexagonal/playback/`
  - `backend/src/test/java/com/hexagonal/playback/`
  - `backend/src/main/resources/openapi/playback/`
  - `frontend/src/{components,hooks,state}/playback/`  
  **Acceptance Criteria**:
  - Branch created and checked out
  - All BC directories exist
  - No compilation errors  
  **Dependencies**: None

- [x] **T002 - Verify Database Infrastructure (US3 Dependency)**  
  **Description**: Verify PostgreSQL schema `generation.meditations` exists from US3, create indexes if missing  
  **Artifacts**:
  - Database verification script
  - Index creation: `idx_meditations_user_id`, `idx_meditations_created_at`  
  **Acceptance Criteria**:
  - Schema `generation` exists
  - Table `meditations` has all required columns (id, user_id, title, created_at, state, audio_url, video_url, subtitles_url)
  - Indexes created
  - Testcontainers PostgreSQL configuration ready  
  **Dependencies**: T001, US3 completed

---

## Phase 2: BDD & API Design

**Purpose**: Define business behavior and abstract API capabilities

- [x] **T003 - BDD Feature Definition**  
  **Description**: Create Cucumber feature file with 2 scenarios from spec.md  
  **Artifacts**:
  - `backend/src/test/resources/features/playback/list-play-meditations.feature`  
  **Acceptance Criteria**:
  - Scenario 1: "Listar las meditaciones del usuario con su estado" implemented
  - Scenario 2: "Reproducir una meditación completada" implemented
  - Steps use business language only (estados: "En cola", "Generando", "Completada", "Fallida")
  - Steps PENDING (Cucumber YELLOW)  
  **Dependencies**: T002

- [x] **T004 - OpenAPI Specification**  
  **Description**: Define abstract API capabilities for playback BC  
  **Artifacts**:
  - `backend/src/main/resources/openapi/playback/list-play-meditations.yaml`  
  **Acceptance Criteria**:
  - Capability 1: List User Meditations (derived from "solicita ver el listado de sus meditaciones")
  - Capability 2: Play Completed Meditation (derived from "selecciona reproducir esa meditación")
  - Abstract descriptions (no HTTP paths/methods/DTOs yet)  
  **Dependencies**: T003

---

## Phase 3: Domain Layer (TDD)

**Purpose**: Implement domain models, business rules, and ports (NO Spring dependencies)

- [x] **T005 - Domain Models & Value Objects**  
  **Description**: Implement TDD for domain models (Aggregate Root, VOs, Enums)  
  **Artifacts**:
  - Tests: `${basePackage}/playback/domain/model/*Test.java`
  - Implementation: `${basePackage}/playback/domain/model/{Meditation, ProcessingState, MediaUrls}`  
  **Acceptance Criteria**:
  - Tests written FIRST (RED state)
  - `Meditation` record (id, userId, title, createdAt, processingState, mediaUrls) with immutability tests
  - `ProcessingState` enum (PENDING, PROCESSING, COMPLETED, FAILED)
  - `MediaUrls` record (audioUrl, videoUrl, subtitlesUrl) with validation
  - Java 21 records used for immutability
  - UUID for ids, Clock for timestamps
  - All tests GREEN
  - Zero Spring dependencies  
  **Dependencies**: T004

- [x] **T006 - Domain Exceptions & Business Rules**  
  **Description**: Implement domain exceptions and playback validation rules  
  **Artifacts**:
  - Tests: `${basePackage}/playback/domain/exception/*Test.java`
  - Implementation: `${basePackage}/playback/domain/exception/{MeditationNotFoundException, MeditationNotPlayableException}`  
  **Acceptance Criteria**:
  - Business rule: Only COMPLETED state allows playback (validated in domain)
  - MeditationNotFoundException for non-existent or non-owned meditations
  - MeditationNotPlayableException for non-COMPLETED states
  - All exception tests GREEN  
  **Dependencies**: T005

- [x] **T007 - Domain Ports (In & Out)**  
  **Description**: Define hexagonal ports for use cases and repositories  
  **Artifacts**:
  - `${basePackage}/playback/domain/ports/in/{ListMeditationsUseCase, GetPlaybackInfoUseCase}`
  - `${basePackage}/playback/domain/ports/out/MeditationRepositoryPort`  
  **Acceptance Criteria**:
  - ListMeditationsUseCase: input userId, output List<Meditation>
  - GetPlaybackInfoUseCase: input meditationId + userId, output Meditation
  - MeditationRepositoryPort: methods findAllByUserId, findByIdAndUserId
  - Pure interfaces, no implementation  
  **Dependencies**: T006

---

## Phase 4: Application Layer (Use Cases)

**Purpose**: Orchestrate domain logic via ports (NO business rules here)

- [x] **T008 - Application Services & Validators**  
  **Description**: Implement TDD for use case orchestration  
  **Artifacts**:
  - Tests: `${basePackage}/playback/application/service/*Test.java` (mocked ports)
  - Implementation: `${basePackage}/playback/application/service/{ListMeditationsService, GetPlaybackInfoService, PlaybackValidator}`  
  **Acceptance Criteria**:
  - Tests written FIRST with mocked MeditationRepositoryPort (RED state)
  - ListMeditationsService orchestrates repository port, orders by createdAt DESC
  - GetPlaybackInfoService validates meditation exists, userId matches, state is COMPLETED
  - PlaybackValidator enforces COMPLETED-only rule (throws MeditationNotPlayableException)
  - No business logic (delegated to domain)
  - All tests GREEN with mocked dependencies  
  **Dependencies**: T007

---

## Phase 5: Infrastructure Layer (Persistence)

**Purpose**: Implement out ports with Spring Data JPA + PostgreSQL

- [x] **T009 - PostgreSQL Persistence Layer**  
  **Description**: Implement TDD for JPA persistence adapters (Testcontainers)  
  **Artifacts**:
  - Tests: `${basePackage}/playback/infrastructure/out/persistence/*IT.java` (Testcontainers PostgreSQL)
  - Implementation: `${basePackage}/playback/infrastructure/out/persistence/{MeditationEntity, PostgreSqlMeditationRepository, EntityToDomainMapper, PostgreSqlMeditationRepositoryAdapter}`  
  **Acceptance Criteria**:
  - Integration tests written FIRST with Testcontainers (RED state)
  - MeditationEntity maps to `generation.meditations` table (@Table annotation)
  - Spring Data JPA repository with query methods: findAllByUserIdOrderByCreatedAtDesc, findByIdAndUserId
  - EntityToDomainMapper converts DB enum → ProcessingState, JPA entity ↔ domain Meditation
  - PostgreSqlMeditationRepositoryAdapter implements MeditationRepositoryPort
  - Tests verify userId filtering (WHERE user_id = ?)
  - Tests verify state mapping correctness
  - All integration tests GREEN  
  **Dependencies**: T008

---

## Phase 6: Controllers Layer (REST API)

**Purpose**: Implement REST endpoints complying with OpenAPI spec

- [ ] **T010 - REST Controllers & DTOs**  
  **Description**: Implement TDD for REST API layer with MockMvc  
  **Artifacts**:
  - Tests: `${basePackage}/playback/infrastructure/in/rest/controller/*Test.java` (MockMvc)
  - DTOs: `${basePackage}/playback/infrastructure/in/rest/dto/{MeditationListResponseDto, MeditationItemDto, PlaybackInfoResponseDto}`
  - Mappers: `${basePackage}/playback/infrastructure/in/rest/mapper/DtoMapper`
  - Controller: `${basePackage}/playback/infrastructure/in/rest/controller/PlaybackController`  
  **Acceptance Criteria**:
  - Controller tests written FIRST with MockMvc (RED state)
  - GET /api/v1/meditations endpoint (list user meditations)
  - GET /api/v1/meditations/{id}/playback endpoint (get playback info)
  - UserId extracted from Spring Security Context (never from request)
  - State labels translation: PENDING → "En cola", PROCESSING → "Generando", COMPLETED → "Completada", FAILED → "Fallida"
  - HTTP responses: 200 OK, 404 if not found, 409 if not playable
  - Exception handlers for domain exceptions
  - OpenAPI compliance verified
  - All controller tests GREEN  
  **Dependencies**: T009

---

## Phase 7: Frontend Layer

**Purpose**: Implement React UI for meditation library and playback

- [ ] **T011 - Frontend Components & UI**  
  **Description**: Implement playback UI components  
  **Artifacts**:
  - `frontend/src/api/` (OpenAPI TypeScript client generated)
  - Components: `frontend/src/components/playback/{StateLabel, MeditationCard, MeditationList, MeditationPlayer}.tsx`  
  **Acceptance Criteria**:
  - OpenAPI client autogenerated from playback spec
  - StateLabel component displays state badges with translations and color coding
  - MeditationCard shows title, StateLabel, createdAt, Play button (disabled if not "Completada")
  - MeditationList renders cards, shows empty state message: "Aún no tienes meditaciones. Empieza creando una nueva."
  - MeditationPlayer supports audio/video playback with controls
  - Component tests (Jest/RTL) verify state-based behavior  
  **Dependencies**: T010

- [ ] **T012 - Frontend State Management**  
  **Description**: Implement React Query hooks and Zustand store  
  **Artifacts**:
  - Hooks: `frontend/src/hooks/playback/{useMeditationList, usePlaybackInfo}.ts`
  - Store: `frontend/src/state/playerStore.ts`  
  **Acceptance Criteria**:
  - useMeditationList hook fetches GET /meditations (React Query)
  - usePlaybackInfo hook fetches GET /meditations/{id}/playback, handles 409 error with user message
  - playerStore (Zustand) manages UI state: currentMeditation, isPlaying, volume, seek position
  - Server-state in React Query, UI-state in Zustand (separation enforced)
  - Hook tests (MSW) verify data fetching and error handling  
  **Dependencies**: T011

- [ ] **T013 - Frontend Page & Routing**  
  **Description**: Implement Meditation Library page and route integration  
  **Artifacts**:
  - Page: `frontend/src/pages/MeditationLibraryPage.tsx`
  - Router update: `/library` route  
  **Acceptance Criteria**:
  - MeditationLibraryPage uses useMeditationList hook
  - Renders MeditationList component
  - Integrates MeditationPlayer for selected meditation
  - Shows error message if playback fails: "Esta meditación aún se está procesando. Por favor, espera a que esté lista."
  - Route `/library` registered in frontend router
  - Page tests (Jest/RTL + MSW) verify loading, list display, playback error scenarios  
  **Dependencies**: T012

---

## Phase 8: Quality Assurance

**Purpose**: Contract tests, E2E tests, CI/CD integration

- [ ] **T014 - Contract Tests (OpenAPI Validation)**  
  **Description**: Validate backend compliance with OpenAPI spec  
  **Artifacts**:
  - `backend/src/test/contracts/PlaybackContractTest.java` (WireMock or Spring Cloud Contract)  
  **Acceptance Criteria**:
  - Contract test for GET /api/v1/meditations validates response schema
  - Contract test for GET /api/v1/meditations/{id}/playback validates response schema, 404 case, 409 case
  - Breaking changes detected automatically
  - All contract tests GREEN  
  **Dependencies**: T010

- [ ] **T015 - E2E Tests (Backend + Frontend)**  
  **Description**: Implement end-to-end BDD scenarios and frontend flows  
  **Artifacts**:
  - Backend BDD steps: `${basePackage}/playback/bdd/steps/{ListMeditationsSteps, PlayMeditationSteps}.java`
  - Frontend E2E: `frontend/tests/e2e/playback/{list-meditations, play-meditation, playback-error}.spec.ts`  
  **Acceptance Criteria**:
  - Backend: Cucumber step definitions for 2 BDD scenarios (list + playback)
  - Backend: Tests run against real backend with Testcontainers PostgreSQL + seeded data
  - Frontend: Playwright test verifies meditation list display with states
  - Frontend: Playwright test verifies Play button disabled for non-completed meditations
  - Frontend: Playwright test verifies error message shown for playback errors
  - All BDD scenarios GREEN
  - All Playwright tests GREEN  
  **Dependencies**: T013, T014

- [ ] **T016 - CI/CD Integration & Gates**  
  **Description**: Update workflows, verify all 8 CI gates pass  
  **Artifacts**:
  - `.github/workflows/backend-ci.yml` (updated for playback BC)
  - `.github/workflows/frontend-ci.yml` (updated for playback E2E)  
  **Acceptance Criteria**:
  - Backend workflow includes playback BC in gates: BDD → API → Unit Domain → Unit App → Infra IT → Contract → E2E → Build
  - Frontend workflow runs playback E2E tests
  - All 8 gates pass
  - Total pipeline timeout ≤ 187s
  - PostgreSQL Testcontainers works in CI environment  
  **Dependencies**: T015

---

## Phase 9: Documentation & Polish

**Purpose**: Final validation, observability, code quality

- [ ] **T017 - Observability & Documentation**  
  **Description**: Add logging, metrics, API documentation  
  **Artifacts**:
  - Logging implementation in playback services
  - `docs/api/playback.md` (API documentation)
  - Constitution update (if needed)  
  **Acceptance Criteria**:
  - Logging added for list meditations, playback info retrieval
  - No sensitive data in logs (userId as UUID only)
  - API documentation complete for playback endpoints
  - Constitution.md reflects 3rd Bounded Context "playback" (if not already)  
  **Dependencies**: T016

- [ ] **T018 - Code Quality & Final Validation**  
  **Description**: Run quality checks, verify Definition of Done  
  **Artifacts**:
  - SonarQube/quality reports
  - DoD checklist verification  
  **Acceptance Criteria**:
  - SonarQube checks pass for playback BC
  - No TODO comments, no skipped tests
  - Hexagonal architecture compliance verified (no Spring in domain)
  - Full test suite (backend + frontend) GREEN
  - Manual smoke test: List meditations → see states → play completed → playback works
  - All 12 DoD criteria from plan.md verified ✅  
  **Dependencies**: T017


---

## Dependencies & Execution Order

### Sequential Phases (STRICT)

1. **Phase 1 (Setup)**: T001 → T002
2. **Phase 2 (BDD & API)**: T003 → T004
3. **Phase 3 (Domain)**: T005 → T006 → T007
4. **Phase 4 (Application)**: T008
5. **Phase 5 (Infrastructure)**: T009
6. **Phase 6 (Controllers)**: T010
7. **Phase 7 (Frontend)**: T011 → T012 → T013
8. **Phase 8 (QA)**: T014 → T015 → T016
9. **Phase 9 (Polish)**: T017 → T018

**No phase can start until previous phase is complete.**

### Critical Path

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018
```

**Total Tasks**: 18 (complejidad media)

---

## Implementation Strategy

### Recommended Approach: TDD + Layer-by-Layer

1. **T001-T002**: Setup & foundation verification
2. **T003-T004**: BDD scenarios (YELLOW) + Abstract API
3. **T005-T007**: Domain TDD (RED → GREEN)
4. **T008**: Application TDD (RED → GREEN)
5. **T009**: Infrastructure integration tests (RED → GREEN)
6. **T010**: Controllers TDD (RED → GREEN)
7. **T011-T013**: Frontend implementation + tests
8. **T014-T016**: QA (contracts, E2E, CI)
9. **T017-T018**: Observability + final validation

### Checkpoints

**After T007 (Domain)**:
- ✅ Domain models immutable (Java 21 records)
- ✅ Business rules enforced (COMPLETED-only playback)
- ✅ No Spring dependencies
- ✅ All domain tests GREEN

**After T008 (Application)**:
- ✅ Use cases orchestrate via ports
- ✅ No business logic in services
- ✅ All application tests GREEN with mocks

**After T009 (Infrastructure)**:
- ✅ Testcontainers integration tests GREEN
- ✅ PostgreSQL schema `generation` reused correctly
- ✅ State mapping verified

**After T010 (Controllers)**:
- ✅ REST API complies with OpenAPI
- ✅ State labels translated correctly
- ✅ 404/409 responses working

**After T013 (Frontend)**:
- ✅ UI displays meditation list with states
- ✅ Play button disabled for non-completed
- ✅ Empty state message shown

**After T016 (QA)**:
- ✅ BDD scenarios GREEN
- ✅ Contract tests validate OpenAPI compliance
- ✅ E2E tests verify end-to-end flows
- ✅ All 8 CI gates pass

**After T018 (Complete)**:
- ✅ All 12 DoD criteria verified
- ✅ US4 production-ready

---

## Notes

- **Layer-based grouping**: Each task represents an entire layer, not individual classes
- **TDD approach**: Write tests FIRST (RED) → Implement (GREEN) → Refactor
- **Hexagonal compliance**: Domain → Application → Infrastructure → Controllers (strict dependency direction)
- **State labels**: PENDING → "En cola", PROCESSING → "Generando", COMPLETED → "Completada", FAILED → "Fallida"
- **Security**: userId from Spring Security Context (never from request)
- **Data isolation**: All queries filtered by userId
- **Infrastructure reuse**: PostgreSQL schema `generation` from US3 (READ-ONLY)

---

## Summary

- **Total Tasks**: 18 (collapsed from 78 granular tasks)
- **Complexity**: Media
- **Estimated Duration**: 6-8 iterations (one phase per iteration)
- **Test Coverage**: BDD, Unit (domain + application), Integration (infra), Contract, E2E
- **CI Gates**: 8 (BDD → API → Unit Domain → Unit App → Infra IT → Contract → E2E → Build)

**Status**: READY FOR IMPLEMENTATION ✅

