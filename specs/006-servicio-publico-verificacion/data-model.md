# Data Model — Servicio Público de Verificación (aplicación)

**Feature**: `006-servicio-publico-verificacion` | **Date**: 2026-07-30

Modelo de aplicación sobre el esquema físico de [005 data-model](../005-modelo-datos-verificaciones/data-model.md) (`dbo.certificados` / `dbo.certificados_verificacion`). **Sin DDL nuevo** en esta feature.

## Entidades de dominio / aplicación

### CodigoVerificacion (VO / read model)

Representa un código consultado desde `dbo.certificados`.

| Atributo | Origen BD | Reglas |
|---|---|---|
| `codigo` | `cod_verificacion` | MUST match `^[A-Z0-9]{14}$` en entrada |
| `fechaVencimiento` | `fec_vencimiento` | Parte fecha; null ⇒ inválido |
| `nombreArchivo` | `nom_archivo` | Clave en S3 (`VARCHAR(30)`) |
| `anulado` | `ctr_anulado` | Si true ⇒ no consultable |
| `vencido` | `ctr_vencido` | Si true ⇒ no consultable (aunque fecha vigente) |

**Métodos de dominio**

- `esValido(Clock clock)` → boolean: `!anulado && !vencido && fecha != null && hoy Bogotá <= fecha`.
- Factory / parse: rechaza formato inválido antes de I/O.

**No se insertan** filas en `certificados` desde este microservicio (escritura = SOAP legacy).

### Registro de verificación (write)

Tras `POST .../registros` exitoso:

1. `INSERT INTO dbo.certificados_verificacion (cod_verificacion, ip_verificacion, fec_verificacion)`
2. `UPDATE dbo.certificados SET cnt_verificaciones = ISNULL(cnt_verificaciones,0)+1, ctr_verificado=1`

| Atributo | Destino | Reglas |
|---|---|---|
| `codVerificacion` | PK/FK natural | Código revalidado como válido |
| `ipVerificacion` | `ip_verificacion` | VARCHAR(45) |
| `fec_verificacion` | DEFAULT `GETDATE()` | Servidor SQL |
| `id_verificacion` | IDENTITY | Autonumérico |

### DocumentoCertificado

Sin cambio: Base64 PDF + `tipo=application/pdf`.

## Validaciones

| Regla | Dónde |
|---|---|
| Formato `^[A-Z0-9]{14}$` | API + dominio |
| Existencia | `findByCodigo` → empty = 404 |
| Validez | `esValido` (flags + fecha) → 410 |
| Registro solo si válido | Handler revalida antes de INSERT |
| Archivo en S3 | Storage port |

## Persistencia (SQL de referencia)

```sql
SELECT cod_verificacion, nom_archivo, fec_vencimiento, ctr_anulado, ctr_vencido
FROM dbo.certificados
WHERE cod_verificacion = :codigo
```

```sql
INSERT INTO dbo.certificados_verificacion (cod_verificacion, ip_verificacion, fec_verificacion)
VALUES (:codVerificacion, :ipVerificacion, GETDATE());

UPDATE dbo.certificados
SET cnt_verificaciones = ISNULL(cnt_verificaciones, 0) + 1,
    ctr_verificado = 1
WHERE cod_verificacion = :codVerificacion;
```

## Fuera de alcance

- Alterar DDL (005).
- Usar `ta_trazabilidad_api_verificarCertificados` o SPs `SCISP_*` (deprecados).
- Insertar códigos (SOAP legacy).
