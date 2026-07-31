---
description: "Task list for feature implementation"
---

# Tasks: Andamiaje Base del Monorepo

**Input**: Design documents from `specs/001-andamiaje-monorepo/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: INCLUIDAS por mandato del Principio VIII (TDD) de la constitución. Al no haber lógica de negocio en el andamiaje, las pruebas se centran en **arquitectura (ArchUnit, INV-1..INV-5)** y **arranque/health por servicio**, no en dominio.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece la tarea (US1, US2, US3)
- Rutas de archivo relativas a la raíz del repositorio

## Path Conventions

Monorepo Gradle multi-módulo en la raíz del repositorio. Backend en `<servicio>/<servicio>-<capa>/`, compartidos en `shared/`, lógica de build en `build-logic/`, frontends en `frontend/`, despliegue en `deploy/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del proyecto y estructura base del monorepo.

- [x] T001 Generar el Gradle Wrapper 9.x en la raíz (`gradlew`, `gradlew.bat`, `gradle/wrapper/gradle-wrapper.properties`, `gradle/wrapper/gradle-wrapper.jar`)
- [x] T002 Crear `build.gradle.kts` raíz (configuración base y grupo `co.org.ccb.certificados`, sin lógica por módulo)
- [x] T003 Crear `settings.gradle.kts` raíz: `rootProject.name`, `includeBuild("build-logic")` y el `include(...)` de los 13 módulos backend según `contracts/module-structure.md`
- [x] T004 [P] Crear `gradle/libs.versions.toml` (version catalog): Java 25, Spring Boot 4.1.x, Spring Framework 7.x, Spring Boot Actuator, ArchUnit, JUnit 5, AssertJ, Mockito, encoder JSON de Logback
- [x] T005 [P] Crear `gradle.properties` (args de JVM, caché y paralelismo de Gradle)
- [x] T006 [P] Revisar y completar `.gitignore` para Gradle/Angular/IDE/secretos (verificar que ya cubre `build/`, `.gradle/`, `node_modules/`, `dist/`, `application-local*`)
- [x] T007 [P] Crear `README.md` raíz con prerrequisitos (JDK 25, Node LTS), comandos de build y arranque, y estructura del monorepo
- [x] T008 [P] Crear estructura base de despliegue: `deploy/docker/` y `deploy/scripts/` con `deploy/README.md` describiendo su propósito (placeholders, sin Dockerfiles funcionales)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Lógica de build reutilizable y módulos compartidos que TODOS los servicios necesitan.

**⚠️ CRITICAL**: Ninguna historia de usuario puede completarse hasta terminar esta fase.

- [x] T009 Crear `build-logic/settings.gradle.kts` (composite build)
- [x] T010 Crear `build-logic/build.gradle.kts` aplicando `kotlin-dsl`
- [x] T011 Crear convention plugin base `build-logic/src/main/kotlin/ccb.java-base.gradle.kts`: toolchain Java 25 (Temurin), JUnit 5 + AssertJ + Mockito, dependencia ArchUnit y `src/test/java` habilitado para tests (soporta FR-011)
- [x] T012 [P] Crear convention plugin `build-logic/src/main/kotlin/ccb.pure-java.gradle.kts` (extiende base; PROHÍBE dependencias de framework — para `domain`/`application`/`shared-kernel`/`shared-contracts`)
- [x] T013 [P] Crear convention plugin `build-logic/src/main/kotlin/ccb.spring-service.gradle.kts` (extiende base; Spring Boot 4.1 + Actuator; para módulos `-api`)
- [x] T014 [P] Crear módulo `shared/shared-kernel/` (`build.gradle.kts` con `ccb.pure-java`) con `Result<T>`, `DomainException` y base de entidades en `co.org.ccb.certificados.shared.kernel`
- [x] T015 [P] Crear módulo `shared/shared-contracts/` (`ccb.pure-java`) con paquete `co.org.ccb.certificados.shared.contracts` (DTOs e interfaces S3 placeholder) dependiendo de `shared-kernel`
- [x] T016 Crear módulo `shared/shared-auth/` como `java-library` con Spring Security (sin `bootJar` ejecutable) — esqueleto de `SecurityConfig` (Cognito Resource Server) y login MAUC en `co.org.ccb.certificados.shared.auth`, sin secretos en config
- [x] T017 [P] Test ArchUnit de aislamiento de `shared-kernel` (INV-4: no depende de ningún otro módulo del monorepo) en `shared/shared-kernel/src/test/java/co/org/ccb/certificados/shared/kernel/ArchitectureTest.java`
- [x] T018 Verificar que `./gradlew :build-logic:build` y la resolución del version catalog funcionan y que los 3 módulos `shared/*` compilan con su test ArchUnit en verde

**Checkpoint**: Base lista — las historias de usuario pueden comenzar.

---

## Phase 3: User Story 1 - Esqueleto backend compilable de extremo a extremo (Priority: P1) 🎯 MVP

**Goal**: Los 3 microservicios con sus módulos de capa existen, se declaran en el build y `./gradlew build` compila todo con la separación de capas verificada por ArchUnit.

**Independent Test**: Ejecutar `./gradlew build` desde la raíz y `./gradlew projects`; verificar `BUILD SUCCESSFUL` y la presencia de los 13 módulos (solicitudes ×4, descargas ×3, verificacion ×3, shared ×3).

### Tests for User Story 1 (TDD — escribir primero, deben fallar antes de la implementación) ⚠️

- [x] T019 [P] [US1] Test ArchUnit para solicitudes en `solicitudes/solicitudes-api/src/test/java/co/org/ccb/certificados/solicitudes/ArchitectureTest.java`: capas (INV-1, INV-2), aislamiento entre servicios (INV-3: no importa `...descargas..` ni `...verificacion..`) y paquete raíz (INV-5)
- [x] T020 [P] [US1] Test ArchUnit para descargas en `descargas/descargas-api/src/test/java/co/org/ccb/certificados/descargas/ArchitectureTest.java` (INV-1, INV-2, INV-3, INV-5)
- [x] T021 [P] [US1] Test ArchUnit para verificacion en `verificacion/verificacion-api/src/test/java/co/org/ccb/certificados/verificacion/ArchitectureTest.java` (INV-1, INV-2, INV-3, INV-5)

### Implementation for User Story 1

- [x] T022 [P] [US1] Crear módulo `solicitudes/solicitudes-domain/` (`ccb.pure-java`), paquete `co.org.ccb.certificados.solicitudes.domain`, dependencia a `shared-kernel`
- [x] T023 [P] [US1] Crear módulo `solicitudes/solicitudes-application/` (`ccb.pure-java`), paquete `...solicitudes.application`, dependencias a `solicitudes-domain` y `shared-kernel`
- [x] T024 [US1] Crear módulo `solicitudes/solicitudes-infrastructure/`, paquete `...solicitudes.infrastructure`, dependencias a `solicitudes-application`, `shared-contracts`, `shared-kernel`
- [x] T025 [US1] Crear módulo `solicitudes/solicitudes-api/` (`ccb.spring-service`), paquete `...solicitudes.api`, dependencias a `solicitudes-application`, `solicitudes-infrastructure`, `shared-auth`, `shared-contracts`
- [x] T026 [P] [US1] Crear módulo `descargas/descargas-application/` (`ccb.pure-java`), paquete `...descargas.application`, dependencia a `shared-kernel`
- [x] T027 [US1] Crear módulo `descargas/descargas-infrastructure/`, paquete `...descargas.infrastructure`, dependencias a `descargas-application`, `shared-contracts`, `shared-kernel`
- [x] T028 [US1] Crear módulo `descargas/descargas-api/` (`ccb.spring-service`), paquete `...descargas.api`, dependencias a `descargas-application`, `descargas-infrastructure`, `shared-auth`, `shared-contracts`
- [x] T029 [P] [US1] Crear módulo `verificacion/verificacion-application/` (`ccb.pure-java`), paquete `...verificacion.application`, dependencia a `shared-kernel`
- [x] T030 [US1] Crear módulo `verificacion/verificacion-infrastructure/`, paquete `...verificacion.infrastructure`, dependencias a `verificacion-application`, `shared-contracts`, `shared-kernel`
- [x] T031 [US1] Crear módulo `verificacion/verificacion-api/` (`ccb.spring-service`), paquete `...verificacion.api`, dependencias a `verificacion-application`, `verificacion-infrastructure`, `shared-auth`, `shared-contracts`
- [x] T032 [US1] Verificar que los 13 módulos declarados en `settings.gradle.kts` resuelven correctamente y que las pruebas ArchUnit (T019-T021) pasan a verde tras crear los módulos
- [x] T033 [US1] Ejecutar `./gradlew build` y verificar `BUILD SUCCESSFUL` con todos los módulos backend compilando y las pruebas ArchUnit en verde

**Checkpoint**: US1 funcional — el esqueleto backend compila de extremo a extremo con capas verificadas (MVP).

---

## Phase 4: User Story 2 - Arranque independiente de cada microservicio (Priority: P2)

**Goal**: Cada microservicio arranca de forma independiente en su puerto (8081/8082/8083) y responde a `/health` y `/health/readiness`.

**Independent Test**: Arrancar cada `-api` por separado y hacer `curl` a `/health` y `/health/readiness`; obtener `200 OK` con `{"status":"UP"}` (ver `contracts/health-endpoint.md`).

### Tests for User Story 2 (TDD — escribir primero) ⚠️

- [x] T034 [P] [US2] Test de carga de contexto + `/health` y `/health/readiness` para solicitudes en `solicitudes/solicitudes-api/src/test/java/co/org/ccb/certificados/solicitudes/HealthEndpointTest.java`
- [x] T035 [P] [US2] Test de carga de contexto + health para descargas en `descargas/descargas-api/src/test/java/co/org/ccb/certificados/descargas/HealthEndpointTest.java`
- [x] T036 [P] [US2] Test de carga de contexto + health para verificacion en `verificacion/verificacion-api/src/test/java/co/org/ccb/certificados/verificacion/HealthEndpointTest.java`

### Implementation for User Story 2

- [x] T037 [P] [US2] Clase main `SolicitudesApplication` + `application.yml` (puerto 8081, Actuator health groups liveness/readiness, valores sensibles vía `${ENV}`) + `logback-spring.xml` baseline JSON con `correlationId` MDC, en `solicitudes/solicitudes-api/src/main/`
- [x] T038 [P] [US2] Clase main `DescargasApplication` + `application.yml` (puerto 8082, Actuator) + `logback-spring.xml` baseline, en `descargas/descargas-api/src/main/`
- [x] T039 [P] [US2] Clase main `VerificacionApplication` + `application.yml` (puerto 8083, Actuator) + `logback-spring.xml` baseline, en `verificacion/verificacion-api/src/main/`
- [x] T040 [US2] Configurar el mapeo de Actuator para exponer liveness en `/health` y readiness en `/health/readiness` (base-path + health groups) de forma consistente en los 3 `-api`
- [x] T041 [US2] Verificar la ausencia de secretos en texto claro en los `application.yml` de los 3 `-api` (FR-012 / US2 escenario 3): todo valor sensible se referencia por `${ENV_VAR}`, sin credenciales literales
- [x] T042 [US2] Verificar arranque independiente de cada servicio y respuesta de health (quickstart Escenario 3)

**Checkpoint**: US1 + US2 funcionan — el esqueleto compila y cada servicio arranca de forma independiente con health checks.

---

## Phase 5: User Story 3 - Frontends y artefactos de despliegue en su lugar (Priority: P3)

**Goal**: Las dos apps Angular 22 existen y compilan de forma independiente; la carpeta de despliegue tiene su estructura base.

**Independent Test**: `npm install && npm run build` en cada frontend termina con éxito; existe `deploy/` con `docker/` y `scripts/`.

### Tests for User Story 3 (TDD — la compilación es la verificación) ⚠️

- [x] T043 [P] [US3] Verificación de build: `npm run build` de `frontend/portal-certificados` finaliza con éxito (smoke build)
- [x] T044 [P] [US3] Verificación de build: `npm run build` de `frontend/portal-verificacion` finaliza con éxito (smoke build)

### Implementation for User Story 3

- [x] T045 [P] [US3] Generar la app Angular 22 `portal-certificados` en `frontend/portal-certificados/` (estructura base `core/`, `shared/`, `features/`)
- [x] T046 [P] [US3] Generar la app Angular 22 `portal-verificacion` en `frontend/portal-verificacion/` (feature única `verificacion/`)
- [x] T047 [US3] Verificar que ambos frontends compilan de forma independiente y que `deploy/` con `docker/` y `scripts/` existe (quickstart Escenarios 4 y 5)

**Checkpoint**: Estructura completa del monorepo (backend + frontend + despliegue).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Consistencia, calidad y validación final.

- [x] T048 [P] Configurar formateo/linting: Spotless (Java) como convention plugin y ESLint + Prettier en cada frontend Angular
- [x] T049 [P] Completar `README.md` con la matriz de comandos (build, run por servicio, build de frontends) y la estructura final
- [x] T050 Ejecutar la validación completa de `quickstart.md` (Escenarios 1-6)
- [x] T051 Verificar onboarding SC-003 en un clon limpio (`./gradlew build` exitoso en < 15 min sin pasos manuales)
- [ ] T052 Realizar el commit inicial del andamiaje completo (`chore: estructura inicial del monorepo`) en la rama `DEV` — requiere confirmación explícita del usuario

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: Sin dependencias — inicia de inmediato.
- **Foundational (Fase 2)**: Depende de Setup. BLOQUEA todas las historias (convention plugins + shared son prerequisito).
- **US1 (Fase 3, P1)**: Depende de Foundational. Es el MVP.
- **US2 (Fase 4, P2)**: Depende de US1 (necesita los módulos `-api` creados).
- **US3 (Fase 5, P3)**: Independiente del backend; puede correr en paralelo a US1/US2 tras Setup (los frontends no dependen del build Gradle). `deploy/` base ya se crea en T008.
- **Polish (Fase 6)**: Depende de que las historias deseadas estén completas.

### Within Each User Story (TDD)

- Los tests (ArchUnit / health) se escriben ANTES y deben fallar antes de la implementación.
- Módulos de capa interna (`domain`/`application`) antes que `infrastructure` y `api`.
- La app ejecutable y su config (US2) después de que el módulo `-api` compile (US1).

### Parallel Opportunities

- Fase 1: T004-T008 en paralelo.
- Fase 2: T012 y T013 en paralelo; T014 y T015 en paralelo; T017 en paralelo tras crear `shared-kernel`.
- US1: T019-T021 (tests) en paralelo; luego T022/T026/T029 (capas puras de cada servicio) en paralelo.
- US2: T034-T036 en paralelo; T037-T039 en paralelo.
- US3: T043/T044 y T045/T046 en paralelo. US3 completa puede solaparse con US1/US2.

---

## Parallel Example: User Story 1

```bash
# Tests de arquitectura (primero, deben fallar):
Task: "ArchUnit solicitudes (INV-1,2,3,5) en solicitudes-api/.../ArchitectureTest.java"
Task: "ArchUnit descargas (INV-1,2,3,5) en descargas-api/.../ArchitectureTest.java"
Task: "ArchUnit verificacion (INV-1,2,3,5) en verificacion-api/.../ArchitectureTest.java"

# Capas puras de cada servicio en paralelo:
Task: "Crear solicitudes-application (ccb.pure-java)"
Task: "Crear descargas-application (ccb.pure-java)"
Task: "Crear verificacion-application (ccb.pure-java)"
```

---

## Implementation Strategy

### MVP First (solo US1)

1. Completar Fase 1: Setup.
2. Completar Fase 2: Foundational (CRÍTICO — bloquea las historias).
3. Completar Fase 3: US1 → esqueleto backend compilable con ArchUnit.
4. **DETENER y VALIDAR**: `./gradlew build` verde. Este es el MVP entregable.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → build backend completo (MVP).
3. US2 → arranque independiente + health.
4. US3 → frontends + despliegue.
5. Polish → linting, docs y validación final + commit inicial.

---

## Notes

- **TDD (Principio VIII)**: en el andamiaje las pruebas son de arquitectura (ArchUnit) y arranque/health; la cobertura ≥80% en `domain` aplicará al añadir lógica de negocio en features posteriores.
- **Cobertura ArchUnit**: INV-1/INV-2/INV-3/INV-5 se verifican por servicio en cada `-api` (T019-T021); INV-4 (aislamiento de `shared-kernel`) se verifica en `shared-kernel` (T017).
- `descargas` y `verificacion` NO tienen módulo `domain`; su `application` es Java puro y referencia `shared-kernel`.
- Secretos siempre por variables de entorno; sin valores sensibles en `application.yml` (verificado en T041).
- Commits en formato convencional (Principio IX). El commit inicial (T052) solo se ejecuta con confirmación explícita, cuando el andamiaje esté completo.
