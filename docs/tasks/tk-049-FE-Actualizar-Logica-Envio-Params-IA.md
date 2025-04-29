# Ticket: TK-049

## Título
FE: Actualizar Lógica Frontend para Enviar Parámetros IA al Guardar Vacante

## Descripción
Modificar la lógica del frontend que maneja el guardado del formulario de edición de vacantes (TK-025) para que incluya los nuevos valores de los parámetros de configuración IA (Score de Corte, IDs de Etapas Seleccionadas) en la petición enviada al backend del ATS MVP.

## User Story Relacionada
US-013: Configurar Parámetros de Evaluación IA para la Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  Al hacer clic en "Guardar Cambios" en el formulario de edición (TK-024/TK-048), la lógica recopila también los valores introducidos en los campos "Score de Corte IA", "Etapa Sugerida (Aceptación)" e "Etapa Sugerida (Rechazo)".
2.  Estos valores se incluyen en el cuerpo de la petición PATCH enviada a `/api/v1/jobs/{jobId}` (TK-022).
3.  Se realiza la validación del score (0-100) en el cliente antes de enviar.
4.  Si la respuesta del backend es exitosa, se confirma el guardado como antes.
5.  Si la respuesta indica un error relacionado con los parámetros IA (ej. 400 por validación backend), se muestra el error al usuario.

## Solución Técnica Propuesta (Opcional)
Extender el objeto de datos enviado en la llamada PATCH de TK-025 para incluir los nuevos campos (ej. `ai_cutoff_score`, `ai_accept_stage_id`, `ai_reject_stage_id`).

## Dependencias Técnicas (Directas)
* TK-048 (Campos UI de donde se obtienen los datos)
* TK-025 (Lógica existente de guardado/API de Vacante)
* TK-050 (Endpoint Backend API que recibe estos datos)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-013)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Modificar lógica existente para incluir nuevos campos, añadir validación score]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, vacancy, job, edit, ai-config

## Comentarios
Asegurar que se envían los IDs correctos de las etapas seleccionadas.

## Enlaces o Referencias
[TK-001 - Especificación API]