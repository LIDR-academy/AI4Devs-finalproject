# Implementation Plan: Generate Guided Meditation (Video/Podcast) with Narration

**Feature Branch**: `002-generate-meditation-audio-video`  
**Bounded Context**: **Generation** (separado de Composition/US2 y Playback/US4)  
**Created**: February 12, 2026  
**Status**: Draft (refinado)  
**Based on**: `specs/002-generate-meditation-audio-video/spec.md`  
**Governed by**: `.specify/memory/constitution.md`, `.specify/instructions/*`

---

## 0. Plan Overview

### Purpose
Descomponer **US3 — Generate Guided Meditation** en tickets secuenciales según la arquitectura hexagonal definida en la Constitution. Cada ticket afecta **una sola capa**, define criterios de aceptación, artefactos esperados y evidencia de validación.

### Scope
- **In scope**: Backend BC **Generation** para generación de contenido con narración profesional, subtítulos sincronizados y renderizado de audio/vídeo.
- **In scope**: Integraciones externas (narración, renderizado, almacenamiento).
- **In scope**: **Postgres real** (Docker + Testcontainers con schema `generation`) y **S3 LocalStack** (Docker + Testcontainers con prefijo `generation/`).
- **In scope**: Pirámide de tests completa (unit → integration → contract → E2E) y CI gates.
- **In scope**: Frontend integrado en **página de Composition (BC distinto/US2)** llamando al endpoint del **BC Generation**.
- **Out of scope**: JWT real (bloqueado por US1 → bypass solo en test).
- **Out of scope**: Streaming de progreso, batch/queue, edición manual.

### Success Criteria
- ✅ 3 escenarios BDD en verde (vídeo, audio, timeout).  
- ✅ Dominio inmutable y testeado (TDD).  
- ✅ Puertos definidos e implementados por adapters.  
- ✅ Metadatos persistidos, outputs accesibles de forma segura.  
- ✅ Procesamiento dentro del tiempo acordado.  
- ✅ CI gates todos en verde (BDD → API → Unit → Infra → Contract → E2E).

---

## 1. Technical Context & Decisions

### Arquitectura base (Hexagonal)
- **Domain**: modelos, invariantes, *ports* `in/out`.
- **Application**: orquestación (sin reglas de negocio).
- **Infrastructure**: adapters a servicios externos.
- **Controllers**: traducción HTTP (sin lógica).

### Decisiones técnicas (propias de plan)
**Narración**  
- Servicio: Google Cloud Text‑to‑Speech  
- Voz objetivo: `es-ES-Neural2-Diana` (calmada)  
- `speakingRate` aprox.: `0.85` (pacing de meditación)  
- Port: **VoiceSynthesisPort** → `GoogleTtsAdapter`

**Renderizado**  
- Motor: FFmpeg (contenedorizado)  
- Vídeo: imagen fija + voz + música + subtítulos “quemados” → **MP4**  
- Audio: voz + música equilibradas → **MP3**  
- Puertos: **VideoRenderingPort** → `FfmpegVideoRendererAdapter`  
            **AudioRenderingPort** → `FfmpegAudioRendererAdapter`

**Subtitulado**  
- Formato base: SRT (sin imponerlo en spec)  
- Fuente de *timings*: metadatos de narración  
- Port: **SubtitleSyncPort** → `SubtitleSyncService` (infra)

**Almacenamiento**  
- Outputs generados: AWS S3 (bucket `meditation-outputs`, prefijo **`generation/`**)  
- **MVP**: **LocalStack S3** (Docker local + Testcontainers tests)  
- URLs de acceso: firmadas (TTL configurable)  
- Port: **MediaStoragePort** → `S3MediaStorageAdapter`

**Persistencia**  
- Postgres (Docker local + Testcontainers tests) con **schema `generation`** / tabla `meditation`  
- Migraciones: Flyway `V002__create_generation_meditation.sql`  
- Port: **ContentRepositoryPort** → `PostgresMeditationRepository`  
- **Cohesión con US2**: reutilizar `MeditationComposition` como **entrada**; `MeditationOutput` **referencia** `compositionId`. Mantener **fotografía del texto** en Output para trazabilidad.

**Autenticación**  
- JWT (US1) **[BLOCKED]**. Controllers validan y extraen `userId` en producción.  
- **MVP**: Bypass de auth **solo en test** (`TestSecurityConfig` no empaquetado en prod).

**Políticas de tiempo e idempotencia**  
- Timeout funcional objetivo: **30s**.  
- Pre‑estimación con `TextLengthEstimator` (rechazo temprano).  
- **Idempotency key**: hash derivado de (`userId`, `text`, `music`, `image`) para evitar dobles renders.

**Temporales**  
- Política de **carpetas temporales por request** y **limpieza garantizada**.

**Observabilidad mínima (Micrometer)**  
- Contadores/timers por etapa (tts, render, upload) y errores tipificados.

---

## 2. Constitution Compliance Check

### Jerarquía normativa
1. ✅ **User Story + BDD (spec.md)** gobiernan capacidades.  
2. ✅ **Constitution**: hexagonal, SDD, API First.  
3. ✅ **Playbooks**: pipeline fase a fase.  
4. ✅ **Guidelines/Java21**: records, UUID, Clock, Optional.  
5. ✅ **Hexagonal Guide**: separación estricta.  
6. ✅ **Testing instructions**: pirámide completa.

### Ubicaciones obligatorias (BC: Generation)
/backend/src/main/java/com/hexagonal/meditation/generation/
domain/                    # models / ports / exceptions / enums
application/               # use cases / validators
infrastructure/
in/rest/                 # controllers / dto / mapper
out/                     # adapters (tts, rendering, storage, persistence, subtitle)
...
/backend/src/main/resources/openapi/generation/
generate-meditation.yaml   # contrato (fase previa a controller)
/backend/src/test/resources/features/generation/
generate-meditation.feature
/backend/src/test/java/com/hexagonal/meditation/generation/
domain/ application/ infrastructure/ bdd/steps/ e2e/ ...

### CI gates (bloqueantes)
`BDD → API → Unit(Domain) → Unit(Application) → Infra(Integration) → Contract → E2E → Build`

---

## 3. Phase Breakdown (Backend Pipeline)

### Phase 0 — Pre‑checks & Research
- ✅ US1 (JWT) y US2 (composición) disponibles.
- ✅ Secrets y recursos: TTS key, S3 bucket, Postgres, FFmpeg.
- **Research**: cuotas Google TTS, parámetros FFmpeg óptimos, heurísticas de SRT, TTL de Signed URLs, costes S3, pooling DB.

### Phase 1 — BDD First
- **Deliverables**: `.feature` con 3 escenarios (vídeo, audio, timeout) en **ROJO**.  
- **Ubicación**: `/backend/src/test/resources/features/generation/generate-meditation.feature`.

### Phase 2 — Capability Sketch (API First mínimo)
- Documento de **capacidades** derivadas de BDD (sin paths HTTP aún).  
  - “Generar meditación” (inputs negocio, output negocio)  
  - “Consultar estado de generación” (si aplica).  
- El YAML **completo** se definirá en **Phase 6 (API First concreta)**.

### Phase 3 — Domain (DDD + TDD)
**Modelos**  
- `MeditationOutput` (record): id, compositionId, userId, type(AUDIO/VIDEO), textSnapshot, musicRef, imageRefOpt, mediaUrlOpt, subtitleUrlOpt, durationSecondsOpt, status, createdAt, updatedAt.  
- `NarrationScript` (VO), `SubtitleSegment` (VO), `MediaReference` (VO).  
- `MediaType`, `GenerationStatus`.

**Reglas**  
- Derivación de type por presencia de imagen (regla previa vigente).  
- Pre‑estimación de duración/tiempo; rechazo si >30s.  
- Subtítulos alineados a *timings* de narración.  
- Inmutabilidad (records, withX), Clock inyectado, Optional accessors.

**Ports (domain)**  
- **In**: `GenerateMeditationContentUseCase`.  
- **Out**: `VoiceSynthesisPort`, `SubtitleSyncPort`, `VideoRenderingPort`, `AudioRenderingPort`, `MediaStoragePort`, `ContentRepositoryPort`.  
- **Reutilización US2**: **MediaCatalogPort** (para música) se **reusa**; no crear `MusicPort` nuevo.

### Phase 4 — Application (Use Case)
- `GenerateMeditationContentService` (orquestación pura).  
- `TextLengthEstimator` (pre‑estimación determinista).  
- Secuencia (feliz): validar → estimar → voz → subtítulos → (vídeo|audio) → almacenar → persistir → return.  
- Manejo de errores/timeout → excepciones de dominio.  
- Pruebas unitarias con mocks de ports.

### Phase 5 — Infrastructure (Adapters Out)
- `GoogleTtsAdapter`  → `VoiceSynthesisPort` (retry 429, map 503; WireMock en tests).  
- `SubtitleSyncService` → `SubtitleSyncPort` (SRT a partir de timings).  
- `FfmpegVideoRendererAdapter` → `VideoRenderingPort` (assets mínimos en IT).  
- `FfmpegAudioRendererAdapter` → `AudioRenderingPort` (assets mínimos en IT).  
- `S3MediaStorageAdapter` → `MediaStoragePort` (**LocalStack Docker + Testcontainers**; prefijo `generation/`; Signed URL TTL).  
- `PostgresMeditationRepository` → `ContentRepositoryPort` (**Postgres Docker + Testcontainers**; schema `generation`; Flyway `V002__create_generation_meditation.sql`).  
- **TempFilesPolicy**: carpeta temporal por request y cleanup robusto.  
- **Observability**: contadores/timers por adapter + errores.

### Phase 6 — API First (Contrato concreto)
- Definir **YAML completo** (`generate-meditation.yaml`) con paths, request/response y errores (`400/408/503`).  
- **401 omitido** hasta que US1 (JWT) esté implementado; en test se permite `security: []`.  
- Lint OK. Base para generación de cliente frontend.

### Phase 7 — Controllers (REST Adapters In)
- `MeditationGenerationController`: mapea DTO ⇄ comando, sin lógica.  
- **Auth bypass solo en test** (`TestSecurityConfig` no empaquetado).  
- Tests de controller (use case mockeado).

### Phase 8 — Contract Tests
- Validar implementación contra OpenAPI (Atlassian validator).

### Phase 9 — E2E Tests
- Arranque Spring Boot (perfil test), WireMock (TTS), **Testcontainers (Postgres + LocalStack S3)**, FFmpeg disponible.  
- Validar: vídeo, audio, timeout, persistencia en **schema `generation`**, URLs firmadas de **S3 LocalStack** y duración estimada.

### Phase 10 — CI/CD Gates
- Integrar gates y secretos, FFmpeg en runner, servicios test (Postgres/S3).

---

## 4. Implementation Tickets (Sequential) — 34 MVP Tasks

> **Formato por ticket**: *ID & título · Propósito · Alcance · Criterios de aceptación · Artefactos · Evidencia · Dependencias · DoD.*  
> **Hard Limits**: 34 tareas MVP (T001–T034, con T018.1/T018.2 sub-tareas); 8 diferidas/bloqueadas (T035–T042).

### T001-T004 — Phase 1: BDD & API First

**T001 — BDD Feature File (3 scenarios RED)**  
- **Propósito**: Definir comportamiento observable en estado PENDING.  
- **Criterios**: 3 escenarios del spec (vídeo, audio, timeout); lenguaje 100% negocio.  
- **Artefactos**:  
  - `/backend/src/test/resources/features/generation/generate-meditation.feature`  
  - `/backend/src/test/java/com/hexagonal/meditation/generation/bdd/steps/GenerateMeditationSteps.java` (stubs con `PendingException`)  
- **Evidencia**: Cucumber detecta 3 PENDING.  
- **DoD**: 3 escenarios en PENDING legibles por PO/QA.

**T002 — OpenAPI Contract (capabilities + schemas)**  
- **Propósito**: Contrato OpenAPI del BC Generation.  
- **Artefactos**: `/backend/src/main/resources/openapi/generation/generate-meditation.yaml`  
- **Criterios**: Request (text, musicReference, imageReference opt); Response (meditationId, type, mediaUrl, status, message); Errores 400/408/503; bearerAuth definido pero `security: []` en test.  
- **Evidencia**: Lint OK.  
- **Dependencias**: T001.

**T003 — OpenAPI Paths & Operations**  
- **Propósito**: Definir path/operación HTTP del BC Generation.  
- **Criterios**: Path `/api/v1/generation/meditations`; método POST; operationId `generateMeditationContent`; schemas en components.  
- **Evidencia**: Validator OK.  
- **Dependencias**: T002.

**T004 — Validate OpenAPI & Generate Stubs**  
- **Propósito**: Validar contrato; generar DTOs si procede.  
- **Criterios**: `openapi-generator validate` pasa; sin breaking vs T002/T003.  
- **Evidencia**: Build Maven green.  
- **Dependencies**: T003.

### T005-T009 — Phase 2: Domain Layer

**T005 — Domain Enums (MediaType, GenerationStatus)**  
- **Artefactos**: `MediaType.java`, `GenerationStatus.java` (AUDIO/VIDEO; PROCESSING/COMPLETED/FAILED/TIMEOUT).  
- **Evidencia**: Tests simples green.  
- **Dependencias**: —

**T006 — Domain Value Objects (NarrationScript, SubtitleSegment, MediaReference)**  
- **Criterios**: Records Java 21 con validación en compact constructor; `SubtitleSegment` sin solapes.  
- **Artefactos**: `NarrationScript.java`, `SubtitleSegment.java`, `MediaReference.java` + tests.  
- **Evidencia**: TDD green.  
- **Dependencias**: T005.

**T007 — Domain Aggregate (MeditationOutput)**  
- **Criterios**: Record con id, compositionId, userId, type, textSnapshot, musicRef, imageRefOpt, mediaUrlOpt, subtitleUrlOpt, durationSecondsOpt, status, createdAt, updatedAt; factories `createAudio/createVideo`; Clock inyectado; Optional en campos no obligatorios.  
- **Evidencia**: TDD >95% domain.  
- **Dependencias**: T006.

**T008 — Domain Ports (in/out)**  
- **Criterios**: `GenerateMeditationContentUseCase` (in); `VoiceSynthesisPort`, `SubtitleSyncPort`, `VideoRenderingPort`, `AudioRenderingPort`, `MediaStoragePort`, `ContentRepositoryPort` (out); **Reutiliza `MediaCatalogPort` de BC Composition/US2** (no crear `MusicPort`).  
- **Evidencia**: Compila sin dependencias de framework.  
- **Dependencias**: T007.

**T009 — Domain Exceptions (GenerationTimeout, InvalidContent)**  
- **Criterios**: RuntimeException con mensajes claros.  
- **Evidencia**: Compila.  
- **Dependencias**: —

### T010-T013 — Phase 3: Application Layer

**T010 — Application Validator (TextLengthEstimator)**  
- **Criterios**: `estimateProcessingTime(text)` con heurística conservadora (~150 wpm + overhead); umbral configurable (default 30s).  
- **Evidencia**: Unit tests green.  
- **Dependencias**: T007.

**T011 — Application Use Case (GenerateMeditationContentService)**  
- **Criterios**: Implementa `GenerateMeditationContentUseCase`; orquesta validar → estimar → TTS → subtítulos → (vídeo|audio) → store → persist; mapea errores a excepciones de dominio.  
- **Evidencia**: Compila.  
- **Dependencias**: T008, T010.

**T012 — Application Idempotency Guard**  
- **Criterios**: `idempotencyKey = SHA-256(userId|text|musicRef|imageRefOpt)`; consulta previa `ContentRepositoryPort.findByIdempotencyKey`.  
- **Evidencia**: Tests en T013.  
- **Dependencias**: T011.

**T013 — Application Unit Tests (orchestration + idempotency)**  
- **Criterios**: Happy path vídeo/audio; timeout; idempotencia; errores TTS/Render/Storage mapeados; Mockito verifica secuencia.  
- **Evidencia**: Cobertura >90% application.  
- **Dependencias**: T012.

### T014-T020 — Phase 4: Infrastructure (MVP) — TTS/Render/S3/Repo

**T014 — Infra Adapter: GoogleTtsAdapter (VoiceSynthesisPort)**  
- **Criterios**: Voz `es-ES-Neural2-Diana`, rate ~0.85; retry 429 (x3); 503 → excepción dominio; métricas `tts.requests.total`, `tts.latency`, `tts.error.*`.  
- **Evidencia**: IT WireMock 200/429/503 green.  
- **Dependencias**: T008.

**T015 — Infra Service: SubtitleSyncService (SubtitleSyncPort)**  
- **Criterios**: Genera SRT (índice, hh:mm:ss,mmm, texto); sin overlaps; precisión <200ms; métricas básicas.  
- **Evidencia**: Unit tests green.  
- **Dependencias**: T008.

**T016 — Infra Adapter: FfmpegVideoRendererAdapter (VideoRenderingPort)**  
- **Criterios**: Comando determinista; 48kHz stereo 1280x720; amix voz primaria / música approx. −12dB; subtítulos "burned"; métricas `render.video.latency`, `render.video.error.*`; IT con assets mínimos (PNG 640×360; audios 1–2s).  
- **Evidencia**: MP4 reproducible; IT green.  
- **Dependencias**: T008.

**T017 — Infra Adapter: FfmpegAudioRendererAdapter (AudioRenderingPort)**  
- **Criterios**: Comando determinista; 48kHz stereo; mezcla estable (amix/loudnorm simple); assets mínimos; métricas `render.audio.latency`, `render.audio.error.*`.  
- **Evidencia**: MP3 reproducible; IT green.  
- **Dependencias**: T008.

**T018 — Infra Adapter: S3MediaStorageAdapter (MediaStoragePort)**  
- **Criterios**: Bucket `${BUCKET_NAME:meditation-outputs}`; clave S3 con **prefijo BC `generation/{userId}/{meditationId}/(video.mp4|audio.mp3|subs.srt)`**; upload `PutObjectRequest`; Signed URL (TTL configurable); **IT LocalStack (Testcontainers)**: create bucket, put, head, get presign; métricas `storage.uploads.total`, `storage.latency`, `storage.error.*`.  
- **Evidencia**: IT green.  
- **Dependencias**: T008.

**T018.1 — Docker Compose: Postgres + LocalStack (desarrollo local)**  
- **Criterios**: `docker compose up -d` levanta Postgres (5432) y LocalStack (4566); perfil `local` apunta a Postgres y S3 LocalStack; Flyway migra al arrancar; script/init crea bucket `meditation-outputs`.  
- **Evidencia**: App `local` levanta, migra y crea bucket.  
- **Dependencias**: T019, T018.

**T018.2 — Testcontainers: LocalStack S3 (tests)**  
- **Criterios**: Inicia LocalStack S3 en tests; registra `endpointOverride` en AWS SDK; crea bucket `meditation-outputs` en setup.  
- **Evidencia**: Tests de S3 (T018) y E2E (T031) usan LocalStack.  
- **Dependencias**: T018.

**T019 — Infra Repository: PostgresMeditationRepository (ContentRepositoryPort)**  
- **Criterios**: **Schema `generation`** y tabla `meditation`; `@Table(name="meditation", schema="generation")`; repo `save`, `findById`, `findByUserId`, **`findByIdempotencyKey`**; Flyway aplica `V002__create_generation_meditation.sql`; **Testcontainers Postgres** para IT.  
- **Evidencia**: IT green; migración aplicada; CRUD + idempotency OK.  
- **Dependencias**: T008.

**T020 — Infra Util: TempFileManager (cleanup policy)**  
- **Criterios**: `createTempDir(requestId)` bajo `${java.io.tmpdir}/meditations`; `cleanup(path)` elimina archivos/directorios; garantía de limpieza (try-with-resources / finally).  
- **Evidencia**: Tests sin fugas de ficheros.  
- **Dependencias**: —

### T021-T022 — Phase 5: Controllers

**T021 — Controller DTO & Mapper (sin auth real)**  
- **Criterios**: Schemas alineados con OpenAPI; mapper sin lógica de negocio.  
- **Evidencia**: Compila.  
- **Dependencias**: T003, T007.

**T022 — Controller REST (bypass auth SOLO en test)**  
- **Criterios**: `@PostMapping("/api/v1/generation/meditations")` conforme a OpenAPI; DTO → use case; excepciones → 408/400/503; **bypass auth en test** (mock userId/header simulado); `TestSecurityConfig` **no** se empaqueta en prod.  
- **Evidencia**: Tests controller green.  
- **Dependencias**: T011, T021.

### T023-T027 — Phase 6: Frontend

**T023 — Frontend: regenerar cliente OpenAPI tipado**  
- **Criterios**: Cliente generado desde `/openapi/generation/generate-meditation.yaml`; tipos expuestos y reutilizables en hooks.  
- **Evidencia**: build frontend compila.  
- **Dependencias**: T004.

**T024 — Frontend: hook useGenerateMeditation**  
- **Criterios**: API `start({ text, musicReference, imageReference? })`; estado `idle | creating | success | error`, `progress?`, `result?`, `error?`; soporta llamada única (síncrona) y status/polling; cancela polling al desmontar.  
- **Evidencia**: tests unitarios del hook (mock API).  
- **Dependencias**: T023.

**T025 — Frontend: barra de estado "creating"**  
- **Criterios**: Render de barra/indicador con label "creating"; progreso indeterminado o determinado; accesible (`aria-busy`, `aria-live="polite"`).  
- **Evidencia**: tests RTL.  
- **Dependencias**: T024.

**T026 — Frontend: integración en página de composición (US2)**  
- **Criterios**: Botón "Generate video/podcast" dispara `useGenerateMeditation.start(...)`; muestra `GenerationStatusBar` mientras `creating`; éxito: pantalla final + botón de descarga (`href` = `mediaUrl`); error: pantalla fallo + detalle + reintento; botón deshabilitado mientras `creating`.  
- **Evidencia**: tests de integración de componentes.  
- **Dependencias**: T024, T025.

**T027 — Frontend: pruebas (unit/integration)**  
- **Criterios**: Click en Generate → estado "creating" → finaliza en success/error; en éxito: botón descarga con `href` correcto (presigned URL); en error: mensaje fallo con detalle.  
- **Evidencia**: tests RTL/Vitest green.  
- **Dependencias**: T026.

### T028-T033 — Phase 7: Testing Pyramid

**T028 — Contract Tests (OpenAPI compliance)**  
- **Criterios**: Request/response conformes; errores 400/408/503 correctos; **401 omitido** hasta US1.  
- **Evidencia**: Contract tests green.  
- **Dependencias**: T022.

**T029 — BDD Steps Implementation (scenarios GREEN)**  
- **Criterios**: Given user authenticated → bypass (mock userId); POST → controller; WireMock TTS verificado; verifica SRT, render (MP4/MP3), **upload S3 (LocalStack)**, **persistencia Postgres**; timeout → 408.  
- **Evidencia**: 3 escenarios GREEN.  
- **Dependencias**: T001, T022, T018, T019.

**T030 — Integration Tests Infrastructure (adapters)**  
- **Criterios**: TTS WireMock 200/429/503; SRT correcto; MP4/MP3 reproducibles (assets mínimos); **S3 LocalStack** put/head/get presign OK; **Postgres Testcontainers** CRUD + idempotency OK.  
- **Evidencia**: IT/UT green.  
- **Dependencias**: T014–T020.

**T031 — E2E Tests (full flow con Postgres + LocalStack S3)**  
- **Criterios**: Vídeo 200 OK; `mediaUrl` presign S3; objeto existe (HEAD); Audio 200 OK; **duración (`durationSeconds`) ≈ rango esperado**; persistencia en Postgres verificada; subtítulos presentes; idempotencia: 2ª petición → mismo `meditationId`.  
- **Evidencia**: E2E green.  
- **Dependencias**: T029.

**T032 — Unit Tests Domain (recap)**  
- **Criterios**: Cobertura >95% domain.  
- **Evidencia**: Reporte coverage.  
- **Dependencias**: T006–T007.

**T033 — Unit Tests Application (recap)**  
- **Criterios**: Cobertura >90% application.  
- **Evidencia**: Reporte coverage.  
- **Dependencias**: T013.

### T034 — Phase 8: CI/CD

**T034 — CI Workflow Backend (gates + entorno)**  
- **Criterios**: **Instalar FFmpeg** (`apt-get update && apt-get install -y ffmpeg`); usar **Docker** del runner para **Testcontainers** (Postgres + LocalStack S3); gates: BDD → API → Unit domain → Unit application → Infra IT → Contract → E2E → Build JAR; variables mock (`GOOGLE_TTS_API_KEY=fake`, `BUCKET_NAME=meditation-outputs`); limpieza de temporales.  
- **Evidencia**: Pipeline green sin servicios externos reales.  
- **Dependencias**: T031.

## Diferidas / Blocked (fuera de MVP)

**T035 — [BLOCKED BY US1] Controller con JWT real**  
Sustituir bypass por validación JWT; extraer `userId` de claims; activar `security` obligatorio en OpenAPI.

**T036 — [BLOCKED BY US1] E2E con JWT real**  
Añadir token real en Authorization; actualizar contract tests para 401.

**T037 — AWS S3 real (producción)**  
Configurar cuenta/bucket/IAM y apuntar el adapter a endpoint AWS real (mismos tests deberían pasar).

**T038 — CI con perfiles prod y secretos gestionados (post‑MVP)**  
Añadir secretos y validaciones adicionales si aplica.

**T039 — Docs: ADR TTS & FFmpeg**  
Registrar decisión tecnológica; prós/contras.

**T040 — i18n: Voice & Locale Config**  
Parametrizar voz y locale (ES/EN).

**T041 — Performance: Baseline & Smoke Test**  
Perfil por etapa; informe CI; alertas >30s.

**T042 — Accessibility: Subtitle Heuristics & QA**  
Heurísticas (longitud de línea/ruptura por frase) + QA manual.

---

## 5. Dependency Map (34 MVP Tasks)
T001 (BDD RED)
↓
T002-T004 (OpenAPI)
↓
T005-T007 (Domain Enums/VOs/Aggregate) → T008 (Ports) → T009 (Exceptions)
↓                                       ↘
T010 (Estimator) → T011 (Use Case) → T012 (Idempotency) → T013 (App Tests)
↓
T014 (TTS) T015 (Subtitle) T016 (Video) T017 (Audio) T018 (S3) T019 (Repo) T020 (TempFiles)
│                                                        │           │
└─── T018.1 (Docker Compose) ────────────────────────┘           │
     T018.2 (Testcontainers S3) ───────────────────────────────┘
↓
T021 (DTO/Mapper) → T022 (Controller)
↓
T023 (Frontend API) → T024 (Hook) → T025 (StatusBar) → T026 (Integration) → T027 (Tests)
↓
T028 (Contract) → T029 (BDD GREEN) → T030 (Infra IT recap) → T031 (E2E) → T032-T033 (Coverage)
↓
T034 (CI/CD)
↓
[DEFERRED/BLOCKED] T035-T042

---

## 6. Validation Matrix (gates)

| Ticket | Test Type | Evidence | Gate |
|---|---|---|---|
| T001 | BDD (RED) | 3 scenarios pending | BDD |
| T002-T004 | Lint | OpenAPI válido | API |
| T005-T009 | Unit/Compile | Domain >95% cov; ports sin deps ext | Unit |
| T010-T013 | Unit (Mock) | Orquestación >90% cov | Unit |
| T014 | Integration (WireMock) | TTS IT green | Infra |
| T015 | Unit+Integration | SRT correcto y alineado | Infra |
| T016 | Integration | MP4 válido + subs visibles | Infra |
| T017 | Integration | MP3 válido, mezcla correcta | Infra |
| T018 | Integration (LocalStack) | Upload + Signed URL | Infra |
| T018.1 | Docker Compose | App local levanta | — |
| T018.2 | Testcontainers | LocalStack S3 disponible | — |
| T019 | Integration (Testcontainers) | Repo OK + migración | Infra |
| T020 | Unit | Cleanup temporales | Unit |
| T021-T022 | Unit (Mock) | Controller OK | Unit |
| T023-T027 | Front unit/integration | API/hook/componentes OK | Front |
| T028 | Contract | OpenAPI compliance | Contract |
| T029 | BDD (GREEN) | 3 escenarios pasan | BDD |
| T030 | Integration | Infra adapters recap | Infra |
| T031 | E2E | Flujo integrado | E2E |
| T032-T033 | Coverage | Domain >95%, App >90% | Unit |
| T034 | CI | Gates en verde | Build |
| T035-T042 | N/A | Diferidas/bloqueadas | — |

---

## 7. Technical Risks & Mitigations (refinado)

- **Rate limits TTS** → retry exponencial + observabilidad + backoff; mensajes claros.  
- **Variabilidad FFmpeg** → pre‑estimación conservadora + perf profile + límites.  
- **S3 fallos** → reintentos, semántica transaccional (marcar FAILED), alertas.  
- **Drift subtítulos** → timings de TTS como fuente; validación sin solapes; QA spot‑check.  
- **Costes S3** → políticas de ciclo de vida, compresión, dashboards de coste.  
- **Pool DB** → tamaño/pool, timeouts y health checks.  
- **Duplicados** → *idempotency key* y reuso de resultados.

---

## 8. Performance & Cost (targets no contractuales)

- Objetivos por etapa: TTS 3–8s; render vídeo 5–15s; audio 2–5s; S3 1–3s.  
- Total típico (5 min guion): 15–25s.  
- Coste estimado por meditación: bajo (TTS+S3).

---

## 9. Security & Compliance (resumen operativo)

- JWT obligatorio; acceso a outputs propio del usuario.  
- DB cifrado en reposo; S3 privado + Signed URLs (TTL); no loggear URLs completas.  
- Validaciones de entrada; rate‑limit; HTTPS prod; CORS adecuado.  
- Secrets por entorno; rotación; sin volcados en logs.

---

## 10. Operational Readiness

- **Env vars**: `GOOGLE_TTS_*`, `AWS_*`, `DB_*`, `GENERATION_TIMEOUT_SECONDS`, `FFMPEG_*`.  
- **Health checks**: DB/S3/TTS/FFmpeg.  
- **Observabilidad**: contadores/timers/errores; dashboards mínimos; alertas (éxito <95%, latencia >25s, rate limit TTS, fallos S3).

---

## 11. Definition of Done (Feature‑Level)

**34 tareas MVP (T001–T034) completas:**
- ✅ BDD 3 scenarios GREEN (T001, T029)  
- ✅ OpenAPI contract (BC Generation) validado (T002-T004)  
- ✅ Domain inmutable (TDD >95% cov) (T005-T009, T032)  
- ✅ Use case con idempotencia (T010-T013, T033)  
- ✅ Infra: TTS (WireMock), Render (FFmpeg), **Storage S3 (LocalStack; prefijo `generation/`)**, Repo Postgres real (**schema `generation`**) (T014-T020, T030)  
- ✅ Controller con bypass auth SOLO en test (T021-T022)  
- ✅ **Frontend** (en BC Composition/US2): botón "Generate video/podcast", **barra "creating"** con progreso, pantalla **éxito con descarga** o **error** con detalle (T023-T027)  
- ✅ Contract + E2E green (Testcontainers: Postgres + LocalStack) (T028, T031)  
- ✅ CI gates green (BDD → E2E) y build JAR (T034)

**8 tareas diferidas/bloqueadas (T035–T042):**
- 🚫 T035-T036: Bloqueadas por US1 (JWT real)  
- 📅 T037-T042: Post-MVP (S3 prod, CI prod, ADR, i18n, performance, accessibility)

---

## 12. Future Enhancements (out of scope)

- Generación asíncrona + polling/WS, cancelación y reintentos.  
- Selección de voces y locales; controles finos de mezcla.  
- Previsualización y edición de subtítulos.  
- Analítica y A/B de estilos.  
- Optimización de coste con caching/compresión/CDN.

---

## 13. References

- Constitution & Playbooks: `.specify/memory/constitution.md`, `.specify/instructions/*`  
- Specs: `specs/002-generate-meditation-audio-video/spec.md`, `specs/002-generate-meditation-audio-video/tasks.md`  
- Docs externas: Google TTS, FFmpeg, SRT, AWS S3 SDK.

---

**END OF PLAN — 34 MVP Tasks + 8 Deferred/Blocked**