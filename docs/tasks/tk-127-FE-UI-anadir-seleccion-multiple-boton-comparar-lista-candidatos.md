# Ticket: TK-127

## Título
FE-UI: Añadir Selección Múltiple y Botón Comparar a Lista Candidatos

## Descripción
Modificar el componente UI de la lista/tabla de candidatos (TK-087) para permitir la selección múltiple de filas (ej. mediante checkboxes) y añadir un botón "Comparar Seleccionados" que se habilite cuando 2 o más candidatos estén seleccionados.

## User Story Relacionada
US-036: Comparar Perfiles de Candidatos Lado a Lado

## Criterios de Aceptación Técnicos (Verificables)
1.  Cada fila en la tabla/lista de candidatos (TK-087) tiene un checkbox (o mecanismo similar) para selección.
2.  Existe un botón "Comparar Seleccionados" visible (ej. encima de la tabla).
3.  El botón "Comparar Seleccionados" está deshabilitado si se seleccionan 0 o 1 candidatos.
4.  El botón "Comparar Seleccionados" está habilitado si se seleccionan 2 o más candidatos.
5.  Al hacer clic en el botón habilitado, se invoca la lógica de comparación (TK-130).

## Solución Técnica Propuesta (Opcional)
Añadir una columna de checkboxes. Usar estado local/store para gestionar la selección y habilitar/deshabilitar el botón.

## Dependencias Técnicas (Directas)
* TK-087 (Componente UI de la lista/tabla a modificar)
* TK-128 (Lógica que gestiona el estado de selección)
* TK-130 (Lógica que se invoca al comparar)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-036)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Añadir checkboxes, botón condicional, estilos UI]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, table, list, selection, checkbox, button, compare

## Comentarios
Prepara la UI para la acción de comparar.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]