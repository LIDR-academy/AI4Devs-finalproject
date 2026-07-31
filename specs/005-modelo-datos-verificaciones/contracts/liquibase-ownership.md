# Contract: Liquibase ownership (verificacion)

**Feature**: `005-modelo-datos-verificaciones` | **Date**: 2026-07-30

| Aspecto | Valor |
|---|---|
| Módulo dueño | `verificacion-infrastructure` |
| Changelog master | `classpath:db/changelog/db.changelog-master.xml` |
| Aplicado por | `verificacion-api` (Spring Liquibase) |
| Schema de control | `dbo` (`DATABASECHANGELOG` / `LOCK`) |
| Tablas creadas | `dbo.certificados`, `dbo.certificados_verificacion` |
| No aplica Liquibase | `solicitudes-*`, `descargas-*` |

Tras migrar, existen las dos tablas legacy en `dbo` y el control Liquibase en `dbo`. No se crea schema `verificaciones`.
