# Ticket: TK-134

## Título
CAI-BE-API: (Asegurar/Definir) Endpoint API Core AI para Recibir Feedback

## Descripción
Asegurar que el contrato API (TK-001) defina claramente el endpoint en Core AI que recibirá el feedback enviado por el ATS MVP (llamado desde TK-132). Verificar que la especificación incluya la ruta, método (POST), formato del cuerpo esperado (`evaluation_ia_id`, `usuario_ats_id`, `tipo_feedback`, `datos_feedback`) y respuestas. La *implementación* real de este endpoint en Core AI corresponde a US-039.

## User Story Relacionada
US-038: Enviar Feedback Capturado a Core AI (depende de la existencia de este endpoint) y US-039 (implementa el endpoint).

## Criterios de Aceptación Técnicos (Verificables)
1.  El archivo `openapi.yaml` (TK-001) incluye la definición del endpoint para recibir feedback (ej. `POST /api/v1/ai/feedback`).
2.  La definición especifica el método POST.
3.  La definición especifica el esquema JSON esperado para el cuerpo de la petición, incluyendo los campos requeridos (`evaluation_ia_id`, `usuario_ats_id`, `tipo_feedback`) y opcionales (`datos_feedback`).
4.  La definición especifica los códigos de respuesta esperados (ej. 200 OK/202 Accepted, 400 Bad Request, 500 Internal Server Error).
5.  La definición incluye los requerimientos de seguridad/autenticación interna.

## Solución Técnica Propuesta (Opcional)
Revisar y actualizar TK-001 (openapi.yaml).

## Dependencias Técnicas (Directas)
* TK-001 (Contrato API)
* Decisiones de diseño sobre la estructura de datos del feedback.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-038 y US-039)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Revisión/Definición de un endpoint específico en OpenAPI]

## Asignación Inicial
Equipo Arquitectura / Tech Lead

## Etiquetas
api, contract, openapi, core-ai, feedback, definition

## Comentarios
Tarea de definición/documentación de la API, asegura que ATS y Core AI estén alineados sobre cómo enviar el feedback. La implementación real del lado de Core AI es US-039.

## Enlaces o Referencias
[TK-001 - Especificación API]