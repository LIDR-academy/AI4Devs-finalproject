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

1. **Access Meditation Builder** ← Scenario 1: "When I access the Meditation Builder"
2. **Define Meditation Text** ← Scenario 2: "When I type meditation text in the text field"
3. **AI Text Generation/Enhancement** ← Scenario 3: "When I request AI text generation" (works with empty field, keywords, or existing content)
4. **AI Image Generation** ← Scenario 4: "When I click 'Generate AI image'"
5. **Determine Output Type** ← Scenarios 5-6: "When I review composition" (indicates podcast or video)
6. **Preview Selected Music** ← Scenario 7: "When I click music preview"
7. **Preview Image** ← Scenario 8: "When I click image preview"

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
- `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/ports/in/`
  - ComposeContentUseCase
  - GenerateTextUseCase
  - GenerateImageUseCase
- `/backend/src/main/java/com/hexagonal/meditationbuilder/domain/ports/out/`
  - TextGenerationPort
  - ImageGenerationPort
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
  - GenerateImageService (implements GenerateImageUseCase)
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
  - ImageGenerationAiAdapter (implements ImageGenerationPort)
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
  - GenerateTextButton
  - GenerateImageButton
  - MusicSelector
  - ImagePreview
  - OutputTypeIndicator
- `/frontend/src/pages/`
  - MeditationBuilderPage
- `/frontend/src/hooks/`
  - useGenerateText
  - useGenerateImage
  - useComposition
- `/frontend/src/state/`
  - composerStore.ts (Zustand)

**Herramientas**: React Query, Zustand, Jest/RTL

**Criterios**:
- Cliente OpenAPI autogenerado
- React Query para server-state
- Zustand para UI-state
- Output type indicator updates immediately on image add/remove/generate (FR-019)
- Text field preserves user input exactly
- AI generation buttons disabled during generation (FR-014)

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
- Flujos críticos en Playwright: manual entry, AI text generation, AI image generation, preview, output type indication
- External dependencies mocked (AI text service, AI image service, media catalog)

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

## Traceability Matrix (8 escenarios consolidados)

| BDD Scenario | Domain Entity | Use Case | Business Capability | Frontend Component |
|--------------|---------------|----------|---------------------|-------------------|
| 1. Access builder | MeditationComposition | ComposeContentUseCase | Access Meditation Builder | MeditationBuilderPage |
| 2. Enter text | TextContent | ComposeContentUseCase | Define Meditation Text | TextEditor |
| 3. AI text gen/enhance | TextContent | GenerateTextUseCase | Generate/Enhance Text | GenerateTextButton |
| 4. Generate AI image | ImageReference | GenerateImageUseCase | Generate AI Image | GenerateImageButton |
| 5. Podcast no image | OutputType | - | Determine Output Type | OutputTypeIndicator |
| 6. Video with image | OutputType | - | Determine Output Type | OutputTypeIndicator |
| 7. Music preview | MusicReference | - | Preview Music | MusicPreview |
| 8. Image preview | ImageReference | - | Preview Image | ImagePreview |

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
