# Implementation Plan: Infraestructura Local, Configuración por Ambiente y CI/CD

**Branch**: `004-infraestructura-config-cicd` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-infraestructura-config-cicd/spec.md`

## Summary

Dotar al monorepo de: (1) un entorno local reproducible con Docker Compose (3 microservicios + SQL Server 2022 + Redis 7), (2) configuración por ambiente (`local`/`dev`/`qas`/`stg`/`prd`) con todos los secretos por variables de entorno, y (3) un pipeline CI/CD en Azure DevOps (CI con quality gates + CD hacia DEV→QAS automático y STG→PRD con aprobación). Se añade JaCoCo con gate de cobertura ≥ 80% en `*-domain`/`*-application`. Se preserva que los servicios del andamiaje sigan arrancando sin BD: las propiedades de `datasource`/`redis` se declaran como placeholders y su autoconfiguración se habilita por servicio cuando su feature de persistencia lo requiera.

## Technical Context

**Language/Version**: Java 25 (contenedores) + TypeScript/Angular 22 (no desplegado en este alcance). Infra declarativa: Dockerfile, Docker Compose YAML, Azure Pipelines YAML.

**Primary Dependencies**: Docker + Docker Compose; imágenes base `eclipse-temurin:25-jre-alpine` (servicios), `mcr.microsoft.com/mssql/server:2022-latest` (SQL Server), `redis:7-alpine` (Redis). Build/calidad: JaCoCo (cobertura), OWASP Dependency-Check (seguridad). Observabilidad: Micrometer + registro Dynatrace (perfiles `stg`/`prd`). Azure DevOps: pipeline + templates + Variable Groups + Environments.

**Storage**: SQL Server 2022 y Redis 7 se **orquestan** localmente, pero su **consumo** (JDBC/cache) pertenece a features posteriores; aquí solo se levantan y se declara la configuración.

**Testing**: Smoke tests de arranque/health por servicio (script + health 200); pruebas de carga de contexto por perfil (arranque sin propiedades faltantes); validación de estructura del pipeline. Testcontainers/carga real de BD pertenecen a features de persistencia.

**Target Platform**: Contenedores Linux en los 4 ambientes CCB (DEV, QAS, STG, PRD); registro de imágenes en Amazon Elastic Container Registry (ECR). El pipeline se ejecuta en Azure DevOps, pero publica las imágenes en ECR (autenticación con credenciales AWS).

**Project Type**: Infraestructura de entrega del monorepo (no código de negocio). El registro de contenedores es Amazon ECR (no Azure ACR).

**Performance Goals**: Arranque local (`docker compose up`) con health 200 en < 3 min; pipeline CI < 15 min; despliegue sin downtime (una instancia a la vez).

**Constraints**: Sin secretos en texto claro (todo por variables de entorno / Variable Groups); pipeline como única vía de build/deploy; zero-downtime; rollback automático ante fallo de smoke test; los servicios deben seguir arrancando sin BD hasta que su feature de persistencia active el datasource.

**Scale/Scope**: 3 Dockerfiles + compose (+ override) + `.env.example` + `deploy.sh`/`smoke-test.sh`; `application.yml` base + 4 perfiles por servicio; `azure-pipelines.yml` + 4 templates; JaCoCo en `build-logic`; 4 Variable Groups y 4 Environments (configurados en Azure DevOps, fuera del repo).

## Constitution Check

*GATE: Debe pasar antes de Phase 0. Re-evaluado tras Phase 1.*

| Principio | Aplicabilidad | Cumplimiento del plan |
|---|---|---|
| I. Stack Fijo | Alta | Java 25, SQL Server 2022, Redis 7, Gradle 9, Azure DevOps — todo del stack ratificado. ✅ |
| II. Clean Architecture + ArchUnit | Baja | No añade código de capas; no altera reglas ArchUnit. ✅ |
| III. Base de Datos (SQL Server, Liquibase, sin JPA) | Parcial | Orquesta SQL Server 2022 y declara `datasource` por env; el esquema (Liquibase) y el acceso JDBC son de features posteriores (005 y persistencia). Sin JPA. ✅ |
| IV. SOAP | N/A | Sin integraciones aquí (solo se declaran URLs/timeouts como config). ✅ |
| V. Resiliencia/Idempotencia | Parcial | Rollback automático y despliegue por instancia (zero-downtime). Idempotencia de negocio N/A. ✅ |
| VI. Auth y CORS | Parcial | Declara la config de Cognito por ambiente (consumida por `shared-auth` de la 002); sin secretos en claro. ✅ |
| VII. Seguridad y Datos | **Central** | Ningún secreto en YAML/archivos; Variable Groups por ambiente; `.env.example` sin valores; OWASP Dependency-Check en CI. ✅ |
| VIII. TDD | Media | Smoke tests y pruebas de arranque por perfil se escriben antes; JaCoCo con gate ≥ 80% se habilita para el resto del proyecto. ✅ |
| IX. Calidad | Alta | Quality gate de cobertura y análisis de seguridad bloquean el merge; commits convencionales. ✅ |
| X. Observabilidad | Alta | Health `/health` y `/health/readiness`; Micrometer + Dynatrace en `stg`/`prd`; logging JSON del andamiaje. ✅ |
| XI. Rendimiento y Capacidad | Media | Parámetros JVM por servicio; el diseño soporta escalado horizontal (rolling). SLAs de negocio en features posteriores. ✅ |

**Resultado del gate**: PASS. Áreas "Parcial/N/A" corresponden a alcance de otras features (persistencia, SOAP), no a violaciones. Sin Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/004-infraestructura-config-cicd/
├── plan.md
├── research.md
├── data-model.md            # Matriz de ambientes + inventario de variables
├── quickstart.md
├── contracts/
│   ├── local-environment.md  # Docker Compose + arranque local
│   ├── environment-config.md # Perfiles y variables por ambiente
│   └── cicd-pipeline.md      # Etapas CI/CD, gates y aprobaciones
└── checklists/requirements.md
```

### Source Code (repository root)

```text
certificados-electronicos/
├── build-logic/src/main/kotlin/
│   └── ccb.java-base.gradle.kts        # (+) JaCoCo + gate de cobertura
├── <servicio>/<servicio>-api/src/main/resources/
│   ├── application.yml                  # base (${ENV} placeholders)
│   ├── application-dev.yml
│   ├── application-qas.yml
│   ├── application-stg.yml
│   └── application-prd.yml
├── deploy/
│   ├── docker/
│   │   ├── Dockerfile.solicitudes
│   │   ├── Dockerfile.descargas
│   │   ├── Dockerfile.verificacion
│   │   ├── docker-compose.yml
│   │   └── docker-compose.override.yml
│   ├── scripts/
│   │   ├── deploy.sh
│   │   └── smoke-test.sh
│   └── azure-devops/
│       ├── README.md
│       └── templates/
│           ├── build-and-test.yml
│           ├── docker-build-push.yml
│           ├── deploy-environment.yml
│           └── smoke-test.yml
├── azure-pipelines.yml                  # pipeline principal (raíz)
└── .env.example                         # todas las variables, sin valores
```

**Structure Decision**: Se reutiliza `deploy/` del andamiaje (001) añadiendo Docker, scripts y `azure-devops/`. La configuración por ambiente vive en `resources` de cada `-api`. JaCoCo se centraliza en el convention plugin `ccb.java-base` (una sola fuente). El `azure-pipelines.yml` va en la raíz (convención de Azure DevOps).

## Complexity Tracking

> No aplica. El Constitution Check pasó sin violaciones; las áreas parciales son alcance de otras features.
