# API Design - Backend MVP Entrega 2

## Alcance

Este documento describe la API realmente implementada por el backend MVP de RoboDock AI para Entrega 2.

El backend implementa rutas sin prefijo `/api`.

Base URL local:

```text
http://localhost:3000
```

Modo principal:

```text
simulation
```

El backend registra datos simulados como si fueran enviados por Edge. No implementa control fisico real del MaxArm.

## Endpoints implementados

| Metodo | Ruta | Proposito |
|---|---|---|
| GET | `/health` | Verificar estado del backend |
| POST | `/sessions` | Crear sesion de descarga por `truckCode` |
| GET | `/sessions` | Listar sesiones |
| GET | `/sessions/:id` | Obtener sesion por UUID |
| POST | `/sessions/:id/cubes` | Registrar cubos simulados en una sesion |
| POST | `/robot/actions` | Registrar accion robot simulada |
| GET | `/dashboard/operational` | Consultar estado operacional agregado |

## Convenciones

- `id`: UUID tecnico interno.
- `code`: identificador funcional visible.
- Respuestas en JSON.
- Errores con mensaje y `correlationId`.
- Colores permitidos: `red`, `blue`, `green`, `yellow`.
- Modo principal: `simulation`.
- Modo `hardware` queda reservado para evolucion futura y no implica control fisico implementado.

## GET /health

Verifica que el backend esta vivo.

### Request

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/health"
```

### Response 200

```json
{
  "status": "ok",
  "service": "robodock-backend"
}
```

## POST /sessions

Crea una sesion de descarga para un camion identificado por codigo funcional.

### Request

```json
{
  "truckCode": "TRUCK-001"
}
```

### Response 201

```json
{
  "session": {
    "id": "uuid",
    "code": "UNLOAD-20260608-001",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
    "startedAt": "2026-06-09T01:06:25.803Z",
    "finishedAt": null,
    "cubes": [],
    "robotActions": []
  }
}
```

### Validaciones

- `truckCode` requerido.
- Formato esperado: `TRUCK-001`.

## GET /sessions

Lista sesiones registradas.

### Request

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/sessions"
```

### Response 200

```json
{
  "sessions": []
}
```

## GET /sessions/:id

Obtiene una sesion por UUID.

### Request

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/sessions/SESSION_ID"
```

### Response 200

```json
{
  "session": {
    "id": "uuid",
    "code": "UNLOAD-20260608-001",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
    "cubes": [],
    "robotActions": []
  }
}
```

### Response 404

```json
{
  "error": {
    "message": "Session not found",
    "correlationId": "uuid"
  }
}
```

## POST /sessions/:id/cubes

Registra cubos detectados o simulados dentro de una sesion.

### Request

```json
{
  "source": "simulation",
  "cubes": [
    {
      "color": "red",
      "x": 143,
      "y": 323,
      "w": 84,
      "h": 68,
      "confidence": 0.9
    }
  ]
}
```

### Response 201

```json
{
  "session": {
    "id": "uuid",
    "code": "UNLOAD-20260608-001",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
    "cubes": [
      {
        "id": "uuid",
        "code": "CUBE-001",
        "color": "red",
        "confidence": 0.9,
        "x": 143,
        "y": 323,
        "w": 84,
        "h": 68
      }
    ]
  }
}
```

### Validaciones

- La sesion debe existir.
- `cubes` debe ser un arreglo no vacio.
- Cada cubo debe tener `color` permitido.

## POST /robot/actions

Registra una accion simulada del robot.

### Request

```json
{
  "sessionId": "uuid",
  "actionType": "PICK_AND_DROP",
  "status": "SUCCESS",
  "mode": "simulation",
  "color": "red",
  "metadata": {
    "dryRun": true,
    "commandPreview": "POSE 32 -204 124 1"
  }
}
```

### Response 201

```json
{
  "action": {
    "id": "uuid",
    "code": "ACTION-001",
    "sessionId": "uuid",
    "actionType": "PICK_AND_DROP",
    "status": "SUCCESS",
    "mode": "simulation",
    "color": "red",
    "createdAt": "2026-06-09T01:06:25.895Z"
  }
}
```

### Validaciones

- `sessionId` requerido y existente.
- `actionType`: `PICK_AND_DROP`.
- `status`: `PLANNED`, `SUCCESS` o `ERROR`.
- `mode`: `simulation` o `hardware`.
- Para Entrega 2, `simulation` es el modo esperado.

## GET /dashboard/operational

Devuelve el estado operacional agregado para dashboard.

### Request

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard/operational"
```

### Response 200

```json
{
  "activeSession": {
    "id": "uuid",
    "code": "UNLOAD-20260608-001",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
    "startedAt": "2026-06-09T01:06:25.803Z",
    "finishedAt": null
  },
  "counts": {
    "red": 1,
    "blue": 1,
    "green": 0,
    "yellow": 0,
    "total": 2
  },
  "lastActions": [
    {
      "id": "uuid",
      "code": "ACTION-001",
      "actionType": "PICK_AND_DROP",
      "status": "SUCCESS",
      "mode": "simulation",
      "color": "red",
      "createdAt": "2026-06-09T01:06:25.895Z"
    }
  ]
}
```

## Nota sobre Prisma en Windows

Durante QA se observo una advertencia no bloqueante de Prisma en Windows:

```text
EPERM: operation not permitted, rename ... query_engine-windows.dll.node
```

La migracion termino con exit code 0 y el flujo backend funciono. Si se repite, cerrar procesos Node/Prisma activos y ejecutar:

```bash
npm run prisma:generate
```

## Fuera de alcance del MVP

- Control fisico real del MaxArm.
- Streaming de camara.
- Autenticacion y RBAC.
- Auditoria empresarial completa.
- WebSockets o colas.
