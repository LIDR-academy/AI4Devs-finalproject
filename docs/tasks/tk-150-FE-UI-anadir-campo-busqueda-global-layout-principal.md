# Ticket: TK-150

## Título
FE-UI: Añadir Campo de Búsqueda Global en Layout Principal

## Descripción
Añadir un componente de campo de búsqueda (input de texto con un botón o icono de buscar) en una ubicación prominente y persistente de la interfaz del ATS MVP, como la barra de navegación principal.

## User Story Relacionada
US-042: Buscar Candidatos por Nombre o Palabra Clave

## Criterios de Aceptación Técnicos (Verificables)
1.  En el layout principal (ej. Header/Navbar), existe un campo de entrada de texto para búsqueda.
2.  Junto al campo, hay un botón "Buscar" o un icono de lupa.
3.  El campo permite al usuario introducir texto.
4.  Al presionar Enter en el campo o hacer clic en el botón, se dispara la lógica de búsqueda (TK-152).

## Solución Técnica Propuesta (Opcional)
Integrar un componente Input con botón/icono del framework UI.

## Dependencias Técnicas (Directas)
* Layout Principal/Navbar existente.
* TK-152 (Lógica Frontend que se invoca)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-042)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Añadir input/botón a layout existente, estilo básico]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, layout, search, input, navbar, header

## Comentarios
Define el punto de entrada para la búsqueda.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]