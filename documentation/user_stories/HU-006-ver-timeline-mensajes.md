### HU-006: Ver Timeline de Mensajes de un Chat (Paginado)

**Como** usuario autenticado y miembro de un chat,
**quiero** ver el historial completo de mensajes del chat en orden cronológico,
**para que** pueda entender el contexto de la conversación e identificar mensajes bloqueados que puedo desbloquear.

#### Criterios de Aceptación

- [ ] El sistema debe mostrar los 20 mensajes más recientes al abrir el chat
- [ ] Los mensajes deben ordenarse cronológicamente (más antiguos arriba, más recientes abajo)
- [ ] El sistema debe hacer scroll automático al último mensaje al abrir el chat
- [ ] El sistema debe permitir scroll hacia arriba para cargar mensajes más antiguos (paginación infinita)
- [ ] Cada scroll debe cargar 20 mensajes adicionales
- [ ] El sistema debe mostrar indicador de "Cargando más mensajes..." durante la carga
- [ ] Para cada mensaje, el sistema debe mostrar:
  - Avatar y nombre del emisor
  - Contenido del mensaje (si es PLAIN o UNLOCKED)
  - Indicador de "🔒 Bloqueado" (si es CONDITIONAL PENDING)
  - Timestamp de envío
  - Estado de lectura
- [ ] Los mensajes CONDITIONAL PENDING deben mostrar preview sin revelar contenido
- [ ] Los mensajes propios siempre se muestran completos (incluso si son condicionados)
- [ ] El sistema debe actualizar last_read_at del usuario en CHAT_MEMBERS
- [ ] El sistema debe agrupar mensajes consecutivos del mismo emisor
- [ ] El sistema debe mostrar separadores de fecha entre mensajes de días diferentes
- [ ] El sistema debe mostrar "Inicio de la conversación" cuando no hay más mensajes
- [ ] La carga inicial debe completarse en menos de 500ms

#### Notas Adicionales

- Implementar paginación cursor-based con parámetro `before` (timestamp) para eficiencia
- El tamaño de página por defecto es 20 mensajes (límite máximo: 100)
- Los mensajes con visibility_type PLAIN se muestran siempre completos
- Los mensajes CONDITIONAL PENDING solo muestran preview/indicador, no contenido real
- Las URLs de multimedia deben generarse firmadas con expiración de 1 hora
- Implementar lazy loading de imágenes/videos pesados
- Usar virtualización de scroll para chats con miles de mensajes (optimización futura)

#### Historias de Usuario Relacionadas

- HU-004: Crear chat 1-a-1 (crea el chat donde se ve el timeline)
- HU-005: Enviar mensaje de texto (los mensajes enviados aparecen en el timeline)
- HU-009: Intentar desbloquear mensaje (al hacer tap en mensaje bloqueado)
- HU-012: Ver previsualización bloqueada (aplicado a mensajes CONDITIONAL)

#### Detalle Técnico

**Endpoints:**
- GET `/api/v1/chats/{chatId}/messages?limit=20&before=timestamp`

**Response:**
```json
{
  "chatId": "chat-uuid",
  "messages": [
    {
      "messageId": "msg-uuid-1",
      "sender": {
        "userId": "user-uuid",
        "username": "usuario",
        "displayName": "Usuario",
        "avatarUrl": "..."
      },
      "contentType": "TEXT",
      "visibilityType": "PLAIN",
      "status": "UNLOCKED",
      "preview": "Texto del mensaje...",
      "createdAt": "2025-01-20T10:00:00Z",
      "unlockedAt": "2025-01-20T10:00:00Z"
    },
    {
      "messageId": "msg-uuid-2",
      "sender": {...},
      "contentType": "TEXT",
      "visibilityType": "CONDITIONAL",
      "status": "PENDING",
      "preview": "🔒 Mensaje bloqueado",
      "conditionType": "TIME",
      "availableFrom": "2025-01-21T20:00:00Z",
      "createdAt": "2025-01-20T11:00:00Z",
      "unlockedAt": null
    }
  ],
  "nextCursor": "2025-01-20T09:00:00Z"
}
```

**Módulos NestJS:**
- `src/modules/messages/` (messages.controller.ts, messages.service.ts)
- `src/modules/media/` (para generar URLs firmadas de multimedia)

**Tablas DB:**
- MESSAGES (con joins a USERS para sender y MESSAGE_CONDITIONS para condiciones)
- CHAT_MEMBERS (para actualizar last_read_at)

**Query Optimization:**
- Índice compuesto en (chat_id, created_at) para paginación eficiente
- JOIN optimizado con USERS y MESSAGE_CONDITIONS
- Limit de 20-100 mensajes por petición

**Validaciones:**
- Validar que el usuario es miembro del chat (403 si no)
- Validar parámetros de paginación (limit, before)
- No exponer contenido de mensajes PENDING en la respuesta

**Tests:**
- **Unitarios**:
  - Lógica de paginación cursor-based
  - Construcción correcta de MessageDTO según visibilityType
  - Ocultación de contenido para mensajes PENDING
- **Integración**:
  - Consulta eficiente con índice compuesto
  - Actualización de last_read_at tras cargar mensajes
  - Generación de URLs firmadas para multimedia
- **E2E**:
  - Carga inicial de mensajes del chat
  - Paginación hacia atrás (scroll up)
  - Visualización correcta de mensajes bloqueados vs desbloqueados
  - Chat vacío (sin mensajes)
  - Intento de acceso a chat donde no es miembro (debe fallar 403)

**Prioridad:** P0 - Blocker (Sprint 2)
**Estimación:** 5 Story Points
**Caso de Uso Relacionado:** UC-006 - Ver Historial de Mensajes

