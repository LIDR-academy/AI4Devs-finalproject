# Ticket: TK-144

## Título
BE-Logic: Implementar Lógica de Negocio para API Gestión Notificaciones

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend ATS para implementar las operaciones requeridas por la API de notificaciones (TK-143): contar no leídas, listar recientes, marcar como leída(s) para el usuario autenticado.

## User Story Relacionada
US-041: Recibir Notificaciones Internas sobre Eventos Clave

## Criterios de Aceptación Técnicos (Verificables)
1.  Función `getUnreadCount(userId)`: Consulta `Notificacion` WHERE `user_id` = userId AND `leida` = false y devuelve el COUNT.
2.  Función `listNotifications(userId, paginationParams)`: Consulta `Notificacion` WHERE `user_id` = userId, ordena por `fecha_creacion` DESC, aplica paginación y devuelve la lista.
3.  Función `markAsRead(userId, notificationId)`: Verifica que la notificación pertenezca al usuario, actualiza `leida` = true en `Notificacion` WHERE `id` = notificationId AND `user_id` = userId.
4.  Función `markAllAsRead(userId)`: Actualiza `leida` = true en `Notificacion` WHERE `user_id` = userId AND `leida` = false.
5.  Maneja errores de BBDD.

## Solución Técnica Propuesta (Opcional)
Implementar en capa de Servicios. Usar ORM para las consultas y actualizaciones.

## Dependencias Técnicas (Directas)
* TK-141 (Esquema BBDD `Notificacion`)
* TK-143 (Endpoints API que invocan esta lógica)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-041)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación lógica de servicio para 4 operaciones BBDD (COUNT, SELECT, UPDATE)]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, notification, crud, read, update

## Comentarios
Lógica de consulta y actualización sobre la tabla de notificaciones.

## Enlaces o Referencias
[Documentación ORM]