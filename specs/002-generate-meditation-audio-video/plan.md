# Implementation Plan: Generate Guided Meditation (Video/Podcast) with Narration

**Feature Branch**: `002-generate-meditation-audio-video`  
**Created**: February 12, 2026  
**Status**: Draft (refinado)  
**Based on**: `specs/US3/spec.md`  
**Governed by**: `.specify/memory/constitution.md`, `.specify/instructions/*`

---

## 0. Plan Overview

### Purpose
Descomponer **US3 — Generate Guided Meditation** en tickets secuenciales según la arquitectura hexagonal definida en la Constitution. Cada ticket afecta **una sola capa**, define criterios de aceptación, artefactos esperados y evidencia de validación.

### Scope
- **In scope**: Backend para generación de contenido con narración profesional, subtítulos sincronizados y renderizado de audio/vídeo.
- **In scope**: Integraciones externas (narración, renderizado, almacenamiento).
- **In scope**: Pirámide de tests completa (unit → integration → contract → E2E) y CI gates.
- **Out of scope**: Cambios de UI (solo integración mínima si se solicita).
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
- Outputs generados: AWS S3 (`meditation-outputs/`)  
- URLs de acceso: firmadas (TTL configurable)  
- Port: **MediaStoragePort** → `S3MediaStorageAdapter`

**Persistencia**  
- Postgres / migraciones con Flyway  
- Port: **ContentRepositoryPort** → `PostgresMeditationRepository`  
- **Cohesión con US2**: reutilizar `MeditationComposition` como **entrada**; `MeditationOutput` **referencia** `compositionId`. Mantener **fotografía del texto** en Output para trazabilidad.

**Autenticación**  
- JWT (US1). Controllers validan y extraen `userId`.

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

### Ubicaciones obligatorias
/backend/src/main/java/com/hexagonal/meditationbuilder/
domain/                    # models / ports / exceptions / enums
application/               # use cases / validators
infrastructure/
in/rest/                 # controllers / dto / mapper
out/                     # adapters (tts, rendering, storage, persistence, subtitle)
...
/backend/src/main/resources/openapi/meditationbuilder/
generate-meditation.yaml   # contrato (fase previa a controller)
/backend/src/test/resources/features/meditationbuilder/
generate-meditation.feature
/backend/src/test/java/com/hexagonal/meditationbuilder/
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
- **Ubicación**: `/backend/src/test/resources/features/meditationbuilder/generate-meditation.feature`.

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
- `GoogleTtsAdapter`  → `VoiceSynthesisPort` (retry 429, map 503).  
- `SubtitleSyncService` → `SubtitleSyncPort` (SRT a partir de timings).  
- `FfmpegVideoRendererAdapter` → `VideoRenderingPort`.  
- `FfmpegAudioRendererAdapter` → `AudioRenderingPort`.  
- `S3MediaStorageAdapter` → `MediaStoragePort` (Signed URL TTL, carpeta `userId/meditationId/`).  
- `PostgresMeditationRepository` → `ContentRepositoryPort` (Flyway para schema).  
- **TempFilesPolicy**: carpeta temporal por request y cleanup robusto.  
- **Observability**: contadores/timers por adapter + errores.

### Phase 6 — API First (Contrato concreto)
- Definir **YAML completo** (`generate-meditation.yaml`) con paths, request/response y errores (`400/401/408/503`).  
- Lint OK. Base para generación de cliente frontend.

### Phase 7 — Controllers (REST Adapters In)
- `MeditationGenerationController`: valida JWT, mapea DTO ⇄ comando, sin lógica.  
- Tests de controller (use case mockeado).

### Phase 8 — Contract Tests
- Validar implementación contra OpenAPI (Atlassian validator).

### Phase 9 — E2E Tests
- Arranque Spring Boot (perfil test), WireMock (TTS), LocalStack (S3), Testcontainers (Postgres), FFmpeg disponible.  
- Validar: vídeo, audio, timeout, persistencia y URLs firmadas.

### Phase 10 — CI/CD Gates
- Integrar gates y secretos, FFmpeg en runner, servicios test (Postgres/S3).

---

## 4. Implementation Tickets (Sequential)

> **Formato por ticket**: *ID & título · Propósito · Alcance · Criterios de aceptación · Artefactos · Evidencia · Dependencias · DoD.*

### US3-01 — BDD Feature File & Scenarios (RED)
- **Propósito**: Definir comportamiento observable.  
- **Criterios**: 3 escenarios del spec, lenguaje negocio, pending.  
- **Artefactos**:  
  - `/backend/src/test/resources/features/meditationbuilder/generate-meditation.feature`  
  - `/backend/src/test/java/.../bdd/steps/GenerateMeditationSteps.java` (stubs)  
- **Evidencia**: Cucumber detecta 3 PENDING.  
- **DoD**: CI gate BDD ejecuta en rojo.

### US3-02 — Domain Model (MeditationOutput + VO/Enums)
- **Propósito**: Modelo inmutable con invariantes + fotos de entrada.  
- **Criterios**: Records, Clock, Optional accessors, TDD 100% reglas.  
- **Artefactos**: records/enums/exceptions; tests TDD.  
- **DoD**: sin dependencias de framework; green.

### US3-03 — Domain Ports
- **Propósito**: Interfaces `in/out`.  
- **Criterios**: UseCase + ports (voz, subtítulos, vídeo, audio, storage, repo).  
- **Nota**: **Reusar `MediaCatalogPort`** de US2 para música.  
- **DoD**: compila sin dependencias externas.

### US3-04 — Application Use Case (GenerateMeditationContentService)
- **Propósito**: Orquestación + `TextLengthEstimator` + timeout policy.  
- **Criterios**: rechazo temprano si estimado >30s; mocks; secuencia verificada.  
- **DoD**: tests unit 100% orquestación; sin infra directa.

### US3-05 — Adapter: GoogleTtsAdapter (VoiceSynthesisPort)
- **Propósito**: Narración + timings.  
- **Criterios**: voz `es-ES-Neural2-Diana`, rate ~0.85, retry 429, map 503; WireMock IT.  
- **DoD**: IT green; config externalizada; métricas (requests/latency/error).

### US3-06 — Service: SubtitleSyncService (SubtitleSyncPort)
- **Propósito**: SRT a partir de timings.  
- **Criterios**: alineación <200ms; sin solapes; unit+IT con data de ejemplo.  
- **DoD**: salida parseable; edge cases cubiertos.

### US3-07 — Adapter: FfmpegVideoRendererAdapter (VideoRenderingPort)
- **Propósito**: MP4 con imagen+voz+música+subs “quemados”.  
- **Criterios**: mix claro (voz primaria, música -12dB aprox.); subtítulos visibles; IT con assets mock.  
- **DoD**: output reproducible; métricas render/video.

### US3-08 — Adapter: FfmpegAudioRendererAdapter (AudioRenderingPort)
- **Propósito**: MP3 voz+música para podcast.  
- **Criterios**: mezcla equilibrada; IT con assets mock.  
- **DoD**: output reproducible; métricas render/audio.

### US3-09 — Adapter: S3MediaStorageAdapter (MediaStoragePort)
- **Propósito**: Upload a S3 + Signed URL (TTL).  
- **Criterios**: estructura `userId/meditationId/`; TTL configurable; LocalStack IT.  
- **DoD**: URLs no logueadas en INFO; métricas upload.

### US3-10 — Repository: PostgresMeditationRepository (ContentRepositoryPort)
- **Propósito**: Persistir `MeditationOutput`.  
- **Criterios**: save/findById/findByUserId; mapping fiel; Testcontainers IT.  
- **DoD**: IT green; sin pérdidas de campos.

### US3-11 — Idempotency Guard
- **Propósito**: evitar renders duplicados.  
- **Criterios**: calcular `idempotencyKey = hash(userId,text,music,image)`; reuse si `COMPLETED/PROCESSING`.  
- **DoD**: tests app con mocks; IT repo (búsqueda por key).

### US3-12 — Temp Files Policy
- **Propósito**: gestionar temporales FFmpeg/TTS.  
- **Criterios**: carpeta por request; cleanup on success/error; tests de fuga.  
- **DoD**: no quedan archivos tras tests.

### US3-13 — Flyway Migration V001
- **Propósito**: versionar esquema `meditation`.  
- **SQL** (campos clave, ajustable):  
  - `id UUID PK`, `composition_id UUID`, `user_id UUID`, `type VARCHAR(10)`,  
  - `text_snapshot TEXT`, `music_reference VARCHAR(255)`, `image_reference VARCHAR(255)`,  
  - `media_url TEXT`, `subtitle_url TEXT`, `duration_seconds INT`,  
  - `status VARCHAR(20)`, `idempotency_key VARCHAR(64)`,  
  - `created_at TIMESTAMP`, `updated_at TIMESTAMP`.  
- **DoD**: testcontainers aplica migración; rollback verificado.

### US3-14 — Observability Pack (Métricas/Logs)
- **Propósito**: trazabilidad mínima.  
- **Criterios**: counters/timers por adapter (`tts.requests`, `tts.latency`, `render.latency`, `storage.uploads`, errores tipificados); MDC con `userId`, `compositionId`, `meditationId`.  
- **DoD**: métricas expuestas; tests mínimos.

### Phase 6 concreta (API First YAML) — US3-15
- **Propósito**: contrato completo antes de controller.  
- **Criterios**: request (text,music,image?); response (ids,type,mediaUrl,status,msg); errores `400/401/408/503`; lint OK.  
- **Artefacto**: `/backend/src/main/resources/openapi/meditationbuilder/generate-meditation.yaml`.  
- **DoD**: lista para generar cliente.

### US3-16 — REST Controller (OpenAPI‑driven)
- **Propósito**: adaptar HTTP a use case.  
- **Criterios**: valida JWT; mapea DTO⇄comando; mapea excepciones (408 timeout, 400 invalid, 503 externos); tests con use case mock.  
- **DoD**: sin lógica de negocio.

### US3-17 — Contract Tests (OpenAPI)
- **Propósito**: cumplimiento estricto del contrato.  
- **DoD**: validator green; casos negativos detectan violaciones.

### US3-18 — Application Orchestration Tests (ampliación)
- **Propósito**: cubrir happy/edge paths con mocks.  
- **Criterios**: vídeo/audio; errores TTS/render/storage; orden de invocaciones; timeout.  
- **DoD**: green.

### US3-19 — BDD Steps (GREEN)
- **Propósito**: implementar steps de US3‑01.  
- **Criterios**: arrancar Spring test; WireMock TTS; LocalStack S3; validar outputs observables.  
- **DoD**: 3 escenarios BDD en verde.

### US3-20 — E2E (Spring Boot)
- **Propósito**: flujo completo integrado.  
- **Criterios**: vídeo/audio/timeout; persistencia y URLs firmadas; asserts sobre DB y S3.  
- **DoD**: green.

### US3-21 — API Client Front (Opcional mínimo)
- **Propósito**: botón “Generate Meditation” (sin lógica negocio).  
- **DoD**: cliente generado de OpenAPI; llamada al endpoint; estados loading/success/error; tests component.

### US3-22 — CI Pipeline
- **Propósito**: gates y entorno.  
- **Criterios**: secrets fake para tests; FFmpeg disponible; servicios (Postgres/S3) en CI; orden de gates.  
- **DoD**: pipeline en verde en la feature branch.

### US3-23 — ADR: TTS & Rendering Choice
- **Propósito**: documentar decisión Google TTS + FFmpeg.  
- **DoD**: `docs/architecture-decisions/ADR-00X.md` con contexto/decisión/consecuencias.

### US3-24 — Accessibility Acceptance
- **Propósito**: legibilidad de subtítulos (longitud línea, ruptura por frase).  
- **DoD**: heurísticas validadas; muestra QA en 3 ejemplos.

### US3-25 — i18n Readiness (config)
- **Propósito**: parametrizar locale/voice/rate por configuración.  
- **DoD**: propiedades externas; test rápido con ES/EN (si aplica).

### US3-26 — Performance Smoke
- **Propósito**: validar objetivo 30s con textos 3–5 min.  
- **DoD**: perfil por etapa; informe en CI (no bloqueante) y acciones si excede.

---

## 5. Dependency Map
US3-01 (BDD RED)
↓
US3-02 (Domain Model) → US3-03 (Ports)
↓                   ↘
US3-04 (Use Case)      → US3-11 (Idempotency) → US3-12 (TempFiles)
↓
US3-05 (TTS)  US3-06 (Subtitle)  US3-07 (Video)  US3-08 (Audio)  US3-09 (S3)  US3-10 (Repo)  US3-13 (Flyway)  US3-14 (Obs)
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
↓
US3-15 (API First YAML) → US3-16 (Controller) → US3-17 (Contract Tests) → US3-19 (BDD GREEN)
↓
US3-20 (E2E)
↓
US3-22 (CI)
↓
US3-21 (Front, opc.)
↓
US3-23/24/25/26 (Docs/Acc/i18n/Perf)

---

## 6. Validation Matrix (gates)

| Ticket | Test Type | Evidence | Gate |
|---|---|---|---|
| US3-01 | BDD (RED) | 3 scenarios pending | BDD |
| US3-02 | Unit | TDD dominio 100% reglas | Unit |
| US3-03 | Compile | Ports sin dependencias externas | — |
| US3-04 | Unit (Mock) | Orquestación verificada | Unit |
| US3-05 | Integration (WireMock) | TTS IT green | Infra |
| US3-06 | Unit+Integration | SRT correcto y alineado | Infra |
| US3-07 | Integration | MP4 válido + subs visibles | Infra |
| US3-08 | Integration | MP3 válido, mezcla correcta | Infra |
| US3-09 | Integration (LocalStack) | Upload + Signed URL | Infra |
| US3-10 | Integration (Testcontainers) | Repo OK | Infra |
| US3-11 | Unit (Mock) | Idempotencia verificada | Unit |
| US3-12 | Unit | Cleanup temporales | Unit |
| US3-13 | Migration | Flyway en Testcontainers | Infra |
| US3-14 | Metrics | Métricas expuestas | — |
| US3-15 | Lint | OpenAPI válido | API |
| US3-16 | Unit (Mock) | Controller OK | Unit |
| US3-17 | Contract | OpenAPI compliance | Contract |
| US3-19 | BDD (GREEN) | 3 escenarios pasan | BDD |
| US3-20 | E2E | Flujo integrado | E2E |
| US3-21 | Front unit | Botón/hook OK | Front |
| US3-22 | CI | Gates en verde | Build |
| US3-23 | Docs | ADR publicado | — |
| US3-24 | QA check | Acc subtítulos OK | — |
| US3-25 | Config test | ES/EN parametrizable | — |
| US3-26 | Perf report | Informe CI | — |

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

- ✅ BDD (3) GREEN; contrato OpenAPI válido; controladores conformes.  
- ✅ Dominio y aplicación con coberturas objetivo; infra con IT críticos.  
- ✅ Outputs accesibles, persistencia correcta, idempotencia garantizada.  
- ✅ CI gates en verde; logs/métricas mínimas; temporales limpios.  
- ✅ ADR publicado; accesibilidad mínima de subtítulos validada.

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
- Specs: `specs/US3/spec.md`, `specs/US2/spec.md`  
- Docs externas: Google TTS, FFmpeg, SRT, AWS S3 SDK.

---