# Ticket: TK-089

## Título
FE: Implementar Navegación desde Lista Candidatos a Detalle Candidatura

## Descripción
Añadir la lógica de navegación en el frontend para que, al hacer clic en una fila/item de la lista de candidatos (TK-087), el usuario sea redirigido a la página/ruta de detalle de esa candidatura específica, pasando el ID de la candidatura como parámetro en la ruta.

## User Story Relacionada
US-029: Visualizar Lista de Candidatos por Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  El componente de lista/tabla (TK-087) tiene un manejador de eventos `onClick` en cada fila/item.
2.  El manejador de eventos obtiene el `candidaturaId` de la fila clickeada.
3.  Se invoca el sistema de routing del framework frontend para navegar a la ruta de detalle de la candidatura (ej. `/candidaturas/{candidaturaId}`).
4.  La navegación se realiza correctamente.

## Solución Técnica Propuesta (Opcional)
Usar el sistema de routing del framework frontend (React Router, Vue Router, etc.).

## Dependencias Técnicas (Directas)
* TK-087 (Componente UI de la lista)
* Sistema de Routing del Frontend.
* Definición de la ruta de detalle de candidatura (puede requerir un nuevo ticket si no existe).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-029)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Añadir manejador de clic, invocar API de routing]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, navigation, routing, list, detail, application

## Comentarios
Conexión entre la vista de lista y la de detalle.

## Enlaces o Referencias
[Documentación del Router del Framework]