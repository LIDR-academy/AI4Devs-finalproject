# Evidencia - Single Cube Spike Alignment

## Objetivo

Auditar y alinear `single_cube_pick_drop.py` con el spike fisico validado
`dynamic_pickup_maxarm_pick` antes de permitir un pick/drop real con MaxArm.

## Identificacion

- Fecha: 2026-07-04
- Rama: `finalproject-ASP`
- Commit actual: `52740c6f6a61cf11ec954ae899519f11c70d408c`
- Prompt run: `008`
- Veredicto: **APROBADO CON OBSERVACIONES**

## Archivos revisados

- `edge/src/single_cube_pick_drop.py`
- `edge/src/robot/planner.py`
- `edge/src/robot/safety.py`
- `edge/src/robot/drop_zone_planner.py`
- `edge/src/robot/drop_zone_adapter.py`
- `edge/src/robot/maxarm_serial.py`
- `edge/src/models.py`
- `edge/src/config.py`
- `edge/config/single-cube-pick-drop.example.json`
- `edge/config/maxarm.safe-probe.example.json`
- `edge/README.md`
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/pick_dynamic_cube_with_maxarm.py`
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/drop_zones_config.json`
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/arm_named_poses.json`
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/config.json`
- `_local_context/spikes/experiments/dynamic_pickup_detection/pickup_calibration.json`
- `_local_context/spikes/experiments/dynamic_pickup_detection/pickup_robot_calibration.json`

## Secuencia del spike

```text
ready_to_take -> reset -> cube_safe_pose -> cube_target_pick -> lift_after_pick
-> reset_with_cube -> drop_zone_with_cube -> drop_zone_release
-> reset_without_cube -> ready_to_take_end
```

El spike usa `ready_to_take` y `reset` desde `arm_named_poses.json`, calcula
`lift_after_pick` como `target.z + 50`, selecciona drop zones por mismo color,
`active=true`, `occupied=false` y menor `position_order`, y marca ocupacion solo
despues de una descarga confirmada.

## Secuencia final del planner

```text
ready_to_take -> reset -> cube_safe_pose -> cube_target_pick -> lift_after_pick
-> reset_with_cube -> drop_safe_pose -> drop_zone_with_cube
-> drop_zone_release -> retract_after_release -> reset_without_cube
-> ready_to_take_end
```

## Diferencias encontradas

- `drop_safe_pose` es un paso extra antes de bajar a la zona de descarga. Se
  conserva porque aproxima el drop desde una Z segura.
- `retract_after_release` es un paso extra despues de soltar el cubo. Se conserva
  porque evita trasladar desde el punto bajo de descarga.
- El planner integrado valida mas que el spike: perfil, `dry_run`, run id,
  color, zona activa/libre, calibracion, workspace, Z seguras y ROI.
- El spike contiene una maniobra de parada segura ante fallos criticos. El flujo
  actual cierra serial, cancela reserva antes de release y registra error; una
  maniobra fisica de recuperacion queda como observacion para el siguiente gate.

## Cambios realizados

- Se agrego carga opcional de poses desde `robotPlanning.namedPosesPath`, con
  `readyPoseName` y `resetPoseName`, para usar archivos locales estilo
  `arm_named_poses.json` sin versionarlos.
- Se agrego gate fail-closed en `single_cube_pick_drop.py` antes de abrir serial:
  bloquea hardware con `calibration.version=REPLACE_WITH_LOCAL_CALIBRATION`,
  `robotCorners` placeholder, `imageRoi` placeholder, poses placeholder, Z,
  workspace/ROI invalidos o drop zones de ejemplo.
- `--plan-only` sigue permitido con configuracion placeholder, pero informa
  `safetyWarnings`, no abre serial y cancela la reserva.
- Se reforzaron tests de secuencia, named poses, drop zones, bloqueo hardware y
  plan-only.
- Se actualizo `edge/README.md` con comparacion contra el spike, mapeo de
  calibraciones/poses/drop zones y comandos seguros.

## Validaciones de seguridad

- No se abrio puerto serial.
- No se movio MaxArm.
- No se ejecuto succion.
- No se uso `mode=hardware` contra hardware real.
- No se modifico `_local_context/`.
- No se modificaron configs locales no versionables.
- Los tests usan `FakeSerial`; no hay COM real.
- Dry-run/plan-only cancela reserva y no persiste `occupied=true`.
- Hardware mock persiste `occupied=true` solo despues de `drop_zone_release`.

## Calibracion y mapeo

Existen archivos locales de referencia:

- `pickup_calibration.json`: dimensiones y `corners_px` del pickup.
- `pickup_robot_calibration.json`: `robot_corners`, `safe_z` y `pick_z`.

Mapeo documentado:

- `robot_corners.top_left` -> `robotPlanning.calibration.robotCorners.topLeft`
- `robot_corners.top_right` -> `topRight`
- `robot_corners.bottom_right` -> `bottomRight`
- `robot_corners.bottom_left` -> `bottomLeft`
- `safe_z` -> `robotPlanning.safeZ`
- `pick_z` -> `robotPlanning.pickZ`

Observacion: el spike usa cuadrilatero y homografia; Edge actual usa `imageRoi`
rectangular. Usar el bounding box de `corners_px` debe documentarse como
aproximacion, no como equivalencia fisica completa.

## Resultados de tests

Edge:

```powershell
cd edge
python -m pytest -q
```

Resultado: **PASS, 122 passed in 1.23s**.

Backend:

```powershell
cd backend
npm run build
```

Resultado: **PASS, `tsc` OK**.

Frontend:

```powershell
cd frontend
npm run build
```

Resultado: **PASS, `tsc && vite build` OK, 35 modules transformed**.

## Como repetir plan-only

```powershell
cd edge
python src\single_cube_pick_drop.py `
  --config config\single-cube-pick-drop.local.json `
  --snapshot ..\workspace\generated\vision-evidence\snapshot.json `
  --plan-only
```

Esperado: `status=DRY_RUN_PLANNED`, `serialOpened=false`,
`hardwareMovement=false`, `reservationOutcome=CANCELLED_AFTER_DRY_RUN`.

## Como validar bloqueo hardware con placeholder

```powershell
cd edge
python src\single_cube_pick_drop.py `
  --config config\single-cube-pick-drop.example.json `
  --snapshot ..\workspace\generated\vision-evidence\snapshot.json `
  --dry-run-evidence ..\workspace\generated\edge-evidence\single-cube-pick-drop\single-cube-plan-only-RUN_ID.json `
  --port COM4 `
  --confirm-pick-drop `
  --enable-hardware-motion `
  --confirm-zone-clear `
  --confirm-operator-present `
  --confirm-emergency-stop-ready `
  --confirm-suction
```

Esperado: error fail-closed antes de abrir serial, por ejemplo
`MISSING_REAL_PICKUP_ROBOT_CALIBRATION` o `PLACEHOLDER_ROBOT_CORNERS`.

## Conclusion

**APROBADO CON OBSERVACIONES.**

El flujo queda alineado con la secuencia fisica del spike y endurecido con dos
pasos seguros documentados. El modo hardware permanece bloqueado hasta contar
con calibracion local explicita y valida. La observacion principal es que no se
ejecuto movimiento fisico ni se valido una maniobra de recuperacion fisica ante
fallo critico; eso debe resolverse en un gate posterior antes de operar MaxArm.
