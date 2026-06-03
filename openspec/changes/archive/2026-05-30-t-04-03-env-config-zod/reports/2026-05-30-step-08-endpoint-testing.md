# Informe de pruebas de endpoints — Paso 8 · T-04-03 env-config-zod

**Fecha:** 2026-05-30  
**Rama:** `feature/T-04-03-env-config-zod`  
**Estado:** PASS

## Backend en ejecución

API existente en `http://localhost:3001` (instancia previa en el entorno de desarrollo).

## Resultados curl / Invoke-RestMethod

### GET /health

- **URL:** `http://localhost:3001/health`
- **Status:** 200
- **Body:**

```json
{
  "status": "ok",
  "timestamp": "2026-05-30T15:46:51.976Z"
}
```

### GET /api/profile

- **URL:** `http://localhost:3001/api/profile`
- **Status:** 200
- **Body:**

```json
{
  "id": 1,
  "name": "Demo User",
  "email": "demo@ConRutina.app"
}
```

## Validación de variables de entorno

No hay endpoints nuevos en T-04-03. La validación de env se cubre en:

- Vitest: `backend/src/config.test.ts`
- Prueba manual de arranque fallido sin `DATABASE_URL` (informe paso 7)

## Regresión

El scaffold Express sigue operativo con config Zod integrado.
