Usa AGENTS.md como guía principal del proyecto.

Actúa como:
- prompts/agents/qa.md

Usa subagentes:
- prompts/subagents/qa-api.md

Usa command:
- prompts/commands/test-flow.md

Lee:
- docs/delivery/roadmap-entregas.md
- docs/delivery/01-alcance-entrega2.md
- docs/delivery/02-plan-delivery-entrega2.md
- docs/architecture/architecture-entrega2.md
- docs/api-design.md
- backend/README.md
- edge/README.md
- docs/evidence/backend-api-test-results.md
- backend/
- edge/

Objetivo:
Validar el flujo completo de Entrega 2 con Backend + PostgreSQL + Edge en modo simulation.

Debes crear o actualizar:
- docs/evidence/edge-simulation-test-results.md

Valida:
1. Docker PostgreSQL levantado.
2. Backend levantado en http://localhost:3000.
3. GET /health responde OK.
4. Edge simulation se ejecuta correctamente.
5. Edge simulation crea sesión con truckCode TRUCK-001.
6. Edge simulation registra cubos simulados.
7. Edge simulation registra acción robot en mode simulation.
8. GET /dashboard/operational refleja sesión activa, conteo de cubos y última acción robot.
9. No se declara ni ejecuta hardware real.

Incluye:
- comandos usados.
- resultado esperado.
- resultado obtenido.
- evidencia del JSON devuelto por dashboard.
- defectos encontrados.
- recomendaciones mínimas.
- estado general: aprobado / aprobado con observaciones / rechazado.

Restricciones:
- No modifiques backend.
- No modifiques edge salvo documentación de evidencia.
- No modifiques frontend.
- No hagas commit ni push.
- No declares hardware real como implementado.

Al finalizar, resume:
1. Archivos modificados.
2. Resultado QA.
3. Defectos encontrados.
4. Próximo paso recomendado.