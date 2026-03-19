## 1. Worker — persistencia única del mensaje de usuario

- [x] 1.1 [backend] Eliminar la llamada `saveMessage(conversationId, 'user', userMessage)` al inicio de `processResponseProcessor` en `apps/worker/src/processors/conversation.processor.ts`, de modo que el mensaje de usuario solo sea persistido por la API en `replyToConversation`.

## 2. QA — verificación

- [x] 2.1 [qa] Comprobar que los tests existentes de `processResponseProcessor` siguen pasando (no deben depender de que el Worker persista el mensaje de usuario; los handlers siguen leyendo historial con `getMessages` donde el mensaje ya está).
- [x] 2.2 [qa] Verificar manualmente o con test de integración que el historial de una conversación no muestra mensajes de usuario duplicados tras enviar un reply y procesar el job.
