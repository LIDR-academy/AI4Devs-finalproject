# Contract: Rate limiting verificación pública

**Feature**: `006-servicio-publico-verificacion` | **Date**: 2026-07-29

## Alcance


| Incluido                                         | Excluido                                       |
| ------------------------------------------------ | ---------------------------------------------- |
| `GET /api/v1/verificaciones/{codigo}`            | `/health`, `/health/**`, `/actuator/health/**` |
| `GET /api/v1/verificaciones/{codigo}/documento`  | Cualquier otra ruta del servicio               |
| `POST /api/v1/verificaciones/{codigo}/registros` |                                                |


## Política


| Parámetro   | Valor                                                      |
| ----------- | ---------------------------------------------------------- |
| Capacidad   | 100 tokens                                                 |
| Refill      | 100 tokens / segundo                                       |
| Dimensión   | Por IP del cliente                                         |
| Cupo        | **Único compartido** entre las tres operaciones            |
| Clave Redis | `rate:verificacion:{ip}`                                   |
| IP          | Primera de `X-Forwarded-For` si existe; si no, remote addr |




## Respuesta al exceder

- HTTP **429 Too Many Requests**
- Header `Retry-After: 1` (segundos) en la respuesta HTTP (útil para clientes no-browser / curl / IT)
- Cuerpo de error alineado a `ApiResponse` cuando sea posible (`error.code` p. ej. `RATE_LIMIT_EXCEDIDO`); el header es obligatorio aunque el cuerpo varíe
- **CORS:** MUST NOT añadir `Retry-After` ni `X-Forwarded-For` a `exposedHeaders` (constitución VI: solo `X-Correlation-Id`). El portal de verificación usa el status **429** y un backoff fijo de 1 s según este contrato; no depende de leer `Retry-After` desde JavaScript



## Fallback

Si Redis o el algoritmo de bucket no están disponibles:

1. **Permitir** la solicitud (fail-open).
2. Registrar WARN/ERROR operativo (sin bloquear el canal).
3. No degradar a rechazo masivo 429/503 por caída del limitador.

Criterio de éxito (SC-007): cualitativo — verificable en IT con Redis detenido; **no** se exige umbral porcentual (p. ej. 99%) en CI.



## Aislamiento

El exceso de una IP no afecta el cupo de otra IP.