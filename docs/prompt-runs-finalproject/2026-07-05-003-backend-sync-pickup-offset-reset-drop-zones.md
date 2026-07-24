# Prompt-run: 2026-07-05-003-backend-sync-pickup-offset-reset-drop-zones

## Fecha

2026-07-05

## Contexto tecnico previo

RoboDock AI ya tenia funcionando el flujo fisico `single_cube_pick_drop` con
vision real, QR, deteccion de cubos, homografia, `pickupPositionCm`,
movimiento MaxArm, succion y drop zone.

El exito fisico previo dependia de pausas de movimiento, calibracion visual con
homografia y un ajuste local aplicado sobre `robotCorners`. Este prompt-run
ordena ese flujo sin modificar los archivos locales ni la calibracion ganadora.

Se abordaron tres mejoras pendientes:

1. Corregir el fallo de sincronizacion backend con `--sync-backend`.
2. Formalizar `pickupOffset` en config.
3. Agregar reset formal y seguro de drop zones.

## Objetivos solicitados

- Revisar contrato `POST /robot/actions`, payload Edge y validadores backend.
- Hacer que Backend acepte metadata de hardware real y responda 4xx claro ante
  metadata invalida.
- Normalizar payload Edge para evitar valores no JSON-safe en el POST.
- Agregar `robotPlanning.pickupOffset` con default `0,0,0`.
- Aplicar el offset solo a pickup y poses derivadas, no a drop zones ni poses
  globales.
- Incluir offset en evidencia y `planFingerprint`.
- Crear `edge/src/reset_drop_zones.py` con backup y confirmacion obligatoria.
- Actualizar `edge/README.md`.
- Ejecutar validaciones Edge, Backend y Frontend.

## Cambios implementados

- Backend:
  - `normalizeRobotMetadata` ahora valida metadata JSON-safe, rechazando
    `undefined` y numeros no finitos con 400.
  - Se agrego test de contrato para metadata hardware real enviada por Edge.
  - El handler de errores inesperados registra metodo, ruta y `correlationId`.

- Edge:
  - `RobotPlanningConfig` soporta `pickup_offset` desde
    `robotPlanning.pickupOffset`.
  - El planner calcula `pickupTargetBase` y aplica `pickupOffset` solo a
    `pickupTarget`, `pickupSafe` y `lift_after_pick`.
  - La evidencia y `planFingerprint` incluyen `pickupOffset` y
    `pickupTargetBase`.
  - El payload hardware de `--sync-backend` se normaliza para omitir valores no
    disponibles y rechazar numeros no finitos antes del POST.
  - Se agrego `reset_drop_zones.py` con `--all`, `--color` y
    `--confirm-reset`.

- Documentacion:
  - `edge/README.md` documenta `pickupOffset`, reset de drop zones y ejecucion
    hardware con `--sync-backend`.
  - `edge/config/single-cube-pick-drop.example.json` incluye el bloque
    `pickupOffset`.

## Archivos modificados

- `backend/src/middleware/error-handler.ts`
- `backend/src/modules/robot/robot.metadata.ts`
- `backend/src/modules/robot/robot.validators.test.ts`
- `edge/README.md`
- `edge/config/single-cube-pick-drop.example.json`
- `edge/src/config.py`
- `edge/src/edge_dry_run.py`
- `edge/src/robot/planner.py`
- `edge/src/single_cube_pick_drop.py`
- `edge/src/reset_drop_zones.py`
- `edge/tests/test_config.py`
- `edge/tests/test_robot_action_planner.py`
- `edge/tests/test_single_cube_pick_drop.py`
- `edge/tests/test_reset_drop_zones.py`

## Validaciones ejecutadas

- `cd edge && python -m pytest -q`
- `cd backend && npm.cmd run build`
- `cd backend && npm.cmd test`
- `cd frontend && npm.cmd run build`

Nota: un primer intento de test backend con `npm` fallo por politica local de
PowerShell sobre `npm.ps1`; se ejecuto correctamente con `npm.cmd`.

## Resultado de tests

- Edge: 141 passed.
- Backend build: OK.
- Backend tests: 3 files passed, 14 tests passed.
- Frontend build: OK.

## Pruebas manuales pendientes

- Ejecutar `single_cube_pick_drop.py --sync-backend` contra Backend y hardware
  real para confirmar registro de accion `SUCCESS` en una corrida fisica.
- Ajustar `robotPlanning.pickupOffset` en
  `single-cube-pick-drop.local.json` con el valor ganador del montaje real.
- Usar `reset_drop_zones.py` sobre `drop_zones.local.json` despues de pruebas
  fisicas y verificar backup/ocupacion.

## Riesgos o consideraciones

- El offset cambia el fingerprint; despues de modificarlo se debe generar nueva
  evidencia `--plan-only` antes de mover hardware.
- `reset_drop_zones.py` no modifica `active`; si una zona esta deshabilitada
  seguira deshabilitada.
- El backend queda mas claro ante metadata invalida, pero la prueba definitiva
  del HTTP 500 original requiere repetir la corrida real con `--sync-backend`.
