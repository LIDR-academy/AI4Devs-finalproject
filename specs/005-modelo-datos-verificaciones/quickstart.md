# Quickstart — Modelo de datos verificaciones

**Feature**: `005-modelo-datos-verificaciones` | **Date**: 2026-07-30

## Prerrequisitos

- Rama con changelogs en `verificacion-infrastructure`.
- SQL Server 2022 (local, Docker o Testcontainers).
- Credenciales vía variables de entorno del servicio `verificacion`.

## Escenario 1 — Aplicar migraciones

```bash
./gradlew :verificacion:verificacion-api:bootRun
# o Liquibase update vía app / tooling
```

**Esperado**

- Tablas `dbo.certificados` y `dbo.certificados_verificacion` creadas.
- Índices `IX_certificados_num_recibo`, `IX_certificados_verificacion_cod` presentes.
- Detalle en [contracts/ddl-verificaciones.md](./contracts/ddl-verificaciones.md).

## Escenario 2 — Idempotencia

Reaplicar migraciones (reinicio de app o segunda ejecución Liquibase) → sin error.

## Escenario 3 — IT automatizado

```bash
./gradlew :verificacion:verificacion-infrastructure:test --tests LiquibaseMigrationIT
```

Requiere Docker (Testcontainers SQL Server 2022).

## Escenario 4 — Documento de migración MySQL

Abrir [`docs/migracion-verificaciones-mysql-sqlserver.md`](../../docs/migracion-verificaciones-mysql-sqlserver.md) y validar contra [contracts/legacy-migration-strategy.md](./contracts/legacy-migration-strategy.md).
