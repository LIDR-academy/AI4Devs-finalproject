# Ticket: TK-090

## Título
BE: Adaptar/Crear Endpoint API para Datos Kanban (`GET /api/v1/jobs/{jobId}/applications/kanban`)

## Descripción
Adaptar el endpoint existente o crear uno nuevo (`GET /api/v1/jobs/{jobId}/applications/kanban` o similar) que devuelva los datos de las candidaturas para una vacante específica, agrupados por el ID de su etapa actual. Esto facilita la construcción de la vista Kanban en el frontend. Protegido por autenticación.

## User Story Relacionada
US-030: Visualizar Pipeline de Selección en Tablero Kanban

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint (ej. `GET /api/v1/jobs/{jobId}/applications/kanban`).
2.  El endpoint está protegido por el middleware de autenticación (TK-005).
3.  Valida que el `jobId` exista. Devuelve 404 si no.
4.  Invoca la lógica de negocio (TK-091) para obtener las candidaturas agrupadas por etapa.
5.  Devuelve 200 OK con una estructura JSON que represente los datos agrupados (ej. un objeto donde las claves son los IDs de etapa y los valores son arrays de objetos de candidatura simplificados: `{ "stageId1": [{cardData1}, {cardData2}], "stageId2": [...] }`).
6.  Cada objeto de candidatura (`cardData`) incluye al menos `candidaturaId`, `nombreCompletoCandidato`, `puntuacion_ia_general` (nullable), `etapa_sugerida` (nullable).
7.  Maneja errores de la lógica de negocio (400, 500).

## Solución Técnica Propuesta (Opcional)
Un endpoint específico `/kanban` es más claro. La lógica de negocio (TK-091) hará la agrupación.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación)
* TK-091 (Lógica de Negocio Kanban)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-030)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Creación ruta/controlador, integración middleware, formato respuesta específico]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, kanban, application, list, group, vacancy, job

## Comentarios
Endpoint especializado para la vista Kanban.

## Enlaces o Referencias
[TK-001 - Especificación API]