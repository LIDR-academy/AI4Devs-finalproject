# Ticket: TK-125

## Título
FE-UI: Añadir Controles de Feedback Básico (👍/👎) a Vista Detalle Candidatura

## Descripción
Modificar el componente de UI del frontend que muestra el detalle de una candidatura para incluir controles visuales simples (ej. botones con iconos de pulgar arriba y pulgar abajo) que permitan al usuario dar feedback básico sobre la evaluación IA mostrada (US-027).

## User Story Relacionada
US-037: Capturar Feedback Básico sobre Evaluación IA

## Criterios de Aceptación Técnicos (Verificables)
1.  En la vista de detalle de la candidatura, cerca de la sección de Score IA (TK-081) y/o Resumen IA (TK-109), se muestran dos botones/iconos interactivos (👍 y 👎).
2.  Los botones tienen un estilo visual claro que indica su propósito (feedback positivo/negativo).
3.  (Opcional) Pueden tener un estado visual para indicar si uno ha sido seleccionado.
4.  Los botones son clickables y disparan un evento manejado por TK-126.

## Solución Técnica Propuesta (Opcional)
Usar componentes de botón/icono del framework UI.

## Dependencias Técnicas (Directas)
* Vista de Detalle de Candidatura existente.
* TK-126 (Lógica Frontend que maneja el evento click).
* Diseño de UI/Mockups para los controles de feedback.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-037)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Añadir botones/iconos a UI existente, estilo básico]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, detail, application, feedback, button, icon

## Comentarios
Define la interfaz para el feedback básico.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]