# Prompt-run: 2026-07-06-004-dashboard-execute-serial-config-reset-ui

## 1. Fecha de ejecucion

2026-07-06.

## 2. Nombre/codigo

`2026-07-06-004-dashboard-execute-serial-config-reset-ui`

## 3. Contexto tecnico previo

- El Dashboard ya tenia la seccion `Descarga fisica del camion`.
- Edge Vision exponia `/drop-zones/reset`, `/robot/multi-cube/plan`,
  `/robot/multi-cube/execute` y `/robot/multi-cube/status`.
- La planificacion desde Dashboard ya usaba `--unload-config` y mostraba QR,
  cubos detectados, cubos planificados, drop zones y `pickupOffset`.
- Los CLI `multi_cube_pick_drop.py`, `single_cube_pick_drop.py` y
  `reset_drop_zones.py` seguian siendo el fallback operacional.

## 4. Problemas detectados

- `POST /robot/multi-cube/execute` desde Dashboard fallaba con
  `CONFIRMATION_REQUIRED: Missing gates: --port COMx` porque no resolvia el
  puerto serial desde la configuracion operacional.
- El Dashboard no dejaba claro al operador que faltaba configurar
  `hardware.port` en `single-cube-pick-drop.local.json`.
- El resultado de `Reset drop zones` debia permanecer visible en la UI y mostrar
  status, archivo, slots, backup y colores afectados.

## 5. Objetivos solicitados

- Agregar soporte formal para `hardware.port` y `hardware.baudrate` en
  `single-cube-pick-drop.example.json`.
- Permitir override opcional de `port` y `baudrate` en
  `/robot/multi-cube/execute`.
- Responder `MISSING_HARDWARE_PORT` si no hay puerto configurado, sin abrir
  serial ni mover hardware.
- Actualizar Dashboard para mostrar el error claro y bloquear ejecucion si falta
  puerto.
- Mantener compatibilidad CLI con `--port` y `--baudrate`.
- Documentar la configuracion local no versionada.

## 6. Cambios implementados

- Edge Vision resuelve puerto con prioridad: `request.port`,
  `hardware.port` del unload-config y fallback operacional
  `--hardware-port`/`EDGE_MAXARM_PORT`.
- Edge Vision resuelve baudrate con prioridad: `request.baudrate`,
  `hardware.baudrate` y default `115200`.
- `/robot/multi-cube/execute` devuelve HTTP 400 con codigo
  `MISSING_HARDWARE_PORT` si falta puerto y actualiza `lastError` en
  `/robot/multi-cube/status`.
- `/robot/multi-cube/status` expone `hardwarePortConfigured` para que el
  Dashboard bloquee ejecucion antes de enviar una orden incompleta.
- El cliente frontend convierte `MISSING_HARDWARE_PORT` al mensaje:
  `Falta configurar hardware.port en single-cube-pick-drop.local.json`.
- El panel de descarga mantiene `resetResult` en estado local y muestra status,
  archivo, slots, total, backup y colores afectados.
- `single-cube-pick-drop.example.json` incluye la seccion `hardware`.
- `edge/README.md` y `frontend/README.md` documentan la configuracion local.

## 7. Archivos modificados

- `edge/config/single-cube-pick-drop.example.json`
- `edge/src/service/vision_api.py`
- `edge/tests/test_vision_api.py`
- `frontend/src/api/edgeVision.ts`
- `frontend/src/types/edgeVision.ts`
- `frontend/src/components/PhysicalUnloadPanel.tsx`
- `edge/README.md`
- `frontend/README.md`
- `docs/prompt-runs-finalproject/2026-07-06-004-dashboard-execute-serial-config-reset-ui.md`

## 8. Validaciones ejecutadas

- `python -m pytest -q` en `edge/`
- `npm run build` en `backend/`
- `npm.cmd test --if-present` en `backend/`
- `npm run build` en `frontend/`
- `npm.cmd test --if-present` en `frontend/`

## 9. Resultado de tests

- Edge completo: 169 tests pasaron.
- Backend build TypeScript: exitoso.
- Backend tests: 16 tests pasaron.
- Frontend build TypeScript/Vite: exitoso.
- Frontend tests: no hay script configurado; `npm.cmd test --if-present`
  termino sin ejecutar suite.
- `npm test --if-present` directo en PowerShell fallo por execution policy de
  `npm.ps1`; se reintento correctamente con `npm.cmd`.

## 10. Pruebas manuales pendientes

- Agregar localmente en `edge/config/single-cube-pick-drop.local.json`:

```json
{
  "hardware": {
    "port": "COM4",
    "baudrate": 115200
  }
}
```

- Levantar Edge Vision con `--config config\edge.vision.local.json`,
  `--unload-config config\single-cube-pick-drop.local.json`, `--allow-camera`,
  `--sync-backend` y `--backend-url http://localhost:3000`.
- Probar `Reset drop zones` desde Dashboard y confirmar que muestra
  `config/drop_zones.local.json`, slots, backup y colores.
- Planificar descarga, revisar cubos y drop zones.
- Marcar safety checks y ejecutar descarga fisica, verificando que no aparezca
  `Missing gates: --port COMx` y que Edge use el puerto local.

## 11. Riesgos o limitaciones

- Las pruebas automatizadas no mueven hardware ni validan el puerto COM real.
- El estado multi-cubo sigue viviendo en memoria del proceso Edge Vision.
- `single-cube-pick-drop.local.json` no se modifica por restriccion de repo; la
  configuracion local debe aplicarla el operador de la demo.
- El proyecto frontend no tiene suite de tests de componentes configurada.
