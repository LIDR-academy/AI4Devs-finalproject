# Ticket: TK-132

## Título
BE-Logic: Implementar Lógica ATS para Enviar Feedback a Core AI

## Descripción
Desarrollar la lógica de negocio en el backend del ATS MVP que, al ser invocada por TK-131, construye la petición con el formato esperado por Core AI y realiza la llamada a la API de Feedback de Core AI (definida en TK-134 / US-001) para registrar el feedback.

## User Story Relacionada
US-038: Enviar Feedback Capturado a Core AI

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe los datos del feedback (`evaluationId`, `feedbackType`, `feedbackData`) y el `userId` del ATS.
2.  Construye el payload JSON para la API de Core AI, incluyendo `evaluation_ia_id`, `usuario_ats_id`, `tipo_feedback`, `datos_feedback`.
3.  Realiza una llamada POST (o según defina TK-134) al endpoint de Feedback de Core AI.
4.  Incluye la autenticación interna requerida para la comunicación ATS -> Core AI.
5.  Maneja la respuesta de Core AI (éxito o error). Puede loguear el resultado. No necesita propagar errores necesariamente al frontend si la recepción en ATS (TK-131) fue exitosa (desacoplamiento).

## Solución Técnica Propuesta (Opcional)
Implementar en capa de Servicios del ATS. Usar un cliente HTTP configurado para llamar a la API interna de Core AI.

## Dependencias Técnicas (Directas)
* TK-131 (API ATS que invoca esta lógica)
* TK-134 (Endpoint Core AI al que llamar)
* Cliente HTTP para llamadas internas.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-038)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Implementación lógica de servicio, construcción payload, llamada API interna, manejo básico respuesta/error]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, ats, feedback, integration, core-ai, api-client

## Comentarios
Actúa como cliente de la API de Core AI.

## Enlaces o Referencias
[TK-001 - Especificación API], [TK-134]