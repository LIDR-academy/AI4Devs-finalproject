# Contract — Manejo de Errores y Respuesta Estándar

**Feature**: `002-nucleo-compartido-seguridad`

## `ApiResponse<T>` (forma)

Éxito:

```json
{
  "success": true,
  "data": { "...": "..." },
  "error": null,
  "correlationId": "b3f1...",
  "timestamp": "2026-07-28T15:30:00Z"
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": { "code": "REGLA_NEGOCIO", "message": "Mensaje legible" },
  "correlationId": "b3f1...",
  "timestamp": "2026-07-28T15:30:00Z"
}
```

## Mapeo de excepciones → HTTP (`GlobalExceptionHandler`)

| Situación | HTTP | `error.code` |
|---|---|---|
| `RecursoNoEncontradoException` | 404 | `RECURSO_NO_ENCONTRADO` |
| `ConflictoEstadoException` | 409 | `CONFLICTO_ESTADO` |
| `ReglaNegocioException` | 422 | `REGLA_NEGOCIO` |
| Validación de entrada (Jakarta) | 400 | `VALIDACION` |
| Excepción inesperada | 500 | `ERROR_INTERNO` |

## Reglas

- El cuerpo de error NUNCA incluye trazas de stack, PII ni tokens.
- Toda respuesta (éxito o error) incluye `correlationId` (del `CorrelationIdFilter`).
- El `GlobalExceptionHandler` es la única fuente de traducción de errores a HTTP.
