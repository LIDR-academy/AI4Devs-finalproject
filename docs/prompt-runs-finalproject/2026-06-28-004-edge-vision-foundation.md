# Prompt Run - Edge Vision Foundation

## Fecha

2026-06-28

## Objetivo

Implementar la base de visión real del Edge para procesar imágenes o un frame de cámara, leer QR, detectar cubos por color, generar `DetectionSnapshot`, seleccionar cubos y producir evidencia opcional, sin integrar ni mover el robot.

## Agentes usados

- `prompts/agents/edge.md`
- `prompts/agents/architect.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes usados

- `prompts/subagents/edge-vision.md`
- `prompts/subagents/qa-api.md`

Los subagentes realizaron auditorías de solo lectura sobre contratos de visión y matriz QA. No modificaron archivos ni abrieron dispositivos.

## Skills usadas

- `prompts/skills/opencv.md`
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
- `prompts/subagents/qa-api.md`
- `prompts/skills/opencv.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`
- `edge/`
- `backend/`
- `frontend/`
- `_local_context/spikes/experiments/truck_code_detection/` como solo lectura
- `_local_context/spikes/experiments/vision_color_detection/` como solo lectura
- `_local_context/spikes/experiments/integrated_vision_detection/` como solo lectura
- `_local_context/spikes/experiments/dynamic_pickup_detection/` como solo lectura

## Archivos destino

- `edge/src/vision/`
- `edge/src/vision_runner.py`
- `edge/src/models.py`
- `edge/src/config.py`
- `edge/config/edge.config.example.json`
- `edge/tests/`
- `edge/requirements.txt`
- `edge/README.md`
- `docs/prompt-runs-finalproject/2026-06-28-004-edge-vision-foundation.md`

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
- prompts/subagents/qa-api.md

Usa skills:
- prompts/skills/opencv.md
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
- _local_context/spikes/experiments/truck_code_detection/
- _local_context/spikes/experiments/vision_color_detection/
- _local_context/spikes/experiments/integrated_vision_detection/
- _local_context/spikes/experiments/dynamic_pickup_detection/

Objetivo:
Implementar la base de visión real para la Entrega Final, incorporando captura desde archivo o cámara, lectura QR, detección de cubos por color con OpenCV, generación de DetectionSnapshot y selección determinista de cubos, sin mover hardware robot.

Alcance de este paso:

1. Mantener simulation como modo por defecto.
2. No modificar la lógica ya implementada de DropZonePlanner y DropZoneAdapter salvo ajustes menores necesarios.
3. Agregar soporte para procesar una imagen de prueba desde archivo.
4. Preparar soporte para cámara real configurable, pero sin obligar a tener cámara conectada para ejecutar tests.
5. Implementar lectura QR con OpenCV usando cv2.QRCodeDetector.
6. Implementar detección de cubos por color usando HSV y parámetros configurables.
7. Implementar ROI configurable para:
   - zona de QR;
   - zona de pickup/carga.
8. Implementar DetectionSnapshot con:
   - runId;
   - timestamp;
   - source;
   - truckCode detectado si existe;
   - lista de CubeDetection;
   - imagen/frame source opcional;
   - metadata segura.
9. Implementar CubeSelector como lógica pura:
   - recibe un DetectionSnapshot;
   - filtra cubos válidos;
   - permite seleccionar un cubo por política determinista;
   - no conoce drop zones;
   - no abre cámara;
   - no abre serial;
   - no llama al backend.
10. Agregar evidencia local opcional:
   - JSON de snapshot;
   - imagen anotada si existe frame disponible;
   - logs sanitizados.
11. Agregar tests unitarios para:
   - QR válido;
   - QR ausente;
   - QR inválido;
   - detección por color desde imagen fixture o mocks;
   - ROI fuera de rango;
   - snapshot sin duplicar estructura;
   - CubeSelector con cubos válidos;
   - CubeSelector sin cubos;
   - CubeSelector con colores soportados;
   - no apertura de cámara/serial durante tests.
12. Actualizar documentación de Edge explicando:
   - cómo ejecutar modo simulation;
   - cómo procesar imagen de prueba;
   - cómo configurar cámara;
   - cómo configurar ROI;
   - cómo configurar rangos HSV;
   - qué queda pendiente para dry-run y hardware real.

Archivos sugeridos a crear o modificar:
- edge/src/vision/capture.py
- edge/src/vision/qr_reader.py
- edge/src/vision/color_detector.py
- edge/src/vision/cube_selector.py
- edge/src/vision/evidence.py
- edge/src/models.py
- edge/src/config.py
- edge/config/edge.config.example.json
- edge/tests/test_qr_reader.py
- edge/tests/test_color_detector.py
- edge/tests/test_cube_selector.py
- edge/tests/fixtures/
- edge/requirements.txt
- edge/README.md
- docs/prompt-runs-finalproject/2026-06-28-004-edge-vision-foundation.md

Restricciones:
- No modifiques Backend todavía salvo que detectes una necesidad crítica y la documentes sin implementarla.
- No modifiques Frontend todavía salvo documentación mínima si es necesario.
- No copies archivos desde _local_context/ hacia edge/.
- No modifiques _local_context/.
- No elimines ni rompas el flujo actual de simulation.
- No abras puerto serial.
- No ejecutes MaxArm.
- No implementes movimiento robot.
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
3. Verifica que los tests de drop zones anteriores siguen pasando.
4. Resume archivos creados/modificados.
5. Indica qué quedó pendiente para el siguiente paso.
6. Registra este prompt run en:
   - docs/prompt-runs-finalproject/2026-06-28-004-edge-vision-foundation.md

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

- Captura desde archivo y soporte de cámara explícitamente habilitado.
- QR con OpenCV y validación configurable.
- Detección HSV con ROI y parámetros externos.
- Snapshot trazable y sin imagen binaria embebida.
- Selector puro y determinista.
- Evidencia opcional y sanitizada.
- Tests sin cámara, serial, Backend o robot.
- Regresión completa de simulation y drop zones.

## Resultado obtenido

- Se implementó captura lazy desde archivo y cámara; la cámara exige `--allow-camera`.
- Se implementó QR mediante `cv2.QRCodeDetector`, regex y allowlist configurables.
- Se implementó detección HSV para cuatro colores, doble rango rojo, filtros de área/fill ratio y coordenadas globales con ROI.
- `DetectionSnapshot` incluye `runId`, UTC, source, truck, detecciones, origen de frame y metadata.
- `CubeSelector` excluye detecciones inválidas y usa política determinista.
- Se añadió `VisionPipeline`, runner aislado y evidencia JSON/imagen opt-in.
- Se fijaron `numpy==2.1.3` y `opencv-python==4.10.0.84`.
- La suite completa terminó con `44 passed`, incluyendo los 22 tests anteriores.
- `simulation` permanece como perfil por defecto.

## Archivos modificados

- Modificado: `edge/src/models.py`
- Modificado: `edge/src/config.py`
- Modificado: `edge/config/edge.config.example.json`
- Modificado: `edge/requirements.txt`
- Modificado: `edge/README.md`
- Creado: `edge/src/vision/__init__.py`
- Creado: `edge/src/vision/capture.py`
- Creado: `edge/src/vision/qr_reader.py`
- Creado: `edge/src/vision/color_detector.py`
- Creado: `edge/src/vision/cube_selector.py`
- Creado: `edge/src/vision/pipeline.py`
- Creado: `edge/src/vision/evidence.py`
- Creado: `edge/src/vision_runner.py`
- Creado: `edge/tests/test_capture.py`
- Creado: `edge/tests/test_qr_reader.py`
- Creado: `edge/tests/test_color_detector.py`
- Creado: `edge/tests/test_cube_selector.py`
- Creado: `edge/tests/test_evidence.py`
- Creado: `edge/tests/test_vision_pipeline.py`
- Creado: `edge/tests/test_vision_runner.py`
- Creado: `docs/prompt-runs-finalproject/2026-06-28-004-edge-vision-foundation.md`

## Observaciones

- No se modificó Backend, Frontend ni `_local_context/`.
- No se abrió serial, no se importó pyserial y no se ejecutó MaxArm.
- Los tests no abren cámara y usan arrays sintéticos o mocks.
- No se copiaron imágenes, configuraciones ni código desde experiments.
- El runner de visión no llama al Backend ni a drop zones.
- La detección entre múltiples frames, homografía, calibración física y envío al Backend quedan pendientes.
- No se hizo commit ni push.
