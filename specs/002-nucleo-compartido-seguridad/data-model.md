# Data Model — Núcleo Compartido y Seguridad

**Feature**: `002-nucleo-compartido-seguridad` | **Date**: 2026-07-28

Esta feature no introduce entidades de datos de negocio. El "modelo" relevante es el **contrato de tipos compartidos** y la **taxonomía de errores → HTTP**.

## Tipos de `shared-kernel` (Java puro)

| Tipo | Forma | Notas |
|---|---|---|
| `Result<T>` | `sealed interface` con `Success<T>(value)` y `Failure<T>(error)` | `isSuccess()`, `isFailure()`, acceso a valor/error; sin excepciones verificadas |
| `DomainException` | Clase base (RuntimeException) | Raíz de la jerarquía de errores de dominio |
| `RecursoNoEncontradoException` | extends `DomainException` | → HTTP 404 |
| `ConflictoEstadoException` | extends `DomainException` | → HTTP 409 |
| `ReglaNegocioException` | extends `DomainException` | → HTTP 422 |
| `ApiResponse<T>` | `record` | Envoltorio estándar: éxito/datos o error; incluye `correlationId` y `timestamp` |

## Taxonomía de errores → HTTP (contrato del `GlobalExceptionHandler`)

| Excepción | HTTP | Cuerpo |
|---|---|---|
| `RecursoNoEncontradoException` | 404 | `ApiResponse` con error |
| `ConflictoEstadoException` | 409 | `ApiResponse` con error |
| `ReglaNegocioException` | 422 | `ApiResponse` con error |
| Error de validación (Jakarta Validation) | 400 | `ApiResponse` con detalle de campos |
| Cualquier otra excepción | 500 | `ApiResponse` genérico (sin filtrar trazas/PII) |

## Configuración de seguridad (`CognitoProperties`, prefix `security.cognito`)

| Propiedad | Fuente | Ejemplo (env) |
|---|---|---|
| `region` | env | `COGNITO_REGION` |
| `userPoolId` | env | `COGNITO_USER_POOL_ID` |
| `issuerUri` | env | `COGNITO_ISSUER_URI` |
| `jwkSetUri` | env | `COGNITO_JWK_SET_URI` |
| `clientId` (audiencia) | env | `COGNITO_CLIENT_ID` |
| `scopes` | env | `COGNITO_SCOPES` |

Todas parametrizables por ambiente; ninguna con valor por defecto sensible en texto claro.

## Invariantes (verificadas por tests / ArchUnit)

- **INV-A**: `shared-kernel` no depende de ningún framework (permanece Java puro).
- **INV-B**: `domain` y `application` NO dependen de `shared-auth`/`shared-web` (nueva regla ArchUnit).
- **INV-C**: `Result<T>` no expone excepciones verificadas en su API pública.
