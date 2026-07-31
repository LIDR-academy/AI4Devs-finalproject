---
description: "Task list for feature implementation"
---

# Tasks: Servicio Público de Verificación de Certificados

**Input**: Design documents from `specs/006-servicio-publico-verificacion/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluidos (TDD obligatorio — constitución VIII + plan Technical Context). Ciclo Red → Green → Refactor por capa. Sin frontend, sin DDL nuevo, sin PUP/TiendaWS/SHD.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario (US1, US2, US3, US4)
- Rutas relativas a la raíz del repositorio

## Path Conventions

- Application (Java puro + domain embebido): `verificacion/verificacion-application/`
- Infrastructure (JDBC/S3/Redis/Bucket4j): `verificacion/verificacion-infrastructure/`
- API (controllers + Spring Boot): `verificacion/verificacion-api/`
- Shared: `shared/shared-kernel/`, `shared/shared-auth/`, `shared/shared-contracts/`
- Catálogo: `gradle/libs.versions.toml`
- Contratos: `specs/006-servicio-publico-verificacion/contracts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Declarar dependencias faltantes (AWS S3, Redis, Bucket4j, validation, shared-auth) y cablear módulos Gradle del microservicio `verificacion`.

- [X] T001 Añadir al catálogo `gradle/libs.versions.toml` las librerías/versiones según [ADR-0003](../../docs/adr/ADR-0003-dependencias-verificacion-publica.md): AWS SDK v2 S3 (`software.amazon.awssdk:s3`), Spring Data Redis / Lettuce (`spring-boot-starter-data-redis`), Bucket4j (+ extensión Redis compatible con Lettuce), y Testcontainers Redis/LocalStack si aplica; versiones explícitas solo si el BOM no las gestiona
- [X] T002 [P] Actualizar `verificacion/verificacion-infrastructure/build.gradle.kts` con implementation de JDBC (ya presente), AWS SDK S3, Spring Data Redis, Bucket4j; testImplementation Testcontainers Redis/LocalStack según necesidad de IT
- [X] T003 [P] Actualizar `verificacion/verificacion-api/build.gradle.kts`: añadir `shared:shared-auth`, `spring-boot-starter-validation`, `spring-boot-starter-security` / OAuth2 (vía shared-auth), Redis starter si el filter se registra desde api; mantener dependencia a application + infrastructure
- [X] T004 [P] Actualizar `verificacion/verificacion-application/build.gradle.kts`: añadir `api(project(":shared:shared-contracts"))` de forma obligatoria (US2 usa el port `StorageService` desde application; MUST, no opcional)

**Checkpoint**: `./gradlew :verificacion:verificacion-api:dependencies` resuelve shared-auth, redis, aws, bucket4j sin errores.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Excepciones HTTP compartidas, seguridad pública, ports de infraestructura compartidos, wiring de la app y utilidad de IP. **Sin lógica de negocio de dominio** (el VO `CodigoVerificacion` pertenece a US1 por TDD). **Bloquea** todas las user stories.

**⚠️ CRITICAL**: No iniciar US1–US4 hasta completar esta fase.

### Tests foundational (TDD — escribir primero) ⚠️

- [X] T005 [P] Escribir/extender tests Red en `shared/shared-kernel/src/test/java/co/org/ccb/certificados/shared/kernel/` para `CodigoExpiradoException`, `CodigoNoEncontradoException`, `ArchivoNoEncontradoException` y `AlmacenamientoNoDisponibleException` — deben fallar hasta T008
- [X] T006 [P] Extender `shared/shared-auth/src/test/java/co/org/ccb/certificados/shared/web/GlobalExceptionHandlerTest.java` (Red): mapeo 410 `CODIGO_EXPIRADO`, 404 `CODIGO_NO_ENCONTRADO` / `ARCHIVO_NO_ENCONTRADO`, 503 `SERVICIO_NO_DISPONIBLE` vía `AlmacenamientoNoDisponibleException` según `contracts/error-mapping.md`
- [X] T007 [P] Extender `shared/shared-auth/src/test/java/co/org/ccb/certificados/shared/auth/SecurityConfigTest.java` (Red): `GET /api/v1/verificaciones/**` y subrutas `permitAll` sin JWT; resto sigue autenticado

### Implementation foundational

- [X] T008 [P] Crear excepciones en `shared/shared-kernel/src/main/java/co/org/ccb/certificados/shared/kernel/`: `CodigoExpiradoException`, `CodigoNoEncontradoException`, `ArchivoNoEncontradoException`, y `AlmacenamientoNoDisponibleException` (extienden `DomainException` / `RecursoNoEncontradoException` según patrón; `AlmacenamientoNoDisponibleException` admite `cause` para encadenar el error S3) — Green T005
- [X] T009 Extender `shared/shared-auth/src/main/java/co/org/ccb/certificados/shared/web/GlobalExceptionHandler.java` con handlers 410 (`CodigoExpiradoException`), 404 archivo/código, y 503 (`AlmacenamientoNoDisponibleException` → `SERVICIO_NO_DISPONIBLE`); Green en T006
- [X] T010 Extender `shared/shared-auth/src/main/java/co/org/ccb/certificados/shared/auth/SecurityConfig.java`: `.requestMatchers("/api/v1/verificaciones/**").permitAll()` **antes** de `.anyRequest().authenticated()`; Green en T007
- [X] T011 [P] Crear port `StorageService` con `String descargarComoBase64(String nombreArchivo)` en `shared/shared-contracts/src/main/java/co/org/ccb/certificados/shared/contracts/StorageService.java` (sin implementación)
- [X] T012 [P] Crear utilidad `IpExtractor` (primera IP de `X-Forwarded-For` o `remoteAddr`) en `shared/shared-auth/src/main/java/co/org/ccb/certificados/shared/web/IpExtractor.java` con test unitario en `shared/shared-auth/src/test/java/co/org/ccb/certificados/shared/web/IpExtractorTest.java`
- [X] T013 Cablear `verificacion/verificacion-api/src/main/java/co/org/ccb/certificados/verificacion/api/VerificacionApplication.java` con `@Import`/`@ComponentScan` de `co.org.ccb.certificados.shared.auth` y `co.org.ccb.certificados.shared.web`; añadir `Clock` bean `ZoneId.of("America/Bogota")` (config class en api o infrastructure)
- [X] T014 [P] Añadir propiedades placeholder (sin secretos) en `verificacion/verificacion-api/src/main/resources/application.yml` / `.env.example` para Redis, AWS S3 (`AWS_*` / `aws.s3.*`) y documentar variables requeridas

**Checkpoint**: Seguridad pública + excepciones 410; ports compartidos (`StorageService`) y app importa shared-auth. **No** existe aún `CodigoVerificacion` (se crea en US1 tras su test Red). User stories pueden empezar.

---

## Phase 3: User Story 1 - Validar autenticidad de un certificado por código (Priority: P1) 🎯 MVP

**Goal**: `GET /api/v1/verificaciones/{codigo}` público valida formato, existencia y vigencia (60 días calendario Bogotá); responde `{ valido, archivo }` en envelope `ApiResponse`; no escribe auditoría.

**Independent Test**: Código vigente → 200; expirado → 410; inexistente → 404; formato inválido/minúsculas → 400 sin hit a BD; sin `Authorization` funciona (quickstart Escenario 2).

### Tests + domain for User Story 1 (TDD — VO: Red antes que Green) ⚠️

> **NOTE: Write `CodigoVerificacionTest` FIRST and ensure it FAILS before creating the VO. Do not implement domain logic in Foundational.**

- [X] T015 [US1] Unit test Red `CodigoVerificacionTest` en `verificacion/verificacion-application/src/test/java/co/org/ccb/certificados/verificacion/application/domain/CodigoVerificacionTest.java`: formato válido/inválido (minúsculas, longitud, especiales); vigencia día 60 vs 61 con `Clock` fijo `America/Bogota` — **debe fallar** (no compila o aserciones en rojo) hasta T016
- [X] T016 [US1] Green de T015: crear VO `CodigoVerificacion` con factory `^[A-Z0-9]{14}$` y `estaVigente(Clock)` (`America/Bogota`, `hoy <= fechaVencimiento`) en `verificacion/verificacion-application/src/main/java/co/org/ccb/certificados/verificacion/application/domain/CodigoVerificacion.java`
- [X] T017 [P] [US1] Crear port `CodigoVerificacionRepository` (`Optional<CodigoVerificacion> findByCodigo(String codigo)`) en `verificacion/verificacion-application/src/main/java/co/org/ccb/certificados/verificacion/application/ports/CodigoVerificacionRepository.java` (tras T016; sin lógica)
- [X] T018 [P] [US1] Unit test `ValidarCodigoHandlerTest` en `verificacion/verificacion-application/src/test/java/co/org/ccb/certificados/verificacion/application/ValidarCodigoHandlerTest.java`: vigente → archivo; no existe → `CodigoNoEncontradoException`; expirado → `CodigoExpiradoException`; formato inválido sin llamar al repo — Red hasta T021 (requiere T016–T017)
- [X] T019 [P] [US1] IT JDBC `CodigoVerificacionJdbcRepositoryIT` en `verificacion/verificacion-infrastructure/src/test/java/co/org/ccb/certificados/verificacion/infrastructure/persistence/CodigoVerificacionJdbcRepositoryIT.java` (Testcontainers SQL Server + schema 005): findByCodigo exacto / empty — Red hasta T022 (requiere T016–T017)
- [X] T020 [US1] MockMvc `VerificacionesControllerValidarTest` en `verificacion/verificacion-api/src/test/java/co/org/ccb/certificados/verificacion/api/VerificacionesControllerValidarTest.java`: 200/400/404/410, público sin JWT, envelope `ApiResponse` según `contracts/api-verificaciones.md` — Red hasta T023

### Implementation for User Story 1

- [X] T021 [US1] Crear `ValidarCodigoQuery` + `ValidarCodigoHandler` + DTO resultado (`valido`, `archivo`) en `verificacion/verificacion-application/src/main/java/co/org/ccb/certificados/verificacion/application/`; Green T018
- [X] T022 [US1] Implementar `CodigoVerificacionJdbcRepository` con `NamedParameterJdbcTemplate` (SELECT id, codigo, fecha_vencimiento, nombre_archivo WHERE codigo = :codigo) en `verificacion/verificacion-infrastructure/src/main/java/co/org/ccb/certificados/verificacion/infrastructure/persistence/CodigoVerificacionJdbcRepository.java`; Green T019
- [X] T023 [US1] Crear `VerificacionesController` con `GET /api/v1/verificaciones/{codigo}` (`@Pattern`/`@Validated` `^[A-Z0-9]{14}$`), envelope `ApiResponse`, en `verificacion/verificacion-api/src/main/java/co/org/ccb/certificados/verificacion/api/VerificacionesController.java`; registrar beans handler/repo; Green T020
- [X] T024 [US1] Verificar ArchUnit en `verificacion/verificacion-api/src/test/java/co/org/ccb/certificados/verificacion/api/ArchitectureTest.java`: application no depende de Spring ni infrastructure

**Checkpoint**: MVP US1 — validación pública diferenciada (válido / expirado / no existe / formato) sin autenticación ni auditoría.

---

## Phase 4: User Story 2 - Visualizar el PDF del certificado verificado (Priority: P2)

**Goal**: `GET /api/v1/verificaciones/{codigo}/documento` revalida vigencia y entrega PDF Base64 (`contenido`, `tipo: application/pdf`); sin URL pre-firmada; S3 ausente → 404 + alerta interna; S3 caído → 503.

**Independent Test**: Código vigente con objeto en S3/LocalStack → 200 Base64 decodificable; expirado/inexistente → mismos errores US1; objeto ausente → 404 `ARCHIVO_NO_ENCONTRADO` + log de inconsistencia + incremento de `verificacion.archivo_ausente` (quickstart Escenario 3 / FR-010).

### Tests for User Story 2 (TDD — escribir primero) ⚠️

- [X] T025 [P] [US2] Unit test `ObtenerDocumentoHandlerTest` en `verificacion/verificacion-application/src/test/java/co/org/ccb/certificados/verificacion/application/ObtenerDocumentoHandlerTest.java`: éxito Base64; reutiliza reglas US1; S3 empty/corrupt → `ArchivoNoEncontradoException`; no llama storage si código inválido/expirado
- [X] T026 [P] [US2] IT `S3StorageServiceIT` en `verificacion/verificacion-infrastructure/src/test/java/co/org/ccb/certificados/verificacion/infrastructure/storage/S3StorageServiceIT.java` (LocalStack): GetObject → Base64; NoSuchKey → dominio; bucket no público
- [X] T027 [US2] MockMvc `VerificacionesControllerDocumentoTest` en `verificacion/verificacion-api/src/test/java/co/org/ccb/certificados/verificacion/api/VerificacionesControllerDocumentoTest.java`: 200 sin URL S3; asertar clave JSON `data.contenido` (no `contenidoBase64`) y `data.tipo`; 400/404/410; 404 archivo; 503 cuando el storage lanza `AlmacenamientoNoDisponibleException`; contrato `api-verificaciones.md`

### Implementation for User Story 2

- [X] T028 [P] [US2] Crear `ObtenerDocumentoQuery` + `ObtenerDocumentoHandler` + resultado de aplicación (`contenidoBase64`, `tipo`) en `verificacion/verificacion-application/src/main/java/co/org/ccb/certificados/verificacion/application/` (nombre interno `contenidoBase64`; no es el nombre JSON); Green T025
- [X] T029 [US2] Implementar `S3StorageService` (AWS SDK v2 `GetObject`, timeouts; NoSuchKey / empty/corrupto → `ArchivoNoEncontradoException`; timeouts/conectividad S3 → `AlmacenamientoNoDisponibleException` con cause) en `verificacion/verificacion-infrastructure/src/main/java/co/org/ccb/certificados/verificacion/infrastructure/storage/S3StorageService.java` + config bean; Green T026
- [X] T030 [US2] Añadir `GET /{codigo}/documento` en `VerificacionesController.java`; mapear DTO `contenidoBase64` → JSON `data.contenido` y `tipo` → `data.tipo` (I1); al detectar código vigente sin archivo (o vacío/corrupto): log estructurado WARN/ERROR con `correlationId`, código y `nombreArchivo` (sin PDF ni PII extra); Green T027 — parte (1) de alerta interna FR-010
- [X] T031 [US2] Implementar alerta interna FR-010 parte (2): counter Micrometer `verificacion.archivo_ausente` (incrementar cuando se resuelva `ArchivoNoEncontradoException` tras código vigente) en capa api o application wiring (`verificacion/verificacion-api/` o advice/handler); test Red→Green p. ej. en `verificacion/verificacion-api/src/test/java/co/org/ccb/certificados/verificacion/api/ArchivoAusenteMetricsTest.java` (o aserción en T027) con `MeterRegistry` que verifique el incremento; sin pager/Dynatrace alarm config en código
- [X] T032 [US2] Confirmar que validación GET (US1) y documento GET **no** insertan en `RegistroVerificacion` (aserción en IT o test de handler)

**Checkpoint**: US1 + US2 — happy path HU-14 con PDF Base64; alerta interna = log + métrica `verificacion.archivo_ausente`.

---

## Phase 5: User Story 3 - Registrar cada verificación para auditoría (Priority: P2)

**Goal**: `POST /api/v1/verificaciones/{codigo}/registros` explícito revalida código vigente, inserta IP + fecha (GETDATE); ilimitado durante vigencia; rechazos sin fila; GET validate/documento no auto-registran.

**Independent Test**: Tras validar vigente, POST → 201 y fila con IP/fecha; solo GET → sin fila; POST expirado → 410 sin insert; múltiples POST → múltiples filas; `X-Forwarded-For` usa primera IP (quickstart Escenario 4).

### Tests for User Story 3 (TDD — escribir primero) ⚠️

- [X] T033 [P] [US3] Unit test `RegistrarVerificacionHandlerTest` en `verificacion/verificacion-application/src/test/java/co/org/ccb/certificados/verificacion/application/RegistrarVerificacionHandlerTest.java`: vigente → insert con IP; expirado/inexistente/formato → excepción sin insert; múltiples registros permitidos
- [X] T034 [P] [US3] IT `RegistroVerificacionJdbcRepositoryIT` en `verificacion/verificacion-infrastructure/src/test/java/co/org/ccb/certificados/verificacion/infrastructure/persistence/RegistroVerificacionJdbcRepositoryIT.java`: INSERT + lectura IP/fecha; N filas mismo código
- [X] T035 [US3] MockMvc `VerificacionesControllerRegistrosTest` en `verificacion/verificacion-api/src/test/java/co/org/ccb/certificados/verificacion/api/VerificacionesControllerRegistrosTest.java`: 201 `{ registrado: true }`; 400/404/410 sin insert; IP desde `X-Forwarded-For`; GET validate no crea fila

### Implementation for User Story 3

- [X] T036 [P] [US3] Crear port `RegistroVerificacionRepository` (`void registrar(long codigoVerificacionId, String ipVerificador)`) en `verificacion/verificacion-application/src/main/java/co/org/ccb/certificados/verificacion/application/ports/RegistroVerificacionRepository.java`
- [X] T037 [US3] Crear `RegistrarVerificacionCommand` + `RegistrarVerificacionHandler` (revalida vigencia antes de INSERT; no auto-registro en otros handlers) en `verificacion/verificacion-application/src/main/java/co/org/ccb/certificados/verificacion/application/`; Green T033
- [X] T038 [US3] Implementar `RegistroVerificacionJdbcRepository` (`INSERT INTO verificaciones.RegistroVerificacion (codigo_verificacion_id, ip_verificador) VALUES (...)`) en `verificacion/verificacion-infrastructure/src/main/java/co/org/ccb/certificados/verificacion/infrastructure/persistence/RegistroVerificacionJdbcRepository.java`; Green T034
- [X] T039 [US3] Añadir `POST /{codigo}/registros` en `VerificacionesController.java` usando `IpExtractor` (body vacío/`{}` aceptable); Green T035

**Checkpoint**: US1–US3 — validación + documento + audit trail explícito (RF-29 / RNF-20).

---

## Phase 6: User Story 4 - Proteger el servicio público contra abuso (Priority: P3)

**Goal**: Filter Bucket4j + Redis 100 req/s por IP, cupo compartido en las 3 operaciones `/api/v1/verificaciones/**`; 429 + `Retry-After: 1`; fallback permisivo si Redis cae; health excluido.

**Independent Test**: >100 req/s misma IP mezclando validate/documento/registros → 429; otra IP no afectada; Redis down → requests pasan + log incidente (quickstart Escenario 5 / `contracts/rate-limit.md`).

### Tests for User Story 4 (TDD — escribir primero) ⚠️

- [X] T040 [P] [US4] Unit test `RateLimitFilterTest` en `verificacion/verificacion-infrastructure/src/test/java/co/org/ccb/certificados/verificacion/infrastructure/ratelimit/RateLimitFilterTest.java`: consume cupo compartido; 429 + `Retry-After: 1`; IP vía `IpExtractor`; fallback permisivo ante fallo Redis/bucket + log WARN
- [X] T041 [US4] IT `RateLimitIntegrationTest` en `verificacion/verificacion-api/src/test/java/co/org/ccb/certificados/verificacion/api/RateLimitIntegrationTest.java` (Testcontainers Redis): ráfaga >100/s → 429; segunda IP OK; health no limitado; Redis detenido → fail-open + evidencia de log de incidente (SC-007 cualitativo; sin umbral 99%)

### Implementation for User Story 4

- [X] T042 [US4] Crear `RateLimitConfig` (capacidad 100, refill 100/s, key `rate:verificacion:{ip}`) en `verificacion/verificacion-infrastructure/src/main/java/co/org/ccb/certificados/verificacion/infrastructure/ratelimit/RateLimitConfig.java`
- [X] T043 [US4] Implementar `RateLimitFilter` (`OncePerRequestFilter` sobre `/api/v1/verificaciones/**`, excluir health) en `verificacion/verificacion-infrastructure/src/main/java/co/org/ccb/certificados/verificacion/infrastructure/ratelimit/RateLimitFilter.java`; respuesta 429 + header + cuerpo `RATE_LIMIT_EXCEDIDO` alineado a `ApiResponse` cuando sea posible; Green T040
- [X] T044 [US4] Registrar filter + Redis en contexto Spring de `verificacion-api` (config class); Green T041; confirmar que US1–US3 siguen pasando

**Checkpoint**: Canal público protegido (RNF-15 / CA-14.4) sin degradar a rechazo total si Redis cae.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validación transversal, quickstart, calidad de build, gate de latencia SC-001 y documentación mínima.

- [X] T045 [P] Verificar CORS en rutas de verificación: métodos GET/POST/OPTIONS; `exposedHeaders` permanece solo `X-Correlation-Id` (constitución VI). MUST NOT añadir `Retry-After` ni `X-Forwarded-For` a `exposedHeaders`. El portal usa HTTP 429 + backoff fijo de 1 s del contrato (no lee `Retry-After` vía CORS)
- [X] T046 [P] Revisar logs y métrica FR-010: sin PII cruda de IP en INFO; correlationId en MDC; alerta inconsistencia = log + counter `verificacion.archivo_ausente` solo en US2 (T030–T031)
- [X] T047 Crear IT/smoke de latencia SC-001 `ValidarCodigoLatencyIT` en `verificacion/verificacion-api/src/test/java/co/org/ccb/certificados/verificacion/api/ValidarCodigoLatencyIT.java`: contra `GET /api/v1/verificaciones/{codigo}` con código vigente (Testcontainers SQL Server + datos de prueba), N requests de calentamiento + M medidas; calcular P95 de la muestra y asertar P95 &lt; 500 ms; documentar en el test que es gate de regresión local/CI (no prueba de carga de producción) — cubre SC-001 / RNF-03 / constitución XI
- [X] T048 Ejecutar suite: `./gradlew :verificacion:verificacion-application:test :verificacion:verificacion-infrastructure:test :verificacion:verificacion-api:test :shared:shared-auth:test :shared:shared-kernel:test spotlessApply` — BUILD SUCCESSFUL (incluye T047); cobertura ≥ 80% en lógica application/domain de verificación
- [X] T049 Ejecutar validación manual/automatizable de `specs/006-servicio-publico-verificacion/quickstart.md` (Escenarios 1–5)
- [X] T050 [P] Actualizar `README.md` (raíz) con nota breve: endpoints públicos de verificación en 8083, rate limit Redis, variables S3/Redis, enlace a `specs/006-servicio-publico-verificacion/`, gate de latencia SC-001 (`ValidarCodigoLatencyIT`) y métrica `verificacion.archivo_ausente`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — empezar de inmediato
- **Foundational (Phase 2)**: Depende de Setup (T001–T004) — **bloquea** US1–US4; **no** incluye VO de dominio
- **User Story 1 (Phase 3)**: Depende de Foundational — 🎯 MVP; orden TDD del VO: T015 (Red) → T016 (Green) → T017 (port)
- **User Story 2 (Phase 4)**: Depende de Foundational + VO/repo de US1 (T016/T017/T022); preferible tras US1
- **User Story 3 (Phase 5)**: Depende de Foundational + repo de códigos (US1); independiente del PDF (US2)
- **User Story 4 (Phase 6)**: Depende de Foundational; IT completa requiere endpoints US1–US3; puede prototipar filter tras US1
- **Polish (Phase 7)**: Depende de las stories incluidas en el release; T047 (SC-001) requiere US1 operativa + Testcontainers

### User Story Dependencies

- **User Story 1 (P1)**: Tras Phase 2 — sin dependencia de otras stories — **MVP**
- **User Story 2 (P2)**: Requiere `CodigoVerificacionRepository` + reglas de vigencia (US1); port `StorageService` (T011)
- **User Story 3 (P2)**: Requiere repo de códigos + `IpExtractor`; **no** depende de S3/US2
- **User Story 4 (P3)**: Independiente de dominio; se engancha a rutas `/api/v1/verificaciones/**`

### Within User Story 1 (TDD del VO)

1. **T015** Red `CodigoVerificacionTest` (FAIL) — obligatorio antes del VO
2. **T016** Green crear `CodigoVerificacion`
3. **T017** port `CodigoVerificacionRepository` (necesita el tipo del VO)
4. **T018–T020** tests de handler/IT/MockMvc (Red)
5. **T021–T023** handlers, JDBC, controller (Green)
6. **T024** ArchUnit

### Within Each Other User Story

1. Tests Red primero (FAIL)
2. Domain/handlers antes que adapters
3. Adapters JDBC/S3/Redis antes que controller
4. Green + contrato
5. Confirmar que no se rompen stories previas

### Parallel Opportunities

- T002, T003, T004 en paralelo tras T001
- T005, T006, T007 en paralelo; T008, T011, T012 en paralelo tras tests Red foundational
- Tras T016–T017: T018∥T019 en paralelo (US1 tests de handler/IT)
- Tras US1: T025∥T026 (US2 tests) y T033∥T034 (US3 tests) en paralelo por desarrolladores distintos
- US2 y US3 en paralelo tras US1 (archivos distintos: storage vs registro)
- T045, T046, T050 en paralelo en Polish (T047 latencia SC-001 requiere US1 + infra de test; ejecutar antes de T048)

---

## Parallel Example: User Story 1

```bash
# 1) VO — estricto Red → Green (C2 / constitución VIII):
Task: "T015 CodigoVerificacionTest (Red) — debe fallar"
Task: "T016 Crear CodigoVerificacion (Green T015)"
Task: "T017 CodigoVerificacionRepository port"

# 2) Resto de tests Red en paralelo (tras VO + port):
Task: "ValidarCodigoHandlerTest"
Task: "CodigoVerificacionJdbcRepositoryIT"

# 3) Implementación Green:
Task: "ValidarCodigoHandler + Query"
Task: "CodigoVerificacionJdbcRepository"
Task: "VerificacionesController GET + MockMvc Green"
```

## Parallel Example: User Story 2 + 3 (tras US1)

```bash
# Developer A — US2:
Task: "ObtenerDocumentoHandlerTest + S3StorageServiceIT"
Task: "S3StorageService + GET /documento"

# Developer B — US3:
Task: "RegistrarVerificacionHandlerTest + RegistroVerificacionJdbcRepositoryIT"
Task: "RegistrarVerificacionHandler + POST /registros"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRITICAL — sin VO de dominio)
3. Completar Phase 3: User Story 1 (T015 Red → T016 Green VO primero)
4. **STOP and VALIDATE**: quickstart Escenario 2 + tests US1
5. Demo/deploy del MVP de validación pública

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → validación pública (MVP)
3. US2 → PDF Base64
4. US3 → audit trail explícito (puede ir en paralelo a US2)
5. US4 → rate limit sobre el canal completo
6. Polish → latencia SC-001 (T047) + quickstart + cobertura + README

### Parallel Team Strategy

1. Equipo completo: Setup + Foundational
2. Tras Foundational:
   - Dev A: US1 (crítico path; respeta T015→T016)
   - Tras US1: Dev A → US2, Dev B → US3 en paralelo
   - Dev C / A+B: US4 cuando existan las 3 rutas
3. Polish conjunto

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes
- Labels [US1]–[US4] mapean a stories P1/P2/P2/P3 de `spec.md`
- TDD: ningún handler/VO nuevo sin prueba previa que falle — **C2 resuelto**: `CodigoVerificacion` solo tras T015
- Sin DDL/changelogs nuevos (pertenece a 005)
- Sin frontend (TKT-067 / FR-021)
- Sin SOAP (FR-023)
- Entrega PDF = Base64 ([ADR-0002](../../docs/adr/ADR-0002-entrega-pdf-base64-verificacion-publica.md))
- SC-001: gate de latencia en T047 (`ValidarCodigoLatencyIT`); no sustituye prueba de carga de producción
- FR-010 / G2: alerta interna = log estructurado (T030) + counter Micrometer `verificacion.archivo_ausente` (T031); sin pager en alcance
- I1: DTO `contenidoBase64` → JSON `data.contenido` en controller (T030); MockMvc aserta `contenido` (T027)
- A1: S3 caído → `AlmacenamientoNoDisponibleException` (shared-kernel) → 503 `SERVICIO_NO_DISPONIBLE` (T008/T009/T029); `NoSuchKey` ≠ 503
- A2: T004 MUST añadir `api` a `shared-contracts` en `verificacion-application` (sin “si hace falta”)
- C3: deps catálogo justificadas por [ADR-0003](../../docs/adr/ADR-0003-dependencias-verificacion-publica.md) (T001)
- C5: CORS `exposedHeaders` solo `X-Correlation-Id`; no exponer `Retry-After` ni `X-Forwarded-For` (T045); portal → 429 + backoff 1 s
- D1: formato de código solo en FR-001 + FR-001a; FR-006 retirado (duplicado)
- G3: SC-007 cualitativo (fail-open + log en IT); sin umbral 99% en CI
- Commit tras cada task o grupo lógico (`feat:`, `fix:`, `test:`)
- Detenerse en cualquier checkpoint para validar la story de forma independiente
