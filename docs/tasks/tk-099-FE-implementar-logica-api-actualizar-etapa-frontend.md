# Ticket: TK-099

## Título
FE: Implementar Lógica API para Actualizar Etapa desde Frontend

## Descripción
Crear o reutilizar la lógica en el frontend (servicio/store) para realizar la llamada `PATCH` al endpoint de actualización de etapa del backend (`/api/v1/applications/{applicationId}/stage`, TK-096). Debe enviar el `applicationId` y el `new_stage_id`, manejar la respuesta (éxito/error) y proporcionar feedback a la UI que la invocó (TK-098 o TK-100).

## User Story Relacionada
US-031: Mover Candidato entre Etapas del Pipeline

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función (ej. `updateApplicationStage(applicationId, newStageId)`) en un servicio o store.
2.  La función realiza una llamada `PATCH` a `/api/v1/applications/{applicationId}/stage`.
3.  La llamada incluye el `new_stage_id` en el cuerpo JSON.
4.  La llamada incluye el token de autenticación.
5.  Maneja el estado de carga (inicio/fin).
6.  Devuelve una promesa que se resuelve con éxito (ej. con datos actualizados si la API los devuelve) o se rechaza con el error si la API falla.
7.  Los componentes UI (TK-098, TK-100) pueden usar esta función y actuar según el resultado de la promesa.

## Solución Técnica Propuesta (Opcional)
Añadir un método al servicio API existente o al store que maneja el estado de las candidaturas.

## Dependencias Técnicas (Directas)
* TK-096 (Endpoint Backend API)
* Mecanismo de autenticación frontend (TK-002).
* TK-098 (Invocador desde Kanban)
* TK-100 (Invocador desde Detalle)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-031)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Implementación llamada API PATCH específica, manejo básico promesa/respuesta]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, application, stage, update

## Comentarios
Lógica API reutilizable para ambos métodos de cambio de etapa (Kanban y Detalle).

## Enlaces o Referencias
[TK-001 - Especificación API]