# Evidencia - Single Cube Pick/Drop Controlado

## Objetivo

Implementar y validar por software el primer flujo fisico controlado para
seleccionar un cubo real detectado por camara y descargarlo en la primera drop
zone activa/libre del mismo color usando MaxArm, con dry-run previo obligatorio,
confirmacion humana explicita y evidencia reproducible.

## Fecha

2026-07-04

## Rama y commit

- Rama: `finalproject-ASP`
- Commit base: `52740c6`

## Alcance

- Edge: implementado `single_cube_pick_drop.py`, config de ejemplo y tests.
- Backend: sin migraciones; se documenta metadata `mode=hardware` compatible con
  `POST /robot/actions`.
- Frontend: sin controles fisicos nuevos; build validado sin cambios.
- Hardware real: no ejecutado en esta sesion.

## Comandos ejecutados

```powershell
cd edge
python -m pytest -q
```

Resultado:

```text
115 passed in 1.22s
```

```powershell
cd backend
npm run build
```

Resultado:

```text
tsc
```

```powershell
cd frontend
npm run build
```

Resultado:

```text
tsc && vite build
35 modules transformed
built in 493ms
```

## Resultado plan-only

Validado por tests automatizados con serial mock:

- `status=DRY_RUN_PLANNED`
- `serialOpened=false`
- `hardwareMovement=false`
- `maxCubes=1`
- reserva cancelada despues del dry-run
- evidencia JSON escrita

Comando operativo:

```powershell
cd edge
python src\single_cube_pick_drop.py `
  --config config\single-cube-pick-drop.local.json `
  --snapshot ..\workspace\generated\vision-evidence\snapshot.json `
  --plan-only
```

## Resultado sin confirmacion

Validado por tests automatizados:

- sin flags obligatorios aborta con `CONFIRMATION_REQUIRED`
- sin `--dry-run-evidence` aborta antes de abrir serial
- sin QR valido aborta antes de abrir serial
- sin drop zone disponible aborta antes de abrir serial

Comando operativo esperado para probar gate:

```powershell
cd edge
python src\single_cube_pick_drop.py `
  --config config\single-cube-pick-drop.local.json `
  --snapshot ..\workspace\generated\vision-evidence\snapshot.json `
  --dry-run-evidence ..\workspace\generated\edge-evidence\single-cube-pick-drop\single-cube-plan-only-RUN_ID.json `
  --port COM4
```

## Procedimiento para ejecucion fisica

1. Levantar Backend si se registrara metadata.
2. Levantar Edge Vision o generar un snapshot JSON con QR valido.
3. Ejecutar `--plan-only` y revisar cubo, drop zone y comandos.
4. Confirmar checklist fisico completo.
5. Ejecutar un unico ciclo:

```powershell
cd edge
python src\single_cube_pick_drop.py `
  --config config\single-cube-pick-drop.local.json `
  --snapshot ..\workspace\generated\vision-evidence\snapshot.json `
  --dry-run-evidence ..\workspace\generated\edge-evidence\single-cube-pick-drop\single-cube-plan-only-RUN_ID.json `
  --port COM4 `
  --baudrate 115200 `
  --confirm-pick-drop `
  --enable-hardware-motion `
  --confirm-zone-clear `
  --confirm-operator-present `
  --confirm-emergency-stop-ready `
  --confirm-suction `
  --sync-backend `
  --backend-url http://localhost:3000
```

## Resultado fisico

No ejecutado desde esta sesion. El software queda preparado para G6, pero el
claim de pick/drop fisico requiere video, firmware `DONE`, evidencia JSON real y
accion Backend `mode=hardware` correlacionada.

## Ejemplo de evidencia JSON

```json
{
  "status": "SUCCESS",
  "serialOpened": true,
  "hardwareMovement": true,
  "suctionActivated": true,
  "pickupExecuted": true,
  "dropExecuted": true,
  "releaseConfirmed": true,
  "occupiedPersisted": true,
  "maxCubes": 1,
  "planFingerprint": {
    "snapshotSignature": "sig-single",
    "truckCode": "TRUCK-001",
    "selectedCubeColor": "red",
    "dropZoneCode": "DROP_RED_01",
    "positionOrder": 1,
    "commandsPreview": ["POSE 0 0 220 0", "POSE -10 -10 100 1"]
  },
  "firmwareResponses": [
    {
      "step": "drop_zone_release",
      "commandSent": "POSE 1 -1 81 0",
      "firmwareResponse": "DONE",
      "success": true
    }
  ]
}
```

## Checklist de seguridad

- Brazo estable.
- Camara y cables fuera del recorrido.
- Solo 1 cubo en zona de pickup o cubos bien separados.
- Drop zone del color seleccionado despejada.
- Puerto COM confirmado.
- Energia estable.
- Operador presente.
- Forma de cortar energia disponible.
- Nadie cerca del recorrido.
- Dry-run del mismo plan revisado.
- Succion revisada.
- Coordenadas revisadas.
- Plan y drop zone revisados visualmente.

## Issues pendientes

- Ejecutar G6 fisico real con operador y video.
- Usar config local calibrada; el ejemplo versionado contiene placeholders.
- Confirmar que el estado hardware dedicado de drop zones corresponde al mundo
  fisico antes de cada prueba.
- Registrar evidencia real de firmware y dashboard despues de una ejecucion.

## Conclusion

APROBADO CON OBSERVACIONES.

El software, los gates y la regresion automatizada quedan aprobados. La ejecucion
fisica real queda pendiente y no se declara como exitosa en esta evidencia.
