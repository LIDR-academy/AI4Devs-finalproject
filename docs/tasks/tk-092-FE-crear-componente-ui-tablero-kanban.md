# Ticket: TK-092

## Título
FE: Crear/Integrar Componente UI Tablero Kanban

## Descripción
Implementar o integrar un componente reutilizable en el frontend que represente un tablero Kanban genérico. Debe ser capaz de renderizar columnas y tarjetas, y soportar (o estar preparado para) funcionalidad de drag-and-drop entre columnas.

## User Story Relacionada
US-030: Visualizar Pipeline de Selección en Tablero Kanban (y US-031 para drag-drop)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un componente UI (ej. `KanbanBoard`) que acepta como props la definición de columnas y los datos de las tarjetas agrupadas por columna.
2.  Renderiza visualmente las columnas con sus títulos.
3.  Renderiza las tarjetas dentro de sus columnas correspondientes.
4.  La estructura es flexible para permitir contenido personalizado en las tarjetas (definido en TK-095).
5.  Está preparado para integrar funcionalidad de drag-and-drop (ej. usando una librería como `react-beautiful-dnd`, `Vue.Draggable`). La implementación del *efecto* del drag-and-drop se hará en US-031.
6.  El layout es responsive (al menos funcional en escritorio).

## Solución Técnica Propuesta (Opcional)
Integrar una librería Kanban/drag-and-drop existente y bien mantenida para el framework frontend elegido. Configurar para que funcione con la estructura de datos esperada.

## Dependencias Técnicas (Directas)
* Framework Frontend y librerías UI.
* TK-094 (Lógica que usa este componente).
* TK-095 (Define el contenido de las tarjetas).
* (Para futuro) Librería de Drag-and-Drop.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-030)

## Estimación Técnica Preliminar
[ 8 ] [horas] - [Investigación/Selección librería Kanban/DnD, integración básica, estructura props, layout]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, kanban, board, drag-and-drop

## Comentarios
La elección de la librería puede impactar la complejidad. Enfocarse en renderizado correcto para US-030; la interacción drag-drop se completa en US-031.

## Enlaces o Referencias
[Documentación librería Kanban/DnD elegida]