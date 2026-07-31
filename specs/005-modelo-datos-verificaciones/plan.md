# Implementation Plan: Modelo de Datos de Verificaciones (Liquibase)

**Branch**: `005-modelo-datos-verificaciones` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-modelo-datos-verificaciones/spec.md`

## Summary

Crear el esquema SQL `verificaciones` y las tablas `CodigoVerificacion` / `RegistroVerificacion` (más tres índices) mediante migraciones Liquibase 4.x **solo** en el módulo `verificacion-infrastructure`, aplicadas por el servicio `verificacion` sobre la base `SolicitudServiciosVirtuales`. Las migraciones se validan con Testcontainers (SQL Server 2022): estructura, índices, idempotencia y ausencia de impacto sobre tablas `dbo` existentes. En paralelo se documenta la estrategia de migración de datos MySQL → SQL Server (histórico completo, omitir duplicados/huérfanos + log); el ETL ejecutable queda fuera de alcance y se difiere a un ticket posterior.

## Technical Context

**Language/Version**: Java 25 LTS (Eclipse Temurin); SQL Server 2022 (T-SQL en changelogs Liquibase).

**Primary Dependencies**: Spring Boot 4.1.x (`spring-boot-starter-jdbc`, Liquibase 4.x gestionado por el BOM), driver JDBC Microsoft SQL Server, Testcontainers (`mssqlserver`) + JUnit 5 + AssertJ. Sin JPA/Hibernate. Sin Liquibase en `solicitudes` ni `descargas`.

**Storage**: SQL Server 2022, base `SolicitudServiciosVirtuales`. Esquema SQL nuevo `verificaciones` (excepción acordada al Principio III / `dbo`). Tablas de control Liquibase (`DATABASECHANGELOG`, `DATABASECHANGELOGLOCK`) en el esquema `verificaciones`.

**Testing**: TDD — primero `LiquibaseMigrationIT` (Testcontainers SQL Server 2022) que falla sin changelogs; luego changelogs que hacen pasar: creación de esquema/tablas/índices, re-ejecución idempotente, y aserción de que no se crean/alteran tablas de solicitudes/catálogos. Documentación de estrategia de migración revisable contra criterios de [contracts/legacy-migration-strategy.md](./contracts/legacy-migration-strategy.md).

**Target Platform**: JVM en contenedores Linux; migraciones en arranque del servicio `verificacion` (o tarea Gradle `liquibaseUpdate` según quickstart) contra SQL Server local (Compose) o efímero (Testcontainers).

**Project Type**: Persistencia / esquema del microservicio `verificacion` dentro del monorepo Gradle multi-módulo.

**Performance Goals**: N/A de latencia de API (sin endpoints nuevos). Meta operativa: migraciones de esquema en instancia limpia en segundos; IT de migración reproducible en CI.

**Constraints**: Solo Liquibase en `verificacion-*`; no tocar tablas/esquemas existentes (`dbo`); sin lógica en SP; secretos de BD solo por env; changelogs versionados e idempotentes; ETL ejecutable fuera de alcance.

**Scale/Scope**: 1 esquema + 2 tablas + 3 índices + master changelog + config Liquibase en `verificacion-api` + IT Testcontainers + documento de estrategia de migración (sin script ETL).

## Constitution Check

*GATE: Debe pasar antes de Phase 0. Re-evaluado tras Phase 1.*

| Principio | Aplicabilidad | Cumplimiento del plan |
|---|---|---|
| I. Stack Tecnológico Fijo | Alta | Java 25, Spring Boot 4.1, SQL Server 2022, Liquibase 4.x (vía BOM). Sin stack paralelo. ✅ |
| II. Clean Architecture + CQRS | Media | Changelogs y config en `verificacion-infrastructure` / `verificacion-api`; sin lógica de negocio ni capas invertidas. CQRS/EPIC-02 fuera de alcance. ✅ |
| III. Base de Datos (JDBC, Liquibase, sin JPA/SP) | **Central** | Liquibase versiona el esquema; JDBC/named params listos para EPIC-02; sin JPA ni SP. **Excepción justificada**: esquema SQL `verificaciones` en lugar de solo `dbo` (clarificación 2026-07-29; ver Complexity Tracking). ✅ |
| IV. Integraciones SOAP | N/A | Sin integraciones. ✅ |
| V. Resiliencia e Idempotencia | Alta | Idempotencia de migraciones (precondiciones / `IF NOT EXISTS` / changeset runOnChange=false). Política de carga documentada (omitir duplicados/huérfanos). ✅ |
| VI. Auth y CORS | N/A | Sin endpoints nuevos. ✅ |
| VII. Seguridad y Protección de Datos | Alta | Credenciales BD solo por env; IP en modelo futuro (no PII en logs de migración). ✅ |
| VIII. TDD — NO NEGOCIABLE | Alta | `LiquibaseMigrationIT` primero (Red), luego changelogs (Green). ✅ |
| IX. Calidad | Alta | Nombres de dominio en español en tablas; infra/config en inglés; commits convencionales. ✅ |
| X. Observabilidad | Baja | Sin métricas nuevas; fallos de Liquibase en arranque son visibles en logs del servicio. ✅ |
| XI. Rendimiento y Capacidad | Baja | Índices alineados a búsquedas de EPIC-02 (`codigo`, `fecha_vencimiento`, FK). ✅ |

**Resultado del gate (pre-Phase 0)**: PASS con una excepción documentada en Complexity Tracking (esquema `verificaciones` vs `dbo`).

**Re-evaluación post-Phase 1**: PASS. El diseño (`data-model.md`, contratos DDL/Liquibase/estrategia) no introduce JPA, SP, Liquibase en otros servicios ni alteración de `dbo`. La excepción de esquema permanece acotada y justificada.

## Project Structure

### Documentation (this feature)

```text
specs/005-modelo-datos-verificaciones/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ddl-verificaciones.md
│   ├── liquibase-ownership.md
│   └── legacy-migration-strategy.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks — NO creado aquí
```

### Source Code (repository root)

```text
verificacion/
├── verificacion-infrastructure/
│   ├── build.gradle.kts              # + liquibase / JDBC test deps (Testcontainers)
│   └── src/
│       ├── main/resources/
│       │   └── db/changelog/
│       │       ├── db.changelog-master.xml
│       │       ├── 001-create-schema-verificaciones.xml
│       │       ├── 002-create-tables-verificaciones.xml
│       │       └── 003-create-indexes-verificaciones.xml
│       └── test/java/.../infrastructure/persistence/
│           └── LiquibaseMigrationIT.java
├── verificacion-api/
│   └── src/main/resources/
│       └── application.yml           # spring.liquibase.* (+ liquibase-schema=verificaciones)
└── docs/ (repo) — opcional destino del doc de estrategia si se publica fuera de specs/
    └── migracion-verificaciones-mysql-sqlserver.md   # entregable US2 (estrategia; sin ETL)

solicitudes-*/ y descargas-*/         # SIN Liquibase, SIN changelogs nuevos
```

**Structure Decision**: Liquibase vive solo en `verificacion-infrastructure` (classpath de changelogs) y se activa en `verificacion-api` vía Spring Boot Liquibase. Las pruebas de migración se ejecutan desde `verificacion-infrastructure` (o `verificacion-api` si el IT necesita contexto Spring completo); preferencia: IT en infrastructure con Liquibase API / Spring Test + Testcontainers para no acoplar a HTTP. Documentación de estrategia US2 como artefacto markdown versionado (ruta concreta en tasks).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Esquema SQL `verificaciones` en lugar de únicamente `dbo` (Principio III) | Aísla el módulo nuevo (código + registros + `DATABASECHANGELOG`) del esquema legado `dbo` sin riesgo de colisión de nombres; alineado a TKT-005 / EPIC-02 (`verificaciones.CodigoVerificacion`) | Tablas en `dbo` mezclarían objetos nuevos con el modelo legado y harían más difícil el FR-004/SC-005 (demostrar no-impacto) |
