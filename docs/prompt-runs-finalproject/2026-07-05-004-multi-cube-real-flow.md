# Prompt-run: 2026-07-05-004-multi-cube-real-flow

## Fecha de ejecucion

2026-07-05

## Contexto tecnico previo

- El flujo fisico single cube con MaxArm ya estaba validado.
- Edge Vision real, QR detection, deteccion por color, homografia visual y `pickupPositionCm` ya estaban operativos.
- `pickupOffset`, `movement.delay_seconds`, `pickup_hold_seconds`, `release_hold_seconds`, backend sync y reset formal de drop zones ya estaban implementados.
- El flujo probado antes de este prompt era principalmente `maxCubes=1`.

## Objetivos solicitados

- Implementar flujo real multi-cubo en Edge para planificar y ejecutar hasta `N` cubos.
- Respetar color, `max-cubes`, drop zones activas/libres por `positionOrder` y reservas en una misma corrida.
- Persistir `occupied=true` solo despues del release fisico de cada cubo.
- Generar evidencia multi-cubo clara con `plannedActions`, `executedActions` y `skippedCubes`.
- Agregar safety gates especificos para multi-cubo.
- Registrar una accion Backend por cubo ejecutado usando `/robot/actions`.
- Actualizar README Edge y documentar este prompt-run.
- Agregar tests de regresion para planificacion, offset, gates, parcial success, backend metadata y reset.

## Diseno elegido

Se eligio crear una nueva utilidad:

```text
edge/src/multi_cube_pick_drop.py
```

Motivo: evita complejizar `single_cube_pick_drop.py` y conserva la compatibilidad del flujo single cube ya validado. La utilidad nueva reutiliza modelos, `DropZoneAdapter`, `RobotActionPlanner`, serial MaxArm y helpers seguros del flujo single-cube.

## Cambios implementados

- Se agrego `CubeSelector.select_many()` con orden deterministico por color `red`, `blue`, `yellow`, `green`, luego posicion `y/x`, confianza y area.
- Se implemento `run_multi_cube_pick_drop()` con:
  - planificacion hasta `--max-cubes`;
  - reservas de drop zones por accion para no repetir slots;
  - skip controlado cuando no hay drop zone disponible;
  - evidencia `DRY_RUN_PLANNED`, `SUCCESS`, `PARTIAL_SUCCESS`, `FAILED`, `NO_CUBES_DETECTED` y `NO_VALID_QR`;
  - validacion opcional de `--dry-run-evidence`;
  - ejecucion serial secuencial con parada ante primer error;
  - persistencia de `occupied=true` despues de `drop_zone_release`;
  - metadata Backend JSON-safe por accion.
- Se agrego CLI `multi_cube_pick_drop.py` con `--plan-only`, `--snapshot`, `--edge-vision-url`, `--max-cubes`, gates multi-cubo, `--sync-backend` y `--dry-run-evidence`.
- Se dejo `--recapture-between-cubes` como opcion futura explicita que falla con `NOT_IMPLEMENTED`.
- Se agregaron tests unitarios multi-cubo.
- Se actualizo `edge/README.md` con el flujo manual recomendado para demo.

## Archivos modificados

- `edge/src/vision/cube_selector.py`
- `edge/src/multi_cube_pick_drop.py`
- `edge/tests/test_multi_cube_pick_drop.py`
- `edge/README.md`
- `docs/prompt-runs-finalproject/2026-07-05-004-multi-cube-real-flow.md`

## Validaciones ejecutadas

Validacion enfocada ejecutada durante la implementacion:

```powershell
cd C:\dev\AI4Devs\AI4Devs-finalproject\edge
python -m pytest tests\test_multi_cube_pick_drop.py tests\test_single_cube_pick_drop.py tests\test_reset_drop_zones.py -q
```

Resultado inicial:

```text
34 passed
```

## Resultado de tests

Suite final solicitada ejecutada:

```powershell
cd C:\dev\AI4Devs\AI4Devs-finalproject\edge
python -m pytest -q

cd C:\dev\AI4Devs\AI4Devs-finalproject\backend
npm run build
npm.cmd test --if-present

cd C:\dev\AI4Devs\AI4Devs-finalproject\frontend
npm run build
```

Resultados:

- Edge: `152 passed`.
- Backend build: OK.
- Backend tests: `3 passed`, `14 passed`.
- Frontend build: OK.

Nota: `npm test --if-present` fallo inicialmente por politica local de PowerShell al resolver `npm.ps1`; se reejecuto como `npm.cmd test --if-present` y paso correctamente.

## Pruebas manuales pendientes

- Ejecutar `reset_drop_zones.py` contra la configuracion local real.
- Levantar Backend y Edge Vision con camara cenital.
- Generar evidencia `--plan-only` multi-cubo desde snapshot real.
- Revisar visualmente `plannedActions`, drop zones, `pickupTarget` y comandos.
- Ejecutar hardware con MaxArm, operador presente y parada de emergencia lista.
- Verificar en dashboard/backend que se registren las acciones por cubo.

## Riesgos y limitaciones

- La version actual planifica varios cubos desde un unico snapshot y no recaptura entre cubos.
- El operador no debe mover los cubos ni el pickup entre plan-only y ejecucion.
- `successMeaning` sigue siendo `command_execution_only`; no se inventa confirmacion fisica automatica.
- Si Backend falla despues de mover hardware, el flujo se detiene y registra el detalle en evidencia.
- `--dry-run-evidence` es soportado para validar coincidencia, pero no es obligatorio por defecto en multi-cubo.
