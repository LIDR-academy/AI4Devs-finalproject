# Ticket: TK-050

## Título
BE: Adaptar API Actualizar Vacante (`PATCH /api/v1/jobs/{jobId}`) para Recibir Params IA

## Descripción
Modificar el endpoint `PATCH /api/v1/jobs/{jobId}` (TK-022) en el backend del ATS MVP para que acepte los nuevos parámetros de configuración IA (`ai_cutoff_score`, `ai_accept_stage_id`, `ai_reject_stage_id`) en el cuerpo de la petición, además de los campos existentes. Validar estos nuevos campos.

## User Story Relacionada
US-013: Configurar Parámetros de Evaluación IA para la Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  El endpoint `PATCH /api/v1/jobs/{jobId}` (TK-022) ahora acepta opcionalmente los campos `ai_cutoff_score` (Number), `ai_accept_stage_id` (String/UUID), `ai_reject_stage_id` (String/UUID) en el cuerpo JSON.
2.  Se añade validación para `ai_cutoff_score` (debe ser numérico entre 0 y 100 si se proporciona). Devuelve 400 si falla.
3.  Se añade validación para `ai_accept_stage_id` y `ai_reject_stage_id` (deben ser IDs de etapas válidas y marcadas como 'seleccionable_ia' - requiere consultar EtapaPipeline). Devuelve 400 si falla.
4.  Los parámetros IA validados se pasan a la lógica de negocio de actualización (TK-023 adaptada o nueva lógica en TK-051).

## Solución Técnica Propuesta (Opcional)
Actualizar la validación de entrada del controlador/ruta para incluir los nuevos campos y sus reglas. La validación de IDs de etapa puede hacerse consultando la tabla EtapaPipeline.

## Dependencias Técnicas (Directas)
* TK-022 (Endpoint existente a modificar)
* TK-011 (Esquema EtapaPipeline para validar IDs y flag)
* TK-051 (Lógica de negocio que procesa/guarda estos params)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-013)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Modificar validación DTO/schema, añadir lógica validación IDs etapa]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, vacancy, job, update, patch, ai-config, validation

## Comentarios
La validación de los IDs de etapa es importante para la integridad.

## Enlaces o Referencias
[TK-001 - Especificación API]