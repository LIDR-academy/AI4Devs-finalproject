Usa AGENTS.md como guía principal del proyecto.

Actúa como el agente definido en:
- prompts/agents/architect.md

Usa las skills:
- prompts/skills/api-design.md
- prompts/skills/prisma-postgres.md
- prompts/skills/documentation.md

Lee:
- docs/delivery/00-diagnostico-inicial.md
- docs/delivery/01-alcance-entrega2.md
- docs/delivery/02-plan-delivery-entrega2.md
- docs/entrega-1/
- spikes/

Objetivo:
Definir la arquitectura técnica mínima para la Entrega 2 de RoboDock AI.

Debes crear o actualizar:
- docs/architecture/architecture-entrega2.md

El documento debe incluir:
1. Arquitectura MVP.
2. Componentes principales.
3. Responsabilidades de backend, frontend y edge.
4. Contratos entre componentes.
5. Endpoints mínimos.
6. Modelo de datos mínimo.
7. Flujo principal end-to-end.
8. Modo simulation vs modo hardware.
9. Riesgos técnicos.
10. Decisiones que deberían documentarse como ADR.

Restricciones:
- No implementes código.
- No modifiques backend, frontend ni edge.
- No modifiques otros archivos.
- Evita sobreingeniería.
- Diferencia claramente MVP actual de evolución futura.

Al finalizar, resume:
- archivos modificados
- decisiones técnicas principales
- ADRs recomendados
- próximo agente recomendado