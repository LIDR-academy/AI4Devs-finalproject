# Patrón: Persistencia única del mensaje de usuario (API escribe, Worker lee)

> **Última actualización**: 2026-03-16  
> **Origen**: Change `fix-duplicate-user-messages`  
> **Contexto**: Flujo POST reply → cola `process-response` → Worker (ADR-005, DynamoDB para mensajes)

---

## Problema

Cuando el usuario envía un mensaje vía `POST /api/mock/conversations/:id/reply`, el mismo contenido llega a la API (que encola un job) y al Worker (que procesa el job). Si **ambos** persisten el mensaje en DynamoDB, se generan dos ítems con el mismo contenido y rol `user` pero distinto `messageId`, provocando duplicados en el historial y en reintentos del job.

---

## Regla: un solo escritor por mensaje lógico

**El componente que recibe el mensaje del cliente es el único que lo persiste.** El Worker **no** debe volver a llamar a `saveMessage(conversationId, 'user', userMessage)` para el payload del job.

| Componente | Responsabilidad |
|------------|------------------|
| **API** (`replyToConversation`) | Persistir el mensaje de usuario en DynamoDB (`saveUserMessage`) **antes** de encolar el job `process-response`. |
| **Worker** (`processResponseProcessor`) | **No** persistir el mensaje de usuario del job. Leer el historial con `getMessages(conversationId)` cuando los handlers lo necesiten; el mensaje ya está en DynamoDB. |

---

## Implementación

- **API** (`apps/api/src/mock/mock-conversations.service.ts`): En `replyToConversation`, llamar a `saveUserMessage(conversationId, userMessage)` y después a `addProcessResponseJob(...)`.
- **Worker** (`apps/worker/src/processors/conversation.processor.ts`): En `processResponseProcessor`, **no** incluir `await saveMessage(conversationId, 'user', userMessage)` al inicio. Los handlers (p. ej. `handleWaitingAddress`) usan `getMessages(conversationId)` para construir el historial; el mensaje ya fue escrito por la API.

Excepción: en el flujo **process-conversation** (journey GET_ADDRESS), el Worker sí persiste un mensaje con rol `user` que es un **prompt sintético** para el LLM (`buildGetAddressUserPrompt`), no el mensaje real del usuario. Ese caso no se ve afectado por esta regla.

---

## Beneficios

- **Sin duplicados** en el historial ni en reintentos del job.
- **Visibilidad inmediata**: el mensaje está en DynamoDB en cuanto la API responde, antes de que el Worker ejecute.
- **Idempotencia implícita**: si el job se reintenta, el Worker no escribe de nuevo el mismo mensaje.

---

## Verificación en tests

En los specs del Worker, comprobar que `processResponseProcessor` **no** llama a `saveMessage` con rol `'user'` para el `userMessage` del job:

```typescript
const userCalls = (dynamo.saveMessage as jest.Mock).mock.calls.filter(
  (call: unknown[]) => call[1] === 'user',
);
expect(userCalls).toHaveLength(0);
```
