### HU-007: Enviar Mensaje con Condición Temporal

**Como** usuario autenticado y miembro de un chat,
**quiero** enviar un mensaje que solo podrá visualizarse en una fecha y hora específica,
**para que** pueda crear sorpresas, invitaciones reveladoras o cápsulas del tiempo que generen anticipación.

#### Criterios de Aceptación

- [ ] El sistema debe permitir escribir un mensaje de texto o seleccionar multimedia
- [ ] El sistema debe mostrar opción de "Agregar condición" al componer mensaje
- [ ] El sistema debe ofrecer selector de tipo de condición, incluyendo "Temporal"
- [ ] El sistema debe mostrar selector visual de fecha y hora al elegir condición temporal
- [ ] El sistema debe ofrecer atajos rápidos: "En 1 hora", "Mañana", "En 1 semana"
- [ ] El sistema debe validar que la fecha/hora seleccionada es futura (> NOW())
- [ ] El sistema debe permitir fechas hasta 1 año en el futuro (límite)
- [ ] El sistema debe crear mensaje con visibility_type='CONDITIONAL' y status='PENDING'
- [ ] El sistema debe crear condición tipo TIME con available_from = fecha programada
- [ ] El sistema debe programar job en Redis/BullMQ para notificar cuando llegue el momento
- [ ] El sistema debe mostrar el mensaje completo al emisor (siempre)
- [ ] El receptor debe ver "🔒 Bloqueado hasta DD/MM/YYYY HH:MM" con contador regresivo
- [ ] Cuando llegue available_from, el sistema debe cambiar status a 'UNLOCKED' automáticamente
- [ ] El sistema debe enviar notificación push al receptor cuando el mensaje se desbloquee
- [ ] El envío del mensaje debe completarse en menos de 1 segundo

#### Notas Adicionales

- El mensaje permanece PENDING hasta que available_from se alcanza
- No se requiere acción del receptor, el mensaje se desbloquea automáticamente
- El sistema usa un scheduler (BullMQ) para verificar mensajes desbloqueables cada minuto
- La zona horaria se maneja en UTC, la UI convierte a zona local del usuario
- El emisor puede ver estadísticas de cuándo el receptor vio el mensaje (futuro)
- Considerar opción de cancelar/reprogramar antes del desbloqueo (futuro)

#### Historias de Usuario Relacionadas

- HU-005: Enviar mensaje de texto (base de esta funcionalidad)
- HU-009: Intentar desbloquear mensaje (el receptor puede "forzar" desbloqueo si ya llegó la hora)
- HU-013: Ver contador regresivo (experiencia del receptor)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/messages`

**Request Body:**
```json
{
  "chatId": "chat-uuid",
  "contentType": "TEXT",
  "contentText": "¡Feliz Año Nuevo! 🎉",
  "visibilityType": "CONDITIONAL",
  "condition": {
    "type": "TIME",
    "availableFrom": "2025-12-31T20:00:00Z"
  }
}
```

**Response:**
```json
{
  "messageId": "message-uuid",
  "chatId": "chat-uuid",
  "visibilityType": "CONDITIONAL",
  "status": "PENDING",
  "condition": {
    "type": "TIME",
    "availableFrom": "2025-12-31T20:00:00Z"
  },
  "createdAt": "2025-01-20T10:00:00Z"
}
```

**Módulos NestJS:**
- `src/modules/messages/` (messages.service.ts)
- `src/modules/conditions/` (conditions.service.ts, time-condition.strategy.ts)
- `src/modules/notifications/` (notification-scheduler.service.ts)

**Tablas DB:**
- MESSAGES (visibility_type='CONDITIONAL', status='PENDING')
- MESSAGE_CONDITIONS (condition_type='TIME', available_from)

**Queue (BullMQ):**
- Job programado en Redis: `{messageId, unlockAt: available_from}`
- Scheduler ejecuta jobs cuando llega el momento
- Al ejecutar: actualiza status a 'UNLOCKED' y envía notificación

**Validaciones:**
- `@IsISO8601()` para availableFrom
- Validación personalizada: availableFrom > NOW()
- Validación personalizada: availableFrom < NOW() + 1 año

**Tests:**
- **Unitarios**:
  - Validación de fecha futura
  - Cálculo correcto de tiempo restante
  - Lógica de programación de job
- **Integración**:
  - Creación de mensaje + condición en transacción
  - Programación exitosa de job en Redis
  - Ejecución automática de job al llegar la hora
- **E2E**:
  - Flujo completo de envío de mensaje temporal
  - Visualización con contador regresivo por receptor
  - Desbloqueo automático al alcanzar available_from
  - Notificación push al desbloquear
  - Intento con fecha en el pasado (debe fallar)

**Prioridad:** P1 - High (Sprint 3) - DIFERENCIADOR CLAVE
**Estimación:** 5 Story Points
**Caso de Uso Relacionado:** UC-007 - Enviar Mensaje con Condición Temporal

