# Ticket: TK-114

## Título
FE-Logic: Implementar Lógica Frontend para Ordenar por Score IA

## Descripción
Desarrollar la lógica en el frontend para manejar la acción de ordenar la lista de candidatos por Score IA. Debe mantener el estado de ordenación actual (campo y dirección), y al recibir el evento de clic desde la UI (TK-113), debe actualizar el estado y realizar una nueva llamada a la API (TK-088) con los parámetros de ordenación correctos.

## User Story Relacionada
US-034: Ordenar y Filtrar Lista de Candidatos por Score IA

## Criterios de Aceptación Técnicos (Verificables)
1.  El estado del componente/store mantiene la configuración actual de ordenación (ej. `sortBy: 'score'`, `sortOrder: 'desc'`).
2.  Se implementa una función (ej. `handleSortByScore()`) que es llamada por TK-113.
3.  La función actualiza el estado de `sortOrder` (ej. cambia entre 'asc' y 'desc', o cicla null -> desc -> asc). Establece `sortBy` a 'score'.
4.  Realiza una nueva llamada a la API de listado (TK-088) pasando los nuevos `sortBy` y `sortOrder` como parámetros.
5.  La lista de candidaturas en la UI (TK-087) se actualiza con los nuevos datos ordenados recibidos de la API.

## Solución Técnica Propuesta (Opcional)
Manejar el estado de ordenación en el store/componente padre de la tabla. La función de manejo de clic actualizará este estado y disparará la recarga de datos.

## Dependencias Técnicas (Directas)
* TK-113 (UI que dispara la acción)
* TK-088 (Lógica API que necesita ser llamada con nuevos parámetros)

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-034)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Manejo de estado de ordenación, lógica de actualización de estado, integración llamada API]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, state-management, sort, api-client, table

## Comentarios
Coordina la interacción UI con la llamada API para reordenar.

## Enlaces o Referencias
[TK-001 - Especificación API]