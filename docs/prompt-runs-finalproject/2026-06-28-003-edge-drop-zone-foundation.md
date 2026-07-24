# Prompt Run - Edge Drop Zone Foundation

## Fecha

2026-06-28

## Objetivo

Implementar la primera base segura del Edge para la Entrega Final: perfiles explícitos, modelos compartidos, configuración segura, planificación pura y estado aislado de drop zones, sin cámara ni MaxArm.

## Agentes usados

- `prompts/agents/edge.md`
- `prompts/agents/architect.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes usados

- `prompts/subagents/edge-maxarm.md`
- `prompts/subagents/qa-api.md`

Los subagentes realizaron auditorías de solo lectura sobre contratos de seguridad y matriz de pruebas. No modificaron archivos.

## Skills usadas

- `prompts/skills/maxarm.md`
- `prompts/skills/prisma-postgres.md`
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
- `prompts/subagents/edge-maxarm.md`
- `prompts/subagents/qa-api.md`
- `prompts/skills/maxarm.md`
- `prompts/skills/prisma-postgres.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`
- `edge/`
- `backend/`
- `frontend/`
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/` como contexto de solo lectura
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/drop_zones_config.json` como contexto de solo lectura

## Archivos destino

- `edge/src/models.py`
- `edge/src/config.py`
- `edge/src/edge_runner.py`
- `edge/src/robot/drop_zone_planner.py`
- `edge/src/robot/drop_zone_adapter.py`
- `edge/config/drop_zones.example.json`
- `edge/config/edge.config.example.json`
- `edge/tests/`
- `edge/README.md`
- `docs/prompt-runs-finalproject/2026-06-28-003-edge-drop-zone-foundation.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guía principal del proyecto.

Actúa como:
- prompts/agents/edge.md
- prompts/agents/architect.md
- prompts/agents/qa.md
- prompts/agents/documenter.md

Usa subagentes:
- prompts/subagents/edge-maxarm.md
- prompts/subagents/qa-api.md

Usa skills:
- prompts/skills/maxarm.md
- prompts/skills/prisma-postgres.md
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
- _local_context/spikes/experiments/dynamic_pickup_maxarm_pick/
- _local_context/spikes/experiments/dynamic_pickup_maxarm_pick/drop_zones_config.json

Objetivo:
Implementar la primera base segura de Edge para la Entrega Final, enfocada en perfiles de ejecución, modelos compartidos, configuración segura y lógica de drop zones, sin cámara real y sin mover el MaxArm.

Alcance de este paso:

1. Mantener simulation como modo por defecto.
2. Agregar perfiles explícitos:
   - simulation
   - vision-dry-run
   - hardware
3. Implementar modelos internos de Edge para:
   - CubeDetection
   - DetectionSnapshot
   - RobotPose
   - DropZoneSlot
   - DropZoneSelection
   - RobotActionPlan
   - EdgeRunProfile
4. Implementar DropZonePlanner como lógica pura:
   - recibe color y lista de slots;
   - filtra por mismo color;
   - solo considera active=true y occupied=false;
   - ordena por position_order;
   - devuelve el primer slot disponible;
   - si no hay slot, devuelve error ZONE_UNAVAILABLE;
   - no lee archivos;
   - no escribe archivos;
   - no abre cámara;
   - no abre serial.
5. Implementar DropZoneAdapter seguro:
   - carga configuración JSON desde una ruta configurable;
   - valida estructura;
   - valida colores soportados: red, blue, yellow, green;
   - valida códigos únicos;
   - valida position_order único por color;
   - valida coordenadas x, y, z numéricas;
   - valida booleanos active y occupied;
   - permite reservar un slot en memoria para un runId;
   - confirma ocupación solo cuando se llama explícitamente a confirm;
   - permite reset explícito de occupied=false;
   - no debe abrir cámara;
   - no debe abrir serial;
   - debe fallar en modo fail-closed si el JSON es inválido.
6. Agregar archivos de configuración de ejemplo seguros en edge/config/.
7. Crear tests unitarios para:
   - selección correcta por color;
   - selección por menor position_order;
   - ignora slots inactivos;
   - ignora slots ocupados;
   - dos reservas consecutivas no usan el mismo slot;
   - zona llena devuelve ZONE_UNAVAILABLE;
   - JSON inválido falla antes de planificar;
   - reset deja occupied=false sin cambiar código, color, coordenadas ni active;
   - simulation/dry-run no modifica estado canónico hardware.
8. Actualizar documentación de Edge explicando:
   - perfiles de ejecución;
   - uso de drop zones;
   - formato del JSON;
   - reset seguro;
   - qué todavía no está implementado.

Archivos sugeridos a crear o modificar:

- edge/src/models.py
- edge/src/config.py
- edge/src/robot/drop_zone_planner.py
- edge/src/robot/drop_zone_adapter.py
- edge/config/drop_zones.example.json
- edge/config/edge.config.example.json
- edge/tests/test_drop_zone_planner.py
- edge/tests/test_drop_zone_adapter.py
- edge/README.md
- docs/prompt-runs-finalproject/2026-06-28-003-edge-drop-zone-foundation.md

Restricciones:

- No modifiques Backend todavía salvo que detectes una necesidad crítica y la documentes sin implementarla.
- No modifiques Frontend todavía salvo documentación mínima si es necesario.
- No copies archivos desde _local_context/ hacia edge/.
- No modifiques _local_context/.
- No elimines ni rompas el flujo actual de simulation.
- No abras cámara.
- No abras puerto serial.
- No ejecutes MaxArm.
- No uses dry_run=false como default.
- No incluyas secretos, tokens ni rutas absolutas innecesarias.
- No hagas commit ni push.

Antes de modificar archivos:

1. Resume brevemente el plan de implementación.
2. Lista los archivos que vas a crear o modificar.
3. Confirma que no abrirás cámara ni serial.

Después de implementar:

1. Ejecuta o indica cómo ejecutar los tests del Edge.
2. Verifica que simulation sigue siendo el default.
3. Resume archivos creados/modificados.
4. Indica qué quedó pendiente para el siguiente paso.
5. Registra este prompt run en:
   - docs/prompt-runs-finalproject/2026-06-28-003-edge-drop-zone-foundation.md

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

- `simulation` permanece como default y sin regresiones.
- Los tres perfiles quedan modelados explícitamente.
- Planner puro, determinista y sin I/O.
- Adapter fail-closed con reservas, confirmación y reset.
- JSON seguro separado del código.
- Tests reproducibles sin hardware.
- Documentación y trazabilidad actualizadas.

## Resultado obtenido

- Se implementaron los siete modelos internos solicitados.
- La configuración acepta los tres perfiles y usa defaults seguros.
- El runner solo ejecuta `simulation`; los otros perfiles abortan antes de Backend o dispositivos.
- Se implementó `DropZonePlanner` puro con error `ZONE_UNAVAILABLE`.
- Se implementó `DropZoneAdapter` con validación estricta, reservas por `run_id`, confirmación, cancelación, reset y persistencia hardware opt-in atómica.
- `simulation` y `vision-dry-run` mantienen estado únicamente en memoria.
- Se añadió un JSON de ejemplo con 16 slots inactivos y coordenadas placeholder.
- Se ejecutaron 22 tests unitarios y todos aprobaron.
- La ejecución reproducible con `python -m pytest tests -q` finalizó con `22 passed`.
- La compilación Python de módulos y tests terminó sin errores.

## Archivos modificados

- Modificado: `edge/src/edge_runner.py`
- Modificado: `edge/config/edge.config.example.json`
- Modificado: `edge/requirements.txt`
- Modificado: `edge/README.md`
- Creado: `edge/src/models.py`
- Creado: `edge/src/config.py`
- Creado: `edge/src/robot/__init__.py`
- Creado: `edge/src/robot/drop_zone_planner.py`
- Creado: `edge/src/robot/drop_zone_adapter.py`
- Creado: `edge/config/drop_zones.example.json`
- Creado: `edge/tests/__init__.py`
- Creado: `edge/tests/helpers.py`
- Creado: `edge/tests/test_config.py`
- Creado: `edge/tests/test_drop_zone_planner.py`
- Creado: `edge/tests/test_drop_zone_adapter.py`
- Creado: `edge/tests/test_edge_runner.py`
- Creado: `docs/prompt-runs-finalproject/2026-06-28-003-edge-drop-zone-foundation.md`

## Observaciones

- No se modificó Backend ni Frontend.
- No se copió ni modificó contenido de `_local_context/`.
- No se importó o abrió cámara, OpenCV, pyserial ni puerto COM.
- No se ejecutó MaxArm.
- El ejemplo usa `dryRun=true`, movimiento hardware deshabilitado y slots inactivos.
- `pytest==8.3.4` quedó fijado para reproducir la ejecución alternativa de la suite.
- La integración entre cubo detectado, plan de movimiento y acción Backend queda para el siguiente paso.
- No se hizo commit ni push.
