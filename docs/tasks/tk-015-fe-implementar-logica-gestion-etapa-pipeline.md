# Ticket: TK-015

## Título
FE: Implementar Lógica Frontend para API de Gestión de Etapas Pipeline

## Descripción
Desarrollar la lógica en el frontend (servicios, stores) para interactuar con los endpoints de la API de gestión de etapas del backend (TK-012). Incluye llamadas para listar, crear, actualizar (nombre, flag, orden) y eliminar etapas, manejando respuestas y actualizando la UI.

## User Story Relacionada
US-002: Gestionar Etapas del Pipeline de Selección

## Criterios de Aceptación Técnicos (Verificables)
1.  Al cargar la página de gestión de etapas (TK-014), se llama a `GET /api/v1/pipeline/stages` y la lista se puebla/ordena con la respuesta.
2.  Al crear una etapa, se llama a `POST /api/v1/pipeline/stages`. Si éxito, se refresca la lista. Si error, se muestra mensaje.
3.  Al editar nombre o flag, se llama a `PATCH /api/v1/pipeline/stages/{stageId}`. Si éxito, se actualiza la UI. Si error, se muestra mensaje.
4.  Al finalizar una operación de reordenamiento (drag-and-drop en TK-014), se construye el array de IDs ordenados y se llama a `PUT /api/v1/pipeline/stages/order`. Si éxito, se confirma el orden en UI. Si error, se revierte/muestra mensaje.
5.  Al eliminar una etapa, se llama a `DELETE /api/v1/pipeline/stages/{stageId}`. Si éxito (204), se elimina de la lista en UI. Si error (400, 409), se muestra mensaje.
6.  Se manejan estados de carga y errores adecuadamente.
7.  Se envía el token/credencial de autenticación en las llamadas.

## Solución Técnica Propuesta (Opcional)
Usar servicios/stores y librería HTTP (axios/fetch).

## Dependencias Técnicas (Directas)
* TK-012 (Endpoints Backend API)
* TK-014 (Componentes UI que invocan esta lógica)
* Mecanismo de autenticación frontend (TK-002) para enviar token.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-002)

## Estimación Técnica Preliminar
[ 6 ] [horas] - [Implementación llamadas API CRUD + Reorder, manejo estado lista, integración con UI (drag-drop), manejo errores]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, pipeline, stage

## Comentarios
La lógica de reordenamiento requiere manejar el estado de la lista y enviar la secuencia correcta a la API.

## Enlaces o Referencias
[TK-001 - Especificación API]