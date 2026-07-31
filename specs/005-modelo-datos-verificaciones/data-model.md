# Data Model — Verificaciones (SQL Server)

**Feature**: `005-modelo-datos-verificaciones` | **Date**: 2026-07-30

Modelo físico **lift-and-shift** de las tablas MySQL legacy en la base `SolicitudServiciosVirtuales`, schema `dbo`. Sin entidades de aplicación ni endpoints (EPIC-02).

## Decisiones de alineación (2026-07-30)

| Decisión | Valor |
|---|---|
| Schema | `dbo` (compatibilidad con SOAP de generación, sin cambios) |
| Escritura de códigos | Solo SOAP legacy re-apuntado a SQL Server |
| Validez en consulta | Inválido si `ctr_anulado=1` o `ctr_vencido=1`, aunque `fec_vencimiento` esté vigente |
| `id_verificacion` | `IDENTITY` |
| `cnt_verificaciones` | Contador denormalizado; se incrementa en cada registro público exitoso |
| Formato código | 14 chars `^[A-Z0-9]{14}$` (columna `VARCHAR(64)` por compatibilidad) |
| `ta_trazabilidad_api_verificarCertificados` + SPs `SCISP_*` | **Deprecados (opción B)**: permanecen en BD; el microservicio no los usa |

## Esquema

| Objeto | Nombre | Notas |
|---|---|---|
| Database | `SolicitudServiciosVirtuales` | Misma BD institucional |
| Schema | `dbo` | Tablas legacy `certificados` / `certificados_verificacion` |
| Liquibase control | `dbo.DATABASECHANGELOG`, `dbo.DATABASECHANGELOGLOCK` | Solo contexto del servicio verificación |

## Entidad: certificados

Código de verificación de un certificado emitido (origen MySQL).

| Columna | Tipo | Nulo | Restricciones | Descripción |
|---|---|---|---|---|
| `cod_verificacion` | `VARCHAR(64)` | NO | PK | Código (negocio: 14 chars A–Z0–9) |
| `num_recibo` | `CHAR(10)` | SÍ | — | Número de recibo / orden |
| `nom_archivo` | `VARCHAR(30)` | SÍ | — | Nombre del PDF en S3 |
| `fec_cargue` | `DATETIME2` | NO | DEFAULT `GETDATE()` | Fecha de carga |
| `ctr_verificado` | `BIT` | SÍ | DEFAULT 0 | Marcado tras al menos una verificación |
| `ctr_anulado` | `BIT` | SÍ | DEFAULT 0 | Anulado → no consultable |
| `fec_anulado` | `DATETIME2` | SÍ | — | Fecha de anulación |
| `ctr_vencido` | `BIT` | SÍ | DEFAULT 0 | Marcado vencido → no consultable |
| `fec_vencido` | `DATETIME2` | SÍ | — | Fecha de marcado vencido |
| `fec_vencimiento` | `DATETIME2` | SÍ | — | Fin de vigencia (60 días) |
| `cnt_verificaciones` | `INT` | SÍ | — | Contador de verificaciones |

**Índices**

| Nombre | Columnas | Tipo |
|---|---|---|
| `PK_certificados` | `cod_verificacion` | PRIMARY KEY |
| `IX_certificados_num_recibo` | `num_recibo` | NONCLUSTERED (equiv. KEY RECIBO) |

## Entidad: certificados_verificacion

Auditoría de cada verificación pública.

| Columna | Tipo | Nulo | Restricciones | Descripción |
|---|---|---|---|---|
| `cod_verificacion` | `VARCHAR(64)` | NO | PK compuesta, FK → `certificados` | Código verificado |
| `id_verificacion` | `INT` | NO | `IDENTITY`, PK compuesta | Autonumérico |
| `fec_verificacion` | `DATETIME2` | SÍ | — | Momento de la verificación |
| `ip_verificacion` | `VARCHAR(45)` | SÍ | — | IP del cliente |

**Índices**

| Nombre | Columnas | Tipo |
|---|---|---|
| `PK_certificados_verificacion` | `(cod_verificacion, id_verificacion)` | PRIMARY KEY |
| `IX_certificados_verificacion_cod` | `cod_verificacion` | NONCLUSTERED |
| `FK_certificados_verificacion_certificados` | `cod_verificacion` | FOREIGN KEY |

## Relaciones

```text
certificados 1 ──< N certificados_verificacion
  (cod_verificacion)     (cod_verificacion)
```

## Fuera de alcance / deprecado

- No usar `dbo.ta_trazabilidad_api_verificarCertificados` ni SPs `SCISP_InsertaCodigosVerificacion`, `SCISP_InsertaSolicitudVerificacionCertificado`, `SCISP_InsertaSolicitudEstadoCertificado` desde el microservicio nuevo.
- No crear esquema `verificaciones` ni tablas `CodigoVerificacion` / `RegistroVerificacion`.
- No crear esquemas `solicitudes` / `catalogos`.
- Lógica de negocio de vigencia, rate limiting o APIs públicas → EPIC-02 / feature 006.
