# Ticket: TK-039

## Título
FE: Implementar Lógica Frontend para API de Listado de Vacantes Públicas

## Descripción
Desarrollar la lógica en el frontend para llamar al endpoint público de la API del backend (`GET /api/v1/jobs?status=PUBLISHED`, TK-036) al cargar la página del portal (TK-038), manejar la respuesta (lista de vacantes) y proporcionar los datos al componente UI para su renderizado.

## User Story Relacionada
US-009: Visualizar Lista de Vacantes Públicas

## Criterios de Aceptación Técnicos (Verificables)
1.  Al montar/cargar el componente del portal público (TK-038), se realiza una llamada GET a `/api/v1/jobs?status=PUBLISHED` (o endpoint público definido).
2.  La llamada NO incluye token de autenticación.
3.  Se maneja el estado de carga durante la llamada API.
4.  Si la respuesta es 200 OK con un array de vacantes, los datos (id, titulo, ubicacion) se almacenan en el estado local del componente o en un store.
5.  Si la respuesta es un array vacío, se maneja este estado para mostrar el mensaje correspondiente en la UI.
6.  Si la llamada API falla, se maneja el error (ej. mostrando un mensaje genérico de error en el portal).

## Solución Técnica Propuesta (Opcional)
Usar servicios/stores y librería HTTP (axios/fetch). Implementar en el hook de carga del componente (ej. `useEffect`, `mounted`).

## Dependencias Técnicas (Directas)
* TK-036 (Endpoint Backend API)
* TK-038 (Componente UI que invoca esta lógica)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-009)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Implementación llamada API, manejo estado, integración con UI, manejo errores]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, vacancy, job, public, list

## Comentarios
Lógica estándar de obtención y muestra de datos.

## Enlaces o Referencias
[TK-001 - Especificación API]