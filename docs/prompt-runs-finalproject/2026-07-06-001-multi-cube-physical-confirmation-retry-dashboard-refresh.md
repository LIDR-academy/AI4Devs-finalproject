# Prompt-run: 2026-07-06-001-multi-cube-physical-confirmation-retry-dashboard-refresh

## Fecha

2026-07-06

## Contexto tecnico previo

- El flujo fisico single-cube con MaxArm ya funcionaba.
- El flujo multi-cubo ya existia.
- La ultima prueba multi-cubo fue `PARTIAL_SUCCESS`: el cubo rojo se tomo y descargo correctamente en `DROP_RED_01`.
- El cubo azul fue hacia `DROP_BLUE_01`, pero no logro succionar bien porque quedo alto.
- El segundo robot action tuvo HTTP 500 en Backend durante `--sync-backend`.
- El dashboard requeria presionar manualmente `Actualizar` para reflejar cambios en cubos y acciones.

## Objetivos solicitados

- Corregir el fallo del segundo `POST /robot/actions` en multi-cubo.
- Agregar confirmacion fisica post-drop por vision usando delta de conteo.
- Agregar retry automatico bajando Z si la descarga fisica no se confirma.
- Replanificar usando snapshot actualizado despues de cada descarga confirmada.
- Agregar auto-refresh operacional del dashboard.
- Documentar ejecucion, cambios, validaciones, riesgos y pendientes.

## Diseno implementado

- Confirmacion fisica post-drop: despues del flujo completo de pick/drop, Edge espera `physicalConfirmation.visionSettleSeconds`, captura un snapshot post-drop y valida `totalAfter=totalBefore-1` y `colorAfter=colorBefore-1`.
- Retry bajando Z: si la confirmacion falla, se reintenta el mismo cubo/color con `pickZ + zStep`, respetando `minPickZ` y `maxAttempts`.
- Persistencia de drop zone: con confirmacion fisica habilitada, `occupied=true` solo se persiste si `physicalConfirmation.status=CONFIRMED`.
- Replanificacion: despues de confirmar una descarga, el snapshot post-drop pasa a ser la base para el siguiente cubo.
- Backend sync: fallas fisicas se envian como `status=ERROR`, compatible con el enum existente, y la semantica detallada queda en metadata.
- Dashboard: polling configurable con `VITE_DASHBOARD_REFRESH_MS`, default `3000`, manteniendo boton manual.

## Cambios implementados

- `multi_cube_pick_drop.py` ahora soporta `physicalConfirmation` y `pickupRetry`.
- La evidencia multi-cubo incluye configuracion de confirmacion, configuracion de retry, intentos, conteos before/after, firmas de snapshot, `finalPickZUsed`, `commandExecutionStatus` y `successMeaning`.
- El payload Backend incluye `physicalConfirmation`, intentos, retry y estados separados de ejecucion de comandos vs confirmacion fisica.
- El segundo action multi-cubo queda normalizado para no enviar `FAILED` al enum Prisma; se usa `ERROR` cuando corresponde.
- Dashboard operacional refresca automaticamente sesion activa, cubos, conteos y ultimas acciones.
- `.env.example` frontend documenta `VITE_DASHBOARD_REFRESH_MS=3000`.
- `edge/config/single-cube-pick-drop.example.json` incluye bloques `physicalConfirmation` y `pickupRetry`.

## Archivos modificados

- `edge/src/multi_cube_pick_drop.py`
- `edge/tests/test_multi_cube_pick_drop.py`
- `edge/config/single-cube-pick-drop.example.json`
- `edge/README.md`
- `backend/src/modules/robot/robot.validators.test.ts`
- `frontend/src/api/dashboard.ts`
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/styles.css`
- `frontend/.env.example`
- `frontend/README.md`
- `docs/prompt-runs-finalproject/2026-07-06-001-multi-cube-physical-confirmation-retry-dashboard-refresh.md`

## Validaciones ejecutadas

- `python -m pytest edge\tests\test_multi_cube_pick_drop.py -q`
- `npm.cmd test -- --run src/modules/robot/robot.validators.test.ts`
- `cd edge; .\.venv\Scripts\python.exe -m pytest -q`
- `cd backend; npm.cmd run build`
- `cd backend; npm.cmd test --if-present`
- `cd frontend; npm.cmd run build`

## Resultado de tests

- Edge multi-cubo focalizado: 15 tests passed.
- Backend robot validators focalizado: 9 tests passed.
- Edge completo: 156 tests passed.
- Backend build: OK.
- Backend tests: 3 files passed, 16 tests passed.
- Frontend build: OK.

## Pruebas manuales pendientes

- Ejecutar multi-cubo real con Edge Vision y MaxArm:
  `python src\multi_cube_pick_drop.py --config config\single-cube-pick-drop.local.json --edge-vision-url http://localhost:8001 --max-cubes 2 --confirm-multi-pick-drop --enable-hardware-motion --confirm-zone-clear --confirm-operator-present --confirm-emergency-stop-ready --confirm-suction --port COMx --sync-backend --backend-url http://localhost:3000`
- Validar que un primer cubo confirmado persiste su drop zone y que el segundo se planifica con snapshot actualizado.
- Validar fisicamente retry de Z con un cubo alto.
- Confirmar en dashboard que acciones/cubos se actualizan sin presionar `Actualizar`.

## Riesgos o limitaciones

- La confirmacion por delta de conteo asume que nadie agrega cubos durante la descarga y que se procesa un cubo por intento.
- Si Edge Vision no entrega snapshot post-drop con `physicalConfirmation.enabled=true`, la accion queda `INCONCLUSIVE` y no persiste la drop zone.
- La replanificacion mantiene el orden de colores planificado inicialmente y busca el siguiente cubo disponible de ese color en el snapshot actualizado.
- La validacion completa end-to-end con hardware queda pendiente de ejecucion fisica.
