Usa AGENTS.md como guía principal del proyecto.

Actúa como:
- prompts/agents/documenter.md

Usa skills:
- prompts/skills/documentation.md

Lee:
- docs/evidence/edge-simulation-test-results.md
- docs/delivery/01-alcance-entrega2.md
- docs/delivery/02-plan-delivery-entrega2.md
- docs/architecture/architecture-entrega2.md
- edge/README.md
- backend/README.md

Objetivo:
Crear docs/delivery/roadmap-entregas.md para resolver la observación QA-EDGE-001 y dejar clara la estrategia por entregas.

Debes crear:
- docs/delivery/roadmap-entregas.md

El documento debe indicar claramente:
1. La Entrega 2 implementa la arquitectura funcional completa con contratos reales, usando modo simulation como primera implementación del Edge.
2. La Entrega 3 reemplaza o complementa esos adapters simulados por adapters hardware basados en los spikes ya validados de cámara, QR, OpenCV y MaxArm.
3. La simulación de Entrega 2 no es trabajo desechable.
4. Backend, frontend, base de datos y contratos API deben permanecer estables.
5. La integración física real no debe declararse como implementada en Entrega 2.
6. Los spikes de hardware son evidencia de factibilidad para Entrega 3.

Restricciones:
- No modifiques backend.
- No modifiques edge.
- No modifiques frontend.
- No declares hardware real como implementado.
- No hagas commit ni push.

Al finalizar, resume:
1. Archivo creado.
2. Decisiones documentadas.
3. Próximo paso recomendado.