# Ticket: TK-096

## Título
BE: Implementar Endpoint API Actualizar Etapa Candidatura (`PATCH /api/v1/applications/{applicationId}/stage`)

## Descripción
Crear y exponer un endpoint específico `PATCH /api/v1/applications/{applicationId}/stage` en el backend del ATS MVP. Este endpoint recibirá el ID de la nueva etapa a la que se quiere mover la candidatura. Debe validar la solicitud e invocar la lógica de negocio correspondiente (TK-097). Protegido por autenticación.

## User Story Relacionada
US-031: Mover Candidato entre Etapas del Pipeline

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `PATCH /api/v1/applications/{applicationId}/stage`.
2.  Acepta el `applicationId` en la ruta y un cuerpo JSON con `{ "new_stage_id": "..." }`.
3.  El endpoint está protegido por el middleware de autenticación (TK-005).
4.  Valida que `applicationId` y `new_stage_id` sean UUIDs válidos y no nulos. Devuelve 400 si falla.
5.  Invoca la lógica de negocio (TK-097) pasando `applicationId`, `new_stage_id` y el ID del usuario autenticado (para el historial).
6.  Si la lógica de negocio es exitosa, devuelve 200 OK con la representación actualizada de la candidatura (o solo confirmación 204).
7.  Si la candidatura o la etapa no existen, la lógica devuelve error y el endpoint retorna 404 Not Found.
8.  Si la transición no es válida o hay otro error, devuelve el código apropiado (400, 409, 500).

## Solución Técnica Propuesta (Opcional)
Usar PATCH es adecuado para actualizar un aspecto específico (la etapa) del recurso Candidatura.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación)
* TK-097 (Lógica de Negocio Actualización Etapa)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-031)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Creación ruta/controlador específico, integración middleware, validación input]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, application, stage, update, patch

## Comentarios
Endpoint central para la interacción de cambio de etapa.

## Enlaces o Referencias
[TK-001 - Especificación API]