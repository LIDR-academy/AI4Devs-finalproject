# Ticket: TK-131

## Título
BE-API: Implementar Endpoint ATS para Recibir Solicitud Envío Feedback (`POST /api/v1/feedback`)

## Descripción
Crear un endpoint en el backend del ATS MVP (ej. `POST /api/v1/feedback`) que el frontend llamará cuando el usuario proporcione feedback sobre una evaluación IA. Recibirá los detalles del feedback (ID de evaluación, tipo de feedback, datos adicionales) y disparará la lógica para enviarlo a Core AI. Protegido por autenticación.

## User Story Relacionada
US-038: Enviar Feedback Capturado a Core AI

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `POST /api/v1/feedback`.
2.  Acepta un cuerpo JSON con `{ "evaluation_id": "uuid", "feedback_type": "string", "feedback_data": {...} }`.
3.  El endpoint está protegido por autenticación (TK-005).
4.  Valida la entrada (IDs válidos, tipo de feedback conocido). Devuelve 400 si falla.
5.  Obtiene el `userId` del usuario autenticado.
6.  Invoca la lógica de negocio del ATS (TK-132) para procesar y enviar el feedback a Core AI, pasando los datos validados y el `userId`.
7.  Devuelve 200 OK/202 Accepted si la solicitud se procesa (incluso si el envío asíncrono a Core AI está pendiente), o un error apropiado (400, 500).

## Solución Técnica Propuesta (Opcional)
Endpoint RESTful estándar. La ruta `/feedback` es genérica; podría anidarse bajo `/applications/{appId}/feedback` si se prefiere, pero requiere conocer el `appId` además del `evaluationId`. Usar `/feedback` y pasar `evaluationId` en el cuerpo es más flexible.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación)
* TK-132 (Lógica de Negocio ATS para envío)
* TK-133 (Lógica Frontend que llama a este endpoint)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-038)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Creación ruta/controlador, integración middleware, validación input]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, feedback, trigger, ats

## Comentarios
Punto de entrada en el ATS para que el frontend reporte el feedback.

## Enlaces o Referencias
[TK-001 - Especificación API]