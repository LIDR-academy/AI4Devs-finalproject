# [UNLOKD-018] Implementar Worker de Notificaciones Push (FCM/APNs)

## Tipo
- [x] Feature

## Épica
EPIC-4: Multimedia, Notificaciones y UX

## Sprint
Sprint 4

## Estimación
**Story Points**: 5

## Descripción
Implementar worker que escucha eventos de dominio y envía notificaciones push a dispositivos usando FCM (Android/Web) y APNs (iOS).

## Historia de Usuario Relacionada
- HU-010: Recibir notificación push de mensaje nuevo

## Caso de Uso Relacionado
- UC-010: Recibir Notificación de Mensaje Nuevo

## Criterios de Aceptación
- [ ] Worker escucha eventos desde cola BullMQ
- [ ] Integración con FCM para Android/Web
- [ ] Integración con APNs para iOS
- [ ] No envía si usuario online (WebSocket)
- [ ] No revela contenido de mensajes CONDITIONAL
- [ ] Manejo de tokens inválidos (eliminación automática)
- [ ] Reintentos con backoff exponencial
- [ ] Tests

## Tareas Técnicas
- [ ] Crear `NotificationsWorker`
- [ ] Configurar FCM (Firebase Admin SDK)
- [ ] Configurar APNs (node-apn)
- [ ] Escuchar eventos (MessageCreatedEvent, MessageUnlockedEvent)
- [ ] Construir payload según tipo de mensaje
- [ ] Enviar a FCM/APNs según platform
- [ ] Eliminar tokens inválidos
- [ ] Escribir tests

## Labels
`notifications`, `push`, `fcm`, `apns`, `sprint-4`, `p1-high`

