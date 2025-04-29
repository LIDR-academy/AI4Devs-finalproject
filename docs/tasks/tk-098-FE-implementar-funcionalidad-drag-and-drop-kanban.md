# Ticket: TK-098

## Título
FE: Implementar Funcionalidad Drag-and-Drop en Kanban

## Descripción
Integrar la funcionalidad de drag-and-drop (arrastrar y soltar) en el componente Tablero Kanban (TK-092). Al soltar una tarjeta de candidato en una columna diferente, se debe identificar la candidatura movida y la nueva etapa de destino, e invocar la lógica de API (TK-099) para persistir el cambio.

## User Story Relacionada
US-031: Mover Candidato entre Etapas del Pipeline

## Criterios de Aceptación Técnicos (Verificables)
1.  El componente Kanban (TK-092) utiliza una librería de drag-and-drop configurada.
2.  Se puede arrastrar una tarjeta de candidato (`KanbanCard`).
3.  Al soltar una tarjeta sobre una columna diferente, se dispara un evento (ej. `onDragEnd`).
4.  El manejador del evento identifica: el `candidaturaId` de la tarjeta arrastrada y el `stageId` de la columna destino.
5.  Invoca a la lógica de API (TK-099) pasando `candidaturaId` y `newStageId`.
6.  (Opcional - Optimistic UI) Se puede mover visualmente la tarjeta a la nueva columna inmediatamente, y revertir si la llamada API falla. O esperar a la confirmación de la API para moverla. *Decisión MVP: Esperar confirmación API es más simple.*
7.  Si la llamada API (TK-099) es exitosa, la tarjeta permanece visualmente en la nueva columna y el estado local se actualiza.
8.  Si la llamada API falla, la tarjeta vuelve visualmente a su columna original y se muestra un error.

## Solución Técnica Propuesta (Opcional)
Utilizar la API de la librería de drag-and-drop elegida en TK-092 (ej. `onDragEnd` de `react-beautiful-dnd`) para obtener la información necesaria y disparar la llamada de actualización.

## Dependencias Técnicas (Directas)
* TK-092 (Componente Kanban base y librería DnD)
* TK-099 (Lógica Frontend API para actualizar etapa)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-031)

## Estimación Técnica Preliminar
[ 6 ] [horas] - [Configuración eventos DnD, lógica para obtener IDs, integración llamada API, manejo UI optimista/pesimista]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, kanban, drag-and-drop, interaction, api-client

## Comentarios
La implementación exacta depende de la librería DnD. El manejo del estado visual durante/después del drag es clave.

## Enlaces o Referencias
[Documentación librería Drag-and-Drop elegida]