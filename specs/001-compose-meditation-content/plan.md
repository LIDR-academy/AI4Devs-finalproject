# Implementation Plan: Compose Meditation Content with Optional AI Assistance

**Branch**: `001-compose-meditation-content`  
**Spec**: [spec.md](./spec.md)

## Pipeline Overview

| Fase | Artefactos | Dependencias |
|------|------------|--------------|
| 1. BDD First | `/backend/tests/bdd/meditationbuilder/compose-content.feature` | Ninguna |
| 2. API First | `/backend/src/main/resources/openapi/meditationbuilder/compose-content.yaml` | 1.BDD |
| 3. Domain | `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/` | 2.API |
| 4. Application | `/backend/src/main/java/com/hexagonal/meditationbuilder/application/` | 3.Domain |
| 5. Infrastructure | `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/` | 4.Application |
| 6. Controllers | `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/` | 5.Infrastructure |
| 7. Frontend | `/frontend/src/{api,components,pages,hooks,state}/` | 6.Controllers |
| 8. Contracts | `/backend/tests/contracts/` | 7.Frontend |
| 9. E2E | `/backend/tests/e2e/ + /frontend/tests/e2e/` | 8.Contracts |
| 10. CI/CD | `.github/workflows/` | 9.E2E |

## Fases Detalladas

### Phase 1: BDD First
**Artefactos**:
- `/backend/tests/bdd/meditationbuilder/compose-content.feature`

**Herramientas**: Cucumber

**Criterios**:
- Escenarios Given/When/Then extraídos de spec.md
- Steps pending (Cucumber YELLOW)
- Lenguaje 100% negocio

**Prohibido**:
- Implementar steps
- Términos técnicos (HTTP, JSON, DB)

---

### Phase 2: API First
**Artefactos**:
- `/backend/src/main/resources/openapi/meditationbuilder/compose-content.yaml`

**Capacidades** (SOLO derivadas de BDD When):

1. **Access Meditation Builder** ← US1 Scenario 1: "When they access the Meditation Builder"
2. **Define Meditation Text** ← US1 Scenario 2: "When they type text into the meditation content field"
3. **Determine Output Type** ← US2 Scenarios 1-4: "When they review the composition"
4. **Generate Meditation Text from Scratch** ← US3 Scenario 1: "When they request the system to generate meditation text" (empty field)
5. **Enhance Existing Meditation Text** ← US4 Scenario 1: "When they request AI text generation" (with existing content)
6. **Preview Selected Music** ← US5 Scenario 1: "When they request to preview the music"
7. **Preview Selected Image** ← US6 Scenario 1: "When they request to preview the image"

**Criterios**:
- Cada When clause = 1 capacidad abstracta
- Sin paths HTTP, métodos ni DTOs

**Prohibido**:
- Endpoints no derivados de BDD
- Campos/esquemas concretos

---

### Phase 3: Domain
**Artefactos**:
- `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/model/`
  - MeditationComposition (Aggregate Root)
  - TextContent (Value Object)
  - MusicReference (Value Object)
  - ImageReference (Value Object)
- `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/enums/`
  - OutputType (PODCAST, VIDEO)
  - GenerationMode (MANUAL, AI_FROM_SCRATCH, AI_ENHANCED)
- `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/ports/in/`
  - ComposeContentUseCase
  - GenerateTextUseCase
- `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/ports/out/`
  - TextGenerationPort
  - MediaCatalogPort

**Herramientas**: JUnit 5

**Criterios**:
- Entidades/VOs/puertos según capacidades de Phase 2
- TDD: tests primero
- Sin Spring ni infra dependencies
- Output type derivation logic: image == null → PODCAST, else → VIDEO

**Prohibido**:
- Lógica de infra (HTTP, DB)
- Frameworks en domain

---

### Phase 4: Application
**Artefactos**:
- `/backend/src/main/java/com/hexagonal/meditationbuilder/application/service/`
  - ComposeContentService (implements ComposeContentUseCase)
  - GenerateTextService (implements GenerateTextUseCase)
- `/backend/src/main/java/com/hexagonal/meditationbuilder/application/mapper/`
  - Internal domain mappers if needed
- `/backend/src/main/java/com/hexagonal/meditationbuilder/application/validator/`
  - TextLengthValidator

**Herramientas**: JUnit 5, Mockito

**Criterios**:
- Use cases que orquestan domain a través de ports
- Sin reglas de negocio
- Error handling: AI timeout → business exception

**Prohibido**:
- Lógica de negocio
- Acceso directo a infra

---

### Phase 5: Infrastructure
**Artefactos**:
- `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/service/`
  - TextGenerationAiAdapter (implements TextGenerationPort)
  - MediaCatalogAdapter (implements MediaCatalogPort)
- `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/out/service/mapper/`
  - AI request/response mappers

**Herramientas**: Spring RestClient, Testcontainers, WireMock

**Criterios**:
- Adapters implementan ports out
- Tests de integración
- Error mapping: AI timeout/unavailable → HTTP 503, rate limits → 429
- No prompts o AI responses en logs

**Prohibido**:
- Lógica de negocio en adapters
- Servicios reales en tests

---

### Phase 6: Controllers
**Artefactos**:
- `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/controller/`
  - MeditationBuilderController
- `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/dto/`
  - Request/Response DTOs matching OpenAPI
- `/backend/src/main/java/com/hexagonal/meditationbuilder/infrastructure/in/rest/mapper/`
  - DTO ↔ domain mappers

**Herramientas**: Spring MVC, MockMvc

**Criterios**:
- Cumplen OpenAPI exactamente
- Delegan a use cases
- Superficial validation only

**Prohibido**:
- Lógica de negocio
- Desviarse de OpenAPI

---

### Phase 7: Frontend
**Artefactos**:
- `/frontend/src/api/` - OpenAPI-generated client
- `/frontend/src/components/`
  - TextEditor
  - MusicSelector
  - ImagePreview
  - OutputTypeIndicator
- `/frontend/src/pages/`
  - MeditationBuilderPage
- `/frontend/src/hooks/`
  - useGenerateText
  - useComposition
- `/frontend/src/state/`
  - composerStore.ts (Zustand)

**Herramientas**: React Query, Zustand, Jest/RTL

**Criterios**:
- Cliente OpenAPI autogenerado
- React Query para server-state
- Zustand para UI-state
- Output type indicator updates immediately on image add/remove (FR-018)
- Text field preserves user input exactly (US1-S3)
- AI generation button disabled during generation (FR-013)

**Prohibido**:
- Lógica de negocio en UI
- Fetch manual
- Server-state in Zustand

---

### Phase 8: Contracts
**Artefactos**:
- `/backend/tests/contracts/` - Provider contract tests

**Herramientas**: Spring Cloud Contract or equivalent

**Criterios**:
- Valida backend contra OpenAPI
- Breaking changes detected automatically

**Prohibido**:
- Permitir drift de OpenAPI

---

### Phase 9: E2E
**Artefactos**:
- `/backend/tests/e2e/` - Cucumber scenarios against running backend
- `/frontend/tests/e2e/` - Playwright tests

**Herramientas**: Cucumber, Playwright, RestAssured

**Criterios**:
- BDD escenarios contra backend real
- Flujos críticos en Playwright: manual entry, AI generation, preview, output type indication
- External dependencies mocked (AI service, media catalog)

**Prohibido**:
- Servicios reales en E2E

---

### Phase 10: CI/CD
**Artefactos**:
- `.github/workflows/backend-ci.yml`
- `.github/workflows/frontend-ci.yml`

**Herramientas**: GitHub Actions, Maven, npm

**Criterios**:
- Gates: bdd → api → unit → infra → contract → e2e → build
- All gates blocking (any failure prevents merge)
- Build once, deploy many

**Prohibido**:
- Saltar gates
- Allowing failed tests to merge

---

## Traceability Matrix (9 escenarios limpios)

| BDD Scenario | Domain Entity | Use Case | Business Capability | Frontend Component |
|--------------|---------------|----------|---------------------|-------------------|
| Access builder | MeditationComposition | ComposeContentUseCase | Access Meditation Builder | MeditationBuilderPage |
| Enter text | TextContent | ComposeContentUseCase | Define Meditation Text | TextEditor |
| Podcast no image | OutputType | - | Determine Output Type | OutputTypeIndicator |
| Video with image | OutputType | - | Determine Output Type | OutputTypeIndicator |
| AI from scratch | - | GenerateTextUseCase | Generate Text Scratch | useGenerateText |
| AI enhance | - | GenerateTextUseCase | Enhance Text | useGenerateText |
| Music preview | MusicReference | - | Preview Music | MusicPreview |
| Image preview | ImageReference | - | Preview Image | ImagePreview |

---

## Definition of Done

- [x] BDD verde
- [x] OpenAPI validado
- [x] Domain TDD 100%
- [x] Application tested with mocked ports
- [x] Infrastructure integration tests green, AI mocked
- [x] Controllers OpenAPI compliance verified
- [x] Frontend UI tested (unit + integration + E2E)
- [x] Contracts provider tests green
- [x] E2E Backend Cucumber scenarios green
- [x] E2E Frontend Playwright scenarios green
- [x] Pipeline CI/CD gates verde
- [x] Observability: Logging and metrics active
- [x] No deuda técnica: No TODO comments, no skipped tests

**Plan Status**: READY FOR TASKS
