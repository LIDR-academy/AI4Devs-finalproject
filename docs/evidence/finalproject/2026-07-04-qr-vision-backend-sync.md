# Evidencia QR Vision Backend Sync

## Objetivo

Integrar QR real y sincronizacion de snapshots de Edge Vision con Backend para
que el Dashboard Operacional pueda mostrar camion y conteos persistidos
coherentes con la vision real, sin duplicar cubos por polling y sin mover MaxArm.

## Identificacion

- Fecha: 2026-07-04.
- Rama: `finalproject-ASP`.
- Commit actual al registrar evidencia: `150a83422485e1311760958b7e6cbfe1a83ef70d`.
- Veredicto: **APROBADO CON OBSERVACIONES**.

## Problema observado

El panel `Vision / Camara` podia mostrar cubos reales detectados por Edge Vision,
pero la parte superior del dashboard seguia mostrando datos persistidos desde
simulation/dry-run. Por eso los conteos podian diferir, por ejemplo 1 cubo
registrado en Backend versus 6 cubos detectados por camara.

## Cambios realizados

### Edge Vision

- `DetectionSnapshot` agrega metadata de QR: `qrDetected`, `qrValid`, `qrStatus`,
  `qrRawValue`, `qrRoi`, `counts` y `snapshotSignature`.
- `/vision/snapshot` expone `snapshotSignature`, estado QR, ROI QR, conteos,
  detecciones y `lastVisionSync`.
- Se agrego `POST /vision/sync-backend`.
- Se agregaron flags CLI `--sync-backend` y `--backend-url`.
- La sincronizacion exige QR valido; si no, responde `QR_NOT_DETECTED` o
  `QR_INVALID` y no llama al Backend.
- Edge evita reenviar dos veces la misma `snapshotSignature` dentro del mismo
  proceso.

### Backend

- Nuevo endpoint `POST /vision/snapshots/sync`.
- No se requirio migracion Prisma.
- El endpoint crea o reutiliza una sesion `IN_PROGRESS` para el `truckCode`.
- Registra cubos con codigos deterministas por `snapshotSignature`.
- Usa `createMany(..., skipDuplicates=true)` para evitar duplicados por polling.
- `GET /dashboard/operational` expone campos compatibles: `visionSync`,
  `lastVisionSnapshot`, `lastVisionTruckCode`, `lastVisionCounts` y
  `lastVisionError`.

### Frontend

- El panel de conteos superiores se etiqueta como `Cubos registrados en sesion`.
- El panel Edge Vision muestra `Truck code QR`, `qrDetected`, `qrValid`,
  `qrStatus`, `qrRoi`, `snapshotSignature` y ultimo sync Backend.
- Se mantiene degradacion segura si Edge Vision esta apagado.

## Comandos ejecutados

Desde `edge/`:

```powershell
python -m pytest -q
```

Desde `backend/`:

```powershell
npm.cmd test
npm run build
```

Desde `frontend/`:

```powershell
npm run build
```

## Resultados

- Edge Vision: **PASS, 86 passed**.
- Backend tests: **PASS, 3 files / 12 tests**.
- Backend build: **PASS**.
- Frontend build: **PASS**.

## Resultado QR

- QR valido produce `truckCode` y `qrStatus=OK`.
- QR ausente produce `QR_NOT_DETECTED` y no sincroniza.
- QR invalido produce `QR_INVALID` y no sincroniza.
- `qrRoi` sigue validandose por el pipeline de captura/ROI; un ROI fuera de
  rango falla de forma controlada.

## Resultado Backend

Ejemplo de request:

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

Ejemplo de respuesta:

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
    "duplicated": 0,
    "ignored": 0,
    "status": "synced"
  }
}
```

## Resultado Dashboard

`GET /dashboard/operational` mantiene los campos previos y agrega vision sync:

```json
{
  "activeSession": { "truckCode": "TRUCK-001" },
  "counts": { "red": 1, "blue": 0, "green": 0, "yellow": 0, "total": 1 },
  "visionSync": {
    "snapshotSignature": "sig-001",
    "source": "opencv-camera",
    "truckCode": "TRUCK-001",
    "qrDetected": true,
    "qrValid": true,
    "qrStatus": "OK",
    "cameraIndex": 1
  },
  "lastVisionTruckCode": "TRUCK-001",
  "lastVisionCounts": { "red": 1, "blue": 0, "green": 0, "yellow": 0, "total": 1 }
}
```

## Evidencia de no duplicacion

- Edge no reenvia dos veces la misma `snapshotSignature` dentro del proceso.
- Backend registra cubos con codigo deterministico `VISION-<snapshotSignature>-NNN`.
- Prisma aplica unicidad `sessionId + code` y `skipDuplicates`.
- Test Backend valida que un snapshot repetido reporta duplicados en vez de
  aumentar registros.

## Checklist de seguridad

- [x] No se abrio puerto serial.
- [x] No se ejecuto MaxArm.
- [x] No se uso `mode=hardware`.
- [x] No se cambio `dryRun=false`.
- [x] No se agregaron controles fisicos al dashboard.
- [x] No se agrego reset de drop zones al dashboard.
- [x] Edge Vision sigue funcionando si Backend esta apagado.
- [x] Dashboard sigue funcionando si Edge Vision esta apagado.
- [x] Snapshots sin QR valido no contaminan sesiones.
- [x] No se modifico `_local_context/`.
- [x] No se hizo commit ni push.

## Como probar manualmente

Backend:

```powershell
cd backend
npm run dev
```

Edge Vision con camara cenital y sync automatico:

```powershell
cd edge
python src\service\vision_api.py `
  --config config\edge.vision.local.json `
  --allow-camera `
  --sync-backend `
  --backend-url http://localhost:3000
```

Sync explicito:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8001/vision/sync-backend"
```

Dashboard:

```powershell
cd frontend
npm run dev
```

Verificar:

- QR visible dentro de `qrRoi`.
- `/vision/snapshot` muestra `truckCode`, `qrStatus=OK` y conteos.
- `/vision/sync-backend` responde `SYNCED` o `DUPLICATE_LOCAL`.
- `/dashboard/operational` muestra `activeSession.truckCode` y conteos
  persistidos coherentes.
- El panel de vision sigue mostrando conteos vivos separados.

## Issues pendientes

- Falta evidencia manual con QR fisico visible dentro de `qrRoi` y camara
  cenital real durante la demo.
- La idempotencia depende de que la firma sea estable para el mismo contenido;
  cambios leves de deteccion generan una nueva firma y nuevos registros, lo que
  es esperable para snapshots distintos.
- No se agregaron tests E2E con PostgreSQL real; la validacion Backend fue de
  contrato, servicio y build.

## Conclusion

**APROBADO CON OBSERVACIONES.**

La integracion QR -> Edge Vision -> Backend -> Dashboard queda implementada,
testeada e idempotente para polling. La observacion queda por falta de corrida
manual documentada con camara y QR fisicos.
