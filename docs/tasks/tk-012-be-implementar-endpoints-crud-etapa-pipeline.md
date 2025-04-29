# Ticket: TK-012

## Título
BE: Implementar Endpoints API RESTful para CRUD de Etapas de Pipeline

## Descripción
Desarrollar y exponer los endpoints de la API interna v1 (según TK-001) necesarios para gestionar las etapas del pipeline desde el frontend. Incluir endpoints para: Listar Etapas (ordenadas), Crear Etapa, Actualizar Etapa (nombre, flag 'seleccionable_ia'), Actualizar Orden de Etapas, Eliminar Etapa. Asegurar protección por rol ADMIN.

## User Story Relacionada
US-002: Gestionar Etapas del Pipeline de Selección

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe `GET /api/v1/pipeline/stages` que devuelve la lista de todas las etapas ordenadas por el campo `orden`. Protegido (ADMIN).
2.  Existe `POST /api/v1/pipeline/stages` que acepta `{ nombre: "..." }` para crear una nueva etapa. Protegido (ADMIN). Llama a TK-013. Devuelve 201 con la etapa creada.
3.  Existe `PATCH /api/v1/pipeline/stages/{stageId}` que acepta `{ nombre: "...", seleccionable_ia: true/false }` para actualizar nombre y/o flag. Protegido (ADMIN). Llama a TK-013. Devuelve 200 con la etapa actualizada.
4.  Existe `PUT /api/v1/pipeline/stages/order` (o similar) que acepta un array de IDs de etapas en el nuevo orden deseado `[id1, id2, id3, ...]`. Protegido (ADMIN). Llama a TK-013 para actualizar el campo `orden` de todas las etapas. Devuelve 200 OK.
5.  Existe `DELETE /api/v1/pipeline/stages/{stageId}` para eliminar una etapa. Protegido (ADMIN). Llama a TK-013 (que valida si se puede borrar). Devuelve 204 No Content si éxito, 400/404/409 si error.

## Solución Técnica Propuesta (Opcional)
Seguir patrones RESTful. El endpoint de reordenamiento puede recibir la lista completa de IDs ordenados para simplificar.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación/Autorización)
* TK-013 (Lógica de Negocio Pipeline)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-002)

## Estimación Técnica Preliminar
[ 8 ] [horas] - [Creación de 5 endpoints, controladores, integración middleware, validación input básica]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, crud, pipeline, stage, reorder, authorization

## Comentarios
El endpoint de reordenamiento (`PUT /order`) requiere atención especial.

## Enlaces o Referencias
[TK-001 - Especificación API]