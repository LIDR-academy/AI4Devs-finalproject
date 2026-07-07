# Prompt-run: 2026-07-06-005-multicube-backend-sync-state-reset-ui

## 1. Fecha

2026-07-06.

## 2. Contexto tecnico previo

- Dashboard ya podia planificar y ejecutar descarga fisica multi-cubo.
- Edge Vision usaba `--unload-config` y la configuracion local ganadora en
  `single-cube-pick-drop.local.json`.
- `multi_cube_pick_drop.py` ya tenia retries de pickup y confirmacion fisica por
  vision post-drop.
- Reset de drop zones ya usaba `config/drop_zones.local.json` desde Edge.

## 3. Evidencia del problema

- Corrida fisica con `maxCubes=6`, `totalDetectedCubes=6` y
  `totalPlannedCubes=6`.
- Se descargaron fisicamente 5 cubos, pero Backend registro solo 4 acciones.
- El quinto cubo tuvo `physicalConfirmation.status=CONFIRMED`, pero el flujo lo
  reporto como `FAILED` por `Backend HTTP 500 en POST /robot/actions`.
- `totalExecutedCubes` quedo en 4 aunque la vision confirmo 5 descargas.
- `executedActions` no conservaba de forma confiable `selectedCubeColor` ni
  `dropZoneCode`.
- El Dashboard necesitaba mostrar con claridad reset drop zones y detalle de
  acciones multi-cubo.

## 4. Diagnostico

- La sincronizacion Backend se ejecutaba dentro del mismo bloque de errores que
  la ejecucion fisica, por lo que un fallo HTTP podia convertir una accion
  fisicamente confirmada en `FAILED`.
- El resultado final contaba acciones exitosas por `status=SUCCESS`, mezclando
  estado fisico con estado de sincronizacion.
- El payload hacia Backend podia crecer demasiado con trazas seriales completas,
  especialmente con retries.
- La UI necesitaba consumir contadores explicitos para no inferir estado fisico
  desde el resultado del backend sync.

## 5. Objetivos

- Separar `commandExecutionStatus`, `physicalConfirmation.status` y
  `backendSyncStatus`.
- Contar cubos fisicamente confirmados aunque falle Backend.
- Registrar errores Backend en `backendSyncError` sin borrar evidencia fisica.
- Conservar color, drop zone, target, offset y datos del cubo en
  `executedActions`.
- Permitir que Backend acepte metadata multi-cubo posterior con retries y
  confirmacion fisica.
- Mostrar en Dashboard contadores de ejecucion fisica, sync Backend y detalle de
  acciones ejecutadas.

## 6. Cambios implementados

- Edge:
  - `executedActions` conserva identidad del plan: color, drop zone, orden,
    cubo seleccionado, centro, bounding box, targets y offset.
  - Cada accion inicializa `backendSyncStatus=SKIPPED`.
  - Si Backend falla despues de una confirmacion fisica, la accion queda
    `SUCCESS_WITH_BACKEND_SYNC_FAILED`, `commandExecutionStatus=SUCCESS`,
    `physicalConfirmation.status=CONFIRMED` y `backendSyncStatus=FAILED`.
  - El flujo general queda `PARTIAL_SUCCESS` si el fallo backend detiene cubos
    posteriores.
  - Se agregaron contadores: `totalPhysicalConfirmedCubes`,
    `totalBackendSyncedActions`, `totalBackendSyncFailedActions`,
    `totalFailedPhysicalConfirmations` y `lastBackendSyncError`.
  - El payload de Backend resume `firmwareResponses` a las ultimas 24 entradas
    cuando la traza crece, manteniendo conteo y flag de truncado.
- Backend:
  - Tests de validador cubren metadata multi-cubo con `sequenceNumber=5`,
    retries, `physicalConfirmation`, `firmwareResponses` y
    `backendSyncStatus`.
  - La proyeccion de metadata para dashboard incluye campos multi-cubo
    relevantes.
- Frontend:
  - Tipos Edge incluyen contadores nuevos, `backendSyncStatus`,
    `backendSyncError`, `commandExecutionStatus` y `backendActionCode`.
  - El panel muestra cubos fisicamente confirmados, sync backend OK/fallido y
    tabla de acciones ejecutadas.
  - El resultado de reset drop zones sigue en estado local y no se borra por
    auto-refresh.
- Docs:
  - `edge/README.md` documenta la diferencia entre estados fisicos, comando y
    backend sync.
  - `frontend/README.md` documenta los campos nuevos visibles en dashboard.

## 7. Archivos modificados

- `edge/src/multi_cube_pick_drop.py`
- `edge/tests/test_multi_cube_pick_drop.py`
- `backend/src/modules/robot/robot.metadata.ts`
- `backend/src/modules/robot/robot.validators.test.ts`
- `frontend/src/types/edgeVision.ts`
- `frontend/src/components/PhysicalUnloadPanel.tsx`
- `edge/README.md`
- `frontend/README.md`
- `docs/prompt-runs-finalproject/2026-07-06-005-multicube-backend-sync-state-reset-ui.md`

## 8. Tests ejecutados

- `python -m pytest edge\tests\test_multi_cube_pick_drop.py -q`
- `npm.cmd test -- --run src/modules/robot/robot.validators.test.ts`
- `python -m pytest -q` en `edge/`
- `npm.cmd run build` en `backend/`
- `npm.cmd test --if-present` en `backend/`
- `npm.cmd run build` en `frontend/`
- `npm.cmd test --if-present` en `frontend/`

## 9. Resultado de validaciones

- Edge multi-cubo: 16 tests pasaron.
- Backend robot validators: 9 tests pasaron.
- Edge completo: 170 tests pasaron.
- Backend build TypeScript: exitoso.
- Backend tests: 16 tests pasaron.
- Frontend build TypeScript/Vite: exitoso.
- Frontend tests: no hay script configurado; `npm.cmd test --if-present`
  termino sin ejecutar suite.

## 10. Pruebas manuales pendientes

- Levantar Backend, Edge Vision y Dashboard con configuracion local real.
- Presionar `Reset drop zones` y confirmar status, archivo, slots, backup y
  colores visibles.
- Planificar y ejecutar descarga full desde Dashboard.
- Confirmar que una accion fisicamente confirmada con fallo Backend muestra:
  `totalPhysicalConfirmedCubes` correcto, `backendSyncStatus=FAILED` en la accion
  afectada y resultado general `PARTIAL_SUCCESS`.

## 11. Riesgos o limitaciones

- Las pruebas automatizadas no mueven hardware real ni validan camara fisica.
- Si Backend falla, el criterio sigue siendo conservador: se detiene la corrida
  posterior aunque no se pierda la confirmacion fisica ya obtenida.
- Frontend no tiene suite automatizada de componentes configurada; la validacion
  de render se cubre con build y prueba manual.
