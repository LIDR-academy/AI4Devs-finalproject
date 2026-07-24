# Evidencia vision sync idempotency

## Objetivo

Corregir la duplicacion de cubos registrados en sesion cuando Edge Vision o el
dashboard refrescan el snapshot de camara cada pocos segundos.

## Identificacion

- Fecha: 2026-07-04.
- Rama: `finalproject-ASP`.
- Commit actual al registrar evidencia: `351fd0f6ee78bec375cbc48faaca8d268153ab2c`.
- Veredicto: **APROBADO CON OBSERVACIONES**.

## Problema observado

La camara cenital detectaba una escena estable con conteos cercanos a:

- red=1
- blue=1
- green=2
- yellow=2

Pero los cubos registrados en Backend crecian en cada polling hasta valores como
red=84, blue=102, green=208 y yellow=206. Esto indicaba que cada sincronizacion
insertaba nuevos cubos en vez de representar el estado actual de vision.

## Causa probable

El endpoint de sincronizacion usaba codigos por `snapshotSignature` y
`skipDuplicates`, lo que evitaba duplicar exactamente la misma firma. Sin
embargo, pequenas variaciones de bounding boxes entre frames generaban firmas
nuevas. Cada firma nueva agregaba otro set de cubos sin eliminar el set OpenCV
anterior.

## Cambios realizados

### Backend

- `POST /vision/snapshots/sync` ahora trata los cubos OpenCV como estado actual.
- Si `snapshotSignature` ya fue procesada, responde `alreadyProcessed=true` e
  `ignored > 0` sin borrar ni crear cubos.
- Si llega un snapshot nuevo valido:
  - reutiliza o crea sesion activa por `truckCode`;
  - elimina cubos previos de la sesion con `metadata.source=opencv-file` o
    `metadata.source=opencv-camera`;
  - inserta solo los cubos actuales del snapshot;
  - devuelve `replaced`, `detectionsRegistered`, `alreadyProcessed=false`.
- El dashboard usa `lastVisionCounts` como conteo operativo cuando existe un
  ultimo snapshot OpenCV, evitando mostrar conteos acumulados contaminados.
- La inferencia del ultimo snapshot de vision ordena por `createdAt`.

### Edge

- `snapshotSignature` ya se calcula desde QR, fuente, ROI, dimensiones y
  detecciones, no desde timestamp puro.
- `/vision/status` expone `lastSyncedSnapshotSignature`.
- `--sync-backend` y `POST /vision/sync-backend` no reenvian la misma firma
  dentro del mismo proceso.

### Frontend

- El panel de vision muestra `Firma sincronizada`.
- Se conserva el auto-refresh; no se redujo polling como solucion.

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

## Resultados de tests

- Edge: **PASS, 91 passed**.
- Backend tests: **PASS, 3 files / 13 tests**.
- Backend build: **PASS**.
- Frontend build: **PASS**.

## Ejemplos de respuesta

### `/vision/snapshot`

```json
{
  "truckCode": "TRUCK-001",
  "snapshotSignature": "sig-001",
  "qrDetected": true,
  "qrValid": true,
  "qrStatus": "OK",
  "counts": { "red": 1, "blue": 1, "green": 2, "yellow": 2 }
}
```

### `POST /vision/snapshots/sync` repetido

```json
{
  "visionSync": {
    "snapshotSignature": "sig-001",
    "detectionsReceived": 6,
    "detectionsRegistered": 0,
    "replaced": 0,
    "duplicated": 6,
    "ignored": 6,
    "alreadyProcessed": true,
    "status": "already_processed"
  }
}
```

### `/dashboard/operational` corregido

```json
{
  "activeSession": { "truckCode": "TRUCK-001" },
  "counts": { "red": 1, "blue": 1, "green": 2, "yellow": 2, "total": 6 },
  "lastVisionCounts": { "red": 1, "blue": 1, "green": 2, "yellow": 2, "total": 6 },
  "lastVisionSnapshot": "sig-001"
}
```

## Prueba manual de no duplicacion

1. Levantar Backend.
2. Levantar Edge Vision con `cameraIndex=1`, QR valido y `--sync-backend`.
3. Abrir Dashboard.
4. Observar varios ciclos de auto-refresh.
5. Validar que `Cubos registrados en sesion` no crece indefinidamente y se
   mantiene cercano al estado real de vision.

## Limpieza segura de datos contaminados

Si una sesion ya quedo contaminada por cubos OpenCV acumulados de pruebas
anteriores, no se limpia automaticamente. Procedimiento recomendado:

1. Detener Edge Vision.
2. Identificar la sesion de prueba activa.
3. Eliminar explicitamente solo cubos de esa sesion cuyo `metadata.source` sea
   `opencv-file` u `opencv-camera`.
4. Reiniciar Edge Vision y sincronizar un snapshot valido.

No aplicar esta limpieza sobre datos de evidencia que se quieran conservar.

## Checklist de seguridad

- [x] No se abrio puerto serial.
- [x] No se ejecuto MaxArm.
- [x] No se uso `mode=hardware`.
- [x] No se redujo polling como solucion.
- [x] `QR_NOT_DETECTED` no crea sesion ni registra cubos.
- [x] Edge Vision sigue funcionando si Backend esta apagado.
- [x] Dashboard sigue funcionando si Edge Vision esta apagado.
- [x] No se modifico `_local_context/`.
- [x] No se hizo commit ni push.

## Issues pendientes

- No se ejecuto una prueba E2E con PostgreSQL real y camara fisica en esta
  corrida; queda como validacion manual de demo.
- Cubos OpenCV historicos antiguos sin `metadata.source` no son eliminados por
  el reemplazo seguro; si existen, requieren limpieza manual controlada.
- La estrategia depende de que `snapshotSignature` represente todo el estado
  visual relevante. Hay tests unitarios para estabilidad/cambio de firma.

## Conclusion

**APROBADO CON OBSERVACIONES.**

La sincronizacion queda idempotente para polling repetido y representa el estado
actual de vision para snapshots nuevos. La observacion queda por falta de prueba
manual prolongada con camara cenital real, QR fisico y PostgreSQL activo.
