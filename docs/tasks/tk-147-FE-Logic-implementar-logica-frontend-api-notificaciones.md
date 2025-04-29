# Ticket: TK-147

## Título
FE-Logic: Implementar Lógica Frontend para API Notificaciones

## Descripción
Desarrollar la lógica en el frontend (servicio/store) para interactuar con la API de notificaciones (TK-143): 1) Obtener periódicamente (polling) o al inicio el contador de no leídas para el badge (TK-145). 2) Obtener la lista de notificaciones al abrir el panel (TK-146). 3) Llamar a la API para marcar como leída(s) cuando el usuario interactúa con el panel (TK-146).

## User Story Relacionada
US-041: Recibir Notificaciones Internas sobre Eventos Clave

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe lógica que llama a `GET /api/v1/notifications/unread-count` periódicamente (ej. cada minuto) o tras ciertas acciones, y actualiza el estado del contador.
2.  Al abrir el panel (TK-146), se llama a `GET /api/v1/notifications` para obtener la lista reciente y se actualiza el estado.
3.  Al hacer clic en "Marcar todas como leídas" (TK-146), se llama a `POST /api/v1/notifications/read-all`. Si éxito, se actualiza el estado local (contador a 0, items a leídos).
4.  Al interactuar para marcar una como leída (TK-146), se llama a `POST /api/v1/notifications/{notificationId}/read`. Si éxito, se actualiza el estado local de esa notificación y el contador.
5.  Las llamadas incluyen token de autenticación. Se manejan estados de carga y errores.

## Solución Técnica Propuesta (Opcional)
Usar `setInterval` para polling simple del contador. Crear funciones en servicio/store para las llamadas API.

## Dependencias Técnicas (Directas)
* TK-143 (Endpoints Backend API)
* TK-145 (UI que muestra el contador)
* TK-146 (UI que lista y permite marcar como leídas)
* Mecanismo de autenticación frontend (TK-002).

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-041)

## Estimación Técnica Preliminar
[ 5 ] [horas] - [Implementación llamadas API (count, list, mark read), lógica polling/trigger, manejo estado notificaciones]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, notification, polling

## Comentarios
Coordina la interacción del frontend con la API de notificaciones. El polling es simple pero puede ser ineficiente; WebSockets sería mejor pero más complejo.

## Enlaces o Referencias
[TK-001 - Especificación API]