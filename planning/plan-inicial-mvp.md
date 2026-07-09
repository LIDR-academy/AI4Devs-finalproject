# Planificacion inicial MVP - ProjectScope AI

## Objetivo
Entregar el flujo E2E completo del MVP:
Crear proyecto -> agregar casos de uso -> seleccionar roles -> estimar -> visualizar reporte.

## Sprint 1 (Base funcional)
- T01: Modelo de datos y migraciones Prisma
- T02: Endpoints de proyectos
- T05: Formulario de proyecto
- T06: Formulario de casos de uso

Criterio de salida:
- Se puede crear proyecto y persistir casos de uso de punta a punta.

## Sprint 2 (Motor de estimacion y valor principal)
- T03: Endpoint de estimacion con Azure OpenAI
- T04: Prompt estructurado y parseo confiable de respuesta
- T07: Seleccion de roles e inicio de estimacion
- T08: Reporte con roadmap, horas, tokens y costo

Criterio de salida:
- Usuario ejecuta una estimacion y obtiene reporte completo.

## Sprint 3 (Calidad y despliegue)
- T09: Unit tests
- T10: Integration tests
- T11: E2E principal
- T12: Deploy y variables de entorno

Criterio de salida:
- Flujo principal cubierto por pruebas y desplegado en entorno publico.

## Definicion de hecho (DoD)
- Feature conectada al flujo E2E
- Manejo de errores visible para usuario
- Pruebas minimas del caso feliz y un caso de fallo
- Documentacion basica actualizada

## Politica del tablero Kanban
- Columnas: Backlog, In Progress, Review, Done
- WIP sugerido en In Progress: maximo 3 tareas
- Cada tarjeta debe incluir: Ticket, HU asociada, PR objetivo y riesgo principal
