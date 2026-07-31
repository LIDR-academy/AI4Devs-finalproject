---
description: "Task list for feature implementation"
---

# Tasks: Infraestructura Local, Configuración por Ambiente y CI/CD

**Input**: Design documents from `specs/004-infraestructura-config-cicd/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Se incluyen pruebas donde son ejecutables (smoke tests de arranque/health, carga de contexto por perfil, gate de cobertura JaCoCo). El pipeline Azure DevOps y el push a Amazon ECR se validan por **estructura/lint** (no ejecutables localmente — ver research D8).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario (US1, US2, US3)
- Rutas relativas a la raíz del repositorio

## Path Conventions

Infra en `deploy/` (docker, scripts, azure-devops); configuración en `resources` de cada `-api`; calidad (JaCoCo/OWASP) en `build-logic`; pipeline en la raíz (`azure-pipelines.yml`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inventario de variables y base de configuración.

- [x] T001 Crear `.env.example` en la raíz con el inventario completo de variables (ver `data-model.md`), sin valores reales

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Quality gates transversales (cobertura y seguridad) que el pipeline exigirá.

**⚠️ CRITICAL**: Habilitan los gates de CI usados por US3.

- [x] T002 [P] Añadir JaCoCo (reporte de cobertura) al convention plugin `build-logic/src/main/kotlin/ccb.java-base.gradle.kts`
- [x] T003 Añadir verificación de cobertura ≥ 80% (`jacocoTestCoverageVerification`, enganchada a `check`) en `build-logic/src/main/kotlin/ccb.pure-java.gradle.kts` para `*-domain`/`*-application`, excluyendo `**/package-info` y sin fallar en módulos sin clases ejecutables
- [x] T004 [P] Configurar OWASP Dependency-Check (tarea `dependencyCheckAnalyze`, fallo en severidad Critical) en `build.gradle.kts` raíz

**Checkpoint**: Gates de calidad disponibles; el build sigue verde.

---

## Phase 3: User Story 1 - Entorno local reproducible (Priority: P1) 🎯 MVP

**Goal**: `docker compose up` levanta los 3 microservicios + SQL Server 2022 + Redis 7 con health 200 en < 3 min.

**Independent Test**: Ejecutar el arranque local y `smoke-test.sh`; verificar health 200 de los 3 servicios.

### Tests for User Story 1 (arranque/health) ⚠️

- [x] T005 [US1] Crear `deploy/scripts/smoke-test.sh` que verifica `GET /health` → 200 de los 3 servicios (recibe ambiente/base URL como parámetro)

### Implementation for User Story 1

- [x] T006 [P] [US1] `deploy/docker/Dockerfile.solicitudes` (multi-stage: build JDK 25 → runtime `eclipse-temurin:25-jre-alpine`, `-Xmx1024m`, G1GC, perfil `production`)
- [x] T007 [P] [US1] `deploy/docker/Dockerfile.descargas` (runtime jre-alpine, `-Xmx512m`, ZGC)
- [x] T008 [P] [US1] `deploy/docker/Dockerfile.verificacion` (runtime jre-alpine, `-Xmx512m`, G1GC)
- [x] T009 [US1] `deploy/docker/docker-compose.yml` con servicios solicitudes(8081)/descargas(8082)/verificacion(8083) + `sql-server`(1433, mssql 2022) + `redis`(6379, redis:7-alpine); health checks de SQL Server y Redis; `depends_on: condition: service_healthy`
- [x] T010 [US1] `deploy/docker/docker-compose.override.yml` para desarrollo (bind mounts, puertos de depuración)
- [x] T011 [US1] `deploy/scripts/deploy.sh` (despliegue parametrizado por ambiente: `dev|qas|stg|prd`)
- [x] T012 [US1] Verificar `docker compose up` → los 3 health responden 200 en < 3 min (quickstart Escenario 1)

**Checkpoint**: US1 — entorno local reproducible (MVP).

---

## Phase 4: User Story 2 - Configuración por ambiente sin secretos (Priority: P1)

**Goal**: Perfiles `local`/`dev`/`qas`/`stg`/`prd` con todos los valores sensibles por variables de entorno; `prd` con log WARN y health sin detalles.

**Independent Test**: Arrancar cada servicio por perfil (contexto carga sin propiedades faltantes) y verificar ausencia de secretos en texto claro.

### Tests for User Story 2 (carga de contexto por perfil) ⚠️

- [x] T013 [P] [US2] Test de carga de contexto con `@ActiveProfiles("prd")` para solicitudes en `solicitudes/solicitudes-api/src/test/java/co/org/ccb/certificados/solicitudes/api/ProfilePrdContextTest.java`
- [x] T014 [P] [US2] idem descargas en `descargas/descargas-api/src/test/java/co/org/ccb/certificados/descargas/api/ProfilePrdContextTest.java`
- [x] T015 [P] [US2] idem verificacion en `verificacion/verificacion-api/src/test/java/co/org/ccb/certificados/verificacion/api/ProfilePrdContextTest.java`

### Implementation for User Story 2

- [x] T016 [P] [US2] solicitudes: `application.yml` base (`${ENV}`: datasource diferido, redis, integrations, cognito, s3) + `application-{dev,qas,stg,prd}.yml` en `solicitudes/solicitudes-api/src/main/resources/`
- [x] T017 [P] [US2] descargas: `application.yml` base + perfiles en `descargas/descargas-api/src/main/resources/`
- [x] T018 [P] [US2] verificacion: `application.yml` base + perfiles en `verificacion/verificacion-api/src/main/resources/`
- [x] T019 [US2] Añadir `micrometer-registry-dynatrace` al version catalog y activar métricas Dynatrace en los perfiles `stg`/`prd` de los 3 `-api`
- [x] T020 [US2] Verificar arranque por perfil (`SPRING_PROFILES_ACTIVE`) y ausencia de secretos (`grep password|secret|token` en `**/src/main/resources/` y `deploy/`) — quickstart Escenarios 2-3

**Checkpoint**: US1 + US2 — entorno local + configuración segura por ambiente.

---

## Phase 5: User Story 3 - Pipeline CI/CD en Azure DevOps (Priority: P2)

**Goal**: Pipeline CI (compile, test+cobertura, integración, OWASP, build/push a Amazon ECR) + CD (DEV/QAS auto, STG/PRD con aprobación, rolling, rollback).

**Independent Test**: Revisar la estructura del `azure-pipelines.yml` y templates: etapas, gates, aprobaciones, sin secretos.

### Implementation for User Story 3

- [x] T021 [P] [US3] `azure-pipelines.yml` (raíz): triggers `develop`/`main`, variables (`ECR_REGISTRY`, `AWS_REGION`, `GRADLE_USER_HOME`), y las etapas CI/CD que referencian los templates
- [x] T022 [P] [US3] `deploy/azure-devops/templates/build-and-test.yml` (compilar, `test` + JaCoCo con gate ≥80%, `integrationTest`, publicar cobertura, OWASP)
- [x] T023 [P] [US3] `deploy/azure-devops/templates/docker-build-push.yml` (login a Amazon ECR con `aws ecr get-login-password`; build/push por servicio con tags `{SHA}` y `{rama}-latest`)
- [x] T024 [P] [US3] `deploy/azure-devops/templates/deploy-environment.yml` (deploy parametrizado por ambiente y servicio, rolling una instancia a la vez)
- [x] T025 [P] [US3] `deploy/azure-devops/templates/smoke-test.yml` (health post-deploy + rollback automático ante fallo)
- [x] T026 [US3] `deploy/azure-devops/README.md` (flujo de ramas, ambientes, aprobaciones, rollback; nota: los 4 Variable Groups y 4 Environments se crean en Azure DevOps, fuera del repo)
- [x] T027 [US3] Validar estructura/lint del pipeline y templates (quickstart Escenario 5)

**Checkpoint**: US1 + US2 + US3 — entrega automatizada de extremo a extremo (artefactos en el repo).

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T028 [P] Actualizar `README.md` con comandos de Docker Compose, matriz de variables por ambiente y resumen del pipeline (Azure DevOps → Amazon ECR)
- [x] T029 [P] Ejecutar `./gradlew spotlessApply build` y verificar `BUILD SUCCESSFUL` con el gate JaCoCo en verde
- [x] T030 Ejecutar la validación de `quickstart.md` (Escenarios 1-5)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: Sin dependencias (dentro de la feature); requiere el andamiaje 001.
- **Foundational (Fase 2)**: Depende de Setup. Habilita los gates que usa US3.
- **US1 (Fase 3, P1)**: Depende de Setup. MVP (entorno local).
- **US2 (Fase 4, P1)**: Depende de Setup; se apoya en US1 para probar el arranque en contenedor, pero los perfiles son verificables por bootRun.
- **US3 (Fase 5, P2)**: Depende de Foundational (gates), US1 (Dockerfiles/scripts que el pipeline invoca) y US2 (perfiles/variables).
- **Polish (Fase 6)**: Depende de las historias completadas.

### Within Each User Story

- US1: el smoke test se escribe antes; Dockerfiles y compose antes de la verificación de arranque.
- US2: tests de carga de contexto por perfil antes de finalizar los YAML de perfil.

### Parallel Opportunities

- Fase 2: T002 y T004 en paralelo.
- US1: T006/T007/T008 (Dockerfiles) en paralelo.
- US2: T013-T015 (tests) en paralelo; T016-T018 (config por servicio) en paralelo.
- US3: T021-T025 (YAML) en paralelo.
- Fase 6: T028/T029 en paralelo.

---

## Parallel Example: User Story 1

```bash
Task: "Dockerfile.solicitudes (jre-alpine, -Xmx1024m G1GC)"
Task: "Dockerfile.descargas (jre-alpine, -Xmx512m ZGC)"
Task: "Dockerfile.verificacion (jre-alpine, -Xmx512m G1GC)"
```

---

## Implementation Strategy

### MVP First (US1)

1. Fase 1 (Setup) + Fase 2 (gates).
2. US1 → entorno local con `docker compose up` y health 200.
3. **DETENER y VALIDAR**: quickstart Escenario 1.

### Incremental Delivery

1. Setup + Foundational → gates listos.
2. US1 → entorno local (MVP).
3. US2 → configuración segura por ambiente.
4. US3 → pipeline CI/CD (artefactos).
5. Polish → docs + build con gate + validación.

---

## Notes

- **Datasource/Redis diferidos**: `application.yml` declara placeholders, pero los servicios siguen arrancando sin BD (research D1).
- **Secretos**: nunca en archivos versionados; Variable Groups (Azure DevOps) + `.env.example` (local).
- **Registro de imágenes**: Amazon ECR (login con credenciales AWS), no Azure ACR.
- **Alcance de validación**: local (docker/health/perfiles/cobertura) vs plataforma (ejecución del pipeline, ECR, despliegues) — ver research D8.
- **Cobertura**: el gate JaCoCo ≥80% aplica a `*-domain`/`*-application`; cubre el follow-up pendiente de la 002.
- **Notificaciones/tareas de entidad**: las notificaciones (Teams/email) y otras tareas específicas de la CCB las agrega el equipo DevOps sobre el pipeline base; no son alcance de este repositorio (FR-017).
