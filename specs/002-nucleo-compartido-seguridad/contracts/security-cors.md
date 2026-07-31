# Contract — Seguridad (Cognito Resource Server) y CORS

**Feature**: `002-nucleo-compartido-seguridad`

## Autorización

| Ruta | Requiere JWT | Respuesta sin/`token` inválido |
|---|---|---|
| `GET /health`, `/health/**`, `/actuator/health` | No (público) | 200 |
| `/api/**` (endpoints protegidos) | Sí (JWT Cognito) | 401 |

- El JWT se valida como **Resource Server**: firma contra el **JWKS del User Pool de Cognito**, `issuer` y `audience` (= `clientId`).
- Token ausente, firma inválida, issuer o audiencia incorrectos → **401** (no 403), sin revelar el motivo exacto.
- MAUC SSO NO interviene aquí (login de afiliados, feature aparte).

## CORS (centralizado por microservicio)

| Parámetro | Valor |
|---|---|
| `allowedOriginPatterns` | `https://*.ccb.org.co` (y `http://localhost:4200` solo en perfiles no productivos) |
| `allowedMethods` | `GET, POST, PUT, DELETE, OPTIONS` |
| `allowedHeaders` | `Authorization, Content-Type, X-Correlation-Id` |
| `exposedHeaders` | `X-Correlation-Id` |
| `allowCredentials` | `true` |
| `maxAge` | `3600` |

- PROHIBIDO combinar `allowCredentials=true` con origen comodín `*`.
- Un origen que no sea `*.ccb.org.co` es rechazado.
- La política se define de forma centralizada; no se relaja por endpoint.
