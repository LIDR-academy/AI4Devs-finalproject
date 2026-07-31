# Contract: Cliente HTTP — Portal → API verificaciones

**Feature**: `007-portal-verificacion` | **Date**: 2026-07-30

Contrato de **consumo** desde `portal-verificacion`. El contrato de servidor canónico es [api-verificaciones.md](../../006-servicio-publico-verificacion/contracts/api-verificaciones.md) y [error-mapping.md](../../006-servicio-publico-verificacion/contracts/error-mapping.md). Este documento fija el comportamiento del cliente.

## Base

- `apiBaseUrl` desde environment (dev típico: `http://localhost:8083`).
- Prefijo: `{apiBaseUrl}/api/v1/verificaciones`.
- Auth: **ninguna** (`Authorization` MUST NOT enviarse).
- Header opcional/recomendado: `X-Correlation-Id` (UUID por request o por flujo).
- `Content-Type: application/json` en POST (body `{}` aceptable).

## Operaciones (orden del flujo feliz)

### 1. Validar

```http
GET {apiBaseUrl}/api/v1/verificaciones/{codigo}
```

- `{codigo}`: ya normalizado (`^[A-Z0-9]{14}$`).
- Éxito (`200`, `data.valido === true`): continuar a documento.
- Cliente MUST mapear:

| HTTP | Acción UI |
|---|---|
| 400 | Tratar como error de validación (no debería ocurrir si FE normalizó; mensaje genérico/formato) |
| 404 | Estado `inexistente` — sin documento ni registro |
| 410 | Estado `expirado` — sin documento ni registro |
| 429 | Estado `rate_limit` — sin documento ni registro |
| 5xx / red | Estado `error_temporal` |

### 2. Documento

```http
GET {apiBaseUrl}/api/v1/verificaciones/{codigo}/documento
```

- Solo tras validación exitosa (vigente).
- Éxito (`200`): usar `data.contenido` (Base64) y `data.tipo`.
- Cliente MUST NOT esperar ni usar URL pre-firmada.
- Fallos (`404 ARCHIVO_NO_ENCONTRADO`, `503`, vacío, red): estado `documento_no_disponible` / `error_temporal`; **MUST NOT** llamar a registros.

### 3. Registrar auditoría

```http
POST {apiBaseUrl}/api/v1/verificaciones/{codigo}/registros
```

- Solo tras documento obtenido exitosamente.
- Body: `{}` o vacío según HttpClient.
- Éxito (`201`): opcional marcar flag interno.
- Cualquier error: **silencioso en UI**; no revertir resultado/PDF.

## Envelope

El cliente MUST deserializar el envelope `ApiResponse<T>` del proyecto (`success`, `data`, `error`, `correlationId`, `timestamp`). Para errores, preferir `error.code` cuando exista; no mostrar `correlationId` al ciudadano.

## Prohibiciones del cliente

- MUST NOT llamar documento o registros si el formato local falla.
- MUST NOT llamar documento si validar no fue vigente.
- MUST NOT llamar registros si documento falló.
- MUST NOT persistir el PDF en storage del navegador más allá de la visita (blob URLs se revocan al limpiar).
- MUST NOT enviar IP ni fecha en el body del POST (el servidor las captura).
