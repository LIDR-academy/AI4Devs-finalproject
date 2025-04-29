# Ticket: TK-051

## Título
BE: Adaptar Lógica ATS para Desencadenar Guardado de Params IA en Core AI

## Descripción
Modificar la lógica de negocio en el backend del ATS MVP que se ejecuta al actualizar una vacante (TK-023). Si en la petición de actualización se recibieron parámetros de configuración IA válidos (validados en TK-050), después de guardar los cambios de la vacante en la BBDD del ATS, se debe realizar una llamada a la API de Core AI (endpoint definido en TK-001 para US-016) para que Core AI almacene esos parámetros asociados a la vacante.

## User Story Relacionada
US-013: Configurar Parámetros de Evaluación IA para la Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio que actualiza la vacante (TK-023) ahora también recibe los parámetros IA validados (`ai_cutoff_score`, `ai_accept_stage_id`, `ai_reject_stage_id`) como entrada opcional.
2.  Después de actualizar exitosamente la tabla `Vacante` en la BBDD del ATS.
3.  Si los parámetros IA fueron proporcionados en la entrada, se realiza una llamada (POST o PUT) al endpoint de Core AI para guardar/actualizar parámetros IA (endpoint asociado a US-016, definido en TK-001).
4.  La llamada a Core AI incluye el ID de la vacante ATS (`jobId`) y los parámetros IA recibidos.
5.  Se manejan posibles errores de comunicación con Core AI (ej. loguear el error, pero no necesariamente hacer fallar la actualización de la vacante en ATS si ya se guardó).
6.  La respuesta final al frontend (desde TK-022) sigue siendo la vacante actualizada del ATS.

## Solución Técnica Propuesta (Opcional)
Añadir la llamada a Core AI al final del método de servicio de actualización de vacante en ATS. Usar un cliente HTTP configurado para llamar a Core AI.

## Dependencias Técnicas (Directas)
* TK-023 (Lógica existente de actualización de vacante a modificar)
* TK-050 (Endpoint API que recibe los params y llama a esta lógica)
* Endpoint API de Core AI para guardar parámetros IA (TK-001 / US-016).
* Cliente HTTP para llamadas internas.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-013)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Modificar servicio ATS, implementar llamada API a Core AI, manejo básico errores comunicación]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, vacancy, job, update, ai-config, integration, core-ai

## Comentarios
Coordina el guardado en ATS y el envío de la configuración a Core AI. El manejo de errores entre servicios es importante.

## Enlaces o Referencias
[TK-001 - Especificación API]