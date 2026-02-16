# Implementation Plan: List and Play Generated Meditations

**Branch**: `003-list-play-meditations`  
**Spec**: [spec.md](./spec.md)

## Pipeline Overview

| Fase | Artefactos | Dependencias |
|------|------------|--------------|
| 1. BDD First | `/backend/tests/bdd/playback/list-play-meditations.feature` | Ninguna |
| 2. API First | `/backend/src/main/resources/openapi/playback/list-play-meditations.yaml` | 1.BDD |
| 3. Domain | `/backend/src/main/java/com/hexagonal/playback/domain/` | 2.API |
| 4. Application | `/backend/src/main/java/com/hexagonal/playback/application/` | 3.Domain |
| 5. Infrastructure | `/backend/src/main/java/com/hexagonal/playback/infrastructure/` | 4.Application |
| 6. Controllers | `/backend/src/main/java/com/hexagonal/playback/infrastructure/in/rest/` | 5.Infrastructure |
| 7. Frontend | `/frontend/src/{api,components,pages,hooks,state}/` | 6.Controllers |
| 8. Contracts | `/backend/tests/contracts/` | 7.Frontend |
| 9. E2E | `/backend/tests/e2e/ + /frontend/tests/e2e/` | 8.Contracts |
| 10. CI/CD | `.github/workflows/` | 9.E2E |

## Fases Detalladas

### Phase 1: BDD First
**Artefactos**:
- `/backend/tests/bdd/playback/list-play-meditations.feature`

**Herramientas**: Cucumber

**Criterios**:
- 2 escenarios Given/When/Then extraídos de spec.md:
  1. Listar las meditaciones del usuario con su estado
  2. Reproducir una meditación completada
- Steps pending (Cucumber YELLOW)
- Lenguaje 100% negocio (estados: "En cola", "Generando", "Completada", "Fallida")

**Prohibido**:
- Implementar steps
- Términos técnicos (HTTP, JSON, DB, PostgreSQL, S3)
- Mencionar URLs, endpoints o formatos de datos

---

### Phase 2: API First
**Artefactos**:
- `/backend/src/main/resources/openapi/playback/list-play-meditations.yaml`

**Capacidades** (SOLO derivadas de BDD When):

1. **List User Meditations** ← Scenario 1: "When solicita ver el listado de sus meditaciones"  
   Capacidad abstracta: Obtener todas las meditaciones de un usuario con sus estados actuales

2. **Play Completed Meditation** ← Scenario 2: "When selecciona reproducir esa meditación"  
   Capacidad abstracta: Acceder al contenido multimedia de una meditación completada

**Criterios**:
- Cada When clause = 1 capacidad abstracta
- Sin paths HTTP, métodos ni DTOs en esta fase
- Capacidades descritas en lenguaje de negocio

**Prohibido**:
- Endpoints no derivados de BDD
- Campos/esquemas concretos
- Detalles de paginación (out of scope en spec.md)
- Operaciones de borrado o edición (out of scope)

---

### Phase 3: Domain
**Artefactos**:
- `/backend/src/main/java/com/hexagonal/playback/domain/model/`
  - Meditation (Aggregate Root: id, userId, title, createdAt, processingState, mediaUrls)
  - ProcessingState (Value Object: PENDING, PROCESSING, COMPLETED, FAILED)
  - MediaUrls (Value Object: audioUrl, videoUrl, optional subtitlesUrl)
- `/backend/src/main/java/com/hexagonal/playback/domain/exception/`
  - MeditationNotFoundException
  - MeditationNotPlayableException
- `/backend/src/main/java/com/hexagonal/playback/domain/ports/in/`
  - ListMeditationsUseCase
  - GetPlaybackInfoUseCase
- `/backend/src/main/java/com/hexagonal/playback/domain/ports/out/`
  - MeditationRepositoryPort

**Herramientas**: JUnit 5, Java 21 Records

**Criterios**:
- Entidades/VOs según capacidades de Phase 2
- TDD: tests primero
- Sin Spring ni infra dependencies
- Regla de negocio: Solo COMPLETED puede reproducirse (validación en domain)
- Usar Records para immutability
- Usar UUID para ids
- Usar Clock para timestamps

**Prohibido**:
- Lógica de infra (HTTP, DB, PostgreSQL queries)
- Frameworks en domain (Spring, JPA annotations)
- Campos no presentes en spec.md

---

### Phase 4: Application
**Artefactos**:
- `/backend/src/main/java/com/hexagonal/playback/application/service/`
  - ListMeditationsService (implements ListMeditationsUseCase)
  - GetPlaybackInfoService (implements GetPlaybackInfoUseCase)
- `/backend/src/main/java/com/hexagonal/playback/application/validator/`
  - PlaybackValidator (verifica estado COMPLETED)
- `/backend/src/main/java/com/hexagonal/playback/application/mapper/`
  - Internal mappers si necesarios

**Herramientas**: JUnit 5, Mockito

**Criterios**:
- Use cases que orquestan domain a través de ports
- Sin reglas de negocio (delegadas a domain)
- Error handling: meditation not found → domain exception, not playable → business exception
- Orchestration only: call repository port, validate via domain rules

**Prohibido**:
- Lógica de negocio (debe estar en domain)
- Acceso directo a infra
- SQL queries o menciones de PostgreSQL

---

### Phase 5: Infrastructure
**Artefactos**:
- `/backend/src/main/java/com/hexagonal/playback/infrastructure/out/persistence/`
  - PostgreSqlMeditationRepositoryAdapter (implements MeditationRepositoryPort)
  - MeditationEntity (JPA entity mapping to `generation.meditations` table)
  - PostgreSqlMeditationRepository (Spring Data JPA)
- `/backend/src/main/java/com/hexagonal/playback/infrastructure/out/persistence/mapper/`
  - EntityToDomainMapper

**Herramientas**: Spring Data JPA, Testcontainers (PostgreSQL), Flyway

**Criterios**:
- Adapter implementa MeditationRepositoryPort
- Tests de integración con Testcontainers PostgreSQL
- Reutilizar schema `generation` de US3 (tabla `meditations`)
- Query filtering: WHERE user_id = :userId
- Estado mapping: DB enum → domain ProcessingState
- URLs construction desde campos S3 paths

**Prohibido**:
- Lógica de negocio en adapters
- PostgreSQL real en tests (usar Testcontainers)
- Exponer detalles de JPA al domain

---

### Phase 6: Controllers
**Artefactos**:
- `/backend/src/main/java/com/hexagonal/playback/infrastructure/in/rest/controller/`
  - PlaybackController
- `/backend/src/main/java/com/hexagonal/playback/infrastructure/in/rest/dto/`
  - MeditationListResponseDto
  - MeditationItemDto
  - PlaybackInfoResponseDto
- `/backend/src/main/java/com/hexagonal/playback/infrastructure/in/rest/mapper/`
  - DtoMapper (domain ↔ DTO)

**Herramientas**: Spring MVC, MockMvc

**Criterios**:
- Cumplen OpenAPI exactamente
- Delegan a use cases
- UserContext extracción desde Security Context (userId)
- Estado labels: PENDING → "En cola", PROCESSING → "Generando", COMPLETED → "Completada", FAILED → "Fallida"
- HTTP responses: 200 OK para list, 200 OK para playback info, 404 si meditation not found, 409 si not playable

**Prohibido**:
- Lógica de negocio
- Desviarse de OpenAPI
- Hardcodear userId (debe venir de autenticación)

---

### Phase 7: Frontend
**Artefactos**:
- `/frontend/src/api/` - OpenAPI-generated client (playback endpoints)
- `/frontend/src/components/`
  - MeditationList (lista de meditaciones con estados)
  - MeditationCard (card individual con título, estado, botón play)
  - MeditationPlayer (reproductor multimedia)
  - StateLabel (badge con estado user-friendly)
- `/frontend/src/pages/`
  - MeditationLibraryPage
- `/frontend/src/hooks/`
  - useMeditationList (React Query hook)
  - usePlaybackInfo (React Query hook)
- `/frontend/src/state/`
  - playerStore.ts (Zustand: estado del reproductor, currentMeditation, playing)

**Herramientas**: React Query, Zustand, Jest/RTL, MSW

**Criterios**:
- Cliente OpenAPI autogenerado
- React Query para server-state (lista, playback info)
- Zustand para UI-state (reproductor controls, current track)
- Estado labels traducción: "En cola", "Generando", "Completada", "Fallida"
- Play button disabled si estado !== "Completada"
- Mensaje si lista vacía: "Aún no tienes meditaciones. Empieza creando una nueva."
- Mensaje si meditación no playable: "Esta meditación aún se está procesando. Por favor, espera a que esté lista."

**Prohibido**:
- Lógica de negocio en UI
- Fetch manual (usar OpenAPI client)
- Server-state en Zustand (usar React Query)
- Implementar filtros/paginación (out of scope)

---

### Phase 8: Contracts
**Artefactos**:
- `/backend/tests/contracts/` - Provider contract tests para playback endpoints

**Herramientas**: Spring Cloud Contract o WireMock

**Criterios**:
- Valida backend contra OpenAPI playback spec
- Breaking changes detectadas automáticamente
- Contract tests para ambos endpoints (list, playback info)

**Prohibido**:
- Permitir drift de OpenAPI
- Servicios externos reales

---

### Phase 9: E2E
**Artefactos**:
- `/backend/tests/e2e/` - Cucumber scenarios ejecutados contra backend real
- `/frontend/tests/e2e/` - Playwright tests

**Herramientas**: Cucumber, Playwright, RestAssured, Testcontainers

**Criterios**:
- BDD escenarios de spec.md contra backend real
- Playwright flujos críticos: ver lista de meditaciones, ver estados, reproducir completada, mensaje si no playable
- PostgreSQL con Testcontainers (datos de prueba pre-cargados)
- S3 LocalStack para URLs de media

**Prohibido**:
- Servicios externos reales (PostgreSQL production, S3 production)
- Tests sin datos de prueba consistentes

---

### Phase 10: CI/CD
**Artefactos**:
- `.github/workflows/backend-ci.yml` (gates actualizados para playback BC)
- `.github/workflows/frontend-ci.yml`

**Herramientas**: GitHub Actions, Maven, npm

**Criterios**:
- Gates: bdd → api → unit → infra → contract → e2e → build
- Todos los gates bloqueantes (cualquier fallo previene merge)
- Timeout: 187s según constitution v4.0.0
- PostgreSQL Testcontainers en CI
- Build once, deploy many

**Prohibido**:
- Saltar gates
- Permitir tests fallidos en merge
- Reducir timeout por debajo de 187s

---

## Traceability Matrix

| BDD Scenario | Domain Entity | Use Case | Business Capability | Frontend Component |
|--------------|---------------|----------|---------------------|-------------------|
| 1. List meditations with state | Meditation (ProcessingState) | ListMeditationsUseCase | List User Meditations | MeditationList |
| 2. Play completed meditation | Meditation (MediaUrls) | GetPlaybackInfoUseCase | Play Completed Meditation | MeditationPlayer |

---

## Technical Decisions (Infrastructure Reuse from US3)

### Database
- **Schema**: `generation` (reused from US3 meditation.generation BC)
- **Table**: `meditations` (already contains: id, user_id, title, state, audio_url, video_url, created_at)
- **Query Pattern**: `SELECT * FROM generation.meditations WHERE user_id = ? ORDER BY created_at DESC`
- **Estado Mapping**: DB `state` ENUM (PENDING/PROCESSING/COMPLETED/FAILED) → Domain ProcessingState

### Media URLs
- **Storage**: S3 (URLs stored in `audio_url`, `video_url` columns)
- **Security**: Signed URLs or public URLs (depende de US3 implementation)
- **Construction**: Retrieve from DB, return as-is (no generation en playback, solo lectura)

### Authentication
- **UserContext**: Extraído de Spring Security Context (establecido por auth middleware)
- **Filtering**: Repository queries filtradas por `userId` para garantizar aislamiento

---

## Constitution Compliance Check

### Normative Hierarchy
✅ User Story + BDD (spec.md) → 2 escenarios consolidados  
✅ Constitution v4.0.0 → Bounded Context `playback` añadido  
✅ Delivery Playbook Backend → 10-phase pipeline respetado  
✅ Hexagonal Architecture Guide → Domain sin Spring, ports definidos  
✅ Testing Instructions → TDD domain, integration tests infra, BDD + E2E

### Mandatory Paths
✅ BDD: `/backend/tests/bdd/playback/list-play-meditations.feature`  
✅ API: `/backend/src/main/resources/openapi/playback/list-play-meditations.yaml`  
✅ Domain: `/backend/src/main/java/com/hexagonal/playback/domain/`  
✅ Application: `/backend/src/main/java/com/hexagonal/playback/application/`  
✅ Infrastructure: `/backend/src/main/java/com/hexagonal/playback/infrastructure/`  
✅ Controllers: `/backend/src/main/java/com/hexagonal/playback/infrastructure/in/rest/`  
✅ Frontend: `/frontend/src/{api,components,pages,hooks,state}/`  
✅ Contracts: `/backend/tests/contracts/`  
✅ E2E: `/backend/tests/e2e/ + /frontend/tests/e2e/`

### CI Gates
✅ 1. BDD (Cucumber acceptance tests)  
✅ 2. API (OpenAPI contract validation)  
✅ 3. Unit Domain (Domain model tests)  
✅ 4. Unit App (Application service tests)  
✅ 5. Infra IT (Infrastructure integration tests con Testcontainers)  
✅ 6. Contract (OpenAPI contract tests)  
✅ 7. E2E (End-to-end tests)  
✅ 8. Build (Maven package generation)

**Timeout**: 187s (according to constitution v4.0.0)

---

## Definition of Done

- [ ] BDD verde (2 escenarios: list + playback)
- [ ] OpenAPI validado (playback endpoints)
- [ ] Domain TDD 100% (Meditation, ProcessingState, MediaUrls, ports)
- [ ] Application tested con mocked ports
- [ ] Infrastructure integration tests verde (PostgreSQL Testcontainers)
- [ ] Controllers OpenAPI compliance verificado
- [ ] Frontend UI tested (unit + integration RTL/MSW + E2E Playwright)
- [ ] Contracts provider tests verde
- [ ] E2E Backend Cucumber scenarios verde
- [ ] E2E Frontend Playwright scenarios verde (list, state display, play, error messages)
- [ ] Pipeline CI/CD gates verde (8 gates)
- [ ] Observability: Logging activo (no sensitive data)
- [ ] No deuda técnica: No TODO comments, no skipped tests

**Plan Status**: READY FOR TASKS
