# Delta Spec: Mock Conversations — persistencia única del mensaje de usuario

> **Change:** `fix-duplicate-user-messages`  
> **Capability:** mock-conversations

---

## ADDED Requirements

### Requirement: El mensaje de usuario del reply se persiste exactamente una vez (por la API)

Cada mensaje enviado por el usuario vía `POST /api/mock/conversations/:conversationId/reply` SHALL ser persistido en DynamoDB exactamente una vez. La API SHALL ser la única responsable de esa persistencia: al recibir el reply, el servicio SHALL llamar a `saveUserMessage` (o equivalente) antes de encolar el job `process-response`. El Worker SHALL NOT llamar a `saveMessage(conversationId, 'user', userMessage)` para el mensaje recibido en el payload del job `process-response`, de modo que no se generen duplicados en el historial.

#### Scenario: API persiste el mensaje de usuario al recibir el reply
- **WHEN** un cliente envía `POST /api/mock/conversations/:id/reply` con cuerpo `{ message: "texto del usuario" }`
- **THEN** el servicio de la API persiste un ítem en DynamoDB con `role: 'user'` y el contenido recibido
- **THEN** el servicio encola un job `process-response` con `userMessage` en el payload

#### Scenario: El Worker no persiste de nuevo el mensaje de usuario del job
- **WHEN** el Worker procesa un job `process-response` con `userMessage` en el payload
- **THEN** el Worker NO llama a `saveMessage(conversationId, 'user', userMessage)` al inicio del processor
- **THEN** el Worker puede seguir leyendo el historial con `getMessages(conversationId)` y el mensaje ya está presente (persistido por la API)

#### Scenario: Historial sin duplicados de mensajes de usuario
- **WHEN** un usuario ha enviado un único mensaje en una conversación y el job `process-response` ha sido procesado
- **THEN** `GET /api/admin/conversations/:id/messages` (o el endpoint de historial equivalente) devuelve un único ítem con `role: 'user'` para ese mensaje
- **AND** no aparecen dos ítems con el mismo contenido y rol `user` para la misma interacción
