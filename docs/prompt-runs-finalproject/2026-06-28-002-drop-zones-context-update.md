# Prompt Run - Drop Zones Context Update

## Fecha

2026-06-28

## Objetivo

Actualizar el plan de Entrega Final con la validación física/empírica reportada para `dynamic_pickup_maxarm_pick` y formalizar el diseño de selección, ocupación y reset seguro de las zonas de descarga por color.

## Agentes usados

- `prompts/agents/architect.md`
- `prompts/agents/edge.md`
- `prompts/agents/documenter.md`

## Subagentes usados

- `prompts/subagents/edge-maxarm.md`
- `prompts/subagents/edge-vision.md`

Los subagentes realizaron auditorías de solo lectura sobre la integración MaxArm/drop zones y los límites entre visión, selección y persistencia. No modificaron archivos.

## Skills usadas

- `prompts/skills/maxarm.md`
- `prompts/skills/opencv.md`
- `prompts/skills/documentation.md`

## Command

- No se usó un command local específico.

## Playbook

- No se usó un playbook local específico.

## Archivos de contexto

- `AGENTS.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `prompts/agents/architect.md`
- `prompts/agents/edge.md`
- `prompts/agents/documenter.md`
- `prompts/subagents/edge-maxarm.md`
- `prompts/subagents/edge-vision.md`
- `prompts/skills/maxarm.md`
- `prompts/skills/opencv.md`
- `prompts/skills/documentation.md`
- `edge/`
- `backend/`
- `frontend/`
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/` como contexto de solo lectura
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/drop_zones_config.json` como contexto de solo lectura

## Archivos destino

- `docs/delivery/06-plan-entrega-final.md`
- `docs/prompt-runs-finalproject/2026-06-28-002-drop-zones-context-update.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guía principal del proyecto.

Actúa como:
- prompts/agents/architect.md
- prompts/agents/edge.md
- prompts/agents/documenter.md

Usa subagentes:
- prompts/subagents/edge-maxarm.md
- prompts/subagents/edge-vision.md

Usa skills:
- prompts/skills/maxarm.md
- prompts/skills/opencv.md
- prompts/skills/documentation.md

Lee:
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
Actualizar el plan de Entrega Final incorporando el nuevo contexto técnico del spike dynamic_pickup_maxarm_pick.

Contexto adicional:
El spike dynamic_pickup_maxarm_pick tuvo pruebas reales/físicas/empíricas donde el brazo MaxArm logró descargar cubos hacia zonas de descarga por color. Además, existe una configuración drop_zones_config.json con zonas red, blue, yellow y green, cada una con 4 posiciones configuradas mediante x, y, z, position_order, active y occupied.

Este diseño debe considerarse para la integración final:
- Para cada cubo detectado por color, el sistema debe elegir una posición de descarga del color correspondiente.
- Solo puede elegir posiciones con active=true y occupied=false.
- Después de una descarga exitosa, la posición debe marcarse como occupied=true.
- Debe existir una forma segura de resetear occupied=false para nuevas pruebas.
- La configuración de drop zones debe mantenerse separada del código.
- No se debe ejecutar hardware real sin gates de seguridad, dry-run previo y confirmación humana.

Debes actualizar:
- docs/delivery/06-plan-entrega-final.md

Debes crear:
- docs/prompt-runs-finalproject/2026-06-28-002-drop-zones-context-update.md

En docs/delivery/06-plan-entrega-final.md debes:
1. Corregir la interpretación del spike dynamic_pickup_maxarm_pick indicando que existe validación física/empírica de descarga por color.
2. Agregar la configuración de drop zones como componente relevante de Entrega Final.
3. Documentar la regla active/occupied.
4. Incluir el concepto de DropZoneAdapter o DropZonePlanner dentro de Edge.
5. Agregar criterios de aceptación para:
   - selección de zona por color;
   - posición activa y libre;
   - marcado de occupied tras descarga exitosa;
   - reset de ocupación para nuevas pruebas;
   - manejo de zona llena o sin posiciones activas.
6. Actualizar riesgos relacionados con consistencia de occupied en archivo JSON.
7. Mantener simulation como fallback.
8. No declarar operación hardware final como implementada hasta que exista evidencia final reproducible dentro de la rama finalproject-ASP.

En docs/prompt-runs-finalproject/2026-06-28-002-drop-zones-context-update.md debes registrar este prompt run usando:
- docs/prompt-runs-finalproject/_template.md

Restricciones:
- No modifiques código.
- No copies archivos desde _local_context/ hacia edge/.
- No modifiques _local_context/.
- No elimines simulation.
- No hagas commit ni push.
- No incluyas secretos ni rutas absolutas innecesarias en documentación final.

Al finalizar, resume:
1. Archivos modificados o creados.
2. Cambios principales al plan.
3. Decisiones incorporadas sobre drop zones.
4. Próximo agente recomendado.
```

## Resultado esperado

- Interpretación corregida del spike y separación clara entre validación empírica histórica y evidencia final reproducible.
- Drop zones incorporadas al alcance, arquitectura, criterios, cambios técnicos, gates, riesgos, evidencias y roadmap.
- Política determinista para posiciones activas/libres y manejo fail-closed de zonas no disponibles.
- Reset seguro, auditable y sin movimiento.
- `simulation` conservado como fallback sin contaminar el estado hardware.

## Resultado obtenido

- Se reconoció la validación física/empírica reportada de descarga por color del spike.
- Se mantuvo pendiente el claim de hardware final hasta reproducirlo con evidencia correlacionada dentro de `finalproject-ASP`.
- Se incorporaron `CubeSelector`, `DropZonePlanner` y `DropZoneAdapter` con responsabilidades separadas.
- Se documentó la selección por mismo color, `active=true`, `occupied=false` y menor `position_order`.
- Se definió reserva por ciclo, confirmación de ocupación al release, manejo `ZONE_UNAVAILABLE`, reset seguro y bloqueo por divergencia.
- Se añadieron mitigaciones para concurrencia, corrupción, escritura no atómica y contaminación entre simulation/dry run/hardware.
- Se actualizaron gates, riesgos, evidencias y roadmap.

## Archivos modificados

- Modificado: `docs/delivery/06-plan-entrega-final.md`
- Creado: `docs/prompt-runs-finalproject/2026-06-28-002-drop-zones-context-update.md`

No se modificó código ni contenido bajo `_local_context/`.

## Observaciones

- El spike contiene 16 slots: cuatro para cada color `red`, `blue`, `yellow` y `green`.
- El estado `occupied=true` aislado no demuestra una descarga física porque el dry run del spike también puede ocupar slots.
- Los artefactos locales revisados no sustituyen la evidencia final solicitada; la validación empírica histórica se acepta como contexto aportado y deberá reproducirse en la rama final.
- La visión no debe leer ni escribir drop zones. Debe entregar detecciones normalizadas al selector.
- Para el MVP local se propone un único writer con reserva, lock y escritura atómica. Una fuente transaccional compartida queda como evolución si aparecen múltiples procesos.
- El reset nunca debe ser automático al iniciar y requiere inspección física de zonas vacías.
- No se hizo commit ni push.
