# Ticket: TK-115

## Título
BE-API: (Opcional) Adaptar API Listar Candidaturas para Soportar Filtrado por Rango de Score

## Descripción
**(Funcionalidad Opcional)** Modificar el endpoint `GET /api/v1/jobs/{jobId}/applications` (TK-085) para aceptar parámetros de query opcionales que especifiquen un rango de score IA (ej. `score_min`, `score_max`).

## User Story Relacionada
US-034: Ordenar y Filtrar Lista de Candidatos por Score IA

## Criterios de Aceptación Técnicos (Verificables)
1.  El endpoint acepta opcionalmente `score_min` (numérico).
2.  El endpoint acepta opcionalmente `score_max` (numérico).
3.  Valida que los valores sean numéricos y lógicos (min <= max si ambos presentes).
4.  Pasa los parámetros validados a la lógica de negocio (TK-116).

## Solución Técnica Propuesta (Opcional)
Añadir manejo de query parameters adicionales.

## Dependencias Técnicas (Directas)
* TK-085 (Endpoint API existente)
* TK-116 (Lógica de Negocio que aplica el filtrado)

## Prioridad (Heredada/Ajustada)
Should Have (pero parte opcional de US-034)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Añadir parsing y validación de query parameters de filtro]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, application, list, filter, score, query-param

## Comentarios
Extensión opcional de la API.

## Enlaces o Referencias
[TK-001 - Especificación API]