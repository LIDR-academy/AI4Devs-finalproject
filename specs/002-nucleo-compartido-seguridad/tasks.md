---
description: "Task list for feature implementation"
---

# Tasks: Núcleo Compartido y Seguridad

**Input**: Design documents from `specs/002-nucleo-compartido-seguridad/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: INCLUIDAS por mandato del Principio VIII (TDD). Cada clase con lógica se implementa tras una prueba que falla; cobertura ≥ 80% en la lógica nueva.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario (US1, US2, US3)
- Rutas relativas a la raíz del repositorio

## Path Conventions

`shared/shared-kernel/` (Java puro) y `shared/shared-auth/` (Spring: paquetes `...shared.auth` y `...shared.web`). Reglas ArchUnit en los `*-api`. Version catalog en `gradle/libs.versions.toml`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencias necesarias para las piezas web/seguridad de `shared-auth`.

- [x] T001 Añadir al version catalog `gradle/libs.versions.toml` las librerías: `spring-boot-starter-oauth2-resource-server`, `spring-boot-starter-validation` y `spring-security-test` (versiones gestionadas por el BOM de Spring Boot)
- [x] T002 Actualizar `shared/shared-auth/build.gradle.kts` para añadir `spring-boot-starter-web`, `spring-boot-starter-oauth2-resource-server` y `spring-boot-starter-validation` (implementation) y `spring-security-test` (testImplementation)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Guardas de arquitectura transversales (INV-B) que protegen la separación de capas ante la introducción de `shared-auth`/`shared-web`.

- [x] T003 [P] Añadir la regla ArchUnit INV-B (las capas `domain`/`application` NO dependen de `co.org.ccb.certificados.shared.auth..` ni `...shared.web..`) en `solicitudes/solicitudes-api/src/test/java/co/org/ccb/certificados/solicitudes/ArchitectureTest.java`
- [x] T004 [P] Añadir la regla ArchUnit INV-B en `descargas/descargas-api/src/test/java/co/org/ccb/certificados/descargas/ArchitectureTest.java`
- [x] T005 [P] Añadir la regla ArchUnit INV-B en `verificacion/verificacion-api/src/test/java/co/org/ccb/certificados/verificacion/ArchitectureTest.java`

**Checkpoint**: Guardas de arquitectura listas; el build sigue verde.

---

## Phase 3: User Story 1 - Manejo uniforme de resultados y errores (Priority: P1) 🎯 MVP

**Goal**: `Result<T>`, jerarquía `DomainException`, `ApiResponse<T>` y `GlobalExceptionHandler` que traduce errores a HTTP 404/409/422/400/500.

**Independent Test**: Ejecutar los tests de `shared-kernel` y el `GlobalExceptionHandlerTest`; verificar códigos HTTP y envoltorio `ApiResponse` (ver `contracts/error-handling.md`).

### Tests for User Story 1 (TDD — escribir primero, deben fallar) ⚠️

- [x] T006 [P] [US1] `ResultTest` (éxito/fallo, `isSuccess`/`isFailure`, acceso a valor/error, sin excepciones verificadas) en `shared/shared-kernel/src/test/java/co/org/ccb/certificados/shared/kernel/ResultTest.java`
- [x] T007 [P] [US1] `DomainExceptionTest` (jerarquía y semántica de subclases) en `shared/shared-kernel/src/test/java/co/org/ccb/certificados/shared/kernel/DomainExceptionTest.java`
- [x] T008 [P] [US1] `GlobalExceptionHandlerTest` con `@WebMvcTest`/`MockMvc` (404/409/422/400/500 + cuerpo `ApiResponse`) en `shared/shared-auth/src/test/java/co/org/ccb/certificados/shared/web/GlobalExceptionHandlerTest.java`

### Implementation for User Story 1

- [x] T009 [US1] Ampliar `Result<T>` (`isSuccess`, `isFailure`, acceso a valor/error) en `shared/shared-kernel/src/main/java/co/org/ccb/certificados/shared/kernel/Result.java`
- [x] T010 [P] [US1] Crear `RecursoNoEncontradoException`, `ConflictoEstadoException` y `ReglaNegocioException` (extienden `DomainException`) en `shared/shared-kernel/src/main/java/co/org/ccb/certificados/shared/kernel/`
- [x] T011 [P] [US1] Crear el record `ApiResponse<T>` (success/data/error/correlationId/timestamp) en `shared/shared-kernel/src/main/java/co/org/ccb/certificados/shared/kernel/ApiResponse.java`
- [x] T012 [US1] Implementar `GlobalExceptionHandler` (`@RestControllerAdvice`) con el mapeo de `contracts/error-handling.md` en `shared/shared-auth/src/main/java/co/org/ccb/certificados/shared/web/GlobalExceptionHandler.java`
- [x] T013 [US1] Verificar en verde: `./gradlew :shared:shared-kernel:test :shared:shared-auth:test --tests "*GlobalExceptionHandlerTest"`

**Checkpoint**: US1 funcional — resultados y errores uniformes con contrato HTTP.

---

## Phase 4: User Story 2 - Protección de endpoints con AWS Cognito y CORS (Priority: P2)

**Goal**: `SecurityConfig` como OAuth2 Resource Server (JWT Cognito), health público, `/api/**` protegido (401), CORS central `*.ccb.org.co`.

**Independent Test**: `SecurityConfigTest` con `spring-security-test`: health 200 sin token, `/api/**` 401 sin/`token` inválido, CORS permite `*.ccb.org.co` y rechaza otros (ver `contracts/security-cors.md`).

### Tests for User Story 2 (TDD — escribir primero) ⚠️

- [x] T014 [US2] `SecurityConfigTest` (health público 200; `/api/**` sin token → 401; JWT inválido → 401; CORS permitido/rechazado) en `shared/shared-auth/src/test/java/co/org/ccb/certificados/shared/auth/SecurityConfigTest.java`

### Implementation for User Story 2

- [x] T015 [US2] Implementar `CognitoProperties` (`@ConfigurationProperties(prefix="security.cognito")` con region/userPoolId/issuerUri/jwkSetUri/clientId/scopes por variables de entorno) en `shared/shared-auth/src/main/java/co/org/ccb/certificados/shared/auth/CognitoProperties.java`
- [x] T016 [US2] Implementar `SecurityConfig` (Resource Server JWT + `JwtDecoder` validando firma JWKS + issuer + audiencia; `CorsConfigurationSource` central; health público, `/api/**` protegido) en `shared/shared-auth/src/main/java/co/org/ccb/certificados/shared/auth/SecurityConfig.java`
- [x] T017 [US2] Verificar en verde: `./gradlew :shared:shared-auth:test --tests "*SecurityConfigTest"`

**Checkpoint**: US1 + US2 — endpoints protegidos con Cognito y CORS restringido.

---

## Phase 5: User Story 3 - Trazabilidad con Correlation ID (Priority: P3)

**Goal**: `CorrelationIdFilter` que genera/propaga `X-Correlation-Id` en MDC y en el header de respuesta.

**Independent Test**: `CorrelationIdFilterTest`: sin header → UUID en MDC + respuesta; con header → se propaga (ver `contracts/correlation-id.md`).

### Tests for User Story 3 (TDD — escribir primero) ⚠️

- [x] T018 [US3] `CorrelationIdFilterTest` (generación/propagación + presencia en MDC y header) en `shared/shared-auth/src/test/java/co/org/ccb/certificados/shared/web/CorrelationIdFilterTest.java`

### Implementation for User Story 3

- [x] T019 [US3] Implementar `CorrelationIdFilter` (`OncePerRequestFilter`: lee/genera `X-Correlation-Id`, MDC `correlationId`, header de respuesta, limpieza al finalizar) en `shared/shared-auth/src/main/java/co/org/ccb/certificados/shared/web/CorrelationIdFilter.java`
- [x] T020 [US3] Registrar el filtro con orden alto en `SecurityConfig` (mediante `FilterRegistrationBean` o `addFilterBefore`) para que actúe antes de la cadena de seguridad, en `shared/shared-auth/src/main/java/co/org/ccb/certificados/shared/auth/SecurityConfig.java`
- [x] T021 [US3] Verificar en verde: `./gradlew :shared:shared-auth:test --tests "*CorrelationIdFilterTest"`

**Checkpoint**: US1 + US2 + US3 — núcleo compartido y seguridad completos.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T022 [P] Ejecutar `./gradlew spotlessApply build` y verificar `BUILD SUCCESSFUL` con todas las reglas ArchUnit (incl. INV-B) en verde
- [x] T023 [P] Verificar cobertura ≥ 80% en la lógica nueva de `shared-kernel`/`shared-auth` (Principio VIII)
- [x] T024 Ejecutar la validación completa de `quickstart.md` (Escenarios 1-6)
- [x] T025 [P] Actualizar `README.md` con las variables de entorno de Cognito (`COGNITO_*`) y el uso de `shared-auth`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: Sin dependencias (dentro de esta feature); requiere el andamiaje 001.
- **Foundational (Fase 2)**: Depende de Setup. Guarda transversal, no bloquea funcionalidad pero protege capas.
- **US1 (Fase 3, P1)**: Depende de Setup. Es el MVP (tipos + errores).
- **US2 (Fase 4, P2)**: Depende de Setup y de `ApiResponse` (US1) para respuestas de error de seguridad coherentes.
- **US3 (Fase 5, P3)**: Depende de Setup; se integra con `SecurityConfig` (US2) para el orden del filtro.
- **Polish (Fase 6)**: Depende de las historias completadas.

### Within Each User Story (TDD)

- Los tests se escriben ANTES y deben fallar antes de la implementación.
- En US1: tipos de `shared-kernel` (Result/excepciones/ApiResponse) antes del `GlobalExceptionHandler`.

### Parallel Opportunities

- Fase 2: T003/T004/T005 en paralelo.
- US1: T006/T007/T008 (tests) en paralelo; T010 y T011 (tipos independientes) en paralelo.
- Fase 6: T022/T023/T025 en paralelo.

---

## Parallel Example: User Story 1

```bash
# Tests primero (deben fallar):
Task: "ResultTest en shared-kernel/.../ResultTest.java"
Task: "DomainExceptionTest en shared-kernel/.../DomainExceptionTest.java"
Task: "GlobalExceptionHandlerTest en shared-auth/.../web/GlobalExceptionHandlerTest.java"

# Tipos independientes en paralelo:
Task: "Crear subclases de DomainException"
Task: "Crear record ApiResponse<T>"
```

---

## Implementation Strategy

### MVP First (solo US1)

1. Completar Fase 1 (Setup) y Fase 2 (guarda ArchUnit).
2. Completar US1 → `Result`, errores, `ApiResponse`, `GlobalExceptionHandler`.
3. **DETENER y VALIDAR**: tests de `shared-kernel` y del handler en verde.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → resultados/errores uniformes (MVP).
3. US2 → seguridad Cognito + CORS.
4. US3 → correlation id.
5. Polish → build/lint/cobertura + docs.

---

## Notes

- **TDD (Principio VIII)**: prueba que falla → implementación mínima → refactor; cobertura ≥ 80% en la lógica nueva.
- `shared-kernel` permanece Java puro; `GlobalExceptionHandler`, `CorrelationIdFilter`, `SecurityConfig` viven en `shared-auth` (paquetes `shared.web` y `shared.auth`).
- Secretos y config de Cognito siempre por variables de entorno (sin texto claro).
- MAUC NO se aborda aquí (login de afiliados, TKT-040 / feature aparte).
- La regla ArchUnit INV-B evita que `domain`/`application` dependan de `shared-auth`/`shared-web`.
