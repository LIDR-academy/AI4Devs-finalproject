# Ticket: TK-128

## Título
FE-Logic: Gestionar Estado de Selección Múltiple en Lista Candidatos

## Descripción
Implementar la lógica en el frontend para rastrear qué candidatos están seleccionados en la lista (TK-127). Mantener una lista de los IDs de las candidaturas seleccionadas y proporcionar esta lista a otros componentes/lógicas que la necesiten (como TK-127 para habilitar el botón y TK-130 para saber qué comparar).

## User Story Relacionada
US-036: Comparar Perfiles de Candidatos Lado a Lado

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un estado (local o en store) que almacena un array de los `candidaturaId` seleccionados.
2.  Al marcar/desmarcar un checkbox en la lista (TK-127), el ID correspondiente se añade/elimina de este array de estado.
3.  Se puede consultar el número de elementos seleccionados actualmente (para habilitar/deshabilitar botón en TK-127).
4.  La lista de IDs seleccionados está disponible para ser utilizada por la lógica de comparación (TK-130).

## Solución Técnica Propuesta (Opcional)
Usar el sistema de gestión de estado del framework (estado local de React, Vuex/Pinia, Redux, Zustand).

## Dependencias Técnicas (Directas)
* TK-127 (UI que modifica este estado)
* TK-130 (Lógica que lee este estado)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-036)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Implementación manejo de estado para selección múltiple]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, state-management, selection, list

## Comentarios
Lógica de estado fundamental para la selección múltiple.

## Enlaces o Referencias
[Documentación sobre gestión de estado del framework]