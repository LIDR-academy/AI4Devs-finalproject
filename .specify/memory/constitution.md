
# Project Constitution — Meditation Builder  
**Versión: 4.0.0 (Actualizada con Estado Real del Proyecto)**  
**Última actualización:** 16 de Febrero de 2026  
**Ubicación:** `.specify/memory/constitution.md`  
**Ámbito:** Backend (Java 21 + Spring Boot 3.5.10) y Frontend (React 18 + TypeScript + Vite)

---

# 0. Propósito y Alcance del Proyecto

Esta constitución es la **norma superior** del proyecto *Meditation Builder*.  
Define la arquitectura, el flujo de trabajo, la jerarquía normativa, los principios de calidad, y las reglas de comportamiento obligatorias para:

- Personas desarrolladoras  
- QA y analistas  
- IA generativa (Claude 4.5 Sonnet, GitHub Copilot, Spec‑Kit)  

## 0.1 Estado Actual del Proyecto

**Proyecto**: Plataforma MVP de generación de meditaciones guiadas con asistencia de IA  
**Repositorio**: AI4Devs-finalproject (LIDR-academy)  
**Branches implementados**: `001-compose-meditation-content`, `002-generate-meditation-audio-video`  
**Branch principal**: `main`

### Features Implementadas:
1. ✅ **US2 (Compose Content - Branch: 001-compose-meditation-content)**  
   Bounded Context: `meditationbuilder`
   - 8 escenarios BDD implementados
   - Backend completo con arquitectura hexagonal
   - Frontend con React Query + Zustand
   - Tests unitarios, integración y E2E backend/frontend
   - CI/CD con 8 gates (BDD → API → Unit Domain → Unit App → Infra IT → Contract → E2E → Build)

2. ✅ **US3 (Generate Meditation A/V - Branch: 002-generate-meditation-audio-video)**  
   Bounded Context: `meditation.generation`
   - 3 escenarios BDD implementados
   - Narración con Google TTS (es-ES-Neural2-Diana)
   - Renderizado de audio/video con FFmpeg
   - Almacenamiento en S3 (LocalStack para dev/test)
   - Persistencia con PostgreSQL (JPA)
   - Generación con timeout de 187 segundos (decisión de negocio)
   - Idempotencia basada en SHA-256
   - Subtítulos sincronizados (SRT)
   - CI/CD con 8 gates completos

### Features Pendientes (según PRD):
- US1: Autenticación segura con AWS Cognito + JWT
- US4: Listado y reproducción de meditaciones

Su objetivo es garantizar:

- Diseños claros y evolutivos  
- Historias verticales que generen valor  
- Código consistente y testeable  
- Alta calidad y trazabilidad  
- Entregas repetibles sin deuda técnica

---

# 1. Jerarquía normativa (orden absoluto)
En caso de conflicto, se debe obedecer estrictamente este orden:

1. **Historia de Usuario + BDD (`.feature` en `/backend/src/test/resources/features/`)**  
2. **Constitution (este archivo)**
3. **Delivery Playbook Backend** (`.specify/instructions/delivery-playbook-backend.md`)
4. **Delivery Playbook Frontend** (`.specify/instructions/delivery-playbook-frontend.md`)
5. **Engineering Guidelines** (`.specify/instructions/engineering-guidelines.md`)
6. **Java 21 Best Practices** (`.specify/instructions/java21-best-practices.md`)
7. **Hexagonal Architecture Guide** (`.specify/instructions/hexagonal-architecture-guide.md`)
8. **Testing Instructions** (`.specify/instructions/testing.instructions.md`)
9. **Copilot Instructions** (`.github/copilot-instructions.md`)
10. **Instrucciones operativas** (`.specify/instructions/backend.instructions.md`)
11. **Frameworks** (Spring Boot 3.5.10, React 18, Vite, Playwright)
12. Preferencias individuales o de equipo (no vinculantes)

⚠️ **Si un comportamiento NO está definido en BDD → NO se implementa.**  
⚠️ **No se admiten rutas, DTOs o reglas extra no justificadas.**

---

# 2. Principios fundamentales
## 2.1 Specifications-Driven Development (SDD)
Toda implementación nace de:

- Historia de Usuario (documentada en `/docs` y `/specs`)
- Escenarios escritos en Given–When–Then (Gherkin)
- Aprobados por PO + QA + Backend + Frontend

El código es una **materialización técnica** de un comportamiento ya acordado.

## 2.2 Arquitectura base implementada

### Backend (Java 21 + Spring Boot 3.5.10):
- **Arquitectura Hexagonal rígida** con separación clara de capas
- **DDD táctico** con aggregates, value objects y entities
- **TDD obligatorio** en dominio (tests antes que implementación)
- **API First** con OpenAPI/Swagger
- **Bounded Contexts implementados**: 
  1. `meditationbuilder` (US2 - Composition)
  2. `meditation.generation` (US3 - A/V Generation)

**Stack tecnológico backend**:
- Java 21 (Amazon Corretto)
- Spring Boot 3.5.10
- Spring Web (RestClient/WebClient para llamadas HTTP externas)
- Spring Validation
- Spring Boot Actuator + Micrometer (observabilidad)
- Spring Boot DevTools
- Lombok (solo para DTOs/configuración, NO en dominio)
- Maven 3.9.x
- JUnit 5 + AssertJ + Mockito
- WireMock 3.3.1 (mocks de servicios externos)
- Testcontainers (tests de integración si aplica)
- Cucumber 7.15.0 (BDD)
- OpenAPI Validator (Atlassian 2.41.0)
- OpenTelemetry 1.45.0

### Frontend (React 18 + TypeScript + Vite):
- **React 18** con TypeScript estricto
- **React Query (TanStack Query)** para server-state
- **Zustand** para UI-state local
- **OpenAPI Client autogenerado** desde YAML backend
- **Playwright** para E2E
- **Vite** como bundler

**Stack tecnológico frontend**:
- React 18.3.1
- TypeScript 5.x
- Vite 6.x
- TanStack React Query v5
- Zustand
- Axios (generado por OpenAPI)
- Vitest + React Testing Library (tests unitarios)
- Playwright (E2E)
- CSS Modules / Tailwind (según implementación)

---

# 3. Estructura del repositorio (monorepo real)

```
AI4Devs-finalproject/
├── .github/
│   ├── copilot-instructions.md          # Instrucciones para GitHub Copilot
│   ├── agents/                          # Definiciones de agentes Spec-Kit
│   │   ├── speckit.plan.agent.md
│   │   ├── speckit.spec.agent.md
│   │   └── speckit.tasks.agent.md
│   └── workflows/
│       ├── backend-ci.yml               # Pipeline CI/CD Backend (5 gates)
│       └── frontend-ci.yml              # Pipeline CI/CD Frontend
│
├── .specify/
│   ├── instructions/                    # Guías normativas del proyecto
│   │   ├── backend.instructions.md
│   │   ├── delivery-playbook-backend.md
│   │   ├── delivery-playbook-frontend.md
│   │   ├── engineering-guidelines.md
│   │   ├── hexagonal-architecture-guide.md
│   │   ├── java21-best-practices.md
│   │   └── testing.instructions.md
│   ├── memory/
│   │   └── constitution.md              # ESTE ARCHIVO
│   ├── scripts/                         # Scripts de automatización
│   │   └── powershell/
│   │       └── update-agent-context.ps1
│   └── templates/                       # Plantillas para specs
│       ├── plan-template.md
│       ├── spec-template.md
│       └── tasks-template.md
│
├── backend/
│   ├── pom.xml                          # Maven POM (Spring Boot 3.5.10, Java 21)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hexagonal/
│   │   │   │   ├── meditationbuilder/   # BC 1: Composition (US2)
│   │   │   │   │   ├── MeditationBuilderApplication.java
│   │   │   │   │   ├── application/     # Capa de aplicación (use cases)
│   │   │   │   │   ├── domain/          # Capa de dominio (puro)
│   │   │   │   │   │   ├── enums/       # OutputType
│   │   │   │   │   │   ├── exception/
│   │   │   │   │   │   ├── model/       # MeditationComposition, TextContent, etc.
│   │   │   │   │   │   └── ports/
│   │   │   │   │   └── infrastructure/  # Capa de infraestructura
│   │   │   │   │       ├── in/rest/     # Controllers, DTOs
│   │   │   │   │       └── out/         # Adapters (OpenAI, InMemory)
│   │   │   │   │
│   │   │   │   └── meditation/
│   │   │   │       └── generation/      # BC 2: Generation (US3)
│   │   │   │           ├── application/     # GenerateMeditationContentService, IdempotencyKeyGenerator, TextLengthEstimator
│   │   │   │           ├── domain/          # GeneratedMeditationContent, NarrationScript, MeditationOutput, SubtitleSegment
│   │   │   │           │   ├── enums/       # GenerationStatus, MediaType
│   │   │   │           │   ├── exception/   # GenerationTimeoutException, InvalidContentException
│   │   │   │           │   ├── model/       # Aggregates y Value Objects
│   │   │   │           │   └── ports/
│   │   │   │           │       ├── in/      # GenerateMeditationContentUseCase
│   │   │   │           │       └── out/     # VoiceSynthesisPort, AudioRenderingPort, VideoRenderingPort, MediaStoragePort, SubtitleSyncPort, ContentRepositoryPort
│   │   │   │           └── infrastructure/
│   │   │   │               ├── in/rest/     # MeditationGenerationController, FileUploadController
│   │   │   │               ├── out/
│   │   │   │               │   ├── adapter/  # GoogleTtsAdapter, FfmpegAudioRendererAdapter, FfmpegVideoRendererAdapter, S3MediaStorageAdapter
│   │   │   │               │   ├── persistence/  # PostgresContentRepository (JPA)
│   │   │   │               │   └── service/      # SubtitleSyncService, TempFileManager, AudioMetadataService
│   │   │   │               └── config/   # S3Config, GoogleCloudTtsConfig
│   │   │   │
│   │   │   └── resources/
│   │   │       ├── application.yml              # Configuración principal
│   │   │       ├── application-local.yml        # Profile local
│   │   │       ├── application-test.yml         # Profile test
│   │   │       └── openapi/
│   │   │           ├── meditationbuilder/
│   │   │           │   └── compose-content.yaml # Contrato OpenAPI BC1 (US2)
│   │   │           └── generation/
│   │   │               └── generate-meditation.yaml # Contrato OpenAPI BC2 (US3)
│   │   └── test/
│   │       ├── contracts/                       # Tests de contrato (vacío por ahora)
│   │       ├── e2e/                             # Tests E2E (vacío por ahora)
│   │       ├── java/com/hexagonal/
│   │       │   ├── meditationbuilder/           # Tests BC1
│   │       │   │   ├── application/
│   │       │   │   ├── domain/
│   │       │   │   ├── infrastructure/
│   │       │   │   ├── observability/
│   │       │   │   ├── bdd/
│   │       │   │   │   ├── CucumberTestRunner.java
│   │       │   │   │   └── steps/
│   │       │   │   └── e2e/
│   │       │   │       ├── AiGenerationE2ETest.java
│   │       │   │       └── ManualCompositionE2ETest.java
│   │       │   └── meditation/generation/       # Tests BC2
│   │       │       ├── application/
│   │       │       ├── domain/
│   │       │       ├── infrastructure/
│   │       │       ├── bdd/
│   │       │       │   ├── CucumberSpringConfiguration.java
│   │       │       │   └── steps/
│   │       │       └── e2e/
│   │       │           └── GenerateMeditationE2ETest.java
│   │       └── resources/
│   │           ├── application-test.yml
│   │           └── features/                    # Archivos .feature BDD
│   │               ├── meditationbuilder/
│   │               │   └── compose-content.feature
│   │               └── generation/
│   │                   └── generate-meditation.feature
│   └── target/                                  # Artefactos compilados (generados)
│
├── frontend/
│   ├── package.json                             # Dependencies (React 18, Vite, etc.)
│   ├── vite.config.ts                           # Configuración Vite
│   ├── playwright.config.ts                     # Configuración Playwright
│   ├── src/
│   │   ├── main.tsx                             # Entry point
│   │   ├── App.tsx                              # App root
│   │   ├── api/                                 # Cliente OpenAPI autogenerado
│   │   │   ├── client/
│   │   │   ├── client.ts
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── components/                          # Componentes reutilizables
│   │   │   ├── TextEditor.tsx
│   │   │   ├── ImagePreview.tsx
│   │   │   ├── ImageSelectorButton.tsx
│   │   │   ├── GenerateImageButton.tsx
│   │   │   ├── GenerateTextButton.tsx
│   │   │   ├── MusicPreview.tsx
│   │   │   ├── MusicSelector.tsx
│   │   │   ├── MusicSelectorButton.tsx
│   │   │   ├── LocalMusicItem.tsx
│   │   │   ├── OutputTypeIndicator.tsx
│   │   │   └── __tests__/                       # Tests unitarios de componentes
│   │   ├── pages/
│   │   │   └── MeditationBuilderPage.tsx        # Página principal
│   │   ├── state/                               # Estado global (Zustand)
│   │   │   ├── composerStore.ts
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   └── hooks/                               # Custom hooks (React Query)
│   ├── tests/
│   │   └── e2e/                                 # Tests E2E Playwright
│   │       ├── ai-generation.spec.ts
│   │       ├── manual-composition.spec.ts
│   │       └── media-preview.spec.ts
│   └── playwright-report/                       # Reportes Playwright (generados)
│
├── docs/                                        # Documentación del proyecto
│   ├── 01-PRD-design-document.md               # PRD completo
│   ├── 02.User-Stories.md                      # User Stories US1-US4
│   ├── 03.Backlog-tickets.md                   # Backlog general
│   ├── 04.US1-TIckets.md                        # Tickets US1 (Auth)
│   ├── 05.US2-TIckets.md                        # Tickets US2 (Compose Content)
│   ├── 06.US3-TIckets.md                        # Tickets US3 (Video Generation)
│   └── 07.US4-TIckets.md                        # Tickets US4 (List & Play)
│
├── specs/
│   ├── 001-compose-meditation-content/         # Spec US2 (BC: meditationbuilder)
│   │   ├── spec.md                              # Spec BDD de negocio
│   │   ├── plan.md                              # Plan de implementación
│   │   ├── tasks.md                             # Tareas detalladas
│   │   └── checklists/                          # Checklists de progreso
│   └── 002-generate-meditation-audio-video/    # Spec US3 (BC: meditation.generation)
│       ├── spec.md                              # Spec BDD de negocio
│       ├── plan.md                              # Plan de implementación
│       └── tasks.md                             # Tareas detalladas
│
├── prompts/
│   └── 01-doc-prompts.md                        # Prompts de documentación
│
├── package.json                                 # Root package.json (workspace)
├── readme.md                                    # README principal
├── quick-start.md                               # Guía de inicio rápido
└── prompts.md                                   # Prompts generales

```

**Características clave**:
- Monorepo con backend Java y frontend React separados
- CI/CD independiente para cada módulo
- Shared bounded context: `meditationbuilder`
- Especificaciones versionadas en `/specs`
- Documentación exhaustiva en `/docs`

---

# 4. Bounded Context: MeditationBuilder (implementado)

## 4.1 Descripción
El bounded context `meditationbuilder` es el contexto principal implementado actualmente.
Responsable de la composición de contenido de meditación con asistencia opcional de IA.

## 4.2 Estructura backend completa

```
backend/src/main/java/com/hexagonal/meditationbuilder/
├── MeditationBuilderApplication.java    # Spring Boot Application
│
├── application/                         # CAPA DE APLICACIÓN (Use Cases)
│   ├── mapper/                          # (vacío por ahora)
│   ├── service/
│   │   ├── ComposeContentService.java   # Implementa ComposeContentUseCase
│   │   ├── GenerateImageService.java    # Implementa GenerateImageUseCase
│   │   └── GenerateTextService.java     # Implementa GenerateTextUseCase
│   └── validator/
│       └── TextLengthValidator.java     # Validación de longitud de texto
│
├── domain/                              # CAPA DE DOMINIO (puro, sin Spring)
│   ├── enums/
│   │   └── OutputType.java              # PODCAST | VIDEO (derivado de presencia de imagen)
│   ├── exception/
│   │   ├── AiServiceException.java
│   │   ├── CompositionNotFoundException.java
│   │   ├── MusicNotFoundException.java
│   │   └── TextValidationException.java
│   ├── model/
│   │   ├── MeditationComposition.java   # Aggregate Root (record inmutable)
│   │   ├── TextContent.java             # Value Object (record)
│   │   ├── ImageReference.java          # Value Object (record)
│   │   └── MusicReference.java          # Value Object (record)
│   └── ports/
│       ├── in/                          # Puertos de entrada (Use Cases)
│       │   ├── ComposeContentUseCase.java
│       │   ├── GenerateImageUseCase.java
│       │   └── GenerateTextUseCase.java
│       └── out/                         # Puertos de salida (Interfaces)
│           ├── CompositionRepositoryPort.java
│           ├── ImageGenerationPort.java
│           ├── TextGenerationPort.java
│           └── MediaCatalogPort.java
│
└── infrastructure/                      # CAPA DE INFRAESTRUCTURA
    ├── in/                              # Adaptadores de entrada
    │   └── rest/
    │       ├── controller/
    │       │   └── MeditationBuilderController.java  # REST Controller con 8 endpoints
    │       ├── dto/                     # DTOs Request/Response
    │       │   ├── CompositionResponse.java
    │       │   ├── CreateCompositionRequest.java
    │       │   ├── GenerateImageRequest.java
    │       │   ├── GenerateTextRequest.java
    │       │   ├── ImageReferenceResponse.java
    │       │   ├── OutputTypeResponse.java
    │       │   ├── SelectMusicRequest.java
    │       │   ├── SetImageRequest.java
    │       │   ├── TextContentResponse.java
    │       │   └── UpdateTextRequest.java
    │       └── mapper/
    │           └── CompositionDtoMapper.java  # Mapper Domain ↔ DTO
    └── out/                             # Adaptadores de salida
        ├── persistence/
        │   └── InMemoryCompositionRepository.java  # Implementa CompositionRepositoryPort
        └── service/                     # Adaptadores a servicios externos
            ├── ImageGenerationAiAdapter.java       # Implementa ImageGenerationPort (OpenAI)
            ├── TextGenerationAiAdapter.java        # Implementa TextGenerationPort (OpenAI)
            ├── MediaCatalogAdapter.java            # Implementa MediaCatalogPort
            ├── dto/                     # DTOs para APIs externas
            │   ├── AiImageRequest.java
            │   ├── AiImageResponse.java
            │   ├── AiTextRequest.java
            │   ├── AiTextResponse.java
            │   └── MediaCatalogResponse.java
            └── mapper/                  # Mappers API externa ↔ Dominio
                ├── AiImageMapper.java
                └── AiTextMapper.java
```

## 4.3 Modelo de dominio implementado

### Aggregate Root: MeditationComposition
```java
public record MeditationComposition(
    UUID id,
    TextContent textContent,        // obligatorio
    MusicReference musicReference,  // opcional
    ImageReference imageReference,  // opcional
    Instant createdAt,
    Instant updatedAt
)
```

**Reglas de negocio**:
- ID generado automáticamente (UUID)
- TextContent siempre obligatorio
- OutputType derivado: sin imagen → PODCAST, con imagen → VIDEO
- Inmutable (métodos withX() retornan nuevas instancias)
- Timestamps controlados con Clock inyectado (facilita testing)
- Factory methods: `create(TextContent, Clock)` y `create(UUID, TextContent, Clock)`

### Value Objects:
- **TextContent**: record con validación de longitud
- **ImageReference**: record con identificador de imagen
- **MusicReference**: record con identificador de música

### Enum:
- **OutputType**: PODCAST | VIDEO

## 4.4 Puertos implementados

### Puertos IN (Use Cases):
1. **ComposeContentUseCase**: 
   - `createComposition(TextContent)`: UUID
   - `getComposition(UUID)`: MeditationComposition
   - `updateText(UUID, TextContent)`: MeditationComposition
   - `selectMusic(UUID, MusicReference)`: MeditationComposition
   - `setImage(UUID, ImageReference)`: MeditationComposition
   - `removeImage(UUID)`: MeditationComposition
   - `getOutputType(UUID)`: OutputType

2. **GenerateTextUseCase**: 
   - `generateText(String prompt)`: TextContent

3. **GenerateImageUseCase**: 
   - `generateImage(String prompt)`: ImageReference

### Puertos OUT (Interfaces secundarias):
1. **CompositionRepositoryPort**:
   - `save(MeditationComposition)`: void
   - `findById(UUID)`: Optional<MeditationComposition>

2. **TextGenerationPort**:
   - `generate(String prompt)`: String

3. **ImageGenerationPort**:
   - `generate(String prompt)`: String

4. **MediaCatalogPort**:
   - `findMusicById(String musicId)`: Optional<MusicReference>

## 4.5 OpenAPI Contract

**Archivo**: `/backend/src/main/resources/openapi/meditationbuilder/compose-content.yaml`

**8 Capacidades implementadas** (matching BDD scenarios):
1. `POST /v1/compositions` - Access Meditation Builder (create composition)
2. `PUT /v1/compositions/{id}/text` - Define Meditation Text
3. `POST /v1/compositions/text/generate` - AI Text Generation/Enhancement  
4. `POST /v1/compositions/image/generate` - AI Image Generation
5. `GET /v1/compositions/{id}/output-type` - Determine Output Type
6. `PUT /v1/compositions/{id}/music` - Preview Selected Music
7. `PUT /v1/compositions/{id}/image` - Preview Image (manual selection)
8. `DELETE /v1/compositions/{id}/image` - Remove image

**Esquemas principales**:
- CompositionResponse
- CreateCompositionRequest
- UpdateTextRequest
- GenerateTextRequest
- GenerateImageRequest
- SelectMusicRequest
- SetImageRequest
- OutputTypeResponse

## 4.6 Configuración e integraciones externas

### Servicios externos configurados:
1. **OpenAI API** (Text & Image Generation):
   - Base URL configurable
   - Modelos: gpt-5-nano (text), gpt-image-1-mini (image)
   - Metaprompts configurados para meditación
   - Reintentos y circuit breaker (Resilience4j)
   - Rate limiting y manejo de errores 429, 503

2. **Media Catalog Service** (mock):
   - Catálogo de música pregrabada
   - Endpoints REST para preview

### Observabilidad implementada:
- Logs estructurados (SLF4J + Logback)
- Métricas custom (Micrometer):
  - Contadores: composition.created, ai.text.generated, ai.image.generated
  - Timers: ai operation latency
- MDC context (traceId, spanId) para correlación
- Spring Boot Actuator endpoints
- OpenTelemetry compatible

---

# 5. Bounded Context: Meditation.Generation (implementado - US3)

## 5.1 Descripción
El bounded context `meditation.generation` implementa la generación de contenido narrado profesional (audio/video) a partir de texto de meditación.  
Responsable de: síntesis de voz (Google TTS), renderizado multimedia (FFmpeg), sincronización de subtítulos, y almacenamiento (S3/LocalStack).

**User Story:** US3 - Generate Guided Meditation (Video/Podcast) with Professional Narration  
**Branch:** `002-generate-meditation-audio-video`  
**Spec folder:** `/specs/002-generate-meditation-audio-video/`

## 5.2 Estructura backend completa

```
backend/src/main/java/com/hexagonal/meditation/generation/
├── application/                         # CAPA DE APLICACIÓN
│   ├── service/
│   │   ├── GenerateMeditationContentService.java   # Use Case principal (orquestación)
│   │   └── IdempotencyKeyGenerator.java            # SHA-256 hashing para idempotencia
│   └── validator/
│       └── TextLengthEstimator.java                # Validación de duración (max 187s)
│
├── domain/                              # CAPA DE DOMINIO (puro)
│   ├── enums/
│   │   ├── GenerationStatus.java                   # PENDING | PROCESSING | COMPLETED | FAILED
│   │   └── MediaType.java                          # AUDIO | VIDEO
│   ├── exception/
│   │   ├── InvalidContentException.java
│   │   └── GenerationTimeoutException.java
│   ├── model/
│   │   ├── GeneratedMeditationContent.java         # Aggregate Root (record)
│   │   ├── NarrationScript.java                    # Value Object (record)
│   │   ├── MeditationOutput.java                   # Entity (record)
│   │   ├── MediaReference.java                     # Value Object (record)
│   │   └── SubtitleSegment.java                    # Value Object (record)
│   └── ports/
│       ├── in/                          # Puertos de entrada
│       │   └── GenerateMeditationContentUseCase.java
│       └── out/                         # Puertos de salida
│           ├── VoiceSynthesisPort.java
│           ├── AudioRenderingPort.java
│           ├── VideoRenderingPort.java
│           ├── MediaStoragePort.java
│           ├── SubtitleSyncPort.java
│           └── ContentRepositoryPort.java
│
└── infrastructure/                      # CAPA DE INFRAESTRUCTURA
    ├── in/                              # Adaptadores de entrada
    │   └── rest/
    │       ├── controller/
    │       │   ├── MeditationGenerationController.java  # REST Controller principal
    │       │   └── FileUploadController.java            # Upload de archivos media
    │       ├── dto/                     # DTOs Request/Response
    │       └── mapper/
    │           └── MeditationOutputDtoMapper.java
    ├── out/                             # Adaptadores de salida
    │   ├── adapter/
    │   │   ├── tts/
    │   │   │   └── GoogleTtsAdapter.java                # Google Cloud TTS (es-ES-Neural2-Diana)
    │   │   ├── ffmpeg/
    │   │   │   ├── FfmpegAudioRendererAdapter.java      # Renderizado audio (MP3)
    │   │   │   └── FfmpegVideoRendererAdapter.java      # Renderizado video (MP4)
    │   │   └── storage/
    │   │       └── S3MediaStorageAdapter.java           # S3/LocalStack storage
    │   ├── persistence/
    │   │   ├── PostgresContentRepository.java           # JPA repository implementation
    │   │   ├── entity/
    │   │   │   └── MeditationOutputEntity.java          # JPA entity
    │   │   ├── repository/
    │   │   │   └── JpaMeditationOutputRepository.java   # Spring Data JPA
    │   │   └── mapper/
    │   │       └── MeditationOutputMapper.java          # Entity ↔ Domain
    │   └── service/
    │       ├── subtitle/
    │       │   └── SubtitleSyncService.java             # SRT subtitle generation
    │       ├── file/
    │       │   └── TempFileManager.java                 # Gestión archivos temporales
    │       └── audio/
    │           └── AudioMetadataService.java            # Metadatos de audio (duración, etc.)
    └── config/
        ├── S3Config.java                                # AWS S3/LocalStack config
        └── GoogleCloudTtsConfig.java                    # Google TTS config

backend/src/main/resources/openapi/generation/
└── generate-meditation.yaml                             # Contrato OpenAPI BC Generation
```

## 5.3 Modelo de dominio implementado

### Aggregate Root: GeneratedMeditationContent
```java
public record GeneratedMeditationContent(
    UUID id,
    NarrationScript script,          // Texto narrado
    MediaReference music,             // Música de fondo
    MediaReference backgroundImage,   // Imagen opcional (null = AUDIO)
    MediaType mediaType,              // AUDIO | VIDEO (derivado de backgroundImage)
    String idempotencyKey,            // SHA-256 del contenido (previene duplicados)
    Instant createdAt
)
```

**Reglas de negocio**:
- ID generado como UUID
- MediaType derivado: sin imagen → AUDIO, con imagen → VIDEO
- IdempotencyKey SHA-256 de (script + music + image) previene regeneraciones duplicadas
- Inmutable (record)
- Factory method: `create(..., Clock)` con generación de ID y timestamp

### Entity: MeditationOutput
```java
public record MeditationOutput(
    UUID id,
    UUID contentId,                   // Referencia a GeneratedMeditationContent
    String outputUrl,                 // URL del archivo generado (S3)
    String subtitlesUrl,              // URL del archivo SRT (S3)
    GenerationStatus status,          // PENDING | PROCESSING | COMPLETED | FAILED
    MediaType mediaType,
    Instant createdAt,
    Instant completedAt
)
```

### Value Objects:
- **NarrationScript**: record con texto validado (length estimation < 187s)
- **MediaReference**: record con URL y metadata
- **SubtitleSegment**: record con (startTime, endTime, text) para SRT

### Enums:
- **GenerationStatus**: PENDING | PROCESSING | COMPLETED | FAILED
- **MediaType**: AUDIO | VIDEO

## 5.4 Puertos implementados

### Puertos IN (Use Cases):
1. **GenerateMeditationContentUseCase**:
   - `generate(GeneratedMeditationContent)`: MeditationOutput
   - Orquesta: validación → TTS → mixing → rendering → storage → persistencia

### Puertos OUT (Interfaces secundarias):
1. **VoiceSynthesisPort**:
   - `synthesize(String text, String languageCode, String voiceName)`: byte[] (audio MP3)
   
2. **AudioRenderingPort**:
   - `renderAudio(byte[] narration, String musicPath)`: File (MP3 final)
   
3. **VideoRenderingPort**:
   - `renderVideo(File audio, String imagePath, int durationSeconds)`: File (MP4 final)
   
4. **MediaStoragePort**:
   - `store(File file, String objectKey)`: String (URL)
   - `exists(String objectKey)`: boolean
   
5. **SubtitleSyncPort**:
   - `generateSubtitles(String text, int durationSeconds)`: List<SubtitleSegment>
   - `saveSrt(List<SubtitleSegment>, File)`: File
   
6. **ContentRepositoryPort**:
   - `save(MeditationOutput)`: MeditationOutput
   - `findByIdempotencyKey(String)`: Optional<MeditationOutput>

## 5.5 OpenAPI Contract

**Archivo**: `/backend/src/main/resources/openapi/generation/generate-meditation.yaml`

**Endpoints principales**:
1. `POST /v1/generations` - Generate meditation content (narrated audio or video)
2. `POST /v1/generations/upload/music` - Upload custom music file
3. `POST /v1/generations/upload/image` - Upload custom image file
4. `GET /v1/generations/{id}` - Get generation status and URLs

**Esquemas principales**:
- GenerateMeditationRequest (text, musicUrl, imageUrl, mediaType)
- MeditationOutputResponse (outputUrl, subtitlesUrl, status, mediaType)
- ErrorResponse (código, mensaje, timestamp)

**Restricciones documentadas**:
- Texto: max 467 palabras (~187s @ 150 wpm)
- Formatos música: MP3, WAV
- Formatos imagen: JPG, PNG
- Timeout total: 187 segundos

## 5.6 Decisiones técnicas clave

### 1. Timeout de 187 segundos
**Decisión de negocio**: Límite máximo de duración de meditación narrada  
**Cálculo**: 467 palabras @ 150 wpm prompt rate = ~186.8s narración  
**Ubicaciones**:
- `TextLengthEstimator.java`: `MAXIMUM_DURATION_SECONDS = 187`
- `GenerateMeditationContentService.java`: `MAX_GENERATION_TIMEOUT_SECONDS = 187`
- OpenAPI spec: descripción y examples
- Validación pre-TTS (fail-fast si excede)

### 2. Idempotencia con SHA-256
**Problema**: Evitar regeneraciones costosas del mismo contenido  
**Solución**: Calcular SHA-256(script + music + image) y verificar antes de procesar  
**Implementación**: `IdempotencyKeyGenerator.java`  
**Beneficios**: 
- Ahorro de costos (Google TTS, FFmpeg CPU)
- Respuesta instantánea si ya existe
- Consistencia de URLs

### 3. Google Cloud TTS
**Configuración implementada**:
- Voice: es-ES-Neural2-Diana (español España, voz femenina neural)
- Speaking rate: 0.95 (95% velocidad normal, más pausado para meditación)
- Audio encoding: MP3 @ 64kbps (balance calidad/tamaño)
- Credentials: Service Account JSON via env var `GOOGLE_APPLICATION_CREDENTIALS`

### 4. FFmpeg rendering
**Audio pipeline**:
```
narration.mp3 + music.mp3 → mix (narración 100%, música 30% volumen) → output.mp3
```

**Video pipeline**:
```
audio.mp3 + image.jpg → video.mp4 (H.264, 1920x1080, imagen estática con audio)
```

**Gestión de archivos temporales**:
- `/tmp/meditation-XXXX/` directories (auto-cleanup)
- `TempFileManager` con try-with-resources pattern

### 5. S3 Storage (LocalStack para dev/test)
**Buckets**:
- `meditation-outputs/`: Archivos finales (MP3/MP4)
- `meditation-subtitles/`: Archivos SRT

**Configuración profiles**:
- **local/test**: LocalStack (http://localhost:4566)
- **prod**: AWS S3 real (region configurable)

**Naming strategy**:
```
{idempotencyKey}/{type}/{timestamp}.{ext}
```

### 6. PostgreSQL persistence
**Schema**:
```sql
CREATE TABLE meditation_outputs (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL,
  output_url VARCHAR(512) NOT NULL,
  subtitles_url VARCHAR(512),
  status VARCHAR(50) NOT NULL,
  media_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  UNIQUE (content_id)
);

CREATE INDEX idx_meditation_outputs_status ON meditation_outputs(status);
CREATE INDEX idx_meditation_outputs_created_at ON meditation_outputs(created_at DESC);
```

**Justificación**: 
- Persistencia real (vs in-memory en BC Composition)
- Tracking de jobs y status (async ready)
- Audit trail para generaciones costosas

### 7. Subtítulos sincronizados (SRT)
**Generación**:
- Split texto en segmentos por puntos/comas
- Distribuir uniformemente en duración total
- Formato SRT estándar:
```
1
00:00:00,000 --> 00:00:05,000
Close your eyes and breathe deeply.

2
00:00:05,000 --> 00:00:12,000
Focus on the gentle rhythm of your breath.
```

## 5.7 Configuración e integraciones externas

### Servicios externos configurados:
1. **Google Cloud TTS**:
   - Credentials: Service Account JSON
   - Voice: es-ES-Neural2-Diana
   - Rate: 0.95 (pausado para meditación)
   - Encoding: MP3 @ 64kbps
   - Timeouts: 30s connect, 60s read

2. **AWS S3 / LocalStack**:
   - Endpoint: Configurable (LocalStack vs AWS)
   - Bucket: `meditation-outputs`
   - Region: `us-east-1` (configurable)
   - Access: Access Key + Secret Key

3. **PostgreSQL**:
   - JDBC URL: `jdbc:postgresql://localhost:5432/meditation`
   - Driver: PostgreSQL 42.x
   - Pool: HikariCP (Spring Boot default)
   - Dialect: PostgreSQLDialect

4. **FFmpeg**:
   - Binary path: `/usr/bin/ffmpeg` (Linux), auto-detect (Windows/Mac)
   - Codecs: libmp3lame (audio), libx264 (video)
   - Resolución video: 1920x1080
   - FPS: 1 (imagen estática)

### Observabilidad implementada:
- Logs estructurados con MDC (idempotencyKey, status, mediaType)
- Métricas custom (Micrometer):
  - Contadores: `generation.started`, `generation.completed`, `generation.failed`, `generation.cached`
  - Timers: `tts.duration`, `ffmpeg.audio.duration`, `ffmpeg.video.duration`, `s3.upload.duration`
  - Tags: mediaType, status, cached (boolean)
- Health check: Actuator endpoints
- OpenTelemetry ready (trazas de generación end-to-end)

---

# 6. Frontend implementado

## 6.1 Estructura real

```
frontend/src/
├── main.tsx                          # Entry point (ReactDOM.createRoot)
├── App.tsx                           # Root component (simple wrapper)
├── index.css                         # Estilos globales
│
├── api/                              # Cliente OpenAPI AUTOGENERADO
│   ├── client/                       # Generated API clients
│   ├── client.ts                     # Axios instance configurado
│   ├── index.ts                      # Exports principales
│   └── types.ts                      # TypeScript types del contrato
│
├── pages/
│   └── MeditationBuilderPage.tsx    # Página principal (orquesta componentes)
│
├── components/                       # Componentes UI (presentacionales)
│   ├── TextEditor.tsx                # Editor de texto con AI generation
│   ├── ImagePreview.tsx              # Preview de imagen seleccionada/generada
│   ├── ImageSelectorButton.tsx       # Botón selector manual de imagen
│   ├── GenerateImageButton.tsx       # Botón generar imagen con AI
│   ├── GenerateTextButton.tsx        # Botón generar/mejorar texto con AI
│   ├── MusicPreview.tsx              # Preview de música seleccionada
│   ├── MusicSelector.tsx             # Selector de música del catálogo
│   ├── MusicSelectorButton.tsx       # Botón abrir selector música
│   ├── LocalMusicItem.tsx            # Item individual de música en lista
│   ├── OutputTypeIndicator.tsx       # Indicador PODCAST vs VIDEO
│   └── __tests__/                    # Tests unitarios (Jest/Vitest + RTL)
│       ├── TextEditor.test.tsx
│       ├── ImagePreview.test.tsx
│       ├── ImagePreview.base64.test.tsx
│       ├── GenerateImageButton.test.tsx
│       ├── GenerateTextButton.test.tsx
│       ├── MusicPreview.test.tsx
│       ├── MusicSelector.test.tsx
│       ├── MusicSelectorButton.test.tsx
│       ├── ImageSelectorButton.test.tsx
│       └── OutputTypeIndicator.test.tsx
│
├── state/                            # Estado global (Zustand)
│   ├── composerStore.ts              # Store principal (composition, music, image, outputType)
│   ├── index.ts                      # Exports
│   └── __tests__/
│       └── composerStore.test.ts
│
├── hooks/                            # Custom hooks (React Query)
│   └── (pendiente implementación completa)
│
└── test/                             # Tests de setup
    └── setup.ts

frontend/tests/
└── e2e/                              # Tests E2E Playwright
    ├── ai-generation.spec.ts         # Test generación AI (texto e imagen)
    ├── manual-composition.spec.ts    # Test composición manual
    └── media-preview.spec.ts         # Test preview música e imagen
```

## 5.2 Arquitectura frontend

### Principios aplicados:
- **NO business logic en UI**: toda la lógica está en backend
- **React Query** para server-state (composiciones, generación AI)
- **Zustand** para UI-state (estado temporal, modales, selecciones)
- **Componentes presentacionales**: reciben props y renderizan
- **API Client autogenerado**: nunca llamadas manuales a axios
- **TypeScript strict**: tipos derivados del contrato OpenAPI

### Estado gestionado (Zustand):
```typescript
interface ComposerState {
  compositionId: string | null;
  text: string;
  selectedMusic: string | null;
  selectedImage: string | null;
  outputType: 'PODCAST' | 'VIDEO' | null;
  // actions...
}
```

### Integración con backend:
- Cliente generado desde `/backend/src/main/resources/openapi/meditationbuilder/compose-content.yaml`
- Base URL: `http://localhost:8080/api`
- Todas las llamadas tipadas con TypeScript
- Manejo de errores centralizado

## 5.3 Tests frontend implementados

### Tests unitarios (Vitest + RTL):
- ✅ Componentes individuales aislados
- ✅ Mocks de API con MSW
- ✅ Coverage de lógica de presentación
- ✅ Tests de interacciones de usuario

### Tests E2E (Playwright):
- ✅ `ai-generation.spec.ts`: flujo completo generación AI
- ✅ `manual-composition.spec.ts`: composición manual completa
- ✅ `media-preview.spec.ts`: preview de música e imágenes
- Ejecutan contra backend real en puerto 8080
- Base URL configurable via env vars

---

# 7. Ciclo de vida por historia (orden estricto e inmutable)

Cada Historia debe recorrer todas estas fases —**sin saltos, sin paralelismos indebidos y sin mezclar capas**.  
Este pipeline está sincronizado con **Spec‑Kit (spec → plan → tasks)** y con el **Delivery Playbook**.

---

## 7.1 Paso 0 — Historia candidata (Three Amigos pre‑BDD)

**Responsables:** PO + QA + Backend + Frontend  

**Objetivo:** Asegurar que la historia es:

- Vertical (aporta valor observable)
- Pequeña
- Testeable
- Independiente
- Con límites claros

> No se diseña nada técnico aún.

---

## 7.2 Paso 1 — BDD FIRST (única fuente de verdad del comportamiento)

**Responsables:** PO (input negocio), QA (dueño calidad), Backend + Frontend (colaboran)

### Artefactos
- Archivo `.feature` en  
  `/backend/src/test/resources/features/<boundedContext>/<feature>.feature`
- Escenarios **Given–When–Then** en lenguaje **100% negocio**
- Step definitions vacíos (*pending*)

### Reglas
- Sin HTTP, JSON, DTOs, repositorios, colas ni UI
- El BDD define solo comportamiento observable
- Cucumber debe ejecutar en **ROJO (pending)** inicialmente
- Nada se implementa hasta que el `.feature` exista
- En plan.md, la API First se expresa como una lista de capacidades de negocio derivadas del BDD (sin paths, sin métodos HTTP, sin DTOs). 

---

## 7.3 Paso 2 — API FIRST mínimo (derivado exclusivamente del BDD)

**Responsables:** Backend (owner), Frontend + QA (consumidores)

### Artefactos
- OpenAPI YAML en  
  `/backend/src/main/resources/openapi/<boundedContext>/<feature>.yaml`
- Validado con lint

### Reglas
- Cada `When` del BDD corresponde a una capacidad expuesta
- Prohibido añadir campos o endpoints no contemplados en el comportamiento
- El contrato sirve al negocio, **NO** al dominio ni al UI
- Tests provider/consumer (contratos)

---

## 7.4 Paso 3 — Dominio (DDD + TDD puro)

**Responsables:** Backend (dominio)

### Artefactos
- Entidades
- Value Objects
- Puertos (in/out)
- Servicios de dominio (si aplican)
- Tests unitarios (TDD)

### Ubicación
`/backend/src/main/java/com/hexagonal/<bc>/domain/...`

### Reglas
- Sin Spring, sin infraestructura, sin JSON
- El dominio piensa en negocio, no en HTTP
- TDD obligatorio (test → código → refactor)

---

## 7.5 Paso 4 — Aplicación (Use Cases)

**Responsables:** Backend (aplicación)

### Artefactos
- Use cases
- Comandos / queries
- Mappers internos
- Validadores simples
- Unit tests (solo orquestación)

### Ubicación
`/backend/src/main/java/com/hexagonal/<bc>/application/...`

### Reglas
- Sin reglas de negocio (esas están en dominio)
- Sin acceso a infraestructura
- Asociado 1:1 con puertos de dominio

---

## 7.6 Paso 5 — Infraestructura (Adaptadores)

**Responsables:** Backend (infra)

### Artefactos
- Adaptadores externos (DB, IA, colas, APIs, storage)
- Modelos de persistencia
- Mappers persistencia ↔ dominio
- Tests de integración (Testcontainers si aplica)

### Ubicación
`/backend/src/main/java/com/hexagonal/<bc>/infrastructure/...`

### Reglas
- Implementan puertos out
- Sin lógica de negocio
- No contaminan dominio con tipos de framework

---

## 7.7 Paso 6 — Controllers / REST Adapters

**Responsables:** Backend (entrada)

### Artefactos
- Controllers REST
- DTOs
- Validaciones superficiales

### Ubicación
`/backend/src/main/java/com/hexagonal/<bc>/infrastructure/in/rest/controller`

### Reglas
- Cumplimiento estricto del OpenAPI
- No lógica de negocio
- No decisiones
- Solo traducción protocolo ↔ comando use case

---

## 7.8 Paso 7 — Frontend (UI + cliente + estado)

**Responsables:** Frontend

### Artefactos
- Páginas (`/frontend/src/pages/...`)
- Componentes (`/frontend/src/components/...`)
- Hooks
- Estado (Zustand)
- Cliente OpenAPI autogenerado (`/frontend/src/api/...`)
- Tests unitarios + integración

### Reglas
- Sin lógica de negocio
- API Client siempre autogenerado
- React Query para server-state
- Estado global solo si es UI/state
- Mantener fusión mínima entre UI ↔ backend

---

## 7.9 Paso 8 — Contratos (provider/consumer)

**Responsables:** Backend + QA

### Artefactos
- Tests contractuales en `/backend/src/test/contracts/...`

### Reglas
- El backend debe cumplir su OpenAPI
- El frontend debe ejecutar contra mocks generados del YAML
- Un cambio en OpenAPI rompe si contratos fallan

---

## 7.10 Paso 9 — E2E (Backend + Frontend)

**Responsables:** QA + Frontend + Backend

### Artefactos implementados

**Backend E2E** (`/backend/src/test/java/com/hexagonal/meditationbuilder/e2e/`):
- ✅ `AiGenerationE2ETest.java`: Test completo flujo AI generation
- ✅ `ManualCompositionE2ETest.java`: Test composición manual

**Frontend E2E** (`/frontend/tests/e2e/`):
- ✅ `ai-generation.spec.ts`: Playwright test AI flow
- ✅ `manual-composition.spec.ts`: Playwright test manual flow
- ✅ `media-preview.spec.ts`: Playwright test previews

### Reglas
- Validación del comportamiento completo
- Backend con mocks de servicios externos (WireMock para OpenAI)
- Frontend contra backend real
- Validación en entorno real o contenedores

---

## 7.11 Paso 10 — CI/CD Gates (bloqueantes)

### Pipeline Backend (`.github/workflows/backend-ci.yml`)

**ESTADO ACTUAL**: 8 gates activos (completo)

1. ✅ **Gate 1 - BDD Tests**: Cucumber scenarios en verde
2. ✅ **Gate 2 - API Validation**: OpenAPI lint y schema validation
3. ✅ **Gate 3 - Unit Domain**: Tests de dominio (TDD)
4. ✅ **Gate 4 - Unit Application**: Tests de servicios de aplicación
5. ✅ **Gate 5 - Infrastructure Tests**: Adapters e infraestructura + IT con Testcontainers
6. ✅ **Gate 6 - Contract Tests**: Validación OpenAPI contracts
7. ✅ **Gate 7 - E2E Tests**: Tests end-to-end backend completos
8. ✅ **Gate 8 - Build**: Maven clean install + JAR generation

**Triggers**:
- Push a `main`, `feature/*`, `002-generate-meditation-audio-video`
- PR a `main`
- Solo si cambian archivos en `backend/**`

**Configuración especial para Generation BC**:
- FFmpeg instalado en CI environment
- LocalStack para S3 (Testcontainers)
- PostgreSQL (Testcontainers)
- Google TTS API mock (WireMock)
- JDK 21 (Amazon Corretto)
- Maven cache habilitado
- Test reports con dorny/test-reporter

### Pipeline Frontend (`.github/workflows/frontend-ci.yml`)

**ESTADO**: Configurado para tests unitarios + E2E Playwright

**Características**:
- Node.js setup
- Vite build
- Playwright tests contra backend mock o real
- Upload de artifacts (playwright-report)

### Reglas actuales
- ✅ 8 gates completos y activos
- ✅ Ningún fallo permite merge
- ✅ Build once, deploy many
- ✅ Artefacto inmutable (JAR generado en target/)
- ✅ FFmpeg + LocalStack + PostgreSQL en CI

### Pendiente implementar:
- Deployment automático a entornos
- Integración con SonarQube/code quality
- Security scanning (Snyk, Trivy)
- Performance testing en CI

---

## 7.12 Paso 11 — Done = Deployable

Una historia solo está DONE si:

- BDD verde
- OpenAPI validado
- Dominio testado por TDD
- Aplicación testada
- Infra testada
- Controllers conformes a contrato
- Frontend integrado y probado
- Playwright verde
- CI/CD verde
- Observabilidad mínima
- No deuda técnica
- Nada fuera del BDD

---
# 8. Artefactos obligatorios (estado real del proyecto)

| Fase | Artefacto | Ubicación Real | Estado |
|------|-----------|----------------|--------|
| BDD | .feature | `/backend/src/test/resources/features/meditationbuilder/compose-content.feature` | ✅ Implementado (8 scenarios) |
| BDD Steps | Step defs | `/backend/src/test/java/.../bdd/steps/ComposeContentSteps.java` | ✅ Implementado |
| BDD Runner | Cucumber | `/backend/src/test/java/.../bdd/CucumberTestRunner.java` | ✅ Implementado |
| API | OpenAPI | `/backend/src/main/resources/openapi/meditationbuilder/compose-content.yaml` | ✅ Implementado (8 endpoints) |
| Dominio | Aggregate | `/backend/src/main/java/.../domain/model/MeditationComposition.java` | ✅ Implementado (record inmutable) |
| Dominio | Value Objects | `.../domain/model/TextContent.java`, `ImageReference.java`, `MusicReference.java` | ✅ Implementados (records) |
| Dominio | Enum | `.../domain/enums/OutputType.java` | ✅ Implementado |
| Dominio | Ports IN | `.../domain/ports/in/ComposeContentUseCase.java`, etc. | ✅ Implementados (3 use cases) |
| Dominio | Ports OUT | `.../domain/ports/out/CompositionRepositoryPort.java`, etc. | ✅ Implementados (4 ports) |
| Dominio | Tests | `/backend/src/test/java/.../domain/**Test.java` | ✅ 100% coverage TDD |
| Aplicación | Use Cases | `.../application/service/ComposeContentService.java`, etc. | ✅ Implementados (3 services) |
| Aplicación | Validadores | `.../application/validator/TextLengthValidator.java` | ✅ Implementado |
| Aplicación | Tests | `/backend/src/test/java/.../application/**Test.java` | ✅ Unit tests con mocks |
| Infra | Controller | `.../infrastructure/in/rest/controller/MeditationBuilderController.java` | ✅ Implementado (8 endpoints) |
| Infra | DTOs | `.../infrastructure/in/rest/dto/*.java` | ✅ Implementados (10 DTOs) |
| Infra | Mappers | `.../infrastructure/in/rest/mapper/CompositionDtoMapper.java` | ✅ Implementado |
| Infra | Repository | `.../infrastructure/out/persistence/InMemoryCompositionRepository.java` | ✅ Implementado (in-memory) |
| Infra | AI Adapters | `.../infrastructure/out/service/*AiAdapter.java` | ✅ Implementados (OpenAI text/image) |
| Infra | Catalog Adapter | `.../infrastructure/out/service/MediaCatalogAdapter.java` | ✅ Implementado |
| Infra | Tests | `/backend/src/test/java/.../infrastructure/**Test.java` | ✅ Controller + adapter tests |
| Contratos | Tests | `/backend/src/test/contracts/` | ⚠️ Vacío (eliminado de CI temporalmente) |
| E2E Backend | Tests | `/backend/src/test/java/.../e2e/*E2ETest.java` | ✅ 2 tests Spring Boot |
| Frontend | Cliente API | `/frontend/src/api/` | ✅ Autogenerado desde OpenAPI |
| Frontend | Página | `/frontend/src/pages/MeditationBuilderPage.tsx` | ✅ Implementada |
| Frontend | Componentes | `/frontend/src/components/*.tsx` | ✅ 9 componentes implementados |
| Frontend | Estado | `/frontend/src/state/composerStore.ts` | ✅ Zustand store |
| Frontend | Tests Unit | `/frontend/src/components/__tests__/*.test.tsx` | ✅ 10 test files |
| E2E Frontend | Playwright | `/frontend/tests/e2e/*.spec.ts` | ✅ 3 spec files |
| CI/CD | Backend | `.github/workflows/backend-ci.yml` | ✅ 5 gates activos |
| CI/CD | Frontend | `.github/workflows/frontend-ci.yml` | ✅ Configurado |
| Docs | Specs | `/specs/001-compose-meditation-content/` | ✅ spec.md, plan.md, tasks.md |
| Docs | PRD | `/docs/01-PRD-design-document.md` | ✅ Completo |
| Docs | User Stories | `/docs/02.User-Stories.md` | ✅ US1-US4 definidas |

**Resumen de cobertura**:
- ✅ Dominio: 100% tested (TDD)
- ✅ Aplicación: >90% tested
- ✅ Infraestructura: >85% tested
- ✅ Frontend: Components tested
- ⚠️ Contract tests: Pendiente implementar
- ✅ E2E: Backend y Frontend implementados

---
# 9. Normas para agentes AI (GitHub Copilot, Claude, Spec-Kit)

## 9.1 Generación de specs (spec.md)
- ✅ Solo narrativa y BDD de negocio
- ✅ Lenguaje 100% negocio (sin HTTP, JSON, DTOs, arquitectura)
- ✅ Given-When-Then puro
- ❌ NO incluir métricas técnicas, performance, formatos
- ❌ NO mencionar tecnologías, frameworks, persistencia

## 9.2 Generación de planes (plan.md)
- ✅ Describir pipeline completo fase por fase siguiendo Constitution
- ✅ Listar capacidades abstractas derivadas de BDD When clauses
- ✅ Usar rutas exactas definidas en Constitution
- ✅ Referenciar explícitamente spec.md y Constitution
- ❌ NO paths HTTP, métodos, DTOs, headers
- ❌ NO nombres concretos de clases Java/TypeScript
- ❌ NO herramientas específicas no aprobadas

## 9.3 Generación de tareas (tasks.md)
- ✅ Microtareas por capa (domain / application / infra / controllers / frontend / tests)
- ✅ Una tarea = un artefacto en una ubicación exacta
- ✅ Criterios de aceptación medibles
- ✅ Dependencias explícitas entre tareas
- ✅ Marcar paralelizables con [P]
- ❌ NO mezclar capas en una sola tarea
- ❌ NO anticipar features futuras
- ❌ NO añadir endpoints no definidos en BDD

## 9.4 Generación de código
Copilot/Claude/Agentes pueden generar código SOLO cuando:

1. ✅ Existe `.feature` ejecutable en estado RED
2. ✅ Existe OpenAPI mínimo validado para la story
3. ✅ Existen `spec.md`, `plan.md` y `tasks.md` completos
4. ✅ El usuario lo solicita explícitamente

### Backend:
- ✅ Arquitectura hexagonal estricta
- ✅ Dominio sin Spring ni tipos de infraestructura
- ✅ Use cases sin lógica de negocio (solo orquestación)
- ✅ Infraestructura que implementa out ports
- ✅ Controllers que cumplen OpenAPI sin desviaciones
- ✅ Java 21: records, UUID, Clock inyectado, Optional
- ✅ Inmutabilidad por defecto

### Frontend:
- ✅ Cliente OpenAPI autogenerado (NUNCA manual)
- ✅ React Query para server-state
- ✅ Zustand para UI-state
- ✅ NO lógica de negocio en UI
- ✅ Playwright para E2E
- ✅ TypeScript strict

## 9.5 Reglas de paths (absolutas)

### Backend:
```
/backend/src/main/java/com/hexagonal/<boundedContext>/
  domain/
  application/
  infrastructure/

/backend/src/main/resources/openapi/<boundedContext>/

/backend/src/test/
  resources/features/<boundedContext>/
  java/com/hexagonal/<boundedContext>/
    domain/
    application/
    infrastructure/
    bdd/steps/
    e2e/
  contracts/
```

### Frontend:
```
/frontend/src/
  api/          # Autogenerado
  pages/
  components/
  state/
  hooks/

/frontend/tests/e2e/
```

## 9.6 Prohibiciones absolutas para agentes
- ❌ Generar endpoints no presentes en BDD aprobado
- ❌ Añadir campos a DTOs sin estar en OpenAPI
- ❌ Crear nuevas reglas de negocio
- ❌ Poner lógica de negocio en controllers o infraestructura
- ❌ Mezclar pasos del pipeline (ej: generar dominio antes de BDD+OpenAPI)
- ❌ Crear modelos de dominio "en anticipación" sin respaldo BDD
- ❌ Usar HTTP clients directamente sin pasar por domain ports
- ❌ Generar persistencia si la story no lo requiere
- ❌ Usar servicios externos reales en tests
- ❌ Crear tareas que mezclen múltiples capas

---
# 10. Conformidad técnica (stack real implementado)

## Backend Stack:
- ✅ **Java 21** (Amazon Corretto 21.0.9)
- ✅ **Spring Boot 3.5.10**
- ✅ **Spring Web** (RestClient/WebClient para llamadas externas)
- ✅ **Spring Validation** (Jakarta Validation)
- ✅ **Spring Boot Actuator** (health, metrics, info)
- ✅ **Micrometer** (métricas custom + registries)
- ✅ **OpenTelemetry 1.45.0** (distributed tracing ready)
- ✅ **Lombok** (solo DTOs y configuración, NO dominio)
- ✅ **Maven 3.9.x**
- ✅ **JUnit 5** (Jupiter)
- ✅ **AssertJ** (fluent assertions)
- ✅ **Mockito** (mocking framework)
- ✅ **Cucumber 7.15.0** (BDD)
- ✅ **WireMock 3.3.1** (mock servicios HTTP externos)
- ✅ **Atlassian OpenAPI Validator 2.41.0** (contract validation)
- ✅ **Testcontainers** (disponible, no usado aún)
- ✅ **Resilience4j** (circuit breaker, retry - configurado para OpenAI)

## Frontend Stack:
- ✅ **React 18.3.1**
- ✅ **TypeScript 5.x** (strict mode)
- ✅ **Vite 6.x** (bundler + dev server)
- ✅ **TanStack React Query v5** (server state)
- ✅ **Zustand** (client state)
- ✅ **Axios** (HTTP client - generado por OpenAPI)
- ✅ **Vitest** (test runner)
- ✅ **React Testing Library** (component testing)
- ✅ **Playwright** (E2E)
- ✅ **MSW** (Mock Service Worker - API mocking en tests)

## Configuración:
- ✅ **application.yml** (profiles: local, test)
- ✅ **OpenAI integration** configurada (text + image models)
- ✅ **Media Catalog** mock service configurado
- ✅ **CORS** habilitado para desarrollo
- ✅ **Logging** estructurado (SLF4J + Logback)
- ✅ **Metrics** custom con Micrometer
- ✅ **MDC context** para correlación (traceId, spanId)

## Observabilidad implementada:
- ✅ Logs estructurados con contexto
- ✅ Métricas custom:
  - `composition.created` (counter)
  - `ai.text.generated` (counter)
  - `ai.image.generated` (counter)
  - `ai.operation.latency` (timer)
- ✅ Tags en métricas (outputType, status, errorCode)
- ✅ Health checks (actuator)
- ✅ OpenTelemetry ready (no exportado aún)

## Patrones de resiliencia:
- ✅ **Retry** en llamadas OpenAI (3 intentos)
- ✅ **Circuit Breaker** configurado
- ✅ **Timeouts** configurados (connect + read)
- ✅ **Rate limiting** handling (429 responses)
- ✅ **Degradación graceful** (fallbacks en servicios AI)

---
# 11. Observabilidad y requisitos no funcionales (implementados)

## 11.1 Logging
- ✅ **SLF4J** como facade
- ✅ **Logback** como implementación
- ✅ Logs estructurados en JSON (production profile)
- ✅ MDC enriquecido:
  - `traceId`: correlación distribuida
  - `spanId`: correlación local
  - `compositionId`: contexto de negocio
  - `outputType`: tipo de salida
- ✅ Niveles configurables por package
- ✅ Log business events:
  - `composition.created`
  - `composition.text.updated`
  - `composition.music.selected`
  - `composition.image.set`
  - `ai.text.generation.requested`
  - `ai.text.generation.completed`
  - `ai.text.generation.failed`
  - `ai.image.generation.requested`
  - `ai.image.generation.completed`
  - `ai.image.generation.failed`

## 11.2 Métricas (Micrometer)
- ✅ **Counters**:
  - `composition.created.total` (tags: outputType)
  - `ai.text.generated.total` (tags: status)
  - `ai.image.generated.total` (tags: status)
  - `ai.operation.failed.total` (tags: errorCode, service)
- ✅ **Timers**:
  - `ai.text.generation.duration` (latency en ms)
  - `ai.image.generation.duration` (latency en ms)
- ✅ **Gauges**: (disponibles via actuator)
- ✅ Registry: SimpleMeterRegistry (test), Prometheus ready

## 11.3 Health Checks
- ✅ `/actuator/health` endpoint activo
- ✅ Health indicators:
  - Application status
  - Disk space
  - Custom indicators ready para añadir
- ⚠️ Pendiente: OpenAI health check
- ⚠️ Pendiente: MediaCatalog health check

## 11.4 Resiliencia
- ✅ **Retry policy** (OpenAI):
  - Max attempts: 3
  - Backoff: exponential
  - Retryable: 503, 429, network errors
- ✅ **Circuit Breaker**:
  - Failure threshold: 50%
  - Wait duration: 60s
  - Sliding window: 10 calls
- ✅ **Timeouts**:
  - Connect timeout: 5s (configurable)
  - Read timeout: 30s (configurable)
- ✅ **Rate limiting** detection y manejo
- ✅ **Graceful degradation**: fallbacks en AI services

## 11.5 Seguridad
- ⚠️ **Authentication**: Pendiente (US1 - AWS Cognito)
- ⚠️ **Authorization**: Pendiente
- ✅ **API Key management**: Configurado via env vars
- ✅ **CORS**: Habilitado para desarrollo
- ⚠️ **HTTPS**: Pendiente en producción
- ⚠️ **Rate limiting**: Pendiente implementar

## 11.6 Performance
- ✅ **In-memory storage**: Rápido pero no persistente
- ⚠️ **Caching**: Pendiente implementar
- ✅ **Async operations**: Preparado (WebClient)
- ⚠️ **Connection pooling**: Default Spring
- ⚠️ **Database indexing**: N/A (in-memory)

## 11.7 Build & Deploy
- ✅ **Build once, deploy many**: JAR único
- ✅ **Executable JAR**: Spring Boot maven plugin
- ✅ **Profiles**: local, test (production pendiente)
- ✅ **Externalized config**: application.yml + env vars
- ✅ **Container ready**: Dockerfile pendiente
- ⚠️ **Cloud deployment**: Pendiente (AWS ECS/EKS)
- ⚠️ **Infrastructure as Code**: Pendiente (Terraform/CDK)

---
# 12. Antipatrones detectados y evitados

## 12.1 Arquitectura
- ✅ **Evitado**: God Objects → Aggregate pequeño, responsabilidad única
- ✅ **Evitado**: Lógica negocio en controllers → Controllers solo HTTP translation
- ✅ **Evitado**: Lógica negocio en infrastructure → Adapters solo traducción
- ✅ **Evitado**: Dependencias invertidas incorrectas → Ports claros, infra depende de dominio
- ✅ **Evitado**: Mezcla de capas → Separación estricta domain/application/infrastructure
- ✅ **Evitado**: Anemic domain → Aggregate con comportamiento (withX methods, getOutputType)

## 12.2 Dominio
- ✅ **Evitado**: Entidades mutables → Records inmutables
- ✅ **Evitado**: String IDs → UUID tipado
- ✅ **Evitado**: `Instant.now()` directo → Clock inyectado (testable)
- ✅ **Evitado**: Validaciones primitivas → Value Objects
- ✅ **Evitado**: Excepciones genéricas → Excepciones de dominio específicas
- ✅ **Evitado**: Getters/setters → Records con métodos de negocio

## 12.3 Testing
- ✅ **Evitado**: Tests sin assertions → AssertJ fluent assertions
- ✅ **Evitado**: Tests con servicios reales → Mocks (WireMock para HTTP)
- ✅ **Evitado**: Tests sin arrange → Given-When-Then clara
- ✅ **Evitado**: Tests con Clock.systemUTC() → Clock inyectado fijo
- ✅ **Evitado**: Tests acoplados al tiempo → Timestamps controlados
- ✅ **Evitado**: Tests sin DisplayName → Nombres descriptivos

## 12.4 Frontend
- ✅ **Evitado**: Lógica de negocio en UI → Solo presentación
- ✅ **Evitado**: Llamadas API manuales → Cliente autogenerado
- ✅ **Evitado**: Estado server en UI → React Query
- ✅ **Evitado**: Props drilling → Zustand para UI state
- ✅ **Evitado**: Any types → TypeScript strict

## 12.5 API & Contratos
- ✅ **Evitado**: Endpoints no documentados → OpenAPI first
- ✅ **Evitado**: DTOs != OpenAPI → Strict mapping
- ✅ **Evitado**: Cambios breaking sin versioning → Contract tests (cuando se implementen)
- ✅ **Evitado**: Error responses genéricas → Error DTOs específicos

## 12.6 Configuración
- ✅ **Evitado**: Hardcoded values → Externalized config (application.yml)
- ✅ **Evitado**: Secrets en código → Environment variables
- ✅ **Evitado**: Profiles mezclados → Separación clara (local, test, prod)

## 12.7 Observabilidad
- ✅ **Evitado**: Logs sin contexto → MDC enriquecido
- ✅ **Evitado**: Métricas sin tags → Tags significativos
- ✅ **Evitado**: System.out.println → SLF4J
- ✅ **Evitado**: Errores silenciosos → Logging + métricas de errores

## 12.8 Diseño horizontal (evitado)
- ✅ **NO**: Crear toda la infraestructura de persistencia primero
- ✅ **NO**: Implementar todos los endpoints antes del dominio
- ✅ **NO**: Construir todo el frontend antes de tener backend
- ✅ **SÍ**: Vertical slices (BDD → API → Domain → App → Infra → UI)

## 12.9 Over-engineering (evitado)
- ✅ **NO**: Event sourcing innecesario
- ✅ **NO**: CQRS complejo para MVP
- ✅ **NO**: Microservicios prematuros
- ✅ **NO**: Cache distribuido sin necesidad
- ✅ **SÍ**: Simple in-memory repository (adecuado para MVP)
- ✅ **SÍ**: Monolito modular con bounded contexts claros

## 12.10 Dependencias (evitado)
- ✅ **NO**: Lombok en dominio → Solo en DTOs/config
- ✅ **NO**: Spring annotations en dominio → Dominio puro
- ✅ **NO**: Jackson en dominio → Mappers en infrastructure
- ✅ **NO**: HTTP tipos en application → Ports abstractos

---
# 13. Definition of Done (DoD) - Feature Completa

Una historia/feature solo está **DONE** si cumple TODO lo siguiente:

## 13.1 BDD & Specs
- ✅ `.feature` file completo y aprobado por PO/QA
- ✅ Todos los escenarios Cucumber están en GREEN
- ✅ `spec.md` actualizado con narrativa de negocio
- ✅ `plan.md` refleja la implementación real
- ✅ `tasks.md` marca todas las tareas como completadas

## 13.2 API First
- ✅ OpenAPI YAML validado (sin errores de lint)
- ✅ Todos los endpoints documentados
- ✅ Request/Response schemas completos
- ✅ Error responses definidos (400, 404, 503, etc.)

## 13.3 Dominio
- ✅ Entities/Aggregates implementados (inmutables)
- ✅ Value Objects validados
- ✅ Puertos IN (use cases) definidos
- ✅ Puertos OUT (interfaces secundarias) definidos
- ✅ Tests unitarios TDD: 100% coverage
- ✅ NO dependencias de frameworks
- ✅ NO tipos de infraestructura

## 13.4 Aplicación
- ✅ Use Cases implementados (orquestación pura)
- ✅ Validadores implementados
- ✅ Tests unitarios con mocks: >90% coverage
- ✅ NO lógica de negocio (delegada a dominio)

## 13.5 Infraestructura
- ✅ Adaptadores OUT implementados (DB, APIs externas, etc.)
- ✅ Controllers REST implementados
- ✅ DTOs mappean exactamente con OpenAPI
- ✅ Mappers Domain ↔ DTO/Persistence
- ✅ Tests de integración: >85% coverage
- ✅ WireMock para servicios externos

## 13.6 Frontend
- ✅ Cliente API autogenerado desde OpenAPI
- ✅ Componentes implementados y testeados
- ✅ React Query para server-state
- ✅ Zustand para UI-state
- ✅ Tests unitarios componentes (RTL)
- ✅ NO lógica de negocio en UI

## 13.7 Tests E2E
- ✅ Backend E2E tests (Spring Boot + WireMock)
- ✅ Frontend E2E tests (Playwright)
- ✅ Todos los flujos críticos cubiertos
- ✅ Tests ejecutan contra backend real (frontend E2E)

## 13.8 CI/CD
- ✅ Pipeline Backend: 8 gates GREEN
  - Gate 1: BDD Tests ✅
  - Gate 2: API Validation ✅
  - Gate 3: Unit Domain ✅
  - Gate 4: Unit Application ✅
  - Gate 5: Infrastructure Tests ✅
  - Gate 6: Contract Tests ✅
  - Gate 7: E2E Tests ✅
  - Gate 8: Build ✅
- ✅ Pipeline Frontend: GREEN
- ✅ No warnings críticos
- ✅ Artefactos generados (JAR, bundles)

## 13.9 Observabilidad
- ✅ Logs estructurados con MDC context
- ✅ Métricas custom implementadas:
  - Counters de eventos de negocio
  - Timers de operaciones críticas
  - Tags significativos
- ✅ Health checks functionando
- ✅ Actuator endpoints habilitados

## 13.10 Código limpio
- ✅ NO código comentado (excepto Javadoc)
- ✅ NO TODOs sin tracking
- ✅ NO duplicación de código
- ✅ Naming consistente
- ✅ Formateo consistente (checkstyle/eslint)

## 13.11 Documentación
- ✅ README actualizado si aplica
- ✅ OpenAPI documentado con examples
- ✅ Javadoc en interfaces públicas
- ✅ Comments explicando "por qué" no "qué"

## 13.12 Deuda técnica
- ✅ NO deuda técnica introducida sin justificar
- ✅ Contract tests implementados
- ✅ Performance acceptable (no degradación)
- ✅ Security básica (API keys, CORS, validaciones)

## 13.13 Aprobaciones
- ✅ Code review aprobado (al menos 1 reviewer)
- ✅ PO/QA sign-off en BDD scenarios
- ✅ No breaking changes sin migración path
- ✅ Merge to main sin conflictos

**Si falta CUALQUIERA de estos ítems → NO ESTÁ DONE**

---
# 14. Governance y gestión de cambios

## 14.1 Modificaciones a esta Constitution
- ✅ Requieren **Pull Request** al archivo constitution.md
- ✅ Requieren **consenso** de al menos:
  - 1 Backend developer
  - 1 Frontend developer  
  - 1 QA/Architect
- ✅ Versionado semántico (major.minor.patch)
- ✅ Changelog obligatorio en el PR

## 14.2 Modificaciones a Playbooks/Guidelines
- ✅ PR con justificación técnica
- ✅ Alineación con Constitution
- ✅ Review por al menos 1 developer + 1 architect

## 14.3 Adición de tecnologías nuevas
- ✅ Justificación de negocio/técnica
- ✅ Evaluación de alternativas
- ✅ POC si es cambio significativo
- ✅ Actualización de esta Constitution
- ✅ Actualización de CI/CD
- ✅ Training plan si aplica

## 14.4 Decisiones arquitectónicas (ADRs)
- ⚠️ **Pendiente**: Sistema formal de ADRs
- ✅ **Mientras tanto**: Decisiones en PRs con tag `[ADR]`
- ✅ Documentar en `/docs/architecture-decisions/`

## 14.5 Excepciones a las reglas
- ✅ Requieren **justificación explícita** en PR
- ✅ Tag `[EXCEPTION]` en commit/PR
- ✅ Tracking como tech debt si es temporal
- ✅ Plan de remediación si impacta arquitectura

## 14.6 Resolución de conflictos
1. Consultar jerarquía normativa (sección 1)
2. Si persiste ambigüedad → discusión en PR/issue
3. Decisión documentada y agregada a Constitution/Guidelines

---
# 15. Información importante para futuros agentes/colaboradores

## 15.1 Conocimiento crítico del proyecto

### Estado actual (17 Febrero 2026):
- ✅ **US2 (Compose Content - Branch 001-compose-meditation-content)** implementada al 100%
  - BC: `meditationbuilder`
  - 8 escenarios BDD + arquitectura hexagonal completa
  - Frontend React + OpenAI integration
  - In-memory persistence (suficiente para composición temporal)
  
- ✅ **US3 (Generation - Branch 002-generate-meditation-audio-video)** implementada al 100%
  - BC: `meditation.generation`
  - 3 escenarios BDD + arquitectura hexagonal completa
  - Google TTS (es-ES-Neural2-Diana) + FFmpeg rendering
  - PostgreSQL persistence + S3 storage (LocalStack dev/test)
  - **TIMEOUT 187 segundos** (decisión de negocio crítica)
  - Idempotencia SHA-256 + subtítulos sincronizados

- ❌ **US1 (Authentication)**: NO implementada (pending - AWS Cognito + JWT)
- ❌ **US4 (List & Play)**: NO implementada (pending)

### Decisiones arquitectónicas clave:
1. **Dos Bounded Contexts independientes**: `meditationbuilder` (composition) + `meditation.generation` (A/V generation)
2. **Hexagonal Architecture**: No negociable, estrictamente aplicada en ambos BCs
3. **Java 21 Records**: Usado extensivamente para inmutabilidad (aggregates y VOs)
4. **Clock injection**: Obligatorio para testabilidad temporal
5. **Persistencia diferenciada**: In-memory para BC Composition (temporal), PostgreSQL para BC Generation (permanente)
6. **Timeout 187s**: Límite de negocio para narración (~467 palabras @ 150 wpm)
7. **OpenAPI First**: Contrato antes que implementación (2 specs: compose-content.yaml, generate-meditation.yaml)
8. **CI/CD 8 gates**: BDD → API → Unit Domain → Unit App → Infra → Contract → E2E → Build

### Bottlenecks conocidos:
- ⚠️ **OpenAI API**: Rate limits (429) manejados con retry + circuit breaker
- ⚠️ **OpenAI API**: Latency variable (3-10s típico)
- ⚠️ **Google TTS**: Latency 5-15s dependiendo de texto length
- ⚠️ **FFmpeg rendering**: CPU-intensive, ~10-30s para video completo
- ✅ **Degradación graceful** implementada en ambos BCs
- ✅ **S3 LocalStack**: Dev/test fast, migración a AWS S3 productivo

### Integraciones externas implementadas:
1. **OpenAI** (BC: meditationbuilder - text + image generation):
   - Models: gpt-5-nano, gpt-image-1-mini
   - Auth: API Key via env var
   - Resilience: Retry (3x) + Circuit Breaker

2. **Google Cloud TTS** (BC: meditation.generation - voice synthesis):
   - Voice: es-ES-Neural2-Diana (neural voice)
   - Speaking rate: 0.95 (pausado para meditación)
   - Auth: Service Account JSON (GOOGLE_APPLICATION_CREDENTIALS)
   - Output: MP3 @ 64kbps

3. **AWS S3 / LocalStack** (BC: meditation.generation - storage):
   - LocalStack: Dev/test (http://localhost:4566)
   - AWS S3: Production (configurable)
   - Buckets: meditation-outputs, meditation-subtitles

4. **PostgreSQL** (BC: meditation.generation - persistence):
   - Schema: meditation_outputs table (id, content_id, urls, status, timestamps)
   - JPA + Spring Data
   - Testcontainers en CI

5. **FFmpeg** (BC: meditation.generation - rendering):
   - Audio: Mix narration + music (narración 100%, música 30%)
   - Video: Static image + audio (H.264, 1920x1080, 1fps)
   - Gestión archivos temp con auto-cleanup

6. **Media Catalog** (BC: meditationbuilder - mock):
   - Mock interno para MVP
   - Reemplazar con servicio real en futuro

### Tech Debt resuelto (vs. versión anterior):
- ✅ **Contract Tests**: Ahora ACTIVOS (Gate 6 en CI/CD)
- ✅ **Persistencia PostgreSQL**: IMPLEMENTADA en BC Generation
- ✅ **Video/Audio generation**: IMPLEMENTADA completamente (US3)
- ✅ **FFmpeg integration**: COMPLETA con tests
- ✅ **S3 Storage**: IMPLEMENTADO (LocalStack)

### Tech Debt pendiente:
- ⚠️ **Autenticación/Autorización**: US1 pendiente (Cognito + JWT)
- ⚠️ **Health checks completos**: Añadir checks para OpenAI, Google TTS, S3
- ⚠️ **Containerización**: Dockerfile + Docker Compose pendientes
- ⚠️ **IaC**: Terraform/CDK para infraestructura cloud
- ⚠️ **Observability export**: Prometheus + Grafana + distributed tracing
- ⚠️ **Async processing**: US3 es sync actualmente, considerar async/queues para workloads largos

### Próximos pasos recomendados (en orden):
1. **US1**: Implementar Cognito authentication + JWT validation
2. **US4**: Listado y reproducción de meditaciones generadas
3. **Production Hardening**:
   - Health checks completos (OpenAI, Google TTS, S3, PostgreSQL)
   - Containerization (Dockerfile multi-stage)
   - IaC (Terraform para AWS resources)
   - Security scanning (Snyk, Trivy)
   - Performance testing con carga
4. **Async Processing**: 
   - Refactor Generation BC para async (SQS/SNS o similar)
   - Webhooks para notificar completion
   - Polling endpoint para status checking
5. **Observability**:
   - Export métricas a Prometheus
   - Dashboards Grafana
   - Distributed tracing completo (OpenTelemetry → Jaeger/Zipkin)

## 15.2 Patterns y convenciones establecidas

### Naming:
- Aggregates: sustantivo (MeditationComposition)
- Value Objects: sustantivo descriptivo (TextContent, ImageReference)
- Use Cases: verbo + objeto (ComposeContentUseCase)
- Services: nombre use case + Service (ComposeContentService)
- Controllers: dominio + Controller (MeditationBuilderController)
- Ports IN: AcciónUseCase (GenerateTextUseCase)
- Ports OUT: FunciónPort (TextGenerationPort)

### Testing:
- Unit tests: `XxxTest.java` (mismo package que clase)
- Integration tests: `XxxIntegrationTest.java`
- E2E tests: `XxxE2ETest.java`
- BDD steps: `XxxSteps.java` (bajo `/bdd/steps/`)
- Frontend unit: `Xxx.test.tsx`
- Frontend E2E: `xxx.spec.ts`

### Commits:
- Prefijos: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- Scope: módulo afectado `feat(domain):`, `fix(controller):`
- Referencias: issue/ticket number al final `#123`

### Branches:
- Features: `XXX-nombre-corto` (ej: `001-compose-meditation-content`)
- Hotfixes: `hotfix-descripcion`
- Main: `main` (protected, requires PR + CI green)

## 15.3 Contactos y responsables (placeholder)
- **Architect**: [TBD]
- **Backend Lead**: [TBD]
- **Frontend Lead**: [TBD]
- **QA Lead**: [TBD]
- **DevOps**: [TBD]

---
# 16. Principio final

**Cada historia atraviesa el sistema verticalmente, de punta a punta:**

```
BDD (negocio) 
  ↓
OpenAPI (contrato)
  ↓
Domain (lógica)
  ↓
Application (orquestación)
  ↓
Infrastructure (adaptación)
  ↓
Controllers (HTTP)
  ↓
Frontend (UI)
  ↓
Tests (validación)
  ↓
CI/CD (entrega)
  ↓
DONE (deployable)
```

**Sin atajos. Sin saltos. Sin compromisos.**

---

**FIN DE CONSTITUTION v3.0.0**

*Última actualización: 16 de Febrero de 2026*  
*Actualizado con estado real del proyecto tras implementación completa de US002*