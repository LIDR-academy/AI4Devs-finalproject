# Informe de pruebas de endpoints — Paso 8 · T-04-01

**Fecha:** 2026-05-30  
**Rama:** `feature/T-04-01-express-layer-scaffold`  
**Servidor:** `npm run api` en `http://localhost:3001`  
**Seed:** aplicado (`npm run db:seed`)

## GET /health

**Comando:** `curl -s http://localhost:3001/health`

**Respuesta:**

```json
{"status":"ok","timestamp":"2026-05-30T14:17:17.443Z"}
```

| Criterio | Resultado |
|----------|-----------|
| HTTP 200 | **PASS** |
| `status` = `"ok"` | **PASS** |
| `timestamp` ISO-8601 | **PASS** |

## GET /api/profile (regresión T-03-03)

**Comando:** `curl -s http://localhost:3001/api/profile`

**Respuesta:**

```json
{"id":1,"name":"Demo User","email":"demo@ConRutina.app"}
```

| Criterio | Resultado |
|----------|-----------|
| HTTP 200 | **PASS** |
| Usuario demo id=1 | **PASS** |

## CORS (opcional)

**Comando:** `curl -H "Origin: http://localhost:5173" -v http://localhost:3001/health`

| Criterio | Resultado |
|----------|-----------|
| Header `Access-Control-Allow-Origin: http://localhost:5173` | **PASS** |

## Resultado global paso 8

**PASS**
