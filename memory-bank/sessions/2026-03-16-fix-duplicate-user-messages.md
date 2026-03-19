# Sesión 2026-03-16 — fix-duplicate-user-messages

> **Estado**: ✅ Completado (3/3 tareas, verificado, listo para archivar)  
> **Change**: `openspec/changes/fix-duplicate-user-messages/`  
> **Patrón documentado**: [conversation-message-single-writer.md](../patterns/conversation-message-single-writer.md)

---

## Contexto

En la página de conversaciones del Dashboard Admin, los mensajes enviados por el usuario aparecían duplicados. La causa era doble persistencia en DynamoDB: la API guardaba el mensaje en `replyToConversation` (saveUserMessage) y el Worker volvía a guardarlo al inicio de `processResponseProcessor` (saveMessage con rol 'user'). Cada escritura generaba un `messageId` distinto, por lo que el historial devolvía dos ítems para un único mensaje lógico.

---

## Qué se implementó

- **Worker** (`apps/worker/src/processors/conversation.processor.ts`): Eliminada la línea `await saveMessage(conversationId, 'user', userMessage)` al inicio de `processResponseProcessor`. El mensaje de usuario solo se persiste en la API al recibir el POST reply.
- **API**: Sin cambios; sigue llamando a `saveUserMessage` antes de encolar el job (comportamiento correcto).
- **Tests**: Nuevo describe en `conversation.processor.spec.ts` — "processResponseProcessor — persistencia única del mensaje de usuario" con test que asegura que no se llama a `saveMessage` con rol `'user'` al procesar un job. Los 17 tests del processor pasan.

---

## Aprendizaje registrado

- **Un solo escritor por mensaje lógico**: En flujos API → cola → Worker, quien recibe el evento del cliente (API) debe ser el único que lo persiste; el Worker solo lee el historial con `getMessages`. Evita duplicados y problemas en reintentos. Documentado en `patterns/conversation-message-single-writer.md`.
- **No ADR**: Es una regla de responsabilidad dentro del flujo ya definido en ADR-005 y ADR-002; no se creó nueva decisión arquitectural.
