# Contract: Mapeo de errores — verificación

**Feature**: `006-servicio-publico-verificacion` | **Date**: 2026-07-29

Extiende el contrato base [error-handling.md](../../002-nucleo-compartido-seguridad/contracts/error-handling.md) con códigos HTTP requeridos por HU-14.

## Tabla de mapeo

| Situación | Excepción (orientativa) | HTTP | `error.code` | Mensaje orientativo (ES) |
|---|---|---|---|---|
| Formato de código inválido | validación Jakarta / illegal arg | 400 | `VALIDACION` | El código debe tener 14 caracteres A–Z y 0–9 |
| Código no existe | `CodigoNoEncontradoException` | 404 | `CODIGO_NO_ENCONTRADO` | El código de verificación ingresado no existe |
| Código expirado | `CodigoExpiradoException` | 410 | `CODIGO_EXPIRADO` | El código de verificación ha expirado. La vigencia es de 60 días desde la expedición |
| PDF ausente en almacenamiento | `ArchivoNoEncontradoException` | 404 | `ARCHIVO_NO_ENCONTRADO` | El archivo no está disponible temporalmente |
| Almacenamiento no disponible | `AlmacenamientoNoDisponibleException` | 503 | `SERVICIO_NO_DISPONIBLE` | El servicio no está disponible en este momento |
| Rate limit | `RateLimitFilter` | 429 | `RATE_LIMIT_EXCEDIDO` | Demasiadas solicitudes; reintente más tarde |
| Error inesperado | catch-all | 500 | `ERROR_INTERNO` | (genérico; sin stack ni PII) |

## Reglas

- **410** es obligatorio para expirados (no usar 422).
- Mensajes de 404 de código MUST NOT revelar indicios de enumeración (sin “similar a…”, sin historial).
- Distinguir 404 código vs 404 archivo es aceptable: el archivo solo se consulta tras código vigente.
- Toda respuesta incluye `correlationId`.
- Extender `GlobalExceptionHandler` en `shared-auth` (o advice local solo si no se puede compartir 410/503 sin acoplar) manteniendo una única traducción HTTP.

## Cambios en shared-auth / shared-kernel

- Añadir `CodigoExpiradoException` (extiende `DomainException`) → `@ExceptionHandler` → **410**.
- Añadir `AlmacenamientoNoDisponibleException` en `shared-kernel` (extiende `DomainException`; admite causa para encadenar el error de S3) → `@ExceptionHandler` → **503** `SERVICIO_NO_DISPONIBLE`. La lanza `S3StorageService` ante timeouts/conectividad (no ante `NoSuchKey`).
- Añadir handlers para `CodigoNoEncontradoException` / `ArchivoNoEncontradoException` → 404.
- 429: el `RateLimitFilter` puede escribir la respuesta directamente (no obligatorio propagar como excepción).
