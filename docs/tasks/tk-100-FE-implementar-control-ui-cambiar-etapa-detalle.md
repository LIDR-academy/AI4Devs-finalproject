# Ticket: TK-100

## Título
FE: Implementar Control UI para Cambiar Etapa en Vista Detalle

## Descripción
Añadir un control interactivo (ej. un dropdown/selector) en la vista de detalle de la candidatura que muestre la etapa actual y permita al usuario seleccionar una nueva etapa de la lista de etapas disponibles. Al confirmar la selección, debe invocar la lógica API (TK-099) para persistir el cambio.

## User Story Relacionada
US-031: Mover Candidato entre Etapas del Pipeline

## Criterios de Aceptación Técnicos (Verificables)
1.  En la vista de detalle de una candidatura, existe un control (ej. Dropdown) etiquetado como "Etapa Actual".
2.  El control muestra inicialmente el nombre de la etapa actual de la candidatura.
3.  Al hacer clic/abrir el control, se muestra una lista de todas las etapas válidas del pipeline (obtenidas de TK-015).
4.  El usuario puede seleccionar una nueva etapa de la lista.
5.  Al seleccionar una nueva etapa diferente a la actual, se confirma la acción (ej. con un botón "Guardar Etapa" o automáticamente al seleccionar).
6.  Tras la confirmación, se invoca la lógica API (TK-099) pasando el `applicationId` y el `newStageId` seleccionado.
7.  Si la llamada API es exitosa, el control se actualiza para mostrar la nueva etapa como la actual y se muestra un mensaje de éxito.
8.  Si la llamada API falla, se muestra un mensaje de error y el control vuelve a mostrar la etapa original.

## Solución Técnica Propuesta (Opcional)
Usar un componente Select/Dropdown del framework UI. Poblar con las etapas obtenidas del estado/store (TK-015).

## Dependencias Técnicas (Directas)
* Vista de Detalle de Candidatura (requiere ticket si no existe formalmente).
* TK-015 (Lógica Frontend para obtener lista de etapas).
* TK-099 (Lógica Frontend API para actualizar etapa).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-031)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Añadir componente dropdown a UI, poblar opciones, manejar selección y confirmación, integrar llamada API]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, detail, application, stage, update, select

## Comentarios
Proporciona la segunda forma (además del Kanban) de cambiar la etapa.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]