# Evidencia - Pickup Visual Calibration Homography

## Objetivo

Corregir el calculo de pose de pickup de `single_cube_pick_drop.py` para usar
calibracion visual real del pickup mediante `cornersPx` y homografia, alineado
con el spike `dynamic_pickup_maxarm_pick`, en vez de depender solo de `imageRoi`.

## Fecha

2026-07-05

## Rama y commit

- Rama: `finalproject-ASP`
- Commit base: `60248c8ed3f7c0139b0217dc79d574757b204823`

## Problema observado

El primer pick/drop fisico controlado movio correctamente el MaxArm y activo la
secuencia esperada, pero no logro tomar el cubo. La comunicacion serial, la
secuencia de movimiento y la seleccion de drop zone parecian correctas.

## Hipotesis

La pose de pickup estaba desplazada porque el flujo integrado mapeaba el centro
del cubo usando `imageRoi` rectangular. Ese fallback no corrige perspectiva ni
usa las cuatro esquinas reales del pickup vistas por la camara.

## Hallazgo

El spike validado usa:

- `pickup_calibration.json` con `pickup_width_cm=13.5`,
  `pickup_height_cm=7`, `cube_size_cm=2.5` y `corners_px`;
- homografia desde las esquinas del pickup hacia una vista normalizada;
- posicion fisica del cubo en centimetros;
- `pickup_robot_calibration.json` con `robot_corners`, `safe_z` y `pick_z`;
- interpolacion bilineal cm -> robot.

## Cambios realizados

- Se agrego `visualCalibration` a `robotPlanning.calibration`.
- Se parsean `pickupWidthCm`, `pickupHeightCm`, `cubeSizeCm` y
  `cornersPx.topLeft/topRight/bottomRight/bottomLeft`.
- El planner transforma centro de cubo en frame-pixels a `pickupPositionCm`
  mediante homografia y luego interpola contra `robotCorners`.
- `imageRoi` queda como fallback legacy para plan-only/pruebas, no como gate de
  hardware.
- Hardware queda bloqueado si falta `visualCalibration`, si `cornersPx` esta
  incompleto, si la version es placeholder, si `robotCorners` falta/placeholder
  o si se intenta operar solo con `imageRoi`.
- La evidencia del plan expone `pickupPositionCm`, `visualCalibrationUsed`,
  `homographyUsed`, `pickupTarget` y `pickupSafe`.
- Se actualizo el ejemplo versionado de configuracion con estructura segura y
  valores placeholder.
- Se actualizo `edge/README.md` y `docs/api-design.md`.

## Tests ejecutados

```powershell
cd edge
python -m pytest -q
```

Resultado:

```text
128 passed in 1.75s
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
built in 681ms
```

## Resultado esperado

`single_cube_pick_drop.py --plan-only` debe producir un plan con:

- centro del cubo en frame;
- `pickupPositionCm`;
- `visualCalibrationUsed=true`;
- `homographyUsed=true`;
- `pickupTarget` y `pickupSafe` calculados desde `cornersPx`;
- `serialOpened=false`;
- `hardwareMovement=false`.

La ejecucion fisica debe seguir bloqueada hasta contar con configuracion local
real y dry-run coincidente. No se debe repetir pick/drop si falla pickup: primero
se revisa evidencia, se recalibra y se genera nuevo plan-only.

## Checklist de seguridad

- No se abrio puerto serial.
- No se movio MaxArm.
- No se ejecuto succion.
- No se uso `mode=hardware`.
- No se modifico `_local_context/`.
- No se modificaron configs locales no versionables.
- Los tests no usan hardware real.
- `imageRoi` queda bloqueado para hardware si es la unica calibracion visual.

## Conclusion

APROBADO.

La correccion de homografia y los gates de seguridad quedan implementados y
probados en Edge, Backend y Frontend. La ejecucion fisica sigue condicionada a
configuracion local real, dry-run coincidente y checklist operativo completo.
