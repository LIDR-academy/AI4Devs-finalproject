# Ticket: TK-088

## Título
FE: Implementar Lógica Frontend para API Listar Candidaturas

## Descripción
Desarrollar la lógica en el frontend (servicios, stores) para llamar al endpoint de la API del backend (`GET /api/v1/jobs/{jobId}/applications`, TK-085). Debe manejar los parámetros de paginación, la respuesta (lista de candidaturas, metadatos de paginación), el estado de carga y los errores, proporcionando los datos al componente UI (TK-087).

## User Story Relacionada
US-029: Visualizar Lista de Candidatos por Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función para llamar a `GET /api/v1/jobs/{jobId}/applications` pasando el `jobId` y los parámetros de paginación (`page`, `pageSize`).
2.  La llamada incluye el token de autenticación.
3.  Se maneja el estado de carga (ej. `isLoading`).
4.  Si la respuesta es 200 OK:
    * Se extrae la lista de candidaturas para la página actual.
    * Se extraen los metadatos de paginación (totalItems, totalPages, currentPage).
    * Estos datos se almacenan en el estado local o store para que TK-087 los consuma.
5.  La lógica permite cambiar de página (ej. al hacer clic en los controles de paginación de TK-087), realizando una nueva llamada API con los parámetros de página actualizados.
6.  Si la llamada API falla (401, 403, 404, 500), se maneja el error (ej. actualizando estado `error`, mostrando mensaje).

## Solución Técnica Propuesta (Opcional)
Usar servicios/stores y librería HTTP (axios/fetch). Mantener el estado de la lista, la paginación actual y el estado de carga/error.

## Dependencias Técnicas (Directas)
* TK-085 (Endpoint Backend API)
* TK-087 (Componente UI que consume los datos e invoca cambios de página)
* Mecanismo de autenticación frontend (TK-002).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-029)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación llamada API, manejo estado lista y paginación, manejo carga/errores]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, application, list, pagination

## Comentarios
Lógica estándar para obtener datos paginados.

## Enlaces o Referencias
[TK-001 - Especificación API]