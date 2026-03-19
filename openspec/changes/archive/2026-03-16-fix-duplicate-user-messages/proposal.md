## Why

En la página de conversaciones del Dashboard Admin, los mensajes enviados por el usuario aparecen duplicados. La causa es que el mismo mensaje se persiste dos veces en DynamoDB: una por la API al recibir `POST .../reply` y otra por el Worker al procesar el job `process-response`. Cada escritura genera un `messageId` distinto, por lo que el historial devuelve dos ítems para un único mensaje lógico.

## What Changes

- La API sigue siendo la única responsable de persistir el mensaje de usuario en DynamoDB cuando recibe `replyToConversation` (se mantiene `saveUserMessage` en `mock-conversations.service.ts`).
- El Worker deja de persistir el mensaje de usuario al inicio de `processResponseProcessor`: se elimina la llamada a `saveMessage(conversationId, 'user', userMessage)` en `apps/worker/src/processors/conversation.processor.ts`.
- Se documenta en spec que el mensaje de usuario SHALL ser persistido exactamente una vez (por la API) y que el Worker SHALL no volver a persistirlo.

**Rollback:** Revertir el commit que elimina la línea en el Worker; no hay cambios de esquema ni de API.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `mock-conversations`: Clarificar responsabilidad de persistencia del mensaje de usuario: solo la API SHALL persistirlo al recibir el reply; el Worker SHALL no llamar a `saveMessage` con rol `user` para el mensaje recibido en el job `process-response`.

## Impact

- **apps/worker/src/processors/conversation.processor.ts**: Eliminación de una línea en `processResponseProcessor`.
- **openspec/specs/mock-conversations**: Delta spec con requisito nuevo/modificado sobre persistencia única del mensaje de usuario.
- Sin impacto en API, frontend ni DynamoDB schema. El flujo process-conversation (user prompt sintético en GET_ADDRESS) no se modifica.
