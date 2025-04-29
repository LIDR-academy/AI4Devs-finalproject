# Ticket: TK-143

## Título
BE-API: Implementar Endpoints API para Gestión Notificaciones (Contar, Listar, Marcar Leídas)

## Descripción
Crear y exponer endpoints API en el backend ATS para que el frontend pueda gestionar las notificaciones del usuario autenticado: 1) Obtener el número de notificaciones no leídas. 2) Obtener una lista paginada de las notificaciones más recientes. 3) Marcar una o todas las notificaciones como leídas. Protegidos por autenticación.

## User Story Relacionada
US-041: Recibir Notificaciones Internas sobre Eventos Clave

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe `GET /api/v1/notifications/unread-count` que devuelve `{ count: number }`. Protegido. Llama a TK-144.
2.  Existe `GET /api/v1/notifications` que devuelve una lista paginada de notificaciones del usuario (mensaje, link, leida, fecha). Acepta query params de paginación. Protegido. Llama a TK-144.
3.  Existe `POST /api/v1/notifications/{notificationId}/read` (o `PATCH`) para marcar una notificación específica como leída. Protegido. Llama a TK-144. Devuelve 204.
4.  Existe `POST /api/v1/notifications/read-all` para marcar todas las notificaciones no leídas del usuario como leídas. Protegido. Llama a TK-144. Devuelve 204.

## Solución Técnica Propuesta (Opcional)
Endpoints RESTful estándar.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación)
* TK-144 (Lógica de Negocio Notificaciones)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-041)

## Estimación Técnica Preliminar
[ 5 ] [horas] - [Creación 3-4 endpoints, integración middleware, validación input básica]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, notification, list, read, count

## Comentarios
API necesaria para la interacción del frontend con las notificaciones.

## Enlaces o Referencias
[TK-001 - Especificación API]