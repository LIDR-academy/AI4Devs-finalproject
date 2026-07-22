# Local Kanban - ProjectScope AI

Este tablero se gestiona en el repositorio (sin Jira/Notion).

## Reglas
- Actualizar estado de cada tarea moviendola entre columnas.
- Mantener maximo 3 tareas en In Progress.
- Cada tarea debe incluir Ticket, HU, Sprint y PR objetivo.

## Backlog
- [ ] (sin items)

## In Progress
- [ ] (sin items)

## Review
- [ ] (sin items)

## Done
- [x] T01 Definir schema Prisma (HU-01, Sprint 1, PR-01)
- [x] T02 Implementar API de proyectos (HU-01, Sprint 1, PR-02)
- [x] T03 Endpoint de estimacion con Azure OpenAI (HU-04, Sprint 2, PR-03)
- [x] T04 Prompt estructurado (HU-04, Sprint 2, PR-03)
- [x] T05 Formulario de proyecto (HU-01, Sprint 1, PR-04)
- [x] T06 Formulario de casos de uso (HU-02, Sprint 1, PR-04)
- [x] T07 Seleccion de roles (HU-03, Sprint 2, PR-04)
- [x] T08 Vista de reporte (HU-05, Sprint 2, PR-05)
- [x] T09 Unit tests Vitest (Transversal, Sprint 3, PR-06)
- [x] T10 Integration tests Supertest (Transversal, Sprint 3, PR-06)
- [x] T11 E2E Playwright (Transversal, Sprint 3, PR-06)
- [x] T12 Deploy y secretos (Transversal, Sprint 3, PR-07)
- [x] T13 Auth + autorizacion por recurso (HU-06, Sprint 4, PR-08)
- [x] T14 API hardening baseline (Transversal, Sprint 4, PR-09)
- [x] T15 Observabilidad backend (Transversal, Sprint 4, PR-10)
- [x] T16 Release safety con migraciones (Transversal, Sprint 4, PR-11)

## Sprint 4 (Self-serve SaaS readiness)
- Objetivo: habilitar base de seguridad, observabilidad y release safety para modo self-serve.
- Tareas: T13, T14, T15, T16.
- Riesgos principales: cambios transversales en backend y potencial ruptura de contratos API.

## Estado por sprint
### Sprint 1
- Objetivo: crear proyecto y cargar casos de uso de punta a punta.
- Tareas: T01, T02, T05, T06.

### Sprint 2
- Objetivo: generar estimacion completa y visualizar reporte.
- Tareas: T03, T04, T07, T08.

### Sprint 3
- Objetivo: cubrir calidad y dejar despliegue operativo.
- Tareas: T09, T10, T11, T12.

## Plantilla de update semanal
- Fecha: 2026-07-09
- Completado: T01 y T02 finalizados; T05 y T06 conectados end-to-end; T07 implementado con selector de roles y trigger de estimacion; T08 implementado con vista de reporte consolidada por proyecto; T03/T04 integrados con Azure OpenAI configurable por env y fallback heuristico seguro; T09/T10 reforzados con casos de fallo (validaciones y errores de dominio); T11 implementado con Playwright (happy path + failing path); T12 implementado con CI minimo, ejemplos de entorno y runbook de release/rollback.
- En progreso: refinamiento UX/UI con sidebar de administracion.
- Bloqueos: ninguno.
- Proximo foco: refinamiento UX/UI con sidebar de administracion.

## Nuevos tickets
- T13: Auth + autorizacion por recurso
	- Alcance: autenticacion en API, identificacion de usuario y validacion de ownership por proyecto.
	- Criterio de salida: endpoints de proyectos protegidos y acceso denegado para recursos de otro usuario.

- T14: API hardening baseline
	- Alcance: helmet, rate limiting, CORS restringido por entorno y politicas minimas de seguridad.
	- Criterio de salida: cabeceras de seguridad activas y limitacion de abuso en endpoints publicos.

- T15: Observabilidad backend
	- Alcance: logging estructurado con requestId, metricas basicas (latencia/errores) y alertas iniciales.
	- Criterio de salida: trazabilidad de requests y tablero minimo para errores 5xx/fallback IA.

- T16: Release safety con migraciones
	- Alcance: reemplazar estrategia de prisma db push en prod por migraciones versionadas + checklist de rollback.
	- Criterio de salida: pipeline y runbook alineados con deploy seguro y rollback verificable.
