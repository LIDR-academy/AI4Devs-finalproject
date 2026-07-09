Usa AGENTS.md como guía principal del proyecto.

Actúa como:

* prompts/agents/backend.md

Usa subagentes:

* prompts/subagents/backend-prisma.md
* prompts/subagents/backend-api.md

Usa skills:

* prompts/skills/api-design.md
* prompts/skills/prisma-postgres.md
* prompts/skills/documentation.md

Usa commands:

* prompts/commands/implement-feature.md
* prompts/commands/create-endpoint.md

Lee como contexto:

* docs/delivery/04-backend-implementation-plan.md
* docs/delivery/01-alcance-entrega2.md
* docs/delivery/02-plan-delivery-entrega2.md
* docs/architecture/architecture-entrega2.md
* docs/decisions/
* docs/delivery/roadmap-entregas.md

Objetivo:
Implementar el backend MVP de la Entrega 2 de RoboDock AI siguiendo el plan definido en docs/delivery/04-backend-implementation-plan.md.

Alcance de esta tarea:

* Crear o actualizar el proyecto backend en backend/.
* Configurar Node.js + Express + TypeScript.
* Configurar Prisma + PostgreSQL.
* Crear schema.prisma con el modelo mínimo necesario para la Entrega 2.
* Crear migración inicial si corresponde.
* Crear seed con datos demostrativos.
* Implementar endpoints mínimos del MVP.
* Crear .env.example.
* Documentar comandos de instalación, migración, seed y ejecución.

Endpoints mínimos esperados:

* GET /health
* POST /sessions
* GET /sessions
* GET /sessions/:id
* POST /sessions/:id/cubes
* POST /robot/actions
* GET /dashboard/operational

Reglas importantes:

* La Entrega 2 debe funcionar con Edge en modo simulation.
* No declares hardware real como implementado.
* El backend debe recibir datos simulados como si vinieran del Edge real.
* Usa id como UUID técnico.
* Usa code como identificador de negocio cuando aplique.
* Mantén el diseño simple, demostrable y alineado al MVP.
* Evita sobreingeniería.
* No modifiques frontend/.
* No modifiques edge/.
* No modifiques documentación fuera de docs/api-design.md, docs/data-model.md o backend/README.md si necesitas documentar el backend.
* No hagas commit ni push.

Antes de modificar archivos:

1. Resume brevemente el plan de implementación.
2. Lista los archivos que esperas crear o modificar.

Luego implementa.

Al finalizar:

1. Resume los archivos creados o modificados.
2. Indica los comandos para instalar dependencias.
3. Indica los comandos para configurar Prisma.
4. Indica los comandos para ejecutar migración y seed.
5. Indica cómo levantar el backend.
6. Indica cómo probar cada endpoint con curl o PowerShell.
7. Indica riesgos o pendientes.
