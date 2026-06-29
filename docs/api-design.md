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
| PATCH | `/robot/actions/:id` | Finalizar una accion `PLANNED` como `SUCCESS` o `ERROR` |
| PATCH | `/sessions/:id` | Cerrar una sesion como `COMPLETED` o `ERROR` |
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

## API local Edge Vision

Estos endpoints pertenecen al servicio local Edge, no al Backend Express
principal. Su base URL recomendada para desarrollo es:

```text
http://localhost:8001
```

El servicio es opcional para el dashboard y no cambia los contratos del Backend.
No abre serial, no mueve MaxArm y no ejecuta `mode=hardware`.

| Metodo | Ruta | Proposito |
|---|---|---|
| GET | `/health` | Verificar estado del servicio Edge Vision |
| GET | `/vision/status` | Consultar perfil, fuente, ultimo snapshot y flags seguros |
| GET | `/vision/snapshot` | Procesar una captura configurada y devolver metadata segura |
| GET | `/vision/snapshot/image` | Devolver la ultima imagen anotada si existe |

`GET /vision/status` responde:

```json
{
  "status": "ok",
  "profile": "vision-dry-run",
  "source": "opencv-file",
  "cameraAllowed": false,
  "lastSnapshotAt": null,
  "lastError": null,
  "serialOpened": false,
  "hardwareMovement": false
}
```

`GET /vision/snapshot` responde:

```json
{
  "runId": "uuid",
  "timestamp": "2026-06-29T00:00:00Z",
  "source": "opencv-file",
  "truckCode": "TRUCK-003",
  "counts": { "red": 1, "blue": 1, "green": 2, "yellow": 2 },
  "detections": [],
  "imageUrl": "/vision/snapshot/image",
  "lastError": null
}
```

Si no hay imagen disponible, `GET /vision/snapshot/image` devuelve `404` con un
mensaje controlado. Si `vision.source=camera` se configura sin `--allow-camera`,
el servicio reporta error antes de abrir `VideoCapture`.

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

## Trazabilidad de dry-run

`POST /robot/actions` conserva el payload de Entrega 2 y admite metadata operacional:

```json
{
  "sessionId": "uuid",
  "actionType": "PICK_AND_DROP",
  "status": "PLANNED",
  "mode": "simulation",
  "color": "red",
  "metadata": {
    "runId": "run-001",
    "profile": "vision-dry-run",
    "dryRun": true,
    "source": "opencv-file",
    "selectedCube": { "color": "red", "x": 80, "y": 80, "w": 20, "h": 20, "confidence": 0.9 },
    "dropZoneCode": "DROP_RED_01",
    "positionOrder": 1,
    "releaseConfirmed": false,
    "statePersisted": false,
    "calibrationVersion": "pickup-v1"
  }
}
```

Para `profile=vision-dry-run`, el servidor impone `mode=simulation`, `dryRun=true`,
`serialOpened=false` y `hardwareMovement=false`. La metadata tiene límite de 32 KiB,
rechaza claves sensibles y sanitiza `errorMessage`.

Finalización controlada:

```http
PATCH /robot/actions/:id
Content-Type: application/json

{"status":"SUCCESS","metadata":{"outcome":"DRY_RUN_PLANNED"}}
```

Solo se permite `PLANNED -> SUCCESS|ERROR`; repetir el mismo estado terminal es
idempotente y cambiar un estado terminal devuelve `409`.

El cierre de sesión es explícito:

```http
PATCH /sessions/:id
Content-Type: application/json

{"status":"COMPLETED"}
```

También acepta `ERROR`, asigna `finishedAt` en el servidor y no permite reabrir una
sesión terminal. Edge deja la sesión `IN_PROGRESS` durante la demostración para que
continúe visible como `activeSession`.

El dashboard mantiene `activeSession`, `counts` y `lastActions`, y agrega
`profile`, `dryRun`, `visionSource`, `selectedCube`, `dropZoneCode`, `lastError`,
`updatedAt` y una proyección `execution` por acción. Estos datos son reportados por
Edge; no constituyen evidencia de movimiento físico.

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
      "createdAt": "2026-06-09T01:06:25.895Z",
      "updatedAt": "2026-06-09T01:06:26.100Z",
      "execution": {
        "runId": "run-001",
        "profile": "vision-dry-run",
        "dryRun": true,
        "visionSource": "opencv-file",
        "selectedCube": { "color": "red", "x": 80, "y": 80, "w": 20, "h": 20, "confidence": 0.9 },
        "dropZoneCode": "DROP_RED_01",
        "positionOrder": 1,
        "releaseConfirmed": false,
        "statePersisted": false,
        "configVersion": null,
        "calibrationVersion": "pickup-v1",
        "errorCode": null,
        "errorMessage": null
      }
    }
  ],
  "profile": "vision-dry-run",
  "dryRun": true,
  "visionSource": "opencv-file",
  "selectedCube": { "color": "red", "x": 80, "y": 80, "w": 20, "h": 20, "confidence": 0.9 },
  "dropZoneCode": "DROP_RED_01",
  "lastError": null,
  "updatedAt": "2026-06-09T01:06:26.100Z"
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
