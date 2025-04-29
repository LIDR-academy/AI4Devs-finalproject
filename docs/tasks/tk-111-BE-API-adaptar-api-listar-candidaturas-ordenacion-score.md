# Ticket: TK-111

## Título
BE-API: Adaptar API Listar Candidaturas para Soportar Ordenación por Score

## Descripción
Modificar el endpoint `GET /api/v1/jobs/{jobId}/applications` (TK-085) para aceptar parámetros de query opcionales que especifiquen el campo de ordenación (`sortBy`) y la dirección (`sortOrder`, ej. 'asc'/'desc'). Inicialmente, soportar `sortBy=score`.

## User Story Relacionada
US-034: Ordenar y Filtrar Lista de Candidatos por Score IA

## Criterios de Aceptación Técnicos (Verificables)
1.  El endpoint `GET /api/v1/jobs/{jobId}/applications` acepta opcionalmente `sortBy=score`.
2.  El endpoint acepta opcionalmente `sortOrder=asc` o `sortOrder=desc`.
3.  Si se proporcionan, estos parámetros se validan y se pasan a la lógica de negocio (TK-112).
4.  Si no se proporcionan, se usa un orden por defecto (ej. `fecha_aplicacion desc`).

## Solución Técnica Propuesta (Opcional)
Añadir manejo de query parameters en el controlador/router.

## Dependencias Técnicas (Directas)
* TK-085 (Endpoint API existente)
* TK-112 (Lógica de Negocio que aplica la ordenación)

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-034)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Añadir parsing y validación de query parameters]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, application, list, sort, query-param

## Comentarios
Define cómo el frontend solicita la ordenación.

## Enlaces o Referencias
[TK-001 - Especificación API]