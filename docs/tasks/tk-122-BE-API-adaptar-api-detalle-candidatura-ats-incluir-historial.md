# Ticket: TK-122

## Título
BE-API: Adaptar API Detalle Candidatura ATS para Incluir Historial

## Descripción
Modificar el endpoint de la API del backend ATS que devuelve los detalles de una candidatura (ej. `GET /api/v1/applications/{applicationId}`) para incluir la nueva sección/array `historial_aplicaciones` (generada por TK-121) en la respuesta JSON.

## User Story Relacionada
US-035: Consultar Historial de Aplicaciones Anteriores del Candidato

## Criterios de Aceptación Técnicos (Verificables)
1.  El endpoint `GET /api/v1/applications/{applicationId}` (o similar) existe y funciona.
2.  La estructura de la respuesta JSON ahora incluye un campo `historial_aplicaciones` (Array de objetos, puede ser vacío).
3.  Cada objeto en el array contiene al menos: `candidatura_id`, `titulo_vacante`, `fecha_aplicacion`, `estado_final`.
4.  El contenido de este array es proporcionado por la lógica de negocio (TK-121).

## Solución Técnica Propuesta (Opcional)
Modificar el DTO o la lógica de serialización de la respuesta del endpoint.

## Dependencias Técnicas (Directas)
* Endpoint API existente de detalle de candidatura.
* TK-121 (Lógica que proporciona los datos del historial).

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-035)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Modificación DTO/serializador respuesta API]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, application, detail, history

## Comentarios
Asegura que los datos del historial estén disponibles para el frontend.

## Enlaces o Referencias
[TK-001 - Especificación API]