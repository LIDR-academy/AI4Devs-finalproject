# Evidencia real vision dry-run planner

## Objetivo

Implementar y validar un flujo `vision-dry-run` que use el ultimo snapshot de
Edge Vision con QR valido y cubos reales detectados para seleccionar un cubo,
asignar una drop zone libre del mismo color, generar un plan conceptual
pick/drop y registrar la traza en Backend/Dashboard sin abrir serial ni mover
MaxArm.

## Identificacion

- Fecha: 2026-07-04.
- Rama: `finalproject-ASP`.
- Commit actual al registrar evidencia: `351fd0f6ee78bec375cbc48faaca8d268153ab2c`.
- Veredicto: **APROBADO CON OBSERVACIONES**.

## Problema resuelto

Edge Vision ya detectaba QR/cubos y podia sincronizar snapshots con Backend, pero
faltaba una ruta explicita para pasar desde "veo cubos" hacia "selecciono un
cubo real y planifico donde lo descargaria" usando el `DetectionSnapshot` vivo
del servicio local.

## Flujo implementado

1. `GET /vision/snapshot` captura o reutiliza el snapshot fresco.
2. `POST /vision/plan-dry-run` reutiliza ese `DetectionSnapshot`.
3. El flujo exige QR detectado, QR valido, `truckCode` y cubos detectados.
4. `CubeSelector` elige un cubo real elegible.
5. `DropZoneAdapter.reserve()` reserva en memoria un slot activo/libre del mismo
   color.
6. `RobotActionPlanner` genera secuencia conceptual y command previews.
7. La reserva se cancela en `finally`.
8. Si Backend esta configurado, se registra accion `PLANNED` y se finaliza como
   `SUCCESS` con `outcome=DRY_RUN_PLANNED`.
9. Dashboard proyecta firma, cubo, centro, bounding box, drop zone, pasos y
   errores.

## Comandos ejecutados

Edge:

```powershell
cd edge
python -m pytest -q
```

Resultado: **PASS, 97 passed**.

Backend:

```powershell
cd backend
npm.cmd test
npm run build
```

Resultado: **PASS, 3 files / 13 tests** y **build OK**.

Frontend:

```powershell
cd frontend
npm run build
```

Resultado: **build OK**.

## Resultados Edge

- `edge_dry_run.py` acepta snapshots `opencv-file` y `opencv-camera` para sync
  de metadata.
- Snapshot real sin QR devuelve `QR_NOT_DETECTED` y no planifica.
- QR invalido devuelve `QR_INVALID` y no planifica.
- Snapshot real con QR valido pero sin cubos devuelve `NO_CUBES_DETECTED`.
- Zona llena mantiene `ZONE_UNAVAILABLE`.
- Cubo rojo selecciona `DROP_RED_01`; cubo azul selecciona `DROP_BLUE_01`.
- El planner no abre serial.
- Dry-run no llama `confirm()`.
- Toda reserva se cancela al final.
- Metadata incluye `snapshotSignature`, `selectedCube`, centro, bounding box,
  `dropZoneCode`, pose, `sequencePreview` y `commandsPreview`.

## Resultados Backend

- No se requirio migracion Prisma.
- `POST /robot/actions` conserva compatibilidad y acepta metadata extendida.
- Para `profile=vision-dry-run`, Backend fuerza `mode=simulation`,
  `dryRun=true`, `serialOpened=false` y `hardwareMovement=false`.
- `GET /dashboard/operational` proyecta metadata segura adicional.
- Los endpoints previos siguen compilando y testeados.

## Resultados Dashboard

- El panel de trazabilidad muestra ultimo plan operacional.
- Si hay plan muestra firma de snapshot, cubo seleccionado, centro, bounding box,
  drop zone y cantidad de pasos.
- Si no hay accion muestra `SIN PLAN` y `Sin plan dry-run generado`.
- Si hay accion `ERROR` sin mensaje, muestra un fallback visible.
- El panel `Vision / Camara` muestra el ultimo resultado de
  `/vision/plan-dry-run` cuando existe.
- Dashboard sigue degradando si Edge Vision esta apagado.

## Ejemplo de selectedCube y dropZoneCode

```json
{
  "selectedCube": {
    "color": "red",
    "x": 10,
    "y": 20,
    "w": 30,
    "h": 40,
    "confidence": 0.9
  },
  "selectedCubeCenter": { "x": 25, "y": 40 },
  "selectedCubeBoundingBox": { "x": 10, "y": 20, "w": 30, "h": 40 },
  "dropZoneCode": "DROP_RED_01",
  "profile": "vision-dry-run",
  "dryRun": true
}
```

## Ejemplos de endpoints

`/vision/snapshot`:

```json
{
  "runId": "uuid",
  "source": "opencv-camera",
  "truckCode": "TRUCK-001",
  "snapshotSignature": "sig-001",
  "qrDetected": true,
  "qrValid": true,
  "qrStatus": "OK",
  "counts": { "red": 1, "blue": 1, "green": 2, "yellow": 2 },
  "detections": []
}
```

`POST /vision/plan-dry-run`:

```json
{
  "planned": true,
  "status": "DRY_RUN_PLANNED",
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

`/dashboard/operational`:

```json
{
  "profile": "vision-dry-run",
  "dryRun": true,
  "visionSource": "opencv-camera",
  "selectedCube": { "color": "red", "x": 10, "y": 20, "w": 30, "h": 40 },
  "dropZoneCode": "DROP_RED_01",
  "lastError": null
}
```

## Checklist de seguridad

- [x] No se abrio puerto serial.
- [x] No se ejecuto MaxArm.
- [x] No se uso `mode=hardware`.
- [x] No se cambio `dryRun=false`.
- [x] No se llamo `DropZoneAdapter.confirm()` en dry-run.
- [x] La reserva se cancela al final.
- [x] El estado canonico de drop zones no se modifica en `vision-dry-run`.
- [x] No se agregaron controles fisicos al dashboard.
- [x] No se agrego reset de drop zones al dashboard.
- [x] No se modifico `_local_context/`.
- [x] No se hizo commit ni push.

## Prueba manual recomendada

Backend:

```powershell
cd backend
npm run dev
```

Edge Vision con camara cenital `cameraIndex=1`:

```powershell
cd edge
python src\service\vision_api.py `
  --config config\edge.vision.local.json `
  --allow-camera `
  --backend-url http://localhost:3000
```

Ver snapshot:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:8001/vision/snapshot"
```

Sincronizar detecciones:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8001/vision/sync-backend"
```

Planificar dry-run:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8001/vision/plan-dry-run"
```

Ver Backend/Dashboard:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard/operational" | ConvertTo-Json -Depth 10
```

Frontend:

```powershell
cd frontend
npm run dev
```

## Issues pendientes

- Falta corrida manual documentada con camara cenital fisica, QR real visible y
  cubos reales en la escena.
- La evidencia automatizada usa fixtures/mocks para QR valido.
- La precision fisica de la calibracion y poses sigue pendiente de evidencia
  operacional del montaje real.

## Conclusion

**APROBADO CON OBSERVACIONES.**

El flujo de planificacion dry-run desde snapshot de Edge Vision queda
implementado, testeado y documentado. La observacion principal es que en esta
corrida no se ejecuto una prueba manual con hardware de camara/QR/cubos fisicos.
