---
description: "Task list for feature implementation"
---

# Tasks: Modelo de Datos de Verificaciones (Liquibase)

**Input**: Design documents from `specs/005-modelo-datos-verificaciones/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluidos (TDD obligatorio — constitución VIII + FR-006). Primero `LiquibaseMigrationIT` (Red), luego changelogs (Green). US2 es documental (sin ETL ejecutable).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario (US1, US2)
- Rutas relativas a la raíz del repositorio

## Path Conventions

- Changelogs y IT: `verificacion/verificacion-infrastructure/`
- Config Liquibase: `verificacion/verificacion-api/src/main/resources/`
- Catálogo de versiones: `gradle/libs.versions.toml`
- Estrategia US2: `docs/migracion-verificaciones-mysql-sqlserver.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Declarar dependencias de persistencia/migración en el version catalog (única fuente de verdad).

- [x] T001 Añadir al catálogo `gradle/libs.versions.toml` las librerías (versiones vía BOM Spring Boot donde aplique): `spring-boot-starter-jdbc`, `liquibase-core`, `mssql-jdbc`, y Testcontainers (`testcontainers`, `mssqlserver`, `junit-jupiter`) con versiones explícitas solo si el BOM no las gestiona

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cablear JDBC/Liquibase/Testcontainers solo en el servicio `verificacion` y preparar el classpath de changelogs.

**⚠️ CRITICAL**: Ninguna user story de esquema puede cerrarse sin estas dependencias y la carpeta de changelog.

- [x] T002 Añadir dependencias JDBC + Liquibase + driver MSSQL (implementation) y Testcontainers + JUnit (testImplementation) en `verificacion/verificacion-infrastructure/build.gradle.kts`
- [x] T003 Añadir `spring-boot-starter-jdbc` (y Liquibase en classpath vía infrastructure o api) en `verificacion/verificacion-api/build.gradle.kts` sin tocar `solicitudes-*/build.gradle.kts` ni `descargas-*/build.gradle.kts`
- [x] T004 Crear directorio y master vacío `verificacion/verificacion-infrastructure/src/main/resources/db/changelog/db.changelog-master.xml` (sin changesets de tablas aún; listo para includes)

**Checkpoint**: Dependencias solo en verificación; master changelog presente; build de módulos verifica resolución de deps.

---

## Phase 3: User Story 1 - Esquema de verificaciones versionado y reproducible (Priority: P1) 🎯 MVP

**Goal**: Migraciones Liquibase crean el esquema `verificaciones`, tablas `CodigoVerificacion` / `RegistroVerificacion` y tres índices en SQL Server 2022, de forma idempotente y sin alterar `dbo`.

**Independent Test**: `./gradlew :verificacion:verificacion-infrastructure:test --tests '*LiquibaseMigrationIT'` — schema/tablas/índices creados; re-ejecución sin error; sin tablas de solicitudes/catálogos creadas por estos changelogs.

### Tests for User Story 1 (TDD — escribir primero, deben FALLAR) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [US1] Escribir `LiquibaseMigrationIT` en `verificacion/verificacion-infrastructure/src/test/java/co/org/ccb/certificados/verificacion/infrastructure/persistence/LiquibaseMigrationIT.java` con Testcontainers SQL Server 2022 que: (a) aplica el master changelog, (b) aserta schema `verificaciones` + tablas + columnas según `specs/005-modelo-datos-verificaciones/data-model.md` y `contracts/ddl-verificaciones.md`, (c) aserta los 3 índices, (d) re-aplica migraciones sin error (idempotencia), (e) aserta que no se crearon tablas de solicitudes/catálogos por estos changelogs — **debe fallar** hasta T006–T009

### Implementation for User Story 1

- [x] T006 [US1] Crear `verificacion/verificacion-infrastructure/src/main/resources/db/changelog/001-create-schema-verificaciones.xml` (schema `verificaciones` si no existe; precondiciones idempotentes) e incluirlo en `db.changelog-master.xml`
- [x] T007 [US1] Crear `verificacion/verificacion-infrastructure/src/main/resources/db/changelog/002-create-tables-verificaciones.xml` con DDL de `CodigoVerificacion` y `RegistroVerificacion` (PK/FK/UNIQUE/`IX_CodigoVerificacion_codigo`) según `data-model.md` e incluirlo en el master
- [x] T008 [P] [US1] Crear `verificacion/verificacion-infrastructure/src/main/resources/db/changelog/003-create-indexes-verificaciones.xml` con `IX_CodigoVerificacion_fecha_vencimiento` e `IX_RegistroVerificacion_codigo_id` (idempotente) e incluirlo en el master
- [x] T009 [US1] Configurar Liquibase en `verificacion/verificacion-api/src/main/resources/application.yml`: `spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.xml`, `liquibase-schema=verificaciones` (y enabled según perfil), sin secretos en claro — contrato `contracts/liquibase-ownership.md`
- [x] T010 [US1] Hacer pasar `LiquibaseMigrationIT` (Green) y confirmar que `solicitudes`/`descargas` no tienen `spring.liquibase` ni carpeta `db/changelog`

**Checkpoint**: US1 MVP — esquema versionado, idempotente y acotado a verificación.

---

## Phase 4: User Story 2 - Estrategia de migración de datos desde el legado (Priority: P2)

**Goal**: Documento de estrategia MySQL → SQL Server (histórico completo, omitir duplicados/huérfanos + log, idempotencia); **sin** ETL ejecutable.

**Independent Test**: Revisar `docs/migracion-verificaciones-mysql-sqlserver.md` contra todas las filas de `specs/005-modelo-datos-verificaciones/contracts/legacy-migration-strategy.md`.

### Implementation for User Story 2

- [x] T011 [US2] Redactar `docs/migracion-verificaciones-mysql-sqlserver.md` con: origen MySQL (spike/supuestos y gaps), mapeo columna→columna a `verificaciones.*`, alcance histórico completo (incluidos vencidos), orden de carga (códigos luego registros), colisiones (omitir + log; primera gana), huérfanos (omitir + log; sin placeholders), idempotencia, criterios de aceptación del ticket ETL posterior, y declaración explícita de fuera de alcance del ETL ejecutable
- [x] T012 [US2] Verificar el documento T011 contra el checklist de `specs/005-modelo-datos-verificaciones/contracts/legacy-migration-strategy.md` y corregir huecos hasta SC-006

**Checkpoint**: US1 + US2 — esquema listo + estrategia documental para ETL futuro.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validación transversal y calidad de build.

- [x] T013 [P] Actualizar `README.md` (raíz) con nota breve: Liquibase solo en `verificacion`, comando del IT de migración y enlace a `docs/migracion-verificaciones-mysql-sqlserver.md`
- [x] T014 [P] Ejecutar `./gradlew :verificacion:verificacion-infrastructure:test --tests '*LiquibaseMigrationIT' spotlessApply` y verificar BUILD SUCCESSFUL
- [x] T015 Ejecutar validación de `specs/005-modelo-datos-verificaciones/quickstart.md` (Escenarios 1–4 aplicables)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — empezar de inmediato
- **Foundational (Phase 2)**: Depende de Setup (T001) — **bloquea** US1
- **User Story 1 (Phase 3)**: Depende de Foundational (T002–T004)
- **User Story 2 (Phase 4)**: Puede avanzar en paralelo a US1 tras Foundational (solo documentación); preferible tras US1 si el mapeo destino debe citar el DDL final
- **Polish (Phase 5)**: Depende de US1 (y US2 si se entrega el alcance completo)

### User Story Dependencies

- **User Story 1 (P1)**: Tras Phase 2 — sin dependencia de US2
- **User Story 2 (P2)**: Independiente funcionalmente (documento); referencia el modelo de US1 / `data-model.md`

### Within User Story 1

1. T005 (test Red) antes de T006–T009
2. T006 → T007 → T008 (schema → tables → indexes; T008 [P] tras T007)
3. T009 config api (puede ir en paralelo a T008 tras T006)
4. T010 Green + verificación de exclusividad

### Parallel Opportunities

- Tras T007: T008 (indexes) y T009 (application.yml) en paralelo
- Tras US1+US2: T013 y T014 en paralelo
- US2 (T011) puede redactarse en paralelo a US1 si se usa `data-model.md` como contrato de destino

---

## Parallel Example: User Story 1

```text
# Tras T005 (Red) y T006–T007 (schema + tables):
Task: "T008 [P] [US1] 003-create-indexes-verificaciones.xml"
Task: "T009 [US1] spring.liquibase.* en verificacion-api/application.yml"
```

## Parallel Example: Polish

```text
Task: "T013 [P] Actualizar README.md"
Task: "T014 [P] Ejecutar IT + spotlessApply"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 + Phase 2
2. Completar Phase 3 (US1) — TDD Red → Green
3. **STOP y VALIDAR** con `LiquibaseMigrationIT` / quickstart Escenarios 1–3
4. Demo: esquema `verificaciones` reproducible

### Incremental Delivery

1. Setup + Foundational → deps y master listos
2. US1 → esquema + IT (MVP)
3. US2 → documento de estrategia (sin ETL)
4. Polish → README + quickstart

### Parallel Team Strategy

1. Dev A: T001–T004 + US1 (T005–T010)
2. Dev B: US2 (T011–T012) en paralelo usando `data-model.md` / contratos
3. Juntos: Phase 5

---

## Notes

- [P] = archivos distintos, sin depender de tareas incompletas del mismo archivo
- Etiqueta [USn] solo en fases de historia
- No añadir Liquibase a `solicitudes` ni `descargas`
- No incluir DML/ETL en changelogs de esta feature
- Commit convencional tras cada tarea o grupo lógico (`feat:`, `test:`, `docs:`)
- Detenerse en cada checkpoint para validar la historia de forma independiente
