# Research — Modelo de Datos de Verificaciones (Liquibase)

**Feature**: `005-modelo-datos-verificaciones` | **Date**: 2026-07-29

Decisiones técnicas. El stack (SQL Server 2022, Liquibase 4.x, JDBC sin JPA) viene de la constitución (Principio III). Aquí se decide **cómo** se materializa el esquema de verificaciones y la estrategia documental de migración.

---

## D1 — Esquema SQL `verificaciones` en `SolicitudServiciosVirtuales`

- **Decisión**: Crear el esquema SQL `verificaciones` en la misma base `SolicitudServiciosVirtuales`. Tablas calificadas como `verificaciones.CodigoVerificacion` y `verificaciones.RegistroVerificacion`. Excepción explícita al uso exclusivo de `dbo` (clarificación 2026-07-29).
- **Rationale**: Aísla el módulo nuevo del legado `dbo`, facilita aserciones de no-impacto (FR-004/SC-005) y coincide con TKT-005 / consultas previstas en EPIC-02.
- **Alternativas**: Tablas en `dbo` → mezcla con legado y peor aislamiento. Base de datos separada → complejidad operativa innecesaria (misma instancia, mismo servicio JDBC ya configurado).

## D2 — DDL canónico (columnas, tipos, FK)

- **Decisión**: Adoptar el DDL de TKT-005 / arquitectura propuesta:

  | Tabla | Columnas clave |
  |---|---|
  | `CodigoVerificacion` | `id BIGINT IDENTITY PK`, `codigo VARCHAR(14) NOT NULL UNIQUE`, `solicitud_id BIGINT NOT NULL`, `matricula VARCHAR(20)`, `tipo_certificado INT`, `nombre_archivo VARCHAR(500) NOT NULL`, `fecha_cargue DATETIME2 DEFAULT GETDATE()`, `fecha_vencimiento DATE NOT NULL` |
  | `RegistroVerificacion` | `id BIGINT IDENTITY PK`, `codigo_verificacion_id BIGINT NOT NULL FK → CodigoVerificacion(id)`, `ip_verificador VARCHAR(45) NOT NULL`, `fecha DATETIME2 DEFAULT GETDATE()` |

- **Rationale**: Contrato ya alineado con EPIC-02 (búsqueda por código, vigencia, registro de IP). `VARCHAR(45)` cubre IPv4/IPv6.
- **Alternativas**: UUID como PK → no aporta frente a IDENTITY + código de negocio único. Código como PK natural → dificulta historial de registros si el código se reutilizara (no es el caso, pero IDENTITY es el patrón del ticket).

## D3 — Índices y unicidad de `codigo`

- **Decisión**: Tres índices lógicos exigidos por la spec:
  1. Búsqueda por `codigo` — materializado como **unique constraint/index** `IX_CodigoVerificacion_codigo` (o constraint UNIQUE nombrado igual) sobre `codigo`.
  2. `IX_CodigoVerificacion_fecha_vencimiento` sobre `fecha_vencimiento`.
  3. `IX_RegistroVerificacion_codigo_id` sobre `codigo_verificacion_id`.
- **Rationale**: Evitar índice no único redundante si ya existe UNIQUE; un único índice único nombrado cumple SC-003 y la restricción de negocio. El índice de vencimiento soporta filtros de vigencia; el de FK acelera joins/listados por código.
- **Alternativas**: UNIQUE sin nombre + índice no único adicional → desperdicio y confusión en IT. Índice filtrado de vigencia → prematuro sin métricas.

## D4 — Ubicación e idempotencia de Liquibase

- **Decisión**:
  - Changelogs en `verificacion-infrastructure/src/main/resources/db/changelog/` con `db.changelog-master.xml` incluyendo `001` (schema), `002` (tables), `003` (indexes).
  - Config solo en `verificacion-api` (`spring.liquibase.enabled=true`, `change-log=classpath:db/changelog/db.changelog-master.xml`, `liquibase-schema=verificaciones`).
  - Idempotencia: changesets con `preConditions` / SQL idempotente (`IF NOT EXISTS` para schema; createTable/createIndex con precondiciones de Liquibase). Re-ejecutar no altera objetos ya creados.
- **Rationale**: FR-001/FR-003/FR-007; tablas de control Liquibase en `verificaciones` aíslan el contexto del resto de la BD.
- **Alternativas**: `DATABASECHANGELOG` en `dbo` → contaminaría el esquema legado compartido. Liquibase Gradle-only sin Spring → no alineado al arranque del servicio.

## D5 — Activación JDBC + Liquibase solo en verificación

- **Decisión**: Añadir dependencias JDBC/Liquibase/driver MSSQL al módulo `verificacion` (api + infrastructure según necesidad de classpath). **No** añadir Liquibase a `solicitudes` ni `descargas` (FR-005). El datasource ya declarado en `application.yml` (004) se activa al introducir el starter JDBC.
- **Rationale**: Continuidad con 004 (config declarada, consumo diferido a la feature de persistencia). Evita migraciones accidentales en otros servicios.
- **Alternativas**: Liquibase central en shared → viola FR-001/FR-005.

## D6 — Pruebas con Testcontainers (SQL Server 2022)

- **Decisión**: `LiquibaseMigrationIT` con Testcontainers `mcr.microsoft.com/mssql/server:2022-latest` (o imagen alineada al Compose de 004). El test: (a) aplica migraciones, (b) verifica schema/tablas/columnas/índices vía catalog views, (c) re-aplica sin error, (d) aserta ausencia de tablas de solicitudes/catálogos creadas por estos changelogs.
- **Rationale**: FR-006, TDD (VIII), paridad con entorno real.
- **Alternativas**: H2 en modo MSSQL → divergencias de T-SQL/esquemas. SQL Server fijo local → frágil en CI.

## D7 — Estrategia de migración MySQL → SQL Server (documento; sin ETL)

- **Decisión**: Entregar un documento de estrategia (US2) que fije:
  - **Alcance**: histórico completo (códigos y registros, incluidos vencidos).
  - **Colisiones de `codigo`**: omitir + log; primera ocurrencia gana.
  - **Huérfanos**: omitir `RegistroVerificacion` sin código coincidente + log; sin placeholders.
  - **Idempotencia**: re-ejecución no duplica (p. ej. upsert por `codigo` / skip-if-exists).
  - **Spike de equivalencia**: mapear tablas/columnas del legado MySQL antes del ticket ETL.
  - ETL ejecutable y carga en ambientes → **ticket posterior**.
- **Rationale**: Clarificaciones 2026-07-29 (preguntas 2–5); reduce riesgo sin bloquear el esquema.
- **Alternativas**: Incluir ETL ahora → fuera de alcance acordado. Solo vigentes (60 días) → pérdida de auditoría.

## D8 — Relación con `ta_trazabilidad_api_verificarCertificados` (dbo)

- **Decisión**: Las tablas nuevas **no** sustituyen ni alteran `dbo.ta_trazabilidad_api_verificarCertificados` ni otras tablas existentes. El mapeo legado MySQL → `verificaciones.*` se documenta en la estrategia; cualquier convergencia con tablas `ta_*` existentes es fuera de alcance de esta feature.
- **Rationale**: FR-004/SC-005; el ticket indica que Codigo/Registro son nuevas en SQL Server desde MySQL.
- **Alternativas**: Migrar hacia `ta_trazabilidad_*` → contradice el modelo de dominio objetivo y EPIC-02.

---

## Resumen de resolución

Sin marcadores `NEEDS CLARIFICATION` pendientes. Decisiones D1–D8 alineadas con spec, clarificaciones y constitución (con excepción de esquema documentada en el plan).
