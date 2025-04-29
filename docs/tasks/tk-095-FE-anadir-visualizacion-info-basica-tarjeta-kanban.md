# Ticket: TK-095

## Título
FE: Añadir Visualización Info Básica (Nombre, Score, Sugerencia) a Tarjeta Kanban

## Descripción
Desarrollar o modificar el componente que representa una tarjeta de candidato (`KanbanCard`) dentro del tablero Kanban (TK-092). Debe mostrar la información mínima requerida: Nombre del candidato, Score IA (si existe, de US-027), y Etapa Sugerida IA (si existe, de US-028).

## User Story Relacionada
US-030: Visualizar Pipeline de Selección en Tablero Kanban

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un componente `KanbanCard` que recibe los datos de una candidatura (nombre, score, etapa_sugerida) como props.
2.  El componente renderiza el `nombreCompletoCandidato`.
3.  Si `puntuacion_ia_general` está presente y no es null, muestra el score (ej. "Score: 85").
4.  Si `etapa_sugerida` está presente y no es null, muestra la etapa sugerida (ej. "Sugerencia: Entrevista").
5.  La información se presenta de forma concisa y clara dentro de los límites de la tarjeta.
6.  La tarjeta completa es clickeable para navegar al detalle (implementado en TK-089, pero el evento debe asociarse aquí).

## Solución Técnica Propuesta (Opcional)
Componente simple que recibe props y renderiza texto/badges.

## Dependencias Técnicas (Directas)
* TK-094 (Renderiza estas tarjetas)
* Datos proporcionados por TK-093.
* (Opcional) Lógica de navegación de TK-089.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-030)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Desarrollo componente tarjeta, renderizado condicional de datos IA]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, kanban, card, application, display

## Comentarios
Define el contenido visual de cada elemento en el Kanban.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI para las tarjetas]