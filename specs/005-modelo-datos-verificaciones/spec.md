# Feature Specification: Modelo de Datos de Verificaciones (Liquibase)

**Feature Branch**: `005-modelo-datos-verificaciones`

**Created**: 2026-07-28

**Status**: Superseded (destino físico 2026-07-30)

**Input**: EPIC-01 / TKT-005 — Crear las migraciones Liquibase exclusivamente para las tablas del módulo de verificaciones en SQL Server 2022 y definir la estrategia de migración de datos desde el sistema legado (MySQL). El resto de la base de datos existente no se crea ni se modifica.

> **Actualización 2026-07-30:** destino acordado = lift-and-shift a `dbo.certificados` / `dbo.certificados_verificacion`. Fuente de verdad: [data-model.md](./data-model.md). El texto histórico siguiente se conserva por trazabilidad.

## Clarifications

### Session 2026-07-30

- Q: ¿Schema? → A: `dbo` (compatibilidad SOAP de generación sin cambios).
- Q: ¿Quién escribe códigos? → A: Solo SOAP legacy re-apuntado.
- Q: ¿`ctr_anulado`/`ctr_vencido` invalidan con fecha vigente? → A: Sí.
- Q: ¿`id_verificacion`? → A: IDENTITY.
- Q: ¿`cnt_verificaciones`? → A: Contador denormalizado incrementado en cada POST de auditoría.
- Q: ¿`ta_trazabilidad_*` / SPs `SCISP_*`? → A: Deprecados (permanecen; el microservicio no los usa).

### Session 2026-07-29

- Q: ¿Dónde viven las tablas de verificaciones respecto al esquema `dbo` de la constitución? → A: ~~Schema SQL `verificaciones`~~ **Reemplazado 2026-07-30 por `dbo` + tablas legacy**
- Q: ¿Cómo se manejan códigos duplicados en la carga desde el legado? → A: Omitir duplicados (log + continuar); prevalece la primera fila cargada
- Q: ¿Qué entregable cubre la migración de datos del legado en esta feature? → A: Documento de estrategia ahora; ETL ejecutable diferido a un ticket posterior
- Q: ¿Qué alcance temporal de datos del legado debe cubrir la estrategia de migración? → A: Histórico completo de códigos y registros (incluidos vencidos)
- Q: ¿Cómo se manejan registros huérfanos sin código coincidente? → A: Omitir registros huérfanos (log + continuar)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Esquema de verificaciones versionado y reproducible (Priority: P1) 🎯 MVP

Como desarrollador del servicio de verificación, quiero que las tablas del módulo de verificaciones se creen mediante migraciones versionadas e idempotentes en SQL Server 2022, para tener un esquema reproducible y controlado sin tocar el resto de la base de datos existente.

**Why this priority**: El servicio de verificación (EPIC-02) no puede persistir códigos ni registros sin este esquema; es su prerequisito directo.

**Independent Test**: Ejecutar las migraciones sobre una instancia limpia de SQL Server 2022 y verificar que se crean el esquema `verificaciones`, las dos tablas y sus tres índices; ejecutarlas dos veces y comprobar que son idempotentes.

**Acceptance Scenarios**:

1. **Given** una base de datos SQL Server 2022 sin el esquema de verificaciones, **When** se ejecutan las migraciones, **Then** se crean el esquema `verificaciones`, las tablas `CodigoVerificacion` y `RegistroVerificacion` y sus tres índices.
2. **Given** las migraciones ya aplicadas, **When** se ejecutan de nuevo, **Then** no producen errores ni cambios (idempotencia).
3. **Given** la base de datos existente, **When** se ejecutan las migraciones, **Then** ninguna tabla existente (solicitudes, cotizaciones, trazabilidad, catálogos) es creada ni alterada.

---

### User Story 2 - Estrategia de migración de datos desde el legado (Priority: P2)

Como responsable de datos, quiero una estrategia documentada para trasladar los datos de verificaciones existentes desde el sistema legado (MySQL) hacia las nuevas tablas en SQL Server, para planificar la continuidad del histórico sin bloquear la creación del esquema.

**Why this priority**: Necesaria para la continuidad del histórico de verificaciones, pero depende de que el esquema destino exista (US1). La ejecución del ETL queda fuera de esta feature.

**Independent Test**: Revisar el documento de estrategia y verificar que define equivalencia de estructura, idempotencia de la carga, manejo de colisiones (omitir duplicados + log), manejo de registros huérfanos (omitir + log) y criterios de aceptación para el ticket de ETL posterior.

**Acceptance Scenarios**:

1. **Given** el esquema de verificaciones creado (US1), **When** se entrega la estrategia de migración, **Then** documenta el mapeo de tablas/columnas MySQL → SQL Server, la equivalencia de estructura, los pasos de carga inicial y el alcance de datos: histórico completo (códigos y registros, incluidos vencidos).
2. **Given** la estrategia entregada, **When** se evalúa la re-ejecución de la carga, **Then** define idempotencia (sin duplicados), el manejo de colisiones por `codigo` (omitir + log; primera ocurrencia gana) y el de registros huérfanos sin código coincidente (omitir + log; no se inventan códigos).
3. **Given** esta feature, **When** se cierra el alcance, **Then** no se exige script ETL ejecutable ni carga real de producción; eso queda en un ticket posterior que implementa esta estrategia.

---

### Edge Cases

- ¿Qué ocurre si el esquema `verificaciones` ya existe parcialmente? → Las migraciones son idempotentes y solo crean lo faltante, sin error.
- ¿Qué ocurre si alguien intenta añadir Liquibase a solicitudes o descargas? → Está prohibido; esos servicios consumen la BD existente por JDBC sin migraciones.
- ¿Qué ocurre con un código de verificación duplicado en la carga desde el legado? → Se omite la fila conflictiva, se registra en el log de la carga y se continúa; prevalece la primera ocurrencia cargada. La unicidad de `codigo` en destino se mantiene.
- ¿Qué ocurre con códigos vencidos (más de 60 días) en la migración? → Se incluyen en el alcance de la estrategia: se migra el histórico completo; la vigencia de 60 días es regla de negocio en tiempo de consulta (EPIC-02), no filtro de carga.
- ¿Qué ocurre con un `RegistroVerificacion` huérfano (sin `CodigoVerificacion` coincidente tras la carga/deduplicación)? → Se omite, se registra en el log y se continúa; no se crean códigos placeholder.
- ¿Qué ocurre si la estructura del legado (MySQL) difiere de la esperada? → El spike de equivalencia debe detectarlo antes de la carga.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Las migraciones Liquibase MUST residir exclusivamente en el módulo `verificacion-infrastructure` y configurarse únicamente para el servicio de verificación.
- **FR-002**: Las migraciones MUST crear el esquema SQL `verificaciones` (si no existe) dentro de la base de datos `SolicitudServiciosVirtuales`, la tabla `CodigoVerificacion`, la tabla `RegistroVerificacion` y los tres índices asociados. Este esquema es una excepción explícita al uso de `dbo` para el resto de la BD (constitución Principio III).
- **FR-003**: Las migraciones MUST ser idempotentes: ejecutarlas más de una vez no genera errores ni cambios adicionales.
- **FR-004**: El sistema MUST NOT crear los esquemas de solicitudes ni de catálogos, ni crear/alterar ninguna tabla existente (solicitudes, cotizaciones, trazabilidad, catálogos).
- **FR-005**: Liquibase MUST NOT añadirse a los módulos `solicitudes-infrastructure` ni `descargas-infrastructure`; esos servicios consumen la base de datos existente mediante acceso parametrizado (JDBC) sin migraciones.
- **FR-006**: Las migraciones MUST verificarse con pruebas de migración contra SQL Server 2022 (contenedor efímero), comprobando estructura, índices, idempotencia y ausencia de tablas fuera de alcance.
- **FR-007**: El registro de control de cambios de Liquibase MUST existir solo en el contexto de verificaciones.
- **FR-008**: El sistema MUST documentar la estrategia de migración de datos del legado (MySQL) hacia SQL Server (carga inicial/ETL), incluyendo equivalencia de estructura, alcance de datos (histórico completo de códigos y registros, incluidos vencidos), idempotencia de la carga, manejo de colisiones (omitir duplicados + log; primera ocurrencia gana) y manejo de registros huérfanos (omitir + log; sin códigos placeholder). El artefacto ETL ejecutable y la carga real quedan fuera de alcance de esta feature y se implementan en un ticket posterior.

### Key Entities

- **CodigoVerificacion**: código de verificación de 14 caracteres (único), asociado a una solicitud; incluye matrícula, tipo de certificado, nombre del archivo, fecha de cargue y fecha de vencimiento.
- **RegistroVerificacion**: registro de cada verificación realizada sobre un código; incluye referencia al código, IP del verificador y fecha.

Relación: un `CodigoVerificacion` tiene muchos `RegistroVerificacion` (uno por cada verificación pública realizada).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La aplicación de las migraciones crea el esquema `verificaciones` y las dos tablas en `SolicitudServiciosVirtuales` sin errores en SQL Server 2022.
- **SC-002**: Ejecutar las migraciones dos veces no produce errores (idempotencia).
- **SC-003**: Los tres índices previstos (búsqueda por código, filtro por vencimiento y referencia por código en registros) quedan creados.
- **SC-004**: El control de cambios de Liquibase se genera solo en el contexto de verificaciones.
- **SC-005**: Las tablas existentes de la base de datos actual no son alteradas en ningún momento (verificable antes/después de migrar).
- **SC-006**: Existe un documento de estrategia de migración MySQL → SQL Server que especifica equivalencia de estructura, alcance histórico completo (incluidos códigos vencidos), idempotencia, manejo de colisiones (omitir + log), manejo de registros huérfanos (omitir + log) y criterios verificables para el ticket de ETL posterior.

## Assumptions

- Se construye sobre el andamiaje `001-andamiaje-monorepo` (existe `verificacion-infrastructure`) y requiere una instancia de SQL Server 2022 disponible (provista por la spec `004-infraestructura-config-cicd` o equivalente).
- El stack de base de datos (SQL Server 2022, Liquibase 4.x, acceso JDBC) está fijado por la constitución (Principio III); versiones y detalles se concretan en `/speckit.plan`.
- Las tablas de verificaciones viven en el esquema SQL `verificaciones` de la misma base `SolicitudServiciosVirtuales`; el resto de tablas existentes permanecen en `dbo` y no se tocan. Esta separación de esquema es la excepción acordada al Principio III para el módulo de verificación.
- Las tablas de verificaciones provienen del sistema legado en MySQL y deben trasladarse a SQL Server; el resto de la base de datos ya existe y se consume tal cual.
- En esta feature solo se documenta la estrategia de migración de datos; el script ETL ejecutable y la carga en ambientes reales se difieren a un ticket posterior.
- La lógica de negocio de verificación (validación de códigos, registro de verificaciones) pertenece a EPIC-02 y no es alcance de esta feature.
