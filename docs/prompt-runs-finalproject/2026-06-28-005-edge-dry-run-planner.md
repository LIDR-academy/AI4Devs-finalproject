# Prompt Run - Edge Dry-Run Planner

## Fecha

2026-06-28

## Objetivo

Implementar un flujo Edge dry-run integrado que conecte snapshot, selección de cubo, reserva de drop zone y planificación robot segura, generando evidencia sin abrir serial ni mover MaxArm.

## Agentes usados

- `prompts/agents/edge.md`
- `prompts/agents/architect.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes usados

- `prompts/subagents/edge-vision.md`
- `prompts/subagents/edge-maxarm.md`
- `prompts/subagents/qa-api.md`

Los subagentes realizaron auditorías de solo lectura sobre calibración, secuencia MaxArm y matriz QA. No modificaron archivos ni abrieron dispositivos.

## Skills usadas

- `prompts/skills/opencv.md`
- `prompts/skills/maxarm.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`

## Contexto leído

- `AGENTS.md`
- `README.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `prompts/agents/edge.md`
- `prompts/agents/architect.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`
- `prompts/subagents/edge-vision.md`
- `prompts/subagents/edge-maxarm.md`
- `prompts/subagents/qa-api.md`
- `prompts/skills/opencv.md`
- `prompts/skills/maxarm.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`
- `edge/`
- `backend/`
- `frontend/`
- `_local_context/spikes/experiments/dynamic_pickup_detection/` como solo lectura
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/` como solo lectura

## Archivos destino

- `edge/src/robot/planner.py`
- `edge/src/robot/safety.py`
- `edge/src/edge_dry_run.py`
- `edge/src/models.py`
- `edge/src/config.py`
- `edge/config/edge.config.example.json`
- `edge/config/edge.dry-run.example.json`
- `edge/config/drop_zones.dry-run.example.json`
- `edge/tests/test_robot_action_planner.py`
- `edge/tests/test_edge_dry_run.py`
- `edge/README.md`
- `docs/prompt-runs-finalproject/2026-06-28-005-edge-dry-run-planner.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guía principal del proyecto.

Actúa como:
- prompts/agents/edge.md
- prompts/agents/architect.md
- prompts/agents/qa.md
- prompts/agents/documenter.md

Usa subagentes:
- prompts/subagents/edge-vision.md
- prompts/subagents/edge-maxarm.md
- prompts/subagents/qa-api.md

Usa skills:
- prompts/skills/opencv.md
- prompts/skills/maxarm.md
- prompts/skills/documentation.md
- prompts/skills/gitflow.md

Lee:
- README.md
- docs/delivery/06-plan-entrega-final.md
- docs/prompt-runs-finalproject/README.md
- docs/prompt-runs-finalproject/_template.md
- edge/
- backend/
- frontend/

Lee como contexto local, pero no lo modifiques:
- _local_context/spikes/experiments/dynamic_pickup_detection/
- _local_context/spikes/experiments/dynamic_pickup_maxarm_pick/

Objetivo:
Implementar un flujo Edge dry-run integrado para la Entrega Final, conectando visión, selección de cubo, selección de zona de descarga y planificación de acción robot, sin abrir serial y sin mover MaxArm.

Alcance de este paso:

1. Mantener simulation como modo por defecto.
2. Mantener todos los tests existentes pasando.
3. Implementar o completar un RobotActionPlanner como lógica pura.
4. El planner debe recibir:
   - un DetectionSnapshot;
   - un cubo seleccionado por CubeSelector;
   - un slot seleccionado por DropZonePlanner;
   - configuración segura de poses;
   - perfil de ejecución.
5. El planner debe producir un RobotActionPlan con:
   - runId;
   - selectedCube;
   - dropZoneCode;
   - color;
   - dryRun=true;
   - mode o profile;
   - secuencia conceptual de pasos;
   - poses candidatas;
   - safeZ;
   - metadata segura;
   - errores si faltan datos.
6. Implementar un runner o comando de dry-run que permita:
   - usar una imagen fixture o snapshot simulado;
   - ejecutar QR/color si hay imagen;
   - seleccionar cubo;
   - seleccionar drop zone;
   - generar plan robot;
   - guardar evidencia JSON;
   - no abrir cámara salvo que se pida explícitamente;
   - no abrir serial nunca en este paso.
7. El flujo debe fallar en modo seguro cuando:
   - no hay cubos válidos;
   - el color no está soportado;
   - no hay drop zone activa/libre;
   - la configuración de drop zones es inválida;
   - faltan poses requeridas;
   - la calibración requerida no está disponible.
8. Agregar evidencia local de dry-run:
   - JSON con snapshot;
   - cubo seleccionado;
   - dropZone seleccionada;
   - RobotActionPlan;
   - resultado esperado;
   - sin secretos ni rutas absolutas.
9. Agregar tests unitarios o de integración local para:
   - dry-run exitoso con cubo rojo;
   - dry-run exitoso con cubo azul;
   - zona llena devuelve ZONE_UNAVAILABLE;
   - cubo sin color soportado falla seguro;
   - sin cubos válidos falla seguro;
   - planner no abre serial;
   - planner no modifica estado canónico hardware en simulation/dry-run;
   - drop zone se reserva en memoria pero no se confirma como occupied hasta confirmación explícita;
   - error antes de release libera reserva.
10. Actualizar documentación de Edge explicando:
   - cómo ejecutar simulation;
   - cómo ejecutar vision-dry-run;
   - cómo generar evidencia JSON;
   - diferencia entre selection, reservation, release y occupied;
   - qué sigue pendiente antes de hardware.

Archivos sugeridos a crear o modificar:
- edge/src/robot/planner.py
- edge/src/robot/safety.py
- edge/src/edge_dry_run.py
- edge/src/models.py
- edge/src/config.py
- edge/config/edge.config.example.json
- edge/tests/test_robot_action_planner.py
- edge/tests/test_edge_dry_run.py
- edge/README.md
- docs/prompt-runs-finalproject/2026-06-28-005-edge-dry-run-planner.md

Restricciones:
- No modifiques Backend todavía salvo que detectes una necesidad crítica y la documentes sin implementarla.
- No modifiques Frontend todavía salvo documentación mínima si es necesario.
- No copies archivos desde _local_context/ hacia edge/.
- No modifiques _local_context/.
- No elimines ni rompas el flujo actual de simulation.
- No abras puerto serial.
- No ejecutes MaxArm.
- No implementes movimiento robot físico.
- No hagas que los tests dependan de una cámara física conectada.
- No uses rutas absolutas.
- No incluyas secretos, tokens ni datos sensibles.
- No hagas commit ni push.

Antes de modificar archivos:
1. Resume brevemente el plan de implementación.
2. Lista los archivos que vas a crear o modificar.
3. Confirma que no abrirás serial ni moverás MaxArm.
4. Confirma que los tests no dependerán de cámara física.

Después de implementar:
1. Ejecuta o indica cómo ejecutar los tests del Edge.
2. Verifica que simulation sigue siendo el default.
3. Verifica que los tests de drop zones y visión siguen pasando.
4. Muestra un ejemplo de comando para ejecutar el dry-run integrado.
5. Resume archivos creados/modificados.
6. Indica qué quedó pendiente para el siguiente paso.
7. Registra este prompt run en:
   - docs/prompt-runs-finalproject/2026-06-28-005-edge-dry-run-planner.md

El prompt run debe usar como base:
- docs/prompt-runs-finalproject/_template.md

Debe incluir:
- Fecha.
- Objetivo.
- Agentes usados.
- Skills usadas.
- Contexto leído.
- Archivos destino.
- Prompt enviado a Codex.
- Resultado esperado.
- Resultado obtenido.
- Archivos modificados.
- Observaciones.
```

## Resultado esperado

- Planner puro y fail-closed.
- Secuencia conceptual con poses candidatas y Z segura.
- Runner integrado para snapshot simulado o visión.
- Evidencia JSON sanitizada.
- Reserva temporal sin modificar `occupied`.
- Cero serial, cámara opcional y ningún movimiento.
- Regresión completa de simulation, drop zones y visión.

## Resultado obtenido

- Se amplió `RobotActionPlan` y se añadió `RobotActionStep`.
- Se implementó mapeo bilineal desde ROI calibrada a pose candidata.
- `RobotActionPlanner` valida perfil, dry-run, runId, cubo, color, slot, calibración, poses, Z y workspace.
- La secuencia incluye pickup seguro, lift, drop seguro, release conceptual y retract.
- `edge_dry_run.py` acepta snapshot simulado o procesa visión configurada.
- El runner reserva el slot solo en memoria, nunca llama `confirm()` y siempre cancela tras éxito/error.
- Se agregó evidencia JSON atómica sin rutas absolutas ni secretos.
- Se añadieron configs sintéticos reproducibles, no válidos para hardware.
- El comando de ejemplo fue ejecutado exitosamente sin cámara ni serial.
- La suite completa terminó con `56 passed`, incluyendo los 44 tests anteriores.
- `simulation` permanece como default.

## Archivos modificados

- Modificado: `edge/src/models.py`
- Modificado: `edge/src/config.py`
- Modificado: `edge/config/edge.config.example.json`
- Modificado: `edge/README.md`
- Creado: `edge/src/robot/planner.py`
- Creado: `edge/src/robot/safety.py`
- Creado: `edge/src/edge_dry_run.py`
- Creado: `edge/config/edge.dry-run.example.json`
- Creado: `edge/config/drop_zones.dry-run.example.json`
- Creado: `edge/tests/test_robot_action_planner.py`
- Creado: `edge/tests/test_edge_dry_run.py`
- Creado: `docs/prompt-runs-finalproject/2026-06-28-005-edge-dry-run-planner.md`

## Observaciones

- No se modificó Backend, Frontend ni `_local_context/`.
- No se importó o abrió serial y no se ejecutó MaxArm.
- Los tests no dependen de cámara física, red o Backend.
- Las poses/calibración del ejemplo son sintéticas y no deben promoverse a hardware.
- La exclusión de reservas es intra-proceso; un lock entre procesos queda pendiente.
- `occupied=true` queda reservado para un futuro executor físico tras release confirmado.
- Estabilidad multiframe, calibración final y persistencia Backend quedan pendientes.
- No se hizo commit ni push.
