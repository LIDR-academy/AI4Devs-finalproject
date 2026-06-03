# Informe de pruebas manuales — Paso 7 · T-04-02

**Fecha:** 2026-05-30  
**Change:** `t-04-02-global-error-handler`  
**Rama:** `feature/T-04-02-global-error-handler`  
**Estado:** PASS

## Endpoints probados (curl)

### GET /health

```bash
curl.exe -s http://localhost:3001/health
```

**Respuesta:** HTTP 200

```json
{"status":"ok","timestamp":"2026-05-30T14:34:51.415Z"}
```

### GET /api/profile

```bash
curl.exe -s http://localhost:3001/api/profile
```

**Respuesta:** HTTP 200 — usuario demo id=1

```json
{"id":1,"name":"Demo User","email":"demo@ConRutina.app"}
```

## Mapeo de errores 400/500

Validado en **Vitest** (`errorHandler.test.ts`), no mediante ruta de provocación en producción:

| Escenario | Origen AC | Verificación |
|-----------|-----------|--------------|
| 500 `INTERNAL_ERROR` sin stack en production | US-04 S4 | Test unitario |
| 500 sin detalles de BD/Prisma al cliente | US-06 S4 | Test unitario |
| 400 `ValidationError` con `details` | US-19 S2 | Test unitario |
| 422 `INSUFFICIENT_POINTS` | US-19 S4 | Test unitario |

## Regresión

- Happy path de `/health` y `/api/profile` intacto.
- 404 de perfil mantiene formato legacy `{ error: "..." }` (alcance T-06-01).
