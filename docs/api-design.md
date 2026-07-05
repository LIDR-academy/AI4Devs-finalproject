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
| POST | `/vision/snapshots/sync` | Sincronizar snapshot QR/OpenCV de Edge Vision con Backend |
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
| POST | `/vision/sync-backend` | Pedir a Edge que sincronice el snapshot valido con Backend |
| POST | `/vision/plan-dry-run` | Planificar pick/drop conceptual desde el ultimo snapshot valido |

`GET /vision/status` responde:

```json
{
  "status": "ok",
  "profile": "vision-dry-run",
  "source": "opencv-file",
  "configuredCameraIndex": null,
  "activeCameraIndex": null,
  "cameraAllowed": false,
  "lastSnapshotAt": null,
  "lastError": null,
  "serialOpened": false,
  "hardwareMovement": false
}
```

Cuando `source=opencv-camera`, `configuredCameraIndex` contiene el valor de
`vision.cameraIndex` y `activeCameraIndex` solo se informa despues de una captura
exitosa con ese mismo indice. Edge Vision no hace autodiscovery ni fallback a otra
camara.

`GET /vision/snapshot` responde:

```json
{
  "runId": "uuid",
  "timestamp": "2026-06-29T00:00:00Z",
  "source": "opencv-file",
  "truckCode": "TRUCK-003",
  "snapshotSignature": "abc123",
  "qrDetected": true,
  "qrValid": true,
  "qrStatus": "OK",
  "qrRoi": { "x": 500, "y": 180, "w": 140, "h": 170 },
  "counts": { "red": 1, "blue": 1, "green": 2, "yellow": 2 },
  "detections": [],
  "imageUrl": "/vision/snapshot/image",
  "lastVisionSync": null,
  "lastError": null
}
```

Si no hay imagen disponible, `GET /vision/snapshot/image` devuelve `404` con un
mensaje controlado. Si `vision.source=camera` se configura sin `--allow-camera`,
el servicio reporta error antes de abrir `VideoCapture`.

Para soportar snapshot polling, `/health`, `/vision/status`, `/vision/snapshot` y
`/vision/snapshot/image` responden con `Cache-Control: no-store`, `Pragma:
no-cache` y `Expires: 0`. El frontend solicita la imagen como
`/vision/snapshot/image?ts=<timestamp>` para evitar reutilizar imagenes viejas del
navegador.

`POST /vision/sync-backend` no pertenece al Backend Express: pertenece al
servicio local Edge. Si no hay QR valido devuelve un estado controlado como
`QR_NOT_DETECTED` o `QR_INVALID` y no llama al Backend.

`POST /vision/plan-dry-run` reutiliza el ultimo `DetectionSnapshot` en memoria
del servicio Edge Vision, o captura uno nuevo si esta vencido por TTL. Requisitos:
QR valido, `truckCode`, cubos detectados, `robotPlanning` valido y una drop zone
activa/libre del mismo color. En caso feliz devuelve:

```json
{
  "planned": true,
  "status": "DRY_RUN_PLANNED",
  "runId": "uuid",
  "snapshotSignature": "sig-001",
  "truckCode": "TRUCK-001",
  "selectedCubeColor": "red",
  "dropZoneCode": "DROP_RED_01",
  "dryRun": true,
  "profile": "vision-dry-run",
  "serialOpened": false,
  "hardwareMovement": false
}
```

Si falla devuelve `planned=false` y `status` controlado, por ejemplo
`QR_NOT_DETECTED`, `QR_INVALID`, `NO_CUBES_DETECTED`, `ZONE_UNAVAILABLE` o
`MISSING_CALIBRATION`. No registra accion exitosa si no puede planificar.

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
- Formato esperado: `TRUCK-*`; los ejemplos usan `TRUCK-001`.

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

## POST /vision/snapshots/sync

Sincroniza un snapshot real de Edge Vision. El Backend valida QR, crea o reutiliza
una sesion activa para `truckCode` y registra detecciones sin duplicarlas por
polling.

### Request

```json
{
  "runId": "run-001",
  "snapshotSignature": "sig-001",
  "timestamp": "2026-07-04T12:00:00.000Z",
  "source": "opencv-camera",
  "truckCode": "TRUCK-001",
  "qrDetected": true,
  "qrValid": true,
  "qrStatus": "OK",
  "cameraIndex": 1,
  "detections": [
    { "color": "red", "x": 10, "y": 20, "w": 30, "h": 30, "confidence": 0.9 }
  ]
}
```

### Response 200

```json
{
  "visionSync": {
    "sessionId": "uuid",
    "sessionCode": "UNLOAD-20260704-001",
    "truckCode": "TRUCK-001",
    "snapshotSignature": "sig-001",
    "counts": { "red": 1, "blue": 0, "green": 0, "yellow": 0, "total": 1 },
    "detectionsReceived": 1,
    "detectionsRegistered": 1,
    "replaced": 0,
    "duplicated": 0,
    "ignored": 0,
    "alreadyProcessed": false,
    "status": "synced"
  }
}
```

Repetir el mismo `snapshotSignature` para la misma sesion devuelve
`alreadyProcessed=true` e `ignored > 0`, sin borrar ni crear cubos. Si llega un
snapshot nuevo valido, el Backend reemplaza los cubos previos de fuente
`opencv-file`/`opencv-camera` de esa sesion por el estado actual del snapshot.
Esto evita que el polling convierta conteos de camara en una suma acumulativa.
Si `qrDetected=false`, `qrValid=false` o `qrStatus` no es `OK`, responde `400` y
no registra cubos.

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
    "snapshotSignature": "sig-001",
    "truckCode": "TRUCK-001",
    "profile": "vision-dry-run",
    "dryRun": true,
    "source": "opencv-file",
    "selectedCube": { "color": "red", "x": 80, "y": 80, "w": 20, "h": 20, "confidence": 0.9 },
    "selectedCubeColor": "red",
    "selectedCubeCenter": { "x": 90, "y": 90 },
    "selectedCubeBoundingBox": { "x": 80, "y": 80, "w": 20, "h": 20 },
    "dropZoneCode": "DROP_RED_01",
    "dropZonePose": { "x": 1, "y": 2, "z": 3 },
    "positionOrder": 1,
    "sequencePreview": ["ready_to_take", "cube_target_pick"],
    "commandsPreview": ["POSE 0 0 220 0"],
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
  "visionSync": {
    "snapshotSignature": "sig-001",
    "source": "opencv-camera",
    "truckCode": "TRUCK-001",
    "qrDetected": true,
    "qrValid": true,
    "qrStatus": "OK",
    "cameraIndex": 1,
    "counts": { "red": 1, "blue": 0, "green": 0, "yellow": 0, "total": 1 },
    "syncedAt": "2026-07-04T12:00:00.000Z"
  },
  "lastVisionSnapshot": "sig-001",
  "lastVisionTruckCode": "TRUCK-001",
  "lastVisionCounts": { "red": 1, "blue": 0, "green": 0, "yellow": 0, "total": 1 },
  "lastVisionError": null,
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

## Metadata para accion hardware controlada

`POST /robot/actions` sigue sin mover hardware. El movimiento fisico ocurre solo
en Edge. Cuando `single_cube_pick_drop.py` completa un ciclo real con todos los
gates, puede registrar una accion `mode=hardware` con metadata segura:

```json
{
  "sessionId": "uuid",
  "actionType": "PICK_AND_DROP",
  "status": "SUCCESS",
  "mode": "hardware",
  "color": "red",
  "metadata": {
    "runId": "run-001",
    "snapshotSignature": "sig-001",
    "truckCode": "TRUCK-001",
    "selectedCubeColor": "red",
    "selectedCubeCenter": { "x": 90.0, "y": 90.0 },
    "selectedCubeBoundingBox": { "x": 80, "y": 80, "w": 20, "h": 20 },
    "pickupPositionCm": { "x": 5.4, "y": 2.1 },
    "visualCalibrationVersion": "pickup-visual-local-2026-07-05",
    "visualCalibrationUsed": true,
    "homographyUsed": true,
    "pickupTarget": { "x": 39.44, "y": -183.88, "z": 138 },
    "pickupSafe": { "x": 39.44, "y": -183.88, "z": 150 },
    "dropZoneCode": "DROP_RED_01",
    "positionOrder": 1,
    "releaseConfirmed": true,
    "occupiedPersisted": true,
    "serialOpened": true,
    "hardwareMovement": true,
    "suctionActivated": true,
    "pickupExecuted": true,
    "dropExecuted": true,
    "firmwareResponses": [
      {
        "step": "drop_zone_release",
        "commandSent": "POSE 1 -1 81 0",
        "firmwareResponse": "DONE",
        "success": true
      }
    ],
    "errorCode": null
  }
}
```

Reglas:

- Backend registra la accion; no abre serial ni expone un endpoint de movimiento.
- `mode=hardware` solo debe enviarse desde Edge despues de movimiento real.
- `releaseConfirmed=true` y `occupiedPersisted=true` significan que Edge confirmo
  el release y persistio la drop zone despues de ese hito.
- `pickupPositionCm`, `visualCalibrationUsed=true` y `homographyUsed=true`
  documentan que la pose de pickup salio de `cornersPx` y homografia, no solo de
  un `imageRoi` rectangular.
- Si falla antes del release, Edge debe cancelar la reserva y registrar error sin
  marcar ocupacion.
- Si falla despues del release, Edge debe tratar la zona como fisicamente ocupada
  y registrar `errorCode`.

## Fuera de alcance del MVP

- Control fisico real del MaxArm.
- Streaming de camara.
- Autenticacion y RBAC.
- Auditoria empresarial completa.
- WebSockets o colas.
