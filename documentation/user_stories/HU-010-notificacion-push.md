### HU-010: Recibir Notificación Push de Mensaje Nuevo

**Como** usuario de UNLOKD,
**quiero** recibir notificaciones push en mi dispositivo cuando alguien me envíe un mensaje o cuando un mensaje se desbloquee,
**para que** pueda mantenerme informado incluso cuando la app está cerrada o en segundo plano.

#### Criterios de Aceptación

- [ ] El sistema debe solicitar permisos de notificaciones al usuario durante el onboarding
- [ ] El sistema debe registrar el token FCM (Android/Web) o APNs (iOS) del dispositivo
- [ ] El sistema debe almacenar el token en NOTIFICATION_TOKENS vinculado al usuario
- [ ] El sistema debe enviar notificación push cuando:
  - Un usuario recibe un mensaje nuevo
  - Un mensaje temporizado se desbloquea automáticamente
  - Alguien intenta desbloquear un mensaje que envié (futuro)
- [ ] El sistema NO debe enviar notificación si el usuario está online vía WebSocket
- [ ] Para mensajes CONDITIONAL, la notificación NO debe revelar el contenido:
  - Mostrar: "Nombre envió un mensaje bloqueado 🔒"
  - NO mostrar el contenido real del mensaje
- [ ] Para mensajes PLAIN, la notificación puede mostrar preview del texto (primeras 50 caracteres)
- [ ] Al hacer tap en la notificación, la app debe abrirse y navegar al chat correspondiente
- [ ] El sistema debe agrupar notificaciones del mismo chat (no spam individual)
- [ ] El sistema debe eliminar tokens inválidos o expirados automáticamente
- [ ] El sistema debe respetar configuraciones de notificaciones del usuario (silencio, DND)
- [ ] La notificación debe llegar con latencia < 5 segundos del evento
- [ ] El worker de notificaciones debe procesar 1000+ notificaciones por segundo

#### Notas Adicionales

- Usar Firebase Cloud Messaging (FCM) para Android y Web
- Usar Apple Push Notification Service (APNs) para iOS
- Los eventos se envían a cola Redis/BullMQ para procesamiento asíncrono
- Un usuario puede tener múltiples tokens (múltiples dispositivos)
- Tokens expiran después de 60 días sin uso (limpieza automática)
- Prioridad alta para mensajes desbloqueados, normal para mensajes nuevos
- Implementar reintentos con backoff exponencial para fallos transitorios

#### Historias de Usuario Relacionadas

- HU-005: Enviar mensaje de texto (trigger de notificación)
- HU-007: Enviar mensaje temporal (notifica cuando se desbloquea)
- HU-008: Enviar mensaje con contraseña (notifica al recibir)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/notifications/tokens` (registrar token)
- DELETE `/api/v1/notifications/tokens/{tokenId}` (eliminar token)

**Request Body (registrar token):**
```json
{
  "token": "fcm-token-string...",
  "platform": "ANDROID"
}
```

**Módulos NestJS:**
- `src/modules/notifications/` (notifications.service.ts, notifications.worker.ts)

**Tablas DB:**
- NOTIFICATION_TOKENS (id, user_id, token, platform, created_at, last_used_at)

**Servicios Externos:**
- Firebase Cloud Messaging (FCM) para Android/Web
- Apple Push Notification Service (APNs) para iOS

**Queue (BullMQ):**
- Cola: `notifications`
- Job payload: `{userId, event: 'newMessage', chatId, messageId, senderName}`
- Worker procesa jobs y envía a FCM/APNs

**Payload de Notificación (FCM):**
```json
{
  "notification": {
    "title": "Ana",
    "body": "Envió un mensaje bloqueado 🔒"
  },
  "data": {
    "chatId": "chat-uuid",
    "messageId": "message-uuid",
    "type": "newMessage"
  },
  "android": {
    "priority": "high"
  }
}
```

**Flujo de Notificación:**
1. Evento de dominio (MessageCreatedEvent) se emite
2. Worker escucha evento desde cola Redis
3. Worker obtiene destinatarios (miembros del chat excepto emisor)
4. Worker verifica si están online vía WebSocket
5. Si offline, consulta tokens en NOTIFICATION_TOKENS
6. Worker construye payload según tipo de mensaje
7. Worker envía a FCM/APNs
8. Worker actualiza last_used_at o elimina token si inválido

**Validaciones:**
- Validar que el token es válido antes de almacenar
- Validar plataforma (ANDROID, IOS, WEB)
- No enviar notificación si usuario online
- No revelar contenido de mensajes CONDITIONAL

**Tests:**
- **Unitarios**:
  - Construcción correcta de payload según tipo mensaje
  - Lógica de agrupación de notificaciones
  - Detección de usuario online/offline
- **Integración**:
  - Registro y eliminación de tokens en DB
  - Envío exitoso a FCM mock
  - Eliminación automática de tokens inválidos
- **E2E**:
  - Flujo completo: mensaje enviado → notificación recibida
  - Notificación de mensaje bloqueado (sin revelar contenido)
  - Tap en notificación abre chat correcto
  - No envía notificación si usuario online

**Prioridad:** P1 - High (Sprint 3)
**Estimación:** 5 Story Points
**Caso de Uso Relacionado:** UC-010 - Recibir Notificación de Mensaje Nuevo

