# Ticket: TK-118

## Título
FE-Logic: (Opcional) Implementar Lógica Frontend para Filtrar por Rango de Score IA

## Descripción
**(Funcionalidad Opcional)** Desarrollar la lógica en el frontend para manejar la acción de filtrar por Score IA. Debe mantener el estado de filtro actual (min/max), y al aplicar desde la UI (TK-117), debe realizar una nueva llamada a la API (TK-088) con los parámetros de filtro correctos.

## User Story Relacionada
US-034: Ordenar y Filtrar Lista de Candidatos por Score IA

## Criterios de Aceptación Técnicos (Verificables)
1.  El estado del componente/store mantiene los valores actuales de `score_min` y `score_max`.
2.  Se implementa una función (ej. `applyScoreFilter()`) que es llamada por TK-117.
3.  La función actualiza el estado de los filtros.
4.  Realiza una nueva llamada a la API de listado (TK-088) pasando los nuevos `score_min` y `score_max` como parámetros.
5.  La lista de candidaturas en la UI (TK-087) se actualiza con los nuevos datos filtrados.

## Solución Técnica Propuesta (Opcional)
Manejar estado de filtro y disparar recarga de datos al aplicar.

## Dependencias Técnicas (Directas)
* TK-117 (UI que dispara la acción)
* TK-088 (Lógica API que necesita ser llamada con nuevos parámetros)

## Prioridad (Heredada/Ajustada)
Should Have (pero parte opcional de US-034)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Manejo de estado de filtro, integración llamada API]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, state-management, filter, score, api-client, table

## Comentarios
Extensión opcional de la lógica frontend.

## Enlaces o Referencias
[TK-001 - Especificación API]