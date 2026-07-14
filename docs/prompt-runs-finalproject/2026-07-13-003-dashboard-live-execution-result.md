# Prompt run: dashboard live execution result

Fecha: 2026-07-13
Secuencia: 003

## Objetivo

Hacer que la tabla "Plan de descarga" -> "Resultado de ejecucion" muestre avance vivo por cubo durante la descarga fisica multi-cubo, sin esperar al final de toda la ejecucion.

## Problema UX detectado

La pestaña ya separaba "Plan generado" de "Resultado de ejecucion", pero el resultado se alimentaba solo desde `lastResult.executedActions`. Como Edge publicaba `lastResult` completo al terminar `run_multi_cube_pick_drop`, la tabla quedaba vacia durante la ejecucion aunque "Acciones robot" avanzara en backend.

Principio aplicado:

- Plan generado = intencion.
- Resultado de ejecucion = avance vivo por cubo.
- Acciones robot = bitacora backend.
- Progreso = resumen agregado.

## Analisis

No fue suficiente resolverlo solo en frontend. El frontend podia construir filas `PENDIENTE` desde el plan, pero Edge no exponia `executedActions` parciales mientras el flujo fisico seguia corriendo.

Se ajusto Edge para publicar estado observable parcial despues de cada cubo mediante un callback de progreso. No se modifico la logica fisica MaxArm, comandos seriales, calibraciones ni configuraciones locales.

## Cambios realizados

- Frontend construye filas de "Resultado de ejecucion" desde `plannedActions`.
- Cada fila parte como `PENDIENTE` al existir plan.
- Frontend mergea `plannedActions`, `executedActions` parciales y `currentSequenceNumber`.
- El matching prioriza `sequenceNumber`; si no alcanza, usa `selectedCubeColor + dropZoneCode + positionOrder` consumiendo matches por orden.
- Edge actualiza el estado global durante la ejecucion con `executedActions` parciales y progreso agregado.
- `/robot/multi-cube/status` expone campos de compatibilidad (`lastPlan`, `lastResult`) y campos directos para UI viva.

## Archivos modificados

- `frontend/src/components/Dashboard.tsx`
- `frontend/src/components/executionRows.ts`
- `frontend/src/types/edgeVision.ts`
- `edge/src/service/vision_api.py`
- `edge/src/multi_cube_pick_drop.py`
- `edge/tests/test_vision_api.py`

## Contrato de status usado

`GET /robot/multi-cube/status` mantiene:

- `status`
- `runId`
- `lastPlan`
- `lastResult`
- `lastError`
- `updatedAt`
- `executing`
- `hardwarePortConfigured`

Y ahora tambien puede devolver:

- `plannedActions`: acciones planificadas del ultimo plan.
- `executedActions`: acciones ejecutadas parciales o finales.
- `currentSequenceNumber`: cubo actualmente en ejecucion, si aplica.
- `progress`: resumen `{ planned, executed, physicalConfirmed, backendSynced, remaining }`.

Durante ejecucion, `lastResult` puede tener `status: "RUNNING"` y `executedActions` parciales para mantener compatibilidad con consumidores existentes.

## Validaciones ejecutadas

- Frontend: `cd frontend && npm run build` OK.
- Frontend: `cd frontend && npm.cmd test --if-present` OK. Nota: `npm test --if-present` directo fallo por politica local de PowerShell al cargar `npm.ps1`; se reintento con `npm.cmd`.
- Edge: `cd edge && python -m pytest -q` OK, 176 tests.

## Backend

No se modifico Backend. La bitacora "Acciones robot" ya se alimentaba durante la ejecucion y no requirio cambios.

## Hardware y calibraciones

No se ejecutaron pruebas fisicas MaxArm.

No se modificaron:

- `edge/config/edge.vision.local.json`
- `edge/config/single-cube-pick-drop.local.json`
- `edge/config/drop_zones.local.json`
- `frontend/.env.local`

Tampoco se modificaron calibraciones fisicas ni comandos MaxArm.

## Mejoras futuras

- Agregar tests unitarios frontend si se incorpora Vitest/Testing Library al proyecto.
- Mostrar badges visuales por estado si se consolida un componente compartido de status.
- Exponer intentos/pick Z actuales en `current` si se requiere granularidad dentro de un intento, no solo al cerrar cada cubo.
