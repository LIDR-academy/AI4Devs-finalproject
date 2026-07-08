# Prompt-run: 2026-07-07-001-continue-after-backend-sync-failure

## 1. Fecha

2026-07-07.

## 2. Contexto tecnico previo

- Dashboard ya planificaba y ejecutaba descarga full multi-cubo desde Edge.
- Edge usaba `--unload-config` y la configuracion local de
  `config/single-cube-pick-drop.local.json` para robotPlanning, drop zones,
  hardware, `physicalConfirmation` y `pickupRetry`.
- La prueba fisica local validada usaba `pickZ=138`,
  `physicalConfirmation.enabled=true`, `pickupRetry.enabled=true`,
  `hardware.port=COM4` y `baudrate=115200`.
- No se modificaron configs locales ni backups restringidos.

## 3. Evidencia del problema

- En una corrida full con 6 cubos planificados, MaxArm confirmo fisicamente 5
  descargas.
- La accion 5, verde hacia `DROP_GREEN_01`, quedo con
  `physicalConfirmation.status=CONFIRMED` pero `backendSyncStatus=FAILED`.
- Backend respondio HTTP 500 en `POST http://localhost:3000/robot/actions` con
  correlationId `c1c463e1-36bd-4239-8e93-61a643641ae1`.
- Por ese fallo de sync backend, el flujo se detuvo y el sexto cubo verde no se
  intento.

## 4. Diagnostico

- Edge ya separaba `physicalConfirmation.status` y `backendSyncStatus`, pero el
  bucle cortaba ante cualquier accion cuyo `status` no fuera `SUCCESS`.
- Una accion fisicamente confirmada con fallo backend quedaba como
  `SUCCESS_WITH_BACKEND_SYNC_FAILED`, pero esa variante seguia disparando el
  `break`.
- Backend tenia un limite de metadata de 32 KB que podia ser bajo para metadata
  multi-cubo avanzada con retries, confirmacion fisica y trazas de firmware.

## 5. Objetivos

- Evitar que un fallo de sync backend detenga cubos posteriores si la accion ya
  fue confirmada fisicamente.
- Mantener la accion como exito fisico, con `commandExecutionStatus=SUCCESS`,
  `physicalConfirmation.status=CONFIRMED` y `backendSyncStatus=FAILED`.
- Guardar error backend estructurado con codigo, mensaje y correlationId si
  existe.
- Reflejar contadores fisicos y de sync por separado en evidence, status y
  dashboard.
- Aceptar metadata multi-cubo avanzada en Backend sin HTTP 500 esperado.

## 6. Cambios implementados

- Edge:
  - `SUCCESS_WITH_BACKEND_SYNC_FAILED` ya no corta la ejecucion multi-cubo.
  - Un fallo backend posterior a confirmacion fisica no llena `error_code` fatal.
  - Se agrego `backendSyncErrorDetails` y `backendSyncCorrelationId` cuando el
    error contiene correlationId.
  - El resultado final usa `SUCCESS_WITH_BACKEND_SYNC_WARNINGS` cuando todos los
    cubos planificados fueron confirmados fisicamente pero hubo fallas de sync.
  - Se agregaron `totalAttemptedCubes`, `totalRemainingCubes` y
    `lastPhysicalError`.
  - `GET /robot/multi-cube/status` normaliza
    `SUCCESS_WITH_BACKEND_SYNC_WARNINGS` a
    `success_with_backend_sync_warnings`.
- Backend:
  - Se aumento `MAX_METADATA_BYTES` de 32 KB a 128 KB para metadata esperada de
    acciones multi-cubo.
  - La proyeccion de metadata incluye `backendSyncErrorDetails`.
  - El test de validators cubre metadata avanzada con `sequenceNumber=5`,
    retries, physical confirmation, firmware truncado y payload mayor a 32 KB.
- Frontend:
  - Tipos Edge incluyen `success_with_backend_sync_warnings`,
    `totalAttemptedCubes`, `totalRemainingCubes` y `lastPhysicalError`.
  - El panel muestra cubos fisicos OK, intentados, restantes, sync OK/fallido,
    ultimo error backend y ultimo error fisico.
  - El badge trata warnings de backend como advertencia, no como fallo fisico.
- Docs:
  - `edge/README.md` documenta la nueva politica de continuacion ante sync
    backend fallido con confirmacion fisica.
  - `frontend/README.md` documenta estados y contadores nuevos del dashboard.

## 7. Archivos modificados

- `edge/src/multi_cube_pick_drop.py`
- `edge/src/service/vision_api.py`
- `edge/tests/test_multi_cube_pick_drop.py`
- `backend/src/modules/robot/robot.metadata.ts`
- `backend/src/modules/robot/robot.validators.test.ts`
- `frontend/src/types/edgeVision.ts`
- `frontend/src/components/PhysicalUnloadPanel.tsx`
- `edge/README.md`
- `frontend/README.md`
- `docs/prompt-runs-finalproject/2026-07-07-001-continue-after-backend-sync-failure.md`

## 8. Tests ejecutados

- `python -m pytest edge\tests\test_multi_cube_pick_drop.py -q`
- `npm.cmd test -- --run src/modules/robot/robot.validators.test.ts`
- `python -m pytest -q` en `edge/`
- `npm.cmd run build` en `backend/`
- `npm.cmd test --if-present` en `backend/`
- `npm.cmd run build` en `frontend/`
- `npm.cmd test --if-present` en `frontend/`

## 9. Resultado de validaciones

- Edge multi-cubo focalizado: 16 tests pasaron.
- Backend robot validators: 9 tests pasaron.
- Edge completo: 170 tests pasaron.
- Backend build TypeScript: exitoso.
- Backend tests: 16 tests pasaron.
- Frontend build TypeScript/Vite: exitoso.
- Frontend tests: no hay script configurado; `npm.cmd test --if-present`
  termino sin ejecutar suite visible.

## 10. Pruebas manuales pendientes

- Levantar Backend, Edge Vision y Dashboard con la configuracion local real.
- Resetear drop zones desde Dashboard.
- Planificar descarga full.
- Ejecutar descarga full desde Dashboard.
- Confirmar que, si Backend falla en una accion fisicamente confirmada, el
  Dashboard muestra `backendSyncStatus=FAILED`, conserva
  `physicalConfirmation.status=CONFIRMED` y el flujo intenta el siguiente cubo.
- Confirmar que con 6 cubos fisicamente descargados y alguna falla backend:
  `totalPhysicalConfirmedCubes=6`,
  `totalBackendSyncFailedActions>0` y status final
  `SUCCESS_WITH_BACKEND_SYNC_WARNINGS`.

## 11. Riesgos o limitaciones

- Las pruebas automatizadas no mueven hardware real ni validan camara fisica.
- Si falla hardware, serial, seguridad o confirmacion fisica, la politica sigue
  deteniendo cubos posteriores.
- Frontend aun no tiene suite automatizada de componentes configurada; la
  validacion principal es build y prueba manual.
