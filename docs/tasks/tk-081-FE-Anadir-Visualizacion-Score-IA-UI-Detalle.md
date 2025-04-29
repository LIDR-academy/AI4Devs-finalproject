# Ticket: TK-081

## Título
FE: Añadir Visualización de Score IA a UI Detalle Candidatura

## Descripción
Modificar el componente de UI del frontend del ATS MVP que muestra el detalle de una candidatura para incluir una sección o elemento visual claro que muestre el `puntuacion_ia_general` (Score IA) asociado a esa candidatura, si está disponible.

## User Story Relacionada
US-027: Mostrar Evaluación IA en Perfil de Candidatura

## Criterios de Aceptación Técnicos (Verificables)
1.  En la vista de detalle de una candidatura que ha sido evaluada por IA, se muestra un elemento visual (ej. texto "Score IA: 85/100", una barra de progreso, un gauge) que representa el `puntuacion_ia_general`.
2.  La visualización está claramente etiquetada como "Score IA" o similar.
3.  Si la candidatura aún no ha sido evaluada o no tiene score, el elemento no se muestra o indica "Pendiente de evaluación".
4.  La presentación visual es clara y no interfiere con otros elementos importantes del perfil.

## Solución Técnica Propuesta (Opcional)
Añadir un nuevo subcomponente o sección al componente de detalle de candidatura existente. Usar librerías de gráficos simples si se opta por visualizaciones más allá del texto.

## Dependencias Técnicas (Directas)
* Componente UI existente de Detalle de Candidatura.
* TK-082 (Lógica Frontend para obtener el score).
* Diseño de UI/Mockups.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-027)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Modificación UI, añadir elemento visual, manejo condicional]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, candidate, detail, evaluation, score, display

## Comentarios
Elemento clave para dar visibilidad al resultado de la IA.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]