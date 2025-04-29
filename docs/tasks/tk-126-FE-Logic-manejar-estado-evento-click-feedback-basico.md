# Ticket: TK-126

## Título
FE-Logic: Manejar Estado y Evento Click para Feedback Básico

## Descripción
Implementar la lógica en el frontend para manejar los eventos de clic en los controles de feedback básico (TK-125). Debe actualizar el estado local para reflejar la selección del usuario (positivo/negativo/ninguno), opcionalmente actualizar la UI de los controles, y preparar los datos necesarios (`evaluationId`, `feedbackType`) para la llamada API que enviará el feedback (esta llamada se implementará en TK asociado a US-038).

## User Story Relacionada
US-037: Capturar Feedback Básico sobre Evaluación IA

## Criterios de Aceptación Técnicos (Verificables)
1.  Se implementa un manejador de eventos para los clics en los botones 👍/👎 (de TK-125).
2.  Al hacer clic, se identifica qué botón fue presionado (positivo o negativo).
3.  Se actualiza una variable de estado local que almacena el feedback actual para esa evaluación (ej. 'POSITIVE', 'NEGATIVE', o null/undefined). Permite cambiar la selección.
4.  (Opcional) La UI de los botones (TK-125) se actualiza para reflejar visualmente la selección actual.
5.  Se tiene disponible el ID de la evaluación (`EvaluacionCandidatoIA.id` o `Candidatura.referencia_evaluacion_ia_id`) sobre la que se está dando feedback.
6.  La lógica está lista para invocar la función de envío de feedback (a implementar en TK de US-038) pasando el `evaluationId` y el tipo de feedback seleccionado.

## Solución Técnica Propuesta (Opcional)
Manejar estado local en el componente de detalle o en un store. La función de click actualiza el estado y potencialmente llama (en un futuro ticket) a la función de envío.

## Dependencias Técnicas (Directas)
* TK-125 (Controles UI que disparan el evento)
* Lógica para obtener el ID de la evaluación asociada a la candidatura actual.
* TK para US-038 (Lógica Frontend que enviará el feedback a la API).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-037)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Implementación manejador de eventos, manejo estado local, preparación datos para envío]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, state-management, feedback, event-handling, interaction

## Comentarios
Prepara los datos del feedback básico para ser enviados en el siguiente paso (US-038).

## Enlaces o Referencias
N/A