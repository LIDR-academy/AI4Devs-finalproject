# Local Kanban - ProjectScope AI

Este tablero se gestiona en el repositorio (sin Jira/Notion).

## Reglas
- Actualizar estado de cada tarea moviendola entre columnas.
- Mantener maximo 3 tareas en In Progress.
- Cada tarea debe incluir Ticket, HU, Sprint y PR objetivo.

## Backlog
- [ ] T12 Deploy y secretos (Transversal, Sprint 3, PR-07)

## In Progress
- [ ] (vacío)

## Review
- [ ] T05 Formulario de proyecto (HU-01, Sprint 1, PR-04)
- [ ] T06 Formulario de casos de uso (HU-02, Sprint 1, PR-04)
- [ ] T07 Seleccion de roles (HU-03, Sprint 2, PR-04)
- [ ] T08 Vista de reporte (HU-05, Sprint 2, PR-05)
- [ ] T03 Endpoint de estimacion con Azure OpenAI (HU-04, Sprint 2, PR-03)
- [ ] T04 Prompt estructurado (HU-04, Sprint 2, PR-03)
- [ ] T09 Unit tests Vitest (Transversal, Sprint 3, PR-06)
- [ ] T10 Integration tests Supertest (Transversal, Sprint 3, PR-06)

## Done
- [x] T01 Definir schema Prisma (HU-01, Sprint 1, PR-01)
- [x] T02 Implementar API de proyectos (HU-01, Sprint 1, PR-02)
- [x] T11 E2E Playwright (Transversal, Sprint 3, PR-06)

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
- Fecha: 2026-07-21
- Completado: T01 y T02 finalizados; T05 y T06 conectados end-to-end; T07 implementado con selector de roles y trigger de estimacion; T08 implementado con vista de reporte consolidada por proyecto; T03/T04 integrados con Azure OpenAI configurable por env y fallback heuristico seguro; T09/T10 implementados con Vitest + Supertest y tests frontend iniciales con Testing Library; estabilizacion backend en rama v1.0-final-GV (env de auth, versionado de estimaciones, bootstrap de roles y compatibilidad Prisma local); T11 validado con Playwright (2/2) sobre base local.
- En progreso: preparar T12 deploy y secretos.
- Bloqueos: ninguno.
- Proximo foco: cerrar evidencia de despliegue publico y checklist de secretos (T12).
