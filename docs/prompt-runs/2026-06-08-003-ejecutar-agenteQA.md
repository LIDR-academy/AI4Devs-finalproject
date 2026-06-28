Usa AGENTS.md como guía principal del proyecto.

Actúa como:
- prompts/agents/qa.md

Usa subagente:
- prompts/subagents/qa-api.md

Usa command:
- prompts/commands/test-flow.md

Lee:
- docs/delivery/04-backend-implementation-plan.md
- docs/architecture/architecture-entrega2.md
- backend/README.md
- docs/api-design.md
- backend/

Objetivo:
Validar el backend MVP implementado para la Entrega 2.

Debes crear o actualizar:
- docs/evidence/backend-api-test-results.md

Valida:
1. GET /health
2. POST /sessions
3. GET /sessions
4. GET /sessions/:id
5. POST /sessions/:id/cubes
6. POST /robot/actions
7. GET /dashboard/operational

Incluye:
- comandos PowerShell/curl usados
- resultado esperado
- resultado obtenido
- defectos encontrados
- recomendaciones mínimas

Restricciones:
- No modifiques backend salvo que detectes un error crítico y lo expliques antes.
- No modifiques frontend.
- No modifiques edge.
- No hagas commit ni push.

Al finalizar, resume:
1. Archivos modificados.
2. Endpoints OK.
3. Endpoints con problemas.
4. Próximo paso recomendado.