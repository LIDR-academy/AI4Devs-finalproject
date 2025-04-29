# Ticket: TK-025

## Título
FE: Implementar Lógica Frontend para API de Obtención y Actualización de Vacante

## Descripción
Desarrollar la lógica en el frontend para: 1) Obtener los datos de una vacante específica llamando a la API del backend (`GET /api/v1/jobs/{jobId}`, TK-021) al cargar el formulario de edición (TK-024). 2) Enviar los datos modificados del formulario a la API del backend (`PATCH /api/v1/jobs/{jobId}`, TK-022) al guardar los cambios. Manejar respuestas y errores.

## User Story Relacionada
US-006: Editar Información de Vacante Existente

## Criterios de Aceptación Técnicos (Verificables)
1.  Al cargar el componente/página de edición (TK-024), se extrae el `jobId` de la ruta y se realiza una llamada GET a `/api/v1/jobs/{jobId}`.
2.  Si la respuesta GET es 200 OK, los datos recibidos se usan para poblar el estado del formulario.
3.  Si la respuesta GET es 404, se muestra un mensaje de "Vacante no encontrada" o se redirige.
4.  Al hacer clic en "Guardar Cambios" en el formulario (TK-024), se recopilan los datos modificados.
5.  Se realiza una llamada PATCH a `/api/v1/jobs/{jobId}` con los datos modificados en el cuerpo JSON y el token de autenticación.
6.  Se muestra un indicador de carga durante la llamada PATCH.
7.  Si la respuesta PATCH es 200 OK, se muestra un mensaje de éxito y/o se redirige a la vista de detalle de la vacante.
8.  Si la respuesta PATCH es un error (400, 404, 500), se muestra un mensaje de error específico al usuario en el formulario.

## Solución Técnica Propuesta (Opcional)
Usar servicios/stores y librería HTTP (axios/fetch). Manejar estado del formulario y carga/error.

## Dependencias Técnicas (Directas)
* TK-021 (Endpoint Backend API GET)
* TK-022 (Endpoint Backend API PATCH)
* TK-024 (Formulario UI que invoca esta lógica)
* Mecanismo de autenticación frontend (TK-002) para enviar token.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-006)

## Estimación Técnica Preliminar
[ 5 ] [horas] - [Implementación llamadas API GET y PATCH, manejo estado formulario, carga/respuesta/errores]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, vacancy, job, edit, update

## Comentarios
Buena gestión de errores es importante (ej. qué pasa si la vacante fue eliminada mientras se editaba).

## Enlaces o Referencias
[TK-001/Anexo I - Especificación API]