# Prompt Run - Vision Color Tuning

## Fecha

2026-07-04

## Objetivo

Ajustar y endurecer la deteccion de cubos por color en Edge Vision, tomando como
referencia tecnica el spike `dynamic_pickup_maxarm_pick` y manteniendo perfiles
seguros sin serial ni movimiento MaxArm.

## Agente

- `prompts/agents/edge.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes

- `prompts/subagents/edge-vision.md`

## Skills

- `prompts/skills/opencv.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`

## Command

- N/A

## Playbook

- N/A

## Contexto leido

- `README.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/evidence/finalproject/2026-06-29-dashboard-vision-auto-refresh.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `edge/`
- `edge/README.md`
- `edge/src/vision/color_detector.py`
- `edge/src/vision/pipeline.py`
- `edge/src/vision/evidence.py`
- `edge/src/service/vision_api.py`
- `edge/config/edge.vision.example.json`
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/pick_dynamic_cube_with_maxarm.py`

## Archivo destino

- `edge/src/config.py`
- `edge/src/vision/color_detector.py`
- `edge/src/vision/evidence.py`
- `edge/src/service/vision_api.py`
- `edge/src/vision_runner.py`
- `edge/src/edge_dry_run.py`
- `edge/config/edge.vision.example.json`
- `edge/tests/test_color_detector.py`
- `edge/tests/test_config.py`
- `edge/README.md`
- `docs/evidence/finalproject/2026-07-04-vision-color-tuning.md`
- `docs/prompt-runs-finalproject/2026-07-04-001-vision-color-tuning.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guia principal del proyecto.

Actua como:

* prompts/agents/edge.md
* prompts/agents/qa.md
* prompts/agents/documenter.md

Usa subagentes:

* prompts/subagents/edge-vision.md

Usa skills:

* prompts/skills/opencv.md
* prompts/skills/documentation.md
* prompts/skills/gitflow.md

Objetivo:
Ajustar y endurecer la deteccion de cubos por color en Edge Vision usando como
referencia tecnica el spike dynamic_pickup_maxarm_pick, especialmente
pick_dynamic_cube_with_maxarm.py, donde la configuracion de deteccion funcionaba
mejor para el montaje fisico.

Fecha: 2026-07-04
Correlativo prompt run del dia: 001

Debes crear:
* docs/evidence/finalproject/2026-07-04-vision-color-tuning.md
* docs/prompt-runs-finalproject/2026-07-04-001-vision-color-tuning.md

Alcance:
1. Revisar Edge Vision actual.
2. Revisar el spike local.
3. Extraer criterios utiles: ROI, HSV, morfologia, area, ancho/alto, aspect
   ratio, tamano esperado, exclusion de bordes y deduplicacion.
4. Mejorar la configuracion JSON con minArea, maxArea, minWidth, maxWidth,
   minHeight, maxHeight, minFillRatio, maxAspectRatio, minAspectRatio,
   overlapThreshold o NMS, sizeValid y filtros por ROI.
5. Evitar contar bordes largos del pickup como cubos.
6. Limitar la deteccion estrictamente a cargoRoi.
7. Mantener coordenadas globales en snapshot.
8. Mejorar overlay visual.
9. Mantener debug seguro.
10. Mantener simulation como default.
11. Mantener vision-dry-run seguro.
12. No abrir serial.
13. No mover MaxArm.
14. No usar mode=hardware.

Tests requeridos:
* python -m pytest -q
* Agregar o ajustar tests para falsos positivos, aspect ratio, areas fuera de
  rango, detecciones validas, ROI global, deduplicacion y sin camara fisica.

Documentacion:
* Actualizar edge/README.md.
* Actualizar evidencia con objetivo, fecha, rama, commit, problema, referencia,
  ajustes, comandos, tests, resultado visual, seguridad, pendientes y conclusion.
* Registrar este prompt run usando la plantilla.

Restricciones:
* No copiar directamente el script del spike.
* No modificar _local_context/.
* No agregar edge/config/edge.vision.local.json.
* No abrir puerto serial.
* No ejecutar MaxArm.
* No usar hardware.
* No cambiar dry_run=false.
* No hacer commit ni push.
```

## Resultado

- Detector endurecido con filtros geometricos configurables y NMS.
- Overlay de evidencia con color, score opcional y `sizeValid`.
- Tests Edge verdes: `82 passed`.
- Validacion: **APROBADO CON OBSERVACIONES** por falta de evidencia visual manual
  con camara cenital en el montaje fisico.
