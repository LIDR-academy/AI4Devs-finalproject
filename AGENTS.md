\# AGENTS.md - RoboDock AI



\## Proyecto

RoboDock AI es el proyecto final de AI4Devs. El objetivo es construir un MVP que combine visión computacional, QR, backend, dashboard y control/simulación del brazo MaxArm para automatizar la descarga de cubos desde un camión.



\## Entrega 2

La Entrega 2 debe incluir desarrollo funcional, no solo documentación.



Flujo MVP:

1\. Crear o identificar camión por QR.

2\. Crear sesión de descarga.

3\. Detectar cubos por color.

4\. Registrar cubos en backend.

5\. Registrar o simular acciones del robot.

6\. Visualizar estado en dashboard.

7\. Documentar ejecución, evidencias y prompts.



\## Estructura esperada

\- backend/: API, Prisma, PostgreSQL.

\- frontend/: Dashboard web.

\- edge/: Visión, QR, MaxArm y simulación.

\- docs/: Arquitectura, API, modelo de datos, pruebas y evidencias.

\- prompts/: agentes, subagentes, skills, commands y playbooks.



\## Reglas generales

\- Trabajar de forma incremental.

\- No sobreingenierizar.

\- Priorizar software ejecutable.

\- No eliminar trabajo previo sin justificar.

\- No modificar carpetas fuera del alcance del agente invocado.

\- Usar `id` como UUID técnico.

\- Usar `code` como identificador de negocio cuando aplique.

\- Mantener `.env` fuera del repositorio.

\- Documentar variables de entorno en `.env.example`.

\- Después de cambios relevantes, indicar cómo probar.

\- Antes de implementar tareas complejas, proponer plan breve.



\## Stack sugerido

\- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL.

\- Frontend: React, Vite, TypeScript.

\- Edge: Python, OpenCV, QR detection, serial para MaxArm.

\- Documentación: Markdown.



\## Criterio general de término

Una tarea se considera terminada cuando:

\- El cambio está implementado.

\- Hay instrucciones de prueba.

\- No rompe el flujo principal.

\- La documentación mínima queda actualizada.

