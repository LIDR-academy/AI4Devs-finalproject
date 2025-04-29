# Ticket: TK-014

## Título
FE: Crear Interfaz de Usuario para Gestión de Etapas de Pipeline

## Descripción
Desarrollar los componentes de UI en el frontend del ATS MVP para que los Administradores gestionen las etapas del pipeline. Incluir una vista de lista que permita reordenar (drag-and-drop preferiblemente) y un formulario (modal o en línea) para crear/editar etapas (campos: Nombre, Checkbox "Seleccionable para IA").

## User Story Relacionada
US-002: Gestionar Etapas del Pipeline de Selección

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una ruta/página accesible desde el menú de administración para "Configuración del Pipeline".
2.  La página muestra una lista ordenada de las etapas actuales obtenidas de la API (TK-012). Cada item muestra el Nombre y el estado del flag "Seleccionable para IA".
3.  La lista permite reordenar las etapas visualmente (ej. drag-and-drop) y persiste el nuevo orden llamando a la API (TK-012).
4.  Existe un botón/formulario para "Añadir Nueva Etapa" que permite introducir un nombre.
5.  Se puede editar el nombre de una etapa existente (ej. haciendo clic en él).
6.  Se puede marcar/desmarcar el checkbox "Seleccionable para IA" para cada etapa.
7.  Existe un botón/icono para "Eliminar" una etapa (con confirmación).
8.  Las acciones de añadir, editar, marcar y eliminar llaman a la lógica correspondiente (TK-015).

## Solución Técnica Propuesta (Opcional)
Usar framework frontend. Para drag-and-drop, usar librerías como `react-beautiful-dnd`, `Vue.Draggable`, etc.

## Dependencias Técnicas (Directas)
* TK-015 (Lógica Frontend para llamar a APIs)
* Diseño de UI/Mockups para la gestión de etapas.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-002)

## Estimación Técnica Preliminar
[ 8 ] [horas] - [Desarrollo componente lista, implementación drag-and-drop, componente formulario, integración lógica]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, pipeline, stage, configuration, crud, reorder, drag-and-drop

## Comentarios
La implementación del drag-and-drop puede llevar tiempo dependiendo de la librería.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI, Documentación librería drag-and-drop]