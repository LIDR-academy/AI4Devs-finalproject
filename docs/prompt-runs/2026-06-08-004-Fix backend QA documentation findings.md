Usa AGENTS.md como guía principal del proyecto.

Actúa como:
- prompts/agents/documenter.md

Usa skills:
- prompts/skills/documentation.md
- prompts/skills/api-design.md

Lee:
- docs/evidence/backend-api-test-results.md
- backend/README.md
- backend/.env.example
- docs/architecture/architecture-entrega2.md
- docs/delivery/04-backend-implementation-plan.md

Objetivo:
Corregir las observaciones documentales detectadas por QA para el backend MVP de Entrega 2.

Debes resolver:
1. QA-BE-001: actualizar backend/README.md para usar la DATABASE_URL vigente de Docker:
   postgresql://robodock_user:robodock_pass@localhost:5434/robodockdb?schema=public

2. QA-BE-002: crear docs/api-design.md como fuente clara de endpoints implementados.

3. QA-BE-004: alinear la documentación para dejar claro que el backend MVP implementa rutas sin prefijo /api:
   - GET /health
   - POST /sessions
   - GET /sessions
   - GET /sessions/:id
   - POST /sessions/:id/cubes
   - POST /robot/actions
   - GET /dashboard/operational

Sobre QA-BE-003:
- No modificar código.
- Solo documentar que fue una advertencia no bloqueante de Prisma en Windows y que, si se repite, se puede cerrar procesos Node/Prisma y ejecutar npm run prisma:generate.

Restricciones:
- No modifiques backend/src.
- No modifiques Prisma.
- No modifiques frontend.
- No modifiques edge.
- No cambies las rutas implementadas.
- No declares hardware real como implementado.
- No hagas commit ni push.

Al finalizar, resume:
1. Archivos modificados.
2. Observaciones QA resueltas.
3. Observaciones que quedan documentadas.
4. Próximo paso recomendado.