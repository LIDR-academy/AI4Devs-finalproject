# Ticket: TK-059

## Título
CAI-BE: Implementar Endpoint API Core AI para Guardar Parámetros IA de Vacante

## Descripción
Crear y exponer un endpoint en el servicio Core AI correspondiente (ej. Servicio Generación JD o uno de Configuración) que reciba la solicitud del ATS MVP (iniciada en TK-051) para guardar o actualizar los parámetros de evaluación IA (score corte, etapa aceptación, etapa rechazo) asociados a un ID de vacante específico del ATS.

## User Story Relacionada
US-016: Almacenar Parámetros de Evaluación IA Asociados a Vacante (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint (ej. `PUT /api/v1/ai/vacancies/{ats_vacante_id}/config`) en Core AI, definido según TK-001.
2.  El endpoint acepta el ID de la vacante del ATS (`ats_vacante_id`) en la ruta y un cuerpo JSON con `{ ai_cutoff_score: number, ai_accept_stage_id: string, ai_reject_stage_id: string }`.
3.  El endpoint está protegido por el mecanismo de autenticación interna definido.
4.  Valida la entrada (tipos de datos, score en rango 0-100). Devuelve 400 si falla.
5.  Invoca la lógica de negocio (TK-060) para buscar/crear la entidad y guardar los parámetros.
6.  Devuelve una respuesta de éxito (ej. 200 OK o 204 No Content) o error (404 si vacante no relevante, 500) al ATS MVP.

## Solución Técnica Propuesta (Opcional)
Usar PUT o POST. La ruta sugiere asociar la configuración a una representación de la vacante dentro de Core AI.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-060 (Lógica de Negocio Guardado Params IA)
* Autenticación interna entre ATS y Core AI.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-016)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Creación ruta/controlador, validación input, llamada a servicio]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, api, rest, ai-config, vacancy, save

## Comentarios
Endpoint que recibe la configuración IA desde el ATS.

## Enlaces o Referencias
[TK-001 - Especificación API]