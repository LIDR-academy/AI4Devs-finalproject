### HU-005: Enviar Mensaje de Texto Simple en Chat

**Como** usuario autenticado y miembro de un chat,
**quiero** enviar un mensaje de texto simple (sin condiciones),
**para que** pueda comunicarme de forma básica antes de usar funcionalidades condicionadas.

#### Criterios de Aceptación

- [ ] El sistema debe permitir escribir texto en el campo de mensaje del chat
- [ ] El sistema debe permitir enviar mensaje presionando botón "Enviar" o Enter
- [ ] El sistema debe validar que el texto no esté vacío (mínimo 1 carácter)
- [ ] El sistema debe validar que el texto no supere 5000 caracteres
- [ ] El sistema debe crear el mensaje con visibility_type = 'PLAIN' y status = 'UNLOCKED'
- [ ] El sistema debe asociar el mensaje al chat y al usuario emisor
- [ ] El sistema debe enviar el mensaje vía WebSocket a todos los miembros del chat online
- [ ] El sistema debe mostrar el mensaje inmediatamente en el timeline del emisor
- [ ] El sistema debe mostrar indicadores de estado: enviado, entregado
- [ ] El sistema debe limpiar el campo de texto tras envío exitoso
- [ ] Los demás miembros del chat deben recibir el mensaje en tiempo real (si están online)
- [ ] Si un miembro está offline, debe recibir notificación push
- [ ] El envío debe completarse en menos de 300ms

#### Notas Adicionales

- Esta es la funcionalidad base de mensajería, sin condiciones de desbloqueo
- Los mensajes PLAIN se muestran inmediatamente a todos sin restricciones
- Los saltos de línea se permiten (máximo 50 líneas)
- Se debe sanitizar el contenido para prevenir XSS
- El timestamp del mensaje se toma del servidor (no del cliente) para consistencia
- Los mensajes se almacenan permanentemente (no son efímeros)

#### Historias de Usuario Relacionadas

- HU-004: Crear chat 1-a-1 (requisito previo)
- HU-006: Ver timeline de mensajes (para visualizar mensajes enviados)
- HU-007: Enviar mensaje con condición temporal (versión avanzada de esta historia)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/messages`

**Request Body:**
```json
{
  "chatId": "chat-uuid",
  "contentType": "TEXT",
  "contentText": "Hola, ¿cómo estás?",
  "visibilityType": "PLAIN"
}
```

**Response:**
```json
{
  "messageId": "message-uuid",
  "chatId": "chat-uuid",
  "sender": {
    "userId": "user-uuid",
    "username": "usuario",
    "displayName": "Usuario",
    "avatarUrl": "..."
  },
  "contentType": "TEXT",
  "contentText": "Hola, ¿cómo estás?",
  "visibilityType": "PLAIN",
  "status": "UNLOCKED",
  "createdAt": "2025-01-20T10:30:00Z"
}
```

**WebSocket Event (enviado a miembros del chat):**
```json
{
  "event": "newMessage",
  "data": {
    "messageId": "message-uuid",
    "chatId": "chat-uuid",
    "sender": {...},
    "contentType": "TEXT",
    "contentText": "Hola, ¿cómo estás?",
    "createdAt": "2025-01-20T10:30:00Z"
  }
}
```

**Módulos NestJS:**
- `src/modules/messages/` (messages.controller.ts, messages.service.ts, messages.repository.ts)
- `src/modules/realtime/` (realtime.gateway.ts para WebSocket)
- `src/modules/notifications/` (para notificar usuarios offline)

**Tablas DB:**
- MESSAGES (id, public_id, chat_id, sender_id, content_type='TEXT', content_text, visibility_type='PLAIN', status='UNLOCKED', created_at)

**Validaciones:**
- `@MinLength(1)` `@MaxLength(5000)` para contentText
- `@IsEnum(ContentType)` para contentType
- `@IsEnum(VisibilityType)` para visibilityType
- Validar que el usuario es miembro del chat
- Sanitizar HTML para prevenir XSS

**Tests:**
- **Unitarios**:
  - Validación de longitud de texto
  - Sanitización de contenido
  - Generación de public_id único
- **Integración**:
  - Creación exitosa de mensaje en DB
  - Verificación de permisos del usuario
  - Emisión de evento WebSocket
- **E2E**:
  - Flujo completo de envío de mensaje
  - Recepción en tiempo real por otro usuario
  - Intento de envío en chat donde no es miembro (debe fallar)
  - Envío de mensaje vacío (debe fallar)
  - Envío de mensaje muy largo (debe fallar)

**Prioridad:** P0 - Blocker (Sprint 2)
**Estimación:** 5 Story Points
**Caso de Uso Relacionado:** Parte del flujo de mensajería básica

