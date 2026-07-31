# Quickstart — Validación del servicio público de verificación

**Feature**: `006-servicio-publico-verificacion` | **Date**: 2026-07-29

Guía de escenarios ejecutables tras implementar TKT-010..013. Sin código de producción embebido; detalle de contratos en [contracts/](./contracts/).

## Prerrequisitos

- JDK 25, Gradle del monorepo, Docker (Testcontainers / Compose 004).
- SQL Server con esquema `verificaciones` (feature 005 aplicada).
- Redis disponible (Compose o Testcontainer).
- S3 o LocalStack con un objeto PDF de prueba; variables `AWS_*` / `aws.s3.*` según `.env.example`.
- Fila de prueba en `verificaciones.CodigoVerificacion`: código vigente `ABCDEFGH123456`, `fecha_vencimiento` ≥ hoy Bogotá, `nombre_archivo` existente en el bucket de prueba; otra fila expirada; ningún código `ZZZZZZZZZZZZZZ`.

## Escenario 1 — Tests automatizados (TDD / CI)

```bash
./gradlew :verificacion:verificacion-application:test \
  :verificacion:verificacion-infrastructure:test \
  :verificacion:verificacion-api:test \
  :shared:shared-auth:test
```

**Resultado esperado**: BUILD SUCCESSFUL; ArchUnit verde; IT JDBC/S3/Redis y MockMvc según plan.

## Escenario 2 — Validar código (US1 / SC-001..004)

Con `verificacion-api` en 8083:

```bash
curl -s -i http://localhost:8083/api/v1/verificaciones/ABCDEFGH123456
curl -s -i http://localhost:8083/api/v1/verificaciones/CODIGOEXPIRADO1
curl -s -i http://localhost:8083/api/v1/verificaciones/ZZZZZZZZZZZZZZ
curl -s -i http://localhost:8083/api/v1/verificaciones/abc
```

**Resultado esperado** (ver [api-verificaciones.md](./contracts/api-verificaciones.md)):

| Request | HTTP |
|---|---|
| Vigente | 200, `valido: true`, `archivo` presente |
| Expirado | 410 |
| Inexistente | 404 |
| Formato inválido / minúsculas | 400 |
| Sin header Authorization | mismo comportamiento (público) |

## Escenario 3 — Documento Base64 (US2 / SC-008)

```bash
curl -s http://localhost:8083/api/v1/verificaciones/ABCDEFGH123456/documento
```

**Resultado esperado**: 200 con `contenido` Base64 no vacío y `tipo: application/pdf`; decodificable como PDF. Código expirado/inexistente → mismos errores que validación. Sin URL S3 en el JSON.

## Escenario 4 — Registro de auditoría (US3 / SC-005)

```bash
curl -s -i -X POST http://localhost:8083/api/v1/verificaciones/ABCDEFGH123456/registros
# Repetir GET validate sin POST y comprobar que NO hay fila nueva
```

**Resultado esperado**: 201 y fila en `RegistroVerificacion` con IP y fecha. Solo GET validate → sin fila nueva. POST sobre expirado → 410 sin insert.

## Escenario 5 — Rate limit (US4 / SC-006)

Desde la misma IP, ráfaga > 100 requests/s mezclando validate/documento/registros (script o IT `RateLimitIntegrationTest`).

**Resultado esperado**: a partir del request 101 → 429 con `Retry-After: 1`. Otra IP no afectada. Con Redis detenido: requests pasan (fallback permisivo) y hay log de incidente ([rate-limit.md](./contracts/rate-limit.md)).

## Referencias

- Spec: [spec.md](./spec.md)
- Plan / research: [plan.md](./plan.md), [research.md](./research.md)
- Modelo app: [data-model.md](./data-model.md)
- Errores: [contracts/error-mapping.md](./contracts/error-mapping.md)
