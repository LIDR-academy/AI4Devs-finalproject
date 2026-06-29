# Prompt Run - Validacion de camara, QR y color

## Fecha

2026-06-29

## Objetivo

Validar y fortalecer Edge Vision mediante una imagen de prueba para detectar QR
real y cubos por color, producir `DetectionSnapshot` reproducible y preparar la
ejecucion futura con camara, sin serial ni MaxArm.

## Agentes usados

- `prompts/agents/edge.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`
- `prompts/agents/delivery-manager.md`

## Subagentes usados

- `prompts/subagents/edge-vision.md`
- `prompts/subagents/qa-api.md`

El subagente Edge audito captura, QR, color, evidencia y gates. El subagente QA
ejecuto pruebas seguras acotadas a `edge/tests` y reviso casos fail-closed.

## Skills usadas

- `prompts/skills/opencv.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`

## Contexto leido

- `AGENTS.md`
- `README.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/evidence/finalproject/2026-06-29-e2e-dry-run-dashboard.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `edge/` y `edge/README.md`
- `backend/`
- `frontend/`
- agentes, subagentes y skills enumerados arriba
- contexto local de QR, color, vision integrada y pickup dinamico, solo lectura

## Archivos destino

- `edge/config/edge.vision.example.json`
- `edge/src/vision_runner.py`
- `edge/src/vision/pipeline.py`
- `edge/tests/test_vision_runner.py`
- `edge/tests/test_vision_pipeline.py`
- `edge/README.md`
- `docs/evidence/finalproject/2026-06-29-camera-qr-color-validation.md`
- `docs/prompt-runs-finalproject/2026-06-29-003-camera-qr-color-validation.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guia principal.

Actua como edge, QA, documenter y delivery-manager. Usa los subagentes
edge-vision y qa-api, y los skills opencv, documentation y gitflow.

Lee README, plan de entrega final, evidencia E2E previa, template de prompt runs,
edge, backend y frontend. Lee como contexto local, sin modificar, los spikes de
truck_code_detection, vision_color_detection, integrated_vision_detection y
dynamic_pickup_detection.

Objetivo: validar y fortalecer el flujo de vision real usando camara fisica o
imagen de prueba para detectar QR real, cubos por color y generar
DetectionSnapshot reproducible, sin serial ni MaxArm. Fecha 2026-06-29.

Verifica capture, qr_reader, color_detector, cube_selector, vision_runner y
evidence writer; simulation como default; gate --allow-camera; ausencia de serial
y MaxArm; configuracion vision-dry-run segura; fixture; instrucciones de camara,
ROI y HSV; JSON y anotada; y errores fail-closed para QR ausente/invalido, ROI,
imagen inexistente, camara sin flag y ausencia de cubos.

Ejecuta tests Edge. No integres MaxArm, no uses mode=hardware ni dry_run=false, no
rompas simulation, no hagas depender tests de camara, no copies ni modifiques
_local_context, no guardes secretos y no hagas commit/push.

Crea:
- docs/evidence/finalproject/2026-06-29-camera-qr-color-validation.md
- docs/prompt-runs-finalproject/2026-06-29-003-camera-qr-color-validation.md

Puedes aplicar solo gaps menores para hacer la validacion reproducible. Antes,
resume plan, comandos, fuente y seguridad. Despues, entrega resultado, veredicto,
archivos y proximo paso.
```

## Resultado esperado

- Pipeline Vision revisado y seguro.
- Configuracion de ejemplo relativa y reproducible.
- QR y cubos detectados mediante fixture o camara autorizada.
- Snapshot JSON e imagen anotada.
- Casos fail-closed y tests Edge aprobados.
- Sin serial, MaxArm, hardware ni cambios en `_local_context/`.
- Evidencia y prompt run completos.

## Resultado obtenido

- Se agrego `edge.vision.example.json` con fixture local relativo, ROI QR/carga,
  HSV, `dryRun=true` y hardware deshabilitado.
- El runner ahora rechaza configuracion insegura antes de capturar.
- El snapshot del runner distingue `opencv-file` y `opencv-camera`.
- La metadata incluye `qrRawValue` y protege los flags QR calculados.
- Fixture original: QR `TRUCK-003` valido y 6 cubos correctos.
- Evidencia JSON y PNG anotada generadas.
- Edge: **61 tests aprobados**.
- Camara real no ejecutada.
- Serial no abierto; MaxArm no importado ni ejecutado.
- `_local_context/` leido sin modificaciones durante esta validacion.
- Veredicto: **APROBADO CON OBSERVACIONES**.

## Archivos creados o modificados

### Creados

- `edge/config/edge.vision.example.json`
- `docs/evidence/finalproject/2026-06-29-camera-qr-color-validation.md`
- `docs/prompt-runs-finalproject/2026-06-29-003-camera-qr-color-validation.md`

### Modificados

- `edge/src/vision_runner.py`
- `edge/src/vision/pipeline.py`
- `edge/tests/test_vision_runner.py`
- `edge/tests/test_vision_pipeline.py`
- `edge/README.md`

### Generados e ignorados por Git

- `workspace/generated/vision-evidence/snapshot-7b28aa25-ad2c-4b51-8d7c-32b4a9bdc662.json`
- `workspace/generated/vision-evidence/snapshot-7b28aa25-ad2c-4b51-8d7c-32b4a9bdc662-annotated.png`
- evidencia del primer fixture anotado fallido bajo el mismo directorio

## Observaciones

- La camara fisica queda pendiente de autorizacion y validacion del montaje.
- El primer fixture ya anotado genero ruido; se documento y se reemplazo por el
  frame original sin copiarlo.
- `confidence` permanece null; `area` y `fillRatio` sirven como diagnostico.
- El ejemplo depende de una imagen local no versionada. Un fixture propio y
  autorizado mejoraria portabilidad en una tarea posterior.
- No se modificaron Backend ni Frontend.
- No se hizo commit ni push.
