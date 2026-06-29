# Prompt Run - Plan de Entrega Final

## Fecha

2026-06-28

## Objetivo

Preparar el plan ejecutable de la Entrega Final de RoboDock AI para integrar cámara real, QR, OpenCV y MaxArm, manteniendo `simulation` como fallback y separando claramente factibilidad experimental de hardware demostrado.

## Agentes usados

- `prompts/agents/po.md`
- `prompts/agents/delivery-manager.md`
- `prompts/agents/architect.md`
- `prompts/agents/edge.md`

## Subagentes

- No se usaron subagentes.

## Skills usadas

- `prompts/skills/opencv.md`
- `prompts/skills/maxarm.md`
- `prompts/skills/documentation.md`

## Command

- No se usó un command local específico.

## Playbook

- No se usó un playbook local específico.

## Archivos de contexto

- `AGENTS.md`
- `README.md`
- `docs/delivery/05-final-review-entrega2.md`
- `docs/delivery/roadmap-entregas.md`
- `docs/architecture/architecture-entrega2.md`
- `docs/api-design.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `prompts/agents/po.md`
- `prompts/agents/delivery-manager.md`
- `prompts/agents/architect.md`
- `prompts/agents/edge.md`
- `prompts/skills/opencv.md`
- `prompts/skills/maxarm.md`
- `prompts/skills/documentation.md`
- `backend/`
- `edge/`
- `frontend/`
- `_local_context/spikes/experiments/` como contexto de solo lectura

## Archivos destino

- `docs/delivery/06-plan-entrega-final.md`
- `docs/prompt-runs-finalproject/2026-06-28-001-plan-entrega-final.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guía principal del proyecto.

Actúa como:
- prompts/agents/po.md
- prompts/agents/delivery-manager.md
- prompts/agents/architect.md
- prompts/agents/edge.md

Usa skills:
- prompts/skills/opencv.md
- prompts/skills/maxarm.md
- prompts/skills/documentation.md

Lee:
- README.md
- docs/delivery/05-final-review-entrega2.md
- docs/delivery/roadmap-entregas.md
- docs/architecture/architecture-entrega2.md
- docs/prompt-runs-finalproject/README.md
- docs/prompt-runs-finalproject/_template.md
- backend/
- edge/
- frontend/

Lee como contexto local, pero no lo modifiques:
- _local_context/spikes/experiments/

Objetivo:
Preparar el plan de Entrega Final de RoboDock AI con integración real de cámara, QR, OpenCV y MaxArm, manteniendo simulation como fallback.

Debes crear:
- docs/delivery/06-plan-entrega-final.md
- docs/prompt-runs-finalproject/2026-06-28-001-plan-entrega-final.md

El documento docs/delivery/06-plan-entrega-final.md debe incluir:
1. Objetivo de la entrega final.
2. Alcance funcional final.
3. Historias de usuario finales.
4. Criterios de aceptación.
5. Arquitectura objetivo simulation + hardware.
6. Spikes/experiments relevantes encontrados en _local_context/spikes/experiments/.
7. Qué se reutilizará de los experiments.
8. Qué no debe copiarse directamente.
9. Cambios requeridos en Edge.
10. Cambios requeridos en Backend.
11. Cambios requeridos en Frontend.
12. Plan de integración hardware.
13. Riesgos de seguridad física.
14. Evidencias necesarias.
15. Roadmap semanal hasta el 29-07-2026.

El archivo docs/prompt-runs-finalproject/2026-06-28-001-plan-entrega-final.md debe registrar este prompt run usando como formato base:
- docs/prompt-runs-finalproject/_template.md

Debe incluir:
1. Fecha.
2. Objetivo.
3. Agentes usados.
4. Skills usadas.
5. Archivos de contexto.
6. Archivos destino.
7. Prompt enviado a Codex.
8. Resultado esperado.
9. Resultado obtenido.
10. Archivos modificados.
11. Observaciones.

Restricciones:
- No modifiques código todavía.
- No elimines simulation.
- No declares hardware real como implementado hasta tener evidencia.
- No copies archivos desde _local_context/spikes/experiments/ a edge/.
- No modifiques _local_context/.
- No incluyas secretos, tokens ni passwords reales en el prompt run.
- No hagas commit ni push.

Al finalizar, resume:
1. Archivos creados.
2. Decisiones principales.
3. Próximo agente recomendado.
```

## Resultado esperado

- Un plan de Entrega Final trazable, incremental y verificable hasta el 29-07-2026.
- Alcance e historias con criterios de aceptación.
- Arquitectura que preserve `simulation` y agregue adapters reales de forma segura.
- Inventario crítico de experiments, indicando qué reutilizar y qué no copiar.
- Plan de cambios para Edge, Backend y Frontend.
- Gates de integración MaxArm, riesgos físicos y matriz de evidencias.
- Registro del prompt sin secretos ni claims no demostrados.

## Resultado obtenido

- Se creó el plan con los quince apartados solicitados.
- Se definieron tres perfiles: `simulation`, `vision-dry-run` y `hardware`.
- Se propuso una arquitectura de adapters con `simulation` por defecto y contratos Backend compatibles.
- Se documentó evidencia local de cámara, QR, color y homografía.
- Se dejó explícito que los intentos MaxArm `dry_run=false` revisados fallaron al abrir `COM3/COM4`, por lo que no existe evidencia suficiente para declarar hardware real implementado.
- Se definieron gates G0-G7, doble habilitación para movimiento, criterios de aceptación y roadmap semanal.

## Archivos modificados

- Creado: `docs/delivery/06-plan-entrega-final.md`
- Creado: `docs/prompt-runs-finalproject/2026-06-28-001-plan-entrega-final.md`

No se modificó código ni contenido bajo `_local_context/`.

## Observaciones

- El template base termina dentro del bloque de prompt y no contiene todas las secciones requeridas; se conservó su estructura principal y se completaron los apartados solicitados.
- Los experiments se usaron solo como contexto. No se copiaron archivos, configuraciones ni coordenadas a `edge/`.
- `dynamic_pickup_maxarm_pick/config.json` contiene `dry_run=false`; ese valor se identificó como inseguro y no debe convertirse en default del producto.
- Las coordenadas, poses, ROI, índices de cámara y puertos de los experiments dependen del montaje y deben recalibrarse.
- No se ejecutaron pruebas de hardware, no se realizó commit y no se hizo push.
