# Prompt-run: 2026-07-06-002-dashboard-full-unload-control

## 1. Fecha de ejecucion

2026-07-06.

## 2. Nombre/codigo

`2026-07-06-002-dashboard-full-unload-control`

## 3. Contexto tecnico previo

- El flujo fisico single-cube y multi-cube por CLI ya funcionaba.
- La configuracion local ganadora incluye `pickupOffset.x=10`, `pickZ=138`,
  delays de movimiento, `physicalConfirmation.enabled=true` y
  `pickupRetry.enabled=true`.
- `physicalConfirmation`, `pickupRetry`, `pickupOffset`,
  `--recapture-between-cubes`, `--sync-backend` y auto-refresh del dashboard ya
  existian.
- El problema operativo era que la demo final desde PowerShell se veia poco
  limpia; se necesitaba operar la descarga desde Dashboard.

## 4. Objetivos solicitados

- Agregar control de descarga fisica del camion desde Dashboard.
- Exponer endpoints Edge para reset, plan, execute y status multi-cubo.
- Reutilizar `multi_cube_pick_drop.py` y `reset_drop_zones.py`.
- Exigir planificacion previa y confirmaciones de seguridad.
- Agregar selector `maxCubes`.
- Mostrar progreso/resultado y mantener auto-refresh.
- Actualizar `.env.example`, README y tests.

## 5. Diseno elegido

- Edge Vision mantiene el servicio HTTP local y agrega endpoints operacionales.
- La ejecucion es sincrona para demo local, con estado consultable por
  `/robot/multi-cube/status`.
- Se guarda el snapshot usado al planificar para que la ejecucion use exactamente
  el plan aprobado aunque el dashboard siga refrescando vision.
- Se bloquean ejecuciones concurrentes con estado en memoria del proceso Edge.
- El dashboard no habla con serial ni reimplementa robotica; solo envia plan,
  reset y safety flags a Edge.

## 6. Cambios implementados

- `POST /drop-zones/reset` llama `reset_drop_zones(..., reset_all=True)`.
- `POST /robot/multi-cube/plan` llama `run_multi_cube_pick_drop(...,
  plan_only=True)`.
- `POST /robot/multi-cube/execute` exige plan previo, evidencia y safety flags,
  y llama `run_multi_cube_pick_drop` con `MultiHardwareGates`.
- `GET /robot/multi-cube/status` expone estado, ultimo plan, resultado, error y
  timestamp.
- Dashboard agrega panel `Descarga fisica del camion` con reset, plan, ejecutar,
  checklist, selector de max cubos, tabla de plan y resumen de resultado.
- Frontend consume el status multi-cubo dentro del polling existente de Edge
  Vision.

## 7. Archivos modificados

- `edge/src/service/vision_api.py`
- `edge/tests/test_vision_api.py`
- `frontend/src/api/edgeVision.ts`
- `frontend/src/types/edgeVision.ts`
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/components/PhysicalUnloadPanel.tsx`
- `frontend/src/styles.css`
- `edge/README.md`
- `frontend/README.md`
- `docs/prompt-runs-finalproject/2026-07-06-002-dashboard-full-unload-control.md`

## 8. Validaciones ejecutadas

- `python -m pytest edge\tests\test_vision_api.py -q`
- `python -m pytest -q` en `edge/`
- `npm run build` en `backend/`
- `npm.cmd test --if-present` en `backend/`
- `npm run build` en `frontend/`
- `npm.cmd test --if-present` en `frontend/`

## 9. Resultado de tests

- Edge Vision API focalizado: 23 tests pasaron.
- Edge completo: 161 tests pasaron.
- Backend build: exitoso.
- Backend tests: 16 tests pasaron.
- Frontend build TypeScript/Vite: exitoso.
- Frontend tests: no hay script configurado; `npm.cmd test --if-present`
  termino sin ejecutar suite.

## 10. Pruebas manuales pendientes

- Levantar backend real y Edge Vision con `edge.vision.local.json`.
- Usar Dashboard para resetear drop zones locales.
- Planificar con QR fisico valido y cubos reales.
- Revisar plan visualmente antes de mover MaxArm.
- Ejecutar descarga fisica con todos los checks marcados.
- Confirmar que Backend recibe acciones `mode=hardware` con metadata multi-cubo.

## 11. Riesgos o limitaciones

- El estado multi-cubo vive en memoria del proceso Edge; reiniciar el servicio
  pierde el ultimo plan.
- La ejecucion HTTP es sincrona; durante movimiento largo el dashboard muestra
  `executing` localmente y luego el resultado final.
- La demo fisica requiere configurar `--hardware-port` o `EDGE_MAXARM_PORT`.
- No se agregaron tests automatizados de componentes React porque el proyecto no
  tiene runner de frontend instalado.
