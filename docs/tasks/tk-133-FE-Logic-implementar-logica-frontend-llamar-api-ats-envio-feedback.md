# Ticket: TK-133

## Título
FE-Logic: Implementar Lógica Frontend para Llamar a API ATS de Envío Feedback

## Descripción
Desarrollar la lógica en el frontend que, después de que el usuario interactúa con los controles de feedback (lógica de TK-126 si se hubiera hecho), realiza la llamada al endpoint del backend del ATS (`POST /api/v1/feedback`, TK-131) para registrar el feedback.

## User Story Relacionada
US-038: Enviar Feedback Capturado a Core AI

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función (ej. `sendFeedback(evaluationId, feedbackType, feedbackData)`) en un servicio o store.
2.  La función es invocada por la lógica de UI de feedback (ej. desde TK-126).
3.  Realiza una llamada `POST` a `/api/v1/feedback` (TK-131) con el payload `{ evaluation_id, feedback_type, feedback_data }`.
4.  La llamada incluye el token de autenticación del usuario.
5.  Maneja el estado de carga.
6.  Maneja la respuesta de la API del ATS:
    * Si éxito (200/202): Muestra un mensaje de confirmación (ej. "Feedback enviado").
    * Si error (400/500): Muestra un mensaje de error al usuario.

## Solución Técnica Propuesta (Opcional)
Añadir método al servicio API existente o store.

## Dependencias Técnicas (Directas)
* Lógica UI que captura el feedback (TK-126 si existiera, o lógica similar para US-040).
* TK-131 (Endpoint API ATS al que llamar).
* Mecanismo de autenticación frontend.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-038)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Implementación llamada API POST, manejo respuesta/error, feedback UI básico]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, feedback, send

## Comentarios
Conecta la acción del usuario en la UI con el backend del ATS.

## Enlaces o Referencias
[TK-001 - Especificación API]