## Context

El mensaje de usuario enviado vía `POST /api/mock/conversations/:id/reply` se persiste hoy en dos sitios: (1) la API en `replyToConversation` llama a `saveUserMessage` antes de encolar el job; (2) el Worker en `processResponseProcessor` llama a `saveMessage(conversationId, 'user', userMessage)` al inicio del job. Ambas escrituras generan un `messageId` distinto en DynamoDB, por lo que el historial devuelve el mismo mensaje dos veces. La opción elegida es **única persistencia en la API** (opción A del análisis).

## Goals / Non-Goals

**Goals:**
- Eliminar la duplicación de mensajes de usuario en el historial de conversaciones.
- Mantener una única fuente de verdad: la API persiste el mensaje de usuario; el Worker solo lo lee vía `getMessages` cuando necesita historial para los handlers (p. ej. `handleWaitingAddress`).
- No alterar el flujo process-conversation (el user prompt sintético en `processGetAddressJourney` sigue siendo persistido por el Worker).

**Non-Goals:**
- No cambiar el contrato de la API ni el esquema de DynamoDB.
- No introducir idempotencia por job en el Worker ni lógica adicional de deduplicación.

## Decisions

**Decisión: Quitar la persistencia del mensaje de usuario en el Worker (opción A).**

- **Rationale:** La API ya recibe el mensaje y lo persiste antes de encolar. El Worker necesita el historial (incluido ese mensaje) cuando llama a `getMessages(conversationId)` dentro de los handlers; en ese momento el mensaje ya está en DynamoDB porque la API lo escribió antes de `addProcessResponseJob`. Así se evitan duplicados en reintentos del job y se mantiene visibilidad inmediata del mensaje para admin y simulate.
- **Alternativa descartada (opción B):** Quitar `saveUserMessage` en la API y dejar solo al Worker. Se descartó por riesgo de duplicados en reintentos (el Worker volvería a llamar a `saveMessage` con el mismo contenido) y por peor consistencia (el mensaje no estaría en DynamoDB hasta que el Worker ejecute).

**Implementación:** Eliminar exactamente la línea que llama a `saveMessage(conversationId, 'user', userMessage)` al inicio de `processResponseProcessor` en `apps/worker/src/processors/conversation.processor.ts`. No se añade ninguna otra lógica.

## Risks / Trade-offs

- [Si la API persiste pero falla antes de encolar] → Caso raro; el mensaje quedaría en DynamoDB sin respuesta del asistente. Mitigación: reintento de enqueue o job de recuperación si se considera crítico en el futuro.
- [El Worker asume que el mensaje ya está en DynamoDB] → Ya es cierto hoy (la API escribe antes de encolar). Se documenta en spec para futuros desarrolladores.

## Migration Plan

- Despliegue: cambio de código solo en el Worker; despliegue estándar (rebuild y reinicio del worker).
- Rollback: revertir el commit que elimina la línea en el Worker; no hay migraciones de datos ni cambios de configuración.

## Open Questions

Ninguna.
