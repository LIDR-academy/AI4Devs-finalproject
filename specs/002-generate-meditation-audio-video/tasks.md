# Tasks: Generate Guided Meditation (Video/Podcast) — MVP (PostgreSQL + LocalStack S3) — **BC: Generation**

**Feature**: US3 — Generar meditación guiada (vídeo/podcast) con voz narrada + subtítulos sincronizados  
**Bounded Context**: **Generation** (separado de Composition/US2 y Playback/US4)  
**Branch**: `002-generate-meditation-audio-video`  
**Related Documents**: ./spec.md | ./plan.md  
**Strategy**: **MVP backend + frontend** con **PostgreSQL real** (Docker local) y **S3** mediante **LocalStack**; en tests se usa **Testcontainers**. **Sin JWT real** (bypass solo en test) mientras US1 esté pendiente.

---

## 0. Convenciones

**Hard Limits**
- **Total tareas MVP**: 34 (T001–T034, con T018.1 y T018.2 como sub‑tareas de T018)
- **Tareas diferidas/bloqueadas**: 8 (T035–T042)
- **Una capa por tarea**: domain | application | infrastructure | controller | **frontend** | testing | ci
- **MVP**: Persistencia real en **Postgres** (JPA + Flyway, **schema `generation`**) y storage **S3 (LocalStack)** con **prefijo `generation/`**
- **US1 bloqueante**: JWT real → **[BLOCKED BY US1]**; en test se usa bypass de auth

**Rutas base (BC: Generation)** — *no inventar otras*:
- **Domain**: `/backend/src/main/java/com/hexagonal/meditation/generation/domain/...`
- **Application**: `/backend/src/main/java/com/hexagonal/meditation/generation/application/...`
- **Infra OUT**: `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/out/...`
- **Infra IN (REST)**: `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/in/rest/...`
- **Tests (Java)**: `/backend/src/test/java/com/hexagonal/meditation/generation/...`
- **Features (Gherkin)**: `/backend/src/test/resources/features/generation/...`
- **OpenAPI (BC)**: `/backend/src/main/resources/openapi/generation/generate-meditation.yaml`
- **Frontend**: `/frontend/src/...` (pages, components, hooks, api, state)

**Naming obligatorio**
- Ports domain: `VoiceSynthesisPort`, `SubtitleSyncPort`, `VideoRenderingPort`, `AudioRenderingPort`, `MediaStoragePort`, `ContentRepositoryPort` (+ **reusa** `MediaCatalogPort` de **BC Composition**/US2)
- Use case: `GenerateMeditationContentUseCase` (impl: `GenerateMeditationContentService`)
- Adapters MVP: `GoogleTtsAdapter`, `SubtitleSyncService`, `FfmpegVideoRendererAdapter`, `FfmpegAudioRendererAdapter`, `S3MediaStorageAdapter`, `PostgresMeditationRepository`

**Orden hexagonal**  
BDD RED → Domain → Application → Infrastructure → Controllers → **Frontend** → Testing → CI

---

## 1. BDD & API First (4 tareas)

### T001 — BDD Feature File (3 scenarios RED)
**Capa:** testing  
**Descripción:** Definir escenarios Gherkin (vídeo, audio, timeout) en estado RED (pending).  
**Artefactos:**
- `/backend/src/test/resources/features/generation/generate-meditation.feature`
- `/backend/src/test/java/com/hexagonal/meditation/generation/bdd/steps/GenerateMeditationSteps.java` (stubs con `PendingException`)
**Criterios de aceptación:**
- [x] 3 escenarios del spec.md en lenguaje 100% negocio
- [x] Steps anotados `@Given/@When/@Then`
**Evidencias:** Cucumber detecta 3 PENDING  
**Dependencias:** —  
**Definition of Done:** 3 escenarios en PENDING legibles por PO/QA

---

### T002 — OpenAPI Contract (capabilities + schemas)
**Capa:** testing  
**Descripción:** Contrato OpenAPI del BC Generation (capacidad “Generate meditation content”, request/response y errores).  
**Artefactos:** `/backend/src/main/resources/openapi/generation/generate-meditation.yaml`  
**Criterios de aceptación:**
- [x] Request: `text` (req), `musicReference` (req), `imageReference` (opt)
- [x] Response: `meditationId`, `type`, `mediaUrl`, `status`, `message`
- [x] Errores: 400 (validación), 408 (timeout), 503 (servicio externo)
- [x] `components.securitySchemes.bearerAuth` definido (JWT)
- [x] **En test se permite `security: []`** para no exigir JWT real
- [x] Lint/validator OK
**Evidencias:** Lint OK  
**Dependencias:** T001

---

### T003 — OpenAPI Paths & Operations
**Capa:** testing  
**Descripción:** Definir path/operación HTTP concreta del BC Generation.  
**Artefactos:** (ampliar) `/backend/src/main/resources/openapi/generation/generate-meditation.yaml`  
**Criterios de aceptación:**
- [x] Path: `/api/v1/generation/meditations`
- [x] Método: `POST`, `operationId: generateMeditationContent`
- [x] Schemas en `components/schemas`
- [x] Header Authorization documentado; en test se acepta `security: []`
**Evidencias:** Validator OK  
**Dependencias:** T002

---

### T004 — Validate OpenAPI & Generate Stubs
**Capa:** testing  
**Descripción:** Validar contrato; generar DTOs si procede.  
**Artefactos:** `/backend/target/generated-sources/` (si plugin activo)  
**Criterios de aceptación:**
- [x] `openapi-generator validate` pasa
- [x] Sin breaking vs T002/T003
**Evidencias:** Build Maven green  
**Dependencias:** T003

---

## 2. Domain Layer (5 tareas)

### T005 — Domain Enums (MediaType, GenerationStatus)
**Capa:** domain  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/enums/MediaType.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/enums/GenerationStatus.java`
**Criterios de aceptación:** [x] AUDIO/VIDEO y PROCESSING/COMPLETED/FAILED/TIMEOUT  
**Evidencias:** [x] Tests simples  
**Dependencias:** —  

---

### T006 — Domain Value Objects (NarrationScript, SubtitleSegment, MediaReference)
**Capa:** domain  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/model/NarrationScript.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/model/SubtitleSegment.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/model/MediaReference.java`
- `/backend/src/test/java/com/hexagonal/meditation/generation/domain/model/NarrationScriptTest.java`
- `/backend/src/test/java/com/hexagonal/meditation/generation/domain/model/SubtitleSegmentTest.java`
**Criterios de aceptación:**
- [x] Records Java 21 con validación en compact constructor
- [x] `SubtitleSegment`: `start < end`, sin solape
- [x] `MediaReference`: path/URL válida
**Evidencias:** [x] TDD green  
**Dependencias:** T005

---

### T007 — Domain Aggregate (MeditationOutput)
**Capa:** domain  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/model/MeditationOutput.java`
- `/backend/src/test/java/com/hexagonal/meditation/generation/domain/model/MeditationOutputTest.java`
**Criterios de aceptación:**
- [x] Record con: `id`, `compositionId`, `userId`, `type`, `textSnapshot`, `musicRef`, `imageRefOpt`, `mediaUrlOpt`, `subtitleUrlOpt`, `durationSecondsOpt`, `status`, `createdAt`, `updatedAt`
- [x] Factories `createAudio(...)` / `createVideo(...)`
- [x] `Clock` inyectado; `Optional` en campos no obligatorios
**Evidencias:** [x] TDD >95% domain  
**Dependencias:** T006

---

### T008 — Domain Ports (in/out)
**Capa:** domain  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/ports/in/GenerateMeditationContentUseCase.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/ports/out/VoiceSynthesisPort.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/ports/out/SubtitleSyncPort.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/ports/out/VideoRenderingPort.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/ports/out/AudioRenderingPort.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/ports/out/MediaStoragePort.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/ports/out/ContentRepositoryPort.java`
**Criterios de aceptación:**
- [x] Reutiliza `MediaCatalogPort` (BC Composition/US2) para música (no crear `MusicPort`)
- [x] Solo tipos de dominio (sin HTTP/JPA/etc.)
**Evidencias:** [x] Compila  
**Dependencias:** T007

---

### T009 — Domain Exceptions (GenerationTimeout, InvalidContent)
**Capa:** domain  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/exception/GenerationTimeoutException.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/domain/exception/InvalidContentException.java`
**Criterios de aceptación:** [x] RuntimeException; mensajes claros  
**Evidencias:** [x] Compila  
**Dependencias:** —  

---

## 3. Application Layer (4 tareas)

### T010 — Application Validator (TextLengthEstimator)
**Capa:** application  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/application/validator/TextLengthEstimator.java`
- `/backend/src/test/java/com/hexagonal/meditation/generation/application/validator/TextLengthEstimatorTest.java`
**Criterios de aceptación:**
- [x] `estimateProcessingTime(text)` (s) con heurística conservadora (~150 wpm + overhead)
- [x] Umbral configurable (default 30s)
**Evidencias:** Unit tests green  
**Dependencias:** T007

---

### T011 — Application Use Case (GenerateMeditationContentService)
**Capa:** application  
**Artefactos:** `/backend/src/main/java/com/hexagonal/meditation/generation/application/service/GenerateMeditationContentService.java`  
**Criterios de aceptación:**
- [x] Implementa `GenerateMeditationContentUseCase`
- [x] Orquesta: validar → estimar → TTS → subtítulos → (vídeo|audio) → store → persist
- [x] Mapea errores a excepciones de dominio
**Evidencias:** Compila  
**Dependencias:** T008, T010

---

### T012 — Application Idempotency Guard
**Capa:** application  
**Artefactos:** (ampliar) `/backend/src/main/java/com/hexagonal/meditation/generation/application/service/GenerateMeditationContentService.java`  
**Criterios de aceptación:**
- [x] `idempotencyKey = SHA-256(userId|text|musicRef|imageRefOpt)` con separador fijo y orden estable
- [x] Consulta previa `ContentRepositoryPort.findByIdempotencyKey`
**Evidencias:** Tests en T013  
**Dependencias:** T011

---

### T013 — Application Unit Tests (orchestration + idempotency)
**Capa:** application  
**Artefactos:** `/backend/src/test/java/com/hexagonal/meditation/generation/application/service/GenerateMeditationContentServiceTest.java`  
**Criterios de aceptación:**
- [x] Happy path vídeo y audio; timeout antes de TTS si >30s
- [x] Idempotencia (misma petición → mismo resultado)
- [x] Errores TTS/Render/Storage mapeados
- [x] Mockito verifica secuencia de puertos
**Evidencias:** Cobertura >90% application  
**Dependencias:** T012

---

## 4. Infrastructure (MVP) — TTS/Render/S3/Repo (9 tareas)

### T014 — Infra Adapter: GoogleTtsAdapter (VoiceSynthesisPort)
**Capa:** infrastructure  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/out/service/tts/GoogleTtsAdapter.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/out/service/tts/dto/TtsRequest.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/out/service/tts/dto/TtsResponse.java`
- `/backend/src/test/java/com/hexagonal/meditation/generation/infrastructure/out/service/tts/GoogleTtsAdapterTest.java`
**Criterios de aceptación:**
- [ ] Voz `es-ES-Neural2-Diana`, rate ~0.85; retry 429 (x3); 503 → excepción dominio
- [ ] **Métricas**: `tts.requests.total`, `tts.latency`, `tts.error.*`
**Evidencias:** IT WireMock 200/429/503 green  
**Dependencias:** T008

---

### T015 — Infra Service: SubtitleSyncService (SubtitleSyncPort)
**Capa:** infrastructure  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/out/service/subtitle/SubtitleSyncService.java`
- `/backend/src/test/java/com/hexagonal/meditation/generation/infrastructure/out/service/subtitle/SubtitleSyncServiceTest.java`
**Criterios de aceptación:**
- [ ] Genera SRT (índice, hh:mm:ss,mmm, texto)
- [ ] Sin overlaps; precisión <200ms; **assets mínimos**
- [ ] **Métricas** básicas de éxito/error
**Evidencias:** Unit tests green  
**Dependencias:** T008

---

### T016 — Infra Adapter: FfmpegVideoRendererAdapter (VideoRenderingPort)
**Capa:** infrastructure  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/out/service/rendering/FfmpegVideoRendererAdapter.java`
- `/backend/src/test/java/com/hexagonal/meditation/generation/infrastructure/out/service/rendering/FfmpegVideoRendererAdapterTest.java`
**Criterios de aceptación:**
- [ ] Comando determinista: `-y`, **48kHz**, **stereo**, **1280x720**
- [ ] `amix` voz primaria / música aprox. −12dB; subtítulos “burned”
- [ ] **Métricas**: `render.video.latency`, `render.video.error.*`
- [ ] IT con **assets mínimos** (PNG 640×360; audios 1–2s)
**Evidencias:** MP4 reproducible; IT green  
**Dependencias:** T008

---

### T017 — Infra Adapter: FfmpegAudioRendererAdapter (AudioRenderingPort)
**Capa:** infrastructure  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/out/service/rendering/FfmpegAudioRendererAdapter.java`
- `/backend/src/test/java/com/hexagonal/meditation/generation/infrastructure/out/service/rendering/FfmpegAudioRendererAdapterTest.java`
**Criterios de aceptación:**
- [ ] Comando determinista: `-y`, **48kHz**, **stereo**
- [ ] Mezcla estable (amix/loudnorm simple); **assets mínimos**
- [ ] **Métricas**: `render.audio.latency`, `render.audio.error.*`
**Evidencias:** MP3 reproducible; IT green  
**Dependencias:** T008

---

### T018 — Infra Adapter: S3MediaStorageAdapter (MediaStoragePort)
**Capa:** infrastructure  
**Descripción:** Almacenamiento final en S3 (AWS SDK v2), con LocalStack en local y Testcontainers en tests.  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/out/service/storage/S3MediaStorageAdapter.java`
- `/backend/src/test/java/com/hexagonal/meditation/generation/infrastructure/out/service/storage/S3MediaStorageAdapterTest.java`
**Criterios de aceptación:**
- [ ] Implementa `MediaStoragePort`
- [ ] Bucket `${BUCKET_NAME:meditation-outputs}`
- [ ] **Clave S3 con prefijo BC**: `generation/{userId}/{meditationId}/(video.mp4|audio.mp3|subs.srt)`
- [ ] Upload `PutObjectRequest`; metadata y content-type correctos
- [ ] Signed URL (TTL configurable)
- [ ] IT LocalStack (Testcontainers): create bucket, put, head, get presign
- [ ] **Métricas**: `storage.uploads.total`, `storage.latency`, `storage.error.*`
**Evidencias:** IT green  
**Dependencias:** T008

---

### T018.1 — Docker Compose: Postgres + LocalStack (desarrollo local)
**Capa:** infrastructure  
**Artefactos:**
- `/docker-compose.yml` (servicios `postgres:16` y `localstack/localstack:latest` con `SERVICES=s3`, puerto `4566`)
- `/backend/src/main/resources/application-local.yml`
**Criterios de aceptación:**
- [ ] `docker compose up -d` levanta Postgres (5432) y LocalStack (4566)
- [ ] Perfil `local` apunta a Postgres y S3 LocalStack; **Flyway** migra al arrancar
- [ ] Script/init crea bucket `meditation-outputs`
**Evidencias:** App `local` levanta, migra y crea bucket  
**Dependencias:** T019, T018

---

### T018.2 — Testcontainers: LocalStack S3 (tests)
**Capa:** testing  
**Artefactos:**
- `/backend/src/test/java/com/hexagonal/meditation/generation/S3TestContainerConfig.java` (o configuración embebida en tests)
**Criterios de aceptación:**
- [ ] Inicia LocalStack S3 en tests; registra `endpointOverride` en AWS SDK
- [ ] Crea bucket `meditation-outputs` en setup
**Evidencias:** Tests de S3 (T018) y E2E (T031) usan LocalStack  
**Dependencias:** T018

---

### T019 — Infra Repository: PostgresMeditationRepository (ContentRepositoryPort)
**Capa:** infrastructure  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/out/persistence/entity/MeditationEntity.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/out/persistence/mapper/MeditationEntityMapper.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/out/persistence/PostgresMeditationRepository.java`
- `/backend/src/main/resources/db/migration/V002__create_generation_meditation.sql`
- `/backend/src/test/java/com/hexagonal/meditation/generation/infrastructure/out/persistence/PostgresMeditationRepositoryTest.java`
**Criterios de aceptación:**
- [ ] **Schema `generation`** y tabla `meditation`
- [ ] `@Table(name="meditation", schema="generation")` en la entity
- [ ] Repo: `save`, `findById`, `findByUserId`, **`findByIdempotencyKey`**
- [ ] Flyway aplica `V002__create_generation_meditation.sql`
- [ ] **Testcontainers Postgres** para IT
**Evidencias:** IT green; migración aplicada; CRUD + idempotency OK  
**Dependencias:** T008

---

### T020 — Infra Util: TempFileManager (cleanup policy)
**Capa:** infrastructure  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/out/util/TempFileManager.java`
- `/backend/src/test/java/com/hexagonal/meditation/generation/infrastructure/out/util/TempFileManagerTest.java`
**Criterios de aceptación:**
- [ ] `createTempDir(requestId)` bajo `${java.io.tmpdir}/meditations`
- [ ] `cleanup(path)` elimina archivos/directorios
- [ ] Garantía de limpieza (try-with-resources / finally)
**Evidencias:** Tests sin fugas de ficheros  
**Dependencias:** —

---

## 5. Controllers (2 tareas)

### T021 — Controller DTO & Mapper (sin auth real)
**Capa:** infrastructure  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/in/rest/dto/GenerateMeditationRequest.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/in/rest/dto/GenerationResponse.java`
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/in/rest/mapper/MeditationOutputDtoMapper.java`
**Criterios de aceptación:**
- [ ] Schemas alineados con OpenAPI
- [ ] Mapper sin lógica de negocio
**Evidencias:** Compila  
**Dependencias:** T003, T007

---

### T022 — Controller REST (bypass auth SOLO en test)
**Capa:** infrastructure  
**Artefactos:**
- `/backend/src/main/java/com/hexagonal/meditation/generation/infrastructure/in/rest/controller/MeditationGenerationController.java`
- `/backend/src/test/java/com/hexagonal/meditation/generation/infrastructure/in/rest/controller/MeditationGenerationControllerTest.java`
- `/backend/src/test/java/com/hexagonal/meditation/generation/infrastructure/config/TestSecurityConfig.java` (**solo en test**)
**Criterios de aceptación:**
- [ ] `@PostMapping("/api/v1/generation/meditations")` conforme a OpenAPI
- [ ] DTO → use case; excepciones → 408/400/503
- [ ] **Bypass auth** en test: mock `userId`/header simulado
- [ ] `TestSecurityConfig` **no** se empaqueta en prod
**Evidencias:** Tests controller green  
**Dependencias:** T011, T021

---

## 6. Frontend (5 tareas)

> Integración UX en la **página de Composition (BC distinto, US2)**: botón **“Generate video/podcast”**, **barra de estado “creating”** con progreso y **pantalla final** con descarga o error. Llama al endpoint del **BC Generation**.

### T023 — Frontend: regenerar cliente OpenAPI tipado
**Capa:** frontend  
**Artefactos:**
- `/frontend/src/api/...` (código autogenerado)
- `package.json` (script `generate:api` si aplica)
**Criterios de aceptación:**
- [ ] Cliente generado desde `/openapi/generation/generate-meditation.yaml`
- [ ] Tipos expuestos y reutilizables en hooks
**Evidencias:** build frontend compila  
**Dependencias:** T004

---

### T024 — Frontend: hook `useGenerateMeditation`
**Capa:** frontend  
**Artefactos:**
- `/frontend/src/hooks/useGenerateMeditation.ts`
**Criterios de aceptación:**
- [ ] API: `start({ text, musicReference, imageReference? })`
- [ ] Estado: `idle | creating | success | error`, `progress?`, `result?`, `error?`
- [ ] Soporta **llamada única** (síncrona) y **status/polling** si el backend lo requiere
- [ ] Cancela polling al desmontar
**Evidencias:** tests unitarios del hook (mock API)  
**Dependencias:** T023

---

### T025 — Frontend: barra de estado "creating"
**Capa:** frontend  
**Artefactos:**
- `/frontend/src/components/GenerationStatusBar.tsx`
- `/frontend/src/components/__tests__/GenerationStatusBar.test.tsx`
**Criterios de aceptación:**
- [ ] Render de barra/indicador con label **“creating”**
- [ ] Progreso indeterminado si no hay %, o determinado si hay `progress`
- [ ] Accesible: `aria-busy`, `aria-live="polite"`
**Evidencias:** tests RTL  
**Dependencias:** T024

---

### T026 — Frontend: integración en página de composición (US2)
**Capa:** frontend  
**Artefactos:**
- `/frontend/src/pages/MeditationBuilderPage.tsx` (BC Composition)
- `/frontend/src/components/GenerateMeditationButton.tsx`
- `/frontend/src/pages/GenerationResultPage.tsx` (o modal equivalente)
**Criterios de aceptación:**
- [ ] **Botón “Generate video/podcast”** dispara `useGenerateMeditation.start(...)` con el contenido compuesto
- [ ] Muestra **GenerationStatusBar** mientras `creating`
- [ ] **Éxito**: pantalla *“el proceso ha finalizado correctamente”* + **botón de descarga** (`href` = `mediaUrl`)
- [ ] **Error**: pantalla *“El proceso ha fallado”* con detalle del error y reintento
- [ ] Botón deshabilitado mientras `creating` (y/o idempotencia en backend)
**Evidencias:** tests de integración de componentes  
**Dependencias:** T024, T025

---

### T027 — Frontend: pruebas (unit/integration)
**Capa:** frontend  
**Artefactos:**
- `/frontend/src/components/__tests__/GenerateMeditationButton.test.tsx`
- `/frontend/src/pages/__tests__/MeditationBuilderPage.test.tsx`
- `/frontend/src/pages/__tests__/GenerationResultPage.test.tsx`
**Criterios de aceptación:**
- [ ] Click en **Generate** → estado “creating” visible → finaliza en **success**/**error**
- [ ] En éxito: se renderiza botón de **descarga** con `href` correcto (presigned URL)
- [ ] En error: se renderiza mensaje *“El proceso ha fallado”* con detalle
**Evidencias:** tests RTL/Vitest green  
**Dependencias:** T026

---

## 7. Testing Pyramid (6 tareas)

### T028 — Contract Tests (OpenAPI compliance)
**Capa:** testing  
**Artefactos:** `/backend/src/test/contracts/GenerateMeditationContractTest.java`  
**Criterios de aceptación:**
- [ ] Request/response conformes; errores 400/408/503 correctos
- [ ] **401 omitido** hasta que exista US1 (añadir luego)
**Evidencias:** Contract tests green  
**Dependencias:** T022

---

### T029 — BDD Steps Implementation (scenarios GREEN)
**Capa:** testing  
**Artefactos:**
- `/backend/src/test/java/com/hexagonal/meditation/generation/bdd/steps/GenerateMeditationSteps.java` (completar)
- `/backend/src/test/java/com/hexagonal/meditation/generation/bdd/CucumberSpringConfiguration.java`
**Criterios de aceptación:**
- [ ] Given user authenticated → bypass (mock userId)
- [ ] POST → controller; WireMock TTS verificado
- [ ] Verifica SRT, render (MP4/MP3), **upload S3 (LocalStack)** y **persistencia Postgres**
- [ ] Timeout → 408
**Evidencias:** 3 escenarios GREEN  
**Dependencias:** T001, T022, T018, T019

---

### T030 — Integration Tests Infrastructure (adapters)
**Capa:** testing  
**Artefactos:** tests de T014–T020  
**Criterios de aceptación:**
- [ ] TTS WireMock 200/429/503
- [ ] SRT correcto
- [ ] MP4/MP3 reproducibles (assets mínimos)
- [ ] **S3 LocalStack**: put/head/get presign OK
- [ ] **Postgres Testcontainers** CRUD + idempotency OK
**Evidencias:** IT/UT green  
**Dependencias:** T014–T020

---

### T031 — E2E Tests (full flow con Postgres + LocalStack S3)
**Capa:** testing  
**Artefactos:** `/backend/src/test/java/com/hexagonal/meditation/generation/e2e/GenerateMeditationE2ETest.java`  
**Criterios de aceptación:**
- [ ] Vídeo: 200 OK; `mediaUrl` presign S3; objeto existe (HEAD)
- [ ] Audio: 200 OK; `mediaUrl` presign S3; objeto existe (HEAD)
- [ ] **Duración** (`durationSeconds`) ≈ rango esperado para texto de prueba (p. ej., 1–5s)
- [ ] Persistencia en Postgres verificada; subtítulos presentes
- [ ] Idempotencia: 2ª petición → mismo `meditationId`
**Evidencias:** E2E green  
**Dependencias:** T029

---

### T032 — Unit Tests Domain (recap)
**Capa:** testing  
**Artefactos:** tests de T006–T007  
**Criterios de aceptación:** Cobertura >95% domain  
**Evidencias:** Reporte coverage  
**Dependencias:** T006–T007

---

### T033 — Unit Tests Application (recap)
**Capa:** testing  
**Artefactos:** tests de T013  
**Criterios de aceptación:** Cobertura >90% application  
**Evidencias:** Reporte coverage  
**Dependencias:** T013

---

## 8. CI/CD (1 tarea)

### T034 — CI Workflow Backend (gates + entorno)
**Capa:** ci  
**Artefactos:** `.github/workflows/backend-ci.yml`  
**Criterios de aceptación:**
- [ ] **Instalar FFmpeg** (`apt-get update && apt-get install -y ffmpeg`) y usar **Docker** del runner para **Testcontainers** (Postgres + LocalStack S3)
- [ ] Gates: BDD → API → Unit domain → Unit application → Infra IT → Contract → E2E → Build JAR
- [ ] Variables mock para tests (`GOOGLE_TTS_API_KEY=fake`, `BUCKET_NAME=meditation-outputs`)
- [ ] Limpieza de temporales si aplica
**Evidencias:** Pipeline green sin servicios externos reales  
**Dependencias:** T031

---

## Diferidas / Blocked (fuera de MVP)

### T035 — [BLOCKED BY US1] Controller con JWT real
Sustituir bypass por validación JWT; extraer `userId` de claims; activar `security` obligatorio en OpenAPI.

### T036 — [BLOCKED BY US1] E2E con JWT real
Añadir token real en Authorization; actualizar contract tests para 401.

### T037 — AWS S3 real (producción)
Configurar cuenta/bucket/IAM y apuntar el adapter a endpoint AWS real (mismos tests deberían pasar).

### T038 — CI con perfiles prod y secretos gestionados (post‑MVP)
Añadir secretos y validaciones adicionales si aplica.

### T039 — Docs: ADR TTS & FFmpeg
Registrar decisión tecnológica; prós/contras.

### T040 — i18n: Voice & Locale Config
Parametrizar voz y locale (ES/EN).

### T041 — Performance: Baseline & Smoke Test
Perfil por etapa; informe CI; alertas >30s.

### T042 — Accessibility: Subtitle Heuristics & QA
Heurísticas (longitud de línea/ruptura por frase) + QA manual.

---

## Summary

**Total MVP Tasks**: 34 (T001–T034)  
- BDD & API: 4 (T001–T004)  
- Domain: 5 (T005–T009)  
- Application: 4 (T010–T013)  
- Infrastructure (TTS/Render/**S3**/Repo): 9 (T014–T020; incluye T018.1 y T018.2)  
- Controllers: 2 (T021–T022)  
- Frontend: 5 (T023–T027)  
- Testing: 6 (T028–T033)  
- CI/CD: 1 (T034)

**Diferidas/Bloqueadas**: 8 (T035–T042)  
- Bloqueadas por US1: 2 (T035–T036)  
- Post‑MVP: 6 (T037–T042)

**MVP Completion Criteria**
- ✅ BDD 3 scenarios GREEN  
- ✅ OpenAPI contract (BC Generation) validado  
- ✅ Domain inmutable (TDD)  
- ✅ Use case con idempotencia  
- ✅ Infra: TTS (WireMock), Render (FFmpeg), **Storage S3 (LocalStack; prefijo `generation/`)**, Repo Postgres real (**schema `generation`**)  
- ✅ Controller con bypass auth SOLO en test  
- ✅ **Frontend** (en BC Composition/US2): botón “Generate video/podcast”, **barra “creating”** con progreso, pantalla **éxito con descarga** o **error** con detalle  
- ✅ Contract + E2E green (Testcontainers: Postgres + LocalStack)  
- ✅ CI gates green (BDD → E2E) y build JAR

---

**END OF TASKS**