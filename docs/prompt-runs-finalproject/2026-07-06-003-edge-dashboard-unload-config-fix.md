# Prompt-run: 2026-07-06-003-edge-dashboard-unload-config-fix

## 1. Fecha de ejecucion

2026-07-06.

## 2. Nombre/codigo

`2026-07-06-003-edge-dashboard-unload-config-fix`

## 3. Contexto tecnico previo

- El Dashboard ya tenia controles para descarga fisica multi-cubo.
- Edge Vision exponia `/drop-zones/reset`, `/robot/multi-cube/plan`,
  `/robot/multi-cube/execute` y `/robot/multi-cube/status`.
- El CLI `multi_cube_pick_drop.py` funcionaba usando
  `config/single-cube-pick-drop.local.json`.
- La configuracion local ganadora vive en
  `config/single-cube-pick-drop.local.json` e incluye `robotPlanning`,
  `dropZones`, `physicalConfirmation`, `pickupRetry`, `pickupOffset` y delays.

## 4. Diagnostico

- El servicio Edge Vision se levantaba con `config/edge.vision.local.json`.
- Los endpoints nuevos de descarga reutilizaban `state.config_path`, por lo que
  terminaban usando la configuracion de vision.
- Esa configuracion no contiene `robotPlanning.enabled=true`, por eso
  `/robot/multi-cube/plan` y `/robot/multi-cube/status` mostraban
  `MISSING_PLANNING_CONFIG`.
- `/drop-zones/reset` terminaba resolviendo el fallback
  `config/drop_zones.example.json`, no el archivo local operacional.

## 5. Objetivos solicitados

- Agregar soporte explicito para `--unload-config`.
- Mantener `--config` como configuracion exclusiva de vision/camara.
- Hacer que reset, plan y execute usen la configuracion operacional de descarga.
- Responder 4xx claros si falta `dropZones.path` o `robotPlanning.enabled=true`.
- Mostrar el resultado real del reset en el Dashboard.
- Documentar la nueva forma de arranque.
- Agregar o actualizar tests de regresion.

## 6. Cambios implementados

- `vision_api.py` ahora acepta `--unload-config`.
- `create_app` guarda `config_path` y `unload_config_path` por separado.
- Si no se entrega `--unload-config`, Edge busca
  `config/single-cube-pick-drop.local.json` y luego usa
  `config/single-cube-pick-drop.example.json` como fallback de desarrollo/test.
- `/drop-zones/reset` carga `dropZones.path` desde `unload-config`.
- `/robot/multi-cube/plan` valida `robotPlanning.enabled=true` y
  `dropZones.path` desde `unload-config`.
- `/robot/multi-cube/execute` usa el ultimo plan, la evidencia asociada y la
  misma `unload-config`.
- `/robot/multi-cube/status` mantiene `updatedAt`, `executing`, `lastPlan`,
  `lastResult` y limpia `lastError` tras una planificacion exitosa.
- El Dashboard tipa y muestra `status`, `dropZonesPath`, `totalSlots`,
  `resetSlots`, `backupPath` y `affectedColors` del reset.
- `edge/README.md` documenta la separacion entre `--config` y
  `--unload-config`.

## 7. Archivos modificados

- `edge/src/service/vision_api.py`
- `edge/tests/test_vision_api.py`
- `frontend/src/api/edgeVision.ts`
- `frontend/src/types/edgeVision.ts`
- `frontend/src/components/PhysicalUnloadPanel.tsx`
- `edge/README.md`
- `docs/prompt-runs-finalproject/2026-07-06-003-edge-dashboard-unload-config-fix.md`

## 8. Validaciones ejecutadas

- `python -m pytest edge\tests\test_vision_api.py -q`
- `python -m pytest -q` en `edge/`
- `npm run build` en `frontend/`
- `npm run build` en `backend/`
- `npm.cmd test --if-present` en `backend/`
- `npm.cmd test --if-present` en `frontend/`
- `python src\service\vision_api.py --help` en `edge/`

## 9. Resultado de tests

- Edge Vision API focalizado: 27 tests pasaron.
- Edge completo: 165 tests pasaron.
- Backend build: exitoso.
- Backend tests: 16 tests pasaron.
- Frontend build TypeScript/Vite: exitoso.
- Frontend tests: no hay script configurado; `npm.cmd test --if-present`
  termino sin ejecutar suite.
- `vision_api.py --help` muestra `--unload-config`.

## 10. Pruebas manuales pendientes

- Levantar Edge con:

```powershell
python src\service\vision_api.py `
  --config config\edge.vision.local.json `
  --unload-config config\single-cube-pick-drop.local.json `
  --allow-camera `
  --sync-backend `
  --backend-url http://localhost:3000
```

- Verificar `GET /robot/multi-cube/status` sin el error viejo.
- Ejecutar `POST /drop-zones/reset` con `{ "scope": "all" }` y confirmar que
  responde `config\drop_zones.local.json`.
- Ejecutar `POST /robot/multi-cube/plan` con `{ "maxCubes": 6 }` y confirmar
  `DRY_RUN_PLANNED`.
- Validar en Dashboard que reset muestra archivo, backup y slots reales.
- Ejecutar descarga fisica solo despues de revisar plan y marcar safety checks.

## 11. Riesgos o limitaciones

- El fallback a `single-cube-pick-drop.example.json` es solo para desarrollo/test;
  la demo fisica debe pasar `--unload-config` explicito.
- El estado de plan/ejecucion sigue viviendo en memoria del proceso Edge.
- Las pruebas automatizadas no mueven hardware ni validan camara real.
- El proyecto frontend no incluye runner de tests de componentes.
