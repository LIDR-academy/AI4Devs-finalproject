# Estrategia de migración: verificaciones MySQL → SQL Server

**Feature**: `005-modelo-datos-verificaciones` (US2 / FR-008 / SC-006)  
**Fecha**: 2026-07-30  
**Alcance de este documento**: estrategia y criterios. **No incluye** script ETL ejecutable ni carga en ambientes (ticket posterior).

Contrato de validación: [`specs/005-modelo-datos-verificaciones/contracts/legacy-migration-strategy.md`](../specs/005-modelo-datos-verificaciones/contracts/legacy-migration-strategy.md)  
Modelo destino: [`specs/005-modelo-datos-verificaciones/data-model.md`](../specs/005-modelo-datos-verificaciones/data-model.md)

---

## 1. Origen (legado MySQL)

Tablas confirmadas del sistema de verificación:

### `certificados`

| Columna | Tipo MySQL |
|---|---|
| `cod_verificacion` | `varchar(64)` PK |
| `num_recibo` | `char(10)` |
| `nom_archivo` | `varchar(30)` |
| `fec_cargue` | `timestamp` |
| `ctr_verificado` | `bit(1)` |
| `ctr_anulado` | `bit(1)` |
| `fec_anulado` | `datetime` |
| `ctr_vencido` | `bit(1)` |
| `fec_vencido` | `datetime` |
| `fec_vencimiento` | `datetime` |
| `cnt_verificaciones` | `int` |

### `certificados_verificacion`

| Columna | Tipo MySQL |
|---|---|
| `cod_verificacion` | `varchar(64)` PK compuesta |
| `id_verificacion` | `int` PK compuesta (autonumérico) |
| `fec_verificacion` | `datetime` |
| `ip_verificacion` | `varchar(45)` |

**Nota:** `dbo.ta_trazabilidad_api_verificarCertificados` y SPs `SCISP_*` de verificación **no** son destino ni origen de esta migración; quedan deprecados para el canal digital nuevo (opción B).

---

## 2. Destino (SQL Server) — lift-and-shift 1:1

- **Base**: `SolicitudServiciosVirtuales`
- **Schema**: `dbo`
- **Tablas**: `dbo.certificados`, `dbo.certificados_verificacion` (mismos nombres y columnas)

### Mapeo columna → columna

| Origen MySQL | Destino SQL Server | Notas |
|---|---|---|
| `certificados.*` | `dbo.certificados.*` | Misma estructura; `timestamp`/`datetime` → `DATETIME2`; `bit(1)` → `BIT` |
| `certificados_verificacion.*` | `dbo.certificados_verificacion.*` | `id_verificacion` como `IDENTITY` |
| KEY `RECIBO` | `IX_certificados_num_recibo` | |

No hay remapeo a `CodigoVerificacion` / `RegistroVerificacion` (modelo normalizado descartado).

---

## 3. Alcance temporal de datos

- **Histórico completo** de códigos y registros, **incluidos anulados y vencidos**.
- La regla de validez (flags + fecha 60 días) es de **consulta en runtime** (EPIC-02), no filtro de carga.

---

## 4. Orden de carga

1. Extraer `certificados` desde MySQL.
2. Deduplicar por `cod_verificacion` (ver §5).
3. Insertar en `dbo.certificados` (respetar valores de flags y contadores).
4. Extraer `certificados_verificacion`; omitir huérfanos (§6).
5. Insertar en `dbo.certificados_verificacion` (puede regenerarse `id_verificacion` IDENTITY si se documenta el mapeo).

---

## 5. Colisiones por `cod_verificacion` duplicado

- Omitir fila conflictiva + log; prevalece la primera ocurrencia.

---

## 6. Registros huérfanos

- Huérfano = fila en `certificados_verificacion` sin `cod_verificacion` en destino.
- Omitir + log; **prohibido** crear códigos placeholder.

---

## 7. Idempotencia

| Entidad | Estrategia |
|---|---|
| `certificados` | Skip-if-exists por `cod_verificacion` |
| `certificados_verificacion` | Clave natural o id origen en staging; o carga única con control de corrida |

---

## 8. Criterios de aceptación del ticket ETL posterior

1. Conteos origen vs destino con justificación de omisiones.
2. Cero duplicados de `cod_verificacion` en destino.
3. Cero huérfanos insertados.
4. Re-ejecución idempotente.
5. Log de omisiones archivado.
6. No alterar otras tablas `dbo` existentes ajenas a estas dos.

---

## 9. Fuera de alcance

- Script ETL ejecutable.
- Carga real en ambientes.
- Modificación de `ta_trazabilidad_api_verificarCertificados` (solo deprecación documental).
- Lógica de negocio de verificación (EPIC-02).

El DDL destino se crea con Liquibase en `verificacion-infrastructure`.
