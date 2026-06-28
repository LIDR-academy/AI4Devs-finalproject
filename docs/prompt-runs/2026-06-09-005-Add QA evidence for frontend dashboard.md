Usa AGENTS.md como guía principal del proyecto.

Actúa como:
- prompts/agents/qa.md

Usa command:
- prompts/commands/test-flow.md

Lee:
- docs/delivery/roadmap-entregas.md
- docs/delivery/01-alcance-entrega2.md
- docs/delivery/02-plan-delivery-entrega2.md
- docs/api-design.md
- backend/README.md
- edge/README.md
- frontend/README.md
- docs/evidence/backend-api-test-results.md
- docs/evidence/edge-simulation-test-results.md
- frontend/

Objetivo:
Validar el frontend/dashboard operacional de RoboDock AI para la Entrega 2.

Debes crear o actualizar:
- docs/evidence/frontend-dashboard-test-results.md

Valida:
1. El frontend levanta correctamente.
2. Consume el backend real.
3. Muestra sesión activa.
4. Muestra truckCode.
5. Muestra estado de sesión.
6. Muestra conteo por color.
7. Muestra total de cubos.
8. Muestra últimas acciones del robot.
9. Muestra claramente que el modo es simulation.
10. Maneja loading, error y empty state si están implementados.

Incluye:
- comandos usados
- resultado esperado
- resultado obtenido
- evidencia visual sugerida
- defectos encontrados
- recomendaciones mínimas
- estado general: aprobado / aprobado con observaciones / rechazado

Restricciones:
- No modifiques backend.
- No modifiques edge.
- No modifiques frontend salvo documentación de evidencia.
- No hagas commit ni push.
- No declares hardware real como implementado.

Al finalizar, resume:
1. Archivos modificados.
2. Resultado QA.
3. Defectos encontrados.
4. Próximo paso recomendado.